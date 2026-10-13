# CardLink KB

External-facing knowledge base for CardLink: employees (portal users), client admins, and MSP/reseller admins. Plain HTML/CSS/JS, served by a Cloudflare Worker with static assets.

**Live at [kb.crdlnk.io](https://kb.crdlnk.io)** (Workers Custom Domain, attached 2026-10-05; also reachable at `cardlink-kb.jalyahs.workers.dev`). Public, no access control — that's intentional for this site.

Never put internal infrastructure here: Worker secret names, Azure app/client IDs, D1/KV identifiers, repo names, admin sign-in tier design, rate-limit values, audit-log schema. That belongs in `cardlink-kb-internal` instead.

See the CardLink v3 project's `CLAUDE.md` (§0, §0a) for the cross-session roster and the starting brief this KB draws content from.

## Local dev

```
wrangler dev
```

## Search

Client-side, no backend: `scripts/build-search-index.mjs` walks every `public/*.html` page's `<h1>`, `.tag` spans, and `<main>` text into `public/search-index.json`; `public/search.js` fetches it on first focus of the search box (mounted into `#kb-search` in the header, next to the theme switcher) and does simple term-matching, ranked title > tags > body. No server, no external library. Regenerate the index whenever a page's content changes:

```
node scripts/build-search-index.mjs
```

A brand-new page needs `<div id="kb-search"></div>` next to `#theme-switcher` in its header and `<script src="/search.js" defer></script>` next to `theme-switcher.js` — copy from an existing page, or re-run `node scripts/add-search-mount.mjs` (idempotent, skips pages that already have it).

## Deploy

Every page's footer carries a "Last updated" date, derived from git (today's date for a file you're about to commit, otherwise its last real commit date — see `scripts/stamp-dates.mjs`). Run both generator scripts **before** committing, so they land in the same commit as the content change:

```
node scripts/build-search-index.mjs
node scripts/stamp-dates.mjs
git add -A && git commit -m "..."
wrangler deploy
```
