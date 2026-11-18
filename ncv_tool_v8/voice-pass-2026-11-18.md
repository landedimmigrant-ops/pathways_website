# Narrative CV tool: voice pass 2 (every step except Review)

**Status:** proposal only. Nothing in the tool or the test file was changed.
**Date:** 2026-11-18. **File read:** `narrative-cv-prototype-v8.html`, V8.19 as committed (8,074 lines, unchanged while this was written).
**Tests:** `ncv_tool_v8/test-v8.js` was searched for each string. No test, server or browser was run.

## Summary

| Step | Strings read (rough) | Rows proposed |
|---|---|---|
| Shared across steps (privacy line, save and load messages, rail, bottom row, undo, confirmations, suggestions under answers, feedback box, tester cards) | 150 | 7 |
| Start page | 20 | 2 |
| Set up your profile, Profile bar, Change panel | 60 | 11 |
| Contributions, evidence view | 110 | 9 |
| Mentorship | 55 | 4 |
| Personal statement | 35 | 4 |
| Export, Before you export, notes in the files | 70 | 7 |
| **Total** | **about 500** | **44** |

**Rows by rule** (a row can fall under more than one):

| Rule | Rows |
|---|---|
| 1. Less is more (explains the tool, a control or a display, or repeats its label) | 26 |
| 2. Names of tool parts or machinery | 6 |
| 3. Academic register (personified step or part, contrast frame, claim about reviewers) | 11 |
| 4. Question and text under it about different things | 1 |
| 5. House shape and mechanics | 18, of which 8 are rule 5 alone (rows 2, 8, 19, 29, 41, 42, 43, 44) |
| 7. FUNDER-FACT marked in a row (fact and modal untouched) | 2 (rows 15, 29) |

Eight rows are a full DELETE (rows 1, 4, 9, 17, 18, 21, 33, 36). Eight rows touch a string the tests read (rows 3, 5, 7, 21, 25, 31, 32, 33); rows 3 and 5 keep the tested phrase, the other six need the test line updated with them.

**How rule 5 was applied.** A sentence was put into the house shape when it was already being changed for rules 1 to 4, or when it is guidance in running prose (the eight rows marked "5" alone, which can be accepted or refused as a group; row 29 is a numeral, and it also carries a FUNDER-FACT mark). Alerts, validation lines, the suggestions under an answer, ethics lines and funder rules were left in the imperative; they are listed under "Left alone, worth a look".

**How to read the "exact current string" column.** The text between the backticks is the literal. A space at the start or end inside the backticks belongs to the literal. Each one occurs once in the file unless the reason says otherwise.

---

## Shared across steps

| # | function | exact current string | new string, or DELETE | rule(s) | in tests? | reason (under 15 words) |
|---|---|---|---|---|---|---|
| 1 | static HTML, `.v4-privacy-full` (line 1103) | `A connection is needed to open the tool; after that it runs offline. ` | DELETE | 1 | no | Explains how the tool runs; no action follows from it. |
| 2 | static HTML, `.v4-privacy-full` (line 1103) | `If you close the tab, save a draft file first.` | `Before you close the tab, you should save a draft file.` | 5 | no | House shape: condition, you, modal, verb, object. |
| 3 | `REVIEW_MIN_NOTE` (rail caption; note beside a locked Next button) | `Review and Export become available when one contribution has a headline, your role and two more answered parts.` | `To open Review and Export, you need one contribution with a headline, your role and two more answered parts.` | 1, 5 | yes, 182 and 1971 (both patterns still match) | Said as what the researcher does, in place of what the tool does. |
| 4 | `renderChecks` | `The words these suggestions refer to are highlighted below:` | DELETE | 1 | no | Explains a display. Whole `rbh` span goes. Second copy, line 4248, is unreachable. |
| 5 | `cardField` → `runChecks` (`.v7-first-note`) | `These suggestions are about content, such as numbers and your role. They do not cover grammar or spelling, and in French text only some of them apply. You can continue without acting on them.` | `You can continue without acting on these suggestions. They do not cover grammar or spelling, and in French text only some of them apply.` | 1 | yes, 1413 (its phrase is kept) | First sentence described the tool; the instruction now leads. |
| 6 | `takeUpOtherTab` (spoken message) | `Your profile was changed in another tab, so the Change panel closed.` | `Your profile was changed in another tab, so your profile answers were closed.` | 2 | no | "Panel" is a tool part; the group is labelled "Your profile answers". |
| 7 | `lintField` (suggestion under What you did) | `This part asks how large the work was: how many people, sites or sources, and over what period. Add the numbers if you have them.` | `If you have the numbers, you can say how large the work was: how many people, sites or sources, and over what period.` | 3, 5 | yes, 2107 (exact); 1413 and 2107 also test that "Add the numbers" is absent | "This part asks" personifies a part. |

