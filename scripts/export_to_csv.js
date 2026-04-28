// Exports Pathways content to CSV files ready for Google Sheets import.
// Usage: node scripts/export_to_csv.js
// Outputs: exports/opportunities.csv, exports/external-resources.csv, exports/workshops.csv

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "exports");
fs.mkdirSync(outDir, { recursive: true });

const window = {};
const dataJs = fs.readFileSync(path.join(root, "data.js"), "utf8");
eval(dataJs);
const data = window.PATHWAYS_DATA;

// Microsoft Lists multi-choice import expects semicolon-separated values.
const toCell = (value) => {
  if (value === undefined || value === null) return "";
  if (Array.isArray(value)) return value.join("; ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const toCsv = (rows, columns) => {
  const escape = (v) => {
    const s = toCell(v);
    if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
    return s;
  };
  const header = columns.join(",");
  const body = rows.map((row) => columns.map((c) => escape(row[c])).join(",")).join("\n");
  return header + "\n" + body + "\n";
};

// --- Opportunities (internal consultations / workshops / tools) ---
const opportunityColumns = [
  "id",
  "title",
  "category",
  "format",
  "time",
  "stage",
  "pathway",
  "tags",
  "summary",
  "author",
  "detailsWho",
  "detailsWhat",
  "detailsOutcomes",
  "externalUrl",
  "bookingUrl",
  "provider",
  "ownerName",
  "ownerEmail"
];

const flattenOpp = (opp) => ({
  ...opp,
  detailsWho: opp.details?.who || "",
  detailsWhat: opp.details?.what || "",
  detailsOutcomes: opp.details?.outcomes || "",
  bookingUrl: opp.bookingUrl || "",
  ownerName: opp.ownerName || "",
  ownerEmail: opp.ownerEmail || ""
});

const opportunities = (data.explore.opportunities || []).map(flattenOpp);
fs.writeFileSync(path.join(outDir, "opportunities.csv"), toCsv(opportunities, opportunityColumns));

// --- External resources ---
const externalResources = (data.explore.externalResources || []).map(flattenOpp);
fs.writeFileSync(path.join(outDir, "external-resources.csv"), toCsv(externalResources, opportunityColumns));

// --- Workshops (from content/workshops.json) ---
const workshopsJson = JSON.parse(fs.readFileSync(path.join(root, "content", "workshops.json"), "utf8"));
const workshopColumns = [
  "id",
  "slug",
  "title",
  "format",
  "time",
  "pathways",
  "stages",
  "tags",
  "summary",
  "featuredHome",
  "internalRoute",
  "file",
  "docUrl",
  "bookingUrl",
  "provider",
  "ownerName",
  "ownerEmail"
];
const workshopRows = workshopsJson.map((w) => ({
  ...w,
  bookingUrl: w.bookingUrl || "",
  ownerName: w.ownerName || "",
  ownerEmail: w.ownerEmail || ""
}));
fs.writeFileSync(path.join(outDir, "workshops.csv"), toCsv(workshopRows, workshopColumns));

console.log("Wrote:");
console.log("  " + path.join(outDir, "opportunities.csv") + "  (" + opportunities.length + " rows)");
console.log("  " + path.join(outDir, "external-resources.csv") + "  (" + externalResources.length + " rows)");
console.log("  " + path.join(outDir, "workshops.csv") + "  (" + workshopRows.length + " rows)");
