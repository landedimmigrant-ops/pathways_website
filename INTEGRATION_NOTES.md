# Content Backend — Integration Notes

Running log of attempts to connect a coordinator-friendly database to the site.

## Goal

- Coordinator edits workshops / services / resources in a friendly UI (no code)
- Site fetches content as JSON at runtime (or build time)
- Each record carries a `bookingUrl` pointing to the provider's Microsoft Bookings page
- Zero or near-zero recurring cost

## What we tried

### Attempt 1 — Microsoft Lists + Power Automate HTTP endpoint

Plan: personal MS List for workshops → Power Automate flow with `When an HTTP request is received` trigger + `Get items` + `Response` → site fetches the HTTP URL.

Outcome: **blocked by licensing.**
- HTTP trigger and Response actions require a **Power Automate Premium** license (moved out of free tier by Microsoft in 2023).
- Free 90-day trial exists but isn't a sustainable answer.

### Attempt 2 — Microsoft Lists + Power Automate scheduled flow → OneDrive JSON file

Plan: scheduled flow runs daily → `Get items` → `Create file` on OneDrive → share the JSON file publicly → site fetches the public URL.

Outcome: **blocked by tenant policy.**
- Flow built and ran successfully; `workshops.json` created in `/Apps/pathways/` in OneDrive.
- Sharing options limited to "People in Concordia", "Only people with existing access", and "People you choose" — **no "Anyone with the link"** option.
- Concordia's M365 tenant has disabled anonymous external sharing. A public static site cannot fetch an authenticated OneDrive URL.

## Where we ended up

- MS List `workshops` exists on Prem's personal OneDrive.
- Working Power Automate scheduled flow exists (generates `workshops.json` to OneDrive daily).
- The file is not publicly reachable — dead end for runtime fetch.

### Attempt 3 — Google Sheets + gviz CSV endpoint ✅ WORKING

Plan: import `workshops.csv` into a Google Sheet tab → share "Anyone with the link" → fetch from the site via Google's gviz CSV endpoint → parse client-side.

Outcome: **works.**
- Sheet ID: `1IQGINsUTQMWLm4IJY49dr76pMeWkIH_vj-aLnj9jD1Y`, tab: `workshops`
- Endpoint: `https://docs.google.com/spreadsheets/d/<ID>/gviz/tq?tqx=out:csv&sheet=<TAB>`
- No third-party proxy, no auth, no licensing, no tenant blockers
- Edits in the sheet show up on the site within ~1 min after a hard refresh
- Note: must run the site via `http://` (e.g., `python3 -m http.server`), not `file://` — browsers block cross-origin fetch from `file://`

### Implementation

- `WORKSHOPS_SHEET` config block in `app.js` (enabled flag, sheet ID, tab name)
- `parseCsv()` — minimal RFC4180 parser
- `fetchWorkshopsFromSheet()` — returns the same manifest shape the existing loader expects
- `loadWorkshopContent()` — branches on the flag; falls back to `content/workshops.json` if disabled
- Markdown bodies still load from local `content/workshops/*.md` via the `file` column

### Attempt 5 — Bookings via MS Bookings (Phase 2) ✅ WORKING (new-tab redirect)

Plan: put a per-service Bookings URL in the sheet's `bookingUrl` column; clicking the card's Book button opens it.

Outcome: **works as a new-tab redirect.** Iframe embed was the intended UX but MS Bookings sets `X-Frame-Options: DENY`, which no iframe trick gets around.

