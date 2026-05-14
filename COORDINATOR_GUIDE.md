# Coordinator Guide

How to add and edit content on the Pathways to Impact site without writing code.

## Heads-up: approval gates rows on the live site

Each tab in the Google Sheet has a **`version`** column. A row appears on the live site only when its `version` cell reads exactly **`approved`** (lowercase, no extra spaces). Anything else — `not approved`, `draft`, blank, or any other value — keeps the row hidden from public view.

This gives you a soft staging environment in the same sheet:

- **Drafting?** Leave `version` blank or set it to `draft` / `not approved`. The row sits in the sheet but isn't on the public site.
- **Ready?** Change `version` to `approved`. The row appears on the live site within ~1 minute (hard-refresh).
- **Pulling something back?** Change `version` to anything other than `approved`. The row disappears from the public site within ~1 minute.

**Preview mode**: append `?preview=1` to any site URL (e.g. `https://landedimmigrant-ops.github.io/pathways_website/?preview=1#explore`) and the site will display *all* rows including unapproved ones. Use this to review staging items before approving. The flag isn't shareable in any meaningful sense (anyone with the URL can use it) — treat it as a coordinator convenience, not a security boundary.

### What about Google Docs?

Google Doc edits to a workshop body are still live within ~5 min (no approval gate on Doc content — only on the sheet row that points to it). For substantial Doc rewrites, *unpublish* the Doc before editing (File → Share → Stop publishing), do your edits, then *publish* again. While unpublished, the site falls back to the previous local copy (if any) so the workshop doesn't break.

### Tabs and the staging model

| Tab | Has `version` column? | Behavior |
|---|---|---|
| `workshops` | Yes | `version=approved` → visible; otherwise hidden |
| `place_holders` | Yes | Same — currently doubles as the staging area for opportunities |
| `external-resources` | No | All rows show (no approval gate today; can be added by inserting a `version` column) |

## Marking a workshop or consultation as full

When a workshop or consultation fills up, you can flip its **`status`** column to take bookings off and turn the card into a waitlist sign-up.

### One-time: add the `status` column

If the column doesn't exist yet, add it once:

1. Open the sheet, go to the **`workshops`** tab.
2. Insert a new column at the right end of the header row. Title the cell exactly **`status`** (lowercase).
3. Repeat on the **`place_holders`** tab so consultations can use it too.
4. (External resources don't take bookings, so don't add it to `external-resources`.)

That's it — you don't need to fill anything in immediately. Blank cells mean "open for bookings" (the current behaviour).

### How to flip a session

Edit the `status` cell on the row you want to change. Recognised values (case- and space-insensitive):

