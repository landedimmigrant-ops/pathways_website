# Narrative CV tool (V5 beta) — developer pointer

Clean, shareable address for the **V5 beta** of the Narrative CV tool. Same
pattern as `/ncv_tool_v4/`: this folder's `index.html` is a thin redirect.

| What | Where |
|---|---|
| **Source of truth** (all markup + logic, one file) | [`../narrative-cv-prototype-v5.html`](../narrative-cv-prototype-v5.html) |
| **Stylesheet dependency** | [`../styles.css`](../styles.css) |
| **Live** | https://landedimmigrant-ops.github.io/pathways_website/ncv_tool_v5/ |
| **What changed from V4, and why** | [`../narrative-cv-v5-decisions.md`](../narrative-cv-v5-decisions.md) |
| **The review it was built from** | [`../narrative-cv-v5-brett-review.md`](../narrative-cv-v5-brett-review.md) |
| **The 60 worked examples the Contributions card can show** (review sheet; `node scripts/ncv-v5-examples.js lint\|register\|review`) | [`../narrative-cv-v5-examples-review.md`](../narrative-cv-v5-examples-review.md) |
| **Funder rules it states** (section names, page limits, fonts, links, language) | the corrected guide, [`../ncv-guide-review/`](../ncv-guide-review/), synced 2026-09-25; the guide links open it until the AEM page launches (`GUIDE_URL` in the HTML) |
| **Session feedback** (Feedback step + "Note for the team") | project sheet, **Guide review** tab, rows with `page = ncv-tool-v5`. Read: `curl -sL "<exec URL>?action=review_list&page=ncv-tool-v5"` (exec URL in `../ncv-guide-review/src/seed-comments.json`) |

V4 is untouched and remains at `/ncv_tool_v4/`. Drafts persist in `localStorage`
under `ncv-v5` (V4 uses `ncv-v4`), so the two can be tested side by side in one
browser. No build step, no backend, no AI service. The draft is never transmitted; the only thing
that leaves the browser is what a researcher writes in the Feedback step, when they press Send.
