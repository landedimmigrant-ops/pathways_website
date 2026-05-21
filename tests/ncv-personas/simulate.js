#!/usr/bin/env node
/**
 * NCV prototype — persona simulation
 *
 * Reads tests/ncv-personas/personas.json, validates each persona's state
 * against the prototype's expected schema, generates a Markdown draft per
 * persona, and writes the result to tests/ncv-personas/drafts/.
 *
 * Run:  node tests/ncv-personas/simulate.js
 *
 * No npm dependencies — uses only Node built-ins so this can be run by
 * any reviewer with Node 18+ installed.
 */

"use strict";

const fs = require("fs");
const path = require("path");

const HERE = __dirname;
const PERSONAS_PATH = path.join(HERE, "personas.json");
const DRAFTS_DIR = path.join(HERE, "drafts");

// ── Helpers ────────────────────────────────────────────────────────────────
const FUNDER_LABELS = { tcv: "Tri-agency CV (TCV)", "cv-frq": "CV-FRQ", "": "Funder not selected" };
const FIELD_LABELS = { activities: "Activities", outputs: "Outputs", outcomes: "Outcomes", evidence: "Evidence", impact: "Impact" };
const FIELD_KEYS = ["activities", "outputs", "outcomes", "evidence", "impact"];
const SELF_CHECK_ITEMS = [
  "I used 'I' rather than 'we' throughout",
  "Each contribution states a clear, specific outcome",
  "I included at least one form of evidence per contribution",
  "My personal statement links past work to future direction",
  "I have noted where my draft still needs strengthening"
];

const indent = (s, n = 2) => s.split("\n").map((l) => " ".repeat(n) + l).join("\n");

// ── Phase F — analyseField: port of the prototype's Tier-1 detectors ──────
// Same rules + IDs as narrative-cv-evaluation.md and the prototype's LINT_RULES.
// Used to emit auto-rubric scores per field in the generated drafts.
const ANALYSE_LENGTH_RANGES = {
  activities: [40, 80], outputs: [30, 60], outcomes: [50, 100], evidence: [30, 80], impact: [40, 100]
};
const ACTION_VERBS_STR = "led|designed|built|developed|co-led|co-designed|founded|supervised|secured|established|negotiated|authored|ran|validated|launched|deployed|chaired";
const OWNERSHIP_RX = new RegExp(`\\bI\\b[^.!?]{0,60}\\b(${ACTION_VERBS_STR})\\b`, "i");
const WE_RX = /\b(we|us|our)\b/gi;
const WEAK_RX = /\b(worked on|participated in|assisted with|was involved in|helped with)\b/i;
const YEAR_RX = /\b(19|20)\d{2}\b/g;
const CURRENCY_RX = /\$[\d,]+|\bCAD\s*[\d,]+/gi;
const VAGUE_PHRASES = ["various", "several", "many", "some", "a number of", "a few", "multiple",
  "well-received", "widely cited", "highly regarded", "well-known",
  "high-impact journal", "top-tier journal", "leading journal"];
const BARE_ADJECTIVES = ["significant", "important", "major"];
const HEDGE_WORDS = ["could", "would", "should", "might", "may", "perhaps", "somewhat", "relatively", "fairly", "slightly", "tried to", "attempted to"];

const matchPhrase = (text, phrase) => {
  const re = new RegExp(`\\b${phrase.replace(/ /g, "\\s+")}\\b`, "gi");
  return text.match(re) || [];
};

