# Narrative CV V4 review — working notes for V5

**Source:** Anytype → Pathways to Impact → "Narratvie cv tooll review with Brett" (UX Report, created
2026-08-27). Raw session notes, no typed fields filled in. This file is the cleanup pass, with every
note traced to the actual thing in [narrative-cv-prototype-v4.html](narrative-cv-prototype-v4.html).

**How to use this.** Each item has:

- **Note:** what you wrote, tidied but not reinterpreted
- **Where:** the real UI location, with file:line and the exact current string
- **Read as:** how I understand the note — correct me where I'm wrong
- **Follow-up:** what I need from you before this becomes a build instruction
- **→ V5 instruction:** *empty — this is your second-pass slot*

Items marked ✅ are unambiguous and ready to build. Items marked ❓ still need your answer.

**One coverage note before you start:** every note in this session is against the **Start fresh**
path. The **Structural read** entry mode (paste-a-draft) has no notes against it at all — either it
was never opened in the session, or it wasn't part of it. Worth deciding whether V5 needs a second
session covering that path before it ships.

---

## Contents

| # | Where in the tool | Issue | State |
|---|---|---|---|
| [B-1](#b-1) | Setup — page intro | Which intro sentence, and what should it say | ❓ |
| [B-2](#b-2) | Setup — mode cards | "Start fresh" selection feedback too subtle | ✅ |
| [B-3](#b-3) | Setup — chips | Page jumps to top on every chip click | ✅ (same root cause as B-14) |
| [B-4](#b-4) | — | "language:" — note never written | ❓ |
| [B-5](#b-5) | Contributions — lede | "that's the destination" | ❓ likely resolved |
| [B-6](#b-6) | Contributions — work mode | Question vanishes after one click | ✅ (known bug) |
| [B-7](#b-7) | Every stage — lens bar | "Edit context" throws you back to Setup | ✅ has design proposal |
| [B-8](#b-8) | Contributions — exemplar | "Show the skeleton" works — keep | ✅ keep |
| [B-9](#b-9) | Contributions — exemplar | Six segment colors too pale | ✅ |
| [B-10](#b-10) | Contributions — exemplar | Label the example fictional | ❓ small |
| [B-11](#b-11) | Contributions — shape hint | Social-sciences hint assumes policy uptake | ✅ |
| [B-12](#b-12) | Contributions — shape hint | Three different taxonomies on one screen | ✅ real problem |
| [B-13](#b-13) | Contributions — exemplar | Cite where the example comes from | ✅ |
| [B-14](#b-14) | Contributions — role chips | "I led it" scrolls page to top | ✅ (known defect) |
| [B-15](#b-15) | Contributions — role line | Reword; also it's only a placeholder | ✅ has proposed text |
| [B-16](#b-16) | Auto-checks | Highlight the triggering words | ❓ implementation constraint |
| [B-17](#b-17) | Auto-checks | Say these are suggestions | ✅ merges with B-20 |
| [B-18](#b-18) | Auto-checks | "our" flagged even with "I" present | ✅ confirmed live |
| [B-19](#b-19) | Auto-checks | The "no numbers" flag phrasing | ❓ direction needed |
| [B-20](#b-20) | Auto-checks | "a hint, not a gate" doesn't communicate | ✅ |
| [B-21](#b-21) | Auto-checks | "Your call:" needs explanation | ✅ |
| [B-22](#b-22) | Contributions — impact | "Academic impact counts" badge reads as a warning | ✅ |
| [B-23](#b-23) | Contributions — translational | Reword the "real person/clinic" question | ✅ |
| [B-24](#b-24) | Contributions | Translational overlaps Outcomes | ✅ real overlap |
| [B-25](#b-25) | Contributions — evidence | "Proof points" vs "Evidence" — inconsistent | ✅ |
| [B-26](#b-26) | Contributions — evidence | "description is bad" | ❓ confirm which |
| [B-27](#b-27) | Contributions — evidence | No "Other" in the type dropdown | ✅ resolved |
| [B-28](#b-28) | Mentorship | Are mentee names allowed? | ❓ funder-rules question |
| [B-29](#b-29) | Mentorship | "why this trajectory matters" → "why this example matters" | ❓ small |
| [B-30](#b-30) | Mentorship | Are the three prompts clear? | ❓ your pass |
| [B-31](#b-31) | Mentorship | The EDI prompt specifically | ✅ |
| [B-32](#b-32) | Personal statement — lede | "Two questions do most of the work" | ✅ resolved |
| [B-33](#b-33) | Review — heading | "Pull it together" | ✅ resolved |
| [B-34](#b-34) | Review — coverage | "(PS)" never expanded | ✅ |
| [B-35](#b-35) | Review — advisor packet | Framing implies priority | ⛔ blocked on advisors |
| [B-36](#b-36) | Everywhere | No links to the guide | ✅ |
| [B-37](#b-37) | — | "look at examples in our tool" | ❓ |
| [B-38](#b-38) | Everywhere | Say it's not AI, and confidential | ✅ |

---

# Setup stage

<a id="b-1"></a>
### B-1 · Which intro sentence, and what should it say ❓
> **Note:** "intro sentence: what is the right statement here"

**Where:** two candidates, and I can't tell which one you were looking at.
1. Page subtitle — [narrative-cv-prototype-v4.html:133](narrative-cv-prototype-v4.html:133):
   *"The convergence prototype: start fresh or get a structural read of an existing draft. Hard-coded
   prompts, live auto-checks, and an advisor-consult export. Everything stays on your device."*
2. Setup stage lede — [narrative-cv-prototype-v4.html:617](narrative-cv-prototype-v4.html:617), under
   the heading "How are you arriving?": *"Two ways in. If you already have a draft — most people do,
   eventually — start with the structural read and let it show you where the genre's load-bearing
   moves are missing."*

**Read as:** #1 is written for us, not for a researcher ("convergence prototype", "hard-coded
prompts") and disappears at port time anyway. #2 is the real first thing a researcher reads.

**Follow-up:** Which one? And what's the job of that sentence — orient them to the tool, or tell
them what they'll walk away with?

**→ V5 instruction:**

---

<a id="b-2"></a>
### B-2 · "Start fresh" selection feedback is too subtle ✅
> **Note:** "start fresh — needs better feedback when clicked, maybe a title of something, or a
> colour change"

**Where:** the two mode cards, [narrative-cv-prototype-v4.html:619–629](narrative-cv-prototype-v4.html:619).
Selected state is `.v4-mode-card.is-on` — [line 57](narrative-cv-prototype-v4.html:57): burgundy
border, background `#f9f3f4`, burgundy heading.

**Read as:** the feedback exists but is nearly invisible — `#f9f3f4` is a 2%-saturation pink, and the
border was already burgundy on hover ([line 56](narrative-cv-prototype-v4.html:56)), so hovering and
selecting look almost identical. Nothing else on the page changes to confirm the choice.

**Follow-up:** Colour alone, or should selecting a mode also change something structural — e.g. the
unchosen card dims, or a line appears reading "You're building from scratch. Next: your contributions"?

**→ V5 instruction:**

---

<a id="b-3"></a>
### B-3 · Page jumps to top when you click agency / discipline / stage ✅
> **Note:** "why does it keep the page up when you click options like agency — then it pops up"

**Where:** every chip in Setup goes through `chipRow` →
[narrative-cv-prototype-v4.html:607](narrative-cv-prototype-v4.html:607) `saveState(); renderStage();`
→ and `renderStage` ends with an unconditional
[`window.scrollTo({top: 0, behavior: "smooth"})`](narrative-cv-prototype-v4.html:467).

**Read as:** every single chip click re-renders the whole stage and smooth-scrolls you back to the
top. On Setup you're three chip-rows down, so each answer throws you back up to the mode cards —
that's the "pops up". **Same root cause as [B-14](#b-14).** One fix covers both.

**Follow-up:** none — this is a straight defect. Already catalogued in
`NCV_V4_ANALYSIS_2026-07-21.md` as "every chip click re-renders + scrolls to top", so V5 should
reference that rather than open a new ticket.

**→ V5 instruction:**

---

<a id="b-4"></a>
### B-4 · "language:" — the note was never written ❓
> **Note:** "langauge:" *(bare heading, nothing under it)*

Sits between the agency-popup note and the Contributions notes. Could be the EN/FR question, or the
register of the copy generally. Not the same thing as the French-requirement question already tracked
as F-2 in [narrative-cv-guide-factual-review.md](narrative-cv-guide-factual-review.md) — that one is
about what the *guide* claims, this is about the *tool*.

**Follow-up:** What were you about to write here?

**→ V5 instruction:**

---

# Contributions — the example block

<a id="b-5"></a>
### B-5 · "that's the destination" ❓ probably already resolved
> **Note:** "contributions: that's the destination:"

**Where:** almost certainly quoting the Contributions lede —
[narrative-cv-prototype-v4.html:745](narrative-cv-prototype-v4.html:745): *"…the fields are a thinking
scaffold — in the final CV they disappear into one flowing paragraph. Read the example below first:
**that's the destination**."*

**Read as:** you were flagging the phrase, but the note cuts off before saying whether you liked it
or wanted it changed.

**Follow-up:** Keep, or rework?

**→ V5 instruction:**

---

<a id="b-6"></a>
### B-6 · Work-mode question disappears after one click ✅
> **Note:** "when choosing the type of work, solo — not sure what happens. It feels like a recent,
> not visible change in mode. We need to make these modes more visible."

**Where:** [narrative-cv-prototype-v4.html:748–752](narrative-cv-prototype-v4.html:748). The whole
question is wrapped in `if (!(ns.lens.workMode || []).length)` — so the moment you pick your first
mode, the re-render removes the entire question from the page.

**Read as:** it's billed as "choose any" (multi-select) but behaves as single-shot: pick "Largely
solo" and the question vanishes before you can add "Team-based". Your only trace of the choice is a
small pill in the "Tailored for:" bar. This is the **same defect nadia's persona run found**
("work-mode single-shot bug", logged 2026-08-10) — you hit it independently, which is a good signal
for priority.

**Follow-up:** Should the question stay visible permanently (with selections shown), or collapse to
an editable summary line once answered?

**→ V5 instruction:**

---

<a id="b-7"></a>
### B-7 · "Edit context" throws you back to Setup ✅
> **Note:** "if we want to edit context, it takes us back to the first page — maybe we need to keep
> these on the side like filters."

**Where:** the "Tailored for:" bar that sits atop every stage after Setup —
[`lensBar()`, narrative-cv-prototype-v4.html:479–497](narrative-cv-prototype-v4.html:479). The
**Edit context** button does exactly one thing:
[line 493](narrative-cv-prototype-v4.html:493) — `ns.stageKey = "setup"; renderStage();`.

**Read as:** you lose your place in Contributions to change one chip, then have to navigate forward
again. Your proposal — make the context a persistent side panel you edit in place, like filters —
is a genuine design change, not just a bug fix.

**Follow-up:** Adopt the side-filter model for V5, or the cheaper fix (edit in a modal / inline
popover, stay on the page)? The side panel competes for space with the existing Steps sidebar.

**→ V5 instruction:**

---

<a id="b-8"></a>
### B-8 · "Show the skeleton" — keep ✅
> **Note:** "positive functions to keep — example: show the skeleton (structure)"

**Where:** [narrative-cv-prototype-v4.html:774–779](narrative-cv-prototype-v4.html:774).

No change. Recorded so V5 doesn't regress it.

**→ V5 instruction:**

---

<a id="b-9"></a>
### B-9 · The six segment colours are too pale ✅
> **Note:** "make colours of the section more visible"

**Where:** [narrative-cv-prototype-v4.html:101–106](narrative-cv-prototype-v4.html:101) — the six
`.seg-*` backgrounds revealed by the skeleton toggle: `#fdf4dc` stakes, `#f9ebed` role, `#e8f4fd`
activities, `#e8f5e9` outputs, `#fbeae4` outcomes, `#f3ebfd` impact. All roughly 4–8% saturation.

**Read as:** the six jobs are meant to be visually distinguishable at a glance, and at this
saturation stakes/outcomes and role/outcomes are hard to tell apart, especially on a projector.

**Follow-up:** Deepen the fills, or keep the fills light and carry the distinction in a stronger left
border / label chip? (These are Concordia palette tints, so going darker needs a contrast check
against the body text.)

**→ V5 instruction:**

---

<a id="b-10"></a>
### B-10 · Say the example is fictional ❓
> **Note:** "use fictional example instead"

**Where:** the exemplar box title —
[narrative-cv-prototype-v4.html:759](narrative-cv-prototype-v4.html:759): *"What a finished
contribution reads like (Social sciences, **invented**)"*.

**Read as:** it already says "invented" — so either the word isn't landing (buried in a
parenthetical, at the end, in the same weight as the discipline name), or you want the word
"fictional" specifically.

**Follow-up:** Is this a word swap, or does the disclaimer need to be more prominent? Given how hard
the privacy line is on this project, I'd argue for prominence over word choice.

**→ V5 instruction:**

---

<a id="b-11"></a>
### B-11 · The social-sciences shape hint assumes policy uptake ✅
> **Note:** "social sciences contribution often runs: what happens if you don't have policy"

**Where:** `SHAPE_HINTS.social` —
[narrative-cv-prototype-v4.html:179](narrative-cv-prototype-v4.html:179): *"Agenda / concept → How
you developed it → **Scholarly + policy uptake** → Leadership / institutional dimension"*, rendered
as *"A Social sciences contribution often runs: …"* at
[line 785](narrative-cv-prototype-v4.html:785).

**Read as:** the hint states policy uptake as a standard beat of the genre. A social scientist
without policy uptake reads that as a deficiency in their record rather than a variant. Same risk
exists in `health` ("Equity & reach") but social is the sharpest case.

**Follow-up:** Rewrite the social hint to make policy one option among several (scholarly, public,
practitioner, community, policy)? And should I check the other four hints for the same problem?

**→ V5 instruction:**

---

<a id="b-12"></a>
### B-12 · Three different taxonomies on the same screen ✅
> **Note:** "is this based on activities, outputs, outcomes, impact — does this make sense"

**Where:** all three of these are visible in the Contributions stage simultaneously, and none of them
use the same words:

| Source | Vocabulary |
|---|---|
| Skeleton legend (`SEG_META`, [line 187](narrative-cv-prototype-v4.html:187)) | The stakes · Your role · What you did · What resulted · What already changed · What could change |
| Shape hint (`SHAPE_HINTS.social`, [line 179](narrative-cv-prototype-v4.html:179)) | Agenda / concept · How you developed it · Scholarly + policy uptake · Leadership dimension |
| The actual form fields ([lines 829–861](narrative-cv-prototype-v4.html:829)) | Stakes · Role · Activities · Outputs · Outcomes · Impact |

**Read as:** the note is asking whether the framework holds together, and the honest answer is that the
screen currently teaches three overlapping vocabularies for one structure. This is a real coherence
problem, not just a labelling nit — it's probably *why* B-11 and B-5 came up in the same breath.

**Follow-up:** Do we collapse to one vocabulary across all three, or is the shape hint deliberately
discipline-native language that shouldn't be forced into the generic frame? I lean toward one
vocabulary with the discipline flavour carried in examples, not in a competing set of labels.

**→ V5 instruction:**

---

<a id="b-13"></a>
### B-13 · Cite where the example comes from ✅
> **Note:** "can we cite where we are getting this example from"

**Where:** exemplar box, [line 759](narrative-cv-prototype-v4.html:759).

**Read as:** the exemplars are invented, but the *patterns* they encode came from the genre research
in `ncv-genre-sources.md` and from the two real CVs. A researcher has no way to know the shape is
grounded rather than our invention.

**Follow-up:** Careful here — we can cite the funder rules and the genre scan, but we can never point
at the two real CVs. Is a line like "the shape follows Tri-agency and FRQ instructions; the content
is invented" enough?

**→ V5 instruction:**

---

# Contributions — the contribution card

<a id="b-14"></a>
### B-14 · "I led it" / "I co-led it" scrolls you to the top ✅
> **Note:** "when you click 'I led it' or 'I co-led it' it shoots you back up — super annoying"

**Where:** role chips at
[narrative-cv-prototype-v4.html:837–841](narrative-cv-prototype-v4.html:837) → `renderStage()` →
[the unconditional scroll-to-top at line 467](narrative-cv-prototype-v4.html:467).

**Read as:** worse here than in Setup ([B-3](#b-3)) — you're deep inside contribution 3 and get
thrown to the top of the page mid-thought. Same one-line root cause.

**→ V5 instruction:**

---

<a id="b-15"></a>
### B-15 · Reword the role line — and it's currently only a placeholder ✅
> **Note:** "redo this line, 'in one line what's your move' → **In one line, what was your unique
> contribution within the team.**"

**Where:** `PROMPTS.contrib.roleLine.q` —
[narrative-cv-prototype-v4.html:374](narrative-cv-prototype-v4.html:374): *"In one line: what was
your move — the thing that wouldn't exist without you?"*

**Worth knowing:** that question is **never shown as a label**. The visible label is the flat "Your
role in this work" ([line 835](narrative-cv-prototype-v4.html:835)); the real question is only the
textarea's `placeholder` ([line 846](narrative-cv-prototype-v4.html:846)) — so it disappears the
instant you start typing, and screen readers treat it as a hint, not a question.

**Read as:** two things — the wording, and the fact that the good question is hidden in a
disappearing placeholder. Your replacement is plainer, though "within the team" may not fit the
"Largely solo" work mode.

**Follow-up:** Take your line as-is, or vary it by work mode (solo researchers have no team to be
unique within)? And should the question become the visible label, demoting "Your role in this work"?

**→ V5 instruction:**

---

# The auto-checks (live lint) — cross-cutting

<a id="b-16"></a>
### B-16 · Highlight the words that triggered the flag ❓
> **Note:** "any way to highlight also the words that are triggering the feedback"

**Where:** `renderChecks` — [narrative-cv-prototype-v4.html:500–512](narrative-cv-prototype-v4.html:500).
Flags already quote the offending word (*"Vague: 'several' — replace with concrete evidence"*), but
nothing is marked in the text itself.

**Read as:** reasonable ask with a real constraint — a plain `<textarea>` cannot render highlights.
Options: (a) an overlay div mirroring the textarea, (b) swap to `contenteditable`, (c) a read-back
panel showing the text with marks, below the field. (a) is fiddly but keeps typing behaviour; (b)
risks paste and undo bugs; (c) is cheap and safe.

**Follow-up:** Which of those three? I'd start with (c) unless you want in-place marking specifically.

**→ V5 instruction:**

---

<a id="b-17"></a>
### B-17 · Say plainly that these are suggestions ✅
> **Note:** "maybe we need to have a note these are just suggestions"

**Where:** nowhere currently, except the compressed phrase in [B-20](#b-20).

**Read as:** pairs with B-20 — same need, and they should be solved by one piece of copy, not two.

**→ V5 instruction:**

---

<a id="b-18"></a>
### B-18 · "our" is flagged even when "I" is present ✅ confirmed
> **Note:** "there is a bug, it flags 'our' even if we use 'I' — will this get annoying?"

**Where:** `lintField` ownership rule —
[narrative-cv-prototype-v4.html:249–257](narrative-cv-prototype-v4.html:249).

The rule is supposed to be forgiving: `we/us/our` only flags when there's no individual marker
nearby. The individual marker test is
[line 251](narrative-cv-prototype-v4.html:251) — `I` followed within three words by a verb from
`ACTION_VERBS` ([line 237](narrative-cv-prototype-v4.html:237)) — or "my group/lab/team/students"
([line 252](narrative-cv-prototype-v4.html:252)).

**Read as:** confirmed live, and the cause is the closed verb list. *"I led the redesign, and our
team shipped it"* passes. *"I **wrote** the protocol, and our team shipped it"* **flags** — because
`wrote` isn't in `ACTION_VERBS`. Same for *analysed, conducted, tested, built out, wrote up,
published, presented, mentored, taught, coordinated*, and any past tense not on the 30-word list.
So the rule fires on ordinary sentences that do state individual ownership. Your "will this get
annoying?" answers itself — yes, for anyone whose verbs aren't on our list.

**Follow-up:** Two ways out — (a) keep the list but grow it substantially, or (b) drop the verb list
and treat any `I` + past-tense verb within N words as ownership. (b) is more robust but will let some
genuinely vague sentences through. Which risk do you prefer: over-flagging or under-flagging?

**→ V5 instruction:**

---

<a id="b-19"></a>
### B-19 · The "no numbers" flag — phrasing and framing ❓
> **Note:** "bug feedback in orange, no numbers given — maybe ask 'is that ok', not the comment
> about reviewers, or give feedback as a question"

**Where:** [narrative-cv-prototype-v4.html:264](narrative-cv-prototype-v4.html:264): *"No numbers,
dates, or quantities — give reviewers something to verify"*, rendered in `.v4-flag`
([line 64](narrative-cv-prototype-v4.html:64)) which is `#da3a16` — Concordia **orange**, exactly as
you described.

**Read as:** three separate objections bundled in one note —
1. it fires on *every* empty-of-numbers field, including ones where numbers are wrong (a stakes
   opener rarely has a number in it);
2. "give reviewers something to verify" speaks for the reviewer, in a slightly threatening register;
3. it asserts rather than asks — your alternative is roughly *"No numbers here — is that right for
   this field?"*

**Follow-up:** Which do you want? My read is that (3) fixes the tone, but (1) is the bigger problem —
the check should probably not fire at all on `stakes`. Should the number check become field-aware
the way hedging already is ([lines 275–283](narrative-cv-prototype-v4.html:275))?

**→ V5 instruction:**

---

<a id="b-20"></a>
### B-20 · "a hint, not a gate" doesn't communicate ✅
> **Note:** "what does that mean — a hint not a gate"

**Where:** [narrative-cv-prototype-v4.html:510](narrative-cv-prototype-v4.html:510) — every field's
meta line ends: *"78 words (aim 40–80, uncalibrated) · rubric 2/4 — a hint, not a gate"*.

**Read as:** this is the opposite of the note I first took it for. The phrase is already there; the
problem is that it doesn't land. Three pieces of jargon in one line — "rubric 2/4",
"uncalibrated", "a hint, not a gate" — and none of them say the plain thing: *nothing here blocks
you; you decide.* "Uncalibrated" in particular is us talking to ourselves about
[the pending calibration study](narrative-cv-prototype-v4.html:509).

**Follow-up:** Rewrite the whole meta line, or drop the rubric score entirely? A score out of 4 that
we ourselves call uncalibrated may be doing more harm than good.

**→ V5 instruction:**

---

<a id="b-21"></a>
### B-21 · "Your call:" needs explaining ✅
> **Note:** "'your call' maybe needs better explanation"

**Where:** [narrative-cv-prototype-v4.html:542](narrative-cv-prototype-v4.html:542) — the label on
the ✓ / ✗ / ? row under every prompt. The three buttons carry tooltips ("Looks right", "Needs work",
"Unsure — ask my advisor", [line 543](narrative-cv-prototype-v4.html:543)) but tooltips don't show on
touch and aren't read aloud in order.

**Read as:** the row is doing real work — it's what fills the advisor packet — but nothing on screen
says so. A researcher sees three unexplained symbols.

**Follow-up:** Replace the label with something that states the purpose (e.g. "Mark this for your
advisor:")? That also sets up [B-35](#b-35).

**→ V5 instruction:**

---

<a id="b-22"></a>
### B-22 · "Academic impact counts" badge reads as a warning ✅
> **Note:** "maybe a different way to say academic impact counts here — maybe not in red, but part
> of the system"

**Where:** the badge on the Impact prompt —
[line 521](narrative-cv-prototype-v4.html:521), triggered by `academicTag: true` at
[line 388](narrative-cv-prototype-v4.html:388). Styled `.v4-tag`
([line 47](narrative-cv-prototype-v4.html:47)): uppercase, burgundy `#912338` on pink — visually a
warning label, and the same styling as the "NEW" badge.

**Read as:** we're trying to reassure ("your academic impact is legitimate") but delivering it in
alarm styling, in caps, in the same chip we use to flag new features. The reassurance is also
duplicated in the help text below it ([line 388](narrative-cv-prototype-v4.html:388): *"Academic
impact counts fully…"*).

**Follow-up:** Drop the badge and keep the help sentence, or restyle the badge as neutral/positive?
Note that `.v4-tag` is shared with the "new" badges — restyling one restyles both.

**→ V5 instruction:**

---

# Contributions — impact, translational, evidence

<a id="b-23"></a>
### B-23 · Reword the "real person / clinic / policy" question ✅
> **Note:** "clarify: did this work reach a real person, clinic or policy or community"

**Where:** `PROMPTS.contrib.translational.q` —
[narrative-cv-prototype-v4.html:389](narrative-cv-prototype-v4.html:389), verbatim: *"Did this work
reach a real person, clinic, policy, or community?"*

**Read as:** the list mixes categories — two of them are people/places (person, clinic, community)
and one is an abstraction (policy) — so the sentence reads oddly. It's also a yes/no question when
what we want is a story; the help text asks for the story, the question doesn't.

**Follow-up:** Do you want this to stay a gated optional field, or become a standard prompt?

**→ V5 instruction:**

---

<a id="b-24"></a>
### B-24 · Translational overlaps Outcomes ✅ the overlap is real
> **Note:** "is this not repetitive — is this about a real life example, an anecdote?"

**Where:** compare, for a social-sciences researcher:
- Outcomes ([line 384](narrative-cv-prototype-v4.html:384)): *"Who took this up — scholars,
  policymakers, practitioners — and what shifted?"*
- Translational ([line 389](narrative-cv-prototype-v4.html:389)): *"Did this work reach a real
  person, clinic, policy, or community?"*

Both appear for `social` and `health` disciplines ([gate at line 865](narrative-cv-prototype-v4.html:865)).

**Read as:** yes, repetitive as written. The distinction we *intend* is scope vs. texture — Outcomes
wants the general uptake, Translational wants one concrete human moment. Your second question
("is this about an anecdote?") correctly guesses the intent that the copy fails to state.

**Follow-up:** Keep both and make Translational explicitly the anecdote ("Tell one moment where this
reached someone — a single scene, two sentences")? Or cut it and fold the anecdote ask into Outcomes?

**→ V5 instruction:**

---

<a id="b-25"></a>
### B-25 · "Proof points" vs "Evidence" — pick one ✅
> **Note:** "'add your proof points' — need clarify? You want to say evidence of impact?"

**Where:** the same concept is called three different things:
- *"Add your proof points — one at a time."* — [line 390](narrative-cv-prototype-v4.html:390)
- *"+ Add proof point"* button — [line 905](narrative-cv-prototype-v4.html:905)
- but everywhere it surfaces it's **Evidence** — the weave block
  ([line 944](narrative-cv-prototype-v4.html:944)), the export
  ([line 1187](narrative-cv-prototype-v4.html:1187)), the state key `evidence`, the coverage row
  "Evidence attached to a contribution" ([line 1068](narrative-cv-prototype-v4.html:1068)).

**Read as:** "proof points" is the odd one out and reads as consultant-speak. Your "evidence of
impact" is close, though strictly these are evidence for the whole contribution, not just its impact.

**Follow-up:** Standardise on "Evidence" throughout, or "Evidence of impact"? The first matches what
the export and the real CVs call it.

**→ V5 instruction:**

---

<a id="b-26"></a>
### B-26 · "description is bad" ❓ confirm which one
> **Note:** "description is bad"

**Where:** it follows the proof-points note directly, so most likely the evidence help text —
[line 390](narrative-cv-prototype-v4.html:390): *"Pick a type for each. The tool keys them a, b, c…
into your draft, the way a developed CV keys its reference box."*

**Read as:** if that's the one — it explains our internal mechanism ("the tool keys them") before it
explains what the researcher should type, and "the way a developed CV keys its reference box"
assumes they've seen a developed CV.

**Follow-up:** Confirm it's this line and not another description?

**→ V5 instruction:**

---

<a id="b-27"></a>
### B-27 · No "Other" in the evidence-type dropdown ✅ resolved
> **Note:** "add other to drop down so they can…" *(sentence cut off)*

**Where:** `EVIDENCE_TYPES` —
[narrative-cv-prototype-v4.html:170–173](narrative-cv-prototype-v4.html:170): Peer-reviewed · Media /
public · Policy / practice uptake · Dataset / tool · Award / recognition · Funding · Replication /
citation. No "Other".

**Read as:** the fragment resolves itself against the code — there's genuinely no escape hatch, so
anything that isn't one of those seven (a patent, a standard, an exhibition, a clinical guideline, a
software release, community recognition) has to be mislabelled. Note the Setup agency chips *do*
have an escape hatch ("Other / not sure", [line 156](narrative-cv-prototype-v4.html:156)) — this
dropdown is inconsistent with that.

**Follow-up:** Just add "Other", or "Other" plus a free-text box to name the type? The type string
gets printed in the export ([line 1188](narrative-cv-prototype-v4.html:1188)), so a bare "Other"
would read poorly there.

**→ V5 instruction:**

---

# Mentorship

<a id="b-28"></a>
### B-28 · Are mentee names allowed? ❓ this is a funder-rules question
> **Note:** "are you allowed to use names"

**Where:** the tool currently sidesteps it —
[line 985](narrative-cv-prototype-v4.html:985): *"Who → stage → where they went → why it matters. Use
initials or 'a PhD student' if you prefer to keep it anonymous."* The field placeholder says
"Name / initials" ([line 988](narrative-cv-prototype-v4.html:988)).

**Read as:** we offer anonymity as a preference and never answer the actual question, which is
whether the agencies permit (or expect) named trainees in a narrative CV. That's not a UX decision —
it belongs with the funder-facts track in
[narrative-cv-guide-factual-review.md](narrative-cv-guide-factual-review.md), and it's exactly the
kind of item flagged there as needing someone who knows rather than more desk research.

**Follow-up:** Add this to the list for Eli / the agencies? Once answered it becomes one clear line
in the tool.

**→ V5 instruction:**

---

<a id="b-29"></a>
### B-29 · "why this trajectory matters" → "why this example matters" ❓ small
> **Note:** "change the one-line trajectory after name of student, to 'why this example matters'"

**Where:** [line 999](narrative-cv-prototype-v4.html:999) — the free-text line under each mentee row:
placeholder *"One line — why this trajectory matters (optional)"*.

**Read as:** a one-word swap, trajectory → example. Worth noting the surrounding copy leans hard on
"trajectory" (the section lede at [line 963](narrative-cv-prototype-v4.html:963): *"the most
persuasive thing in this section is a real trajectory"*), so changing one instance makes the
vocabulary inconsistent.

**Follow-up:** Change just this line, or move the whole section off "trajectory"?

**→ V5 instruction:**

---

<a id="b-30"></a>
### B-30 · Are the three mentorship prompts clear? ❓ your pass
> **Note:** "need to figure if these questions are clear"

**Where:** the three prompts, [lines 393–398](narrative-cv-prototype-v4.html:393):
1. *"Your mentoring approach — shown through one concrete thing you do."*
2. *"What real context shapes who you mentor and how?"* → see [B-31](#b-31)
3. *"Beyond your own students — who else do you mentor?"*

**Follow-up:** Read these three and mark which fail. #1 isn't a question, which may be part of it.

**→ V5 instruction:**

---

<a id="b-31"></a>
### B-31 · The EDI prompt specifically ✅
> **Note:** "'what real context shapes who you mentor and how?' — need clarify"

**Where:** `PROMPTS.mentor.edi.q` — [line 395](narrative-cv-prototype-v4.html:395), with help text
*"Ground equity in your actual environment — your institution's makeup, a program you built, a
barrier you work against. Structural beats abstract."*

**Read as:** the question never says it's about equity — that only appears in the help text, and only
as the word "equity" with no further signal. A researcher reading the question cold has no idea
what's being asked or why. "Real context" is doing far too much work.

**Follow-up:** Name the subject in the question itself, or is the indirection deliberate — trying to
avoid an EDI-statement reflex and get something concrete instead? That's a defensible design, but if
so the help text should say so.

**→ V5 instruction:**

---

# Personal statement

<a id="b-32"></a>
### B-32 · "Two questions do most of the work" ✅ resolved
> **Note:** "edit — 'two questions do most' — don't like that style"

**Where:** you were quoting the PS stage lede —
[narrative-cv-prototype-v4.html:1019](narrative-cv-prototype-v4.html:1019): *"It appears first in the
CV but is written last… **Two questions do most of the work**: why your area matters at all, and why
your particular work matters within it."*

**Read as:** not "edit two questions" — you were flagging the *phrase* as a style you dislike. Which
makes it a copy rewrite of the lede, not a change to any prompt. (I had this wrong in the first pass.)

**Follow-up:** What's wrong with it specifically — the folksy "do most of the work" construction, or
the fact that it announces two questions and then the page shows six prompts?

**→ V5 instruction:**

---

<a id="b-33"></a>
### B-33 · "Pull it together" ✅ resolved
> **Note:** "pull it together — need to review this language"

**Where:** the Review stage heading —
[narrative-cv-prototype-v4.html:1059](narrative-cv-prototype-v4.html:1059): kicker *"Step · Review &
export"*, heading **"Pull it together"**, lede *"Coverage check, self-check, then export. Three
outputs: a working draft, a print view in the genre's visual form, and an advisor packet built from
your own flags and questions — designed to make a consult dramatically more productive."*

**Read as:** again a quotation, not an instruction — the Review heading and its lede need a language
pass. The lede also carries [B-35](#b-35)'s problem in its last clause.

**Follow-up:** Whole stage-head rewrite, or just the heading?

**→ V5 instruction:**

---

<a id="b-34"></a>
### B-34 · "(PS)" is never expanded ✅
> **Note:** "what is PS (personal statement) — maybe colour code these"

**Where:** the Review coverage checklist —
[lines 1071–1074](narrative-cv-prototype-v4.html:1071): *"Central challenge named **(PS)**"*, *"Origin
/ pivot story **(PS)**"*, *"Standing paragraph drafted **(PS)**"*, *"Program-fit articulated **(PS)**"*.
The abbreviation appears nowhere else and is never introduced. The Steps sidebar calls the stage
"Personal stmt" ([line 408](narrative-cv-prototype-v4.html:408)) — a third name for the same thing.

**Read as:** we invented an internal shorthand and shipped it into the researcher-facing checklist.
The "colour code these" half is a separate idea — group the ten coverage rows by section so you can
see at a glance which part of the CV is thin.

**Follow-up:** Expanding "PS" is obvious. Do you also want the coverage list grouped/coloured by
section, or is the flat list fine once the labels read properly?

**→ V5 instruction:**

---

<a id="b-35"></a>
### B-35 · The advisor packet framing implies priority ⛔ blocked
> **Note:** "statement about advisor packet gives the impression of priority — need to discuss this
> with advisors"

**Where:** three places say it, with escalating confidence:
- Review lede, [line 1060](narrative-cv-prototype-v4.html:1060): *"…an advisor packet built from your
  own flags and questions — **designed to make a consult dramatically more productive**"*
- Packet header, [line 1212](narrative-cv-prototype-v4.html:1212): *"Prepared by the researcher, from
  their own flags and questions."*
- Consult-questions help, [line 1121](narrative-cv-prototype-v4.html:1121): *"What do you want a
  human expert's eye on?"*

**Read as:** "dramatically more productive" is a claim about advisors' time made without advisors in
the room — it implies the tool front-loads the consult and sets the agenda for it. That's the
"impression of priority" the note names, and it's right that it's an advisor-relations question
before it's a copy question.

**Follow-up:** Who's the conversation with, and by when? Everything else in this doc can proceed
without it — this one item shouldn't hold up V5, but the copy shouldn't ship unchanged either.

**→ V5 instruction:**

---

# Cross-cutting

<a id="b-36"></a>
### B-36 · Nothing in the tool links to the guide ✅ confirmed
> **Note:** "notice that we don't link to sections of the narrative CV guide — read it if you want
> to browse through it"

**Where:** confirmed by search — there is no reference to the guide anywhere in the V4 file. The
guide exists at [content/learn/narrative-cv-guide.md](content/learn/narrative-cv-guide.md) (with the
voice rewrite pending alongside it) and is reachable only from the Learn section of the site.

**Read as:** a researcher inside the tool has no route to the explanatory material, and a researcher
reading the guide has no route into the tool. The natural anchors are one per stage — Contributions →
the contributions section of the guide, Mentorship → its section, and so on.

**Follow-up:** Deep links per stage, or a single "Read the guide" link in the shell? Note this has a
dependency: the guide is mid-rewrite, and the slot labels in the voice version are unchanged, so
links built against slot labels will survive that swap.

**→ V5 instruction:**

---

<a id="b-37"></a>
### B-37 · "look at examples in our tool" ❓
> **Note:** "look at examples in our tool."

Isolated line near the end, no clear referent. Could be a note-to-self to audit the exemplars
(→ [B-10](#b-10)/[B-13](#b-13)), or to look at how examples are handled somewhere else.

**Follow-up:** What was this?

**→ V5 instruction:**

---

<a id="b-38"></a>
### B-38 · Say it's not AI, and that it's confidential ✅
> **Note:** "put a note that it is not AI driven, it's confidential"

**Where:** we do say it, three times, all in our own language:
- Prototype banner, [line 127](narrative-cv-prototype-v4.html:127): *"no LLM · storage: `ncv-v4`"*
- Subtitle, [line 133](narrative-cv-prototype-v4.html:133): *"Everything stays on your device
  (`ncv-v4`)"*
- Structural read lede, [line 683](narrative-cv-prototype-v4.html:683): *"nothing leaves your device"*

**Read as:** the first two are prototype chrome that disappears at port time, and all three are
phrased for us — "no LLM", a raw localStorage key in parentheses. The third is on a stage never
opened in the session. So a researcher on the main path is never plainly told: *this isn't AI, nothing you type is
sent anywhere, nobody can see this.* Given researchers will be pasting unpublished work into it, that
statement is doing real trust work and should be first-class, permanent, and in plain language.

**Follow-up:** Where should it live — a persistent line in the shell, or the Setup stage only? And is
"not AI" the right framing, or is "nothing you write leaves this browser" the thing that actually
matters to them?

**→ V5 instruction:**

---

## What I need from you, in one place

**Ten answers** unblock the rest: [B-1](#b-1) which intro, [B-4](#b-4) what "language:" meant,
[B-5](#b-5) keep or rework, [B-10](#b-10) word vs prominence, [B-16](#b-16) which highlight approach,
[B-19](#b-19) which of three fixes, [B-26](#b-26) which description, [B-29](#b-29) scope of the
rename, [B-30](#b-30) which prompts fail, [B-37](#b-37) what this was.

**Two are not ours to decide:** [B-28](#b-28) (are names allowed — funder rules, goes to Eli's list)
and [B-35](#b-35) (advisor packet framing — needs the advisor conversation).

**Two design calls** are bigger than copy and worth deciding before build starts:
[B-7](#b-7) (context as side filters vs. a page you navigate to) and [B-12](#b-12) (one vocabulary
across the exemplar, the shape hint and the fields, or keep three).

**One free win:** [B-3](#b-3) and [B-14](#b-14) are the same line of code
([line 467](narrative-cv-prototype-v4.html:467)), and fixing it removes the single most-reported
irritation across both this session and nadia's persona run.
