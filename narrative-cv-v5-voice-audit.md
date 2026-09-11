# Narrative CV V5 — voice audit

**File audited:** `narrative-cv-prototype-v5.html` (read-only; nothing applied here)
**Authority:** `.claude/skills/pathways-voice/` + `voice/construction-study.md`
**Test applied:** are we speaking to researchers *like collaborators* — a colleague who has read the
funder instructions closely, not an instructor grading them.
**Date:** 2026-09-11

**Scope:** every user-facing string in the file — shell, six stages, all `PROMPTS` questions, helps
and variants, `SEG_META`, `SHAPE_HINTS`, the three exemplar boxes, every `lintField` strength and
flag, evidence, weave, mentorship, personal statement, Review, the two exports, the print view, all
guide links, every `title` and `aria-label`.

**Reviewed:** ~290 strings. **Changed:** 33 rows (one of them, V19, is a nine-fragment mechanical
batch). Everything not listed below is clean and should be left exactly as it is.

This is a **register pass only**. No row changes what a string claims, what a prompt asks for or what
the tool says it does. Where a string looked factually or functionally wrong, it is listed at the
end under *Not a voice problem* instead of being fixed.

---

## Headline — the Setup heading

Prem named this one. `renderSetup`, line 1055, second argument to `stageHead`.

**Current:** `"How are you arriving?"`

It asks the researcher to account for themselves, in a writerly voice, before they have been told
what the tool is. The fork on screen is not about them — it is about whether they have a draft yet.

**Recommended replacement:** `"Start fresh, or bring a draft?"`

**Alternative A:** `"Do you already have a draft?"` — the researcher's own question, which is the
corpus's strongest heading move. Weaker here because the "no" branch is left unnamed.

**Alternative B:** `"Two ways in"` — plain, zero performance, and it is the phrase the V4 lede
already used. Weaker because it is not a question and names neither way.

**Why the recommendation:** it names both options, it asks about the work rather than the person, and
it still makes sense to someone who lands mid-page. The kicker above it already says "Setup", so the
heading does not have to carry orientation.

| id | location hint | current | replacement | why |
|---|---|---|---|---|
| V1 | `renderSetup` → `stageHead(c, "Setup", …)`, ~1055 | How are you arriving? | Start fresh, or bring a draft? | arch — asks them to account for themselves |

---

## 1 · Page shell

**No changes.** The title, banner, subtitle, both privacy lines, the save-warning and the shell guide
link are all clean. The privacy and no-AI lines are the tool's truthfulness claims — see *Leave
alone* below.

---

## 2 · Setup stage

| id | location hint | current | replacement | why |
|---|---|---|---|---|
| V2 | `renderLensFields` → `chipRow(parent, "Closest disciplinary home", …)`, ~764 | This changes the worked example and the shape hints you see. Pick the closest fit — it changes nothing you write. | This changes the worked example and the discipline notes you see. Pick the closest fit — it changes nothing you write. | jargon — "shape hints" is our internal name |
| V3 | `renderLensFields` → `progInput.placeholder`, ~772 | e.g. the specific chair, grant, or award | e.g. the specific chair, grant or award | mechanics — Oxford comma (V9) |
| V4 | `renderSetup` → `confirm.textContent`, xray branch, ~1076 | Structural read — selected. Set your context below, then you paste your draft. | Structural read — selected. Set your context below, then paste your draft. | wordy — narrates what they will do |
| V5 | `renderSetup` → `confirm.textContent`, compose branch, ~1078 | Start fresh — selected. Set your context below, then you go straight to writing your contributions. | Start fresh — selected. Set your context below, then go straight to your contributions. | wordy — same narration |

Clean and unchanged in this stage: the lede, both mode cards, the third confirmation line, the agency
and career-stage chip rows and their help, the competition label and help, the guide link.

---

## 3 · Structural read

