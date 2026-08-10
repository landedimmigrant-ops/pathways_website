# How the Language Is Built — A Construction Study

*Measured, not sampled. 232 pages / 217,000 words crawled and parsed 2026-08-10:
concordia.ca research section, SSHRC, CIHR, NSERC. This document asks **how sentences and pages
are constructed**, not which words are correct. Terminology lives in `register-corpus.md`.*

**Audience assumption throughout: the reader is a researcher.** Every number below is judged
against one question — does this construction help a researcher understand, act, or get unstuck?

---

## 0. The corpus

| Source | Pages | Words | What it is |
|---|---:|---:|---|
| **Concordia — researcher instruction** (`/research/for-researchers/`, `/research/funding/`) | 28 | 15,896 | How-to pages, FAQs, process guides |
| **Concordia — institutional** (centres, spotlights, about) | 41 | 16,420 | Centre and initiative pages |
| **SSHRC** | 53 | 57,122 | Funding, how to apply, review, policy |
| **CIHR** | 36 | 52,598 | Funding, KM, program pages |
| **NSERC** | 46 | 75,631 | Funding, program and application pages |

Crawled with a one-hop link discovery from each site's researcher-facing entry points; main content
extracted, chrome discarded. Method and caveats in §7.

---

## 1. The headline numbers

Per 1,000 words unless marked.

| Construction | **Concordia instruction** | Concordia institutional | SSHRC | CIHR | NSERC |
|---|---:|---:|---:|---:|---:|
| **"you / your"** | **20.0** | 1.2 | 6.7 | 0.9 | 13.3 |
| "we / our" | 3.2 | 9.7 | 1.0 | 2.4 | 1.7 |
| **Question headings** | **38%** | 1% | 3% | 4% | n/a¹ |
| Noun headings | 50% | 92% | 86% | 89% | n/a¹ |
| Imperative sentences | 6% | 8% | 7% | 7% | 3% |
| "must" | 2.6 | 0.2 | 3.8 | 0.5 | **4.9** |
| "should" | 2.0 | 0.1 | 1.6 | 0.2 | 0.8 |
| **"please"** | **4.4** | 0.3 | 0.2 | 4.5 | 0.6 |
| **Named-person handoff** | **2.7** | 0.1 | 0.8 | 0.3 | 0.5 |
| "we can / our team" | 0.6 | 0.2 | 0.1 | 0.2 | 0.1 |
| Fronted "If you…" | 1.3 | 0.1 | 0.5 | 0.2 | 0.9 |
| Fronted "For X, …" | 1.6 | 0.2 | 1.1 | 0.6 | 1.1 |
| Time anchors | 3.0 | 0.5 | 3.9 | 1.1 | 2.6 |
| Mean sentence (words) | 18.3 | 13.7 | 21.3 | 18.2 | 20.4 |
| Mean paragraph (words) | 29.1 | 27.1 | 37.7 | 27.6 | **41.5** |
| List share of blocks | 46% | 34% | 54% | 54% | 47% |

¹ NSERC's page headings did not survive extraction (n=12); treat its heading row as unmeasured, not
as zero. See §7.

---

## 2. Five findings that should change how we write

### 2a. Imperative mood is *not* the instructional register

Imperative sentences run **3–8% across every single source**, including the most instructional
pages in the corpus. Nobody — not Concordia, not any agency — instructs researchers primarily by
issuing commands.

**What they actually use is second person plus a modal.** The dominant instruction sentence is:

> **[fronted condition] + you + modal + verb + specific object**

> "If you are trying to access ConRAD off-campus, **you must** login to Concordia's VPN service."
>
> "If you believe that you have developed an invention with commercial potential, **you need to**
> submit a Declaration of Invention (DOI) form to the Office of Research."
>
> "For up-to-date account balance information, **you will need to** contact your respective
> Financial Officer in Restricted Funds."

The condition comes first so a reader can skip the whole sentence if it isn't their situation. Then
the reader. Then the strength of the obligation. Then the action — with a named, specific
destination, never "the appropriate office."

