# NCV Prototype — Persona Simulator

Six Concordia researcher personas spanning early/mid/senior career and all
six Canadian research funder agencies (the three Tri-agency councils + the
three FRQ sector funds). Used to exercise [`narrative-cv-prototype.html`](../../narrative-cv-prototype.html)
under realistic-but-synthetic content, and to produce sharable example
drafts.

## What's here

| File | Purpose |
|---|---|
| `personas.json` | The six persona profiles + their full NCV state objects. |
| `simulate.js` | Node script that validates each persona and writes a Markdown draft. |
| `drafts/*.md` | One Markdown draft per persona (output of the sim). |

## The personas

| ID | Name | Stage | Faculty | Primary funder | Parallel funder |
|---|---|---|---|---|---|
| `aisha` | Dr. Aisha Khan | Early career postdoc | Gina Cody (CS) | NSERC Discovery Launch | FRQNT Établissement (planned) |
| `marcus` | Prof. Marcus Chen-Tremblay | Early career TT (Yr 2) | Fine Arts (Studio Arts) | SSHRC Insight Development | FRQSC Établissement |
| `priya` | Dr. Priya Ramaswamy | Mid-career (Associate) | Arts & Science (Sociology) | SSHRC Insight | FRQSC Soutien aux équipes |
| `david` | Dr. David Goldberg | Mid-career (Associate) | Gina Cody (CIISE) | NSERC Alliance | NSERC Discovery (held parallel) |
| `marie_claude` | Pre. Marie-Claude Bélanger | Senior (Full + CRC Tier 1) | Arts & Science (Health) | CIHR Project | FRQS Programme de carrière |
| `james` | Dr. James Watanabe | Senior (Full, ex-IRC) | Gina Cody (Mech Eng) | NSERC Discovery | NSERC Alliance |

The matrix covers:

- **All 3 Tri-agency councils** (NSERC, SSHRC, CIHR)
- **All 3 FRQ funds** (FRQNT, FRQSC, FRQS)
- **3 career stages** (early × 2, mid × 2, senior × 2)
- **3 Concordia faculties** (Gina Cody, Arts & Science, Fine Arts)
- **Multiple competition types** (Discovery, Alliance, Insight, Insight Development, Project Grant, Établissement, Soutien aux équipes, Programme de carrière)

Each persona's `funderNotes` field captures the TCV-vs-CV-FRQ adaptation —
where hyperlinks are permitted, where Personal Statement framing shifts,
and so on.

## Running the sim

```bash
node tests/ncv-personas/simulate.js
```

No npm dependencies — Node 18+ built-ins only. The script:

1. Reads `personas.json`
2. Validates each persona's state against the prototype's schema
   (Personal Statement fields, contribution bundles, mentorship groups)
3. Writes one Markdown draft per persona to `drafts/<id>.md`
4. Prints a pass/fail table to stdout

A non-zero exit code indicates one or more validation failures.

## Loading a persona into the live prototype

The prototype reads `?persona=<id>` from the URL and (a) fetches this folder,
(b) replaces the current localStorage state with the persona's state, and
(c) re-renders the tool with the persona's content. A "PERSONA LOADED"
badge appears in the bottom-right with an *Exit persona* link.

Local:
```
http://localhost:8000/narrative-cv-prototype.html?persona=priya
```

Live (GH Pages):
```
https://landedimmigrant-ops.github.io/pathways_website/narrative-cv-prototype.html?persona=priya
```

Replace `priya` with any persona ID from the table above. To exit, click
the *Exit persona* link in the badge, or load the prototype with no query
string — the persona load only happens when the param is present.

## Adding a persona

1. Append a new entry to the `personas` array in `personas.json`. The
   `state` object must contain `funder`, `mentorCounts`, `mentorship[]`,
   `contributions[]` (each with theme/activities/outputs/outcomes/evidence/impact),
   and `ps` (with role/institution/field/whyArea/whyMine/prospective).
2. Run `node tests/ncv-personas/simulate.js`. If validation passes, a new
   draft will appear at `drafts/<your-id>.md`.
3. Optionally load it in the prototype via `?persona=<your-id>` for a
   visual check.

## What the drafts look like

Each `drafts/*.md` file contains:

- A header table with career stage, appointment, faculty, funders
- A short biography
- TCV vs CV-FRQ adaptation notes for that persona
- The complete Personal Statement in the new two-question scaffold
- All Most Significant Contribution bundles in Activities → Outputs →
  Outcomes → Evidence → Impact form
- Mentee counts + all mentorship groups (philosophy / environment / EDI / awards)
- The Final Self-Check state
- Direct links to load the persona in the local + deployed prototype

These are designed to be sharable with reviewers (Eli, Holly, advisors)
as concrete examples of what a researcher draft might look like once
filled in using the redesigned tool.
