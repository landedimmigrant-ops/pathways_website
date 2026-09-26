# Narrative CV guide on the Concordia dev site: review and correction log

Internal working document for Prem and Claude. Written 2026-09-21, about one week before launch.

**Reviewed:** `http://cms-prod-a6-prepub.concordia.ca:4503/content/concordia/en/web/in-dev-ucs-staff/andrei/pathways-to-impact/learn/impact-101/narrative-cv.html`
**Compared against:** `content/learn/narrative-cv-guide.md` (canonical, live on `integration-prototype`) and the June handoff the web team built from, `pathways_migration_june_2026/11-learn-module-narrative-cv.html`.
**Scope:** this one page. Content first; layout and markup only where they affect reading.

**How to use this file.** Every item has an ID and a Status. Update Status in place as items are fixed:
`open` · `fixed-aem` · `fixed-source` · `fixed-both` · `wontfix` · `held` (waiting on Eli or on a decision).

ID prefixes: **I** implementation difference · **L** language and consistency · **F** factual · **M** improvement · **P** paste-ready text · **Q** question for Prem.

---

## 1. Summary

1. The dev page is an accurate port of our original text. All six sections, both tables, the four concern/reality pairs and all 10 accordions are present, and the body prose matches our source word for word.
2. The build introduced eight differences (I-1 to I-8). One is a content error: a row from the TCV/CV-FRQ table was pasted into the traditional/narrative table (I-1). One is a loss: the closing call to action is gone, so the page ends on an accordion (I-5).
3. Most language issues on the page come from our own source text. Each of those fixes has to land in two places: AEM and `narrative-cv-guide.md`.
4. The August voice rewrite and the 14 factual questions for Eli were never applied, so the dev page carries all of them. Nine factual points were checked at the agencies' own pages today (§4.1). The page-limit row, the section names, the contribution-selection wording and the FRQ funder names are out of step with the agencies (F-3, F-15, F-16, F-20), and the CV-FRQ hyperlink cell is looser than the FRQ's rule (F-4).
5. §6 holds paste-ready text. Groups A to C are safe to send to Andrei this week. Group D needs Eli's sign-off. Group E is held with no text offered.

---

## 2. Pass 1: implementation check

### 2.1 Section by section

| Block | Our slots | Dev page | Verdict |
|---|---|---|---|
| Header | `header.kicker`, `header.title`, `header.lead` | Kicker absent. H1 "Narrative CV". New definition sentence, then "Review this short orientation before you begin drafting your own." Top button. "On this page" list with six anchors. | Changed (I-7) |
| 1 · Why narrative CVs exist | `s1.*` | Summary, lead, three accordion paragraphs, funder list and note identical. Callout spacing broken (I-2). Accordion title shortened (I-7). | Identical apart from I-2 |
| 2 · The three sections | `s2.*` | Intro, three card texts, both accordion bodies identical. Accordion A retitled (I-4). Card layout differs (I-6). | Identical apart from I-4, I-6 |
| 3 · TCV vs CV-FRQ | `s3.*` | Intro, all six table rows, callout identical. H2 gained "The" (I-7). | Identical |
| 4 · How it differs | `s4.*` | Intro and both accordions identical. Table has seven rows against our six (I-1). | **Error** (I-1) |
| 5 · Common concerns | `s5.*` | Intro, four concern/reality pairs, accordion identical. "Concern" and "Reality" labels kept. | Identical |
| 6 · What reviewers look for | `s6.*` | Summary, lead, four accordions identical. The "1 —" prefixes became number badges. | Identical |
| Closing CTA | `cta.title`, `cta.body`, `cta.btn` | Absent. | **Missing** (I-5) |

Our SPA numbers the six sections 1 to 6; the dev page has plain H2s. No action needed.

### 2.2 Differences introduced in the build

