# Part colours without the edge stripe: design review

2026-11-26 · designer review for Prem · tool version reviewed: V9.4 (`narrative-cv-prototype-v9.html`, read-only)
Mock-up: `ncv_tool_v9/design/accent-mockup.html` · screenshots: `ncv_tool_v9/design/shots/`

## The request

Prem sent a screenshot of the part-name pill "What already changed": a 10px-rounded pill, pale coral tint, with a 3px coral stripe on its left edge that bends round the rounded corner. He asked that these conform to the Pathways website, which does not use "those highlighted angles", across the whole website, with a designer review.

## Recommendation in brief

Show a part's colour as a **part box**: the part's pale tint as the ground, a 1px line of the part's colour all round, and 2px corners, with the part's name in dark text. No part colour is drawn on one edge of a shape, in the tool or on the site. Gold takes the darker line already used for its pencil (#8a6200), so every part's line reaches 3:1 on white and on its own tint.

The one alternative worth weighing: keep a stripe, but straight, on 2px corners, as the live landing page's pathway list does (section (a)). It applies to every element if chosen.

---

## (a) What concordia.ca does

### Method

- Fetched the live HTML of six Pathways pages on 26 November 2026: the landing page (`/research/for-researchers/pathways-to-impact.html`), Explore, Explore › Pathways, Learn, Learn › Tools, and About › Vision.
- Read Concordia's shared stylesheet (`/etc/designs/concordia/concordia-master-clientlibs.min.69b3cb1e….css`, 468 KB, 2,924 rules) and the page-level `<style>` blocks of each page.
- Checked against the CSS already extracted in `ncv-guide-review/aem.css` and `ncv-guide-review/src/aem-used.css`.
- A headless screenshot of the landing page came out dimmed by an overlay and was not used. The evidence below is the CSS and markup; the mock-up's first section recreates the relevant pieces from those values.

### Corners

| Token (Concordia Design System, `--cds-border-radius-*`) | Value | Where it is used |
|---|---|---|
| `none` | 0 | form fields (`.form-control`, `.form-select`), alerts (`.alert`), 17 other rules |
| `sm` | 2px | the default card (`.c-card__container`), buttons (`.btn`, `.btn-burgundy-arrow`, `.btn-ghost-filled`); every component of the landing page's Pathways tour |
| `md` | 4px | cards on the Pathways pages (page CSS overrides `.c-card__container` to `md` with `1px solid rgb(0 0 0 / 10%)`) |
| `full` | 9999px | neutral chips only: the tour's partner chips, the header badge, the Vision page's muted pills (`.c-pills__pill--muted-light`), filter pills (`.c-pills__pill`, 20px) |

Concordia's corners are 0 to 4px on cards, buttons, fields and callouts. Fully rounded shapes are chips and filters.

### Colour on labels, cards and callouts

- **The six part accents are Concordia's own colour tokens:** `--cds-color-yellow` #e5a712, `burgundy` #912338, `blue` #0072a8, `green` #508212, `orange` #da3a16, `mauve` #573996. Each has a `-light` tint (#fff3d3, #e9d3d7, #d3e1e9, #dfeccf, #f9cdc3, #dcd6e8) and a `-dark` shade (yellow-dark #6a4606). The tool's tints are close to these and not identical; that is noted, and no change is proposed here.
- **One-sided coloured lines in the shared stylesheet:** six rules, all in navigation (the current page in the side menu: `border-left: 2px solid burgundy` with a 6.3% burgundy wash; second-level menu items and the anchor menu: 2px grey). No card, callout, alert, quote or label in the shared stylesheet has one.
- **Callouts and quotes:** `.alert` has 0 corners and no border; `blockquote` has a 1px border all round.
- **Pathway cards (Explore › Pathways):** seven `c-card__container` cards, each filled with the pathway's colour (`background-color: #912338`, `#DB0272`, `#DA3A16`, `#573996`, `#0072A8`, `#E5A712` with a black title, `#8CC63E`), 4px corners, no stripe. The prototype's equivalent, `.pathway-card`, has an 8px stripe on 8px corners.
- **"Impact can be…" (landing page, `.c-pti-tour__trait`):** a box with `1px solid var(--cds-border-color-inverse-subtler)`, 2px corners, a 10% white ground. The prototype's equivalent, `.s2-traits`, draws a 3px burgundy stripe on the list. The port to concordia.ca dropped the stripe.
- **Seven pathways list (landing page, `.c-pti-tour__pathway`):** a white row, 2px corners, `border-left: var(--cds-border-width-04) solid var(--c-pti-pathway-colour)` (4px), beside a 26px square mark (`.c-pti-tour__pathway-mark`, 2px corners, the pathway's soft tint as ground, the icon in the pathway colour). Gold here is #b07d00. **This is the only one-sided coloured line on the six Pathways pages.** The prototype's equivalent, `.pw`, has a 4px stripe on 8px corners; the port kept the stripe and squared the corners, so the line is straight.
- **Scrolling tour on a desktop (`.c-pti-tour.is-scrolly .c-pti-tour__beat`):** a 2px grey line down the left of the steps, burgundy on the current step. It marks progress through a sequence, as the side menu does.
- **Explore, Learn, Learn › Tools, About › Vision:** no `border-left` rule at all. The prototype's Vision page draws 4px stripes on its pathway accordions (`.ncv-expand-block[data-pathway]`); the live Vision page has none.
- **A flat tinted label exists in the Pathways CSS** (`.pathways-featured .c-card__subtitle`: green-light ground, green-dark text, fully rounded, uppercase), shipped with the landing page; none of the six pages checked uses it in its markup.

**In short:** concordia.ca never bends a coloured edge round a rounded corner. Colour is carried by a filled card, a square mark, or a 1px line all round. Where the Pathways pages keep a one-sided line (the pathway list), the corners are 2px and the line is straight.

---

## (b) Inventory: the tool (V9.4)

Line numbers are in `narrative-cv-prototype-v9.html`.

### Coloured stripes, on screen today

| # | Element | Selector and lines | What it draws | Where to see it |
|---|---|---|---|---|
| T1 | Part name above a question (the screenshot) | `.v9-pill`, `.v9-pill-*`, 469–480; built at 4860 | tint, `box-shadow: inset 3px 0 0` accent, **10px corners** | Contributions, open a card: above each question. Personal statement: above each field. |
| T2 | Sentences of the finished example | `.built .v7-seg-*`, 376–383; built in `exampleBox`, 4819–4836 | tint, inset 3px stripe, **4px corners** | Contributions, under a card: "See a finished example". |
| T3 | Legend of the finished example | `.v7-legend .v7-seg-*` (same rules), 384–386 | tint, inset 3px stripe, **10px corners** | Same box, under the passage. |
| T4 | Part squares on a folded contribution | `.v8-mini i.on`, 875–877; built at 5437–5441 | 14×12, tint, inset 3px stripe, 2px corners | Contributions, a closed card, right of the title. Hidden on a phone (694). |
| T5 | Legend on Review | `.v8-leg i` on `.v7-wb-leg i`, 874 and 931; built at 7077–7078 | 12px square, grey border, tint, inset 3px stripe, 3px corners | Review, tab "Edit what already changed", above the bars. |
| T6 | Blocks of the word bar | `.v8-bar .v8-eb-block`, 966–976; built at 7095 | tint, grey 1px border, `inset 4px 0 0` accent, 2px corners | Review, tab "Edit what already changed", one bar per contribution. |

### Pending

| # | Element | File | What it draws |
|---|---|---|---|
| T7 | WB-1 phone layout, option A (and B) | `ncv_tool_v9/mock/word-bar-phone.html`: `.seg` (18), `.row` (21), `.ed` (26), `.chip` (31), legend `i.style.borderLeft` (JS) | `border-left: 4px solid` accent on rows, blocks, chips and on the open editor; 2–3px corners |

The open editor in T7 has a coloured bar down its side, which DESIGN.md §3 already rules out ("No coloured bar down the side", Prem 2026-11-18).

### Dormant (in the file, on no screen)

| # | Element | Lines | Why dormant |
|---|---|---|---|
| T8 | Skeleton view of the V4 example | `.v4-skeleton-on .seg-*` 154–159 (`border-left: 3px solid`, 4px corners), `.v4-skel-chip` 162 (10px pill); `renderExemplarBox` 3963–4005 | `renderExemplarBox` is never called. |
| T9 | "Next:" note after a structural read | `narrative-funder-note`, 4342; stripe from `styles.css` 4791 | The "xray" step is remapped to Contributions (`STEP_REMAP`, 2870). |
| — | Small solid part squares | `.v7-jd`, `.v7-q-dot`, 443–445 and 468 | No script uses these classes. |

### Already outlined all round (kept, touched only for consistency)

| # | Element | Lines | Today |
|---|---|---|---|
| T10 | The box a block opens | `.v7-wb-box.v8-ed`, 939; painted at 7111 | 1px accent line all round, no side bar, **6px corners** |
| T11 | Text box under a named question | `.v7-f[class*="v9-b-"] .v7-box`, 481–485 | 1px accent line, 2px and a ring when open; gold line **#b07d00**, while the pencil and block lines use `--pi` **#8a6200** |

### Not affected

`.v7-dots` (progress squares), `.v8-tag` (neutral 10px chips), `.v8-mark` (toggle chips), `.v9-flag-mark` (8px burgundy circle) and the Word export's `.evbox` (7851: a 2px grey line on a square evidence block in the exported document) carry no part colour on an edge of a rounded shape.

### Findings beside the request

1. **Gold stripes fail 3:1.** Every stripe in T1–T6 draws gold with `--j-stakes` or `--pa` (#e5a712): 1.7:1 against the gold tint and 2.1:1 on white. The text boxes (T11) use #b07d00, which passes on white (3.6:1) and fails on the gold tint (2.9:1).
2. **Stripes drawn with `box-shadow` vanish in forced-colours mode** (Windows High Contrast removes box shadows). T1–T6 lose their colour mark there. A border stays visible as an outline.
3. **The code comment at 7066–7068 says the stripe follows "the Pathways site's … pathway cards".** That is the prototype's `.pathway-card` (`styles.css` 1715). concordia.ca's pathway cards are solid fills.
4. **The example's sentences say which part they are by colour alone.** The legend names the parts in text; a screen reader hears the passage with no part names. This predates the request and is noted for a later fix (a visually hidden part name at the start of each sentence would do it).

---

## (c) Recommended treatment

### The part box

One look for any shape that carries a part's colour, at any size:

```css
background: var(--pt);              /* the part's tint */
border: 1px solid var(--pi);        /* the part's line colour, all round */
border-radius: 2px;                 /* Concordia's --cds-border-radius-sm */
color: #1a1a1a;
```

`--pi` already exists (set by `partPaint`): the accent for five parts and the neutral one, #8a6200 for gold. No new token is needed. The stripe rules (`box-shadow: inset 3px 0 0`, `inset 4px 0 0`, `border-left: 4px`) are removed.

### Element by element

| # | Element | Recommended | Alternative (only where it matters) | Why |
|---|---|---|---|---|
| T1 | Part name above a question | **Part tag:** the part box around the name, 0.78rem, weight 600, padding 1px 8px. | **Straight stripe:** 2px corners, `inset 3px 0 0 var(--pi)`, no border, as the landing page's pathway list. | The pill keeps its job and its place (row 12); the bent stripe goes. Matches the trait boxes and cards on concordia.ca. |
| T2 | Sentences of the finished example | The part box, inline, with `box-decoration-break: clone` and padding 0 3px, so each line of a wrapped sentence keeps its box. | — | The 1px line carries the accent where the tints alone cannot (Your role and What already changed tints are 1.07:1 apart). |
| T3 | Legend of the example | Part tags, the same as T1. | — | The legend and the question labels become one object with one look. |
| T4 | Folded contribution squares | Written: the part box at 14×12. Not written yet: white with a dashed grey line (unchanged). | — | Same box as the legend and blocks, at small size. |
| T5 | Review legend | A 12px part box before each name. | — | The legend square is the block in small, so the chart needs no explaining. |
| T6 | Word bar blocks | The part box. Open, hover, focus: the line goes to 2px (`inset 0 0 0 1px var(--pi)`, as now) and the pencil sits in the accent circle (as now). Empty: white, dashed grey (unchanged). | **Leave as now.** The blocks already have 2px corners, so their stripe is straight, like the landing page's pathway list. | With T1–T5 changed, a striped block would be the only stripe left in the tool (DESIGN.md §1.2, one object one look). |
| T7 | WB-1 phone rows (pending) | Each row is an editable box (white, 1px grey line, pencil, 2px corners, at least 44px) that names its part. Under the name, a 10px part box of proportional width (one scale for every contribution) and "N words". Open: the row takes the part's line at 2px and the pencil circle; the editor under it has its line all round and 2px corners. | If the alternative is chosen: option A as drawn, with 2px corners and the editor's side bar removed. | No text sits across the end of a bar; the part box stays the one look; the editor follows DESIGN.md §3. |
| T8 | Skeleton view (dormant) | Delete `renderExemplarBox` and its CSS (147–165). If it is kept, as T2. | — | Dead code that still carries the old look. |
| T9 | Funder note (dormant) | Follows the site decision for `.narrative-funder-note` (section (d)). | — | It is a site rule. |
| T10 | Box a block opens | Keep the 1px line all round; corners 6px → 2px. | — | Same corners as the block that opens it. |
| T11 | Text box under a named question | Keep the outline. Gold line #b07d00 → `--pi` (#8a6200), so the tool has one gold line. Corners: see question Q3. | — | #8a6200 passes 3:1 on white and on the gold tint. |

If Prem picks the alternative, it applies to every row above: 2px corners everywhere, a straight 3px stripe in `--pi` on tags, example sentences, legends and squares, blocks unchanged, and the editor and text boxes as recommended.

### Checks on the recommendation

- **Contrast of the line** (the 1px line of a part box):

  | Part | Line | On white | On its tint |
  |---|---|---|---|
  | The problem or question | #8a6200 | 5.5:1 | 4.4:1 |
  | Your role | #912338 | 8.4:1 | 5.7:1 |
  | What you did | #0072a8 | 5.3:1 | 3.7:1 |
  | What resulted | #508212 | 4.6:1 | 3.4:1 |
  | What already changed | #da3a16 | 4.6:1 | 3.3:1 |
  | What could change | #573996 | 8.6:1 | 6.2:1 |
  | A real use case (optional) | #6b6b6b | 5.3:1 | 4.1:1 |

  Text #1a1a1a on every tint: 11.8:1 or more. White on the pencil circle: 4.6:1 or more, dark ink on gold (unchanged).
- **Colour is never the only carrier:** the name is in text on T1, T3, T5 and T7; each block keeps its `aria-label` and `title` with the part's name; T4 keeps its `title` per square. T2 is the existing gap noted above.
- **Targets:** blocks stay 36px (44px on a phone); phone rows are 48px in the mock-up; tags are not interactive.
- **Reflow:** the mock-up has no horizontal scroll at 320px (measured `scrollWidth` 320).
- **Forced colours:** a 1px border survives, so each part box keeps an outline.
- **Reduced motion:** no new motion.

### Files that would change if Prem approves (not changed here)

- `narrative-cv-prototype-v9.html`: lines 147–165, 376–386, 469–485, 874–877, 931, 939, 966–976; the comment at 7066–7068.
- `ncv_tool_v8/DESIGN.md` §3, "Block variant": "the accent as a stripe on the left edge" becomes the part box.
- `ncv_tool_v9/README.md`, Batch 4 (row 12) note on the pill's edge and the gold #b07d00.
- `ncv_tool_v9/test-v9.js`: the V8.18 check at 382 (expects an orange and a gold stripe in `boxShadow`) and the Row 12 checks near 2585–2592 (expect `edge: boxShadow !== 'none'` and gold #b07d00).
- `ncv_tool_v9/mock/word-bar-phone.html` (WB-1).

---

## (d) The prototype site (`styles.css`), kept separate

Prem asked for "the entire website"; scope is his call (Q2). The site's stylesheet is also loaded by the tool (`styles.css?v=131`), but none of the rules below appears on a V9 screen.

### Stripe on a rounded shape (14 rules in use)

| Line | Selector | Stripe | Corners | Where (app.js) | Live equivalent on concordia.ca |
|---|---|---|---|---|---|
| 1715, 1768–1792 | `.pathway-card` | 8px, pathway colour | 8px | Explore › Pathways grid (4787) | Solid-filled cards, 4px corners |
| 5464; inline 1625–1652 | `.pw` | 4px, pathway colour | 8px | Home, slide "Seven pathways" (`buildHome`) | `.c-pti-tour__pathway`: straight 4px line, 2px corners, square mark |
| 4391, 4448–4461 | `.ncv-expand-block[data-pathway]` | 4px, pathway colour | 8px | Vision page accordions (`makeExpand`, 2221) | None on the live Vision page |
| 1956 | `.pathway-dev-notice` | 4px, burgundy or set | 10px | Pathway detail, "in development" notice (4919) | — |
| 2179 | `.research-module-context` | 3px, burgundy | 0 6px 6px 0 | Research viewer, module context strip (5301) | — |
| 3044 | `.modal-provider` | 3px, burgundy | 6px | Service window, provider block (6370) | — |
| 3095 | `.modal-pullquote` | 4px, accent | 0 6px 6px 0 | Service window, quotation (6419) | — |
| 454 | `.booking-notice` | 3px, gold #d4a843 | 4px | Booking window (6113) | — |
| 3170 | `.booking-waitlist-banner` | 3px, #c44b3d | 4px | Booking window (6131) | — |
| 3755 | `.recommended-section` | 4px, pathway thread colour | 6px | Services, "Recommended for you" (5523) | — |
| 4287–4299 | `.ncv-callout`, `.ncv-callout--blue` | 3px, burgundy or #1a5276 | 0 8px 8px 0 | Long-form guides (`makeCallout`, 2275) | — |
| 4791 | `.narrative-funder-note` | 3px, burgundy | 0 6px 6px 0 | Site's narrative CV builder, step 1 (3556) | — |
| 5063 | `.pro-tip-banner` | 4px, gold #e5a712 | 0 6px 6px 0 | Site's narrative CV builder (3781) | — |
| 5104 | `.ps-preview` | 3px, burgundy | 0 8px 8px 0 | Site's narrative CV builder, statement step (3907) | — |

### Stripe on a square shape (3 rules in use)

These already look like the landing page's straight line. They change only if Prem wants no stripes at all (Q1).

| Line | Selector | Stripe | Corners | Where (app.js) | Live equivalent |
|---|---|---|---|---|---|
| 423 | `.modal-external-note` | 3px, gold #d4a843 | 2px | Service window note (6447) | — |
| 3782 | `.context-bar` | 4px, pathway thread colour | 0 | Context bar under the header (1423) | — |
| 5412 | `.s2-traits` | 3px, burgundy | 0 | Home, slide "Impact can be…" (1578) | `.c-pti-tour__trait`: boxes with a 1px line, no stripe |

### Unused (2 rules)

`.vision-definition` (2876) and `.learn-cta` (3531) appear in no script or page. Delete.

### Not a stripe

`.accordion-summary::before`, `.about-partner-summary::before` (2746): a 7px `border-left` with transparent top and bottom borders draws a triangle.

### Copies that follow `styles.css`

- `narrative-cv-guide-standalone.html` lines 62–63 inline `.ncv-callout`.
- `pathways_migration_june_2026/*.html` inline `styles.css` through `_regenerate.js`; regenerate after any change.
- `LONGFORM_LAYOUT_TEMPLATE.md` documents the callout and the expand block as the house long-form pattern.

### Suggested treatment for the site

- **Pathway-coloured cards and rows** follow the live page that replaced each one: `.pathway-card` → a filled card as on Explore › Pathways; `.pw` → the landing page's row; `.ncv-expand-block[data-pathway]` → no stripe, as on the live Vision page (the pathway colour can move to a square mark beside the title, as `.c-pti-tour__pathway-mark` does); `.s2-traits` → boxes with a 1px line.
- **Notes, callouts and quotations** (the other ten): the part box in burgundy or the note's own colour (tint ground, 1px line all round, 2px corners), or the tint alone with no line, as Concordia's alerts.

---

## (e) Open questions for Prem

1. **Drop the stripe, or straighten it?** Recommended: no stripe anywhere, colour as a part box. Alternative: keep a straight stripe on 2px corners, as the landing page's pathway list on concordia.ca does. The mock-up shows both on the pill.
2. **Site scope.** Change the 14 rounded site instances now, with the tool, or after the tool? And the 3 square ones (only if the answer to 1 is "drop")?
3. **Corners in general.** concordia.ca uses 0 on fields, 2px on buttons and cards, and 4px on Pathways cards. The tool uses 6–10px on cards, buttons and text boxes, and the site 4–10px. This review squares only the shapes that carry a part colour. Square every corner as well?
