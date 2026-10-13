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
// Porcelain lines are "XY path" — a fixed 3-char status prefix, then the
// path. Don't trim the line before slicing it off: a common " M path"
// line has a leading space that's PART of the 3-char prefix, and
// trimming it first shifts slice(3) one character into the path.
const dirty = new Set(
  statusOut
    .split("\n")
    .filter((l) => l.length > 3)
    .map((l) => l.slice(3).trim()),
);

// Local calendar date, matching `git log --date=short`'s default (the
// committer's local timezone) — not toISOString(), which is UTC and can
// disagree with git across a timezone's midnight.
const now = new Date();
const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
const files = readdirSync(PUBLIC_DIR).filter((f) => f.endsWith(".html"));

// Matches the div AND any whitespace before it, so a re-run always
// normalizes to one canonical leading newline + indent instead of
// accumulating extra whitespace each time.
const stampRe = /\s*<div class="updated">Last updated: [\d-]+<\/div>/;

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
  const stampHtml = `\n  <div class="updated">Last updated: ${date}</div>`;

  const next = stampRe.test(html)
    ? html.replace(stampRe, stampHtml)
    : html.replace(/<\/footer>/, `${stampHtml}\n</footer>`);

  if (next !== html) {
    writeFileSync(relPath, next);
    changed++;
  }
}

console.log(`Stamped ${files.length} pages (${changed} changed).`);
