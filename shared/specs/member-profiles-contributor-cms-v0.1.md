# Member Profiles & Contributor CMS — Spec v0.1
**Repo:** `nothinginfinity/contractor-v004-template`  
**Last updated:** 2026-06-07  
**Status:** Ready for implementation  
**Assigned to:** Claude (worker JS edits + D1 schema) via Claude Code or bash_tool

---

## Overview

Add a lightweight **contributor CMS** to the existing Cloudflare Worker so that a business owner can invite employees (members) to a private portal where they can:

- Upload photos/files directly to R2
- Write and submit articles/posts for approval
- Add captions, project tags, and notes
- Track the status of their own submissions

The business owner (admin) reviews submissions from a new tab in the existing `/admin` panel, then approves them — which moves content directly into the live site (articles table or media library).

This turns the website into a **team content engine** — field crews can submit job photos, office staff can draft blog posts, all funneling through admin approval before going live. Also produces a content pipeline for social media reuse.

---

## User Roles

| Role | Access | Auth |
|---|---|---|
| **Owner / Admin** | Full `/admin` panel + new Member Manager + Submission Queue tabs | Existing `ADMIN_PASS` |
| **Member / Contributor** | `/contribute` portal — upload + submit only | Unique invite token (no email/password needed v0.1) |

**v0.1 auth strategy:** Simple invite tokens. Admin creates a member, gets a short token URL (`/contribute?token=abc123`). Member bookmarks it. No email/password. Upgrade to proper auth in v0.2 if needed.

---

## D1 Schema Additions

Add two new tables. Run each statement separately (D1 one-statement-at-a-time rule).

```sql
CREATE TABLE IF NOT EXISTS members (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'contributor',
  token TEXT UNIQUE NOT NULL,
  active INTEGER DEFAULT 1,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY,
  member_id TEXT NOT NULL,
  member_name TEXT,
  type TEXT NOT NULL,
  title TEXT,
  body TEXT,
  summary TEXT,
  caption TEXT,
  project_tag TEXT,
  r2_key TEXT,
  filename TEXT,
  content_type TEXT,
  status TEXT DEFAULT 'pending',
  admin_note TEXT,
  reviewed_by TEXT,
  reviewed_at TEXT,
  created_at TEXT
);
```

**`submissions.type` values:** `article`, `photo`, `video`, `note`  
**`submissions.status` values:** `pending`, `approved`, `rejected`, `published`

---

## New API Routes

Add these to the main `fetch()` router in the worker. All `/contribute/*` and `/api/member/*` routes are gated by token (not admin password).

### Contributor (token-gated)

```
GET  /contribute                      Contributor portal HTML (reads ?token= from URL)
GET  /api/member/me?token=xxx         Validate token, return member info
POST /api/member/submit               Submit article or photo (multipart or JSON)
GET  /api/member/submissions?token=   List this member's own submissions
```

### Admin (ADMIN_PASS gated, same as existing routes)

```
GET  /api/admin/members               List all members
POST /api/admin/members               Create new member (returns token URL)
DELETE /api/admin/members/:id         Deactivate member
GET  /api/admin/submissions           List all pending submissions
POST /api/admin/submissions/:id/approve  Approve: moves to articles or media_library
POST /api/admin/submissions/:id/reject   Reject with optional note
```

---

## New Functions to Add to Worker

Follow existing patterns exactly. No template literals. Use `+` concat or array join.

### `handleContributorPortal(request, env)`
- Read `?token=` from URL
- If no token: return simple invite-required page
- If token invalid: return error page
- If valid: return contributor portal HTML (see UI spec below)
- No DB calls on portal render — validate token via `/api/member/me` via JS on the page

### `handleMemberMe(request, env)`
- Read `token` from query string
- `SELECT * FROM members WHERE token=? AND active=1`
- Return `{ ok: true, member: { id, name, role } }` or `{ ok: false, error: 'invalid token' }`

### `handleMemberSubmit(request, env)`
- Read token from `Authorization: Bearer <token>` header OR body field `token`
- Validate token → get member
- If `type === 'photo'` or `type === 'video'`: handle as multipart formData
  - Upload file to R2 at key: `R2_PREFIX + 'contributions/' + uid() + '-' + filename`
  - Insert into `submissions` with r2_key, filename, content_type
- If `type === 'article'` or `type === 'note'`: handle as JSON body
  - Insert into `submissions` with title, body, summary
- Return `{ ok: true, submission_id, status: 'pending', message: 'Submitted! Admin will review soon.' }`

### `handleMemberSubmissions(request, env)`
- Read + validate token
- `SELECT id,type,title,caption,status,admin_note,created_at FROM submissions WHERE member_id=? ORDER BY created_at DESC LIMIT 50`
- Return list — member can see status of their own submissions

### `handleAdminMembers(request, env)`
- GET: list all members
- POST: create new member
  - Generate `id = uid()`, `token = uid() + uid()` (longer, harder to guess)
  - Insert into `members`
  - Return member + `portal_url: '/contribute?token=' + token`
- DELETE: set `active=0` for member id

### `handleAdminSubmissions(request, env)`
- GET: `SELECT * FROM submissions WHERE status='pending' ORDER BY created_at DESC LIMIT 100`
- Also accept `?status=all` to show all

### `handleAdminSubmissionApprove(request, env, id)`
- Fetch submission by id
- If `type === 'article'`:
  - Insert into `articles` table (slug, title, summary, body, published=0, hero_image_r2_key, created_at)
  - Published=0 by default — admin can then publish from the Articles tab
- If `type === 'photo'` or `type === 'video'`:
  - Insert into `media_library` (r2_key, filename, content_type, alt_text=caption, category='project', uploaded_at)
