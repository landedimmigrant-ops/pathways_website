# Narrative CV V5 — copy and UX spec

**What this is.** Every copy string and UX behaviour the V5 beta changes, written from the
researcher's side. Companion to [narrative-cv-v5-decisions.md](narrative-cv-v5-decisions.md) (what
was decided) and [narrative-cv-v5-brett-review.md](narrative-cv-v5-brett-review.md) (where the V4
string lives). Source of truth for the V4 verbatim quotes:
[narrative-cv-prototype-v4.html](narrative-cv-prototype-v4.html), commit `8aebbb3`.

**How to read an entry.**

- **V4** — the current string, verbatim, with its line in V4. "*new element*" means it does not exist yet.
- **V5** — the replacement. Copy it exactly; the punctuation is deliberate.
- **Why** — one line, from the researcher's side: what they need to understand at that moment.

**House rules applied throughout** (`pathways-voice`): one audience — a researcher; second person;
questions where the reader is being asked something; condition first; no Oxford comma; Canadian
spelling; zero to nine spelled out; *must* only where a funder says must. Removed vocabulary:
*rubric, uncalibrated, gate, proof points, X-ray, deterministic lint, load-bearing, developed CV*.
Kept vocabulary: **Structural read**, **Tri-agency CV**, **CV-FRQ**, **evidence**, **trajectory**.

**Privacy.** Every example in this spec is invented. No real researcher, institution, project or
trainee appears anywhere in it, and none may enter the tool copy.

**Count.** 191 numbered strings (S1–S191), plus 12 UX behaviours in section C.

**One word about the word "beat".** *Beat* is the spec's internal name for the six jobs a
contribution's sentences do. It never appears in the interface. The reader-facing word is **job**,
which the tool already uses at V4:780 — "every sentence is doing a job".

---

# A. Canonical vocabulary (B-12)

## A1. The six jobs — one vocabulary, everywhere

| # | Name | What the researcher writes there | V4 state key |
|---|---|---|---|
| 1 | **Stakes** | The problem the work answered, and for whom | `stakes` |
| 2 | **Your role** | What was yours inside it | `roleLine` |
| 3 | **What you did** | The actual work | `activities` |
| 4 | **What resulted** | The concrete things that came out | `outputs` |
| 5 | **What already changed** | Uptake that has happened | `outcomes` |
| 6 | **What could change** | What might follow, hedged | `impact` |

These six names are used **identically** in three places that currently disagree: the skeleton
legend chips (V4 `SEG_META`, line 187), the kicker on every field label in the contribution card,
and the coverage rows on Review. The shape hints (A2) stop being a fourth vocabulary and become
flavour on these six.

**Changed from V4:** `SEG_META[0]` loses its article — "The stakes" → "Stakes" — so all six are
parallel.