| id | location hint | current | replacement | why |
|---|---|---|---|---|
| V6 | `renderXray` → `stageHead(c, "Structural read", …)`, ~1160 | Read your draft the way the genre does | What your draft already has, and what it doesn't | arch — genres do not read |
| V7 | `renderXray` → lede, "The tool segments it", ~1162 | Paste your existing draft. The tool segments it and runs the same deterministic checks paragraph by paragraph, then maps it against the structural moves developed narrative CVs make. It is a rough reading, not a judgment. Nothing you paste leaves this browser. | Paste your existing draft. The tool splits it into paragraphs, runs the same fixed-rule checks on each, then maps it against the moves a developed narrative CV makes. It is a rough reading, not a judgment. Nothing you paste leaves this browser. | jargon — "segments", "deterministic" are engineer words |
| V8 | `analyzeDraft` → `coverage`, ~1127 | Specific numbers, dates, or quantities present | Specific numbers, dates or quantities present | mechanics — Oxford comma |
| V9 | `analyzeDraft` → `coverage`, ~1133 | Mentee destinations named (where they went) | Where the people you trained went | jargon — "mentee" is admin language |
| V10 | `renderXray` → `"Paragraph by paragraph ("`, ~1197 | Paragraph by paragraph (hedge notes are informational here — hedging is right for impact claims, wrong for outcomes): | Paragraph by paragraph (the hedge notes here are notes, not flags — hedging belongs in what could change, not in what already did): | jargon — "informational"; uses field names |
| V11 | `renderXray` → `nextNote`, "rebuild the weakest", ~1220 | rebuild the weakest contribution in the Contributions step — the prompts there target exactly the moves this read found missing. Or export this analysis from the Review step and bring it to your advisor. | take any contribution you want to rework into the Contributions step — the prompts there ask for the moves this read looked for. Or export this read from the Review step and bring it to your advisor. | teacherly — the tool does not know which is weakest |

**V11 is assembled in code.** `nextNote` is built from a `<strong>` node holding `"Next: "` and a
text node holding the sentence. Only the text node changes; `"Next: "` stays as it is.

Clean and unchanged: the textarea label and placeholder, both buttons, the six other coverage rows,
the coverage header, `✓ detected` / `not detected`, the `Heading` / `Paragraph N` card labels,
`Nothing flagged here.`, `Check them in your own sentence:`, the guide link.

---

## 4 · Contributions

| id | location hint | current | replacement | why |
|---|---|---|---|---|
| V12 | `renderContributions` → lede tail, "scaffolding for thinking", ~1231 | The fields below are scaffolding for thinking; in the finished CV they disappear into one flowing paragraph, so read the example first and you will see what you are aiming at. | The fields below break the work into parts; in the finished CV they disappear into one flowing paragraph. The example shows what that looks like. | teacherly — instructs, then promises a reward |
| V13 | `renderContributions` → work-mode `chipRow` help, ~1258 | This sets which role and outcome prompts you see below. Pick more than one if more than one is true — most people are more than one. | This sets which role and outcome prompts you see below. Pick more than one if more than one is true. | cute — the trailing clause is a wink |
| V14 | `renderContributions` → shape-hint footer, ~1291 | This is flavour, not a checklist. Skip any job your record doesn't have — a contribution is not weaker for missing one. | These are examples, not a checklist. Skip any job your record doesn't have — a contribution is not weaker for missing one. | jargon — "flavour" is our word, not theirs |
| V15 | `SHAPE_HINTS.stem`, beat `impact`, ~229 | the practice, if it holds at scale | the practice across the sector, if it holds at scale | vague — "the practice" has no referent |
| V16 | `SHAPE_HINTS.creative`, beat `stakes`, ~256 | what the form, the site or the audience was not reaching | what the existing form, site or audience was leaving out | vague — forms do not reach |
| V17 | `PROMPTS.contrib.translational.help`, "the texture behind", ~639 | This is the texture behind What already changed, not a second version of it. Optional. | This is one concrete instance of What already changed, not a second version of it. Optional. | precious — "texture" |
| V18 | `renderWeave` → legend note, "on one surface", ~1463 | Your material on one surface, with suggested joins. This is not the finished paragraph — you still write that, in your own words. | Your material in one place, with suggested joins. This is not the finished paragraph — you still write that, in your own words. | jargon — "surface" is design-speak |
| V19 | `EXEMPLARS` — nine fictional sentences, lines 278, 281, 288, 289, 296, 297, 302, 305, 313 | see fragments below | delete the serial comma in each | mechanics — Oxford comma (V9) |

