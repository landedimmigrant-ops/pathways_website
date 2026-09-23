#!/usr/bin/env node
/* aem-review-kit/snapshot/receiver.js
   Local-only receiver for snapshot/extract.js. Writes what it receives into the folder given
   as the first argument (default: current folder). Stop it when the snapshot is in.

     node aem-review-kit/snapshot/receiver.js /tmp/aem-snapshot
*/
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 8792;
const OUT = path.resolve(process.argv[2] || ".");
fs.mkdirSync(OUT, { recursive: true });
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Private-Network": "true",
};
http.createServer((req, res) => {
  if (req.method === "OPTIONS") { res.writeHead(204, cors); return res.end(); }
  const url = new URL(req.url, `http://localhost:${PORT}`);
  if (req.method === "POST" && url.pathname === "/save") {
    const name = (url.searchParams.get("name") || "").replace(/[^a-z0-9._-]/gi, "");
    if (!name) { res.writeHead(400, cors); return res.end("bad name"); }
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      const buf = Buffer.concat(chunks);
      fs.writeFileSync(path.join(OUT, name), buf);
      console.log(`[receiver] ${name} ${buf.length} bytes -> ${OUT}`);
      res.writeHead(200, { ...cors, "Content-Type": "text/plain" }); res.end("ok: snapshot received");
    });
    return;
  }
  res.writeHead(404, cors); res.end("not found");
}).listen(PORT, "127.0.0.1", () => console.log(`[receiver] listening on http://127.0.0.1:${PORT} -> ${OUT}`));
