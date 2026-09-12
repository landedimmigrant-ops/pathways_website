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

#### `stem/team/early` — Early career · Postdoctoral materials researcher; why grid-storage battery cells fade faster in cold-weather duty cycles (144 words)

- **Stakes** — Grid-scale batteries are bought on the strength of laboratory aging curves, and cells in cold climates fade faster than those curves predict.
- **Your role** — As a postdoctoral fellow I led the low-temperature strand of a four-lab study, designing the duty cycles and the teardown protocol the other labs now follow.
- **What you did** — Over 20 months I cycled 96 cells through five temperature profiles and paired the electrical records with teardown imaging done at two partner labs.
- **What resulted** [a,b] — The strand produced a shared cycling protocol, an open dataset of 96 cell histories and one methods paper.
- **What already changed** [c] — The three other labs adopted the protocol for their 2026 runs, and a storage developer used the dataset to rewrite its cold-weather acceptance test.
- **What could change** — If the cold-weather effect holds across other chemistries, storage could be specified on climate-matched aging data, and cold-region utilities could size installations to the service life expected in their climate.

#### `stem/team/mid` — Mid career · Structural engineer; acoustic fatigue detection for aging bridges (128 words)

- **Stakes** — Aging bridges can fail with little warning, and manual inspection is costly, slow and intermittent.
- **Your role** — I led the development of a low-cost acoustic method for detecting fatigue before it is visible, co-designing the field trials with two municipal engineering teams.
- **What you did** — My group built the sensing pipeline, trained the detection models on three years of field recordings and ran blind validation against inspector reports.
- **What resulted** [a,b] — This work produced an open-source monitoring toolkit, a public benchmark dataset and two methods papers.
- **What already changed** [c] — To date, two transit agencies have adopted the toolkit for pilot monitoring, and the benchmark has been used by four independent groups.
- **What could change** — If validated at scale, continuous low-cost monitoring could shift bridge inspection from periodic to preventive across the aging infrastructure stock, a hypothesis the pilot data now makes testable.

#### `stem/team/senior` — Senior · Analytical chemist; a reference method that makes trace-contaminant results comparable between laboratories (131 words)

- **Stakes** — Two laboratories measuring the same soil sample for trace contaminants can report numbers that differ by more than the limit being enforced.
- **Your role** — I direct a shared measurement facility and led the interlaboratory work that turned an in-house method into a reference procedure any accredited laboratory can run.
- **What you did** — Since 2011 I have run seven round-robin comparisons with 34 laboratories, rebuilt the calibration chain twice and trained 19 analysts to the procedure.
- **What resulted** [a,b] — The facility produced a published reference procedure, three certified test materials and an open archive of every round-robin result.
- **What already changed** [c] — Two provincial testing requirements now name the procedure, and 26 commercial laboratories run it as their default, up from four in 2015.
- **What could change** — Wider adoption of the procedure could let regulators enforce contamination limits on measurements that are comparable between laboratories and provinces.

### Community-engaged — tags: Community-engaged + Team-based

#### `stem/community/early` — Early career · Early-career soil scientist; a soil-testing method run by community gardeners on former industrial lots (154 words)

- **Stakes** — Gardeners on former industrial lots are warned about lead in their soil, and a commercial laboratory test costs more than most community plots spend in a season.
- **Your role** — At the request of a gardeners’ association, I designed and ran the sampling method with its members and trained them to collect and log samples.
- **What you did** — Across two growing seasons I trained 24 gardeners on nine plots, compared their samples against laboratory results and set the sampling depth rule with them.
- **What resulted** [a,b] — The project produced a one-page sampling guide in three languages, a soil map of the nine plots and a report co-authored with the association.
- **What already changed** [c] — The association now runs its own sampling day each spring, and the municipality used the map to replace the soil in two beds in 2026.
- **What could change** — If other associations adopt the method, community gardens could identify the beds that need remediation at a cost volunteers can cover, in cities with thousands of such plots.

#### `stem/community/mid` — Mid career · Environmental engineer; storm-by-storm creek monitoring designed with a watershed group (141 words)

- **Stakes** — A watershed group held 20 years of monthly samples from their creek, a record that shows average conditions and does not identify the storms or outfalls carrying bacteria into it.
- **Your role** — I co-led, with that group, a monitoring program designed around their question of when and where contamination enters the creek.
- **What you did** — My team and the group’s volunteers placed 18 continuous sensors along 40 kilometres of creek and sampled through 22 storms, with two graduate students maintaining the network.
- **What resulted** [a,b] — The program produced an open data portal the group maintains, a storm-sampling protocol and two papers co-authored with volunteer monitors.
- **What already changed** [c] — The municipality repaired two cross-connections in 2025 after reviewing that evidence, and three other watershed groups have set up the same sensor plan.
- **What could change** — Volunteer-run continuous monitoring could move water quality enforcement toward individual storm events, the periods that account for most swimming beach closures.

#### `stem/community/senior` — Senior · Freshwater ecologist; a 16-year lake fish-health record whose questions are set by an Indigenous-led stewardship organization (150 words)

- **Stakes** — Fish health in a large northern lake was assessed from summer surveys by visiting scientists, and the year-round observations of the people who fish it were rarely recorded.
- **Your role** — I co-lead this program with an Indigenous-led stewardship organization that sets the questions and holds the record; I built the analysis linking observer logs to laboratory results.
- **What you did** — Since 2010, 42 observers trained by the organization have logged catch condition at 14 sites, and I have run the laboratory analysis each year.
- **What resulted** [a,b] — The program produced a 16-year open record the organization controls, an annual community-authored report and a sampling protocol written into two co-management plans.
- **What already changed** [c] — The organization used the record to negotiate a seasonal closure in 2024, and a federal monitoring program adopted the observer protocol at 11 other lakes.
- **What could change** — Long-term observation records held by community organizations could be accepted as standard evidence in fisheries management if other monitoring programs adopt this structure.

### Largely solo — tags: Largely solo

#### `stem/solo/early` — Early career · Statistician in a first faculty position; trend tests for irregularly sampled monitoring data (135 words)

- **Stakes** — Environmental monitoring records are often sampled at irregular intervals, and the standard tests for a change in trend assume regular sampling.
- **Your role** — In my first faculty position I built an estimator that holds the false-alarm rate steady when sampling is irregular, and released it as a documented package.
- **What you did** — Over 18 months I proved the coverage result, tested the estimator on 30 years of series from three public archives and wrote the reference implementation.
- **What resulted** [a] — The work produced one single-authored paper, a documented package and a tutorial written with the archive’s data curator.
- **What already changed** [b] — Two monitoring groups have replaced their previous test with the package, and a graduate methods course adopted the tutorial in 2026.
- **What could change** — Wider use of the estimator could bring decades of irregularly sampled records into trend analysis with false-alarm rates that remain at the stated level.

#### `stem/solo/mid` — Mid career · Computer scientist; measuring when a trained model’s confidence stops matching how often it is right (144 words)

