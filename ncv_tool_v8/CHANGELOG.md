# NCV tool V8: versions

Each batch of changes gets the next number (8.1, 8.2 and so on). The number appears at the foot of the tool, in the tab title, in the Word file and print view, in a saved draft file, and in the `tool_version` column of each tester row in Neon. Rows from before 8.5 show the old label, "V8 beta, 2026-11-02 (forked from V7)".

To make a new version:
1. Raise `VERSION_NUM` and set `VERSION_DATE` near the top of the script in `narrative-cv-prototype-v8.html`. Also change the number in the `<title>` tag.
2. Add an entry at the top of the list below.
3. Commit, then tag it as `ncv-v8.N`.
4. When it is deployed to Cloudflare, update the "Where it is live" column.

| Version | Date | What changed | Commit | Where it is live |
|---|---|---|---|---|
| **8.7** | 2026-11-12 | A feedback box at the foot of each step, for signed-up testers: a "?" button opens a note that goes to the Neon table `tester_notes`, with a reminder that the note is not part of the CV. The work-mode question in Setup follows the field. Plain-language rewrites (Q-6): 52 of the 60 listed lines applied, 23 of them edited, after a review against V8.6 and the house register. Two part names changed: "Standing" is now "Recognition" and "Who gets in" is now "Who joins". "Hedged" became "cautious words", and DORA is spelled out. The decisions are at the top of `../ncv_tool_v7/audit-loop-2026-10-31/r8-plain-language-rewrites.md`. | `dc61e6c` | GitHub (once pushed) and Cloudflare (`research-8kh.pages.dev`, 2026-11-12); `tester_notes` created in Neon the same day |
| 8.6 | 2026-11-04 | Eli's answers on funder rules (see `eli-answers-2026-11-04.md`): the trainee totals have no set period; leaves usually go in the appendix, with the advice to check the eligibility criteria and ask a research advisor, and a mention in How did you get here is still possible; a new "Audio or visual work" evidence kind, the only kind whose link SSHRC allows; a DOI can be written as plain text. | `08bfe6e`, and the next commit (audio-visual only) | GitHub; replaced by 8.7 on Cloudflare |
| 8.5 | 2026-11-04 | Prem's answers of 2026-11-03: wording, three new role levels, four new destinations, three new evidence kinds, a card count of required parts only, a draft name, a bottom-row "Save a draft file", "Save for later" for contributions, and h2 headings on path cards. Voice control: a filled field's answer is its named control (Q-25). The version number added to the foot of the tool. | `1fd9d3f`, `b9b1c45`, `85554da` | GitHub; replaced by 8.7 on Cloudflare |
| 8.4 | 2026-11-03 | A shorter sign-up page with Prem's wording: a one-line summary before sign-up, the promise that nothing written in the CV is collected, and a single "Start" button. | `15df673` | GitHub; replaced by 8.7 on Cloudflare |
| 8.3 | 2026-11-03 | Sign-up is required, with no skip, including for a saved draft. Plainer wording on the card. | `97fb162` | GitHub; replaced by 8.4 on Cloudflare |
| 8.2 | 2026-11-03 | New tester questions that answer open questions about the tool. | `4e390c8` | GitHub; replaced on Cloudflare |
| 8.1 | 2026-11-02 | Tester sign-up and end questions, stored in Neon. Hosting moved to the Cloudflare Pages project `research`. | `3116ac8`, `b4e7aea` | GitHub; replaced on Cloudflare |
| 8.0 | 2026-11-02 | V8 forked from V7 with all the fixes from the 20-round audit loop. | `45d7ca6` | GitHub |
