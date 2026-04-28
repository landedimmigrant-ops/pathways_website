# Pathways to Impact — Website

Static single-page app for Concordia's Office of Research. No build step, no backend.

## Branches

- **`integration-prototype`** — current working branch. Google Sheet as authoritative content store, Google Docs for workshop bodies, Microsoft Bookings for live booking. Deployed via GitHub Pages.
- **`static-resource-update`** — older static-only build. Kept as a known-good reference; do not commit feature work here.
- **`main`** — dormant.

When in doubt, work off `integration-prototype`.

## Content sources

The site reads content at runtime from three places:

| Source | Holds | Edited by |
|---|---|---|
| Google Sheet (3 tabs: `workshops`, `opportunities`, `external-resources`) | All structural metadata: title, format, time, stage, pathway, tags, summary, provider, URLs | Coordinator, in-browser |
| Google Docs (one Doc per workshop) | Long-form workshop bodies | Coordinator, in-browser |
| Local files (`data.js`, `content/workshops/*.md`, `content/workshops.json`) | Fallback only — not edited day-to-day | Engineer, via PR |

Sheet ID and config live in `app.js` under the `SHEETS` config block. Feature flags `SHEETS.enabled` and `BOOKINGS.enabled` can kill-switch each integration independently.

See `INTEGRATION_NOTES.md` for the full architecture history and `COORDINATOR_GUIDE.md` for day-to-day editing.

## Local development

`fetch()` is used for content, so opening `index.html` directly with `file://` will fail.

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

Hard refresh after edits: `Cmd+Shift+R` (Mac) / `Ctrl+Shift+R` (Windows).

If a sheet/doc fetch fails, the console logs `[Pathways] FAILED to load …` and the affected section renders empty (workshop list, explore grid). Local fallback files are kept but no longer used as a silent recovery — failures are visible by design.

## Deployment

- GitHub Pages, source: `integration-prototype` branch, root.
- Cache-busted via `?v=N` query string on `styles.css`, `data.js`, and `app.js` in `index.html`. Bump on every release that touches those files.
- Live URL: https://landedimmigrant-ops.github.io/pathways_website/

## Routes

`#home` · `#start` · `#learn` · `#explore` · `#stories` · `#about` · `#pathways-vision` (deep-linkable, not in main nav)

Deep links: `#home?pathway=<key>`, `#explore?pathway=<key>`, `#explore?workshop=<id>`.

## Repo layout (high level)

```
index.html              — shell
styles.css              — single stylesheet, no preprocessor
app.js                  — IIFE; ~5,500 lines; CSV/Doc parsers, sheet loaders,
                          page builders, modal/booking flows
data.js                 — fallback content + nav, unit metadata, vision text
content/workshops/      — local .md fallback bodies (only used if a workshop
                          row has no docUrl)
content/workshops.json  — local manifest fallback (only if SHEETS.enabled=false)
pathways_to_impact.md   — long-form vision page body
scripts/export_to_csv.js — one-shot to seed sheets from data.js
BOOKINGS_PLAN.md        — MS Bookings architecture + open decisions
COORDINATOR_GUIDE.md    — non-technical editor playbook
INTEGRATION_NOTES.md    — what we tried, what worked, what's next
CONTEXT_SUMMARY.md      — restart notes for picking the project back up
```

## Who to ask

- Sheet access / structure / coordinator workflow: Prem
- Site behaviour / card rendering / deploy: Prem
- Concordia Bookings / licensing: IT Service Desk
