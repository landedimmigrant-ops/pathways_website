# Part box: test analysis (2026-11-26)

Prem asked: "Run through the site as a test analysis and see if part box may cause any issues." Nothing in the tool or the site was changed. The part box was injected at run time and every screen that carries a part colour was measured before (stripes, as shipped in V9.4) and after (part box, as specified in `../accent-review-2026-11-26.md`, section (c)).

- **Tool:** `../part-box-test.js` (headless Chrome, mock CV). It covers 6 screens (folded contributions, an open contribution, "See a finished example", Personal statement, Review "Edit what already changed", Review with a block open). Each screen ran at 1280 px and 320 px, with and without forced colours, with and without the WCAG 1.4.12 text-spacing overrides, and through axe-core. It writes `results.json` and the PNGs in this folder. `compare.html` and `blocks.html` put them side by side.
- **Site (`styles.css`):** a separate run, in `../part-box-test-site/findings.md`.

## The tool

### No problem found

| Check | Stripes (today) | Part box |
|---|---|---|
| axe-core, WCAG 2.2 A and AA | 0 failures on all 12 runs | 0 failures on all 12 runs |
| Lowest contrast of the colour mark against its own tint (3:1 needed) | 1.71:1 (gold stripe) | 3.32:1 (What already changed); every part passes |
| Windows high contrast (computed styles under forced colours) | the stripe is removed; the element has no mark left | a 1px outline stays on every part element |
| Sideways scroll at 320 px | none | none |
| Word bars wider than their row | none | none |
| Height of the part names (pills) | 24 px | 24 px; no new wrapping |
| Superscript evidence keys (a, b, c) in the example | inside the sentence | inside the box |

### Issues

| # | Where | Issue | Evidence | Severity | Suggested fix |
|---|---|---|---|---|---|
| 1 | Finished example (T2) | With the specified `box-decoration-break: clone`, every wrapped line of a sentence becomes its own closed box. The passage stops reading as one paragraph, which is what the footnote under it says it is. | 6 sentences make 14 boxes at 1280 px. At 320 px with WCAG text spacing, the boxes stack 3.1 px apart (`example-320-box-spacing.png`). | Should fix | Use `box-decoration-break: slice`: one box per sentence, open where a line wraps. Tested in `example-1280-slice.png` and `example-320-slice-spacing.png`: it reads as six runs, like today's highlight. |
| 2 | Word bar on Review (T6) | The open or hovered block stands out less from the others. Today, a resting block has a grey line and a stripe, and the open block has a 2px coloured line all round, so the change is clear. With the part box every block already has a coloured line, so opening one only thickens the line from 1px to 2px and fills the pencil circle. | `blocks.png`, `review-open-1280-box.png` | Should fix | Mark the open block more strongly: for example, a 2px line plus a deeper tint, or the editor's line joining the open block. Test before choosing. |
| 3 | Small squares: folded contributions (T4) and the Review legend (T5) | A 12 to 14 px pale square with a thin line, next to a word, looks like an empty checkbox. On a folded card, a written part (tint, solid line) and an unwritten one (white, dashed grey line) now differ only by a pale tint and the line style. | `contrib-folded-1280-box.png`, `review-words-1280-box.png` | Check with a researcher | Small marks could be solid squares in the part's colour, as chart legends usually are. Otherwise keep the part box and check that no one tries to tick them. |
| 4 | Gold line (#8a6200) on every gold element | The darker gold passes contrast, but for some colour-blind readers it becomes the same colour as another part's line: orange (What already changed) with protanopia, ΔE 2.2, and green (What resulted) with deuteranopia, ΔE 3.0. Today's bright gold stripe keeps them apart (ΔE 17 or more) but fails 3:1. Every gold dark enough for 3:1 collides with orange or green for one of the two (6 shades tested). | Colour simulation (Machado 2009) with CIEDE2000; the scripts are in the session's scratchpad, and the numbers are here. | Low; inherent | No change to the line. The tints still differ and the part names are in text everywhere except on the bar's blocks, which have the legend, a tooltip and a screen-reader name. Worth knowing before choosing gold for any new mark. |
| 5 | Part name above a question (T1) | The square part name sits on a card with 10 px corners, above answer boxes with 6 px corners. It is also now close in shape to the tool's outlined buttons (for example Done). | `contrib-open-1280-box.png` | Cosmetic | This follows from open question 3 (corners everywhere). If the tool's corners stay at 6 to 10 px, the mix shows. |

### Already there before the part box (not caused by it)

- **Forced colours:** the example's legend reads "[Your role] Your role": the high-contrast label rule (`.built .v7-seg-role::before`) also matches the legend chips. This happens in both versions.
- **WCAG text spacing at 320 px:** 7 word-bar blocks clip their number. This happens in both versions.
- **Forced colours:** an open word-bar block looks the same as a closed one. Box shadows are removed and every border becomes the system colour, so only the keyboard focus outline remains. This happens in both versions.

### Tests that will need updating if the part box is built

`ncv_tool_v9/test-v9.js`: the V8.18 check near line 382 (it expects a gold and an orange stripe in `boxShadow`) and the Row 12 checks near lines 2585 to 2592 (they expect an edge in `boxShadow` and gold #b07d00).

## Built in V9.5

Prem: "Will you fix all these and push".

- Issue 1: the example uses `slice`, so each sentence is one box.
- Issue 2: the open block takes a 3px line (hover 2px, rest 1px).
- Issue 3: written parts on a folded contribution are solid squares, and Review's legend marks are 20 by 12 px blocks.
- Issue 4: no change (inherent).
- Issue 5: waits on the corners question.
- Also fixed, in forced colours: the legend is no longer labelled twice, and the open block takes a 3px `Highlight` line.
- Also fixed, with WCAG text spacing on a phone: blocks no longer cut off their numbers (the stripe's extra left padding is gone).
