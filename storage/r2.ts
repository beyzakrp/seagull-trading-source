// Same lazy-import pattern as db/index.ts, and for the same reason: a
// top-level `import { env } from "cloudflare:workers"` breaks
// scripts/validate-artifact.sh's plain-Node `import()` of the built worker
// (see CLAUDE.md, Coding Rules). Only calling getBucket() requires the real
// Workers runtime — merely loading this module doesn't.
// No explicit R2Bucket return type — this project has no generated Env
// type (no wrangler.toml to generate one from, see CLAUDE.md), so
// db/index.ts's D1 binding is handled the same untyped way.
export async function getBucket() {
  const { env } = await import("cloudflare:workers");
  if (!env.MENU_IMAGES) {
    throw new Error(
      "R2 bucket binding `MENU_IMAGES` is unavailable. Set the `r2` field in .openai/hosting.json to `MENU_IMAGES` or let your control plane inject the real binding values before uploading images."
    );
  }
  return env.MENU_IMAGES;
}
