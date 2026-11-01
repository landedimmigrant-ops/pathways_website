# NCV V7 beta: persona walkthrough, 2026-10-30

Five Opus agents each walked `narrative-cv-prototype-v7.html` (commit f852933) end to end as a researcher persona, logging every hiccup against the shared brief (`ncv-v7-walk/BRIEF.md`). This log merges their findings into one ranked list, verified against the code, with a fix plan. The tool itself was not edited. The test suite passed 106 of 106 before this round.

## The five personas

- **p1** Early-career historian, SSHRC Insight Development Grants, community-engaged, phone only (375 × 812). 33 blocks, 2 withdrawn as harness artifacts.
- **p2** Mid-career mechanical engineer, NSERC Discovery, industry-partnered; keyboard only at 1280 × 900. 24 blocks.
- **p3** Senior health researcher, CIHR Project Grant, Health / clinical + STEM; heavy use (five contributions, nine evidence items, six people). 26 blocks.
- **p4** Research-creation artist, FRQ (CV-FRQ); save, load, reload, reset. 27 blocks.
- **p5** Undecided agency and competition, Social sciences + STEM; edge cases and the Change panel; desktop then tablet. 29 blocks.

## Counts

139 raw blocks (137 standing after p1's two withdrawals) → **57 entries**: 56 unique issues (W-01 to W-55, W-57) and one closing block (W-56) that lists the nine findings closed as not bugs and the harness artifacts.

By disposition: FIX 26 · FIX-INFERRED 20 · PREM 10 · NO 1 block (9 findings plus the harness artifacts).
By severity: blocker 0 · major 16 · minor 35 · polish 5.

## How to read the log

- **ID** `W-NN`. Issues are ordered by theme, and within a theme by severity.
- **Personas** lists the raw finding IDs merged into the issue (for traceability back to the five logs, which hold the screenshots and DOM evidence).
- **Cause** names the line(s) in `narrative-cv-prototype-v7.html` where the behaviour comes from. Every kept issue was checked against the code; where a claim could not be confirmed from the code it is marked "unsure".
- **Disposition**: `FIX` (clear bug or inconsistency, no product decision needed); `FIX-INFERRED` (a reasonable inference, stated, for Prem to override); `PREM` (needs Prem's decision: the question, a recommendation and options); `NO` (not a bug, already decided, harness artifact or out of scope).
- **Status** starts as `open`. Update it as batches land.
- Standing rules applied: one design language across the tool; academic register for all copy; anything DECIDED in `narrative-cv-v7-decisions.md` is not a bug unless broken.

---

## Issues

### A. Focus, keyboard and announcements

**W-01 · Focus drops to the page body on every step change**
- Severity: major · Kind: a11y · Personas: p2-01, p4-25, p1-33 (part), p4-07 (part)
- Cause: `renderStage()` restores focus by id only when the stage did not change (lines 2373–2376); on a change it scrolls to the top and leaves focus on `<body>`. Every route into a step (Start, Confirm profile, rail, next and back buttons, Load, Reset, the Still missing links that change step) shows it.
- Fix: after `RENDERERS[...]` on a stage change, focus the step's `h2` (or the welcome banner when present) with `tabindex="-1"` and `preventScroll`, and clear the step-level live region (see W-07). Keep the restore-by-id path for same-step redraws.
- Disposition: FIX · Status: fixed (batch 1)

**W-02 · "+ Add evidence" leaves focus on the strip's "Edit" button, which closes the editor**
- Severity: major · Kind: a11y / bug · Personas: p1-03, p2-06, p3-21, p5-29 (d)
- Cause: the "+ Add evidence / Edit evidence" button (line 3758) and the "What you wrote" strip's "Edit" button (line 3779) share the id `ev-open-<cid>`; the same-step focus restore (lines 2373–2376) puts focus on whichever element now holds that id, so after the click it lands on "Edit" (off screen or under the top bar on phone).
- Fix: give the strip button its own id (`ev-edit-<cid>`) and an accessible name that says what it does ("Edit the writing for contribution N"); after the editor opens, focus the first kind card of item a (or "The item" when a kind is chosen) and scroll the editor to the top. Same for the Evidence square in the side column (lines 3699–3702 already focus the first control; align the button path with it).
- Disposition: FIX · Status: fixed (batch 1)

**W-03 · "+ Add another item" keeps focus on the button below the new item**
- Severity: minor · Kind: a11y / inconsistency · Personas: p1-04, p2-07
- Cause: lines 3862–3866 announce and scroll the new item into view but do not move focus; "+ Add a contribution" (3628) and "+ Add a person" (3962–3963) do.
- Fix: focus the new item's first kind card (`evkind-<cid>-<j>-…`) and scroll the item to the top.
- Disposition: FIX · Status: fixed (batch 1)

**W-04 · Removing a contribution or a person drops focus to the body and says nothing**
- Severity: major · Kind: a11y · Personas: p1-10, p1-24, p2-09, p3-20, p4-25 (part), p5-10
- Cause: Remove contribution (lines 3679–3683) and Remove person (4017–4022) splice and re-render; `renderStage()` finds no focused element to restore. No `announce()` call; the live region still holds the earlier "Person C added." (W-07).
- Fix: after re-render, focus the card now at that index (its fold button or heading), else the previous card, else "+ Add a contribution / person"; `announce("Contribution N removed.")` / `"Person X removed."`. Evidence item removal already focuses "+ Add another item" (3825); add the announcement there too.
- Disposition: FIX · Status: fixed (batch 1)

**W-05 · Role-level buttons stay in the Tab order while the field is closed**
- Severity: major · Kind: a11y · Personas: p2-08
- Cause: a closed field's `.v7-f-more` is collapsed with `grid-template-rows: 0fr; opacity: 0` (lines 368–369) and nothing removes its controls from the tab order; the radios (3738–3748) take focus while invisible. The `focusin` handler opens a field only for `.v7-box` (3355–3360), so landing on a hidden radio does not open the field. (p2 also saw the field close after Enter on a level button; not reproduced from the code, unsure.)
- Fix: `.v7-f:not(.is-open) .v7-f-more { visibility: hidden; }` with `transition: visibility 0s 200ms` so the collapse animation keeps running; and extend the `focusin` opener to any control inside `.v7-f` (`.v7-box, .v7-box-sib`), so Shift+Tab into the levels opens the field.
- Disposition: FIX · Status: fixed (batch 1)

**W-06 · After a Setup answer the focused control scrolls out of view (keyboard); on phone the next question stays below the screen**
- Severity: major · Kind: a11y / ux · Personas: p2-04, p1-27
- Cause: `pick()` (lines 3441–3446) re-renders, restores focus to the chosen button, then glides the next question level with its square (`_level`, 2989–2996). On desktop the glide carries the focused button off the top; on phones `_level` returns false because the column is hidden (`nav.offsetParent` null), so nothing scrolls.
- Fix (INFERRED): after an answer, move focus to the next question's heading (`jumpQ` already does this for square clicks, 3433–3434) at every width; on desktop keep the glide (DECIDED 2026-10-30) and let focus ride with it; on phones scroll the next question to sit under the sticky squares row. Inference: focus follows the question, which is what the DECIDED "next card comes up level with its triangle" implies for keyboard users.
- Disposition: FIX-INFERRED · Status: fixed (batch 1)

**W-07 · Live region: created late, never cleared, and two other elements claim the status role**
- Severity: minor · Kind: a11y · Personas: p2-24 (a), p1-33, p4-25 (b), p4-09
- Cause: `#v7-live` is created on the first `announce()` (2910–2914), so the first message can be missed; nothing clears it on a step change, so "Person C added.", "Profile updated." and "moved to position 2 of 2" linger. The prototype banner is `role="status" aria-live="polite"` around static text (line 676). The welcome-back banner (2365–2367) has no role, so it is neither announced nor seen after a reload that restores scroll.
- Fix: put an empty `#v7-live` in the HTML; clear it in `renderStage()` on a stage change; drop the live attributes from `.proto-banner`; give the welcome banner `role="status"`. INFERRED: on a reload the page keeps its scroll position (browser restoration), so the banner also goes into the live region ("Welcome back. You were on Contributions.") rather than being forced into view.
- Disposition: FIX-INFERRED · Status: fixed (batch 1)

**W-08 · `announceCount` drops the last count instead of deferring it**
- Severity: minor · Kind: a11y · Personas: p2-15
- Cause: lines 2918–2924 record the new count as spoken and return when inside the two-second window, so "7 of 7 answered" is never heard.
- Fix: when throttled, set a timer for the end of the window that announces the latest count.
- Disposition: FIX · Status: fixed (batch 1)

**W-09 · Choice groups carry `role="radio"` but arrow keys do nothing; every option is a Tab stop**
- Severity: minor · Kind: a11y · Personas: p2-03, p3-26 (c)
- Cause: `choiceGrid` (3384–3404), the year pills (3494–3500), the role levels (3738–3748), the evidence kinds (3827–3834) and the export format (4662–4672) all set `role="radio"` inside a `radiogroup` with no roving tabindex or key handling. The year pills also toggle off on a second click (3498), which radios do not do.
- Fix (INFERRED): one helper `radioKeys(group)` that gives the checked (or first) option `tabindex="0"`, the rest `-1`, and moves focus and selection with the arrow keys; applied to every `radiogroup` in the tool (one design language). Year keeps its toggle-off because the answer is optional; the helper treats an unchecked group as "first option focusable". Inference: keep the radio semantics (they match a single choice) over switching to `aria-pressed`.
- Disposition: FIX-INFERRED · Status: fixed (batch 1)

**W-10 · The side column sits in a different place in the Tab order on Setup and on the cards**
- Severity: polish · Kind: inconsistency / a11y · Personas: p2-05, p2-10
- Cause: on Setup the column is appended after the question list (3437); on cards `fieldCol()` is appended right after the header, before the fields (3690, 4119), so a contribution costs nine Tabs before the Headline box. The grid places the column by `grid-column: 2; grid-row: 2 / span 30` (346), so DOM order does not affect layout.
- Fix (INFERRED): append the card column after the fields and the strip, as Setup does; Confirm profile then follows the last answer on Setup too (move `wrap` after the nav row would change layout, so leave Setup as is). Inference: the column is a navigation aid, read after the content.
- Disposition: FIX-INFERRED · Status: fixed (batch 1)

**W-11 · "Download all visuals" disables the focused button, so focus falls to the page**
- Severity: minor · Kind: a11y · Personas: p2-13
- Cause: line 4623 sets `b.disabled = true` while the PNGs download.
- Fix: `aria-disabled="true"` plus an in-flight guard; keep `disabled` off.
- Disposition: FIX · Status: fixed (batch 1)

**W-12 · No skip link; every step begins with the top bar and the whole rail**
- Severity: minor · Kind: a11y · Personas: p2-02
- Cause: nothing in the shell targets the step content; the rail (2252–2334) precedes `#v4-stage-content` in the DOM.
- Fix (INFERRED): a visually hidden "Skip to this step" link as the first focusable element, shown on focus, targeting the step heading (which W-01 gives `tabindex="-1"`).
- Disposition: FIX-INFERRED · Status: fixed (batch 1)

**W-13 · Mentorship count boxes show focus only as a thin underline; focus rings come in two colours**
- Severity: minor · Kind: a11y · Personas: p2-17, p2-24 (b)
- Cause: `.v7-tile input:focus { outline: none; border-bottom-color: #912338 }` (456). Controls without a V7 rule (plain `.btn`, choice cards, kinds) fall back to the browser's blue default outline, while rail items, squares and start cards use the burgundy 2 px ring (343, 596, 584).
- Fix: give the tile's `:focus-visible` the standard 2 px burgundy ring; add one `:focus-visible` rule for `.btn, .v7-choice, .v7-kind, .v7-mini, .v7-icon-btn, .v7-linkbtn, .v7-fold` so the ring is one colour everywhere.
- Disposition: FIX · Status: fixed (batch 1)

### B. The assembled draft and the exports

**W-14 · The role line opens every assembled paragraph, against the hint and the example; the chosen level never reaches the draft**
- Severity: major · Kind: inconsistency · Personas: p1-13, p2-22, p3-02, p3-12, p4-05, p5-07, p5-29 (c)
- Cause: `buildWeave` orders the parts Stakes → What you did → … (3890) and leaves the role out; each builder then prepends the role line: the strip as an italic line "I led it. I wrote…" from `roleMode + roleLine` (3784–3785), the on-screen preview as a first sentence (4204), Word and Print as italics run on from the bold headline, which gets a full stop (4945–4946), the .txt as a `[role]` line (4841), the section copy as a plain first sentence (4996). The Stakes hint (2049) and every worked example (for instance 860–861) put Stakes first. The level (`roleMode`) counts for the gate (2118) and the squares (3560) but appears in no export.
- Fix: needs Prem's call on order and on the level (question Q1). Recommended: one `assembleContribution(c)` used by the strip, the preview, Word, Print, .txt and the section copy, giving [Stakes, role line, What you did, What resulted, What already changed, One moment, What could change] in roman type; the level stays a cue for writing the line (a short note under the pills: "The level guides your line; the draft prints your line."), and Still missing lists "Your role" when only a level is chosen. Options: (A) as recommended; (B) role first everywhere and change the Stakes hint and the 60 example cells to match; (C) print the level as its own sentence ("I led it.") before the line.
- Disposition: PREM · Status: fixed (audit loop round 2, 2026-10-31; PREM items built on option A, INFERRED)

**W-15 · The on-screen draft leaves out the evidence "Why it matters" notes that every export includes**
- Severity: major · Kind: inconsistency · Personas: p3-10, p1-16, p2-18
- Cause: `draftPreview` lists each item as key, text and kind only (4207–4210); Word and Print (4952), .txt (4848) and the section copy (4999) add the note. Review's length figure (`draftWords`, 4798) already counts the notes.
- Fix: render the note under each item in `.v7-draft-body`.
- Disposition: FIX · Status: fixed (audit loop round 1, 2026-10-31)

**W-16 · Evidence letters, headline punctuation and the role's type differ across the four outputs**
- Severity: minor · Kind: inconsistency · Personas: p1-16, p2-18, p3-13, p4-23, p5-16
- Cause: letters are "(a, b)" on screen (4205), `<sup>a</sup><sup>b</sup>` with no separator in Word and Print (4948), "[a,b]" in .txt (4843–4844) and the section copy (4995–4998); the headline gets a full stop in Word and Print only (4945); the role is italic there only (4946).
- Fix (INFERRED, with W-14's helper): superscript letters with commas ("a, b") in the HTML outputs (Word, Print, on-screen preview), since the worked example uses superscripts; "(a, b)" in the plain-text outputs (.txt, section copy); no full stop added to a headline; the role line in roman type everywhere.
- Disposition: FIX-INFERRED · Status: fixed (audit loop round 2, 2026-10-31; PREM items built on option A, INFERRED)

**W-17 · The tool's evidence-kind labels are printed into the CV text in every output**
- Severity: minor · Kind: copy · Personas: p3-23, p4-23, p5-16
- Cause: every builder appends `(type)` to each item (4209, 4848, 4952, 4999), including "(Other)" when "Name the kind" is empty; the section copy says it copies "without the tool's notes" (4701).
- Fix: Prem's call (Q4). Recommended: drop the kind from the preview, Word, Print and the section copy (the text of the item identifies it), keep it in the .txt working file; never print "(Other)". Options: (A) as recommended; (B) keep the kind everywhere but drop "(Other)"; (C) drop it everywhere.
- Disposition: PREM · Status: fixed (audit loop round 2, 2026-10-31; PREM items built on option A, INFERRED)

**W-18 · Line breaks typed inside a field survive in the .txt and the section copy, and Enter adds a break in the role box**
- Severity: major · Kind: inconsistency · Personas: p3-11, p2-24 (d)
- Cause: the builders join raw field text (4844, 4996, 4835, 4988); a multi-paragraph answer splits a contribution into several paragraphs and loses the 3-space indent in the .txt, and a one-signal-per-line Standing answer prints as lines inside the statement. The HTML outputs collapse whitespace, so the preview, Word and Print show one paragraph (p3's report that Word keeps the breaks is unsure from the code). "Your role" is a textarea (3552, no `line` flag), so Enter inserts a newline.
- Fix (INFERRED): collapse internal newlines to one space in every text output (contribution parts, the role line, statement parts, evidence notes), which matches what the preview shows and what the tool says ("reads as a single paragraph"); prevent Enter in the role box as the Headline does (3273). Inference: paragraphs inside one contribution are not part of the format.
- Disposition: FIX-INFERRED · Status: fixed (audit loop round 1, 2026-10-31)

**W-19 · The plain-text file carries tool notes, its description says "the same draft without formatting", its gap list disagrees with Still missing, and its name lacks the agency**
- Severity: minor · Kind: copy / inconsistency · Personas: p3-13, p3-14, p2-18, p4-23, p4-24, p5-17
- Cause: `buildExportText` adds a header, a Context line with em dashes and "TCV", "(appears first; you wrote it last)", `[role]`, `[gap]`, "Evidence:", "Where the people I trained went:" and "How I mentor:" prefixes (4825–4863); the Export option describes it as "The same draft without formatting, for pasting anywhere." (4664); the `[gap]` notes come from `buildWeave` (3893–3896: Stakes, What already changed, What could change, evidence) while Still missing (`missingList`, 4220–4231) also lists What you did and What resulted; the file is `narrative-cv-draft.txt` (4682) where Word and the draft file carry the agency (4976, 1905). The gap notes use em dashes (kept from V6 by inference, decisions log line 405).
- Fix (INFERRED): keep the .txt as the working copy with notes, and say so: "The draft as plain text with the tool's notes to you, for working on it elsewhere." Drop the Context line's year and modes gap by building it from the Profile bar's pills; build the `[gap]` lines from `missingList` for that contribution; rewrite the gap lines without dashes ("Stakes is empty. What problem was this work answering?"); name the file `narrative-cv-draft-<agency>.txt`; the header "NARRATIVE CV, WORKING DRAFT (V7 beta)". Inference: the notes are useful in a working file; the paste-ready outputs are the section copies.
- Disposition: FIX-INFERRED · Status: fixed (audit loop round 2, 2026-10-31; PREM items built on option A, INFERRED)

**W-20 · Mentee lines use tool notation ("Master's → Government, …  Recognition: …") and the sector appears for some sectors only**
- Severity: minor · Kind: copy / inconsistency · Personas: p2-23, p3-16, p4-22, p5-15, p1-16
- Cause: `menteeWhere` drops the sector word for University and Other (1778); the builders print "label → where. Recognition: … . why" (4860, 4962, 5008) and the preview reuses `sectionText("mentor")` (4214). Screen readers read "→" as "right arrow" in the person fold buttons (3909).
- Fix: Prem's call on the form (Q5). Recommended: a sentence builder for the draft: "A doctoral student I trained is now at Made-up University, Department of X; she held a provincial graduate scholarship (2023). Why…" with the sector named only for Industry, Government and Community agency ("now works in government at …"). Keep the compact "Person A · Master's → Org" form in the card header (fine there), but give the fold button an `aria-label` without the arrow. Options: (A) sentences; (B) keep the compact line with words in place of the arrow and the sector always shown; (C) leave the line as a marked fill-in the researcher rewrites.
- Disposition: PREM · Status: fixed (audit loop round 2, 2026-10-31; PREM items built on option A, INFERRED)

**W-21 · Internal version string and a colon-reveal note in the Word file and the print view; the print view has no viewport, no `lang` and no Print control**
- Severity: minor · Kind: copy / layout · Personas: p1-18, p1-19, p2-18, p4-24, p5-17
- Cause: `TOOL_VERSION` = "V7 beta, 2026-10-27 (forked from V6)" (728) is printed in both notes (4934–4935); the print note reads "This is not the template: paste…"; the print document (4924) has no `<meta name="viewport">`, no `lang`, and no button, so a phone shows it at desktop width with no way to print or return.
- Fix: a separate `TOOL_LABEL = "V7 beta"` for researcher-facing text (the draft file keeps the full string); note: "Working draft from the Pathways narrative CV tool (V7 beta), set in 12-point Arial. Paste your text into the current version of SSHRC's template before you submit, and keep within the page limit (…). This note does not print."; add `lang="en"`, the viewport meta and a "Print" button inside the screen note.
- Disposition: FIX · Status: fixed (audit loop round 1, 2026-10-31)

### C. Mentorship

**W-22 · Totals accept negative, decimal and very large numbers, and every count uses them**
- Severity: major · Kind: bug · Personas: p3-07, p4-11, p5-14
- Cause: the tiles store the raw string (3942–3944); `mentorTotal` sums `parseInt` (2127), so "-2" subtracts and "2.5" counts 2 while the tile shows 2.5; the raw strings reach the exports (4855, 4959, 5005) and the rail. `min="0"` is not enforced on typed input.
- Fix: on input keep digits only (strip "-", ".", "e"), cap at 999, store the cleaned string and show it; `step="1"`, `max="999"`.
- Disposition: FIX · Status: fixed (audit loop round 1, 2026-10-31)

**W-23 · A person at level "Other" has no place in the totals: "2 of 1 described", and the draft's totals line contradicts the list**
- Severity: major · Kind: inconsistency · Personas: p1-07, p1-17
- Cause: `MENTOR_COUNT_LABELS` has four tiles (1530–1531) while `MENTEE_STAGES` adds Other (1764); `setPc` prints described of total (3954); the exports print the same totals (4855–4856).
- Fix: Prem's call (Q3). Recommended: a fifth tile "Other" in the totals box (with its label "others" in the totals line), so community trainees and clinical fellows count; the people line then stays "N of T described". Options: (A) fifth tile; (B) keep four tiles and print "N described" without "of T" when N exceeds T; (C) leave it.
- Disposition: PREM · Status: fixed (audit loop round 2, 2026-10-31; PREM items built on option A, INFERRED)

**W-24 · "Describe their level" appears after "Where are they now?", away from Level**
- Severity: polish · Kind: ux · Personas: p1-08
- Cause: the Other box is appended after the Level/Where pair (4042–4046).
- Fix: insert it inside the Level column, directly under the select.
- Disposition: FIX · Status: fixed (audit loop round 1, 2026-10-31)

**W-25 · The ownership check flags "I mentor … I read … and introduced" as having no "I …" nearby**
- Severity: minor · Kind: bug · Personas: p3-08
- Cause: `ACTION_VERBS` (1547) and `IRREGULAR_PAST` (1550) hold neither present-tense verbs common in Mentorship ("mentor", "teach", "supervise", "advise", "run", "chair", "meet", "host", "coach", "train", "review") nor "read"; the flag text says "with no 'I …' nearby" while an "I" is next to the "we".
- Fix: add those verbs; reword the flag "… with no sentence that names your own part."
- Disposition: FIX · Status: fixed (audit loop round 1, 2026-10-31)

### D. Contributions and the writing fields

**W-26 · "What you wrote" keeps stale evidence letters while the editor is open**
- Severity: minor · Kind: bug · Personas: p3-19
- Cause: the top strip is built once when the evidence view renders (3765); item inputs save and refresh the rail (3849) but never rebuild the strip, so "(a, b)" stays after item c is typed.
- Fix: rebuild the strip's refs on evidence input and removal (reuse the card's `update()` path).
- Disposition: FIX · Status: fixed (audit loop round 1, 2026-10-31)

**W-27 · A long unbroken string (a URL) in a field widens the whole page on a phone**
- Severity: major · Kind: layout · Personas: p1-21
- Cause: `.v7-strip p` (417) and the answer and draft text have no `overflow-wrap` rule, so a 408 px word in a 271 px box widens the layout viewport to 460 px.
- Fix: `overflow-wrap: anywhere` on `.v7-strip p`, `.v7-ans-v`, `.v7-draft-body`, `.v7-fold-t`, `.v7-og`.
- Disposition: FIX · Status: fixed (batch 2)

**W-28 · Phone sticky card header truncates the number itself ("Contributio…")**
- Severity: major · Kind: layout · Personas: p1-02
- Cause: on phones the sticky header sets `.v7-card-t { white-space: nowrap }` (353) and the title is one `h3` holding `.v7-num` plus the headline span (3665–3667); the ellipsis eats from the end of the whole line.
- Fix: `.v7-num { flex-shrink: 0 }` with the title as a flex row and the headline span taking `overflow: hidden; text-overflow: ellipsis`, so the row reads "Contribution 2 · A records…".
- Disposition: FIX · Status: fixed (batch 2)

**W-29 · Side-column triangle jumps back to Headline at the foot of the page**
- Severity: minor · Kind: bug · Personas: p5-13, p3-22 (unsure)
- Cause: at the end of the page `_spyCalc` sets `spy = null` (2985) and `_colSync` falls back to `isCur` (2998), which for a complete contribution is `UI.active` = the Headline (3723), so the triangle leaves "What could change" and Evidence for the top square. p3's case (the triangle on Headline after a Still missing link) likely has the same fallback; unsure, retest after the fix.
- Fix: at the end of the page keep the last item whose top is above its square (do not null the spy), and only fall back to `isCur` when no item has reached its square.
- Disposition: FIX · Status: fixed (audit loop round 1, 2026-10-31)

**W-30 · "could not" in Stakes is flagged as a hedge, with a message that names the wrong field**
- Severity: minor · Kind: bug / copy · Personas: p1-22
- Cause: `HEDGES` (1594) holds "could"; the non-impact message (1727) says "this field is for what has happened; what might follow belongs under What could change", with an em dash. "could not" and "couldn't" describe a past inability, which Stakes asks for.
- Fix (INFERRED): skip a hedge followed by "not" or ending in "n't"; message "… describes what happened. What might follow belongs under What could change." without the dash. Inference: Stakes keeps the hedge check (it describes the problem that existed), only the negated forms are exempt.
- Disposition: FIX-INFERRED · Status: fixed (audit loop round 1, 2026-10-31)

**W-31 · The role prompt says "within the team" for Community-engaged with Largely solo**
- Severity: minor · Kind: copy · Personas: p1-06, p4-26 (part)
- Cause: `resolveRoleLineQ` uses the team variant whenever team, community or industry is present (2002–2003), even with solo also chosen; the example shown for that profile has no team.
- Fix (INFERRED): when solo is chosen alongside community only, ask "In one line, what was your part in this work, and who else took part?"; keep the team variant for team and industry. Wording for Prem to override.
- Disposition: FIX-INFERRED · Status: fixed (audit loop round 1, 2026-10-31)

**W-32 · Headline help for Creative / fine arts still says "the paper's title"**
- Severity: minor · Kind: copy · Personas: p4-03
- Cause: `PROMPTS.contrib.title` has a creative question variant but no `helpVariants` (2048).
- Fix (INFERRED): `helpVariants.creative`: "Short, plain and memorable. Name what the work was for; the title of the exhibition or work belongs in the evidence list."
- Disposition: FIX-INFERRED · Status: fixed (audit loop round 1, 2026-10-31)

**W-33 · "How each part sounds in your field" ignores the second field; the two-field example lacks the "This example:" line**
- Severity: minor · Kind: inconsistency · Personas: p3-04
- Cause: the cue list uses `L.discipline` only (3581, 3597–3599); the two-field box's match line is "Shown because you chose a second field." (3593) where the first example prints "This example: field · modes · stage" (3585).
- Fix (INFERRED): with a second field, show both fields' cue lists one after the other; give the two-field box "This example: Health / clinical and STEM / engineering." Inference: the cue list is a lookup, so showing both costs nothing.
- Disposition: FIX-INFERRED · Status: fixed (audit loop round 1, 2026-10-31)

**W-34 · Evidence "The item" is a one-line box and "Why it matters" is a fixed two-row box that scrolls inside itself**
- Severity: minor · Kind: ux · Personas: p1-31, p3-05
- Cause: "The item" is an `<input>` (3846); "Why it matters" is a textarea fixed at two lines (`textarea.v7-two`, 225) with no auto-grow (`fitBox` serves only `.v7-box` inside `.v7-f`, 3313–3320) and no word line.
- Fix (INFERRED): both become auto-growing textareas (reuse `fitBox` logic on input); keep the "(two lines, optional)" label and add the standard word line under "Why it matters" ("N words · up to about 40 is comfortable here"). Inference: the two-line label is guidance, not a limit.
- Disposition: FIX-INFERRED · Status: fixed (audit loop round 1, 2026-10-31)

**W-35 · Leading spaces are kept; a spaces-only headline leaves "Contribution 1 ·"; "1 words"**
- Severity: polish · Kind: bug / copy · Personas: p5-03, p5-04, p5-05
- Cause: values are stored as typed (3303); the card header tests `contrib.title` for truthiness, so "   " yields " · " (3666, 3713); the word line is `res.words + " words"` (2511).
- Fix: trim single-line fields on blur (Headline, role line, competition, the first-sentence boxes); build the header from the trimmed headline; singular "1 word".
- Disposition: FIX · Status: fixed (audit loop round 1, 2026-10-31)

**W-36 · "Undecided" wipes a typed competition name, and turning it off does not restore it**
- Severity: minor · Kind: bug · Personas: p5-01
- Cause: the Setup toggle (3487) and the Change panel toggle (3142) and Confirm (3168) blank `program`. `competitionName()` (3044) already ignores the name while Undecided is on, but `interpolate` (1981), the .txt Context line (4826) and `profileQs` read `program` directly.
- Fix: stop blanking `program`; route every reader through `competitionName()` (prompts, pills, Context line, Setup's "answered" test).
- Disposition: FIX · Status: fixed (audit loop round 1, 2026-10-31)

**W-37 · The Change panel accepts a competition of spaces; the prompt then reads "You're aiming at    (Other / not sure)"**
- Severity: major · Kind: bug · Personas: p5-21, p5-22 (part)
- Cause: Confirm copies `program` untrimmed (3168–3170); `interpolate` treats "   " as a name (1981) and `resolveQ` skips `noProgramQ` because the string is truthy (1984); the programFit question hard-codes "({agency})" (2040), which prints "(Other / not sure)" when no agency is chosen.
- Fix: trim on Confirm; an empty name with Undecided off counts as not answered (the pill reads "Competition not set", the prompt falls back to `noProgramQ`); build the bracket only when the agency is known.
- Disposition: FIX · Status: fixed (audit loop round 1, 2026-10-31)

**W-38 · Setup's footer line misleads after an earlier answer is cleared, and a cleared second field is not announced**
- Severity: minor · Kind: ux / copy · Personas: p5-02
- Cause: the footer is a fixed "The next question opens when you answer this one." (3542) whatever is blocking; clearing the second field when it matches the main field (3511) is silent.
- Fix (INFERRED): the footer names the blocking question ("Answer Competition to open the next question."; with all six shown, "Answer Another field to confirm your profile."); `announce("Another field cleared: it matched your main field.")`.
- Disposition: FIX-INFERRED · Status: fixed (audit loop round 1, 2026-10-31)

**W-39 · The read across contributions flags every contribution and shows twice**
- Severity: major · Kind: ux · Personas: p2-21, p3-09, p1-29 (b)
- Cause: `crossBox()` is rendered under both The problem and Strands (`cross: true`, 4070–4071, 4162); `crossCuttingRead` counts any contribution sharing two terms with every other as "spanning" (4763), and the stop list (4742–4747) lacks generic research verbs and place names, so five same-province contributions all match and print the same paragraph five times.
- Fix (INFERRED): show the box once, under The problem; print the spanning lines only when fewer than half the contributions qualify; add generic verbs to the stop list (tested, shared, trial, model, record, health, hospital, provincial, regional, national, community, partner) and skip words that appear capitalised mid-sentence in the source (proper nouns). Inference on the half rule and the stop list, for Prem to tune.
- Disposition: FIX-INFERRED · Status: fixed (audit loop round 3, 2026-10-31)

**W-40 · First-sentence inputs cut off what is typed**
- Severity: minor · Kind: layout · Personas: p1-29 (a), p2-16, p4-15
- Cause: the three inline boxes are `flex: 1 1 150px` on desktop (407) and `16ch` on phone (557), so "associate professor of mechanical engineering" shows as "associate professo".
- Fix: size each box to its content (`field-sizing: content` where supported, with a JS width fallback from a hidden span), minimum 12ch, maximum the line width, the sentence wrapping onto the next line; on phone the three boxes stack full width with the sentence shown beneath (the strip already does this).
- Disposition: FIX · Status: fixed (audit loop round 3, 2026-10-31)

**W-41 · "I am a écologue": the article rule ignores accented vowels**
- Severity: polish · Kind: bug · Personas: p5-20
- Cause: `articleFor` tests `/^[aeiou]/` on the raw string (2007–2013).
- Fix: normalise to NFD and strip combining marks before the test.
- Disposition: FIX · Status: fixed (audit loop round 1, 2026-10-31)

**W-42 · Statement fields carry no part-colour squares, though the statement example's legend uses them**
- Severity: polish · Kind: inconsistency · Personas: p4-14
- Cause: `SF()` fields have no `job` (4067–4079), so `cardField` draws no `.v7-jd` (3250); the example legend is positional (`borrowJobs`, 4106). D-8 covers Contributions only.
- Fix: Prem's call (Q9). Recommended: give the six statement fields the legend's positional tints so the example and the fields connect as on Contributions. Options: (A) add the squares; (B) leave the statement plain and say so in the decisions log.
- Disposition: PREM · Status: fixed (audit loop round 3, 2026-10-31)

### E. Change panel, navigation, Export and the rail

**W-43 · Export's "Change" leaves Export and lands on Contributions with the panel closed; its line and button differ from the Profile bar**
- Severity: major · Kind: bug / inconsistency · Personas: p2-12, p3-17, p4-18, p5-23, p4-19
- Cause: the button calls `goStage("setup")` (4647–4648); with a confirmed profile `renderStage` redirects `setup` to `contrib` (2345), so the researcher lands on Contributions, scrolled to the top, focus on `<body>`. The line is a plain "Set up for:" with a small outline button, while every writing step has the Profile bar with the `.v7-disc` Change that opens the panel in place (3050–3091, DECIDED 2026-10-29).
- Fix (INFERRED): keep the "Set up for" wording (V7-33, DECIDED) but make its Change the same disclosure button that opens `changePanel()` under the line; Confirm redraws Export and returns focus to Change. Inference: the line stays because it also names the font; the control is the one approved pattern.
- Disposition: FIX-INFERRED · Status: fixed (audit loop round 1, 2026-10-31)

**W-44 · The Change panel has no Cancel, closing it discards edits silently, and Reset draft sits beside Confirm**
- Severity: minor · Kind: ux · Personas: p1-32, p3-18, p4-27, p5-26
- Cause: the panel edits a copy (3080) and Change or Escape closes without a message (3071–3077, 3181); the only buttons are Confirm and Reset draft in one row (3164–3179), both small outline/primary; on phone the Change button moves to its own row when the panel opens.
- Fix: Prem's call (Q6). Recommended: Cancel beside Confirm ("Cancel" closes and announces "Profile unchanged."); Reset draft moves to the panel's foot behind a thin rule with its note, the pattern already DECIDED for the start card; the two reset warnings share one wording: "Clear your draft from this browser? Save a draft file first if you want to keep it." Options: (A) as recommended; (B) Cancel only, Reset stays; (C) leave as is.
- Disposition: PREM · Status: fixed (audit loop round 2, 2026-10-31; PREM items built on option A, INFERRED)

**W-45 · Native confirm() and alert() for removals, loading and reset step two; evidence removal asks nothing; the quoted headline is untrimmed**
- Severity: minor · Kind: inconsistency / ux · Personas: p1-23, p2-09 (part), p3-06, p3-20 (part), p4-06, p4-07, p4-27, p5-12
- Cause: Remove contribution (3680, quoting the full headline), Remove person (4018), Load over an existing draft (1938), a wrong file (`alert`, 1942) and reset step two (5338) use the browser's dialogs; evidence items go on one click (3825). The double reset is DECIDED; step two as the browser confirm is INFERRED (decisions log, line 500).
- Fix: Prem's call (Q2). Recommended: one inline `.v7-warn` pattern for every confirmation (reuse `resetWarning` with the question and the action label: "Remove contribution 2, “A records guide…”?" Cancel / Remove; reset step two "Are you sure? …" Cancel / Clear my draft; load "Opening this file replaces the draft in this browser…" Cancel / Open), a shortened headline (`gvCut(title, 60)`), and an inline line for a wrong file; evidence items stay instant (short, re-typed in seconds) with the announcement from W-04. Options: (A) as recommended; (B) inline for removals only, keep the browser dialogs for reset and load; (C) leave the browser dialogs.
- Disposition: PREM · Status: fixed (audit loop round 2, 2026-10-31; PREM items built on option A, INFERRED)

**W-46 · Load your draft opens silently**
- Severity: minor · Kind: ux / a11y · Personas: p1-33 (part), p4-07 (c)
- Cause: `openDraftFile` renders the resume step with no message (1943–1945); the live region still holds the earlier text. (p5-29's note that saving gives no confirmation is not correct: the rail shows "Saved to your downloads." at 2330 and Export at 4720.)
- Fix (INFERRED): show the session banner "Opened your draft saved on 30 October 2026." (from the file's `savedAt`) with `role="status"`, and focus the step heading (W-01). Inference: reuse the welcome banner element.
- Disposition: FIX-INFERRED · Status: fixed (audit loop round 1, 2026-10-31)

**W-47 · Browser Back leaves the tool from any step**
- Severity: minor · Kind: ux · Personas: p1-25, p3-24, p4-08, p5-25
- Cause: no `pushState`, hash or `popstate` handling anywhere; `history.length` stays as the page arrived.
- Fix: Prem's call (Q7). Recommended: push one history entry per step with a hash (`#contributions`, `#review`), render on `popstate` without pushing, and resolve the hash on load after the gate and confirm rules (`renderStage`'s redirects at 2344–2348 already cover a hash that is not allowed). Options: (A) hash per step; (B) `replaceState` only (reload keeps the step; Back still leaves); (C) leave as is for the beta.
- Disposition: PREM · Status: fixed (audit loop round 3, 2026-10-31)

**W-48 · The privacy line says clearing browser data clears the draft, but the tool writes it back while open**
- Severity: minor · Kind: bug / copy · Personas: p4-10
- Cause: `saveState` writes on every change and on `visibilitychange` (2194–2197) and on each render (2378); if the key was removed from outside, the next save restores the full draft.
- Fix (INFERRED): track that a save has happened; if the key is then found missing on a save, treat it as cleared from outside: stop re-saving, reset to the default state on the next load, and show the existing `#v4-save-warning` line reworded "Your browser data was cleared, so the draft is no longer saved here." Inference: a cleared store means the researcher wanted it gone.
- Disposition: FIX-INFERRED · Status: fixed (audit loop round 1, 2026-10-31)

**W-49 · Rail page count: "roughly 1 pages" for screen readers; "0.5 pp" but "0.5–1 p"**
- Severity: minor · Kind: copy · Personas: p2-11, p4-17, p5-19 (part)
- Cause: the spoken form appends " pages" always (2307); `pagesShort` picks " p" only when `hi === "1"` (2164). The abbreviations themselves are DECIDED (Prem: "1,240 w · 2–3 pp").
- Fix: spoken "roughly 1 page" when the range ends at 1, else "pages"; visible "p" when the range's upper bound is 1 or less, else "pp".
- Disposition: FIX · Status: fixed (audit loop round 1, 2026-10-31)

**W-50 · Review stays faded green in the rail after the gate closes again**
- Severity: minor · Kind: inconsistency · Personas: p5-09
- Cause: a locked Review carries both `is-done` and `is-ghost` (2267); the green-circle rule `.v7-ri.is-done:not(.is-active) .narrative-stage-dot` (611) does not exclude `.is-ghost`, while the label rule (619) does.
- Fix: add `:not(.is-ghost)` to the circle rule.
- Disposition: FIX · Status: fixed (batch 2)

**W-51 · "At a glance" names two things; two words-per-page figures; the length visual's legend and rounding**
- Severity: minor · Kind: copy / inconsistency · Personas: p1-20, p2-19, p3-15, p4-20, p4-21, p5-18, p5-19 (part)
- Cause: Export says "The 5 visuals from At a glance on the Review page" (4618) while Review titles the visuals "What your draft contains" (4262) and "At a glance" is the Still missing / Length box (4313); the length visual's footnote says "At about 500 words a page" (4531) against D-12's "500 to 600" (4330); its legend mixes "Contributions", "Mentorship" and the full official statement name (4509), in a different order from the CV; the headline rounds to tens ("About 10 words" above "14 words", 4510, 4324).
- Fix: Export: "The 5 visuals from What your draft contains on the Review page…"; footnote "At 500 to 600 words a page. The template sets the real length."; legend in CV order with the tool's short names (Personal statement or Background and skills, Contributions, Mentorship); round to tens only above 100 words.
- Disposition: FIX · Status: fixed (audit loop round 1, 2026-10-31)

**W-52 · Review puts five charts between the draft and the order list, and Still missing last**
- Severity: minor · Kind: ux / layout · Personas: p1-14
- Cause: `renderReview` order: working draft, `renderGlance` (4262), Order of contributions, At a glance, Self-check. V7-32 DECIDED draft → order → At a glance → self-check; the visuals were added later between the first two. On a phone the order list starts three screens down.
- Fix: Prem's call (Q8). Recommended: working draft, At a glance (Still missing, Length), Order of contributions, What your draft contains, Self-check, at every width. Options: (A) as recommended; (B) keep the order and fold the visuals behind a disclosure on phones only; (C) leave as is.
- Disposition: PREM · Status: fixed (audit loop round 3, 2026-10-31)

**W-53 · Charts are unreadable at phone width**
- Severity: minor · Kind: layout · Personas: p1-15, p3-25
- Cause: each SVG is drawn in a 520-unit viewBox (`GV_W`, 4364) and scaled to the 290 px column (`width: 100%`, 633), so 12-unit labels render at about 7 px.
- Fix (INFERRED): on ≤ 768 px give `.v7-gv-art svg` a `min-width: 440px` inside a horizontally scrolling figure (`overflow-x: auto`), so the drawing keeps a readable size and the PNGs are unchanged. Inference: scrolling one figure beats redrawing five charts for phones in the beta.
- Disposition: FIX-INFERRED · Status: fixed (batch 2)

**W-54 · On a phone every step opens on a full screen of rail**
- Severity: major · Kind: ux / layout · Personas: p1-01
- Cause: on ≤ 768 px the shell is one column with the rail first (528) and every step change scrolls to the top (2371); the rail (Start page, three steps with metrics, Draft group, gate caption, Save draft) fills about 690–740 px before the step heading.
- Fix: Prem's call (Q10). Recommended: on phones the rail collapses to one sticky row under the top bar, "Contributions · 2 of 5 ▸", that expands to the full list on tap (the disclosure pattern), with Save draft inside the open list. Options: (A) collapsed rail; (B) rail after the content on phones; (C) leave as is.
- Disposition: PREM · Status: fixed (audit loop round 3, 2026-10-31)

**W-55 · Phone: inputs under 16 px (iOS zoom), tap targets under 44 px, quiet buttons white on hover, Change-panel order and label**
- Severity: minor · Kind: layout / inconsistency · Personas: p1-11, p1-12, p2-14, p5-29 (a)
- Cause: `.v7-input` and `.v7-box` are 0.92rem (221, 373), `.v7-select` 0.88rem (242), so iOS Safari zooms on focus; the 44 px rule (564, D-14) covers pills, small buttons, rail items and link buttons but not `.v7-select` (36 px), `.v7-icon-btn` (30 px, 356), the totals inputs, `.v7-rail-home` or the rail-foot buttons; `.v7-quiet-btn` keeps `background: none !important` (510) while the site's `.btn-outline:hover` sets white text, so "Print view" and "Copy draft" vanish on hover; the Change panel lists Agency, Career stage, Field, Another field, Competition, Work mode (3116–3162) where Setup asks Agency, Competition, Career stage, Field, Another field, How your work usually happens (3455–3533), and its label reads "How your work happens" (3150).
- Fix: `@media (max-width:768px) { .v7-box, .v7-input, .v7-select { font-size: 16px } .v7-select, .v7-icon-btn, .v7-tile input, .v7-rail-home, .v7-rail-foot button { min-height: 44px } }` (icon buttons 44 × 44 on phone); `.v7-quiet-btn:hover, .v7-quiet-btn:focus-visible { color: #912338 !important }`; reorder the panel to Setup's order and label the pills "How your work usually happens".
- Disposition: FIX · Status: fixed (batch 2)

### F. Copy

**W-57 · Tool copy that breaks the academic register: em dashes, contrastive and aphoristic closers, colon reveals, a contraction, an unclear label**
- Severity: minor · Kind: copy · Personas: p1-30, p2-20, p3-03, p3-26 (a, b), p4-03 (part), p4-16, p5-28, p1-22 (part)
- Cause: strings in `PROMPTS` (2020, 2028, 2033, 2040, 2045, 2048, 2065, 2069, 2070, 2076, 2080), the Contributions lede (3571), the example titles (3587, 3593, 3925, 4107), the cue-list separator (3606), the gap notes (3893–3896), the hedge messages (1724, 1727), the text-export header (4825, 4827), the Word and print titles (4920, 4924), the privacy line (692), the early-career note (3919), the first-sentence help (4133), the year label (3492) and the Export format note ("None of the agencies accept condensed fonts"). Twenty-two strings in all; the list with proposed rewrites is under Batch 4.
- Fix (INFERRED): the rewrites under Batch 4, each for Prem to override; extend the register checker to the V7 prompt strings so the rule holds.
- Disposition: FIX-INFERRED · Status: fixed (audit loop round 2, 2026-10-31; PREM items built on option A, INFERRED)

### G. Not bugs, decided, or out of scope

**W-56 · Items closed as NO**
- p1-28, p5-27 (rail turns green with any content while Still missing lists gaps): V7-5 DECIDED, "green once opened and something entered"; the spoken ", started" states the rule correctly. Not a bug. (Q11 below asks whether the rule stands.)
- p5-06 (rail "14 w"): DECIDED by Prem ("1,240 w · 2–3 pp").
- p4-12 (person cards have no squares): D-9 DECIDED plain fields; the 2026-10-30 note's phrase "as the Person cards do" is a slip in the decisions log, to correct there.
- p5-24 (Export "Set up for … Times New Roman" with no agency): V7-33 DECIDED wording.
- p5-08 (the gate accepts one-word answers): the DECIDED minimum counts answered fields; fine for the beta.
- p5-29 (f) (no triangle on Setup when all six are answered): nothing is current; by design.
- p2-24 (c) ("Shrink / Show" naming): pass D DECIDED.
- p1-09 (the Mentorship example is senior and Social sciences for every profile): the box says "One example for now"; content scope, not this round.
- p5-29 (e) (saving a draft file gives no confirmation): it does, in the rail (2330) and on Export (4720).
- **Harness artifacts** (not tool bugs): p1-05 and p1-26 (withdrawn by p1: viewport resets between commands), native `<select>` pickers set by script (p1, p3, p4, p5), `confirm()` hanging the harness (p2, p3, p4), stray `chrome://settings/help` tabs (p2, p3, p4, p5), downloads landing in ~/Downloads (p2, p3), p3's "only 2 of 5 PNGs" while other personas downloaded at the same moment, p3's unverified phone sticky header.
- Disposition: NO · Status: closed

---

## Fix batches

Apply in order to the one HTML file; run `node ncv_tool_v7/test-v7.js` after each batch and add the checks listed. Opus for batches 1, 3 and 5 (focus management, assembly, navigation state); Sonnet for 2, 4 and 6 (mechanical CSS and copy). Batch 5 and part of 3 wait on Prem's answers; the rest can start now.

**Batch 1 · Focus and announcements** (Opus) · W-01, W-02, W-03, W-04, W-05, W-06, W-07, W-08, W-09, W-10, W-11, W-12, W-13
- Code: `renderStage` (2336–2379), `announce`/`announceCount` (2910–2924), the evidence buttons (3758–3780, 3861–3867), remove handlers (3679–3683, 4017–4022), `focusin` opener (3355–3360), Setup `pick` (3441–3446), `choiceGrid` and the other radiogroups, `fieldCol` placement (3690, 4119), the glance export button (4621–4631), CSS 368–371 and the focus rules.
- Tests to add: focus lands on the step heading after Start, Confirm profile, a rail click and Load; "+ Add evidence" focuses the first kind card and the Edit button has its own id; "+ Add another item" focuses the new item; removing a contribution or person focuses a card or the Add button and announces; no focusable control inside a closed field; arrow keys move selection in a choice grid; the live region exists at load and is empty after a step change; the last count is announced after the throttle window; "Download all visuals" keeps focus.

**Batch 2 · Phone layout and CSS** (Sonnet) · W-27, W-28, W-50, W-53, W-55, W-13 (CSS part)
- Code: CSS 221, 242, 356, 373, 417, 456, 510, 553–566, 611, 633–640; `.v7-card-t` markup (3665–3667).
- Tests to add: at 375 px no sideways scroll with a 120-character unbroken word in Stakes; the sticky header keeps "Contribution 2" visible with a long headline; inputs and selects are 16 px and 44 px tall on phone; a locked Review shows no green; `.v7-quiet-btn` keeps a visible colour on hover.

**Batch 3 · One assembly for the draft and the exports** (Opus; W-14, W-17, W-20 wait on Q1, Q4, Q5) · W-14, W-15, W-16, W-17, W-18, W-19, W-20, W-21, W-22, W-24, W-25, W-26, W-49, W-51
- Code: `buildWeave` (3883–3898), `contribStrip` (3772–3799), `draftPreview` (4185–4219), `buildExportText` (4822–4866), `buildDraftHtml` (4913–4966), `sectionText` (4982–5011), `menteeWhere`/`menteeParts` (1778–1783), `menteeHead` (3906–3910), the totals tiles (3939–3947), `mentorTotal` (2127), `MENTOR_COUNT_LABELS` (1530), the lint lists (1547–1550), `pagesShort`/rail (2160–2165, 2307), `renderGlanceExport` (4618), `glanceLength` (4509–4531), `TOOL_VERSION` (728), the person card (4042–4046).
- Tests to add: the four outputs agree on order, letters, notes and the absence of kind labels (per Q1/Q4); a note appears in the on-screen draft; newlines inside a field produce one paragraph in the .txt and the copy; "-2" and "2.5" in a tile become "2"; the .txt file name carries the agency and its [gap] lines match Still missing; the Word note contains "V7 beta" and no "forked"; the print document has a viewport meta and `lang`; "roughly 1 page" in the rail; Export's visuals line says "What your draft contains"; "I mentor … we …" raises no ownership flag.

**Batch 4 · Copy and register** (Sonnet) · W-30, W-31, W-32, W-33, W-35, W-38, W-57 (the register sweep below), plus the wording parts of W-19, W-21, W-51
- Code: `PROMPTS` (2016–2082), the example titles (3587, 3593, 3925, 4107), the cue list separator (3606), `buildWeave` gaps (3893–3896), the hedge message (1727), the privacy line (692), the early-career note (3919–3920), Setup year label (3492), `resolveRoleLineQ` (1999–2005), the renderChecks word line (2511), the Setup footer (3542).
- Register sweep (W-57, merged from p1-30, p2-20, p3-03, p3-26, p4-03, p4-16, p5-28), proposed rewrites for Prem to override:
  - Headline help (2048): "Short, plain and memorable. A reviewer should be able to repeat it back from memory. Name what the work was for; the paper's title belongs in the evidence list."
  - One moment help (2069): "One scene in two sentences: a person, a clinic, a classroom, a community meeting, a committee that used it." → without the colon reveal: "One scene in two sentences, such as a person, a clinic, a classroom, a community meeting or a committee that used it."
  - Social outcomes variant (2065): "Who took this up, whether scholars, practitioners, communities, the public or policy makers, and what shifted?"
  - Who else you mentor (2080): q "Who else do you mentor beyond your own students? Take one person and say what you did." help "… community researchers. One concrete example, such as a grant you read, an introduction you made or a committee you brought someone onto, carries more than a list of names."
  - Who gets in help (2076, "so what you changed carries further than what you believe"): "… Reviewers are asked to look at equity in the research process itself, so describe what you changed."
  - The problem help (2020): "One or two sentences on the throughline that runs across your projects."
  - How you got here help (2028): "Many strong statements name a turning point, such as a field you came from, a pivot or a defining collaboration. It explains why your work looks the way it does."
  - Standing early variant (2033): "List your strongest signals so far, such as key papers, fellowships, awards or the scale of a dataset or collaboration. Name what you have."
  - Why this competition (2040): "You are aiming at {program}…" (no contraction); What's next help (2045): "Name the direction of the work in the final sentence."
  - First sentence help (4133): "Your first sentence, plain and direct."
  - Contributions lede (3571), "A few well-explained contributions are stronger than a long list.": "Three or four well-explained contributions carry more weight than a long list." (still comparative; Prem may prefer to drop the sentence).
  - Example titles (3587, 3593, 3925, 4107): "What a finished contribution reads like (Humanities)", "A contribution across two fields (Health / clinical and STEM / engineering)"; cue list items (3606): "Stakes. A gap in current care…" with a full stop in place of the dash.
  - Evidence help (2070): "Each item gets a letter (a, b, c), and the letter appears in your draft beside the sentence it backs up."
  - Gap notes (3893–3896): "Stakes is empty. What problem was this work answering?"; "What already changed is empty. Is there something concrete you can name yet?"; "What could change is empty. What might this change at field scale? Hedged language is fine here."; "No evidence attached. Add one item a reviewer could check."
  - Text export (4825, 4827): "NARRATIVE CV, WORKING DRAFT (V7 beta)"; "Context, for tailoring only, not for submission: …"; print and Word titles (4920, 4924): "Narrative CV, working draft".
  - Privacy line (692): "No AI. Anything you write is your own and stays here, on this device. Clearing your browser data clears the draft too. The checks are fixed rules. It leaves this device only if you email it or save a file."
  - Early-career note (3919): "At an early career stage, describe any informal support, training or inclusive practices…"
  - Setup year label (3492): "(optional)"; Export format note "None of the agencies accept condensed fonts" → "The agencies do not accept condensed fonts."
  - Hedge messages (1724, 1727): full stops in place of the dashes.
- Tests to add: `scripts/ncv-v5-examples.js register` extended to scan the V7 prompt strings; a check that no visible tool string contains "—" outside the worked-example prose and the Word/print titles.

**Batch 5 · Change panel, Export and navigation state** (Opus; W-44, W-45, W-47 wait on Q2, Q6, Q7) · W-36, W-37, W-43, W-44, W-45, W-46, W-48
- Code: `tailoredBar`/`changePanel` (3050–3183), `renderExport` (4643–4650), `openDraftFile` (1933–1950), `resetWarning`/`resetDraft` (5336–5365), the remove handlers, `interpolate`/`competitionName` (1980–1982, 3044), `saveState` (1952–1968), `renderStage` and a new `popstate` handler.
- Tests to add: Export's Change opens the panel in place and Confirm stays on Export; a typed competition survives Undecided on and off; a spaces-only competition in the panel does not reach the prompt; Cancel closes the panel and leaves the profile; removing a written contribution shows the inline warning and Cancel keeps it; Load shows the opened-on banner; after clearing storage from outside, the next save does not restore the draft; Back after a step change returns to the previous step (if Q7 is A).

**Batch 6 · Contributions, Setup and statement details** (Sonnet, with one Opus item) · W-29 (Opus), W-34, W-39, W-40, W-41, W-42 (if Q9 is A), W-52 (if Q8 is A), W-23 (if Q3 is A)
- Code: `fieldCol._spyCalc` (2975–2987), the evidence item markup (3844–3857), `crossBox`/`crossCuttingRead` (4081–4096, 4742–4765), the anchor line (4136–4155, CSS 406–407, 556–557), `articleFor` (2007–2013), `SF()` (4067–4079), `renderReview` block order (4257–4333), the totals tiles.
- Tests to add: at the foot of a complete contribution the triangle marks the last field or Evidence, not Headline; "Why it matters" grows with its text; the cross read appears once and prints no spanning lines when every contribution matches; the first-sentence boxes grow to their text; "an écologue"; Review's block order.

---

## Questions for Prem (ordered by impact; ask one at a time)

- **Q1 (W-14)** Should every assembled paragraph follow the worked example, Stakes first and then your role line in roman type, with the chosen level ("I led it") kept as a cue that never prints? Recommendation: yes (option A); options B (role first everywhere, and change the hint and the 60 examples) and C (print the level as its own sentence).
- **Q2 (W-45)** Should every confirmation in the tool use the inline warning pattern (Cancel plus a named action), including reset step two and loading over a draft, in place of the browser's confirm and alert boxes? Recommendation: yes (A); options B (inline for removals only) and C (keep the browser dialogs).
- **Q3 (W-23)** Should the totals box get a fifth tile, "Other", so a trainee at level Other counts in "N of T described" and in the draft's totals line? Recommendation: yes (A); options B (print "N described" without a total when N exceeds T) and C (leave it).
- **Q4 (W-17)** Should the evidence kind label ("(Peer-reviewed)", "(Other)") be left out of the on-screen draft, Word, Print and the section copy, and kept only in the plain-text working file? Recommendation: yes (A); options B (keep it, but never print "(Other)") and C (drop it everywhere).
- **Q5 (W-20)** Should the mentee lines in the draft be written as sentences ("A doctoral student I trained is now at…, and held…") in place of "Doctoral → Org, Unit. Recognition: …", with the sector named only for Industry, Government and Community agency? Recommendation: yes (A); options B (keep the compact line, words in place of the arrow, sector always shown) and C (a marked fill-in).
- **Q6 (W-44)** Should the Change panel get a Cancel beside Confirm, with Reset draft moved to the panel's foot behind a rule as on the start card, and one wording for both reset warnings? Recommendation: yes (A); options B (Cancel only) and C (leave it).
- **Q7 (W-47)** Should each step push a browser history entry with a hash, so Back and Forward move between steps rather than leaving the tool? Recommendation: yes (A), built after the researcher test if time is short; options B (`replaceState` only) and C (leave it for the beta).
- **Q8 (W-52)** Should Review run working draft, At a glance (Still missing, Length), Order of contributions, What your draft contains, Self-check, at every width? Recommendation: yes (A); options B (fold the visuals behind a disclosure on phones only) and C (leave it).
- **Q9 (W-42)** Should the statement's six fields carry the legend's part-colour squares as the Contributions fields do? Recommendation: yes (A); option B (leave the statement plain and record it in the decisions log).
- **Q10 (W-54)** On phones, should the rail collapse to one sticky row ("Contributions · 2 of 5 ▸") that expands on tap, so each step opens on its heading? Recommendation: yes (A); options B (rail after the content on phones) and C (leave it).
- **Q11 (W-56, p1-28/p5-27)** Does the green rail row stay "opened with something entered" (V7-5), or should green wait for a finish line (every contribution with its six parts; Mentorship with totals, one person and one style answer)? Recommendation: keep V7-5 for the beta and revisit with the test results.
- **Q12 (p3-01, p4-26)** Should "Industry-partnered" become "Partnered with industry, government or health systems", so clinical and health-system researchers have a work mode, and should a "Practice-based / research-creation" mode be added? Recommendation: widen the label now (the prompts already read well for it); hold research-creation until the FRQ test.
- **Q13 (p4-04)** Should the evidence kinds gain "Exhibition / performance / screening" for every field (D-5 set eight kinds)? Recommendation: yes, as a ninth kind with the hint "a show, a screening, a commission or an acquisition".
- **Q14 (p5-11)** Should the only remaining contribution be removable (replaced by a blank card) so a test card can be discarded in one step? Recommendation: yes, when it has content.
- **Q15 (p5-22)** In the Profile pill, "NSERC · Tri-agency CV" spelled out, or "NSERC · TCV" as now (Setup's feedback line defines the abbreviation)? Recommendation: spell it out; the phone pill row already fades at the edge.

### Issues raised by the questions but not in the table

p3-01, p4-26 (work modes, Q12), p4-04 (evidence kinds, Q13), p5-11 (last card, Q14) and p5-22's pill wording (Q15) are product scope rather than defects and are carried as questions only; the agency-not-chosen naming part of p5-22 is fixed under W-37.

## Prem's answers (DECIDED, asked one at a time, 2026-10-30/31)

Every question above was answered; each answer is the recommended option. Items already built on "option A" are now DECIDED, not INFERRED. Status as of 2026-10-31 21:00: **built** = in the file; **to build** = not yet.

- Q1 (W-14) Stakes first, role sentence in roman, level chip never printed. **built** (audit loop round 2)
- Q2 (W-45) Inline warnings everywhere; Reset asks once. **built** (round 2)
- Q3 (W-23) A fifth totals tile, Other. **built** (round 2)
- Q4 (W-17) Evidence kind label only in the .txt. **built** (round 2)
- Q5 (W-20) People-trained lines as first-person sentences. **built** (round 2)
- Q6 (W-44) Cancel beside Confirm; Reset draft at the panel foot. **built** (round 2; status line above still says open)
- Q7 (W-47) "Yes, now": a history entry per step; Back and Forward move between steps; Back from the first step leaves as usual. **built** (audit round 3)
- Q8 (W-52) Review order: working draft, At a glance, Order of contributions, What your draft contains, Self-check. **built** (audit round 3)
- Q9 (W-42) Part-colour squares beside the Personal statement questions, as on Contributions. **built** (audit round 3)
- Q10 (W-54) Phones: the rail collapses to one sticky row showing the current step; tap to expand. **built** (audit round 3)
- Q11 (W-56) Keep V7-5's green-on-any-content rule for the beta. **no build**
- Q12 (p3-01, p4-26) Work mode "Industry-partnered" becomes "Partnered with industry, government or health systems"; research-creation unchanged. **built** (2026-10-31, between audit rounds)
- Q13 (p4-04) Ninth evidence kind worded "Exhibition, performance or screening". **built** (reworded 2026-10-31)
- Q14 (p5-11) The only contribution can be removed when it has content: the inline warning first, then a fresh blank Contribution 1. **built** (2026-10-31)
- Q15 (p5-22) Spell the format out everywhere ("SSHRC · Tri-agency CV", "FRQSC · CV-FRQ"; no "TCV" left), and one phrase "Agency not chosen yet" everywhere. **built** (2026-10-31; TCV kept in running text where defined, INFERRED)

**Standing requirement (Prem, 2026-10-31): every run double-checks accessibility and screen readers before a change is called done.** For each change: a keyboard pass (reachable, visible focus ring, focus never left on `<body>` after an action); a screen-reader pass on the accessibility tree (names, roles, `aria-expanded` / `aria-current` / `aria-disabled`, heading order, live-region messages spoken once with the right text); contrast, 44 px phone targets (D-14), reduced motion and 375 px reflow; a test check for each new a11y behaviour; and a line in the round's report on what was checked and what could not be (no real VoiceOver or NVDA run).
