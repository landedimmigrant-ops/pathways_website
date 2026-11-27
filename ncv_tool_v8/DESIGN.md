# NCV tool: design rules

The rules the Narrative CV tool is built to. Read this before changing a screen, and run the review in `.claude/skills/ncv-design-review/` before a change is called done. Prem decides the rules; a rule here was either stated by him or is marked INFERRED in `README.md` until he confirms it.

## 1. Principles

1. **Overview first, detail on request.** A step opens on the whole (all contributions, all people) and the detail opens where the researcher selects it.
2. **One object looks and behaves the same everywhere.** A part has one name and one colour on every step. A pattern Prem approves applies wherever it fits.
3. **You edit where you are looking.** An editor opens under the thing selected and holds only that thing. One editor is open at a time. Escape or Done closes it and focus returns to where it came from.
4. **What can be selected looks it.** Anything that opens for editing is an editable box (section 3). Nothing else borrows that look.
5. **A chart describes; it does not score.** No ratings, no ranking, no colour that means good or bad, no question the tool cannot answer.
6. **Less is more.** An instruction says what to do. If a chart needs a sentence to explain it, the chart is changed.
7. **Same parts and data for everyone; wording follows the field.** See `project_field_wording` in memory.
8. **Accessible on every run.** Keyboard, screen reader, contrast, target size and reflow are checked before a change is called done, with a test for each behaviour.

## 2. Language

- The voice is the house voice: `voice/voice-checklist.md` and the `pathways-voice` skill.
- The language rules from the 2026-11 block-by-block pass are in `ncv_tool_v8/LANGUAGE-RULES.md` (message types, plain verbs, examples versus hints, accuracy, testing every check). Decided wording, row by row, is in `ncv_tool_v8/language-notes.md`.
- The words are the ones in `ncv_tool_v8/VOCABULARY.md`. A term the funders or the Narrative CV guide already use is preferred to a word the tool made up.
- A label says what the researcher does ("Edit what changed"), in plain words, with no name of a tool part (tab, block, mark, tick, strand) unless the researcher typed or chose that thing under that name.
- A question and the fact line under it are about the same thing.
- A help line stays only if it adds something the label does not say.
- Academic register: no contrast frames, no personified tool, no "actually", no aphorisms. `node scripts/ncv-v5-examples.js register` checks the example library.

## 3. Components

### The editable box (`.v8-eb`)

One look for anything that opens for editing. Written once in the stylesheet; a test fails if the pencil is defined a second time.

| State | Ground | Border | Mark at the right end |
|---|---|---|---|
| Rest | white (a block: its part's tint) | grey, solid (a block: its part's line, 1px) | pencil in the accent colour, no circle |
| Hover, keyboard focus | tint | accent (a block: 2px) | pencil in a circle of the accent |
| Open (its editor is showing) | as hover, kept | as hover (a block: 3px) | as hover |
| Empty | white | grey, dashed | plus sign in place of the pencil |

- **Tokens:** `--pa` accent, `--pt` tint, `--pon` ink on the accent, `--pi` the accent for lines (the pencil at rest and the border on hover; it is darker than `--pa` for gold, which is too pale for a line). The default is the Pathways site's burgundy (`#912338` on `#f6e8eb`). A block sets the tokens of its part.
- **Mark:** 22px circle, 8px from the right edge, centred top to bottom.
- **Motion:** 0.2s on colour, none under reduced motion.
- **Focus ring:** 3px burgundy, 2px offset, as elsewhere in the tool.
- **Block variant (`.v8-eb-block`):** a block in a bar, drawn as a part box (below): the part's tint and a 1px line of its colour all round, 2px corners, no stripe (V9.5). Hover and focus take a 2px line, the open block 3px. A block narrower than 60px shows its number alone, and the circle takes the number's place on hover or focus. **On a phone (640px or less, V9.7, WB-1):** each block is a full-width row, an editable box that names its part, with a 10px part box sized by its words (one scale for every contribution) and "N words"; the row opens its part under it, and there is no legend.
- **Used by:** the blocks on "Edit what changed", evidence items on "Add evidence", people on Review's Mentorship.
- **The editor it opens:** a white box under its row with the same accent on a 1px border all round, a label that names the thing, Done, and a link to the step where the thing is written. No coloured bar down the side.

### Other patterns

- **Add button:** dashed border and "+ Add". On hover it takes the burgundy tint and border.
- **Row that opens (a folded contribution):** a triangle and "Open". On hover it takes the burgundy tint and border. It has no pencil, since it opens a card and not an editor.
- **Text edited in place (the CV on Export):** a dashed outline on hover and a solid burgundy outline on focus. It has no mark at rest, so the page reads as it prints.
- **Checklist:** one, on Export, under "Before you export". Review's questions appear there in Review's own words, each with "See on Review".

### Corners (ST-3, V9.6)

Corners follow concordia.ca, 0 to 4px: fields and notes 0; buttons, chips, tags, part names and editable boxes 2px; cards, panels and choice tiles 4px. Only true circles (the pencil disc, number badges, dots) are round. No pill shapes. `ncv_tool_v9/design/corners-audit.js` checks every screen.

## 4. Colour

The part colours are the Pathways site's accents. Each part has one accent everywhere it appears (field label, block, legend, folded contribution, editor edge).

**The part box (ST-1a, V9.5).** A shape that carries a part's colour is drawn as a part box: the part's tint as the ground, a 1px line of the part's line colour (`--pi`; gold `#8a6200`) all round, 2px corners, dark text. No colour on one edge of a shape: concordia.ca never bends a coloured edge round a corner. A sentence keeps one box across the lines it wraps. Small progress marks (a folded contribution's parts) are solid squares in the line colour; a part not yet written is white with a dashed grey line.

| Part | Accent | Tint |
|---|---|---|
| The problem or question | `#e5a712` (pencil `#8a6200`, ink `#1a1a1a`) | `#f7e5b8` |
| Your role | `#912338` | `#e7cfd3` |
| What you did | `#0072a8` | `#bfdce9` |
| What resulted | `#508212` | `#d3e0c4` |
| What already changed | `#da3a16` | `#f7d4cc` |
| One moment | `#6b6b6b` (neutral; it is outside the six parts) | `#e8e2d2` |
| What could change | `#573996` | `#ddd7ea` |

Text on a tint or on white is `#1a1a1a`; text and marks meet 4.5:1, and borders and marks that carry meaning meet 3:1.

## 5. Before a change is called done

Run `.claude/skills/ncv-design-review/SKILL.md`. In short: the principles above, the voice checklist on every changed string, the accessibility checks, the test suite, a look in the browser at desktop and phone width, and the INFERRED list updated in `README.md`.
