# Narrative CV tool (V5x portfolio test) — developer pointer

Clean address for **V5x**: the V5 beta plus a portable portfolio that a researcher keeps as a file
and reuses across applications. This folder's `index.html` is a thin redirect, as in `/ncv_tool_v5/`.

| What | Where |
|---|---|
| **Source of truth** (one file) | [`../narrative-cv-prototype-v5x.html`](../narrative-cv-prototype-v5x.html) |
| **What V5x adds, and why** | [`../narrative-cv-v5x-decisions.md`](../narrative-cv-v5x-decisions.md) |
| **The idea and the longer plan** | [`../narrative-cv-ideas.md`](../narrative-cv-ideas.md), [`../narrative-cv-portfolio-app-plan.md`](../narrative-cv-portfolio-app-plan.md) |
| **Everything else** (funder rules, examples, checks) | same as V5; see [`../ncv_tool_v5/README.md`](../ncv_tool_v5/README.md) |

Storage: draft in `localStorage` under `ncv-v5x`, portfolio working copy under `ncv-v5x-portfolio`,
so V5 and V5x can be tested side by side. The portfolio file is read and written in the browser
only. Feedback rows use `page = ncv-tool-v5x`.
