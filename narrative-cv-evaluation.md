# Narrative CV — Evaluation Methodology

*Companion document to [`narrative-cv-prototype.html`](narrative-cv-prototype.html).
This describes every check the prototype performs on a researcher's draft text,
why it does it, and what it deliberately does not do.*

**Status:** v1 — Phase F (Round 2 redesign). 2026-05-21.

---

## 1. Why LLM-free

Every check below runs as deterministic JavaScript in the researcher's browser.
No data leaves the page, no external API key is required, no third-party
service touches the draft.

This is a deliberate design choice for a Concordia research-services tool:

| Property | What it buys us |
|---|---|
| **Privacy** | Unpublished research narratives never leave the device — important for researchers thinking about emerging IP, sensitive partnerships, or community-owned data. |
| **Speed** | Auto-checks update on every keystroke. No 1–3 s API round-trip. |
| **Auditable** | Every rule is in this document. Researchers and advisors can read what triggered a flag, push back on rules they disagree with, and propose new ones. |
| **No cost** | No API budget, no rate limits, no key management. |
| **Offline** | The tool works without an internet connection once loaded. |

**What we honestly cannot do without an LLM:**

- Paraphrase or rewrite the researcher's text
- Judge semantic clarity ("does this *make sense* to a reviewer outside the field?")
- Assess originality, novelty, or whether an impact claim is realistic
- Catch hedging-by-indirection (`"this work was carefully designed to address…"` —
  hedging by sentence structure rather than by lexical hedge words)
- Detect logical inconsistencies between fields beyond literal token overlap
- Suggest a contextually-appropriate rewrite that preserves voice

These limits are real. The tool helps the researcher catch a class of common
weak patterns; it does not replace human review or a consult.

---

## 2. What gets evaluated

