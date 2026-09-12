# Narrative CV V5 — the worked-example library (review sheet)

**What this is.** Every fictional paragraph the *What a finished contribution reads like* card can show, one per
discipline × how-your-work-happens × career stage: 5 × 4 × 3 = 60 cells, each a different invented researcher.
Generated 2026-09-12 by `node scripts/ncv-v5-examples.js review` from the library in
`narrative-cv-prototype-v5.html` (between the `EXEMPLAR_LIBRARY:begin/end` markers) — the HTML is the source of truth;
edit a sentence there, then re-run `lint` and `review`. Built under the beta-run rule: everything below is **INFERRED**
until Prem confirms or overrides it. Every sentence passes the tool's own checks (ownership, numbers, vague words, hedges,
prestige terms), so the example never contradicts the check under a field.

**How the card picks a cell.** Discipline from Setup; the work-mode chips on the Contributions step; career stage from
Setup. With no work mode picked yet the card shows the discipline's usual mode (STEM and health: team-based; social
sciences, humanities and creative arts: largely solo); with no career stage, mid career. When more than one work mode is
picked, the cell sharing the most modes wins (some cells carry two tags because that is how the mode occurs in the field,
e.g. an engineering industry partnership is team work); ties go to the more specific mode, in the order community,
industry, team, solo.

## Overrides (for Prem)

Write in this table, or edit the sentence in place in the HTML and say so here. Only the cells listed get rebuilt.

| Cell | What to change | Status |
|---|---|---|
|  |  |  |

## STEM / engineering

### Team-based — tags: Team-based

#### `stem/team/early` — Early career · Postdoctoral materials researcher; why grid-storage battery cells fade faster in cold-weather duty cycles (141 words)

- **Stakes** — Grid-scale batteries are bought on the strength of laboratory aging curves, and cells in cold climates fade faster than those curves predict.
- **Your role** — As a postdoctoral fellow I led the low-temperature strand of a four-lab study, designing the duty cycles and the teardown protocol the other labs now follow.
- **What you did** — Over 20 months I cycled 96 cells through five temperature profiles and paired the electrical records with teardown imaging done at two partner labs.
- **What resulted** [a,b] — The strand produced a shared cycling protocol, an open dataset of 96 cell histories and one methods paper.
- **What already changed** [c] — The three other labs adopted the protocol for their 2026 runs, and a storage developer used the dataset to rewrite its cold-weather acceptance test.
- **What could change** — If the cold-weather effect holds across chemistries, storage could be specified on climate-matched aging data rather than laboratory curves, changing how cold-region utilities size what they install.

#### `stem/team/mid` — Mid career · Structural engineer; acoustic fatigue detection for aging bridges (128 words)

- **Stakes** — Aging bridges can fail with little warning, and manual inspection is costly, slow and intermittent.
- **Your role** — I led the development of a low-cost acoustic method for detecting fatigue before it is visible, co-designing the field trials with two municipal engineering teams.
- **What you did** — My group built the sensing pipeline, trained the detection models on three years of field recordings and ran blind validation against inspector reports.
- **What resulted** [a,b] — This work produced an open-source monitoring toolkit, a public benchmark dataset and two methods papers.
- **What already changed** [c] — To date, two transit agencies have adopted the toolkit for pilot monitoring, and the benchmark has been used by four independent groups.
- **What could change** — If validated at scale, continuous low-cost monitoring could shift bridge inspection from periodic to preventive across the aging infrastructure stock, a hypothesis the pilot data now makes testable.

#### `stem/team/senior` — Senior · Analytical chemist; a reference method that makes trace-contaminant results comparable between laboratories (138 words)

- **Stakes** — Two laboratories measuring the same soil sample for trace contaminants can report numbers that differ by more than the limit being enforced.
- **Your role** — I direct a shared measurement facility and led the interlaboratory work that turned our best in-house method into a reference procedure any accredited laboratory can run.
- **What you did** — Since 2011 I have run seven round-robin comparisons with 34 laboratories, rebuilt the calibration chain twice and trained 19 analysts to the procedure.
- **What resulted** [a,b] — The facility produced a published reference procedure, three certified test materials and an open archive of every round-robin result.
- **What already changed** [c] — Two provincial testing requirements now name the procedure, and 26 commercial laboratories run it as their default, up from four in 2015.
- **What could change** — Numbers that mean the same thing in every laboratory may be the difference between a contamination limit that is enforceable and one that exists on paper.

### Community-engaged — tags: Community-engaged + Team-based

#### `stem/community/early` — Early career · Early-career soil scientist; a soil-testing method community gardeners run themselves on former industrial lots (153 words)

- **Stakes** — Gardeners on former industrial lots are warned about lead in their soil, and a laboratory test costs more than a season of vegetables is worth.
- **Your role** — A gardeners’ association asked the question, and I designed and ran the sampling method with them, training members to take and log the samples themselves.
- **What you did** — Across two growing seasons I trained 24 gardeners on nine plots, compared their samples against laboratory results and set the depth rule together with them.
- **What resulted** [a,b] — The project produced a one-page sampling guide in three languages, a soil map of the nine plots and a report co-authored with the association.
- **What already changed** [c] — The association now runs its own sampling day each spring, and the municipality used the map to replace the soil in two beds in 2026.
- **What could change** — A test residents can run themselves could tell gardeners which beds to fix without waiting on a laboratory budget, in cities with thousands of plots on old industrial land.

#### `stem/community/mid` — Mid career · Environmental engineer; storm-by-storm creek monitoring designed with a watershed group (144 words)

- **Stakes** — A watershed group had 20 years of monthly water samples and still no way to say which storm, or which outfall, put bacteria in their creek.
- **Your role** — I co-led, with that group, a monitoring program built around their question: not how bad the creek is on average, but when and where it goes wrong.
- **What you did** — My team and the group’s volunteers placed 18 continuous sensors along 40 kilometres of creek and sampled through 22 storms, with two graduate students maintaining the network.
- **What resulted** [a,b] — The program produced an open data portal the group maintains, a storm-sampling protocol and two papers co-authored with volunteer monitors.
- **What already changed** [c] — That evidence moved the municipality to repair two cross-connections in 2025, and three other watershed groups have set up the same sensor plan.
- **What could change** — Volunteer-run continuous monitoring could move enforcement from averages to events, which is where the contamination that closes swimming beaches comes from.

#### `stem/community/senior` — Senior · Freshwater ecologist; a 16-year lake fish-health record whose questions are set by an Indigenous-led stewardship organization (155 words)

- **Stakes** — Fish health in a large northern lake was judged from summer surveys by visiting scientists, and the people who fish it year-round were never asked what they were seeing.
- **Your role** — I co-lead this program with an Indigenous-led stewardship organization that sets the questions and holds the record; I built the analysis joining observer logs to laboratory work.
- **What you did** — Since 2010, 42 observers trained by the organization have logged catch condition at 14 sites, and I have run the laboratory analysis each year.
- **What resulted** [a,b] — The program produced a 16-year open record the organization controls, an annual community-authored report and a sampling protocol written into two co-management plans.
- **What already changed** [c] — The organization used the record to negotiate a seasonal closure in 2024, and a federal monitoring program adopted the observer protocol at 11 other lakes.
- **What could change** — Long records held by the people who live with a resource could change what counts as evidence in fisheries decisions, where visiting-scientist surveys still set the terms.

