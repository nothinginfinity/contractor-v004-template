# Multi-Agent Handoff Prompt — contractor-v004-template
**Last updated:** 2026-06-07 | **Status:** ✅ Live and deployed

---

## COPY THIS ENTIRE BLOCK AND PASTE TO ANY LLM WITH GITHUB/CLOUDFLARE ACCESS

---

```
You are a build agent working on Jared's Cloudflare Workers contractor site platform.
Read this entire prompt before taking any action.

---

## WHAT THIS PLATFORM IS

A full-stack contractor/service-business demo site that runs entirely on a single
Cloudflare Worker (~113KB JS file). No Node server, no separate frontend build.
One JS file = entire backend + frontend. Built as a reusable template system.

The platform is now proven and in active use. We have successfully:
- Built and deployed the original: contractor-v003-2-afo (live, production)
- Cloned it into a clean template repo: contractor-v004-template (live, deployed ✅)
- Established a working fork/clone protocol for spinning up new site instances

We are now in Phase 2: making customizations, upgrades, and industry-specific
variants using this template as the base.

---

## LIVE REPOS

| Repo | Purpose | Status |
|---|---|---|
| nothinginfinity/repo-copilot | Original source, full history | Production |
| nothinginfinity/contractor-v004-template | Clean template for new forks | Live ✅ |

## LIVE URLS

- Original: https://contractor-v003-2-afo.jaredtechfit.workers.dev
- Template: https://contractor-v004-template.jaredtechfit.workers.dev
- Admin (both): /admin — password: demo

---

## HOW TO CLONE/FORK A NEW SITE (THE PROVEN PROTOCOL)

This is the exact workflow we used to create contractor-v004-template. Use it
for every new site instance.

### Step 1 — Create a new GitHub repo (Alice / GitHub MCP)
- Create repo under nothinginfinity/ with a descriptive slug (e.g. contractor-v005-roofing)
- Public or private depending on customer stage
- Auto-init with README

### Step 2 — Copy worker files from template repo
Copy these files from nothinginfinity/contractor-v004-template, adjusting paths:
  workers/contractor-v004/wrangler.toml     → workers/{new-slug}/wrangler.toml
  workers/contractor-v004/{worker}.js       → workers/{new-slug}/{new-slug}.js
  workers/contractor-v004/schema.sql        → workers/{new-slug}/schema.sql
  workers/contractor-v004/seed.sql          → workers/{new-slug}/seed.sql

### Step 3 — Update wrangler.toml
In the new repo's wrangler.toml:
  name = "{new-cloudflare-worker-slug}"
  main = "{new-slug}.js"
  ... keep all 4 bindings (DB, VECTORIZE, R2, AI)

For DEMO sites: keep the shared database IDs (same D1/R2/Vectorize as v003-2).
For PAID CUSTOMER sites: create new isolated resources (see below).

### Step 4 — Add GitHub Action
Copy .github/workflows/deploy-workers.yml from the template repo.
Add a new job entry pointing to workers/{new-slug}/
The action auto-deploys on every push to that path.

### Step 5 — Paste the full worker source
The worker JS file is ~113KB — too large to commit via MCP JSON tools.

MANUAL METHOD (always works):
  1. Open Cloudflare Dashboard → Workers & Pages → contractor-v003-2-afo → Edit Code
  2. Ctrl+A, Ctrl+C (select all, copy)
  3. In GitHub UI: navigate to workers/{new-slug}/{new-slug}.js → edit → paste → commit
  4. The GitHub Action fires automatically and deploys to Cloudflare

AI AGENT METHOD (if bash_tool / wrangler available):
  - Claude with bash_tool can run: wrangler deploy from the worker directory
  - Or fetch source via afo-r2-source-backup-reader-mcp and commit

### Step 6 — Add CLOUDFLARE_API_TOKEN secret
In the new repo: Settings → Secrets and variables → Actions → New repository secret
Name: CLOUDFLARE_API_TOKEN
Value: (get from Cloudflare dashboard or Jared)
This is a one-time manual step per repo — no AI can do this for you.

### Step 7 — Verify deploy
Check the Actions tab in the new repo. If green → site is live.
URL will be: https://{worker-name}.jaredtechfit.workers.dev

---

## DATABASE STRATEGY

### Demo / Development Sites
Share the existing databases from contractor-v003-2-afo. Fast, zero setup,
content is already there. Both sites write to the same DB — fine for demos.

Shared resource IDs (use in wrangler.toml for demo sites):
  D1 database_id:   c0743318-ee23-4d08-9bd7-0d2b3cc36018
  D1 database_name: contractor_v003_2_afo_db
  D1 binding:       V003_2_DB
  R2 bucket:        afo-site-content
  R2 binding:       V003_2_R2
  Vectorize index:  contractor-v003-2-afo-vector
  Vectorize binding: V003_2_VECTORIZE
  AI binding:       AI

### Production / Paid Customer Sites
Each paying customer gets fully isolated resources:

1. NEW D1 DATABASE
   - Create via Cloudflare Dashboard → D1 → Create database
   - Or via afo-d1-admin-mcp (Claude/ChatGPT)
   - Note the new UUID → update wrangler.toml database_id
   - Run schema.sql against it (one statement at a time — D1 limitation)
   - Run seed.sql to initialize site_content

2. NEW R2 BUCKET
   - Create via Cloudflare Dashboard → R2 → Create bucket
   - Update wrangler.toml bucket_name

3. NEW VECTORIZE INDEX
   - 768 dimensions, cosine similarity, model: @cf/baai/bge-base-en-v1.5
   - Create via Vector-lab-mcp or Cloudflare Dashboard
   - Update wrangler.toml index_name

4. CUSTOMER CUSTOMIZATION (after resources are provisioned)
   - Log into /admin with password 'demo'
   - Update Contact section: company name, phone, license number, service area
   - Update Hero: title, subtitle, stats
   - Add Services, Projects, Reviews, Process steps
   - Upload hero image and service images via Media tab
   - Add knowledge seeds for the AI chat
   - Click "Publish Site Live" → snapshot is generated → site goes live with customer content
   - Change admin password from 'demo' to something secure (edit ADMIN_PASS in worker JS)
   - Set up Resend email notifications for leads (planned feature)

---

## INFRASTRUCTURE OVERVIEW

### How the Site Works
- Public homepage served from a PRE-RENDERED HTML SNAPSHOT stored in D1
- Zero DB calls on page load → instant performance
- Admin "Publish Site Live" button re-renders from live D1 data → saves new snapshot
- AI chat uses RAG over Vectorize (articles + knowledge seeds) + estimate flow
- All content (services, projects, reviews, process, contact) stored as JSON in D1 site_content table

### Cloudflare Resources Per Site
| Resource | Purpose |
|---|---|
| Worker | Serves entire site — frontend + backend + API |
| D1 Database | CMS data, CRM (leads/callbacks), articles, media index, knowledge seeds, snapshot |
| R2 Bucket | Uploaded images, audio, PDFs |
| Vectorize Index | Article + knowledge seed embeddings for RAG chat |
| AI Binding | LLaMA 3.1 8B (chat) + BGE embeddings (vectorize) |

### Key Worker Functions
  renderPublicHTML(content, articles)  → renders full homepage HTML from D1
  handlePublish(env)                   → re-renders + saves snapshot to D1
  handleHome(env)                      → serves snapshot (instant page load)
  buildAdmin()                         → full admin panel HTML (password-gated)
  loadContent(env)                     → loads all site_content sections from D1
  getContactConstants(env)             → reads phone/company/license from D1

---

## CRITICAL CODING RULES (NEVER VIOLATE)

1. NO TEMPLATE LITERALS in buildAdmin() or renderPublicHTML()
   All JS inside these functions must use array join or + concatenation.
   Template literals corrupt onclick escaping and break regex silently.
   This is the #1 most important rule.

2. D1 SQL: ONE STATEMENT PER CALL
   D1/SQLite does not support multi-statement batches via MCP.
   Run each CREATE TABLE / INSERT separately.

3. WORKER SIZE LIMIT FOR MCP DEPLOY
   Worker is ~113KB. Any MCP tool that passes script as a JSON string param will fail.
   Always deploy via: wrangler deploy CLI or the GitHub Action.

4. ALWAYS INCLUDE ALL 4 BINDINGS
   Omitting any binding in a deploy call clears it. Always specify:
   V003_2_DB, V003_2_VECTORIZE, V003_2_R2, AI
   (or the customer-specific equivalents)

5. imgSrc(item) HELPER FOR IMAGES
   When rendering images in public HTML, always use imgSrc(item).
   It prefers image_r2_key (served via /media/serve/) over image_url.

6. REGEX IN EMBEDDED JS
   Never write a regex literal inside a string-concatenated JS block.
   Always use: new RegExp(...)

---

## AGENT ROLES

| Agent | Use for |
|---|---|
| Alice (Perplexity + GitHub MCP) | Create repos, commit files, write specs/docs/schemas, update handoffs, organize folder structure |
| Claude (bash_tool + CF MCPs) | D1 SQL queries, wrangler deploy, Vectorize ops, R2 reads, runtime debugging |
| ChatGPT (MCP orchestration) | Multi-tool workflows, resource provisioning, MCP debugging |

Rule: Alice handles GitHub. Claude/ChatGPT handle Cloudflare runtime.
Never ask Alice to deploy a worker — she can only commit the source file.
Never ask Claude/ChatGPT to create GitHub repos — use Alice.

---

## CURRENT PHASE: CUSTOMIZATION + INDUSTRY VARIANTS

The clone/fork protocol is proven. We are now building on top of it:

- contractor-v004-template is the clean base for all new forks
- Next work: customizations, upgrades, and industry-specific variants
- Examples: roofing, plumbing, landscaping, HVAC, home cleaning, pool service
- Each variant = new GitHub repo + new Cloudflare Worker name + shared DB (demo) or new DB (paid)

Upcoming features to add across variants:
  [ ] Resend email notifications for new leads/callbacks
  [ ] Voice recorder widget (in-browser mic → R2 → linked to lead)
  [ ] Per-user admin auth (replace hardcoded 'demo' password)
  [ ] Analytics dashboard (lead source, weekly counts, conversion)
  [ ] Industry-specific service/content presets per variant
  [ ] Custom domain attachment for paid customers

---

## API ROUTES REFERENCE

Public:
  GET  /                          Public homepage (from snapshot)
  GET  /articles                  Articles index
  GET  /articles/{slug}           Individual article
  GET  /media/serve/{r2_key}      Serve file from R2
  POST /chat                      AI chat (RAG + estimate flow)
  POST /leads                     Submit lead form
  POST /callback                  Submit callback request
  GET  /api/status                Worker health + binding status

Admin (password-gated):
  POST /api/publish               Re-render + save site snapshot
  GET/POST /api/content/{section} Get/save CMS section (services/projects/reviews/process/contact)
  GET  /api/admin/leads           List leads (?format=csv for export)
  PATCH /api/admin/leads/{id}     Update lead status
  GET  /api/admin/callbacks       List callbacks
  POST /api/admin/articles/{id}   Save article (use 'new' to create)
  POST /api/knowledge/{id}        Save knowledge seed (auto-embeds to Vectorize)
  POST /api/seed                  Re-embed all articles to Vectorize

---

## BEFORE YOU START WORKING

1. Read the repo you're working in — check START-HERE.md and handoffs/ folder
2. Confirm which site instance you're modifying (v003-2 = original, v004 = template, or a new fork)
3. Confirm whether this is a DEMO (shared DB) or PAID CUSTOMER (needs isolated resources)
4. If making code changes: edit the worker JS file in GitHub, push to main, let the Action deploy
5. If making data changes: use Claude + cloudflare-multipart-mcp to run D1 SQL
6. Never deploy a 113KB+ worker via MCP JSON tool — use wrangler deploy or GitHub Action only

---

End of handoff prompt. You now have full context. Confirm you understand before proceeding.
```

---

## Notes for Jared

- This prompt lives at `handoffs/multi-agent-handoff-v004.md` in `contractor-v004-template`
- Copy the block between the triple backticks and paste to any LLM
- Works for Claude, ChatGPT, Perplexity, Gemini — any agent with GitHub/CF access
- Update the "CURRENT PHASE" section as the project evolves
