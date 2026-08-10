# Pathways Voice

The house language system for Pathways to Impact. **One audience — researchers. Three jobs —
communicate, instruct, support.**

Built from a measured construction study of 232 pages / 217,000 words: concordia.ca's research
section, SSHRC, CIHR and NSERC, crawled and parsed 2026-08-10.
**Research and documentation only — no website or product code has been changed.**

---

## The one-paragraph version

Concordia's researcher-facing pages already have a distinctive voice, and it is measurably different
from its institutional pages: it addresses the reader 17× more often, writes 38% of its headings as
questions in the researcher's own first-person voice, names actual human beings in its handoffs at
3–9× the rate of the funding agencies, and says "please" 20× more than SSHRC. It **advises** where
the agencies **require**. That voice — not the press-release voice on the official Pathways page —
is the Pathways voice. This system names its constructions and makes them repeatable.

The core sentence shape, which the corpus is unambiguous about:

> **[fronted condition] + you + modal + verb + specific object**
>
> "If you believe that you have developed an invention with commercial potential, **you need to
> submit a Declaration of Invention (DOI) form to the Office of Research**."

---

## Files

| File | What it's for | Read it when |
|---|---|---|
| [`.claude/skills/pathways-voice/SKILL.md`](../.claude/skills/pathways-voice/SKILL.md) | The operational skill — three jobs, nine checks, procedure | Writing or reviewing anything |
| [`.claude/skills/pathways-voice/reference.md`](../.claude/skills/pathways-voice/reference.md) | Shape library, funder vocabulary, worked rewrites, report template | You need the detail |
| [`construction-study.md`](construction-study.md) | **The evidence** — how the language is built, with numbers, per-source comparison, method and limits | You want to know why a rule exists, or to re-run the study |
| [`register-corpus.md`](register-corpus.md) | Verbatim source quotations and funder terminology | Checking a claim or a term |
| [`lexicon.md`](lexicon.md) | Word-by-word: use / careful / avoid | Mid-sentence, deciding on a word |
| [`voice-checklist.md`](voice-checklist.md) | One-page pre-publish pass | Before anything ships |

Companion, not duplicated here: [`ncv-genre-sources.md`](../ncv-genre-sources.md) covers
narrative-CV **structure** and formatting rules. This set covers **language**.

---

## Using it

The skill triggers on its own when writing Pathways prose. To invoke it directly:

```bash
/pathways-voice
```

Or just ask — "voice check this", "make this less PR", "how should this page open".

**The skill proposes; it does not apply.** It will not edit `data.js`, `app.js`, `content/` or the
NCV prototypes unless you ask in that turn.

---

## What the study found

Five things worth knowing even if you never open another file.

1. **Imperative mood is not the instructional register.** Imperatives run 3–8% across *every* source
   measured, including the most instructional pages that exist. Real instruction is second-person
   declarative with a modal. Verb-first belongs in headings, buttons and list items — not prose.

2. **Question headings are Concordia's signature and the biggest win available.** 38% of instruction
   headings are questions, against 1–4% everywhere else — and they're phrased as the researcher
   would ask them: *"Can I access ConRAD from off-campus?"*, *"I can't access ConRAD. What do I do?"*
   Pathways currently uses almost none of this. A noun heading only works if the reader already knows
   the term for their problem.

3. **Concordia names humans; the agencies name offices.** Named-person handoffs run 2.7 per 1,000
   words — 3× SSHRC, 9× CIHR. "For any assistance, contact Gabriel Sales, Senior Advisor, Research
   Security." That is house style, and it should survive into the product.

4. **Concordia advises where agencies require.** It's the only source in the corpus that
   meaningfully uses *should*; NSERC uses *must* three times as often. Keep the advisory register for
   our own guidance — but never soften a funder's *must* into *should*. That's a factual error.

5. **Instructional writing is longer, not shorter.** Concordia's marketing pages have the *shortest*
   sentences in the corpus (13.7 words); its instruction pages are the longest it writes (18.3).
   Brevity is a symptom of having nothing to qualify.

One uncomfortable finding: **the official Pathways to Impact page opens with 25 words about the
institution and none about the reader** — the only page in its own section that does.

---

## What this replaced

An earlier version proposed a two-register model (PODIUM / DESK) chosen per surface, built from a
five-page sample. With researchers fixed as the only audience, that model is retired in favour of one
voice with three jobs. Two of its specific claims were wrong and are corrected in
[`construction-study.md`](construction-study.md) §2a and §2e: imperative mood as the instructional
default, and brevity as a general virtue.

What survived: performability, the funder-terminology layer, the metrics rule, and CP *mechanics*.

---

## Limits

- **English only.** Not validated for French; FRQ's French instructions are the authoritative ones.
- **Heading and imperative classification is heuristic**, and **NSERC's headings did not extract**
  (n=12) — that row is unmeasured, not zero.
- **Coverage is partial** — 69 Concordia pages, 53 SSHRC, 36 CIHR, 46 NSERC. None is a full site.
- **Sample sizes differ by an order of magnitude**; Concordia's 15,896-word instruction corpus is the
  smallest base and the noisiest.
- **The CP Stylebook itself was not consulted** — it's a paid product; rules come from the
  publisher's description plus institutional summaries.
- **No public Concordia editorial style guide was findable.** If one exists internally, it supersedes
  the mechanics layer here.
- Everything measured **2026-08-10**. Sites change; funder terminology moves.

Full method and caveats: [`construction-study.md`](construction-study.md) §7.
