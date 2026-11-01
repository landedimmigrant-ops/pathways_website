# Round 11 findings: Fable's review of round 10, a francophone public-health researcher writing in French, a blind sociologist with a screen reader, 2026-11-01

Recorded from the three agents' final replies. All walked the round 11 snapshot (= commit f895d32).

## Fable review of round 10 (T-1 to T-15): 5 major · 9 minor · 1 polish

Checked and sound: the 16 px floor at normal text, the rem tiles' column counts, the focus ring, "Clear the level" from the keyboard, the Still missing links and field column landing in view, "Prints as" matching every output, the advisor packet's role context.

- **T-1 · major (run).** With focus on Undo, the end of the ten seconds moved focus to "Add a contribution" and scrolled the page. → **Fixed:** focus goes to the card now in that place, without scrolling, and "Undo has ended." is said.
- **T-2 · major (run).** An answer starting "works as / with / in…" dropped the organization the researcher typed. → **Fixed:** only "works at / for" with no organization typed replaces the sector clause.
- **T-3 · major (run).** A comment swallowed the rest of a line, so the "we/our" read-back marked nothing. → **Fixed.**
- **T-4 · major (run).** The two-capital name rule took listed verbs ("Joined Statistics Canada's census team") for names. → **Fixed:** a listed verb before a name still joins; "Rose Adams now leads…" stays whole.
- **T-5 · major (run).** The "-ing" rewrite turned titles into bad grammar ("is visiting scholar", "is managing editor"). → **Fixed:** a role noun after the -ing word marks a title, and short stems ("King", "Ming") are left alone.
- **T-6 · minor (run).** The step-change scroll fired on ordinary laptops (inner height 650) and hid the privacy note and Profile bar. → **Fixed:** the 0.4 rule applies in the folded layout only.
- **T-7 · minor (run).** The delayed bring-into-view overrode a user's own scroll and moved the page after mouse clicks. → **Fixed:** it runs only after a keyboard focus, never for callers that scroll themselves, and not if the user scrolls first.
- **T-8 · minor.** Range-syntax media queries are ignored by Safari before 16.4. → **Fixed:** classic syntax again (`max-width: 48em` / `min-width: 48.001em`), parsed everywhere, with no whole-pixel gap.
- **T-9 · minor (run).** The step introductions grew from 16 to 18 px. → **Fixed.**
- **T-10 · minor (run).** The self-check boxes shrank to 14.7 px. → **Fixed:** 1rem.
- **T-11 · minor (run).** The Mentorship equity question depended on the order work modes were clicked. → **Fixed:** community-engaged first, then largely solo without a team, then the field.
- **T-12 · minor.** The on-screen-keyboard check ignored the visual viewport's offset. → **Fixed.**
- **T-13 · minor (run).** "The Ottawa Hospital" and "The Walrus" were lowered to "the". → **Fixed:** an organization's article is lowered only before a lower-case word.
- **T-14 · minor (run).** A unit with no organization under Other still printed "is now at Marketing". → **Fixed:** "is now in Marketing".
- **T-15 · polish (run).** "by the end-users" and "by mid-career researchers" were read as times. → **Fixed.**
- Next rounds: a click on a level in a closed role field is lost; Undo disabled at the cap drops focus; two animated scrolls on jumps. → Undo at the cap keeps focus (aria-disabled); the delayed scroll is skipped for callers that scroll themselves. The lost click on a closed role field stays open.

## r11-a · mid-career public-health researcher, FRQS (CV-FRQ), Health / clinical + Social sciences, team-based and community-engaged, writing the whole draft in French: 2 major · 9 minor · 4 polish

A vaccination outreach program co-designed with community organizations in Montréal-Nord, a regional health survey of 3 200 people, a training program for community health workers; 19 trained, two people described in French; the full statement; 1,318 words ([draft](r11-a-draft.txt)). The contributions and statement print as clean French in every output (accents, « » with no-break spaces, thin-space thousands, decimal commas, bilingual CV-FRQ headings, Word in Print view). The trainee lines, the Totals line and the first sentence are English frames that must be retyped.

