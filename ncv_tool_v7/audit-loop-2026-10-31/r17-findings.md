# Round 17 findings: Fable's review of round 16, a new professor who has not chosen an agency or competition, a low-vision researcher in Windows high contrast with reduced motion, 2026-11-01

Recorded from the three agents' final replies. All walked the round 17 snapshot (= commit 017af9c).

## Fable review of round 16 (AA-1 to AA-8): 1 blocker · 1 major · 6 minor

Checked and clean: the headline block and evidence note in print and Word, the section copy and .txt headlines, the Undo allow-list, the self-check ids, the community role example by field, the phone tiles, the bracket join, the article strip.

- **AA-1 · blocker (run).** A trailing comment swallowed the headline field's `line`, `placeholder` and `wordHint`: the headline became a two-row box that took Enter, and every field lost its placeholder. → **Fixed.** A **static test now fails on any code hidden behind a trailing `//` comment** (the third such slip).
- **AA-2 · major (run).** If writing the Reset mark failed (a full store), Reset said "Draft cleared." but left the draft in place. → **Fixed:** the removal does not depend on the mark.
- **AA-3 · minor.** Reset writes a blank draft right after removing the key, so other tabs took it for cleared data. → **Fixed:** a Reset counts when its mark is newer than the tab's last save.
- **AA-4 · minor (run).** One French field in an English draft triggered the French note on Export. → **Fixed:** decided per contribution and for the statement.
- **AA-5 · minor (run).** The community agreement line repeated "say so" after the health community help. → **Fixed.**
- **AA-6 · minor (run).** A one-word group name kept its capital ("7 Postdocs"). → **Fixed.**
- **AA-7 · minor.** The marker strip in the number count lagged the new list detector. → **Fixed.**
- **AA-8 · minor.** A take-up queued behind a cleared-data warning could later overwrite another tab's new draft. → **Fixed:** the warning clears it.

## r17-a · newly hired assistant professor in environmental studies, agency "Not sure yet", competition Undecided, Social sciences + STEM, early career; later SSHRC Insight Development, then CV-FRQ and back: 1 major · 5 minor · 4 polish

Heat adaptation in apartments, an urban tree-canopy dataset, a project course; 7 trainees; the full statement; about 800 words ([draft](r17-a-draft.txt)). No placeholder token, empty bracket or stale "this competition" in any output; naming the competition later updated every prompt, heading and output; switching formats lost no text.

- **r17-a-1 · major.** With no agency, Export stated only the TCV's link and language rules. → **Fixed:** both formats are shown, as the font rows already were, and the section names say they are the Tri-agency CV's until an agency is chosen.
- **r17-a-2 · minor.** The Word note said "your agency's section names" and Times New Roman as fact. → **Fixed:** "the Tri-agency CV's section names until you choose an agency", and the agency's name once chosen.
- **r17-a-3 · minor.** The disabled Competition field looked editable. → **Fixed:** grey, with "Undecided is on; turn it off to name a competition".
- **r17-a-4 · minor.** "This name was entered for FRQ" for a name that mentions the chosen agency. → **Fixed.**
- **r17-a-5 · minor.** The team answer leaves the TCV outputs silently. → **Open** (it is kept; a line saying so is a later round).
- **r17-a-6 · minor.** Nothing said to use Undecided for an empty competition. → **Fixed.**
- **r17-a-7 · polish.** A blank draft counted 3 words. → **Fixed.**
- **r17-a-8 · polish.** "1 word" under an empty note. → **Not reproduced** (also r15-a-4; the count reads 0 in tests).
- **r17-a-9, r17-a-10 · polish.** A sentence written before naming the competition; a competition name for another agency on the Profile line. → **No change.**

## r17-b · mid-career kinesiologist with low vision and migraines, CIHR Project Grant (TCV), Health / clinical, in Windows high contrast and reduced motion, then a dark scheme: 1 major · 5 minor · 3 polish

An exercise program for people with heart failure, a wearable-activity dataset, coaching guidelines adopted by a provincial program; 20 trainees; the full statement; 919 words ([draft](r17-b-draft.txt)). Controls, tiles, ticks, the current step, focus outlines on buttons and the charts stay visible in forced colours; scrolling is instant with reduced motion.

- **r17-b-1 · major · a11y (1.4.1).** In forced colours the finished examples' parts and legend vanished (colour only). → **Fixed:** in forced colours each part of an example is labelled in brackets.
- **r17-b-2 · minor · a11y.** Done steps and written squares matched the empty state in forced colours. → **Fixed:** they fill with the text colour.
- **r17-b-3 · minor · a11y.** A chosen role level or year showed only as bold in forced colours. → **Fixed:** a tick.
- **r17-b-4 · minor · a11y.** Text-field focus was a 1 px border change in forced colours. → **Fixed:** a 2 px outline.
- **r17-b-5 to r17-b-7 · minor · a11y.** The rail grow animation, field-help transitions and the rail chevron still moved under reduced motion. → **Fixed:** with reduced motion nothing in the tool animates.
- **r17-b-8 · polish.** No dark scheme; small-control borders under 3:1. → **Fixed in part:** borders and glyphs darkened. A dark scheme is not built.
- **r17-b-9 · polish · field fit.** Arts wording in the Peer-reviewed hint for health. → **Open** (minor).
