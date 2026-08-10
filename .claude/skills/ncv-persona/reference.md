# ncv-persona — reference

Mechanics for running a persona session against `narrative-cv-prototype-v4.html`.
SKILL.md has the protocol; this file has everything the protocol leans on.

## Environment

- Server: preview_start `{name: "pathways-review"}` → **port 8765** (defined in
  `.claude/launch.json`). Never use `pathways` (:8000) — that's the user's working server.
- URL: `http://localhost:8765/narrative-cv-prototype-v4.html`. Branch: `integration-prototype`.
- Per-run stamp: `git rev-parse --short HEAD`; require
  `git status --porcelain narrative-cv-prototype-v4.html` to be empty.
- The tool stores everything under localStorage key **`ncv-v4`**. Only ever remove that key
  (other prototypes share the origin). Note: the tool re-writes default state on first
  render (`renderStage` → `saveState`), so after a clean-slate reload the key EXISTS with
  `mode: ""` — "blank" means default-state content, not a missing key. Verify blankness by
  `mode === ""` + both mode cards unselected, not by key absence.

## Browser-pane quirks (verified 2026-07/08 — treat as environment limits, not defects)

- **Screenshots are unreliable when the page is scrolled** — verify via DOM text
  (`javascript_tool`) or `get_page_text`, screenshot only at scroll-top.
- **Smooth `scrollTo` is inert in the pane** — defect V4 #5 (scroll-to-top on re-render) is
  code-verified and will NOT reproduce visually here; don't re-litigate it.