- **Stakes** — A trained model can report 90 per cent confidence on data unlike its training set, and that gap between stated confidence and accuracy is hard to detect downstream.
- **Your role** — I developed and maintain a diagnostic test that detects when a model’s reported confidence no longer tracks its accuracy.
- **What you did** — I ran the diagnostic across 12 public benchmarks and 40 trained models, derived the bound that explains when it fails and rebuilt the library twice over four years.
- **What resulted** [a,b] — The work produced two first-authored papers, an open library kept in release by a research software engineer and a benchmark suite of shifted test sets.
- **What already changed** [c] — Three firms name the diagnostic in their internal model-review checklists, and the benchmark suite is the baseline in 12 later studies.
- **What could change** — If the diagnostic is adopted in routine evaluation, models could be required to report measured calibration before they are used in consequential decisions.

#### `stem/solo/senior` — Senior · Optical physicist; a scattering model for cloudy materials, and the instruments built on it (149 words)

- **Stakes** — Light leaving a cloudy material carries information about its internal structure, and for decades that scattered signal was treated as interference and discarded.
- **Your role** — I developed the scattering model now used to interpret that signal and have maintained it as a single-investigator program since 2004, with an instrument maker testing each version against hardware.
- **What you did** — I derived the model, wrote the open solver and validated it against measurements on 60 materials contributed by six laboratories over two decades.
- **What resulted** [a,b] — The work produced a monograph, an open solver in continuous release since 2009 and 30 single- or first-authored papers.
- **What already changed** [c] — The solver runs inside two commercial imaging instruments and is taught in nine graduate courses; 14 groups, four led by former students, have built their own estimators on its equations.
- **What could change** — An openly published model and solver could keep this class of measurement available to small laboratories and to groups that build their own instruments.

### Industry-partnered — tags: Industry-partnered + Team-based

#### `stem/industry/early` — Early career · Early-career robotics researcher; force-limited handling so a robot arm can share a bench with people at a small-batch manufacturer (151 words)

- **Stakes** — On small-batch assembly benches a robot arm must be fenced off for safety, so short-run jobs that need a person alongside it are done by hand.
- **Your role** — In a research partnership with a mid-sized manufacturer I designed and tested the force-limiting controller, which the firm co-funded and hosted on its own bench.
- **What you did** — Over 14 months I ran 400 part handovers on that bench with eight operators and measured contact forces against the stop thresholds.
- **What resulted** [a,b] — The partnership produced a controller running on two arm models, an open test suite for contact limits and a paper the firm cleared for publication.
- **What already changed** [c] — The firm moved one bench to shared human-robot operation in 2026, and two other research groups have run the open test suite on their own hardware.
- **What could change** — If contact limits remain inexpensive to verify, collaborative arms could become practical for the small manufacturers that do most short-run work and have limited safety engineering support.

#### `stem/industry/mid` — Mid career · Manufacturing engineer; catching porosity while a metal part is still printing, with an aerospace supplier (153 words)

- **Stakes** — Metal printed parts are qualified by sectioning or scanning finished pieces, so a defective build is identified only after the machine time has been spent.
- **Your role** — I lead an in-process monitoring program with an aerospace supplier and designed the labelling method that links melt-pool signals to the flaws later found in sectioned parts.
- **What you did** — My group instrumented four printers across two plants and built a labelled library of 2,400 build segments, which two doctoral students checked against destructive inspection over three years.
- **What resulted** [a,b] — The program produced a monitoring module the supplier now runs on its machines, an open labelled dataset and four papers.
- **What already changed** [c] — In 2025 the supplier qualified the module for one part family and cut scrap there by a fifth; two research groups have since trained models on the dataset.
- **What could change** — If qualification bodies accept in-process evidence, printed structural parts could be certified from recorded build data, and destructive sampling could be reserved for periodic audit.

#### `stem/industry/senior` — Senior · Power systems engineer; finding faults on rural distribution lines from recordings the utility already makes (146 words)

- **Stakes** — When a rural distribution line faults, crews patrol kilometres of road to locate it, and the outage continues for the duration of the search.
- **Your role** — I have directed a partnership with a distribution utility since 2013 and built the fault-location method that uses the recordings its protection relays already produce.
- **What you did** — My group tested the method against 11 years of recorded faults, ran live trials on 14 feeders and rewrote the dispatch rule with the utility’s crews.
- **What resulted** [a,b] — The partnership produced a fault-location tool now running in the utility’s control room, an open method description and two doctoral theses.
- **What already changed** [c] — Patrol time on the trial feeders fell from 96 minutes to 28; three other utilities have licensed the tool, and a national protection guideline now describes the method.
- **What could change** — Fault location from recordings that utilities already collect could shorten outages across rural networks, with no new hardware installed on the lines.

## Health / clinical

### Team-based — tags: Team-based

#### `health/team/early` — Early career · Rehabilitation researcher; postdoctoral fellow who built the walking-recovery measurement protocol for a four-site stroke rehabilitation trial (125 words)

- **Stakes** — Stroke rehabilitation trials measure walking recovery differently at every site, which limits comparability across studies.
- **Your role** — As a postdoctoral fellow I designed the measurement protocol for the walking-recovery outcome in a four-site rehabilitation trial, and I trained the assessors who used it.
- **What you did** — I wrote the assessment manual, ran certification sessions for 22 assessors across the four sites and audited 180 recorded assessments over 20 months.
- **What resulted** [a,b] — The trial produced a published measurement protocol, an assessor certification package and a methods paper reporting agreement between raters.
- **What already changed** [c] — Two other rehabilitation trials have adopted the protocol, and a hospital training program now teaches the certification package to new therapists.
- **What could change** — A shared measurement protocol could allow small rehabilitation trials to be pooled, so that treatment questions are answered with fewer patients.

#### `health/team/mid` — Mid career · Nursing scientist; a bedside protocol for preventing sudden confusion in intensive care, tested across seven units (142 words)

- **Stakes** — Older patients in intensive care often develop sudden confusion, which lengthens their hospital stay and is distressing for their families.
- **Your role** — I designed the bedside prevention protocol for a seven-unit intensive care study, including the sleep and mobility steps nurses carry out and the monthly audit our team ran.
- **What you did** — My team tested the protocol with 640 patients over two years, timed every step against unit staffing levels and retrained 210 nurses as units joined.
- **What resulted** [a,b] — The study produced a bedside protocol, an audit tool that unit staff administer and three papers, two of them first-authored by my trainees.
- **What already changed** [c] — Nine intensive care units in two hospital networks have adopted the protocol, and a regional nursing orientation program added the sleep and mobility steps in 2025.
- **What could change** — If the same steps hold in smaller hospitals, prevention could become a routine part of critical care for older patients.

#### `health/team/senior` — Senior · Pediatric pain researcher; observational pain measures for children unable to report pain, built with an 11-site network since 2010 (135 words)

- **Stakes** — Pain in children who are unable to report it, among them infants and children with severe disabilities, is under-recognized because standard assessment relies on self-report.
- **Your role** — I direct the network that built observational pain measures for these children, and I designed the scoring system its 11 hospitals now share.
- **What you did** — Since 2010 we have studied 2,400 children across 11 hospitals, and I led the analysis that set the scoring thresholds now used at the bedside.
- **What resulted** [a,b] — The network produced two validated pain measures, a training curriculum in four languages, an open scoring manual and 40 papers.
- **What already changed** [c] — Two international pediatric guidelines now recommend the measures, and 60 hospitals in nine countries use the curriculum that three former trainees run.
- **What could change** — Wider adoption of observational scoring could make bedside measurement of pain routine for children who are unable to report it.

