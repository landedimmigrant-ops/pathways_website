#!/usr/bin/env node
/**
 * build-ncv-standalone.js
 * ------------------------------------------------------------------
 * Produces a single self-contained HTML file of the "What is a
 * Narrative CV?" Learn guide, for content-migration testing with the
 * university web team.
 *
 * It reads the SAME source the live site reads
 * (content/learn/narrative-cv-guide.md), parses it with the SAME slot
 * logic as app.js, and renders the SAME DOM structure as
 * buildNarrativeCV101() — but as static HTML with the relevant CSS
 * inlined, so the file has no dependency on app.js / data.js / the
 * external stylesheet. The only external reference is the Inter web
 * font (with a system-font fallback if it can't load).
 *
 * Usage:  node scripts/build-ncv-standalone.js
 * Output: narrative-cv-guide-standalone.html  (repo root)
 *
 * If a slot referenced by the layout is missing from the markdown the
 * script throws — for a migration test we want missing content to be
 * loud, not silently replaced by a hardcoded fallback.
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "content", "learn", "narrative-cv-guide.md");
const OUT = path.join(ROOT, "narrative-cv-guide-standalone.html");

// ── Slot parsing — ports parseSlotMarkdown() + the regexes from app.js ──
const SLOT_LABEL_RE = /^[\w][\w.\-]*$/;
const HR_LINE_RE = /^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/;

function parseSlotMarkdown(md) {
  const slots = {};
  if (!md) return slots;
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  let label = null;
  let buffer = [];
  const flush = () => {
    if (label) slots[label] = buffer.join("\n").trim();
  };
  for (const line of lines) {
    const m = line.match(/^##\s+(\S.*?)\s*$/);
    if (m && SLOT_LABEL_RE.test(m[1])) {
      flush();
      label = m[1];
      buffer = [];
    } else if (label) {
      if (HR_LINE_RE.test(line)) continue;
      buffer.push(line);
    }
  }
  flush();
  return slots;
}

// ── Slot accessors — port slot/slotPara/slotList/slotRows from app.js ──
// Missing slots throw (migration test wants loud failures, not fallbacks).
function buildBody(slots) {
  const missing = [];
  const get = (name) => {
    const v = slots[name];
    if (v == null || v === "") { missing.push(name); return ""; }
    return v;
  };
  const slot = (name) => get(name);
  const slotPara = (name) => get(name).split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
  const slotList = (name) => get(name).split("\n").map((l) => l.trim()).filter((l) => l.startsWith("- ")).map((l) => l.slice(2).trim());
  const slotRows = (name) => get(name).split("\n").map((l) => l.trim()).filter(Boolean).map((l) => l.split("|").map((c) => c.trim()));

  // ── HTML helpers ──
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const paras = (arr) => arr.map((t) => `<p class="ncv-body">${esc(t)}</p>`).join("");
  const CHEVRON = "▾"; // ▾ — matches the app's chevron glyph

  const makeExpand = (btnText, bodyHtml) =>
    `<div class="ncv-expand-block">` +
      `<button class="ncv-expand-btn" type="button" aria-expanded="false">` +
        `<span>${esc(btnText)}</span><span class="ncv-chevron">${CHEVRON}</span>` +
      `</button>` +
      `<div class="ncv-expand-body">${bodyHtml}</div>` +
    `</div>`;

  const makeSection = (num, title, childrenHtml) =>
    `<div class="ncv-section">` +
      `<div class="ncv-section-header">` +
        `<span class="ncv-section-num">${esc(String(num).padStart(2, "0"))}</span>` +
        `<h3>${esc(title)}</h3>` +
      `</div>${childrenHtml}` +
    `</div>`;

  const makeTable = (headers, rows) => {
    const thead = `<thead><tr>${headers.map((h) => `<th>${esc(h)}</th>`).join("")}</tr></thead>`;
    const tbody = `<tbody>${rows.map((cells) =>
      `<tr>${cells.map((c, i) => `<td${i === 0 ? ' class="ncv-td-label"' : ""}>${esc(c)}</td>`).join("")}</tr>`
    ).join("")}</tbody>`;
    return `<table class="ncv-compare-table">${thead}${tbody}</table>`;
  };

  const makeUl = (items) => `<ul class="ncv-list">${items.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>`;

  const makeCallout = (strong, body, mod) =>
    `<div class="${mod ? `ncv-callout ncv-callout--${mod}` : "ncv-callout"}">` +
      `<strong>${esc(strong)}</strong><span>${esc(body)}</span>` +
    `</div>`;

  const sections = [];

  // ── Module header ──
  const header =
    `<div class="ncv-module-header">` +
      `<span class="ncv-module-kicker">${esc(slot("header.kicker"))}</span>` +
      `<h2>${esc(slot("header.title"))}</h2>` +
      `<p class="ncv-module-lead">${esc(slot("header.lead"))}</p>` +
    `</div>`;

  // ── Section 1: Why narrative CVs exist ──
  const s1card = `<div class="ncv-summary-card"><p>${esc(slot("s1.summary"))}</p></div>`;
  const s1p = `<p class="ncv-body">${esc(slot("s1.lead"))}</p>`;
  const s1callout = makeCallout(slot("s1.callout.strong"), slot("s1.callout.body"));
  let s1expBody = paras(slotPara("s1.expand.p1")) + paras(slotPara("s1.expand.p2")) + paras(slotPara("s1.expand.p3"));
  s1expBody += `<p class="ncv-body">${esc(slot("s1.expand.funders-intro"))}</p>`;
  s1expBody += `<div class="ncv-tag-row">${slotList("s1.expand.funders").map((t) => `<span class="ncv-tag">${esc(t)}</span>`).join("")}</div>`;
  s1expBody += `<p class="ncv-note">${esc(slot("s1.expand.note"))}</p>`;
  sections.push(makeSection(1, slot("s1.title"),
    s1card + s1p + s1callout + makeExpand(slot("s1.expand.title"), s1expBody)));

  // ── Section 2: The three sections ──
  const s2p = `<p class="ncv-body">${esc(slot("s2.intro"))}</p>`;
  const s2cards = `<div class="ncv-section-cards">${slotRows("s2.cards").map((row) => {
    const [num, title, body] = row;
    return `<div class="ncv-section-card">` +
      `<div class="ncv-card-num">${esc(num || "")}</div>` +
      `<h4>${esc(title || "")}</h4>` +
      `<p>${esc(body || "")}</p>` +
    `</div>`;
  }).join("")}</div>`;
  const s2expA = `<p class="ncv-body">${esc(slot("s2.expand-a.intro"))}</p>` + makeUl(slotList("s2.expand-a.list")) + `<p class="ncv-note">${esc(slot("s2.expand-a.note"))}</p>`;
  const s2expB = `<p class="ncv-body">${esc(slot("s2.expand-b.intro"))}</p>` + makeUl(slotList("s2.expand-b.list")) + `<p class="ncv-note">${esc(slot("s2.expand-b.note"))}</p>`;
  sections.push(makeSection(2, slot("s2.title"),
    s2p + s2cards + makeExpand(slot("s2.expand-a.title"), s2expA) + makeExpand(slot("s2.expand-b.title"), s2expB)));

  // ── Section 3: TCV vs CV-FRQ ──
  const s3p = `<p class="ncv-body">${esc(slot("s3.intro"))}</p>`;
  const s3rows = slotRows("s3.table");
  const s3table = makeTable(s3rows[0] || [], s3rows.slice(1));
  sections.push(makeSection(3, slot("s3.title"),
    s3p + s3table + makeCallout(slot("s3.callout.strong"), slot("s3.callout.body"), "blue")));

  // ── Section 4: How it differs from a traditional CV ──
  const s4p = `<p class="ncv-body">${esc(slot("s4.intro"))}</p>`;
  const s4rows = slotRows("s4.table");
  const s4table = makeTable(s4rows[0] || [], s4rows.slice(1));
  const s4expA = paras(slotPara("s4.expand-a.p1")) + paras(slotPara("s4.expand-a.p2")) + paras(slotPara("s4.expand-a.p3"));
  const s4expB = `<p class="ncv-body">${esc(slot("s4.expand-b.intro"))}</p>` + makeUl(slotList("s4.expand-b.list")) + `<p class="ncv-note">${esc(slot("s4.expand-b.note"))}</p>`;
  sections.push(makeSection(4, slot("s4.title"),
    s4p + s4table + makeExpand(slot("s4.expand-a.title"), s4expA) + makeExpand(slot("s4.expand-b.title"), s4expB)));

  // ── Section 5: Common concerns ──
  const s5p = `<p class="ncv-body">${esc(slot("s5.intro"))}</p>`;
  const s5myths = `<div class="ncv-myths">${slotRows("s5.myths").map((row) => {
    const [concern, reality] = row;
    return `<div class="ncv-myth-row">` +
      `<div class="ncv-myth-box ncv-myth-box--concern"><div class="ncv-myth-label">Concern</div><p>${esc(concern || "")}</p></div>` +
      `<div class="ncv-myth-box ncv-myth-box--reality"><div class="ncv-myth-label">Reality</div><p>${esc(reality || "")}</p></div>` +
    `</div>`;
  }).join("")}</div>`;
  const s5exp = paras(slotPara("s5.expand.p1")) + paras(slotPara("s5.expand.p2"));
  sections.push(makeSection(5, slot("s5.title"),
    s5p + s5myths + makeExpand(slot("s5.expand.title"), s5exp)));

  // ── Section 6: What reviewers actually look for ──
  const s6card = `<div class="ncv-summary-card"><p>${esc(slot("s6.summary"))}</p></div>`;
  const s6p = `<p class="ncv-body">${esc(slot("s6.lead"))}</p>`;
  const s6exp1 = makeExpand(slot("s6.exp1.title"), paras(slotPara("s6.exp1.p1")));
  const s6exp2 = makeExpand(slot("s6.exp2.title"), paras(slotPara("s6.exp2.p1")) + paras(slotPara("s6.exp2.p2")));
  const s6exp3 = makeExpand(slot("s6.exp3.title"), paras(slotPara("s6.exp3.p1")) + paras(slotPara("s6.exp3.p2")));
  const s6exp4 = makeExpand(slot("s6.exp4.title"), paras(slotPara("s6.exp4.p1")) + paras(slotPara("s6.exp4.p2")));
  sections.push(makeSection(6, slot("s6.title"), s6card + s6p + s6exp1 + s6exp2 + s6exp3 + s6exp4));

  // ── CTA strip ──
  const cta =
    `<div class="ncv-cta-strip">` +
      `<div class="ncv-cta-text">` +
        `<h3>${esc(slot("cta.title"))}</h3>` +
        `<p>${esc(slot("cta.body"))}</p>` +
      `</div>` +
      `<button class="btn btn-primary" type="button">${esc(slot("cta.btn"))}</button>` +
    `</div>`;

  if (missing.length) {
    throw new Error("Missing slot(s) in narrative-cv-guide.md: " + missing.join(", "));
  }

  return `<div class="ncv-module">${header}${sections.join("")}${cta}</div>`;
}

// ── CSS — curated subset lifted verbatim from styles.css, scoped to what
//    this guide actually uses (base, header, learn-module chrome, .ncv-*,
//    .btn). Kept 1:1 with the live rules so layout matches exactly. ──
const CSS = `
:root{--bg:#ffffff;--burgundy:#912338;--burgundy-dark:#912338;--text:#1a1a1a;--muted:#5a5a5a;--border:#e6e6e6;--link:#912338;}
*{box-sizing:border-box;}
html{scroll-behavior:smooth;}
body{margin:0;background:var(--bg);color:var(--text);font-family:"Inter",system-ui,-apple-system,"Segoe UI",Arial,sans-serif;font-size:18px;line-height:1.6;min-width:350px;}
a{color:var(--link);text-decoration:none;}
a:hover{text-decoration:underline;}
:focus-visible{outline:2px solid #0072a8;outline-offset:2px;}
img{max-width:100%;display:block;}
h1,h2,h3,h4{font-family:"Inter",system-ui,-apple-system,"Segoe UI",Arial,sans-serif;color:var(--burgundy);margin:0 0 0.6rem;font-weight:700;}
p{margin:0 0 1rem;color:var(--text);}
.skip-link{position:absolute;top:-100%;left:16px;background:var(--burgundy);color:#fff;padding:8px 16px;border-radius:0 0 4px 4px;font-size:14px;font-weight:600;z-index:10000;text-decoration:none;}
.skip-link:focus{top:0;}
.container{max-width:940px;margin:0 auto;padding:0 16px;}

/* Header */
.site-header{border-bottom:1px solid var(--border);padding:20px 0;background:var(--bg);}
.header-inner{display:flex;flex-direction:column;align-items:flex-start;gap:8px;}
.brand{font-family:"Inter",system-ui,-apple-system,"Segoe UI",Arial,sans-serif;color:var(--burgundy);font-size:24px;font-weight:700;}
.brand-tagline{font-size:13px;color:var(--muted);font-weight:500;letter-spacing:0.01em;}

