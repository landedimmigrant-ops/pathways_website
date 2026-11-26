# NCV tool: language rules

The rules Prem set during the block-by-block language pass (19–24 November 2026). Each rule comes from a correction he made; the row in `language-notes.md` where it was decided is in brackets. Read this before writing or reviewing any string in the tool. It works with `DESIGN.md` (section 2), `VOCABULARY.md` and the `pathways-voice` skill.

## 1. First ask whether the line is needed

- A line that only describes what the screen already shows is deleted, with no replacement offered ("You start with your contributions": "nothing goes there") (row 4, C13, C18).
- A line stays when it gives a reason the screen does not show ("You will start with contributions because…") (C1).
- Help appears only where it adds something; a help line that repeats the question goes (C9).
- A message the researcher cannot act on is not shown (the tester sign-up retry runs silently) (T10).
- Two lines that say the same thing are cut to one (C13).

## 2. Message types

| Type | Form | Example |
|---|---|---|
| Instruction | "To X, please Y." One goal, one action, about 12 words | "To Review and Export CV, please complete at least one contribution." |
| Hint | Circled "i", visually hidden "Tip:" for screen readers; side information, never a rule | "You will put your contributions in order during Review, after your personal statement." (C1) |
| Guidance | Short plain prose for a step intro; reason, what it is, how many, guide link | C1, M1, PS1 |
| Status | Says what happened, plainly | "Backup file “[name]” opened." (S15) |
| Warning | Soft and short: the effect on the draft, then one polite action as a link | "Your browser is not saving your draft. Please save a backup file." (S10) |

- Step intros follow one pattern: "In this section, you will describe…" (what it is), why it comes here, how many or which ones, "We recommend…", "For more information, please read [guide link]", then any ordering hint (C1, M1, PS1).
- Help and hint are separate: the help is the step to take; the hint carries lists and side facts (C5, C7, C8).

## 3. Words

- Plain verbs, no metaphors: "add" (not "put back"), "appears" (not "prints"), "close" (not "fold"), "refer back to" (not "draws on"), "enter" a number, "open" a file (rows 6, C16, C20a, PS1, M3, S9).
- No tool machinery: "Role level", "format notes", "font rules", "Other" as a capitalised label, "Team voice", "strands", "marks" (P1, P4b, C17, C21, M3).
- "please" in instructions; "We recommend" for advice; never "You should" (C1, M1, M4).
- Labels carry no "you" or "your": "Mentorship approach", "Team composition", "Informal mentorship" (M6–M8).
- Single operational words for choices, with the detail in a sub-line: "Solo", "Industry", "Public sector" (P9).
- Be specific where people could feel unnamed or lumped together: partners split into Industry, Public sector, Health system, Non-profit, Cultural sector; "Indigenous communities" names First Nations, Inuit and Métis communities, organizations or governments (P9).
- Do not list examples of fields: someone whose field is not named feels left out (P7, D1).
- One name for one thing: "backup file" everywhere; "part" (never "field" for a part of a contribution); "The problem or question" for part 1; "contribution or experience" once in the intro, "contribution" after (S4, C1, C20b).
- "competition" in the profile and wherever the funding call is meant; "your application" for what a contribution should relate to (P5, P6, C1).
- Numbers one to nine spelled out ("three or four"); 10 and up as numerals (C1).
- Avoid words that alarm or blame: "at risk", "stopped working", "was cleared" (which suggests the user did something). Say the effect: "Your browser is not saving your draft." (S10, S11).
- Avoid vague or technical words Prem rejected: "closest" (use "most related"), "a form" (say "an art form, medium or practice"), "how large" (say "at what scale"), "sounds" (S2 row 2, P7, C11, C8, C2).

## 4. Examples and lists

- An example is one concrete sample answer. A list of possibilities ("a gap, an open question or a source at risk") is a hint, and reads as open and over-specific at once (C6).
- Samples under each question are quoted from the finished example the tool picks for the person's profile, so help and example box always agree (Q1). Hand-written samples are removed.
- A short list of three inside a question that names the kinds of answer keeps the question specific and may stay ("which field, sector or population could it affect") (C11). Long catalogues of output types go to a hint (C9).
- Example boxes share one shape: a short title, a "Written for…" line naming the example's own profile, and a footnote "This example is fictional." plus one accurate point (C3, C4, M2).

## 5. Accuracy

- Read the code before describing what a message or check does; say so when an earlier description was wrong (C20d: the passive check does not look at Your role; M2: Mentorship prints as several paragraphs, so "one passage" was wrong).
- Funder facts stay as Eli set them; change only the wording around them, and send questions to Eli (C20j, C20k, C20l, M1).
- A recommendation is worded as one ("We recommend three or four"), so it never reads as a funder minimum (C1, guide F-6: no minimum).

## 6. When wording shows a behaviour problem, fix the behaviour

- Typing a competition name turns Undecided off; nobody has to switch one thing off to use another (P5).
- Buttons that only undo a radio choice go ("Clear your choice", "Clear the year") (C17).
- One confirm with the backup status and a "Save a backup file" button, not two confirms (S8, S18).
- An "Add back" button where the set-aside contribution is, instead of a note saying where to go (row 8).
- Offers nobody can see on the live tool are removed (the V7 offer) (S17).

## 7. Timing and sequence

- Messages that follow each other read as one sequence (warning, then save, then follow-up) and point to the fix where one exists ("To keep saving in this browser, please open it.") (S13).
- A follow-up appears when it becomes true (after the next change), not straight after the action it follows (S13).

## 8. Accessibility in wording

- No hover-only text; definitions are visible grey sub-lines under each answer (WCAG 1.4.13) (D1, C18).
- A message that changes what everyone sees is shown on screen as well as announced (P8, P9).
- No brackets or symbols in spoken-only text; screen readers skip or misread them (C14).

## 9. Test every check before deciding it

- Every suggestion, gate or review check is tested with a subtask (realistic invented sentences across fields, false flags, misses, clashes with the tool's own text) before its wording or rule is decided. Reports: `lint-lists-audit-2026-11-24.md`, `checks-audit-2026-11-24.md` (C20e, L1, L2).
- Detection and wording are decided together: "worked on" flagged "I worked on developing the dataset" and "412 patients participated in the trial" (C20e).
- Suggestions stay on fixed, explainable lists; no model in the suggestions, because the Start page promises the tool uses no AI (L1).