### Community-engaged — tags: Community-engaged + Team-based

#### `health/community/early` — Early career · Community health researcher; an Indigenous-led health organization set the questions for a hospital-to-home follow-up check in two northern communities (152 words)

- **Stakes** — People flown out of northern communities for hospital care return home with little structured follow-up, and some are flown out again for the same condition.
- **Your role** — An Indigenous-led health organization set the research question and I co-designed, with its care team, a follow-up check that local workers carry out after a patient comes home.
- **What you did** — Over 14 months as a postdoctoral fellow I trained six local health workers, met with Elders and families in two communities and rewrote the check three times.
- **What resulted** [a] — The work produced a follow-up protocol the organization owns, a plain-language guide for families and a report co-authored with its research lead.
- **What already changed** [b] — The organization now delivers the check for 90 people a year, and the data-sharing agreement I drafted with its board assigns ownership of the records to the organization.
- **What could change** — Adoption of the check by other communities could make follow-up after a medical flight a standard part of care across the region.

#### `health/community/mid` — Mid career · Primary-care researcher; two-question food-security screen co-designed with a community health centre (122 words)

- **Stakes** — Clinics seldom ask about food access, so a treatable driver of poor health is absent from the primary care record.
- **Your role** — I co-led, with a community health centre, the design of a two-question food-security screen that fits inside routine intake.
- **What you did** — My team ran co-design workshops with patients and intake staff, piloted the screen across four clinics and measured uptake over 18 months.
- **What resulted** [a] — The work produced a validated screening protocol, a training module for intake staff and a peer-reviewed validation study.
- **What already changed** [b] — Three regional clinics have embedded the screen in routine intake, and referrals to food-support programs rose measurably at the pilot sites.
- **What could change** — Embedded screening could make food insecurity as routine to assess as blood pressure, a change I am now studying across the region.

#### `health/community/senior` — Senior · Mental health services researcher; peer-delivered follow-up in the week after a crisis, co-designed with people who have used crisis services (153 words)

- **Stakes** — Risk of harm is highest in the week after a crisis service discharges someone, and responsibility for that week is not assigned to any service.
- **Your role** — I co-founded and direct a program in which people who have used crisis services make the follow-up calls, and I led the design of their training.
- **What you did** — Since 2014 my team and 30 peer workers have followed 4,200 people through that week, and I rebuilt the model twice in response to what the peer workers reported.
- **What resulted** [a,b] — The program produced a peer training curriculum, a handbook on supporting peer staff, an evaluation with peer co-authors and a public dashboard of its results.
- **What already changed** [c] — Peer workers now run the follow-up at 14 crisis services in three regions, and 80 per cent of people surveyed found the call from a peer worker helpful.
- **What could change** — Wider adoption of peer-delivered follow-up could make the week after a crisis a funded and staffed component of crisis care.

### Largely solo — tags: Largely solo

#### `health/solo/early` — Early career · Health economist; first faculty position; the out-of-pocket cost of reaching specialist care for rural patients (136 words)

- **Stakes** — For patients in rural areas, a specialist appointment carries costs for travel, overnight accommodation and time away from paid work, and health spending estimates exclude them.
- **Your role** — In my first faculty position I built the first bottom-up estimate of what rural patients pay out of pocket to reach specialist care.
- **What you did** — I interviewed 62 patients about a single appointment trip, matched their accounts against 14 months of appointment records and wrote an openly available cost calculator.
- **What resulted** [a,b] — The work produced an open cost calculator, a methods paper and a short brief written for patient navigators.
- **What already changed** [c] — Two patient-navigation programs now use the calculator when they arrange travel, and a graduate course in health economics teaches the method with my data.
- **What could change** — If patient-borne costs were included in planning, distance could be weighted differently in decisions about where specialist services are located.

#### `health/solo/mid` — Mid career · Epidemiologist; a decade of administrative records analyzed for immunization timing (134 words)

- **Stakes** — Immunization statistics report coverage at age two, so late starts and the delays that follow them are not measured.
- **Your role** — I built and lead a research program that measures the timing of every dose in a decade of linked health records.
- **What you did** — I negotiated access to the linked records, followed 380,000 children born between 2012 and 2020 and defined the timing measures used in the analysis.
- **What resulted** [a,b] — The program produced a public timing dataset, two methods papers and an open code library that three provinces can run on their own records.
- **What already changed** [c] — Nine public health units rescheduled their reminder notices to the months when delays begin, and 11 subsequent studies use the dataset as their baseline.
- **What could change** — Dose-timing surveillance could allow public health services to identify when delays begin and to target reminders to that point in the schedule.

#### `health/solo/senior` — Senior · Geriatrics health services researcher; 18 years on how long-term care homes decide whether to send a dying resident to hospital (152 words)

- **Stakes** — Residents of long-term care homes are transferred to emergency departments in their last weeks of life, often because night staff lack the authority to arrange an alternative.
- **Your role** — I have studied these decisions for 18 years, and I developed the bedside guide that staff now use to discuss transfer with residents and families.
- **What you did** — I observed 400 night shifts in 30 homes since 2008, interviewed 220 staff and families with a research nurse I hired and tested the guide in 12 homes.
- **What resulted** [a,b] — The program produced a bedside decision guide, a book on decision-making during night shifts and a training film used in staff orientation.
- **What already changed** [c] — The guide is used in 260 homes across three provinces, and night transfers to hospital fell by a third at the 12 homes that tested it first.
- **What could change** — If night staff are able to act on a resident’s documented wishes, dying in place could become a consistent option in long-term care.

### Industry-partnered — tags: Industry-partnered + Team-based

#### `health/industry/early` — Early career · Digital health researcher; postdoctoral fellow evaluating remote check-ins after day surgery with a software firm (144 words)

- **Stakes** — Patients discharged on the day of surgery monitor their own recovery at home, and telephone follow-up is unstructured and seldom documented.
- **Your role** — As a postdoctoral fellow I led the clinical component of a partnership with a software firm, and I wrote the check-in questions and the nurse escalation rules.
- **What you did** — I ran a 12-month evaluation with 240 patients at one hospital, met the firm’s engineers every second week and published the escalation rules in full.
- **What resulted** [a,b] — The partnership produced a tested check-in protocol, an openly published rule set and a paper identifying which responses predicted a return to hospital.
- **What already changed** [c] — The hospital has continued the check-in for 40 patients a week since the study ended, and the firm rewrote its alert thresholds to match the trial findings.
- **What could change** — Check-ins built around the responses that predict complications could extend structured follow-up to day-surgery patients who live far from the hospital.

#### `health/industry/mid` — Mid career · Clinical vision researcher; a portable eye-screening camera tested in primary care with a device manufacturer (152 words)

