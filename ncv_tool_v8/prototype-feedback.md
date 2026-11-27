# Prototype feedback

Prem's notes on the V8 tool. Kept here until Prem says to build them.

## Notes of 2026-11-13 (after V8.10) — built in V8.11

Note 1: the words are not in the tool since V8.9; a fresh load shows no such step. Notes 2 and 3 are built; the name choices are listed as INFERRED in the README.

1. **"Finish your test" heading (Draft group).** Screenshot shows the heading "Finish your test" under DRAFT, with a grey highlight behind it. That step was removed in V8.9, and the words no longer appear in the tool. The screenshot is probably from a page loaded before 8.9; to check on a fresh load before building.

2. **Export: the "Set up for:" box.**
   - Put the Change button to the left of the label, with a bigger triangle.
   - Change the label "Set up for:" to "Template:" in this view.
   - Less empty space in the box; tighten the layout.
   - Current: `Set up for: [▸ Change]` on one line, then "SSHRC · Tri-agency CV · 12-point Arial" below.

3. **The Profile box (above My narrative CV).**
   - The same layout change as note 2: Change button first, bigger triangle, less empty space.
   - Ask people to name their profile, so the line reads: `[▸ Change]  Profile: "name"`.
   - Current: `Profile: [▸ Change]`, then the pills (SSHRC · Tri-agency CV, Competition undecided, Mid career, Health / clinical + Social sciences, Community-engaged) on two rows.
   - Open for the build: where the name is asked (Setup, or in the box itself), what shows before a name is given, and whether the name goes in the export.

## Note of 2026-11-13 (after V8.11): one name, set when the draft is created

Prem: the draft name matters; the profile name should be set when the profile is created, be part of what is saved, and the file names should follow clear data points.

Found in V8.11:
- There is one name (`draftName`). It is asked on the start page only once a draft exists, and since V8.11 in the Profile box. Setup does not ask for it.
- It is saved in the browser and in the draft file (.json), and comes back when the file is loaded.
- File names do not agree: the draft file uses name + agency + date and time; the text file and the Word file use the agency only (`narrative-cv-draft-sshrc.txt`), so every download has the same name.

Proposed (waiting on Prem):
1. One name, called "Draft name" everywhere.
2. Asked in Setup, at the end of the six questions, optional, with a suggestion from the profile (for example "SSHRC Insight Grants").
3. The Profile box shows it as text: `[▸ Change] Profile: SSHRC Insight Grants`; Change opens the panel, which edits the name with the six answers. The start page keeps its box for the same name.
4. Every file uses one pattern: `narrative-cv-{name}-{date}` (the name made file-safe; the agency if no name), plus the time for the draft file. Text, Word and draft file then sort together.

### Follow-up, 2026-11-13 (notes only, not to build yet)

Prem: if the draft name is the file name, what happens when the tester leaves it empty? Either the name is mandatory, so files are named properly, or profiles are not named at all. Decide one.

What happens today with no name: the draft file is `narrative-cv-draft-sshrc-2026-11-13-1405.json` (agency, date, time); the text and Word files are `narrative-cv-draft-sshrc.txt` / `.doc` (agency only).

The two options to decide between:
- **A. Name is required.** Asked at the end of Setup, pre-filled from the profile (for example "SSHRC Insight Grants") so it is never empty unless the tester clears it; Setup cannot finish with it empty. Files: `narrative-cv-{name}-{date}`. The Profile box shows the name.
- **B. No name.** Remove the draft-name box from the start page and the Profile box. Files are named from the profile: `narrative-cv-{agency}-{competition}-{date}`, for example `narrative-cv-sshrc-insight-grants-2026-11-13.txt`. The Profile box shows only the pills.

Recommendation (Claude, 2026-11-13, for Prem to confirm): **B, no name.** The profile already names the draft: the agency and the competition are what tell two drafts apart, and they are always set by the end of Setup. No extra field, nothing to make mandatory, and no empty case. File names: `narrative-cv-{agency}-{competition}-{date}` for all three files (the draft file adds the time); with the competition undecided, `narrative-cv-{agency}-{date}`. The Profile box keeps `[▸ Change] Profile:` and the pills. The start page's "Continue" card names the draft from the profile too ("Continue SSHRC Insight Grants").

Decided (Prem, 2026-11-13): **no name.** Keep the Profile box with Change and the pills; the V8.11 name box comes out.

