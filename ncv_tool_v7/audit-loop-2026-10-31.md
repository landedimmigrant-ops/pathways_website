# NCV V7 beta: audit and persona loop, 2026-10-31

Prem asked for a full audit of the V7 tool for errors and bugs, run through tests with researcher personas writing a narrative CV, as a 20-round loop that keeps fixing bugs and improving. This log records each round: who walked the tool, what they wrote, what they found, what was fixed, and the test count.

- **Starting point:** `narrative-cv-prototype-v7.html` at commit `f852933` plus the uncommitted walkthrough batches 1 and 2 (W-01 to W-13, W-27, W-28, W-50, W-53, W-55). Tests 132 of 132. Backup: `backups/v7-2026-10-31-pre-audit-loop/`.
- **Team:** Opus is the engineer and the only writer of the tool file. Persona testers are agents that walk a frozen copy of the file in their own headless Chrome (driver and brief kept with the session, not in the repo); they log only. Fable reviews the code and the direction at checkpoints.
- **Rules:** a fix that needs a product decision is built on the walkthrough's recommended option and marked INFERRED here and in `narrative-cv-v7-decisions.md`, with an Overrides slot for Prem. All draft content is invented.
- **Questions for Prem:** every open question is kept in `ncv_tool_v7/questions-for-prem.md` and asked mid-run only when Critical (Prem, 2026-11-01).
- **Persona IDs:** `rN-x` (round N, persona x); finding IDs `rN-x-k`. Walkthrough IDs `W-NN` refer to `walkthrough-2026-10-30.md`.

## Overrides (Prem)

_none yet_

## Rounds

### Round 1 · baseline audit, two personas, the open walkthrough fixes

**Who walked it**
- **Fable code audit** of the whole file: 0 blocker · 3 major · 6 minor ([r1-fable-audit.md](audit-loop-2026-10-31/r1-fable-audit.md)). Escaping held under a hostile probe in every output; the risks are all in the load and save path.
- **r1-a** Assistant professor of sociology, SSHRC Insight Development Grants, community-engaged and team-based, desktop, pastes from an old CV: 2 major · 3 minor · 4 polish ([findings](audit-loop-2026-10-31/r1-a-findings.md), [draft](audit-loop-2026-10-31/r1-a-draft.txt)).
- **r1-b** Full professor of chemistry, NSERC Discovery renewal, industry-partnered, touch tablet 820 × 1180: 1 major · 9 minor · 1 polish ([findings](audit-loop-2026-10-31/r1-b-findings.md), [summary](audit-loop-2026-10-31/r1-b-summary.md), [draft](audit-loop-2026-10-31/r1-b-draft.txt)).

**What they wrote**
- r1-a: three contributions on tenant displacement ("Tracing how “renovictions” cluster in older rental buildings", an open permits-and-evictions dataset, a plain-language community report), 1 master's and 2 undergraduate trainees, a six-part statement; about 1,140 words, 2 to 2.5 of 5 pages. Would take it forward after hand edits.
- r1-b: four contributions (a national NMR facility, a nickel catalyst for amide bonds, a licensed solvent-free hydrogenation, an open-source kinetics package), 49 trainees with four described, a short statement; 1,011 words, about 1.5 to 2 pages. Would take it forward, after editing the role-first sentence order and the kind tags (W-14, W-17).

**Fixed this round**
- Data safety (Fable): a draft is checked before use: text fields become strings, list items that are not objects are dropped, unknown choices (an agency code from a hand-edited file) are cleared, and a failed load leaves the draft in use unchanged (F-1, F-9). A stored draft that cannot be read is copied to `ncv-v7-recovery`, never saved over until the researcher starts again, opens a file or resets, and a line offers the copy as a file (F-2). Two tabs: a save in one tab is taken up by the other, which writes nothing back (F-3). The V6 offer survives a visit that wrote nothing; "Start without it" ends it (F-4). Reset and Load reset the Setup reveal (F-5). Removing a card closes the evidence view (F-6). A blocked print window says so and does not mark Export done (F-7). The checks under a field are no longer a live region; a change in the number of suggestions is spoken once after a pause (F-8).
- Walkthrough FIX items: W-15, W-18, W-21, W-22, W-24, W-25, W-26, W-29, W-35, W-36, W-37, W-41, W-49, W-51; FIX-INFERRED items W-30, W-31, W-32, W-33, W-34, W-38, W-43, W-46, W-48; the .txt file name (part of W-19); the headline in the remove confirmation is trimmed and shortened (part of W-45).
- Persona findings: r1-a-1 (a pasted list is flagged), r1-a-2 (Links to take out on Review), r1-a-3 (number and word counts), r1-a-4 (trimmed competition and headline), r1-a-6 (role chart); r1-b-1 (the first Confirm profile click was lost: the last answered question swapped to its shorter keyword between mouse-down and mouse-up), r1-b-2 (a role line with "I" covers "we" in the card), r1-b-3 (a touch tablet gets the 16 px fields and 44 px targets), r1-b-4 (one chart per row below 1,100 px), r1-b-7 and r1-b-11 (the agency named in the competition), r1-b-8 (= F-7), r1-b-9 (the skip link below the top bar), r1-b-10 (Still missing, one line per contribution).

**INFERRED this round (for Prem to override)**
- F-3: a tab in view takes up the other tab's save at once (it re-renders); a hidden tab waits until it comes back into view and says so.
- F-2: the recovery copy is offered as a JSON file, with impact@concordia.ca for help.
- W-43: Export's "Set up for" line keeps its wording (V7-33) inside the Profile bar's box, with the same Change disclosure.
- W-46: "Opened your draft saved on 31 October 2026." on the step it opens.
- W-48: once the browser data is cleared from outside, the tool stops saving and says so; opening a file, starting again or resetting resumes saving.
- r1-a-2: bare DOIs are not flagged as links.
- r1-b-3: the tablet sizing applies to any touch screen wider than 768 px (`pointer: coarse`).
- r1-b-10: one Still missing line per contribution, linked to its first missing part.

**Open for Prem from this round:** r1-a-5 (early-career examples for Mentorship and the statement), r1-a-7 (an evidence kind for community-held outputs, with Q13), r1-b-5 (fold the kind chooser once a kind is chosen), r1-b-6 (Undo after removing a contribution, with W-45).

**Tests:** 148 of 148 (132 + 16 new checks under "Audit loop, round 1").

### Round 2 · one assembly for every output, inline confirmations, two more personas

