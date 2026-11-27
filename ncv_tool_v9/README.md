# Narrative CV tool (V9 beta): developer pointer

V9 was forked on 2026-11-26 from V8.20 (commit `3c0b8cb`) to apply the language pass: every row marked Decided in [`../ncv_tool_v8/language-notes.md`](../ncv_tool_v8/language-notes.md). V8 stays frozen as a reference. New work goes into V9. This folder's `index.html` is a thin redirect.

| What | Where |
|---|---|
| **Source of truth** (all markup and logic, one file) | [`../narrative-cv-prototype-v9.html`](../narrative-cv-prototype-v9.html) |
| **Stylesheet dependency** | [`../styles.css`](../styles.css) |
| **Headless test** | `pkill -f "ncv-v9-test-"; NCV_CDP_PORT=<free port> node ncv_tool_v9/test-v9.js` (Node 22+, Google Chrome) |
| **Apply plan** | [`../ncv_tool_v8/apply-plan-v8.21.md`](../ncv_tool_v8/apply-plan-v8.21.md) (written as V8.21; released as V9) |
| **Wording decisions** | [`../ncv_tool_v8/language-notes.md`](../ncv_tool_v8/language-notes.md), rules in [`../ncv_tool_v8/LANGUAGE-RULES.md`](../ncv_tool_v8/LANGUAGE-RULES.md) |
| **Design rules and vocabulary** | [`../ncv_tool_v8/DESIGN.md`](../ncv_tool_v8/DESIGN.md), [`../ncv_tool_v8/VOCABULARY.md`](../ncv_tool_v8/VOCABULARY.md) |
| **Version history** | [`CHANGELOG.md`](CHANGELOG.md); V8's in [`../ncv_tool_v8/CHANGELOG.md`](../ncv_tool_v8/CHANGELOG.md) |
| **Related versions** | V8 (frozen at 8.20): [`../ncv_tool_v8/README.md`](../ncv_tool_v8/README.md) |

Storage: the draft lives in `localStorage` under `ncv-v9`. On the first V9 load in a browser, a draft saved by V8 (`ncv-v8`) opens as the V9 draft, once and without a message; V8's copy is never changed, and the mark `ncv-v9-carried` keeps Clear draft from bringing it back. The tester sign-up stays under `ncv-v8-tester`, so signed-up testers are not asked again.

## Testing with researchers (Cloudflare and Neon)

**Address for testers:** https://research-8kh.pages.dev/ (unchanged). The Cloudflare Pages project `research` now serves V9: `cloudflare/` moved here from `ncv_tool_v8/` on 2026-11-26, and `cloudflare/build.sh` copies the V9 file. Deploy with `cd ncv_tool_v9/cloudflare && npm run deploy`. The Neon tracking and `functions/api/tester.js` are unchanged.

## INFERRED in V9.0