Open point (Prem): the funding call is not required in Setup (the agency can be "not sure yet", the competition "undecided"), so what are the files called then?
Proposed fallback (Claude, for Prem to confirm), using whatever is set, in this order:
- agency and competition set: `narrative-cv-sshrc-insight-grants-2026-11-13.txt`
- agency only: `narrative-cv-sshrc-2026-11-13.txt`
- neither: `narrative-cv-draft-2026-11-13.txt`
The draft file (.json) adds the time in every case (`…-2026-11-13-1405.json`), so two saves never share a name. The start page reads "Continue SSHRC Insight Grants", "Continue your SSHRC draft" or "Continue your draft".

Revised (Prem, 2026-11-13): let people **name their narrative CV at the start**, so the name is part of the profile and of the file name. (Replaces "no name" above.)

Proposal for the build (Claude, for Prem to confirm):
- **Where:** Setup, as part of the profile, with the six questions. Label: "What would you like to call this narrative CV?" Example under it: "For example, SSHRC Insight Grant, fall 2026".
- **Profile box:** `[▸ Change] Profile: {name}`, then the pills. Change edits the name with the six answers. The V8.11 typing box in the Profile box and the start page's separate "Draft name" box both go; the name lives in one place.
- **Saved:** with the profile, in the browser and in the draft file (already the case for `draftName`; a loaded file brings it back).
- **File names:** `narrative-cv-{name}-{date}` for the text, Word and draft files (draft file adds the time).
- **If left empty:** the fallback table above (agency + competition, then agency, then "draft"). Prem said earlier it should be mandatory; the fallback means it can stay optional without bad file names. Prem to choose: required, or optional with the fallback.
- **Start page:** "Continue {name}".

## Note of 2026-11-13: mark optional questions in the question itself

Prem (screenshot of "Which one occasion shows the work in use by a specific person or group?"): when a question is optional, say so in the heading, in brackets after the question, for example "Which one occasion shows the work in use by a specific person or group? (optional)". Today "Optional." sits in the middle of the help line under the box, where it is easy to miss.

For the build: apply to every optional question in the tool (One moment, and any other optional field or question), and take "Optional." out of the help lines that carry it. Keep the screen-reader name of each box in step with the visible heading.

## Note of 2026-11-13: a private label for each person in Mentorship

Prem (screenshot of the Person A / Person B cards): the researcher should be able to give each person an identifier of their own, so they know who "Person A" is. The label is for the researcher only and never appears in the CV.

Found: no such field exists in V8.11; the cards are named "Person A", "Person B" and so on. The only earlier mention is in `narrative-cv-ideas.md` (line 80, the portfolio idea: initials only, to limit the risk if a file is lost). This note was not built before.

For the build (to confirm with Prem):
- A short box at the top of each card, for example "Your label for this person (not in your CV)", with an example such as initials or a project name.
- The card heading then reads "Person A (J.T.) · Postdoctoral → …"; the export, the Word file, the text file and the print view leave it out, and a test checks that.
- It is saved in the browser and in the draft file, like the rest of the card. Since the draft file may be emailed, suggest initials rather than full names.
- The heading keeps "(optional)" in brackets, per the note above.

## Note of 2026-11-13: plain wording, no "real"

Prem (screenshot of the Length card on Review): fix the language; drop words such as "real"; be straightforward and simple. Prem's wording for the card: "The length depends on the template, please review before submission."

Lines to change (V8.11):
- Length card on Review (line ~6262), now "About 500 to 600 words fill a page at 12 points. The real length depends on the template, so check it there before you submit." → "About 500 to 600 words fill a page at 12 points. The length depends on the template. Please review it before you submit."
- Length chart note (line ~6474), now "At 500 to 600 words a page. The template sets the real length." → the same two sentences as the card.
- One moment help lines (lines ~2950–2955), now "One real case in two sentences, …" → "One case in two sentences, …" (and "Optional." moves to the heading, per the note above).
- Tester question (line ~6990), "Would you use this tool for a real application?" → "Would you use this tool for an application?" (to confirm; here "real" separates a funding application from this test).

For the build: sweep the tool's copy for other filler of this kind ("real", "actual", "really", "just") and add the words to the register check, so they do not come back.

## Note of 2026-11-13: Order of contributions, and the order of the steps

Prem (screenshot of "Order of contributions" on Review): the section needs clear instructions. Should ordering come before the personal statement, as part of the thinking, then the statement, then Review? And on Review, At a glance then the order reads as if it belongs to reviewing. Prem asked for thoughts.

