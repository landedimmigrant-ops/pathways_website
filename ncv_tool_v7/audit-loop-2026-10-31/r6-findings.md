# Round 6 findings: Fable's review of round 5, a senior researcher choosing five of ten, a researcher with two leaves, 2026-11-01

Recorded from the three agents' final replies. All walked the round 6 snapshot (= commit 84af742). The three were cut off by a usage limit partway and resumed from where they stopped.

## Fable review of round 5 (K-1 to K-8): 1 major · 7 minor

- **K-1 · major (run).** History entries from a previous draft were re-gated under a new one: after a reset and a new draft, Back from the start page went into Setup, and the next Back could run out of the tool. → **Fixed:** each draft has a generation (set when a draft starts, opens from a file or V6, is reset or is cleared elsewhere); every history entry carries it; an entry from an earlier draft becomes the start page and is never skipped through.
- **K-2 · minor (run).** "Phase I", "Type I", "Level I" or a quoted "I" counted as the writer. → **Fixed:** one `ownershipIn()` helper for every check; an "I" after those words or opening a quotation does not count.
- **K-3 · minor (run).** The statement's first sentence ("I am a professor…") silenced its "we" check. → **Fixed:** a statement field passes only when one of the statement's own answers names a part.
- **K-4 · minor (run).** Any role line, even one saying only "we", silenced the card's check. → **Fixed:** the role line counts only when it names a part (or a level is chosen).
- **K-5 · minor (run).** "may use", "may choose" were masked in What could change, which asks for hedges. → **Fixed:** the rights list is narrowed to withdraw, decline, refuse, veto, request, require, need, and does not apply to What could change.
- **K-6 · minor (run).** A skip chain that ran off the end was silent. → **Fixed:** "No step lies further that way. This is …", with the heading focused.
- **K-7 · minor (run).** The saved-file signature left out the Other group's name; an empty evidence row read as a change. → **Fixed.**
- **K-8 · minor (read).** After opening a file, the warning used that file's own save time as if this person saved it, with no date. → **Fixed:** an opened file counts as saved at its saved time with this content; the warning reads "This draft was saved to a file on 24 October at 09:08 and has not changed since."

## r6-a · senior health-services researcher, CIHR, ten contributions cut to five: 4 major · 3 minor · 1 polish

Kept a virtual emergency consult service, a pan-Canadian nurse-led diabetes trial, a discharge-planning bundle, a national long-term care outbreak registry and a patient-reported outcome measure; cut five (one fully written). 1,204 words after cutting from 4,144 ([draft](r6-a-draft.txt)). Numbering, letters, order and every length figure stayed consistent through five removals.

- **r6-a-1 · major.** No help choosing or cutting. → **Fixed (INFERRED):** past five contributions, a line on Contributions and Review: "You have N contributions. Reviewers read each one closely, and four or five written in full usually carry more weight than N in outline…"; the ten-contribution note now also offers removing the ones that relate least.
- **r6-a-2 · major.** No per-contribution length. → **Fixed:** each folded row and each order card shows its words (and evidence). Splitting the length chart by contribution is **open**.
- **r6-a-3 · major · data-loss.** A written contribution could not be restored. → **Fixed (INFERRED):** Undo for ten seconds, as for evidence; the warning names the words and evidence items it removes.
- **r6-a-4 · major.** Over the limit was said on Review only. → **Fixed:** the rail adds "over 5 p" in burgundy (and says it aloud); Export and the .txt say so.
- **r6-a-5 · minor.** No remove or "leave out" on folded rows or order cards. → **Open for Prem.**
- **r6-a-6 · minor · a11y.** Chart text at 7.6 to 9 px on a wide desktop. → **Fixed (INFERRED):** one chart per row at every width, up to 640 px wide.
- **r6-a-7 · minor.** A "went on to do" answer printed as a fragment. → **Fixed:** an answer that starts with a verb joins the sentence ("…, and now leads the analytics team.").
- **r6-a-8 · polish.** The tool's count runs about 2% under Word's (numbers and letters). → **Open** (the count is of the prose, by design).

## r6-b · mid-career marine biologist, NSERC, two leaves and a lab move: 2 major · 5 minor · 1 polish

Kelp forest recovery data kept through two leaves, an eDNA method for juvenile lobster habitat, a field course for fisheries technicians; about 1,190 words ([draft](r6-b-draft.txt)).

- **r6-b-1 · major.** Nothing said where career interruptions belong. → **Fixed (INFERRED, for Eli):** How you got here's help says where a leave or move goes and how to write it, and that the funding opportunity's instructions say where and how much; no agency rule is stated.
- **r6-b-2 · major.** The five-year window was unexplained. → **Fixed (copy):** the line under the totals says the instructions set the period and where a leave inside it goes. The printed label stays until Eli answers (D-1).
- **r6-b-3 · minor.** The Mentorship example said "Since 2018" against the five-year tiles. → **Fixed** ("Over the last five years").
- **r6-b-4 · minor.** Hedge and passive checks on honest past limitations. → **Fixed:** "could only" and "would have" are not hedges; a pause, delay or restart is not a passive to fix; the hedge message shows how to state an uncertainty as a fact.
- **r6-b-5 · minor.** "No numbers or dates" on text with years. → **Fixed** (a year is a date for that note).
- **r6-b-6 · minor.** "My team ran the course…" got "Your own role is named." → **Fixed** (that tick needs "I" and a verb).
- **r6-b-7 · minor.** No definition of career stage; "Profile updated." said nothing about what changed. → **Fixed:** Setup says to use the funding opportunity's definition of early career where it has one; Confirm names the answers that changed.
- **r6-b-8 · polish.** "interrupted" offered as a theme word. → **Fixed** (leave words added to the stop list).

## Test harness note

A new history test failed only in the full suite: Chrome caps a tab's session history at 50 entries, and 200 earlier checks had filled it, so the test's own entries were not where Back expected. The test now resets the tab's history first (`Page.resetNavigationHistory`). Not a tool defect.
