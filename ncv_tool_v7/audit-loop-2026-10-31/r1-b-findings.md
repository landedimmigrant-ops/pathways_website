# r1-b findings: NSERC chemistry professor, tablet 820 x 1180 (touch), NCV V7 beta, 2026-10-31

Persona walked: Setup (NSERC, Senior, STEM, Team-based + Industry-partnered), four contributions with 8 evidence items, Mentorship (14/9/6/20, four people, three style answers), personal statement, Change panel to CIHR and back to NSERC, Review reorder (facility to first), remove contribution 2 and add it back, exports (Word, Print view, .txt, Copy draft, three section copies, five PNG visuals).

Checked and held up: reorder keeps each text with its number and its evidence letters in the on-screen draft, Word, Print view, .txt, Copy draft and section copy (all four orders identical, letters a/b re-derived per contribution); remove-contribution renumbers and announces ("Contribution 2 removed."); removing an evidence item re-letters and keeps the right note; the agency round trip NSERC to CIHR to NSERC changed only `lens.agency` (plus a `profileChanged` counter) in localStorage, so no text was lost; no console errors in the whole walk.

## r1-b-1 · The first click on "Confirm profile" is lost after the last Setup answer
- Severity: major · Kind: bug
- Where: Setup, last card (How your work usually happens), 820 x 1180; mouse click
- Steps: answer all six questions (NSERC, name, year, Senior, STEM, No second field, Team-based + Industry-partnered); click "Confirm profile". Reproduced a second time later by toggling Team-based off and on and clicking Confirm.
- Expected / Actual: the step changes to Contributions. Nothing happens and the step stays on Setup; the second click works. The driver scrolled the button to the middle of the view and clicked at y 618.4; after the click the button top measured 574.8 (bottom 614.8), so it had moved up about 44 px under the pointer, which now sat 3.6 px below it. Focus is on the button.
- Evidence: shots/08-mode2.png (before), shots/09-contrib.png (after: still Setup, last card re-styled to the shorter "answered" look, Confirm higher). Cause looks like the last question card changing from open to answered when focus leaves it, which moves the button between mousedown and mouseup. A real finger tap may behave differently; unsure, the driver sends mouse events only.
- Suggestion: keep the layout fixed when focus moves to Confirm (collapse the last card only after the click), or confirm on pointerdown/keyboard activation as well.

## r1-b-2 · The ownership warning ignores the role line in the same contribution
- Severity: minor · Kind: ux (relates to W-25, new angle)
- Where: Contributions > What you did, Team-based/Industry-partnered profile
- Steps: write the role line "I designed the catalyst, supervised the three students who ran the screening and wrote the paper."; in What you did write "We screened 240 ligands against 60 substrates with the Aubert Lab and ran kinetic studies on the 12 best catalysts."
- Expected / Actual: no warning, since the card's role line already names the researcher's own part. The field shows: "⚠ “we” or “our” appears 1 time with no “I …” nearby. If every sentence says “we”, reviewers cannot tell what you did." One "we" in one sentence triggers it. 3 of the 4 contributions (facility, nickel catalyst, kinetics package) carried the warning; the fourth used "My group built".
- Evidence: field text read with eval from the open "What you did" field of the nickel-catalyst contribution.
- Suggestion: count the role line when checking, or word the message "“we” appears once in this field and no sentence here says “I”. Your role line carries your own part; keep “we” here when it names the team."

## r1-b-3 · A touch tablet at 820 px receives the desktop control sizes
- Severity: minor · Kind: layout / a11y (relates to W-55, new angle: 769 to 1024 px)
- Where: every step at 820 x 1180 with `pointer: coarse` and `hover: none` both true; `max-width: 768px` false
- Steps: scan all visible controls on each step.
- Expected / Actual: 44 px targets on a touch device. Measured heights (px): rail items 31, Save draft 32, Change 32, Add evidence 32, "Shrink" 32, ↑/↓ on Review 44 (ok), card fold and remove icon buttons 30 x 30, evidence × 30 x 30, side-column squares 24 x 24, "Download image" links 22, Review self-check checkboxes 16 (the label row is 58 px high, so those are fine), selects in Change panel and on person cards 36, totals inputs 39, "← Start page" 15, Setup year pills 34, role-level pills 34. Text inputs render at 14.72 px (under 16 px, so iPad Safari may zoom on focus; unsure).
- Evidence: eval scan output; shots/46-open4.png (30 px ▾ and × side by side on the card header, 8 px apart; × asks a confirm, the evidence × does not).
- Suggestion: key the 44 px and 16 px rules to `(pointer: coarse)` as well as to width.

## r1-b-4 · Review charts have 4.5 to 5.4 px labels at tablet width
- Severity: minor · Kind: layout (relates to W-53, new angle)
- Where: Review > What your draft contains, 820 px
- Steps: open Review; measure the SVGs.
- Expected / Actual: readable labels. Each chart is 224 px wide for a 520-unit viewBox (scale 0.43), so labels render at 4.5 to 5.4 px. The W-53 scroll fix applies only at 768 px and below. The cards also leave a half-empty row ("Length against the page limit" sits alone).
- Evidence: shots/54-charts.png; eval: sizes 10.5 to 12.5 x 0.43.
- Suggestion: apply the min-width and horizontal scroll rule up to about 1000 px, or show one chart per row below 1000 px.

