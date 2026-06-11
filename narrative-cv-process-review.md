# Narrative CV — Process Review & Convergence Plan

*A critical review of how the NCV tool has been designed so far, what the first real
exemplars validated and falsified, and the plan that V4 implements.
Companion to [`narrative-cv-evaluation.md`](narrative-cv-evaluation.md).*

**Status:** v1 — written alongside the V4 prototype. 2026-06-09.
**V4 build status (Jun 10 2026):** Prototype built, color-corrected to Concordia palette, and verified end-to-end in browser. Pending: tone/language cleanup of all UI copy, then reviewer pass (Eli/Holly), then port to `app.js`.

---

## 1. The one-paragraph verdict

The work is good but the process has been inside-out: we built and refined the
instrument for months — Phases A–F, the lint engine, six personas, a redesign-response
document — before ever examining the artifact the tool is supposed to produce. When two
real, fully-developed Tri-agency CVs finally arrived (June 2026), they immediately
falsified several core assumptions. The corrective lesson for everything that follows:
**collect exemplars before designing instruments, and treat every still-unvalidated
assumption as provisional.**

> **Evidence caveat that bounds this whole document:** the real-CV sample is n=2, both
> from the *same* competition, both edited by the *same* advisor, and both are
> drafts-in-progress — we do not know that either was funded. Patterns drawn from them
> are hypotheses with better grounding than before, not ground truth.

---

## 2. What the real CVs validated vs. falsified

| Assumption in the tool | Verdict | What the real CVs showed |
|---|---|---|
| Outcomes (concrete, happened) vs Impact (systemic, hypothesised) are separate moves | **Validated** | Impact claims are consistently hedged and forward-looking; outcomes are definite and dated |
| Hedging is appropriate in Impact, wrong elsewhere | **Validated** | Exactly the observed pattern |
| Academic impact counts fully | **Validated** | Field-level influence claimed as impact without apology |
| 3–5 thematic contributions | **Validated** | Both used 5 |
| Mentorship needs counts *and* texture | **Validated, sharpened** | The persuasive unit is a *named trajectory* (person → destination → why it matters), plus EDI grounded in structural context |
| First person: purge "we" | **Falsified** | Both CVs alternate "we"/"my group" (honest team science) with "I" (the specific claim). The skill is making the individual role *legible*, not erasing the team |
| Evidence is a prose field | **Falsified** | Evidence is a keyed reference list (superscripts → an offset box), typed and specific |
| The 5-field scaffold appears in the output | **Falsified** | The final text is flowing prose; the scaffold is invisible. The tool was missing its last step: collapse the scaffold into narrative |
| "Theme" is enough of a header | **Falsified** | Every contribution has a memorable *title* and opens with *stakes* (the problem, before the work) |
| The PS scaffold (role/why-area/why-mine/prospective) is complete | **Incomplete** | Real PSs also carry an origin/pivot story, a consolidated standing paragraph, and an explicit aim at the specific competition |
| Word-count ranges (40–100/field) | **Still unvalidated** | Plausible but uncalibrated; needs the empirical pass against successful NCVs (`narrative-cv-evaluation.md` §5) |

---

## 3. Process critiques

1. **Exemplars came last; they should have come first.** Genre analysis before
   instrument design. This is now standing policy for this project.

2. **Artifact sprawl without convergence.** Four HTML files
   (`narrative-cv-prototype.html`, `narrative-cv-guide-standalone.html`,
   `narrative-cv-redesign-response.html`, `narrative-cv-prototype-v3.html`) plus the
   live SPA module, three data models, no declared canonical version — while actual
   researchers still see the oldest tool. Every insight spawned a file instead of
   merging. **V4 is declared the convergence target**; once it stabilizes, the others
   become reference material and the port to `app.js` resumes.

3. **V3 regressed the evaluation layer.** Building the prompt library, V3 silently
   dropped the T1 lint rules and the ✓/✗/? review loop — the most validated parts of
   the prototype. V4 restores them, merged inline (ambient auto-checks + per-field
   flagging) instead of as a separate round.

4. **Circular validation.** Personas we invented validated rules we wrote. The first
   external data falsified several. Priority research tasks, in order:
   (a) the calibration pass over 10–20 *successful* NCVs (Eli has access);
   (b) mapping published SSHRC/NSERC/CIHR **reviewer criteria** into the tool — we have
   optimized writer-side proxies without ever encoding the actual scoring rubric;
   (c) one moderated session with a real researcher writing a real NCV.

5. **The tool assumed a blank page; the observed real workflow is revision.** Both
   reference CVs were existing drafts being marked up by an advisor. V4 adds a
   draft-first entry mode (the "X-ray").

