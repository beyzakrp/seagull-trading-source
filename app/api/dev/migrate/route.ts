// Local-dev convenience only: applies pending drizzle/*.sql migrations
// against the Miniflare-emulated D1 database using the exact `env.DB`
// binding this app already uses. `drizzle-orm/d1/migrator`'s migrate()
// assumes real filesystem access to read migration files at runtime, which
// doesn't exist in the Workers runtime (workerd has no filesystem) — so
// instead the SQL is inlined at build time via Vite's `?raw` import and
// executed directly through the D1 binding. A tiny `_dev_migrations_applied`
// bookkeeping table (dev-only, not part of the real schema) tracks which
// files already ran, so this is safe to hit again after adding a new
// migration — it won't re-run ones already applied.
// `import.meta.env.DEV` is false in a production build, so this route is a
// no-op there. Production migrations are applied by the Sites deploy
// pipeline — see CLAUDE.md, Tech Stack → Production database.
const migrationModules = import.meta.glob("../../../../drizzle/*.sql", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

export async function GET() {
  if (!import.meta.env.DEV) {
    return new Response("Not found", { status: 404 });
  }
  const { env } = await import("cloudflare:workers");
  if (!env.DB) {
    return Response.json({ error: "D1 binding `DB` is unavailable." }, { status: 500 });
  }

  const migrationFiles = Object.keys(migrationModules).sort();
  if (migrationFiles.length === 0) {
    return Response.json({ error: "No migration files found under drizzle/." }, { status: 500 });
  }

  try {
    await env.DB.prepare(
      "CREATE TABLE IF NOT EXISTS _dev_migrations_applied (file TEXT PRIMARY KEY)",
    ).run();

    const appliedRows = await env.DB.prepare("SELECT file FROM _dev_migrations_applied").all();
    const applied = new Set((appliedRows.results as { file: string }[]).map((row) => row.file));

    let statementsRun = 0;
    const ranFiles: string[] = [];
    for (const file of migrationFiles) {
      if (applied.has(file)) continue;

      const statements = migrationModules[file]
        .split("--> statement-breakpoint")
        .map((statement) => statement.trim())
        .filter(Boolean);

      for (const statement of statements) {
        try {
          await env.DB.prepare(statement).run();
          statementsRun++;
        } catch (statementError) {
          // Dev-only escape hatch: this file's tables/columns may already
          // exist because they were applied before this bookkeeping table
          // started tracking anything. Treat "already exists" as success
          // rather than aborting the whole request.
          const message = statementError instanceof Error ? statementError.message : String(statementError);
          if (!message.includes("already exists")) throw statementError;
        }
      }
      await env.DB.prepare("INSERT INTO _dev_migrations_applied (file) VALUES (?)").bind(file).run();
      ranFiles.push(file);
    }

    return Response.json({ ok: true, ranFiles, statementsRun, alreadyApplied: [...applied] });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return Response.json({ error: message }, { status: 500 });
  }
}
