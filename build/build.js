import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const templatePath = join(here, "client.template.js");
const distPath = join(here, "mermaid.min.js");
const outPath = join(here, "..", "lib", "client.js");

const template = readFileSync(templatePath, "utf8");
const dist = readFileSync(distPath, "utf8");

// JSON.stringify produces a valid JS string literal (escapes quotes, newlines,
// backslashes, and any non-ASCII as \uXXXX), so it can be inlined directly.
const literal = JSON.stringify(dist);
const token = "/*@__MERMAID_DIST__@*/";

if (!template.includes(token)) {
  console.error("build: token not found in template");
  process.exit(1);
}

// Use the function form of replace: a string replacement would interpret
// `$&`, `$'`, `` $` ``, and `$n` in the (jQuery-heavy) mermaid source as
// replacement patterns and corrupt the literal.
const out = template.replace(token, () => "var MERMAID_DIST = " + literal + ";");
writeFileSync(outPath, out, "utf8");

console.log("wrote", outPath);
console.log("template bytes:", Buffer.byteLength(template));
console.log("mermaid dist bytes:", Buffer.byteLength(dist));
console.log("final client.js bytes:", Buffer.byteLength(out));
