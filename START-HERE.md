# contractor-v004-template — Handoff Document
**Last updated:** 2026-06-07 | **Base version:** v0.5.1 | **Status:** ✅ Live & Deployed

---

## What This Is

A clean template fork of `contractor-v003-2-afo` — a full-stack contractor demo site running entirely on Cloudflare Workers. No Node server, no separate frontend build step. One JS file (~113KB) is the entire backend + frontend.

This repo is the **proven base template** for spinning up new contractor/service-business sites across any industry.

**Live URL:** https://contractor-v004-template.jaredtechfit.workers.dev  
**Admin:** https://contractor-v004-template.jaredtechfit.workers.dev/admin (pw: `demo`)  
**Source repo (v003-2):** https://github.com/nothinginfinity/repo-copilot  
**Full handoff/clone protocol:** `handoffs/multi-agent-handoff-v004.md`

---

## Infrastructure

| Resource | Value |
|---|---|
| Cloudflare Worker | `contractor-v004-template` |
| Account ID | `280908cb4e54b81745740accf5f0500f` |
| D1 Database | Shared with v003-2: `c0743318-ee23-4d08-9bd7-0d2b3cc36018` |
| R2 Bucket | Shared: `afo-site-content` |
| Vectorize Index | Shared: `contractor-v003-2-afo-vector` |
| AI Binding | `AI` |
| GitHub Repo | `nothinginfinity/contractor-v004-template` (branch: `main`) |
| Worker Source | `workers/contractor-v004/contractor-v003-2-afo.js` |
| Wrangler Config | `workers/contractor-v004/wrangler.toml` |

---

## Deploy Pipeline

**GitHub → Cloudflare is automatic.** Push any change to `workers/contractor-v004/` on `main` and the GitHub Action (`.github/workflows/deploy-workers.yml`) runs `wrangler deploy` automatically.

**Required secret:** `CLOUDFLARE_API_TOKEN` in repo Settings → Secrets → Actions. ✅ Already set.

**Worker size:** ~113KB. Do NOT deploy via MCP JSON tools — they fail at this size. Always use `wrangler deploy` CLI or the GitHub Action.

---

## Database Strategy

### Demo Sites → Shared Databases
All demo/template sites share the v003-2 D1/R2/Vectorize resources. Content changes in one site are visible in all. Fine for development and sales demos.

### Paid Customer Sites → Isolated Resources
When a customer buys a site:
1. Create new D1 database, R2 bucket, Vectorize index in Cloudflare
2. Update `wrangler.toml` with new resource IDs
3. Run `schema.sql` against the new D1 (one statement at a time)
4. Customize all content via `/admin`
5. Attach custom domain
6. Set up Resend email for lead notifications
7. Change `ADMIN_PASS` from `demo` to a secure password

---

## Clone Protocol (How to Spin Up a New Site)

See full step-by-step in `handoffs/multi-agent-handoff-v004.md`. Summary:

1. Create new GitHub repo under `nothinginfinity/`
2. Copy `workers/contractor-v004/` files into `workers/{new-slug}/`
3. Update `wrangler.toml`: new `name` + `main` + resource IDs
4. Add job to `.github/workflows/deploy-workers.yml` for new path
5. Paste full worker source manually from Cloudflare Dashboard (Ctrl+A → copy → paste into GitHub editor → commit)
6. Add `CLOUDFLARE_API_TOKEN` secret to new repo
7. GitHub Action auto-deploys → site is live

---

## Critical Coding Rules

1. **No template literals** in `buildAdmin()` or `renderPublicHTML()` — use array join or `+` concat
2. **One D1 SQL statement per call** — D1 doesn't support multi-statement batches
3. **Always include all 4 bindings** when deploying: DB, VECTORIZE, R2, AI
4. **`imgSrc(item)` helper** for all image rendering in public HTML
5. **Regex → `new RegExp(...)`** inside string-concatenated JS blocks

---

## What's Done / What's Next

### Done ✅
- Full public site (hero, services, projects, reviews, process, articles, AI chat, CRM, admin)
- Site snapshot publish system — pre-rendered HTML, instant page loads
- GitHub → Cloudflare auto-deploy pipeline
- Clone/fork protocol proven and documented

### Planned for v004+ Variants
- [ ] Resend email notifications for new leads/callbacks
- [ ] Voice recorder widget (mic → R2 → linked to lead)
- [ ] Per-user admin auth (replace hardcoded password)
- [ ] Analytics dashboard (lead source, counts, conversion)
- [ ] Industry-specific content presets (roofing, plumbing, HVAC, etc.)
- [ ] Custom domain support for paid customers

---

## Agent Roles

| Agent | Handles |
|---|---|
| **Alice** (Perplexity + GitHub MCP) | Repo creation, file commits, specs, schemas, docs, handoffs |
| **Claude** | D1 SQL, Vectorize ops, wrangler deploy via bash_tool, CF MCP tools |
| **ChatGPT** | MCP orchestration, resource provisioning, runtime debugging |
