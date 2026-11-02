# Round 12 findings: Fable's review of round 11, a senior clinician-scientist pasting ten contributions from Word, an arts-based health researcher on an iPad reopening a V6 draft, 2026-11-01

Recorded from the three agents' final replies. All walked the round 12 snapshot (= commit 5ded397). The walks stopped at a usage limit and were resumed.

## Fable review of round 11 (U-1 to U-8): 1 major · 7 minor

Checked and sound: the per-person `aria-describedby` after removals, the read-back's `aria-hidden` (every flag names its words), the scroll-guard timing, `resolveEdiQ`, the Undo-expiry focus, "Clear the year", page titles. No output disagrees with the screen.

- **U-1 · major (run).** The inline "1)" strip ate an English parenthetical: "Nurses (n = 45) took part" lost its number, and "No numbers or dates" could fire. → **Fixed:** a list marker counts only at a line start or after a semicolon, colon or full stop.
- **U-2 · minor (run).** French number words matched English: "seize the chance", "Sept.", "per cent", "Mille Lacs", "Dix". → **Fixed:** French number words count only in text that reads as French (a stop-word test).
- **U-3 · minor (run).** The ordinary-space join merged separate numbers: "In year 1 200 students", "Table 2 123", "3 100 m runs". → **Fixed:** an ordinary space joins digit groups only in French text.
- **U-4 · minor.** The once-per-question Setup announcement was never reset, so a second Setup pass in a session stayed silent. → **Fixed.**
- **U-5 · minor.** The Welcome-back banner arrives already holding its text, which screen readers often skip. → **Fixed:** the banner is added empty and takes its text a frame later.
- **U-6 · minor.** A stale "previous kind" could restore a removed item's kind on Escape. → **Fixed:** cleared on a pick, an add and a removal; Escape without a match says "Kind: …".
- **U-7 · minor (run).** "An NGO" and "The University of Ottawa" (a phone's capital) kept their capital article mid-sentence. → **Fixed:** "a" and "an" are always lowered; "the" before a lower-case word or "University".
- **U-8 · minor.** The note says only number, list, link and length checks apply to French, but the journal-metric check does too. → **Fixed.**

## r12-b · early-career arts-based health researcher, CIHR (TCV), Creative / fine arts + Health / clinical, community-engaged, on an iPad (1024 × 768 and 768 × 1024, touch), reopening a draft saved in V6: 1 major · 6 minor · 4 polish

A participatory theatre program with people living with dementia and their carers, a film made with hospital staff, a training guide for arts facilitators in long-term care; 13 trained, three people described; the full statement; about 1,050 words ([draft](r12-b-draft.txt)). The V6 text landed in the right V7 fields. Rotation while typing kept focus, text and view; a field opened by Tab came fully into view at 768 × 600; every export carried the new profile. No regressions against rounds 1 to 11.

- **r12-b-1 · major.** Opening a V6 file said nothing about what came across; the V6 advisor questions, pasted structural-read text and "needs work" marks were kept but shown nowhere. → **Fixed:** the opening line says the file came from an earlier version and that those parts have no place in this one and are not shown. They stay in the file (nothing is deleted).
- **r12-b-2 · minor.** Switching the agency in the Change panel kept the old agency's competition name with no hint. → **Fixed:** "This name was entered for SSHRC. Update it if it no longer applies."
- **r12-b-3 · minor · a11y.** Buttons (40 px), the banner links (27 to 35 px) and the field-column squares (24 px) were under 44 px on a touch tablet. → **Fixed** for buttons and banner links. The field-column squares are unchanged (the column's layout depends on them).
- **r12-b-4 · minor · field fit.** The community-engaged cues replaced the field's own cues in "How each part sounds in your field". → **Fixed:** the field's cue stays, with the partners added.
- **r12-b-5 · minor · field fit.** The second field added a line only to What resulted. → **Fixed (INFERRED copy):** it adds a line to What you did and What already changed too.
- **r12-b-6 · minor · field fit.** No destination for a care home. → **Open for Prem** (Q-21).
- **r12-b-7 · polish.** The second field is clipped in the Profile bar on an upright iPad. → **Open** (Q-14).
- **r12-b-8 · polish.** The Other group-name box showed the tail of the name. → **Fixed:** the start shows once the box loses focus.
- **r12-b-9 · polish.** The evidence chart's label and order differ from the chooser. → **No change** (r9-a-9).
- **r12-b-10 · polish.** Review and Export stay marked done after edits made after an export. → **No change**; the save-since warnings cover the draft file.

## r12-a · senior cardiology clinician-scientist, CIHR Project Grant (TCV), Health / clinical, team-based and partnered, pasting ten contributions from an old Word CV at 1920 × 1080: 5 minor · 4 polish

Ten contributions (an NSTEMI trial in older adults, a cardiac-arrest registry, a polypill trial, wearable AF screening, heart-failure transition clinics and more), cut to six with Review, Move up/down, Remove and Undo; 371 trainees and four people described; the full statement; 2,375 words at the end ([draft](r12-a-draft.txt)). No regressions. Pasted symbols, curly quotes, no-break spaces, "et al.", "e.g." and DOIs survived every output and a reload; counts and page verdicts agreed in the rail, Review and Export at every stage; typing 2,500 characters took 0.27 s and Review rendered in 62 ms.

- **r12-a-1 · minor.** An inline numbered list on one line ("1. … ⇥2. … 3. …") was not flagged. → **Fixed.**
- **r12-a-2 · minor.** A lone leading bullet was kept in the output. → **Fixed:** dropped where the parts join.
- **r12-a-3 · minor.** A pasted tab survived into the .txt and Word. → **Fixed:** tabs print as spaces.
- **r12-a-4 · minor.** "my research has asked… our guidelines" was read as "we" with no part named. → **Fixed:** "my research / work / program" names your part; "our guidelines", "our field" are general.
- **r12-a-5 · minor.** "4.5 to 5 pages" beside "may be over 5 pages". → **Fixed:** near the limit the range rounds outward ("4 to 5.5 pages").
- **r12-a-6 · polish.** A confidence interval or a range counted as two numbers. → **Fixed:** counts once.
- **r12-a-7 · polish.** Words joined by an em dash counted as one. → **Fixed.**
- **r12-a-8 · polish.** "Fall 2026 2027". → **Fixed:** "(applying 2027)" in the Profile bar.
- **r12-a-9 · polish.** The Other group-name box clips a normal name. → **Fixed in part** with r12-b-8 (the start shows after editing).
- Field fit: the Health / clinical prompts read well for a cardiologist; the missing health examples for Mentorship and the statement are Q-8.

