# Eli's latest notes (6 Oct 2026) against the NCV tool

Read on 2026-10-23. Source: Anytype, Pathways to Impact space, object "Eli [researcher] narrative Cv tool review" (type ux_report, created 2026-10-06 17:37 UTC, last edited 18:29 UTC). The tool I checked it against is `narrative-cv-prototype-v5x-portfolio.html` (built 2026-10-01 as V5x, renamed 2026-10-23). The note is five days newer than the build, so none of it is in the tool yet.

Nothing in the repo was changed except this file.

---

## 1. What the note says

**Feedback from the session.** The tool shows that researchers can organise their thinking into the format ("the mental gymnastics"), and that it lets a person build a change narrative that matters to them. There is also a question about whether the tool produced the result in a Word document. The line is garbled in the note, so that is my reading.

**Eli's two questions.** Can the tool export to the template? Can we build options for each specific template?

**Next step named in the note.** Compare one researcher's CV before and after, for Eli, to learn what changed.

**Tool review, six items.**

1. Offer more disciplines, and add others as people request them for representation. Then write sample narrative CVs for multidisciplinary work.
2. Load the template for the agency the person picked, for drafting.
3. Let people list their outputs under evidence, with two lines on the main finding of each paper, or on why a dataset was so useful. (A screenshot of the "What resulted" box is attached to this item.)
4. Contributions need an order, because the whole collection has to read as a narrative. Add a section after the personal statement where the person orders their contributions: the most overarching first, the last one pointing at the project they are applying for. The Contributions step should say that this ordering is coming.
5. Future note: a second analysis of the contributions before the personal statement is assembled. A contribution that reads as cross-cutting could be suggested for the personal statement.
6. Remove the name field. For trainees (HQP), list the university and department or discipline, or the industry, community agency or government body and its subdivision. Add best-paper prizes and prestigious scholarships, whether held or gone on to win.

---

## 2. Each item against V5x portfolio (the same code as V6 for these items)

| # | Eli's ask | Where the tool is today | Size of the change (my estimate) |
|---|---|---|---|
| 1 | More disciplines; multidisciplinary samples | Five disciplines (`DISCIPLINES`, line 371): STEM, Health, Social sciences, Humanities, Creative. The example library has 60 cells (5 disciplines × 4 work modes × 3 stages). | Large. Each added discipline is 12 more cells, each through the checker `scripts/ncv-v5-examples.js` and the register check. A multidisciplinary sample is a design decision first: it is one researcher who spans two fields, and the library has no cell shape for that. |
| 2 | Template by agency; export to the template | No export to a template. Exports are `.txt` (draft, advisor packet), a copy button and a print view. The print view carries a screen note that it "is not the template" (line 2857). The tool does use each agency's section names (`SECTION_NAMES`, line 335) and font rules, and shows "You must use the agency's template" (line 1575). | Medium for a paste-ready layout per agency. Larger for real `.docx`. See section 3. |
| 3 | Outputs listed under evidence, two lines on the finding | "What resulted" is one free-text box ("Name them... List the things themselves"). Evidence is a separate list of rows (citation text plus a type), lettered a, b, c, and the letters appear in the draft beside the sentence each item supports (`renderEvidence`, line 2307). | Small to medium. Add an optional "what it found, or why it was useful" line to each evidence row; carry it through the export and print view. Saved drafts and portfolio files need the field defaulted. |
| 4 | Narrative ordering step after the personal statement | The tool has no ordering step. Contributions can be moved up and down only in the portfolio assembly view (line 3797). The Review step has a free-text question prompt, "Is contribution 2 strong enough to lead with?" (line 2664). | Medium. The move mechanism exists; the new part is a step with Eli's prompts and a heads-up inside the Contributions step. Step sequence needs a decision (section 3). |
| 5 | Second analysis for cross-cutting contributions | Nothing equivalent before the personal statement. | Later. Eli labels it a future note. Without an AI service (the April note says the privacy review is open), the interim is a keyword-overlap suggestion. |
| 6 | No name field; structured destination; prizes and scholarships | Mentorship rows hold name or initials, stage, "Where they are now" (free text) and an optional one-line why (`blankMentee`, line 1250; form at line 2457). | Small to medium. See section 3 for the places that depend on the name field. |