- **Stakes** — Sight loss from diabetes is preventable when the eye is examined each year, and that examination is available only in specialist clinics with a six-month wait.
- **Your role** — I lead the clinical arm of a partnership with a device manufacturer, and I designed the study that tested its portable camera against the specialist examination.
- **What you did** — My group screened 3,100 patients at nine primary care clinics over two years, and the analysis was conducted independently of the manufacturer.
- **What resulted** [a,b] — The partnership produced a validated screening pathway, an open image set from 3,100 patients and two papers that the agreement required to be published regardless of findings.
- **What already changed** [c] — The wait for a first eye check fell from 24 weeks to nine days at six clinics that now screen on site, and the manufacturer hired two of my trainees.
- **What could change** — Portable screening in primary care could allow sight loss from diabetes to be detected at a routine visit across the region.

#### `health/industry/senior` — Senior · Pharmacoepidemiologist; a 12-year partnership with a pharmaceutical firm on catching harm signals after a medicine reaches the market (155 words)

- **Stakes** — Adverse effects that emerge only after a medicine is in wide use are detected late, because the earliest reports are unstructured text that is difficult to analyze at scale.
- **Your role** — I direct the academic team in a 12-year partnership with a pharmaceutical firm, and I set the rule that every safety signal we identify is published regardless of the finding.
- **What you did** — My group built the detection method, tested it against 30 years of reports and ran it in parallel with the firm’s own monitoring for four years.
- **What resulted** [a,b] — The partnership produced an open detection method, a shared evaluation dataset and 14 papers, five of them reporting safety signals in the partner’s own products.
- **What already changed** [c] — The firm rebuilt its safety monitoring around the method in 2023, and two other manufacturers and a hospital network now run the open version.
- **What could change** — Applied across reporting systems, the method could shorten the interval between a medicine reaching patients and the first published safety signal.

## Social sciences

### Team-based — tags: Team-based

#### `social/team/early` — Early career · Developmental psychologist; postdoctoral lead of the home-recording component of a three-site study of how everyday talk builds vocabulary in bilingual toddlers (143 words)

- **Stakes** — Vocabulary differences are measurable before kindergarten, and the home conversations that build vocabulary have rarely been recorded in the languages bilingual families speak.
- **Your role** — As a postdoctoral fellow I designed and ran the home-recording component of a three-site study, including the coding scheme the team now uses.
- **What you did** — Over 20 months I recruited 140 families in three neighbourhoods, collected day-long audio at home and trained six assistants to code bilingual turn-taking.
- **What resulted** [a,b] — The component produced an open coding manual for bilingual turn-taking, a training set of annotated recordings and two first-authored papers.
- **What already changed** [c] — Two other developmental labs have adopted the coding manual, and a neighbourhood family centre built its 2025 parent workshops around the summaries families received from the study.
- **What could change** — Routine recording of both of a child’s languages could make bilingual input a standard measure in early-vocabulary research, and child-care staff could be trained to observe it.

#### `social/team/mid` — Mid career · Political scientist; repeated survey program across 12 municipalities on the residents who have stopped voting in local elections (143 words)

- **Stakes** — Turnout in municipal elections has fallen over successive cycles, and residents who have stopped voting are under-represented in standard surveys.
- **Your role** — I co-lead a survey program on local non-voting with two colleagues, and I designed the sampling frame and the weighting procedure the program uses.
- **What you did** — Since 2019 my team has fielded four waves across 12 municipalities, and I rebuilt the weights after each wave to correct under-coverage of renters and newcomers.
- **What resulted** [a,b] — The program produced a four-wave public dataset of 9,400 interviews, an open weighting method other teams reuse and two articles with doctoral students.
- **What already changed** [c] — Two city clerks’ offices redesigned their voter-information mailings after the 2023 wave, and a residents’ coalition used the ward-level tables in its door-knocking campaign.
- **What could change** — If non-voters can be sampled reliably, turnout research could account for absence as well as preference, and election offices could target information campaigns with survey evidence.

#### `social/team/senior` — Senior · Criminologist; four-university consortium observing bail hearings in 11 courthouses and the costs of pretrial detention (144 words)

- **Stakes** — Bail hearings last minutes and are documented only in brief court records, so the reasons for detaining people before trial are difficult to study systematically.
- **Your role** — I direct a four-university consortium on pretrial detention and developed the observation protocol coders use to record hearings consistently across courthouses.
- **What you did** — Since 2014 the consortium has observed 6,200 hearings in 11 courthouses, and I led the analysis linking hearing content to the length of detention.
- **What resulted** [a,b] — The program produced an open observation protocol, a de-identified hearing dataset held at a research data centre and a training guide written with two retired judges.
- **What already changed** [c] — Judicial education bodies in three provinces built the findings into new-judge training after 2021, and four former trainees now direct pretrial research units.
- **What could change** — Systematic observation of hearings could give pretrial policy a measured evidence base, and could let courts monitor the length of detention as a routine statistic.

### Community-engaged — tags: Community-engaged

#### `social/community/early` — Early career · Urban geographer; with a tenants’ association, measuring how hot apartments get inside during summer heat waves (148 words)

- **Stakes** — Heat warnings are based on outdoor temperature, and the temperature inside the apartments where residents fall ill during heat waves is rarely recorded.
- **Your role** — I co-designed, with a tenants’ association in a neighbourhood of walk-up buildings, a study that placed temperature sensors inside apartments.
- **What you did** — Across two summers I trained 11 tenant volunteers to install sensors in 48 apartments and to read the weekly temperature charts with their neighbours.
- **What resulted** [a,b] — The study produced an indoor-temperature dataset the association holds with me, a reporting template it sends to members each July and an article written with two of its organizers.
- **What already changed** [c] — The association used the first summer’s readings in its 2025 negotiations with two building owners, and the municipality added shade and a cooling room at the neighbourhood centre.
- **What could change** — If indoor temperature is measured routinely, heat warnings could account for conditions inside housing, and tenants could bring measured evidence to a building owner.

#### `social/community/mid` — Mid career · Social work researcher; with a workers’ centre, counting unpaid wages among temporary agency workers and what recovery takes (156 words)

- **Stakes** — Workers hired through temporary agencies lose pay they are owed, and because responsibility is divided between the agency and the client firm, the scale of the loss is undocumented.
- **Your role** — I co-lead a wage-recovery research program with a workers’ centre whose counsellors set the study’s questions each year.
- **What you did** — Over five years the centre’s counsellors and my team documented 1,180 unpaid-wage cases, and I designed the intake form that converts case notes into comparable records.
- **What resulted** [a,b] — The partnership produced a public annual count of unpaid wages, a caseworker toolkit for building a recovery file and two articles written with the centre’s staff and a doctoral student.
- **What already changed** [c] — The centre rebuilt its intake around the form and recovered $1.4 million in owed wages since 2022, and two other workers’ centres in the province run the same count.
- **What could change** — A standing count built from case files could establish the scale of unpaid wages in agency work, and could support enforcement in subcontracted sectors.

#### `social/community/senior` — Senior · Applied social researcher; 10-year partnership in which an Indigenous-led organization set the terms for how community data is collected and held (156 words)

