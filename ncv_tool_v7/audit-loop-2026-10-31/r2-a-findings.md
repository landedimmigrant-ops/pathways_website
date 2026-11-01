# r2-a findings: mid-career nurse scientist, CIHR Project Grant, phone 390 × 844 (touch), 2026-10-31

Recorded from the persona agent's final reply. Counts: blocker 0 · major 0 · minor 9 · polish 7. No console errors, no off-site requests, no sideways scroll at 390 px. Walked the round 2 snapshot (after round 1's fixes).

## Summary

- Health / clinical + Social sciences, team-based and community-engaged; writes on the phone in short sessions, with VoiceOver-style checks of focus and the live region.
- Contributions: a clinical practice guideline for early mobility after cardiac surgery, adopted by two hospitals; a trial protocol designed with patients who live with chronic wounds; a bedside training program that taught 300 nurses to assess delirium.
- Mentorship: 5 master's and 2 undergraduate researchers; two people described (a master's student now a nurse manager at a health authority; an undergraduate now in a Master of Nursing program); three style paragraphs. Statement: 7 of 7.
- Length: about 940 words, 1.5 to 2 of 5 pages. Nothing lost across six reloads, a hide and show, and a partial Setup reload.
- Would take it forward after hand edits (role-first order, kind labels, mentee arrow lines: all fixed in round 2).

## Findings and what happened

- **r2-a-1 · minor · bug.** The card's count and squares ignored a typed evidence item until a redraw ("8 of 9" stayed). → **Fixed:** the card's progress, squares and spoken count follow an item gaining or losing its text.
- **r2-a-2 · minor.** No hospital or health authority destination; "nurse manager" had to go under "Unit or subdivision". → **Fixed (INFERRED):** "Health system (hospital or health authority)" destination; the field is "Unit or position"; the draft prints "now works in the health system at …".
- **r2-a-3 · minor · a11y.** The link warning on an evidence item was silent and not tied to the box. → **Fixed:** `aria-describedby` on the box; the note is spoken once when it first appears.
- **r2-a-4 · minor · a11y.** Export downloads confirmed nothing. → **Fixed:** "Downloaded narrative-cv-draft-cihr.txt." beside the button and aloud.
- **r2-a-5 · minor · a11y.** After Reset, focus was on the body and nothing was said. → **Fixed:** focus on the start page title; "Draft cleared." is spoken.
- **r2-a-6 · polish.** The cue list read "Stakes . A gap…" with ragged wrapping. → **Fixed** (the list is running text; the full stop sits in the label).
- **r2-a-7 · minor.** Review's working draft was a 368 px box scrolling inside a phone page. → **Fixed:** on phones the draft takes its full height.
- **r2-a-8 · minor.** The strip printed the level and the role line ("I co-led it. I co-led…"). → **Fixed** by round 2's single assembly (W-14): the level guides the line and does not print.
- **r2-a-9 · minor.** After a reload the writer landed well above the card. → **Fixed (INFERRED):** the welcome-back banner holds "Go to where you were", which opens the first part still to write on that step.
- **r2-a-10 · polish.** Small tap targets in the top bar and the At a glance links. → **Fixed** on phones and touch screens (44 px).
- **r2-a-11 · polish.** The Mentorship and statement examples are Social sciences for a Health profile. → **Fixed (copy):** "There is no Health / clinical example yet. This one is written for Social sciences." Examples for other fields stay open for Prem (with r1-a-5).
- **r2-a-12 · polish.** A long headline scrolled out of its one-line box on a phone. → **Fixed:** the headline box is one row that grows with its text (Enter still adds no line).
- **r2-a-13 · polish · a11y.** No main landmark. → **Fixed:** the step content is `role="main"`.
- **r2-a-14 · polish.** "Why this example matters" on a trained person. → **Fixed:** "What this person's path shows".
- **r2-a-15 · polish.** Register slips in Setup and the One moment help. → **Fixed** (round 2 register sweep).
- **r2-a-16 · minor.** Export showed no flag for a link still in the draft. → **Fixed:** Export names each link still in the draft, linked to its field.

## Verified working

Focus on the step heading after every step change; Setup's next-question focus and announcements; evidence and contribution add and remove announcements; roving tab stops; the skip link; order-list moves; notes in the on-screen draft; the .txt name; line breaks collapsed in the .txt and section copy; autosave across reloads; Review checkboxes survive a reload; the Change panel opens in place and Escape returns focus to Change.
