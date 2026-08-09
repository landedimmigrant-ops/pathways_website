# NCV V4 — Full Analysis: Researcher Experience · UX · Deterministic Intelligence

**Date:** 2026-07-21
**Subject:** `narrative-cv-prototype-v4.html` (the declared convergence prototype, unchanged since Jun 10 2026)
**Method:** Full source read (1,307 lines) + live browser walkthrough playing a senior CIHR health researcher (persona modeled on the `marie_claude` test persona), exercising both entry modes end to end — Setup → Contributions (with lint probes) → Mentorship → Personal statement → Review → advisor packet — plus a Draft X-ray run on a realistically messy paste and a French-language probe. Companion docs consulted: `narrative-cv-process-review.md`, `narrative-cv-evaluation.md`.

This is an analysis only — no code was changed.

---

## 0. Executive summary

**The design thesis is working.** Teaching an unfamiliar genre through worked exemplars ("show the skeleton"), honest deterministic checks framed as hints, and an advisor packet that positions the tool as consult-prep — that combination is coherent, differentiated, and survived a realistic fill-out. The recalibrated ownership rule behaves exactly as intended (live-verified: "We built the partnership; I led the methodology…" → *"Team voice + individual ownership — the balance reviewers want"*), and field-aware hedging correctly flags "could" in Outcomes while praising it in Impact.

**The five most consequential problems found** (all verified live, details in §3):

1. **The Personal Statement — the highest-stakes prose in the document — gets zero feedback.** No lint, no ✓/✗/? flags, no weave. The entire evaluation loop exists only on Contributions, so PS problems can never reach the advisor packet either.
2. **The lint has credibility-eroding blind spots**: "as of May 2024" is flagged as *hedging* (month "May" matches the modal `may`); spelled-out numbers ("three organisations", "seven years") are invisible to the specificity detector, so researchers following the standard style rule (spell out numbers under ten) get nagged for vagueness they don't have.
3. **French is a silent blind spot.** A French draft loaded with exactly the weaknesses the tool targets ("Nous avons développé divers projets… pourrait… bien accueillis") comes back nearly clean — 0/8 structural moves detected, one generic English flag. Three of the seven agency chips (FRQNT/FRQSC/FRQS) belong to researchers who often file in French. The tool never warns that its checks are English-only.
4. **The X-ray is noisy on real pastes.** Markdown/Word artifacts (`**Personal Statement**`) are linted as paragraphs; single-newline contribution blocks merge heading+body; and "cited 87 times" in *The Lancet Regional Health–Americas* fails the "evidence references" check because the detector greps for the literal word "journal" or a parenthesized year.
5. **Every chip click re-renders the whole stage and scrolls to page top** (`renderStage()` ends with `scrollTo(top: 0)`), destroying the researcher's place and keyboard focus mid-form. (Code-verified; this session's embedded pane suppresses smooth scroll, so it was confirmed by reading `renderStage`, not visually.)

