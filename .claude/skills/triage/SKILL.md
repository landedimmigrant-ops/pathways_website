---
name: triage
description: Bug and feature triage loop for the Pathways website. Pull bug, NCV-feedback, and feature rows from the project Google Sheet, report what's open, drive fixes with the user, commit, and write status + commit SHA back to the sheet via an Apps Script webhook. Use when the user types /triage, says "triage", asks to check the bug sheet, or wants to work through reported bugs or feature requests.
---

# Triage — bug & feature sheet loop

Pulls a published Google Sheet (3 active tabs — Bugs `B-`, NCV feedback `N-`,
Features `F-`), reports what's open, drives fixes with the user, commits, and
writes status + commit SHA back through an Apps Script webhook.

## Setup (once per machine)

The helper scripts and webhook calls read `config.local.json` (next to this
file) — it holds the webhook URL, shared secret, and tab CSV URLs, and is
**gitignored**. If it's missing, copy `config.local.example.json` to
`config.local.json` and ask the user for the webhook URL + secret.

## Loop

1. **Pull & report** — run the pull script:
   ```bash
   python3 .claude/skills/triage/scripts/pull.py
   ```
   It fetches the 3 tabs, filters to open rows (status ∈ {`new`, `triage`,
   `In Progress`, blank}), and prints a report grouped by tab and ordered by
   severity. Add `--all` to include closed rows. Suggest a sensible first
   target.
2. **User picks** — one item, several, or a category ("all NCV copy fixes").
3. **Per item** — read the `where?` column, locate the code, propose a fix,
   implement it, preview in the browser, get sign-off. Standard workflow.
4. **Commit on `integration-prototype`** with the ID in the subject:
   - Single: `Fix B-06: "Back to All Resources" exits SPA on cold-load`
   - Batch: `Bug batch: B-07, B-08, N-02..N-06`
5. **Push only on explicit sign-off** — when the user says "ship" / "push".
   Pushes go live on the coordinator's dev URL.
6. **Writeback after the push lands** — run the writeback script:
   ```bash
   python3 .claude/skills/triage/scripts/writeback.py B-06=done N-02=done
   ```
   Use `ID=status=commit` to also record the 7-char SHA. The script POSTs the
   update, then verifies by re-pulling the affected tab's CSV — trust the
   verification, not the POST response (see `reference.md`).
7. **Report back** — e.g. "Updated B-06 → done (commit abc1234) on tab Bugs.
   Live at the dev URL. Reaches testers on the next `/testing/` snapshot."

## Commit strategy

Default to **direct commits** on `integration-prototype`. Branch
(`triage/<batch>`) only for: routing / page-registry / schema changes,
refactors >100 lines or >3 files, or risky multi-bug batches where a partial
landing would leave the dev URL broken.

## More detail

`reference.md` covers the webhook API (update / append / list_tabs), the
Apps Script response quirk, the status vocabulary, sheet columns, the
tester-snapshot refresh, the rollback path, and the manual fallback if the
webhook is down. Read it when you need any of those.
