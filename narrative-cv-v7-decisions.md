# Narrative CV tool, V7 decisions log

V7 beta, forked from V6 on 2026-10-27 as a redesign. Built from Prem's walkthrough of the V6 tool and the flow map
(`ncv-v6-flow-map/ncv-v6-walkthrough-notes.md`), with the questions that need Eli kept in
`ncv-v6-flow-map/ncv-v6-questions-for-eli.md` (not sent).

## Ground rules

- No AI, no API, on-device. Funder rules follow the official guide page, not the review copy:
  https://www.concordia.ca/research/pathways-to-impact/learn/impact-101/narrative-cv.html
- Anything a note does not settle is built as the walkthrough notes mark it, and logged here as **INFERRED**, with a
  slot for Prem to override.
- V6 and V5 stay frozen. The V5x portfolio test is out of this line (Prem, 2026-10-27): no merge, no re-port.
- One writer to the V7 file at a time. Read-only agents may check it in parallel.
- Prose follows the Pathways voice (`.claude/skills/pathways-voice/`) and the academic register list.

## Team (2026-10-27)

Opus: engineer and director, sole writer of the file. Designer agent: layouts, mock-ups, visual checks at desktop and
phone width. Fable: advisor at checkpoints (design review, final review, voice). Sonnet and Haiku: grunt work and
read-only checks.

## Versions

| Version | File | Status |
|---|---|---|
| V5 | `narrative-cv-prototype-v5.html` | Frozen reference |
| V6 | `narrative-cv-prototype-v6.html` | Frozen reference; live at `/ncv_tool_v6/` |
| V7 | `narrative-cv-prototype-v7.html` | In build; starts as a renamed copy of V6 |

## Backup

`backups/v6-pre-v7-2026-10-27/` holds V6, its decisions log, its folder and the walkthrough notes as they stood.

## Build list

From the walkthrough notes, in build order. **DECIDED** = Prem said so in the walkthrough. **INFERRED** = a proposal Prem
did not override, or a call the director made where the notes left a gap or contradicted each other (the reason is
given). Later notes win over earlier ones. Each item names what "done" means.