### Largely solo — tags: Largely solo

#### `stem/solo/early` — Early career · Statistician in a first faculty position; trend tests that stay honest when monitoring data arrive in uneven bursts (139 words)

- **Stakes** — Environmental records arrive in uneven bursts, and the standard tests for a change in trend treat every gap as though nothing happened inside it.
- **Your role** — In my first faculty position I built an estimator that holds the false-alarm rate steady when sampling is irregular, and released it as a documented package.
- **What you did** — Over 18 months I proved the coverage result, tested the estimator on 30 years of series from three public archives and wrote the reference implementation.
- **What resulted** [a] — The work produced one single-authored paper, a documented package and a tutorial written with the archive’s data curator.
- **What already changed** [b] — Two monitoring groups have replaced their previous test with the package, and a graduate methods course adopted the tutorial in 2026.
- **What could change** — Honest intervals for irregular sampling could change which long environmental records count as usable evidence, opening series that have been set aside as too patchy.

#### `stem/solo/mid` — Mid career · Computer scientist; measuring when a trained model’s confidence stops matching how often it is right (146 words)

- **Stakes** — A model that reports 90 per cent confidence on data unlike its training set is wrong in a way nobody downstream can see.
- **Your role** — I built and maintain the diagnostic at the centre of this work: a test that says when a model’s stated confidence has stopped tracking its accuracy.
- **What you did** — I ran the diagnostic across 12 public benchmarks and 40 trained models, derived the bound that explains when it fails and rebuilt the library twice over four years.
- **What resulted** [a,b] — This produced two first-authored papers, an open library kept in release by a research software engineer and a benchmark suite of shifted test sets.
- **What already changed** [c] — Three firms name the diagnostic in their internal model-review checklists, and the benchmark suite is the baseline in 12 later studies.
- **What could change** — Treating calibration as something measured rather than assumed could change what counts as a finished evaluation before a model is put into a decision.

#### `stem/solo/senior` — Senior · Optical physicist; a scattering model for cloudy materials, and the instruments built on it (150 words)

- **Stakes** — Light leaving a cloudy material carries information about what is inside it, and for decades that scattered signal was thrown away as interference.
- **Your role** — I built the scattering model this field now uses to read that signal and have developed it alone since 2004, with an instrument maker testing each version against hardware.
- **What you did** — I derived the model, wrote the open solver and validated it against measurements on 60 materials contributed by six laboratories over two decades.
- **What resulted** [a,b] — The work produced a monograph, an open solver in continuous release since 2009 and 30 single- or first-authored papers.
- **What already changed** [c] — The solver runs inside two commercial imaging instruments and is taught in nine graduate courses; 14 groups, four led by former students, have built their own estimators on its equations.
- **What could change** — A model anyone can run may keep this kind of measurement in the hands of small laboratories, instead of locked inside the instruments that firms sell.

### Industry-partnered — tags: Industry-partnered + Team-based

#### `stem/industry/early` — Early career · Early-career robotics researcher; force-limited handling so a robot arm can share a bench with people at a small-batch manufacturer (150 words)

- **Stakes** — On a small-batch assembly bench a robot arm has to be fenced off, so the short-run jobs that need a person beside it stay manual.
- **Your role** — In a research partnership with a mid-sized manufacturer I designed and tested the force-limiting controller, which the firm co-funded and hosted on its own bench.
- **What you did** — Over 14 months I ran 400 part handovers on that bench with eight operators and measured contact forces against the stop thresholds.
- **What resulted** [a,b] — The partnership produced a controller running on two arm models, an open test suite for contact limits and a paper the firm cleared for publication.
- **What already changed** [c] — The firm moved one bench to shared human-robot operation in 2026, and two other research groups have run the open test suite on their own hardware.
- **What could change** — If contact limits stay this cheap to test, collaborative arms could reach small shops that cannot keep a safety specialist on staff, where most short-run work happens.

#### `stem/industry/mid` — Mid career · Manufacturing engineer; catching porosity while a metal part is still printing, with an aerospace supplier (154 words)

- **Stakes** — Metal printed parts are cleared by cutting up or scanning finished pieces, so a bad build is found only after the machine time is spent.
- **Your role** — I lead an in-process monitoring program with an aerospace supplier and designed the labelling method that ties melt-pool signals to the flaws later found in cut-up parts.
- **What you did** — My group instrumented four printers across two plants and built a labelled library of 2,400 build segments, which two doctoral students checked against destructive inspection over three years.
- **What resulted** [a,b] — The program produced a monitoring module the supplier now runs on its machines, an open labelled dataset and four papers.
- **What already changed** [c] — In 2025 the supplier qualified the module for one part family and cut scrap there by a fifth; two research groups have since trained models on the dataset.
- **What could change** — Catching porosity while the part is still building could move qualification from destructive sampling to recorded evidence, which is what printing structural parts at volume needs.

#### `stem/industry/senior` — Senior · Power systems engineer; finding faults on rural distribution lines from recordings the utility already makes (149 words)

- **Stakes** — When a rural distribution line faults, crews patrol kilometres of road to find it, and customers sit in the dark while they look.
- **Your role** — I have directed a partnership with a distribution utility since 2013 and built the fault-location method that reads the recordings its protection relays already produce.
- **What you did** — My group tested the method against 11 years of recorded faults, ran live trials on 14 feeders and rewrote the dispatch rule with the utility’s crews.
- **What resulted** [a,b] — The partnership produced a fault-location tool now running in the utility’s control room, an open method description and two doctoral theses.
- **What already changed** [c] — Patrol time on the trial feeders fell from 96 minutes to 28; three other utilities have licensed the tool, and a national protection guideline now describes the method.
- **What could change** — Fault location from data utilities already record could shorten rural outages without new hardware on the poles, which is the constraint that keeps most lines unmonitored.

## Health / clinical

### Team-based — tags: Team-based

#### `health/team/early` — Early career · Rehabilitation researcher; postdoctoral fellow who built the walking-recovery measurement protocol for a four-site stroke rehabilitation trial (134 words)

- **Stakes** — Stroke rehabilitation trials measure walking recovery differently at every site, so studies that look contradictory are often measuring different things.
- **Your role** — As a postdoctoral fellow I designed the measurement protocol for the walking-recovery outcome in a four-site rehabilitation trial, and trained the assessors who used it.
- **What you did** — I wrote the assessment manual, ran certification sessions for 22 assessors across the four sites and audited 180 recorded assessments over 20 months.
- **What resulted** [a,b] — The trial produced a published measurement protocol, an assessor certification package and a methods paper on how closely raters agreed.
- **What already changed** [c] — Two other rehabilitation trials have adopted the protocol, and a hospital training program now teaches the certification package to new therapists.
- **What could change** — Measuring walking recovery the same way across sites could let small rehabilitation trials be pooled, which would change how fast the field settles treatment questions.

#### `health/team/mid` — Mid career · Nursing scientist; a bedside protocol for preventing sudden confusion in intensive care, tested across seven units (142 words)