## r1-b-5 · Each evidence item takes about 550 px, so eight items fill four screens
- Severity: minor · Kind: ux
- Where: Contributions > Evidence editor, 820 x 1180
- Steps: "+ Add evidence", choose a kind, fill item and note, "+ Add another item", repeat for 2 items per contribution on 4 contributions.
- Expected / Actual: after the kind is chosen the item shrinks. The eight-card kind chooser (4 rows of 72 px) stays open for every item: `.v7-ev-item` is 547 px, two items 1,104 px, the whole editor 1,399 px. A heavy user with 8 to 10 items scrolls through about 4,400 to 5,500 px of choosers.
- Evidence: shots/16-ev3.png, DOM heights above.
- Suggestion: after a kind is chosen, show it as a one-line "Kind: Peer-reviewed · Change" row, as answered fields do elsewhere.

## r1-b-6 · "Add it back" after removing a contribution means retyping it, and it returns last with no role level
- Severity: minor · Kind: ux (relates to W-45)
- Where: Contributions > open card > × (Remove contribution 2), then "+ Add a contribution"
- Steps: remove the nickel-catalyst contribution (confirm accepted), add a new contribution, retype 8 fields and 2 evidence items, return to Review and press ↑ twice to restore its place.
- Expected / Actual: removal leaves no undo; the contribution can only be recreated blank. It lands at position 4 (order list rebuilt by hand), and its "I led it" level is gone (Review chart: "Across 4 contributions, 1 with a role chosen").
- Evidence: shots/47-removed.png (live region "Contribution 2 removed."); localStorage `roleMode` empty on the new one.
- Suggestion: instead of the browser confirm, remove at once and show "Contribution 2 removed. Undo" for about 10 seconds that restores it in its position.

## r1-b-7 · Changing the agency leaves the competition name unchanged and the prompt mixes the two
- Severity: minor · Kind: ux / copy
- Where: Change panel > Agency, then Personal statement "Why this competition" prompt
- Steps: with competition "NSERC Discovery Grant renewal", set Agency to CIHR, Confirm; open Personal statement.
- Expected / Actual: some cue that the competition name still names another agency. The pills read "CIHR · TCV" and "NSERC Discovery Grant renewal 2027" together, and the prompt reads "You're aiming at NSERC Discovery Grant renewal (CIHR). Why is this the right competition for where you are?" The panel gives no note under Competition. All text was kept (state diff: only `lens.agency`).
- Evidence: shots/26-after-cihr.png; eval of the prompt text.
- Suggestion: when Agency changes and the competition text contains another agency's name or acronym, show under Competition: "This name mentions NSERC. Update it if it no longer applies."

## r1-b-8 · "Print view" does nothing, and says nothing, when the browser blocks the window
- Severity: minor · Kind: ux / a11y
- Where: Export > Print view
- Steps: stub `window.open` to return null (what a blocked pop-up returns), click Print view.
- Expected / Actual: a message. Nothing visible, `#v7-live` empty. The source is `const win = window.open("", "_blank"); if (win) { ... }` with no else branch (line 5097 of the frozen copy).
- Evidence: eval after the click: live "" and no status text.
- Suggestion: add an else branch: "Your browser blocked the print window. Allow pop-ups for this page, or use the Word file."

## r1-b-9 · The skip link is mostly hidden behind the beta banner when focused
- Severity: minor · Kind: a11y (relates to W-12, which is marked fixed)
- Where: any step, first Tab after load, 820 px
- Steps: reload, press Tab once.
- Expected / Actual: a visible "Skip to this step" link. `#v7-skip` is absolute at top 8, 49 px high, z-index 1000; `.proto-banner` is fixed, 43 px high, z-index 1000 and later in the page, so `elementFromPoint` at y 18 and 38 returns the banner and only the bottom 14 px (y 43 to 57) of the link shows. Enter works and moves focus to the step heading.
- Evidence: shots/55-skip.png, shots/56-skip2.png.
- Suggestion: top: 52px for the focused state, or a higher z-index on `.v7-skip:focus`.

## r1-b-10 · At 10 contributions Still missing runs to 31 lines and Review to 4,900 px
- Severity: minor · Kind: ux (heavy use)
- Where: Review, 10 contributions (6 added with headline, stakes and role only)
- Steps: add contributions 5 to 10, open Review.
- Expected / Actual: a short list. "Still missing" prints one link per missing part: 5 per unfinished contribution x 6, plus the statement line, 31 lines in a narrow column beside the Length box; the page is 4,906 px high (3,339 px with 4 contributions). Order changes are one step per tap, so moving item 10 to the top is 9 taps. The Add button is replaced by "You have 10, the most the format allows. Combine related work into one contribution if you need room." (works).
- Evidence: shots/53-review10.png.
- Suggestion: group Still missing by contribution ("Contribution 5: 5 parts and evidence"), and add "Move to top" to the order cards.

## r1-b-11 · The statement prompt repeats the agency when the competition name already holds it
- Severity: polish · Kind: copy
- Where: Personal statement > Why this competition
- Steps: competition "NSERC Discovery Grant renewal", agency NSERC.
- Expected / Actual: "You're aiming at NSERC Discovery Grant renewal (NSERC). Why is this the right competition for where you are?"
- Suggestion: omit the bracket when the competition text already contains the agency name.

## Not reported (harness or known)
- Four totals boxes lost typed digits once when `click` and `type` ran within about 50 ms (all four worked after a 500 ms pause): treated as timing slop.
- Known and seen again, unchanged: W-43 (Export's Change lands on Contributions with the panel closed), W-14/W-16/W-17/W-19/W-20/W-21 (export wording, "(Annual report)" printed after the item, "V7 beta, 2026-10-27 (forked from V6)" in the Word note), W-34 (item box clips the DOI), W-44 (Reset draft beside Confirm), W-45 (confirm quotes the full headline).
