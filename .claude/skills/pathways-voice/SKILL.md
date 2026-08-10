---
name: pathways-voice
description: The house voice for Pathways to Impact — one audience (researchers) and three jobs (communicate, instruct, support), built from a measured study of how concordia.ca, SSHRC, CIHR and NSERC actually construct their sentences. Use when writing or reviewing ANY Pathways prose: site copy, data.js strings, NCV tool text, headings, buttons, empty states, workshop and learn-section guides, emails to researchers, guides and decks. Also use when the user types /pathways-voice, says "does this sound right", "make this less PR", "voice check", "tone pass", "rewrite this for researchers", or asks how a page should open, how to phrase an instruction, or how to hand someone off to a human.
---

# pathways-voice — one audience, three jobs

**The reader is always a researcher.** Not a provost, not a funder, not a partner institution.
Every sentence does one of three jobs for that person: **communicate** (make them understand),
**instruct** (make them able to act), or **support** (catch them when they're stuck).

Everything here is measured, not asserted. 232 pages / 217,000 words across concordia.ca, SSHRC,
CIHR and NSERC. Numbers and method: `voice/construction-study.md`. Funder terminology:
`voice/register-corpus.md`.

## The core sentence shape

The corpus is unambiguous. Instruction is **not** written in the imperative — imperative sentences
run 3–8% everywhere, including the most instructional pages that exist. What Concordia and the
agencies actually write is:

> **[fronted condition] + you + modal + verb + specific object**

> "If you believe that you have developed an invention with commercial potential, **you need to
> submit a Declaration of Invention (DOI) form to the Office of Research**."

Condition first, so a reader can skip the sentence if it isn't their situation. Then the reader.
Then the strength of the obligation. Then a named, specific destination — never "the appropriate
office."

Verb-first phrasing belongs in **headings, buttons and list items**. Running prose is
second-person declarative.

## The three jobs

### COMMUNICATE — they understand

- Open with **what the reader gets**, never with what Pathways is.
  → "This page will help you…" · "Get familiar with… so you can…"
- Define plainly: *X is a Y that does Z*.
- Mark the stakes when they're real: "This is a critical step because…"

**Concordia's own Pathways page is the counter-example** — it opens with 25 words about the
institution and none about the reader. It's the only page in its section that does. Don't copy it.

### INSTRUCT — they can act

- **Condition first**: "If you… / To… / For…"
- **Second person + modal**, not imperative.
- **Name the specific object**: the form, the system, the team, the document.
- **Anchor the time**: "at least 10 working days ahead", "within 2 working days", "one month before
  expiry". An instruction without a deadline or lead time is half an instruction.
- Lists use the **label construction**: a one-word handle, an imperative, then the reason.
  → "**Concise** — Get right to the point. You will most likely have limited space."

### SUPPORT — they get unstuck

- **Name a human.** Concordia names people at 3–9× the rate of the agencies. This is house style.
  → "For any assistance, contact Gabriel Sales, Senior Advisor, Research Security."
- The full move: **[situation] + please contact + [named person, title] + [timing]**.
- **List what the helper actually does**: "our Research Grants team can help prepare the agreement
  and take care of the transfer" — not "our team can support you".
- Catch failure explicitly: "If you cannot find what you need, don't hesitate to contact…"
- **Say when you don't know.** "We don't have an answer for this question yet" is published
  Concordia copy and the strongest trust move in the corpus.

## Question headings — the highest-leverage move available

38% of Concordia's instruction-page headings are questions, against 1–4% everywhere else. And they
are written **in the researcher's own voice, first person**:

> "Can I access ConRAD from off-campus?" · "I can't access ConRAD. What do I do?" ·
> "Do I need to apply for ethics review?" · "How long does it take to get an account opened?"

A noun heading only works if the reader already knows the term for their problem. Someone who
doesn't know their situation is called *invention disclosure* will never click **Invention
disclosure** — but they will click **"I think I've invented something. What now?"**

Pathways uses almost none of this. Use it.

## The nine checks

**COMMUNICATE**
- **V1 · Reader-first** — the opening sentence names what the reader gets, not what we are.
- **V2 · Address** — second person. Target 15–20 "you" per 1,000 words; keep "we" under 4.

**INSTRUCT**
- **V3 · Performability** — the action is startable, with a specific object. Kill *leverage,
  maximize, enhance, elevate, unlock, empower, utilize, foster, strengthen* as head verbs.
- **V4 · Condition-first** — if it only applies sometimes, say when, and say it first.
- **V5 · Modal accuracy** — *must* only for genuine funder requirements, relayed at the funder's own
  strength. *should* / *can* for Pathways' own advice. **Softening a funder's "must" into "should"
  is a factual error, not a tone choice.**
- **V6 · Time anchor** — a deadline, lead time or sequence marker wherever one exists.

**SUPPORT**
- **V7 · Named handoff** — a person or named team, a channel, and what they'll actually do.

**ALWAYS**
- **V8 · Funder facts** — exact agency terminology (`reference.md` §1); never encourage h-index,
  career-total citations or Journal Impact Factor.
- **V9 · Mechanics** — Canadian Press: Canadian spelling, **no Oxford comma**, zero–nine spelled out,
  *per cent*, capitalize **Indigenous** and **Black**. Never "correct" a proper noun or a quotation.

## Length — longer than you think

Instruction pages are the **longest** thing Concordia writes (18.3-word mean sentence), and its
marketing pages are the shortest (13.7). Brevity is a marker of having nothing to qualify.

| | Target |
|---|---|
| Sentence | 15–25 words |
| Paragraph | under 35 words |
| List item | under 20 words |

Keep the condition and run long. Don't drop the condition to hit a word count.

## Procedure

1. **Name the job** for each block — communicate, instruct, or support. Say which. A page usually
   moves through all three in that order.
2. **Draft or read against that job's spec.**
3. **Run V1–V9.** Quote the exact fragment; never paraphrase what you're criticizing.
4. **Rewrite**, preserving meaning. If a fix would change what the copy *claims* — especially a
   modal — stop and flag it instead of quietly changing the claim.
5. **Report** as a before/after table, led by the count of each check that fired.

## Hard rules

- **Never edit product files** (`data.js`, `app.js`, `index.html`, `styles.css`, `content/`, the NCV
  prototypes) unless the user asks in that same turn. Default output is a proposal.
- **Never soften a funder requirement.** V5 outranks every style preference here.
- **Never Canadianize inside quotation marks or proper nouns.** CIHR's glossary writes "behaviors";
  *Erasmus Medical Center* keeps its spelling.
- **Agency terminology moves.** CIHR migrated knowledge translation → knowledge mobilization in 2026
  and retired *integrated knowledge translation* for *research co-production*. Check `reference.md`
  before asserting a term is current.
- **English only.** Not validated for French; FRQ's French instructions are the authoritative ones.
- Mechanical term-matching produces **false positives** — the NCV guide mentions h-index precisely to
  warn against it. Only V9 mechanics may be applied without reading the surrounding argument.

## More detail

`reference.md` — funder vocabulary table, the full shape library, worked rewrites from real Pathways
copy, and the review report template.

`voice/construction-study.md` — the measured evidence: corpus, numbers, method, limits.
`voice/register-corpus.md` — verbatim source quotations and terminology evidence.
`voice/lexicon.md` — word-by-word rulings.
`voice/voice-checklist.md` — one-page pre-publish pass.