- **Stakes** — Older patients in intensive care often become suddenly confused, a turn that lengthens their stay and leaves families frightened.
- **Your role** — I designed the bedside prevention protocol for a seven-unit intensive care study, including the sleep and mobility steps nurses carry out and the monthly audit our team ran.
- **What you did** — My team tested the protocol with 640 patients over two years, timed every step against real staffing and retrained 210 nurses as units joined.
- **What resulted** [a,b] — The study produced a bedside protocol, an audit tool units run themselves and three papers, two of them first-authored by my trainees.
- **What already changed** [c] — Nine intensive care units in two hospital networks have adopted the protocol, and a regional nursing orientation program added the sleep and mobility steps in 2025.
- **What could change** — If the same steps hold in smaller hospitals, prevention could become routine for the older patients who arrive in critical care every night.

#### `health/team/senior` — Senior · Pediatric pain researcher; observational pain measures for children who cannot report pain, built with an 11-site network since 2010 (139 words)

- **Stakes** — Children who cannot speak for themselves, among them infants and children with severe disabilities, have their pain missed because the usual questions assume an answer.
- **Your role** — I direct the network that built observational pain measures for these children, and I designed the scoring system its 11 hospitals now share.
- **What you did** — Since 2010 we have studied 2,400 children across 11 hospitals, and I led the analysis that set the scoring thresholds used at the bedside today.
- **What resulted** [a,b] — The network produced two validated pain measures, a training curriculum in four languages, an open scoring manual and 40 papers.
- **What already changed** [c] — Two international pediatric guidelines now recommend the measures, and 60 hospitals in nine countries use the curriculum that three former trainees run.
- **What could change** — Treating a child’s face and body as readable evidence could make pain in children who cannot report it something clinicians measure rather than guess.

### Community-engaged — tags: Community-engaged + Team-based

#### `health/community/early` — Early career · Community health researcher; an Indigenous-led health organization set the questions for a hospital-to-home follow-up check in two northern communities (150 words)

- **Stakes** — People flown out of northern communities for hospital care come home to no follow-up, and the gap surfaces later as return trips.
- **Your role** — An Indigenous-led health organization set the question and I co-designed, with its care team, a follow-up check that local workers carry out after a patient comes home.
- **What you did** — Over 14 months as a postdoctoral fellow I trained six local health workers, sat with Elders and families in two communities and rewrote the check three times.
- **What resulted** [a] — The work produced a follow-up protocol the organization owns, a plain-language guide for families and a report co-authored with its research lead.
- **What already changed** [b] — The organization now runs the check itself for 90 people a year, and the data-sharing agreement I drafted with its board keeps the records in its hands.
- **What could change** — If the check travels to other communities that ask for it, follow-up after a medical flight could become ordinary rather than something families arrange alone.

#### `health/community/mid` — Mid career · Primary-care researcher; two-question food-security screen co-designed with a community health centre (121 words)

- **Stakes** — Clinics rarely ask about food access, so a treatable driver of poor health stays invisible in primary care.
- **Your role** — I co-led, with a community health centre, the design of a two-question food-security screen that fits inside routine intake.
- **What you did** — My team ran co-design workshops with patients and intake staff, piloted the screen across four clinics and measured uptake over 18 months.
- **What resulted** [a] — The work produced a validated screening protocol, a training module for intake staff and a peer-reviewed validation study.
- **What already changed** [b] — Three regional clinics have embedded the screen in routine intake, and referrals to food-support programs rose measurably at the pilot sites.
- **What could change** — Embedded screening could make food insecurity as routine to check as blood pressure, a system-level change I am now studying across the region.

#### `health/community/senior` — Senior · Mental health services researcher; peer-delivered follow-up in the week after a crisis, co-designed with people who have used crisis services (153 words)

- **Stakes** — The week after a crisis service sends someone home is the most fragile one, and the system around them hands that week to nobody.
- **Your role** — I co-founded and direct a program in which people who have used crisis services make the follow-up calls, and I led the design of their training.
- **What you did** — Since 2014 my team and 30 peer workers have followed 4,200 people through that week, and I rebuilt the model twice on what the peer workers reported.
- **What resulted** [a,b] — The program produced a peer training curriculum, a handbook on supporting peer staff, an evaluation with peer co-authors and a public dashboard of its results.
- **What already changed** [c] — Peer workers now run the follow-up at 14 crisis services in three regions, and four in five people who used it said the caller had been where they were.
- **What could change** — Making that week somebody’s job could change who counts as a clinician, and what a health system is willing to pay for.

### Largely solo — tags: Largely solo

#### `health/solo/early` — Early career · Health economist; first faculty position; what reaching specialist care actually costs rural patients out of pocket (146 words)

- **Stakes** — For a rural patient, the real cost of a specialist appointment is travel, a night away and lost pay, none of which appears in health spending figures.
- **Your role** — In my first faculty position I built the first bottom-up estimate of what rural patients pay out of pocket to reach specialist care.
- **What you did** — I interviewed 62 patients about a single trip, matched their accounts against 14 months of appointment records and wrote an open calculator anyone can run.
- **What resulted** [a,b] — The work produced an open cost calculator, a methods paper and a short brief written for patient navigators.
- **What already changed** [c] — Two patient-navigation programs now use the calculator when they arrange travel, and a graduate course in health economics teaches the method with my data.
- **What could change** — If the costs patients carry themselves were counted, distance could weigh differently when services are placed, because care that is free at the door is not free to reach.

#### `health/solo/mid` — Mid career · Epidemiologist; a decade of administrative records read as immunization timing rather than coverage (147 words)

- **Stakes** — Immunization statistics count the children who are covered by age two and miss the ones who start late, then never catch up.
- **Your role** — I built and lead a program that reads a decade of linked health records as timing rather than as a yes or no at age two.
- **What you did** — I negotiated access to the linked records, followed 380,000 children born between 2012 and 2020 and wrote the timing measures the analysis rests on.
- **What resulted** [a,b] — The program produced a public timing dataset, two methods papers and an open code library that three provinces can run on their own records.
- **What already changed** [c] — Nine public health units moved their reminders to the months when children actually fall behind, and 11 later studies use the dataset as their baseline.
- **What could change** — Reading immunization as timing could show where the gap opens and where a reminder still lands, which matters more as fewer families follow the standard schedule.

#### `health/solo/senior` — Senior · Geriatrics health services researcher; 18 years on how long-term care homes decide whether to send a dying resident to hospital (157 words)

- **Stakes** — Residents of long-term care homes are sent to emergency departments in their last weeks of life, often because the night staff have no standing to decide anything else.
- **Your role** — I have spent 18 years asking how those decisions get made at night, and I built the bedside guide that staff now use to hold the conversation.
- **What you did** — I observed 400 night shifts in 30 homes since 2008, interviewed 220 staff and families with a research nurse I hired and tested the guide in 12 homes.
- **What resulted** [a,b] — The program produced a bedside decision guide, a book on how these nights unfold and a training film homes show to new staff.
- **What already changed** [c] — The guide is used in 260 homes across three provinces, and night transfers to hospital fell by a third at the 12 homes that tested it first.
- **What could change** — If a night nurse can say aloud what the resident chose, dying in place could stop depending on which shift happens to be working.

### Industry-partnered — tags: Industry-partnered + Team-based

#### `health/industry/early` — Early career · Digital health researcher; postdoctoral fellow evaluating remote check-ins after day surgery with a software firm (148 words)

