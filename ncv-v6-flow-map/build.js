#!/usr/bin/env node
/**
 * Fills the template's SHOTDATA placeholder with the screenshots (base64 JPEG) and writes the
 * finished single-file map. The template and the built file stay separate.
 *
 *   node ncv-v6-flow-map/build.js
 *
 * Reads:  ncv-v6-flow-map/ncv-v6-flow-map.template.html, shots/manifest.json, shots/*.jpg
 * Writes: ncv-v6-flow-map/ncv-v6-flow-map.html  (one file, no network, no dependencies)
 * Run capture-screens.js first to make or refresh the shots. With no shots the map still works,
 * only without thumbnails.
 */
"use strict";
const fs = require("fs");
const path = require("path");
const dir = __dirname;
const template = fs.readFileSync(path.join(dir, "ncv-v6-flow-map.template.html"), "utf8");
const manifestPath = path.join(dir, "shots", "manifest.json");
let shotData = null, count = 0;
if (fs.existsSync(manifestPath)) {
  const m = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  shotData = {};
  m.shots.forEach(s => {
    const e = { title: s.title, node: s.node };
    Object.keys(s.files).forEach(dev => {
      const info = s.files[dev]; if (!info) return;
      const buf = fs.readFileSync(path.join(dir, "shots", info.file));
      e[dev] = { src: "data:image/jpeg;base64," + buf.toString("base64"), w: info.w, h: info.h };
      count++;
    });
    shotData[s.id] = e;
  });
}
if (template.indexOf("/*SHOTDATA*/null") < 0) throw new Error("placeholder /*SHOTDATA*/null not found in the template");
const json = JSON.stringify(shotData).replace(/<\//g, "<\\/");
let out = template.replace("/*SHOTDATA*/null", () => json).replace("/*BUILTAT*/", new Date().toISOString().slice(0, 10));
const dest = path.join(dir, "ncv-v6-flow-map.html");
fs.writeFileSync(dest, out);
console.log("built", dest, (out.length / 1048576).toFixed(2) + " MB,", count, "images embedded");