## Start page

| # | function | exact current string | new string, or DELETE | rule(s) | in tests? | reason (under 15 words) |
|---|---|---|---|---|---|---|
| 8 | static HTML, `#v7-start-intro` (line 1100) | `A full first draft can take a day or more, so start well before your deadline.` | `A full first draft can take a day or more, so you should start well before your deadline.` | 5 | no | Imperative in running prose. |
| 9 | `renderStart`; also `changePanel` | `Clears the draft saved in this browser and starts again.` | DELETE | 1 | no | Explains the button; the confirmation that follows says it. Two occurrences (4106, 4658); span goes in both. |

## Set up your profile, Profile bar and Change panel

| # | function | exact current string | new string, or DELETE | rule(s) | in tests? | reason (under 15 words) |
|---|---|---|---|---|---|---|
| 10 | `renderSetup` (lede) | `Your answers decide which prompts, examples and format notes the tool shows you. The examples are fictional.` | `The prompts, examples and format notes you see follow your answers. The examples are fictional.` | 2, 3 | no | Removes "the tool shows you" and answers that "decide". |
| 11 | `renderSetup` (note, and note beside Confirm profile) | `You can change these answers later with the Change button at the top of each step.` | `You can change these answers later, at the top of each step.` | 2 | no (177 only names the button in a check title) | Names a control. Two occurrences (5012, 5164); same change in both. |
| 12 | `renderSetup`, question 1 (line under the choices, "Not sure yet") | `Format: the Tri-agency CV layout for now. The format notes show every agency’s font rule until you choose.` | `Format: the Tri-agency CV layout for now.` | 1 | no | Second sentence explains what the tool shows. |
| 13 | `renderSetup`, question 2 (help, first piece) | `A narrative CV is written for a specific competition. If you name the competition here, the ` | `A narrative CV is written for a specific competition. ` | 1 | no | Explains what the tool does with the name. The `secName(...)` piece that follows goes too. |
| 14 | `renderSetup`, question 2 (help, last piece) | ` prompt will ask about that competition by name. If you have not chosen one, select Undecided.` | `If you have not chosen one, you can select Undecided.` | 1, 5 | no | Rest of row 13; the instruction stays, in the house shape. |
| 15 | `renderSetup`, question 3 (help) | `This changes a few of the prompts. For example, early-career researchers see prompts about what they have achieved so far. If your funding opportunity defines early career, use its definition.` | `If your funding opportunity defines early career, use its definition.` | 1, FUNDER-FACT | no | Two sentences explain the tool. The last sentence is kept word for word. |
| 16 | `renderSetup`, question 4 (help) | `Your answer chooses the worked examples, the discipline notes and the wording of some questions, so they come from work like yours. If you change it later, your draft stays the same.` | `If you change your field later, your draft stays the same.` | 1, 3 | no | First sentence repeats the lede with an answer that "chooses". |
| 17 | `renderSetup`, question 5 (help) | `With a second field, the Contributions step adds a worked example that combines both fields, and some questions add a line for it.` | DELETE | 1, 3 | no (1127 is another string) | Explains the tool; a step that "adds". Whole help box goes. |
| 18 | `renderSetup`, question 6 (help) | `Many researchers work in more than one way. Your answer chooses the role and outcome prompts and the worked example you see.` | DELETE | 1, 3 | no | The question already says "Choose any that apply." Whole help box goes. |
| 19 | `renderSetup`, question 4 (line under the choices) | `If your field is not listed, choose the closest one and let us know at ` | `If your field is not listed, you can choose the closest one and let us know at ` | 5 | no | House shape. |
| 20 | `changePanel` (spoken message after Confirm) | `. The prompts and examples follow the new answers.` | `.` | 1 | no (1067 tests the first half only) | Explains the tool; the message already names what changed. |

## Contributions and the evidence view

