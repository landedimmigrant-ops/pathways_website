# Long-Form Layout Template

A reusable layout style for **guides, documents, and other long-form text** on the
Pathways to Impact site. It's the "dynamic" treatment first built for the
**Learn → What is a Narrative CV?** module and since applied to **About → Pathways
Vision**. Instead of a wall of prose, content is broken into numbered sections,
summary cards, card grids, collapsible accordions, and tag rows.

Use this doc when you want a new guide to read like those two pages.

- **Live reference A:** `#learn-module-ncv` — the original (rich, hand-authored)
- **Live reference B:** `#pathways-vision` — markdown-driven, built from `pathways_to_impact.md`

---

## 1. Where it lives in the code

| Thing | Location |
|-------|----------|
| NCV module builder (reference implementation) | `buildNarrativeCV101()` in `app.js` |
| Pathways Vision builder (markdown → layout) | `buildPathwaysVision()` in `app.js` |
| All component styles | `app.js`-adjacent block in `styles.css`, prefixed `.ncv-*` |
| Element helper | `el(tag, className, text)` in `app.js` |

> **Two copies.** The site keeps a working copy at the repo **root** (this is what
> GitHub Pages serves) and a frozen snapshot under **`testing/`**. Any change to
> `app.js` / `styles.css` must be made in **both** `./` and `./testing/` to stay in
> sync. See §6.

The `el()` helper is the only DOM primitive you need:

```js
const el = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined && text !== null) node.textContent = text;
  return node;
};
```

---

## 2. The component palette

Every component below is a plain `.ncv-*` class — no framework, no build step.
Mix and match them inside a section. Burgundy is the brand accent
(`--burgundy: #912338`); body text is `15px` to match the module's scale.

### Numbered section
The backbone. Each top-level chunk of a guide is one numbered section.

```js
const sec = el("div", "ncv-section");
const hdr = el("div", "ncv-section-header");
hdr.appendChild(el("span", "ncv-section-num", "01"));   // burgundy chip
hdr.appendChild(el("h2", null, "Why this matters"));
sec.appendChild(hdr);
// …append body content…
```

### Body paragraph & list
```js
el("p", "ncv-body", "A paragraph of explanation.");

const ul = el("ul", "ncv-list");
["First point", "Second point"].forEach(t => ul.appendChild(el("li", null, t)));
```

### Summary card
A bordered, slightly elevated card for a key takeaway or definition — the thing you
want the reader to remember.

```js
const card = el("div", "ncv-summary-card");
card.appendChild(el("p", null, "The one sentence that captures the section."));
```

### Callout
Left-border accent box for a sharp aside. Default is burgundy; add `--blue` for a
secondary tone.

```js
const callout = el("div", "ncv-callout");          // or "ncv-callout ncv-callout--blue"
callout.appendChild(el("strong", null, "The core shift —"));
callout.appendChild(el("span", null, " what changed because of what you did."));
```

### Card grid (2–4 up)
Auto-filling responsive grid of small cards. Good for "types of X," options, or any
short labelled list that benefits from scanning over reading.

```js
const grid = el("div", "ncv-section-cards");        // add "vision-impact-cards" for wider min-width
const card = el("div", "ncv-section-card");
card.appendChild(el("h4", null, "Academic Impact"));
card.appendChild(el("p", null, "Knowledge development via publications and KMb."));
grid.appendChild(card);
```

### Accordion (collapsible block)
The signature "dynamic" element. Collapsed by default; click to expand. Use for
optional depth — pathway details, FAQs, "read more" context — so the page stays
skimmable.

```js
const makeAccordion = (label, children) => {
  const wrap = el("div", "ncv-expand-block");
  const btn = el("button", "ncv-expand-btn");
  btn.type = "button";
  btn.setAttribute("aria-expanded", "false");
  btn.appendChild(el("span", null, label));
  btn.appendChild(el("span", "ncv-chevron", "▾"));
  const body = el("div", "ncv-expand-body");
  children.forEach(c => body.appendChild(c));
  btn.addEventListener("click", () => {
    const open = btn.getAttribute("aria-expanded") === "true";
    btn.setAttribute("aria-expanded", String(!open));
    body.classList.toggle("is-open", !open);
  });
  wrap.appendChild(btn);
  wrap.appendChild(body);
  return wrap;
};
```

