#!/usr/bin/env node
/**
 * Captures the V7 design mock-ups (ncv-v7-mockups.html) as full-page PNGs, desktop and 375 px phone,
 * with headless Chrome over the DevTools protocol. No dependencies (Node 22+).
 *   node ncv-v7-design/capture.js            # all shots
 *   node ncv-v7-design/capture.js contrib    # only shots whose id contains "contrib"
 * Output: ncv-v7-design/shots/<id>-desktop.png and <id>-phone.png. All content is invented.
 */
"use strict";
const fs = require("fs"), os = require("os"), path = require("path"), { spawn } = require("child_process");
const PAGE = "file://" + path.join(__dirname, "ncv-v7-mockups.html");
const OUT = path.join(__dirname, "shots");
const CHROME = process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9347, PROFILE = fs.mkdtempSync(path.join(os.tmpdir(), "ncv-v7-design-"));
const DEV = { desktop: { width: 1180, height: 900, w: "desktop" }, phone: { width: 375, height: 812, w: "phone", mobile: true } };
// id, screen, state, extra JS to run after load (optional)
const SHOTS = [
  ["01-start", "start", "first"],
  ["02-profile-agency", "profile", "q1"],
  ["03-profile-agency-chosen", "profile", "q2"],
  ["04-profile-frq-feedback", "profile", "q2frq"],
  ["05-profile-discipline", "profile", "disc"],
  ["06-profile-second-field", "profile", "second"],
  ["07-profile-work-modes", "profile", "modes"],
  ["08-profile-complete", "profile", "done"],
  ["10-contrib-arrival", "contrib", "arrival"],
  ["11-contrib-example-built", "contrib", "example"],
  ["12-contrib-field-open", "contrib", "open"],
  ["13-contrib-mixed", "contrib", "mixed"],
  ["14-contrib-complete", "contrib", "complete"],
  ["15-contrib-evidence", "contrib", "evidence"],
  ["16-contrib-folded", "contrib", "folded"],
  ["20-mentor-arrival", "mentor", "arrival"],
  ["21-mentor-people", "mentor", "filled"],
  ["22-mentor-practice", "mentor", "practice"],
  ["30-ps-arrival", "ps", "arrival"],
  ["31-ps-mid-cross-note", "ps", "mid"],
  ["32-ps-cv-frq", "ps", "mid", "opt=0"],
  ["40-review-arrival", "review", "arrival"],
  ["41-review-shrunk", "review", "shrunk"],
  ["42-review-nothing-missing", "review", "nothing"],
  ["50-export", "export", "default"],
  ["51-export-agency-not-chosen", "export", "unsure"]
];
let chrome, ws, nextId = 1; const pending = new Map();
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const send = (method, params) => new Promise((resolve, reject) => { const id = nextId++; pending.set(id, { resolve, reject }); ws.send(JSON.stringify({ id, method, params: params || {} })); });
async function launch() {
  chrome = spawn(CHROME, ["--headless=new", "--remote-debugging-port=" + PORT, "--user-data-dir=" + PROFILE, "--no-first-run", "--no-default-browser-check", "--disable-gpu", "--hide-scrollbars", "--force-color-profile=srgb", "about:blank"], { stdio: "ignore" });
  for (let i = 0; i < 60; i++) { try { const r = await fetch("http://127.0.0.1:" + PORT + "/json/version"); if (r.ok) break; } catch (_) {} await sleep(250); }
  const t = await (await fetch("http://127.0.0.1:" + PORT + "/json/new?about:blank", { method: "PUT" })).json();
  ws = new WebSocket(t.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  ws.onmessage = (m) => { const msg = JSON.parse(m.data); if (msg.id && pending.has(msg.id)) { const p = pending.get(msg.id); pending.delete(msg.id); msg.error ? p.reject(new Error(msg.error.message)) : p.resolve(msg.result); } };
  await send("Page.enable"); await send("Runtime.enable");
}
async function shoot([id, s, st, extra], dev) {
  const d = DEV[dev];
  await send("Emulation.setDeviceMetricsOverride", { width: d.width, height: d.height, deviceScaleFactor: 1, mobile: !!d.mobile });
  await send("Page.navigate", { url: "about:blank" }); await sleep(100);
  await send("Page.navigate", { url: PAGE + "#s=" + s + "&st=" + st + "&w=" + d.w + "&clean=1&rm=1" + (extra ? "&" + extra : "") });
  await sleep(700);
  const errs = await send("Runtime.evaluate", { expression: "window.__err||''", returnByValue: true });
  const h = (await send("Runtime.evaluate", { expression: "Math.ceil(document.documentElement.scrollHeight)", returnByValue: true })).result.value;
  const shot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: 0, y: 0, width: d.width, height: Math.min(h, 6000), scale: 1 } });
  fs.writeFileSync(path.join(OUT, id + "-" + dev + ".png"), Buffer.from(shot.data, "base64"));
  return errs.result.value;
}
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const only = process.argv[2];
  await launch();
  try {
    await send("Runtime.evaluate", { expression: "1" });
    for (const s of SHOTS) { if (only && s[0].indexOf(only) < 0) continue; for (const dev of ["desktop", "phone"]) { const e = await shoot(s, dev); console.log(s[0], dev, e ? "ERR " + e : "ok"); } }
  } finally { try { ws.close(); } catch (_) {} try { chrome.kill("SIGKILL"); } catch (_) {} try { fs.rmSync(PROFILE, { recursive: true, force: true }); } catch (_) {} }
})().catch(e => { console.error(e); process.exit(1); });