**V19 fragments** — delete only the comma before `and`; change nothing else:

- 278 `costly, slow, and intermittent` → `costly, slow and intermittent`
- 281 `benchmark dataset, and two methods papers` → `benchmark dataset and two methods papers`
- 288 `across four clinics, and measured uptake` → `across four clinics and measured uptake`
- 289 `for intake staff, and a peer-reviewed` → `for intake staff and a peer-reviewed`
- 296 `cohort methodology, and led the analysis` → `cohort methodology and led the analysis`
- 297 `two statistical agencies, and a book-length study` → `two statistical agencies and a book-length study`
- 302 `decaying, uncatalogued, and absent` → `decaying, uncatalogued and absent`
- 305 `a monograph, and a touring exhibition` → `a monograph and a touring exhibition`
- 313 `an audio walk, and a documentary record` → `an audio walk and a documentary record`

Clean and unchanged: the stage heading `Your strongest contributions`, the one-time checks note, the
work-mode summary and its Change/Done buttons, the exemplar box tag, title, source, guidance and
`Show/Hide the skeleton`, all six `SEG_META` job names, the other 28 `SHAPE_HINTS` phrases, the ten-
contribution ceiling note, `+ Add another contribution`, the card header, the remove tooltip, every
`PROMPTS.contrib` question and its variants, the evidence label, help, placeholders, type list and
add button, the assemble button, the connectives and all four gap warnings.

---

## 5 · Lint messages (`lintField` / `renderChecks`)

The hardest set, and where the grading voice concentrates.

| id | location hint | current | replacement | why |
|---|---|---|---|---|
| V20 | `lintField` → `out.strengths.push`, "the balance the format asks for", ~425 | Team voice and your own role, both visible — that is the balance the format asks for. | Team voice and your own role are both visible. | praising — marks homework |
| V21 | `lintField` → `out.strengths.push`, "role is marked", ~426 | Your own role is marked. | Your own role is named. | vague — "marked" is tool-speak |
| V22 | `lintField` → ownership `out.flags.push`, "is invisible", ~428 | …with no “I …” nearby — as written, which part was yours is invisible. | …with no “I …” nearby — nothing here says which part was yours. | wordy, slightly dramatic |
| V23 | `lintField` → hedge strength for `kind === "impact"`, ~485 | Hedged — exactly right here. What could change is the one place for it. | Hedged — this is the field where that belongs. | praising — "exactly right" is a grade |
| V24 | `lintField` → hedge flag, default branch, ~490 | — this field is for what happened. Move the maybes to What could change. | — this field is for what happened. What might follow goes under What could change. | cute — "the maybes" |

**V22 is assembled in code.** The full expression is
`"“we” or “our” appears " + weCount + (weCount === 1 ? " time" : " times") + " with no “I …” nearby — as written, which part was yours is invisible."`
Replace **only** the final literal: `" with no “I …” nearby — as written, which part was yours is invisible."`
becomes `" with no “I …” nearby — nothing here says which part was yours."` The count logic, the
singular/plural ternary and the curly quotes stay untouched.

**V24 is assembled in code.** The expression is
`hedges.map(h => "“" + h + "”").join(", ") + " — this field is for what happened. Move the maybes to What could change."`
Replace only the trailing literal, keeping the leading space and em dash:
`" — this field is for what happened. What might follow goes under What could change."`

**Deliberately unchanged in this engine** — these already hit the register and a "fix" would make
them worse:

- `"No numbers or dates in this one — is that right for this field?"` — states what is there and
  hands the decision back. This is the model the rest should match.
- `"“several” — how many?"` and `"“significant” — swap it for the specific thing you can name."`
- the prestige flag (`"…reviewers are told to disregard h-index, journal impact factor and venue
  prestige. Say what the work changed instead."`) — funder fact, correctly relayed, and V8 outranks
  style.
