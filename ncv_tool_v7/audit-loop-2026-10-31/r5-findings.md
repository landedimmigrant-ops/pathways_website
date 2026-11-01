# Round 5 findings: Fable's review of round 4, a facilitator with three drafts, a Partnership researcher, 2026-10-31

Recorded from the three agents' final replies. All walked the round 5 snapshot (= commit 2aa1c6e).

## Fable review of round 4 (J-1 to J-9): 1 major · 8 minor

- **J-1 · major (run).** A gated address was replaced with the step shown, leaving two identical entries, so the next press in that direction was silent; an old Setup entry sent Back from the start page to Contributions. → **Fixed:** every history entry carries a number that grows with time; Back or Forward passes over an entry that is closed or would show the step already on screen, in the direction of travel; if nothing lies further that way the address returns to the step shown. With no draft open, a press stays on the start page and says so.
- **J-2 · minor.** "This is Start page." → **Fixed** ("the start page").
- **J-3 · minor.** The readback marked every "could" though the check named one. → **Fixed:** exemptions are masked with characters of the same length, and a hedge hit marks its own position only.
- **J-4 · minor · product.** "Raise a count or remove a person" pushed researchers to inflate a five-year count or drop an earlier trainee. → **Fixed (INFERRED):** "…more than the N in the five-year totals. Check the totals, or keep an earlier trainee on purpose."; it is no longer listed under Still missing.
- **J-5 · minor.** `replaceNext` could survive a render that threw. → **Fixed** (read and cleared first).
- **J-6 · minor.** The heading scroll used the previous step's sticky height. → **Fixed** (`setBar` first).
- **J-7 · minor.** A rail rebuild dropped focus from Save draft and its "Saved" line. → **Fixed** (an id, and the line kept for five seconds).
- **J-8 · minor.** The mentorship counters re-read on every digit. → **Fixed:** spoken through the throttled count.
- **J-9 · polish.** `arts?` matched inside other words. → **Fixed** (`\barts?\b`).
- **From the reviewer's list:** a clear taken up by a tab in view is now spoken; the .txt lists what is still missing outside the contributions.

## r5-a · research facilitator, three researchers' draft files in one browser: 3 minor · 2 polish

No state crossed between drafts in six file switches; every saved file reopened exactly; the agency was in every file name. Drafts: the sociologist's renovictions study, the engineer's sewer-overflow control, the artist's Montréal back-lanes installation ([draft](r5-a-draft.txt)).

- **r5-a-1 · minor.** An evidence Undo from before a file load survived it, and Undo duplicated an item. → **Fixed:** opening a file clears the UI state, the Undo included.
- **r5-a-2 · minor.** Nothing said whose draft it is; file names collided within a day. → **Partly fixed:** file names carry the time ("-2311"); the opened line carries the time; the Start card names the draft by its first headline. An optional "Draft name" field is **open for Prem**.
- **r5-a-3 · minor.** The overwrite warning could not say whether the draft was saved. → **Fixed:** "You saved this draft to a file at 23:17 and have not changed it since." or "…and changed it after that."
- **r5-a-4 · minor.** A shared computer keeps the last researcher's draft. → **Fixed:** a line under Save a draft file on Export says to reset after saving.
- **r5-a-5 · polish.** The opened line's profile items were ambiguous with commas. → **Fixed** (semicolons).

## r5-b · senior social scientist, SSHRC Partnership Grant with First Nations and Métis partners: 9 minor · 3 polish

A community-owned health survey under OCAP® principles, a land-based youth program evaluated with a Nation, a co-authored report adopted by a health authority; 21 trainees (7 community researchers); a full statement; 1,418 words ([draft](r5-b-draft.txt)).

- **r5-b-1 · minor.** "I analyse", "I facilitate" did not count as naming a part. → **Fixed:** any verb right after "I" (not a copula or a modal) names a part.
- **r5-b-2 · minor.** The check ignored the chosen level and a role line without "I", and flagged the statement. → **Fixed:** a chosen level or a written role line names the part for the whole card; the statement's first sentence names it for the statement; any "I" in Mentorship names it there.
- **r5-b-3 · minor · copy.** The role prompt assumed the researcher leads. → **Fixed (INFERRED):** community-engaged work asks "what was your part in this work, and who led the other parts?", with a partnership example in the help; the warning shows how to name a part beside the partners'.
- **r5-b-4 · minor.** "may withdraw", "would require" flagged as hedges. → **Fixed** (rights and rules in an agreement).
- **r5-b-5 · minor.** The Other tile had no name and printed "7 other trainees". → **Fixed (INFERRED):** a "Who are they?" box under Other; the totals print "7 community researchers"; a line under the tiles says what Other is for.
- **r5-b-6 · minor.** No destination for a Nation's government or organization. → **Fixed (INFERRED):** "First Nations, Inuit or Métis government or organization", printing "now works at <organization>".
- **r5-b-7 · minor.** No guidance on partners' agreement. → **Fixed (INFERRED):** one line at One moment and the evidence intro, a sentence in the people note, and a self-check line "Agreement".
- **r5-b-8 · minor.** No kind for community-held documents. → **Fixed (INFERRED):** a tenth kind, "Community document"; the item's placeholder allows "who holds it".
- **r5-b-9 · minor.** The Mentorship example and "Who gets in" help do not change with Community-engaged. → **Help fixed** (a community variant); the example stays **open for Prem** (with r1-a-5).
- **r5-b-10 · polish.** The prize field printed bare text. → **Fixed** (a placeholder with an article). The people note's "best-paper prizes or prestigious scholarships" is Prem's wording and stays.
- **r5-b-11 · polish.** Generic words in the read across contributions. → **Fixed** (more stop words).
- **r5-b-12 · polish.** The two-field example ignores the work mode. → **No change** (noted).