**One deviation from the decisions log, flagged.** B-12 lists beat 5 as "What changed". This spec
uses **"What already changed"** (V4's own wording), because *already* is the single word that
separates beat 5 from beat 6 at a glance, and that separation is the genre's central distinction —
demonstrated uptake versus hypothesised impact. It is also the distinction the tool's own self-check
line names. "What changed" next to "What could change" makes the reader work out the contrast from
tense alone. If Fable or Prem prefers the log's literal wording, the fallback is a global swap of
`What already changed` → `What changed` in S7, S13, S19, S25, S31, S75, S94, S95, S103, S118, S169
and S174, plus the `SEG_META` constant they all read from — nothing else depends on it.

## A2. Shape hints — discipline flavour on the same six jobs

Replaces `SHAPE_HINTS`, V4 lines 176–182, which currently teaches five competing four-step
sequences. Rendered as six short rows under a heading, not as an arrow chain.

**S1 · Block heading** (interpolated with the chosen discipline)
> In **Social sciences**, the six jobs usually sound like this.

**S2 · Block closing line** — the B-11 fix, shown for all five disciplines
> This is flavour, not a checklist. Skip any job your record doesn't have — a contribution is not
> weaker for missing one.

### STEM / engineering
**S3** Stakes — a failure, a cost or a limit nobody could get past
**S4** Your role — which part of the system was yours
**S5** What you did — the method, the build, the validation
**S6** What resulted — tools, code, datasets, methods papers
**S7** What already changed — who has adopted it, and what they measure now
**S8** What could change — the practice, if it holds at scale

### Health / clinical
**S9** Stakes — something current care misses, and who it misses
**S10** Your role — your part in a co-designed team
**S11** What you did — the co-design, the pilot, the measurement
**S12** What resulted — protocols, training, tools, trials
**S13** What already changed — clinics, pathways, guidelines, referrals
**S14** What could change — care at system scale, and for whom

### Social sciences
**S15** Stakes — a gap in how a problem is understood or governed
**S16** Your role — the agenda you set, or the part you led
**S17** What you did — the study, the data, the fieldwork, the framework
**S18** What resulted — books, datasets, methods, briefs, public work
**S19** What already changed — who took it up: scholars, practitioners, communities, the public or policy
**S20** What could change — how a field or a sector frames the problem

### Humanities
**S21** Stakes — a question left unasked, or a record going missing
**S22** Your role — the argument, the archive or the project that is yours
**S23** What you did — the recovery, the reading, the making
**S24** What resulted — monographs, editions, collections, exhibitions
**S25** What already changed — who teaches it, cites it or curates with it
**S26** What could change — what the field counts as evidence

### Creative / fine arts
**S27** Stakes — what the form, the site or the audience was not reaching
**S28** Your role — what you made, and with whom
**S29** What you did — the commissions, the collaborations, the making
**S30** What resulted — works, performances, recordings, exhibitions
**S31** What already changed — where it circulated, and who took up the method
**S32** What could change — how the practice is made, or who it is for

*Note on S19: policy is fourth in a list of five, never the destination. A social scientist with
scholarly-only uptake reads a variant of the genre, not a hole in their record. Same logic applied
to the outcomes prompt variant at S57.*

---

# B. Strings by item

## B.0 · The shell

### B-38 · Privacy and no-AI line — *build*

**S33 · Persistent shell line**
- **V4** — three fragments, none of them on the main path: banner (127) *"**PROTOTYPE · V4** ·
  convergence build · no LLM · storage: `ncv-v4`"*; subtitle (133) *"…Everything stays on your
  device (`ncv-v4`)."*; Structural read lede (683) *"…nothing leaves your device."*
- **V5** — "No AI, and nothing you write leaves this browser. The checks are fixed rules, and your
  draft is saved on this device only — if you clear your browser data, the draft goes with it."
- **Why** — they are about to type unpublished work and an honest account of what they did not
  achieve. They need to know who can see it before the first field, not on a stage they may never open.

**S34 · Narrow-screen short form** (under ~480px)
- **V4** — *new element*
- **V5** — "No AI. Nothing you write leaves this browser."
- **Why** — the whole claim will not fit on a phone; this half is the part they are actually asking about.

### B-36 · Guide link in the shell — *build*

**S35** — link text: "Read the narrative CV guide"
- **V4** — *new element* (no reference to the guide anywhere in V4)
- **V5** — "Read the narrative CV guide"
- **Why** — the tool asks them to do something the guide explains; a researcher who arrives cold
  needs the explanation within one click, from anywhere.

---

## B.1 · Setup

### B-1 · Setup lede — *build*

**S36**
- **V4** (617) — "Two ways in. If you already have a draft — most people do, eventually — start with
  the structural read and let it show you where the genre's load-bearing moves are missing."
- **V5** — "By the end you will have a draft in your own words — your contributions, your mentorship
  record and a personal statement — plus the questions you want to take to an advisor. Nothing you
  type leaves this browser."
- **Why** — the first sentence of a tool has to answer "what do I get for the next 40 minutes". V4's
  answers "what are the two entry paths", which is a question they have not asked yet.

**S37 · Stage heading** — keep
- **V4** (616) — "How are you arriving?"
- **V5** — "How are you arriving?" *(unchanged — a question, in their voice, doing its job)*

### B-2 · Mode cards and confirmation — *build*

**S38 · Card 1 title** — keep
- **V4** (620) — "Start fresh"
- **V5** — "Start fresh" *(unchanged)*

**S39 · Card 1 description**
- **V4** (620) — "Build contribution by contribution with guided prompts, live checks, and worked
  examples. The personal statement comes last — it's clearest once the rest exists."
- **V5** — "Build one contribution at a time, with prompts, a worked example and live checks. The
  personal statement comes last — it is easier to write once the rest exists."
- **Why** — "contribution by contribution" reads as effort; "one at a time" reads as manageable.
  (Also drops a serial comma.)

**S40 · Card 2 title** — keep
- **V4** (621) — "I already have a draft"
- **V5** — "I already have a draft" *(unchanged — their words, not our feature name)*

**S41 · Card 2 description**
- **V4** (621) — "Paste it in. The tool segments it, runs the same checks paragraph by paragraph, and
  maps it against the structural moves developed CVs make. Then revise here or with your advisor."
- **V5** — "Paste it in for a structural read. The tool splits it into paragraphs, runs the same
  checks on each and shows you which of the format's moves are missing. Revise here, or take the
  read to your advisor."
- **Why** — "segments" and "developed CVs" are our words. They need to know what comes back and that
  it is not a verdict. The mode keeps its name, **Structural read**, and the card now says it.

**S42 · Confirmation line, Start fresh selected**
- **V4** — *new element*
- **V5** — "Start fresh — selected. Set your context below, then you go straight to writing your
  contributions."
- **Why** — B-2's actual complaint: they clicked and nothing on the page told them it took. A line
  that names the next step confirms the click and removes the "what now" pause.

**S43 · Confirmation line, structural read selected**
- **V4** — *new element*
- **V5** — "Structural read — selected. Set your context below, then you paste your draft."

**S44 · Confirmation line, nothing selected yet**
- **V4** — *new element*
- **V5** — "Choose one to start. Switching later keeps everything you have written."
- **Why** — the fear that stops a click is losing work. Mode switching does not clear state, so say so.

**S45 · Selected mark on the card**
- **V4** — *new element*
- **V5** — "Selected"
- **Why** — colour alone failed once already; a word cannot be missed, and it reads aloud.

### H-15 · Agency row, TCV and CV-FRQ expanded — *build*

**S46 · Agency row label** — keep
- **V4** (631) — "Which funding agency?"
- **V5** — "Which funding agency?" *(unchanged)*

**S47 · Agency row help**
- **V4** (631) — "Sets the format (TCV vs CV-FRQ)."
- **V5** — "This sets the format: the Tri-agency CV (TCV) for SSHRC, NSERC and CIHR, or the CV-FRQ
  for the Fonds de recherche du Québec. If you are not sure, pick Other — you can change it later."
- **Why** — a first-time applicant does not know either acronym, picks something and carries the
  doubt for the whole session. Expanded once, at the point of choice, is enough.

**S48 · Discipline row help**
- **V4** (634) — "Switches the worked examples and structural templates."
- **V5** — "This changes the worked example and the shape hints you see. Pick the closest fit — it
  changes nothing you write."
- **Why** — "structural templates" sounds like the tool will impose a form on their record. It will not.

**S49 · Career stage help**
- **V4** (636) — "Calibrates expectations — demonstrated vs emerging impact."
- **V5** — "This changes a few of the prompts. Reviewers are also told not to penalize a non-linear
  career — gaps and changes of direction are not held against you."
- **Why** — this row triggers the "am I enough" question, and the sourced reassurance is better than
  the answer they will supply themselves. Sourced to the Tri-agency reviewer guidelines; note that
  "reviewers read a record relative to career stage" is a stronger claim, made in our guide but not
  verified against the agencies, so this string deliberately makes the weaker sourced one.

**S50 · Competition field label** — keep
- **V4** (640) — "Competition you're aiming at (optional)"
- **V5** — "Competition you're aiming at (optional)" *(unchanged)*

**S51 · Competition field help**
- **V4** (641) — "A narrative CV is aimed, not generic. Naming the competition sharpens the “why this
  program” prompt later."
- **V5** — "A narrative CV is aimed, not generic. If you name the competition here, the personal
  statement prompt will ask about that competition by name."
- **Why** — V4 promises a vague benefit; the real payoff — seeing their own competition quoted back
  — is the moment the tool feels aimed at their application, so promise exactly that.

---

## B.2 · Every stage after Setup — the context bar

### B-7 · Edit context, inline — *build*

**S52 · Bar label** — keep
- **V4** (483) — "Tailored for:"
- **V5** — "Tailored for:" *(unchanged)*

**S53 · Control, collapsed**
- **V4** (492) — "Edit context"
- **V5** — "Edit context"  *(unchanged text, changed behaviour — see C2)*

**S54 · Control, expanded**
- **V4** — *new element*
- **V5** — "Hide context"
- **Why** — matches the tool's existing show/hide pattern ("Show the skeleton"), so the control's
  behaviour is guessable before it is clicked.

**S55 · Panel line, inside the expanded panel**
- **V4** — *new element*
- **V5** — "Change any of these here. Your draft stays exactly where it is."
- **Why** — the whole complaint in B-7 was losing your place. Answer it in the panel, at the moment
  of doubt.

---

## B.3 · Contributions — the stage head

### B-5 · Contributions lede — *build*

**S56 · Stage heading** — see flag F6
- **V4** (744) — "Your 3–5 strongest contributions"
- **V5** — "Your strongest contributions"
- **Why** — the formats allow up to ten and let a cluster count as one. A hard "3–5" in the heading
  tells a researcher with eight to cut, on our authority rather than the funder's. The target belongs
  in the lede, as advice.

**S57 · Lede**
- **V4** (745) — "Group connected work into thematic contributions. The fields are a thinking
  scaffold — in the final CV they disappear into one flowing paragraph. Read the example below first:
  that's the destination."
- **V5** — "Group connected work into themes — a cluster of papers, a program, a partnership all
  count as one contribution. Three to five is a good target, and the formats allow up to ten. The
  fields below are scaffolding for thinking; in the finished CV they disappear into one flowing
  paragraph, so read the example first and you will see what you are aiming at."
- **Why** — they arrive with a publication list and no idea what a "contribution" is allowed to be.
  Answer that first, then tell them the fields are not the output.

**S58 · Guide link, Contributions stage**
- **V4** — *new element*
- **V5** — "How a contribution is built — read the guide"

### B-17 + B-20 · The one-time note about the checks — *build*

**S59 · Note**
- **V4** — *new element*
- **V5** — "The checks under each field are suggestions. Nothing here blocks you, nothing is scored
  and nothing is sent anywhere — you know your record better than a word list does."
- **Why** — the first orange flag arrives about 90 seconds in, on a field they wrote honestly. If
  they have not been told what the flags are, they will either obey them or distrust the tool. Both
  cost them accuracy — one persona rewrote a true date to clear a flag.

**S60 · Dismiss control**
- **V4** — *new element*
- **V5** — "Got it"

### B-6 · Work mode — *build*

**S61 · Question**
- **V4** (749) — "Quick question first — how does your work happen? (choose any)"
- **V5** — "How does your work usually happen? Choose any that apply."
- **Why** — "(choose any)" in a parenthesis, in lower case, at the end, is where the multi-select
  promise died. Put it in the sentence.

**S62 · Help**
- **V4** (750) — "This surfaces role-clarity and outcome prompts that fit how you work."
- **V5** — "This sets which role and outcome prompts you see below. Pick more than one if more than
  one is true — most people are more than one."
- **Why** — "surfaces role-clarity prompts" is us describing our own machinery. And the second
  sentence is the permission the single-shot bug removed.

**S63 · Collapsed summary line**
- **V4** — *new element*
- **V5** — "How your work happens: Team-based · Community-engaged"
- **Why** — the answer stays visible, so they can see it is incomplete and fix it.

**S64 · Change control on the summary**
- **V4** — *new element*
- **V5** — "Change"

### B-10 + B-13 · The exemplar box — *build*

**S65 · Box title**
- **V4** (759) — "What a finished contribution reads like (Social sciences, invented)"
- **V5** — "What a finished contribution reads like — Social sciences"
- **Why** — the disclaimer moves out of the parenthetical into its own tag, where it cannot be skimmed past.

**S66 · Fictional tag**
- **V4** — *new element* (the word "invented" was inside S65's parenthetical)
- **V5** — "Fictional example"
- **Why** — a researcher who suspects this is a real person's CV will not trust the tool with theirs.

**S67 · Source line**
- **V4** — *new element*
- **V5** — "Where the shape comes from: the Tri-agency CV and CV-FRQ instructions, which ask each
  contribution to make its significance and your role unambiguous. The content is fictional — the
  researcher, the project and the numbers do not exist."
- **Why** — B-13's real question is "is this shape yours or the funder's?". The answer changes how
  much authority they give it. The instructions are citable; nothing else is.

**S68 · Skeleton toggle, closed** — keep (B-8)
- **V4** (774) — "Show the skeleton"
- **V5** — "Show the skeleton" *(unchanged)*

**S69 · Skeleton toggle, open** — keep (B-8)
- **V4** (777) — "Hide the skeleton"
- **V5** — "Hide the skeleton" *(unchanged)*

**S70 · Legend note under the exemplar**
- **V4** (780) — "The scaffold is invisible in the finished text — every sentence is doing a job. The
  fields below help you produce each job; the writing stays yours."
- **V5** — "In the finished text the scaffold is invisible, but every sentence is still doing one of
  these six jobs. The fields below help you write each one. The words stay yours."
- **Why** — this is the sentence that made the skeleton toggle the best teaching moment in the
  persona run. It only needed the six jobs named as six.

---

## B.4 · Contributions — the card

### B-12 · Beat kickers on the field labels — *build*

Each field label gains a kicker above it, in the beat's colour. Kicker text is the job name from A1,
verbatim: **S71** "Stakes" · **S72** "Your role" · **S73** "What you did" · **S74** "What resulted" ·
**S75** "What already changed" · **S76** "What could change".

**Why** — the same six words on the legend chip, on the field label and on the coverage row is the
whole of B-12. When the reader recognises the word, they already know what the field wants.

### The contribution prompts

**S77 · Title prompt** — keep
- **V4** (372) — "Give this contribution a headline."
- **V5** — "Give this contribution a headline." *(unchanged)*

**S78 · Title help**
- **V4** (372) — "Short, memorable, plain-language — a reviewer should be able to repeat it. Think
  payoff, not paper title."
- **V5** — "Short, plain and memorable — a reviewer should be able to repeat it back from memory.
  Name what the work was for, not what the paper was called."
- **Why** — "think payoff" is ad-agency register. The instruction is really "do not paste your title".

**S79 · Title help, creative variant**
- **V4** (372) — "Name this body of work in a line a curator could use."
- **V5** — "Name this body of work in one line a curator could use." *(near-unchanged)*

**S80 · Title input placeholder** — keep
- **V4** (823) — "A headline a reviewer could repeat"
- **V5** — "A headline a reviewer could repeat" *(unchanged)*

**S81 · Stakes prompt** — keep
- **V4** (373) — "Start with the problem. What was at stake, and for whom?"
- **V5** — "Start with the problem. What was at stake, and for whom?" *(unchanged)*

**S82 · Stakes help**
- **V4** (373) — "Set up the why before the what. Developed CVs open each contribution with the
  challenge it answered."
- **V5** — "Set up the why before the what. Strong contributions open with the problem they answered,
  not with the method that answered it."
- **Why** — "developed CVs" is a category we invented and they cannot check.

**S83 · Role chip row label**
- **V4** (835) — "Your role in this work"
- **V5** — "How were you involved?"
- **Why** — the flat noun label is demoted to a label for the three chips, where it is a question with
  three answers on screen. The real question is promoted to S84/S85.

**S84 · Role line prompt — team, community or industry work mode** (B-15)
- **V4** (374, placeholder only) — "In one line: what was your move — the thing that wouldn't exist
  without you?"
- **V5** — "In one line, what was your unique contribution within the team?"
- **Why** — this is the question the format actually requires an answer to, so it becomes the visible
  label instead of a placeholder that vanishes at the first keystroke.

**S85 · Role line prompt — solo, or no work mode set** (B-15)
- **V4** (374) — as above
- **V5** — "In one line, what did you do that wouldn't exist without you?"
- **Why** — a solo researcher has no team to be unique within, and being asked reads as a mistake
  about their record. This wording is also the safe default before the work-mode question is answered.

**S86 · Role line help**
- **V4** (374) — "Use “we” for genuine team science, then make your own role unmistakable. Don't
  erase the team — be visible inside it."
- **V5** — "Say “we” where the work really was a team's, then make your own part unmistakable in the
  same sentence. No agency requires first person — what they do require is that your role is
  unambiguous."
- **Why** — the second sentence is a funder fact and it settles the discomfort that stops people
  writing this line at all. It also stops the tool implying "I" is a rule when it is our advice.

**S87 · What you did prompt** — keep
- **V4** (375) — "What did you actually do?"
- **V5** — "What did you actually do?" *(unchanged)*

**S88 · What you did help**
- **V4** (375) — "Your specific work and role in it."
- **V5** — "The specific work — what you designed, ran, built, negotiated or wrote. This is a good
  place for scale: how many sites, how long, how many people."
- **Why** — five words of help under a large box produces a paragraph of generalities. Naming the
  verbs and inviting the numbers here is also what makes the number check reasonable *here* and
  nowhere else.

**S89 · What you did help, creative variant**
- **V4** (375) — "What was the work and your role in making it?"
- **V5** — "What was the work, and what was your part in making it?"

**S90 · What resulted prompt** — keep
- **V4** (376) — "What concrete things resulted?"
- **V5** — "What concrete things resulted?" *(unchanged)*

**S91 · What resulted help**
- **V4** (377) — "Name them — papers, datasets, tools, methods, partnerships, programs."
- **V5** — "Name them — papers, datasets, tools, methods, protocols, partnerships, programs. Things,
  not effects; effects are the next field."
- **Why** — the outputs/outcomes confusion is the most common wrong turn on this card, and it is
  cheaper to prevent here than to flag later.

**S92 · What resulted help, creative variant**
- **V4** (378) — "What works resulted — exhibitions, films, performances, published creative works?"
- **V5** — "What works resulted — exhibitions, films, performances, published creative works?" *(unchanged)*

**S93 · What resulted help, humanities variant**
- **V4** (378) — "What resulted — books, editions, public works, exhibitions, monographs?"
- **V5** — "What resulted — books, editions, exhibitions, public works, collections?"
- **Why** — "books… monographs" lists the same thing twice; swapping in collections covers recovery
  and archive work.

**S94 · What already changed prompt** — keep
- **V4** (380) — "What already changed because of this?"
- **V5** — "What already changed because of this?" *(unchanged)*

**S95 · What already changed help**
- **V4** (380) — "Who used it, what shifted — concretely. If nothing concrete yet, leave this blank
  and put your hypothesis in Impact."
- **V5** — "Who used it and what shifted — concretely. If nothing has changed yet, leave this blank
  and put what you expect under What could change."
- **Why** — "Impact" was the name of a field that no longer exists under that name. Pointing at the
  next field by its visible name is the difference between a usable instruction and a dead reference.

**S96 · What already changed, community variant** — keep
- **V4** (382) — "Who in the community or sector has used this, and what concretely changed for them?"
- **V5** — "Who in the community or sector has used this, and what concretely changed for them?" *(unchanged)*

**S97 · What already changed, health variant**
- **V4** (383) — "What changed in practice, care, or policy — and for whom?"
- **V5** — "What changed in practice, care or policy — and for whom?" *(serial comma removed)*

**S98 · What already changed, social variant** (B-11)
- **V4** (384) — "Who took this up — scholars, policymakers, practitioners — and what shifted?"
- **V5** — "Who took this up — scholars, practitioners, communities, the public or policy makers —
  and what shifted?"
- **Why** — same fix as the shape hint. Policy is one of five kinds of uptake, not the second thing
  we name.

**S99 · What could change prompt**
- **V4** (388) — "What could change at the scale of a field, sector, or population?"
- **V5** — "What could change at the scale of a field, sector or population?" *(serial comma removed)*

**S100 · What could change help** (B-22 — the badge's reassurance folded in)
- **V4** (388) — "Hedging is expected here — say what's hypothesised. Academic impact counts fully:
  changing how others think, what gets studied, how problems get framed."
- **V5** — "This is the one field where hedged language belongs — say what could follow, not what
  already has. Academic impact counts fully here: changing how others think, what gets studied, how
  a problem gets framed. Influence on the direction of thought is on the reviewers' own list."
- **Why** — the reassurance was true but delivered in a red uppercase chip that read as a warning.
  As a sentence, in the place they are about to write, it does the work the chip could not — and the
  last clause tells them it is the funder's position, not ours.

**S101 · Academic-impact badge** — removed (B-22)
- **V4** (521) — "academic impact counts"
- **V5** — *deleted.* No replacement chip.

**S102 · One moment prompt** (B-23 + B-24)
- **V4** (389) — "Did this work reach a real person, clinic, policy, or community?"
- **V5** — "What is one moment when this work reached someone?"
- **Why** — the yes/no question got yes/no answers. What we want is a scene, so ask for the scene.

**S103 · One moment help** (B-24)
- **V4** (389) — "If so, tell that moment in one or two sentences. (Optional.)"
- **V5** — "One scene, two sentences — a person, a clinic, a classroom, a community meeting, a
  committee that used it. This is the texture behind What already changed, not a second version of
  it. Optional."
- **Why** — B-24's overlap is real and only copy can fix it: the field above wants the general
  uptake, this one wants one human moment. Naming the other field by name is what makes the split
  visible.

**S104 · One moment field label**
- **V4** — *new element* (V4 shows only the question)
- **V5** — "One moment (optional)"
- **Why** — it is deliberately not one of the six jobs, so it does not get a beat kicker. The label
  says so.

### B-25 + B-26 + B-27 · Evidence

**S105 · Evidence label**
- **V4** (390) — "Add your proof points — one at a time."
- **V5** — "Evidence"
- **Why** — one word for one thing, matching the export, the weave block and the coverage row. "Proof
  points" was the only surface calling it something else.

**S106 · Evidence help** (B-26)
- **V4** (390) — "Pick a type for each. The tool keys them a, b, c… into your draft, the way a
  developed CV keys its reference box."
- **V5** — "Add one item at a time: a citation, a named adoption, an award, a dataset, a piece of
  coverage. Then pick its type. Each item gets a letter — a, b, c — and the letter appears in your
  draft beside the sentence it backs up."
- **Why** — V4 explains our lettering machinery before it says what to type, and compares it to a
  document they may never have seen. What to type first, what we do with it second.

**S107 · Evidence row placeholder** — see flag F7
- **V4** (897) — "Citation, link, uptake, award…"
- **V5** — "Citation, adoption, award, dataset…"
- **Why** — the Tri-agency CV must be self-contained and bans hyperlinks. Inviting a link in the
  placeholder walks them into a formatting problem they will not discover until submission.

**S108 · Add button**
- **V4** (905) — "+ Add proof point"
- **V5** — "+ Add evidence"

**S109 · Evidence type list**
- **V4** (170–173) — "Peer-reviewed" · "Media / public" · "Policy / practice uptake" · "Dataset /
  tool" · "Award / recognition" · "Funding" · "Replication / citation"
- **V5** — unchanged, plus **"Other"** at the end of the list.

**S110 · Other free-text placeholder** (B-27)
- **V4** — *new element*
- **V5** — "Name the type — patent, exhibition, clinical guideline, software release…"

**S111 · Other free-text help**
- **V4** — *new element*
- **V5** — "Whatever you type here is what prints in your draft."
- **Why** — the type string is printed in the export, so a bare "Other" would read badly in a document
  they hand to someone. Telling them it prints is what makes them write something usable.

### The assemble block (weave)

**S112 · Assemble control, closed** — keep
- **V4** (923) — "▸ Assemble — see your material as one paragraph"
- **V5** — "▸ Assemble — see your material as one paragraph" *(unchanged)*

**S113 · Assemble control, open**
- **V4** (923) — "Hide assembled material"
- **V5** — "Hide the assembled material"

**S114 · Assemble note**
- **V4** (930) — "Your material, assembled — with suggested transitions. The paragraph is yours to
  write; this just puts everything on one surface."
- **V5** — "Your material on one surface, with suggested joins. This is not the finished paragraph —
  you still write that, in your own words."
- **Why** — some readers will copy this straight out. Say plainly that it is raw material, or the
  tool has quietly written their CV for them.

**S115 · Assemble empty state** — keep
- **V4** (938) — "Fill in the fields above to see them assembled."
- **V5** — "Fill in the fields above to see them assembled." *(unchanged)*

**S116 · Connective words**
- **V4** (912) — `activities:` "to address this →" · `outputs:` "this produced →" · `outcomes:` "to
  date →" · `impact:` "looking ahead →"
- **V5** — `activities:` "to address this →" · `outputs:` "this produced →" · `outcomes:` "so far →" ·
  `translational:` "in one case →" · `impact:` "looking ahead →"
- **Why** — "to date" is fine but formal; "so far" is what a person says. The one-moment field is in
  the assembly order (V4:917) but had no join, so it currently runs straight into the uptake sentence
  — which is precisely the overlap B-24 reported.

**S117 · Gap — no stakes**
- **V4** (919) — "No stakes opener — what problem was this answering?"
- **V5** — "Nothing under Stakes — what problem was this work answering?"

**S118 · Gap — no outcomes**
- **V4** (920) — "No outcomes — reviewers look for what has already changed."
- **V5** — "Nothing under What already changed — is there something concrete you can name yet?"
- **Why** — a question, and it leaves room for the honest answer "not yet", which is a legitimate
  state for recent work.

**S119 · Gap — no impact**
- **V4** (921) — "No impact — what could this change at field scale? (Hedged is fine.)"
- **V5** — "Nothing under What could change — what might this change at field scale? Hedged is fine."

**S120 · Gap — no evidence**
- **V4** (922) — "No evidence keyed — a contribution without proof points reads as a claim."
- **V5** — "No evidence attached — without it, this reads as a claim rather than a record."

---

## B.5 · The checks

All flags keep the ⚠ prefix and all strengths keep the ✓ prefix. Quoted trigger words keep V4's
curly quotes.

**S121 · Ownership flag**
- **V4** (256) — "3× “we/us/our” with no “I …” or “my group …” nearby — your individual role is invisible"
- **V5** — "“we” or “our” appears 3 times with no “I …” nearby — as written, which part was yours is
  invisible."
- **Why** — the V4 wording explains our rule ("no I… or my group… nearby") rather than their problem.
  The consequence is the useful half.

**S122 · Ownership strength, balanced**
- **V4** (254) — "Team voice + individual ownership — the balance reviewers want"
- **V5** — "Team voice and your own role, both visible — that is the balance the format asks for."
- **Why** — this is the tool's best teaching moment; it earned its place in the persona run. Only the
  "+" needed to go.

**S123 · Ownership strength, plain**
- **V4** (254) — "Ownership marker present"
- **V5** — "Your own role is marked."

**S124 · Weak-verb flag**
- **V4** (257) — "Weak collaboration verb: “worked on” — say what you specifically did"
- **V5** — "“worked on” doesn't say what you did — name the specific action."

**S125 · No-numbers question** (B-19, fires only on What you did, What resulted, What already changed)
- **V4** (264) — "No numbers, dates, or quantities — give reviewers something to verify"
- **V5** — "No numbers or dates in this one — is that right for this field?"
- **Why** — three fixes in one line: it asks instead of asserting, it stops speaking for the reviewer
  in a register that reads as a threat, and it no longer fires on a stakes opener or a one-line role
  statement, where a number would be wrong. A persona added a fake digit to clear this flag; that is
  the cost of asserting it.

**S126 · Specificity strength** — keep
- **V4** (262) — "2 specific numbers"
- **V5** — "2 specific numbers" *(unchanged; now also counts numbers spelled as words, per H8, and
  excludes prestige metrics, per H3)*

**S127 · Vague flag, quantity words** (various, several, many, a number of, a few, multiple)
- **V4** (270) — "Vague: “several” — replace with concrete evidence"
- **V5** — "“several” — how many?"
- **Why** — the shortest possible version of the fix, and it is answerable in three seconds.

**S128 · Vague flag, reputation words** (well-received, widely cited, highly regarded, well-known,
significant, important, major)
- **V4** (270) — as above
- **V5** — "“widely cited” — swap it for the specific thing you can name."
- **Why** — "how many" is the wrong question for "well-received". Two wordings, one for each half of
  the list, is the difference between a flag that helps and one that misses.

**S129 · Prestige-metrics flag** (H3 — new: impact factor, IF n, h-index, top-tier, high-impact
journal, leading journal, prestigious venue)
- **V4** — *new element.* V4 currently credits "IF 14.2" and "h-index is 11" as "✓ 2 specific numbers".
- **V5** — "“h-index” — reviewers are told to disregard h-index, journal impact factor and venue
  prestige. Say what the work changed instead."
- **Why** — this is not a style preference: the Tri-agency reviewer guidelines instruct reviewers to
  disregard these as surrogates. Rewarding them as specificity actively steers a researcher toward
  the thing their reviewer has been told to ignore, and toward the exact lines a mentor would cut.

**S130 · Hedging flag, factual fields**
- **V4** (282) — "Hedging (could, may) — state what happened definitively; move hypotheses to Impact"
- **V5** — "“could”, “may” — this field is for what happened. Move the maybes to What could change."

**S131 · Hedging flag, structural read**
- **V4** (279) — "Hedges (could) — right for impact claims, wrong when stating what happened"
- **V5** — "“could” — right when you are saying what might follow, loose when you are saying what happened."

**S132 · Hedging strength, What could change**
- **V4** (277) — "Hedging used appropriately for Impact (could, may)"
- **V5** — "Hedged — exactly right here. What could change is the one place for it."

**S133 · Meta line, field with a length range** (B-17 + B-20)
- **V4** (509–510) — "78 words (aim 40–80, uncalibrated) · rubric 2/4 — a hint, not a gate"
- **V5** — "78 words · 40 to 80 is a comfortable range here."
- **Why** — a score out of four that we ourselves label uncalibrated invites them to optimise a
  number we cannot defend. The word count is the only part of that line they can act on.

**S134 · Meta line, field with no range**
- **V4** (508) — "78 words"
- **V5** — "78 words" *(unchanged)*

**S135 · Read-back line label** (B-16)
- **V4** — *new element*
- **V5** — "Your text, with those words marked:"
- **Why** — the flags already quote the word; what is missing is *where* it is. The label has to say
  the line below is their own sentence, not a rewrite of it.

### B-21 · The Your-call row

**S136 · Row label**
- **V4** (542) — "Your call:"
- **V5** — "Your call. Anything you mark “needs work” or “ask advisor” goes into your advisor packet."
- **Why** — three unexplained symbols under every field, doing the most consequential thing on the
  page. One sentence turns a mystery row into the reason to use it.

**S137 · Buttons**
- **V4** (543) — "✓" · "✗" · "?" (words only in `title` tooltips)
- **V5** — "✓ Fine" · "✗ Needs work" · "? Ask advisor"
- **Why** — tooltips do not exist on touch and are not read aloud in order.

**S138 · Tooltips** — keep
- **V4** (543) — "Looks right" · "Needs work" · "Unsure — ask my advisor"
- **V5** — unchanged.

**S139 · Note placeholders** — keep
- **V4** (549) — "Note to self: what needs fixing here?" · "Note: what would you ask your advisor
  about this?"
- **V5** — unchanged.

---

## B.6 · Mentorship

**S140 · Stage lede**
- **V4** (963) — "Start with the totals, then make it concrete. The most persuasive thing in this
  section is a real trajectory — a person you trained and where they went."
- **V5** — "Start with the totals, then make it concrete. The most persuasive thing in this section
  is one real trajectory — a person you trained, and where they went. Formal supervision counts here,
  and so does informal mentoring."
- **Why** — "trajectory" stays: it is the genre's own word and the section's organising idea (B-29).
  The added sentence is a funder fact and it is the one that lets an early-career researcher, or
  anyone in a field without graduate supervision, fill this section at all.

**S141 · Totals label**
- **V4** (966) — "Totals — people you've trained (last 5 years)"
- **V5** — "Totals — people you've trained in the last five years"

**S142 · Trajectory question** — keep
- **V4** (982) — "Name a few people you've trained — where are they now?"
- **V5** — "Name a few people you've trained — where are they now?" *(unchanged)*

**S143 · Trajectory help** (B-28 — *open for Eli*)
- **V4** (985) — "Who → stage → where they went → why it matters. Use initials or “a PhD student” if
  you prefer to keep it anonymous."
- **V5** — "Naming the people you trained is standard in this format — the Tri-agency CV asks you to
  mark each supervised trainee's name with an asterisk in your citations, and mentorship sections
  normally name where people went. Initials are fine if you would rather not use a full name."
- **Why** — V4 offered anonymity as a preference and never answered the question actually being
  asked, which is "am I allowed to". A researcher who assumes not will write the weakest possible
  version of the strongest section. *Confirm with Eli before this ships beyond beta.*

**S144 · Row placeholders**
- **V4** (988, 990, 992) — "Name / initials" · "Stage (PhD…)" · "Where they are now"
- **V5** — "Name or initials" · "Stage — PhD, MSc, postdoc…" · "Where they are now"

**S145 · Why-line placeholder** (B-29)
- **V4** (999) — "One line — why this trajectory matters (optional)"
- **V5** — "One line — why this example matters (optional)"

**S146 · Add-a-person button** — keep
- **V4** (1004) — "+ Add a person"
- **V5** — "+ Add a person" *(unchanged)*

**S147 · Mentoring approach prompt** (B-30 — #1 was not a question)
- **V4** (394) — "Your mentoring approach — shown through one concrete thing you do."
- **V5** — "What is one concrete thing you do that shows how you mentor?"

**S148 · Mentoring approach help**
- **V4** (394) — "Not a slogan. A practice: how you run a first meeting, how you hand off authorship,
  how you push independence."
- **V5** — "Not a slogan — a practice. How you run a first meeting, how you decide authorship, how
  you hand a project over when someone is ready for it."

**S149 · Equity prompt** (B-31 — the subject is named in the question)
- **V4** (395) — "What real context shapes who you mentor and how?"
- **V5** — "Equity in practice — who gets into your group, and what have you changed about how they
  get there?"
- **Why** — "real context" told them nothing, so they either wrote an EDI statement or skipped it.
  Naming equity and asking for a route rather than a position gets the structural answer the design
  was reaching for.

**S150 · Equity help**
- **V4** (395) — "Ground equity in your actual environment — your institution's makeup, a program you
  built, a barrier you work against. Structural beats abstract."
- **V5** — "This asks for a structure, not a statement: a recruitment route you changed, a program
  you built, a barrier in your environment you work against. Reviewers are asked to look at equity in
  the research process itself, so one concrete practice reads better than a position."
- **Why** — B-31 asked whether the indirection was deliberate. It was, so the help now says why —
  which is also the funder's own reason.

**S151 · Equity prompt, community variant**
- **V4** (396) — "What in your community partnerships and environment shapes who you bring into
  research, and how?"
- **V5** — "Who do your community partnerships bring into research, and what did you change to make
  that possible?"

**S152 · Beyond your students prompt** — keep
- **V4** (398) — "Beyond your own students — who else do you mentor?"
- **V5** — "Beyond your own students — who else do you mentor?" *(unchanged)*

**S153 · Beyond your students help**
- **V4** (398) — "Junior faculty, postdocs, visiting scholars, peers."
- **V5** — "Informal mentoring counts here: early-career colleagues, postdocs you don't supervise,
  visiting scholars, peers, community researchers."
- **Why** — "junior faculty" is a term the house lexicon rules out, and the four-word list read as a
  closed set. The formats explicitly include informal mentorship, so say so.

**S154 · Guide link, Mentorship stage**
- **V4** — *new element*
- **V5** — "What counts as mentorship — read the guide"

---

## B.7 · Personal statement

**S155 · Stage lede** (B-32)
- **V4** (1019) — "It appears first in the CV but is written last — and now that your contributions
  exist, the throughline should be easier to see. Two questions do most of the work: why your area
  matters at all, and why your particular work matters within it."
- **V5** — "It appears first in the finished CV, and it is the last thing you write. The prompts
  below ask you to name the thread running through the contributions you have just written."
- **Why** — the page announces two questions and then shows six prompts, which reads as a bait. The
  synthesis idea survives, in the note below, where it belongs.

**S156 · Why-last note** — keep
- **V4** (1022–1023) — "**Why last?** The statement is a synthesis of what you just wrote. If a
  prompt below feels hard, the answer is usually already sitting in one of your contributions."
- **V5** — unchanged. *(This is the string B-32's decision asks for and it already exists.)*

**S157 · Anchor label** — keep
- **V4** (1027) — "Finish this line:"
- **V5** — "Finish this line:" *(unchanged)*

**S158 · Anchor help** — keep
- **V4** (1028) — "Plain and direct. This is your first sentence."
- **V5** — "Plain and direct. This is your first sentence." *(unchanged)*

**S159 · Anchor sentence** (H2 — no copy change, article fixed in code)
- **V4** (1030, export 1172, print 1260) — "I am a [role] at [institution]. My work is in [field]."
- **V5** — "I am a/an [role] at [institution]. My work is in [field]." — the article is chosen from
  the typed role. Reads correctly in all three places: *"I am an assistant professor at [institution].
  My work is in [field]."* See C11 for the sound rule, which is not a plain vowel test.

**S160 · Streams prompt**
- **V4** (366) — "Name 2–4 strands of your work. What single thread connects them?"
- **V5** — "Name two to four strands of your work. What single thread connects them?"

**S161 · Streams help**
- **V4** (366) — "Reviewers should see one coherent program, not a scatter of projects."
- **V5** — "A reviewer should see one coherent program, not a scatter of projects."

**S162 · Standing help** — the V8 fix
- **V4** (370) — "Funding, scale of output, recognition, reach. List them — then gather them into one
  confident paragraph rather than scattering them."
- **V5** — "Funding, the scale of what you have built, recognition, reach. List them first, then
  gather them into one confident paragraph. Leave out h-index and journal impact factor — reviewers
  are told to disregard both."
- **Why** — "signals of standing" is the single prompt most likely to produce an h-index. The
  sentence that prevents it belongs in the help, not in a flag after the fact.

**S163 · Challenge, pivot, program-fit and horizon prompts** — keep
- **V4** (361–369) — all four prompts and their help text, including the discipline variants and the
  early-career standing variant.
- **V5** — unchanged. They are questions, in second person, with concrete help. The program-fit prompt
  quoting the researcher's own competition back to them is the best moment in this stage.

**S164 · Guide link, Personal statement stage**
- **V4** — *new element*
- **V5** — "What goes in a personal statement — read the guide"

---

## B.8 · Review and export

**S165 · Stage heading** (B-33)
- **V4** (1059) — "Pull it together"
- **V5** — "Is this ready to show someone?"
- **Why** — it is the question they actually have at this point, in their own words, and the stage
  exists to answer it.

**S166 · Stage lede** (B-33 + B-35 neutral)
- **V4** (1060) — "Coverage check, self-check, then export. Three outputs: a working draft, a print
  view in the genre's visual form, and an advisor packet built from your own flags and questions —
  designed to make a consult dramatically more productive."
- **V5** — "Two checks, then your files. The coverage list shows what is still empty, and the
  self-check is yours to run. Then you can download a working draft, open a print view or take a
  packet of your own flags and questions to an advisor."
- **Why** — "dramatically more productive" is a claim about an advisor's time made without an advisor
  in the room, and it sets an expectation the researcher then has to live up to. Describing the file
  is enough.

**S167 · Coverage section title** (B-34)
- **V4** (1063) — "Coverage — what you've engaged"
- **V5** — "Coverage — what you have filled in so far"

**S168 · Coverage group headers** (B-34)
- **V4** — *new element* (flat list of ten rows)
- **V5** — "Setup" · "Contributions" · "Mentorship" · "Personal statement"
- **Why** — grouped, they can see at a glance which part of the CV is thin, which is the half of the
  note that "(PS)" was standing in for.

**S169 · Coverage rows** (B-34 — "(PS)" expanded by the group header, labels made plain)
- **V4** (1065–1074) — "Context set" · "At least one full contribution (title + activities +
  outcomes)" · "Each contribution has a role line" · "Evidence attached to a contribution" · "A
  mentee trajectory named" · "Mentoring approach drafted" · "Central challenge named (PS)" · "Origin
  / pivot story (PS)" · "Standing paragraph drafted (PS)" · "Program-fit articulated (PS)"
- **V5** —
  - Setup: "Context set — agency, discipline and career stage"
  - Contributions: "At least one full contribution — headline, what you did, what already changed"
  - Contributions: "Every contribution has a role line"
  - Contributions: "Evidence attached to at least one contribution"
  - Mentorship: "One person named, with where they went"
  - Mentorship: "Mentoring approach written"
  - Personal statement: "Central challenge named"
  - Personal statement: "Origin or pivot story written"
  - Personal statement: "Standing paragraph drafted"
  - Personal statement: "Why this competition — answered"
- **Why** — every row now names a thing they can go and do, in the words the field itself used.

**S170 · Coverage status words**
- **V4** (1078) — "✓ done" · "—"
- **V5** — "✓ done" · "not yet"
- **Why** — an em dash is not an answer. "Not yet" is accurate and not a failure.

**S171 · Failing contribution detail** (H5)
- **V4** — *new element*
- **V5** — appended to the row label: " — missing on 3. Bridge monitoring toolkit" (the
  contribution's number plus its headline when it has one; falls back to " — missing on contribution
  3" when it is untitled). The headline here is illustrative, taken from the tool's own fictional
  STEM exemplar.
- **Why** — with three contributions on the page, "not yet" without a name is a search task.

**S172 · Open flags panel title** — keep
- **V4** (1092) — "Your open flags (2) — these go into the advisor packet"
- **V5** — unchanged.

**S173 · Self-check header** — keep
- **V4** (1100) — "Self-check before you export"
- **V5** — unchanged.

**S174 · Self-check lines**
- **V4** (1102–1106) — five lines, verbatim in the file.
- **V5** — line 1 unchanged; line 3 and line 5 unchanged; two changes:
  - line 2: "Each contribution states a concrete outcome (what already changed) separate from impact
    (what could change)." → "Every contribution separates what already changed from what could change."
  - line 4: "My evidence is specific — numbers, names, dated references — not “widely cited.”" → "My
    evidence is specific — numbers, names, dated references — not “widely cited” or a journal's
    reputation."
- **Why** — line 2 was the last place carrying the old field names. Line 4 closes the same gap S129
  and S162 close, in the reader's own voice, on the last screen before they export.

**S175 · Consult questions label** — keep
- **V4** (1118) — "Questions for your advisor"
- **V5** — "Questions for your advisor" *(unchanged)*

**S176 · Consult questions help** (B-35 neutral)
- **V4** (1121) — "What do you want a human expert's eye on? These go to the top of the advisor
  packet, together with everything you flagged ✗ or ?."
- **V5** — "What do you want a second pair of eyes on? These sit at the top of the advisor packet,
  with everything you marked ✗ or ?."

**S177 · Consult questions placeholder**
- **V4** (1125) — "e.g. Is contribution 2 strong enough to lead with? Does my impact claim overreach?"
- **V5** — "e.g. Is contribution 2 strong enough to lead with? Does my last claim overreach?"

**S178 · Working draft label** — keep
- **V4** (1132) — "Your working draft"
- **V5** — "Your working draft" *(unchanged)*

**S179 · Working draft note**
- **V4** — *new element*
- **V5** — "Read-only here. Copy it or download it, then edit it in your own document."
- **Why** — the box looks like a textarea and is not editable; without a line saying so, the first
  instinct is to try to fix a typo in it.

**S180 · Export buttons**
- **V4** (1149–1154) — "Download draft (.txt)" · "Download advisor packet (.txt)" · "Open print view"
  · "Copy draft"
- **V5** — "Download your draft (.txt)" · "Download your advisor packet (.txt)" · "Open print view" ·
  "Copy draft"

**S181 · Copy confirmation** — keep
- **V4** (1156) — "Copied ✓"
- **V5** — "Copied ✓" *(unchanged)*

**S182 · Guide link, Review stage**
- **V4** — *new element*
- **V5** — "What reviewers look for — read the guide"

### The exported files

**S183 · Draft export header**
- **V4** (1167) — "NARRATIVE CV — WORKING DRAFT (V4)"
- **V5** — "NARRATIVE CV — WORKING DRAFT"
- **Why** — this file leaves the tool and may be opened by an advisor. Our version number means
  nothing to them.

**S184 · Draft export context line** — keep
- **V4** (1169) — "Context (for tailoring only — not for submission): …"
- **V5** — unchanged.

**S185 · Advisor packet title** (B-35 neutral)
- **V4** (1211) — "NARRATIVE CV — ADVISOR CONSULT PACKET"
- **V5** — "NARRATIVE CV — ADVISOR PACKET"

**S186 · Advisor packet subtitle** (B-35 neutral)
- **V4** (1212) — "Prepared by the researcher, from their own flags and questions."
- **V5** — "Written by the researcher. It lists the questions they want to discuss and the fields
  they marked themselves."
- **Why** — states what the file contains and nothing about how a consult should run. Whether the
  packet should set an agenda is the advisor conversation, not ours to assume in a header.

**S187 · Advisor packet section headers**
- **V4** (1215, 1219, 1233) — "MY QUESTIONS FOR THIS CONSULT" · "WHERE I FLAGGED MY OWN DRAFT" ·
  "AUTO-CHECK SUMMARY (deterministic lint — hints, not judgments)"
- **V5** — "QUESTIONS I WANT TO DISCUSS" · "WHERE I FLAGGED MY OWN DRAFT" · "AUTO-CHECK SUMMARY
  (suggestions from the tool, not judgments)"
- **Why** — "deterministic lint" is engineering vocabulary in a document handed to a third party.

**S188 · Advisor packet empty states** — keep
- **V4** (1216, 1231) — "(none written yet)" · "(no fields flagged)"
- **V5** — unchanged.

**S189 · Print view note**
- **V4** (1252) — "Generated by the Pathways NCV tool (V4). Visual form only — check current funder
  formatting rules before submission."
- **V5** — "Generated by the Pathways narrative CV tool. Visual form only — check your competition's
  formatting rules before you submit."
- **Why** — formatting is set per competition, not per funder: CIHR and SSHRC specify Arial 12, the
  CV-FRQ specifies Times New Roman 12 with filename rules, and NSERC defers to each opportunity. The
  instruction has to point at the competition or it is wrong.

---

## B.9 · Structural read — shared strings only

The Structural read path is otherwise deferred (never reviewed by anyone). These two strings change
only because they carry cross-cutting decisions.

**S190 · Stage lede, closing clause** (B-38)
- **V4** (683) — "…It's a heuristic reading, not a judgment — and nothing leaves your device."
- **V5** — "…It is a rough reading, not a judgment. Nothing you paste leaves this browser."
- **Why** — "heuristic" is ours. The privacy claim matters most on the one stage where they paste a
  whole unpublished document.

**S191 · Guide link, Structural read stage**
- **V4** — *new element*
- **V5** — "What the format expects — read the guide"

---

# C. UX notes for the engineer

## C1 · Mode cards and the confirmation line (B-2)

Three states, not two.

- **Unselected, nothing chosen yet** — both cards in the current resting style. The confirmation slot
  under the grid shows **S44** in muted text.
- **Selected** — filled header band in Concordia burgundy with reversed text, the card's border at
  full weight, and the word **S45** ("Selected") top-right inside the card. Selection must be legible
  in greyscale and to a screen reader: set `aria-pressed="true"` on the chosen card.
- **Unselected while the other is chosen** — the other card drops to about 55 per cent opacity, keeps
  its border at hairline weight, and stays fully clickable. It must not look disabled.

The confirmation line sits directly under the grid, in its own slot that is always present so nothing
below it moves when the text changes. It swaps between S42, S43 and S44. Announce the change with
`aria-live="polite"`, so the confirmation is not a purely visual event.

Hover state must be visibly different from selected — the V4 hover and selected states are nearly
identical, which is half of why B-2 was filed.

## C2 · The inline Edit-context panel (B-7)

**Edit context** (S53) becomes a disclosure button on the Tailored-for bar. Clicking it expands a
panel *inside the bar*, on the current stage. Nothing navigates and `ns.stageKey` never changes.

The panel contains the same chip rows Setup builds — agency, discipline, career stage, work mode —
plus the competition text field, with **S55** as a single line above them. The button reads S53 when
collapsed and **S54** ("Hide context") when expanded; set `aria-expanded` to match.

Chip clicks inside the panel save and re-render, and the panel must still be open after that
re-render, with the scroll position unchanged. Store the open flag in memory rather than in the saved
draft — reopening the tool tomorrow should not reopen the panel. The scroll-preservation work is
B-3/B-14 and this panel depends on it: without it, every chip click in the panel throws the reader to
the top of the stage, which is exactly the complaint B-7 reported.

## C3 · The work-mode summary line (B-6)

Drop the `if (!(ns.lens.workMode || []).length)` wrapper at V4:748 entirely. The question is a
permanent part of the Contributions stage.

- **Nothing chosen** — the full question, S61 and S62, with all four chips.
- **One or more chosen** — the question collapses to a single line: **S63** ("How your work happens:")
  followed by the chosen labels joined with " · ", then the **S64** ("Change") control.
- **Change clicked** — the full question expands again in place, with the chosen chips active, so a
  second and third selection is one click away.

The collapse is presentation only. The reader can always get back with one click, and the state is
also editable from the Edit-context panel (C2), so there is no longer any single point of failure.

## C4 · Beat kickers on field labels (B-12)

Above every prompt label in the contribution card, a small kicker: uppercase or small-caps, letter
spaced, in the beat's own colour, carrying the job name from A1 verbatim (S71–S76). The kicker is
decorative repetition for a sighted reader and noise for a screen reader, so mark it
`aria-hidden="true"` and leave the prompt itself as the accessible label.

The same six words appear as the skeleton legend chips and inside the coverage row labels. If a name
changes, it changes in one constant and all three surfaces follow. The one-moment field (S104) gets a
plain label, not a kicker — it is deliberately not a seventh job.

## C5 · The read-back line with marked words (B-16)

Under the checks block, and **only when at least one flag has fired**, render a read-back line:
**S135** as a label, then a copy of the field's current text with each triggering word wrapped in a
`<mark>`. Do not show it when the field is clean, and do not show it while the field is empty.

It is a read-only mirror, not an editor: no cursor, no selection handles beyond normal text
selection, no click-to-jump. Rebuild it on the same input event that rebuilds the checks; debounce
both together at roughly 200ms so it does not flicker mid-word.

Marks must not rely on colour alone — a background tint plus an underline. Wrap whole words only,
matching on word boundaries, and cap the read-back at the first 400 characters with an ellipsis for
long fields.

## C6 · The Your-call row (B-21)

The row becomes: **S136** as a full-width label on its own line, then the three buttons below it,
each showing symbol plus word (**S137**). The buttons keep their V4 tooltips (S138) and keep their
toggle behaviour — clicking the active state clears it.

Each button needs `aria-pressed`, and the group needs `role="group"` with S136 as its accessible
name. Choosing ✗ or ? still reveals the note field (S139) below the row, and that field is what makes
the packet worth reading, so it should be visually attached to the row rather than floating under it.

## C7 · Coverage grouping and naming the failing contribution (B-34, H5)

The ten flat rows become four groups, each under a small header (**S168**), in stage order: Setup,
Contributions, Mentorship, Personal statement. Rows keep their tick and their status word (**S170**).

Any row whose condition is evaluated per contribution — "Every contribution has a role line" — must,
when it fails, name the offenders: append **S171** using the contribution's position and headline,
comma-separated if more than one, capped at three with " and 2 more". A row that passes appends
nothing.

Each named contribution should be clickable, taking the reader to the Contributions stage; if that is
more than a small change, plain text is acceptable for the beta, since naming it is the fix that was
asked for.

## C8 · Where the privacy line sits (B-38)

**S33** replaces the prototype banner as a persistent line in the shell, visible on every stage,
above the Steps sidebar and the stage content, at roughly 0.85rem in muted text with a small lock or
shield glyph. It does not scroll away with the stage and it is never dismissible.

Under about 480px it swaps to **S34**. It is a `<p>`, not a `role="status"` — it is a standing fact,
not an announcement, and it should not be read aloud on every re-render.

The reset control stays where it is. If the prototype banner survives the beta, the privacy line
still sits below it in the shell, not inside it — the banner disappears at port time and this line
must not disappear with it.

## C9 · Where the guide links sit (B-36)

One link per stage, at the end of the stage header block, under the lede: Setup, Structural read,
Contributions, Mentorship, Personal statement, Review — **S191, S58, S154, S164, S182** and a Setup
variant ("New to this format? Read the guide first"). One more in the shell, **S35**, next to the
privacy line.

All point at `index.html#learn-narrative-cv` with `target="_top"`, so the link works both standalone
and inside the app.js iframe embed. Style them as text links with a small outbound glyph, not as
buttons — they are an aside, not the next step.

Section-level anchors wait for the guide rewrite. The link text names a section of the guide, and
until anchors exist the reader lands at the top of that guide and scrolls; that is acceptable, but it
is the reason to add the anchors as soon as the rewrite lands.

## C10 · The Other free-text field (B-27)

"Other" is appended to `EVIDENCE_TYPES` (S109) and behaves like the other seven until it is chosen.
When it is chosen, a text input appears in the same row, below the select, with placeholder **S110**
and the small help line **S111**.

Store it as a separate key on the evidence item — `{ text, type: "Other", otherLabel }` — so
switching back to a listed type does not lose what they typed, and switching away hides the field
without clearing it. Everywhere the type is printed (the weave reference list, the draft export at
V4:1188 and the print view's evidence box) print `otherLabel` when it is non-empty, and fall back to
"Other" when it is not. Never print a bare "Other" if a label exists.

## C11 · The article on the anchor sentence (H2)

Computed at three sites — the anchor line, the .txt export and the print view — from the role string,
and a plain vowel test is not enough. It produces "a hour" and "an university", both of which appear
in the first sentence of the document.

Use a first-sound rule: default to "an" before a vowel letter, but force "a" for roles beginning
`uni`, `use`, `uti`, `eu`, `one`; force "an" for roles beginning `hon`, `hour`. Trim leading
whitespace first, and fall back to "a" for an empty role so the placeholder line still reads.

## C12 · The one-time suggestions note and how it is dismissed (B-17, B-20)

**S59** renders once, at the top of the Contributions stage, above the exemplar box, in the
funder-note style rather than the flag style — it is reassurance, not a warning. It carries a **S60**
("Got it") button on its right.

Dismissal writes a flag into the saved draft — `ns.ui = { checksNoteSeen: true }` — so it stays
dismissed across sessions on that browser, and comes back after a draft reset, which is correct: a
reset is a new person or a fresh start. Do not auto-dismiss it on scroll or on the first flag; the
whole point is that it is read before the first flag fires.

It appears only on Contributions. The Structural read stage runs the same checks and would need its
own copy of the note if that path is ever opened, but that path is deferred.

---

# D. Flags — where I would argue with a decision, and what is unresolved

Every one of these is specced above in its decided form. These are the notes, not changes.

**F1 · B-12, beat 5 · "What changed" loses the contrast with "What could change."** Specced as "What
already changed"; one-line fallback given in A1. This is the only place this spec deviates from the
decisions log.

**F2 · B-23/B-24, the gate · the "one moment" prompt is hidden from STEM, humanities and creative
researchers** unless they picked community-engaged or industry-partnered work. The gate is decided
and specced as decided, but a materials scientist whose sensor is in a bridge, or an artist whose
method a company licensed, has exactly the moment we are asking for and never sees the field. Cheapest
softener if you want one later: show it for every discipline once "What already changed" has text.

**F3 · B-19, field scope · the number question still fires on "What resulted."** Right for STEM,
awkward for a humanities record whose outputs are "a monograph and a scholarly edition". The question
form (S125) makes it survivable rather than coercive, so I would ship it and watch the next persona
run rather than narrow it further now.

**F4 · B-35 · the packet is still called an "advisor packet" everywhere,** which is itself a small
claim on an advisor's time. The copy is neutral now, but the name is the last piece of framing left
and it should be part of the advisor conversation, not settled by us.

**F5 · B-28 · open for Eli.** S143 asserts that naming trainees is standard, sourced to
`ncv-genre-sources.md` §1 — the asterisk convention for supervised trainees in citations. That
convention is about citations, and I have extended it to mentorship rows as "normally name where
people went". That extension is a reasonable reading, not a sourced rule. If Eli says otherwise, S143
is one string to swap.

**F6 · Out of scope, worth a ticket · the "3–5" in the Contributions heading understates the format,**
which allows up to ten and lets a cluster count as one. S56 and S57 fix it because the lede was being
rewritten anyway, but the pattern — our advice presented in the funder's voice — is worth a sweep of
its own.

**F7 · Out of scope, worth a ticket · the evidence placeholder invited a hyperlink** (V4:897,
"Citation, link, uptake, award…"). The Tri-agency CV must be self-contained and bans hyperlinks
except for demonstrating audio-visual creative outputs; the CV-FRQ permits them as bibliographic
references. S107 removes the invitation. A format-aware sentence in the evidence help would be better
still, and needs a decision about how much funder rule the tool should carry.

**F8 · Out of scope · the "new" badges** (`isNew`, on four prompts) mean "new since V3" and are
prototype chrome pointed at us. To a researcher, "new" on a question is either a feature
announcement or noise. Suggest dropping them with the same sweep that drops the prototype banner.

**F9 · Unresolved · B-4 "language:"** — nothing here addresses it, per the decisions log. If it meant
register, this spec is the answer. If it meant EN/FR, none of these 191 strings has a French
counterpart and that is a separate build.

**F10 · Unresolved · the guide's own wording.** `content/learn/narrative-cv-guide.md` still says
"Most Significant Contributions", "Personal Statement" and "Supervisory & Mentorship Activities" —
the funders' section names, which is right. The tool now says Stakes, Your role, What you did, What
resulted, What already changed and What could change, which are ours and appear nowhere in the guide.
The two are not in conflict, but the guide rewrite should introduce the six jobs by name so a reader
moving between the two documents recognises them.

**F11 · Alignment worth knowing about · three tool strings now run ahead of the guide.** S86 says no
agency requires first person, which is the fix `narrative-cv-guide-factual-review.md` proposes as
F-1 but which the live guide contradicts (`s4.expand-a.p1`, "it is the point"). S57 says a cluster
counts as one contribution and names the ten-contribution allowance, which is that review's F-7 and
F-6. S129, S162 and S174 tell researchers reviewers are told to disregard impact factor and h-index,
which is its F-8. All three are sourced in `ncv-genre-sources.md` §1, so the tool is correct and the
guide is the document that needs to catch up — but until it does, a researcher reading both will see
the tool say one thing about "I" and the guide say a stronger one.
