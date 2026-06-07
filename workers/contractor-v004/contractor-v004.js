// contractor-v004-template — CCS Services Group — v0.5.1 base
// Template forked from contractor-v003-2-afo
// Phase 5: CMS, snapshot publish, articles on homepage, D1-driven contact constants
// All customer-specific content (services, projects, reviews, process, contact) lives in D1.
// To create a new customer instance: update wrangler.toml with new CF resource IDs.

const VERSION = '0.5.1';
const WORKER = 'contractor-v004-template';
const ADMIN_PASS = 'demo';
const R2_PREFIX = 'contractor-v003-2/';
const EMBED_MODEL = '@cf/baai/bge-base-en-v1.5';
const CHAT_MODEL = '@cf/meta/llama-3.1-8b-instruct';

// These defaults are overridden at runtime by the contact section in D1 site_content.
// To customize: update the contact section in admin and click Publish Site Live.
const COMPANY = 'CCS Services Group';
const PHONE = '(818) 624-7212';
const PHONE_URL = 'tel:+18186247212';
const LICENSE = 'CSLB #890991';

// ─────────────────────────────────────────────────────────────────────────────
// FULL SOURCE NOTE
// The complete worker (~113KB) must be deployed via wrangler deploy from CLI
// or the GitHub Action — it exceeds GitHub inline commit limits.
//
// To get the full source:
//   Option A: Copy contractor-v003-2-afo.js from the live Cloudflare Worker
//             (Workers & Pages → contractor-v003-2-afo → Edit Code → copy all)
//   Option B: Ask Claude/ChatGPT to fetch it via afo-r2-source-backup-reader-mcp
//             or cloudflare-multipart-mcp and paste it here.
//
// Once pasted, deploy:
//   cd workers/contractor-v004
//   CLOUDFLARE_API_TOKEN=<token> wrangler deploy
//
// Or push to main and the GitHub Action auto-deploys.
// ─────────────────────────────────────────────────────────────────────────────

// Source of truth for code: this repo.
// Source of truth for data: D1 database (shared with v003-2 until isolated resources are provisioned).
// Deploy pipeline: push to main -> GitHub Action runs wrangler deploy -> live on Cloudflare.
// Note: GitHub Action requires CLOUDFLARE_API_TOKEN secret set in repo Settings → Secrets → Actions.
