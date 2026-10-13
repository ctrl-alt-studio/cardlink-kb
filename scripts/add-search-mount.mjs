// One-time (idempotent) patch: inserts the #kb-search mount div next
// to #theme-switcher in every page's header, and the search.js script
// tag next to theme-switcher.js. Safe to re-run — skips any page that
// already has either marker. A brand-new page should just include both
// by hand instead of running this.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";

const PUBLIC_DIR = "public";
const files = readdirSync(PUBLIC_DIR).filter((f) => f.endsWith(".html"));

let changed = 0;
for (const file of files) {
  const path = `${PUBLIC_DIR}/${file}`;
  const html = readFileSync(path, "utf8");
  let next = html;

  if (!/id="kb-search"/.test(next)) {
    next = next.replace(
      /<div id="theme-switcher"><\/div>/,
      '<div id="kb-search"></div>\n    <div id="theme-switcher"></div>',
    );
  }

  if (!/search\.js/.test(next)) {
    next = next.replace(
      /<script src="\/theme-switcher\.js"><\/script>/,
      '<script src="/theme-switcher.js"></script>\n<script src="/search.js" defer></script>',
    );
  }

  if (next !== html) {
    writeFileSync(path, next);
    changed++;
  }
}

console.log(`Patched ${changed} of ${files.length} pages.`);
