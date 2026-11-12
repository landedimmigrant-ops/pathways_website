# Questions for Prem: NCV V7

One list of everything that waits on Prem or Eli, kept by Claude during the audit loop and after it.

**How this list works**

- New questions go here; they are not asked at the end of each round.
- Claude asks mid-run only for an item marked **Critical**: one that blocks the next piece of work, would be costly to undo, or states a funder fact that should not ship unchecked.
- Everything else is read out once, at the end of the loop (after round 20), or whenever Prem asks for the list.
- Meanwhile the tool runs on Claude's recommended option, marked INFERRED in the loop log, so nothing stalls while a question waits.
- Answer in any order, in chat or in the Answer column. An answered item moves to the end with the date.

Last updated: 2026-11-09. Open: Prem’s checks (Q-28, Q-5), the field-wording read (Q-19) and three points Eli has not answered (Q-29). The answered items apply to V8.

## Critical

| # | Question | Recommendation | Details | Answer |
|---|---|---|---|---|
| Q-28 | Before a first test with a real researcher: open the tool in Safari and Firefox (type, save a draft file, reopen it, copy a section, export Word, print preview). Every test so far ran in Chrome. | About 15 minutes on a Mac; Claude cannot run Safari here. | `r20-findings.md` (readiness) | |
| Q-5 | Open one exported .doc in Word. Does it open in Print Layout at Letter size with 2 cm margins? The headless browser cannot check this. | A two-minute check on your machine before researchers use the Word export. | `r7-findings.md` (r7-a-9) | |

## Copy (your words, so Claude does not change them alone)

| # | Question | Recommendation | Details | Answer |
|---|---|---|---|---|
| Q-19 | The field wording added for Q-18 is Claude's (INFERRED). Read it as each field would: the problem or question for social sciences, humanities, creative and community-engaged work; What you did and What already changed for humanities and creative; What resulted for social sciences; One moment for humanities and creative; the mentoring help for creative. | Read the humanities and creative lines first; they differ most from the default. | `narrative-cv-v7-decisions.md`, "Field wording (Q-18)" | |

## Content to write or commission

| # | Question | Recommendation | Details | Answer |
|---|---|---|---|---|

## Features: build or leave out

| # | Question | Recommendation | Details | Answer |
|---|---|---|---|---|

| Q-29 | **For Eli, still unanswered after 2026-11-04:** (a) is "because reviewers read only the CV" the correct reason for the TCV no-links rule (P-24)? (b) is the FRQ format sentence in the agency help still accurate (P-50)? (c) should the profile ask about leaves (Eli: "let’s think")? | Ask Eli when convenient. None of the three is in the tool, so nothing unchecked ships. | `ncv_tool_v8/eli-answers-2026-11-04.md` | |

## Calls Claude made for you (override any)

Each round's INFERRED calls are listed under that round in `ncv_tool_v7/audit-loop-2026-10-31.md`. The ones most worth a look:

- Round 1: a tab in view takes up the other tab's save at once; bare DOIs are not flagged as links; tablet sizing applies to any touch screen wider than 768 px.
- Round 2: the trainee sentence names the sector and uses no pronoun; the third mentorship prompt is optional at the early career stage.
- Round 3: removing evidence is instant, with Undo for ten seconds; note thresholds of 15 words for a headline and 60 for an evidence item.
- Round 4: Team-based and Largely solo as alternatives; the Export line naming unfinished contributions.
- Round 5: the Community document evidence kind; the First Nations, Inuit or Métis destination; the partners' role prompt for community-engaged profiles.
- Round 6: Undo for a removed contribution; the over-limit signals in the rail, Export and .txt.
- Round 7: a full stop added where parts join; "Lists to rewrite" on Review and Export; the Word file opens in Print view.
- Round 8: the sideways-phone layout; no ownership check on The problem and What resulted; the length verdict's wording.

## Answered

| # | Question | Answer | Date |
|---|---|---|---|
| Q-6 | The plain-language rewrites (P-2 to P-60). | Prem: have Fable review them once more and apply what holds up. 52 applied in V8.7 (23 edited), 2 not applied, 4 already done or replaced, 2 wait on Eli; the decisions head `r8-plain-language-rewrites.md`. Prem can override any. | 2026-11-09 |
| Q-2, Q-3, Q-4, Q-27 | The funder-rule questions for Eli. | Answered by Eli and built in V8.6 (`ncv_tool_v8/eli-answers-2026-11-04.md`). The unanswered parts are Q-29. | 2026-11-04 |
| Q-26 | "part" everywhere; "Save a draft file" everywhere. | 2026-11-03 |
| Q-20 | Yes, all three new levels (partner-led, co-created, done alone) for every researcher, not matched to profile. Changes the saved data and the Your role chart. | 2026-11-03 |
| Q-21 | Yes, all four destinations, for every field. | 2026-11-03 |
| Q-24 | Yes, all three kinds (Preprint, Conference talk or poster, Teaching or curriculum). | 2026-11-03 |
| Q-13 | Count required parts only ("8 of 8") and show the count as text beside the squares. | 2026-11-03 |
| Q-10 | Yes, an optional Draft name on the Start card. The name carries the date the draft was last updated, so it stays current. | 2026-11-03 |
| Q-11 | Put the choice in the step where researchers prioritize and sort contributions: delete it, or save it for later (kept, not printed). | 2026-11-03 |
| Q-15 | Yes, Save draft in each step's bottom buttons. | 2026-11-03 |
| Q-7 | Curly throughout. | 2026-11-03 |
| Q-14 | Wrap onto a second line. | 2026-11-03 |
| Q-16 | Keep the current Tab order. | 2026-11-03 |
| Q-17 | Yes, with a check that the site's own pages look unchanged. | 2026-11-03 |
| Q-22 | Main field first; one order everywhere (role line, role help, Mentorship question). | 2026-11-03 |
| Q-23 | After the researcher test. | 2026-11-03 |
| Q-25 | Yes, in a round of its own, with a11y tests. | 2026-11-03 |
| Q-8 | Yes. Build the examples from the shortlisted triage drafts (`ncv_tool_v8/example-library-triage-2026-11-02.md`); Prem approves each. Q-9 (two-field examples from the other side) waits. | 2026-11-03 |
| Q-9 | Later, with Q-8 first. | 2026-11-03 |
| Q-12 | Leave it out of the core chart. Show each contribution's words and its share of the page budget inside the prioritize-and-sort step (Q-11), next to the delete and save-for-later choices. | 2026-11-03 |
| P-1 | Rename "Stakes"? | "The problem" (commit `2b8bab1`), then broadened by Q-18. | 2026-11-01 |
| Q-18 | A research-question field, or broaden "The problem"? | Broaden. One label, "The problem or question", in the contributions and the statement; the question under it follows the field (same part, same data). Prem: "the questions and wording matter based on your field". | 2026-11-01 |
| Q-1 | Run rounds 9 to 20 back to back? | Yes. | 2026-11-01 |