`aria-expanded` drives both the open state and the chevron rotation — keep it.

### Tag row
Pill chips for a flat list of short labels (partners, units, funders, keywords).

```js
const row = el("div", "ncv-tag-row");
["4th Space", "District 3", "Concordia Library"].forEach(t =>
  row.appendChild(el("span", "ncv-tag", t)));
```

### Compare table
Two-or-more-column table for "this vs that" (e.g. TCV vs CV-FRQ). Styled, rounded,
first column emphasized via `.ncv-td-label`.

```js
const table = el("table", "ncv-compare-table");
// thead > tr > th… ; tbody > tr > (td.ncv-td-label, td, …)
```

### Concern / reality rows
Two-column "myth-buster" layout: a concern on the left, the reality on the right.

```js
const row = el("div", "ncv-myth-row");
const concern = el("div", "ncv-myth-box ncv-myth-box--concern");
concern.appendChild(el("div", "ncv-myth-label", "Concern"));
concern.appendChild(el("p", null, "It feels like bragging."));
const reality = el("div", "ncv-myth-box ncv-myth-box--reality");
reality.appendChild(el("div", "ncv-myth-label", "Reality"));
reality.appendChild(el("p", null, "Reviewers need to see your specific role."));
// wrap both in a parent .ncv-myths
```

### Note
Small italic muted line for caveats ("Always check program guidelines…").

```js
el("p", "ncv-note", "Not every competition uses this format yet.");
```

### CTA strip
Full-width burgundy bar with a heading, blurb, and a white button. Put it at the
**end** of a guide to point the reader at the next action.

```js
const cta = el("div", "ncv-cta-strip");
const text = el("div", "ncv-cta-text");
text.appendChild(el("h3", null, "Ready to start drafting?"));
text.appendChild(el("p", null, "Use the guided module to build your outline."));
cta.appendChild(text);
cta.appendChild(el("button", "btn btn-primary", "Start →"));
```

---

## 3. Class reference

| Class | Role |
|-------|------|
| `.ncv-section` | One numbered section wrapper |
| `.ncv-section-header` + `.ncv-section-num` | Header row with burgundy number chip |
| `.ncv-body` | Standard 15px body paragraph |
| `.ncv-list` | Bulleted list at section scale |
| `.ncv-summary-card` | Bordered key-takeaway / definition card |
| `.ncv-callout` / `.ncv-callout--blue` | Left-border accent aside |
| `.ncv-section-cards` + `.ncv-section-card` | Responsive card grid (2–4 up) |
| `.ncv-expand-block` / `-btn` / `-body` + `.ncv-chevron` | Accordion (use `.is-open` on body) |
| `.ncv-tag-row` + `.ncv-tag` | Pill chips |
| `.ncv-compare-table` + `.ncv-td-label` | Styled comparison table |
| `.ncv-myths` / `.ncv-myth-row` / `.ncv-myth-box--concern\|--reality` / `.ncv-myth-label` | Concern vs reality |
| `.ncv-note` | Small italic caveat |
| `.ncv-cta-strip` + `.ncv-cta-text` | Closing call-to-action bar |

Theme tokens: `--burgundy #912338`, `--text #1a1a1a`, `--muted #5a5a5a`,
`--border #e6e6e6`, `--bg #ffffff`.

---

## 4. Markdown → layout convention

`buildPathwaysVision()` is the **reference renderer**: it takes a plain markdown
file and maps its structure onto the palette above. Author new guides to this
convention and the same renderer (or a copy of it) will lay them out.

