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

*None yet — fill in when the updated notes come back.*

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