- **Stakes** — Surveys about Indigenous communities have commonly been designed and stored outside those communities, and the communities described in them have had limited access to the resulting data.
- **Your role** — I co-lead, at an Indigenous-led organization’s invitation, the methods side of a partnership it directs, and I built the training its staff now deliver.
- **What you did** — Since 2016 the organization has run four community surveys of 2,600 households on servers it controls, and I designed the sampling and consent process with its data committee.
- **What resulted** [a,b] — The partnership produced a data governance agreement other organizations adapt, a community-held survey series, a training curriculum and three articles the organization approved before submission.
- **What already changed** [c] — Nine Indigenous-led organizations have adopted the governance agreement since 2021, and the partner now runs a data office staffed by two people it trained through the work.
- **What could change** — Community-held data could change how research questions in this field are set, and could make governance and consent part of study design from the outset.

### Largely solo — tags: Largely solo

#### `social/solo/early` — Early career · Anthropologist; 14-month solo ethnography of night-shift cleaning crews in office towers (144 words)

- **Stakes** — Office towers are cleaned between midnight and dawn by contracted crews, and the working conditions of that shift have received little ethnographic attention.
- **Your role** — I designed and carried out a solo ethnography of night cleaning, working the shift alongside three crews for 14 months.
- **What you did** — Between 2023 and 2025 I completed 140 night shifts in four towers, interviewing 36 cleaners and 11 supervisors about the demands of the shift.
- **What resulted** [a,b] — The fieldwork produced two single-authored articles, a field-note archive prepared for deposit with an archivist and a short illustrated report written for the crews.
- **What already changed** [c] — One building operator’s health and safety committee rewrote its night-shift break rules in 2026 after reviewing the report, and two graduate courses now teach the article.
- **What could change** — The approach could give studies of night work a basis in first-hand observation, and could return findings to the crews described in a form they can use.

#### `social/solo/mid` — Mid career · Sociologist; decade-long earnings cohort of immigrants built from linked administrative data (115 words)

- **Stakes** — Policy debates about immigrant economic integration have relied on point-in-time snapshots, and the same people have rarely been followed long enough to establish earnings trajectories.
- **Your role** — I built and lead a longitudinal program tracking earnings for a single cohort across a decade.
- **What you did** — I negotiated access to linked administrative data, designed the cohort methodology and led the analysis across three waves.
- **What resulted** [a,b] — The program produced a public-use dataset, a methods framework now used by two statistical agencies and a book-length study.
- **What already changed** [c] — Two provincial ministries cited the trajectory findings in settlement-program reviews, and the dataset underpins a growing body of secondary studies.
- **What could change** — Trajectory-based evidence could change how integration policy is evaluated, shifting assessment from point-in-time outcomes to decade-scale mobility.

#### `social/solo/senior` — Senior · Sociolinguist; 22-year recorded corpus of one rural variety across three generations of speakers (148 words)

- **Stakes** — Accounts of language change often rest on recordings made within a single decade, so slow shifts in rural speech are difficult to distinguish from individual variation.
- **Your role** — I built and maintain a recorded corpus of one rural variety, returning to the same families across 22 years.
- **What you did** — Since 2004 I have recorded 310 speakers from three generations in nine villages, transcribing the sessions with two research assistants and annotating each vowel shift by hand.
- **What resulted** [a,b] — The work produced an open annotated corpus released under a licence written with an archivist, a transcription standard for regional speech and two single-authored books.
- **What already changed** [c] — Four provincial archives have adopted the transcription standard, and the corpus has served as the baseline for 19 later studies of vowel change since 2015.
- **What could change** — A corpus recorded over decades could give the field direct evidence of change in progress, and could bring rural varieties into general accounts of language change.

### Industry-partnered — tags: Industry-partnered

#### `social/industry/early` — Early career · Labour economist; field experiment with an employer group on whether posting wage ranges in job ads changes who applies (141 words)

- **Stakes** — Employers disagree about whether to post wage ranges in job ads, and field evidence from live postings is limited.
- **Your role** — In my first faculty position I designed and ran a field experiment with an employer group that co-funded the study and did not control the analysis.
- **What you did** — Across 18 months I randomized wage-range disclosure over 640 job postings at 12 firms and matched each posting to the applications it received.
- **What resulted** [a,b] — The experiment produced an analysis plan registered before data collection, an anonymized applicant dataset and an article the partner reviewed only after submission.
- **What already changed** [c] — Nine firms in the group changed their posting templates in 2025, and a second research team has since replicated the design in a different sector.
- **What could change** — Experimental evidence from live postings could inform employer practice on wage disclosure, and could show whether disclosure widens an applicant pool or changes its composition.

#### `social/industry/mid` — Mid career · Organizational researcher; partnership with a national retailer testing whether stable shift schedules reduce turnover (153 words)

- **Stakes** — Retail schedules are posted days in advance and often change at short notice, and the costs of that instability to employees have seldom been quantified.
- **Your role** — I lead a research partnership with a retailer that co-funds the work, and I designed the scheduling intervention and the outcome measures used in the trial.
- **What you did** — Over three years my team ran a staged rollout in 18 stores with 18 matched control stores, following 2,900 employees through four scheduling cycles.
- **What resulted** [a,b] — The partnership produced a scheduling protocol the retailer now owns, an open measure of schedule stability and a doctoral thesis by the student who conducted the store visits.
- **What already changed** [c] — The retailer extended stable scheduling to 400 stores in 2025 after turnover fell 14 per cent at the trial sites, and a sector association adopted the stability measure.
- **What could change** — Sector-wide adoption of the stability measure could allow schedule quality to be reported alongside other operating measures and weighed against turnover costs.

#### `social/industry/senior` — Senior · Media researcher; decade-long partnership with a regional news publisher measuring which neighbourhoods local coverage reaches (154 words)

- **Stakes** — Newsrooms measure the number of readers a story draws, and they record little about where those readers live, so gaps in local coverage are difficult to detect.
- **Your role** — I direct a partnership with a regional news publisher that co-funds the work, and I designed the neighbourhood reach index the newsroom now uses.
- **What you did** — Since 2016 my team has analyzed 4.2 million article views across 11 local titles, and I led three field tests of proximity ranking with the publisher’s editors and two doctoral students.
- **What resulted** [a,b] — The partnership produced an open reach index, an annual public report on coverage gaps and four articles published without prior review by the publisher.
- **What already changed** [c] — The newsroom moved two reporters to districts the index identified as underserved, and three publishers outside the partnership adopted the index after the 2024 report.
- **What could change** — If reach is measured by neighbourhood, newsrooms could assess coverage by geographic distribution, and residents could see how much reporting their district receives.

## Humanities

### Team-based — tags: Team-based

#### `humanities/team/early` — Early career · Archaeologist; as a postdoc, ran one excavation area and wrote the recording protocol for a five-year settlement dig (137 words)

