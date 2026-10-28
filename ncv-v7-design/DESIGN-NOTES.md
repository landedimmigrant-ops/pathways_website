# NCV V7: design notes

Designer's deliverable, 2026-10-27, for the engineer building `narrative-cv-prototype-v7.html`. It goes with the
clickable mock-up `ncv-v7-mockups.html` (in this folder) and the screenshots in `shots/` (desktop at 1180 px, phone at
375 px, full page). The spec is `ncv-v6-flow-map/ncv-v6-walkthrough-notes.md`, with the director's 14 updates of
2026-10-27 laid over it. Where those updates differ from the walkthrough notes or the brief, the updates win, and
the difference is listed under **Conflicts** at the end.

The mock-up is a picture of the design. It is not the app: nothing is stored, downloads and email only show a
note, and every draft, person and number in it is invented.

**How to use the mock-up.** Open it from the local server (`/ncv-v7-design/ncv-v7-mockups.html`). The dark bar at
the foot is the mock-up's own control panel and is not part of the design: **Screen**, **State** (the states of
that screen), **Options** (toggles for that screen), **Rail** (empty, in progress, mostly done), **Width** (desktop
or 375 px phone) and **Motion** (normal or reduced). Everything inside the page is also clickable: choices advance
the Profile, text boxes open and shrink, ↑ ↓ reorder the contributions, the switch colours the example. A deep link
such as `#s=contrib&st=mixed&w=phone` opens a state directly; add `&clean=1` to hide the control bar.
`node ncv-v7-design/capture.js` regenerates every screenshot with headless Chrome.

---

## 1. What was reused

V7 stays in the Pathways family. Everything below already exists in `styles.css` or in the V7 file's own
`<style>` block, and the mock-up uses it unchanged in value.