| # | function | exact current string | new string, or DELETE | rule(s) | in tests? | reason (under 15 words) |
|---|---|---|---|---|---|---|
| 21 | `renderContributions` (`.v7-startline`) | `You start with your contributions.` | DELETE | 1 | yes, 147 and 170 (exact) | Gives nothing to do; the researcher is already on the step. Whole element goes. |
| 22 | `renderContributions` (lede, inside the third literal piece) | `Three or four well-explained contributions count for more than a long list.` | `You should explain three or four contributions in full before you add more.` | 3, 5 | no | "Counts for more than" is a contrast frame. Alternative: DELETE. Rest of the lede untouched. |
| 23 | `renderContributions` (foot of "See a finished example") | `In the finished CV these sentences run together as one paragraph, and each one still does one of the six parts.` | `In the finished CV these sentences run together as one paragraph.` | 1 | no | The cut clause explains the colours; the legend shows them. |
| 24 | `renderContributions` (foot of "How each part sounds in your field") | `These are examples. A part that does not apply to your work can stay empty. The Review step lists the empty parts so you can check each one.` | `These are examples. A part that does not apply to your work can stay empty.` | 1, 3 | no | Last sentence explains the tool, with a step that "lists". |
| 25 | `contribCard` (`.v7-lv-note`, under "How were you involved?") | `Review uses your choice to show your role across all your contributions. Only the line you write in the box appears in your draft.` | `Only the line you write in the box appears in your draft.` | 1, 3 | yes, 2115 (exact, whole string) | "Review uses" personifies a step and explains the tool. |
| 26 | `contribStrip` (`.v7-join-note`) | `The shaded words with arrows between the parts suggest how to link them. They are not part of your draft, and screen readers skip them.` | `The shaded words with arrows are not part of your draft.` | 1, 2 | no | Explains a display and names machinery; the one needed fact stays. |
| 27 | `evidenceArea` (help, first piece) | `Evidence supports what you have just described. Add the items a reviewer could check: ` | `Add the items a reviewer could check: ` | 1 | no | First sentence restates the question "What backs up this contribution?". |
| 28 | `evidenceArea` (help, last piece) | `. Add as many as you need. Each item gets a letter, and the letters appear after the contribution in your draft. Name a community, an organization or a person only with their agreement.` | `. Add as many as you need. Name a community, an organization or a person only with their agreement.` | 1 | no | The cut sentence explains how the tool letters the items. |
| 29 | `renderContributions` (spoken message at the tenth contribution) | ` This is the limit of ten.` | ` This is the limit of 10.` | 5, FUNDER-FACT | no | Numbers from 10 up are numerals. The limit itself is unchanged. |

## Mentorship

| # | function | exact current string | new string, or DELETE | rule(s) | in tests? | reason (under 15 words) |
|---|---|---|---|---|---|---|
| 30 | `renderMentorship` (lede, first piece) | `Who you trained, and how you mentor. The most persuasive thing in this section is one person you ` | `Who you trained, and how you mentor. You should describe at least one person you ` | 3, 5 | no | Sweeping claim. Reads on as "trained and where they are now." |
| 31 | `renderMentorship` (`.v7-people-help`, first line) | `Reviewers read where your trainees went next as evidence of how you mentor. Choose the people whose paths show this best and, where you can, some whose work relates to this application.` | `You should choose the people whose paths after training show how you mentor and, where you can, some whose work relates to this application.` | 3, 5 | yes, 216 and 2140 (`where your trainees went next` would no longer match) | Claim about how reviewers read. |
| 32 | `personCard` (`.v7-lvl-help`, under Level) | `If you co-supervise this person, say so. Someone still training with you can be described by their project.` | `If you co-supervise this person, you can say so here. If the person is still training with you, you can describe their project.` and move it under "What this person did or went on to do" | 4, 5 | yes, 2129 and 2140 (expects `co-supervise` in `.v7-lvl-help`) | Sits under Level and is about something else; no box there takes the answer. |
| 33 | `personCard` (`.v7-pz-help`, under Prizes or scholarships) | `Prints after the word “received”.` | DELETE | 1 | yes, 1343 and 1352 (expects the element) | Explains how the sentence is built; "Prints as:" below shows it. Whole element goes. |

## Personal statement

| # | function | exact current string | new string, or DELETE | rule(s) | in tests? | reason (under 15 words) |
|---|---|---|---|---|---|---|
| 34 | `renderPersonal` (example foot, CV-FRQ only) | `This example is a TCV personal statement; the team question is in the card below. ` | `This example is a TCV personal statement; the team question is below. ` | 2 | no (227 is a check title) | "Card" is a tool part. |
| 35 | `renderPersonal` (`.v7-card-sub`) | `If a prompt feels hard, the answer is usually already in one of your contributions.` | `If a prompt is hard to answer, you can look for the answer in your contributions.` | 3, 5 | no | "Usually already" is a sweeping claim; now an instruction. |
| 36 | `renderPersonal` (help under "Finish this line.") | `Your first sentence, plain and direct.` | DELETE | 1 | no | Repeats the label; the line is three blanks to fill. Leave `""`; the help box goes. |
| 37 | `crossBox` (`.v7-cross-m`) | `Worked out by counting repeated words on this device. It is a suggestion only.` | `It is a suggestion only.` | 1 | no | First sentence explains how the tool works. |

