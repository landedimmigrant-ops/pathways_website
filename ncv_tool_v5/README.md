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

V4 is untouched and remains at `/ncv_tool_v4/`. Drafts persist in `localStorage`
under `ncv-v5` (V4 uses `ncv-v4`), so the two can be tested side by side in one
browser. No build step, no backend, no AI service; nothing is transmitted.
