#!/usr/bin/env node
/**
 * Part-box test on the Pathways prototype site (index.html + app.js + data.js + styles.css). READ-ONLY on
 * the site: the part box is injected as a <style> in the running page, never written to styles.css.
 *   node ncv_tool_v9/design/part-box-test-site/part-box-test.js
 *     → ncv_tool_v9/design/part-box-test-site/results.json and shots/*.png
 * For each element that carries a coloured side-stripe today: reach a screen where it renders, at 1280 px
 * and at 320 px (mobile emulation), screenshot it, measure it, inject the part box
 *   background: <tint>; border: 1px solid <line>; border-radius: 2px; color: #1a1a1a; (no stripe)
 * and screenshot and measure again. Measured: text contrast (and axe-core color-contrast), line contrast
 * against the page behind and the element's own ground, size / wrapping / overflow / page scroll,
 * bordered ancestors and descendants (box inside a box), the shape beside the site's controls, and the
 * same element under forced colours (Emulation.setEmulatedMedia forced-colors: active, 1280 px only).
 * Headless Chrome over the DevTools protocol on port 9380 (PB_CDP_PORT), own temp profile, own http server.
 * Two screens are reached only by forcing hidden markup visible (.context-bar, .recommended-section):
 * nothing in app.js calls setContextStage, so the UI never shows them. Those cases say FORCED.
 */
