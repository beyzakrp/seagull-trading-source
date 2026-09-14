import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import test from "node:test";

const developmentPreviewMeta =
  /<meta(?=[^>]*\bname=["']codex-preview["'])(?=[^>]*\bcontent=["']development["'])[^>]*>/i;

test("exports marketing pages without backend routes", async () => {
  for (const route of ["", "about/", "services/", "work/", "qr-menu/"]) {
    const html = await readFile(new URL(`../out/${route}index.html`, import.meta.url), "utf8");
    assert.match(html, developmentPreviewMeta);
    assert.match(html, /Seagull/);
    assert.doesNotMatch(html, /href=["']\/(?:admin|portal|api|menu|q)(?:\/|["'])/);
  }
  for (const route of ["admin", "portal", "api", "menu", "q"]) {
    await assert.rejects(access(new URL(`../out/${route}`, import.meta.url)), { code: "ENOENT" });
  }
});
