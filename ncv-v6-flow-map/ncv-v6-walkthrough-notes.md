# NCV V6 walkthrough notes

Started 2026-10-27. Prem's notes while walking the V6 tool and the flow map. Tags: **note**, **bug**, **idea**, **question**, **decision**. Anything I infer is marked INFERRED. Prem's words stay as said.

## Questions for Prem (open)

(none yet)

## Whole tool

- **decision** (Prem, standing rule): whenever the guide is referred to, use the official page, not our review copy, so the code moves to AEM cleanly: https://www.concordia.ca/research/pathways-to-impact/learn/impact-101/narrative-cv.html . Applies to links in the tool, fact checks in these notes and in the decisions logs.
  - **Checked** 2026-10-27: the official page is live (HTTP 200). All seven anchors the tool uses exist on it: `why`, `three`, `compare`, `difference`, `concerns`, `reviewers` (plus the page top). So the links can switch without breaking.
  - **Re-checked** the contribution limit against the official page, not the review copy: "Up to 10 contributions or experiences", no minimum found. Same as before.
  - **Build note**: the tool sets `GUIDE_URL = "ncv-guide-review/"` (and a comment saying to switch it at launch). Switching it to the official address covers every guide link. Not changed yet.
  - **Not verified**: whether the official page's wording matches the review copy section by section; the review copy's corrections (`ncv-guide-review/corrections.json`) were built against the AEM page, so I expect agreement, but I have only re-checked the one claim above.

- **question** (Prem, opening page): the "Open the page" action leads to two screens on the map, the page shell and the welcome-back banner. Prem finds that confusing. Message cut off at "What does…" (waiting for the rest).
  - My answer: the shell is always there (banner, steps rail, privacy line). The welcome-back banner shows only for a returning visitor whose saved draft was past Setup. A first-time visitor sees the shell and Setup only.
  - **idea** INFERRED: on the map, show the banner as a conditional ("returning visitor only") and show Setup as the first-time destination, so the opening page doesn't look like it leads to two equal screens.

- **decision** (Prem, design principle for the whole tool): do not show everything open all the time. Content appears as a response to what the researcher just did (a feedback mechanism), and the screen asks one question at a time, because many things at once are distracting. Applies to every step; to be walked through each one.

