#!/usr/bin/env node
/**
 * Headless test of the V7 narrative CV tool (V7-35). No dependencies (Node 22+, Google Chrome).
 *   node ncv_tool_v7/test-v7.js
 * Serves the repo on a local port, drives narrative-cv-prototype-v7.html through headless Chrome over
 * the DevTools protocol and checks each flow: start page, profile, the card pattern, evidence,
 * mentorship, statement, review order, the At a glance links, every export, saving and reopening a
 * draft file, the V6 draft offer, step migrations, phone width, reduced motion, and that the page
 * makes no network request beyond its own files. All draft content in here is invented.
 */
"use strict";
const fs = require("fs"), os = require("os"), path = require("path"), http = require("http"), { spawn } = require("child_process");
const ROOT = path.join(__dirname, "..");
const CHROME = process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const CDP_PORT = 9351, PROFILE = fs.mkdtempSync(path.join(os.tmpdir(), "ncv-v7-test-"));
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png" };
let server, port, chrome, ws, nextId = 1;
const pending = new Map(), requests = [], consoleErrors = [];
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const send = (method, params) => new Promise((resolve, reject) => { const id = nextId++; pending.set(id, { resolve, reject }); ws.send(JSON.stringify({ id, method, params: params || {} })); });
async function js(expr) {
  const r = await send("Runtime.evaluate", { expression: "(async()=>{" + expr + "})()", awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error((r.exceptionDetails.exception && r.exceptionDetails.exception.description) || r.exceptionDetails.text);
  return r.result.value;
}
async function go(url) { await send("Page.navigate", { url }); await sleep(700); }
const PAGE = () => "http://127.0.0.1:" + port + "/narrative-cv-prototype-v7.html";
const HOME = () => "http://127.0.0.1:" + port + "/ncv_tool_v7/README.md";
let passed = 0, failed = 0;
function check(name, ok, detail) {
  if (ok) { passed++; console.log("  ok   " + name); }
  else { failed++; console.log("  FAIL " + name + (detail !== undefined ? "  → " + JSON.stringify(detail) : "")); }
}
// Helpers loaded into the page for each test.
const H = `const w=(ms)=>new Promise(r=>setTimeout(r,ms));
  const q=(s)=>document.querySelector(s), qa=(s)=>[...document.querySelectorAll(s)];
  const rail=(t)=>qa('.v7-ri').find(b=>b.innerText.split('\\n')[0]===t);
  const nav=(re)=>qa('.narrative-nav .btn').find(b=>re.test(b.innerText));
  const setv=(el,v)=>{el.value=v;el.dispatchEvent(new Event('input',{bubbles:true}));};
  const setsel=(el,v)=>{el.value=v;el.dispatchEvent(new Event('change',{bubbles:true}));};`;
async function seed(state, extra) {
  await go(HOME());
  await js("localStorage.clear();" + (state ? "localStorage.setItem('ncv-v7'," + JSON.stringify(JSON.stringify(state)) + ");" : "") + (extra || ""));
  await go(PAGE());
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
  ws.onmessage = (m) => {
    const msg = JSON.parse(m.data);
    if (msg.id && pending.has(msg.id)) { const p = pending.get(msg.id); pending.delete(msg.id); msg.error ? p.reject(new Error(msg.error.message)) : p.resolve(msg.result); return; }
    if (msg.method === "Network.requestWillBeSent") requests.push(msg.params.request.url);
    if (msg.method === "Runtime.exceptionThrown") consoleErrors.push(msg.params.exceptionDetails.text + " " + ((msg.params.exceptionDetails.exception || {}).description || ""));
    if (msg.method === "Runtime.consoleAPICalled" && msg.params.type === "error") consoleErrors.push(msg.params.args.map(a => a.value || a.description).join(" "));
  };
  await send("Page.enable"); await send("Runtime.enable"); await send("Network.enable");
  // Focus events fire in a headless tab only with focus emulation on.
  await send("Emulation.setFocusEmulationEnabled", { enabled: true });
  await send("Emulation.setDeviceMetricsOverride", { width: 1180, height: 900, deviceScaleFactor: 1, mobile: false });
  const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, "fixtures", "v6-draft.json"), "utf8"));

  console.log("Start page");
  await seed(null);
  let r = await js(H + "return {intro:!q('#v7-start-intro').hidden, cards:qa('.v7-path').length, title:q('.v7-path-new h3').innerText, load:q('.v7-path-cont h3').innerText, arrows:qa('.v7-path > .v7-arrow').length, done:qa('.v7-ri.is-done').length, caption:!!q('.v7-rail-cap')};");
  check("intro shows, two path cards", r.intro && r.cards === 2, r);
  check("cards read Start your draft and Load your draft, one arrow each", r.title === "Start your draft" && r.load === "Load your draft" && r.arrows === 2, r);
  check("rail empty, Draft caption shown", r.done === 0 && r.caption, r);

  console.log("Profile");
  r = await js(H + `q('.v7-path-new').click(); await w(150);
    const a={h:q('.narrative-stage-header h2').innerText, blocks:qa('.v7-qblock').length};
    q('#ag-frq').click(); await w(60); a.fb=q('.v7-feedback').innerText; a.stay=q('#ag-frq').getAttribute('aria-checked');
    a.b2=qa('.v7-qblock').length;
    setv(q('#v7-comp'),'Made-up Team Grants'); await w(60); a.b3=qa('.v7-qblock').length;
    q('#v7-year-' + (new Date().getFullYear()+1)).click(); await w(60);
    q('#st-mid').click(); await w(60); q('#di-health').click(); await w(60); q('#d2-none').click(); await w(60);
    q('#wm-team').click(); await w(60);
    a.count=q('.v7-qcount').innerText; a.next=!!nav(/Contributions/); a.folded=qa('.v7-ans').length;
    setv(q('#v7-comp'),''); await w(60); a.afterClear=qa('.v7-qblock').length; setv(q('#v7-comp'),'Made-up Team Grants'); await w(60);
    return a;`);
  check("one question at a time", r.blocks === 1 && r.b2 === 2 && r.b3 === 3, r);
  check("choice stays selected in place, format feedback", r.stay === "true" && /CV-FRQ/.test(r.fb), r);
  check("all six answered, Contributions button, nothing folds", r.count === "6 of 6 answered" && r.next && r.folded === 0, r);
  check("clearing an answer keeps the questions below it on screen", r.afterClear === 6, r.afterClear);

  console.log("Contributions: card pattern");
  r = await js(H + `nav(/Contributions/).click(); await w(150);
    const a={h:q('.narrative-stage-header h2').innerText, primary:q('.v7-ex-btn.is-primary').innerText.replace(/\\n/g,' '), exClosed:!q('#v7-exbox'), states:qa('.v7-card .v7-f').map(f=>f.className.split(' ')[1])};
    a.marks=qa('.v4-flag-btn').length; a.tailored=!!q('.v7-tailored .btn');
    const h=q('[data-f$="-title"] .v7-box'); h.focus(); setv(h,'Made-up headline about a clinic protocol');
    const s=q('[data-f$="-stakes"] .v7-box'); a.qClosed=q('[data-f$="-stakes"] .v7-q').offsetHeight>0; s.scrollIntoView({block:'center'}); await w(60); const y0=s.getBoundingClientRect().top; s.focus({preventScroll:true}); await w(700);
    a.lineMove=Math.round(s.getBoundingClientRect().top-y0); a.h0=s.offsetHeight;
    a.after=qa('.v7-card .v7-f').slice(0,2).map(f=>f.className.split(' ')[1]);
    a.qFilled=q('[data-f$="-title"] .v7-q').offsetHeight;
    const ta=q('[data-f$="-title"] .v7-ans'), y1=ta.getBoundingClientRect().top; q('[data-f$="-title"] .v7-box').focus({preventScroll:true}); await w(700);
    a.reopenMove=Math.round(q('[data-f$="-title"] .v7-box').getBoundingClientRect().top-y1); a.qReopen=q('[data-f$="-title"] .v7-q').offsetHeight>0;
    s.focus({preventScroll:true}); await w(700);
    a.header=q('.v7-card-t').innerText; a.count=q('.v7-card-side span').innerText;
    setv(s,'We think we helped many patients.'); await w(60);
    a.checks=q('[data-f$="-stakes"] .v7-f-checks').innerText;
    setv(s,'A made-up line.\\nA second.\\nA third.\\nA fourth.\\nA fifth.\\nA sixth.'); await w(60); a.h1=s.offsetHeight; setv(s,'We think we helped many patients.'); await w(60);
    const xb=q('.v7-ex-btn.is-primary'); xb.focus(); xb.click(); await w(60); a.exOpen=!!q('#v7-exbox'); a.exFocus=document.activeElement.id; q('.v7-switch').click(); a.built=q('#v7-exbox').classList.contains('built');
    return a;`);
  check("official heading, finished example is the primary control, closed on arrival", /Most significant/.test(r.h) && /See a finished example/.test(r.primary) && r.exClosed, r);
  check("arrives with the headline open and the rest one line", r.states[0] === "is-open" && r.states.slice(1).every(x => x === "is-empty"), r.states);
  check("no self-assessment marks; Tailored for has a Change button", r.marks === 0 && r.tailored, r);
  check("leaving a field shrinks it to its answer", r.after[0] === "is-filled" && r.after[1] === "is-open", r.after);
  check("closed fields show their question; the writing line holds still when the next field opens", r.qClosed && Math.abs(r.lineMove) <= 2, r);
  check("an answered field hides its question; reopening shows it and holds the line", r.qFilled === 0 && r.qReopen && Math.abs(r.reopenMove) <= 2, r);
  check("the open box starts at three lines and grows with the text", r.h0 < 100 && r.h1 > r.h0, r);
  check("header and counter build as you type", /Made-up headline/.test(r.header) && r.count === "1 of 9 answered", r);
  check("wording checks fire in the open field, with the suggestions note", /we|our/i.test(r.checks) && /suggestions/.test(r.checks), r.checks);
  check("example opens and See how it's built colours it", r.exOpen && r.built, r);
  check("focus stays on the example button after it opens", r.exFocus === "v7-ex-finished", r.exFocus);

  console.log("Contributions: evidence and a second card");
  r = await js(H + `q('.v7-ex-btn.is-primary').click(); await w(60);
    qa('.v7-ev-row button')[0].click(); await w(100);
    const a={top:q('.v7-strip.is-top b').innerText, kinds:qa('.v7-kind').length, pre:qa('.v7-kind[aria-checked=true]').length};
    qa('.v7-kind')[2].click(); await w(60); setv(q('[id^=evt]'),'Made-up provincial guideline, 2025.');
    q('.v7-strip.is-top button').click(); await w(80); a.row=q('.v7-ev-s').innerText;
    q('.v7-cards ~ .v7-add').click(); await w(150);
    a.folds=qa('.v7-fold').length; a.cards=qa('.v7-card').length; a.focus=document.activeElement.closest('.v7-f')?.dataset.f;
    setv(document.activeElement,'Second made-up contribution'); await w(60);
    q('.v7-cards ~ .v7-add').click(); await w(150);
    const st3=q('.v7-card [data-f$="-stakes"] .v7-box'); st3.focus(); setv(st3,'A made-up stakes-only card.'); await w(60);
    return a;`);
  check("evidence view: What you wrote on top, eight kinds, none pre-selected", r.top.toLowerCase() === "what you wrote" && r.kinds === 8 && r.pre === 0, r);
  check("evidence item saved with its letter", r.row === "1 item: a", r.row);
  check("Add a contribution folds the others and focuses the new headline", r.folds === 1 && r.cards === 1 && /-title$/.test(r.focus || ""), r);

  console.log("Mentorship");
  r = await js(H + `nav(/Mentorship/).click(); await w(150);
    const a={h:q('.narrative-stage-header h2').innerText, tot:q('#v7-tot-t').innerText};
    setv(q('#v7-t-phd'),'2'); setv(q('#v7-t-postdoc'),'1'); a.sum=q('.v7-dash .v7-counter').innerText;
    setsel(q('#v7-ps0'),'postdoc'); await w(60); setsel(q('#v7-pw0'),'government'); await w(60);
    a.labels=qa('.v7-card label').map(l=>l.innerText).slice(2,4);
    setv(q('#v7-pg0'),'A made-up ministry'); a.head=q('#v7-ph0').innerText;
    a.hm=qa('[data-f^="m-"]').map(f=>f.className.split(' ')[1]);
    return a;`);
  check("totals tiles keep the five-year wording (D-1) and add up", /five years/.test(r.tot) && r.sum === "3 in total", r);
  check("labels follow the sector; header builds", r.labels.join("|") === "Organization|Unit or subdivision" && /Postdoctoral → A made-up ministry/.test(r.head), r);
  check("How you mentor arrives with one field open (D-4)", r.hm[0] === "is-open", r.hm);

  console.log("Background and skills (CV-FRQ)");
  r = await js(H + `nav(/Background and skills/).click(); await w(150);
    const a={h:q('.narrative-stage-header h2').innerText, team:!!q('[data-f="ps-teamFit"]'), fit:q('[data-f="ps-programFit"] .v7-q').innerText};
    const role=q('#ps-anchor'); role.focus(); setv(role,'associate professor'); await w(40);
    const c=q('[data-f="ps-challenge"] .v7-box'); c.focus(); setv(c,'Why clinics drop the protocol.'); await w(40);
    const s=q('[data-f="ps-streams"] .v7-box'); s.focus(); setv(s,'Two strands carry it.'); await w(300);
    a.strip=q('.v7-strip p').innerText; a.next=nav(/Review your CV/)?.innerText;
    return a;`);
  check("CV-FRQ heading and the team question", /background and skills/.test(r.h) && r.team, r);
  check("Why this competition names the competition", /Made-up Team Grants/.test(r.fit), r.fit);
  check("statement strip joins the answers; button reads Review your CV", /^I am an associate professor at ___\. My work is in ___\. Why clinics drop the protocol\. Two strands carry it\.$/.test(r.strip) && r.next === "Review your CV →", r);

  console.log("Review");
  r = await js(H + `nav(/Review your CV/).click(); await w(150);
    const a={h:q('.narrative-stage-header h2').innerText, rail:qa('.v7-ri').map(b=>b.innerText.split('\\n')[0]), order:qa('.v7-ot').map(x=>x.innerText)};
    q('[id$="-dn"]:not([disabled])').click(); await w(150);
    a.after=qa('.v7-ot').map(x=>x.innerText); a.focusOk=/^mv-/.test(document.activeElement.id); a.first=q('.v7-draft-body b').innerText;
    a.missing=qa('.v7-glance a').length;
    const link=qa('.v7-glance a').find(x=>/What you did/.test(x.innerText)); a.link=link.innerText; link.click(); await w(300);
    a.jump={h:q('.narrative-stage-header h2').innerText, focus:document.activeElement.closest('.v7-f')?.dataset.f, open:q('.v7-f.is-open')?.dataset.f};
    return a;`);
  check("Order is part of Review, not the rail", r.rail.indexOf("Order of contributions") === -1 && r.rail.indexOf("Export") !== -1, r.rail);
  check("↑ ↓ reorder, the draft follows, focus stays on the moved card", r.after[0] === r.order[1] && r.first.indexOf(r.order[1]) !== -1 && r.focusOk, r);
  check("At a glance links open the right card and field with focus", r.missing > 0 && /Most significant/.test(r.jump.h) && r.jump.focus === r.jump.open && /-activities$/.test(r.jump.focus || ""), r);

  console.log("Export");
  r = await js(H + `rail('Export').click(); await w(150);
    const blobs=[], names=[]; const oc=URL.createObjectURL; URL.createObjectURL=(b)=>{blobs.push(b);return oc(b);};
    const ocl=HTMLAnchorElement.prototype.click; HTMLAnchorElement.prototype.click=function(){names.push(this.download);};
    const a={setup:q('.v7-setup-line').innerText, cards:qa('.v7-card .v7-h3').map(h=>h.innerText), nudge:q('.v7-nudge').innerText};
    q('.v7-actions .btn-primary').click(); await w(40);
    q('#v7-fmt-txt').click(); await w(60); q('.v7-actions .btn-primary').click(); await w(40);
    qa('.v7-card .btn').find(b=>b.innerText==='Save a draft file').click(); await w(40);
    HTMLAnchorElement.prototype.click=ocl; URL.createObjectURL=oc;
    a.names=names; a.doc=await blobs[0].text(); a.txt=await blobs[1].text(); a.file=await blobs[2].text();
    a.exportGreen=rail('Export').classList.contains('is-done');
    return a;`);
  check("Set up for line names the agency and font", /FRQ · CV-FRQ · 12-point Times New Roman/.test(r.setup), r.setup);
  check("three export cards", r.cards.join("|") === "Download or print|Paste into the template, one section at a time|Keep your work", r.cards);
  check("email nudge with the address printed as text", /impact@concordia\.ca about your experience/.test(r.nudge) && /Email us\s+impact@concordia\.ca/.test(r.nudge), r.nudge);
  check("downloads: Word, text and draft file", r.names[0] === "narrative-cv-draft-frq.doc" && r.names[1] === "narrative-cv-draft.txt" && /^narrative-cv-draft-frq-\d{4}-\d{2}-\d{2}\.json$/.test(r.names[2]), r.names);
  const psDoc = (r.doc.match(/<h2>The candidate's background and skills<\/h2>(.*?)<h2>/s) || [])[1] || "";
  check("Word file: the first line, then the statement as one paragraph (V7-34)", (psDoc.match(/<p>/g) || []).length === 2 && /Why clinics drop the protocol\. Two strands carry it\./.test(psDoc), psDoc);
  check("text file: the statement as one paragraph", /Why clinics drop the protocol\. Two strands carry it\./.test(r.txt), r.txt.slice(0, 500));
  check("a contribution with no headline still reaches the Word and text files", /A made-up stakes-only card\./.test(r.doc) && /A made-up stakes-only card\./.test(r.txt), "");
  const file = JSON.parse(r.file);
  check("draft file has its format, version and no team notes", file.format === "pathways-narrative-cv-draft" && file.version === 1 && !("teamNotes" in file.draft) && !("feedback" in file.draft), Object.keys(file.draft));
  check("Export turns green once something is downloaded", r.exportGreen, r);

  console.log("Draft file round trip");
  const fileText = r.file;
  r = await js(H + `localStorage.removeItem('ncv-v7'); window.confirm=()=>true; window.alert=(m)=>{window.__a=m;};
    const ic=HTMLInputElement.prototype.click;
    HTMLInputElement.prototype.click=function(){ if(this.type==='file'){const dt=new DataTransfer(); dt.items.add(new File([${JSON.stringify(fileText)}],'d.json',{type:'application/json'})); this.files=dt.files; this.dispatchEvent(new Event('change'));} };
    document.getElementById('v7-home').click(); await w(100); q('.v7-path-cont').click(); await w(300);
    HTMLInputElement.prototype.click=ic;
    const st=JSON.parse(localStorage.getItem('ncv-v7'));
    return {h:q('.narrative-stage-header h2').innerText, n:st.contributions.length, comp:st.lens.program, alert:window.__a||''};`);
  check("Continue draft reopens the file on its saved step", r.n === 3 && r.comp === "Made-up Team Grants" && /Export your draft/.test(r.h) && !r.alert, r);

  console.log("V6 draft and migrations");
  await seed(null, "localStorage.setItem('ncv-v6'," + JSON.stringify(JSON.stringify(fixture)) + ");");
  r = await js(H + `const a={offer:!!q('.v7-v6-offer')}; q('.v7-v6-offer .btn-primary').click(); await w(200);
    const st=JSON.parse(localStorage.getItem('ncv-v7'));
    a.h=q('.narrative-stage-header h2').innerText; a.mentees=st.mentees.map(m=>m.stageKind+'/'+m.stageOther);
    a.ev=st.contributions.map(c=>c.evidence.length); a.folded=st.contributions.map(c=>c.folded); a.cids=st.contributions.every(c=>!!c.cid);
    a.v6=localStorage.getItem('ncv-v6')===${JSON.stringify(JSON.stringify(fixture))};
    return a;`);
  check("V6 draft offered and opened; V6 copy unchanged", r.offer && r.v6, r);
  check("saved Order step opens on Review", /Review your CV/.test(r.h), r.h);
  check("trainee stages become choices; Other keeps the text", r.mentees.join(",") === "doctoral/,other/visiting researcher,masters/", r.mentees);
  check("blank evidence rows dropped; first card open, rest folded; stable ids", r.ev.join(",") === "1,0" && r.folded.join(",") === "false,true" && r.cids, r);
  for (const [k, want] of [["feedback", "Export your draft"], ["xray", "Most significant"]]) {
    await seed(Object.assign({}, fixture, { stageKey: k, mode: k === "xray" ? "xray" : "compose" }));
    const h = await js("return document.querySelector('.narrative-stage-header h2').innerText;");
    check("saved step " + k + " opens on " + want, h.indexOf(want) !== -1, h);
  }

  console.log("Phone width and reduced motion");
  await send("Emulation.setDeviceMetricsOverride", { width: 375, height: 812, deviceScaleFactor: 1, mobile: true });
  await seed(Object.assign({}, fixture, { stageKey: "contrib", mode: "compose" }));
  r = await js(H + `const out={}; for (const t of ['Set up your profile','Contributions','Mentorship','Personal statement','Review','Export']) { rail(t).click(); await w(120); out[t]=document.documentElement.scrollWidth; if (t==='Review') out.mv=Math.round(q('.v7-mv .btn')?.getBoundingClientRect().height||0); } rail('Contributions').click(); await w(100); out.reset=getComputedStyle(q('.v7-reset')).display; return out;`);
  check("no sideways scroll on any step at 375 px", ["Set up your profile", "Contributions", "Mentorship", "Personal statement", "Review", "Export"].every(k => r[k] <= 375), r);
  check("order buttons are at least 44 px (D-14); Reset beside Save (D-3)", r.mv >= 44 && r.reset !== "none", r);
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  r = await js("return getComputedStyle(document.querySelector('.v7-f')).transitionDuration;");
  check("reduced motion turns field transitions off", /^0s/.test(r), r);
  await send("Emulation.setEmulatedMedia", { features: [] });

  console.log("Network and errors");
  const foreign = requests.filter(u => !u.startsWith("http://127.0.0.1:" + port) && !u.startsWith("about:") && !u.startsWith("blob:") && !u.startsWith("data:"));
  check("no request leaves the device", foreign.length === 0, foreign);
  check("no console errors", consoleErrors.length === 0, consoleErrors);

  console.log("\n" + passed + " passed, " + failed + " failed");
  process.exitCode = failed ? 1 : 0;
})().catch(e => { console.error(e); process.exitCode = 1; }).finally(() => {
  try { ws.close(); } catch (_) {} try { chrome.kill("SIGKILL"); } catch (_) {} try { server.close(); } catch (_) {}
  try { fs.rmSync(PROFILE, { recursive: true, force: true }); } catch (_) {}
});