## Export

| # | function | exact current string | new string, or DELETE | rule(s) | in tests? | reason (under 15 words) |
|---|---|---|---|---|---|---|
| 38 | `renderExport` (beside "Your narrative CV") | `Edit any part in place. Changes save as you type.` | `Edit any part in place.` | 1 | no | Second sentence explains how the tool works. |
| 39 | `renderExport` (paste card, first piece) | `Each button copies one section as plain text, in the order the template sets, without the tool’s notes. Paste it into the matching section of ` | `You can paste each section into the matching section of ` | 1, 2, 5 | no | Explains the buttons, which are labelled "Copy …". Reads on as "… SSHRC's template." |
| 40 | `renderExport` (Keep your work) | `This saves your whole draft as a small file on your computer. Keep it somewhere safe. Later, choose Load your draft on the start page and open the file to continue. It is not a Word file. Clearing your browser data erases the draft stored in the tool, so a saved file is your backup.` | `To continue later, you can save your whole draft as a draft file and open it with Load your draft on the start page. If you clear your browser data, the draft stored in the tool is erased, so the file is your backup.` | 1, 5 | no (422 tests the heading) | Five sentences to two; "This saves" described the button. |
| 41 | `renderExport` (`.v7-shared-note`) | `On a shared computer, save a draft file, then choose Reset draft on the start page, so the next person who opens the tool here starts with no draft.` | `On a shared computer, you should save a draft file and then choose Reset draft on the start page, so the next person who opens the tool here starts with no draft.` | 5 | no (1022 tests that the element exists) | House shape. |
| 42 | `renderExport` (note on a draft written in French) | `Translate them before you paste.` | `You need to translate them before you paste.` | 5 | no | House shape. |
| 43 | `renderExport` (unfinished contributions note) | `1 contribution is` | `One contribution is` | 5 | no (996 tests "still missing parts") | A number at the start of a sentence is spelled out. Two to nine stay numerals unless the code changes. |
| 44 | `renderExport` (links note) | `1 link is` | `One link is` | 5 | no | As row 43. |

---

## Left alone, worth a look

Strings that pass or that a rule stopped me from changing, where the decision is Prem's.

