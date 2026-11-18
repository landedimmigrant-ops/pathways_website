# Narrative CV tool: vocabulary list (V8.18 and V8.19)

**Status:** recommendations for Prem to approve. No word in the tool has been changed.
**Date:** 2026-11-18. **File read:** `narrative-cv-prototype-v8.html`, V8.18 as committed, then checked against V8.19 in the working tree.

**V8.19 note.** V8.19 was built on the same day, while this list was being written. It changed two things in this list. The line "Your strands, marks and ticks do not print." was removed. The "I have checked this." boxes and the ✓ on Review's tabs were removed, and Review's questions now appear in the "Before you export" list on Export. The rows below say where V8.18 and V8.19 differ. Every other term was the same in both.

## Purpose

Researchers testing the tool could not understand some of its words. The example Prem gave is the line on Review: "Your strands, marks and ticks do not print."

This file lists the terms a researcher sees in the tool. For each term it gives the meaning, the funders' word, the guide's word and one recommended common word.

## How to read the tables

Each row has seven columns: the term as shown, where it appears, what it means in the tool, the funder's term, the guide's term, the recommended common word, and the reason.

The sources are ranked in this order.

1. **Funders' wording**, as quoted in the repo. Tags used below:
   - **G** = the guide as ported to concordia.ca, with the approved corrections (`ncv-guide-review/src/`). Edit numbers such as P-9 are the ids in `corrections.json` and `hooks.py`.
   - **E** = Eli's answers of 2026-11-04 (`ncv_tool_v8/eli-answers-2026-11-04.md`).
   - **T** = the funder-fact constants in the tool (`SECTION_NAMES`, `LINK_RULES`, `FONT_RULES`, `PAGE_LIMIT`). The comments in the tool attribute them to the guide.
   - **L** = `voice/lexicon.md`, section 1 (funder vocabulary).
2. **The guide's own terms** (same guide files, and `content/learn/narrative-cv-guide.md`).
3. **The house voice** (`voice/lexicon.md`, `voice/voice-checklist.md`).

"not found in repo" means the repo holds no quotation of the funder's or the guide's word for that thing. No funder wording was supplied from memory.

"Keep" means the term is already a common word and agrees with the sources.

The terms were collected by searching the string literals of the tool. Nothing was checked in a browser. Line numbers are left out because they move; constant names are given where they help.

---

## 1. Whole tool and left rail

| Term as shown | Where it appears | What it means in the tool | Funder's term | Guide's term | Recommended common word | Why |
|---|---|---|---|---|---|---|
| "Narrative CV", "narrative CV" | Page title; every step | The CV format the draft is written for | "Tri-agency CV (TCV)"; "CV-FRQ" (G) | "Narrative CV" in headings; "narrative CV" in running text (G) | Keep. Lower case in running text. | Agrees with the guide. |
| "Tri-agency CV (TCV)", "TCV", "Tri-agency CV layout" | Profile question 1; Profile bar; Export; format notes | The format used by SSHRC, NSERC and CIHR | "Tri-agency CV (TCV)" (G) | "Tri-agency CV (TCV)", then "TCV" | "Tri-agency CV (TCV)" on first use in a step, then "TCV". Replace "layout" with "format". | "Layout" is a third word for the format (list A). |
| "CV-FRQ" | Same places | The format the FRQ requires | "CV-FRQ" (G P-56) | "CV-FRQ" | Keep. | Funder's own name. |
| "Start page" | Rail; messages | The first screen, before the steps | not found in repo | not found in repo | Keep. | Plain. |
| "Steps", "step", "the Export page", "this page" | Rail; help lines; warnings | One screen of the tool | not found in repo | not found in repo | "step" for a screen of the tool. "page" for the start page and for pages of the CV. | "Page" is also the unit of the page limit. |
| "My narrative CV" | Rail, group label above Contributions, Mentorship and Personal statement | The three sections of the CV | not found in repo | "The three sections" (G) | Keep. | Plain. |
| "Draft" (group label) | Rail, group label above Review and Export | The two steps that follow the writing | not found in repo | not found in repo | "Finish", or no label | "Draft" already means the text in progress (list B). |
| "draft", "outline" | Start page ("a first outline"); "draft" everywhere else | The text in progress | not found in repo | "draft" (G P-13: "A first draft can take a day or more") | "draft" | One word for one thing. |
| "prompts", "questions" | Start page; Profile intro; Mentorship | The questions the researcher answers | not found in repo | not found in repo | "questions" | "Prompt" is software vocabulary. The steps themselves say "question". |
| "suggestions" | Under each answer; privacy line | Notes on the text just written, produced by fixed rules | not found in repo | not found in repo | Keep. | Plain. The word shows that acting on the note is optional. |
| "Fictional example", "See a finished example", "worked examples" | Example boxes on the three writing steps; Profile help | An invented sample text | not found in repo | "These examples are illustrative." (G P-34) | "example". Keep the tag "Fictional example". | Three adjectives for one thing. |
| "1,240 w", "2.5 pp", "over 5 p", "312 w" | Rail, beside the Draft group; closed contribution row | Word and page counts | "page limit" (G P-44, P-52) | "page limit" | "words" and "pages", written in full | Abbreviations need decoding. |
| "this device", "this browser" | Privacy line; start page; warnings | Where the draft is stored | not found in repo | not found in repo | "this browser" | Clearing browser data erases the draft, so "browser" is the accurate word. |

## 2. Set up your profile