| Cell value | What the site does |
|---|---|
| *(blank)* or `open` | Normal — booking button works as usual. |
| `full` | Card shows a small **FULLY BOOKED** pill. The booking button becomes **Join the waitlist**. Anyone who clicks it lands on a short waitlist form (we'll get an email with their name + the workshop title). |
| `waitlist` | Same as `full` — use whichever word reads better to you. |
| `cancelled` | Card shows a **CANCELLED** pill and is dimmed. The booking button is replaced by a one-line note. No waitlist. |

Changes appear on the live site within ~1 minute, plus a hard refresh (`Cmd+Shift+R` / `Ctrl+Shift+R`).

### When to use which

- **A workshop sells out, but you might add another session** → `full`. Researchers can self-serve onto the waitlist; you decide whether to schedule a repeat.
- **A consultation slot is booked solid for the term** → `full`. Same waitlist path.
- **You're cancelling outright (instructor unavailable, scope change)** → `cancelled`. Don't leave it as `full`, or people will keep signing up for a session that isn't happening.
- **It's open again** → blank the cell or change it back to `open`.

### Where waitlist signups go

Waitlist submissions hit the same Formspree endpoint as the regular request form, with two extra fields so you can spot them:
- `intent: waitlist`
- `service_status: full`

If you want a separate inbox for waitlist signups, ask Prem — that's a Formspree config change, not a sheet change.

> Note on `place_holders`: this tab holds the opportunities-shaped data (consultations, services). The name reflects that it currently serves as a parking lot for in-progress entries. The schema is identical to a normal opportunities tab — you fill in `id`, `title`, `format`, `category`, `detailsWho/What/Outcomes`, etc. as documented in [Flow B](#flow-b--add-or-edit-a-bookable-consultation).

## Before you start

You need:
- A Concordia Microsoft 365 account (`@concordia.ca`)
- Access to the shared Google Sheet (ask Prem if you don't have the link)
- A browser — Chrome or Edge work best for Microsoft Bookings

## What you might be doing

Pick the flow that matches what you're adding:

| Task | Where the content lives | Jump to |
|---|---|---|
| Adding a workshop with a long-form body | Google Sheet `workshops` tab + a Google Doc | [Flow A](#flow-a--add-or-edit-a-workshop) |
| Adding a bookable consultation | Google Sheet `place_holders` tab + Microsoft Bookings | [Flow B](#flow-b--add-or-edit-a-bookable-consultation) |
| Adding an external link or resource | Google Sheet `external-resources` tab | [Flow C](#flow-c--add-or-edit-an-external-resource) |
| Editing prose in a Learn-section guide | A labelled `.md` file (or eventually a Google Doc) | [Flow D](#flow-d--edit-a-learn-section-guide) |
| Just editing existing copy | Google Sheet, the relevant row | [Quick edits](#quick-edits) |

Each flow is independent. You don't need to do them in any particular order.

---

## Flow A — Add or edit a workshop

A "workshop" here means anything with a long-form description (what you'll get, who it's for, outcomes). The card on the site shows a short summary; clicking the card opens the full body. The body lives in its own Google Doc; everything else lives in one row of the sheet.

### Step 1 — Write the body in a Google Doc

1. Create a new Google Doc. Title it the same as your workshop.
2. Write it however feels natural. Plain paragraphs, bullet lists, bold/italic, and links all work. You don't need to use Google's Heading styles — the site automatically detects short standalone lines like *Short Description*, *Who it's for*, *Outcomes*, *Format*, *What to Bring* as section headings.
3. **Want a tagline?** Start the Doc with a short sentence wrapped in quotation marks (e.g. *"Your data will out-live your grant."*). The site lifts that line out and shows it as a styled pull-quote on the card preview AND at the top of the modal. The same text won't repeat inside the body. Keep it under ~240 characters.
4. Avoid embedded images and tables — they get stripped on the site.
5. **File → Share → Publish to web** → click **Publish** → confirm.
6. Copy the URL it gives you. It looks like:
   `https://docs.google.com/document/d/e/2PACX-1vS<long-id>/pub`
   It must end in `/pub`. (The URL in the editor address bar ends in `/edit` and won't work.)

### Step 2 — Add or update the row in the sheet

1. Open the shared sheet, `workshops` tab.
2. If this is a new workshop, add a row at the bottom. If editing an existing one, find its row.
3. Fill in at least:
   - `id` — short unique slug, e.g. `library-dmp-consultation`
   - `title` — what shows on the card
   - `summary` — one or two sentences for the card preview (if blank, the site uses the first paragraph of the Doc)
   - `format`, `time`, `tags`, `pathways`, `stages`
   - `provider` — the team or unit running it. Renders as a small "OFFERED BY *Library RDM Team*" label below the title on the card, and as the first item in the modal meta-bar. See [Provider naming conventions](#provider-naming-conventions) for canonical strings.
   - `docUrl` — the `/pub` URL from Step 1
   - `version` — set to `approved` to make the row visible on the live site. Leave blank or use `draft` while you're still preparing it (see ["approval gates rows on the live site"](#heads-up-approval-gates-rows-on-the-live-site) at the top).
4. Optional:
   - `bookingUrl` — if there's a Microsoft Bookings page for this workshop. If you don't have one, the modal will show a "Register for this workshop" form that emails the request.
   - `status` — leave blank for normal bookings. Set to `full` (or `waitlist`) when the session sells out, or `cancelled` if you're pulling it. See [Marking a workshop or consultation as full](#marking-a-workshop-or-consultation-as-full).
5. Save. (Google Sheets auto-saves.)

### Step 3 — Verify

1. Open the site in a new tab.
2. Hard refresh: `Cmd+Shift+R` on Mac, `Ctrl+Shift+R` on Windows.
3. Find the workshop card. Click to open the modal — you should see the rendered Doc body with section headings, lists, and any links you included.

### Editing later

- Edit the Doc — your changes appear on the site within ~5 min plus a hard refresh. No re-publishing needed.
- Edit the sheet row — changes appear within ~1 min plus a hard refresh.
- Retiring a workshop: blank or delete the sheet row. Don't unpublish the Doc unless you also clear the row, or the body will break briefly.

### Multi-value columns

`pathways`, `stages`, `tags` accept multiple values separated by `;` (semicolon).
Example: `Communications; Policy`

---

## Flow B — Add or edit a bookable consultation

A "consultation" here means a 1:1 service that a researcher can book a time for (impact framing, narrative CV review, etc.). Two parts: the bookable service in Microsoft Bookings, and the row in the sheet that points to it.

### Step 1 — Create the service in Microsoft Bookings

> **Use the shared booking page, not your personal one.** As of 2026-05, the durable home for Pathways booking URLs is the shared mailbox **`PathwaysToImpact@liveconcordia.onmicrosoft.com`** (admin URL: `https://outlook.office.com/bookings/`, then pick the *Pathways to Impact* shared page). Personal *Bookings with Me* URLs are pinned to one staff member's calendar and break when they leave — the shared page survives staff turnover, so all new services should be created there.

1. Go to **https://outlook.office.com/bookings/** and sign in with your Concordia account.
2. Under **Shared booking pages**, click **Create booking page** (or open an existing one).
   - First-time setup: name it something like `Pathways Research Services`, pick Education → University, save.
3. Left sidebar → **Services** → **Add a service**.
4. Fill in:
   - **Service name** (shows on the booking page)
   - **Description** (one or two sentences, shows on the booking page)
   - **Duration** (e.g. 45 min)
   - **Buffer time** (optional; padding between bookings)
5. Toggle **Online meeting** ON. Every booking auto-generates a Teams link.
6. Under **Assign staff**, add the advisors who can take this booking. Each must accept the email invite Bookings sends them.
7. Under **Scheduling policy**:
   - **Minimum lead time** (e.g. 1 day) — stops last-minute bookings
   - **Maximum lead time** (e.g. 30 days)
8. Save.

### Step 2 — Add custom questions (recommended)

Custom questions turn each booking into useful data. Add them once per service.

1. Inside the service, scroll to **Custom fields**.
2. Click **Modify** or **Add a question**:
   - **Department / Faculty** — dropdown (Arts & Science, Engineering, Fine Arts, GCS, JMSB, School of Graduate Studies, Other). Required.
   - **Career stage** — dropdown (Grad student, Postdoc, Faculty, Staff, Other). Required.
   - **Which pathway are you working on?** — dropdown matching the six pathways. Optional.
   - **Anything specific you'd like to cover?** — long text. Optional.
3. Save. (You can change these later; old bookings keep their original answers.)

### Step 3 — Get the per-service URL

1. Left sidebar → **Services** → click the service.
2. In the service detail view, find **Service booking page** and click **Copy link**.

URL format:
`https://outlook.office.com/owa/calendar/<YourPageName>@concordia.ca/bookings/s/<long-id>`

### Step 4 — Add the row to the sheet

1. Open the shared sheet, `place_holders` tab.
2. Add a row (or update an existing one). Fill in at least:
   - `id` — e.g. `opp-impact-framing-v2`
   - `title`, `category`, `format`, `time`, `stage`, `pathway`, `tags`, `summary`
   - `provider` — the team running the service (renders as "OFFERED BY *team*" on the card; see [Provider naming conventions](#provider-naming-conventions))
   - `bookingUrl` — paste the URL from Step 3
   - `version` — leave blank or set to `draft` while you're still drafting; change to `approved` to make the row visible on the live site (see ["approval gates rows on the live site"](#heads-up-approval-gates-rows-on-the-live-site) at the top)
   - `status` — leave blank for normal bookings. Set to `full` when the consultation slate fills up (turns the button into "Join the waitlist") or `cancelled` if it's being pulled. See [Marking a workshop or consultation as full](#marking-a-workshop-or-consultation-as-full).
3. Save.

### Step 5 — Verify

1. Open the site, hard refresh.
2. Find the consultation card, click it.
3. Click **Book a consultation** — Microsoft Bookings should open in a new tab with the time picker.
4. Book yourself a test slot to confirm the Teams invite arrives.

### Editing later

- **Wording / time / description on the site:** edit the sheet row only. No need to touch Bookings.
- **Availability, staff, duration:** edit in Bookings. The URL stays the same; nothing to change in the sheet.
- **Retire:** delete the sheet row. Optionally disable the service in Bookings so any lingering external link stops working.

---

## Flow C — Add or edit an external resource

External resources are links to things hosted off-site (Concordia Library guides, government sites, journals, etc.). They show up as cards in the Explore page that open the external link in a new tab.

1. Open the shared sheet, `external-resources` tab.
2. Add a row. Fill in:
   - `id` — short unique slug
   - `title`
   - `summary`
   - `category`, `format`, `time`, `stage`, `pathway`, `tags`
   - `provider` — the team or institution that hosts it (renders as "OFFERED BY *team*" on the card; see [Provider naming conventions](#provider-naming-conventions))
   - `externalUrl` — the full URL to the external page
3. Leave `bookingUrl` and `docUrl` blank — external resources don't use them.
4. Save.

### Verify

1. Hard refresh the site.
2. Find the resource card. Click it. The modal opens with a preview, and the bottom CTA reads **Open resource ↗** — clicking opens the URL in a new tab.

---

## Flow D — Edit a Learn-section guide

The Learn section's deeper "Impact 101" guides (e.g. *What is a Narrative CV?*) have a richer custom layout — numbered sections, callouts, comparison tables, expandable accordions, concern/reality boxes. Because the layout is opinionated, the **layout itself stays in code** and we (Prem) tweak it with you when you want changes. But the **prose inside that layout** is editable on its own — you don't need a code change to fix a typo, swap a sentence, add a bullet, or rewrite a callout.

### Where the prose lives

Each guide has a labelled file in `content/learn/` (e.g. `content/learn/narrative-cv-guide.md`). Each block of prose sits under a Heading 2 like `## s1.lead` — that label is how the site finds the right slot to fill. The label itself never appears on the live page; only the prose underneath it.

A short example:

```
## s1.title
Why narrative CVs exist

## s1.summary
A Narrative CV asks you to describe your research contributions in your own words — not just list them. …

## s1.callout.strong
The core shift —

## s1.callout.body
A traditional CV says what you did. A Narrative CV says what changed because of what you did, and why that matters.
```

If you change "Why narrative CVs exist" to "Why funders want narrative CVs", that's exactly what shows up on the site. The label `s1.title` doesn't move.

### How to edit it

Two options, equivalent in result:

1. **Direct on GitHub (no Doc yet, recommended for now):**
   - Open the file in the GitHub web editor: navigate to `content/learn/<guide>.md` in the repo, click the pencil icon (✏️ "Edit this file"), make your changes, scroll down, click **Commit changes**.
   - The site updates within ~1–2 min after the commit lands on the deployed branch.
   - You can see your edit in the file before committing — no Terminal, no git CLI.

2. **Google Doc (when wired up):**
   - When a guide has a Doc URL configured, you edit the prose in the Doc using normal Doc editing.
   - The Doc uses the same `## label` Heading-2 convention as the .md.
   - Save → ~5 min to live (Google's publish cache).
   - Ask Prem to set up the Doc the first time — he'll publish it to the web and wire its URL into the site config. After that, you have a normal Doc you can edit anytime.

### Rules to keep things working

- **Don't rename the slot labels.** `## s1.lead` is how the site finds that paragraph. If you change it to `## section1.lead` the site can't find it and falls back to the original hardcoded text.
- **Don't reorder slots.** The site looks them up by label, not position, so reordering is technically safe — but it makes the file harder to read for anyone else.
- **Lists use `- ` bullets.** One per line. Empty lines between bullets break the list.
- **Tables use pipe-separated rows.** First content line under the slot label is the header row; each line below is a data row, all `|`-separated.
- **Two-column rows (cards, concern/reality myths) use one row per line, pipe-separated** with the columns in the documented order. The .md file shows the order at the top of each multi-column slot.
- **Horizontal rules (`---`) between slots are fine** — they're stripped automatically and only there to make the .md easier to scan.

### "What if I want to add a new section, callout, or table?"

That's a layout change — ping Prem. He'll add the new slot to the layout code and create the matching `## label` in the file. Then you fill in the prose normally.

### Which guides currently use this pattern

- `content/learn/narrative-cv-guide.md` — *What is a Narrative CV?* (live)

More to come; each one gets its own file in `content/learn/`.

---

## One-time cleanup: migrate existing `bookingUrl` values to the shared page

Older rows in the sheet may have `bookingUrl` values pointing to a **personal** *Bookings with Me* page (e.g. URLs containing `/bookwithme/user/...`). These should be replaced with **per-service URLs from the new shared `PathwaysToImpact@liveconcordia` page** so the booking flow doesn't break if a staff member leaves.

For each affected row:

1. Open `https://outlook.office.com/bookings/` → pick the **Pathways to Impact** shared page.
2. Left sidebar → **Services** → click the matching service.
3. **Service booking page** section → **Copy link**.
4. Paste into the row's `bookingUrl` cell, replacing the old personal-page URL.
5. Save. Site updates within ~1 min.

If the matching service doesn't exist on the shared page yet, create it there first ([Flow B](#flow-b--add-or-edit-a-bookable-consultation), Step 1) — same scheduling settings, same staff assignments.

> **Why this matters:** in-page booking embed is permanently blocked by Microsoft (verified 2026-05-07; see `BOOKINGS_PLAN.md`). The new-tab redirect to MS Bookings is the production UX, so the URL in the sheet *is* the booking flow. Pinning that URL to a shared mailbox instead of a personal calendar is the durability win.

---

## Quick edits

For changes to existing copy (typo, time change, summary tweak):

1. Open the sheet, find the row.
2. Edit the cell.
3. Save (auto-saves).
4. Hard refresh the site (`Cmd+Shift+R` / `Ctrl+Shift+R`). Live within ~1 min.

For body content changes on a workshop, edit the Google Doc directly — no need to re-publish.

---

## Provider naming conventions

The `provider` column tells researchers *who* is offering a workshop, consultation, or resource. It renders as a small "OFFERED BY *Library RDM Team*" label on each card and as the first item in the modal meta-bar.

**Use the same string for the same team every time.** "Library RDM Team", "Library RDM", and "RDM Team" are visually three different providers to the site even if they're the same team to you. Consistent strings make it easy to group, filter, or count by provider later.

Suggested canonical values (extend as needed):

| Provider | Use for |
|---|---|
| *Office of Research* | Anything run by OOR central — impact framing, narrative CV review, grant strategy |
| *Library RDM Team* | Research data management, DMP consultations, repository deposits |
| *Concordia Library* | Other library services (literature search, citation management, scholarly publishing) |
| *4th Space* | 4th Space events and curation |
| *School of Graduate Studies* | SGS-run workshops |
| *Faculty of Arts & Science* | Faculty-specific research support (substitute the right faculty: Engineering, Fine Arts, GCS, JMSB) |
| *External — [organization]* | Off-Concordia resources (e.g. *External — SSHRC*, *External — Tri-Agency*) |

**Rules of thumb:**

- Use a **team / unit / faculty name**, not a person's name. Personal attribution belongs in the body, not the card label.
- Keep it under ~32 characters so the label doesn't wrap on the card.
- For external (non-Concordia) resources, prefix with *External — * so researchers can tell at a glance whether it's an internal or third-party offering.
- If the cell is left blank, the site renders no "OFFERED BY" line — fine for placeholder rows but every public-facing row should be filled in.

---

## Multi-value columns reference

These accept multiple values, separated by `;`:

| Tab | Multi-value columns |
|---|---|
| `workshops` | `pathways`, `stages`, `tags` |
| `place_holders` | `pathway`, `tags` (and `stage` if a service spans multiple stages) |
| `external-resources` | `pathway`, `tags`, `stage` |

Example: `Communications; Policy` shows up as two pathway tags on the card.

---

## Troubleshooting

**"The site still shows the old content after I changed the sheet."**
Hard refresh: `Cmd+Shift+R` / `Ctrl+Shift+R`. Google's CSV endpoint caches for ~1 minute; wait a beat and try again.

**"I pasted a `docUrl` but the workshop body still shows the old content."**
Three things to check, in order:
1. The URL must end in `/pub` — not `/edit`. If yours says `/edit`, go back to **File → Share → Publish to web** and copy from there.
2. The Doc must actually be published (the dialog has a green Published banner once it is).
3. Hard refresh. Google's publish endpoint caches for ~5 minutes — wait a beat and try again.

**"I pasted the URL but the card still goes to the old request form."**
Check that you pasted into the `bookingUrl` column — not `externalUrl`. Column headers are in row 1.

**"My Doc has images / tables / fancy formatting but the site shows plain text."**
Expected. The site keeps headings, paragraphs, lists, bold/italic, and links. Tables, images, and complex layouts get stripped to keep the site visually consistent. If you need richer media, link out from inside the Doc.

**"A line I wanted to be regular text became a section heading."**
The site auto-detects short standalone lines (under ~70 characters, no terminal punctuation) as section labels. To force a line to stay regular text, end it with a period. To force it to be a heading, just keep it short and unpunctuated.

**"I don't see Shared booking pages in MS Bookings, only Personal booking page."**
Bookings requires an A3 license. If you only see the personal page, ask IT to confirm your license covers the full Bookings app.

**"The booking page asks for a sign-in but I want anyone to book."**
In Bookings, open the service → **Booking page** settings → uncheck *"Require a Microsoft 365 or Office 365 account from my organization to book."* Save and re-publish.

**"A staff member isn't appearing in the staff list."**
They need to accept the Bookings invite email first. Check their inbox (including junk).

**"I made an edit and it shows up wrong / breaks the card."**
Check the row didn't lose required values like `id`, `title`, or `summary`. The site renders blank fields as blank; it doesn't validate against a schema. The console (F12 → Console) will sometimes log specific failures.

---

## Bug & feedback triage

Bugs, copy fixes, content suggestions, and feature ideas live in the **bug-report Google Sheet** (separate from the content sheet). Three tabs:

| Tab | Use it for |
|---|---|
| Bugs / general | Anything that's broken or working unexpectedly across the site |
| NCV tool feedback | Issues specific to the *Build your Narrative CV* tool |
| Content to mirror | Ideas pulled from other sites/tools that we might want to bring in |

### Adding a row

Each row gets these columns:

| Column | What goes in it |
|---|---|
| `id` | Auto-pattern: `B-NN` (bugs tab), `N-NN` (NCV tab), `C-NN` (content tab). Just increment the last number. |
| `type` | One of `bug` · `copy` · `feature` · `content` |
| `where?` | Specific location: the page, section, button — enough that someone else can reproduce |
| `summary` (column "bug/issue") | One-sentence description |
| `details` / `expected vs actual` | Optional — fill if a reader needs more to repro |
| `severity` | `High` · `Medium` · `Low` (use sparingly; default Medium for real bugs) |
| `idea fix` | Optional — your suggested approach. Helpful but not required. |
| `status` | `New` · `Triaged` · `In Progress` · `Done` · `Won't fix` · `Needs info` |
| `commit` (column "commit tested") | Populated automatically when a fix lands — 7-character commit SHA |

Blank `status` is treated as `New`. Don't reuse IDs even if a row is deleted.

### Triage flow (what happens when Prem runs `/triage`)

1. Claude pulls the three tabs and shows a one-screen list of everything where status is `New`, `Triaged`, `In Progress`, or blank.
2. Prem picks which item(s) to fix that session.
3. For each fix: Claude proposes a change, Prem signs off, the fix gets committed with the row's ID in the commit message.
4. The row's `status` is automatically flipped to `Done` and its `commit` cell is populated with the new SHA — no manual update needed.
5. Done rows stay in the sheet as a record. Set `status=Won't fix` if a row is rejected (with a one-line reason in `idea fix`).

### When to use which status

- **`New`** — just filed, no one's looked yet (or you left it blank).
- **`Triaged`** — Prem read it, agrees it's real, but it's not the next thing being worked.
- **`In Progress`** — actively being fixed this session.
- **`Done`** — shipped to the live site. The `commit` cell points at the change.
- **`Won't fix`** — decided not to act on this. Add a brief reason in `idea fix`.
- **`Needs info`** — the row is ambiguous — Claude or Prem will ask before acting.

---

## Who to ask

- **Sheet access / structure / column changes:** Prem
- **Site behaviour / a card that won't show up:** Prem
- **Bookings / Concordia license issues:** IT Service Desk
- **Adding a new column to the schema:** ask Prem first; the code reads specific column names so adding "just any column" won't make it appear on the site.
