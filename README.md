# Pathways Website

Workshop content is loaded from local files in `content/workshops.json` and `content/workshops/*.md`.

- After adding a new file in `content/workshops/`, regenerate the manifest:
  - `python3 scripts/generate_workshops_manifest.py`

- On Netlify (or any HTTP server), workshop files load normally via `fetch()`.
- If you open `index.html` directly with `file://`, browsers may block local file fetches.
- Optional local server:
  - `python3 -m http.server 8000`
  - Open `http://localhost:8000`
