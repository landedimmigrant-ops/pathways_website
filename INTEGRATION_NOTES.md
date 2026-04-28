# Content Backend — Integration Notes

Running log of attempts to connect a coordinator-friendly database to the site.

## Goal

- Coordinator edits workshops / services / resources in a friendly UI (no code)
- Site fetches content as JSON at runtime (or build time)
- Each record carries a `bookingUrl` pointing to the provider's Microsoft Bookings page
- Zero or near-zero recurring cost

## What we tried

### Attempt 1 — Microsoft Lists + Power Automate HTTP endpoint

Plan: personal MS List for workshops → Power Automate flow with `When an HTTP request is received` trigger + `Get items` + `Response` → site fetches the HTTP URL.

Outcome: **blocked by licensing.**
- HTTP trigger and Response actions require a **Power Automate Premium** license (moved out of free tier by Microsoft in 2023).
- Free 90-day trial exists but isn't a sustainable answer.

### Attempt 2 — Microsoft Lists + Power Automate scheduled flow → OneDrive JSON file

Plan: scheduled flow runs daily → `Get items` → `Create file` on OneDrive → share the JSON file publicly → site fetches the public URL.

Outcome: **blocked by tenant policy.**
- Flow built and ran successfully; `workshops.json` created in `/Apps/pathways/` in OneDrive.
- Sharing options limited to "People in Concordia", "Only people with existing access", and "People you choose" — **no "Anyone with the link"** option.
- Concordia's M365 tenant has disabled anonymous external sharing. A public static site cannot fetch an authenticated OneDrive URL.

## Where we ended up

- MS List `workshops` exists on Prem's personal OneDrive.
- Working Power Automate scheduled flow exists (generates `workshops.json` to OneDrive daily).
- The file is not publicly reachable — dead end for runtime fetch.

### Attempt 3 — Google Sheets + gviz CSV endpoint ✅ WORKING

Plan: import `workshops.csv` into a Google Sheet tab → share "Anyone with the link" → fetch from the site via Google's gviz CSV endpoint → parse client-side.

Outcome: **works.**
- Sheet ID: `1IQGINsUTQMWLm4IJY49dr76pMeWkIH_vj-aLnj9jD1Y`, tab: `workshops`
- Endpoint: `https://docs.google.com/spreadsheets/d/<ID>/gviz/tq?tqx=out:csv&sheet=<TAB>`
- No third-party proxy, no auth, no licensing, no tenant blockers
- Edits in the sheet show up on the site within ~1 min after a hard refresh
- Note: must run the site via `http://` (e.g., `python3 -m http.server`), not `file://` — browsers block cross-origin fetch from `file://`

### Implementation

- `WORKSHOPS_SHEET` config block in `app.js` (enabled flag, sheet ID, tab name)
- `parseCsv()` — minimal RFC4180 parser
- `fetchWorkshopsFromSheet()` — returns the same manifest shape the existing loader expects
- `loadWorkshopContent()` — branches on the flag; falls back to `content/workshops.json` if disabled
- Markdown bodies still load from local `content/workshops/*.md` via the `file` column

### Attempt 5 — Bookings via MS Bookings (Phase 2) ✅ WORKING (new-tab redirect)

Plan: put a per-service Bookings URL in the sheet's `bookingUrl` column; clicking the card's Book button opens it.

Outcome: **works as a new-tab redirect.** Iframe embed was the intended UX but MS Bookings sets `X-Frame-Options: DENY`, which no iframe trick gets around.

