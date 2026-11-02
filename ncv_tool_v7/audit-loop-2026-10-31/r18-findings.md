# Round 18 findings: Fable's review of round 17 and a whole-file pass, two end-to-end regression walks (a sociologist of education on a desktop, a physiotherapy researcher on a phone), 2026-11-01

Recorded from the three agents' final replies. All walked the round 18 snapshot (= commit cc60013).

## Fable review of round 17 and the whole file (AB-1 to AB-10): 2 major · 8 minor

Round 17's fixes all checked clean (the headline field, Reset, `resetSince`, the unknown-agency rows, the Competition field, forced colours, reduced motion).

- **AB-1 · major (run).** Lowering a group name's first capital printed "5 cree youth" (also Mohawk, Inuk, Anishinaabe, Québec). → **Fixed:** only a common group noun (students, fellows, clinical, residents…) is lowered; names stay as typed.
- **AB-2 · major (run).** The French note no longer fired for a French statement with English contributions, and never looked at Mentorship. → **Fixed:** any section that reads as French gets the note.
- **AB-3 · minor (run).** Tab-separated list markers counted as numbers. → **Fixed.**
- **AB-4 · minor (run).** "Untitled contribution" counted in the Length tile. → **Fixed.**
- **AB-5 · minor.** Work-mode precedence differs between the resolvers. → **Open for Prem** (with Q-22).
- **AB-6 · minor.** The feedback summary chose contributions by a different test. → **Fixed.**
- **AB-7 · minor.** About 200 lines of dead code (the old structural read, `promptBlock`, the advisor packet). → **Open** (after the loop).
- **AB-8 · minor.** A Reset mirrored in a hidden tab took up the blank draft rather than the Reset. → **Fixed.**
- **AB-9 · minor.** `otherTab` declared after its first use. → **Fixed.**
- **AB-10 · minor.** The disabled Competition field's only reason was its placeholder. → **Fixed:** a visible help line.

## r18-a · mid-career sociologist of education, SSHRC Insight Grant (TCV), Social sciences, team-based and community-engaged with school boards, desktop end to end: 6 minor · 2 polish

Four contributions (streaming in Ontario high schools, a school-board dashboard, a teacher-education module, course decisions); 24 trainees; the full statement; about 1,670 words ([draft](r18-a-draft.txt)). Every output matched the screen; Undo, reorder, Still missing links, the nine self-check boxes, file save and open, Reset and history all worked.

- **r18-a-1 · minor.** An empty note read "1 word" (third sighting). → **Fixed:** the cause was a never-matching pattern `/$^/` that does match an empty string, so its "$1" replacement printed "$1" in every empty field's count. All six uses replaced.
- **r18-a-2 · minor.** A blank draft counted 2 words. → **Fixed** with r18-a-1 and AB-4.
- **r18-a-3 · minor.** "Grade 9" and a role line's "two colleagues" counted as specific numbers. → **Fixed:** grade, year, phase and similar labels are not figures; no number tick on the role line.
- **r18-a-4 · minor.** The hedge check flagged "what could be shown" in a role line. → **Fixed:** no hedge check on the role line.
- **r18-a-5 · minor · field fit.** The agreement line assumed a community. → **Fixed:** "If a partner or community asked for this work, say so…".
- **r18-a-6 · minor · field fit.** No school or school-board destination. → **Open** (Q-21).
- **r18-a-7 · polish.** "leads most directly into SSHRC Insight Grant". → **Fixed:** "into this competition (SSHRC Insight Grant)".
- **r18-a-8 · polish.** The rail says "started" for finished steps. → **No change.**

## r18-b · early-career physiotherapy researcher, CIHR Project Grant (TCV), Health, team-based, on a 390 px phone end to end: 1 major · 5 minor · 6 polish

A falls-prevention exercise trial in 16 community centres, a balance-assessment app, a clinical-placement program; 19 trainees; the full statement; about 1,120 words ([draft](r18-b-draft.txt)). No sideways scroll on any step; focused fields never hidden; every output matched the screen.

- **r18-b-1 · major.** After removing an evidence item, focus went to Undo below the screen. → **Fixed:** it is brought into view.
- **r18-b-2 · minor.** "1 word" under an empty note. → **Fixed** with r18-a-1.
- **r18-b-3 · minor.** Undo links were 26 px tall on a phone. → **Fixed:** 44 px.
- **r18-b-4 · minor.** "Reset draft" was 32 px, close under Continue. → **Fixed:** 44 px with space above.
- **r18-b-5 to r18-b-9 · polish.** Clipped labels, the fold row, chart scrollers, the first-sentence boxes, Export spacing. → **Open** (layout polish).
- **r18-b-10 · minor · field fit.** Clinical placement students and clinics. → **Fixed in part:** "Health system or clinic (hospital, clinic, …)". Placement students are Q-21 and Q-20 material.
- **r18-b-11 · polish · field fit.** One moment for health. → **Fixed:** health help asks to leave out details that could identify a patient or participant.
- **r18-b-12 · polish.** The Other kind name took a whole reference. → **Fixed:** 60 characters at most.
