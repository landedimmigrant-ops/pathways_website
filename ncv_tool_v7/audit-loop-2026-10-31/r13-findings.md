# Round 13 findings: Fable's review of round 12, an early-career social scientist who works in bursts (tabs, history, resets), a computer scientist with a confidential industry partner, 2026-11-01

Recorded from the three agents' final replies. All walked the round 13 snapshot (= commit 7c267c4).

## Fable review of round 12 (V-1 to V-10): 2 major · 8 minor

Checked and sound: the Welcome-back banner and its live region; the page range against the limit at the edges; tablet targets; the second-field lines; "(n = 45)"; the kind state.

- **V-1 · major (run).** The French-text test missed short fields and curly apostrophes, so French number words stopped counting there (a regression of r11-a-4). → **Fixed:** curly apostrophes and capitalised elisions count; two hits suffice in a short field; and with no other number, one French function word lets French number words count.
- **V-2 · major (run).** "My research / work / program" counted as naming your part, so "My research… We ran… our team…" was no longer flagged (the H1 case). → **Fixed:** reverted; "our guidelines / field" stay excluded instead.
- **V-3 · minor (run).** English with "Le Roux", "Du Bois" or "et al." read as French. → **Fixed:** a stop word counts only in lower case, and "et al." is ignored.
- **V-4 · minor (run).** "The Université de Montréal" kept its capital article (an accent defeats `\b`). → **Fixed.**
- **V-5 · minor (run).** The Change-panel agency hint fired on a name typed for the new agency. → **Fixed:** only while the name is still the saved one.
- **V-6 · minor (run).** The range collapse ate a number after a spaced dash ("In 2019 — 45 of them…"). → **Fixed:** closed ranges only.
- **V-7 · minor (run).** "See Fig. 2. … See Fig. 3." read as an inline list. → **Fixed:** a run 1, 2, 3… and not after Fig., No., vol., p.
- **V-8 · minor (run).** Word counts split closed ranges ("2019–2022" as two words). → **Fixed:** only a dash between letters splits words.
- **V-9 · minor (run).** A leading "*" that is content ("* p < 0.05 marks…") was dropped. → **Fixed:** only "•" and "·" are dropped.
- **V-10 · minor.** Session notes (V7 content) marked a file as "from an earlier version". → **Fixed.**

## r13-a · early-career social scientist, SSHRC Insight Development (TCV), working in bursts: two tabs, Back and Forward, reloads mid-typing, field switches, Reset, cleared site data: 2 major · 4 minor

Three contributions on food insecurity among students and a campus pantry, Mentorship, the full statement; 627 words ([draft](r13-a-draft.txt)). Reloads mid-typing, Back and Forward, field switches (byte-identical text), take-ups between visible tabs, Undo and opening files all kept every word.

- **r13-a-1 · major · data-loss.** With two tabs open, clearing the browser's site data and reloading one tab wrote a blank draft that the other tab, holding the only copy, then took up. → **Fixed:** a tab holding a written draft never takes up a blank one; it keeps its copy, stops saving and says so in an alert.
- **r13-a-2 · major · a11y.** The "browser data was cleared" warning was out of sight and silent. → **Fixed:** it is an alert, it stays in view under the top bar as the writer scrolls, and after Save draft it says the file name and that this browser is no longer keeping a copy.
- **r13-a-3 · minor.** Another tab's save closed an open confirmation or Undo silently and dropped focus to the page. → **Fixed:** a visible line says what closed; focus goes to the step heading.
- **r13-a-4 · minor.** Reset's warning did not say whether the draft had changed since the last saved file. → **Fixed:** it uses the same sentence as opening a file.
- **r13-a-5 · minor.** "That page belonged to an earlier draft" was for screen readers only. → **Fixed:** shown at the top of the step too.
- **r13-a-6 · minor.** "Go to where you were" showed on the step already open. → **Fixed:** it reads "Go to the next part to write", which is what it does.

## r13-b · mid-career computer scientist, NSERC Alliance (TCV), STEM + Social sciences, team-based, industry partner under a confidentiality agreement: 5 minor · 4 polish

Fairness audits of hiring algorithms with an unnamed employer, an open-source auditing toolkit, a licensed patent; 28 trainees and two people described (one at an unnamed company); the full statement; about 1,380 words ([draft](r13-b-draft.txt)). Anonymized wording printed well; no regressions.

- **r13-b-1 · minor.** The number checks and the Specificity self-check pushed toward names and figures the researcher cannot give. → **Fixed (INFERRED copy):** with a partnered work mode, What you did and What already changed add "If an agreement keeps the partner or its figures private, describe the partner by its sector and size, give what you can, and say the rest is withheld."; the self-check says "where I am free to give them".
- **r13-b-2 · minor.** A patent had no prompt of its own. → **Fixed:** the item and note prompts under Other name a patent and its licence. A Patent / licence kind is not added (Q13 decided the kinds).
- **r13-b-3 · minor.** A partner letter had no natural kind, and the uptake prompts asked who adopted it. → **Fixed:** Community document covers a letter a partner holds; the uptake prompts allow the partner's sector.
- **r13-b-4 · minor · field fit.** STEM wording leaned to hardware. → **Fixed (INFERRED copy):** models, datasets and systems; a deployment or release review; software releases, patents and licences in What resulted; "the paper, release or patent" in the headline help.
- **r13-b-5 · minor.** Repository addresses without "https://" were not flagged, and the note gave no help for software. → **Fixed:** github, gitlab, bitbucket, pypi, arxiv, zenodo and osf addresses count as links; the note says to give the software's name, version and host. The DOI question stays with Eli (Q-4).
- **r13-b-6 · polish.** No STEM example for Mentorship and the statement. → **Open** (Q-8).
- **r13-b-7 · polish.** The trainee placeholder ignored the level. → **Fixed.**
- **r13-b-8 · polish.** "You are aiming at NSERC Alliance grant." → **Fixed:** the name is in quotation marks.
- **r13-b-9 · polish.** The Replication item prompt was narrower than its card. → **Fixed.**

