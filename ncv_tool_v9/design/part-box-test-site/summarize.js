#!/usr/bin/env node
// Reads results.json (from part-box-test.js) and prints the numbers findings.md quotes, case by case.
//   node ncv_tool_v9/design/part-box-test-site/summarize.js [caseId]
"use strict";
const fs = require("fs"), path = require("path");
const R = JSON.parse(fs.readFileSync(path.join(__dirname, "results.json"), "utf8"));
const only = process.argv[2];
const sides = (b) => ["top", "right", "bottom", "left"].map(s => b[s] ? `${s[0]}:${b[s].w}px ${b[s].color} (${b[s].vsBehind}/${b[s].vsGround})` : `${s[0]}:-`).join("  ");
const fails = (texts) => texts.filter(t => !t.pass).map(t => `${t.el} “${t.text}” ${t.fg} on ${t.bg} ${t.ratio}:1 (needs ${t.need})`);
for (const c of R.cases) {
  if (only && c.id !== only) continue;
  console.log("\n══ " + c.id + " — " + c.screen + (c.forcedVisible ? "  [FORCED VISIBLE]" : ""));
  for (const r of c.runs) {
    console.log(" ── " + r.width + "px" + (r.error ? "  ERROR " + r.error : "") + (r.service ? "  service " + JSON.stringify(r.service) : ""));
    if (r.error) continue;
    const B = r.before, A = r.after;
    console.log("   page h-scroll " + B.hScroll + " → " + A.hScroll + "  (scrollWidth " + B.docScrollWidth + " → " + A.docScrollWidth + ", innerWidth " + B.innerWidth + ")");
    console.log("   axe color-contrast violations " + (B.axe || []).length + " → " + (A.axe || []).length + ((A.axe || []).length ? "  " + JSON.stringify(A.axe.slice(0, 3)) : ""));
    B.items.forEach((b, i) => {
      const a = A.items[i] || {};
      console.log("   • " + b.el + "  " + b.w + "×" + b.h + " → " + a.w + "×" + a.h + "  lines " + b.lines + " → " + a.lines + "  overflowX " + b.overflowX + " → " + a.overflowX + "  ground " + b.ground + " → " + a.ground + "  behind " + b.behind + "  radius " + b.radius + " → " + a.radius + "  pad " + a.padding);
      console.log("     lines before " + sides(b.border));
      console.log("     lines after  " + sides(a.border));
      const fb = fails(b.texts), fa = fails(a.texts);
      if (fb.length) console.log("     text fails before: " + fb.join(" | "));
      if (fa.length) console.log("     text fails after:  " + fa.join(" | "));
      const lo = (a.texts || []).filter(t => !t.graphic).sort((x, y) => x.ratio - y.ratio)[0];
      if (lo) console.log("     lowest text after: " + lo.el + " “" + lo.text + "” " + lo.fg + " on " + lo.bg + " " + lo.ratio + ":1" + "  (before " + ((b.texts || []).find(t => t.el === lo.el && t.text === lo.text) || {}).ratio + ")");
      const n = a.nest || {};
      (n.ancestors || []).forEach(x => console.log("     inside " + x.ancestor + " (depth " + x.depth + ", ground " + x.ground + ", radius " + x.radius + ", lines " + (x.lines ? sides(x.lines) : "none") + ") gap t" + x.gap.top + " r" + x.gap.right + " b" + x.gap.bottom + " l" + x.gap.left));
      (n.children || []).forEach(x => console.log("     contains " + x.child + " lines " + sides(x.lines) + " radius " + x.radius + " gapL " + x.gapLeft + " gapR " + x.gapRight));
      if (n.prev && n.prev.lines) console.log("     prev sibling " + n.prev.el + " lines " + sides(n.prev.lines) + " vgap " + n.prev.vgap);
      if (n.next && n.next.lines) console.log("     next sibling " + n.next.el + " lines " + sides(n.next.lines) + " vgap " + n.next.vgap);
      console.log("     sig after: " + JSON.stringify(a.sig) + "  interactive " + b.interactive);
    });
    if (r.width === 1280) console.log("   refs: " + A.refs.map(x => x.sel + " [" + x.lines + " r" + x.radius + " " + x.ground + " " + x.w + "×" + x.h + "]").join("  ;  "));
    if (r.forcedBefore && r.forcedAfter) {
      r.forcedBefore.items.forEach((b, i) => { const a = r.forcedAfter.items[i] || {}; console.log("   forced: " + b.el + "  before " + sides(b.border) + "  |  after " + sides(a.border || {}) + "  ground " + b.ground + "/" + a.ground); });
    }
    if (r.hoverBefore) console.log("   hover before " + JSON.stringify(r.hoverBefore) + "\n   hover after  " + JSON.stringify(r.hoverAfter));
  }
}
