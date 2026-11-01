# r3-a findings: early-career mechanical engineer, NSERC Discovery, keyboard and screen reader only, desktop 1280 × 900, 2026-10-31

Recorded from the persona agent's final reply. Counts: blocker 0 · major 1 · minor 7 · polish 8. No console errors, no dialogs, no off-site requests. Walked the round 3 snapshot (= commit ed42314).

## Summary

- Blind early-career engineer, STEM / engineering, team-based and industry-partnered; keys only, checking focus, accessible names and the live region after every key.
- Contributions: "A compliant gripper cut cycle times on a collaborative robot line" (co-led, one paper); "A battery-pack cooling plate that cut peak cell temperature by 9 degrees" (led, one uptake item). Mentorship: 8 trainees, Person A now in industry with a prize; three style answers. Statement 7 of 7. About 700 words.
- Would take it forward after hand edits. The whole flow works by keyboard; the friction was the evidence kind chooser and hints that forms mode never reaches.

## Findings and what happened

- **r3-a-1 · major.** In the folded kind chooser (round 2), each arrow press chose a kind, folded the chooser and moved focus away; the kind was never spoken. → **Fixed:** arrows move through the nine kinds with the chooser open and say "Kind: …"; a click, Enter or Space chooses and folds; Change is named "Change the kind of evidence item a, now Funding".
- **r3-a-2 · minor.** Hints and suggestions were not tied to their field. → **Fixed:** the help and the checks are in the box's `aria-describedby`; the spoken suggestion count reads the first suggestion.
- **r3-a-3 · minor.** A shrunk working draft stayed a Tab stop with its text exposed. → **Fixed** (`visibility: hidden` when shrunk).
- **r3-a-4 · minor.** Export messages were spoken twice; "Copied." did not say what. → **Fixed:** one live region per message; "Copied Personal statement.", "Copied the draft."
- **r3-a-5 · minor.** Setup's last answer said only "6 of 6 answered"; Confirm sits after the six jump buttons. → **Fixed (copy):** "6 of 6 answered. Confirm profile is ready, after the questions." The Tab order is unchanged (Setup's column, DECIDED in pass E); **open for Prem**.
- **r3-a-6 · minor.** The totals boxes were named only "Doctoral", "Master's" and so on. → **Fixed:** one group named by "People you have trained in the last five years".
- **r3-a-7 · minor.** A position printed as a list item ("…manufacturer, process engineer, and received…"). → **Fixed:** the unit or position follows the organization in brackets.
- **r3-a-8 · minor.** Silent reveals. → **Fixed:** "Evidence item a added. Choose its kind.", "Contribution 1 opened." (it now opens on the first required part still to write, the optional One moment last), "Organization and Unit or position added."
- **r3-a-9 · polish.** Heading levels skip (h1 → h3 on the start page; example titles as h4). → **Open** (a change of heading levels touches the shared styles; later round).
- **r3-a-10 · polish.** Escape in the Change panel was silent. → **Fixed** ("Profile unchanged.", as Cancel).
- **r3-a-11 · polish.** Focus rings in two colours. → **Fixed:** links, the skip link and the draft regions take the burgundy ring.
- **r3-a-12 · polish.** The start page's title link is a Tab stop that does nothing there; `aria-controls` points at ids that do not exist while collapsed. → **Open** (polish).
- **r3-a-13 · polish.** The kind group read "a Kind of evidence"; the first-sentence boxes had no sentence context. → **Fixed:** "Evidence item a: kind"; the three boxes are a group named with the sentence.
- **r3-a-14 · polish (unsure).** "8 of 9 answered" on a finished card, because the optional One moment counts. → **Open for Prem.**
- **r3-a-15 · polish.** Removing the only person said "removed" and showed an empty Person A. → **Fixed** ("Person A cleared.").
- **r3-a-16 · polish.** Undecided disabled the competition box without a word. → **Fixed** (spoken).

## Verified working

Skip link; focus on step headings; the live region cleared per step; roving radio groups; evidence add, remove and Edit; inline warnings (focus in, Escape out); role levels out of the Tab order while closed; the column after the fields; the deferred count; the link note; order-list moves; grouped Still missing; Export format arrows, downloads, Download all visuals; the Change disclosure; landmarks, named sections, `role="img"` charts, `aria-current="step"`.
