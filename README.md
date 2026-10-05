# CardLink KB

External-facing knowledge base for CardLink: employees (portal users), client admins, and MSP/reseller admins. Plain HTML/CSS/JS, served by a Cloudflare Worker with static assets.

Never put internal infrastructure here: Worker secret names, Azure app/client IDs, D1/KV identifiers, repo names, admin sign-in tier design, rate-limit values, audit-log schema. That belongs in `cardlink-kb-internal` instead.

See the CardLink v3 project's `CLAUDE.md` (§0, §0a) for the cross-session roster and the starting brief this KB draws content from.

## Local dev

```
wrangler dev
```

## Deploy

```
wrangler deploy
```
