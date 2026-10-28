#!/usr/bin/env node
/**
 * Captures the V6 narrative CV tool's screens with headless Chrome, driven over the DevTools
 * protocol on a plain WebSocket. No dependencies (Node 22+ has WebSocket and fetch built in).
 *
 *   node ncv-v6-flow-map/capture-screens.js
 *
 * Output: ncv-v6-flow-map/shots/<id>-desktop.jpg, <id>-phone.jpg and shots/manifest.json.
 * Everything on screen is DEMO DATA: an invented draft seeded into localStorage before each page
 * loads, in a throwaway Chrome profile. No real draft, CV or person is involved. The script never
 * clicks Send on the Feedback step, so nothing leaves the machine.
 */
"use strict";
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");

const ROOT = path.join(__dirname, "..");
const PAGE = "file://" + path.join(ROOT, "narrative-cv-prototype-v6.html");
const OUT = path.join(__dirname, "shots");
const CHROME = process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9339;
const PROFILE = fs.mkdtempSync(path.join(os.tmpdir(), "ncv-flowmap-chrome-"));

const DEVICES = {
  desktop: { width: 1200, height: 900, dpr: 1, mobile: false, scale: 0.7, cap: 1500, quality: 52 },
  phone: { width: 390, height: 844, dpr: 1, mobile: true, scale: 1.5, cap: 2000, quality: 50 }
};

// ── Demo draft (invented) ─────────────────────────────────────────────────────────────────
const NOW = Date.now();
const demo = (over) => Object.assign({
  mode: "compose", stageKey: "setup",
  lens: { agency: "sshrc", format: "tcv", program: "Example competition (invented)", discipline: "social", discipline2: "humanities", otherField: "", careerStage: "mid", workMode: ["team", "community"] },
  ui: { checksNoteSeen: true, orderDone: true, workModeOpen: false, lensOpen: false },
  xray: { text: "" },
  contributions: [
    { title: "A public count of unpaid overtime in retail", stakes: "Retail workers report unpaid hours, and no public source counts them.", roleMode: "led", roleLine: "I designed the survey and led the analysis with two co-investigators.",
      activities: "Over three years I surveyed 2,400 workers in six cities and linked their reported hours to payroll records supplied by 14 employers.",
      outputs: "The study produced an open dataset, a method note and three papers.", outcomes: "Two provincial ministries now cite the count in their wage-enforcement reports.",
      impact: "A standing count could let enforcement agencies track unpaid hours the way they track wages.", translational: "",
      evidence: [{ text: "Open dataset, 2024, 2,400 respondents", type: "Dataset / tool", note: "The first public record of unpaid hours by city." }, { text: "Cited in two ministry reports, 2025", type: "Policy / practice uptake", note: "" }],
      flags: { outcomes: "work" }, notes: { outcomes: "Add the second ministry's name?" }, showWeave: false },
    { title: "A reading-history archive built with community libraries", stakes: "Records of what ordinary readers borrowed sit in small libraries that rarely digitize them.", roleMode: "coled", roleLine: "I co-led the archive with a librarian and two community partners.",
      activities: "With four libraries I transcribed 9,000 borrowing records and trained volunteers to keep the transcription going.", outputs: "A searchable archive and a teaching kit.",
      outcomes: "Three university courses teach from the archive.", impact: "Borrowing records could give literary history a count of its readers.", translational: "",
      evidence: [{ text: "Archive online since 2023", type: "Dataset / tool", note: "" }], flags: {}, notes: {}, showWeave: false },
    { title: "A training model for community researchers", stakes: "Community partners often join studies late and without pay.", roleMode: "part", roleLine: "I wrote the training curriculum and ran the first cohort.",
      activities: "Across two years I trained 18 community researchers and paid each from the first week.", outputs: "A curriculum and a guide for partners.", outcomes: "Four partner organizations now run the training themselves.",
      impact: "Paid training could become a standard first step in partnered studies.", translational: "", evidence: [{ text: "Curriculum, 2025", type: "Policy / practice uptake", note: "" }], flags: {}, notes: {}, showWeave: false }
  ],
  mentorCounts: { phd: "4", masters: "9", undergrad: "11", postdoc: "2" },
  mentees: [
    { stage: "PhD", kind: "community", org: "A national non-profit", unit: "Evaluation unit", recognition: "Best-paper prize at the field's main conference, 2024", why: "The role builds on a method developed in the group." },
    { stage: "Master's", kind: "government", org: "A provincial statistics office", unit: "Labour statistics division", recognition: "", why: "" }
  ],
  mentorPhilosophy: "Every project begins with a written agreement on authorship and data, revisited at the midpoint.", mentorEDI: "I removed the prior-experience requirement from assistantship postings.", mentorCrossStage: "I mentor two early-career colleagues in other departments.",
  ps: { role: "associate professor", institution: "a Canadian university", field: "labour studies and the history of reading", challenge: "Work that is hard to count goes unrecorded, and so goes unaddressed.", streams: "Counting unpaid labour; recovering ordinary readers; paying community partners.", pivot: "I began as a historian and moved to surveys when archives ran out.", standing: "Three grants, two open datasets and a community training model now used by four organizations.", programFit: "This competition funds the step from counting to using the count.", teamFit: "", horizon: "Next I will test the count in four more provinces." },
  consultQuestions: "Is contribution 1 strong enough to lead with?", selfCheck: { ownership: true, specificity: true },
  lastSavedAt: NOW,
  feedback: { answers: { useful: 4, leftWith: "An outline I will keep working on", stuck: "Demo answer: nothing unclear." }, includeSummary: true, sent: [] },
  teamNotes: [{ stage: "contrib", at: NOW - 600000, text: "Demo note: the role line prompt was clear." }],
  session: { startedAt: NOW - 1800000, stageMs: { setup: 120000, contrib: 900000, mentor: 240000 }, visits: { setup: 1, contrib: 2, mentor: 1 }, events: { assemble: 1 } }
}, over || {});