const analyseField = (text, field) => {
  const t = text || "";
  // T1.first-person-ownership
  const we = (t.match(WE_RX) || []).length;
  const hasOwnership = OWNERSHIP_RX.test(t);
  const ownershipPoint = hasOwnership && we === 0;
  // T1.specificity
  const years = t.match(YEAR_RX) || [];
  let stripped = t;
  years.forEach((y) => { stripped = stripped.replace(y, ""); });
  const nums = (stripped.match(/\b\d+(?:[.,]\d+)?%?\b/g) || []).length;
  const currency = (t.match(CURRENCY_RX) || []).length;
  const specPoint = (nums + currency + years.length) > 0;
  // T1.vague-language
  let vagueHits = 0;
  VAGUE_PHRASES.forEach((p) => { vagueHits += matchPhrase(t, p).length; });
  BARE_ADJECTIVES.forEach((w) => {
    const re = new RegExp(`\\b${w}\\b(?=\\s*(?:[.,;:]|$|\\sand\\b))`, "gi");
    const m = t.match(re); if (m) vagueHits += m.length;
  });
  const vaguePoint = vagueHits === 0;
  // T1.hedging-field-aware
  let hedgeHits = 0;
  HEDGE_WORDS.forEach((w) => { hedgeHits += matchPhrase(t, w).length; });
  const hedgePoint = field === "impact" ? hedgeHits > 0 : hedgeHits === 0;
  // T1.length
  const wc = t.trim().split(/\s+/).filter(Boolean).length;
  const [min, max] = ANALYSE_LENGTH_RANGES[field] || [30, 80];
  let lengthStatus = "ok";
  if (wc === 0) lengthStatus = "empty";
  else if (wc < 10) lengthStatus = "too-short";
  else if (wc < min) lengthStatus = "short";
  else if (wc > max * 1.5) lengthStatus = "long";

  const rubric = [ownershipPoint, specPoint, vaguePoint, hedgePoint].filter(Boolean).length;
  return { rubric, wordCount: wc, lengthStatus, range: [min, max], we, hasOwnership, vagueHits, hedgeHits };
};

const DIAG_LABEL = { check: "✓ Approved", cross: "✗ Needs work", "?": "? Unsure" };

// ── Assertions ─────────────────────────────────────────────────────────────
class AssertionError extends Error {}
const assert = (cond, msg) => { if (!cond) throw new AssertionError(msg); };

const REQUIRED_PS = ["role", "institution", "field", "whyArea", "whyMine", "prospective"];
const REQUIRED_BUNDLE = ["theme", "activities", "outputs", "outcomes", "evidence", "impact"];
const REQUIRED_MENTOR_GROUP = ["groupName", "philosophy", "environment", "edi", "awards"];

const validatePersona = (p) => {
  const errs = [];
  const expect = (cond, msg) => { if (!cond) errs.push(msg); };

  expect(p.id, "missing id");
  expect(p.name, "missing name");
  expect(p.careerStage, "missing careerStage");
  expect(p.faculty, "missing faculty");
  expect(p.primaryFunder, "missing primaryFunder");
  expect(p.state, "missing state");
  if (!p.state) return errs;

  // Personal Statement
  REQUIRED_PS.forEach((k) => expect(p.state.ps && p.state.ps[k], `ps.${k} empty`));

  // Contributions
  expect(Array.isArray(p.state.contributions), "contributions not an array");
  if (Array.isArray(p.state.contributions)) {
    expect(p.state.contributions.length >= 1, "no contribution bundles");
    expect(p.state.contributions.length <= 10, "more than 10 contribution bundles (prototype caps at 10)");
    p.state.contributions.forEach((c, i) => {
      REQUIRED_BUNDLE.forEach((k) => expect(c[k], `contributions[${i}].${k} empty`));
    });
  }

  // Mentorship
  expect(Array.isArray(p.state.mentorship), "mentorship not an array");
  if (Array.isArray(p.state.mentorship)) {
    p.state.mentorship.forEach((m, i) => {
      REQUIRED_MENTOR_GROUP.forEach((k) => expect(m[k], `mentorship[${i}].${k} empty`));
    });
  }

  // Mentor counts
  expect(p.state.mentorCounts, "missing mentorCounts");
  if (p.state.mentorCounts) {
    ["phd", "masters", "undergrad", "postdoc"].forEach((k) => {
      expect(k in p.state.mentorCounts, `mentorCounts.${k} missing`);
    });
  }

  return errs;
};

