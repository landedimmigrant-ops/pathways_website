# Round 16 findings: Fable's review of round 15, a committee member reading three finished drafts' outputs, an early-career researcher on a small, slow phone, 2026-11-01

Recorded from the three agents' final replies. All walked the round 16 snapshot (= commit 7f6d852).

## Fable review of round 15 (Z-1 to Z-7): 1 major · 6 minor

Checked and sound: Move up restored; no code behind a trailing comment anywhere (794 comments scanned); `done()`; the stakes flag ("In 2019 I led…" and a quoted "I led it" do not fire); the Proofread item and older drafts; `pageshow`; the read-across cap; the people list.

- **Z-1 · major (run).** In Word the evidence note ran into its item (Word ignores `display:block` on a span). → **Fixed:** the note is its own block.
- **Z-2 · minor (run).** Clicks that change nothing ended Undo (field-column squares, the fold icon, Cancel, Edit evidence). → **Fixed:** only controls that change the draft end it (an allow-list).
- **Z-3 · minor.** The team-note summary counted the self-check "of 7". → **Fixed:** from the list of nine.
- **Z-4 · minor (run).** "de" before a lower-case word inside a name run made English read as French. → **Fixed.**
- **Z-5 · minor.** The headline's keep-with-next was a no-op on a span. → **Fixed:** the headline is its own block in print and Word.
- **Z-6 · minor.** A tab restored from the cache dropped its draft when the browser's data had been cleared. → **Fixed:** a Reset leaves a mark; without the mark a missing draft is treated as cleared data (the tab keeps its copy and warns).
- **Z-7 · minor.** The .txt gap note and the screen help disagreed for What already changed. → **Fixed.**

## r16-a · senior reviewer reading the outputs of three finished drafts (an engineer, NSERC; a francophone public-health researcher, FRQS CV-FRQ; a cardiologist, CIHR): 2 major · 4 minor · 4 polish

Every output (Export preview, Review draft, print view, Word, .txt, working-draft copy, section copies) carried identical text for all three drafts; the working-draft copy equals the .txt byte for byte; no tool notes in paste-ready outputs; TCV and CV-FRQ section names and order right, with `lang='fr'` on the French halves. The engineer's draft reads as submittable ([the three .txt exports](r16-a-draft.txt)).

- **r16-a-1 · major (unsure for Word).** The evidence note ran into the item in the Word file (LibreOffice). → **Fixed** with Z-1.
- **r16-a-2 · major.** A run-in numbered list with lower-case items ("1) pragmatic trials…; 2) …") was not flagged. → **Fixed:** any run 1, 2, 3, after a full stop, semicolon or colon.
- **r16-a-3 · major.** The French draft's first sentence, trainee sentences and totals are English frames. → **Fixed in part:** Export says which sentences are English for a draft that reads as French. The full fix is **Q-23**.
- **r16-a-4 · minor.** Word and print do not mark a French body. → **Open (Q-23).**
- **r16-a-5 · minor.** Two bracket groups side by side ("(INSPQ) (chef d'équipe…)"). → **Fixed:** a comma joins the unit.
- **r16-a-6 · minor.** Tense and "and" chains in trainee sentences. → **Open** (the no-pronoun rule, r2, limits the fix).
- **r16-a-7 · minor.** "146 Clinical fellows…" kept its capital mid-list. → **Fixed:** a phone's capital is lowered (Elders, Indigenous, First, Inuit, Métis keep theirs).
- **r16-a-8 · minor.** Totals (last five years) beside a career-long claim. → **Open** (D-1, Eli).
- **r16-a-9 · polish.** Small screen and output differences. → **No change.**
- **r16-a-10 · polish.** At a glance does not list metric flags. → **Open.**

## r16-b · early-career researcher in Indigenous studies, SSHRC Insight Development (TCV), Humanities + Social sciences, community-engaged, on a 320 × 568 phone with a processor four times slower: 8 minor · 4 polish

Oral history with Elders, a community-held archive of 48 recordings, a land-based teaching program; 20 trainees; the full statement; about 990 words ([draft](r16-b-draft.txt)). No sideways scroll at 320 px at normal text; typing lag 8 to 25 ms per key with 3,170 characters in a field; Review in 166 ms, Export in 137 ms; focus never hidden.

- **r16-b-1 · minor.** The Mentorship tiles overflowed at 24 and 32 px text. → **Fixed.**
- **r16-b-2 · minor.** "An a community interviewer". → **Fixed.**
- **r16-b-3 · minor.** The Other group-name box was 93 px wide. → **Fixed:** the Other tile spans the row on phones.
- **r16-b-4 · minor.** Evidence fields squeezed and a six-line placeholder. → **Fixed in part:** a short Dataset placeholder.
- **r16-b-5 · minor.** Buttons were 40 px on phones. → **Fixed:** 44 px.
- **r16-b-6, r16-b-7 · polish.** The sticky stack and the clipped Profile bar at 320 px. → **Open** (Q-14).
- **r16-b-8 · minor · field fit.** A program-evaluation role example for oral history. → **Fixed (INFERRED copy):** "The Elders' council sets the questions and approves each recording; I lead the interviews and the archive design with a community archivist."
- **r16-b-9 · minor · field fit.** "participants" in the second-field line. → **Fixed.**
- **r16-b-10 · minor · field fit.** No kind for teaching guides or curricula. → **Open** (Q-24).
- **r16-b-11 · minor.** Community agreement was missing where the work is described. → **Fixed:** with Community-engaged chosen, The problem or question adds "If a community asked for this work, say so. Name a community, its Elders or its protocols only as they agree."
- **r16-b-12 · minor.** No role level for community-led work. → **Open** (Q-20).