- **Stakes** — Patients sent home the day of surgery watch for warning signs alone, and the phone line they are given is answered by whoever is free.
- **Your role** — As a postdoctoral fellow I led the clinical side of a partnership with a software firm, writing the check-in questions and the nurse escalation rules.
- **What you did** — I ran a 12-month evaluation with 240 patients at one hospital, met the firm’s engineers every second week and published the rules in full.
- **What resulted** [a,b] — The partnership produced a tested check-in protocol, an openly published rule set and a paper on which answers predicted a return to hospital.
- **What already changed** [c] — The hospital kept the check-in running for 40 patients a week after the study ended, and the firm rewrote its alert thresholds to match the trial findings.
- **What could change** — If check-ins are tuned to the answers that matter, day surgery could stop ending at the hospital door for patients who live hours away.

#### `health/industry/mid` — Mid career · Clinical vision researcher; a portable eye-screening camera tested in primary care with a device manufacturer (154 words)

- **Stakes** — People with diabetes lose sight to a condition a yearly eye check catches early, yet that check sits in specialist clinics with a six-month wait.
- **Your role** — I lead the clinical arm of a partnership with a device manufacturer, and I designed the study that tested its portable camera against the specialist examination.
- **What you did** — My group screened 3,100 patients at nine primary care clinics over two years and kept the analysis code outside the manufacturer’s hands.
- **What resulted** [a,b] — The partnership produced a validated screening pathway, an open image set from 3,100 patients and two papers the firm agreed to publish whatever they showed.
- **What already changed** [c] — The wait for a first eye check fell from 24 weeks to nine days at six clinics that now screen on site, and the manufacturer hired two of my trainees.
- **What could change** — If screening moves to where people already go for care, sight loss from diabetes could become something caught in a routine visit rather than a referral.

#### `health/industry/senior` — Senior · Pharmacoepidemiologist; a 12-year partnership with a pharmaceutical firm on catching harm signals after a medicine reaches the market (154 words)

- **Stakes** — Harm that appears only once a medicine is in wide use is found late, because the first hints arrive as unstructured text nobody reads at scale.
- **Your role** — I direct the academic side of a 12-year partnership with a pharmaceutical firm, and I set the rule that every signal we find is published whatever it shows.
- **What you did** — My group built the detection method, tested it against 30 years of reports and ran it beside the firm’s own monitoring for four years.
- **What resulted** [a,b] — The partnership produced an open detection method, a shared evaluation dataset and 14 papers, five of them reporting signals that were bad news for the partner.
- **What already changed** [c] — The firm rebuilt its safety monitoring around the method in 2023, and two other manufacturers and a hospital network now run the open version.
- **What could change** — Reading the text people actually write could shorten the years between a medicine reaching patients and the first honest account of what it does to them.

## Social sciences

### Team-based — tags: Team-based

#### `social/team/early` — Early career · Developmental psychologist; postdoctoral lead of the home-recording component of a three-site study of how everyday talk builds vocabulary in bilingual toddlers (139 words)

- **Stakes** — Vocabulary gaps show up before kindergarten, and the home conversations that build them are rarely measured in the languages families actually speak.
- **Your role** — As a postdoctoral fellow I designed and ran the home-recording component of a three-site study, including the coding scheme the whole team now uses.
- **What you did** — Over 20 months I recruited 140 families in three neighbourhoods, collected day-long audio at home and trained six assistants to code bilingual turn-taking.
- **What resulted** [a,b] — The component produced an open coding manual for bilingual turn-taking, a training set of annotated recordings and two first-authored papers.
- **What already changed** [c] — Two other developmental labs have adopted the coding manual, and a neighbourhood family centre built its 2025 parent workshops around the feedback the study gave families.
- **What could change** — Measuring talk in both of a child’s languages could change what early-vocabulary research counts as input, and what child-care staff are asked to notice.

#### `social/team/mid` — Mid career · Political scientist; repeated survey program across 12 municipalities on the residents who have stopped voting in local elections (150 words)

- **Stakes** — Turnout in municipal elections keeps falling, and the residents who stopped voting are the hardest people for a standard survey to reach.
- **Your role** — I co-lead a survey program on local non-voting with two colleagues, and I designed the sampling and weighting that decide whose answers enter the data.
- **What you did** — Since 2019 my team has fielded four waves across 12 municipalities, and I rebuilt the weights after each wave so that renters and recent arrivals are not undercounted.
- **What resulted** [a,b] — The program produced a four-wave public dataset of 9,400 interviews, an open weighting method other teams reuse and two articles with doctoral students.
- **What already changed** [c] — Two city clerks’ offices redesigned their voter-information mailings after the 2023 wave, and a residents’ coalition used the ward-level tables in its own door-knocking campaign.
- **What could change** — Reaching people who have stopped voting could change what turnout research is able to claim, and give election offices a picture of absence rather than of preference.

#### `social/team/senior` — Senior · Criminologist; four-university consortium observing bail hearings in 11 courthouses and what the wait costs the people detained (156 words)

- **Stakes** — Bail hearings last minutes and leave almost no record, so the reasons people are held before trial stay invisible to the courts that hold them.
- **Your role** — I direct a four-university consortium on pretrial detention and built the observation protocol that lets coders record a hearing the same way in every courthouse.
- **What you did** — Since 2014 the consortium has observed 6,200 hearings in 11 courthouses, and I led the analysis linking what was said at the hearing to how long detention lasted.
- **What resulted** [a,b] — The program produced an open observation protocol, a de-identified hearing dataset held at a research data centre and a training guide written with two retired judges.
- **What already changed** [c] — Judicial education bodies in three provinces built the findings into new-judge training after 2021, and four former trainees now run pretrial research units of their own.
- **What could change** — A record of what happens in the hearing room could move pretrial reform from opinion to evidence, and make the wait itself something courts can count.

### Community-engaged — tags: Community-engaged

#### `social/community/early` — Early career · Urban geographer; with a tenants’ association, measuring how hot apartments get inside during summer heat waves (148 words)

- **Stakes** — Heat warnings are written for the temperature outdoors, while the apartments where people actually get sick are never measured.
- **Your role** — I co-designed, with a tenants’ association in a neighbourhood of walk-up buildings, a study that put sensors inside apartments instead of on rooftops.
- **What you did** — Across two summers I trained 11 tenant volunteers to install sensors in 48 apartments and to read the weekly temperature charts with their neighbours.
- **What resulted** [a,b] — The study produced an indoor-temperature dataset the association holds with me, a reporting template it sends to members each July and an article written with two of its organizers.
- **What already changed** [c] — The association used the first summer’s readings in its 2025 talks with two building owners, and the municipality added shade and a cooling room at the neighbourhood centre.
- **What could change** — Measuring heat where people sleep could change how warnings are written, and give tenants a number to bring to a landlord instead of a complaint.

#### `social/community/mid` — Mid career · Social work researcher; with a workers’ centre, counting unpaid wages among temporary agency workers and what recovery takes (154 words)

