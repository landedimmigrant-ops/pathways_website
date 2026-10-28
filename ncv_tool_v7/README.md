# Narrative CV tool (V7 beta) — developer pointer

Clean address for **V7 beta**, the redesign of the Narrative CV tool forked from V6 on 2026-10-27 (commit `b14c55d`)
and rebuilt from Prem's V6 walkthrough notes and the V7 mock-ups. This folder's `index.html` is a thin redirect, as in
`/ncv_tool_v6/`.

| What | Where |
|---|---|
| **Source of truth** (all markup + logic, one file) | [`../narrative-cv-prototype-v7.html`](../narrative-cv-prototype-v7.html) |
| **Stylesheet dependency** | [`../styles.css`](../styles.css) (V7's own components are in the file's `<style>` block, prefixed `v7-`) |
| **What changed from V6, and why** | [`../narrative-cv-v7-decisions.md`](../narrative-cv-v7-decisions.md) (DECIDED vs INFERRED, Overrides slot) |
| **The notes it is built from** | [`../ncv-v6-flow-map/ncv-v6-walkthrough-notes.md`](../ncv-v6-flow-map/ncv-v6-walkthrough-notes.md) |
| **Design** | [`../ncv-v7-design/`](../ncv-v7-design/) (mock-ups, design notes, screenshots) |
| **Open questions for Eli (not sent)** | [`../ncv-v6-flow-map/ncv-v6-questions-for-eli.md`](../ncv-v6-flow-map/ncv-v6-questions-for-eli.md) |
| **Headless test** | `node ncv_tool_v7/test-v7.js` (Node 22+, Google Chrome; no dependencies) |
| **Test fixture** (made-up V6 draft) | [`fixtures/v6-draft.json`](fixtures/v6-draft.json) |
| **Related versions** | V6 (frozen reference): [`../ncv_tool_v6/README.md`](../ncv_tool_v6/README.md) · V5 (frozen): [`../ncv_tool_v5/README.md`](../ncv_tool_v5/README.md) |

The flow: start page (New draft or Continue draft) → **Set up your profile** → **My application** (Contributions,
Mentorship, Personal statement) → **Draft** (Review, with the order of contributions; Export).

Storage: the draft lives in `localStorage` under `ncv-v7`, so V5, V6 and V7 can be tested side by side in one
browser. On a first visit, a V6 draft in the same browser (`ncv-v6`) is offered once; V6's copy is never changed.
**Save draft** writes a JSON draft file (`format: "pathways-narrative-cv-draft"`, `version: 1`) that **Continue draft**
reopens. The Feedback step is switched off (`FEEDBACK_ON = false`), so the tool makes no network request; researchers
are asked to email impact@concordia.ca. Every guide link opens the official guide on concordia.ca.

Trials Prem decides on before the researcher test: `V7_TRIALS.railMetrics` (numbers under each rail item) and
`V7_TRIALS.paragraphStrip` (the "Your paragraph so far" strip).

The V5x portfolio test is not part of this line; the portfolio returns later as a separate feature.
