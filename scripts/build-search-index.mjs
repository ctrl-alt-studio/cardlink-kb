// Builds public/search-index.json from every public/*.html page's
// <h1>, .tag spans, and <main> text. Run before each commit/deploy
// whenever page content changes (see scripts/stamp-dates.mjs for the
// companion date-stamp step — run this one first since it doesn't
// touch files git tracks for diffing, just regenerates the index).
import { readdirSync, readFileSync, writeFileSync } from "node:fs";

const PUBLIC_DIR = "public";

function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#123;/g, "{")
    .replace(/&#125;/g, "}")
    .replace(/\s+/g, " ")
    .trim();
}

function extractAll(re, html) {
  const out = [];
  let m;
  while ((m = re.exec(html))) out.push(m[1]);
  return out;
}

const files = readdirSync(PUBLIC_DIR).filter((f) => f.endsWith(".html"));
const entries = [];

for (const file of files) {
  const html = readFileSync(`${PUBLIC_DIR}/${file}`, "utf8");

  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
  const title = stripTags(h1Match ? h1Match[1] : titleMatch ? titleMatch[1] : file);

  const tags = extractAll(/<span class="tag">([^<]*)<\/span>/g, html);

  const mainMatch = html.match(/<main>([\s\S]*?)<\/main>/i);
  const text = mainMatch ? stripTags(mainMatch[1]).slice(0, 4000) : "";

  const urlPath = file === "index.html" ? "/" : "/" + file;

  entries.push({ path: urlPath, title, tags, text });
}

writeFileSync(`${PUBLIC_DIR}/search-index.json`, JSON.stringify(entries));
console.log(`Built search index: ${entries.length} pages.`);