- **Stakes** — Workers hired through temporary agencies lose pay they are owed, and because the agency, the client firm and the worker sit apart, nobody counts the loss.
- **Your role** — I co-lead a wage-recovery research program with a workers’ centre whose counsellors decide each year which questions the study asks.
- **What you did** — Over five years the centre’s counsellors and my team documented 1,180 unpaid-wage cases, and I designed the intake form that turns case notes into comparable data.
- **What resulted** [a,b] — The partnership produced a public annual count of unpaid wages, a caseworker toolkit for building a recovery file and two articles written with the centre’s staff and a doctoral student.
- **What already changed** [c] — The centre rebuilt its intake around the form and recovered $1.4 million in owed wages since 2022, and two other workers’ centres in the province run the same count.
- **What could change** — A count that comes out of the workers’ own files could change what a sector built on subcontracting can be asked to prove.

#### `social/community/senior` — Senior · Applied social researcher; 10-year partnership in which an Indigenous-led organization set the terms for how community data is collected and held (158 words)

- **Stakes** — Surveys about Indigenous communities have long been designed elsewhere and held elsewhere, leaving the communities described in them without access to their own numbers.
- **Your role** — I co-lead, at an Indigenous-led organization’s invitation, the methods side of a partnership it directs, and I built the training its own staff now deliver.
- **What you did** — Since 2016 the organization has run four community surveys of 2,600 households on servers it controls, and I designed the sampling and consent process with its data committee.
- **What resulted** [a,b] — The partnership produced a data governance agreement other organizations adapt, a community-held survey series, a training curriculum and three articles the organization approved before submission.
- **What already changed** [c] — Nine Indigenous-led organizations have adopted the governance agreement since 2021, and the partner now runs a data office staffed by two people it trained through the work.
- **What could change** — Data a community holds and controls could change who gets to ask the questions, and make consent part of a study’s design rather than a form at the door.

### Largely solo — tags: Largely solo

#### `social/solo/early` — Early career · Anthropologist; 14-month solo ethnography of night-shift cleaning crews in office towers (151 words)

- **Stakes** — Office towers are cleaned between midnight and dawn by crews the daytime building never meets, and what the shift asks of them has gone undescribed.
- **Your role** — I designed and carried out a solo ethnography of night cleaning, working the shift alongside three crews for 14 months.
- **What you did** — Between 2023 and 2025 I completed 140 night shifts in four towers, interviewing 36 cleaners and 11 supervisors about what the job takes out of them.
- **What resulted** [a,b] — The fieldwork produced two single-authored articles, a field-note archive an archivist helped me prepare for deposit and a short illustrated report written for the crews.
- **What already changed** [c] — One building operator’s health and safety committee rewrote its night-shift break rules in 2026 after reading the report, and two graduate courses now teach the article.
- **What could change** — Describing a shift from inside could change what counts as evidence about invisible work, and give the people who do it a version of the research they can use.

#### `social/solo/mid` — Mid career · Sociologist; decade-long earnings cohort of immigrants built from linked administrative data (110 words)

- **Stakes** — Policy debates about immigrant economic integration ran on snapshots; nobody followed the same people long enough to see the real trajectory.
- **Your role** — I built and lead a longitudinal program tracking earnings for a single cohort across a decade.
- **What you did** — I negotiated access to linked administrative data, designed the cohort methodology and led the analysis across three waves.
- **What resulted** [a,b] — The program produced a public-use dataset, a methods framework now used by two statistical agencies and a book-length study.
- **What already changed** [c] — Two provincial ministries cited the trajectory findings in settlement-program reviews, and the dataset underpins a growing body of secondary studies.
- **What could change** — Trajectory-based evidence could reshape how integration policy is evaluated — from point-in-time outcomes to decade-scale mobility.

#### `social/solo/senior` — Senior · Sociolinguist; 22-year recorded corpus of one rural variety across three generations of speakers (151 words)

- **Stakes** — Accounts of language change rest on recordings made once in a single decade, so slow shifts in rural speech enter the record as exceptions rather than patterns.
- **Your role** — I built and maintain a recorded corpus of one rural variety, returning to the same families across 22 years.
- **What you did** — Since 2004 I have recorded 310 speakers from three generations in nine villages, transcribing the sessions with two research assistants and annotating each vowel shift by hand.
- **What resulted** [a,b] — The work produced an open annotated corpus released under a licence written with an archivist, a transcription standard for regional speech and two single-authored books.
- **What already changed** [c] — Four provincial archives have adopted the transcription standard, and the corpus has served as the baseline for 19 later studies of vowel change since 2015.
- **What could change** — A record kept across decades could change what the field accepts as evidence of change in progress, and keep rural speech inside the account rather than beside it.

### Industry-partnered — tags: Industry-partnered

#### `social/industry/early` — Early career · Labour economist; field experiment with an employer group on whether posting wage ranges in job ads changes who applies (150 words)

- **Stakes** — Employers argue about posting wage ranges in job ads, and the argument has run on assumption because almost no one has tested it on real postings.
- **Your role** — In my first faculty position I designed and ran a field experiment with an employer group that co-funded the study and had no say over the findings.
- **What you did** — Across 18 months I randomized wage-range disclosure over 640 job postings at 12 firms and matched each posting to the applications it drew.
- **What resulted** [a,b] — The experiment produced an analysis plan registered before the data arrived, an anonymized applicant dataset and an article the partner saw only after submission.
- **What already changed** [c] — Nine firms in the group changed their posting templates in 2025, and a second research team has since replicated the design in a different sector.
- **What could change** — Evidence from real postings could settle a disagreement employers keep having without data, and show whether transparency widens an applicant pool or only re-sorts it.

#### `social/industry/mid` — Mid career · Organizational researcher; partnership with a national retailer testing whether stable shift schedules reduce turnover (157 words)

- **Stakes** — Retail schedules are posted days ahead and change without notice, and the cost of that churn has been carried by workers and counted by nobody.
- **Your role** — I lead a research partnership with a retailer that co-funds the work, and I designed the scheduling change and the measures the trial is judged on.
- **What you did** — Over three years my team ran a staged rollout in 18 stores against 18 matched controls, following 2,900 employees through four scheduling cycles.
- **What resulted** [a,b] — The partnership produced a scheduling protocol the retailer now owns, an open measure of schedule stability and a thesis by the student who ran the store visits.
- **What already changed** [c] — The retailer extended stable scheduling to 400 stores in 2025 after turnover fell 14 per cent at the trial sites, and a sector association adopted the stability measure.
- **What could change** — A stability measure that firms accept could turn a contested cost into something a whole sector counts, and make schedule quality a management question rather than a complaint.

#### `social/industry/senior` — Senior · Media researcher; decade-long partnership with a regional news publisher measuring which neighbourhoods local coverage actually reaches (156 words)

- **Stakes** — Newsrooms count the readers a story draws, not which neighbourhoods those readers live in, so coverage can look healthy while whole districts go unserved.
- **Your role** — I direct a partnership with a regional news publisher that co-funds the work, and I designed the neighbourhood reach index the newsroom now runs on.
- **What you did** — Since 2016 my team has analyzed 4.2 million article views across 11 local titles, and I led three field tests of proximity ranking with the publisher’s editors and two doctoral students.
- **What resulted** [a,b] — The partnership produced an open reach index, an annual public report on coverage gaps and four articles the publisher agreed in advance not to vet.
- **What already changed** [c] — The newsroom moved two reporters to districts the index showed as unserved, and three publishers outside the partnership adopted the index after the 2024 report.
- **What could change** — A measure of who local news actually reaches could change what a newsroom counts as success, and make coverage of a neighbourhood something readers can check.