| ID | Difference | Evidence | Fix | Status |
|---|---|---|---|---|
| I-1 | **Stray row in the "How it differs from a traditional CV" table.** Row 2 reads "Personal Statement focus · Your expertise relative to this specific opportunity or project · Your fit with the program's objectives and how your work complements the team". It belongs to the TCV/CV-FRQ table. Under the headers Traditional CV and Narrative CV the content is wrong. | "Personal Statement focus" occurs twice on the dev page and once in our source and in the handoff. | P-1 | open |
| I-2 | Callout reads "**The core shift** —A traditional CV says what you did." The dash sits outside the bold and has no space after it. It is the only unspaced dash of 30 on the page. | Ours: `<strong>The core shift —</strong>` with CSS spacing. The handoff HTML has no literal space there, which probably caused this. | P-2 | open |
| I-3 | "On this page" entry reads "Why **N**arrative CVs exist"; the H2 reads "Why **n**arrative CVs exist". | verbatim | P-3 | open |
| I-4 | Accordion retitled `What counts as "contributions"?` | Ours, `s2.expand-a.title`: `What counts as a "contribution"?` | P-4 | open |
| I-5 | **Closing CTA dropped.** The page ends on the fourth accordion, then the site footer. The only route to the builder is the button at the top of the page. Our button text "Start Step 2 →" has no meaning off the SPA, so the block needs new wording. | "Ready to start drafting" occurs 0 times. One non-anchor link in `<main>`. | P-5 | open |
| I-6 | Section cards render as two cards, accordion A, then the Section 3 card alone at half width with an empty column beside it, then accordion B. | Ours: three cards in one row (`.ncv-section-cards`), then both accordions. | Layout note for Andrei: three cards in one row, or the Section 3 card at full width. | open |
| I-7 | Header and heading changes: title "What is a Narrative CV?" became "Narrative CV"; our lead was replaced by a definition sentence (it matches the first sentence of Concordia's existing NCV page verbatim) plus one new line; new top button "Familiar with the Narrative CV? Get started!"; "More context:" dropped from the first accordion title; "The" added to "The TCV vs CV-FRQ — key differences". | verbatim | See Q-3. Button wording: P-6. | open |
| I-8 | Meta description is empty. `robots` is `noindex,nofollow`. The mirrored `/fr/` path returns 404. The last two are expected on a dev tree and belong on the launch checklist. | page `<head>`; fetch of the `/fr/` path | P-7 for the description | open |

In passing, outside this page: the Impact 101 card that links here is still titled "What is a Narrative CV?", and the builder page has no link back to this guide.

### 2.3 What the build got right

- Both tables have column headers with `scope="col"`, row headers, and accessible names ("Table comparing features of the Tri-agency CV and the FRQ CV"; "Table showing the differences between a traditional CV and a narrative CV").
- Accordions are `h3 > button` with `aria-expanded` and `aria-controls`, and they open and close correctly.
- All six "On this page" anchors resolve. The builder link returns 200.
- No horizontal overflow at 375px; tables fit the viewport.
- The "On this page" list is an improvement on our version.

---

## 3. Pass 2: language and consistency

"Source?" = the same wording is in `content/learn/narrative-cv-guide.md`, so the fix should land there too.

| ID | Where | Verbatim | Correction or question | Source? | Status |
|---|---|---|---|---|---|
| L-1 | Whole page | "Narrative CV" capitalised 12 times; lower-case "narrative CV(s)" three times (H2 "Why narrative CVs exist", accordion "The policy shift behind narrative CVs", "narrative CV formats"). | **Question** Q-1. | yes | open |
| L-2 | Cards, tables, prose | Card titles in Title Case with an ampersand ("Supervisory & Mentorship Activities"); "Personal Statement" capitalised three times and "personal statement" lower-case twice. The agencies use sentence case and "and". | **Correction**: official names in sentence case (P-9). | yes | open |
| L-3 | Section 2 card; Scope row | "Up to 10 contributions" against "Curated selection (3–10 most significant contributions)". | **Correction**: both read "up to 10" (P-10). The agencies state no minimum. | yes (F-6) | open |
| L-4 | "Is it really okay…" accordion | `replace "we" with "I" or "I led a team that…" You can acknowledge` has no sentence end before "You". | **Correction** P-18. | yes | open |
| L-5 | Same accordion; Common concerns intro | "The guidance from **the workshop** is practical"; "These come up in almost every **workshop**." No workshop is mentioned or linked anywhere on the page. | **Correction** P-18, P-19. See Q-7 for the link. | yes | open |
| L-6 | Whole page | 24 instances of ", and" or ", or" in the body, 17 of them serial commas by the voice rewrite's count; the opening sentence has "contexts, impacts and significance" with no serial comma. Concordia and Canadian Press omit it. | **Question** Q-2. | yes | open |
| L-7 | Whole page | 66 straight double quotes and 0 typographic; 11 straight apostrophes and one typographic (in the opening sentence, "researcher’s"). | **Correction**, low priority: typographic quotes throughout if the AEM editor allows it. | yes | open |
| L-8 | Accordion title | `Is it really okay to say "I" throughout?` | **Correction** P-20: Canadian Press spelling is "OK"; "really" is emphasis. | yes | open |
| L-9 | Policy accordion | "Key **documents** driving this include … the Coalition for Advancing Research Assessment (CoARA)." CoARA is a coalition; its document is the Agreement on Reforming Research Assessment. | **Correction** P-21 (F-18). | yes | open |
| L-10 | Policy accordion | "the traditional CV-style Common CV" | **Correction** P-22: "the Canadian Common CV (CCV)" (F-18). | yes | open |
| L-11 | Fourth concern | "Reviewers cannot fund what they cannot see." Reviewers assess; funders fund. | **Correction** P-23. | yes | open |
| L-12 | Second concern | "the people you trained" | **Correction** P-24: "the people you train". | yes | open |
| L-13 | Mentorship accordion | "Graduate supervision (MA, PhD, postdoctoral)" reads as humanities only, and postdoctoral supervision is not graduate supervision. | **Correction** P-25. | yes | open |
| L-14 | Policy accordion; funder list; Specificity accordion | "The FRQ in Québec", "FRQ (Québec)", "organizations in Montréal". The site footer on the same page has "Montreal, QC". Canadian Press drops both accents in English. "Fonds de recherche du Québec" is a proper noun and keeps its accent. | **Question** Q-5. I found no published Concordia rule. | yes | open |
| L-15 | Policy accordion | "Which funders currently use narrative CV formats:" is worded as a question and ends in a colon. | **Correction** P-26. | yes | open |
| L-16 | H2 and its "On this page" entry; interdisciplinary accordion | "What reviewers **actually** look for"; "Narrative CVs **actually** work better for you". | **Correction** P-27. | yes | open |
| L-17 | Whole page | 19 contrastive constructions in 1,915 words, among them "not structural — it is rhetorical", "it is not just permitted, it is the point", "Specificity is not bragging — it is evidence", "a professional responsibility, not a personality trait", "Rather than forcing", "curated, not exhaustive", "intentional, not accidental". | Flag for a register pass after launch (M-9). Three are rewritten in §6 because other fixes touch them. | yes | open |
| L-18 | Top button | "Familiar with the Narrative CV? Get started!" The link text does not name its destination, and it carries the page's only exclamation mark. | **Correction** P-6. | no (AEM only) | open |
| L-19 | H2 and "On this page" | "The TCV vs CV-FRQ — key differences": the article sits on one side only. | **Correction**: revert to ours, "TCV vs CV-FRQ — key differences", and "TCV vs CV-FRQ" in the list. | no (AEM only) | open |
| L-20 | Whole page | Zero outbound links in the body. DORA, the Leiden Manifesto, CoARA, the agency instructions and the workshop are all named and none is linked. | Improvement M-7. | yes | open |

Checked and consistent: Canadian spelling throughout (honours, licences, organized, acknowledgement, program); "Tri-agency" written one way; TCV and CV-FRQ expanded on first use in the body; spaced dashes everywhere apart from I-2.

---

## 4. Factual points

### 4.1 Checked at primary sources on 2026-09-21

Each quotation was confirmed by string match in the live page.

| Point | Source | Verbatim |
|---|---|---|
| TCV section names | SSHRC TCV instructions (modified 2026-05-27); CIHR TCV instructions (modified 2025-07-24) | "Personal statement" · "Most significant contributions and experiences" · "Supervisory and mentorship activities" |
| How many, and how chosen | same two pages | SSHRC: "Describe up to 10 important contributions or experiences that relate to your application." CIHR: "Describe up to ten important contributions or experiences that relate to your application." |
| What each entry must explain | same two pages | "Explain the impact, significance, usefulness, and your role in each contribution or experience." |
| A cluster can be one contribution | same two pages | "A contribution does not have to be a single publication or report. This can include a collection of related publications." |
| Page limit | SSHRC instructions; CIHR TCV FAQ (modified 2026-01-27) | "The English version of the tri-agency CV must not exceed five pages (six pages for French)." |
| Overflow | CIHR TCV FAQ | "Any pages over the total page limit will be removed with no further notification." |
| CV-FRQ section names | frq.gouv.qc.ca/cv-frq/ (FR) and /en/frq-cv/ (EN) | "Parcours et compétences de la personne candidate" · "Contributions et expériences les plus importantes" · "Activités de supervision et de mentorat". English: "The candidate's background and skills" · "Most significant contributions and experiences" · "Supervisory and mentoring activities" |
| CV-FRQ hyperlinks | same FRQ pages | "Il est permis d'inclure des hyperliens dans le CV descriptif, à la manière de références bibliographiques, lorsqu'ils sont pertinents et directement liés à une contribution mentionnée." "Les hyperliens ne peuvent en aucun cas se substituer à l'information devant être présentée directement dans la demande." |
| One FRQ | frq.gouv.qc.ca programme pages | The FRQ was established on June 1, 2024; the FRQNT, FRQS and FRQSC were regrouped into it and are now sectors. |

Searched for and absent on the CIHR instructions, the SSHRC instructions and the CIHR FAQ: the strings "first person", "hyperlink" and "URL".

URLs: `https://sshrc-crsh.canada.ca/en/funding/forms-and-online-application-tools/tri-agency-cv/tri-agency-cv-instructions.aspx` · `https://cihr-irsc.gc.ca/e/54286.html` · `https://cihr-irsc.gc.ca/e/53575.html` · `https://frq.gouv.qc.ca/cv-frq/` · `https://frq.gouv.qc.ca/en/frq-cv/`

### 4.2 Status of every F item against the dev page

F-1 to F-14 are described in full in `narrative-cv-guide-factual-review.md`. All 14 are live on the dev page unchanged. F-15 to F-21 are new and are appended to that file.

| ID | Dev page text | Today | Fix | Status |
|---|---|---|---|---|
| F-1 | "Yes — and it is not just permitted, it is the point. Funders want to understand your individual contribution…" | The instructions ask for "your role in each contribution" and contain no first-person wording. Confidence stays high. | P-28 (group D) | held (Eli) |
| F-2 | Language row: "French required for most programs" | **Answered 2026-09-22: wrong.** FRQ presentation standards: "The pre-application and application forms must be filled out in French. The documents attached to the form can be written in either French or English." CV-FRQ instructions (July 2026): "6 pages (ou 5 pages en version anglaise)". One case to confirm: new-portal competitions, where the CV is completed in the portal rather than attached. | P-32 | open |
| F-3 | Page limits row: "Varies by competition — always check the program guide" in both columns | **Verified.** TCV: five pages in English, six in French, overflow removed. CV-FRQ 5/6 comes from Concordia's published NCV page and our August scan; the FRQ web pages do not state it. The dev builder page in the same section already says "maximum 5 pages in English, 6 pages in French". | P-8 | open |
| F-4 | CV-FRQ hyperlinks: "Permitted for supporting materials" | **Verified** at the FRQ. | P-17 | open |
| F-5 | "introduced in 2021, piloted with select programs, and has since expanded" | Not checked. | none | held (Eli) |
| F-6 | "3–10 most significant contributions" | The instructions say "up to 10" and state no minimum. | P-10 | open |
| F-7 | Missing: a cluster of work can be one contribution | **Verified.** | P-11 | open |
| F-8 | Missing: reviewers are asked to disregard JIF | Concordia's published FAQ carries the wording. | P-12 | open |
| F-9 | "from passive to active voice" | The instructions ask for role, not voice. | P-29 (group D) | held (Eli) |
| F-10 | "Four things that consistently score higher in reviewed contributions:" | Not checkable by desk research. | none | held (Eli) |
| F-11 | Missing: drafting time | Concordia publishes "it can take a day or more to get your first draft ready". The dev builder page gives 60 to 90 minutes for the outline; the two figures describe different tasks. | P-13 | open |
| F-12 | No contact on the page | impact@concordia.ca is the verified address. Named person: Q-4. | P-14 | open |
| F-13, F-14 | Formatting rules and citation conventions absent | Decision needed on where these live (guide or builder). | none | held |
| **F-15** | Section names: "Most Significant Contributions"; table row "Most Significant Contributions · Réalisations les plus significatives"; CV-FRQ section 1 presented as a "Personal Statement" | **Verified.** Neither name matches the agencies. | P-9 | open |
| **F-16** | "Not necessarily your most recent — your most representative"; "the most complete picture of your research" | **Verified.** The agencies tie selection to the application: "that relate to your application". | P-10 | open |
| **F-17** | Funder list includes "Wellcome Trust (UK)" | UKRI and NWO are in our sourced scan; Wellcome is not. | P-33 | decided |
| **F-18** | "Key documents… CoARA"; "the traditional CV-style Common CV" | Naming errors. | P-21, P-22 | open |
| **F-19** | Specificity example: "co-designed a food security protocol with three urban Indigenous organizations in Montréal, subsequently adopted by the City's housing strategy" | The example is invented, names Indigenous organizations and the City, and pairs a food-security protocol with a housing strategy. | P-34 | decided |
| **F-20** | Funders row: "FRQSC, FRQNT, FRQS" | **Verified.** One FRQ since June 1, 2024, with three sectors. | P-16 | open |
| **F-22** | Fonts absent from the guide, and they differ by agency | **Verified 2026-09-22.** SSHRC TCV instructions: "12-point, Arial font in black type. You can apply different fonts and sizes only in tables, figures and legends." NSERC presentation standards: "Use 12-point Times New Roman font for all text." FRQ presentation standards: "Font : Times New Roman (12 points)." **NSERC told Prem on 2026-09-22 that the TCV allows no exception for references or tables**, which is stricter than the footnote in NSERC's own published standards. | P-30 | open |
| **F-21** | TCV hyperlinks: "Not permitted (self-contained document). Exception: audio/visual creative works." | **Answered 2026-09-22.** The rule is in the reviewer guidelines, not the applicant instructions: "Guidelines for reviewing the tri-agency CV", section 5 (CIHR `cihr-irsc.gc.ca/e/54339.html`; NSERC the same): "The sole exception for which other sources may be permitted is for hyperlinks, but only if they are used to demonstrate audio/visual creative outputs, if applicable for specific funding opportunities." and "However, there is no guarantee that hyperlinks will be accessed." | P-31 | open |

---

## 5. Pass 3: ways to improve

### Before launch (small edits, high value)

| ID | Improvement | Text |
|---|---|---|
| M-1 | Restore a closing call to action so the page ends with a next step. | P-5 |
| M-2 | Correct the page-limit row and add the overflow rule. A researcher who runs long loses the extra pages with no notice. | P-8 |
| M-3 | Use the agencies' own section names, in both languages. | P-9 |
| M-4 | State the selection criterion the agencies use: contributions that relate to the application. | P-10 |
| M-5 | Add the three support lines the page lacks: drafting time, a contact, and a reviewed date with a status line. | P-13, P-14, P-15 |
| M-6 | Write a meta description. | P-7 |
| M-7 | Link what the page names. Verified today: the SSHRC and CIHR TCV instructions and the FRQ CV page (URLs in §4.1), for the callout "Check the specific program's application guide". To confirm before pasting: DORA (`sfdora.org`), the Leiden Manifesto (`leidenmanifesto.org`), CoARA (`coara.eu`). Workshop materials: Q-7. | links |

### After launch

| ID | Improvement | Note |
|---|---|---|
| M-8 | Question headings in the researcher's voice. | Seven are ready in `content/learn/narrative-cv-guide-pathways-voice.md`. They change the "On this page" list and the Impact 101 card, which is why they wait. |
| M-9 | Register pass on the 19 contrastive constructions (L-17). | Apply to the source and the AEM page together. |
| M-10 | Serial commas. | The voice rewrite already carries the comma-free text for every slot. Depends on Q-2. |
| M-11 | Replace the invented Specificity example with a real Concordia example, used with consent. | Depends on Q-6. |
| M-12 | Replace the history paragraph (F-5) with a dated list of competitions that currently use the TCV. | Needs Eli, and a re-check schedule. |
| M-13 | Decide where the formatting rules and citation conventions live (F-13, F-14). | The builder is the likelier home. |
| M-14 | French page. | The FRQ's French section names are in P-9. Concordia's French term is "CV descriptif". |

---

## 6. Paste-ready fixes

Replacement text keeps the page's current capitalisation ("Narrative CV") so that it is consistent on paste; Q-1 applies on top. Lists follow Canadian Press (no serial comma). "Also source" names the slot in `narrative-cv-guide.md` that needs the same edit.

### Group A: errors introduced in the build (send to Andrei)

**P-1** (I-1) · Table under "How it differs from a traditional CV": delete the second body row, "Personal Statement focus · Your expertise relative to this specific opportunity or project · Your fit with the program's objectives and how your work complements the team". Keep the identical row in the TCV/CV-FRQ table. The corrected table has six body rows: Structure, Voice, What it shows, Your role, Evidence of impact, Scope.

**P-2** (I-2) · Callout in section 1. Put the dash inside the bold and one space after it:
> **The core shift —** A traditional CV says what you did. A Narrative CV says what changed because of what you did, and why that matters.

If you would prefer the label without a dash, "**The core shift.**" followed by the same two sentences works equally well.

**P-3** (I-3) · "On this page", first entry:
> Why narrative CVs exist

**P-4** (I-4) · First accordion title in "The three sections":
> What counts as a "contribution"?

**P-5** (I-5) · New closing block after the fourth reviewer accordion. The wording follows the builder page's own introduction.
> **Ready to start drafting?**
> The Narrative CV builder helps you develop a draft outline with guided prompts and examples. You can expect to spend 60 to 90 minutes on it.
> Button: **Open the Narrative CV builder** → `…/learn/tools/narrative-cv-builder.html`

Also source: `cta.body`, `cta.btn`.

**P-6** (L-18) · Top button. Replace "Familiar with the Narrative CV? Get started!" with a sentence and a button:
> If you already know the format, you can go straight to the builder.
> Button: **Open the Narrative CV builder**

**P-7** (I-8) · Meta description (156 characters):
> An orientation to the Narrative CV for Concordia researchers: the three sections, what reviewers look for and how the Tri-agency CV differs from the CV-FRQ.

Also for Andrei: L-19 (heading reverts to "TCV vs CV-FRQ — key differences") and the I-6 layout note.

### Group B: factual fixes verified today or already published by Concordia

**P-8** (F-3) · TCV/CV-FRQ table, replace the "Page limits" row:

| Maximum length | 5 pages in English, 6 pages in French | 5 pages in English, 6 pages in French |
|---|---|---|

Add below the table:
> The Tri-agency CV must not exceed its page limit. Any pages over the limit are removed with no further notification. Formatting rules differ between agencies, so you should check the instructions for your funding opportunity.

The first two sentences relay the CIHR FAQ at its own strength ("must not exceed"; "will be removed with no further notification"). Our August scan adds that removal happens before reviewers see the file; that detail was not re-confirmed today, so it is left out. Also source: `s3.table`, plus a new note slot.

**P-9** (F-15, L-2) · Official section names.
Card titles:
> Personal statement · Most significant contributions and experiences · Supervisory and mentorship activities

TCV/CV-FRQ table, replace the "Contributions section name" row with:

| Section names | Personal statement · Most significant contributions and experiences · Supervisory and mentorship activities | Parcours et compétences de la personne candidate · Contributions et expériences les plus importantes · Activités de supervision et de mentorat |
|---|---|---|

Same table, first-column label "Personal Statement focus" becomes:
> Focus of the first section

Also source: `s2.cards`, `s3.table`.

**P-10** (F-16, F-6, L-3) · Selection criterion.
Section 2 card body:
> Up to 10 contributions or experiences that relate to your application. Choose the ones most relevant to the funding opportunity, which may differ from your most recent work.

Note at the end of the first accordion (`s2.expand-a.note`):
> The question to ask is which contributions best support this application and what each one changed. A short list of well-explained contributions is stronger than a long list.

Scope row of the traditional/narrative table:
> Curated selection (up to 10 contributions or experiences)

Also source: `s2.cards`, `s2.expand-a.note`, `s4.table`.

**P-11** (F-7) · First accordion in "The three sections". Insert this sentence into the intro paragraph, directly before "You can include:":
> A contribution can be a single output or a collection of related work presented together.

Also source: `s2.expand-a.intro`.

**P-12** (F-8) · "What evidence can I use besides citation counts?" Keep the first sentence. Replace "Alternative forms include:" with:
> Reviewers of Tri-agency applications are asked to disregard the Journal Impact Factor and other journal-based metrics. DORA also treats the h-index and career-total citation counts as unreliable measures of an individual's work. The citation count for a single article or book can support a qualitative account of that work. Other forms of evidence include:

Basis: Concordia's published Narrative CV FAQ. Also source: `s4.expand-b.intro`.

**P-13** (F-11) · Opening, second paragraph:
> Review this short orientation before you begin drafting your own. A first draft can take a day or more, so you should allow time before your deadline.

Also source: `header.lead`.

**P-14** (F-12) · Support line, directly above or below the closing block:
> If you have questions about your Narrative CV, please contact the Pathways to Impact team at impact@concordia.ca.

**P-15** · Status line at the foot of the page:
> Last reviewed: September 2026. This guide gives Concordia's advice and is not an official position of the Tri-agency or the Fonds de recherche du Québec. The instructions for your funding opportunity take precedence.

**P-16** (F-20) · TCV/CV-FRQ table, Funders row, CV-FRQ cell:
> Fonds de recherche du Québec (FRQ), all three sectors: Nature et technologies, Santé, Société et culture

Also source: `s3.table`.

**P-17** (F-4) · TCV/CV-FRQ table, Hyperlinks row, CV-FRQ cell:
> Permitted as bibliographic references when directly related to a contribution. Links cannot replace information that belongs in the application.

Also source: `s3.table`.

**P-32** (F-2) · TCV/CV-FRQ table, Language row, CV-FRQ cell:
> French or English. The FRQ application form itself must be completed in French.

Sources: FRQ presentation standards (the attached-documents rule) and the CV-FRQ instructions, July
2026 (an English version is limited to 5 pages). The old cell told researchers French was required,
which would steer an anglophone away from writing in their stronger language.

**P-31** (F-21) · TCV/CV-FRQ table, Hyperlinks row, TCV cell:
> Not permitted: the CV must be self-contained. The one exception is a link to an audio or visual creative output, where the funding opportunity allows it. Reviewers are not guaranteed to open it.

Source: "Guidelines for reviewing the tri-agency CV", section 5, at CIHR and NSERC (read 2026-09-22). The
old cell stated the rule without its two conditions: the exception applies only where the opportunity
allows it, and reviewers may not open the link.

**P-30** (F-22) · New accordion under the TCV/CV-FRQ table, titled "What font and formatting do I use?":
> The three Tri-agency partners do not use the same formatting rules, so the agency you are applying to decides the format of your TCV.
> - **SSHRC and CIHR** require 12-point Arial in black type. You can use different fonts and sizes in tables, figures and legends, as long as the text is readable when the page is viewed at 100%.
> - **NSERC** requires 12-point Times New Roman. NSERC has advised us that this covers everything, including references and tables, so the exception above does not apply to an NSERC application.
> - The **CV-FRQ** requires 12-point Times New Roman, with margins of at least 2 cm, your name in the header and the document title in the footer.
>
> None of them accept condensed fonts, and all of them require you to use the agency's own template.
>
> *If you are preparing one CV for more than one agency, 12-point Times New Roman throughout meets the strictest of these rules.*

The note under the table also gains: "Formatting also differs between the three Tri-agency partners: SSHRC and CIHR require 12-point Arial, and NSERC requires 12-point Times New Roman. See the formatting note below before you start."

This closes part of F-13, which had been held pending a decision on whether formatting rules belong in
the guide or the builder. NSERC raising it directly settles that: it belongs where a researcher reads
before drafting.

### Group C: copy corrections (all also apply to the source)

**P-18** (L-4, L-5) · "Is it really okay…" accordion, second paragraph (`s4.expand-a.p2`):
> In our Narrative CV workshops, we suggest replacing "we" with "I," or with a phrase such as "I led a team that developed the protocol." You can acknowledge collaboration and still make your own contribution clear.

**P-19** (L-5) · Common concerns intro, first sentence (`s5.intro`):
> Researchers raise these concerns in almost every Narrative CV workshop we run.

**P-20** (L-8) · Accordion title (`s4.expand-a.title`):
> Is it OK to say "I" throughout?

**P-21** (L-9) · Policy accordion, first paragraph (`s1.expand.p1`): replace "Key documents driving this include" with:
> Key initiatives behind this shift include

**P-22** (L-10) · Policy accordion, second paragraph (`s1.expand.p2`): replace "the traditional CV-style Common CV" with:
> the Canadian Common CV (CCV)

**P-23** (L-11) · Fourth concern (`s5.myths`): replace "Reviewers cannot fund what they cannot see." with:
> Reviewers can assess only what you describe.

**P-24** (L-12) · Second concern (`s5.myths`): "the people you trained" becomes:
> the people you train

**P-25** (L-13) · Mentorship accordion, first bullet (`s2.expand-b.list`). Split it:
> Graduate supervision (master's and doctoral)
> Postdoctoral supervision

**P-26** (L-15) · Policy accordion (`s1.expand.funders-intro`):
> Funders that currently use narrative CV formats:

**P-27** (L-16) · Two edits.
H2 and its "On this page" entry (`s6.title`):
> What reviewers look for

Interdisciplinary accordion, first paragraph (`s5.expand.p1`):
> A Narrative CV suits interdisciplinary work better than a traditional CV does. You can describe what your contributions mean in each field they touch, without fitting them to a single discipline's metrics.

### Group D: text offered, needs Eli's sign-off before it goes anywhere

**P-28** (F-1) · "Is it OK to say 'I' throughout?", first paragraph (`s4.expand-a.p1`):
> Yes. The Tri-agency instructions ask you to explain your role in each contribution and leave the grammatical person open. Concordia recommends the first person because it states your role most directly. If every sentence says "we," reviewers cannot tell what you did.

Why sign-off: "leave the grammatical person open" rests on the absence of any first-person wording in the pages checked, recorded in August and again today.

**P-29** (F-9) · Intro to "How it differs from a traditional CV" (`s4.intro`):
> The main change is rhetorical. A Narrative CV asks you to explain your contributions as well as list them, and to make your own role visible in each one.

### Group E: held, no text offered

F-5 (2021 date and rollout state) · F-10 ("consistently score higher") · F-17 (Wellcome Trust) · F-19 (invented example) · F-21 (source of the TCV hyperlink rule) · F-13 and F-14 (where formatting rules live).

---

## 7. Questions for Prem

| ID | Question | Recommendation |
|---|---|---|
| Q-1 | Capitalisation: "Narrative CV" or "narrative CV" in running text? | Lower-case in running text. It matches the agencies, Concordia's published FAQ and the dev builder page ("Build your narrative CV"). Cost: 12 edits. Capitalising all 15 costs three edits and departs from the rest of the site. |
| Q-2 | Serial comma: adopt Canadian Press now or after launch? | After launch, with M-10. It is 17 edits across the page and has no bearing on what a researcher is told. |
| Q-3 | Were the title change ("What is a Narrative CV?" to "Narrative CV") and the new opening sentence the web team's choice, and do you accept them? | If you accept the new H1, the Impact 101 card title should follow it. If you prefer ours, the H1 reverts. |
| Q-4 | Is there a named person for Narrative CV support whose name and title can appear in P-14? | House style names a person. I have not invented one. |
| Q-5 | "Québec" and "Montréal" in English running text: keep the accents? | Follow Canadian Press and the site footer: "Quebec", "Montreal". Three edits. Proper nouns in French keep their accents. |
| Q-6 | The Specificity example is invented and names Indigenous organizations and the City. Keep, neutralise, or replace? | Replace after launch with a real example (M-11). Before launch, the smallest safe edit is to change "the City's housing strategy" to "the City's food policy", which removes the mismatch. |
| Q-7 | Which workshop material should "our Narrative CV workshops" link to? | The dev builder page already links a workshop PDF and a recording; the same two would serve. |
| Q-8 | How do fixes reach AEM: through Andrei, or do you have author access? | Send groups A to C as one list. |
| Q-9 | Do we mirror groups B and C into `narrative-cv-guide.md` now? | Yes, in one commit, then regenerate the standalone export with `node scripts/build-ncv-standalone.js`. The prototype is the source for every future export. |
| Q-10 | Is a French page planned for launch? | If yes, P-9's French names and "CV descriptif" apply, and F-2 becomes more urgent. |

---

## 8. Review copy (2026-09-22)

Prem's decision: the AEM page is the source of truth and edits there are manual, so the corrected
page is reproduced in the repo as a paste reference with a comment layer, for Eli and others.

- Page: `ncv-guide-review/index.html`, built by `scripts/build-ncv-guide-review.py` from a DOM
  snapshot of the AEM page taken 2026-09-22 (the page had moved overnight to its launch path,
  `/research/pathways-to-impact/learn/impact-101/narrative-cv.html`; same content).
- Edits live in `ncv-guide-review/src/corrections.json`; each carries its ID from this file.
- Comments: the page anchors them to text and saves them to a backend behind one adapter.
  Setup for the sheet backend is in `ncv-guide-review/README.md`.

| Decision | Status | Note |
|---|---|---|
| Groups A, B and C applied in full (33 edits) | INFERRED | "Corrections that are pretty obvious": build errors, facts verified at the agencies, copy corrections. Any single edit reverts by deleting its entry in `corrections.json`. |
| Group D shown as proposals, not applied | INFERRED | F-1 and F-9 sit on the page as amber "Proposal" highlights with the proposed text in the comment. |
| Group E and Q-1, Q-4 placed as questions on the page | INFERRED | Ten seeded comments in `seed-comments.json`, anchored to the passage they concern. |
| Cards: three in one row, both accordions after (I-6) | INFERRED | The AEM editor needs a three-column layout for this. |
| Q-1 capitalisation, Q-2 serial commas, Q-5 accents, Q-6 example: not applied | INFERRED | Each is a question on the page or in §7. |
| Page in the repo (GitHub Pages), not a claude.ai artifact | DECIDED | Prem, 2026-09-22. |
| Comment backend: project Google Sheet via the existing Apps Script | INFERRED (recommended) | Prem suggested Neon; a static page cannot hold database credentials, and the sheet needs no new account. Neon stays possible behind the same adapter with a small API in front. |

**Overrides:** _(Prem fills in)_

## 9. Method note

- Dev page read on 2026-09-21 in the built-in browser: the full `<main>` DOM including all collapsed accordion panels, the heading tree, anchors, links, table markup and page metadata. Walked at the pane's desktop width and at 375 × 812. One accordion opened and closed to confirm behaviour. The cookie banner was hidden with local CSS for screenshots and was left unanswered.
- Every I and L item was re-confirmed by string match on the live page after the first pass. Counts in this file come from that match.
- "Ours" means `content/learn/narrative-cv-guide.md` at `integration-prototype`, which is byte-identical in content to the June handoff the web team received.
- Agency facts in §4.1 were confirmed by string match in the agencies' live pages on the same day. Items that could not be confirmed are labelled held.
- Staging caveats: `noindex`, the missing French page and the empty description may change at publish.
- Not reviewed: every other dev-site page, including the builder.

## 10. Decisions and source of truth (2026-09-22)

From this date the review copy (`ncv-guide-review/`, live at
`https://landedimmigrant-ops.github.io/pathways_website/ncv-guide-review/`) is the source of truth for
the guide's content. The AEM page is corrected from it by hand. New comments from staff are processed
in batches: pull the Guide review tab, propose fixes, apply the approved ones as tagged corrections,
and close each thread with a one-line note of what was done.

**Decided by Prem on the page, 2026-09-22, and applied:**

| Item | Decision | Applied as | Status |
|---|---|---|---|
| F-17 | Take Wellcome Trust off the funder list | P-33 | decided |
| F-19 | No real source: present the example as illustrative. The invented case also loses the Indigenous organizations and the City, and the protocol goes into a food policy | P-34 | decided |
| Q-1 | Capitalisation follows the agencies: "narrative CV" in running text (14 places); capital only on the page title and the table column header | L-1 | decided |
| Q-4 | No named person; keep impact@concordia.ca | none | decided |
| F-22 | State the font rules as instructions, without "NSERC has advised us" | P-30 reworded | decided |
| F-21 | Answered from the reviewer guidelines | P-31 | decided |

**Open, waiting on Eli** (the only open threads on the page): F-1 and F-9 (first-person and
active-voice proposals), F-2 (the new-portal language case), F-5 (the 2021 date and the current
rollout), F-10 ("consistently score higher").

**Eli's answers, by email 2026-09-22, applied the same day:**

| Item | Eli | Applied as | Status |
|---|---|---|---|
| F-1, F-9 | "Yes, that's a great change." | P-28, P-29 | decided |
| F-10 | Sent the source: Fasoli, Frith, Nolan, Hutton and Noël (2025), *Writing and Evaluating Narrative CVs* (27 UKRI-format CVs; reviewers rated CVs and researchers more highly with less passive, low-ownership language and fewer negations). It supports Ownership only, so it is cited there; the lead now quotes the agencies' wording instead of "consistently score higher". | P-36, P-37 | decided |
| F-5 | "I think it was 2023. I wouldn't name the ones that use it now – they're all little boutique grants and prizes." Suggested "The Tri-agency is gradually implementing the TCV requirement over a few years." No primary source dates the introduction (the agencies' pages give none; a secondary source says announced October 2024), so the page carries no year. | P-35 | decided |
| F-2 | New-portal language case: "I would ask Holly about this – she has been in touch with FRQ to resolve questions like that." | P-32 extended | **decided (Holly)** |

All threads on the page are resolved (Prem, 2026-09-22). The F-2 new-portal case is with Holly off the page; reopen the thread if her answer changes the cell.

**Holly, by email 2026-09-22 (F-2 closed):** applicants can enter the CV-FRQ in English on the new
portal; the online tool produces files that are attached to the program application, so the
attached-documents rule applies. She asked for an asterisk: some FRQ programs, so far those run in
partnership with Quebec ministries, require every document in French, attachments included. The
Language cell now carries it (P-32). **No factual question is open.**

## 11. Eli's comments on the review copy (2026-09-25)

Twelve comments from Eli on the page, the morning of 2026-09-25. **Prem's decision: trust Eli's
comments as the authority on funder rules**; public primary sources may not show what he knows,
so these were applied without desk verification (a source check was started and stopped).
New wording follows the guide's tone (second person, short declaratives, the pattern of the
neighbouring lines).

**Revert point:** git tag `ncv-guide-pre-eli-2026-09-25` (commit b10ad9d) and the local copy
`backups/ncv-guide-review-2026-09-25-pre-eli/` (review folder, this log, sheet rows as of that morning).

| Thread | Eli | Applied as | Where it lives |
|---|---|---|---|
| cmuh1c169qcmyf | "says" → "lists"? | P-38: "A traditional CV lists what you did." | corrections.json |
| cmuh1bfzkzsuv4 | Add (FRQ) after the name | P-39: "Fonds de recherche du Québec (FRQ)" in the opening | corrections.json |
| cmuh1ewa2xvdnf | "narrative" before "Tri-agency CV" | P-40: "the narrative Tri-agency CV (TCV) requirement" | corrections.json |
| cmuh0xvsqadmve | Include the FRQ's title for this section; it has a different meaning | P-41: "…then write the personal statement (in the CV-FRQ, "The candidate's background and skills") last." | corrections.json |
| cmuh2yoawkwuet | Remove "12-point Times New Roman throughout meets the strictest of these rules." | P-42: sentence deleted | hooks.py |
| cmuh0sff7zog7t | Also NIH (USA) and FNR (Luxembourg) | P-43: two list items, "NIH (USA)", "FNR (Luxembourg)" | corrections.json |
| cmuh12ve47nbfq + cmuh1xegc0w84m | Also the CV-FRQ; going over the page limit may be eliminatory at every agency, almost certainly at the FRQ | P-44: "Your TCV or CV-FRQ must not exceed its page limit. If it does, your application can be ruled ineligible. The FRQ is especially strict about formatting and page limits." Replaces the CIHR FAQ line on removed pages. | hooks.py (note under table) |
| cmuh1z4pw5f9c4 | CIHR requires Times New Roman | P-45: note under the table ("SSHRC requires 12-point Arial, and NSERC and CIHR require 12-point Times New Roman") and a separate CIHR bullet in the formatting accordion. Supersedes the CIHR half of F-22. | hooks.py |
| cmuh13p4qptgve | Correction received: smaller legible fonts allowed in tables and figures, except those listing references; references always 12-pt TNR | P-46: NSERC bullet rewritten. Supersedes the 2026-09-22 "no exception" line. | hooks.py |
| cmuh226m68l6t6 | File-size limits also differ by agency | P-47: "Each agency also sets its own file-size limit." | hooks.py |
| cmuh1tmlk3aadv | Add the TCV focus to the CV-FRQ first-section cell | P-48: "Your expertise relative to this specific opportunity or project, your fit with the program's objectives, and how your work complements the team" | corrections.json |

Change entries for the hook edits are in `src/guide.json → changes`. In AEM copy mode all eleven
IDs show as To do. Section 4.1's reference line "SSHRC/CIHR: 12-pt Arial" and the NSERC note in the
skill's `reference.md` are superseded by P-45 and P-46.

### 11.1 Eli's separate notes (2026-09-25, via Prem)

1. "Across the board, absolutely, you must use the template provided", to be stressed, maybe in
   red; use the formatting of the current version.
2. Whether an application is rejected for going over the page limit is being confirmed. Until then,
   state "do not exceed page limits".

**Revert point:** git tag `ncv-guide-pre-eli-notes-2026-09-25` (commit 8a189cf) and
`backups/ncv-guide-review-2026-09-25-pre-eli-notes/`.

| Note | Applied as | Status |
|---|---|---|
| 1 | P-49: a callout directly under the comparison table (same Box component as "The core shift": tint, left border #912338). First line bold in #912338: "You must use the agency's template." Then: "Prepare your TCV or CV-FRQ in the current version of the template your agency provides, and keep the formatting it sets." | decided (Eli) |
| 2 | P-44 revised: "**Do not exceed the page limit.** The FRQ is especially strict about formatting and page limits." Moved into the callout. The earlier "If it does, your application can be ruled ineligible" is withdrawn. | **decided** 2026-09-25: word back that the page sticks with "do not exceed"; no consequence will be stated |

The red is Concordia's burgundy (#912338), the only red already on the page and one AEM supports.

**Follow-up, 2026-09-25 (Prem):** both callout lines underlined, "You must use the agency's
template." and "Do not exceed the page limit.", each bold in #912338. Word came back that the page
keeps "do not exceed" with no consequence stated, so P-44 is decided and nothing on the page
is open. Revert point before this step: tag `ncv-guide-pre-underline-2026-09-25` (commit 7b22ee4).
Underline removed the same day (Prem): on a Concordia page, underlined burgundy reads as a link.
Both lines stay bold in #912338 inside the bordered callout.

### 11.2 Builder links removed for now (2026-09-25, Prem)

P-50: both links to the Narrative CV builder are off. The top lead-in line and button (P-6), and
the closing "Ready to start drafting?" box with its button (P-5). The contact line and status line
at the end stay. In AEM: delete the Text and Button components above the opening, and the grey Box
at the end. **To restore:** `SHOW_BUILDER = True` in `ncv-guide-review/src/hooks.py` and delete the
P-50 entry in `src/corrections.json`. Revert point: tag `ncv-guide-pre-builder-removal-2026-09-25`
(commit 504e894).

### 11.3 Eli's second round of page comments (2026-09-25, afternoon)

Six comments from Eli on the page, 17:46–18:18 UTC. Prem marked three of them resolved by accident
that night; all six are applied, **on Eli's authority** (no desk verification, per Prem's standing
instruction). New text follows Eli's wording.

**Revert point:** git tag `ncv-guide-pre-eli-round2-2026-09-25` (commit 8b68e32) and
`backups/ncv-guide-review-2026-09-25-pre-eli-round2/` (review folder, this log, sheet rows).

| Thread | Eli | Applied as | Where it lives |
|---|---|---|---|
| cmuh95nyg1smjj | "Maximum length": "I think you could remove this - no difference." | P-51: the row is deleted from the TCV vs CV-FRQ table. Supersedes the table half of P-8. | corrections.json |
| cmuh97apzpifyf | "Do not exceed the page limit": add "(5 pages if in English, 6 pages if in French)" | P-52: "**Do not exceed the page limit (5 pages if in English, 6 pages if in French).**" in the template callout, bold, #912338. The figures now live only here. | hooks.py |
| cmuh9866i746xi | The tables/figures/legends font exception: "Add to CIHR as well." | P-53: the CIHR bullet reads "CIHR requires 12-point Times New Roman. You can use different fonts and sizes in tables, figures and legends, as long as the text is readable when the page is viewed at 100%." | hooks.py |
| cmuh9ixa9mu2ym | "what you did": "Maybe better: '...lists your outputs without context.'" | P-54: "A traditional CV lists your outputs without context." Supersedes P-38. | corrections.json |
| cmuh9kgdmiib4i | "'...describes what you did, what changed because of it, and why that matters.'" | P-55: "A narrative CV describes what you did, what changed because of it, and why that matters." | corrections.json |
| cmuhaauwvzvc81 | After "The FRQ in Québec developed its own parallel format (CV-FRQ)": "Add: ', and now requires it for all grant applications.'" | P-56: "…with similar principles, and now requires it for all grant applications." | corrections.json |

In AEM copy mode the six IDs show as To do. The NCV V5 tool carries P-53 (CIHR font rule) and P-56
(agency help, CV-FRQ format box); P-51/P-52 change nothing in the tool, which already states the
limit with the rule.