- Smoke test used Prem's existing **Bookings with Me** "15 minutes meeting" page (`/bookwithme/user/...?anonymous`). Anonymous booking works — no sign-in required.
- First cut tried iframe-with-fallback; iframe returned blank because X-Frame-Options blocks rendering but still fires the `load` event (so timeout-based detection didn't fire). Removed in favor of direct new-tab open.
- Final UX: click **Book** on a card with `bookingUrl` → `window.open(bookingUrl, "_blank", "noopener")` → MS Bookings opens in new tab → user picks a time → Teams invite mailed.
- Rows without `bookingUrl` keep the prototype Formspree "request" form.
- `BOOKINGS.enabled` flag in `app.js` to kill-switch if needed.

**Update 2026-05-07** — shared mailbox set up + embed re-tested:
- New shared booking page live at `https://outlook.office.com/book/PathwaysToImpact@liveconcordia.onmicrosoft.com/`. This is the durable home for booking URLs (survives staff turnover); replaces dependency on Prem's personal *Bookings with Me* page.
- Re-tested the exact iframe snippet from the Bookings admin "Embed" tab against this new shared page (`<iframe src='https://outlook.office.com/book/PathwaysToImpact@liveconcordia.onmicrosoft.com/?ismsaljsauthenabled' width='100%' height='100%' scrolling='yes' style='border:0'></iframe>`). **Still blocked** — iframe fires no `load` event within 7s, browser refuses to render, X-Frame-Options remains DENY. This is consistent across Bookings with Me, personal Bookings, and shared Bookings pages — Microsoft's protection applies tenant-wide and isn't toggleable from the Bookings admin UI.
- Conclusion: the iframe path is permanently closed unless we move to a Graph-API custom UI (Option A in BOOKINGS_PLAN.md → "Staying on the page") or switch providers (Option B). Both remain out of scope.
- Decision: **stay on the new-tab redirect** as the production UX. Pending action: update sheet `bookingUrl` cells to per-service URLs from the shared page so the durability win lands.

### Attempt 4 — All three content types on the same sheet ✅ WORKING

Plan: add `opportunities` and `external-resources` tabs alongside `workshops`, fetch all three in parallel before first render.

Outcome: **works, edits show up instantly after hard refresh.**
- `WORKSHOPS_SHEET` config replaced by broader `SHEETS` config (same sheet ID, `tabs: { workshops, opportunities, externalResources }`)
- `fetchSheetRows(tab)` shared helper
- `mapOpportunityRow()` rehydrates `details.{who,what,outcomes}` from flat CSV columns, splits `;`-delimited pathway/tags/stage
- `loadExploreContentFromSheets()` mutates `data.explore.opportunities` and `data.explore.externalResources` before `buildPages()` runs — no page-building code had to change
- External resources keep `stage` as an array (matches existing shape); opportunities use single string unless multi-value
- Sheet is authoritative — no silent fallback to local `data.js` (failure logged loudly)

### Attempt 6 — Workshop bodies from published Google Docs ✅ WORKING (smoke-tested in production)

Plan: workshop body content was the last thing still living in local `content/workshops/*.md`. Coordinator can't edit those without git access. Move bodies into Google Docs (one Doc per workshop), use Docs' Publish-to-web feature, store the resulting `/pub` URL in a new `docUrl` sheet column, fetch and render at runtime.

Outcome: **works end-to-end.** First production workshop migrated (Library RDM "Data Management Plan Consultations") rendered cleanly without manual Doc reformatting. Remaining 10 workshops to follow at the coordinator's pace.

#### Sheet-side additions

- New `docUrl` column on the `workshops` tab (e.g. `https://docs.google.com/document/d/e/<long-id>/pub`)
- New `provider` column on all three tabs (e.g. "Office of Research", "Library RDM Team") — rendered as "Offered by …" line on cards and as the first item in the modal meta-bar
- Old `libcalUrl` column removed end-to-end (LibCal subscription was never activated)

#### Code-side helpers (in `app.js`)

- `fetchWorkshopBodyFromDoc(docUrl)` — fetches the published HTML, extracts `#contents`, walks the DOM, rebuilds with allowlisted structural tags (h1–h4, p, ul/ol/li, strong/em/b/i, a, br)
- `sanitizeDocNode` — drops `<style>`/`<script>`/`<head>`/etc. entirely (subtree included), unwraps `google.com/url?q=` redirects, adds `target="_blank"` to external links
- `postProcessDocHtml` — coordinator-friendly cleanup pass:
  1. Merges adjacent `<ul>`/`<ol>` (Google emits one per bullet)
  2. Drops redundant `Title:` / `Tags:` / `Tags#:` lines (already in sheet)
  3. Merges paragraphs Google soft-broke across visual line wraps (continuation = lowercase first letter)
  4. Auto-promotes heading-shaped `<p>` to `<h2>` via known-labels list (*Short Description*, *Outcomes*, *Format*, *Who it's for*, etc.) plus shape heuristic (≤70 chars, no terminal punctuation, ≤6 words, title-cased)
  5. Drops orphan `<h2>` blocks with no body content following them
- `extractDocSummary` — pulls the first body paragraph ≥40 chars as the card preview; falls back to whatever the sheet has if Doc is unreadable
- `loadWorkshopContent` — per-entry: prefer `docUrl` → fall back to `entry.file` (local `.md`) → metadata-only (no body) for tool entries

#### Why this shape

- **Why publish-to-web, not Drive API:** no auth, no API key, no quota. Plain page fetch. Concordia tenant returns proper CORS headers (`access-control-allow-origin` reflects the requesting origin) so it works from a static GitHub Pages site without a proxy.
- **Why we didn't shove markdown into a sheet cell:** long multiline bodies make the sheet UI unreadable and break the per-row mental model.
- **Why we wrote a smart parser instead of asking coordinators to use H2 styles:** training cost > engineering cost. The parser is ~80 lines and handles the messy default output of "write your Doc however feels natural." The alternative was a process doc that says "format every section heading as Heading 2 manually," which is exactly the kind of friction we're trying to eliminate.

### Attempt 9 — Learn-section guide content via labelled slot files ✅ WORKING

Plan: the Learn section's deeper guides (first one: *What is a Narrative CV?*) have rich custom layouts — numbered sections, callouts, comparison tables, expandable accordions, concern/reality boxes. Migrating them to the existing workshop `docUrl` flow would lose all of that (the workshop parser strips tables and doesn't know about callouts/expandables/etc.). Building a generic rich-layout markup parser is real engineering for content that doesn't change often. Middle path: keep the layout in JS, move the **prose** into a labelled file/Doc, build function reads each text block from a slot dictionary by label.

Outcome: **works for the Narrative CV guide.** Layout untouched; every text block in the guide is now editable in `content/learn/narrative-cv-guide.md` (or, when wired, a published Google Doc) without a code change. 65 slots loaded on first run.

#### File-side
- New `content/learn/narrative-cv-guide.md` with one `## slot-label` heading per editable text block, and the prose underneath. Slot labels are dot-separated identifiers (`s1.lead`, `s2.cards`, `s3.callout.body`, etc.).
- Lists use `- bullet` lines; tables and 2-column structures (myth concerns/realities, section cards) use one pipe-separated row per line; horizontal rules `---` are stripped during parsing so they can be used as visual separators.

#### Code-side helpers (in `app.js`)
- `LEARN_GUIDES` config near `BOOKINGS` — per-guide `{ docUrl, localPath }`. Doc URL takes precedence when set; falls back to local `.md` if Doc fails or is unset.
- `parseSlotMarkdown(md)` — splits a markdown source on `^## slot-label$` headings, returns `{label: rawString}` (HR lines stripped).
- `parseSlotsFromDocHtml(sanitizedHtml)` — same shape from a published-Doc DOM. Walks child nodes; each `<h2>` whose text matches a slot label starts a new slot, following `<p>`s/`<ul>`s become its value (`<li>` children get `- ` prefixed so list parsing matches the `.md` path).
- `fetchGuideSlots(guideKey)` — fetches Doc (preferred) or local `.md`; returns `{}` on any failure (builder fallbacks take over, never crashes).
- `loadLearnGuideContent()` — pre-loads all guides in parallel, stashes results in `content.learnSlots[guideKey]`.
- Wired into `init()` alongside `loadWorkshopContent` / `loadExploreContentFromSheets`.

#### Builder refactor
- `buildNarrativeCV101()` declares 4 slot helpers at the top: `slot(name, fallback)`, `slotPara(name, fallback)`, `slotList(name, fallback)`, `slotRows(name, fallback)`. Each falls back to a hardcoded default if the slot is missing or empty.
- Every text string in the original 130-line builder is now wrapped in one of those helpers. The hardcoded fallbacks are the original strings — partial migrations or fetch failures degrade to the previous behaviour, never blank.

#### Why this shape
- **Why labelled slots, not section-positional reads:** positional reads (e.g. "the second paragraph in section 3") break the moment a coordinator inserts or removes a paragraph in the file. Labels are stable; the order in the file is for human readability only.
- **Why keep layout in JS:** the Narrative CV guide has 6 distinct rich layout elements (callouts with optional colour mod, comparison tables, accordions, paired concern/reality boxes, tag rows, section cards). A generic markup vocabulary that covers all of this is a real engineering investment for an asset that doesn't change layout often. JS layout + slotted prose is the 80/20.
- **Why a markdown file instead of HTML:** prose-with-bullets reads cleanly in a `.md`; HTML noise in a content file ages badly and intimidates non-technical editors. The markdown source also pastes directly into a Google Doc when we wire that up — same `## label` convention works on both sides.
- **Why a Doc fallback to a local `.md`:** during the beta, the local `.md` is the source of truth and edits ship via GitHub web UI. Switching a guide to a Doc is a one-config-line change (`docUrl: "<published-pub-url>"`), at which point the Doc takes over without touching builder code.

#### Adding a new guide
1. Create `content/learn/<guide>.md` with the slot labels the layout needs.
2. Build the JS layout function alongside it, calling slot helpers with hardcoded fallbacks for every text block.
3. Add an entry to `LEARN_GUIDES` (`localPath` set, `docUrl` blank).
4. When the coordinator wants Doc-based editing for that guide, publish a Doc with the same `## label` Heading-2 convention, paste its `/pub` URL into `docUrl`. Done.

### Attempt 8 — Capacity status & waitlist (manual sync) ✅ WORKING

Plan: when a workshop or consultation fills up, the site needs to show that, stop the booking flow, and start a waitlist. MS Bookings is the source of truth for "how many seats remain" but exposes no public read API — the Graph API path requires Entra app registration + admin consent (real IT blocker, see BOOKINGS_PLAN.md). Rather than block on IT, ship a coordinator-driven `status` column on the existing sheet and revisit automation later.

Outcome: **works.** Coordinator types `full` / `cancelled` / blank into a new `status` cell; the site renders a pill on the card and swaps the booking button for a waitlist form when full. Waitlist signups go to the existing Formspree inbox tagged `intent: waitlist`.

#### Sheet-side additions
- New `status` column on `workshops` and `place_holders` tabs.
- Recognised values (case- and whitespace-insensitive): blank/`open` (default), `full`/`fully booked`/`booked`/`waitlist` → bookings off + waitlist on, `cancelled`/`canceled`/`off`/`closed` → bookings off + no waitlist.
- `external-resources` doesn't take bookings, so the column isn't needed there.

#### Code-side helpers (in `app.js`)
- `normaliseStatus(raw)` — the value table above. Mirrored in `scripts/bake.js`.
- `getStatus(opp)` — convenience wrapper.
- `statusPill(status)` — returns a small DOM pill or null. Used in 4 card render sites: home Featured, pathway tab grid, research-stage panel, browse all.
- Card render: pill is appended to `card-header-meta` after the format badge; cards in non-open states get an `is-full` / `is-cancelled` modifier class for subtle visual treatment.
- Detail modal CTA: button text becomes "Join the waitlist" when status=full; replaced with a static note when status=cancelled.
- `openBookingModal`: when status=full, skips the MS Bookings new-tab redirect and falls through to the form path with `isWaitlist=true`.
- Form in waitlist mode: title becomes "Join the waitlist", banner explains why, intent radio is hidden and pre-set to `waitlist`, hidden `service_status` field carries the status into the payload, submit button reads "Join waitlist", confirmation copy adapts.

#### CSS additions
- `.status-pill` with `--full` (red) and `--cancelled` (grey) variants.
- `.modal-status-note` — inline note under modal CTA when full/cancelled.
- `.booking-waitlist-banner` — red callout inside the booking modal in waitlist mode.
- `.popular-card-header` — header strip for home Featured cards (didn't have one before; needed somewhere to put the pill).
- `is-full` / `is-cancelled` modifiers on `.opportunity-card` and `.popular-card` (subtle desaturation).

#### Why this shape
- **Why a `status` column rather than auto-detection from MS Bookings:** no public API for capacity, Graph API needs IT-approved Entra app, and coordinator latency (sheet edit → ~1 min to live) is acceptable since people don't book at second-by-second resolution.
- **Why same Formspree endpoint as regular requests, not a separate inbox:** simpler workflow. The `intent: waitlist` and `service_status: full` tags let the coordinator filter waitlist signups from the same inbox; can split later if volume justifies.
- **Why no waitlist count on the card:** we don't have one — Formspree submissions aren't piped back into a counter, and adding one would mean spinning up a backend just to track it.
- **Why surface "FULLY BOOKED" as an additional pill rather than replacing the time pill:** timing is still useful info even when full ("a fully-booked Nov 15 session is different from a fully-booked recurring one"). Tradeoff: three pills can feel busy on narrow cards. Reconsider if it visually crowds.

#### What's parked
Phase 2 — automated sync (Power Automate, scheduled Claude Code agent, or hybrid). Three options scoped in [BOOKINGS_STATUS.md](BOOKINGS_STATUS.md). Triggers for unparking: coordinator says manual flipping costs >15 min/week, or >5 services running concurrently with mixed availability, or "tried to book and it was already full" reports start coming in.

### Attempt 10 — Bug-and-feature triage pipeline (read sheet → fix → write back commit SHA) ✅ WORKING

Plan: Prem already files bugs / copy fixes / content suggestions in a published Google Sheet (3 tabs: general bugs, NCV tool feedback, content to mirror). The pattern was proven ad-hoc by commit `d97931c "Bug-fix batch from BUGS sheet"`, but with no row IDs and no trail back from a row to the commit that shipped its fix. Formalise it: a `/triage` slash command pulls all 3 tabs as CSV, surfaces open rows, drives a per-fix loop, and POSTs status + 7-char SHA back to the sheet via a small Apps Script webhook bound to the sheet itself.

Outcome: **works end-to-end.** First fix delivered through the loop is **B-05** — *"Back to All Resources" jumping to browser home on cold-load deep links* — verified in preview against `#explore?service=…` cold reload.

#### Sheet-side additions (coordinator does once)
- New columns on all 3 tabs: `id` (autonumbered `B-`/`N-`/`C-`), `type` (`bug`/`copy`/`feature`/`content`).
- Standardised `status` vocabulary: `New` · `Triaged` · `In Progress` · `Done` · `Won't fix` · `Needs info`. (Old `Complete` → `Done`; blank → `New`.)
- Existing `commit tested` column finally gets used: receives the 7-char SHA when a fix ships.
- Documented in COORDINATOR_GUIDE.md → "Bug & feedback triage".

#### Webhook (Apps Script bound to the sheet)
- `doPost` handler reads `{ secret, updates: [{ id, status, commit }] }`. Authenticates against a shared secret, walks every sheet, matches by `id`, writes `status` and `commit`. Returns `{ ok, results }`.
- Web-app deployment: *Execute as = me*, *Access = anyone*. URL kept private (the secret is the auth boundary, not the URL).
- One Apps Script project per sheet; ~40 lines, no external libraries.

#### Slash-command side (`.claude/commands/triage.md` — gitignored)
- Sheet CSV URLs (one per active tab via `pub?gid=…&single=true&output=csv`) and the webhook URL/secret live in the command file. Comparison/inspiration tab (gid=1652606154) is ignored — not actionable backlog.
- Loop body: pull → filter to open statuses → grouped triage report → user picks → **branch off `integration-prototype`** (`triage/<id>` for single fix, `triage/<date>` for batch) → per-row fix workflow (read code, propose, implement, preview, sign-off) → **commit on triage branch** with ID in subject → **merge to `integration-prototype` with `--no-ff` and push** (only on explicit user sign-off) → **POST writeback after push lands** → report result. Fallback to read-only if the webhook errors.
- File is `.gitignore`d at the repo root since it embeds the shared secret.

#### Feature-branch workflow (added so live site never sees half-baked fixes)
- All fix commits land on `triage/<batch>` branches off `integration-prototype`, not directly on the deployed branch.
- Merge uses `--no-ff` so the batch shows as a single mergeable unit in `git log` (and revert-able as a unit via `git revert -m 1 <merge-sha>`).
- Writeback to the sheet happens **after** the push to `integration-prototype` succeeds — so a `done` row in the sheet always means "live on the public site," not "fixed in a feature branch." If a fix is reverted, the writeback never happens (or is itself reverted), and the row stays in `triage` / `In Progress`.

#### Apps Script response quirk
- POST to `/exec` returns a 302 → `googleusercontent.com/macros/echo?...` with a single-use `user_content_key` token that wants browser cookies. `curl -L` follows the redirect but the target serves a generic "Page Not Found" — the response JSON is unreachable from a bare HTTP client. **The script ran fine; the response delivery is the only thing broken.**
- Workaround baked into `.claude/commands/triage.md`: **don't read the response. Verify side effects by re-pulling the affected tab's CSV.** For read-only actions like `list_tabs`, substring-match tab names hard-coded against the known set instead.

### Attempt 11 — User-testing snapshot at /testing/ ✅ WORKING

Plan: a research user-test was about to go out. GH Pages only serves one branch per repo, so the same URL was both dev (where coordinator-facing fixes ship continuously) and test (what researchers see during their session). Need to decouple so dev iteration doesn't change the test version mid-session.

Outcome: **works.** Stood up a frozen snapshot at `landedimmigrant-ops.github.io/pathways_website/testing/` (the `/testing/` subdirectory of the same Pages site). Dev URL stays unchanged at the root so the coordinator's existing bookmarks keep working. Snapshot refresh is one shell script + push.

#### How it's wired
- `scripts/snapshot-testing.sh` — five-step pipeline: (1) `node scripts/bake.js` refreshes `content/data/*.json` from the live sheet; (2) wipe and recreate `/testing/`; (3) `cp` SPA assets + `content/` + `resources/` + `pathways_to_impact.md` into `/testing/`; (4) `sed` flip `SHEETS.mode: "live"` → `"baked"` in `/testing/app.js`; (5) banner rewrite + cache-bust stamp (`v=frozen-YYYY-MM-DD`) in `/testing/index.html`.
- `/testing/` is a sibling-folder GH Pages serves alongside the root. Relative asset paths (`href="styles.css"`, `src="app.js"`) resolve correctly because the SPA never uses absolute URLs.
- Test version reads from `/testing/content/data/*.json` (baked) — completely isolated from coordinator sheet edits.
- Banner reads *"User testing version (frozen snapshot) · Updated YYYY-MM-DD"* so testers know which version they're on. Dev banner unchanged.

#### Refresh cadence
- Manual, on-demand. The script wipes and rebuilds `/testing/` cleanly each run — idempotent.
- Workflow: `./scripts/snapshot-testing.sh && git add testing/ content/data/ && git commit -m "Refresh testing snapshot (YYYY-MM-DD)" && git push`.
- Typical cadence during a 1-3 week user-test: refresh once or twice if a tester-blocking issue surfaces. Otherwise leave alone.

#### Why this shape
- **Why subdirectory not separate repo:** zero new infrastructure (no second repo, no GH Pages reconfiguration, no second host). Coordinator's URL stays the same; testers get a path qualifier they only need once via the link share-out.
- **Why baked content not live sheet:** "frozen" has to mean *both* code and data. A sheet edit that changes a workshop time mid-test would surface immediately on the test URL otherwise — defeating the purpose.
- **Why a script not a one-time snapshot:** the user-test window is 1-3 weeks; a tester-blocking bug fix mid-window needs a clean re-snapshot path. Manual `cp` + `sed` is error-prone after the first run.
- **Why distinct cache-bust (`v=frozen-DATE`):** browsers cache by full URL including query string. Same `/testing/styles.css?v=131` would serve stale post-refresh; date-stamped versioning forces a clean fetch.

#### Why this shape
- **Why pull-based not push-based:** the sheet stays the source of truth and the friendly editing surface. Push (Apps Script webhook → GitHub Issues / file) would mean two systems of record. Pull keeps it one.
- **Why Apps Script and not Power Automate:** Apps Script is bound to the same Google account as the sheet — no licensing wall, no tenant policy (the Power Automate path is documented as blocked further up in Attempts 1–2). ~30 minutes from `Extensions → Apps Script` to deployed `/exec` URL.
- **Why a shared secret rather than OAuth or API key:** the webhook is single-purpose, single-caller, and the request never leaves Claude → Google. A header secret is sufficient and means the user doesn't need to provision an API project.
- **Why we kept the existing `commit tested` column name:** the webhook accepts both `commit` and `commit tested` as the SHA column. Old column header survives so prior rows still parse.
- **Why fix B-05 first (rather than a smaller copy edit):** highest user-impact open row (`Medium` severity, real bug, clear repro), and the round trip would have looked superficial if the first fix was a one-line typo.

#### B-05 fix specifics
- `app.js init()` — when the cold-load URL matches `#explore?service=…`, we `history.replaceState` the current entry to `#explore` and `pushState` the modal URL back. Net effect: the modal URL has a real in-SPA entry behind it, so `requestModalClose`'s `history.back()` lands on Explore instead of leaving the SPA.
- Cache-bust v=128 → v=129.
- Verified in preview by `location.assign('/?_=<ts>#explore?service=4th-space-public-engagement')` (a clean reload onto the deep link), confirming the modal opened on cold load and "Back to All Resources" landed on `#explore` with the modal closed.

#### What's parked
- **GitHub-Issues mirror.** Open rows could mirror to Issues if Prem ever picks up a collaborator. Single-developer flow doesn't justify it.
- **Two-way schema sync.** Currently the Apps Script accepts only `status` + `commit`; adding new rows from the site (e.g. from Formspree feedback submissions) is a future enhancement. Trigger to unpark: feedback volume passes ~5/week.
- **Auto-PR / auto-deploy on `Done` writeback.** Today, `Done` just records that the fix shipped; the actual deploy is the merge from feature branch → `integration-prototype` per the regular workflow.

## Remaining paths

1. **Migrate the other 10 workshops to Docs** — coordinator-paced, row by row. Each Doc URL goes in `docUrl`; clear `file` once verified. Old `content/workshops/*.md` and `content/workshops.json` can be deleted in a single cleanup PR once every row has a `docUrl`.
2. **Populate the `provider` column** — coordinator adding it now. Use canonical strings (see COORDINATOR_GUIDE "Provider naming conventions") to keep grouping/filtering consistent later.
3. **Delete the dead `libcalUrl` column from all 3 sheet tabs** — code already ignores it; just dead weight in the editor.
4. **Shared Bookings page** — ✅ done 2026-05. Live at `PathwaysToImpact@liveconcordia.onmicrosoft.com`. Outstanding sheet-side step: update existing `bookingUrl` cells to per-service URLs from this shared page so the durability win lands. Sheet edit only, no code change.
5. **In-page booking (no new tab)** — see [BOOKINGS_PLAN.md](BOOKINGS_PLAN.md) "Staying on the page" section. Confirmed not viable with MS Bookings (X-Frame-Options blocks iframe; re-tested 2026-05-07 against the new shared page with the official MS embed snippet — still blocked). Options if pain becomes real: switch provider, or build a Graph-API-backed custom UI.
6. **Coordinator UX polish** — sheet is functional but raw. Could add column validation (data validation in Google Sheets) for `format`, `stage`, `pathway` to reduce typos, or a Google Form → sheet for new-row creation. Low priority until coordinator says it hurts.
7. **Automate the `status` column** — currently coordinator flips `full`/`cancelled` manually. Three viable paths in [BOOKINGS_STATUS.md](BOOKINGS_STATUS.md): Power Automate flow (M365-native), scheduled Claude Code agent (uses subscription as runtime), or hybrid. Parked until volume or coordinator effort justifies it.
8. **Migrate more Learn-section guides to slot files** — *What is a Narrative CV?* is the first; same pattern applies to *Impact across disciplines*, *Evidence that counts*, *Why plan early*, etc. Each guide gets a `content/learn/<name>.md` and a JS layout function. Eventually wire each to its own Google Doc via the `docUrl` field on `LEARN_GUIDES`.

## Current state

- Sheet is authoritative for all 3 content types. Local `data.js` is fallback only (cleared at runtime).
- 1 of 11 workshops migrated to Doc body. Remaining 10 still serving from local `.md` (no user-visible difference).
- `provider` column being added to all 3 tabs; coordinator populating row by row. Site renders nothing for blank rows (no broken layout). Card shows it as a small "OFFERED BY  *value*" label below the title; modal shows it as the first item in the meta-bar.
- MS Bookings live for one consultation (`opp-impact-framing`); other rows fall through to the Formspree request form.
- `status` column added to `workshops` and `place_holders` tabs. Coordinator-driven (manual). Blank cells = open for bookings (default). Set to `full` to swap the button for a waitlist form; `cancelled` to dim the card and hide the CTA. Documented in COORDINATOR_GUIDE.md. Auto-sync from MS Bookings is parked (see BOOKINGS_STATUS.md).
- *What is a Narrative CV?* guide (Learn section) prose now lives in `content/learn/narrative-cv-guide.md` as labelled slots. Rich layout (callouts, tables, expandables, concern/reality boxes) preserved in JS; coordinator edits text via GitHub web UI today, with a Doc URL slot ready to wire when desired. Pattern is the model for future guides.

## Settled questions (was: Open questions)

- ~~Does Office of Research have a Team SharePoint site with external-sharing enabled?~~ Moot — Sheets path won; MS Lists is parked.
- ~~Is Microsoft Bookings the confirmed choice?~~ Yes. LibCal was the alternative; not happening.
- ~~Who owns the database day-to-day?~~ Coordinator (single owner for now).

## Closed gaps

### Staging / preview via `version` column ✅ SHIPPED

Resolves the formerly open "no staging environment" gap. Mechanism:

- Each tab with public-facing rows has a **`version`** column.
- The site filters in `fetchWorkshopsFromSheet`, `fetchOpportunitiesFromSheet`, `fetchExternalResourcesFromSheet`: a row displays only when `version === "approved"` (case-insensitive, trimmed).
- Tabs without a `version` column (e.g. `external-resources` today) display all rows — the gate only kicks in when the column exists.
- A `?preview=1` query parameter bypasses the filter for that visit, so the coordinator can review staging items at the live URL before approving.

Coordinator workflow: edit at `draft` (or any non-approved value) → flip to `approved` when ready → row appears within ~1 min.

Tab naming: the opportunities-shaped data lives in a tab named `place_holders` (the rename made the staging intent visible at a glance in the sheet). Code reads that tab via `SHEETS.tabs.opportunities = "place_holders"`.

## Known gaps

### Attempt 7 — Bake script (static JSON export) — BUILT, PARKED

Context: In a conversation with Jesse Drukker (Concordia web team), he noted that the My CU Account site uses a pattern where content is exported to a JSON file and uploaded to AEM, removing any runtime dependency on Google. The site serves its own copy of the data.

We built an equivalent for our stack:

- `scripts/bake.js` — fetches all 3 sheet tabs, parses CSV (same logic as `app.js`), writes static JSON to `content/data/workshops.json`, `content/data/opportunities.json`, `content/data/external-resources.json`
- `SHEETS.mode` flag in `app.js` (replaces the old `enabled` boolean):
  - `"live"` — current behaviour, runtime fetch from Google (**active**)
  - `"baked"` — reads from `content/data/*.json` instead of Google (no external dependency)
  - `"local"` — uses only local `data.js` / `content/workshops.json` (no network at all)

Coordinator workflow if activated:
```
1. Edit Google Sheet
2. node scripts/bake.js
3. git diff content/data/    ← review what changed
4. git add content/data/ && git commit -m "content: refresh from sheet" && git push
```

Why it's parked: the terminal is a barrier for a non-technical coordinator. Every content update requires opening Terminal, running a command, and doing a git commit/push. That's a worse experience than the current sheet-to-live flow. The value (no runtime Google dependency, git-based rollback, QA gate before publish) is real, but the UX needs to be abstracted before activating.

Realistic paths to making it usable without Terminal:
- **GitHub Action on a schedule** — a cron-triggered Action runs `bake.js` and auto-commits the JSON on a schedule (e.g. every 30 min). Coordinator edits the sheet; the Action picks it up automatically. No terminal needed.
- **GitHub Action triggered by sheet** — an Apps Script webhook in the sheet calls the GitHub API to trigger a workflow dispatch on save. Near-instant, no polling lag.
- Either path keeps the QA gate (PR review) if desired, or skips it for a fully automatic flow.

Status (2026-04): mode is `"live"` and that's what we want during testing. The bake script and its JSON snapshots exist on the working machine but are **not committed to the repo** — `scripts/bake.js` and `content/data/` show up as untracked in `git status`. Don't flip `SHEETS.mode` to `"baked"` without first committing those files (the site would 404 on the snapshots otherwise).

A 2026-04 audit fixed two latent bugs in this code path before it sat any longer:
- `bake.js` was stripping the `version` column when mapping rows, which would have bypassed the approval gate. It now filters by `isApprovedRow` before writing JSON.
- `bake.js` tab map was out of sync with `app.js` (used `"opportunities"` instead of `"place_holders"`). Aligned.

Decision deferred until we either (a) wire the GitHub Action path so coordinators don't touch Terminal, or (b) decide we don't need the safety net and remove the bake code entirely. Live mode + the approval gate is sufficient for the current beta.

A separate consideration — Doc bodies have their own staging gap. A coordinator can keep editing a published Doc and every save is live within ~5 min (Google's publish cache). Mitigation if that becomes a problem: ask coordinators to *un-publish* before substantial edits, then *re-publish* when ready. Nothing to build, just a process note.
