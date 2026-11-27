#!/usr/bin/env node
/**
 * Accessibility audit of narrative-cv-prototype-v9.html, with the mock CV. No npm install: it uses a local
 * axe-core (AXE=/path/to/axe.min.js, or one of the paths below) and headless Chrome over the DevTools protocol.
 *   NCV_CDP_PORT=9370 node ncv_tool_v9/a11y-audit.js            → ncv_tool_v9/a11y-audit-latest.json and a summary
 * Each state (every step, the five Review tabs, the editors, the Undo lines, the Change panel) is checked at
 * 1280 px and 320 px for: axe-core WCAG 2.0/2.1/2.2 A and AA rules; names on every control in the
 * accessibility tree; heading order; duplicate ids; target size (24 px, and 44 px on a phone, D-14);
 * reflow at 320 px; and, at 1280 px, a keyboard walk with Tab (focus never on <body> or a hidden
 * element, a visible focus style on each stop). Then keyboard runs of the V9.2 and V9.3 controls.
 * All draft content is the invented mock CV.
 */
"use strict";
const fs = require("fs"), os = require("os"), path = require("path"), http = require("http"), { spawn } = require("child_process");
const ROOT = path.join(__dirname, "..");
const CHROME = process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const AXE = [process.env.AXE, path.join(ROOT, "node_modules/axe-core/axe.min.js"), path.join(os.homedir(), "Documents/ubc_fire/node_modules/axe-core/axe.min.js")].find(p => p && fs.existsSync(p));
if (!AXE) { console.error("axe-core not found: set AXE=/path/to/axe.min.js"); process.exit(2); }
const AXE_SRC = fs.readFileSync(AXE, "utf8");
const CDP_PORT = +process.env.NCV_CDP_PORT || 9370, PROFILE = fs.mkdtempSync(path.join(os.tmpdir(), "ncv-v9-a11y-"));
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
const KEYS = { Tab: ["Tab", 9], Enter: ["Enter", 13, "\r"], Escape: ["Escape", 27], ArrowRight: ["ArrowRight", 39], ArrowLeft: ["ArrowLeft", 37], ArrowDown: ["ArrowDown", 40], " ": ["Space", 32, " "] };
async function key(k, shift) {
  const [code, vk, text] = KEYS[k]; const base = { key: k, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk, modifiers: shift ? 8 : 0 };
  await send("Input.dispatchKeyEvent", Object.assign({ type: text ? "keyDown" : "rawKeyDown" }, base, text ? { text, unmodifiedText: text } : {}));
  await send("Input.dispatchKeyEvent", Object.assign({ type: "keyUp" }, base));
  await sleep(60);
}
const H = `const w=(ms)=>new Promise(r=>setTimeout(r,ms)); const q=(s)=>document.querySelector(s), qa=(s)=>[...document.querySelectorAll(s)];
  const desc=(e)=>{ if(!e) return 'none'; const t=(e.getAttribute&&(e.getAttribute('aria-label')||''))||(e.innerText||e.value||'').trim().slice(0,40); return e.tagName.toLowerCase()+(e.id?'#'+e.id:'')+(e.className&&typeof e.className==='string'?'.'+e.className.trim().split(/\\s+/).slice(0,2).join('.'):'')+(t?' “'+t.replace(/\\s+/g,' ')+'”':''); };`;

const mock = JSON.parse(fs.readFileSync(path.join(ROOT, "ncv_tool_v8/mock/mock-narrative-cv-draft.json"), "utf8"));
const base = (stageKey, ui) => Object.assign({}, JSON.parse(JSON.stringify(mock.draft)), { stageKey, mode: "compose", profileConfirmed: true,
  ui: Object.assign({}, mock.draft.ui || {}, mock.ui || {}, { profileNote: false }, ui || {}) });
