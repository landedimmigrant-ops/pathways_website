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