| Term as shown | Where it appears | What it means in the tool | Funder's term | Guide's term | Recommended common word | Why |
|---|---|---|---|---|---|---|
| "Set up your profile", "Profile", "Profile:", "Confirm profile", "Profile not set yet" | Rail; first step; bar at the top of each step | Six answers (agency, competition, year, career stage, field, way of working) that set the wording of questions, the examples and the format notes | not found in repo | not found in repo | Keep "profile". | Understood without a definition. One label needs a fix (see "Draft name"). |
| "Change" (button) | Profile bar at the top of each step; evidence item ("Change" the kind) | Opens the profile answers for editing | not found in repo | not found in repo | "Edit profile" | "Change" is also the word for the effect of the research (list B). |
| "Draft name (optional)", "Profile:" with "Name this profile" | Start page; Profile bar | One stored name, shown under two labels | not found in repo | not found in repo | "Draft name" in both places | One thing has two names. |
| "Agency", "Choose the agency you are applying to.", "Not sure yet", "Agency not chosen yet" | Profile question 1; Profile bar; Export | The funder: SSHRC, NSERC, CIHR or FRQ | "agency" (E 4: "the agencies' limit"; G P-49: "the agency's template") | "agency"; "funders" | Keep "agency". One label for the unknown case: "Agency not chosen yet". | "Not sure yet" and "Agency not chosen yet" name the same choice. |
| "Competition", "Name the competition or funding you are applying for.", "Undecided", "Competition undecided" | Profile question 2; Profile bar | The call the CV is written for | "funding opportunity" (E 1; G P-10, P-31 and the guide's closing line). For the CV-FRQ: "program" (G P-48: "the program's objectives") | "funding opportunity"; also "competition" and "program" | "Funding opportunity" as the label. "program" only where an FRQ rule is quoted. | Eli and the corrected guide use "funding opportunity". Other steps of the tool already say "this funding opportunity". |
| "Year you plan to apply (optional)" | Profile question 2 | Year of the application | not found in repo | not found in repo | Keep. | Plain. |
| "Career stage": "Early career", "Mid career", "Senior" | Profile question 3; Profile bar | Sets the wording of some questions and the example shown | "early career" (E 2); "early-career researcher" (L). Mid and senior: not found in repo | "career stage"; "early-career researchers"; "senior colleagues" | Keep. Hyphenate: "Early-career", "Mid-career". | Agrees with the guide and the lexicon. |
| "Field", "Another field", "main field", "discipline notes" | Profile questions 4 and 5; help lines | The research field closest to the work | not found in repo | "field" and "discipline", both | "field" everywhere. Replace "discipline notes" with "notes for your field". | Two words for one thing. |
| "STEM / engineering" | Profile question 4 (`DISCIPLINES`) | A field option | not found in repo | not found in repo | "Science, technology, engineering and math (STEM)" | Engineering is already inside STEM. The slash hides the relation between the two words. |
| "Health / clinical" | Same | A field option | not found in repo | not found in repo | "Health and clinical research" | An adjective pair with no noun. |
| "Social sciences", "Humanities" | Same | Field options | not found in repo | not found in repo | Keep. | Plain. |
| "Creative / fine arts" | Same | A field option | "research-creation" (L: SSHRC's defined term; Concordia pairs "research or research-creation") | "Creative works"; "creative practice" | "Fine arts and research-creation" | Uses the funder's term. |
| "How your work usually happens"; "How do you usually do your research?" | Profile question 6; Profile panel | The way the researcher works. The code calls it "work mode"; that phrase is absent from the screen. | not found in repo | not found in repo | "How you work" as the label. Keep the question. | The label is long and abstract. |
| "Team-based", "Community-engaged", "Largely solo", "Partnered with industry, government or health systems" | Profile question 6 (`WORK_MODES`) | The options for how the researcher works | not found in repo | "community-engaged" research (G); "collaborative work" | "In a team"; keep "Community-engaged"; "Mostly on my own"; "With partners in industry, government or health systems" | "Solo" and "-based" are less plain. A role option already says "I did it on my own". |
| "Format", "format notes", "Font, links, language and section names" | Profile question 1; Export | "Format" is the TCV or the CV-FRQ. "Format notes" are the rules for font, links, language and section names. | "Tri-agency CV (TCV)"; "CV-FRQ" (G) | "format"; "formatting" (G P-49) | "format" for TCV or CV-FRQ only. "Formatting rules" for the notes. | One word covers two things (list B). |
| "template" ("You must use the agency's template.") | Format notes; Export | The agency's own file that the CV is pasted into | "the agency's template" (G P-49, Eli) | "template" | Keep. | Funder-confirmed wording. |

## 3. Contributions

| Term as shown | Where it appears | What it means in the tool | Funder's term | Guide's term | Recommended common word | Why |
|---|---|---|---|---|---|---|
| "Contributions" (rail); "Most significant contributions and experiences" (step heading, section copy) | Rail; step heading; Export | Section 2 of the CV | "Most significant contributions and experiences"; "Contributions et expériences les plus importantes" (G P-9; T) | Same | Keep both: the short form in the rail, the official name in the heading. | Agrees with the funder. |
| "contribution" | Every card | One entry in that section | "contributions and experiences" (G P-9) | "A contribution can be a single output or a collection of related work presented together." (G P-11) | Keep. | Funder's word. |
| "up to 10 contributions"; "You have 10, the most the format allows." | Step intro; limit message | The maximum number of entries | "Ten is the agencies' limit." (E 4) | "Up to 10 contributions or experiences" (G P-10) | "the most the agencies allow" | Eli names the agencies as the source of the limit. "The format" is a third use of that word (list B). |
| "Headline", "No headline yet", "Untitled contribution" | First field of a card (`CF()`); closed row; Review; Export | The one-line name of a contribution | not found in repo | not found in repo | "Title of the contribution", with "No title yet" | Two words for one field. The help line already tells the paper's title apart ("The paper's title goes in the evidence list."). |
| "part", "the six parts" | Help lines; Review; Still missing | One of the answers that make up a contribution | The TCV instructions ask for "the impact, significance, usefulness, and your role" in each contribution (G P-36). No word for the division was found in the repo. | not found in repo | Keep "part", for this meaning only. | The word has four meanings on screen now (list B). |
| "The problem or question" | Part 1 (`SEG_META`) | Why the work was needed | not found in repo as a label. "significance" is in the TCV list (G P-36). | "Significance: why this mattered to the field or world"; "What existed before your work that was incomplete, incorrect, or absent?" | Keep. | Plain. Set by Prem (Q-18). |
| "Your role" | Part 2 | What the researcher did personally | "your role" (G P-36; G P-28: "explain your role in each contribution") | "your role"; "Ownership" | Keep. | Funder's own word. |
| "How were you involved?" with "I led it", "I co-led it", "I contributed a specific part", "The partners led it, and I took part", "I made it with others", "I did it on my own" | Under Your role (`ROLE_LEVELS`); Review, third tab | A choice that Review counts across contributions. It stays out of the CV. | not found in repo | "I led", "I led a team that…" | Keep. | Plain. |
| "Role level cleared." | Spoken message when the choice is cleared | Confirms the choice was removed | not found in repo | not found in repo | "Role choice cleared." | "Level" is the word for a trainee's level (list B). |
| "role sentence", "the line you write in the box", "your own part" | Under Your role; Review, third tab | The one line about the researcher's role that appears in the CV | "your role" (G P-36) | "your specific role" | "role sentence" for the text. "your role" in questions. | Three names for one thing. "Part" belongs to the six parts. |
| "What you did" | Part 3 | Methods, sites, partners and scale | not found in repo | "what you did" (G P-55) | Keep. | Guide's wording. |
| "What resulted" | Part 4 | Outputs: papers, datasets, tools, works | not found in repo | "outputs" | "What you produced" | Review's evidence table and the help line already say "produced". "Resulted" reads as results, which belong to the next part. |
| "What already changed" | Part 5 | Who has used the work and what is different for them | not found in repo as a label. "impact" and "usefulness" are in the TCV list (G P-36). | "what changed because of it" (G P-55); "outcomes"; "uptake" | Keep. | Plain. Close to the guide's phrase. |
| "What could change" | Part 6 | The effect expected if the work is used more widely | not found in repo as a label. "impact" is in the TCV list (G P-36). | not found in repo as a separate term. "what you are building toward" (G) | Keep. | Plain. |
| "One moment (optional)", "One moment"; question: "Which one occasion…"; help: "One real case…" | Optional last part (`CF()`); Review, second tab | One real example of the work in use | not found in repo | "A well-placed sentence describing real-world uptake" (G) | "One example of use (optional)", with "example" in the question and the help line | Three words (moment, occasion, case) name one thing. |
| "Evidence", "evidence list", "evidence item", "The item", "3 evidence" | Card; closed row; Review; rail | The checkable items that back up a contribution | For the TCV: not found in repo. For the CV-FRQ, links are "bibliographic references" (G P-17). | "evidence" ("what evidence exists"; "Qualitative evidence is explicitly invited by the TCV format") | Keep "evidence" and "evidence item". Write counts as "3 evidence items". | Guide's word. "3 evidence" is ungrammatical. |
| "Kind", "Kind of evidence", "Kind not chosen", "pick its type" | Evidence item; evidence help | The category of an evidence item | not found in repo | "forms" of evidence | "kind" everywhere. Replace "pick its type" with "choose its kind". | "Kind" and "type" name one thing. |
| "Peer-reviewed" | Evidence kinds (`EVIDENCE_TYPES`) | A published and reviewed work | not found in repo | "Journal articles, books, book chapters, reports" | "Peer-reviewed publication" | An adjective with no noun. |
| "Media / public" | Same | Coverage, a review, a public talk, a podcast | not found in repo | "Media coverage"; "public engagement" | "Media coverage or public talk" | The slash pairs two adjectives with no noun. |
| "Policy / practice uptake" | Same | A policy, guideline or program that adopted the work | not found in repo | "Adoption"; "Policy uptake" | "Adopted in policy or practice" | "Uptake" is specialist vocabulary. |
| "Dataset / tool" | Same | Data, software, a catalogue or a collection | not found in repo | "Datasets, software, open-access resources" | "Dataset, software or tool" | Removes the slash and names software. |
| "Award / recognition" | Same | A prize, fellowship or honour | not found in repo | not found in repo | "Award or recognition" | Removes the slash. |
| "Funding" | Same | A grant the work attracted | not found in repo | "Grants you led that enabled others' research" | "Grant or funding" | "Grant" is the more familiar word. |
| "Replication / citation" | Same | A study that repeated, cited or built on the work | not found in repo | "Independent replication"; "Citation counts are one form of evidence" | "Replication or citation" | Removes the slash. |
| "Audio or visual work" | Same | A recording, video or image of the work. SSHRC allows a link to it. | "audio or visual" work or output (E 3; G P-31) | Same | Keep. | Funder-confirmed. |
| "Exhibition, performance or screening", "Community document", "Preprint", "Conference talk or poster", "Teaching or curriculum", "Other" | Same | Six further kinds | not found in repo | "Creative works, performances, exhibitions, films"; "Community acknowledgement"; "Teaching integration" | Keep. | Plain. |
| "Why it matters" | Note under an evidence item | Two lines on what the item found or why it was useful | not found in repo | not found in repo | Keep. | Plain. |
| "What you wrote", "Your paragraph so far" | Strip at the foot of a card | The answers joined into one paragraph | not found in repo | not found in repo | "Your paragraph so far" in both states | One strip has two names. |
| "A suggested join" | Hover text on the shaded linking words ("in response →") | Words shown between parts to suggest a link. They stay out of the CV. | not found in repo | not found in repo | "Suggested linking words" | "Join" as a noun is the tool's own. |
| "Who changed? (optional)", "Who could change? (optional)" with "People", "An organization or community", "A government or institution", "A field" | Checkboxes under What already changed and What could change (`CHANGE_WHO`) | Optional choices that Review reads back. They stay out of the CV. The code and the README call them "change marks". | not found in repo | "who was affected" (G) | "Who was affected? (optional)", "Who could be affected? (optional)" | Guide's phrase. The steps where these boxes are ticked give no line saying they stay out of the CV. |
| "What changed? (optional)", "What could change for them? (optional)" with "Awareness", "Practice", "Policy", "Culture or values" | Same place (`CHANGE_WHAT`) | Optional choices for the kind of change | not found in repo | not found in repo as a list. "Policy uptake"; "Adoption" | "What kind of change? (optional)", "What kind of change could follow? (optional)" | "What changed?" sits directly under the part named "What already changed" and means something else (list B). |
| "Remove contribution", "Delete" | × on a card; Review, first tab | Takes a contribution out of the draft | not found in repo | not found in repo | "Remove" in both places | Two verbs for one action. |
| "Put it back under Order of contributions, on Review." | Note on a contribution that is saved for later | Points to the place where the contribution can be put back | not found in repo | not found in repo | Name the tab as it is now shown ("Reorder contributions") | Review has no heading called "Order of contributions" in V8.18. |

## 4. Mentorship

| Term as shown | Where it appears | What it means in the tool | Funder's term | Guide's term | Recommended common word | Why |
|---|---|---|---|---|---|---|
| "Mentorship" (rail); "Supervisory and mentorship activities" (TCV heading); "Supervisory and mentoring activities" (CV-FRQ heading) | Rail; step heading; Export | Section 3 of the CV | "Supervisory and mentorship activities"; "Activités de supervision et de mentorat" (G P-9; T). The English CV-FRQ name is in T only. | "Supervisory and mentorship activities"; "mentorship" | Keep. | Agrees with the funder. |
| "People you have trained"; "trained or mentored" for community-engaged work | Totals heading; step intro; Review | The people counted in the section | "highly qualified personnel (HQP)" is listed as correct in a Tri-agency CV context (L). The TCV's instruction wording is not found in repo. | "the people you train" (G P-24); "trainees" | "People you have trained or mentored", for every profile | The funder's section covers supervision and mentorship. The guide says the section is broader than formal supervision. One phrase then serves every profile. |
| "Totals", "in total", "Totals:" | Number boxes; rail; the CV text | The number of people at each level | not found in repo | not found in repo | Keep. | Plain. The heading was settled with Eli's answer (E 1). |
| "These totals have no set period." | Under the number boxes | States that the count has no time limit | "no time limit unless the funding opportunity specifically sets one" (E 1) | not found in repo | Keep. | Funder-confirmed. |
| "Postdoctoral", "Doctoral", "Master's", "Undergraduate research", "Other" | Number boxes (`MENTOR_COUNT_LABELS`); Level list (`MENTEE_STAGES`) | The level at which a person trained | not found in repo | "Graduate supervision (master's and doctoral)"; "Postdoctoral supervision"; "Undergraduate research mentoring" (G P-25) | Keep the first three and "Other". "Undergraduate" for the fourth. | Review already shows "Undergraduate". |
| "Level", "Describe their level", "Level not given" | Each person's card; Review | The field that holds that level | not found in repo | not found in repo | "Level of training" | "Level" alone also names the role choice (list B). |
| "Who are the Other trainees?", "other trainees" | Under the number boxes; the CV text | The people counted under Other | See "People you have trained" | "trainees" | "Who are the people counted under Other?" | The step says "people" everywhere else. |
| "Highlight a few people you trained", "described", "3 of 12 described", "entry" | Section heading; counter; Review | People for whom the researcher writes a short description | not found in repo | "Career outcomes of trainees" | "Describe a few people you trained or mentored". Keep "described". | The counter and Review say "described"; the heading says "highlight". |
| "Person A" | Each person's card | One described person, unnamed | not found in repo | not found in repo | Keep. | Plain. |
| "Where are they now?", "Now:", "Where they went", "Trained as" | Each person's card; Review | Where the person works today | not found in repo | "Career outcomes of trainees" | Keep. | Plain. |
| "University", "Industry", "Community agency", "Government", "Health system or clinic…", "First Nations, Inuit or Métis government or organization", "Arts, cultural or heritage organization…", "Independent or self-employed artist", "College, CEGEP or school", "School or school board", "Long-term care or seniors' organization", "Other" | "Where are they now?" list (`MENTEE_KINDS`) | Kinds of destination | not found in repo | "community organizations" (G P-34) | Keep all, with one change: "Community organization" | "Agency" is the tool's word for the funder (list B). |
| "Prizes or scholarships", "Prize noted" | Each person's card; closed row | Recognition the person received | not found in repo | not found in repo | Keep. | Plain. |
| "Prints as:", "Prints after the word 'received'." | Each person's card | Shows the sentence the tool builds for the CV | not found in repo | not found in repo | "Appears in your CV as:", "Appears after the word 'received'." | "Print" has two meanings (list B). |
| "Mentorship style" | Card heading under the people | Three questions about how the researcher mentors | not found in repo | not found in repo | "How you mentor" | The first question already uses these words. |
| "One thing you do" | First field of that card | One concrete mentoring practice | not found in repo | not found in repo | "One thing you do as a mentor" | The label is unclear when read alone. |
| "Who joins" | Second field | Who enters the group and what was changed to open the way in | not found in repo. The help line says reviewers are asked to look at equity in the research process; no source is quoted in the repo. | "Equity, diversity, and inclusion practices in your lab or team" | "Who joins your group, and how" | Two words alone do not say what is asked. An earlier decision (B-30) removed the abstract label "Equity in practice". |
| "Who else you mentor (optional)" | Third field | Mentoring outside formal supervision | not found in repo | "Informal mentoring of early-career researchers or colleagues" | Keep. | Plain. |

## 5. Personal statement

| Term as shown | Where it appears | What it means in the tool | Funder's term | Guide's term | Recommended common word | Why |
|---|---|---|---|---|---|---|
| "Personal statement", "Your statement", "Statement" | Rail; step; Review; length chart | Section 1 of the TCV | "Personal statement" (G P-9; T) | "Personal statement" | Keep "Personal statement" and "your statement". | Funder's name. |
| "Background and skills", "The candidate's background and skills", "Your background and skills section", "Background" | Same places when the agency is FRQ | Section 1 of the CV-FRQ | "The candidate's background and skills"; "Parcours et compétences de la personne candidate" (G P-41, P-9; T) | Same | Keep. | Funder's name. |
| "Your first sentence", "Anchor" | First field; legend of the example | The opening sentence: role, institution, field | not found in repo | not found in repo | "First sentence" in both places | The legend of the example uses a different word from the field. |
| "The problem or question" | Second field | The question the whole research program returns to | not found in repo | "What is this researcher building, and why does it matter?" (G) | Keep. | Same wording as part 1 of a contribution, at a larger scale. |
| "Strands", "Strand 1", "+ Add a strand", "No strand", "Name each strand in a few words (optional)" | Third field (`PS_KICKER.streams`); Review, first tab | Two to four lines of work that the statement names. Review compares them with the order of contributions. They stay out of the CV. | not found in repo | "several areas" ("researchers whose work genuinely spans several areas", G) | "Areas of your work": "Area 1", "+ Add an area", "No area" | "Strand" is a metaphor and the tool's own word. The guide says "areas". |
| "How you got here" | Fourth field | The path to the present work | not found in repo. The CV-FRQ section title includes "background" ("Parcours"). | not found in repo | Keep. | Plain. |
| "Recognition" | Fifth field | Signs that others recognize the work | not found in repo | not found in repo | Keep. | Plain. |
| "Why this competition" | Sixth field | Fit with the call | "your expertise relative to this specific opportunity or project" (G; T) | Same | "Why this funding opportunity" | Follows the change to "Funding opportunity" in the profile. |
| "How you complement the team" | Field shown for the CV-FRQ | The researcher's place in the team | "how your work complements the team" (G P-48) | Same | Keep. | Funder's wording. |
| "What's next" | Last field; Review ("what you plan to do next") | Plans for the work | not found in repo | "where you are headed" (G) | Keep. | Plain. |
| "A read across your contributions" | Box under the statement fields | Words that appear in more than one contribution | not found in repo | not found in repo | "Words your contributions share" | "A read" as a noun is the tool's own. |
| "Your statement so far" | Strip at the foot of the step | The answers joined into one paragraph | not found in repo | not found in repo | Keep. | Plain. |

## 6. Review

| Term as shown | Where it appears | What it means in the tool | Funder's term | Guide's term | Recommended common word | Why |
|---|---|---|---|---|---|---|
| "Review", "Review your draft" | Rail; step heading | The step where the draft is checked | not found in repo | "What reviewers look for" | Keep. | Plain. |
| "At a glance" | First block on Review | What is not written yet, and the length | not found in repo | not found in repo | "Summary" | An idiom. Many readers work in a second language. |
| "Still missing", "✓ Nothing missing.", "still missing parts" | Summary block; Export; text export | Required parts with no text yet | not found in repo | not found in repo | "Not written yet", "Every part is written." | The Contributions step says a part can stay empty. "Missing" says the opposite. |
| "Narrative composition breakdown" | Summary block | How the words divide between the statement, each contribution and Mentorship, against the page limit | "page limit" (G P-44, P-52) | "page limit" | "Length of each section" | Three abstract nouns. The current name dates from V8.12. |
| "C1", "about 12% of the 5-page budget" | Length chart; Review, first tab; Saved for later | A short label for Contribution 1; a contribution's share of the page limit | "page limit" (G P-52) | "page limit" | "Contribution 1"; "of the 5-page limit" | "Budget" is a second word for the limit. |
| "Five questions about your draft" | Heading of the board | Five tabs, each with one question | not found in repo | "Four qualities help reviewers find them in your CV" (G P-36) | Keep. | Plain. |
| "Reorder contributions"; "Based on your statement, does the order of your contributions still make sense?" | Tab 1 (`RV_TABS`, `RV_DEF`) | Order of contributions, compared with the statement | not found in repo | "Coherence: a research story, not a list" | Keep. | Plain. |
| "Edit what changed"; "Does each contribution say what already changed?" | Tab 2 | Text of each part, with What already changed in focus | not found in repo | "Significance" | "Edit what already changed" | The tab then repeats the name of the part. |
| "Change your role"; "Is your own part clear in each contribution?" | Tab 3 | The role choice and the role sentence | "your role" (G P-36) | "Ownership: 'I' not 'we'" | "Edit your role"; "Is your role clear in each contribution?" | Funder's word. "Change" and "part" each have other meanings (list B). |
| "Add evidence"; "Does each contribution show where others used the work?"; "What you produced", "Where others used it" | Tab 4 | Evidence items in two columns | not found in repo | "evidence"; "real-world uptake" | Keep. | Plain. |
| "Check marked changes"; "Do your words and evidence show the changes you marked?"; "No changes are marked yet."; "None marked"; "Already happened", "Expected" | Tab 5 | Reads back the who and what choices from Contributions beside the text | not found in repo | not found in repo | "Check the changes you chose"; "…the changes you chose?"; "None chosen" | "Marked changes" reads as tracked edits in a document. "Mark" has other meanings (list B). |
| "Mark the strands each contribution belongs to."; "marked for"; "no strand marked yet"; "None of these" | Tab 1 | Assigns a contribution to one or more named areas | not found in repo | not found in repo | "Choose the areas each contribution belongs to."; "chosen for"; "no area chosen yet" | One verb for choosing (list A). |
| "I have checked this."; "✓" on a tab | V8.18 only: foot of each tab. Removed in V8.19. | A box the researcher ticked after answering the tab's question. The V8.18 footnote called these "ticks". | not found in repo | not found in repo | Keep the noun "ticks" off the screen. In V8.19 the boxes sit in "Before you export" on Export. | The noun is the tool's own. |
| "Your strands, marks and ticks do not print." | V8.18 only: under the tabs. Removed in V8.19. | Stated that three kinds of choice stay out of the CV | not found in repo | not found in repo | See "The line Prem cited" below. | Three invented nouns, and "print" in its second meaning. |
| "Select a part to edit it.", "Select an item to edit it, or use + Add.", "Select a person to change their entry." | Tabs 2 and 4; Mentorship on Review | Opens a row for editing | not found in repo | not found in repo | Keep "select" for opening a row. | Plain. |
| "Edit on Contributions", "Edit on Personal statement", "Edit on Mentorship" | Every tab | Goes to the step where the text is written | not found in repo | not found in repo | Keep. | Plain. |
| "See your statement", "Show your statement", "Hide your statement" | Above and inside the tabs | Shows or hides the statement beside the tabs | not found in repo | not found in repo | Keep. | Plain. |
| "Does the section name people and where they are now?"; on Export in V8.19: "Does the Mentorship section name people and where they are now?" | Mentorship block under the tabs; "Before you export" in V8.19 | A sixth question, for Mentorship | not found in repo | "Career outcomes of trainees" | Keep. Use the Export wording in both places. | One question has two wordings in V8.19. |

## 7. Export

| Term as shown | Where it appears | What it means in the tool | Funder's term | Guide's term | Recommended common word | Why |
|---|---|---|---|---|---|---|
| "Export", "Export your draft" | Rail; step heading | The step where the draft leaves the tool | not found in repo | not found in repo | Keep. | Familiar from other software. |
| "Template:" | Bar at the top of Export | Agency, format and font of the draft | "the agency's template" (G P-49) | "template" | "Set up for:" | The line shows the agency, the format and the font. "Template" is the agency's own file. |
| "Your narrative CV"; "Edit any part in place." | First card on Export | The whole draft, editable | not found in repo | not found in repo | Keep the heading. "Edit any text here." | "Part" belongs to the six parts. |
| "Before you export": "Selection", "Specificity", "Proofread", "Agreement", "Format"; "See on Review" (V8.19) | Checklist card on Export | Five checks the tool has no data for. In V8.19 Review's five questions and the Mentorship question come first in the same list, each with "See on Review". | not found in repo | "Specificity: named outcomes, not vague claims"; "Choose the ones most relevant to the funding opportunity" (G P-10) | Keep. | Plain. Two of the labels match the guide. |
| "Download or print", "Word (.doc)", "Plain text (.txt)", "Print view" | Second card | File and print options | not found in repo | not found in repo | Keep. | Plain. Here "print" has its usual meaning. |
| "working draft"; "Copy working draft, with notes"; "NARRATIVE CV, WORKING DRAFT" | Second card; text and Word files | The draft together with the tool's notes in square brackets | not found in repo | not found in repo | "draft with the tool's notes" | A fourth sense of "draft" (list B). |
| "Paste into the template, one section at a time"; "Copy Personal statement" | Third card | Copies one section as plain text | "template" (G P-49) | "template" | Keep. | Funder-confirmed word. |
| "Keep your work"; "Save a draft file"; "draft file"; "Load your draft"; "Open a draft file you saved from this tool." | Fourth card; rail; start page | A small file that holds the whole draft, to open in the tool later | not found in repo | not found in repo | "backup file": "Save a backup file", "Open a backup file" | The card already explains that it is "not a Word file" and "your backup". One name removes the need for the explanation. |
| "Reset draft"; "Clear my draft"; "Draft cleared." | Start page; Profile panel | Erases the draft stored in the browser | not found in repo | not found in repo | "Clear draft" | Two verbs for one action. |
| "page limit"; "5 pages in English, 6 pages in French" | Format notes; Export; file notes | The maximum length | "Do not exceed the page limit (5 pages if in English, 6 pages if in French)." (G P-44, P-52) | Same | Keep. | Funder-confirmed. |
| "Before you submit:" | Text and Word files | A reminder to paste into the agency's template | "template" (G P-49) | Same | Keep. | Plain. |

## 8. State words, across steps

| Term as shown | Where it appears | What it means in the tool | Funder's term | Guide's term | Recommended common word | Why |
|---|---|---|---|---|---|---|
| "written", "not written yet", "Not written yet." | Closed contribution row (hover text); Review; Export | A text box has text, or has none | not found in repo | not found in repo | Keep, as the one pair for text. | Plain. |
| "Answered.", "Not answered yet.", "5 of 8 answered", "2 of 3 answered", "3 of 6 answered" | Each field; card counters; profile counter | The same two states | not found in repo | not found in repo | "written" for text ("5 of 8 written"). "answered" for the profile questions, which are choices. | Two words for one state. |
| "empty", "blank", "missing" | Help lines; Review fact lines; summary block | The same state again | not found in repo | not found in repo | "not written yet" | Five words now name one state (list A). |
| "(optional)" | Labels of optional fields and choices | The field can stay unwritten | not found in repo | not found in repo | Keep. | Plain. |
| "Saved for later", "Save for later", "Put back" | Review, first tab; closed row; note on the card | A contribution kept in the draft and left out of the CV | not found in repo | not found in repo | "Set aside", "Set aside", "Put back" | "Saved" also means stored in the browser (list B). The profile already says "set aside" for a competition name. |
| "does not print", "do not print" | Saved for later; under the Review tabs | Stays out of the exported CV | not found in repo | not found in repo | "does not appear in your CV" | "Print" also means sending a page to a printer (list B). |
| "Fold contribution 1", "Fold person A", "Open" | Card buttons (screen-reader labels); closed rows | Closes or opens a card | not found in repo | not found in repo | "Close", "Open" | "Fold" is the tool's own word. |
| "Not given yet", "not given", "Level not given", "None yet", "None marked", "Kind not chosen", "No role is chosen yet." | Review; Mentorship | A choice or a fact that has no value yet | not found in repo | not found in repo | "not chosen yet" for a choice. "not given yet" for a typed fact. | Two phrases cover the cases. |
| "Saved", "saved in this browser", "Changes save as you type." | Rail; start page; Export | The draft is stored | not found in repo | not found in repo | Keep. | Plain. |

---

## The line Prem cited

**In V8.18:** "Your strands, marks and ticks do not print."

**In V8.19:** the line was removed together with the ticks. The strands and the who and what choices are still in the tool and still stay out of the CV. No line on screen says so now.

**Recommended, if the terms above are approved:** "Your areas of work and your choices under Who was affected and What kind of change are for your own review. They do not appear in your CV."

**Recommended, if no term is renamed:** "The strands you named and the boxes you ticked under Who changed and What changed are for your own review. They do not appear in your CV."

The best place for this information is where the choices are made. On Personal statement, the strand names carry the line "On Review, you can compare the order of your contributions with these strands." On Contributions, the who and what boxes carry only "(optional)". A short line in both places ("For your own review. This does not appear in your CV.") would make a line on Review unnecessary.

---

## List A. One thing with two or more names

Each line gives the names now on screen and the one to keep.

1. Headline · title ("Untitled contribution") → **title**.
2. What resulted · What you produced · outputs → **What you produced**.
3. One moment · one occasion · one real case → **one example of use**.
4. Kind · type (of evidence) → **kind**.
5. Your role · your own part · role sentence · the line you write in the box · role level → **your role**; **role sentence** for the text; **role choice** for the list.
6. Choose · select · mark · tick · pick → **choose** for options and boxes; **select** for opening a row.
7. Not written yet · not answered yet · empty · blank · missing → **not written yet**.
8. Competition · funding opportunity · program · "the competition or funding" → **funding opportunity**; "program" only in FRQ rules.
9. Format · template · layout · "the funder's form" → **format** for TCV or CV-FRQ; **template** for the agency's file.
10. Draft · outline → **draft**.
11. Draft file · saved file · "your draft" in "Load your draft" → **backup file**.
12. Load · open (a saved file) → **open**.
13. Reset draft · Clear my draft → **Clear draft**.
14. Remove · Delete (a contribution) → **Remove**.
15. Draft name · profile name ("Name this profile") → **Draft name**.
16. Not sure yet · Agency not chosen yet → **Agency not chosen yet**.
17. Prompts · questions → **questions**.
18. Suggestions · checks ("the checks under each part", in the tester questions) → **suggestions**.
19. Finished example · worked example · example → **example**.
20. Trained · trained or mentored · supervised (in the example text) → **trained or mentored**.
21. People · trainees → **people**.
22. Highlight · describe (people) → **describe**.
23. Undergraduate research · Undergraduate → **Undergraduate**.
24. Community agency · community organization → **community organization**.
25. Your first sentence · Anchor → **first sentence**.
26. Field · discipline ("discipline notes") → **field**.
27. Step · page ("the Export page") → **step**.
28. What you wrote · Your paragraph so far → **Your paragraph so far**.
29. This device · this browser → **this browser**.
30. Page limit · page budget → **page limit**.
31. Fold · close → **close**.
32. Order of contributions (in one note on Contributions) · Reorder contributions (the tab) → **Reorder contributions**.

## List B. One word used for two or more things

1. **part**: (a) one of the six parts of a contribution; (b) the researcher's role ("your own part", "I contributed a specific part", "the parts the partners led"); (c) any piece of text ("Edit any part in place."); (d) a passage of the mentorship example ("these parts run together"). Keep (a).
2. **change, changed**: (a) the effect of the research ("What already changed", "What could change"); (b) the kind of change, in the box "What changed? (optional)"; (c) the buttons "Change" on the Profile bar and on an evidence kind; (d) the tab "Change your role". Keep (a). Use "kind of change" for (b) and "edit" for (c) and (d).
3. **mark, marked**: (a) assigning a contribution to a strand; (b) ticking a who or what box; (c) "review marks", in the message shown when a file from an earlier version is opened. Replace all three with "choose" or "chosen".
4. **print**: (a) appear in the exported CV ("does not print", "Prints as:"); (b) send to a printer ("Print view", "Download or print"). Keep (b).
5. **draft**: (a) the text in progress; (b) the rail group above Review and Export; (c) the "draft file"; (d) the "working draft" with notes. Keep (a).
6. **saved**: (a) stored in the browser or in a file; (b) "Saved for later", meaning kept and left out of the CV. Keep (a). Use "set aside" for (b).
7. **level**: (a) the level at which a person trained; (b) the role choice ("Role level cleared."). Keep (a), as "level of training".
8. **agency**: (a) the funder; (b) "Community agency", a place where a former trainee works. Keep (a).
9. **format**: (a) the TCV or the CV-FRQ; (b) the formatting rules ("format notes"); (c) the source of a rule ("as the format says", "the most the format allows"). Keep (a). Use "formatting rules" for (b) and name the agencies or the instructions for (c).
10. **check**: (a) the researcher's own check (the tab "Check marked changes"; "I have checked this." in V8.18); (b) the tool's automatic notes ("the checks under each part"). Keep (a). Use "suggestions" for (b).
11. **The problem or question**: (a) part 1 of a contribution; (b) the second field of the statement. The meaning is the same at two scales. Keep both; no change is needed.

## List C. Words that are the tool's own

None of these has a funder or guide equivalent in the repo. Each line gives a plain replacement, or a recommendation to take the word off the screen.

1. **strands** → "areas of your work". The guide says "several areas".
2. **marks**, **change marks** → keep the noun off the screen. Say "your choices under Who was affected and What kind of change". The noun was on screen once, in the line Prem cited (V8.18). The verb "marked" is still on Review's first and fifth tabs.
3. **ticks** → keep the noun off the screen. It was on screen once, in the same line, and is absent in V8.19.
4. **blocks** → absent from the screen in V8.18 and V8.19; the word is in code comments, the changelog, the README and `DESIGN.md`. Keep it off the screen. The coloured segments on Review are "parts", and the segments of the length chart are "sections".
5. **Headline** → "Title of the contribution".
6. **One moment** → "One example of use".
7. **Narrative composition breakdown** → "Length of each section".
8. **At a glance** → "Summary".
9. **Still missing** → "Not written yet".
10. **page budget** → "page limit".
11. **Saved for later** → "Set aside".
12. **does not print** → "does not appear in your CV".
13. **draft file** → "backup file".
14. **working draft** → "draft with the tool's notes".
15. **Fold** → "Close".
16. **Anchor** → "First sentence".
17. **A read across your contributions** → "Words your contributions share".
18. **A suggested join** → "Suggested linking words".
19. **Mentorship style** → "How you mentor".
20. **Who joins** → "Who joins your group, and how".
21. **How your work usually happens** → "How you work".
22. **Draft** as a rail group → "Finish", or no label.
23. **w**, **p**, **pp**, **C1** → "words", "pages", "Contribution 1".
24. **Profile** → keep. The word is the tool's own and is understood without a definition.

## Words in the code that are absent from the screen

These were found in the code, the comments or the README. A string search found none of them in text shown to researchers in V8.18 or V8.19. They are listed so that they stay out of future copy.

- "beat", "stakes", "activities", "outputs", "outcomes", "impact", "translational": the keys of the parts.
- "streams" and "threads": earlier names for strands.
- "lens", "work mode", "mentee", "reach", "self-check", "tint", "block".
- "Structural read", "Show the skeleton", "advisor packet", and the flags "Fine", "Needs work" and "Ask advisor": the strings are still in the file. The paths that show them appear to be switched off in V8 (the structural-read mode is reset on load, and `FEEDBACK_ON` is false). This was not confirmed in a browser.

## Questions only Prem or Eli can answer

**For Eli**

1. Which word do the TCV instructions use for the people in the mentorship section ("trainees", "highly qualified personnel", another)? The repo holds only the section title. Would "people you have trained or mentored" be accurate for every applicant?
2. Do the TCV instructions name the supporting items that the tool calls "evidence"? The repo quotes a name only for the CV-FRQ ("bibliographic references").
3. Is "funding opportunity" the right label for both formats, or does the CV-FRQ profile need "program"?
4. Is "research-creation" acceptable in a field label shown to applicants of all four agencies? The lexicon gives it as SSHRC's term.
5. The tool gives the English name of the CV-FRQ's third section as "Supervisory and mentoring activities". The guide gives that name in French only. Is the English name the FRQ's own?
6. The help under "Who joins" says reviewers are asked to look at equity in the research process. Which instruction says so? No source is quoted in the repo.

**For Prem**

7. "Areas of your work" or "themes" for strands? The guide supports "areas"; "themes" is common among researchers.
8. The Review tab names were set on 2026-11-18 (V8.17). Two changes are proposed here: "Edit your role" and "Check the changes you chose". Approve, or keep the V8.17 names?
9. "Narrative composition breakdown" dates from V8.12. Approve "Length of each section"?
10. Was "Headline" chosen to keep researchers from pasting a paper's title? If so, "Title of the contribution" needs the help line to stay.
11. Should the phrase "trained or mentored" apply to every profile, or only to community-engaged work as it does now?
