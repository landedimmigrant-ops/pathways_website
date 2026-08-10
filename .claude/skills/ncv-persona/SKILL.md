---
name: ncv-persona
description: Persona-driven QA loop for the Narrative-CV V4 prototype. Each invocation plays ONE researcher persona through narrative-cv-prototype-v4.html in the browser pane — really typing and clicking — aiming to end with a decent draft, logging every hiccup. Log-only, never fixes bugs. Use when the user types /ncv-persona <id|next|list>, says "run a persona", "persona-test the NCV tool", or asks to play a researcher through the V4 prototype.
---

# ncv-persona — play a researcher through the V4 tool

One invocation = one persona = one session report. The goal of every run, in the persona's
own terms: **end with a decent draft they could keep building on** — and log every hiccup
(friction, confusion, blocker, lint false positive, dead end) hit on the way there.
Personas live in `tests/ncv-personas/personas-v4.json`; reports land in
`tests/ncv-personas/v4-sessions/`.

## Hard rules

- **Log-only.** Never edit `narrative-cv-prototype-v4.html` or any product file. Fixes are
  batched later from the reports. A mid-run "just fix it" impulse becomes a fix-sketch in
  the report instead.
- **One persona per invocation.** Never spill a persona across invocations; if the run must
  truncate (~90 interaction turns), wrap at the current stage and record the truncation.
- **Never click "Reset draft"** (native `confirm()` can hang the pane) — clear state via
  `localStorage.removeItem('ncv-v4')` + reload. **Never click the download buttons or
  "Open print view"** (blob downloads / popups; capture from the DOM instead).
- Runs must be comparable: record the prototype's git SHA; if
  `git status --porcelain narrative-cv-prototype-v4.html` is dirty, stop and tell the user.
- If the user asks for fixes mid-loop, end the loop cleanly (LOOP STATUS: stop) and hand
  back.

## Arguments

- `/ncv-persona list` — table of roster ids (roster order) with stage, agency, entry mode,
  and last run date (from `ls tests/ncv-personas/v4-sessions/`), then stop.
- `/ncv-persona next` — run the first roster-order persona with no
  `v4-sessions/<id>-*.md` report. If none remain → print `LOOP STATUS: dry — stop`.
- `/ncv-persona <id>` — run that persona. Re-runs are allowed; the report's purpose line
  must say why (e.g. "re-run at new SHA", "resume simulation").

## Loop (one run)

1. **Pre-flight.** Read `.claude/skills/ncv-persona/log.local.md` (cumulative hiccup index
   — needed to label findings NEW vs REPEAT) and `reference.md` (DOM map, pane quirks,
   known-defect index). Record `git rev-parse --short HEAD`; verify the prototype is clean
   in git. Read the persona's entry from `tests/ncv-personas/personas-v4.json`.
2. **Server.** preview_start `{name: "pathways-review"}` (port 8765 — never the user's
   :8000), navigate to `http://localhost:8765/narrative-cv-prototype-v4.html`.
3. **Clean slate.** `localStorage.removeItem('ncv-v4')`, reload, verify blank (mode cards
   visible, lens bar reads "no context set yet" once past setup).
4. **Play the persona.** Follow `behavior` faithfully — entry mode, lens choices, skips,
   patience, lint reactions, sessionPlan. All content for the path under test goes
   **through the real UI** (form_input / clicks). React in character; imperfect answers are
   the point. Log hiccups inline as they happen: what the persona did, expected vs actual,
   DOM evidence, classification (NEW / KNOWN V4 #n / REPEAT), severity. State injection is
   permitted **only** for a re-entry/resume simulation, never for the path under test.
5. **End-state capture** (no downloads): the Review stage's readonly export textarea value
   (the draft), the open-flags block + consult questions, and
   `localStorage.getItem('ncv-v4')` pretty-printed to
   `tests/ncv-personas/v4-sessions/<id>-<date>.state.json`.
6. **Grade** the run on the fixed rubric R1–R6 (template in reference.md), including the
   planted-trap table (caught / missed / false-positive per trap).
7. **Report + log.** Write `tests/ncv-personas/v4-sessions/<id>-<YYYY-MM-DD>.md` using the
   template. Append a newest-first entry to `log.local.md` and update its cumulative
   hiccup index (new slugs only).
8. **Commit** (report + state.json only — never the prototype):
   `NCV persona run: <id> (<YYYY-MM-DD>) — <n> new findings`.
9. **Close** with a short summary and the machine-legible footer, exactly one of:
   `LOOP STATUS: continue — next persona: <id>` · `LOOP STATUS: dry — stop` ·
   `LOOP STATUS: blocked — <reason>`.

## Loop integration

`/loop /ncv-persona next` (self-paced) runs the roster one persona per iteration; each
iteration re-reads this skill fresh — `log.local.md` and the committed reports are the only
carried state. The loop stops when the footer says so: roster exhausted, a completed run
with **zero NEW hiccups** ("loop dry" — later passes would be verification only), or an
environment blocker at HEAD.

## More detail

`reference.md` holds the environment setup, browser-pane quirks, the V4 DOM map and capture
snippets, the known-defect index (V4 #1–#15, U1–U8), persona realism rules, and the session
report template. Read it before the first run of each session.