- The V8 draft opens without a message, since testers see the same draft they left.
- The tester key keeps its V8 name, so a sign-up carries over.
- The V7 offer box (`v6Offer`) is no longer used; its code stays until a later clean-up.
- Batch 1 (S0): the title link's tooltip is the page name itself, "Start" or "Continue".
- Batch 2 (S6): the card reads "Draft: “[name]” saved." (draft name, else the first contribution's headline, else "Draft saved."); the "(Clearing your browser data erases it. [Save a backup file].)" line sits under the card, outside the button.
- Batch 2 (S8, S18): the status date uses `savedWhen` ("Backup saved at 09:08, no changes since." today, "…on 24 October at 09:08…" otherwise); saving from the confirm updates its status in place and keeps the confirm open; the confirm group is named by its question and its status line. The Contributions-page confirm shares the function and the behaviour.
- Batch 2 (S14a, S14b): text that is not valid JSON gets S14a; a newer file version or a failure to apply gets S14b.
- Batch 2 (S4): the short phone version of the privacy line ("No AI. Anything you write stays here.") is unchanged; S4 named the full line only.
- Batch 2 (T4): the promise box has a 1px gold border, the same tint and a 6px radius; the Export and feedback promise boxes share the class and changed with it. Their wording ("We do not collect anything you write in your CV.") was not in T4 and is unchanged.
- Batch 2 (T10): a failed sign-up shows no message; the silent retry is kept.
- Batch 3 (P9): an alias map `MODE_ALIAS` sends Industry, Public sector, Health system, Non-profit and Cultural sector to the existing partnered examples, and Indigenous communities to the community-engaged ones, for the example pick, the prompt variants, the private-partner help line and the role wording; stored values `indigenous`, `publicsector`, `healthsystem`, `nonprofit`, `cultural`; the swap message also shows in the Change panel.
- Batch 5 (M2, M5, M6, M7): M2's line is the same for every field; M5's Organization tip is a help line under the field for the industry kind only; M6's creative and community hints are built from the row's parts; M7's help and hint share one help box. The Mentorship example legend reads "Mentorship approach", "Team composition" and "Informal mentorship", the field labels.
- Batch 7 (R11a, R12): "No evidence yet" clears itself once an evidence item is written (decided); "No impact yet" stays as ticked when What already changed is also written (not decided: the text prints and the tick only counts).
- Batch 7 (test timing, not a wording choice; **fixed in V9.1**, see the CHANGELOG): opening the evidence view can start a smooth scroll; a step change within about half a second can end with the new heading lower on the page. V8 has the same race; R11 makes it show in one test (a role level alone no longer counts, so the card's layout differs). The step change now scrolls with `behavior: "instant"`, and the test waits for the evidence scroll to finish. Worth a look in the browser check.
- Batch 4 (row 2): the example line's field, way-of-working and stage phrases are plain words of the subagent's ("mostly on their own", "with the public sector").
- Batch 4 (row 12): the pill's text is dark (#333) on the part's tint with the accent as its edge; each text box takes the accent as its border; gold is #b07d00.
- Batch 4 (row 8): "Add back" sits beside a folded set-aside row; Review's nearby text reads "Add one back" and "if added back".
- Batch 4 (C1, PS1): for the CV-FRQ, "personal statement" reads "background and skills".
- Batch 4 (C6, C9, C12, C16, C19, C20a, C20h): the community "if a partner asked" line kept; community-engaged work gets "who owns it?"; the STEM and creative lists end "that used the work"; the remove confirm drops the evidence clause when there is none; the C19 marker is a small burgundy dot; "Your contribution…" for every kind; quantity words get "If you have a specific total", "well-received" and similar get "Please name the specific thing".
- Batch 6 (PS4): the social sciences variant dropped (the default already says "problem or question"); humanities "Across your research, what is the central question your work keeps asking?".
- Batch 6 (PS5, PS7, PS3, PS12): early career gets both hints; community help ends ", and name your partners’ part."; the PS3 panel's button keeps its label, toggles with aria-expanded and closes with Escape, empty text "No contributions written yet."; the card and strip text are the same for the CV-FRQ.
- Batch 6 (PS9a foot): CV-FRQ "This example is fictional. It includes a sentence for the CV-FRQ team question."; TCV "This example is fictional."
- Batch 8 (R8 hints): Public talk or outreach, kind card "a public talk, a podcast or an op-ed you made for the public", item "The title, the venue or platform and the date; for your own series, its audience", note "Whom it reached, and how it bears on your question". Media coverage, kind card "news coverage or a critical review of your work", item "The outlet, the title and the date", note "What the piece says about the work".
- Batch 8 (EV-1): Review's Add-evidence kind list shows all 15 kinds and defaults to the column's first kind. Changing an item's kind on Contributions keeps its stored column (`used`); Prem answered in EV-1b (V9.2): the column can be changed on Review, where it is shown.
- Batch 8 (R5, R-1, R10, R-2, R9): the R5 question and "See …" link use the lower-case section name ("your background and skills" for the CV-FRQ); a missing statement reads "Your personal statement is not written yet."; R-1 counts a level only with its role sentence, and a sentence with no level reads "No role is chosen yet."; R10 names "the doctoral student", or "the person" with no level, and the chart's screen-reader label begins "Where the people you describe are now:"; R-2 also covers What could change; the R9 fact holds while marks change within the same contributions.
- Batch 9 (E3): page ranges print with an en dash ("6–7"), one page as "6"; one link keeps "One link is…", other counts are numerals.
- Batch 9 (E5): the old "format" tick is replaced by Reader, Template and Page limit; a saved "format" tick no longer shows.
- Batch 9 (E8): with no agency the box's title stays "You must use the agency’s template."
- Batch 9 (E10): What already changed's hint in the text file reads "[question] If there has been no impact yet, please describe the potential impact under What could change, or tick No impact yet on Contributions."; every other part's hint is its own question.
- Batch 9 (E11): the FRQ sentence sits before "Please delete this note…".
- Batch 9 (sweep): the Change panel's ways of working have no grey lines (it is a compact panel); its "Choose at least one way your work usually happens." is unchanged, since Set up has no decided wording for it. Export's edit card heading wraps at phone width (it reached 401 px at 375 px).

## INFERRED in V9.2

From EV-1b (Prem, 2026-11-26: "I don't want people to look for solutions, I want them to be able to change things or undo when they need to").

- Review's evidence editor names the choice "Column", with the two column headings as its answers; it sits between Kind and Details, in the Reach tab's radio style.
- An item with no stored column stores one only when it is moved (or added on Review), so it goes on following its kind until then. A kind change, on Review or on Contributions, keeps a stored column.
- Saving a moved item says where it went: "Evidence saved for contribution 1, under Where others used it."
- One Undo at a time: a new removal ends the last Undo. Save in a Review editor, an area mark on Review, Save for later, Add back and "+ Add an area" now count as changes that end an Undo.
- Where the Undo line sits: Review evidence, in the column the item left; Areas of research, in the removed area's place; Mentorship, in the person's place; the Review order, above the list; Saved for later, in its box (or where the box was).
- The lines read "Evidence removed.", "Area 2, “[name]”, removed.", "Person B removed." and "“[headline]” deleted.", each followed by Undo; the removal is spoken with "Undo is available until your next change.", as on Contributions.
- An area with no name and no marks, and a person with nothing written, go without Undo, as an empty contribution does.
- Deleting the last complete contribution on Review closes Review and opens Contributions; its own Undo line ("Contribution 1 … removed. Undo") takes over there.
- A restore that would pass the cap (4 areas, 10 contributions) says so and waits, as on Contributions.
- On a phone, Review's evidence editor stays at the width of the screen while its table scrolls sideways (in V9.1 Details and Save could sit partly off the edge).

## INFERRED in V9.3

Prem: "check the rest of the tool for the same gap, check anything else and lets push it". Every removal, clear and reset in V9.2, and every line shown without a way to change it there, was checked.

- Clear draft (start page and Change panel) offers "Draft cleared. Undo" at the top of the start page; Undo brings the draft back with the step it was on ("Draft restored."). An empty draft goes without Undo.
- Opening a backup file over a draft offers "Your previous draft was replaced. Undo" under the "Backup file … opened." banner; Undo brings back the draft that was open ("Previous draft restored."). Focus stays where the opened step puts it; the Undo is spoken with the banner.
- Undecided (Set up and the Change panel) still empties the competition (P5); pressing it again brings back the name it emptied. The name is kept for the session only, not in the saved draft.
- "None of these" on Review still clears a contribution's areas; pressing it again brings them back (session only). Pressing an area forgets them.
- Export: each sentence the tool writes (the first sentence, each evidence list, the totals line, each trainee sentence) has an "Edit" button after it that opens the answer it is written from. The visible word is "Edit", to keep the draft readable; the button's name says what it opens ("Edit person B on Mentorship"). The decided hint above the draft (E4) stays.
- Left as they are: Save for later (Add back reverses it, last in the order, Q-11); a role level (C17: picking another level is enough); Solo and Team-based, and the second field (one choice each, picked again where shown); profile changes (the Change panel works on a copy, Cancel drops it); text in boxes (the browser's own undo).

## INFERRED in V9.8

Prem asked: "wondering if we need to put a note to use this app on desktop?" Proposed one line on the start page, on a phone only; Prem: "Yes, add it" (DV-1).

- The wording is the example given with the proposal, unchanged: "To write and export your CV, we recommend a computer."
- "On a phone" is 640 px wide or less, as WB-1. A tablet (641 px and up) does not see it.
- It is the third line of the start page's intro, after the guide link and before the privacy line, in the intro's own style (no note box, no icon). It shows only where the intro shows, so not on the tester sign-up screen and not on later steps.
- It advises and blocks nothing: the tool still works on a phone.
- Review's intro already says "We recommend completing this step on a computer." It stays as it is.
- Not changed, logged as DV-2 for Prem: the full privacy line says "works offline on your computer", which a tablet shows. Proposed: "in this browser".

## INFERRED in V9.7

Prem chose option A for the word bar on a phone (WB-1): "Yes, option A".

- Built as the designer redrew A for the part box (`design/accent-review-2026-11-26.md`, T7): each row is an editable box (white, grey line, pencil) with a 10px part box under the name. The first mock-up filled the row itself with the tint; that was drawn before the part box was chosen.
- "On a phone" is 640 px wide or less, the tool's phone width elsewhere.
- The scale is the longest single part across all contributions, plus a fifth, fixed while the researcher types; a part that grows past it fills the row.
- A part not yet written is a dashed row with "+" and "0 words", and no box.
- The open row takes a 3px line in its colour, as the open block on a desktop (the designer suggested 2px).
- One button serves as the desktop block and the phone row, so the label, the open state and Undo are shared. If the width changes while a part is open, its editor moves between the bar and the row and keeps the focus.
- The open part's text box now grows with its text (at least 5 lines), as the tool's other boxes do. On a phone, 5 fixed lines cut off the start of a 33-word part; on a desktop the change shows only for a long part.

## INFERRED in V9.6

Prem chose "Yes, 0–4px" for corners, then "just focus on narrative cv tool": the tool only, not the site.

- Each shape takes the Concordia token for its kind (`design/accent-review-2026-11-26.md`, Corners): fields (inputs, text boxes, selects) 0, as `.form-control`; notes and hints 0, as `.alert`; buttons, chips, tags, part names and editable boxes 2px, as `.btn`; cards, panels, choice tiles, the example box and the step list 4px, as the Pathways cards.
- Chips and tags are 2px, not fully round. Concordia keeps neutral chips fully round; in the tool every tag sits beside a part name, which is already a 2px box, so one shape was kept.
- Circles stay round: the pencil disc, number badges, ticks and dots. They have no corners.
- Only corners changed. Notes keep their lines and colours; Concordia alerts have no line, and that is not changed here.
- Two panels come from the site stylesheet (the step list and the session banner); the tool overrides their corners in its own styles, so `styles.css` is untouched.
- The check is `design/corners-audit.js` (every screen, desktop and phone, no corner over 4px except circles) and two V9.6 tests in `test-v9.js`.

## INFERRED in V9.5

From the part box test (`design/part-box-test/findings.md`). Prem said "Will you fix all these and push"; read as choosing the part box over the straight stripe.

- The example's sentences use `box-decoration-break: slice` (one box per sentence, open where a line wraps), not the `clone` in the designer's spec, which boxed every line.
- The open word-bar block takes a 3px line (hover and focus 2px, rest 1px). A deeper tint was considered and left out, so text contrast stays as tested.
- High contrast: the open block takes a 3px `Highlight` line, and written parts on a folded contribution stay filled (`CanvasText`), like the progress squares.
- Written parts on a folded contribution are solid squares in the part's line colour (`--pi`), so they read as progress and not as checkboxes; Review's legend marks are 20 by 12 px part boxes, the bar's blocks in small. The two differ on purpose: one shows progress, the other names a colour.
- Word-bar blocks lose the 4px of left padding that made room for the stripe (padding 0 6px); this is what stops the numbers being cut off with WCAG text spacing on a phone.
- The unused skeleton view (`renderExemplarBox`) was converted to part boxes, not deleted.
- Gold stays #8a6200 even though, for some colour-blind readers, it matches the orange or green line: every gold dark enough for 3:1 does (6 shades tested). Tints and names still separate the parts.
- Corners elsewhere (cards 10px, text boxes 6px) were unchanged until Prem answered Q3 (built in V9.6). The prototype site was unchanged until Q2 (ST-2).

## INFERRED in V9.4

From the accessibility audit (`a11y-audit-2026-11-26.md`).

- Every link-style button (`button.v7-linkbtn`) is at least 24 px tall on every screen, including those inside a sentence, where it can add a pixel or two to the line; on a phone or touch screen they are 44 by 44 px, as before, and short ones ("Edit", "Undo", "Hide") widen to 44 px.
- The Mentorship chart box becomes a tab stop only while it scrolls sideways (role group, named by its caption), and stops being one when the window is wide enough.
- The word bar's narrowest parts on a 320 px phone stay 28 to 37 px wide (WCAG 2.5.8 met, D-14 not): widening them would misstate the word shares. Open for Prem.