1. **Set up, question 1 help:** "It also sets the format notes on Export, since font rules differ between agencies." The sentence explains the tool (rule 1 says delete), and it also carries a fact about the agencies (rule 7 says leave it). Left as it is. If rows 15 to 18 are accepted, this is the one profile help box that still explains the tool.
2. **Set up, rows 15 to 18 taken together.** Five of the six help boxes repeat, question by question, what the lede says once. Accepting the rows leaves questions 5 and 6 with no help line. That follows rule 1; it is a visible change to the step.
3. **Contributions lede, first sentence:** "Describe up to 10 contributions that relate to this funding opportunity; they do not have to be your most recent work." It is an imperative in running prose, and it holds a funder limit. A comment in the file says the instruction "stays as Prem likes it". Left alone. Only the "count for more than" sentence is proposed (row 22).
4. **Three or four, or four or five.** The lede says "Three or four well-explained contributions"; the note shown past five contributions says "finish the four or five that relate most to this application". Row 22 keeps "three or four". One number should serve both.
5. **Mentorship, early-career box:** "Reviewers are trained to read this section with career stage in mind." It is a claim about reviewers, and it is the guide's own sentence (`content/learn/narrative-cv-guide.md`, line 120). Treated as guide wording and left alone.
6. **Privacy line:** "The suggestions under your answers come from fixed rules." It explains the tool. It is also what "No AI" rests on. Left alone.
7. **"Thank you. The sign-up did not reach the team yet; the tool sends it again the next time you open it."** and the matching line for the Export answers. The tool is the actor. A comment marks the wording as Prem's (V8.10). Left alone. The tester sign-up card (wording from Prem, 2026-11-03) was also left; its second paragraph opens with "We developed this tool".
8. **Imperatives left as they are.** (a) Alerts and recovery lines: "Use Save a draft file, or copy your draft on the Export page, before you close this tab."; "Save a draft file now to keep it."; "Download the copy to keep it, then email it to …"; "Allow pop-ups for this page, or download the Word file."; "Use the download instead."; "Try again, or email it to …". (b) Validation: "Choose at least one way your work usually happens."; "Enter your email to start."; "Check the totals.". (c) Short condition lines: "Save a draft file first if you want to keep it." (two places); "Undecided is selected. To name a competition, turn it off." (two places); "Update it if it no longer applies." (two variants). (d) Ethics lines, kept at full strength: "Leave out names. …"; "Name a community, an organization or a person only with their agreement.". (e) The suggestions under an answer ("Name the specific action.", "If it was you, say “I …”." and about a dozen more), read as list items. If rule 5 is meant to reach any of these groups, they need a second round.
9. **Funder rules, untouched (FUNDER-FACT):** `renderFormatNote` and the constants it prints; "You have 10, the most the format allows. …"; "These totals have no set period. Check the instructions for your funding opportunity in case it sets one." (tested exactly at 2138); the link notes on evidence and under an answer; the journal-metric and h-index suggestions; the page-limit note on Export; the "Format:" line and the closing line of "Before you export"; `formatReminder`; the note at the top of the Word file and the print view.
10. **The page limit is stated three ways on Export.** "Do not exceed the page limit" (format notes), "Keep within the page limit" (closing line of Before you export) and "keep within the page limit" (the Format check), with "You must use the agency’s template." beside them. The closing line repeats the format note two cards below it. Rule 7 kept me from merging or cutting; Eli may want one wording.
11. **Strands and the who and what boxes.** No line where these are entered says they stay out of the CV (the open item at the end of `VOCABULARY.md`). The strand help, "On Review, you can compare the order of your contributions with these strands.", passes as written. Adding the missing line is new copy, so it is not proposed here.
12. **"What changed? (optional)" under the part "What already changed".** Close to a rule 4 fault: the box asks for the kind of change, the part asks for the change. The fix is a rename, which is the vocabulary decision.
13. **Empty states:** "Your answers appear here as one paragraph, in the order a reviewer reads them." and "Your answers appear here as one paragraph, starting with your first sentence." They describe the display, and they are the only text in an empty box. Left alone.
14. **Norms with no source given:** "The usual range here is 40 to 80, so this is short." (tested at 1160); "A headline reads best at about 15 words or fewer."; "up to about 40 is comfortable here"; "about 60 words or fewer keeps it a reference". They pass the register rules. Whose range it is goes unsaid.
15. **Row 40 drops "It is not a Word file."** `VOCABULARY.md` notes the sentence exists because "draft file" does not say what the file is. If the term stays, Prem may want the sentence back.
16. **Row 4.** With the caption gone, the answer is repeated under the suggestions with words highlighted and nothing to say why. By design rule 6 that would be a reason to change the repeat, which is outside a copy pass.
17. **In the text file:** "[Profile, for tailoring and not for submission: …]". An "X and not Y" frame, in a bracketed note the researcher deletes. Left alone.

## Not copy, seen in passing

1. **A note names a heading that no longer exists.** `contribCard`: "Saved for later: this contribution stays in your draft and does not print. Put it back under Order of contributions, on Review." Review's tab is "Reorder contributions". Test line 249 still uses the old name in a check on the rail.
2. **"Five short questions"** (`renderTesterEnd`). `TESTER_END_QS` holds six questions that always show and one that shows on a condition.
3. **Unreachable strings.** (a) "Reset your work in progress and start a new draft?" is passed to `resetWarning`, which ignores its `question` argument. (b) "The next question opens when you answer this one." in `renderSetup`: that branch runs only when a question is unanswered, so `blocker` is always set. (c) `renderExemplarBox`, `promptBlock` and `chipRow` are never called ("Show the skeleton", "Your call. Anything you mark “needs work” …"). (d) "Note for the team": the button is `hidden` in the HTML and nothing shows it; its help line points to a Feedback step that is switched off. (e) The `gaps` sentences built in `buildWeave` are returned and never shown.
4. **Code words in a spoken message.** After Confirm in the Change panel, a screen reader hears "Profile updated: work mode", "second field" or "other field". On screen these are "How your work usually happens" and "Another field". `VOCABULARY.md` lists "work mode" as absent from the screen.
5. **"Review your CV →"** on the Next button into Review (tested at 225, 229, 232). The step is "Review" and its heading is "Review your draft".
6. **Straight apostrophes** in six places where a name takes `'s` ("SSHRC's"): lines 5080, 7349, 7387, 7486, 7489, 7611. The rest of the tool uses curly ones ("the FRQ’s").
7. **"Who you trained"** in the Mentorship lede is fixed text; the rest of the step says "trained or mentored" for community-engaged profiles.
8. **"Copy working draft, with notes"** sits in the card headed "Download or print".
9. **Outside this pass, seen while reading:** the help under "Who else you mentor" in `PROMPTS` has the same contrast frame as row 22 ("carries more than a list of names") and "as the format says".
