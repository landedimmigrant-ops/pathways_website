# NCV V6 beta: decisions log

V6 is the regular line of the Narrative CV tool from 2026-10-23. It began as an exact copy of V5 beta as it stood at commit `4d71449` (2026-09-25), with new labels, a new storage key and a new feedback key, and nothing else changed. The first backlog is Eli's note of 2026-10-06, read in [ncv-eli-notes-2026-10-06.md](ncv-eli-notes-2026-10-06.md).

- File: [narrative-cv-prototype-v6.html](narrative-cv-prototype-v6.html) · alias `/ncv_tool_v6/`
- Draft storage: `ncv-v6` · feedback rows go to the Guide review tab with `page = ncv-tool-v6`
- Created 2026-10-23. Marked **DECIDED** where Prem said so, **INFERRED** where the reading fills a gap.

## The versions

| Version | File | Role |
|---|---|---|
| V4 | `narrative-cv-prototype-v4.html` | Reference. `/ncv_tool_v4/` and the `app.js` embed point at it. |
| V5 beta | `narrative-cv-prototype-v5.html` | Frozen. The pilot build, and the merge base for V5x portfolio. |
| V5x portfolio | `narrative-cv-prototype-v5x-portfolio.html` | V5 plus the portable portfolio. Paused until V6 has settled; then V6 is merged into it. |
| **V6 beta** | `narrative-cv-prototype-v6.html` | **The regular line.** All new work lands here. |

**DECIDED** (Prem, 2026-10-23): V6 is the new regular line; V5x is renamed V5x portfolio; when the portfolio work resumes, the latest regular version is merged into it. The merge steps are in [narrative-cv-v5x-portfolio-decisions.md](narrative-cv-v5x-portfolio-decisions.md).

## Ground rules

- V5 and V5x portfolio are not edited while V6 is built. V5 is the merge base; an edit to it would change the base.
- Deterministic and on-device: no AI service, no API. The one network call is the Feedback step's Send.
- All copy follows the house voice (`pathways-voice` skill) and the academic-register list. The register and lint checks run on V6 with `node scripts/ncv-v5-examples.js register --file narrative-cv-prototype-v6.html` (and `lint`).
- No real researcher's CV appears anywhere in the tool, the examples or these logs.
- Where Prem's instruction differs from a reading here, Prem's instruction wins; log it under *Overrides* and rebuild that item only.
- A change to the shape of a mentorship row or an evidence row will also change the portfolio file format. Note it here when it happens, so the V5x merge carries the migration.

## Overrides (Prem)

_Empty. Write any change of mind here and it gets applied._

## Backlog from Eli, 2026-10-06

All six are built (2026-10-23). Each reading is **INFERRED** from a short note; the readings for V6-1 and for V6-2 to V6-6 are in the two sections below. None has been shown to Eli yet.

| # | Eli's ask | Reading | Open question |
|---|---|---|---|
| V6-1 | Remove the name field; list where trainees went by institution and department, or by sector and subdivision; add prizes and scholarships | **Built 2026-10-23** (readings in the next section). Not yet shown to Eli. | Settled by the guide check below; one open point about the asterisk convention. |
| V6-2 | Outputs listed under evidence, two lines on the finding or why the dataset was useful | **Built 2026-10-23.** Optional two-line field under each evidence item. | None. |
| V6-3 | A narrative-ordering step for contributions, after the personal statement; the Contributions step says it is coming | **Built 2026-10-23.** New step "Order of contributions" between the personal statement and Review. | None. |
| V6-4 | Template by agency; export to the template | **Built 2026-10-23**, in part. A Word file in the agency's font and section names, and a copy button per section. The tool still produces a working draft for pasting into the template. | Which of the templates is a file and which is an online form? Decides whether anything more is possible. |
| V6-5 | More disciplines; multidisciplinary samples | **Built 2026-10-23.** An optional second field, a "field not listed" box that reaches the team through Feedback, and ten interdisciplinary worked examples (one per pair, mid career). | Which fields people name, once Feedback rows come in. |
| V6-6 | A second read of the contributions before the personal statement, to suggest a cross-cutting one | **Built 2026-10-23**, light. A word-count read at the top of the personal statement step. | Whether Eli wants it now or held as the future note. |

Also open, outside the tool: the before-and-after comparison of one researcher's CV that Eli asked for. It needs the two files from Prem and a decision on the form of the output.

