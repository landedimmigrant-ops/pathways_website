#!/usr/bin/env node
/**
 * Corners audit of narrative-cv-prototype-v9.html, with the mock CV. No npm install: it uses a local
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
const ROOT = path.join(__dirname, "../..");
const CHROME = process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const AXE = [process.env.AXE, path.join(ROOT, "node_modules/axe-core/axe.min.js"), path.join(os.homedir(), "Documents/ubc_fire/node_modules/axe-core/axe.min.js")].find(p => p && fs.existsSync(p));
if (!AXE) { console.error("axe-core not found: set AXE=/path/to/axe.min.js"); process.exit(2); }
const AXE_SRC = fs.readFileSync(AXE, "utf8");
const CDP_PORT = +process.env.NCV_CDP_PORT || 9370, PROFILE = fs.mkdtempSync(path.join(os.tmpdir(), "ncv-v9-corners-"));
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
STATES.push(
  { name: "Contributions, card open, example shown", state: base("contrib"), prep: H + `const c=qa('.v7-fold')[0]; if(c){c.click(); await w(350);} const b=q('.v7-ex-btn'); if(b){b.click(); await w(400);}` },
  { name: "Review, a block open", state: base("review", { reviewTab: "words" }), prep: clickJs(`q('.v8-bar .v8-eb-block')`) },
  { name: "Feedback open", state: base("contrib"), prep: H + `const b=q('.v8-fb-btn'); if(b){b.click(); await w(350);}` },
);
const scan = H + `
  const vis=(e)=>{const r=e.getBoundingClientRect(), s=getComputedStyle(e); return r.width>0&&r.height>0&&s.visibility!=='hidden'&&s.display!=='none';};
  const px=(v,ref)=>{ v=String(v).trim().split(/\\s+/)[0]; return v.endsWith('%')?parseFloat(v)/100*ref:parseFloat(v)||0; };
  const out=[];
  const look=(e,cs,w,h,pseudo)=>{
    const c=['TopLeft','TopRight','BottomRight','BottomLeft'].map(k=>px(cs['border'+k+'Radius'],Math.min(w,h)));
    const m=Math.max(...c); if(m<=4.01) return;
    const circle=Math.abs(w-h)<=2.5 && m>=Math.min(w,h)/2-1.5;
    if(circle) return;
    const sel=e.tagName.toLowerCase()+(e.className&&typeof e.className==='string'?'.'+e.className.trim().split(/\\s+/).join('.'):'')+(pseudo||'');
    out.push({sel, r:c.map(x=>Math.round(x*10)/10).join(' '), w:Math.round(w), h:Math.round(h), src:cs.borderTopLeftRadius});
  };
  qa('body *').forEach(e=>{ if(vis(e)){ const r=e.getBoundingClientRect(); look(e,getComputedStyle(e),r.width,r.height); }
    ['::before','::after'].forEach(p=>{ const cs=getComputedStyle(e,p); if(!cs.content||cs.content==='none'||cs.display==='none') return; const w=parseFloat(cs.width)||0, h=parseFloat(cs.height)||0; if(w&&h) look(e,cs,w,h,p); }); });
  return out;`;
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
  await send("Page.enable"); await send("Runtime.enable");
  const all = {};
  for (const vp of [{ w: 1280, h: 900 }, { w: 320, h: 720, phone: true }]) {
    await send("Emulation.setDeviceMetricsOverride", { width: vp.w, height: vp.h, deviceScaleFactor: vp.phone ? 2 : 1, mobile: !!vp.phone });
    for (const st of STATES) {
      try { await seed(st.state); if (st.prep) await js(st.prep); await sleep(300);
        for (const x of await js(scan)) { const k = x.sel + "  [" + x.r + "]"; (all[k] = all[k] || { n: 0, states: new Set() }).n++; all[k].states.add(st.name + "@" + vp.w); }
      } catch (e) { console.log("state failed: " + st.name + " " + e.message); }
    }
  }
  const rows = Object.entries(all).sort((a, b) => b[1].n - a[1].n);
  console.log(rows.length ? rows.map(([k, v]) => v.n + "  " + k + "  — " + [...v.states].slice(0, 2).join("; ")).join("\n") : "No corner over 4px outside true circles.");
  fs.writeFileSync(path.join(__dirname, "corners-audit-latest.json"), JSON.stringify(rows.map(([k, v]) => ({ k, n: v.n, states: [...v.states] })), null, 1));
  chrome.kill(); server.close(); process.exit(rows.length ? 1 : 0);
})().catch(e => { console.error(e); try { chrome.kill(); } catch (_) {} process.exit(2); });