**Who walked it** (the round 2 snapshot, after round 1's fixes)
- **r2-a** Mid-career nurse scientist, CIHR Project Grant, Health / clinical + Social sciences, phone 390 × 844, short sessions with reloads, screen-reader cues: 9 minor · 7 polish ([findings](audit-loop-2026-10-31/r2-a-findings.md), [draft](audit-loop-2026-10-31/r2-a-draft.txt)).
- **r2-b** Early-career research-creation artist, FRQ (CV-FRQ), Creative / fine arts + Humanities, French-first typography, desktop: 8 minor · 4 polish ([findings](audit-loop-2026-10-31/r2-b-findings.md), [draft](audit-loop-2026-10-31/r2-b-draft.txt)).

**What they wrote**
- r2-a: an early-mobility guideline adopted by two hospitals, a patient-partnered wound-care trial protocol, a delirium training program for 300 nurses; 7 trainees with two described; a seven-part statement; about 940 words. Nothing lost across six reloads.
- r2-b: a touring sound installation on Montréal's back lanes, a performance co-created with Hochelaga-Maisonneuve residents, an artist's book on a Québec village's soundscape; two undergraduate assistants; Background and skills with the team section; 963 words. Accents, « » with non-breaking spaces, ’ and the decimal comma survived every output; Reset then reopen restored the draft byte for byte.

**Fixed this round**
- **One assembly (W-14, W-16, W-17, W-19, W-20, built on the walkthrough's option A):** the strip, the on-screen draft, Word, Print, the .txt and the section copy all run Stakes, the role line (roman), What you did, What resulted, What already changed, One moment, What could change. Letters are superscript "a, b" in the HTML outputs and "(a, b)" in plain text; the kind is left out of the paste-ready outputs and kept in the .txt as "[Peer-reviewed]", never "[Other]". The headline sits on its own line with no added full stop. Trainees print as sentences ("A doctoral student I trained now works in government at …, and received …"). The .txt is the working copy, with the tool's notes in square brackets, its profile line from the Profile bar and its "Still missing" notes from Review's list. Still missing names Your role when only a level is chosen; a note under the levels says the draft prints the line. The length and the rail count words from the printed text.
- **Every confirmation inline (W-45, option A):** removing a contribution or a person, opening a file over a draft, and both reset steps use the tool's warning with Cancel and a named action; a file that is not a draft gets a line under the Load card. No `confirm()` or `alert()` is left.
- **Change panel (W-44, option A):** Cancel beside Confirm ("Profile unchanged."); Reset draft at the panel's foot behind a rule, as on the start card; one reset wording.
- **Totals (W-23, option A):** a fifth tile, Other, so a trainee at level Other counts ("2 other trainees").
- **Register sweep (W-57):** the 22 strings, rewritten without dashes, colon reveals, contrast framing or contractions; lint messages too. (The register checker is not yet extended to V7 strings.)
- **Persona fixes:** r2-a-1 to r2-a-16 and r2-b-1 to r2-b-12 except r2-b-9 (see the two findings files): the card count with evidence, a health-system and an arts destination, the link note tied to its box and spoken, downloads that name their file, focus after Reset, the full-height draft on phones, "Go to where you were", 44 px targets, the main landmark, the headline as a growing box, the links list on Export, CV-FRQ wording and headings, French-aware word counts, link rules by evidence kind, an "Exhibition / performance" kind, the creative Standing prompt, an optional third mentorship prompt early in a career, the FRQ sector acronyms.
- **From round 1's open list:** r1-b-5 (a chosen kind folds to "Kind: Peer-reviewed · Change").
- A stale pointer fixed in passing: the save-failure line sent researchers to "Review → Copy draft", which is on Export.

**INFERRED this round (for Prem to override)**
- W-14, W-16, W-17, W-19, W-20, W-23, W-44, W-45: built on each item's recommended option A (Q1 to Q6 in the walkthrough log).
- r1-b-5: the folded kind row; r2-a-2: the health-system destination and "Unit or position"; r2-a-9: the "Go to where you were" button; r2-b-3: the creative link exception covers kinds Exhibition / performance and Other; r2-b-6: the ninth kind for every field (Q13) and the arts destination; r2-b-8: the third mentorship prompt is optional at the early career stage.
- The trainee sentence uses no pronoun, and names the sector for industry, government, community agencies, health systems and arts organizations.

**Open for Prem from this round:** examples for fields other than Social sciences in Mentorship and the statement (r1-a-5, r2-a-11, r2-b-6); straight apostrophes in tool-made headings (r2-b-9).

**Tests:** 160 of 160 (148 + 12: one assembly, inline confirmations, persona fixes).

### Round 3 · Fable's review of rounds 1–2, a keyboard-only persona, an edge-case persona, the walkthrough's last items

**Who walked it** (the round 3 snapshot = commit `ed42314`)
- **Fable review** of the rounds 1–2 diff: 2 major · 5 minor ([r3-fable-review.md](audit-loop-2026-10-31/r3-fable-review.md)). Both majors were in the two-tab sync.
- **r3-a** Early-career mechanical engineer, NSERC Discovery, blind, keyboard and screen reader only: 1 major · 7 minor · 8 polish ([findings](audit-loop-2026-10-31/r3-a-findings.md), [draft](audit-loop-2026-10-31/r3-a-draft.txt)).
- **r3-b** Rushed public-health postdoc, CIHR, breaking things on purpose (huge pastes, Arabic, emoji, HTML-looking text, ten contributions, Back and Forward, V6 offer, bad files): 8 minor · 5 polish ([findings](audit-loop-2026-10-31/r3-b-findings.md), [draft](audit-loop-2026-10-31/r3-b-draft.txt)).

**What they wrote**
- r3-a: a compliant gripper for a collaborative robot line and a battery-pack cooling plate; 8 trainees with one described; a seven-part statement; about 700 words. The whole flow works by keyboard.
- r3-b: seven contributions (three full: a rural medication-review trial, a wound-care protocol, a home-check program; four stubs), four people, a full statement; about 955 words (6,800 at its heaviest). Nothing lost; escaping held in every output.

**Fixed this round**
- **Review (G-1 to G-7):** a tab that has stopped saving keeps its own copy and its warning, and the warning no longer suggests a reload (G-1); an open Change panel closes when the profile changed in another tab, and the evidence view follows its card by id (G-2); a typed level keeps its capitals and acronyms take the right article (G-3, also r3-b-3); the on-screen draft uses the bilingual CV-FRQ headings (G-5); one inline warning at a time (G-6); the Setup pointer hold ends on a lost release (G-7). From the reviewer's list: a take-up waits for an IME or dead-key composition, and a page restored from the back-forward cache reads the store again.
- **Walkthrough's last items:** W-39 (the read across contributions shows once, under The problem, leaves out names and generic words, and drops the "spanning" line when half or more qualify; the dead `renderCrossRead` is gone), W-40 (first-sentence boxes as wide as their text), W-42 (statement fields carry the legend's squares), W-47 (each step has an address, so Back and Forward move between steps), W-52 (Review: draft, At a glance, order, visuals, self-check), W-54 (on a phone the rail folds to one row, "Contributions · step 1 of 5"). W-57's register check now runs in the tests over the prompt strings; the last string with dashes is rewritten.
- **Persona fixes:** r3-a-1 to r3-a-8, r3-a-10, r3-a-11, r3-a-13, r3-a-15, r3-a-16; r3-b-1 to r3-b-4, r3-b-6 to r3-b-13, part of r3-b-5 (see the two findings files).

**INFERRED this round (for Prem to override)**
- W-39, W-42, W-47, W-52, W-54 built on the walkthrough's option A (Q7 to Q10, and Q9).
- W-47: the addresses are `#profile`, `#contributions`, `#mentorship`, `#statement`, `#review`, `#export`; an address for a step the gates do not allow is replaced by the step they send to.
- r3-b-6: evidence removal stays instant, with Undo for ten seconds.
- r3-a-7: a unit or position prints in brackets after the organization.
- r3-b-4: 15 words for a headline and 60 for an evidence item are the thresholds for a note.
- G-4: the Your role chart still needs at least one level chosen (no change).

**Open for Prem from this round:** r3-a-5 (Setup's Confirm sits after the column's six buttons in the Tab order), r3-a-9 (heading levels), r3-a-14 ("8 of 9" counts the optional One moment), r3-b-5 (a line on Export naming unfinished contributions).

**Tests:** 174 of 174 (160 + 14: the walkthrough's last items, the review fixes, the persona fixes, the register check).

### Round 4 · Fable's review of round 3, a returning historian, a low-vision engineer at 200% zoom

**Who walked it** (the round 4 snapshot = commit `98c91e1`, which also carries another session's Q12–Q15 work) — all findings in [r4-findings.md](audit-loop-2026-10-31/r4-findings.md)
- **Fable review** of round 3 and Q12–Q15: 2 major · 11 minor, mostly in the new Back and Forward.
- **r4-a** Early-career historian, SSHRC Insight Development Grants, reopening a draft file saved by this morning's build: 6 minor · 4 polish ([draft](audit-loop-2026-10-31/r4-a-draft.txt)). The old file migrated cleanly.
- **r4-b** Senior environmental engineer, NSERC, low vision at 200% zoom (640 × 450): 1 major · 6 minor · 6 polish ([draft](audit-loop-2026-10-31/r4-b-draft.txt)). No sideways scroll anywhere.

**What they wrote**
- r4-a: a monograph chapter on a 1912 mill strike, a digitized mill-town archive, a public exhibition with the local historical society; two trainees; a seven-part statement; about 1,220 words.
- r4-b: real-time control of sewer overflows, an open stormwater model, a biochar PFAS filter, a river nutrient network; 64 trainees with five described; a full statement; 1,314 words.

**Fixed this round**
- **History (H-1, H-2, H-13):** Confirm profile replaces Setup's entry, so Back goes to the start page; an address for a closed step names the step shown and focuses its heading; with no draft started every address is the start page; `popping` always resets.
- **Other review items:** H-3 to H-12 (one Undo timer, blank card with a level, chart label, the chooser held by index, the rail closing on step change, Welcome back after a gated reload, rail focus on rebuild, no step count before Confirm, focus after a take-up, a stopped tab ignoring other tabs).
- **Zoom (r4-b):** the scroll padding follows the real sticky stack and short screens stop the card header sticking (r4-b-1, major); the heading comes into view after a step change; empty squares have a 3:1 edge; sector named once in mentorship sentences; wider panel selects; the Export preview a Tab stop only when it scrolls.
- **Historian (r4-a):** the opened-on line names the profile and Review has the Profile bar; the cue list's footer matches Still missing; Humanities wording for two kinds and the evidence intro; Team-based and Largely solo replace each other; "could learn" is not a hedge; described more than counted is named; the path field's label; people as paragraphs in the copy; day-first date; the solo role prompt in the house register.
- **Small open items from round 3:** Export names unfinished contributions (r3-b-5); `aria-controls` only while a panel exists (r3-a-12).

**INFERRED this round (for Prem to override):** the Profile bar on Review; Team-based and Largely solo as alternatives; the "described more than counted" line in Still missing; the Export line for unfinished contributions; the step heading brought into view; static card headers below 520 px of height; the solo role prompt's new wording.

**Open for Prem from this round:** r4-b-3 (profile pills clipped on narrow screens), r4-b-6 (the phone rail row does not stick; Save draft only in the rail), r4-a-7 (field examples for Mentorship and the statement, again), r4-b-4's text count beside the squares, r4-b-5 (a long first-sentence field at narrow widths).

**Tests:** 188 of 188 (179 + 9: history after Confirm and after a reset, the gated address, solo and team, "could learn", described more than counted, Review's Profile bar and Export's note, the mentorship copy, the scroll padding and squares).

### Round 5 · Fable's review of round 4, a facilitator with three drafts, a Partnership researcher

**Who walked it** (the round 5 snapshot = commit `2aa1c6e`) — all findings in [r5-findings.md](audit-loop-2026-10-31/r5-findings.md)
- **Fable review** of round 4: 1 major · 8 minor (history again: duplicate entries after a gate made some presses silent).
- **r5-a** Research facilitator opening three researchers' draft files in one browser: 3 minor · 2 polish ([drafts](audit-loop-2026-10-31/r5-a-draft.txt)). Nothing crossed between drafts in six switches; every saved file reopened exactly.
- **r5-b** Senior social scientist, SSHRC Partnership Grant with First Nations and Métis partners and a health authority: 9 minor · 3 polish ([draft](audit-loop-2026-10-31/r5-b-draft.txt)).

**What they wrote**
- r5-a: edits to the sociologist's renovictions study, the engineer's sewer-overflow work and the artist's Montréal back-lanes installation (a headline, a role line and an evidence note each).
- r5-b: a community-owned health survey under OCAP® principles, a land-based youth program evaluated with a Nation, a co-authored report adopted by a health authority; 21 trainees including 7 community researchers; 1,418 words.

**Fixed this round**
- **History (J-1, J-2, J-5, J-6):** numbered entries; closed or duplicate entries are passed over in the direction of travel; with no draft open a press stays on the start page and says so.
- **Review's other items:** positioned hedge marks (J-3), the softer described-versus-counted check (J-4), Save draft keeping focus (J-7), throttled mentorship counters (J-8), `\barts?\b` (J-9), a spoken clear from another tab, Still missing outside the contributions in the .txt.
- **Facilitator:** Undo cleared on file load; time in file names and in the opened line; the Start card names the draft by its first headline; the overwrite warning says whether the draft was saved since its last change; a shared-computer line on Export; semicolons in the profile list.
- **Partnership:** the ownership check counts any verb after "I", a chosen level or a written role line, and the statement's first sentence; community-engaged work gets the partners' role prompt and help; rights and rules in agreements are not hedges; a name for the Other trainees; a First Nations, Inuit or Métis destination; agreement lines (One moment, evidence, people, self-check); a Community document kind; a community help variant for "Who gets in"; a prize placeholder; more stop words.

**INFERRED this round (for Prem to override):** the history skip rule; the softer five-year check; the time in file names; the overwrite warning's saved-since wording; the shared-computer line; the partners' role prompt for any community-engaged profile; the Other group name; the First Nations, Inuit or Métis destination; the agreement lines and self-check; the Community document kind.

**Open for Prem from this round:** an optional "Draft name" (r5-a-2); a community-engaged Mentorship example (r5-b-9, with r1-a-5).

**Tests:** 192 of 192 (188 + 4).

### Round 6 · Fable's review of round 5, a senior researcher choosing five of ten, a researcher with two leaves (2026-11-01)

**Who walked it** (the round 6 snapshot = commit `84af742`; the three were cut off by a usage limit and resumed) — all findings in [r6-findings.md](audit-loop-2026-10-31/r6-findings.md)
- **Fable review** of round 5: 1 major · 7 minor (history entries from an earlier draft; the ownership check now too lenient).
- **r6-a** Senior health-services researcher, CIHR, entering ten contributions and cutting to five: 4 major · 3 minor · 1 polish ([draft](audit-loop-2026-10-31/r6-a-draft.txt)).
- **r6-b** Mid-career marine biologist, NSERC, a parental leave, a medical leave and a lab move: 2 major · 5 minor · 1 polish ([draft](audit-loop-2026-10-31/r6-b-draft.txt)).

**What they wrote**
- r6-a: kept a virtual emergency consult service, a pan-Canadian diabetes follow-up trial, a discharge-planning bundle, a long-term care outbreak registry and a kidney-care outcome measure; cut five; 1,204 words after going to 4,144.
- r6-b: kelp forest recovery data kept through two leaves, an eDNA method for lobster habitat, a field course for fisheries technicians; the leaves written into How you got here and Standing; about 1,190 words.

**Fixed this round**
- **Review (K-1 to K-8):** draft generations on history entries; one `ownershipIn()` helper with numerals and quotations excluded; the statement and role-line checks tightened; the rights list narrowed and kept out of What could change; a spoken end to a skip chain; a complete saved-file signature; an opened file counts as saved, with its date.
- **Choosing and cutting (r6-a):** a selection line past five contributions; words per contribution on folded rows and order cards; Undo for a removed contribution and a warning that names what it removes; over the limit in the rail, on Export and in the .txt; one chart per row; "went on to do" answers joined into the sentence.
- **Leaves (r6-b):** where a leave belongs (How you got here) and how the totals' period works, without stating an agency's rule; hedges, passives, dates and the role tick on honest leave wording; the example's window; what Confirm changed; leave words out of the theme list.

**INFERRED this round (for Prem to override):** the selection line and its wording; Undo for contributions; the over-limit signals; one chart per row; the interruption guidance in How you got here and under the totals (for Eli to check against the agencies' instructions); the history generations.

**Open for Prem from this round:** "leave out" or remove on folded rows and order cards (r6-a-5); a per-contribution split of the length chart (r6-a-2); D-1's five-year label for researchers with leaves (r6-b-2, waits on Eli).

**Tests:** 201 of 201 (192 + 9; one history test now resets the tab's history first, since Chrome caps it at 50 entries).

### Round 7 · Fable's review of round 6, a committee member reading the outputs, a digital humanist at 150% text (2026-11-01)

**Who walked it** (the round 7 snapshot = commit `6bb401d`) — all findings in [r7-findings.md](audit-loop-2026-10-31/r7-findings.md)
- **Fable review** of round 6: 3 major · 6 minor (an Undo surviving a take-up, trainee fragments, a wrong "earlier draft" line).
- **r7-a** Peer-review committee member reading the Word, print, .txt and section copies of three finished drafts: 3 major · 4 minor · 1 polish ([the three drafts](audit-loop-2026-10-31/r7-a-drafts.txt)).
- **r7-b** Early-career digital humanist, SSHRC, Humanities + STEM, text at 150%: 9 minor · 3 polish ([draft](audit-loop-2026-10-31/r7-b-draft.txt)).

**What they wrote or read**
- r7-a: the sociologist's, engineer's and artist's drafts. The engineer's read as a narrative CV to paste after a light edit; the sociologist's was held back by pasted lists and run-on joins (fixed this round).
- r7-b: an open-source text-mining tool, a digitized newspaper corpus, a co-authored article; 1,117 words.

**Fixed this round**
- **Outputs (r7-a):** each part ends as a sentence where parts join; lists still in the draft are named on Review, Export and in the .txt; trainee answers that start with a verb join the sentence in any case or tense; the Word file opens in Print Layout and marks the French headings; the Word note is highlighted; "Copy working draft, with notes"; the letters touch the sentence; no indented notes in the section copies.
- **Review (M-1 to M-9):** Undo cleared on a take-up and never duplicates; no "earlier draft" line on the ordinary Back; one page-limit rule ("over" at 600 words a page, "may be over" between); Undo edges; every profile answer counts as a change; the generation on every history write; the year in saved dates.
- **150% text (r7-b):** rail labels, folded rows, tiles and selects reflow; the tool's text sizes are in rem; What resulted names a second field's outputs; the two-field example says which side it is written from; the read across contributions shows words as written; item hints by kind; a heritage destination; a growing box for the person's sentence.

**INFERRED this round (for Prem to override):** the full stop added at joins; Lists to rewrite on Review and Export; the Word Print-view setting; the one page-limit rule; the heritage destination wording; the two-field example's "written from" line.

**Open for Prem from this round:** open one exported .doc in Word to confirm Print Layout at Letter with 2 cm margins (r7-a-9); two-field examples written from each side (r7-b-6); the five-year label (D-1, r7-a-7).

**Tests:** 206 of 206 (201 + 5).

### Round 8 · Fable's review of round 7, a phone held sideways, a clinician-scientist writing in a third language (2026-11-01)

**Who walked it** (the round 8 snapshot = commit `f3d959c`) — all findings in [r8-findings.md](audit-loop-2026-10-31/r8-findings.md)
- **Fable review** of round 7: 2 major · 7 minor (trainee names read as verbs, lower-case starts after the new full stops, doubled stops, rail words broken at 150%).
- **r8-a** Early-career freshwater ecologist, NSERC Discovery, a phone held sideways (812 × 375), then the laptop through a saved draft file: 6 minor · 2 polish ([draft](audit-loop-2026-10-31/r8-a-draft.txt)).
- **r8-b** Mid-career rehabilitation clinician-scientist, CIHR Project Grant, English as a third language, reading every label for plain language: 1 major · 7 minor · 2 polish, and 26 rewrites ([draft](audit-loop-2026-10-31/r8-b-draft.txt), [rewrites for Prem](audit-loop-2026-10-31/r8-plain-language-rewrites.md)).

**What they wrote**
- r8-a: a stream-health index used by ministry crews, an eDNA protocol for invasive crayfish, a volunteer stream-monitoring program; 819 words. Nothing was lost between the phone and the laptop.
- r8-b: a stroke rehabilitation protocol, a tele-rehabilitation program, a return-to-work questionnaire; 23 trainees; 1,074 words.

**Fixed this round**
- **Review (N-1 to N-9):** a trainee answer that starts with a name prints whole as its own sentence; a part typed in lower case starts with a capital; no doubled stops after closing marks; button sizes; the rail column in rem so its labels keep whole words at 150% and 200% text; the .txt's link and list notes in its header; one end-of-sentence rule; year-led lines are not lists; the read across rebuilt on each read.
- **Phone held sideways (r8-a):** the one-column layout with the folded rail; the Other name box at 16 px and 44 px; tiles that reflow; focus kept in view after a fast Tab and after Add or Edit evidence; "each one" is not a number; the contribution Undo in the removed card's place; the whole step header in view.
- **Plain language (r8-b):** "I am the principal investigator" names your part; Stakes and What resulted are not asked for it; "could walk" is a past ability; the length line gives a verdict; a sentence-shaped outputs prompt; a visible line on the join words; a message of its own for "prestigious"; a line saying the checks do not check grammar; more vague words; placeholders that show where the words print.

**INFERRED this round (for Prem to override):** the sideways-phone layout rule (touch, wider than 768 px, at most 520 px high); no ownership check on Stakes and What resulted; the "I am the…" ownership forms; the length-verdict wording; the "prestigious" message; the rail column at 13.75rem; the nine plain-language lines applied from r8-b.

**Open for Prem from this round:** the 60 remaining plain-language rewrites (P-1 to P-60, a Decision column in the rewrites file), including renaming "Stakes" and "Standing"; P-24's reason for the TCV link rule and P-50's FRQ line, for Eli.

**Tests:** 217 of 217 (206 + 11).

**After round 8 (Prem, 2026-11-01):** P-1 decided and applied. "Stakes" is now "The problem" on the card, the legend, the charts, Review, Export and the .txt; the data key stays `stakes`. Tests: 218 of 218 (217 + 1).

**Q-18 (Prem, 2026-11-01): field wording, same data.** The first part is "The problem or question" in the contributions and the statement, and its question follows the field (problem for STEM and health, question for humanities and creative, both for social sciences, need or question for community-engaged work). Field wording also added to What you did, What already changed, What resulted, One moment and the mentoring help (INFERRED, Q-19). From round 9, each persona also reads the wording as their field. Tests: 221 of 221 (218 + 3).

### Round 9 · Fable's review of round 8 and the field wording, a research-creation choreographer, a health researcher working with a First Nations health authority (2026-11-01)

**Who walked it** (the round 9 snapshot = commit `1fcad1c`), all findings in [r9-findings.md](audit-loop-2026-10-31/r9-findings.md)
- **Fable review** of round 8 and Q-18: 4 major · 2 minor (number words after "the", the rail column at large text, sentence-case trainee answers, "a …" left in lower case). The field wording itself checked out.
- **r9-a** Mid-career choreographer, FRQSC research-creation (CV-FRQ), Creative / fine arts + Social sciences, reading every prompt as their field: 1 major · 12 minor · 5 polish ([draft](audit-loop-2026-10-31/r9-a-draft.txt)).
- **r9-b** Senior health researcher, CIHR Project Grant, community-engaged with a First Nations health authority that sets the questions and owns the data, keyboard only for one contribution: 1 major · 11 minor · 3 polish ([draft](audit-loop-2026-10-31/r9-b-draft.txt)).

**What they wrote**
- r9-a: site-specific dance works made with warehouse workers, a public archive of movement scores, a community dance program for older adults; about 1,500 words.
- r9-b: a home-care nursing program led by the health authority, a community-owned diabetes dataset, community health workers trained as co-researchers; 1,505 words.

**Fixed this round**
- **Review (R-1 to R-6):** number words count again after "the"; the breakpoints in em, with a capped rail and wrapping step buttons; trainee answers typed with a capital join the sentence and names stay whole; "a …" and accented starts take a capital; one list detector; "I was a …" needs a role word.
- **Field fit, creative (r9-a):** a question in The problem or question is not checked for hedges; the hedge example, What resulted's example, What could change, the role question, Standing's help, the evidence introduction, kinds and notes, the join word, the Mentorship placeholders and help all follow the field; dance companies count as arts organizations.
- **Field fit, community-engaged (r9-b):** Mentorship says "trained or mentored" and "where they are now", and a community researcher prints as one you mentored; What you did, What resulted, What could change, One moment, the statement, Standing, the mentoring prompts, the self-check and the field panel name the partners' part; the Dataset and Community document placeholders.
- **Checks and keyboard:** passives with "by" or "with" people; "could" in a reported question; "how many"; a role change re-reads the card; Space keeps the chosen role level; the field column is one Tab stop.

**INFERRED this round (for Prem to override):** the em breakpoints and the 30% rail cap; "I mentored" for a person under Other in a community-engaged profile; the main field's wording comes before the community-engaged wording where a field has its own (Q-22); all the new field wording (listed in r9-findings.md, part of Q-19).

**Open for Prem from this round:** role levels for partner-led and co-created work (Q-20); an "Independent or self-employed artist" destination (Q-21); a community-engaged worked example in which a partner raised the question (with Q-8).

**Tests:** 234 of 234 (221 + 13).

### Round 10 · Fable's review of round 9, an early-career historian on a phone, a low-vision engineer with large browser text (2026-11-01)

**Who walked it** (the round 10 snapshot = commit `61c6742`), all findings in [r10-findings.md](audit-loop-2026-10-31/r10-findings.md)
- **Fable review** of round 9: 1 major · 6 minor (a capitalised title no longer named your part, a gap between the em breakpoints, the role-level clear, organization names in trainee sentences, over-broad passive exemptions, the advisor packet's checks, the rail's Mentorship line).
- **r10-a** Early-career historian of medicine, SSHRC Insight Development, the whole walk on a phone with its automatic capitals: 3 major · 6 minor · 3 polish ([draft](audit-loop-2026-10-31/r10-a-draft.txt)).
- **r10-b** Senior civil engineer with low vision, NSERC Discovery, the browser's text size at 28, 24 and 20 px, mouse and keyboard: 3 major · 6 minor · 3 polish ([draft](audit-loop-2026-10-31/r10-b-draft.txt)).

**What they wrote**
- r10-a: opening asylum casebooks to researchers, a history of nursing in Quebec hospitals, a public history podcast; 1,165 words.
- r10-b: a bridge-monitoring sensor network used by a transport ministry, an open vibration dataset, a damage-detection method; 65 trainees; 1,093 words. No sideways scroll at any text size.

**Fixed this round**
- **Review (S-1 to S-7):** titles in capitals name your part; range-syntax breakpoints with no gap; "Clear the level" for the role levels; organization and two-word names stay whole; passives with a date after "by" or "with participants" are flagged; one check context for screen, advisor packet and feedback; the rail's Mentorship line; every modal in a reported question.
- **Phone capitals and trainee sentences (r10-a):** the statement's first sentence, organizations and prizes lose a phone's capital article; "is now at a university (History)"; "Now a…", "Teaching…" and "Works at…" answers print as sentences; each person card shows "Prints as: …"; the prize instruction is a help line; a field reached by Tab is brought into view once it opens.
- **Large text (r10-b):** typed text scales above 16 px; Setup tiles, charts, introductions, the rail toggle, the skip link and the self-check boxes follow the text size; a solid focus ring on fields; focus on Undo after a removal; a low step heading is brought to the top.
- **Field fit:** humanities wording (role example, Mentorship, headline, Standing, trainee placeholder); STEM wording (evidence introduction and hints, What resulted, One moment, the role and "we" examples, totals, What you did); "us" is not read as "we"; largely solo work with a partner.

**INFERRED this round (for Prem to override):** "Clear the level" in place of click-to-clear; lowering a phone's capital article and common role word; "Prints as" under each person; the solid focus ring; focus on Undo after a removal; the new humanities and STEM wording (part of Q-19).

**Open for Prem from this round:** a role level for work done alone (Q-20); a "College, CEGEP or school" destination (Q-21); for Eli, whether a DOI may be written as plain text in the TCV (Q-4).

**Tests:** 249 of 249 (234 + 15).

### Round 11 · Fable's review of round 10, a francophone public-health researcher writing in French, a blind sociologist with a screen reader (2026-11-01)

**Who walked it** (the round 11 snapshot = commit `f895d32`), all findings in [r11-findings.md](audit-loop-2026-10-31/r11-findings.md)
- **Fable review** of round 10: 5 major · 9 minor · 1 polish (a jump when Undo ended, a dropped organization, an empty read-back, verbs taken for names, "-ing" titles; Safari media queries; small layout regressions).
- **r11-a** Mid-career public-health researcher, FRQS (CV-FRQ), Health + Social sciences, writing the whole draft in French: 2 major · 9 minor · 4 polish ([draft](audit-loop-2026-10-31/r11-a-draft.txt)).
- **r11-b** Early-career sociologist who is blind, SSHRC, keyboard and screen reader only: 11 minor · 9 polish ([draft](audit-loop-2026-10-31/r11-b-draft.txt)).

**What they wrote**
- r11-a: a vaccination outreach program co-designed in Montréal-Nord, a regional health survey of 3 200 people, community health worker training; 1,318 words. French text survives every output.
- r11-b: gig workers' scheduling, an interview dataset, a policy brief adopted by a city; about 1,010 words. Every task could be finished without sight.

**Fixed this round**
- **Review (T-1 to T-15):** Undo's end, organizations kept, the read-back restored, verb-before-name joins, titles left whole, scrolls that respect the user, classic media queries, sizes restored, the equity question by work mode, "The Ottawa Hospital", "in Marketing".
- **French (r11-a):** number words, "3 200", inline "1) …", "facteur d'impact" and "indice h", elided capitals, French stop words, the group name as typed, a note that the checks read English; Quebec health bodies and clinical trainees.
- **Screen reader (r11-b):** evidence fields named by item; "Prints as" read with its box; join words and the read-back hidden; locked steps give their reason; one "Next question"; "Clear the year"; Escape in the kind chooser; page titles per step; named files; shorter chart text; the current rail step focuses its heading.

**INFERRED this round (for Prem to override):** classic media queries with a 0.001em offset; "Clear the year"; the new community role example; the social sciences statement question; the wording changes above (part of Q-19).

**Open for Prem from this round:** French drafts (Q-23): a draft-language choice that gives French frames for the trainee sentences, the Totals line and the first sentence, French checks, the 6-page French limit, French join words and `lang` on the outputs.

**Tests:** 256 of 256 (249 + 7).

### Round 12 · Fable's review of round 11, a clinician-scientist pasting ten contributions from Word, an arts-based health researcher on an iPad reopening a V6 draft (2026-11-01)

**Who walked it** (the round 12 snapshot = commit `5ded397`; the walks stopped at a usage limit and were resumed), all findings in [r12-findings.md](audit-loop-2026-10-31/r12-findings.md)
- **Fable review** of round 11: 1 major · 7 minor (an English "(n = 45)" lost its number; French number words and digit joins touched English text; stale announcement and kind state).
- **r12-a** Senior cardiology clinician-scientist, CIHR, ten pasted contributions cut to six: 5 minor · 4 polish ([draft](audit-loop-2026-10-31/r12-a-draft.txt)).
- **r12-b** Early-career arts-based health researcher, CIHR, Creative + Health, community-engaged, on an iPad, opening a V6 draft file: 1 major · 6 minor · 4 polish ([draft](audit-loop-2026-10-31/r12-b-draft.txt)).

**Fixed this round**
- **Review (U-1 to U-8):** French rules gated on a French-text test; list markers only at sentence starts; stale Setup and kind state cleared; a status banner that is read; "an NGO"; the French note.
- **Pasted text (r12-a):** inline numbered lists, a leading bullet, tabs, intervals and ranges counted once, em-dash word counts, "my research" as ownership, "our guidelines", the page range near the limit, "(applying 2027)".
- **V6 and tablet (r12-b):** the opening line explains a file from an earlier version; a hint when the agency changes under a competition name; 44 px buttons and banner links on touch tablets; the field panel keeps the field's cue; a second field adds lines to What you did and What already changed.

**INFERRED this round (for Prem to override):** the French-text test; the earlier-version message (parts kept in the file, not shown); the second-field lines (part of Q-19).

**Open for Prem from this round:** a care-home destination (Q-21); health examples for Mentorship and the statement (Q-8).

**Tests:** 261 of 261 (256 + 5).

### Round 13 · Fable's review of round 12, a social scientist working in bursts (tabs, history, resets), a computer scientist with a confidential industry partner (2026-11-01)

**Who walked it** (the round 13 snapshot = commit `7c267c4`), all findings in [r13-findings.md](audit-loop-2026-10-31/r13-findings.md)
- **Fable review** of round 12: 2 major · 8 minor (French short fields, "my research" hiding a "we" problem, names read as French, ranges, figure numbers as lists).
- **r13-a** Early-career social scientist, SSHRC, two tabs, history, reloads, field switches, Reset, cleared site data: 2 major · 4 minor ([draft](audit-loop-2026-10-31/r13-a-draft.txt)).
- **r13-b** Mid-career computer scientist, NSERC Alliance, STEM + Social sciences, industry partner under a confidentiality agreement: 5 minor · 4 polish ([draft](audit-loop-2026-10-31/r13-b-draft.txt)).

**Fixed this round**
- **Review (V-1 to V-10):** a sturdier French-text test; "my research" reverted; Université; the agency hint; closed ranges; list runs; dash word counts; "*" kept; the earlier-version test.
- **Data safety (r13-a):** a tab holding a written draft never takes up a blank one; the cleared-data warning is an alert that stays in view and updates after Save draft; visible notes when another tab closes an Undo or a question, and for an earlier draft; Reset says whether the file is current; "Go to the next part to write".
- **Confidential partners and software (r13-b):** a line for private names and figures; patents, partner letters, software releases and repository links; STEM wording for models, datasets and deployments; the trainee placeholder by level; the competition name in quotation marks.
- **Tests:** a fixed set of check sentences (H1, short French, French-derived names, spaced dashes, figure numbers, ranges).

**INFERRED this round (for Prem to override):** keeping a tab's draft over a blank one from elsewhere (it stops saving and warns); the sticky alert; the confidentiality line; the STEM and evidence wording (part of Q-19).

**Open for Prem from this round:** none new.

**Tests:** 267 of 267 (261 + 6).

### Round 14 · Fable's review of round 13, a geographer who uses voice control, a postdoc with a thin record, a leave and a field switch (2026-11-01)

**Who walked it** (the round 14 snapshot = commit `ad982cb`), all findings in [r14-findings.md](audit-loop-2026-10-31/r14-findings.md)
- **Fable review** of round 13: 6 major · 5 minor (the phone alert, French names, the cache path, cross-tab Reset).
- **r14-a** Mid-career geographer using voice control, SSHRC: 2 major · 5 minor · 3 polish ([draft](audit-loop-2026-10-31/r14-a-draft.txt)).
- **r14-b** Early-career postdoc, CIHR, Health + Social sciences, a leave and a field switch: 2 major · 6 minor · 2 polish ([draft](audit-loop-2026-10-31/r14-b-draft.txt)).

**Fixed this round**
- **Review (X-1 to X-11):** the alert on phones, French name runs and homographs, spoken stage notes, the cache path refusal, a Reset in another tab mirrored, link wording.
- **Voice control (r14-a):** Undo with no time limit (until the next change); confirmations that stay; names that start with the visible words; a larger Undo.
- **Early career (r14-b):** preprints and talks under Other; an honest empty What already changed; no "short" verdict at the early stage; the leave note; co-supervision; early-career prompts.

**INFERRED this round (for Prem to override):** Undo until the next change instead of ten seconds; Reset mirrored across tabs; the early-career wording (part of Q-19).

**Open for Prem from this round:** preprint and talk kinds (Q-24); the filled-field design for voice users (Q-25).

**Tests:** 270 of 270 (267 + 3).

### Round 15 · Fable's review of round 14, a nursing researcher with dyslexia and ADHD, a permafrost engineer working offline (2026-11-01)

**Who walked it** (the round 15 snapshot = commit `21a07b8`), all findings in [r15-findings.md](audit-loop-2026-10-31/r15-findings.md)
- **Fable review** of round 14: 1 blocker · 2 major · 5 minor (a comment-swallowed line broke Move up; Undo survived clicks; French lines with articles).
- **r15-a** Mid-career nursing researcher with dyslexia and ADHD, CIHR, interrupted and returning: 1 major · 7 minor · 4 polish ([draft](audit-loop-2026-10-31/r15-a-draft.txt)).
- **r15-b** Mid-career permafrost engineer, NSERC, writing offline, checking print and Word: 7 minor · 5 polish ([draft](audit-loop-2026-10-31/r15-b-draft.txt)).

**Fixed this round**
- **Review (Y-1 to Y-8):** Move up restored (and a whole-file scan for swallowed lines); Undo ends on clicks and choices; French articles; the gap line; one Export message per card; the cache-restored Reset; STEM preprint hints; the early-career equity question.
- **Cognitive load (r15-a):** a note for a role sentence in the problem part; the people note in short lines; a shorter read across; no hyphenation; a Proofread self-check; a Welcome-back link that names the question; health outputs and destinations.
- **Offline and print (r15-b):** the connection line; the print view's snapshot note; keep-with-next and unsplit evidence in print and Word; italic notes; First Nations, Inuit or Métis wording; design guides and standards.

**INFERRED this round (for Prem to override):** Undo ending on any changing click; the Proofread self-check line; the copy changes above (part of Q-19).

**Open for Prem from this round:** none new (the long help blocks join Q-6).

**Tests:** 273 of 273 (270 + 3).

### Round 16 · Fable's review of round 15, a committee member reading three drafts' outputs, a researcher on a small, slow phone (2026-11-01)

**Who walked it** (the round 16 snapshot = commit `7f6d852`), all findings in [r16-findings.md](audit-loop-2026-10-31/r16-findings.md)
- **Fable review** of round 15: 1 major · 6 minor (the Word note, Undo on navigation clicks, the self-check count, keep-with-next, cleared data versus Reset).
- **r16-a** Senior reviewer reading the outputs of three earlier testers' drafts: 2 major · 4 minor · 4 polish ([the .txt exports](audit-loop-2026-10-31/r16-a-draft.txt)). Every output agrees with the screen.
- **r16-b** Early-career researcher in Indigenous studies on a 320 px phone, four times slower: 8 minor · 4 polish ([draft](audit-loop-2026-10-31/r16-b-draft.txt)).

**Fixed this round**
- **Review (Z-1 to Z-7):** evidence notes and headlines as blocks in Word; Undo ends only on changing controls; the self-check count; French name runs; a Reset mark to tell Reset from cleared data; the gap note.
- **Committee read (r16-a):** lower-case numbered runs; a French-draft note on Export; no two bracket groups; group names lowered mid-list.
- **Small phone (r16-b):** tiles at large text; "An a"; the Other tile; 44 px buttons; community agreement under The problem or question; an oral-history role example.

**INFERRED this round (for Prem to override):** the Undo allow-list; the Reset mark; the French-draft note; the community agreement line and role examples (part of Q-19).

**Open for Prem from this round:** none new (Q-20, Q-23, Q-24 grow).

**Tests:** 279 of 279 (273 + 6).

### Round 17 · Fable's review of round 16, a new professor with no agency or competition yet, a low-vision researcher in high contrast with reduced motion (2026-11-01)

**Who walked it** (the round 17 snapshot = commit `017af9c`), all findings in [r17-findings.md](audit-loop-2026-10-31/r17-findings.md)
- **Fable review** of round 16: 1 blocker · 1 major · 6 minor (a comment hid the headline field's settings; Reset with a full store).
- **r17-a** Assistant professor, agency "Not sure yet", competition Undecided, then SSHRC, then CV-FRQ and back: 1 major · 5 minor · 4 polish ([draft](audit-loop-2026-10-31/r17-a-draft.txt)).
- **r17-b** Kinesiologist with low vision, CIHR, Windows high contrast, reduced motion, dark scheme: 1 major · 5 minor · 3 polish ([draft](audit-loop-2026-10-31/r17-b-draft.txt)).

**Fixed this round**
- **Review (AA-1 to AA-8):** the headline field restored, and a **static test that fails on code hidden behind a trailing comment**; Reset's removal independent of its mark; Reset told by its time; the French note per contribution; no doubled help; one-word group names; the number strip; no stale take-up behind a warning.
- **No agency yet (r17-a):** both formats' rules on Export; the Word note; a disabled-looking Competition field; the agency hint; "select Undecided"; a blank draft counts 0 words.
- **High contrast and reduced motion (r17-b):** example parts labelled, done and chosen states and field focus visible in forced colours; nothing animates with reduced motion; darker small-control borders.

**INFERRED this round (for Prem to override):** the bracketed part labels in forced colours; the global reduced-motion rule.

**Open for Prem from this round:** a dark scheme (not built); a line saying the team answer is kept and left out of the TCV.

**Tests:** 282 of 282 (279 + 3).

### Round 18 · Fable's review of round 17 and a whole-file pass, two end-to-end regression walks (2026-11-01)

**Who walked it** (the round 18 snapshot = commit `cc60013`), all findings in [r18-findings.md](audit-loop-2026-10-31/r18-findings.md)
- **Fable review** of round 17 and the whole file: 2 major · 8 minor (a community group name lowered; the French note's coverage; dead code).
- **r18-a** Sociologist of education, SSHRC, desktop, everything in order: 6 minor · 2 polish ([draft](audit-loop-2026-10-31/r18-a-draft.txt)).
- **r18-b** Physiotherapy researcher, CIHR, phone, everything in order: 1 major · 5 minor · 6 polish ([draft](audit-loop-2026-10-31/r18-b-draft.txt)).

**Fixed this round**
- **Review (AB-1 to AB-10):** group names as typed; the French note by section; tab list markers; "Untitled contribution" not counted; one test for live contributions; a hidden tab mirrors a Reset; a visible reason on the disabled Competition field.
- **Regression walks:** the "1 word" / "$1" bug in every empty field's count (a never-matching pattern that matched empty text); grade labels; no hedge or number checks on the role line; partner or community agreement; evidence Undo in view; 44 px Undo and Reset; health One moment wording; clinic destinations; a 60-character Other kind.

**Open after the loop:** dead code to remove (AB-7); one precedence for field and work-mode wording (AB-5, Q-22).

**Tests:** 285 of 285 (282 + 3).

### Round 19 · Fable's register audit of rounds 9 to 18 and review of round 18, a solo media artist, a biomedical engineer with two partners (2026-11-02)

**Who walked it** (the round 19 snapshot = commit `c07c172`), all findings in [r19-findings.md](audit-loop-2026-10-31/r19-findings.md)
- **Fable** read every string added in rounds 9 to 18 against the house register (22 flagged) and reviewed round 18 (AC-1 to AC-4).
- **r19-a** Early-career media artist, SSHRC, Creative + Humanities, largely solo: 9 minor · 3 polish ([draft](audit-loop-2026-10-31/r19-a-draft.txt)).
- **r19-b** Senior biomedical engineer, CIHR, STEM + Health, company and hospital partners: 3 minor · 4 polish ([draft](audit-loop-2026-10-31/r19-b-draft.txt)).

**Fixed this round**
- **Register:** 21 added strings rewritten to the house register; the empty What already changed wording made one across help, gap line and .txt.
- **Code (AC-1 to AC-4):** the advisor packet's contribution test; group names (common nouns lowered, names of peoples and places kept); a mirrored Reset once; the hidden-code test widened to `else`, `catch` and `finally`.
- **Field fit:** creative role example and note prompts by kind; an institution-free first sentence; vague verbs checked only in your own clauses; a line for minors; trial registrations, registries, a health scene in One moment, an unnamed-company hint, STEM Standing help.

**Open for Prem from this round:** "part" or "field" in check messages, and one name for the save button; the source for "up to 10 contributions".

**Tests:** 287 of 287 (285 + 2).

### Round 20 · Fable's final review and readiness verdict, a blind historian's final screen-reader pass, a first-time nurse-researcher on a tablet (2026-11-02)

**Who walked it** (the round 20 snapshot = commit `684f857`), all findings in [r20-findings.md](audit-loop-2026-10-31/r20-findings.md)
- **Fable** reviewed round 19 (AD-1 to AD-8, all minor or polish) and gave a readiness verdict.
- **r20-a** Historian who is blind, SSHRC, keyboard and screen reader: 2 minor · 1 polish; no regressions ([draft](audit-loop-2026-10-31/r20-a-draft.txt)).
- **r20-b** Community-engaged nurse-researcher, CIHR, first time, tablet: 2 minor · 2 polish; no regressions ([draft](audit-loop-2026-10-31/r20-b-draft.txt)).

**Fixed this round:** group names (common words lowered, names as typed); "PhD candidate"; the own-clause rule with a positive test; the One moment health and agreement lines; the unnamed-company placeholder; "at ___" for academic ranks; Review jumps announced; evidence buttons named; the folded role; the Competition placeholder.

**Tests:** 289 of 289 (287 + 2). One timing test (r10-a-11, a field brought into view after Tab in a short window) failed once and passed on rerun; it is timing-sensitive.

## Loop summary (rounds 1 to 20, 2026-10-31 to 2026-11-02)

- **Who walked it:** 40 researcher personas across all five fields, every work mode, three career stages, four agencies and both formats; desktop, phone (320 to 390 px), tablet, sideways phone; keyboard only, screen reader, voice control, 200% zoom and large browser text, Windows high contrast, reduced motion, a slow processor, offline, French text, pasted Word text, ten contributions, two tabs, V6 files; a committee member read the outputs twice. Fable reviewed the code after every round.
- **Tests:** 132 at the start, 289 at the end, including a static check that fails on code hidden behind a trailing comment (three such slips reached a commit before the check existed).
- **What the loop did not test:** browsers other than Chrome; the Word file in Word; a real researcher.
- **Principles set by Prem during the loop:** field wording on the same data (Q-18); one running questions list (`questions-for-prem.md`), asked only when critical.
- **Before the first real-researcher test** (Fable's order): Safari and Firefox; the .doc in Word (Q-5); Eli's four funder questions (Q-2, Q-3, Q-4, Q-27); Q-26; a one-page test protocol.
- **After the loop:** remove about 200 lines of dead code (AB-7); one order for field and work-mode wording (AB-5, Q-22); one word counter and one page estimate; split the file into named sections; the open polish items in rounds 16 to 20.