> **Correction to the first version of this voice work.** V1 built the system around imperative
> mood and told writers to lead with verbs. The corpus does not support that. Verb-first phrasing
> belongs in **headings, buttons and list items**; running instructional prose is second-person
> declarative. Writing a page of imperatives produces something that sounds like neither Concordia
> nor an agency.

### 2b. The question heading is Concordia's signature — and it's underused by everyone else

**38% of Concordia instruction-page headings are questions**, against 1–4% everywhere else. It is
the single most distinctive construction in the corpus.

More striking: they are written **in the researcher's own voice, in the first person** — the
question as the reader would actually ask it, not as an editor would title it.

> "Can I access ConRAD from off-campus?"
> "I can't access ConRAD. What do I do?"
> "I need to terminate a CARE employee. What form do I use?"
> "How do I respond to 'Queries' or 'Conditions'?"
> "Do I need to apply for ethics review?"
> "How long does it take to get an account opened?"

Compare the institutional-page equivalent: 92% noun headings — "Research security", "Our team",
"Impact pathways." Nouns are scannable, but they only work when the reader already knows the
vocabulary for their problem. A researcher who doesn't know that their situation is called
"invention disclosure" will never click a heading that says *Invention disclosure*. They will click
**"I think I've invented something. What now?"**

This is the highest-leverage pattern available to Pathways, and the site currently uses almost none
of it.

### 2c. Concordia names human beings; the agencies name offices

**Named-person handoffs run 2.7/1,000 words at Concordia** — 3× SSHRC, 5× NSERC, 9× CIHR.

> "For any assistance, contact **Gabriel Sales, Senior Advisor, Research Security**."
>
> "If you have questions about the process or need additional information before submitting a
> Disclosure of Invention (DOI), please contact **Valeria Marquet, senior specialist, Intellectual
> Property**."
>
> "Changes to the Letter of Award, interns or project dates should be communicated as soon as
> possible to the Mitacs Grants team with **Vanessa Buzzelli** in CC."

Concordia also refers to itself as a helper 3–6× more than any agency ("we can", "our team"), and
uses **"please" at 4.4/1,000** where SSHRC uses 0.2 and NSERC 0.6.

The composite support move:

> **[fronted situation] + please contact + [named person, title] + [timing constraint].**

> "For developmental content review and feedback, please contact your Advisor, Research Development
> directly by email **at least 10 working days ahead of the agency deadlines**."

That sentence does four jobs at once: names the trigger, names the human, names the channel, and
names the lead time. It is the best single sentence in the corpus for Pathways to imitate.

### 2d. Concordia advises where agencies require

Modal choice is where institutional role shows up in grammar:

| | "you must" | "you should" | "you can" |
|---|---:|---:|---:|
| Concordia instruction | 0.6 | **0.8** | **1.1** |
| NSERC | **1.8** | 0.2 | 0.8 |
| SSHRC | 0.3 | 0.0 | 0.4 |
| CIHR | 0.1 | 0.0 | 0.2 |

NSERC uses *must* three times as often as Concordia. Concordia is the only source in the corpus
that meaningfully uses *should* — it **advises**. And it leads on *can*, which is the grammar of
possibility rather than obligation.

This is a real asset and a real hazard. The asset: advisory voice is what a support service should
sound like. The hazard: **when relaying a genuine funder requirement, "should" is a factual error.**
If NSERC says *must*, Pathways must not say *should*.

### 2e. Instructional writing is *longer*, not shorter

Concordia's institutional pages have the **shortest** sentences in the corpus (13.7 words) and its
instruction pages are markedly longer (18.3). The agencies run longer still (SSHRC 21.3, NSERC 20.4)
with much fatter paragraphs (NSERC 41.5 words).

Short sentences are not a marker of clarity here — they are a marker of *marketing*, which has
nothing to qualify. Real instruction carries conditions, exceptions and deadlines, and that costs
words.

> **Second correction to V1.** The first version leaned on Canadian Press brevity as a general
> virtue. It isn't one for this genre. CP mechanics (spelling, numbers, commas) still apply; CP's
> wire-service sentence economy does not. The target is 15–25 words with conditions kept, not
> 12 words with conditions dropped.

The genuine length failure in the corpus is **CIHR's list items, averaging 34.8 words** — full
paragraphs wearing bullet points. Lists should hold list-sized things.