"use strict";
const fs = require("fs"), os = require("os"), path = require("path"), http = require("http"), { spawn } = require("child_process");
const OUT = __dirname, SHOTS = path.join(OUT, "shots");
const ROOT = path.resolve(__dirname, "../../..");
const CHROME = process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const AXE = [process.env.AXE, path.join(os.homedir(), "Documents/ubc_fire/node_modules/axe-core/axe.min.js")].find(p => p && fs.existsSync(p));
const AXE_SRC = AXE ? fs.readFileSync(AXE, "utf8") : "";
const CDP_PORT = +process.env.PB_CDP_PORT || 9380, PROFILE = fs.mkdtempSync(path.join(os.tmpdir(), "pb-site-"));
const ONLY = process.env.PB_ONLY ? process.env.PB_ONLY.split(",") : null;
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".md": "text/plain", ".png": "image/png", ".svg": "image/svg+xml", ".jpg": "image/jpeg" };
fs.mkdirSync(SHOTS, { recursive: true });
let server, port, chrome, ws, nextId = 1;
const pending = new Map();
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const send = (method, params) => new Promise((resolve, reject) => { const id = nextId++; pending.set(id, { resolve, reject }); ws.send(JSON.stringify({ id, method, params: params || {} })); });
async function js(expr) {
  const r = await send("Runtime.evaluate", { expression: "(async()=>{" + expr + "})()", awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error((r.exceptionDetails.exception && r.exceptionDetails.exception.description) || r.exceptionDetails.text);
  return r.result.value;
}
async function waitFor(cond, ms) {
  const t0 = Date.now();
  while (Date.now() - t0 < (ms || 20000)) { try { if (await js("return !!(" + cond + ")")) return true; } catch (_) {} await sleep(250); }
  return false;
}

// ── Colours ───────────────────────────────────────────────────────────────────
const hexRgb = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const TINT = 0.15; // 15 % of the colour over white (brief: about 12–18 %)
const tint = (h) => "#" + hexRgb(h).map(v => Math.round(v * TINT + 255 * (1 - TINT)).toString(16).padStart(2, "0")).join("");
const GOLD = ["#e5a712", "#d4a843"], GOLD_LINE = "#8a6200";
const line = (h) => GOLD.includes(h.toLowerCase()) ? GOLD_LINE : h;
// The part box; `ground` = keep the element's own tint, or a pale tint of the stripe colour where it is white.
const partBox = (sel, stripe, ground) => `${sel}{background:${ground || tint(stripe)} !important;border:1px solid ${line(stripe)} !important;border-radius:2px !important;color:#1a1a1a !important;}`;

const PATH_SITE = { academic: "#912338", community: "#db0272", innovation: "#da3a16", commercialization: "#573996", communications: "#b07d00", policy: "#0072a8", "research-creation": "#508212" };
const PW_INLINE = { "academic-scholarship": "#912338", "community-engagement": "#db0272", innovation: "#da3a16", commercialization: "#573996", policy: "#0072a8", communications: "#b07d00", "research-creation": "#508212" };

// ── Screens ───────────────────────────────────────────────────────────────────
// prep: JS run in the page after load. sel: the instances measured. clip: the region screenshotted.
const H = `const w=(ms)=>new Promise(r=>setTimeout(r,ms)); const q=(s)=>document.querySelector(s), qa=(s)=>[...document.querySelectorAll(s)];
  const vis=(e)=>e&&e.getBoundingClientRect().width>0; const until=async(f,ms)=>{const t=Date.now(); while(Date.now()-t<(ms||15000)){ try{ if(f()) return true; }catch(_){} await w(200);} throw new Error('timeout: '+f); };
  window.open=()=>null;`;
const carousel = (n) => H + `await until(()=>qa('.dot').length===7); const p=q('.carousel-pause'); if(p && !/Play|Resume/i.test(p.getAttribute('aria-label')||'')) p.click(); q('.dot[aria-label="Slide ${n}"]').click(); await w(900);`;
const openService = (pick, book, extra) => H + `await until(()=>window.PATHWAYS_DATA.explore.opportunities.length>0, 20000);
  const all=[...PATHWAYS_DATA.explore.opportunities, ...(PATHWAYS_DATA.explore.externalResources||[])];
  const opp=all.find(${pick}); if(!opp) throw new Error('no matching service');
  ${extra || ""}
  location.hash='#explore?service='+encodeURIComponent(opp.id)${book ? "+'&book=1'" : ""}; await w(1200);
  window.__pbOpp={id:opp.id,title:opp.title};`;
const narrative = (state) => ({ seed: { "pathways-narrative-cv-v1": JSON.stringify(state) } });
const MOCK_PS = { role: "Associate Professor", institution: "an invented university", focus: "urban water systems", emphasis: "community-partnered methods", retrospective: "built a monitoring network with three municipalities", prospective: "extend it to rural partners" };

// Services on the live site are workshops and external resources; workshops live in a closure, so a service
// with the wanted block is found by opening the browse cards in turn (pages 1, 2, …) until it renders.
const PROBE = (target, check) => H + `const ok=async()=>{ ${check || 'return !!q(' + JSON.stringify(target) + ');'} };location.hash='#explore?tab=browse'; await w(900); await until(()=>qa('.opportunity-grid .opportunity-card .btn.primary').some(vis), 20000);
  const cards=()=>qa('.opportunity-grid:not(.recommended-grid) .opportunity-card .btn.primary').filter(vis); let found=false;
  for (let page=0; page<12 && !found; page++) {
    const n=cards().length;
    for (let i=0;i<n;i++){ const b=cards()[i]; if(!b || /Start/.test(b.textContent)) continue; const t=(b.closest('.opportunity-card').querySelector('h3')||{}).textContent; b.click(); await w(900);
      if (await ok()) { found=true; window.__pbOpp={title:t, hash:location.hash}; break; } history.back(); await w(700); }
    if (found) break;
    const next=qa('.pagination-btn').find(x=>/next/i.test(x.getAttribute('aria-label')||'') && !x.classList.contains('is-disabled') && vis(x)); if(!next) break; next.click(); await w(700);
  }
  if(!found) throw new Error('no service renders ${target}');
  window.__pbOpp.hash=location.hash;`;
// The live workshops sheet (26 Nov 2026) has no status column and every approved row has a bookingUrl, so the
// in-page booking window never opens (every CTA hands off to MS Bookings / Calendly / a form). To reach it, the
// sheet CSV is rewritten in the page, in memory only: mode "full" marks the first approved row status "full"
// (waitlist banner); mode "nobook" blanks its bookingUrl (plain booking window). Nothing is written anywhere.
const PRELOAD = (mode) => `(() => { const MODE = '${mode}'; const of = window.fetch;
  const parse = (text) => { const rows = []; let row = [], cell = '', q = false; for (let i = 0; i < text.length; i++) { const ch = text[i];
    if (q) { if (ch === '"') { if (text[i+1] === '"') { cell += '"'; i++; } else q = false; } else cell += ch; }
    else if (ch === '"') q = true; else if (ch === ',') { row.push(cell); cell = ''; } else if (ch === '\\n') { row.push(cell); rows.push(row); row = []; cell = ''; } else if (ch !== '\\r') cell += ch; }
    if (cell.length || row.length) { row.push(cell); rows.push(row); } return rows; };
  window.fetch = async function (u, o) { const r = await of.apply(this, arguments); const url = String(u && u.url || u);
    if (!/gviz/.test(url) || !/sheet=workshops/.test(url)) return r;
    const rows = parse(await r.text()), h = rows[0]; let si = h.indexOf('status'); if (si < 0) { h.push('status'); si = h.length - 1; }
    const vi = h.indexOf('version'), bi = h.indexOf('bookingUrl'), ii = h.indexOf('id');
    const row = rows.slice(1).find(x => (vi < 0 || (x[vi]||'').trim().toLowerCase() === 'approved') && (x[ii]||'').trim() && /Consultation/i.test(x[h.indexOf('format')]||''));
    if (row) { while (row.length <= si) row.push(''); if (MODE === 'full') row[si] = 'full'; else row[bi] = ''; window.__pbFull = row[ii]; }
    const csv = rows.map(x => x.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\\n');
    return new Response(csv, { status: 200, headers: { 'Content-Type': 'text/csv' } }); }; })();`;

// The native narrative builder (buildNarrativeModule) is not mounted: pages.set("tools-narrative") uses the V4
// iframe (app.js 6746–6748). Its three striped notes are rebuilt here with the builder's own classes inside the
// live page shell, so the site stylesheet lays them out at the real column width. Text is copied from app.js.
const SYNTH = (inner) => H + `await until(()=>q('.page-narrative')); const sec=q('.page-narrative'); sec.innerHTML='';
  const c=document.createElement('div'); c.className='container'; c.innerHTML='<div class="narrative-module-shell"><aside class="narrative-progress-panel"><h2>Build Your Narrative CV</h2><ul class="narrative-stage-list"><li class="narrative-stage-item"><span class="narrative-stage-dot"></span><span>1. Orientation</span></li><li class="narrative-stage-item"><span class="narrative-stage-dot"></span><span>2. Contributions</span></li></ul></aside><div class="narrative-stage-content"><div>' + ${JSON.stringify(inner.replace(/\n\s*/g, " "))} + '</div></div></div>';
  sec.appendChild(c); scrollTo(0,0); await w(300);`;

const CASES = [
  { id: "pathway-card", screen: "Explore › Pathways grid", route: "#explore", sel: ".explore-pathway-grid .pathway-card", clip: ".explore-pathway-grid", interactive: true,
    css: Object.entries(PATH_SITE).map(([k, c]) => partBox(`.pathway-card[data-pathway="${k}"]:not(:hover)`, c) + `.pathway-card[data-pathway="${k}"]{border:1px solid ${line(c)} !important;border-radius:2px !important;}`).join("\n"),
    hover: '.explore-pathway-grid .pathway-card[data-pathway="community"]' },
  { id: "pw", screen: "Home, slide 4 “Seven pathways”", route: "#home", prep: carousel(4), sel: ".c-pw-grid .pw", clip: ".c-pw-grid", interactive: true,
    css: Object.entries(PW_INLINE).map(([k, c]) => partBox(`.pw[data-pathway="${k}"]`, c)).join("\n"), hover: '.pw[data-pathway="innovation"]' },
  { id: "ncv-expand-block", screen: "Pathways Vision accordions (one opened)", route: "#pathways-vision",
    prep: H + `await until(()=>qa('.ncv-expand-block[data-pathway]').length>0); const b=qa('.ncv-expand-block[data-pathway="community"] .ncv-expand-btn')[0]||qa('.ncv-expand-block[data-pathway] .ncv-expand-btn')[1]; b.click(); await w(300);`,
    sel: ".ncv-expand-block[data-pathway]", clip: "union", interactive: true,
    css: Object.entries(PATH_SITE).map(([k, c]) => partBox(`.ncv-expand-block[data-pathway="${k}"]`, c)).join("\n") },
  { id: "pathway-dev-notice", screen: "Explore › Research Creation (in development)", route: "#explore?pathway=research-creation", sel: ".pathway-dev-notice", clip: "self", margin: 32,
    css: partBox(".pathway-dev-notice", "#508212", "#faf9f6") },
  { id: "research-module-context", screen: "Explore › Research › Developing an Idea, topic chip on", route: "#explore?tab=research&journey=developing-project",
    prep: H + `await until(()=>qa('.research-module-chip').some(vis)); qa('.research-module-chip').find(vis).click(); await w(500);`, sel: ".research-module-context", clip: "self", margin: 40,
    css: partBox(".research-module-context", "#912338", "#faf6f7") },
  { id: "modal-provider", screen: "Service window (provider block)", route: "#explore", prep: PROBE(".modal-overlay .modal-provider"), sel: ".modal-overlay .modal-provider", clip: "self", margin: 40,
    css: partBox(".modal-provider", "#912338", "#f7f3f4") },
  { id: "modal-pullquote", screen: "Service window, workshop with a pull-quote", route: "#explore", prep: PROBE(".modal-overlay .modal-pullquote"), sel: ".modal-overlay .modal-pullquote", clip: "self", margin: 40,
    css: partBox(".modal-pullquote", "#c8102e", "#f8f8f8") },
  { id: "modal-external-note", screen: "Service window, external resource", route: "#explore", prep: PROBE(".modal-overlay .modal-external-note"), sel: ".modal-overlay .modal-external-note", clip: "self", margin: 40,
    css: partBox(".modal-external-note", "#d4a843", "#fef9f0") },
  { id: "booking-notice", screen: "Booking window (request a service)", route: "#explore", preload: PRELOAD("nobook"),
    prep: H + `await until(()=>window.__pbFull, 20000); await w(500); location.hash='#explore?service='+encodeURIComponent(window.__pbFull)+'&book=1'; await w(1200); window.__pbOpp={id:window.__pbFull, note:'bookingUrl blanked in memory'};`, sel: ".booking-notice", clip: "self", margin: 40,
    css: partBox(".booking-notice", "#d4a843", "#fef9f0") },
  { id: "booking-waitlist-banner", screen: "Booking window, waitlist mode (one row's status set to full in memory)", route: "#explore", preload: PRELOAD("full"),
    prep: H + `await until(()=>window.__pbFull, 20000); location.hash='#explore?service='+encodeURIComponent(window.__pbFull)+'&book=1'; await w(1200); window.__pbOpp={id:window.__pbFull, note:'status set to full in memory'};`,
    sel: ".booking-waitlist-banner", clip: ".booking-modal", clipTop: ".booking-notice", clipBottom: ".booking-subtitle", margin: 24,
    css: partBox(".booking-waitlist-banner", "#c44b3d", "#fdecea") + partBox(".booking-notice", "#d4a843", "#fef9f0") },
  { id: "recommended-section", screen: "Explore › All resources, “Recommended for” (FORCED visible)", route: "#explore?tab=browse", forced: true,
    prep: H + `await until(()=>qa('.opportunity-grid .opportunity-card').filter(vis).length>=3, 20000); const s=q('.recommended-section'); s.hidden=false; q('.recommended-label').textContent='Recommended for: Developing an Idea';
      const g=q('.recommended-grid'); qa('.opportunity-grid:not(.recommended-grid) .opportunity-card').filter(vis).slice(0,3).forEach(c=>{const k=c.cloneNode(true); k.classList.add('rec-card'); g.appendChild(k);}); await w(300);`,
    sel: ".recommended-section", clip: "self", margin: 32, css: partBox(".recommended-section", "#912338", "#f9f3f4") },
  { id: "ncv-callout", screen: "Learn › What is a Narrative CV? (burgundy and blue callouts)", route: "#learn-module-ncv", sel: "#learn-module-ncv .ncv-callout", clip: "each", margin: 24,
    css: partBox(".ncv-callout:not(.ncv-callout--blue)", "#912338", "#f9ebed") + partBox(".ncv-callout.ncv-callout--blue", "#1a5276", "#eaf1f8") },
  { id: "narrative-funder-note", screen: "Narrative CV tool V4 (the page #tools-narrative embeds), Personal statement step: lens bar + “Why last?” note", page: "narrative-cv-prototype-v4.html", route: "",
    seed: { "ncv-v4": JSON.stringify({ mode: "build", stageKey: "ps", lens: { agency: "sshrc", format: "tcv", program: "", discipline: "social", careerStage: "early", workMode: ["community"] } }) },
    prep: H + `await until(()=>qa('.narrative-funder-note').some(vis)); scrollTo(0,0); await w(300);`,
    sel: ".narrative-funder-note", clip: "union", clipTop: ".narrative-session-banner", margin: 16, css: partBox(".narrative-funder-note", "#912338", "#f5f5f5") },
  { id: "pro-tip-banner", screen: "Native builder, step 2 round 2 (SYNTHETIC: buildNarrativeModule is not mounted; markup rebuilt from app.js 3700–3790)", route: "#tools-narrative", synthetic: true,
    prep: SYNTH(`<div class="narrative-stage-header"><h2>2. Most Significant Contributions</h2></div><div class="narrative-round-badge is-round2">Round 2: Strengthen Your Contributions</div>
      <div class="contribution-card"><div class="contribution-card-header">Contribution 1: Led an invented three-city water monitoring study.</div></div>
      <div class="pro-tip-banner">Research shows reviewers score higher when they see ownership, affirmative language, and clarity. Use \u201cI\u201d rather than \u201cwe.\u201d Avoid passive voice, negation, and hedging words such as \u201ccould,\u201d \u201cshould,\u201d or \u201cwould.\u201d</div>
      <div class="narrative-nav"><button class="btn" type="button">\u2190 Back</button><button class="btn btn-primary" type="button">Continue to Mentorship \u2192</button></div>`),
    sel: ".page-narrative .pro-tip-banner", clip: "self", margin: 32, css: partBox(".pro-tip-banner", "#e5a712", "#fef9e7") },
  { id: "ps-preview", screen: "Native builder, step 4 Personal statement: preview + funder note (SYNTHETIC: buildNarrativeModule is not mounted; markup rebuilt from app.js 3900–3995)", route: "#tools-narrative", synthetic: true,
    prep: SYNTH(`<div class="narrative-stage-header"><h2>4. Personal Statement</h2></div><div class="ps-scaffold">
      <div class="ps-sentence"><span class="ps-literal">I am a</span><input class="ps-input" aria-label="role" value="Associate Professor"><span class="ps-literal">at</span><input class="ps-input ps-input--wide" aria-label="institution" value="an invented university"><span class="ps-literal">.</span></div>
      <div class="ps-sentence"><span class="ps-literal">Looking ahead, I am working toward</span><input class="ps-input ps-input--wide" aria-label="prospective" value="extending it to rural partners"><span class="ps-literal">.</span></div></div>
      <div class="ps-preview"><div class="ps-preview-label">Preview</div><p class="ps-preview-text">I am a Associate Professor at an invented university. My research focuses on urban water systems, with particular attention to community-partnered methods. Over the course of my research journey, I have built a monitoring network with three municipalities. Looking ahead, I am working toward extending it to rural partners.</p></div>
      <div class="narrative-funder-note">For the TCV, your personal statement should emphasize your fit for this specific opportunity \u2014 your expertise relative to the proposed project. Must be self-contained (no hyperlinks except audio/visual creations).</div>
      <details class="narrative-tip"><summary>See a personal statement example</summary></details>`),
    sel: ".page-narrative .ps-preview, .page-narrative .narrative-funder-note", clip: "union", clipTop: ".ps-scaffold", margin: 16,
    css: partBox(".ps-preview", "#912338", "#f8f6f8") + partBox(".narrative-funder-note", "#912338", "#f5f5f5") },
  { id: "context-bar", screen: "Context bar under the header (FORCED visible)", route: "#explore", forced: true,
    prep: H + `await until(()=>q('.context-bar')); const b=q('.context-bar'); b.hidden=false; q('.context-bar-stage').textContent='Developing an Idea'; scrollTo(0,0); await w(200);`,
    sel: ".context-bar", clip: "self", clipTop: "#site-header", margin: 0, noScroll: true, css: partBox(".context-bar", "#912338", "#f9f3f4") },
  { id: "s2-traits", screen: "Home, slide 2 “Impact can be…”", route: "#home", prep: carousel(2), sel: ".s2-traits", clip: ".s2", margin: 0,
    css: partBox(".s2-traits", "#912338") },
];

// ── In-page measurement library ───────────────────────────────────────────────
const LIB = `window.__pb = (() => {
  const parse = (s) => { if (!s) return null; const m = s.match(/rgba?\\(([^)]+)\\)/); if (!m) return null; const p = m[1].split(/[\\s,\\/]+/).filter(Boolean).map(Number); return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1]; };
  const over = (fg, bg) => { const a = fg[3]; return [fg[0]*a + bg[0]*(1-a), fg[1]*a + bg[1]*(1-a), fg[2]*a + bg[2]*(1-a), 1]; };
  const lin = (c) => { c /= 255; return c <= 0.03928 ? c/12.92 : Math.pow((c + 0.055)/1.055, 2.4); };
  const Lm = (c) => 0.2126*lin(c[0]) + 0.7152*lin(c[1]) + 0.0722*lin(c[2]);
  const ratio = (a, b) => { const x = Lm(a), y = Lm(b); return +((Math.max(x, y) + 0.05)/(Math.min(x, y) + 0.05)).toFixed(2); };
  const hex = (c) => c ? '#' + c.slice(0, 3).map(v => Math.round(v).toString(16).padStart(2, '0')).join('') : null;
  const desc = (e) => !e ? 'none' : e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (typeof e.className === 'string' && e.className.trim() ? '.' + e.className.trim().split(/\\s+/).slice(0, 3).join('.') : '') + (e.dataset && e.dataset.pathway ? '[' + e.dataset.pathway + ']' : '');
  const effBg = (el) => { const chain = []; for (let n = el; n && n.nodeType === 1; n = n.parentElement) chain.push(n); let bg = [255,255,255,1]; for (let i = chain.length - 1; i >= 0; i--) { const c = parse(getComputedStyle(chain[i]).backgroundColor); if (c && c[3] > 0) bg = over(c, bg); } return bg; };
  const vis = (e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  const SIDES = ['top', 'right', 'bottom', 'left'];
  const lines = (e) => { const cs = getComputedStyle(e), ground = effBg(e), behind = effBg(e.parentElement), o = {};
    SIDES.forEach(s => { const w = parseFloat(cs.getPropertyValue('border-' + s + '-width')) || 0, st = cs.getPropertyValue('border-' + s + '-style'), c = parse(cs.getPropertyValue('border-' + s + '-color'));
      const on = w > 0 && st !== 'none' && st !== 'hidden' && c && c[3] > 0; const col = on ? over(c, ground) : null;
      o[s] = on ? { w, color: hex(col), vsBehind: ratio(col, behind), vsGround: ratio(col, ground) } : null; });
    return o; };
  const lineCount = (e) => { let n = 0; const tw = document.createTreeWalker(e, NodeFilter.SHOW_TEXT); let t; while ((t = tw.nextNode())) { if (!t.nodeValue.trim() || !t.parentElement || !vis(t.parentElement)) continue; const r = document.createRange(); r.selectNodeContents(t); const tops = new Set([...r.getClientRects()].filter(x => x.width > 0).map(x => Math.round(x.top))); n += tops.size; } return n; };
  const texts = (root) => { const out = [], seen = new Set(); const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let t;
    while ((t = tw.nextNode())) { if (!t.nodeValue.trim()) continue; const e = t.parentElement; if (!e || seen.has(e) || !vis(e)) continue; seen.add(e);
      const cs = getComputedStyle(e); if (cs.visibility === 'hidden') continue; const bg = effBg(e); let op = 1; for (let n = e; n && n !== document.documentElement; n = n.parentElement) op *= parseFloat(getComputedStyle(n).opacity);
      const c = parse(cs.color) || [0,0,0,1]; const fg = over([c[0], c[1], c[2], c[3]*op], bg); const fs = parseFloat(cs.fontSize), fw = parseInt(cs.fontWeight) || 400;
      const large = fs >= 24 || (fs >= 18.66 && fw >= 700), need = large ? 3 : 4.5, r = ratio(fg, bg);
      out.push({ el: desc(e), text: t.nodeValue.trim().replace(/\\s+/g, ' ').slice(0, 36), fg: hex(fg), bg: hex(bg), fs, fw, need, ratio: r, pass: r >= need }); }
    root.querySelectorAll('svg *').forEach(g => { const cs = getComputedStyle(g); if (!vis(g)) return; const bg = effBg(g.closest('svg').parentElement); ['stroke', 'fill'].forEach(k => { const c = parse(cs[k]); if (c && c[3] > 0) out.push({ el: 'svg ' + g.tagName + ' ' + k, text: '(icon)', fg: hex(over(c, bg)), bg: hex(bg), need: 3, ratio: ratio(over(c, bg), bg), pass: ratio(over(c, bg), bg) >= 3, graphic: true }); }); });
    const uniq = new Map(); out.forEach(x => { const k = x.el + x.fg + x.bg; if (!uniq.has(k)) uniq.set(k, x); }); return [...uniq.values()]; };
  const drawsBox = (a) => { const l = lines(a); return SIDES.some(s => l[s]) ? l : null; };
  const nest = (e) => { const r = e.getBoundingClientRect(), out = [];
    for (let a = e.parentElement, d = 1; a && a !== document.body && d <= 8; a = a.parentElement, d++) { const l = drawsBox(a), bgA = effBg(a), bgP = effBg(a.parentElement); const panel = hex(bgA) !== hex(bgP);
      if (!l && !panel) continue; const ar = a.getBoundingClientRect(), cs = getComputedStyle(a);
      out.push({ ancestor: desc(a), depth: d, lines: l, ground: hex(bgA), panel, radius: cs.borderTopLeftRadius,
        gap: { top: Math.round(r.top - ar.top - parseFloat(cs.borderTopWidth)), right: Math.round(ar.right - parseFloat(cs.borderRightWidth) - r.right), bottom: Math.round(ar.bottom - parseFloat(cs.borderBottomWidth) - r.bottom), left: Math.round(r.left - ar.left - parseFloat(cs.borderLeftWidth)) } });
      if (out.length >= 2) break; }
    const kids = [...e.querySelectorAll('*')].filter(k => vis(k) && drawsBox(k)).slice(0, 4).map(k => { const kr = k.getBoundingClientRect(), cs = getComputedStyle(e); return { child: desc(k), lines: drawsBox(k), radius: getComputedStyle(k).borderTopLeftRadius, gapLeft: Math.round(kr.left - r.left - parseFloat(cs.borderLeftWidth)), gapRight: Math.round(r.right - parseFloat(cs.borderRightWidth) - kr.right) }; });
    const sib = (s) => { if (!s || !vis(s)) return null; const sr = s.getBoundingClientRect(); return { el: desc(s), lines: drawsBox(s), ground: hex(effBg(s)), vgap: Math.round(sr.top >= r.bottom ? sr.top - r.bottom : r.top - sr.bottom) }; };
    return { ancestors: out, children: kids, prev: sib(e.previousElementSibling), next: sib(e.nextElementSibling) }; };
  const sig = (e) => { const cs = getComputedStyle(e), r = e.getBoundingClientRect(), l = lines(e);
    return { el: desc(e), lines: SIDES.map(s => l[s] ? l[s].w + 'px ' + l[s].color : '-').join(' '), radius: cs.borderTopLeftRadius + '/' + cs.borderTopRightRadius + '/' + cs.borderBottomRightRadius + '/' + cs.borderBottomLeftRadius, ground: hex(effBg(e)), cursor: cs.cursor, w: Math.round(r.width), h: Math.round(r.height) }; };
  const REF = ['.btn.primary', '.btn:not(.primary)', '.modal-back-btn', '.tag', '.research-module-chip', '.narrative-toggle-btn', 'input:not([type=hidden]):not([type=checkbox]):not([type=radio])', 'textarea', '.opportunity-card', '.booking-error', '.explore-tab', '.ncv-expand-btn'];
  const refs = () => REF.map(s => { const e = [...document.querySelectorAll(s)].find(vis); return e ? Object.assign({ sel: s }, sig(e)) : null; }).filter(Boolean);
  const measure = (sel) => { const els = [...document.querySelectorAll(sel)].filter(vis);
    return { url: location.hash, innerWidth, docScrollWidth: document.documentElement.scrollWidth, hScroll: document.documentElement.scrollWidth > innerWidth,
      items: els.map(e => { const cs = getComputedStyle(e), r = e.getBoundingClientRect();
        return { el: desc(e), w: +r.width.toFixed(1), h: +r.height.toFixed(1), lines: lineCount(e), overflowX: e.scrollWidth > e.clientWidth + 1, ground: hex(effBg(e)), behind: hex(effBg(e.parentElement)),
          border: lines(e), radius: cs.borderTopLeftRadius + '/' + cs.borderTopRightRadius + '/' + cs.borderBottomRightRadius + '/' + cs.borderBottomLeftRadius, boxShadow: cs.boxShadow,
          padding: cs.paddingTop + ' ' + cs.paddingRight + ' ' + cs.paddingBottom + ' ' + cs.paddingLeft, cursor: cs.cursor, interactive: e.matches('button,a,[role=button],[tabindex]'),
          sig: sig(e), texts: texts(e), nest: nest(e) }; }), refs: refs() }; };
  const rect = (spec, sel, margin, topSel, bottomSel, idx) => { let els;
    if (spec === 'self' || spec === 'each') els = [...document.querySelectorAll(sel)].filter(vis).slice(idx || 0, (idx || 0) + 1); else if (spec === 'union') els = [...document.querySelectorAll(sel)].filter(vis); else els = [document.querySelector(spec)].filter(Boolean);
    if (topSel) { const t = [...document.querySelectorAll(topSel)].find(vis); if (t) els.push(t); } if (bottomSel) { const t = [...document.querySelectorAll(bottomSel)].find(vis); if (t) els.push(t); }
    const rs = els.map(e => e.getBoundingClientRect()); const m = margin || 0;
    return { x: Math.min(...rs.map(r => r.left)) - m, y: Math.min(...rs.map(r => r.top)) - m, w: Math.max(...rs.map(r => r.right)) - Math.min(...rs.map(r => r.left)) + 2*m, h: Math.max(...rs.map(r => r.bottom)) - Math.min(...rs.map(r => r.top)) + 2*m }; };
  return { measure, rect, effBg, hex };
})(); true;`;

let preloadId = null;
async function loadCase(c, vp) {
  await send("Page.navigate", { url: "about:blank" }); await sleep(200);
  if (preloadId) { await send("Page.removeScriptToEvaluateOnNewDocument", { identifier: preloadId }); preloadId = null; }
  if (c.seed) {
    await send("Page.navigate", { url: `http://127.0.0.1:${port}/__blank` }); await sleep(300);
    await js("localStorage.clear();" + Object.entries(c.seed).map(([k, v]) => `localStorage.setItem(${JSON.stringify(k)},${JSON.stringify(v)});`).join(""));
  } else {
    await send("Page.navigate", { url: `http://127.0.0.1:${port}/__blank` }); await sleep(200); await js("localStorage.clear();");
  }
  if (c.preload) preloadId = (await send("Page.addScriptToEvaluateOnNewDocument", { source: c.preload })).identifier;
  await send("Page.navigate", { url: `http://127.0.0.1:${port}/${c.page || "index.html"}${c.route || ""}` });
  await waitFor(c.page ? "document.readyState==='complete'" : "document.querySelector('#app .page')", 25000);
  await sleep(1500);
  await js(`const s=document.createElement('style'); s.id='pb-neutral'; s.textContent='.prototype-banner{display:none !important} *{transition:none !important; scroll-behavior:auto !important}'; document.head.appendChild(s);`);
  if (c.prep) await js(c.prep);
  const ok = await waitFor(`[...document.querySelectorAll(${JSON.stringify(c.sel)})].some(e=>e.getBoundingClientRect().width>0)`, 15000);
  await js(LIB);
  return ok;
}

async function shot(name, c, idx) {
  const target = c.clip === "self" || c.clip === "each" || c.clip === "union" ? c.sel : c.clip;
  if (!c.noScroll) await js(`const e=[...document.querySelectorAll(${JSON.stringify(target)})].filter(x=>x.getBoundingClientRect().width>0)[${idx || 0}]; if(e) e.scrollIntoView({block:'center', behavior:'instant'}); await new Promise(r=>setTimeout(r,250));`);
  const r = await js(`return __pb.rect(${JSON.stringify(c.clip)}, ${JSON.stringify(c.sel)}, ${c.margin == null ? 16 : c.margin}, ${JSON.stringify(c.clipTop || null)}, ${JSON.stringify(c.clipBottom || null)}, ${idx || 0})`);
  const lm = await send("Page.getLayoutMetrics");
  const vv = lm.cssVisualViewport || lm.visualViewport, vw = vv.clientWidth, vh = vv.clientHeight;
  let x = Math.max(0, r.x), y = Math.max(0, r.y), w = Math.min(vw - x, r.w - (x - r.x)), h = Math.min(vh - y, r.h - (y - r.y));
  const img = await send("Page.captureScreenshot", { format: "png", clip: { x: x + vv.pageX, y: y + vv.pageY, width: Math.max(1, w), height: Math.max(1, h), scale: 1 } });
  fs.writeFileSync(path.join(SHOTS, name + ".png"), Buffer.from(img.data, "base64"));
  return { file: "shots/" + name + ".png", cut: r.h > h + 1 };
}
async function shots(name, c) {
  if (c.clip !== "each") return [await shot(name, c)];
  const n = await js(`return [...document.querySelectorAll(${JSON.stringify(c.sel)})].filter(x=>x.getBoundingClientRect().width>0).length`);
  const out = []; for (let i = 0; i < n; i++) out.push(await shot(name + "-" + (i + 1), c, i)); return out;
}

async function axeCheck(sel) {
  if (!AXE_SRC) return null;
  await js(`if(!window.axe){ ${AXE_SRC} } return true;`).catch(() => null);
  return js(`const els=[...document.querySelectorAll(${JSON.stringify(sel)})].filter(e=>e.getBoundingClientRect().width>0); const out=[];
    for (const e of els) { const r = await axe.run(e, { runOnly: ['color-contrast'] }); r.violations.forEach(v=>v.nodes.forEach(n=>out.push({ target: n.target.join(' '), msg: (n.any[0]||{}).message || '' }))); }
    return out;`).catch((e) => [{ error: String(e) }]);
}

async function forced(on) { await send("Emulation.setEmulatedMedia", { features: [{ name: "forced-colors", value: on ? "active" : "none" }] }); await sleep(350); }

async function hover(selector) {
  const p = await js(`const e=document.querySelector(${JSON.stringify(selector)}); e.scrollIntoView({block:'center',behavior:'instant'}); await new Promise(r=>setTimeout(r,200)); const r=e.getBoundingClientRect(); return {x:r.left+r.width/2, y:r.top+r.height/2};`);
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: p.x, y: p.y }); await sleep(300);
  const m = await js(`const e=document.querySelector(${JSON.stringify(selector)}); const cs=getComputedStyle(e); return { hovered: e.matches(':hover'), ground: __pb.hex(__pb.effBg(e)), border: cs.borderLeftWidth+' '+cs.borderLeftColor+' / '+cs.borderTopWidth+' '+cs.borderTopColor, shadow: cs.boxShadow, color: cs.color };`);
  return m;
}

