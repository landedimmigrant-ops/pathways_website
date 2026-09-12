#!/usr/bin/env node
/**
 * Narrative CV V5 — worked-example library tools. Reads narrative-cv-prototype-v5.html only.
 *
 *   node scripts/ncv-v5-examples.js lint     # run the tool's own field checks over all 60 cells
 *   node scripts/ncv-v5-examples.js review   # regenerate narrative-cv-v5-examples-review.md
 *
 * The library lives between the EXEMPLAR_LIBRARY:begin/end markers in the prototype; the lint
 * engine is the prototype's own lintField, extracted from the same file so the two cannot drift.
 * No dependencies beyond Node 18.
 */
"use strict";
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const HTML = path.join(ROOT, "narrative-cv-prototype-v5.html");
const REVIEW = path.join(ROOT, "narrative-cv-v5-examples-review.md");
const src = fs.readFileSync(HTML, "utf8");

function slice(startMarker, endMarker) {
  const a = src.indexOf(startMarker), b = src.indexOf(endMarker);
  if (a < 0 || b < 0 || b < a) throw new Error("marker not found: " + startMarker);
  return src.slice(a + startMarker.length, b);
}
const engineSrc = slice("// ── T1 lint engine", "// ── State ───");
const lintField = new Function(engineSrc.replace(/^[^\n]*\n/, "") + "\nreturn lintField;")();
const libSrc = slice("    // EXEMPLAR_LIBRARY:begin\n", "    // EXEMPLAR_LIBRARY:end\n");
const EXEMPLAR_LIBRARY = new Function(libSrc + "\nreturn EXEMPLAR_LIBRARY;")();

const DISC = [["stem", "STEM / engineering"], ["health", "Health / clinical"], ["social", "Social sciences"], ["humanities", "Humanities"], ["creative", "Creative / fine arts"]];
const MODES = ["team", "community", "solo", "industry"];
const STAGES = ["early", "mid", "senior"];
const MODE_LABEL = { team: "Team-based", community: "Community-engaged", solo: "Largely solo", industry: "Industry-partnered" };
const STAGE_LABEL = { early: "Early career", mid: "Mid career", senior: "Senior" };
const BEAT_LABEL = { stakes: "Stakes", role: "Your role", activities: "What you did", outputs: "What resulted", outcomes: "What already changed", impact: "What could change" };
const ORDER = ["stakes", "role", "activities", "outputs", "outcomes", "impact"];
const KIND = { stakes: "stakes", role: "roleLine", activities: "activities", outputs: "outputs", outcomes: "outcomes", impact: "impact" };
const BRITISH = /\b\w+(isation|ising|ised|yse|ysed|ysing)\b|\bprogrammes?\b|\borganis\w*/gi;
const CP_OK = /\b(practise|practised|licence)\b/i;

function cells(fn) {
  for (const [disc] of DISC) for (const mode of MODES) for (const stage of STAGES) {
    const group = EXEMPLAR_LIBRARY[disc] && EXEMPLAR_LIBRARY[disc][mode];
    fn(disc, mode, stage, group, group && group[stage]);
  }
}

function lint() {
  let problems = 0, count = 0;
  cells((disc, mode, stage, group, ex) => {
    const tag = disc + "/" + mode + "/" + stage;
    if (!ex) { console.log("✗ " + tag + " — missing"); problems++; return; }
    count++;
    const issues = [];
    if (ex.segments.map(s => s.r).join() !== ORDER.join()) issues.push("beat order: " + ex.segments.map(s => s.r).join(","));
    const words = ex.segments.reduce((n, s) => n + s.t.trim().split(/\s+/).length, 0);
    if (words < 95 || words > 165) issues.push("total words " + words + " (want 100-160)");
    ex.segments.forEach(s => {
      const res = lintField(s.t, KIND[s.r] || "generic");
      res.flags.forEach(f => issues.push("[" + s.r + "] " + f));
      if (s.r === "role" && !res.strengths.some(x => /role/i.test(x))) issues.push("[role] no “I + verb” ownership marker");
      const brit = (s.t.match(BRITISH) || []).filter(w => !CP_OK.test(w));
      if (brit.length) issues.push("[" + s.r + "] spelling (Canadian Press): " + brit.join(", "));
      if ((s.r === "outputs" || s.r === "outcomes") && !(s.keys && s.keys.length)) issues.push("[" + s.r + "] no evidence keys");
      const ox = s.t.match(/(?:^|[,;:]\s+|\b(?:of|and|with|by|for|from|in|to|into|on)\s+)([^,;]{2,40}),\s+([^,;]{2,40}),\s+(?:and|or)\s+/);
      if (ox && ox[1].split(/\s+/).length <= 5 && ox[2].split(/\s+/).length <= 5) issues.push("[" + s.r + "] Oxford comma? …" + ox[0].slice(-60));
    });
    if (issues.length) { problems += issues.length; console.log("✗ " + tag + " (" + words + "w) — " + (ex.topic || "")); issues.forEach(i => console.log("    " + i)); }
  });
  console.log(count + " cells checked — " + (problems ? problems + " issue(s)" : "all clean"));
  process.exit(problems ? 1 : 0);
}