---

## 3. The three jobs, and how each is built

The Pathways voice has one audience and three jobs. Each has a measurable construction signature.

### COMMUNICATE — make the reader understand

| Move | Shape | Corpus example |
|---|---|---|
| Orientation promise | "This page will help you…" | "This page will help guide you through everything you need to know about managing your grant." |
| Reader-benefit opener | "Get familiar with… so you can…" | "Get familiar with the resources available to you to ensure you achieve your research or research-creation goals." |
| Plain definition | "X is a Y that Z" | "Mitacs is a national, not-for-profit organization that supports collaborative research-based innovation." |
| Stakes marker | "This is a critical step because…" | "This is a critical step in the process as this will serve as a test on how a review committee might read and assess your proposal." |

*"This page will help…" appears only at Concordia (0.3/1k, zero at all three agencies).* It is a
small, humane move: it tells the reader what they are about to get before they invest in reading.

**Rule:** open with what the reader gets, not with what the initiative is. Every `for-researchers`
page in the corpus does this — **except the Pathways to Impact page**, which opens:

> "Concordia has a long-standing commitment to fostering meaningful real-world change that uniquely
> positions us to redefine ourselves as an impact-driven next-generation university."

Twenty-five words about the institution, zero about the reader, on the one page that is supposed to
introduce researchers to the service. It is the only page in its own section that opens this way.

### INSTRUCT — make the reader able to act

| Move | Shape | Corpus example |
|---|---|---|
| Conditional instruction | "If you X, you must/need to Y" | "If you believe that you have developed an invention with commercial potential, you need to submit a Declaration of Invention (DOI) form to the Office of Research." |
| Purpose-fronted | "To X, you must Y" | "To access ConRAD off-campus, you must log into Concordia's VPN service." |
| Topic-fronted | "For X, [do Y]" | "For industrial transfer grants and agreements, please contact the Partnerships, Intellectual Property and Security team." |
| Label list | **Label** + imperative + rationale | "**Concise** Get right to the point. You will most likely have a limited amount of space at your disposal." |
| Time anchor | any instruction + when | "at least 10 working days ahead", "within 2 working days", "one month before expiry" |

The **label list** is Concordia's best list construction (34% of its instruction-page list items are
label-style, vs 16% at SSHRC and NSERC). The four-C block on `proposals.html` is the model:

> **Concise** — Get right to the point. You will most likely have a limited amount of space.
> **Clear** — Avoid using jargon and acronyms. Adhere to agency presentation standards.
> **Coherent** — Map out your research proposal, ensuring it meets the objectives…
> **Compelling** — Make the impact and relevance of your work clear from the outset.

Three parts: a one-word handle the reader can remember, an imperative, and a reason. Scannable and
complete at the same time.

**Time anchors are non-negotiable.** Concordia runs 3.0/1k, SSHRC 3.9/1k. An instruction without a
deadline or a lead time is only half an instruction.

### SUPPORT — catch the reader when they're stuck

| Move | Shape | Corpus example |
|---|---|---|
| Situated handoff | "For X, please contact [named person, title]" | "For any assistance, contact Gabriel Sales, Senior Advisor, Research Security." |
| Failure catch | "If you can't…, don't hesitate to…" | "If you cannot find what you need, don't hesitate to contact the Office of Research." |
| Helper offer | "our [team] can [specific actions]" | "If you need to transfer funds between institutions, our Research Grants team can help prepare the agreement and take care of the transfer." |
| Early-warning | "Contact us early in the process so that…" | "Contact the PIPS and Research Development teams early in the negotiation process so that we can provide guidance and support." |
| Honest gap | "We don't have an answer yet" | "This is a huge question, and one we're giving separate focus to at Concordia. We don't have an answer for this question yet…" |

**The helper offer must list specific actions.** "Our Research Grants team can help prepare the
agreement and take care of the transfer" beats "our team can support you" because the reader can
tell whether it's the help they need.

---

## 4. What Pathways should take, and what it should leave