Claude's view (for Prem to decide):
- **Yes, move ordering before the statement.** Choosing the first contribution (the one that connects to most of the work) and the last (the one closest to the competition) is the same thinking the statement needs: its strands and "Why this competition". Ordering first gives the statement its outline.
- **Where:** at the foot of Contributions, as a closing card "Put your contributions in order", shown once there are two or more. Not a separate step: the tool had a separate Order step before, and it was folded into Review (old drafts saved on it still open on Review), so a new step would go back on that.
- **Review then checks only:** At a glance (what is missing, the length) first, then the working draft, the visuals, the self-check. A line "To change the order, go to Contributions" keeps it reachable.
- **Clearer instructions for the card** (draft wording):
  "Put your contributions in order. Contributions are numbered in this order in your CV.
  First: the one that connects to most of your work. It introduces the others.
  Last: the one closest to Insight Grants.
  In between: the rest, leading from the first to the last.
  Use ↑ and ↓ to move a contribution."
- Open for Prem: keep a copy of the order on Review as well, or only on Contributions.

## Note of 2026-11-13: replace "The six parts in each contribution"

Prem (screenshot of the six-parts grid on Review): the visual is not doing much; think of a visual that helps someone analyse their CV.

Why it does little: it shows that each part is filled, which the "8 of 8 answered" count on each card and At a glance already say. A full CV shows a grid of identical squares.

Proposals (Claude, for Prem to choose), built only from what the researcher wrote, descriptive like the other visuals (Prem, 2026-10-29), no scores:
1. **Where your words go (recommended to replace the grid).** One bar per contribution; each segment is the number of words in one part, in the same part colours. It shows balance at once: a contribution that spends most of its words on what you did and little on what already changed stands out. One summary line under it, for example "Across your contributions, 14% of the words describe what already changed." Speaks to the Significance self-check.
2. **Evidence for each contribution.** A grid of contributions by kind of evidence (dots), replacing or joining "Evidence by type". It shows which contribution has no outside evidence, and which rely on one kind only.
3. **Specific details.** For each contribution, how many numbers, dates and named organizations or places it gives, counted with the rules the tool already uses for the number message. Speaks to the Specificity self-check.
4. **Your work over time.** The years named in each contribution on one line from earliest to latest, to show the span and how recent the work is.

Open: which to build, and whether 2 replaces "Evidence by type". Each keeps Download image and a text version for screen readers.

Follow-up (Prem, 2026-11-13): the researcher has better insight into the order once they reach the end. So: before the statement, after it, or in Review as a kind of edit mode?

Claude's revised view (for Prem to decide): **keep it in Review, as its first task.** At the end the researcher has written everything, including the statement, and sees the whole draft. Review already shows the working draft, so a move shows in the draft at once; that is the edit mode. Review would read as two tasks in order:
1. "Put your contributions in order" (the card with the clearer instructions above, at the top of Review).
2. "Check your draft": At a glance (what is missing, the length), the working draft, the visuals, the self-check.
The statement step could add one line: "You will put your contributions in order on Review." This replaces the "move it to the foot of Contributions" idea above.

## Note of 2026-11-13: "What your draft contains" and the Review page

Prem (screenshot of "What your draft contains"): too much going on; maybe the charts open on request, or form a separate review section. Asked for a deep analysis of how the visuals can help the review.

Analysis: `ncv_tool_v8/review-visuals-analysis-2026-11-13.md`. In short: the five charts take about 45% of Review and sit apart from the self-check questions they could answer. Proposal: one section, "Check your draft as a reviewer would", one closed row per quality (Ownership, Significance, Specificity, Evidence, Selection, Mentorship, Coherence), each with a one-line fact from the draft, a chart behind "Show the chart" and the tick box. Five decisions for Prem are listed at the end of that file.

## Review visuals: Prem's answers (2026-11-13)

Mockups (outside the tool, built from the mock CV): `ncv_tool_v8/mock/review-visuals-mockups.html`. Analysis: `review-visuals-analysis-2026-11-13.md`.

