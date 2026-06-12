# Migration Version — User Review Issues

**Branch:** `migration-version` (the current site, treated as the version heading to concordia.ca)
**Method:** Clicking through the site in a browser as a user (desktop + mobile viewports), checking console/network as I go.
**Last updated:** 2026-06-12 (iteration 1)

Working list, updated each loop iteration. Each issue states what a user hits and the change I would make. Nothing here has been applied to the code — list only.

---

## Open issues

### 1. "All Resources" tab is dead while a pathway detail is open — `High / Bug`
With a pathway detail open (e.g. Community Engagement), clicking the **All Resources** tab updates the URL to `#explore?pathway=community&tab=browse` but the view never switches — the Pathways tab stays active and the pathway detail stays on screen. The user's click looks ignored. The hidden browse panel is also silently filtered to "Showing 11 of 11 resources" by the lingering pathway.
**Change I would make:** On tab click, clear the `pathway` param and actually switch to the browse view. If pathway-scoped browsing is intended, show a visible, dismissible filter chip ("Pathway: Community Engagement ×") instead of a silent filter.

### 2. URL ↔ state desync around the service detail view — `High / Bug`
Open a resource card → URL correctly gains `service=ext-…` (deep-linkable, good). But: a **stale `pathway` param resurfaces** in the hash even after the user has left that pathway, **Esc does not close** the detail view, and browser **Back closes it onto the wrong view** (the old pathway detail rather than the All Resources list the user was on), at a mid-page scroll position.
**Change I would make:** Make the hash the single source of truth — drop stale params when leaving a view, wire `Escape` to close the takeover, and make close/Back return to the exact list state (tab, page, scroll) the user came from.

### 3. Planner "Start →" appears to do nothing — `High / UX`
On Learn → Tools, clicking **Start →** on *Plan Your Impact* mounts the planner ~1,300 px below the fold and the page doesn't scroll. Nothing visibly changes; the user sees the same two cards and assumes the button is broken.
**Change I would make:** Scroll the planner into view on start (or swap it into the cards' position). Same check applies to *Build Your Narrative CV*'s Start.

### 4. Scroll position is not reset on navigation — `Medium / UX`
Switching views or tabs (Learn → About, tools tab, closing the service view) keeps the previous scroll offset, so users land mid-page with the header scrolled off — it reads as a broken/blank page (this is what made the header "disappear" twice during testing).
**Change I would make:** `window.scrollTo(0, 0)` on every route/view change; keep browser-native restoration only for back/forward.

### 5. Pathway / research-stage selection doesn't update the URL — `Medium / Shareability`
Inbound deep links work (`#explore?pathway=community` restores the detail after reload), but clicking a pathway leaves the hash at `#explore` — so refresh loses the view and users can't share/bookmark it. Inconsistent with the service detail, which *does* write `service=` to the URL.
**Change I would make:** Write `pathway=` / research-stage params to the hash on selection, mirroring the service-detail behaviour.

### 6. Home carousel exposes hidden slides to keyboard & screen readers — `Medium / A11y`
All 7 hero slides stay fully visible to assistive tech (`aria-hidden`/`inert` absent, opacity 1) and off-screen slides contain ~5 focusable links — keyboard users tab into invisible content; screen readers read all slides at once.
**Change I would make:** `aria-hidden="true"` + `inert` on non-active slides, toggled on slide change; announce slide changes via a polite live region.

### 7. Service detail takeover isn't a proper dialog — `Medium / A11y`
The full-screen service view has no `role="dialog"` / `aria-modal`, and focus stays on `<body>` when it opens — keyboard/SR users are left behind on the list (combined with no-Esc from issue 2).
**Change I would make:** `role="dialog"`, `aria-modal="true"`, move focus to its heading on open, trap focus inside, restore focus to the originating card on close.

### 8. "Impact" definition inconsistency between Home and Learn — `Low / Content`
Home (carousel slide 2) is careful that impact "can be **positive or negative**"; Learn's intro defines research impact as "the **positive** change that results from research activities…". For a site whose framing is the official Concordia definition, the two contradict.
**Change I would make:** Align Learn's intro with the Home/official definition (drop "positive", or rephrase as "the change…").

### 9. Contact email is plain text, address unverified — `Low / Content`
About → Contact Us shows `impact@concordia.ca` as plain text — not clickable. And before this ships to concordia.ca, someone should confirm that inbox actually exists (it reads like a prototype placeholder).
**Change I would make:** Wrap it in `mailto:`; verify the address (or swap in the real one) before migration.

### 10. "Showing 1 of 1 resources" — `Low / Copy`
Singular/plural isn't handled in the results count (search for "narrative" → "1 of 1 resources").
**Change I would make:** Pluralize: "resource" when the count is 1.

### 11. Unknown hashes silently show Home — `Low / Routing`
`#garbage-route-xyz` renders Home but the bad hash stays in the URL (and would be copied/shared).
**Change I would make:** Normalize unknown hashes to `#home` (history.replaceState), or show a small "page not found" state.

---

## What checked out fine

- No console errors or warnings, no failed network requests across every page visited.
- All Resources (clean state): 23 items, search, all 4 filter dropdowns, and pagination (12/page) work; deep link `#explore?tab=browse` works.
- Learn: NCV guide module opens with working accordions and "← Back to Learn"; planner steps advance correctly once found.
- About: native `<details>` accordions (keyboard-accessible by default); Pathways Vision page loads.
- Mobile (375px): correct viewport meta, no horizontal overflow, hamburger toggles with proper `aria-expanded`.

## Coverage tracker

| Area | Status |
|---|---|
| Home (intent cards, carousel) | ✅ iteration 1 |
| Explore · Pathways tab + Community Engagement detail | ✅ iteration 1 |
| Explore · All Resources (search, filters, pagination, service detail) | ✅ iteration 1 |
| Learn · Impact 101 + NCV guide + Tools + planner | ✅ iteration 1 |
| About + Pathways Vision | ✅ iteration 1 |
| Mobile spot-check (home, nav) | ✅ iteration 1 |
| Explore · Research Stage tab + stage detail | ⏳ next |
| Remaining 6 pathway details (content + related resources) | ⏳ next |
| Filter combinations + zero-result states | ⏳ next |
| NCV Builder tool (`#tools-narrative`) — flagged as "being reworked" | ⏳ next |
| Keyboard-only walkthrough (skip link, tab order, focus visibility) | ⏳ next |
| Mobile pass on Explore + service detail | ⏳ next |
| Footer links + external-link sweep | ⏳ next |
