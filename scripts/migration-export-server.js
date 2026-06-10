#!/usr/bin/env node
/**
 * migration-export-server.js
 * ------------------------------------------------------------------
 * Tiny LOCAL-ONLY helper for producing the standalone section exports in
 * `pathways_migration_june_2026/`. It exists because the Pathways site renders every
 * section at runtime from app.js + data.js (+ the live Sheet), so the most
 * faithful way to capture a section's layout is to snapshot the *rendered*
 * DOM from a browser. This server is the bridge: the browser assembles a
 * self-contained HTML document (rendered section + inlined styles.css + Inter
 * font + a minimal Concordia header/footer) and POSTs it here to be written
 * to disk — no copy-paste, no fidelity loss.
 *
 * It is a dev tool, not part of the site. It binds to localhost, only writes
 * sanitized *.html into pathways_migration_june_2026/, and should be stopped when done.
 *
 *   node scripts/migration-export-server.js   # then run the browser export
 *
 * See pathways_migration_june_2026/MIGRATION_LOG.md for the full export procedure.
 */
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 8791;
const OUT_DIR = path.resolve(__dirname, "..", "pathways_migration_june_2026");
fs.mkdirSync(OUT_DIR, { recursive: true });

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

http.createServer((req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, cors);
    return res.end();
  }
  const url = new URL(req.url, `http://localhost:${PORT}`);
  if (req.method === "POST" && url.pathname === "/save") {
    const raw = (url.searchParams.get("name") || "").trim();
    const name = raw.replace(/[^a-z0-9._-]/gi, "");
    if (!name || !/\.html$/.test(name)) {
      res.writeHead(400, cors);
      return res.end("bad name");
    }
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      fs.writeFileSync(path.join(OUT_DIR, name), body);
      console.log(`[export] wrote ${name} (${body.length} bytes)`);
      res.writeHead(200, cors);
      res.end("ok");
    });
    return;
  }
  res.writeHead(404, cors);
  res.end("not found");
}).listen(PORT, "127.0.0.1", () => {
  console.log(`[export] save-server on http://127.0.0.1:${PORT} → ${OUT_DIR}`);
});