// ── The shots ─────────────────────────────────────────────────────────────────────────────
// node = the map node the screenshot belongs to. clip = CSS selector to crop to, if any.
const SHOTS = [
  { id: "shell", node: "s_shell", title: "Page shell: banner, privacy line, Steps rail", state: demo({ stageKey: "contrib" }), cropTop: 520 },
  { id: "setup", node: "s_setup", title: "Setup", state: demo({ stageKey: "setup", lens: { agency: "sshrc", format: "tcv", program: "", discipline: "social", discipline2: "", otherField: "", careerStage: "mid", workMode: [] } }) },
  { id: "xray", node: "s_xray", title: "Structural read (draft mode)", state: demo({ mode: "xray", stageKey: "xray", xray: { text: "I am a researcher working on urban water systems. We have worked on various projects related to stormwater over the years.\n\n1. Stormwater modelling. We developed a model for predicting overflow events. It was published in a leading journal." } }) },
  { id: "contrib", node: "s_contrib", title: "Contributions", state: demo({ stageKey: "contrib" }) },
  { id: "weave", node: "s_weave", title: "Assembled paragraph (inside a contribution)", state: demo({ stageKey: "contrib" }), after: "const b=[...document.querySelectorAll('button')].find(x=>/Assemble/.test(x.textContent)); b && b.click();", clip: ".v4-weave-body", pad: 160 },
  { id: "mentor", node: "s_mentor", title: "Mentorship", state: demo({ stageKey: "mentor" }) },
  { id: "ps", node: "s_ps", title: "Personal statement", state: demo({ stageKey: "ps" }) },
  { id: "order", node: "s_order", title: "Order of contributions", state: demo({ stageKey: "order" }) },
  { id: "review", node: "s_review", title: "Review and export", state: demo({ stageKey: "review" }) },
  { id: "feedback", node: "s_feedback", title: "Feedback", state: demo({ stageKey: "feedback" }) },
  { id: "notes", node: "s_notes", title: "Note for the team (panel)", state: demo({ stageKey: "contrib" }), after: "document.getElementById('v4-note-open').click();", cropTop: 420 },
  { id: "lens", node: "s_lens", title: "Change these answers (inline panel)", state: demo({ stageKey: "contrib", ui: { checksNoteSeen: true, orderDone: true, lensOpen: true } }), clip: ".v4-lens-panel", pad: 40, includeBar: true },
  { id: "reentry", node: "s_reentry", title: "Welcome-back banner", state: demo({ stageKey: "mentor" }), cropTop: 460 },
  { id: "print", node: "s_print", title: "Print view (new window)", state: demo({ stageKey: "review" }), print: true }
];

// ── Minimal CDP client ────────────────────────────────────────────────────────────────────
let chrome, ws, nextId = 1;
const pending = new Map();
const listeners = [];
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
function send(method, params) {
  return new Promise((resolve, reject) => {
    const id = nextId++;
    pending.set(id, { resolve, reject, method });
    ws.send(JSON.stringify({ id, method, params: params || {} }));
  });
}
function waitEvent(name, ms) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("timeout waiting for " + name)), ms || 15000);
    listeners.push({ name, fn: (p) => { clearTimeout(t); resolve(p); } });
  });
}
const evalJs = async (expr) => {
  const r = await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error("page error: " + (r.exceptionDetails.exception && r.exceptionDetails.exception.description || r.exceptionDetails.text));
  return r.result.value;
};

async function launch() {
  chrome = spawn(CHROME, ["--headless=new", "--remote-debugging-port=" + PORT, "--user-data-dir=" + PROFILE, "--no-first-run",
    "--no-default-browser-check", "--disable-gpu", "--hide-scrollbars", "--force-color-profile=srgb", "about:blank"], { stdio: "ignore" });
  for (let i = 0; i < 60; i++) {
    try { const r = await fetch("http://127.0.0.1:" + PORT + "/json/version"); if (r.ok) break; } catch (_) {}
    await sleep(250);
  }
  const res = await fetch("http://127.0.0.1:" + PORT + "/json/new?about:blank", { method: "PUT" });
  const target = await res.json();
  ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
  ws.onmessage = (m) => {
    const msg = JSON.parse(m.data);
    if (msg.id && pending.has(msg.id)) {
      const p = pending.get(msg.id); pending.delete(msg.id);
      if (msg.error) p.reject(new Error(p.method + ": " + msg.error.message)); else p.resolve(msg.result);
    } else if (msg.method) {
      for (let i = listeners.length - 1; i >= 0; i--) if (listeners[i].name === msg.method) { const l = listeners.splice(i, 1)[0]; l.fn(msg.params); }
    }
  };
  await send("Page.enable");
  await send("Runtime.enable");
}