const results = { at: new Date().toISOString(), tint: TINT, cases: [] };

(async () => {
  server = http.createServer((req, res) => {
    const u = decodeURIComponent(req.url.split("?")[0]);
    if (u === "/__blank") { res.writeHead(200, { "Content-Type": "text/html" }); return res.end("<!doctype html><title>blank</title>"); }
    const p = path.join(ROOT, u === "/" ? "/index.html" : u);
    if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { "Content-Type": TYPES[path.extname(p)] || "text/plain" }); fs.createReadStream(p).pipe(res);
  });
  await new Promise(r => server.listen(0, "127.0.0.1", r)); port = server.address().port;
  chrome = spawn(CHROME, ["--headless=new", "--remote-debugging-port=" + CDP_PORT, "--user-data-dir=" + PROFILE, "--no-first-run", "--no-default-browser-check", "--disable-gpu", "--hide-scrollbars", "about:blank"], { stdio: "ignore" });
  for (let i = 0; i < 60; i++) { try { const r = await fetch("http://127.0.0.1:" + CDP_PORT + "/json/version"); if (r.ok) break; } catch (_) {} await sleep(250); }
  const t = await (await fetch("http://127.0.0.1:" + CDP_PORT + "/json/new?about:blank", { method: "PUT" })).json();
  ws = new WebSocket(t.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  ws.onmessage = (m) => { const msg = JSON.parse(m.data); if (msg.id && pending.has(msg.id)) { const p = pending.get(msg.id); pending.delete(msg.id); msg.error ? p.reject(new Error(msg.error.message)) : p.resolve(msg.result); } };
  await send("Page.enable"); await send("Runtime.enable");
  if (process.env.PB_EVAL) { // debugging aid: PB_ROUTE='#explore?tab=browse' PB_EVAL='return …' node part-box-test.js
    const W = +process.env.PB_W || 1280; await send("Emulation.setDeviceMetricsOverride", { width: W, height: 1000, deviceScaleFactor: W < 768 ? 2 : 1, mobile: W < 768 });
    const dc = process.env.PB_CASE ? Object.assign({}, CASES.find(x => x.id === process.env.PB_CASE), { sel: "body" }) : { route: process.env.PB_ROUTE || "#home", sel: "body", prep: process.env.PB_PREP ? H + process.env.PB_PREP : "" };
    try { await loadCase(dc); } catch (e) { console.log("prep error: " + e.message); }
    console.log(JSON.stringify(await js(process.env.PB_EVAL), null, 1)); chrome.kill(); server.close();
    setTimeout(() => { try { fs.rmSync(PROFILE, { recursive: true, force: true }); } catch (_) {} process.exit(0); }, 500); return;
  }

  for (const c of CASES) {
    if (ONLY && !ONLY.includes(c.id)) continue;
    const rec = { id: c.id, screen: c.screen, forcedVisible: !!c.forced, synthetic: !!c.synthetic, css: c.css, runs: [] };
    for (const vp of [{ w: 1280, h: 1000, phone: false, tag: "1280" }, { w: 320, h: 1000, phone: true, tag: "320" }]) {
      await send("Emulation.setDeviceMetricsOverride", { width: vp.w, height: vp.h, deviceScaleFactor: vp.phone ? 2 : 1, mobile: vp.phone });
      await send("Emulation.setTouchEmulationEnabled", { enabled: vp.phone, maxTouchPoints: vp.phone ? 5 : 1 });
      await forced(false);
      const run = { width: vp.w };
      try {
        const ok = await loadCase(c, vp);
        if (!ok) { run.error = "element not visible on this screen"; rec.runs.push(run); console.log("  MISS " + c.id + " @" + vp.w); continue; }
        if (c.id.startsWith("modal") || c.id.startsWith("booking")) run.service = await js("return window.__pbOpp||null");
        run.before = await js(`return __pb.measure(${JSON.stringify(c.sel)})`);
        run.before.axe = await axeCheck(c.sel);
        run.before.shot = await shots(`${c.id}-${vp.tag}-before`, c);
        if (!vp.phone) {
          await forced(true); await js(LIB);
          run.forcedBefore = await js(`return __pb.measure(${JSON.stringify(c.sel)})`); run.forcedBefore.shot = await shots(`${c.id}-${vp.tag}-forced-before`, c);
          await forced(false);
          if (c.hover) { run.hoverBefore = await hover(c.hover); run.hoverBefore.shot = await shots(`${c.id}-${vp.tag}-hover-before`, c); await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 1, y: 1 }); }
        }
        await js(`const s=document.createElement('style'); s.id='pb-inject'; s.textContent=${JSON.stringify(c.css)}; document.head.appendChild(s); await new Promise(r=>setTimeout(r,250));`);
        run.after = await js(`return __pb.measure(${JSON.stringify(c.sel)})`);
        run.after.axe = await axeCheck(c.sel);
        run.after.shot = await shots(`${c.id}-${vp.tag}-after`, c);
        if (!vp.phone) {
          await forced(true);
          run.forcedAfter = await js(`return __pb.measure(${JSON.stringify(c.sel)})`); run.forcedAfter.shot = await shots(`${c.id}-${vp.tag}-forced-after`, c);
          await forced(false);
          if (c.hover) { run.hoverAfter = await hover(c.hover); run.hoverAfter.shot = await shots(`${c.id}-${vp.tag}-hover-after`, c); await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 1, y: 1 }); }
        }
        console.log("  ok   " + c.id + " @" + vp.w + "  items " + run.before.items.length + "  hScroll " + run.before.hScroll + "→" + run.after.hScroll);
      } catch (e) { run.error = String(e && e.message || e); console.log("  ERR  " + c.id + " @" + vp.w + ": " + run.error); }
      rec.runs.push(run);
    }
    results.cases.push(rec);
  }
  if (ONLY && fs.existsSync(path.join(OUT, "results.json"))) { // a partial run replaces only its own cases
    const prev = JSON.parse(fs.readFileSync(path.join(OUT, "results.json"), "utf8"));
    const byId = new Map(prev.cases.map(x => [x.id, x])); results.cases.forEach(x => byId.set(x.id, x));
    results.cases = CASES.map(x => byId.get(x.id)).filter(Boolean);
  }
  fs.writeFileSync(path.join(OUT, "results.json"), JSON.stringify(results, null, 1));
  console.log("wrote " + path.join(OUT, "results.json"));
  try { ws.close(); } catch (_) {} chrome.kill(); server.close();
  setTimeout(() => { try { fs.rmSync(PROFILE, { recursive: true, force: true }); } catch (_) {} process.exit(0); }, 500);
})().catch(e => { console.error(e); try { chrome.kill(); } catch (_) {} process.exit(1); });