function review() {
  let md = "";
  md += "# Narrative CV V5 — the worked-example library (review sheet)\n\n";
  md += "**What this is.** Every fictional paragraph the *What a finished contribution reads like* card can show, one per\n";
  md += "discipline × how-your-work-happens × career stage: 5 × 4 × 3 = 60 cells, each a different invented researcher.\n";
  md += "Generated " + new Date().toISOString().slice(0, 10) + " by `node scripts/ncv-v5-examples.js review` from the library in\n";
  md += "`narrative-cv-prototype-v5.html` (between the `EXEMPLAR_LIBRARY:begin/end` markers) — the HTML is the source of truth;\n";
  md += "edit a sentence there, then re-run `lint` and `review`. Built under the beta-run rule: everything below is **INFERRED**\n";
  md += "until Prem confirms or overrides it. Every sentence passes the tool's own checks (ownership, numbers, vague words, hedges,\n";
  md += "prestige terms), so the example never contradicts the check under a field.\n\n";
  md += "**How the card picks a cell.** Discipline from Setup; the work-mode chips on the Contributions step; career stage from\n";
  md += "Setup. With no work mode picked yet the card shows the discipline's usual mode (STEM and health: team-based; social\n";
  md += "sciences, humanities and creative arts: largely solo); with no career stage, mid career. When more than one work mode is\n";
  md += "picked, the cell sharing the most modes wins (some cells carry two tags because that is how the mode occurs in the field,\n";
  md += "e.g. an engineering industry partnership is team work); ties go to the more specific mode, in the order community,\n";
  md += "industry, team, solo.\n\n";
  md += "## Overrides (for Prem)\n\n";
  md += "Write in this table, or edit the sentence in place in the HTML and say so here. Only the cells listed get rebuilt.\n\n";
  md += "| Cell | What to change | Status |\n|---|---|---|\n|  |  |  |\n\n";
  for (const [disc, label] of DISC) {
    md += "## " + label + "\n\n";
    for (const mode of MODES) {
      const group = EXEMPLAR_LIBRARY[disc][mode];
      md += "### " + MODE_LABEL[mode] + " — tags: " + (group.modes || [mode]).map(t => MODE_LABEL[t]).join(" + ") + "\n\n";
      for (const stage of STAGES) {
        const ex = group[stage];
        const words = ex.segments.reduce((n, s) => n + s.t.trim().split(/\s+/).length, 0);
        md += "#### `" + disc + "/" + mode + "/" + stage + "` — " + STAGE_LABEL[stage] + " · " + (ex.topic || "") + " (" + words + " words)\n\n";
        ex.segments.forEach(s => { md += "- **" + BEAT_LABEL[s.r] + "**" + (s.keys && s.keys.length ? " [" + s.keys.join(",") + "]" : "") + " — " + s.t + "\n"; });
        md += "\n";
      }
    }
  }
  fs.writeFileSync(REVIEW, md);
  console.log("wrote " + path.relative(ROOT, REVIEW));
}

const cmd = process.argv[2];
if (cmd === "lint") lint();
else if (cmd === "review") review();
else { console.log("usage: node scripts/ncv-v5-examples.js lint | review"); process.exit(2); }
