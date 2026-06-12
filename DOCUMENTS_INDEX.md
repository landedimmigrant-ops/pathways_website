# Documents Index

A map of every significant file and folder in this repo — what it is and what it's
for. Skim here before hunting through the tree. Grouped by purpose; paths are
relative to the repo root.

> Living document — update it when you add a doc, prototype, or script.
> Last updated: 2026-06-12.

---

## Core application (the live SPA)

The site is a static single-page app — no build step, no backend. These four files
are the whole app.

| File | What it's for |
|------|---------------|
| `index.html` | App shell. Loads `data.js` + `app.js` + `styles.css` (pinned with `?v=NNN` cache-busters). |
| `app.js` | All app logic and views — routing, page builders (`buildExplore`, `buildLearn`, `buildPathwaysVision`, `buildNarrativeCV101`, …), rendering. |
| `styles.css` | All styles, including the `.ncv-*` long-form component palette. |
| `data.js` | Static content/data baked for the app to read at runtime. |

Deployed via **GitHub Pages** from the **`integration-prototype`** branch.

---

## Content sources

The text and data that fills the site.

| Path | What it's for |
|------|---------------|
| `pathways_to_impact.md` | The "Pathways to Impact" executive summary — approved Vision text that drives the **#pathways-vision** page. |
| `content/learn/narrative-cv-guide.md` | Source markdown for the Learn → Narrative CV guide. |
| `content/workshops/*.md` | One markdown file per workshop/consultation body (4th Space, Library RDM, PIPS, OCE, UCS, etc.). |
| `content/data/*.json` | Baked content (`workshops`, `opportunities`, `external-resources`) — generated from Google Sheets by `scripts/bake.js`. |
| `content/workshops.json`, `content/workshops/` | Workshop manifest + bodies. |
| `resources/external-tools-tier1│2│3.md` | Curated external tools/resources, tiered by relevance. |
| `exports/*.csv` | Content exported to CSV, ready for Google Sheets import (`workshops`, `opportunities`, `external-resources`). |
| `assets/og-image.{png,svg}` | Open Graph social-share image. |

---

## Project documentation

Orientation, plans, and running logs for the build.

| File | What it's for |
|------|---------------|
| `README.md` | Top-level orientation: what the repo is, the branch model, how to run/deploy. **Start here.** |
| `CONTEXT_SUMMARY.md` | Restart notes — quick re-orientation on the repo's state and core files. |
| `COORDINATOR_GUIDE.md` | How a non-coder edits site content via Google Sheets, including the `version = approved` gate that controls what goes live. |
| `INTEGRATION_NOTES.md` | Running log of connecting a coordinator-friendly content backend (Sheets → JSON) to the site. |
| `BOOKINGS_PLAN.md` | Plan for the Microsoft Bookings integration (Phase 2 of content/backend work). |
| `BOOKINGS_STATUS.md` | How the site shows full/cancelled status and the waitlist flow. Companion to `BOOKINGS_PLAN.md`. |
| `RESEARCHER_REVIEW_2026-06-09.md` | Simulated researcher walkthrough of the SPA — usability findings, desktop + mobile. |
| `LONGFORM_LAYOUT_TEMPLATE.md` | Reusable template for the `.ncv-*` long-form layout style (guides/documents). Component palette + markdown→layout conventions. |
| `DOCUMENTS_INDEX.md` | This file. |

---

## Narrative CV (NCV) tool — prototypes & docs

A standalone interactive tool that critiques a researcher's Narrative CV draft.
Iterated across several prototypes; **V4 is the converged version.**

| File | What it's for |
|------|---------------|
| `narrative-cv-prototype.html` | Original NCV tool prototype. |
| `narrative-cv-prototype-v3.html` | V3 — context-tailored prompt library. |
| `narrative-cv-prototype-v4.html` | **V4 — convergence prototype** (current). X-ray mode, recalibrated "we" rule, PS-last, advisor packet, genre exemplars, Concordia palette. |
| `ncv_tool_v4/index.html` | V4 published at `/ncv_tool_v4` for colleague testing (clean URL). |
| `narrative-cv-guide-standalone.html` | Self-contained export of the Learn → "What is a Narrative CV?" guide — the content-migration test artifact (see `CONTENT_MIGRATION.md`). |
| `narrative-cv-redesign-response.html` | Structural redesign response doc for the NCV tool. |
| `narrative-cv-evaluation.md` | Evaluation methodology — every check the tool performs on a draft, why, and what it deliberately doesn't do. |
| `narrative-cv-process-review.md` | Critical review of the NCV design so far + the convergence plan V4 implements. |

> Real researcher CVs used during design are **private** and not committed.

---

## Migration / handoff to concordia.ca

Material prepared for the Concordia web team (Adobe Experience Manager / AEM).

| Path | What it's for |
|------|---------------|
| `CONTENT_MIGRATION.md` | The repeatable pattern for exporting a Learn page as one self-contained HTML file the web team can evaluate. |
| `pathways_migration_june_2026/` | Standalone section exports for the web team — `01-home.html` … `13-pathways-vision.html`, plus `resources/` and `workshops/`. **Frozen + regenerated 2026-06-12** (24-item catalogue). |
| `pathways_migration_june_2026/MIGRATION_LOG.md` | Log of what was exported and how; carries the accepted-open caveats for the AEM team. |
| `pathways_migration_june_2026/_regenerate.js` | Script to regenerate the export set. |
| `MIGRATION_VERSION_REVIEW.md` | The 2026-06-12 QA review pass before freeze — issues #1–18, what was fixed/verified, and what's knowingly left open (#9 contact mailto, #12 NCV builder). |
| `pathways-sitemap.html`, `pathways-sitemap.pdf` | Full site map of the SPA (HTML + PDF). |

---

## Scripts

| File | What it's for |
|------|---------------|
| `scripts/bake.js` | Fetches content from Google Sheets, writes static JSON to `content/data/`. |
| `scripts/export_to_csv.js` | Exports Pathways content to CSV ready for Sheets import. |
| `scripts/build-ncv-standalone.js` | Builds the self-contained NCV guide HTML export. |
| `scripts/migration-export-server.js` | Local server that produces the migration HTML exports. |
| `scripts/generate_workshops_manifest.py` | Generates the workshops manifest. |
| `scripts/snapshot-testing.sh` | Refreshes the frozen `testing/` snapshot. |

---

## Testing

| Path | What it's for |
|------|---------------|
| `testing/` | **Frozen snapshot** of the app (baked mode) for stable testing — its own copies of `index.html`, `app.js`, `styles.css`, `data.js`, content. Versioned `?v=frozen-YYYY-MM-DD`. Keep in sync with root when changing app code. |
| `tests/ncv-personas/` | NCV persona-simulation harness — `personas.json`, `simulate.js`, `drafts/`, and its own `README.md`. Runs synthetic researcher drafts through the tool. |

---

## At a glance: where do I look for…?

- **Change the live site** → `index.html` / `app.js` / `styles.css` / `data.js` (root), then bump `?v=` and push `integration-prototype`.
- **Edit workshop/guide text** → `content/` (or the Google Sheet; see `COORDINATOR_GUIDE.md`).
- **Build a new long-form guide** → `LONGFORM_LAYOUT_TEMPLATE.md`.
- **The Narrative CV tool** → `narrative-cv-prototype-v4.html` (+ `narrative-cv-process-review.md` for the rationale).
- **Hand content to the web team** → `CONTENT_MIGRATION.md` + `pathways_migration_june_2026/`.
- **How content gets from Sheets to site** → `INTEGRATION_NOTES.md` + `scripts/bake.js`.