Five Tier-1 detectors run on every text field in the contribution bundles.
Each has a **stable rule ID** so feedback can reference it directly
(e.g. *"Disagree with `T1.vague-language` flagging 'significant' — in
mathematics it has a precise technical meaning"*).

### `T1.first-person-ownership`

**What it checks**

| Signal | Pattern | Verdict |
|---|---|---|
| Collective voice | `\b(we|us|our)\b` (case-insensitive) | Flag — *"Used 'we' Nx — try 'I' or 'I led a team that…'"* |
| Individual voice | `\bI\b` paired with an action verb within 4 tokens, action verbs: `led, designed, built, developed, co-led, co-designed, founded, supervised, secured, established, negotiated, authored, ran, ran the, validated` | Strength — *"Strong ownership marker present"* |
| Weak collaboration | Exact phrases (case-insensitive): `worked on`, `participated in`, `assisted with`, `was involved in`, `helped with`, `contributed to` (the last when used about your own work, not citations) | Flag — *"Weak collaboration verb — describe what YOU did specifically"* |

**Why it matters** — Eli's #1 finding across both review sessions.
Reviewers cannot assess what they cannot see; `we` makes the individual
contribution invisible.

**Field behaviour** — runs on Activities, Outputs, Outcomes, Evidence, Impact.
Strongest weighting on Activities.

### `T1.specificity`

**What it checks**

| Signal | Pattern | Verdict |
|---|---|---|
| Numbers / quantities | `\b\d+(?:[.,]\d+)?\b` (excluding plain 4-digit years on their own) | Strength — *"N specific numbers"* |
| Percentages | `\b\d+(?:\.\d+)?%` | Strength — counts under "specific numbers" |
| Dated years | `\b(19|20)\d{2}\b` | Strength — *"N dated reference(s)"* |
| Currency | `\$[\d,]+` or `CAD\s*[\d,]+` | Strength — counts under "specific numbers" |

**Why it matters** — Eli's "specificity, not vague claims" reviewer-attractor.
Numbers and dates give reviewers something to verify.

**Field behaviour** — runs on all five fields.

### `T1.vague-language`

**What it checks**

Closed wordlist (case-insensitive, whole-word match unless noted):

- Quantifiers: `various, several, many, some, a number of, a few, multiple`
- Reception verbs: `well-received, widely cited, highly regarded, well-known`
- Prestige metric: `high-impact journal, top-tier journal, leading journal`
- Bare adjectives (only flagged when followed by `.`, `,`, `;`, end-of-line,
  or `and` — i.e. used without an object noun): `significant, important, major`

**Verdict** — Flag with the matched phrase: *"Vague phrase: 'widely cited' —
replace with concrete evidence (e.g. 'cited in 47 studies')"*

**Why it matters** — Eli explicitly named `widely cited` and `high-impact
journal` as patterns that signal weakness, not strength.

**Field behaviour** — runs on all five fields.

### `T1.hedging-field-aware`

**What it checks**

Modals: `could, would, should, might, may`
Hedges: `perhaps, somewhat, relatively, fairly, slightly`
Tentative verbs: `tried to, attempted to`

**Verdict depends on the field:**

| Field | Hedging verdict |
|---|---|
| Activities | Flag — *"Activities should be definitive — what you did, not what you might do"* |
| Outputs | Flag — *"Outputs are concrete things you produced"* |
| **Outcomes** | **Flag** — *"Outcomes should be concrete. If this is hypothesised, move it to the Impact field."* |
| Evidence | Flag — *"Evidence should be verifiable, not hedged"* |
| **Impact** | **Accept** — *"Hedging used appropriately for Impact"* — and counts toward the rubric |

**Why it matters** — This rule directly reinforces the Outcomes-vs-Impact
split that the Phase C re-architecture introduced. Outcomes describe what
**already happened**; Impact describes what **could happen** at systemic
scale. The same hedge word that is wrong in Outcomes is right in Impact.

**Field behaviour** — runs on all five fields with field-aware verdict.

### `T1.length-completeness`

**What it checks**

| Signal | Threshold | Verdict |
|---|---|---|
| Empty | 0 words | Warn — *"Field is empty"* |
| Too short | < 10 words | Amber bar — *"Likely too short"* |
| In range | within target range (per field, see below) | Green bar |
| Long | > 1.5× upper bound | Amber bar — *"Long — consider trimming"* |

**Target ranges (pending calibration — see §5 *Pending authoritative data*):**

| Field | Target words |
|---|---|
| Activities | 40–80 |
| Outputs | 30–60 |
| Outcomes | 50–100 |
| Evidence | 30–80 |
| Impact | 40–100 |

These ranges are educated guesses for v1. They will be recalibrated once
we have data from real successful NCVs (see §5).

**Field behaviour** — runs on all five fields.

---

## 3. Auto-rubric (composite score, 0–4)

Each field gets a single 0–4 score, shown as a hint next to the
researcher's ✓/✗/? click:

```
Rubric: 3/4
```

**Formula:**

| Point | Condition |
|---|---|
| +1 | `T1.first-person-ownership` shows a strength (ownership marker present) AND no `we/us/our` flag |
| +1 | `T1.specificity` shows ≥ 1 number, percentage, currency, or dated year |
| +1 | `T1.vague-language` finds no matches |
| +1 | `T1.hedging-field-aware` returns "appropriate for this field" (no hedges for Activities/Outputs/Outcomes/Evidence; OR hedges present in Impact) |

The rubric is **a hint, not a gate**. The researcher's manual ✓/✗/? click
is the source of truth and always overrides the auto-rubric.

The rubric hides on ✓ (you've already approved) and on empty fields
(nothing meaningful to score).

---

## 4. Field-aware verdicts — why the same word is OK in one place and not another

The most important nuance in the evaluation is field awareness. A modal
like `could` is flagged in Outcomes and accepted in Impact, because:

- **Outcomes** describes what concretely **already happened** as a result
  of your work (a partner adopted X; the dataset has been used by Y).
  Hedging here suggests the researcher is mixing up actuals with projections.
- **Impact** describes the **hypothesised systemic effect** at the scale of
  a field, sector, or population. Hedging here is correct — reviewers
  expect impact claims to be appropriately tentative when they reach
  beyond what's already happened.

The Phase C re-architecture made this split structural in the tool.
The hedging detector enforces it.

---

## 5. Pending authoritative data

Things deliberately **held out of v1** because we should not ship guesses
when authority exists. Listed here so reviewers can supply the data.

| Item | Why held | Source we'd need |
|---|---|---|
| Canadian funding-agency name list (CIHR, NSERC, SSHRC, FRQNT, FRQSC, FRQS, IRCC, NRCan, Statistics Canada, MITACS, CFI, …) for the named-entity reward | The list should match the canonical agency naming — not my best guess. | Concordia Office of Research style guide, or Eli's curation. |
| Concordia faculty / department / centre name list (Gina Cody School, Faculty of Arts and Science, Faculty of Fine Arts, John Molson School of Business, CIISE, the various research chairs and centres) | Should match Concordia's official org chart. | Concordia.ca org pages, or an internal directory. |
| Indigenous community-organisation list (Native Friendship Centre, Projets Autochtones du Québec, FNIGC, etc.) | This list must be reviewed by the relevant communities or by researchers like Marie-Claude — never by me. | Direct community sign-off only. |
| Funder-specific hyperlink rules per competition | Working language from the May-13 session notes is in the prototype, but the current SSHRC/NSERC/CIHR/FRQ guidance docs are the source of truth. | Current funder guidance PDFs, or Eli/Holly verification. |
| Calibrated word-count ranges per field (currently educated guesses) | Should be calibrated against successful NCVs Eli has access to. | A small empirical pass (1–2 hours) against 10–20 successful NCVs, or Eli's tacit knowledge. |
| Action-verb whitelist / weak-verb list (currently general research-CV best practices) | Concordia-context curation should override generic lists. | Eli sign-off, or Concordia research-services style guide. |

When data arrives for any row, the corresponding detector becomes Tier-1
(active) and gets its own subsection in §2.

---

## 6. What we deliberately do not check

Stated explicitly so testers know the tool's edge:

- **Paraphrasing or rewriting** — the researcher's voice is theirs to keep.
- **Semantic clarity** — whether a sentence makes sense to a reviewer in
  a different sub-field cannot be evaluated by regex.
- **Originality / novelty / realism** of the claim itself.
- **Hedging-by-indirection** — `"this work was carefully designed to address"`
  is hedged by sentence structure, not by lexical hedge words. We miss it.
- **Cross-field logical consistency** beyond literal token overlap (Tier 3
  work, deferred).
- **Discipline-specific norms** — what counts as a strong Outcomes
  statement varies between, say, mathematics and community-based health
  research. We do not encode discipline-specific verdicts.
- **Funder-specific guidance** beyond the merged TCV/CV-FRQ note shown
  in the Personal Statement stage (specific competition rules vary and
  we defer to the funder documentation, not this tool).

---

## 7. How to push back on a rule

Every rule has a stable ID (`T1.first-person-ownership`, `T1.specificity`,
`T1.vague-language`, `T1.hedging-field-aware`, `T1.length-completeness`,
`T1.auto-rubric`).

If you disagree with what a rule flags or rewards:

1. **In the tool itself** — use the per-bundle `💬 Comment on this bundle`
   button or the floating *Send feedback on this tool* button. Reference
   the rule ID in your comment if you can.
2. **Export your collected feedback** — append `?feedback=export` to the
   prototype URL and your captured comments download as a JSON file.
   Email that to the project owner.
3. **For Concordia advisors (Eli, Holly, others)** — direct edits to this
   document or to `narrative-cv-prototype.html` are welcome; the rules
   live in the `LINT_RULES` array near the top of the prototype's
   inline `<script>` block. Each rule object's `id` field matches the
   IDs in this document.

---

## 8. Changelog

| Date | Rule | Change | Why |
|---|---|---|---|
| 2026-05-21 | All Tier-1 rules | Initial v1 ship as part of Phase F (Round 2 redesign) | Replacing the dead-end ✓/✗/? interaction with a real evaluation loop; see plan at `/Users/Prem/.claude/plans/can-we-branch-so-wiggly-dragon.md` |
