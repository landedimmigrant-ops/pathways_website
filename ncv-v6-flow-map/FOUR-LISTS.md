# V6 narrative CV tool: the four lists the map is built from

Source read in full or in the relevant ranges: `narrative-cv-prototype-v6.html` (commit `b14c55d`, 3,471 lines, one file, one inline script). Line numbers below are for that commit. Nothing outside V6 is mapped. A "?" marks something I could not trace or had to infer.

## 1. Screens and views

| # | Screen | What it is | Code |
|---|---|---|---|
| S1 | Page shell | Banner ("PROTOTYPE · V6 BETA", **Note for the team**, **Reset draft**), privacy line, save-failed warning, link to the guide, **Steps** rail | body markup 216-233; `renderShell` 1530 |
| S2 | Setup | Pick a path (Start fresh / I already have a draft), agency, discipline, optional second discipline, field not listed, career stage, competition; agency format note | `renderSetup` 1956 |
| S3 | Structural read | Draft mode only. Paste box, sample draft, coverage list, paragraph cards | `renderXray` 2061 |
| S4 | Contributions | Work-mode chips, worked example(s), shape hints, up to 10 contribution cards | `renderContributions` 2134, `renderContribCard` 2245 |
| S5 | Assembled paragraph | Inside each card: the material joined in one block with its evidence | `renderWeave` 2415 |
| S6 | Mentorship | Worked example, totals grid, trainee rows, three prompts | `renderMentorship` 2450 |
| S7 | Personal statement / Background and skills (FRQ) | Cross-contribution read, worked example, anchor line, seven prompts | `renderPersonal` 2548 |
| S8 | Order of contributions | Up and down buttons, "This order works" | `renderOrder` 2619 |
| S9 | Review | Coverage list, format note, length check, flags, self-check, advisor questions, draft preview, export buttons, copy-per-section | `renderReview` 2724 |
| S10 | Feedback | Twelve questions, session notes, summary opt-in, send / download / copy | `renderFeedback` 3247 |
| S11 | Note panel | Drop-down under the banner: "A note for the Pathways team" | `openNotePanel` 3411 |
| S12 | "Change these answers" panel | Inline copy of the Setup fields, under the "Tailored for" bar on every step except Setup | `lensBar` 1680 |
| S13 | Welcome-back banner | Shown once when a saved draft reopens on a later step | `renderStage` 1573 |
| S14 | Print view | A new browser window holding the draft in the agency's font | `openPrintView` 3089 |
| S15 | Guide page | `ncv-guide-review/`, opened in a new tab by guide links. A separate page; **not mapped** | `guideLink` 1521 |

Dialogs: one browser `confirm()` on Reset (3456).

## 2. User actions, in order

1. Open the page. A saved draft, if any, is loaded; if it was past Setup, S13 shows.
2. **Setup.** Choose Start fresh or I already have a draft. Choose agency (sets format TCV or CV-FRQ), discipline, optional second discipline, optional "field not listed", career stage, optional competition. Click Start drafting.
3. *Draft path only:* **Structural read.** Paste a draft or use the sample, click Run the structural read, read the paragraph cards, continue to Contributions.
4. **Contributions.** Pick work modes. For each contribution: headline; how involved (led / co-led / part); role line; stakes; what you did; outputs; what already changed; what could change; an optional moment; evidence rows (text, type, two-line note, "Other" label); ✓ / ✗ / ? mark on each field with a note to self; toggle Assemble. Add or remove contributions.
5. **Mentorship.** Totals (four counts); trainee rows (stage, sector, organization, unit, prizes, why); three prompts.
6. **Personal statement.** Read the cross-contribution suggestion; finish "I am a … at … My work is in …"; answer seven prompts (eight in the CV-FRQ).
7. **Order of contributions.** Move contributions up or down; click This order works.
8. **Review.** Read coverage and length; tick the self-check; write questions for an advisor; download .txt, Word (.doc) or the advisor packet; open the print view; copy the draft; copy one section at a time.
9. **Feedback.** Answer any of twelve questions; read notes; keep or drop the session summary; Send, download or copy.
10. Any time: click a step in the rail, Back / Continue, Note for the team, Change these answers, Reset draft.

## 3. Data