// ── Markdown generation ────────────────────────────────────────────────────
const generateMarkdown = (p) => {
  const s = p.state;
  const ps = s.ps;
  const mc = s.mentorCounts || {};

  const lines = [];

  // ── Header ───────────────────────────────────────────────────────────────
  lines.push(`# ${p.name} — Narrative CV Draft`);
  lines.push("");
  lines.push(`*Generated by the NCV prototype persona simulator. Source: \`tests/ncv-personas/personas.json\`*`);
  lines.push("");
  lines.push(`| Field | Value |`);
  lines.push(`|---|---|`);
  lines.push(`| **Career stage** | ${p.careerStage} (${p.yearsPostPhd} yr post-PhD) |`);
  lines.push(`| **Appointment** | ${p.appointment} |`);
  lines.push(`| **Faculty** | ${p.faculty} |`);
  lines.push(`| **Department** | ${p.department} |`);
  lines.push(`| **Primary funder** | ${p.primaryFunder.agency} — ${p.primaryFunder.competition} (${p.primaryFunder.model}) |`);
  if (p.parallelFunder) {
    lines.push(`| **Parallel funder** | ${p.parallelFunder.agency} — ${p.parallelFunder.competition} (${p.parallelFunder.model}) |`);
  }
  lines.push(`| **NCV tool funder selection** | ${FUNDER_LABELS[s.funder] || s.funder} |`);
  lines.push("");

  lines.push(`## Biography`);
  lines.push("");
  lines.push(p.bio);
  lines.push("");

  lines.push(`## Funder model notes`);
  lines.push("");
  lines.push(p.funderNotes);
  lines.push("");

  // ── Personal Statement ───────────────────────────────────────────────────
  lines.push(`## Personal Statement`);
  lines.push("");
  lines.push(`I am a ${ps.role} at ${ps.institution}. My research is in ${ps.field}.`);
  lines.push("");
  lines.push(`**Why this area matters:** ${ps.whyArea}`);
  lines.push("");
  lines.push(`**Why my particular research matters in that area:** ${ps.whyMine}`);
  lines.push("");
  lines.push(`Looking ahead, I am working toward ${ps.prospective}.`);
  lines.push("");

  // ── Most Significant Contributions ───────────────────────────────────────
  lines.push(`## Most Significant Contributions`);
  lines.push("");
  if (s.contributions.length === 0) {
    lines.push(`*(no bundles drafted)*`);
    lines.push("");
  } else {
    lines.push(`*${s.contributions.length} bundle${s.contributions.length === 1 ? "" : "s"} drafted (aim is 3–5; cap is 10).*`);
    lines.push("");
    s.contributions.forEach((c, i) => {
      lines.push(`### Bundle ${i + 1} — ${c.theme}`);
      lines.push("");

      // Per-field with text + auto-rubric + diagnostic status
      const diag = c.diagnostic || {};
      const notes = c.revisionNotes || {};
      const fieldRow = (key) => {
        const a = analyseField(c[key], key);
        const d = diag[key];
        const status = d ? DIAG_LABEL[d] : "— (not reviewed)";
        const rub = `Rubric ${a.rubric}/4 · ${a.wordCount} words (target ${a.range[0]}–${a.range[1]})`;
        lines.push(`**${FIELD_LABELS[key]}** — ${status} · ${rub}`);
        lines.push("");
        lines.push(`> ${c[key].replace(/\n/g, "\n> ")}`);
        lines.push("");
        if (notes[key]) {
          lines.push(`> *Revision note:* ${notes[key]}`);
          lines.push("");
        }
      };
      FIELD_KEYS.forEach(fieldRow);
    });

    // Bundle-level review summary
    const reviewSummary = (() => {
      let approved = 0, flagged = 0, unsure = 0, totalRubric = 0, totalFields = 0;
      s.contributions.forEach((c) => {
        const d = c.diagnostic || {};
        FIELD_KEYS.forEach((k) => {
          totalFields++;
          const status = d[k];
          if (status === "check") approved++;
          else if (status === "cross") flagged++;
          else unsure++;
          totalRubric += analyseField(c[k], k).rubric;
        });
      });
      return { approved, flagged, unsure, totalFields, totalRubric, maxRubric: totalFields * 4 };
    })();
    if (reviewSummary.totalFields > 0) {
      lines.push(`*Round 2 review state:* **${reviewSummary.approved}** approved · **${reviewSummary.flagged}** flagged · **${reviewSummary.unsure}** unsure across ${reviewSummary.totalFields} sections. Total auto-rubric: ${reviewSummary.totalRubric}/${reviewSummary.maxRubric}.`);
      lines.push("");
    }
  }

  // ── Supervisory & Mentorship ─────────────────────────────────────────────
  lines.push(`## Supervisory & Mentorship Activities`);
  lines.push("");
  const countLine = [
    mc.phd && `**PhD:** ${mc.phd}`,
    mc.masters && `**Masters:** ${mc.masters}`,
    mc.undergrad && `**Undergrad/Capstone:** ${mc.undergrad}`,
    mc.postdoc && `**Postdoc:** ${mc.postdoc}`
  ].filter(Boolean).join(" · ");
  if (countLine) {
    lines.push(`**Total mentees (last 5 years):** ${countLine}`);
    lines.push("");
  }

  if (s.mentorship.length === 0) {
    lines.push(`*(no mentorship groups drafted)*`);
    lines.push("");
  } else {
    s.mentorship.forEach((m, i) => {
      lines.push(`### Group ${i + 1} — ${m.groupName}`);
      lines.push("");
      lines.push(`- **Training philosophy:** ${m.philosophy}`);
      lines.push(`- **Training environment:** ${m.environment}`);
      lines.push(`- **EDI practices:** ${m.edi}`);
      lines.push(`- **Awards / career outcomes:** ${m.awards}`);
      lines.push("");
    });
  }

  // ── Revision plan (from Round 2 notes) ───────────────────────────────────
  const revisionLines = [];
  s.contributions.forEach((c, i) => {
    const notes = c.revisionNotes || {};
    const fieldNotes = FIELD_KEYS.map((k) => notes[k] && `**${FIELD_LABELS[k]}:** ${notes[k]}`).filter(Boolean);
    if (fieldNotes.length) {
      revisionLines.push(`### Bundle ${i + 1}${c.theme ? ` — ${c.theme}` : ""}`);
      revisionLines.push("");
      fieldNotes.forEach((n) => { revisionLines.push(`- ${n}`); });
      revisionLines.push("");
    }
  });
  if (revisionLines.length) {
    lines.push(`## Revision plan`);
    lines.push("");
    lines.push("*Notes captured while strengthening contributions in Round 2. Take these into the next consult or working session.*");
    lines.push("");
    revisionLines.forEach((l) => lines.push(l));
  }

  // ── Self-check ───────────────────────────────────────────────────────────
  lines.push(`## Final self-check`);
  lines.push("");
  SELF_CHECK_ITEMS.forEach((item, i) => {
    const checked = !!(s.selfCheck && s.selfCheck[i]);
    lines.push(`- [${checked ? "x" : " "}] ${item}`);
  });
  lines.push("");

  // ── Footer / how to load ─────────────────────────────────────────────────
  lines.push(`---`);
  lines.push("");
  lines.push(`*Load this persona into the live prototype:*`);
  lines.push("");
  lines.push(`\`\`\``);
  lines.push(`http://localhost:8000/narrative-cv-prototype.html?persona=${p.id}`);
  lines.push(`\`\`\``);
  lines.push("");
  lines.push(`*Or on the deployed GH Pages copy:*`);
  lines.push("");
  lines.push(`\`\`\``);
  lines.push(`https://landedimmigrant-ops.github.io/pathways_website/narrative-cv-prototype.html?persona=${p.id}`);
  lines.push(`\`\`\``);
  lines.push("");

  return lines.join("\n");
};

