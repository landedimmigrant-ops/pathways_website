# Narrative CV tool (V5x portfolio) — developer pointer

Clean address for **V5x portfolio**: the V5 beta plus a portable portfolio that a researcher keeps as a file
and reuses across applications. This folder's `index.html` is a thin redirect, as in `/ncv_tool_v5/`.
Renamed from "V5x" on 2026-10-23, when V6 became the regular line. `/ncv_tool_v5x/` still redirects here.

| What | Where |
|---|---|
| **Source of truth** (one file) | [`../narrative-cv-prototype-v5x-portfolio.html`](../narrative-cv-prototype-v5x-portfolio.html) |
| **What it adds, and why** | [`../narrative-cv-v5x-portfolio-decisions.md`](../narrative-cv-v5x-portfolio-decisions.md) |
| **The idea and the longer plan** | [`../narrative-cv-ideas.md`](../narrative-cv-ideas.md), [`../narrative-cv-portfolio-app-plan.md`](../narrative-cv-portfolio-app-plan.md) |
| **The regular line** | V6: [`../ncv_tool_v6/README.md`](../ncv_tool_v6/README.md). Merge V6 into this file when the portfolio work resumes (steps in the decisions log). |

Storage: draft in `localStorage` under `ncv-v5x`, portfolio working copy under `ncv-v5x-portfolio`,
so V5, V5x portfolio and V6 can be tested side by side. The keys kept their old names on purpose, so
drafts and portfolio working copies already in a browser still open. The portfolio file is read and
written in the browser only. Feedback rows use `page = ncv-tool-v5x`.