**Take from Concordia's instruction pages:**
- Question headings in the researcher's own first-person voice — the biggest available win
- Named humans with titles in every handoff
- "please" — the corpus says politeness is house style, not softness
- *should* and *can* as the default modals; the advisory register
- Time anchors on every instruction
- The label-list construction
- Opening with what the reader gets

**Take from the agencies:**
- Fronted conditions, so readers can skip what isn't theirs (NSERC and SSHRC do this well)
- *must* — reserved strictly for genuine requirements, relayed at the funder's own strength
- Willingness to let a sentence run 20 words when it's carrying a condition

**Leave:**
- Concordia's institutional-page grammar entirely: 92% noun headings, "we" outnumbering "you" 8:1
- NSERC's 41-word paragraphs
- CIHR's 35-word list items
- The Pathways page's own institution-first opener

---

## 5. Targets for Pathways copy

Derived from the corpus. These are calibration marks, not quotas.

| Measure | Target | Source of the number |
|---|---|---|
| "you / your" | **15–20 / 1,000 words** | Concordia instruction pages sit at 20.0 |
| "we / our" | below 4 / 1,000 | institutional pages hit 9.7 and read as brochure |
| Question headings | **25–40%** of headings on task pages | Concordia instruction 38% |
| Imperative sentences in prose | under 10% | every source in the corpus |
| Mean sentence | **15–25 words** | instruction 18.3, agencies 18–21 |
| Mean paragraph | under 35 words | Concordia 29.1; NSERC's 41.5 is the failure case |
| List items | under 20 words | CIHR's 34.8 is the failure case |
| Named-person handoffs | at least 1 per support page | Concordia 2.7/1k |
| Time anchors | 1 per instruction that has a deadline | Concordia 3.0/1k |
| "must" | only for real funder requirements | Pathways is advisory; NSERC is not |

---

## 6. What this replaces

The first pass at this work proposed a two-register model (PODIUM / DESK) selected per surface. With
researchers fixed as the audience, that model is retired: **there is one voice with three jobs.**

Two of its specific claims were wrong and are corrected above:
- **Imperative mood as the instructional default** (§2a) — the corpus says 3–8% everywhere.
- **Brevity as a general virtue** (§2e) — instruction pages are the *longest* Concordia writes.

What survives from V1: the performability test (an instruction must name something the reader can
start), the funder-terminology layer, the metrics rule, and Canadian Press *mechanics*.

---

## 7. Method and limits

**Method.** One-hop link discovery from each site's researcher-facing entry points; `curl` fetch;
main-content extraction (`<main>` or `role="main"`, chrome and scripts stripped); block-level parse
preserving `h1–h4 / p / li`. Counts are regex-based over paragraph and list text only — headings,
tables and navigation excluded from per-1,000-word rates.

**Limits — treat these as real:**

- **Heading classification is heuristic.** "Imperative" is detected by a base-verb-first test against
  a fixed verb list, so noun phrases starting with a verb-like word are misfiled. Question detection
  (leading wh-word or trailing "?") is reliable; the imperative/noun split is approximate.
- **NSERC headings did not extract** (n=12 across 46 pages) — its markup puts them outside the parsed
  blocks. Its heading row is **unmeasured, not zero.**
- **Imperative-sentence detection is crude** and will undercount imperatives that begin with an
  adverb ("Always check…") or a prepositional phrase. The 3–8% band is a floor; the finding that no
  source is imperative-dominant is robust, the precise percentages are not.
- **Sample sizes differ by an order of magnitude** — 15,896 Concordia instruction words against
  75,631 NSERC words. Rates are normalized, but Concordia's figures rest on a smaller base and will
  be noisier.
- **Coverage is partial.** Concordia's crawl reached 69 of the research section; SSHRC 53 pages;
  CIHR 36; NSERC 46. None is the complete site. CIHR and SSHRC pages skew toward funding and program
  content because those were the crawl seeds.
- **English only.** No French pages were analyzed, and none of these targets should be assumed to
  transfer to French copy.
- **Concordia's institutional/centre pages are a mixed bag** — research-centre pages, spotlights and
  about pages written by many different units. They are a fair picture of "not the instruction
  register", not a single authored voice.
- Everything was measured **2026-08-10**. Sites change.