async function seed(state) {
  await go(HOME());
  await js("localStorage.clear(); localStorage.setItem('ncv-v9-carried','1');" + (state ? "localStorage.setItem('ncv-v9'," + JSON.stringify(JSON.stringify(state)) + ");" : ""));
  await go(PAGE());
}
const clickJs = (sel, extra) => H + `const b=${sel}; if(!b) throw new Error('not found: ' + ${JSON.stringify(sel)}); b.click(); await w(350);` + (extra || "");
const STATES = [
  { name: "Start, new", state: null },
  { name: "Start, draft saved", state: base("start") },
  { name: "Set up your profile", state: null, prep: H + `q('.v7-path-new').click(); await w(200); q('#ag-sshrc').click(); await w(300);` },
  { name: "Contributions", state: base("contrib") },
  { name: "Contributions, evidence open", state: base("contrib"), prep: clickJs(`qa('button').find(b=>/^Edit evidence for contribution/.test(b.getAttribute('aria-label')||''))`) },
  { name: "Change panel", state: base("contrib"), prep: clickJs(`q('#v7-chg')`) },
  { name: "Mentorship", state: base("mentor") },
  { name: "Mentorship, Undo after Remove person", state: base("mentor"), prep: clickJs(`qa('button').find(b=>b.getAttribute('aria-label')==='Remove person B')`, `const ok=q('.v7-warn .btn-primary'); if(ok){ok.click(); await w(350);}`) },
  { name: "Personal statement", state: base("ps") },
  { name: "Review, Reorder", state: base("review", { reviewTab: "order" }) },
  { name: "Review, Edit what already changed", state: base("review", { reviewTab: "words" }) },
  { name: "Review, Edit role", state: base("review", { reviewTab: "role" }) },
  { name: "Review, Add evidence", state: base("review", { reviewTab: "evidence" }) },
  { name: "Review, evidence editor (Column)", state: base("review", { reviewTab: "evidence" }), prep: clickJs(`q('.v7-rqev-item')`) },
  { name: "Review, evidence Undo", state: base("review", { reviewTab: "evidence" }), prep: clickJs(`q('.v7-rqev-item')`, `qa('.v8-edrow .btn').find(b=>b.innerText==='Remove').click(); await w(350);`) },
  { name: "Review, Check changes", state: base("review", { reviewTab: "reach" }) },
  { name: "Export", state: base("export") },
  { name: "Start, Undo after Clear draft", state: base("start"), prep: clickJs(`q('.v7-path-reset')`, `qa('.v7-warn .btn').find(b=>b.innerText==='Clear draft').click(); await w(400);`) },
];

const INTERACTIVE = ["button", "link", "textbox", "checkbox", "radio", "combobox", "tab", "menuitem", "spinbutton", "searchbox", "switch", "slider", "listbox", "option"];
async function axNameless() {
  await send("DOM.getDocument", { depth: -1 });
  const { nodes } = await send("Accessibility.getFullAXTree");
  const out = [];
  for (const n of nodes) {
    if (n.ignored || !n.role || INTERACTIVE.indexOf(n.role.value) === -1) continue;
    if (n.name && String(n.name.value || "").trim()) continue;
    let html = "";
    try { const { object } = await send("DOM.resolveNode", { backendNodeId: n.backendDOMNodeId }); const r = await send("Runtime.callFunctionOn", { objectId: object.objectId, functionDeclaration: "function(){return this.outerHTML.slice(0,160)}", returnByValue: true }); html = r.result.value; } catch (_) {}
    out.push({ role: n.role.value, html });
  }
  return out;
}
const pageChecks = (phone) => H + `
  const min=${phone ? 44 : 24}, vis=(e)=>{const r=e.getBoundingClientRect(), s=getComputedStyle(e); return r.width>0&&r.height>0&&s.visibility!=='hidden'&&s.display!=='none';};
  const inlineInText=(e)=>{ if(getComputedStyle(e).display!=='inline') return false; const p=e.parentElement; return !!p && [...p.childNodes].some(n=>n!==e&&n.nodeType===3&&n.textContent.trim()); };
  const small=qa('button, a[href], input:not([type=hidden]), select, textarea, [role=button], [role=tab], [tabindex="0"]').filter(vis).filter(e=>!inlineInText(e)).filter(e=>!e.closest('[aria-hidden=true]'))
    .map(e=>{const r=e.getBoundingClientRect(); const t=e.type; const lab=(t==='radio'||t==='checkbox')&&e.closest('label'); const rr=lab?lab.getBoundingClientRect():r; return {e:desc(e), w:Math.round(rr.width), h:Math.round(rr.height)};})
    .filter(x=>x.h<min||x.w<min);
  const hs=qa('h1,h2,h3,h4,h5,h6').filter(vis).map(h=>+h.tagName[1]); const jumps=[]; for(let i=1;i<hs.length;i++) if(hs[i]>hs[i-1]+1) jumps.push(hs[i-1]+'→'+hs[i]);
  const ids={}; qa('[id]').forEach(e=>{ids[e.id]=(ids[e.id]||0)+1;}); const dup=Object.keys(ids).filter(k=>ids[k]>1);
  const sw=document.documentElement.scrollWidth, cw=document.documentElement.clientWidth;
  const wide=${phone} ? qa('body *').filter(vis).filter(e=>{ const r=e.getBoundingClientRect(); if(r.right<=cw+1) return false; let p=e.parentElement; while(p&&p!==document.body){ const o=getComputedStyle(p).overflowX; if(o==='auto'||o==='scroll'||o==='hidden') return false; p=p.parentElement; } return true; }).slice(0,5).map(desc) : [];
  const live=qa('[aria-live],[role=status],[role=alert]').map(desc);
  return { small, smallN: small.length, h1: hs.filter(x=>x===1).length, jumps, dup, reflow: sw<=cw, sw, cw, wide, live: live.length };`;