## Humanities

### Team-based — tags: Team-based

#### `humanities/team/early` — Early career · Archaeologist; as a postdoc, ran one excavation area and wrote the recording protocol for a five-year settlement dig (135 words)

- **Stakes** — Excavation destroys the ground it reads, and when areas of one site are recorded in different ways, the evidence cannot be compared later.
- **Your role** — I led one of the four excavation areas as a postdoctoral fellow, and wrote the recording protocol the whole team then adopted.
- **What you did** — Over three field seasons I ran a crew of eight in that area, recorded 1,200 contexts and reconciled the protocol with the finds specialists.
- **What resulted** [a,b] — The work left an open recording protocol, a stratigraphic archive for the area and a co-authored paper on the settlement’s house plans.
- **What already changed** [c] — The other three areas adopted the protocol in the 2025 season, and a nearby project has since used it to re-record its own backlog.
- **What could change** — Recording that travels between areas and projects could let small excavations be read together rather than one at a time.

#### `humanities/team/mid` — Mid career · Digital humanist; the encoding standard behind a multilingual correspondence archive built with librarians and computer scientists (138 words)

- **Stakes** — Letters written in three languages at once defeat search tools built for one language, so whole correspondences stay out of reach.
- **Your role** — I designed the encoding standard for the archive, and lead the editorial side of a team that includes two librarians and three computer scientists.
- **What you did** — Since 2019 our team has encoded 12,000 letters from four collections, and I wrote the rules for tagging code-switching and trained 20 editors to apply them.
- **What resulted** [a,b] — The archive released an open encoding standard, a public corpus of the encoded letters and a search interface other projects can run on their own material.
- **What already changed** [c] — Four archives outside the project have adopted the standard for their own multilingual holdings, and 30 courses have used the corpus since 2023.
- **What could change** — A shared way of encoding mixed-language writing could make scattered multilingual archives searchable as one body of evidence.

#### `humanities/team/senior` — Senior · Musicologist; 18 years directing an international team making playable editions of 18th-century women composers’ manuscripts (146 words)

- **Stakes** — Music by 18th-century women survives mostly in manuscript parts that no ensemble can play from, so the repertoire stayed out of concert halls.
- **Your role** — I founded the editorial consortium in 2008 and set its editorial framework: what an editor can reconstruct, and what has to be left visible as a gap.
- **What you did** — Over 18 years I have directed 14 editors across six countries, edited nine of the volumes myself and taught the reconstruction method to every editor who joined.
- **What resulted** [a,b] — The consortium has published 22 performing editions, a manual of the reconstruction method and a recorded reference set of the reconstructed movements.
- **What already changed** [c] — Since 2012 ensembles have programmed the editions in more than 200 concerts, and four editors I trained now direct editorial teams of their own.
- **What could change** — Editions that can be played could move this music from the footnote into the concert season, changing what counts as the century’s repertoire.

### Community-engaged — tags: Community-engaged

#### `humanities/community/early` — Early career · Oral historian; with a retired mill workers’ association, recording what a closure did to a town’s memory of its work (131 words)

- **Stakes** — When a mill closes, the company’s records survive and the workers’ account of the work goes with them.
- **Your role** — I co-designed the project with a retired workers’ association that set the questions, and recorded the interviews myself.
- **What you did** — Over 20 months I recorded 60 life histories and trained four association members to interview, then built a consent process the association itself controls.
- **What resulted** [a,b] — The project left a recorded archive the association holds and controls, a listening room in the town library and an article on how the closure is remembered.
- **What already changed** [c] — The association now runs its own recording sessions with 30 more members, and a school board built a local history unit from the archive in 2026.
- **What could change** — Archives a community holds and controls could change who decides what a town remembers about its own work.

#### `humanities/community/mid` — Mid career · Film historian; recovering migrant communities’ home-movie archives as historical sources (102 words)

- **Stakes** — Home-movie archives of migrant communities were decaying, uncatalogued and absent from the historical record.
- **Your role** — I direct a recovery project that treats these archives as primary sources for diasporic memory.
- **What you did** — I led digitization partnerships with three community organizations and developed the interpretive framework for reading domestic footage as historical evidence.
- **What resulted** [a,b] — The project produced a digitized open collection, a monograph and a touring exhibition program.
- **What already changed** [c] — The collection is now taught in four university curricula, and the exhibition reached audiences in six cities.
- **What could change** — Treating domestic footage as evidence could widen whose history gets kept — a methodological shift the field is beginning to take up.

#### `humanities/community/senior` — Senior · Historian; 16 years with an Indigenous-led archives organization on records about the community held elsewhere (143 words)

- **Stakes** — Records made about Indigenous communities sit in institutions far from them, described in the words of the people who wrote them down.
- **Your role** — I co-lead a project with an Indigenous-led archives organization that sets the research questions, returning copies of those records to the community they describe.
- **What you did** — Since 2010 I have located 4,000 records in 14 institutions and drafted the historical context notes that the organization’s staff then put into their own words.
- **What resulted** [a,b] — The work produced a description framework the organization owns, a finding aid covering the 14 collections and a co-authored book on how those records were made.
- **What already changed** [c] — The organization now runs the access process for all 14 holdings, and eight archives outside the province have adopted the description framework since 2021.
- **What could change** — Description written by the people a record is about could change what an archive is for, and who it answers to.

### Largely solo — tags: Largely solo

#### `humanities/solo/early` — Early career · Medievalist; a first critical edition of a 14th-century devotional handbook copied and annotated by women (134 words)

- **Stakes** — Hundreds of medieval devotional handbooks copied by women sit unedited in library collections, readable only by specialists who can travel to them.
- **Your role** — I prepared the first critical edition of one such handbook, collating its four surviving copies against each other for the first time.
- **What you did** — Over 30 months I transcribed the four copies, dated their hands with a manuscript librarian and traced how each scribe changed the prayers she copied.
- **What resulted** [a,b] — The edition appeared with a full apparatus, a glossary of the handbook’s prayer vocabulary and an article on its three scribal hands.
- **What already changed** [c] — Two graduate seminars now teach the edition, and a library re-dated a second handbook in its own collection after adopting my collation method.
- **What could change** — Editions of what women copied and annotated could change which medieval readers the field is able to study at all.

#### `humanities/solo/mid` — Mid career · Philosopher; an account of who is responsible when an organization causes harm no individual intended (146 words)

- **Stakes** — When an organization causes harm that no individual inside it intended, the usual accounts of blame have nowhere to put the responsibility.
- **Your role** — I developed an account of responsibility that locates blame in roles and procedures rather than in what any one person meant to do.
- **What you did** — Over 11 years I wrote the two books that set the account out and ran a workshop series that tested it against cases from workplace safety and environmental harm.
- **What resulted** [a,b] — The account now sits in two monographs, an edited volume prepared with a co-editor in law and a set of teaching cases drawn from public inquiries.
- **What already changed** [c] — The teaching cases are used in 14 courses across philosophy and professional ethics, and two research groups outside philosophy have built on the role-based analysis.
- **What could change** — Locating blame in procedures rather than intentions could give institutions a way to answer for harms that no one person chose.

#### `humanities/solo/senior` — Senior · Historian of cheap print; two decades in booksellers’ ledgers, reconstructing what ordinary readers bought (142 words)