- **Six-parts grid: drop.** "Not communicating anything."
- **Download image: drop for now**, until the visuals are useful.
- **Review by question:** explained and mocked (section 1 of the mockups); Prem to say yes or no after seeing it.
- **Length chart: rename to "Narrative composition breakdown"** (Prem's name). Mocked as one bar of words by section (statement, each contribution, Mentorship) on a scale of the page limit, with the line "The length depends on the template, please review before submission." Proposed home: At a glance, in place of the Length tile and the separate chart.
- **People trained: rethink the chart type and merge it with where people are now**, so the relationship shows. Mocked two ways: A, merged flow (levels on the left, destinations on the right, one line per described person; recommended); B, a ring chart (parts of the whole, but it cannot show destinations, so a second chart would stay).
- **Evidence: give it an insight.** Mocked: per contribution, evidence split into "Your own work" and "Others used or cited it", with the fact line "3 of 4 contributions show that someone else used or cited the work; contribution 4 shows your own work only." INFERRED: which evidence kinds count as "others used or cited it" (Policy / practice uptake, Media / public, Replication / citation); to confirm with Prem.
- **One new view from the researcher's input:** eight types listed and three mocked (section 3). Recommended: **Reach of change** (two pills per contribution, where it already changed and where it could go, from People to Field). Second: **Threads** (the statement's strands against the contributions; gives Coherence a view). Third: **Timeline of work and change** (typed years; fixes the counted-years limit, where contribution 3 shows the tribunal years 2015 to 2021).
- Note: the fact lines on the mockup page are computed there with a rough reading of the text, and differ from the rough figures first written in the analysis (numbers 5, 5, 1, 6; years 2015 to 2024). The mockup page's figures replace them.

## Review visuals: conclusions from the comment round (2026-11-13)

Commented mockup: https://claude.ai/artifact/WeHUbVpkg23F5WoqGTe3ii (private); local copy `ncv_tool_v8/mock/review-visuals-mockups.html`.

**Rules for Review copy (Prem):**
- Simple and instructive; the heading is "Review your draft".
- No claims about how reviewers read: we have no evidence. Say what the chart shows and how it helps.
- Ask nothing the tool cannot answer. No prompt questions under charts; minimal over more prompts.
- Each row: the question, one fact line naming the contribution to look at, one "Please look at…" line, the chart, the tick box.
- Charts that show a gap should let the researcher fix it in place (click a part to edit it).

**Kept, as revised:**
- Where your words go: bars per contribution; click a part to edit its text; the bar updates as you type.
- Evidence: a plain table, "What you produced" and "Where others used it", "None yet" when empty; items editable, + Add.
- People trained: the merged diagram (one box per described person, joined to their level) and the ring chart with the fact line "X are your largest group (n of N), and you describe none of them."
- Narrative composition breakdown (renamed length chart), in At a glance.
- Your role, unchanged.

**Dropped:** six-parts grid; Download image; Specificity (counting numbers does not show specificity); the counted-years chart (reads the wrong years).

**New views:** Reach of change (lead; interactive table, two marks per contribution); Threads (second; gives Coherence a view; after the statement step). Timeline: not built as its own view; instead one optional "When did the change happen?" year, shown in Reach.

**Still to decide:** adopt Review by question in the tool; build order; where the Reach and Threads answers are asked (on each contribution, or on Review); whether editing from Review saves straight to the draft.

## Notes of 2026-11-16 (after V8.13), from the Review board — for the next build

Board: https://claude.ai/artifact/Rvnq6rNBaQXZRTScJMURkQ (private). Notes only; nothing built.

