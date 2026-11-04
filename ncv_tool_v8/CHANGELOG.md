# NCV tool V8: versions

Each batch of changes gets the next number (8.1, 8.2 and so on). The number appears at the foot of the tool, in the tab title, in the Word file and print view, in a saved draft file, and in the `tool_version` column of each tester row in Neon. Rows from before 8.5 show the old label, "V8 beta, 2026-11-02 (forked from V7)".

To make a new version:
1. Raise `VERSION_NUM` and set `VERSION_DATE` near the top of the script in `narrative-cv-prototype-v8.html`. Also change the number in the `<title>` tag.
2. Add an entry at the top of the list below.
3. Commit, then tag it as `ncv-v8.N`.
4. When it is deployed to Cloudflare, update the "Where it is live" column.

| Version | Date | What changed | Commit | Where it is live |
|---|---|---|---|---|
| **8.5** | 2026-11-04 | Prem's answers of 2026-11-03: wording, three new role levels, four new destinations, three new evidence kinds, a card count of required parts only, a draft name, a bottom-row "Save a draft file", "Save for later" for contributions, and h2 headings on path cards. Voice control: a filled field's answer is its named control (Q-25). The version number added to the foot of the tool. | `1fd9d3f`, `b9b1c45`, this commit | GitHub only |
| 8.4 | 2026-11-03 | A shorter sign-up page with Prem's wording: a one-line summary before sign-up, the promise that nothing written in the CV is collected, and a single "Start" button. | `15df673` | GitHub and Cloudflare (`research-8kh.pages.dev`) |
| 8.3 | 2026-11-03 | Sign-up is required, with no skip, including for a saved draft. Plainer wording on the card. | `97fb162` | GitHub; replaced by 8.4 on Cloudflare |
| 8.2 | 2026-11-03 | New tester questions that answer open questions about the tool. | `4e390c8` | GitHub; replaced on Cloudflare |
| 8.1 | 2026-11-02 | Tester sign-up and end questions, stored in Neon. Hosting moved to the Cloudflare Pages project `research`. | `3116ac8`, `b4e7aea` | GitHub; replaced on Cloudflare |
| 8.0 | 2026-11-02 | V8 forked from V7 with all the fixes from the 20-round audit loop. | `45d7ca6` | GitHub |
