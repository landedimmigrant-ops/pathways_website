# Pathways Voice

The house language system for Pathways to Impact: how to write copy that sounds like Concordia
without sounding like a press release, follows Canadian Press mechanics, and uses the funder
vocabulary researchers actually recognize.

Built 2026-08-10 from a sourced scan of concordia.ca, Canadian Press style, and Tri-agency /
CRC / FRQ language. **Research and documentation only — no website or product code was changed.**

---

## The one-paragraph version

Concordia already publishes in two voices. The institutional one ("Pathways to Impact recognizes
that impact requires institutional support. It must be enabled, facilitated, recognized and
rewarded.") and the practitioner one ("Allow time: it can take a day or more to get your first
draft ready."). Both are correct for their audience. Nearly every researcher-facing surface in this
project should use the second. The system names them **PODIUM** and **DESK**, adds two always-on
layers — **WIRE** (Canadian Press mechanics) and **AGENCY** (exact funder vocabulary) — and turns
the whole thing into eight testable checks.

The central insight: **verb-first copy is not automatically plain copy.** "Maximize your research
impact" is an imperative that names no performable action. The test is whether the reader can start
it on Tuesday.

---

## Files

| File | What it's for | Read it when |
|---|---|---|
| [`.claude/skills/pathways-voice/SKILL.md`](../.claude/skills/pathways-voice/SKILL.md) | The operational skill — registers, routing table, eight checks, procedure | Writing or reviewing anything |
| [`.claude/skills/pathways-voice/reference.md`](../.claude/skills/pathways-voice/reference.md) | AGENCY vocabulary table, sentence patterns, worked rewrites, report template | You need the detail |
| [`register-corpus.md`](register-corpus.md) | The sourced evidence — verbatim quotations, URLs, dates, and what could not be verified | You want to check a claim, or the sources have moved |
| [`lexicon.md`](lexicon.md) | Word-by-word: use / careful / avoid, with reasons | Mid-sentence, deciding on a word |
| [`voice-checklist.md`](voice-checklist.md) | One-page pre-publish pass | Before anything ships |

Companion, not duplicated here: [`ncv-genre-sources.md`](../ncv-genre-sources.md) covers
narrative-CV **structure** and hard formatting rules. This set covers **language**.

---

## Using it

The skill triggers on its own when writing Pathways prose. To invoke it directly:

```bash
/pathways-voice
```

Or just ask — "voice check this", "make this less PR", "is this the term SSHRC uses".

**The skill proposes; it does not apply.** It will not edit `data.js`, `app.js`, `content/` or the
NCV prototypes unless you ask in that turn. Voice work and shipping are separate decisions.

---

## What the scan found

Four findings worth knowing even if you never open the other files:

1. **Concordia has two registers, and the good one is already ours.** The Narrative CV FAQ — written
   by the Pathways team — is the strongest researcher-facing writing on the site. The system
   formalizes what's already there rather than importing a house style from outside.

2. **CIHR migrated *knowledge translation* → *knowledge mobilization* in 2026**, and retired
   *integrated knowledge translation* in favour of *research co-production*. SSHRC and CIHR now
   share the same umbrella term. Copy still offering "iKT support" is describing a superseded
   concept. This is the kind of error the AGENCY layer exists to catch.

3. **CIHR's own glossary cites Concordia University** as the source for *knowledge holder*. The
   institution has standing in this vocabulary; loose usage of the surrounding terms spends it.

4. **The prototype's copy is already better than the official Concordia page.** A live-copy audit
   found few abstraction markers and mostly performable verbs. The real gaps are mechanical: 61
   Oxford commas against CP style, and one US spelling. This system is mostly protecting an
   existing strength.

---

## Limits

- **English only.** Not validated for French. Concordia and FRQ both publish in French, and FRQ's
  French instructions are the authoritative ones.
- **The CP Stylebook itself was not purchased or consulted.** Rules come from the publisher's public
  description plus institutional summaries. Edge cases need the current edition.
- **No public Concordia editorial style guide was findable.** If one exists internally, it
  supersedes the PODIUM and WIRE layers here.
- **Funder terminology moves.** Everything was verified 2026-08-10. Re-check before betting on it.

Full caveats: [`register-corpus.md`](register-corpus.md) §6.