| # | Store | Written by | Read by |
|---|---|---|---|
| D1 | `localStorage["ncv-v6"]`: the whole draft (`ns`): mode, stage, lens, contributions, mentees, statement, notes, feedback answers, session log | `saveState` (every input handler and every `renderStage`) | `loadState` at page load |
| D2 | In-memory `ns` | all handlers | all renderers and builders |
| D3 | Built-in content tables: `PROMPTS`, 60 worked examples, 10 interdisciplinary examples, shape hints, statement and mentorship examples, structural-read sample, feedback questions, lint word lists | the file itself (edited in source) | prompt blocks, example boxes, lint, feedback |
| D4 | Funder-rule tables: agencies, section names, font, link and language rules, page limit | the file itself | format note, exports, print view, advisor packet |
| D5 | Downloaded files: draft `.txt`, advisor packet `.txt`, Word `.doc`, feedback `.txt` | Blob + temporary link on click | the researcher |
| D6 | Clipboard | `navigator.clipboard.writeText` | the researcher |
| D7 | Print window document | `window.open` + `document.write` | the researcher |
| X1 | Google Apps Script project sheet (feedback rows, tab "Guide review", `page = ncv-tool-v6`) | `postFeedback` (POST) | `postFeedback` fallback (GET `review_list`); the team |
| X2 | `ncv-guide-review/` pages | none | guide links (new tab) |
| X3 | `styles.css` (shared site stylesheet) | none | the page |
| X4 | `mailto:impact@concordia.ca` | none | mail app |

Only two `fetch` calls exist in the file (both in `postFeedback`, lines 3236 and 3240). No other network use.

## 4. Logic and services

All in the one inline script.

- **Boot** (3463-3467): `loadState`, `updateNoteBtn`, set re-entry flag, `renderStage`.
- **State**: `defaultState` 1290, `loadState` 1309 (merges saved keys, maps old FRQ codes, `normalizeMentee`), `saveState` 1335 (sets the save-failed warning on error).
- **Router**: `stages()` 1468 (adds Structural read only in draft mode), `stageDone` 1485, `renderShell` 1530, `renderStage` 1559 (scroll, session visits, banner), `navRow` 1918.
- **Lens resolver**: `activeTokens`, `interpolate`, `resolveQ`, `resolveHelp`, `isFrq`, `secName` (1353-1380).
- **Prompt block** `promptBlock` 1846: question, help, textarea, live checks, ✓ ✗ ? flag with note.
- **Lint** `lintField` 1143 with rules ownership, vague, weak, prestige, hedge, link, passive and a numbers check; `renderChecks` 1770; `renderReadback` 1712.
- **Worked examples**: `pickExemplar` 1017 (discipline × work mode × stage; second field adds the pair example), `renderExemplarBox` 1798.
- **Structural read**: `analyzeDraft` 2023, `headingLabel` 2003.
- **Assembly**: `buildWeave` 2396.
- **Order**: `liveContributions` 2618, swap in `renderOrder`.
- **Cross-contribution read**: `crossTerms` 2686, `crossCuttingRead` 2694.
- **Coverage and length**: rows in `renderReview`, `draftWords` 2917.
- **Exports**: `buildExportText` 2947, `sectionText` 3104, `buildAdvisorPacket` 2991.
- **Print and Word**: `buildDraftHtml` 3036, `openPrintView` 3089, `downloadWordDraft` 3095.
- **Format note**: `renderFormatNote` 1602.
- **Session log**: `countEvent` 1513, `tickStageTime` 1507, `sessionSummary` 3165.
- **Feedback**: `buildFeedbackText` 3219, `postFeedback` 3233 (POST; if it throws, read back and look for the row id).
- **Notes for the team**: `openNotePanel` 3411, `closeNotePanel`, `updateNoteBtn`.
- **Ops around the file** (outside the script): GitHub Pages serves branch `integration-prototype`; `ncv_tool_v6/index.html` redirects to the file; `scripts/ncv-v5-examples.js` (`lint`, `register`, `review`, `--file`); `narrative-cv-v6-decisions.md`; `backups/v6-pre-eli-rest-2026-10-23/`.

## Marked "?" on the map

- **X1 Apps Script sheet**: its code is not in the repository. Everything said about it comes from the client side of the call.
- **GitHub Pages deploy**: set up outside the repository; known from this project's notes and from pushes made during this work.
- **Word `.doc` rendering**: the file is HTML saved as `.doc`; it has not been opened in Word.
- **Guide page (X2)**: a link target only; its internals were not read for this map.
- **Feedback read-back path**: the fallback GET exists in code; it was not exercised.
