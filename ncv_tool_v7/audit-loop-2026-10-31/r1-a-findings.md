# r1-a findings: assistant professor of sociology, SSHRC Insight Development Grants, desktop 1280 × 900, 2026-10-31

Recorded from the persona agent's final reply (the agent could not write files). Counts: blocker 0 · major 2 · minor 3 · polish 4. No console errors, no off-site requests.

## Summary

- Early-career sociologist; team-based and community-engaged; pastes from an old CV.
- Contributions: (1) "Tracing how “renovictions” cluster in older rental buildings" (paper, 2 evidence items); (2) "An open building-level dataset of renovation permits and eviction filings" (3 items); (3) "A plain-language community report for tenants facing “renovation” notices" (2 items; the role line was left empty first and found through Still missing).
- Mentorship: totals 1 master's and 2 undergraduates; 3 people described (one now in city government); 3 style answers.
- Statement: first sentence plus six parts, about 190 words, with a pasted numbered list in Strands.
- Length: about 1,140 words, 2 to 2.5 of 5 pages. Still missing came out empty.
- Save and reload: a saved file, a plain reload, and a cleared-storage reload from the file all lost nothing.
- Exports: `&`, curly quotes and `<`/`>` came out right in Word, print and .txt. Pasted lists, links and surrounding spaces did not.
- Would take it forward: yes, after hand edits. Top obstacles: pasted lists, links, examples that do not fit an early-career profile.

## Findings

- **r1-a-1 · major · export.** Pasted lists keep their markers and run into the next sentence in every output (What you did, What already changed, evidence notes, Mentorship style, Strands). No warning at entry. Relates to W-18. → **Fixed:** a check under the field flags a list ("Each part of the CV prints as one paragraph…"); line breaks collapse to one paragraph in every output (W-18).
- **r1-a-2 · major · ux/export.** The TCV link warning shows only while the field has focus; Review says "Nothing missing" and every export carries the links. Bare DOIs are not flagged. → **Fixed:** At a glance lists "Links to take out" (TCV) or "Links to move to the evidence list" (CV-FRQ), each linked to its field. Bare DOIs stay unflagged (INFERRED: a DOI written as text is a reference, not a link).
- **r1-a-3 · minor · bug.** Specific-number and word counts include list markers, years, DOI digits. → **Fixed:** markers on every line, DOIs and four-digit years are left out of the number count; markers are left out of the word count.
- **r1-a-4 · minor · export.** Surrounding spaces in Setup's Competition and in a headline reach the .txt, Word ("notices .") and the Move buttons' names. → **Fixed:** Setup's Competition trims on blur; one-line fields trim on blur (W-35); every output takes the collapsed, trimmed headline.
- **r1-a-5 · minor · ux/copy.** The Mentorship and statement examples describe a senior record for an early-career profile; the statement step has no early-career note; the "Who gets in" example does not match the community prompt. → **Open, for Prem** (example content).
- **r1-a-6 · polish.** The Review "Your role" chart counts the level only ("1 with a role chosen" when all three have role lines). → **Fixed:** a "Role line, no level chosen" row; the subline counts contributions with any role.
- **r1-a-7 · polish (unsure).** No evidence kind fits community-held outputs (a community report, a partner-held dataset). → **Open, for Prem** (with Q13, evidence kinds).
- **r1-a-8 · polish (unsure).** The side-column triangle stays on Headline while focus is in Stakes or Your role. → **No change:** the triangle follows the scroll position by design (DECIDED 2026-10-30); the W-29 foot-of-page fix covers the case that was wrong.
- **r1-a-9 · polish.** The tool's own text uses straight apostrophes (master's) next to curly ones. → **Open** (polish, later round).

## Known items seen

W-14, W-15, W-16, W-17, W-19, W-20, W-21, W-26, W-30, W-36, W-46, W-48.

## Verified fine

Save, reload and load-from-file lost nothing; typed text survives an immediate reload; reorder carries into the exports; removal confirm worked; a level with an empty role line is listed under Still missing as "Your role".
