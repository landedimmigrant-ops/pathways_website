# Questions for Prem: NCV V7

One list of everything that waits on Prem or Eli, kept by Claude during the audit loop and after it.

**How this list works**

- New questions go here; they are not asked at the end of each round.
- Claude asks mid-run only for an item marked **Critical**: one that blocks the next piece of work, would be costly to undo, or states a funder fact that should not ship unchecked.
- Everything else is read out once, at the end of the loop (after round 20), or whenever Prem asks for the list.
- Meanwhile the tool runs on Claude's recommended option, marked INFERRED in the loop log, so nothing stalls while a question waits.
- Answer in any order, in chat or in the Answer column. An answered item moves to the end with the date.

Last updated: 2026-11-01, after round 8.

## Critical

| # | Question | Recommendation | Details | Answer |
|---|---|---|---|---|
| Q-1 | Run rounds 9 to 20 back to back, without a stop between rounds? | Yes. Each round still gets its own local commit and log entry, and nothing is pushed. | The loop paused after each round so far. | |
| Q-2 | **For Eli:** do the five-year totals in Mentorship keep the label "last five years" for a researcher whose window is extended by a leave? (D-1) | Send to Eli. The label stays as it is until Eli answers. | `narrative-cv-v7-decisions.md` (D-1); `r6-findings.md` (r6-b-2) | |
| Q-3 | **For Eli:** is the guidance on career interruptions in How you got here and under the totals correct? It says where a leave goes and points to the funding opportunity's instructions; it states no agency rule. | Send to Eli before the tool goes to real researchers. | `r6-findings.md` (r6-b-1) | |
| Q-4 | **For Eli:** two proposed lines name funder rules. P-24 gives a reason for the TCV no-links rule ("reviewers read only the CV"); P-50 rewrites the FRQ format line. Are both correct? | Send to Eli. Neither is applied. | `r8-plain-language-rewrites.md` (P-24, P-50) | |
| Q-5 | Open one exported .doc in Word. Does it open in Print Layout at Letter size with 2 cm margins? The headless browser cannot check this. | A two-minute check on your machine before researchers use the Word export. | `r7-findings.md` (r7-a-9) | |

## Copy (your words, so Claude does not change them alone)

| # | Question | Recommendation | Details | Answer |
|---|---|---|---|---|
| Q-6 | The 59 remaining plain-language rewrites (P-2 to P-60), including "Standing" to "Recognition" (P-2). | Read the part names and check messages first (P-2 to P-12); they show on every screen. | `r8-plain-language-rewrites.md`, Decision column | |
| Q-18 | "The problem" can read as too narrow (curiosity-driven, humanities and creative work; deficit framing in community-engaged work). Add a research-question field, or broaden the part? | Broaden, no new field. One label in both places, "The problem or question", with the question under it following the field (humanities and creative ask about the question, as the statement's prompt already does). | Asked in chat, 2026-11-01 | |
| Q-7 | Labels the tool writes use straight apostrophes ("The candidate's…") next to the researcher's curly ones. Switch to curly? | Yes, curly throughout. | `r2-b-findings.md` (r2-b-9); `r7-findings.md` (r7-a-8) | |

## Content to write or commission

| # | Question | Recommendation | Details | Answer |
|---|---|---|---|---|
| Q-8 | Mentorship and the personal statement show only a Social sciences example. Write examples for the other four fields, and a community-engaged Mentorship example? | Yes. Claude can draft invented examples for you to approve. | r1-a-5, r2-a-11, r2-b-6, r4-a-7, r5-b-9 | |
| Q-9 | Each two-field example is written from one field's side. Add a version written from the other side? | Later. The match line already says which side an example is written from. | `r7-findings.md` (r7-b-6) | |

## Features: build or leave out

| # | Question | Recommendation | Details | Answer |
|---|---|---|---|---|
| Q-10 | An optional "Draft name" field, so a researcher with several drafts can tell them apart. | Yes, optional, on the Start card. | `r5-findings.md` (r5-a-2) | |
| Q-11 | A "leave out" toggle on folded contribution rows and order cards, so a contribution can stay saved without printing. | Yes. It suits a researcher choosing five of ten. | `r6-findings.md` (r6-a-5) | |
| Q-12 | Split the length chart by contribution? Each row and card already shows its own word count. | Leave out for now. | `r6-findings.md` (r6-a-2) | |
| Q-13 | A finished card reads "8 of 9 answered" because the optional One moment counts. Count only the required parts? Show the count as text beside the squares? | Count required parts only ("8 of 8"), and show the text. | `r3-a-findings.md` (r3-a-14); `r4-findings.md` (r4-b-4) | |
| Q-14 | Profile pills are clipped on narrow screens behind a fade. Wrap them onto a second line, or show "+3 more"? | Wrap them. | `r4-findings.md` (r4-b-3) | |
| Q-15 | On a phone the folded rail row does not stay at the top, so Save draft is out of reach mid-step. Add Save draft to each step's bottom buttons? | Yes. Keeps one sticky row. | `r4-findings.md` (r4-b-6) | |
| Q-16 | On Setup, Tab reaches Confirm only after the six answer buttons in the column. Move Confirm earlier? | Keep it. Setup's column layout was decided in pass E. | `r3-a-findings.md` (r3-a-5) | |
| Q-17 | Heading levels skip (h1 to h3 on the start page). Fixing them touches the shared site styles. Go ahead? | Yes, in a later round, with a check that the site's own pages look unchanged. | `r3-a-findings.md` (r3-a-9) | |

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
| P-1 | Rename "Stakes"? | "The problem". Applied in commit `2b8bab1`. | 2026-11-01 |