**Build order (revised 2026-10-27 after the advisor's review).** The items keep their numbers, but the build runs:
(1) the data layer first: V7-10, V7-12, V7-29, V7-38 and the migrations, with a smoke test against a saved V6 draft;
(2) the card pattern on Contributions (V7-20 to V7-26), then Mentorship (V7-27), the statement (V7-28), the Profile
(V7-13 to V7-19); (3) the rail and buttons (V7-4 to V7-8), which depend on the final set of steps; (4) Review and
Export (V7-30 to V7-34); (5) copy and the start page (V7-2, V7-3, V7-9, V7-11). The smoke test runs after every phase.
**Trials** (V7-6, V7-26) are on for Prem's look and decided before the first researcher test.

### Phase 1 — shell, start page, rail

- **V7-1 Official guide address.** DECIDED. `GUIDE_URL` points at the official page; every guide link follows. Anchors
  `why`, `three`, `compare`, `difference`, `concerns`, `reviewers` were checked live on 2026-10-27. Done: no link in V7 opens
  `ncv-guide-review/`.
- **V7-2 Start page copy.** DECIDED (order and the guide sentence), INFERRED (exact wording). Title; subtitle "A drafting
  tool for your Tri-agency CV or CV-FRQ."; the intro moved up, without its repeated privacy, no-AI and prototype sentences
  and without "plus questions for an advisor" (advisor features are out, V7-30); "We recommend reading the narrative CV
  guide before you start, and consulting it as you go." with the link on "narrative CV guide" opening the guide's top; the
  privacy line last. The deep link "What a narrative CV is, and which funders use it" goes. Done: each fact said once.
- **V7-3 Path cards.** DECIDED. **New draft** is the prominent, colour-emphasized card; **Continue draft** is a small square
  on its right that opens a saved draft file (V7-29). Titles top-aligned. The "Choose one to start…" line and its
  "selected" follow-up go. The structural-read path leaves the start page and the rail; its code stays in the file,
  unreachable (INFERRED: a saved draft in `xray` mode opens as a new-draft draft).
  **Update 2026-10-27 (Prem, mock-up review):** DECIDED: "Start a new draft" is the card's top line, so the button text
  is the first thing read; the small "New draft" label above it goes. The body says plainly what follows, in short
  sentences. INFERRED wording: "You answer a series of prompts, one section at a time. At the end, you review your
  draft and set the order of your contributions."
- **V7-3a Getting back to the start page.** OPEN (Prem asked how; V6 has no way back except Reset). INFERRED proposal:
  the tool title in the header links to the start page, and a small "Start page" link sits above "My application" in
  the rail. Going back changes nothing; the draft stays saved and the rail stays filled in.
- **V7-4 Rail.** DECIDED (groups, names, clickable, green on entry), INFERRED (markers, caption, layout). Heading "My
  application". Group **Your answers**: Profile, Contributions, Mentorship, Personal statement (dots). Group **Draft**:
  Review, Export (a square marker), muted with "Fills in as you add contributions." until a contribution has text (the items stay clickable, so "Opens" would be untrue). No Feedback
  item. Every item stays clickable. Phone: the same groups in a block above the content.
  **Update 2026-10-27 (Prem, mock-up review):** DECIDED: the profile is not part of the application, so it leaves the
  group. It sits above the groups as its own task, **Set up your profile** (INFERRED wording from "set your profile").
  The heading **My application** now heads the group that was "Your answers": Contributions, Mentorship, Personal
  statement. Group **Draft** unchanged. The step heading, the Back buttons and the V7-18 notes use the new name ("select
  Set up your profile in the steps list").
- **V7-5 Green rule.** DECIDED (writing steps), INFERRED (Review and Export). A step turns green once it has been opened and something entered in it; Review once opened;
  Export once anything is downloaded, copied or saved. Done: `stageDone` rewritten to match, with a `visited` record.
- **V7-6 Rail metrics (trial).** DECIDED as a trial. Profile: agency · career stage. Contributions: "3 of 10". Mentorship:
  the sum of the totals ("24 trained"), else "2 people described". Personal statement: "4 of 7 answered" (8 for the CV-FRQ).
  "Draft so far" at the foot of the Draft group, past about 200 words: "about 1,240 words", a plain bar, "roughly 2.5 of 5
  pages", shown as the range the code computes (500 to 600 words a page): "roughly 2 to 2.5 of 5 pages". Behind one switch
  (`V7_TRIALS.railMetrics`). A small **Save draft** action sits at the rail foot and works from any step (note line 381;
  the advisor found it missing).
- **V7-7 Buttons name the next step.** DECIDED. Profile → "Contributions →"; Contributions → "Mentorship →"; Mentorship →
  "Personal statement →" ("Background and skills →" for the CV-FRQ); Personal statement → "Review your CV →"; Review →
  "Export →"; Export has a back link only. Back buttons name the previous step.
- **V7-8 Headings.** DECIDED (contributions), INFERRED (the rest, by the same rule). Each step's heading is the official
  section name for the chosen format, from the code's `SECTION_NAMES` table (TCV: "Personal statement", "Most significant
  contributions and experiences", "Supervisory and mentorship activities"; CV-FRQ: "The candidate's background and
  skills", the same contributions name, "Supervisory and mentoring activities"); the "Step ·" labels go; "Profile", "Review your CV" and "Export
  your draft" for the tool's own steps.
- **V7-9 Banner and privacy line.** DECIDED (feedback by email). "Note for the team" becomes **Email us** (a `mailto:` to
  impact@concordia.ca, subject "Narrative CV tool: my experience"). The privacy line drops the Feedback sentence: nothing
  leaves this device unless you email it. INFERRED: the team-notes panel is hidden with the Feedback step; saved notes stay
  in the draft data.
- **V7-10 Feedback step hidden.** DECIDED. The step, its Send and its read-back are switched off by one flag; with it off,
  V7 makes no network call. Done: a network log of a full session shows no requests beyond the page's own files.
- **V7-11 Welcome-back banner.** INFERRED (kept; the notes only explained it). It still greets a returning visitor once;
  its flag count goes with the marks (V7-30).
- **V7-12 Reading V6 drafts.** INFERRED (no note covers it; testers hold V6 drafts). On the first V7 visit, when `ncv-v7` is
  empty and `ncv-v6` holds a draft, the start page offers once to open it here. V6's copy is never changed.

### Phase 2 — Profile

- **V7-13 One question at a time.** DECIDED (one question at a time), INFERRED (folding summaries, moving on when chosen,
  the counter; from the proposal Prem refined). New draft reveals a short opening line, then the questions one by one; an
  answered question folds to a one-line summary that opens again on click; a quiet "2 of 6 answered" counter. Each
  question is the question, a separate lighter explanation, then the choices. Single-choice questions move on when
  chosen. The folded answer uses the same component as a shrunk card field (V7-20), so the two patterns read as one.
  **Update 2026-10-27 (Prem, mock-up review): superseded in part.** DECIDED: no flashing and no shrinking in the profile.
  A chosen card stays visibly selected where it is, and the next question opens below it; nothing folds, jumps or moves
  on by itself. Answered questions stay in full so the researcher can see and change every answer in place. Still one
  question revealed at a time, with the counter. The card pattern's shrinking (V7-20) stays on the writing steps only.
- **V7-14 Order.** DECIDED. Agency → competition and year → career stage → discipline → second field (only after a
  discipline) → how your work usually happens (multi-select, neutral wording; moved from Contributions as a trial).
- **V7-15 Agency.** DECIDED (cards, no format on them), INFERRED (wording). "Choose the agency you are applying to." Cards
  SSHRC, NSERC, CIHR, FRQ, Not sure yet, each with its full name as small visible text; after the choice, the format shows
  as feedback ("Tri-agency CV format" / "CV-FRQ format"). The FRQ requirement sentence stays word for word in the
  explanation.
- **V7-16 Competition and year.** DECIDED. The competition name is required, with **Undecided** as an alternative (prompts
  treat Undecided as today's empty case). Year **optional** ("if available"), from a list computed from today's date (this
  year and the next three). No deadline. Shown with the competition in
  the summary and the "Tailored for" line, and carried by the draft file.
- **V7-17 Discipline.** DECIDED (layout), INFERRED (wording, field-not-listed). "Which field is your work closest to?"; five
  cards; the explanation set apart. The "Field not listed" box goes (it rewarded nothing); one line under the cards points
  a researcher whose field is missing to the Email us link. The second field keeps "No, just this one" as a clear choice.
- **V7-18 Notes about changing answers.** DECIDED (both). Right after New draft, a short note with an info icon: "You can
  change these answers at any time: select Profile in the steps list." At the end, beside "Contributions →": "You can
  change any of these answers later: select Profile in the steps list." (The first draft of this list dropped the early
  note on an INFERRED lean; the advisor pointed out Prem decided it.)
- **V7-19 "Tailored for" line.** INFERRED. Kept as one slim line on Contributions, Mentorship and the Personal statement
  (it explains why the examples match); removed from Review and Export, where Export's "Set up for" line (V7-33) does that
  job.
  **Update 2026-10-27 (Prem, mock-up review):** DECIDED: a clear bar with a visible border, not a slim line, and a
  clean **Change** button (a real button, not a text link) that opens Set up your profile. D-16 still applies on phone.

### Phase 3 — the card pattern and the three writing steps

- **V7-20 The card pattern (one component).** DECIDED. A grey card per repeating thing. Every question is a visible field
  from the start. The field you are in is open in full (question, separate explanation, a static text box of about four
  lines that scrolls inside, wording checks under it). A field you leave shrinks and fades to its label and answer (about
  three lines, then a fade and a click to open). Fields not reached show shrunk and empty, one line each. No Next button,
  no Enter-to-advance. Shrinking happens after the next field has opened and keeps the page still. INFERRED (advisor):
  the box is about eight lines, not four, so long stakes paragraphs stay visible; a field shrinks only when focus leaves
  its whole question group for another field (`focusout` with `relatedTarget`), never on blur to nowhere or on a click
  inside the same question; faded text keeps 4.5:1 contrast (the overflow is masked, not the words). Reduced motion
  respected; the box stays in the page when shrunk; screen readers hear the question, that it is answered, and that it
  can be edited. Counter "3 of 9 answered".
- **V7-21 Contributions screen.** DECIDED (heading, instruction kept, examples closed, order note at the end), INFERRED
  (exact layout). The official heading, today's instruction paragraph kept as Prem likes it, with "What counts as a
  contribution" moved inside it as the link, a row of closed
  example controls, the cards, the wide dashed "+ Add a contribution", the closing note "You will put these in order in Review, after the personal statement.", then "Mentorship →". The header of each card builds from its headline.
- **V7-22 Worked examples.** DECIDED. Closed on arrival; open on request. A toggle switch **See how it's built** at the top
  of each example box (role switch, off on arrival, no explanation line) colours the six jobs and shows the legend; the
  fiction note sits below as a footer. Applies to the contribution, two-field and mentorship examples, and the statement
  example (INFERRED, same rule).
  **Update 2026-10-27 (Prem, mock-up review):** DECIDED: **See a finished example** gets more weight; in the mock-up it
  reads as buried among the example controls. INFERRED: it becomes the first and primary control of the row (filled
  button, full label), with the other example controls as quieter secondary buttons beside it. Still closed on arrival.
- **V7-23 Wording-checks note.** INFERRED. The "checks are suggestions" note appears the first time a check fires, inside
  that field, once per draft.
- **V7-24 Self-assessment marks removed from writing.** DECIDED. No ✓ ✗ ? buttons in any field. Saved marks and notes stay
  in the data (V7-30).
- **V7-25 Evidence.** DECIDED (direction; tune in production), INFERRED (details). Entering evidence shrinks the writing
  fields and shows "What you wrote" (the assembled paragraph, read-only, with Edit). The eight kinds show as chips with a
  short example each; none pre-selected. Deferred (advisor, scope): a different prompt per type; one prompt serves all types in V7. Then the item and its two lines. The
  explanation leads with purpose and matches what the tool does: "Evidence backs up what you have just described. Add the
  items a reviewer could check: a paper, a policy or program that adopted your work, coverage, a dataset, an award. Add as
  many as you need. Each item gets a letter, and the letters follow the contribution in your draft." The "More kinds of
  evidence that count" guide link moves here. The separate Assemble link goes.
- **V7-26 "Your paragraph so far" (trial).** DECIDED as a trial for the statement; INFERRED for contributions (the card
  proposal had it). **One element:** under a contribution card it is the strip while you write, and it becomes the
  read-only "What you wrote" block (V7-25) when evidence starts, so the paragraph never shows twice. Behind
  `V7_TRIALS.paragraphStrip`, keeping the muted joins and the gap warnings.
- **V7-27 Mentorship.** DECIDED. Official heading; closed example; **totals** as four large-number tiles in one grey box;
  **people** as grey cards under "A few of the people you trained, and where they went." (advisor: "Tell us" misaddresses a
  reader who writes for reviewers) with "2 of 24 described"; each person: "When you trained
  them" (Doctoral, Master's, Postdoctoral, Undergraduate research, Other with a short text box) and "Where are they now?"
  (University, Industry, Community agency, Government, Other) side by side, then organization and unit with labels that
  follow the sector, then optional prizes and "why this example matters"; labels above every field; a header that builds
  as you fill it; "+ Add a person" in the wide dashed style; "How you mentor" as a third card in the pattern; the
  early-career note as today. Deferred (advisor, scope): the quiet line when more people are described at a stage than its total. The totals
  label keeps today's "last five years" wording until Eli answers question #1.
- **V7-28 Personal statement.** DECIDED (card, strip trial, button), INFERRED (the rest). Official heading for each format;
  "written last" said once; the instruction cut to two or three sentences with the CV-FRQ extras word for word; one grey
  card "Your statement" with the "I am a … at … My work is in …" line first; the cross-contribution read placed beside the
  problem and strands questions; "Why this competition" uses the competition name; the standing guard (Journal Impact
  Factor, h-index) kept word for word in the explanation; "Review your CV →".
- **V7-29 Save and Continue draft.** DECIDED. **Save a draft file** writes JSON with a format name and version; **Continue
  draft** reads one, checks it is a narrative CV draft, asks before replacing a draft already in the browser, migrates it
  through the same load path, and opens the saved step. INFERRED: the file carries the draft only (no team notes, no
  feedback answers). The stage migration (free text to choice, Other keeps the old text) runs here too. The Continue
  draft square carries the caption "Open a draft file you saved from this tool."
- **V7-38 Steps that no longer exist.** INFERRED (advisor found the gap). A saved step key that V7 drops is remapped on
  every load path (browser storage, V6 import, draft file): `order` → Review, `feedback` → Export, `xray` →
  Contributions. Also on load: `visited` built from what has text, the work mode read into the Profile, and the file
  version checked. Written first, against a saved V6 draft fixture.

### Phase 4 — Review and Export

- **V7-30 Advisor features parked.** DECIDED. The advisor questions box, the advisor packet, the marks and the open-flags
  list are gone from the screens; their data stays in drafts and draft files.
- **V7-31 Order moves into Review.** DECIDED. The Order step leaves the rail. Its cards (slot labels First / between / Last
  with the competition name; ↑ ↓ and a drag handle; a short slide; "The numbers in Contributions follow this order.") are
  the second block of Review. INFERRED: with fewer than two contributions, one line and a link to add one. "This order
  works" goes. Deferred (advisor, scope): drag-and-drop; ↑ ↓ buttons carry the ordering in V7.
- **V7-32 Review.** DECIDED (draft at top, dashboard, self-check with the template reminder). Heading "Review your CV"; the
  working draft at the top, read-only, about 14 lines with Shrink / Show, updating as the order changes; the order cards;
  **At a glance** (only what is missing, each a link to its field, else "Nothing missing"; the length meter); the
  self-check closing with the guide's own format sentence; "← Personal statement" and "Export →".
- **V7-33 Export.** DECIDED (separate step, organized downloads, explained save, email nudge). Heading "Export your draft";
  "Set up for" line with Change (when the agency is Not sure yet: "Agency not chosen · Tri-agency CV layout · 12-point Times
  New Roman · Change"); the draft preview; cards **Download or print** (Word recommended or plain text, one
  Download button, Print view and Copy draft as quiet actions), **Paste into the template, one section at a time** (three
  Copy buttons and the format note), **Keep your work** (Save a draft file with Prem's explanation); the contact line and
  the email nudge "If you have a few minutes, you can send a short note to impact@concordia.ca about your experience with
  the tool and what would make it better." with **Email us**, the address also printed as text beside the button (a
  `mailto:` link does nothing for people who use webmail).
- **V7-34 Statement spacing in the files.** DECIDED (fix it, then test). The statement answers join into one paragraph after
  the "I am a…" line in the Word file, the print view, the text download and the section copy.

### Phase 5 — checks

- **V7-35 Tests.** A headless test of the V7 flows (start, profile, each card state, evidence, mentorship, statement,
  review order, every export, save and reopen a draft file, V6 draft import, migrations, the At a glance links opening the
  right card and field with focus on it), the example-library checker
  (`scripts/ncv-v5-examples.js --file narrative-cv-prototype-v7.html`), keyboard-only and screen-reader labels, phone width,
  reduced motion, and an offline run with no network requests.
- **V7-36 Design and voice review.** The designer checks every screen at desktop and phone width; Fable reviews the whole
  build against the walkthrough notes and reads all new copy against the Pathways voice.

### Phase 6 — wrap-up

- **V7-37** This log updated with what was built and every INFERRED call; README; memory; the flow map redrawn for V7;
  the Eli question list ready for Prem to send. The `/triage` skill and its memory note told that V7 has no in-tool
  feedback (its NCV source was the sheet rows the Feedback step wrote); feedback now arrives by email.

### Design review of the mock-ups (advisor, 2026-10-27): build rules

The mock-ups are in `ncv-v7-design/` (reference, not product code). The advisor's critique becomes these build rules
(INFERRED unless marked), applied when the screens are built:

- **D-1** Totals label keeps "last five years" until Eli answers #1 (the mock-up dropped it; V7-27 stands).
- **D-2** The discipline question keeps one line pointing a researcher whose field is missing to Email us (V7-17 stands).
- **D-3** Reset draft stays reachable on every width: beside Save draft at the rail foot on phone.
- **D-4** Every card arrives with one field open: the first unanswered one ("How you mentor" opened with none in the mock-up).
- **D-5** Evidence kinds as a small grid of cards with examples (the mock-up's choice, kept over chips); Replication /
  citation example: "a study that repeated or cited your work".
- **D-6** Card title clamps to one line with an ellipsis; the full headline shows in the Headline row.
- **D-7** The "What you wrote" strip and the evidence area use a borderless tint, so the evidence screen is not boxes in
  boxes.
- **D-8** Six-jobs colour dots only on the six job fields; none on Headline, One moment or Evidence.
- **D-9** Person cards keep plain labelled fields (no open/shrink): short selects and one-liners do not need it.
- **D-10** Text-box border #949494 (passes 3:1 for controls); the one visible change to the site look.
- **D-11** Review intro without an imperative: "This step shows your working draft, lets you put your contributions in
  order and shows what is still missing."
- **D-12** One length rule everywhere: the code's 500 to 600 words a page (the mock-up had 450 to 550 in places).
- **D-13** Shrunk fields stay accessible: reduce with `clip-path` or a 1 px box, never zero height; the whole shrunk row is
  the one target (no second "Change" button inside it).
- **D-14** Touch targets at least 44 px (the ↑ ↓ order buttons on phone).
- **D-15** The "N of 9 answered" live region is throttled, so it does not speak after every keystroke or field.
- **D-16** On phone the "Tailored for" line collapses to one line with Change.
- **D-17** Scroll anchoring while fields shrink is the top build risk: test it with VoiceOver early, not at the end.
- **D-18 Borrow from the live Pathways page** (Prem, 2026-10-27; concordia.ca/research/pathways-to-impact.html, read
  live). DECIDED: the coloured accent line, used on top of or under a box rather than only at its side. Measured on the
  live page: the pathway chips carry a 4 px coloured rule (burgundy #912338 for Academic scholarship, then #db0272,
  #da3a16, #573996, #0072a8, #b07d00, #508212); the long-form sections carry a thin burgundy rule at the left; section
  kickers are 12 px caps, weight 600, letter-spacing 0.06em, in burgundy or 70% black; headings in Gill Sans Nova with
  one italic burgundy word; entry cards have a thin grey border, a caps kicker, a burgundy title and an arrow at the
  bottom right, with the "need guidance" card tinted. INFERRED application: a 4 px burgundy line on top of the
  New draft card, the Tailored for bar and the open writing card; small caps kickers above step headings (for example
  "MY APPLICATION" over the contributions heading); Continue draft styled like the live entry cards, arrow at the
  bottom right. The pathway colours stay out of the tool (they mean pathways on the site). The site's fonts load only
  on concordia.ca, so the tool keeps its fallback stack and gains them when it moves to AEM.
- **Proposal for Prem, not applied:** the Contributions header stack (pills, heading, the 90-word instruction, three
  example buttons) puts the first card about 550 px down on desktop and two screens down on phone. The advisor suggests
  folding the instruction to its first two sentences with "More", or folding it once a card has text. Prem asked to keep
  the instruction, so it stays as is until Prem says otherwise.
- **Copy to strike at build:** the existing help line "Set up the why before the what" (aphorism, contrast).

### Not in V7 (decided out or waiting)

Deadline date; advisor features (V7-30); drag-and-drop ordering; per-type evidence prompts; the over-described line under
the mentorship tiles; the portfolio (separate future feature); asking for a copy of the CV; paste-in
analysis of an existing draft; linking each evidence item to a sentence; a real .docx; the CV-FRQ header and footer with
the researcher's name; links to the current agency templates (waits on Eli #8); mentorship and statement examples by
field (waits on Eli #7).

## Build progress

### Data layer, 2026-10-27 (done, not committed)

- **Done:** V7-1 (official guide address everywhere), V7-10 (Feedback off by `FEEDBACK_ON = false`; `postFeedback`
  returns before any fetch), V7-12 (V6 draft offer on the start page), V7-29 (Save draft at the rail foot; Continue
  draft on the start page), V7-38 (step remap and migrations). From V7-9: the banner's **Email us** link replaces "Note
  for the team" (hidden, data kept) and the privacy line ends "Nothing leaves this device unless you email it."
- **How it is built:** one load path, `applySaved`, for browser storage, the V6 offer and draft files. It forces the
  structural-read mode to a new draft, builds `visited` from what holds text, makes `workMode` a list, classifies each
  trainee's free-text stage into `stageKind` (Doctoral, Master's, Postdoctoral, Undergraduate research; anything else is
  Other with the old text in `stageOther`) and remaps steps with `STEP_REMAP`. A remap target not yet built (Export)
  falls back to Review. The draft file is `{format: "pathways-narrative-cv-draft", version: 1, tool, savedAt, draft}`,
  without team notes, feedback answers or the session log. It refuses a file that is not a draft or that comes from a
  newer version, and it asks before replacing a draft already in the browser.
- **INFERRED:** a raw V6 or V7 browser draft saved as JSON (no wrapper) opens too; Save draft and Continue draft are
  plain placeholders until the rail (V7-4, V7-6) and the start page (V7-3) are built; the Order step stays in the rail
  until Phase 4 moves it into Review, so a draft saved on Order still opens on Order.
- **Smoke test** (browser, fixture `ncv_tool_v7/fixtures/v6-draft.json`, made-up content): the V6 offer appears on an
  empty V7 and opens the draft (2 contributions, 3 trainees classified doctoral / other "visiting researcher" /
  masters, `visited` set for every step with text) and leaves the V6 copy byte-for-byte unchanged; saved step
  `feedback` opens on Review and `xray` on Contributions; Save draft names the file
  `narrative-cv-draft-sshrc-2026-10-27.json` and the file reopens the same draft and step; a non-draft file and a
  version-9 file each get their message; no console errors; no request to script.google.com.

### Phase 1: start page, rail, buttons, 2026-10-27 (done, not committed)

- **Done:** V7-2 (header copy; the intro and guide sentence show on the start page only), V7-3 with its update ("Start a
  new draft →" as the card's top line, the new description), V7-3a (the "Narrative CV" title and a "← Start page" link
  at the top of the rail both return to the start page; nothing changes), V7-4 with its update (Set up your profile as
  its own task above **My application** and **Draft**; square markers and the "Fills in as you add contributions."
  caption on Draft), V7-5 (green once opened and something entered, from `visited`), V7-6 trial (metrics under each
  item and Draft so far past 200 words, behind `V7_TRIALS.railMetrics`), V7-7 (Back and forward name the step), V7-8
  (official section names as headings, no "Step ·"), V7-11 (welcome back without the flag count), D-3 (Reset draft
  beside Save draft on a phone, hidden from the banner there), D-12 (`pagesRange`, 500 to 600 words a page, in the
  rail), D-18 in part (4 px accent line on top of both start cards; small caps burgundy kicker from the step's group:
  MY APPLICATION, DRAFT).
- **INFERRED:**
  - The start page is a screen of its own (`start`), not a step; a draft with no path chosen always opens there.
    A returning researcher sees "Back to your draft →" with "Your draft is saved in this browser. You pick up where
    you left off.", which reopens the last step.
  - The privacy line keeps "The checks are fixed rules." from the mock-up.
  - The New draft card, being burgundy, takes its accent line in a darker burgundy (#5e1524).
  - The Profile's lede reads "These answers tailor the prompts and the examples to your application."
  - The early note and the closing note (V7-18) are in, with the new name.
  - Until Phase 4, the Draft group holds Order of contributions and Review; Export joins it then.
- **Waiting for its phase:** the Profile questions themselves (Phase 2), the Tailored for bar and See a finished example
  (Phase 3), Export and the email nudge (Phase 4).
- **Checked in the browser:**
  - Empty start page at desktop width: rail empty and quiet, both cards, no console errors.
  - New draft opens Set up your profile with "Contributions →" and the closing note.
  - With the fixture loaded, the rail shows "SSHRC · Mid career", "2 of 10", "9 trained", "1 of 7 answered", and
    "about 320 words, roughly 0.5 of 5 pages". Each step's kicker, heading and Back and forward labels are as listed
    above.
  - Start page and back again keeps the draft.
  - Phone at 375 px: the paths sit above the rail, metrics sit at the right of each item, and Save draft and Reset
    draft share one row.

### Phases 2 to 5: profile, writing steps, Review, Export, checks, 2026-10-27 (done, not committed)

Prem asked for the full build in one run. Built from the mock-ups (`ncv-v7-design/`), with the component styles ported
under `v7-` names. Every step now matches the approved mock-ups and Prem's mock-up review updates.

- **Phase 2, profile:** V7-13 (with Prem's update) to V7-18. One question revealed at a time; a choice stays selected
  where it is and the next question opens below; nothing folds, shrinks or moves on by itself; clearing an answer keeps
  the questions below it on screen. Agency cards with full names and the format as feedback; competition with
  Undecided and an optional year (this year and the next three); career stage; field with the Email us line (D-2);
  second field with "No, just this one"; work mode (moved from Contributions). The 4 px accent sits on the current
  question only.
- **Phase 3, writing steps:** V7-20 card pattern (open, filled and empty fields; eight-line static box; shrinks only
  when focus moves into another field; box kept in the page at 1 px, D-13; page held still while a field shrinks).
  V7-21 Contributions (instruction kept word for word, the guide link inside it). V7-22 examples with Prem's update
  ("See a finished example" filled and first; "See how it's built" switch). V7-23 checks note. V7-24 no marks. V7-25
  evidence view ("What you wrote" over a tinted evidence area, eight kind cards with examples, none pre-selected).
  V7-26 strip trial (`V7_TRIALS.paragraphStrip`). V7-27 Mentorship (totals tiles keeping "the last five years", D-1;
  person cards with stage and sector selects, D-9; How you mentor in the card pattern). V7-28 statement (one card, the
  first-sentence line, the cross-contribution read inside the problem and strands questions). V7-19 Tailored for bar
  with a real Change button.
- **Phase 4, Review and Export:** V7-30 (advisor features off the screens; data kept), V7-31 (order inside Review,
  ↑ ↓ at 44 px, focus kept on the moved card), V7-32 (working draft with Shrink and Show, At a glance with links that
  open the right card and field, length tile, self-check closing with the template sentence), V7-33 (Export step: Set
  up for line with Change, preview, Download or print, Paste into the template, Keep your work, contact line and the
  email nudge with the address as text), V7-34 (the statement after its first line is one paragraph in the Word file,
  print view, text file, section copy and preview).
- **Phase 5, checks:** `ncv_tool_v7/test-v7.js`, a headless test with no dependencies, passes 48 of 48: start page,
  profile, every card state, evidence, mentorship, statement, review order, At a glance links, every export, draft
  file round trip, V6 offer, migrations, phone width, reduced motion, no network request, no console errors. The
  example library checker passes (`lint` and `register`, 70 cells). Designer check (desktop and phone) and the advisor's
  build and voice review are both applied (below).
- **From the advisor's review (applied):** exports now include every contribution with any text (they had dropped a
  card with no headline or "What you did"); focus survives every re-rendering click; evidence letters on screen match
  the draft; the open field's accent moved to the top (D-18); a role with only a level chosen counts as answered. Copy:
  the privacy line ends "It leaves this device only if you email it."; strips say "Your answers appear here as one
  paragraph…"; the checks note says "You can continue without acting on them; they carry no score…"; the cross read ends
  "It is a suggestion only."; "0 described so far"; "Profile not set yet"; the career stage explanation drops its dash.
- **From the designer's check (applied):** links underlined (they showed only by colour); inline guide links at the
  sentence's size; phone nav row wraps with the note on its own line; one person per line in the draft preview and "1
  postdoctoral fellow"; the evidence remove button moved into its header row; one button size in each row; body text at
  1rem; work-mode cards wide enough not to break words; year and Undecided pills use the tint selected style; touch
  targets 44 px on phone; no stray "·" before Change; the first-sentence line reads as a sentence; privacy line with an
  icon and a 70ch measure; scroll padding under the sticky banner.

**INFERRED, for Prem's overrides:**

- A returning visitor sees "Back to your draft →" on the start page, which reopens the last step.
- Set up your profile has no Back button; the rail link and the title return to the start page.
- The evidence view replaces the writing fields with "What you wrote" and an Edit button, rather than shrinking them.
- The "Not sure yet" agency card's small line reads "You can change it later".
- The early "you can change these answers" note shows after Start a new draft only, not after a V6 or file import.
- On a phone the Tailored for pills sit on one line and fade at the right edge.
- A shrunk field shows a "Change" word at its right; the whole row is the one target (D-13).
- New wording: the agency feedback lines, the competition and year explanations, "The next question opens when you
  answer this one.", the Export intro and the Keep your work text, "under 0.5" pages for a short draft.
- Both trials are on (`railMetrics`, `paragraphStrip`).
- Kept from V6 as they were: the text file's "[gap]" notes (with dashes); the advisor packet builder stays in the file,
  unreachable.
- Not done in this run: the flow map redrawn for V7 (V7-37). It waits until Prem has reviewed V7.

### After review, 2026-10-28

- **DECIDED (Prem, 2026-10-28): the box you are in has a full outline and a light shade, with no coloured line on top.** The open writing field (`.v7-f.is-open`) and the current profile question (`.v7-qblock.is-current`) now have a 1.5 px burgundy border all round and a very light burgundy background (`--v7-open: #fcf7f8`). The writing box inside stays white. The three options shown are kept in `ncv-v7-design/active-box-options.html`. The boxes with a top line that mark a section (Tailored for, the example box, the Continue draft card) keep it.

- **DECIDED (Prem, 2026-10-28): moving between fields keeps the eye line still.** Mock-up: `ncv-v7-design/field-motion-mockup.html` (Today and Proposed). Built into `cardField` and `openField`:
  - Every field shows its label and question in every state, so opening a field only grows it downward, below the line being written. Before, the question and hint opened above the box and pushed the line down by about 117 px.
  - The field left behind shrinks in the same moment the new one opens (the 140 ms delay is gone), so the change is one movement.
  - The tool holds the line being written still (the box, or the answer of a filled field), where before it held the top of the field.
  - The open box starts at three lines and grows with the text, up to 60% of the screen, then scrolls. It replaces the fixed eight-line box.
  - The hint sits under the box as a short line with the ⓘ icon, with no grey panel. The role-level choice and the Personal statement cross-reference also sit under the box.
  - The "Change" link on a filled answer is gone; clicking the answer opens it, and its border darkens on hover.
  - The outcomes hint no longer repeats its question: it now reads only "If there is no change to report yet, leave this blank and put what you expect under What could change."
  - Test: two new checks in `ncv_tool_v7/test-v7.js` (the line moves 2 px or less; the box grows with the text). 50 checks pass.
  - INFERRED: the other hints were left as written. Most add funder guidance the question does not carry; Prem may want a pass on any that still feel repetitive.

- **DECIDED (Prem, 2026-10-28): an answered field shows only its label and answer; the question shows before you write and while the field is open.** CSS `.v7-f.is-filled > .v7-q`. When an answered field reopens, its question appears above the box and the tool holds the writing line still (test check added; 51 checks pass).
- **DECIDED (Prem, 2026-10-28): each Contributions question asks something more specific than its label.** The wording below is INFERRED, for Prem to confirm:
  - Headline: "What one line would let a reviewer recall this work?" (was "Give this contribution a headline.")
  - Stakes: "What problem did this work address, and who had it?" (was "Start with the problem. What was at stake, and for whom?")
  - What you did: "Which methods, sites or partners did the work involve, and at what scale?"; creative: "What did making the work involve, and which part was yours?" The hint is now only "Count where you can: how many sites, how long, how many people."
  - What resulted: "Which papers, datasets, tools, protocols or programs came out of it, and how many?"; creative and humanities variants follow the same pattern. The hint is now only "List the things themselves; their effects belong in the next field."
  - What already changed: "Who has used this work so far, and what is different for them now?"; community and health variants reworded; the social variant is unchanged.
  - What could change: "If the work is taken up more widely, which field, sector or population could it affect, and how?"
  - One moment: "Which one occasion shows the work reaching a specific person or group?"
  - Your role is unchanged; its question was already specific.

- **DECIDED (Prem, 2026-10-28): one box language across the tool.** A resting box has a 1.5px grey hairline on white. An active or selected box has a 1.5px burgundy hairline on the `--v7-open` shade. No box carries a top or left accent bar.
  - Start page: "Back to your draft" or "Start" is now the shaded box with a burgundy hairline and burgundy heading, in place of the solid burgundy card with a 4px top bar. "Continue draft" is a resting box.
  - Profile choices, contribution kinds and the open example button take the same selected shade as an open field. Their borders went from 2px to 1.5px.
  - The Tailored for bar and the example box lose their 4px top bar.
  - INFERRED: the format note, the early-career note and the closing note on Export lose their burgundy left bar. Each becomes a light grey box with a grey hairline, since it is information, not something selected. The dashed Add button is 1.5px.
  - Kept as they are: keyboard focus rings (needed for accessibility), the filled burgundy buttons, the coloured job bars in the read-through view, and the team-note panel (feedback is off).
  - The writing area inside an open field no longer adds its own glow on focus; the field's hairline and shade mark it. Inputs outside a field keep their focus ring.
  - Scope (DECIDED, Prem, 2026-10-28): V7 only. The website is not changed.

- **DECIDED (Prem, 2026-10-28): start page cards say what each one does, with the same arrow.** The main card reads "Start your draft" with a line explaining the action; the second card reads "Load your draft" (was "Continue draft"). Both cards carry one arrow at the bottom right; the arrow is no longer part of the main card's title. The Export step's save note now says "choose Load your draft".
  - INFERRED: when a draft is already saved in the browser, the main card reads "Continue your draft" (was "Back to your draft"), so it does not offer to start over a draft that exists.

- **DECIDED (Prem, 2026-10-28): Review and Export stay ghosted until there is enough to review.** On the rail they show in light grey with faded markers and do nothing when clicked (`aria-disabled`). The caption under them reads "Review and Export open once one contribution has a headline, your role and two more answered fields." The "Review your CV →" button at the end of the last section is disabled with the same line beside it. A saved draft or file that lands on Review or Export below the minimum opens on Contributions instead. Replaces the V7 "Fills in as you add contributions." caption.
  - INFERRED, for Prem to set: the minimum is one contribution with a headline, Your role (a line or a role level) and at least two of Stakes, What you did, What resulted, What already changed and What could change. Mentorship and the personal statement do not count toward it. One constant, `REVIEW_MIN_JOBS`, holds the job list.
  - Test: two new checks (ghosted and closed below the minimum; open once it is met). 53 checks pass.

- **DECIDED (Prem, 2026-10-29): a saved draft puts a Reset draft button inside the main start card.** "Continue your draft" appears whenever this browser holds saved work (V7 saves as you type in `localStorage` key `ncv-v7`); it does not come from the site. When work is saved, the card holds two buttons: the Continue area (title, line, arrow) and, at the bottom behind a thin rule, a small "Reset draft" button with the note "Clears the draft saved in this browser and starts again." Reset asks for confirmation, clears the draft and returns to the start page, where the card reads "Start your draft". With nothing saved the card is the single "Start your draft" button, as before. The top-bar "Reset draft" link stays. Prem: "we could continue working on the design, but for now, that's good."

- **DECIDED (Prem, 2026-10-29): the start cards carry no shade at rest; emphasis comes from size.** Burgundy outline plus shade means "open or selected right now" everywhere else in V7, so a shaded primary card on the start page teaches the wrong meaning and sets the wrong precedent for the design language. At rest both cards take the grey hairline on white. The primary card stays much wider with a larger burgundy heading (1.6rem, more padding); width and heading colour carry the emphasis. On hover or keyboard focus both cards take the burgundy outline and shade, which is the interaction state and matches the rest of the tool. The in-card rule above the Reset button is grey. Resizing the cards on hover was considered and rejected: the layout moves under the pointer, touch and keyboard users never see it, and text that matters belongs on the card all the time (Opus's reasoning, accepted by Prem as the way to go). Overrides: _none yet_.

- **DECIDED (Prem, 2026-10-29): the start page shows no rail; the rail fades in once the researcher picks a card.** Prem: the rail is "too distracting when you haven't started the process", so it should "only fade up once you confirm your choice". The start page now holds the intro and the two cards alone. Choosing Start your draft, Continue your draft or Load your draft opens the step with the rail fading in. A reload on a later step shows the rail at once, without the fade.
  - INFERRED: the fade is opacity only, 400 ms, ease-out, and it runs only on the move from the start page; it is off under reduced motion. The rail's progress counts (for example "Contributions 2 of 10") no longer show on the start page, since the rail is gone there; Continue your draft still names that the draft is saved.
  - INFERRED: without the rail the start page runs one column, and the two cards are capped at 720px so they line up with the intro text instead of running the full page width.
  - Test: the start-page check now asserts no rail; a new check asserts the rail fades in, empty and with the Draft caption, after Start your draft (55 checks).
  - Overrides: _none yet_.
  - INFERRED: the button label is "Reset draft" (matches the top bar), the card is a `div` holding two real buttons (no button inside a button), and the card's hover shade now sits on the Continue area only.
  - Test: one new check (two buttons in the card; Reset clears the draft and the card reads Start your draft). 54 checks pass.

## Overrides (Prem)

(empty)

## Queued notes, not built (Prem, 2026-10-29): Set up your profile

- **Rule (Prem):** if people can see it on the page, the text does not say it.
- **Lede:** drop "Six short questions…". Say what the answers change: the prompt questions, the fictional examples and the format template. Proposed: "Your answers set the prompts in each step, the fictional examples you see and the format template for your CV."
- **Progress:** replace "6 of 6 answered" with the standard row of squares, one per question, turning green as each is answered. Standardize on the response pages (Setup, Contributions cards, Mentorship, Personal statement). Screen readers keep the spoken count. Prem confirmed: the "standard square" is the existing row of round dots on the contribution cards, redrawn as small squares.
- **Sticky banner:** no sticky element for now. Prem: revisit once there is a production version.
- **Question vs info panel:** each panel adds context and the consequence of the choice only, never a restatement of the question or of a visible option. Repeats found:
  - Agency: "choose Not sure yet" and "you can change it later" (both visible elsewhere); the ✓ line after choosing FRQ repeats the panel's "requires the CV-FRQ for all grant applications".
  - Competition: "If you have not chosen one yet, choose Undecided" (the button is visible).
  - Field: "Pick the closest fit" (the question says "closest", and the line below says "choose the closest one").
  - Second field: "Pick one if your work spans two fields" (restates the question).
  - Work mode: "choose every one that fits" (the question says "Choose any that apply").
  - Career stage: no repeat found.
- BUILT (2026-10-29, pass A): `renderSetup` lede replaced; info panels trimmed (agency, competition, field, work mode; second field reworded to "With a second field, the Contributions step adds a worked example that spans both."); FRQ ✓ line now "✓ Format: the CV-FRQ."; "N of 6 answered" replaced by `progress(n, 6)` inside `.v7-qcount`. New helper `progress(n, t)` (wrapper `.v7-prog`, squares `.v7-dots i` 8px / radius 2px, hidden `.v7-sr` "n of t answered") also used in `contribCard`, How you mentor and Your statement headers; visible count text and the phone rule hiding the squares removed; `announceCount` calls kept.
- INFERRED: agency panel's last sentence became "If you are not sure which applies, the program's application guide names the format." (the Not sure yet button and "change it later" note stay visible elsewhere).
- INFERRED: field panel now ends "Changing it later leaves your draft as it is." (consequence only).
- BUILT (2026-10-29, pass B): the two notes that pointed to "Set up your profile in the steps list" now read "You can change these answers later with the Change button at the top of each step." The navRow note shows only when the top note (new drafts) does not, so the page carries it once. The waiting note under an unanswered question drops "You can also go straight to a step in the steps list" (the rail holds only Set up your profile before confirming).
- Overrides: _none yet_.

## Queued notes, not built (Prem, 2026-10-29): from profile into the application

- **Confirm step:** the end of Set up your profile has a confirm button in place of the plain "Contributions" button. Confirming moves the researcher into "Your application" with a proper header saying they start with their contributions.
- **Rail grows:** after confirming, the rail extends downward to show the application steps (Contributions, Mentorship, Personal statement) and the Draft steps.
- **Profile leaves the rail:** inside the application the rail drops "Set up your profile" and shows only the application. The profile appears as the top bar on each application page (the existing "Tailored for:" bar), with a clear Change button.
- **Continuing a draft:** with a confirmed profile, Continue your draft goes straight to the application, never to Setup.
- **Naming (Prem):** it is the researcher's narrative CV, not their application. The rail group "My application" and the application header become "My narrative CV". The confirm button needs a shorter label. Proposed: "Confirm profile".
- **Change edits in place (Prem):** the researcher stays on the page. Change expands the Tailored for bar downward into a minimal panel: the six answers as compact controls, with no question text or info panels, since the researcher already knows each field. A confirm button closes it and they continue; the page's prompts and examples update.
- **Reset in the Change panel (Prem):** the expanded panel also holds a reset button. Prem: it resets the whole draft and needs a double confirmation.
  - INFERRED: step one, Reset draft opens an inline warning in the panel ("This clears your whole draft from this browser: profile, contributions, mentorship and statement. A draft file you saved stays where you saved it.") with a Cancel button. Step two, the warning's own button "Clear my draft" asks the browser's confirm before clearing.
  - **DECIDED (Prem): two Reset draft buttons only, both with double confirmation, each worded for its context.** Keep the start card's and the Change panel's; remove the top-bar link and the phone-rail button. Every reset clears the whole draft.
    - Start card, step one: "Reset your work in progress and start a new draft?" Step two: "Are you sure? This clears your draft from this browser. A draft file you saved stays where you saved it."
    - Change panel, step one: "Reset your work in progress?" Step two: the same "Are you sure?" line.
    - INFERRED: step one is an inline warning with Cancel and a confirm button; step two is the browser's confirm box. Wording is proposed, from Prem's phrasing.
- INFERRED: Review and Export appear in the grown rail, ghosted until the review minimum is met, per the earlier DECIDED review-minimum rule.
- BUILT (2026-10-29, pass A): reset only. Top-bar `#v4-reset` link and the phone-rail `.v7-reset` button removed with their CSS. Start card "Reset draft" now calls `resetWarning(foot, "Reset your work in progress and start a new draft?", rs)` (inline `.v7-warn` with Cancel and "Clear my draft"; focus moves to the warning, Cancel and Escape return focus to the Reset button). "Clear my draft" calls `resetDraft()`, which shows the confirm "Are you sure? This clears your draft from this browser. A draft file you saved stays where you saved it." and clears. The Change panel is not built; it can call `resetWarning(panelEl, "Reset your work in progress?", resetBtn)`.
- INFERRED: Escape inside the warning cancels it; `resetDraft()` returns true or false.
- BUILT (2026-10-29, pass B): **Confirm profile.** With all six answered, Setup's forward button reads "Confirm profile" (`navRow` gained `opts.onNext`). `confirmProfile()` sets `ns.profileConfirmed = true` (in `defaultState`, saved with the rest of the state and in the draft file, since `buildDraftFile` copies every key outside DRAFT_SKIP), counts the event `profileConfirmed`, and goes to Contributions.
- BUILT (pass B): **Rail before and after.** `fillRail` shows only Set up your profile until the profile is confirmed; after it, only the groups "My narrative CV" (Contributions, Mentorship, Personal statement) and Draft (Review, Export, ghosted below the review minimum as before). On the confirming render the groups sit in `.v7-rail-groups.v7-rail-grow` (420 ms fade, slide and clip from the top; off under prefers-reduced-motion). `GROUP_LABEL.app` is "My narrative CV", which also sets the kickers.
- BUILT (pass B): **Setup and the application are kept apart.** `renderStage` sends a confirmed profile from `setup` to Contributions, and an unconfirmed one from any application or draft step to Setup. On Contributions, Back to Set up your profile is hidden once confirmed.
- BUILT (pass B): **Change in place.** `tailoredBar` Change (`#v7-chg`, `aria-expanded`, `aria-controls="v7-chg-panel"`) opens `changePanel()` inside the bar: Agency, Career stage, Field, Another field as selects; Competition as a text box with an Undecided toggle and a Year select; How your work happens as a pill group (`aria-pressed`). Field labels only, no questions or info panels. Focus moves to the first control; Escape or Change again closes and returns focus to Change. "Confirm" applies the answers, redraws the step (prompts, examples, section names follow) and returns focus to Change, with "Profile updated." spoken. "Reset draft" calls `resetWarning(panel, "Reset your work in progress?", btn)` then `resetDraft()`. `UI.chg` holds the open panel across redraws; `resetUI()` clears it.
- BUILT (pass B): **Continue and Load.** `resumeStep()`: with a confirmed profile, `ns.ui.lastStep` when it is an application or draft step (and not locked), else Contributions; without one, Setup. The start card's Continue and Load your draft both use it. The "Welcome back" banner shows only for a confirmed profile.
- INFERRED: migration. A saved draft or draft file with no `profileConfirmed` key counts as confirmed when it holds any application content (`appHasContent`: contribution text or evidence, statement, mentorship text, counts or people), with or without all six profile answers. Widened from the brief's "all six answers and content" so a researcher with work in progress (for example a V6 draft without a second-field answer) returns to their work; missing answers can be set in the Change panel. A draft without application content starts unconfirmed.
- INFERRED: the Change panel edits a copy. Confirm applies it; Escape or Change closes the panel and leaves the profile as it was (no half-applied profile behind a stale page).
- INFERRED: the panel puts the four single choices on one row and the competition and work modes on a row each, for a shorter panel; the work-mode label is "How your work happens". An unanswered select shows "Not answered"; the year select reads "Year (optional)".
- INFERRED: Save draft stays in the rail before confirming. Set up your profile shows no rail metric (the page has the progress squares).
- INFERRED: an open example stays open after Confirm and shows the example for the new answers.
- Overrides: _none yet_.

## Queued notes, not built (Prem, 2026-10-29): Contributions header and counts

- **Header:** after Confirm profile, the Contributions page opens under the kicker "My narrative CV" with a line saying the researcher is starting to build their contributions.
- **Card progress:** dots (squares) only in the working card; no "1 of 9 answered" text. Same as the Setup progress note.
- **Rail count:** next to Contributions, a plain number that rises as contributions are added, in place of "1 of 10". It shows one colour below the minimum and turns green once the minimum is met. Prem: "1 of 9" in the card and "1 of 10" in the rail read as the same kind of count and confuse.
- **Prem, follow-up:** no colour change; the number alone is enough.
- **Rail sub-rows:** under Contributions, a sub-row joined by an L-shaped connector line, holding the evidence count. The same number pattern applies to every rail step except Personal statement (Prem: "I assume").
- **Progress while drafting:** after Personal statement and before the Draft group, something like a "Review my draft so far" point. While filling in the CV, the researcher sees clear numbers, such as a running word count, so the work feels like it is progressing.
- **Rail state:** finished steps take one colour and the current step another; or the current step's circle becomes a triangle pointing at it.
- **Answers (Prem):**
  - Evidence sub-row shows the total across all contributions; the point is to see progress.
  - Personal statement: nothing shows when there is nothing to show.
  - The word count sits next to the Draft group label, kept simple: words and pages, abbreviated (for example "1,240 w · 2–3 pp").
  - Finished steps get a green circle; the current step gets a triangle and a bold label.
  - Mentorship: the main number is people trained; an L sub-row counts the people written up in "A few of the people you trained, and where they went", shown only from the first one. Label DECIDED (Prem): "People", which matches the page's "Person 1" cards and "+ Add a person". "Career" alone was rejected because it clashes with the profile's career stage.
- BUILT (2026-10-29, pass B): **Header.** Contributions opens under the kicker "My narrative CV" with the line "You start with your contributions." (`.v7-startline`) above the trimmed lede.
- BUILT (pass B): **Rail metrics** (`railMetric` now returns `{n, sub, sr}` or null). Contributions: a plain number, contributions with content (`liveContribCount`), no colour change; sub-row "Evidence N" (live evidence across all contributions) when N > 0. Mentorship: number = `mentorTotal()`; sub-row "People N" = `menteesDescribed()` when > 0. Personal statement: nothing. The number sits right-aligned on the label's row (`.v7-mt`, grid column 3); the sub-row (`.v7-rsub`) hangs off an L-shaped line drawn from the step's circle. Both are hidden from screen readers; the step's button says the same in words ("Contributions, 2 contributions, 1 evidence item, started").
- BUILT (pass B): **Draft count.** Beside the Draft group label: "1,240 w · 2–3 pp" (`.v7-rail-wc`, from `draftWords()`, pages from the same 600 and `WORDS_PER_PAGE` bounds as `pagesRange`, rounded to half pages), shown from the first word. Screen readers hear "Draft so far: 1,240 words, roughly 2 to 3 pages". The old "Draft so far" tally box and its length bar are removed with their CSS. The REVIEW_MIN_NOTE caption stays while Review is locked.
- BUILT (pass B): **Rail state.** A finished step has a filled green circle; the current step has a CSS triangle (pointing right at the label) in place of its circle and a bold burgundy label. Draft items keep their square when not current.
- INFERRED: below half a page the count shows words only ("69 w"); "p" for exactly one page, "pp" otherwise.
- INFERRED: Mentorship with people described but no totals shows the People sub-row without a main number.
- INFERRED: the current step's triangle and label are burgundy even when the step is also finished.
- Overrides: _none yet_.

## Queued notes, not built (Prem, 2026-10-29): Contributions lede and examples

- **Header:** already queued (kicker "My narrative CV", line on starting the contributions).
- **Lede:** simplify under the rule (no text about what is visible). Drop "The fields below break each one into parts" and "The example shows what that looks like". Proposed: "Describe up to 10 contributions that relate to this funding opportunity; they may differ from your most recent work. A contribution can be a single output or a group of related work, such as a cluster of papers, a program or a partnership. A few well-explained contributions are stronger than a long list. In the finished CV, each one reads as a single paragraph. The guide sets out what counts as a contribution." (Note: an earlier round kept this instruction "as Prem likes it"; this trims it, so Prem confirms.)
- **Example buttons:** "See a finished example" does not read as a button. Prem's options: a triangle that folds the example down, or the example open by default with the colour view on and a switch to turn it off (and whether that switch is needed at all).
- **Answers (Prem):**
  - Trimmed lede confirmed. Prem wanted room for the My narrative CV opening and no extra reading time.
  - Examples fold with a triangle (▸ to ▾), coloured when open. Prem: "I really want people to see the example." Proposed: open by default while the researcher has no contributions written, folded once they start.
  - Remove the colour on/off switch in the next build: the example is always coloured. No name is then needed for the colour mode.
  - "Six jobs" sounds odd. Proposed: "the six parts" throughout (button "How each part sounds in your field", legend, example footers).
- BUILT (2026-10-29, pass A): `renderContributions` lede replaced with the trimmed version (guideLink kept); "six jobs" became "six parts" in the example button ("How each part sounds in your field"), the shape-hints heading, both example footers and the hints footer ("Skip any part your record does not include"). Identifiers (`job:`, `SIX_LEGEND`, `REVIEW_MIN_JOBS`, the `jobs` example key) unchanged. Not built here: example triangles and removal of the colour switch.
- BUILT (2026-10-29, pass B): the +/− marker on the example buttons is a disclosure triangle (`.v7-tri`, ▸ rotated to point down when open; no transition under reduced motion). The See how it's built switch is removed with its CSS and `UI.built`; every example box is drawn coloured with its legend (`.v7-exbox.built`).
- BUILT (pass B): "See a finished example" arrives open on Contributions while no contribution holds text or evidence (`EX_DEFAULT`, `stepEmpty()` in `renderStage`).
- INFERRED: the same default applies to Mentorship and Personal statement: their example arrives open while the step holds nothing.
- INFERRED: the open-or-folded default is set on arrival at the step, so the example does not fold under the researcher while they type; once they have written something it arrives folded on the next visit. Closing or opening it by hand holds for the visit.
- Overrides: _none yet_.

## Queued idea, not built (Prem, 2026-10-29): "At a glance" visuals on the Review page

- **Prem:** on the Review page, below the draft, a quick visual overview of what the researcher added beyond the prose, built from the data the tool already collects. Meant as a small reward.
- Proposed visuals, all from data already in the draft (plain HTML and CSS, offline, no chart library):
  1. **Evidence by type:** a bar per evidence type (Peer-reviewed, Media / public, Policy / practice uptake, Dataset / tool, Award / recognition, Funding, Replication / citation, Other), counted across all contributions.
  2. **Six parts across contributions:** a small grid, one row per contribution and one column per part, with filled squares where the part is written. Shows balance at a glance (for example, impact thin across the board).
  3. **Your role:** contributions led, co-led and contributed to.
  4. **People trained, and where they went:** counts by level (PhD, master's, undergraduate, postdoc), and the "where are they now" split (university, industry, community agency, government).
  5. **Length against the page limit:** one bar split into contributions, mentorship and statement, against the agency's page limit.
- Proposed rule: descriptive only, with no scores, ratings or "good/bad" colours.
- **DECIDED (Prem):** build all five in the next pass.
- BUILT (2026-10-29, pass C, merged by the lead): `renderGlance` below the draft on Review and `renderGlanceExport` on Export ("Download all visuals"); five SVG visuals, each with "Download image" (PNG via canvas from a data: URL, 2x, no network call).
  - INFERRED (lead): the line under that heading reads "Drawn from the details you entered, beyond the prose." The first draft repeated the heading, which breaks the visible-text rule.
  - INFERRED: the section is titled "What your draft contains", since Review already has an "At a glance" heading (the Still missing and Length tiles).
  - INFERRED: the length visual stays although it overlaps the Length tile; it adds the split by section (contributions, mentorship, statement) against the page limit.
  - INFERRED (pass C): evidence with text but no type gets its own "Kind not chosen" bar; the evidence visual shows all eight types (zeros as empty bars); Your role counts only contributions with a role level chosen; the six-parts grid fills written parts with the part's colour and leaves unwritten ones as outlined white squares; each PNG carries its own title band; files are named narrative-cv-{evidence|parts|role|trained|length}.png; "Download all visuals" saves them 350 ms apart.
- **Export (Prem):** researchers can download the visuals as images. INFERRED: draw each visual as SVG so it can be saved as a PNG image in the browser (canvas), offline, with no network call; one "Download image" link per visual on Review, plus a "Download all visuals" option on Export.
- Overrides: _none yet_.