6. **A carried self-contradiction:** the Personal Statement was Step 1 in every version
   while the guidance said "write it last." V4 reorders the flow
   (Contributions → Mentorship → Personal statement → Review); the export still places
   the PS first, as the format requires.

7. **The V3 lens was over-engineered.** Five intake dimensions × variants is a
   combinatorial surface that is hard to QA, and it front-loads five questions before
   delivering any value. The real CVs differed mainly by discipline. V4 keeps a light
   intake (agency → format, discipline, career stage, optional program) and asks
   work-mode just-in-time when contributions begin.

---

## 4. The recalibrated ownership rule

The single most consequential rule change, replacing `T1.first-person-ownership`:

- **Ownership markers:** `I + action verb` (as before) **or** `my group / my lab /
  my team / my students / my collaborators` — the real CVs use these constantly.
- **"we/us/our" is flagged only when no ownership marker appears in the same field.**
- When both are present, that is now a *strength* ("team voice + individual ownership"),
  not a violation.
- Weak-collaboration verbs ("worked on", "participated in", …) remain flagged.

All other T1 rules carry forward unchanged (specificity, vague-language closed list,
field-aware hedging, length ranges still marked uncalibrated).

---

## 5. Alternate directions considered

Ranked by conviction; the first three shape V4 directly.

1. **"NCV X-ray" — support revision, not just composition.** Paste an existing draft →
   segment into paragraphs → run the lint per paragraph → map against a structural
   coverage checklist (stakes opener? role legibility? evidence keys? trajectory?
   future direction?). Deterministic, honest about being heuristic, and it matches the
   workflow we actually observed. *(In V4.)*

2. **Design for the advisor consult, not instead of it.** The most valuable input in
   both real CVs was the advisor's edit. Pathways is a research-services site; the
   tool's job is to make the consult dramatically more productive, not to replace it.
   Export an **advisor packet**: the draft + the researcher's own flags and notes +
   their questions for the session. *(In V4.)*

3. **Genre skeleton exemplars — the inverse of the weave.** People learn unfamiliar
   genres by reading annotated exemplars. Show a finished (invented) contribution
   paragraph per discipline with a "show the skeleton" toggle that color-codes which
   sentence plays which role. Directly teaches the "scaffold is invisible" insight.
   *(In V4.)*

4. **CCV import.** Every Canadian researcher maintains a Canadian Common CV, which
   exports structured XML. On-device parsing could prefill publications, grants, and
   supervision counts — removing the *retrieval* burden, which is the actually painful
   part. *(Deferred: feasibility spike.)*

5. **Print-fidelity export.** The real artifacts are dense two-pagers with shaded,
   keyed evidence boxes. Seeing your material in the genre's visual form is motivating
   and diagnostic — an empty evidence box looks naked. *(Minimal version in V4: a
   print-ready view.)*

6. **Session-based re-entry.** A CV is written over weeks; the tool assumed one pass.
   *(Cheap version in V4: a welcome-back banner with where you left off and open flags.)*

7. **Honest weave.** Field concatenation produces Frankenstein paragraphs. V4's weave
   inserts *connective-tissue suggestions* between parts (to address this → produced →
   to date → looking ahead) and warns about missing parts, rather than pretending the
   concatenation is prose. The researcher writes the final paragraph. *(In V4.)*

---

## 6. V4 scope

**`narrative-cv-prototype-v4.html`** — separate file, same hard constraints as V3
(no LLM, on-device, localStorage `ncv-v4`, design-system classes, nothing from the
private reference CVs).

| In V4 | Deferred |
|---|---|
| Two entry modes: compose fresh / **X-ray an existing draft** | CCV XML import (spike) |
| Reordered flow: Setup → (X-ray) → Contributions → Mentorship → PS → Review | Reviewer-rubric mapping (research task) |
| T1 lint restored, inline + live, with the **recalibrated ownership rule** (§4) | Calibration study over successful NCVs (needs Eli's corpus) |
| Per-field ✓/✗/? flags + notes (Round 2 essence, merged inline) | Moderated real-researcher session |
| Genre skeleton exemplars per discipline ("show the skeleton") | Consolidation back into `app.js` (after V4 stabilizes) |
| Weave with connective suggestions + gap warnings | Funder-rule authoritative data (unchanged from evaluation.md §5) |
| Advisor consult packet export; print-fidelity view; .txt export | |
| Light intake; work-mode asked just-in-time; session re-entry banner | |

**Convergence rule going forward:** new insights are edits to V4, not new files.
