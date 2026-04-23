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

## Remaining paths

1. **Google Sheets** — publicly publishable, free JSON via `opensheet.elk.sh`. Skips tenant fight. Coordinator uses familiar spreadsheet UI.
2. **MS Lists + manual CSV export** — coordinator exports from the list toolbar when content changes; drops the file in the repo. No automation; fine if content changes weekly.
3. **IT ticket to Concordia** — request anonymous sharing enabled on one OneDrive folder, OR a Team SharePoint site with public access. Slow, uncertain.
4. **Azure Static Web App / Function as proxy** — overkill for prototype.

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
