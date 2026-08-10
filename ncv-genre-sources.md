# Narrative CV — Genre Sources (Canada/Québec vs Europe)

*Sourced reference notes for the NCV tool: what the real formats actually require, where the
public worked examples live, and what it all implies for `narrative-cv-prototype-v4.html`.
Compiled from a web scan run 2026-08-09/10. Dates shown are the sources' own stamps.
Companion to `narrative-cv-evaluation.md`, `narrative-cv-process-review.md`, and
`NCV_V4_ANALYSIS_2026-07-21.md` (defect/gap numbers referenced from there).*

**How to read this:** §1–§4 are facts with sources. §5 is the implications table that feeds
the optimization backlog. §6 lists what could NOT be verified — treat nothing there as
established. Anything here that contradicts tool copy wins until Eli/Holly say otherwise.

---

## 1. Canada — the Tri-agency CV (TCV)

Primary sources:

| Document | URL | Date |
|---|---|---|
| CIHR TCV instructions (canonical) | https://cihr-irsc.gc.ca/e/54286.html | modified 2025-07-24 |
| SSHRC TCV instructions | https://sshrc-crsh.canada.ca/en/funding/forms-and-online-application-tools/tri-agency-cv-instructions.aspx | — |
| NSERC TCV instructions | https://nserc-crsng.canada.ca/en/funding/research-partnerships-and-collaborations/inter-agency/tri-agency-cv/tri-agency-cv | — |
| TCV FAQ | https://cihr-irsc.gc.ca/e/53575.html | — |
| **Reviewer guidelines** | https://cihr-irsc.gc.ca/e/54339.html | — |
| CIHR template (DOCX) | https://cihr-irsc.gc.ca/e/documents/cihr_tri-agency_cv_template-en.docx | — |
| CIHR TCV rollout update | https://cihr-irsc.gc.ca/e/54668.html | 2026-03-19 |
| CCV status notice | https://ccv-cvc.ca/info_en/ | — |

**Structure** — exactly three sections plus a temporary appendix (appendix excluded from the
page limit; exists to bridge data gaps until the Tri-agency Grants Management Solution):

1. **Personal statement** — why you suit your proposed role *on this application*. Prompts
   include collaborations/past performance, expertise, impact/benefits, leadership,
   **lived or living experience**, productivity context, recognitions.
2. **Most significant contributions and experiences** — **up to ten**. Each must explain
   *impact, significance, usefulness, and your role*. A contribution need not be one
   publication — a cluster counts as one. ~15 admissible categories (publications;
   assessment/review; community service; Indigenous leadership; creative outputs; datasets;
   EDIA advances; events; IP; knowledge mobilization; methodologies/knowledge systems;
   new companies; partnerships; policies/standards; products/services; software/tools).
3. **Supervisory and mentorship activities** — formal *and informal*; includes HQP heading
   to non-academic careers, safe/equitable environments, outreach, training beyond course
   requirements.

**Hard rules:**

- **5 pages English / 6 pages French.** No per-section limits. Overflow pages are removed
  **without notification, before reviewers see the file** (FAQ + reviewer guidelines).
- Agency template mandatory. **CIHR/SSHRC: Arial 12**, black, single spacing minimum, 2 cm
  margins, unprotected PDF ≤ 5 MB. **NSERC defers formatting to each funding opportunity**
  — three agencies, three formatting regimes; a tool cannot hardcode one.
- Citations: any style common in the field; **asterisk (`*`) after each supervised HQP's
  name; bold the lead author** where authorship order doesn't show it.
- **Self-contained: hyperlinks banned**, single exception = demonstrating **audio/visual
  creative outputs** where the opportunity allows — and reviewers are told they need not
  open them. Reviewers must be able to assess without leaving the document.
- **Voice: no agency mandates first person.** Verified across CIHR/SSHRC/NSERC instructions,
  FAQ, and reviewer guidelines. What IS mandated: your role must be unambiguous in every
  contribution. (First-person advice is institutional — Concordia, U Winnipeg, Aberdeen.)
  → The tool should recommend "I", not claim the agencies require it. V4's ownership rule
  ("make your role unmistakable") is exactly the mandated requirement.

**What reviewers are told** (reviewer guidelines — the rubric the tool's output is scored
against):

- *Quality indicators*: EDI in the research process; novel/rigorous methodology;
  capacity-building via mentorship; ethical conduct; transparency/accessibility of results;
  data stewardship.