## Decisions

| # | Call | Status | Why |
|---|---|---|---|
| V6-D1 | V6 forks V5, not V5x | INFERRED | V5 is the regular line; V5x adds a feature that is paused. |
| V6-D2 | Storage key `ncv-v6` and feedback key `ncv-tool-v6` | INFERRED | Same pattern as V5 and V5x; drafts and feedback from the three versions stay apart. |
| V6-D3 | V5x portfolio keeps its old storage and feedback keys | INFERRED | Drafts and portfolio working copies already in browsers keep opening. |
| V6-D4 | `/ncv_tool_v5x/` stays as a redirect to V5x portfolio | INFERRED | A link already shared keeps working. Delete the folder if it was never shared. |

## Item 6: trainee destinations (built 2026-10-23)

Eli's words: "Take out the name field .. take out name reference, HQP / list names of universities and department / discipline or industry, community agency, government .. subdivision, best paper prizes, prestigious scholarships or went to get them."

### What the guide says about naming trainees

- The corrected guide copy (`ncv-guide-review/`) has no sentence that says naming trainees is standard, and no mention of an asterisk or of HQP. Its mentorship section lists the kinds of activity that count and says nothing about naming people. Its own model sentence for trainee outcomes names no one: "Three former graduate students now hold [roles]".
- The sentence in the V5 tool ("Naming the people you trained is standard in this format...") came from `ncv-genre-sources.md` §1 and the factual-review finding F-14. F-14 is a citation convention: the Tri-agency CV marks each supervised trainee with an asterisk after the name **in a citation**. V5 extended it to the mentorship rows (V5 log, F5 and B-28, string S143, flagged "swap if Eli says otherwise"). The guide never carried the extension, so changing the rows does not conflict with the guide. Eli's note replaces S143.
- **Open.** F-14 is held in the guide review ("decision needed on where these live", M-13, with the builder named the likelier home). The V5 mentorship help text was the only place the tool mentioned the asterisk, so V6 now mentions it nowhere. The citation rule is still true and still applies to the evidence rows. Recommended: put one sentence about it in the Evidence help text, once M-13 is decided. Not built.

### Readings

All **INFERRED** from a one-line note.

| # | Reading | Alternative not taken |
|---|---|---|
| V6-1a | "The name field" is the "Name or initials" input on each trainee row. It is removed outright, with no initials option. "Name reference" covers the help text, the coverage row, the export, the session summary and the worked example, all reworded. | Keep an optional initials box. Dropped because Eli asks for no name reference. |
| V6-1b | "HQP" means the trainee rows of the mentorship step only. The citation asterisk convention in the evidence rows is untouched. | Applying the no-names reading to citations as well. Eli's note does not reach that far. |
| V6-1c | Each row gets a **sector** choice (University, Industry, Community agency, Government, Other), an **organisation** and a **department or discipline** (university) or **unit or subdivision** (any other sector). The two labels change with the sector. | Two plain text boxes with no sector choice. Dropped because Eli lists the sectors by name, which reads as a choice. |
| V6-1d | The organisation is named, for a university and for any other sector. Eli says "list names of universities"; for the other sectors I applied the same pattern. | Sector and subdivision only, with no organisation named, for non-university positions. A one-line change if Eli meant that. |
| V6-1e | Prizes and scholarships go in one optional free-text line per trainee, covering "held or went on to win". | A structured list of awards with years. Heavier than the note asks for. |
| V6-1f | Stage and the optional "why this example matters" line stay. Neither identifies a person, and the note does not mention them. | Removing the why line. |
| V6-1g | The Review coverage row now asks for "where one trainee went": an organisation and a department or unit, both filled. The mentorship step counts as started once any sector, organisation or unit is entered. The row used to require a name and a destination. | Requiring the sector as well. |
| V6-1h | Exports read "Where the people I trained went:", then one line per trainee: stage, an arrow, the place (with the sector word added for industry, community agency and government), then "Recognition: ...", then the why line. A row with no stage reads "Trainee". The session summary counts "trainee destinations listed". | Keeping "People I trained" as the heading. |
| V6-1i | The worked example on the mentorship step loses the initials "A.R." and gains one clause about a best-paper prize, so it shows the shape Eli describes. The example is fictional. | Leaving the example alone. It would have contradicted the new help text. |
| V6-1j | Saved drafts are normalised when they load: the old `who` value is dropped on purpose, and the old free-text "Where they are now" moves to the organisation field so nothing else is lost. V6 has no saved drafts of its own, so this is for the V5x merge. | Keeping `who` in storage. It would keep names on the device that the screen no longer shows. |

