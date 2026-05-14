// Fetches content from Google Sheets and writes static JSON to content/data/.
// Usage: node scripts/bake.js
// Output: content/data/workshops.json, content/data/opportunities.json, content/data/external-resources.json
//
// After running, review the diff (git diff content/data/) before committing.

const fs = require("fs");
const path = require("path");

// Sheet ID and tab names MUST stay in sync with the SHEETS block at the top
// of app.js. The opportunities-shaped tab is named "place_holders" in the
// sheet — it doubles as a staging area; rows are filtered by their `version`
// column via isApprovedRow below.
const SHEET_ID = "1IQGINsUTQMWLm4IJY49dr76pMeWkIH_vj-aLnj9jD1Y";
const TABS = {
  workshops: "workshops",
  opportunities: "place_holders",
  externalResources: "external-resources"
};

const outDir = path.resolve(__dirname, "../content/data");
fs.mkdirSync(outDir, { recursive: true });

// RFC4180 CSV parser — matches parseCsv in app.js exactly
const parseCsv = (text) => {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { cell += '"'; i++; } else { inQuotes = false; }
      } else {
        cell += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(cell); cell = "";
    } else if (ch === "\n") {
      row.push(cell); rows.push(row); row = []; cell = "";
    } else if (ch === "\r") {
      // swallow
    } else {
      cell += ch;
    }
  }
  if (cell.length || row.length) { row.push(cell); rows.push(row); }
  if (!rows.length) return [];
  const headers = rows.shift();
  return rows
    .filter((r) => r.some((v) => v && v.length))
    .map((r) => headers.reduce((acc, h, idx) => { acc[h] = r[idx] || ""; return acc; }, {}));
};

const splitMulti = (value) => (value || "").split(/\s*;\s*/).filter(Boolean);

// Approval gate — keep in sync with isApprovedRow in app.js. Tabs without a
// `version` column (e.g. external-resources today) are always considered
// approved; tabs with the column require an exact "approved" value.
const isApprovedRow = (row) => {
  if (!("version" in row)) return true;
  const v = (row.version || "").toString().trim().toLowerCase();
  return v === "approved";
};

const fetchTab = async (tabName) => {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tabName)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Sheet request failed for tab "${tabName}" (${res.status})`);
  return parseCsv(await res.text());
};

// Capacity status for a row. Normalises a free-text `status` column into one
// of "open" | "full" | "cancelled". Anything blank or unrecognised → "open"
// so existing rows keep their current behaviour. Keep in sync with
// normaliseStatus in app.js.
const normaliseStatus = (raw) => {
  const v = (raw || "").toString().trim().toLowerCase();
  if (!v) return "open";
  if (["full", "fully booked", "booked", "waitlist", "wait list", "wait-list"].includes(v)) return "full";
  if (["cancelled", "canceled", "off", "closed"].includes(v)) return "cancelled";
  return "open";
};

// Row mappers — must stay in sync with app.js fetchWorkshopsFromSheet / mapOpportunityRow
const mapWorkshopRow = (row) => ({
  id: row.id,
  slug: row.slug || undefined,
  title: row.title || row.Title,
  format: row.format,
  time: row.time,
  pathways: splitMulti(row.pathways),
  stages: splitMulti(row.stages),
  tags: splitMulti(row.tags),
  summary: row.summary || "",
  featuredHome: String(row.featuredHome).toLowerCase() === "true",
  internalRoute: row.internalRoute || undefined,
  file: row.file || undefined,
  bookingUrl: row.bookingUrl || "",
  provider: row.provider || "",
  docUrl: row.docUrl || "",
  status: normaliseStatus(row.status)
});

const mapOpportunityRow = (row) => {
  const stages = splitMulti(row.stage);
  const record = {
    id: row.id,
    title: row.title,
    category: row.category || "",
    stage: stages.length > 1 ? stages : (stages[0] || ""),
    format: row.format || "",
    time: row.time || "",
    pathway: splitMulti(row.pathway),
    tags: splitMulti(row.tags),
    summary: row.summary || "",
    details: {
      who: row.detailsWho || "",
      what: row.detailsWhat || "",
      outcomes: row.detailsOutcomes || ""
    }
  };
  if (row.author) record.author = row.author;
  if (row.provider) record.provider = row.provider;
  if (row.externalUrl) record.externalUrl = row.externalUrl;
  if (row.bookingUrl) record.bookingUrl = row.bookingUrl;
  record.status = normaliseStatus(row.status);
  return record;
};

const writeJson = (filename, rows) => {
  fs.writeFileSync(path.join(outDir, filename), JSON.stringify(rows, null, 2));
  console.log(`  wrote ${filename} (${rows.length} rows)`);
};

(async () => {
  console.log("[bake] Fetching from Google Sheets…");
  try {
    const [workshopRows, opportunityRows, externalRows] = await Promise.all([
      fetchTab(TABS.workshops),
      fetchTab(TABS.opportunities),
      fetchTab(TABS.externalResources)
    ]);

    const workshops = workshopRows.filter(isApprovedRow).map(mapWorkshopRow);
    const opportunities = opportunityRows.filter(isApprovedRow).map(mapOpportunityRow);
    const externalResources = externalRows.filter(isApprovedRow).map((row) => {
      const rec = mapOpportunityRow(row);
      if (!Array.isArray(rec.stage)) rec.stage = rec.stage ? [rec.stage] : [];
      return rec;
    });

    writeJson("workshops.json", workshops);
    writeJson("opportunities.json", opportunities);
    writeJson("external-resources.json", externalResources);

    console.log(`\n[bake] Done at ${new Date().toISOString()}`);
    console.log("[bake] Review:   git diff content/data/");
    console.log("[bake] Publish:  git add content/data/ && git commit -m 'content: refresh from sheet' && git push");
  } catch (err) {
    console.error("[bake] FAILED:", err.message);
    process.exit(1);
  }
})();
