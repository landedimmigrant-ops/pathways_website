# Pathways SPA — Context Summary (Restart Notes)

Last updated: 2026-03-09

## What This Repo Is
- Static single-page app (SPA), no build step, no backend.
- Core files: `index.html`, `styles.css`, `app.js`, `data.js`.
- Content files: workshop manifest + markdown in `content/workshops/`, plus `pathways_to_impact.md` for the vision page.

## Local Run (Important)
- `fetch()` is used for markdown/json content, so opening with `file://` may fail.
- Run from project root:
  - `python3 -m http.server 8000`
  - open `http://localhost:8000`

## Current Routes
- `#home`
- `#start`
- `#learn`
- `#explore`
- `#stories`
- `#about`
- `#pathways-vision` (not in main nav)

## Deep Linking Behavior
- `#home?pathway=<key>` opens pathway modal on Home.
- `#explore?pathway=<key>` opens Explore and applies pathway filter.
- `#explore?workshop=<id>` opens Explore and focuses that workshop via search.

## Header + Footer Behavior
- Header nav shows: Home, Learn, Explore, Stories, About.
- Site title remains “Pathways to Impact”.
- Footer helper link “Lost? Start with your research stage →” appears on all routes except Home.

## Home Page (Current Structure)
Order is:
1. Intro text block
2. Pathway boxes grid (moved from Explore)
   - 7 pathway color blocks
   - Academic pathway is full-width row; remaining boxes are 3x2
   - clicking a pathway opens modal (X/ESC/backdrop close, prev/next supported)
   - single CTA button below grid: “Explore Pathways →”
3. “Where are you in your research journey?” 2x2 stage grid
4. Upcoming grants (3 tiles)
5. Popular support (3 tiles; uses featured workshops when available)

## Explore Page (Current)
- Focused on opportunity/workshop explorer only.
- Search + filters (stage, category, format, time, pathway).
- Results cards with metadata, tags, and detail modal.
- Workshop cards can show `Register` when `libcalUrl` exists; otherwise `View details`.

## Learn Page
- Includes:
  - What is research impact
  - Myths vs realities
  - Focus topics cards
  - Recommended Resources section (placeholder currently includes Research Impact Canada)

## About + Vision
- About contains:
  - “About Pathways” with concise paragraph
  - “Read the Pathways Vision →” link + one-line description
  - “Partners across the university” accordion with nested partner accordions
  - “Contact Us” section at bottom
- `#pathways-vision` loads full text from `pathways_to_impact.md` and renders longform view with progressive expanders for very long sections.

## File-Based Workshop Content
- Manifest: `content/workshops.json`
- Workshop files: `content/workshops/*.md`
- Loader in `app.js` fetches manifest + markdown, parses minimal markdown, and renders workshop content.
- Manifest regeneration script:
  - `python3 scripts/generate_workshops_manifest.py`

## Data Model Notes
- `data.js` is still the primary site content source.
- `units[]` dictionary exists for partner metadata and short codes.
- `workshopUnitTags` exists and is applied to workshop cards/tags.

## Styling Notes
- Concordia-aligned visual system with official palette utilities.
- Pathway boxes are color-coded and hover to white.
- Neutral clickable tiles use off-white default (`#F8F8F8`) and white on hover/focus.
- Focus-visible styles are enabled.

## Git / Deployment State
- Branch: `main`
- Remote: `origin -> https://github.com/landedimmigrant-ops/pathways_website.git`
- Local history includes: `first draft`, `draft 2`, and merge of `origin/main`.
- Can deploy via GitHub Pages (main/root) or Netlify drag-and-drop.
