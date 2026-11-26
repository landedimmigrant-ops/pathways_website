# Narrative CV tool (V9 beta): developer pointer

V9 was forked on 2026-11-26 from V8.20 (commit `3c0b8cb`) to apply the language pass: every row marked Decided in [`../ncv_tool_v8/language-notes.md`](../ncv_tool_v8/language-notes.md). V8 stays frozen as a reference. New work goes into V9. This folder's `index.html` is a thin redirect.

| What | Where |
|---|---|
| **Source of truth** (all markup and logic, one file) | [`../narrative-cv-prototype-v9.html`](../narrative-cv-prototype-v9.html) |
| **Stylesheet dependency** | [`../styles.css`](../styles.css) |
| **Headless test** | `pkill -f "ncv-v9-test-"; NCV_CDP_PORT=<free port> node ncv_tool_v9/test-v9.js` (Node 22+, Google Chrome) |
| **Apply plan** | [`../ncv_tool_v8/apply-plan-v8.21.md`](../ncv_tool_v8/apply-plan-v8.21.md) (written as V8.21; released as V9) |
| **Wording decisions** | [`../ncv_tool_v8/language-notes.md`](../ncv_tool_v8/language-notes.md), rules in [`../ncv_tool_v8/LANGUAGE-RULES.md`](../ncv_tool_v8/LANGUAGE-RULES.md) |
| **Design rules and vocabulary** | [`../ncv_tool_v8/DESIGN.md`](../ncv_tool_v8/DESIGN.md), [`../ncv_tool_v8/VOCABULARY.md`](../ncv_tool_v8/VOCABULARY.md) |
| **Version history** | [`CHANGELOG.md`](CHANGELOG.md); V8's in [`../ncv_tool_v8/CHANGELOG.md`](../ncv_tool_v8/CHANGELOG.md) |
| **Related versions** | V8 (frozen at 8.20): [`../ncv_tool_v8/README.md`](../ncv_tool_v8/README.md) |

Storage: the draft lives in `localStorage` under `ncv-v9`. On the first V9 load in a browser, a draft saved by V8 (`ncv-v8`) opens as the V9 draft, once and without a message; V8's copy is never changed, and the mark `ncv-v9-carried` keeps Clear draft from bringing it back. The tester sign-up stays under `ncv-v8-tester`, so signed-up testers are not asked again.

## Testing with researchers (Cloudflare and Neon)

**Address for testers:** https://research-8kh.pages.dev/ (unchanged). The Cloudflare Pages project `research` now serves V9: `cloudflare/` moved here from `ncv_tool_v8/` on 2026-11-26, and `cloudflare/build.sh` copies the V9 file. Deploy with `cd ncv_tool_v9/cloudflare && npm run deploy`. The Neon tracking and `functions/api/tester.js` are unchanged.

## INFERRED in V9.0