- **Stakes** — Histories of reading were written from the books that survived in fine libraries, so the reading of people who bought penny print went unrecorded.
- **Your role** — I direct a long-running study of the ledgers, order books and subscription lists that record what ordinary readers actually paid for.
- **What you did** — Since 2006 I have transcribed the surviving accounts of 40 small booksellers, built a database of 90,000 purchases and trained nine doctoral students on the sources.
- **What resulted** [a,b] — The study has produced three books, a public database of the purchase records and a source guide now used in archive training.
- **What already changed** [c] — Booksellers’ ledgers are now standard evidence in the field: 30 later studies have drawn on the database, and four of my former students run reading histories of their own.
- **What could change** — Read as evidence of reading, small commercial records could recover audiences that literary history has never been able to count.

### Industry-partnered — tags: Industry-partnered

#### `humanities/industry/early` — Early career · Historian of seafaring labour; an 18-month partnership with a game studio on how a 17th-century port is represented (142 words)

- **Stakes** — Historical games reach audiences no monograph will, and the working lives they stage are mostly invented because the records are hard to read.
- **Your role** — As a postdoctoral fellow I led the historical research strand of a partnership the studio co-funded, on terms that left publication in my hands.
- **What you did** — Over 18 months I read 400 wage and provisioning records into a source dossier, and ran six workshops where the design team tested scenes against the evidence.
- **What resulted** [a,b] — The partnership produced a public dossier of the records, a short guide to reading ships’ pay books and an article on shipboard hierarchy.
- **What already changed** [c] — The studio rebuilt its crew system around the wage records before the 2025 release, and two history teachers now use the dossier with senior classes.
- **What could change** — Games built from payroll and provisioning records could put working lives, rather than captains, at the centre of popular history.

#### `humanities/industry/mid` — Mid career · Translation scholar; a method for translating fiction that switches languages mid-sentence, built with a literary publisher (139 words)

- **Stakes** — Novels that move between languages are usually flattened into one in translation, and the strain that gives them their force disappears.
- **Your role** — I created the translation method at the heart of a partnership a literary publisher co-funded, and I trained the translators who now apply it.
- **What you did** — Over six years I translated three of the novels myself, ran a workshop that put 12 translators through the method and wrote the decision log each translation now carries.
- **What resulted** [a,b] — Out of the partnership came three published translations, a translator’s handbook and a comparative study of how the editions handle code-switching.
- **What already changed** [c] — The publisher adopted the method across a 10-book series, and two other presses have licensed the handbook for their own translators since 2024.
- **What could change** — Translation that keeps the seams could change which books are carried across languages, and what a reader hears when they arrive.

#### `humanities/industry/senior` — Senior · Art historian of workshop practice; 14 years with a private conservation laboratory on who actually painted what (143 words)

- **Stakes** — Works made by whole workshops are still filed under one name, and the assistants who painted most of the surface go unrecorded.
- **Your role** — I lead the research side of a 14-year partnership with a private conservation laboratory, and I built the framework that reads pigment evidence against workshop contracts.
- **What you did** — Since 2012 I have analyzed the paint layers in 90 paintings, matched them to 300 surviving workshop contracts and trained nine doctoral students to read both.
- **What resulted** [a,b] — The laboratory and I published an attribution protocol, an open dataset of the layer evidence and three books on workshop labour.
- **What already changed** [c] — The laboratory now applies the protocol in every attribution report it issues, and 12 museums have changed the wall text on 40 paintings since 2020.
- **What could change** — Reading a surface as the work of a shop rather than a signature could change how the discipline writes the history of painting.

## Creative / fine arts

### Team-based — tags: Team-based

#### `creative/team/early` — Early career · Dance artist in a four-person collective; the movement vocabulary for a stage work built from warehouse picking labour (136 words)

- **Stakes** — Warehouse work is described in output figures, and the repeated body shapes it asks for leave no record at all.
- **Your role** — I built the movement vocabulary for our collective’s first evening-length work, which the four of us directed together.
- **What you did** — Over 14 months I trained alongside pickers on two night shifts, brought two of them into the studio as paid consultants and built the vocabulary the four of us rehearsed.
- **What resulted** [a,b] — The work resulted in a 50-minute stage piece, a notated vocabulary other companies can read and a short film of the shift recordings.
- **What already changed** [c] — The piece was selected for two contemporary dance festivals in 2025, and a dance school added the notated vocabulary to its second-year repertory class.
- **What could change** — Notating the gestures that industrial work asks of a body could give choreography a way to hold labour that statistics cannot.

#### `creative/team/mid` — Mid career · Scenographer in a five-person performance company; a modular spatial system for staging full productions in empty retail units (151 words)

- **Stakes** — Performance built for theatres loses its shape in the rooms most companies can now afford, and an empty storefront gets treated as a fallback.
- **Your role** — I am the company’s scenographer, and I designed the modular wall and sightline system that lets our five-person ensemble stage a full show in a storefront.
- **What you did** — The company has made seven works in vacant units since 2018; I built the system across the first three and rewrote it after each run.
- **What resulted** [a,b] — The work produced seven productions, a published build manual with cut lists and load ratings, plus a touring kit that fits in one van.
- **What already changed** [c] — Four other companies have built the system from the manual, and a municipal culture office now lists vacant units for performance after two of the company’s runs filled them.
- **What could change** — A storefront that can be staged in a day could change where midsize companies make work, and which neighbourhoods get to see it.

#### `creative/team/senior` — Senior · Artist-technologist directing a research-creation lab; room-scale installations made from 20 years of ice, wind and water measurement (141 words)

- **Stakes** — Long-term environmental measurement reaches the public as charts, and the slow changes inside those records stay unfelt by anyone outside the field.
- **Your role** — I founded and direct the lab, and I wrote the translation layer that turns a measurement series into sound and moving light.
- **What you did** — Since 2006 the lab has made 11 installations from ice, wind and water records; I composed the sound for nine and set the mapping rules.
- **What resulted** [a,b] — The lab produced 11 installations, an open toolkit for turning measurement series into sound and a written account of the mapping method.
- **What already changed** [c] — Three public collections have acquired works from the series, 60 artists have used the toolkit in their own pieces and four former members now direct labs of their own.
- **What could change** — Making a long measurement series something an audience stands inside could change how slow environmental change is understood outside the sciences.

### Community-engaged — tags: Community-engaged

#### `creative/community/early` — Early career · Sound artist; a listening work made with residents of a seniors’ residence from the sounds of the building (147 words)

- **Stakes** — Care homes are described in charts of staffing and medication, and what a resident actually hears all day is nowhere in the record.
- **Your role** — I co-created the work with residents who chose what was recorded, and I composed the final piece from the material they kept.
- **What you did** — Over 10 months I ran weekly listening sessions with 12 residents, recorded 70 hours in rooms they chose and taught four of them to use the recorders themselves.
- **What resulted** [a] — The project produced a 40-minute listening work, a set of recordings the residence keeps for families and a short guide to running the sessions.
- **What already changed** [b] — The residence has run the sessions monthly since 2025, a sound art festival presented the work and two other residences have taken up the guide.
- **What could change** — Letting people record their own building could change what a residence is able to tell its staff, its families and the public about daily life.

