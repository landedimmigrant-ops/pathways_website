# Part box on the prototype site: test findings

2026-11-26 · test analysis, read-only on the site · proposal tested: `ncv_tool_v9/design/accent-review-2026-11-26.md` (c) and (d)

Nothing in `styles.css`, `app.js`, `index.html` or `data.js` was changed. The part box was injected as a `<style>` into the running page, one element at a time, and measured before and after.

## Method

- `part-box-test.js` (this folder) serves the site folder on a local port and starts headless Chrome on CDP port 9380, with its own temp profile. For each element it:
  - opens the screen the element renders on, at 1280 px and at 320 px (mobile emulation, DPR 2);
  - takes a screenshot and measures, injects the part box, then takes a screenshot and measures again;
  - at 1280 px, repeats both states under `forced-colors: active`;
  - hovers the two interactive card types.
- **The part box injected:** `background: <ground> !important; border: 1px solid <line> !important; border-radius: 2px !important; color: #1a1a1a !important;`.
  - Ground: the element's own tint where it has one; otherwise 15% of the stripe colour over white.
  - Line: the stripe colour, with #8a6200 for #e5a712 and #d4a843.
  - Communications uses `#b07d00` as its stripe today, which is not on the gold list, so it was tested as #b07d00.
- **Measured:**
  - every text node's contrast on its composited ground, including opacity and SVG icon strokes, with axe-core `color-contrast` as a cross-check;
  - each side of the border, against the page behind and against the element's own ground;
  - size, wrapped lines, overflow and page scroll width;
  - bordered ancestors, children and siblings, and the gap to each;
  - the element's shape beside the controls on the same screen;
  - borders under forced colours.
- **Outputs:**
  - `results.json` holds every number. `summarize.js` prints them by case.
  - Screenshots are in `shots/`, named `<element>-<width>-before|after.png`. Variants: `-forced-before|after` (1280 only) and `-hover-before|after` (pathway cards, `.pw`). `ncv-callout` has `-1` (burgundy) and `-2` (blue).
- **Run:** `node ncv_tool_v9/design/part-box-test-site/part-box-test.js`. It takes about 10 minutes and needs the network for the Google Sheet. `PB_ONLY=id,id` reruns some cases and merges them into `results.json`.

### Screens that cannot be reached as the site stands

| Element | Why | How it was tested |
|---|---|---|
| `.context-bar`, `.recommended-section` | `setContextStage` and `setContextPathway` (app.js 1440–1456) are never called, so both stay `hidden`. | Forced visible in the page. |
| `.pro-tip-banner`, `.ps-preview`, and the builder's own `.narrative-funder-note` | `buildNarrativeModule` is not mounted: `#tools-narrative` uses `buildNarrativeV4Embed` (app.js 6746–6748). | Synthetic: the markup was rebuilt with the builder's classes inside the live page shell. |
| `.booking-notice`, `.booking-waitlist-banner` | Every approved sheet row has a `bookingUrl`, so the in-page booking window never opens. The workshops tab has no `status` column. | The sheet CSV was rewritten in the page, in memory. |

`.narrative-funder-note` is live: the V4 prototype in the `#tools-narrative` iframe loads `styles.css?v=131`. It was tested on `narrative-cv-prototype-v4.html` at the Personal statement step.

**Pre-existing, not caused by the part box:** at 320 px every page of the site lays out at 362 px, because the Explore tab row and `.footer-prompt` overflow. The page's scroll width was the same before and after for every element.

## Findings

Severity:
- **blocks:** the part box introduces a WCAG 2.x AA failure.
- **should fix:** a misreading or a visible defect.
- **cosmetic**
- **none**

| Element | Screen | Issue | Severity | Evidence |
|---|---|---|---|---|
| `.pathway-card` | Explore › Pathways | Pathway name labels (13 px bold, coloured) fall below 4.5:1 on the new tint. | **blocks** | Community 4.93 → **3.79**; Innovation 4.57 → **3.66**; Policy 5.29 → **4.28**; Research Creation 4.62 → **3.82**; Communications 3.63 → 3.08 (already failing). axe failures 1 → 5. |
| `.pathway-card` | same | Contradicts concordia.ca, where the cards are filled with the pathway colour and have 4 px corners. | should fix | Review (a). |
| `.pw` | Home, slide "Seven pathways" | Descriptions (#666) fall below 4.5:1 on two tints. | **blocks** | Community 5.74 → **4.42**; Commercialization 5.74 → **4.48**. axe failures 0 → 2. |
| `.pw` | same | The Communications icon falls below 3:1. | should fix | 3.36 → **2.88**. |
| `.pw` | same | Contradicts concordia.ca, where this row is white with a straight 4 px line and a square tinted mark. | should fix | Review (a). |
| `.ncv-expand-block[data-pathway]` | Vision accordions | Accordion titles in the pathway colour fall below 4.5:1. | **blocks** | The same drops as `.pathway-card`. axe failures 1 → 5. |
| `.ncv-expand-block[data-pathway]` | same | The live Vision page has no stripe and no pathway colour here. | should fix | Review (a). |
| `.modal-external-note` | Service window, external resource | Reads as a text input: a one-line, full-width bordered box the height of the site's fields. | should fix | 736 × 42.8 px; the fields are 736 × 42. |
| `.booking-waitlist-banner` | Booking window, waitlist | Becomes almost the same as the form's error box. | should fix | 1px #c44b3d on #fdecea; `.booking-error` is 1px #c0392b on #fdecea. The two lines are 1.14:1 apart. |
| `.narrative-funder-note` (V4 iframe) | V4, Personal statement | The "Tailored for" bar becomes a bordered box holding pill shapes: it reads as a tag-input field. | should fix | 820 × 50.5 px. |
| `.s2-traits` | Home, slide "Impact can be…" | Text touches the new line, because the rule pads the left side only. | should fix | 0 px from the right line; 2 px below the top line. |
| `.pathway-dev-notice`, `.research-module-context`, `.modal-provider`, `.recommended-section`*, `.ncv-callout`, the stacked V4 notes, `.ps-preview`*, `.context-bar`* | various | A box inside a box, stacked boxes, or a box that looks like a field. | cosmetic | See `results.json`. (*not shown on the site today) |
| `.modal-pullquote` | Service window | Matches concordia.ca's blockquote. | none | Line 5.88 / 5.54:1. |
| `.booking-notice`, `.pro-tip-banner` | Booking window, builder | The gold stripes failed 3:1 (2.02–2.21); the #8a6200 line passes (5.20–5.49). | none (improves) | |

- **Forced colours:** every site stripe is a `border-left`, so all 18 elements stay outlined before and after.
- **Line contrast:** every new line passes 3:1. The lowest is #b07d00 at 3.08; #8a6200 for Communications would give 4.45.