/* Learn module page chrome */
.learn-module-page{max-width:760px;margin:0 auto;padding:40px 24px 56px;}
.learn-module-title{font-size:1.75rem;font-weight:700;margin:0.5rem 0 1.5rem;color:var(--text);}

/* Buttons */
.btn{display:inline-flex;align-items:center;justify-content:center;border:1px solid #912338;background:transparent;color:#912338;padding:8px 16px;font-size:14px;font-weight:600;line-height:1.2;font-family:inherit;cursor:pointer;border-radius:2px;text-decoration:none;transition:background-color 0.2s ease,color 0.2s ease,border-color 0.2s ease;}
.btn:hover{background:#ffffff;color:#1a1a1a;border-color:var(--border);text-decoration:none;}
.btn.btn-primary,.btn-primary{background:var(--burgundy);color:#fff;border-color:var(--burgundy);}
.btn.btn-primary:hover,.btn-primary:hover{background:var(--burgundy-dark);color:#fff;}

/* ── Narrative CV module (verbatim from styles.css) ── */
.ncv-module{margin-top:2.5rem;}
.ncv-module-header{margin-bottom:2rem;}
.ncv-module-kicker{display:inline-block;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:var(--burgundy);margin-bottom:8px;}
.ncv-module-header h2{font-size:clamp(22px,3vw,30px);font-weight:700;margin:0 0 10px;}
.ncv-module-lead{font-size:16px;color:var(--muted);max-width:620px;margin:0;}
.ncv-section{margin-bottom:3rem;scroll-margin-top:80px;}
.ncv-section-header{display:flex;align-items:baseline;gap:12px;margin-bottom:18px;}
.ncv-section-num{font-size:11px;font-weight:700;letter-spacing:0.06em;background:#f9ebed;color:var(--burgundy);border-radius:4px;padding:2px 8px;white-space:nowrap;flex-shrink:0;}
.ncv-section-header h3{font-size:18px;font-weight:700;margin:0;}
.ncv-body{font-size:15px;color:var(--text);margin-bottom:12px;line-height:1.65;}
.ncv-summary-card{background:#fff;border:1px solid var(--border);border-radius:8px;padding:20px 24px;margin-bottom:16px;box-shadow:0 1px 4px rgba(0,0,0,0.05);}
.ncv-summary-card p{margin:0;font-size:15px;line-height:1.65;}
.ncv-callout{border-left:3px solid var(--burgundy);background:#f9ebed;padding:14px 18px;border-radius:0 8px 8px 0;margin:18px 0;font-size:15px;line-height:1.6;}
.ncv-callout.ncv-callout--blue{border-left-color:#1a5276;background:#eaf1f8;}
.ncv-callout strong{display:inline;font-weight:700;}
.ncv-section-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:14px;margin:16px 0;}
.ncv-section-card{background:#fff;border:1px solid var(--border);border-radius:8px;padding:18px;box-shadow:0 1px 4px rgba(0,0,0,0.05);}
.ncv-card-num{font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:var(--burgundy);margin-bottom:6px;}
.ncv-section-card h4{font-size:14px;font-weight:700;margin:0 0 6px;line-height:1.3;}
.ncv-section-card p{font-size:13px;color:var(--muted);margin:0;line-height:1.5;}
.ncv-compare-table{width:100%;border-collapse:collapse;font-size:14px;margin:18px 0;background:#fff;border-radius:8px;overflow:hidden;border:1px solid var(--border);box-shadow:0 1px 4px rgba(0,0,0,0.05);}
.ncv-compare-table thead tr{background:#f6f6f6;}
.ncv-compare-table th{padding:11px 14px;text-align:left;font-size:12px;font-weight:700;color:var(--muted);border-bottom:1px solid var(--border);}
.ncv-compare-table td{padding:11px 14px;vertical-align:top;border-bottom:1px solid var(--border);line-height:1.5;font-size:14px;}
.ncv-compare-table tr:last-child td{border-bottom:none;}
.ncv-td-label{font-weight:600;color:var(--muted);width:28%;}
.ncv-expand-block{border:1px solid var(--border);border-radius:8px;margin-bottom:8px;background:#fff;overflow:hidden;}
.ncv-expand-btn{width:100%;display:flex;align-items:center;justify-content:space-between;padding:13px 16px;background:none;border:none;cursor:pointer;text-align:left;font-size:14px;font-weight:600;color:var(--text);gap:10px;font-family:inherit;}
.ncv-expand-btn:hover{background:#fafafa;}
.ncv-chevron{font-size:13px;color:var(--muted);transition:transform 0.2s;flex-shrink:0;}
.ncv-expand-btn[aria-expanded="true"] .ncv-chevron{transform:rotate(180deg);}
.ncv-expand-body{display:none;padding:14px 16px 16px;font-size:14px;color:var(--text);border-top:1px solid var(--border);line-height:1.6;}
.ncv-expand-body.is-open{display:block;}
.ncv-expand-body .ncv-body{font-size:14px;margin-bottom:10px;}
.ncv-expand-body .ncv-list{padding-left:20px;margin:8px 0 12px;}
.ncv-expand-body .ncv-list li{margin-bottom:5px;font-size:14px;}
.ncv-myths{margin:14px 0;}
.ncv-myth-row{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;}
.ncv-myth-box{padding:14px 16px;border-radius:8px;font-size:14px;line-height:1.55;}
.ncv-myth-box p{margin:0;font-size:14px;}
.ncv-myth-box--concern{background:#fdf3f3;border:1px solid #f5c6c6;}
.ncv-myth-box--reality{background:#f9ebed;border:1px solid #e8b4bb;}
.ncv-myth-label{font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:6px;}
.ncv-myth-box--concern .ncv-myth-label{color:#c0392b;}
.ncv-myth-box--reality .ncv-myth-label{color:var(--burgundy);}
.ncv-tag-row{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0;}
.ncv-tag{background:#f4f4f4;border:1px solid var(--border);border-radius:20px;padding:3px 12px;font-size:12px;font-weight:500;color:var(--muted);}
.ncv-note{font-size:13px;color:var(--muted);font-style:italic;margin-top:8px;}
.ncv-cta-strip{background:var(--burgundy);color:#fff;border-radius:10px;padding:28px 32px;display:flex;align-items:center;justify-content:space-between;gap:24px;margin-top:3rem;flex-wrap:wrap;}
.ncv-cta-text h3{font-size:18px;font-weight:700;margin:0 0 4px;color:#fff;}
.ncv-cta-text p{font-size:14px;opacity:0.88;margin:0;color:#fff;}
.ncv-cta-strip .btn.btn-primary{background:#fff;color:var(--burgundy);border-color:#fff;white-space:nowrap;flex-shrink:0;}
.ncv-cta-strip .btn.btn-primary:hover{background:#f5e8eb;border-color:#f5e8eb;}

/* Footer */
.site-footer{border-top:1px solid var(--border);margin-top:48px;padding:28px 0;}
.site-footer .container{font-size:13px;color:var(--muted);}
.site-footer a{color:var(--burgundy);text-decoration:underline;}

@media (max-width:620px){
.ncv-myth-row{grid-template-columns:1fr;}
.ncv-section-cards{grid-template-columns:1fr;}
.ncv-cta-strip{flex-direction:column;align-items:flex-start;}
.ncv-compare-table{font-size:13px;}
.ncv-compare-table th,.ncv-compare-table td{padding:9px 10px;}
}
`.trim();

// Minimal accordion toggle — mirrors the click handler in app.js
// (toggles aria-expanded on the button + .is-open on the body).
const JS = `
(function(){
  document.querySelectorAll('.ncv-expand-btn').forEach(function(btn){
    btn.addEventListener('click', function(){
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      var body = btn.parentElement.querySelector('.ncv-expand-body');
      if (body) body.classList.toggle('is-open', !open);
    });
  });
})();
`.trim();

function buildPage(bodyHtml) {
  const title = "What is a Narrative CV?";
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title} — Pathways to Impact</title>
<meta name="description" content="A short orientation on the Narrative CV before you begin drafting — part of the Pathways to Impact Learn resources, Office of Research, Concordia University." />
<!--
  STANDALONE CONTENT-MIGRATION SAMPLE
  Source of truth: content/learn/narrative-cv-guide.md (slot-labelled markdown)
  Generated by:    scripts/build-ncv-standalone.js
  This file is self-contained (CSS inlined, no app.js/data.js dependency).
  The only external reference is the Inter web font, with a system fallback.
-->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
<style>
${CSS}
</style>
</head>
<body>
<a href="#main" class="skip-link">Skip to main content</a>
<header class="site-header">
  <div class="container header-inner">
    <div class="brand">Pathways to Impact</div>
    <div class="brand-tagline">Concordia University &middot; Office of Research</div>
  </div>
</header>
<main id="main" class="learn-module-page">
  <h1 class="learn-module-title">${title}</h1>
${bodyHtml}
</main>
<footer class="site-footer">
  <div class="container">
    Pathways to Impact &middot; Office of Research, Concordia University &middot;
    <a href="mailto:impact@concordia.ca">impact@concordia.ca</a>
  </div>
</footer>
<script>
${JS}
</script>
</body>
</html>
`;
}

function main() {
  const md = fs.readFileSync(SRC, "utf8");
  const slots = parseSlotMarkdown(md);
  const body = buildBody(slots);
  const html = buildPage(body);
  fs.writeFileSync(OUT, html, "utf8");
  console.log(`Wrote ${path.relative(ROOT, OUT)} (${html.length.toLocaleString()} bytes) from ${Object.keys(slots).length} slots.`);
}

main();