### Merge note for V5x portfolio

The mentorship row has a new shape (`stage`, `kind`, `org`, `unit`, `recognition`, `why`; no `who`, no `destination`). V5x portfolio stores these rows with `pfId` links and the portfolio file (`format: "ncv-portfolio"`, `version: 1`) holds the old shape. When V6 is merged in, bump the file `version`, migrate older files on open the same way `normalizeMentee` does, and replace the portfolio's own checks that test `m.who` (the blank-row test, the "person" link and the people count). Names that older portfolio files already hold need a decision: dropped on open, as in V6, or kept in the file until the researcher confirms.

### Checked

Loaded in the browser (desktop and phone width), no console errors. A draft saved in the old shape opened with the name dropped and the destination moved to the organisation box. The sector choice changed both labels. The text export, the print view and the Review coverage row all showed the new fields. Not yet tested with a screen reader or shown to Eli.

Re-checked 2026-10-23 by the session that took the item over. A draft saved in the old shape with two names opened with both names gone from storage and the screen, and the old destination in the organisation box. University and Government rows showed the matching labels. The Review coverage row showed done. The text export read "PhD → Université de Montréal, School of Public Health. Recognition: Vanier scholarship, 2023…" and "MSc → Government, Statistics Canada, Labour statistics division". At phone width the row stacks with no sideways scroll, and the console showed no errors. The new copy passes the register rules in `scripts/ncv-v5-examples.js`. The print view was not opened; it builds its lines from the same `menteeParts` as the export.

## Items 2 to 6 (built 2026-10-23)

Built in one pass after V6-1, on Prem's instruction "make the rest of the updates from the notes". A copy of V6 and this log from before the pass is in `backups/v6-pre-eli-rest-2026-10-23/`.

### V6-2 · Two lines on each evidence item

Eli's words: "have a way for people to list what the outputs were like in evidence, and give the two lines on what was the major findings of this paper, or why was this dataset so useful."

| # | Reading | Alternative not taken |
|---|---|---|
| V6-2a | The two lines go on each **evidence** row, as an optional field under the item ("Two lines: what it found, or why it was useful"). "What resulted" stays a single summarising sentence. | Turning "What resulted" into a list of outputs with a line each. That would duplicate the evidence list, since a paper is both. |
| V6-2b | The field is free text with no word limit. "Two lines" is in the placeholder and the help text. | A hard limit. The page limit already does that work. |
| V6-2c | The lines print under their item in the working-draft text, the advisor packet, the print view, the Word file, the section copy and the assembled view, and count toward the draft's word total. | Keeping them as notes for the researcher only. Eli's point is that the reviewer gets the finding. |
| V6-2d | The evidence help text gains one sentence on the new field. | — |

### V6-3 · Order of contributions

Eli's words: "people need to think about the order for the narrative ... a section after personal statement where you do a narrative ordering of your contribution, prompting to put the most over arching contribution at the top, thinking about the last one as something that moves your project you are applying for (also note in contribution that you will be doing this process ...)."

| # | Reading | Alternative not taken |
|---|---|---|
| V6-3a | A step of its own, "Order of contributions", after the personal statement and before Review. The personal statement's next button names it. | Ordering inside the Review step. |
| V6-3b | Two prompts: first, the contribution that runs across the most of your work; last, the one that leads most directly into the project applied for (the competition name from Setup is shown when given). | — |
| V6-3c | Up and down buttons on each contribution. A move rearranges the contributions themselves, so the Contributions step, the numbering and every export follow the new order. | Drag and drop. Buttons work with a keyboard, a screen reader and a phone. |
| V6-3d | The step counts as done after a move or "This order works". Review gains a coverage row for it when there are two or more contributions. | Requiring a move. A researcher whose order is already right should be able to confirm it. |
| V6-3e | The Contributions step opens with one line saying they can be written in any order and that a later step sets it. | — |

### V6-4 · The agency's template

Eli's words: "Can you export to the template? Can we build options for the specific template?" and "load template based on agency they picked, going forward for drafting."

