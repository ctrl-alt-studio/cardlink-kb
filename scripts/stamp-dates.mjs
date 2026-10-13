// Stamps every public/*.html page's footer with a "Last updated" date.
//
// A file with uncommitted changes (about to be committed) gets today's
// date. A clean file gets the date of its last real commit, from git log.
//
// Run this BEFORE `git add`/`git commit`, so the stamp lands in the same
// commit as the content change it's dating — otherwise the date is wrong
// by one commit.
import { execSync } from "node:child_process";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const PUBLIC_DIR = "public";

function sh(cmd) {
  return execSync(cmd, { encoding: "utf8" });
}

const statusOut = sh(`git status --porcelain -- ${PUBLIC_DIR}`);
const dirty = new Set(
  statusOut
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => l.slice(3).trim()),
);

const today = new Date().toISOString().slice(0, 10);
const files = readdirSync(PUBLIC_DIR).filter((f) => f.endsWith(".html"));

const stampRe = /<div class="updated">Last updated: [\d-]+<\/div>\s*/;

let changed = 0;
for (const file of files) {
  const relPath = path.posix.join(PUBLIC_DIR, file);

  let date = today;
  if (!dirty.has(relPath)) {
    try {
      const out = sh(
        `git log -1 --format=%cd --date=short -- "${relPath}"`,
      ).trim();
      if (out) date = out;
    } catch {
      // no history for this file yet — fall back to today
    }
  }

  const html = readFileSync(relPath, "utf8");
  const stampHtml = `  <div class="updated">Last updated: ${date}</div>\n`;

  const next = stampRe.test(html)
    ? html.replace(stampRe, stampHtml)
    : html.replace(/<\/footer>/, `${stampHtml}</footer>`);

  if (next !== html) {
    writeFileSync(relPath, next);
    changed++;
  }
}

console.log(`Stamped ${files.length} pages (${changed} changed).`);