| Existing | Where it lives | Used in V7 for |
|---|---|---|
| `--burgundy #912338`, `--text #1a1a1a`, `--muted #5a5a5a`, `--border #e6e6e6`, `--link` | `styles.css :root` | all text, links, accents |
| Font stack `"Inter", system-ui, …, Arial` | `body` in `styles.css` | everything (no web font loaded; Inter only if installed) |
| `.page-narrative .container` max 1060 px | `styles.css` | content width |
| `.narrative-module-shell` (220 px rail + 1fr, gap 2.5rem) | `styles.css` | the shell grid, unchanged |
| `.narrative-progress-panel` (#f8f8f8, 1px #eee, radius 12, padding 1.5rem, sticky) | `styles.css` | the rail panel |
| `.narrative-stage-item` (0.88rem, #555), `.is-active` (bold burgundy), `.is-done` (#2a6e2a, filled dot), `.narrative-stage-dot` (10 px ring) | `styles.css` | rail items |
| `.narrative-stage-header h2` (1.4rem, 700, burgundy, 2 px #f0f0f0 rule) | `styles.css` | step headings |
| `.contribution-card` (#fafafa, 1px #e0e0e0, radius 10, padding 1.25rem) and `.contribution-card-header` | `styles.css` | THE card, used for every repeating thing |
| `.contribution-field label` (0.85rem, 600, #555) | `styles.css` | field labels above inputs |
| `.add-contribution-btn` (2 px dashed, radius 8, full width) | `styles.css` | "+ Add a contribution", "+ Add a person", "+ Add another item" |
| `.btn`, `.btn-primary` (burgundy, radius 2, 14 px 600) | `styles.css` | all buttons |
| `.btn-icon` (28 px square) | `styles.css` | fold and remove controls (30 px in V7) |
| `.narrative-funder-note` (#f5f5f5, 3 px burgundy left rule) | `styles.css` | the early-career note |
| `.narrative-selfcheck` | `styles.css` | the seven tick boxes |
| `.narrative-nav` (space-between, 1px #eee top rule) | `styles.css` | back / forward row |
| `.proto-banner` (#1a1a1a, gold #e5a712, 12 px) and `.v4-note-open` (gold button) | V7 `<style>` | banner; the gold button now reads **Email us** |
| `.v4-lens-pill` (#f9ebed, burgundy) | V7 `<style>` | the slim "Tailored for" line |
| `.v4-mode-card.is-on` (#f9f3f4 tint, burgundy border) | V7 `<style>` | selected state of choice cards |
| `.v4-fiction-tag` (black tag) | V7 `<style>` | "Fictional example" |
| Six-job tints and borders (`.v4-skeleton-on .seg-*`: gold, burgundy, blue, green, orange, purple) | V7 `<style>` | the "See how it's built" colours, the legend, and the small job marker on every contribution field |
| `.v4-connective` (yellow pill) | V7 `<style>` | the muted suggested joins in "Your paragraph so far" |
| `.v4-gap` (#da3a16-family text) | V7 `<style>` | gap warnings under the paragraph |
| `.v4-format` (burgundy left rule, #fbf7f7) | V7 `<style>` | the format note in Export, the closing line of the self-check |
| `.v4-checks .v4-flag / .v4-strength` | V7 `<style>` | live wording checks (flag colour deepened, see §6) |
| `.v4-key-badge` (20 px burgundy circle) | V7 `<style>` | evidence letters, order numbers |
| `.v4-fb-nudge` (#fff8e1, #f9ca24 border) | V7 `<style>` | the email nudge in Export |
| Copy: field questions and help, the agency help, the stage and discipline help, the evidence kinds, the self-check items, the format note, the cross-contribution note, the contact line | V7 script (`PROMPTS`, `renderLensFields`, `renderFormatNote`, `renderCrossRead`, `renderReview`) | reused word for word, except where §9 or the conflicts list says otherwise |

## 2. New tokens

Add these to the V7 `<style>` block (not to `styles.css`, which other pages share).

```css
--explain-bg: #f3f3f3;     /* the separate explanation element */
--field-border: #949494;   /* text box and select boundary: 3.03:1 on white (WCAG 1.4.11) */
--rule: #ececec;           /* thin rules inside cards */
--faint: #6b6b6b;          /* rail group labels and the Draft caption: 5.02:1 on #f8f8f8 */
--track: #e3e3e3;          /* length bars */
--panel: #f8f8f8; --card: #fafafa; --card-border: #e0e0e0;   /* names for values already in use */
--done: #2a6e2a; --tint: #f9ebed; --tint-2: #f9f3f4;          /* names for values already in use */
```

The existing text boxes use `#ddd` borders (1.35:1 on white), which fails non-text contrast. V7 moves every text
box, select and chip outline to `--field-border`. This is the one visible change to an existing look.

## 3. Spacing and type

**Spacing scale** (px): 4 · 8 · 12 · 16 · 24 · 32 · 48 (`--sp-1` to `--sp-7`). Card padding 16 / 24 / 24 (top,
sides, bottom); 14 on phone. Fields inside a card sit 8 apart. Cards sit 16 apart. A step heading block is
followed by 24. The nav row has 32 above it.

**Type scale** (rem, on a 16 px root):

| Role | Size | Weight |
|---|---|---|
| Page title | clamp(22 px, 3vw, 30 px) | 700, burgundy |
| Step heading | 1.4 (1.25 on phone) | 700, burgundy |
| Profile question | 1.05 | 600 |
| Field question (inside a card) | 1.0 | 600 |
| Body, instruction | 0.95 to 1.0 | 400 |
| Answers, text boxes | 0.9 to 0.92 | 400, line-height 1.5 |
| Explanation, help | 0.85 | 400, muted |
| Field kicker, rail metric, counters | 0.75 to 0.8 | 700 (kicker) / 400 |
| Group labels, tile labels | 11 px / 0.72, uppercase, 0.05em | 700 |
| Dashboard numbers | 1.9 | 700 |

Radii: 6 (inputs), 8 (fields, rows), 10 (cards, choice cards), 12 (rail). One card, one field, one answered row
everywhere.

## 4. Components

**Card** (`.card`). Grey `--card`, 1px `--card-border`, radius 10. Header row: title on the left ("Contribution 1 ·
headline", "Person 2 · Master's → Government", "How you mentor", "Your statement", "Your working draft"), and on the
right the counter ("3 of 9 answered"), a row of small progress dots (hidden on phone) and the fold or remove
control. The header text updates as you type the headline or fill a person's fields. Used for contributions,
people, How you mentor, Your statement, the working draft, the order list, the export cards and the self-check.

**Field** (`.f`), three states, one element:

- **Open**: white, 1px border with a 3px burgundy left rule, padding 12 / 16. Kicker (the job name with its colour
  marker), the full question, the separate explanation, then the text box, then the live checks.
- **Filled and shrunk**: the answered row (below). The text box stays in the page at zero height (still focusable,
  still in the tab order); the explanation collapses.
- **Empty and shrunk**: the kicker and a one-line empty text box, no question and no explanation, so a not-yet-reached
  field reads as a space to fill and takes about 64 px.

**Answered row** (`.ans`). The same component for a folded Profile answer and a shrunk card field (update 2): white,
1px border, radius 8; kicker on the first line, the answer below (up to three lines), a quiet "Change" at the right;
the Profile version adds a green feedback line (for the agency, the format). The whole row is the click target.

**Text box**. Static height: eight lines (update 3), `line-height 1.5`, scrolls inside, never grows with typing.
`resize: none` in the mock-up; leaving the browser's handle is fine if Prem prefers it. Headline is a one-line input.

**Explanation** (`.explain`). A separate block: `--explain-bg`, radius 8, an inline SVG info icon (Material "info"
shape), 0.85rem muted text. It sits between the question and the field. Never a placeholder.

**Choice card** (`.choice`). White, 2px `--card-border`, radius 10, top-aligned content (title at the top, small
line under it). Selected: burgundy border, `--tint-2` fill, a small burgundy tick at the top right. Agency cards
carry the acronym and the full name; the format appears after the choice as the feedback line. Grid
`auto-fill, minmax(138px, 1fr)` gives five across at desktop width and two on a phone. "No, just this one" spans
the full row so it reads as its own answer.

**Mini chip** (`.mini`). Pill, 32 px tall, for short in-question choices (Undecided, the years, how involved).

**Toggle switch** (`.switch`). 38 × 22 track, 16 px thumb, `role="switch"`, `aria-checked`. Off: track `#8a8a8a`
(3.45:1); on: burgundy. The label "See how it's built" stays the same in both states. Off on arrival.

**Example control** (`.ex-btn`). Pill button with a + or − and `aria-expanded`; one example open at a time; all
closed on arrival. The box opens below the row.

**Rail item with metric**. Grid: marker column 10 px, label, metric on its own line in 0.75rem muted. Answers use
the round dot; Draft items (Review, Export) use a 10 px square. Phone: the metric moves to the right of the label on
the same line, so the static rail stays short.

**Dashboard tile** (`.tile`). White tile inside a grey `.dash` box; for totals the number is the input itself (1.9rem
bold, underline only), the label sits under it. Review's "At a glance" uses two tiles: Still missing (each item a
link) and Length (a big range, a five-page bar with page ticks, the caution line).

**Summary strip** (`.strip`). One element with three uses: "Your paragraph so far" under a contribution card while
writing; the same element moved to the top of the evidence area as "What you wrote" with an Edit button once
evidence starts (update 1, never both at once); "Your statement so far" at the foot of the statement card. Joins
appear as the yellow suggestion pills; gap warnings sit under the text.

**Dashed add button** (`.add`). Full width, 2px dashed, used for contributions, people and evidence items.

**Folded summary row** (`.fold`). One line: "Contribution 1 · headline", six small job squares (filled in the job
colour with a tick when that field has text), the evidence count, "Open ▾". A folded person shows the built header.

**Order card** (`.ocard`). The card look with a number badge, headline, two-line gist and ↑ ↓ buttons (36 px tall);
slot labels sit above the first, between and above the last card. No drag handle (update 13).

## 5. Motion

| What | Duration | Easing | Notes |
|---|---|---|---|
| Field opens (explanation rows 0fr → 1fr, box height) | 200 ms | `cubic-bezier(.2,0,0,1)` | starts at once |
| Field you left shrinks | 200 ms | same | starts 140 ms after the new field begins to open |
| New question, card, person or row appears | 260 ms | same | fade in and rise 6 px |
| Example box opens; legend appears | 260 ms | same | |
| Switch thumb and track | 200 ms | same | |
| Order card moves (FLIP) | 260 ms | same | moved card gets a 2px burgundy halo for 600 ms |
| Rail marker fills, length bar grows | 200 / 260 ms | same | |
| Hover colour changes | 120 ms | linear | |

Nothing else animates; no scroll animations, no looping motion. **Reduced motion**
(`prefers-reduced-motion: reduce`, and the mock-up's Motion toggle): every transition and keyframe drops to 0 ms;
state changes are instant; the order list re-renders in place; focus and announcements are unchanged.

## 6. Keeping the page still when a field shrinks

1. When focus enters a field, it opens first. The field you left shrinks 140 ms later, once the new one has started
   opening.
2. While both move, the page holds the focused field's top edge where it was: record `getBoundingClientRect().top`
   before the change and correct `window.scrollBy` on every animation frame for the length of the transition (about
   400 ms). When a field above shrinks by 200 px, the page scrolls up by 200 px in step, and the box you clicked
   stays under the pointer.
3. Text boxes never grow as you type, so typing never moves anything.
4. The shrunk row keeps its text box in the DOM at zero height, so layout below changes only by the explanation and
   box height, never by elements appearing or disappearing.
5. CSS `overflow-anchor` alone is not enough here (it anchors on the first visible node, which may be the shrinking
   field), so the scripted anchor is the mechanism; leave `overflow-anchor` at its default.

**When a field shrinks** (update 14): only when focus leaves the field's whole question group *for another field*.
Use `focusout` with `relatedTarget`: shrink if `relatedTarget` is inside a different `.f`; do nothing if
`relatedTarget` is null (focus went nowhere, such as a click on blank page, a window switch or a scrollbar) or is
inside the same group (a click on "I led it" inside Your role, a year chip inside the competition question). In the
mock-up the open is driven by `focusin` on the new field, which gives the same result.

## 7. Keyboard and focus order

- Tab order follows the page: banner (Email us, Reset draft) → rail items in order → Save draft → the step. Inside a
  step: Tailored for "Change" → instruction link → example controls → each card's fields in order → the add button
  → back → forward. The rail comes before the step in the DOM on desktop and phone; on the phone start page only,
  the path choice is moved above the empty rail with CSS `order`, which changes the picture and not the tab order
  (see open question 7).
- Shrunk fields stay in the tab order through their zero-height text box. Tabbing into one opens it. Shift+Tab goes
  back up and reopens the one above. Clicking the answered row moves focus to its text box.
- Profile: choice groups are `role="radiogroup"` with `role="radio"` buttons; arrow keys move between cards (build
  note: add roving tabindex). Choosing an answer folds it and moves focus to the next question's first control.
  "Change" on a folded answer moves focus into that question.
- "+ Add a contribution" folds the open card, adds a card and moves focus to its headline. "+ Add a person" moves
  focus to the new "When you trained them" select.
- ↑ ↓ on an order card keep focus on the same button of the card that moved (if that button is now disabled, focus
  goes to the other arrow of the same card).
- Missing items in Review are links that go to the step, open the field and focus its text box.
- Enter in a text box never advances (no Enter-to-advance); in a one-line field Enter does nothing.
- Focus ring: 2px burgundy outline, 2px offset on buttons and links; text boxes add a 2px burgundy glow.

## 8. ARIA and announcements

- One polite live region (`aria-live="polite"`, `aria-atomic="true"`) at the end of the page. It speaks:
  "Agency: SSHRC. Next question: competition."; "Two more fields appeared below." (after a sector is chosen);
  "Contribution 2 added."; "Person 3 added."; "Evidence item b added."; "4 of 9 answered" (only when the count
  changes, never on each keystroke); "'Flood-risk maps…' moved to position 2 of 3."
- The card counters themselves are not live regions (they would talk on every keystroke).
- Each field's text box is labelled by its kicker and question (`aria-labelledby`) and described by a status span
  ("Answered." / "Not answered yet."). A shrunk field with an answer therefore announces as, for example, "What you
  did, What did you do?, edit text, Over 18 months I ran…, Answered." The visible answered row is `aria-hidden`
  and `tabindex="-1"` (it duplicates the text box); its hidden text "answered. Select to change." is there for the
  Profile, where the row itself is the control.
- Live checks sit in a polite region inside the open field.
- Rail: `<nav aria-label="My application">`, two lists labelled by their group names, the current step has
  `aria-current="step"`, a started step carries hidden ", started". While there are no contributions the Draft list
  is described by its caption "Fills in as you add contributions."; its items stay clickable.
- Example controls: `aria-expanded` and `aria-controls`. Switch: `role="switch"`, `aria-checked`.
- Working draft and preview: `role="region"`, labelled "Working draft, read only", `tabindex="0"` so the scrolling
  box can be scrolled by keyboard. Shrink / Show has `aria-expanded`.
- Evidence kinds: `role="radiogroup"`; none checked on a new item.
- Every input has a visible label above it; placeholders only add an example.

## 9. Contrast (WCAG 2.1 AA)

| Element | Foreground | Background | Ratio | Needs |
|---|---|---|---|---|
| Explanation text | #5a5a5a | #f3f3f3 | 6.22 | 4.5 ✔ |
| Rail group labels, Draft caption | #6b6b6b | #f8f8f8 | 5.02 | 4.5 ✔ |
| Rail metric | #5a5a5a | #f8f8f8 | 6.49 | 4.5 ✔ |
| Rail started (green) | #2a6e2a | #f8f8f8 | 5.88 | 4.5 ✔ |
| Rail current | #912338 | #f8f8f8 | 7.90 | 4.5 ✔ |
| Muted text on card | #5a5a5a | #fafafa | 6.61 | 4.5 ✔ |
| Selected choice text | #912338 | #f9f3f4 | 7.66 | 4.5 ✔ |
| New draft card, title / body | #fff / #fbeef0 | #912338 | 8.40 / 7.43 | 4.5 ✔ |
| Check flag (deepened from #da3a16) | #b02a0a | #fff | 6.60 | 4.5 ✔ |
| Check strength | #2a6e2a | #fff | 6.25 | 4.5 ✔ |
| Gap warning | #7a1f15 | #fafafa | 9.89 | 4.5 ✔ |
| "Recommended" tag | #2a6e2a | #e9f3e9 | 5.49 | 4.5 ✔ |
| Join pill | #555 | #fff8e1 | 7.02 | 4.5 ✔ |
| Banner text and button | #e5a712 / #1a1a1a | #1a1a1a / #e5a712 | 8.18 | 4.5 ✔ |
| Text box border | #949494 | #fff | 3.03 | 3.0 ✔ |
| Switch track, off | #8a8a8a | #fff | 3.45 | 3.0 ✔ |
| Length bar fill on track | #7a7a7a | #e3e3e3 | 3.34 | 3.0 ✔ |
| Dashed add-button border | #c4c4c4 | #fff | 1.74 | decorative: the button is identified by its 0.92rem #555 label (7.5:1) |

The six job tints keep the existing V7 check (#444 text at 4.5:1 or more on every tint). **Faded answers**
(update 14): a long answer is clamped at three lines with an ellipsis and the words stay at full contrast; only the
padding strip under them carries a light fade as the cue that there is more. The mask covers the overflow, never
the words.

## 10. Phone (375 px)

- The shell becomes one column (`minmax(0, 1fr)`, so long headlines never push the page sideways); the rail is a
  static block above the step with each metric to the right of its label on one line, and the tally on two lines.
- Start page: New draft full width, Continue draft as a short row below it with the icon at the left. Because the
  rail is empty there, the path choice is shown above the rail.
- Choice cards two across; the totals tiles two by two; the person card's pairs stack; the evidence kinds two
  across; At a glance tiles stack; the export format choice stacks.
- Card headers wrap the title onto two lines and drop the progress dots (the counter stays).
- Order cards put ↑ ↓ under the text, 36 px tall and 40 px wide each (below the 44 px AAA target; AA has no target
  size rule in 2.1, and the V6 size was the same).
- Nav rows stack, forward button on top and full width.
- The banner drops "Reset draft" on a phone (it stays in the rail-foot menu in the build; see open question 6).

## 11. Screen by screen, the choices that are not obvious from the shots

- **Header**: the intro paragraph and guide sentence show on the start page only; later steps keep the title,
  subtitle and privacy line. The privacy line drops the Feedback sentence (no network now) and gains "The checks are
  fixed rules." The lock is an inline SVG in place of the emoji.
- **Start page**: the intro block and the path row are separated by a rule (Prem's "make the boundary obvious").
  New draft is the burgundy card with a white "Start a new draft →" inside it; the whole card is the button.
- **Profile**: one opening line, the short info note (update 4), a quiet "3 of 6 answered", then one open question
  at a time. Each open question uses the same white block with a burgundy left rule as an open card field, and
  carries the same kicker, so the Profile and the cards look like one system. The competition question holds the
  name, an Undecided chip and the optional year chips (computed from the current year, update 9). It folds when
  you choose the next question's answer. Work modes stay open (multi-select) until you leave the Profile.
- **Contributions**: the slim Tailored for line, the official heading, the instruction paragraph from the code with
  the link inside its last sentence (update 5), the three example controls, the cards. Each field's kicker carries
  its job colour, so the card and the "See how it's built" colours share one key. Evidence is the ninth row of the
  card ("+ Add evidence"); choosing it moves the paragraph to the top as "What you wrote" and opens the evidence
  area. One prompt for every kind of evidence (update 13).
- **Mentorship**: the people title is "A few of the people you trained, and where they went." (update 8). The
  totals title drops "in the last five years" (unverified, Eli question #1). No over-described line (update 13).
- **Personal statement**: the anchor line is the first field, as three inline inputs. The cross-contribution note
  sits to the right of the open "The problem" or "Strands" field on desktop and under it on a phone, and only when
  there are two or more contributions.
- **Review**: working draft card first (14 lines, set in the agency's font), then order, At a glance, self-check
  with the format sentence as its closing line, then the nav.
- **Export**: Set up for line, read-only preview (10 lines), Download or print (two-way choice, one primary
  Download whose label follows the choice, Print view and Copy draft as quiet links), Paste into the template (three
  Copy buttons and the format note), Keep your work, the contact line, the email nudge with the address printed as
  selectable text beside Email us (update 12), and the back link only.

---

## Open questions

1. **Rail tally numbers.** The mock-up's "mostly done" rail adds 760 invisible words to the sample draft so the
   tally reads at a realistic length (about 1,200 to 1,400 words across the states, "roughly 2 to 2.5 of 5
   pages" and "roughly 2.5 to 3 of 5 pages"). The range uses 550 and 450
   words a page around the existing 500; confirm that spread, or set it.
2. **Profile question kicker labels** ("Agency", "Competition", "Career stage", "Field", "Another field", "How your
   work usually happens") are mine. They double as the folded answer's label.
3. **Year chips without a "Not sure" chip.** The year is optional, so no chip means no year; a choice can be
   cleared by clicking it again. Is an explicit "Not sure" wanted?
4. **When a contribution folds.** In the mock-up a card folds when you add the next one or press its ▴ control.
   Should a card also fold on leaving the step?
5. **Person cards use plain labelled fields**, not the open/shrink pattern: they are short single lines and two
   selects, and shrinking them would add motion for little gain. A finished person folds to its header when you
   add the next person. Confirm.
6. **Reset draft on a phone** is dropped from the banner for width. Where should it live (rail foot, beside Save
   draft)?
7. **Phone start page order**: the path choice shows above the empty rail. On every other step the rail stays
   above, as the notes say. Confirm the exception.
8. **The "Your paragraph so far" strip on Contributions** is always on in the mock-up, as the director's update 1
   implies; the statement strip has the off switch Prem asked for. Should the contribution strip get the same
   switch?
9. **The first-check note** ("The checks under each field are suggestions…") appears inside the field the first
   time a flag fires; the last sentence of the V6 note ("You know your record better than a word list does.") is
   dropped as an aphorism under the academic-register list. Confirm.
10. **Evidence question** "What backs up this contribution?" and the eight kind examples ("an article, chapter or
    book", "data or software others use", …) are mine; the kinds themselves are the existing eight.
11. **Mentorship example** stays the single Social sciences example (Eli question #7). Same for the statement.

## Conflicts

1. **Format sentence in the self-check.** The brief quotes "Prepare your CV in the current version of the template
   your agency provides, keep the formatting it sets, and do not exceed the page limit: 5 pages in English, 6 in
   French". That is the walkthrough's INFERRED paraphrase; it carries an Oxford comma and shortens "6 pages". The
   guide-synced wording in the code (`renderFormatNote`) is two sentences: "Prepare your CV in the current version
   of the template your agency provides, and keep the formatting it sets. Do not exceed the page limit: 5 pages in
   English, 6 pages in French." **Chosen: the code's wording**, since the notes say to reuse the guide's own words
   and the house rules forbid the Oxford comma.
2. **CV-FRQ heading.** The brief asks for "Background and skills" as the variant name; the code's SECTION_NAMES
   (update 8) give "The candidate's background and skills". **Chosen: the official name as the heading, "Background
   and skills" in the rail and on buttons.**
3. **Contributions instruction.** The brief asks for a one-line instruction; Prem asked to keep the instruction
   and update 5 confirms it. **Chosen: the existing paragraph, link moved inside.**
4. **Ordering note.** The brief's "You will put these in order later, after the personal statement" refers to an
   Order step that no longer exists. **Chosen: update 6, "You will put these in order in Review, after the
   personal statement."**
5. **Draft caption.** Brief: "Opens as you add contributions" (muted until there is content). Update 7: "Fills in
   as you add contributions." with the items clickable. **Chosen: update 7.** The items are drawn in the quieter
   `--faint` grey until there is a contribution, which is still readable (5.02:1).
6. **Page estimate.** Brief: "roughly 2.5 of 5 pages". Update 7: a range. **Chosen: the range.**
7. **Mentorship people title.** Brief: "Tell us about a few of them". Update 8 replaces it. **Chosen: update 8.**
8. **Competition year.** Brief: competition name required with a year list of current year and the next three;
   update 9 makes the year optional and computed. **Chosen: required name (or Undecided), optional year.**
9. **Notes after New draft.** The walkthrough leaned to dropping the early note; update 4 keeps both. **Both kept.**
10. **Text box height.** Brief and notes: about four lines. Update 3: about eight. **Chosen: eight.**
11. **Drag handle on order cards and the per-type evidence prompt.** Both in the brief; update 13 defers them.
    **Not shown.**
12. **Email nudge wording.** Brief: "We would like to hear how this went for you. Send a short note…". Update 12
    gives a conditional form. **Chosen: update 12.**
13. **Intro paragraph.** The walkthrough's draft ends its list with "plus questions for an advisor"; the advisor
    features are parked (Review second pass). **Chosen: the clause is dropped.** Nothing else in the draft changed.
14. **Agency help sentence.** The current help ends "or pick Other for now"; the chip is now "Not sure yet".
    **Chosen: "or choose Not sure yet for now"**; the FRQ clause ("which now requires it for all grant applications
    in its three sectors") is unchanged word for word.
15. **Totals label.** The code says "people you've trained in the last five years"; the five-year window is
    unverified (Eli #1). **Chosen: "People you have trained", no time frame**, until Eli answers. The export code's
    "Totals (last five years)" needs the same decision.
16. **"Not reached" fields.** An earlier note proposed label-only rows; Prem's later decision replaced them with
    shrunk empty boxes. **Chosen: shrunk empty one-line boxes.** The walkthrough's worry (nine boxes at once) is met
    by keeping each to about 64 px with no explanation.
17. **Feedback step and "field not listed".** The discipline note pointed missing fields to "the Feedback step at
    the end", which no longer exists. **Chosen: no line under the discipline cards**; the email nudge is the only
    route.

## What could not be realized as written

- **Drag and drop, per-type evidence prompts and the over-described line**: deferred by update 13; not shown.
- **Downloads, printing, copying, saving and email** are notes (a short message appears) in the mock-up; the
  layouts and states are complete.
- **The live checks** in the mock-up run three of the V7 rules (we/our, numbers, hedges in What already changed)
  to show placement and tone; the build keeps the full set.
- **Phone width** is simulated with a container query on the frame, so the toggle works on a desktop screen; the
  real build keeps the existing 768 px media query and can adopt the container query or not.