- **r11-a-1 · major.** The content checks read English only, and nothing says so: French hedges, vague words, "nous", passives and weak verbs pass unflagged. → **Fixed in part:** the note under the checks says they read English and which checks apply to French text; French prestige terms and metrics are caught. French check lists are part of **Q-23**.
- **r11-a-2 · major.** The trainee sentences, the Totals line and the first sentence print as English frames around French; the first sentence cannot be completed in French. → **Open for Prem (Q-23):** French frames for the trainee sentences, the Totals line and the first sentence need a draft-language choice.
- **r11-a-3 · minor.** An elided start ("j'ai…", "l'équipe…", "d'autres…") is not capitalised. → **Fixed.**
- **r11-a-4 · minor.** French number words are not counted, so "No numbers or dates" fires wrongly. → **Fixed:** French number words count ("un" and "une" are left out as articles).
- **r11-a-5 · minor.** "3 200" with an ordinary space counts as two numbers; "1) … 2) …" inside a sentence counts as numbers; "facteur d'impact" and "indice h" are not caught. → **Fixed.**
- **r11-a-6 · minor.** The word ranges measure French as if it were English. → **Open (Q-23).**
- **r11-a-7 · minor.** The length verdict applies the 5-page English limit to a French draft. → **Open (Q-23).**
- **r11-a-8 · minor.** The read across contributions lists French verbs and lower-cases names. → **Fixed in part:** French stop words. The words keep their first-seen form.
- **r11-a-9 · minor.** Word and Print declare English; the French paragraphs carry no language. → **Open (Q-23).**
- **r11-a-10 · polish.** The Totals line changes a French group name's ending. → **Fixed:** the group name prints as typed.
- **r11-a-11 · polish.** The shaded join words are English. → **Open (Q-23).**
- **r11-a-12 · minor · field fit.** The community-engaged role example is an Indigenous-governance one for every community-engaged researcher. → **Fixed (INFERRED copy):** "The community organizations set the priorities and run the outreach; I lead the evaluation design with their board."
- **r11-a-13 · minor · field fit.** Mentorship leaves out residents, clinical fellows, CISSS/CIUSSS and public-health institutes. → **Fixed:** residents and clinical fellows in the health Other help; "Health system (hospital, CISSS/CIUSSS or public health authority)". The college destination is Q-21.
- **r11-a-14 · polish.** "Screening" reads as a clinical term, and the kind has two names. → **No change** (r9-a-9).
- **r11-a-15 · polish · field fit.** The community-engaged help for What you did counts partners, not participants. → **Fixed.**

## r11-b · early-career sociologist who is blind, SSHRC Insight Development (TCV), keyboard and screen reader only (the browser's accessibility tree after every key): 11 minor · 9 polish

Gig workers' scheduling, a dataset of 74 anonymized interviews, a policy brief adopted by a city (removed and restored with Undo); 7 trainees; the full statement; about 1,010 words ([draft](r11-b-draft.txt)). Every task could be finished without sight and no control is unnamed; the friction is in what is read aloud. Confirmed working: Setup's announcements and column, throttled counts, suggestions spoken once after a pause, "Clear the level", add/remove/Undo with focus, evidence kinds by arrows, Mentorship totals and person cards, Still missing links, Move up/down, chart text alternatives, downloads, Reset.

- **r11-b-1 · minor · a11y.** Enter on the current step's rail button drops focus to the page body. → **Fixed:** focus goes to the step heading.
- **r11-b-2 · minor · a11y.** Every evidence item's fields read "The item" and "Why it matters", with no letter. → **Fixed:** "Evidence item b: The item".
- **r11-b-3 · minor · a11y.** "Prints as" is never spoken and no field points to it. → **Fixed:** the "What this person did" box is described by the preview.
- **r11-b-4 · minor · a11y.** The suggested join words are read inline as if they were the draft; the note relies on shading. → **Fixed:** hidden from screen readers; the note no longer relies on shading.
- **r11-b-5 · minor · a11y.** A field's description repeats the whole answer after a flag ("Where these appear…"). → **Fixed:** the read-back is hidden from screen readers.
- **r11-b-6 · minor.** "our cities" in the statement is read as "we". → **Fixed:** "our" before cities, society, country, world and similar words is not counted.
- **r11-b-7 · minor · a11y.** Locked Review and Export say only "unavailable", with no reason. → **Fixed:** the locked buttons are described by the reason.
- **r11-b-8 · minor · a11y.** Setup repeats "Next question: …" on every arrow press and again on Space. → **Fixed:** once per question.
- **r11-b-9 · minor.** Space on a chosen year clears it, unlike every other Setup radio. → **Fixed:** the year behaves as a radio, with "Clear the year".
- **r11-b-10 · minor · a11y.** Escape does nothing in an open kind chooser, and an arrow changes the kind with no cancel. → **Fixed:** Escape closes the chooser and keeps the kind it had ("Kind unchanged: …").
- **r11-b-11 · polish.** "Evidence item b added." does not say "Choose its kind." → **Fixed.**
- **r11-b-12 · polish.** A blocked section copy gives no next step. → **Fixed.**
- **r11-b-13 · polish.** Download image and Save draft do not name the file. → **Fixed.**
- **r11-b-14 · polish · a11y.** The page title is the same on every step. → **Fixed:** "Mentorship · Narrative CV — V7 beta".
- **r11-b-15 · minor · field fit.** The statement's social sciences question says only "problem". → **Fixed (INFERRED copy):** "What problem or question does your research keep returning to?"
- **r11-b-16 · minor · field fit.** Arts wording in the replication hint, a problem-only field panel line, and "field scale" in the .txt note. → **Fixed:** the arts clause is for creative work only; the social sciences panel line names a question; the .txt note uses plain wording.
- **r11-b-17 · polish.** The "Welcome back" message is in two live regions. → **Fixed:** spoken once, by the banner.
- **r11-b-18 · polish · a11y.** Reaching ten contributions is silent. → **Fixed.**
- **r11-b-19 · polish · a11y.** Field column buttons read their name twice (a title repeats it). → **Fixed.**
- **r11-b-20 · polish · a11y.** The six-parts chart's text alternative repeats every part name for every contribution. → **Fixed:** "has all six", or what is missing.
