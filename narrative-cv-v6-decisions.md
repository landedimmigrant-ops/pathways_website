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
| V6-1 | Remove the name field; list where trainees went by institution and department, or by sector and subdivision; add prizes and scholarships | Replace "Name or initials" and the free-text "Where they are now" with structured fields. Add a field for recognition. Keep stage and the optional one-line why. | Does the guide carry the sentence that naming trainees is standard? Does "HQP" mean the mentorship section only? |
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
