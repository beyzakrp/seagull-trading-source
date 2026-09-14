import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

// `cloudflare:workers` is dynamically imported (not a top-level import) so
// that merely loading this module — e.g. plain Node's `import()`, as
// scripts/validate-artifact.sh does when sanity-checking the built worker —
// doesn't try to resolve a `cloudflare:` scheme URL outside the Workers
// runtime. The dynamic import only actually runs once getDb() is called.
export async function getDb() {
  const { env } = await import("cloudflare:workers");
  if (!env.DB) {
    throw new Error(
      "Cloudflare D1 binding `DB` is unavailable. Set the `d1` field in .openai/hosting.json to `DB` or let your control plane inject the real binding values before using the database."
    );
  }

  return drizzle(env.DB, { schema });
}
