---
name: aem-guide-review
description: The full process for reviewing a guide or content page that has been ported to Concordia's AEM site (concordia.ca) and turning it into a corrected, commentable review copy that staff can annotate and the web editor can paste from. Built on the Narrative CV guide review (September 2026). Use when the user wants to review an AEM/dev-site page against our version, flag typos and inconsistencies, verify funder facts, build a review page with highlight-and-comment, send a page to staff or subject experts for review, process reviewer comments, track what has been copied into AEM, or "reuse our process" for another guide. Also use when the user types /aem-guide-review.
---

# aem-guide-review — from an AEM page to a corrected, reviewed, pasted page

Tooling lives in **`aem-review-kit/`** (build, review layer, snapshot tools, Apps Script, templates;
read its README). Worked example: **`ncv-guide-review/`** with its log
`ncv-guide-aem-review-2026-09-21.md` and factual review `narrative-cv-guide-factual-review.md`.
Details, templates and message formats: **`reference.md`** next to this file.

**Ground rules**
- **AEM is the source of truth for what is published; our review copy is the source of truth for
  what it should say.** AEM is corrected by hand from the review copy. Never write to AEM.
- **Facts before style.** A change to what we tell researchers about funder rules needs a primary
  source or a named expert. A style change does not. Keep them in separate IDs.
- **Prose** follows `pathways-voice` and the academic-register list in memory
  (`feedback_academic_register`). Messages sent as Prem follow `prem-voice`.

## The loop

### 1. Read the AEM page completely
Open it in the browser pane. Read the full `<main>` DOM **including collapsed accordion bodies**
(visible-text readers miss them), heading tree, anchors, links, meta description, robots, `lang`,
and the French counterpart path. Walk it at desktop and 375px. Pages move between author trees and
launch paths; if it 404s, find it from the section's home page.

### 2. Write the correction log (template: `aem-review-kit/docs/correction-log-template.md`)
- **Pass 1, implementation:** slot by slot against our source. Name what the build got right.
- **Pass 2, language and consistency:** every item a **Correction** or a **Question**, quoted
  verbatim, with "does this also apply to our source?".
- **Factual pass:** every funder claim string-matched in the live primary source (SSHRC, CIHR, NSERC,
  FRQ pages and PDFs; record each page's "date modified"). Rules hide in unexpected documents
  (reviewer guidelines, presentation standards). Agencies contradict themselves; when they do,
  publish the stricter rule and flag it. **If a fact cannot be sourced (a year, a count), leave it
  out of the page** rather than print a guess.
- **Pass 3, improvements:** before launch vs after launch.
- **Paste-ready text** in groups A (build errors) · B (verified facts) · C (copy) · D (needs expert
  sign-off) · E (held).

### 3. Build the review copy (kit README → "Start a new guide review")
Snapshot → `src/`; each fix into `src/corrections.json` with its log ID and a `<!--rv:ID-->` marker;
structural edits in `src/hooks.py`; questions for people as seeded comments anchored to a verbatim
quote. The build fails loudly when a `find` no longer matches: that is the drift alarm after a
re-snapshot.

### 4. Publish and route questions
Push; send reviewers the plain link and the web editor the `?aem=1` link. Route each open question
to the person who can answer (see reference.md: who answers what). Send short numbered questions
that quote the page and offer replacement text to approve.

### 5. Process comments in batches
Pull every row (`?action=review_list&page=<key>`). For each thread: decision → change in
`corrections.json` → rebuild → verify → **reply saying what was done, then resolve** (post via the
webhook as "Claude (for Prem)"; verify by reading back). Keep open only threads waiting on a person.
Re-anchor a seeded comment's `quote` whenever its passage changes, or it orphans. Record each
decision in the log's decisions table and in memory.

### 6. Copy into AEM
The editor works in AEM copy mode: Copy text / Copy HTML per change, then **Mark done in AEM**.
Done marks carry a text fingerprint; if a change is edited afterwards it returns to To do.
Before launch, re-snapshot AEM, rebuild, and check the To do list is empty.

## Verify every change before saying it is done
- Build passes (it checks edit counts and that every marker has a change entry).
- In the browser: the new text is present and the old text gone (string match), all seeded comments
  anchor (0 orphans), no console errors, reviewer view and copy mode both correct, 375px width.
- After pushing, wait until the live page serves the new content-hash before reporting.

## How Prem likes this run (see memory `feedback_review_pages`)
Reviewer view stays clean: no change tracking, no resolved threads. Editors get copy mode. When Prem
must do something by hand (Apps Script, a sheet), give one step at a time with the exact text to
paste. Once he approves a direction, carry it through without pausing between steps.
