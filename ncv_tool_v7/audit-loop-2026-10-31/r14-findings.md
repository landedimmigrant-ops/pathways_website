# Round 14 findings: Fable's review of round 13, a geographer who uses voice control, a postdoc with a thin record, a leave and a field switch, 2026-11-01

Recorded from the three agents' final replies. All walked the round 14 snapshot (= commit ad982cb).

## Fable review of round 13 (X-1 to X-11): 6 major · 5 minor

Checked and sound: the "my research" revert, Université, the agency hint, closed ranges, dash word counts, "*" kept, the earlier-version test; the refusal never fires on a tab's own writes and accepts profile-only drafts; stage notes do not double with Welcome back; the confidentiality line shows only on partnered profiles.

- **X-1 · major (run).** On a phone the sticky alert covered the sticky card header and its Remove button. → **Fixed:** the alert is not sticky below 48em (it stays an alert).
- **X-2 · major (run).** English with a French institution name ("Centre de recherche du CHUM") read as French and counted "per cent". → **Fixed:** articles inside a name run do not count, and one hit must be a word only French uses.
- **X-3 · major (run).** "Sept.", "seize", "est." and "cent" counted as numbers in short English lines. → **Fixed:** the short-line rule needs an unambiguous French word (avec, dans, une, sont, chez, auprès).
- **X-4 · major · a11y (run).** The take-up note was silent for screen readers. → **Fixed:** every stage note is also announced.
- **X-5 · major (run).** A page restored from the back-forward cache still took up a blank draft. → **Fixed:** the same refusal.
- **X-6 · major (run).** A deliberate Reset in another tab was reported as an outside clear, and the tabs diverged. → **Fixed:** a Reset (the draft removed) is mirrored as before; only a blank copy written by a fresh start is refused.
- **X-7 · minor.** A comment swallowed `go.type = "button"`. → **Fixed.**
- **X-8 · minor (run).** Reset's warning said "save a draft file first" when the file was current. → **Fixed.**
- **X-9 · minor (run).** Bitbucket is .org, and a bare "osf.io/." matched. → **Fixed.**
- **X-10 · minor (run).** The link note asked for "where it is hosted", which is what it flags. → **Fixed:** "(such as GitHub or Zenodo), without the address".
- **X-11 · minor (run).** An inline numbered run's markers counted as numbers. → **Fixed.**

## r14-a · mid-career geographer with a repetitive strain injury who uses voice control, SSHRC Insight Grants (TCV), Social sciences, team-based and community-engaged: 2 major · 5 minor · 3 polish

Flood-risk mapping with Indigenous and municipal partners and a community-held flood archive; 13 trainees; six statement answers; 570 words ([draft](r14-a-draft.txt)). Setup tiles, evidence kinds, role levels and "Clear the level" name their visible text; confirm panels have no time limit.

- **r14-a-1 · major · a11y (2.2.1) · data-loss.** Undo ended after ten seconds even while focused; a slow user lost two evidence items and a contribution for good. → **Fixed (INFERRED):** Undo has no time limit; it stays until the next change anywhere or a step change.
- **r14-a-1b · minor.** The evidence Undo's end was not announced. → **Fixed** with r14-a-1 (no expiry).
- **r14-a-2 · major · a11y (2.5.3).** A filled field shows its answer as an `aria-hidden` button over a 2 px box, so a voice user cannot name the visible text. → **Open for Prem (Q-25):** this is the decided shrink design (D-13).
- **r14-a-3 · minor · a11y (2.5.3).** Names that do not start with the visible words. → **Fixed in part:** "Move up: <headline>", "Move down: <headline>"; the folded row's name ends "Open.". The × buttons and field-column squares keep their names (icons).
- **r14-a-4 · minor.** Identical visible names on one screen (Field and Another field tiles, five "Download image"). → **Open** (polish for a later round).
- **r14-a-5 · minor · a11y (2.2.1).** Copy and download confirmations vanished after 1.5 to 6 seconds. → **Fixed:** they stay until the next action.
- **r14-a-6 · polish.** The Undo link was 35 × 22 px. → **Fixed:** at least 24 px.
- **r14-a-7 · polish.** The first-sentence boxes lose their visible labels once filled. → **Open.**
- **r14-a-8 · polish.** "Save draft" explains itself only in a title. → **No change.**
- **r14-a-9 · minor (unsure).** A click possibly lost as a field folded. → **Not reproduced.**
- **r14-a-10 · polish.** Focus moved when Undo expired. → **Gone** with r14-a-1.

## r14-b · early-career postdoc in developmental psychology, CIHR (TCV), Health + Social sciences, a field switch from cell biology and a parental leave: 2 major · 6 minor · 2 polish

Stress hormones and neuron growth (from the biology years) and infant sleep and parent stress in a 64-family cohort; two co-supervised undergraduates; the full statement with the switch and the leave; 802 words ([draft](r14-b-draft.txt)). The leave and field-switch wording in How you got here worked well.

- **r14-b-1 · major.** A preprint could only be tagged Peer-reviewed. → **Fixed:** Peer-reviewed reads "a published article…; a preprint goes under Other", and Other names preprints and talks. Preprint and talk kinds are **Q-24**.
- **r14-b-2 · major.** An honestly empty What already changed was "still missing" with "Is there something concrete you can name yet?" → **Fixed:** "Fine to leave empty if nothing has changed yet; What could change carries the expectation."
- **r14-b-3 · minor.** "so this is short" on most fields for an honest early record. → **Fixed:** at the early career stage the line reads "A shorter answer that names what you have is fine at your stage."
- **r14-b-4 · minor.** Only senior-career examples for Mentorship and the statement. → **Open** (Q-8).
- **r14-b-5 · minor.** The leave note pointed to prompts that do not ask about a leave. → **Fixed:** it points to How you got here. The five-year label stays with Eli (Q-2).
- **r14-b-6 · minor.** Nothing on co-supervised or current trainees. → **Fixed:** the people note covers both.
- **r14-b-7 · minor.** Statement and Mentorship prompts assume a settled program and a group. → **Fixed (INFERRED copy):** early-career variants for the problem or question, the strands help and Who gets in.
- **r14-b-8 · minor.** The read across contributions offered "conference" and "months". → **Fixed.**
- **r14-b-9 · polish.** Second-field lines on a contribution from a past field. → **No change.**
- **r14-b-10 · polish.** Two phone clips (Export's Set up for row, the first-sentence box). → **Open.**

