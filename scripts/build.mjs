#!/usr/bin/env node
/* Bundles src/ into one self-contained page.
 *
 * An Artifact is published as a single HTML file, so every stylesheet and
 * script in src/ is inlined here in the order index.html lists it. The
 * marker syntax is <!--include:path--> relative to src/.
 *
 *   node scripts/build.mjs        → dist/index.html
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, extname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "src");
const OUT = join(ROOT, "dist", "index.html");

const seen = [];

function inline(file) {
  const text = readFileSync(join(SRC, file), "utf8");
  const ext = extname(file);
  seen.push(file);
  if (ext === ".css") {
    /* fonts.css is a stub that stands in for the embedded Ge'ez face. */
    const extra = file === "styles/fonts.css"
      ? readFileSync(join(SRC, "fonts/noto-sans-ethiopic.css"), "utf8")
      : "";
    return `<style>\n/* ${file} */\n${text}${extra}\n</style>`;
  }
  if (ext === ".js") {
    return `<script>\n/* ${file} */\n${text}\n</script>`;
  }
  return text;
}

const html = readFileSync(join(SRC, "index.html"), "utf8")
  .replace(/<!--include:([^>]+?)-->/g, (_, path) => inline(path.trim()));

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, html);

const kb = (Buffer.byteLength(html) / 1024).toFixed(1);
console.log(`dist/index.html  ${kb} KB  (${seen.length} files inlined)`);
for (const f of seen) console.log(`  · ${f}`);
