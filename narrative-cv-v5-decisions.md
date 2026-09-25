# Narrative CV V5 beta — decisions log

**What this is.** The record of every call made to build V5 beta from the review notes in
[narrative-cv-v5-brett-review.md](narrative-cv-v5-brett-review.md) without waiting for the second
pass. Each item says what was decided, whether it was **DECIDED** (the note was clear) or
**INFERRED** (the note was a fragment and this is the best reading), and how to override it.
Started 2026-09-05.

**Team for the run.** Fable directs, infers and decides (this file). Opus thinks through the
researcher — every copy string and the UX of each change — and the tricky engineering. Sonnet
applies to the file and checks it.

**Ground rules.**
- V5 is a fork: `narrative-cv-prototype-v5.html`, from V4 as of commit `8aebbb3`. V4 is untouched
  and stays the reference; `/ncv_tool_v4/` and the app.js iframe embed still point at V4.
- Storage key `ncv-v5`, so V4 and V5 drafts don't collide on the same browser.
- Not published, not embedded, not ported. `app.js`, `styles.css`, `data.js` untouched.
- All copy in the house voice (`pathways-voice` skill).
- Privacy gate before every commit: grep the file for the two real-CV surnames. Nothing from
  those CVs — names, institutions, projects, mentees, anecdotes — appears anywhere.
- Where Prem's second pass says something different, **Prem's instruction wins**; log the
  difference under *Overrides* below and rebuild that item only.

## Overrides (from Prem's second pass)

Walked item by item 2026-09-11; answers recorded in the `→ V5 instruction:` slots of
`narrative-cv-v5-brett-review.md` (and mirrored to the Anytype page). Everything not listed here
stands as decided.

| Item | Beta decision | Prem's instruction | Status |
|---|---|---|---|
| B-1 + B-4 | Setup lede = "what you'll walk away with" + privacy | **Amended** — lead with the tool's *intention* (get familiar with how the narrative CV asks you to think about and represent your work), say it is a **prototype**, **English only for now**, **no AI models**, data private, output is a **first outline**; keep the walk-away sentence after it | rebuild |
| B-5 | Keep the idea, rewrite the sentence | Confirmed; flagged for the voice pass | voice only |
| B-7 | Inline edit-in-place, side panel parked | **Amended** — inline confirmed, but the control must *look* like a control (proper button, not a quiet link) and be **relabelled** away from "Edit context"; not "preferences" — point back at "Tailored for:" | rebuild |
| B-10 | Prominent "Fictional example" tag | Confirmed | no change |
| B-12 | One six-job vocabulary | Confirmed | no change |
| B-16 | Read-back line under every flagged field | **Amended** — always in the Structural read; in Contributions **only when it adds information** (long field ~25+ words, or a repeated flagged word); **relabel** to state purpose not mechanism | rebuild |
| B-19 | Number check on What you did / What resulted / What already changed | **Amended** — **drop What resulted**. A list of things without numbers is a correct answer; flagging it was the last false positive. Principle: the check fires only where the prompt asked for a quantity | rebuild |
| B-23 / B-24 | Both prompts kept; gate dropped 2026-09-11 | Confirmed, gate stays dropped | no change |
| B-26 | Evidence help text rewritten | Confirmed | voice only |
| B-29 | Swap the one field, keep "trajectory" elsewhere | **Amended** — move the **whole Mentorship section** off "trajectory", export/packet label included | rebuild |
| B-30 / B-31 | Three questions; equity prompt names its subject | **Amended** — **drop the "Equity in practice —" label**, keep the concrete question; the abstract noun summons boilerplate. Goal is nuanced specifics, never canned EDI statements. Apply "ask for one specific instance, not a category" to all three, including Q3 | rebuild |
| B-37 | Folded into B-10/B-13 | **Extended** — **add worked examples to Personal statement and Mentorship** (closes U8), same treatment as the Contributions exemplar; **and link to the guide from every stage and every example box** | new build |

**Standing instruction from this pass:** a `pathways-voice` pass closes the round, over everything
changed today plus the B-5 and B-26 paragraphs.

---

## Decisions by item

Status: **build** = in the beta · **open** = built with a placeholder, still needs a human answer ·
**deferred** = not in the beta, reason given.

**B-1 · Intro sentence** — INFERRED — it's the Setup lede (V4 line 617), not the prototype
subtitle (which is chrome and disappears at port). Its job: say what they'll leave with, and that
nothing leaves their device. *build*

