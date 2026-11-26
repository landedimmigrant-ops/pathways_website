# NCV tool V9: versions

Each batch of changes gets the next number (9.1, 9.2 and so on). The number appears at the foot of the tool, in the tab title, in the Word file and print view, and in a saved backup file.

To make a new version:
1. Raise `VERSION_NUM` and set `VERSION_DATE` near the top of the script in `narrative-cv-prototype-v9.html`. Also change the number in the `<title>` tag.
2. Add an entry at the top of the list below.
3. Commit, then tag it as `ncv-v9.N`.
4. When it is deployed to Cloudflare, update the "Where it is live" column.

| Version | Date | What changed | Commit | Where it is live |
|---|---|---|---|---|
| 9.3 | 2026-11-26 | The rest of the tool checked for the EV-1b gap (Prem: "check the rest of the tool for the same gap"). Undo after Clear draft and after opening a backup file over a draft. Undecided and None of these, pressed again, bring back what they emptied. On Export, each sentence the tool writes has an Edit that opens the answer it comes from. | `81bcfef` | GitHub; Cloudflare (research-8kh.pages.dev), 2026-11-26 |
| 9.2 | 2026-11-26 | EV-1b (Prem: "I want them to be able to change things or undo when they need to"). Review's evidence editor lets the researcher choose the column, What you produced or Where others used it, and Save moves the item; a kind change keeps the column. Undo after Remove on Review's evidence, Remove area (with its marks), Remove person and Delete on Review's order and Saved for later, as on Contributions. On a phone the evidence editor fits the screen. | `0b819dd` | GitHub; Cloudflare 2026-11-26, replaced by 9.3 |
| 9.1 | 2026-11-26 | A step change right after a field opened, or the evidence view opened, left the new step scrolled far down with its heading out of sight (Prem: fix the scroll issue). Two causes: the line-holding animation (`keepAnchor`) kept measuring a field that had left the page and pulled the page every frame, and the browser's own smooth scroll could not be stopped. The animation now stops when its field is gone, every smooth scroll goes through the tool's own glide, and a step change stops it. | `b064903` | GitHub; Cloudflare 2026-11-26, replaced by 9.2 |
| 9.0 | 2026-11-26 | V9 forked from V8.20 to apply the language pass: every row Prem decided in `ncv_tool_v8/language-notes.md` from 2026-11-19 to 2026-11-26, except the question tree (PS4-T) and the new example drafts (row 13). Plain words on every step (Start/Continue, backup file, Clear draft, Areas of research, where they are now, research advisor(s) or colleagues). A contribution is complete when its headline and six parts are written and it has evidence; "No impact yet" and "No evidence yet" tick boxes count for What already changed and the evidence, and Review and Export open with one complete contribution. New ways of working (P9), two evidence kinds in place of Media / public (R8), the stored column decides "used by others" (EV-1), a role-sentence status (R-1). Export says it makes a draft and adds the advisor or colleague step. A V8 draft in the same browser opens once as the V9 draft. | `2fe6147` | GitHub; Cloudflare 2026-11-26, replaced by 9.1 |