- **Stakes** — Excavation destroys the deposits it records, and when areas of one site are recorded in different ways, the resulting evidence is difficult to compare.
- **Your role** — I led one of the four excavation areas as a postdoctoral fellow, and wrote the recording protocol the whole team then adopted.
- **What you did** — Over three field seasons I ran a crew of eight in that area, recorded 1,200 contexts and reconciled the protocol with the finds specialists.
- **What resulted** [a,b] — The work produced an open recording protocol, a stratigraphic archive for the area and a co-authored paper on the settlement’s house plans.
- **What already changed** [c] — The other three areas adopted the protocol in the 2025 season, and a nearby project has since used it to re-record its own backlog.
- **What could change** — A recording protocol shared between excavation areas and neighbouring projects could make the results of small excavations comparable in later analysis.

#### `humanities/team/mid` — Mid career · Digital humanist; the encoding standard behind a multilingual correspondence archive built with librarians and computer scientists (141 words)

- **Stakes** — Letters that switch between three languages are indexed poorly by search tools built for a single language, so whole correspondences are difficult to search.
- **Your role** — I designed the encoding standard for the archive, and lead the editorial side of a team that includes two librarians and three computer scientists.
- **What you did** — Since 2019 our team has encoded 12,000 letters from four collections, and I wrote the rules for tagging code-switching and trained 20 editors to apply them.
- **What resulted** [a,b] — The archive released an open encoding standard, a public corpus of the encoded letters and a search interface other projects can run on their own material.
- **What already changed** [c] — Four archives outside the project have adopted the standard for their own multilingual holdings, and 30 courses have used the corpus since 2023.
- **What could change** — A shared way of encoding mixed-language writing could make dispersed multilingual archives searchable as one body of evidence.

#### `humanities/team/senior` — Senior · Musicologist; 18 years directing an international team making playable editions of 18th-century women composers’ manuscripts (150 words)

- **Stakes** — Music by 18th-century women survives mostly in manuscript parts that require editorial reconstruction before they can be performed, and the repertoire is rarely programmed in concert.
- **Your role** — I founded the editorial consortium in 2008 and set its editorial framework, which defines how far an editor can reconstruct a part and requires the remaining gaps to be marked.
- **What you did** — Over 18 years I have directed 14 editors across six countries, edited nine of the volumes and taught the reconstruction method to every editor who joined.
- **What resulted** [a,b] — The consortium has published 22 performing editions, a manual of the reconstruction method and a recorded reference set of the reconstructed movements.
- **What already changed** [c] — Since 2012 ensembles have programmed the editions in more than 200 concerts, and four editors I trained now direct editorial teams of their own.
- **What could change** — Editions prepared for performance could bring this repertoire into the standard concert season and into the histories written about the period’s music.

### Community-engaged — tags: Community-engaged

#### `humanities/community/early` — Early career · Oral historian; with a retired mill workers’ association, recording what a closure did to a town’s memory of its work (137 words)

- **Stakes** — Company records survive the closure of a mill, and the workers’ own account of the work is rarely documented.
- **Your role** — I co-designed the project with a retired workers’ association that set the research questions, and I recorded the interviews.
- **What you did** — Over 20 months I recorded 60 life histories, trained four association members to conduct interviews and built a consent process the association controls.
- **What resulted** [a,b] — The project produced a recorded archive the association holds and controls, a listening room in the town library and an article on how the closure is remembered.
- **What already changed** [c] — The association now runs its own recording sessions with 30 more members, and a school board built a local history unit from the archive in 2026.
- **What could change** — Archives held and controlled by a community could give former workers a continuing say in how the history of their work is recorded.

#### `humanities/community/mid` — Mid career · Film historian; recovering migrant communities’ home-movie archives as historical sources (109 words)

- **Stakes** — Home-movie archives of migrant communities were decaying, uncatalogued and absent from the historical record.
- **Your role** — I direct a recovery project that treats these archives as primary sources for diasporic memory.
- **What you did** — I led digitization partnerships with three community organizations and developed the interpretive framework for reading domestic footage as historical evidence.
- **What resulted** [a,b] — The project produced a digitized open collection, a monograph and a touring exhibition program.
- **What already changed** [c] — The collection is now taught in four university curricula, and the exhibition reached audiences in six cities.
- **What could change** — If domestic footage is accepted as historical evidence, archives could keep the histories of families that institutions rarely collect, a methodological shift the field is beginning to take up.

#### `humanities/community/senior` — Senior · Historian; 16 years with an Indigenous-led archives organization on records about the community held elsewhere (144 words)

- **Stakes** — Records made about Indigenous communities are held in institutions far from those communities, and they are described in the words of the officials who created them.
- **Your role** — I co-lead a project with an Indigenous-led archives organization that sets the research questions, returning copies of those records to the community they describe.
- **What you did** — Since 2010 I have located 4,000 records in 14 institutions and drafted the historical context notes that the organization’s staff then put into their own words.
- **What resulted** [a,b] — The work produced a description framework the organization owns, a finding aid covering the 14 collections and a co-authored book on how those records were made.
- **What already changed** [c] — The organization now runs the access process for all 14 holdings, and eight archives outside the province have adopted the description framework since 2021.
- **What could change** — Description written by the people a record is about could make archives accountable to the communities they document.

### Largely solo — tags: Largely solo

#### `humanities/solo/early` — Early career · Medievalist; a first critical edition of a 14th-century devotional handbook copied and annotated by women (135 words)

- **Stakes** — Hundreds of medieval devotional handbooks copied by women survive in library collections in unedited manuscript form, and consultation requires travel to the holding library.
- **Your role** — I prepared the first critical edition of one such handbook, collating its four surviving copies against each other for the first time.
- **What you did** — Over 30 months I transcribed the four copies, dated their hands with a manuscript librarian and traced how each scribe changed the prayers she copied.
- **What resulted** [a,b] — The edition appeared with a full apparatus, a glossary of the handbook’s prayer vocabulary and an article on its three scribal hands.
- **What already changed** [c] — Two graduate seminars now teach the edition, and a library re-dated a second handbook in its own collection after adopting my collation method.
- **What could change** — Critical editions of the handbooks women copied and annotated could widen the range of medieval readers available for study.

#### `humanities/solo/mid` — Mid career · Philosopher; an account of who is responsible when an organization causes harm no individual intended (138 words)

- **Stakes** — Organizations cause harm that no individual inside them intended, and the standard philosophical accounts of blame locate responsibility only in individual intentions.
- **Your role** — I developed an account of responsibility that locates blame in the roles and procedures of an organization.
- **What you did** — Over 11 years I wrote the two books that set out the account and ran a workshop series that tested it against cases from workplace safety and environmental harm.
- **What resulted** [a,b] — The work produced two monographs, an edited volume prepared with a co-editor in law and a set of teaching cases drawn from public inquiries.
- **What already changed** [c] — The teaching cases are used in 14 courses across philosophy and professional ethics, and two research groups outside philosophy have built on the role-based analysis.
- **What could change** — If the account is taken up in professional ethics, institutions could be held responsible for harms produced by their own procedures.

#### `humanities/solo/senior` — Senior · Historian of cheap print; two decades in booksellers’ ledgers, reconstructing what ordinary readers bought (143 words)

