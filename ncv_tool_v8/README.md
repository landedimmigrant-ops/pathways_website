# Narrative CV tool (V8 beta) — developer pointer

Clean address for **V8 beta**, forked on 2026-11-02 from V7 as it stood after the 20-round audit loop (commit `ada6b7f`).
V8 holds every fix from the loop; new work goes into V8. V7 was put back to the version before the loop (commit `f852933`)
and stays frozen as a reference.
This folder's `index.html` is a thin redirect.

| What | Where |
|---|---|
| **Source of truth** (all markup + logic, one file) | [`../narrative-cv-prototype-v8.html`](../narrative-cv-prototype-v8.html) |
| **Stylesheet dependency** | [`../styles.css`](../styles.css) (the tool's own components keep the `v7-` prefix) |
| **Headless test** | `node ncv_tool_v8/test-v8.js` (Node 22+, Google Chrome; no dependencies; about three minutes) |
| **Test fixture** (made-up V6 draft) | [`../ncv_tool_v7/fixtures/v6-draft.json`](../ncv_tool_v7/fixtures/v6-draft.json) |
| **Decisions so far** (DECIDED vs INFERRED) | [`../narrative-cv-v7-decisions.md`](../narrative-cv-v7-decisions.md) |
| **Audit loop log and findings** | [`../ncv_tool_v7/audit-loop-2026-10-31.md`](../ncv_tool_v7/audit-loop-2026-10-31.md) |
| **Open questions for Prem** | [`../ncv_tool_v7/questions-for-prem.md`](../ncv_tool_v7/questions-for-prem.md) |
| **Related versions** | V7 (frozen, the version before the audit loop): [`../ncv_tool_v7/README.md`](../ncv_tool_v7/README.md) |

Storage: the draft lives in `localStorage` under `ncv-v8`, so V7 and V8 can be tested side by side in one browser.
On a first visit, a V7 draft in the same browser (`ncv-v7`) is offered once; V7's copy is never changed. Draft files
saved from V7 open in V8 with **Continue draft**.
