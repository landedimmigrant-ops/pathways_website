# Narrative CV tool (V8 beta) — developer pointer

Clean address for **V8 beta**, forked on 2026-11-02 from V7 as it stood after the 20-round audit loop (commit `ada6b7f`).
V8 holds every fix from the loop; new work goes into V8. V7 was put back to the version before the loop (commit `f852933`)
and stays frozen as a reference.
This folder's `index.html` is a thin redirect.

| What | Where |
|---|---|
| **Source of truth** (all markup + logic, one file) | [`../narrative-cv-prototype-v8.html`](../narrative-cv-prototype-v8.html) |
| **Stylesheet dependency** | [`../styles.css`](../styles.css) (the tool's own components keep the `v7-` prefix) |
| **Headless test** | `node ncv_tool_v8/test-v8.js` (Node 22+, Google Chrome; no dependencies; about three minutes) |
| **Test fixture** (made-up V6 draft) | [`../ncv_tool_v7/fixtures/v6-draft.json`](../ncv_tool_v7/fixtures/v6-draft.json) |
| **Decisions so far** (DECIDED vs INFERRED) | [`../narrative-cv-v7-decisions.md`](../narrative-cv-v7-decisions.md) |
| **Audit loop log and findings** | [`../ncv_tool_v7/audit-loop-2026-10-31.md`](../ncv_tool_v7/audit-loop-2026-10-31.md) |
| **Open questions for Prem** | [`../ncv_tool_v7/questions-for-prem.md`](../ncv_tool_v7/questions-for-prem.md) |
| **Related versions** | V7 (frozen, the version before the audit loop): [`../ncv_tool_v7/README.md`](../ncv_tool_v7/README.md) |

Storage: the draft lives in `localStorage` under `ncv-v8`, so V7 and V8 can be tested side by side in one browser.
On a first visit, a V7 draft in the same browser (`ncv-v7`) is offered once; V7's copy is never changed. Draft files
saved from V7 open in V8 with **Continue draft**.

## Testing with researchers (Cloudflare and Neon), 2026-11-02

**Address for testers:** https://research-8kh.pages.dev/

The same V8 file is served by the Cloudflare Pages project `research` (`cloudflare/`). A Pages Function in the same project, `cloudflare/functions/api/tester.js`, records testers in a Neon database. The plain name `research.pages.dev` belonged to another account, so Cloudflare added the `-8kh` suffix. The project moved from a Worker to Pages on 2026-11-02 so the address could carry "research" without renaming the account's `immigrant-empire` Workers subdomain; the old `ncv-tool` Worker was deleted.
The GitHub Pages copy (`/ncv_tool_v8/`) keeps working with no sign-up and no network calls.

- **The questions** (since 2026-11-03) each answer an open question about the tool; the reasons are in [`tester-questions-proposal-2026-11-03.md`](tester-questions-proposal-2026-11-03.md).
- **Start page:** a sign-up card asks for an email and three questions:
  - what they are starting from;
  - when the application is due;
  - what concerns them most about writing a narrative CV.

  Sign-up is required (Prem, 2026-11-03): the card has no skip button, a browser that skipped before sees it again, and a saved draft opens no step until an email is entered.
  The card states in bold that nothing written in the CV is collected, and invites testers to send their draft to impact@concordia.ca to help improve the tool; the thank-you after the Export questions repeats the invitation.
- **While they work:** each step a signed-up tester opens is recorded as `last_step`, so drop-off is visible.
- **Export:** five questions, sent against the same tester id:
  - how much the tool helped with the concern they named at the start, from 1 to 5 (the question quotes it);
  - whether the questions and examples fit their kind of work, with a box for which ones;
  - what they will do with the draft next;
  - which parts they would reuse for the next application (choose any; "None, I would start again" clears the others), with a box for anything else;
  - the one change that would help most.
- **What is never sent:** draft text.
- **Where the record lives in the browser:** under its own key, `ncv-v8-tester`, so Reset draft and Load your draft leave it alone.
- **Database:** Neon project `ncv-testing` (`lucky-tree-08109926`, AWS US East 1).
  - Table `testers`, with a `tester_summary` view; the schema is in [`cloudflare/schema.sql`](cloudflare/schema.sql).
  - To see who tested: `select * from tester_summary;`
- **Deploy:** `cd ncv_tool_v8/cloudflare && npm run deploy`. This copies the V8 file and `styles.css` into `public/` and deploys.
  - The Neon connection string is the Pages secret `DATABASE_URL` on the `research` project and is never in the repo.
- **Where it is switched on:** the sign-up is on only on `*.pages.dev`, or with `?tester=1` (used by the test script).

The endpoint is `POST /api/tester`:
- it accepts the tool's own origin only;
- it accepts posts of up to 16 KB;
- it keeps only the known answer keys, each up to 2,000 characters; a choose-any answer is kept as a list of up to ten options.
- Rows sent before 2026-11-03 used the first set of keys (`funding`, `before`, `want`, `useful`, `stuck`); there were none in the table when the set changed.

INFERRED, for Prem to confirm or change:
- the wording of the answer options (the questions were agreed in chat on 2026-11-03);
- the sign-up card replaces the path cards and every step until the tester signs up;
- the Export questions sit at the top of Export;
- the privacy wording on the card (Prem, 2026-11-03: the line on what is sent and where it is stored was taken out; the card says the information is deleted when this version launches at the end of the year, and gives impact@concordia.ca for questions);
- the address `research-8kh.pages.dev` (a custom domain can replace it later).
