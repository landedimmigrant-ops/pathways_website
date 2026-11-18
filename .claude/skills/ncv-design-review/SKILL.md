---
name: ncv-design-review
description: The review every change to the Narrative CV tool gets before it is called done — design rules, vocabulary and voice, accessibility, tests, a look in the browser, and the INFERRED list. Use after ANY edit to narrative-cv-prototype-v8.html (or a later version), before reporting a change as finished, before a commit or release of the NCV tool, and when the user types /ncv-design-review or asks "did you review", "is this consistent", "check the design".
---

# ncv-design-review

Run this before you tell Prem a change to the NCV tool is done. It is short on purpose. Do every step; say which steps you skipped and why if you skip one.

The rules live in `ncv_tool_v8/DESIGN.md`. Read it first if you have not read it in this session.

## 1. Design (DESIGN.md, section 1 and 3)

For each screen you changed:

- **Editable things:** does everything that opens for editing use the editable box (`.v8-eb`), with its four states? Did you write a new hover, border or pencil rule? If so, fold it into the component.
- **One object, one look:** is the thing you changed shown elsewhere (another step, another tab)? Make it match there, or log why it does not.
- **Edit where you look:** does the editor open under the thing selected, hold only that thing, close on Escape and Done, and return focus?
- **Charts:** does anything score, rank or use colour for good and bad? Does a chart need a sentence to explain it? Change the chart.
- **Scope:** did you widen something beyond what Prem asked (an editor that holds more, a new control)? Take it out or ask.

## 2. Words (DESIGN.md, section 2)

For every string you added or changed:

- Is each term in `ncv_tool_v8/VOCABULARY.md` under its approved word? A new term goes into that file first.
- Run the `pathways-voice` checklist (`voice/voice-checklist.md`).
- Would a researcher who has never seen the tool know what the line refers to? Remove names of tool parts.
- Is the line needed? Delete it if the label already says it.

## 3. Accessibility

- Keyboard: reach it, operate it, leave it; focus is visible and returns where it came from.
- Screen reader: name, role and state on each new control; live regions polite and changed only when the text changes.
- Contrast 4.5:1 for text, 3:1 for borders and marks that carry meaning; targets 24px, 44px on a phone; no sideways scroll at 320px.
- Reduced motion: no transition.
- One test in `ncv_tool_v8/test-v8.js` for each behaviour you added.

## 4. Proof

- `NCV_CDP_PORT=<a free port> node ncv_tool_v8/test-v8.js` and read the failures in full. Report the count as it is.
- Look at the change in the browser at desktop and phone width, with the mock CV (`ncv_tool_v8/mock/mock-narrative-cv-draft.json`). Hover and focus each new control.
- Send Prem a screenshot of anything visual.

## 5. Record

- `ncv_tool_v8/README.md`: add what you inferred under "INFERRED in V8.N".
- `ncv_tool_v8/prototype-feedback.md`: Prem's words, and what was built.
- `ncv_tool_v8/CHANGELOG.md`: one row per version.

## 6. Other sessions

Before you edit, check `git status`, the file's modified time and running test processes. If another session is writing the tool files, agree on one writer first.
