# r3-b findings: rushed postdoctoral fellow in public health, CIHR, edge cases on purpose, desktop 1366 × 768, 2026-10-31

Recorded from the persona agent's final reply. Counts: blocker 0 · major 0 · minor 8 · polish 5. No console errors, exceptions, dialogs or off-site requests across the whole walk. Walked the round 3 snapshot (= commit ed42314).

## Summary

- Early career, Health / clinical, team-based and community-engaged. Broke the tool on purpose: 1,500-word pastes, a 373-character headline with Arabic and emoji, HTML-looking text, tabs, ten contributions then three removed, totals of 0, 999 and letters, six people then two removed, many profile changes, Back and Forward, reloads mid-typing, the V6 offer both ways, files that are not drafts.
- Final draft: seven contributions (three full: a rural medication-review trial, a wound-care protocol, a home-check program; four stubs), four people described, a full statement; about 955 words. The heavy version ran to about 6,800 words.
- Nothing was lost across any of it. Escaping held in every output (screen, Review, Word, Print, .txt, section copies, the draft file, the PNG labels).

## Findings and what happened

- **r3-b-1 · minor.** An unbroken 250-character headline overflowed its card on Review and scrolled the page sideways. → **Fixed** (`overflow-wrap: anywhere` on the order card's headline).
- **r3-b-2 · minor.** The move buttons and the "moved to position" message read the whole headline (383 characters). → **Fixed** (the 60-character cut the remove warning uses).
- **r3-b-3 · minor.** "a MD/PhD", "a HIV", "a NMR" in the first sentence. → **Fixed** with the review's G-3 (an acronym takes the article of its first letter's name).
- **r3-b-4 · minor.** No length check on the headline or an evidence item. → **Fixed:** past 15 words the headline says "A headline reads best at about 15 words or fewer"; past 60 words an item says it should name the source.
- **r3-b-5 · minor.** Stub contributions reach the paste-ready outputs, and a lone "(a)" printed with no body text. → **Partly fixed:** the letters print only with body text. A line on Export naming unfinished contributions is **open** (the .txt already carries the notes; Review lists them).
- **r3-b-6 · minor · data-loss risk.** Evidence × removed at once with no undo. → **Fixed (INFERRED):** removal stays instant (W-45) and "Evidence item b removed. Undo" restores it for ten seconds.
- **r3-b-7 · polish.** Trainee totals had no thousands separators. → **Fixed.**
- **r3-b-8 · polish.** "11.5 to 13.5 of 5 pages" over the limit. → **Fixed:** "11.5 to 13.5 pages, roughly · about 6,800 words. The limit in English is 5 pages." (tile and chart).
- **r3-b-9 · minor.** The Change panel confirmed a profile with no work mode. → **Fixed:** it asks for one first, as Setup does.
- **r3-b-10 · minor.** Focus fell to the page after "Start without it" and after a rejected file. → **Fixed** (the Start card; the error line).
- **r3-b-11 · minor.** "Open my V6 draft" said nothing. → **Fixed** ("Opened your draft from V6."); it still opens on the step V7-38 maps the saved step to.
- **r3-b-12 · polish.** The V6 banner touched the cards. → **Fixed** (a gap).
- **r3-b-13 · polish (unsure).** Arabic text in a box had no direction set. → **Fixed:** every text box takes `dir="auto"`. The HTML outputs are unchanged.
- **Also:** the people chart cut "Health system (hospital or…"; the chart now uses short sector names.

## Verified working

Escaping in every output; a 1,500-word paste stored whole with checks and the rail responding; the ten-contribution maximum; removal renumbering and focus; reorder carried into every output; letters re-derived; totals clamped (letters rejected, 99999999999 → 999, "-5" → 5, "12.7" → 12, "1e3" → 1); profile changes with nothing lost and CV-FRQ headings following; Back and Forward and reloads; the V6 offer both ways and declined for good; non-draft files rejected inline with the draft untouched; the recovery copy for a corrupt store; the outside-clear rule; every export and the visuals at extreme values.
