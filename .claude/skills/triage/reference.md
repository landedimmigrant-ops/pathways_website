# Triage reference

Detailed reference for the `triage` skill. End-to-end design history lives in
`INTEGRATION_NOTES.md` → "Attempt 10" (pipeline) and "Attempt 11" (`/testing/`
snapshot).

## The sheet

A published Google Sheet, 4 tabs. Only 3 are an actionable backlog:

| Tab | Prefix | Notes |
|---|---|---|
| Bugs / general | `B-` | bugs and general issues |
| NCV tool feedback | `N-` | Narrative-CV tool copy + UX feedback |
| Features | `F-` | feature requests |
| Comparison / ideas to mirror | — | **ignored** — not an actionable backlog |

The CSV endpoints for the 3 active tabs live in `config.local.json` under
`tabs` (keyed by prefix). `scripts/pull.py` reads them.

### Columns

Shared expected columns: `id`, `type`, `where?`, `bug/ issue` (summary),
`severity`, `idea fix`, `status`, `commit`. The summary column header varies
by tab (`bug/ issue`, `bug/ issue / feedback`); the SHA column may appear as
`commit`, `commit tested`, or `test`. Older rows may be missing `id` / `type`
— handle gracefully. `pull.py` already matches the header variants.

### Status vocabulary

The sheet's data validation is lowercase: `new`, `triage`, `In Progress`,
`done`, `won't fix`, `needs info`. Open = {`new`, `triage`, `In Progress`,
blank}. Closed = {`done`, `won't fix`, `Complete` (legacy)} — skipped in the
triage report.

> Known gap: the **Features tab `status` column** still has the *old*
> validation (`blocked`, `Complete`, `In Progress`). Until the coordinator
> updates it, writing `done` to an `F-` row fails — use `Complete` (legacy
> closed) or wait for the validation fix.
>
> Known gap: the **Bugs + Features `commit` columns** have data validation
> that rejects free-text SHAs. Until removed, `writeback.py` can only set
> `status` on those tabs; the commit SHA write is rejected.

## The webhook

An Apps Script bound to the sheet. URL + shared secret live in
`config.local.json`. Three actions:

**Update rows** (status + commit) — what `writeback.py` sends:
```json
{ "secret": "<SECRET>", "updates": [
  { "id": "B-06", "status": "done", "commit": "abc1234" }
] }
```

**Append rows** (audit findings, new feature requests):
```json
{ "secret": "<SECRET>", "action": "append", "tab": "bug",
  "rows": [ { "id": "B-20", "type": "bug", "bug/ issue": "summary",
              "where?": "page", "severity": "Medium", "status": "new" } ] }
```
`tab` is substring-matched against sheet names (`bug`, `ncv`, `feature`).

**List tabs** (read-only introspection):
```json
{ "secret": "<SECRET>", "action": "list_tabs" }
```

### Response quirk — important

A POST to `/exec` returns a 302 → `googleusercontent.com/macros/echo?...`
with a single-use token that wants browser cookies. `curl`/`urllib` can't
complete the chain, so the response body is an HTML "Page Not Found" (or
"Sorry, unable to open the file") page — **even when the script ran fine.**

**Never trust the POST response.** `writeback.py` ignores it and verifies by
re-pulling the affected tab's CSV. For ad-hoc `curl`, treat the HTML page as
success and confirm side effects via CSV re-pull. The one real error to watch
for: a data-validation message naming a specific cell (e.g. *"data you
entered in cell I2 violates the data validation rules"*) — that means the
write was rejected.

## Tester-blocking bugs

If a fix is also needed in the frozen `/testing/` snapshot (a tester is
hitting a real wall), after the dev push:
```bash
./scripts/snapshot-testing.sh
git add testing/ content/data/
git commit -m "Refresh testing snapshot (YYYY-MM-DD): includes B-XX"
git push
```
Otherwise leave `/testing/` alone — testers see a stable version until the
next planned refresh.

## Rollback path

If a fix must be backed out after pushing:
1. `git revert <fix-sha>` on `integration-prototype` → push.
2. Writeback to revert the row: `writeback.py B-06=triage` (or the pre-fix
   status). Clear the commit by writing an empty value.
3. Note the regression in the row's `idea fix` cell for the next attempt.

## Fallback if the webhook fails

If the webhook errors beyond the usual redirect quirk: fall back to read-only.
Tell the user exactly which rows to mark and which 7-char SHA to paste into
`commit`; they flip the cells manually. The loop still works without the
writeback automation.

## Notes

- **Never commit `config.local.json`** — it holds the shared secret. It is
  gitignored at the repo root.
- **Audit-driven appends:** use `action: "append"`. Auto-assign IDs by pulling
  the tab first and finding the max existing `B-XX` / `F-XX`. Preview proposed
  rows to the user before posting.
- **Multi-row updates:** prefer one POST with `updates: [...]` over N POSTs —
  `writeback.py` accepts multiple `ID=status` args.
- **Old-schema rows** (missing `id`): refer to them by summary text and ask
  the user to assign an ID before writeback.
- **Never push without explicit user sign-off** — even a triage-branch merge.
