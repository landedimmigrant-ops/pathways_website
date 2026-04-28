# Coordinator Guide

How to add and edit content on the Pathways to Impact site without writing code.

## Heads-up: edits are live immediately

There is no staging environment yet. Every change you save in the Google Sheet is live on the site within about a minute, and every change you make to a published Google Doc is live within about five minutes. **There is no preview, no review step, no rollback button.** A few practical implications:

- Don't paste a half-finished row into the sheet. Draft it elsewhere first, or expect it to be visible until you finish.
- If you want a colleague to eyeball something before it goes public, copy-paste the wording into a separate doc and ask them there.
- For substantial Doc rewrites, *unpublish* the Doc before editing (File → Share → Stop publishing), do your edits, then *publish* again. While unpublished, the site falls back to the previous local copy (if any) so the workshop doesn't break.

A "preview mode" that reads draft rows is on the engineering radar but not built yet. See `INTEGRATION_NOTES.md` "Known gaps" for the planned shape.

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
| Adding a bookable consultation | Google Sheet `opportunities` tab + Microsoft Bookings | [Flow B](#flow-b--add-or-edit-a-bookable-consultation) |
| Adding an external link or resource | Google Sheet `external-resources` tab | [Flow C](#flow-c--add-or-edit-an-external-resource) |
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
4. Optional:
   - `bookingUrl` — if there's a Microsoft Bookings page for this workshop. If you don't have one, the modal will show a "Register for this workshop" form that emails the request.
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

1. Open the shared sheet, `opportunities` tab.
2. Add a row (or update an existing one). Fill in at least:
   - `id` — e.g. `opp-impact-framing-v2`
   - `title`, `category`, `format`, `time`, `stage`, `pathway`, `tags`, `summary`
   - `provider` — the team running the service (renders as "OFFERED BY *team*" on the card; see [Provider naming conventions](#provider-naming-conventions))
   - `bookingUrl` — paste the URL from Step 3
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
| `opportunities` | `pathway`, `tags` (and `stage` if a service spans multiple stages) |
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

## Who to ask

- **Sheet access / structure / column changes:** Prem
- **Site behaviour / a card that won't show up:** Prem
- **Bookings / Concordia license issues:** IT Service Desk
- **Adding a new column to the schema:** ask Prem first; the code reads specific column names so adding "just any column" won't make it appear on the site.
