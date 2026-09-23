# aem-review-kit

Everything reusable from the Narrative CV guide review (September 2026), packaged so the same
process can run on another guide or content page that lives on Concordia's AEM site.

**What it produces:** a review copy of an AEM page, hosted on GitHub Pages next to the prototype.
It looks like the AEM page, carries every correction, and has three modes of use:

- **Reviewers** see the corrected page and a comment layer: select text, "Comment on this"; replies;
  Open / Resolved. Resolved threads leave no highlights.
- **Whoever pastes into AEM** flips **AEM copy mode** (or opens the link with `?aem=1`): every change
  is tagged with Copy text / Copy HTML, any block has a Copy handle, and a To do / Done checklist
  records what has been pasted, by whom and when. A "done" mark stores a fingerprint of the copied
  text, so a change edited afterwards goes back to To do in amber.
- **We** process comments in batches and close each thread with a note of what was done.

The process itself (review passes, source checking, routing questions, the correction loop) is in the
project skill **`.claude/skills/aem-guide-review/`**. This folder is the tooling.

## Folder map

| Path | What |
|---|---|
| `build.py` | The build. `python3 aem-review-kit/build.py <guide-folder>` |
| `layer/review.js`, `layer/review.css` | The review layer. Canonical copies; the build copies them into each guide folder. **Edit here.** |
| `snapshot/extract.js` | Runs on the AEM page; posts used CSS + main/header/footer to the local receiver. |
| `snapshot/receiver.js` | Local receiver for the snapshot (port 8792). |
| `snapshot/split.py` | Bundle → the guide's `src/` files, pretty-printed; downloads logos and the sprite. |
| `apps-script/review.gs` | Comment + "done in AEM" storage in the project sheet (already live). |
| `template/src/` | Starter files for a new guide folder. |
| `docs/correction-log-template.md` | The correction-log structure (IDs, passes, groups A–E, decisions). |

Worked example: `ncv-guide-review/` (the Narrative CV guide), with its log
`ncv-guide-aem-review-2026-09-21.md` and factual review `narrative-cv-guide-factual-review.md`.

## Start a new guide review

1. **Make the folder.** `cp -r aem-review-kit/template <name>-review` (repo root, next to
   `ncv-guide-review/`). Fill in `src/guide.json` (title, page title) and give
   `src/seed-comments.json → storage.page` a unique key such as `grants-guide`.
2. **Capture the AEM page.**
   `node aem-review-kit/snapshot/receiver.js /tmp/aem-snapshot` (leave it running), open the AEM page
   in the browser pane, run the contents of `snapshot/extract.js` on it, then
   `python3 aem-review-kit/snapshot/split.py /tmp/aem-snapshot/bundle.txt <name>-review`.
   Copy the printed `body_class`, `head_links` and `source_url` into `guide.json`. Stop the receiver.
3. **Build and look.** `python3 aem-review-kit/build.py <name>-review`, then open
   `http://localhost:8000/<name>-review/` (launch config "pathways"). It should look like AEM.
4. **Review** (the skill has the passes). Write each fix into `src/corrections.json` with an ID from
   the log; structural edits go in `src/hooks.py`; questions for people go in
   `src/seed-comments.json → comments`, anchored by a verbatim `quote`.
5. **Switch comments to the sheet.** In `seed-comments.json → storage` set `backend: "sheet"`,
   `writeUrl` = the exec URL (it is in `ncv-guide-review/src/seed-comments.json`), and
   `readUrl` = exec URL + `?action=review_list&page=<your key>`. No Apps Script change is needed:
   one tab serves every guide, separated by `page`.
6. **Publish.** Commit and push `integration-prototype`; the page appears at
   `https://landedimmigrant-ops.github.io/pathways_website/<name>-review/`.
   Reviewers get that link; the web editor gets the same link with `?aem=1`.

## Gotchas we hit (and the fixes already in the kit)

- **Site CSS is scoped to `#boot`.** The build wraps the page in `<div id="boot">` (`wrapper_id`).
  Any extra CSS for AEM classes must be scoped `#boot …` to win.
- **The used-CSS extraction keeps only rules that match the captured page.** A layout you add (a
  three-column row, say) may need a rule in `layer/review.css`, as `col-md-4` did.
- **Fetch to localhost is blocked** from the AEM page; the extractor uses a form POST.
- **AEM paths move.** The dev page moved from an author tree to its launch path overnight; if the
  extractor's page 404s, find the new path from the section's home page.
- **Browsers cache the layer.** The build stamps each file link with a content hash; keep it.
- **Apps Script serves the deployed version.** After any script edit: Deploy → Manage deployments →
  New version. A POST answers 405 after Google's redirect even when the write landed; verify by
  reading back (`?action=review_list`).
- **Sheet rows cannot be deleted through the webhook.** Hide test rows with `hidden` in
  `seed-comments.json`.
- **Smooth scrolling can be swallowed** at phone width; the layer falls back to a jump.
- **The browser pane sometimes screenshots blank** at some scroll positions; measure with the DOM, or
  scroll a few pixels and retry.
- **Typekit** (Gill Sans Nova) serves the GitHub Pages domain; Cabin is the fallback if it ever stops.
