#!/usr/bin/env node
/**
 * Opens the built map in real headless Chrome (file://, network switched off) and exercises it:
 * open a node, open a screen, save a note, go back, list notes, switch preset, steps, fold,
 * search, export/import notes, zoom kept. Prints PASS/FAIL lines and any console errors.
 *
 *   node ncv-v6-flow-map/test-map.js
 */
"use strict";
const fs = require("fs"), os = require("os"), path = require("path"), { spawn } = require("child_process");
const FILE = "file://" + path.join(__dirname, "ncv-v6-flow-map.html");
const CHROME = process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9341, PROFILE = fs.mkdtempSync(path.join(os.tmpdir(), "ncv-flowmap-test-"));
let chrome, ws, nid = 1; const pend = new Map(), lis = [], errors = [], requests = [];
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const send = (m, p) => new Promise((res, rej) => { const id = nid++; pend.set(id, { res, rej, m }); ws.send(JSON.stringify({ id, method: m, params: p || {} })); });
const waitEv = (n, ms) => new Promise((res, rej) => { const t = setTimeout(() => rej(new Error("timeout " + n)), ms || 15000); lis.push({ n, f: (p) => { clearTimeout(t); res(p); } }); });
const ev = async (x) => { const r = await send("Runtime.evaluate", { expression: x, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw new Error("page error: " + (r.exceptionDetails.exception && r.exceptionDetails.exception.description || r.exceptionDetails.text)); return r.result.value; };
let pass = 0, fail = 0; const ok = (name, cond, extra) => { if (cond) { pass++; console.log("PASS", name); } else { fail++; console.log("FAIL", name, extra === undefined ? "" : JSON.stringify(extra)); } };
const click = (sel) => ev("(function(){var e=document.querySelector(" + JSON.stringify(sel) + ");if(!e)return false;e.dispatchEvent(new MouseEvent('click',{bubbles:true}));return true})()");

(async () => {
  chrome = spawn(CHROME, ["--headless=new", "--remote-debugging-port=" + PORT, "--user-data-dir=" + PROFILE, "--no-first-run", "--disable-gpu", "about:blank"], { stdio: "ignore" });
  for (let i = 0; i < 60; i++) { try { if ((await fetch("http://127.0.0.1:" + PORT + "/json/version")).ok) break; } catch (_) {} await sleep(250); }
  const t = await (await fetch("http://127.0.0.1:" + PORT + "/json/new?about:blank", { method: "PUT" })).json();
  ws = new WebSocket(t.webSocketDebuggerUrl); await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
  ws.onmessage = (m) => { const g = JSON.parse(m.data);
    if (g.id && pend.has(g.id)) { const p = pend.get(g.id); pend.delete(g.id); g.error ? p.rej(new Error(p.m + ": " + g.error.message)) : p.res(g.result); }
    else if (g.method) {
      if (g.method === "Runtime.exceptionThrown") errors.push("exception: " + (g.params.exceptionDetails.exception && g.params.exceptionDetails.exception.description || g.params.exceptionDetails.text));
      if (g.method === "Runtime.consoleAPICalled" && (g.params.type === "error" || g.params.type === "assert")) errors.push("console." + g.params.type + ": " + g.params.args.map(a => a.value || a.description).join(" "));
      if (g.method === "Log.entryAdded" && g.params.entry.level === "error") errors.push("log: " + g.params.entry.text + " " + (g.params.entry.url || ""));
      if (g.method === "Network.requestWillBeSent") requests.push(g.params.request.url);
      for (let i = lis.length - 1; i >= 0; i--) if (lis[i].n === g.method) { const l = lis.splice(i, 1)[0]; l.f(g.params); }
    } };
  await send("Page.enable"); await send("Runtime.enable"); await send("Log.enable"); await send("Network.enable");
  await send("Network.emulateNetworkConditions", { offline: true, latency: 0, downloadThroughput: 0, uploadThroughput: 0 });
  await send("Emulation.setDeviceMetricsOverride", { width: 1500, height: 900, deviceScaleFactor: 1, mobile: false });
  const loaded = waitEv("Page.loadEventFired"); await send("Page.navigate", { url: FILE }); await loaded; await sleep(900);
  await ev("window.confirm=function(){return true}; localStorage.removeItem('ncv-v6-flowmap-notes-v1'); true");

  const fm = "window.__flowmap";
  ok("page loads, nodes drawn", (await ev(fm + ".N.length")) > 40 && (await ev("document.querySelectorAll('g.node').length")) === (await ev(fm + ".N.length")));
  ok("edges drawn", (await ev("document.querySelectorAll('g.edge').length")) > 60);
  // open a node
  await ev(fm + ".selectNode('s_setup')"); await sleep(400);
  ok("node panel opens", (await ev("document.querySelector('#panel h2').textContent")) === "Setup");
  ok("node panel lists source + neighbours", (await ev("document.querySelectorAll('#panel code').length")) >= 1 && (await ev("document.querySelectorAll('#panel button.nbr').length")) >= 4);
  ok("two thumbnails on a screen node", (await ev("document.querySelectorAll('#panel button.shotthumb').length")) === 2);
  // open a screen
  await click("#panel button.shotthumb.desktop"); await sleep(200);
  ok("screen viewer opens full width in panel", (await ev("!!document.querySelector('#panel .viewer img') && /Setup/.test(document.querySelector('#panel h2').textContent)")));
  ok("viewer has Back and Wider panel", (await ev("[...document.querySelectorAll('#panel button')].map(b=>b.textContent).filter(t=>/Back|Wider/.test(t)).length")) === 2);
  await ev("[...document.querySelectorAll('#panel button')].find(b=>/Wider/.test(b.textContent)).click()");
  ok("wider panel toggles", (await ev("document.getElementById('panel').classList.contains('wide')")));
  // save a note on the screen
  await ev("(function(){var ta=document.querySelector('#panel textarea.note');ta.value='Screen note from test';ta.dispatchEvent(new Event('input',{bubbles:true}));ta.dispatchEvent(new Event('blur'))})()"); await sleep(400);
  ok("screen note saved in localStorage", /Screen note from test/.test(await ev("localStorage.getItem('ncv-v6-flowmap-notes-v1')")));
  // back
  await ev("[...document.querySelectorAll('#panel button')].find(b=>/Back/.test(b.textContent)).click()"); await sleep(150);
  ok("Back returns to the node", (await ev("document.querySelector('#panel h2').textContent")) === "Setup" && !(await ev("!!document.querySelector('#panel .viewer')")));
  await ev("(function(){var ta=document.querySelector('#panel textarea.note');ta.value='Node note from test';ta.dispatchEvent(new Event('input',{bubbles:true}));ta.dispatchEvent(new Event('blur'))})()"); await sleep(400);
  ok("node outlined after a note", (await ev("document.querySelector('g.node[data-id=s_setup] .notehalo').getAttribute('opacity')")) === "1");
  // all notes
  await click("#allNotes"); await sleep(150);
  const li = await ev("document.querySelectorAll('#panel .allnotes li').length");
  ok("All notes lists both notes", li === 2, li);
  const md = await ev(fm + ".notesMarkdown()");
  ok("markdown export has keys", /node:s_setup/.test(md) && /shot:setup:desktop/.test(md));
  await ev("document.querySelector('#panel .allnotes button.jump').click()"); await sleep(300);
  ok("note list jumps to its thing", /Setup/.test(await ev("document.querySelector('#panel h2').textContent")));
  // import round trip (markdown)
  await ev("localStorage.removeItem('ncv-v6-flowmap-notes-v1')"); 
  await click("#allNotes"); await sleep(100);
  await ev("(function(md){var inp=document.getElementById('importFile');var dt=new DataTransfer();dt.items.add(new File([md],'n.md',{type:'text/markdown'}));inp.files=dt.files;inp.dispatchEvent(new Event('change'))})(" + JSON.stringify(md) + ")"); await sleep(600);
  ok("markdown import restores both notes", (await ev(fm + ".noteKeys().length")) === 2 && /Node note from test/.test(await ev("localStorage.getItem('ncv-v6-flowmap-notes-v1')")) && /Screen note from test/.test(await ev("localStorage.getItem('ncv-v6-flowmap-notes-v1')")), await ev(fm + ".noteKeys()"));
  // presets and zoom kept
  await ev("(function(){var S=" + fm + ".S;S.view.k=1.37;S.view.x=-80;S.view.y=-20;})()");
  const nodesAll = await ev("[...document.querySelectorAll('g.node')].filter(g=>g.style.display!=='none').length");
  await click("[data-p=journey]"); await sleep(500);
  const nodesJ = await ev("[...document.querySelectorAll('g.node')].filter(g=>g.style.display!=='none').length");
  const typesJ = await ev("[...new Set([...document.querySelectorAll('g.edge title')].map(t=>t.textContent.match(/\\[(\\w+)\\]/)[1]))].join(',')");
  ok("preset 'User journey only' hides logic/data", nodesJ < nodesAll && nodesJ === 27, { nodesAll, nodesJ });
  ok("preset leaves flow edges only", typesJ === "flow", typesJ);
  ok("zoom position kept across the preset", (await ev(fm + ".S.view.k")) === 1.37 && (await ev(fm + ".S.view.x")) === -80);
  await click("[data-p=data]"); await sleep(400);
  ok("preset 'Data in/out' shows data nodes", (await ev("document.querySelector('g.node[data-id=d_ls]').style.display")) !== "none" && (await ev("document.querySelector('g.node[data-id=u_open]').style.display")) === "none");
  await click("[data-p=all]"); await sleep(400);
  // steps
  await click(".stepbtn:nth-of-type(4)"); await sleep(400);
  ok("step 4 opens its panel", /Contributions/.test(await ev("document.querySelector('#panel h2').textContent")));
  ok("step dims other nodes", (await ev("document.querySelector('g.node[data-id=u_reset]').style.opacity")) < 0.5);
  await click("#steps .btn:nth-of-type(3)"); // Clear is last; just ensure no crash
  // fold
  await click("#collapseAll"); await sleep(400);
  const vis1 = await ev("[...document.querySelectorAll('g.node')].filter(g=>g.style.display!=='none').length");
  await click("#expandAll"); await sleep(400);
  const vis2 = await ev("[...document.querySelectorAll('g.node')].filter(g=>g.style.display!=='none').length");
  ok("collapse all hides branch nodes, expand all restores them", vis1 < vis2 && vis2 === (await ev(fm + ".N.length")), { vis1, vis2 });
  await ev("document.querySelector('g.node[data-id=l_prompts] .fold').dispatchEvent(new MouseEvent('click',{bubbles:true}))"); await sleep(400);
  ok("one branch folds to one node", (await ev("document.querySelector('g.node[data-id=l_lint]').style.display")) === "none");
  await ev("document.querySelector('g.node[data-id=l_prompts] .fold').dispatchEvent(new MouseEvent('click',{bubbles:true}))"); await sleep(300);
  // search
  await ev("(function(){var q=document.getElementById('q');q.value='feedback sheet';q.dispatchEvent(new Event('input'))})()");
  ok("search finds a node by name", (await ev("document.querySelectorAll('#qres button').length")) >= 1);
  await ev("document.querySelector('#qres button').click()"); await sleep(300);
  ok("search result opens the node", /feedback sheet/i.test(await ev("document.querySelector('#panel h2').textContent")));
  ok("'?' node says why", (await ev("!!document.querySelector('#panel .qflag')")));
  // general note
  await click("#generalNote"); await sleep(100);
  await ev("(function(){var ta=document.querySelector('#panel textarea.note');ta.value='General note from test';ta.dispatchEvent(new Event('input',{bubbles:true}));ta.dispatchEvent(new Event('blur'))})()"); await sleep(400);
  ok("general note saved", /General note from test/.test(await ev("localStorage.getItem('ncv-v6-flowmap-notes-v1')")));
  // click pins the highlight; a second click lets go
  await ev("(function(){var g=document.querySelector('g.node[data-id=d_ls]');g.dispatchEvent(new MouseEvent('click'))})()"); await sleep(400);
  const pinOp = async (id) => +(await ev("document.querySelector('g.node[data-id=" + id + "]').style.opacity"));
  await ev("document.querySelector('g.node[data-id=u_reset]').dispatchEvent(new MouseEvent('mouseenter'))");
  ok("pinned node stays lit while hovering another", (await pinOp("d_ls")) === 1 && (await pinOp("u_reset")) < 0.5);
  await ev("document.querySelector('g.node[data-id=u_reset]').dispatchEvent(new MouseEvent('mouseleave'))");
  await ev("document.querySelector('g.node[data-id=d_ls]').dispatchEvent(new MouseEvent('click'))"); await sleep(300);
  ok("second click clears the pin", /How to read/.test(await ev("document.querySelector('#panel h2').textContent")));
  await ev("document.querySelector('g.node[data-id=u_reset]').dispatchEvent(new MouseEvent('mouseenter'))");
  ok("hover works again after letting go", (await pinOp("u_reset")) === 1);
  await ev("document.querySelector('g.node[data-id=u_reset]').dispatchEvent(new MouseEvent('mouseleave'))");
  // hover
  await ev("(function(){var g=document.querySelector('g.node[data-id=d_ls]');g.dispatchEvent(new MouseEvent('mouseenter'))})()");
  ok("hover dims unrelated nodes", (await ev("document.querySelector('g.node[data-id=u_reset]').style.opacity")) < 0.5 || (await ev("document.querySelector('g.node[data-id=x_css]').style.opacity")) < 0.5);
  // screenshot for a look
  const shot = await send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(process.env.TEST_SHOT || path.join(os.tmpdir(), "flowmap-test.png"), Buffer.from(shot.data, "base64"));
  // offline / network
  const external = requests.filter(u => !/^(file|data|blob|about):/.test(u));
  ok("no network requests (run with the network switched off)", external.length === 0, external);
  console.log(errors.length ? "CONSOLE ERRORS:\n" + errors.join("\n") : "Console errors: none");
  console.log("\n" + pass + " passed, " + fail + " failed; file " + (fs.statSync(path.join(__dirname, "ncv-v6-flow-map.html")).size / 1048576).toFixed(2) + " MB");
  process.exitCode = fail || errors.length ? 1 : 0;
})().catch(e => { console.error("TEST ERROR", e); process.exitCode = 1; }).finally(() => { try { ws.close(); } catch (_) {} try { chrome.kill("SIGKILL"); } catch (_) {} try { fs.rmSync(PROFILE, { recursive: true, force: true }); } catch (_) {} });
