# CardLink KB

External-facing knowledge base for CardLink: employees (portal users), client admins, and MSP/reseller admins. Plain HTML/CSS/JS, served by a Cloudflare Worker with static assets.

**Live at [kb.crdlnk.io](https://kb.crdlnk.io)** (Workers Custom Domain, attached 2026-10-05; also reachable at `cardlink-kb.jalyahs.workers.dev`). Public, no access control — that's intentional for this site.

Never put internal infrastructure here: Worker secret names, Azure app/client IDs, D1/KV identifiers, repo names, admin sign-in tier design, rate-limit values, audit-log schema. That belongs in `cardlink-kb-internal` instead.

See the CardLink v3 project's `CLAUDE.md` (§0, §0a) for the cross-session roster and the starting brief this KB draws content from.

## Local dev

```
wrangler dev
```

## Deploy

Every page's footer carries a "Last updated" date, derived from git (today's date for a file you're about to commit, otherwise its last real commit date — see `scripts/stamp-dates.mjs`). Run the stamp script **before** committing, so the stamp lands in the same commit as the content change:

```
node scripts/stamp-dates.mjs
git add -A && git commit -m "..."
wrangler deploy
```