#### `creative/community/mid` — Mid career · Theatre maker; site-specific performance cycle on displacement, co-created with displaced performers (99 words)

- **Stakes** — Conventional theatre kept stories of displacement inside the building, away from the places where they happened.
- **Your role** — I created and direct a site-specific performance cycle staged in transit stations and border landscapes.
- **What you did** — I composed the cycle across three commissions, working with displaced performers as co-creators rather than subjects.
- **What resulted** [a] — The cycle comprises four staged works, an audio walk and a documentary record of the process.
- **What already changed** [b] — The works toured to three international festivals, and two companies have licensed the participatory staging method.
- **What could change** — Site-based co-creation could change who performance about displacement is for — moving the audience to the site of the story.

#### `creative/community/senior` — Senior · Media artist; a 12-year partnership in which an Indigenous-led arts organization sets the questions for outdoor projection works (152 words)

- **Stakes** — Outdoor projection is built for mild evenings in gallery districts, so northern communities with the longest dark season have the least access to it.
- **Your role** — I co-direct this program with an Indigenous-led arts organization that sets the questions and holds the works, and I designed the cold-weather projection system.
- **What you did** — Since 2014 the organization has commissioned 15 works from its own artists; I built the projection rigs, trained 20 operators from the host communities and ran the winter installs.
- **What resulted** [a,b] — The partnership produced 15 commissioned works, a projection kit rated for minus 30 degrees and a technical manual the organization owns.
- **What already changed** [c] — The organization has run the past six commissions without outside technical staff, two northern festivals have adopted the cold-weather kit and three operators I trained now design their own works.
- **What could change** — Equipment designed for the coldest places could change where outdoor art can happen, and who is able to commission it on their own terms.

### Largely solo — tags: Largely solo

#### `creative/solo/early` — Early career · Photographer; a large-format series on rural churches still in weekly use as community halls (137 words)

- **Stakes** — Pictures of rural decline arrive as ruin photographs, and the buildings that congregations still fill each week fall outside that frame.
- **Your role** — I built a body of large-format photographs that show these halls in use, at the hours when the room is doing its work.
- **What you did** — Over 20 months I photographed nine halls across two rural counties, returning to each through a full year of suppers, funerals and council meetings.
- **What resulted** [a] — The series produced 38 exhibition prints, a self-published book with an essay by a rural historian and an open archive of the location notes.
- **What already changed** [b] — Two artist-run centres presented the series in 2025, and a regional museum acquired four prints after a peer-written review placed the work outside the ruin tradition.
- **What could change** — Photographing shared rural space in use, rather than in ruin, could change which buildings get recorded before they close.

#### `creative/solo/mid` — Mid career · Poet; long-form documentary poems built from a fishing fleet’s incident reports and radio logs (145 words)

- **Stakes** — The record of a working life at sea survives mostly in incident reports and radio logs, a language written about workers rather than by them.
- **Your role** — I created a documentary poetics that takes those documents as its material, and I run the sessions where fishing families read the drafts aloud.
- **What you did** — Across eight years I read 30 years of logs held by two harbour authorities, wrote four sequences and tested each against readings in three fishing towns.
- **What resulted** [a,b] — The work produced two poetry collections, a chapbook made with the families and an annotated method note on reading institutional documents as verse.
- **What already changed** [c] — The collections are taught in six creative writing programs, and four other poets have used the method note as the basis of their own archival sequences.
- **What could change** — Reading institutional documents as literature could widen what counts as a record of working life, and who gets to write it.

#### `creative/solo/senior` — Senior · Experimental filmmaker; hand-processed 16 mm films of industrial waterways, developed in plant-based baths (137 words)

- **Stakes** — Films of polluted rivers are usually shot on equipment whose own chemistry is dumped into the same water.
- **Your role** — I direct a film practice that develops its own footage in plant-based baths made from the plants growing at each river I shoot.
- **What you did** — Since 1998 I have shot and hand-processed 14 films along seven waterways, keeping a recipe log for every bath and testing each against standard development.
- **What resulted** [a,b] — The practice produced 14 films, an open recipe manual now in its third edition and a touring program of prints struck for projection.
- **What already changed** [c] — Two national archives hold the prints, and the recipe manual is used in 40 artist-run darkrooms, including three now run by former assistants.
- **What could change** — Making the chemistry part of the subject could change what an ecological film is held to, from what it depicts to how it was made.

### Industry-partnered — tags: Industry-partnered

#### `creative/industry/early` — Early career · Animator; a partnership with an animation studio on keeping hand-drawn timing inside a digital in-betweening pipeline (146 words)

- **Stakes** — Automatic in-betweening smooths the uneven timing that gives hand-drawn animation its weight, and studios lose that quality the moment a schedule tightens.
- **Your role** — As a postdoctoral fellow I led the timing component of a partnership with an animation studio, and I animated the test sequences myself.
- **What you did** — Over 18 months I drew 12 test sequences by hand, compared them frame by frame against the studio’s automatic passes and rebuilt the in-betweening rules with two of its animators.
- **What resulted** [a,b] — The partnership produced a six-minute short film, an open timing tool the studio agreed to release and a paper on the frame-level comparison.
- **What already changed** [c] — The studio used the tool on one series in 2026, the short was selected for two animation festivals and the studio hired the graduate animator who tested it.
- **What could change** — Keeping the irregularity of a drawn line inside automated production could protect a craft that faster pipelines may quietly retire.

#### `creative/industry/mid` — Mid career · Textile artist; a partnership with a weaving mill turning hand-loom structures into acoustic panels for loud public rooms (152 words)

- **Stakes** — Gyms, cafeterias and waiting rooms are quieted with foam nobody wants to look at, so the acoustic layer of a public room stays ugly and disposable.
- **Your role** — I designed the woven structures at the heart of a partnership with a weaving mill, and I direct the testing that scores each one for sound absorption.
- **What you did** — Across four years I wove 90 sample structures by hand, tested them in a reverberation room with the mill’s engineers and adapted 12 for industrial looms.
- **What resulted** [a,b] — The partnership produced a licensed panel line, an exhibition of the 90 samples as hangings and an open paper on the absorption results.
- **What already changed** [c] — The mill put three structures into production in 2024, a school board specified them in eight cafeteria refits and the exhibition travelled to four craft centres.
- **What could change** — Treating sound absorption as a woven surface rather than a hidden layer could give craft research a place in how public rooms are built.

#### `creative/industry/senior` — Senior · Composer and sound director; a decade-long partnership with a public broadcaster on spatial audio drama for headphone listening (146 words)

- **Stakes** — Radio drama was written for a speaker in a room, and the headphone listening that replaced it flattens the space the writing depends on.
- **Your role** — I direct the sound research inside a partnership with a public broadcaster, and I composed the scores and the spatial staging for its drama strand.
- **What you did** — Since 2015 I have scored 22 spatial productions, run listening tests with 400 listeners and trained 30 of the broadcaster’s producers in the staging method.
- **What resulted** [a,b] — The partnership produced 22 broadcast dramas, a published staging method and a training course the broadcaster now runs in house.
- **What already changed** [c] — The broadcaster made the method standard across its drama output in 2021, two other public broadcasters have licensed it and 11 producers I trained now lead their own strands.
- **What could change** — Writing drama for the ears people actually use could change how a century-old broadcast form is composed, not only how it is mixed.