---

## 3. Points that need a decision or a fact

**Item 2: what the templates physically are.** The guide refers to the Canadian Common CV and to the FRQ's own parallel format. I have not confirmed which of the three templates (Tri-agency, CV-FRQ, and CCV where it applies) is a Word file, which is a PDF and which is an online form. That decides what "export to the template" can mean. A `.docx` suits a Word template and does nothing for a web form, where the useful output is text laid out in the form's section order and field limits. The portfolio plan (`narrative-cv-portfolio-app-plan.md`, export row) already records that fidelity to each funder's template is the hard part, and suggests plain text first and one `.docx` template at a time.

**Item 4: step order.** The tool writes the personal statement last, and it appears first in the export. Eli's item 4 puts the ordering after the personal statement. His item 5 puts a cross-contribution read before it. Taken together the sequence is: Contributions, cross-cutting read, Personal statement, Order contributions, Review. That adds two steps, so the step list and the Review coverage rows need updating; it is worth agreeing the sequence before building.

**Item 6: it reverses a line the tool currently teaches.** The mentorship step says naming trainees "is standard in this format", citing the Tri-agency CV's asterisk rule for supervised trainees in citations (line 2457). Eli now asks to remove names. Two things to settle before editing: whether the guide carries the same sentence (it is the source of truth for funder rules), and whether Eli means the mentorship section only. I read "HQP" as the mentorship section.

Removing names also helps the portfolio idea. The 2026-10-01 ideas log lists trainees' names as the main risk if a USB key is lost.

**Item 6: code that depends on the name field.** The `who` value drives the mentorship completion check (line 1456), the Review coverage row "One person named, with where they went" (line 2593), the count of people named in the session summary (line 2956) and the draft and advisor-packet text (lines 2734, 2789, 2882). Portfolio files and saved drafts that already hold `who` need a migration so no data is dropped silently.

**Item 3: outputs versus evidence overlap.** A paper is both an output and a piece of evidence, and the tool has a list for each. Eli's wording ("list what the outputs were like in evidence") points at putting the finding line on the evidence rows and leaving "What resulted" as the sentence that summarises them. I have assumed that reading.

---

## 4. Needs your input

- **The before and after CVs.** The note asks for a before-and-after comparison for Eli. The project notes record that real CVs stay private, so I have not looked for them. Tell me where the pair is and what Eli wants out of it (a list of what changed, grouped by type of change, or a narrative).
- **Disciplines.** Eli says to add them "based on requests". Is there a list of requests yet, or should the first addition wait for one?
- **Template facts.** Can Eli, or the agencies' pages, settle which of the templates is a file and which is a form? That is the one fact the export design waits on.

---

## 5. Suggested order

1. **Names to structured destinations (item 6).** Settle the guide sentence first. Small, and closes the privacy point.
2. **Finding line on evidence rows (item 3).** Small, contained, and visible in the draft straight away.
3. **Ordering step and heads-up (item 4).** Agree the step sequence first.
4. **Paste-ready export per agency (item 2).** After the template facts are in.
5. **Disciplines and multidisciplinary samples (item 1).** After the request list.
6. **Cross-cutting read (item 5).** Later, as Eli marked it.

The CV comparison can run alongside all of these.

---

## 6. Older Eli notes, for context

- **25 Sep 2026, "eli ncv guide".** Template use stressed in red across the board; page limits where the agency has not said. Both are in the tool already (P-8, P-44 and the "You must use the agency's template" line), through the guide-review commits of 25 Sep. The note also mentions an interactive guide (Holly); I did not check that item.
- **16 Apr 2026, "Eli — UX Report".** Twelve recommendations, including impacts-first contribution entry, a hidden keyword field for grouping, and mining successful NCVs for patterns (Eli supplies examples, you run the analysis). I did not check which of the twelve have landed. The CV comparison belongs to the same thread.

## 7. What I did not open

Two newer Pathways notes, "super cluster .." (16 Oct) and "notes youth engagement office faciliation" (14 Oct). Neither is titled as Eli's, and I read only the Eli notes above.