- **idea** (Prem, progress feedback, applies to every step): (1) at the top of each section, show how many questions it has and where you are; (2) in the left rail, a section turns green once everything in it is complete; (3) you can click any section in the rail to go back to it.
  - **Validated in code**: (3) already works; every rail item is clickable and keyboard-operable. (2) partly works: a finished step gets a green label and a filled dot (`is-done`, colour #2a6e2a), but "done" is loose today: Profile needs path + agency + discipline (not career stage); Contributions turns green as soon as ONE contribution has a title and an activities answer; Mentorship needs a philosophy or one trainee with a place; Personal statement needs two of its seven answers; Review never turns green. (1) does not exist; no step shows a question count.
  - **question** open (needs Prem): what does "everything completed" mean for each step? Contributions especially (all ten cards? one?). INFERRED lean: green = every required question answered; optional ones never block; Contributions green when at least one full contribution exists and no started card is left half-empty.

- **decision** (Prem, what green means): use a funder minimum if the narrative CV rules set one; otherwise do not hold green to "fully complete". Green means you have been in that section and entered something, so moving down the rail feels like getting through it.
  - **Checked the guide** (`ncv-guide-review/`): it gives a maximum for contributions (up to 10) and no minimum. I did not find a required minimum for the mentorship section or the personal statement either (searched "minimum", "at least", "required"; not a full read). So no funder minimum drives the rail.
  - **Rule** INFERRED: a step turns green when at least one answer is entered in it. Review turns green once opened; Feedback once sent, as today. The question counter at the top of a section ("3 of 7 answered") carries the honest completeness, so green does not claim more than it should.
  - Replaces the "everything completed" question above. Build note: this loosens `stageDone` for Profile (stage no longer needed), Contributions, Personal statement; Review needs a "visited" flag.

- **idea** (Prem, rail metrics): instead of (or beside) a green light, show numbers in the rail that give a sense of building something: number of contributions, mentorship, personal statement progress. Maybe words too.
  - **Validated**: a live word count already exists (`draftWords`) and Review turns it into roughly how many pages at 12 points against the 5-page English limit. The rail does not show it.
  - **proposal** INFERRED, for Prem to edit: a quiet metric under each rail label: Profile: agency and stage as a short line; Contributions: "3 of 10"; Mentorship: "2 trainees"; Personal statement: "4 of 7 answered"; Order: none; Review: none. At the foot of the rail, a "Draft so far" tally: "about 1,240 words, roughly 2.5 of 5 pages". The tick or green stays as a small secondary cue.
  - **question** open: does a running page tally feel motivating or like pressure early on? INFERRED lean: show it once there are at least 200 words, so an empty draft does not show "0 of 5 pages".
  - Caveat: the page estimate is rough (the tool says "roughly"); label it that way in the rail.

- **decision** (Prem): add the rail metrics to the notes to try, and see what they do. Think about layout and how the rail reads. **Do not build anything yet.**
  - **Constraints found** (`styles.css`): the rail is a 220 px column with 1.5 rem padding, so about 170 px of text width, sticky while you scroll. Labels are 0.88 rem. Long labels already wrap ("Order of contributions", "Background and skills"). Under the mobile breakpoint the rail becomes a static block above the content, so it pushes the screen down.
  - **Layout sketch** INFERRED (a text mock-up, for Prem to react to):

        MY APPLICATION
        ● Profile
          SSHRC · Early career
        ● Contributions
          3 of 10
        ○ Mentorship
          2 trainees
        ○ Personal statement
          4 of 7 answered
        ○ Order of contributions
        ○ Review
        ○ Feedback
        ─────────────
        Draft so far
        about 1,240 words
        ▓▓▓▓▓░░░░░
        roughly 2.5 of 5 pages

  - **Reading rules** INFERRED: the metric sits on its own line under the label, smaller (about 0.75 rem) and muted grey, aligned with the label text so the dot column stays clean. Only steps that have something to count show a metric; empty steps show none, so a fresh rail is quiet and fills in as you work. The current step keeps its bold burgundy label; its metric stays muted. The tick or green dot stays as the small cue. Step names stay plain nouns.
  - **Draft-so-far block**: separated by a thin rule at the foot; shown only past about 200 words; "roughly" stays in the wording; the bar is a plain length bar, not a score.
  - **Risks to test**: the longer rail pushes the sticky panel near the viewport height on a small laptop; on a phone the rail (with metrics) sits above every step, so there the metrics may need to collapse to a single line ("3 of 10 contributions · about 1,240 words"). Long agency names ("Not sure yet · Mid-career") need a character check at 170 px.
  - **To try**: build behind the current rail as an option (a flag), compare both with a real draft open, then keep what reads better. Decide after seeing it.

## 1. Setup

- **decision** (Prem): call the whole opening screen the **start page**. Standardize on that term in the map, notes and decisions logs.
- **idea** (Prem): the start page holds two different things, so separate them visually: (1) the title, description, short note and the "read the narrative CV guide" link; (2) the setup itself. Make the boundary obvious.
- **idea** (Prem): rename "Setup" to "Configure profile" or "Setup profile". Undecided, wants feedback.
  - My feedback: avoid "configure" (software word, not the researcher voice). Rail labels are plain nouns (Contributions, Mentorship), so the step name should be a noun too. Leading candidate "Your application", because the fields are agency, discipline, career stage and competition, which describe the application as much as the person. "Your profile" is the runner-up but could be mistaken for a funder-portal profile. Not sure; Prem decides.
  - Found in code: the screen has three blocks, not two: intro text, the path choice (Start fresh / I already have a draft), then the agency/discipline/stage fields. Which block belongs to "start page" and which to the step is part of the decision. "Setup" appears in three user-visible places: the Steps rail, the screen heading, and the coverage list on Review ("Setup: Context set"). Internal key `setup` can stay.

- **idea** (Prem): tighten the start page top to bottom. Subtitle says it is a drafting tool/space for developing your Tri-agency or CV-FRQ draft. Move the "This tool will help you get familiar…" paragraph up under it. Then a guide sentence ("if you haven't read the narrative CV guide, we recommend doing so before you start, or consulting it as you go"). Then the privacy / no-AI line. Then straight into the first step.
- **idea** (Prem): "My application" as the heading over the whole step rail (replacing "Steps"), and the first step named "Profile" (or "Setting up your profile"). Fixes "My application" sounding like one screen.
- **check** repetition in the current text: (a) privacy is said twice, in the line under the subtitle and again in the intro paragraph ("Anything you write is your own; it stays here and is not stored anywhere else"); (b) "no AI" is said twice ("No AI" in the privacy line, "runs without AI models: the checks are fixed rules" in the paragraph); (c) "prototype" is in the banner and again in the paragraph; (d) the guide link now sits on its own line below the privacy line.
- **draft wording** INFERRED, for Prem to edit (not in the tool yet):
  - Subtitle: "A drafting tool for your Tri-agency CV or CV-FRQ."
  - Intro: "This tool helps you get familiar with how a narrative CV asks you to think about your work and describe it. You build a first outline in your own words: your contributions, your mentorship record and a personal statement, plus questions for an advisor. A full first draft can take a day or more, so allow time before your deadline. English only for now."
  - Guide: "We recommend reading the narrative CV guide before you start, and consulting it as you go." (link on "narrative CV guide")
  - Privacy: keep the existing line, and add "The checks are fixed rules." so the paragraph can drop its copy.
- **decision** (Prem): "What a narrative CV is, and which funders use it" is not an expandable. It is a second link to the guide (deep link to the guide's `#why` section), so it duplicates the guide link at the top. Drop it; keep one guide sentence on the start page. (My earlier note calling it a disclosure was wrong.)
  - **decision** (Prem): the one link opens the guide at the top, and its label is "narrative CV guide", sitting inside the sentence so the sentence and link read as one.

### Profile questions (after "New draft")

- **idea** (Prem): clicking New draft reveals a short opening statement ("let's build your profile" or similar), then one question at a time, starting with the funding agency. Review the agency question text; frame the choices more clearly; put the explanation in a visually separate element from the choices.
- **Current agency screen** (code): the question "Which funding agency?" is followed by one long help paragraph (what sets the format, TCV vs CV-FRQ, the FRQ requirement, font rules, "if you are not sure… pick Other"), then five bare chips: SSHRC, NSERC, CIHR, FRQ, "Other / not sure". The help names "Other" but the chip says "Other / not sure". The chips are acronyms only; the full names and the format each one leads to are inside the paragraph.
- **Current order** (all visible at once today): agency, discipline, second discipline (appears after the first), field not listed (optional text), career stage, competition (optional text). Six questions, three of them optional.
- **proposal** INFERRED, for Prem to edit:
  - Question: "Which agency funds the competition you are aiming at?"
  - Choices, each a card with its full name and the format it leads to: SSHRC (Social Sciences and Humanities Research Council) · Tri-agency CV; NSERC (Natural Sciences and Engineering Research Council) · Tri-agency CV; CIHR (Canadian Institutes of Health Research) · Tri-agency CV; FRQ (Fonds de recherche du Québec) · CV-FRQ; "Not sure yet".
  - Explanation as a separate note under the choices, smaller and set apart: what the answer changes (the CV format and the format notes, such as font rules), that the answer can be changed later, and where to check if unsure (the program's application guide). The FRQ requirement sentence stays as written today; it is a funder fact and not re-worded here.
  - Flow: single-choice questions move on when you click; optional text questions have Continue and Skip; each answered question folds into a one-line summary you can click to change (the "Tailored for" pills already do this on later steps); a quiet "Question 2 of 6" counter.
- **question** open: should the optional questions (second field, field not listed, competition) sit after the core three in a short "a few more details, all optional" screen, or stay as single questions you can skip? INFERRED lean: one optional screen at the end.

- **idea** (Prem, refines the proposal above): question wording along the lines of "Choose the agency you are applying to" (or the competition). Do not show the format on each card. Maybe a hover to explain the acronyms; formats will be learned later and are fairly standard.
  - My view INFERRED: acronyms on the cards are fine for this audience. Hover alone does not work on phones or by keyboard, so show the full name as small visible text and keep hover only as an extra. Show the format after the choice as feedback ("Tri-agency CV format"), which fits the one-question-at-a-time rule and keeps it off the cards.
- **decision** (Prem): delete the line "Choose one to start. Switching later keeps everything you have written." and its follow-up "Start fresh — selected. Set your context below…". After New draft is chosen, show a small note with an icon instead: you can return to this page, select Profile in the steps list and change your answers, in one quick sentence.
  - Build note INFERRED: the tool is one offline file, so use an inline SVG icon (a Material-style "info" shape) in place of the icon font, which needs a network. The privacy line already uses an emoji; consistent either way.
  - Draft wording INFERRED: "You can change these answers at any time: select Profile in the steps list."

### Profile question order, competition, date

- **decision** (Prem): new order: **agency → competition (required, plus a date) → career stage → discipline** (then the optional second field). The competition question appears right after the agency is chosen: "Name the competition or funding you are applying for". Competition is no longer optional. Add a competition date or year, if available. (Message cut off at "make sure we…"; I read it as "make sure we note and plan this".)
  - **Validated**: the competition name is used in three places: the personal-statement prompt ("this competition" if empty, otherwise the name), the "Tailored for" pills, and the Review summary and advisor packet header. No date exists in the tool today.
  - **Reorder cost** INFERRED: low; the questions are independent. The "Change these answers" panel and Review coverage ("Context set") use the same fields and need the same order.
  - **question** (Prem): "year" or a full deadline? A year is enough for a label. A deadline date could do more: a "weeks to your deadline" line in the rail or Review, and an honest reminder that a first draft can take a day or more. INFERRED lean: ask for the deadline date, shown as a year if that is all they know.
  - **risk** (required): someone who is exploring and has not chosen a competition has no honest answer and may type filler, which would then appear in the statement prompt and export. INFERRED option: keep it required, with a clearly worded alternative such as "I have not chosen one yet", which the prompts treat like today's empty case. Prem decides.
  - **Placement of the reward**: the answer shows straight away as a pill in the profile summary, and later in the statement prompt, so the question pays back.

- **decision** (Prem): ask for the **year** only, no deadline for now (the deadline stays as a future idea, to revisit). The year is there so the team can track when a CV was planned for. The not-yet-chosen option is worded **Undecided**.
  - Build note INFERRED: year as a short field or a small list (current year and the next two or three); stored with the profile; shown with the competition in the profile summary; the draft files and the team summary carry it. The prompts treat Undecided like today's empty competition.

### End of the profile

- **decision** (Prem): the button at the bottom of the profile now reads "Start drafting →"; change it to name the next step with an arrow: **Contributions →**. Add a short note beside it: to change any of this, select Profile in the steps list and change your answers.
  - **Rule for every step** INFERRED: the forward button names the next step as the rail names it ("Mentorship →", "Personal statement →"), and the back button names the previous one. The button label is already set per screen in code (`nextLabel`), so this is a wording change.
  - **overlap** INFERRED: this note repeats the earlier one shown right after New draft is chosen ("You can change these answers at any time: select Profile in the steps list"). At the start nothing has been answered yet, so the note matters more here, at the end. Lean: keep this one, drop the early one. Prem decides.
  - Wording INFERRED: "You can change any of these answers later: select Profile in the steps list."

### Discipline question

- **idea** (Prem): lay out and style "Closest disciplinary home" like the agency question (question, cards, a separate explanation), and say what the answer does. Doubts about "Field not listed? (optional)": it cannot update the samples, so it may not be rewarding. (Message cut off at "What do you…"; answered as "what do you think".)
  - **Validated in code**: the five choices are STEM / engineering, Health / clinical, Social sciences, Humanities, Creative / fine arts. The "field not listed" answer feeds nothing the researcher sees. It is saved, and it appears only in the session summary that goes to the team if the researcher sends feedback. It changes no worked example or note.
  - **recommendation** INFERRED: drop the "field not listed" box from the profile. Move the ask to where it belongs: one line under the discipline choices ("If your field is missing, tell us in the Feedback step at the end"), and add a "which field is missing?" question to Feedback. The team still hears it; the researcher is not asked to do unrewarded work early.
  - **Question wording** INFERRED: "Which field is your work closest to?" ("disciplinary home" is academic shorthand; plain wording suits the opening questions).
  - **Explanation** INFERRED, as a separate note under the cards: "Your answer chooses the worked examples and discipline notes you see, so they come from work like yours. Pick the closest fit. You can change it later, and your draft stays as it is."
  - **Second field**: keep, but reveal it only after a discipline is chosen, as its own follow-up ("Does your work also sit in another field?", with "No, just this one" as a clear choice). Unlike "field not listed", it earns a visible reward: an extra worked example spanning the two fields.
  - **open** (optional): a short "for example" line under each card to help the Health / STEM and Social / Humanities borders. Not needed unless testers hesitate here.

### Path cards (two cards under the start page intro)

- **idea** (Prem): "Start fresh" clashes with the rail's first step now being a start. Rename to **New draft**; second card **Continue draft** or similar. Review the card text too; it reads old. Audience is researchers.
- **question** INFERRED concern: "Continue draft" may read as "reopen what I saved in this tool" (the tool saves automatically and shows a welcome-back banner). The card means "I wrote a draft elsewhere and want to paste it in". Candidates: **Existing draft** (pairs with New draft), or **Paste a draft**. My lean: Existing draft. Prem decides.
- **bug** (screenshot): the two card titles sit at different heights because the content is centred in unequal-height cards. Top-align the title and text in both.
- **check** current text against house voice: "live checks" and "structural read" are jargon; "The tool splits it…" and "shows you which of the format's moves are missing" personify the tool and use "moves" as a term researchers don't use; the imperatives ("Build…", "Paste…") are fine on a button but not in running text.
- **draft wording** INFERRED, for Prem to edit (not in the tool yet; condition first, "you", names what the reader gets; Canadian Press mechanics):
  - **New draft** — "If you are starting from nothing, you work through your contributions one at a time. Each one has prompts, a worked example from your field and checks on your wording. You write the personal statement last, once the rest exists."
  - **Existing draft** — "If you have already written a draft, you can paste it in. It is split into paragraphs and checked against the same rules, and you see which parts of the format it covers and which are missing. You can then revise it here or take the results to an advisor."
  - Open: the step heading "Start fresh, or bring a draft?" could become a question in the researcher's voice, e.g. "Do you already have a draft?" (the voice study found first-person question headings work best).

- **question** (Prem): does pasting a draft in actually parse it completely? What is the function, what should it be called, or should we leave it out for now?
  - **Validated in code** (`analyzeDraft`, `renderXray`): it does NOT import the draft. It (1) splits the text on blank lines into paragraphs, with a conservative guess at which lines are headings; (2) runs the same wording checks (ownership, vague, weak, prestige, hedge, link, passive, numbers) on each paragraph; (3) shows an 8-line coverage list from keyword matches ("I am a", a problem word, numbered contributions, a number, a citation shape, mentorship words, where trainees went, future words). Nothing lands in the Contributions, Mentorship or Personal statement fields. The researcher re-enters anything they want to rework.
  - **Weak signals**: the coverage list is regex. "Future direction" fires on the word "will"; "problem" fires on "need". The screen itself calls it "a rough reading".
  - **bug** the screen says "export this read from the Review step and bring it to your advisor". The export builders never include the pasted draft or the read (the only other use is the feedback session summary). The sentence promises something the tool does not do. To confirm by an export test before fixing.
  - **Options**: (a) keep it, name it for what it does (**Check a draft**) and drop "parsed" language; (b) make it a small secondary link, not an equal card, since most researchers start new; (c) park it for V6 beta until it can feed Contributions. Full import would mean guessing contribution, mentorship and statement boundaries in free text without AI; INFERRED: error-prone, so not recommended now.
  - **open** how many testers used it: the feedback rows' session summaries record `structuralRead` runs. Not checked yet.

- **idea** (Prem): paste-in analysis needs an LLM, so it cannot grow beyond a rough check. A saved draft file that can be re-imported and repopulate every field would be worth keeping the "continue" path for.
  - **Validated**: V6 has no save-to-file or import today. The exports (.txt, Word .doc, advisor packet) are for reading and cannot restore fields. The whole draft lives in one object in the browser (`localStorage["ncv-v6"]`), so it is lost when browser data is cleared and cannot move to another device.
  - **Feasible without AI**: yes. The load code already merges a saved object into the defaults, fixes old FRQ codes and normalizes mentee rows, so an import can reuse it. Needs: a **Save draft file** button (JSON, with a version stamp) and an **Open a saved draft** control; check the file is a V6 draft before replacing anything and confirm before overwriting an existing draft.
  - **JSON vs .md**: JSON restores reliably. A hand-edited .md cannot be parsed back reliably without a strict format. Option: the readable export carries the JSON in a hidden block at the end, so one file serves both; start with JSON alone.
  - **Fit**: this makes **Continue draft** the right name for the second card ("open the file you saved from this tool"). The paste-and-check function then becomes a separate small thing or is parked (see options above).
  - **INFERRED risks**: private CVs (the file stays on the researcher's device, no upload); version changes between V6 and later builds need a version field and a migration, as in the V5x portfolio; the file should not include team notes or feedback answers unless Prem wants those moved too (open).

- **decision** (Prem, FINAL, supersedes the layout below): drop the "Coming soon" pill and the analyze idea entirely. One row: **New draft** is the prominent card, emphasized with colour. **Continue draft** is a small square on the right-hand side, for loading a saved draft file. Exact sizes to be settled when built.
- **superseded** (earlier layout, kept for the record): New draft stays the main card. **Continue draft** (reload a saved draft file) is a smaller option with a short, clean explainer. Below it, a pill-style box the same width as the New draft card reads **Coming soon: analyze your narrative CV** (the paste-in analysis, which needs an LLM).
  - Sketch (INFERRED reading of Prem's description):
    - row 1: [ New draft (large) ] [ Continue draft (smaller) ]
    - row 2: [ Coming soon: analyze your narrative CV ] (same width as New draft, not clickable)
  - **draft wording** INFERRED: Continue draft: "Open a draft file you saved from this tool and carry on where you stopped." Pill: "Coming soon: analyze your narrative CV".
  - **consequence**: the "I already have a draft" mode and the Structural read step drop off the rail for V6 beta (code stays in the file, hidden). Continue draft is an action that loads a file and lands on the saved step, not a mode.
  - **question** open: the page says "No AI". A pill promising analysis with no AI named may read as a promise to add one. Either word it neutrally ("Coming soon: a read of your existing narrative CV") or say plainly that it will use AI and that you will be asked first. Prem decides.

## 2. Structural read (draft path only)

## 3. Contributions

Walked on 2026-10-27, screen top to bottom. Today's order (code): "Tailored for" bar → small "Step · Most significant contributions and experiences" label → heading "Your strongest contributions" → instruction paragraph → "What counts as a contribution" link → "Write them in any order…" note → one-time "checks are suggestions" note → work-mode chips → worked example (open in full) → second-field example (if chosen) → "In STEM, the six jobs sound like this" box → contribution cards → Add another → Mentorship button.

- **question** (Prem): is the "Tailored for" bar still needed, now the rail will carry the profile? Likes it; it clearly shows what the tool is using.
  - View INFERRED: keep it, as one slim line. The rail will show only agency and stage; the bar also shows competition, discipline and work mode, which are what change the examples on this screen. Revisit whether Order and Review still need it.
- **decision** (Prem): the "Step ·" label goes (we no longer call the rail "Steps"). Choose one heading: "Most significant contributions and experiences" or "Your strongest contributions". Likes the large headline size and the clear instruction under it; leave the instruction for now.
  - Recommendation INFERRED: use the official section name as the heading ("Most significant contributions and experiences"). It is what the funder's form calls it, so the researcher sees the same words in both places. "Strongest" also pulls against the guide, which says to choose the contributions most relevant to this funding opportunity, which may differ from the most recent or most impressive.
- **idea** (Prem): bring the "What counts as a contribution" link up. Lean: put it inside the instruction sentence as the link, so it reads as part of the instruction.
- **idea** (Prem): "Write them in any order. After the personal statement, a short step asks you to put them in the order a reviewer should read them." Maybe unnecessary now; if kept, make it a closing statement.
  - Recommendation INFERRED: move it to the bottom, next to the forward button (the moment the researcher is about to leave). Short wording: "You will put these in order later, after the personal statement." The Order step is its own item in the rail, so this is the only mention needed.
- **question** (Prem): "How does your work usually happen?" Does it belong here, or is it part of the step? Needs sequencing.
  - Facts (code): it is global, not per contribution; it chooses the role and outcome prompts and which worked example shows. It is also shown in the "Tailored for" bar.
  - Recommendation INFERRED: move it into the Profile as the last question, so everything that tailors the tool is answered in one place and Contributions starts with the work itself. Cost: the Profile grows to six questions. Alternative: keep it as the first question on this screen. Prem decides.
- **idea** (Prem): the fictional worked example should come up before the researcher starts writing, but be opened on request, not open in full.
  - Facts (code): the example box is open in full: a "Fictional example" tag, title, a match line, the paragraph with six coloured jobs, a legend, a source note, "Show the skeleton", a guidance line and a link. Plus a second box if a second field was chosen, plus the "six jobs sound like this" box. Three large open blocks before the first question.
  - Proposal INFERRED: one row of three quiet controls just under the instruction: **See a finished example**, **See an example across two fields** (only if a second field was chosen), **How the six jobs sound in your field**. Each opens on click and closes again; all closed on arrival.
- **idea** INFERRED (fits Prem's rule that things appear as feedback): the "checks under each field are suggestions" note should appear the first time a check fires, inside that field, not as a banner on arrival.
- **decision** (Prem): try moving "How does your work usually happen?" into the Profile and see how it goes. Prem's worry: it can bias people, since many people work in several modes. Keep it multi-select ("choose any that apply") and word it neutrally. Message also said "the contribution sections are winning" (unclear; probably "long/wordy"; asked Prem to confirm).
- **question** (Prem): will people actually click the ✓ / ✗ / ? self-assessment buttons on each field, or should we leave them out and let people review later?
  - **Facts** (code): each field in a contribution card has three buttons: ✓ Fine, ✗ Needs work, ? Ask advisor. ✗ and ? open a "note to self" line. Flags feed: the count in the welcome-back banner, the "Your open flags" list in Review, and the "Where I flagged my own draft" section of the advisor packet. About ten fields per card, up to ten cards, so up to roughly 100 small decisions.
  - **No data**: the tool logs no flag clicks (the counted events are assemble, copy draft, copy section, Word download, print view, order moves, sample draft, structural read). So we cannot say how many testers used them. The twelve feedback questions may mention them; not checked.
  - **Recommendation** INFERRED: do not ask for a judgment on every field while the researcher is writing; it competes with writing and is most likely ignored. Instead, make it a review-time action at coarser grain (per contribution, in the Review step: "Needs work" / "Ask my advisor" with a note), which still feeds the advisor packet. Wording checks stay live, as feedback, because they need no click.
  - **Cheaper test first**: add flag-click counts to the session summary, keep the buttons but show them only after a field has text, and read the next round of feedback. Decide from data.
  - **Unsure**: the buttons came from earlier review rounds (B-numbered fixes); check that Eli did not ask for them before removing.
- **decision** (Prem): move the ✓ / ✗ / ? self-assessment out of the writing flow and into the Review step ("too much noise"). Per-contribution, feeding the advisor packet as before. Also add flag-click counts to the session summary so the next round shows whether they are used. (Whether Eli asked for them in an earlier round is still unchecked.)
- **decision** (Prem, principle): sequence the questions inside each contribution card. Do something, see the next thing appear; a long list of questions feels overwhelming. Keep the grey card that holds a contribution. The tool should have some **production value** (feel finished and crafted).
  - **Fields in a card today, in order** (code): headline; stakes; how involved (led / co-led / part) then the role line; what you did; outputs; what already changed; what could change; one moment (optional); evidence (each item: text, type, two-line note, an "Other" label); then an "Assemble" link. Nine questions, plus evidence items.
  - **Proposal** INFERRED, to react to:
    1. A new card opens with only the headline question. The grey card header shows "Contribution 1" with the headline as you type it, and a quiet "Question 1 of 9".
    2. **Next** (or Enter in a one-line field) reveals the next question below. The answered question folds to one line (question label, a short preview of your answer, an edit control). Optional ones (the moment, what could change) have a plain **Skip**.
    3. Each question keeps the same three parts as the profile: the question, a visually separate explanation, then the field. Wording checks appear under the field after you type, as feedback.
    4. The order stays as the funder's structure has it (stakes, role, what you did, outputs, what changed, what could change). Not reordered without checking the guide.
    5. From question 2 on, a "Your paragraph so far" strip builds under the card, one sentence at a time, using the existing Assemble logic. This is the reward for answering: you watch the contribution take shape. It replaces the hidden "Assemble" link.
    6. Evidence is the last question, one item at a time, with "Add another item".
    7. When the card is finished it folds to a summary row (headline, the six jobs as small ticks). Only then does "Add another contribution or experience" appear. Cards past the first show as a list of summary rows; click one to reopen it. Maximum stays 10.
  - **Production value**, concretely: a short slide-and-fade when a question appears (off for people who ask for reduced motion); focus moves to the new question and screen readers are told it appeared; the same card, spacing and type for every question across all steps; progress dots in the card header; nothing jumps when text changes length.
  - **Risks** INFERRED: more clicks for fast writers (offer **Show all questions** in the card header); returning visitors must see their answers, so what is revealed is worked out from what is already answered, not from a click count; a Next button is steadier than revealing as you type (typing-triggered reveal jumps).
  - **Applies beyond contributions**: the same pattern should cover Mentorship and the Personal statement; to be walked.
- **decision** (Prem, revises the card proposal above; message cut off at "They just want to…", read as "get through it"): no Next button and no Enter-to-advance. Never hide an answer: people need to see it to write the next one. The field you are in is open in full (question, explanation, field). When you move to another field that has text, the one you left shrinks to its headline and your answer. Go back up and it opens again, with its explanation. Fast writers just keep typing and tabbing. "Show all questions" and "Skip" are no longer needed.
  - **How it reads** INFERRED mock-up, one card:

        Contribution 1 · Stormwater models for cities      3 of 9 answered
        ─ The problem ─────────────────────────────────────
          Thousands of parish registers are water-damaged…   (answer, up to about 3 lines)
        ─ Your role ───────────────────────────────────────
          I led it · I led the modelling and the municipal …
        ┌ What you did ────────────────────────────────────┐   (open: you are here)
        │ Say what you did, in your own words.   ← explanation, set apart, lighter
        │ [ text box ]
        │ checks appear here as you type
        └──────────────────────────────────────────────────┘
        · Outputs                                            (not reached yet: label only)
        · What already changed
        · What could change
        · One moment (optional)
        · Evidence

  - **Not-yet-reached questions** INFERRED: shown as one-line labels using the six-jobs names (so the researcher sees what is coming without a wall of boxes). Open on click or tab. The "Your paragraph so far" strip stays and grows as answers arrive.
  - **Answers in the collapsed state**: shown in full up to about three lines, then faded with "…" and one click to open, so an answer is never hidden, only shortened when it is long.
  - **Risk to test first**: when the field above shrinks as focus moves, the content below shifts and a click can land on the wrong thing. Mitigation INFERRED: shrink after the new field has opened, short transition, keep the page position fixed (scroll anchoring), and test with a real long draft.
  - **Accessibility**: the text box stays in the page when shrunk (reduced, not removed), so tab order and screen readers keep working; the shrunk row announces the question, that it is answered, and that it can be edited.
  - **Counter**: "3 of 9 answered", replacing "Question 3 of 9".
  - **question** open (Prem): for questions not reached yet, label-only rows (my lean), or hide them until reached?
- **decision** (Prem): no label-only rows for questions not yet reached; they would add confusion. Message cut off ("at least the spaces show that you're going to be responding to"). INFERRED reading: show the real fields, so the researcher sees the spaces they will fill. Every question is a visible field from the start; the one you are in is open in full, and fields you have not reached are shown shrunk and empty (the question and a one-line empty box), so nothing is hidden and the card reads as a form to fill in, not as a list of labels.
  - **Tension to watch** INFERRED: nine empty boxes at once is the long list Prem wanted to avoid. Keep the empty ones small (one line each, no explanation), so the card stays short; the active field carries the weight.
  - **question** open: confirm the reading above.
- **decision** (Prem): go with the reading above and fix problems in production ("try it"). Keep the text boxes **static** while you write: no growing as you type, so the page does not move under you. Do the fade/shrink only after you move into another box. Message cut off at "So at least it starts to feel like not a…" (read as "not a long form").
  - Build note INFERRED: fixed height for the open box (about four lines; longer text scrolls inside the box); the shrink-and-fade runs when focus leaves the box, after the next box has opened; the page position stays fixed. Resize handle left as the browser provides it.
- **idea** (Prem, evidence): once you reach evidence you are doing a different job, showing proof for what you wrote. When you click "Add evidence", the rest of the card should summarize so you can read what you wrote as one thing. Make the kinds of evidence visible (media, policy, dataset and so on) and say clearly that evidence backs this contribution and that you can add as many as you like. Review the explanation.
  - **Facts** (code): evidence items have a text line, a type chosen from a drop-down, an optional two-line note, and an "Other" label. The eight types are Peer-reviewed, Media / public, Policy / practice uptake, Dataset / tool, Award / recognition, Funding, Replication / citation, Other. They sit inside the drop-down, so nobody sees them unless they open it, and **Peer-reviewed is pre-selected** for every new item, which leans everyone toward papers.
  - **Current explanation**: "Add one item at a time: a citation, a named adoption, an award, a dataset, a piece of coverage. Then pick its type. Each item gets a letter — a, b, c — and the letter appears in your draft beside the sentence it backs up. Under each item there is room for two lines on what it found, or why the dataset or tool was useful, so a reviewer has the point without opening the source."
  - **bug** (copy): the letters do not appear beside the sentence they back up. In the assembled paragraph, the print view and the exports, all the letters (a, b, c…) are added together after the whole contribution, and the list of items follows. The tool has no link between an item and a sentence. The explanation promises more than the tool does.
  - **Proposal** INFERRED:
    1. **Summarize on entry**: the writing fields shrink and a read-only "What you wrote" block (the assembled paragraph) sits at the top of the evidence area, so you can read the contribution while choosing proof. Reopens on click.
    2. **Kinds first, shown as choices**: when you add an item, the eight types show as small chips with a four-word example each (for example "Policy or practice uptake: a policy, guideline or program that adopted your work"). None pre-selected. Picking a type changes the prompt in the text line (a policy asks who adopted it; a dataset asks what it holds).
    3. **Then the item, then two lines on why it matters** (as today).
    4. **Explanation**, set apart from the fields, leading with the purpose. Draft wording INFERRED: "Evidence backs up what you have just described. Add the items a reviewer could check: a paper, a policy or program that adopted your work, coverage, a dataset, an award. Add as many as you need. Each item gets a letter, and the letters follow the contribution in your draft." (matches what the tool does today)
    5. The guide link "More kinds of evidence that count" (anchor `difference`, official page) moves here, from the example box.
    6. **Option** (a feature, not a fix): let each item say which part it backs (what you did, outputs, what changed), so the letter can sit after that sentence. This would make the original wording true. Worth it only if testers want it; the cheaper fix is the wording above.
  - **Not checked**: whether the guide says evidence is required for each contribution. The Review step has a coverage line for "evidence attached to at least one contribution", so the tool treats it as expected. Check the official guide before wording it as optional or required.
- **decision** (Prem): tune the evidence design during production.
- **question** (Prem): is "Assemble — see your material as one paragraph" the same function as the summary shown on entering evidence (the whole card shrinks so you can read it all, with a button to unpack and edit)? **Yes, the same function.** It is the assembled paragraph the Assemble link opens today, at the bottom of each card, behind a toggle. The new use: it opens by itself when evidence starts, as the read-only summary, with an **Edit** button that unpacks the fields again. The standalone "Assemble" link goes away.
  - Keep from today's version INFERRED: the muted joins between sentences ("to address this →") as suggestions; the warnings about gaps (an empty stakes or outcomes field), because they work as feedback at the moment you can still fix them.
- **question** (Prem): do we need "or experience" on the "+ Add another contribution or experience" button? Message cut off at "We could double…" (read as "double-check").
  - **Checked** the official guide: the section is named "Most significant contributions and experiences" and says "Up to 10 contributions or experiences". It does not define the difference.
  - Recommendation INFERRED: keep the funder's words in the heading and the instruction, so researchers see the same terms as on the form; shorten the button to "+ Add a contribution". The instruction already says experiences count.
- **next** (not yet discussed, now covered above): each contribution card has about ten fields at once (headline, how involved, role, stakes, what you did, outputs, what changed, what could change, an optional moment, evidence). One question at a time inside a card is the next thing to walk.
- **Proposed order** INFERRED, top to bottom: slim "Tailored for" line → heading (official name) → instruction with the contributions link → three closed example controls → first contribution card, one question at a time → "Add another" → closing note about ordering → "Mentorship →".

## 4. Mentorship

Walked on 2026-10-27, screen top to bottom. Today's order (code): "Tailored for" bar → "Step · Supervisory and mentorship activities" label → heading "Who you trained, and how you mentor" → instruction → guide link "What counts as mentorship activity" → early-career note (only if you chose Early career) → worked example (open in full) → totals grid (four boxes) → trainee rows → three questions (one practice, who gets into your group, who else you mentor) → "Now the personal statement →".

- **decision** (Prem): the forward button names the next step, not "Continue". Here: **Personal statement →** (for the CV-FRQ: **Background and skills →**). Same rule as the other steps.
- **Heading** INFERRED: use the official section name as the heading, as for Contributions: "Supervisory and mentorship activities" (official guide, section 3). Drop the "Step ·" label. The plain line "Who you trained, and how you mentor" can become the first line of the instruction.
- **Instruction** INFERRED: keep the idea, trim the mechanics ("Start with the totals, then make it concrete" is what the screen's sequence now shows). The sentence about formal and informal mentoring matches the guide ("broader than formal graduate supervision").
- **Early-career note**: keep as is. It appears only when the researcher chose Early career, so it already works as feedback.
- **Worked example**: make it a closed control ("See a finished example"), same as Contributions. **Finding**: there is one example, written for Social sciences, and the title says so, whatever discipline was chosen. Contributions have 70 examples by field, stage and work mode. Decide later whether Mentorship needs examples by field; not now.
- **Totals** (four boxes: doctoral, master's, postdoctoral, undergraduate research): label says "people you've trained in the last five years". **Unverified**: I could not find "five years" in the official guide's text. It may come from the Tri-agency form instructions, which this tool does not store. Check the source before keeping it, or drop the time frame from the label.
- **People you trained**: each person is up to seven fields (stage, sector, organization, unit, prizes, why it matters). INFERRED proposal: treat each person as a small grey card with the same pattern as contributions: static boxes, the open field in full, filled ones shrinking to label and answer. Group them: stage; where they went (sector, organization, unit); prizes (optional); why this example matters (optional). "Add another person" stays.
- **Three practice questions**: same pattern as the contribution card: open in full when in it, shrink to label and answer after.
- **Rail metric** INFERRED: for Mentorship, the sum of the four totals ("24 trained"); if the totals are empty, the number of people described ("2 people described").
- **Sequence kept**: totals, then people, then practice. The lede says one person you trained and where they went is the most persuasive thing; that stays the guidance, not a reorder.

- **decision** (Prem): keep every question that needs Eli's expertise as a separate list, to send to Eli after the walkthrough. Started: `ncv-v6-questions-for-eli.md` (7 so far: five-year window, evidence required, evidence letters, "contributions or experiences", self-assessment marks, competition year, mentorship example by field). Not sent. Add to it as we go.
- **decision** (Prem): apply to Mentorship the same pattern as Contributions (static boxes, open field in full, filled fields shrink to label and answer), and take out the same extras and titles as there.
- **idea** (Prem, worked example "Show the skeleton"): an amazing function; emphasize it, label it properly, put it above the "this is all fictional" note, and explain what it does.
  - **What it does** (code): it colours each sentence of the example by the job it does (stakes, role, what you did, outputs, what changed, what could change) and shows a colour legend. Today it is a small underlined text link at the very bottom of the box, below the fiction note, so it is easy to miss. "Skeleton" is also jargon.
  - **Proposal** INFERRED: a real button (not a text link) at the top of the example box, above the fiction note: label **See how it's built** with a one-line explanation beside it: "Each sentence does one of six jobs. Switch this on to colour them." Toggled state: **Hide the colours**. The colour legend appears with it. The fiction note drops below as a small footer. Label alternatives: "Colour the six jobs", "Show what each sentence does". Prem picks.
  - **decision** (Prem, simplifies the proposal above; message cut off at "so it's…", read as "so it's clear whether it is on"): label **See how it's built**, as a **toggle switch** at the top of the example box. No explanation line; the colours and the legend that appear speak for themselves. The label stays the same on and off; the switch shows the state. Build note INFERRED: a real switch control (role "switch", on/off announced to screen readers), off on arrival.
  - Applies to both worked examples (contributions, mentorship) and the two-field example.

- **idea** (Prem, Mentorship layout): the screen is jumbled. The totals (four numbers) and the people (detailed rows) look like two unrelated forms, and it is unclear that the numbers are a summary and the people are where you fill in detail. Should typing a number create that many person forms? Maybe the numbers are only a tag and go up as you add people. Make the relationship clear: a dashboard or summary versus where you fill in. Use the same look as Contributions: each person a clear box; "Add another person" the same wide button as "Add a contribution".
  - **Recommendation** INFERRED: do **not** create a form for every counted person. A researcher with 24 trainees would face 24 forms, and the guide asks for where "a few" went. Instead, make the two layers explicit:
    1. **Totals as a small dashboard** at the top: four number tiles (doctoral, master's, postdoctoral, undergraduate research) typed by the researcher, large digits, one grey box. Title in plain words about the numbers (the "five years" wording waits on Eli's answer, see questions list #1).
    2. **People as grey cards** below, titled for what they are: "Tell us about a few of them". A counter ties the layers together: "2 of 24 described". With no totals typed, it reads "2 people described". This shows the cards are examples drawn from the total, not the whole count.
    3. **"+ Add a person"** uses the same wide dashed button as "+ Add a contribution".
    4. **How you mentor** (the three practice questions) as a third grey card, with the same open-in-full, shrink-after pattern.
  - **Gentle feedback** INFERRED: if more people are described at a stage than the total for that stage ("3 doctoral described, total 2"), show a quiet line under the tiles. It only works if the stage is a choice, not free text.
  - **question** open: make "stage" a choice (Doctoral, Master's, Postdoctoral, Undergraduate research, Other) so it matches the totals, or keep free text? Choices enable the feedback above and the counter by stage. Cost: the trainee row shape changes (`stage` becomes a code), so saved drafts need a small migration, and the V5x portfolio file needs its `version` bumped on merge. Free text keeps today's shape.
  - **Consistency rule for the whole tool** INFERRED: every repeating thing (contributions, people, evidence items) is a grey card with the same header, the same field pattern and the same wide "add" button. Step titles use the official section name. One layout vocabulary across steps.

- **decision** (Prem): **stage** becomes a drop-down, the same as sector (sector already is one). Fixed information is chosen, not typed. Think about the layout.
  - **Options** INFERRED: stage = Doctoral, Master's, Postdoctoral, Undergraduate research, Other (with a short text box if Other); these match the four totals. Sector (today's list, unchanged) = University, Industry, Community agency, Government, Other.
  - **Layout of a person card** INFERRED, using the grey card of Contributions (labels above each field, not placeholders only, so a label does not vanish when you type):

        Person 1 · Doctoral → University of Toronto, Geography           [×]
        ┌────────────────────────────┬─────────────────────────────┐
        │ When you trained them      │ Where are they now?         │
        │ [ Doctoral          ▾ ]    │ [ University         ▾ ]    │
        ├────────────────────────────┼─────────────────────────────┤
        │ University                 │ Department or discipline    │   ← labels follow the sector
        │ [                      ]   │ [                       ]   │
        └────────────────────────────┴─────────────────────────────┘
        Prizes or scholarships (optional)
        [ one line                                                ]
        Why this example matters (optional)
        [ one line                                                ]

  - **Sequence** INFERRED: stage and sector first (two drop-downs, side by side); the organization and unit appear after the sector is chosen, with labels that match it (University and Department or discipline for a university; Organization and Unit or subdivision otherwise); prizes and "why it matters" sit below as optional single lines. On a phone the pairs stack.
  - **Header** INFERRED: the card header builds as you fill it ("Person 1 · Doctoral → University of Toronto, Geography"), as the contribution header shows the headline. The remove control stays at the right.
  - **Label wording** INFERRED: "When you trained them" for stage (it is their stage when you supervised, not their current job), and "Where are they now?" for sector.
  - **Migration** (build note): saved drafts hold free-text stage. On load, map clear matches (PhD, doctoral, Master's, MSc, postdoc, undergrad) to the choice; put anything else under Other with the old text kept in the Other box. No saved answer is lost.

## 5. Personal statement / Background and skills

Walked on 2026-10-27, screen top to bottom, applying what we settled on Contributions and Mentorship. Today's order (code): "Tailored for" bar → "Step · Personal statement (written last)" label → heading "Who you are, and the thread through your work" → long instruction (different text for TCV and CV-FRQ) → guide link → "Why last?" box → "A read across your N contributions" box (only when contributions share words) → worked example (open in full, Social sciences) → "Finish this line: I am a … at … My work is in …" → the prompts (problem, strands, how you got here, standing, why this competition, how you complement the team for the CV-FRQ only, what's next) → "Now put your contributions in order →".

- **Heading** INFERRED: the official section name: **Personal statement** for the TCV; for the CV-FRQ the official name is "The candidate's background and skills" (the rail already says "Background and skills"). Drop the "Step ·" label. "Who you are, and the thread through your work" becomes the first line of the instruction.
- **Repetition found**: "written last" is said three times: the label, the instruction ("it is the last thing you write") and the "Why last?" box. INFERRED fix: one sentence in the instruction ("It appears first in the finished CV and is the last thing you write, because it gathers what you wrote in your contributions."). Drop the label and the box. The "if a prompt feels hard, the answer is usually already in one of your contributions" line stays; it works as the support line.
- **Instruction length**: the TCV and CV-FRQ versions run long. INFERRED: keep to two or three sentences; the guide link carries the rest. The CV-FRQ extras (fit with the program's objectives, how your work complements the team) stay as they are, since they are funder facts; only the surrounding wording tightens.
- **Cross-read box** ("A read across your 4 contributions"): it is already conditional (shows only when contributions share words), so it follows the rule. INFERRED: move it from the top of the screen to sit beside the "problem" and "strands" questions, which is what it refers to, so it appears when it can help. Keep the line saying it was worked out on this device.
- **Worked example**: closed control + the "See how it's built" toggle, like the others. Finding (same as Mentorship): one example, written for Social sciences, shown to everyone. Added to the Eli list (#7).
- **One grey card "Your statement"** holds the anchor line and the prompts, using the Contributions pattern: static boxes, the open field in full with its explanation set apart, filled fields shrink to label and answer. Counter "3 of 7 answered" (the anchor line counts as one; the CV-FRQ has 8).
- **Anchor line** ("I am a [role] at [institution]. My work is in [field]."): first question in the card, as three short fields in one sentence. The "a/an" already adjusts to the role. No pre-fill: the Profile holds a broad field (for example Social sciences), which is too wide for "My work is in".
- **Competition payoff**: "Why this competition" uses the competition name the Profile now requires, so the label reads with the researcher's own competition. If they chose Undecided, the prompt keeps today's wording for no competition.
- **Standing prompt**: keep the funder guard in its explanation word for word (Journal Impact Factor, h-index). In the new layout it sits in the separate explanation line, not in the question. Label wording of two prompts ("Strands", "Standing") may be shorthand researchers do not use; check with testers.
- **"Your statement so far" strip** INFERRED: the same growing preview as on Contributions (anchor line first, then each answer as it is written). Optional. It is the reward for answering and shows how the pieces read together. Prem decides.
- **decision** (Prem): try the "Your statement so far" strip; decide after seeing it whether it is too noisy. Build it so it can be switched off in one place. Same trial rule as the rail metrics.
- **Button**: **Order of contributions →** (the rule: name the next step), replacing "Now put your contributions in order →".
- **Rail metric** INFERRED: "4 of 7 answered", and it turns green once anything is answered (the new rule).

- **idea** (Prem, rail grouping): Order and Review are different in kind from the steps before them. Those take your input; these work on what you wrote. Show the difference in the rail and in how the steps are labelled. Open to suggestions.
  - **Recommendation** INFERRED: group the rail under the "My application" heading into two groups, and move Feedback out of the application altogether:
    - **Your answers**: Profile · Contributions · Mentorship · Personal statement (dots, with the small metrics we planned)
    - **Your draft**: Order of contributions · Review and export (a different marker: a small square or an icon for each, an arrow pair for Order and a tick for Review, so they read as tools, not as more questions)
    - **Feedback**: a quiet separate link at the foot of the rail, labelled for what it is ("Tell us what you think"), because it is about the tool, not about the CV.
  - **Muted until useful**: the Your draft group is visible from the start but muted, with a one-line caption ("Opens as you add contributions"), and comes to full strength once there is something to order. Fits the rule that things respond to what you do; the rail keeps its shape.
  - **"Draft so far" tally** (words and rough pages, planned for the foot of the rail) sits under the Your draft group, where it belongs.
  - **Labels** INFERRED: "Order of contributions" stays (it names the thing); "Review & export" becomes "Review and export".
  - **Alternative** (bigger, later): merge Order into Review as one workspace where the whole draft is shown and the contributions are dragged into order in place. Less to learn, but a larger change to the screens; not now.
  - **decision** (Prem): group names **Your answers** and **Draft** ("Draft", not "Your draft", so "your" is not repeated so often). "Write / Finish" rejected.
  - **idea** (Prem): likes the feeling of moving into review, as in "you're ready to review your CV". Message cut off at "So both can…". INFERRED reading: the button leaving Order reads **Review your CV →**, and the Review screen opens with the same sense of arrival. It still begins with the step's name, so it stays within the rule that the forward button names the next step. Open: whether the rail label should also change from "Review and export".
  - ~~question open~~ (settled above): group names. Option 1: "Your answers" / "Your draft". Option 2: "Write" / "Finish". Lean: option 1, since it matches "My application" and the words researchers use for their own material.

## 6. Order of contributions

Walked on 2026-10-27; Prem left the design to me, to follow the language we built on the other steps. Everything below is INFERRED, for Prem to override.

Today (code): "Tailored for" bar → "Step · Order of contributions" label → heading "Put your contributions in order" → instruction → a box "Two questions set the order" (first: which runs across most of your work; last: which leads most directly into the project you are applying for, with the competition name if given) → a numbered list: each row is a headline, a gist of up to 140 characters, "Opens the section" / "Closes the section" tags, and ↑ ↓ buttons → "This order works" (becomes "✓ Order set") → "Now review →". With fewer than two contributions it shows a one-line message instead of the list.

- **Heading and label**: heading "Order of contributions" (same as the rail); the "Step ·" label goes. One-line instruction kept: "The section reads as one account of your work, so the order carries meaning. The order you set here is the order in your draft and in every export."
- **Put the guidance where it applies**: drop the box of two questions. Show each as a slot label inside the list: above the first card "First: the contribution that runs across most of your work. It opens the section and frames the others."; above the last card "Last: the one that leads most directly into **[competition name]**. It closes the section."; between them "The ones in between follow the thread from the first to the last." If the competition is Undecided, the last slot keeps today's wording ("the project you are applying for"). This replaces the "Opens / Closes" tags.
- **Each contribution a grey card**, the same card as elsewhere: number and headline in the header, a two-line gist (stakes, else what you did), and the move controls at the right. No new vocabulary.
- **Moving**: keep ↑ ↓ buttons (they work by keyboard, touch and screen reader). Add drag-and-drop with a visible handle as the quick way; cards slide to their new place with a short motion (off for people who ask for reduced motion). Try it; if drag is fiddly on phones, the buttons carry it.
- **Drop "This order works"**: with the new rule (a step turns green once you have been there and done something), a confirm button is an extra click for people whose order is already right. The step turns green when opened; moving a card is a bonus, not a requirement. Forward button: **Review →**; back: **← Personal statement**.
- **Numbering note** (consequence, from the code): moving a contribution reorders the contributions themselves, so the numbers in the Contributions step follow this order. Say so in one small line: "The numbers in Contributions follow this order."
- **Fewer than two contributions**: keep it short and helpful: "You have one contribution, so the order is already set." with a link "+ Add a contribution" that goes to Contributions, and the forward button. Open for later: hide this step from the rail until there are two; INFERRED lean: keep it visible so the rail does not change shape.
- **Nothing else added**: no counters, no preview strip. A short step; the cards are the whole screen.

## 7. Review and export

- **decision** (Prem): Review opens with the order of contributions (the sequence), so **Order is no longer its own step**; it becomes the first block of Review. Export/download becomes a **separate step**, because Review and export are "too mashed up". This supersedes the Order-as-a-step notes above for the rail; the card design for ordering carries over. (Eli's item still holds: the order is set after the personal statement.)
- **Today's Review screen** (code), all on one long page: coverage list (about 14 rows, ✓ done / not yet) → format note (template, font, page limit) → length check → "Your open flags" → self-check (7 tick boxes) → "Questions for your advisor" → read-only draft preview → five buttons (Download .txt, Word .doc, advisor packet, print view, Copy draft) → three "Copy section" buttons → contact line → "Before you go: Feedback" nudge → "Give feedback on this session →". Checking and exporting are mixed, and a researcher meets five download buttons before they have finished checking.
- **New rail, group Draft**: **Review** · **Export**. Group Your answers: Profile · Contributions · Mentorship · Personal statement. Feedback stays a quiet link at the foot. Buttons: Personal statement → **Review your CV →**; Review → **Export →**; Export → **Feedback →**. (The "Review your CV →" label moves from leaving Order to leaving the Personal statement.)

### Review (step) INFERRED design

  1. **Heading** "Review your CV". One line: "Put your contributions in the order a reviewer should read them, then see what is missing."
  2. **Order of contributions** first: the grey cards with First / Last slot labels (the design above), drag or ↑ ↓. Each card also carries a small **mark for your advisor** control ("Needs work" / "Ask my advisor", with a note), which is where the flags moved (the decision made earlier). One card, three jobs: order, mark, open to edit.
  3. **What is still missing**: replaces the 14-row coverage list. Show only what is missing, each with a link that jumps to that field; when nothing is missing, one line: "Nothing missing." This avoids a wall of ticks that repeat what the rail already shows. The "order set" row goes.
  4. **Length**: one small meter ("about 1,240 words, roughly 2.5 of 5 pages"), with the same cautions as today (rough; the template decides).
  5. **For your advisor**: the marks gathered, plus the "Questions for your advisor" box. They feed the advisor packet, downloaded in Export.
  6. **Self-check** (the seven qualities from the guide): kept as a checklist card; INFERRED lean keep, since it comes from the guide's "What reviewers look for". To test whether people tick it; otherwise fold it.

### Export (step) INFERRED design

  1. **Heading** "Export your draft". One line on what you can take with you.
  2. **Preview**: the read-only draft text at the top, so you see what will leave the tool.
  3. **Three grey cards**:
     - **Download or print**: Download for Word (.doc) as the primary button; Download as text (.txt); Open print view; Copy draft.
     - **Paste into the template**: the format note (template, font, margins, page limit) and the three "Copy [section name]" buttons, one section at a time.
     - **Share with an advisor**: Download advisor packet (.txt), with a line saying it contains your marks and questions.
  4. **Keep your work** (new; links to the Continue draft idea): **Save a draft file** (JSON), so a researcher can reopen it later with Continue draft. This is where that button belongs; also offered as a small "Save draft" in the rail foot.
  5. **Support**: the contact line stays as the closing handoff (named team, an email address).
  6. **Feedback nudge** stays, shorter, then the button **Feedback →**.
- **Green rule**: Review turns green once opened; Export turns green once anything is downloaded, copied or saved.
- **Unverified** (as before): the Word file (.doc is HTML saved with a .doc name) has not been opened in Word.

### Review and Export, second pass (2026-10-27, Prem; supersedes the Review and Export sketches above where they differ)

- **decision** (Prem): **take out the advisor features for now**: the "Questions for your advisor" box, the advisor packet download, and, as a consequence, the ✓ / ✗ / ? marks and the "open flags" list (their only destination was the packet and that list). The data stays in saved drafts, so nothing is lost and the features can return. Supersedes the "marks per contribution in Review" decision and the flag-click logging idea. Eli list question #5 is withdrawn.
- **decision** (Prem): the working draft goes **at the top of Review**, read-only, and can be **shrunk** straight away.
- **decision** (Prem): the review dashboard follows it; the self-check closes with a reminder about the agency's template.
- **Review, new order** INFERRED:
  1. Heading "Review your CV" and one line.
  2. **Your working draft**: open on arrival at a fixed height (about 14 lines, scrolls inside) with a Shrink / Show control. Updates live as the order below changes.
  3. **Order of contributions**: the grey cards with First / Last slot labels (no marks now).
  4. **At a glance**: a small dashboard card: what is still missing (each item a link to the field; "Nothing missing" when complete) and the length meter ("about 1,240 words, roughly 2.5 of 5 pages").
  5. **Self-check before you export**: the seven ticks, then a closing line. INFERRED: reuse the format note's own wording from the guide ("Prepare your CV in the current version of the template your agency provides, keep the formatting it sets, and do not exceed the page limit: 5 pages in English, 6 in French") so the strength of the instruction stays as the guide words it; no new "must".
  6. Buttons: ← Personal statement · Export →.
- **Export, new design** INFERRED:
  1. Heading "Export your draft". A **Set up for** line under it: "SSHRC · Tri-agency CV · 12-point Arial · [Change]" (Change goes to the Profile). It shows what the file will use, from the profile.
  2. **Card: Download**: a two-way choice **Word (.doc)** (recommended) or **Plain text (.txt)**, one **Download** button, and under it **Print view** and **Copy draft** as quiet secondary actions in the same card. One primary action; three ways to take the draft out. Replaces five loose buttons.
  3. **Card: Paste into the template, one section at a time**: the three "Copy [section]" buttons, and the format note.
  4. **Card: Keep your work**: **Save a draft file**, with its explanation: "This saves your whole draft as a small file on your computer. Keep it somewhere safe. Later, choose Continue draft on the start page and open the file to carry on. It is not a Word file. Clearing your browser data erases the draft stored in the tool, so a saved file is your backup."
  5. Closing: the contact line and the Email us nudge. No forward button; back to Review.
- **question** (Prem): can the Word download carry the agency's template, chosen from what the researcher is doing?
  - **What exists** (code): the Word and print files are already set from the profile: the agency's font (Arial for SSHRC; Times New Roman for NSERC, CIHR, FRQ and Other), a Letter page with 2 cm margins, and the agency's own section names (the CV-FRQ with the French names). The file says "This is not the template" and tells the researcher to paste into the current one.
  - **What it cannot do**: contain the agency's official template. Agencies update their templates, and the guide says to use the current version, so a copy in our file would go stale and we may not redistribute it. INFERRED lean: do not embed.
  - **INFERRED options**: (a) keep a template-style file chosen from the profile (done), with the visible Set up for line and the Change link; (b) add the CV-FRQ's header and footer rule (name in the header, document title in the footer; it needs the researcher's name, which the tool does not ask for, so it would be an optional field in Export, kept on the device); (c) a "Get the current template" link per agency in Export, once Eli or the team confirms the addresses; (d) a real .docx file with proper styles and header/footer, instead of today's .doc, which is HTML saved with a .doc name. (d) is the most work.
  - **Unverified**: the current .doc has not been opened in Word. Test it there before investing in (d).
- **result** (Prem, 2026-10-27): the downloaded Word file opens in Word. Prem had not filled anything in, so could not tell whether the "template" shows. (Message cut off at "…if the template is there to…".)
  - **What an empty draft contains** (code): one grey italic note, then three bare headings (Personal statement; Most significant contributions and experiences; Supervisory and mentorship activities), and nothing else. So an empty download shows almost nothing of a template.
  - **Sample made**: `sample-word-export-sshrc.doc` in this folder, produced by the tool itself from a made-up SSHRC draft (two contributions, a statement, one trainee). Open it in Word to see the real thing.
  - **What the file is, with content** INFERRED from the output: not a form or the funder's template. It is a plain document with the agency's font (12-point Arial for SSHRC), a Letter page with 2 cm margins, the agency's section names, a delete-me note at the top, and each answer as running text. The Personal statement answers appear as bare paragraphs with no prompts; each contribution is a headline, a role line in italics, the sentences joined together, and an evidence box. Evidence letters restart at "a" in every contribution.
  - **Finding**: the Mentorship line in the file says "Totals (last five years)" in the export code itself, so the five-year wording also needs the answer to Eli's question #1.
- **feedback** (Prem, after opening the sample): looks pretty good. The personal statement has extra spacing between lines; the contributions look fine. Do what we can for now and test it.
  - **Cause** INFERRED from the code: each statement answer is written as its own paragraph (seven or so short paragraphs, each followed by 6 pt), while each contribution is one run-on paragraph. The spacing is the same everywhere; the statement just has many paragraph breaks.
  - **Fix options for the build**: (a) join the statement answers into one flowing paragraph after the "I am a…" line (closest to how contributions look); (b) keep them as paragraphs and set the gap to zero with a small first-line indent. Lean (a), then test in Word. The same joining should apply to the print view and the text export.
  - **Plan**: ship the template-style file as it is, plus the Set up for line, and test it with a researcher.
- **Parked for later** (also in `narrative-cv-ideas.md`): advisor questions, per-contribution marks, advisor packet.

## 8. Feedback

- **decision** (Prem): **remove the Feedback step** ("no one is really using it"). In its place, the closing nudge in Export asks for feedback by email: send a quick note about what the experience was like and, if willing, a copy of the narrative CV to help improve the tool.
  - **Rail**: Feedback leaves the rail (including the quiet link planned for the foot). Export becomes the last step: back to Review, no forward button. Supersedes the "Export → Feedback →" button chain and the "flag-click counts in the session summary" idea (there will be no summary).
  - **Hide, do not delete** INFERRED: keep the feedback code in the file behind one switch, so the step can come back and the V5x portfolio merge stays simple.
  - **Consequences found** INFERRED:
    1. **The tool stops talking to the network.** The only network calls were the feedback send and its read-back. The privacy line ("The Feedback step at the end sends only what you write there…") must change to something simpler: nothing leaves this device unless you email it. A real improvement.
    2. **"Note for the team" in the banner** has no destination once the step goes (its notes went out with the feedback). INFERRED: turn it into an **Email us** link with a ready-made subject line, so there is one route for feedback.
    3. **The /triage workflow** reads tool feedback rows from the project sheet (rows tagged `page=ncv-tool-v6`). With no in-tool feedback, that source stops; feedback arrives by email and is read by hand. Worth knowing before the step is hidden.
    4. **Sending a copy of a CV is sensitive.** Real CVs are private. A `mailto:` link cannot attach a file, so the researcher downloads the draft and attaches it themselves. Say plainly what happens to a copy: who reads it, how long it is kept, what it is used for. **Needs Prem's (and Concordia's) answer** before the sentence is written; placeholder in the draft below.
    5. **Which file to ask for** INFERRED: the draft file (.json from Save a draft file) holds everything including the profile; the Word or text draft is easier for a person to read. Lean: ask for the Word or text draft; offer the draft file if a researcher wants to share the full state.
  - **decision** (Prem): **do not ask for a copy of the CV** in the nudge; it adds complication. Only invite feedback. If someone writes back, the team can ask for a copy then. This removes consequence 4 (the privacy sentence about copies) and consequence 5 (which file to ask for) from the build. Message cut off at "But we'll do that as a…" (read as "as a future item").
  - **future** (Prem): keep a note to improve the system using real narrative CVs, once there is a way to do it, planned as its own later piece of work. Not for V6. Open: it will need a consent and data-handling design (who reads, how long kept, what for), which is the question that was set aside here.
  - **Draft wording, revised** INFERRED: "We would like to hear how this went for you. Send a short note to impact@concordia.ca about your experience with the tool, and what would make it better." Button: **Email us** (subject "Narrative CV tool: my experience"; body prompts "What was it like? What would make it better?").
  - ~~Draft wording~~ (superseded by the revised wording above; kept for the record), for Prem to edit (condition first; named team and address; says when it is optional):
    - "We would like to hear how this went for you. Send a short note to impact@concordia.ca about your experience with the tool. If you are willing to help us improve it, you can also attach a copy of your narrative CV: download your draft above, then attach it to your email. [Sentence on who reads a copy, how long it is kept and what it is used for, to confirm.]"
    - Button: **Email us** (opens a message to impact@concordia.ca with the subject "Narrative CV tool: my experience" and two prompts in the body: "What was it like? What would make it better?").
  - **Open for Eli / team**: does anyone still want the twelve feedback questions, or the session log (steps, time, exports)? Not adding to the Eli list unless Prem says so.

## Map itself (flow-map tool, not the NCV tool)

- **idea/done** 2026-10-27: clicking a node keeps it lit; click again to release (was distracting when hover moved around).