- Smoke test used Prem's existing **Bookings with Me** "15 minutes meeting" page (`/bookwithme/user/...?anonymous`). Anonymous booking works — no sign-in required.
- First cut tried iframe-with-fallback; iframe returned blank because X-Frame-Options blocks rendering but still fires the `load` event (so timeout-based detection didn't fire). Removed in favor of direct new-tab open.
- Final UX: click **Book** on a card with `bookingUrl` → `window.open(bookingUrl, "_blank", "noopener")` → MS Bookings opens in new tab → user picks a time → Teams invite mailed.
- Rows without `bookingUrl` keep the prototype Formspree "request" form.
- `BOOKINGS.enabled` flag in `app.js` to kill-switch if needed.

### Attempt 4 — All three content types on the same sheet ✅ WORKING

Plan: add `opportunities` and `external-resources` tabs alongside `workshops`, fetch all three in parallel before first render.

Outcome: **works, edits show up instantly after hard refresh.**
- `WORKSHOPS_SHEET` config replaced by broader `SHEETS` config (same sheet ID, `tabs: { workshops, opportunities, externalResources }`)
- `fetchSheetRows(tab)` shared helper
- `mapOpportunityRow()` rehydrates `details.{who,what,outcomes}` from flat CSV columns, splits `;`-delimited pathway/tags/stage
- `loadExploreContentFromSheets()` mutates `data.explore.opportunities` and `data.explore.externalResources` before `buildPages()` runs — no page-building code had to change
- External resources keep `stage` as an array (matches existing shape); opportunities use single string unless multi-value
- Sheet is authoritative — no silent fallback to local `data.js` (failure logged loudly)

### Attempt 6 — Workshop bodies from published Google Docs ✅ WORKING (smoke-tested in production)

Plan: workshop body content was the last thing still living in local `content/workshops/*.md`. Coordinator can't edit those without git access. Move bodies into Google Docs (one Doc per workshop), use Docs' Publish-to-web feature, store the resulting `/pub` URL in a new `docUrl` sheet column, fetch and render at runtime.

Outcome: **works end-to-end.** First production workshop migrated (Library RDM "Data Management Plan Consultations") rendered cleanly without manual Doc reformatting. Remaining 10 workshops to follow at the coordinator's pace.

#### Sheet-side additions

- New `docUrl` column on the `workshops` tab (e.g. `https://docs.google.com/document/d/e/<long-id>/pub`)
- New `provider` column on all three tabs (e.g. "Office of Research", "Library RDM Team") — rendered as "Offered by …" line on cards and as the first item in the modal meta-bar
- Old `libcalUrl` column removed end-to-end (LibCal subscription was never activated)

#### Code-side helpers (in `app.js`)

- `fetchWorkshopBodyFromDoc(docUrl)` — fetches the published HTML, extracts `#contents`, walks the DOM, rebuilds with allowlisted structural tags (h1–h4, p, ul/ol/li, strong/em/b/i, a, br)
- `sanitizeDocNode` — drops `<style>`/`<script>`/`<head>`/etc. entirely (subtree included), unwraps `google.com/url?q=` redirects, adds `target="_blank"` to external links
- `postProcessDocHtml` — coordinator-friendly cleanup pass:
  1. Merges adjacent `<ul>`/`<ol>` (Google emits one per bullet)
  2. Drops redundant `Title:` / `Tags:` / `Tags#:` lines (already in sheet)
  3. Merges paragraphs Google soft-broke across visual line wraps (continuation = lowercase first letter)
  4. Auto-promotes heading-shaped `<p>` to `<h2>` via known-labels list (*Short Description*, *Outcomes*, *Format*, *Who it's for*, etc.) plus shape heuristic (≤70 chars, no terminal punctuation, ≤6 words, title-cased)
  5. Drops orphan `<h2>` blocks with no body content following them
- `extractDocSummary` — pulls the first body paragraph ≥40 chars as the card preview; falls back to whatever the sheet has if Doc is unreadable
- `loadWorkshopContent` — per-entry: prefer `docUrl` → fall back to `entry.file` (local `.md`) → metadata-only (no body) for tool entries

#### Why this shape

- **Why publish-to-web, not Drive API:** no auth, no API key, no quota. Plain page fetch. Concordia tenant returns proper CORS headers (`access-control-allow-origin` reflects the requesting origin) so it works from a static GitHub Pages site without a proxy.
- **Why we didn't shove markdown into a sheet cell:** long multiline bodies make the sheet UI unreadable and break the per-row mental model.
- **Why we wrote a smart parser instead of asking coordinators to use H2 styles:** training cost > engineering cost. The parser is ~80 lines and handles the messy default output of "write your Doc however feels natural." The alternative was a process doc that says "format every section heading as Heading 2 manually," which is exactly the kind of friction we're trying to eliminate.

## Remaining paths

1. **Migrate the other 10 workshops to Docs** — coordinator-paced, row by row. Each Doc URL goes in `docUrl`; clear `file` once verified. Old `content/workshops/*.md` and `content/workshops.json` can be deleted in a single cleanup PR once every row has a `docUrl`.
2. **Populate the `provider` column** — coordinator adding it now. Use canonical strings (see COORDINATOR_GUIDE "Provider naming conventions") to keep grouping/filtering consistent later.
3. **Delete the dead `libcalUrl` column from all 3 sheet tabs** — code already ignores it; just dead weight in the editor.
4. **Shared Bookings page** — currently using Prem's personal *Bookings with Me* URL. When advisor #2 joins, migrate to a shared mailbox (e.g. `pathways-bookings@concordia`) so URLs survive staff turnover.
5. **In-page booking (no new tab)** — see [BOOKINGS_PLAN.md](BOOKINGS_PLAN.md) "Staying on the page" section. Confirmed not viable with MS Bookings (X-Frame-Options blocks iframe). Options if pain becomes real: switch provider, or build a Graph-API-backed custom UI.
6. **Coordinator UX polish** — sheet is functional but raw. Could add column validation (data validation in Google Sheets) for `format`, `stage`, `pathway` to reduce typos, or a Google Form → sheet for new-row creation. Low priority until coordinator says it hurts.

## Current state

- Sheet is authoritative for all 3 content types. Local `data.js` is fallback only (cleared at runtime).
- 1 of 11 workshops migrated to Doc body. Remaining 10 still serving from local `.md` (no user-visible difference).
- `provider` column being added to all 3 tabs; coordinator populating row by row. Site renders nothing for blank rows (no broken layout). Card shows it as a small "OFFERED BY  *value*" label below the title; modal shows it as the first item in the meta-bar.
- MS Bookings live for one consultation (`opp-impact-framing`); other rows fall through to the Formspree request form.

## Settled questions (was: Open questions)

- ~~Does Office of Research have a Team SharePoint site with external-sharing enabled?~~ Moot — Sheets path won; MS Lists is parked.
- ~~Is Microsoft Bookings the confirmed choice?~~ Yes. LibCal was the alternative; not happening.
- ~~Who owns the database day-to-day?~~ Coordinator (single owner for now).

## Known gaps

### No staging / preview environment

Today the chain is: coordinator saves the sheet (or publishes a Doc) → site picks it up within ~1–5 min → live for everyone. There is no preview, no review gate, no rollback path. Side effects of this:

- A typo in `summary` is publicly visible until someone notices.
- A half-edited row (deleted summary while drafting a new one) renders as an empty card to live users.
- A botched Doc publish (e.g. accidentally unpublishing) takes a workshop body offline until either the local `.md` fallback catches it or someone re-publishes.
- No way for the coordinator to draft a new offering and let a colleague eyeball it before it goes live.

This was an acceptable tradeoff during the prototype but should be addressed before the volume of edits grows. Realistic paths, lightest to heaviest:

1. **`status` column on the existing sheets (recommended).** Add a `status` column (values: `draft`, `published`, `archived`). Production reads only `published`. A `?preview=1` query parameter on the same site reads `published + draft` so the coordinator (or anyone given the preview URL) can see what's about to ship. No second sheet, no second deployment. ~1 hour of code. Coordinator workflow: edit at `draft` → preview → flip to `published` when ready.

2. **Two sheets, two deployments.** A separate "staging" sheet feeds a separate staging Pages deployment (e.g. `pathways_website-staging` repo, or a `staging` branch with a different build target). Coordinator edits in staging, copies rows to production sheet on a cadence. Heavier mental model; risk of drift; closer to "real" staging.

3. **PR-based gating for content (overkill).** Treat sheet rows as code. Pull from sheet → commit to repo → review → merge → deploy. Fully audited but throws away the whole point of the no-code editor.

#3 is mentioned only to be ruled out. #1 is the next move when staging becomes a real need; #2 is the fallback if #1's per-row toggle proves confusing.

### Attempt 7 — Bake script (static JSON export) — BUILT, PARKED

Context: In a conversation with Jesse Drukker (Concordia web team), he noted that the My CU Account site uses a pattern where content is exported to a JSON file and uploaded to AEM, removing any runtime dependency on Google. The site serves its own copy of the data.

We built an equivalent for our stack:

- `scripts/bake.js` — fetches all 3 sheet tabs, parses CSV (same logic as `app.js`), writes static JSON to `content/data/workshops.json`, `content/data/opportunities.json`, `content/data/external-resources.json`
- `SHEETS.mode` flag in `app.js` (replaces the old `enabled` boolean):
  - `"live"` — current behaviour, runtime fetch from Google (**active**)
  - `"baked"` — reads from `content/data/*.json` instead of Google (no external dependency)
  - `"local"` — uses only local `data.js` / `content/workshops.json` (no network at all)

Coordinator workflow if activated:
```
1. Edit Google Sheet
2. node scripts/bake.js
3. git diff content/data/    ← review what changed
4. git add content/data/ && git commit -m "content: refresh from sheet" && git push
```

Why it's parked: the terminal is a barrier for a non-technical coordinator. Every content update requires opening Terminal, running a command, and doing a git commit/push. That's a worse experience than the current sheet-to-live flow. The value (no runtime Google dependency, git-based rollback, QA gate before publish) is real, but the UX needs to be abstracted before activating.

Realistic paths to making it usable without Terminal:
- **GitHub Action on a schedule** — a cron-triggered Action runs `bake.js` and auto-commits the JSON on a schedule (e.g. every 30 min). Coordinator edits the sheet; the Action picks it up automatically. No terminal needed.
- **GitHub Action triggered by sheet** — an Apps Script webhook in the sheet calls the GitHub API to trigger a workflow dispatch on save. Near-instant, no polling lag.
- Either path keeps the QA gate (PR review) if desired, or skips it for a fully automatic flow.

Status: code is in the repo and functional. Set `SHEETS.mode = "baked"` in `app.js` to activate. Currently set to `"live"`.

A separate consideration — Doc bodies have their own staging gap. A coordinator can keep editing a published Doc and every save is live within ~5 min (Google's publish cache). Mitigation if that becomes a problem: ask coordinators to *un-publish* before substantial edits, then *re-publish* when ready. Nothing to build, just a process note.