async function runAxe() {
  await send("Runtime.evaluate", { expression: AXE_SRC });
  return js(`const r=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']},resultTypes:['violations']});
    return r.violations.map(v=>({id:v.id, impact:v.impact, help:v.help, n:v.nodes.length, nodes:v.nodes.slice(0,4).map(n=>({t:n.target.join(' '), why:(n.failureSummary||'').split('\\n').slice(1,3).join(' ').slice(0,200)}))}));`);
}
async function tabWalk() {
  await js("document.activeElement && document.activeElement.blur(); window.scrollTo(0,0); document.body.focus();");
  const stops = [], bad = [];
  let first = null;
  for (let k = 0; k < 400; k++) {
    await key("Tab");
    const s = await js(H + `const e=document.activeElement; if(!e||e===document.body) return {body:true};
      const cs=getComputedStyle(e), r=e.getBoundingClientRect(); const ring=(cs.outlineStyle!=='none'&&parseFloat(cs.outlineWidth)>0)||(cs.boxShadow&&cs.boxShadow!=='none');
      const lab=e.closest('label'); const ring2=lab&&(getComputedStyle(lab).outlineStyle!=='none'||getComputedStyle(lab).boxShadow!=='none');
      return {d:desc(e), ring:!!(ring||ring2), hidden:!(r.width>0&&r.height>0)||cs.visibility==='hidden'};`);
    if (s.body) { bad.push({ k, problem: "focus on <body>" }); continue; }
    if (first === null) first = s.d; else if (s.d === first) break;
    stops.push(s.d);
    if (s.hidden) bad.push({ k, problem: "focus on a hidden element", e: s.d });
    if (!s.ring) bad.push({ k, problem: "no outline or shadow when focused", e: s.d });
  }
  return { stops: stops.length, bad };
}

