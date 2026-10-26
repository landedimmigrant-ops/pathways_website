# Narrative CV tool (V6 beta) — developer pointer

Clean address for **V6 beta**, the regular line of the Narrative CV tool from 2026-10-23. It started as an
exact copy of V5 beta (commit `4d71449`). This folder's `index.html` is a thin redirect, as in `/ncv_tool_v5/`.

| What | Where |
|---|---|
| **Source of truth** (all markup + logic, one file) | [`../narrative-cv-prototype-v6.html`](../narrative-cv-prototype-v6.html) |
| **Stylesheet dependency** | [`../styles.css`](../styles.css) |
| **Live** | https://landedimmigrant-ops.github.io/pathways_website/ncv_tool_v6/ (after the first push) |
| **What changed from V5, and why** | [`../narrative-cv-v6-decisions.md`](../narrative-cv-v6-decisions.md) |
| **The notes it is built from** | [`../ncv-eli-notes-2026-10-06.md`](../ncv-eli-notes-2026-10-06.md) |
| **Related versions** | V5 (frozen, pilot build): [`../ncv_tool_v5/README.md`](../ncv_tool_v5/README.md) · V5x portfolio: [`../ncv_tool_v5x_portfolio/README.md`](../ncv_tool_v5x_portfolio/README.md) |

Storage: draft in `localStorage` under `ncv-v6`, so V5, V5x portfolio and V6 can be tested side by side on one
browser. Feedback rows use `page = ncv-tool-v6`. The worked-example checker (`scripts/ncv-v5-examples.js`)
checks V6 with `--file narrative-cv-prototype-v6.html` (70 cells: the 60 plus ten interdisciplinary).