- **Stakes** — Histories of reading were written from the books that survived in fine libraries, and the reading of people who bought penny print has received little study.
- **Your role** — I direct a long-running study of the ledgers, order books and subscription lists that record what ordinary readers purchased.
- **What you did** — Since 2006 I have transcribed the surviving accounts of 40 small booksellers, built a database of 90,000 purchases and trained nine doctoral students on the sources.
- **What resulted** [a,b] — The study has produced three books, a public database of the purchase records and a source guide now used in archive training.
- **What already changed** [c] — The database has been used in 30 later studies, booksellers’ ledgers are now standard evidence in the field and four of my former students run reading histories of their own.
- **What could change** — Booksellers’ records read as evidence of reading could recover audiences that literary history has so far been unable to count.

### Industry-partnered — tags: Industry-partnered

#### `humanities/industry/early` — Early career · Historian of seafaring labour; an 18-month partnership with a game studio on how a 17th-century port is represented (144 words)

- **Stakes** — Historical games reach large popular audiences, and the working lives they depict are largely invented because the surviving records are difficult to read.
- **Your role** — As a postdoctoral fellow I led the historical research strand of a partnership the studio co-funded, under terms that reserved publication rights to me.
- **What you did** — Over 18 months I transcribed 400 wage and provisioning records into a source dossier and ran six workshops in which the design team tested scenes against the evidence.
- **What resulted** [a,b] — The partnership produced a public dossier of the records, a short guide to reading ships’ pay books and an article on shipboard hierarchy.
- **What already changed** [c] — The studio rebuilt its crew system around the wage records before the 2025 release, and two history teachers now use the dossier with senior classes.
- **What could change** — Games built from payroll and provisioning records could place the working lives of ordinary crews at the centre of popular history.

#### `humanities/industry/mid` — Mid career · Translation scholar; a method for translating fiction that switches languages mid-sentence, built with a literary publisher (135 words)

- **Stakes** — Novels that switch between languages are usually translated into a single language, which removes the code-switching that is central to their style.
- **Your role** — I created the translation method used in a partnership that a literary publisher co-funded, and I trained the translators who now apply it.
- **What you did** — Over six years I translated three of the novels, trained 12 translators in the method at a workshop and wrote the decision log that accompanies each published translation.
- **What resulted** [a,b] — The partnership produced three published translations, a translator’s handbook and a comparative study of how the editions handle code-switching.
- **What already changed** [c] — The publisher adopted the method across a 10-book series, and two other presses have licensed the handbook for their own translators since 2024.
- **What could change** — If other publishers adopt the method, more multilingual novels could be translated in a form that preserves their language switching.

#### `humanities/industry/senior` — Senior · Art historian of workshop practice; 14 years with a private conservation laboratory on the attribution of workshop paintings (140 words)

- **Stakes** — Works made by whole workshops are still catalogued under a single name, and the assistants who painted most of the surface are rarely identified.
- **Your role** — I lead the research side of a 14-year partnership with a private conservation laboratory, and I built the framework that compares pigment evidence with workshop contracts.
- **What you did** — Since 2012 I have analyzed the paint layers in 90 paintings, matched them to 300 surviving workshop contracts and trained nine doctoral students to read both.
- **What resulted** [a,b] — The laboratory and I published an attribution protocol, an open dataset of the layer evidence and three books on workshop labour.
- **What already changed** [c] — The laboratory now applies the protocol in every attribution report it issues, and 12 museums have changed the wall text on 40 paintings since 2020.
- **What could change** — Attribution based on pigment evidence and workshop contracts could change how art history describes the production of paintings.

## Creative / fine arts

### Team-based — tags: Team-based

#### `creative/team/early` — Early career · Dance artist in a four-person collective; the movement vocabulary for a stage work built from warehouse picking labour (135 words)

- **Stakes** — Warehouse work is documented in output figures, and the repeated body positions it requires have received little attention in dance research.
- **Your role** — I built the movement vocabulary for our collective’s first evening-length work, which the four of us directed together.
- **What you did** — Over 14 months I trained alongside pickers on two night shifts, brought two of them into the studio as paid consultants and built the vocabulary the four of us rehearsed.
- **What resulted** [a,b] — The work resulted in a 50-minute stage piece, a notated vocabulary other companies can read and a short film of the shift recordings.
- **What already changed** [c] — The piece was selected for two contemporary dance festivals in 2025, and a dance school added the notated vocabulary to its second-year repertory class.
- **What could change** — A notated vocabulary of this kind could give choreography a documented record of the gestures that industrial work requires.

#### `creative/team/mid` — Mid career · Scenographer in a five-person performance company; a modular spatial system for staging full productions in empty retail units (145 words)

- **Stakes** — Midsize performance companies increasingly work in vacant commercial units, and the staging methods those rooms require have received little technical documentation.
- **Your role** — I am the company’s scenographer, and I designed the modular wall and sightline system that allows our five-person ensemble to stage a full show in a storefront.
- **What you did** — The company has made seven works in vacant units since 2018; I built the system across the first three and rewrote it after each run.
- **What resulted** [a,b] — The work produced seven productions, a published build manual with cut lists and load ratings, plus a touring kit that fits in one van.
- **What already changed** [c] — Four other companies have built the system from the manual, and a municipal culture office now lists vacant units for performance after two of the company’s runs filled them.
- **What could change** — Wider use of the system could bring full productions to vacant units in neighbourhoods far from existing theatre venues.

#### `creative/team/senior` — Senior · Artist-technologist directing a research-creation lab; room-scale installations made from 20 years of ice, wind and water measurement (144 words)

- **Stakes** — Long-term environmental measurement reaches the public mainly as charts, and few methods exist for presenting the slow changes in those records to non-specialist audiences.
- **Your role** — I founded and direct the lab, and I wrote the translation layer that turns a measurement series into sound and moving light.
- **What you did** — Since 2006 the lab has made 11 installations from ice, wind and water records; I composed the sound for nine and set the mapping rules.
- **What resulted** [a,b] — The lab produced 11 installations, an open toolkit for turning measurement series into sound and a written account of the mapping method.
- **What already changed** [c] — Three public collections have acquired works from the series, 60 artists have used the toolkit in their own pieces and four former members now direct labs of their own.
- **What could change** — If the toolkit is used more widely, room-scale works could become a common way of presenting slow environmental change to public audiences.

### Community-engaged — tags: Community-engaged

#### `creative/community/early` — Early career · Sound artist; a listening work made with residents of a seniors’ residence from the sounds of the building (144 words)

- **Stakes** — Residential care is assessed through staffing and medication records, and the sound environment residents live in has received little study.
- **Your role** — I co-created the work with residents who chose what was recorded, and I composed the final piece from the material they kept.
- **What you did** — Over 10 months I ran weekly listening sessions with 12 residents, recorded 70 hours in rooms they chose and trained four of them to operate the recorders.
- **What resulted** [a] — The project produced a 40-minute listening work, a set of recordings the residence keeps for families and a short guide to running the sessions.
- **What already changed** [b] — The residence has run the sessions monthly since 2025, a sound art festival presented the work and two other residences have taken up the guide.
- **What could change** — Recordings made by residents could become a regular source of information about daily life in care, in this residence and in others that adopt the method.

#### `creative/community/mid` — Mid career · Theatre maker; site-specific performance cycle on displacement, co-created with displaced performers (97 words)