- *Impact indicators*: use of results by stakeholders; reconciliation/decolonization;
  advances to state of the art; economic/environmental/societal contributions; equitable
  participation; public understanding; policy/standards influence; **influence on direction
  of thought** (= academic impact counts, matching V4's "academic impact counts" tag).
- **Banned as surrogates: Journal Impact Factor, h-index, venue prestige,
  publication/citation counts in isolation, grant size/number.** This is a *reviewer*
  instruction, so a tool can flag JIF/h-index language as an active risk, not a style nit.
- Also: whole CV read as a unit; overlap between sections allowed; non-linear careers not
  penalized; career-long or recent-only both fine.

**Rollout status (matters for personas' realism):** CIHR (2026-03-19): the TCV will NOT be
used for the Project Grant before **Fall 2027 at the earliest**; 18 CIHR competitions
piloted; in pilots only the Nominated Principal Applicant (or few) submits a TCV. SSHRC
currently requires it in Destination Horizon, Knowledge Synthesis, and Impact Awards.
**CCV XML export still works** (ccv-cvc.ca help Q7: Utilities → Export CV XML) and no CCV
offline date is set — the CCV-import spike in the tool backlog remains viable.

---

## 2. Québec — the CV-FRQ

Naming: **"CV commun canadien" = the (retiring) Canadian Common CV. The FRQ narrative CV is
the "CV-FRQ" / "CV descriptif du FRQ"** — never label it "CV commun".

Primary sources:

| Document | URL | Date |
|---|---|---|
| FRQ CV page (EN) | https://frq.gouv.qc.ca/en/frq-cv/ | — |
| **Instructions (FR) — authoritative** | https://frqnet.frq.gouv.qc.ca/Documents/CV-FRQ_instructions.pdf | **Juillet 2026** |
| Instructions (EN — stale) | https://frq.gouv.qc.ca/app/uploads/2026/03/cv-frq_instructions_en.pdf | Nov 2025 |
| Template (FR/EN DOCX) | https://frqnet.frq.gouv.qc.ca/Documents/CV-FRQ_modele.docx | — |
| Presentation standards (EN) | https://frq.gouv.qc.ca/app/uploads/2026/03/normes_presentation_en.pdf | 2025-09-23 |

> ⚠ **The July 2026 FRENCH instructions are the authoritative text; the English PDF lags by
> eight months.** Build against the French. (The EN link printed on FRQ's own CV page
> serves an HTML shell, not a PDF — broken as of the scan.)

**Structure:** (1) **Parcours et compétences** — how your academic, professional *or
personal* path meets *this program's* objectives and evaluation criteria, with precise
examples; (2) **Contributions et expériences les plus importantes** — up to ten, each with
**date or period** and a **target-audience tag: A = academic, B = practice, C = general
public**; (3) **Activités de supervision et de mentorat** — prefaced "le cas échéant."

**Hard rules (deltas from the TCV):**

- **6 pages French / 5 pages English** (mirror of the federal asymmetry). No obligation to
  fill the space.
- **Times New Roman 12** (not Arial), 2 cm margins, name in header, doc title in footer,
  continuous page numbers, PDF ~2 MB, **filename rules** (≤50 chars,
  `NAME_XXXXX1234_Document-title.pdf`, no spaces/accents, one period).
- **APA (latest)** default citation style, or another recognized standard.
- **Bold your own name AND named co-researchers**; HQP asterisk same as TCV.
- Non-applicable section → write **`s.o.`** (2026: may briefly explain why).
- **Acronyms and technical terms must be defined** (2026 addition — this makes the
  planned acronym audit an *official-rule* check, not a style preference).
- **No sensitive personal information, no photos** (no TCV equivalent).
- 2026 framing: the CV is an *outil de contextualisation*; structure/formatting called
  essential — bold, italics, short paragraphs, lists, subsections, tables explicitly
  permitted ("make it skimmable" is official advice).
- Hyperlinks: permitted as bibliographic references where appropriate, but the application
  must not depend on external content.
- **Language**: forms in French; **attached documents may be French or English** — an
  anglophone can file an English CV-FRQ (5 pp) inside a French form. (From the
  presentation-standards PDF; RGC art. 3.6 not directly verified — see §6.)
- Portal split (2026): new-FRQnet competitions enter the CV directly in the portal; the
  Word template is only for the old portal → a tool should produce both pasteable
  plain text and a formatted document.

---

## 3. Europe — the contrast set

- **UK — Royal Society "Résumé for Researchers" / UKRI R4RI**
  (https://royalsociety.org/news-resources/projects/research-culture/tools-for-support/resume-for-researchers/ ;
  https://www.ukri.org/apply-for-funding/develop-your-application/resume-for-research-and-innovation-r4ri-guidance/ ,
  updated 2026-04-30): **four modules** — generation of knowledge; development of
  individuals; wider research community; broader society. ~**1,000 words** total (Royal
  Society; UKRI sets limits per opportunity) + optional **500-word "Additions"** for career
  context. Embedded in the UKRI Funding Service as one question ("why are you the right
  individual or team"); team variant (R4RI4T) covers a whole consortium.
- **Netherlands — NWO evidence-based CV** (https://www.nwo.nl/en/evidence-based-cv):
  academic profile (free narrative) + **key outputs capped at 10**, open-access status
  flagged; lineage Veni 2019 → evidence-based CV 2023. No public word/page limit found.
- **Switzerland — SNSF** (https://www.snf.ch/en/gKcnwW6aEft4bMPF/page/your-curriculum-vitae-all-about-the-cv-format):
  education/employment tables + **1–3 major achievements** across the career, ≤ **10 works**
  total, each cited once; **net academic age** (FTE research time, with deductions);
  ORCID iD; **no publication list at all** — the most aggressive break with tradition.
- **CoARA/DORA**: Canada's tri-agency + FRQ justify their narrative CVs via **DORA**
  signatory status (TCV FAQ); CoARA membership not verified. DORA–CoARA joint statement
  2025-12-04 (https://sfdora.org/2025/12/04/dora-coara-in-collaboration/).

**Structural mismatches that matter for any import/reuse feature:** UKRI modules 1, 3 and 4
all collapse into TCV section 2 (and split three ways going the other direction). UK
guidance says cite by hyperlinked DOI to save space — **directly non-compliant with the
TCV's self-containment rule**; any UK-derived template must expand DOIs into full
citations. Canadian narrative CVs are also ~2.5–3× the UK word budget (5 pp Arial 12
single-spaced ≈ 2,500–3,000 words vs ~1,000).

---

## 4. Exemplar shelf — public worked examples worth studying

Ranked by usefulness to this tool:

1. **Concordia's own workshop deck** (Eli Friedland, Spring 2025) —
   https://www.concordia.ca/content/dam/research/docs/narrative-cv/Narrative_CV_Workshop.pdf
   Three genuine per-section example extracts (personal statement, ECR contribution,
   Canadian-flavoured mentorship paragraph with named destinations) + the
   **"set your own goal posts" technique**: number the expertise your proposed project
   needs at the top of section 2, then tag each contribution back to those numbers.
   Directly implementable as a tool feature. Companion pages: FAQ
   (https://www.concordia.ca/research/for-researchers/narrative-cv/faq.html — incl. metrics
   guidance: individual citation counts OK per DORA, **JIF/h-index no**; career-delay
   handling; AI-use note) and the French Atelier deck.
2. **U Winnipeg — instructions + sample statements** —
   https://www.uwinnipeg.ca/research/docs/uwinnipeg-narrative-cv-instructions-sample-statements.pdf
   **14 fill-in-the-blank sample statements mapped 1:1 onto the three TCV sections** plus a
   4–5-question reflective bank per prompt — effectively a ready-made template library +
   interview flow. First-person framed as "many people choose to."
3. **U Winnipeg — CRC narrative CV guidance** (2024-06-14, adapted from Oxford) —
   https://www.uwinnipeg.ca/research/docs/guidance-for-narrative-cvs-for-uwinnipeg-crc-applications.pdf
   The **paragraph grammar**: summary sentence → succinct evidenced contributions
   (groupable) → sweep-up closing sentence; plus two reusable sentence formulas with
   bracketed evidence slots. Closest thing in Canada to a deterministic template spec.
   (Its hyperlinked-DOI advice is CRC/UK-style — non-compliant for TCV.)
4. **U Aberdeen — annotated R4RI guidance** (v1.0, 2023-08) —
   https://www.abdn.ac.uk/media/site/staffnet/documents/UoA_Annotated_guidance-UKRI-R4RI-v1.0-Aug-23.pdf
   The best *real prose* examples found anywhere (via the Glasgow pilot): ethnographer
   self-description, informal-leadership postdoc story, supervision, peer-review/editorship.
   Clearest voice rules in print: narrative style, first person, active verbs, role clear
   in collaborations, every statement evidenced. Study the prose; discard the DOI advice.
5. **NZ MBIE — ECR narrative CV example** —
   https://www.mbie.govt.nz/dmsdocument/25177-narrative-cv-example-early-career-researcher
   A full worked early-career example (non-European but genre-adjacent).
6. **Carleton** — https://research.carleton.ca/research-support/funding-and-awards/tri-agency-narrative-cv/
   Per-section templates; two sharp heuristics: a section ≈ ¾–1 page; **avoid
   "one publication = one contribution."**
7. **U Calgary / tcvguide.ca** — https://research.ucalgary.ca/engage-research/knowledge-impact/narrativeCV
   → https://tcvguide.ca — a U Calgary web app advertising templates/examples/**AI-powered**
   writing assistance. Content unverified (JS app, see §6) — but note it as the nearest
   competitor; its AI-first positioning is exactly the gap a private, no-LLM tool sits in.

---

## 5. Implications for the V4 tool

| # | Fact (section above) | Implication for V4 | Type |
|---|---|---|---|
| I1 | Hyperlinks banned in TCV (§1) | New deterministic check: flag URLs/DOIs in draft text when format = TCV (exception note for A/V creative outputs, `creative` discipline) | New check |
| I2 | JIF/h-index/venue-prestige banned as surrogates, reviewer-side (§1) | Extend the vague/prestige word list: "impact factor", "IF n", "h-index", "top-tier/prestigious venue", raw "cited N times" *without context* stays fine | New check |
| I3 | FRQ 2026: acronyms must be defined (§2) | The planned acronym audit (analysis §4.1-D) is now an official-rule check for CV-FRQ mode — promote its priority | Priority change |
| I4 | CV-FRQ contributions need date/period + A/B/C audience tag (§2) | CV-FRQ mode: add two small fields per contribution (period; audience A/B/C chips) + export them; `s.o.` handling for empty sections | New fields |
| I5 | Page budgets: TCV 5pp EN/6pp FR ≈ 2,500–3,000 words (§1,§3) | The word-budget meter gets an authoritative anchor: show estimated pages vs the limit per language; per-field ranges stay "uncalibrated" | Calibration |
| I6 | No agency mandates "I" (§1) | Keep the ownership rule; soften any copy that implies "I" is *required* — the requirement is role-legibility | Copy |
| I7 | Both formats are aimed at *this* application (§1,§2) | Validates V4's "aimed, not generic" framing; strengthens the case for the evidence-bank/"CV instance" concept (persist material, generate per competition) | Architecture |
| I8 | "Set your own goal posts" numbered-expertise technique (§4.1) | Candidate feature: optional numbered-expertise list in the PS stage that contributions can tag — deterministic cross-referencing, from Concordia's own deck | New feature |
| I9 | U Winnipeg sentence stems + CRC paragraph grammar (§4.2–3) | Source material for PS/mentorship exemplars (analysis U8) and for per-field "stuck? try this shape" hints — adapt, don't copy | Content |
| I10 | Overflow pages removed silently before review (§1) | Sharpen the page-budget warning copy: overflow isn't "trimmed", it's *deleted unread* | Copy |
| I11 | TCV allows up to 10 contributions; Carleton: don't do 1 pub = 1 contribution (§1,§4.6) | V4's "3–5 strongest, cap 10" already matches — keep; add the anti-pattern note to help text | Copy |
| I12 | CCV XML export alive, no sunset date (§1) | CCV-import spike stays viable; no urgency change | Status |
| I13 | FRQ English instructions lag French by 8 months (§2) | Any FRQ-facing copy cites the French instructions as authoritative; note for the bilingual Concordia page handoff | Process |
| I14 | Formatting matrix: Arial (CIHR/SSHRC) vs opportunity-specific (NSERC) vs TNR (FRQ) (§1,§2) | Print view should switch font family by format; filename hint for FRQ export | Export |
| I15 | Reviewer quality/impact indicator vocabulary (§1) | Candidate: a Review-stage "reviewer's checklist" rendered from the official indicators (static, sourced) — the reviewer-rubric mapping task (process-review §6) now has its source | Deferred→active |

---

## 6. Not verified — do not treat as established

- **tcvguide.ca** content (client-side JS; only metadata read) — needs a browser visit.
- **CIHR TCV learning tool** (Adobe Captivate app) — likely rich; needs manual opening.
- SSHRC "tips" DOCX — body contained only empty fields; tips may live in Word comments.
- SNSF ~4,350-character achievement limit — factsheet snippet only.
- NSERC 2027 Discovery Horizons / Arthur B. McDonald TCV adoption — snippet only.
- FRQ end of CCV bridge (2025-12-19) — snippet only.
- FRQ RGC article 3.6 language rule — PDF extraction failed; language facts above come
  from the presentation-standards PDF instead.
- Western's workshop decks — SharePoint login-gated.
- NWO word/page limits — not stated publicly.
- Tri-agency CoARA membership — only DORA confirmed.