function cleanup() {
  try { ws && ws.close(); } catch (_) {}
  try { chrome && chrome.kill("SIGKILL"); } catch (_) {}
  try { fs.rmSync(PROFILE, { recursive: true, force: true }); } catch (_) {}
}

async function shoot(shot, devName) {
  const dev = DEVICES[devName];
  await send("Emulation.setDeviceMetricsOverride", { width: dev.width, height: dev.height, deviceScaleFactor: dev.dpr, mobile: dev.mobile });
  if (dev.mobile) await send("Emulation.setTouchEmulationEnabled", { enabled: true });
  const seed = "try{localStorage.setItem('ncv-v6'," + JSON.stringify(JSON.stringify(shot.state)) + ")}catch(e){}";
  const added = await send("Page.addScriptToEvaluateOnNewDocument", { source: seed });
  const loaded = waitEvent("Page.loadEventFired");
  await send("Page.navigate", { url: PAGE });
  await loaded;
  await sleep(500);
  if (shot.after) { await evalJs("(function(){" + shot.after + "})()"); await sleep(300); }

  let pageForShot = null;
  if (shot.print) {
    // Capture what window.open would show: swap window.open for a recorder, click the button,
    // then load the recorded HTML into this same tab.
    const html = await evalJs("(function(){var rec='';var orig=window.open;window.open=function(){return{document:{write:function(h){rec+=h},close:function(){}}}};" +
      "var b=[...document.querySelectorAll('button')].find(function(x){return /print view/i.test(x.textContent)});b&&b.click();window.open=orig;return rec})()");
    if (!html) throw new Error("print view recorded nothing");
    const loaded2 = waitEvent("Page.loadEventFired");
    await send("Page.navigate", { url: "data:text/html;base64," + Buffer.from(html, "utf8").toString("base64") });
    await loaded2; await sleep(300);
  }
  if (shot.scrollTo) { await evalJs("(function(){var e=document.querySelector(" + JSON.stringify(shot.scrollTo) + ");if(e)e.scrollIntoView({block:'start'})})()"); await sleep(200); }

  const docH = await evalJs("Math.ceil(Math.max(document.documentElement.scrollHeight, document.body.scrollHeight))");
  let y = 0, h = Math.min(docH, dev.cap);
  if (shot.cropTop) h = Math.min(docH, shot.cropTop);
  if (shot.clip) {
    const r = await evalJs("(function(){var e=document.querySelector(" + JSON.stringify(shot.clip) + ");if(!e)return null;var b=e.getBoundingClientRect();return {y:b.top+window.scrollY,h:b.height}})()");
    if (r) { const pad = shot.pad || 20; y = Math.max(0, r.y - pad); h = Math.min(docH - y, Math.min(dev.cap, r.h + pad * 2)); }
  }
  y = Math.round(y); h = Math.round(h);
  // Size the viewport to the capture so the layout is the one the researcher sees at that width.
  await send("Emulation.setDeviceMetricsOverride", { width: dev.width, height: Math.max(h + y, 200), deviceScaleFactor: dev.dpr, mobile: dev.mobile });
  await sleep(150);
  const shotRes = await send("Page.captureScreenshot", { format: "jpeg", quality: dev.quality,
    clip: { x: 0, y, width: dev.width, height: h, scale: dev.scale } });
  const file = shot.id + "-" + devName + ".jpg";
  fs.writeFileSync(path.join(OUT, file), Buffer.from(shotRes.data, "base64"));
  await send("Page.removeScriptToEvaluateOnNewDocument", { identifier: added.identifier });
  return { file, w: Math.round(dev.width * dev.scale), h: Math.round(h * dev.scale), bytes: fs.statSync(path.join(OUT, file)).size };
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  await launch();
  const manifest = { generated: new Date().toISOString(), page: "narrative-cv-prototype-v6.html", demoData: true, shots: [] };
  for (const shot of SHOTS) {
    const entry = { id: shot.id, node: shot.node, title: shot.title, files: {} };
    for (const dev of Object.keys(DEVICES)) {
      try { entry.files[dev] = await shoot(shot, dev); console.log("ok  ", shot.id, dev, entry.files[dev].bytes + " B"); }
      catch (e) { console.log("FAIL", shot.id, dev, e.message); entry.files[dev] = null; }
    }
    manifest.shots.push(entry);
  }
  fs.writeFileSync(path.join(OUT, "manifest.json"), JSON.stringify(manifest, null, 1));
})().catch(e => { console.error(e); process.exitCode = 1; }).finally(cleanup);
