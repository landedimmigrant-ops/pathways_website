# Researcher-User Review — Pathways to Impact

**Date:** 2026-06-09 · **Reviewer:** Claude (simulated researcher walkthrough)
**Persona:** Mid-career faculty member, SSHRC-funded, community-engaged research, preparing a grant application and wanting to plan public engagement.
**Scope:** Main SPA (`index.html` + `app.js`), desktop + mobile viewports. NCV standalone prototypes (V3/V4) out of scope.

---

## Overall impression

The site does the most important thing right: it answers "what would you like to do?" instead of "here is our org chart." The task-oriented home, the three-lens Explore page (Pathways / Research Stage / All Resources), and the genuinely substantive service detail pages make it easy for a researcher to get from a vague goal ("I want my work to reach policymakers") to a concrete next step (book a consultation) in two or three clicks. Content quality is high — service pages read like they were written by someone who has sat in the consultations. The prototype is honest about being a prototype (beta banner, "request is logged locally" messaging), which builds trust rather than eroding it.

The issues below are mostly polish and consistency, with one real data bug and one real accessibility gap.

---

## What works well

- **Task-first information architecture.** The four home cards map cleanly onto researcher intents (explore pathways / find by stage / learn / get help). The pathway detail's "You might explore this pathway if you want to…" framing is exactly how researchers self-identify.
- **Service detail pages are excellent.** Relevance for Impact, Who It's For, Outcomes, Format, Materials Provided, named service providers — this is the page a researcher screenshots and sends to their RA. "Researchers who used this also found…" is a nice discovery touch.
- **Booking flow is short and honest.** Three radio intents, name, email, optional context. The confirmation states clearly that the endpoint isn't live yet and gives a fallback email. Esc and ← Back both behave; the URL deep-links (`#explore?service=…&book=1`), so a booking link is shareable.
- **Plan Your Impact tool respects the user's time.** Five stages, change statement carried forward into later steps, work persists in localStorage, and the intro card shows "1 of 5 sections complete — Resume at Step 2" on return. Resume actually resumes.
- **NCV builder basics are solid.** Draft-saved banner, per-section status on the Review step, self-check checklist, download/copy/start-over.
- **Accessibility fundamentals are mostly present.** Skip link, real `<button>` pathway cards, `aria-expanded` on the mobile hamburger, Esc closes modals, carousel has pause control and slide tablist, external links use `target=_blank` + `noopener` + ↗ affordance.
- **Clean console.** No errors or warnings across the full walkthrough.

---

## Bugs

1. **Duplicate "Finishing a Project" in the contact form's stage dropdown.** [app.js:4264](app.js:4264)–4265 defines two options (`finishing` and `wrapping`) with the same label — leftover from a rename. One should be removed (check which value the form handler expects).
2. **Stage-activity chips look like filters but do nothing.** On a Research Stage detail (e.g. Active Research), the chips ("Reporting to funders", "Engaging partners & communities"…) are rendered as `<button>` pills. Clicking one changes nothing — no filtering, no pressed state. A researcher's natural expectation is that clicking "Reporting to funders" filters the related resources. Either wire them as filters or render them as non-interactive labels.
3. **NCV builder step navigation is keyboard-inaccessible.** The sidebar steps (`li.narrative-stage-item`) are plain `<li>` elements with click handlers — no `role="button"`, no `tabindex`, no focus state. Keyboard and screen-reader users cannot jump between steps. Inconsistent with the lifecycle stages elsewhere ([app.js:1562](app.js:1562)) which correctly use `role="button" tabindex="0"`.

---

## UX friction (worth fixing before wider release)

4. **Search doesn't match pathway or stage metadata.** Searching "policy" in All Resources returns 3 text matches but misses services explicitly tagged with the Policy pathway (5 in data.js). Researchers will search in the site's own vocabulary — pathway names, stage names — and conclude the catalogue is thinner than it is. Index `pathway`, `stage`, and tag fields in the search.
5. **Empty search state says "No matching opportunities."** Everywhere else they're "resources." Small, but terminology drift in a reference tool reads as unfinished.
6. **Learn tabs and the planner don't deep-link.** Explore writes `?tab=browse` to the URL; Learn's Impact 101 / Tools tabs write nothing, and opening the Plan Your Impact tool leaves the hash at `#learn` (while the NCV builder does get `#tools-narrative`). A coordinator can't email someone a link to "the planner." Make Learn tabs and the planner addressable like Explore.
7. **Invalid `?tab=` tokens silently persist.** `#explore?tab=all` falls back to the Pathways tab but keeps the junk param in the URL — URL and UI disagree. Either normalize the hash or drop the bad param.
8. **Related-resource cards don't truncate descriptions.** In "Researchers who used this also found…", the Evaluating Digital Scholarship card renders its full ~120-word description, towering over its neighbours. List cards elsewhere truncate with "…" — apply the same clamp here.
9. **Mobile carousel slides have large dead zones.** On 375px, slide 2 ("What do we mean by change?") stacks its two desktop columns with roughly a screen-height of empty space between the text block and the "IMPACT CAN BE…" list, with the prev/next arrows floating mid-gap. Tighten slide internal spacing at the mobile breakpoint.
10. **Booking/contact forms rely on native validation only.** Submitting empty just focuses the first `required` field (plus the browser bubble). Fine for a prototype; inline error text would be more accessible and more obvious.

---

## Content & strategy notes

11. **Featured section has exactly one card.** A "Featured" rail with a single item reads as unfinished. Either populate it (rotate 2–3 seasonally relevant services) or drop the section until there's content.
12. **Learn module headers double up.** The NCV module shows "What is a Narrative CV?" as the page h1 and again as the section h2 directly beneath, with a "BEFORE YOU START — STEP 2" kicker whose sequence ("step 2 of what?") is unexplained when arriving from Learn.
13. **Pagination at 6 per page hides a small catalogue.** 21 resources across 4 pages means a browsing researcher never sees the whole offer. Consider 12 per page or a "show all" toggle; with a list this small, scanning beats paging.
14. **English-only.** Expected for the prototype, but as this heads to concordia.ca (bilingual AEM), worth flagging that several UI strings (tab labels, form labels, empty states) currently live in JS and will need a translation path, not just content translation.

---

## Walkthrough log (what was tested)

- Home: hero carousel (7 slides, pause/prev/next/dots), 4 intent cards, Featured, footer.
- Explore → Pathways → Community Engagement detail → resource filters → 4th Space service detail → full booking flow (validation, submit, confirmation, back).
- Explore → Research Stage → Active Research + Developing an Idea → activity chips, resource pagination.
- Explore → All Resources → search ("policy", no-result query), stage/type/time filters, external-resource detail modal.
- Learn → Impact 101 → "What is a Narrative CV?" module; Tools → Plan Your Impact (steps 1–2, reload persistence, resume) and Build Your Narrative CV (step nav, Review & Download).
- About: partners accordion (link text + new-tab behaviour verified), contact form fields, footer feedback modal (open, categories, Esc).
- Mobile (375px): nav hamburger, home cards, carousel.
- Console: clean at every step.
