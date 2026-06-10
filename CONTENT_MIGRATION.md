# Content Migration Reference

**Purpose:** a repeatable way to take a piece of Learn content out of the Pathways SPA and hand it to the Concordia web team as a **single, self-contained HTML file** they can evaluate for migration into concordia.ca (Adobe Experience Manager / AEM).

First used for the **Narrative CV guide** (June 2026) as a content-migration test. Treat that as the reference implementation; this doc generalises the pattern.

---

## Why a self-contained HTML file

The web team needs to assess whether our content + layout survives the move to their CMS. The most useful artifact for that is **one `.html` file that renders identically anywhere** — opened from disk, attached to an email, or dropped into an AEM authoring preview — with no build step and no dependency on our app.

So the migration artifact is deliberately:

- **Static** — the layout is baked into HTML, not built at runtime by `app.js`.
- **Self-contained** — all CSS is inlined; no `app.js` / `data.js` / external `styles.css`.
- **Honest to the source** — content is pulled straight from the same file the live site reads, so there's zero retyping and accents/special characters stay exact.

The only external reference is the **Inter web font** (with a system-font fallback), which the web team can keep, swap, or drop without affecting structure.

---

## The pattern

```
content/learn/<guide>.md        ← source of truth (slot-labelled markdown)
        │
        ▼
scripts/build-<guide>-standalone.js   ← generator (parses slots, emits HTML)
        │
        ▼
<guide>-standalone.html         ← the deliverable you send
```

Three properties make this work and are worth preserving in any future migration:

1. **One source of truth.** The live site and the standalone file read the *same* markdown. The generator parses it with the *same* slot logic as the app (`parseSlotMarkdown()` in `app.js`), so the two never drift.
2. **Layout mirrors the app.** The generator reproduces the exact DOM the app builds, and inlines the exact CSS rules the app uses. What the team sees is what's live.
3. **Loud on missing content.** The generator throws if a slot referenced by the layout is absent from the markdown — for a migration test we want missing content to fail visibly, not be silently replaced by a hardcoded default.

---

## Reference implementation: Narrative CV guide

| Piece | File |
| --- | --- |
| Source content (slot-labelled) | `content/learn/narrative-cv-guide.md` |
| Generator | `scripts/build-ncv-standalone.js` |
| Deliverable (send this) | `narrative-cv-guide-standalone.html` |
| Live layout it mirrors | `app.js` → `buildNarrativeCV101()` |
| Slot parser it reuses | `app.js` → `parseSlotMarkdown()` |
| CSS it inlines | `styles.css` → `.ncv-*` rules (+ base, header, `.btn`) |

**Regenerate after editing the guide text:**

```bash
node scripts/build-ncv-standalone.js
# → Wrote narrative-cv-guide-standalone.html (~28 KB) from 65 slots.
```

Then re-send the file (or re-push if it's being shared via a link).

### How the source markdown is structured

Each `## slot-label` heading marks a slot; the prose underneath is the content. The labels (e.g. `s1.title`, `s3.table`, `s5.myths`) are how the renderer finds each piece — **don't rename them**, just edit the text. Lists use `- bullet` lines; tables and 2-column structures use pipe-separated rows. The same convention works in a Google Doc (each label as a Heading 2), which is how non-technical editors can maintain content.

---

## Anatomy of the output file

A generated standalone page contains, in order:

- `<head>` — meta tags, the Inter font `<link>`, and one inline `<style>` block (the curated CSS subset).
- A minimal **Concordia-branded header** (brand + "Office of Research" tagline) for context.
- The **guide content** — page title + the full module (sections, accordions, tables, callouts, concern/reality boxes, CTA strip).
- A minimal **footer** with the `impact@concordia.ca` contact.
- One small inline `<script>` (~10 lines) that toggles the accordions.

Everything except the font is in that one file.

---

## Migrating a *different* guide

The pattern is identical, but note the current state: **only the Narrative CV guide has a slot-based markdown source + a layout builder today.** The other Learn modules (`disciplines`, `evidence`, `plan-early`) are placeholders in `app.js`, and `myths` is rendered from `data.js`, not a slot file.

To produce a standalone page for a new guide:

1. **Author the content** as a slot-labelled `content/learn/<guide>.md` (same convention as the NCV guide).
2. **Build the in-app layout** (`build<Guide>()` in `app.js`) and its `.<guide>-*` CSS — or, if it's purely for migration and won't live in the SPA, skip straight to step 3.
3. **Copy `scripts/build-ncv-standalone.js`** to `scripts/build-<guide>-standalone.js` and adapt:
   - the `buildBody()` function to mirror that guide's DOM structure, and
   - the `CSS` constant to the rules that guide uses.
4. **Run it** and verify the output in a browser (desktop + mobile) before handing it over.

> If we end up migrating many guides, the next step is a *generic* renderer driven by a small layout schema instead of a per-guide builder. Not needed yet — revisit if the count grows past a handful.

---

## Handoff checklist (Concordia / AEM considerations)

Things to tell the web team — and to keep in mind — when sending a migration sample. These reflect the live concordia.ca environment as of the 2026-05-19 kickoff:

- [ ] **Bilingual.** Every public Concordia page has a French counterpart (the initiative's FR name is *Vecteurs de rayonnement*). A migrated guide will need a French version; the slot-markdown pattern supports a parallel `*-fr.md` cleanly.
- [ ] **Accordions.** The standalone file uses ~10 lines of inline JS to expand/collapse. AEM may prefer its own accordion component or native `<details>/<summary>` — the structure is easy to swap.
- [ ] **Placeholder controls.** Any in-app CTA (e.g. "Start Step 2 →") that routes within the SPA is a visual placeholder in the standalone file; it has no destination on its own.
- [ ] **Accessibility.** Concordia tests to **SGQRI 008 2.0** (Government of Quebec) with tools like Siteimprove / WAVE. The markup is semantic (headings, tables, buttons with `aria-expanded`), but expect their a11y pass to have opinions.
- [ ] **Forms.** Our prototype uses Formspree; Concordia runs **Microsoft Forms (Office 365)**. Not relevant to a static guide, but relevant if a migrated page contains a form.
- [ ] **Fonts/brand.** We use Inter + Concordia burgundy (`#912338`). Confirm whether their templates impose their own type/colour tokens.

---

## Quick reference

```bash
# Regenerate the NCV migration sample
node scripts/build-ncv-standalone.js

# Preview locally (the SPA dev server also serves the standalone file)
python3 -m http.server 8000
# → http://localhost:8000/narrative-cv-guide-standalone.html
```

**Deliverable to send:** the single `*-standalone.html` file. Nothing else is required for it to render.