| In the markdown… | …renders as |
|------------------|-------------|
| `# Title` (single H1) | Document title — **skipped** in the body (the page already prints its own `<h1>`) |
| `## Heading` | A **numbered section** (auto-numbered 01, 02, 03…) |
| `### Sub-heading` | A **sub-section** inside the current numbered section |
| `### 1. Something`, `### 2. …` (numbered) | Each becomes an **accordion** (collapsed by default) |
| A sub-section with **> 2 content blocks** | Collapses into an **accordion** to keep the page skimmable |
| A sub-section with ≤ 2 blocks | Renders inline with a small `.vision-sub-heading` |
| `**Label:** description` bullets under a "framing/types" heading | A **card grid** (`.ncv-section-cards`) — bold = card title, rest = body |
| The definition paragraph ("we define … as …") | A **summary card** |
| A list under "Units / partners / involved" | A **tag row** |
| A "future / vision" list | A **summary card** |
| `**bold**` inline | `<strong>` (supported in paragraphs, list items) |

> These special-case mappings are matched on **heading text** (e.g. "Framing
> Research Impact", "Units currently involved"). To reuse the renderer for a
> different guide, either rename your headings to match, or add a matching branch
> in the builder — see §5. Everything that doesn't match a special case still
> renders cleanly: section → paragraphs/lists, long sub-sections → accordions.

### Copy-paste markdown skeleton

```markdown
# Guide Title

## Introduction
One or two framing paragraphs. The first becomes the section lead.

- A bulleted point
- Another point

## Core Concept
A paragraph.

### Defining <thing>
We define <thing> as …            ← becomes a summary card

### Framing <thing>
- **Type A:** what it covers       ← becomes a card grid
- **Type B:** what it covers
- **Type C:** what it covers

## The Options
### 1. First option                ← becomes an accordion
You might choose this if you want to:
- reason
- reason

### 2. Second option               ← becomes an accordion
…

## Who's Involved
### Units currently involved       ← becomes a tag row
- 4th Space
- District 3
- Concordia Library

## Where This Is Going
### The future we anticipate       ← becomes a summary card
- outcome
- outcome
```

---

## 5. Adding a new long-form guide

1. **Write the content** as a markdown file in the repo root (e.g.
   `my_guide.md`), following the §4 skeleton.
2. **Load it** the way `pathways_to_impact.md` is loaded — fetch the file into a
   `content.*Markdown` field at startup (mirror the `pathwaysVisionMarkdown`
   plumbing in `app.js`).
3. **Build the page**: copy `buildPathwaysVision()` to a new `buildMyGuide()`,
   point it at your markdown field, and register it:
   - `pages.set("my-guide", myGuidePage);`
   - add a nav/link entry and a `navigateTo("my-guide")` handler
   - give the `<section>` `id = "my-guide"` (matches `href="#my-guide"`).
4. **Tune the special cases** (optional): the heading-text matches in §4 are
   Vision-specific. Generalize them, or add `if (/your heading/i.test(subTitle))`
   branches for your content. If you skip this, your guide still renders as clean
   numbered sections + auto-accordions — just without the bespoke cards.
5. **Verify** in the local preview, then ship per §6.

> **Worth doing once:** factor the renderer into a shared
> `renderLongformMarkdown(markdown)` helper so future guides need step 3 only,
> not a copy-paste. Until then, copying `buildPathwaysVision()` is the path.

---

## 6. Shipping checklist (don't skip the cache bump)

The site pins its assets with a version query (`app.js?v=140`). Browsers and the
GitHub Pages CDN cache aggressively (~10 min), so **a content change won't reach
users until the version is bumped.**

1. Edit `app.js` **and** `styles.css` in **both** `./` and `./testing/`.
2. Bump the cache-buster in **both** index files:
   - `index.html` → `?v=NNN` (increment the number)
   - `testing/index.html` → `?v=frozen-YYYY-MM-DD[suffix]`
3. Commit and push to **`integration-prototype`** (the branch GitHub Pages serves;
   feature branches must merge in to go live).
4. Confirm the deploy:
   ```bash
   curl -s "https://landedimmigrant-ops.github.io/pathways_website/index.html?cb=$RANDOM" | grep app.js   # should show new ?v=
   gh api repos/landedimmigrant-ops/pathways_website/pages/builds | head   # latest build "built"
   ```
5. If you still see the old page, hard-refresh (`Cmd+Shift+R`) or open in a private
   window — that's local browser cache, not the deploy.

---

*Created 2026-06-11 alongside the Pathways Vision redesign. Reference
implementations: `buildNarrativeCV101()` and `buildPathwaysVision()` in `app.js`.*
