#!/usr/bin/env node
/**
 * Test analysis of the "part box" (ST-1a) on the NCV tool, without changing the tool: the part-box CSS is injected
 * into narrative-cv-prototype-v9.html at run time and each screen that carries a part colour is measured before
 * (stripes, as shipped) and after (part box), at 1280 px and 320 px, with and without forced colours, and with the
 * WCAG 1.4.12 text-spacing overrides. Writes screenshots and part-box-test/results.json next to this file.
 *   NCV_CDP_PORT=9391 node ncv_tool_v9/design/part-box-test.js
 * Draft content is the invented mock CV.
 */
"use strict";
const fs = require("fs"), os = require("os"), path = require("path"), http = require("http"), { spawn } = require("child_process");
const ROOT = path.join(__dirname, "../..");
const OUT = path.join(__dirname, "part-box-test"); fs.mkdirSync(OUT, { recursive: true });
const CHROME = process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const AXE = [process.env.AXE, path.join(os.homedir(), "Documents/ubc_fire/node_modules/axe-core/axe.min.js")].find(p => p && fs.existsSync(p));
const AXE_SRC = AXE ? fs.readFileSync(AXE, "utf8") : null;
const CDP_PORT = +process.env.NCV_CDP_PORT || 9391, PROFILE = fs.mkdtempSync(path.join(os.tmpdir(), "ncv-v9-pbox-"));
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".md": "text/plain" };
let server, port, chrome, ws, nextId = 1;
const pending = new Map();
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const send = (method, params) => new Promise((resolve, reject) => { const id = nextId++; pending.set(id, { resolve, reject }); ws.send(JSON.stringify({ id, method, params: params || {} })); });
async function js(expr) {
  const r = await send("Runtime.evaluate", { expression: "(async()=>{" + expr + "})()", awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error((r.exceptionDetails.exception && r.exceptionDetails.exception.description) || r.exceptionDetails.text);
  return r.result.value;
}
async function go(url) { await send("Page.navigate", { url }); await sleep(800); }
const PAGE = () => "http://127.0.0.1:" + port + "/narrative-cv-prototype-v9.html";
const HOME = () => "http://127.0.0.1:" + port + "/ncv_tool_v9/README.md";
const H = `const w=(ms)=>new Promise(r=>setTimeout(r,ms)); const q=(s)=>document.querySelector(s), qa=(s)=>[...document.querySelectorAll(s)];`;
const mock = JSON.parse(fs.readFileSync(path.join(ROOT, "ncv_tool_v8/mock/mock-narrative-cv-draft.json"), "utf8"));
const base = (stageKey, ui) => Object.assign({}, JSON.parse(JSON.stringify(mock.draft)), { stageKey, mode: "compose", profileConfirmed: true,
  ui: Object.assign({}, mock.draft.ui || {}, mock.ui || {}, { profileNote: false }, ui || {}) });
async function seed(state) {
  await go(HOME());
  await js("localStorage.clear(); localStorage.setItem('ncv-v9-carried','1');" + (state ? "localStorage.setItem('ncv-v9'," + JSON.stringify(JSON.stringify(state)) + ");" : ""));
  await go(PAGE());
}

// The designer's recommendation (accent-review-2026-11-26.md, section (c)), as one stylesheet.
const LINE = { stakes: "#8a6200", role: "var(--j-role)", activities: "var(--j-activities)", outputs: "var(--j-outputs)", outcomes: "var(--j-outcomes)", impact: "var(--j-impact)" };
const PARTBOX_CSS = Object.entries(LINE).map(([k, v]) => `.v9-pill-${k}, .v7-seg-${k} { --pb: ${v}; }`).join("\n") + `
.v7-f .v7-f-k.v9-pill, .v7-f.is-open .v7-f-k.v9-pill { box-shadow: none !important; border: 1px solid var(--pb); border-radius: 2px; padding: 1px 8px; }
.built .v7-seg[class*="v7-seg-"], .v7-legend [class*="v7-seg-"] { box-shadow: none !important; border: 1px solid var(--pb); border-radius: 2px; padding: 0 3px; -webkit-box-decoration-break: clone; box-decoration-break: clone; }
.v7-legend span { border-radius: 2px; }
.v8-mini i.on { box-shadow: none; border: 1px solid var(--pi, var(--pa)); }
.v8-leg i, .v7-wb-leg i { box-shadow: none !important; border: 1px solid var(--pi, var(--pa)); border-radius: 2px; }
.v8-bar .v8-eb-block { box-shadow: none; border: 1px solid var(--pi, var(--pa)); }
.v7-wb-box { border-radius: 2px; }
.v9-b-stakes { --jb: #8a6200; }`;
const TEXT_SPACING = `* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-bottom: 2em !important; }`;
const inject = (id, css) => js(`let s=document.getElementById(${JSON.stringify(id)}); if(!s){s=document.createElement('style'); s.id=${JSON.stringify(id)}; document.head.appendChild(s);} s.textContent=${JSON.stringify(css)}; await new Promise(r=>setTimeout(r,250));`);
const uninject = (id) => js(`const s=document.getElementById(${JSON.stringify(id)}); if(s) s.remove(); await new Promise(r=>setTimeout(r,250));`);

const TARGETS = `.v9-pill, .built .v7-seg[class*="v7-seg-"], .v7-legend [class*="v7-seg-"], .v8-mini i.on, .v7-wb-leg i, .v8-bar .v8-eb-block:not(.is-empty), .v7-wb-box`;
const openCard = `${H} await w(200); if(!q('.v9-pill')){ const f=qa('.v7-fold')[0]; if(f){ f.click(); await w(400);} }`;
const openExample = `${openCard} const b=qa('button').find(x=>/finished example/i.test(x.innerText)); if(!b) throw new Error('no example button'); b.click(); await w(500); q('#v7-exbox').scrollIntoView({block:'start'});`;
const STATES = [
  { name: "contrib-folded", label: "Contributions, folded cards", state: Object.assign(base("contrib"), { contributions: base("contrib").contributions.map((c, i) => Object.assign({}, c, { folded: i > 0 })) }), prep: `${H} await w(200);`, clip: ".v7-fold", clipTo: ".v7-fold" },
  { name: "contrib-open", label: "Contributions, a card open", state: base("contrib"), prep: openCard, clip: ".v7-f.v7-pilled", clipParent: 1 },
  { name: "example", label: "See a finished example", state: base("contrib"), prep: openExample, clip: "#v7-exbox" },
  { name: "ps", label: "Personal statement", state: base("ps"), prep: `${H} await w(300);`, clip: ".v7-f.v7-pilled", clipParent: 1 },
  { name: "review-words", label: "Review, Edit what already changed", state: base("review", { reviewTab: "words" }), prep: `${H} await w(300);`, clip: ".v7-wb-leg", clipTo: ".v7-wb-row:nth-of-type(3)" },
  { name: "review-open", label: "Review, a block open", state: base("review", { reviewTab: "words" }), prep: `${H} await w(300); q('.v8-bar .v8-eb-block:not(.is-empty)').click(); await w(400);`, clip: ".v7-wb-leg", clipTo: ".v7-wb-box" },
];

// In-page measurements of every element that carries a part colour.
const MEASURE = H + `
  const rgb=(c)=>{ const m=(c||'').match(/rgba?\\(([^)]+)\\)/); if(!m) return null; const p=m[1].split(/[ ,\\/]+/).filter(Boolean).map(Number); return {r:p[0],g:p[1],b:p[2],a:p.length>3?p[3]:1}; };
  const lum=(c)=>{ const f=(v)=>{v/=255; return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4);}; return 0.2126*f(c.r)+0.7152*f(c.g)+0.0722*f(c.b); };
  const cr=(a,b)=>{ const x=lum(a), y=lum(b); return +( (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05) ).toFixed(2); };
  const hex=(c)=>c?'#'+[c.r,c.g,c.b].map(v=>Math.round(v).toString(16).padStart(2,'0')).join(''):null;
  const groundOf=(e)=>{ for(let p=e.parentElement;p;p=p.parentElement){ const c=rgb(getComputedStyle(p).backgroundColor); if(c&&c.a>0.5) return c; } return {r:255,g:255,b:255,a:1}; };
  const vis=(e)=>{ const r=e.getBoundingClientRect(), cs=getComputedStyle(e); return r.width>0&&r.height>0&&cs.visibility!=='hidden'&&cs.display!=='none'; };
  const kind=(e)=>e.classList.contains('v9-pill')?'T1 pill':e.closest('.v7-legend')?'T3 example legend':e.classList.contains('v7-seg')?'T2 example sentence':e.closest('.v8-mini')?'T4 folded square':e.closest('.v7-wb-leg')?'T5 Review legend':e.classList.contains('v8-eb-block')?'T6 word-bar block':e.classList.contains('v7-wb-box')?'T10 block editor':'?';
  const els=qa(${JSON.stringify(TARGETS)}).filter(vis);
  const items=els.map(e=>{ const cs=getComputedStyle(e), own=rgb(cs.backgroundColor), g=groundOf(e), bg=(own&&own.a>0.5)?own:g;
    const bw=parseFloat(cs.borderTopWidth), bl=parseFloat(cs.borderLeftWidth), bc=rgb(cs.borderTopColor), blc=rgb(cs.borderLeftColor);
    const sh=cs.boxShadow&&cs.boxShadow!=='none'?cs.boxShadow:''; const shc=rgb(sh);
    const r=e.getBoundingClientRect();
    return { kind:kind(e), cls:e.className, w:+r.width.toFixed(1), h:+r.height.toFixed(1), radius:cs.borderTopLeftRadius,
      ground:hex(g), fill:hex(bg), border:bw>0&&cs.borderTopStyle!=='none'?{w:bw, c:hex(bc), style:cs.borderTopStyle, vsFill:cr(bc,bg), vsGround:cr(bc,g)}:null,
      leftEdge:bl>bw?{w:bl, c:hex(blc), vsFill:cr(blc,bg)}:null, stripe:shc&&/inset/.test(sh)?{c:hex(shc), css:sh.slice(0,60), vsFill:cr(shc,bg), vsGround:cr(shc,g)}:null,
      clipped: e.scrollHeight>e.clientHeight+1 || e.scrollWidth>e.clientWidth+1 }; });
  // Example sentences: lines of different sentences that touch or overlap, and sentences that meet on one line.
  const segs=qa('.built .v7-seg[class*="v7-seg-"]').filter(vis); let vGap=null, hGap=null, supOut=0;
  const rects=[]; segs.forEach((s,i)=>[...s.getClientRects()].forEach(r=>rects.push({i,t:r.top,b:r.bottom,l:r.left,r:r.right})));
  rects.sort((a,b)=>a.t-b.t||a.l-b.l);
  for(let a=0;a<rects.length;a++) for(let b=a+1;b<rects.length;b++){ const A=rects[a],B=rects[b];
    const hov=Math.min(A.r,B.r)-Math.max(A.l,B.l); const sameLine=Math.abs(A.t-B.t)<4;
    if(!sameLine && hov>0){ const g=B.t-A.b; if(B.t>A.t+4 && (vGap===null||g<vGap)) vGap=+g.toFixed(1); }
    if(sameLine && A.i!==B.i){ const g=Math.max(B.l-A.r, A.l-B.r); if(hGap===null||g<hGap) hGap=+g.toFixed(1); } }
  qa('.built .v7-seg .v4-super').forEach(s=>{ const p=s.closest('.v7-seg').getBoundingClientRect(), r=s.getBoundingClientRect(); if(r.top<p.top-0.5||r.right>p.right+0.5) supOut++; });
  const bars=qa('.v8-bar').filter(vis).map(b=>({over:b.scrollWidth>b.clientWidth+1, sw:b.scrollWidth, cw:b.clientWidth}));
  const pills=qa('.v9-pill').filter(vis).map(p=>+p.getBoundingClientRect().height.toFixed(1));
  return { items, vGap, hGap, supOut, segCount:segs.length, bars, pills, reflow: document.documentElement.scrollWidth<=document.documentElement.clientWidth,
    sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth };`;

async function clipOf(st) {
  return js(H + `const a=q(${JSON.stringify(st.clip)}); if(!a) return null; let e=a; for(let i=0;i<${st.clipParent || 0};i++) e=e.parentElement;
    const r=e.getBoundingClientRect(); let b=r.bottom; ${st.clipTo ? `const z=qa(${JSON.stringify(st.clipTo)}).pop(); if(z) b=Math.max(b,z.getBoundingClientRect().bottom);` : ""}
    const W=document.documentElement.clientWidth; const x=Math.max(0,r.left-8), y=Math.max(0,r.top+scrollY-8);
    return {x, y, width:Math.min(W-x, r.width+16), height:Math.min(900, b-r.top+16), scale:1};`);
}
async function shot(file, clip) {
  if (!clip) return null;
  const r = await send("Page.captureScreenshot", { format: "png", clip, captureBeyondViewport: true });
  fs.writeFileSync(path.join(OUT, file), Buffer.from(r.data, "base64")); return file;
}
async function nodeId(sel) {
  const doc = await send("DOM.getDocument", { depth: 0 });
  return (await send("DOM.querySelector", { nodeId: doc.root.nodeId, selector: sel })).nodeId;
}
async function runAxe() {
  if (!AXE_SRC) return null;
  await send("Runtime.evaluate", { expression: AXE_SRC });
  return js(`const r=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']},resultTypes:['violations']});
    return r.violations.map(v=>({id:v.id, n:v.nodes.length, t:v.nodes.slice(0,3).map(n=>n.target.join(' '))}));`);
}

(async () => {
  server = http.createServer((req, res) => {
    const p = path.join(ROOT, decodeURIComponent(req.url.split("?")[0]));
    if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { "Content-Type": TYPES[path.extname(p)] || "text/plain" }); fs.createReadStream(p).pipe(res);
  });
  await new Promise(r => server.listen(0, "127.0.0.1", r)); port = server.address().port;
  chrome = spawn(CHROME, ["--headless=new", "--remote-debugging-port=" + CDP_PORT, "--user-data-dir=" + PROFILE, "--no-first-run", "--no-default-browser-check", "--disable-gpu", "about:blank"], { stdio: "ignore" });
  for (let i = 0; i < 60; i++) { try { const r = await fetch("http://127.0.0.1:" + CDP_PORT + "/json/version"); if (r.ok) break; } catch (_) {} await sleep(250); }
  const t = await (await fetch("http://127.0.0.1:" + CDP_PORT + "/json/new?about:blank", { method: "PUT" })).json();
  ws = new WebSocket(t.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  ws.onmessage = (m) => { const msg = JSON.parse(m.data); if (msg.id && pending.has(msg.id)) { const p = pending.get(msg.id); pending.delete(msg.id); msg.error ? p.reject(new Error(msg.error.message)) : p.resolve(msg.result); } };
  await send("Page.enable"); await send("Runtime.enable"); await send("DOM.enable"); await send("CSS.enable");

  const out = { at: new Date().toISOString(), css: PARTBOX_CSS, runs: [], states: [] };
  for (const vp of [{ w: 1280, h: 900, phone: false }, { w: 320, h: 720, phone: true }]) {
    await send("Emulation.setDeviceMetricsOverride", { width: vp.w, height: vp.h, deviceScaleFactor: 2, mobile: vp.phone });
    await send("Emulation.setTouchEmulationEnabled", { enabled: vp.phone, maxTouchPoints: vp.phone ? 5 : 1 });
    for (const st of STATES) {
      await send("Emulation.setEmulatedMedia", { features: [] });
      await seed(st.state);
      try { await js(st.prep); } catch (e) { console.log("prep failed", st.name, vp.w, e.message); out.states.push({ st: st.name, vp: vp.w, error: e.message }); continue; }
      const rec = { st: st.name, label: st.label, vp: vp.w };
      for (const mode of ["stripe", "box", "slice"]) {
        if (mode === "slice" && st.name !== "example") continue;
        if (mode === "box") await inject("pbox", PARTBOX_CSS);
        if (mode === "slice") await inject("pbox", PARTBOX_CSS + `\n.built .v7-seg[class*="v7-seg-"] { -webkit-box-decoration-break: slice; box-decoration-break: slice; }`);
        const clip = await clipOf(st);
        rec[mode] = { m: await js(MEASURE), shot: await shot(`${st.name}-${vp.w}-${mode}.png`, clip) };
        rec[mode].axe = await runAxe();
        await inject("tsp", TEXT_SPACING); rec[mode].spacing = await js(MEASURE); rec[mode].spacingShot = await shot(`${st.name}-${vp.w}-${mode}-spacing.png`, await clipOf(st)); await uninject("tsp");
        await send("Emulation.setEmulatedMedia", { features: [{ name: "forced-colors", value: "active" }] }); await sleep(300);
        rec[mode].forced = await js(MEASURE); rec[mode].forcedShot = await shot(`${st.name}-${vp.w}-${mode}-forced.png`, await clipOf(st));
        await send("Emulation.setEmulatedMedia", { features: [] }); await sleep(200);
        // Rest, hover, focus and open of a word-bar block, as pixels.
        if (st.name === "review-words") {
          rec[mode].states = {};
          const sel = ".v8-bar .v8-eb-block:not(.is-empty)";
          const bclip = await js(H + `const e=q(${JSON.stringify(sel)}); e.scrollIntoView({block:'center'}); await w(100); const r=e.getBoundingClientRect(); return {x:r.left-4,y:r.top+scrollY-4,width:r.width+8,height:r.height+8,scale:1};`);
          const id = await nodeId(sel);
          for (const ps of [[], ["hover"], ["focus", "focus-visible"]]) {
            await send("CSS.forcePseudoState", { nodeId: id, forcedPseudoClasses: ps }); await sleep(250);
            const k = ps[0] || "rest";
            rec[mode].states[k] = { shot: await shot(`block-${vp.w}-${mode}-${k}.png`, bclip), style: await js(H + `const cs=getComputedStyle(q(${JSON.stringify(sel)})); return {border:cs.borderTopWidth+' '+cs.borderTopColor, shadow:cs.boxShadow.slice(0,80), outline:cs.outlineStyle+' '+cs.outlineWidth};`) };
            for (const fc of ["active"]) {
              await send("Emulation.setEmulatedMedia", { features: [{ name: "forced-colors", value: fc }] }); await sleep(250);
              rec[mode].states[k].forcedShot = await shot(`block-${vp.w}-${mode}-${k}-forced.png`, bclip);
              await send("Emulation.setEmulatedMedia", { features: [] }); await sleep(150);
            }
          }
          await send("CSS.forcePseudoState", { nodeId: id, forcedPseudoClasses: [] });
        }
      }
      out.states.push(rec);
      const s = rec.stripe.m, b = rec.box.m;
      console.log(`${vp.w} ${st.name}: items ${s.items.length}/${b.items.length}; reflow ${s.reflow}/${b.reflow}; bars over ${s.bars.filter(x => x.over).length}/${b.bars.filter(x => x.over).length}; vGap ${s.vGap}/${b.vGap}; hGap ${s.hGap}/${b.hGap}; sup out ${s.supOut}/${b.supOut}; axe ${(rec.stripe.axe || []).length}/${(rec.box.axe || []).length}`);
    }
  }
  fs.writeFileSync(path.join(OUT, "results.json"), JSON.stringify(out, null, 2));
  console.log("Results: ncv_tool_v9/design/part-box-test/results.json");
})().catch(e => { console.error(e); process.exitCode = 1; }).finally(() => {
  try { ws.close(); } catch (_) {} try { chrome.kill("SIGKILL"); } catch (_) {} try { server.close(); } catch (_) {}
  try { fs.rmSync(PROFILE, { recursive: true, force: true }); } catch (_) {}
});
