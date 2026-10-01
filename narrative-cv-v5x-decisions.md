# NCV V5x (portfolio test): decisions log

V5x is a copy of the V5 beta with one addition: a **portable portfolio** the researcher keeps as a file and reuses across applications. It tests the idea in [narrative-cv-ideas.md](narrative-cv-ideas.md) (2026-09-30) and Option A of [narrative-cv-portfolio-app-plan.md](narrative-cv-portfolio-app-plan.md). V5 is untouched.

- File: [narrative-cv-prototype-v5x.html](narrative-cv-prototype-v5x.html) · alias `/ncv_tool_v5x/`
- Draft storage: `ncv-v5x` (separate from V5's `ncv-v5`) · portfolio working copy: `ncv-v5x-portfolio`
- Feedback rows go to the Guide review tab with `page = ncv-tool-v5x`

Built 2026-10-01. Marked **DECIDED** where Prem said so, **INFERRED** where I filled the gap.

## Overrides (Prem)

_Empty. Write any change of mind here and it gets applied._

## What it does

1. **New step after Setup: Portfolio.** Open a portfolio file, start an empty one, or try a fictional sample. The step can be skipped; the rest of the tool works as in V5.
2. **Two panes.** Left: the portfolio in four modules (Contributions, Evidence, Mentorship, Statement pieces), with a filter. Right: this CV, one drop zone per section, using the funder's section names.
3. **Drag and drop, or a button.** Every piece has an "Add to this CV →" button, so keyboard, screen-reader and phone users have the same path. Evidence goes onto a specific contribution, by dragging it onto that contribution or choosing it from a menu.
4. **Edit in the steps as usual.** Each contribution card shows whether it came from the portfolio and whether it still matches. "Update the portfolio copy" or "Save to portfolio" pushes it back.
5. **Save everything at once.** On the Portfolio and Review steps, "Save this CV's material to the portfolio" adds or updates every piece and records the CV in the portfolio's history. Each piece then shows "Used in: …".
6. **Start a new CV from the portfolio.** This clears the draft but keeps the portfolio and the Setup answers, so the next application starts from the same file.
7. **The file.** It is plain JSON (`format: "ncv-portfolio"`, `version: 1`). In Chrome and Edge, Save writes straight back to the opened file. In Safari and Firefox, Save downloads a fresh copy. A warning appears before leaving the page if the file is out of date.

## Decisions

| # | Call | Status | Why |
|---|---|---|---|
| X-1 | Portfolio is a file the researcher keeps; no login, no server | DECIDED | Prem, 2026-10-01: "a portable portfolio that researchers keep, they should be able to open it anywhere" |
| X-2 | Drag and drop between a portfolio pane and a CV pane | DECIDED | Prem's description of the idea |
| X-3 | Separate file (V5x); V5 untouched | INFERRED | V5 is ready for the first real-researcher test and should stay stable |
| X-4 | Four modules: Contributions, Evidence, Mentorship, Statement pieces | INFERRED | Prem named evidence, contribution and mentorship. Statement pieces were added because the problem, strands, background and standing carry from one application to the next |
| X-5 | Evidence lives in two places: inside each contribution (travels with it) and as loose items in the Evidence module | INFERRED | V5 already ties evidence to contributions. Loose items cover awards, coverage and invitations that are not tied to one yet |
| X-6 | "Why this competition" and "How you complement the team" are not stored in the portfolio | INFERRED | Both are specific to one application, and the guide asks for them fresh each time |
| X-7 | Pieces are **copied** into the CV with a link back (`pfId`), not live-linked | INFERRED | Researchers tailor each CV. A tailored edit should not silently change the portfolio. The card says when the two differ and offers to update the portfolio copy |
| X-8 | Every drag has a button equivalent; drag is the enhancement | INFERRED | SGQRI 008 accessibility; native drag does not work on phones |
| X-9 | A working copy is kept in the browser as well as the file | INFERRED | A reload or a forgotten save should not lose work. The status line says whether the file is up to date |
| X-10 | Sample portfolio uses the same invented sociologist as the V5 worked examples | INFERRED | One fictional person across the tool. Everything in it is invented |
| X-11 | No limit check on the portfolio itself; the 10-contribution limit applies to the CV only | INFERRED | The portfolio is the researcher's whole record; the funder limit is per application |
| X-12 | Training totals are one item, dated ("as of"), and overwritten on save | INFERRED | Totals are always "the last five years"; keeping old values adds noise |

## Round 2 (2026-10-01): a clearer flow

Prem: the portfolio needs context, and the flow should feel integrated. Say up front how the tool works, offer "start new" or "open my portfolio", and let a new user save a portfolio at the end.

| # | Call | Status | Why |
|---|---|---|---|
| X-13 | The first step is now **Start: How this tool works**. Three points: your work stays yours; use it once; or keep building with a portfolio | DECIDED | Prem's request |
| X-14 | Three ways to start: **Start a new CV · Open my portfolio · Check a draft I already have** | DECIDED (wording INFERRED) | Prem named the first two; the draft check was V5's second mode |
| X-15 | The application questions (agency, discipline, stage, competition) appear only after a start choice, under "About this application" | INFERRED | One decision at a time |
| X-16 | The portfolio step ("From your portfolio") appears only for people who open a portfolio or already have one open | INFERRED | A first-time user drafting once should not meet portfolio controls mid-draft |
| X-17 | Contribution cards show the portfolio bar only when a portfolio is open | INFERRED | Same reason |
| X-18 | Review ends with **1. Take your draft** and **2. Keep the pieces for next time (optional)**. With no portfolio, the button is "Create my portfolio file"; with one, "Update my portfolio file". Both save the file in one action | DECIDED (wording INFERRED) | Prem: "if its new we give them the opportunity to save it as part of their portfolio, download text" |
| X-19 | A small **Portfolio** status block under the step list: file name, piece count, saved or not, and a Save link when out of date | INFERRED | Keeps the file visible without a separate step |

## Deferred

- Reordering by drag inside the CV pane (↑ ↓ buttons for now).
- Merging two portfolio files, or detecting that the same file was edited on two devices.
- Tags (discipline, work mode, stage) on pieces, and filtering by them.
- Short, medium and long versions of one piece, chosen to fit a funder's length.
- A word count in the CV pane against the page limit.
- Editing a piece directly in the portfolio pane (now done in the steps).
- French interface.

## Verified in the browser (2026-10-01, local server)

- Sample portfolio loads (21 pieces). Button placement and a real mouse drag both move a contribution into the CV.
- Evidence dropped onto a contribution row is added to that contribution only.
- Mentorship totals, people and practices, and statement pieces, all place into the right fields.
- Editing a placed contribution switches its card to "Edits here stay in this CV…"; "Update the portfolio copy" brings it back to "matches".
- A contribution written from scratch shows "Not in your portfolio yet" and saves into it.
- Save-all reported the changed pieces and added "Untitled CV, 2026-10" to their history. Start a new CV emptied the CV pane and kept the portfolio.
- File round trip using the download fallback: saved, reopened from a file, owner name and pieces intact.
- Phone width (375px): panes stack, no sideways scroll, button path works.
- No console errors.

Not tested: the Chrome "save straight back to the file" path with a real file picker (the browser pane cannot drive the system dialog), and Safari.
