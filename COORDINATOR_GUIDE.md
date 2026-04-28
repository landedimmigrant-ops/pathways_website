# Coordinator Guide — Add a Bookable Service

How to set up a sample consultation/workshop end-to-end: from Microsoft Bookings to the site. Plan for 20–30 minutes the first time; 5 minutes once you've done it once.

## What you're doing

1. Create a service in Microsoft Bookings (where people pick a time)
2. Copy its share URL
3. Paste the URL into the Google Sheet (where the site reads content from)
4. Check that it works on the site

Nothing else — no code, no publishing step. The site picks up changes within a minute of a hard refresh.

## Before you start

You need:
- A Concordia Microsoft 365 account (your `@concordia.ca` login)
- Access to the shared Google Sheet (ask Prem if you don't have the link)
- A browser — Chrome or Edge work best for Microsoft Bookings

---

## Part 1 — Create the service in Microsoft Bookings

1. Go to **https://outlook.office.com/bookings/** and sign in with your Concordia account.
2. On the home page, under **Shared booking pages**, click **Create booking page** (or open an existing one if it's already set up).
   - If you're creating the shared page for the first time: name it something like `Pathways Research Services`, add a description, and pick a business type (Education → University works). Save.
3. In the left sidebar, click **Services** → **Add a service**.
4. Fill in the core fields:
   - **Service name** — what appears on the booking page, e.g. *Impact framing consult*
   - **Description** — one or two sentences. This shows up on the Bookings page.
   - **Duration** — e.g. 45 min
   - **Buffer time** — optional, adds padding between bookings
5. Scroll down to **Online meeting** and toggle **Add online meeting** ON. This makes every booking auto-generate a Teams link.
6. Under **Assign staff**, add the advisor(s) who can take this booking. Each advisor must accept the email invite Bookings sends them before they're active.
7. Under **Scheduling policy**:
   - **Minimum lead time** — e.g. 1 day (stops last-minute bookings)
   - **Maximum lead time** — e.g. 30 days
8. Click **Save**.

## Part 2 — Add custom questions (important for tracking)

Custom questions are what turn a booking into a useful data point. Add them once per service and every booking records the answers.

1. Still inside the service you just created, scroll to **Custom fields**.
2. Click **Modify** or **Add a question** and add these suggested ones:
   - **Department / Faculty** — dropdown (Arts & Science, Engineering, Fine Arts, GCS, JMSB, School of Graduate Studies, Other). Required.
   - **Career stage** — dropdown (Grad student, Postdoc, Faculty, Staff, Other). Required.
   - **Which pathway are you working on?** — dropdown matching the six pathways (Academic Scholarship, Community Engagement, Research Creation, Commercialization, Communications, Policy). Optional.
   - **Anything specific you'd like to cover?** — long text. Optional.
3. Click **Save**.

You can change these later; old bookings keep their original answers.

## Part 3 — Get the service URL

This is the link that goes in the Google Sheet.

1. Go to **Services** in the left sidebar.
2. Click the service you just created.
3. Find the section labeled **Service booking page** (usually on the right side or near the top of the service detail view).
4. Click **Copy link**.

The URL looks something like:

`https://outlook.office.com/owa/calendar/<YourPageName>@concordia.ca/bookings/s/<long-id>`

Paste it into a scratchpad or email for the next step.

## Part 4 — Add the URL to the Google Sheet

1. Open the shared Google Sheet.
2. Pick the right tab:
   - **Consultation or internal workshop?** → `opportunities` tab
   - **Standalone workshop with a long-form body?** → `workshops` tab
   - **External resource?** → `external-resources` tab (usually won't have a booking URL — external links go in `externalUrl` instead)
3. Find the row for your service. If it's a new service, add a new row at the bottom and fill in at least:
   - `id` — a short unique slug, e.g. `opp-impact-framing-v2`
   - `title`
   - `category`, `format`, `time`, `stage`, `pathway`, `tags`, `summary`
   - `provider` — the team or unit running it (e.g. *Office of Research*, *Library RDM Team*, *4th Space*). Shows up as "Offered by …" on the card.
   - (Other columns can stay empty to start)
4. In the **`bookingUrl`** column of that row, paste the URL from Part 3.
5. Save / close. Google Sheets auto-saves.

**Multi-value columns** (`pathway`, `stage`, `tags`): separate values with a semicolon, e.g. `Communications; Policy`.

## Part 4b — (Workshops only) Add a long-form body via Google Doc

If your service is a workshop with a longer description (what you'll get, who it's for, how to prepare, outcomes), put that body in its own Google Doc and link it from the sheet. The card preview still uses the short `summary`; the full body shows up when someone opens the workshop.

1. Create a new Google Doc. Title it the same as your workshop.
2. **Write it however feels natural.** Plain paragraphs, bullet lists, bold/italic, and links all work. You don't need to use Google's Heading styles — short standalone lines like *Short Description*, *Who it's for*, *Outcomes*, *Format*, *What to Bring* get auto-detected as section headings on the site. Avoid embedded images for now (they don't render through publish-to-web cleanly).
3. **File → Share → Publish to web** → click **Publish** → confirm.
4. Copy the URL it gives you. It looks like:
   `https://docs.google.com/document/d/e/2PACX-1vS<long-id>/pub`
   It must end in `/pub`. (If you copy from the address bar of the editor instead, you'll get an `/edit` URL — that won't work.)
5. Paste that URL into the **`docUrl`** column of the workshop's row in the `workshops` tab.
6. Save.

**What the site does to the Doc automatically:**
- Auto-promotes short label lines (e.g. *Format*, *Who it's for*, *Outcomes*) to section headings
- Strips redundant lines that are already on the sheet (anything starting with *Title:* or *Tags:*)
- Joins paragraphs that got soft-wrapped across visual lines back into single paragraphs
- Cleans up Google's link wrappers so external links open in a new tab
- Drops the Doc's CSS, fonts, and other styling so the body matches the rest of the site

**Editing later:** just edit the Doc. Your changes flow through to the site within ~5 minutes (Google's publish-to-web cache) plus a hard refresh on the user side. No re-publishing needed.

**Heads-up:** if you accidentally *unpublish* the Doc later, the workshop body will fail to load and the site will fall back to whatever was in the local `.md` file (if any). To retire a workshop properly, blank or delete the row in the sheet instead.

## Part 5 — Verify on the site

1. Open the live site (or the local preview) in a new tab.
2. Hard refresh: `Cmd+Shift+R` on Mac, `Ctrl+Shift+R` on Windows.
3. Go to the page where the service appears (usually **All Resources**).
4. Find the card for your service. Click it to open the detail view.
5. Click **Book**.

You should see Microsoft Bookings open in a new tab, showing your service with the time picker. Book yourself a test slot to confirm the Teams invite arrives.

That's it. You're done.

---

## Changing or retiring a service

- **To change wording / time / description:** edit the Google Sheet row only. No need to touch Bookings unless availability is changing.
- **To change availability, staff, or duration:** edit in Microsoft Bookings. The URL stays the same; the site picks up nothing new.
- **To retire a service:** delete (or blank out) the row in the Google Sheet. Also consider disabling it in Bookings so no lingering links work. If you want to keep the URL live but hide it from the site, just delete the sheet row.

## Troubleshooting

**"I don't see Shared booking pages, only Personal booking page."**
Bookings requires an A3 license. If you only see the personal page, ask IT to confirm your license covers the full Bookings app.

**"The booking page asks for a sign-in but I want anyone to book."**
In Bookings, open the service → **Booking page** settings → uncheck *"Require a Microsoft 365 or Office 365 account from my organization to book."* Save and re-publish.

**"The site still shows the old content after I changed the sheet."**
Hard refresh the page (`Cmd+Shift+R` / `Ctrl+Shift+R`). Google's endpoint caches for ~1 minute; wait a beat and try again.

**"I pasted the URL but the card still goes to the old request form."**
Check that you pasted into the `bookingUrl` column — not `externalUrl`. Column headers are in row 1.

**"A staff member isn't appearing in the staff list."**
They need to accept the Bookings invite email first. Check their inbox (including junk).

**"I pasted a `docUrl` but the workshop body still shows the old content."**
Three things to check, in order:
1. The URL must end in `/pub` — not `/edit`. If yours says `/edit`, go back to **File → Share → Publish to web** and copy the URL from there.
2. The Doc must actually be published (the dialog has a green Published banner once it is).
3. Hard refresh (`Cmd+Shift+R` / `Ctrl+Shift+R`). Google's publish endpoint caches for ~5 minutes — wait a beat and try again.

**"My Doc has images / tables / fancy formatting but the site shows plain text."**
Expected. The site's body renderer keeps headings, paragraphs, lists, bold/italic, and links. Tables, images, and complex layouts get stripped to keep the site visually consistent. If you need richer media, link out to a separate page from inside the Doc.

**"A line I wanted to be regular text became a section heading."**
The auto-detection looks at short standalone lines (under ~70 characters, no terminal punctuation) and treats them like section labels. To force a line to stay regular text, end it with a period. To force it to be a heading, just keep it short and unpunctuated.

## Who to ask

- **Bookings / licensing issues:** Concordia IT Service Desk
- **Google Sheet access or structure:** Prem
- **Site behavior / card not showing up:** Prem
