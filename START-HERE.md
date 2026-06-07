# contractor-v004-template — Handoff Document
**Last updated:** 2026-06-07 | **Base version:** v0.5.1 | **Status:** Template scaffold

---

## What This Is

A template fork of `contractor-v003-2-afo` — a full-stack contractor demo site running entirely on Cloudflare Workers. No Node server, no separate frontend build step. One JS file is the entire backend + frontend.

This repo (`contractor-v004-template`) is the clean starting point for spinning up new contractor/service-business customer sites.

**Source repo (v003-2):** https://github.com/nothinginfinity/repo-copilot  
**Live reference site:** https://contractor-v003-2-afo.jaredtechfit.workers.dev  
**Admin (reference):** https://contractor-v003-2-afo.jaredtechfit.workers.dev/admin (pw: `demo`)

---

## Current State

### Shared Databases (temporary)
This template currently points to the **same D1/R2/Vectorize resources** as `contractor-v003-2-afo`. This is fine for development and testing. For a production customer fork, provision isolated resources (see below).

| Resource | Shared from v003-2 |
|---|---|
| D1 Database | `c0743318-ee23-4d08-9bd7-0d2b3cc36018` |
| R2 Bucket | `afo-site-content` |
| Vectorize Index | `contractor-v003-2-afo-vector` |

### Full Worker Source — ACTION REQUIRED
The `contractor-v004.js` file is currently a **stub**. The full ~113KB worker source must be pasted in before deploy.

**How to get it:**
1. Open Cloudflare Dashboard → Workers & Pages → `contractor-v003-2-afo` → Edit Code
2. Select all, copy
3. Paste into `workers/contractor-v004/contractor-v004.js` in this repo
4. Update the `WORKER` constant at the top: `const WORKER = 'contractor-v004-template';`
5. Push to main → GitHub Action auto-deploys

**Or** ask Claude/ChatGPT to fetch it via `afo-r2-source-backup-reader-mcp` and commit it here.

---

## Infrastructure

| Resource | Value |
|---|---|
| GitHub Repo | `nothinginfinity/contractor-v004-template` (branch: `main`) |
| Cloudflare Worker (target) | `contractor-v004-template` |
| Target URL (after deploy) | `https://contractor-v004-template.jaredtechfit.workers.dev` |
| Worker Source | `workers/contractor-v004/contractor-v004.js` |
| Wrangler Config | `workers/contractor-v004/wrangler.toml` |
| D1 Binding | `V003_2_DB` (shared, see above) |
| R2 Binding | `V003_2_R2` (shared) |
| Vectorize Binding | `V003_2_VECTORIZE` (shared) |
| AI Binding | `AI` |

---

## Deploy Pipeline

**GitHub → Cloudflare is automatic.** Push any change to `workers/contractor-v004/` on `main` and the GitHub Action runs `wrangler deploy`.

**Required:** Set `CLOUDFLARE_API_TOKEN` in repo Settings → Secrets → Actions. (One-time manual step.)

**Manual deploy (fallback):**
```bash
cd workers/contractor-v004
CLOUDFLARE_API_TOKEN=<token> wrangler deploy
```

**Worker size warning:** ~113KB. MCP tools that pass script content as JSON string params will fail. Always use `wrangler deploy` via CLI or GitHub Action.

---

## Upgrading to Isolated Resources

When this template is used for a real customer, swap these in `wrangler.toml`:

1. **Create in Cloudflare Dashboard (or via `afo-d1-admin-mcp` / Claude):**
   - New D1 database → note UUID
   - New R2 bucket
   - New Vectorize index (768 dims, cosine, model `@cf/baai/bge-base-en-v1.5`)

2. **Update `wrangler.toml`** with new resource IDs

3. **Update binding names** in `wrangler.toml` and `contractor-v004.js` if desired (e.g. `V004_DB`)

4. **Run schema setup** — execute each statement in `schema.sql` against the new D1 DB

5. **Run seed** — execute `seed.sql` statements, then log into `/admin` to customize

6. **Click Publish Site Live** in admin to generate the first snapshot

---

## Critical Coding Rules

See `contractor-v003-2-afo` handoff for full details. Summary:

1. **No template literals** in `buildAdmin()` or `renderPublicHTML()` — use array join or `+` concat
2. **One D1 SQL statement per call**
3. **Always include all 4 bindings** when deploying
4. **`imgSrc(item)` helper** for all image rendering
5. **Regex → `new RegExp(...)`** inside string-concatenated JS blocks

---

## What Is and Isn't Done

### Done (inherited from v003-2)
- Full public site — hero, services, projects, process, reviews, articles, contact form, AI chat, CRM
- Admin CMS, media library, knowledge base, snapshot publish system
- GitHub → Cloudflare auto-deploy pipeline

### Not Yet Done (v004 additions planned)
- [ ] Full worker source pasted in and deployed
- [ ] `CLOUDFLARE_API_TOKEN` secret set in this repo
- [ ] Isolated D1/R2/Vectorize resources (when ready for production)
- [ ] Email notifications via Resend
- [ ] Voice recorder widget
- [ ] Per-user admin auth
- [ ] Analytics dashboard

---

## Role Guide

| Agent | Handles |
|---|---|
| **Alice (this repo)** | GitHub file edits, specs, docs, commits, schema, handoffs |
| **Claude** | Cloudflare D1 queries, Vectorize ops, wrangler deploy via bash_tool |
| **ChatGPT** | MCP orchestration, runtime debugging, resource provisioning |
