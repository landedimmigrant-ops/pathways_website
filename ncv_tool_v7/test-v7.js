#!/usr/bin/env node
/**
 * Headless test of the V7 narrative CV tool (V7-35). No dependencies (Node 22+, Google Chrome).
 *   node ncv_tool_v7/test-v7.js
 * Serves the repo on a local port, drives narrative-cv-prototype-v7.html through headless Chrome over
 * the DevTools protocol and checks each flow: start page, profile, the card pattern, evidence,
 * mentorship, statement, review order, the At a glance links, the What your draft contains visuals,
 * the Change panel, the rail before and after Confirm profile, every export, saving and reopening a
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
  let r = await js(H + "return {intro:!q('#v7-start-intro').hidden, cards:qa('.v7-path').length, title:q('.v7-path-new h3').innerText, load:q('.v7-path-cont h3').innerText, arrows:qa('.v7-path > .v7-arrow').length, rail:!!q('.narrative-progress-panel')};");
  check("intro shows, two path cards", r.intro && r.cards === 2, r);
  check("cards read Start your draft and Load your draft, one arrow each", r.title === "Start your draft" && r.load === "Load your draft" && r.arrows === 2, r);
  check("no rail on the start page", !r.rail, r);

  console.log("Profile");
  r = await js(H + `q('.v7-path-new').click(); await w(150);
    const a={h:q('.narrative-stage-header h2').innerText, blocks:qa('.v7-qblock').length, railIn:!!q('.narrative-progress-panel.v7-rail-in'), done:qa('.v7-ri.is-done').length, caption:!!q('.v7-rail-cap'), rail:qa('.v7-ri').map(b=>b.innerText.split('\\n')[0]), groups:qa('.v7-rail-group').length, wc:!!q('.v7-rail-wc'), resetTop:!!q('#v4-reset'), resetRail:!!q('.v7-reset')};
    a.dots0=qa('.v7-qcount .v7-dots i').length; a.on0=qa('.v7-qcount .v7-dots i.on').length;
    q('#ag-frq').click(); await w(60); a.fb=q('.v7-feedback').innerText; a.stay=q('#ag-frq').getAttribute('aria-checked');
    a.b2=qa('.v7-qblock').length;
    setv(q('#v7-comp'),'Made-up Team Grants'); await w(60); a.b3=qa('.v7-qblock').length;
    q('#v7-year-' + (new Date().getFullYear()+1)).click(); await w(60);
    q('#st-mid').click(); await w(60); q('#di-health').click(); await w(60); q('#d2-none').click(); await w(60);
    q('#wm-team').click(); await w(60);
    a.count=q('.v7-qcount .v7-sr').textContent; a.dots=qa('.v7-qcount .v7-dots i').length; a.on=qa('.v7-qcount .v7-dots i.on').length; a.vis=q('.v7-qcount').innerText; a.next=!!nav(/Confirm profile/); a.nextC=!!nav(/Contributions/); a.folded=qa('.v7-ans').length;
    setv(q('#v7-comp'),''); await w(60); a.afterClear=qa('.v7-qblock').length; setv(q('#v7-comp'),'Made-up Team Grants'); await w(60);
    return a;`);
  check("rail fades in once Start is chosen, empty, and holds only Set up your profile before confirming", r.railIn && r.done === 0 && r.rail.join("|") === "Set up your profile" && r.groups === 0 && !r.caption && !r.wc, r);
  check("no Reset link in the top bar and no Reset button in the phone rail", !r.resetTop && !r.resetRail, r);
  check("Setup progress is squares: none filled at the start", r.dots0 === 6 && r.on0 === 0, r);
  check("one question at a time", r.blocks === 1 && r.b2 === 2 && r.b3 === 3, r);
  check("choice stays selected in place, format feedback", r.stay === "true" && /CV-FRQ/.test(r.fb), r);
  check("all six answered: Confirm profile button (no Contributions button), nothing folds", /^6 of 6 answered$/.test(r.count) && r.next && !r.nextC && r.folded === 0, r);
  check("progress squares: six, all filled, the count is hidden text only", r.dots === 6 && r.on === 6, r);
  check("clearing an answer keeps the questions below it on screen", r.afterClear === 6, r.afterClear);

  console.log("Contributions: card pattern");
  r = await js(H + `const sr0=getComputedStyle(q('.v7-qcount .v7-sr')).position; nav(/Confirm profile/).click(); await w(150);
    const a={sr0, h:q('.narrative-stage-header h2').innerText, kick:q('.v4-kicker').innerText, startline:q('.v7-startline')?.innerText, rail:qa('.v7-ri').map(b=>b.innerText.split('\\n')[0]), groups:qa('.v7-rail-group').map(x=>x.innerText.split('\\n')[0]), saved:JSON.parse(localStorage.getItem('ncv-v7')).profileConfirmed, back:getComputedStyle(qa('.narrative-nav .btn')[0]).visibility, primary:q('.v7-ex-btn.is-primary').innerText.replace(/\\n/g,' '), exArrive:!!q('#v7-exbox'), sw:!!q('.v7-switch'), tri:!!q('.v7-ex-btn.is-primary .v7-tri'), built:q('#v7-exbox')?.classList.contains('built'), swatches:qa('#v7-exbox .v7-exbox, #v7-exbox [class*=seg]').length, six:/six parts/.test(document.body.innerText), jobs:/six jobs/i.test(document.body.innerText), states:qa('.v7-card .v7-f').map(f=>f.className.split(' ')[1])};
    a.marks=qa('.v4-flag-btn').length; a.tailored=!!q('.v7-tailored .btn');
    const h=q('[data-f$="-title"] .v7-box'); h.focus(); setv(h,'Made-up headline about a clinic protocol');
    const s=q('[data-f$="-stakes"] .v7-box'); a.qClosed=q('[data-f$="-stakes"] .v7-q').offsetHeight>0; s.scrollIntoView({block:'center'}); await w(60); const y0=s.getBoundingClientRect().top; s.focus({preventScroll:true}); await w(700);
    a.lineMove=Math.round(s.getBoundingClientRect().top-y0); a.h0=s.offsetHeight;
    a.after=qa('.v7-card .v7-f').slice(0,2).map(f=>f.className.split(' ')[1]);
    a.qFilled=q('[data-f$="-title"] .v7-q').offsetHeight;
    const ta=q('[data-f$="-title"] .v7-ans'), y1=ta.getBoundingClientRect().top; q('[data-f$="-title"] .v7-box').focus({preventScroll:true}); await w(700);
    a.reopenMove=Math.round(q('[data-f$="-title"] .v7-box').getBoundingClientRect().top-y1); a.qReopen=q('[data-f$="-title"] .v7-q').offsetHeight>0;
    s.focus({preventScroll:true}); await w(700);
    a.header=q('.v7-card-t').innerText; a.count=q('.v7-card-side .v7-sr').textContent; a.cdots=qa('.v7-card-side .v7-dots i').length; a.con=qa('.v7-card-side .v7-dots i.on').length;
    setv(s,'We think we helped many patients.'); await w(60);
    a.checks=q('[data-f$="-stakes"] .v7-f-checks').innerText;
    setv(s,'A made-up line.\\nA second.\\nA third.\\nA fourth.\\nA fifth.\\nA sixth.'); await w(60); a.h1=s.offsetHeight; setv(s,'We think we helped many patients.'); await w(60);
    a.exStill=!!q('#v7-exbox'); let xb=q('.v7-ex-btn.is-primary'); if(q('#v7-exbox')){xb.click(); await w(60); a.exClosedBtn=!q('#v7-exbox'); xb=q('.v7-ex-btn.is-primary');} xb.focus(); xb.click(); await w(60); a.exOpen=!!q('#v7-exbox'); a.exFocus=document.activeElement.id; a.built2=q('#v7-exbox').classList.contains('built'); a.sw2=!!q('.v7-switch'); a.triOpen=getComputedStyle(q('.v7-ex-btn.is-primary .v7-tri')).transform;
    xb=q('.v7-ex-btn.is-primary'); xb.click(); await w(300);
    a.ghost=qa('.v7-ri.is-ghost').map(b=>b.innerText.split('\\n')[0]); a.cap=q('.v7-rail-cap')?.innerText;
    qa('.v7-ri').find(b=>/^Review/.test(b.innerText)).click(); await w(150); a.stayed=/Most significant/.test(q('.narrative-stage-header h2').innerText);
    const rl=q('[data-f$="-roleLine"] .v7-box'); rl.focus(); setv(rl,'I designed the protocol.'); await w(60);
    a.ghost3=qa('.v7-ri.is-ghost').length;
    const ou=q('[data-f$="-outputs"] .v7-box'); ou.focus(); setv(ou,'A made-up protocol and two papers.'); await w(400);
    a.ghostAfter=qa('.v7-ri.is-ghost').length; a.capAfter=!!q('.v7-rail-cap');
    return a;`);
  check("Confirm profile lands on Contributions under My narrative CV with the start line", /Most significant/.test(r.h) && r.kick === "MY NARRATIVE CV" && r.startline === "You start with your contributions." && r.saved === true && r.back === "hidden", r);
  check("rail after confirming: My narrative CV group (Contributions, Mentorship, the statement) and Draft group (Review, Export)", r.rail.length === 5 && r.rail[0] === "Contributions" && r.rail[1] === "Mentorship" && r.rail[3] === "Review" && r.rail[4] === "Export" && r.rail.indexOf("Set up your profile") === -1 && r.groups.join("|") === "MY NARRATIVE CV|DRAFT", r);
  check("finished example is the primary control and arrives open on an empty step, with a triangle", /See a finished example/.test(r.primary) && r.exArrive && r.tri, r);
  check("the See how it's built switch is gone; examples are always coloured", !r.sw && !r.sw2 && r.built === true && r.built2 === true && r.exClosedBtn === true && r.exStill === true, r);
  check("visible text says six parts, never six jobs", r.six && !r.jobs, r);
  check("the progress count is hidden text beside squares, not visible words", r.sr0 === "absolute", r.sr0);
  check("arrives with the headline open and the rest one line", r.states[0] === "is-open" && r.states.slice(1).every(x => x === "is-empty"), r.states);
  check("no self-assessment marks; the Profile bar has a Change button", r.marks === 0 && r.tailored, r);
  check("leaving a field shrinks it to its answer", r.after[0] === "is-filled" && r.after[1] === "is-open", r.after);
  check("closed fields show their question; the writing line holds still when the next field opens", r.qClosed && Math.abs(r.lineMove) <= 2, r);
  check("an answered field hides its question; reopening shows it and holds the line", r.qFilled === 0 && r.qReopen && Math.abs(r.reopenMove) <= 2, r);
  check("the open box starts at three lines and grows with the text", r.h0 < 100 && r.h1 > r.h0, r);
  check("Review and Export stay ghosted and closed below the minimum", r.ghost.join("|") === "Review|Export" && /headline, your role and two more/.test(r.cap || "") && r.stayed && r.ghost3 === 2, r);
  check("they open once one card has a headline, role and two job fields", r.ghostAfter === 0 && !r.capAfter, r);
  check("header and counter build as you type", /Made-up headline/.test(r.header) && r.count === "1 of 9 answered" && r.cdots === 9 && r.con === 1, r);
  check("wording checks fire in the open field, with the suggestions note", /we|our/i.test(r.checks) && /suggestions/.test(r.checks), r.checks);
  check("example reopens from its button, coloured", r.exOpen && r.built2, r);
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
    a.gvHead=q('#v7-gv-t')?.innerText; a.gv=qa('.v7-gv-box').map(f=>f.dataset.gv); a.gvDl=qa('.v7-gv-box .v7-gv-dl').map(b=>b.innerText);
    a.gvAria=qa('.v7-gv-box svg').map(s=>s.getAttribute('role')+'|'+s.getAttribute('aria-label')); a.gvText=q('.v7-gv')?.innerText||'';
    a.gvBelow=!!(q('.v7-draft-body') && q('#v7-gv-t') && (q('.v7-draft-body').compareDocumentPosition(q('#v7-gv-t')) & Node.DOCUMENT_POSITION_FOLLOWING));
    const gn=[], gt=[]; const oc2=URL.createObjectURL; URL.createObjectURL=(b)=>{gt.push(b.type);return oc2(b);};
    const ocl2=HTMLAnchorElement.prototype.click; HTMLAnchorElement.prototype.click=function(){gn.push(this.download);};
    q('.v7-gv-dl').click(); await w(500);
    HTMLAnchorElement.prototype.click=ocl2; URL.createObjectURL=oc2; a.gvNames=gn;
    const link=qa('.v7-glance a').find(x=>/What you did/.test(x.innerText)); a.link=link.innerText; link.click(); await w(300);
    a.jump={h:q('.narrative-stage-header h2').innerText, focus:document.activeElement.closest('.v7-f')?.dataset.f, open:q('.v7-f.is-open')?.dataset.f};
    return a;`);
  check("Order is part of Review, not the rail", r.rail.indexOf("Order of contributions") === -1 && r.rail.indexOf("Export") !== -1, r.rail);
  check("↑ ↓ reorder, the draft follows, focus stays on the moved card", r.after[0] === r.order[1] && r.first.indexOf(r.order[1]) !== -1 && r.focusOk, r);
  check("Review has a What your draft contains section below the draft, with a Download image button on each visual", r.gvHead === "What your draft contains" && r.gvBelow && r.gv.length >= 3 && r.gvDl.length === r.gv.length && r.gvDl.every(x => /Download image/.test(x)), r);
  check("visuals drawn from the draft: evidence, parts, trained and length; each an SVG image whose label carries numbers", r.gv.join(",") === "evidence,parts,trained,length" && r.gvAria.every(x => /^img\|.+\d/.test(x)) && /Policy \/ practice uptake 1/.test(r.gvAria[0]) && /Doctoral 2, Postdoctoral 1/.test(r.gvAria[2]), r.gvAria);
  check("the parts visual names contributions, and the word job does not appear in the section", /Contribution 3 has/.test(r.gvAria[1]) && !/\bjobs?\b/i.test(r.gvText + r.gvAria.join(" ")), r.gvAria[1]);
  check("Download image runs without a request (file name set)", /^narrative-cv-.+\.png$/.test(r.gvNames[0] || ""), r.gvNames);
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
  const fileText = r.file;
  r = await js(H + `rail('Export').click(); await w(150); const b=q('#v7-gv-all'); return {btn:b&&b.innerText, cls:!!q('.v7-gv-exp'), inCard:!!(b&&b.closest('.v7-card'))};`);
  check("Export has a Download all visuals button in its own section", r.btn === "Download all visuals" && r.cls && !r.inCard, r);

  console.log("Draft file round trip");
  r = await js(H + `localStorage.removeItem('ncv-v7'); window.confirm=()=>true; window.alert=(m)=>{window.__a=m;};
    const ic=HTMLInputElement.prototype.click;
    HTMLInputElement.prototype.click=function(){ if(this.type==='file'){const dt=new DataTransfer(); dt.items.add(new File([${JSON.stringify(fileText)}],'d.json',{type:'application/json'})); this.files=dt.files; this.dispatchEvent(new Event('change'));} };
    document.getElementById('v7-home').click(); await w(100); q('.v7-path-cont').click(); await w(300);
    HTMLInputElement.prototype.click=ic;
    const st=JSON.parse(localStorage.getItem('ncv-v7'));
    return {h:q('.narrative-stage-header h2').innerText, n:st.contributions.length, comp:st.lens.program, alert:window.__a||''};`);
  check("Load your draft reopens the file on its saved step", r.n === 3 && r.comp === "Made-up Team Grants" && /Export your draft/.test(r.h) && !r.alert, r);

  r = await js(H + `window.confirm=()=>true; document.getElementById('v7-home').click(); await w(150);
    const a={title:q('.v7-path-new h3').innerText, tag:q('.v7-path-new').tagName, btns:qa('.v7-path-new button').length, rs:!!q('.v7-path-reset')};
    q('.v7-path-reset').click(); await w(150);
    a.warn=q('.v7-path-new .v7-warn p, .v7-warn p')?.innerText; a.warnBtns=qa('.v7-warn .btn').map(b=>b.innerText);
    a.keptWhileWarned=(JSON.parse(localStorage.getItem('ncv-v7')||'{}').contributions||[]).some(c=>(c.title||'').trim());
    let cmsg=''; window.confirm=(m)=>{cmsg=m;return true;};
    qa('.v7-warn .btn').find(b=>/Clear my draft/.test(b.innerText)).click(); await w(250); a.cmsg=cmsg;
    a.after=q('.v7-path-new h3')?.innerText; a.noReset=!q('.v7-path-reset'); a.saved=(JSON.parse(localStorage.getItem('ncv-v7')||'{}').contributions||[]).some(c=>(c.title||'').trim());
    return a;`);
  check("a saved draft puts Continue and Reset draft in one card", r.title === "Continue your draft" && r.tag === "DIV" && r.btns === 2 && r.rs, r);
  check("Reset draft opens an inline warning first, Cancel and Clear my draft, and nothing is cleared yet", r.warn === "Reset your work in progress and start a new draft?" && r.warnBtns.join("|") === "Cancel|Clear my draft" && r.keptWhileWarned, r);
  check("Clear my draft asks window.confirm, then clears; the card reads Start your draft", /Are you sure/.test(r.cmsg) && r.after === "Start your draft" && r.noReset && !r.saved, r);

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
  // The V6 draft opens on Review; the fixture has data for four visuals.
  const gvs = await js("return [...document.querySelectorAll('.v7-gv-box')].map(f=>f.dataset.gv).join(',');");
  check("V6 draft: the visuals that have data, and no others", gvs === "evidence,parts,trained,length", gvs);

  check("trainee stages become choices; Other keeps the text", r.mentees.join(",") === "doctoral/,other/visiting researcher,masters/", r.mentees);
  check("blank evidence rows dropped; first card open, rest folded; stable ids", r.ev.join(",") === "1,0" && r.folded.join(",") === "false,true" && r.cids, r);
  for (const [k, want] of [["feedback", "Export your draft"], ["xray", "Most significant"]]) {
    await seed(Object.assign({}, fixture, { stageKey: k, mode: k === "xray" ? "xray" : "compose" }));
    const h = await js("return document.querySelector('.narrative-stage-header h2').innerText;");
    check("saved step " + k + " opens on " + want, h.indexOf(want) !== -1, h);
  }

  console.log("Confirmed profile: rail, metrics, Continue, Load, migration");
  await seed(Object.assign({}, fixture, { stageKey: "contrib", mode: "compose" }));
  r = await js(H + `const a={rail:qa('.v7-ri').map(b=>b.innerText.split('\\n')[0]), mt:qa('.v7-ri').map(b=>(b.querySelector('.v7-mt')||{}).innerText||''), sub:qa('.v7-rsub').map(x=>x.innerText.replace(/\\n/g,' ')),
      wc:(q('.v7-rail-wc')||{}).innerText, done:qa('.v7-ri.is-done').length, cur:qa('.v7-ri.is-active').map(b=>b.innerText.split('\\n')[0])};
    const cur=q('.v7-ri.is-active'); a.tri=getComputedStyle(cur.querySelector('.narrative-stage-dot')).borderLeftWidth; a.bold=parseInt(getComputedStyle(cur).fontWeight)>=600||parseInt(getComputedStyle(cur.querySelector('.v7-rl, span')||cur).fontWeight)>=600;
    a.doneOther=qa('.v7-ri.is-done:not(.is-active)').length; const dn=q('.v7-ri.is-done:not(.is-active) .narrative-stage-dot'); if(dn){const m=getComputedStyle(dn).backgroundColor.match(/\\d+/g).map(Number); a.green=m[1]>m[0]&&m[1]>m[2];}
    a.srWc=q('.v7-rail-wc .v7-sr')?.textContent||'';
    return a;`);
  check("rail metrics: a plain number beside Contributions and Mentorship, Evidence and People sub-rows", /^\d+$/.test(r.mt[0]) && /^\d+$/.test(r.mt[1]) && r.sub.some(x => /^Evidence \d+$/.test(x)) && r.sub.some(x => /^People \d+$/.test(x)), r);
  check("Draft group shows the word count and page range", /^[\d,]+ w/.test(r.wc || "") && /Draft so far: [\d,]+ words/.test(r.srWc), r);
  check("current step has a triangle and bold label; a finished step has a green circle", r.cur.join() === "Contributions" && r.tri === "10px" && r.bold && r.doneOther > 0 && r.green === true, r);

  // Pass D: rail connector under the circle's centre; a finished row is green throughout.
  r = await js(H + `const green=(c)=>{const m=c.match(/\\d+/g).map(Number); return m[1]>m[0]&&m[1]>m[2];};
    const a={subs:qa('.v7-rsub').map(s=>{const li=s.parentElement, d=li.querySelector('.narrative-stage-dot').getBoundingClientRect(), sr=s.getBoundingClientRect(), cs=getComputedStyle(s,'::before'); return {dx:Math.abs((sr.left+parseFloat(cs.left)+parseFloat(cs.borderLeftWidth)/2)-(d.left+d.width/2)), dy:Math.round(sr.top+parseFloat(cs.top)-d.bottom)};})};
    const dn=q('.v7-ri.is-done:not(.is-active)'); a.label=green(getComputedStyle(dn.querySelector('.v7-ri-l')).color); a.num=green(getComputedStyle(dn.querySelector('.v7-mt')).color);
    const ds=dn.parentElement.querySelector('.v7-rsub'); a.sub=ds?{l:green(getComputedStyle(ds).color), n:green(getComputedStyle(ds.querySelector('.v7-mt')).color), line:green(getComputedStyle(ds,'::before').borderLeftColor)}:null;
    const cs=q('.v7-ri.is-active').parentElement.querySelector('.v7-rsub'); a.curSubGreen=cs?green(getComputedStyle(cs).color):null;
    return a;`);
  check("rail L line starts under the centre of the step's circle (within 1 px), at its lower edge", r.subs.length >= 2 && r.subs.every(x => x.dx <= 1 && Math.abs(x.dy) <= 1), r);
  check("a finished step's row is green: label, number, and its sub-row label, number and line", r.label && r.num && r.sub && r.sub.l && r.sub.n && r.sub.line && r.curSubGreen === false, r);

  console.log("Pass D: example buttons, Profile bar, card column");
  r = await js(H + `window.scrollTo(0,0); const bg=(b)=>getComputedStyle(b).backgroundColor, white=(c)=>c==='rgb(255, 255, 255)';
    const a={}; if(q('#v7-exbox')){q('.v7-ex-btn[aria-expanded=true]').click(); await w(60);}
    a.rest=qa('.v7-ex-btn').map(b=>({exp:b.getAttribute('aria-expanded'), white:white(bg(b)), border:getComputedStyle(b).borderTopColor}));
    const p=q('.v7-ex-btn.is-primary'); a.pFont=parseFloat(getComputedStyle(p).fontSize)>parseFloat(getComputedStyle(qa('.v7-ex-btn')[1]).fontSize); a.pBold=parseInt(getComputedStyle(p).fontWeight)>=700; a.pColor=getComputedStyle(p).color;
    p.click(); await w(60); qa('.v7-ex-btn')[1].click(); await w(300);
    a.after=qa('.v7-ex-btn').map(b=>({exp:b.getAttribute('aria-expanded'), white:white(bg(b)), border:getComputedStyle(b).borderTopColor, tri:getComputedStyle(b.querySelector('.v7-tri')).transform}));
    a.prof=q('.v7-tailored-k').innerText; a.tailored=/Tailored for/.test(document.body.innerText);
    const ch=q('#v7-chg'), t=ch.querySelector('.v7-tri'); a.chg0={exp:ch.getAttribute('aria-expanded'), tri:getComputedStyle(t).transform, white:white(bg(ch))};
    ch.click(); await w(300); a.chg1={exp:ch.getAttribute('aria-expanded'), tri:getComputedStyle(ch.querySelector('.v7-tri')).transform, shade:bg(ch)};
    ch.click(); await w(300); a.chg2={exp:ch.getAttribute('aria-expanded'), tri:getComputedStyle(ch.querySelector('.v7-tri')).transform};
    return a;`);
  check("no example button has a fill at rest; the first is larger with a bold burgundy label", r.rest.every(x => x.exp === "false" && x.white) && r.pFont && r.pBold && r.pColor === "rgb(145, 35, 56)", r);
  check("opening a second example leaves only that one expanded, outlined and shaded, triangle down", r.after[0].exp === "false" && r.after[0].white && r.after[0].border !== "rgb(145, 35, 56)" && r.after[1].exp === "true" && !r.after[1].white && r.after[1].border === "rgb(145, 35, 56)" && /matrix\(0(\.0\d*)?, 1/.test(r.after[1].tri) && r.after[0].tri === "none", r);
  check("the bar reads Profile:, and Change carries a triangle that turns with aria-expanded, no fill at rest", r.prof === "Profile:" && !r.tailored && r.chg0.exp === "false" && r.chg0.tri === "none" && r.chg0.white && r.chg1.exp === "true" && /matrix\(0(\.0\d*)?, 1/.test(r.chg1.tri) && r.chg1.shade !== "rgb(255, 255, 255)" && r.chg2.exp === "false" && r.chg2.tri === "none", r);
  r = await js(H + `const card=q('.v7-card-col'), col=card.querySelector('nav.v7-fcol'), b=()=>qa('.v7-card-col .v7-fsq');
    const a={label:col.getAttribute('aria-label'), n:b().length, fields:card.querySelectorAll('.v7-f').length, on:b().filter(x=>x.classList.contains('is-on')).length, sr:card.querySelector('.v7-card-side .v7-sr').textContent, names:b().map(x=>x.getAttribute('aria-label'))};
    a.written=[...card.querySelectorAll('.v7-f')].filter(f=>f._has()).length + (/item/.test(card.querySelector('.v7-ev-s')?.innerText||'')?1:0);
    a.greenOk=b().filter(x=>x.classList.contains('is-on')&&!x.classList.contains('is-cur')).every(x=>getComputedStyle(x.querySelector('i')).backgroundColor==='rgb(42, 110, 42)');
    a.greyOk=b().filter(x=>!x.classList.contains('is-on')&&!x.classList.contains('is-cur')).every(x=>getComputedStyle(x.querySelector('i')).backgroundColor==='rgb(255, 255, 255)');
    const cr=col.getBoundingClientRect(), fr=card.querySelector('.v7-fields').getBoundingClientRect(); a.clear=cr.left>=fr.right; a.inCard=cr.right<=card.getBoundingClientRect().right;
    const tgt=b()[5]; tgt.click(); await w(700);
    a.open=q('.v7-f.is-open')?.dataset.f; a.want=tgt.dataset.for; a.focus=document.activeElement.id; a.cur=qa('.v7-card-col .v7-fsq[aria-current]').map(x=>x.dataset.for); a.tri=getComputedStyle(tgt.querySelector('i')).borderRightWidth; a.inView=(()=>{const r=q('.v7-f.is-open').getBoundingClientRect(); return r.top>=0&&r.top<innerHeight;})();
    window.scrollTo(0, card.getBoundingClientRect().top+scrollY+300); await w(100); a.sticky=Math.round(col.getBoundingClientRect().top)-q('.proto-banner').offsetHeight; a.pos=getComputedStyle(col).position;
    return a;`);
  check("desktop card column: a labelled nav with one button per field, named with its state; the spoken count stays", r.label === "Fields in contribution 1" && r.n === 9 && r.fields === 8 && /^Headline, (written|not written yet)$/.test(r.names[0]) && /^Evidence, /.test(r.names[8]) && /of 9 answered/.test(r.sr), r);
  check("green squares match the written fields; unwritten squares are grey outlines; the column sits clear of the writing", r.on === r.written && r.greenOk && r.greyOk && r.clear && r.inCard, r);
  check("clicking a square opens and focuses that field; it shows the triangle and aria-current", r.open === r.want && r.focus === r.want && r.cur.join() === r.want && r.tri === "10px" && r.inView, r);
  check("the column is sticky below the top bar while the card is on screen", r.pos === "sticky" && r.sticky >= 0 && r.sticky <= 24, r);
  r = await js(H + `rail('Mentorship').click(); await w(150); const m=q('.v7-card-col nav')?.getAttribute('aria-label'), mn=qa('.v7-card-col .v7-fsq').length, mc=qa('.v7-card-col .v7-fsq[aria-current]').length;
    rail('Personal statement').click(); await w(150); const p=q('.v7-card-col nav')?.getAttribute('aria-label'), pn=qa('.v7-card-col .v7-fsq').length;
    rail('Contributions').click(); await w(150); return {m, mn, mc, p, pn};`);
  check("How you mentor and Your statement carry the same column", r.m === "Fields in How you mentor" && r.mn === 3 && r.mc === 1 && r.p === "Fields in Your statement" && r.pn >= 7, r);

  // Continue and Load land on Contributions for a confirmed profile (no saved application step).
  await seed(Object.assign({}, fixture, { stageKey: "setup", mode: "compose" }));
  r = await js(H + `const a={conf:JSON.parse(localStorage.getItem('ncv-v7')).profileConfirmed, h0:q('.narrative-stage-header h2')?.innerText, rail:qa('.v7-ri').map(b=>b.innerText.split('\\n')[0]).length};
    document.getElementById('v7-home').click(); await w(150); a.card=q('.v7-path-new h3').innerText; a.welcome=!!q('.v7-welcome, .v7-back-banner');
    q('.v7-path-go').click(); await w(200); a.h=q('.narrative-stage-header h2').innerText; return a;`);
  check("an old draft with application content migrates to a confirmed profile, rail shows the application", r.conf === true && /Most significant/.test(r.h0) && r.rail === 5, r);
  check("Continue resumes to Contributions for a confirmed profile", r.card === "Continue your draft" && /Most significant/.test(r.h), r);
  const loadFile = JSON.stringify({ format: "pathways-narrative-cv-draft", version: 1, draft: Object.assign({}, fixture, { profileConfirmed: true, stageKey: "setup", mode: "compose" }) });
  r = await js(H + `localStorage.removeItem('ncv-v7'); window.confirm=()=>true; window.alert=(m)=>{window.__a=m;};
    document.getElementById('v7-home').click(); await w(100);
    const ic=HTMLInputElement.prototype.click;
    HTMLInputElement.prototype.click=function(){ if(this.type==='file'){const dt=new DataTransfer(); dt.items.add(new File([${JSON.stringify(loadFile)}],'d.json',{type:'application/json'})); this.files=dt.files; this.dispatchEvent(new Event('change'));} };
    q('.v7-path-cont').click(); await w(300); HTMLInputElement.prototype.click=ic;
    return {h:q('.narrative-stage-header h2').innerText, alert:window.__a||''};`);
  check("Load your draft resumes to Contributions for a confirmed profile", /Most significant/.test(r.h) && !r.alert, r);
  await seed({ mode: "compose", stageKey: "contrib", profileConfirmed: false, lens: { agency: "sshrc" }, contributions: [{ title: "x" }] });
  r = await js(H + "return {h:q('.narrative-stage-header h2')?.innerText, rail:qa('.v7-ri').map(b=>b.innerText.split('\\n')[0]).join('|')};");
  check("an unconfirmed profile is kept on Set up your profile, even with application content", /Set up your profile/.test(r.h) && r.rail === "Set up your profile", r);

  console.log("Change panel");
  await seed(Object.assign({}, fixture, { stageKey: "contrib", mode: "compose" }));
  r = await js(H + `const agency=()=>JSON.parse(localStorage.getItem('ncv-v7')).lens.agency; const a={ag0:agency()};
    const ch=q('#v7-chg'); a.exp0=ch.getAttribute('aria-expanded'); a.ctl=ch.getAttribute('aria-controls'); ch.click(); await w(100);
    a.exp1=ch.getAttribute('aria-expanded'); a.panel=!!q('#v7-chg-panel'); a.focusIn=q('#v7-chg-panel').contains(document.activeElement);
    a.ids=['ag','st','di','d2','yr'].map(k=>!!q('#v7-chg-'+k)); a.comp=!!q('#v7-chg-comp'); a.pills=qa('#v7-chg-panel [aria-pressed]').length;
    const other=[...q('#v7-chg-ag').options].map(o=>o.value).find(v=>v&&v!==a.ag0&&v!=='other'); a.other=other;
    setsel(q('#v7-chg-ag'),other); await w(50); a.stillSaved=agency()===a.ag0;
    document.activeElement.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true})); await w(100);
    a.esc={panel:!!q('#v7-chg-panel'), focus:document.activeElement.id, ag:agency(), exp:q('#v7-chg').getAttribute('aria-expanded')};
    q('#v7-chg').click(); await w(100); setsel(q('#v7-chg-ag'),other); await w(50);
    qa('#v7-chg-panel .btn').find(b=>b.innerText==='Confirm').click(); await w(200);
    a.ok={panel:!!q('#v7-chg-panel'), focus:document.activeElement.id, ag:agency(), pills:q('.v7-tailored-pills').innerText};
    q('#v7-chg').click(); await w(100); qa('#v7-chg-panel .btn').find(b=>b.innerText==='Reset draft').click(); await w(100);
    a.warn=q('#v7-chg-panel .v7-warn p')?.innerText; a.warnBtns=qa('#v7-chg-panel .v7-warn .btn').map(b=>b.innerText); a.kept=JSON.parse(localStorage.getItem('ncv-v7')).contributions.length>0;
    qa('#v7-chg-panel .v7-warn .btn').find(b=>b.innerText==='Cancel').click(); await w(100); a.warnGone=!q('.v7-warn'); a.kept2=JSON.parse(localStorage.getItem('ncv-v7')).contributions.length>0;
    return a;`);
  check("Change is a disclosure: aria-expanded flips, it controls the panel, and focus moves in", r.exp0 === "false" && r.exp1 === "true" && r.ctl === "v7-chg-panel" && r.panel && r.focusIn, r);
  check("the panel holds the six answers: agency, stage, field, second field, year, competition, work-mode pills", r.ids.every(Boolean) && r.comp && r.pills >= 4, r);
  check("Escape discards the edit, closes the panel and returns focus to Change", r.stillSaved && !r.esc.panel && r.esc.focus === "v7-chg" && r.esc.ag === r.ag0 && r.esc.exp === "false", r);
  check("Confirm applies the new answers, closes the panel and returns focus to Change", !r.ok.panel && r.ok.focus === "v7-chg" && r.ok.ag === r.other && r.ok.ag !== r.ag0, r);
  check("Reset draft inside the panel shows a warning with Cancel and Clear my draft; Cancel keeps the work", /^Reset your work in progress\?$/.test(r.warn || "") && r.warnBtns.indexOf("Cancel") !== -1 && r.kept && r.warnGone && r.kept2, r);


  console.log("Phone width and reduced motion");
  await send("Emulation.setDeviceMetricsOverride", { width: 375, height: 812, deviceScaleFactor: 1, mobile: true });
  await seed(Object.assign({}, fixture, { stageKey: "contrib", mode: "compose" }));
  r = await js(H + `const out={}; const names=qa('.v7-ri').map(b=>b.innerText.split('\\n')[0]); out.names=names; for (const t of names) { rail(t).click(); await w(120); out[t]=document.documentElement.scrollWidth; if (t==='Review') out.mv=Math.round(q('.v7-mv .btn')?.getBoundingClientRect().height||0); } rail('Contributions').click(); await w(100); out.reset=!!q('.v7-reset'); out.setup=names.indexOf('Set up your profile'); return out;`);
  check("no sideways scroll on any step at 375 px", r.names.length === 5 && r.names.every(k => r[k] <= 375), r);
  check("order buttons are at least 44 px (D-14); the phone rail has no Reset and no Set up your profile after confirming", r.mv >= 44 && !r.reset && r.setup === -1, r);
  r = await js(H + `rail('Contributions').click(); await w(100); window.scrollTo(0,0); q('#v7-chg').click(); await w(150); const o={sw:document.documentElement.scrollWidth, open:!!q('#v7-chg-panel'), right:Math.round(q('#v7-chg-panel').getBoundingClientRect().right)}; q('#v7-chg').click(); await w(60); return o;`);
  check("no sideways scroll at 375 px with the Change panel open", r.open && r.sw <= 375 && r.right <= 375, r);
  r = await js(H + `rail('Contributions').click(); await w(150); const card=q('.v7-card-col'), h=card.querySelector('.v7-card-h');
    window.scrollTo(0, card.getBoundingClientRect().top+scrollY+300); await w(150);
    return {col:getComputedStyle(card.querySelector('.v7-fcol')).display, pos:getComputedStyle(h).position, top:Math.round(h.getBoundingClientRect().top), bar:q('.proto-banner').offsetHeight, dots:h.querySelectorAll('.v7-dots i').length, sw:document.documentElement.scrollWidth, right:Math.round(h.getBoundingClientRect().right)};`);
  check("phone: the card header row (title and squares) sticks under the top bar, no column, no sideways scroll", r.col === "none" && r.pos === "sticky" && Math.abs(r.top - r.bar) <= 1 && r.dots === 9 && r.sw <= 375 && r.right <= 375, r);
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
