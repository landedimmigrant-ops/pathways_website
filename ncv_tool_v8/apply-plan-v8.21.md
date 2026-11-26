# V9: applying the language pass (planned as V8.21)

Prem, 2026-11-26: release it as **V9**, a new file with V8 frozen; testers keep their drafts. V9.0 = the fork (done 2026-11-26): `narrative-cv-prototype-v9.html`, `ncv_tool_v9/` (README, CHANGELOG, `test-v9.js`), `cloudflare/` moved to `ncv_tool_v9/cloudflare/` and building the V9 file, storage key `ncv-v9` with a one-time silent carry-over of `ncv-v8`, tester key unchanged. Every batch below edits the V9 files; the V8 file is not edited again.

Source: `ncv_tool_v8/language-notes.md`, every row marked Decided (about 140, 2026-11-19 to 2026-11-26).
Target: `narrative-cv-prototype-v9.html`, `ncv_tool_v9/test-v9.js`, then a release to Cloudflare (`research`).
Nothing from the pass is in the tool yet: V8.20 (2026-11-18) predates the first row.

## Out of scope

| Row | Why |
|---|---|
| PS4-T | The question tree is still being optimized in ps4-tree-optimize. Never deploy a broken tree. PS4's decided question and help do apply. |
| 13 | The new example drafts are awaiting Prem's review in their own session. |
| L1, L2 | Audit findings, logged only; their decisions were taken in the step rows. |
| Eli list | No funder fact changes: margins, CV-FRQ 10 contributions, trainee requirement, team question, SSHRC link wording, Indigenous communities wording, DORA. |
| `narrative-cv-prototype-v8m.html`, `ncv_tool_v8m/` | Model trial, untouched. |

## Order

The batches run one after another, because they all edit one file. After each batch: `node ncv_tool_v9/test-v9.js`, fix or update the tests that assert old wording, and commit nothing until the end.

| # | Batch | Rows | Kind | Notes |
|---|---|---|---|---|
| 0 | Fork | — | Setup | V9.0 fork as above (V8.20 frozen is the backup), baseline test run. |
| 1 | Shared words | S0, S4, S8, S9, PS (Strands → Areas of research), E1/E5a (research advisor(s) or colleagues), E5 (where they are now), P6 (Mid-career), R12 (No headline yet), W1 | Wording, many places | First, so every later batch uses the new terms. One search per term across the file; each hit checked by hand. |
| 2 | Start and tester page | S1–S18, T1–T10 | Wording | |
| 3 | Set up your profile | P1–P10, P2a, D1a | Wording + feature | P9 splits "Partnered…" into Industry, Public sector, Health system, Non-profit and Cultural sector, adds Indigenous communities, renames Solo and Team-based, adds grey lines and the swap message. A saved "Partnered…" opens as Industry. The new answers use the existing examples (P9 build notes). |
| 4 | Contributions | C1–C21, Q1, rows 1–12 | Wording + design | Q1: each sample is quoted from the picked example. Row 12: the part's name as a pill. C19: design note. |
| 5 | Mentorship | M1–M9, with R10 and E5's "where they are now" | Wording | |
| 6 | Personal statement | PS1–PS14, PS9a | Wording + example | PS9a: a `teamFit` segment in `PS_EXAMPLE`, CV-FRQ only, quoted as the sample. PS3: its feature as decided. |
| 7 | Gate and ticks | row 3, R11, R11a, R12 | Feature | One `cComplete` (G-1): not saved for later, six parts written, What already changed or "No impact yet", evidence or "No evidence yet". Real checkboxes with labels, saved in the backup file. Tests from `gate-tick.js` (8 cases) and `words-fact-tick.js` (7 cases), plus the audit's A1–A7. |
| 8 | Review | R1–R10, R8a, R12 | Wording + feature | R8: "Media / public" splits into "Public talk or outreach" and "Media coverage"; old drafts load as "Media coverage". EV-1: the column an item is added under decides "used by others". R-1: the role-sentence status. |
| 9 | Export | E1–E11, E5a, E9a | Wording + files | The text file, the Word file, the print view and the section copies. Remove `buildAdvisorPacket` and `buildWeave`'s unused `gaps`. |
| 10 | Check | all | Review | Full tests; one new test for each feature (P9 migration, R8 migration, EV-1, R-1, ticks, gate, stand-in); browser check at desktop and phone width; keyboard and screen reader (AX tree, live regions), contrast and targets; the ncv-design-review skill; `LANGUAGE-RULES.md` and `VOCABULARY.md` brought in line; an "Applied in V8.21" list appended to `language-notes.md` (the file stays append-only). |
| 11 | Release | — | Release | Commit by name, tag, `cd ncv_tool_v9/cloudflare && npm run deploy`, and a check of the live tool. Release session or this one, as agreed. |

## Who does what

- This session: batches 0, 1, 3 (P9), 6 (PS9a), 7, 8 (R8, EV-1), 9 (files), 10.
- Pure-wording batches (2, 4, 5, the rest of 6 and 8) can go to one Sonnet subagent at a time, each with its rows, the language rules and the file's line numbers. Each one is checked here before the next starts.
- beta-testing-readines-3 (local_088d96ec) owns the tool files and releases. No edit starts until it confirms nothing is in flight.

## Risks

- **Tests:** many of the 289 tests assert old strings, so expect a large test diff. A test changes only where its row says the wording changed.
- **Saved drafts:** three stored values change meaning (Partnered… → Industry, Media / public → Media coverage, the two new ticks). Each needs a load test with an old backup file.
- **The live testers:** V8 is on Cloudflare with Neon tracking. Tester drafts in browsers must still load after the deploy (localStorage key `ncv-v8`, unchanged).
- **Size:** about 140 rows in an 8,000-line file. Expect several sittings. Each batch leaves the tool working, so the work can pause between batches.

## Release session's answer (local_088d96ec, 2026-11-26)

- Nothing in flight. The tool file, `test-v8.js` and `cloudflare/` are clean against HEAD 3c0b8cb, and the branch is in sync with origin.
- This session is the only writer of those files until V8.21 is out, and it also releases.
- Release steps:
  1. Bump `VERSION_NUM`, `VERSION_DATE` and the `<title>`, and add the CHANGELOG row.
  2. Clear leftover test browsers with `pkill -f "ncv-v8-test-"`, then run `NCV_CDP_PORT=<free port> node ncv_tool_v8/test-v8.js` on the final file.
  3. Commit by name, never `git add -A`, and tag `ncv-v9.N`.
  4. Run `cd ncv_tool_v9/cloudflare && npm run deploy`, then check the live title with a cache-buster.
  5. Commit "live on Cloudflare", then run `git push origin integration-prototype --tags`.
- The V8.20 voice pass changed 35 strings (`ncv_tool_v8/voice-pass-2026-11-18.md`). The "Now" column in `language-notes.md` was read from the V8.20 file, so it should match; each batch still finds strings by searching the file, not by quoting the notes.
- Modified files that are not part of this work (`.gitignore`, `DESIGN.md`, the ncv-design-review skill) stay out of the V8.21 commits unless Prem says otherwise.

## Open before starting

Version: **V9** (Prem, 2026-11-26). Tag `ncv-v9.N`; the release number is set when the batches are done.