**B-2 · "Start fresh" feedback** — DECIDED — a selected card gets an unmistakable state (filled
header band, "Selected" mark), the other card dims, and a one-line confirmation under the grid
names the next step. *build*

**B-3 + B-14 · Scroll-to-top** — DECIDED — scroll to top only when the *stage* changes; every
in-stage re-render (chips, role buttons, add/remove) preserves scroll position. One root cause,
one fix. *build*

**B-4 · "language:"** — INFERRED — read as the *register* of the copy, which the voice pass
covers. If it meant EN/FR, that is a separate build. *deferred (FR) · open for Prem*

**B-5 · "that's the destination"** — INFERRED — keep the idea (read the finished example before the
fields), rewrite the sentence. *build*

**B-6 · Work mode vanishes** — DECIDED — the question stays on the Contributions stage
permanently; multi-select; once answered it collapses to a one-line summary with a *change*
control. (Same fix closes nadia's H1.) *build*

**B-7 · "Edit context" throws you to Setup** — DECIDED — inline: *Edit context* expands the chip
rows under the Tailored-for bar on the stage you are on; nothing navigates. The side-filter panel
idea is parked — it competes with the Steps sidebar for the same space. *build · alt deferred*

**B-8 · Show the skeleton** — keep as is. *no change*

**B-9 · Segment colours** — DECIDED — one step deeper on each of the six tints plus a 3px left
border in the beat's colour; body text must stay ≥ 4.5:1 on all six. *build*

**B-10 · Fictional** — DECIDED — prominence over word choice: a visible "Fictional example" tag on
the exemplar box instead of a trailing parenthetical. Word: *fictional* (Prem's). *build*

**B-11 · Social-science shape hint assumes policy** — DECIDED — rewritten so policy is one kind of
uptake among several; all five hints re-expressed on the same six beats (see B-12). *build*

**B-12 · Three vocabularies on one screen** — DECIDED — one vocabulary. The canonical six beats:
**Stakes · Your role · What you did · What resulted · What already changed · What could change.**
Field labels carry the name as a kicker; the skeleton legend uses the identical names; shape
hints become discipline flavour on those same six, not a competing four-step list. Beat 5 keeps
*already* (copy pass, F1): it is the one word separating it from *What could change*, and
demonstrated-vs-hypothesised is the genre's central distinction. Reader-facing word is **job**,
not *beat* — the tool already says "every sentence is doing a job". *build*

**B-13 · Cite the example** — DECIDED — one line under the exemplar: the *shape* follows the
Tri-agency CV and CV-FRQ instructions (link to the guide); the *content* is fictional. The real
CVs are never cited. *build*

**B-15 · Role line** — DECIDED — the question becomes the visible label (it was only a
placeholder). Two variants by work mode: team / community / industry → Prem's line, *"In one
line, what was your unique contribution within the team?"*; solo → *"In one line, what did you do
that wouldn't exist without you?"* *build*

**B-16 · Highlight trigger words** — DECIDED — option (c): a read-back line under the checks that
shows the field text with the triggering words marked, only when a flag fires. Textareas can't
render marks in place; the overlay and contenteditable routes are parked. *build*

**B-17 + B-20 · Suggestions, not gates** — DECIDED — drop the visible rubric score and
"uncalibrated"; the meta line becomes a word count plus one plain sentence; a one-time note at the
top of Contributions says the checks are suggestions and nothing blocks you. *build*

**B-18 · "our" flagged with "I" present** — DECIDED — accept any `I` + verb-like word (the list ∪
regular *-ed* forms ∪ common irregular pasts) within three words, and `my <noun>`, as ownership.
Prefer under-flagging: a missed vague sentence costs less than nagging a clear one. *build*

**B-19 · "No numbers" flag** — DECIDED — field-aware: fires only on *What you did*, *What
resulted*, *What changed*; never on stakes, the role line, impact, personal statement or
mentorship. Phrased as a question; no "reviewers". (Closes nadia's H11.) *build*

**B-21 · "Your call:"** — DECIDED — the label states what the row is for; buttons show symbol +
word (✓ Fine · ✗ Needs work · ? Ask advisor); tooltips stay. *build*

**B-22 · "Academic impact counts" badge** — DECIDED — remove the badge; keep the reassurance as a
plain sentence in the help text. *build*

**B-23 + B-24 · Translational vs Outcomes** — DECIDED — keep both and keep the gate. *What changed*
stays the general uptake; the translational prompt becomes explicitly *one moment* (a single
scene, two sentences). The copy makes the split obvious. *build*

**B-25 · Proof points** — DECIDED — "Evidence" everywhere. *build*

**B-26 · "description is bad"** — INFERRED — it's the evidence help text (V4 line 390). Rewritten:
what to type first, how the tool uses it second. *build*

**B-27 · No "Other"** — DECIDED — add *Other* plus a short free-text label that appears when it's
chosen; the export prints the typed label. *build*

**B-28 · Mentee names** — RESOLVED from `ncv-genre-sources.md` §1: the formats *expect* names — an
asterisk after each supervised HQP's name in citations, and mentorship paragraphs name
destinations. The tool now says naming is standard and initials are fine if they prefer. Stays on
Eli's list only to confirm there's no privacy constraint we've missed. *build · open for Eli*

**B-29 · Trajectory → example** — DECIDED — change the placeholder as asked; "trajectory" stays in
the section lede because it's the genre's own word. *build*

**B-30 + B-31 · Mentorship prompts** — DECIDED — all three become questions; the equity prompt
names its subject; its help text says why it asks for something structural rather than a
statement. *build*

**B-32 · PS lede** — DECIDED — rewrite; "two questions do most of the work" goes; the lede says the
prompts are a synthesis of what they just wrote. *build*

**B-33 · "Pull it together"** — DECIDED — new heading and lede; no "dramatically more productive".
*build*

**B-34 · "(PS)"** — DECIDED — expanded; coverage rows grouped under section headers; a failing
contribution row names *which* contribution (closes nadia's H5). *build*

**B-35 · Advisor-packet framing** — PARTIAL — the claim is removed now (neutral: a packet you can
bring to an advisor). Whether the packet should set a consult's agenda is the advisor
conversation; unchanged until then. *build copy · open*

**B-36 · Links to the guide** — DECIDED — one link per stage to the guide at
`index.html#learn-narrative-cv` with `target="_top"` (works standalone and inside the iframe
embed), plus one in the shell. Section-level anchors wait for the guide rewrite to land. *build*

**B-37 · "look at examples in our tool"** — INFERRED — folded into B-10/B-13 (audit the exemplars,
label and source them). *closed · open for Prem*

**B-38 · Not AI, confidential** — DECIDED — one plain-language line, persistent in the shell,
replacing the dev-speak banner: no AI, nothing leaves the browser, drafts stay on this device.
*build*

## Copy pass — outcomes (Opus, 2026-09-05)

Spec: [narrative-cv-v5-copy-spec.md](narrative-cv-v5-copy-spec.md) — 191 strings (S1–S191), 12 UX
behaviours (C1–C12), 11 flags (F1–F11). Calls made on the flags:

| Flag | What it says | Call |
|---|---|---|
| F1 | Beat 5 should stay "What already changed" | **Accepted** — see B-12. |
| F2 | The translational "one moment" prompt is gated away from STEM, humanities and creative researchers who often have exactly that moment | **Gate kept for the beta** (as decided). First override to consider in the second pass: drop the gate, keep the prompt optional. |
| F3 | The number question still fires on *What resulted*, awkward for monograph-and-edition records | Ship as a question; watch the next persona run. |
| F4 | "Advisor packet" is itself a small claim on an advisor's time | Logged under B-35 — part of the advisor conversation. |
| F5 | B-28 wording extends the citation asterisk convention to mentorship rows | Accepted for the beta; one string (S143) to swap if Eli says otherwise. |
| F6 | "Your 3–5 strongest contributions" understates a format that allows ten and lets a cluster count as one | **Fixed** in S56/S57 with the lede rewrite. |
| F7 | The evidence placeholder invited a hyperlink; the Tri-agency CV bans them | **Applied** in the merge — "link" dropped from the placeholder. |
| F8 | The "new" badges are prototype chrome aimed at us | **Applied** in the merge — badges no longer rendered. |
| F9 | B-4 "language:" untouched; no string has a French counterpart | Stays open for Prem (see B-4). |
| F10 | The guide uses the funders' section names; the tool now uses the six jobs | Both are right at their level; the guide should say once that the six jobs are *inside* each section. Guide-track item. |
| F11 | Three tool strings run ahead of the live guide — no agency requires first person (S86), a cluster can be one contribution (S57), impact factor and h-index are disregarded (H3) — all three are exactly F-1, F-6/F-7 and F-8 in `narrative-cv-guide-factual-review.md` | Tool is correct; the guide is what needs to catch up. Guide-track item. |

## Also in the beta — from nadia's persona run (cheap, adjacent)

- **H2** — "I am a assistant professor": *a/an* by the next word's first sound.
- **H3** — JIF / impact factor / h-index / "top-tier" are flagged, with the reason (reviewer
  guidelines say to disregard them), instead of being rewarded as specificity.
- **H4** — a numbered heading's digit isn't counted as a specific number.
- **H7** — "May" the month is not a hedge.
- **H8** — spelled-out numbers count (one…twenty, dozen, hundred, thousand).
- **H12** — light checks on personal statement and mentorship fields ("prose" kind: ownership,
  vague words, weak verbs only; no number nag).
- **H15** — "TCV" and "CV-FRQ" expanded once, in Setup, where the agency is chosen.

## Deferred — not in the beta, with the reason

| What | Why not now |
|---|---|
| The **Structural read** path | Never reviewed by anyone; only shared copy changes touch it. Needs its own session. |
| Side-filter panel for context (B-7 alternative) | Design work; competes with the Steps sidebar. |
| Bilingual / FR (if B-4 meant that) | Separate build. |
| Passive-voice detector (nadia H6) | False-positive risk; needs a calibration set first. |
| Retype wall between Structural read and Contributions (H13) | Real design work, not a copy fix. |
| Port to `app.js`; publish at `/ncv_tool_v5/` | Prem's call, after the second pass. |
| Calibration study · reviewer-rubric mapping · CCV import | Unchanged from the V4 pending list. |

## How to continue

1. Prem's second pass fills `→ V5 instruction:` under each item in the review doc (repo copy or the
   Anytype page — they're the same text). Where an instruction differs from a decision above, list
   it under **Overrides** and rebuild that item only.
2. Re-run persona QA against V5 (`/ncv-persona next` — aisha is next; a nadia re-run confirms
   H1/H2/H3/H11 are closed).
3. Only then: decide publishing (`/ncv_tool_v5/`) and the port.

## Run log

- **2026-09-05 · beta run 1 — done.** Fork → this log → Opus copy/UX spec (191 strings, 12 UX
  notes, 11 flags) → Sonnet engineering pass (27 items, 29 copy slots) → Sonnet merge (191/191
  placed, 0 slots left, banned-word audit clean) → three fixes by hand (stale "V4" labels, instant
  scroll on stage change instead of smooth, context panel closes on stage change) → browser check
  on the review server → privacy grep clean → commit.
  **Verified in the browser:** mode-card selected state + confirmation line (B-2); chip clicks keep
  scroll, stage changes go to top (B-3/B-14); work-mode row collapses to a summary and the role
  label switches to the team wording (B-6, B-15); Edit context opens inline, keeps scroll, closes
  on stage change (B-7); Fictional-example tag + source line (B-10, B-13); six job kickers (B-12);
  ownership rule accepts "I wrote … our team" (B-18); "JIF" and "high-impact" flagged with the
  reviewer-guideline reason (H3); read-back marks the exact words (B-16); no number nag on Stakes
  (B-19); Your-call row with worded buttons (B-21); Other type shows its free-text field (B-27);
  prose checks on Mentorship and Personal statement (H12); "an assistant professor" (H2); Review
  heading, neutral advisor wording, grouped coverage naming the failing contribution, "(PS)" gone
  (B-33, B-34, B-35); Structural read still works with the shared checks; no console errors.
  **Not verified by eye:** colour and spacing — the browser pane was hidden, so screenshots failed;
  worth a look on a real screen.
  **Next:** Prem's second pass → Overrides → rebuild diffs → `/ncv-persona next` against V5.
- **2026-09-05 · persona re-run — nadia on V5 beta.** Report:
  `tests/ncv-personas/v5-sessions/nadia-2026-09-05.md`. Traps 5 caught / 5 missed / **0
  false-positive** (V4: 4/4/3). Ten V4-era findings closed. **One regression to fix before the
  second pass lands:** B-18's `my <noun>` marker hides *we/our* beside "My research…" — restrict
  `my` to people/role nouns (H1 in the report). Also worth folding in: work-mode row collapses
  after one pick (H2), no read-back marks in the Structural read (H3), "✓ done — missing on 3"
  wording (H4), prestige numbers still counted (H5).
- **2026-09-11 · fix round (pre-researcher) — done.** Everything actionable from the user tests,
  before the tool goes to a real researcher. Opus took detection, Sonnet took UI, Fable verified in
  the browser against nadia's probe strings. Fixed: H1 (`my` restricted to people/role nouns — the
  regression), H2 (work-mode row collapses only on *Done*), H3 (read-back marks in the Structural
  read), H4 (coverage rows name missing contributions only when unmet), H5 (prestige flag names
  every term, catches "IF 14.2", excludes metric numbers from the count), V4 #8/#9 (pasted bold and
  enumerated headings become unlinted Heading cards; heading+body blocks split), #10 ("cited N
  times"/doi/vol. detected), #14 (exemplar keys attach to their own sentence), #15 (ten-contribution
  cap says so), #7 (storage-failure warning), #11 (keyboard sidebar, aria-current, aria-labels).
  **Two decision amendments, revert if you disagree:** B-18 amended — `my` counts only with a
  people/role noun; B-23/B-24 amended — the gate on *One moment* is dropped (copy-pass F2's
  recommended override, taken under Prem's 2026-09-11 "fix from all findings" instruction), so every
  discipline sees it. Still open by design: passive-voice detection (needs a calibration set), the
  Structural-read retype wall (U6), evidence-row lint (#13), advisor-packet naming (B-35, advisors),
  mentee-naming confirmation (B-28, Eli), the bare `journal` match in the evidence coverage row
  (kept — removing it would un-detect legitimate drafts).
- **2026-09-11 · second pass, built.** Prem walked the 13 inferred/design items one by one; answers
  are in the review doc's instruction slots and summarised in the **Overrides** table above. Opus
  wrote the new content and copy as `narrative-cv-v5-secondpass-spec.md` (S192–S241, authored under
  the `pathways-voice` skill — that is the voice pass for this round); Sonnet built it; Fable
  verified in the browser. Shipped: new intro, PS + Mentorship worked examples (U8 closed), guide
  links everywhere, conditional read-back, number check off *What resulted*, Mentorship off
  "trajectory", equity question de-labelled, edit-context button restyled. Confirmed no-change:
  B-10, B-12, B-23/24. **Open follow-ups:** the two new examples are social-sciences only (the
  Contributions one switches by discipline) — decide after the researcher session whether they need
  per-discipline variants; guide links all land on the page, not section anchors, until the guide
  rewrite lands.
- **2026-09-11 · full voice pass, built.** Prem's test: "speak to researchers like collaborators"; his
  trigger was the Setup heading "How are you arriving?" (patronizing). Opus audited ~290 strings
  under `pathways-voice` → `narrative-cv-v5-voice-audit.md` (33 changed, V1–V33); Sonnet applied.
  Headline: Setup heading is now **"Start fresh, or bring a draft?"**; three more stage headings
  were arch and are plain now (Structural read, Mentorship, Personal statement); the lint
  *strengths* were grading homework ("that is the balance the format asks for") and now state what
  is there; internal words that leaked to readers (segments, flavour, shape hints, deterministic,
  mentee) are gone; serial commas out of the example prose. Three non-voice catches fixed in the
  same build: program-fit question has a fallback when no competition is set; "Try with a sample
  draft" can't overwrite a pasted draft; career-stage help no longer attributes a rule to reviewers
  (the only reviewer-instruction claim in the tool remains the sourced impact-factor/h-index one).
  Left alone on purpose: the privacy/prototype/no-AI lines (truth claims, not copy), the B-1 lede
  (Prem-specified), and the guide-link texts.
- **2026-09-11 · dynamic worked example on Contributions — built.** Prem's instruction: the fictional
  example card should change with the work-mode chips (and combinations), and with the discipline and
  career stage from Setup; write STEM, humanities and health at least in a team-based and a
  solo/community variant; keep the badge and the red heading; research it so every selection gets a
  specific example. Built as a full library: **5 disciplines × 4 work modes × 3 career stages = 60
  cells**, each a different invented researcher and project (`EXEMPLAR_LIBRARY`, between the
  `EXEMPLAR_LIBRARY:begin/end` markers). Fable directed and wrote the brief; five Opus writers took one
  discipline each; every sentence was run through the tool's own `lintField` (ownership, numbers,
  vague words, hedges, prestige terms) plus Canadian Press spelling and Oxford-comma checks, so no
  example contradicts the check under a field. Review surface for Prem:
  `narrative-cv-v5-examples-review.md` (all 60, with an Overrides table at the top); regenerate it, and re-run the
  checks after any edit, with `node scripts/ncv-v5-examples.js review` / `lint` (reads the HTML only).
  Research behind the brief: the Tri-agency CV's own contribution categories and reviewer
  indicators (ncv-genre-sources.md), the Concordia workshop deck ("who benefited and how"; credit
  collaborators and trainees), the Glasgow/Aberdeen pilot prose examples (first person, active
  verbs, role clear in collaborations, everything evidenced), U Winnipeg's category list, the RMIT
  guide to evidence for creative-practice outputs, a published arts-and-humanities narrative CV
  example. Inferences to override:
  - INFERRED — matrix size: full 60 rather than the six Prem named. Reason: stage-proportionate
    claims are the thing early-career readers most need to see, and the reviewer guidelines read a
    record relative to career stage. If 60 is too many to keep, drop the stage axis to two levels
    (early / established) and 20 cells remain.
  - INFERRED — default cell before a question is answered: the discipline's usual mode (STEM and
    health: team-based; social sciences, humanities, creative: largely solo); mid career.
  - INFERRED — combinations: a cell scores the modes it shares with the answers minus the tags it
    carries that were not picked; ties go to the more specific mode (community, industry, team,
    solo). Some cells carry two tags on purpose (an engineering industry partnership is team work; a
    community-engaged health project is a team), so the common pairs get an exact match.
  - INFERRED — a one-line "This example: Health / clinical · Community-engaged and team-based · Early
    career." under the heading, so the swap is legible; it adds one sentence pointing at the
    unanswered question when work mode or stage is not set. Heading unchanged in form (discipline
    only); badge unchanged.
  - DECIDED — the five approved examples are retained as cells (stem/team/mid, health/community/mid,
    social/solo/mid, humanities/community/mid, creative/community/mid) with two edits: Canadian
    spelling (digitization, organizations, program) per the voice skill's V9, and "us/we" taken out
    of two impact sentences because the tool's own ownership check flagged them.
  - Not done, on purpose: the Personal statement and Mentorship examples stay social-sciences only
    (the open follow-up from the second pass). Same treatment is possible with the same generator.
  - Noted for Prem, not a defect: the new cells run 120–158 words against the approved five at 99–130, so
    the card is a little denser; five community cells (one per discipline) are Indigenous-led
    partnerships written with the organization setting the questions and holding the record — worth
    a read by someone with that lived expertise before the tool goes wide.
  **Verified in the browser:** the card swaps on discipline chips (Tailored for → Change these answers),
  on the work-mode chips (Change → chip → Done) and on career stage, without a reload and with the
  scroll position kept; the match line names what is shown; no console errors; `lint` clean on all 60.

- **2026-09-12 · register pass on the example library and the tool copy — built.** Prem's review of
  the 60 cells: "review the language so it's more like an academic … weird glitches … like arriving,
  the negative statements, this is, it's not". Measured before rewriting: 56 of 60 cells carried at
  least one of the patterns; the tool copy carried 20 "X, not Y" contrasts, 13 nobody/never/nothing,
  6 "this is", 5 "actually". **The rule, now standing for all NCV prose:** declarative and specific;
  state a gap as a gap ("has received little study", "limits comparability"); no contrastive framing
  (*rather than, instead of, not X but Y, X, not Y*); no dramatized absence (*nobody, never, goes
  unrecorded, stays invisible*); no personification (*records arrive, data sit, hands that week*); no
  emphatic *actually*; no aphoristic closers (*who counts as, who gets to, on their own terms*); no
  gerund-led impact sentences; no colon reveals; a plain negative at most once per paragraph. Built
  by five Opus rewriters (one discipline each, facts and numbers frozen) against a detector plus the
  tool's own checks; Fable varied the impact openings afterwards ("If …" had become the new
  template: now 18 of 60) and cleaned the topic lines; Fable rewrote 47 copy strings and the Personal
  statement and Mentorship examples by hand. The retained five approved examples were included on
  the same terms (four changed; the bridges one already passed). Result: 4 of 60 cells carry a single
  plain negative, all permitted; `node scripts/ncv-v5-examples.js register` re-checks the rule and
  `lint` the tool's checks. Copy left as it was on purpose: the privacy and prototype truth claims
  ("nothing you write leaves this browser"), two-part questions ("Who used it, and what shifted"),
  the Structural read heading, and "This cannot be undone" on the clear-draft confirm.
  **Verified in the browser:** the card renders the rewritten cells, discipline/stage/mode swaps
  still work, no console errors. Follow-up worth considering: the same rule as a tenth check in the
  `pathways-voice` skill.
