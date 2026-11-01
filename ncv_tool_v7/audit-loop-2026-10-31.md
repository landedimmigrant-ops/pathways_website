# NCV V7 beta: audit and persona loop, 2026-10-31

Prem asked for a full audit of the V7 tool for errors and bugs, run through tests with researcher personas writing a narrative CV, as a 20-round loop that keeps fixing bugs and improving. This log records each round: who walked the tool, what they wrote, what they found, what was fixed, and the test count.

- **Starting point:** `narrative-cv-prototype-v7.html` at commit `f852933` plus the uncommitted walkthrough batches 1 and 2 (W-01 to W-13, W-27, W-28, W-50, W-53, W-55). Tests 132 of 132. Backup: `backups/v7-2026-10-31-pre-audit-loop/`.
- **Team:** Opus is the engineer and the only writer of the tool file. Persona testers are agents that walk a frozen copy of the file in their own headless Chrome (driver and brief kept with the session, not in the repo); they log only. Fable reviews the code and the direction at checkpoints.
- **Rules:** a fix that needs a product decision is built on the walkthrough's recommended option and marked INFERRED here and in `narrative-cv-v7-decisions.md`, with an Overrides slot for Prem. All draft content is invented.
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
