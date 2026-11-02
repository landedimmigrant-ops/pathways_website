# Round 15 findings: Fable's review of round 14, a nursing researcher with dyslexia and ADHD, a permafrost engineer working offline, 2026-11-01

Recorded from the three agents' final replies. All walked the round 15 snapshot (= commit 21a07b8).

## Fable review of round 14 (Y-1 to Y-8): 1 blocker · 2 major · 5 minor

Checked and sound: the early-career length line at both ends; stage notes with announce; Undo ended before Review; the storage handler's Reset mirror; the phone alert; link lookaheads; the X-11 strip.

- **Y-1 · blocker (run).** A comment swallowed `up.disabled = pos === 0;`, so the first card's Move up threw an error. → **Fixed.** A scan of the whole file for code hidden behind a trailing comment found no other case.
- **Y-2 · major (run).** Undo survived click-made changes (adding a card or an item, choosing a kind). → **Fixed:** a change event, or a click on a button that changes something, ends it too.
- **Y-3 · major (run).** The name-run guard dropped ordinary French lines ("Encadrement de quinze stagiaires au laboratoire"). → **Fixed:** "de / du / des / au / aux" before a lower-case word count as French; the guard skips the line's first word.
- **Y-4 · minor.** The .txt said "Still missing" and "fine to leave empty" in one bracket. → **Fixed:** "Name something concrete if it has changed; if nothing has yet, say so under What could change."
- **Y-5 · minor.** Kept messages piled up on Export. → **Fixed:** one message per card; a repeat says "again".
- **Y-6 · minor.** A tab restored from the back-forward cache did not mirror a Reset made elsewhere. → **Fixed.**
- **Y-7 · minor.** The STEM kind hints hid the preprint guidance. → **Fixed.**
- **Y-8 · minor.** The early-career Mentorship question rarely won. → **Fixed:** community-engaged first, then early career, then largely solo, then the field.

## r15-a · mid-career nursing researcher with dyslexia and ADHD, CIHR Project Grant (TCV), Health, team-based and community-engaged, interrupted mid-step and returning: 1 major · 7 minor · 4 polish

A nurse-led falls-prevention program in long-term care, a night-shift medication-safety checklist, training personal support workers; 18 trained; six statement parts; 705 words ([draft](r15-a-draft.txt)). The one-question-at-a-time focus, Undo, the Welcome-back link and the back-forward cache restore carried her through without losing work.

- **r15-a-1 · major.** A role sentence typed in The problem or question got ticks ("Your own role is named"). → **Fixed:** "This reads like your role. Your role has its own part below; here, say what problem or question the work took up." No ownership praise in that part.
- **r15-a-2 · minor.** Long help blocks before the first action. → **Fixed in part:** the people note is five short lines. The other long blocks are listed for Prem with the plain-language rewrites (Q-6).
- **r15-a-3 · minor.** The read across contributions listed generic words. → **Fixed:** five words at most, more generic words left out.
- **r15-a-4 · minor.** "1 word" for an empty note. → **Not reproduced.**
- **r15-a-5 · minor.** Evidence opened from Still missing lands mid-panel. → **Open.**
- **r15-a-6 · polish.** The level and the line repeated in the folded role. → **Fixed;** the help reads "The level is for the charts; your line is what prints."
- **r15-a-7 · polish.** Rail numbers have no visible unit. → **Open.**
- **r15-a-8 · polish.** "gov-ernment" hyphenated in a tile. → **Fixed:** no hyphenation; whole words wrap.
- **r15-a-9 · minor.** Nothing prompted a proofread. → **Fixed:** a Proofread line in the self-check.
- **r15-a-10 · polish.** The Welcome-back link did not say where it goes. → **Fixed:** "Go to your next unanswered question: Contribution 2: What resulted."
- **r15-a-11 · minor · field fit.** Health outputs and the health-system destination. → **Fixed (INFERRED copy):** guidelines and care pathways in What resulted; "Health system (hospital, long-term care, public health, CISSS/CIUSSS)".
- **r15-a-12 · polish.** The Contributions step shows done with evidence missing. → **Open.**

## r15-b · mid-career geotechnical engineer, NSERC Discovery (TCV), STEM, community-engaged and partnered, writing offline at a northern field station: 7 minor · 5 polish

A ground-temperature network for a territorial highway crew, a design guide adopted as a standard, Inuit and First Nations community monitors; 35 trainees; the full statement; about 1,180 words ([draft](r15-b-draft.txt)). Everything worked offline once loaded: writing, autosave, Review charts, Word, .txt, section copies, Save a draft file and print view, with no network calls. The print view is Letter with 2 cm margins and no tool notes.

- **r15-b-1 · minor.** Reloading offline gives the browser's error page, and nothing said so. → **Fixed (copy):** the privacy line says the tool needs a connection to open, works without one once open, and to save a draft file before closing.
- **r15-b-2 · polish.** Guide links fail offline with no hint. → **No change.**
- **r15-b-3 · minor.** The print view is a snapshot that empties on reload. → **Fixed (copy):** its note says so.
- **r15-b-4 · minor.** No keep-with-next in print and Word. → **Fixed:** headings and headlines keep with what follows; evidence boxes do not split.
- **r15-b-5 · polish.** Evidence notes read as part of the item. → **Fixed:** set in italics, indented.
- **r15-b-6 · minor.** "works with a First Nations, Inuit or Métis government or organization" with no organization. → **Fixed:** "now works in a First Nations, Inuit or Métis organization".
- **r15-b-7 · minor.** The chart label "Indigenous government or org." differed from the form. → **Fixed:** "First Nations, Inuit or Métis".
- **r15-b-8 · minor · field fit.** The community role example is not an engineering one. → **No change** (the partners-lead example applies across fields; Q-22).
- **r15-b-9 · minor · field fit.** Design guides, standards and technical reports were missing from What resulted. → **Fixed.** "Highly qualified personnel" is not added (agency wording; Q list if wanted).
- **r15-b-10 · polish.** A health-centre example for a community researcher in a STEM profile. → **Fixed:** "now coordinates a community research program".
- **r15-b-11 · polish.** The chart's Exhibition label. → **No change** (r9-a-9).
- **r15-b-12 · polish.** "gov-ernment" in a tile. → **Fixed** with r15-a-8.
