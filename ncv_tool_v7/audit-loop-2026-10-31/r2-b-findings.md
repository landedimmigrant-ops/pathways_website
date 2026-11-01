# r2-b findings: early-career research-creation artist, FRQ (CV-FRQ), desktop 1440 × 900, 2026-10-31

Recorded from the persona agent's final reply. Counts: blocker 0 · major 0 · minor 8 · polish 4. No console errors, no off-site requests. Walked the round 2 snapshot (after round 1's fixes, before round 2's assembly change).

## Summary

- Media-art and performance researcher at a Montréal university. FRQ, Creative / fine arts + Humanities, early career, largely solo + community-engaged; competition "Soutien à la recherche-création, FRQSC (équipe)" 2027. Writes English with French typography.
- Contributions: a touring sound installation on Montréal's back lanes (a video link and a press link), a community performance co-created with residents of Hochelaga-Maisonneuve, a published artist's book on a Québec village's soundscape.
- Mentorship: 2 undergraduate assistants (one now at an arts centre), 2 style paragraphs. Background and skills: 8 of 8, with "How you complement the team".
- Length: 963 words by the tool, about 1.5 to 2 of 5 pages.
- Would take it forward: yes. Word, Print, .txt, section copies, PNGs, save, Reset and reopen all worked; accents, « » with non-breaking spaces, ’ and the decimal comma survived every output. Hand edits needed for W-14, W-17, W-20 (fixed in round 2).

## Findings and what happened

- **r2-b-1 · minor.** "Personal statement" hard-coded in the Contributions nav note and Setup's competition help under the CV-FRQ. → **Fixed** (built from the section name).
- **r2-b-2 · minor.** Word and number counters: a lone « or » counts as a word, a sentence-final "2025." was dropped as a list marker (a regression of r1-a-3), "3 200" counts as two numbers, and three counters used three methods. → **Fixed:** one `countWords` for every counter (a word holds a letter or a digit; list markers only at a line start; digit groups joined by a non-breaking or thin space are one number).
- **r2-b-3 · minor.** Under the TCV in a creative field, a press link got the same "permitted for creative outputs" note as the video link, and Review listed neither. → **Fixed (INFERRED):** the creative exception covers items of kind Exhibition / performance or Other (or no kind yet); a press article or paper keeps the full rule and appears under Links to take out.
- **r2-b-4 · minor.** The CV-FRQ flag said "move to the evidence list" in fields that have no evidence list. → **Fixed:** "Add this link to the evidence list of the contribution it supports, or give the reference in words."
- **r2-b-5 · minor.** Setup promised format notes that appear only on Export; Review's closing line and Format check were generic; the FRQ header and footer rule was not mentioned. → **Fixed:** Setup says "on Export"; Review names the agency's template; the Word note adds the CV-FRQ header and footer line.
- **r2-b-6 · minor.** Creative fit: four of five items went under Other; no arts destination; Standing cites papers and datasets; the Mentorship and statement examples are social sciences only. → **Fixed (INFERRED):** a ninth kind "Exhibition / performance" (Q13, for every field), an "Arts or cultural organization" destination, a creative Standing prompt. The examples stay open for Prem (with r1-a-5).
- **r2-b-7 · minor.** CV-FRQ headings were bilingual in the .txt and English only in Word and Print. → **Fixed:** one heading rule; Word and Print carry "English / French" for the CV-FRQ.
- **r2-b-8 · minor.** "Who else you mentor" stays in Still missing for an early-career researcher with no one else to name. → **Fixed (INFERRED):** optional at the early career stage.
- **r2-b-9 · polish.** Straight apostrophes in tool-made headings next to the researcher's ’. → **No change** for now (the section names follow the agencies' templates).
- **r2-b-10 · polish.** "(FRQ)" added after a competition naming FRQSC. → **Fixed** (FRQSC, FRQNT and FRQS count as naming the FRQ).
- **r2-b-11 · polish.** The cue list showed "Stakes . What…". → **Fixed** (the full stop is inside the bold label).
- **r2-b-12 · polish.** "2,5 times as many" flagged as vague; Setup's "Does your work also sit in another field?" uses personification. → **Fixed** ("as many" after a number is a quantity; "belong to another field").

## Verified working

Profile bar and Export line for FRQ; section names in rail, headings, Review, Export and .txt; the team question everywhere; links under the CV-FRQ; non-breaking spaces, « », ’, accents and the decimal comma preserved in every output, the PNGs and the saved .json; Word 12-point Times New Roman on Letter with 2 cm margins; Reset then reopen restored the draft byte for byte; round 1's Confirm profile fix and the on-screen evidence notes.
