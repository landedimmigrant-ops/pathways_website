# r3 · Fable review of rounds 1 and 2 (commit ed42314), 2026-10-31

Recorded from the reviewer's final reply. Read-only review of the rounds 1–2 diff against the frozen copy, with the two-tab flows, outside clears, the Change panel, the exports and Review counts run in headless Chrome. Counts: blocker 0 · major 2 · minor 5.

- **G-1 · major (run).** A tab in the "browser data was cleared" state still took up another tab's writes and stayed muted, so a reload in the other tab could replace the only remaining copy with an empty draft. → **Fixed:** a tab that has stopped saving (outside clear, unreadable draft) ignores other tabs' saves and keeps its copy and warning; the warning no longer suggests a reload.
- **G-2 · major (run).** The Change panel's working copy survived a take-up, so Confirm wrote the old profile over the other tab's newer one. → **Fixed:** the panel closes, with a spoken line, when the profile changed in another tab; the open evidence view follows its card by id; `UI.kindOpen` resets with the rest of the UI state.
- **G-3 · minor (run).** A level typed under Other was lower-cased ("A md-phd trainee"). → **Fixed:** only a leading capital before lower-case letters is lowered; an acronym takes the article of its first letter's name ("An MD-PhD trainee").
- **G-4 · minor (run).** The "Your role" chart does not appear when no contribution has a level, even with role lines. → **No change, by design:** the chart shows the levels; with at least one level chosen, contributions with a line and no level get their own row (r1-a-6).
- **G-5 · minor (run).** The on-screen draft's CV-FRQ headings were English only, while Word, Print and the .txt were bilingual. → **Fixed:** the on-screen draft uses the same headings.
- **G-6 · minor (run).** Two inline warnings could be open at once on the start page. → **Fixed:** one warning at a time on a step.
- **G-7 · minor (read).** The Setup pointer hold had no release if the page never saw the pointer-up. → **Fixed:** it also ends on `contextmenu`, window blur and after 1.5 s.

**Checked and sound:** `normalizeDraft` keeps the new keys and values through a save and reload and migrates the V6 fixture; a take-up re-renders with the new text, keeps the step, restores focus and caret and writes nothing; no save loop; Escape in the panel's reset warning closes only the warning; user text reaches Word and Print escaped; order, letters, kinds and the three word counts agree.

**For the next rounds (reviewer's list):** IME and dead-key composition during a take-up in a visible tab; a page restored from the back-forward cache gets no storage events; trying the pointer hold on a real Mac; extending the register checker to the V7 strings.
