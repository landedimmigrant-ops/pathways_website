# Bookings Status & Waitlist — Plan

How the site shows whether a workshop or consultation is full, and how researchers join a waitlist when it is. Companion doc to `BOOKINGS_PLAN.md`, which covers the broader MS Bookings integration.

## Status (2026-05-06)

**Live (Phase 1, manual sync):** A `status` column on the `workshops` and `place_holders` sheet tabs drives the card UI. Coordinator types `full` / `cancelled` / blank into the cell; the site renders a pill on the card and swaps the booking button for a waitlist form when full. Waitlist signups go to the existing Formspree inbox tagged `intent: waitlist`. Shipped in commit on `integration-prototype`.

**Parked (Phase 2, automated sync):** Closing the loop so the coordinator doesn't have to manually flip cells when MS Bookings says a session is full. Three viable paths, all deferred until the manual workflow either creaks under volume or the coordinator asks for it.

## Phase 1 — what's live

### Sheet side
- New optional `status` column on `workshops` and `place_holders` tabs. Recognised values (case- and whitespace-insensitive):
  - blank or `open` → bookings on (default; existing behaviour unchanged)
  - `full` / `fully booked` / `booked` / `waitlist` → bookings off, waitlist on
  - `cancelled` / `canceled` / `off` / `closed` → bookings off, no waitlist
- `external-resources` doesn't take bookings, so the column isn't needed there.
- Coordinator workflow documented in `COORDINATOR_GUIDE.md` → "Marking a workshop or consultation as full".

### Site side
- New helpers in `app.js`: `normaliseStatus(raw)`, `getStatus(opp)`, `statusPill(status)`.
- Card render (4 sites: home featured, pathway tab, research-stage panel, browse all): adds a pill in the header strip when status ≠ open. Adds `is-full` / `is-cancelled` modifier classes to the card for subtle visual treatment.
- Modal CTA: button text becomes "Join the waitlist" when status=full; replaced with a static note when status=cancelled.
- `openBookingModal`: when status=full, skips the MS Bookings new-tab redirect and falls through to the form path in waitlist mode.
- Form in waitlist mode: title becomes "Join the waitlist", banner explains why, intent radio is hidden and pre-set to `waitlist`, hidden `service_status` field carries the status into the Formspree payload, submit button reads "Join waitlist", confirmation copy adapts.
- Mirrored in `scripts/bake.js` so baked-mode JSON includes the `status` field.
- New CSS: `.status-pill` (with `--full` / `--cancelled` variants), `.modal-status-note`, `.booking-waitlist-banner`, `.popular-card-header`, plus `is-full` / `is-cancelled` card modifiers.

### Tradeoffs accepted
- Coordinator is the source of truth — no automatic detection of "full" from MS Bookings.
- Latency = sheet edit → ~1 min to live (acceptable; people don't book at second-by-second resolution).
- Waitlist-only behaviour. We don't surface a count ("12 on the waitlist") because we don't have one.
- Coordinator manually emails waitlisted folks when a seat opens (Formspree gives the list; mail merge or copy-paste is fine at current volume).

## Phase 2 — automated sync (parked)

Three options, ordered by org friction.

### A. Power Automate → sheet (lowest friction, Microsoft-native)

When MS Bookings fires "appointment created" / "appointment cancelled", a Power Automate flow appends to a `bookings_log` tab in the same sheet and increments / decrements a counter. A second flow flips the `status` cell when the count hits capacity.

- Already on the BOOKINGS_PLAN.md roadmap (Phase 2, item 3) for booking analytics — extend it to also drive `status`.
- Stays inside Concordia's licensed M365 stack. No new vendors, no IT review.
- Limitation: does only the dumb sync. No "draft outreach" or anomaly flagging.

### B. Scheduled Claude Code agent (uses subscription as the runtime)

A cron job (Claude Code's `schedule` skill) runs every 15–30 min. Agent reads MS Bookings — via Graph API if IT approves an Entra app, or by driving an authenticated browser session via Claude in Chrome — counts bookings per service, writes to the sheet's `status` column. Subscription bundles the runtime, so no infra to host.

- Beyond just toggling `status`, the agent can:
  - Flag patterns weekly ("3 waitlisted on Workshop X in 7 days — schedule a repeat?")
  - Draft "your spot opened" emails when status flips back to open
  - Reconcile mismatches between the sheet and MS Bookings
  - Summarise weekly booking activity for the coordinator
- Limitation: browser automation is brittle when MS changes UI; SSO sessions expire and need re-auth. Graph API path is solid but needs Entra app registration + admin consent (real IT blocker, weeks).
- Cost: bundled in the existing Claude subscription. No serverless function, no additional vendor.

### C. Hybrid (recommendation if/when we automate)

Let Power Automate (A) handle the boring sync — booking count → status cell — because it's reliable and stays in M365. Layer a weekly Claude agent (B) on top to do the *interesting* work: summarise, flag stalls, draft waitlist outreach, reconcile anomalies.

- Reliability where it matters (sync), intelligence where it pays off (judgement).
- Doesn't make the core plumbing depend on a Claude subscription staying active — if the agent goes away, the data sync still runs.
- Higher upfront effort than A or B alone (~1 week of setup), but the smaller pieces are independently useful.

## When to revisit

Triggers for unparking Phase 2:

- Coordinator says manual flipping is taking real time (>15 min/week).
- More than ~5 services running concurrently with mixed availability.
- Multiple "I tried to book and it was already full but the site said open" reports.
- Adding a second advisor (Phase 2 of `BOOKINGS_PLAN.md`'s staffing rollout) — that's also when the shared Bookings page gets created, which is the natural moment to set up Power Automate.
- If we want auto-drafted waitlist outreach badly enough to set up the Claude agent for it specifically.

Until then: Phase 1 (manual `status` column) is the right level of automation.

## Decision log

| Date | Decision | Why |
|---|---|---|
| 2026-05-06 | Ship Phase 1 (manual `status` column + waitlist via Formspree) | Lowest lift, unblocks coordinator workflow today, doesn't preempt automation choices later. |
| 2026-05-06 | Park Phase 2 (Power Automate / Claude agent / hybrid) | Volume doesn't justify it yet; manual is fine until coordinator says otherwise. |
