# Narrative CV tool (V8 beta) — developer pointer

Clean address for **V8 beta**, forked on 2026-11-02 from V7 as it stood after the 20-round audit loop (commit `ada6b7f`).
V8 holds every fix from the loop; new work goes into V8. V7 was put back to the version before the loop (commit `f852933`)
and stays frozen as a reference.
This folder's `index.html` is a thin redirect.

| What | Where |
|---|---|
| **Source of truth** (all markup + logic, one file) | [`../narrative-cv-prototype-v8.html`](../narrative-cv-prototype-v8.html) |
| **Stylesheet dependency** | [`../styles.css`](../styles.css) (the tool's own components keep the `v7-` prefix) |
| **Headless test** | `node ncv_tool_v8/test-v8.js` (Node 22+, Google Chrome; no dependencies; about three minutes) |
| **Test fixture** (made-up V6 draft) | [`../ncv_tool_v7/fixtures/v6-draft.json`](../ncv_tool_v7/fixtures/v6-draft.json) |
| **Decisions so far** (DECIDED vs INFERRED) | [`../narrative-cv-v7-decisions.md`](../narrative-cv-v7-decisions.md) |
| **Audit loop log and findings** | [`../ncv_tool_v7/audit-loop-2026-10-31.md`](../ncv_tool_v7/audit-loop-2026-10-31.md) |
| **Open questions for Prem** | [`../ncv_tool_v7/questions-for-prem.md`](../ncv_tool_v7/questions-for-prem.md) |
| **Version history** (8.0 to 8.7; which one is on Cloudflare) | [`CHANGELOG.md`](CHANGELOG.md) |
| **Related versions** | V7 (frozen, the version before the audit loop): [`../ncv_tool_v7/README.md`](../ncv_tool_v7/README.md) |

Storage: the draft lives in `localStorage` under `ncv-v8`, so V7 and V8 can be tested side by side in one browser.
On a first visit, a V7 draft in the same browser (`ncv-v7`) is offered once; V7's copy is never changed. Draft files
saved from V7 open in V8 with **Continue draft**.

## Testing with researchers (Cloudflare and Neon), 2026-11-02

**Address for testers:** https://research-8kh.pages.dev/

The same V8 file is served by the Cloudflare Pages project `research` (`cloudflare/`). A Pages Function in the same project, `cloudflare/functions/api/tester.js`, records testers in a Neon database. The plain name `research.pages.dev` belonged to another account, so Cloudflare added the `-8kh` suffix. The project moved from a Worker to Pages on 2026-11-02 so the address could carry "research" without renaming the account's `immigrant-empire` Workers subdomain; the old `ncv-tool` Worker was deleted.
The GitHub Pages copy (`/ncv_tool_v8/`) keeps working with no sign-up and no network calls.

- **The questions** (since 2026-11-03) each answer an open question about the tool; the reasons are in [`tester-questions-proposal-2026-11-03.md`](tester-questions-proposal-2026-11-03.md).
- **Start page:** a sign-up card asks for an email and three questions:
  - what they are starting from;
  - when the application is due;
  - what concerns them most about writing a narrative CV.

  Sign-up is required (Prem, 2026-11-03): the card has no skip button, a browser that skipped before sees it again, and a saved draft opens no step until an email is entered.
  The card states in bold that nothing written in the CV is collected, and invites testers to send their draft to impact@concordia.ca to help improve the tool; the thank-you after the Export questions repeats the invitation.
- **While they work:** each step a signed-up tester opens is recorded as `last_step`, so drop-off is visible.
- **Export** (since V8.9, Prem 2026-11-12): at the foot of the page, after the email note, a card "Help us improve the tool" with a "Complete your feedback" button that opens five questions, sent against the same tester id (V8.8 had them on a Finish your test step, which is gone):
  - how much the tool helped with the concern they named at the start, from 1 to 5 (the question quotes it);
  - whether the questions and examples fit their kind of work, with a box for which ones (shown only after an answer other than "They fit");
  - what they will do with the draft next;
  - which parts they would reuse for the next application (choose any; "None, I would start again" clears the others), with a box for anything else;
  - the one change that would help most.
- **Feedback on each step** (V8.7, Prem 2026-11-12): a "?" Feedback on this step button sits above each step’s bottom row (not on the start page, and not on Export, which has the end questions). It opens a box with the reminder "This note goes to the Pathways to Impact team to help improve the tool. It is not part of your CV." Each note is sent as `note` with the step and the profile to the table `tester_notes`, at most 50 per tester. An unsent note is kept in the tester record. Since V8.8 the box closes after a send, focus returns to the button and a status line beside it thanks the tester and counts the notes. To read them: `select * from notes_by_step;`
- **What is never sent:** draft text.
- **Where the record lives in the browser:** under its own key, `ncv-v8-tester`, so Reset draft and Load your draft leave it alone.
- **Database:** Neon project `ncv-testing` (`lucky-tree-08109926`, AWS US East 1).
  - Table `testers`, with a `tester_summary` view; the schema is in [`cloudflare/schema.sql`](cloudflare/schema.sql).
  - To see who tested: `select * from tester_summary;`
- **Deploy:** `cd ncv_tool_v8/cloudflare && npm run deploy`. This copies the V8 file and `styles.css` into `public/` and deploys.
  - The Neon connection string is the Pages secret `DATABASE_URL` on the `research` project and is never in the repo.
- **Where it is switched on:** the sign-up is on only on `*.pages.dev`, or with `?tester=1` (used by the test script).

The endpoint is `POST /api/tester`:
- it accepts the tool's own origin only;
- it accepts posts of up to 16 KB;
- it keeps only the known answer keys, each up to 2,000 characters; a choose-any answer is kept as a list of up to ten options.
- Rows sent before 2026-11-03 used the first set of keys (`funding`, `before`, `want`, `useful`, `stuck`); there were none in the table when the set changed.

INFERRED in V8.19, for Prem to confirm or change:
- the editable box: Prem chose "the pencil in circle at the end of the box on the right side ... when over the circle appears". Read as: a plain pencil at rest, the circle on hover, focus and while open. The box then keeps its tint (it no longer turns solid accent, as blocks did in V8.18), so one rule covers a block, an evidence item and a person;
- a block too narrow for the pencil (under 60px) shows its number alone; on hover the circle takes the number's place. An empty block shows a plus, the sign the "+ Add" button already uses;
- a folded contribution is a row that opens a card, so it has the hover colours and no pencil;
- the editors (under a block, an evidence item or a person) lose the thick coloured bar on the left and take a 1px border in the accent. Prem's note reached this build through his "Design improvement" session: "i need this conform to our design we dont use the side color panel ?". The 4px accent stripe on blocks, legend swatches and the folded-row parts is left as it is; whether it goes too is his call;
- "one checklist ... before export download" is read as: the list lives on Export only. Review's five questions and the Mentorship question appear there in Review's words, above the five checks that were already there, each with "See on Review". The ticks and the ✓ on Review's tabs are removed. The heading stays "Before you export" until the vocabulary is settled;
- "I have checked this." is gone with the ticks, so no "reviewed" wording was needed;
- NOT built, waiting for Prem: his idea that marking something reviewed "just makes prompts disappear and you see the full text". One way to do it: on Contributions, a contribution with every part written can be switched to its paragraph as it prints, with "Edit" to bring the questions back. This overlaps the folded contribution and the paragraph strip, so it needs his word first;
- the vocabulary list (`VOCABULARY.md`) is a proposal. No term in the tool changes until Prem approves it.

INFERRED in V8.18, for Prem to confirm or change:
- each block on "Edit what changed" opens its own part, in a box under its row, on every screen width. The side panel that opened the whole contribution, and the Edit button on each row, were built in this version and removed before release (Prem, 2026-11-18: "it was better to be able to edit each block on their own");
- "at the beginning": Contributions already had a marker beside every part (written or not, select to jump), so no second map was added to the open contribution. The folded contribution now shows the seven parts as small blocks in Review's colours, in place of eight plain squares. They are not buttons; the row opens the contribution as before;
- one sign for "this opens for editing" on Review: a solid border and a pencil, on blocks, evidence items and people;
- the hover rule is the one the Pathways site uses on its pathway cards ("tint fill, disc inverts", read from the live page on 2026-11-18): a pale tint at rest, and on hover or keyboard focus the accent takes the border and the mark inverts to the solid accent. A block is the mark, so the whole block inverts. Evidence items, people and folded contributions are cards: white at rest, the site's burgundy tint (#f6e8eb) and a burgundy border on hover, and the pencil disc inverts. Corners on the blocks are 2px, as on the site. The tints on the blocks stay the tool's own (stronger than the site's) so that neighbouring parts can be told apart in a bar.

Seen in the design-principles run and left for Prem (not changed):
- the editable CV on Export shows that a part can be edited only on hover or focus. A mark at rest would clutter the page that prints;
- part colours are strong on the field labels (Contributions, Personal statement) and pale on Review's blocks. Same hues, two strengths;
- Mentorship opens with "The most persuasive thing in this section is one person...", a claim the voice pass on Review would have cut. The steps before Review have not had that pass.

INFERRED in V8.17, for Prem to confirm or change:
- the tab names are verb phrases for the edit made in each tab: "Reorder contributions", "Edit what changed", "Change your role", "Add evidence", "Check marked changes". The last tab has no edit of its own (it reads the marks back), so it says "Check". If these still do not work, the other option is to drop the tabs and list the five questions in full.

INFERRED in V8.15, for Prem to confirm or change:
- "the export window ... not at the bottom of your review" is read as: Before you export moves from the foot of Review to Export, between the CV and the downloads;
- the CV on Export is edited part by part (each part a box in the running paragraph), so an edit goes back to the part it came from. The sentences the tool writes (the first sentence, Totals, the trainee sentences, the evidence list) show as they print and are changed on their own step;
- the Mentorship chart replaces the ring (kept on 13 Nov) because the chart now has to show where people went. It covers the people you describe; the counted-only people stay in the group headings;
- the composition colours only tell contributions apart (six, then they repeat); none means better or worse;
- from the voice pass: the page line reads "You may find this step easier on a computer."; Prem's length line ("The length depends on the template, please review before submission.") is kept as he wrote it; the one "do not print" line sits at the foot of the Review board, and Contributions and Personal statement no longer say it;
- the Evidence question is now "Does each contribution show where others used the work?", so it matches its fact line (Fable's suggestion; Prem agreed, 2026-11-18, V8.16).

INFERRED in V8.14, for Prem to confirm or change (from Fable's walk-through, 2026-11-18):
- the strands are typed once, as short names (up to four) under the Strands question on Personal statement; Review reads them and links back. The prose answer cannot be read reliably, so it is not parsed;
- "None of these" is saved as an answer of its own (`strandNone`), so the tool can tell "none" from "not marked yet";
- the order fact line names only the first place where the order departs from the strands ("Your statement names “A” before “B”. Contribution 1 is marked for “B” and contribution 3 for “A”."), then any contribution marked None of these or not marked; a second line always says whether the statement ends with what is next;
- the board heading is "Five questions about your draft", since the page title is now "Review your draft";
- the tabs are standard tabs (← → Home End); the chosen tab and the hidden statement are remembered; each tab's tick uses the old self-check ids (Order = coherence, Words = significance, Role = ownership, Evidence = evidence, Reach = reach);
- each Order row keeps its words, page share and evidence count (Q-12), and its Save for later and Delete;
- Role: a list labelled "How were you involved?", with the role sentence under it and "Edit on Contributions";
- Reach: the question is "Do your words and evidence show the changes you marked?", so it can be ticked like the others; the fact line is a count ("You marked changes on 3 of 4 contributions: 5 already happened and 3 expected."), with "The marks are optional." when there are none;
- the change marks are two checkbox groups under each of the two boxes: "Who changed?" and "What changed?" under What already changed, "Who could change?" and "What could change for them?" under What could change. Already happened or expected follows from the box, so the two are equal and no item needs a second control. They show while the box is open;
- the old reach answers (`reachNow`, `reachCould`, `changeYear`) stay in saved drafts, unread and unshown; they have no match in the new marks;
- Mentorship: "current level" is the level the person trained at, and "next step" is where they are now; no field is added. The people are grouped by level, the curve chart goes, and the ring stays (you kept it on 13 Nov). The others counted but not described are named in one line;
- the working draft preview leaves Review; Export still has it;
- Lists to rewrite is held back on Export and in the .txt header too, for the same reason as on At a glance;
- the composition bar names a block only when the name fits (a contribution falls back to its number); every block carries its name on hover, and the legend lists them all;
- not built: evidence items pointing to the change they show (note of 17 Nov), left for a later round.

INFERRED in V8.13, for Prem to confirm or change:
- Threads is asked on Review, inside the Coherence question (as Reach is), not on the statement step; the strands are typed by the researcher (up to four, a few words each), since the tool cannot read them from the statement;
- a contribution can belong to more than one strand; "None of these" clears its marks;
- the change year is one optional four-digit year per contribution, a column in the Reach table; it is shown there only and not used in any fact line yet;
- removing a strand also removes its marks from every contribution.

INFERRED in V8.12, for Prem to confirm or change:
- the evidence kinds that count as "Where others used it": Policy / practice uptake, Media / public, Replication / citation and Community document (Award / recognition and Funding stay with "What you produced");
- the Reach of change answers are asked on Review itself, in the table, rather than on each contribution; the six levels are People, Organization or community, City or region, Province or territory, Country, Field;
- Threads and the optional "When did the change happen?" year are not built yet (built in V8.13);
- the working draft stays open by default, below the questions, with Shrink;
- Selection and Specificity move to Before you export as plain ticks, since the tool has no data that answers them;
- for a community-engaged profile, the Ownership question adds "Each one should make your own part clear and name the parts the partners led or hold.";
- edits made on Review (a part of a bar, an evidence item) save straight to the draft.

INFERRED in V8.11, for Prem to confirm or change:
- the profile name is the draft name from the start page (one name, used in the file names and in "Continue …"), typed straight into the Profile box; the box shows "Name this profile" until a name is given; the name does not appear in the exported CV.

INFERRED in V8.8, for Prem to confirm or change:
- the Other list's groups (Research staff, Residents or clinical fellows, Community researchers, Visiting researchers, A mix of these, Something else) and that it sits on its own row under the boxes, since it was cut off inside the Other box;
- the people section's line "where you can, some whose work relates to this application" is advice; no funder rule was found that requires it;
- the number messages: "This part asks how large the work was…" (What you did) and "If you can, give a number for what changed…" (What already changed);
- the copy sweep's choices: which help lines were cut or trimmed, "Review uses your choice to show your role…", "The suggestions under your answers come from fixed rules", "who keeps it" for "who holds it", "surveys" for "instruments";
- Setup's triangle follows the question that holds focus, once all six are answered.

INFERRED, for Prem to confirm or change:
- the feedback box: its question ("What was clear or confusing in this step, and what would help?"), the reminder wording, a tester may send several notes per step, and the box shows on testers’ copies only;
- the wording of the answer options (the questions were agreed in chat on 2026-11-03);
- the sign-up card replaces the path cards and every step until the tester signs up;
- the end questions sit at the foot of Export behind "Complete your feedback" (Prem, 2026-11-12); the card heading "Help us improve the tool" and its one-line intro are INFERRED;
- the privacy wording on the card (Prem, 2026-11-03: the line on what is sent and where it is stored was taken out; the card says the information is deleted when this version launches at the end of the year, and gives impact@concordia.ca for questions);
- the address `research-8kh.pages.dev` (a custom domain can replace it later).

## Prem's answers of 2026-11-03, built in V8

The answers are in [`../ncv_tool_v7/questions-for-prem.md`](../ncv_tool_v7/questions-for-prem.md), under Answered.

- **Q-26:** check messages say "part"; every save button reads "Save a draft file".
- **Q-7:** the tool's own strings use curly apostrophes. The prestige-term patterns keep straight ones, so they still match what a researcher types.
- **Q-20:** three more role levels for every researcher: "The partners led it, and I took part" (`partnerled`), "I made it with others" (`cocreated`) and "I did it on my own" (`alone`). The Your role chart lists all six.
- **Q-21:** four more destinations for every field. Long-term care moved out of the health-system label into its own option.
- **Q-24:** Preprint, Conference talk or poster, and Teaching or curriculum. They have their own hints, and the Peer-reviewed and Other hints no longer send preprints to Other.
- **Q-13:** a card counts its required parts only (8), shown as "8 of 8" beside the squares.
- **Q-10:** an optional Draft name on the Continue card, described by "Last updated" and the date the draft's content last changed (`contentAt`). The name heads the card and goes into the draft file's name.
- **Q-11, Q-12:** on Review, each order card shows its words and its share of the five-page budget, with two choices:
  - Save for later: the contribution is kept, does not print or count, and is listed under Saved for later. Put back returns it last in the order.
  - Delete: asks first, then removes the contribution.
- **Q-15:** Save a draft file in each step's bottom row (Export has its own).
- **Q-14:** profile pills wrap on narrow screens.
- **Q-25** (a commit of its own): a closed, filled field's visible answer is the control. It is a button in the Tab order, named by the part's keyword and the answer, so a voice-control user can say what they see. The shrunk box leaves the Tab order and the accessibility tree until the field opens. Tab moves from answer to answer; Enter or a click opens the field on its box.
- **Q-17:** the start page's path cards are h2, so no heading level skips. They look the same as before, and `styles.css` is unchanged.

INFERRED, for Prem to confirm or change:
- the short chart labels for the new levels and destinations;
- the hint wording for the new evidence kinds;
- "College, CEGEP or school" and "School or school board" both name schools; they are kept as Prem approved them;
- the Draft name sits on the Continue card, once a draft exists;
- the share is of the whole five-page budget;
- Delete has no Undo; it asks first instead.