- `"“worked on” doesn't say what you did — name the specific action."`
- the generic hedge flag (`"right when you are saying what might follow, loose when you are saying
  what happened"`).
- the word-count meta line (`"N words · 40 to 80 is a comfortable range here."`) — a range, not a
  target, and it says so.
- the read-back label `"Check them in your own sentence:"`.
- the one-time note `"The checks under each field are suggestions… you know your record better than
  a word list does."`
- the "Your call" label, the three button words (`✓ Fine` / `✗ Needs work` / `? Ask advisor`) and
  both note placeholders.

---

## 6 · Mentorship

| id | location hint | current | replacement | why |
|---|---|---|---|---|
| V25 | `renderMentorship` → `stageHead(…, "Step · Supervisory and mentorship", …)`, ~1495 | What you made possible for others | Who you trained, and how you mentor | lofty — sentimental for an admin section |
| V26 | `PROMPTS.mentor.philosophy.help`, "Not a slogan", ~643 | Not a slogan — one practice you actually have. How you run a first meeting, how you decide authorship, how you hand a project over when someone is ready for it. | One practice you actually have, not a statement of principle. How you run a first meeting, how you decide authorship, how you hand a project over when someone is ready for it. | pre-emptive scold — opens by refusing them |
| V27 | `PROMPTS.mentor.crossStage.help`, "something in it", ~650 | One example with something in it — a grant you read, an introduction you made, a room you got someone into — says more than the list of who. | One concrete example — a grant you read, an introduction you made, a room you got someone into — says more than a list of names. | vague — "something in it", "the list of who" |

Clean and unchanged: the lede, the exemplar box (title, five legend labels, source, guidance, guide
link), the totals label and its four sub-labels, the mentee question and its help, all four row
placeholders, `+ Add a person`, the EDI question and help, the crossStage question, the next-button
label.

---

## 7 · Personal statement

| id | location hint | current | replacement | why |
|---|---|---|---|---|
| V28 | `renderPersonal` → `stageHead(…, "Step · Personal statement (written last)", …)`, ~1563 | Who you are & why your work matters | Who you are, and the thread through your work | lofty — plus a stray ampersand |
| V29 | `PROMPTS.ps.challenge.q`, ~598 | What is the one big problem your whole research program returns to? | What is the problem your whole research program keeps returning to? | vague — "big" inflates |
| V30 | `PROMPTS.ps.challenge.variants.creative`, ~602 | What inquiry drives your body of work? | What question does your body of work keep asking? | abstract — "inquiry drives" is stiff |
| V31 | `PROMPTS.ps.standing.variants.early`, ~612 | List your strongest signals so far — key papers, fellowships, awards, the scale of a dataset or collaboration. Early-career records still carry signal; name what you have. | List your strongest signals so far — key papers, fellowships, awards, the scale of a dataset or collaboration. Name what you have. | consoling — "still carry signal" pats them |

V28 matches the stage lede, which already says the prompts "ask you to name the thread running
through the contributions you have just written".

Clean and unchanged: the lede, the "Why last?" note, the exemplar box (title, seven legend labels,
source, guidance, guide link), the anchor label, help and three placeholders, the six `PS_KICKER`
labels, and the `streams`, `pivot`, `standing`, `programFit` and `horizon` questions and helps.

---

## 8 · Review, exports and print view

| id | location hint | current | replacement | why |
|---|---|---|---|---|
| V32 | `renderReview` → `row("Origin or pivot story written", …)`, ~1663 | Origin or pivot story written | How you got here — written | jargon — "story" is not the field's name |
| V33 | `openPrintView` → `"<b>Totals (last 5 years):</b>"`, ~1869 | Totals (last 5 years): | Totals (last five years): | mechanics — spell out zero–nine |

V32 aligns the row with `PS_KICKER.pivot`, which the researcher already saw on the field itself.
V33 also brings the print view into line with `buildExportText`, which already says "last five years".