// ── Driver ─────────────────────────────────────────────────────────────────
const main = () => {
  const raw = fs.readFileSync(PERSONAS_PATH, "utf8");
  const { personas } = JSON.parse(raw);

  if (!fs.existsSync(DRAFTS_DIR)) fs.mkdirSync(DRAFTS_DIR, { recursive: true });

  let passed = 0;
  let failed = 0;
  const results = [];

  personas.forEach((p) => {
    const errors = validatePersona(p);
    const status = errors.length === 0 ? "OK" : "FAIL";
    if (errors.length === 0) passed++; else failed++;

    let mdPath = null;
    if (errors.length === 0) {
      const md = generateMarkdown(p);
      mdPath = path.join(DRAFTS_DIR, `${p.id}.md`);
      fs.writeFileSync(mdPath, md, "utf8");
    }

    // Auto-rubric aggregate across bundles
    let totalRubric = 0, maxRubric = 0, approved = 0, flagged = 0, unsure = 0;
    (p.state.contributions || []).forEach((c) => {
      const diag = c.diagnostic || {};
      FIELD_KEYS.forEach((k) => {
        totalRubric += analyseField(c[k], k).rubric;
        maxRubric += 4;
        const s = diag[k];
        if (s === "check") approved++;
        else if (s === "cross") flagged++;
        else unsure++;
      });
    });

    results.push({
      id: p.id,
      name: p.name,
      careerStage: p.careerStage,
      funder: `${p.primaryFunder.agency} (${p.primaryFunder.model})`,
      bundles: p.state.contributions?.length ?? 0,
      mentorGroups: p.state.mentorship?.length ?? 0,
      rubric: maxRubric > 0 ? `${totalRubric}/${maxRubric}` : "—",
      review: maxRubric > 0 ? `${approved}/${flagged}/${unsure}` : "—",
      status,
      errors,
      mdPath
    });
  });

  // ── Console summary ──────────────────────────────────────────────────────
  console.log("\nNCV Prototype — Persona Simulation\n");
  console.log(`Personas: ${personas.length}    Passed: ${passed}    Failed: ${failed}\n`);

  const colW = { id: 14, name: 30, stage: 14, funder: 18, bundles: 8, mentor: 8, rubric: 10, review: 12, status: 6 };
  const pad = (s, n) => String(s ?? "").padEnd(n);
  console.log([
    pad("ID", colW.id), pad("Name", colW.name), pad("Stage", colW.stage),
    pad("Funder", colW.funder), pad("Bundles", colW.bundles),
    pad("Groups", colW.mentor), pad("Rubric", colW.rubric),
    pad("R2 ✓/✗/?", colW.review), pad("Status", colW.status)
  ].join(""));
  console.log("-".repeat(Object.values(colW).reduce((a, b) => a + b, 0)));

  results.forEach((r) => {
    console.log([
      pad(r.id, colW.id), pad(r.name, colW.name), pad(r.careerStage, colW.stage),
      pad(r.funder, colW.funder), pad(r.bundles, colW.bundles),
      pad(r.mentorGroups, colW.mentor), pad(r.rubric, colW.rubric),
      pad(r.review, colW.review), pad(r.status, colW.status)
    ].join(""));
    r.errors.forEach((e) => console.log(`    ⚠ ${e}`));
  });

  console.log("");
  console.log(`Drafts written to: ${path.relative(process.cwd(), DRAFTS_DIR)}/`);
  console.log("");

  if (failed > 0) {
    process.exit(1);
  }
};

main();
