# Tester questions: proposal (2026-11-03)

Each question below answers one open question about the tool. Nothing here is built yet; the live tool still asks the six questions from 2026-11-02.

## What the tool already records, so no question needs to ask it

- **Funder, field, career stage and work mode**, from Setup (the `profile` column).
- **Where the tester stopped**, from the last step opened (`last_step`). This covers testers who never reach Export.
- **Time spent**, from `started_at` and `finished_at`.
- **Browser**, from `user_agent`. This also shows whether anyone tested in Safari or Firefox (Q-28).

## Start: three questions, before the tester sees the tool

| # | Question | Answers | What it tells us |
|---|---|---|---|
| S1 | What are you starting from? | Nothing written yet · An earlier narrative CV · A traditional CV or the Common CV · Notes or a past application | Whether researchers rewrite from scratch each time. This is the case for the portfolio idea ("build once, assemble many times", ideas log 2026-09-30) and for an import step. |
| S2 | When is your application due? | Within a month · In one to three months · Later than three months · No specific application yet | Whether the tool is used under deadline or for practice. It puts the usefulness rating in context, and tests the idea of asking what the CV is for (ideas log 2026-10-30, A1). |
| S3 | What concerns you most about writing a narrative CV? | Choosing what to include · Showing impact · Writing about myself · The mentorship section · Keeping to the page limit · The funder's rules · Something else | Which part of the tool carries the most weight for researchers. Each answer maps to one part of the tool, and E1 asks about it again at the end. |

## Finish: four questions and an optional box, on Export

| # | Question | Answers | What it tells us |
|---|---|---|---|
| E1 | At the start you said your main concern was *[S3 answer]*. How much did the tool help with it? | 1 (Not at all) to 5 (A great deal) | Whether the tool helps with the concern each researcher arrived with. It replaces the general usefulness rating, which says little on its own. Testers who skipped S3 see the general question. |
| E2 | Did the questions and examples fit your kind of work? | They fit · Mostly, with some wording from another field · They read as written for another field. Optional box: Which ones? | Whether the per-field wording works (Q-19, all INFERRED) and where examples are missing (Q-8: Mentorship and the statement have only a Social sciences example). Read against the field recorded in Setup. |
| E3 | What will you do with this draft next? | Keep working on it in this tool · Move it into Word or another document · Paste it into the funder's form · Show it to a colleague or advisor · Set it aside | Which exports matter (Word is still unchecked, Q-5), whether the tool is a place to finish or a place to start, and whether the parked advisor features should return (ideas log, "Parked from V6"). |
| E4 | Which parts of this draft would you reuse for your next application? (Choose any) | The contributions · The evidence under each contribution · The mentorship record and totals · The personal statement · None, I would start again. Optional box: Anything else you would keep? | What a researcher would carry from one application to the next, part by part. This decides the shape of the portfolio idea (ideas log 2026-09-30): which modules a saved bank holds, and whether the statement belongs in it. Read against S1: a researcher who started from an earlier narrative CV and would reuse the contributions is the case for building it. Added at Prem's request, 2026-11-03. |
| E5 | One change that would help most (optional box) | Text | The open question from the current set, kept for anything the four above miss. |

## Alternates, if one of the above should change

- **Which language will you write in?** English · Français. This tests whether the French draft build (Q-23) is worth a round of its own. It could replace S2.
- **Which funder are you applying to?** This repeats Setup, so it is useful only for testers who leave before Setup.

## What changes in the build

- S3 answer is stored on the tester record so E1 can quote it.
- E4 is the tool's first choose-any question: checkboxes in a fieldset, with "None, I would start again" clearing the others.
- The end card gets a fifth, optional box.
- The Pages Function's allowed answer keys change (`source`, `due`, `concern`; `concernHelp`, `fit`, `fitWhich`, `next`, `reuse`, `reuseOther`, `change`).
- Rows from the first set (`funding`, `before`, `want`, `useful`, `stuck`) stay in Neon as they are.