Clean and unchanged: the Review heading `Is this ready to show someone?` (a real reader question —
keep it), the lede, the coverage header and its four section names, the other nine coverage rows and
the `— missing on …` assembly, `✓ done` / `not yet`, the open-flags box title, all five self-check
lines, the consult label, help and placeholder, the draft label and its note, all four export button
labels, every heading and section label in `buildExportText` and `buildAdvisorPacket`, and the rest
of the print view.

---

## Leave alone — strings that are right and would get worse if "fixed"

- **Privacy, no-AI, prototype and English-only claims.** `"No AI, and nothing you write leaves this
  browser…"`, the Setup lede's `"It is a prototype, and it works in English only for now. It runs
  without AI models — the checks are fixed rules…"`, `"Nothing you paste leaves this browser."`, and
  the advisor packet's `"(suggestions from the tool, not judgments)"`. These are the tool's
  truthfulness commitments. Do not compress, soften or make them friendlier.
- **The Setup lede as a whole.** It opens with the tool's intention, which is Prem's own instruction
  in the B-1 review note, and the corpus's canonical orientation shape is literally *"This page will
  help you…"*. Leave it.
- **`"What did you actually do?"`** (`PROMPTS.contrib.activities.q`). "Actually" reads as a
  colleague cutting to the point, not as a challenge. It is the most collaborator-sounding question
  in the tool.
- **`"you know your record better than a word list does"`** in the one-time checks note. It is the
  single line that hands authority back to the researcher, and it is the reason the rest of the lint
  engine is permitted to speak at all.
- **`"Show the skeleton"` / `"Hide the skeleton"`.** Describes exactly what the button does. Not on
  the banned-jargon list, and "structure" would be duller and less accurate.
- **`"No evidence attached — without it, this reads as a claim rather than a record."`** It describes
  what a reader sees, not what the writer did wrong.
- **`"Welcome back — you were on “Contributions”."`** Warm without being knowing.
- **The guide link texts**, all nine plus the shell's. `"If you don't supervise graduate students"`
  and `"Why it comes first and is written last"` are the reader's own situation and question — the
  corpus move we usually miss. Keep all of them.
- **`"Personal stmt"`** in the step list. Ugly abbreviation, but the sidebar slot is narrow; the full
  word is a layout question, not a voice one.

---

## Not a voice problem — for Prem, not for this pass

1. **`PROMPTS.ps.programFit.q` reads broken when nothing is set.** `interpolate` falls back to
   `"this competition"` and `"your agency"`, so an untouched Setup produces *"You're aiming at this
   competition (your agency). Why is this the right competition for where you are?"* — a sentence
   with a parenthetical saying nothing and "competition" twice. Needs a no-context variant, which is
   a logic change, not a wording one.
2. **`analyzeDraft` coverage row overstates its test.** `"Opens with “I am a …” anchor"` matches
   `/\bI am an?\b/` anywhere in the draft, not at the opening. The label claims more than the regex
   checks.
3. **`"Try with a sample draft"` overwrites whatever is already in the textarea**, with no warning
   and no undo. A researcher who has pasted a real draft can lose it in one click.
4. **Tooltip and label disagree on one control.** The button says `"✓ Fine"`; its `title` says
   `"Looks right"`. Harmless, but a screen-reader user hears a different word than a sighted one.
5. **Career-stage help asserts reviewer behaviour** — `"Reviewers are also told not to penalize a
   non-linear career"`. True as far as I know, but it is a claim about agency instructions and worth
   a check against the current Tri-agency CV and CV-FRQ guidance before a real researcher reads it.
6. **`isNew` flags are still set on five `PROMPTS` entries** but nothing renders them (F8). Dead
   data, not copy.

---

## Summary

| | |
|---|---|
| Strings reviewed | ~290 |
| Rows changed | 33 (V19 covers nine fragments) |
| Stage headings changed | four of six — Setup, Structural read, Mentorship, Personal statement |
| Lint messages changed | five of roughly 20 — two strengths, three flags |
| Mechanics (V9) | 12 — 11 Oxford commas, one numeral |
| Meaning changed | none |