| # | Reading | Alternative not taken |
|---|---|---|
| V6-4a | The tool cannot fill the agencies' own templates, because which of them are Word files and which are online forms is still unconfirmed (open question). What it can do is hand over text that drops into the template. | Building a `.docx` against a guessed template. |
| V6-4b | **Download for Word (.doc)** on Review: the three sections under the agency's section names, in the agency's font at 12 points, Letter page, 2 cm margins. A first italic paragraph says to paste each section into the template and then delete it. Word opens it directly; no library and no network call. | A `.docx` built with a library from a CDN. It would add a network call the tool's constraints rule out. |
| V6-4c | **Copy "section name"** buttons on Review, one per template section, in template order. Each copies plain text without the tool's notes (no context line, role tag or gap notes). Evidence keeps its letters and two-line notes. | One copy button for the whole draft only (still there). |
| V6-4d | "Load the template for drafting" is read as the section names, order and format rules the tool already takes from the agency picked in Setup. No new drafting view. | A template-shaped drafting page per agency. Waits on the template facts. |

### V6-5 · More than one discipline

Eli's words: "can we choose more discipline (and we will add other based on requests re representation), then develop sample narrative cv multidiscipline stuff as well."

| # | Reading | Alternative not taken |
|---|---|---|
| V6-5a | "Choose more discipline" means choosing more than one. Setup keeps "Closest disciplinary home" and adds an optional "Does your work also sit in another field?" with the other four. One extra field, not any number. | Turning the discipline into a multi-select. Every prompt variant and discipline note keys on one discipline, and two covers most interdisciplinary records. |
| V6-5b | "Add others based on requests" becomes a "Field not listed here?" box. What the researcher types reaches the team in the Feedback session summary, and nowhere else. The list of five stays as it is until requests come in. | Adding fields now. There is no request list yet. |
| V6-5c | "Multidiscipline samples" are ten new worked examples, one for each pair of the five disciplines, each a mid-career contribution by one invented researcher working across both fields. When a second field is set, the Contributions step shows the pair's example under the main one. | One example per pair per career stage (30) or per work mode. Ten is enough to test whether people use them. |
| V6-5d | The ten cells pass the same lint and register checks as the 60 (`node scripts/ncv-v5-examples.js lint --file narrative-cv-prototype-v6.html`). The checker now takes `--file`; with no flag it still reads V5. | — |
| V6-5e | The second field appears in the "Tailored for" bar, the export context line and the session summary as "Social sciences + Humanities". | — |

### V6-6 · A read across the contributions

Eli's words: "Future note: section where you do a second analysis of contribution before assembling into a full personal statement, so that if the contribution sound more cross cutting it might be suggested to use it in personal statement."

| # | Reading | Alternative not taken |
|---|---|---|
| V6-6a | Built now in a light form, since Prem asked for the rest of the notes. It sits at the top of the personal statement step, before the fields. | Holding it as a future note, as Eli labelled it. Easy to remove if Eli prefers to wait. |
| V6-6b | The read counts words (five letters or more, minus a list of common and generic research words) that recur in two or more contributions, and shows up to eight. A contribution that shares two or more such words with every other contribution (with three or more contributions) is named as possibly cross-cutting. | Any language model. The tool allows no AI service. |
| V6-6c | The wording says it is a count done on the device and a suggestion. | — |

### Checked (2026-10-23)

In the browser with a seeded draft of three contributions: the second-field row lists the other four fields and saves the choice; the interdisciplinary example appears for Social sciences and Humanities; the finding line shows under each evidence item and prints in the export and the Word file; the cross-cutting read named three recurring words and one spanning contribution; moving a contribution up changed the stored order, the numbering and the export, and marked the step done; Review showed the coverage row; the Word download was `narrative-cv-draft-sshrc.doc` in Arial with the delete-me paragraph; the three section buttons copied plain text; the session summary listed the unlisted field and the new actions. Phone width: the order list and the evidence field stack with no sideways scroll. No console errors. Lint and register: 70 cells clean in V6, 60 still clean in V5. Not tested: opening the `.doc` in Word itself, or a screen reader.

### Merge note for V5x portfolio (items 2 to 6)

Evidence rows gain `note`. The lens gains `discipline2` and `otherField`. A new stage key `order` and `ui.orderDone`. The portfolio stores evidence rows, so the merge carries `note` into the portfolio file as well (the same `version` bump as the mentorship rows).
