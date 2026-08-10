---
name: pathways-voice
description: The house voice for Pathways to Impact — how to write copy that sounds like Concordia without sounding like a press release, follows Canadian Press mechanics, and uses the exact funder vocabulary researchers recognize. Use when writing or reviewing ANY Pathways prose: site copy, data.js strings, NCV tool text, buttons and empty states, workshop and learn-section guides, emails to researchers, slide decks, or reports to the Office of Research. Also use when the user types /pathways-voice, says "does this sound right", "make this less PR", "voice check", "tone pass", "is this on-brand", or asks whether a term is the one a funder actually uses.
---

# pathways-voice — write for the researcher, not the podium

Pathways sits between an institution that writes press releases and researchers who write grant
applications. Copy that leans institutional loses researchers' trust; copy that ignores the
institution loses its authority. This skill resolves that with **two registers and two layers**.

Evidence for every claim here is in `voice/register-corpus.md` (sourced, with URLs and dates).
Structural narrative-CV rules live in `ncv-genre-sources.md` — different document, no overlap.

## The founding observation

Concordia already publishes in two distinct voices, sometimes on adjacent pages:

> **PODIUM** — "Pathways to Impact recognizes that impact requires institutional support. It must
> be enabled, facilitated, recognized and rewarded."
>
> **DESK** — "Allow time: it can take a day or more to get your first draft ready."

Both are Concordia. Both are correct *for their audience*. The mistake is using the first where
the second belongs — which is most of the product.

## The system

Two **registers** (pick exactly one per surface) and two **layers** (always on):

| | What it is | Subject of the sentence | Test it must pass |
|---|---|---|---|
| **PODIUM** | The institution describing itself | The initiative, the university | Would a provost or funder recognize this as the initiative's position? |
| **DESK** | A colleague telling you what to do | You, the researcher | Can the reader start this today? |
| **WIRE** | Canadian Press mechanics | — | Spelling, numbers, commas, capitalization |
| **AGENCY** | Exact funder vocabulary | — | Is this the word SSHRC/CIHR/CRC actually uses *right now*? |

**Default to DESK.** PODIUM is the exception, and it must be requested by the surface, not by habit.

### Routing table — which register for which surface

| Surface | Register |
|---|---|
| Buttons, links, form labels, empty states, errors | **DESK** |
| Service/workshop/tool descriptions, card copy | **DESK** |
| Learn guides, NCV tool text, how-to content | **DESK** |
| Emails and replies to researchers | **DESK** |
| "About Pathways", vision, partner-facing pages | **PODIUM** |
| Reports to OVPRII, funders, board; annual summaries | **PODIUM** |
| Home-page hero | **DESK** with one PODIUM sentence, max |

When a surface genuinely serves both audiences, write DESK and let one PODIUM sentence carry the
institutional framing. Never the reverse.

## The two axes (how to diagnose bad copy)

1. **Abstraction** — is the grammatical subject a person or an abstraction?
2. **Performability** — can the reader begin the named action today?

**Verb-first does not make copy DESK.** Concordia's own pathway cards prove it:

> "Maximize your research impact by fostering trust and co-creation with community partners."

Imperative mood, and still PODIUM: *maximize* is an outcome wearing an imperative costume. Compare
"Read the reviewer evaluation guidelines." Both are commands; only one names something a person can
do on a Tuesday morning. **Performability, not mood, is the test.**

## The eight checks

Run these in order. T1–T3 are voice, T4–T5 are correctness (they can make copy *wrong*, not just
flat), T6–T8 are mechanics.

- **T1 · Tuesday Test** — could the reader start this action today? Kill *leverage, maximize,
  enhance, elevate, unlock, empower, utilize, drive, foster* as head verbs in DESK copy.
- **T2 · Subject Test** — if the subject is an abstraction (*collaboration, coordination, the
  initiative, support*), rewrite so a person or a concrete thing acts.
- **T3 · Evidence Test** — every claim about impact names its evidence, or tells the reader how to
  get it. "Strengthen your proposal" → with what?
- **T4 · Term Test** — funder vocabulary must be **exact**. Never invent a friendlier synonym for a
  controlled term. Gloss once on first use, then use it plainly. See `reference.md` → AGENCY table.
- **T5 · Metric Test** — never encourage h-index, career-total citations, or Journal Impact Factor.
  Reviewers are instructed to disregard them. Individual-article citation counts are defensible
  under DORA when supporting a qualitative claim.
- **T6 · Mechanics (WIRE)** — Canadian spelling; **no Oxford comma**; zero–nine spelled out, 10+ as
  numerals; *per cent* not %; capitalize **Indigenous** and **Black**. Never "correct" spelling
  inside a proper noun or a direct quotation.
- **T7 · Density Test** — "impact" is the project's name, not an intensifier. If it appears twice in
  one sentence or as a bare modifier ("impact language", "impact work"), cut one.
- **T8 · Futurity Test** — no undated "launching soon" / "coming soon". Give a date or delete.

## Procedure

1. **Identify the surface** and route it to PODIUM or DESK using the table above. Say which you
   chose — a register chosen silently is a register chosen by habit.
2. **Draft or read in that register.**
3. **Run T1–T8.** Quote the offending fragment; don't describe it abstractly.
4. **Rewrite**, preserving meaning. If a fix would change what the copy *claims*, stop and flag it
   instead of quietly rewording the claim.
5. **Report** as a before/after table. For a review, lead with the count of each check that fired.

## Hard rules

- **Never apply changes to product files** (`data.js`, `app.js`, `index.html`, `styles.css`,
  `content/`, the NCV prototypes) unless the user explicitly asks in that turn. Default output is a
  proposed rewrite, not an edit. Voice work and shipping are separate decisions.
- **Never Canadianize inside quotation marks.** CIHR's own glossary writes "behaviors"; quote it as
  written. Same for proper nouns — *Erasmus Medical Center* keeps its spelling.
- **Agency terminology moves.** CIHR migrated knowledge translation → knowledge mobilization in
  2026, and retired *integrated knowledge translation* in favour of *research co-production*. Before
  asserting that a term is current, check `reference.md`, and if the stakes are real, check the
  agency page. A confidently wrong funder term is worse than a plain-English paraphrase.
- **English only.** These rules are not validated for French. Concordia and FRQ both publish in
  French, and the FRQ's French instructions are the authoritative ones. Do not apply WIRE to French
  copy.
- If Concordia turns out to have an internal editorial style guide, it supersedes PODIUM and WIRE.
  None was publicly findable (`voice/register-corpus.md` §6).

## More detail

`reference.md` — the AGENCY vocabulary table (current vs legacy terms, with sources), the PODIUM and
DESK sentence patterns, worked before/after rewrites from real Pathways copy, and the review report
template.

`voice/register-corpus.md` — the sourced evidence base.
`voice/lexicon.md` — word-by-word: use / avoid / never, with reasons.
`voice/voice-checklist.md` — the one-page pre-publish pass.