**The biggest opportunity** is not fixing bugs — it's finishing the X-ray's thought: the tool already teaches sentence *roles* (stakes/role/activities/outputs/outcomes/impact) on invented exemplars, but never applies that reading to the researcher's own text. A deterministic sentence-role classifier (cue lexicons + tense + position heuristics — §4.1) would turn the X-ray from a checklist into the thing the tool's own copy promises: *"read your draft the way the genre does."* Everything needed for it already exists in the file (SEG_META taxonomy, exemplar colors, the lint engine's vocabulary lists).

---

## 1. The researcher walkthrough

What it felt like to fill out, stage by stage, as a senior community-health researcher aiming at a CIHR Project Grant.

### Setup — good first minute, one silent assumption
Two mode cards make the entry decision legible, and "most people do, eventually" is a genuinely disarming line. Agency → discipline → stage takes under a minute. Two quiet issues: **"Other / not sure" silently maps to TCV** framing with no acknowledgment, and TCV/CV-FRQ acronyms are never expanded for the novice the tool is otherwise so careful with. The "competition you're aiming at" free-text field pays off later (it's interpolated into the program-fit prompt) — but nothing tells you that at entry, so it reads as optional bureaucracy.

### Contributions — the strongest stage, and the busiest
The invented health exemplar with "Show the skeleton" is the best teaching moment in the tool — the color-coded sentence-jobs make the "invisible scaffold" insight land in seconds. The just-in-time work-mode question (instead of another setup screen) is the right call.

Friction observed while actually filling:
- **Six textareas + title + role chips + evidence rows + flags per contribution** is a wall. The exemplar shows the destination, but there's no sense of progress *within* a contribution — you can't tell which field matters most if you only have twenty minutes today.
- The live checks are well-worded and the *"rubric 2/4 — a hint, not a gate"* framing successfully avoids feeling graded. But **the role line gets a "No numbers" nag** — a specificity demand that doesn't fit a one-line role statement — and my stakes opener was told it was *hedging* because it contained "May 2024."
- The weave ("Assemble — see your material as one paragraph") is honest and motivating; connective pills (*to address this →*, *this produced →*) show without pretending. But it's **display-only**: the obvious next desire — edit the assembled paragraph right there — has no outlet, and clicking Assemble scrolls you to the top of the page (re-render), so you arrive at your assembled paragraph by scrolling back down to find it.
- Evidence keys drift: with an empty first row and a filled second row, the entry UI labels my proof point **"b"** while the weave and export re-letter it **"a"**.

### Mentorship — right shape, low support
Counts-then-trajectory is the correct structure (the trajectory row *who → stage → destination → why* is exactly the persuasive unit the real CVs showed). But this stage has **no lint, no flags, no exemplar** — the philosophy/EDI prompts are excellent questions answered into a void. The EDI prompt ("structural beats abstract") deserves the same worked-example treatment as contributions.

### Personal statement — the reorder works; the support vanishes
Writing the PS last genuinely is easier — the "the answer is usually already sitting in one of your contributions" note is true in practice. The fill-in anchor line ("I am a ___ at ___") is a great cold-start device. But this is where the tool most abandons the researcher: **no checks, no flags, no weave, no exemplar of a finished PS**. My standing paragraph was a comma-spliced list of credentials; the export stacked my six prompt answers as disconnected paragraphs, one of which ("A national community-owned data infrastructure…") isn't even a sentence. The contribution stage teaches assembly; the PS stage silently hopes.

### Review & export — the payoff, and it delivers
Coverage checklist, open-flag summary, self-check, consult questions, then three outputs. **The advisor packet is the best artifact this project has produced** — my questions at top, my own ✗/? flags with notes, the auto-check summary, then the full draft. It reframes the whole tool as consult-prep, which is exactly the positioning the process review argued for. Two caveats: the packet's auto-check section faithfully reproduces the lint's false positives (my advisor would read *"stakes: Hedging (may)"* about a date), and since only Contributions have flags, the packet can never carry a PS or mentorship concern.

### X-ray mode — right idea, brittle first contact
On a clean double-newline draft, segmentation + per-paragraph lint + the structural-moves table work, and the per-paragraph "we/our with no I nearby" catch on my PS paragraph was genuinely useful. On a *realistic* paste (markdown bold headers, single newlines inside numbered contributions) the results degrade fast — see §3 items 8–10. The "Next:" note pointing to Contributions is a good bridge, but the bridge is one-way: nothing carries the pasted draft *into* the builder.

---

## 2. The UX designer's read

### What's working (keep, and protect through the port)
- **Genre pedagogy over form-filling.** The exemplar + skeleton toggle teaches; the fields merely collect. That hierarchy is right.
- **Honesty as a design language.** "uncalibrated", "a hint, not a gate", "heuristic reading, not a judgment", "invented" on exemplars — this consistent register builds exactly the trust a no-LLM tool needs. It is the tool's personality; the pending tone pass should preserve it.
- **The researcher stays the author.** Weave refuses to write prose; flags are "Your call"; the packet is "prepared by the researcher." Nothing usurps voice.
- **Light intake, just-in-time context.** The V3→V4 de-escalation (5-dimension lens → 3 + JIT work-mode) was correct.
- **Mobile survives.** 375px: no horizontal overflow, readable checks, working layout. (Sticky banner wraps to 2 lines and costs ~100px of a phone screen.)

### Experience-level gaps (ranked)

| # | Gap | Why it matters |
|---|-----|----------------|
| U1 | **PS/Mentorship excluded from the feedback system** (no lint/flags/weave/exemplar) | The tool's support is inversely proportional to the stakes of the text. Also blocks those sections from the advisor packet. |
| U2 | **Re-render scroll-to-top + focus loss on every chip/evidence/weave interaction** | Mid-form disorientation; also an accessibility failure (focus destroyed). |
| U3 | **No sense of "what next" across the whole draft** | Coverage is a flat checklist on the last stage. A researcher with 20 minutes has no prioritized next action. |
| U4 | **No way to move a draft between devices** — localStorage only, no export/import of state | Real CVs are written over weeks across office/home machines. Privacy constraint makes this *more* important, not less: the file is the only transport. |
| U5 | **Data-loss silence**: `saveState` swallows storage failures; Reset is the only explicit state action | A researcher in Safari private mode (or with a full quota) could write for an hour and lose everything without one warning. |
| U6 | **X-ray is read-only** — analysis never becomes material in the builder | The observed real workflow is revision; the tool analyzes the draft then asks you to retype it. |
| U7 | **French unsupported and unannounced** | FRQ researchers get false reassurance (verified: 0/8 detection on a weak French draft). |
| U8 | **No PS/mentorship exemplars** | The tool's best teaching device stops after contributions. |

### Accessibility audit (will matter for the AEM/Concordia port)
- **Every textarea and input is programmatically unlabeled** — `promptBlock` renders the question as a `<label>` *sibling* with no `for`/`id` association (narrative-cv-prototype-v4.html:518–534). Screen readers announce bare "edit text".
- **Stage sidebar items are plain `<li>` with click handlers** — no `role`, no `tabindex`, no keyboard path (:438–443). This is the same pattern as the deferred researcher-review bug #3 in `app.js`; the V4 port is where it was meant to be fixed, so it must not be carried over.
- **Flag buttons (✓/✗/?) expose state only via background color** — no `aria-pressed`, and the symbol-only labels rely on `title` (:557–569).
- Mode cards are real `<button>`s (good); chips are real buttons (good); the accessibility-tree read in testing showed the mode cards exposing no accessible name — likely the h4/p content not being computed in this pane, but worth an explicit `aria-label` each.
- Exactly one ARIA attribute exists in the whole tool (the banner's `role="status"`).

### Small polish items
- Exemplar superscript keys render after the trailing space, so they visually attach to the *next* sentence ("…validation study. ᵃThree regional clinics…") (:761–764).
- "+ Add another contribution" silently no-ops at the 10-cap (:794).
- Print view via `document.write` on `window.open` — popup blockers eat it with no fallback message (:1288–1289).
- The X-ray coverage row "Opens with 'I am a…' anchor" actually tests the *whole document*, not the opening (:664).

---

## 3. The code review

### Architecture
For a 1,300-line single-file prototype, the code is in good shape: one IIFE, one state object with versioned localStorage key, a declarative prompt library with lens variants (`resolveQ`/`variants` is a clean pattern), pure-ish builders (`buildWeave`, `buildExportText`, `buildAdvisorPacket`) cleanly separated from rendering, and zero dependencies. Two structural notes for the `app.js` port:

- **Full-stage re-render on every interaction** is the root cause of U2 (scroll/focus loss). The fix is either (a) drop the unconditional `window.scrollTo` in `renderStage` (:467) and re-render only the affected card, or (b) capture/restore scroll + focus around re-renders. (a) is less code and removes a whole class of problems.
- **The lint engine and the prompt system are already portable** — `lintField`, `PROMPTS`, `EXEMPLARS`, `analyzeDraft` have no DOM dependencies and can move to `app.js` (or a shared module) verbatim.

### Verified defects

| # | Defect | Where | Severity | Fix sketch |
|---|--------|-------|----------|------------|
| 1 | Month **"May" flagged as hedging** ("as of May 2024" → *Hedging (may)*) | `HEDGES` (:240), `lintField` (:274) | **High** — false positives in the packet erode the whole engine's credibility | Case-sensitive check for `may`: flag lowercase `may`; skip `May` when followed by a digit/year or preceded by "in/of/since" |
| 2 | **Spelled-out numbers invisible** to specificity ("three organisations", "seven years" → *No numbers*) | number regex (:262) | **High** — punishes standard style | Add a number-word lexicon (`one…twenty, dozen, half`) to the counter |
| 3 | **PS & mentorship fields have no lint/flags** | `renderPersonal` (:1046–1052), `renderMentorship` (:1009–1011) | **High** (see U1) | Pass `lintKind`/`flagObj` in those `promptBlock` calls; add `ps`-appropriate kinds (hedging fine in horizon, ownership check on streams/standing) |
| 4 | **Evidence key drift** between entry UI and weave/export (UI keys by row index :886; weave re-keys by filtered index :914) | | Medium | Key by filtered position in both places (recompute badges on input), or filter empty rows out of the UI numbering |
| 5 | `renderStage` **scrolls to top on every re-render**; also destroys focus | :467 | **High** | See architecture note; gate the scroll to actual stage *changes* |
| 6 | **Ownership verbs are past-tense-only** (except `direct`, `lead`): "I supervise 14 students", "I hold the Chair" → no ownership strength | `ACTION_VERBS` (:237) | Medium | Add present-tense forms + `hold`, `supervise`, `run`, `co-lead`, `maintain`, `convene` |
| 7 | `saveState` **silently swallows storage failures** | :325 | Medium (data loss) | On first catch, show a persistent banner ("Couldn't save — download a backup") |
| 8 | X-ray: **markdown/Word headers linted as paragraphs** (`**Personal Statement**` → "No numbers…") | `analyzeDraft` (:660–678) | Medium | Normalize paste (strip `*`/`#`, smart quotes) and detect header lines (short, title-case, or known section names) |
| 9 | X-ray: **single-newline blocks merge** heading+body into one paragraph, defeating `isHeading` | split regex (:661), `isHeading` (:674) | Medium | Two-pass segmentation: split on `\n\s*\n+`, then split leading `^\d+[.)] …` lines off their bodies |
| 10 | X-ray: **evidence detector misses real evidence** ("cited 87 times", named journals like *The Lancet* without the word "journal") | coverage regex (:668) | Medium | Add patterns: `cited \d+`, `\d{4}\b` anywhere, DOIs, `presented at`, title-case-run + press/venue lexicon |
| 11 | **Unlabeled form controls**; sidebar `<li>` not keyboard-accessible; flag buttons lack `aria-pressed` | :518–534, :438–443, :557–569 | Medium (blocking for Concordia a11y) | `for`/`id` pairs; `role="button" tabindex="0"` + Enter/Space, or make them `<button>`; `aria-pressed` on flags |
| 12 | Role line gets specificity nag ("No numbers") — rule misfit for a one-liner | `renderChecks(…, "roleLine")` (:849) | Low | Skip the specificity detector for `roleLine` kind |
| 13 | Evidence row text is never linted ("widely cited" typed into a proof point passes) | `renderEvidence` (:879–909) | Low | Run vague-language on evidence text |
| 14 | Exemplar superscripts attach to following sentence | :761–764 | Low | Append sup before the trailing space |
| 15 | Silent 10-contribution cap; print-view popup failure silent; "Opens with" coverage label overclaims | :794, :1288, :664 | Low | Message each |

*(Also noted: the V1-era `narrative-cv-evaluation.md` documents rules that drifted in V4 — bare years were supposed to be excluded from "numbers," `some` was in the vague list, evidence was a linted field. Worth a one-line changelog in that doc when V4's rules are finalized, since it's the audit trail the "auditable" promise points to.)*

---

## 4. Making it intelligent without an LLM

The constraint (deterministic, on-device, auditable) is a feature — but V4 currently spends it almost entirely on *word-list lint*. There are four higher leverage places to spend it. Effort: S = hours, M = a day-ish, L = multi-day.

### 4.1 Upgrade the reading — from word lists to structure

**A. Sentence-role X-ray (the flagship; M/L).** The tool already owns a six-role taxonomy (`SEG_META`), colors, and exemplars. Apply it to the researcher's own text:
1. Sentence-split (regex with abbreviation guards — `Dr.`, `et al.`, `e.g.` — plus `?!` handling).
2. Score each sentence against each role with transparent features:
   - *stakes*: problem lexicon (`challenge, gap, need, risk, fail, invisible, lag`), negations of knowledge (`no data, little is known`), position-in-paragraph prior (first sentence).
   - *role*: `I am / I lead / I direct / I hold`, appointment nouns.
   - *activities*: `I/we + action verb` in past tense, method nouns.
   - *outputs*: artifact nouns (`paper, dataset, toolkit, exhibition, monograph, protocol`), `produced/published/released`.
   - *outcomes*: present-perfect (`has/have been adopted/cited/used`), uptake verbs, `to date / now / since`.
   - *impact*: modals + scale nouns (`field, sector, national, population`), `could/aims to/if validated`.
3. Argmax with a confidence floor; below floor → honest "unsure".
4. Render each X-ray paragraph with the same color underlay as the exemplar skeleton, plus a per-contribution "missing moves" line (*"This contribution has activities and outputs but no sentence doing the outcomes job"*).

This one feature closes the loop between the tool's teaching device and the researcher's actual draft, and it is fully auditable — every cue list can be printed in `narrative-cv-evaluation.md` with a rule ID. It also upgrades the coverage table from document-level to per-contribution (fixing the masking problem where one contribution's outcomes hide another's absence).

**B. Tense & voice checks (S/M).** Two regex-scale detectors with outsized genre value:
- *Passive voice density* (`was/were/been + participle`): passives erase agency — the genre's cardinal sin. Flag only above a threshold (e.g. >30% of sentences in Activities) to avoid nagging.
- *Tense-field mismatch*: future/conditional constructions in Outcomes (`will, going to, we hope to`), past-only Impact with no forward-looking clause. This is the grammatical shadow of the hedging rule and catches what the hedge word-list misses ("we hope to expand" has no listed hedge word).

**C. Number-words + richer specificity (S).** Fix defect #2; additionally credit named proper entities (capitalized multi-word runs — "Statistics Canada", "City of Montréal") as verifiable specifics. The evaluation doc already anticipates authoritative name lists (§5); a generic proper-noun detector works today and the curated lists can upgrade it later.

**D. Acronym audit (S).** Collect `\b[A-Z]{2,}\b` tokens; flag any used ≥1 time but never expanded (no preceding spelled-out phrase or parenthetical) and not on a safe list (CIHR, SSHRC, NSERC, FRQ*, PhD, EDI, OCAP…). Interdisciplinary panels are the NCV's audience; unexpanded acronyms are a classic reviewer complaint. Cheap and dramatic.

**E. Redundancy detector (M).** Token-set cosine similarity between all contribution-field pairs and between PS↔contributions. >0.75 similarity → "These two passages make nearly the same claim — is one of them earning its space?" Catches the very common failure of the same achievement being spent twice.

**F. Reviewer-skim view (S).** A toggle that renders only the first sentence of each paragraph/field (reviewers skim topic sentences). No analysis at all — just a projection — yet it instantly teaches whether the draft's argument survives skimming. Possibly the highest insight-per-line-of-code feature available.

**G. French support — or at minimum, French honesty (S for detection, M/L for lexicons).** Detect language via stopword sniff (`le, la, les, et, nous, avons` frequency). Then either (a) show *"Checks are English-only — your draft looks like French, so the auto-checks are off"* and suppress the misleading green, or (b) port the lexicons (`nous/notre` ↔ we/our, `divers/plusieurs` vague list, `pourrait/devrait` hedges, French action verbs). Given FRQ is three chips of seven and the official Concordia page is bilingual, (b) is where this ends up; (a) is the honest stopgap and costs an afternoon.

### 4.2 Upgrade the coaching — from checklist to prioritizer

**H. Next-best-action engine (M).** The tool knows everything needed to answer "what should I do next?": empty fields × genre importance, open lint flags × severity, ✗/? flags, evidence-less contributions, missing PS moves. Encode a static priority table (e.g. *contribution with no outcomes* > *PS missing standing* > *no evidence keyed* > *vague phrases*), and surface the top 1–3 as a persistent "Next" card on every stage and at the top of the re-entry banner ("Welcome back — the highest-value gap is Contribution 2's outcomes"). This converts twenty scattered signals into a coach, deterministically. The re-entry banner already proves the pattern; this feeds it real intelligence.

**I. Per-contribution strength meter (S).** Aggregate the existing per-field rubric into one honest bar per contribution card header (fields present × lint-clean × evidence keyed), so effort allocation is visible while writing, not just at Review. Label it with the established register: "a hint, not a grade."

**J. Portfolio-level balance checks (S/M).** New rule family on the Review stage, all computable today: all-contributions-one-project (title token overlap), evidence-type monoculture (5 contributions, all "Peer-reviewed" — where's uptake?), recency spread (years mentioned cluster >10 years back), length imbalance (one contribution 3× the others), agency-fit note (CIHR + zero health-uptake evidence types). These are *advisor-grade* observations — exactly what Eli/Holly would notice in the first minute of a consult.

### 4.3 Upgrade the workflow — from single sitting to real weeks

**K. X-ray → builder import (M).** After segmentation (with defect #8/9 normalization), offer per-block "Bring into builder →" actions: numbered blocks become contributions (title from the heading line, body into activities as a starting point, flagged "imported — unsorted"); with 4.1A in place, sentences can even pre-sort into fields with an "unsure" bucket. This closes the tool's biggest workflow gap: revision currently means retyping.

**L. State backup / restore (S).** "Download working file (.json)" + drag-to-restore. Two buttons, `JSON.stringify(ns)` / `Object.assign` on the existing load path. Solves cross-device portability (U4), quota data-loss (U5's mitigation), *and* gives researchers an archival copy — all without violating the on-device privacy rule; the researcher physically carries the file.
**Companion (S):** storage-failure banner per defect #7, nudging a backup download.

**M. Session snapshots + advisor diff (M).** On each visit (or manual "snapshot"), push `{date, state}` onto a capped history array. The advisor packet gains a "Changed since last consult" section from a field-level diff — advisors currently re-read the whole packet to find what moved. Deterministic diffing at field granularity is a page of code (compare strings, report changed/added/emptied fields).

**N. CCV XML import (L — the roadmap already names it; this is the endorsement).** The Canadian Common CV exports structured XML every researcher already maintains. On-device parse (`DOMParser`, no network) → prefill mentorship counts, offer publications/grants as a picklist to attach as typed evidence rows. It removes the *retrieval* burden — the genuinely painful part — and the evidence-row model is already shaped to receive it. Run the feasibility spike on a real CCV export first (schema variance is the risk).

**O. Evidence-type auto-suggestion (S).** Regex-classify pasted evidence text and preselect the dropdown: DOI/vol-pages → Peer-reviewed; `$`/`grant` → Funding; `award/prize` → Award; `cited \d+` → Replication/citation; `CBC|Radio-Canada|press` → Media; `adopted|policy|ministry` → Policy uptake. Small, delightful, and teaches the typology by demonstration.

**P. Richer exports (M).** The .txt ceiling undersells the print view's insight. A `.doc`-openable HTML export (Word opens HTML with a `.doc` extension; no library needed) styled like the print-fidelity view — serif, keyed evidence boxes — gives researchers something they can actually continue in Word, where this document will inevitably live. Advisor packet as printable HTML with the flags as margin notes belongs here too.

### 4.4 Upgrade the trust — keep the honesty compounding

**Q. Per-flag dismiss (S).** An "×" on each lint flag → "doesn't apply here", stored per field+rule, listed transparently in the advisor packet as "checks the researcher set aside." Kills the residual nag cost of false positives (there will always be some) while keeping the audit trail honest — and dismissals become exactly the calibration data the evaluation doc's §7 feedback loop asks for.

**R. "Why this flag?" links (S).** Each flag links to a one-paragraph explainer with a before/after example (static content keyed by rule ID, which `narrative-cv-evaluation.md` §2 has already half-written). Converts lint from verdict to lesson, which is the tool's whole personality.

---

## 5. Priorities

**P0 — before more colleague testing** (all S, one sitting):
lint credibility fixes (#1 May, #2 number-words, #6 verb tenses, #12 roleLine), scroll/focus fix (#5), storage-failure banner (#7), French detection honesty (G-stopgap), JSON backup/restore (L).

**P1 — the experience step-change** (the port-defining features):
PS + mentorship join the feedback system (#3 + exemplars, U1/U8) · sentence-role X-ray (A) with paste normalization (#8/#9/#10) · next-best-action card (H) · X-ray→builder import (K) · accessibility pass (#11) — do this *in* V4 so the `app.js` port inherits it.

**P2 — the deepening** (post-port or parallel):
per-contribution meter (I) · portfolio checks (J) · skim view (F) · acronym audit (D) · tense/voice (B) · evidence auto-typing (O) · advisor diff (M) · richer exports (P) · dismiss + explainers (Q/R) · full French lexicons (G) · redundancy (E).

**CCV import (N)** stays a scheduled spike — highest ceiling, most unknowns.

Two standing dependencies from the process review remain the real bottleneck on *calibration* (word ranges, rubric weights): Eli's successful-NCV corpus and the published reviewer criteria. Everything in §4 is designed to be shippable without them and recalibratable when they land.

---

## 6. Closing note

V4's bet — that a no-LLM tool can still feel intelligent — is winnable, but not by adding more word lists. The pattern that already works everywhere in this prototype is: *encode the genre's structure once, then project the researcher's own material through it* (exemplar→skeleton, fields→weave, flags→packet). §4's proposals are all the same move applied further: roles projected onto their sentences, priorities projected onto their gaps, diffs projected onto their weeks. The intelligence is in the genre model, not the model weights — which is, conveniently, the only kind of intelligence that survives the privacy constraint, the AEM port, and an advisor's audit.