- The V8 draft opens without a message, since testers see the same draft they left.
- The tester key keeps its V8 name, so a sign-up carries over.
- The V7 offer box (`v6Offer`) is no longer used; its code stays until a later clean-up.
- Batch 1 (S0): the title link's tooltip is the page name itself, "Start" or "Continue".
- Batch 2 (S6): the card reads "Draft: “[name]” saved." (draft name, else the first contribution's headline, else "Draft saved."); the "(Clearing your browser data erases it. [Save a backup file].)" line sits under the card, outside the button.
- Batch 2 (S8, S18): the status date uses `savedWhen` ("Backup saved at 09:08, no changes since." today, "…on 24 October at 09:08…" otherwise); saving from the confirm updates its status in place and keeps the confirm open; the confirm group is named by its question and its status line. The Contributions-page confirm shares the function and the behaviour.
- Batch 2 (S14a, S14b): text that is not valid JSON gets S14a; a newer file version or a failure to apply gets S14b.
- Batch 2 (S4): the short phone version of the privacy line ("No AI. Anything you write stays here.") is unchanged; S4 named the full line only.
- Batch 2 (T4): the promise box has a 1px gold border, the same tint and a 6px radius; the Export and feedback promise boxes share the class and changed with it. Their wording ("We do not collect anything you write in your CV.") was not in T4 and is unchanged.
- Batch 2 (T10): a failed sign-up shows no message; the silent retry is kept.
- Batch 3 (P9): an alias map `MODE_ALIAS` sends Industry, Public sector, Health system, Non-profit and Cultural sector to the existing partnered examples, and Indigenous communities to the community-engaged ones, for the example pick, the prompt variants, the private-partner help line and the role wording; stored values `indigenous`, `publicsector`, `healthsystem`, `nonprofit`, `cultural`; the swap message also shows in the Change panel.
- Batch 5 (M2, M5, M6, M7): M2's line is the same for every field; M5's Organization tip is a help line under the field for the industry kind only; M6's creative and community hints are built from the row's parts; M7's help and hint share one help box. The Mentorship example legend reads "Mentorship approach", "Team composition" and "Informal mentorship", the field labels.
- Batch 7 (R11a, R12): "No evidence yet" clears itself once an evidence item is written (decided); "No impact yet" stays as ticked when What already changed is also written (not decided: the text prints and the tick only counts).
- Batch 7 (test timing, not a wording choice; **fixed in V9.1**, see the CHANGELOG): opening the evidence view can start a smooth scroll; a step change within about half a second can end with the new heading lower on the page. V8 has the same race; R11 makes it show in one test (a role level alone no longer counts, so the card's layout differs). The step change now scrolls with `behavior: "instant"`, and the test waits for the evidence scroll to finish. Worth a look in the browser check.
- Batch 4 (row 2): the example line's field, way-of-working and stage phrases are plain words of the subagent's ("mostly on their own", "with the public sector").
- Batch 4 (row 12): the pill's text is dark (#333) on the part's tint with the accent as its edge; each text box takes the accent as its border; gold is #b07d00.
- Batch 4 (row 8): "Add back" sits beside a folded set-aside row; Review's nearby text reads "Add one back" and "if added back".
- Batch 4 (C1, PS1): for the CV-FRQ, "personal statement" reads "background and skills".
- Batch 4 (C6, C9, C12, C16, C19, C20a, C20h): the community "if a partner asked" line kept; community-engaged work gets "who owns it?"; the STEM and creative lists end "that used the work"; the remove confirm drops the evidence clause when there is none; the C19 marker is a small burgundy dot; "Your contribution…" for every kind; quantity words get "If you have a specific total", "well-received" and similar get "Please name the specific thing".
- Batch 6 (PS4): the social sciences variant dropped (the default already says "problem or question"); humanities "Across your research, what is the central question your work keeps asking?".
- Batch 6 (PS5, PS7, PS3, PS12): early career gets both hints; community help ends ", and name your partners’ part."; the PS3 panel's button keeps its label, toggles with aria-expanded and closes with Escape, empty text "No contributions written yet."; the card and strip text are the same for the CV-FRQ.
- Batch 6 (PS9a foot): CV-FRQ "This example is fictional. It includes a sentence for the CV-FRQ team question."; TCV "This example is fictional."
- Batch 8 (R8 hints): Public talk or outreach, kind card "a public talk, a podcast or an op-ed you made for the public", item "The title, the venue or platform and the date; for your own series, its audience", note "Whom it reached, and how it bears on your question". Media coverage, kind card "news coverage or a critical review of your work", item "The outlet, the title and the date", note "What the piece says about the work".
- Batch 8 (EV-1): Review's Add-evidence kind list shows all 15 kinds and defaults to the column's first kind. **Open for Prem:** changing an item's kind on Contributions does not clear its stored column (`used`), since the row says the stored column decides.
- Batch 8 (R5, R-1, R10, R-2, R9): the R5 question and "See …" link use the lower-case section name ("your background and skills" for the CV-FRQ); a missing statement reads "Your personal statement is not written yet."; R-1 counts a level only with its role sentence, and a sentence with no level reads "No role is chosen yet."; R10 names "the doctoral student", or "the person" with no level, and the chart's screen-reader label begins "Where the people you describe are now:"; R-2 also covers What could change; the R9 fact holds while marks change within the same contributions.
- Batch 9 (E3): page ranges print with an en dash ("6–7"), one page as "6"; one link keeps "One link is…", other counts are numerals.
- Batch 9 (E5): the old "format" tick is replaced by Reader, Template and Page limit; a saved "format" tick no longer shows.
- Batch 9 (E8): with no agency the box's title stays "You must use the agency’s template."
- Batch 9 (E10): What already changed's hint in the text file reads "[question] If there has been no impact yet, please describe the potential impact under What could change, or tick No impact yet on Contributions."; every other part's hint is its own question.
- Batch 9 (E11): the FRQ sentence sits before "Please delete this note…".
- Batch 9 (sweep): the Change panel's ways of working have no grey lines (it is a compact panel); its "Choose at least one way your work usually happens." is unchanged, since Set up has no decided wording for it. Export's edit card heading wraps at phone width (it reached 401 px at 375 px).
