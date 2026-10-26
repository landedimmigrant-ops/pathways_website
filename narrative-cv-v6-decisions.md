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
- All copy follows the house voice (`pathways-voice` skill) and the academic-register list. The register check (`scripts/ncv-v5-examples.js register`) reads V5 only; repoint it at V6 before the example library changes.
- No real researcher's CV appears anywhere in the tool, the examples or these logs.
- Where Prem's instruction differs from a reading here, Prem's instruction wins; log it under *Overrides* and rebuild that item only.
- A change to the shape of a mentorship row or an evidence row will also change the portfolio file format. Note it here when it happens, so the V5x merge carries the migration.

## Overrides (Prem)

_Empty. Write any change of mind here and it gets applied._

## Backlog from Eli, 2026-10-06

None of these is started. Each reading below is **INFERRED** from a short note.

| # | Eli's ask | Reading | Open question |
|---|---|---|---|
| V6-1 | Remove the name field; list where trainees went by institution and department, or by sector and subdivision; add prizes and scholarships | **Built 2026-10-23** (readings in the next section). Not yet shown to Eli. | Settled by the guide check below; one open point about the asterisk convention. |
| V6-2 | Outputs listed under evidence, two lines on the finding or why the dataset was useful | Add an optional "what it found, or why it was useful" line to each evidence row, carried into the draft, export and print view. | Does "What resulted" stay as the summarising sentence? |
| V6-3 | A narrative-ordering step for contributions, after the personal statement; the Contributions step says it is coming | New step with Eli's prompts: the widest contribution first, the last one pointing at the project applied for. Reuse the move up and down control. | Step order: Contributions, cross-cutting read, Personal statement, Order, Review? |
| V6-4 | Template by agency; export to the template | Per-agency paste-ready layout in the template's section order and limits. A real `.docx` only where the template is a Word file. | Which of the templates is a file and which is an online form? |
| V6-5 | More disciplines; multidisciplinary samples | Each added discipline is 12 more cells (4 work modes × 3 stages). A multidisciplinary sample needs a cell shape of its own. | Which disciplines first? Is there a list of requests? |
| V6-6 | A second read of the contributions before the personal statement, to suggest a cross-cutting one | Later. Keyword overlap, since no AI service is allowed. | None yet. Eli marked it a future note. |

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
| V6-1c | Each row gets a **sector** choice (University, Industry, Community agency, Government, Other), an **organization** and a **department or discipline** (university) or **unit or subdivision** (any other sector). The two labels change with the sector. | Two plain text boxes with no sector choice. Dropped because Eli lists the sectors by name, which reads as a choice. |
| V6-1d | The organization is named, for a university and for any other sector. Eli says "list names of universities"; for the other sectors I applied the same pattern. | Sector and subdivision only, with no organization named, for non-university positions. A one-line change if Eli meant that. |
| V6-1e | Prizes and scholarships go in one optional free-text line per trainee, covering "held or went on to win". | A structured list of awards with years. Heavier than the note asks for. |
| V6-1f | Stage and the optional "why this example matters" line stay. Neither identifies a person, and the note does not mention them. | Removing the why line. |
| V6-1g | The Review coverage row now asks for "where one trainee went": an organization and a department or unit, both filled. The mentorship step counts as started once any sector, organization or unit is entered. The row used to require a name and a destination. | Requiring the sector as well. |
| V6-1h | Exports read "Where the people I trained went:", then one line per trainee: stage, an arrow, the place (with the sector word added for industry, community agency and government), then "Recognition: ...", then the why line. A row with no stage reads "Trainee". The session summary counts "trainee destinations listed". | Keeping "People I trained" as the heading. |
| V6-1i | The worked example on the mentorship step loses the initials "A.R." and gains one clause about a best-paper prize, so it shows the shape Eli describes. The example is fictional. | Leaving the example alone. It would have contradicted the new help text. |
| V6-1j | Saved drafts are normalised when they load: the old `who` value is dropped on purpose, and the old free-text "Where they are now" moves to the organization field so nothing else is lost. V6 has no saved drafts of its own, so this is for the V5x merge. | Keeping `who` in storage. It would keep names on the device that the screen no longer shows. |

### Merge note for V5x portfolio

The mentorship row has a new shape (`stage`, `kind`, `org`, `unit`, `recognition`, `why`; no `who`, no `destination`). V5x portfolio stores these rows with `pfId` links and the portfolio file (`format: "ncv-portfolio"`, `version: 1`) holds the old shape. When V6 is merged in, bump the file `version`, migrate older files on open the same way `normalizeMentee` does, and replace the portfolio's own checks that test `m.who` (the blank-row test, the "person" link and the people count). Names that older portfolio files already hold need a decision: dropped on open, as in V6, or kept in the file until the researcher confirms.

### Checked

Loaded in the browser (desktop and phone width), no console errors. A draft saved in the old shape opened with the name dropped and the destination moved to the organization box. The sector choice changed both labels. The text export, the print view and the Review coverage row all showed the new fields. Not yet tested with a screen reader or shown to Eli.
