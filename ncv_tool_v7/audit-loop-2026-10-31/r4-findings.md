# Round 4 findings: Fable's review of round 3, a returning historian, a low-vision engineer at 200% zoom, 2026-10-31

Recorded from the three agents' final replies. All walked the round 4 snapshot (= commit 98c91e1: round 3 plus another session's Q12–Q15 work).

## Fable review of round 3 (H-1 to H-13): 2 major · 11 minor

- **H-1 · major (run).** Back right after Confirm profile was a dead press (the Setup entry stayed, the gate sent it back, focus fell to the page, nothing was said). → **Fixed:** Confirm profile replaces Setup's history entry; any address for a step the gates do not allow names the step shown and focuses its heading; a two-tab take-up replaces rather than pushes.
- **H-2 · major (run).** Back after a reset re-entered Setup and wrote `mode: "compose"`. → **Fixed:** with no draft started, every address is the start page; only the start page's buttons start a draft.
- **H-3 · minor.** The evidence Undo row could outlive its ten seconds. → **Fixed:** one timer per Undo, set at removal.
- **H-4 · minor.** A card with only a level read "already blank". → **Fixed:** blank means nothing counted, a level included.
- **H-5 · minor.** The renamed kind was cut in the evidence chart. → **Fixed** ("Exhibition or performance" in the chart).
- **H-6 · minor.** The open kind chooser was held by item index. → **Fixed:** cleared on add, remove and Undo.
- **H-7 · minor.** The phone rail stayed open across Back and Forward. → **Fixed:** it closes on every step change.
- **H-8 · minor.** A reload at `#profile` after Confirm skipped Welcome back. → **Fixed:** the boot applies the gate first.
- **H-9 · minor.** A rail rebuild while typing dropped focus from the toggle. → **Fixed:** focus returns to the same control.
- **H-10 · minor.** "Set up your profile · step 1 of 6" before Confirm. → **Fixed:** no count until the profile is confirmed.
- **H-11 · minor.** A take-up that closed the Change panel dropped focus. → **Fixed:** focus returns to Change.
- **H-12 · minor.** A tab that had stopped saving still reset on another tab's clear. → **Fixed:** it ignores other tabs entirely while stopped.
- **H-13 · minor (read).** `popping` was not reset if a render threw. → **Fixed** (`finally`).
- Also from the reviewer: an arrow's kind is no longer announced (the screen reader reads the focused option); a commit still is.

## r4-a · early-career historian, SSHRC IDG, reopening this morning's draft file, desktop 1440: 6 minor · 4 polish

The old file migrated cleanly (only new keys added; nothing lost, changed or doubled). Wrote a monograph chapter on a 1912 mill strike, a digitized mill-town archive and a public exhibition with the historical society; 2 trainees; seven-part statement; about 1,220 words ([draft](r4-a-draft.txt)).

- **r4-a-1 · minor.** Review hid the profile, and the opened-on line did not say what profile the file carried. → **Fixed (INFERRED):** "Opened your draft saved on 31 October 2026, set up for …"; Review has the Profile bar and Change.
- **r4-a-2 · minor.** "Skip any part your record does not include" against Still missing. → **Fixed:** "A part your record does not include can stay empty; Review lists empty parts so you can check each one."
- **r4-a-3 · minor.** Humanities fit of the evidence kinds and the editor's intro. → **Fixed:** Dataset / tool names "a catalogue or a digitized collection"; Replication / citation names "scholarship that built on it"; the intro names "an edition or collection".
- **r4-a-4 · minor.** Largely solo had no effect with Community-engaged, and Team-based and Largely solo could both be on. → **Fixed (INFERRED):** Team-based and Largely solo replace each other, and the change is spoken. (Solo with Community-engaged keeps its own role prompt, r1.)
- **r4-a-5 · minor.** "could learn" flagged as a hedge. → **Fixed:** "could" before a verb of access or knowing is a past ability.
- **r4-a-6 · minor.** "3 of 2 described", with Review saying nothing missing. → **Fixed:** the count says "3 described, more than the 2 counted above…" and Still missing lists it.
- **r4-a-7 · minor.** No Humanities examples for Mentorship and the statement. → **Open for Prem** (with r1-a-5).
- **r4-a-8 · polish.** The path field printed a fragment. → **Fixed:** "What this person did or went on to do", with a placeholder showing a sentence that starts with the person's action.
- **r4-a-9 · polish.** People ran together in the section copy. → **Fixed** (a paragraph each).
- **r4-a-10 · polish.** The chart label and a month-first date. → **Fixed** (short label; "31 October 2026").
- **Register:** the solo role prompt had a contraction and a counterfactual. → **Fixed:** "In one line, what was your own part in this work?" The "What's next" heading stays (Prem's label).

## r4-b · senior environmental engineer, NSERC, low vision at 200% zoom (640 × 450): 1 major · 6 minor · 6 polish

No sideways scroll on any step, with or without WCAG text spacing. Wrote four contributions (real-time sewer overflow control, an open stormwater model, a biochar PFAS filter, a river nutrient network), 64 trainees with five described, a full statement; 1,314 words ([draft](r4-b-draft.txt)).

- **r4-b-1 · major · a11y.** Focused fields landed under the sticky stack (top bar 60 px plus card header 64 px). → **Fixed:** the scroll padding follows the real stack (`--v7-bar` plus `--v7-stick`); below 520 px of height the card header and Setup's count row stop sticking.
- **r4-b-2 · minor.** The new step's heading sat below the fold after a step change. → **Fixed:** it is brought into view when it would be below the fold.
- **r4-b-3 · minor.** Profile pills clipped on narrow screens. → **Open for Prem** (the fade is a decided design; options: wrap the pills, or "+3 more").
- **r4-b-4 · minor.** Empty progress squares at about 1.4:1. → **Fixed** (a 3:1 edge). Showing "8 of 9" as text beside them is **open**.
- **r4-b-5 · minor.** A long field in the first sentence is cut at narrow widths. → **Open** (the box already takes the full line).
- **r4-b-6 · minor.** The folded rail row does not stick. → **Open for Prem** (INFERRED in round 3 to avoid two sticky rows; option: Save draft in each step's bottom nav).
- **r4-b-7 · minor.** Mentorship sentences repeat the sector. → **Fixed:** the sector is named only when the organization's name does not say it.
- **r4-b-8 · polish.** Step numbering restarted. → **Fixed** with H-10.
- **r4-b-9 · polish.** The Field select clipped its text in the Change panel. → **Fixed** (wider columns).
- **r4-b-10 · polish.** The chart's cut label. → **Fixed** with H-5.
- **r4-b-11 · polish.** The Export preview was a Tab stop that cannot scroll. → **Fixed:** a Tab stop only when it scrolls.
- **r4-b-12 · polish.** Start-page cards change width when a warning opens. → **Open** (polish).
- **r4-b-13 · polish.** The worked example opens by default on first arrival. → **No change** (EX_DEFAULT, decided).
