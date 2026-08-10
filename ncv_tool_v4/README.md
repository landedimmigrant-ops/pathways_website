# Narrative CV tool (V4) — developer pointer

This folder is the stable, shareable address of the **Narrative CV tool**:
a client-side tool that helps Concordia researchers draft a Tri-agency
narrative CV (guided prompts, live deterministic checks, draft "structural
read", advisor-consult export).

## Where the tool actually lives

| What | Where |
|---|---|
| **Source of truth** (all markup + logic, one file) | [`../narrative-cv-prototype-v4.html`](../narrative-cv-prototype-v4.html) |
| **Stylesheet dependency** (shared site design system) | [`../styles.css`](../styles.css) |
| **This folder's `index.html`** | thin redirect that gives the tool the clean URL `/ncv_tool_v4/` |
| **Branch** | `integration-prototype` (the deployed branch) |
| **Live tool** | https://landedimmigrant-ops.github.io/pathways_website/ncv_tool_v4/ |

There is no build step, no backend, no API, and no AI service: the tool is
one HTML file of vanilla JS. Researcher drafts persist in `localStorage`
(key `ncv-v4`) on the user's own device — nothing is ever transmitted.

## Testing an embed

The tool can be iframed directly (GitHub Pages sends no frame-blocking
headers):

```html
<iframe
  src="https://landedimmigrant-ops.github.io/pathways_website/ncv_tool_v4/"
  title="Narrative CV tool"
  style="width: 100%; height: 1400px; border: 0;"
  loading="lazy"></iframe>
```

Notes for the embed test:

- **Self-hosting instead:** copy `narrative-cv-prototype-v4.html` together
  with `styles.css` (the file links it relatively) and serve them side by
  side. Nothing else is required.
- **Storage in iframes:** Safari and Chrome partition third-party iframe
  storage per embedding site — drafts persist per top-level site and may be
  treated as ephemeral in Safari private modes. For production this argues
  for hosting the tool on the same origin as the page that embeds it.
- **Height:** content height varies by step (~1,200–2,600 px). Fixed height
  + internal scrolling is fine for a test; an auto-height postMessage hook
  can be added on request.
- The **PROTOTYPE banner** at the top is intentional while the tool is in
  colleague testing; it is one `<div>` and trivially removable for a
  production build.

## Context for the curious

Design rationale: [`../narrative-cv-process-review.md`](../narrative-cv-process-review.md) ·
current findings/backlog: [`../NCV_V4_ANALYSIS_2026-07-21.md`](../NCV_V4_ANALYSIS_2026-07-21.md) ·
what the checks do and deliberately don't do: [`../narrative-cv-evaluation.md`](../narrative-cv-evaluation.md).

Questions: Prem (repo owner).