- **Every chip/flag/nav/evidence/weave click triggers a full stage re-render** — all
  read_page refs go stale; re-read after every click. Focus is destroyed too (that IS
  defect #5/#11 territory — already known).
- `form_input`, or JS `el.value = v; el.dispatchEvent(new Event('input', {bubbles: true}))`,
  fires the same `input` handlers as typing — lint (`.v4-checks`) updates live. Keystroke-
  level behavior is **out of scope**; never claim per-keystroke findings.
- Native `confirm()` (the `#v4-reset` link) can hang the pane. Downloads create Blob
  downloads; "Open print view" uses `window.open` + `document.write` (popup); "Copy draft"
  uses `navigator.clipboard` (may silently no-op). All four are pane-untestable — noted
  here once, never re-reported per run.
- The tool's builder functions (`buildExportText`, `buildAdvisorPacket`) are IIFE-scoped —
  unreachable from the console. Capture surfaces are the readonly export textarea
  (`.v4-export-area`) and `localStorage`.

## V4 DOM map

Stages (sidebar `.narrative-stage-item`, label text): Setup · Structural read (only when
`mode === "xray"`) · Contributions · Mentorship · Personal stmt · Review.

- **Setup**: mode cards `.v4-mode-card` ("Start fresh" / "I already have a draft"); chip
  rows `.narrative-toggle-btn` (agency, discipline, career stage); program text input
  (placeholder "e.g. the specific chair, grant, or award"); nav `.btn-primary`.
- **Structural read**: textarea `.v4-xray-ta`; button "Run the structural read"; sample
  button "Try with a sample draft"; results `#v4-xray-results` — coverage rows
  `.completeness-row`, paragraph cards `.v4-para-card` (label `.v4-para-num`, text
  `.v4-para-text`, lint `.v4-checks`); "Next:" bridge note `.narrative-funder-note`.
- **Contributions**: work-mode chips appear just-in-time if unset; exemplar box
  `#v4-exemplar-box` with "Show the skeleton" toggle; per card — title input
  (`input.v4-text-input`), promptBlock textareas in order stakes / roleLine (after the role
  chips "I led it"/"I co-led it"/"I contributed a specific part") / activities / outputs /
  outcomes / impact / translational (gated: only for health|social discipline or
  community|industry work modes); each linted field has a sibling `.v4-checks`; flag row
  `.v4-flag-btn` (✓/✗/?) + note input `.v4-note-input input`; evidence rows `.v4-ev-row`
  (key badge, text input, type select, remove ×; **badges re-letter vs weave/export —
  defect #4**); "+ Add proof point"; weave toggle "▸ Assemble — see your material as one
  paragraph" (`.v4-weave-body`, connectives `.v4-connective`, gaps `.v4-gap`);
  `add-contribution-btn` silently no-ops at 10 (#15).
- **Mentorship**: totals grid `.v4-totals-grid input` (phd/masters/undergrad/postdoc);
  trajectory rows `.v4-traj-row` (who/stage/destination) + a separate "why" input after
  each row (placeholder "One line — why this trajectory matters"); three unlinted
  promptBlocks (philosophy, EDI, cross-stage).
- **Personal stmt**: anchor line `.v4-anchor-line` (3 inputs: role/institution/field); six
  promptBlock textareas (challenge, streams, pivot, standing, programFit, horizon) — **no
  lint, no flags anywhere on this stage (U1)**.
- **Review**: coverage `.completeness-row`; open-flags block; self-check checkboxes;
  consult-questions textarea (placeholder contains "strong enough to lead with"); readonly
  export `.v4-export-area`; action buttons (do not click).

## Capture snippets (javascript_tool)

```js
// draft text (Review stage)
document.querySelector('.v4-export-area').value
// full state
localStorage.getItem('ncv-v4')
// all live lint on current stage
[...document.querySelectorAll('.v4-checks')].map(n => n.innerText).filter(Boolean)
// structural-read results
document.querySelector('#v4-xray-results').innerText
```

Set-and-fire for text fields (equivalent to typing/pasting):

```js
const sv = (el, v) => { el.value = v; el.dispatchEvent(new Event('input', {bubbles: true})); };
```

## Known-defect index — classification baseline

Canonical source: `NCV_V4_ANALYSIS_2026-07-21.md` (§2 gaps U1–U8, §3 defects #1–#15).
One-liners for classification:

- **#1** "May" (month) flagged as hedging · **#2** spelled-out numbers invisible to
  specificity · **#3** PS & mentorship have no lint/flags · **#4** evidence key drift
  (UI badge vs weave/export) · **#5** re-render scrolls to top + destroys focus ·
  **#6** ownership verbs past-tense-only ("I supervise/I hold" unrecognized) ·
  **#7** storage failures silent · **#8** X-ray lints markdown/Word headers as paragraphs ·
  **#9** X-ray merges single-newline blocks · **#10** X-ray evidence detector misses named
  journals/"cited N times" · **#11** unlabeled inputs, sidebar not keyboard-accessible, no
  aria-pressed · **#12** roleLine specificity nag · **#13** evidence rows never linted ·
  **#14** exemplar superscripts attach to next sentence · **#15** silent caps/popups,
  "Opens with" overclaim.
- **U1** PS/mentorship outside the feedback system · **U2** scroll/focus loss · **U3** no
  cross-draft "what next" · **U4** no state export/portability · **U5** data-loss silence ·
  **U6** structural read is read-only (retype wall) · **U7** French unsupported &
  unannounced (verified 0/8) · **U8** no PS/mentorship exemplars.

**Classification rule:** every hiccup is exactly one of NEW / KNOWN (cite V4 #n or Un) /
REPEAT (cite first-sighting run + H#, from log.local.md's index). REPEATs get a tally line,
not a fresh writeup. Genre-rule gaps (things `ncv-genre-sources.md` says the tool should
catch but doesn't — e.g. JIF/h-index language, undefined acronyms) are NEW with type
`genre`.

## Persona realism rules

- Enter by `behavior.entryMode`; make the lens choices in `behavior.lens`; skip what
  `behavior.skips` lists; type what `seed` scripts, imperfections included.
- `behavior.lintReaction`: **defers** — accepts flags at face value, revises even on false
  positives (the wasted time is itself a finding); **selective** — fixes what makes sense,
  ignores the rest; **pushes-back** — leaves text as written, sets ✗/? flags with tart
  notes (exercises the advisor packet).
- `behavior.patience`: low ≈ abandons after ~3 unresolved frictions; med ≈ ~6; high ≈
  finishes regardless. **Abandonment is a valid run outcome** — grade what exists.
- `behavior.sessionPlan` caps which seed contributions get typed in full; abbreviate the
  rest (title + one field) and say so in the report.
- Planted traps (`behavior.plantedTraps`) are the comparability backbone: each has
  `expect` = the *correct* tool behavior (flag | clean | strength | detect). Report each as
  **caught** (tool did the right thing) / **missed** (should have reacted, didn't) /
  **false-positive** (reacted when it shouldn't). Traps must be typed verbatim where
  `where` says.
- **State injection is allowed only for re-entry/resume simulation** (write state, reload,
  observe the welcome-back banner / data survival) — never to skip the path under test.
- In-character narration in the report; out-of-character analysis only in the Hiccups and
  Rubric sections.

## Session report template

Path: `tests/ncv-personas/v4-sessions/<id>-<YYYY-MM-DD>.md` (+ sibling
`<id>-<YYYY-MM-DD>.state.json`).

```markdown
# NCV V4 persona run — <Name> (<id>)

| | |
|---|---|
| Date | YYYY-MM-DD |
| Prototype SHA | <short sha> (clean) |
| Entry path | xray | compose |
| Purpose | first run / re-run: <why> |
| Server | pathways-review :8765 |

## Walkthrough
Stage-by-stage, in persona voice. Short.

## Hiccups
### H1. NEW — <title> — `Severity / type`
What happened, expected vs actual, DOM evidence. Fix sketch (not applied).
### H2. KNOWN (V4 #n) — <one line + any new nuance>
### H3. REPEAT (first seen <id>-<date>, H#) — <one line>

## Rubric
- R1 reached export: y/n
- R2 draft substance: <n> contributions with stakes+outcomes (xray runs: structural-read
  completion if abandoned earlier)
- R3 confusion count: <n> (moments the persona didn't know what to do next)
- R4 friction tally: <new>/<known>/<repeat>
- R5 planted traps: <caught>/<missed>/<false-positive> (table)

| Trap | Where | Expected | Result |
|---|---|---|---|

- R6 verdict vs "a decent draft I can keep building on": yes / partial / no / abandoned —
  one paragraph in persona voice.

## Artifacts
Fenced draft export text · fenced structural-read results (xray runs) · state.json pointer.
```

## log.local.md format

Gitignored (exact path in `.gitignore`). Header explains purpose; then newest-first
`## YYYY-MM-DD` sections, one block per run:

```
- **<id>** | <sha> | <verdict> | <n> new / <m> known / <k> repeat | tests/ncv-personas/v4-sessions/<id>-<date>.md
```

Below the run entries, a maintained `## Cumulative hiccup index` — one line per unique
finding: `- <slug> — first seen <id>-<date> H<n> — <one-line>`. Future runs consult this
before labeling anything NEW.
