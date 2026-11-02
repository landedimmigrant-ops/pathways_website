# Round 20 findings: Fable's final review and readiness verdict, a blind historian's final screen-reader pass, a first-time nurse-researcher on a tablet, 2026-11-02

Recorded from the three agents' final replies. All walked the round 20 snapshot (= commit 684f857).

## Fable: round 19 review (AD-1 to AD-8) and readiness

- **AD-1, AD-2 · minor (run).** The group-name rule left "3 Technicians" and lowered "Algonquin youth". → **Fixed:** back to a list of common words that may be lowered; everything else prints as typed.
- **AD-3 · minor (run).** "PhD candidate" printed "phD candidate". → **Fixed.**
- **AD-4 · minor (run).** The own-clause rule split at decimals and exempted pronoun-less clauses. → **Fixed:** clauses end at a stop followed by a space; only a clause that names another agent is exempt. The test now checks the flagged case too.
- **AD-5, AD-6, AD-8 · polish.** The One moment health line, the unnamed-company placeholder (now on Industry only, "give its sector instead"), "recognized". → **Fixed.**
- **AD-7 · polish.** "at ___" dropped for an assistant professor. → **Fixed:** an academic rank keeps it.
- **Readiness (summary):** solid enough for a first test with a real researcher. The remaining risks, by user impact: the tool has only ever run in Chrome (Safari and Firefox untested); the Word file has never been opened in Word (Q-5); the funder-fact lines still wait for Eli (Q-2, Q-3, Q-4, Q-27); the field-fit wording is inferred (Q-19), so the first tester should come from humanities, creative or community-engaged work. Before the test: open the page in Safari and Firefox; open one .doc in Word and Google Docs; send Eli the four questions; settle Q-26; write a one-page test protocol (60 to 90 minutes, a real CV at hand, an observer, a saved draft file at the end).

## r20-a · mid-career historian who is blind, SSHRC Insight Grant (TCV), keyboard and screen reader only: 2 minor · 1 polish

A digital edition of a 19th-century diary, a co-authored book; 23 trainees; the full statement; about 720 words ([draft](r20-a-draft.txt)). No earlier fix regressed; every task was finishable without sight; Undo still offered after 14 seconds.

- **r20-a-1 · minor · a11y.** Shift+Tab from the next field skips the role-level group (it hides when the role field closes). → **Open** (a later round).
- **r20-a-2 · minor · a11y.** Review's Still missing and Links jumps were silent about where they landed. → **Fixed:** the link's label is announced on arrival.
- **r20-a-3 · polish · a11y.** "+ Add evidence" and "Edit evidence" did not name their contribution. → **Fixed.** Person fields keep their labels (the card is a named section).

## r20-b · mid-career public-health nurse-researcher, CIHR Project Grant (TCV), Health + Social sciences, community-engaged, first time on a tablet: 2 minor · 2 polish

Harm-reduction outreach co-designed with people who use drugs, a community overdose-surveillance dashboard, peer-worker training; 73 trainees and peer workers; the full statement; 1,126 words ([draft](r20-b-draft.txt)). No regressions; no deficit terms anywhere in the tool's copy; the tool kept the draft partner-respecting throughout.

- **r20-b-1 · minor · field fit.** One moment's health line asked agreement from a clinic or community, not a person. → **Fixed.**
- **r20-b-2 · polish.** The folded role repeated "I co-led it · I co-led…". → **Fixed.**
- **r20-b-3 · polish.** The Competition placeholder was clipped at 834 px. → **Fixed:** "For example, a grant, chair or award".
- **r20-b-4 · minor.** Social sciences examples only for Mentorship and the statement. → **Open** (Q-8).