- **Stakes** — Performance about displacement is usually staged inside theatre venues, at a distance from the places the work describes.
- **Your role** — I created and direct a site-specific performance cycle staged in transit stations and border landscapes.
- **What you did** — I composed the cycle across three commissions, with displaced performers working as co-creators throughout.
- **What resulted** [a] — The cycle comprises four staged works, an audio walk and a documentary record of the process.
- **What already changed** [b] — The works toured to three international festivals, and two companies have licensed the participatory staging method.
- **What could change** — Site-based co-creation could allow performance about displacement to be made and seen at the sites where it occurred.

#### `creative/community/senior` — Senior · Media artist; a 12-year partnership in which an Indigenous-led arts organization sets the questions for outdoor projection works (148 words)

- **Stakes** — Outdoor projection equipment is specified for mild conditions, so northern communities with the longest dark season have few systems rated for their winters.
- **Your role** — I co-direct the program with an Indigenous-led arts organization that sets the questions and holds the works, and I designed the cold-weather projection system.
- **What you did** — Since 2014 the organization has commissioned 15 works from its own artists; I built the projection rigs, trained 20 operators from the host communities and oversaw the winter installations.
- **What resulted** [a,b] — The partnership produced 15 commissioned works, a projection kit rated for minus 30 degrees and a technical manual the organization owns.
- **What already changed** [c] — The organization has run the past six commissions with its own technical crew, two northern festivals have adopted the cold-weather kit and three operators I trained now design their own works.
- **What could change** — If cold-rated equipment becomes standard, northern organizations could commission and present outdoor work in their own communities through the winter.

### Largely solo — tags: Largely solo

#### `creative/solo/early` — Early career · Photographer; a large-format series on rural churches still in weekly use as community halls (136 words)

- **Stakes** — Photographic records of rural change are dominated by images of abandoned buildings, and rural halls still in weekly use are seldom photographed.
- **Your role** — I built a body of large-format photographs that record these halls during the events they host.
- **What you did** — Over 20 months I photographed nine halls across two rural counties, returning to each through a full year of suppers, funerals and council meetings.
- **What resulted** [a] — The series produced 38 exhibition prints, a self-published book with an essay by a rural historian and an open archive of the location notes.
- **What already changed** [b] — Two artist-run centres presented the series in 2025, and a regional museum acquired four prints after a peer-written review described the work as a record of rural halls in use.
- **What could change** — Sustained documentation of rural halls in use could broaden the photographic record of rural community life before these buildings close.

#### `creative/solo/mid` — Mid career · Poet; long-form documentary poems built from a fishing fleet’s incident reports and radio logs (138 words)

- **Stakes** — The record of working life at sea survives mostly in incident reports and radio logs, documents written in institutional language by shore authorities.
- **Your role** — I created a documentary poetics that takes those documents as its material, and I run the sessions where fishing families read the drafts aloud.
- **What you did** — Across eight years I read 30 years of logs held by two harbour authorities, wrote four sequences and tested each against readings in three fishing towns.
- **What resulted** [a,b] — The work produced two poetry collections, a chapbook made with the families and an annotated method note on reading institutional documents as verse.
- **What already changed** [c] — The collections are taught in six creative writing programs, and four other poets have used the method note as the basis of their own archival sequences.
- **What could change** — The method could establish institutional records as an accepted source for literary accounts of working life.

#### `creative/solo/senior` — Senior · Experimental filmmaker; hand-processed 16 mm films of industrial waterways, developed in plant-based baths (130 words)

- **Stakes** — Films about polluted rivers are usually processed with photographic chemicals that are discharged into the same watersheds.
- **Your role** — I direct a film practice that develops its own footage in plant-based baths made from the plants growing at each river I shoot.
- **What you did** — Since 1998 I have shot and hand-processed 14 films along seven waterways, keeping a recipe log for every bath and testing each against standard development.
- **What resulted** [a,b] — The practice produced 14 films, an open recipe manual now in its third edition and a touring program of prints struck for projection.
- **What already changed** [c] — Two national archives hold the prints, and the recipe manual is used in 40 artist-run darkrooms, including three now run by former assistants.
- **What could change** — Plant-based processing could extend the environmental assessment of a film to its production chemistry as well as its subject.

### Industry-partnered — tags: Industry-partnered

#### `creative/industry/early` — Early career · Animator; a partnership with an animation studio on keeping hand-drawn timing inside a digital in-betweening pipeline (145 words)

- **Stakes** — Automatic in-betweening regularizes the uneven timing of hand-drawn animation, and studios have few methods for retaining it under a compressed schedule.
- **Your role** — As a postdoctoral fellow I led the timing component of a partnership with an animation studio, and I animated the test sequences.
- **What you did** — Over 18 months I drew 12 test sequences by hand, compared them frame by frame against the studio’s automatic passes and rebuilt the in-betweening rules with two of its animators.
- **What resulted** [a,b] — The partnership produced a six-minute short film, an open timing tool the studio agreed to release and a paper on the frame-level comparison.
- **What already changed** [c] — The studio used the tool on one series in 2026, the short was selected for two animation festivals and the studio hired the graduate animator who tested it.
- **What could change** — Adoption of the timing tool across studios could allow automated production to retain the irregular timing that hand-drawn animation depends on.

#### `creative/industry/mid` — Mid career · Textile artist; a partnership with a weaving mill turning hand-loom structures into acoustic panels for loud public rooms (146 words)

- **Stakes** — Acoustic treatment in gyms, cafeterias and waiting rooms is usually foam that is concealed or replaced on a short cycle, and woven materials have had little acoustic testing.
- **Your role** — I designed the woven structures used in a partnership with a weaving mill, and I direct the testing that scores each one for sound absorption.
- **What you did** — Across four years I wove 90 sample structures by hand, tested them in a reverberation room with the mill’s engineers and adapted 12 for industrial looms.
- **What resulted** [a,b] — The partnership produced a licensed panel line, an exhibition of the 90 samples as hangings and an open paper on the absorption results.
- **What already changed** [c] — The mill put three structures into production in 2024, a school board specified them in eight cafeteria refits and the exhibition travelled to four craft centres.
- **What could change** — Wider specification of woven absorbers could give craft research a role in the acoustic design of public buildings.

#### `creative/industry/senior` — Senior · Composer and sound director; a decade-long partnership with a public broadcaster on spatial audio drama for headphone listening (144 words)

- **Stakes** — Radio drama was written for loudspeaker listening, and its staging conventions transfer poorly to the headphone listening that now dominates.
- **Your role** — I direct the sound research inside a partnership with a public broadcaster, and I composed the scores and the spatial staging for its drama strand.
- **What you did** — Since 2015 I have scored 22 spatial productions, run listening tests with 400 listeners and trained 30 of the broadcaster’s producers in the staging method.
- **What resulted** [a,b] — The partnership produced 22 broadcast dramas, a published staging method and a training course the broadcaster now runs in house.
- **What already changed** [c] — The broadcaster made the method standard across its drama output in 2021, two other public broadcasters have licensed it and 11 producers I trained now lead their own strands.
- **What could change** — If other broadcasters adopt the staging method, spatial composition could become part of how radio drama is written as well as how it is mixed.