- **2026-09-12 · privacy and reassurance lines, positive voice — built.** Prem's example for the
  register: "anything you write is your own, it does not get stored elsewhere, it stays here." The
  lines I had left as truth claims are now in that voice: the banner ("No AI. Anything you write is
  your own: it stays here, on this device, and is not stored anywhere else. Clearing your browser
  data clears the draft too." / short: "Anything you write stays here."), the Setup lede's privacy
  sentence, the Structural read lede ("Anything you paste stays here, with the rest of your draft."),
  the save warning, the checks note ("They leave you free to continue, carry no score and stay here
  with your draft.") and the discipline help ("your draft stays as it is"). Verified in the browser.
- **2026-09-25 · guide sync + session feedback — built.** Prem: the NCV guide review copy
  (`ncv-guide-review/`) is the source of truth; bring the tool's language and any affected
  functionality into line with it before the tool goes to a researcher, and add a way to gather
  feedback at the end of a session. Revert point: tag `ncv-v5-pre-guide-sync-2026-09-25`.
  **Guide → tool (each tied to its guide item):**
  - DECIDED — P-16/F-20: one **FRQ** chip (FRQNT, FRQSC, FRQS removed); saved drafts with the old
    codes are mapped to `frq`. Chip order follows the guide: SSHRC, NSERC, CIHR, FRQ, Other.
  - DECIDED — P-9/P-41: official section names, format-aware, in stage kickers, the sidebar,
    Review coverage, the .txt export and the print view. CV-FRQ exports carry the French template
    names beside the English ones.
  - INFERRED — CV-FRQ section 3 is "Supervisory and **mentoring** activities" (the FRQ's own English
    name, verified 2026-09-21 in the review log §4.1); the guide's generic card says "mentorship".
  - DECIDED — P-48: the first section's focus differs. TCV: expertise relative to this opportunity
    (Program-fit help says so). CV-FRQ: also fit with the program's objectives and how your work
    complements the team, so a **new CV-FRQ-only prompt**, "How does your work complement the rest of
    the team on this application?", with its own coverage row and export line.
  - DECIDED — P-10/P-11/F-6/F-16: Contributions lede now says up to 10 contributions **or
    experiences** that relate to your application, chosen for this opportunity, a collection of
    related work can be one, a short well-explained list is stronger. **"Three to five is a good
    target" removed**: the guide sets no target and the agencies state no minimum.
  - DECIDED — P-28/P-18: role-line help uses the guide's first-person wording ("leave the
    grammatical person open … Concordia recommends the first person"); the ownership flag ends with
    the guide's line "If every sentence says 'we', reviewers cannot tell what you did."
  - DECIDED — P-12: the prestige flag is split. Journal metrics: "reviewers of Tri-agency
    applications are asked to disregard the JIF and other journal-based metrics". h-index: DORA
    treats it as unreliable; a single-article citation count can support the account. The old line
    said reviewers are told to disregard the h-index, which the guide does not say. Standing help
    updated to match.
  - DECIDED — P-17/P-31: **link check by format**. TCV: a link in any field is flagged; an evidence
    row with a link gets a note (creative discipline: the audio/visual exception is named). CV-FRQ:
    a link in a sentence is asked to move to the evidence list; a link in an evidence row is fine.
    The engine takes the format through a third `ctx` argument, so the examples checker still runs it
    standalone.
  - DECIDED — P-8/P-30/P-32/P-44 to P-49: a **format box** (Setup, compact, once an agency is chosen;
    Review, full): "You must use the agency's template", do not exceed 5 pages in English / 6 in
    French (FRQ especially strict), the agency's font rule word for word, links, language (CV-FRQ
    asterisk included), section names, condensed fonts, file-size limits, "the instructions for your
    funding opportunity take precedence". The .txt export and advisor packet open with a one-line
    reminder of the template and page limit.
  - DECIDED — P-45/P-46: the **print view** is set in the agency's font at 12 points (SSHRC Arial;
    NSERC, CIHR, FRQ and Other Times New Roman), references included, Letter with 2 cm margins,
    with an on-screen note (not printed) that it is not the template.
  - INFERRED — a **rough length line** on Review: words in the draft ÷ 500–600 words a page, against
    the 5-page English limit, marked when over. The per-page figure is our estimate, stated as rough.
  - DECIDED — P-13: Setup lede adds "A full first draft can take a day or more, so allow time before
    your deadline." P-14: Review ends with the guide's contact line (impact@concordia.ca).
  - DECIDED — Mentorship: guide's early-career advice shown when career stage is Early; supervision
    labels follow P-25 (Doctoral, Master's, Postdoctoral, Undergraduate research).
  - DECIDED — Review self-check rebuilt on the guide's four qualities (Ownership, Specificity,
    Significance, Coherence) plus Selection, Mentorship and Format; keyed by name, not position.
  - DECIDED — Impact help's unsourced "on the reviewers' own list" sentence replaced with the guide's
    academic-impact wording.
  - INFERRED — **passive check** (closes part of the "passive voice, open by design" item): P-37
    now cites Fasoli et al. 2025 (reviewers rated CVs higher with less passivity). An agentless
    passive ("was developed", not "was funded by …") is flagged only in the role line, *What you did*
    and Structural-read paragraphs, and only when nothing in the field names you and no "we" flag
    already fires. All 60 examples still pass `lint` and `register`.
  - INFERRED — **guide links** now open the corrected review copy in a new tab, at the matching
    section (#why, #three, #compare, #difference, #reviewers). The SPA's `#learn-narrative-cv` page
    still carries the original text (3–10 contributions, FRQ sectors, Wellcome) and the AEM page is
    not live yet (404 today). Switch `GUIDE_URL` to the AEM address when it launches. Caveat: the
    review copy shows the staff comment tools.
  **Feedback (new):**
  - INFERRED — a **Note for the team** button in the banner, on every step: a short note saved with
    the step it was written on, kept on the device.
  - INFERRED — a last step, **Feedback**: three chip questions (usefulness 1–5, what they left with,
    would they use it), which parts helped / got in the way, whether the worked example fit, whether
    the checks were right, four open questions (where stuck, anything that differs from their
    agency's rules, the one change, anything else), optional name. Every question optional.
  - INFERRED — an opt-out **session summary**, shown in full before sending: steps visited and active
    minutes, contributions started, checks showing by type, own ✗/? marks, which example cell was
    shown, prompts answered, exports used, word count, screen and browser. Counts and choices only:
    no draft text, and the competition only as named yes/no. **The draft itself is never sent.**
  - INFERRED — transport: the same public, append-only `review_comment` action the guide review page
    already uses, with `page = ncv-tool-v5`, so it works today with no Apps Script redeploy. Rows land
    in the **Guide review** tab (the guide page filters them out by page). Columns: `text` = answers,
    `quote` = notes, `prefix` = summary, `suffix` = tool version, `section` = agency · discipline ·
    stage. Read them with `<exec URL>?action=review_list&page=ncv-tool-v5`. Fallbacks: download
    (.txt), copy, and email to impact@concordia.ca. Anyone with the exec URL can read these rows,
    which is why no email address or draft text is collected. A dedicated tab behind its own action
    is the cleaner long-term home.
  - INFERRED — Review shows a "Before you go" nudge to the Feedback step until feedback is sent; the
    privacy line in the banner now says the Feedback step sends only what is written there.
  **Verified in the browser (review server :8765):** FRQ chip and migration; CV-FRQ sidebar label,
  kickers, lede, team prompt, coverage row, export headings with French names; SSHRC format box and
  Arial print view; FRQ Times New Roman print view; TCV link flag in a field and on an evidence row;
  CV-FRQ link flag in a field only; passive flag; early-career mentorship note; Review length line,
  self-check, contact line, nudge; note panel save/count (desktop and 375 px); Feedback send with a
  mocked network (payload shape checked, nothing sent to the sheet) and the failure message; Reset
  clears notes. One bug found and fixed on the way: a shared global regex let the evidence-row
  check skip the next field's link. No console errors; no horizontal scroll at 375 px.
  **Not verified:** a real POST to the sheet from this page (the guide review page uses the same
  call in production).
