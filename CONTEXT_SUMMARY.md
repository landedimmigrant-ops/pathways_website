# Pathways SPA — Context Summary (Restart Notes)

Last updated: 2026-04-28 · **Reviewed at the 2026-06-12 migration freeze.**

> ⚠️ **Partially historical.** These restart-notes predate the 2026-06-12 Concordia handover freeze and
> some sections have drifted (the nav is now **Explore · Learn · About** with a logo-only home — no
> "Stories"/`#start`; the home page is intent-cards + a hero carousel; the route footer now shows on
> **every** page including Home). For the **current authoritative state**, see:
> - [`pathways_migration_june_2026/MIGRATION_LOG.md`](pathways_migration_june_2026/MIGRATION_LOG.md) — the frozen handover package (24-item catalogue, regenerated 2026-06-12).
> - [`MIGRATION_VERSION_REVIEW.md`](MIGRATION_VERSION_REVIEW.md) — the QA review pass (issues #1–18) and what was fixed.
> - [`DOCUMENTS_INDEX.md`](DOCUMENTS_INDEX.md) — the file map.
>
> The architecture below (Sheet/Docs/Bookings integration, failure modes, data model) is still accurate;
> the UI/route/nav specifics are not — treat them as historical.

## What this repo is

- Static single-page app, no build step, no backend.
- Core files: `index.html`, `styles.css`, `app.js`, `data.js`.
- Content layered on top: Google Sheet (authoritative metadata), Google Docs (workshop bodies), Microsoft Bookings (live booking).
- Local fallback content remains in `data.js`, `content/workshops/*.md`, `content/workshops.json`, and `pathways_to_impact.md`.

## Branches

- **`integration-prototype`** — working branch with the sheet/doc/bookings integrations live. Deployed via GitHub Pages.
- **`static-resource-update`** — older static-only build. Reference only.
- **`main`** — dormant.

## Local run

```
python3 -m http.server 8000
open http://localhost:8000
```

`fetch()` is used for content, so `file://` will not work. Cross-origin fetches to Google Sheets and Google Docs require an `http://` origin.

## Content architecture

### Google Sheet (single source of truth for metadata)

- Sheet ID: `1IQGINsUTQMWLm4IJY49dr76pMeWkIH_vj-aLnj9jD1Y`
- Three tabs: `workshops`, `opportunities`, `external-resources`
- Endpoint: `https://docs.google.com/spreadsheets/d/<id>/gviz/tq?tqx=out:csv&sheet=<tab>` (no auth, public read, CORS-friendly)
- Columns common to all three tabs: `id`, `title`, `summary`, `format`, `time`, `pathway`, `stage`, `tags`, `provider`, `bookingUrl`, `ownerName`, `ownerEmail`
- Workshops tab adds: `slug`, `pathways`, `stages`, `featuredHome`, `internalRoute`, `file`, `docUrl`
- Opportunities/external tabs add: `category`, `author`, `detailsWho`, `detailsWhat`, `detailsOutcomes`, `externalUrl`
- Multi-value columns use `;` separator (e.g. `Communications; Policy`)

### Google Docs (workshop body content)

- One published Doc per workshop. URL format: `https://docs.google.com/document/d/e/<long-id>/pub`
- Pasted into the `docUrl` column of the workshops sheet row
- The site fetches the Doc, walks the DOM, rebuilds with allowlisted structural tags, auto-promotes plain-paragraph section labels to `<h2>`, merges soft-broken paragraphs, drops redundant Title/Tags lines
- Loader prefers `docUrl` over local `.md` fallback — gradual migration, row-by-row

### Microsoft Bookings (live booking)

- Per-service URL pasted into `bookingUrl` column
- Click "Book" / "Register" → `window.open(bookingUrl, "_blank", "noopener")` → MS Bookings opens in new tab → user picks time → Teams invite mailed
- Iframe embed not viable (`X-Frame-Options: DENY`)
- Currently using Prem's personal Bookings-with-Me URL; planned migration to a shared Bookings page

### Feature flags (in `app.js`)

- `SHEETS.enabled` — flip to `false` to fall back to local `data.js` and `content/workshops.json`
- `BOOKINGS.enabled` — flip to `false` to suppress MS Bookings redirect (returns to the Formspree request form)

### Failure modes (visible by design)

- Sheet fetch fails → Explore page is empty, console logs `[Pathways] FAILED to load explore content from sheet`. No silent fallback to `data.js`.
- Doc fetch fails for a single row → that row's body falls back to local `.md` (if any), console logs `[Pathways] Workshop body failed to load`. Other rows unaffected.
- Doc fetch fails AND no local `.md` → row drops out of the workshop list.

### Staging / preview (update)

Edits to the sheet (and to published Docs) go live within ~1–5 minutes. A frozen **user-testing snapshot** now exists under `testing/` (see `INTEGRATION_NOTES.md`), and content is gated by an `version = approved` column (see `COORDINATOR_GUIDE.md`). There is still no full preview/rollback gate for arbitrary edits; `INTEGRATION_NOTES.md` "Known gaps" lists the realistic paths if volume warrants more.

## Current routes

- `#home`
- `#start`
- `#learn`
- `#explore`
- `#stories`
- `#about`
- `#pathways-vision` (not in main nav)

Deep linking:
- `#home?pathway=<key>` — opens pathway modal on Home
- `#explore?pathway=<key>` — opens Explore with pathway filter applied
- `#explore?workshop=<id>` — opens Explore and focuses that workshop via search

## Header + footer behaviour

- Nav: Home · Learn · Explore · Stories · About
- Site title: "Pathways to Impact"
- Footer "Lost? Start with your research stage →" appears on all routes except Home

## Home page structure

1. Intro text block
2. Pathway boxes grid (Academic full-width row + 6 boxes 3×2; click → modal)
3. "Where are you in your research journey?" 2×2 stage grid
4. Upcoming grants (3 tiles)
5. Popular support (3 tiles, uses featured workshops when available)

## Explore page

- Search + filters (stage, category, format, time, pathway)
- Cards show format badge, title, time pill, "Offered by …" provider line, summary, tags
- Workshop cards: click → modal with rendered Doc body + bottom CTA
- Bottom modal CTA: "Open resource" (external links) / "Book a consultation" (consults) / "Register for this workshop" (workshops) / "Express interest" (everything else). Workshops + consultations route through `openBookingModal`, which opens MS Bookings if `bookingUrl` is set, else shows the request form.

## Learn page

- What is research impact
- Myths vs realities
- Focus topics cards
- Recommended Resources section

## About + Vision

- About: short intro, Pathways Vision link, partners accordion, contact section
- `#pathways-vision`: long-form view rendered from `pathways_to_impact.md` with progressive expanders for long sections

## Data model notes

- `data.js` is the fallback content source; cleared at runtime by `loadExploreContentFromSheets()` so the sheet is authoritative
- `units[]` dictionary holds partner metadata + short codes
- `workshopUnitTags` is applied to workshop cards/tags

## Styling notes

- Concordia palette utilities
- Pathway boxes color-coded; hover to white
- Neutral clickable tiles: off-white `#F8F8F8` default, white on hover/focus
- Focus-visible styles enabled
- `.card-provider` sits above `.card-text` on every card

## Git / deployment

- Working branch: `integration-prototype`
- Deployed via GitHub Pages (source: same branch, root)
- Live URL: https://landedimmigrant-ops.github.io/pathways_website/
- Cache version: `?v=N` on `styles.css`, `data.js`, `app.js` in `index.html` — bump on every release
- Remote: `origin -> https://github.com/landedimmigrant-ops/pathways_website.git`