**Ordering moves into the Coherence question (Prem, agreed).**
- Why reorder: the order contributions are written in is not chosen; the order should follow the statement, and the last one is the first to shorten if the CV runs long. Nothing on Review today gives that reason, so ordering is no longer the first task on Review.
- When: after the statement, as a check against it. Not while writing contributions, not in parallel.
- Question (Prem's paraphrase): "Based on your statement, does the order of your contributions still make sense?"
- Layout: the full statement on the left, read only, as it prints, with "Edit on Personal statement"; the contributions on the right in their order, each with ↑ and ↓ and its Threads strand marks ("No strand" when none).
- Fact line: compares the order with the strands the statement names; with no strands marked, "Mark the strands to compare the order with your statement."
- Remove the "Put your contributions in order" section at the top of Review and the "First: … / Last: …" advice lines (our own inference, no source). Review then opens with At a glance.
- Threads could start from the statement's strands field (`ps.streams`), so strands are not typed twice. To confirm.
- Supersedes the 2026-11-13 note that moved ordering to the foot of Contributions.

**Phone: not designed for.** Add one note on Review: it is best to review the whole CV on a computer. No phone layout work for Review.

**Order list: separate row numbers (Prem, board comment on "Put your contributions in order").** Keep the numbers 1, 2, 3… in a fixed column and move only the contributions, with a small gap, so the number rows stay put and the change shows.

**At a glance (board comment, answered in the thread).** Open: move "Lists to rewrite" and "Links to take out" into Before you export, so At a glance holds only Still missing and the length? Awaiting Prem.

**Where your words go (Prem, 2026-11-16, playing with the tool and the sketches).** Ordering's place with the rest is still undecided.
- Keep the legend listed above the bars; it makes the chart less noisy.
- Keep the hover highlight on each block, and add the standard edit symbol (a pencil) so it is clear a block opens.
- Open the text box directly under the contribution whose block was selected, not under the last bar.
- **Evidence: keep the V8.13 table as it is** (Prem: "a really good form… works well"): per contribution, "What you produced" and "Where others used it", each item by kind with its first words, "None yet" when empty, + Add in each column. If Review becomes one board with tabs (sketch C), the Evidence tab uses this table form, not the count-only cells in the sketch.
- **Reach: the x/y grids are to be replaced** (Prem, 2026-11-17: "not sure they are communicating anything"). Four ideas from Fable are on the sketches board, section "Reach: four new ideas": 1 Ripple, 2 Two-mark track, 3 Sentence and strip, 4 All contributions chart. Awaiting Prem's pick. The board also records "Chosen: the tab form only; order is set on the first tab only".

## Note of 2026-11-17: who changed and what changed, asked on the contribution (Prem)

- Today the tool asks this only in prose: "What already changed" = "Who has used this work so far, and what is different for them now?" (with field variants); "What could change" asks which field, sector or population it could affect. Nothing is captured in a form Review can read, so the Reach review asked for new data and judged it in the same place.
- Decision: capture it in the initial input, on each contribution, beside "What already changed" and "What could change". Plain, optional, unranked choices (any number): who changed (people, an organization or community, a government or institution, a field…) and what changed (awareness, practice, policy, culture or values…). Each can be marked as already happened or as expected; expected is equal, not lesser.
- No value or ranking: no ladder, no "bigger is better", no flag for local or hypothetical work. Work need not have reach to count.
- Evidence items may point to the change they show.
- Review then only reads this back beside the words and evidence; it asks nothing new. The People → Field reach ladder (V8.12–V8.13) and the Reach sketches are to be reconsidered against this.

## Notes of 2026-11-18 (after V8.14), Prem, for the next build

- **Statement on Review (built in V8.15):** the left pane did not work. The statement now sits above the tabs, as on a phone, and can be hidden; each tab has "See your statement", which opens it and scrolls up. A pop-up is the other option if this still does not work. Waiting for feedback.
- **Composition bar (built in V8.15):** "i still dont understand the 1, 2, 3, 4". Each contribution now has its own colour, matched in the legend, and reads "C1" when "Contribution 1" does not fit.
- **Export (built in V8.15):** it should be a step of its own, not reached at the bottom of Review. It opens with the full narrative CV, editable, and the export functions sit below it.
- **Mentorship chart:** Prem likes changing a person's entry in place. The chart should show where people went, which "is a lot of insight": who they were (their type or level) and where they wound up (the destination), in one constrained chart. Built in V8.15: a chart from the level they trained at to where they are now, above the grouped list.
- **Voice pass:** review all instruction text on Review in the house voice. Less is more: if a graph needs explaining, fix the graph rather than add words, and instructions are about doing. Fable's pass is applied in V8.15.
- **Tab names (built in V8.17):** "Order and strands · Words · Role · Evidence · Reach" were too abstract; researchers would not know what each one is. Prem: "maybe just say what the edit is not the section". Renamed to "Reorder contributions · Edit what changed · Change your role · Add evidence · Check marked changes": what you do in each tab. The other option, if these still do not work: drop the tabs and list the five questions in full, each one opening its own panel.
- **Blocks and side view (built in V8.18):** Prem: the blocks "dont feel clickable"; could a component open for editing in "a side view, if people wanted"; and could the view be seen "at the beginning and also at the end". Built: button look and pencil on each block, an Edit button per row, a side panel on wide screens with the whole contribution, and the parts shown in the same colours on a folded contribution. Then a run of the whole tool against the design principles (overview first; one object looks and behaves the same everywhere; you edit where you look, one editor at a time; a chart describes and does not score; less is more; what can be selected looks it). Its findings are in the README under V8.18.
- **Side panel removed (V8.18, before release):** Prem, on seeing the panel with the whole contribution: "please dont do this .. it was better to be able to edit each block on their own". Each block opens its own part under its row again. The button look, the accents, the site hover rule and the folded-row parts stay. Not tried: a side view holding only the one selected part.
- **Editable boxes, one checklist, vocabulary (V8.19):** Prem, on the V8.18 boxes: "this will be our design for editable boxes.. i want to improve this .. what can we do that actually helps keep design consistent and make sure you review". On the pencil: "we use the pencil in circle.. at the end of the box on the right side.. to show its editable and when over the circle appears.. or re think the boxes ... i am open". On the tick "I have checked this.": "if its a check list we need one check list then so they think through before export download". On "Your strands, marks and ticks do not print.": "these terms we need to improve so that they understand it in the first place .. build a list all the vocabularly and develop common words .. use granting agency langauge as a reference or narrative cv guide". On a lock: "maybe its just makes prompts disapear and you see the full text". Built: one editable-box component, one checklist on Export, `DESIGN.md`, the `ncv-design-review` skill, and a first `VOCABULARY.md` for his review. Not built: the "prompts disappear" idea.
- **Voice pass on the other steps (V8.20):** Prem chose "Voice pass first" (before the vocabulary). Fable read about 500 strings on the start page, Set up, Contributions, Mentorship, Personal statement and Export against the house voice and his rules (less is more, plain words, no explaining the tool, academic register). 35 changes applied; nine rows held back, listed in the README. Terms are unchanged, waiting on `VOCABULARY.md`.
- **Language pass applied (V9.0, 2026-11-26):** Prem reviewed every visible block of the tool one at a time from 2026-11-19 (`language-notes.md`, about 140 decided rows), then asked to "plan the apply" and chose to release it as **V9**, a new file with V8 frozen, testers keeping their drafts. Built: every decided row except the question tree (PS4-T, in progress elsewhere) and the new example drafts (row 13, awaiting review), including the single "complete" rule with the No impact yet and No evidence yet ticks (R11, R11a), the evidence-kind split (R8), EV-1 and R-1, and P9's ways of working. Choices the rows did not settle are listed under "INFERRED in V9.0" in `ncv_tool_v9/README.md`.
- **Change it or undo it (V9.2, 2026-11-26):** asked whether changing an evidence item's kind should clear the Review column it was added under, Prem: "Hmm ok I don't want people to look for solutions, I want them to be able to change things or undo when they need to". Built: the column is a choice in Review's evidence editor (Save moves the item; the kind no longer has to be bent to move it), and Undo after the four removals that had none (Review evidence, an area of research, a person, Delete on Review). Logged as EV-1b in `language-notes.md`; choices under "INFERRED in V9.2" in `ncv_tool_v9/README.md`.
- **The rest of the tool (V9.3, 2026-11-26):** Prem: "check the rest of the tool for the same gap, check ayting else and lets push it". Found and built: Undo after Clear draft and after opening a backup file over a draft; Undecided and None of these give back what they emptied when pressed again; Export's tool-written sentences (first sentence, evidence lists, totals, trainee sentences) each get an Edit that opens their answer. Left as they are, with reasons, under "INFERRED in V9.3" in `ncv_tool_v9/README.md`.
- **Accessibility check (V9.4, 2026-11-26):** Prem: "run the accessibility check on V9.3", then "Release V9.4". A reusable audit (`ncv_tool_v9/a11y-audit.js`: axe-core, the accessibility tree, targets, reflow, a Tab walk, keyboard runs) found five things; all fixed (chart focus on a phone, 24 px and 44 px targets, one regression of the fix itself). Open: the word bar's narrow parts on a phone. Report `ncv_tool_v9/a11y-audit-2026-11-26.md`.
- **Part box (V9.5, 2026-11-26):** from a screenshot of the "What already changed" pill, Prem: "can we work on these .. for the enitre website.. they need to conform to our pathways website we dont use those hilgighted angles.. ask teh designer to review". The designer read the live concordia.ca Pathways pages (no coloured edge bends round a corner) and proposed the part box. Prem asked for a sketch, then for a test analysis; the test found no WCAG failure and three design issues in the tool, and contrast failures on the site's pathway cards, `.pw` and Vision accordions. Prem: "Will you fix all these and push". Built in V9.5: the part box everywhere in the tool, one box per sentence in the example, 1/2/3px lines for rest/hover/open blocks, solid written squares, small-block legend marks, and two older high-contrast and text-spacing faults. The site is not changed.