const report = { at: new Date().toISOString(), axe: AXE, states: [], keyboard: [] };
const kb = (name, ok, detail) => { report.keyboard.push({ name, ok, detail }); console.log((ok ? "  ok   " : "  FAIL ") + name + (ok ? "" : "  → " + JSON.stringify(detail))); };

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
  await send("Page.enable"); await send("Runtime.enable"); await send("DOM.enable"); await send("Accessibility.enable");
  await send("Emulation.setFocusEmulationEnabled", { enabled: true });

  for (const vp of [{ w: 1280, h: 900, phone: false }, { w: 320, h: 720, phone: true }]) {
    await send("Emulation.setDeviceMetricsOverride", { width: vp.w, height: vp.h, deviceScaleFactor: vp.phone ? 2 : 1, mobile: vp.phone });
    await send("Emulation.setTouchEmulationEnabled", { enabled: vp.phone, maxTouchPoints: vp.phone ? 5 : 1 });
    console.log("\n== " + vp.w + " px");
    for (const st of STATES) {
      await seed(st.state);
      if (st.prep) { try { await js(st.prep); } catch (e) { console.log("  prep failed for " + st.name + ": " + e.message); report.states.push({ name: st.name, vp: vp.w, error: e.message }); continue; } }
      const axe = await runAxe();
      const page = await js(pageChecks(vp.phone));
      const nameless = await axNameless();
      const walk = vp.phone ? null : await tabWalk();
      report.states.push({ name: st.name, vp: vp.w, axe, page, nameless, walk });
      const issues = axe.length + page.smallN + page.jumps.length + page.dup.length + (page.reflow ? 0 : 1) + page.wide.length + nameless.length + (walk ? walk.bad.length : 0);
      console.log((issues ? "  " + String(issues).padStart(3) + " " : "    0 ") + st.name + "  [axe " + axe.map(v => v.id + "×" + v.n).join(", ") + (page.smallN ? "; small " + page.smallN : "") + (page.jumps.length ? "; headings " + page.jumps.join(",") : "") + (page.dup.length ? "; dup ids " + page.dup.join(",") : "") + (page.reflow ? "" : "; reflow " + page.sw + ">" + page.cw) + (nameless.length ? "; nameless " + nameless.length : "") + (walk ? "; tab stops " + walk.stops + (walk.bad.length ? ", focus issues " + walk.bad.length : "") : "") + "]");
    }
  }

  // Keyboard runs of the V9.2 and V9.3 controls, at 1280 px.
  console.log("\n== Keyboard: V9.2 and V9.3 controls");
  await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
  await send("Emulation.setTouchEmulationEnabled", { enabled: false, maxTouchPoints: 1 });
  const active = () => js(H + "return desc(document.activeElement);");
  const live = () => js("return (document.getElementById('v7-live')||{}).textContent||'';");
  await seed(base("review", { reviewTab: "evidence" }));
  await js(H + "q('.v7-rqev-item').focus();"); await key("Enter"); await sleep(250);
  let a1 = await active(); await key("Tab", true); let a2 = await active(); const radioChecked1 = await js("return (document.querySelector('.v9-ev-col input:checked')||{}).id;");
  await key("ArrowRight"); const radioChecked2 = await js("return (document.querySelector('.v9-ev-col input:checked')||{}).id;"); let a3 = await active();
  kb("Review editor: Enter opens it with focus in Details; Shift+Tab reaches the Column radio; an arrow key moves the choice", /v7-ev-text/.test(a1) && /v9-ev-col-0/.test(a2) && radioChecked1 === "v9-ev-col-0" && radioChecked2 === "v9-ev-col-1" && /v9-ev-col-1/.test(a3), { a1, a2, a3, radioChecked1, radioChecked2 });
  await key("Tab"); await key("Tab"); let a4 = await active(); await key("Enter"); await sleep(300); let a5 = await active(); let l5 = await live();
  kb("Review editor: Tab to Save and Enter moves the item and keeps focus on it", /Save/.test(a4) && /v7-rqev-item/.test(a5) && /under Where others used it/.test(l5), { a4, a5, l5 });
  await key("Enter"); await sleep(250); await key("Escape"); await sleep(250); let a6 = await active();
  kb("Review editor: Escape closes it and focus returns to the item", /v7-rqev-item/.test(a6) && !(await js("return !!document.querySelector('.v8-edrow')")), { a6 });
  await key("Enter"); await sleep(250); await key("Tab"); await key("Tab"); let a7 = await active(); await key("Enter"); await sleep(300); let a8 = await active(); let l8 = await live();
  kb("Review editor: Tab to Remove and Enter leaves focus on Undo, spoken", /Remove/.test(a7) && /#x-undo/.test(a8) && /Undo is available/.test(l8), { a7, a8, l8 });
  await key("Enter"); await sleep(300); let a9 = await active(); let l9 = await live();
  kb("Undo by Enter restores the item with focus on it", /v7-rqev-item/.test(a9) && /restored/.test(l9), { a9, l9 });

  await seed(base("export"));
  await js(H + "q('.v8-edoc .v9-fix-go').focus();"); let b1 = await active(); await key("Enter"); await sleep(500); let b2 = await active();
  kb("Export: the first sentence's Edit is reachable and Enter opens its answer with focus there", /v9-fix-go/.test(b1) && /ps-anchor/.test(b2), { b1, b2 });

  await seed(base("start"));
  await js(H + "q('.v7-path-reset').focus();"); await key("Enter"); await sleep(250); let c1 = await active();
  await js(H + "qa('.v7-warn .btn').find(b=>b.innerText==='Clear draft').focus();"); await key("Enter"); await sleep(400); let c2 = await active(); let lc2 = await live();
  await key("Enter"); await sleep(400); let c3 = await active(); let lc3 = await live();
  kb("Clear draft by keyboard: the warning takes focus, then Undo takes focus and is spoken, then Enter restores", /v7-warn|Cancel|Save a backup|Clear draft/.test(c1) && /#x-undo/.test(c2) && /Undo is available/.test(lc2) && lc3 === "Draft restored." && !/none|body/.test(c3), { c1, c2, lc2, c3, lc3 });

  await seed(base("contrib"));
  await js(H + "q('#v7-chg').click(); await w(200); qa('.v7-chg .v7-mini').find(b=>b.innerText==='Undecided').focus();");
  const d0 = await js("return document.getElementById('v7-chg-comp').value;");
  await key(" "); const d1 = await js("return [document.getElementById('v7-chg-comp').value, document.activeElement.getAttribute('aria-pressed')];");
  await key(" "); const d2 = await js("return [document.getElementById('v7-chg-comp').value, document.activeElement.getAttribute('aria-pressed')];");
  kb("Change panel: Space on Undecided empties the competition (pressed), Space again brings it back (not pressed)", d1[0] === "" && d1[1] === "true" && d2[0] === d0 && d2[1] === "false", { d0, d1, d2 });

  fs.writeFileSync(path.join(__dirname, "a11y-audit-latest.json"), JSON.stringify(report, null, 2));
  console.log("\nReport: ncv_tool_v9/a11y-audit-latest.json");
})().catch(e => { console.error(e); process.exitCode = 1; }).finally(() => {
  try { ws.close(); } catch (_) {} try { chrome.kill("SIGKILL"); } catch (_) {} try { server.close(); } catch (_) {}
  try { fs.rmSync(PROFILE, { recursive: true, force: true }); } catch (_) {}
});
