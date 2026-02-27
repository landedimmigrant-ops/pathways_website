# Pathways SPA — Context Summary (Restart Notes)

Last updated: 2026-02-27

## What This Repo Is
- Static single-page app (SPA) deployed via Netlify drag-and-drop.
- No build tools, no backend.
- Main files: `index.html`, `styles.css`, `app.js`, `data.js`.

## How To Run Locally
- Markdown/workshop/vision content is loaded via `fetch()`, so `file://` will usually fail.
- Use a local HTTP server from the project root:
  - `python3 -m http.server 8000`
  - Open `http://localhost:8000`

## Routes / Pages (Hash Routing)
- `#home` (landing)
- `#start`
- `#learn`
- `#explore`
- `#stories`
- `#about`
- `#pathways-vision` (not in main nav; accessed from About)

Deep links supported:
- `#explore?pathway=<key>` auto-opens pathway details modal for that pathway.
- `#explore?workshop=<id>` can focus/highlight a workshop in Explore (used by Popular support).

## Key Functionality Added / Changed

### Explore (Pathways + Explorer)
- Top section shows 7 pathway boxes (color-coded by official palette) with `data-pathway` identifiers.
- Clicking a pathway opens a modal overlay (no scroll-jump) with:
  - title, framing sentence, label line, bullets, featured supports
  - Previous / Next browsing
  - Close via X, ESC, or backdrop click
  - “View related opportunities” applies pathway filter and scrolls to explorer list

### Workshops: File-Based “Database”
- Manifest: `content/workshops.json`
- Content folder: `content/workshops/*.md`
- Loader in `app.js` fetches the manifest + each markdown file, then renders workshop cards + detail view.
- Minimal markdown renderer supports headings (`#`, `##`), paragraphs, and lists (`-`).
- Front matter is stripped if present (`--- ... ---`).

Manifest generation:
- Script: `scripts/generate_workshops_manifest.py`
- Purpose: regenerate `content/workshops.json` based on `.md` files without a build system.

### Landing (“Home”)
- Journey/stage cards navigate to `#start`.
- Pathway list is rendered as a vertical list; each pathway name deep-links to `#explore?pathway=...`.
- Sections present (in order under the hero area):
  - Upcoming grants (3 mock tiles)
  - Popular support (3 tiles, usually featured workshops; routes into Explore)

### About
- Units dictionary added for future tagging and partners display:
  - `data.js`: top-level `units[]` with `shortCode` (RD, LIB, etc.) + URLs + group.
- Added `workshopUnitTags` mapping in `data.js` (applied at load time) for:
  - Narrative CV development → `RD`
  - Open Science and Open Scholarship practices → `LIB`
  - Research Data Management guidance → `LIB`
- About page structure (current):
  - Single “About Pathways” heading + one merged paragraph
  - Major accordion: “Partners across the university” (triangle style), containing nested unit accordions
  - “Contact Us” restored at the bottom

### Pathways Vision Page
- New route: `#pathways-vision`
- Loads long-form markdown from: `pathways_to_impact.md` (project root)
- Displays:
  - Back link to About
  - Title + intro line
  - Markdown rendered into readable longform layout
  - Auto-collapses very long sections using `<details>/<summary>` (“Read more”)
  - Highlights a “definition-like” paragraph if detected (subtle grey background + burgundy border)

## Styling System Notes
- Inter font loaded via Google Fonts in `index.html`.
- Container: `max-width: 940px; padding: 0 16px;`
- Focus-visible outline enabled (do not remove).
- Official Concordia palette utilities exist (e.g., `.bg-burgundy`, `.bg-blue`, etc.).
- Pathway cards use palette colors + hover-to-white behavior.
- Neutral clickable cards (journey + opportunity cards) use off-white background default (`#F8F8F8`) and turn white on hover/focus; pathway cards excluded.

## Important Files To Know
- `data.js`
  - primary site content (copy, labels, pathways content, About partners structure)
  - `units[]` dictionary + `workshopUnitTags`
- `app.js`
  - router, page builders, Explore pathway modal, workshop loader/renderer, Pathways Vision loader/page
- `styles.css`
  - Concordia-aligned styling, pathway colors, modal styles, accordion/triangle styles, longform vision styles
- `content/workshops.json`
  - workshop manifest (edit or regenerate via script)
- `content/workshops/*.md`
  - workshop bodies
- `pathways_to_impact.md`
  - Pathways Vision long-form source

## Known Gotchas
- `file://` will not load `content/workshops.json` or `pathways_to_impact.md` due to browser security; serve over HTTP.
- Main navigation is generated from `data.navigation`, but header rendering maps `start -> home` and filters to the main set.

