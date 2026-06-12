# Pathways to Impact — Migration Handoff (standalone exports)

**For:** Concordia University web team (AEM / concordia.ca migration)
**Prepared:** 2026-06-12 · **Source branch:** `integration-prototype`
**Companion doc:** [`../CONTENT_MIGRATION.md`](../CONTENT_MIGRATION.md) — the general standalone-export standard this follows.

> **Regenerated 2026-06-12** from `integration-prototype` after a full QA review pass — see
> [`../MIGRATION_VERSION_REVIEW.md`](../MIGRATION_VERSION_REVIEW.md). This snapshot reflects the fixed
> code (routing/state, accessibility, content/copy, and the External-resources provider-filter fix).
> The live catalogue has also grown since the prior 2026-06-10 export: **24 items now** (was 23) — V1
> Studio added a second workshop. Two review items are knowingly left open for the AEM team; see
> **Caveats** below.

---

## What this folder is

Every `.html` file here is a **static, self-contained snapshot** — of either a **page/section** (the layouts) or a single **content item** (one workshop or one resource). Open any of them in any browser (from disk, email, or an AEM authoring preview) and it renders identically, with **no build step and no dependency** on `app.js` / `data.js` / the live `styles.css`.

Each file contains, in order: a yellow "migration export" banner, a minimal Concordia header, the **real rendered markup**, a minimal footer, the **entire `styles.css` inlined** in one `<style>` block, and a tiny accordion-toggle `<script>`. The only external reference is the **Inter** web font (system-font fallback if it can't load).

> Why snapshots rather than generated files? The live site builds everything at runtime from `app.js` + `data.js` + a Google Sheet, so the faithful capture is the *rendered DOM*. (The one exception is the Narrative CV guide — page 11 — which is generated from markdown; see below.)

### Folder structure

```
pathways_migration_june_2026/
├── 01-…13-*.html         13 page / section layouts        (index below)
├── workshops/            12 active workshops & services   (one .html per item)
├── resources/            10 external resources            (one .html per item)
├── MIGRATION_LOG.md      this file
└── _regenerate.js        browser snippet that reproduces all of the above
```

The catalogue's **2 interactive tools** (Impact Planning Module, Narrative CV Builder) are not under `workshops/` — they have no detail page (their card "Start"s the tool); see pages 09–11. So the All Resources count of **24 = 12 workshops + 10 resources + 2 tools**.

---

## Page / section index (layouts)

| # | File | Live route | Section | Notes for migration |
|---|------|-----------|---------|---------------------|
| 01 | `01-home.html` | `#home` | **Home** | Intent cards + hero carousel + Featured. The carousel's 7 slides are **stacked vertically** here (live shows one at a time) so you can see every slide's layout; controls are hidden. |
| 02 | `02-explore-pathways.html` | `#explore` | **Explore · Pathways** tab | The 7-pathway chooser. Clicking a pathway opens a detail view → file 05. |
| 03 | `03-explore-research-stage.html` | `#explore?tab=research` | **Explore · Research Stage** tab | The 3 research-stage cards. Clicking one opens a detail → file 06. |
| 04 | `04-explore-all-resources.html` | `#explore?tab=browse` | **Explore · All Resources** tab | Search + 4 filter dropdowns (Research stage, Types, Time commitment, **Service provider**) + the resource catalogue (23 items, 12 per page). |
| 05 | `05-explore-pathway-detail.html` | `#explore?pathway=community` | **Explore · Pathway detail** (Community Engagement shown) | Pathway lens panel + format pills + related-resource cards. |
| 06 | `06-explore-research-stage-detail.html` | `#explore?tab=research` → Active Research | **Explore · Research-stage detail** (Active Research shown) | Activity chips + related-resource cards. |
| 07 | `07-explore-service-detail.html` | `#explore?service=4th-space-public-engagement` | **Service detail** (4th Space shown) | The full service page (normally a modal; here its fixed positioning is removed so it flows). Booking CTA included. |
| 08 | `08-learn-impact-101.html` | `#learn` | **Learn · Impact 101** | Focus-topic modules grid + "Featured External Resources". |
| 09 | `09-learn-tools.html` | `#learn?tab=tools` | **Learn · Tools** | The two interactive-tool step cards (Plan Your Impact, Build Your Narrative CV). |
| 10 | `10-learn-planner.html` | `#learn?tab=tools&tool=planner` | **Learn · Plan Your Impact** (the planner module) | Interactive planning module, shown at its entry step. |
| 11 | `11-learn-module-narrative-cv.html` | `learn-module-ncv` | **Learn module: "What is a Narrative CV?"** | **Generated from markdown**, not snapshotted — the reference implementation of the standalone standard (identical to `../narrative-cv-guide-standalone.html`; regen via `node scripts/build-ncv-standalone.js`). The model to copy for other Learn guides. |
| 12 | `12-about.html` | `#about` | **About** | Mission, "Partners across the university" accordion (**shown expanded**), and the contact form. |
| 13 | `13-pathways-vision.html` | `#pathways-vision` | **Pathways Vision** | The long-form impact-vision page. |

---

## Content index — workshops (`workshops/`)

One file per **active workshop / service** in the live catalogue (the full detail page: relevance, who it's for, outcomes, format, materials, offering unit, booking CTA). Filename = the item's id. Live route = `#explore?service=<id>`.

| File (`workshops/…`) | Title | Offered by |
|---|---|---|
| `4th-space-public-engagement.html` | 4th Space Research Activation & Public Engagement Support | 4th Space |
| `evaluating-digital-scholarship-tools-for-research.html` | Evaluating Digital Scholarship Tools for Research | Concordia Library |
| `library-dmp-consultation.html` | Data Management Plan (DMP) Consultations | Concordia Library |
| `library-informed-author-rights.html` | Informed Author-Rights: Workshop | Concordia Library |
| `open-scholarship.html` | Licensing & Open Scholarship: Creative Commons, Rights, and Sharing Your Research | Concordia Library |
| `software-skills.html` | Software Skills for Research Workflows: Tool-Specific Training Series | Concordia Library |
| `oce-community-partnerships-workshop.html` | Research Partnerships with Montréal's Black and Indigenous Communities | Office of Community Engagement |
| `pips-ip-technology-transfer.html` | IP & Technology Transfer Consultation | Office of Research (PIPS) |
| `pips-research-agreements-ip.html` | Research Agreements & IP Support Consultation | Office of Research (PIPS) |
| `pips-research-security-risk.html` | External Partnerships & Sensitive Research Risk Assessment | Office of Research (PIPS) |
| `v1-studio-lab2market.html` | Lab2Market Program Exploration: Consultation | V1 Studio |
| `v1-studio-innovation-impact.html` | Innovation Impact Workshops | V1 Studio |

## Content index — resources (`resources/`)

One file per **external resource** (detail page: summary, who it's for, what you'll do, tags, plus an "Open resource ↗" link to the external source). Filename = the item's id. Live route = `#explore?service=<id>`.

| File (`resources/…`) | Title |
|---|---|
| `ext-impact-assessment-template.html` | Impact Assessment Template |
| `ext-impact-indicators.html` | Impact Indicators: Overview & Menu |
| `ext-flows-of-knowledge.html` | Flows of Knowledge: Impact Assessment Method |
| `ext-engaged-research-planning.html` | Engaged Research Planning for Impact |
| `ext-kmb-modules.html` | Knowledge Mobilization Modules |
| `ext-methods-inclusive-research.html` | Methods for Inclusive Research |
| `ext-impact-activities-catalogue.html` | Impact Activities Catalogue |
| `ext-stakeholder-analysis.html` | Stakeholder Analysis Matrix Template |
| `ext-community-based-participatory-action-research.html` | What is Community-Based Participatory Action Research? |
| `ext-research-tools-for-organizers.html` | Power Research and Research Tools for Organizers |

> These 22 items + the 2 tools = the 24-item All Resources catalogue. Re-export after any Sheet content change (see below). The offering unit shown above is each workshop's `unit` field.

---

## Caveats the web team should know

1. **Bilingual.** These snapshots are **English only**. concordia.ca is fully bilingual, so each section will need a French counterpart (the initiative's FR name is *Vecteurs de rayonnement*). The prototype's UI strings live in JS; **translation is being handled as part of the AEM migration**, not in the prototype.
2. **Interactivity is not reproduced.** Hash routing, carousel autoplay, live search/filtering, and modal open/close do **not** work in these static files — they're for **layout + content review**. The accordions **do** work (small inline script). The carousel is shown stacked (all slides visible) on purpose.
3. **Content is a point-in-time snapshot (2026-06-12)** pulled from the live Google Sheet — currently "24 resources". Re-export after content changes (see below).
7. **Two known-open review items (accepted).** From the 2026-06-12 QA pass ([`../MIGRATION_VERSION_REVIEW.md`](../MIGRATION_VERSION_REVIEW.md)), two issues are deliberately left for the AEM team rather than fixed in the prototype:
   - **Contact email** — `impact@concordia.ca` appears as **plain text** (not a `mailto:` link) in the About page and in every workshop/resource footer. Wire it as a real `mailto:` and **verify the inbox exists** before go-live.
   - **Narrative CV builder** — the live tool still shows a "prototype/draft" banner. It is **not part of this package** (see "Not included" below); flagged only so the live prototype isn't mistaken for final.
4. **The export adds chrome.** The banner, the `.mh-header`/`.mh-footer`, and the `.mh-*` classes are added by the export tooling for context — they are **not** part of the site markup; strip them when authoring.
5. **CSS is the whole file.** Each snapshot inlines the complete `styles.css` (~112 KB). It's class-based and self-contained (no local image/url assets — icons are inline SVG or CSS). Use it to read the exact rules behind any element.
6. **Service detail (07)** is normally a full-screen modal; its `position:fixed` was neutralized so it lays out inline.

## Not included (deliberately)

- **The Narrative CV *builder* tool** (`#tools-narrative`) — being reworked separately; not exported here. (File 11 is the *guide*, not the builder.)
- **The four placeholder Learn modules** (Myths vs realities, Impact across disciplines, Evidence that counts, Why plan early) — content stubs, nothing to migrate yet.
- **Site chrome** (global header nav, route footer) — rebuilt natively in AEM; each snapshot carries only its section's content under a neutral header.

---

## How to regenerate

The snapshots (files 01–10, 12, 13) are produced by rendering the live site and capturing each section:

```bash
# from the repo root
python3 -m http.server 8765                 # 1. serve the site
node scripts/migration-export-server.js     # 2. start the local save-server (writes here)
```

Then open `http://localhost:8765/#home` in a browser, open DevTools → Console, and paste the contents of [`_regenerate.js`](_regenerate.js). It walks every section, builds each self-contained document, and POSTs it to the save-server, which writes the files into this folder. Stop the save-server when done.

File **11** is generated from its markdown source instead: `node scripts/build-ncv-standalone.js` (then copy the result here). See [`../CONTENT_MIGRATION.md`](../CONTENT_MIGRATION.md).

**Tooling in this folder / repo:**
- `_regenerate.js` — the browser console snippet (snapshots 01–10, 12, 13).
- `../scripts/migration-export-server.js` — the local-only save-server that writes POSTed HTML to this folder.
- `../scripts/build-ncv-standalone.js` — the markdown→HTML generator for file 11.
