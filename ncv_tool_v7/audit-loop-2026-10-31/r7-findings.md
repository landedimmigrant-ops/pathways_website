# Round 7 findings: Fable's review of round 6, a committee member reading the outputs, a digital humanist at 150% text, 2026-11-01

Recorded from the three agents' final replies. All walked the round 7 snapshot (= commit 6bb401d).

## Fable review of round 6 (M-1 to M-9): 3 major · 6 minor

- **M-1 · major (run).** A contribution Undo survived a take-up from another tab and could restore a duplicate card. → **Fixed:** a take-up clears every Undo; Undo never restores a card that is already there.
- **M-2 · major (run).** Trainee "went on to do" answers still printed as fragments (irregular pasts, capitals, "is now…", no place before the answer); nouns in -s were taken for verbs. → **Fixed:** the verb test reads the lower-cased first word (listed verbs, -ed/-s words, is/has/was), with a short noun stop-list; with nothing before it the answer follows "I trained" directly.
- **M-3 · major (run).** Back to the start page said "That page belonged to an earlier draft" on the ordinary path. → **Fixed:** Start no longer starts a new generation; a start entry is never "an earlier draft"; a reset re-stamps the start entry.
- **M-4 · minor.** Over-limit outputs disagreed (rail and Export at 500 words a page, Review at 600). → **Fixed:** one rule: "over" when even 600 words a page passes the limit, "may be over" between.
- **M-5 · minor.** Undo edges: the only-contribution case left a blank beside the restored card; at the cap Undo was silent; focus could drop. → **Fixed.**
- **M-6 · minor.** A year, Undecided or Other field change read "Profile unchanged." → **Fixed.**
- **M-7 · minor.** Lookbehind on Safari before 16.4 would break a step's render. → **Fixed** before the review landed (feature test and fallback).
- **M-8 · minor.** Two `replaceState` calls dropped the generation; the earlier-draft branch did not reset `skipping`. → **Fixed.**
- **M-9 · minor.** Review's selection line pointed at Review; saved dates had no year. → **Fixed.**

## r7-a · peer-review committee member reading three finished drafts' outputs: 3 major · 4 minor · 1 polish · 1 unsure

Read the Word, print, .txt and section copies of the sociologist's (SSHRC), engineer's (NSERC) and artist's (FRQ) drafts ([the three .txt files](r7-a-drafts.txt)). The engineer's reads as a narrative CV to paste after a light edit; the artist's after edits; the sociologist's not yet. Text was identical across outputs; Chrome's PDF of the print view measured Letter with 2 cm margins.

- **r7-a-1 · major.** Pasted list markers printed inline, and Review said "Nothing missing". → **Fixed:** Review's At a glance and Export list "Lists to rewrite", linked to each field; the .txt notes them.
- **r7-a-2 · major.** A field without a final full stop ran into the next. → **Fixed:** each part ends as a sentence where parts join (contributions and statement).
- **r7-a-3 · major · regression of r6-a-7.** Capitalised or irregular verb-first answers printed as fragments. → **Fixed** with M-2.
- **r7-a-4 · minor.** Prize names with no article; nested brackets. → **Fixed:** the prize placeholder says it prints after "received"; a unit with its own brackets follows a comma.
- **r7-a-5 · minor.** A single evidence item prints "(a)". → **No change** (letters are the decided form, W-16).
- **r7-a-6 · minor.** Copy draft and the Word note carry tool notes. → **Fixed:** "Copy working draft, with notes"; the Word note is highlighted so it is hard to leave in.
- **r7-a-7 · minor.** "Totals (last five years)" beside a career-long claim. → **Open** (D-1, waits on Eli).
- **r7-a-8 · polish.** "Copy The candidate's…", straight apostrophes, indented notes in the section copy, a space before the superscript, no link note in the .txt. → **Fixed** except the apostrophes (Prem's labels).
- **r7-a-9 · unsure.** Whether Word opens the .doc in Print Layout at Letter. → **Fixed (INFERRED):** the file carries Word's Print view setting; the French half of a CV-FRQ heading is marked French. Opening one file in Word is still worth doing (**for Prem**).

## r7-b · early-career digital humanist, SSHRC, Humanities + STEM, text at 150%: 9 minor · 3 polish

A text-mining tool, a digitized newspaper corpus built with a library, a co-authored article; 1,117 words ([draft](r7-b-draft.txt)). No sideways page scroll at 150%; every pair of fields has a two-field example, in both orders.

- **r7-b-1 · minor.** Rail labels overlapped their counts; the Draft line ran past the rail. → **Fixed:** labels break before they run under a count; the Draft line wraps; the rail does not scroll sideways.
- **r7-b-2 · minor.** Folded rows showed about 8 characters of the headline. → **Fixed:** the squares and figures move to a second line first.
- **r7-b-3 · minor.** Tile labels wider than their tiles. → **Fixed.**
- **r7-b-4 · minor.** Selects cut their option. → **Fixed:** the pairs and the Change panel's columns are sized in em and stack at large text.
- **r7-b-5 · minor · a11y.** 20 of 77 text elements did not grow with the text size. → **Fixed:** the tool's pixel font sizes are in rem (the 16 px phone fields stay).
- **r7-b-6 · minor.** The two-field example reads from one side. → **Fixed (copy):** the match line says which field it is written from, and suggests reading it for how the fields meet when that is not the researcher's main field. Examples written from each side are **open for Prem**.
- **r7-b-7 · minor.** What resulted named only the main field's outputs. → **Fixed:** with a second field it names that field's outputs too.
- **r7-b-8 · minor.** The read across contributions showed stems ("corpu", "humanity"). → **Fixed:** it shows the word as written; two more generic words left out.
- **r7-b-9 · polish.** The past-ability exemption hid the hedge praise in What could change. → **Fixed.**
- **r7-b-10 · minor.** No item hint by kind. → **Fixed:** The item's placeholder follows the kind (for a tool: name, version, licence and where it is archived).
- **r7-b-11 · polish.** No place for libraries, archives and museums. → **Fixed (INFERRED):** the cultural destination reads "Arts, cultural or heritage organization (museum, library, archive)". The work mode label stays (Q12, decided).
- **r7-b-12 · polish.** The person's sentence box was one line. → **Fixed** (a growing box).