- Update submission: `status='published', reviewed_at=now(), reviewed_by='admin'`
- Return `{ ok: true, message: 'Approved and moved to [articles/media]' }`

### `handleAdminSubmissionReject(request, env, id)`
- Update submission: `status='rejected', admin_note=body.note, reviewed_at=now()`
- Return `{ ok: true }`

---

## Admin Panel Additions (buildAdmin())

Add two new tabs to the TABS array (after 'media'):

```javascript
['members', 'Members'],
['submissions', 'Submissions'],
```

### Members Tab UI

- List of all members (name, role, active status, token URL, created date)
- "+ Add Member" button → inline form: name, role (contributor/editor)
  - On save: POST to `/api/admin/members`, show portal URL for copying
  - Copy button next to portal URL
- Deactivate button per member
- Note: "Share the portal URL with your team. They bookmark it and use it to submit content."

### Submissions Tab UI

- Filter tabs: Pending | All
- List of submissions with:
  - Member name, submission type badge (photo / article / note)
  - Title or filename
  - Preview: if photo → thumbnail from R2, if article → title + summary snippet
  - Submitted date
  - Status badge
  - Action buttons: **Approve** (green) | **Reject** (red)
  - Reject opens a small inline note field
- After approve: submission moves out of pending, success toast
- Approved photos appear in Media Library, approved articles appear in Article Manager (as drafts)

---

## Contributor Portal UI (`/contribute`)

Standalone page served at `/contribute?token=xxx`. Simple, mobile-friendly.
Use the same CSS vars as the main site but stripped down — no nav, no hero.

### Layout
```
┌─────────────────────────────────────┐
│  [Company Logo] Welcome, [Name]!    │
│  "Submit content for the website"   │
├─────────────────────────────────────┤
│  [📷 Upload Photos/Video]           │
│  [📝 Submit an Article]             │
│  [💬 Add a Note]                    │
├─────────────────────────────────────┤
│  MY RECENT SUBMISSIONS              │
│  [ list of own submissions ]        │
└─────────────────────────────────────┘
```

### Upload Photos/Video flow
1. Tap → file picker opens (image/*, video/*)
2. User adds caption and project tag (text inputs)
3. Submit button → POST to `/api/member/submit` as multipart
4. Success: "Submitted! Admin will review."
5. Appears in My Recent Submissions list

### Submit Article flow
1. Tap → expand form with: Title, Summary (short), Body (textarea)
2. Submit → POST as JSON to `/api/member/submit`
3. Success message

### My Recent Submissions
- Fetch from `/api/member/submissions?token=xxx`
- Show: type icon + title/filename + status badge + date
- Status badges: Pending (yellow) | Approved ✓ (green) | Rejected ✗ (red)
- If rejected: show admin_note if present

---

## Critical Coding Rules (must follow)

1. **No template literals** in any function that renders HTML — use `+` concat or array join
2. **D1 one statement at a time** — never batch SQL
3. **Token validation** on every `/api/member/*` route — never trust client-sent member_id alone
4. **R2 key prefix** — use `R2_PREFIX + 'contributions/'` for all submission uploads
5. **File type allowlist** — same as existing upload handler: jpg, jpeg, png, gif, webp, mp4, mov, heic, pdf, mp3, m4a, wav, ogg
6. **Worker size** — adding this feature will push worker toward 130-140KB. Use wrangler deploy, not MCP JSON tools.
7. **No auth framework** — keep it simple. Token in query string for portal page load, token in Authorization Bearer header for API calls.

---

## Implementation Order

1. **D1 migration** — run schema additions against the shared D1 database (Claude + bash_tool or D1 MCP)
2. **Add new handler functions** to worker JS (Claude edits in GitHub or via bash_tool)
3. **Add new routes** to the main `fetch()` router switch
4. **Add Members + Submissions tabs** to `buildAdmin()`
5. **Add `/contribute` handler** and portal HTML
6. **Deploy** via GitHub Action (push to `workers/contractor-v004/`)
7. **Test**:
   - Admin: create a member → copy portal URL
   - Contributor: open portal URL → upload a photo + submit an article
   - Admin: see both in Submissions tab → approve photo → check Media Library → approve article → check Article Manager

---

## Future v0.2 Ideas (out of scope now)

- Email invite via Resend when admin creates a member
- Email notification to admin when new submission arrives
- Member sets own display name / profile photo
- Submission comments / back-and-forth between admin and contributor
- Social media export queue (approved content tagged for social reuse)
- Role: `editor` can approve submissions (not just owner)
- Analytics: submissions per member, approval rate

---

## Handoff Note for Claude

This spec is complete. To implement:

1. Read the current full worker source at `workers/contractor-v004/contractor-v003-2-afo.js`
2. Add the two new D1 tables (run each SQL statement separately against `c0743318-ee23-4d08-9bd7-0d2b3cc36018`)
3. Add all new handler functions to the worker JS — follow existing style exactly (no template literals, `dbRun`/`dbAll`/`dbFirst` helpers, `j()` for JSON responses, `h()` for HTML)
4. Add new routes to the `fetch()` router
5. Add Members and Submissions tabs to `buildAdmin()`
6. Add `handleContributorPortal()` and wire to `/contribute` route
7. Commit the updated JS file to `workers/contractor-v004/contractor-v003-2-afo.js`
8. Push to main — GitHub Action auto-deploys
9. Update `handoffs/multi-agent-handoff-v004.md` with the new routes

**Do not use template literals anywhere in HTML-rendering functions.**  
**Worker will be ~130KB+ — deploy via wrangler deploy or GitHub Action only.**
