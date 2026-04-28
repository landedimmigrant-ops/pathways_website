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

### Attempt 6 — Workshop bodies from published Google Docs ✅ WORKING (gradual migration)

Plan: workshop body content was the last thing still living in local `content/workshops/*.md`. Coordinator can't edit those without git access. Move bodies into Google Docs (one Doc per workshop), use Docs' Publish-to-web feature, store the resulting `/pub` URL in a new `docUrl` sheet column, fetch and render at runtime.

Outcome: **works, gradual migration.** Workshops with `docUrl` filled in pull from the Doc; the rest keep using their local `.md` until migrated. Nothing breaks during the transition.

- New `docUrl` column on the `workshops` tab (e.g. `https://docs.google.com/document/d/e/<long-id>/pub`)
- New `provider` column on all three tabs (e.g. "Office of Research", "Library RDM Team") — rendered as "Offered by …" line on cards and in modal meta
- `fetchWorkshopBodyFromDoc(docUrl)` — fetches the published HTML, extracts `#contents`, walks the DOM, rebuilds with allowlisted structural tags (h1–h4, p, ul/ol/li, strong/em/b/i, a, br). Inline styles, `<span>` chrome, and Google's URL redirect wrapper all stripped.
- `loadWorkshopContent` per-entry: prefer `docUrl` if present, fall back to `entry.file`, treat metadata-only entries (no file, no docUrl) as tools.
- Why publish-to-web (not Drive API): no auth, no API key, no quota; standard page fetch with public CORS. Coordinator just clicks File → Share → Publish to web → Embed and pastes the URL.
- Why we didn't shove markdown into a sheet cell: long multiline bodies make the sheet UI unreadable and break the per-row mental model.

## Remaining paths

1. **MS Lists** — parked unless Concordia IT opens up anonymous sharing or provisions a Team SharePoint site.
2. **In-page booking (no new tab)** — see [BOOKINGS_PLAN.md](BOOKINGS_PLAN.md) "Staying on the page" section. Three realistic options documented; pick one when ready.
3. **Coordinator UX** — sheet is functional but raw; consider a simple form (Google Form → sheet) or column validation for non-dev editors.
4. **Shared Bookings page** — currently using Prem's personal *Bookings with Me* URL. Long-term a shared booking mailbox (owned by the coordinator, not Prem) is cleaner.

## Current CSVs

Generated from `data.js` via `scripts/export_to_csv.js`:
- `exports/opportunities.csv` — 8 internal services
- `exports/external-resources.csv` — 11 external links
- `exports/workshops.csv` — 13 workshops

Columns use `;` separator for multi-value fields (pathway, stage). Three extra columns added for future: `bookingUrl`, `ownerName`, `ownerEmail`.

## Open questions

- Does Office of Research have (or can request) a Team SharePoint site with external-sharing enabled? That would unblock the MS Lists path.
- Is Microsoft Bookings the confirmed choice for per-provider booking, or are we still evaluating?
- Who will own the database day-to-day — one coordinator or multiple?
