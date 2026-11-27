#!/usr/bin/env node
/**
 * Headless test of the V7 narrative CV tool (V7-35). No dependencies (Node 22+, Google Chrome).
 *   node ncv_tool_v9/test-v9.js
 * Serves the repo on a local port, drives narrative-cv-prototype-v9.html through headless Chrome over
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
const CDP_PORT = +process.env.NCV_CDP_PORT || 9351, PROFILE = fs.mkdtempSync(path.join(os.tmpdir(), "ncv-v9-test-"));
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png" };
let server, port, chrome, ws, nextId = 1;
// The tester endpoint the Worker serves in production, answered here: "ok" or "fail" (500).
const apiPosts = []; let apiMode = "ok";
const pending = new Map(), requests = [], consoleErrors = [];
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const send = (method, params) => new Promise((resolve, reject) => { const id = nextId++; pending.set(id, { resolve, reject }); ws.send(JSON.stringify({ id, method, params: params || {} })); });
async function js(expr) {
  const r = await send("Runtime.evaluate", { expression: "(async()=>{" + expr + "})()", awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error((r.exceptionDetails.exception && r.exceptionDetails.exception.description) || r.exceptionDetails.text);
  return r.result.value;
}
async function go(url) { await send("Page.navigate", { url }); await sleep(700); }
const PAGE = () => "http://127.0.0.1:" + port + "/narrative-cv-prototype-v9.html";
const HOME = () => "http://127.0.0.1:" + port + "/ncv_tool_v9/README.md";
let passed = 0, failed = 0;
function check(name, ok, detail) {
  if (ok) { passed++; console.log("  ok   " + name); }
  else { failed++; console.log("  FAIL " + name + (detail !== undefined ? "  → " + JSON.stringify(detail) : "")); }
}
// Helpers loaded into the page for each test.
const H = `const w=(ms)=>new Promise(r=>setTimeout(r,ms));
  const q=(s)=>document.querySelector(s), qa=(s)=>[...document.querySelectorAll(s)];
  const rail=(t)=>{const tg=q('#v7-rail-toggle'); if(tg&&getComputedStyle(tg).display!=='none'&&tg.getAttribute('aria-expanded')==='false') tg.click(); return qa('.v7-ri').find(b=>b.innerText.split('\\n')[0]===t);};
  const nav=(re)=>qa('.narrative-nav .btn').find(b=>re.test(b.innerText));
  const setv=(el,v)=>{el.value=v;el.dispatchEvent(new Event('input',{bubbles:true}));};
  const setsel=(el,v)=>{el.value=v;el.dispatchEvent(new Event('change',{bubbles:true}));};
  const okWarn=async()=>{const b=qa('.v7-warn .btn-primary')[0]; if(b){b.click(); await w(200);} };`;
// R11 (V9): Review and Export open only with one complete contribution. A seeded draft with none gets one
// complete contribution at the end, unless the test is about the lock itself ({ raw: true }).
const DONE = (cid) => ({ cid: cid || "cdone", title: "Made-up complete contribution", stakes: "Made-up towns had no flood records.", roleMode: "", roleLine: "I led the survey.",
    activities: "We surveyed six made-up towns.", outputs: "A made-up flood atlas.", outcomes: "Two made-up towns used the atlas.", impact: "It could guide flood planning in the region.",
    translational: "", evidence: [{ text: "Made-up atlas, 2024.", type: "Dataset or tool", note: "" }], flags: {}, notes: {} });
const hasText = (v) => /[\p{L}\p{N}]/u.test(v || "");
const isComplete = (c) => !c.later && ["title", "stakes", "roleLine", "activities", "outputs", "impact"].every(k => hasText(c[k])) && (hasText(c.outcomes) || c.noImpactYet === true) && ((c.evidence || []).some(e => hasText(e.text)) || c.noEvidenceYet === true);
async function seed(state, extra, opts) {
  if (state && !(opts && opts.raw) && Array.isArray(state.contributions) && state.contributions.length && !state.contributions.some(isComplete))
    state = Object.assign({}, state, { contributions: state.contributions.concat([DONE("cauto")]) });
  await go(HOME());
  await js("localStorage.clear();" + (state ? "localStorage.setItem('ncv-v9'," + JSON.stringify(JSON.stringify(state)) + ");" : "") + (extra || ""));
  await go(PAGE());
}
(async () => {
  server = http.createServer((req, res) => {
    if (req.url.split("?")[0] === "/api/tester") {
      let body = ""; req.on("data", d => body += d);
      req.on("end", () => { try { apiPosts.push(JSON.parse(body)); } catch (_) { apiPosts.push({ bad: body }); }
        res.writeHead(apiMode === "ok" ? 200 : 500, { "Content-Type": "application/json" }); res.end(apiMode === "ok" ? '{"ok":true}' : '{"error":"server"}'); });
      return;
    }
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
  const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "ncv_tool_v7", "fixtures", "v6-draft.json"), "utf8"));

  // R11 (V9): Review opens only with one complete contribution, so the fixture's first one gets the two parts it lacks
  // (in memory; the V7 fixture file is frozen).
  Object.assign(fixture.contributions[0], { outcomes: "Three made-up towns adopted the toolkit in 2024.", impact: "It could reduce flood damage in small towns." });

  console.log("Start page");
  await seed(null);
  let r = await js(H + "return {intro:!q('#v7-start-intro').hidden, cards:qa('.v7-path').length, title:q('.v7-path-new h2').innerText, load:q('.v7-path-cont h2').innerText, arrows:qa('.v7-path > .v7-arrow').length, rail:!!q('.narrative-progress-panel')};");
  check("intro shows, two path cards", r.intro && r.cards === 2, r);
  check("cards read Start your draft and Open a backup file, one arrow each (S9)", r.title === "Start your draft" && r.load === "Open a backup file" && r.arrows === 2, r);
  r = await js(H + "return {sub:q('.proto-subtitle').innerText, intro:qa('#v7-start-intro .v7-intro').map(p=>p.innerText), guide:q('#v4-guide-top').innerText, priv:q('.v4-privacy-full').innerText, newP:q('.v7-path-new p').innerText, loadP:q('.v7-path-cont p')?.innerText || '', loadH:q('.v7-path-cont h2').innerText};");
  check("S1-S5, S9: the Start page wording is the decided text", r.sub === "A drafting tool for your Tri-agency CV or CV-FRQ."
    && r.intro[0] === "Write your contributions, mentorship and personal statement in your own words. A first draft can take a day or more, so please start well before your deadline. English only for now."
    && r.intro[1] === "It is recommended that you take the time to read the narrative CV guide." && r.guide === "narrative CV guide"
    && r.priv.trim() === "This tool uses no AI and works offline on your computer. Clearing your browser data erases your draft. To keep working later, please save a backup file from Export and open it here."
    && r.newP === "You will answer a series of questions that take you through each component of a narrative CV and organize your work for the funding opportunity you are applying to. Your responses will be assembled as a draft you can review and export."
    && r.loadP === "" && r.loadH === "Open a backup file", r);
  check("no rail on the start page", !r.rail, r);

  console.log("Profile");
  r = await js(H + `q('.v7-path-new').click(); await w(150);
    const a={h:q('.narrative-stage-header h2').innerText, blocks:qa('.v7-qblock').length, railIn:!!q('.narrative-progress-panel.v7-rail-in'), done:qa('.v7-ri.is-done').length, caption:!!q('.v7-rail-cap'), rail:qa('.v7-ri').map(b=>b.innerText.split('\\n')[0]), groups:qa('.v7-rail-group').length, wc:!!q('.v7-rail-wc'), resetTop:!!q('#v4-reset'), resetRail:!!q('.v7-reset')};
    a.dots0=qa('.v7-qcount .v7-dots i').length; a.on0=qa('.v7-qcount .v7-dots i.on').length;
    const sq0=qa('.v7-prof-col nav.v7-fcol .v7-fsq'); a.col0={label:q('.v7-prof-col nav.v7-fcol')?.getAttribute('aria-label'), n:sq0.length, dis:sq0.filter(b=>b.disabled&&b.getAttribute('aria-disabled')==='true').map(b=>b.dataset.for), cur:qa('.v7-prof-col .v7-fsq[aria-current]').map(b=>b.dataset.for), tri:getComputedStyle(sq0[0].querySelector('i')).borderRightWidth, rowVis:getComputedStyle(q('.v7-qcount .v7-dots')).display, name0:sq0[0].getAttribute('aria-label'), name5:sq0[5].getAttribute('aria-label')};
    sq0[3].click(); await w(80); a.col0.lockedClick=qa('.v7-qblock').length;
    window.scrollTo(0,0); q('#ag-frq').click(); await w(500); a.fb=q('.v7-feedback').innerText; a.stay=q('#ag-frq').getAttribute('aria-checked');
    a.b2=qa('.v7-qblock').length;
    { const sq=q('.v7-prof-col .v7-fsq[data-for="pq-1"]'), bk=q('.v7-qblock[data-pq="1"]'); a.lvl={y:Math.round(scrollY), d:Math.round(bk.getBoundingClientRect().top-sq.getBoundingClientRect().top), cur:q('.v7-prof-col .v7-fsq.is-cur')?.dataset.for}; }
    setv(q('#v7-comp'),'Made-up Team Grants'); await w(60); a.b3=qa('.v7-qblock').length;
    q('#v7-year-' + (new Date().getFullYear()+1)).click(); await w(60);
    q('#st-mid').click(); await w(60); q('#di-health').click(); await w(60); q('#d2-none').click(); await w(60);
    q('#wm-team').click(); await w(60);
    a.count=q('.v7-qcount .v7-prog-n').textContent; a.dots=qa('.v7-qcount .v7-dots i').length; a.on=qa('.v7-qcount .v7-dots i.on').length; a.vis=q('.v7-qcount').innerText; a.next=!!nav(/Confirm profile/); a.nextC=!!nav(/Contributions/); a.folded=qa('.v7-ans').length;
    setv(q('#v7-comp'),''); await w(60); a.afterClear=qa('.v7-qblock').length; setv(q('#v7-comp'),'Made-up Team Grants'); await w(60);
    return a;`);
  check("rail fades in once Start is chosen, empty, and holds only Set up your profile before confirming", r.railIn && r.done === 0 && r.rail.join("|") === "Set up your profile" && r.groups === 0 && !r.caption && !r.wc, r);
  check("no Reset link in the top bar and no Reset button in the phone rail", !r.resetTop && !r.resetRail, r);
  check("Setup progress is squares: none filled at the start", r.dots0 === 6 && r.on0 === 0, r);
  check("desktop Setup column: a labelled nav with six squares, the top row hidden, triangle and aria-current on the first question", r.col0.label === "Questions in your profile" && r.col0.n === 6 && r.col0.cur.join() === "pq-0" && r.col0.tri === "10px" && r.col0.rowVis === "none" && /, not answered yet$/.test(r.col0.name0), r.col0);
  check("unrevealed questions are grey, disabled and aria-disabled, and clicking one does nothing", r.col0.dis.join() === "pq-1,pq-2,pq-3,pq-4,pq-5" && /, not open yet$/.test(r.col0.name5) && r.col0.lockedClick === 1, r.col0);
  check("one question at a time", r.blocks === 1 && r.b2 === 2 && r.b3 === 3, r);
  check("choice stays selected in place, format feedback", r.stay === "true" && /CV-FRQ/.test(r.fb), r);
  check("after an answer the next question scrolls into view; its square sits beside it and carries the triangle (V8.8)", r.lvl.y > 0 && r.lvl.d <= 0 && r.lvl.d >= -30 && r.lvl.cur === "pq-1", r.lvl);
  check("all six answered: Confirm profile button (no Contributions button), nothing folds", /^6 of 6 answered$/.test(r.count) && r.next && !r.nextC && r.folded === 0, r);
  check("progress squares: six, all filled, the count is hidden text only", r.dots === 6 && r.on === 6, r);
  check("clearing an answer keeps the questions below it on screen", r.afterClear === 6, r.afterClear);
  r = await js(H + `setv(q('#v7-comp'),''); await w(80); const b=()=>qa('.v7-prof-col .v7-fsq');
    const a={n:b().length, dis:b().filter(x=>x.disabled).length, on:b().filter(x=>x.classList.contains('is-on')).length, sr:q('.v7-qcount .v7-prog-n').textContent, cur:qa('.v7-prof-col .v7-fsq[aria-current]').map(x=>x.dataset.for), curBlk:q('.v7-qblock.is-current')?.dataset.pq, tri:getComputedStyle(q('.v7-prof-col .v7-fsq.is-cur i')).borderRightWidth};
    a.greenOk=b().filter(x=>x.classList.contains('is-on')&&!x.classList.contains('is-cur')).every(x=>getComputedStyle(x.querySelector('i')).backgroundColor==='rgb(42, 110, 42)');
    const col=q('.v7-prof-col nav.v7-fcol'), lr=q('.v7-prof-list').getBoundingClientRect(); a.clear=col.getBoundingClientRect().left>=lr.right;
    window.scrollTo(0,0); await w(60); b()[3].click(); await w(700);
    a.focus=document.activeElement.id; a.inView=(()=>{const r=q('#pq3').getBoundingClientRect(); return r.top>=0&&r.bottom<=innerHeight;})();
    window.scrollTo(0, q('.v7-prof-list').getBoundingClientRect().top+scrollY+400); await w(100); a.pos=getComputedStyle(col).position; a.sticky=Math.round(col.getBoundingClientRect().top)-q('.proto-banner').offsetHeight;
    setv(q('#v7-comp'),'Made-up Team Grants'); await w(60); window.scrollTo(0,0);
    return a;`);
  check("Setup column: green squares match the answers, one triangle, the current question outlined, the spoken count stays", r.n === 6 && r.dis === 0 && r.on === 5 && r.greenOk && /^5 of 6 answered$/.test(r.sr) &&  r.cur.length === 1 && r.curBlk === "1" && r.tri === "10px" && r.clear, r);
  check("clicking an answered square scrolls to and focuses its question; the column scrolls with the page (V8.8)", r.focus === "pq3" && r.inView && r.pos === "relative", r);
  // Keyword or question, never both (Prem, 2026-10-30).
  r = await js(H + `const seen=e=>!!e&&e.getBoundingClientRect().width>2; const blk=i=>q('.v7-qblock[data-pq="'+i+'"]');
    document.activeElement.blur(); await w(60);
    const a={kw0:seen(blk(0).querySelector('.v7-f-k')), q0:seen(q('#pq0')), kwText:blk(0).querySelector('.v7-f-k').textContent, qText:q('#pq0').textContent, both:qa('.v7-qblock').filter(b=>seen(b.querySelector('.v7-f-k'))&&seen(b.querySelector('.v7-q'))).length};
    blk(0).querySelector('.choice-btn, button[role=radio], button').focus(); await w(60); a.kwF=seen(blk(0).querySelector('.v7-f-k')); a.qF=seen(q('#pq0'));
    document.activeElement.blur(); setv(q('#v7-comp'),''); await w(80); document.activeElement.blur(); await w(40);
    a.kw1=seen(blk(1).querySelector('.v7-f-k')); a.q1=seen(q('#pq1'));
    setv(q('#v7-comp'),'Made-up Team Grants'); await w(60); document.activeElement.blur(); window.scrollTo(0,0);
    return a;`);
  check("Setup: an answered question shows its keyword only; focus inside it shows the question only; an unanswered one shows the question only; both stay in the text", r.kw0 && !r.q0 && r.both === 0 && !r.kwF && r.qF && !r.kw1 && r.q1 && r.kwText === "Agency" && /agency/.test(r.qText), r);
  r = await js(H + `const wr=q('.v7-prof-col'), sq=i=>q('.v7-prof-col .v7-fsq[data-for="pq-'+i+'"]'), bk=i=>q('.v7-qblock[data-pq="'+i+'"]');
    window.scrollTo(0,0); await w(150); const a={top:q('.v7-prof-col .v7-fsq.is-cur')?.dataset.for};
    wr._level('pq-2'); await w(600);
    a.mid=q('.v7-prof-col .v7-fsq.is-cur')?.dataset.for; a.navTop=Math.round(q('.v7-prof-col nav').getBoundingClientRect().top)-q('.proto-banner').offsetHeight;
    sq(4).click(); await w(700); a.click=q('.v7-prof-col .v7-fsq.is-cur')?.dataset.for; a.d=Math.round(bk(4).getBoundingClientRect().top-sq(4).getBoundingClientRect().top);
    a.on=qa('.v7-prof-col .v7-fsq.is-on').length; window.scrollTo(0,0); await w(100);
    return a;`);
  check("scrolling leaves the triangle on the current question; a square click moves it there, and the square sits beside its question (V8.8)", r.mid === r.top && r.click === "pq-4" && r.d <= 0 && r.d >= -30 && r.on === 6, r);

  console.log("Contributions: card pattern");
  r = await js(H + `const sr0=getComputedStyle(q('.v7-qcount .v7-prog-n .v7-sr')).position; nav(/Confirm profile/).click(); await w(150);
    const a={sr0, h:q('.narrative-stage-header h2').innerText, kick:q('.v4-kicker').innerText, startline:q('.v7-startline')?.innerText, rail:qa('.v7-ri').map(b=>b.innerText.split('\\n')[0]), groups:qa('.v7-rail-group').map(x=>x.innerText.split('\\n')[0]), saved:JSON.parse(localStorage.getItem('ncv-v9')).profileConfirmed, back:getComputedStyle(qa('.narrative-nav .btn')[0]).visibility, primary:q('.v7-ex-btn.is-primary').innerText.replace(/\\n/g,' '), exArrive:!!q('#v7-exbox'), sw:!!q('.v7-switch'), tri:!!q('.v7-ex-btn.is-primary .v7-tri'), built:q('#v7-exbox')?.classList.contains('built'), swatches:qa('#v7-exbox .v7-exbox, #v7-exbox [class*=seg]').length, six:/six parts/.test(document.body.innerText), jobs:/six jobs/i.test(document.body.innerText), states:qa('.v7-card .v7-f').map(f=>['is-open','is-filled','is-empty'].find(c=>f.classList.contains(c)))};
    a.marks=qa('.v4-flag-btn').length; a.tailored=!!q('.v7-tailored .btn');
    const h=q('[data-f$="-title"] .v7-box'); h.focus(); setv(h,'Made-up headline about a clinic protocol');
    const s=q('[data-f$="-stakes"] .v7-box'); a.qClosed=q('[data-f$="-stakes"] .v7-q').offsetHeight>0; s.scrollIntoView({block:'center'}); await w(60); const y0=s.getBoundingClientRect().top; s.focus({preventScroll:true}); await w(700);
    a.lineMove=Math.round(s.getBoundingClientRect().top-y0); a.h0=s.offsetHeight;
    a.after=qa('.v7-card .v7-f').slice(0,2).map(f=>['is-open','is-filled','is-empty'].find(c=>f.classList.contains(c)));
    a.qFilled=q('[data-f$="-title"] .v7-q').offsetHeight;
    const ta=q('[data-f$="-title"] .v7-ans'), y1=ta.getBoundingClientRect().top; q('[data-f$="-title"] .v7-box').focus({preventScroll:true}); await w(700);
    a.reopenMove=Math.round(q('[data-f$="-title"] .v7-box').getBoundingClientRect().top-y1); a.qReopen=q('[data-f$="-title"] .v7-q').offsetHeight>0;
    s.focus({preventScroll:true}); await w(700);
    a.header=q('.v7-card-t').innerText; a.count=q('.v7-card-side .v7-prog-n').textContent; a.cdots=qa('.v7-card-side .v7-dots i').length; a.con=qa('.v7-card-side .v7-dots i.on').length;
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
    a.ghost4=qa('.v7-ri.is-ghost').length; // R11: a headline, the role and two parts no longer open Review
    for (const [k,v] of [['activities','We trained staff at six made-up clinics.'],['outcomes','Two made-up clinics adopted the protocol.'],['impact','It could shorten waits across the region.']]) { const b=q('[data-f$="-'+k+'"] .v7-box'); b.focus(); setv(b,v); await w(80); }
    await w(300); a.ghost5=qa('.v7-ri.is-ghost').length; // every part written, no evidence yet
    const ne=qa('.v9-tick').find(l=>/No evidence yet/.test(l.innerText)); if(ne){ne.querySelector('input').click(); await w(400);}
    a.ghostAfter=qa('.v7-ri.is-ghost').length; a.capAfter=!!q('.v7-rail-cap');
    return a;`);
  check("Confirm profile lands on Contributions under CV sections with no start line (W1, row 4)", /Most significant/.test(r.h) && r.kick === "CV SECTIONS" && !r.startline && r.saved === true && r.back === "hidden", r);
  check("rail after confirming: CV sections group (Contributions, Mentorship, the statement) and Draft group (Review, Export) (W1)", r.rail.length === 5 && r.rail[0] === "Contributions" && r.rail[1] === "Mentorship" && r.rail[3] === "Review" && r.rail[4] === "Export" && r.rail.indexOf("Set up your profile") === -1 && r.groups.join("|") === "CV SECTIONS|DRAFT", r);
  { // Batch 1 (language pass): the frame (W1) and the start page's name (S0).
    const b1 = await js(H + `const home=q('.v7-rail-home'); return {banner:q('.proto-banner strong').innerText, skip:q('#v7-skip').innerText, tip:q('#v7-home').title, home:home?home.innerText:null};`);
    check("W1: the top bar reads BETA VERSION and the skip link Skip to main content", b1.banner === "BETA VERSION" && b1.skip === "Skip to main content", b1);
    check("S0: the rail's way back and the title link name the start page Start or Continue, the same word", /^(Start|Continue)$/.test(b1.tip) && b1.home === "← " + b1.tip, b1);
  }
  check("finished example is the primary control and arrives open on an empty step, with a triangle", /See a finished example/.test(r.primary) && r.exArrive && r.tri, r);
  check("the See how it's built switch is gone; examples are always coloured", !r.sw && !r.sw2 && r.built === true && r.built2 === true && r.exClosedBtn === true && r.exStill === true, r);
  check("visible text never says six jobs (V8.20: the line that said six parts was cut in the voice pass)", !r.jobs, r);
  check("the progress count is hidden text beside squares, not visible words", r.sr0 === "absolute", r.sr0);
  check("arrives with the headline open and the rest one line", r.states[0] === "is-open" && r.states.slice(1).every(x => x === "is-empty"), r.states);
  check("no self-assessment marks; the Profile bar has a Change button", r.marks === 0 && r.tailored, r);
  check("leaving a field shrinks it to its answer", r.after[0] === "is-filled" && r.after[1] === "is-open", r.after);
  check("closed fields show their question; the writing line holds still when the next field opens", r.qClosed && Math.abs(r.lineMove) <= 2, r);
  check("an answered field hides its question; reopening shows it and holds the line", r.qFilled === 0 && r.qReopen && Math.abs(r.reopenMove) <= 2, r);
  check("the open box starts at three lines and grows with the text", r.h0 < 100 && r.h1 > r.h0, r);
  check("Review and Export stay ghosted and closed until one contribution is complete (row 3, R11)", r.ghost.join("|") === "Review|Export" && r.cap === "To Review and Export CV, please complete at least one contribution." && r.stayed && r.ghost3 === 2 && r.ghost4 === 2 && r.ghost5 === 2, r);
  check("they open once one contribution is complete: every part written and No evidence yet ticked (R11a)", r.ghostAfter === 0 && !r.capAfter, r);
  check("header and counter build as you type", /Made-up headline/.test(r.header) && r.count === "1 of 8 answered" && r.cdots === 8 && r.con === 1, r);
  check("wording checks fire in the open field, with the suggestions note", /vague/.test(r.checks) && /Suggestions are optional/.test(r.checks) && !/⚠/.test(r.checks), r.checks); // V8.20: this used to pass on the "our" inside "your role" in the note
  check("example reopens from its button, coloured", r.exOpen && r.built2, r);
  check("focus stays on the example button after it opens", r.exFocus === "v7-ex-finished", r.exFocus);

  console.log("Contributions: evidence and a second card");
  r = await js(H + `q('.v7-ex-btn.is-primary').click(); await w(60);
    qa('.v7-ev-row button')[0].click(); await w(100);
    const a={top:q('.v7-strip.is-top b').innerText, kinds:qa('.v7-kind').length, pre:qa('.v7-kind[aria-checked=true]').length, kindCards:qa('.v7-kind').map(k=>k.innerText.replace(/\\s+/g,' ').trim())};
    qa('.v7-kind')[2].click(); await w(60); setv(q('[id^=evt]'),'Made-up provincial guideline, 2025.');
    q('.v7-strip.is-top button').click(); await w(80); a.row=q('.v7-ev-s').innerText;
    q('.v7-cards ~ .v7-add').click(); await w(150);
    a.folds=qa('.v7-fold').length; a.cards=qa('.v7-card').length; a.focus=document.activeElement.closest('.v7-f')?.dataset.f;
    setv(document.activeElement,'Second made-up contribution'); await w(60);
    q('.v7-cards ~ .v7-add').click(); await w(150);
    const st3=q('.v7-card [data-f$="-stakes"] .v7-box'); st3.focus(); setv(st3,'A made-up stakes-only card.'); await w(60);
    return a;`);
  check("evidence view: What you wrote on top, fifteen kinds (Exhibition, performance or screening; Audio or visual work; Community document; Preprint; Conference talk or poster; Teaching or curriculum), none pre-selected", r.top.toLowerCase() === "what you wrote" && r.kinds === 15 && r.pre === 0, r);
  check("R8: the kind cards on Contributions show 'Public talk or outreach' and 'Media coverage' with their hints, and no 'Media / public'", r.kindCards.some(t => t === "Public talk or outreach a public talk, a podcast or an op-ed you made for the public") && r.kindCards.some(t => t === "Media coverage news coverage or a critical review of your work") && !r.kindCards.some(t => /Media \/ public/.test(t)), r.kindCards);
  check("evidence item saved with its letter", r.row === "1 item: a", r.row);
  check("Add a contribution folds the others and focuses the new headline", r.folds === 1 && r.cards === 1 && /-title$/.test(r.focus || ""), r);

  console.log("Mentorship");
  r = await js(H + `nav(/Mentorship/).click(); await w(150);
    const a={h:q('.narrative-stage-header h2').innerText, tot:q('#v7-tot-t').innerText};
    setv(q('#v7-t-phd'),'2'); setv(q('#v7-t-postdoc'),'1'); a.sum=q('.v7-dash .v7-counter').innerText;
    setsel(q('#v7-ps0'),'postdoc'); await w(60); setsel(q('#v7-pw0'),'government'); await w(60);
    a.labels=qa('.v7-card label').map(l=>l.innerText).slice(2,4);
    setv(q('#v7-pg0'),'A made-up ministry'); a.head=q('#v7-ph0').innerText; a.help=q('.v7-people-help').innerText; a.rm=q('[aria-label^="Remove person"]')?.getAttribute('aria-label');
    a.hm=qa('[data-f^="m-"]').map(f=>['is-open','is-filled','is-empty'].find(c=>f.classList.contains(c)));
    return a;`);
  check("totals tiles have no set period (Eli, 2026-11-04) and add up", /^People you have/.test(r.tot) && !/five years/.test(r.tot) && r.sum === "3 in total", r);
  check("labels follow the sector; header builds", r.labels.join("|") === "Organization|Unit or position" && /Postdoctoral → A made-up ministry/.test(r.head), r);
  check("people are lettered like evidence (Person A); the help says why names are left out", /^Person A\b/.test(r.head) && r.rm === "Remove person A" && /career paths after training show your mentorship style/.test(r.help), r);
  check("Mentorship style arrives with one field open (D-4)", r.hm[0] === "is-open", r.hm);

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

  console.log("Review (V8.14: one board with five tabs)");
  r = await js(H + `nav(/Review your CV/).click(); await w(200);
    const a={h:q('.narrative-stage-header h2').innerText, lede:(q('.v7-lede')||{}).innerText||'', rail:qa('.v7-ri').map(b=>b.innerText.split('\\n')[0])};
    a.heads=qa('#v4-stage-content .v7-h3, #v4-stage-content .v7-card-t').map(h=>h.innerText);
    a.page=q('#v4-stage-content').innerText; a.comp=(q('.v7-comp')||{}).innerText||''; a.compAria=(q('.v7-comp-bar')||{getAttribute:()=>''}).getAttribute('aria-label')||'';
    a.segs=qa('.v7-comp-seg').map(s=>s.innerText).filter(Boolean); a.segTitles=qa('.v7-comp-seg').map(s=>s.title);
    a.noGv=!q('.v7-gv') && !qa('button').some(b=>/Download image|Download all visuals/.test(b.innerText));
    a.tabs=qa('[role=tablist] [role=tab]').map(t=>t.innerText.split(' ✓')[0].split('\\n')[0]); a.sel=qa('[role=tab][aria-selected=true]').length;
    a.tabIdx=qa('[role=tab]').map(t=>t.tabIndex).join(','); a.panel=(q('[role=tabpanel]')||{getAttribute:()=>''}).getAttribute('aria-labelledby');
    a.q=q('#v8-rb-q').innerText; a.factLive=q('#v8-fact').getAttribute('aria-live'); a.ticks=qa('.v8-tick, .v8-tab-ck, [role=tabpanel] input[type=checkbox]').length;
    a.nums=qa('.v8-row .v8-n').map(n=>n.innerText); a.titles=qa('.v8-row .v8-ct-t').map(t=>t.innerText);
    q('.v8-row [id$="-dn"]:not([disabled])').click(); await w(150);
    a.nums2=qa('.v8-row .v8-n').map(n=>n.innerText); a.titles2=qa('.v8-row .v8-ct-t').map(t=>t.innerText);
    a.focusOk=/^mv-.*-(dn|up)$/.test(document.activeElement.id); a.moved=!!q('.v8-card.moved'); a.said=(q('#v7-live')||{}).textContent||'';
    a.strandLine=(q('.v8-strands')||{}).innerText||''; a.fact=q('#v8-fact').innerText;
    const link=qa('.v7-glance a').find(x=>/The problem or question, .*What you did/.test(x.innerText)); a.link=link ? link.innerText : ''; if (link) { link.click(); await w(300); }
    a.jump={h:q('.narrative-stage-header h2').innerText, focus:document.activeElement.closest('.v7-f')?.dataset.f, open:q('.v7-f.is-open')?.dataset.f};
    return a;`);
  check("Order is part of Review, not the rail", r.rail.indexOf("Order of contributions") === -1 && r.rail.indexOf("Export") !== -1, r.rail);
  check("R1: Review opens with “Review” and the decided intro", r.h === "Review" && r.lede === "In this section, you will put your contributions in order and check your draft before you export it. We recommend completing this step on a computer. For more information, please read what reviewers look for.", r);
  check("V8.15: Review runs At a glance, the board, then Mentorship; Before you export moves to Export; no order section, no First/Last lines, no working draft", r.heads.join("|") === "At a glance|Five questions about the draft|Mentorship" && !/Put your contributions in order|First: the contribution|Last: the one closest/.test(r.page), r.heads);
  check("V8.15: each block of the composition bar names its section; the page ticks are numbered, with no explaining line", !/Each block is one section/.test(r.comp) && /\n0\n1\n2\n3\n4\n5 pages\n/.test(r.comp) && r.segTitles.length > 0 && r.segTitles.every(t => /^(Personal statement|Background and skills|Contribution \d+|Mentorship)$/.test(t)) && r.segs.every(t => /^(Statement|Background|Contribution \d+|C\d+|Mentorship)$/.test(t)) && /The length depends on the template\. Please check it in the template before you submit\./.test(r.comp) && /of 5 pages · about [\d,]+ words?/.test(r.comp) && !/roughly/.test(r.comp) && /^Narrative composition breakdown: .*Contribution 1 \d+ words/.test(r.compAria), r);
  check("V8.14: no chart gallery, no claims about reviewers and no 'real' on Review", r.noGv && !/reviewers? (weigh|look for most|read)/i.test(r.page.replace(/What reviewers look for/g, "")) && !/\breal\b/i.test(r.page), "");
  check("V8.17: five tabs, each named for its edit, in a tablist, one selected, roving tabindex, panel named by its tab", r.tabs.join("|") === "Reorder contributions|Edit what already changed|Edit role|Add evidence|Check changes" && r.sel === 1 && r.tabIdx === "0,-1,-1,-1,-1" && r.panel === "v8-tab-order", r);
  check("V8.14: the Order tab asks Prem's question; the fact line is a polite live region; V8.19: the tab has no tick (the one checklist is on Export)", /^Does the order of your contributions follow your (personal statement|background and skills)\?$/.test(r.q) && r.factLive === "polite" && r.ticks === 0, r);
  check("V8.14: ↑ ↓ move the contribution; the numbers stay in place; focus stays on the moved row; the move is announced and highlighted", r.nums.join() === r.nums2.join() && r.titles2[1] === r.titles[0] && r.titles2[0] === r.titles[1] && r.focusOk && r.moved && /moved to position 2 of/.test(r.said), r);
  check("V8.14: with no strands named, the tab says so, links to the statement step and the fact line asks to name them", /^Name your areas on /.test(r.strandLine) && /^To check the order, please name your areas of research on (Personal statement|Background and skills)\./.test(r.fact) && /does not yet end with what you plan to do next|ends with what you plan to do next|is not written yet/.test(r.fact), r);
  check("At a glance: one line per contribution, linked to its first missing part, which opens with focus (r1-b-10)", /^Contribution \d: The problem or question, .*What you did.* and Evidence$/.test(r.link) && /Most significant/.test(r.jump.h) && r.jump.focus === r.jump.open && /-stakes$/.test(r.jump.focus || ""), r);

  console.log("V8.14 tabs, keyboard and the statement panel");
  r = await js(H + `rail('Review').click(); await w(200); const a={};
    const t0=q('#v8-tab-order'); t0.focus(); t0.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true})); await w(60);
    a.right=[document.activeElement.id, q('#v8-tab-words').getAttribute('aria-selected'), q('#v8-tab-words').tabIndex, q('#v8-rb-q').innerText];
    document.activeElement.dispatchEvent(new KeyboardEvent('keydown',{key:'End',bubbles:true})); await w(60); a.end=document.activeElement.id;
    document.activeElement.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true})); await w(60); a.wrap=document.activeElement.id;
    document.activeElement.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowLeft',bubbles:true})); await w(60); a.left=document.activeElement.id;
    q('#v8-tab-evidence').click(); await w(60); a.evQ=q('#v8-rb-q').innerText; q('#v8-tab-words').click(); await w(60); a.noMv=qa('[role=tabpanel] [id^="mv-"]').length;
    a.saved=JSON.parse(localStorage.getItem('ncv-v9')).ui.reviewTab;
    rail('Contributions').click(); await w(150); rail('Review').click(); await w(200); a.kept=q('[role=tab][aria-selected=true]').id;
    const st=q('#v8-rb-st'); a.stHead=st.querySelector('h4').innerText; a.stEdit=qa('#v8-rb-st-in button').map(b=>b.innerText);
    a.above=!!(st.compareDocumentPosition(q('[role=tablist]')) & Node.DOCUMENT_POSITION_FOLLOWING) && st.getBoundingClientRect().bottom <= q('[role=tablist]').getBoundingClientRect().top;
    a.full=Math.abs(st.getBoundingClientRect().width - q('[role=tablist]').getBoundingClientRect().width) < 4;
    const sb=q('.v8-rb-st-body'); a.body=[sb.getAttribute('role'), sb.tabIndex, sb.getAttribute('aria-label'), getComputedStyle(sb).overflowY];
    const tg=q('#v8-rb-tog'); a.tg=[tg.innerText, tg.getAttribute('aria-expanded'), tg.getAttribute('aria-controls'), tg.getAttribute('aria-label')]; tg.click(); await w(60);
    a.tg2=[tg.innerText, tg.getAttribute('aria-expanded'), q('#v8-rb-st-in').hidden, JSON.parse(localStorage.getItem('ncv-v9')).ui.stmtShut, tg.getAttribute('aria-label')];
    q('#v8-tab-role').click(); await w(60); const see=q('[role=tabpanel] .v8-see'); a.see=see.innerText; window.scrollTo(0, document.body.scrollHeight); await w(40); see.click(); await w(500);
    a.seen=[q('#v8-rb-st-in').hidden, document.activeElement.id, q('#v8-rb-tog').getAttribute('aria-expanded'), Math.round(q('#v8-rb-st').getBoundingClientRect().top) < window.innerHeight];
    return a;`);
  check("V8.14: ← → Home End move between tabs; selection follows focus; the panel shows that tab's question", r.right[0] === "v8-tab-words" && r.right[1] === "true" && r.right[2] === 0 && r.right[3] === "Does each contribution say what already changed?" && r.end === "v8-tab-reach" && r.wrap === "v8-tab-order" && r.left === "v8-tab-reach", r);
  check("V8.14: only the Order tab has ↑ ↓", r.noMv === 0, r.noMv);
  check("V8.16: the Evidence tab asks whether each contribution shows where others used the work", r.evQ === "Does each contribution show where others used the work?", r.evQ);
  check("V8.14: the chosen tab is saved and kept when Review opens again", r.saved === "words" && r.kept === "v8-tab-words", r);
  check("V8.15: the statement sits above the tabs, full width, read only, with Edit on the statement step", /^(Background and skills|Personal statement)$/i.test(r.stHead) && r.above && r.full && r.stEdit.length === 1 && /^Edit on /.test(r.stEdit[0]), r);
  check("V8.15: the statement text scrolls in a labelled region a keyboard can reach", r.body[0] === "region" && r.body[1] === 0 && /, read only$/.test(r.body[2]) && r.body[3] === "auto", r.body);
  check("V8.15: Hide/Show is a labelled toggle that saves", /^Hide,true,v8-rb-st-in,Hide (personal statement|background and skills)$/.test(r.tg.join()) && /^Show,false,true,true,Show (personal statement|background and skills)$/.test(r.tg2.join()), r);
  check("V8.15: each tab has See your statement, which opens it, scrolls up to it and moves focus to its heading", /^See (personal statement|background and skills)$/.test(r.see) && r.seen[0] === false && r.seen[1] === "v8-rb-st-t" && r.seen[2] === "true" && r.seen[3], r.seen);

  console.log("V8.14 strands are named once, on the statement step");
  r = await js(H + `rail('Review').click(); await w(200); q('#v8-tab-order').click(); await w(60); const a={};
    qa('.v8-strands button')[0].click(); await w(300);
    a.h=q('.narrative-stage-header h2').innerText; const fs=q('.v8-strand-fs'); a.legend=fs.querySelector('legend').innerText; a.focus=document.activeElement.classList.contains('v8-strand-in');
    a.lab=(q('label[for="'+document.activeElement.id+'"]')||{}).innerText||'';
    setv(document.activeElement,'Made-up strand one'); await w(40);
    qa('.v8-strand-fs button').find(b=>/Add an area/.test(b.innerText)).click(); await w(40); a.addFocus=document.activeElement.classList.contains('v8-strand-in') && document.activeElement.value==='';
    setv(document.activeElement,'Made-up strand two'); await w(40);
    a.saved=JSON.parse(localStorage.getItem('ncv-v9')).strands.map(t=>t.text).join('|');
    rail('Review').click(); await w(200); q('#v8-tab-order').click(); await w(60);
    a.line=q('.v8-strands').innerText; a.fact0=q('#v8-fact').innerText;
    const rows=qa('.v8-rows-mv .v8-row'); const m2=rows[0].querySelectorAll('.v8-mark')[1]; const cid=m2.dataset.cid, sid=m2.dataset.s;
    a.label=m2.getAttribute('aria-label'); a.before=m2.getAttribute('aria-pressed'); m2.click(); await w(60);
    const back=document.activeElement; a.back=back.classList.contains('v8-mark') && back.dataset.cid===cid && back.dataset.s===sid; a.after=back.getAttribute('aria-pressed');
    rows[1].querySelectorAll('.v8-mark')[0].click(); await w(60);
    a.fact=q('#v8-fact').innerText;
    const st=JSON.parse(localStorage.getItem('ncv-v9')); a.stSaved=(st.contributions.find(c=>c.cid===cid).strandIds||[]).indexOf(sid)>-1;
    const none=qa('.v8-rows-mv .v8-row')[0].querySelector('.v8-mark[data-s=none]'); none.click(); await w(60);
    const c0=JSON.parse(localStorage.getItem('ncv-v9')).contributions.find(c=>c.cid===cid); a.none=[c0.strandNone, (c0.strandIds||[]).length, q('.v8-mark[data-cid="'+cid+'"][data-s=none]').getAttribute('aria-pressed')];
    a.fact2=q('#v8-fact').innerText;
    q('#v8-tab-words').click(); await w(60); a.tag=(q('.v8-row[data-cid="'+cid+'"] .v8-tag')||{}).innerText||'';
    return a;`);
  check("V8.14: Edit on the statement step opens the Areas of research question at a labelled area box in a field set (PS13)", /background and skills|Personal statement/i.test(r.h) && r.legend === "Name each area in a few words (optional)" && r.focus && r.lab === "Area 1", r);
  check("V8.14, PS13: + Add an area puts focus in a new box; the names save to the draft", r.addFocus && r.saved === "Made-up strand one|Made-up strand two", r);
  check("V8.14: Review lists the strands named on the statement step; with none marked, the fact line asks to mark them", /^Areas of research: “Made-up strand one”, “Made-up strand two”\. Edit on /.test(r.line) && /^To check the order, please mark the areas of each contribution\./.test(r.fact0), r);
  check("V8.14: a strand mark is a toggle named with its contribution and strand; it saves and keeps focus", /^Contribution 1: Made-up strand two$/.test(r.label) && r.before === "false" && r.after === "true" && r.back && r.stSaved, r);
  check("V8.14: the fact line compares the order with the strands", /^In your areas, “Made-up strand one” comes before “Made-up strand two”\. Contribution 1 is marked “Made-up strand two” and contribution 2 is marked “Made-up strand one”\./.test(r.fact), r.fact);
  check("V8.14: None of these is an answer of its own; it clears the strands; the other tabs show “No strand”", r.none[0] === true && r.none[1] === 0 && r.none[2] === "true" && /marked “None of these”/.test(r.fact2) && r.tag === "No area", r);

  console.log("V8.14 Words, Role and Evidence tabs");
  r = await js(H + `rail('Review').click(); await w(200); q('#v8-tab-words').click(); await w(60); const a={};
    a.legendFirst=!!q('[role=tabpanel] .v8-leg + .v8-rows'); const seg=q('.v8-seg[data-k=outcomes]'); a.segLabel=seg.getAttribute('aria-label'); a.pencil=getComputedStyle(seg,'::after').content;
    a.noPanel=!q('.v8-rowedit'); seg.click(); await w(150); const ta=q('#v7-wb-ta'); a.noPanel=a.noPanel && !q('#v8-side'); a.under=!!ta && ta.closest('.v8-row')===seg.closest('.v8-row'); a.taFocus=document.activeElement===ta; a.exp=seg.getAttribute('aria-expanded'); a.onlyOne=qa('.v8-seg[aria-expanded=true]').length; a.oneBox=qa('.v8-ed-slot textarea').length;
    a.taLabel=(q('label[for=v7-wb-ta]')||{}).innerText||'';
    await w(260); a.emptyOn=[seg.classList.contains('is-empty'), getComputedStyle(seg).backgroundColor, getComputedStyle(seg).borderTopStyle];
    const cid=seg.dataset.cid; setv(ta, ta.value+' Made-up extra words for the test.'); await w(60);
    a.saved=JSON.parse(localStorage.getItem('ncv-v9')).contributions.find(c=>c.cid===cid).outcomes; a.segLabel2=seg.getAttribute('aria-label'); await w(260);
    { const on=getComputedStyle(seg); const rgb=(t)=>t.match(/\\d+(\\.\\d+)?/g).slice(0,3).map(Number), Lm=(c)=>{const v=c.map(x=>{x/=255;return x<=0.03928?x/12.92:Math.pow((x+0.055)/1.055,2.4);});return 0.2126*v[0]+0.7152*v[1]+0.0722*v[2];}; const f1=Lm(rgb(on.color)), b1=Lm(rgb(on.backgroundColor)); a.onLook=[on.backgroundColor, Math.round((Math.max(f1,b1)+0.05)/(Math.min(f1,b1)+0.05)*10)/10, getComputedStyle(q('.v8-ed-slot .v8-ed')).borderLeftColor, on.borderTopColor, getComputedStyle(seg,'::after').backgroundColor, getComputedStyle(seg,'::after').color, getComputedStyle(q('.v8-ed-slot .v8-ed')).borderLeftWidth, getComputedStyle(q('.v8-ed-slot .v8-ed')).borderTopColor]; }
    const seg2=qa('.v8-row')[1].querySelector('.v8-seg[data-k=activities]'); seg2.click(); await w(150);
    a.swap=[q('#v7-wb-ta').closest('.v8-row')===seg2.closest('.v8-row'), document.activeElement.id, qa('.v8-seg[aria-expanded=true]').length, seg.getAttribute('aria-expanded'), qa('.v8-ed-slot textarea').length, (q('label[for=v7-wb-ta]')||{}).innerText||''];
    await w(260); const cs=getComputedStyle(seg); a.look=[cs.borderTopStyle, parseFloat(cs.borderTopWidth)>=1, cs.cursor, seg.offsetHeight>=24]; { const lg=getComputedStyle(q('.v8-leg i')); a.accent=[cs.borderTopColor, cs.backgroundColor, lg.borderTopColor, cs.boxShadow, lg.boxShadow, ['Top','Right','Bottom','Left'].map(x=>cs['border'+x+'Width']).join(','), q('.v8-leg i').getBoundingClientRect().width, cs.borderTopLeftRadius]; }
    document.activeElement.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true})); await w(60); a.esc=[!q('#v7-wb-ta'), document.activeElement===seg2, seg2.getAttribute('aria-expanded')];
    seg.click(); await w(120); qa('.v8-ed-slot .btn').find(b=>b.innerText==='Done').click(); await w(60); a.done=[!q('#v7-wb-ta'), document.activeElement===seg];
    a.sw=document.documentElement.scrollWidth<=window.innerWidth;
    q('#v8-tab-role').click(); await w(60); const s=q('[role=tabpanel] select'); a.roleName=s.getAttribute('aria-label'); a.roleLab=(q('label[for="'+s.id+'"]')||{}).innerText; const f0=q('#v8-fact').innerText;
    setsel(s,'alone'); await w(60); a.role=[JSON.parse(localStorage.getItem('ncv-v9')).contributions.find(c=>'v8-role-'+c.cid===s.id).roleMode, f0!==q('#v8-fact').innerText, /^Contribution 1 has no role sentence yet\./.test(q('#v8-fact').innerText)];
    a.roleBack=qa('[role=tabpanel] .v8-roleline button').length===qa('[role=tabpanel] .v8-row').length;
    q('#v8-tab-evidence').click(); await w(60); const before=q('#v8-fact').innerText;
    const tr=q('[role=tabpanel] tbody tr'); tr.querySelectorAll('.v7-rqev-add')[1].click(); await w(80);
    const er=q('.v8-edrow'); a.edUnder=er && er.previousElementSibling===q('[role=tabpanel] tbody tr[data-cid="'+tr.dataset.cid+'"]'); a.edFocus=document.activeElement.id;
    a.kinds=[...q('#v7-ev-kind').options].map(o=>o.value); a.kinds0=q('#v7-ev-kind').value; setv(q('#v7-ev-text'),'Made-up Gazette (2025). A made-up article.'); q('#v7-ev-kind').value='Media coverage';
    qa('.v8-edrow .btn').find(b=>b.innerText==='Save').click(); await w(80);
    a.evSaved=JSON.parse(localStorage.getItem('ncv-v9')).contributions.some(c=>(c.evidence||[]).some(e=>/Made-up Gazette/.test(e.text)&&e.type==='Media coverage'&&e.used===true));
    a.evFact=[before, q('#v8-fact').innerText]; a.evBack=document.activeElement.classList.contains('v7-rqev-add') || document.activeElement.classList.contains('v7-rqev-item');
    q('[role=tabpanel] tbody tr .v7-rqev-add').click(); await w(60); q('#v7-ev-text').dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true})); await w(60); a.evEsc=!q('.v8-edrow');
    rail('Export').click(); await w(200); const ck=q('#v8-ck-evidence'); a.ckLab=ck.closest('label').innerText.trim(); a.ckIds=qa('.v7-selfcheck input[type=checkbox]').map(x=>x.id.replace('v8-ck-','')).join();
    ck.click(); await w(40); a.tick=[JSON.parse(localStorage.getItem('ncv-v9')).selfCheck.evidence===true]; const go=ck.closest('.v8-ck').querySelector('.v8-ck-go'); a.goName=[go.tagName, go.innerText, go.getAttribute('aria-label')];
    go.click(); await w(300); a.back=[q('.narrative-stage-header h2').innerText, q('#v8-tab-evidence').getAttribute('aria-selected'), document.activeElement.id, q('#v8-rb-q').innerText];
    rail('Export').click(); await w(200); a.kept=q('#v8-ck-evidence').checked; const mg=q('#v8-ck-mentorship'); a.mBack=''; if (mg) { mg.closest('.v8-ck').querySelector('.v8-ck-go').click(); await w(300); a.mBack=document.activeElement.id; } a.hasM=!!mg;
    rail('Review').click(); await w(200);
    return a;`);
  check("V8.14 Words: the legend sits above the bars; each part is a button named with contribution, part and words, with a pencil (V8.19: a plus when the part is empty)", r.legendFirst && /^Edit contribution \d, What already changed: \d+ words?$/.test(r.segLabel) && (/ 0 words$/.test(r.segLabel) ? /\+/.test(r.pencil) : /✎/.test(r.pencil)), r);
  check("V8.18 Words: each block has a button's border and pointer; there is no row Edit button and no side panel", r.look[0] === "solid" && r.look[1] && r.look[2] === "pointer" && r.look[3] && r.noPanel, [r.look, r.noPanel]);
  check("V8.18 Words: a block opens its own part, alone, in a box under its contribution, with focus and its name", r.under && r.taFocus && r.exp === "true" && r.onlyOne === 1 && r.oneBox === 1 && /^Contribution \d: What already changed/.test(r.taLabel), r);
  check("V9.5 (ST-1a): a block is a part box, its tint with a 1px line of its colour all round and 2px corners, no stripe (orange for What already changed); the legend is a small block with gold's line #8a6200", r.accent[0] === "rgb(218, 58, 22)" && r.accent[1] === "rgb(247, 212, 204)" && r.accent[2] === "rgb(138, 98, 0)" && r.accent[3] === "none" && r.accent[4] === "none" && r.accent[5] === "1px,1px,1px,1px" && r.accent[6] >= 20 && r.accent[7] === "2px", r.accent);
  check("V8.19: the open block keeps its tint, takes its accent on the border and shows the pencil in a circle of the accent; its text stays at 4.5:1 or more; the box it opens has that accent on a 1px border all round, with no bar down the side", (!r.emptyOn[0] || (r.emptyOn[1] !== "rgb(255, 255, 255)" && r.emptyOn[2] === "solid")) && r.onLook[0] === "rgb(247, 212, 204)" && r.onLook[1] >= 4.5 && r.onLook[2] === "rgb(218, 58, 22)" && r.onLook[3] === "rgb(218, 58, 22)" && r.onLook[4] === "rgb(218, 58, 22)" && r.onLook[5] === "rgb(255, 255, 255)" && r.onLook[6] === "1px" && r.onLook[7] === "rgb(218, 58, 22)", r.onLook);
  check("V8.18 Words: typing in the box saves and updates its block", /Made-up extra words for the test\.$/.test(r.saved || "") && r.segLabel2 !== r.segLabel, r);
  check("V8.18 Words: another block closes the first box and opens its own (one box, one block marked open)", r.swap[0] && r.swap[1] === "v7-wb-ta" && r.swap[2] === 1 && r.swap[3] === "false" && r.swap[4] === 1 && /What you did/.test(r.swap[5]), r.swap);
  check("V8.18 Words: Escape or Done closes the box and focus goes back to its block; the page does not scroll sideways", r.esc[0] && r.esc[1] && r.esc[2] === "false" && r.done[0] && r.done[1] && r.sw, [r.esc, r.done, r.sw]);
  check("V8.14 Role: a labelled role list on each row saves the choice and updates the fact line; each row links back to its role sentence", r.roleName === "How were you involved in contribution 1?" && r.roleLab === "How were you involved?" && r.role[0] === "alone" && r.role[1] && r.role[2] && r.roleBack, r);
  check("V8.14 Evidence: + Add opens the box in a row under its contribution, with every kind, and the first kind of its column chosen (EV-1)", r.edUnder && r.edFocus === "v7-ev-text" && r.kinds.length === 15 && r.kinds.indexOf("Media coverage") > -1 && r.kinds.indexOf("Public talk or outreach") > -1 && r.kinds.indexOf("Media / public") === -1 && r.kinds0 === "Policy / practice uptake", r);
  check("V8.14 Evidence: Save adds the item, updates the fact line and returns focus to the table; Escape closes the box", r.evSaved && r.evFact[0] !== r.evFact[1] && r.evBack && r.evEsc, r);
  check("V8.19: one checklist, on Export: Review's questions in Review's words and order, then the six checks before submitting (E5)", /^coherence,significance,ownership,evidence,reach,(mentorship,)?selection,specificity,proofread,agreement,reader,template,pagelimit$/.test(r.ckIds) && r.ckLab === "Does each contribution show where others used the work?", [r.ckIds, r.ckLab]);
  check("V8.19: a tick on the list saves and is kept; “See on Review” is a named button that opens that question on Review, with focus on it", r.tick[0] && r.kept && r.goName[0] === "BUTTON" && r.goName[1] === "See on Review" && r.goName[2] === "See on Review: Add evidence" && /Review/.test(r.back[0]) && r.back[1] === "true" && r.back[2] === "v8-rb-q" && r.back[3] === r.ckLab && (!r.hasM || r.mBack === "v8-rm-t"), r);

  console.log("V8.18: a narrow window, and the parts on a folded contribution");
  await send("Emulation.setDeviceMetricsOverride", { width: 800, height: 900, deviceScaleFactor: 1, mobile: false });
  r = await js(H + `rail('Review').click(); await w(200); q('#v8-tab-words').click(); await w(80); const a={};
    const seg=q('.v8-seg[data-k=outcomes]'); seg.click(); await w(80); const ta=q('#v7-wb-ta'); a.under=!!ta && ta.closest('.v8-row')===seg.closest('.v8-row'); a.taFocus=document.activeElement===ta;
    const cid=seg.dataset.cid; setv(ta, ta.value+' Narrow words.'); await w(60); a.saved=JSON.parse(localStorage.getItem('ncv-v9')).contributions.find(c=>c.cid===cid).outcomes;
    a.inCard=qa('.v8-bar').every(b=>b.scrollWidth<=b.clientWidth+1); a.sw=document.documentElement.scrollWidth<=window.innerWidth;
    ta.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true})); await w(60); a.esc=[!q('#v7-wb-ta'), document.activeElement===seg];
    return a;`);
  check("V8.18 Words: in a narrow window a block still opens its own part under its contribution and saves; the bars stay inside their cards and the page does not scroll sideways", r.under && r.taFocus && /Narrow words\.$/.test(r.saved || "") && r.inCard && r.sw && r.esc[0] && r.esc[1], r);
  await send("Emulation.setDeviceMetricsOverride", { width: 1180, height: 900, deviceScaleFactor: 1, mobile: false });
  r = await js(H + `rail('Contributions').click(); await w(250); const a={}; const f=q('.v7-fold'); a.has=!!f; if (f) { const m=f.querySelector('.v8-mini'); a.hidden=m.getAttribute('aria-hidden'); a.n=m.children.length; a.on=m.querySelectorAll('i.on').length;
      const cid=f.id.replace('fold-',''); const c=JSON.parse(localStorage.getItem('ncv-v9')).contributions.find(x=>x.cid===cid); a.written=['stakes','roleLine','activities','outputs','outcomes','translational','impact'].filter(k=>(c[k]||'').trim()).length;
      a.tints=[...m.querySelectorAll('i.on')].map(i=>getComputedStyle(i).backgroundColor).filter((v,k,arr)=>arr.indexOf(v)===k).length; a.off=[...m.querySelectorAll('i:not(.on)')].every(i=>getComputedStyle(i).borderTopStyle==='dashed'); a.label=f.getAttribute('aria-label'); }
    rail('Review').click(); await w(200); return a;`);
  check("V8.18 Contributions: a folded contribution shows its parts in the colours Review uses, written or dashed, and its name still gives the count", r.has && r.hidden === "true" && r.n === 7 && r.on === r.written && (r.on < 2 || r.tints > 1) && r.off && /\d of 8 answered/.test(r.label), r);
  console.log("V8.18: the hover rule of the Pathways site");
  r = await js(H + `rail('Review').click(); await w(200); q('#v8-tab-words').click(); await w(120); const s=q('.v8-seg[data-k=outcomes]'); s.scrollIntoView({block:'center'}); await w(60); const b=s.getBoundingClientRect(), cs=getComputedStyle(s);
    return {x:b.left+b.width/2, y:b.top+b.height/2, rest:cs.backgroundColor, restBorder:cs.borderTopColor, restDisc:getComputedStyle(s,'::after').backgroundColor, radius:cs.borderTopLeftRadius, tr:cs.transitionDuration};`);
  const segRest = r;
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: segRest.x, y: segRest.y });
  r = await js(H + `await w(400); const s=q('.v8-seg[data-k=outcomes]'), cs=getComputedStyle(s); const rgb=(t)=>t.match(/\\d+(\\.\\d+)?/g).slice(0,3).map(Number), Lm=(c)=>{const v=c.map(x=>{x/=255;return x<=0.03928?x/12.92:Math.pow((x+0.055)/1.055,2.4);});return 0.2126*v[0]+0.7152*v[1]+0.0722*v[2];};
    const f=Lm(rgb(cs.color)), b=Lm(rgb(cs.backgroundColor)); const a={bg:cs.backgroundColor, border:cs.borderTopColor, ratio:Math.round((Math.max(f,b)+0.05)/(Math.min(f,b)+0.05)*10)/10, disc:[getComputedStyle(s,'::after').backgroundColor, getComputedStyle(s,'::after').color]};
    q('#v8-tab-evidence').click(); await w(120); const it=q('.v7-rqev-item'); it.scrollIntoView({block:'center'}); await w(60); const ib=it.getBoundingClientRect(); a.ix=ib.left+ib.width/2; a.iy=ib.top+ib.height/2;
    a.itemRest=[getComputedStyle(it).backgroundColor, getComputedStyle(it,'::after').backgroundColor, getComputedStyle(it,'::after').color]; return a;`);
  const segHover = r;
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: segHover.ix, y: segHover.iy });
  r = await js(H + `await w(400); const it=q('.v7-rqev-item'), cs=getComputedStyle(it); return {bg:cs.backgroundColor, border:cs.borderTopColor, disc:[getComputedStyle(it,'::after').backgroundColor, getComputedStyle(it,'::after').color]};`);
  check("V8.19, V9.5: a block at rest is a pale tint with a 1px line of its colour and no circle; under the pointer it keeps the tint, takes its accent on the border (orange for What already changed), and the pencil gets a circle of the accent", segRest.rest === "rgb(247, 212, 204)" && segRest.restBorder === "rgb(218, 58, 22)" && /rgba\(0, 0, 0, 0\)|transparent/.test(segRest.restDisc) && segRest.radius === "2px" && segRest.tr !== "0s" && segHover.bg === "rgb(247, 212, 204)" && segHover.border === "rgb(218, 58, 22)" && segHover.ratio >= 4.5 && segHover.disc[0] === "rgb(218, 58, 22)" && segHover.disc[1] === "rgb(255, 255, 255)", [segRest, segHover]);
  check("V8.19: an evidence item is white with a burgundy pencil and no circle at rest; under the pointer it fills with the burgundy tint, takes a burgundy border, and the circle appears", segHover.itemRest[0] === "rgb(255, 255, 255)" && /rgba\(0, 0, 0, 0\)|transparent/.test(segHover.itemRest[1]) && segHover.itemRest[2] === "rgb(145, 35, 56)" && r.bg === "rgb(246, 232, 235)" && r.border === "rgb(145, 35, 56)" && r.disc[0] === "rgb(145, 35, 56)" && r.disc[1] === "rgb(255, 255, 255)", [segHover.itemRest, r]);
  r = await js(H + `await w(100); const a={}; const geo=(e)=>{const p=getComputedStyle(e,'::after'); return [Math.abs(parseFloat(p.top)-e.clientHeight/2)<=2, parseFloat(p.right)>=3 && parseFloat(p.right)<=12, p.width, p.content];};
    a.items=qa('.v7-rqev-item').length; a.itemsEb=qa('.v7-rqev-item.v8-eb').length; a.item=geo(q('.v7-rqev-item'));
    a.people=qa('.v8-person').length; a.peopleEb=qa('.v8-person.v8-eb').length; if (q('.v8-person')) a.person=geo(q('.v8-person'));
    q('#v8-tab-words').click(); await w(200); a.blocks=qa('.v8-seg').length; a.blocksEb=qa('.v8-seg.v8-eb.v8-eb-block').length; const wide=q('.v8-seg.is-wide'); if (wide) a.block=geo(wide);
    const emp=q('.v8-seg.is-empty'); a.emptyPlus=emp ? [getComputedStyle(emp,'::after').content, getComputedStyle(emp).borderTopStyle, getComputedStyle(emp,'::after').opacity] : null;
    const nar=qa('.v8-seg:not(.is-wide):not(.is-empty)')[0]; a.narrowRest=nar ? getComputedStyle(nar,'::after').opacity : null;
    return a;`);
  check("V8.19: everything on Review that opens for editing is one component (blocks, evidence items, people)", r.blocks > 0 && r.blocks === r.blocksEb && r.items > 0 && r.items === r.itemsEb && r.people === r.peopleEb, r);
  check("V8.19: the pencil sits inside its box at the right end, centred top to bottom, on an evidence item, a person and a block", r.item[0] && r.item[1] && r.item[2] === "22px" && /✎/.test(r.item[3]) && (!r.person || (r.person[0] && r.person[1])) && (!r.block || (r.block[0] && r.block[1])), r);
  check("V8.19: an empty block is dashed and shows a plus; a block too narrow for the pencil shows none at rest", (!r.emptyPlus || (/\+/.test(r.emptyPlus[0]) && r.emptyPlus[1] === "dashed" && r.emptyPlus[2] === "1")) && (r.narrowRest === null || r.narrowRest === "0"), r);
  { const pencils = (fs.readFileSync(path.join(ROOT, "narrative-cv-prototype-v9.html"), "utf8").match(/content: "✎"/g) || []).length;
    check("V8.19: the pencil is written once in the stylesheet, so the boxes cannot drift apart", pencils === 1, pencils); }
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 2, y: 2 });
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  r = await js(H + `await w(100); q('#v8-tab-words').click(); await w(120); return [getComputedStyle(q('.v8-seg')).transitionDuration, getComputedStyle(q('.v8-person')).transitionDuration];`);
  check("V8.18: with reduced motion the colour change has no transition", r.every(t => t.split(",").every(d => parseFloat(d) <= 0.001)), r); // the page-wide reduced-motion rule leaves 0.00001s
  await send("Emulation.setEmulatedMedia", { features: [] });
  console.log("Export");
  r = await js(H + `rail('Export').click(); await w(150);
    const blobs=[], names=[]; const oc=URL.createObjectURL; URL.createObjectURL=(b)=>{blobs.push(b);return oc(b);};
    const ocl=HTMLAnchorElement.prototype.click; HTMLAnchorElement.prototype.click=function(){names.push(this.download);};
    const a={setup:q('.v7-tailored').innerText, cards:qa('.v7-card .v7-h3').map(h=>h.innerText), nudge:q('.v7-nudge').innerText};
    q('.v7-actions .btn-primary').click(); await w(40);
    q('#v7-fmt-txt').click(); await w(60); q('.v7-actions .btn-primary').click(); await w(40);
    qa('.v7-card .btn').find(b=>b.innerText==='Save a backup file').click(); await w(40);
    HTMLAnchorElement.prototype.click=ocl; URL.createObjectURL=oc;
    a.names=names; a.doc=await blobs[0].text(); a.txt=await blobs[1].text(); a.file=await blobs[2].text();
    a.exportGreen=rail('Export').classList.contains('is-done');
    return a;`);
  check("V8.11, E2: the Format line names the agency and font", /^▸\s*Change\s*Format:\s*FRQ · CV-FRQ · 12-point Times New Roman/.test(r.setup) && !/Set up for/.test(r.setup), r.setup);
  check("V8.15: Export has Before you submit, then the three export cards", r.cards.join("|") === "Before you submit|Download or print|Copy each section into the template|Backup file", r.cards);
  check("E9: one contact block, with the address printed as text", /^If you have questions about your narrative CV, or a few minutes to tell us how the tool worked for you, please email the Pathways to Impact team\./.test(r.nudge) && /Email us\s+impact@concordia\.ca/.test(r.nudge), r.nudge);
  check("downloads: Word, text and draft file", r.names[0] === "narrative-cv-draft-frq.doc" && r.names[1] === "narrative-cv-draft-frq.txt" && /^narrative-cv-draft-frq-\d{4}-\d{2}-\d{2}-\d{4}\.json$/.test(r.names[2]), r.names);
  const psDoc = (r.doc.match(/<h2>The candidate’s background and skills \/ <span lang='fr'>Parcours et compétences de la personne candidate<\/span><\/h2>(.*?)<h2>/s) || [])[1] || "";
  check("Word file: the first line, then the statement as one paragraph (V7-34)", (psDoc.match(/<p>/g) || []).length === 2 && /Why clinics drop the protocol\. Two strands carry it\./.test(psDoc), psDoc);
  check("text file: the statement as one paragraph", /Why clinics drop the protocol\. Two strands carry it\./.test(r.txt), r.txt.slice(0, 500));
  check("a contribution with no headline still reaches the Word and text files", /A made-up stakes-only card\./.test(r.doc) && /A made-up stakes-only card\./.test(r.txt), "");
  const file = JSON.parse(r.file);
  check("draft file has its format, version and no team notes", file.format === "pathways-narrative-cv-draft" && file.version === 1 && !("teamNotes" in file.draft) && !("feedback" in file.draft), Object.keys(file.draft));
  check("Export turns green once something is downloaded", r.exportGreen, r);
  const fileText = r.file;
  r = await js(H + `rail('Export').click(); await w(150); return {btn:!!q('#v7-gv-all'), cls:!!q('.v7-gv-exp')};`);
  check("V8.12: Export has no Download visuals section (Prem: dropped until the visuals are useful)", !r.btn && !r.cls, r);

  console.log("Draft file round trip");
  r = await js(H + `localStorage.removeItem('ncv-v9'); window.confirm=()=>true; window.alert=(m)=>{window.__a=m;};
    const ic=HTMLInputElement.prototype.click;
    HTMLInputElement.prototype.click=function(){ if(this.type==='file'){const dt=new DataTransfer(); dt.items.add(new File([${JSON.stringify(fileText)}],'d.json',{type:'application/json'})); this.files=dt.files; this.dispatchEvent(new Event('change'));} };
    document.getElementById('v7-home').click(); await w(100); q('.v7-path-cont').click(); await w(150);
    const warn=(q('.v7-paths .v7-warn p')||{}).innerText||''; window.__s18={status:q('.v7-paths .v7-warn .v7-warn-status')?.innerText, btns:qa('.v7-paths .v7-warn .btn').map(b=>b.innerText), group:q('.v7-paths .v7-warn').getAttribute('aria-labelledby'), role:q('.v7-paths .v7-warn .v7-warn-status')?.getAttribute('role'), focus:document.activeElement.className}; await okWarn(); await w(150);
    HTMLInputElement.prototype.click=ic;
    const st=JSON.parse(localStorage.getItem('ncv-v9'));
    return {h:q('.narrative-stage-header h2').innerText, n:st.contributions.length, comp:st.lens.program, alert:window.__a||'', warn, s18:window.__s18, banner:(q('.narrative-session-banner')||{}).innerText||''};`);
  check("S18: the confirm shows one status line and Save a backup file, Choose a file, Cancel; the advice line is gone", /^(Backup saved .+, no changes since\.|Your latest changes are not in a backup file\.)$/.test(r.s18.status) && r.s18.btns.join("|") === "Save a backup file|Choose a file|Cancel" && /v7-warn-q\d+ v7-warn-q\d+-s/.test(r.s18.group) && r.s18.role === "status" && /v7-warn/.test(r.s18.focus), r.s18);
  check("S15: the step the file opens on says Backup file “name” opened, with no \"set up for\" tail", /^Backup file (“.+” )?opened\.$/.test(r.banner || "") && !/set up for/.test(r.banner || ""), r);
  check("Open a backup file over a draft asks inline first (W-45, S18), then reopens the file on its saved step", r.warn === "Opening a backup file replaces your current draft." && r.n === 3 && r.comp === "Made-up Team Grants" && r.h === "Export" && !r.alert, r);

  r = await js(H + `window.confirm=()=>true; document.getElementById('v7-home').click(); await w(150);
    const a={title:q('.v7-path-new h2').innerText, tag:q('.v7-path-new').tagName, btns:qa('.v7-path-new button').length, rs:!!q('.v7-path-reset'), rsLabel:q('.v7-path-reset')?.innerText, note:q('.v7-path-foot-note')?.innerText||'', backupLink:q('.v7-path-backup .v7-linkbtn')?.innerText, backupLine:q('.v7-path-backup')?.innerText, ph:q('#v7-draft-name')?.placeholder, cardP:q('.v7-path-go p')?.innerText};
    q('.v7-path-reset').click(); await w(150);
    a.warn=q('.v7-path-new .v7-warn p, .v7-warn p')?.innerText; a.warnBtns=qa('.v7-warn .btn').map(b=>b.innerText); a.status=q('.v7-warn .v7-warn-status')?.innerText;
    a.keptWhileWarned=(JSON.parse(localStorage.getItem('ncv-v9')||'{}').contributions||[]).some(c=>(c.title||'').trim());
    a.saveStatusBefore=a.status; qa('.v7-warn .btn').find(b=>b.innerText==='Save a backup file').click(); await w(150);
    a.statusAfterSave=q('.v7-warn .v7-warn-status').innerText; a.warnStill=!!q('.v7-warn'); a.keptAfterSave=(JSON.parse(localStorage.getItem('ncv-v9')||'{}').contributions||[]).some(c=>(c.title||'').trim());
    qa('.v7-warn .btn').find(b=>b.innerText==='Clear draft').click(); await w(250);
    a.warnAfter=qa('.v7-warn').length;
    a.after=q('.v7-path-new h2')?.innerText; a.noReset=!q('.v7-path-reset'); a.saved=(JSON.parse(localStorage.getItem('ncv-v9')||'{}').contributions||[]).some(c=>(c.title||'').trim());
    return a;`);
  check("a saved draft puts Continue and Clear draft in one card (S8)", r.title === "Continue your draft" && r.tag === "DIV" && r.rs && r.rsLabel === "Clear draft" && r.note === "", r);
  check("S6: the Continue card reads Draft: “name” saved. and a Save a backup file link sits under it, outside the button", /^Draft(: “.+”)? saved\.$/.test(r.cardP) && r.backupLink === "Save a backup file" && /^\(Clearing your browser data erases it\. Save a backup file\.\)$/.test(r.backupLine), r);
  check("S7: the draft name's placeholder ends with the year", r.ph === "For example, SSHRC Insight Grant, fall 2026", r.ph);
  check("Clear draft opens one inline confirm with a status line and Save a backup file, Clear draft, Cancel; nothing is cleared yet (S8)", r.warn === "Clear your draft from this browser?" && r.warnBtns.join("|") === "Save a backup file|Clear draft|Cancel" && /^(Backup saved .+, no changes since\.|Your latest changes are not in a backup file\.)$/.test(r.status) && r.keptWhileWarned, r);
  check("S8: Save a backup file inside the confirm updates the status line in place and keeps the confirm open", /^Backup saved .+, no changes since\.$/.test(r.statusAfterSave) && r.warnStill && r.keptAfterSave, r);
  check("S8: one click on Clear draft clears at once, with no second question; the card reads Start your draft", r.warnAfter === 0 && r.after === "Start your draft" && r.noReset && !r.saved, r);

  console.log("V8 draft carried over, V6 draft and migrations");
  // V9.0: a draft saved by V8 (here the V6 fixture under ncv-v8) opens as the V9 draft on the first load, with no offer.
  await seed(null, "localStorage.setItem('ncv-v8'," + JSON.stringify(JSON.stringify(fixture)) + ");");
  r = await js(H + `await w(200); const st=JSON.parse(localStorage.getItem('ncv-v9')||'null'); const a={offer:!!q('.v7-v6-offer'), stored:!!st, carried:localStorage.getItem('ncv-v9-carried')};
    a.h=q('.narrative-stage-header h2').innerText; a.mentees=st.mentees.map(m=>m.stageKind+'/'+m.stageOther);
    a.ev=st.contributions.map(c=>c.evidence.length); a.folded=st.contributions.map(c=>c.folded); a.cids=st.contributions.every(c=>!!c.cid);
    a.v8=localStorage.getItem('ncv-v8')===${JSON.stringify(JSON.stringify(fixture))};
    return a;`);
  check("V8 draft opens as the V9 draft once, with no offer; the V8 copy is unchanged", !r.offer && r.stored && r.carried === "1" && r.v8, r);
  const r17 = await js(H + `return {box:!!q('.v7-v6-offer'), btns:qa('button').filter(b=>/V7 draft|Start without it/.test(b.innerText)).length, code:/v6Offer|v6Declined|v7-v6-offer/.test(document.documentElement.innerHTML)};`);
  check("S17: the V7 offer box, both buttons and the code behind them are gone", !r17.box && r17.btns === 0 && !r17.code, r17);
  { // The carry-over happens once: with the V9 draft gone (Clear draft), a reload does not bring the V8 draft back.
    const again = await js("localStorage.removeItem('ncv-v9'); return true;");
    await go(PAGE());
    const back = await js("return localStorage.getItem('ncv-v9') === null || !(JSON.parse(localStorage.getItem('ncv-v9')).contributions||[]).some(c=>(c.title||'').trim());");
    check("after Clear draft, a reload does not bring the V8 draft back", again && back, back);
    await seed(null, "localStorage.setItem('ncv-v8'," + JSON.stringify(JSON.stringify(fixture)) + ");");
  }
  check("saved Order step opens on Review", /^Review$/.test(r.h), r.h);
  // The V6 draft opens on Review; the fixture has data for four visuals.
  const gvs = await js("return [...document.querySelectorAll('[role=tab]')].map(f=>f.id).join(',') + '|' + !!document.querySelector('.v8-rm');");
  check("carried draft: Review shows the five tabs and Mentorship", gvs === "v8-tab-order,v8-tab-words,v8-tab-role,v8-tab-evidence,v8-tab-reach|true", gvs);

  check("trainee stages become choices; Other keeps the text", r.mentees.join(",") === "doctoral/,other/visiting researcher,masters/", r.mentees);
  check("blank evidence rows dropped; first card open, rest folded; stable ids", r.ev.join(",") === "1,0" && r.folded.join(",") === "false,true" && r.cids, r);
  for (const [k, want] of [["feedback", "Export"], ["xray", "Most significant"]]) {
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
    const p=q('.v7-ex-btn.is-primary'); a.pBold=parseInt(getComputedStyle(p).fontWeight)>=700; a.pColor=getComputedStyle(p).color;
    a.pFont=true; p.click(); await w(300);
    a.after=qa('.v7-ex-btn').map(b=>({exp:b.getAttribute('aria-expanded'), white:white(bg(b)), border:getComputedStyle(b).borderTopColor, tri:getComputedStyle(b.querySelector('.v7-tri')).transform}));
    a.prof=q('.v7-tailored-k').innerText; a.tailored=/Tailored for/.test(document.body.innerText);
    const ch=q('#v7-chg'), t=ch.querySelector('.v7-tri'); a.chg0={exp:ch.getAttribute('aria-expanded'), tri:getComputedStyle(t).transform, white:white(bg(ch))};
    ch.click(); await w(300); a.chg1={exp:ch.getAttribute('aria-expanded'), tri:getComputedStyle(ch.querySelector('.v7-tri')).transform, shade:bg(ch)};
    ch.click(); await w(300); a.chg2={exp:ch.getAttribute('aria-expanded'), tri:getComputedStyle(ch.querySelector('.v7-tri')).transform};
    return a;`);
  check("no example button has a fill at rest; the first has a bold burgundy label", r.rest.every(x => x.exp === "false" && x.white) && r.pBold && r.pColor === "rgb(145, 35, 56)", r);
  check("opening the example leaves it expanded, outlined and shaded, triangle down (it is the only example button; C2 removed the third)", r.after.length === 1 && r.after[0].exp === "true" && !r.after[0].white && r.after[0].border === "rgb(145, 35, 56)" && /matrix\(0(\.0\d*)?, 1/.test(r.after[0].tri), r);
  check("the bar reads Profile:, and Change carries a triangle that turns with aria-expanded, no fill at rest", r.prof === "Profile:" && !r.tailored && r.chg0.exp === "false" && r.chg0.tri === "none" && r.chg0.white && r.chg1.exp === "true" && /matrix\(0(\.0\d*)?, 1/.test(r.chg1.tri) && r.chg1.shade !== "rgb(255, 255, 255)" && r.chg2.exp === "false" && r.chg2.tri === "none", r);
  r = await js(H + `const card=q('.v7-card-col'), col=card.querySelector('nav.v7-fcol'), b=()=>qa('.v7-card-col .v7-fsq');
    const a={label:col.getAttribute('aria-label'), n:b().length, fields:card.querySelectorAll('.v7-f').length, on:b().filter(x=>x.classList.contains('is-on')).length, sr:card.querySelector('.v7-card-side .v7-prog-n').textContent, names:b().map(x=>x.getAttribute('aria-label'))};
    a.written=[...card.querySelectorAll('.v7-f')].filter(f=>f._has()).length + (/item/.test(card.querySelector('.v7-ev-s')?.innerText||'')?1:0);
    a.greenOk=b().filter(x=>x.classList.contains('is-on')&&!x.classList.contains('is-cur')).every(x=>getComputedStyle(x.querySelector('i')).backgroundColor==='rgb(42, 110, 42)');
    a.greyOk=b().filter(x=>!x.classList.contains('is-on')&&!x.classList.contains('is-cur')).every(x=>getComputedStyle(x.querySelector('i')).backgroundColor==='rgb(255, 255, 255)');
    const cr=col.getBoundingClientRect(), fr=card.querySelector('.v7-fields').getBoundingClientRect(); a.clear=cr.left>=fr.right; a.inCard=cr.right<=card.getBoundingClientRect().right;
    const tgt=b()[5]; tgt.click(); await w(700);
    a.open=q('.v7-f.is-open')?.dataset.f; a.want=tgt.dataset.for; a.focus=document.activeElement.id; a.cur=qa('.v7-card-col .v7-fsq[aria-current]').map(x=>x.dataset.for); a.tri=getComputedStyle(tgt.querySelector('i')).borderRightWidth; a.inView=(()=>{const r=q('.v7-f.is-open').getBoundingClientRect(); return r.top>=0&&r.top<innerHeight;})();
    await w(100); a.pos=getComputedStyle(col).position; a.ds=b().map(x=>{const id=x.dataset.for; const f=card.querySelector('.v7-f[data-f="'+id+'"]')||card.querySelector('.v7-ev-row, .v7-ev-area'); return f?Math.round(x.getBoundingClientRect().top-f.getBoundingClientRect().top):null;});
    const cq=card.querySelector('.v7-fsq.is-cur'), of=q('.v7-f.is-open .v9-pill')||q('.v7-f.is-open .v7-q'); a.triQ=cq&&of?Math.round((cq.getBoundingClientRect().top+12)-(of.getBoundingClientRect().top+of.getBoundingClientRect().height/2)):null;
    return a;`);
  check("desktop card column: a labelled nav with one button per field, named with its state; the spoken count stays", r.label === "Fields in contribution 1" && r.n === 9 && r.fields === 8 && /^Headline, (written|not written yet)$/.test(r.names[0]) && /^Evidence, /.test(r.names[8]) && /of 8 answered/.test(r.sr), r);
  check("green squares match the written fields; unwritten squares are grey outlines; the column sits clear of the writing", r.on === r.written && r.greenOk && r.greyOk && r.clear && r.inCard, r);
  check("clicking a square opens and focuses that field; it shows the triangle and aria-current", r.open === r.want && r.focus === r.want && r.cur.join() === r.want && r.tri === "10px" && r.inView, r);
  check("each square sits beside its own field, and the triangle is level with the open field's pill or question (V8.8, row 12)", r.pos === "relative" && r.ds.every(d => d !== null && d >= -4 && d <= 32) && r.triQ !== null && Math.abs(r.triQ) <= 14, { ds: r.ds, triQ: r.triQ });
  r = await js(H + `const card=q('.v7-card.v7-card-col'), sq=()=>qa('.v7-card-col .v7-fsq', card); await w(900);
    const id=sq()[4].dataset.for; card._level(id); await w(600);
    const a={id, cur:card.querySelector('.v7-fsq.is-cur')?.dataset.for, open:q('.v7-f.is-open')?.dataset.f, d:Math.round(q('.v7-f[data-f="'+id+'"]').getBoundingClientRect().top-sq()[4].getBoundingClientRect().top)};
    window.scrollTo(0,0); await w(100); return a;`);
  check("cards: scrolling leaves the triangle on the open field (V8.8)", r.cur === r.open, r);
  r = await js(H + `rail('Mentorship').click(); await w(150); const m=qa('.v7-card-col').length, hm=q('#v7-hm-t')?.innerText, hd=q('#v7-hm-t').closest('.v7-card').querySelector('.v7-card-h .v7-dots'), mn=hd?hd.children.length:0, mv=!!hd&&hd.getBoundingClientRect().width>2;
    rail('Personal statement').click(); await w(150); const p=q('.v7-card-col nav')?.getAttribute('aria-label'), pn=qa('.v7-card-col .v7-fsq').length;
    rail('Contributions').click(); await w(150); return {m, hm, mn, mv, p, pn};`);
  check("only long cards carry the column: Personal statement questions has it; Mentorship style and the person cards keep their header squares", r.m === 0 && r.hm === "Mentorship style" && r.mn === 3 && r.mv && r.p === "Fields in Personal statement questions" && r.pn >= 7, r);
  r = await js(H + `const seen=e=>!!e&&e.getBoundingClientRect().width>2; const fs=qa('.v7-card .v7-f');
    const st=f=>({c:['is-open','is-filled','is-empty'].find(c=>f.classList.contains(c)), pill:f.classList.contains('v7-pilled'), k:seen(f.querySelector('.v7-f-k')), q:seen(f.querySelector(':scope > .v7-q'))});
    const all=fs.map(st); const job=fs.find(f=>!f.classList.contains('is-filled')&&f.querySelector('.v7-q-dot'));
    return {all, both:all.filter(x=>x.k&&x.q&&!x.pill).length, filledOk:all.filter(x=>x.c==='is-filled').every(x=>x.k&&!x.q), otherOk:all.filter(x=>x.c!=='is-filled').every(x=>x.q&&(x.pill?x.k:!x.k)), nf:all.filter(x=>x.c==='is-filled').length, dot:job?seen(job.querySelector('.v7-q-dot')):null, kwSr:fs.every(f=>f.querySelector('.v7-f-k').textContent.trim().length>0)};`);
  check("cards: an answered field shows its keyword only, an open or empty field its question only; a part's name shows as a pill above its question (row 12); the keyword stays in the text", r.both === 0 && r.filledOk && r.otherOk && r.nf > 0 && r.dot !== false && r.kwSr, r);

  // Continue and Load land on Contributions for a confirmed profile (no saved application step).
  await seed(Object.assign({}, fixture, { stageKey: "setup", mode: "compose" }));
  r = await js(H + `const a={conf:JSON.parse(localStorage.getItem('ncv-v9')).profileConfirmed, h0:q('.narrative-stage-header h2')?.innerText, rail:qa('.v7-ri').map(b=>b.innerText.split('\\n')[0]).length};
    document.getElementById('v7-home').click(); await w(150); a.card=q('.v7-path-new h2').innerText; a.welcome=!!q('.v7-welcome, .v7-back-banner');
    q('.v7-path-go').click(); await w(200); a.h=q('.narrative-stage-header h2').innerText; return a;`);
  check("an old draft with application content migrates to a confirmed profile, rail shows the application", r.conf === true && /Most significant/.test(r.h0) && r.rail === 5, r);
  check("Continue resumes to Contributions for a confirmed profile", r.card === "Continue your draft" && /Most significant/.test(r.h), r);
  const loadFile = JSON.stringify({ format: "pathways-narrative-cv-draft", version: 1, draft: Object.assign({}, fixture, { profileConfirmed: true, stageKey: "setup", mode: "compose" }) });
  r = await js(H + `localStorage.removeItem('ncv-v9'); window.confirm=()=>true; window.alert=(m)=>{window.__a=m;};
    document.getElementById('v7-home').click(); await w(100);
    const ic=HTMLInputElement.prototype.click;
    HTMLInputElement.prototype.click=function(){ if(this.type==='file'){const dt=new DataTransfer(); dt.items.add(new File([${JSON.stringify(loadFile)}],'d.json',{type:'application/json'})); this.files=dt.files; this.dispatchEvent(new Event('change'));} };
    q('.v7-path-cont').click(); await w(150); await okWarn(); await w(150); HTMLInputElement.prototype.click=ic;
    return {h:q('.narrative-stage-header h2').innerText, alert:window.__a||''};`);
  check("Open a backup file resumes to Contributions for a confirmed profile", /Most significant/.test(r.h) && !r.alert, r);
  await seed({ mode: "compose", stageKey: "contrib", profileConfirmed: false, lens: { agency: "sshrc" }, contributions: [{ title: "x" }] });
  r = await js(H + "return {h:q('.narrative-stage-header h2')?.innerText, rail:qa('.v7-ri').map(b=>b.innerText.split('\\n')[0]).join('|')};");
  check("an unconfirmed profile is kept on Set up your profile, even with application content", /Set up your profile/.test(r.h) && r.rail === "Set up your profile", r);

  console.log("Change panel");
  await seed(Object.assign({}, fixture, { stageKey: "contrib", mode: "compose" }));
  r = await js(H + `const agency=()=>JSON.parse(localStorage.getItem('ncv-v9')).lens.agency; const a={ag0:agency()};
    const ch=q('#v7-chg'); a.exp0=ch.getAttribute('aria-expanded'); a.ctl0=ch.getAttribute('aria-controls'); ch.click(); await w(100); a.ctl=ch.getAttribute('aria-controls');
    a.exp1=ch.getAttribute('aria-expanded'); a.panel=!!q('#v7-chg-panel'); a.focusIn=q('#v7-chg-panel').contains(document.activeElement);
    a.ids=['ag','st','di','d2','yr'].map(k=>!!q('#v7-chg-'+k)); a.comp=!!q('#v7-chg-comp'); a.pills=qa('#v7-chg-panel [aria-pressed]').length;
    const other=[...q('#v7-chg-ag').options].map(o=>o.value).find(v=>v&&v!==a.ag0&&v!=='other'); a.other=other;
    setsel(q('#v7-chg-ag'),other); await w(50); a.stillSaved=agency()===a.ag0;
    document.activeElement.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true})); await w(100);
    a.esc={panel:!!q('#v7-chg-panel'), focus:document.activeElement.id, ag:agency(), exp:q('#v7-chg').getAttribute('aria-expanded')};
    q('#v7-chg').click(); await w(100); setsel(q('#v7-chg-ag'),other); await w(50);
    qa('#v7-chg-panel .btn').find(b=>b.innerText==='Confirm').click(); await w(200);
    a.ok={panel:!!q('#v7-chg-panel'), focus:document.activeElement.id, ag:agency(), pills:q('.v7-tailored-pills').innerText};
    q('#v7-chg').click(); await w(100); a.order=qa('#v7-chg-panel .v7-chg-f > .v7-field-label').map(l=>l.innerText); a.selFs=getComputedStyle(q('#v7-chg-ag')).fontSize; a.selH=Math.round(q('#v7-chg-ag').getBoundingClientRect().height); q('#v7-chg').click(); await w(100);
    q('#v7-chg').click(); await w(100); qa('#v7-chg-panel .btn').find(b=>b.innerText==='Clear draft').click(); await w(100);
    a.warn=q('#v7-chg-panel .v7-warn p')?.innerText; a.warnBtns=qa('#v7-chg-panel .v7-warn .btn').map(b=>b.innerText); a.kept=JSON.parse(localStorage.getItem('ncv-v9')).contributions.length>0;
    qa('#v7-chg-panel .v7-warn .btn').find(b=>b.innerText==='Cancel').click(); await w(100); a.warnGone=!q('.v7-warn'); a.kept2=JSON.parse(localStorage.getItem('ncv-v9')).contributions.length>0;
    return a;`);
  check("Change is a disclosure: aria-expanded flips, it controls the panel, and focus moves in", r.exp0 === "false" && r.exp1 === "true" && r.ctl0 === null && r.ctl === "v7-chg-panel" && r.panel && r.focusIn, r);
  check("the panel holds the six answers: agency, stage, field, second field, year, competition, work-mode pills", r.ids.every(Boolean) && r.comp && r.pills >= 4, r);
  check("Escape discards the edit, closes the panel and returns focus to Change", r.stillSaved && !r.esc.panel && r.esc.focus === "v7-chg" && r.esc.ag === r.ag0 && r.esc.exp === "false", r);
  check("Confirm applies the new answers, closes the panel and returns focus to Change", !r.ok.panel && r.ok.focus === "v7-chg" && r.ok.ag === r.other && r.ok.ag !== r.ag0, r);
  check("the Change panel follows Setup's order and labels the pills \"How your work usually happens\" (W-55)", r.order.join("|") === "Agency|Competition|Career stage|Field|Another field|How your work usually happens", r.order);
  check("desktop keeps the 14 px selects (the 16 px rule is phone only)", parseFloat(r.selFs) < 15 && r.selH < 44, [r.selFs, r.selH]);
  check("Clear draft inside the panel (renamed from Reset draft, S8) shows the one confirm with Clear draft and Cancel; Cancel keeps the work", /^Clear your draft from this browser\?/.test(r.warn || "") && r.warnBtns.join("|") === "Save a backup file|Clear draft|Cancel" && r.kept && r.warnGone && r.kept2, r);


  console.log("Phone width and reduced motion");
  await send("Emulation.setDeviceMetricsOverride", { width: 375, height: 812, deviceScaleFactor: 1, mobile: true });
  await seed(Object.assign({}, fixture, { stageKey: "contrib", mode: "compose" }));
  r = await js(H + `const out={}; const tg0=q('#v7-rail-toggle'); out.toggle=!!tg0&&getComputedStyle(tg0).display!=='none'; out.railH=Math.round(q('.narrative-progress-panel').getBoundingClientRect().height); if(tg0&&tg0.getAttribute('aria-expanded')==='false') tg0.click(); const names=qa('.v7-ri').map(b=>b.innerText.split('\\n')[0]); out.names=names; for (const t of names) { rail(t).click(); await w(120); out[t]=document.documentElement.scrollWidth; if (t==='Review') out.mv=Math.round(q('.v8-mv .btn')?.getBoundingClientRect().height||0); } rail('Contributions').click(); await w(100); out.reset=!!q('.v7-reset'); out.setup=names.indexOf('Set up your profile'); return out;`);
  check("no sideways scroll on any step at 375 px", r.names.length === 5 && r.names.every(k => r[k] <= 375), r);
  check("phone: the rail is one row until opened, so the step starts near the top (W-54)", r.toggle && r.railH <= 60, r);
  check("order buttons are at least 44 px (D-14); the phone rail has no Reset and no Set up your profile after confirming", r.mv >= 44 && !r.reset && r.setup === -1, r);
  r = await js(H + `rail('Contributions').click(); await w(100); window.scrollTo(0,0); q('#v7-chg').click(); await w(150); const o={sw:document.documentElement.scrollWidth, open:!!q('#v7-chg-panel'), right:Math.round(q('#v7-chg-panel').getBoundingClientRect().right)}; q('#v7-chg').click(); await w(60); return o;`);
  check("no sideways scroll at 375 px with the Change panel open", r.open && r.sw <= 375 && r.right <= 375, r);
  r = await js(H + `rail('Contributions').click(); await w(150); const card=q('.v7-card-col'), h=card.querySelector('.v7-card-h');
    window.scrollTo(0, card.getBoundingClientRect().top+scrollY+300); await w(150);
    return {col:getComputedStyle(card.querySelector('.v7-fcol')).display, pos:getComputedStyle(h).position, top:Math.round(h.getBoundingClientRect().top), bar:q('.proto-banner').offsetHeight, dots:h.querySelectorAll('.v7-dots i').length, sw:document.documentElement.scrollWidth, right:Math.round(h.getBoundingClientRect().right)};`);
  check("phone: the card header row (title and squares) sticks under the top bar, no column, no sideways scroll", r.col === "none" && r.pos === "sticky" && Math.abs(r.top - r.bar) <= 1 && r.dots === 8 && r.sw <= 375 && r.right <= 375, r);
  console.log("Phone layout and CSS (walkthrough batch 2)");
  r = await js(H + `rail('Contributions').click(); await w(150); const word='https://example.org/'+'x'.repeat(100); const a={len:word.length};
    const st=q('.v7-card [data-f$="-stakes"] .v7-box'); st.focus(); setv(st,word); await w(100);
    const hd=q('.v7-card [data-f$="-title"] .v7-box'); hd.focus(); setv(hd,'A made-up headline about a very long programme of records and registries across many sites'); await w(100);
    q('.v7-card [data-f$="-roleLine"] .v7-box').focus(); await w(300);
    a.sw=document.documentElement.scrollWidth;
    const h=q('.v7-card-col > .v7-card-h'), t=h.querySelector('.v7-card-t'), num=t.querySelector('.v7-num'), rest=t.querySelector('.v7-num + span');
    a.numShown=num.getBoundingClientRect().width>=num.scrollWidth-1 && num.getBoundingClientRect().right<=t.getBoundingClientRect().right; a.numText=num.innerText;
    a.ell=getComputedStyle(rest).textOverflow==='ellipsis' && rest.scrollWidth>rest.clientWidth; a.hTitle=t.innerText; a.hRight=Math.round(h.getBoundingClientRect().right);
    return a;`);
  check("phone: a 120-character unbroken word in The problem or question leaves no sideways scroll", r.sw <= 375, r);
  check("phone: the sticky card header keeps \"Contribution 1\" whole and shortens the headline with an ellipsis", r.numShown && r.numText === "Contribution 1" && r.ell && r.hRight <= 375, r);
  r = await js(H + `const a={}; const fs=(s)=>{const e=q(s); return e?parseFloat(getComputedStyle(e).fontSize):null;}; const hh=(s)=>{const e=q(s); return e?Math.round(e.getBoundingClientRect().height):null;};
    a.box=fs('.v7-card .v7-box'); window.scrollTo(0,0); q('#v7-chg').click(); await w(150);
    a.sel=fs('#v7-chg-ag'); a.selH=hh('#v7-chg-ag'); a.inp=fs('#v7-chg-comp'); a.inpH=hh('#v7-chg-comp'); a.yrH=hh('#v7-chg-yr'); q('#v7-chg').click(); await w(60);
    a.icon=[hh('.v7-icon-btn'), Math.round(q('.v7-icon-btn').getBoundingClientRect().width)]; { const tg=q('#v7-rail-toggle'); if(tg&&tg.getAttribute('aria-expanded')==='false') { tg.click(); await w(60); } a.toggleH=Math.round(tg.getBoundingClientRect().height); } a.foot=qa('.v7-rail-foot button').map(b=>Math.round(b.getBoundingClientRect().height));
    rail('Mentorship').click(); await w(200); a.tile=hh('.v7-tile input');
    return a;`);
  check("phone: text boxes, inputs and selects are 16 px, so iOS Safari does not zoom on focus", r.box === 16 && r.sel === 16 && r.inp === 16, r);
  check("phone: selects, inputs, icon buttons, rail-foot buttons and the mentorship count boxes are at least 44 px", r.selH >= 44 && r.inpH >= 44 && r.yrH >= 44 && r.icon[0] >= 44 && r.icon[1] >= 44 && r.foot.every(x => x >= 44) && r.tile >= 44, r);
  r = await js(H + `rail('Review').click(); await w(300); const a={}; a.sw=document.documentElement.scrollWidth;
    const art=q('.v7-gv-art'), sv=art.querySelector('svg'); a.n=qa('.v7-gv-art').length; a.ov=getComputedStyle(art).overflowX; a.svw=Math.round(sv.getBoundingClientRect().width); a.artw=Math.round(art.getBoundingClientRect().width);
    const rv=rail('Review').cloneNode(true); rv.classList.remove('is-active'); rv.classList.add('is-done','is-ghost'); rail('Review').parentNode.appendChild(rv);
    const done=rail('Contributions').cloneNode(true); done.classList.remove('is-active','is-ghost'); done.classList.add('is-done'); rail('Review').parentNode.appendChild(done);
    a.ghostDot=getComputedStyle(rv.querySelector('.narrative-stage-dot')).backgroundColor; a.doneDot=getComputedStyle(done.querySelector('.narrative-stage-dot')).backgroundColor; rv.remove(); done.remove();
    return a;`);
  check("phone: the charts keep at least 440 px of drawing width inside a sideways-scrolling figure, and the page does not scroll", r.n >= 1 && r.ov === "auto" && r.svw >= 440 && r.artw < r.svw && r.sw <= 375, r);
  check("a locked Review (done and ghosted) shows no green circle in the rail; a finished step still does", r.ghostDot !== r.doneDot && r.doneDot !== "rgba(0, 0, 0, 0)", r);
  await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
  r = await js(H + `rail('Export').click(); await w(300); const b=q('.v7-quiet-btn'); b.scrollIntoView({block:'center'}); await w(100); const rc=b.getBoundingClientRect(); return {x:rc.left+rc.width/2, y:rc.top+rc.height/2, n:qa('.v7-quiet-btn').length, c0:getComputedStyle(b).color};`);
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: r.x, y: r.y });
  await sleep(300);
  const hov = await js(`const b=document.querySelector('.v7-quiet-btn'); return {hover:b.matches(':hover'), c:getComputedStyle(b).color};`);
  check("desktop: Print view and Copy draft keep a visible colour on hover (burgundy, not white)", r.n === 2 && hov.hover && hov.c === "rgb(145, 35, 56)", [r, hov]);
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 1, y: 1 });
  await send("Emulation.setDeviceMetricsOverride", { width: 375, height: 812, deviceScaleFactor: 1, mobile: true });
  await seed(null);
  r = await js(H + `q('.v7-path-new').click(); await w(150); q('#ag-frq').click(); await w(60); setv(q('#v7-comp'),'Made-up Team Grants'); await w(60); q('#st-mid').click(); await w(60); q('#di-health').click(); await w(60);
    const row=q('.v7-qcount'); window.scrollTo(0, q('.v7-prof-list').getBoundingClientRect().top+scrollY+500); await w(150);
    return {pos:getComputedStyle(row).position, top:Math.round(row.getBoundingClientRect().top), bar:q('.proto-banner').offsetHeight, dots:row.querySelectorAll('.v7-dots i').length, on:row.querySelectorAll('.v7-dots i.on').length, col:getComputedStyle(q('.v7-prof-col .v7-fcol')).display, sw:document.documentElement.scrollWidth, right:Math.round(row.getBoundingClientRect().right)};`);
  check("phone Setup: the row of six squares sticks under the top bar, no column, no sideways scroll", r.pos === "sticky" && Math.abs(r.top - r.bar) <= 1 && r.dots === 6 && r.on === 4 && r.col === "none" && r.sw <= 375 && r.right <= 375, r);
  await seed(null);
  r = await js(H + `q('.v7-path-new').click(); await w(150); q('#ag-frq').click(); await w(150); q('#v7-undecided').click(); await w(600);
    const row=q('.v7-qcount'), blk=q('.v7-qblock[data-pq="2"]');
    return {focus:document.activeElement.id, y:Math.round(scrollY), gap:Math.round(blk.getBoundingClientRect().top-row.getBoundingClientRect().bottom)};`);
  check("phone Setup: after an answer the next question comes up under the row of squares, with focus on its heading", r.focus === "pq2" && r.y > 0 && r.gap >= 0 && r.gap <= 16, r);
  await seed(Object.assign({}, fixture, { stageKey: "contrib", mode: "compose" }));
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  r = await js("return getComputedStyle(document.querySelector('.v7-f')).transitionDuration;");
  check("reduced motion turns field transitions off", String(r).split(",").every(x => parseFloat(x) < 0.001), r); // r17-b-5: 0.01 ms counts as off
  await send("Emulation.setEmulatedMedia", { features: [] });

  console.log("Focus and announcements (walkthrough batch 1)");
  await seed(null);
  r = await js(H + `const hd=()=>{const e=document.activeElement; return e&&e.matches('#v4-stage-content .narrative-stage-header h2')?e.innerText:(e&&(e.id||e.tagName));};
    const live=q('#v7-live'); const a={liveAtLoad:!!live&&live.getAttribute('aria-live')==='polite'&&live.textContent==='', bannerLive:q('.proto-banner').hasAttribute('aria-live')||q('.proto-banner').hasAttribute('role')};
    a.firstTab=q('a[href], button:not([disabled]), input, select, textarea')?.id;
    q('.v7-path-new').click(); await w(150); a.start=hd();
    q('#ag-sshrc').click(); await w(400); a.afterAnswer=document.activeElement.id;
    setv(q('#v7-comp'),'Made-up Team Grants'); await w(80);
    const g=()=>qa('[aria-labelledby="pq2"] [role=radio]'); a.stops0=g().filter(b=>b.tabIndex===0).map(b=>b.id);
    g()[0].focus(); g()[0].dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true})); await w(150);
    a.arrow={focus:document.activeElement.id, checked:g().filter(b=>b.getAttribute('aria-checked')==='true').map(b=>b.id), stops:g().filter(b=>b.tabIndex===0).map(b=>b.id), blocks:qa('.v7-qblock').length};
    q('#di-health').click(); await w(80); q('#d2-none').click(); await w(80); q('#wm-team').click(); await w(80);
    document.activeElement.blur(); q('#v7-skip').click(); await w(60); a.skip=hd();
    nav(/Confirm profile/).click(); await w(200); a.confirm=hd();
    return a;`);
  check("the live region is in the page, empty, at load; the top bar is not a status region", r.liveAtLoad && !r.bannerLive, r);
  check("the skip link is the first focusable element and moves focus to the step heading", r.firstTab === "v7-skip" && r.skip === "Set up your profile", r);
  check("focus lands on the step heading after Start and after Confirm profile", r.start === "Set up your profile" && /Most significant/.test(r.confirm || ""), r);
  check("after a Setup answer focus moves to the next question's heading", r.afterAnswer === "pq1", r);
  check("a choice group is one Tab stop, and the arrow keys move focus and selection without moving on", r.stops0.length === 1 && r.arrow.focus === r.arrow.checked[0] && r.arrow.checked.length === 1 && r.arrow.checked[0] !== r.stops0[0] && r.arrow.stops.join() === r.arrow.checked.join() && r.arrow.blocks >= 4, r);
  r = await js(H + `const a={}; const card=q('.v7-card-col'); a.colLast=card.lastElementChild.matches('nav.v7-fcol');
    await w(300); const closed=qa('.v7-card .v7-f:not(.is-open) .v7-f-more'); const ctl=closed.flatMap(m=>qa('.v7-f:not(.is-open) .v7-f-more button, .v7-f:not(.is-open) .v7-f-more input, .v7-f:not(.is-open) .v7-f-more textarea, .v7-f:not(.is-open) .v7-f-more a'));
    a.hidden=[...new Set(ctl)].map(x=>getComputedStyle(x).visibility); a.levels=qa('.v7-f:not(.is-open) .v7-levels .v7-mini').length;
    const h=q('[data-f$="-title"] .v7-box'); setv(h,'A made-up headline'); const st=q('[data-f$="-stakes"] .v7-box'); st.focus(); setv(st,'A made-up stake.'); await w(2300); a.count=q('#v7-live').textContent;
    const rl=q('[data-f$="-roleLine"] .v7-box'); rl.focus(); await w(300); a.openLevels=qa('[data-f$="-roleLine"] .v7-mini').map(x=>getComputedStyle(x).visibility);
    const cid=q('[id^=ev-open-]').id.slice(8); q('#ev-open-'+cid).click(); await w(200);
    const f1=document.activeElement; a.ev={kind:f1.classList.contains('v7-kind'), first:f1===q('.v7-ev-item .v7-kind'), editId:q('.v7-strip.is-top button')?.id, editName:q('.v7-strip.is-top button')?.getAttribute('aria-label'), dupe:qa('[id="ev-open-'+cid+'"]').length};
    q('#ev-add-'+cid).click(); await w(150); const f2=document.activeElement; a.add={kind:f2.classList.contains('v7-kind'), item:qa('.v7-ev-item').indexOf(f2.closest('.v7-ev-item'))};
    q('.v7-ev-item:nth-child(2) .v7-ev-rm').click(); await w(150); a.evRm=q('#v7-live').textContent;
    q('.v7-strip.is-top button').click(); await w(150); a.editBack=document.activeElement.classList.contains('v7-box');
    rail('Mentorship').click(); await w(150); a.rail=document.activeElement.matches('.narrative-stage-header h2'); a.liveAfter=q('#v7-live').textContent;
    rail('Contributions').click(); await w(150); window.confirm=()=>true;
    q('#v7-add-contrib').click(); await w(150); qa('.v7-card .v7-icon-btn[aria-label^="Remove contribution"]')[0].click(); await w(150); await okWarn();
    a.rmC={focus:document.activeElement.id, live:q('#v7-live').textContent, cards:qa('.v7-card-col, .v7-fold').length};
    rail('Mentorship').click(); await w(150); q('#v7-add-person').click(); await w(150);
    q('.v7-icon-btn[aria-label="Remove person B"]').click(); await w(150); await okWarn();
    a.rmP={focus:document.activeElement.id, live:q('#v7-live').textContent};
    return a;`);
  check("the card's column comes after its fields in the Tab order", r.colLast, r);
  check("no focusable control inside a closed field; the role levels show once the field opens", r.levels === 6 && r.hidden.length >= 3 && r.hidden.every(v => v === "hidden") && r.openLevels.every(v => v === "visible"), r);
  check("the last count is announced after the throttle window", r.count === "2 of 8 answered", r.count);
  check("+ Add evidence focuses the first kind card; the strip's Edit has its own id and name", r.ev.kind && r.ev.first && /^ev-edit-/.test(r.ev.editId) && r.ev.dupe === 0 && /^Edit the writing for contribution 1$/.test(r.ev.editName), r.ev);
  check("+ Add another item focuses the new item's first kind card; removing an item is announced", r.add.kind && r.add.item === 1 && r.evRm === "Evidence item b removed.", r);
  check("the strip's Edit closes the evidence view with focus in the open field", r.editBack, r);
  check("a rail click focuses the step heading and empties the live region", r.rail && r.liveAfter === "", r);
  check("removing a contribution focuses the remaining card and announces it", /^(ct|fold-)/.test(r.rmC.focus) && r.rmC.live === "Contribution 2 removed." && r.rmC.cards === 1, r.rmC);
  check("removing a person focuses the person now in that place and announces it", /^(v7-ph|pfold-)0$/.test(r.rmP.focus) && r.rmP.live === "Person B removed.", r.rmP);
  r = await js(H + `localStorage.removeItem('ncv-v9'); window.confirm=()=>true; document.getElementById('v7-home').click(); await w(100);
    const ic=HTMLInputElement.prototype.click;
    HTMLInputElement.prototype.click=function(){ if(this.type==='file'){const dt=new DataTransfer(); dt.items.add(new File([${JSON.stringify(loadFile)}],'d.json',{type:'application/json'})); this.files=dt.files; this.dispatchEvent(new Event('change'));} };
    q('.v7-path-cont').click(); await w(150); await okWarn(); await w(150); HTMLInputElement.prototype.click=ic;
    const a={load:document.activeElement.matches('.narrative-stage-header h2')?document.activeElement.innerText:document.activeElement.id};
    return a;`);
  check("focus lands on the step heading after Load", /Most significant/.test(r.load || ""), r);

  console.log("Audit loop, round 1 (2026-10-31)");
  {
    const base = Object.assign({}, fixture, { profileConfirmed: true, mode: "compose", stageKey: "contrib", ui: { profileNote: false } });
    const st1 = JSON.parse(JSON.stringify(base));
    st1.contributions[0].stakes = "First line of the stakes\nsecond line of the stakes";
    st1.contributions[0].evidence = [{ text: "Made-up report (2025).", type: "Policy / practice uptake", note: "A made-up note on why it matters." }];
    st1.contributions[0].outputs = "Results at https://example.org/made-up and more.";
    await seed(st1);
    r = await js(H + `const a={};
      rail('Mentorship').click(); await w(150);
      const t=q('#v7-t-phd'); t.focus(); setv(t,'-2'); a.neg=t.value; setv(t,'2.5'); a.dec=t.value; setv(t,'1500'); a.big=t.value;
      a.saved=JSON.parse(localStorage.getItem('ncv-v9')).mentorCounts.phd;
      rail('Export').click(); await w(200);
      a.note=!!qa('.v7-draft-body .v7-ref-note').find(x=>/made-up note/.test(x.textContent));
      rail('Review').click(); await w(200);
      a.links=qa('.v7-glance .v7-tile-k').map(x=>x.innerText); a.linkItems=qa('.v7-glance a').map(x=>x.innerText).filter(t=>/What resulted/.test(t));
      rail('Export').click(); await w(150);
      a.bar=!!q('.v7-tailored #v7-chg'); q('#v7-chg').click(); await w(150); a.panel=!!q('#v7-chg-panel'); a.h=q('.narrative-stage-header h2').innerText;
      const comp=q('#v7-chg-comp'); setv(comp,'   '); qa('#v7-chg-panel .btn-primary').find(b=>/Confirm/.test(b.innerText)).click(); await w(200);
      a.after=q('.narrative-stage-header h2').innerText; a.prog=JSON.parse(localStorage.getItem('ncv-v9')).lens.program;
      return a;`);
    check("mentorship totals keep whole numbers 0 to 999 (W-22)", r.neg === "2" && r.dec === "2" && r.big === "999" && r.saved === "999", r);
    check("the on-screen draft shows each evidence note (W-15)", r.note, r);
    check("a link in a TCV draft is listed on Review under Links to remove (r1-a-2)", r.links.some(t => /Links to remove/i.test(t)) && r.linkItems.length >= 1, r);
    check("Export's Change opens the panel in place; Confirm stays on Export; a spaces-only name is stored empty (W-43, W-37)", r.bar && r.panel && /Export/.test(r.h) && /Export/.test(r.after) && r.prog === "", r);
    r = await js(H + `const a={};
      rail('Personal statement').click(); await w(150); a.fit=(q('[data-f="ps-programFit"] .v7-q')||{}).innerText||'';
      const txt = await new Promise(res=>{ const oc=URL.createObjectURL; URL.createObjectURL=(b)=>{ b.text().then(res); URL.createObjectURL=oc; return 'blob:x'; }; const ocl=HTMLAnchorElement.prototype.click; HTMLAnchorElement.prototype.click=function(){ a.name=this.download; HTMLAnchorElement.prototype.click=ocl; };
        rail('Export').click(); setTimeout(()=>{ const r=qa('.v7-fmt [role=radio]').find(b=>/Plain text/.test(b.innerText)); r.click(); setTimeout(()=>{ qa('.v7-actions .btn-primary')[0].click(); },150); },150); });
      a.oneLine=/First line of the stakes second line of the stakes/.test(txt); a.txt=txt.slice(0,300);
      return a;`);
    check("a spaces-only competition falls back to the no-competition question (W-37)", /Which competition/.test(r.fit), r.fit);
    check("line breaks inside a field become one paragraph in the .txt; the file name carries the agency (W-18, W-19)", r.oneLine && r.name === "narrative-cv-draft-sshrc.txt", r);
    // Setup: the competition survives Undecided on and off; the Confirm click lands while the last question is restyled.
    await seed(null);
    r = await js(H + `q('.v7-path-new').click(); await w(150); const a={};
      q('#ag-sshrc').click(); await w(150); const c=q('#v7-comp'); c.focus(); setv(c,'Made-up Grants  '); c.blur(); await w(60);
      a.trim=JSON.parse(localStorage.getItem('ncv-v9')).lens.program;
      q('#v7-undecided').click(); await w(150); a.on=q('#v7-undecided').getAttribute('aria-pressed'); a.emptied=q('#v7-comp').value; a.disabled=q('#v7-comp').disabled; a.note=!!q('#v7-comp-und');
      setv(q('#v7-comp'),'Made-up Grants'); await w(150); a.offByTyping=q('#v7-undecided').getAttribute('aria-pressed'); a.live=q('#v7-live').textContent; a.kept=q('#v7-comp').value; a.undecidedSaved=JSON.parse(localStorage.getItem('ncv-v9')).lens.undecided;
      q('#v7-undecided').click(); await w(150); a.emptied2=q('#v7-comp').value; q('#v7-undecided').click(); await w(150); a.offByButton=q('#v7-undecided').getAttribute('aria-pressed'); setv(q('#v7-comp'),'Made-up Grants'); await w(100);
      q('#st-mid').click(); await w(100); q('#di-health').click(); await w(100); q('#d2-none').click(); await w(100); q('#wm-team').click(); await w(150);
      const last=q('.v7-qblock[data-pq="5"]'); q('#wm-team').focus(); await w(50); a.focusQ=last.classList.contains('has-focus');
      const btn=qa('.narrative-nav .btn').find(b=>/Confirm profile/.test(b.innerText));
      document.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true})); btn.focus(); await w(50);
      a.held=last.classList.contains('has-focus');
      document.dispatchEvent(new PointerEvent('pointerup',{bubbles:true})); await w(50); a.released=!last.classList.contains('has-focus');
      return a;`);
    check("Setup: the competition loses surrounding spaces on blur (r1-a-4, W-36)", r.trim === "Made-up Grants", r);
    check("P5: pressing Undecided empties the field, which is never disabled, and no note is shown", r.on === "true" && r.emptied === "" && r.disabled === false && r.note === false && r.emptied2 === "" && r.offByButton === "false", r);
    check("P5: typing in the field turns Undecided off, announced \"Undecided turned off.\"", r.offByTyping === "false" && /Undecided turned off\./.test(r.live) && r.kept === "Made-up Grants" && r.undecidedSaved === false, r);
    check("Setup: an answered question keeps its question text while the pointer is down, so the Confirm click lands (r1-b-1)", r.focusQ && r.held && r.released, r);

  // Language notes P1 to P10 (Set up your profile) and P9's new work-mode answers.
  console.log("Setup wording and work modes (P1 to P10)");
  await seed(null);
  r = await js(H + `q('.v7-path-new').click(); await w(200); const a={};
    a.lede=document.body.innerText; a.topNote=!!q('.v7-note');
    a.nav0=q('.v7-nav-note')?.innerText; a.q1=q('#pq0').innerText; a.h1=q('.v7-qblock[data-pq="0"] .v7-explain').innerText; a.opts1=qa('#pq0 ~ .v7-choices .v7-choice b, .v7-qblock[data-pq="0"] .v7-choice b').map(x=>x.innerText).join('|');
    q('#ag-sshrc').click(); await w(200);
    a.nav1=q('.v7-nav-note')?.innerText; a.q2=q('#pq1').innerText; a.h2=q('.v7-qblock[data-pq="1"] .v7-explain').innerText; a.clearYear=!!q('.v7-lv-clear');
    q('#v7-year-' + (new Date().getFullYear()+1)).click(); await w(100); a.clearYear2=!!q('.v7-lv-clear'); a.und=q('#v7-undecided').innerText; a.compLab=q('label[for="v7-comp"]').innerText;
    setv(q('#v7-comp'),'Made-up Grants'); await w(150);
    a.q3=q('#pq2').innerText; a.h3=q('.v7-qblock[data-pq="2"] .v7-explain').innerText; a.opts3=qa('.v7-qblock[data-pq="2"] .v7-choice b').map(x=>x.innerText).join('|'); a.subs3=qa('.v7-qblock[data-pq="2"] .v7-choice small').length;
    q('#st-mid').click(); await w(150);
    a.q4=q('#pq3').innerText; a.h4=q('.v7-qblock[data-pq="3"] .v7-explain').innerText; a.miss=q('.v7-qblock[data-pq="3"] .v7-quiet').innerText; a.subs4=qa('.v7-qblock[data-pq="3"] .v7-choice small').length;
    q('#di-health').click(); await w(150);
    a.q5=q('#pq4').innerText; a.opts5=qa('.v7-qblock[data-pq="4"] .v7-choice b').map(x=>x.innerText).join('|');
    q('#d2-social').click(); await w(150); a.msg0=!!q('.v7-qblock[data-pq="4"] .v7-prof-msg');
    q('#di-social').click(); await w(200); const pm=q('.v7-qblock[data-pq="4"] .v7-prof-msg'); a.msg=pm&&pm.innerText; a.msgLive=q('#v7-live').textContent; a.d2after=JSON.parse(localStorage.getItem('ncv-v9')).lens.discipline2;
    q('#d2-none').click(); await w(200); a.msgGone=!q('.v7-prof-msg');
    a.q6=q('#pq5').innerText; a.opts6=qa('.v7-qblock[data-pq="5"] .v7-choice').map(x=>x.querySelector('b').innerText+' / '+(x.querySelector('small')||{innerText:''}).innerText);
    a.nav5=q('.v7-nav-note')?.innerText;
    q('#wm-team').click(); await w(100); a.noMsg=!q('.v7-prof-msg'); q('#wm-solo').click(); await w(200);
    const sm=q('.v7-qblock[data-pq="5"] .v7-prof-msg'); a.swap=sm&&sm.innerText; a.swapLive=q('#v7-live').textContent; a.wmAfter=JSON.parse(localStorage.getItem('ncv-v9')).lens.workMode.join(',');
    q('#wm-nonprofit').click(); await w(150); a.swapGone=!q('.v7-prof-msg'); a.wm3=JSON.parse(localStorage.getItem('ncv-v9')).lens.workMode.join(',');
    a.lastLive=''; for (let i=0;i<40&&!/Please confirm your profile/.test(a.lastLive);i++){ await w(100); a.lastLive=q('#v7-live').textContent; }
    a.noteBeside=q('.narrative-nav .v7-nav-note')?.innerText; a.confirmBtn=!!nav(/Confirm profile/);
    return a;`);
  check("P1: the intro reads \"Questions and fictional examples will be tailored to your profile.\"; the top note about changing answers is gone (P2)", /Questions and fictional examples will be tailored to your profile\./.test(r.lede) && !r.topNote, r);
  check("P3: one line under the questions, \"To continue, please answer “[question]”.\"", r.nav0 === "To continue, please answer “Agency”." && r.nav1 === "To continue, please answer “Competition”." && r.nav5 === "To continue, please answer “How your work usually happens”.", r);
  check("P4: the agency question and its help read as decided", r.q1 === "Which agency are you applying to?" && r.h1 === "The agency sets your CV format: the Tri-agency CV (TCV) for SSHRC, NSERC and CIHR, or the CV-FRQ for the Fonds de recherche du Québec. If you are not sure, the program’s application guide names the format.", r);
  check("P5: the competition question and help read as decided; Clear the year is gone; label, Undecided and year stay", r.q2 === "Which competition are you applying to?" && r.h2 === "A narrative CV is written for one competition. If you have not chosen one yet, please select Undecided." && !r.clearYear && !r.clearYear2 && r.und === "Undecided" && r.compLab === "Competition", r);
  check("P6, D1a: the career-stage help reads as decided and the three answers carry no grey lines", r.q3 === "Which career stage are you at?" && r.h3 === "If your competition defines early career, please use its definition." && r.opts3 === "Early career|Mid-career|Senior" && r.subs3 === 0, r);
  check("P7: the field help line asks for the most related field; the fields carry no grey lines (D1)", r.h4 === "If you change your field later, your draft stays the same." && /^If your field is not listed, please choose the most related one and let us know at impact@concordia\.ca\.$/.test(r.miss) && r.subs4 === 0, r);
  check("P8: the other-fields question and first answer read as decided", r.q5 === "Does your work also involve other fields? If so, choose the main one." && /^No\|/.test(r.opts5) && !/just this one/.test(r.opts5), r);
  check("P8: changing the main field to the other field clears the other field, shows the message under the question and announces it", !r.msg0 && r.msg === "Social sciences is now your main field. Please choose your other field again." && r.msgLive === r.msg && r.d2after === "" && r.msgGone, r);
  check("P9: the nine answers, each with its grey line", r.opts6.join("||") === [
    "Team-based / You work as part of a research team or lab.", "Community-engaged / You work with communities or community organizations.",
    "Indigenous communities / You work with First Nations, Inuit or Métis communities, organizations or governments.", "Solo / You do most of the work on your own.",
    "Industry / You work with companies, from start-ups to large firms.", "Public sector / You work with governments or public agencies.",
    "Health system / You work with hospitals, clinics or health authorities.", "Non-profit / You work with charities, foundations or NGOs.",
    "Cultural sector / You work with museums, galleries, archives or festivals."].join("||"), r.opts6);
  check("P9: Team-based and Solo replace each other with \"You can choose Team-based or Solo, not both.\", shown under the question and announced; other answers add without it", r.noMsg && r.swap === "You can choose Team-based or Solo, not both." && r.swapLive === r.swap && r.wmAfter === "solo" && r.swapGone && r.wm3 === "solo,nonprofit", r);
  check("P10: with all six answered the spoken line reads \"All questions answered. Please confirm your profile.\"; P2a: \"You can change your profile at any time.\" sits beside Confirm profile", /All questions answered\. Please confirm your profile\./.test(r.lastLive) && r.noteBeside === "You can change your profile at any time." && r.confirmBtn, r);

  // P2 on a later visit and P9's migration of a saved "Partnered with industry, government or health systems".
  const oldMode = "Partnered with industry, government or health systems";
  const stOld = Object.assign({}, fixture, { stageKey: "contrib", mode: "compose", profileConfirmed: true, lens: Object.assign({}, fixture.lens, { discipline: "social", workMode: [oldMode, "team"] }) });
  await seed(stOld);
  r = await js(H + `await w(300); return { pills:q('.v7-tailored-pills').innerText, wm:JSON.parse(localStorage.getItem('ncv-v9')).lens.workMode.join(',') };`);
  check("P9: a draft saved in this browser with the old \"Partnered…\" answer opens as Industry", /Industry/.test(r.pills) && !/Partnered/.test(r.pills), r);
  const oldFile = JSON.stringify({ format: "pathways-narrative-cv-draft", version: 1, draft: stOld });
  await seed(null);
  r = await js(H + `window.confirm=()=>true; const ic=HTMLInputElement.prototype.click;
    HTMLInputElement.prototype.click=function(){ if(this.type==='file'){const dt=new DataTransfer(); dt.items.add(new File([${JSON.stringify(oldFile)}],'d.json',{type:'application/json'})); this.files=dt.files; this.dispatchEvent(new Event('change'));} };
    q('.v7-path-cont').click(); await w(300); HTMLInputElement.prototype.click=ic; return { pills:(q('.v7-tailored-pills')||{}).innerText||'' };`);
  check("P9: a backup file with the old \"Partnered…\" answer opens as Industry", /Industry/.test(r.pills) && !/Partnered/.test(r.pills), r);

  // P9: every new answer shows a worked example, borrowed from the community or the partnered group.
  const exampleFor = async (wm) => {
    await seed(Object.assign({}, fixture, { stageKey: "contrib", mode: "compose", profileConfirmed: true, lens: Object.assign({}, fixture.lens, { discipline: "social", discipline2: "", workMode: wm }) }));
    return await js(H + `await w(300); const b=q('#v7-ex-finished'); if(b.getAttribute('aria-expanded')!=='true'){ b.click(); await w(200); } const x=q('#v7-exbox'); return { t:x?x.innerText:'', n:x?x.querySelectorAll('.v7-ex-seg, .v7-seg, mark, span[class*=job]').length:0 };`);
  };
  const exs = {}; for (const m of ["community", "indigenous", "industry", "publicsector", "healthsystem", "nonprofit", "cultural"]) exs[m] = await exampleFor([m]);
  check("P9: Indigenous communities uses the community-engaged example", exs.indigenous.t.length > 300 && exs.indigenous.t === exs.community.t, exs.indigenous.t.slice(0, 120));
  check("P9: Public sector, Health system, Non-profit and Cultural sector use the Industry example", exs.industry.t.length > 300 && ["publicsector", "healthsystem", "nonprofit", "cultural"].every(m => exs[m].t === exs.industry.t), ["publicsector", "healthsystem", "nonprofit", "cultural"].map(m => exs[m].t.length));
  check("P9: the example box names the mode as the new label, never a blank box (the line names the example's own profile)", /Written for [^\n]* who works with industry\./.test(exs.publicsector.t) && !/Partnered with/.test(exs.industry.t), exs.industry.t.slice(0, 160));

  // Language notes M1 to M9 (Mentorship).
  console.log("Mentorship wording (M1 to M9)");
  const stM = Object.assign({}, fixture, { stageKey: "mentor", mode: "compose", profileConfirmed: true, lens: Object.assign({}, fixture.lens, { careerStage: "early", discipline: "social", discipline2: "", workMode: ["team"] }),
    mentorCounts: { postdoc: "", phd: "1", masters: "", undergrad: "", other: "" },
    mentees: [{ stageKind: "doctoral", stage: "Doctoral", kind: "industry", org: "A made-up firm", unit: "", recognition: "", why: "now leads a made-up team", folded: false }, { stageKind: "masters", stage: "Master's", kind: "university", org: "A made-up university", unit: "", recognition: "", why: "now studies a made-up topic", folded: true }] });
  await seed(stM);
  r = await js(H + `await w(300); const a={};
    a.lede=q('.v7-lede').innerText; a.link=q('.v7-lede a')?.innerText; a.early=q('.v7-early')?.innerText;
    q('#v7-ex-mentor').click(); await w(200); const bx=q('#v7-exbox'); a.exTitle=bx?.querySelector('h4,h3,.v7-ex-t')?.innerText||''; a.exText=bx?bx.innerText:'';
    q('#v7-ex-mentor').click(); await w(150);
    a.counter=q('.v7-dash-h .v7-counter').innerText; a.otherLab=q('label[for="v7-t-other-kind"]').innerText; a.otherName=q('#v7-t-other-name').getAttribute('aria-label'); a.tiles=q('.v7-tiles-help').innerText;
    a.h=qa('.v7-section-t h3').map(x=>x.innerText).join('|'); a.people=qa('.v7-people-help').map(x=>x.innerText); a.pc=q('.v7-section-t .v7-counter').innerText;
    a.close=q('[aria-label^="Close person"]')?.getAttribute('aria-label'); a.fold=!!q('[aria-label^="Fold person"]');
    a.where=q('label[for="v7-pw0"]').innerText; a.orgHelp=q('#v7-pg0-h')?.innerText; a.orgPh=q('#v7-pg0')?.placeholder; a.pzHelp=q('.v7-pz-help')?.innerText; a.co=q('.v7-lvl-help')?.innerText;
    a.fields=qa('[data-f^="m-"]').map(f=>({k:f.querySelector('.v7-f-k').textContent, q:f.querySelector('.v7-q').textContent, help:((f.querySelector('.v7-explain')||{}).textContent||'').trim()}));
    return a;`);
  check("M1: the Mentorship intro reads as decided, with the guide link as the last words", r.lede === "In this section, you will describe who you have trained and how you mentor. Formal supervision and informal mentorship both count. We recommend describing at least one person you trained and where they are now. For more information, please read what counts as mentorship activity." && r.link === "what counts as mentorship activity", r);
  check("M1: the early-career hint reads \"You can describe informal support…\"", /^Early in your career\? You can describe informal support, training or inclusive practices in your research environment\. Reviewers are trained to read this section with career stage in mind\./.test(r.early), r.early);
  check("M2: the finished example reads \"A finished mentorship section\", \"Written for a researcher in social sciences.\", and the new foot", /A finished mentorship section/.test(r.exText) && /Written for a researcher in social sciences\./.test(r.exText) && /This example is fictional\. In your CV, these parts form one section\./.test(r.exText) && !/no .* example yet|One example for now/i.test(r.exText), r.exText.slice(0, 300));
  check("M3: the totals counter, other-people label, group name and period hint read as decided", r.counter === "1 in total" && r.otherLab === "Who are the other people you trained?" && r.otherName === "Name the group" && r.tiles === "These totals have no set period unless your competition sets one.", r);
  check("M4: the people heading reads Highlight some people you trained", /^Highlight some people you trained$/.test(r.h), r);
  check("M4: the choosing line and the privacy line read as decided", r.people[0] === "Please choose people whose career paths after training show your mentorship style, and if possible, some whose work relates directly to your application." && r.people[1] === "Please leave out names. For someone under 18, or in a small community where a role could identify them, describe them only as closely as they (and a parent or guardian) agree.", r.people);
  check("M5: the card is closed with \"Close person A\"; the person's destination label is \"Where are they now?\"; the Organization tip, prize help and co-supervision help read as decided; no placeholder tip", r.close === "Close person A" && !r.fold && r.where === "Where are they now?" && r.orgHelp === "If the company cannot be named, please give its sector instead, such as “a medical-device company”." && !/sector/.test(r.orgPh || "") && r.pzHelp === "In your CV, this follows the word “received”." && r.co === "If you co-supervise this person, please say so. Someone still training with you can be described by their project.", r);
  const fl = (k) => (r.fields.find(f => f.k === k) || {});
  check("M6: Mentorship approach, with its question and hint", fl("Mentorship approach").q === "Describe how you mentor, using one specific example." && /^For example, how you run a first meeting, support students in their work, decide authorship or hand over a project\./.test(fl("Mentorship approach").help), r.fields);
  check("M7: Team composition, with its help and hint", /^Team composition$/.test((r.fields[1] || {}).k) && /^Please describe how you have approached equal access and inclusion, using one change you made\. For example, a posting you rewrote, a requirement you removed, a new way to join or a barrier you reduced\./.test((r.fields[1] || {}).help), r.fields[1]);
  check("M8: Informal mentorship (optional) for an early-career profile, with its question and hint", fl("Informal mentorship (optional)").q === "Who else do you mentor beyond your own students? Please describe one person and what you did." && /^For example, early-career colleagues, postdocs you do not supervise, visiting scholars, peers or community researchers\./.test(fl("Informal mentorship (optional)").help), r.fields);
  check("M9: the over-count message asks \"Please check your totals.\"", /described, more than the 1 in your totals\. Please check your totals\.$/.test(r.pc), r.pc);
  await seed(Object.assign({}, stM, { mentees: [], mentorCounts: {} }));
  r = await js(H + `await w(300); return { pc:q('.v7-section-t .v7-counter').innerText, counter:q('.v7-dash-h .v7-counter').innerText };`);
  check("M9, M3: with nothing entered the counters read \"None described yet\" and \"Please enter a number in each box that applies.\"", r.pc === "None described yet" && r.counter === "Please enter a number in each box that applies.", r);
    // Load path: a malformed draft file, a stored draft that cannot be read, a draft changed in another tab.
    const bad = JSON.stringify({ format: "pathways-narrative-cv-draft", version: 1, draft: { lens: { agency: "XYZ", program: 7 }, contributions: [{ title: 5, stakes: "Real made-up text" }, null, "x"], profileConfirmed: true, mode: "compose" } });
    await seed(base);
    r = await js(H + `window.confirm=()=>true; window.alert=(m)=>{window.__a=m;};
      document.getElementById('v7-home').click(); await w(100);
      const ic=HTMLInputElement.prototype.click;
      HTMLInputElement.prototype.click=function(){ if(this.type==='file'){const dt=new DataTransfer(); dt.items.add(new File([${JSON.stringify(bad)}],'d.json',{type:'application/json'})); this.files=dt.files; this.dispatchEvent(new Event('change'));} };
      q('.v7-path-cont').click(); await w(150); await okWarn(); await w(150); HTMLInputElement.prototype.click=ic;
      const st=JSON.parse(localStorage.getItem('ncv-v9'));
      return {n:st.contributions.length, title:st.contributions[0].title, agency:st.lens.agency, prog:st.lens.program, alert:window.__a||'', banner:(q('.narrative-session-banner')||{}).innerText||''};`);
    check("a draft file with a null card, a number title and an unknown agency opens cleanly (F-1, F-9); the step says it opened (W-46)", r.n === 1 && r.title === "5" && r.agency === "" && r.prog === "7" && !r.alert && /^Backup file/.test(r.banner), r);
    await go(HOME()); await js(`localStorage.clear(); localStorage.setItem('ncv-v9','{"contributions":[{"title":"keep me"');`); await go(PAGE());
    r = await js(H + `await w(200); return {stored:localStorage.getItem('ncv-v9'), rec:!!localStorage.getItem('ncv-v9-recovery'), warn:!q('#v4-save-warning').hidden && /could not be opened/.test(q('#v4-save-warning').innerText), btn:!!qa('#v4-save-warning button').length};`);
    check("a stored draft that cannot be read is kept, copied to a recovery key and not saved over (F-2)", /keep me/.test(r.stored || "") && r.rec && r.warn && r.btn, r);
    r = await js(H + `const w2=q('#v4-save-warning'); return {t:w2.innerText, link:[...w2.querySelectorAll('button')].map(b=>b.innerText)};`);
    check("S12: the band names the problem first, then asks to download it and email the file; \"download it\" is the link", r.t === "There is a problem with your saved draft, so it could not be opened. To recover it, please download it and email the file to impact@concordia.ca." && r.link.join("|") === "download it", r);
    await seed(base);
    r = await js(H + `await w(150); const st=JSON.parse(localStorage.getItem('ncv-v9')); st.contributions[0].title='Changed in another tab'; const nv=JSON.stringify(st);
      const before=localStorage.getItem('ncv-v9');
      window.dispatchEvent(new StorageEvent('storage',{key:'ncv-v9', newValue:nv})); await w(200);
      const a={shown:document.body.innerText.includes('Changed in another tab'), unchanged:localStorage.getItem('ncv-v9')===before};
      localStorage.removeItem('ncv-v9'); await w(20); q('.v7-ex-btn')?.click(); await w(150); a.notBack=localStorage.getItem('ncv-v9')===null; a.warn=q('#v4-save-warning').innerText==='Your browser is not saving your draft. Please save a backup file.' && q('#v4-save-warning button').innerText==='save a backup file';
      return a;`);
    check("a save in another tab is taken up here without writing back (F-3)", r.shown && r.unchanged, r);
    check("after the browser data is cleared from outside, the draft is not written back (W-48)", r.notBack && r.warn, r);
    // S13: after a backup file is saved while the browser is not saving, the band says so; the next change brings the follow-up.
    await seed(base);
    r = await js(H + `await w(200); const ed=()=>q('[data-f$="-stakes"] .v7-box');
      localStorage.removeItem('ncv-v9'); setv(ed(), ed().value + ' a'); await w(150);
      const wn=q('#v4-save-warning'); const a={t0:wn.innerText, role:wn.getAttribute('role'), l0:wn.querySelector('button')?.innerText};
      wn.querySelector('button').click(); await w(200);
      a.t1=wn.innerText; a.l1=wn.querySelector('button')?.innerText; a.focus=document.activeElement===wn;
      setv(ed(), ed().value + ' b'); await w(150);
      a.t2=wn.innerText; a.l2=wn.querySelector('button')?.innerText; return a;`);
    check("S10, S11: when the browser data is cleared the band reads one soft sentence with the link in it, and stays an alert", r.t0 === "Your browser is not saving your draft. Please save a backup file." && r.l0 === "save a backup file" && r.role === "alert", r);
    check("S13 track 1: after the backup file is saved the band offers to open it; the next change brings the follow-up", r.t1 === "Backup file saved. To keep saving in this browser, please open it." && r.l1 === "open it" && r.t2 === "Your browser is still not saving your draft. Please save a new backup file." && r.l2 === "save a new backup file", r);
    await seed(base);
    r = await js(H + `await w(200); const ed=()=>q('[data-f$="-stakes"] .v7-box');
      const orig=Storage.prototype.setItem; Storage.prototype.setItem=function(k,v){ if(k==='ncv-v9') throw new Error('full'); return orig.call(this,k,v); };
      setv(ed(), ed().value + ' a'); await w(150);
      const wn=q('#v4-save-warning'); const a={t0:wn.innerText, hidden0:wn.hidden};
      wn.querySelector('button').click(); await w(200); a.t1=wn.innerText; a.l1=wn.querySelectorAll('button').length;
      setv(ed(), ed().value + ' b'); await w(150); a.t2=wn.innerText; Storage.prototype.setItem=orig; return a;`);
    check("S10, S13 track 2: when the browser cannot save, the band says so; after the backup file it says Backup file saved.; the next change brings the follow-up", !r.hidden0 && r.t0 === "Your browser is not saving your draft. Please save a backup file." && r.t1 === "Backup file saved." && r.l1 === 0 && r.t2 === "Your browser is still not saving your draft. Please save a new backup file.", r);
    // S14: the two messages under Open a backup file.
    for (const [label, text, want] of [
      ["text that is not JSON", "not json at all", "This file is not a Narrative CV backup file. Please choose a file ending in .json."],
      ["JSON that is not a tool file", '{"hello":1}', "This file is not a Narrative CV backup file. Please choose a file ending in .json."],
      ["a tool file from a newer format", JSON.stringify({ format: "pathways-narrative-cv-draft", version: 99, draft: {} }), "This backup file could not be opened. To recover it, please email the file to impact@concordia.ca."]]) {
      await seed(null);
      r = await js(H + `const ic=HTMLInputElement.prototype.click;
        HTMLInputElement.prototype.click=function(){ if(this.type==='file'){const dt=new DataTransfer(); dt.items.add(new File([${JSON.stringify(text)}],'d.json',{type:'application/json'})); this.files=dt.files; this.dispatchEvent(new Event('change'));} };
        q('.v7-path-cont').click(); await w(250); HTMLInputElement.prototype.click=ic; const e=q('#v7-load-err'); return {t:e&&e.innerText, role:e&&e.getAttribute('role')};`);
      check("S14: " + label + " gets its own line, as an alert", r.t === want && r.role === "alert", r);
    }
    // S16: a file from an earlier version says some parts may be missing.
    await seed(null);
    r = await js(H + `const ic=HTMLInputElement.prototype.click; const old=${JSON.stringify(Object.assign({}, fixture, { consultQuestions: "an advisor question", profileConfirmed: true, mode: "compose" }))};
      HTMLInputElement.prototype.click=function(){ if(this.type==='file'){const dt=new DataTransfer(); dt.items.add(new File([JSON.stringify(old)],'d.json',{type:'application/json'})); this.files=dt.files; this.dispatchEvent(new Event('change'));} };
      q('.v7-path-cont').click(); await w(300); HTMLInputElement.prototype.click=ic; return (q('.narrative-session-banner')||{}).innerText||'';`);
    check("S15, S16: the opened file says so, and that it is from an earlier version so some parts may be missing", /^Backup file (“.+” )?opened\. This backup file is from an earlier version, so some parts may be missing\.$/.test(r), r);
    // Print view and Word notes.
    await seed(base);
    r = await js(H + `rail('Export').click(); await w(150); const ow=window.open; let doc='';
      window.open=()=>({document:{write:(h)=>{doc=h;}, close(){}}}); qa('.v7-quiet-btn').find(b=>/Print view/.test(b.innerText)).click(); await w(50);
      window.open=()=>null; qa('.v7-quiet-btn').find(b=>/Print view/.test(b.innerText)).click(); await w(50); const blocked=q('.v7-actions .v7-copied').innerText; window.open=ow;
      return {vp:/name='viewport'/.test(doc), lang:/<html lang='en'>/.test(doc), btn:/window.print\(\)/.test(doc), label:/\\(V9\\.\\d+ beta\\)/.test(doc) && !/forked/.test(doc), blocked};`);
    check("print view: viewport, lang, a Print button and the short tool label; a blocked window says so (W-21, F-7)", r.vp && r.lang && r.btn && r.label && /please allow pop-ups for this page/.test(r.blocked), r);
    r = await js(`const t = document.getElementById('v8-version'); return { text: t && t.textContent, shown: !!t && t.offsetParent !== null, title: document.title };`);
    check("the version number shows under the tool and in the tab title", /^Version 9\.\d+ beta, \d{1,2} [A-Z][a-z]+ 20\d\d$/.test(r.text) && r.shown && /V9\.\d+ beta/.test(r.title), r);
    // Checks under fields: a pasted list is flagged; "could not" is not a hedge; the role line covers "we".
    await seed(base);
    r = await js(H + `await w(150); const card=q('.v7-card-col'); const box=(k)=>card.querySelector('[data-f$="-'+k+'"] .v7-box');
      const a={}; const st=box('stakes'); st.focus(); setv(st,'Clinics could not keep the made-up protocol going after the first year.'); await w(80);
      a.hedge=[...card.querySelectorAll('[data-f$="-stakes"] .v4-flag')].map(x=>x.innerText).join('|');
      const act=box('activities'); act.focus(); setv(act,'• Ran the made-up survey\\n• Wrote the made-up guide'); await w(80);
      a.list=[...card.querySelectorAll('[data-f$="-activities"] .v4-flag')].some(x=>/reads as a list/.test(x.innerText));
      const role=box('roleLine'); role.focus(); setv(role,'I designed the made-up study.'); await w(60);
      act.focus(); setv(act,'We screened 240 made-up samples over a year.'); await w(80);
      a.we=[...card.querySelectorAll('[data-f$="-activities"] .v4-flag')].some(x=>/“we”/.test(x.innerText));
      a.live=card.querySelector('.v7-f-checks').getAttribute('aria-live');
      return a;`);
    check("'could not' is not flagged as a hedge (W-30)", !/hedge/.test(r.hedge), r.hedge);
    check("a pasted list is flagged as a list (r1-a-1)", r.list, r);
    check("a role line with I covers 'we' in the card's other fields (r1-b-2); the checks are not a live region (F-8)", !r.we && r.live === null, r);
  }

  console.log("Audit loop, round 2 (2026-10-31): one assembly for every output");
  {
    const st2 = Object.assign({}, JSON.parse(JSON.stringify(fixture)), { profileConfirmed: true, mode: "compose", stageKey: "review", ui: { profileNote: false } });
    st2.contributions = [
      { cid: "ca1", title: "Made-up T", stakes: "S one.", roleMode: "led", roleLine: "I led R.", activities: "A one.", outputs: "O one.", outcomes: "C one.", impact: "I one.", translational: "", evidence: [{ text: "Made-up paper.", type: "Peer-reviewed", note: "Made-up note." }, { text: "Made-up thing.", type: "Other", otherLabel: "" }], flags: {}, notes: {} },
      { cid: "ca2", title: "Made-up U", stakes: "S two.", roleMode: "part", roleLine: "", activities: "A two.", outputs: "", outcomes: "", impact: "", translational: "", evidence: [], flags: {}, notes: {} }
    ];
    st2.mentees = [{ stage: "Doctoral", stageKind: "doctoral", kind: "government", org: "Made-up Ministry", unit: "", recognition: "a made-up scholarship (2024)", why: "", folded: false }];
    st2.mentorCounts = { phd: "1", masters: "", undergrad: "", postdoc: "", other: "2" };
    await seed(st2);
    r = await js(H + `await w(150); const a={};
      a.miss=qa('.v7-glance a').map(x=>x.innerText);
      rail('Export').click(); await w(150);
      a.sup=(q('.v7-draft-body sup')||{}).textContent; a.prev=q('.v7-draft-body').innerText;
      const blobs=[]; const oc=URL.createObjectURL; URL.createObjectURL=(b)=>{blobs.push(b);return 'blob:x';};
      const ocl=HTMLAnchorElement.prototype.click; HTMLAnchorElement.prototype.click=function(){};
      q('.v7-actions .btn-primary').click(); await w(40); q('#v7-fmt-txt').click(); await w(60); q('.v7-actions .btn-primary').click(); await w(40);
      HTMLAnchorElement.prototype.click=ocl; URL.createObjectURL=oc;
      a.doc=await blobs[0].text(); a.txt=await blobs[1].text();
      let clip=''; const ow=navigator.clipboard.writeText; navigator.clipboard.writeText=async(t)=>{clip=t;};
      qa('.btn').find(b=>/^Copy Most significant/.test(b.innerText)).click(); await w(40); a.sec=clip;
      qa('.btn').find(b=>/^Copy Supervisory/.test(b.innerText)).click(); await w(40); a.mentor=clip; navigator.clipboard.writeText=ow;
      return a;`);
    const body = "S one. I led R. A one. O one. C one. I one.";
    check("Word: the headline on its own line, The problem or question then the role line in roman, superscript a, b, no kind labels (W-14, W-16, W-17)", r.doc.includes("<p class='ctitle' style='margin:0'>1. Made-up T</p><p>" + body + "<sup>a, b</sup>") && !/Peer-reviewed|\(Other\)|<em>/.test(r.doc), r.doc.slice(r.doc.indexOf("ctitle"), r.doc.indexOf("ctitle") + 300));
    check("on-screen draft: the same order with superscript letters and no kind labels", r.sup === "a, b" && r.prev.includes(body) && !/Peer-reviewed/.test(r.prev), r.prev.slice(0, 400));
    check("section copy: the same paragraph with (a, b), no kind labels", r.sec.includes(body + " (a, b)") && !/Peer-reviewed|Other/.test(r.sec), r.sec);
    check(".txt: the working copy keeps the kind in brackets, never [Other], and lists what is still missing (W-19)", r.txt.includes("   " + body + " (a, b)") && /\[Peer-reviewed\]/.test(r.txt) && !/\[Other\]/.test(r.txt) && /\[Still missing: Your role\./.test(r.txt) && /^NARRATIVE CV DRAFT \(V9\.\d+ beta\)/.test(r.txt) && !/—/.test(r.txt), r.txt.slice(0, 900));
    check("a trainee prints as a sentence with the sector named; the Other tile counts in the totals (W-20, W-23)", /A doctoral student I trained now works in government at Made-up Ministry and received a made-up scholarship \(2024\)\./.test(r.mentor) && /1 doctoral student, 2 other trainees/.test(r.mentor) && !/→/.test(r.mentor), r.mentor);
    check("Still missing names Your role when only a level is chosen (W-14)", r.miss.some(t => /^Contribution 2: .*Your role/.test(t)), r.miss);
  }

  console.log("Audit loop, round 2: persona fixes");
  {
    const st3 = Object.assign({}, JSON.parse(JSON.stringify(fixture)), { profileConfirmed: true, mode: "compose", stageKey: "contrib", ui: { profileNote: false } });
    st3.lens = Object.assign({}, st3.lens, { agency: "frq", format: "cv-frq", program: "Made-up FRQSC program", discipline: "creative", careerStage: "early" });
    st3.contributions[0].evidence = [{ text: "Video of the work https://example.org/v", type: "Exhibition, performance or screening" }, { text: "Press https://example.org/p", type: "Media / public" }];
    st3.contributions[0].stakes = "S."; st3.contributions[0].roleLine = "I made it."; st3.contributions[0].activities = "A."; st3.contributions[0].outputs = "O."; st3.contributions[0].outcomes = "C."; st3.contributions[0].impact = "I.";
    st3.mentees = [{ stageKind: "masters", stage: "Master's", kind: "health", org: "A made-up health authority", unit: "Nurse manager", recognition: "", why: "", folded: false }];
    await seed(st3);
    r = await js(H + `await w(150); const a={};
      a.nav=((q('#v4-stage-content > .v9-hint')||{}).textContent||'');
      const card=q('.v7-card-col'); card.querySelector('[id^=ev-open-]').click(); await w(300);
      a.rows=qa('.v7-kind-row').map(x=>x.innerText); a.grid=qa('.v7-kind').length;
      qa('.v7-kind-row .v7-linkbtn')[0].click(); await w(200); a.open=qa('.v7-kind').length; a.focus=document.activeElement.getAttribute('aria-checked');
      rail('Mentorship').click(); await w(150); a.h=q('h2').innerText; a.ks=qa('[data-f^="m-"] .v7-f-k').map(x=>x.textContent); a.optional=a.ks.includes('Informal mentorship (optional)');
      rail('Background and skills').click(); await w(150); a.fit=(q('[data-f="ps-programFit"] .v7-q')||{}).innerText||'';
      return a;`);
    check("CV-FRQ: the Contributions hint names the background and skills section, not the personal statement (r2-b-1)", /after your background and skills/.test(r.nav) && !/personal statement/i.test(r.nav), r.nav);
    check("a chosen kind folds to one line with Change, which reopens the kind cards on the chosen one (r1-b-5)", r.rows.length === 2 && /^Kind: Exhibition, performance or screening · Change$/.test(r.rows[0]) && r.grid === 0 && r.open === 15 && r.focus === "true", r);
    check("early career: Informal mentorship is optional (r2-b-8); a competition naming FRQSC gets no (FRQ) bracket (r2-b-10)", r.optional && !/\(FRQ\)/.test(r.fit), r);
    await seed(Object.assign({}, st3, { lens: Object.assign({}, st3.lens, { agency: "sshrc", format: "tcv" }), stageKey: "review" }));
    r = await js(H + `await w(150); const a={links:qa('.v7-glance a').map(x=>x.innerText)};
      rail('Export').click(); await w(150); a.note=(q('.v7-links-note')||{}).innerText||'';
      const ocl=HTMLAnchorElement.prototype.click; HTMLAnchorElement.prototype.click=function(){}; const oc=URL.createObjectURL; URL.createObjectURL=()=>'blob:x';
      q('.v7-actions .btn-primary').click(); await w(60); a.dl=q('.v7-actions .v7-copied').innerText; a.live=q('#v7-live').textContent;
      HTMLAnchorElement.prototype.click=ocl; URL.createObjectURL=oc;
      let clip=''; const ow=navigator.clipboard.writeText; navigator.clipboard.writeText=async(t)=>{clip=t;};
      qa('.btn').find(b=>/^Copy Supervisory/.test(b.innerText)).click(); await w(40); a.mentor=clip; navigator.clipboard.writeText=ow;
      return a;`);
    check("TCV in a creative field: a press link is listed to take out, the video of the work is not (r2-b-3)", r.links.some(t => /^Contribution 1: Evidence$/.test(t)) && /Contribution 1: Evidence/.test(r.note), r);
    check("Export names the links still in the draft (r2-a-16) and a download names its file (r2-a-4)", /still in your draft/.test(r.note) && /^Downloaded narrative-cv-draft-sshrc\.doc\.$/.test(r.dl), r);
    check("a trainee in the health system prints as a sentence (r2-a-2)", /A master’s student I trained now works at a made-up health authority \(Nurse manager\)\./.test(r.mentor), r.mentor);
  }

  console.log("Audit loop, round 3: the walkthrough's remaining items");
  {
    const st4 = Object.assign({}, JSON.parse(JSON.stringify(fixture)), { profileConfirmed: true, mode: "compose", stageKey: "ps", ui: { profileNote: false } });
    st4.ps = Object.assign({}, st4.ps, { role: "associate professor of mechanical engineering", institution: "Made-up University" });
    const mk = (t, x) => ({ cid: "cx" + t, title: "Made-up " + t, stakes: "Coastal flooding records " + x + " in Halifax towns.", activities: "Flooding records modelled " + x + ".", outputs: "", outcomes: "", impact: "", translational: "", roleLine: "I led it.", roleMode: "", evidence: [], flags: {}, notes: {} });
    st4.contributions = [mk("a", "one"), mk("b", "two"), mk("c", "three")];
    // R11 (V9): Review needs one complete contribution, so the first gets the rest of its parts.
    Object.assign(st4.contributions[0], { outputs: "A made-up flood map.", outcomes: "Two made-up towns used the map.", impact: "It could guide flood planning.", noEvidenceYet: true });
    await seed(st4);
    r = await js(H + `await w(200); const a={};
      a.cross=qa('.v7-cross').length; a.under=q('.v7-cross')?.closest('.v7-f')?.dataset.f; a.span=/shares words with each/.test(q('.v7-cross')?.innerText||''); a.halifax=/halifax/i.test(q('.v7-cross strong')?.innerText||'');
      const r0=q('#ps-anchor'); r0.focus(); await w(300); a.fw=[r0.scrollWidth,r0.clientWidth,r0.style.width]; a.fit=parseFloat(r0.style.width)>=r0.scrollWidth-2;
      a.jd=qa('[data-f^="ps-"] .v9-pill').length;
      rail('Review').click(); await w(200);
      a.order=qa('#v4-stage-content > section, #v4-stage-content > .v7-draft, #v4-stage-content > div > section').map(x=>x.getAttribute('aria-labelledby')||x.className).filter(Boolean);
      a.hash=location.hash; history.back(); await w(250); a.back=q('.narrative-stage-header h2').innerText; a.hash2=location.hash;
      history.forward(); await w(250); a.fwd=q('.narrative-stage-header h2').innerText;
      return a;`);
    check("the read across contributions shows once, under The problem; a place name is left out; no 'spanning' line when every card qualifies (W-39)", r.cross === 1 && r.under === "ps-challenge" && !r.span && !r.halifax, r);
    check("a first-sentence box is as wide as its text (W-40); the statement fields carry the legend's squares (W-42)", r.fit && r.jd >= 6, r);
    check("V8.15: Review runs At a glance, the board, then Mentorship", r.order.indexOf("v7-ag-t") !== -1 && r.order.indexOf("v7-ag-t") < r.order.indexOf("v8-rb-t") && r.order.indexOf("v8-rb-t") < r.order.indexOf("v8-rm-t") && r.order.indexOf("v7-sc-t") === -1 && r.order.indexOf("v7-oc-t") === -1, r.order);
    check("each step has an address; Back and Forward move between steps (W-47)", r.hash === "#review" && /Personal statement/.test(r.back) && r.hash2 === "#statement" && /Review/.test(r.fwd), r);
  }

  console.log("Audit loop, round 3: Fable's review of rounds 1 and 2");
  {
    const st5 = Object.assign({}, JSON.parse(JSON.stringify(fixture)), { profileConfirmed: true, mode: "compose", stageKey: "contrib", ui: { profileNote: false } });
    st5.mentees = [{ stageKind: "other", stageOther: "MD-PhD trainee", stage: "MD-PhD trainee", kind: "university", org: "A made-up university", unit: "", recognition: "", why: "", folded: false }];
    await seed(st5);
    r = await js(H + `await w(150); const a={};
      q('#v7-chg').click(); await w(150); a.open=!!q('#v7-chg-panel');
      const st=JSON.parse(localStorage.getItem('ncv-v9')); st.lens.careerStage='senior';
      window.dispatchEvent(new StorageEvent('storage',{key:'ncv-v9', newValue:JSON.stringify(st)})); await w(200);
      a.closed=!q('#v7-chg-panel'); a.live=q('#v7-live').textContent;
      localStorage.removeItem('ncv-v9'); const box=q('[data-f$="-stakes"] .v7-box'); box.focus(); setv(box,'Kept here.'); await w(60);
      const other=JSON.parse(JSON.stringify(st)); other.contributions[0].stakes='Other tab';
      window.dispatchEvent(new StorageEvent('storage',{key:'ncv-v9', newValue:JSON.stringify(other)})); await w(200);
      a.kept=q('[data-f$="-stakes"] .v7-box').value; a.warn=!q('#v4-save-warning').hidden;
      return a;`);
    check("an open Change panel closes when the other tab changed the profile (G-2)", r.open && r.closed && /changed in another tab/.test(r.live), r);
    check("a tab that stopped saving after an outside clear keeps its own copy and its warning (G-1)", r.kept === "Kept here." && r.warn, r);
    await seed(st5);
    r = await js(H + `await w(150); const a={};
      let clip=''; const ow=navigator.clipboard.writeText; navigator.clipboard.writeText=async(t)=>{clip=t;};
      rail('Export').click(); await w(150);
      const b=qa('.btn').find(x=>/^Copy Supervisory/.test(x.innerText)); if (b) { b.click(); await w(40); } a.mentor=clip; navigator.clipboard.writeText=ow;
      document.getElementById('v7-home').click(); await w(150);
      q('.v7-path-reset').click(); await w(100); q('.v7-path-cont').click(); await w(100); a.warns=qa('.v7-warn').length;
      return a;`);
    check("a level typed under Other keeps its capitals and takes the article of its letters; a person under Other in a community-engaged profile is one you mentored (G-3, r9-b-1)", /An MD-PhD trainee I mentored is now at a made-up university\./.test(r.mentor), r.mentor);
    check("one inline warning at a time on a step (G-6)", r.warns === 1, r);
  }

  console.log("Audit loop, round 3: persona fixes");
  {
    const st6 = Object.assign({}, JSON.parse(JSON.stringify(fixture)), { profileConfirmed: true, mode: "compose", stageKey: "contrib", ui: { profileNote: false } });
    st6.contributions[0].title = "x".repeat(250);
    st6.contributions[0].roleLine = "I led it.";
    st6.contributions[0].evidence = [{ text: "Made-up item a.", type: "Peer-reviewed" }, { text: "Made-up item b, long enough to keep.", type: "Funding", note: "A note." }];
    await seed(st6);
    r = await js(H + `await w(150); const a={};
      const card=q('.v7-card-col'); card.querySelector('[id^=ev-open-]').click(); await w(300);
      const cid=card.querySelector('[id^=ev-open-], [id^=ev-add-]')?.id.split('-').pop() || '';
      qa('.v7-kind-row .v7-linkbtn')[0].click(); await w(200);
      const k0=document.activeElement; k0.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true})); await w(200);
      a.stillOpen=qa('.v7-ev-item')[0].querySelectorAll('.v7-kind').length; a.focusKind=document.activeElement.getAttribute('role'); a.checked=document.activeElement.getAttribute('aria-checked');
      document.activeElement.click(); await w(200); a.folded=qa('.v7-ev-item')[0].querySelectorAll('.v7-kind').length===0; a.live=q('#v7-live').textContent;
      qa('.v7-ev-rm')[1].click(); await w(200); a.undo=!!q('.v7-undo button'); a.items1=qa('.v7-ev-item').length;
      q('.v7-undo button').click(); await w(200); a.items2=qa('.v7-ev-item').length; a.back=qa('.v7-ev-item textarea')[2]?.value||qa('[id^=evt]')[1]?.value;
      a.dir=q('.v7-ev-item textarea').dir;
      rail('Review').click(); await w(200); a.sw=document.documentElement.scrollWidth<=document.documentElement.clientWidth+1; a.mv=q('.v8-mv .btn').getAttribute('aria-label').length;
      rail('Mentorship').click(); await w(150); q('#v7-chg').click(); await w(150);
      qa('#v7-chg-panel .v7-mini[aria-pressed="true"]').forEach(b=>b.click()); await w(60);
      qa('#v7-chg-panel .btn-primary').find(b=>/Confirm/.test(b.innerText)).click(); await w(150);
      a.need=!!q('.v7-chg-need') && !!q('#v7-chg-panel');
      return a;`);
    check("arrow keys move through the evidence kinds with the chooser open and say the kind; Enter folds it (r3-a-1)", r.stillOpen === 15 && r.focusKind === "radio" && r.checked === "true" && r.folded && /Kind: /.test(r.live), r);
    check("a removed evidence item can be restored with Undo (r3-b-6); boxes take the text's direction (r3-b-13)", r.undo && r.items1 === 1 && r.items2 === 2 && r.dir === "auto", r);
    check("an unbroken 250-character headline wraps on Review and the move buttons use a short name (r3-b-1, r3-b-2)", r.sw && r.mv < 90, r);
    check("the Change panel asks for a work mode before it confirms (r3-b-9)", r.need, r);
  }

  console.log("Audit loop, round 4");
  {
    // History: Back after Confirm profile is never a dead press; Back after a reset stays on the start page.
    await seed(null);
    r = await js(H + `q('.v7-path-new').click(); await w(150);
      q('#ag-nserc').click(); await w(120); q('#v7-undecided').click(); await w(120); q('#st-mid').click(); await w(100); q('#di-stem').click(); await w(100); q('#d2-none').click(); await w(100);
      q('#wm-team').click(); await w(100); q('#wm-solo').click(); await w(120);
      const a={wm:JSON.parse(localStorage.getItem('ncv-v9')).lens.workMode.join(','), live1:q('#v7-live').textContent};
      qa('.narrative-nav .btn').find(b=>/Confirm profile/.test(b.innerText)).click(); await w(200);
      history.back(); await w(300); a.back=(q('.v7-path-new h2')||{}).innerText||'';
      history.forward(); await w(300); a.fwd=q('h2').innerText;
      history.pushState(null,'','#profile'); history.back(); await w(250); history.forward(); await w(300);
      a.after=q('h2').innerText; a.focus=document.activeElement.tagName; a.live=q('#v7-live').textContent; a.hash=location.hash;
      document.getElementById('v7-home').click(); await w(150); q('.v7-path-reset').click(); await w(100);
      qa('.v7-warn .btn-primary')[0].click(); await w(250); /* S8: one confirm */
      history.back(); await w(300); a.afterReset=(q('.v7-path-new h2')||{}).innerText; a.mode=JSON.parse(localStorage.getItem('ncv-v9')||'{}').mode;
      return a;`);
    check("Team-based and Solo replace each other, and the message is spoken (r4-a-4, P9)", r.wm === "solo" && /You can choose Team-based or Solo, not both\./.test(r.live1), r);
    check("Confirm profile replaces Setup's history entry, so Back goes to the start page and Forward returns (H-1)", r.back === "Continue your draft" && /Most significant/.test(r.fwd), r);
    check("an address for a closed step (Setup after Confirm) is not a dead press: the step shown is named and its heading focused (H-1)", /Most significant/.test(r.after) && r.focus === "H2" && /not open now/.test(r.live) && r.hash === "#contributions", r);
    check("Back after a reset stays on the start page and starts nothing (H-2)", r.afterReset === "Start your draft" && !r.mode, r);
    // A blank card with only a level; the historian's and the zoom fixes.
    const st7 = Object.assign({}, JSON.parse(JSON.stringify(fixture)), { profileConfirmed: true, mode: "compose", stageKey: "contrib", ui: { profileNote: false } });
    st7.contributions = [{ cid: "cz1", title: "Made-up archive", stakes: "No researcher outside the town could learn what it held.", roleMode: "led", roleLine: "", activities: "I catalogued it.", outputs: "", outcomes: "", impact: "", translational: "", evidence: [], flags: {}, notes: {} }];
    st7.contributions.push(DONE()); // R11 (V9): Review and Export need one complete contribution
    st7.mentorCounts = { phd: "", masters: "1", undergrad: "", postdoc: "", other: "" };
    st7.mentees = [{ stageKind: "masters", stage: "Master's", kind: "university", org: "A made-up university", unit: "", recognition: "", why: "", folded: false }, { stageKind: "undergrad", stage: "Undergraduate research", kind: "arts", org: "A made-up science museum", unit: "", recognition: "", why: "", folded: true }];
    await seed(st7);
    r = await js(H + `await w(200); const a={};
      a.hedge=[...qa('[data-f$="-stakes"] .v4-flag')].map(x=>x.textContent).join('|');
      a.pad=getComputedStyle(document.documentElement).scrollPaddingTop; a.dot=getComputedStyle(q('.v7-dots i:not(.on)')||document.body).boxShadow;
      rail('Mentorship').click(); await w(150); a.pc=qa('.v7-counter').map(x=>x.innerText).join('|');
      rail('Review').click(); await w(200); a.bar=!!q('.v7-tailored #v7-chg'); a.miss=qa('.v7-glance a').map(x=>x.innerText).join('|');
      rail('Export').click(); await w(150); a.unf=(q('.v7-unfinished-note')||{}).innerText||'';
      let clip=''; const ow=navigator.clipboard.writeText; navigator.clipboard.writeText=async(t)=>{clip=t;};
      qa('.btn').find(b=>/^Copy Supervisory/.test(b.innerText)).click(); await w(40); a.mentor=clip; navigator.clipboard.writeText=ow;
      return a;`);
    check("'could learn' in The problem or question is a past inability, not a hedge (r4-a-5)", !/hedge/.test(r.hedge), r.hedge);
    check("more people described than counted is named beside the count as a check, not a gap (r4-a-6, J-4)", /2 described, more than the 1 in your totals/.test(r.pc) && !/totals lower/.test(r.miss), r);
    check("Review has the Profile bar with Change (r4-a-1); Export names unfinished contributions (r3-b-5)", r.bar && /will be included in the export as incomplete/.test(r.unf), r);
    check("each person is its own paragraph in the section copy (r4-a-9); an organization that names its sector is not given it twice (r4-b-7)", /\(\d|\.\n\nAn undergraduate researcher I trained now works at a made-up science museum\./.test(r.mentor), r.mentor);
    check("the scroll padding follows the top bar (r4-b-1); empty progress squares have an edge (r4-b-4)", /px/.test(r.pad) && parseFloat(r.pad) >= 50 && /inset/.test(r.dot), r);
  }

  console.log("Audit loop, round 5");
  {
    const st8 = Object.assign({}, JSON.parse(JSON.stringify(fixture)), { profileConfirmed: true, mode: "compose", stageKey: "review", ui: { profileNote: false } });
    st8.lens = Object.assign({}, st8.lens, { workMode: ["community", "team"] });
    st8.contributions = [{ cid: "cq1", title: "Made-up survey", stakes: "S.", roleMode: "coled", roleLine: "Co-lead with the partner communities.", activities: "We met 18 times in four communities.", outputs: "A data agreement under which each community may withdraw its data and any later use would require approval.", outcomes: "", impact: "", translational: "", evidence: [], flags: {}, notes: {} }];
    st8.mentorCounts = { phd: "1", masters: "", undergrad: "", postdoc: "", other: "7" };
    st8.mentorOtherLabel = "community researchers";
    st8.mentees = [{ stageKind: "doctoral", stage: "Doctoral", kind: "indigenous", org: "A made-up Nation's health department", unit: "", recognition: "", why: "", folded: false }];
    await seed(st8);
    r = await js(H + `await w(200); const a={};
      rail('Contributions').click(); await w(200);
      a.roleQ=(q('[data-f$="-roleLine"] .v7-q')||{}).textContent||'';
      const box=(k)=>q('[data-f$="-'+k+'"] .v7-box');
      box('activities').focus(); setv(box('activities'), box('activities').value+' '); await w(80);
      a.we=qa('[data-f$="-activities"] .v4-flag').map(x=>x.textContent).join('|');
      box('outputs').focus(); setv(box('outputs'), box('outputs').value+' '); await w(80);
      a.hedge=qa('[data-f$="-outputs"] .v4-flag').map(x=>x.textContent).join('|');
      a.kinds=qa('.v7-kind').length;
      rail('Export').click(); await w(150);
      let clip=''; const ow=navigator.clipboard.writeText; navigator.clipboard.writeText=async(t)=>{clip=t;};
      const cb=qa('.btn').find(b=>/^Copy Supervisory/.test(b.innerText)); if(!cb) return {err:'no copy', btns:qa('.btn').map(b=>b.innerText).join('|')}; cb.click(); await w(40); a.mentor=clip; navigator.clipboard.writeText=ow;
      a.shared=!!q('.v7-shared-note'); a.agree=null;
      rail('Export').click(); await w(150); a.agree=!!qa('.v7-selfcheck label').find(l=>/Agreement:/.test(l.innerText));
      // history: Export, Back to Review, then lock Review from another tab and press Back: the closed entry is passed over
      rail('Export').click(); await w(150); const n0=history.state&&history.state.n;
      a.hasN=typeof n0==='number';
      return a;`);
    check("community-engaged work gets the partners' role prompt (r5-b-3)", /who led the other parts/.test(r.roleQ), r.roleQ);
    check("a written role line names the part, so 'we' in What you did is not flagged (r5-b-2); 'may withdraw' and 'would require' are not hedges (r5-b-4)", !/“we”/.test(r.we) && !/hedge/.test(r.hedge), r);
    check("the Other group prints under its name; a First Nations, Inuit or Métis destination prints with its organization (r5-b-5, r5-b-6)", /1 doctoral student, 7 community researchers/.test(r.mentor) && /now works at a made-up Nation's health department\./.test(r.mentor), r.mentor);
    check("Export has the shared-computer note (r5-a-4); Review's self-check asks about partners' agreement (r5-b-7); each history entry carries a number (J-1)", r.shared && r.agree && r.hasN, r);
  }

  console.log("Audit loop, round 6");
  {
    const mkc = (t, x) => ({ cid: "cr" + t, title: "Made-up contribution " + t, stakes: "Stakes " + x + ".", roleMode: "led", roleLine: "I led it.", activities: "I did " + x + ".", outputs: "", outcomes: "", impact: "", translational: "", evidence: [], flags: {}, notes: {}, folded: true });
    const st9 = Object.assign({}, JSON.parse(JSON.stringify(fixture)), { profileConfirmed: true, mode: "compose", stageKey: "contrib", ui: { profileNote: false } });
    st9.contributions = [1, 2, 3, 4, 5, 6].map(n => mkc(n, "x".repeat(3) + n));
    st9.contributions[0].folded = false;
    st9.contributions[0].activities = ("I modelled the made-up data and wrote the made-up report. ").repeat(300);
    st9.mentees = [{ stageKind: "doctoral", stage: "Doctoral", kind: "health", org: "A made-up health authority", unit: "", recognition: "", why: "now leads the made-up analytics team", folded: false }];
    await seed(st9);
    r = await js(H + `await w(200); const a={};
      a.sel=(q('.v7-select-note')||{}).innerText||''; a.meta=qa('.v7-fold-meta').map(x=>x.innerText);
      a.wc=(q('.v7-rail-wc')||{}).innerText||''; a.wcOver=!!q('.v7-rail-wc.is-over');
      rail('Export').click(); await w(150); a.over=(q('.v7-over-note')||{}).innerText||''; rail('Contributions').click(); await w(150);
      const card=q('.v7-card-col'); card.querySelector('[aria-label^="Remove contribution 1"]').click(); await w(150);
      a.warn=(q('.v7-warn p')||{}).innerText||''; qa('.v7-warn .btn-primary')[0].click(); await w(250);
      a.undo=!!q('#c-undo'); a.n1=JSON.parse(localStorage.getItem('ncv-v9')).contributions.length;
      q('#c-undo').click(); await w(250); a.n2=JSON.parse(localStorage.getItem('ncv-v9')).contributions.length; a.first=JSON.parse(localStorage.getItem('ncv-v9')).contributions[0].cid;
      const role=q('[data-f$="-roleLine"] .v7-box'); role.focus(); setv(role,'My team ran the course while I was on leave.'); await w(80);
      a.roleTick=qa('[data-f$="-roleLine"] .v4-strength').map(x=>x.textContent).join('|');
      const act=q('[data-f$="-activities"] .v7-box'); act.focus(); setv(act,'Sampling was paused for twelve months in 2023, and I would have run the dive surveys myself otherwise.'); await w(80);
      a.actFlags=qa('[data-f$="-activities"] .v4-flag').map(x=>x.textContent).join('|');
      rail('Mentorship').click(); await w(150); a.tilesHelp=(q('.v7-tiles-help')||{}).innerText||'';
      rail('Personal statement').click(); await w(150); a.pivot=(q('[data-f="ps-pivot"] .v7-f-more')||{}).textContent||'';
      rail('Export').click(); await w(150);
      let clip=''; const ow=navigator.clipboard.writeText; navigator.clipboard.writeText=async(t)=>{clip=t;};
      const cb=qa('.btn').find(b=>/^Copy Supervisory/.test(b.innerText)); if(!cb) return {err:'no copy', btns:qa('.btn').map(b=>b.innerText).join('|')}; cb.click(); await w(40); a.mentor=clip; navigator.clipboard.writeText=ow;
      q('#v7-chg').click(); await w(150); setsel(q('#v7-chg-st'),'early'); qa('#v7-chg-panel .btn-primary').find(b=>/Confirm/.test(b.innerText)).click(); await w(200); a.live=q('#v7-live').textContent;
      return a;`);
    check("past five contributions a line on choosing appears; each folded row shows its length (r6-a-1, r6-a-2)", /You have 7 contributions/.test(r.sel) /* V9: seed adds one complete contribution */ && r.meta.every(m => /\d+ w$/.test(m)), r);
    check("the rail says when the draft is over the limit; Export says so too (r6-a-4)", /over 5 p/.test(r.wc) && r.wcOver && /This is over the limit of 5 pages in English\. Please shorten it before you submit\./.test(r.over), r);
    check("removing a written contribution names its words and can be undone for ten seconds (r6-a-3)", /This deletes [\d,]+ words/.test(r.warn) && r.undo && r.n1 === 6 && r.n2 === 7 && r.first === "cr1", r);
    check("'my team ran it' is not your own role; a pause and a counterfactual are not flagged; a year counts as a date (r6-b-6, r6-b-4, r6-b-5)", !/Your own part is named/.test(r.roleTick) && !/hedge|does not say who|No numbers yet/.test(r.actFlags), r);
    check("the totals have no set period; How you got here sends leaves to the appendix and the research advisor, and allows a mention (Eli, 2026-11-04)", /no set period/.test(r.tilesHelp) && /unless your competition sets one/.test(r.tilesHelp) && !/five years/.test(r.tilesHelp) && /usually go in the application’s appendix/.test(r.pivot) && /competition’s instructions/.test(r.pivot) && /research advisor/.test(r.pivot) && /you can mention it here/.test(r.pivot), r);
    check("a 'went on to do' answer that starts with a verb joins the sentence, without a second “now” (r6-a-7, r9-a-13); a profile change names what changed (r6-b-7)", /made-up health authority and leads the made-up analytics team\./.test(r.mentor) && /Profile updated: career stage/.test(r.live), r);
  }

  console.log("Audit loop, round 6: Fable's review of round 5");
  {
    // The tab's session history is capped at 50 entries by Chrome, and the suite fills it; start clean.
    await send("Page.resetNavigationHistory");
    await seed(null);
    r = await js(H + `const log=[]; const L=(t)=>log.push(t+':'+location.hash+':'+(history.state&&history.state.n)+':'+history.length);
      L('start'); q('.v7-path-new').click(); await w(150); L('setup');
      q('#ag-nserc').click(); await w(100); q('#v7-undecided').click(); await w(100); q('#st-mid').click(); await w(80); q('#di-stem').click(); await w(80); q('#d2-none').click(); await w(80); q('#wm-team').click(); await w(120);
      qa('.narrative-nav .btn').find(b=>/Confirm profile/.test(b.innerText)).click(); await w(200); L('conf');
      rail('Mentorship').click(); await w(150); L('mentor'); rail('Personal statement').click(); await w(150); L('ps');
      document.getElementById('v7-home').click(); await w(150); L('home'); q('.v7-path-reset').click(); await w(100);
      qa('.v7-warn .btn-primary')[0].click(); await w(250); /* S8: one confirm */ L('reset');
      q('.v7-path-new').click(); await w(200); L('new'); return {log, h0:q('h2').innerText, len:history.length, st:JSON.stringify(history.state)};`);
    await js(`history.back(); return 1;`); await sleep(500);
    r = Object.assign(r, await js(H + `return {b1:(q('.v7-path-new h2')||{}).innerText||q('h2')?.innerText, st1:JSON.stringify(history.state), hash1:location.hash};`));
    await js(`history.back(); return 1;`); await sleep(700);
    r = Object.assign(r, await js(H + `return {b2:(q('.v7-path-new h2')||{}).innerText||q('h2')?.innerText, live:q('#v7-live').textContent, here:location.pathname};`));
    check("after a reset and a new draft, Back never re-enters the earlier draft's steps or leaves the tool (K-1)", /Set up your profile/.test(r.h0) && /draft/.test(r.b1) && /draft/.test(r.b2) && /narrative-cv-prototype-v9/.test(r.here), r);
    const stA = Object.assign({}, JSON.parse(JSON.stringify(fixture)), { profileConfirmed: true, mode: "compose", stageKey: "contrib", ui: { profileNote: false } });
    stA.contributions[0].roleLine = "We co-designed the made-up survey with the partners.";
    stA.contributions[0].roleMode = "";
    stA.contributions[0].activities = "Phase I trials across three sites; we recruited 40 made-up patients.";
    stA.contributions[0].impact = "Clinics may use the made-up tool to plan intake.";
    stA.ps = Object.assign({}, stA.ps, { role: "professor", challenge: "Our lab pivoted to community data; we rebuilt the pipeline and our partners hosted it." });
    await seed(stA);
    r = await js(H + `await w(200); const a={};
      const box=(k)=>q('[data-f$="-'+k+'"] .v7-box');
      box('activities').focus(); setv(box('activities'), box('activities').value+' '); await w(80); a.act=qa('[data-f$="-activities"] .v4-flag').map(x=>x.textContent).join('|');
      box('impact').focus(); setv(box('impact'), box('impact').value+' '); await w(80); a.imp=qa('[data-f$="-impact"] .v4-strength').map(x=>x.textContent).join('|');
      rail('Personal statement').click(); await w(150);
      const ch=q('[data-f="ps-challenge"] .v7-box'); ch.focus(); setv(ch, ch.value+' '); await w(80); a.ps=qa('[data-f="ps-challenge"] .v4-flag').map(x=>x.textContent).join('|');
      return a;`);
    check("'Phase I' is not the writer, and a role line that only says 'we' does not silence the card's check (K-2, K-4)", /“we”/.test(r.act), r);
    check("the statement's first sentence does not silence its 'we' check (K-3); 'may use' in What could change is praised as a hedge (K-5)", /“we”/.test(r.ps) && /Cautious words/.test(r.imp), r);
  }

  console.log("Audit loop, round 7");
  {
    const stB = Object.assign({}, JSON.parse(JSON.stringify(fixture)), { profileConfirmed: true, mode: "compose", stageKey: "review", ui: { profileNote: false } });
    stB.lens = Object.assign({}, stB.lens, { discipline: "humanities", discipline2: "stem" });
    stB.contributions = [{ cid: "cs1", title: "Made-up corpus", stakes: "The made-up papers were scattered", roleMode: "led", roleLine: "I led the made-up build", activities: "• Scanned 4 made-up papers\n• Wrote a made-up guide", outputs: "A made-up corpus.", outcomes: "", impact: "", translational: "", evidence: [{ text: "Made-up item.", type: "Dataset / tool" }], flags: {}, notes: {} }];
    stB.mentees = [
      { stageKind: "masters", stage: "Master's", kind: "government", org: "A made-up city", unit: "", recognition: "", why: "Joined the made-up housing team.", folded: false },
      { stageKind: "postdoc", stage: "Postdoctoral", kind: "", org: "", unit: "", recognition: "", why: "now leads a made-up lab of six", folded: true },
      { stageKind: "doctoral", stage: "Doctoral", kind: "university", org: "A made-up university", unit: "", recognition: "a made-up prize", why: "is now a made-up policy analyst", folded: true }];
    await seed(stB);
    r = await js(H + `await w(200); const a={};
      rail('Export').click(); await w(150); a.prev=q('.v7-draft-body').innerText; rail('Review').click(); await w(200); a.lists=qa('.v7-glance a').map(x=>x.innerText); a.listsHead=qa('.v7-glance .v7-tile-k').map(x=>x.innerText);
      rail('Contributions').click(); await w(200); a.outQ=(q('[data-f$="-outputs"] .v7-q')||{}).textContent||'';
      rail('Export').click(); await w(150); a.listNote=(q('.v7-lists-note')||{}).innerText||'';
      let clip=''; const ow=navigator.clipboard.writeText; navigator.clipboard.writeText=async(t)=>{clip=t;};
      qa('.btn').find(b=>/^Copy Supervisory/.test(b.innerText)).click(); await w(40); a.mentor=clip; navigator.clipboard.writeText=ow;
      a.copyBtn=qa('.v7-quiet-btn').map(b=>b.innerText).join('|');
      return a;`);
    check("parts that do not end a sentence get a full stop where they join (r7-a-2)", /The made-up papers were scattered\. I led the made-up build\./.test(r.prev), r.prev.slice(0, 300));
    check("V8.14: Lists to rewrite is held back for the beta, on Review and Export (Prem, 2026-11-16); Copy draft says it carries notes (r7-a-6)", !r.listsHead.some(t => /Lists to rewrite/i.test(t)) && !/reads as a list|still read/.test(r.listNote) && /with notes/.test(r.copyBtn), r);
    check("trainee answers that start with a verb join the sentence in any case; with nothing before them they follow 'I trained' (r7-a-3, M-2)", /a made-up city and joined the made-up housing team\./.test(r.mentor) && /A postdoctoral fellow I trained now leads a made-up lab of six\./.test(r.mentor) && /is now at a made-up university, received a made-up prize and is a made-up policy analyst\./.test(r.mentor), r.mentor);
    check("with a second field, What resulted names that field's outputs (r7-b-7)", /Name outputs from STEM and engineering too/.test(r.outQ), r.outQ);
    // M-3: an ordinary Back to the start page is not "an earlier draft"
    await send("Page.resetNavigationHistory");
    await seed(null);
    r = await js(H + `q('.v7-path-new').click(); await w(200); history.back(); await w(400); return {live:q('#v7-live').textContent, start:!!q('.v7-path-new')};`);
    check("Start, then Back, reaches the start page without the 'earlier draft' line (M-3)", r.start && !/earlier draft/.test(r.live), r);
  }

  console.log("Audit loop, round 8");
  {
    const stC = Object.assign({}, JSON.parse(JSON.stringify(fixture)), { profileConfirmed: true, mode: "compose", stageKey: "contrib", ui: { profileNote: false } });
    stC.contributions = [{ cid: "cq1", title: "Made-up walking protocol", stakes: "", roleMode: "", roleLine: "", activities: "", outputs: "", outcomes: "", impact: "", translational: "", evidence: [], flags: {}, notes: {} }];
    stC.mentees = [{ stageKind: "doctoral", stage: "Doctoral", kind: "health", org: "A made-up hospital", unit: "", recognition: "", why: "James now leads the made-up clinic.", folded: false }];
    await seed(stC);
    r = await js(H + `await w(200); const a={}; const box=(k)=>q('[data-f$="-'+k+'"] .v7-box'); const fl=(k)=>qa('[data-f$="-'+k+'"] .v4-flag').map(x=>x.textContent).join('|');
      box('stakes').focus(); setv(box('stakes'),'in our region about 1,900 made-up people have a stroke each year'); await w(80); a.stakes=fl('stakes');
      box('roleLine').focus(); setv(box('roleLine'),'I am the principal investigator of the made-up study.'); await w(80);
      box('activities').focus(); setv(box('activities'),'We have developed a made-up questionnaire with 12 items and tested it with 640 made-up patients.'); await w(80);
      a.act=fl('activities'); a.meta=qa('[data-f$="-activities"] .v4-meta').map(x=>x.textContent).join('|');
      box('outcomes').focus(); setv(box('outcomes'),'After the made-up training in 2024 the patients could walk without help.'); await w(80); a.walk=fl('outcomes');
      setv(box('outcomes'),'The made-up nurses saw the patients, and each one improved.'); await w(80); a.each=fl('outcomes');
      box('outputs').focus(); setv(box('outputs'),'• A made-up manual\\n• Two made-up papers'); await w(80);
      rail('Export').click(); await w(200); a.prev=(q('.v7-draft-body')||{}).innerText||''; rail('Review').click(); await w(200);
      rail('Mentorship').click(); await w(200); a.help=(q('.v7-people-help')||{}).innerText||'';
      const cs=q('[data-f="m-mentorCrossStage"] .v7-box'); cs.focus(); setv(cs,'I mentor two made-up staff. It was a prestigious grant.'); await w(80); a.prest=qa('[data-f="m-mentorCrossStage"] .v4-flag').map(x=>x.textContent).join('|');
      rail('Export').click(); await w(150);
      let clip=''; const ow=navigator.clipboard.writeText; navigator.clipboard.writeText=async(t)=>{clip=t;};
      const cb=qa('.btn').find(b=>/^Copy Supervisory/.test(b.innerText)); if(!cb) return {err:'no copy', btns:qa('.btn').map(b=>b.innerText).join('|')}; cb.click(); await w(40); a.mentor=clip;
      qa('button').find(b=>/^Copy draft with notes/.test(b.innerText)).click(); await w(40); a.txt=clip; navigator.clipboard.writeText=ow;
      return a;`);
    check("V8.14: the .txt header has no Lists to rewrite note while the check is held back (N-6)", r.txt.indexOf("[Lists to rewrite") === -1 && r.txt.indexOf("1. Made-up walking protocol") > -1, r.txt.slice(0, 600));
    check("'our region' in The problem or question is not asked for your own part (r8-b-2)", !/“we”/.test(r.stakes), r);
    check("a role line saying 'I am the principal investigator' names your part for the card (r8-b-1)", !/“we”/.test(r.act), r);
    check("the length line gives a verdict against the usual range (r8-b-4)", /The usual range here is \d+ to \d+, so this is short\./.test(r.meta), r.meta);
    check("'could walk' is a past ability, and 'each one' is not a number (r8-b-3, r8-a-5)", !/hedge/.test(r.walk) && /No numbers yet/.test(r.each), r);
    check("a part typed in lower case starts with a capital where it prints (N-2)", /In our region about 1,900/.test(r.prev), r.prev.slice(0, 200));
    check("'prestigious' gets its own message, and the people note no longer uses the word (r8-b-7)", /is an opinion/.test(r.prest) && !/Journal Impact Factor/.test(r.prest) && !/prestigious/.test(r.help), r);
    check("a trainee answer that starts with a name stays whole as its own sentence (N-1)", /A doctoral student I trained now works at a made-up hospital\. James now leads the made-up clinic\./.test(r.mentor), r.mentor);
    // r8-a-6: the contribution Undo line takes the removed card's place.
    const mk3 = (n, fold) => ({ cid: "cu" + n, title: "Made-up contribution " + n, stakes: "Stakes " + n + ".", roleMode: "led", roleLine: "I led it.", activities: "I ran " + n + " made-up sites.", outputs: "", outcomes: "", impact: "", translational: "", evidence: [], flags: {}, notes: {}, folded: fold });
    await seed(Object.assign({}, JSON.parse(JSON.stringify(fixture)), { profileConfirmed: true, mode: "compose", stageKey: "contrib", ui: { profileNote: false }, contributions: [mk3(1, true), mk3(2, false), mk3(3, true)] }));
    r = await js(H + `await w(200); q('[aria-label="Remove contribution 2"]').click(); await w(150); qa('.v7-warn .btn-primary')[0].click(); await w(250);
      const kids=[...q('.v7-cards').children]; const a={at:kids.indexOf(q('.v7-cundo')), n:kids.length, focus:(document.activeElement||{}).id};
      q('#c-undo').click(); await w(250); a.order=JSON.parse(localStorage.getItem('ncv-v9')).contributions.map(c=>c.cid).join(','); return a;`);
    check("the contribution Undo line sits where the removed card was, takes focus, and Undo puts it back there (r8-a-6, r10-b-6)", r.at === 1 && r.focus === "c-undo" && r.order === "cu1,cu2,cu3,cauto", r);
    // r8-a-1: a phone held sideways folds the rail into one row and keeps the page within the screen.
    await send("Emulation.setDeviceMetricsOverride", { width: 812, height: 375, deviceScaleFactor: 1, mobile: true });
    await send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
    await seed(Object.assign({}, JSON.parse(JSON.stringify(fixture)), { profileConfirmed: true, mode: "compose", stageKey: "mentor", ui: { profileNote: false } }));
    r = await js(H + `await w(300); window.scrollTo(0,0); const nm=q('#v7-t-other-kind');
      return {coarse:matchMedia('(pointer: coarse)').matches, toggle:getComputedStyle(q('#v7-rail-toggle')).display, railH:Math.round(q('.narrative-progress-panel').getBoundingClientRect().height), sw:document.documentElement.scrollWidth, nmH:nm?Math.round(nm.getBoundingClientRect().height):0, nmF:nm?getComputedStyle(nm).fontSize:''};`);
    await send("Emulation.setTouchEmulationEnabled", { enabled: false, maxTouchPoints: 1 });
    await send("Emulation.setDeviceMetricsOverride", { width: 375, height: 812, deviceScaleFactor: 1, mobile: true });
    // N-5: on a laptop at 150% text the rail column grows, so "Contributions" stays one word.
    await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
    await seed(Object.assign({}, JSON.parse(JSON.stringify(fixture)), { profileConfirmed: true, mode: "compose", stageKey: "contrib", ui: { profileNote: false } }));
    const r150 = await js(H + `document.documentElement.style.fontSize='150%'; await w(300);
      const sp=qa('.v7-ri > span:nth-child(2)').find(x=>/^Contributions/.test(x.innerText)); const tn=sp.firstChild; const rg=document.createRange(); rg.setStart(tn,0); rg.setEnd(tn,'Contributions'.length);
      const a={lines:new Set([...rg.getClientRects()].map(x=>Math.round(x.top))).size, rail:Math.round(q('.narrative-progress-panel').getBoundingClientRect().width), sw:document.documentElement.scrollWidth};
      document.documentElement.style.fontSize=''; return a;`);
    await send("Emulation.setDeviceMetricsOverride", { width: 375, height: 812, deviceScaleFactor: 1, mobile: true });
    check("at 150% text on a laptop the rail column grows and keeps 'Contributions' whole (N-5)", r150.lines === 1 && r150.rail > 300 && r150.sw <= 1280, r150);
    check("a phone held sideways folds the rail to one row, with no sideways scroll; the Other list is a 44 px, 16 px field (r8-a-1, r8-a-3)", r.coarse && r.toggle !== "none" && r.railH <= 80 && r.sw <= 812 && r.nmH >= 44 && r.nmF === "16px", r);
    // P-1, Q-18 (Prem, 2026-11-01): the first part is called "The problem or question".
    await seed(Object.assign({}, JSON.parse(JSON.stringify(fixture)), { profileConfirmed: true, mode: "compose", stageKey: "contrib", ui: { profileNote: false },
      contributions: [{ cid: "cp1", title: "Made-up contribution", stakes: "", roleMode: "led", roleLine: "I led it.", activities: "I ran three made-up sites.", outputs: "", outcomes: "", impact: "", translational: "", evidence: [], flags: {}, notes: {} }] }), "", { raw: true }); // the card's gap note; Review stays locked
    r = await js(H + `await w(200); const a={k:(q('[data-f$="-stakes"] .v7-f-k')||{}).innerText||''};
      rail('Review').click(); await w(200); a.gap=qa('.v4-gap').map(x=>x.textContent).join('|'); a.page=document.body.innerText; return a;`);
    check("the first part is called 'The problem or question' on the card, with no empty-part note and no 'Stakes' label (P-1, Q-18, C18)", r.k.trim() === "The problem or question" && r.gap === "" && !/\bStakes\b/.test(r.page), { k: r.k, gap: r.gap });
    // Q-18: same part, same data; the question under it follows the field chosen in Setup.
    const stakesQ = async (lens) => {
      const st = Object.assign({}, JSON.parse(JSON.stringify(fixture)), { profileConfirmed: true, mode: "compose", stageKey: "contrib", ui: { profileNote: false } });
      st.lens = Object.assign({}, st.lens, { discipline2: "", workMode: [] }, lens);
      st.contributions = [{ cid: "cf1", title: "Made-up contribution", stakes: "", roleMode: "", roleLine: "", activities: "", outputs: "", outcomes: "", impact: "", translational: "", evidence: [], flags: {}, notes: {} }];
      await seed(st);
      return js(H + `await w(150); const g=(k)=>((q('[data-f$="-'+k+'"] .v7-q')||{}).innerText||'').trim(); return {stakes:g('stakes'), act:g('activities'), out:g('outcomes')};`);
    };
    const fq = {};
    for (const [k, lens] of Object.entries({ stem: { discipline: "stem" }, health: { discipline: "health" }, social: { discipline: "social" }, humanities: { discipline: "humanities" }, creative: { discipline: "creative" },
      stemCommunity: { discipline: "stem", workMode: ["community"] }, stemHum: { discipline: "stem", discipline2: "humanities" }, humStem: { discipline: "humanities", discipline2: "stem" } })) fq[k] = await stakesQ(lens);
    check("the problem part's question follows the field: problem for STEM and health, question for humanities and creative, both for social sciences (Q-18)",
      /^What problem did this work address/.test(fq.stem.stakes) && /^What problem did this work address/.test(fq.health.stakes) && /^What problem or question did this work address/.test(fq.social.stakes)
      && /^What question did you take up/.test(fq.humanities.stakes) && /^What question did you explore/.test(fq.creative.stakes), fq);
    check("community-engaged work is asked about a need or question and who raised it; a second field framed the other way adds one line (Q-18)",
      /^What need or question did this work take up, and who raised it\?$/.test(fq.stemCommunity.stakes) && /If it began from a question, name the question\.$/.test(fq.stemHum.stakes)
      && /If it answered a practical problem, name the problem too\.$/.test(fq.humStem.stakes), { c: fq.stemCommunity.stakes, sh: fq.stemHum.stakes, hs: fq.humStem.stakes });
    check("humanities and creative profiles get their own wording for What you did and What already changed (Q-18)",
      /sources, archives/.test(fq.humanities.act) && /used or referenced this work/.test(fq.humanities.out) && /seen, used or responded/.test(fq.creative.out) && /^Which methods, sites/.test(fq.stem.act), { h: fq.humanities, c: fq.creative });
  }

  console.log("Audit loop, round 9");
  {
    const base = () => Object.assign({}, JSON.parse(JSON.stringify(fixture)), { profileConfirmed: true, mode: "compose", stageKey: "contrib", ui: { profileNote: false } });
    const blankC = (cid) => ({ cid, title: "Made-up contribution", stakes: "", roleMode: "", roleLine: "", activities: "", outputs: "", outcomes: "", impact: "", translational: "", evidence: [], flags: {}, notes: {} });
    // Checks on the community-engaged fixture (Social sciences + Community-engaged).
    const st = base(); st.contributions = [blankC("r91")];
    st.mentees = [{ stageKind: "doctoral", stage: "Doctoral", kind: "health", org: "A made-up hospital", unit: "", recognition: "", why: "Now leads a made-up hospital program.", folded: false },
      { stageKind: "masters", stage: "Master's", kind: "", org: "", unit: "", recognition: "", why: "Rose now runs a made-up lab.", folded: false },
      { stageKind: "other", stage: "Community researcher", stageOther: "Community researcher", kind: "indigenous", org: "", unit: "", recognition: "", why: "Leads the made-up survey team.", folded: false }];
    await seed(st);
    r = await js(H + `await w(200); const a={}; const box=(k)=>q('[data-f$="-'+k+'"] .v7-box'); const fl=(k)=>qa('[data-f$="-'+k+'"] .v4-flag').map(x=>x.textContent).join('|');
      const put=async(k,v)=>{ box(k).focus(); setv(box(k),v); await w(80); return fl(k); };
      a.twelve=await put('activities','We ran the survey at the twelve made-up sites over a year. I designed it.');
      a.child=await put('activities','I was a child in that region, and we all knew the made-up river.');
      a.years=await put('activities','2019. Joined the made-up lab\\n2021. Led the made-up survey');
      a.dash=await put('activities','— one made-up thing\\n— two made-up things');
      a.by=await put('activities','Three cohorts were taught to 24 made-up workers by the partners’ nurses and Elders.');
      a.withC=await put('activities','The score was developed in workshops with the crew.');
      a.bare=await put('activities','The score was developed in 2023.');
      a.howMany=await put('activities','I saw how many made-up patients arrived late, in 2021.');
      a.qHedge=await put('stakes','How might a made-up warehouse become a score for dance?');
      a.asked=await put('stakes','In 2019 the partners asked how nurses could give care at home.');
      a.hedge=await put('stakes','The made-up practice could be read as a craft.');
      setv(box('stakes'),'a corpus of made-up letters'); await w(80);
      a.q={ act:(q('[data-f$="-activities"] .v7-q')||{}).innerText||'', tr:(q('[data-f$="-translational"] .v7-q')||{}).innerText||'' };
      // r9-b-12: a role level re-reads the card's other fields.
      setv(box('activities'),'We ran the made-up survey in 2023.'); await w(80); a.weBefore=fl('activities');
      box('roleLine').focus(); await w(150); const lv=qa('[data-f$="-roleLine"] .v7-mini')[0]; if(!lv) return {err:'no role level', html:(q('[data-f$="-roleLine"]')||{}).outerHTML}; lv.click(); await w(120); a.weAfter=fl('activities');
      // r9-b-13: a key press on the chosen level keeps it; a mouse click on it clears it.
      lv.dispatchEvent(new MouseEvent('click',{bubbles:true,detail:0})); await w(80); a.kept=lv.getAttribute('aria-checked');
      lv.dispatchEvent(new MouseEvent('click',{bubbles:true,detail:1})); await w(80); a.kept2=lv.getAttribute('aria-checked'); a.noClear=!q('[data-f$="-roleLine"] .v7-lv-clear'); setv(box('roleLine'),'I designed the made-up survey.'); await w(80);
      // r9-b-14: one Tab stop in the field column.
      a.tabStops=qa('.v7-fcol .v7-fsq').filter(b=>b.tabIndex===0).length; a.sq=qa('.v7-fcol .v7-fsq').length;
      a.join=qa('.v4-connective').map(x=>x.textContent).join('|');
      rail('Personal statement').click(); await w(200); a.ps=(q('[data-f="ps-challenge"] .v7-q')||{}).innerText||'';
      rail('Export').click(); await w(200); a.prev=(q('.v7-draft-body')||{}).innerText||''; rail('Review').click(); await w(200); if (q('#v8-tab-role')) { q('#v8-tab-role').click(); await w(60); } a.self=(q('.v8-rb')||{}).textContent||''; rail('Export').click(); await w(200); a.self+=' '+((q('.v7-selfcheck')||{}).textContent||''); rail('Review').click(); await w(200);
      rail('Mentorship').click(); await w(200); a.mhead=qa('#ncv-v4-root h3').map(x=>x.innerText).join('|');
      rail('Export').click(); await w(150);
      let clip=''; const ow=navigator.clipboard.writeText; navigator.clipboard.writeText=async(t)=>{clip=t;};
      const cb=qa('.btn').find(b=>/^Copy Supervisory/.test(b.innerText)); if(!cb) return {err:'no copy', btns:qa('.btn').map(b=>b.innerText).join('|')}; cb.click(); await w(40); a.mentor=clip; navigator.clipboard.writeText=ow;
      return a;`);
    check("spelled-out numbers after 'the' count again; 'I was a child' does not name your part (R-1, R-6)", !/No numbers yet/.test(r.twelve) && /“we”/.test(r.child), { twelve: r.twelve, child: r.child });
    check("one list detector: year-led lines are not a list, dash lines are (R-5)", !/reads as a list/.test(r.years) && /reads as a list/.test(r.dash), { years: r.years, dash: r.dash });
    check("a passive with its agent named by 'by' or 'with' people is not flagged; a bare one is (r9-b-2, r9-a-11)", !/does not say who/.test(r.by) && !/does not say who/.test(r.withC) && /does not say who/.test(r.bare), { by: r.by, withC: r.withC, bare: r.bare });
    check("'how many' is not vague; 'could' in a reported question is not a hedge (r9-b-16, r9-b-10)", !/how many\?/.test(r.howMany) && !/hedge/.test(r.asked), { howMany: r.howMany, asked: r.asked });
    check("a question in The problem or question may use 'might'; a hedged statement there gets the part's own message (r9-a-1)", !/hedge/.test(r.qHedge) && /as it stood/.test(r.hedge), { qHedge: r.qHedge, hedge: r.hedge });
    check("a part starting with 'a' prints with a capital (R-4)", /A corpus of made-up letters\./.test(r.prev), r.prev.slice(0, 200));
    check("a role level re-reads the card's other fields, so the 'we' flag goes (r9-b-12)", /“we”/.test(r.weBefore) && !/“we”/.test(r.weAfter), { before: r.weBefore, after: r.weAfter });
    check("a second press on the chosen role level keeps it, by key or by click; there is no 'Clear your choice' (r9-b-13, S-3, C17)", r.kept === "true" && r.kept2 === "true" && r.noClear === true, { kept: r.kept, kept2: r.kept2 });
    check("the field column is one Tab stop (r9-b-14)", r.tabStops === 1 && r.sq > 5, { tabStops: r.tabStops, sq: r.sq });
    check("community-engaged wording: What you did, One moment, the join, Mentorship headings and the self-check; the main field's own statement wording comes first (r9-b-1, r9-b-4, r9-b-11)",
      /communities or partners/.test(r.q.act) && /in use by a specific person/.test(r.q.tr) && /in response/.test(r.join) && /main focus or research question in your work with community partners/.test(r.ps)
      && /People you have trained or mentored/.test(r.mhead) && !/five years/.test(r.mhead) && /Highlight some people you trained or mentored/.test(r.mhead) && /In each contribution, please also name what your partners led or hold\./.test(r.self) && /their data/.test(r.self),
      { q: r.q, join: r.join, ps: r.ps, mhead: r.mhead });
    check("trainee answers: 'Now leads…' joins, a name before 'now' stays whole, a community researcher is one you mentored (R-3, r9-b-1)",
      /A doctoral student I trained now works at a made-up hospital and leads a made-up hospital program\./.test(r.mentor) && /I trained\. Rose now runs a made-up lab\./.test(r.mentor) && /A community researcher I mentored/.test(r.mentor), r.mentor);
    // Creative / fine arts, team-based: the wording follows the field.
    const sc = base(); sc.lens = Object.assign({}, sc.lens, { discipline: "creative", discipline2: "", workMode: ["team"] }); sc.contributions = [blankC("r92")];
    await seed(sc);
    r = await js(H + `await w(200); const g=(k)=>((q('[data-f$="-'+k+'"] .v7-q')||{}).innerText||'').trim(); const hp=(k)=>((q('#cr92-'+k+'-hp')||q('[id$="-'+k+'-hp"]')||{}).textContent||'');
      const a={role:g('roleLine'), imp:g('impact'), outH:hp('outputs')};
      setv(q('[data-f$="-stakes"] .v7-box'),'What can a made-up warehouse teach about dance?'); const box=q('[data-f$="-activities"] .v7-box'); box.focus(); setv(box,'The audience may linger afterwards.'); await w(80); a.hedge=qa('[data-f$="-activities"] .v4-flag').map(x=>x.textContent).join('|');
      setv(q('[data-f$="-activities"] .v7-box'),'I made it.'); setv(q('[data-f$="-outputs"] .v7-box'),'Three made-up works.'); await w(80);
      a.join=qa('.v4-connective').map(x=>x.textContent).join('|');
      q('#ev-open-r92').click(); await w(200); a.kind=((qa('.v7-kind')[0])||{}).innerText||'';
      return a;`);
    check("creative wording: role, What could change, What resulted's sample and hint, the possibility message, the join and the first evidence kind (r9-a-1 to r9-a-10)",
      /who made the other parts/.test(r.role) && /practice, audience or community/.test(r.imp) && /^For example: “/.test(r.outH) && /exhibitions, films, performances or published works/.test(r.outH) && /This part is about what has happened/.test(r.hedge) && /in response/.test(r.join) && /^Exhibition/.test(r.kind.trim()), r);
    // R-2: a larger browser text size gets the one-column layout; a raised page text size keeps the content usable.
    await send("Emulation.setDeviceMetricsOverride", { width: 1000, height: 800, deviceScaleFactor: 1, mobile: false });
    await send("Page.setFontSizes", { fontSizes: { standard: 32, fixed: 26 } });
    await seed(Object.assign(base(), { contributions: [blankC("r93")] }));
    const big = await js(H + `await w(250); return {toggle:getComputedStyle(q('#v7-rail-toggle')).display, sw:document.documentElement.scrollWidth};`);
    await send("Page.setFontSizes", { fontSizes: { standard: 16, fixed: 13 } });
    await send("Emulation.setDeviceMetricsOverride", { width: 769, height: 900, deviceScaleFactor: 1, mobile: false });
    await seed(Object.assign(base(), { contributions: [blankC("r94")] }));
    const root = await js(H + `document.documentElement.style.fontSize='200%'; await w(300); const c=q('.narrative-stage-content'); const a={sw:document.documentElement.scrollWidth, content:Math.round(c.getBoundingClientRect().width)}; document.documentElement.style.fontSize=''; return a;`);
    await send("Emulation.setDeviceMetricsOverride", { width: 375, height: 812, deviceScaleFactor: 1, mobile: true });
    check("large browser text gets one column; 200% page text at 769 px keeps the content column usable with no sideways scroll (R-2)", big.toggle !== "none" && big.sw <= 1000 && root.sw <= 769 && root.content >= 300, { big, root });
  }

  console.log("Audit loop, round 10");
  {
    const base = () => Object.assign({}, JSON.parse(JSON.stringify(fixture)), { profileConfirmed: true, mode: "compose", stageKey: "contrib", ui: { profileNote: false } });
    const blankC = (cid) => ({ cid, title: "Made-up contribution", stakes: "", roleMode: "", roleLine: "", activities: "", outputs: "", outcomes: "", impact: "", translational: "", evidence: [], flags: {}, notes: {} });
    const st = base(); st.contributions = [blankC("r101")];
    st.mentees = [{ stageKind: "doctoral", stage: "Doctoral", kind: "government", org: "Veterans Affairs Canada", unit: "", recognition: "", why: "Veterans Affairs Canada hired her in 2024.", folded: false },
      { stageKind: "masters", stage: "Master's", kind: "", org: "", unit: "", recognition: "", why: "Charles Adams now runs a made-up lab.", folded: false }];
    await seed(st);
    r = await js(H + `await w(200); const a={}; const box=(k)=>q('[data-f$="-'+k+'"] .v7-box'); const fl=(k)=>qa('[data-f$="-'+k+'"] .v4-flag').map(x=>x.textContent).join('|');
      const put=async(k,v)=>{ box(k).focus(); setv(box(k),v); await w(80); return fl(k); };
      await put('roleLine','I was the Principal Investigator of the made-up study.');
      a.we=await put('activities','We ran the made-up survey in six sites in 2023.');
      a.byMarch=await put('activities','The survey was sent to the six made-up sites by March 2024.');
      a.withP=await put('activities','The protocol was tested with 40 made-up participants.');
      a.might=await put('stakes','In 2020 the clinic asked whether it might take the made-up program up.');
      a.rail=(qa('.v7-ri').find(b=>/^Mentorship/.test(b.innerText))||{}).textContent||'';
      setv(box('outputs'),'A made-up report.'); await w(60);
      rail('Export').click(); await w(150);
      let clip=''; const ow=navigator.clipboard.writeText; navigator.clipboard.writeText=async(t)=>{clip=t;};
      const cb=qa('.btn').find(b=>/^Copy Supervisory/.test(b.innerText)); if(cb){ cb.click(); await w(40); } a.mentor=clip; navigator.clipboard.writeText=ow;
      return a;`);
    check("a role line with a capitalised title names your part, so 'we' elsewhere is the team (S-1)", !/“we”/.test(r.we), r.we);
    check("passives with a deadline after 'by', or tested 'with participants', are still flagged (S-5)", /does not say who/.test(r.byMarch) && /does not say who/.test(r.withP), { byMarch: r.byMarch, withP: r.withP });
    check("'might' in a reported question is not a hedge (S-5 note)", !/hedge/.test(r.might), r.might);
    check("the rail says 'people trained or mentored' for a community-engaged profile (S-7)", /trained or mentored/.test(r.rail), r.rail);
    check("organization names and two-word names stay whole in the trainee sentence (S-4)", /in government at Veterans Affairs Canada\. Veterans Affairs Canada hired her in 2024\./.test(r.mentor) && /I trained\. Charles Adams now runs a made-up lab\./.test(r.mentor), r.mentor);
    // S-2: at a whole-pixel width that falls between the em breakpoints, the field column stays beside the card.
    await send("Page.setFontSizes", { fontSizes: { standard: 20, fixed: 16 } });
    await send("Emulation.setDeviceMetricsOverride", { width: 961, height: 800, deviceScaleFactor: 1, mobile: false });
    await seed(Object.assign(base(), { contributions: [blankC("r102")] }));
    const gap = await js(H + `await w(250); const card=q('.v7-card-col'), col=q('.v7-fcol'); return {grid:getComputedStyle(card).gridTemplateColumns, dy:col?Math.round(col.getBoundingClientRect().top-card.getBoundingClientRect().top):-1, colDisp:col?getComputedStyle(col).display:''};`);
    await send("Page.setFontSizes", { fontSizes: { standard: 16, fixed: 13 } });
    await send("Emulation.setDeviceMetricsOverride", { width: 375, height: 812, deviceScaleFactor: 1, mobile: true });
    check("no gap between the breakpoints at 20 px text and 961 px: the field column stays beside the card (S-2)", gap.grid !== "none" && gap.dy < 200, gap);
    // r10-a: a historian on a phone, with the phone's capitals.
    const sh = base(); sh.lens = Object.assign({}, sh.lens, { discipline: "humanities", discipline2: "", workMode: ["solo", "industry"] }); sh.contributions = [blankC("r103")];
    sh.ps = Object.assign({}, sh.ps, { role: "Postdoctoral fellow", institution: "A made-up Québec university", field: "The history of made-up medicine" });
    sh.mentees = [{ stageKind: "masters", stage: "Master's", kind: "university", org: "", unit: "History", recognition: "A provincial made-up scholarship (2022)", why: "", folded: false },
      { stageKind: "masters", stage: "Master's", kind: "government", org: "", unit: "", recognition: "", why: "Now a lecturer at a made-up CEGEP", folded: false },
      { stageKind: "undergrad", stage: "Undergraduate research", kind: "arts", org: "", unit: "", recognition: "", why: "Works at the made-up provincial archives", folded: false },
      { stageKind: "doctoral", stage: "Doctoral", kind: "", org: "", unit: "", recognition: "", why: "Teaching history at a made-up CEGEP", folded: false }];
    await seed(sh);
    r = await js(H + `await w(200); const a={}; a.role=((q('[data-f$="-roleLine"] .v7-q')||{}).innerText||'').trim();
      const box=q('[data-f$="-activities"] .v7-box'); box.focus(); setv(box,'The made-up records let us say more about 1890.'); await w(80); a.us=qa('[data-f$="-activities"] .v4-flag').map(x=>x.textContent).join('|');
      setv(q('[data-f$="-roleLine"] .v7-box'),'I wrote it.'); setv(q('[data-f$="-stakes"] .v7-box'),'A made-up question.'); setv(box,'I read 400 made-up casebooks.'); await w(80);
      rail('Mentorship').click(); await w(200); a.pv=qa('.v7-person-preview').map(x=>x.textContent).join('|'); a.pzHelp=!!q('.v7-pz-help'); a.cap=(q('#v7-pz0')||{}).getAttribute ? q('#v7-pz0').getAttribute('autocapitalize') : '';
      rail('Export').click(); await w(150);
      let clip=''; const ow=navigator.clipboard.writeText; navigator.clipboard.writeText=async(t)=>{clip=t;};
      const cb=qa('button').find(b=>/^Copy draft with notes/.test(b.innerText)); if(cb){ cb.click(); await w(40); } a.txt=clip; navigator.clipboard.writeText=ow;
      return a;`);
    check("the statement's first sentence lowers a phone's capitals mid-sentence (r10-a-2)", /I am a postdoctoral fellow at a made-up Québec university\. My work is in the history of made-up medicine\./.test(r.txt), r.txt.slice(0, 400));
    check("trainee sentences: a unit with no organization, a lowered article, 'Now a…', 'Works at…' and 'Teaching…' all print as sentences (r10-a-1, r10-a-3, r10-a-4)",
      /is now at a university \(History\) and received a provincial made-up scholarship \(2022\)\./.test(r.txt) && /now works in government and is a lecturer at a made-up CEGEP\./.test(r.txt)
      && /An undergraduate researcher I trained now works at the made-up provincial archives\./.test(r.txt) && /A doctoral student I trained is teaching history at a made-up CEGEP\./.test(r.txt), r.txt.slice(r.txt.indexOf("Totals"), r.txt.indexOf("Totals") + 700));
    check("each person card shows how its sentence prints; the prize instruction is a help line and the box takes no phone capital (r10-a-4, r10-a-12)", /Prints as: A master’s student I trained is now at a university \(History\)/.test(r.pv) && r.pzHelp && r.cap === "none", { pv: r.pv.slice(0, 300), pzHelp: r.pzHelp, cap: r.cap });
    check("'us' is not read as 'we'; largely solo work with a partner asks for your part and the partner (r10-a-5, r10-a-6)", !/“we”/.test(r.us) && /who was the partner\?$/.test(r.role), { us: r.us, role: r.role });
    // r10-b: a low-vision engineer with the browser's text size at 28 px.
    const se = base(); se.lens = Object.assign({}, se.lens, { discipline: "stem", discipline2: "", workMode: ["team", "industry"] });
    se.contributions = [Object.assign(blankC("r104"), { title: "A made-up sensor network", stakes: "Made-up bridges fail.", roleMode: "led", activities: "I ran 40 made-up sensors." }), Object.assign(blankC("r105"), { title: "Second", stakes: "x", roleMode: "led", activities: "y" })];
    await send("Page.setFontSizes", { fontSizes: { standard: 28, fixed: 23 } });
    await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false });
    await seed(se, "", { raw: true }); // as in V8: Review locked (see the V9 README on a step change at 28 px)
    r = await js(H + `await w(250); const a={}; const box=q('[data-f$="-outputs"] .v7-box'); box.focus(); await w(80);
      a.fs=parseFloat(getComputedStyle(box).fontSize); a.ring=getComputedStyle(box).boxShadow;
      a.outH=((q('[id$="-outputs-hp"]')||{}).textContent||'');
      q('#ev-open-r104').click(); await w(200); a.evIntro=((q('.v7-ev-area')||{}).innerText||'').slice(0,400);
      rail('Mentorship').click(); await w(300); const h=q('.narrative-stage-header h2')||q('h2'); a.hTop=Math.round(h.getBoundingClientRect().top); a.scrolled=window.scrollY;
      a.chartMax=(()=>{ const t=document.createElement('div'); t.className='v7-gv-art'; const sv=document.createElementNS('http://www.w3.org/2000/svg','svg'); t.appendChild(sv); document.body.appendChild(t); const m=getComputedStyle(sv).maxWidth; t.remove(); return m; })();
      return a;`);
    const tiles = await (async () => { await seed(Object.assign(base(), { profileConfirmed: false, stageKey: "setup", contributions: [blankC("r106")] })); return js(H + `await w(250); const bs=qa('.v7-choice b'); return {n:bs.length, over:bs.filter(b=>b.scrollWidth>b.clientWidth+1).map(b=>b.innerText)};`); })();
    await send("Page.setFontSizes", { fontSizes: { standard: 16, fixed: 13 } });
    await send("Emulation.setDeviceMetricsOverride", { width: 375, height: 812, deviceScaleFactor: 1, mobile: true });
    check("at 28 px browser text, typed text scales above 16 px and a focused field shows a solid ring in its part's accent (r10-b-1, r10-b-12, row 12)", r.fs >= 24 && /rgb\(255, 255, 255\) 0px 0px 0px 2px, rgb\(80, 130, 18\) 0px 0px 0px 4px/.test(r.ring), { fs: r.fs, ring: r.ring });
    check("at 28 px, Setup's tile labels stay inside their tiles and the chart figure's cap grows with the text (r10-b-3, r10-b-4)", tiles.n > 0 && !tiles.over.length && r.chartMax === "1120px", { tiles, chartMax: r.chartMax });
    check("at 28 px in a short window, a step change brings the heading to the top (r10-b-7)", r.hTop < 200, { hTop: r.hTop, scrolled: r.scrolled });
    { // V9.1: a step change straight after a field opens and the evidence view starts must not move the new heading.
      const g = await js(H + `location.hash='#contributions'; await w(400);
        const box=q('[data-f$="-outputs"] .v7-box'); if(box){ box.focus(); await w(20); }
        const o=q('[id^=ev-open-], [id^=ev-add-]'); if(o) o.click(); await w(30);
        location.hash='#mentorship'; await w(800);
        const h=q('.narrative-stage-header h2'); return {h:h.innerText, top:Math.round(h.getBoundingClientRect().top), y:Math.round(scrollY)};`);
      check("V9.1: a step change right after a field and the evidence view open keeps the new heading near the top", !!g.h && g.top >= 0 && g.top < 200, g);
    }
    // r10-a-11, r10-b-2: a field reached by Tab is in view once it has opened.
    await send("Page.setFontSizes", { fontSizes: { standard: 20, fixed: 16 } });
    await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 500, deviceScaleFactor: 1, mobile: false });
    await seed(Object.assign(base(), { contributions: [Object.assign(blankC("r107"), { title: "A made-up headline" })] }));
    await js(H + `await w(250); const b=q('[data-f$="-title"] .v7-box'); b.focus(); b.scrollIntoView({block:'end'}); window.scrollBy(0, 40); await w(400); return 1;`);
    await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
    await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
    const tabIn = await js(H + `await w(1000); const e=document.activeElement, rr=e.getBoundingClientRect(); return {f:(e.closest('.v7-f')||{dataset:{}}).dataset.f, top:Math.round(rr.top), bottom:Math.round(rr.bottom), h:innerHeight};`);
    await send("Page.setFontSizes", { fontSizes: { standard: 16, fixed: 13 } });
    await send("Emulation.setDeviceMetricsOverride", { width: 375, height: 812, deviceScaleFactor: 1, mobile: true });
    check("a field reached by Tab near the foot of a short window is in view once it opens (r10-a-11, r10-b-2)", /-stakes$/.test(tabIn.f || "") && tabIn.bottom <= tabIn.h && tabIn.top >= 0, tabIn);
    check("STEM wording: What resulted's sample and hint and the evidence introduction (r10-b-8, r10-b-10)", /^For example: “/.test(r.outH) && /software releases, patents, standards, design guides or technical reports/.test(r.outH) && /conference paper/.test(r.evIntro) && /patent/.test(r.evIntro), { outH: r.outH, evIntro: r.evIntro });
  }

  console.log("Audit loop, round 11");
  {
    const base = () => Object.assign({}, JSON.parse(JSON.stringify(fixture)), { profileConfirmed: true, mode: "compose", stageKey: "contrib", ui: { profileNote: false } });
    const blankC = (cid) => ({ cid, title: "Made-up contribution", stakes: "", roleMode: "", roleLine: "", activities: "", outputs: "", outcomes: "", impact: "", translational: "", evidence: [], flags: {}, notes: {} });
    const st = base(); st.lens = Object.assign({}, st.lens, { discipline: "stem", workMode: ["community", "solo"] });
    st.contributions = [Object.assign(blankC("r111"), { roleMode: "led", stakes: "x" })];
    st.mentorCounts = Object.assign({}, st.mentorCounts || {}, { other: "1" }); st.mentorOtherLabel = "agents de recherche communautaires";
    st.mentees = [{ stageKind: "masters", stage: "Master's", kind: "industry", org: "Shopify", unit: "", recognition: "", why: "Works as a made-up data scientist", folded: false },
      { stageKind: "doctoral", stage: "Doctoral", kind: "government", org: "Statistics Canada", unit: "", recognition: "", why: "Joined Statistics Canada's made-up census team", folded: false },
      { stageKind: "postdoc", stage: "Postdoctoral", kind: "university", org: "UBC", unit: "", recognition: "", why: "Visiting scholar at UBC", folded: false },
      { stageKind: "doctoral", stage: "Doctoral", kind: "health", org: "The Ottawa Hospital", unit: "", recognition: "", why: "", folded: false },
      { stageKind: "other", stage: "Analyst", stageOther: "Analyst", kind: "", org: "", unit: "Marketing", recognition: "", why: "", folded: false }];
    await seed(st);
    r = await js(H + `await w(200); const a={}; const box=(k)=>q('[data-f$="-'+k+'"] .v7-box'); const fl=(k)=>qa('[data-f$="-'+k+'"] .v4-flag').map(x=>x.textContent).join('|');
      const put=async(k,v)=>{ box(k).focus(); setv(box(k),v); await w(80); return fl(k); };
      a.fr=await put('activities','Nous avons tenu vingt-quatre ateliers avec 3 200 personnes.'); a.frMeta=qa('[data-f$="-activities"] .v4-meta, [data-f$="-activities"] .v4-ok').map(x=>x.textContent).join('|');
      a.frIf=await put('outputs','Trois articles, dont un à facteur d’impact de 14,2.');
      a.byEnd=await put('activities','The made-up tool was tested in clinics by the end-users in 2023.');
      a.note=((q('.v7-first-note')||{}).textContent||'');
      setv(box('activities'),'l’équipe a tenu 24 made-up ateliers.'); await w(60);
      rail('Export').click(); await w(200); a.prev=(q('.v7-draft-body')||{}).innerText||''; rail('Review').click(); await w(200);
      rail('Mentorship').click(); await w(200); a.edi=((q('[data-f="m-mentorEDI"] .v7-q')||{}).innerText||'').trim();
      rail('Export').click(); await w(150);
      let clip=''; const ow=navigator.clipboard.writeText; navigator.clipboard.writeText=async(t)=>{clip=t;};
      const cb=qa('.btn').find(b=>/^Copy Supervisory/.test(b.innerText)); if(cb){ cb.click(); await w(40); } a.mentor=clip; navigator.clipboard.writeText=ow;
      return a;`);
    check("French: number words and '3 200' count, 'facteur d'impact' is caught, the first-suggestion note is the decided hint (r11-a-1, r11-a-4, r11-a-5, C19)", !/No numbers yet/.test(r.fr) && /impact/i.test(r.frIf) && /Suggestions are optional\. They do not check spelling or grammar\./.test(r.note) && !/French/.test(r.note), { fr: r.fr, frMeta: r.frMeta, frIf: r.frIf });
    check("an elided French start takes a capital (r11-a-3); 'by the end-users' names an agent (T-15)", /L’équipe a tenu 24/.test(r.prev) && !/does not say who/.test(r.byEnd), { byEnd: r.byEnd, prev: r.prev.slice(0, 300) });
    check("the equity question follows community-engaged first, whatever the order (T-11)", /^Who joins the research team/.test(r.edi), r.edi);
    check("trainee sentences keep a typed organization, join a listed verb before a name, leave titles whole, keep 'The Ottawa Hospital', and say 'in Marketing' (T-2, T-4, T-5, T-13, T-14)",
      /now works in industry at Shopify and works as a made-up data scientist\./.test(r.mentor) && /at Statistics Canada and joined Statistics Canada's made-up census team\./.test(r.mentor)
      && /I trained is now at UBC\. Visiting scholar at UBC\./.test(r.mentor) && /now works at The Ottawa Hospital\./.test(r.mentor) && /is now in Marketing\./.test(r.mentor), r.mentor);
    check("a group name under Other prints as typed (r11-a-10)", /1 agents de recherche communautaires/.test(r.mentor), r.mentor.slice(0, 200));
    // r11-b: what a screen reader gets.
    const sb = base(); sb.contributions = [Object.assign(blankC("r112"), { title: "A made-up study", stakes: "A made-up gap.", roleMode: "led", activities: "I ran it.", outputs: "A made-up report.", evidence: [{ text: "A made-up article", type: "Peer-reviewed", note: "" }, { text: "A made-up dataset", type: "Dataset / tool", note: "" }] })];
    sb.lens = Object.assign({}, sb.lens, { year: "" });
    await seed(sb);
    r = await js(H + `await w(200); const a={}; a.title=document.title; a.join=qa('.v4-connective').every(x=>x.getAttribute('aria-hidden')==='true') && qa('.v4-connective').length>0;
      a.sq=qa('.v7-fcol .v7-fsq').some(b=>b.title);
      const cur=qa('.v7-ri').find(b=>b.getAttribute('aria-current')==='step'); cur.click(); await w(150); a.curFocus=document.activeElement.tagName;
      q('#ev-open-r112').click(); await w(200);
      a.labels=qa('label[for^="evtr112"]').map(l=>l.textContent).join('|');
      const chg=qa('.v7-ev-item button').find(b=>/^Change/.test(b.innerText)); if(chg){ chg.click(); await w(150); const k=q('.v7-kind[aria-checked="true"]'); k.focus(); k.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true})); await w(150); a.kindMid=JSON.parse(localStorage.getItem('ncv-v9')).contributions[0].evidence[0].type;
        const g=q('.v7-kinds'); if(g) g.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true})); await w(150); }
      a.kindAfter=JSON.parse(localStorage.getItem('ncv-v9')).contributions[0].evidence[0].type;
      return a;`);
    check("screen reader: page title names the step, join words hidden, no repeated titles on the column, the current rail step focuses its heading (r11-b-1, r11-b-4, r11-b-14, r11-b-19)", /^Contributions · /.test(r.title) && r.join && !r.sq && r.curFocus === "H2", r);
    check("evidence fields name their item; Escape in the kind chooser keeps the kind it had (r11-b-2, r11-b-10)", /Evidence item a: The item\|Evidence item b: The item/.test(r.labels) && r.kindMid !== "Peer-reviewed" && r.kindAfter === "Peer-reviewed", { labels: r.labels, kindMid: r.kindMid, kindAfter: r.kindAfter });
  }

  console.log("Audit loop, round 12");
  {
    const base = () => Object.assign({}, JSON.parse(JSON.stringify(fixture)), { profileConfirmed: true, mode: "compose", stageKey: "contrib", ui: { profileNote: false } });
    const blankC = (cid) => ({ cid, title: "Made-up contribution", stakes: "", roleMode: "", roleLine: "", activities: "", outputs: "", outcomes: "", impact: "", translational: "", evidence: [], flags: {}, notes: {} });
    const st = base(); st.lens = Object.assign({}, st.lens, { discipline: "creative", discipline2: "health", workMode: ["community"] });
    st.contributions = [Object.assign(blankC("r121"), { stakes: "a made-up gap.", roleMode: "led" })];
    st.ps = Object.assign({}, st.ps, { role: "researcher", institution: "An NGO", field: "made-up care" });
    await seed(st);
    r = await js(H + `await w(200); const a={}; const box=(k)=>q('[data-f$="-'+k+'"] .v7-box'); const fl=(k)=>qa('[data-f$="-'+k+'"] .v4-flag').map(x=>x.textContent).join('|');
      const put=async(k,v)=>{ box(k).focus(); setv(box(k),v); await w(80); return fl(k); };
      a.n45=await put('activities','Made-up nurses (n = 45) took part.');
      a.seize=await put('activities','We seize the made-up chance each spring.');
      a.inl=await put('outputs','1. A made-up report.\t2. A made-up dataset. 3. Five made-up papers.');
      a.qAct=((q('[data-f$="-activities"] .v7-q')||{}).innerText||''); a.qOut=((q('[data-f$="-outcomes"] .v7-q')||{}).innerText||'');
      setv(box('outputs'),'A made-up report.\tA made-up guide.'); setv(box('activities'),'I ran 12 made-up sessions.'); await w(60);
      rail('Export').click(); await w(150);
      let clip=''; const ow=navigator.clipboard.writeText; navigator.clipboard.writeText=async(t)=>{clip=t;};
      const cb=qa('button').find(b=>/^Copy draft with notes/.test(b.innerText)); if(cb){ cb.click(); await w(40); } a.txt=clip; navigator.clipboard.writeText=ow;
      return a;`);
    check("'(n = 45)' keeps its number; 'seize' in English is not a number (U-1, U-2)", !/No numbers yet/.test(r.n45) && /No numbers yet/.test(r.seize), { n45: r.n45, seize: r.seize });
    check("an inline numbered list on one line is a list (r12-a-1)", /reads as a list/.test(r.inl), r.inl);
    check("a second field adds a line to What you did and What already changed (r12-b-5)", /on the health side too\./.test(r.qAct) && /care practice or guidelines that took it up too\./.test(r.qOut), { qAct: r.qAct, qOut: r.qOut });
    check("a pasted tab prints as a space; 'An NGO' is lowered mid-sentence (r12-a-3, U-7)", !/\t/.test(r.txt) && /at an NGO\./.test(r.txt), r.txt.slice(0, 300));
  }

  console.log("Audit loop, round 13: a fixed set of check sentences (V-1 to V-9)");
  {
    const st = Object.assign({}, JSON.parse(JSON.stringify(fixture)), { profileConfirmed: true, mode: "compose", stageKey: "contrib", ui: { profileNote: false } });
    st.lens = Object.assign({}, st.lens, { workMode: ["team"] });
    st.contributions = [{ cid: "r131", title: "Made-up contribution", stakes: "", roleMode: "", roleLine: "", activities: "", outputs: "", outcomes: "", impact: "", translational: "", evidence: [], flags: {}, notes: {} }];
    await seed(st);
    const SENT = {
      h1: "My research examines made-up urban heat. We ran 12 workshops and our team built the network.",
      frShort: "J’ai formé douze étudiants dans trois laboratoires.",
      frCinq: "Cinq ateliers avec trois partenaires communautaires.",
      enNames: "Le Roux and Du Bois at La Trobe ran the made-up site with nurses.",
      dashNum: "In 2019 — 45 of them were made-up rural clinics.",
      figs: "See Fig. 2. The results held. See Fig. 3. These too, in 2021.",
      range: "From 2019–2022 we ran it.",
    };
    r = await js(H + `await w(200); const out={}; const box=q('[data-f$="-activities"] .v7-box'); box.focus();
      for (const [k,v] of Object.entries(${JSON.stringify(SENT)})) { setv(box, v); await w(70); out[k]={flags:qa('[data-f$="-activities"] .v4-flag').map(x=>x.textContent).join('|'), meta:qa('[data-f$="-activities"] .v4-meta').map(x=>x.textContent).join('|')}; }
      return out;`);
    check("H1: 'My research… We… our team…' still asks for your own part (V-2)", /“we”/.test(r.h1.flags), r.h1);
    check("short French fields with curly apostrophes count their number words (V-1)", !/No numbers yet/.test(r.frShort.flags) && !/No numbers yet/.test(r.frCinq.flags), { frShort: r.frShort.flags, frCinq: r.frCinq.flags });
    check("English with French-derived names is not French; a number after a spaced dash counts (V-3, V-6)", /No numbers yet/.test(r.enNames.flags) && !/No numbers yet/.test(r.dashNum.flags), { enNames: r.enNames.flags, dashNum: r.dashNum.flags });
    // r13-a-1, r13-a-2, r13-b-1: a blank draft from elsewhere does not replace this tab's draft; the warning is an alert.
    const sx = Object.assign({}, JSON.parse(JSON.stringify(fixture)), { profileConfirmed: true, mode: "compose", stageKey: "contrib", ui: { profileNote: false } });
    sx.lens = Object.assign({}, sx.lens, { workMode: ["industry"] });
    await seed(sx);
    const kept = await js(H + `await w(200); const before=JSON.parse(localStorage.getItem('ncv-v9')).contributions.length;
      const help=((q('[id$="-outcomes-hp"]')||{}).textContent||'');
      window.dispatchEvent(new StorageEvent('storage', { key: 'ncv-v9', oldValue: null, newValue: JSON.stringify({ contributions: [{ cid: 'zz', title: '' }], ps: {}, mentees: [] }) }));
      await w(200); const wn=q('#v4-save-warning');
      return { before, cards: qa('.v7-card[data-cid], .v7-fold, .v7-card').length, warn: wn && !wn.hidden ? wn.textContent : '', role: wn ? wn.getAttribute('role') : '', help };`);
    check("a blank draft written elsewhere does not replace this tab's draft; the tab says so in an alert (r13-a-1, r13-a-2)", kept.cards > 0 && kept.warn === "Your browser is not saving your draft. Please save a backup file." && kept.role === "alert", kept);
    check("partnered work gets a line for a partner or figures kept private (r13-b-1)", /describe the partner by its sector and size/.test(kept.help), kept.help);
    check("'See Fig. 2. … Fig. 3.' is not a list; a closed range is one word (V-7, V-8)", !/reads as a list/.test(r.figs.flags) && /^5 words/.test(r.range.meta), { figs: r.figs.flags, range: r.range.meta });
  }

  console.log("Audit loop, round 14");
  {
    const base = () => Object.assign({}, JSON.parse(JSON.stringify(fixture)), { profileConfirmed: true, mode: "compose", stageKey: "contrib", ui: { profileNote: false } });
    const st = base(); st.lens = Object.assign({}, st.lens, { careerStage: "early" });
    st.contributions = [{ cid: "r141", title: "A made-up study", stakes: "A made-up gap.", roleMode: "led", roleLine: "", activities: "I ran it.", outputs: "A report.", outcomes: "", impact: "", translational: "", evidence: [{ text: "A made-up article", type: "Peer-reviewed", note: "" }, { text: "A made-up preprint", type: "Other", note: "" }], flags: {}, notes: {} }];
    await seed(st);
    r = await js(H + `await w(200); const a={};
      a.meta=qa('[data-f$="-activities"] .v4-meta').map(x=>x.textContent).join('|');
      q('#ev-open-r141').click(); await w(200);
      a.otherHint=(q('#evtr141-1')||{}).placeholder||'';
      const rm=qa('button').find(b=>/Remove evidence item a/.test(b.getAttribute('aria-label')||'')); rm.click(); await w(150);
      await w(10500); a.undoAfter=!!q('.v7-undo'); a.live=(q('#v7-live')||{}).textContent||'';
      const box=q('[id^="evtr141"]'); if (box) { box.focus(); setv(box, box.value + ' more'); await w(120); } a.undoAfterEdit=!!q('.v7-undo');
      return a;`);
    check("Undo stays past ten seconds and ends with the next change (r14-a-1)", r.undoAfter && !r.undoAfterEdit, r);
    check("early career: a short answer is fine; a preprint has a place under Other (r14-b-3, r14-b-1)", /A shorter answer that names what you have is fine/.test(r.meta) && /preprint/.test(r.otherHint), { meta: r.meta, otherHint: r.otherHint });
    // X-6: a Reset in another tab (the draft removed) is mirrored; a blank copy written elsewhere is refused (r13-a-1).
    await seed(base());
    const mir = await js(H + `await w(200); window.dispatchEvent(new StorageEvent('storage', { key: 'ncv-v9', oldValue: '{}', newValue: null })); await w(250);
      const wn=q('#v4-save-warning'); return { warn: wn && !wn.hidden ? wn.textContent : '', title: (q('h1, .proto-title')||{}).innerText || '' };`);
    check("a Reset in another tab is mirrored, with no outside-clear alert (X-6)", !/outside this tab/.test(mir.warn), mir);
  }

  console.log("Audit loop, round 15");
  {
    const base = () => Object.assign({}, JSON.parse(JSON.stringify(fixture)), { profileConfirmed: true, mode: "compose", stageKey: "contrib", ui: { profileNote: false } });
    const mk = (n) => ({ cid: "r15" + n, title: "Made-up contribution " + n, stakes: "A made-up gap.", roleMode: "led", roleLine: "", activities: "I ran " + n + " made-up sites.", outputs: "A report.", outcomes: "", impact: "", translational: "", evidence: [{ text: "Item " + n, type: "Peer-reviewed", note: "" }], flags: {}, notes: {}, folded: n !== 1 });
    const st = base(); st.contributions = [mk(1), mk(2)];
    await seed(st);
    r = await js(H + `await w(200); const a={}; const box=(k)=>q('[data-f$="-'+k+'"] .v7-box'); const fl=(k)=>qa('[data-f$="-'+k+'"] .v4-flag, [data-f$="-'+k+'"] .v4-ok').map(x=>x.textContent).join('|');
      box('stakes').focus(); setv(box('stakes'),'I led a team of four made-up nurses on six units.'); await w(80); a.stakes=fl('stakes');
      box('activities').focus(); setv(box('activities'),'Encadrement de quinze stagiaires au laboratoire pendant trois ans.'); await w(80); a.fr=qa('[data-f$="-activities"] .v4-flag').map(x=>x.textContent).join('|');
      setv(box('activities'),'I ran 3 made-up sites.'); await w(60);
      q('#ev-open-r151').click(); await w(200);
      const rm=qa('button').find(b=>/Remove evidence item a/.test(b.getAttribute('aria-label')||'')); rm.click(); await w(150); a.undo1=!!q('.v7-undo');
      const add=qa('button').find(b=>b.innerText.trim().startsWith('+ Add') && /item/.test(b.innerText)); if (add) { add.click(); await w(150); } a.undo2=!!q('.v7-undo');
      rail('Review').click(); await w(250); const up=q('[id^="mv-r151-up"]'); a.upDisabled=up ? up.disabled : null;
      return a;`);
    check("the first card's Move up is disabled (Y-1)", r.upDisabled === true, r);
    check("adding an item ends the Undo on offer (Y-2)", r.undo1 && !r.undo2, r);
    check("a role sentence in The problem or question gets a note, not praise; a French line with articles counts its numbers (r15-a-1, Y-3)", /sounds like you are explaining your role/.test(r.stakes) && !/Your own part is named/.test(r.stakes) && !/No numbers yet/.test(r.fr), { stakes: r.stakes, fr: r.fr });
  }

  console.log("Audit loop, round 16");
  {
    const base = () => Object.assign({}, JSON.parse(JSON.stringify(fixture)), { profileConfirmed: true, mode: "compose", stageKey: "contrib", ui: { profileNote: false } });
    const st = base(); st.lens = Object.assign({}, st.lens, { discipline: "humanities", workMode: ["community"] });
    st.contributions = [{ cid: "r161", title: "A made-up archive", stakes: "A made-up gap.", roleMode: "led", roleLine: "I led it.", activities: "I ran 3 made-up camps.", outputs: "A report.", outcomes: "Two made-up towns used it.", impact: "It could help other towns.", translational: "", evidence: [{ text: "A made-up article", type: "Peer-reviewed", note: "Shows the made-up result." }], flags: {}, notes: {} },
      { cid: "r162", title: "Second", stakes: "x", roleMode: "led", roleLine: "I led it.", activities: "y", outputs: "z", outcomes: "", impact: "", translational: "", evidence: [], flags: {}, notes: {}, folded: true }];
    st.ps = Object.assign({}, st.ps, { streams: "My work has three strands: 1) made-up oral history; 2) a made-up archive; 3) made-up teaching." });
    st.mentees = [{ stageKind: "other", stage: "a community interviewer", stageOther: "a community interviewer", kind: "health", org: "Made-up Institute (MUI)", unit: "team lead", recognition: "", why: "", folded: false }];
    await seed(st);
    r = await js(H + `await w(200); const a={}; a.stakesHelp=((q('[id$="-stakes-hp"]')||{}).textContent||''); a.roleHelp=((q('[id$="-roleLine-hp"]')||{}).textContent||'');
      rail('Review').click(); await w(200); a.lists=(q('.v7-glance')||{}).innerText||'';
      rail('Export').click(); await w(150);
      let doc=''; const oc=URL.createObjectURL; URL.createObjectURL=(b)=>{ b.text().then(t=>{doc=t;}); return oc.call(URL,b); };
      const wb=qa('button').find(b=>/Download Word/.test(b.innerText)); if (wb) { wb.click(); await w(300); } URL.createObjectURL=oc; a.doc=doc;
      let clip=''; const ow=navigator.clipboard.writeText; navigator.clipboard.writeText=async(t)=>{clip=t;};
      const cb=qa('.btn').find(b=>/^Copy Supervisory/.test(b.innerText)); if(cb){ cb.click(); await w(40); } a.mentor=clip; navigator.clipboard.writeText=ow;
      // Z-2: navigation does not end Undo.
      rail('Contributions').click(); await w(200);
      const rm=qa('button').find(b=>/^Remove contribution/.test(b.getAttribute('aria-label')||'')); if (rm) { rm.click(); await w(120); await okWarn(); await w(150); } a.u0=!!q('.v7-cundo');
      const sq=q('.v7-fcol .v7-fsq'); if (sq) { sq.click(); await w(120); } a.u1=!!q('.v7-cundo');
      return a;`);
    check("community-engaged: the problem part asks who asked for the work; the community role help and sample (r16-b-11, C7)", /If a partner or community asked for this work, say so/.test(r.stakesHelp) && /^Name your own part and the partners’ leadership\./.test(r.roleHelp) && /^For example: “/.test(r.roleHelp.replace(/^Name your own part and the partners’ leadership\./, "")), { stakesHelp: r.stakesHelp, roleHelp: r.roleHelp });
    check("Undo survives a field-column click (Z-2)", r.u0 && r.u1, { u0: r.u0, u1: r.u1 });
    check("V8.14: a lower-case numbered run in the statement is not listed while the list check is held back (r16-a-2)", !/Lists to rewrite/i.test(r.lists), r.lists.slice(0, 300));
    check("Word: the evidence note is its own block; the headline is a block (r16-a-1, Z-5)", /<div class='evn'>Shows the made-up result\.<\/div>/.test(r.doc) && /<p class='ctitle'/.test(r.doc), r.doc.slice(r.doc.indexOf("evbox"), r.doc.indexOf("evbox") + 200));
    check("trainee: a typed article is dropped, and a unit after a bracketed organization takes a comma (r16-b-2, r16-a-5)", /A community interviewer I mentored/.test(r.mentor) && /\(MUI\), team lead/.test(r.mentor), r.mentor);
    // r16-b-1: tiles at 320 px with large text.
    await send("Page.setFontSizes", { fontSizes: { standard: 24, fixed: 20 } });
    await send("Emulation.setDeviceMetricsOverride", { width: 320, height: 568, deviceScaleFactor: 1, mobile: true });
    await seed(Object.assign(base(), { stageKey: "mentor" }));
    const tw = await js(H + `await w(300); return document.documentElement.scrollWidth;`);
    await send("Page.setFontSizes", { fontSizes: { standard: 16, fixed: 13 } });
    await send("Emulation.setDeviceMetricsOverride", { width: 375, height: 812, deviceScaleFactor: 1, mobile: true });
    check("Mentorship tiles at 320 px with 24 px text: no sideways scroll (r16-b-1)", tw <= 320, tw);
  }

  console.log("Audit loop, round 17");
  {
    // AA-1, Y-1: a trailing // comment must never hide code on the same line.
    const src = fs.readFileSync(path.join(ROOT, "narrative-cv-prototype-v9.html"), "utf8").split("\n");
    const hidden = [];
    const pats = [/,\s+[a-zA-Z_]\w*:\s+[a-zA-Z_][\w.]*\s*[,}]/, /;\s+[a-zA-Z_][\w.]*\s*=\s*[^=>\s]/, /\b[a-zA-Z_][\w.]*\([^)]*\)\s*;/, /\b(?:else|catch|finally)\b\s*(?:\{|if\b)/, /\}\s*(?:else|catch|finally)\b/]; // AC-4
    src.forEach((l, n) => { const i = l.indexOf("// "); if (i < 1 || !l.slice(0, i).trim() || l[i - 1] === ":") return; const t = l.slice(i + 3); if (pats.some(p => p.test(t))) hidden.push((n + 1) + ": " + t.slice(0, 80)); });
    check("no code is hidden behind a trailing comment (AA-1, Y-1)", hidden.length === 0, hidden);
    const base = () => Object.assign({}, JSON.parse(JSON.stringify(fixture)), { profileConfirmed: true, mode: "compose", stageKey: "contrib", ui: { profileNote: false } });
    const st = base(); st.lens = Object.assign({}, st.lens, { agency: "other", format: "", program: "", undecided: true });
    st.contributions = [{ cid: "r171", title: "", stakes: "", roleMode: "", roleLine: "", activities: "", outputs: "", outcomes: "", impact: "", translational: "", evidence: [], flags: {}, notes: {} },
      { cid: "r172", title: "A made-up study", stakes: "A made-up gap.", roleMode: "led", roleLine: "I led it.", activities: "I ran 3 made-up sites.", outputs: "A report.", outcomes: "", impact: "", translational: "", evidence: [], flags: {}, notes: {} }];
    await seed(st);
    r = await js(H + `await w(200); const a={}; const hb=q('[data-f$="-title"] .v7-box, [data-f$="-title"] input'); a.rows=hb ? (hb.rows||1) : -1; a.ph=hb ? hb.placeholder : '';
      rail('Export').click(); await w(200); a.dl=qa('.v7-card dt').map(x=>x.innerText).join('|'); a.word=(qa('.v7-fmt label, .v7-fmt').map(x=>x.innerText).join(' ')||'');
      return a;`);
    check("the headline is one line with no placeholder (AA-1, C5)", (r.rows === 1 || r.rows === -1 ? r.rows === 1 : false) && r.ph === "", r);
    check("with no agency, Export shows both formats' link and language rules and says which section names it uses (r17-a-1, r17-a-2)", /Links, Tri-agency CV/.test(r.dl) && /Links, CV-FRQ/.test(r.dl) && /until you choose an agency/.test(r.word + r.dl), { dl: r.dl, word: r.word.slice(0, 300) });
  }

  console.log("Audit loop, round 18");
  {
    const base = () => Object.assign({}, JSON.parse(JSON.stringify(fixture)), { profileConfirmed: true, mode: "compose", stageKey: "contrib", ui: { profileNote: false } });
    const st = base(); st.mentorCounts = Object.assign({}, st.mentorCounts || {}, { other: "5" }); st.mentorOtherLabel = "Cree youth";
    st.contributions = [{ cid: "r181", title: "A made-up study", stakes: "A made-up gap.", roleMode: "led", roleLine: "I led it.", activities: "Students enter Grade 9 in Ontario.", outputs: "A report.", outcomes: "", impact: "", translational: "", evidence: [{ text: "A made-up article", type: "Peer-reviewed", note: "" }], flags: {}, notes: {} }];
    await seed(st);
    r = await js(H + `await w(200); const a={}; const box=q('[data-f$="-activities"] .v7-box'); box.focus(); setv(box, box.value); await w(80);
      a.grade=qa('[data-f$="-activities"] .v4-flag, [data-f$="-activities"] .v4-meta').map(x=>x.textContent).join('|');
      const rl=q('[data-f$="-roleLine"] .v7-box'); rl.focus(); setv(rl,'I led the design with three analysts, who set what could be shown.'); await w(80); a.role=qa('[data-f$="-roleLine"] .v4-flag').map(x=>x.textContent).join('|');
      q('#ev-open-r181').click(); await w(200); a.noteCount=((q('[id$="-0-wc"]')||{}).textContent||'');
      rail('Export').click(); await w(150);
      let clip=''; const ow=navigator.clipboard.writeText; navigator.clipboard.writeText=async(t)=>{clip=t;};
      const cb=qa('.btn').find(b=>/^Copy Supervisory/.test(b.innerText)); if(cb){ cb.click(); await w(40); } a.mentor=clip; navigator.clipboard.writeText=ow;
      return a;`);
    check("an empty note shows no count (the /$^/ bug, r18-a-1)", !/1 word/.test(r.noteCount), r.noteCount);
    check("'Grade 9' is not a figure; no hedge check on the role line (r18-a-3, r18-a-4)", /No numbers yet/.test(r.grade) && !/hedge/.test(r.role), { grade: r.grade, role: r.role });
    check("a community group name keeps its capital (AB-1)", /5 Cree youth/.test(r.mentor), r.mentor.slice(0, 200));
  }

  console.log("Audit loop, round 19");
  {
    const base = () => Object.assign({}, JSON.parse(JSON.stringify(fixture)), { profileConfirmed: true, mode: "compose", stageKey: "contrib", ui: { profileNote: false } });
    const st = base(); st.lens = Object.assign({}, st.lens, { discipline: "creative", discipline2: "humanities", workMode: ["solo"] });
    st.mentorCounts = Object.assign({}, st.mentorCounts || {}, { other: "3" }); st.mentorOtherLabel = "Postdoctoral fellows";
    st.ps = Object.assign({}, st.ps, { role: "independent media artist", institution: "", field: "documentary" });
    st.contributions = [{ cid: "r191", title: "A made-up film", stakes: "A made-up question?", roleMode: "led", roleLine: "", activities: "I shot 40 made-up hours.", outputs: "A film.", outcomes: "", impact: "", translational: "", evidence: [], flags: {}, notes: {} }];
    await seed(st);
    r = await js(H + `await w(200); const a={}; a.roleHelp=((q('[id$="-roleLine-hp"]')||{}).textContent||'');
      const rl=q('[data-f$="-roleLine"] .v7-box'); rl.focus(); setv(rl,'I directed and edited the film; a sound designer worked on one part.'); await w(80); a.role=qa('[data-f$="-roleLine"] .v4-flag').map(x=>x.textContent).join('|'); setv(rl,'I worked on the made-up analysis.'); await w(80); a.roleOwn=qa('[data-f$="-roleLine"] .v4-flag').map(x=>x.textContent).join('|');
      rail('Export').click(); await w(150);
      let clip=''; const ow=navigator.clipboard.writeText; navigator.clipboard.writeText=async(t)=>{clip=t;};
      const cb=qa('button').find(b=>/^Copy draft with notes/.test(b.innerText)); if(cb){ cb.click(); await w(40); } a.txt=clip; navigator.clipboard.writeText=ow;
      return a;`);
    check("creative role help; a vague verb about someone else's part is not flagged (r19-a-1, r19-a-7)", /^Name your own part, and the team if there was one\./.test(r.roleHelp) && !/worked on/.test(r.role) && /worked on/.test(r.roleOwn), { roleHelp: r.roleHelp.slice(-120), role: r.role, roleOwn: r.roleOwn }); // AD-4: the positive case too
    check("an independent practice leaves the institution out of the first sentence; a common group noun is lowered (r19-a-6, AC-2)", /I am an independent media artist\. My work is in documentary\./.test(r.txt) && /3 postdoctoral fellows/.test(r.txt), r.txt.slice(0, 500));
  }

  console.log("Audit loop, round 20");
  {
    const st = Object.assign({}, JSON.parse(JSON.stringify(fixture)), { profileConfirmed: true, mode: "compose", stageKey: "mentor", ui: { profileNote: false } });
    st.mentorCounts = Object.assign({}, st.mentorCounts || {}, { other: "3" }); st.mentorOtherLabel = "Technicians";
    st.mentees = [{ stageKind: "other", stage: "PhD candidate", stageOther: "PhD candidate", kind: "university", org: "A made-up university", unit: "", recognition: "", why: "", folded: false }];
    st.lens = Object.assign({}, st.lens, { workMode: ["team"] });
    await seed(st);
    r = await js(H + `await w(200); rail('Export').click(); await w(150);
      let clip=''; const ow=navigator.clipboard.writeText; navigator.clipboard.writeText=async(t)=>{clip=t;};
      const cb=qa('.btn').find(b=>/^Copy Supervisory/.test(b.innerText)); if(cb){ cb.click(); await w(40); } navigator.clipboard.writeText=ow; return clip;`);
    check("a common one-word group is lowered; 'PhD candidate' keeps its capitals (AD-1, AD-3)", /3 technicians/.test(r) && /A PhD candidate I trained/.test(r), r.slice(0, 300));
    st.mentorOtherLabel = "Algonquin youth"; await seed(st);
    r = await js(H + `await w(200); rail('Export').click(); await w(150);
      let clip=''; const ow=navigator.clipboard.writeText; navigator.clipboard.writeText=async(t)=>{clip=t;};
      const cb=qa('.btn').find(b=>/^Copy Supervisory/.test(b.innerText)); if(cb){ cb.click(); await w(40); } navigator.clipboard.writeText=ow; return clip;`);
    check("a people's name in a group stays as typed (AD-2)", /3 Algonquin youth/.test(r), r.slice(0, 200));
  }

  console.log("Register (W-57): the tool's prompt strings");
  {
    const src = fs.readFileSync(path.join(ROOT, "narrative-cv-prototype-v9.html"), "utf8");
    const a = src.indexOf("    const PROMPTS = {"), b = src.indexOf("\n    };", a);
    const body = src.slice(a, b).split("\n").filter(l => !/^\s*\/\//.test(l)).join("\n");
    const strs = [...body.matchAll(/"((?:[^"\\]|\\.)*)"/g)].map(m => m[1]).filter(x => x.split(" ").length > 3);
    const HARD = { "rather than / instead of": /\b(rather than|instead of)\b/i, "em dash": /—/, "actually / really / simply": /\b(actually|really|genuinely|quietly|simply)\b/i,
      "arriv-": /\barriv\w*/i, "this is": /\bthis is\b/i, "nobody / never / nothing": /\b(nobody|no one|never|nowhere|nothing)\b/i, "not only / , not": /\bnot only\b|,\s*not\b/i };
    const hits = []; strs.forEach(x => { for (const [k, re] of Object.entries(HARD)) if (re.test(x)) hits.push(k + ": " + x.slice(0, 80)); });
    check("the prompt strings keep the house register: no dashes, contrast framing, emphatics or dramatized negatives (" + strs.length + " strings)", strs.length > 40 && hits.length === 0, hits);
  }

  console.log("Prem's answers Q12 to Q15 (2026-10-31)");
  {
    const one = JSON.parse(JSON.stringify(fixture.contributions.slice(0, 1)));
    one[0].evidence = [{ text: "A made-up show", type: "Exhibition / performance" }];
    await seed(Object.assign({}, fixture, { profileConfirmed: true, stageKey: "contrib", mode: "compose", contributions: one }));
    r = await js(H + `await w(300); const a={pills:qa('.v7-tailored-pills span, .v7-tailored-pills').map(x=>x.innerText).join(' | '), evType:JSON.parse(localStorage.getItem('ncv-v9')||'{}').contributions?.[0]?.evidence?.[0]?.type};
      const rm=q('[aria-label="Remove contribution 1"]'); a.rm=!!rm; a.rmName=rm?.getAttribute('aria-label'); rm.click(); await w(150);
      const warn=q('.v7-warn'); a.warnFocus=!!warn&&warn.contains(document.activeElement); a.warnRole=warn?.getAttribute('role'); a.warnName=warn&&document.getElementById(warn.getAttribute('aria-labelledby'))?.innerText;
      [...warn.querySelectorAll('button')].find(b=>b.innerText==='Remove').click(); await w(300);
      a.n=qa('.v7-card [aria-label^="Remove contribution"]').length; a.title=JSON.parse(JSON.stringify(window.ns||{})).contributions?.[0]?.title;
      a.cards=qa('.v7-card').filter(c=>/Contribution 1/.test(c.innerText)).length; a.focus=document.activeElement.tagName; a.live=q('#v7-live').textContent;
      q('[aria-label="Remove contribution 1"]').click(); await w(150); a.blankMsg=q('#v7-live').textContent; a.noWarn=!q('.v7-warn');
      return a;`);
    check("Q14: the only contribution has a Remove button; it asks inline (focus inside, named by its question), then leaves a blank Contribution 1 and says so", r.rm && r.warnFocus && r.warnRole === "group" && /Remove contribution 1/.test(r.warnName || "") && r.cards >= 1 && r.focus !== "BODY" && /removed\. A blank Contribution 1 is ready\./.test(r.live) && /already empty/.test(r.blankMsg) && r.noWarn, r);
    check("Q13: an evidence item saved as \"Exhibition / performance\" loads as \"Exhibition, performance or screening\"", r.evType === "Exhibition, performance or screening", r);
    check("Q15: the Profile bar spells out the format (Tri-agency CV, no TCV)", /Tri-agency CV/.test(r.pills) && !/\bTCV\b/.test(r.pills), r.pills);
    await seed(Object.assign({}, fixture, { profileConfirmed: true, stageKey: "contrib", mode: "compose", lens: Object.assign({}, fixture.lens, { agency: "other" }) }));
    r = await js(H + `await w(300); const a={pills:q('.v7-tailored')?.innerText};
      const ch=qa('.v7-tailored button').find(b=>/Change/.test(b.innerText)); ch.click(); await w(200);
      const lab=qa('.v7-tailored label, .v7-tailored .v7-pill, .v7-tailored button').map(x=>x.innerText.trim()); a.mode=lab.find(t=>/^Industry$/.test(t)); a.old=lab.some(t=>/Partnered with industry|Industry-partnered/.test(t));
      const sel=qa('.v7-tailored select').find(s=>[...s.options].some(o=>o.value==='other')); a.opt=sel?[...sel.options].find(o=>o.value==='other').text:null;
      const box=a.mode&&qa('.v7-tailored label, .v7-tailored .v7-pill, .v7-tailored button').find(x=>/^Industry$/.test(x.innerText.trim())); a.sw=document.documentElement.scrollWidth<=innerWidth;
      return a;`);
    check("Q15: an unchosen agency reads \"Agency not chosen yet\" in the Profile bar", /Agency not chosen yet/.test(r.pills || ""), r);
    check("P9: the work-mode choice reads \"Industry\" (Q12's long label is gone)", !!r.mode && !r.old, r);
  }

  console.log("V8 testing: the sign-up switch follows the Pages address");
  {
    const src = fs.readFileSync(path.join(ROOT, "narrative-cv-prototype-v9.html"), "utf8");
    const m = src.match(/const TESTER_ON = (\/[^\n]*?\/)\.test\(location\.hostname\)/);
    const re = m && eval(m[1]);
    check("the sign-up is on at research-8kh.pages.dev and its deploy previews, and off on GitHub Pages and the old workers.dev address",
      !!re && re.test("research-8kh.pages.dev") && re.test("1951b557.research-8kh.pages.dev") && !re.test("concordia-pathways.github.io") && !re.test("ncv-tool.immigrant-empire.workers.dev"), m && m[1]);
  }

  console.log("V8 testing: tester sign-up and the five questions on Export");
  {
    const TP = () => PAGE() + "?tester=1";
    const tseed = async (state, tester) => {
      await go(HOME());
      await js("localStorage.clear();" + (state ? "localStorage.setItem('ncv-v9'," + JSON.stringify(JSON.stringify(state)) + ");" : "") + (tester ? "localStorage.setItem('ncv-v8-tester'," + JSON.stringify(JSON.stringify(tester)) + ");" : ""));
      await go(TP());
    };
    // Off without the flag: the plain address shows the two path cards and no sign-up.
    await seed(null);
    r = await js(H + "return {card:!!q('.v8-tester'), paths:qa('.v7-path').length};");
    check("tester sign-up is off on the plain address (no card, two path cards)", !r.card && r.paths === 2, r);

    apiPosts.length = 0; apiMode = "ok";
    await tseed(null);
    r = await js(H + `await w(200); const card=q('.v8-tester'); const a={card:!!card, paths:qa('.v7-path').length, h:card&&card.querySelector('h2')?.innerText,
      labelled:card&&document.getElementById(card.getAttribute('aria-labelledby'))?.tagName,
      emailLab:q('label[for="v8-ts-email"]')?.innerText, emailType:q('#v8-ts-email')?.type, auto:q('#v8-ts-email')?.autocomplete,
      sets:qa('.v8-tester fieldset').map(f=>({legend:f.querySelector('legend')?.innerText, radios:f.querySelectorAll('input[type=radio]').length, wrapped:[...f.querySelectorAll('input[type=radio]')].every(i=>i.closest('label'))})),
      tas:qa('.v8-tester textarea').length, privacy:q('.v8-tester-privacy')?.innerText,
      promise:q('.v8-tester-promise strong')?.innerText, review:card&&card.innerText,
      opts:qa('.v8-tq-opt').map(o=>o.getBoundingClientRect().height)};
      a.minH=Math.min(...a.opts); return a;`);
    check("with ?tester=1 a fresh visit shows the sign-up card in place of the path cards", r.card && r.paths === 0 && r.h === "Help us test this tool", r);
    check("a11y: the card is named by its heading; email has a label, type email and autocomplete", r.labelled === "H2" && r.emailLab === "Your email" && r.emailType === "email" && r.auto === "email", r);
    check("a11y: each choice question is a fieldset with a legend, every radio inside its label, targets at least 44 px", r.sets.length === 3 && r.sets.every(f => f.legend && f.radios >= 4 && f.wrapped) && r.minH >= 44 && r.tas === 0
      && r.sets.map(f => f.legend).join("|") === "What are you starting from?|When is your application due?|What concerns you most about writing a narrative CV?", r);
    check("the card says the information is deleted at launch and how to reach the team", /^We collect your email, your answers to the tester questions, any feedback you send, your profile choices and the tool version\. All of it will be deleted when the tool launches at the end of the year\. For questions or concerns, please write to impact@concordia\.ca\.$/.test(r.privacy), r.privacy);
    check("the card states in bold that nothing written in the CV is collected, and invites the tester to send the draft to help improve the tool",
      /^We do not collect any data from your CV\. Your draft stays in this browser\.$/.test(r.promise || "") && /To help us improve the tool, you can email your draft to impact@concordia\.ca \(optional\)\./.test(r.review || ""), { promise: r.promise });

    r = await js(H + `const ps=qa('.v8-tester p.v7-body').map(p=>p.innerText); const pr=q('.v8-tester-promise'); const cs=getComputedStyle(pr);
      return {sum:!!q('.v8-tester-summary'), ps, bl:cs.borderLeftWidth, br:cs.borderRightWidth, bt:cs.borderTopWidth};`);
    check("T1-T3: the line above the card is gone; the card's two lines read as decided", !r.sum && r.ps[0] === "We built this tool to support you as you write your narrative CV, and it is now ready for testing. Your feedback will help us improve it." && r.ps[1] === "Please provide your email. We would like to hear about your experience using the tool.", r);
    check("T4: the promise box has a thin border all round, no thick left bar", r.bl === "1px" && r.br === "1px" && r.bt === "1px", r);
    r = await js(H + `setv(q('#v8-ts-email'),'not-an-email'); qa('.v8-tester .btn-primary')[0].click(); await w(150); const e=q('#v8-ts-email'); return {err:q('#v8-ts-email-err').innerText, inv:e.getAttribute('aria-invalid'), desc:e.getAttribute('aria-describedby')}; `);
    check("T6: an incomplete email says Please check your email address., tied to the field", r.err === "Please check your email address." && r.inv === "true" && r.desc === "v8-ts-email-err", r);
    r = await js(H + `setv(q('#v8-ts-email'),''); return 1;`);
    r = await js(H + `const b=qa('.v8-tester .btn-primary')[0]; b.click(); await w(200);
      const e=q('#v8-ts-email'); return {err:q('#v8-ts-email-err').innerText, inv:e.getAttribute('aria-invalid'), desc:e.getAttribute('aria-describedby'), focus:document.activeElement===e,
        col:getComputedStyle(q('#v8-ts-email-err')).color};`);
    check("a11y: an empty email is refused with a described error, aria-invalid and focus on the field; nothing is sent", r.err === "To start, please enter your email." && r.inv === "true" && r.desc === "v8-ts-email-err" && r.focus && apiPosts.length === 0, Object.assign(r, { posts: apiPosts.length }));

    r = await js(H + `const e=q('#v8-ts-email'); setv(e,'tester@example.org');
      qa('.v8-tester fieldset')[0].querySelectorAll('input')[1].click(); qa('.v8-tester fieldset')[1].querySelectorAll('input')[2].click();
      qa('.v8-tester fieldset')[2].querySelectorAll('input')[1].click();
      qa('.v8-tester .btn-primary')[0].click(); await w(500);
      const t=JSON.parse(localStorage.getItem('ncv-v8-tester')||'{}');
      return {card:!!q('.v8-tester'), paths:qa('.v7-path').length, note:q('.v8-tester-note')?.innerText, role:q('.v8-tester-note')?.getAttribute('role'),
        focus:document.activeElement.className, t, intro:!document.getElementById('v7-start-intro').hidden, priv:!q('.v4-privacy').hidden, sum:!!q('.v8-tester-summary')};`);
    const st = apiPosts[0] || {};
    check("Start sends one start row with the email and the three answers, and no draft text", apiPosts.length === 1 && st.action === "start" && st.email === "tester@example.org" && st.answers.source === "An earlier narrative CV" && st.answers.due === "Later than three months" && st.answers.concern === "Showing impact" && /^[0-9a-f-]{8,}$/.test(st.id) && !("contributions" in st) && !("ps" in st), st);
    check("after sign-up the full intro and the privacy line show on the start page", r.intro && r.priv && !r.sum, r);
    check("a11y: after sign-up the path cards return, a status note thanks the tester, focus moves to Start your draft", !r.card && r.paths === 2 && r.note === "Thank you for signing up." && r.role === "status" && /v7-path-new/.test(r.focus) && r.t.startSent === true, r);

    r = await js(H + `qa('.v7-path-new')[0].click(); await w(400); return location.hash;`);
    const stepPost = apiPosts.find(p => p.action === "step");
    check("opening a step sends the step for the same tester", !!stepPost && stepPost.step === "setup" && stepPost.id === st.id, apiPosts.map(p => p.action + ":" + (p.step || "")));

    // Reset draft leaves the sign-up alone; a reload asks nothing again.
    await go(TP());
    r = await js(H + `await w(200); return {card:!!q('.v8-tester'), id:JSON.parse(localStorage.getItem('ncv-v8-tester')).id};`);
    check("a reload does not ask again; the tester id is kept", !r.card && r.id === st.id, r);

    // Export: the three questions, sent against the same id.
    const tstate = { id: "1234abcd-0000-4000-8000-000000000001", email: "tester@example.org", start: { concern: "The funder's rules" }, startSent: true, lastStep: "review" };
    apiPosts.length = 0;
    await tseed(Object.assign({}, JSON.parse(JSON.stringify(fixture)), { profileConfirmed: true, mode: "compose", stageKey: "export", ui: { profileNote: false } }), tstate);
    r = await js(H + `await w(300); const card=q('.v8-tester-end'); const sets=card?[...card.querySelectorAll('fieldset')]:[];
      const tg=q('#v8-te-open'); const a={card:!!card, h:card&&card.querySelector('h3')?.innerText, tg:tg&&tg.innerText.trim(), exp0:tg&&tg.getAttribute('aria-expanded'), body0:q('#v8-te-body').hidden,
        last:card&&card.previousElementSibling?.classList.contains('v7-nudge'), stepBox:!!q('.v8-fb')};
      tg.click(); await w(100); a.exp1=tg.getAttribute('aria-expanded'); a.body1=q('#v8-te-body').hidden; a.focus1=document.activeElement.closest('fieldset')===sets[0];
      Object.assign(a, { legends:sets.map(f=>f.querySelector('legend')?.innerText),
      scale:card?card.querySelectorAll('.is-scale input[type=radio]').length:0, tas:card?[...card.querySelectorAll('textarea')].map(t=>q('label[for="'+t.id+'"]')?.innerText):[],
      boxes:sets[3]?[...sets[3].querySelectorAll('input')].map(i=>i.type+(i.closest('label')?':wrapped':'')):[]});
      card.querySelectorAll('.is-scale input')[3].click(); sets[1].querySelectorAll('input')[1].click(); setv(q('#v8-te-fitWhich'),'The made-up role line.');
      sets[2].querySelectorAll('input')[1].click();
      const bx=[...sets[3].querySelectorAll('input')];
      bx[0].click(); bx[1].click(); bx[4].click(); a.afterNone=bx.map(b=>b.checked);
      bx[0].click(); bx[3].click(); a.afterPick=bx.map(b=>b.checked);
      setv(q('#v8-te-reuseOther'),'The made-up totals.'); setv(q('#v8-te-change'),'A made-up change.');
      q('#v8-te-send').click(); await w(500);
      a.after=q('.v8-tester-end')?.innerText; a.focus=document.activeElement.id; a.live=q('#v7-live').textContent; a.t=JSON.parse(localStorage.getItem('ncv-v8-tester')); return a;`);
    const fin = apiPosts.find(p => p.action === "finish") || {};
    check("V8.9: Export ends with the feedback card after the email note, and has no per-step feedback box", r.card && r.last && !r.stepBox && r.h === "Help us improve the tool", r);
    check("a11y: Complete your feedback is a collapsed disclosure; opening it shows the questions and moves focus to the first", /Complete your feedback$/.test(r.tg || "") && r.exp0 === "false" && r.body0 && r.exp1 === "true" && !r.body1 && r.focus1, r);
    check("the questions for a signed-up tester: the scale quotes the concern from the start, then fit, next and reuse, with three labelled boxes",
      r.card && r.legends.length === 4 && /main concern was: the funder's rules\. How much did the tool help/.test(r.legends[0]) && r.scale === 5
      && /fit your kind of work/.test(r.legends[1]) && /do with this draft next/.test(r.legends[2]) && /reuse for your next application\? Choose any/.test(r.legends[3])
      && r.tas.join("|") === "Which ones?|Anything else you would keep?|What one change would help most?", r);
    check("a11y: the reuse question is five checkboxes in its fieldset, each inside its label", r.boxes.length === 5 && r.boxes.every(b => b === "checkbox:wrapped"), r.boxes);
    check("choosing None clears the other reuse answers, and choosing a part clears None", r.afterNone.join() === "false,false,false,false,true" && r.afterPick.join() === "true,false,false,true,false", { none: r.afterNone, pick: r.afterPick });
    check("opening Export sends nothing before Send my answers", apiPosts.filter(p => p.action === "finish").length === 1, apiPosts.map(p => p.action));
    check("Send my answers sends a finish row for the same id with every answer, the reuse answer as a list", fin.id === tstate.id && fin.answers.concernHelp === "4" && fin.answers.fit === "Mostly, with some wording from another field" && /role line/.test(fin.answers.fitWhich)
      && fin.answers.next === "Move it into Word or another document" && JSON.stringify(fin.answers.reuse) === JSON.stringify(["The contributions", "The personal statement"])
      && /made-up totals/.test(fin.answers.reuseOther) && /made-up change/.test(fin.answers.change), fin);
    check("a11y: after sending, the card thanks the tester, the live region says so, focus is on the card heading", /reached the Pathways to Impact team/.test(r.after || "") && r.focus === "v8-te-t" && /reached the team/.test(r.live) && r.t.endSent === true, r);

    // A failed send keeps the answers and says what to do; nothing is lost.
    apiMode = "fail";
    await tseed(Object.assign({}, JSON.parse(JSON.stringify(fixture)), { profileConfirmed: true, mode: "compose", stageKey: "export", ui: { profileNote: false } }), Object.assign({}, tstate, { end: { change: "Kept text." } }));
    r = await js(H + `await w(300); q('#v8-te-open').click(); await w(80); q('#v8-te-send').click(); await w(500);
      return {status:q('.v8-tester-end .v7-quiet[aria-live]')?.innerText, kept:q('#v8-te-change')?.value, dis:q('#v8-te-send').disabled, t:JSON.parse(localStorage.getItem('ncv-v8-tester'))};`);
    check("V8.10: a failed send keeps the answers, re-enables Send and says, as at sign-up, that they go again next time", r.status === "Thank you. Your answers did not reach the team yet; the tool sends them again the next time you open it." && r.kept === "Kept text." && !r.dis && !r.t.endSent && r.t.endPending === true, r);
    apiMode = "ok";
    // ...and they do go on the next visit.
    apiPosts.length = 0;
    await tseed(Object.assign({}, JSON.parse(JSON.stringify(fixture)), { profileConfirmed: true, mode: "compose", stageKey: "export", ui: { profileNote: false } }), Object.assign({}, r.t, { startSent: true }));
    await sleep(500);
    check("V8.10: answers that did not send go again on the next visit", apiPosts.some(p => p.action === "finish" && p.answers && p.answers.change === "Kept text."), apiPosts.map(p => p.action));

    // A tester who chose no concern (or Something else) sees the general wording.
    await tseed(Object.assign({}, JSON.parse(JSON.stringify(fixture)), { profileConfirmed: true, mode: "compose", stageKey: "export", ui: { profileNote: false } }), Object.assign({}, tstate, { start: { concern: "Something else" } }));
    r = await js(H + `await w(300); return q('.v8-tester-end legend')?.innerText;`);
    check("with no concern to quote, the first Export question asks about the main concern in general", /^How much did the tool help with your main concern/.test(r || ""), r);

    // No skipping (Prem, 2026-11-03): the card has one button, and an earlier skip still asks for sign-up.
    apiPosts.length = 0;
    await tseed(null);
    r = await js(H + `await w(200); return {btns:qa('.v8-tester button').map(b=>b.innerText), paths:qa('.v7-path').length};`);
    check("the sign-up card has a single button, Start, and no way to skip", r.btns.join("|") === "Start" && r.paths === 0, r);
    // T10: a sign-up that does not reach the team shows no message; the tool sends it again on the next visit.
    apiMode = "fail"; apiPosts.length = 0;
    r = await js(H + `setv(q('#v8-ts-email'),'late@example.org'); qa('.v8-tester .btn-primary')[0].click(); await w(600); return {card:!!q('.v8-tester'), paths:qa('.v7-path').length, note:q('.v8-tester-note')?.innerText||'', t:JSON.parse(localStorage.getItem('ncv-v8-tester')||'{}')};`);
    apiMode = "ok";
    check("T10: a sign-up that did not send lets the tester in with no message, and keeps the email to send again", !r.card && r.paths === 2 && r.note === "" && r.t.email === "late@example.org" && r.t.startSent === false, r);
    apiPosts.length = 0;
    await tseed(null);
    r = await js(H + `const v=e=>e&&!e.hidden&&e.getBoundingClientRect().height>0; return {intro:v(document.getElementById('v7-start-intro')), priv:v(q('.v4-privacy')), sum:q('.v8-tester-summary')?.innerText};`);
    check("before sign-up the page shows the card alone (T1); the intro and the privacy line wait until after", !r.intro && !r.priv && r.sum === undefined, r);
    await tseed(null, { skipped: true });
    r = await js(H + `await w(200); return {card:!!q('.v8-tester'), paths:qa('.v7-path').length};`);
    check("a browser that skipped sign-up before sees the sign-up card again", r.card && r.paths === 0 && apiPosts.length === 0, r);
    await tseed(Object.assign({}, JSON.parse(JSON.stringify(fixture)), { profileConfirmed: true, mode: "compose", stageKey: "export", ui: { profileNote: false } }));
    r = await js(H + `await w(300); return {card:!!q('.v8-tester'), exp:!!q('.v8-tester-end'), rail:!!q('.v7-rail')};`);
    check("a saved draft on Export still opens on the sign-up card until the tester signs up", r.card && !r.exp, r);

    // A start that did not reach the server is sent on the next visit.
    await tseed(null, { id: "1234abcd-0000-4000-8000-000000000002", email: "late@example.org", start: { due: "Within a month" } });
    await sleep(500);
    check("a sign-up that did not send goes again on the next visit", apiPosts.some(p => p.action === "start" && p.email === "late@example.org"), apiPosts.map(p => p.action));

    // Phone width and large text: no sideways scroll on the card.
    await send("Emulation.setDeviceMetricsOverride", { width: 320, height: 800, deviceScaleFactor: 1, mobile: true });
    await tseed(null);
    r = await js(H + `document.documentElement.style.fontSize='24px'; await w(300); return {sw:document.documentElement.scrollWidth, card:!!q('.v8-tester')};`);
    check("a11y: the sign-up card at 320 px with 24 px text has no sideways scroll", r.card && r.sw <= 320, r);
    await send("Emulation.setDeviceMetricsOverride", { width: 1180, height: 900, deviceScaleFactor: 1, mobile: false });
  }

  console.log("Prem's answers of 2026-11-03 (Q-7, Q-10 to Q-15, Q-17, Q-20, Q-21, Q-24, Q-26)");
  {
    const at = (stageKey, patch) => { const st = Object.assign({}, JSON.parse(JSON.stringify(fixture)), { profileConfirmed: true, mode: "compose", stageKey, ui: { profileNote: false } }); if (patch) patch(st); return st; };
    const labels = `return qa('svg[role=img]').map(x=>x.getAttribute('aria-label'));`;

    // Q-20: six role levels for every researcher, saved by their value; the Your role chart names them.
    await seed(at("contrib"));
    r = await js(H + `const rl=q('[data-f$="-roleLine"] .v7-box'); rl.focus(); await w(300);
      const ms=qa('[data-f$="-roleLine"] .v7-mini'); const a={labels:ms.map(m=>m.innerText), roles:ms.map(m=>m.getAttribute('role')), group:q('[data-f$="-roleLine"] .v7-minis')?.getAttribute('role')};
      ms[3].click(); await w(150); a.saved=JSON.parse(localStorage.getItem('ncv-v9')).contributions[0].roleMode;
      a.checked=qa('[data-f$="-roleLine"] .v7-mini').map(m=>m.getAttribute('aria-checked')); return a;`);
    check("Q-20: the role question offers six levels, the three new ones included, as radios in a radio group",
      r.labels.join("|") === "I led it|I co-led it|I contributed a specific part|Partners led it, and I took part|I made it with others|I did it on my own" && r.roles.every(x => x === "radio") && r.group === "radiogroup", r);
    check("Q-20: choosing a new level saves its value and checks only that radio", r.saved === "partnerled" && r.checked.filter(x => x === "true").length === 1 && r.checked[3] === "true", r);
    await seed(at("review", st => { st.contributions[0].roleMode = "cocreated"; st.contributions[1].roleMode = "led"; st.contributions[1].roleLine = st.contributions[1].roleLine || "Made-up role line."; }));
    r = await js(H + `await w(150); q('#v8-tab-role').click(); await w(60); return {fact:q('#v8-fact').innerText, sel:qa('[role=tabpanel] select').map(s=>s.value)};`);
    check("Q-20: the Role tab counts a new level beside an old one, and an older draft's level still loads", /You led 1.*made 1 with others/.test(r.fact) && r.sel.includes("cocreated") && r.sel.includes("led"), r);

    // Q-21: four more destinations, for every field; the sentence and the chart use them.
    await seed(at("mentor", st => { st.lens.discipline = "stem"; }));
    r = await js(H + `return [...q('#v7-pw0').options].map(o=>o.text);`);
    check("Q-21: Where are they now? lists the four new destinations, before Other, in a STEM profile too",
      ["Independent or self-employed artist", "College, CEGEP or school", "School or school board", "Long-term care or seniors’ organization"].every(t => r.includes(t)) && r[r.length - 1] === "Other" && !r.some(t => /long-term care, public health/.test(t)), r);
    await seed(at("review", st => { st.mentees[1].kind = "artist"; st.mentees[1].org = ""; st.mentees[1].unit = ""; st.mentees[2].kind = "ltc"; st.mentees[2].org = ""; st.mentees[2].unit = ""; }));
    r = await js(H + `await w(150); const labels=qa('.v8-person').map(x=>x.innerText.replace(/\\s+/g,' ')); rail('Export').click(); await w(200); return {text:q('.v7-draft-body').innerText, labels};`);
    check("Q-21: a trainee in a new destination reads as a sentence in the draft, and the chart counts it",
      /now works as an independent artist/.test(r.text) && /now works in long-term care or a seniors’ organization/.test(r.text) && r.labels.some(l => /Independent or self-employed artist/.test(l || "")) && r.labels.some(l => /Long-term care or seniors’ organization/.test(l || "")), { labels: r.labels });

    // Q-24: three more evidence kinds; a preprint has its own; the Review chart counts them.
    await seed(at("contrib"));
    r = await js(H + `const o=q('[id^=ev-open-]'); if(o){o.click(); await w(200);} const ad=q('[id^=ev-add-]'); if(ad){ad.click(); await w(200);} return qa('.v7-ev-item:last-child .v7-kind, .v7-ev-item .v7-kind').filter((k,i,arr)=>k.closest('.v7-ev-item')===arr[arr.length-1].closest('.v7-ev-item')).map(k=>k.innerText.split(String.fromCharCode(10))[0]);`);
    check("Q-24: the evidence view offers Preprint, Conference talk or poster and Teaching or curriculum, before Other",
      ["Preprint", "Conference talk or poster", "Teaching or curriculum"].every(t => r.some(x => x.indexOf(t) === 0)) && /^Other/.test(r[r.length - 1]) && r.length === 15, r);
    await seed(at("review", st => { st.contributions[0].evidence = [{ id: "e1", type: "Preprint", text: "A made-up preprint, 2026.", note: "" }, { id: "e2", type: "Teaching or curriculum", text: "A made-up course, since 2024.", note: "" }]; }));
    r = await js(H + `await w(150); q('#v8-tab-evidence').click(); await w(60); return qa('[role=tabpanel] .v7-rqev-item b').map(b=>b.textContent);`);
    check("V8.12: the Evidence question on Review lists the new kinds", r.includes("Preprint") && r.includes("Teaching or curriculum"), r);

    // Eli, 2026-11-04: SSHRC allows a link to an audio or visual work, as evidence; other TCV agencies do not.
    const avSeed = (agency) => at("review", st => { st.lens = Object.assign({}, st.lens, { agency, format: agency === "frq" ? "cv-frq" : "tcv" });
      st.contributions[0].evidence = [{ id: "eav", type: "Audio or visual work", text: "A made-up recording, https://example.org/clip", note: "" }]; st.mentorCounts = { phd: "2", masters: "", undergrad: "", postdoc: "", other: "" }; });
    await seed(avSeed("sshrc"));
    r = await js(H + `await w(150); const links=qa('.v7-glance a').map(x=>x.innerText); rail('Export').click(); await w(200); return {links, body:(q('.v7-draft-body')||{}).innerText||''};`);
    check("Eli: with SSHRC, a link on an Audio or visual work evidence row is not listed to take out", !r.links.some(t => /^Contribution 1: Evidence$/.test(t)) && r.links.length > 0, r.links);
    check("Eli: the draft prints Totals: with no period", /Totals: /.test(r.body) && !/last five years/.test(r.body), r.body.slice(0, 400));
    await seed(at("review", st => { st.lens = Object.assign({}, st.lens, { agency: "sshrc", format: "tcv" });
      st.contributions[0].evidence = [{ id: "eex", type: "Exhibition, performance or screening", text: "A made-up show, https://example.org/venue", note: "" }]; }));
    r = await js(H + `await w(150); return qa('.v7-glance a').map(x=>x.innerText);`);
    check("Prem: with SSHRC, a link on any other kind (here an exhibition) is still listed to take out", r.some(t => /^Contribution 1: Evidence$/.test(t)), r);
    await seed(avSeed("cihr"));
    r = await js(H + `await w(150); return qa('.v7-glance a').map(x=>x.innerText);`);
    check("Eli: with CIHR, the same link is listed to take out", r.some(t => /^Contribution 1: Evidence$/.test(t)), r);

    // Q-13: the count covers the required parts, so a finished card reads "8 of 8", as text beside the squares.
    await seed(at("contrib", st => { const c = st.contributions[0]; ["title", "stakes", "roleLine", "activities", "outputs", "outcomes", "impact"].forEach(k => { c[k] = c[k] || "Made-up text for " + k + "."; }); c.translational = ""; c.evidence = [{ id: "e1", type: "Funding", text: "A made-up grant.", note: "" }]; }));
    r = await js(H + `const p=q('.v7-card .v7-prog'); return {txt:p.querySelector('.v7-prog-n')?.textContent, sr:p.querySelector('.v7-prog-n .v7-sr')?.textContent, sq:p.querySelector('.v7-dots')?.getAttribute('aria-hidden'), n:p.querySelectorAll('.v7-dots i').length, vis:getComputedStyle(p.querySelector('.v7-prog-n')).display};`);
    check("Q-13: a card with every required part and no One moment reads 8 of 8 beside eight squares; the squares are hidden from screen readers, the text says answered", r.txt === "8 of 8 answered" && r.sr === " answered" && r.sq === "true" && r.n === 8 && r.vis !== "none", r);
    r = await js(H + `const s=q('.v7-card .v7-prog-n .v7-sr'); return getComputedStyle(s).position;`);
    check("Q-13: the word answered is read out only (visually hidden)", r === "absolute", r);

    // Q-10: an optional Draft name on the Start card, with the date the draft last changed.
    await seed(at("start", st => { st.contentAt = Date.UTC(2026, 0, 15, 12); }));
    r = await js(H + `const i=q('#v7-draft-name'); const a={lab:q('label[for="v7-draft-name"]')?.innerText, desc:i&&document.getElementById(i.getAttribute('aria-describedby'))?.innerText, h:q('.v7-path-new h2').innerText};
      setv(i,'SSHRC Insight Grant, fall'); await w(100); a.saved=JSON.parse(localStorage.getItem('ncv-v9')); return a;`);
    check("Q-10: the Start card has a labelled, optional Draft name, described by the date the draft was last updated", r.lab === "Draft name (optional)" && r.desc === "Last updated 15 January 2026." && r.h === "Continue your draft", { lab: r.lab, desc: r.desc, h: r.h });
    check("Q-10: typing a name saves it and leaves the last-updated date alone", r.saved.draftName === "SSHRC Insight Grant, fall" && r.saved.contentAt === Date.UTC(2026, 0, 15, 12), { name: r.saved.draftName, at: r.saved.contentAt });
    await go(PAGE());
    r = await js(H + `await w(200); return q('.v7-path-new h2').innerText;`);
    check("Q-10: after a reload the card is headed with the name", r === "Continue SSHRC Insight Grant, fall", r);

    // Q-15, Q-26, S4: Save a backup file in every step's bottom row (Export has its own), with the draft name in the file name.
    const saves = {};
    for (const k of ["contrib", "mentor", "ps", "review", "export"]) {
      await seed(at(k, st => { st.draftName = "SSHRC Insight Grant, fall"; }));
      saves[k] = await js(H + `await w(150); const b=q('.narrative-nav .v7-nav-save'); if(!b) return null; URL.createObjectURL=()=>'blob:x'; HTMLAnchorElement.prototype.click=function(){}; b.click(); await w(100);
        return {label:b.innerText, note:q('.narrative-nav .v7-nav-saved').innerText, live:q('.narrative-nav .v7-nav-saved').getAttribute('aria-live'), rail:qa('.v7-rail-foot button, .narrative-progress-panel button').map(x=>x.innerText).filter(t=>/Save/.test(t))};`);
    }
    check("Q-15: every step but Export has Save a backup file in its bottom row; saving says so in a polite live note", ["contrib", "mentor", "ps", "review"].every(k => saves[k] && saves[k].label === "Save a backup file" && saves[k].live === "polite") && saves.export === null, saves);
    check("Q-10: the saved file is named with the draft name", /^Saved narrative-cv-draft-sshrc-insight-grant-fall-.*\.json to your downloads\.$/.test(saves.contrib.note), saves.contrib.note);
    check("Q-26: the rail's button reads Save a backup file too", saves.review.rail.length >= 1 && saves.review.rail.every(t => t === "Save a backup file"), saves.review.rail);

    // Q-11, Q-12: on Review, each order card shows its words and its share of the page budget, with Save for later and Delete.
    // R11 (V9): both contributions complete, so Export stays open when the first is saved for later.
    await seed(at("review", st => { const c2 = st.contributions[1]; Object.assign(c2, DONE(c2.cid), { title: c2.title }); }));
    r = await js(H + `const oc=qa('.v8-rows-mv .v8-row'); const t0=oc[0].querySelector('.v8-ct-t').innerText;
      const a={n:oc.length, ow:oc[0].querySelector('.v7-ow').innerText, btns:[...oc[0].querySelectorAll('.v7-oacts button')].map(b=>b.innerText+'|'+b.getAttribute('aria-label')), t0};
      oc[0].querySelector('.v7-oacts button').click(); await w(200);
      a.focus=document.activeElement.innerText; a.focusIn=!!document.activeElement.closest('.v7-later'); a.live=q('#v7-live').textContent;
      window.__t0=t0; a.later=qa('.v7-later .v7-ot').map(x=>x.innerText); a.order=qa('.v8-rows-mv .v8-row').length;
      a.st=JSON.parse(localStorage.getItem('ncv-v9')).contributions.map(c=>!!c.later); a.lh=q('.v7-later h4')?.innerText;
      const f0=document.activeElement.id; rail('Export').click(); await w(200); a.draft=q('.v7-draft-body').innerText.includes(t0); rail('Review').click(); await w(200); q('#v8-tab-order').click(); await w(60); const fb=document.getElementById(f0); if (fb) fb.focus(); return a;`);
    check("Q-12: an order card shows its words and its share of the 5 pages (R5)", r.n === 2 && /^[\d,]+ words? · (about \d+%|under 1%) of 5 pages · \d+ evidence items?$/.test(r.ow), r.ow);
    check("a11y: Save for later and Delete name the contribution they act on", r.btns.length === 2 && /^Save for later\|Save for later: /.test(r.btns[0]) && /^Delete\|Delete: /.test(r.btns[1]), r.btns);
    check("Q-11: Save for later keeps the contribution, takes it out of the order and the draft, and lists it under Saved for later",
      r.later.length === 1 && r.later[0] === r.t0 && r.order === 1 && !r.draft && r.st.join() === "true,false" && r.lh === "Saved for later", r);
    check("a11y: after Save for later, focus is on its Add back button and the live region says it is left out of the export", r.focus === "Add back" && r.focusIn && /saved for later\. It stays in your draft and is left out of the export\./.test(r.live), r);
    r = await js(H + `q('.v7-later .v7-oacts button').click(); await w(200); const st=JSON.parse(localStorage.getItem('ncv-v9')).contributions;
      return {t0:window.__t0, later:!!q('.v7-later'), order:qa('.v8-rows-mv .v8-row').map(x=>x.querySelector('.v8-ct-t').innerText), st:st.map(c=>!!c.later), live:q('#v7-live').textContent, focus:document.activeElement.innerText};`);
    check("Q-11, row 8: Add back returns it to the order, in last place", !r.later && r.order.length === 2 && r.order[1] === r.t0 && r.st.join() === "false,false" && /added back, last in the order/.test(r.live) && r.focus === "Save for later", r);
    r = await js(H + `const oc=qa('.v8-rows-mv .v8-row')[0]; const t=oc.querySelector('.v8-ct-t').innerText; oc.querySelector('.v7-odel').click(); await w(100);
      const wq=q('.v7-warn p')?.innerText, wf=document.activeElement.classList.contains('v7-warn'); q('.v7-warn .btn-primary').click(); await w(200);
      return {t, wq, wf, n:JSON.parse(localStorage.getItem('ncv-v9')).contributions.length, focus:document.activeElement.id, live:q('#v7-live').textContent};`);
    check("Q-11, EV-1b: Delete asks first, naming the words, then removes the contribution; focus goes to its Undo", /^Delete “.*” and its [\d,]+ words? from your draft\?$/.test(r.wq || "") && r.wf && r.n === 1 && r.focus === "x-undo" && /deleted\. Undo is available until your next change\.$/.test(r.live), r);
    await seed(at("contrib", st => { st.contributions[1].later = true; }));
    r = await js(H + `return {fold:qa('.v7-fold').map(f=>f.getAttribute('aria-label')+' / '+(f.querySelector('.v7-fold-meta')||{}).innerText)};`);
    check("Q-11: in Contributions a contribution saved for later says so on its row", r.fold.some(t => /saved for later/.test(t) && /Saved for later ·/.test(t)), r);
    await seed(at("review", st => { st.contributions[0].later = "yes"; }), "", { raw: true }); // the tool reads "yes" as not saved for later
    r = await js(H + `return {order:qa('.v8-rows-mv .v8-row').length, later:!!q('.v7-later')};`);
    check("Q-11: a later flag that is not true (a hand-edited file) is read as not saved for later", r.order === 2 && !r.later, r);

    // Q-14: profile pills wrap onto a second line on a narrow screen, with no fade.
    await send("Emulation.setDeviceMetricsOverride", { width: 360, height: 800, deviceScaleFactor: 1, mobile: true });
    await seed(at("contrib", st => { st.lens.workMode = ["community", "team"]; st.lens.discipline2 = "humanities"; }));
    r = await js(H + `await w(200); const p=q('.v7-tailored-pills'); const c=getComputedStyle(p); const tops=[...new Set([...p.querySelectorAll('.v7-pill')].map(x=>Math.round(x.getBoundingClientRect().top)))];
      return {wrap:c.flexWrap, mask:c.maskImage||c.webkitMaskImage, lines:tops.length, over:p.scrollWidth>p.clientWidth+1, sw:document.documentElement.scrollWidth};`);
    check("Q-14: at 360 px the profile pills wrap onto more lines, unclipped and with no fade", r.wrap === "wrap" && (!r.mask || r.mask === "none") && r.lines >= 2 && !r.over && r.sw <= 360, r);
    await send("Emulation.setDeviceMetricsOverride", { width: 1180, height: 900, deviceScaleFactor: 1, mobile: false });

    // Q-17: no heading level skips on any page of the tool.
    const HS = `const v=e=>e.getClientRects().length>0; return [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].filter(v).map(h=>+h.tagName[1]);`;
    const skips = {};
    await seed(null); skips.start = await js(HS);
    for (const k of ["setup", "contrib", "mentor", "ps", "review", "export"]) { await seed(at(k, st => { if (k === "setup") st.profileConfirmed = false; })); skips[k] = await js(HS); }
    const bad = Object.entries(skips).filter(([, hs]) => hs.some((l, i) => l > (i ? hs[i - 1] : 0) + 1)).map(([k]) => k);
    check("Q-17: from the start page to Export, no heading level is skipped; the path cards are h2 under the h1", !bad.length && skips.start.join() === "1,2,2", { bad, start: skips.start });

    // Q-7: the tool's own words use curly apostrophes.
    await seed(at("mentor"));
    r = await js(H + `return [...document.querySelectorAll('label, legend, option, button, h1, h2, h3, h4, .v4-help, .v7-help, .v7-quiet, .v7-field-label')].map(e=>e.innerText).filter(t=>/[A-Za-z]'[A-Za-z]/.test(t));`);
    check("Q-7: no straight apostrophe in the Mentorship step's labels, options, buttons and help", r.length === 0, r.slice(0, 5));
    r = await js(H + `return [...q('#v7-ps0').options].map(o=>o.text).filter(t=>/Master/.test(t));`);
    check("Q-7: Master’s is written with a curly apostrophe", r.length === 1 && r[0] === "Master’s", r);

    // Q-26: the check messages say part, not field.
    await seed(at("ps", st => { st.contributions = [Object.assign({}, st.contributions[0], { title: "", stakes: "", roleLine: "", roleMode: "", activities: "", outputs: "", outcomes: "", impact: "", evidence: [] })]; }), "", { raw: true });
    r = await js(H + `return (q('#v7-next-why')||{}).innerText;`);
    check("row 3: the locked Review note reads To Review and Export CV, please complete at least one contribution.", r === "To Review and Export CV, please complete at least one contribution.", r);

    // R11, R11a: one rule for complete. Each case is seeded on the statement step, where Next leads to Review.
    {
      const FULL = { title: "Open reach index", stakes: "Newsrooms record little about where their readers live.", roleLine: "I led the design of the index.", roleMode: "",
        activities: "We surveyed 40 newsrooms in three provinces.", outputs: "An open index and four public reports.", outcomes: "Two provincial funds adopted the index in 2024.",
        impact: "It could guide funding for local news across the country.", translational: "", evidence: [{ text: "Annual coverage report, 2024", type: "Report", note: "" }], later: false };
      const gate = async (label, patch, open) => {
        await seed(at("ps", st => { st.contributions = [Object.assign({}, st.contributions[0], FULL, patch)]; }), "", { raw: true });
        const locked = await js(H + `return !!q('#v7-next-why');`);
        check("R11 gate: " + label + (open ? " opens Review" : " keeps Review locked"), locked === !open, { locked });
      };
      await gate("a full contribution with evidence (A3)", {}, true);
      await gate("headline, a level and two parts (A1)", { roleLine: "", roleMode: "led", outcomes: "", impact: "", evidence: [] }, false);
      await gate("a level and no role sentence (A4)", { roleLine: "", roleMode: "led" }, false);
      await gate("no headline (A2)", { title: "" }, false);
      await gate("the only complete contribution saved for later (A5)", { later: true }, false);
      await gate("What resulted \"-\" and What could change \"…\"", { outputs: "-", impact: "…" }, false);
      await gate("every part TBD (A7)", { stakes: "TBD", roleLine: "TBD", activities: "TBD", outputs: "TBD", outcomes: "TBD", impact: "TBD", evidence: [{ text: "TBD", type: "", note: "" }] }, true);
      await gate("no evidence and No evidence yet not ticked", { evidence: [] }, false);
      await gate("no evidence with No evidence yet ticked (R11a)", { evidence: [], noEvidenceYet: true }, true);
      await gate("What already changed empty, not ticked", { outcomes: "" }, false);
      await gate("What already changed empty with No impact yet ticked (R11a)", { outcomes: "", noImpactYet: true }, true);
      await gate("No impact yet ticked and What could change empty", { outcomes: "", noImpactYet: true, impact: "" }, false);

      // R11a: the tick boxes on the card are real checkboxes with their labels, saved with the contribution.
      await seed(at("contrib", st => { st.contributions = [Object.assign({}, st.contributions[0], FULL, { outcomes: "", evidence: [], folded: false })]; }), "", { raw: true });
      r = await js(H + `const a={}; const ni=qa('.v9-tick').find(l=>/No impact yet/.test(l.innerText)), ne=qa('.v9-tick').find(l=>/No evidence yet/.test(l.innerText));
        a.both=!!ni&&!!ne; if(!a.both) return a; const cb=ni.querySelector('input'), cb2=ne.querySelector('input');
        a.types=[cb.type, cb2.type]; a.named=[cb.labels[0]===ni, cb2.labels[0]===ne]; a.before=q('.v7-prog-n, .v7-card .v7-prog')?.innerText||'';
        cb.click(); cb2.click(); await w(300);
        const st=JSON.parse(localStorage.getItem('ncv-v9')); const c=st.contributions[0]; a.saved=[c.noImpactYet, c.noEvidenceYet];
        const dot=qa('.v7-jobs i').find(i=>/^What already changed/.test(i.title)); a.dot=dot?[dot.className, dot.title]:null;
        a.locked=!!q('.v7-ri.is-locked, .v7-ri[aria-disabled=true]'); return a;`);
      check("R11a: No impact yet and No evidence yet are labelled checkboxes on the card", r.both && r.types.join() === "checkbox,checkbox" && r.named.every(Boolean), r);
      check("R11a: ticking both is saved with the contribution", r.saved && r.saved.join() === "true,true", r);
      await seed(at("contrib", st => { st.contributions = [Object.assign({}, st.contributions[0], FULL, { outcomes: "", noImpactYet: true, folded: true }), DONE("cdot")]; }), "", { raw: true });
      r = await js(H + `await w(150); const dot=qa('.v7-jobs i').find(i=>/^What already changed/.test(i.title)); return dot?[dot.className, dot.title]:null;`);
      check("R12: with No impact yet ticked, the part's dot is on and reads What already changed: No impact yet", r && r[0] === "on" && r[1] === "What already changed: No impact yet", r);

      // R12: adding an evidence item clears No evidence yet.
      await seed(at("contrib", st => { st.contributions = [Object.assign({}, st.contributions[0], FULL, { evidence: [{ text: "Annual coverage report, 2024", type: "Report", note: "" }], noEvidenceYet: true })]; }));
      r = await js(H + `await w(100); const st=JSON.parse(localStorage.getItem('ncv-v9')); return {flag:st.contributions[0].noEvidenceYet, tick:qa('.v9-tick').some(l=>/No evidence yet/.test(l.innerText))};`);
      check("R12: with an evidence item written, No evidence yet is cleared and its box is not shown", r.flag !== true && !r.tick, r);

      // R12: Review's Words line and the Add evidence cell.
      await seed(at("review", st => { st.contributions = [Object.assign({}, st.contributions[0], FULL), Object.assign({}, st.contributions[0], FULL, { cid: "k2nd", title: "Second", outcomes: "", noImpactYet: true, evidence: [], noEvidenceYet: true })]; st.ui = Object.assign({}, st.ui, { reviewTab: "words" }); }));
      r = await js(H + `await w(150); return {fact:(q('#v8-fact')||{}).innerText};`);
      check("R12: Words leaves a ticked contribution out of empty and shortest", r.fact === "What already changed has 7 words." || /^What already changed (has|is shortest in contribution 1)/.test(r.fact || ""), r);
      await seed(at("review", st => { st.contributions = [Object.assign({}, st.contributions[0], FULL), Object.assign({}, st.contributions[0], FULL, { cid: "k2nd", title: "Second", evidence: [], noEvidenceYet: true })]; st.ui = Object.assign({}, st.ui, { reviewTab: "evidence" }); }));
      r = await js(H + `await w(150); return qa('.v7-rqev-none').map(x=>x.innerText);`);
      check("R12: Add evidence shows No evidence yet in What you produced for a ticked contribution", r.indexOf("No evidence yet") !== -1, r);
    }
  }

  console.log("Q-25: a filled field's visible answer is its named control (voice control)");
  {
    const st = Object.assign({}, JSON.parse(JSON.stringify(fixture)), { profileConfirmed: true, mode: "compose", stageKey: "contrib", ui: { profileNote: false } });
    const c0 = st.contributions[0]; ["title", "stakes", "activities", "outputs"].forEach(k => { c0[k] = c0[k] || "Made-up text for " + k + "."; });
    await seed(st);
    const tabKey = async (shift) => { const m = shift ? 8 : 0; await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9, modifiers: m }); await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9, modifiers: m }); await sleep(150); };
    r = await js(H + `await w(200); const f=q('.v7-card [data-f$="-stakes"]'); const a=f.querySelector('.v7-ans'), b=f.querySelector('.v7-box');
      const name=(a.getAttribute('aria-labelledby')||'').split(' ').map(i=>document.getElementById(i)?.textContent.trim()).join(' ');
      const vis=a.innerText.trim(), kw=f.querySelector('.v7-f-k').innerText.trim();
      return {filled:f.classList.contains('is-filled'), ansHidden:a.getAttribute('aria-hidden'), ansTab:a.tabIndex, boxHidden:b.getAttribute('aria-hidden'), boxTab:b.tabIndex, name, vis, kw,
        kwShown:getComputedStyle(f.querySelector('.v7-f-k')).position!=='absolute', type:a.type, desc:a.getAttribute('aria-describedby')};`);
    check("Q-25: a closed filled field's answer is a button in the Tab order and the accessibility tree; its shrunk box is in neither",
      r.filled && r.ansHidden === null && r.ansTab === 0 && r.boxHidden === "true" && r.boxTab === -1 && r.type === "button", r);
    check("a11y (label in name): the answer button is named by the visible keyword and the visible answer", r.kwShown && r.name.indexOf(r.kw) === 0 && r.name.indexOf(r.vis) > 0 && /-ck$/.test(r.desc || ""), { name: r.name, vis: r.vis, kw: r.kw });
    await send("Accessibility.enable");
    const ax = await send("Accessibility.getFullAXTree");
    const axNames = ax.nodes.filter(n => !n.ignored && n.role && n.role.value === "button" && n.name && /^The problem or question/.test(n.name.value)).map(n => n.name.value);
    const axBoxes = ax.nodes.filter(n => !n.ignored && n.role && n.role.value === "textbox" && n.name && /problem/i.test(n.name.value || "")).length;
    check("a11y (AX tree): the closed problem field shows as one button named with its answer, and no textbox", axNames.length >= 1 && axBoxes === 0, { axNames: axNames.slice(0, 2), axBoxes });
    r = await js(H + `q('.v7-card [data-f$="-title"] .v7-ans').focus(); return document.activeElement.closest('.v7-f').dataset.f;`);
    await tabKey(false);
    r = await js(H + `const e=document.activeElement; return {cls:e.className, f:e.closest('.v7-f')?.dataset.f, open:!!e.closest('.v7-f.is-open')};`);
    check("a11y (keyboard): Tab from one filled field lands on the next field's answer, without opening it", /v7-ans/.test(r.cls) && /-stakes$/.test(r.f || "") && !r.open, r);
    r = await js(H + `document.activeElement.click(); await w(250); const f=q('.v7-card [data-f$="-stakes"]'), b=f.querySelector('.v7-box'), a=f.querySelector('.v7-ans');
      return {open:f.classList.contains('is-open'), focus:document.activeElement===b, boxHidden:b.getAttribute('aria-hidden'), boxTab:b.getAttribute('tabindex'), ansHidden:a.getAttribute('aria-hidden'), ansTab:a.tabIndex};`);
    check("Q-25: activating the answer (a voice command's click, or Enter) opens the field and focuses its box, which joins the tree; the answer leaves it",
      r.open && r.focus && r.boxHidden === null && r.boxTab === null && r.ansHidden === "true" && r.ansTab === -1, r);
    r = await js(H + `q('.v7-card [data-f$="-activities"] .v7-ans').click(); await w(250); const f=q('.v7-card [data-f$="-stakes"]');
      return {filled:f.classList.contains('is-filled'), ansTab:f.querySelector('.v7-ans').tabIndex, boxHidden:f.querySelector('.v7-box').getAttribute('aria-hidden')};`);
    check("Q-25: when focus moves on, the field closes and its answer is the control again", r.filled && r.ansTab === 0 && r.boxHidden === "true", r);
    await tabKey(true);
    r = await js(H + `const e=document.activeElement; return {f:e.closest('.v7-f')?.dataset.f, cls:e.className, before:(()=>{const fs=qa('.v7-card .v7-f'); const k=fs.findIndex(x=>/-activities$/.test(x.dataset.f)); return fs[k-1]?.dataset.f;})()};`);
    check("a11y (keyboard): Shift+Tab from an open box reaches the field before it by its answer", r.f === r.before && /v7-ans/.test(r.cls), r);
  }

  console.log("V8.7: the feedback box at the foot of each step");
  {
    const TP = () => PAGE() + "?tester=1";
    const tseed = async (state, tester) => {
      await go(HOME());
      await js("localStorage.clear();" + (state ? "localStorage.setItem('ncv-v9'," + JSON.stringify(JSON.stringify(state)) + ");" : "") + (tester ? "localStorage.setItem('ncv-v8-tester'," + JSON.stringify(JSON.stringify(tester)) + ");" : ""));
      await go(TP());
    };
    const tstate = { id: "1234abcd-0000-4000-8000-000000000002", email: "tester@example.org", start: {}, startSent: true, lastStep: "contrib" };
    const draft = (key) => Object.assign({}, JSON.parse(JSON.stringify(fixture)), { profileConfirmed: true, mode: "compose", stageKey: key, ui: { profileNote: false } });

    // Off on the plain address.
    await seed(draft("contrib"));
    r = await js(H + "await w(200); return {fb:qa('.v8-fb').length};");
    check("the feedback box is off on the plain address", r.fb === 0, r);

    apiMode = "ok"; apiPosts.length = 0;
    await tseed(draft("contrib"), tstate);
    r = await js(H + `await w(300); const b=q('.v8-fb-btn'), p=b&&document.getElementById(b.getAttribute('aria-controls'));
      const a={btn:!!b, text:b&&b.innerText.replace(/\\s+/g,' ').trim(), qHidden:b&&b.querySelector('.v8-fb-q')?.getAttribute('aria-hidden'), exp:b&&b.getAttribute('aria-expanded'), hidden:p&&p.hidden,
        h:b&&b.getBoundingClientRect().height, beforeNav:!!(b&&b.closest('.v8-fb').nextElementSibling?.classList.contains('narrative-nav'))};
      b.click(); await w(150);
      const ta=p.querySelector('textarea');
      a.exp2=b.getAttribute('aria-expanded'); a.hidden2=p.hidden; a.focus=document.activeElement===ta; a.role=p.getAttribute('role');
      a.region=document.getElementById(p.getAttribute('aria-labelledby'))?.innerText; a.label=q('label[for="'+ta.id+'"]')?.innerText;
      a.desc=document.getElementById(ta.getAttribute('aria-describedby'))?.innerText;
      p.querySelector('.btn-primary').click(); await w(200); a.emptyStatus=p.querySelector('[aria-live]').innerText; a.posts=0;
      return a;`);
    check("a signed-up tester sees a \"?\" Feedback on this step button above the bottom row, collapsed, at least 44 px tall", r.btn && r.text === "? Feedback on this step" && r.qHidden === "true" && r.exp === "false" && r.hidden && r.h >= 44 && r.beforeNav, r);
    check("a11y: the button opens a named region, moves focus to a labelled box, and the box is described by the reminder that the note is not part of the CV",
      r.exp2 === "true" && !r.hidden2 && r.focus && r.role === "region" && r.region === "Your feedback on Contributions" && /clear or confusing in this step/.test(r.label || "")
      && /goes to the Pathways to Impact team to help improve the tool\. It is not part of your CV\./.test(r.desc || ""), r);
    check("an empty note is not sent; the live status says what to do", /Write your note in the box/.test(r.emptyStatus) && apiPosts.filter(p => p.action === "note").length === 0, r.emptyStatus);

    r = await js(H + `const p=q('.v8-fb-panel'), ta=p.querySelector('textarea'); setv(ta,'A made-up note on the role line.');
      p.querySelector('.btn-primary').click(); await w(400);
      const b=q('.v8-fb-btn'), sl=q('.v8-fb-sent');
      return {hidden:p.hidden, exp:b.getAttribute('aria-expanded'), ta:ta.value, sent:sl.innerText, role:sl.getAttribute('role'), focus:document.activeElement===b,
        t:JSON.parse(localStorage.getItem('ncv-v8-tester')).notes};`);
    const note = apiPosts.find(p => p.action === "note") || {};
    check("Send feedback posts one note for this tester and step, with the profile and no draft text", note.id === tstate.id && note.step === "contrib" && note.note === "A made-up note on the role line."
      && note.profile && !("contributions" in note) && !("text" in note) && Object.keys(note).sort().join() === "action,id,note,profile,step,version", note);
    check("a11y: after sending, the box closes, focus returns to the button, and a status line beside it thanks the tester and counts the notes (V8.8)", r.hidden && r.exp === "false" && r.ta === "" && r.focus && r.role === "status" && /reached the team/.test(r.sent) && /1 note sent on this step/.test(r.sent) && r.t.contrib.sent === 1, r);

    // A failed send keeps the note; a reload keeps an unsent note.
    apiMode = "fail";
    r = await js(H + `q('.v8-fb-btn').click(); await w(100); const p=q('.v8-fb-panel'), ta=p.querySelector('textarea'); setv(ta,'Kept note.'); p.querySelector('.btn-primary').click(); await w(400);
      return {status:p.querySelector('[aria-live]').innerText, ta:ta.value, open:!p.hidden};`);
    check("a failed send keeps the box open with the note, and gives the team's email", r.open && r.ta === "Kept note." && /did not send/.test(r.status) && /impact@concordia\.ca/.test(r.status), r);
    apiMode = "ok";
    await go(TP());
    r = await js(H + `await w(300); q('.v8-fb-btn').click(); await w(100); return q('.v8-fb-panel textarea').value;`);
    check("an unsent note is still there after a reload", r === "Kept note.", r);

    // One box on every step, named for the step.
    const seen = [];
    for (const k of ["setup", "mentor", "ps", "review"]) {
      await tseed(Object.assign(draft(k), k === "setup" ? { profileConfirmed: false } : {}), tstate);
      seen.push(await js(H + `await w(300); const b=q('.v8-fb-btn'); if(!b) return 'none'; b.click(); await w(100); return qa('.v8-fb').length + ':' + q('.v8-fb-panel h3').innerText;`));
    }
    check("each step has one feedback box, headed with the step's name", seen.every(x => /^1:Your feedback on /.test(x)) && /Mentorship/.test(seen[1]) && /Review/.test(seen[3]), seen);

    // The start page has none, before or after sign-up.
    await tseed(null, tstate);
    r = await js(H + "await w(200); return qa('.v8-fb').length;");
    check("the start page has no feedback box", r === 0, r);
  }

  console.log("V8.8: Prem's notes of 2026-11-12");
  {
    const draft = (key, extra) => Object.assign({}, JSON.parse(JSON.stringify(fixture)), { profileConfirmed: true, mode: "compose", stageKey: key, ui: { profileNote: false } }, extra || {});
    await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });

    // Note 1: the Profile box.
    await seed(draft("contrib"));
    r = await js(H + `await w(250); const bar=q('.v7-tailored'), head=bar.querySelector('.v7-tailored-head'), k=head&&head.querySelector('.v7-tailored-k'), ch=head&&head.querySelector('#v7-chg'), pills=bar.querySelector('.v7-tailored-pills');
      return {head:!!head, k:k&&k.innerText, ch:!!ch, row:k&&ch?Math.abs(k.getBoundingClientRect().top+k.offsetHeight/2-(ch.getBoundingClientRect().top+ch.offsetHeight/2))<6:false,
        right:k&&ch?ch.getBoundingClientRect().left>k.getBoundingClientRect().right:false, below:pills&&ch?pills.getBoundingClientRect().top>=ch.getBoundingClientRect().bottom-1:false,
        order:[...bar.querySelectorAll('.v7-tailored-k, #v7-chg, .v7-pill')].map(x=>x.id||x.className.split(' ')[0]).slice(0,3).join(','), radius:getComputedStyle(bar).borderRadius};`);
    check("V8.11: the Profile box puts Change on the label's row, to its left, with the pills below, in card style", r.head && r.k === "Profile:" && r.ch && r.row && !r.right && r.below && r.radius === "4px", r);
    r = await js(H + `await w(100); const bar=q('.v7-tailored'), ch=q('#v7-chg'), k=bar.querySelector('.v7-tailored-k'), nm=q('#v7-prof-name');
      const a={order:[...bar.querySelectorAll('#v7-chg, .v7-tailored-k, #v7-prof-name, .v7-pill')].map(x=>x.id||x.className.split(' ')[0]).slice(0,4).join(','),
        tri:parseFloat(getComputedStyle(ch.querySelector('.v7-tri')).fontSize)/parseFloat(getComputedStyle(ch).fontSize), forName:k.htmlFor, ph:nm&&nm.placeholder,
        nameRow:nm?Math.abs(nm.getBoundingClientRect().top+nm.offsetHeight/2-(ch.getBoundingClientRect().top+ch.offsetHeight/2))<6:false,
        h:Math.round(bar.getBoundingClientRect().height)};
      nm.focus(); setv(nm,'SSHRC Insight, fall'); await w(100); a.saved=JSON.parse(localStorage.getItem('ncv-v9')).draftName;
      rail('Mentorship').click(); await w(250); a.kept=q('#v7-prof-name')?.value; rail('Contributions').click(); await w(250); return a;`);
    check("V8.11: Change, Profile:, the name box, then the pills, in reading and Tab order; the triangle is larger than the button text", r.order === "v7-chg,v7-tailored-k,v7-prof-name,v7-pill" && r.tri > 1.3, r);
    check("a11y: Profile: labels the name box; the name sits on Change's row, saves as the draft name and stays on the next step", r.forName === "v7-prof-name" && r.ph === "Name this profile" && r.nameRow && r.saved === "SSHRC Insight, fall" && r.kept === "SSHRC Insight, fall", r);
    check("V8.11: the Profile box is compact (at most 110 px tall at 1280 px wide with two rows of pills)", r.h <= 110, r);

    // Note 3 is in the feedback-box block. Note 6: estimates and decades.
    r = await js(H + `await w(200); const box=(k)=>q('[data-f$="-'+k+'"] .v7-box'); const fl=(k)=>qa('[data-f$="-'+k+'"] .v4-flag').map(x=>x.textContent).join('|');
      const put=async(k,v)=>{ box(k).focus(); setv(box(k),v); await w(80); return fl(k); };
      const a={}; a.s100=await put('activities','I worked with 100s of tenants.'); a.hund=await put('activities','Hundreds of tenants took part.');
      a.dec=await put('activities','Interviews with tenants who arrived in the 1990s.'); a.none=await put('activities','I worked with tenants.'); a.exact=await put('activities','I worked with 140 tenants.');
      a.out=await put('outcomes','Tenants use the toolkit.'); return a;`);
    check("note 6: “100s” and “hundreds” are estimates: the message names the word and asks for the number", /“100s” is an estimate\. If you have a specific total, please give it/.test(r.s100) && /“Hundreds” is an estimate/.test(r.hund), r);
    check("note 6: a decade counts as a date; with no number, the message says what the question asked; an exact number gives no message", !/estimate|No numbers/.test(r.dec) && /No numbers yet\. If you have specific totals, please add them\./.test(r.none) && !/estimate|No numbers/.test(r.exact) && /No numbers yet\. If you have a specific total for what changed/.test(r.out), r);

    // Notes 4, 5 and 7: help that only repeats the question is gone; no tool machinery; no specialist terms.
    r = await js(H + `await w(100); const f=q('[data-f$="-stakes"]'); f.querySelector('.v7-box').focus(); await w(250);
      const t=q('[data-f$="-title"]'); t.querySelector('.v7-box').focus(); await w(250); const th=[...t.querySelectorAll('.v4-help, .v7-explain, .v7-info')].map(x=>x.innerText).join('|');
      const rl=q('[data-f$="-roleLine"]'); rl.querySelector('.v7-box').focus(); await w(250);
      return {stakesHelp:[...f.querySelectorAll('.v7-explain, .v7-info')].map(x=>x.innerText).join('|'), title:th, lv:(rl.querySelector('.v7-lv-note')||{}).innerText||'', clear:qa('button').some(b=>/Clear the level/.test(b.innerText))};`);
    check("note 4: the problem field has no help line that restates it (social sciences); the headline help keeps only what is new", !/Strong contributions open/.test(r.stakesHelp) && !/Short, plain/.test(r.title) && /Name what the work was for\./.test(r.title) && /as evidence during Review/.test(r.title), r);
    check("note 5: the role level says what Review does with it, in plain words", /^Review uses your choice to show your role across all your contributions\. Only the line you write in the box appears in your draft\.$/.test(r.lv) && !r.clear, r);
    {
      const src = fs.readFileSync(path.join(ROOT, "narrative-cv-prototype-v9.html"), "utf8").split("\n").filter(l => !/^\s*\/\//.test(l)).join("\n");
      const bad = ["care pathways", "next field", "the checks refer", "The checks under each field", "The checks are fixed rules", "Clear the level", "appears in the charts and the checks", "Strong contributions open with", "Short, plain and easy to remember", "A reviewer should see one coherent program", "described concretely", "a dataset the health authority holds", "Over the last five years"].filter(x => src.includes(x));
      check("notes 4, 5 and 7: the cut wording is gone from the tool (and the mentorship example gives no five-year period)", bad.length === 0, bad);
    }

    // Notes 8 and 9: the totals and the people section.
    await seed(draft("mentor", { mentorOtherLabel: "Lab technicians", mentorCounts: { phd: "2", masters: "1", postdoc: "1", undergrad: "", other: "3" } }));
    r = await js(H + `await w(300); const tiles=qa('.v7-tile').filter(x=>x.closest('.v7-tiles'));
      const a={labels:tiles.map(t=>t.querySelector('label').innerText).join('|'), tops:new Set(tiles.map(t=>Math.round(t.getBoundingClientRect().top))).size,
        sel:!!q('#v7-t-other-kind'), selName:q('label[for="v7-t-other-kind"]')?.innerText, selVal:q('#v7-t-other-kind')?.value, name:q('#v7-t-other-name')?.value, nameShown:!q('#v7-t-other-name')?.hidden,
        opts:[...q('#v7-t-other-kind').options].map(o=>o.text).join('|'), help:q('.v7-tiles-help')?.innerText,
        h:qa('.v7-section-t h3').map(x=>x.innerText).join('|'), people:qa('.v7-people-help').map(x=>x.innerText), bullets:qa('.v7-people-help li').length,
        lvlOpts:[...(q('[id^=v7-ps]')||{options:[]}).options].map(o=>o.text).filter(Boolean).join('|'), co:(q('.v7-lvl-help')||{}).innerText||''};
      const sel=q('#v7-t-other-kind'); sel.value='community'; sel.dispatchEvent(new Event('change',{bubbles:true})); await w(80);
      a.afterHidden=q('#v7-t-other-name').hidden; a.st=JSON.parse(localStorage.getItem('ncv-v9')); a.afterLabel=a.st.mentorOtherLabel; a.afterKind=a.st.mentorOtherKind;
      sel.value='else'; sel.dispatchEvent(new Event('change',{bubbles:true})); await w(80); a.elseFocus=document.activeElement.id; delete a.st; return a;`);
    check("note 8: the boxes run Postdoctoral, Doctoral, Master’s, Undergraduate research, Other, all on one row, and the Level list follows the same order",
      r.labels === "Postdoctoral|Doctoral|Master’s|Undergraduate research|Other" && r.tops === 1 && /^Choose…\|Postdoctoral\|Doctoral\|Master’s\|Undergraduate research\|Other$/.test(r.lvlOpts), r);
    check("note 8: Other has a labelled list on its own row under the boxes; a name typed before 8.8 opens as Something else with the name kept; choosing a group hides the box and saves the group",
      r.sel && /^Who are the other people you trained\?$/.test(r.selName) && r.opts === "Choose (optional)|Research staff|Residents or clinical fellows|Community researchers|Visiting researchers|A mix of these|Something else"
      && r.selVal === "else" && r.name === "Lab technicians" && r.nameShown && r.afterHidden && r.afterLabel === "community researchers" && r.afterKind === "community" && r.elseFocus === "v7-t-other-name", r);
    check("note 8: the help under the boxes keeps only the point on the period", r.help === "These totals have no set period unless your competition sets one.", r.help);
    check("note 9: the people heading says Highlight; one context line and one privacy line replace the six bullets; co-supervision sits on the card",
      /Highlight some people you trained/.test(r.h) && r.people.length === 2 && r.bullets === 0 && /career paths after training show your mentorship style/.test(r.people[0]) && /relates directly to your application/.test(r.people[0]) && /^Please leave out names\./.test(r.people[1]) && /co-supervise/.test(r.co), r);

    // Note 10: the end questions get their own step.
    const tstate = { id: "1234abcd-0000-4000-8000-000000000003", email: "tester@example.org", start: {}, startSent: true, lastStep: "export" };
    await go(HOME());
    await js("localStorage.clear();localStorage.setItem('ncv-v9'," + JSON.stringify(JSON.stringify(draft("export"))) + ");localStorage.setItem('ncv-v8-tester'," + JSON.stringify(JSON.stringify(tstate)) + ");");
    await go(PAGE() + "?tester=1");
    r = await js(H + `await w(300); const a={endOnExport:!!q('.v8-tester-end'), rail:qa('.v7-ri').map(b=>b.innerText.split('\\n')[0]).slice(-1).join('|'), next:!!nav(/Finish your test/)};
      q('#v8-te-open').click(); await w(150);
      const which=q('#v8-te-fitWhich')?.closest('.v8-tq'); a.which0=which.hidden;
      const fs=qa('.v8-tester-end fieldset'); fs[1].querySelectorAll('input')[0].click(); await w(50); a.whichFit=which.hidden;
      fs[1].querySelectorAll('input')[1].click(); await w(50); a.whichMostly=which.hidden;
      const opts=[...fs[0].querySelectorAll('.v8-tq-opt')], ends=[...fs[0].querySelectorAll('.v4-fb-scale-ends span')];
      a.endR=Math.round(ends[1].getBoundingClientRect().right-opts[4].getBoundingClientRect().right); a.endL=Math.round(ends[0].getBoundingClientRect().left-opts[0].getBoundingClientRect().left);
      return a;`);
    check("V8.9: the questions are on Export; the rail ends with Export, with no Finish your test step or button", r.endOnExport && r.rail === "Export" && !r.next, r);
    check("note 10: “Which ones?” shows only after an answer other than They fit; the scale's end labels sit under 1 and under 5", r.which0 && r.whichFit && !r.whichMostly && Math.abs(r.endR) <= 2 && Math.abs(r.endL) <= 2, r);
    await seed(draft("export"));
    r = await js(H + "await w(200); return {rail:qa('.v7-ri').map(b=>b.innerText.split('\\n')[0]).includes('Finish your test'), card:!!q('.v8-tester-end')};");
    check("the plain address has no feedback questions on Export", !r.rail && !r.card, r);
    await send("Emulation.setDeviceMetricsOverride", { width: 1180, height: 900, deviceScaleFactor: 1, mobile: false });
  }

  console.log("V8.14 with the mock CV: change marks, Reach, Mentorship, print, contrast");
  {
    const mock = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "ncv_tool_v8", "mock", "mock-narrative-cv-draft.json"), "utf8")).draft;
    await seed(mock);
    r = await js(H + `await w(300); const a={};
      a.h=q('.narrative-stage-header h2').innerText;
      q('#v8-tab-reach').click(); await w(60);
      a.q=q('#v8-rb-q').innerText; a.fact=q('#v8-fact').innerText; a.noLadder=!q('.v7-reach-cell') && !q('.v7-reach-year');
      const r1=q('[role=tabpanel] .v8-row'); a.cols=[...r1.querySelectorAll('.v8-rc-h')].map(x=>x.textContent); a.r1=r1.innerText.replace(/\\s+/g,' ');
      a.tags=qa('[role=tabpanel] .v8-row').map(r=>(r.querySelector('.v8-tags')||{}).innerText||'');
      const go=r1.querySelector('.v8-card > button.v7-linkbtn'); a.goName=go.getAttribute('aria-label'); const cid=r1.dataset.cid; go.click(); await w(300);
      a.where=[q('.narrative-stage-header h2').innerText, q('.v7-f.is-open')?.dataset.f];
      const fsN=qa('[data-f="c'+cid+'-outcomes"] .v8-chg-fs legend').map(l=>l.textContent);
      a.legN=fsN; const cbN=q('#c'+cid+'-changed-field'); a.cbLab=(q('label[for="c'+cid+'-changed-field"]')||{}).innerText.trim(); cbN.click(); await w(40);
      a.savedN=JSON.parse(localStorage.getItem('ncv-v9')).contributions.find(c=>c.cid===cid).changed.who.join();
      a.legE=qa('[data-f="c'+cid+'-impact"] .v8-chg-fs legend').map(l=>l.textContent);
      const cbE=q('#c'+cid+'-expected-culture'); cbE.click(); await w(40);
      a.savedE=JSON.parse(localStorage.getItem('ncv-v9')).contributions.find(c=>c.cid===cid).expected.what.join();
      rail('Review').click(); await w(200); q('#v8-tab-reach').click(); await w(60);
      a.r1b=q('[role=tabpanel] .v8-row[data-cid="'+cid+'"]').innerText.replace(/\\s+/g,' '); a.fact2=q('#v8-fact').innerText;
      const sec=q('.v8-rm'); a.mq=sec.querySelector('.v8-q').innerText; a.mfact=q('#v8-rm-fact').innerText; a.mlive=q('#v8-rm-fact').getAttribute('aria-live');
      a.groups=qa('.v8-rm-gh').map(x=>x.innerText); const pb=q('.v8-person'); a.pName=pb.innerText.replace(/\\s+/g,' '); a.pExp0=pb.getAttribute('aria-expanded');
      pb.click(); await w(60); const pb2=q('#'+pb.id); a.pExp=pb2.getAttribute('aria-expanded'); a.pe=!!pb2.parentNode.querySelector('.v8-pe'); a.pFocus=document.activeElement.id;
      const wsel=q('[id^="v8-pw-"]'); a.wLab=(q('label[for="'+wsel.id+'"]')||{}).innerText; setsel(wsel,'industry'); await w(60);
      const org=q('[id^="v8-pg-"]'); setv(org,'Made-up Firm'); await w(40); a.pNow=q('#'+pb.id).innerText.replace(/\\s+/g,' ');
      a.mSaved=JSON.parse(localStorage.getItem('ncv-v9')).mentees[0].kind+'|'+JSON.parse(localStorage.getItem('ncv-v9')).mentees[0].org;
      org.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true})); await w(60); a.pClose=[!q('.v8-pe'), document.activeElement.id===pb.id];
      const fsv=q('.v8-rm-flow svg'); a.flow=fsv ? fsv.getAttribute('aria-label') : ''; a.flowText=fsv ? fsv.textContent : ''; a.noRing=!q('.v7-rq-ring'); a.mTick=!sec.querySelector('.v8-tick, input[type=checkbox]');
      // contrast of the new parts, from their computed colours
      const rgb=(s)=>s.match(/\\d+(\\.\\d+)?/g).slice(0,3).map(Number); const L=(c)=>{const v=c.map(x=>{x/=255;return x<=0.03928?x/12.92:Math.pow((x+0.055)/1.055,2.4);});return 0.2126*v[0]+0.7152*v[1]+0.0722*v[2];};
      const bgOf=(e)=>{while(e){const b=getComputedStyle(e).backgroundColor; if(b && !/rgba\\(0, 0, 0, 0\\)|transparent/.test(b)) return b; e=e.parentElement;} return 'rgb(255,255,255)';};
      const ratio=(e)=>{const f=L(rgb(getComputedStyle(e).color)), b=L(rgb(bgOf(e))); return (Math.max(f,b)+0.05)/(Math.min(f,b)+0.05);};
      q('#v8-tab-order').click(); await w(60);
      const pick=['#v8-tab-order','.v8-tab:not([aria-selected=true])','.v8-mark[aria-pressed=true]','.v8-mark[aria-pressed=false]','.v8-n','.v8-rb-st-t','.v8-strands','.v8-how','.v8-fact p','.v7-ow'];
      a.contrast=pick.map(s=>{const e=q(s); return [s, e ? Math.round(ratio(e)*10)/10 : null];});
      q('#v8-tab-reach').click(); await w(60); ['.v8-rc-h','.v8-tag','.v8-tag.is-none','.v8-rc-w .v7-quiet'].forEach(s2=>{const e=q(s2); a.contrast.push([s2, e ? Math.round(ratio(e)*10)/10 : null]);});
      const cs=qa('.v7-comp-seg').filter(x=>/^Contribution/.test(x.title)); a.cTones=cs.map(x=>getComputedStyle(x).backgroundColor);
      a.legTones=qa('.v7-comp-leg li').filter(li=>/^Contribution/.test(li.textContent)).map(li=>getComputedStyle(li.querySelector('.v7-comp-sw')).backgroundColor);
      a.cContrast=cs.map(x=>Math.round(ratio(x)*10)/10); a.cLabels=cs.map(x=>x.textContent);
      rail('Export').click(); await w(250); a.exp=q('#v4-stage-content').innerText;
      return a;`);
    check("V8.14 Reach: asks Prem's yes/no question; no six-level ladder and no year box", r.q === "Do your words and evidence show the changes you marked?" && r.noLadder, r);
    check("V8.14 Reach: the fact line counts the marks and says they are optional when there are none; each row reads back two equal columns beside the words and evidence", /^You marked changes on 4 of 4 contributions\./.test(r.fact) && !/already happened/.test(r.fact) && r.cols.join("|") === "Already changed|Could change|Words and evidence" && /Who: People, A government or institution/.test(r.r1) && /What already changed: /.test(r.r1) && /items? shows? that others used the work\./.test(r.r1), r);
    check("V8.14: strand tags show on the other tabs, with “No strand” for None of these", r.tags[0] === "Tenant-led data" && r.tags[3] === "No area", r.tags);
    check("V8.14 Reach: Edit on Contributions is named for its contribution and opens What already changed", /^Edit the changes of contribution 1 on Contributions$/.test(r.goName) && /Contributions|Most significant/.test(r.where[0]) && /-outcomes$/.test(r.where[1] || ""), r);
    check("V8.14 Contributions: optional, labelled checkbox groups sit under What already changed and What could change", r.legN.join("|") === "Who changed? (optional)|What changed? (optional)" && r.legE.join("|") === "Who could change? (optional)|What could change for them? (optional)" && r.cbLab === "A field", r);
    check("V8.14 Contributions: a tick saves to the contribution as already happened or expected", /field/.test(r.savedN) && /culture/.test(r.savedE), r);
    check("V8.14 Reach: the tab reads back the new marks and the fact line follows", /Who: People, A government or institution, A field/.test(r.r1b) && /What: Policy, Culture or values/.test(r.r1b) && /^You marked changes on 4 of 4 contributions\./.test(r.fact2), r); // R9: the fact line counts contributions, so more marks in the same contributions leave it as it was
    check("V8.14 Mentorship: below the board, with Prem's question and a polite live fact line", /^Does the section describe people you trained( or mentored)? and where they are now\?$/.test(r.mq) && r.mlive === "polite" && /^You trained or mentored 57 people and described 4\.$/.test(r.mfact), r);
    check("V8.14 Mentorship: people grouped by the level they trained at, each a button from their level to where they are now", /^Postdoctoral · 2 trained or mentored, 1 described$/.test(r.groups[0]) && /^A postdoctoral fellow → Now: /.test(r.pName) && r.pExp0 === "false", r);
    check("V8.14 Mentorship: selecting a person opens their entry under them, with focus; changes save and show on the button", r.pExp === "true" && r.pe && /^v8-pl-/.test(r.pFocus) && r.wLab === "Where are they now?" && /Made-up Firm/.test(r.pNow) && /Industry/.test(r.pNow) && r.mSaved === "industry|Made-up Firm", r);
    check("V8.14 Mentorship: Escape closes the entry and focus goes back to the person; V8.19: no tick on Review", r.pClose[0] && r.pClose[1] && r.mTick, r);
    check("V8.15 Mentorship: one chart from the level each person trained at to where they are now, named for screen readers", /^Where the people you describe are now: Postdoctoral to Industry, 1; Doctoral to Community agency, 1; Master’s to Government, 1; Undergraduate to University, 1\.$/.test(r.flow) && /Trained as/.test(r.flowText) && /Industry · 1/.test(r.flowText) && r.noRing, r);
    check("V8.14: strands, change marks and ticks do not print", !/Tenant-led data|Shared analysis|Who changed|Already happened|I have checked this/.test(r.exp), "");
    check("V8.15: each contribution's block has a colour of its own, the same in the legend, and reads Contribution N or CN", r.cTones.length === 4 && new Set(r.cTones).size === 4 && r.cTones.join() === r.legTones.join() && r.cLabels.every(t => /^(Contribution \d|C\d|)$/.test(t)) && r.cContrast.every(v => v >= 4.5), r);
    const low = r.contrast.filter(([, v]) => v === null || v < 4.5);
    check("V8.14: the new text and controls meet 4.5:1 contrast", low.length === 0, r.contrast);
    // The Word export (HTML) leaves the review marks out too.
    r = await js(H + `let doc=''; const oc=URL.createObjectURL; URL.createObjectURL=(b)=>{ b.text().then(t=>{doc=t;}); return oc.call(URL,b); };
      const wb=qa('button').find(b=>/Download Word/.test(b.innerText)); if (wb) { wb.click(); await w(300); } URL.createObjectURL=oc;
      return {n:doc.length, has:/Tenant-led data|Shared analysis|Who changed|Culture or values|Already happened/.test(doc)};`);
    check("V8.14: the Word file holds no strand names or change marks", r.n > 0 && !r.has, r);
    // V8.15: Export opens with the whole CV, editable in place, then Before you export, then the export functions.
    r = await js(H + `await w(100); const a={}; a.heads=qa('#v4-stage-content .v7-h3, #v4-stage-content .v7-card-t').map(h=>h.innerText);
      const doc=q('.v8-edoc'); a.group=[doc.getAttribute('role'), doc.getAttribute('aria-label')];
      const parts=qa('.v8-edoc .v8-ed-part'); a.n=parts.length; a.roles=parts.every(x=>x.getAttribute('role')==='textbox' && /^(Personal statement|Background and skills|Contribution \\d|Mentorship): /.test(x.getAttribute('aria-label')||''));
      a.editable=parts.every(x=>/^(plaintext-only|true)$/.test(x.contentEditable));
      const sp=parts.find(x=>x.getAttribute('aria-label')==='Contribution 1: What you did'); sp.focus(); sp.textContent='Made-up edited sentence on Export.'; sp.dispatchEvent(new Event('input',{bubbles:true})); await w(60);
      a.saved=JSON.parse(localStorage.getItem('ncv-v9')).contributions[0].activities;
      const ev=new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}); sp.dispatchEvent(ev); a.enter=ev.defaultPrevented;
      sp.textContent=''; sp.dispatchEvent(new Event('input',{bubbles:true})); await w(40); a.ph=getComputedStyle(sp,'::before').content; sp.textContent='Made-up edited sentence on Export.'; sp.dispatchEvent(new Event('input',{bubbles:true}));
      const fx=qa('.v8-edoc .v8-ed-fixed'); a.fixed=fx.length>0 && fx.every(x=>!x.isContentEditable) && fx.some(x=>/^Totals: /.test(x.textContent));
      sp.focus(); a.focusRing=getComputedStyle(sp).outlineStyle;
      rail('Review').click(); await w(200); a.noprint=qa('.v8-noprint').length; a.noprintT=(q('.v8-noprint')||{}).textContent;
      rail('Contributions').click(); await w(200); a.noHelp=!/These marks are for your review/.test(q('#v4-stage-content').textContent);
      return a;`);
    check("V8.15 Export: the whole CV comes first, then Before you submit, then the export functions", r.heads.slice(0, 3).join("|") === "Narrative CV draft|Before you submit|Download or print", r.heads);
    check("V8.15 Export: each part is a labelled text box in the CV, in print order; the sentences the tool writes are not editable", r.group.join() === "group,Narrative CV draft, editable" && r.n > 20 && r.roles && r.editable && r.fixed, r);
    check("V8.15 Export: an edit saves to the part it came from; Enter adds no line; an empty part shows its name; focus is visible", r.saved === "Made-up edited sentence on Export." && r.enter && /\[What you did\]/.test(r.ph) && r.focusRing === "solid", r);
    check("V8.19: no “do not print” line on Review or on Contributions", r.noprint === 0 && r.noHelp, r);
  }

  console.log("Plain-language rewrites (Q-6, V8.7)");
  {
    const src = fs.readFileSync(path.join(ROOT, "narrative-cv-prototype-v9.html"), "utf8");
    const code = src.split("\n").filter(l => !/^\s*\/\//.test(l)).join("\n");
    const OLD = ["Standing\"", "signals of standing", "Hedged", "is a hedge", "throughline", "single thread", "grammatical person", "unique contribution", "taken up more widely", "told as a scene", "Who gets in", "where they went", "take precedence", "pick up where you left off", "frames the whole", "beyond the prose"];
    const left = OLD.filter(x => code.includes(x));
    check("Q-6: the replaced wording is gone from the tool", left.length === 0, left);
    const NEW = ["standing: \"Recognition\"", "label: \"Team composition\"", "What are the main areas of your research, and what connects them?", "Please describe how you started working on this research question or theme.", "Cautious words suit this part", "DORA (the San Francisco Declaration on Research Assessment)", "Describe one real case in two sentences"];
    const missing = NEW.filter(x => !code.includes(x));
    check("Q-6: the plainer wording is in place (part names, questions, checks)", missing.length === 0, missing);
    check("P6: the career stage reads Mid-career, stored value unchanged", /\{ v: "mid", l: "Mid-career" \}/.test(src));
    check("R12: a missing headline reads No headline yet on screen and [No headline yet] in the draft text and files; none says Untitled contribution", !/Untitled contribution/.test(src) && (src.match(/"\[No headline yet\]"/g) || []).length === 5 && /rvTitle = \(x\) => gvCut\(one\(x.title\), 90\) \|\| "No headline yet"/.test(src) && /- 3 \* liveContributions\(\)/.test(src));
    check("the version is 9.6 in the script and the tab title", /VERSION_NUM = "9\.6"/.test(src) && /<title>Narrative CV — V9\.6 beta/.test(src));
  }

  console.log("Batch 4 and 6 (V9): Contributions and Personal statement wording");
  {
    const base = () => Object.assign({}, JSON.parse(JSON.stringify(fixture)), { profileConfirmed: true, mode: "compose", stageKey: "contrib", ui: { profileNote: false } });
    const blankC = (cid, x) => Object.assign({ cid, title: "Made-up contribution " + cid, stakes: "", roleMode: "", roleLine: "", activities: "", outputs: "", outcomes: "", impact: "", translational: "", evidence: [], flags: {}, notes: {} }, x || {});
    const mkState = (lens, contribs) => { const st = base(); st.lens = Object.assign({}, st.lens, { discipline: "social", discipline2: "", careerStage: "mid", workMode: ["team"], format: "tcv", agency: "sshrc" }, lens || {}); st.contributions = contribs || [blankC("b4a")]; return st; };
    const PAGE_JS = H + `const lum=(c)=>{const m=c.match(/[\\d.]+/g).map(Number);const f=v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4)};return 0.2126*f(m[0])+0.7152*f(m[1])+0.0722*f(m[2]);};
      const cr=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05);};
      const segText=(sp)=>{const c=sp.cloneNode(true); c.querySelectorAll('.v4-super').forEach(x=>x.remove()); return c.textContent.trim();};
      const gd=(k)=>{const g=q('[id$="-'+k+'-hp"]'); return g?{help:[...g.querySelectorAll('.v7-explain:not(.v9-hint) p:not(.v9-sample)')].map(p=>p.textContent).join(' '), sample:(g.querySelector('.v9-sample')||{}).textContent||'', hints:[...g.querySelectorAll('.v9-hint')].map(h=>h.textContent.trim())}:{help:'',sample:'',hints:[]};};
      const qq=(k)=>((q('[data-f$="-'+k+'"] .v7-q')||{}).textContent||'');`;

    // ── Contributions, social sciences, team-based, TCV ──
    await seed(mkState(), null, { raw: true });
    r = await js(PAGE_JS + `await w(250); const a={};
      a.start=!!q('.v7-startline'); a.intro=[...qa('.v9-intro p')].map(p=>p.innerText); a.hintTxt=(q('#v4-stage-content > .v9-hint')||{}).textContent||'';
      a.ex=qa('.v7-ex-btn').map(b=>b.innerText.trim());
      if(!q('#v7-exbox')) q('#v7-ex-finished').click(); await w(150);
      a.title=q('#v7-exbox h4').innerText; a.match=q('.v7-match').innerText; a.foot=q('.v7-exfoot').innerText;
      a.segs={}; ['stakes','role','activities','outputs','outcomes','impact'].forEach(j=>{const sp=q('.v7-exemplar .v7-seg-'+j); a.segs[j]=sp?segText(sp):null;});
      a.samples={}; [['stakes','stakes'],['roleLine','role'],['activities','activities'],['outputs','outputs'],['outcomes','outcomes'],['impact','impact']].forEach(([k,j])=>{a.samples[j]=gd(k).sample;});
      a.title_g=gd('title'); a.stakes_g=gd('stakes'); a.role_g=gd('roleLine'); a.act_g=gd('activities'); a.out_g=gd('outputs'); a.outc_g=gd('outcomes'); a.imp_g=gd('impact'); a.tr_g=gd('translational');
      a.q={title:qq('title'),stakes:qq('stakes'),role:qq('roleLine'),act:qq('activities'),out:qq('outputs'),outc:qq('outcomes'),imp:qq('impact'),tr:qq('translational')};
      a.trLabel=(q('[data-f$="-translational"] .v7-f-k')||{}).textContent;
      a.ph=(q('[data-f$="-title"] .v7-box')||{}).placeholder;
      a.note=qa('.v7-nav-note').map(x=>x.innerText).join('|'); a.later=!!q('.v7-later-note'); a.clear=!!q('.v7-lv-clear');
      a.levels=qa('.v7-mini').map(b=>b.textContent.trim());
      return a;`);
    check("Row 4, C1: the line 'You start with your contributions.' is gone; three guidance paragraphs and a hint with a hidden 'Tip:' take its place", !r.start && r.intro.length === 3
      && r.intro[0] === "You will start with contributions because they are the core of your CV, and you will refer back to them in your personal statement."
      && r.intro[1] === "A contribution or experience can be a single output or a group of related work, such as a cluster of papers, a program or a partnership. For each contribution, you will describe the problem or question, the role you played, the results, and the immediate or potential impact."
      && r.intro[2] === "You can describe up to 10. We recommend three or four that are most relevant to your application, which may differ from your most recent work. For more information, please read what counts as a contribution."
      && r.hintTxt === "Tip: You will put your contributions in order during Review, after your personal statement.", r);
    check("C2: the example buttons are See a finished example only (no 'How each part sounds in your field' and no cue lists)", r.ex.length === 1 && /See a finished example/.test(r.ex[0]), r.ex);
    check("Row 2, 2a, C3: the example reads 'A finished contribution', a sentence names the example's own profile, no cue, and the foot is the decided line",
      r.title === "A finished contribution" && r.match === "Written for a mid-career researcher in social sciences who works in a team." && r.foot === "This example is fictional. In your CV, these sentences form one paragraph.", r);
    check("Q1: each part's sample is quoted from the finished example the profile gets, as For example: “…”, one per part",
      ['stakes','role','activities','outputs','outcomes','impact'].every(j => r.segs[j] && r.samples[j] === "For example: “" + r.segs[j] + "”"), { segs: r.segs, samples: r.samples });
    check("C5: Headline: question, help 'Name what the work was for.', the hint names the evidence title, no placeholder",
      r.q.title === "What one line would help a reviewer remember this work?" && r.title_g.help === "Name what the work was for." && r.title_g.hints.join() === "Tip: You will add the title of the paper as evidence during Review." && !r.ph, { q: r.q.title, g: r.title_g, ph: r.ph });
    check("C6: The problem or question: help 'Describe the question and why it was important.' with the sample",
      r.q.stakes === "What problem or question did this work address, and who did it affect?" && r.stakes_g.help === "Describe the question and why it was important." && /^For example: “/.test(r.stakes_g.sample), { q: r.q.stakes, g: r.stakes_g });
    check("C7: Your role: team question kept, help and hint as decided",
      r.q.role === "In one line, what did you do yourself within the team?" && r.role_g.help === "Name your own part, and the team if there was one." && r.role_g.hints.join() === "Tip: Funders let you choose “I” or “we”. Concordia recommends “I”, as it states your role most directly." && !/I led a team that developed/.test(r.role_g.help + r.role_g.sample), r.role_g);
    check("C8: What you did: 'at what scale', help 'Give details where you can.', the details hint",
      r.q.act === "Which methods, sites or partners did the work involve, and at what scale?" && r.act_g.help === "Give details where you can." && r.act_g.hints.join() === "Tip: Details can include the number of people involved, the sites or venues, and how long the work ran.", { q: r.q.act, g: r.act_g });
    check("C9: What resulted: one question for every field, no help, the field's list as a hint",
      r.q.out === "What did this work produce, and how many of each?" && r.out_g.help === "" && r.out_g.hints.join() === "Tip: For example, papers, reports, datasets, surveys or programs.", { q: r.q.out, g: r.out_g });
    check("C10, R11a: What already changed: 'what was the impact?', the social hint, and the help that points to the No impact yet tick",
      r.q.outc === "Who has used this work so far, and what was the impact?" && r.outc_g.help === "If there has been no impact yet, please tick No impact yet and describe the potential impact under What could change."
      && r.outc_g.hints.join() === "Tip: For example, scholars, practitioners, communities, the public or policy makers.", { q: r.q.outc, g: r.outc_g });
    check("C11: What could change: question kept, help and the academic-impact hint as decided",
      r.q.imp === "If the work is used more widely, which field, sector or population could it affect, and how?" && r.imp_g.help === "Please use cautious words such as “could” or “might”." && r.imp_g.hints.join() === "Tip: Academic impact counts: how others think, what gets studied and how questions are framed.", { q: r.q.imp, g: r.imp_g });
    check("C12: the optional part is 'A real use case (optional)' with the decided question and help; the old word 'One moment' is gone from the field",
      r.trLabel === "A real use case (optional)" && r.q.tr === "Which one moment shows the work reaching a specific person or group?" && r.tr_g.help === "Describe one real case in two sentences, such as a person, a clinic, a classroom, a community meeting or a committee that used the work. Name a person or community only with their agreement.", { l: r.trLabel, q: r.q.tr, g: r.tr_g });
    check("C13, C17, row 6: no line beside Next; no 'Clear your choice'; the level reads 'Partners led it, and I took part'; no saved-for-later note",
      !/choose their order/.test(r.note) && !r.clear && r.levels.indexOf("Partners led it, and I took part") > -1 && r.levels.indexOf("The partners led it, and I took part") === -1 && !r.later, { note: r.note, levels: r.levels });

    // C4: the two-field example
    await seed(mkState({ discipline: "social", discipline2: "humanities" }), null, { raw: true });
    r = await js(PAGE_JS + `await w(250); const a={ex:qa('.v7-ex-btn').map(b=>b.innerText.trim())}; const b=q('#v7-ex-two'); if(b.getAttribute('aria-expanded')!=='true'){ b.click(); await w(200); } a.title=q('#v7-exbox h4').innerText; a.match=q('.v7-match').innerText; a.foot=q('.v7-exfoot').innerText; return a;`);
    check("C4: the two-field example reads 'A contribution across two fields', 'Written for a researcher working across …' and the decided foot", r.ex.length === 2 && r.title === "A contribution across two fields" && r.match === "Written for a researcher working across social sciences and the humanities." && r.foot === "This example is fictional. Each part shows what the work meant in both fields.", r);

    // Row 12: the part's name as a pill above each question
    r = await js(PAGE_JS + `await w(250); const out=[]; const parts=['stakes','roleLine','activities','outputs','outcomes','impact'];
      parts.forEach(k=>{ const f=q('[data-f$="-'+k+'"]'); const pill=f.querySelector('.v9-pill'); const qe=f.querySelector(':scope > .v7-q'); const box=f.querySelector('.v7-box');
        const ps=getComputedStyle(pill); const r1=pill.getBoundingClientRect(), r2=qe.getBoundingClientRect();
        out.push({k, text:pill.textContent, shown:r1.width>2&&r1.height>2, above:r1.bottom<=r2.top+1, sq:f.querySelectorAll('.v7-jd, .v7-q-dot').length, textC:cr(ps.color,ps.backgroundColor), edge:ps.boxShadow==='none'&&['Top','Right','Bottom','Left'].every(x=>ps['border'+x+'Style']==='solid'&&ps['border'+x+'Width']==='1px')&&ps.borderTopLeftRadius==='2px'&&cr(ps.borderTopColor,ps.backgroundColor)>=3, gold:pill.classList.contains('v9-pill-stakes')?[ps.borderTopColor,getComputedStyle(box).borderTopColor]:null, border:cr(getComputedStyle(box).borderTopColor,'rgb(255,255,255)'), w:getComputedStyle(box).borderTopWidth});});
      const tr=q('[data-f$="-translational"]'); const hl=q('[data-f$="-title"]');
      return {out, trPill:!!tr.querySelector('.v9-pill'), hlPill:!!hl.querySelector('.v9-pill')};`);
    check("Row 12, V9.5: each part has its name above its question as a part box (1px line of its colour all round, 3:1 or more on its tint, 2px corners, no stripe), and no small square before the question",
      r.out.every(x => x.shown && x.above && x.sq === 0 && x.edge) && r.out.map(x => x.text).join("|") === "The problem or question|Your role|What you did|What resulted|What already changed|What could change" && !r.trPill && !r.hlPill, r);
    check("Row 12: the pill's text is 4.5:1 or more against its fill, and every part's text box has an accent border of 3:1 or more against white (gold is #8a6200 on both, V9.5)",
      r.out.every(x => x.textC >= 4.5 && x.border >= 3) && r.out[0].gold && r.out[0].gold.every(c => c === "rgb(138, 98, 0)"), r.out.map(x => [x.k, +x.textC.toFixed(2), +x.border.toFixed(2)]));

    // C19, C20, C21: the suggestions
    await seed(mkState(), null, { raw: true });
    r = await js(PAGE_JS + `await w(250); const a={}; const box=(k)=>q('[data-f$="-'+k+'"] .v7-box'); const fl=(k)=>qa('[data-f$="-'+k+'"] .v4-flag').map(x=>x.textContent).join('|'); const st=(k)=>qa('[data-f$="-'+k+'"] .v4-strength').map(x=>x.textContent).join('|');
      const put=async(k,v)=>{ box(k).focus(); setv(box(k),v); await w(70); return fl(k); };
      a.list=await put('activities','1. Ran six made-up sessions.\\n2. Trained twelve made-up nurses.'); a.first=(q('.v7-first-note')||{}).textContent||''; a.firstIcon=!!q('.v7-first-note svg[aria-hidden="true"]');
      a.stakesRole=await put('stakes','I led the project to fix it in 2020.');
      a.we=await put('activities','We ran the pilot and our team collected the data in 2020.');
      a.passive=await put('activities','The protocol was developed over 2 years.');
      a.est=await put('activities','Hundreds of households took part in 2020.');
      a.noNum=await put('activities','I ran the pilot at the sites.'); a.noNumO=await put('outcomes','The clinics changed their practice.');
      a.several=await put('activities','I visited several sites in 2020.'); a.various=await put('activities','I won a well-received award in 2020.');
      a.prest=await put('outcomes','I won a prestigious award in 2020.'); a.jif=await put('outcomes','It appeared in a journal with a high impact factor in 2021.'); a.hidx=await put('outcomes','My h-index is 25 in 2021.');
      a.link=await put('outcomes','The data are at https://example.org/data from 2021.');
      a.hedgeS=await put('stakes','The gap could widen for 12 clinics.'); a.hedgeO=await put('outcomes','It might help 12 clinics in 2020.');
      a.w1=await put('activities','I worked on the survey in 2020.'); a.w2=await put('activities','Twelve community members worked on the translation over 2 years.'); a.w3=await put('activities','I worked on developing the dataset in 2020.');
      a.w4=await put('activities','I worked on housing policy for the city in 2020.'); a.w5=await put('activities','I was part of the team that ran the clinics in 2020.'); a.w6=await put('activities','I played a key role in the project in 2020.');
      a.w7=await put('activities','The Elders played a key role in shaping the questions in 2020.'); a.w8=await put('activities','I contributed to the analysis in 2020.'); a.w9=await put('outputs','I contributed to the analysis in 2020.');
      a.w10=await put('activities','I was instrumental in the program in 2020.'); a.w11=await put('activities','I had a hand in the survey in 2020.'); a.w12=await put('activities','Worked on the survey in 2020.');
      await put('roleLine','I led the made-up survey.'); a.s1=st('roleLine');
      await put('activities','I led 12 sessions and we ran 3 pilots in 2020.'); a.s2=st('activities');
      await put('impact','It could guide planning.'); a.s3=st('impact');
      a.mark=qa('.v4-flag .v9-flag-mark').length>0 && qa('.v4-flag').every(f=>f.querySelector('.v9-flag-mark')&&f.querySelector('.v9-flag-mark').getAttribute('aria-hidden')==='true') && !qa('.v4-flag').some(f=>/⚠/.test(f.textContent));
      a.markC=getComputedStyle(q('.v9-flag-mark')).backgroundColor;
      const tb=q('[data-f$="-title"] .v7-box'); tb.focus(); setv(tb,'one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen'); await w(70); a.head=(q('[data-f$="-title"] .v4-meta')||{}).textContent;
      return a;`);
    const M = (s, m) => (s || "").includes(m);
    check("C19: each suggestion has a neutral marker in the step's accent (hidden from screen readers) and no warning sign; the first-suggestion note is a hint; the headline note reads 'We recommend 15 or fewer.'",
      r.mark && r.markC === "rgb(145, 35, 56)" && /^Tip:\s*Suggestions are optional\. They do not check spelling or grammar\.$/.test(r.first.trim().replace(/\s+/g, " ")) && r.firstIcon && r.head === "16 words. We recommend 15 or fewer.", { mark: r.mark, c: r.markC, first: r.first, head: r.head });
    check("C20a, C20b: the list and role-like suggestions read as decided",
      M(r.list, "This reads as a list. Your contribution appears as one paragraph in your CV, so please write this part as sentences.") && M(r.stakesRole, "This sounds like you are explaining your role, which belongs in the next part. Please focus on the problem or question the work addressed."), { l: r.list, s: r.stakesRole });
    check("C20c, C20d: the 'we' and passive suggestions read as decided",
      M(r.we, "“we” or “our” appears 2 times, and your own part is not named yet. Please add what you did yourself.") && M(r.passive, "does not say who did the work. If it was you, please use “I”."), { we: r.we, p: r.passive });
    check("C20f, C20g, C20h: the estimate, no-numbers and vague-word suggestions read as decided",
      M(r.est, "is an estimate. If you have a specific total, please give it.") && M(r.noNum, "No numbers yet. If you have specific totals, please add them.") && M(r.noNumO, "No numbers yet. If you have a specific total for what changed, please add it.")
      && M(r.several, "“several” is vague. If you have a specific total, please give it.") && M(r.various, "“well-received” is vague. Please name the specific thing."), r);
    check("C20i, C20j, C20k, C20l: the prestige, journal-metric, h-index and TCV link suggestions read as decided",
      M(r.prest, "“prestigious” is an opinion. Please name the prize, journal or funder, and the year.") && M(r.jif, ": Tri-agency reviewers are asked to disregard the Journal Impact Factor and other journal-based metrics. Please say what the work changed.")
      && M(r.hidx, ": DORA (the San Francisco Declaration on Research Assessment) treats it as an unreliable measure of an individual’s work. Please cite the count for a single article or book instead.")
      && M(r.link, "Links are not permitted in the TCV. Please remove this one. SSHRC allows a link to an audio or visual work, added as evidence during Review."), r);
    check("C20m: the possibility suggestions read as decided (The problem or question, and the other parts)",
      M(r.hedgeS, "expresses a possibility. Please state the problem as it stood, or ask the question directly.") && M(r.hedgeO, "expresses a possibility. This part is about what has happened, so please state it plainly, or move the possibility to What could change."), r);
    check("C20e: a vague phrase is flagged after 'I', 'we', 'my team' or no subject, and not after another subject or before an -ing action word; the new phrases are flagged; 'contributed to' only on Your role and What you did",
      M(r.w1, "“worked on” does not say what you did. Please name the specific action.") && !M(r.w2, "worked on") && !M(r.w3, "worked on") && M(r.w4, "“worked on”") && M(r.w5, "“was part of”") && M(r.w6, "“played a key role in”")
      && !M(r.w7, "played a key role in") && M(r.w8, "“contributed to”") && !M(r.w9, "contributed to") && M(r.w10, "“was instrumental in”") && M(r.w11, "“had a hand in”") && M(r.w12, "“worked on”"), r);
    check("C21: the check-mark lines read as decided", r.s1 === "✓ Your own part is named." && /✓ Your own part and the team’s are both named\./.test(r.s2) && r.s3 === "✓ Cautious words suit this part.", { s1: r.s1, s2: r.s2, s3: r.s3 });

    // Q1 and the no-hand-written-samples source check
    {
      const src2 = fs.readFileSync(path.join(ROOT, "narrative-cv-prototype-v9.html"), "utf8");
      const code2 = src2.split("\n").filter(l => !/^\s*\/\//.test(l)).join("\n");
      const GONE = ["I led a team that developed the protocol", "The study produced a protocol and three papers", "The project produced a critical edition and two articles", "I directed and edited the film; a sound designer composed the score", "I prepared the edition with two research assistants",
        "The Elders’ council sets the questions", "such as “The cycle produced", "SHAPE_HINTS", "COMMUNITY_HINT", "How each part sounds in your field", "You start with your contributions.", "Clear your choice"];
      const left = GONE.filter(x => code2.includes(x));
      check("Q1, C2, row 4, C17: the hand-written samples, the cue lists, the removed line and the clear button are gone from the tool", left.length === 0, left);
    }

    // Community-engaged and creative wording
    await seed(mkState({ discipline: "creative", workMode: ["community"] }), null, { raw: true });
    r = await js(PAGE_JS + `await w(250); return {title:qq('title'), tg:gd('title'), role:gd('roleLine'), out:qq('outputs'), outg:gd('outputs'), outc:qq('outcomes'), imp:gd('impact'), act:qq('activities'), intro:(qa('.v9-intro p')[1]||{}).innerText||''};`);
    check("C5, C7, C8, C9, C10, C11: creative and community-engaged variants read as decided (body of work, partners' leadership with no hint, who owns it, art-form hint)",
      r.title === "What one line would help a reviewer remember this body of work?" && r.tg.hints.join() === "Tip: You will add the title of the exhibition or work as evidence during Review." && r.role.help === "Name your own part and the partners’ leadership." && r.role.hints.length === 0
      && r.out === "What did this work produce, and who owns it?" && r.outg.hints.join() === "Tip: For example, exhibitions, films, performances or published works." && r.outc === "Who has seen, used or responded to this work so far, and what was the impact?"
      && r.imp.hints.join() === "Tip: Influence on an art form, medium or practice counts: how it is made, taught, credited or funded." && /such as a body of work, a series of works, a program/.test(r.intro), r);
    await seed(mkState({ discipline: "humanities", workMode: ["solo"] }), null, { raw: true });
    r = await js(PAGE_JS + `await w(250); return {act:qq('activities'), outc:qq('outcomes'), og:gd('outcomes'), oh:gd('outputs')};`);
    check("C8, C10: the humanities questions and hint read as decided", r.act === "Which sources, archives, methods or partners did the work involve, and at what scale?" && r.outc === "Who has used or referenced this work so far, and what was the impact?" && r.og.hints.join() === "Tip: For example, scholars, archives, teachers or the public." && /books, editions, exhibitions, public works or collections/.test(r.oh.hints.join()), r);
    await seed(mkState({ discipline: "health", workMode: ["healthsystem"] }), null, { raw: true });
    r = await js(PAGE_JS + `await w(250); return {tg:gd('translational'), outc:qq('outcomes')};`);
    check("C10, C12: the health question is kept, and the real-use-case help for health carries the privacy line",
      r.outc === "Where has practice, care or policy changed because of this work, and for whom?" && r.tg.help === "Describe one real case in two sentences, such as a patient, clinic, classroom or committee that used the work. Leave out details that could identify a person, and name anyone only with their agreement.", r);

    // C14, C15, C16, C18, row 8
    const many = (n, extra) => Array.from({ length: n }, (_, i) => blankC("m" + i, Object.assign({ stakes: "A made-up gap " + i + ".", folded: i !== 0 }, extra && extra(i))));
    await seed(mkState({}, many(9)), null, { raw: true });
    r = await js(PAGE_JS + `await w(250); q('#v7-add-contrib').click(); await w(500); return {n:qa('.v7-card, .v7-fold').length, note:qa('.v4-help').map(x=>x.textContent).filter(t=>/limit/.test(t)), live:(q('#v7-live')||{}).textContent, add:!!q('#v7-add-contrib')};`);
    check("C14: the tenth contribution is announced with the limit; at 10 the note reads as decided and the Add button is gone", r.note.join() === "You have reached the limit of 10 contributions. To add another, please combine or remove one." && /Contribution 10 added\. You have reached the limit of 10\./.test(r.live || "") && !r.add, r);
    await seed(mkState({}, many(6)), null, { raw: true });
    r = await js(PAGE_JS + `await w(250); return {note:(q('.v7-select-note')||{}).textContent||'', hint:!!q('.v7-select-note.v9-hint'), close:qa('.v7-icon-btn').map(b=>b.getAttribute('aria-label')).filter(x=>/contribution/.test(x))};`);
    check("C15, C16: past five, the note is a hint with the decided words; the fold button is named 'Close contribution 1'", /^Tip:\s*You have 6 contributions\. We recommend completing the three or four most relevant to your application first\.$/.test(r.note.trim().replace(/\s+/g, " ")) && r.hint && r.close.indexOf("Close contribution 1") > -1, r);
    await seed(mkState({}, [blankC("rm1", { title: "Made-up flood atlas", stakes: "Made-up towns had no flood records.", activities: "We surveyed six towns." }), blankC("rm2")]), null, { raw: true });
    r = await js(PAGE_JS + `await w(250); q('[aria-label="Remove contribution 1"]').click(); await w(150); const wn=q('.v7-warn'); return {txt:wn.querySelector('p').textContent, btns:[...wn.querySelectorAll('.v7-warn-actions button')].map(b=>b.textContent)};`);
    check("C16: the remove confirm reads 'Remove contribution 1, “headline”? This deletes … words.' with Remove before Cancel", /^Remove contribution 1, “Made-up flood atlas”\? This deletes \d+ words\.$/.test(r.txt) && r.btns.join() === "Remove,Cancel", r);
    await seed(mkState({}, [blankC("p1", { stakes: "A made-up gap.", activities: "I ran 12 made-up sessions in 2020.", outputs: "A made-up report.", folded: false }), blankC("p2", { folded: true })]), null, { raw: true });
    r = await js(PAGE_JS + `await w(250); const a={}; a.h=q('.v7-strip-h b').textContent; a.join=(q('.v7-join-note')||{}).textContent||''; a.gap=qa('.v4-gap').length; a.heads=qa('.v7-strip-h b').map(b=>b.textContent); return a;`);
    check("C18: the strip is headed 'Paragraph so far'; the linking-words note is a hint; the two empty-part notes are gone", r.h === "Paragraph so far" && (!r.join || /^Tip:\s*Shaded words are suggested links and do not appear in your draft\.$/.test(r.join.trim().replace(/\s+/g, " "))) && r.gap === 0, r);
    await seed(mkState({}, [blankC("l1", { stakes: "A made-up gap.", activities: "I ran 12 sessions.", later: true, folded: true }), blankC("l2", { stakes: "Another made-up gap.", folded: true })]), null, { raw: true });
    r = await js(PAGE_JS + `await w(250); const a={}; const b=q('#ab-l1'); a.has=!!b; a.label=b&&b.textContent; a.aria=b&&b.getAttribute('aria-label'); a.note=!!q('.v7-later-note')||/does not print/.test(q('#v4-stage-content').textContent);
      b.click(); await w(250); const st=JSON.parse(localStorage.getItem('ncv-v9')); a.order=st.contributions.map(c=>c.cid+':'+!!c.later).join(); a.live=(q('#v7-live')||{}).textContent; a.gone=!q('#ab-l1'); return a;`);
    check("Row 8, row 6: a contribution set aside shows an 'Add back' button on Contributions, with no note; it returns the contribution to the order, last", r.has && r.label === "Add back" && /^Add back: /.test(r.aria) && !r.note && r.order === "l2:false,l1:false" && /added back, last in the order/.test(r.live || "") && r.gone, r);
  }

  console.log("Batch 6 (V9): Personal statement wording");
  {
    const base = () => Object.assign({}, JSON.parse(JSON.stringify(fixture)), { profileConfirmed: true, mode: "compose", stageKey: "ps", ui: { profileNote: false } });
    const mkPs = (lens, ps) => { const st = base(); st.lens = Object.assign({}, st.lens, { discipline: "social", discipline2: "", careerStage: "mid", workMode: ["team"], format: "tcv", agency: "sshrc", program: "Made-up Grant" }, lens || {}); st.ps = Object.assign({}, { role: "", institution: "", field: "", challenge: "", streams: "", pivot: "", standing: "", programFit: "", teamFit: "", horizon: "" }, ps || {}); return st; };
    const TEAM = "In this team, I lead the fieldwork: the ethnography of shift assignment and the partnership with the workers’ centre, which give the team access to the workplaces it studies.";
    const PJ = H + `const segText=(sp)=>{const c=sp.cloneNode(true); c.querySelectorAll('.v4-super').forEach(x=>x.remove()); return c.textContent.trim();};
      const gd=(k)=>{const g=q('[id="ps-'+k+'-hp"]'); return g?{help:[...g.querySelectorAll('.v7-explain:not(.v9-hint) p:not(.v9-sample)')].map(p=>p.textContent).join(' '), sample:(g.querySelector('.v9-sample')||{}).textContent||'', hints:[...g.querySelectorAll('.v9-hint')].map(h=>h.textContent.trim().replace(/\\s+/g,' '))}:{help:'',sample:'',hints:[]};};
      const qq=(k)=>((q('[data-f="ps-'+k+'"] .v7-q')||{}).textContent||'');
      const kk=(k)=>((q('[data-f="ps-'+k+'"] .v7-f-k')||{}).textContent||'');`;
    for (const frq of [false, true]) {
      await seed(mkPs(frq ? { format: "cv-frq", agency: "frq" } : {}), null, { raw: true });
      r = await js(PJ + `await w(250); const a={};
        a.lede=qa('#v4-stage-content .v7-lede').map(p=>p.innerText);
        if(!q('#v7-exbox')) q('#v7-ex-psx').click(); await w(150);
        a.title=q('#v7-exbox h4').innerText; a.match=q('.v7-match').innerText; a.foot=q('.v7-exfoot').innerText; a.legend=qa('.v7-legend span').map(s=>s.textContent); a.exText=q('.v7-exemplar').textContent;
        a.segJobs=qa('.v7-exemplar .v7-seg').map(s=>[...s.classList].find(c=>/^v7-seg-/.test(c)&&c!=='v7-seg')).filter(Boolean).map(c=>c.replace('v7-seg-',''));
        a.segs=qa('.v7-exemplar .v7-seg').filter(s=>/v7-seg-/.test(s.className.replace('v7-seg ',''))).map(segText);
        const keys=['challenge','streams','pivot','standing','programFit'].concat(${frq ? "['teamFit']" : "[]"}, ['horizon']);
        a.keys=keys; a.samples=keys.map(k=>gd(k).sample); a.pills=keys.map(k=>[...(q('[data-f="ps-'+k+'"] .v9-pill')||{classList:[]}).classList].find(c=>/^v9-pill-/.test(c))||'').map(c=>c.replace('v9-pill-',''));
        a.hasTeam=!!q('[data-f="ps-teamFit"]'); a.page=q('#v4-stage-content').textContent;
        a.card=q('#v7-ys-t').textContent; a.strip=q('.v7-strip-h b').textContent; a.colLabel=q('.v7-card-col nav')?.getAttribute('aria-label');
        a.anchor={k:kk('anchor'), q:qq('anchor')}; a.sub=!!q('.v7-card-sub');
        return a;`);
      const tag = frq ? " (CV-FRQ)" : " (TCV)";
      check("PS1: the step intro reads as decided" + tag + (frq ? ", with the CV-FRQ sentence" : ", with no CV-FRQ sentence"),
        r.lede[0] === "In this section, you will describe who you are and what connects your work. It appears first in your CV, and you write it last, because you will refer back to your contributions. For more information, please read what the first section asks for, TCV and CV-FRQ."
        && (frq ? r.lede.length === 2 && r.lede[1] === "For the CV-FRQ, this section also asks for your expertise for this opportunity or project, your fit with the program’s objectives and how your work complements the team." : r.lede.length === 1), r.lede);
      check("PS2: the example reads 'A finished personal statement', 'Written for a researcher in social sciences.' and the foot" + tag,
        r.title === "A finished personal statement" && r.match === "Written for a researcher in social sciences." && r.foot === (frq ? "This example is fictional. It includes a sentence for the CV-FRQ team question." : "This example is fictional."), r);
      check("PS9a, PS11: the example's legend names the parts as decided, and 'How you complement the team' with its sentence shows for the CV-FRQ only" + tag,
        r.legend.join("|") === (frq ? "The problem or question|Areas of research|Research trajectory|Recognition|Why this competition|How you complement the team|What’s next" : "The problem or question|Areas of research|Research trajectory|Recognition|Why this competition|What’s next")
        && r.exText.includes(TEAM) === frq && /Three areas of research address it/.test(r.exText) && !/Three strands/.test(r.exText), { legend: r.legend, has: r.exText.includes(TEAM) });
      check("Q1, PS9a: each statement question's sample is its part of the example" + (frq ? ", and the team question's sample is the team sentence" : "") + tag,
        r.samples.length === r.segs.length && r.samples.every((s, i) => s === "For example: “" + r.segs[i] + "”") && (!frq || r.samples[5] === "For example: “" + TEAM + "”"), { samples: r.samples.map(s => s.slice(0, 50)), segs: r.segs.map(s => s.slice(0, 50)) });
      check("Row 12: the statement fields' pills take the example's colours in order" + tag, r.pills.join() === r.segJobs.join() && r.pills.every(Boolean), { pills: r.pills, segs: r.segJobs });
      check("PS9: the team question exists for the CV-FRQ only" + tag, r.hasTeam === frq && (frq || !r.page.includes(TEAM)), r.hasTeam);
      check("PS3, PS12: the card is 'Personal statement questions', the strip 'Personal statement so far', the first part 'First sentence' with 'Please complete this sentence.', and the old line under the heading is gone" + tag,
        r.card === "Personal statement questions" && r.strip === "Personal statement so far" && r.colLabel === "Fields in Personal statement questions" && r.anchor.k === "First sentence" && r.anchor.q === "Please complete this sentence." && !r.sub, r);
      check("Areas of research: no 'strand' is left anywhere on the Personal statement step" + tag, !/strand/i.test(r.page), (r.page.match(/.{20}strand.{20}/i) || [])[0]);
    }

    // The questions, help and hints, TCV, social, mid-career, team
    await seed(mkPs({}, { challenge: "", streams: "" }), null, { raw: true });
    r = await js(PJ + `await w(250); const a={}; ['challenge','streams','pivot','standing','programFit','horizon'].forEach(k=>{a[k]={q:qq(k), k:kk(k), g:gd(k)};}); return a;`);
    check("PS4: the question and help read as decided (default)", r.challenge.q === "Across your research, what main problem or question do you keep returning to?" && r.challenge.g.help === "Please answer in one or two sentences. It can be a question, a problem or a theme." && r.challenge.k === "The problem or question", r.challenge);
    check("PS5: Areas of research: label, question, no help, the breadth hint",
      r.streams.k === "Areas of research" && r.streams.q === "What are the main areas of your research, and what connects them?" && r.streams.g.help === "" && r.streams.g.hints.join() === "Tip: If your areas are separate, you can describe that breadth as a strength.", r.streams);
    check("PS6: Research trajectory: label, question and the two hints",
      r.pivot.k === "Research trajectory" && r.pivot.q === "Please describe how you started working on this research question or theme." && r.pivot.g.hints.join("|") === "Tip: For example, a mentor, a discovery, a move from another field or an important collaboration.|Tip: If a leave or other interruption shaped your research trajectory, you can mention it here in one or two factual sentences. Leaves usually go in the application’s appendix, so please check your competition’s instructions and ask your research advisor.", r.pivot);
    check("PS7: Recognition: question, help, the kinds hint and the numbers hint",
      r.standing.q === "What are the strongest signs that others recognize your work?" && r.standing.g.help === "Please choose the most important recognitions. For each, describe what it is, who gave it and why, with any amount or number."
      && r.standing.g.hints[0] === "Tip: For example, grants, fellowships, awards, invitations to speak or review, or work that others adopted." && /^Tip: Numbers can show why a recognition stands out, for example, the amount/.test(r.standing.g.hints[1]), r.standing);
    check("PS8: Why this competition: question with the competition, help and hint",
      r.programFit.q === "Why does “Made-up Grant” (SSHRC) fit your work and your career stage?" && r.programFit.g.help === "Please describe your expertise for this specific opportunity or project." && r.programFit.g.hints.join() === "Tip: You can find what the competition funds and its objectives in its funding opportunity description.", r.programFit);
    check("PS10: What’s next: question, help and hint", r.horizon.q === "What are your plans or goals for the next phase of your research?" && r.horizon.g.help === "Please also describe how they connect to your current work." && r.horizon.g.hints.join() === "Tip: For example, a new question, site, population, method or partnership.", r.horizon);
    await seed(mkPs({ careerStage: "early", discipline: "creative", program: "" }), null, { raw: true });
    r = await js(PJ + `await w(250); return {c:qq('challenge'), s:qq('streams'), sg:gd('streams'), st:qq('standing'), stg:gd('standing'), pf:qq('programFit')};`);
    check("PS4, PS5, PS7, PS8: creative and early-career variants read as decided (creative wins the question, early adds its hints)",
      r.c === "What question does your body of work keep asking?" && r.s === "What are the main areas of your practice, and what connects them?" && r.sg.hints.join("|") === "Tip: If your areas are separate, you can describe that breadth as a strength.|Tip: If you changed field, you can name your earlier field as one area."
      && r.stg.hints[0] === "Tip: For example, work shown, performed or published, commissions, residencies, juried selections, critical reviews, grants or awards." && r.pf === "Which competition are you applying to, and why does it fit your work and your career stage?", r);
    await seed(mkPs({ careerStage: "early", discipline: "stem" }), null, { raw: true });
    r = await js(PJ + `await w(250); return {c:qq('challenge'), st:qq('standing'), stg:gd('standing')};`);
    check("PS4-r1, PS7: the early-career question is 'have started to work on'; the early recognition question and hint", r.c === "What main question or theme have you started to work on?" && r.st === "What are important signs of recognition you have so far?" && /^Tip: For example, grants, awards, licences/.test(r.stg.hints[0]), r);
    await seed(mkPs({ format: "cv-frq", agency: "frq", workMode: ["community"] }), null, { raw: true });
    r = await js(PJ + `await w(250); return {c:qq('challenge'), stg:gd('standing'), pf:gd('programFit'), tf:gd('teamFit'), tq:qq('teamFit')};`);
    check("PS4, PS7, PS8, PS9: the CV-FRQ and community wording; the team question's help and hint, with the old list hint gone",
      r.stg.help.endsWith("with any amount or number, and name your partners’ part.") && r.pf.help === "Please describe your expertise for this specific opportunity or project and your fit with the program’s objectives."
      && r.tq === "How does your work complement the rest of the team on this application?" && r.tf.help === "Please describe what you bring to the team." && r.tf.hints.join() === "Tip: If you are applying on your own, please describe how your work serves the program’s objectives."
      && !/a method, a site, a population/.test(r.tf.help + r.tf.hints.join()), r);

    // Areas of research, naming each area
    await seed(mkPs({}, {}), null, { raw: true });
    r = await js(PJ + `await w(250); const fs1=q('.v8-strand-fs'); const a={legend:fs1.querySelector('legend').textContent, line:fs1.querySelector('.v4-help').textContent, label:fs1.querySelector('label').textContent, add:[...fs1.querySelectorAll('button')].map(b=>b.textContent+'|'+(b.getAttribute('aria-label')||''))};
      setv(fs1.querySelector('input'),'Made-up area one'); await w(30); fs1.querySelectorAll('button').forEach(b=>{ if(/Add an area/.test(b.textContent)) b.click(); }); await w(60);
      a.label2=[...q('.v8-strand-fs').querySelectorAll('label')].map(l=>l.textContent); const rm=[...q('.v8-strand-fs').querySelectorAll('button')].find(b=>b.getAttribute('aria-label')==='Remove area 2'); if(rm) rm.click(); await w(80); a.live=(q('#v7-live')||{}).textContent; return a;`);
    check("PS13: the naming boxes read as decided: group, line, 'Area 1', '+ Add an area', 'Remove area 2', 'Area 2 removed.'",
      r.legend === "Name each area in a few words (optional)" && r.line === "On Review, you can mark the areas of each contribution and check that your contributions follow the order of these areas." && r.label === "Area 1"
      && r.add.some(x => x === "+ Add an area|") && r.label2.join() === "Area 1,Area 2" && /Area 2 removed\./.test(r.live || ""), r);

    // PS3: the hint and the read-only panel
    await seed(mkPs({}, {}), null, { raw: true });
    r = await js(PJ + `await w(250); const a={}; const h=q('.v9-ps-hint'); a.hint=h.querySelector('.v9-hint p').textContent.replace(/\\s+/g,' ').trim(); const b=q('#v9-ps-view'); a.btn=b.textContent; a.exp0=b.getAttribute('aria-expanded'); a.hid0=q('#v9-ps-panel').hidden;
      b.click(); await w(80); a.exp1=b.getAttribute('aria-expanded'); a.hid1=q('#v9-ps-panel').hidden; a.panel=q('#v9-ps-panel').innerText; a.ro=q('#v9-ps-panel').querySelectorAll('input,textarea,button').length;
      b.focus(); const ev=new KeyboardEvent('keydown',{key:'Escape',bubbles:true}); q('#v9-ps-panel').dispatchEvent(ev); await w(60); a.hid2=q('#v9-ps-panel').hidden; a.exp2=b.getAttribute('aria-expanded'); a.focus=document.activeElement.id; return a;`);
    check("PS3: the hint reads as decided with a 'View your contributions' button that opens a read-only panel (each headline and paragraph) and closes again with Escape",
      /^Tip: If you are having trouble with a question, reviewing your contributions may help\. View your contributions$/.test(r.hint) && r.btn === "View your contributions" && r.exp0 === "false" && r.hid0 && r.exp1 === "true" && !r.hid1 && /Contribution 1 · Made-up headline/.test(r.panel) && /Built a dataset/.test(r.panel) && r.ro === 0 && r.hid2 && r.exp2 === "false" && r.focus === "v9-ps-view", r);

    // PS14: the read across contributions
    {
      const mk = (t, x) => ({ cid: "px" + t, title: "Made-up " + t, stakes: "Scheduling for households " + x + " in the made-up town.", activities: "Scheduling records modelled " + x + ".", outputs: "", outcomes: "", impact: "", translational: "", roleLine: "I led it.", roleMode: "", evidence: [], flags: {}, notes: {} });
      const st = mkPs({}, {}); st.contributions = [mk("a", "one"), mk("b", "two"), mk("c", "three")];
      Object.assign(st.contributions[0], { outputs: "A made-up map.", outcomes: "Two made-up towns used the map.", impact: "It could guide planning.", noEvidenceYet: true });
      await seed(st);
      r = await js(PJ + `await w(250); const b=q('.v7-cross'); return b?{title:b.querySelector('.v7-cross-t').textContent, ps:[...b.querySelectorAll('p')].map(p=>p.textContent), aria:b.getAttribute('aria-label')}:null;`);
      check("PS14: the read across contributions is titled 'Words used in more than one contribution' with no number, its words on their own line, and no 'suggestion only' line",
        !!r && r.title === "Words used in more than one contribution" && r.aria === r.title && (!r.ps.length || (r.ps[0] === "These words may help you name your research problem or question:" && / · |^[a-z]+$/i.test(r.ps[1] || ""))) && !r.ps.some(p => /suggestion only|strands/.test(p)), r);
    }
  }

  console.log("Batch 8: the Review step (R1 to R10, R8a, R12, PS12, PS13)");
  {
    const stAt = (patch) => { const st = Object.assign({}, JSON.parse(JSON.stringify(fixture)), { profileConfirmed: true, mode: "compose", stageKey: "review", ui: { profileNote: false } }); patch(st); return st; };
    const mkC = (cid, x) => Object.assign(DONE(cid), { title: "Made-up " + cid }, x || {});
    const squash = `const sq=(t)=>String(t||'').replace(/\\s+/g,' ').trim();`;

    // R8: an old draft that holds "Media / public" loads as "Media coverage" and still counts as used; the new kinds sit in their columns.
    await seed(stAt(st => { st.contributions = [mkC("ra", { evidence: [{ text: "Made-up Gazette piece, 2025.", type: "Media / public", note: "" }] }), mkC("rb", { evidence: [{ text: "Made-up podcast series.", type: "Public talk or outreach", note: "" }] })]; }));
    r = await js(H + squash + `await w(200); q('#v8-tab-evidence').click(); await w(80);
      const cells=qa('[role=tabpanel] tbody tr').map(tr=>[...tr.querySelectorAll('td')].map(td=>sq(td.innerText)));
      return {cells, fact:q('#v8-fact').innerText, page:q('#v4-stage-content').innerText};`);
    check("R8: an old 'Media / public' item loads as 'Media coverage' in Where others used it, and counts as used", /^None yet/.test(r.cells[0][0]) && /^Media coverage Made-up Gazette piece/.test(r.cells[0][1]) && !/Media \/ public/.test(r.page), r.cells);
    check("R8: 'Public talk or outreach' counts as produced (What you produced), not as used by others", /^Public talk or outreach Made-up podcast series/.test(r.cells[1][0]) && /^None yet/.test(r.cells[1][1]) && r.fact === "Contribution 2 has no evidence that others used the work.", r);

    // EV-1 (R8a): the column an item is added under decides; with no stored column the kind decides.
    await seed(stAt(st => { st.contributions = [
      mkC("e1", { evidence: [{ text: "Made-up dataset.", type: "Dataset / tool", note: "", used: true }] }),
      mkC("e2", { evidence: [{ text: "Made-up news piece.", type: "Media coverage", note: "", used: false }] }),
      mkC("e3", { evidence: [{ text: "Made-up policy.", type: "Policy / practice uptake", note: "" }] }),
      mkC("e4", { evidence: [{ text: "Made-up paper.", type: "Peer-reviewed", note: "" }] })]; }));
    r = await js(H + squash + `await w(200); q('#v8-tab-evidence').click(); await w(80); const a={f0:q('#v8-fact').innerText};
      const add=(cid,used,kind,text)=>{ q('.v7-rqev-add[data-cid="'+cid+'"][data-used="'+used+'"]').click(); return w(80).then(()=>{ setsel(q('#v7-ev-kind'),kind); setv(q('#v7-ev-text'),text); qa('.v8-edrow .btn').find(b=>b.innerText==='Save').click(); return w(120); }); };
      const stored=(cid,t)=>{ const c=JSON.parse(localStorage.getItem('ncv-v9')).contributions.find(x=>x.cid===cid); const e=c.evidence.find(x=>x.text===t); return e ? e.used : 'missing'; };
      await add('e4','1','Dataset / tool','Made-up added dataset.'); a.f1=q('#v8-fact').innerText; a.s1=stored('e4','Made-up added dataset.');
      await add('e3','0','Media coverage','Made-up added coverage.'); a.s2=stored('e3','Made-up added coverage.'); a.f2=q('#v8-fact').innerText;
      a.cols=sq(q('.v7-rqev-tab tbody tr[data-cid="e3"]').innerText);
      q('#v8-tab-reach').click(); await w(80); a.reach=qa('[role=tabpanel] .v8-rc-w').map(x=>sq(x.innerText).match(/(No item shows yet|\\d+ items? shows?) that others used the work\\./)[0]);
      return a;`);
    check("EV-1: a Dataset / tool item with the used column stored counts as used; a Media coverage item stored as produced does not; no stored column falls back to the kind", r.f0 === "Contributions 2 and 4 have no evidence that others used the work.", r);
    check("EV-1: an item added on Review under 'Where others used it' stores used: true whatever its kind, and the status line follows", r.s1 === true && r.f1 === "Contribution 2 has no evidence that others used the work.", r);
    check("EV-1: an item added under 'What you produced' stores used: false, even for Media coverage; it does not count as used (the Reach tab agrees)", r.s2 === false && r.f2 === r.f1 && r.cols.indexOf("Made-up added coverage") > -1 && r.cols.indexOf("Made-up added coverage") < r.cols.indexOf("Made-up policy") && r.reach.join("|") === "1 item shows that others used the work.|No item shows yet that others used the work.|1 item shows that others used the work.|1 item shows that others used the work.", r);

    // EV-1b (Prem, 2026-11-26): "I want them to be able to change things or undo when they need to".
    const evCell = `const cell=(cid,n)=>sq(q('.v7-rqev-tab tbody tr[data-cid="'+cid+'"]').querySelectorAll('td')[n].innerText);
      const stored=(cid,t)=>{ const c=JSON.parse(localStorage.getItem('ncv-v9')).contributions.find(x=>x.cid===cid); const e=c.evidence.find(x=>x.text===t); return !e ? 'missing' : ('used' in e ? e.used : 'none'); };
      const save=()=>qa('.v8-edrow .btn').find(b=>b.innerText==='Save').click();
      const tdOf=(n)=>{ const td=n&&n.closest('td'); return td ? [...td.closest('tr').querySelectorAll('td')].indexOf(td) : -1; };`;
    await seed(stAt(st => { st.contributions = [
      mkC("m1", { evidence: [{ text: "Made-up paper.", type: "Peer-reviewed", note: "" }] }),
      mkC("m2", { evidence: [{ text: "Made-up guideline.", type: "Policy / practice uptake", note: "", used: true }] })]; }));
    r = await js(H + squash + evCell + `await w(200); q('#v8-tab-evidence').click(); await w(80); const a={};
      q('.v7-rqev-item[data-cid="m1"]').click(); await w(80);
      a.legend=sq(q('.v9-ev-col legend').innerText); a.opts=qa('.v9-ev-col label').map(l=>sq(l.innerText)); a.checked=(q('.v9-ev-col input:checked')||{}).id;
      a.named=qa('.v9-ev-col input').every(i=>i.type==='radio'&&i.labels.length===1); a.group=q('.v9-ev-col').tagName;
      setv(q('#v7-ev-text'),'Made-up paper, 2024.'); save(); await w(120); a.sText=stored('m1','Made-up paper, 2024.');
      q('.v7-rqev-item[data-cid="m1"]').click(); await w(80); q('#v9-ev-col-1').click(); save(); await w(150);
      a.moved=[cell('m1',0), cell('m1',1)]; a.s1=stored('m1','Made-up paper, 2024.'); a.focusTd=tdOf(document.activeElement); a.focusItem=document.activeElement.classList.contains('v7-rqev-item'); a.live=q('#v7-live').textContent;
      q('.v7-rqev-item[data-cid="m2"]').click(); await w(80); a.m2checked=(q('.v9-ev-col input:checked')||{}).id; setsel(q('#v7-ev-kind'),'Peer-reviewed'); save(); await w(120);
      a.kindKept=[cell('m2',0), cell('m2',1)]; a.s2=stored('m2','Made-up guideline.');
      return a;`);
    check("EV-1b: Review's evidence editor offers the column ('Column': What you produced · Where others used it) as labelled radio buttons, set to where the item is", r.group === "FIELDSET" && r.legend === "Column" && r.opts.join("|") === "What you produced|Where others used it" && r.named && r.checked === "v9-ev-col-0" && r.m2checked === "v9-ev-col-1", r);
    check("EV-1b: saving with only the details changed stores no column, so the item still follows its kind", r.sText === "none", r.sText);
    check("EV-1b: choosing Where others used it and Save moves the item there, stores the column, keeps focus on the item and says so", /^None yet/.test(r.moved[0]) && /Made-up paper, 2024/.test(r.moved[1]) && r.s1 === true && r.focusTd === 1 && r.focusItem && r.live === "Evidence saved for contribution 1, under Where others used it.", r);
    check("EV-1: changing the kind on Review keeps the item's column", /^None yet/.test(r.kindKept[0]) && /^Peer-reviewed Made-up guideline/.test(r.kindKept[1]) && r.s2 === true, r);

    await seed(stAt(st => { st.contributions = [mkC("u1", { evidence: [{ text: "Made-up atlas.", type: "Peer-reviewed", note: "" }, { text: "Made-up guideline.", type: "Policy / practice uptake", note: "" }] })]; }));
    r = await js(H + squash + evCell + `await w(200); q('#v8-tab-evidence').click(); await w(80); const a={};
      const evs=()=>JSON.parse(localStorage.getItem('ncv-v9')).contributions.find(x=>x.cid==='u1').evidence.map(e=>e.text);
      const rm=()=>qa('.v8-edrow .btn').find(b=>b.innerText==='Remove').click();
      q('.v7-rqev-item[data-cid="u1"][data-k="1"]').click(); await w(80); rm(); await w(150);
      a.n1=evs().length; a.focus=document.activeElement.id; a.row=sq((q('.v9-xundo')||{}).innerText); a.rowTd=tdOf(q('.v9-xundo')); a.live=q('#v7-live').textContent;
      q('#x-undo').click(); await w(150);
      a.order=evs().join('|'); a.focus2=document.activeElement.dataset ? document.activeElement.dataset.cid+'-'+document.activeElement.dataset.k : ''; a.live2=q('#v7-live').textContent; a.row2=!!q('.v9-xundo');
      q('.v7-rqev-item[data-cid="u1"][data-k="1"]').click(); await w(80); rm(); await w(150); a.u3=!!q('#x-undo');
      q('.v7-rqev-item[data-cid="u1"][data-k="0"]').click(); await w(80); save(); await w(150); a.u4=!!q('#x-undo');
      return a;`);
    check("EV-1b: Remove on Review leaves 'Evidence removed. Undo' in the item's column, with focus on Undo, and says Undo is available", r.n1 === 1 && r.focus === "x-undo" && r.row === "Evidence removed. Undo" && r.rowTd === 1 && r.live === "Evidence removed from contribution 1. Undo is available until your next change.", r);
    check("EV-1b: Undo on Review puts the item back in its place and column, with focus on it", r.order === "Made-up atlas.|Made-up guideline." && r.focus2 === "u1-1" && r.live2 === "Evidence restored for contribution 1." && !r.row2, r);
    check("EV-1b: saving another item ends the Undo on Review", r.u3 && !r.u4, r);

    await seed(stAt(st => { st.strands = [{ id: "sa", text: "Made-up area one" }, { id: "sb", text: "Made-up area two" }]; st.contributions = [mkC("a1", { strandIds: ["sb"] }), mkC("a2", { strandIds: ["sa", "sb"] })]; }));
    r = await js(H + squash + `await w(200); qa('.v8-strands button')[0].click(); await w(300); const a={};
      const st=()=>JSON.parse(localStorage.getItem('ncv-v9')); const ids=(cid)=>(st().contributions.find(c=>c.cid===cid).strandIds||[]).join(',');
      qa('button').find(b=>b.getAttribute('aria-label')==='Remove area 2').click(); await w(150);
      a.focus=document.activeElement.id; a.row=sq((q('.v9-xundo')||{}).innerText); a.place=[...q('.v8-strand-fs > div').children].map(n=>n.classList.contains('v9-xundo')?'U':n.classList.contains('v8-strand-row')?'R':'X').join('');
      a.s1=[st().strands.length, ids('a1'), ids('a2')].join('/'); a.live=q('#v7-live').textContent;
      q('#x-undo').click(); await w(250);
      a.s2=[st().strands.map(t=>t.id).join(','), ids('a1'), ids('a2')].join('/'); a.focus2=document.activeElement.id; a.live2=q('#v7-live').textContent;
      return a;`);
    check("EV-1b: removing a named area leaves 'Area 2, “Made-up area two”, removed. Undo' in its place, with focus on Undo; its marks go with it", r.focus === "x-undo" && r.row === "Area 2, “Made-up area two”, removed. Undo" && r.place.indexOf("RU") === 0 && r.s1 === "1//sa" && r.live === "Area 2 removed. Undo is available until your next change.", r);
    check("EV-1b: Undo puts the area back in its place with its marks on each contribution", r.s2 === "sa,sb/sb/sa,sb" && r.focus2 === "v8-strand-sb" && r.live2 === "Area 2 restored.", r);

    await seed(stAt(st => { st.stageKey = "mentor"; st.mentees = [
      { stageKind: "doctoral", stage: "Doctoral", kind: "industry", org: "Made-up firm A", unit: "", recognition: "", why: "now leads a made-up team", folded: false },
      { stageKind: "masters", stage: "Master's", kind: "public", org: "Made-up agency B", unit: "", recognition: "", why: "", folded: true }]; }));
    r = await js(H + squash + `await w(250); const a={};
      const orgs=()=>JSON.parse(localStorage.getItem('ncv-v9')).mentees.map(m=>m.org).join('|');
      qa('button').find(b=>b.getAttribute('aria-label')==='Remove person A').click(); await w(120); await okWarn(); await w(150);
      a.n1=orgs(); a.focus=document.activeElement.id; a.row=sq((q('.v9-xundo')||{}).innerText); a.next=sq(((q('.v9-xundo')||{}).nextElementSibling||{}).innerText).slice(0,40); a.live=q('#v7-live').textContent;
      q('#x-undo').click(); await w(250);
      a.n2=orgs(); const f=document.activeElement; a.focus2=(f.closest('[id^=v7-ph]')||f).id; a.live2=q('#v7-live').textContent;
      return a;`);
    check("EV-1b: removing a person with text leaves 'Person A removed. Undo' in their place, with focus on Undo", r.n1 === "Made-up agency B" && r.focus === "x-undo" && r.row === "Person A removed. Undo" && /Person A/.test(r.next) && r.live === "Person A removed. Undo is available until your next change.", r);
    check("EV-1b: Undo puts the person back in their place, open, with focus on their card", r.n2 === "Made-up firm A|Made-up agency B" && r.focus2 === "v7-ph0" && r.live2 === "Person A restored.", r);

    const delUndo = (cidTo) => H + squash + `await w(200); const a={};
      const cids=()=>JSON.parse(localStorage.getItem('ncv-v9')).contributions.map(c=>c.cid+(c.later?'*':'')).join(',');
      qa('.v7-odel').find(b=>b.getAttribute('aria-label')==='Delete: Made-up ${cidTo}').click(); await w(120); await okWarn(); await w(200);
      a.n1=cids(); a.focus=document.activeElement.id; a.row=sq((q('.v9-xundo')||{}).innerText); a.inLater=!!(q('.v9-xundo')&&q('.v9-xundo').closest('.v7-later')); a.live=q('#v7-live').textContent; a.stage=JSON.parse(localStorage.getItem('ncv-v9')).stageKey;
      const u=q('#x-undo')||q('#c-undo'); if (u) { u.click(); await w(250); }
      a.n2=cids(); a.focus2=document.activeElement.id; a.live2=q('#v7-live').textContent;
      return a;`;
    await seed(stAt(st => { st.contributions = [mkC("d1"), mkC("d2"), mkC("d3")]; }));
    r = await js(delUndo("d2"));
    check("EV-1b: Delete on Review's order leaves '“Made-up d2” deleted. Undo' above the order, with focus on Undo", r.n1 === "d1,d3" && r.focus === "x-undo" && r.row === "“Made-up d2” deleted. Undo" && !r.inLater && r.live === "“Made-up d2” deleted. Undo is available until your next change.", r);
    check("EV-1b: Undo puts the contribution back in its place in the order, with focus on its Save for later", r.n2 === "d1,d2,d3" && r.focus2 === "oa-d2" && r.live2 === "“Made-up d2” restored.", r);
    await seed(stAt(st => { st.contributions = [mkC("l1"), mkC("l2", { later: true })]; }));
    r = await js(delUndo("l2"));
    check("EV-1b: Delete in Saved for later offers Undo there, and Undo puts it back as saved for later", r.n1 === "l1" && r.focus === "x-undo" && r.row === "“Made-up l2” deleted. Undo" && r.n2 === "l1,l2*" && r.focus2 === "oa-l2", r);
    await seed(stAt(st => { st.contributions = [mkC("z1")]; }), null, { raw: true });
    r = await js(delUndo("z1"));
    check("EV-1b: deleting the only complete contribution on Review opens Contributions with its Undo line, which puts it back", r.stage === "contrib" && r.focus === "c-undo" && r.n2 === "z1", r);

    // V9.3: the rest of the tool checked against EV-1b.
    const cidsJs = `const cids=()=>(JSON.parse(localStorage.getItem('ncv-v9')||'{}').contributions||[]).map(c=>c.cid).join(',');`;
    await seed(stAt(st => { st.stageKey = "start"; st.contributions = [mkC("k1"), mkC("k2")]; }));
    r = await js(H + squash + cidsJs + `await w(250); const a={};
      q('.v7-path-reset').click(); await w(150); qa('.v7-warn .btn').find(b=>b.innerText==='Clear draft').click(); await w(300);
      a.c1=cids(); a.focus=document.activeElement.id; a.row=sq((q('.v9-xundo')||{}).innerText); a.live=q('#v7-live').textContent;
      q('#x-undo').click(); await w(300);
      a.c2=cids(); a.live2=q('#v7-live').textContent; a.card2=(q('.v7-path-new h2')||{}).innerText; a.row2=!!q('.v9-xundo');
      return a;`);
    check("V9.3: Clear draft leaves 'Draft cleared. Undo' on the start page, with focus on Undo", !/k1/.test(r.c1) && r.focus === "x-undo" && r.row === "Draft cleared. Undo" && r.live === "Draft cleared. Undo is available until your next change.", r);
    check("V9.3: Undo brings the cleared draft back", r.c2 === "k1,k2" && r.live2 === "Draft restored." && /^Continue/.test(r.card2 || "") && !r.row2, r);

    const fileB = JSON.stringify({ format: "pathways-narrative-cv-draft", version: 1, draft: Object.assign({}, JSON.parse(JSON.stringify(fixture)), { profileConfirmed: true, stageKey: "contrib", mode: "compose", contributions: [DONE("f1")] }) });
    await seed(stAt(st => { st.stageKey = "start"; st.contributions = [mkC("k1"), mkC("k2")]; }));
    r = await js(H + squash + cidsJs + `await w(250); const a={};
      const ic=HTMLInputElement.prototype.click;
      HTMLInputElement.prototype.click=function(){ if(this.type==='file'){const dt=new DataTransfer(); dt.items.add(new File([${JSON.stringify(fileB)}],'d.json',{type:'application/json'})); this.files=dt.files; this.dispatchEvent(new Event('change'));} };
      q('.v7-path-cont').click(); await w(150); await okWarn(); await w(300); HTMLInputElement.prototype.click=ic;
      a.c1=cids(); a.row=sq((q('.v9-xundo')||{}).innerText); a.afterBanner=!!(q('.v9-xundo')&&q('.v9-xundo').previousElementSibling&&q('.v9-xundo').previousElementSibling.classList.contains('narrative-session-banner')); a.live=q('#v7-live').textContent;
      q('#x-undo').click(); await w(300);
      a.c2=cids(); a.live2=q('#v7-live').textContent;
      return a;`);
    check("V9.3: opening a backup file over a draft offers Undo under the banner and says so", r.c1 === "f1" && r.row === "Your previous draft was replaced. Undo" && r.afterBanner && /opened\..* Undo is available until your next change\.$/.test(r.live), r);
    check("V9.3: Undo brings back the draft that was open before the file", r.c2 === "k1,k2" && r.live2 === "Previous draft restored.", r);

    await seed(null);
    r = await js(H + `q('.v7-path-new').click(); await w(150); const a={};
      q('#ag-sshrc').click(); await w(150); const c=q('#v7-comp'); c.focus(); setv(c,'Made-up Grants'); c.blur(); await w(60);
      q('#v7-undecided').click(); await w(150); a.emptied=q('#v7-comp').value;
      q('#v7-undecided').click(); await w(150); a.back=q('#v7-comp').value; a.pressed=q('#v7-undecided').getAttribute('aria-pressed'); a.saved=JSON.parse(localStorage.getItem('ncv-v9')).lens.program;
      return a;`);
    check("V9.3: on Set up, pressing Undecided again brings back the competition it emptied", r.emptied === "" && r.back === "Made-up Grants" && r.pressed === "false" && r.saved === "Made-up Grants", r);
    await seed(stAt(st => { st.stageKey = "contrib"; st.lens = Object.assign({}, st.lens, { program: "Made-up Insight Grant", undecided: false }); }));
    r = await js(H + `await w(250); q('#v7-chg').click(); await w(150); const a={};
      const und=qa('.v7-chg .v7-mini').find(b=>b.innerText==='Undecided');
      und.click(); await w(60); a.emptied=q('#v7-chg-comp').value; und.click(); await w(60); a.back=q('#v7-chg-comp').value;
      qa('#v7-chg-panel .btn-primary').find(b=>b.innerText==='Confirm').click(); await w(200); a.saved=JSON.parse(localStorage.getItem('ncv-v9')).lens.program;
      return a;`);
    check("V9.3: in the Change panel, pressing Undecided again brings back the competition it emptied", r.emptied === "" && r.back === "Made-up Insight Grant" && r.saved === "Made-up Insight Grant", r);

    await seed(stAt(st => { st.strands = [{ id: "sa", text: "Made-up area one" }, { id: "sb", text: "Made-up area two" }]; st.contributions = [mkC("n1", { strandIds: ["sa", "sb"] })]; }));
    r = await js(H + `await w(250); const a={};
      const ids=()=>(JSON.parse(localStorage.getItem('ncv-v9')).contributions.find(c=>c.cid==='n1').strandIds||[]).join(',');
      q('.v8-mark[data-cid="n1"][data-s=none]').click(); await w(80); a.none=ids();
      q('.v8-mark[data-cid="n1"][data-s=none]').click(); await w(80); a.back=ids(); a.pressed=['sa','sb','none'].map(s=>q('.v8-mark[data-cid="n1"][data-s='+s+']').getAttribute('aria-pressed')).join(',');
      return a;`);
    check("V9.3: pressing None of these again brings back the areas it cleared", r.none === "" && r.back === "sa,sb" && r.pressed === "true,true,false", r);

    await seed(stAt(st => { st.stageKey = "export"; st.contributions = [mkC("x1")];
      st.ps = Object.assign({}, st.ps, { role: "Assistant professor", institution: "Made-up University", field: "sociology" });
      st.mentorCounts = Object.assign({}, st.mentorCounts, { phd: "3" });
      st.mentees = [{ stageKind: "doctoral", stage: "Doctoral", kind: "industry", org: "Made-up firm A", unit: "", recognition: "", why: "now leads a made-up team", folded: false }]; }));
    r = await js(H + `await w(300); const a={};
      a.labels=qa('.v8-edoc .v9-fix-go').map(b=>b.innerText+'|'+b.getAttribute('aria-label'));
      const go=async(re)=>{ const b=qa('.v8-edoc .v9-fix-go').find(x=>re.test(x.getAttribute('aria-label'))); b.click(); await w(350); const st=JSON.parse(localStorage.getItem('ncv-v9')).stageKey; const f=document.activeElement; const out=[st, f.id||'', f.tagName]; rail('Export').click(); await w(300); return out; };
      a.first=await go(/first sentence/); a.ev=await go(/evidence of contribution 1/); a.tot=await go(/totals/); a.person=await go(/person A/);
      return a;`);
    check("V9.3: each sentence the tool writes on Export has an Edit button named for what it opens", r.labels.length === 4 && r.labels.every(l => /^Edit\|Edit /.test(l)) && r.labels.some(l => /^Edit\|Edit the first sentence on (Personal statement|Background and skills)$/.test(l)) && r.labels.indexOf("Edit|Edit the evidence of contribution 1 on Contributions") > -1 && r.labels.indexOf("Edit|Edit the totals on Mentorship") > -1 && r.labels.indexOf("Edit|Edit person A on Mentorship") > -1, r.labels);
    check("V9.3: Edit opens the answer each sentence is written from (first sentence, evidence, totals, person)", r.first[0] === "ps" && /INPUT|TEXTAREA|DIV|BUTTON/.test(r.first[2]) && r.ev[0] === "contrib" && /^evt/.test(r.ev[1]) && r.tot[0] === "mentor" && r.tot[1] === "v7-t-postdoc" && r.person[0] === "mentor" && r.person[1] === "v7-ps0", r);

    // V9.5 (ST-1a): every part colour is a part box: tint, a 1px line of its colour all round, 2px corners, no stripe.
    const PB = `const rgbA=(c)=>(c.match(/[\\d.]+/g)||[]).slice(0,3).map(Number); const Lm=(c)=>{const v=rgbA(c).map(x=>{x/=255;return x<=0.03928?x/12.92:Math.pow((x+0.055)/1.055,2.4);});return 0.2126*v[0]+0.7152*v[1]+0.0722*v[2];};
      const crt=(a,b)=>{const x=Lm(a),y=Lm(b);return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05);};
      const audit=(sel)=>qa(sel).filter(e=>e.getClientRects().length).map(e=>{ const cs=getComputedStyle(e); const sides=['Top','Right','Bottom','Left'];
        const stripe=/\\) [1-9]\\d*(\\.\\d+)?px 0px 0px 0px inset/.test(cs.boxShadow); const all=sides.every(x=>cs['border'+x+'Style']!=='none'&&cs['border'+x+'Width']===cs.borderTopWidth);
        return {c:(e.className||'').toString().slice(0,40), stripe, all, w:cs.borderTopWidth, rad:parseFloat(cs.borderTopLeftRadius), line:+crt(cs.borderTopColor, cs.backgroundColor==='rgba(0, 0, 0, 0)'?'rgb(255,255,255)':cs.backgroundColor).toFixed(2), bdb:cs.boxDecorationBreak||cs.webkitBoxDecorationBreak}; });`;
    await seed(stAt(st => { st.stageKey = "contrib"; st.contributions = [mkC("p1"), mkC("p2", { impact: "", folded: true })]; }));
    r = await js(H + PB + `await w(250); const a={}; const b=qa('button').find(x=>/finished example/i.test(x.innerText)); b.click(); await w(400);
      a.pills=audit('.v9-pill'); a.segs=audit('.built .v7-exemplar .v7-seg[class*="v7-seg-"]'); a.leg=audit('.v7-legend span');
      const m=q('.v7-fold .v8-mini'); a.on=[...m.querySelectorAll('i.on')].map(i=>{const cs=getComputedStyle(i); return [cs.backgroundColor===cs.borderTopColor, +crt(cs.backgroundColor, getComputedStyle(i.closest('.v7-fold')).backgroundColor).toFixed(2)];});
      a.off=[...m.querySelectorAll('i:not(.on)')].map(i=>[getComputedStyle(i).borderTopStyle, getComputedStyle(i).backgroundColor]);
      return a;`);
    const okBox = (x) => !x.stripe && x.all && x.w === "1px" && x.rad <= 2 && x.line >= 3;
    check("V9.5: the part names, the example's sentences and its legend are part boxes: a 1px line of the part's colour all round (3:1 or more on the tint), 2px corners, no stripe", r.pills.length >= 6 && r.segs.length >= 6 && r.leg.length >= 6 && [...r.pills, ...r.segs, ...r.leg].every(okBox), { pills: r.pills.filter(x => !okBox(x)), segs: r.segs.filter(x => !okBox(x)), leg: r.leg.filter(x => !okBox(x)) });
    check("V9.5: a sentence of the example keeps one box across the lines it wraps (slice), so the passage reads as one paragraph", r.segs.every(x => x.bdb === "slice"), r.segs.map(x => x.bdb));
    check("V9.5: on a folded contribution a written part is a solid square of its colour (3:1 or more on the card) and a part not yet written is white with a dashed line", r.on.length >= 5 && r.on.every(x => x[0] && x[1] >= 3) && r.off.length >= 1 && r.off.every(x => x[0] === "dashed" && x[1] === "rgb(255, 255, 255)"), r);

    await seed(stAt(st => { st.contributions = [mkC("q1"), mkC("q2")]; st.ui = Object.assign({}, st.ui, { reviewTab: "words" }); }));
    r = await js(H + PB + `await w(250); q('#v8-tab-words').click(); await w(150); const a={};
      a.blocks=audit('.v8-bar .v8-eb-block:not(.is-empty)'); a.leg=qa('.v8-leg i').map(i=>{const r=i.getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)];});
      const bl=qa('.v8-bar .v8-eb-block:not(.is-empty)'); a.rest=getComputedStyle(bl[1]).boxShadow;
      bl[0].click(); await w(250); a.open=getComputedStyle(bl[0]).boxShadow; a.openExp=bl[0].getAttribute('aria-expanded');
      bl[1].scrollIntoView({block:'center'}); await w(150); const r0=bl[1].getBoundingClientRect(); a.pt=[r0.left+r0.width/2, r0.top+r0.height/2]; return a;`);
    await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: r.pt[0], y: r.pt[1] }); await sleep(250);
    const hov = await js(H + `return getComputedStyle(qa('.v8-bar .v8-eb-block:not(.is-empty)')[1]).boxShadow;`);
    await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 2, y: 2 });
    check("V9.5: word-bar blocks are part boxes; the legend marks are small blocks (wider than tall), not squares", r.blocks.length >= 10 && r.blocks.every(okBox) && r.leg.length >= 5 && r.leg.every(([w, h]) => w > h + 4), { bad: r.blocks.filter(x => !okBox(x)), leg: r.leg });
    check("V9.5: a block at rest has a 1px line, on hover 2px, and the open block 3px, so the open one stands out from the others", r.rest === "none" && /0px 0px 0px 1px inset/.test(hov) && /0px 0px 0px 2px inset/.test(r.open) && r.openExp === "true", { rest: r.rest, hov, open: r.open });

    // Forced colours (Windows high contrast): the open block keeps a mark; the example's legend is not labelled twice; written squares stay filled.
    await send("Emulation.setEmulatedMedia", { features: [{ name: "forced-colors", value: "active" }] }); await sleep(200);
    r = await js(H + `await w(150); const a={}; const bl=qa('.v8-bar .v8-eb-block:not(.is-empty)'); a.restW=getComputedStyle(bl[1]).borderTopWidth; a.openW=getComputedStyle(bl[0]).borderTopWidth; return a;`);
    await seed(stAt(st => { st.stageKey = "contrib"; st.contributions = [mkC("p1"), mkC("p2", { impact: "", folded: true })]; }));
    const fc = await js(H + `await w(250); const b=qa('button').find(x=>/finished example/i.test(x.innerText)); b.click(); await w(400); const a={};
      a.legBefore=qa('.v7-legend span').map(s=>getComputedStyle(s,'::before').content); a.segBefore=qa('.v7-exemplar .v7-seg[class*="v7-seg-"]').map(s=>getComputedStyle(s,'::before').content);
      const on=q('.v7-fold .v8-mini i.on'), off=q('.v7-fold .v8-mini i:not(.on)'); a.sq=[getComputedStyle(on).backgroundColor, getComputedStyle(off).backgroundColor]; return a;`);
    await send("Emulation.setEmulatedMedia", { features: [] });
    check("V9.5, forced colours: the open block takes a 3px line (the others 1px), so it is still marked when colours are replaced", r.openW === "3px" && r.restW === "1px", r);
    check("V9.5, forced colours: the example's sentences start with their part's name in brackets and its legend is not labelled twice", fc.segBefore.length >= 6 && fc.segBefore.every(c => /^"\[/.test(c)) && fc.legBefore.every(c => c === "none" || c === "normal"), fc);
    check("V9.5, forced colours: a written part on a folded contribution stays filled, and a part not yet written stays empty", fc.sq[0] !== fc.sq[1] && fc.sq[0] !== "rgba(0, 0, 0, 0)", fc.sq);

    // Phone, with the WCAG 1.4.12 text spacing: no word-bar block cuts off its number.
    await send("Emulation.setDeviceMetricsOverride", { width: 320, height: 720, deviceScaleFactor: 2, mobile: true });
    await seed(stAt(st => { st.contributions = [mkC("q1"), mkC("q2", { impact: "Made-up short." })]; st.ui = Object.assign({}, st.ui, { reviewTab: "words" }); }));
    r = await js(H + `await w(250); q('#v8-tab-words').click(); await w(150); const s=document.createElement('style'); s.textContent='* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-bottom: 2em !important; }'; document.head.appendChild(s); await w(300);
      const bl=qa('.v8-bar .v8-eb-block:not(.is-empty)'); const cut=bl.filter(b=>b.scrollWidth>b.clientWidth+1||b.scrollHeight>b.clientHeight+1).map(b=>b.getAttribute('aria-label')); s.remove(); return {n:bl.length, cut, sw:document.documentElement.scrollWidth};`);
    await send("Emulation.setDeviceMetricsOverride", { width: 1180, height: 900, deviceScaleFactor: 1, mobile: false });
    check("V9.5: on a phone with WCAG text spacing, no word-bar block cuts off its number", r.n >= 10 && r.cut.length === 0 && r.sw <= 320, r);

    // V9.6 (ST-3): corners follow concordia.ca (0 to 4px). Fields and notes 0, buttons, tags and editable boxes 2px,
    // cards and panels 4px; only true circles (the pencil disc, number badges) are round.
    {
      const scanC = H + `const vis=(e)=>{const r=e.getBoundingClientRect(), s=getComputedStyle(e); return r.width>0&&r.height>0&&s.visibility!=='hidden'&&s.display!=='none';};
        const px=(v,ref)=>{ v=String(v).trim().split(/\\s+/)[0]; return v.endsWith('%')?parseFloat(v)/100*ref:parseFloat(v)||0; };
        const bad=[]; const look=(e,cs,w,h,p)=>{ const m=Math.max(...['TopLeft','TopRight','BottomRight','BottomLeft'].map(k=>px(cs['border'+k+'Radius'],Math.min(w,h)))); if(m<=4.01) return; if(Math.abs(w-h)<=2.5&&m>=Math.min(w,h)/2-1.5) return; bad.push((e.className||e.tagName).toString().slice(0,40)+(p||'')+' '+cs.borderTopLeftRadius); };
        qa('body *').forEach(e=>{ if(vis(e)){ const r=e.getBoundingClientRect(); look(e,getComputedStyle(e),r.width,r.height); } ['::before','::after'].forEach(p=>{ const cs=getComputedStyle(e,p); if(!cs.content||cs.content==='none'||cs.display==='none') return; const w=parseFloat(cs.width)||0,h=parseFloat(cs.height)||0; if(w&&h) look(e,cs,w,h,p); }); });
        return bad;`;
      const stg = (k, ui) => Object.assign({}, fixture, { stageKey: k, mode: "compose", profileConfirmed: true, ui: Object.assign({}, fixture.ui || {}, { profileNote: false }, ui || {}) });
      const over = [];
      for (const vp of [[1180, 900, false], [320, 720, true]]) {
        await send("Emulation.setDeviceMetricsOverride", { width: vp[0], height: vp[1], deviceScaleFactor: vp[2] ? 2 : 1, mobile: vp[2] });
        for (const s of [null, stg("start"), stg("setup"), stg("contrib"), stg("mentor"), stg("ps"), stg("review", { reviewTab: "words" }), stg("review", { reviewTab: "evidence" }), stg("review", { reviewTab: "order" }), stg("export")]) {
          await seed(s); await js(H + `await w(250);`);
          if (s && s.stageKey === "contrib") await js(H + `const b=q('.v7-ex-btn'); if(b){b.click(); await w(350);}`);
          if (s && s.ui.reviewTab === "words") await js(H + `const b=q('.v8-bar .v8-eb-block'); if(b){b.click(); await w(300);}`);
          for (const b of await js(scanC)) over.push((s ? s.stageKey + (s.ui.reviewTab ? "/" + s.ui.reviewTab : "") : "new") + "@" + vp[0] + ": " + b);
        }
      }
      await send("Emulation.setDeviceMetricsOverride", { width: 1180, height: 900, deviceScaleFactor: 1, mobile: false });
      check("V9.6 (ST-3): no corner over 4px on any screen, at desktop and phone width, except true circles", over.length === 0, over.slice(0, 12));
      await seed(stg("contrib"));
      r = await js(H + `await w(250); const b=q('.v7-ex-btn'); if(b){b.click(); await w(350);} const g=(s,p)=>{const e=q(s); return e?getComputedStyle(e,p).borderTopLeftRadius:'missing';};
        const f=qa('.v7-ans')[0]; if(f){f.click(); await w(300);}
        return {field:g('textarea.v7-box'), note:g('.v7-explain'), btn:g('.btn'), card:g('.v7-card'), example:g('.v7-exbox'), pill:g('.v9-pill'), steps:g('.narrative-progress-panel'), disc:g('.v8-eb','::after')};`);
      check("V9.6 (ST-3): a field and a note have square corners, a button and a part name 2px, a card, the example and the step list 4px", r.field === "0px" && r.note === "0px" && r.btn === "2px" && r.pill === "2px" && r.card === "4px" && r.example === "4px" && r.steps === "4px", r);
      await seed(stg("review", { reviewTab: "words" }));
      r = await js(H + `await w(250); const e=q('.v8-person.v8-eb')||q('.v8-eb'); return {box:getComputedStyle(e).borderTopLeftRadius, disc:getComputedStyle(e,'::after').borderTopLeftRadius};`);
      check("V9.6 (ST-3): an editable box has 2px corners and its pencil disc stays round", r.box === "2px" && r.disc === "50%", r);
    }

    // R-1 (R8a) and R7: the role status counts written role sentences and names a contribution with a level and no sentence.
    await seed(stAt(st => { st.contributions = [mkC("r1", { roleMode: "led" }), mkC("r2", { roleMode: "coled", roleLine: "" }), mkC("r3", { roleMode: "part", roleLine: "" })]; }));
    r = await js(H + squash + `await w(200); q('#v8-tab-role').click(); await w(80); return {tab:q('#v8-tab-role').innerText, q:q('#v8-rb-q').innerText, fact:q('#v8-fact').innerText, how:sq(q('.v8-how').innerText), lines:qa('.v8-roleline').map(p=>sq(p.innerText))};`);
    check("R-1: the role status counts the written role sentences and names the contributions with a level and no sentence", r.fact === "You led 1. Contributions 2 and 3 have no role sentence yet.", r.fact);
    check("R7: tab 'Edit role', 'Is your role clear in each contribution?', 'If a role is not right, please change it here.', 'Your role is not written yet.'", r.tab === "Edit role" && r.q === "Is your role clear in each contribution?" && /^If a role is not right, please change it here\./.test(r.how) && /^Your role is not written yet\. Edit on Contributions$/.test(r.lines[1]), r);
    await seed(stAt(st => { st.contributions = [mkC("r1"), mkC("r2")]; }));
    r = await js(H + `await w(200); q('#v8-tab-role').click(); await w(80); return q('#v8-fact').innerText;`);
    check("R-1: role sentences on both and no level chosen name no contribution", r === "No role is chosen yet.", r);

    // R9 and R-2: tab and column names; a contribution with boxes ticked under a part with no text is named.
    await seed(stAt(st => { st.contributions = [mkC("g1", { changed: { who: ["people"], what: [] } }), mkC("g2", { outcomes: "", changed: { who: ["org"], what: ["practice"] } })]; }));
    r = await js(H + squash + `await w(200); q('#v8-tab-reach').click(); await w(80); return {tab:q('#v8-tab-reach').innerText, fact:q('#v8-fact').innerText, heads:[...new Set(qa('.v8-rc-h').map(h=>h.innerText))]};`);
    check("R9: tab 'Check changes', 'You marked changes on 2 of 2 contributions.', columns 'Already changed' · 'Could change' · 'Words and evidence'", r.tab === "Check changes" && /^You marked changes on 2 of 2 contributions\./.test(r.fact) && r.heads.join("|").toLowerCase() === "already changed|could change|words and evidence", r);
    check("R-2: a contribution with changes marked under What already changed and no text there is named", r.fact === "You marked changes on 2 of 2 contributions. Contribution 2 has changes marked under What already changed, which is not written yet.", r.fact);

    // R5, R6, R4: question, tab, statements and areas; PS12 and PS13: no 'strand' is visible anywhere on Review.
    await seed(stAt(st => { st.strands = [{ id: "sa", text: "Made-up area one" }, { id: "sb", text: "Made-up area two" }]; st.contributions = [mkC("o1", { strandIds: ["sb"] }), mkC("o2", { strandIds: ["sa"] }), mkC("o3", { strandNone: true }), mkC("o4")]; }));
    r = await js(H + squash + `await w(200); const a={}; const seen=()=>qa('#v4-stage-content *').map(e=>[e.innerText&&e.children.length===0?e.innerText:'', e.getAttribute('aria-label')||'', e.title||'', e.placeholder||''].join(' ')).join(' ');
      a.h=q('.narrative-stage-header h2').innerText; a.board=q('#v8-rb-t').innerText; a.q=q('#v8-rb-q').innerText; a.fact=qa('#v8-fact p').map(p=>p.innerText); a.how=sq(q('.v8-how').innerText); a.line=sq(q('.v8-strands').innerText);
      a.group=q('.v8-marks').getAttribute('aria-label'); a.tag=''; a.ow=qa('.v7-ow').map(x=>x.innerText); a.stHead=q('#v8-rb-st-t').innerText; a.tgl=q('#v8-rb-tog').getAttribute('aria-label');
      let all=seen(); ['words','role','evidence','reach'].forEach(id=>{ q('#v8-tab-'+id).click(); all+=' '+seen(); }); a.tags=qa('.v8-tag').map(t=>t.innerText).join('|'); a.noStrand=!/strand/i.test(all); a.hit=(all.match(/.{20}strand.{20}/i)||[])[0];
      q('#v8-tab-words').click(); await w(60); a.wq=q('#v8-rb-q').innerText; a.wtab=q('#v8-tab-words').innerText; a.legend=sq(q('.v8-leg').textContent);
      a.mentor=q('#v8-rm-t')?q('#v8-rm-t').innerText:'';
      return a;`);
    check("R5: the Order question, the areas line, the comparison, the group name and the tag use 'areas'", /^Does the order of your contributions follow your (personal statement|background and skills)\?$/.test(r.q) && /^Areas of research: “Made-up area one”, “Made-up area two”\. Edit on /.test(r.line) && r.group === "Areas for contribution 1" && /No area/.test(r.tags) && r.how === "Please mark the areas of each contribution. See " + (/Background/i.test(r.stHead) ? "background and skills" : "personal statement"), r);
    check("R5: the fact line names the first break in the order of the areas, 'None of these' and a contribution with no area marked", r.fact[0] === "In your areas, “Made-up area one” comes before “Made-up area two”. Contribution 1 is marked “Made-up area two” and contribution 2 is marked “Made-up area one”. Contribution 3 is marked “None of these”. Contribution 4 has no area marked yet.", r.fact);
    check("R5: an order card reads 'x words · about n% of 5 pages · n evidence item(s)'", r.ow.length >= 4 && r.ow.every(t => /^[\d,]+ words? · (about \d+%|under 1%) of 5 pages · \d+ evidence items?$/.test(t)), r.ow);
    check("PS12, PS13: the statement panel is named 'Personal statement' (or 'Background and skills'), its toggle is 'Hide ...' for screen readers, and no 'strand' shows on any Review tab, in a label or a tooltip", /^(Personal statement|Background and skills)$/i.test(r.stHead) && /^Hide (personal statement|background and skills)$/.test(r.tgl) && r.noStrand, r.hit || r);
    check("R4, R6: the board is 'Five questions about the draft'; the Words tab is 'Edit what already changed' and keeps its question", r.board === "Five questions about the draft" && r.wtab === "Edit what already changed" && r.wq === "Does each contribution say what already changed?", r);
    check("R12: the optional part is called 'A real use case (optional)' on Review, where it was 'One moment'", /A real use case \(optional\)/.test(r.legend) && !/One moment/.test(r.legend), r.legend);

    // R5 order check with areas in order, and the not-yet states.
    await seed(stAt(st => { st.strands = [{ id: "sa", text: "Made-up area one" }, { id: "sb", text: "Made-up area two" }]; st.contributions = [mkC("o1", { strandIds: ["sa"] }), mkC("o2", { strandIds: ["sb"] })]; }));
    r = await js(H + `await w(200); return qa('#v8-fact p').map(p=>p.innerText);`);
    check("R5: contributions in the order of the areas read 'Your contributions follow the order of your areas.'", r[0] === "Your contributions follow the order of your areas.", r);
    await seed(stAt(st => { st.strands = [{ id: "sa", text: "Made-up area one" }]; st.contributions = [mkC("o1"), mkC("o2")]; }));
    r = await js(H + `await w(200); return qa('#v8-fact p').map(p=>p.innerText);`);
    check("R5: areas named and none marked: 'To check the order, please mark the areas of each contribution.'", r[0] === "To check the order, please mark the areas of each contribution.", r);

    // R1, R2, R3: the Review step's own texts.
    await seed(stAt(st => { st.mentees = []; st.mentorCounts = {}; st.lens.format = "tcv"; st.contributions = [mkC("t1", { outputs: "See https://example.org/x for the made-up atlas." })]; }));
    r = await js(H + squash + `await w(200); const tiles=qa('.v7-glance .v7-tile-k').map(x=>x.innerText); return {tiles, quiet:qa('.v7-glance .v7-quiet').map(x=>sq(x.innerText)), li:qa('.v7-glance li').map(x=>sq(x.innerText)), comp:sq(q('.v7-comp').innerText)};`);
    check("R2: Still missing names 'Mentorship: one person you trained and where they are now' (no comma)", r.li.some(t => /^Mentorship: one person you trained( or mentored)? and where they are now$/.test(t)), r.li);
    check("R2: TCV 'Links to remove' with 'Links are not permitted in the TCV. Please give the reference in words.'", r.tiles.some(t => /^links to remove$/i.test(t)) && r.quiet.includes("Links are not permitted in the TCV. Please give the reference in words."), r);
    check("R3: the page figure reads 'of 5 pages · about n words' and the note reads 'The length depends on the template. Please check it in the template before you submit.'", /of 5 pages · about [\d,]+ words?\b/i.test(r.comp) && /The length depends on the template\. Please check it in the template before you submit\./.test(r.comp) && !/roughly/.test(r.comp), r.comp);
    await seed(stAt(st => { st.lens.format = "cv-frq"; st.contributions = [mkC("t1", { outputs: "See https://example.org/x for the made-up atlas." })]; }));
    r = await js(H + `await w(200); return qa('.v7-glance .v7-tile-k').map(x=>x.innerText);`);
    check("R2: CV-FRQ 'Links to move to evidence'", r.some(t => /^links to move to evidence$/i.test(t)), r);

    const big = (n, w1) => Array.from({ length: n }, () => w1).join(" ");
    await seed(stAt(st => { st.contributions = [mkC("b1", { activities: big(3100, "alpha") })]; }));
    r = await js(H + squash + `await w(200); return {comp:sq(q('.v7-comp').innerText), aria:q('.v7-comp-bar').getAttribute('aria-label'), ow:(q('.v7-ow')||{}).innerText};`).catch(e => ({ err: String(e) }));
    check("R3: an English draft past the limit reads 'pages · about n words' and 'This is over the limit of 5 pages in English.'", /\bpages · about [\d,]+ words/.test(r.comp) && /This is over the limit of 5 pages in English\./.test(r.comp) && /limit of 5 pages\.$/.test(r.aria), r);
    const FR = "Nous avons mené une étude dans la région avec les collectivités et l'équipe est sortie avec des résultats pour les familles qui ont participé";
    await seed(stAt(st => { const fr = (n) => Array.from({ length: n }, () => FR).join(" "); st.contributions = [mkC("f1", { stakes: FR + ".", activities: fr(100) + ".", outputs: FR + ".", outcomes: FR + "." })]; }));
    r = await js(H + squash + `await w(200); const a={comp:sq(q('.v7-comp').innerText), aria:q('.v7-comp-bar').getAttribute('aria-label'), scale:qa('.v8-pages-scale span').map(s=>s.innerText).join('|')}; q('#v8-tab-order').click(); await w(60); a.ow=qa('.v7-ow').map(x=>x.innerText); return a;`);
    check("R3 (L2): a draft that reads as French is measured against 6 pages: the figure, the scale, the bar's label and the order cards", /of 6 pages · about/.test(r.comp) && /6 pages$/.test(r.scale) && /limit of 6 pages\.$/.test(r.aria) && r.ow.every(t => /of 6 pages/.test(t)), r);
    await seed(stAt(st => { const fr = (n) => Array.from({ length: n }, () => FR).join(" "); st.contributions = [mkC("f1", { stakes: FR + ".", activities: fr(130) + ".", outputs: FR + ".", outcomes: FR + "." })]; }));
    r = await js(H + squash + `await w(200); return sq(q('.v7-comp').innerText);`);
    check("R3 (L2): a French draft past 6 pages reads 'over the limit of 6 pages in French'", /(This is over|This may be over) the limit of 6 pages in French\./.test(r), r);

    // R10 (revised by E5): where they are now.
    const mm = (stage, label, kind, extra) => Object.assign({ stageKind: stage, stage: label, kind: kind || "", org: "", unit: "", recognition: "", why: "made-up note", folded: true }, extra || {});
    await seed(stAt(st => { st.mentorCounts = { postdoc: "", phd: "4", masters: "8", undergrad: "", other: "" }; st.mentees = [mm("doctoral", "Doctoral", ""), mm("masters", "Master's", "industry", { org: "A made-up firm" })]; }));
    r = await js(H + squash + `await w(200); const a={q:q('.v8-rm .v8-q').innerText, fact:q('#v8-rm-fact').innerText, how:sq(q('.v8-rm .v8-how').innerText), cap:q('.v8-rm-fh').innerText, flow:q('.v8-rm-flow svg').textContent, label:q('.v8-rm-flow svg').getAttribute('aria-label'), now:qa('.v8-p-now').map(x=>x.innerText)}; return a;`);
    check("R10/E5: 'Does the section describe people you trained and where they are now?'; status 'You trained 12 people and described 2. Please add where the doctoral student is now.'", /^Does the section describe people you trained( or mentored)? and where they are now\?$/.test(r.q) && /^You trained( or mentored)? 12 people and described 2\. Please add where the doctoral student is now\.$/.test(r.fact), r);
    check("R10/E5: 'Please select a person to edit.', 'Where they are now: not given', caption 'Where they are now', columns 'Trained as' and 'Now'", r.how === "Please select a person to edit." && r.now[0] === "Where they are now: not given" && /^Now: A made-up firm/.test(r.now[1]) && r.cap === "Where they are now" && /Trained as/.test(r.flow) && /Now/.test(r.flow) && !/went|Next/.test(r.flow + r.cap + r.now.join()), r);
    await seed(stAt(st => { st.mentorCounts = { postdoc: "", phd: "4", masters: "8", undergrad: "", other: "" }; st.mentees = [mm("doctoral", "Doctoral", ""), mm("masters", "Master's", "")]; }));
    r = await js(H + `await w(200); return q('#v8-rm-fact').innerText;`);
    check("R10/E5: more than one person without a place: 'Please add where 2 people are now.'", /Please add where 2 people are now\.$/.test(r), r);
    await seed(stAt(st => { st.mentorCounts = {}; st.mentees = []; }));
    r = await js(H + squash + `await w(200); const s=q('.v8-rm'); return {text:sq(s.innerText), factShown:!q('#v8-rm-fact').hidden && !!q('#v8-rm-fact').textContent, btn:[...s.querySelectorAll('button')].map(b=>b.innerText)};`);
    check("R10: with no one entered, one line 'No one is entered on Mentorship yet.' and a Go to Mentorship button replace the status and the body line", /^Mentorship Does the section describe people you trained( or mentored)? and where they are now\? No one is entered on Mentorship yet\. Go to Mentorship$/.test(r.text) && !r.factShown && r.btn.join() === "Go to Mentorship", r);

    // R4: the empty board line (the board is unreachable until a contribution is complete, so the text is read from the page source).
    const src = fs.readFileSync(path.join(ROOT, "narrative-cv-prototype-v9.html"), "utf8");
    check("R4: with no contribution the board says 'To answer these questions, please complete at least one contribution.'", src.includes('"To answer these questions, please complete at least one contribution. "') && src.includes('"Go to Contributions"'), "");
    check("R8: the old 'Media / public' kind is gone from the page's own kind lists", !/EVIDENCE_TYPES = \[[^\]]*Media \/ public/.test(src) && /"Public talk or outreach", "Media coverage"/.test(src), "");
  }

  console.log("Batch 9: Export and the files (E1 to E11), and the sweep");
  {
    const LIM = "Page limit: 5 pages in English, 6 pages in French.";
    const stB = (patch, lens) => { const st = Object.assign({}, JSON.parse(JSON.stringify(fixture)), { profileConfirmed: true, mode: "compose", stageKey: "export", ui: { profileNote: false } });
      st.lens = Object.assign({ agency: "sshrc", format: "tcv", program: "Insight Grants", discipline: "social", discipline2: "", otherField: "", careerStage: "mid", workMode: ["team"] }, lens || {});
      st.selfCheck = {}; patch(st); return st; };
    const mkB = (cid, x) => Object.assign(DONE(cid), { title: "Made-up " + cid }, x || {});
    const sqz = `const sq=(t)=>String(t||'').replace(/\\s+/g,' ').trim();`;
    const LONG = Array.from({ length: 3500 }, () => "alpha").join(" ") + ".";
    // The Export page, read whole: notes, intro, checklist, cards, and the three files (Word, text, print view).
    const readExport = `const a={h:q('.narrative-stage-header h2').innerText, lede:sq((q('.v7-lede')||{}).innerText), ledeHref:((q('.v7-lede a')||{}).href)||'', bar:sq(q('.v7-tailored').innerText),
        notes:qa('.v7-note').map(n=>sq(n.innerText)), edHead:q('#v7-pv-t').innerText, edSide:sq(q('.v8-edcard .v7-card-side').innerText), edHint:sq((q('.v7-ed-hint')||{}).innerText), edAria:(q('.v8-edoc')||{}).getAttribute&&q('.v8-edoc').getAttribute('aria-label'),
        ckHead:q('#v7-sc-t').innerText, ck:qa('.v8-ck label').map(l=>sq(l.innerText)), closing:!!q('.v7-closing'),
        fmt:sq(q('.v4-format').innerText), fmtDt:qa('.v4-format dt').map(d=>d.innerText), fmtFoot:sq(q('.v4-format-foot').innerText),
        fmtOpts:qa('.v7-choice small').map(s=>sq(s.innerText)), btns:qa('.btn').map(b=>sq(b.innerText)), ptNote:sq(q('#v7-pt-t').parentNode.querySelector('p.v7-quiet').innerText), ptH:q('#v7-pt-t').innerText,
        kwH:q('#v7-kw-t').innerText, kw:sq(q('#v7-kw-t').parentNode.querySelector('p.v7-body').innerText), shared:sq(q('.v7-shared-note').innerText), kwBtn:sq(q('#v7-kw-t').parentNode.querySelector('.btn').innerText),
        nudges:qa('.v7-nudge').length, contactP:qa('p.v7-contact').length, contact:sq(q('.v7-nudge p').innerText), mail:q('.v7-nudge a.btn').getAttribute('href'), page:q('#v4-stage-content').innerText};
      const blobs=[]; const oc=URL.createObjectURL; URL.createObjectURL=(b)=>{blobs.push(b);return oc(b);};
      const ocl=HTMLAnchorElement.prototype.click; HTMLAnchorElement.prototype.click=function(){};
      q('.v7-actions .btn-primary').click(); await w(40); q('#v7-fmt-txt').click(); await w(60); q('.v7-actions .btn-primary').click(); await w(40);
      HTMLAnchorElement.prototype.click=ocl; URL.createObjectURL=oc;
      a.doc=await blobs[0].text(); a.txt=await blobs[1].text();
      const ow=window.open; let pv=''; window.open=()=>({document:{write:(h)=>{pv=h;}, close(){}}});
      qa('.v7-quiet-btn').find(b=>/Print view/.test(b.innerText)).click(); await w(50); window.open=ow; a.pv=pv;
      return a;`;
    const lines = (t) => t.split("\n");
    // 1. SSHRC, English: two incomplete contributions, two links, and a draft over 5 pages.
    await seed(stB(st => { st.contributions = [mkB("a", { activities: "We surveyed six made-up towns; see https://example.org/made-up for the method.", translational: "A made-up clinic used the atlas." }), mkB("b", { outputs: "" }), mkB("c", { outcomes: "", evidence: [] }), mkB("d", { activities: LONG + " https://example.org/two" })]; }));
    let r = await js(H + sqz + `await w(250); ` + readExport);
    check("E1: the heading is Export; the intro reads as decided and links to the guide's TCV and CV-FRQ section", r.h === "Export" && r.lede === "In this section, you will edit your draft and download it, or copy each section into the template. What you export is a draft. Before you submit, we recommend that you review it, ask your research advisor(s) or colleagues to read it and revise it a final time in the template. For more information, please read the key differences between the TCV and the CV-FRQ." && /#compare$/.test(r.ledeHref), [r.h, r.lede, r.ledeHref]);
    check("E2: the bar reads 'Format: SSHRC · Tri-agency CV (TCV) · 12-point Arial'", /Format:\s*SSHRC · Tri-agency CV \(TCV\) · 12-point Arial/.test(r.bar), r.bar);
    check("E3: over the limit: 'Your draft is about … words, or … pages. This is over the limit of 5 pages in English. Please shorten it before you submit.'", r.notes.some(t => /^Your draft is about [\d,]+ words, or [\d.]+(–[\d.]+)? pages\. This is over the limit of 5 pages in English\. Please shorten it before you submit\.$/.test(t)), r.notes);
    check("E3: unfinished: 'Contributions 2 and 3 will be included in the export as incomplete.' with the Review link", r.notes.some(t => t === "Contributions 2 and 3 will be included in the export as incomplete. See what is missing on Review") && !r.notes.some(t => /appears to be in French/.test(t)), r.notes);
    check("E3 (R2): links, TCV: '2 links are still in your draft. Links are not permitted in the TCV. Please give the reference in words.'", r.notes.some(t => t.startsWith("2 links are still in your draft. Links are not permitted in the TCV. Please give the reference in words.")), r.notes);
    check("E4: the card is 'Narrative CV draft' with the decided side line, the tool-written-sentences hint and the screen-reader label", r.edHead === "Narrative CV draft" && r.edSide === "You can edit any part here. Changes are saved as you type." && r.edAria === "Narrative CV draft, editable"
      && r.edHint === "The first sentence of the personal statement, the totals line and the sentences about trainees are written from your answers. To change them, please edit your answers on Personal statement or Mentorship.", [r.edHead, r.edSide, r.edHint, r.edAria]);
    const want = ["Selection: each contribution relates to this funding opportunity.",
      "Specificity: each contribution gives concrete results, names the organizations involved and includes numbers, unless they are confidential. It does not use journal metrics, such as the impact factor.",
      "Proofread: I read the draft aloud, or had it read to me, and fixed typing mistakes.",
      "Agreement: the communities, partners and people named in my CV agreed to how they are described.",
      "Reader: my research advisor(s) or colleagues read the draft.",
      "Template: I pasted the draft into the current version of SSHRC's template, kept its font and margins, and revised it a final time there.",
      "Page limit: in the template, my CV is no longer than 5 pages in English or 6 pages in French."];
    const at = want.map(t => r.ck.indexOf(t));
    check("E5, E5a: the checklist is 'Before you submit'; its last seven items read as decided, in order, with 'Reader:'; the closing line is gone", r.ckHead === "Before you submit" && at.every((x, i) => x > -1 && (i === 0 || x > at[i - 1])) && !r.closing && !r.ck.some(t => /^Advisor:|^Format:/.test(t)), [r.ckHead, r.ck]);
    check("E5: the Mentorship question reads 'Does the Mentorship section describe people you trained and where they are now?'", r.ck.some(t => /^Does the Mentorship section describe people you trained( or mentored)? and where they are now\?$/.test(t)), r.ck);
    check("E6, E7: the download and copy cards read as decided (no article in button labels)", r.fmtOpts[0] === "Set in 12-point Arial on a Letter page with 2 cm margins, with SSHRC's section names." && r.fmtOpts[1] === "A text file of the draft. It also lists what is still missing in each contribution."
      && r.btns.includes("Copy draft with notes") && r.ptH === "Copy each section into the template" && r.ptNote === "Each button copies one section. Please paste it into the matching section of SSHRC's template.", [r.fmtOpts, r.btns, r.ptH, r.ptNote]);
    check("E8: the format box: 'You must use SSHRC's template.', Page limit is the first row, no 'Prepare your' sentence, 'This tool is in English only.', the decided foot", /^You must use SSHRC's template\. Page limit /.test(r.fmt) && r.fmtDt[0] === "Page limit" && /Page limit 5 pages in English, 6 pages in French\./.test(r.fmt) && !/Prepare your/.test(r.fmt) && /This tool is in English only\./.test(r.fmt) && !/for now/.test(r.fmt)
      && r.fmtFoot === "The agencies do not accept condensed fonts, and each sets its own file-size limit. If the instructions for your funding opportunity differ, please follow them.", [r.fmt, r.fmtDt, r.fmtFoot]);
    check("E9, E9a: the backup card reads as decided, with the Continue page named, and the shared-computer sentence uses Clear draft", r.kwH === "Backup file" && r.kwBtn === "Save a backup file"
      && r.kw === "To keep your draft, please save a backup file. Next time you use the tool, you can open it on the Continue page with Open a backup file. The backup file is a data file for this tool: a word processor can open it, but your text will appear mixed with code. Clearing your browser data erases the draft saved in this browser."
      && r.shared === "On a shared computer, please save a backup file and then choose Clear draft on Continue, so the next person starts with no draft.", [r.kwH, r.kw, r.shared]);
    check("E9: contact and feedback are one block with one Email us button and a general subject", r.nudges === 1 && r.contactP === 0 && r.contact === "If you have questions about your narrative CV, or a few minutes to tell us how the tool worked for you, please email the Pathways to Impact team." && /subject=Narrative%20CV%20tool$/.test(r.mail) && !/about your experience/.test(r.page), [r.nudges, r.contact, r.mail]);
    const tl = lines(r.txt);
    check("E10: the text file's title and second line", /^NARRATIVE CV DRAFT \(V9\.\d+ beta\)$/.test(tl[0]) && tl[1] === "[Notes from the tool are in square brackets. To copy and paste into the template without the notes, please use the Copy buttons on Export.]", tl.slice(0, 3));
    check("E10: the profile line, the over-limit line, the links line and the reminder read as decided", tl.some(t => /^\[Profile, not part of the CV: /.test(t)) && tl.some(t => /^\[About [\d,]+ words, or [\d.]+(–[\d.]+)? pages\. This is over the limit of 5 pages in English\.\]$/.test(t)) && tl.some(t => /^\[Links to remove: /.test(t))
      && tl.includes("[Before you submit: please ask your research advisor(s) or colleagues to read the draft, then paste it into the current version of SSHRC's template and revise it a final time there. " + LIM + " Font: 12-point Arial in black type.]"), tl.slice(0, 8));
    check("E10: no note after PERSONAL STATEMENT; the evidence kind is in brackets", tl.includes("PERSONAL STATEMENT") && !/first in the CV/.test(r.txt) && /\[Dataset or tool\]/.test(r.txt), tl.filter(t => /PERSONAL/.test(t)));
    check("E10: each Still missing hint is the part's own question; What already changed and evidence carry the tick", tl.some(t => /^   \[Still missing: [^.]+\. What did this work produce, and how many of each\?\]$/.test(t))
      && tl.some(t => /^   \[Still missing: [^.]+\. Who has used this work so far, and what was the impact\? If there has been no impact yet, please describe the potential impact under What could change, or tick No impact yet on Contributions\.\]$/.test(t))
      && tl.some(t => /^   \[Still missing: Evidence\. Please add one item a reviewer could check, or tick No evidence yet\.\]$/.test(t)), tl.filter(t => /Still missing/.test(t)));
    const wn = (r.doc.match(/<p class='word-note'>(.*?)<\/p>/s) || [])[1] || "";
    check("E11: the Word file's title and note (SSHRC)", /<title>Narrative CV draft<\/title>/.test(r.doc) && /^This draft is from the Pathways narrative CV tool \(V9\.\d+ beta\)\. It is set in 12-point Arial and uses the section names of SSHRC's template\. Before you submit, please ask your research advisor\(s\) or colleagues to read it, then paste each section into the current version of SSHRC's template and revise it a final time there\. Page limit: 5 pages in English, 6 pages in French\. Please delete this note before you paste the draft into the template\.$/.test(wn), wn);
    const pn = (r.pv.match(/<div class='screen-note'><p>(.*?)<\/p>/s) || [])[1] || "";
    check("E11: the print view's title and note", /<title>Narrative CV draft, print view<\/title>/.test(r.pv) && /^This draft is from the Pathways narrative CV tool \(V9\.\d+ beta\), set in 12-point Arial\. Before you submit, please ask your research advisor\(s\) or colleagues to read it, then paste it into the current version of SSHRC's template and revise it a final time there\. Page limit: 5 pages in English, 6 pages in French\. This view shows the draft as it was when you opened it\. After you make changes, please choose Print view again\. This note does not print\.$/.test(pn) && />Print<\/button>/.test(r.pv), pn);
    r = await js(H + `await w(100); return qa('.v8-edoc [aria-label]').map(e=>e.getAttribute('aria-label')).filter(t=>/real use case|One moment/.test(t));`);
    check("the editable card names the optional part 'A real use case (optional)' in each contribution; no 'One moment'", r.length === 4 && r.every(t => /^Contribution \d: A real use case \(optional\)$/.test(t)), r);

    // 2. One incomplete contribution, no agency.
    await seed(stB(st => { st.contributions = [mkB("a"), mkB("b", { stakes: "" })]; }, { agency: "", format: "" }));
    r = await js(H + sqz + `await w(250); ` + readExport);
    check("E2, E3, E6, E8, E11 with no agency: the bar, 'Contribution 2 will be…', the TCV section names, the agency line and the Word note", /Format:\s*Agency not chosen yet · Tri-agency CV \(TCV\) · 12-point Times New Roman/.test(r.bar)
      && r.notes.includes("Contribution 2 will be included in the export as incomplete. See what is missing on Review") && /with the Tri-agency CV \(TCV\) section names until you choose an agency\.$/.test(r.fmtOpts[0])
      && /^You must use the agency’s template\. If you are not sure whether you need the TCV or the CV-FRQ, please check the program’s application guide\./.test(r.fmt)
      && /It is set in 12-point Times New Roman and uses the Tri-agency CV \(TCV\) section names until you choose an agency\. Before you submit/.test(r.doc), [r.bar, r.notes, r.fmtOpts[0], r.fmt.slice(0, 200)]);

    // 3. CV-FRQ, a draft in French: the 6-page limit, the French note, the FRQ wording of links and files.
    const FR = "Nous avons mené une étude dans la région avec les collectivités et l'équipe est sortie avec des résultats pour les familles qui ont participé";
    await seed(stB(st => { st.contributions = [mkB("f1", { stakes: FR + ".", activities: Array.from({ length: 160 }, () => FR).join(" ") + ".", outputs: FR + ". See https://example.org/made-up.", outcomes: FR + "." })]; }, { agency: "frq", format: "cv-frq" }));
    r = await js(H + sqz + `await w(250); ` + readExport);
    check("E3: a French draft: the 6-page limit in French and the decided French note", r.notes.some(t => /^Your draft is about [\d,]+ words, or [\d.]+(–[\d.]+)? pages\. This is over the limit of 6 pages in French\. Please shorten it before you submit\.$/.test(t))
      && r.notes.includes("Your draft appears to be in French. The tool writes some sentences in English: the first sentence of your personal statement, the sentences about trainees and the totals line. Please translate them before you paste them into the template."), r.notes);
    check("E3: CV-FRQ links: 'Please move each link to the evidence of the contribution it supports.'", r.notes.some(t => t.startsWith("One link is still in your draft. Please move each link to the evidence of the contribution it supports.")), r.notes);
    check("E8 (FRQ): the FRQ sentence and the research-advisor line; E2: the CV-FRQ bar", /^You must use the FRQ’s template\. The FRQ requires the CV-FRQ for all grant applications and is especially strict about formatting and page limits\. Page limit /.test(r.fmt) && /Please check the program rules, or contact your research advisor\./.test(r.fmt) && !/Advisor, Research Development/.test(r.fmt) && /Format:\s*FRQ · CV-FRQ · 12-point Times New Roman/.test(r.bar), [r.fmt, r.bar]);
    const fl = lines(r.txt);
    check("E10 (FRQ, French): '[Links to move to evidence: …]', the over-limit line against 6 pages in French", fl.some(t => /^\[Links to move to evidence: /.test(t)) && fl.some(t => /^\[About [\d,]+ words, or [\d.]+(–[\d.]+)? pages\. This is over the limit of 6 pages in French\.\]$/.test(t)), fl.slice(0, 8));
    const wf = (r.doc.match(/<p class='word-note'>(.*?)<\/p>/s) || [])[1] || "";
    check("E11 (FRQ): the Word note asks for the name in the header and the title in the footer", /uses the section names of the FRQ’s template\./.test(wf) && / In the CV-FRQ template, please also add your name in the header and the document title in the footer\. Please delete this note/.test(wf), wf);

    // 4. The sweep: every step, read as a screen reader and a sighted reader would (text, aria-labels, titles, live regions).
    const vis = `const vis=()=>{ let t=document.body.innerText; qa('[aria-label],[title]').forEach(e=>{t+='\\n'+(e.getAttribute('aria-label')||'')+'\\n'+(e.getAttribute('title')||'');}); qa('[aria-live]').forEach(e=>{t+='\\n'+e.textContent;}); return t; };`;
    const OLD = /Mid career|Untitled contribution|My narrative CV|PROTOTYPE|went next|One moment|draft file|Reset draft|\bLoad your draft|the start page|Save a draft file|Clears the draft saved|\bstrands?\b|No, just this one|Undecided is selected/i;
    const seen = {};
    const sweepState = (key, setup) => stB(st => { st.stageKey = key; st.ps = { challenge: "Made-up question." }; st.contributions = [mkB("a", { translational: "A made-up clinic used the atlas." }), mkB("b", { outputs: "" })]; if (setup) st.profileConfirmed = false; });
    for (const [label, key, setup] of [["Set up your profile", "setup", true], ["Contributions", "contrib"], ["Mentorship", "mentor"], ["Personal statement", "ps"], ["Review", "review"], ["Export", "export"]]) {
      await seed(sweepState(key, setup));
      seen[label] = await js(H + vis + `await w(250); return vis();`);
    }
    await seed(sweepState("start"));
    seen["Continue (a draft in progress)"] = await js(H + vis + `await w(200); q('.v7-path-reset').click(); await w(100); return vis();`);
    await seed(null);
    seen["Start (no draft)"] = await js(H + vis + `await w(200); return vis();`);
    await seed(sweepState("contrib"));
    seen["Change panel"] = await js(H + vis + `await w(200); q('#v7-chg').click(); await w(150); return vis();`);
    await seed(sweepState("export"));
    seen["Export, after Save a backup file"] = await js(H + vis + `await w(200); qa('.v7-card .btn').find(b=>b.innerText==='Save a backup file').click(); await w(80); return vis();`);
    const hits = Object.entries(seen).map(([k, t]) => [k, (t.match(OLD) || [])[0]]).filter(x => x[1]);
    check("sweep: no step, panel or confirm shows 'Mid career', 'Untitled contribution', 'My narrative CV', 'PROTOTYPE', 'went next', 'One moment', 'draft file', 'Reset draft', 'Load your draft', 'the start page', 'Save a draft file', a strand or the old Undecided note", hits.length === 0 && Object.keys(seen).length === 10, hits);
    check("sweep: the bottom row and the rail say 'Save a backup file'; the Continue page's confirm says Clear draft and no foot note is left", /Save a backup file/.test(seen["Contributions"]) && /Clear your draft from this browser\?/.test(seen["Continue (a draft in progress)"]) && !/Clears the draft saved in this browser/.test(seen["Change panel"]), "");

    // 5. The profile Change panel follows P5, P8 and P9, as Set up your profile does.
    await seed(stB(st => { st.stageKey = "contrib"; st.lens.discipline2 = ""; }));
    r = await js(H + `await w(250); q('#v7-chg').click(); await w(150);
      const a={}; const comp=q('#v7-chg-comp'), und=qa('.v7-chg .v7-mini').find(b=>b.innerText==='Undecided');
      a.d2first=[...q('#v7-chg-d2').options].map(o=>o.text).slice(0,3);
      und.click(); await w(60); a.undOn=und.getAttribute('aria-pressed'); a.disabled=comp.disabled; a.emptied=comp.value;
      a.noteOn=q('#v7-chg-comp-note').textContent;
      setv(comp,'Made-up grant'); await w(60); a.undOff=und.getAttribute('aria-pressed'); a.live=q('#v7-live').textContent;
      const d2=q('#v7-chg-d2'); const other=[...d2.options].find(o=>o.value&&o.value!=='none'&&o.value!==q('#v7-chg-di').value); setsel(d2,other.value); await w(40);
      setsel(q('#v7-chg-di'),other.value); await w(60);
      a.msg=q('#v7-chg-d2-note').textContent; a.msgHidden=q('#v7-chg-d2-note').hidden; a.d2after=q('#v7-chg-d2').value; a.otherText=other.text; a.live2=q('#v7-live').textContent;
      a.foot=q('.v7-chg-foot').innerText;
      return a;`);
    check("P5 in the Change panel: Undecided empties the field and never disables it; typing turns Undecided off ('Undecided turned off.'); the old note is gone", r.undOn === "true" && r.disabled === false && r.emptied === "" && r.noteOn === "" && r.undOff === "false" && /Undecided turned off\./.test(r.live), r);
    check("P8 in the Change panel: the first answer is 'No'; making the other field the main one says so, under the field and aloud, and clears it", r.d2first[1] === "No" && r.msg === r.otherText + " is now your main field. Please choose your other field again." && !r.msgHidden && r.d2after === "" && r.live2 === r.msg, r);
    check("S8 in the Change panel: the foot holds Clear draft alone", r.foot === "Clear draft", r.foot);
    const srcB = fs.readFileSync(path.join(ROOT, "narrative-cv-prototype-v9.html"), "utf8");
    check("dead code is gone: buildAdvisorPacket, and buildWeave's unused gaps", !/buildAdvisorPacket|downloadPacket|gaps: w\.gaps|const gaps = \[\]/.test(srcB), "");
  }

  console.log("V9.3 accessibility audit fixes (ncv_tool_v9/a11y-audit.js)");
  {
    const st93 = (stageKey, ui, patch) => { const st = Object.assign({}, JSON.parse(JSON.stringify(fixture)), { profileConfirmed: true, mode: "compose", stageKey, ui: Object.assign({ profileNote: false }, ui || {}) }); if (patch) patch(st); return st; };
    const people = (st) => { st.mentees = [{ stageKind: "doctoral", stage: "Doctoral", kind: "industry", org: "Made-up firm A", unit: "", recognition: "", why: "", folded: true }, { stageKind: "masters", stage: "Master's", kind: "public", org: "Made-up agency B", unit: "", recognition: "", why: "", folded: true }]; st.mentorCounts = Object.assign({}, st.mentorCounts, { phd: "2", masters: "3" }); };
    await seed(st93("review", { reviewTab: "role" }, people));
    r = await js(H + `await w(300); const hgt=(e)=>e?Math.round(e.getBoundingClientRect().height):0; const art=q('.v7-gv-art');
      return {home:hgt(q('.v7-rail-home')), edit:hgt(qa('.v7-linkbtn').find(b=>b.innerText.trim()==='Edit on Contributions')), art: art ? [art.tabIndex, art.getAttribute('role')] : null};`);
    check("V9.3 a11y: link-style buttons that stand alone are at least 24 px tall (WCAG 2.5.8); the Mentorship chart is not a tab stop when it fits", r.home >= 24 && r.edit >= 24 && r.art && r.art[0] === -1 && r.art[1] === null, r);
    await send("Emulation.setDeviceMetricsOverride", { width: 320, height: 720, deviceScaleFactor: 2, mobile: true });
    await seed(st93("review", { reviewTab: "evidence" }, people));
    r = await js(H + `await w(400); const sz=(e)=>e?[Math.round(e.getBoundingClientRect().width),Math.round(e.getBoundingClientRect().height)]:null; const art=q('.v7-gv-art');
      return {tab:sz(q('.v8-tab')), add:sz(q('.v7-rqev-add')), home:sz(q('#v7-home')), see:sz(q('.v8-see')), tog:sz(q('#v8-rb-tog')), sw:document.documentElement.scrollWidth,
        art: art ? [art.tabIndex, art.getAttribute('role'), (q('#'+art.getAttribute('aria-labelledby'))||{}).textContent] : null};`);
    await send("Emulation.setDeviceMetricsOverride", { width: 1180, height: 900, deviceScaleFactor: 1, mobile: false });
    check("V9.3 a11y: at 320 px the Review tabs, + Add, the title link and the link-style buttons are at least 44 px (D-14)", r.tab[1] >= 44 && r.add[1] >= 44 && r.home[1] >= 44 && r.see[0] >= 44 && r.see[1] >= 44 && (!r.tog || (r.tog[0] >= 44 && r.tog[1] >= 44)) && r.sw === 320, r);
    check("V9.3 a11y: at 320 px the Mentorship chart scrolls sideways and takes keyboard focus, named “Where they are now” (axe scrollable-region-focusable)", r.art && r.art[0] === 0 && r.art[1] === "group" && r.art[2] === "Where they are now", r.art);
  }

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
