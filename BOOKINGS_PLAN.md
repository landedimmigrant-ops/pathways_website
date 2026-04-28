# Microsoft Bookings Integration — Plan

Plan for Phase 2 of the content/backend integration. Phase 1 (Google Sheets as CMS) is done.

## Status (2026-04-28)

**Working:** new-tab redirect. Click Book → Bookings opens in a new tab → user picks a time → confirmation emailed. One click, no intermediate screens. Live for `opp-impact-framing` (Prem's personal *Bookings with Me* URL); other rows fall through to the Formspree request form.

**Not working / not viable:** in-page iframe embed. MS Bookings sets `X-Frame-Options: DENY` — no way around it at the Bookings side.

**Decisions made since the original plan:**
- MS Bookings is the chosen booking provider (not LibCal — that subscription was never activated).
- The new-tab redirect is the production UX for now. No appetite for a Graph API custom UI unless the redirect proves painful at volume.

**Next:**
1. Set up a shared Bookings page (e.g. `pathways-bookings@concordia` mailbox) so URLs survive staff turnover. Currently dependent on Prem's personal Bookings calendar.
2. Add custom questions to each service for usage tracking (department, career stage, pathway).
3. Stand up Power Automate → Google Sheet logging to the existing sheet's `bookings_log` tab.

## Goal

Replace the "Send request" Formspree placeholder with a real booking flow that:
- Lets Concordia researchers (signed in with their Concordia account) book a specific service/workshop from the site
- Sends calendar invites + Teams links automatically
- Stays coordinator-editable (add a new service → booking works without code change)
- Keeps hosting free / uses an existing Concordia entitlement

**Audience is researchers, so requiring sign-in is fine** — the "Require a Microsoft 365 account from my organization" setting can be ON. This removes the main risk from the plan.

## What we know about MS Bookings

From Microsoft's docs (confirmed 2025 FAQ):

- **Included in Concordia's A3/A5 license.** No extra cost.
- **Per-service URLs exist.** In the Bookings app → *Services* → *Service details*, each service gets its own shareable URL. Perfect fit for the `bookingUrl` column already in the sheet.
- **Org-only booking is the mode we want.** "Require a Microsoft 365 account from my organization to book" = ON. Only authenticated Concordia accounts can book. No tenant-policy risk (we're not asking for anonymous sharing, which is what blocked OneDrive).
- **iframe embed is supported.** Bookings page → *Embed* → copies an `<iframe>` snippet. Cross-origin works.
- **Group bookings (1:many)** are supported — fits workshops.
- **Teams meeting link auto-generated** per booking. Fits consultations.
- **Cloud-only.** Doesn't work in federated/hybrid Exchange. Concordia is cloud M365 so this is fine.
- **No payment support** — not relevant here.

## Smoke test (30 min)

Not a gate anymore — just confirming the happy path works.

1. Go to https://outlook.office.com/bookings/
2. Create a test Bookings calendar — name it `pathways-test`.
3. Add one service — "Test Consult 15 min", 1:1, Teams meeting enabled.
4. On *Booking page* tab, leave "Require a Microsoft 365 or Office 365 account from my organization to book" **checked**.
5. Copy the service URL (from *Services* → *Service details*).
6. Open it in a fresh browser session — confirm it asks for Concordia sign-in and lets you book.
7. Check that a Teams invite lands in the test calendar.

If any of that breaks, loop back before writing site code.

## Architecture options

### Option A — Direct link out (simplest, always works)

Each service has a `bookingUrl` column. "Book" button → `window.open(bookingUrl, "_blank")`. The booking modal stops being a form and becomes a tiny pre-flight screen ("You'll be redirected to Microsoft Bookings to pick a time").

- **Pro:** works even if tenant blocks embedding. Zero CORS/iframe risk. No site-side session state.
- **Pro:** coordinator just pastes the per-service URL into the sheet.
- **Con:** user leaves the site. Lose the ability to show our own confirmation/analytics/brand.
- **Effort:** ~1 hour. Replace the fake form's submit handler with a redirect.

### Option B — Iframe embed in modal (best UX if allowed)

Clicking "Book" opens the existing modal, but the body is an `<iframe src="${bookingUrl}">`. User picks time/enters details inside our modal.

- **Pro:** stays in-site. Feels native.
- **Pro:** still coordinator-driven — they paste the URL, we embed it.
- **Con:** have to verify Concordia tenant allows framing (X-Frame-Options / CSP). Microsoft generally permits this but some tenants override.
- **Con:** iframe is ~600–800px tall, a bit clunky on mobile.
- **Effort:** ~2–3 hours. Swap modal body, size the iframe, handle loading/error states.

### Option C — Hybrid (recommended)

Default to **iframe embed** (Option B). If the iframe fails to load within ~3s (CSP block, network error), fall back to an "Open booking in new tab" button that does Option A.

- **Pro:** best available UX with a clean degradation path.
- **Pro:** survives tenant policy changes without redeploying.
- **Effort:** ~3–4 hours.

### Option D — Graph API custom UI (don't do this)

Use the Bookings Graph API to fetch availability and POST new appointments from our own UI.

- **Pro:** totally native UX.
- **Con:** requires app registration, admin consent, token handling on a static site (effectively impossible without a backend), full schema of service/staff/availability to mirror. Not worth it for a prototype.
- **Verdict:** ignore unless we get a real backend later.

## Recommendation

**Option C (hybrid).** Defaults to the good UX, falls back cleanly, doesn't commit to assumptions we haven't verified.

## Provider side — setup & tracking

The questions coordinator and service owners will ask. Three parts: setup, tracking, and what to do with the data.

### Setup: who has to do what?

MS Bookings has two flavors. Choice affects setup burden and who owns what:

**Personal ("Bookings with Me")** — what we're using now.
- Each advisor sets up their own page (meeting types, availability) on their Concordia mailbox.
- They hand the per-service URLs to the coordinator, who pastes them in the sheet.
- Availability comes from their Outlook calendar automatically (meetings block slots).
- **Downside:** every advisor does their own setup. No shared admin view. If someone leaves, their Bookings page goes away.

**Shared Bookings page** — recommended once we're past one advisor.
- Coordinator (or a generic `pathways@concordia` mailbox) owns one Bookings calendar.
- Each advisor is added as **staff** — one email invite, one "approve" click on their end.
- Coordinator defines the services once (name, duration, Teams on/off, custom questions).
- Each staff member's Outlook calendar still drives their availability automatically — they just keep using Outlook as normal.
- **What staff actually have to do after accepting:** nothing recurring. Their calendar blocks themselves.
- **What coordinator has to do:** service definitions, assigning which staff can fulfill which service, any global policy (min lead time, buffer, etc.).

Effort to switch from personal → shared: ~1 hour admin + 5 minutes per staff member (accept invite, share free/busy to the Bookings mailbox).

### Tracking: what data can we actually get?

MS Bookings captures per booking:
- Attendee name, email, any custom questions we add
- Service booked + staff assigned
- Date/time + cancellations + reschedules
- Teams meeting link + join status (via Teams telemetry, separate)

Access paths, easiest → hardest:

1. **Manual TSV download** — Bookings admin UI has "download bookings" (past 120 days). Fine for occasional review, bad for dashboards.
2. **Power Automate → Google Sheet** (recommended). Trigger "When a new appointment is created" → append row to a `bookings_log` tab in the same sheet that drives the site. Coordinator gets a live, queryable log with no engineering. Same pattern we already proved for content, just reversed direction.
3. **Graph API** — fully programmatic. Requires Entra app + admin consent (same blocker as Option A). Use only if we also need real-time dashboards.

**Custom questions are the lever.** Each service in Bookings can have custom required fields. Good candidates:
- Department / faculty
- Career stage (grad student, postdoc, faculty, staff)
- Which pathway you're working on (dropdown matching our 6 pathways)
- Funding deadline or project stage
- How did you find this service (site, referral, email)

These answers show up in every booking — now the log gives you service adoption patterns by department, pathway relevance by career stage, etc.

### What we can do with the tracking

Low-effort wins:
- **Usage by service** — which workshops are filling up vs sitting empty. Drop unused ones, promote popular ones.
- **Time-to-book** — how far in advance people book. Informs lead-time policy.
- **Drop-off in booking funnel** — page views to the service card (add analytics) ÷ bookings = conversion. Identifies copy/positioning problems.
- **Repeat bookers** — same email across services = engaged user. Worth a follow-up conversation.
- **Cross-pathway patterns** — "people who book Impact Framing also book X" → related-services suggestions on the site.

Medium effort (needs a second flow):
- **Post-booking feedback** — Power Automate on "appointment ends" → send a Google Form link to the attendee. Closes the loop on service quality. Plug feedback into the same sheet.
- **No-show tracking** — add a checkbox to the staff's post-meeting prompt, or infer from Teams attendance data.

What we can't easily do without more infra:
- Cross-user identity across bookings (no "user account" concept — email is the only anchor).
- A/B testing card copy → booking conversion (needs site-side analytics instrumentation too).
- Automated reminders beyond what Bookings already sends.

### Recommended staffing/tracking rollout

1. **Now** (Prem solo): keep personal Bookings with Me. Track by eyeballing your mailbox.
2. **When advisor #2 joins:** create the shared Bookings page owned by `pathways-bookings@concordia` (or similar). Migrate services. Both advisors added as staff. URLs in the sheet swap to the shared page's per-service URLs.
3. **At the same time:** stand up the Power Automate → Google Sheet flow. Target a new `bookings_log` tab in the existing sheet.
4. **When you have 20+ bookings:** add custom questions (dept, stage, pathway) to every service. From that point on every booking feeds a useful record.
5. **At ~3 months:** look at the log. First view: services sorted by bookings. First cut decisions on what to keep, cut, rename.

## Phased rollout

1. **Gate check** (30 min, no code): run the critical-gate test above. If it fails, jump to Option A only.
2. **One test service** (~1 hr): pick one workshop (e.g. "Impact framing consult"), create it in Bookings, paste the per-service URL into the sheet's `bookingUrl` column. Confirm the sheet-driven booking modal picks it up.
3. **Wire the modal** (~3 hrs): build the iframe-with-fallback modal. Behind a feature flag (`BOOKINGS_ENABLED = false` initially) so it doesn't ship until ready.
4. **Spot check on live branch** before enabling.
5. **Coordinator onboarding** (~1 hr with coordinator): show them the Bookings admin UI, how to add a service, where to copy the per-service URL, where to paste it in the sheet. Document it in `INTEGRATION_NOTES.md`.
6. **Bulk populate**: fill `bookingUrl` for remaining services/workshops. Services without a URL continue to use the current Formspree request form (no regression).

## Implementation sketch

### Sheet side
- `bookingUrl` column already exists across all three tabs.
- Empty = no booking offered for that item; show a "Request this service" Formspree form (the current behavior).
- Non-empty = offer real booking.

### Site side
- New config block near `SHEETS`:
  ```js
  const BOOKINGS = {
    enabled: false,  // flip to true when ready
    iframeTimeoutMs: 3000
  };
  ```
- Rewrite `openBookingModal(opp)`:
  ```
  if (BOOKINGS.enabled && opp?.bookingUrl) {
    renderBookingIframe(opp);  // iframe + spinner + timeout fallback
  } else if (opp?.bookingUrl) {
    // soft redirect: "Opens Microsoft Bookings in new tab"
  } else {
    renderRequestForm(opp);  // current Formspree flow
  }
  ```
- `renderBookingIframe`:
  - Insert `<iframe src=opp.bookingUrl sandbox="allow-scripts allow-forms allow-same-origin allow-popups" referrerpolicy="no-referrer">`
  - Start a timer; if iframe hasn't fired `load` within 3s, swap to "Open in new tab" button with the URL.
  - Wrap in the existing `.booking-modal` CSS for visual consistency.

### Analytics
- Bookings itself tracks completed appointments in the calendar mailbox.
- Optional: fire a lightweight beacon when the modal opens (not a completion signal — iframe same-origin restrictions prevent seeing whether the user finished booking).

## Risks & mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| iframe blocked by CSP/X-Frame-Options | Low-Medium | Hybrid fallback to new-tab redirect. |
| Iframe + Concordia SSO loop (sign-in redirect broken in iframe) | Medium | This is the most likely real issue — MS login often refuses to render inside an iframe. If so, Option A (new-tab redirect) becomes the default, not the fallback. |
| Coordinator finds Bookings UI confusing | Medium | ~30-min walkthrough, short cheat-sheet in the integration notes. |
| Per-service URL format changes | Low | URL is stored in the sheet, coordinator updates it — no code change. |
| Non-Concordia researcher tries to book (external collaborator) | Low | They're not the audience. If it comes up, coordinator can book on their behalf. |

## Settled questions

1. **Calendar ownership** — short-term: each advisor's own *Bookings with Me* (currently just Prem). Medium-term: one shared `pathways-bookings@concordia` mailbox with advisors as staff. Switch happens when advisor #2 joins.
2. **Which services are bookable** — only rows with a non-empty `bookingUrl`. External resources (`external-resources` tab) never have one. Workshops and opportunities optional per row.
3. **Workshops + consultations both in scope** — yes, both. Same `bookingUrl` mechanism; the modal CTA copy adapts (*Book a consultation* vs *Register for this workshop*).
4. **LibCal vs Bookings** — Bookings. LibCal subscription never activated; the `libcalUrl` column has been removed from the codebase and should be deleted from the sheet.

## Staying on the page (the "no new tab" question)

Confirmed live: MS Bookings refuses to be iframed. `X-Frame-Options: DENY` is sent on every Bookings page, including Bookings with Me. This is a clickjacking protection set by Microsoft; no tenant setting, query param, or sandbox attribute defeats it.

So "stay on the page" with MS Bookings specifically has three real options:

### Option A — Build our own booking UI via Graph API (big lift, keeps MS Bookings)

- Register an Entra app → admin consents to `Bookings.Read.All` + `Bookings.ReadWrite.Appointments`.
- Stand up a tiny backend (Azure Function / Cloudflare Worker / Vercel function — all have free tiers) that holds the token and exposes two endpoints: `GET /availability?service=X` and `POST /appointments`.
- Site fetches availability, shows our own slot picker, on submit POSTs to our backend which calls Graph.
- Concordia Entra admin consent is a real blocker — needs IT approval, not self-serve.

**Effort:** ~1–2 weeks of work (backend, auth, UI, testing). **Cost:** $0 on free tiers. **Risk:** IT approval timeline, and Bookings Graph API is in beta — shape can change.

### Option B — Switch to an embed-friendly provider (medium lift, stops using MS Bookings)

Most modern booking tools embed cleanly via iframe (Cal.com, Calendly, SimplyBook.me, YouCanBookMe, Acuity, etc.). Re-create services in the new tool, paste embed URLs into the sheet's `bookingUrl` column, tweak modal to iframe.

**Effort:** ~1–2 days. **Cost:** depends on provider (Cal.com free for 1 user; Calendly free tier limited).

> LibCal was previously the leading alternative here because Concordia Library uses it. **Removed from consideration as of 2026-04 — Concordia did not subscribe.** The dead `libcalUrl` column has been pulled from both the code and (next coordinator step) the sheet.

### Option C — Accept the redirect (zero lift, current production)

What's live today. One click → new tab → Microsoft Bookings. Honest, fast, no engineering.

**Effort:** 0. **Cost:** 0. **Cost-of-UX:** user leaves the site briefly.

### Recommendation

**Stay on C** unless the coordinator or users start saying the new-tab handoff is hurting conversion. If that happens, Option B (a cleanly-embeddable provider) becomes the realistic next move; Option A is only worth the cost if there's a strong reason to keep MS Bookings specifically (calendar/mailbox integration with Outlook) **and** IT will approve an Entra app registration.

Decision points to revisit if the move is on the table:
- Does the coordinator find managing services in MS Bookings tolerable? If migrating to a new tool means re-doing setup work, the bar for "this is worth it" is higher.
- Is IT willing to approve a Bookings Graph app registration? If no, A is dead on arrival, and B is the only path forward.
