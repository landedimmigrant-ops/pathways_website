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
  const rail=(t)=>{const tg=q('#v7-rail-toggle'); if(tg&&getComputedStyle(tg).display!=='none'&&tg.getAttribute('aria-expanded')==='false') tg.click(); return qa('.v7-ri').find(b=>b.innerText.split('\\n')[0]===t);};
  const nav=(re)=>qa('.narrative-nav .btn').find(b=>re.test(b.innerText));
  const setv=(el,v)=>{el.value=v;el.dispatchEvent(new Event('input',{bubbles:true}));};
  const setsel=(el,v)=>{el.value=v;el.dispatchEvent(new Event('change',{bubbles:true}));};
  const okWarn=async()=>{const b=qa('.v7-warn .btn-primary')[0]; if(b){b.click(); await w(200);} };`;
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
    const sq0=qa('.v7-prof-col nav.v7-fcol .v7-fsq'); a.col0={label:q('.v7-prof-col nav.v7-fcol')?.getAttribute('aria-label'), n:sq0.length, dis:sq0.filter(b=>b.disabled&&b.getAttribute('aria-disabled')==='true').map(b=>b.dataset.for), cur:qa('.v7-prof-col .v7-fsq[aria-current]').map(b=>b.dataset.for), tri:getComputedStyle(sq0[0].querySelector('i')).borderRightWidth, rowVis:getComputedStyle(q('.v7-qcount .v7-dots')).display, name0:sq0[0].getAttribute('aria-label'), name5:sq0[5].getAttribute('aria-label')};
    sq0[3].click(); await w(80); a.col0.lockedClick=qa('.v7-qblock').length;
    window.scrollTo(0,0); q('#ag-frq').click(); await w(500); a.fb=q('.v7-feedback').innerText; a.stay=q('#ag-frq').getAttribute('aria-checked');
    a.b2=qa('.v7-qblock').length;
    { const sq=q('.v7-prof-col .v7-fsq[data-for="pq-1"]'), bk=q('.v7-qblock[data-pq="1"]'); a.lvl={y:Math.round(scrollY), d:Math.round(bk.getBoundingClientRect().top-sq.getBoundingClientRect().top), cur:q('.v7-prof-col .v7-fsq.is-cur')?.dataset.for}; }
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
  check("desktop Setup column: a labelled nav with six squares, the top row hidden, triangle and aria-current on the first question", r.col0.label === "Questions in your profile" && r.col0.n === 6 && r.col0.cur.join() === "pq-0" && r.col0.tri === "10px" && r.col0.rowVis === "none" && /, not answered yet$/.test(r.col0.name0), r.col0);
  check("unrevealed questions are grey, disabled and aria-disabled, and clicking one does nothing", r.col0.dis.join() === "pq-1,pq-2,pq-3,pq-4,pq-5" && /, not open yet$/.test(r.col0.name5) && r.col0.lockedClick === 1, r.col0);
  check("one question at a time", r.blocks === 1 && r.b2 === 2 && r.b3 === 3, r);
  check("choice stays selected in place, format feedback", r.stay === "true" && /CV-FRQ/.test(r.fb), r);
  check("after an answer the next question scrolls up level with its square, which carries the triangle", r.lvl.y > 0 && Math.abs(r.lvl.d) <= 8 && r.lvl.cur === "pq-1", r.lvl);
  check("all six answered: Confirm profile button (no Contributions button), nothing folds", /^6 of 6 answered$/.test(r.count) && r.next && !r.nextC && r.folded === 0, r);
  check("progress squares: six, all filled, the count is hidden text only", r.dots === 6 && r.on === 6, r);
  check("clearing an answer keeps the questions below it on screen", r.afterClear === 6, r.afterClear);
  r = await js(H + `setv(q('#v7-comp'),''); await w(80); const b=()=>qa('.v7-prof-col .v7-fsq');
    const a={n:b().length, dis:b().filter(x=>x.disabled).length, on:b().filter(x=>x.classList.contains('is-on')).length, sr:q('.v7-qcount .v7-sr').textContent, cur:qa('.v7-prof-col .v7-fsq[aria-current]').map(x=>x.dataset.for), curBlk:q('.v7-qblock.is-current')?.dataset.pq, tri:getComputedStyle(q('.v7-prof-col .v7-fsq.is-cur i')).borderRightWidth};
    a.greenOk=b().filter(x=>x.classList.contains('is-on')&&!x.classList.contains('is-cur')).every(x=>getComputedStyle(x.querySelector('i')).backgroundColor==='rgb(42, 110, 42)');
    const col=q('.v7-prof-col nav.v7-fcol'), lr=q('.v7-prof-list').getBoundingClientRect(); a.clear=col.getBoundingClientRect().left>=lr.right;
    window.scrollTo(0,0); await w(60); b()[3].click(); await w(700);
    a.focus=document.activeElement.id; a.inView=(()=>{const r=q('#pq3').getBoundingClientRect(); return r.top>=0&&r.bottom<=innerHeight;})();
    window.scrollTo(0, q('.v7-prof-list').getBoundingClientRect().top+scrollY+400); await w(100); a.pos=getComputedStyle(col).position; a.sticky=Math.round(col.getBoundingClientRect().top)-q('.proto-banner').offsetHeight;
    setv(q('#v7-comp'),'Made-up Team Grants'); await w(60); window.scrollTo(0,0);
    return a;`);
  check("Setup column: green squares match the answers, one triangle, the current question outlined, the spoken count stays", r.n === 6 && r.dis === 0 && r.on === 5 && r.greenOk && /^5 of 6 answered$/.test(r.sr) &&  r.cur.length === 1 && r.curBlk === "1" && r.tri === "10px" && r.clear, r);
  check("clicking an answered square scrolls to and focuses its question; the column is sticky below the top bar", r.focus === "pq3" && r.inView && r.pos === "sticky" && r.sticky >= 0 && r.sticky <= 24, r);
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
  check("scrolling moves the triangle to the question level with its square; the column stays put; a square click brings its question level", r.mid === "pq-2" && r.navTop >= 0 && r.navTop <= 24 && r.click === "pq-4" && Math.abs(r.d) <= 8 && r.on === 6, r);

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
  check("evidence view: What you wrote on top, ten kinds (Exhibition, performance or screening; Community document), none pre-selected", r.top.toLowerCase() === "what you wrote" && r.kinds === 10 && r.pre === 0, r);
  check("evidence item saved with its letter", r.row === "1 item: a", r.row);
  check("Add a contribution folds the others and focuses the new headline", r.folds === 1 && r.cards === 1 && /-title$/.test(r.focus || ""), r);

  console.log("Mentorship");
  r = await js(H + `nav(/Mentorship/).click(); await w(150);
    const a={h:q('.narrative-stage-header h2').innerText, tot:q('#v7-tot-t').innerText};
    setv(q('#v7-t-phd'),'2'); setv(q('#v7-t-postdoc'),'1'); a.sum=q('.v7-dash .v7-counter').innerText;
    setsel(q('#v7-ps0'),'postdoc'); await w(60); setsel(q('#v7-pw0'),'government'); await w(60);
    a.labels=qa('.v7-card label').map(l=>l.innerText).slice(2,4);
    setv(q('#v7-pg0'),'A made-up ministry'); a.head=q('#v7-ph0').innerText; a.help=q('.v7-people-help').innerText; a.rm=q('[aria-label^="Remove person"]')?.getAttribute('aria-label');
    a.hm=qa('[data-f^="m-"]').map(f=>f.className.split(' ')[1]);
    return a;`);
  check("totals tiles keep the five-year wording (D-1) and add up", /five years/.test(r.tot) && r.sum === "3 in total", r);
  check("labels follow the sector; header builds", r.labels.join("|") === "Organization|Unit or position" && /Postdoctoral → A made-up ministry/.test(r.head), r);
  check("people are lettered like evidence (Person A); the help says why names are left out", /^Person A\b/.test(r.head) && r.rm === "Remove person A" && /privacy/.test(r.help) && /leave out names/.test(r.help), r);
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
  check("At a glance: one line per contribution, linked to its first missing part, which opens with focus (r1-b-10)", r.missing > 0 && /^Contribution 1: Stakes, .*What you did.* and Evidence$/.test(r.link) && /Most significant/.test(r.jump.h) && r.jump.focus === r.jump.open && /-stakes$/.test(r.jump.focus || ""), r);

  console.log("Export");
  r = await js(H + `rail('Export').click(); await w(150);
    const blobs=[], names=[]; const oc=URL.createObjectURL; URL.createObjectURL=(b)=>{blobs.push(b);return oc(b);};
    const ocl=HTMLAnchorElement.prototype.click; HTMLAnchorElement.prototype.click=function(){names.push(this.download);};
    const a={setup:q('.v7-tailored').innerText, cards:qa('.v7-card .v7-h3').map(h=>h.innerText), nudge:q('.v7-nudge').innerText};
    q('.v7-actions .btn-primary').click(); await w(40);
    q('#v7-fmt-txt').click(); await w(60); q('.v7-actions .btn-primary').click(); await w(40);
    qa('.v7-card .btn').find(b=>b.innerText==='Save a draft file').click(); await w(40);
    HTMLAnchorElement.prototype.click=ocl; URL.createObjectURL=oc;
    a.names=names; a.doc=await blobs[0].text(); a.txt=await blobs[1].text(); a.file=await blobs[2].text();
    a.exportGreen=rail('Export').classList.contains('is-done');
    return a;`);
  check("Set up for line names the agency and font", /^Set up for:[^]*FRQ · CV-FRQ · 12-point Times New Roman/.test(r.setup), r.setup);
  check("three export cards", r.cards.join("|") === "Download or print|Paste into the template, one section at a time|Keep your work", r.cards);
  check("email nudge with the address printed as text", /impact@concordia\.ca about your experience/.test(r.nudge) && /Email us\s+impact@concordia\.ca/.test(r.nudge), r.nudge);
  check("downloads: Word, text and draft file", r.names[0] === "narrative-cv-draft-frq.doc" && r.names[1] === "narrative-cv-draft-frq.txt" && /^narrative-cv-draft-frq-\d{4}-\d{2}-\d{2}-\d{4}\.json$/.test(r.names[2]), r.names);
  const psDoc = (r.doc.match(/<h2>The candidate's background and skills \/ Parcours et compétences de la personne candidate<\/h2>(.*?)<h2>/s) || [])[1] || "";
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
    document.getElementById('v7-home').click(); await w(100); q('.v7-path-cont').click(); await w(150);
    const warn=(q('.v7-paths .v7-warn p')||{}).innerText||''; await okWarn(); await w(150);
    HTMLInputElement.prototype.click=ic;
    const st=JSON.parse(localStorage.getItem('ncv-v7'));
    return {h:q('.narrative-stage-header h2').innerText, n:st.contributions.length, comp:st.lens.program, alert:window.__a||'', warn};`);
  check("Load your draft over a draft asks inline first (W-45), then reopens the file on its saved step", /replaces the draft in this browser/.test(r.warn) && r.n === 3 && r.comp === "Made-up Team Grants" && /Export your draft/.test(r.h) && !r.alert, r);

  r = await js(H + `window.confirm=()=>true; document.getElementById('v7-home').click(); await w(150);
    const a={title:q('.v7-path-new h3').innerText, tag:q('.v7-path-new').tagName, btns:qa('.v7-path-new button').length, rs:!!q('.v7-path-reset')};
    q('.v7-path-reset').click(); await w(150);
    a.warn=q('.v7-path-new .v7-warn p, .v7-warn p')?.innerText; a.warnBtns=qa('.v7-warn .btn').map(b=>b.innerText);
    a.keptWhileWarned=(JSON.parse(localStorage.getItem('ncv-v7')||'{}').contributions||[]).some(c=>(c.title||'').trim());
    qa('.v7-warn .btn').find(b=>/Clear my draft/.test(b.innerText)).click(); await w(150); a.cmsg=q('.v7-warn p').innerText;
    a.keptAfterOne=(JSON.parse(localStorage.getItem('ncv-v7')||'{}').contributions||[]).some(c=>(c.title||'').trim());
    qa('.v7-warn .btn').find(b=>/Clear my draft/.test(b.innerText)).click(); await w(250);
    a.after=q('.v7-path-new h3')?.innerText; a.noReset=!q('.v7-path-reset'); a.saved=(JSON.parse(localStorage.getItem('ncv-v7')||'{}').contributions||[]).some(c=>(c.title||'').trim());
    return a;`);
  check("a saved draft puts Continue and Reset draft in one card", r.title === "Continue your draft" && r.tag === "DIV" && r.btns === 2 && r.rs, r);
  check("Reset draft opens an inline warning first, Cancel and Clear my draft, and nothing is cleared yet", r.warn === "Clear your draft from this browser? Save a draft file first if you want to keep it." && r.warnBtns.join("|") === "Cancel|Clear my draft" && r.keptWhileWarned, r);
  check("Clear my draft asks again in the same warning (W-45), then clears; the card reads Start your draft", /^Are you sure/.test(r.cmsg) && r.keptAfterOne && r.after === "Start your draft" && r.noReset && !r.saved, r);

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
  r = await js(H + `const card=q('.v7-card.v7-card-col'), sq=()=>qa('.v7-card-col .v7-fsq', card); await w(900);
    const id=sq()[4].dataset.for; card._level(id); await w(600);
    const a={id, cur:card.querySelector('.v7-fsq.is-cur')?.dataset.for, open:q('.v7-f.is-open')?.dataset.f, d:Math.round(q('.v7-f[data-f="'+id+'"]').getBoundingClientRect().top-sq()[4].getBoundingClientRect().top)};
    window.scrollTo(0,0); await w(100); return a;`);
  check("cards: scrolling a field level with its square moves the triangle there; the open field keeps its outline", r.cur === r.id && r.open !== r.id && Math.abs(r.d) <= 8, r);
  r = await js(H + `rail('Mentorship').click(); await w(150); const m=qa('.v7-card-col').length, hm=q('#v7-hm-t')?.innerText, hd=q('#v7-hm-t').closest('.v7-card').querySelector('.v7-card-h .v7-dots'), mn=hd?hd.children.length:0, mv=!!hd&&hd.getBoundingClientRect().width>2;
    rail('Personal statement').click(); await w(150); const p=q('.v7-card-col nav')?.getAttribute('aria-label'), pn=qa('.v7-card-col .v7-fsq').length;
    rail('Contributions').click(); await w(150); return {m, hm, mn, mv, p, pn};`);
  check("only long cards carry the column: Your statement has it; Mentorship style and the person cards keep their header squares", r.m === 0 && r.hm === "Mentorship style" && r.mn === 3 && r.mv && r.p === "Fields in Your statement" && r.pn >= 7, r);
  r = await js(H + `const seen=e=>!!e&&e.getBoundingClientRect().width>2; const fs=qa('.v7-card .v7-f');
    const st=f=>({c:f.className.split(' ')[1], k:seen(f.querySelector('.v7-f-k')), q:seen(f.querySelector(':scope > .v7-q'))});
    const all=fs.map(st); const job=fs.find(f=>!f.classList.contains('is-filled')&&f.querySelector('.v7-q-dot'));
    return {all, both:all.filter(x=>x.k&&x.q).length, filledOk:all.filter(x=>x.c==='is-filled').every(x=>x.k&&!x.q), otherOk:all.filter(x=>x.c!=='is-filled').every(x=>x.q&&!x.k), nf:all.filter(x=>x.c==='is-filled').length, dot:job?seen(job.querySelector('.v7-q-dot')):null, kwSr:fs.every(f=>f.querySelector('.v7-f-k').textContent.trim().length>0)};`);
  check("cards: an answered field shows its keyword only, an open or empty field its question only (job square beside it); the keyword stays in the text", r.both === 0 && r.filledOk && r.otherOk && r.nf > 0 && r.dot !== false && r.kwSr, r);

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
    q('.v7-path-cont').click(); await w(150); await okWarn(); await w(150); HTMLInputElement.prototype.click=ic;
    return {h:q('.narrative-stage-header h2').innerText, alert:window.__a||''};`);
  check("Load your draft resumes to Contributions for a confirmed profile", /Most significant/.test(r.h) && !r.alert, r);
  await seed({ mode: "compose", stageKey: "contrib", profileConfirmed: false, lens: { agency: "sshrc" }, contributions: [{ title: "x" }] });
  r = await js(H + "return {h:q('.narrative-stage-header h2')?.innerText, rail:qa('.v7-ri').map(b=>b.innerText.split('\\n')[0]).join('|')};");
  check("an unconfirmed profile is kept on Set up your profile, even with application content", /Set up your profile/.test(r.h) && r.rail === "Set up your profile", r);

  console.log("Change panel");
  await seed(Object.assign({}, fixture, { stageKey: "contrib", mode: "compose" }));
  r = await js(H + `const agency=()=>JSON.parse(localStorage.getItem('ncv-v7')).lens.agency; const a={ag0:agency()};
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
    q('#v7-chg').click(); await w(100); qa('#v7-chg-panel .btn').find(b=>b.innerText==='Reset draft').click(); await w(100);
    a.warn=q('#v7-chg-panel .v7-warn p')?.innerText; a.warnBtns=qa('#v7-chg-panel .v7-warn .btn').map(b=>b.innerText); a.kept=JSON.parse(localStorage.getItem('ncv-v7')).contributions.length>0;
    qa('#v7-chg-panel .v7-warn .btn').find(b=>b.innerText==='Cancel').click(); await w(100); a.warnGone=!q('.v7-warn'); a.kept2=JSON.parse(localStorage.getItem('ncv-v7')).contributions.length>0;
    return a;`);
  check("Change is a disclosure: aria-expanded flips, it controls the panel, and focus moves in", r.exp0 === "false" && r.exp1 === "true" && r.ctl0 === null && r.ctl === "v7-chg-panel" && r.panel && r.focusIn, r);
  check("the panel holds the six answers: agency, stage, field, second field, year, competition, work-mode pills", r.ids.every(Boolean) && r.comp && r.pills >= 4, r);
  check("Escape discards the edit, closes the panel and returns focus to Change", r.stillSaved && !r.esc.panel && r.esc.focus === "v7-chg" && r.esc.ag === r.ag0 && r.esc.exp === "false", r);
  check("Confirm applies the new answers, closes the panel and returns focus to Change", !r.ok.panel && r.ok.focus === "v7-chg" && r.ok.ag === r.other && r.ok.ag !== r.ag0, r);
  check("the Change panel follows Setup's order and labels the pills \"How your work usually happens\" (W-55)", r.order.join("|") === "Agency|Competition|Career stage|Field|Another field|How your work usually happens", r.order);
  check("desktop keeps the 14 px selects (the 16 px rule is phone only)", parseFloat(r.selFs) < 15 && r.selH < 44, [r.selFs, r.selH]);
  check("Reset draft inside the panel shows a warning with Cancel and Clear my draft; Cancel keeps the work", /^Clear your draft from this browser\?/.test(r.warn || "") && r.warnBtns.indexOf("Cancel") !== -1 && r.kept && r.warnGone && r.kept2, r);


  console.log("Phone width and reduced motion");
  await send("Emulation.setDeviceMetricsOverride", { width: 375, height: 812, deviceScaleFactor: 1, mobile: true });
  await seed(Object.assign({}, fixture, { stageKey: "contrib", mode: "compose" }));
  r = await js(H + `const out={}; const tg0=q('#v7-rail-toggle'); out.toggle=!!tg0&&getComputedStyle(tg0).display!=='none'; out.railH=Math.round(q('.narrative-progress-panel').getBoundingClientRect().height); if(tg0&&tg0.getAttribute('aria-expanded')==='false') tg0.click(); const names=qa('.v7-ri').map(b=>b.innerText.split('\\n')[0]); out.names=names; for (const t of names) { rail(t).click(); await w(120); out[t]=document.documentElement.scrollWidth; if (t==='Review') out.mv=Math.round(q('.v7-mv .btn')?.getBoundingClientRect().height||0); } rail('Contributions').click(); await w(100); out.reset=!!q('.v7-reset'); out.setup=names.indexOf('Set up your profile'); return out;`);
  check("no sideways scroll on any step at 375 px", r.names.length === 5 && r.names.every(k => r[k] <= 375), r);
  check("phone: the rail is one row until opened, so the step starts near the top (W-54)", r.toggle && r.railH <= 60, r);
  check("order buttons are at least 44 px (D-14); the phone rail has no Reset and no Set up your profile after confirming", r.mv >= 44 && !r.reset && r.setup === -1, r);
  r = await js(H + `rail('Contributions').click(); await w(100); window.scrollTo(0,0); q('#v7-chg').click(); await w(150); const o={sw:document.documentElement.scrollWidth, open:!!q('#v7-chg-panel'), right:Math.round(q('#v7-chg-panel').getBoundingClientRect().right)}; q('#v7-chg').click(); await w(60); return o;`);
  check("no sideways scroll at 375 px with the Change panel open", r.open && r.sw <= 375 && r.right <= 375, r);
  r = await js(H + `rail('Contributions').click(); await w(150); const card=q('.v7-card-col'), h=card.querySelector('.v7-card-h');
    window.scrollTo(0, card.getBoundingClientRect().top+scrollY+300); await w(150);
    return {col:getComputedStyle(card.querySelector('.v7-fcol')).display, pos:getComputedStyle(h).position, top:Math.round(h.getBoundingClientRect().top), bar:q('.proto-banner').offsetHeight, dots:h.querySelectorAll('.v7-dots i').length, sw:document.documentElement.scrollWidth, right:Math.round(h.getBoundingClientRect().right)};`);
  check("phone: the card header row (title and squares) sticks under the top bar, no column, no sideways scroll", r.col === "none" && r.pos === "sticky" && Math.abs(r.top - r.bar) <= 1 && r.dots === 9 && r.sw <= 375 && r.right <= 375, r);
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
  check("phone: a 120-character unbroken word in Stakes leaves no sideways scroll", r.sw <= 375, r);
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
  check("reduced motion turns field transitions off", /^0s/.test(r), r);
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
  check("no focusable control inside a closed field; the role levels show once the field opens", r.levels === 3 && r.hidden.length >= 3 && r.hidden.every(v => v === "hidden") && r.openLevels.every(v => v === "visible"), r);
  check("the last count is announced after the throttle window", r.count === "2 of 9 answered", r.count);
  check("+ Add evidence focuses the first kind card; the strip's Edit has its own id and name", r.ev.kind && r.ev.first && /^ev-edit-/.test(r.ev.editId) && r.ev.dupe === 0 && /^Edit the writing for contribution 1$/.test(r.ev.editName), r.ev);
  check("+ Add another item focuses the new item's first kind card; removing an item is announced", r.add.kind && r.add.item === 1 && r.evRm === "Evidence item b removed.", r);
  check("the strip's Edit closes the evidence view with focus in the open field", r.editBack, r);
  check("a rail click focuses the step heading and empties the live region", r.rail && r.liveAfter === "", r);
  check("removing a contribution focuses the remaining card and announces it", /^(ct|fold-)/.test(r.rmC.focus) && r.rmC.live === "Contribution 2 removed." && r.rmC.cards === 1, r.rmC);
  check("removing a person focuses the person now in that place and announces it", /^(v7-ph|pfold-)0$/.test(r.rmP.focus) && r.rmP.live === "Person B removed.", r.rmP);
  r = await js(H + `localStorage.removeItem('ncv-v7'); window.confirm=()=>true; document.getElementById('v7-home').click(); await w(100);
    const ic=HTMLInputElement.prototype.click;
    HTMLInputElement.prototype.click=function(){ if(this.type==='file'){const dt=new DataTransfer(); dt.items.add(new File([${JSON.stringify(loadFile)}],'d.json',{type:'application/json'})); this.files=dt.files; this.dispatchEvent(new Event('change'));} };
    q('.v7-path-cont').click(); await w(150); await okWarn(); await w(150); HTMLInputElement.prototype.click=ic;
    const a={load:document.activeElement.matches('.narrative-stage-header h2')?document.activeElement.innerText:document.activeElement.id};
    rail('Export').click(); await w(150);
    const oc=URL.createObjectURL; URL.createObjectURL=(b)=>oc(b); const ocl=HTMLAnchorElement.prototype.click; HTMLAnchorElement.prototype.click=function(){};
    const b=q('#v7-gv-all'); b.focus(); b.click(); await w(50);
    a.dl={focus:document.activeElement===b, dis:b.disabled, aria:b.getAttribute('aria-disabled')};
    await w(2500); a.dl.after=b.getAttribute('aria-disabled'); HTMLAnchorElement.prototype.click=ocl; URL.createObjectURL=oc;
    return a;`);
  check("focus lands on the step heading after Load", /Most significant/.test(r.load || ""), r);
  check("Download all visuals keeps focus while it works (aria-disabled, not disabled)", r.dl.focus && !r.dl.dis && r.dl.aria === "true" && r.dl.after === null, r.dl);

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
      a.saved=JSON.parse(localStorage.getItem('ncv-v7')).mentorCounts.phd;
      rail('Review').click(); await w(200);
      a.note=!!qa('.v7-draft-body .v7-ref-note').find(x=>/made-up note/.test(x.textContent));
      a.links=qa('.v7-glance .v7-tile-k').map(x=>x.innerText); a.linkItems=qa('.v7-glance a').map(x=>x.innerText).filter(t=>/What resulted/.test(t));
      rail('Export').click(); await w(150);
      a.bar=!!q('.v7-tailored #v7-chg'); q('#v7-chg').click(); await w(150); a.panel=!!q('#v7-chg-panel'); a.h=q('.narrative-stage-header h2').innerText;
      const comp=q('#v7-chg-comp'); setv(comp,'   '); qa('#v7-chg-panel .btn-primary').find(b=>/Confirm/.test(b.innerText)).click(); await w(200);
      a.after=q('.narrative-stage-header h2').innerText; a.prog=JSON.parse(localStorage.getItem('ncv-v7')).lens.program;
      return a;`);
    check("mentorship totals keep whole numbers 0 to 999 (W-22)", r.neg === "2" && r.dec === "2" && r.big === "999" && r.saved === "999", r);
    check("the on-screen draft shows each evidence note (W-15)", r.note, r);
    check("a link in a TCV draft is listed on Review under Links to take out (r1-a-2)", r.links.some(t => /Links to take out/i.test(t)) && r.linkItems.length >= 1, r);
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
      a.trim=JSON.parse(localStorage.getItem('ncv-v7')).lens.program;
      q('#v7-undecided').click(); await w(150); q('#v7-undecided').click(); await w(150); a.kept=q('#v7-comp').value;
      q('#st-mid').click(); await w(100); q('#di-health').click(); await w(100); q('#d2-none').click(); await w(100); q('#wm-team').click(); await w(150);
      const last=q('.v7-qblock[data-pq="5"]'); q('#wm-team').focus(); await w(50); a.focusQ=last.classList.contains('has-focus');
      const btn=qa('.narrative-nav .btn').find(b=>/Confirm profile/.test(b.innerText));
      document.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true})); btn.focus(); await w(50);
      a.held=last.classList.contains('has-focus');
      document.dispatchEvent(new PointerEvent('pointerup',{bubbles:true})); await w(50); a.released=!last.classList.contains('has-focus');
      return a;`);
    check("Setup: the competition loses surrounding spaces on blur and survives Undecided on and off (r1-a-4, W-36)", r.trim === "Made-up Grants" && r.kept === "Made-up Grants", r);
    check("Setup: an answered question keeps its question text while the pointer is down, so the Confirm click lands (r1-b-1)", r.focusQ && r.held && r.released, r);
    // Load path: a malformed draft file, a stored draft that cannot be read, a draft changed in another tab.
    const bad = JSON.stringify({ format: "pathways-narrative-cv-draft", version: 1, draft: { lens: { agency: "XYZ", program: 7 }, contributions: [{ title: 5, stakes: "Real made-up text" }, null, "x"], profileConfirmed: true, mode: "compose" } });
    await seed(base);
    r = await js(H + `window.confirm=()=>true; window.alert=(m)=>{window.__a=m;};
      document.getElementById('v7-home').click(); await w(100);
      const ic=HTMLInputElement.prototype.click;
      HTMLInputElement.prototype.click=function(){ if(this.type==='file'){const dt=new DataTransfer(); dt.items.add(new File([${JSON.stringify(bad)}],'d.json',{type:'application/json'})); this.files=dt.files; this.dispatchEvent(new Event('change'));} };
      q('.v7-path-cont').click(); await w(150); await okWarn(); await w(150); HTMLInputElement.prototype.click=ic;
      const st=JSON.parse(localStorage.getItem('ncv-v7'));
      return {n:st.contributions.length, title:st.contributions[0].title, agency:st.lens.agency, prog:st.lens.program, alert:window.__a||'', banner:(q('.narrative-session-banner')||{}).innerText||''};`);
    check("a draft file with a null card, a number title and an unknown agency opens cleanly (F-1, F-9); the step says it opened (W-46)", r.n === 1 && r.title === "5" && r.agency === "" && r.prog === "7" && !r.alert && /^Opened your draft/.test(r.banner), r);
    await go(HOME()); await js(`localStorage.clear(); localStorage.setItem('ncv-v7','{"contributions":[{"title":"keep me"');`); await go(PAGE());
    r = await js(H + `await w(200); return {stored:localStorage.getItem('ncv-v7'), rec:!!localStorage.getItem('ncv-v7-recovery'), warn:!q('#v4-save-warning').hidden && /could not be opened/.test(q('#v4-save-warning').innerText), btn:!!qa('#v4-save-warning button').length};`);
    check("a stored draft that cannot be read is kept, copied to a recovery key and not saved over (F-2)", /keep me/.test(r.stored || "") && r.rec && r.warn && r.btn, r);
    await seed(base);
    r = await js(H + `await w(150); const st=JSON.parse(localStorage.getItem('ncv-v7')); st.contributions[0].title='Changed in another tab'; const nv=JSON.stringify(st);
      const before=localStorage.getItem('ncv-v7');
      window.dispatchEvent(new StorageEvent('storage',{key:'ncv-v7', newValue:nv})); await w(200);
      const a={shown:document.body.innerText.includes('Changed in another tab'), unchanged:localStorage.getItem('ncv-v7')===before};
      localStorage.removeItem('ncv-v7'); await w(20); q('.v7-ex-btn')?.click(); await w(150); a.notBack=localStorage.getItem('ncv-v7')===null; a.warn=/browser data was cleared/.test(q('#v4-save-warning').innerText);
      return a;`);
    check("a save in another tab is taken up here without writing back (F-3)", r.shown && r.unchanged, r);
    check("after the browser data is cleared from outside, the draft is not written back (W-48)", r.notBack && r.warn, r);
    // Print view and Word notes.
    await seed(base);
    r = await js(H + `rail('Export').click(); await w(150); const ow=window.open; let doc='';
      window.open=()=>({document:{write:(h)=>{doc=h;}, close(){}}}); qa('.v7-quiet-btn').find(b=>/Print view/.test(b.innerText)).click(); await w(50);
      window.open=()=>null; qa('.v7-quiet-btn').find(b=>/Print view/.test(b.innerText)).click(); await w(50); const blocked=q('.v7-actions .v7-copied').innerText; window.open=ow;
      return {vp:/name='viewport'/.test(doc), lang:/<html lang='en'>/.test(doc), btn:/window.print\(\)/.test(doc), label:/\(V7 beta\)/.test(doc) && !/forked/.test(doc), blocked};`);
    check("print view: viewport, lang, a Print button and the short tool label; a blocked window says so (W-21, F-7)", r.vp && r.lang && r.btn && r.label && /blocked the print view/.test(r.blocked), r);
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
      a.sup=(q('.v7-draft-body sup')||{}).textContent; a.prev=q('.v7-draft-body').innerText;
      a.miss=qa('.v7-glance a').map(x=>x.innerText);
      rail('Export').click(); await w(150);
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
    check("Word: the headline on its own line, Stakes then the role line in roman, superscript a, b, no kind labels (W-14, W-16, W-17)", r.doc.includes("<span class='ctitle'>1. Made-up T</span><br>" + body + " <sup>a, b</sup>") && !/Peer-reviewed|\(Other\)|<em>/.test(r.doc), r.doc.slice(r.doc.indexOf("ctitle"), r.doc.indexOf("ctitle") + 300));
    check("on-screen draft: the same order with superscript letters and no kind labels", r.sup === "a, b" && r.prev.includes(body) && !/Peer-reviewed/.test(r.prev), r.prev.slice(0, 400));
    check("section copy: the same paragraph with (a, b), no kind labels", r.sec.includes(body + " (a, b)") && !/Peer-reviewed|Other/.test(r.sec), r.sec);
    check(".txt: the working copy keeps the kind in brackets, never [Other], and lists what is still missing (W-19)", r.txt.includes("   " + body + " (a, b)") && /\[Peer-reviewed\]/.test(r.txt) && !/\[Other\]/.test(r.txt) && /\[Still missing: Your role\./.test(r.txt) && /^NARRATIVE CV, WORKING DRAFT \(V7 beta\)/.test(r.txt) && !/—/.test(r.txt), r.txt.slice(0, 900));
    check("a trainee prints as a sentence with the sector named; the Other tile counts in the totals (W-20, W-23)", /A doctoral student I trained now works in government at Made-up Ministry, and received a made-up scholarship \(2024\)\./.test(r.mentor) && /1 doctoral student, 2 other trainees/.test(r.mentor) && !/→/.test(r.mentor), r.mentor);
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
      a.nav=qa('.v7-nav-note').map(x=>x.innerText).join('|');
      const card=q('.v7-card-col'); card.querySelector('[id^=ev-open-]').click(); await w(300);
      a.rows=qa('.v7-kind-row').map(x=>x.innerText); a.grid=qa('.v7-kind').length;
      qa('.v7-kind-row .v7-linkbtn')[0].click(); await w(200); a.open=qa('.v7-kind').length; a.focus=document.activeElement.getAttribute('aria-checked');
      rail('Mentorship').click(); await w(150); a.h=q('h2').innerText; a.ks=qa('[data-f^="m-"] .v7-f-k').map(x=>x.textContent); a.optional=a.ks.includes('Who else you mentor (optional)');
      rail('Background and skills').click(); await w(150); a.fit=(q('[data-f="ps-programFit"] .v7-q')||{}).innerText||'';
      return a;`);
    check("CV-FRQ: the Contributions note names the background and skills section, not the personal statement (r2-b-1)", /after the candidate's background and skills/.test(r.nav) && !/personal statement/i.test(r.nav), r.nav);
    check("a chosen kind folds to one line with Change, which reopens the ten cards on the chosen one (r1-b-5)", r.rows.length === 2 && /^Kind: Exhibition, performance or screening · Change$/.test(r.rows[0]) && r.grid === 0 && r.open === 10 && r.focus === "true", r);
    check("early career: Who else you mentor is optional (r2-b-8); a competition naming FRQSC gets no (FRQ) bracket (r2-b-10)", r.optional && !/\(FRQ\)/.test(r.fit), r);
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
    check("a trainee in the health system prints as a sentence (r2-a-2)", /A master's student I trained now works at A made-up health authority \(Nurse manager\)\./.test(r.mentor), r.mentor);
  }

  console.log("Audit loop, round 3: the walkthrough's remaining items");
  {
    const st4 = Object.assign({}, JSON.parse(JSON.stringify(fixture)), { profileConfirmed: true, mode: "compose", stageKey: "ps", ui: { profileNote: false } });
    st4.ps = Object.assign({}, st4.ps, { role: "associate professor of mechanical engineering", institution: "Made-up University" });
    const mk = (t, x) => ({ cid: "cx" + t, title: "Made-up " + t, stakes: "Coastal flooding records " + x + " in Halifax towns.", activities: "Flooding records modelled " + x + ".", outputs: "", outcomes: "", impact: "", translational: "", roleLine: "I led it.", roleMode: "", evidence: [], flags: {}, notes: {} });
    st4.contributions = [mk("a", "one"), mk("b", "two"), mk("c", "three")];
    await seed(st4);
    r = await js(H + `await w(200); const a={};
      a.cross=qa('.v7-cross').length; a.under=q('.v7-cross')?.closest('.v7-f')?.dataset.f; a.span=/shares words with each/.test(q('.v7-cross')?.innerText||''); a.halifax=/halifax/i.test(q('.v7-cross strong')?.innerText||'');
      const r0=q('#ps-anchor'); r0.focus(); await w(300); a.fw=[r0.scrollWidth,r0.clientWidth,r0.style.width]; a.fit=parseFloat(r0.style.width)>=r0.scrollWidth-2;
      a.jd=qa('[data-f^="ps-"] .v7-f-k .v7-jd').length;
      rail('Review').click(); await w(200);
      a.order=qa('#v4-stage-content > section, #v4-stage-content > .v7-draft, #v4-stage-content > div > section').map(x=>x.getAttribute('aria-labelledby')||x.className).filter(Boolean);
      a.hash=location.hash; history.back(); await w(250); a.back=q('.narrative-stage-header h2').innerText; a.hash2=location.hash;
      history.forward(); await w(250); a.fwd=q('.narrative-stage-header h2').innerText;
      return a;`);
    check("the read across contributions shows once, under The problem; a place name is left out; no 'spanning' line when every card qualifies (W-39)", r.cross === 1 && r.under === "ps-challenge" && !r.span && !r.halifax, r);
    check("a first-sentence box is as wide as its text (W-40); the statement fields carry the legend's squares (W-42)", r.fit && r.jd >= 6, r);
    check("Review runs At a glance, then the order, then the visuals (W-52)", r.order.indexOf("v7-ag-t") !== -1 && r.order.indexOf("v7-ag-t") < r.order.indexOf("v7-oc-t") && r.order.indexOf("v7-oc-t") < r.order.indexOf("v7-gv-t"), r.order);
    check("each step has an address; Back and Forward move between steps (W-47)", r.hash === "#review" && /Personal statement/.test(r.back) && r.hash2 === "#statement" && /Review/.test(r.fwd), r);
  }

  console.log("Audit loop, round 3: Fable's review of rounds 1 and 2");
  {
    const st5 = Object.assign({}, JSON.parse(JSON.stringify(fixture)), { profileConfirmed: true, mode: "compose", stageKey: "contrib", ui: { profileNote: false } });
    st5.mentees = [{ stageKind: "other", stageOther: "MD-PhD trainee", stage: "MD-PhD trainee", kind: "university", org: "A made-up university", unit: "", recognition: "", why: "", folded: false }];
    await seed(st5);
    r = await js(H + `await w(150); const a={};
      q('#v7-chg').click(); await w(150); a.open=!!q('#v7-chg-panel');
      const st=JSON.parse(localStorage.getItem('ncv-v7')); st.lens.careerStage='senior';
      window.dispatchEvent(new StorageEvent('storage',{key:'ncv-v7', newValue:JSON.stringify(st)})); await w(200);
      a.closed=!q('#v7-chg-panel'); a.live=q('#v7-live').textContent;
      localStorage.removeItem('ncv-v7'); const box=q('[data-f$="-stakes"] .v7-box'); box.focus(); setv(box,'Kept here.'); await w(60);
      const other=JSON.parse(JSON.stringify(st)); other.contributions[0].stakes='Other tab';
      window.dispatchEvent(new StorageEvent('storage',{key:'ncv-v7', newValue:JSON.stringify(other)})); await w(200);
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
    check("a level typed under Other keeps its capitals and takes the article of its letters (G-3)", /An MD-PhD trainee I trained is now at A made-up university\./.test(r.mentor), r.mentor);
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
      rail('Review').click(); await w(200); a.sw=document.documentElement.scrollWidth<=document.documentElement.clientWidth+1; a.mv=q('.v7-mv .btn').getAttribute('aria-label').length;
      rail('Mentorship').click(); await w(150); q('#v7-chg').click(); await w(150);
      qa('#v7-chg-panel .v7-mini[aria-pressed="true"]').forEach(b=>b.click()); await w(60);
      qa('#v7-chg-panel .btn-primary').find(b=>/Confirm/.test(b.innerText)).click(); await w(150);
      a.need=!!q('.v7-chg-need') && !!q('#v7-chg-panel');
      return a;`);
    check("arrow keys move through the evidence kinds with the chooser open and say the kind; Enter folds it (r3-a-1)", r.stillOpen === 10 && r.focusKind === "radio" && r.checked === "true" && r.folded && /Kind: /.test(r.live), r);
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
      const a={wm:JSON.parse(localStorage.getItem('ncv-v7')).lens.workMode.join(','), live1:q('#v7-live').textContent};
      qa('.narrative-nav .btn').find(b=>/Confirm profile/.test(b.innerText)).click(); await w(200);
      history.back(); await w(300); a.back=(q('.v7-path-new h3')||{}).innerText||'';
      history.forward(); await w(300); a.fwd=q('h2').innerText;
      history.pushState(null,'','#profile'); history.back(); await w(250); history.forward(); await w(300);
      a.after=q('h2').innerText; a.focus=document.activeElement.tagName; a.live=q('#v7-live').textContent; a.hash=location.hash;
      document.getElementById('v7-home').click(); await w(150); q('.v7-path-reset').click(); await w(100);
      qa('.v7-warn .btn-primary')[0].click(); await w(100); qa('.v7-warn .btn-primary')[0].click(); await w(250);
      history.back(); await w(300); a.afterReset=(q('.v7-path-new h3')||{}).innerText; a.mode=JSON.parse(localStorage.getItem('ncv-v7')||'{}').mode;
      return a;`);
    check("Team-based and Largely solo replace each other, and the change is spoken (r4-a-4)", r.wm === "solo" && /Team-based cleared/.test(r.live1), r);
    check("Confirm profile replaces Setup's history entry, so Back goes to the start page and Forward returns (H-1)", r.back === "Continue your draft" && /Most significant/.test(r.fwd), r);
    check("an address for a closed step (Setup after Confirm) is not a dead press: the step shown is named and its heading focused (H-1)", /Most significant/.test(r.after) && r.focus === "H2" && /not open now/.test(r.live) && r.hash === "#contributions", r);
    check("Back after a reset stays on the start page and starts nothing (H-2)", r.afterReset === "Start your draft" && !r.mode, r);
    // A blank card with only a level; the historian's and the zoom fixes.
    const st7 = Object.assign({}, JSON.parse(JSON.stringify(fixture)), { profileConfirmed: true, mode: "compose", stageKey: "contrib", ui: { profileNote: false } });
    st7.contributions = [{ cid: "cz1", title: "Made-up archive", stakes: "No researcher outside the town could learn what it held.", roleMode: "led", roleLine: "", activities: "I catalogued it.", outputs: "", outcomes: "", impact: "", translational: "", evidence: [], flags: {}, notes: {} }];
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
    check("'could learn' in Stakes is a past inability, not a hedge (r4-a-5)", !/hedge/.test(r.hedge), r.hedge);
    check("more people described than counted is named beside the count as a check, not a gap (r4-a-6, J-4)", /2 described, more than the 1 in the five-year totals/.test(r.pc) && !/totals lower/.test(r.miss), r);
    check("Review has the Profile bar with Change (r4-a-1); Export names unfinished contributions (r3-b-5)", r.bar && /still missing parts/.test(r.unf), r);
    check("each person is its own paragraph in the section copy (r4-a-9); an organization that names its sector is not given it twice (r4-b-7)", /\(\d|\.\n\nAn undergraduate researcher I trained now works at A made-up science museum\./.test(r.mentor), r.mentor);
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
      qa('.btn').find(b=>/^Copy Supervisory/.test(b.innerText)).click(); await w(40); a.mentor=clip; navigator.clipboard.writeText=ow;
      a.shared=!!q('.v7-shared-note'); a.agree=null;
      rail('Review').click(); await w(150); a.agree=!!qa('.v7-selfcheck label').find(l=>/Agreement:/.test(l.innerText));
      // history: Export, Back to Review, then lock Review from another tab and press Back: the closed entry is passed over
      rail('Export').click(); await w(150); const n0=history.state&&history.state.n;
      a.hasN=typeof n0==='number';
      return a;`);
    check("community-engaged work gets the partners' role prompt (r5-b-3)", /who led the other parts/.test(r.roleQ), r.roleQ);
    check("a written role line names the part, so 'we' in What you did is not flagged (r5-b-2); 'may withdraw' and 'would require' are not hedges (r5-b-4)", !/“we”/.test(r.we) && !/hedge/.test(r.hedge), r);
    check("the Other group prints under its name; a First Nations, Inuit or Métis destination prints with its organization (r5-b-5, r5-b-6)", /1 doctoral student, 7 community researchers/.test(r.mentor) && /now works at A made-up Nation's health department\./.test(r.mentor), r.mentor);
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
      a.undo=!!q('#c-undo'); a.n1=JSON.parse(localStorage.getItem('ncv-v7')).contributions.length;
      q('#c-undo').click(); await w(250); a.n2=JSON.parse(localStorage.getItem('ncv-v7')).contributions.length; a.first=JSON.parse(localStorage.getItem('ncv-v7')).contributions[0].cid;
      const role=q('[data-f$="-roleLine"] .v7-box'); role.focus(); setv(role,'My team ran the course while I was on leave.'); await w(80);
      a.roleTick=qa('[data-f$="-roleLine"] .v4-strength').map(x=>x.textContent).join('|');
      const act=q('[data-f$="-activities"] .v7-box'); act.focus(); setv(act,'Sampling was paused for twelve months in 2023, and I would have run the dive surveys myself otherwise.'); await w(80);
      a.actFlags=qa('[data-f$="-activities"] .v4-flag').map(x=>x.textContent).join('|');
      rail('Mentorship').click(); await w(150); a.tilesHelp=(q('.v7-tiles-help')||{}).innerText||'';
      rail('Personal statement').click(); await w(150); a.pivot=(q('[data-f="ps-pivot"] .v7-f-more')||{}).textContent||'';
      rail('Export').click(); await w(150);
      let clip=''; const ow=navigator.clipboard.writeText; navigator.clipboard.writeText=async(t)=>{clip=t;};
      qa('.btn').find(b=>/^Copy Supervisory/.test(b.innerText)).click(); await w(40); a.mentor=clip; navigator.clipboard.writeText=ow;
      q('#v7-chg').click(); await w(150); setsel(q('#v7-chg-st'),'early'); qa('#v7-chg-panel .btn-primary').find(b=>/Confirm/.test(b.innerText)).click(); await w(200); a.live=q('#v7-live').textContent;
      return a;`);
    check("past five contributions a line on choosing appears; each folded row shows its length (r6-a-1, r6-a-2)", /You have 6 contributions/.test(r.sel) && r.meta.every(m => /\d+ w$/.test(m)), r);
    check("the rail says when the draft is over the limit; Export says so too (r6-a-4)", /over 5 p/.test(r.wc) && r.wcOver && /needs cutting/.test(r.over), r);
    check("removing a written contribution names its words and can be undone for ten seconds (r6-a-3)", /with its [\d,]+ words/.test(r.warn) && r.undo && r.n1 === 5 && r.n2 === 6 && r.first === "cr1", r);
    check("'my team ran it' is not your own role; a pause and a counterfactual are not flagged; a year counts as a date (r6-b-6, r6-b-4, r6-b-5)", !/Your own role is named/.test(r.roleTick) && !/hedge|does not say who|No numbers or dates/.test(r.actFlags), r);
    check("the totals and How you got here say where a leave goes, without stating an agency's rule (r6-b-1, r6-b-2)", /if a leave fell inside it/.test(r.tilesHelp) && /If a leave, a move between institutions/.test(r.pivot), r);
    check("a 'went on to do' answer that starts with a verb joins the sentence (r6-a-7); a profile change names what changed (r6-b-7)", /made-up health authority, and now leads the made-up analytics team\./.test(r.mentor) && /Profile updated: career stage/.test(r.live), r);
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
      qa('.v7-warn .btn-primary')[0].click(); await w(100); qa('.v7-warn .btn-primary')[0].click(); await w(250); L('reset');
      q('.v7-path-new').click(); await w(200); L('new'); return {log, h0:q('h2').innerText, len:history.length, st:JSON.stringify(history.state)};`);
    await js(`history.back(); return 1;`); await sleep(500);
    r = Object.assign(r, await js(H + `return {b1:(q('.v7-path-new h3')||{}).innerText||q('h2')?.innerText, st1:JSON.stringify(history.state), hash1:location.hash};`));
    await js(`history.back(); return 1;`); await sleep(700);
    r = Object.assign(r, await js(H + `return {b2:(q('.v7-path-new h3')||{}).innerText||q('h2')?.innerText, live:q('#v7-live').textContent, here:location.pathname};`));
    check("after a reset and a new draft, Back never re-enters the earlier draft's steps or leaves the tool (K-1)", /Set up your profile/.test(r.h0) && /draft/.test(r.b1) && /draft/.test(r.b2) && /narrative-cv-prototype-v7/.test(r.here), r);
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
    check("the statement's first sentence does not silence its 'we' check (K-3); 'may use' in What could change is praised as a hedge (K-5)", /“we”/.test(r.ps) && /Hedged/.test(r.imp), r);
  }

  console.log("Register (W-57): the tool's prompt strings");
  {
    const src = fs.readFileSync(path.join(ROOT, "narrative-cv-prototype-v7.html"), "utf8");
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
    r = await js(H + `await w(300); const a={pills:qa('.v7-tailored-pills span, .v7-tailored-pills').map(x=>x.innerText).join(' | '), evType:JSON.parse(localStorage.getItem('ncv-v7')||'{}').contributions?.[0]?.evidence?.[0]?.type};
      const rm=q('[aria-label="Remove contribution 1"]'); a.rm=!!rm; a.rmName=rm?.getAttribute('aria-label'); rm.click(); await w(150);
      const warn=q('.v7-warn'); a.warnFocus=!!warn&&warn.contains(document.activeElement); a.warnRole=warn?.getAttribute('role'); a.warnName=warn&&document.getElementById(warn.getAttribute('aria-labelledby'))?.innerText;
      [...warn.querySelectorAll('button')].find(b=>b.innerText==='Remove').click(); await w(300);
      a.n=qa('.v7-card [aria-label^="Remove contribution"]').length; a.title=JSON.parse(JSON.stringify(window.ns||{})).contributions?.[0]?.title;
      a.cards=qa('.v7-card').filter(c=>/Contribution 1/.test(c.innerText)).length; a.focus=document.activeElement.tagName; a.live=q('#v7-live').textContent;
      q('[aria-label="Remove contribution 1"]').click(); await w(150); a.blankMsg=q('#v7-live').textContent; a.noWarn=!q('.v7-warn');
      return a;`);
    check("Q14: the only contribution has a Remove button; it asks inline (focus inside, named by its question), then leaves a blank Contribution 1 and says so", r.rm && r.warnFocus && r.warnRole === "group" && /Remove contribution 1/.test(r.warnName || "") && r.cards >= 1 && r.focus !== "BODY" && /removed\. A blank Contribution 1 is ready\./.test(r.live) && /already blank/.test(r.blankMsg) && r.noWarn, r);
    check("Q13: an evidence item saved as \"Exhibition / performance\" loads as \"Exhibition, performance or screening\"", r.evType === "Exhibition, performance or screening", r);
    check("Q15: the Profile bar spells out the format (Tri-agency CV, no TCV)", /Tri-agency CV/.test(r.pills) && !/\bTCV\b/.test(r.pills), r.pills);
    await seed(Object.assign({}, fixture, { profileConfirmed: true, stageKey: "contrib", mode: "compose", lens: Object.assign({}, fixture.lens, { agency: "other" }) }));
    r = await js(H + `await w(300); const a={pills:q('.v7-tailored')?.innerText};
      const ch=qa('.v7-tailored button').find(b=>/Change/.test(b.innerText)); ch.click(); await w(200);
      const lab=qa('.v7-tailored label, .v7-tailored .v7-pill, .v7-tailored button').map(x=>x.innerText.trim()); a.mode=lab.find(t=>/Partnered with industry/.test(t)); a.old=lab.some(t=>/Industry-partnered/.test(t));
      const sel=qa('.v7-tailored select').find(s=>[...s.options].some(o=>o.value==='other')); a.opt=sel?[...sel.options].find(o=>o.value==='other').text:null;
      const box=a.mode&&qa('.v7-tailored label, .v7-tailored .v7-pill, .v7-tailored button').find(x=>/Partnered with industry/.test(x.innerText)); a.sw=document.documentElement.scrollWidth<=innerWidth;
      return a;`);
    check("Q15: an unchosen agency reads \"Agency not chosen yet\" in the Profile bar", /Agency not chosen yet/.test(r.pills || ""), r);
    check("Q12: the work-mode choice reads \"Partnered with industry, government or health systems\"; the old label is gone", !!r.mode && !r.old, r);
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
