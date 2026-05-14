(() => {
  const data = window.PATHWAYS_DATA;
  if (!data) {
    return;
  }

  const FORMSPREE_URL = "https://formspree.io/f/YOUR_FORM_ID";
  const FORMSPREE_CONFIGURED = !FORMSPREE_URL.includes("YOUR_FORM_ID");
  const FORMSPREE_FALLBACK_EMAIL = "impact@concordia.ca";

  // Single submission path. Resolves to { ok, prototype, error }:
  //   ok=true           → Formspree accepted the submission.
  //   prototype=true    → FORMSPREE_URL is still a placeholder, nothing was sent.
  //   error/!ok         → submission failed; surface a real error to the user.
  const submitToFormspree = (formData) => {
    if (!FORMSPREE_CONFIGURED) {
      return Promise.resolve({ ok: false, prototype: true });
    }
    return fetch(FORMSPREE_URL, {
      method: "POST",
      body: formData,
      headers: { "Accept": "application/json" }
    }).then(
      (res) => ({ ok: res.ok, prototype: false, status: res.status }),
      (err) => ({ ok: false, prototype: false, error: err })
    );
  };

  // Bookings integration (prototype). When enabled, opportunities with a
  // bookingUrl show a redirect modal that opens MS Bookings in a new tab.
  // (Iframe embed tried first — Microsoft sets X-Frame-Options: DENY on
  // Bookings pages, so framing is impossible. New-tab is the honest UX.)
  const BOOKINGS = {
    enabled: true
  };

  // Per-guide content sources. Each Learn-section guide can pull its prose
  // from a labelled Google Doc (`docUrl`) or a labelled local .md file
  // (`localPath`). The Doc takes precedence when set. Slot labels in the Doc
  // are H2 headings (e.g. "## s1.lead"); the build function reads slot
  // values into the existing JS layout. See content/learn/*.md for shape.
  const LEARN_GUIDES = {
    narrativeCv: {
      docUrl: "",
      localPath: "content/learn/narrative-cv-guide.md"
    }
  };

  // Google Sheets backend. Controls where content is loaded from.
  //   "baked"  — read from content/data/*.json (run node scripts/bake.js to refresh)
  //   "live"   — fetch Google Sheets at runtime on every page load
  //   "local"  — use only local data.js / content/workshops.json (no network)
  //
  // PARKED — keep "live" during the beta. The "baked" path is functional but
  // its files (scripts/bake.js, content/data/) are intentionally not in the
  // repo yet; do not flip to "baked" without committing them first or the site
  // will 404 on the snapshots. See INTEGRATION_NOTES.md → "Attempt 7" for
  // context and the path to making baked mode coordinator-friendly.
  const SHEETS = {
    mode: "baked",
    sheetId: "1IQGINsUTQMWLm4IJY49dr76pMeWkIH_vj-aLnj9jD1Y",
    tabs: {
      workshops: "workshops",
      // The opportunities-shaped tab is named "place_holders" in the sheet —
      // it doubles as a staging area. Rows display on the live site only when
      // their `version` column reads exactly "approved".
      opportunities: "place_holders",
      externalResources: "external-resources"
    }
  };

  // Approval gate: rows with a `version` column show only when version === "approved".
  // Rows without a `version` column (e.g. external-resources today) display by default.
  // Add `?preview=1` to any site URL to bypass the gate and see staging rows too.
  const isPreviewMode = () => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get("preview") === "1";
    } catch (e) { return false; }
  };
  const isApprovedRow = (row) => {
    if (isPreviewMode()) return true;
    if (!("version" in row)) return true; // tab has no version column → no gate
    const v = (row.version || "").toString().trim().toLowerCase();
    return v === "approved"; // blank or anything else → hidden
  };

  // Capacity status. Coordinator sets a `status` column on workshops/opportunities
  // rows. Recognised values (case/whitespace insensitive):
  //   blank, "open"                                  → "open"     (default — bookings on)
  //   "full" | "fully booked" | "booked" | "waitlist" → "full"     (bookings off, waitlist on)
  //   "cancelled" | "canceled" | "off" | "closed"    → "cancelled" (bookings off, no action)
  // Keep in sync with normaliseStatus in scripts/bake.js.
  const normaliseStatus = (raw) => {
    const v = (raw || "").toString().trim().toLowerCase();
    if (!v) return "open";
    if (["full", "fully booked", "booked", "waitlist", "wait list", "wait-list"].includes(v)) return "full";
    if (["cancelled", "canceled", "off", "closed"].includes(v)) return "cancelled";
    return "open";
  };
  const getStatus = (opp) => normaliseStatus(opp && opp.status);
  // True when a CTA should send the user to an external booking page in a new
  // tab (MS Bookings) instead of opening the in-page booking-request modal.
  // Used by detail-modal CTAs and by reconcileServiceModal's deep-link guard.
  const shouldExternalBooking = (opp) =>
    BOOKINGS.enabled && opp && opp.bookingUrl;
  const STATUS_LABELS = {
    full: "Fully booked",
    cancelled: "Cancelled"
  };
  const statusPill = (status) => {
    const label = STATUS_LABELS[status];
    if (!label) return null;
    return el("span", "status-pill status-pill--" + status, label);
  };

  const siteHeader = document.getElementById("site-header");
  const appRoot = document.getElementById("app");
  const modalRoot = document.getElementById("modal-root");
  let routeFooter = null;
  let contextBar = null;
  let contextStage = "";
  let contextPathwayKey = "";

  const pathwayColors = {
    "academic": "#912338",
    "community": "#db0272",
    "innovation": "#da3a16",
    "commercialization": "#573996",
    "communications": "#e5a712",
    "policy": "#0072a8",
    "research-creation": "#508212"
  };

  document.title = data.meta.title || "";

  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  };

  // Provider line with a small "OFFERED BY" label and the provider name as the value.
  const providerLine = (provider) => {
    const node = document.createElement("p");
    node.className = "card-provider";
    const label = document.createElement("span");
    label.className = "card-provider-label";
    label.textContent = "Offered by";
    node.appendChild(label);
    node.appendChild(document.createTextNode(provider));
    return node;
  };

  const formatBadge = (format) => {
    const fmt = (format || "").toLowerCase();
    let key, iconSvg;
    if (fmt.includes("workshop")) {
      key = "workshop";
      iconSvg = '<svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="14" height="14" rx="2"/><path d="M16 2v4M8 2v4M3 9h14"/></svg>';
    } else if (fmt.includes("consultation")) {
      key = "consultation";
      iconSvg = '<svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 10c0 3.866-3.582 7-8 7a9 9 0 01-4-.93L2 18l1.4-3.5A7 7 0 012 10c0-3.866 3.582-7 8-7s8 3.134 8 7z"/></svg>';
    } else if (fmt.includes("tool")) {
      key = "tool";
      iconSvg = '<svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l1.1-1.1a4 4 0 00-5.6-5.6L12 4.3"/><path d="M5.3 13.7a1 1 0 000-1.4L3.7 10.7a1 1 0 00-1.4 0L1.2 11.8a4 4 0 005.6 5.6L8 16.2"/><line x1="7" y1="13" x2="13" y2="7"/></svg>';
    } else if (fmt.includes("resource")) {
      key = "resource";
      iconSvg = '<svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 3h4v4"/><path d="M10 10L19 3"/><path d="M17 11v6a2 2 0 01-2 2H3a2 2 0 01-2-2V5a2 2 0 012-2h6"/></svg>';
    } else {
      key = "resource";
      iconSvg = '<svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13l-3 3a2.12 2.12 0 01-3-3l5-5a2.12 2.12 0 013 0"/><path d="M13 10l3-3a2.12 2.12 0 00-3-3l-5 5a2.12 2.12 0 000 3"/></svg>';
    }
    const badge = document.createElement("span");
    badge.className = "format-badge format-badge--" + key;
    badge.innerHTML = iconSvg + '<span class="format-badge-text">' + (format || "Service") + "</span>";
    return badge;
  };

  const clear = (node) => {
    while (node.firstChild) {
      node.removeChild(node.firstChild);
    }
  };

  const pages = new Map();
  const journeyDetails = new Map();
  const filterControls = new Map();
  const content = {
    workshops: [],
    pathwaysVisionMarkdown: "",
    pathwaysVisionLoadError: false,
    // Per-guide slot dictionaries. Populated in init() before buildPages().
    // Each value is `{label: rawText}` — see parseSlotMarkdown / parseSlotsFromDocHtml.
    learnSlots: {}
  };

  const state = {
    page: "home",
    search: "",
    filters: {
      pathway: "",
      stage: "",
      format: "",
      time: ""
    },
    pendingStage: "",
    pendingPathwayKey: "",
    pendingWorkshopId: "",
    pendingExploreSearch: "",
    pendingSupportSearch: "",
    pendingResearchJourneyId: "",
    pendingExploreTab: "",
    suppressNextHashChange: false,
    // Tracks which modal is currently rendered. Empty = none.
    // Format: "service:<id>" for the detail modal, "book:<id>" for the booking modal.
    currentModalKey: "",
    // Persisted pagination on the All Resources tab so closing a modal returns
    // the user to the page they were viewing rather than resetting to page 1.
    browsePage: 0
  };
  const pathwayIdToKey = {
    "academic-scholarship": "academic",
    "community-engagement": "community",
    "innovation": "innovation",
    "commercialization": "commercialization",
    "communications": "communications",
    "policy": "policy",
    "research-creation": "research-creation"
  };
  const pathwayKeyToId = Object.keys(pathwayIdToKey).reduce((acc, id) => {
    acc[pathwayIdToKey[id]] = id;
    return acc;
  }, {});
  const supportAnchorByJourneyId = {
    "developing-project": "support-developing",
    "ongoing-project": "support-active",
    "wrapping-up-project": "support-wrapping"
  };

  const stageKeyToLabel = data.start.journeys.reduce((acc, journey) => {
    acc[journey.id] = journey.stage || journey.title;
    return acc;
  }, {});
  // Keep backward compatibility with legacy workshop stage keys from the markdown manifest.
  stageKeyToLabel["developing-idea"] = "Developing an Idea";
  stageKeyToLabel["preparing-grant"] = "Developing an Idea";
  stageKeyToLabel["active-project"] = "Active Research";
  stageKeyToLabel["concluded-project"] = "Finishing a Project";

  const pathwayKeyToTitle = data.explore.pathways.items.reduce((acc, pathway) => {
    const key = pathwayIdToKey[pathway.id] || pathway.id;
    acc[key] = pathway.title;
    return acc;
  }, {});
  const supportAnchorIds = new Set(((data.support && data.support.sections) || []).map((section) => section.id));
  const unitById = (data.units || []).reduce((acc, unit) => {
    acc[unit.id] = unit;
    return acc;
  }, {});

  const escapeHtml = (value) => String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

  const markdownToHtml = (markdown) => {
    const lines = String(markdown || "").replace(/\r\n/g, "\n").split("\n");
    const chunks = [];
    let paragraph = [];
    let list = [];

    const flushParagraph = () => {
      if (!paragraph.length) return;
      chunks.push(`<p>${escapeHtml(paragraph.join(" "))}</p>`);
      paragraph = [];
    };

    const flushList = () => {
      if (!list.length) return;
      chunks.push(`<ul>${list.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`);
      list = [];
    };

    lines.forEach((rawLine) => {
      const line = rawLine.trim();
      if (!line) {
        flushParagraph();
        flushList();
        return;
      }
      if (line.startsWith("## ")) {
        flushParagraph();
        flushList();
        chunks.push(`<h2>${escapeHtml(line.slice(3).trim())}</h2>`);
        return;
      }
      if (line.startsWith("# ")) {
        flushParagraph();
        flushList();
        chunks.push(`<h1>${escapeHtml(line.slice(2).trim())}</h1>`);
        return;
      }
      if (line.startsWith("- ")) {
        flushParagraph();
        list.push(line.slice(2).trim());
        return;
      }
      paragraph.push(line);
    });

    flushParagraph();
    flushList();
    return chunks.join("");
  };

  const parseMarkdownBlocks = (markdown) => {
    const lines = String(markdown || "").replace(/\r\n/g, "\n").split("\n");
    const blocks = [];
    let paragraph = [];
    let list = [];

    const flushParagraph = () => {
      if (!paragraph.length) return;
      blocks.push({ type: "paragraph", text: paragraph.join(" ") });
      paragraph = [];
    };

    const flushList = () => {
      if (!list.length) return;
      blocks.push({ type: "list", items: [...list] });
      list = [];
    };

    lines.forEach((rawLine) => {
      const line = rawLine.trim();
      if (!line) {
        flushParagraph();
        flushList();
        return;
      }
      if (line.startsWith("### ")) {
        flushParagraph();
        flushList();
        blocks.push({ type: "heading", level: 3, text: line.slice(4).trim() });
        return;
      }
      if (line.startsWith("## ")) {
        flushParagraph();
        flushList();
        blocks.push({ type: "heading", level: 2, text: line.slice(3).trim() });
        return;
      }
      if (line.startsWith("# ")) {
        flushParagraph();
        flushList();
        blocks.push({ type: "heading", level: 1, text: line.slice(2).trim() });
        return;
      }
      if (line.startsWith("- ")) {
        flushParagraph();
        list.push(line.slice(2).trim());
        return;
      }
      paragraph.push(line);
    });

    flushParagraph();
    flushList();
    return blocks;
  };

  const stripFrontMatter = (markdown) => {
    const text = String(markdown || "").replace(/\r\n/g, "\n");
    if (!text.startsWith("---\n")) {
      return text;
    }
    const closingIndex = text.indexOf("\n---\n", 4);
    if (closingIndex === -1) {
      return text;
    }
    return text.slice(closingIndex + 5);
  };

  const getSummaryFromMarkdown = (markdown) => {
    const lines = String(markdown || "").replace(/\r\n/g, "\n").split("\n");
    const summaryLines = [];
    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index].trim();
      if (!line) {
        if (summaryLines.length) break;
        continue;
      }
      if (line.startsWith("#") || line.startsWith("- ")) {
        if (summaryLines.length) break;
        continue;
      }
      summaryLines.push(line);
    }
    return summaryLines.join(" ");
  };

  // Minimal RFC4180 CSV parser: handles quoted fields, escaped quotes, CRLF.
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

  const fetchSheetRows = async (tab) => {
    const url = `https://docs.google.com/spreadsheets/d/${SHEETS.sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tab)}`;
    const res = await fetch(url, { cache: "no-cache" });
    if (!res.ok) throw new Error(`Sheet request failed for ${tab} (${res.status})`);
    return parseCsv(await res.text());
  };

  const fetchWorkshopsFromSheet = async () => {
    const rows = await fetchSheetRows(SHEETS.tabs.workshops);
    return rows.filter(isApprovedRow).map((row) => ({
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
    }));
  };

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

  const fetchOpportunitiesFromSheet = async () => {
    const rows = await fetchSheetRows(SHEETS.tabs.opportunities);
    return rows.filter(isApprovedRow).map(mapOpportunityRow);
  };

  const fetchExternalResourcesFromSheet = async () => {
    const rows = await fetchSheetRows(SHEETS.tabs.externalResources);
    return rows.filter(isApprovedRow).map((row) => {
      const rec = mapOpportunityRow(row);
      // External resources use stage as array even for single values
      if (!Array.isArray(rec.stage)) rec.stage = rec.stage ? [rec.stage] : [];
      return rec;
    });
  };

  // Fetch a published Google Doc and rebuild its body as sanitized HTML.
  // Coordinator workflow: in Google Docs, File → Share → Publish to web → Embed
  //   → copy the URL ending in `/pub` (e.g. https://docs.google.com/document/d/e/<long-id>/pub)
  //   → paste into the `docUrl` column of the workshops sheet.
  // We fetch the published HTML, extract `#contents`, walk the DOM, and rebuild
  // using only structural tags. All inline styles and Google chrome get stripped.
  const ALLOWED_DOC_TAGS = new Set(["H1", "H2", "H3", "H4", "P", "UL", "OL", "LI", "STRONG", "EM", "B", "I", "A", "BR"]);
  // Drop these entirely (subtree included). Without this, the CSS inside
  // <style> leaks through as escaped text content.
  const SKIP_DOC_TAGS = new Set(["STYLE", "SCRIPT", "HEAD", "META", "LINK", "TITLE", "NOSCRIPT"]);

  const escapeAttr = (value) => String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // Google wraps external links as https://www.google.com/url?q=<real>&sa=...
  const unwrapGoogleRedirect = (href) => {
    if (!href) return "";
    const match = href.match(/^https?:\/\/(?:www\.)?google\.com\/url\?(?:[^&]*&)*q=([^&]+)/i);
    if (match) {
      try { return decodeURIComponent(match[1]); } catch (e) { return href; }
    }
    return href;
  };

  const sanitizeDocNode = (node) => {
    if (node.nodeType === 3) {
      // Text node — escape and return
      return escapeHtml(node.nodeValue || "");
    }
    if (node.nodeType !== 1) return "";
    const tag = node.tagName;
    if (SKIP_DOC_TAGS.has(tag)) return "";
    const childHtml = Array.from(node.childNodes).map(sanitizeDocNode).join("");
    if (ALLOWED_DOC_TAGS.has(tag)) {
      const lower = tag.toLowerCase();
      if (tag === "A") {
        const raw = node.getAttribute("href") || "";
        const href = unwrapGoogleRedirect(raw);
        const safeHref = /^(https?:|mailto:|#)/.test(href) ? ` href="${escapeAttr(href)}"` : "";
        const target = safeHref && /^https?:/.test(href) ? ' target="_blank" rel="noopener noreferrer"' : "";
        if (!childHtml.trim()) return "";
        return `<a${safeHref}${target}>${childHtml}</a>`;
      }
      if ((tag === "P" || tag === "LI") && !childHtml.trim()) return "";
      return `<${lower}>${childHtml}</${lower}>`;
    }
    // Container tags (DIV, SPAN, etc.) — pass children through, drop the wrapper
    return childHtml;
  };

  const fetchWorkshopBodyFromDoc = async (docUrl) => {
    if (!/\/pub(\?|$)/.test(docUrl)) {
      throw new Error(`docUrl must be a Google Docs publish-to-web URL ending in /pub (got: ${docUrl})`);
    }
    const res = await fetch(docUrl, { cache: "no-cache" });
    if (!res.ok) throw new Error(`Doc request failed (${res.status})`);
    const raw = await res.text();
    const doc = new DOMParser().parseFromString(raw, "text/html");
    const contents = doc.getElementById("contents");
    if (!contents) throw new Error("Published Doc has no #contents div — was it published correctly?");
    let html = sanitizeDocNode(contents);
    html = postProcessDocHtml(html);
    // Pull-quote pass: if the first <p> is a short quoted "tagline", lift it
    // out so it can be rendered as a hero element on the card and at the top
    // of the modal — never duplicated inside the body.
    const { html: bodyHtml, pullQuote } = extractPullQuote(html);
    html = bodyHtml;
    // Summary = first body paragraph after pull-quote extraction. If the body
    // has no qualifying paragraph (e.g. body is mostly lists), fall back to
    // the pull quote so the card still has SOMETHING to show.
    const summaryText = extractDocSummary(html) || pullQuote;
    const plainText = (contents.textContent || "").trim();
    return { html, pullQuote, summary: summaryText, markdown: plainText };
  };

  // Detects a quoted opening paragraph and lifts it out of the body.
  // Quote-marks (curly or straight, double or single) at both ends + length
  // cap keeps this conservative — body sentences that happen to contain a
  // quote internally won't trigger.
  const PULLQUOTE_OPEN = /^["“‘']/;
  const PULLQUOTE_CLOSE = /["”’']$/;
  const extractPullQuote = (html) => {
    const match = html.match(/^\s*<p>([^<]+)<\/p>/);
    if (!match) return { html, pullQuote: "" };
    const text = decodeEntities(match[1]).replace(/\s+/g, " ").trim();
    if (text.length === 0 || text.length > 240) return { html, pullQuote: "" };
    if (!PULLQUOTE_OPEN.test(text) || !PULLQUOTE_CLOSE.test(text)) return { html, pullQuote: "" };
    return {
      html: html.slice(match[0].length).replace(/^\s+/, ""),
      pullQuote: text
    };
  };

  // Coordinator-friendly post-processing. The goal: let people write a Doc
  // however feels natural (plain paragraphs for section labels, soft line
  // breaks mid-paragraph, redundant Title:/Tags: lines) and have it render
  // structurally on the site. Each pass is intentionally conservative so we
  // don't mangle real body content.
  const HEADING_LABELS = new Set([
    "short description", "description", "overview", "summary",
    "relevance to impact", "why it matters",
    "who it's for", "who its for", "who it is for", "audience",
    "what you'll learn", "what you will learn", "what you'll get", "outcomes",
    "format", "what to bring", "how to prepare", "preparation",
    "materials provided", "what you'll receive",
    "pathways alignment", "pathway alignment",
    "biography", "about", "about the host", "host", "presenter", "presenters"
  ]);

  const looksLikeHeading = (text) => {
    const trimmed = text.replace(/\s+/g, " ").trim();
    if (!trimmed) return false;
    if (trimmed.length > 70) return false;
    // Sentence-ending punctuation = body, not a heading
    if (/[.!?]$/.test(trimmed)) return false;
    // Trailing colon is a strong heading signal
    if (trimmed.endsWith(":")) return true;
    // Known label match (case-insensitive, strip trailing colons/dashes)
    const normalized = trimmed.replace(/[:\-—–]+$/, "").toLowerCase();
    if (HEADING_LABELS.has(normalized)) return true;
    // Heading-cased line of ≤6 words with no terminal punctuation
    const words = trimmed.split(/\s+/);
    if (words.length <= 6 && /^[A-Z]/.test(trimmed) && !/[,;]/.test(trimmed)) return true;
    return false;
  };

  const postProcessDocHtml = (html) => {
    let out = html;

    // 1. Merge adjacent same-type lists (Google emits one <ul> per <li>)
    out = out.replace(/<\/ul>\s*<ul>/g, "").replace(/<\/ol>\s*<ol>/g, "");

    // 2. Drop redundant metadata-style lines that are already in the sheet
    out = out.replace(/<p>\s*(?:Title|Tags?#?)\s*:[^<]*<\/p>/gi, "");

    // 3. Merge soft-broken paragraphs. Google splits a single Doc paragraph
    //    into multiple <p> when there are line wraps; the continuation almost
    //    always starts with a lowercase letter. Iterate until stable.
    let prev;
    do {
      prev = out;
      out = out.replace(/<p>([^<]*?)<\/p>\s*<p>(\s*[a-z])/g, "<p>$1 $2");
    } while (out !== prev);

    // 4. Promote heading-shaped paragraphs to <h2>
    out = out.replace(/<p>([^<]+?)<\/p>/g, (match, inner) => {
      if (!looksLikeHeading(inner)) return match;
      const cleaned = inner.replace(/[:\-—–]+\s*$/, "").trim();
      return `<h2>${cleaned}</h2>`;
    });

    // 5. Drop orphan headings (an <h2> with no body before the next heading or end).
    //    Iterate so back-to-back orphans collapse cleanly.
    let prevPass;
    do {
      prevPass = out;
      out = out.replace(/<h2>[^<]+<\/h2>\s*(?=<h2>|$)/g, "");
    } while (out !== prevPass);

    return out;
  };

  const decodeEntities = (s) => String(s)
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");

  const extractDocSummary = (html) => {
    // Walk the post-processed HTML for the first <p> with substantive text.
    const matches = html.match(/<p>([^<]+)<\/p>/g) || [];
    for (const m of matches) {
      const text = decodeEntities(m.replace(/<\/?p>/g, "")).trim();
      if (text.length >= 40) return text; // skip short labels even if they slipped through
    }
    return matches[0] ? decodeEntities(matches[0].replace(/<\/?p>/g, "")).trim() : "";
  };

  const loadExploreContentFromSheets = async () => {
    if (SHEETS.mode === "local") {
      console.log("[Pathways] SHEETS.mode = local, using local data.js");
      return;
    }
    // Non-local modes are authoritative — clear local data first so any
    // failure is immediately visible (empty Explore page, not stale content).
    data.explore.opportunities = [];
    data.explore.externalResources = [];
    try {
      let opps, ext;
      if (SHEETS.mode === "baked") {
        const [oppsRes, extRes] = await Promise.all([
          fetch("content/data/opportunities.json"),
          fetch("content/data/external-resources.json")
        ]);
        if (!oppsRes.ok) throw new Error(`Failed to load baked opportunities (${oppsRes.status})`);
        if (!extRes.ok) throw new Error(`Failed to load baked external resources (${extRes.status})`);
        [opps, ext] = await Promise.all([oppsRes.json(), extRes.json()]);
      } else {
        [opps, ext] = await Promise.all([
          fetchOpportunitiesFromSheet(),
          fetchExternalResourcesFromSheet()
        ]);
      }
      data.explore.opportunities = opps;
      data.explore.externalResources = ext;
      const src = SHEETS.mode === "baked" ? "baked JSON" : "Google Sheet";
      console.log(`[Pathways] Loaded from ${src}: ${opps.length} opportunities, ${ext.length} external resources`);
    } catch (err) {
      console.error("[Pathways] FAILED to load explore content — Explore page will be empty until fixed.", err);
    }
  };

  // ── Slot-based guide content ─────────────────────────────────────────────
  // Guides in the Learn section have rich custom layouts (callouts, tables,
  // expandables, etc.) that we don't want to give up. To make the prose
  // editable without touching code, each guide's text lives in a labelled
  // file or Doc; the JS layout reads each text block from a slot dictionary.
  //
  // Conventions (same in .md and Doc):
  //   - Slot label = a Heading 2 line whose text is the label (e.g. "s1.lead")
  //   - Slot value = everything between that H2 and the next H2 (or EOF)
  //   - Lists in slot values use "- bullet" lines
  //   - Tables / cards / myths use pipe-separated rows (one per line)
  //
  // The build function uses slot helpers (slotText, slotPara, slotList,
  // slotRows) to interpret each slot. Missing slots fall back to the
  // hardcoded default in the builder, so partial migrations don't crash.

  // Parse a labelled markdown file into {label: rawString}. Skips any text
  // before the first slot heading and any heading that isn't a valid label.
  const SLOT_LABEL_RE = /^[\w][\w.\-]*$/;
  // Markdown horizontal-rule line. Stripped from slot values so the .md can
  // use them as visual separators between slots without leaking into the UI.
  const HR_LINE_RE = /^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/;
  const parseSlotMarkdown = (md) => {
    const slots = {};
    if (!md) return slots;
    const lines = md.replace(/\r\n/g, "\n").split("\n");
    let label = null;
    let buffer = [];
    const flush = () => {
      if (label) slots[label] = buffer.join("\n").trim();
    };
    for (const line of lines) {
      const m = line.match(/^##\s+(\S.*?)\s*$/);
      if (m && SLOT_LABEL_RE.test(m[1])) {
        flush();
        label = m[1];
        buffer = [];
      } else if (label) {
        if (HR_LINE_RE.test(line)) continue; // skip --- / *** / ___ separators
        buffer.push(line);
      }
    }
    flush();
    return slots;
  };

  // Parse already-sanitized published-Doc HTML into {label: rawString}.
  // Walks the DOM in order; each <h2> whose text matches a slot label starts
  // a new slot, and following block elements (<p>, <ul>, <ol>) become its
  // value, with <li> children rendered as "- item" lines so list parsing is
  // identical to the .md path.
  const parseSlotsFromDocHtml = (html) => {
    const slots = {};
    if (!html) return slots;
    const wrap = document.createElement("div");
    wrap.innerHTML = html;
    let label = null;
    let buffer = [];
    const flush = () => {
      if (label) slots[label] = buffer.join("\n").trim();
    };
    for (const node of Array.from(wrap.childNodes)) {
      if (node.nodeType !== 1) continue;
      const tag = node.tagName;
      if (tag === "H2") {
        const text = (node.textContent || "").trim();
        if (SLOT_LABEL_RE.test(text)) {
          flush();
          label = text;
          buffer = [];
        } else {
          // Heading that isn't a slot label — ignore (shouldn't happen in a
          // well-formed guide Doc, but don't crash if it does).
          flush();
          label = null;
          buffer = [];
        }
      } else if (label) {
        if (tag === "UL" || tag === "OL") {
          for (const li of node.children) {
            if (li.tagName === "LI") buffer.push("- " + (li.textContent || "").trim());
          }
        } else {
          const t = (node.textContent || "").trim();
          if (t) buffer.push(t);
        }
      }
    }
    flush();
    return slots;
  };

  // Fetch a guide's slot dict from its Doc (preferred) or local .md fallback.
  // Returns {} on any failure — the builder's hardcoded defaults take over.
  const fetchGuideSlots = async (guideKey) => {
    const cfg = LEARN_GUIDES[guideKey];
    if (!cfg) return {};
    if (cfg.docUrl) {
      try {
        if (!/\/pub(\?|$)/.test(cfg.docUrl)) {
          throw new Error(`docUrl must end in /pub (got: ${cfg.docUrl})`);
        }
        const res = await fetch(cfg.docUrl, { cache: "no-cache" });
        if (!res.ok) throw new Error(`Doc request failed (${res.status})`);
        const raw = await res.text();
        const doc = new DOMParser().parseFromString(raw, "text/html");
        const contents = doc.getElementById("contents");
        if (!contents) throw new Error("Published Doc has no #contents div");
        const sanitized = sanitizeDocNode(contents);
        return parseSlotsFromDocHtml(sanitized);
      } catch (err) {
        console.warn(`[Pathways] Guide "${guideKey}" Doc load failed; falling back to local .md`, err);
        // fall through
      }
    }
    if (cfg.localPath) {
      try {
        const res = await fetch(cfg.localPath, { cache: "no-cache" });
        if (!res.ok) throw new Error(`local .md request failed (${res.status})`);
        return parseSlotMarkdown(await res.text());
      } catch (err) {
        console.warn(`[Pathways] Guide "${guideKey}" local .md load failed; using hardcoded defaults`, err);
      }
    }
    return {};
  };

  const loadLearnGuideContent = async () => {
    const keys = Object.keys(LEARN_GUIDES);
    const dicts = await Promise.all(keys.map(fetchGuideSlots));
    keys.forEach((k, i) => { content.learnSlots[k] = dicts[i] || {}; });
    const total = keys.reduce((n, k) => n + Object.keys(content.learnSlots[k] || {}).length, 0);
    console.log(`[Pathways] Loaded ${total} learn-guide slots across ${keys.length} guide(s)`);
  };

  const loadWorkshopContent = async () => {
    try {
      let manifest;
      if (SHEETS.mode === "live") {
        manifest = await fetchWorkshopsFromSheet();
        console.log(`[Pathways] Loaded from Google Sheet: ${manifest.length} workshops`);
      } else if (SHEETS.mode === "baked") {
        const res = await fetch("content/data/workshops.json");
        if (!res.ok) throw new Error(`Failed to load baked workshops (${res.status})`);
        manifest = await res.json();
        console.log(`[Pathways] Loaded from baked JSON: ${manifest.length} workshops`);
      } else {
        console.log("[Pathways] SHEETS.mode = local, loading workshops from content/workshops.json");
        const manifestResponse = await fetch("content/workshops.json", { cache: "no-cache" });
        if (!manifestResponse.ok) {
          throw new Error(`Manifest request failed (${manifestResponse.status})`);
        }
        manifest = await manifestResponse.json();
      }
      if (!Array.isArray(manifest)) {
        throw new Error("Manifest must be an array");
      }

      const results = await Promise.allSettled(manifest.map(async (entry) => {
        // Internal-tool entries (e.g. impact-planner) have neither file nor docUrl —
        // they're rendered by their own internal route, just need metadata.
        if (!entry.file && !entry.docUrl) {
          return {
            ...entry,
            sourceType: "tool",
            category: "Interactive Tools",
            summary: entry.summary || "",
            markdown: "",
            html: "",
            unitTags: [],
            stage: (entry.stages || []).map((stage) => stageKeyToLabel[stage] || stage),
            pathway: (entry.pathways || []).map((pathway) => pathwayKeyToTitle[pathway] || pathway)
          };
        }

        // Body source: prefer published Google Doc, fall back to local .md.
        // This lets us migrate workshops one at a time — coordinator pastes a
        // docUrl into the sheet row and the next refresh picks it up.
        let html = "";
        let markdown = "";
        let summary = "";
        let pullQuote = "";
        if (entry.docUrl) {
          const body = await fetchWorkshopBodyFromDoc(entry.docUrl);
          html = body.html;
          markdown = body.markdown;
          summary = body.summary || entry.summary || "";
          pullQuote = body.pullQuote || "";
        } else {
          const markdownResponse = await fetch(entry.file, { cache: "no-cache" });
          if (!markdownResponse.ok) {
            throw new Error(`Workshop file request failed for ${entry.file}`);
          }
          const rawMarkdown = await markdownResponse.text();
          markdown = stripFrontMatter(rawMarkdown).trim();
          html = markdownToHtml(markdown);
          summary = getSummaryFromMarkdown(markdown) || entry.summary || "";
        }

        return {
          ...entry,
          sourceType: "workshop",
          category: "Workshops & support",
          summary,
          markdown,
          html,
          pullQuote,
          unitTags: Array.isArray(entry.unitTags) && entry.unitTags.length
            ? entry.unitTags
            : (data.workshopUnitTags && Array.isArray(data.workshopUnitTags[entry.id]) ? data.workshopUnitTags[entry.id] : []),
          stage: (entry.stages || []).map((stage) => stageKeyToLabel[stage] || stage),
          pathway: (entry.pathways || []).map((pathway) => pathwayKeyToTitle[pathway] || pathway)
        };
      }));

      const fulfilled = results.filter((r) => r.status === "fulfilled").map((r) => r.value);
      const rejected = results.filter((r) => r.status === "rejected");
      if (rejected.length) {
        rejected.forEach((r) => console.error("[Pathways] Workshop body failed to load:", r.reason));
      }
      content.workshops = fulfilled;
      console.log(`[Pathways] Workshops ready: ${fulfilled.length} loaded, ${rejected.length} failed`);
    } catch (error) {
      console.error("[Pathways] FAILED to load workshops — list will be empty until fixed.", error);
      content.workshops = [];
    }
  };

  const loadPathwaysVisionContent = async () => {
    try {
      const response = await fetch("pathways_to_impact.md", { cache: "no-cache" });
      if (!response.ok) {
        throw new Error(`Pathways Vision request failed (${response.status})`);
      }
      content.pathwaysVisionMarkdown = await response.text();
      content.pathwaysVisionLoadError = false;
    } catch (error) {
      console.warn("Pathways Vision content failed to load.", error);
      content.pathwaysVisionMarkdown = "";
      content.pathwaysVisionLoadError = true;
    }
  };

  const buildHeader = () => {
    const header = el("div", "site-header");
    const container = el("div", "container header-inner");

    const brandBlock = el("div", "brand-block");
    const brandLink = el("a", "brand", data.brand.name);
    brandLink.href = "#home";
    brandLink.setAttribute("aria-label", data.brand.homeAriaLabel);
    brandLink.addEventListener("click", (event) => {
      event.preventDefault();
      navigateTo("home");
    });

    const nav = el("nav", "main-nav");
    const navList = el("ul", "nav-list");
    const navItems = data.navigation
      .map((item) => (item.id === "start" ? { id: "home", label: "Home" } : item))
      .filter((item, index, list) => list.findIndex((entry) => entry.id === item.id) === index)
      .filter((item) => ["home", "explore", "learn", "about"].includes(item.id));

    navItems.forEach((item) => {
      const li = el("li");
      const link = el("a", "nav-link", item.label);
      link.href = `#${item.id}`;
      link.dataset.page = item.id;
      link.addEventListener("click", (event) => {
        event.preventDefault();
        navigateTo(item.id);
      });
      li.appendChild(link);
      navList.appendChild(li);
    });

    nav.appendChild(navList);

    const hamburger = el("button", "nav-hamburger");
    hamburger.type = "button";
    hamburger.setAttribute("aria-label", "Toggle navigation");
    hamburger.setAttribute("aria-expanded", "false");
    for (let i = 0; i < 3; i++) {
      hamburger.appendChild(el("span", "hamburger-bar"));
    }
    hamburger.addEventListener("click", () => {
      const isOpen = header.classList.toggle("is-nav-open");
      hamburger.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
    navList.addEventListener("click", () => {
      header.classList.remove("is-nav-open");
      hamburger.setAttribute("aria-expanded", "false");
    });

    const headerRow = el("div", "header-row");
    headerRow.appendChild(brandLink);
    headerRow.appendChild(hamburger);

    brandBlock.appendChild(headerRow);
    brandBlock.appendChild(nav);
    container.appendChild(brandBlock);
    header.appendChild(container);
    siteHeader.appendChild(header);
  };

  const buildFooter = () => {
    routeFooter = el("footer", "route-footer");
    const container = el("div", "container footer-inner");
    container.appendChild(el("span", "footer-prompt", "Not sure where to go?"));
    const footerLinks = el("div", "footer-links");
    [
      { label: "Learn about impact", page: "learn" },
      { label: "Contact us", page: "about", anchor: "contact" }
    ].forEach((item) => {
      const a = el("a", "footer-link", item.label);
      a.href = `#${item.page}`;
      a.addEventListener("click", (e) => {
        e.preventDefault();
        navigateTo(item.page, item.anchor || undefined);
      });
      footerLinks.appendChild(a);
    });
    const feedbackBtn = el("button", "footer-link footer-feedback-btn", "Send feedback");
    feedbackBtn.type = "button";
    feedbackBtn.addEventListener("click", () => openFeedbackModal());
    footerLinks.appendChild(feedbackBtn);
    container.appendChild(footerLinks);
    routeFooter.appendChild(container);
    document.body.insertBefore(routeFooter, modalRoot);
  };

  const openFeedbackModal = () => {
    clear(modalRoot);
    document.body.classList.add("is-modal-open");

    const overlay = el("div", "modal-overlay feedback-overlay");
    const modal = el("div", "modal feedback-modal");

    const previouslyFocused = document.activeElement;
    const close = () => {
      document.removeEventListener("keydown", onKeydown);
      clear(modalRoot);
      document.body.classList.remove("is-modal-open");
      if (previouslyFocused && typeof previouslyFocused.focus === "function") {
        previouslyFocused.focus();
      }
    };
    const onKeydown = (e) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onKeydown);
    overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });

    const closeBtn = el("button", "feedback-close", "\u00d7");
    closeBtn.type = "button";
    closeBtn.setAttribute("aria-label", "Close feedback");
    closeBtn.addEventListener("click", close);
    modal.appendChild(closeBtn);

    modal.appendChild(el("h2", "feedback-title", "Send feedback"));
    modal.appendChild(el("p", "feedback-intro", "What\u2019s working, what\u2019s confusing, or what\u2019s missing? Short notes are welcome."));

    const form = el("form", "feedback-form");

    const typeField = el("div", "feedback-field");
    const typeLabel = el("label", null, "Type");
    typeLabel.setAttribute("for", "feedback-type");
    const typeSelect = el("select", "contact-form-select");
    typeSelect.id = "feedback-type";
    typeSelect.name = "feedbackType";
    [
      { value: "suggestion", label: "Suggestion" },
      { value: "confusing", label: "Something confusing" },
      { value: "bug", label: "Something broken" },
      { value: "other", label: "Other" }
    ].forEach((opt) => {
      const o = el("option", null, opt.label);
      o.value = opt.value;
      typeSelect.appendChild(o);
    });
    typeField.appendChild(typeLabel);
    typeField.appendChild(typeSelect);
    form.appendChild(typeField);

    const msgField = el("div", "feedback-field");
    const msgLabel = el("label", null, "Your feedback");
    msgLabel.setAttribute("for", "feedback-message");
    const msgInput = el("textarea", "contact-form-textarea");
    msgInput.id = "feedback-message";
    msgInput.name = "message";
    msgInput.rows = 5;
    msgInput.required = true;
    msgInput.placeholder = "Tell us what you noticed…";
    msgField.appendChild(msgLabel);
    msgField.appendChild(msgInput);
    form.appendChild(msgField);

    const emailField = el("div", "feedback-field");
    const emailLabel = el("label", null, "Email (optional)");
    emailLabel.setAttribute("for", "feedback-email");
    const emailInput = el("input", "contact-form-input");
    emailInput.type = "email";
    emailInput.id = "feedback-email";
    emailInput.name = "email";
    emailInput.placeholder = "Only if you\u2019d like a reply";
    emailField.appendChild(emailLabel);
    emailField.appendChild(emailInput);
    form.appendChild(emailField);

    const pageField = el("input", null);
    pageField.type = "hidden";
    pageField.name = "page";
    pageField.value = window.location.hash || "#home";
    form.appendChild(pageField);

    const actions = el("div", "feedback-actions");
    const submitBtn = el("button", "btn primary", "Send feedback");
    submitBtn.type = "submit";
    const cancelBtn = el("button", "btn", "Cancel");
    cancelBtn.type = "button";
    cancelBtn.addEventListener("click", close);
    actions.appendChild(cancelBtn);
    actions.appendChild(submitBtn);
    form.appendChild(actions);

    const showConfirmation = ({ ok, prototype }) => {
      clear(form);
      form.className = "feedback-confirmation";
      form.appendChild(el("p", "booking-confirm-icon", "\u2713"));
      form.appendChild(el("h3", "booking-confirm-title", "Thanks!"));
      const text = ok
        ? "Your feedback helps us improve Pathways."
        : prototype
          ? "We logged your note locally \u2014 the feedback inbox is being finalized. You can also reach us at " + FORMSPREE_FALLBACK_EMAIL + "."
          : "Saved your note locally. The form endpoint is being connected \u2014 in the meantime, email " + FORMSPREE_FALLBACK_EMAIL + " for anything urgent.";
      form.appendChild(el("p", "booking-confirm-text", text));
      const doneBtn = el("button", "btn primary", "Close");
      doneBtn.type = "button";
      doneBtn.addEventListener("click", close);
      form.appendChild(doneBtn);
    };

    const showError = () => {
      submitBtn.disabled = false;
      submitBtn.textContent = "Send feedback";
      let errBox = form.querySelector(".feedback-error");
      if (!errBox) {
        errBox = el("p", "feedback-error", "");
        errBox.setAttribute("role", "alert");
        form.insertBefore(errBox, actions);
      }
      errBox.textContent = "Couldn\u2019t send your feedback. Please try again, or email " + FORMSPREE_FALLBACK_EMAIL + ".";
    };

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const message = msgInput.value.trim();
      if (!message) {
        msgInput.classList.add("is-invalid");
        msgInput.focus();
        return;
      }
      msgInput.classList.remove("is-invalid");
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending\u2026";
      submitToFormspree(new FormData(form)).then((result) => {
        // Configured + non-ok response is a real failure \u2014 keep the form open
        // so the user can retry or copy their text into an email.
        if (!result.ok && !result.prototype) {
          showError();
          return;
        }
        showConfirmation(result);
      });
    });

    modal.appendChild(form);
    overlay.appendChild(modal);
    modalRoot.appendChild(overlay);
    msgInput.focus();
  };

  const buildContextBar = () => {
    const bar = el("div", "context-bar");
    bar.hidden = true;
    const inner = el("div", "container context-bar-inner");
    const label = el("span", "context-bar-label", "Exploring: ");
    const stageEl = el("strong", "context-bar-stage", "");
    const clearBtn = el("button", "context-bar-clear", "\u00d7");
    clearBtn.type = "button";
    clearBtn.setAttribute("aria-label", "Clear research stage context");
    clearBtn.addEventListener("click", () => { bar.hidden = true; });
    inner.appendChild(label);
    inner.appendChild(stageEl);
    inner.appendChild(clearBtn);
    bar.appendChild(inner);
    siteHeader.insertAdjacentElement("afterend", bar);
    contextBar = bar;
  };

  const setContextStage = (stageName) => {
    contextStage = stageName;
    if (contextBar) {
      contextBar.querySelector(".context-bar-stage").textContent = stageName;
      contextBar.hidden = !stageName;
      contextBar.style.removeProperty("--pathway-thread-color");
      contextBar.removeAttribute("data-pathway");
    }
  };

  const setContextPathway = (pathwayKey) => {
    contextPathwayKey = pathwayKey;
    const color = pathwayColors[pathwayKey];
    if (contextBar && color) {
      contextBar.style.setProperty("--pathway-thread-color", color);
      contextBar.setAttribute("data-pathway", pathwayKey);
    }
  };

  const buildHome = () => {
    const section = el("section", "page page-home");
    section.dataset.page = "home";

    const container = el("div", "container");
    const introSection = el("section", "home-intro");
    introSection.appendChild(el("h1", "home-intro-heading", "What would you like to do?"));

    const needsGrid = el("div", "home-needs-grid");
    const featureTiles = [
      {
        kicker: "7 impact areas",
        title: "Explore the Pathways",
        desc: "Discover seven ways to create impact \u2014 academic, community, policy, communications, and more.",
        action: () => navigateTo("explore")
      },
      {
        kicker: "By research stage",
        title: "Find support where you are",
        desc: "Browse resources matched to whether you\u2019re developing an idea, in active research, or finishing up.",
        action: () => { state.pendingExploreTab = "research"; navigateTo("explore"); }
      },
      {
        kicker: "Frameworks \u0026 tools",
        title: "Learn what impact means",
        desc: "Explore frameworks, use our interactive impact planner, and build your approach.",
        action: () => navigateTo("learn")
      },
      {
        kicker: "Need guidance?",
        title: "Not sure where to start?",
        desc: "Get in touch with us and we\u2019ll help you find the right path.",
        action: () => navigateTo("about", "contact"),
        unsure: true
      }
    ];
    featureTiles.forEach((tile) => {
      const tileEl = el("button", tile.unsure ? "home-need-tile is-unsure" : "home-need-tile");
      tileEl.type = "button";
      tileEl.appendChild(el("span", "home-need-tile-kicker", tile.kicker));
      tileEl.appendChild(el("p", "home-need-tile-title", tile.title));
      tileEl.appendChild(el("p", "home-need-tile-desc", tile.desc));
      tileEl.appendChild(el("span", "home-need-tile-arrow", "\u2192"));
      tileEl.addEventListener("click", tile.action);
      needsGrid.appendChild(tileEl);
    });
    introSection.appendChild(needsGrid);
    container.appendChild(introSection);

    // === Impact Carousel ===
    const carouselWrap = el("div", "carousel-wrap");
    const progressBar = el("div", "progress-bar");
    const counter = el("div", "slide-counter");
    counter.textContent = "1 / 7";
    const btnPrev = el("button", "nav-btn nav-prev");
    btnPrev.type = "button";
    btnPrev.setAttribute("aria-label", "Previous slide");
    btnPrev.innerHTML = "&#8592;";
    const btnNext = el("button", "nav-btn nav-next");
    btnNext.type = "button";
    btnNext.setAttribute("aria-label", "Next slide");
    btnNext.innerHTML = "&#8594;";
    const dotNav = el("div", "dot-nav");
    dotNav.setAttribute("role", "tablist");
    dotNav.setAttribute("aria-label", "Carousel slides");
    const pauseBtn = el("button", "carousel-pause");
    pauseBtn.type = "button";
    pauseBtn.setAttribute("aria-label", "Pause carousel");
    pauseBtn.innerHTML = "&#10074;&#10074;";
    let carouselPaused = false;
    const track = el("div", "carousel-track");
    track.setAttribute("aria-live", "polite");

    track.innerHTML = `
      <!-- S1 Welcome -->
      <div class="slide s1">
        <div class="s1-left">
          <div class="eyebrow">Pathways to Impact &middot; Concordia University</div>
          <h2 class="s1-headline">Research is<br/><span class="s1-line-nowrap">where <em>change</em></span><br/>begins.</h2>
          <p class="s1-body">This site brings together resources, services, and tools from across Concordia &mdash; curated by the Office of Research to support your research impact journey, wherever you are in it.</p>
          <a class="slide-link" href="#pathways-vision" data-slide-link="vision">Read impact vision &rarr;</a>
        </div>
        <div class="s1-right">
          <svg width="300" height="300" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="150" cy="150" r="58"  stroke="rgba(255,255,255,0.14)" stroke-width="1"/>
            <circle cx="150" cy="150" r="98"  stroke="rgba(255,255,255,0.09)" stroke-width="1"/>
            <circle cx="150" cy="150" r="135" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
            <circle cx="150" cy="150" r="40" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.22)" stroke-width="1.5"/>
            <text x="150" y="146" text-anchor="middle" fill="white" font-size="11" font-weight="800" font-family="Segoe UI,sans-serif">RESEARCH</text>
            <text x="150" y="160" text-anchor="middle" fill="rgba(255,255,255,0.55)" font-size="9" font-family="Segoe UI,sans-serif">DISCOVERY</text>
            <text x="150" y="84"  text-anchor="middle" fill="rgba(255,255,255,0.7)" font-size="10" font-weight="700" font-family="Segoe UI,sans-serif">POLICY</text>
            <text x="150" y="224" text-anchor="middle" fill="rgba(255,255,255,0.7)" font-size="10" font-weight="700" font-family="Segoe UI,sans-serif">TRAINING</text>
            <text x="242" y="154" text-anchor="middle" fill="rgba(255,255,255,0.95)" font-size="12" font-weight="800" font-family="Segoe UI,sans-serif">COMMUNITY</text>
            <text x="58"  y="154" text-anchor="middle" fill="rgba(255,255,255,0.95)" font-size="12" font-weight="800" font-family="Segoe UI,sans-serif">INDUSTRY</text>
            <circle cx="150" cy="92" r="3" fill="rgba(255,255,255,0.5)"/>
            <circle cx="150" cy="208" r="3" fill="rgba(255,255,255,0.5)"/>
            <circle cx="238" cy="150" r="3" fill="rgba(255,255,255,0.55)"/>
            <circle cx="62"  cy="150" r="3" fill="rgba(255,255,255,0.55)"/>
            <line x1="150" y1="110" x2="150" y2="95" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
            <line x1="190" y1="150" x2="234" y2="150" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>
            <line x1="150" y1="190" x2="150" y2="205" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
            <line x1="110" y1="150" x2="66"  y2="150" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>
            <text x="225" y="98"  text-anchor="middle" fill="rgba(255,255,255,0.35)" font-size="9" font-family="Segoe UI,sans-serif">CULTURE</text>
            <text x="225" y="214" text-anchor="middle" fill="rgba(255,255,255,0.35)" font-size="9" font-family="Segoe UI,sans-serif">ENVIRONMENT</text>
            <text x="75"  y="98"  text-anchor="middle" fill="rgba(255,255,255,0.35)" font-size="9" font-family="Segoe UI,sans-serif">HEALTH</text>
            <text x="75"  y="214" text-anchor="middle" fill="rgba(255,255,255,0.35)" font-size="9" font-family="Segoe UI,sans-serif">EQUITY</text>
          </svg>
        </div>
      </div>

      <!-- S2 Defining Impact -->
      <div class="slide s2">
        <div class="s2-left">
          <div class="eyebrow">Defining Research Impact</div>
          <h2 class="s2-headline">What do we mean<br/>by <em>change</em>?</h2>
          <p class="s2-body">At Concordia, we define research impact as the <strong>change</strong> that research activities contribute to society and beyond &mdash; an ongoing process of engagement that can lead to academic, social, cultural, economic, environmental, or policy effects.</p>
          <a class="slide-link" href="#learn" data-slide-link="learn">Learn more about research impact &rarr;</a>
        </div>
        <div class="s2-right">
          <div class="s2-traits">
            <div class="s2-trait-label">Impact can be&hellip;</div>
            <div class="s2-trait-item">Positive or negative</div>
            <div class="s2-trait-item">Different types &amp; natures</div>
            <div class="s2-trait-item">Different times &amp; scales</div>
            <div class="s2-trait-item">From the process &amp; its results</div>
          </div>
        </div>
      </div>

      <!-- S3 The Challenge -->
      <div class="slide s3">
        <div class="s3-inner">
          <div class="eyebrow">The Challenge</div>
          <h2 class="s3-headline">The gap between knowledge<br/>and change is real.</h2>
          <p class="s3-body">Research doesn&rsquo;t automatically become impact. Knowledge moves through systems &mdash; academic, social, political &mdash; and the path is rarely straight. Most researchers navigate it without a map.</p>
          <a class="slide-link" href="#learn" data-slide-link="learn">Plan your impact &rarr;</a>
          <div class="gap-diagram">
            <div class="gap-icons-row">
              <div class="gap-icon"><svg viewBox="0 0 28 28" width="26" height="26" fill="none" stroke="rgba(255,255,255,0.55)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 5 L10 14 L6 22 L22 22 L18 14 L18 5"/><line x1="8" y1="5" x2="20" y2="5"/><path d="M9 17 C11 15 17 15 19 17" opacity="0.4"/></svg></div>
              <div class="gap-connector"><div class="gap-line"></div></div>
              <div class="gap-icon"><svg viewBox="0 0 28 28" width="26" height="26" fill="none" stroke="rgba(255,255,255,0.55)" stroke-width="1.5" stroke-linecap="round"><rect x="5" y="4" width="18" height="20" rx="2"/><line x1="5" y1="9" x2="23" y2="9"/><line x1="9" y1="13" x2="19" y2="13"/><line x1="9" y1="16.5" x2="19" y2="16.5"/><line x1="9" y1="20" x2="15" y2="20" opacity="0.5"/></svg></div>
              <div class="gap-connector wide" style="position:relative;"><div class="gap-line broken"></div><div class="gap-question">?</div></div>
              <div class="gap-icon"><svg viewBox="0 0 28 28" width="26" height="26" fill="none" stroke="rgba(255,255,255,0.55)" stroke-width="1.5" stroke-linecap="round"><circle cx="9" cy="9" r="3" opacity="0.7"/><circle cx="19" cy="9" r="3" opacity="0.7"/><circle cx="14" cy="10" r="3.5"/><path d="M6 22 C6 18 9 16 14 16 C19 16 22 18 22 22"/></svg></div>
              <div class="gap-connector"><div class="gap-line"></div></div>
              <div class="gap-icon highlight"><svg viewBox="0 0 28 28" width="26" height="26" fill="none" stroke="rgba(244,208,213,0.95)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="14,4 16.5,11 24,11 18,15.5 20.5,22.5 14,18 7.5,22.5 10,15.5 4,11 11.5,11"/></svg></div>
            </div>
            <div class="gap-labels-row">
              <div class="gap-node-labels"><div class="gap-label">Discovery</div></div>
              <div class="gap-connector-spacer"></div>
              <div class="gap-node-labels"><div class="gap-label">Publication</div></div>
              <div class="gap-connector-spacer wide"></div>
              <div class="gap-node-labels"><div class="gap-label">Uptake</div></div>
              <div class="gap-connector-spacer"></div>
              <div class="gap-node-labels"><div class="gap-label highlight">Impact</div></div>
            </div>
          </div>
        </div>
      </div>

      <!-- S4 Seven Pathways -->
      <div class="slide s4">
        <div class="s4-inner">
          <div class="eyebrow">The Framework</div>
          <h2 class="s4-headline">Seven pathways to impact.</h2>
          <p class="s4-sub">Not a checklist &mdash; a starting place. Each pathway offers a different approach to creating real-world change from your research. Most researchers find more than one applies to them.</p>
          <div class="c-pw-grid">
            <div class="pw featured" data-pathway="academic-scholarship" role="button" tabindex="0" style="border-left-color:#912338;">
              <div class="pw-icon" style="background:rgba(145,35,56,0.08);">
                <svg viewBox="0 0 28 28" width="28" height="28" fill="none" stroke="#912338" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14 22 V8 C14 8 10 6 5 8 V22 C10 20 14 22 14 22 Z"/><path d="M14 22 V8 C14 8 18 6 23 8 V22 C18 20 14 22 14 22 Z"/><line x1="8" y1="12" x2="12" y2="12" opacity="0.5"/><line x1="8" y1="15" x2="12" y2="15" opacity="0.5"/><line x1="16" y1="12" x2="20" y2="12" opacity="0.5"/></svg>
              </div>
              <div class="pw-name">Academic Scholarship</div>
              <div class="pw-desc">Advance knowledge, methods, and scholarly contribution within and beyond your field &mdash; through publications, open access, data stewardship, and how your work is assessed and recognised.</div>
            </div>
            <div class="pw" data-pathway="community-engagement" role="button" tabindex="0" style="border-left-color:#DB0272;">
              <div class="pw-top"><div class="pw-icon" style="background:rgba(219,2,114,0.07);"><svg viewBox="0 0 18 18" width="18" height="18" fill="none" stroke="#DB0272" stroke-width="1.5" stroke-linecap="round"><circle cx="9" cy="6" r="3"/><circle cx="4.5" cy="8" r="2.2" opacity="0.6"/><circle cx="13.5" cy="8" r="2.2" opacity="0.6"/><path d="M5 16 C5 13 7 11.5 9 11.5 C11 11.5 13 13 13 16" opacity="0.8"/></svg></div><div class="pw-name">Community Engagement</div></div>
              <div class="pw-desc">Co-create research with communities and sustain reciprocal partnerships.</div>
            </div>
            <div class="pw" data-pathway="innovation" role="button" tabindex="0" style="border-left-color:#DA3A16;">
              <div class="pw-top"><div class="pw-icon" style="background:rgba(218,58,22,0.07);"><svg viewBox="0 0 18 18" width="18" height="18" fill="none" stroke="#DA3A16" stroke-width="1.5" stroke-linecap="round"><path d="M9 2 C6.2 2 4 4.2 4 7 C4 9 5.2 10.5 6 11.5 L12 11.5 C12.8 10.5 14 9 14 7 C14 4.2 11.8 2 9 2"/><line x1="6.5" y1="13.5" x2="11.5" y2="13.5"/><line x1="7.5" y1="15.5" x2="10.5" y2="15.5"/></svg></div><div class="pw-name">Innovation</div></div>
              <div class="pw-desc">Translate research into new methods, tools, or services that improve practice.</div>
            </div>
            <div class="pw" data-pathway="commercialization" role="button" tabindex="0" style="border-left-color:#573996;">
              <div class="pw-top"><div class="pw-icon" style="background:rgba(87,57,150,0.07);"><svg viewBox="0 0 18 18" width="18" height="18" fill="none" stroke="#573996" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="2,14 6,9 10,11 15,4"/><polyline points="11,4 15,4 15,8"/></svg></div><div class="pw-name">Commercialization</div></div>
              <div class="pw-desc">Move research-based ideas toward market-ready products or ventures.</div>
            </div>
            <div class="pw" data-pathway="policy" role="button" tabindex="0" style="border-left-color:#0072A8;">
              <div class="pw-top"><div class="pw-icon" style="background:rgba(0,114,168,0.07);"><svg viewBox="0 0 18 18" width="18" height="18" fill="none" stroke="#0072A8" stroke-width="1.5" stroke-linecap="round"><rect x="3" y="2" width="12" height="14" rx="1.5"/><line x1="6" y1="6" x2="12" y2="6"/><line x1="6" y1="9" x2="12" y2="9"/><line x1="6" y1="12" x2="9.5" y2="12"/></svg></div><div class="pw-name">Policy</div></div>
              <div class="pw-desc">Connect evidence to policy conversations and decision-making timelines.</div>
            </div>
            <div class="pw" data-pathway="communications" role="button" tabindex="0" style="border-left-color:#B07D00;">
              <div class="pw-top"><div class="pw-icon" style="background:rgba(176,125,0,0.07);"><svg viewBox="0 0 18 18" width="18" height="18" fill="none" stroke="#B07D00" stroke-width="1.5" stroke-linecap="round"><circle cx="9" cy="11" r="2"/><path d="M5.5 7.5 C5.5 5.5 7.1 4 9 4 C10.9 4 12.5 5.5 12.5 7.5" opacity="0.7"/><path d="M3 5.5 C3 2.5 5.7 0.5 9 0.5 C12.3 0.5 15 2.5 15 5.5" opacity="0.4"/><line x1="9" y1="13" x2="9" y2="16"/><line x1="6.5" y1="16" x2="11.5" y2="16"/></svg></div><div class="pw-name">Communications</div></div>
              <div class="pw-desc">Share research in accessible ways that reach public and professional audiences.</div>
            </div>
            <div class="pw" data-pathway="research-creation" role="button" tabindex="0" style="border-left-color:#508212;">
              <div class="pw-top"><div class="pw-icon" style="background:rgba(80,130,18,0.07);"><svg viewBox="0 0 18 18" width="18" height="18" fill="none" stroke="#508212" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 15 L11 5.5 L13 4 L14 5 L12.5 7 L3 15 Z"/><circle cx="3.5" cy="14.5" r="1.5" fill="rgba(80,130,18,0.3)"/><path d="M13.5 2.5 C14.5 2 15.5 3 15 4" opacity="0.5"/></svg></div><div class="pw-name">Research Creation</div></div>
              <div class="pw-desc">Create and present research through artistic and practice-based approaches.</div>
            </div>
          </div>
        </div>
      </div>

      <!-- S5 Meet You Where You Are -->
      <div class="slide s5">
        <div class="s5-inner">
          <div class="eyebrow">The Research Lifecycle</div>
          <h2 class="s5-headline">Meet you where you are.</h2>
          <p class="s5-sub">Impact support looks different at every stage. Pathways is designed for all three moments in your research project.</p>
          <div class="lifecycle">
            <div class="lc-stage" data-stage="Developing an Idea" role="button" tabindex="0">
              <div class="lc-bubble"><svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="rgba(255,255,255,0.82)" stroke-width="1.6" stroke-linecap="round"><line x1="12" y1="21" x2="12" y2="11"/><path d="M12 11 C12 7 8.5 5 6 6 C6 9 8 12 12 11"/><path d="M12 14 C12 11 15.5 9 18 10 C18 13 15 15.5 12 14"/></svg></div>
              <div class="lc-title">Developing</div>
              <div class="lc-desc">Shaping your question, building partnerships, planning impact from the start.</div>
              <div class="lc-tags"><span class="lc-tag">Framing</span><span class="lc-tag">Co-design</span><span class="lc-tag">Grant writing</span></div>
            </div>
            <div class="lc-stage" data-stage="Active Research" role="button" tabindex="0">
              <div class="lc-bubble"><svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="rgba(255,255,255,0.82)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="13,3 7,13 12,13 11,21 17,11 12,11 13,3"/></svg></div>
              <div class="lc-title">Active</div>
              <div class="lc-desc">Research is running. You&rsquo;re generating knowledge and need to move it out.</div>
              <div class="lc-tags"><span class="lc-tag">Mobilisation</span><span class="lc-tag">Engagement</span><span class="lc-tag">Translation</span></div>
            </div>
            <div class="lc-stage" data-stage="Finishing a Project" role="button" tabindex="0">
              <div class="lc-bubble"><svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="rgba(255,255,255,0.82)" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5.5"/><circle cx="12" cy="12" r="2" fill="rgba(255,255,255,0.7)" stroke="none"/></svg></div>
              <div class="lc-title">Finishing</div>
              <div class="lc-desc">Findings are ready. Now comes dissemination, uptake, and sustained change.</div>
              <div class="lc-tags"><span class="lc-tag">Dissemination</span><span class="lc-tag">Policy brief</span><span class="lc-tag">Legacy</span></div>
            </div>
          </div>
        </div>
      </div>

      <!-- S6 The Network -->
      <div class="slide s6">
        <div class="s6-left">
          <div class="eyebrow">Your Support Network</div>
          <h2 class="s6-headline">You don&rsquo;t navigate<br/>this <span>alone.</span></h2>
          <p class="s6-body">Led by the Office of Research, Pathways to Impact brings together units from across the university &mdash; and beyond &mdash; to create a coordinated, growing support network around researchers. This is an evolving collaboration.</p>
          <div class="partner-chips">
            <span class="partner-chip">Office of Research</span>
            <span class="partner-chip">4th Space</span>
            <span class="partner-chip">Concordia Library</span>
            <span class="partner-chip">University Communication Services</span>
            <span class="partner-chip">Community Engagement &amp; SHIFT Centre</span>
            <span class="partner-chip">District 3</span>
            <span class="partner-chip">V1 Studio</span>
            <span class="partner-chip" style="border-style:dashed;color:rgba(255,255,255,0.4);">+ More to come</span>
          </div>
          <a class="slide-link" href="#about" data-slide-link="partners">See all partners &rarr;</a>
        </div>
        <div class="s6-right">
          <svg width="260" height="260" viewBox="0 0 260 260" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="130" y1="100" x2="130" y2="50"  stroke="rgba(255,255,255,0.08)" stroke-width="1.5" stroke-dasharray="4 3"/>
            <line x1="156" y1="108" x2="196" y2="84"  stroke="rgba(255,255,255,0.08)" stroke-width="1.5" stroke-dasharray="4 3"/>
            <line x1="163" y1="130" x2="230" y2="156" stroke="rgba(255,255,255,0.08)" stroke-width="1.5" stroke-dasharray="4 3"/>
            <line x1="152" y1="158" x2="180" y2="210" stroke="rgba(255,255,255,0.08)" stroke-width="1.5" stroke-dasharray="4 3"/>
            <line x1="108" y1="158" x2="80"  y2="210" stroke="rgba(255,255,255,0.08)" stroke-width="1.5" stroke-dasharray="4 3"/>
            <line x1="97"  y1="130" x2="30"  y2="156" stroke="rgba(255,255,255,0.08)" stroke-width="1.5" stroke-dasharray="4 3"/>
            <line x1="104" y1="108" x2="66"  y2="84"  stroke="rgba(255,255,255,0.08)" stroke-width="1.5" stroke-dasharray="4 3"/>
            <circle cx="130" cy="130" r="30" fill="#912338"/>
            <circle cx="130" cy="130" r="40" fill="rgba(145,35,56,0.15)"/>
            <text x="130" y="126" text-anchor="middle" fill="white" font-size="8" font-weight="800" font-family="Segoe UI,sans-serif">PATHWAYS</text>
            <text x="130" y="137" text-anchor="middle" fill="rgba(255,255,255,0.65)" font-size="7" font-family="Segoe UI,sans-serif">TO IMPACT</text>
            <circle cx="130" cy="36" r="14" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.22)" stroke-width="1.5"/>
            <circle cx="208" cy="72" r="14" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.22)" stroke-width="1.5"/>
            <circle cx="244" cy="156" r="14" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.22)" stroke-width="1.5"/>
            <circle cx="186" cy="224" r="14" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.22)" stroke-width="1.5"/>
            <circle cx="74" cy="224" r="14" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.22)" stroke-width="1.5"/>
            <circle cx="16" cy="156" r="14" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.22)" stroke-width="1.5"/>
            <circle cx="52" cy="72" r="14" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.16)" stroke-width="1.5" stroke-dasharray="3 2"/>
          </svg>
        </div>
      </div>

      <!-- S7 Closing -->
      <div class="slide s7">
        <div class="s7-bg" style="width:500px;height:500px;top:-220px;right:-140px;"></div>
        <div class="s7-bg" style="width:320px;height:320px;bottom:-130px;left:-80px;"></div>
        <div class="s7-inner">
          <div class="eyebrow">You&rsquo;re not on your own</div>
          <h2 class="s7-headline">We&rsquo;re building this<br/>with you.</h2>
          <p class="s7-body">New services, new tools, and stories of impact champions at Concordia &mdash; this site grows with the research community. If you need help navigating it, or just want to talk through your impact goals, we&rsquo;re here.</p>
          <div class="promise-chips">
            <div class="promise-chip"><div class="promise-icon"><svg viewBox="0 0 14 14" width="11" height="11" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="1.4" stroke-linecap="round"><path d="M11.5 7 A4.5 4.5 0 1 1 9.5 3.2"/><polyline points="9.5,1.5 9.5,3.5 11.5,3.5"/></svg></div><span class="promise-text">Constantly updated</span></div>
            <div class="promise-chip"><div class="promise-icon"><svg viewBox="0 0 14 14" width="11" height="11" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><polygon points="7,1.5 8.5,5.2 12.5,5.5 9.5,8 10.5,12 7,9.8 3.5,12 4.5,8 1.5,5.5 5.5,5.2"/></svg></div><span class="promise-text">Impact champions</span></div>
            <div class="promise-chip"><div class="promise-icon"><svg viewBox="0 0 14 14" width="11" height="11" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="1.3" stroke-linecap="round"><rect x="1.5" y="2.5" width="11" height="10" rx="1.5"/><line x1="1.5" y1="5.5" x2="12.5" y2="5.5"/><line x1="4.5" y1="1.5" x2="4.5" y2="4"/><line x1="9.5" y1="1.5" x2="9.5" y2="4"/></svg></div><span class="promise-text">Events &amp; workshops</span></div>
            <div class="promise-chip"><div class="promise-icon"><svg viewBox="0 0 14 14" width="11" height="11" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="1.3" stroke-linecap="round"><rect x="1.5" y="3.5" width="11" height="8" rx="1.5"/><polyline points="1.5,3.5 7,8.5 12.5,3.5"/></svg></div><span class="promise-text">Human support</span></div>
          </div>
          <div class="cta-group">
            <button class="carousel-cta-btn carousel-cta-btn--primary" type="button">Explore the site &#8594;</button>
            <button class="carousel-cta-btn carousel-cta-btn--ghost" type="button">Contact us</button>
          </div>
        </div>
      </div>
    `;

    // Wire S7 CTA buttons
    const exploreBtn = track.querySelector(".carousel-cta-btn--primary");
    if (exploreBtn) exploreBtn.addEventListener("click", () => navigateTo("explore"));
    const contactBtn = track.querySelector(".carousel-cta-btn--ghost");
    if (contactBtn) contactBtn.addEventListener("click", () => navigateTo("about"));

    // Wire inline slide links (S1 vision, S2/S3 learn, S6 partners)
    track.querySelectorAll("[data-slide-link]").forEach((a) => {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        const target = a.dataset.slideLink;
        if (target === "vision") navigateTo("pathways-vision");
        else if (target === "partners") navigateTo("about", "partners");
        else if (target === "learn") navigateTo("learn");
      });
    });

    // Wire S4 pathway cards: deep-link to explore filtered by that pathway
    track.querySelectorAll(".c-pw-grid .pw").forEach((pw) => {
      const go = () => {
        const pathway = pw.dataset.pathway;
        if (pathway) navigateTo("explore", null, { pathway });
        else navigateTo("explore");
      };
      pw.addEventListener("click", go);
      pw.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); }
      });
    });

    // Wire S5 lifecycle stages: navigate to explore + apply stage filter
    track.querySelectorAll(".lifecycle .lc-stage").forEach((stageEl) => {
      const go = () => {
        const stage = stageEl.dataset.stage;
        navigateTo("explore");
        if (stage && typeof applyStageFilter === "function") applyStageFilter(stage);
      };
      stageEl.addEventListener("click", go);
      stageEl.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); }
      });
    });

    // Carousel logic
    const carouselTotal = 7;
    const CAROUSEL_INTERVAL = 14000;
    let carouselCurrent = 0;
    let carouselTimer;
    const lightSlides = new Set([1, 3]); // S2 (idx 1) and S4 (idx 3) are light

    function carouselUpdateChrome(n) {
      const isLight = lightSlides.has(n);
      btnPrev.className = `nav-btn nav-prev${isLight ? " dark" : ""}`;
      btnNext.className = `nav-btn nav-next${isLight ? " dark" : ""}`;
      counter.className = `slide-counter${isLight ? " dark" : ""}`;
      dotNav.querySelectorAll(".dot").forEach((d) => d.classList.toggle("dark-dot", isLight));
      progressBar.style.background = isLight ? "#912338" : "rgba(255,255,255,0.7)";
    }

    function carouselGoTo(n) {
      carouselCurrent = (n + carouselTotal) % carouselTotal;
      track.style.transform = `translateX(-${carouselCurrent * 100}%)`;
      dotNav.querySelectorAll(".dot").forEach((d, i) => d.classList.toggle("active", i === carouselCurrent));
      counter.textContent = `${carouselCurrent + 1} / ${carouselTotal}`;
      carouselUpdateChrome(carouselCurrent);
    }

    function carouselResetProgress() {
      progressBar.style.transition = "none";
      progressBar.style.width = "0%";
      void progressBar.offsetWidth;
      progressBar.style.transition = `width ${CAROUSEL_INTERVAL}ms linear`;
      progressBar.style.width = "100%";
    }

    function carouselStartTimer() {
      clearInterval(carouselTimer);
      carouselResetProgress();
      carouselTimer = setInterval(() => { carouselGoTo(carouselCurrent + 1); carouselResetProgress(); }, CAROUSEL_INTERVAL);
    }

    // Dots
    for (let i = 0; i < carouselTotal; i++) {
      const d = el("button", "dot" + (i === 0 ? " active" : ""));
      d.type = "button";
      d.setAttribute("aria-label", `Slide ${i + 1}`);
      d.addEventListener("click", () => { carouselGoTo(i); carouselStartTimer(); });
      dotNav.appendChild(d);
    }

    btnNext.addEventListener("click", () => { carouselGoTo(carouselCurrent + 1); if (!carouselPaused) carouselStartTimer(); });
    btnPrev.addEventListener("click", () => { carouselGoTo(carouselCurrent - 1); if (!carouselPaused) carouselStartTimer(); });
    pauseBtn.addEventListener("click", () => {
      carouselPaused = !carouselPaused;
      if (carouselPaused) {
        clearInterval(carouselTimer);
        progressBar.style.transition = "none";
        progressBar.style.width = "0%";
        pauseBtn.innerHTML = "&#9654;";
        pauseBtn.setAttribute("aria-label", "Play carousel");
      } else {
        carouselStartTimer();
        pauseBtn.innerHTML = "&#10074;&#10074;";
        pauseBtn.setAttribute("aria-label", "Pause carousel");
      }
    });
    carouselWrap.addEventListener("mouseenter", () => { if (!carouselPaused) { clearInterval(carouselTimer); progressBar.style.transition = "none"; } });
    carouselWrap.addEventListener("mouseleave", () => { if (!carouselPaused) carouselStartTimer(); });

    // Touch swipe
    let touchStartX = 0;
    carouselWrap.addEventListener("touchstart", (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
    carouselWrap.addEventListener("touchend", (e) => {
      const d = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(d) > 40) { carouselGoTo(carouselCurrent + (d > 0 ? 1 : -1)); carouselStartTimer(); }
    }, { passive: true });

    // Keyboard — only when home page is active
    document.addEventListener("keydown", (e) => {
      if (!section.classList.contains("is-active")) return;
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.key === "ArrowRight") { carouselGoTo(carouselCurrent + 1); carouselStartTimer(); }
      if (e.key === "ArrowLeft")  { carouselGoTo(carouselCurrent - 1); carouselStartTimer(); }
    });

    carouselWrap.appendChild(progressBar);
    carouselWrap.appendChild(counter);
    carouselWrap.appendChild(pauseBtn);
    carouselWrap.appendChild(btnPrev);
    carouselWrap.appendChild(btnNext);
    carouselWrap.appendChild(dotNav);
    carouselWrap.appendChild(track);
    container.appendChild(carouselWrap);
    carouselGoTo(0);
    carouselStartTimer();

    container.appendChild(el("hr", "section-divider"));

    // === Featured ===
    const popular = el("section", "popular-section");
    const popularHeader = el("div", "popular-header");
    popularHeader.appendChild(el("h2", "section-title", "Featured"));
    popularHeader.appendChild(el("p", "popular-subtitle", "Tools and resources to help you get started."));
    popular.appendChild(popularHeader);

    const FEATURED_IDS = [
      "learn-narrative-cv",
      "learn-impact-planner",
      "4th-space-public-engagement"
    ];
    const popularItems = FEATURED_IDS
      .map((id) => content.workshops.find((w) => w.id === id))
      .filter(Boolean);

    const popularGrid = el("div", "popular-grid");
    popularItems.forEach((item) => {
      const card = el("article", "popular-card");
      const itemStatus = getStatus(item);
      if (itemStatus !== "open") card.classList.add("is-" + itemStatus);
      const popHeader = el("div", "popular-card-header");
      popHeader.appendChild(formatBadge(item.format));
      const popPill = statusPill(itemStatus);
      if (popPill) popHeader.appendChild(popPill);
      card.appendChild(popHeader);
      card.appendChild(el("h3", "popular-card-title", item.title));
      const isTool = item.sourceType === "tool";
      const ctaBtn = el("button", "popular-card-cta", isTool ? "Start \u2192" : "Learn more \u2192");
      ctaBtn.type = "button";
      ctaBtn.addEventListener("click", () => {
        if (isTool) {
          navigateTo(item.internalRoute);
        } else {
          // Open the service modal directly (auto-routes to Explore en route).
          navigateToService(item.id);
        }
      });
      card.appendChild(ctaBtn);
      popularGrid.appendChild(card);
    });

    popular.appendChild(popularGrid);
    container.appendChild(popular);
    section.appendChild(container);
    section.openPathwayByKey = (pathwayKey) => {
      if (pathwayKey) navigateTo("explore", null, { pathway: pathwayKey });
    };
    section.closePathwayModal = () => {};
    return section;
  };

  const buildStart = () => {
    const section = el("section", "page page-start");
    section.dataset.page = "start";

    const container = el("div", "container");
    container.appendChild(el("h1", null, data.start.title));
    container.appendChild(el("p", "lead", data.start.intro));

    const journeysWrap = el("div", "journeys");

    data.start.journeys.forEach((journey) => {
      const details = el("details", "journey");
      details.dataset.journey = journey.id;
      const summary = el("summary", "journey-summary");
      summary.appendChild(el("h3", null, journey.title));
      summary.appendChild(el("p", "card-text", journey.description));
      details.appendChild(summary);

      const modulesWrap = el("div", "modules");
      journey.modules.forEach((module) => {
        const card = el("div", "module-card");
        card.appendChild(el("h4", null, module.title));
        card.appendChild(el("p", "module-text", module.description));

        const meta = el("div", "module-meta");
        const typeItem = el("div", "meta-item");
        typeItem.appendChild(el("span", "meta-label", data.start.labels.type));
        typeItem.appendChild(el("span", "meta-value", module.type));
        const timeItem = el("div", "meta-item");
        timeItem.appendChild(el("span", "meta-label", data.start.labels.time));
        timeItem.appendChild(el("span", "meta-value", module.time));
        meta.appendChild(typeItem);
        meta.appendChild(timeItem);
        card.appendChild(meta);
        modulesWrap.appendChild(card);
      });

      const actionRow = el("div", "module-actions");
      const oppButton = el("button", "btn", data.start.actions.opportunities);
      oppButton.type = "button";
      oppButton.addEventListener("click", () => {
        navigateTo("explore");
        applyStageFilter(journey.stage);
      });

      const contactButton = el("button", "btn primary", data.start.actions.contact);
      contactButton.type = "button";
      contactButton.addEventListener("click", () => {
        navigateTo("about", "contact");
      });

      actionRow.appendChild(oppButton);
      actionRow.appendChild(contactButton);
      modulesWrap.appendChild(actionRow);

      details.appendChild(modulesWrap);
      journeysWrap.appendChild(details);
      journeyDetails.set(journey.id, details);
    });

    container.appendChild(journeysWrap);
    section.appendChild(container);
    return section;
  };

  const buildSupport = () => {
    const section = el("section", "page page-support");
    section.dataset.page = "support";

    const container = el("div", "container");
    container.appendChild(el("h1", null, data.support.title));
    container.appendChild(el("p", "lead", data.support.intro));

    const supportExploreBridge = el("p", "page-bridge");
    supportExploreBridge.appendChild(document.createTextNode("Want to browse all resources? "));
    const toExploreLink = el("a", "bridge-link", "Browse resources \u2192");
    toExploreLink.href = "#explore";
    toExploreLink.addEventListener("click", (e) => { e.preventDefault(); navigateTo("explore"); });
    supportExploreBridge.appendChild(toExploreLink);
    container.appendChild(supportExploreBridge);

    const supportSectionsById = (data.support.sections || []).reduce((acc, item) => {
      acc[item.id] = item;
      return acc;
    }, {});
    const supportSearchConfig = data.support.search || {
      label: "Find support and resources",
      placeholder: "Find support and resources",
      ariaLabel: "Find support and resources"
    };

    const controls = el("div", "explore-controls");
    const searchWrap = el("div", "search-bar");
    const searchLabel = el("label", null, supportSearchConfig.label);
    const searchInput = el("input");
    const searchId = "support-search-input";
    searchInput.id = searchId;
    searchLabel.setAttribute("for", searchId);
    searchInput.type = "search";
    searchInput.placeholder = supportSearchConfig.placeholder;
    searchInput.setAttribute("aria-label", supportSearchConfig.ariaLabel);
    searchWrap.appendChild(searchLabel);
    searchWrap.appendChild(searchInput);
    controls.appendChild(searchWrap);
    container.appendChild(controls);

    const supportWrap = el("div", "journeys");
    const supportEntries = [];
    data.start.journeys.forEach((journey) => {
      const anchorId = supportAnchorByJourneyId[journey.id] || journey.id;
      const supportSection = supportSectionsById[anchorId];
      const details = el("details", "journey");
      details.id = anchorId;
      const summary = el("summary", "journey-summary");
      summary.appendChild(el("h3", null, journey.title));
      summary.appendChild(el("p", "card-text", journey.description));
      details.appendChild(summary);

      const body = el("div", "modules");
      if (supportSection && supportSection.lead) {
        body.appendChild(el("p", "module-text", supportSection.lead));
      }
      journey.modules.forEach((module) => {
        const card = el("div", "module-card");
        card.appendChild(el("h4", null, module.title));
        card.appendChild(el("p", "module-text", module.description));

        const meta = el("div", "module-meta");
        const typeItem = el("div", "meta-item");
        typeItem.appendChild(el("span", "meta-label", data.start.labels.type));
        typeItem.appendChild(el("span", "meta-value", module.type));
        const timeItem = el("div", "meta-item");
        timeItem.appendChild(el("span", "meta-label", data.start.labels.time));
        timeItem.appendChild(el("span", "meta-value", module.time));
        meta.appendChild(typeItem);
        meta.appendChild(timeItem);
        card.appendChild(meta);
        body.appendChild(card);
      });

      const actionRow = el("div", "module-actions");
      const oppButton = el("button", "btn", data.start.actions.opportunities);
      oppButton.type = "button";
      oppButton.addEventListener("click", () => {
        navigateTo("explore");
        applyStageFilter(journey.stage);
      });

      const contactButton = el("button", "btn primary", data.start.actions.contact);
      contactButton.type = "button";
      contactButton.addEventListener("click", () => {
        navigateTo("about", "contact");
      });

      actionRow.appendChild(oppButton);
      actionRow.appendChild(contactButton);
      body.appendChild(actionRow);

      details.appendChild(body);
      supportWrap.appendChild(details);

      const searchText = [
        journey.title,
        journey.description,
        supportSection && supportSection.lead,
        ...(supportSection && Array.isArray(supportSection.supports) ? supportSection.supports : []),
        ...journey.modules.flatMap((module) => [module.title, module.description, module.type, module.time])
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      supportEntries.push({ details, searchText });
    });

    const applySupportSearch = () => {
      const term = searchInput.value.trim().toLowerCase();
      supportEntries.forEach((entry) => {
        const matches = !term || entry.searchText.includes(term);
        entry.details.hidden = !matches;
        if (term && matches) {
          entry.details.open = true;
        }
      });
    };
    searchInput.addEventListener("input", applySupportSearch);
    section.applySearchTerm = (rawTerm) => {
      searchInput.value = (rawTerm || "").trim();
      applySupportSearch();
    };

    container.appendChild(supportWrap);
    section.appendChild(container);
    return section;
  };

  // ── What is a Narrative CV? — Impact 101 module ──────────────────────────
  // Layout is hardcoded; prose comes from content.learnSlots.narrativeCv (a
  // dict populated in init() from content/learn/narrative-cv-guide.md or a
  // labelled Google Doc). Each slot helper falls back to a hardcoded default
  // if the slot is missing, so partial migrations and fetch failures don't
  // break the page.
  const buildNarrativeCV101 = () => {
    const slots = (content.learnSlots && content.learnSlots.narrativeCv) || {};
    // slot(name, fallback) → trimmed string for short fields (titles, button text)
    const slot = (name, fallback) => {
      const v = slots[name];
      return v != null && v !== "" ? v : fallback;
    };
    // slotPara(name, fallback) → splits on blank lines into paragraph strings
    const slotPara = (name, fallback) => {
      const v = slots[name];
      const raw = v != null && v !== "" ? v : fallback;
      return raw.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
    };
    // slotList(name, fallback) → array of items from "- bullet" lines
    const slotList = (name, fallback) => {
      const v = slots[name];
      if (v == null || v === "") return fallback;
      return v.split("\n").map((l) => l.trim()).filter((l) => l.startsWith("- ")).map((l) => l.slice(2).trim());
    };
    // slotRows(name, fallback) → array of pipe-split arrays, one per non-empty line
    const slotRows = (name, fallback) => {
      const v = slots[name];
      if (v == null || v === "") return fallback;
      return v.split("\n").map((l) => l.trim()).filter(Boolean).map((l) => l.split("|").map((c) => c.trim()));
    };

    const wrap = el("div", "ncv-module");
    const moduleHeader = el("div", "ncv-module-header");
    moduleHeader.appendChild(el("span", "ncv-module-kicker", slot("header.kicker", "Before you start — Step 2")));
    moduleHeader.appendChild(el("h2", null, slot("header.title", "What is a Narrative CV?")));
    moduleHeader.appendChild(el("p", "ncv-module-lead", slot("header.lead", "A short orientation before you begin drafting. Read the overview, then expand any section for more detail.")));
    wrap.appendChild(moduleHeader);

    // Helper: accordion block
    const makeExpand = (btnText, bodyEl) => {
      const block = el("div", "ncv-expand-block");
      const btn = el("button", "ncv-expand-btn");
      btn.type = "button";
      btn.setAttribute("aria-expanded", "false");
      btn.appendChild(el("span", null, btnText));
      btn.appendChild(el("span", "ncv-chevron", "\u25be"));
      const body = el("div", "ncv-expand-body");
      body.appendChild(bodyEl);
      btn.addEventListener("click", () => {
        const open = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", String(!open));
        body.classList.toggle("is-open", !open);
      });
      block.appendChild(btn);
      block.appendChild(body);
      return block;
    };

    // Helper: section wrapper
    const makeSection = (num, title, children) => {
      const sec = el("div", "ncv-section");
      const hdr = el("div", "ncv-section-header");
      hdr.appendChild(el("span", "ncv-section-num", String(num).padStart(2, "0")));
      hdr.appendChild(el("h3", null, title));
      sec.appendChild(hdr);
      children.forEach((c) => sec.appendChild(c));
      return sec;
    };

    // Helper: compare table
    const makeTable = (headers, rows) => {
      const table = el("table", "ncv-compare-table");
      const thead = el("thead"); const theadRow = el("tr");
      headers.forEach((h) => theadRow.appendChild(el("th", null, h)));
      thead.appendChild(theadRow); table.appendChild(thead);
      const tbody = el("tbody");
      rows.forEach((cells) => {
        const row = el("tr");
        cells.forEach((c, i) => row.appendChild(el("td", i === 0 ? "ncv-td-label" : null, c)));
        tbody.appendChild(row);
      });
      table.appendChild(tbody);
      return table;
    };

    // Helper: ul list
    const makeUl = (items) => {
      const ul = el("ul", "ncv-list");
      items.forEach((text) => ul.appendChild(el("li", null, text)));
      return ul;
    };

    // Helper: callout
    const makeCallout = (strongText, bodyText, mod) => {
      const div = el("div", mod ? `ncv-callout ncv-callout--${mod}` : "ncv-callout");
      div.appendChild(el("strong", null, strongText));
      div.appendChild(el("span", null, bodyText));
      return div;
    };

    // ── Section 1: Why narrative CVs exist ──────────────────
    const s1card = el("div", "ncv-summary-card");
    s1card.appendChild(el("p", null, slot("s1.summary", "A Narrative CV asks you to describe your research contributions in your own words — not just list them. It was developed in response to a growing recognition that traditional CVs, with their rows of publications and metrics, miss most of what makes research valuable.")));
    const s1p = el("p", "ncv-body", slot("s1.lead", "Tri-agency funders in Canada (SSHRC, NSERC, CIHR) and the Fonds de recherche du Québec adopted narrative formats to address a specific problem: impact that matters most is often the hardest to count. Partnerships, mentorship, policy influence, community work, creative practice — none of these translate well into citation counts or journal rankings."));
    const s1callout = makeCallout(slot("s1.callout.strong", "The core shift —"), slot("s1.callout.body", "A traditional CV says what you did. A Narrative CV says what changed because of what you did, and why that matters."));
    const s1expBody = el("div");
    slotPara("s1.expand.p1", "The shift toward narrative formats is part of a broader global movement in research assessment — sometimes called “responsible research assessment.” Key documents driving this include the San Francisco Declaration on Research Assessment (DORA), the Leiden Manifesto, and the Coalition for Advancing Research Assessment (CoARA).").forEach((t) => s1expBody.appendChild(el("p", "ncv-body", t)));
    slotPara("s1.expand.p2", "In Canada, the Tri-agency Narrative CV was introduced in 2021, piloted with select programs, and has since expanded. It replaces or supplements the traditional CV-style Common CV in specific competitions. The FRQ in Québec developed its own parallel format (CV-FRQ) with similar principles.").forEach((t) => s1expBody.appendChild(el("p", "ncv-body", t)));
    slotPara("s1.expand.p3", "The practical implication: reviewers are now explicitly asked to evaluate contributions qualitatively, not just count outputs. Your job in the Narrative CV is to make that evaluation easy for them by describing what you did, what your specific role was, who was affected, and what evidence exists.").forEach((t) => s1expBody.appendChild(el("p", "ncv-body", t)));
    s1expBody.appendChild(el("p", "ncv-body", slot("s1.expand.funders-intro", "Which funders currently use narrative CV formats:")));
    const tags = el("div", "ncv-tag-row");
    slotList("s1.expand.funders", ["SSHRC", "NSERC", "CIHR", "FRQ (Québec)", "Wellcome Trust (UK)", "UKRI (UK)", "NWO (Netherlands)"]).forEach((t) => tags.appendChild(el("span", "ncv-tag", t)));
    s1expBody.appendChild(tags);
    s1expBody.appendChild(el("p", "ncv-note", slot("s1.expand.note", "Always check specific program guidelines — not every competition from these funders uses the narrative format yet.")));
    wrap.appendChild(makeSection(1, slot("s1.title", "Why narrative CVs exist"), [s1card, s1p, s1callout, makeExpand(slot("s1.expand.title", "More context: the policy shift behind narrative CVs"), s1expBody)]));

    // ── Section 2: The three sections ──────────────────────
    const s2p = el("p", "ncv-body", slot("s2.intro", "The Tri-agency CV (TCV) and CV-FRQ are both organized around three sections. You do not have to write them in order — most researchers find it easier to start with their contributions, then mentorship, then write the personal statement last."));
    const s2cards = el("div", "ncv-section-cards");
    const s2cardData = slotRows("s2.cards", [
      ["Section 1", "Personal Statement", "Your research identity: who you are, what drives your work, and where you are headed. Written last, but appears first."],
      ["Section 2", "Most Significant Contributions", "Up to 10 contributions that give the most complete picture of your research. Not necessarily your most recent — your most representative."],
      ["Section 3", "Supervisory & Mentorship Activities", "How you have supported the development of other researchers, trainees, students, and collaborators."]
    ]);
    s2cardData.forEach((row) => {
      const [num, title, body] = row;
      const card = el("div", "ncv-section-card");
      card.appendChild(el("div", "ncv-card-num", num || ""));
      card.appendChild(el("h4", null, title || ""));
      card.appendChild(el("p", null, body || ""));
      s2cards.appendChild(card);
    });
    const s2expABody = el("div");
    s2expABody.appendChild(el("p", "ncv-body", slot("s2.expand-a.intro", "Contributions go well beyond publications. The TCV instructions explicitly invite a wide range of outputs and activities. You can include:")));
    s2expABody.appendChild(makeUl(slotList("s2.expand-a.list", ["Journal articles, books, book chapters, reports", "Datasets, software, open-access resources", "Policy briefs, technical reports, submissions to government consultations", "Community partnerships, co-designed research projects", "Creative works, performances, exhibitions, films", "Methods or frameworks you developed that others have adopted", "Training programs, workshops, or curricula you created", "Patents, licences, spin-off ventures", "Grants you led that enabled others’ research", "Media coverage, public engagement, or science communication work"])));
    s2expABody.appendChild(el("p", "ncv-note", slot("s2.expand-a.note", "The key question is: what gives the most complete picture of your research and its effects? Not: what is the longest list of outputs I can generate.")));
    const s2expBBody = el("div");
    s2expBBody.appendChild(el("p", "ncv-body", slot("s2.expand-b.intro", "This section is broader than formal graduate supervision. It includes any role in which you supported someone else’s development as a researcher or professional:")));
    s2expBBody.appendChild(makeUl(slotList("s2.expand-b.list", ["Graduate supervision (MA, PhD, postdoctoral)", "Undergraduate research mentoring (honours theses, research assistants)", "Informal mentoring of early-career researchers or colleagues", "Community researcher training and capacity building", "Industry or government collaborator development", "Equity, diversity, and inclusion practices in your lab or team", "Peer mentoring, committee work, or writing retreats you organized"])));
    s2expBBody.appendChild(el("p", "ncv-note", slot("s2.expand-b.note", "If you are early in your career, or your discipline does not include graduate supervision, describe any informal support, training, or inclusive practices in your research environment. Context matters — reviewers are trained to read this section with career stage in mind.")));
    wrap.appendChild(makeSection(2, slot("s2.title", "The three sections"), [s2p, s2cards, makeExpand(slot("s2.expand-a.title", "What counts as a “contribution”?"), s2expABody), makeExpand(slot("s2.expand-b.title", "What counts as “supervisory and mentorship activity”?"), s2expBBody)]));

    // ── Section 3: TCV vs CV-FRQ ────────────────────────
    const s3p = el("p", "ncv-body", slot("s3.intro", "If you are applying to a Tri-agency program, you will use the TCV. If you are applying to a Fonds de recherche du Québec program, you will use the CV-FRQ. The structure is similar, but a few practical differences matter."));
    const s3rows = slotRows("s3.table", [
      ["Feature", "Tri-agency CV (TCV)", "CV-FRQ"],
      ["Funders", "SSHRC, NSERC, CIHR", "FRQSC, FRQNT, FRQS"],
      ["Personal Statement focus", "Your expertise relative to this specific opportunity or project", "Your fit with the program’s objectives and how your work complements the team"],
      ["Hyperlinks", "Not permitted (self-contained document). Exception: audio/visual creative works.", "Permitted for supporting materials"],
      ["Contributions section name", "Most Significant Contributions", "Réalisations les plus significatives"],
      ["Language", "English or French", "French required for most programs"],
      ["Page limits", "Varies by competition — always check the program guide", "Varies by competition — always check the program guide"]
    ]);
    const s3table = makeTable(s3rows[0] || [], s3rows.slice(1));
    wrap.appendChild(makeSection(3, slot("s3.title", "TCV vs CV-FRQ — key differences"), [s3p, s3table, makeCallout(slot("s3.callout.strong", "Not sure which one you need?"), slot("s3.callout.body", "Check the specific program’s application guide. If you are applying to both a Tri-agency and an FRQ competition, you will need to prepare both — but most of your content will transfer with minor adjustments."), "blue")]));

    // ── Section 4: How it differs from traditional CV ───────────────
    const s4p = el("p", "ncv-body", slot("s4.intro", "The biggest shift is not structural — it is rhetorical. A Narrative CV asks you to move from listing to explaining, and from passive to active voice."));
    const s4rows = slotRows("s4.table", [
      ["Dimension", "Traditional CV", "Narrative CV"],
      ["Structure", "Chronological lists by category", "Thematic descriptions by contribution"],
      ["Voice", "Passive or implied (“published,” “presented”)", "Active, first-person (“I developed,” “I led”)"],
      ["What it shows", "Volume and recency of outputs", "Quality, significance, and effect of contributions"],
      ["Your role", "Often unclear (team authorship, collaborative work)", "Explicitly stated for each contribution"],
      ["Evidence of impact", "Citation counts, journal rankings, h-index", "Qualitative and quantitative evidence of real-world effect"],
      ["Scope", "Exhaustive inventory", "Curated selection (3–10 most significant contributions)"]
    ]);
    const s4table = makeTable(s4rows[0] || [], s4rows.slice(1));
    const s4expABody = el("div");
    slotPara("s4.expand-a.p1", "Yes — and it is not just permitted, it is the point. Funders want to understand your individual contribution to collaborative work. Using “we” throughout makes it impossible for reviewers to assess your specific role.").forEach((t) => s4expABody.appendChild(el("p", "ncv-body", t)));
    slotPara("s4.expand-a.p2", "The guidance from the workshop is practical: replace “we” with “I” or “I led a team that…” You can acknowledge collaboration while still making your own contribution legible.").forEach((t) => s4expABody.appendChild(el("p", "ncv-body", t)));
    slotPara("s4.expand-a.p3", "Many researchers — particularly those trained in disciplines with strong norms around collective authorship, or those from cultures where self-promotion feels uncomfortable — find this the hardest shift to make. It is worth sitting with that discomfort, because reviewers will be asking “what did this person do?” for every entry.").forEach((t) => s4expABody.appendChild(el("p", "ncv-body", t)));
    const s4expBBody = el("div");
    s4expBBody.appendChild(el("p", "ncv-body", slot("s4.expand-b.intro", "Citation counts are one form of evidence, but they systematically undervalue applied, community-engaged, and practice-based research. Alternative forms include:")));
    s4expBBody.appendChild(makeUl(slotList("s4.expand-b.list", ["Adoption: “This method was adopted by [organization] for…”", "Policy uptake: “Cited in [government body]’s [year] guidelines as…”", "Media coverage: “Featured in [outlet], reaching an estimated [audience]”", "Partnership outcomes: “Led to [number] follow-on collaborations with [sectors]”", "Teaching integration: “Used as a teaching resource in [number] institutions”", "Community acknowledgement: “[Organization] credited this work with…”", "Independent replication: “Replicated by research groups in [locations]”", "Career outcomes of trainees: “Three former graduate students now hold [roles]”"])));
    s4expBBody.appendChild(el("p", "ncv-note", slot("s4.expand-b.note", "Qualitative evidence is explicitly invited by the TCV format. A well-placed sentence describing real-world uptake is often more compelling than a citation count.")));
    wrap.appendChild(makeSection(4, slot("s4.title", "How it differs from a traditional CV"), [s4p, s4table, makeExpand(slot("s4.expand-a.title", "Is it really okay to say “I” throughout?"), s4expABody), makeExpand(slot("s4.expand-b.title", "What evidence can I use besides citation counts?"), s4expBBody)]));

    // ── Section 5: Common concerns ────────────────────────
    const s5p = el("p", "ncv-body", slot("s5.intro", "These come up in almost every workshop. You are not alone in thinking any of them."));
    const s5myths = el("div", "ncv-myths");
    const s5mythRows = slotRows("s5.myths", [
      ["I don’t have enough impact yet — this format will make that obvious.", "Reviewers evaluate contributions relative to career stage. Early-career researchers are not expected to have the same scope as senior colleagues. Describe what you have done and what you are building toward."],
      ["My research is fundamental — I can’t point to real-world impact.", "Fundamental research has impact on knowledge, methods, fields, and the people you trained. Academic impact — influencing how others think, what gets studied, how problems get framed — counts fully."],
      ["My best contributions were collaborative — I can’t claim them individually.", "You can and should describe collaborative work. The task is to clarify your specific role within it — what decisions you made, what you developed, what you were responsible for — while acknowledging the team context."],
      ["Describing my own work this way feels like self-promotion.", "You are not inventing impact — you are making visible what already happened. Reviewers cannot fund what they cannot see. Describing your work clearly is a professional responsibility, not a personality trait."]
    ]);
    s5mythRows.forEach((row) => {
      const [concern, reality] = row;
      const r = el("div", "ncv-myth-row");
      const mythBox = el("div", "ncv-myth-box ncv-myth-box--concern");
      mythBox.appendChild(el("div", "ncv-myth-label", "Concern")); mythBox.appendChild(el("p", null, concern || ""));
      const realBox = el("div", "ncv-myth-box ncv-myth-box--reality");
      realBox.appendChild(el("div", "ncv-myth-label", "Reality")); realBox.appendChild(el("p", null, reality || ""));
      r.appendChild(mythBox); r.appendChild(realBox); s5myths.appendChild(r);
    });
    const s5expBody = el("div");
    slotPara("s5.expand.p1", "This is one of the places where Narrative CVs actually work better for you than traditional ones. Rather than forcing your work into a single disciplinary metric system, you can describe what your contributions mean across the fields they touch.").forEach((t) => s5expBody.appendChild(el("p", "ncv-body", t)));
    slotPara("s5.expand.p2", "Practically: name the relevant communities, explain the significance in plain language, and let the evidence span multiple fields. You do not need to pick one home discipline and pretend the rest of your work does not exist.").forEach((t) => s5expBody.appendChild(el("p", "ncv-body", t)));
    wrap.appendChild(makeSection(5, slot("s5.title", "Common concerns"), [s5p, s5myths, makeExpand(slot("s5.expand.title", "I work across disciplines — which field’s norms do I use?"), s5expBody)]));

    // ── Section 6: What reviewers look for ─────────────────────
    const s6card = el("div", "ncv-summary-card");
    s6card.appendChild(el("p", null, slot("s6.summary", "Reviewers are not scoring your productivity. They are asking: Does this researcher know what their work has contributed, and can they explain it clearly to someone outside their immediate field?")));
    const s6p = el("p", "ncv-body", slot("s6.lead", "Four things that consistently score higher in reviewed contributions:"));
    const makeS6Exp = (titleSlot, titleFallback, ...paraSlots) => {
      const d = el("div");
      paraSlots.forEach(([slotKey, fallback]) => {
        slotPara(slotKey, fallback).forEach((t) => d.appendChild(el("p", "ncv-body", t)));
      });
      return makeExpand(slot(titleSlot, titleFallback), d);
    };
    wrap.appendChild(makeSection(6, slot("s6.title", "What reviewers actually look for"), [
      s6card,
      s6p,
      makeS6Exp(
        "s6.exp1.title", "1 — Ownership: “I” not “we”",
        ["s6.exp1.p1", "Reviewers need to identify your contribution specifically. If every sentence uses “we,” they cannot. Be precise: “I designed the study,” “I developed the algorithm,” “I led the community consultation process.” You can acknowledge the team in the same sentence — just make your role explicit."]
      ),
      makeS6Exp(
        "s6.exp2.title", "2 — Specificity: named outcomes, not vague claims",
        ["s6.exp2.p1", "“Widely cited” means less than “cited in 47 studies across clinical, policy, and engineering applications.” “Worked with communities” means less than “co-designed a food security protocol with three urban Indigenous organizations in Montréal, subsequently adopted by the City’s housing strategy.”"],
        ["s6.exp2.p2", "Specificity is not bragging — it is evidence. Vague claims read as weak because they are unverifiable. Named outcomes, organizations, and numbers give reviewers something concrete to evaluate."]
      ),
      makeS6Exp(
        "s6.exp3.title", "3 — Significance: why this mattered to the field or world",
        ["s6.exp3.p1", "Describe not just what you did, but what it made possible. What existed before your work that was incomplete, incorrect, or absent? What changed? What can others now do or know that they could not before?"],
        ["s6.exp3.p2", "This does not require hyperbole. A modest, precise claim — “This dataset is the first longitudinal record of X in the Y region, and has since been used by three government agencies and two international research groups” — is far more powerful than a broad assertion about importance."]
      ),
      makeS6Exp(
        "s6.exp4.title", "4 — Coherence: a research story, not a list",
        ["s6.exp4.p1", "The best Narrative CVs read as a coherent body of work, not a set of disconnected items. The personal statement frames the whole. The contributions are curated, not exhaustive. Together they answer the question: “What is this researcher building, and why does it matter?”"],
        ["s6.exp4.p2", "You do not have to force all your work into a single theme — researchers whose work genuinely spans several areas can describe that breadth as a form of strength. But the narrative should feel intentional, not accidental."]
      )
    ]));

    // ── CTA strip ────────────────────────────────────────────────────────────
    const cta = el("div", "ncv-cta-strip");
    const ctaText = el("div", "ncv-cta-text");
    ctaText.appendChild(el("h3", null, slot("cta.title", "Ready to start drafting?")));
    ctaText.appendChild(el("p", null, slot("cta.body", "Use the guided module to build your Narrative CV outline, one section at a time.")));
    const ctaBtn = el("button", "btn btn-primary", slot("cta.btn", "Start Step 2 \u2192"));
    ctaBtn.type = "button";
    ctaBtn.addEventListener("click", () => navigateTo("tools-narrative"));
    cta.appendChild(ctaText); cta.appendChild(ctaBtn);
    wrap.appendChild(cta);

    return wrap;
  };

  const buildLearn = () => {
    const section = el("section", "page page-learn");
    section.dataset.page = "learn";

    const container = el("div", "container");
    container.appendChild(el("h1", null, data.learn.title));
    container.appendChild(el("p", "lead", data.learn.intro));

    // ── Tab bar ──────────────────────────────────────────────────────────
    const learnTabsBar = el("div", "explore-tabs");
    const tabImpact101 = el("button", "explore-tab is-active", "Impact 101");
    tabImpact101.type = "button";
    const tabTools = el("button", "explore-tab", "Tools");
    tabTools.type = "button";
    learnTabsBar.appendChild(tabImpact101);
    learnTabsBar.appendChild(tabTools);
    container.appendChild(learnTabsBar);

    // ── Tools tab content ────────────────────────────────────────────────
    const toolsContent = el("div", "explore-tab-content");

    const toolsIntro = el("p", "lead", "Two interactive tools to help you plan and tell your research story.");
    toolsContent.appendChild(toolsIntro);

    const cardsWrap = el("div", "tools-step-cards");

    const step1Card = el("div", "tools-step-card");
    step1Card.appendChild(el("div", "tools-step-card-step", "Step 1"));
    step1Card.appendChild(el("h2", null, "Plan Your Impact"));
    step1Card.appendChild(el("p", null, "Map your research outputs to outcomes, identify your impact pathways, and build your impact plan."));
    step1Card.appendChild(el("div", "tools-step-card-time", "\u23f1 45\u201360 min"));
    const step1Btn = el("button", "btn btn-primary", "Start \u2192");
    step1Btn.type = "button";

    const arrowEl = el("div", "tools-step-arrow", "\u2192");

    const step2Card = el("div", "tools-step-card");
    step2Card.appendChild(el("div", "tools-step-card-step", "Step 2"));
    step2Card.appendChild(el("h2", null, "Build Your Narrative CV"));
    step2Card.appendChild(el("p", null, "Develop a draft outline of your Narrative CV using guided prompts and real examples."));
    step2Card.appendChild(el("div", "tools-step-card-time", "\u23f1 60\u201390 min"));
    const step2Btn = el("button", "btn btn-primary", "Start \u2192");
    step2Btn.type = "button";
    step2Btn.addEventListener("click", () => navigateTo("tools-narrative"));
    step2Card.appendChild(step2Btn);

    cardsWrap.appendChild(step1Card);
    cardsWrap.appendChild(arrowEl);
    cardsWrap.appendChild(step2Card);
    toolsContent.appendChild(cardsWrap);

    const alreadyDone = el("p", "tools-already-link");
    const alreadyLink = el("button", "btn-link", "Already completed Step 1? Jump straight to Step 2 \u2192");
    alreadyLink.type = "button";
    alreadyLink.addEventListener("click", () => navigateTo("tools-narrative"));
    alreadyDone.appendChild(alreadyLink);
    toolsContent.appendChild(alreadyDone);

    // Planner area (revealed when Step 1 clicked)
    const plannerArea = el("div", "tools-planner-area is-hidden");
    const backToTools = el("button", "btn btn-ghost tools-back-btn", "\u2190 Back to Tools");
    backToTools.type = "button";
    backToTools.addEventListener("click", () => {
      plannerArea.classList.add("is-hidden");
      cardsWrap.classList.remove("is-hidden");
      alreadyDone.classList.remove("is-hidden");
    });
    plannerArea.appendChild(backToTools);

    let plannerBuilt = false;
    step1Btn.addEventListener("click", () => {
      cardsWrap.classList.add("is-hidden");
      alreadyDone.classList.add("is-hidden");
      plannerArea.classList.remove("is-hidden");
      if (!plannerBuilt) {
        const plannerEl = buildImpactPlanner();
        if (plannerEl) plannerArea.appendChild(plannerEl);
        plannerBuilt = true;
      }
      plannerArea.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    step1Card.appendChild(step1Btn);

    toolsContent.appendChild(plannerArea);

    // ── Impact 101 tab content ───────────────────────────────────────────
    const impact101Content = el("div", "explore-tab-content is-active");

    const grid = el("div", "learn-grid");

    const impact = el("div", "learn-impact");
    impact.appendChild(el("p", null, data.learn.impact.body));
    const orientLine = el("p", "learn-orient-line");
    orientLine.innerHTML = "Here you can find guides and learning modules to help you get oriented. If you can\u2019t find what you\u2019re looking for, <a href=\"#about\" class=\"text-link\">please contact us</a>.";
    impact.appendChild(orientLine);
    grid.appendChild(impact);

    const topics = el("div", "learn-topics");
    topics.appendChild(el("h2", "section-title", data.learn.topics.title));
    const topicGrid = el("div", "topic-grid");

    // Helper — build + register a full module page
    const makeModulePage = (id, title, contentEl) => {
      const pg = el("div", "page learn-module-page");
      const backBtn = el("button", "learn-module-back");
      backBtn.type = "button";
      backBtn.innerHTML = "\u2190 Back to Learn";
      backBtn.addEventListener("click", () => navigateTo("learn"));
      pg.appendChild(backBtn);
      pg.appendChild(el("h1", "learn-module-title", title));
      if (contentEl) {
        pg.appendChild(contentEl);
      } else {
        const ph = el("div", "learn-module-placeholder");
        ph.appendChild(el("p", null, "Waiting for content."));
        pg.appendChild(ph);
      }
      pages.set(id, pg);
      appRoot.appendChild(pg);
    };

    // Build myths content element
    const mythsContentEl = el("div", "myths");
    data.learn.myths.items.forEach((item) => {
      const card = el("div", "myth-card");
      const mythLine = el("div", "myth-line");
      mythLine.appendChild(el("span", "line-label", data.learn.myths.labels.myth));
      mythLine.appendChild(el("span", null, item.myth));
      const realityLine = el("div", "myth-line");
      realityLine.appendChild(el("span", "line-label", data.learn.myths.labels.reality));
      realityLine.appendChild(el("span", null, item.reality));
      card.appendChild(mythLine);
      card.appendChild(realityLine);
      mythsContentEl.appendChild(card);
    });

    // Register module pages (placeholder or real content)
    const topicModules = [
      { id: "learn-module-disciplines", title: "Impact across disciplines", content: null },
      { id: "learn-module-evidence",    title: "Evidence that counts",       content: null },
      { id: "learn-module-plan-early",  title: "Why plan early",             content: null },
      { id: "learn-module-myths",       title: data.learn.myths.title,       content: mythsContentEl },
      { id: "learn-module-ncv",         title: "What is a Narrative CV?",    content: buildNarrativeCV101() }
    ];
    topicModules.forEach(({ id, title, content }) => makeModulePage(id, title, content));

    // All topic cards — each opens its module page
    const allModuleCards = [
      { id: "learn-module-ncv",         title: "What is a Narrative CV?",     body: "Why narrative CVs exist, the three sections, TCV vs CV-FRQ differences, common concerns, and what reviewers look for." },
      { id: "learn-module-myths",       title: data.learn.myths.title,        body: "Common misconceptions about research impact and what the evidence actually shows." },
      { id: "learn-module-disciplines", title: "Impact across disciplines",   body: "Different fields generate different kinds of impact. Learn how to articulate yours in ways that fit your discipline." },
      { id: "learn-module-evidence",    title: "Evidence that counts",        body: "Discover qualitative and quantitative evidence that can demonstrate change over time." },
      { id: "learn-module-plan-early",  title: "Why plan early",              body: "Early planning makes it easier to align methods, partners, and outputs with real-world outcomes." }
    ];
    allModuleCards.forEach(({ id, title, body }) => {
      const card = el("button", "topic-card topic-card--expandable");
      card.type = "button";
      card.appendChild(el("h3", null, title));
      card.appendChild(el("p", null, body));
      card.appendChild(el("span", "topic-card-hint", "\u2192"));
      card.addEventListener("click", () => navigateTo(id));
      topicGrid.appendChild(card);
    });

    topics.appendChild(topicGrid);

    grid.appendChild(topics);

    // ── Featured External Resources ────────────────────────────────────
    if (data.explore.externalResources && data.explore.externalResources.length) {
      const extSection = el("div", "learn-resources");
      const extHeader = el("div", "learn-ext-header");
      extHeader.appendChild(el("h2", "section-title", "Featured External Resources"));
      extHeader.appendChild(el("p", "learn-ext-intro", "Highly recommended tools and frameworks from our research impact network."));
      extSection.appendChild(extHeader);

      const allRes = data.explore.externalResources;
      const PER_SLIDE = 3;
      let extPage = 0;
      const totalPages = Math.ceil(allRes.length / PER_SLIDE);

      const extGrid = el("div", "learn-ext-grid");
      const extNav = el("div", "learn-ext-nav");

      const renderExtPage = () => {
        clear(extGrid);
        const start = extPage * PER_SLIDE;
        const slice = allRes.slice(start, start + PER_SLIDE);
        slice.forEach((res) => {
          const card = el("a", "learn-ext-card");
          card.href = res.externalUrl;
          card.target = "_blank";
          card.rel = "noopener noreferrer";
          card.appendChild(el("h3", null, res.title));
          if (res.time) {
            card.appendChild(el("span", "card-time-pill", res.time));
          }
          card.appendChild(el("p", "learn-ext-author", res.author));
          card.appendChild(el("span", "learn-ext-arrow", "\u2197"));
          extGrid.appendChild(card);
        });
        // Update nav
        clear(extNav);
        const prevBtn = el("button", "learn-ext-nav-btn" + (extPage === 0 ? " is-disabled" : ""), "\u2190");
        prevBtn.type = "button";
        prevBtn.disabled = extPage === 0;
        prevBtn.addEventListener("click", () => { if (extPage > 0) { extPage--; renderExtPage(); } });
        const counter = el("span", "learn-ext-counter", (extPage + 1) + " / " + totalPages);
        const nextBtn = el("button", "learn-ext-nav-btn" + (extPage >= totalPages - 1 ? " is-disabled" : ""), "\u2192");
        nextBtn.type = "button";
        nextBtn.disabled = extPage >= totalPages - 1;
        nextBtn.addEventListener("click", () => { if (extPage < totalPages - 1) { extPage++; renderExtPage(); } });
        extNav.appendChild(prevBtn);
        extNav.appendChild(counter);
        extNav.appendChild(nextBtn);
      };

      renderExtPage();
      extSection.appendChild(extGrid);
      if (totalPages > 1) extSection.appendChild(extNav);
      grid.appendChild(extSection);
    }

    impact101Content.appendChild(grid);

    // ── Wire up tabs ─────────────────────────────────────────────────────
    container.appendChild(impact101Content);
    container.appendChild(toolsContent);

    const learnTabs = [tabImpact101, tabTools];
    const learnContents = [impact101Content, toolsContent];
    const learnPanelIds = ["learn-panel-impact101", "learn-panel-tools"];
    learnTabsBar.setAttribute("role", "tablist");
    learnTabs.forEach((tab, i) => {
      learnContents[i].id = learnPanelIds[i];
      learnContents[i].setAttribute("role", "tabpanel");
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-selected", i === 0 ? "true" : "false");
      tab.setAttribute("aria-controls", learnPanelIds[i]);
      tab.setAttribute("tabindex", i === 0 ? "0" : "-1");
      tab.addEventListener("click", () => {
        learnTabs.forEach((t, j) => {
          const active = t === tab;
          t.classList.toggle("is-active", active);
          t.setAttribute("aria-selected", active ? "true" : "false");
          t.setAttribute("tabindex", active ? "0" : "-1");
          learnContents[j].classList.toggle("is-active", active);
        });
      });
    });
    learnTabsBar.addEventListener("keydown", (e) => {
      const idx = learnTabs.indexOf(document.activeElement);
      if (idx < 0) return;
      let next = -1;
      if (e.key === "ArrowRight") next = (idx + 1) % learnTabs.length;
      else if (e.key === "ArrowLeft") next = (idx - 1 + learnTabs.length) % learnTabs.length;
      if (next >= 0) { e.preventDefault(); learnTabs[next].click(); learnTabs[next].focus(); }
    });

    section.resetState = () => {
      tabImpact101.click();
    };

    section.appendChild(container);
    return section;
  };

  // ── Impact Planner (standalone, used by buildTools) ──────────────────────
  const buildImpactPlanner = () => {
    if (!data.learn.impactPlanning) return null;
    const planner = data.learn.impactPlanning;
    const plannerSection = el("section", "learn-impact-planner");
    plannerSection.appendChild(el("h2", "section-title", planner.title));
    if (planner.subtitle) {
      plannerSection.appendChild(el("p", "card-text", planner.subtitle));
    }

    const plannerState = {
      started: false,
      stepIndex: 0,
      showSummary: false,
      values: {
        change: "",
        outcome1: "",
        outcome2: "",
        outcome3: "",
        outputTypes: [],
        otherOutputType: "",
        outputsText: "",
        outputConnection: "",
        pathwaySelections: [],
        pathwayReflection: "",
        indicator1: "",
        indicator2: ""
      }
    };

    const PLANNER_STORAGE_KEY = "pathways-impact-planner-v1";

    const saveState = () => {
      try {
        localStorage.setItem(PLANNER_STORAGE_KEY, JSON.stringify({
          stepIndex: plannerState.stepIndex,
          showSummary: plannerState.showSummary,
          values: plannerState.values
        }));
      } catch (_) {}
    };

    const clearSavedState = () => {
      try { localStorage.removeItem(PLANNER_STORAGE_KEY); } catch (_) {}
    };

    (() => {
      try {
        const raw = localStorage.getItem(PLANNER_STORAGE_KEY);
        if (!raw) return;
        const saved = JSON.parse(raw);
        if (saved && saved.values) {
          Object.assign(plannerState.values, saved.values);
          if (typeof saved.stepIndex === "number") plannerState.stepIndex = saved.stepIndex;
          if (saved.showSummary) plannerState.showSummary = true;
          const hasProgress = Object.values(plannerState.values).some(
            (v) => (typeof v === "string" && v.trim() !== "") || (Array.isArray(v) && v.length > 0)
          );
          if (hasProgress || plannerState.stepIndex > 0) plannerState.started = true;
        }
      } catch (_) {}
    })();

    const plannerShell = el("div", "impact-planner-shell");
    const entryPanel = el("div", "impact-planner-entry");
    const workflowPanel = el("div", "impact-planner-workflow is-hidden");
    const summaryPanel = el("div", "impact-planner-summary is-hidden");
    plannerShell.appendChild(entryPanel);
    plannerShell.appendChild(workflowPanel);
    plannerShell.appendChild(summaryPanel);
    plannerSection.appendChild(plannerShell);

    const escapeTextForExport = (value) => String(value || "").trim() || "\u2014";

    const buildSummaryText = () => {
      const lines = [];
      lines.push(planner.summary.title);
      lines.push("");
      lines.push(`${planner.stages[0].title}`);
      lines.push(escapeTextForExport(plannerState.values.change));
      lines.push("");
      lines.push(`${planner.stages[1].title}`);
      lines.push(`Outcome 1: ${escapeTextForExport(plannerState.values.outcome1)}`);
      lines.push(`Outcome 2: ${escapeTextForExport(plannerState.values.outcome2)}`);
      lines.push(`Outcome 3: ${escapeTextForExport(plannerState.values.outcome3)}`);
      lines.push("");
      lines.push(`${planner.stages[2].title}`);
      lines.push(`Output types: ${plannerState.values.outputTypes.length ? plannerState.values.outputTypes.join(", ") : "\u2014"}`);
      if (plannerState.values.outputTypes.includes("Other")) {
        lines.push(`Other output type: ${escapeTextForExport(plannerState.values.otherOutputType)}`);
      }
      lines.push(`Main outputs: ${escapeTextForExport(plannerState.values.outputsText)}`);
      lines.push(`Output connection: ${escapeTextForExport(plannerState.values.outputConnection)}`);
      lines.push("");
      lines.push(`${planner.stages[3].title}`);
      lines.push(`Selected pathways: ${plannerState.values.pathwaySelections.length ? plannerState.values.pathwaySelections.join(", ") : "\u2014"}`);
      lines.push(`Reflection: ${escapeTextForExport(plannerState.values.pathwayReflection)}`);
      lines.push("");
      lines.push(`${planner.stages[4].title}`);
      lines.push(`Indicator 1: ${escapeTextForExport(plannerState.values.indicator1)}`);
      lines.push(`Indicator 2: ${escapeTextForExport(plannerState.values.indicator2)}`);
      return lines.join("\n");
    };

    const renderSummary = () => {
      clear(summaryPanel);
      const card = el("div", "impact-planner-card");
      card.appendChild(el("h3", null, planner.summary.title));
      if (planner.summary.intro) {
        card.appendChild(el("p", "card-text", planner.summary.intro));
      }

      const summaryGrid = el("div", "impact-summary-grid");
      const addSummaryBlock = (title, bodyNodes) => {
        const block = el("section", "impact-summary-block");
        block.appendChild(el("h4", null, title));
        bodyNodes.forEach((node) => block.appendChild(node));
        summaryGrid.appendChild(block);
      };

      addSummaryBlock(planner.stages[0].title, [el("p", "card-text", escapeTextForExport(plannerState.values.change))]);
      addSummaryBlock(planner.stages[1].title, [
        el("p", "card-text", `Outcome 1: ${escapeTextForExport(plannerState.values.outcome1)}`),
        el("p", "card-text", `Outcome 2: ${escapeTextForExport(plannerState.values.outcome2)}`),
        el("p", "card-text", `Outcome 3: ${escapeTextForExport(plannerState.values.outcome3)}`)
      ]);

      const outputTypesText = plannerState.values.outputTypes.length ? plannerState.values.outputTypes.join(", ") : "\u2014";
      const outputNodes = [
        el("p", "card-text", `Output types: ${outputTypesText}`),
        el("p", "card-text", `Main outputs: ${escapeTextForExport(plannerState.values.outputsText)}`),
        el("p", "card-text", `Output connection: ${escapeTextForExport(plannerState.values.outputConnection)}`)
      ];
      if (plannerState.values.outputTypes.includes("Other")) {
        outputNodes.splice(1, 0, el("p", "card-text", `Other output type: ${escapeTextForExport(plannerState.values.otherOutputType)}`));
      }
      addSummaryBlock(planner.stages[2].title, outputNodes);

      const pathwayText = plannerState.values.pathwaySelections.length ? plannerState.values.pathwaySelections.join(", ") : "\u2014";
      addSummaryBlock(planner.stages[3].title, [
        el("p", "card-text", `Selected pathways: ${pathwayText}`),
        el("p", "card-text", `Reflection: ${escapeTextForExport(plannerState.values.pathwayReflection)}`)
      ]);
      addSummaryBlock(planner.stages[4].title, [
        el("p", "card-text", `Indicator 1: ${escapeTextForExport(plannerState.values.indicator1)}`),
        el("p", "card-text", `Indicator 2: ${escapeTextForExport(plannerState.values.indicator2)}`)
      ]);

      card.appendChild(summaryGrid);

      const actions = el("div", "impact-planner-actions");

      const downloadButton = el("button", "btn", planner.labels.download);
      downloadButton.type = "button";
      downloadButton.addEventListener("click", () => {
        const blob = new Blob([buildSummaryText()], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = "impact-planning-summary.txt";
        anchor.click();
        URL.revokeObjectURL(url);
      });
      actions.appendChild(downloadButton);

      const copyButton = el("button", "btn", planner.labels.copy);
      copyButton.type = "button";
      copyButton.addEventListener("click", async () => {
        const summaryText = buildSummaryText();
        try {
          await navigator.clipboard.writeText(summaryText);
          copyButton.textContent = "Copied";
          window.setTimeout(() => { copyButton.textContent = planner.labels.copy; }, 1500);
        } catch (_error) {
          copyButton.textContent = "Copy unavailable";
          window.setTimeout(() => { copyButton.textContent = planner.labels.copy; }, 1500);
        }
      });
      actions.appendChild(copyButton);

      const consultLink = el("a", "btn primary", planner.labels.consult);
      consultLink.href = "#about";
      consultLink.addEventListener("click", (event) => {
        event.preventDefault();
        navigateTo("about", "contact-form");
      });
      actions.appendChild(consultLink);

      const backButton = el("button", "btn btn-ghost", "Back to module");
      backButton.type = "button";
      backButton.addEventListener("click", () => {
        plannerState.showSummary = false;
        renderPlanner();
      });
      actions.appendChild(backButton);

      const resetButton = el("button", "btn btn-ghost", planner.labels.reset);
      resetButton.type = "button";
      resetButton.addEventListener("click", () => {
        plannerState.started = false;
        plannerState.stepIndex = 0;
        plannerState.showSummary = false;
        plannerState.values = {
          change: "", outcome1: "", outcome2: "", outcome3: "",
          outputTypes: [], otherOutputType: "", outputsText: "", outputConnection: "",
          pathwaySelections: [], pathwayReflection: "", indicator1: "", indicator2: ""
        };
        clearSavedState();
        renderPlanner();
      });
      actions.appendChild(resetButton);

      card.appendChild(actions);
      summaryPanel.appendChild(card);
    };

    const renderPlanner = () => {
      saveState();
      entryPanel.classList.toggle("is-hidden", plannerState.started);
      workflowPanel.classList.toggle("is-hidden", !plannerState.started || plannerState.showSummary);
      summaryPanel.classList.toggle("is-hidden", !plannerState.showSummary);

      clear(entryPanel);
      clear(workflowPanel);

      const entryCard = el("div", "impact-planner-card");
      entryCard.appendChild(el("h3", "impact-planner-question", planner.entryQuestion));
      (planner.entryBody || []).forEach((line) => entryCard.appendChild(el("p", "card-text", line)));
      const stageList = el("ol", "impact-stage-list");
      (planner.stages || []).forEach((stage) => {
        stageList.appendChild(el("li", null, stage.title));
      });
      entryCard.appendChild(stageList);

      const completedCount = [
        plannerState.values.change.trim() !== "",
        plannerState.values.outcome1.trim() !== "",
        plannerState.values.outputsText.trim() !== "" || plannerState.values.outputTypes.length > 0,
        plannerState.values.pathwaySelections.length > 0,
        plannerState.values.indicator1.trim() !== ""
      ].filter(Boolean).length;
      const entryProgress = el("div", "impact-entry-progress");
      entryProgress.appendChild(el("p", "impact-entry-progress-label",
        `You\u2019re building an impact plan \u2014 ${completedCount} of ${planner.stages.length} sections complete`));
      const dotsRow = el("div", "impact-entry-dots");
      planner.stages.forEach((_, i) => {
        dotsRow.appendChild(el("span", i < completedCount ? "impact-entry-dot is-filled" : "impact-entry-dot"));
      });
      entryProgress.appendChild(dotsRow);
      entryCard.appendChild(entryProgress);

      const hasSavedProgress = plannerState.started || plannerState.stepIndex > 0;
      const startLabel = hasSavedProgress
        ? `Resume \u2014 Step ${plannerState.stepIndex + 1} of ${planner.stages.length}`
        : planner.labels.start;
      const startButton = el("button", "btn primary", startLabel);
      startButton.type = "button";
      startButton.addEventListener("click", () => {
        plannerState.started = true;
        plannerState.stepIndex = 0;
        plannerState.showSummary = false;
        renderPlanner();
      });
      entryCard.appendChild(startButton);
      entryPanel.appendChild(entryCard);

      if (!plannerState.started || plannerState.showSummary) {
        if (plannerState.showSummary) renderSummary();
        return;
      }

      const currentStep = planner.stages[plannerState.stepIndex];
      const promptConfig = planner.prompts[currentStep.id];
      const card = el("div", "impact-planner-card");

      const progress = el("div", "impact-step-progress");
      progress.appendChild(el("p", "impact-step-counter",
        `${planner.labels.stagePrefix} ${plannerState.stepIndex + 1} ${planner.labels.of} ${planner.stages.length}`));
      const progressTrack = el("div", "impact-progress-track");
      planner.stages.forEach((stage, index) => {
        const marker = el("button", "impact-progress-step", `${index + 1}`);
        marker.type = "button";
        marker.setAttribute("aria-label", stage.title);
        marker.classList.toggle("is-active", index === plannerState.stepIndex);
        marker.classList.toggle("is-complete", index < plannerState.stepIndex);
        marker.addEventListener("click", () => { plannerState.stepIndex = index; renderPlanner(); });
        progressTrack.appendChild(marker);
      });
      progress.appendChild(progressTrack);
      card.appendChild(progress);
      card.appendChild(el("h3", null, currentStep.title));

      const body = el("div", "impact-step-body");

      const addLabeledTextarea = (labelText, key, placeholder, optional = false) => {
        const field = el("div", "impact-field");
        const taId = `impact-${key}`;
        const lbl = el("label", null, optional ? `${labelText} (${planner.labels.optional})` : labelText);
        lbl.setAttribute("for", taId);
        field.appendChild(lbl);
        const textarea = el("textarea", "impact-textarea");
        textarea.id = taId;
        textarea.value = plannerState.values[key] || "";
        textarea.placeholder = placeholder || "";
        textarea.rows = 4;
        textarea.addEventListener("input", (e) => { plannerState.values[key] = e.target.value; saveState(); });
        field.appendChild(textarea);
        body.appendChild(field);
      };

      if (currentStep.id === "change") {
        (promptConfig.intro || []).forEach((line) => body.appendChild(el("p", "card-text", line)));
        addLabeledTextarea(promptConfig.fieldLabel, "change", promptConfig.placeholder);
        if (promptConfig.helperTitle) body.appendChild(el("p", "impact-helper-title", promptConfig.helperTitle));
        if (promptConfig.helperPrompts && promptConfig.helperPrompts.length) {
          const helperList = el("ul", "simple-list");
          promptConfig.helperPrompts.forEach((p) => helperList.appendChild(el("li", null, p)));
          body.appendChild(helperList);
        }
        if (promptConfig.note) body.appendChild(el("p", "impact-note", promptConfig.note));
      }

      if (currentStep.id === "outcomes") {
        if (plannerState.values.change.trim()) {
          const changePreview = el("div", "impact-preview");
          changePreview.appendChild(el("p", "meta-label", "Your change statement"));
          changePreview.appendChild(el("p", "card-text", plannerState.values.change));
          body.appendChild(changePreview);
        }
        body.appendChild(el("p", "card-text", promptConfig.intro));
        (promptConfig.fields || []).forEach((f, i) => addLabeledTextarea(f.label, f.id, f.placeholder, i > 0));
        if (promptConfig.check) body.appendChild(el("p", "impact-note", promptConfig.check));
      }

      if (currentStep.id === "outputs") {
        body.appendChild(el("p", "card-text", promptConfig.intro));
        body.appendChild(el("p", "impact-helper-title", promptConfig.typesLabel));
        const typeGrid = el("div", "impact-chip-grid");
        (promptConfig.outputTypes || []).forEach((typeLabel) => {
          const option = el("label", "impact-chip");
          const check = el("input");
          check.type = "checkbox";
          check.checked = plannerState.values.outputTypes.includes(typeLabel);
          check.addEventListener("change", (e) => {
            if (e.target.checked) {
              plannerState.values.outputTypes = [...plannerState.values.outputTypes, typeLabel];
            } else {
              plannerState.values.outputTypes = plannerState.values.outputTypes.filter((t) => t !== typeLabel);
              if (typeLabel === "Other") plannerState.values.otherOutputType = "";
            }
            renderPlanner();
          });
          option.appendChild(check);
          option.appendChild(el("span", null, typeLabel));
          typeGrid.appendChild(option);
        });
        body.appendChild(typeGrid);
        if (plannerState.values.outputTypes.includes("Other")) {
          const otherField = el("div", "impact-field");
          const otherLbl = el("label", null, promptConfig.otherLabel);
          otherLbl.setAttribute("for", "impact-other-output");
          otherField.appendChild(otherLbl);
          const otherInput = el("input", "impact-input");
          otherInput.id = "impact-other-output";
          otherInput.type = "text";
          otherInput.value = plannerState.values.otherOutputType;
          otherInput.placeholder = "Describe your output type";
          otherInput.addEventListener("input", (e) => { plannerState.values.otherOutputType = e.target.value; saveState(); });
          otherField.appendChild(otherInput);
          body.appendChild(otherField);
        }
        addLabeledTextarea(promptConfig.outputsLabel, "outputsText", promptConfig.outputsPlaceholder);
        const connectionField = el("div", "impact-field");
        connectionField.appendChild(el("label", null, promptConfig.linkLabel));
        const select = el("select", "impact-select");
        const defaultOpt = el("option", null, "Select");
        defaultOpt.value = "";
        select.appendChild(defaultOpt);
        (promptConfig.outputConnectionOptions || []).forEach((choice) => {
          const opt = el("option", null, choice);
          opt.value = choice;
          select.appendChild(opt);
        });
        select.value = plannerState.values.outputConnection || "";
        select.addEventListener("change", (e) => { plannerState.values.outputConnection = e.target.value; saveState(); });
        connectionField.appendChild(select);
        body.appendChild(connectionField);
      }

      if (currentStep.id === "pathways") {
        body.appendChild(el("p", "card-text", promptConfig.intro));
        const pathwayGrid = el("div", "impact-chip-grid");
        (promptConfig.options || []).forEach((optionLabel) => {
          const option = el("label", "impact-chip");
          const check = el("input");
          check.type = "checkbox";
          check.checked = plannerState.values.pathwaySelections.includes(optionLabel);
          check.addEventListener("change", (e) => {
            if (e.target.checked) {
              plannerState.values.pathwaySelections = [...plannerState.values.pathwaySelections, optionLabel];
            } else {
              plannerState.values.pathwaySelections = plannerState.values.pathwaySelections.filter((p) => p !== optionLabel);
            }
            saveState();
          });
          option.appendChild(check);
          option.appendChild(el("span", null, optionLabel));
          pathwayGrid.appendChild(option);
        });
        body.appendChild(pathwayGrid);
        addLabeledTextarea(promptConfig.reflectionLabel, "pathwayReflection", promptConfig.reflectionPlaceholder, true);
      }

      if (currentStep.id === "indicators") {
        body.appendChild(el("p", "card-text", promptConfig.intro));
        body.appendChild(el("p", "impact-helper-title", promptConfig.smartTitle));
        const smartList = el("ul", "simple-list");
        (promptConfig.smartItems || []).forEach((item) => smartList.appendChild(el("li", null, item)));
        body.appendChild(smartList);
        (promptConfig.fields || []).forEach((f, i) => addLabeledTextarea(f.label, f.id, f.placeholder, i > 0));
        const examplesWrap = el("div", "impact-examples");
        const outcomeExamples = el("div", "impact-example-group");
        outcomeExamples.appendChild(el("p", "impact-helper-title", "Outcome indicator examples"));
        const outcomeList = el("ul", "simple-list");
        (promptConfig.examples?.outcome || []).forEach((ex) => outcomeList.appendChild(el("li", null, ex)));
        outcomeExamples.appendChild(outcomeList);
        examplesWrap.appendChild(outcomeExamples);
        const outputExamples = el("div", "impact-example-group");
        outputExamples.appendChild(el("p", "impact-helper-title", "Output indicator examples"));
        const outputList = el("ul", "simple-list");
        (promptConfig.examples?.output || []).forEach((ex) => outputList.appendChild(el("li", null, ex)));
        outputExamples.appendChild(outputList);
        examplesWrap.appendChild(outputExamples);
        body.appendChild(examplesWrap);
      }

      card.appendChild(body);

      const nav = el("div", "impact-planner-nav");
      if (plannerState.stepIndex > 0) {
        const backButton = el("button", "btn", planner.labels.back);
        backButton.type = "button";
        backButton.addEventListener("click", () => {
          plannerState.stepIndex = Math.max(0, plannerState.stepIndex - 1);
          renderPlanner();
        });
        nav.appendChild(backButton);
      }
      const nextLabel = plannerState.stepIndex === planner.stages.length - 1
        ? planner.labels.openSummary
        : `${planner.labels.continue} \u2014 ${planner.stages[plannerState.stepIndex + 1].title}`;
      const nextButton = el("button", "btn primary", nextLabel);
      nextButton.type = "button";
      nextButton.addEventListener("click", () => {
        if (plannerState.stepIndex >= planner.stages.length - 1) {
          plannerState.showSummary = true;
        } else {
          plannerState.stepIndex += 1;
        }
        renderPlanner();
      });
      nav.appendChild(nextButton);
      card.appendChild(nav);
      workflowPanel.appendChild(card);
    };

    renderPlanner();
    return plannerSection;
  };

  // ── Tools landing page ────────────────────────────────────────────────────
  const buildTools = () => {
    const section = el("section", "page page-tools");
    section.dataset.page = "tools";

    const container = el("div", "container");
    container.appendChild(el("h1", null, "Tools"));
    container.appendChild(el("p", "lead", "Two interactive tools to help you plan and tell your research story."));

    // Step cards grid
    const cardsWrap = el("div", "tools-step-cards");

    const step1Card = el("div", "tools-step-card");
    step1Card.appendChild(el("div", "tools-step-card-step", "Step 1"));
    step1Card.appendChild(el("h2", null, "Plan Your Impact"));
    step1Card.appendChild(el("p", null, "Map your research outputs to outcomes, identify your impact pathways, and build your impact plan."));
    step1Card.appendChild(el("div", "tools-step-card-time", "\u23f1 45\u201360 min"));
    const step1Btn = el("button", "btn btn-primary", "Start \u2192");
    step1Btn.type = "button";

    const arrowEl = el("div", "tools-step-arrow", "\u2192");

    const step2Card = el("div", "tools-step-card");
    step2Card.appendChild(el("div", "tools-step-card-step", "Step 2"));
    step2Card.appendChild(el("h2", null, "Build Your Narrative CV"));
    step2Card.appendChild(el("p", null, "Develop a draft outline of your Narrative CV using guided prompts and real examples."));
    step2Card.appendChild(el("div", "tools-step-card-time", "\u23f1 60\u201390 min"));
    const step2Btn = el("button", "btn btn-primary", "Start \u2192");
    step2Btn.type = "button";
    step2Btn.addEventListener("click", () => navigateTo("tools-narrative"));
    step2Card.appendChild(step2Btn);

    cardsWrap.appendChild(step1Card);
    cardsWrap.appendChild(arrowEl);
    cardsWrap.appendChild(step2Card);
    container.appendChild(cardsWrap);

    // "Already completed Step 1?" link
    const alreadyDone = el("p", "tools-already-link");
    const alreadyLink = el("button", "btn-link", "Already completed Step 1? Jump straight to Step 2 \u2192");
    alreadyLink.type = "button";
    alreadyLink.addEventListener("click", () => navigateTo("tools-narrative"));
    alreadyDone.appendChild(alreadyLink);
    container.appendChild(alreadyDone);

    // Planner area (hidden until Step 1 clicked)
    const plannerArea = el("div", "tools-planner-area is-hidden");
    const backToTools = el("button", "btn btn-ghost tools-back-btn", "\u2190 Back to Tools");
    backToTools.type = "button";
    backToTools.addEventListener("click", () => {
      plannerArea.classList.add("is-hidden");
      cardsWrap.classList.remove("is-hidden");
      alreadyDone.classList.remove("is-hidden");
    });
    plannerArea.appendChild(backToTools);

    let plannerBuilt = false;
    step1Btn.addEventListener("click", () => {
      cardsWrap.classList.add("is-hidden");
      alreadyDone.classList.add("is-hidden");
      plannerArea.classList.remove("is-hidden");
      if (!plannerBuilt) {
        const plannerEl = buildImpactPlanner();
        if (plannerEl) plannerArea.appendChild(plannerEl);
        plannerBuilt = true;
      }
      plannerArea.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    step1Card.appendChild(step1Btn);

    container.appendChild(plannerArea);
    section.appendChild(container);

    section.openPlanner = () => {
      step1Btn.click();
    };

    return section;
  };

  // ── Narrative CV Module (#tools-narrative) ────────────────────────────────
  const buildNarrativeModule = () => {
    const NARRATIVE_KEY = "pathways-narrative-cv-v1";

    const BEFORE_AFTER = [
      {
        label: "Vague Contribution",
        before: "I published research on housing insecurity among urban youth and presented findings at several conferences. The work was well-received and contributed to the literature on poverty.",
        after: "As lead author, I published a mixed-methods study examining housing insecurity among # urban youth in [city/region], which identified three policy-actionable barriers to stable housing. Findings were presented to [community organization]. The study has been cited in # subsequent peer-reviewed works and adopted as a teaching resource in # institutions.",
        changed: "Specific innovation named. Field-level significance stated. Evidence quantified."
      },
      {
        label: "Unclear Role",
        before: "We developed a machine learning pipeline for early detection of structural failures in bridges.",
        after: "I designed and led the algorithm development phase of a 6-person interdisciplinary team, specifically building the anomaly detection model that increased failure prediction accuracy by 34% over existing benchmarks.",
        changed: "Team context preserved. Individual contribution isolated. Specific technical task named."
      },
      {
        label: "Missing Impact",
        before: "I published a framework for reducing energy consumption in data centres.",
        after: "I developed an energy optimization framework subsequently adopted by Company X to redesign cooling infrastructure across 3 facilities, reducing annual energy expenditure by an estimated 18%.",
        changed: "Named adopter. Specific application context. Measurable real-world outcome."
      },
      {
        label: "Weak Evidence",
        before: "This work was published in a high-impact journal and has been widely cited.",
        after: "This methodology has been independently replicated by research groups in Germany, South Korea, and Brazil, and was cited in [Government Agency]\u2019s 2023 national water safety guidelines as a recommended detection standard.",
        changed: "Journal prestige removed. Geographic reach, independent replication, and policy uptake substituted as evidence of influence."
      }
    ];

    const DIAGNOSTIC_HELPERS = {
      contribution: {
        label: "Contribution stated clearly",
        prompts: [
          "What problem existed before your work?",
          "Complete: My work was the first to _____ which enabled _____.",
          "What would be missing from the field without this?"
        ]
      },
      role: {
        label: "Your specific role is explicit",
        prompts: [
          "Replace every \u2018we\u2019 with \u2018I\u2019 or \u2018I led a team that\u2026\u2019",
          "What decisions did YOU make? What methods did YOU develop?",
          "What percentage of analysis, writing, or design was yours?"
        ]
      },
      impact: {
        label: "Impact described (who/what changed)",
        prompts: [
          "Who uses this now? (researchers / clinicians / policymakers / industry)",
          "What changed in practice, policy, or understanding?"
        ]
      },
      evidence: {
        label: "Evidence provided (qual + quant)",
        prompts: [
          "Cited by # studies in [specific application]",
          "[Organization] adopted this method for\u2026",
          "Led to # follow-up collaborations, grants, patents, or invitations"
        ]
      }
    };

    const SELF_CHECK_ITEMS = [
      "I used \u201cI\u201d rather than \u201cwe\u201d throughout",
      "Each contribution states a clear, specific outcome",
      "I included at least one form of evidence per contribution",
      "My personal statement links past work to future direction",
      "I have noted where my draft still needs strengthening"
    ];

    const PS_SENTENCES = [
      { prefix: "I am a ", key: "role", placeholder: "role / discipline", suffix: " at " },
      { prefix: "", key: "institution", placeholder: "institution", suffix: "." },
      { prefix: "My research focuses on ", key: "focus", placeholder: "core theme or question", suffix: ", with particular attention to " },
      { prefix: "", key: "emphasis", placeholder: "key emphasis", suffix: "." },
      { prefix: "Over the course of my research journey, I have ", key: "retrospective", placeholder: "retrospective claim — what has been accomplished", suffix: "." },
      { prefix: "Looking ahead, I am working toward ", key: "prospective", placeholder: "prospective claim — next direction or ambition", suffix: "." }
    ];

    const FUNDER_NOTES = {
      tcv: "For the TCV, your personal statement should emphasize your fit for this specific opportunity \u2014 your expertise relative to the proposed project. Must be self-contained (no hyperlinks except audio/visual creations).",
      "cv-frq": "For the CV-FRQ, your personal statement (\u201cParcours et comp\u00e9tences\u201d) should emphasize your fit to the program\u2019s objectives and how your work complements the team or proposal. Hyperlinks are permitted.",
      "": "TCV: emphasizes fit for the specific opportunity; must be self-contained (no hyperlinks). CV-FRQ: emphasizes fit to the program\u2019s objectives and how your work complements the team; hyperlinks are permitted."
    };

    // ── State ──────────────────────────────────────────────────────────────
    const defaultState = () => ({
      funder: "",
      stageIndex: 0,
      round2Active: false,
      contributions: [],
      mentorship: [],
      ps: { role: "", institution: "", focus: "", emphasis: "", retrospective: "", prospective: "" },
      selfCheck: {},
      downloaded: false
    });

    let ns = defaultState();
    try {
      const raw = localStorage.getItem(NARRATIVE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved && typeof saved === "object") {
          ns = Object.assign(defaultState(), saved);
        }
      }
    } catch (_) {}

    const saveNarrative = () => {
      try { localStorage.setItem(NARRATIVE_KEY, JSON.stringify(ns)); } catch (_) {}
    };

    // ── Shell ──────────────────────────────────────────────────────────────
    const section = el("section", "page page-narrative");
    section.dataset.page = "tools-narrative";

    const container = el("div", "container");
    const shell = el("div", "narrative-module-shell");

    // Progress panel
    const progressPanel = el("aside", "narrative-progress-panel");
    const progressTitle = el("h2", null, "Build Your Narrative CV");
    progressPanel.appendChild(progressTitle);

    const STAGE_LABELS = [
      "Orientation",
      "Contributions",
      "Supervisory & Mentorship",
      "Personal Statement",
      "Review & Download"
    ];

    const stageList = el("ul", "narrative-stage-list");
    const stageItems = STAGE_LABELS.map((label, i) => {
      const li = el("li", "narrative-stage-item", "");
      const dot = el("span", "narrative-stage-dot");
      const labelEl = el("span", null, `${i + 1}. ${label}`);
      li.appendChild(dot);
      li.appendChild(labelEl);
      li.addEventListener("click", () => { ns.stageIndex = i; renderStage(); });
      stageList.appendChild(li);
      return li;
    });
    progressPanel.appendChild(stageList);

    const draftBtn = el("button", "narrative-draft-btn", "View my draft so far");
    draftBtn.type = "button";
    progressPanel.appendChild(draftBtn);

    shell.appendChild(progressPanel);

    // Main content area
    const contentArea = el("div", "narrative-stage-content");
    shell.appendChild(contentArea);

    // Session banner (persistent)
    const sessionBanner = el("div", "narrative-session-banner", "\uD83D\uDCBE Your draft is saved in this browser. Download before closing.");

    container.appendChild(sessionBanner);
    container.appendChild(shell);
    section.appendChild(container);

    // Slide-out draft drawer
    const drawer = el("div", "narrative-draft-drawer");
    const drawerClose = el("button", "narrative-draft-drawer-close", "\u00d7");
    drawerClose.setAttribute("aria-label", "Close draft panel");
    drawerClose.addEventListener("click", () => drawer.classList.remove("is-open"));
    const drawerTitle = el("h3", null, "Your draft so far");
    drawer.appendChild(drawerClose);
    drawer.appendChild(drawerTitle);
    const drawerContent = el("div", "narrative-draft-content");
    drawer.appendChild(drawerContent);
    section.appendChild(drawer);

    draftBtn.addEventListener("click", () => {
      refreshDrawer();
      drawer.classList.add("is-open");
    });

    const refreshDrawer = () => {
      clear(drawerContent);
      const addSection = (heading, text) => {
        drawerContent.appendChild(el("h4", "narrative-drawer-heading", heading));
        drawerContent.appendChild(el("p", "narrative-drawer-text", text || "\u2014"));
      };

      if (ns.contributions.length) {
        drawerContent.appendChild(el("h4", "narrative-drawer-heading", "Most Significant Contributions"));
        ns.contributions.forEach((c, i) => {
          drawerContent.appendChild(el("p", "narrative-drawer-subheading", `Contribution ${i + 1}`));
          if (c.what) drawerContent.appendChild(el("p", "narrative-drawer-text", c.what));
        });
      }
      if (ns.mentorship.length) {
        drawerContent.appendChild(el("h4", "narrative-drawer-heading", "Supervisory & Mentorship"));
        ns.mentorship.forEach((m, i) => {
          drawerContent.appendChild(el("p", "narrative-drawer-subheading", `Group ${i + 1}`));
          if (m.activity) drawerContent.appendChild(el("p", "narrative-drawer-text", m.activity));
        });
      }
      const psText = [ns.ps.role && `I am a ${ns.ps.role}`, ns.ps.focus && `My research focuses on ${ns.ps.focus}`].filter(Boolean).join(". ");
      addSection("Personal Statement", psText || null);
    };

    // ── Update progress panel ──────────────────────────────────────────────
    const updateProgress = () => {
      stageItems.forEach((li, i) => {
        li.classList.toggle("is-active", i === ns.stageIndex);
        const done = (i === 0 && ns.funder !== "")
          || (i === 1 && ns.contributions.length > 0)
          || (i === 2 && ns.mentorship.length > 0)
          || (i === 3 && (ns.ps.role || ns.ps.focus || ns.ps.retrospective))
          || (i === 4 && ns.downloaded);
        li.classList.toggle("is-done", done && i !== ns.stageIndex);
      });
    };

    // ── Nav buttons helper ─────────────────────────────────────────────────
    const makeNav = (showBack, nextLabel, onNext) => {
      const nav = el("div", "narrative-nav");
      if (showBack) {
        const back = el("button", "btn", "\u2190 Back");
        back.type = "button";
        back.addEventListener("click", () => { ns.stageIndex = Math.max(0, ns.stageIndex - 1); renderStage(); });
        nav.appendChild(back);
      } else {
        nav.appendChild(el("span")); // placeholder for flex spacing
      }
      const next = el("button", "btn btn-primary", nextLabel);
      next.type = "button";
      next.addEventListener("click", onNext);
      nav.appendChild(next);
      return nav;
    };

    // ── Stage renderers ────────────────────────────────────────────────────

    const renderStage1 = () => {
      const wrap = el("div", "");
      const hdr = el("div", "narrative-stage-header");
      hdr.appendChild(el("h2", null, "1. Orientation: What You\u2019re Building"));
      wrap.appendChild(hdr);

      const intro = el("div", "narrative-intro-text");
      [
        "A Narrative CV tells the story of your research \u2014 not just what you published, but what changed because of your work, and what you made possible for others.",
        "This module walks you through the three sections of the Tri-agency CV (TCV) one at a time. You will write an imperfect first draft, then strengthen it. By the end, you will have a working outline you can take into a consultation or continue refining on your own.",
        "There is no right order. Most researchers find it easier to start with their contributions, then mentorship, then write the personal statement last \u2014 when the story is clearer."
      ].forEach((text) => intro.appendChild(el("p", "card-text", text)));
      const ncvLearnLink = el("p", "narrative-ncv-learn-link");
      const ncvA = el("a", null, "Want to know more about what a Narrative CV is? Read the overview \u2192");
      ncvA.href = "#learn-module-ncv";
      ncvA.addEventListener("click", (e) => { e.preventDefault(); navigateTo("learn-module-ncv"); });
      ncvLearnLink.appendChild(ncvA);
      intro.appendChild(ncvLearnLink);
      wrap.appendChild(intro);

      // Funder toggle
      const funderLabel = el("p", "narrative-toggle-label", "Which funder are you writing for?");
      wrap.appendChild(funderLabel);
      const funderToggle = el("div", "narrative-funder-toggle");
      [{ val: "tcv", label: "TCV" }, { val: "cv-frq", label: "CV-FRQ" }, { val: "", label: "Not sure yet" }].forEach(({ val, label }) => {
        const btn = el("button", "narrative-toggle-btn", label);
        btn.type = "button";
        if (ns.funder === val) btn.classList.add("is-active");
        btn.addEventListener("click", () => {
          ns.funder = val;
          saveNarrative();
          funderToggle.querySelectorAll(".narrative-toggle-btn").forEach((b) => b.classList.remove("is-active"));
          btn.classList.add("is-active");
          funderNote.textContent = FUNDER_NOTES[val] || FUNDER_NOTES[""];
          funderNote.classList.remove("is-hidden");
        });
        funderToggle.appendChild(btn);
      });
      wrap.appendChild(funderToggle);

      const funderNote = el("p", "narrative-funder-note");
      funderNote.textContent = ns.funder !== "" ? FUNDER_NOTES[ns.funder] : "";
      if (!ns.funder) funderNote.classList.add("is-hidden");
      wrap.appendChild(funderNote);

      // Legend: what you'll build + time ranges + auto-save note
      const legend = el("div", "narrative-legend");
      legend.appendChild(el("h3", "narrative-legend-title", "What you\u2019ll build, and how long each section takes"));
      const legendList = el("ul", "narrative-legend-list");
      [
        { name: "Contributions", time: "~30\u201345 min", desc: "Up to 10 bundles of your most significant work, in two rounds" },
        { name: "Supervisory & Mentorship", time: "~10\u201320 min", desc: "Training, supervision, and inclusive practices" },
        { name: "Personal Statement", time: "~15\u201330 min", desc: "Easier to write once your contributions are drafted" },
        { name: "Review & Download", time: "~5\u201310 min", desc: "Self-check, then export your draft" }
      ].forEach(({ name, time, desc }) => {
        const li = el("li", "narrative-legend-item");
        li.appendChild(el("span", "narrative-legend-name", name));
        li.appendChild(el("span", "narrative-legend-time", time));
        li.appendChild(el("span", "narrative-legend-desc", desc));
        legendList.appendChild(li);
      });
      legend.appendChild(legendList);
      legend.appendChild(el("p", "narrative-legend-note", "A first draft usually takes a couple of focused sessions. Your work saves automatically in this browser \u2014 start anywhere, come back anytime."));
      wrap.appendChild(legend);

      wrap.appendChild(makeNav(false, "Start with my contributions \u2192", () => {
        ns.stageIndex = 1;
        ns.round2Active = false;
        renderStage();
      }));
      return wrap;
    };

    const renderStage2 = () => {
      const wrap = el("div", "");
      const hdr = el("div", "narrative-stage-header");
      hdr.appendChild(el("h2", null, "2. Most Significant Contributions"));
      wrap.appendChild(hdr);

      if (!ns.round2Active) {
        // Round 1
        const roundBadge = el("div", "narrative-round-badge", "Round 1: Draft Your Contributions");
        wrap.appendChild(roundBadge);

        [
          "Which research contributions provide the most holistic picture of your work, as it relates to this opportunity?",
          "Select up to 10 contributions \u2014 but aim for 3 to 5 \u201cbundles\u201d of connected outputs. Think across your whole research journey, not just your most recent work."
        ].forEach((t) => wrap.appendChild(el("p", "card-text", t)));

        const cardsContainer = el("div", "contribution-cards-container");

        const addContributionCard = (idx) => {
          const card = el("div", "contribution-card");
          const header = el("div", "contribution-card-header");
          header.appendChild(el("span", null, `Contribution ${idx + 1}`));
          const removeBtn = el("button", "btn-icon", "\u00d7");
          removeBtn.type = "button";
          removeBtn.setAttribute("aria-label", `Remove contribution ${idx + 1}`);
          removeBtn.addEventListener("click", () => {
            ns.contributions.splice(idx, 1);
            saveNarrative();
            refreshCardsContainer();
          });
          header.appendChild(removeBtn);
          card.appendChild(header);

          const c = ns.contributions[idx];
          [
            { key: "what", label: "What did you do?", placeholder: "Describe the contribution in 2\u20133 sentences." },
            { key: "role", label: "What was your specific role?", placeholder: "I led\u2026 / I developed\u2026 / I was responsible for\u2026" },
            { key: "who", label: "Who benefited, and how?", placeholder: "Describe outcomes, audiences, or change created." },
            { key: "evidence", label: "What evidence supports this?", placeholder: "Citations, uptake, partnerships, policy references\u2026" }
          ].forEach(({ key, label, placeholder }) => {
            const field = el("div", "contribution-field");
            const taId = `contrib-${idx}-${key}`;
            const lbl = el("label", null, label);
            lbl.setAttribute("for", taId);
            field.appendChild(lbl);
            const ta = el("textarea", null);
            ta.id = taId;
            ta.className = "contribution-textarea";
            ta.placeholder = placeholder;
            ta.value = c[key] || "";
            ta.rows = 3;
            ta.addEventListener("input", (e) => { c[key] = e.target.value; saveNarrative(); });
            field.appendChild(ta);
            card.appendChild(field);
          });

          return card;
        };

        const refreshCardsContainer = () => {
          clear(cardsContainer);
          ns.contributions.forEach((_, i) => cardsContainer.appendChild(addContributionCard(i)));
          countEl.textContent = `${ns.contributions.length} of 10 contributions added`;
        };

        wrap.appendChild(cardsContainer);

        const countEl = el("p", "contribution-count", `${ns.contributions.length} of 10 contributions added`);
        wrap.appendChild(countEl);

        refreshCardsContainer();

        const addBtn = el("button", "add-contribution-btn", "+ Add a contribution");
        addBtn.type = "button";
        addBtn.addEventListener("click", () => {
          if (ns.contributions.length >= 10) return;
          ns.contributions.push({ what: "", role: "", who: "", evidence: "" });
          saveNarrative();
          refreshCardsContainer();
        });
        wrap.appendChild(addBtn);

        // Collapsible tip
        const tipDetails = el("details", "narrative-tip");
        const tipSummary = el("summary", null, "Not sure what counts as a contribution?");
        tipDetails.appendChild(tipSummary);
        tipDetails.appendChild(el("p", "narrative-tip-body", "Think beyond publications: datasets, policy briefs, partnerships, community collaborations, creative works, training you delivered, methods you developed, or grants you led."));
        wrap.appendChild(tipDetails);

        wrap.appendChild(makeNav(true, "Strengthen my contributions \u2192", () => {
          ns.round2Active = true;
          saveNarrative();
          renderStage();
        }));

      } else {
        // Round 2
        const roundBadge = el("div", "narrative-round-badge is-round2", "Round 2: Strengthen Your Contributions");
        wrap.appendChild(roundBadge);

        // Before/After example tabs (reuse explore-tab CSS)
        const exTabBar = el("div", "explore-tabs narrative-ex-tabs");
        const exContents = [];
        BEFORE_AFTER.forEach((ex, i) => {
          const tab = el("button", "explore-tab", ex.label);
          tab.type = "button";
          if (i === 0) tab.classList.add("is-active");
          exTabBar.appendChild(tab);

          const tabContent = el("div", "explore-tab-content");
          if (i === 0) tabContent.classList.add("is-active");
          const grid = el("div", "before-after-grid");
          const beforeCol = el("div", "before-after-col");
          beforeCol.appendChild(el("div", "before-after-label", "Before"));
          beforeCol.appendChild(el("p", "before-after-text", ex.before));
          const afterCol = el("div", "before-after-col is-after");
          afterCol.appendChild(el("div", "before-after-label", "After"));
          afterCol.appendChild(el("p", "before-after-text", ex.after));
          grid.appendChild(beforeCol);
          grid.appendChild(afterCol);
          tabContent.appendChild(grid);
          tabContent.appendChild(el("p", "before-after-changed", `What changed: ${ex.changed}`));
          exContents.push(tabContent);
        });

        exTabBar.querySelectorAll(".explore-tab") && (() => {})();
        const exTabs = Array.from(exTabBar.querySelectorAll(".explore-tab"));
        exTabs.forEach((tab, i) => {
          tab.addEventListener("click", () => {
            exTabs.forEach((t, j) => {
              t.classList.toggle("is-active", t === tab);
              exContents[j].classList.toggle("is-active", t === tab);
            });
          });
        });

        const exWrap = el("div", "narrative-examples-wrap");
        exWrap.appendChild(exTabBar);
        exContents.forEach((c) => exWrap.appendChild(c));
        wrap.appendChild(exWrap);

        // Diagnostic cards
        if (ns.contributions.length === 0) {
          wrap.appendChild(el("p", "empty-state", "No contributions added yet. Go back to Round 1 to add contributions."));
        } else {
          ns.contributions.forEach((c, idx) => {
            const card = el("div", "contribution-card");
            card.appendChild(el("div", "contribution-card-header", `Contribution ${idx + 1}: ${c.what ? c.what.substring(0, 60) + (c.what.length > 60 ? "\u2026" : "") : "(empty)"}`));

            const diag = el("div", "diagnostic-panel");
            Object.entries(DIAGNOSTIC_HELPERS).forEach(([dKey, dInfo]) => {
              const key = `d_${idx}_${dKey}`;
              const status = c.diagnostic && c.diagnostic[dKey] ? c.diagnostic[dKey] : "?";

              const row = el("div", "diagnostic-row");
              row.appendChild(el("span", "diagnostic-label", dInfo.label));

              const toggleGroup = el("div", "diagnostic-toggle");
              [{ val: "check", symbol: "\u2713" }, { val: "cross", symbol: "\u2717" }, { val: "?", symbol: "?" }].forEach(({ val, symbol }) => {
                const btn = el("button", null, symbol);
                btn.type = "button";
                if (status === val) btn.className = `is-active-${val === "check" ? "check" : val === "cross" ? "cross" : "q"}`;
                btn.addEventListener("click", () => {
                  if (!c.diagnostic) c.diagnostic = {};
                  c.diagnostic[dKey] = val;
                  saveNarrative();
                  // show/hide helper
                  const helperEl = row.parentElement.querySelector(`.diagnostic-helper[data-key="${dKey}"]`);
                  if (helperEl) helperEl.classList.toggle("is-hidden", val !== "cross");
                  toggleGroup.querySelectorAll("button").forEach((b) => b.className = "");
                  btn.className = `is-active-${val === "check" ? "check" : val === "cross" ? "cross" : "q"}`;
                });
                toggleGroup.appendChild(btn);
              });
              row.appendChild(toggleGroup);
              diag.appendChild(row);

              // Helper expands when ✗
              const helper = el("div", "diagnostic-helper");
              helper.dataset.key = dKey;
              helper.classList.toggle("is-hidden", status !== "cross");
              const helperList = el("ul", null);
              dInfo.prompts.forEach((p) => helperList.appendChild(el("li", null, p)));
              helper.appendChild(helperList);
              diag.appendChild(helper);
            });
            card.appendChild(diag);
            wrap.appendChild(card);
          });
        }

        // Pro tip banner
        const proTip = el("div", "pro-tip-banner", "Research shows reviewers score higher when they see ownership, affirmative language, and clarity. Use \u201cI\u201d rather than \u201cwe.\u201d Avoid passive voice, negation, and hedging words such as \u201ccould,\u201d \u201cshould,\u201d or \u201cwould.\u201d");
        wrap.appendChild(proTip);

        wrap.appendChild(makeNav(true, "Continue to Mentorship \u2192", () => {
          ns.stageIndex = 2;
          ns.round2Active = false;
          saveNarrative();
          renderStage();
        }));
      }

      return wrap;
    };

    const renderStage3 = () => {
      const wrap = el("div", "");
      const hdr = el("div", "narrative-stage-header");
      hdr.appendChild(el("h2", null, "3. Supervisory & Mentorship Activities"));
      wrap.appendChild(hdr);

      [
        "This section is about what you made possible for others \u2014 students, trainees, early-career researchers, and collaborators.",
        "You don\u2019t need a long list. A few well-described examples that show growth, outcomes, and your specific role are more powerful than an exhaustive inventory."
      ].forEach((t) => wrap.appendChild(el("p", "card-text", t)));

      wrap.appendChild(el("p", "card-text", "Consider organizing your mentorship activities into clusters \u2014 for example: graduate supervision, postdoctoral mentoring, peer mentoring, or informal support for early-career faculty."));

      const cardsContainer = el("div", "contribution-cards-container");

      const addMentorCard = (idx) => {
        const card = el("div", "contribution-card");
        const header = el("div", "contribution-card-header");
        header.appendChild(el("span", null, `Mentorship Group ${idx + 1}`));
        const removeBtn = el("button", "btn-icon", "\u00d7");
        removeBtn.type = "button";
        removeBtn.addEventListener("click", () => {
          ns.mentorship.splice(idx, 1);
          saveNarrative();
          refreshMentorCards();
        });
        header.appendChild(removeBtn);
        card.appendChild(header);

        const m = ns.mentorship[idx];
        [
          { key: "activity", label: "What did you do, and for whom?", placeholder: "Describe your role and the mentorship activities." },
          { key: "outcomes", label: "What were the outcomes for those people?", placeholder: "Skills, careers, awards, publications, positions\u2026" }
        ].forEach(({ key, label, placeholder }) => {
          const field = el("div", "contribution-field");
          const taId = `mentor-${idx}-${key}`;
          const mentorLbl = el("label", null, label);
          mentorLbl.setAttribute("for", taId);
          field.appendChild(mentorLbl);
          const ta = el("textarea", null);
          ta.id = taId;
          ta.className = "contribution-textarea";
          ta.placeholder = placeholder;
          ta.value = m[key] || "";
          ta.rows = 3;
          ta.addEventListener("input", (e) => { m[key] = e.target.value; saveNarrative(); });
          field.appendChild(ta);
          card.appendChild(field);
        });
        return card;
      };

      const refreshMentorCards = () => {
        clear(cardsContainer);
        ns.mentorship.forEach((_, i) => cardsContainer.appendChild(addMentorCard(i)));
      };

      wrap.appendChild(cardsContainer);
      refreshMentorCards();

      const addBtn = el("button", "add-contribution-btn", "+ Add mentorship group");
      addBtn.type = "button";
      addBtn.addEventListener("click", () => {
        ns.mentorship.push({ activity: "", outcomes: "" });
        saveNarrative();
        refreshMentorCards();
      });
      wrap.appendChild(addBtn);

      const tipDetails = el("details", "narrative-tip");
      tipDetails.appendChild(el("summary", null, "What evidence should I include?"));
      tipDetails.appendChild(el("p", "narrative-tip-body", "Include evidence where you can: Where are former trainees now? Did they receive awards or fellowships? Did they go on to independent research or careers in practice? A brief note of acknowledgement or a career outcome is enough."));
      wrap.appendChild(tipDetails);

      const earlyCareerNote = el("div", "narrative-funder-note");
      earlyCareerNote.appendChild(el("strong", null, "Early career? "));
      earlyCareerNote.appendChild(document.createTextNode("If you are early in your career, or your discipline does not include graduate supervision, describe any informal mentoring, peer support, training workshops you delivered, or inclusive practices in your lab or research environment. Context matters here."));
      wrap.appendChild(earlyCareerNote);

      wrap.appendChild(makeNav(true, "Continue to Personal Statement \u2192", () => {
        ns.stageIndex = 3;
        saveNarrative();
        renderStage();
      }));

      return wrap;
    };

    const renderStage4 = () => {
      const wrap = el("div", "");
      const hdr = el("div", "narrative-stage-header");
      hdr.appendChild(el("h2", null, "4. Personal Statement"));
      wrap.appendChild(hdr);

      [
        "The personal statement is written last, even though it appears first in the submitted document. It works best when the rest of the story is already on the page.",
        "This is your \u201cwhy\u201d \u2014 the thread that connects your contributions, your approach, and where your research is headed. It is retrospective (what you have done) and prospective (what you are building toward)."
      ].forEach((t) => wrap.appendChild(el("p", "card-text", t)));

      wrap.appendChild(el("p", "card-text impact-helper-title", "A strong personal statement covers four things:"));
      const fourThings = el("ol", "simple-list");
      [
        "Your research identity \u2014 who you are as a researcher, and what drives your work",
        "The big themes and directions in your research",
        "What your work has contributed to society and to your field",
        "Any recognitions, awards, or forms of community acknowledgement"
      ].forEach((t) => fourThings.appendChild(el("li", null, t)));
      wrap.appendChild(fourThings);

      // Scaffold
      wrap.appendChild(el("p", "narrative-toggle-label", "Fill in your statement:"));
      const scaffold = el("div", "ps-scaffold");
      const previewArea = el("p", "ps-preview-text");

      const rebuildPreview = () => {
        const p = ns.ps;
        previewArea.textContent = [
          `I am a ${p.role || "[role/discipline]"} at ${p.institution || "[institution]"}.`,
          `My research focuses on ${p.focus || "[core theme]"}, with particular attention to ${p.emphasis || "[key emphasis]"}.`,
          `Over the course of my research journey, I have ${p.retrospective || "[retrospective claim]"}.`,
          `Looking ahead, I am working toward ${p.prospective || "[prospective claim]"}.`
        ].join(" ");
      };

      // Row 1: "I am a ___ at ___."
      const row1 = el("div", "ps-sentence");
      row1.appendChild(el("span", "ps-literal", "I am a"));
      const roleInput = el("input", "ps-input");
      roleInput.setAttribute("aria-label", "Your role or discipline");
      roleInput.placeholder = "role / discipline";
      roleInput.value = ns.ps.role || "";
      roleInput.addEventListener("input", (e) => { ns.ps.role = e.target.value; saveNarrative(); rebuildPreview(); });
      row1.appendChild(roleInput);
      row1.appendChild(el("span", "ps-literal", "at"));
      const instInput = el("input", "ps-input");
      instInput.setAttribute("aria-label", "Your institution");
      instInput.placeholder = "institution";
      instInput.value = ns.ps.institution || "";
      instInput.addEventListener("input", (e) => { ns.ps.institution = e.target.value; saveNarrative(); rebuildPreview(); });
      row1.appendChild(instInput);
      row1.appendChild(el("span", "ps-literal", "."));
      scaffold.appendChild(row1);

      // Row 2: "My research focuses on ___ with attention to ___."
      const row2 = el("div", "ps-sentence");
      row2.appendChild(el("span", "ps-literal", "My research focuses on"));
      const focusInput = el("input", "ps-input ps-input--wide");
      focusInput.setAttribute("aria-label", "Core research theme or question");
      focusInput.placeholder = "core theme or question";
      focusInput.value = ns.ps.focus || "";
      focusInput.addEventListener("input", (e) => { ns.ps.focus = e.target.value; saveNarrative(); rebuildPreview(); });
      row2.appendChild(focusInput);
      row2.appendChild(el("span", "ps-literal", "with particular attention to"));
      const emphInput = el("input", "ps-input ps-input--wide");
      emphInput.setAttribute("aria-label", "Key emphasis of your research");
      emphInput.placeholder = "key emphasis";
      emphInput.value = ns.ps.emphasis || "";
      emphInput.addEventListener("input", (e) => { ns.ps.emphasis = e.target.value; saveNarrative(); rebuildPreview(); });
      row2.appendChild(emphInput);
      row2.appendChild(el("span", "ps-literal", "."));
      scaffold.appendChild(row2);

      // Row 3: retrospective
      const row3 = el("div", "ps-sentence");
      row3.appendChild(el("span", "ps-literal", "Over the course of my research journey, I have"));
      const retroInput = el("input", "ps-input ps-input--wide");
      retroInput.setAttribute("aria-label", "Retrospective claim about your research journey");
      retroInput.placeholder = "retrospective claim";
      retroInput.value = ns.ps.retrospective || "";
      retroInput.addEventListener("input", (e) => { ns.ps.retrospective = e.target.value; saveNarrative(); rebuildPreview(); });
      row3.appendChild(retroInput);
      row3.appendChild(el("span", "ps-literal", "."));
      scaffold.appendChild(row3);

      // Row 4: prospective
      const row4 = el("div", "ps-sentence");
      row4.appendChild(el("span", "ps-literal", "Looking ahead, I am working toward"));
      const prospInput = el("input", "ps-input ps-input--wide");
      prospInput.setAttribute("aria-label", "Prospective claim about future research goals");
      prospInput.placeholder = "prospective claim";
      prospInput.value = ns.ps.prospective || "";
      prospInput.addEventListener("input", (e) => { ns.ps.prospective = e.target.value; saveNarrative(); rebuildPreview(); });
      row4.appendChild(prospInput);
      row4.appendChild(el("span", "ps-literal", "."));
      scaffold.appendChild(row4);

      wrap.appendChild(scaffold);

      // Live preview
      const previewBox = el("div", "ps-preview");
      previewBox.appendChild(el("div", "ps-preview-label", "Preview"));
      previewBox.appendChild(previewArea);
      wrap.appendChild(previewBox);
      rebuildPreview();

      // Funder note
      if (ns.funder || true) {
        const funderNote = el("div", "narrative-funder-note");
        funderNote.textContent = FUNDER_NOTES[ns.funder] || FUNDER_NOTES[""];
        wrap.appendChild(funderNote);
      }

      // Collapsible example
      const exDetails = el("details", "narrative-tip");
      exDetails.appendChild(el("summary", null, "See a personal statement example"));
      const exText = el("p", "narrative-tip-body");
      exText.textContent = "Example: \u201cI am a computational neuroscientist at [University]. My research focuses on sensory processing in the aging brain, with particular attention to how noise in neural signals contributes to cognitive decline. Over the course of my research journey, I have developed three validated methods for measuring signal degradation that are now used in clinical trials at four institutions. Looking ahead, I am working toward a unified framework that connects cellular-level findings to population-scale hearing loss interventions.\u201d";
      exDetails.appendChild(exText);
      wrap.appendChild(exDetails);

      wrap.appendChild(makeNav(true, "Continue to Review & Download \u2192", () => {
        ns.stageIndex = 4;
        saveNarrative();
        renderStage();
      }));

      return wrap;
    };

    const renderStage5 = () => {
      const wrap = el("div", "");
      const hdr = el("div", "narrative-stage-header");
      hdr.appendChild(el("h2", null, "5. Review & Download"));
      wrap.appendChild(hdr);

      // Completeness indicators
      const completeness = el("div", "narrative-completeness");
      const hasPS = !!(ns.ps.role || ns.ps.focus || ns.ps.retrospective || ns.ps.prospective);
      [
        { label: "Most Significant Contributions", count: ns.contributions.length, unit: "contributions drafted" },
        { label: "Supervisory & Mentorship", count: ns.mentorship.length, unit: "groups described" },
        { label: "Personal Statement", count: hasPS ? 1 : 0, unit: "draft complete" }
      ].forEach(({ label, count, unit }) => {
        const row = el("div", "completeness-row");
        row.appendChild(el("span", "completeness-label", label));
        const status = el("span", count > 0 ? "completeness-status is-done" : "completeness-status is-empty",
          count > 0 ? (label === "Personal Statement" ? "\u2713 Draft in progress" : `\u2713 ${count} ${unit}`) : "\u25cb Not started");
        row.appendChild(status);
        completeness.appendChild(row);
      });
      wrap.appendChild(completeness);

      // Self-check
      const selfCheck = el("div", "narrative-selfcheck");
      selfCheck.appendChild(el("h3", null, "Final self-check"));
      SELF_CHECK_ITEMS.forEach((item, i) => {
        const lbl = el("label", null);
        const chk = el("input");
        chk.type = "checkbox";
        chk.checked = !!(ns.selfCheck && ns.selfCheck[i]);
        chk.addEventListener("change", (e) => {
          if (!ns.selfCheck) ns.selfCheck = {};
          ns.selfCheck[i] = e.target.checked;
          saveNarrative();
        });
        lbl.appendChild(chk);
        lbl.appendChild(el("span", null, ` ${item}`));
        selfCheck.appendChild(lbl);
      });
      wrap.appendChild(selfCheck);

      // Build export text
      const buildExportText = () => {
        const lines = ["MY NARRATIVE CV DRAFT OUTLINE", "Generated by Pathways to Impact", ""];
        lines.push("=== MOST SIGNIFICANT CONTRIBUTIONS ===", "");
        if (ns.contributions.length) {
          ns.contributions.forEach((c, i) => {
            lines.push(`Contribution ${i + 1}:`);
            if (c.what) lines.push(`What: ${c.what}`);
            if (c.role) lines.push(`Role: ${c.role}`);
            if (c.who) lines.push(`Who benefited: ${c.who}`);
            if (c.evidence) lines.push(`Evidence: ${c.evidence}`);
            lines.push("");
          });
        } else {
          lines.push("(None added)", "");
        }
        lines.push("=== SUPERVISORY & MENTORSHIP ===", "");
        if (ns.mentorship.length) {
          ns.mentorship.forEach((m, i) => {
            lines.push(`Mentorship Group ${i + 1}:`);
            if (m.activity) lines.push(`Activities: ${m.activity}`);
            if (m.outcomes) lines.push(`Outcomes: ${m.outcomes}`);
            lines.push("");
          });
        } else {
          lines.push("(None added)", "");
        }
        lines.push("=== PERSONAL STATEMENT ===", "");
        const p = ns.ps;
        lines.push([
          `I am a ${p.role || "[role/discipline]"} at ${p.institution || "[institution]"}.`,
          `My research focuses on ${p.focus || "[core theme]"}, with particular attention to ${p.emphasis || "[key emphasis]"}.`,
          `Over the course of my research journey, I have ${p.retrospective || "[retrospective claim]"}.`,
          `Looking ahead, I am working toward ${p.prospective || "[prospective claim]"}.`
        ].join(" "));
        return lines.join("\n");
      };

      // Download / Copy buttons
      const actions = el("div", "narrative-actions");
      const dlBtn = el("button", "btn btn-primary", "Download my outline (.txt)");
      dlBtn.type = "button";
      dlBtn.addEventListener("click", () => {
        const blob = new Blob([buildExportText()], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "narrative-cv-outline.txt";
        a.click();
        URL.revokeObjectURL(url);
        ns.downloaded = true;
        saveNarrative();
      });
      actions.appendChild(dlBtn);

      const copyBtn = el("button", "btn", "Copy to clipboard");
      copyBtn.type = "button";
      copyBtn.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(buildExportText());
          copyBtn.textContent = "Copied!";
          window.setTimeout(() => { copyBtn.textContent = "Copy to clipboard"; }, 1800);
        } catch (_) {
          copyBtn.textContent = "Copy unavailable";
          window.setTimeout(() => { copyBtn.textContent = "Copy to clipboard"; }, 1800);
        }
      });
      actions.appendChild(copyBtn);

      const resetBtn = el("button", "btn btn-ghost", "Start over");
      resetBtn.type = "button";
      resetBtn.addEventListener("click", () => {
        if (!window.confirm("This will clear all your draft content. Are you sure?")) return;
        try { localStorage.removeItem(NARRATIVE_KEY); } catch (_) {}
        ns = defaultState();
        renderStage();
      });
      actions.appendChild(resetBtn);
      wrap.appendChild(actions);

      // Next steps cards
      wrap.appendChild(el("h3", null, "Next steps"));
      const nextSteps = el("div", "narrative-next-steps");
      [
        {
          title: "Book a consultation",
          body: "Bring your draft to a research development advisor.",
          cta: "Book \u2192",
          action: () => openBookingModal(null)
        },
        {
          title: "Explore evidence resources",
          body: "Find citation counts, altmetrics, and policy uptake to strengthen your evidence.",
          cta: "Explore \u2192",
          href: "https://researchimpact.ca/resources/researcher-impact-framework/"
        },
        {
          title: "Read the full TCV guide",
          body: "University of Calgary\u2019s comprehensive guide at tcvguide.ca.",
          cta: "Visit \u2192",
          href: "https://tcvguide.ca/"
        }
      ].forEach(({ title, body, cta, action, href }) => {
        const card = el("div", "narrative-next-card");
        card.appendChild(el("h4", null, title));
        card.appendChild(el("p", null, body));
        if (action) {
          const btn = el("button", "btn btn-primary", cta);
          btn.type = "button";
          btn.addEventListener("click", action);
          card.appendChild(btn);
        } else {
          const link = el("a", "btn btn-primary", cta);
          link.href = href;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          card.appendChild(link);
        }
        nextSteps.appendChild(card);
      });
      wrap.appendChild(nextSteps);

      const navEl = el("div", "narrative-nav");
      const backBtn = el("button", "btn", "\u2190 Back");
      backBtn.type = "button";
      backBtn.addEventListener("click", () => { ns.stageIndex = 3; renderStage(); });
      navEl.appendChild(backBtn);
      wrap.appendChild(navEl);

      return wrap;
    };

    // ── Main render ────────────────────────────────────────────────────────
    const renderStage = () => {
      clear(contentArea);
      updateProgress();
      window.scrollTo({ top: 0, behavior: "smooth" });

      let stageEl;
      switch (ns.stageIndex) {
        case 0: stageEl = renderStage1(); break;
        case 1: stageEl = renderStage2(); break;
        case 2: stageEl = renderStage3(); break;
        case 3: stageEl = renderStage4(); break;
        case 4: stageEl = renderStage5(); break;
        default: stageEl = renderStage1();
      }
      contentArea.appendChild(stageEl);
    };

    renderStage();
    return section;
  };

  const buildAbout = () => {
    const section = el("section", "page page-about");
    section.dataset.page = "about";

    const container = el("div", "container");
    container.appendChild(el("h1", null, data.about.title));

    const grid = el("div", "about-grid");
    const aboutSectionById = (data.about.sections || []).reduce((acc, item) => {
      acc[item.id] = item;
      return acc;
    }, {});

    const buildPartnersContent = (item) => {
      const wrap = el("div", "section-accordion__body-content");
      if (item.body) {
        wrap.appendChild(el("p", null, item.body));
      }
      if (item.kind === "partners" && item.groups && item.groups.length) {
        const groupsWrap = el("div", "about-partner-groups");
        item.groups.forEach((group) => {
          const groupBlock = el("section", "about-partner-group");
          groupBlock.appendChild(el("h3", null, group.title));
          const list = el("div", "about-partner-list");
          const accordionItems = [];
          (group.items || []).forEach((entry) => {
            const partnerItem = el("details", "about-partner-item accordion-item");
            const summary = el("summary", "about-partner-summary accordion-summary");
            const summaryName = el("span", "about-partner-name accordion-summary-text");
            const unitNames = (entry.unitIds || [])
              .map((unitId) => unitById[unitId]?.name)
              .filter(Boolean);
            summaryName.textContent = unitNames.join(" & ");
            summary.appendChild(summaryName);

            const tagRow = el("div", "about-partner-tags");
            (entry.unitIds || []).forEach((unitId) => {
              const unit = unitById[unitId];
              if (!unit) return;
              tagRow.appendChild(el("span", "tag unit-short-code", unit.shortCode));
            });
            summary.appendChild(tagRow);
            partnerItem.appendChild(summary);

            const body = el("div", "about-partner-body accordion-body");
            body.appendChild(el("p", "card-text", entry.description));

            const linkRow = el("div", "about-partner-links");
            (entry.unitIds || []).forEach((unitId, index) => {
              const unit = unitById[unitId];
              if (!unit) return;
              if (index > 0) {
                linkRow.appendChild(document.createTextNode(" · "));
              }
              const link = el("a", "about-partner-link", unit.name);
              link.href = unit.url;
              link.target = "_blank";
              link.rel = "noopener noreferrer";
              linkRow.appendChild(link);
            });
            body.appendChild(linkRow);
            partnerItem.appendChild(body);

            partnerItem.addEventListener("toggle", () => {
              if (!partnerItem.open) return;
              accordionItems.forEach((other) => {
                if (other !== partnerItem) {
                  other.open = false;
                }
              });
            });
            accordionItems.push(partnerItem);
            list.appendChild(partnerItem);
          });
          groupBlock.appendChild(list);
          groupsWrap.appendChild(groupBlock);
        });
        wrap.appendChild(groupsWrap);
      }
      if (item.items && item.items.length) {
        const list = el("div", "contact-list");
        item.items.forEach((contact) => {
          const line = el("div", "meta-line");
          line.appendChild(el("span", "meta-label", contact.label));
          line.appendChild(el("span", "meta-value", contact.value));
          list.appendChild(line);
        });
        wrap.appendChild(list);
      }
      return wrap;
    };

    const aboutPathwaysSection = el("div", "about-section");
    aboutPathwaysSection.id = "about-pathways";
    const mergedAboutParagraph = [
      "Pathways to Impact is a Concordia University initiative and coordinated set of consultations, learning resources, and practical tools that support researchers who want to plan, evidence, and communicate impact.",
      "The program guides researchers through the impact lifecycle by helping them select a pathway stage, complete short modules, and connect with tailored opportunities for engagement, evaluation, and knowledge mobilization through a cross-campus team specializing in research development, partnership building, and knowledge mobilization."
    ].join(" ");
    aboutPathwaysSection.appendChild(el("p", null, mergedAboutParagraph));
    const visionCallout = el("div", "about-vision-link-block");
    const visionLink = el("a", "about-vision-link", "Read the Pathways Vision →");
    visionLink.href = "#pathways-vision";
    visionLink.addEventListener("click", (event) => {
      event.preventDefault();
      navigateTo("pathways-vision");
    });
    visionCallout.appendChild(visionLink);
    visionCallout.appendChild(el("p", "card-text", "A deeper look at how Concordia understands and supports research impact across disciplines and contexts."));
    aboutPathwaysSection.appendChild(visionCallout);
    grid.appendChild(aboutPathwaysSection);

    if (aboutSectionById.partners) {
      const partnersSection = el("details", "about-section section-accordion");
      partnersSection.id = "partners";
      const partnersSummary = el("summary", "section-accordion__summary");
      partnersSummary.appendChild(el("span", "section-accordion__title", "Partners across the university"));
      partnersSection.appendChild(partnersSummary);
      const partnersBody = el("div", "section-accordion__body");
      partnersBody.appendChild(buildPartnersContent(aboutSectionById.partners));
      partnersSection.appendChild(partnersBody);
      grid.appendChild(partnersSection);
    }

    if (aboutSectionById.contact) {
      const contactSection = el("div", "about-section about-section--contact");
      contactSection.id = "contact";
      contactSection.appendChild(el("h2", "section-title", aboutSectionById.contact.title || "Contact Us"));
      if (aboutSectionById.contact.body) {
        contactSection.appendChild(el("p", null, aboutSectionById.contact.body));
      }
      if (aboutSectionById.contact.items && aboutSectionById.contact.items.length) {
        const list = el("div", "contact-list");
        aboutSectionById.contact.items.forEach((contact) => {
          const line = el("div", "meta-line");
          line.appendChild(el("span", "meta-label", contact.label));
          line.appendChild(el("span", "meta-value", contact.value));
          list.appendChild(line);
        });
        contactSection.appendChild(list);
      }

      // Triage contact form
      const contactForm = el("form", "contact-form");
      contactForm.id = "contact-form";
      contactForm.noValidate = true;

      contactForm.appendChild(el("h3", "contact-form-heading", "Tell us what you need"));
      contactForm.appendChild(el("p", "contact-form-intro", "Fill out this short form and we\u2019ll connect you with the right person or resource."));

      // Name
      const nameField = el("div", "contact-form-field");
      const nameLabel = el("label", null, "Name");
      nameLabel.setAttribute("for", "contact-name");
      const nameInput = el("input", "contact-form-input");
      nameInput.type = "text";
      nameInput.name = "name";
      nameInput.id = "contact-name";
      nameInput.required = true;
      nameInput.placeholder = "Your full name";
      nameField.appendChild(nameLabel);
      nameField.appendChild(nameInput);
      contactForm.appendChild(nameField);

      // Email
      const emailField = el("div", "contact-form-field");
      const emailLabel = el("label", null, "Best email for follow-up");
      emailLabel.setAttribute("for", "contact-email");
      const emailInput = el("input", "contact-form-input");
      emailInput.type = "email";
      emailInput.name = "email";
      emailInput.id = "contact-email";
      emailInput.required = true;
      emailInput.placeholder = "name@university.ca";
      emailField.appendChild(emailLabel);
      emailField.appendChild(emailInput);
      contactForm.appendChild(emailField);

      // Role
      const roleField = el("div", "contact-form-field");
      const roleLabel = el("label", null, "Your role");
      roleLabel.setAttribute("for", "contact-role");
      const roleSelect = el("select", "contact-form-select");
      roleSelect.name = "role";
      roleSelect.id = "contact-role";
      [
        { value: "", label: "Select your role\u2026" },
        { value: "faculty", label: "Faculty" },
        { value: "postdoc", label: "Postdoctoral researcher" },
        { value: "grad-student", label: "Graduate student" },
        { value: "staff", label: "Research staff" },
        { value: "other", label: "Other" }
      ].forEach((opt) => {
        const o = el("option", null, opt.label);
        o.value = opt.value;
        roleSelect.appendChild(o);
      });
      roleField.appendChild(roleLabel);
      roleField.appendChild(roleSelect);
      contactForm.appendChild(roleField);

      // Department
      const deptField = el("div", "contact-form-field");
      const deptLabel = el("label", null, "Department / Faculty");
      deptLabel.setAttribute("for", "contact-department");
      const deptInput = el("input", "contact-form-input");
      deptInput.type = "text";
      deptInput.name = "department";
      deptInput.id = "contact-department";
      deptInput.placeholder = "e.g. Department of Biology, Faculty of Arts and Science";
      deptField.appendChild(deptLabel);
      deptField.appendChild(deptInput);
      contactForm.appendChild(deptField);

      // Research project description
      const projectField = el("div", "contact-form-field");
      const projectLabel = el("label", null, "Brief description of your research project");
      projectLabel.setAttribute("for", "contact-project");
      const projectInput = el("textarea", "contact-form-textarea");
      projectInput.name = "projectDescription";
      projectInput.id = "contact-project";
      projectInput.rows = 3;
      projectInput.placeholder = "A few sentences about your research \u2014 topic, goals, and where you are in the process.";
      projectField.appendChild(projectLabel);
      projectField.appendChild(projectInput);
      contactForm.appendChild(projectField);

      // Project stage
      const stageField = el("div", "contact-form-field");
      const stageLabel = el("label", null, "Where are you in your project?");
      stageLabel.setAttribute("for", "contact-stage");
      const stageSelect = el("select", "contact-form-select");
      stageSelect.name = "projectStage";
      stageSelect.id = "contact-stage";
      [
        { value: "", label: "Select a stage\u2026" },
        { value: "developing", label: "Developing an Idea" },
        { value: "active", label: "Active Research" },
        { value: "finishing", label: "Finishing a Project" },
        { value: "wrapping", label: "Finishing a Project" },
        { value: "not-sure", label: "Not sure yet" }
      ].forEach((opt) => {
        const o = el("option", null, opt.label);
        o.value = opt.value;
        stageSelect.appendChild(o);
      });
      stageField.appendChild(stageLabel);
      stageField.appendChild(stageSelect);
      contactForm.appendChild(stageField);

      // Pathway of interest
      const pathwayField = el("div", "contact-form-field");
      const pathwayLabel = el("label", null, "Pathway of interest (optional)");
      pathwayLabel.setAttribute("for", "contact-pathway");
      const pathwaySelect = el("select", "contact-form-select");
      pathwaySelect.name = "pathway";
      pathwaySelect.id = "contact-pathway";
      [
        { value: "", label: "Select a pathway\u2026" },
        { value: "academic-scholarship", label: "Academic Scholarship" },
        { value: "community-engagement", label: "Community Engagement" },
        { value: "innovation", label: "Innovation" },
        { value: "commercialization", label: "Commercialization" },
        { value: "policy", label: "Policy" },
        { value: "communications", label: "Communications" },
        { value: "research-creation", label: "Research Creation" },
        { value: "not-sure", label: "Not sure yet" }
      ].forEach((opt) => {
        const o = el("option", null, opt.label);
        o.value = opt.value;
        pathwaySelect.appendChild(o);
      });
      pathwayField.appendChild(pathwayLabel);
      pathwayField.appendChild(pathwaySelect);
      contactForm.appendChild(pathwayField);

      // What do you need help with?
      const needsField = el("div", "contact-form-field");
      const needsLabel = el("label", null, "Tell us what you want to explore");
      needsLabel.setAttribute("for", "contact-needs");
      const needsInput = el("textarea", "contact-form-textarea");
      needsInput.name = "needs";
      needsInput.id = "contact-needs";
      needsInput.rows = 4;
      needsInput.required = true;
      needsInput.placeholder = "Briefly describe what you\u2019re looking for \u2014 a consultation, workshop, resource, or general guidance.";
      needsField.appendChild(needsLabel);
      needsField.appendChild(needsInput);
      contactForm.appendChild(needsField);

      // Actions
      const formActions = el("div", "contact-form-actions");
      const submitBtn = el("button", "btn primary", "Send request");
      submitBtn.type = "submit";
      formActions.appendChild(submitBtn);
      contactForm.appendChild(formActions);

      const followUpNote = el("p", "contact-form-note", "We\u2019ll review your request and follow up within 2 business days.");
      contactForm.appendChild(followUpNote);

      // Confirmation
      const confirmation = el("div", "contact-form-confirmation is-hidden");
      const confirmIcon = el("p", "booking-confirm-icon", "\u2713");
      const confirmTitle = el("h3", "booking-confirm-title", "Request received!");
      const confirmText = el("p", "booking-confirm-text", "");
      confirmation.appendChild(confirmIcon);
      confirmation.appendChild(confirmTitle);
      confirmation.appendChild(confirmText);
      contactForm.appendChild(confirmation);

      // Inline error (for real submission failures \u2014 kept above actions so the
      // user can fix and retry without losing their text).
      const errorBox = el("p", "contact-form-error is-hidden", "");
      errorBox.setAttribute("role", "alert");
      contactForm.insertBefore(errorBox, formActions);

      const showContactConfirmation = (text) => {
        contactForm.querySelectorAll(".contact-form-field, .contact-form-actions, .contact-form-note, .contact-form-heading, .contact-form-intro, .contact-form-error").forEach((el) => el.classList.add("is-hidden"));
        confirmText.textContent = text;
        confirmation.classList.remove("is-hidden");
      };

      contactForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const needs = needsInput.value.trim();
        if (!name || !email || !needs) {
          nameInput.classList.toggle("is-invalid", !name);
          emailInput.classList.toggle("is-invalid", !email);
          needsInput.classList.toggle("is-invalid", !needs);
          return;
        }

        errorBox.classList.add("is-hidden");
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending\u2026";

        submitToFormspree(new FormData(contactForm)).then((result) => {
          if (result.ok) {
            showContactConfirmation("Thank you for reaching out. We\u2019ll review your details and connect you with the right person or resource.");
            return;
          }
          if (result.prototype) {
            showContactConfirmation("Thanks \u2014 we logged your request locally. The form endpoint is being finalized; in the meantime, you can email " + FORMSPREE_FALLBACK_EMAIL + ".");
            return;
          }
          submitBtn.disabled = false;
          submitBtn.textContent = "Send request";
          errorBox.textContent = "Couldn\u2019t send your request. Please try again, or email " + FORMSPREE_FALLBACK_EMAIL + " directly.";
          errorBox.classList.remove("is-hidden");
        });
      });

      contactSection.appendChild(contactForm);
      grid.appendChild(contactSection);
    }

    container.appendChild(grid);
    section.appendChild(container);
    return section;
  };

  const buildPathwaysVision = () => {
    const section = el("section", "page page-pathways-vision");
    section.dataset.page = "pathways-vision";

    const container = el("div", "container");
    const reading = el("div", "vision-reading");

    const backLink = el("a", "vision-back-link", "← Back to Pathways");
    backLink.href = "#about";
    backLink.addEventListener("click", (event) => {
      event.preventDefault();
      navigateTo("about");
    });
    reading.appendChild(backLink);

    reading.appendChild(el("h1", null, "Pathways Vision"));
    reading.appendChild(el("p", "vision-intro", "How we understand and support research impact at Concordia."));

    const article = el("article", "vision-article");
    article.setAttribute("aria-label", "Pathways Vision");

    if (content.pathwaysVisionLoadError || !content.pathwaysVisionMarkdown.trim()) {
      article.appendChild(el("p", null, "Pathways Vision content could not be loaded. Add `pathways_to_impact.md` to the project root to display the approved text."));
    } else {
      const sourceMarkdown = stripFrontMatter(content.pathwaysVisionMarkdown);
      const blocks = parseMarkdownBlocks(sourceMarkdown);
      const sections = [];
      let currentSection = { heading: null, blocks: [] };

      blocks.forEach((block) => {
        if (block.type === "heading" && block.level <= 2) {
          if (currentSection.heading || currentSection.blocks.length) {
            sections.push(currentSection);
          }
          currentSection = { heading: block, blocks: [] };
          return;
        }
        currentSection.blocks.push(block);
      });
      if (currentSection.heading || currentSection.blocks.length) {
        sections.push(currentSection);
      }

      let definitionHighlighted = false;
      const renderBlock = (block) => {
        if (block.type === "heading") {
          return el(block.level === 1 ? "h2" : "h3", null, block.text);
        }
        if (block.type === "list") {
          const list = el("ul", "vision-list");
          block.items.forEach((item) => list.appendChild(el("li", null, item)));
          return list;
        }
        const paragraph = el("p", null, block.text);
        const looksLikeDefinition = !definitionHighlighted
          && /research impact/i.test(block.text)
          && /(positive change|change that results)/i.test(block.text);
        if (looksLikeDefinition) {
          paragraph.classList.add("vision-definition");
          definitionHighlighted = true;
        }
        return paragraph;
      };

      sections.forEach((sectionData) => {
        const sectionNode = el("section", "vision-section");
        if (sectionData.heading) {
          sectionNode.appendChild(renderBlock(sectionData.heading));
        }

        const wordCount = sectionData.blocks.reduce((sum, block) => {
          if (block.type === "paragraph") return sum + block.text.split(/\s+/).filter(Boolean).length;
          if (block.type === "list") return sum + block.items.join(" ").split(/\s+/).filter(Boolean).length;
          return sum;
        }, 0);

        const paragraphBlocks = sectionData.blocks.filter((block) => block.type === "paragraph");
        const longSection = wordCount > 450 && paragraphBlocks.length > 2;

        if (!longSection) {
          sectionData.blocks.forEach((block) => sectionNode.appendChild(renderBlock(block)));
          article.appendChild(sectionNode);
          return;
        }

        let visibleParagraphs = 0;
        let splitIndex = sectionData.blocks.length;
        for (let i = 0; i < sectionData.blocks.length; i += 1) {
          if (sectionData.blocks[i].type === "paragraph") {
            visibleParagraphs += 1;
          }
          if (visibleParagraphs >= 2) {
            splitIndex = i + 1;
            break;
          }
        }

        sectionData.blocks.slice(0, splitIndex).forEach((block) => sectionNode.appendChild(renderBlock(block)));

        const expander = el("details", "vision-expander");
        const expanderSummary = el("summary", "vision-expander-summary", "Read more");
        expander.appendChild(expanderSummary);
        const expanderBody = el("div", "vision-expander-body");
        sectionData.blocks.slice(splitIndex).forEach((block) => expanderBody.appendChild(renderBlock(block)));
        expander.appendChild(expanderBody);
        sectionNode.appendChild(expander);
        article.appendChild(sectionNode);
      });
    }

    reading.appendChild(article);
    container.appendChild(reading);
    section.appendChild(container);
    return section;
  };

  const buildExplore = () => {
    const section = el("section", "page page-explore");
    section.dataset.page = "explore";

    const container = el("div", "container");
    container.appendChild(el("h1", null, data.explore.title));

    // === Tabs ===
    const tabsBar = el("div", "explore-tabs");
    const tabPathways = el("button", "explore-tab is-active", "Pathways");
    tabPathways.type = "button";
    tabPathways.dataset.tab = "pathways";
    const tabResearch = el("button", "explore-tab", "Research Stage");
    tabResearch.type = "button";
    tabResearch.dataset.tab = "research";
    const tabServices = el("button", "explore-tab", "All Resources");
    tabServices.type = "button";
    tabServices.dataset.tab = "browse";
    tabsBar.appendChild(tabPathways);
    tabsBar.appendChild(tabResearch);
    tabsBar.appendChild(tabServices);
    container.appendChild(tabsBar);

    const baseOpportunities = data.explore.opportunities.map((item) => ({ ...item, sourceType: "default" }));
    const externalResources = (data.explore.externalResources || []).map((item) => ({ ...item, sourceType: "resource" }));
    const exploreItems = [...baseOpportunities, ...content.workshops, ...externalResources];

    // === Pathways tab content ===
    const pathwaysTabContent = el("div", "explore-tab-content is-active");
    pathwaysTabContent.dataset.tabContent = "pathways";
    pathwaysTabContent.appendChild(el("p", "page-intro", data.explore.pathways.intro));

    const pathwayItems = data.explore.pathways.items;
    // --- Full pathway grid (default view) ---
    const explorePathwayGrid = el("div", "pathway-grid explore-pathway-grid");
    pathwayItems.forEach((pathway) => {
      const card = el("button", "pathway-card");
      card.type = "button";
      card.dataset.pathway = pathwayIdToKey[pathway.id] || pathway.id;
      card.appendChild(el("p", "pathway-card-label", pathway.title));
      card.appendChild(el("p", "pathway-card-summary", pathway.summary));
      card.addEventListener("click", () => openExplorePanel(pathway));
      explorePathwayGrid.appendChild(card);
    });
    pathwaysTabContent.appendChild(explorePathwayGrid);

    // --- Detail view (hidden by default): back link + 2-column layout ---
    const pathwayDetailShell = el("div", "pathway-detail-shell");
    pathwayDetailShell.hidden = true;

    const backLink = el("button", "pathway-back-link");
    backLink.type = "button";
    backLink.textContent = "\u2190 Back to all pathways";
    backLink.addEventListener("click", closeExplorePanel);
    pathwayDetailShell.appendChild(backLink);

    const detailLayout = el("div", "pathway-detail-layout");

    // Left: vertical side tabs
    const sideTabsList = el("div", "pathway-side-tabs");
    const sideTabButtons = new Map();
    pathwayItems.forEach((pathway) => {
      const tab = el("button", "pathway-side-tab");
      tab.type = "button";
      tab.textContent = pathway.title;
      tab.addEventListener("click", () => openExplorePanel(pathway));
      sideTabButtons.set(pathway.id, tab);
      sideTabsList.appendChild(tab);
    });
    detailLayout.appendChild(sideTabsList);

    // Right: panel content
    const panelContent = el("div", "pathway-panel-content");
    const panelTitle = el("h2", "pathway-panel-title", "");
    const panelSummary = el("p", "pathway-modal-summary", "");
    const panelLabel = el("p", "pathway-label", "");
    const panelActions = el("ul", "pathway-actions");
    panelContent.appendChild(panelTitle);
    panelContent.appendChild(panelSummary);
    panelContent.appendChild(panelLabel);
    panelContent.appendChild(panelActions);

    // Nav arrows at bottom-left of panel
    const panelNavBottom = el("div", "pathway-nav-bottom");
    const panelPrevBtn = el("button", "btn btn-icon", "\u2190");
    panelPrevBtn.type = "button";
    panelPrevBtn.setAttribute("aria-label", data.explore.pathways.buttons.previous);
    const panelNextBtn = el("button", "btn btn-icon", "\u2192");
    panelNextBtn.type = "button";
    panelNextBtn.setAttribute("aria-label", data.explore.pathways.buttons.next);
    panelNavBottom.appendChild(panelPrevBtn);
    panelNavBottom.appendChild(panelNextBtn);
    panelContent.appendChild(panelNavBottom);

    detailLayout.appendChild(panelContent);
    pathwayDetailShell.appendChild(detailLayout);

    // Related services below the 2-col layout
    const CARDS_PER_PAGE = 6;

    // Reusable pagination builder
    const buildPaginationControls = (totalItems, currentPage, totalPages, onPageChange) => {
      const pager = el("div", "pagination");
      if (totalPages <= 1) {
        const counter = el("span", "pagination-counter", "Showing " + totalItems + " of " + totalItems + " resources");
        pager.appendChild(counter);
        return pager;
      }

      const start = currentPage * CARDS_PER_PAGE + 1;
      const end = Math.min((currentPage + 1) * CARDS_PER_PAGE, totalItems);
      const counter = el("span", "pagination-counter", "Showing " + start + "\u2013" + end + " of " + totalItems + " resources");
      pager.appendChild(counter);

      const nav = el("div", "pagination-nav");

      // Prev arrow
      const prevBtn = el("button", "pagination-btn" + (currentPage === 0 ? " is-disabled" : ""), "\u2190");
      prevBtn.type = "button";
      prevBtn.disabled = currentPage === 0;
      prevBtn.setAttribute("aria-label", "Previous page");
      prevBtn.addEventListener("click", () => { if (currentPage > 0) onPageChange(currentPage - 1); });
      nav.appendChild(prevBtn);

      // Page numbers
      for (let i = 0; i < totalPages; i++) {
        const pageBtn = el("button", "pagination-btn" + (i === currentPage ? " is-active" : ""), String(i + 1));
        pageBtn.type = "button";
        pageBtn.setAttribute("aria-label", "Page " + (i + 1));
        pageBtn.addEventListener("click", () => onPageChange(i));
        nav.appendChild(pageBtn);
      }

      // Next arrow
      const nextBtn = el("button", "pagination-btn" + (currentPage === totalPages - 1 ? " is-disabled" : ""), "\u2192");
      nextBtn.type = "button";
      nextBtn.disabled = currentPage === totalPages - 1;
      nextBtn.setAttribute("aria-label", "Next page");
      nextBtn.addEventListener("click", () => { if (currentPage < totalPages - 1) onPageChange(currentPage + 1); });
      nav.appendChild(nextBtn);

      pager.appendChild(nav);
      return pager;
    };

    const pathwayServicesSection = el("div", "pathway-services-section");
    pathwayServicesSection.hidden = true;
    pathwayServicesSection.appendChild(el("h3", "pathway-services-title", "Related resources"));
    const pathwayFilterBar = el("div", "pathway-filter-bar");
    pathwayServicesSection.appendChild(pathwayFilterBar);
    const pathwayPaginationTop = el("div", "pagination-wrapper");
    pathwayServicesSection.appendChild(pathwayPaginationTop);
    const pathwayServicesGrid = el("div", "opportunity-grid");
    pathwayServicesSection.appendChild(pathwayServicesGrid);
    const pathwayPaginationBottom = el("div", "pagination-wrapper");
    pathwayServicesSection.appendChild(pathwayPaginationBottom);
    pathwayDetailShell.appendChild(pathwayServicesSection);
    let pathwayCurrentPage = 0;

    pathwaysTabContent.appendChild(pathwayDetailShell);

    // --- Open/close logic ---
    function openExplorePanel(pathway) {
      const key = pathwayIdToKey[pathway.id] || pathway.id;
      const color = pathwayColors[key];
      const currentIndex = pathwayItems.indexOf(pathway);
      const prevIndex = (currentIndex - 1 + pathwayItems.length) % pathwayItems.length;
      const nextIndex = (currentIndex + 1) % pathwayItems.length;

      // Panel content: tinted background + colored left accent + colored title/label
      const c = color || "#912338";
      const r = parseInt(c.slice(1,3), 16);
      const g = parseInt(c.slice(3,5), 16);
      const b = parseInt(c.slice(5,7), 16);
      panelContent.style.background = `rgba(${r},${g},${b},0.07)`;
      panelContent.style.borderColor = c;
      panelTitle.style.color = c;
      panelLabel.style.color = c;

      // Update side tabs
      sideTabButtons.forEach((btn, id) => {
        const k = pathwayIdToKey[id] || id;
        const c = pathwayColors[k];
        btn.classList.toggle("is-active", id === pathway.id);
        if (id === pathway.id) {
          btn.style.background = c || "#912338";
          btn.style.color = "#fff";
        } else {
          btn.style.removeProperty("background");
          btn.style.removeProperty("color");
        }
      });

      // Panel content
      panelTitle.textContent = pathway.title;
      panelSummary.textContent = pathway.summary;
      panelLabel.textContent = pathway.label;
      clear(panelActions);
      (pathway.actions || []).forEach((action) => panelActions.appendChild(el("li", null, action)));

      // Nav handlers
      panelPrevBtn.onclick = () => openExplorePanel(pathwayItems[prevIndex]);
      panelNextBtn.onclick = () => openExplorePanel(pathwayItems[nextIndex]);

      // Filtered services
      const pathwayTitle = pathway.title;
      const filtered = exploreItems.filter((opp) => {
        const val = opp.pathway;
        return Array.isArray(val) ? val.includes(pathwayTitle) : val === pathwayTitle;
      });

      // Build filter pills from the filtered items, grouped: stages → formats → External Resource last
      clear(pathwayFilterBar);
      let activePathwayFilter = null;
      const stageSet = new Set();
      const formatSet = new Set();
      filtered.forEach((opp) => {
        const stages = Array.isArray(opp.stage) ? opp.stage : (opp.stage ? [opp.stage] : []);
        stages.forEach((s) => stageSet.add(s));
        const fmt = (Array.isArray(opp.format) ? opp.format[0] : opp.format) || "";
        if (fmt) formatSet.add(fmt);
      });
      const filterTags = new Map();
      // Stages first in journey order
      const stageOrder = ["Developing an Idea", "Active Research", "Finishing a Project"];
      stageOrder.forEach((s) => { if (stageSet.has(s)) filterTags.set(s, { type: "stage", value: s }); });
      stageSet.forEach((s) => { if (!filterTags.has(s)) filterTags.set(s, { type: "stage", value: s }); });
      // Formats next, External Resource last
      const fmtArr = [...formatSet].filter((f) => f !== "External Resource").sort();
      fmtArr.forEach((f) => filterTags.set(f, { type: "format", value: f }));
      if (formatSet.has("External Resource")) filterTags.set("External Resource", { type: "format", value: "External Resource" });

      let currentPathwayItems = [];
      const renderPathwayCards = (items, page) => {
        if (page === undefined) { pathwayCurrentPage = 0; page = 0; }
        currentPathwayItems = items;
        pathwayCurrentPage = page;
        pathwayServicesGrid.style.minHeight = pathwayServicesGrid.offsetHeight + "px";
        clear(pathwayServicesGrid);
        clear(pathwayPaginationTop);
        clear(pathwayPaginationBottom);
        if (items.length) {
          const totalPages = Math.ceil(items.length / CARDS_PER_PAGE);
          const pageItems = items.slice(page * CARDS_PER_PAGE, (page + 1) * CARDS_PER_PAGE);

          const goToPage = (p) => {
            renderPathwayCards(currentPathwayItems, p);
          };
          pathwayPaginationTop.appendChild(buildPaginationControls(items.length, page, totalPages, goToPage));

          pageItems.forEach((opp) => {
          const card = el("div", "opportunity-card");
          const oppStatus = getStatus(opp);
          if (oppStatus !== "open") card.classList.add("is-" + oppStatus);
          // Header strip: format badge on the left, time pill on the right.
          const headerMeta = el("div", "card-header-meta");
          headerMeta.appendChild(formatBadge(opp.format));
          const oppPill = statusPill(oppStatus);
          if (oppPill) headerMeta.appendChild(oppPill);
          if (opp.time) {
            const displayTime = Array.isArray(opp.time) ? opp.time.join(", ") : opp.time;
            headerMeta.appendChild(el("span", "card-time-pill", displayTime));
          }
          card.appendChild(headerMeta);
          // Title gets its own row, full width, free to wrap.
          card.appendChild(el("h3", "card-title", opp.title));
          if (opp.provider) {
            card.appendChild(providerLine(opp.provider));
          }
          const tagList = el("div", "tag-list");
          (opp.tags || []).forEach((tag) => tagList.appendChild(el("span", "tag", tag)));
          if (tagList.childNodes.length) card.appendChild(tagList);
          if (opp.summary) {
            card.appendChild(el("p", "card-text", opp.summary));
          }

          const cardActions = el("div", "card-actions");
          if (opp.sourceType === "tool") {
            const btn = el("button", "btn primary", "Start \u2192");
            btn.type = "button";
            btn.addEventListener("click", () => navigateTo(opp.internalRoute));
            cardActions.appendChild(btn);
          } else if (opp.sourceType === "workshop") {
            const btn = el("button", "btn primary", data.explore.buttons.details);
            btn.type = "button";
            btn.addEventListener("click", () => navigateToService(opp.id));
            cardActions.appendChild(btn);
          } else if (opp.sourceType === "resource") {
            const btn = el("button", "btn primary", data.explore.buttons.details);
            btn.type = "button";
            btn.addEventListener("click", () => navigateToService(opp.id));
            cardActions.appendChild(btn);
          } else {
            const detailBtn = el("button", "btn primary", data.explore.buttons.details);
            detailBtn.type = "button";
            detailBtn.addEventListener("click", () => navigateToService(opp.id));
            cardActions.appendChild(detailBtn);
          }
          // Layout order: tags + body up top, actions float right at the bottom.
          card.appendChild(cardActions);
          pathwayServicesGrid.appendChild(card);
        });
        if (totalPages > 1) {
          pathwayPaginationBottom.appendChild(buildPaginationControls(items.length, page, totalPages, goToPage));
        }
      } else {
        pathwayServicesGrid.appendChild(el("p", "empty-state", "No resources found for this pathway."));
      }
      requestAnimationFrame(() => { pathwayServicesGrid.style.minHeight = ""; });
      };

      // "All" pill
      if (filterTags.size > 1) {
        const allPill = el("button", "pathway-filter-pill is-active", "All");
        allPill.type = "button";
        allPill.addEventListener("click", () => {
          activePathwayFilter = null;
          pathwayFilterBar.querySelectorAll(".pathway-filter-pill").forEach((p) => p.classList.remove("is-active"));
          allPill.classList.add("is-active");
          renderPathwayCards(filtered);
        });
        pathwayFilterBar.appendChild(allPill);

        filterTags.forEach(({ type, value }) => {
          const pill = el("button", "pathway-filter-pill", value);
          pill.type = "button";
          pill.addEventListener("click", () => {
            activePathwayFilter = { type, value };
            pathwayFilterBar.querySelectorAll(".pathway-filter-pill").forEach((p) => p.classList.remove("is-active"));
            pill.classList.add("is-active");
            const subset = filtered.filter((opp) => {
              if (type === "format") {
                const f = Array.isArray(opp.format) ? opp.format : [opp.format];
                return f.includes(value);
              } else if (type === "stage") {
                const s = Array.isArray(opp.stage) ? opp.stage : [opp.stage];
                return s.includes(value);
              }
              return true;
            });
            renderPathwayCards(subset);
          });
          pathwayFilterBar.appendChild(pill);
        });
      }

      renderPathwayCards(filtered);
      pathwayServicesSection.hidden = false;

      // Show detail view, hide grid
      explorePathwayGrid.hidden = true;
      pathwayDetailShell.hidden = false;
      pathwayDetailShell.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function closeExplorePanel() {
      explorePathwayGrid.hidden = false;
      pathwayDetailShell.hidden = true;
      pathwayServicesSection.hidden = true;
      panelContent.style.removeProperty("background");
      panelContent.style.removeProperty("border-color");
      panelTitle.style.removeProperty("color");
      panelLabel.style.removeProperty("color");
      sideTabButtons.forEach((btn) => {
        btn.classList.remove("is-active");
        btn.style.removeProperty("background");
        btn.style.removeProperty("color");
      });
    }

    section.openPathwayInTab = (pathwayKey) => {
      const pathway = pathwayItems.find((p) => (pathwayIdToKey[p.id] || p.id) === pathwayKey);
      if (pathway) {
        setActiveTab(tabPathways);
        openExplorePanel(pathway);
      }
    };

    container.appendChild(pathwaysTabContent);

    // === Research Stage tab content ===
    const researchTabContent = el("div", "explore-tab-content");
    researchTabContent.dataset.tabContent = "research";

    researchTabContent.appendChild(el("p", "lead", "Recommended support and resources based on the stage of your research."));

    const journeys = data.start.journeys;
    let activeResearchJourneyId = null;

    // Helper: build one opportunity card for the research panel
    function buildResearchOpportunityCard(opp) {
      const card = el("div", "opportunity-card");
      const oppStatus = getStatus(opp);
      if (oppStatus !== "open") card.classList.add("is-" + oppStatus);
      // Header strip: format badge on the left, time pill on the right.
      const headerMeta = el("div", "card-header-meta");
      headerMeta.appendChild(formatBadge(opp.format));
      const oppPill = statusPill(oppStatus);
      if (oppPill) headerMeta.appendChild(oppPill);
      if (opp.time) {
        const displayTime = Array.isArray(opp.time) ? opp.time.join(", ") : opp.time;
        headerMeta.appendChild(el("span", "card-time-pill", displayTime));
      }
      card.appendChild(headerMeta);
      // Title gets its own row, full width, free to wrap.
      card.appendChild(el("h3", "card-title", opp.title));
      if (opp.provider) {
        card.appendChild(providerLine(opp.provider));
      }
      if (opp.summary) {
        card.appendChild(el("p", "card-text", opp.summary));
      }
      const cardActions = el("div", "card-actions");
      if (opp.sourceType === "tool") {
        const btn = el("button", "btn primary", "Start \u2192");
        btn.type = "button";
        btn.addEventListener("click", () => navigateTo(opp.internalRoute));
        cardActions.appendChild(btn);
      } else if (opp.sourceType === "workshop") {
        const btn = el("button", "btn primary", data.explore.buttons.details);
        btn.type = "button";
        btn.addEventListener("click", () => navigateToService(opp.id));
        cardActions.appendChild(btn);
      } else if (opp.sourceType === "resource") {
        const btn = el("button", "btn primary", data.explore.buttons.details);
        btn.type = "button";
        btn.addEventListener("click", () => navigateToService(opp.id));
        cardActions.appendChild(btn);
      } else {
        const detailBtn = el("button", "btn primary", data.explore.buttons.details);
        detailBtn.type = "button";
        detailBtn.addEventListener("click", () => navigateToService(opp.id));
        cardActions.appendChild(detailBtn);
      }
      card.appendChild(cardActions);
      return card;
    }

    // --- Stage tab row (shown when a stage panel is open, all three tabs visible) ---
    const researchPillRow = el("div", "research-stage-tabs");
    researchPillRow.hidden = true;
    const researchPillButtons = new Map();
    journeys.forEach((journey) => {
      const tab = el("button", "research-stage-tab");
      tab.type = "button";
      tab.textContent = journey.title;
      tab.addEventListener("click", () => openResearchPanel(journey));
      researchPillButtons.set(journey.id, tab);
      researchPillRow.appendChild(tab);
    });

    // --- Stage card grid (Level 1) ---
    const researchStageGrid = el("div", "research-stage-grid pathway-grid");
    journeys.forEach((journey, idx) => {
      const card = el("button", "research-stage-card");
      card.type = "button";
      card.appendChild(el("p", "research-stage-num", `Stage ${idx + 1}`));
      card.appendChild(el("p", "research-stage-title", journey.title));
      card.appendChild(el("p", "research-stage-desc", journey.description));
      card.addEventListener("click", () => openResearchPanel(journey));
      researchStageGrid.appendChild(card);
    });

    // --- Inline panel (Level 2 + 3) ---
    const researchViewer = el("div", "research-viewer");
    const researchViewerCard = el("div", "research-viewer-card");

    const researchViewerHeader = el("div", "research-viewer-header");
    const researchPanelTitle = el("h2", null, "");
    const researchPanelNav = el("div", "pathway-nav");
    const researchPrevBtn = el("button", "btn btn-icon", "\u2190");
    researchPrevBtn.type = "button";
    researchPrevBtn.setAttribute("aria-label", "Previous stage");
    const researchNextBtn = el("button", "btn btn-icon", "\u2192");
    researchNextBtn.type = "button";
    researchNextBtn.setAttribute("aria-label", "Next stage");
    const researchCloseBtn = el("button", "btn btn-icon btn-icon--close", "\u00d7");
    researchCloseBtn.type = "button";
    researchCloseBtn.addEventListener("click", closeResearchPanel);
    researchPanelNav.appendChild(researchPrevBtn);
    researchPanelNav.appendChild(researchNextBtn);
    researchPanelNav.appendChild(researchCloseBtn);
    researchViewerHeader.appendChild(researchPanelTitle);
    researchViewerHeader.appendChild(researchPanelNav);
    researchViewerCard.appendChild(researchViewerHeader);

    const researchPanelDesc = el("p", "research-viewer-desc", "");
    researchViewerCard.appendChild(researchPanelDesc);

    // Module chips — topic filters
    const researchModuleChips = el("div", "research-module-chips");
    researchViewerCard.appendChild(researchModuleChips);

    // Services section — visible immediately on stage open, filtered by active chip
    const researchServicesSection = el("div", "research-services-section");
    researchServicesSection.appendChild(el("h3", "pathway-services-title", "Related resources"));
    const researchFilterBar = el("div", "pathway-filter-bar");
    researchServicesSection.appendChild(researchFilterBar);
    const researchPaginationTop = el("div", "pagination-wrapper");
    researchServicesSection.appendChild(researchPaginationTop);
    const researchServicesGrid = el("div", "opportunity-grid");
    researchServicesSection.appendChild(researchServicesGrid);
    const researchPaginationBottom = el("div", "pagination-wrapper");
    researchServicesSection.appendChild(researchPaginationBottom);
    researchViewerCard.appendChild(researchServicesSection);
    let researchCurrentPage = 0;

    // Panel CTAs
    const researchPanelActions = el("div", "module-actions");
    const researchContactBtn = el("button", "btn primary", data.start.actions.contact);
    researchContactBtn.type = "button";
    researchContactBtn.addEventListener("click", () => { navigateTo("about", "contact"); });
    researchPanelActions.appendChild(researchContactBtn);
    researchViewerCard.appendChild(researchPanelActions);

    researchViewer.appendChild(researchViewerCard);

    researchTabContent.appendChild(researchStageGrid);
    researchTabContent.appendChild(researchPillRow);
    researchTabContent.appendChild(researchViewer);

    function buildResearchFilterPills(matched) {
      clear(researchFilterBar);
      const formatSet = new Set();
      matched.forEach((opp) => {
        const fmt = (Array.isArray(opp.format) ? opp.format[0] : opp.format) || "";
        if (fmt) formatSet.add(fmt);
      });
      const fmtArr = [...formatSet].filter((f) => f !== "External Resource").sort();
      if (formatSet.size > 1) {
        const allPill = el("button", "pathway-filter-pill is-active", "All");
        allPill.type = "button";
        allPill.addEventListener("click", () => {
          researchFilterBar.querySelectorAll(".pathway-filter-pill").forEach((p) => p.classList.remove("is-active"));
          allPill.classList.add("is-active");
          renderResearchCards(matched);
        });
        researchFilterBar.appendChild(allPill);
        fmtArr.forEach((f) => {
          const pill = el("button", "pathway-filter-pill", f);
          pill.type = "button";
          pill.addEventListener("click", () => {
            researchFilterBar.querySelectorAll(".pathway-filter-pill").forEach((p) => p.classList.remove("is-active"));
            pill.classList.add("is-active");
            renderResearchCards(matched.filter((opp) => {
              const v = Array.isArray(opp.format) ? opp.format : [opp.format];
              return v.includes(f);
            }));
          });
          researchFilterBar.appendChild(pill);
        });
        if (formatSet.has("External Resource")) {
          const pill = el("button", "pathway-filter-pill", "External Resource");
          pill.type = "button";
          pill.addEventListener("click", () => {
            researchFilterBar.querySelectorAll(".pathway-filter-pill").forEach((p) => p.classList.remove("is-active"));
            pill.classList.add("is-active");
            renderResearchCards(matched.filter((opp) => {
              const v = Array.isArray(opp.format) ? opp.format : [opp.format];
              return v.includes("External Resource");
            }));
          });
          researchFilterBar.appendChild(pill);
        }
      }
    }

    let currentResearchItems = [];
    function renderResearchCards(items, page) {
      if (page === undefined) { researchCurrentPage = 0; page = 0; }
      currentResearchItems = items;
      researchCurrentPage = page;
      researchServicesGrid.style.minHeight = researchServicesGrid.offsetHeight + "px";
      clear(researchServicesGrid);
      clear(researchPaginationTop);
      clear(researchPaginationBottom);
      if (items.length) {
        const totalPages = Math.ceil(items.length / CARDS_PER_PAGE);
        const pageItems = items.slice(page * CARDS_PER_PAGE, (page + 1) * CARDS_PER_PAGE);

        const goToPage = (p) => {
          renderResearchCards(currentResearchItems, p);
        };
        researchPaginationTop.appendChild(buildPaginationControls(items.length, page, totalPages, goToPage));

        pageItems.forEach(opp => researchServicesGrid.appendChild(buildResearchOpportunityCard(opp)));

        if (totalPages > 1) {
          researchPaginationBottom.appendChild(buildPaginationControls(items.length, page, totalPages, goToPage));
        }
      } else {
        researchServicesGrid.appendChild(el("p", "empty-state", "No resources found."));
      }
      requestAnimationFrame(() => { researchServicesGrid.style.minHeight = ""; });
    }

    function loadStageServices(journey) {
      const matched = exploreItems.filter(opp => {
        const val = opp.stage;
        return Array.isArray(val) ? val.includes(journey.stage) : val === journey.stage;
      });
      buildResearchFilterPills(matched);
      renderResearchCards(matched);
    }

    function openResearchPanel(journey) {
      activeResearchJourneyId = journey.id;
      const currentIndex = journeys.indexOf(journey);
      const prevIndex = (currentIndex - 1 + journeys.length) % journeys.length;
      const nextIndex = (currentIndex + 1) % journeys.length;

      researchStageGrid.hidden = true;
      researchPillRow.hidden = false;
      researchPillButtons.forEach((btn, id) => btn.classList.toggle("is-active", id === journey.id));

      researchPanelTitle.textContent = journey.title;
      researchPanelDesc.textContent = journey.description;

      clear(researchModuleChips);
      journey.modules.forEach((module) => {
        const chip = el("button", "research-module-chip", module.title);
        chip.type = "button";
        chip.addEventListener("click", () => {
          if (chip.classList.contains("is-active")) {
            chip.classList.remove("is-active");
            loadStageServices(journey);
          } else {
            openResearchModule(journey, module, chip);
          }
        });
        researchModuleChips.appendChild(chip);
      });

      loadStageServices(journey);

      researchPrevBtn.onclick = () => openResearchPanel(journeys[prevIndex]);
      researchNextBtn.onclick = () => openResearchPanel(journeys[nextIndex]);

      researchViewer.classList.add("is-open");
      researchViewer.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function closeResearchPanel() {
      activeResearchJourneyId = null;
      researchViewer.classList.remove("is-open");
      researchPillRow.hidden = true;
      researchStageGrid.hidden = false;
      researchPillButtons.forEach((btn) => btn.classList.remove("is-active"));
    }

    function openResearchModule(journey, module, chipEl) {
      researchModuleChips.querySelectorAll(".research-module-chip").forEach(c => c.classList.remove("is-active"));
      chipEl.classList.add("is-active");

      const workshopIds = Array.isArray(module.workshopIds) ? module.workshopIds : [];
      let matched;
      if (workshopIds.length > 0) {
        matched = exploreItems.filter(opp => workshopIds.includes(opp.id));
      } else {
        matched = exploreItems.filter(opp => {
          const val = opp.stage;
          return Array.isArray(val) ? val.includes(journey.stage) : val === journey.stage;
        });
      }

      buildResearchFilterPills(matched);
      renderResearchCards(matched);
    }

    researchTabContent.applySearchTerm = () => {};
    container.appendChild(researchTabContent);

    // === Browse Services tab content ===
    const servicesTabContent = el("div", "explore-tab-content");
    servicesTabContent.dataset.tabContent = "browse";

    // Recommended for you (shown when context stage is active)
    const recommendedSection = el("div", "recommended-section");
    recommendedSection.hidden = true;
    const recommendedHeader = el("div", "recommended-header");
    const recommendedTitle = el("p", "recommended-label", "");
    recommendedHeader.appendChild(recommendedTitle);
    const recommendedGrid = el("div", "opportunity-grid recommended-grid");
    recommendedSection.appendChild(recommendedHeader);
    recommendedSection.appendChild(recommendedGrid);
    servicesTabContent.appendChild(recommendedSection);

    const controls = el("div", "explore-controls");

    const searchWrap = el("div", "search-bar");
    const searchLabel = el("label", null, data.explore.search.label);
    const searchInput = el("input");
    const searchId = "search-input";
    searchInput.id = searchId;
    searchLabel.setAttribute("for", searchId);
    searchInput.type = "search";
    searchInput.placeholder = data.explore.search.placeholder;
    searchInput.setAttribute("aria-label", data.explore.search.ariaLabel);
    searchInput.addEventListener("input", (event) => {
      state.search = event.target.value.trim();
      state.browsePage = 0;
      applyFilters();
      scheduleWriteExploreUrl();
    });
    searchWrap.appendChild(searchLabel);
    searchWrap.appendChild(searchInput);
    controls.appendChild(searchWrap);

    const filterGrid = el("div", "filter-grid");

    data.explore.filters.forEach((filter) => {
      // Pathway dropdown is intentionally hidden on the All Resources tab —
      // pathways have their own dedicated tab. State + filter logic remain so
      // programmatic navigation (e.g., "show me resources for pathway X") still
      // works; users just don't see a redundant dropdown here.
      if (filter.id === "pathway") return;
      const control = el("div", "filter-control");
      const label = el("label", null, filter.label);
      const select = el("select");
      const selectId = `filter-${filter.id}`;
      select.id = selectId;
      label.setAttribute("for", selectId);
      select.dataset.filter = filter.id;
      const allOption = el("option", null, filter.allLabel);
      allOption.value = "";
      select.appendChild(allOption);

      const valueSet = new Set();
      exploreItems.forEach((opp) => {
        const value = opp[filter.id];
        if (Array.isArray(value)) {
          value.forEach((entry) => valueSet.add(entry));
        } else if (value) {
          valueSet.add(value);
        }
      });
      const values = Array.from(valueSet).sort();

      values.forEach((value) => {
        const option = el("option", null, value);
        option.value = value;
        select.appendChild(option);
      });

      select.addEventListener("change", (event) => {
        state.filters[filter.id] = event.target.value;
        state.browsePage = 0;
        applyFilters();
        writeExploreUrl();
      });

      control.appendChild(label);
      control.appendChild(select);
      filterGrid.appendChild(control);
      filterControls.set(filter.id, select);
    });

    controls.appendChild(filterGrid);

    const explorerSection = el("section", "explorer-section");
    explorerSection.id = "opportunity-explorer";
    explorerSection.appendChild(el("p", "lead", data.explore.intro));
    explorerSection.appendChild(controls);

    const resultsMeta = el("div", "results-meta");
    const resultsLabel = el("span", "meta-label", data.explore.labels.results);
    const resultsCount = el("span", "meta-value", "0");
    resultsMeta.appendChild(resultsLabel);
    resultsMeta.appendChild(resultsCount);

    const browsePaginationTop = el("div", "pagination-wrapper");
    const resultsGrid = el("div", "opportunity-grid");
    const browsePaginationBottom = el("div", "pagination-wrapper");
    let browseCurrentPage = 0;

    explorerSection.appendChild(resultsMeta);
    explorerSection.appendChild(browsePaginationTop);
    explorerSection.appendChild(resultsGrid);
    explorerSection.appendChild(browsePaginationBottom);
    servicesTabContent.appendChild(explorerSection);
    container.appendChild(servicesTabContent);

    // Tab switching logic
    const allTabs = [tabPathways, tabResearch, tabServices];
    const allContents = [pathwaysTabContent, researchTabContent, servicesTabContent];
    tabsBar.setAttribute("role", "tablist");

    // setActiveTab toggles UI only (used by URL-driven nav and internal helpers).
    // It does NOT push the URL — that's pushTabUrl's job, which user clicks call.
    const setActiveTab = (targetTab) => {
      allTabs.forEach((t, j) => {
        const active = t === targetTab;
        t.classList.toggle("is-active", active);
        t.setAttribute("aria-selected", active ? "true" : "false");
        t.setAttribute("tabindex", active ? "0" : "-1");
        allContents[j].classList.toggle("is-active", active);
      });
    };

    // pushTabUrl writes the tab into the URL (?tab=research|browse, omitted for
    // pathways since that's the default). Hashchange then drives setActiveTab.
    const pushTabUrl = (tabName) => {
      const route = parseRouteFromHash(window.location.hash);
      const params = new URLSearchParams(route.page === "explore" ? route.params.toString() : "");
      if (tabName === "pathways") params.delete("tab");
      else params.set("tab", tabName);
      // Tab change drops modal state — switching tabs implies you're done with the modal.
      params.delete("service");
      params.delete("book");
      const queryString = params.toString();
      const nextHash = `#explore${queryString ? "?" + queryString : ""}`;
      if (window.location.hash !== nextHash) {
        window.location.hash = nextHash; // adds history entry, fires hashchange
      }
    };

    // writeExploreUrl mirrors search + filter state into the URL via
    // replaceState — silent (no hashchange fired, no listener re-applies).
    // Preserves existing tab/service/book params so back-navigation through
    // modals still works. Defensive no-op when not on #explore.
    const writeExploreUrl = () => {
      const route = parseRouteFromHash(window.location.hash);
      if (route.page !== "explore") return;
      const params = new URLSearchParams(route.params.toString());
      const setOrDelete = (key, value) => {
        const v = (value == null ? "" : value.toString());
        if (v) params.set(key, v);
        else params.delete(key);
      };
      setOrDelete("q", state.search);
      setOrDelete("stage", state.filters.stage);
      setOrDelete("format", state.filters.format);
      setOrDelete("time", state.filters.time);
      // Pathway uses a key-based URL convention (?pathway=<key>) managed by
      // state.pendingPathwayKey + applyPathwayFilterByKey; state.filters.pathway
      // holds the title, not the key, so writing it back would mismatch. Only
      // clear the param when state has been emptied (e.g., Clear all filters).
      if (!state.filters.pathway) params.delete("pathway");
      const queryString = params.toString();
      const nextHash = `#explore${queryString ? "?" + queryString : ""}`;
      if (window.location.hash !== nextHash) {
        history.replaceState(null, "", nextHash);
      }
    };

    // Debounced wrapper for keystroke-noisy events (typing in search).
    // replaceState itself is cheap; debouncing just keeps the DevTools History
    // panel tidy and avoids one URL update per character.
    let writeExploreUrlTimer = null;
    const scheduleWriteExploreUrl = () => {
      if (writeExploreUrlTimer) clearTimeout(writeExploreUrlTimer);
      writeExploreUrlTimer = setTimeout(() => {
        writeExploreUrlTimer = null;
        writeExploreUrl();
      }, 250);
    };

    allTabs.forEach((tab, i) => {
      const panelId = `explore-panel-${allContents[i].dataset.tabContent}`;
      allContents[i].id = panelId;
      allContents[i].setAttribute("role", "tabpanel");
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-selected", i === 0 ? "true" : "false");
      tab.setAttribute("aria-controls", panelId);
      tab.setAttribute("tabindex", i === 0 ? "0" : "-1");
      tab.addEventListener("click", () => {
        pushTabUrl(tab.dataset.tab);
      });
    });
    tabsBar.addEventListener("keydown", (e) => {
      const idx = allTabs.indexOf(document.activeElement);
      if (idx < 0) return;
      let next = -1;
      if (e.key === "ArrowRight") next = (idx + 1) % allTabs.length;
      else if (e.key === "ArrowLeft") next = (idx - 1 + allTabs.length) % allTabs.length;
      if (next >= 0) { e.preventDefault(); allTabs[next].click(); allTabs[next].focus(); }
    });

    section.appendChild(container);

    const applyPathwayFilter = (pathwayTitle) => {
      // Sync the optional dropdown if it exists; always set state so the
      // filter takes effect even when the dropdown is hidden.
      const control = filterControls.get("pathway");
      if (control) control.value = pathwayTitle;
      state.filters.pathway = pathwayTitle;
      applyFilters();
      writeExploreUrl();
      explorerSection.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const modalCleanups = [];
    const closeModal = () => {
      while (modalCleanups.length) modalCleanups.pop()();
      clear(modalRoot);
      document.body.classList.remove("is-modal-open");
    };
    const bindModalEscape = () => {
      const onKeydown = (e) => { if (e.key === "Escape") requestModalClose(); };
      document.addEventListener("keydown", onKeydown);
      modalCleanups.push(() => document.removeEventListener("keydown", onKeydown));
    };
    // Capture the element that triggered the modal so we can return focus on close.
    // Without this, keyboard users land on <body> after dismissing.
    // Hash-routed close paths re-render the page, so the captured node may be
    // detached by the time we restore — fall back to an ID-based lookup, then
    // to the visible page heading, so focus always lands somewhere meaningful.
    const bindModalFocusRestore = () => {
      const previouslyFocused = document.activeElement;
      const previousId = previouslyFocused && previouslyFocused.id ? previouslyFocused.id : "";
      modalCleanups.push(() => {
        if (previouslyFocused && typeof previouslyFocused.focus === "function" && document.contains(previouslyFocused)) {
          previouslyFocused.focus();
          return;
        }
        if (previousId) {
          const replaced = document.getElementById(previousId);
          if (replaced && typeof replaced.focus === "function") { replaced.focus(); return; }
        }
        const visiblePage = Array.from(document.querySelectorAll("main#app .page[data-page]"))
          .find((p) => p.offsetParent !== null);
        const heading = visiblePage ? visiblePage.querySelector("h1") : null;
        if (heading) {
          heading.setAttribute("tabindex", "-1");
          heading.focus();
        }
      });
    };

    let currentBrowseItems = [];
    const updateResults = (items, page) => {
      if (page === undefined) page = state.browsePage || 0;
      currentBrowseItems = items;
      browseCurrentPage = page;
      state.browsePage = page;
      resultsGrid.style.minHeight = resultsGrid.offsetHeight + "px";
      clear(resultsGrid);
      clear(browsePaginationTop);
      clear(browsePaginationBottom);
      resultsCount.textContent = items.length;

      if (!items.length) {
        const empty = el("div", "empty-state");
        empty.appendChild(el("h3", null, data.explore.empty.title));
        empty.appendChild(el("p", "card-text", data.explore.empty.body));
        const emptyActions = el("div", "empty-actions");
        const clearBtn = el("button", "btn", "Clear all filters");
        clearBtn.type = "button";
        clearBtn.addEventListener("click", () => {
          state.search = "";
          state.filters = { pathway: "", stage: "", format: "", time: "" };
          state.browsePage = 0;
          searchInput.value = "";
          filterControls.forEach((control) => { control.value = ""; });
          applyFilters();
          writeExploreUrl();
        });
        const contactLink = el("a", "bridge-link", "Contact us for help \u2192");
        contactLink.href = "#about";
        contactLink.addEventListener("click", (e) => { e.preventDefault(); navigateTo("about", "contact"); });
        emptyActions.appendChild(clearBtn);
        emptyActions.appendChild(contactLink);
        empty.appendChild(emptyActions);
        resultsGrid.appendChild(empty);
        requestAnimationFrame(() => { resultsGrid.style.minHeight = ""; });
        return;
      }

      const totalPages = Math.ceil(items.length / CARDS_PER_PAGE);
      const pageItems = items.slice(page * CARDS_PER_PAGE, (page + 1) * CARDS_PER_PAGE);

      const goToPage = (p) => {
        updateResults(currentBrowseItems, p);
      };
      browsePaginationTop.appendChild(buildPaginationControls(items.length, page, totalPages, goToPage));

      pageItems.forEach((opp) => {
        const card = el("div", "opportunity-card");
        const oppStatus = getStatus(opp);
        if (oppStatus !== "open") card.classList.add("is-" + oppStatus);
        // Header strip: format badge on the left, time pill on the right.
        const headerMeta = el("div", "card-header-meta");
        headerMeta.appendChild(formatBadge(opp.format));
        const oppPill = statusPill(oppStatus);
        if (oppPill) headerMeta.appendChild(oppPill);
        if (opp.time) {
          const displayTime = Array.isArray(opp.time) ? opp.time.join(", ") : opp.time;
          headerMeta.appendChild(el("span", "card-time-pill", displayTime));
        }
        card.appendChild(headerMeta);
        // Title gets its own row, full width, free to wrap.
        card.appendChild(el("h3", "card-title", opp.title));
        if (opp.provider) {
          card.appendChild(providerLine(opp.provider));
        }

        const tagList = el("div", "tag-list");
        const displayTags = [...(opp.tags || [])];
        (opp.unitTags || []).forEach((unitTag) => {
          if (!displayTags.includes(unitTag)) {
            displayTags.push(unitTag);
          }
        });
        displayTags.forEach((tag) => {
          tagList.appendChild(el("span", "tag", tag));
        });
        if (tagList.childNodes.length) card.appendChild(tagList);

        if (opp.summary) {
          card.appendChild(el("p", "card-text", opp.summary));
        }

        const actions = el("div", "card-actions");
        if (opp.sourceType === "tool") {
          const primaryButton = el("button", "btn primary", "Start \u2192");
          primaryButton.type = "button";
          primaryButton.addEventListener("click", () => navigateTo(opp.internalRoute));
          actions.appendChild(primaryButton);
        } else if (opp.sourceType === "workshop") {
          const primaryButton = el("button", "btn primary", data.explore.buttons.details);
          primaryButton.type = "button";
          primaryButton.addEventListener("click", () => navigateToService(opp.id));
          actions.appendChild(primaryButton);
        } else if (opp.sourceType === "resource") {
          const primaryButton = el("button", "btn primary", data.explore.buttons.details);
          primaryButton.type = "button";
          primaryButton.addEventListener("click", () => navigateToService(opp.id));
          actions.appendChild(primaryButton);
        } else {
          const detailButton = el("button", "btn primary", data.explore.buttons.details);
          detailButton.type = "button";
          detailButton.addEventListener("click", () => navigateToService(opp.id));
          actions.appendChild(detailButton);
        }
        // Layout order: tags + body up top, actions float right at the bottom.
        card.appendChild(actions);

        resultsGrid.appendChild(card);
      });

      if (totalPages > 1) {
        browsePaginationBottom.appendChild(buildPaginationControls(items.length, page, totalPages, goToPage));
      }
      requestAnimationFrame(() => { resultsGrid.style.minHeight = ""; });
    };

    const updateRecommended = () => {
      if (!contextStage) {
        recommendedSection.hidden = true;
        return;
      }
      const matches = exploreItems.filter((opp) => {
        const stages = Array.isArray(opp.stage) ? opp.stage : [opp.stage];
        return stages.includes(contextStage);
      }).slice(0, 3);
      if (!matches.length) {
        recommendedSection.hidden = true;
        return;
      }
      recommendedTitle.textContent = `Recommended for: ${contextStage}`;
      clear(recommendedGrid);
      matches.forEach((opp) => {
        const card = el("div", "opportunity-card rec-card");
        card.appendChild(el("h3", null, opp.title));
        if (opp.provider) {
          card.appendChild(providerLine(opp.provider));
        }
        if (opp.summary) {
          card.appendChild(el("p", "card-text", opp.summary));
        }
        const viewBtn = el("button", "btn primary", data.explore.buttons.details);
        viewBtn.type = "button";
        viewBtn.addEventListener("click", () => navigateToService(opp.id));
        card.appendChild(viewBtn);
        recommendedGrid.appendChild(card);
      });
      recommendedSection.hidden = false;
    };

    const applyFilters = () => {
      updateRecommended();
      const searchTerm = state.search.toLowerCase();
      const matchesField = (value, selected) => {
        if (!selected) return true;
        if (Array.isArray(value)) return value.includes(selected);
        return value === selected;
      };

      const filtered = exploreItems.filter((opp) => {
        const tags = Array.isArray(opp.tags) ? opp.tags : [];
        const matchesSearch = !searchTerm ||
          opp.title.toLowerCase().includes(searchTerm) ||
          (opp.summary || "").toLowerCase().includes(searchTerm) ||
          (opp.markdown || "").toLowerCase().includes(searchTerm) ||
          tags.some((tag) => tag.toLowerCase().includes(searchTerm));

        const pathwayMatch = matchesField(opp.pathway, state.filters.pathway);
        const stageMatch = matchesField(opp.stage, state.filters.stage);
        const formatMatch = matchesField(opp.format, state.filters.format);
        const timeMatch = matchesField(opp.time, state.filters.time);

        return matchesSearch && pathwayMatch && stageMatch && formatMatch && timeMatch;
      });

      updateResults(filtered);
    };

    const openBookingRedirect = (opp) => {
      clear(modalRoot);
      document.body.classList.add("is-modal-open");
      bindModalFocusRestore();
      const overlay = el("div", "modal-overlay");

      const topbar = el("div", "modal-topbar");
      const backBtn = el("button", "modal-back-btn", "\u2190 Back");
      backBtn.type = "button";
      backBtn.addEventListener("click", requestModalClose);
      topbar.appendChild(backBtn);
      overlay.appendChild(topbar);

      const modal = el("div", "modal booking-redirect-modal");
      modal.appendChild(el("h1", "modal-title", "Book: " + opp.title));
      if (opp.summary) modal.appendChild(el("p", "booking-subtitle", opp.summary));

      const info = el("div", "booking-redirect-info");
      info.appendChild(el("p", null, "Booking happens on Microsoft Bookings. You\u2019ll pick a time, enter your details, and get a Teams link by email."));
      modal.appendChild(info);

      const actions = el("div", "booking-actions");
      const openBtn = el("a", "btn primary", "Open booking \u2197");
      openBtn.href = opp.bookingUrl;
      openBtn.target = "_blank";
      openBtn.rel = "noopener noreferrer";
      actions.appendChild(openBtn);

      const cancelBtn = el("button", "btn", "Cancel");
      cancelBtn.type = "button";
      cancelBtn.addEventListener("click", requestModalClose);
      actions.appendChild(cancelBtn);

      modal.appendChild(actions);

      overlay.appendChild(modal);
      bindModalEscape();
      modalRoot.appendChild(overlay);
      overlay.scrollTo(0, 0);
    };

    const openBookingModal = (opp) => {
      // External booking handoff is handled upstream — by the detail-modal CTA
      // (no navigation pushed) and by reconcileServiceModal's deep-link guard
      // (replaceState strips ?book=1). By the time we reach this function, the
      // intent is unambiguously: render the in-page request form.
      const oppStatus = getStatus(opp);
      const isWaitlist = oppStatus === "full";

      clear(modalRoot);
      document.body.classList.add("is-modal-open");
      bindModalFocusRestore();
      const overlay = el("div", "modal-overlay");

      const topbar = el("div", "modal-topbar");
      const backBtn = el("button", "modal-back-btn", "\u2190 Back");
      backBtn.type = "button";
      backBtn.addEventListener("click", requestModalClose);
      topbar.appendChild(backBtn);
      overlay.appendChild(topbar);

      const modal = el("div", "modal booking-modal");

      // Prototype notice
      const notice = el("div", "booking-notice");
      notice.innerHTML = '<strong>Prototype</strong> \u2014 This platform is in beta. When live, you\u2019ll be able to book consultations, register for workshops, and manage your sessions directly. For now, we\u2019ll follow up by email to confirm.';
      modal.appendChild(notice);

      // Title
      const modalTitleText = isWaitlist
        ? "Join the waitlist"
        : (opp ? "Request this service" : "Request a consultation");
      modal.appendChild(el("h1", "modal-title", modalTitleText));
      if (opp) {
        const subtitlePrefix = isWaitlist ? "Waitlist: " : "Re: ";
        modal.appendChild(el("p", "booking-subtitle", subtitlePrefix + opp.title));
      }

      // Waitlist banner \u2014 explains why the booking flow short-circuited.
      if (isWaitlist) {
        const banner = el("div", "booking-waitlist-banner");
        banner.innerHTML = '<strong>This session is fully booked.</strong> Add yourself to the waitlist below and we\u2019ll email you if a spot opens up or another session is added.';
        modal.appendChild(banner);
      }

      // Form
      const form = document.createElement("form");
      form.className = "booking-form";
      form.setAttribute("action", FORMSPREE_URL);
      form.setAttribute("method", "POST");

      // Hidden field for service context
      if (opp) {
        const hiddenService = el("input", null);
        hiddenService.type = "hidden";
        hiddenService.name = "service";
        hiddenService.value = opp.title;
        form.appendChild(hiddenService);

        const hiddenStatus = el("input", null);
        hiddenStatus.type = "hidden";
        hiddenStatus.name = "service_status";
        hiddenStatus.value = oppStatus;
        form.appendChild(hiddenStatus);
      }

      // Hidden intent for waitlist; visible radio group for normal requests.
      if (isWaitlist) {
        const hiddenIntent = el("input", null);
        hiddenIntent.type = "hidden";
        hiddenIntent.name = "intent";
        hiddenIntent.value = "waitlist";
        form.appendChild(hiddenIntent);
      }

      // Radio: Intent
      const intentField = el("fieldset", "booking-field booking-fieldset");
      if (isWaitlist) intentField.hidden = true;
      const intentLegend = document.createElement("legend");
      intentLegend.textContent = "What brings you here?";
      intentField.appendChild(intentLegend);
      const intentOptions = [
        { value: "interested", label: "I\u2019m interested in this service" },
        { value: "exploring", label: "I\u2019m exploring what\u2019s available" },
        { value: "timing", label: "I want to check timing or availability" }
      ];
      intentOptions.forEach((opt, i) => {
        const radioWrap = el("div", "booking-radio");
        const radio = document.createElement("input");
        radio.type = "radio";
        radio.name = "intent";
        radio.value = opt.value;
        radio.id = "intent-" + opt.value;
        if (i === 0 && opp) radio.checked = true;
        radioWrap.appendChild(radio);
        const radioLabel = el("label", null, opt.label);
        radioLabel.setAttribute("for", "intent-" + opt.value);
        radioWrap.appendChild(radioLabel);
        intentField.appendChild(radioWrap);
      });
      form.appendChild(intentField);

      // Name
      const nameField = el("div", "booking-field");
      const nameLabel = el("label", null, "Name");
      nameLabel.setAttribute("for", "booking-name");
      nameField.appendChild(nameLabel);
      const nameInput = el("input", "booking-input");
      nameInput.id = "booking-name";
      nameInput.name = "name";
      nameInput.type = "text";
      nameInput.placeholder = "Your full name";
      nameInput.required = true;
      nameField.appendChild(nameInput);
      form.appendChild(nameField);

      // Email
      const emailField = el("div", "booking-field");
      const emailLabel = el("label", null, "Email");
      emailLabel.setAttribute("for", "booking-email");
      emailField.appendChild(emailLabel);
      const emailInput = el("input", "booking-input");
      emailInput.id = "booking-email";
      emailInput.name = "email";
      emailInput.type = "email";
      emailInput.placeholder = "your.email@university.ca";
      emailInput.required = true;
      emailField.appendChild(emailInput);
      form.appendChild(emailField);

      // Context / questions
      const commentField = el("div", "booking-field");
      const commentLabel = el("label", null, isWaitlist ? "Anything else (optional)" : "Questions or context (optional)");
      commentLabel.setAttribute("for", "booking-message");
      commentField.appendChild(commentLabel);
      const commentTextarea = el("textarea", "booking-textarea");
      commentTextarea.id = "booking-message";
      commentTextarea.name = "message";
      commentTextarea.placeholder = isWaitlist
        ? "Any preferences on dates, times, or alternative sessions?"
        : "Anything we should know about your project, timing, or what you\u2019re hoping to get out of this?";
      commentTextarea.rows = 4;
      commentField.appendChild(commentTextarea);
      form.appendChild(commentField);

      // Actions (inside form so submit button triggers form submit)
      const actions = el("div", "booking-actions");
      const submitBtnLabel = isWaitlist ? "Join waitlist" : "Send request";
      const submitBtn = el("button", "btn primary", submitBtnLabel);
      submitBtn.type = "submit";
      actions.appendChild(submitBtn);

      const cancelBtn = el("button", "btn", "Cancel");
      cancelBtn.type = "button";
      cancelBtn.addEventListener("click", requestModalClose);
      actions.appendChild(cancelBtn);

      form.appendChild(actions);
      modal.appendChild(form);

      // Handle submit
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        if (!name || !email) {
          nameInput.classList.toggle("is-invalid", !name);
          emailInput.classList.toggle("is-invalid", !email);
          return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = "Sending\u2026";

        const showBookingError = () => {
          submitBtn.disabled = false;
          submitBtn.textContent = submitBtnLabel;
          let errBox = form.querySelector(".booking-error");
          if (!errBox) {
            errBox = el("p", "booking-error", "");
            errBox.setAttribute("role", "alert");
            form.insertBefore(errBox, actions);
          }
          errBox.textContent = "Couldn’t send your request. Please try again, or email " + FORMSPREE_FALLBACK_EMAIL + " directly.";
        };

        submitToFormspree(new FormData(form)).then((result) => {
          if (!result.ok && !result.prototype) {
            showBookingError();
            return;
          }
          clear(form);
          form.className = "booking-confirmation";
          form.appendChild(el("p", "booking-confirm-icon", "\u2713"));
          const confirmTitle = isWaitlist
            ? "You\u2019re on the waitlist, " + name + "!"
            : "Thank you, " + name + "!";
          form.appendChild(el("h2", "booking-confirm-title", confirmTitle));
          const text = result.ok
            ? (isWaitlist
                ? "We\u2019ve added you to the waitlist for \u201c" + (opp ? opp.title : "this session") + "\u201d. We\u2019ll email you at " + email + " if a spot opens up or another session is added."
                : "Your request has been received." + (opp ? " We\u2019ll follow up about \u201c" + opp.title + "\u201d at " + email + "." : " We\u2019ll be in touch at " + email + " shortly."))
            : "We logged your request locally. The form endpoint is being connected \u2014 once it\u2019s live, submissions will be delivered automatically. For anything urgent, email " + FORMSPREE_FALLBACK_EMAIL + ".";
          form.appendChild(el("p", "booking-confirm-text", text));
          actions.hidden = true;
        });
      });

      overlay.appendChild(modal);
      bindModalEscape();

      modalRoot.appendChild(overlay);
      overlay.scrollTo(0, 0);
    };

    const openModal = (opp) => {
      clear(modalRoot);
      document.body.classList.add("is-modal-open");
      bindModalFocusRestore();
      const overlay = el("div", "modal-overlay");

      // Sticky top bar
      const topbar = el("div", "modal-topbar");
      const backBtn = el("button", "modal-back-btn", "\u2190 Back");
      backBtn.type = "button";
      backBtn.addEventListener("click", requestModalClose);
      topbar.appendChild(backBtn);
      const topbarActions = el("div", "modal-topbar-actions");
      if (opp.sourceType === "resource" && opp.externalUrl) {
        const resourceBtn = el("a", "btn primary", "Open resource \u2197");
        resourceBtn.href = opp.externalUrl;
        resourceBtn.target = "_blank";
        resourceBtn.rel = "noopener noreferrer";
        topbarActions.appendChild(resourceBtn);
      }
      topbar.appendChild(topbarActions);
      overlay.appendChild(topbar);

      // Page content
      const modal = el("div", "modal");

      // Kicker + title + author
      modal.appendChild(el("h1", "modal-title", opp.title));
      if (opp.author) modal.appendChild(el("p", "modal-author", "By: " + opp.author));

      // Metadata bar
      const metaBar = el("div", "modal-meta-bar");
      [
        { label: "Offered by", value: opp.provider },
        { label: "Format", value: Array.isArray(opp.format) ? opp.format.join(", ") : opp.format },
        { label: "Time", value: Array.isArray(opp.time) ? opp.time.join(", ") : opp.time },
        { label: "Stage", value: Array.isArray(opp.stage) ? opp.stage.join(", ") : opp.stage },
        { label: "Pathway", value: Array.isArray(opp.pathway) ? opp.pathway.join(", ") : opp.pathway }
      ].forEach(({ label, value }) => {
        if (!value) return;
        const item = el("div", "modal-meta-item");
        const itemLabel = el("strong", null, label + ":");
        item.appendChild(itemLabel);
        item.appendChild(document.createTextNode(" " + value));
        metaBar.appendChild(item);
      });
      modal.appendChild(metaBar);

      // Tags
      const allTags = [...(opp.tags || []), ...(opp.unitTags || [])];
      if (allTags.length) {
        const tagBar = el("div", "modal-tag-bar");
        allTags.forEach(tag => tagBar.appendChild(el("span", "tag", tag)));
        modal.appendChild(tagBar);
      }

      // Pull-quote hero — only when the workshop's Doc had a quoted opening
      // paragraph. Same text shows on the card; never duplicated in body.
      if (opp.pullQuote) {
        modal.appendChild(el("blockquote", "modal-pullquote", opp.pullQuote));
      }

      // Body content
      const body = el("div", "modal-body");
      if (opp.sourceType === "workshop" && opp.html) {
        body.innerHTML = opp.html;
      } else {
        if (opp.summary) body.appendChild(el("p", null, opp.summary));
        if (opp.details) {
          if (opp.details.who) {
            body.appendChild(el("h2", null, data.explore.labels.who));
            body.appendChild(el("p", null, opp.details.who));
          }
          if (opp.details.what) {
            body.appendChild(el("h2", null, data.explore.labels.what));
            body.appendChild(el("p", null, opp.details.what));
          }
          if (opp.details.outcomes) {
            body.appendChild(el("h2", null, data.explore.labels.outcomes));
            body.appendChild(el("p", null, opp.details.outcomes));
          }
        }
      }
      modal.appendChild(body);

      // External resource note
      if (opp.sourceType === "resource" && opp.externalUrl) {
        const extNote = el("p", "modal-external-note", "This resource is hosted externally. You will leave the Pathways to Impact website.");
        modal.appendChild(extNote);
      }

      // Bottom CTA — present only when the item has a clear action
      // (external link, consultation booking, or workshop registration).
      // Other formats render with no bottom CTA; the body speaks for itself.
      const bottomCta = el("div", "modal-bottom-cta");
      const fmt = (opp.format || "").toString().toLowerCase();
      const modalStatus = getStatus(opp);
      if (opp.sourceType === "resource" && opp.externalUrl) {
        const ctaBtn = el("a", "btn primary modal-cta-btn", "Open resource \u2197");
        ctaBtn.href = opp.externalUrl;
        ctaBtn.target = "_blank";
        ctaBtn.rel = "noopener noreferrer";
        bottomCta.appendChild(ctaBtn);
      } else if (modalStatus === "cancelled") {
        bottomCta.appendChild(el("p", "modal-status-note", "This session has been cancelled. Check back later or contact us if you have questions."));
      } else if (fmt.includes("consult")) {
        const isFull = modalStatus === "full";
        const ctaBtn = el("button", "btn primary modal-cta-btn", isFull ? "Join the waitlist" : "Book a consultation");
        ctaBtn.type = "button";
        ctaBtn.addEventListener("click", () => {
          // External booking handoff: open MS Bookings in a new tab without
          // pushing ?book=1 to history (avoids the ghost-modal back-button bug).
          if (shouldExternalBooking(opp)) {
            window.open(opp.bookingUrl, "_blank", "noopener,noreferrer");
            return;
          }
          navigateToService(opp.id, true);
        });
        bottomCta.appendChild(ctaBtn);
        if (isFull) {
          bottomCta.appendChild(el("p", "modal-status-note", "This consultation is fully booked. Join the waitlist and we’ll let you know when a spot opens up."));
        }
      } else if (opp.sourceType === "workshop") {
        // Workshops with a bookingUrl hand off to MS Bookings in a new tab;
        // others open the in-page request form via the booking modal.
        const isFull = modalStatus === "full";
        const ctaBtn = el("button", "btn primary modal-cta-btn", isFull ? "Join the waitlist" : "Register for this workshop");
        ctaBtn.type = "button";
        ctaBtn.addEventListener("click", () => {
          if (shouldExternalBooking(opp)) {
            window.open(opp.bookingUrl, "_blank", "noopener,noreferrer");
            return;
          }
          navigateToService(opp.id, true);
        });
        bottomCta.appendChild(ctaBtn);
        if (isFull) {
          bottomCta.appendChild(el("p", "modal-status-note", "This workshop is fully booked. Join the waitlist and we’ll let you know if a seat opens up or another session runs."));
        }
      }
      // Only attach the CTA bar if a button was actually added.
      if (bottomCta.childNodes.length) modal.appendChild(bottomCta);

      // Related services
      const oppPathways = Array.isArray(opp.pathway) ? opp.pathway : (opp.pathway ? [opp.pathway] : []);
      const oppTags = Array.isArray(opp.tags) ? opp.tags : [];
      const related = exploreItems
        .filter((item) => item.id !== opp.id)
        .map((item) => {
          const itemPathways = Array.isArray(item.pathway) ? item.pathway : (item.pathway ? [item.pathway] : []);
          const itemTags = Array.isArray(item.tags) ? item.tags : [];
          let score = 0;
          oppPathways.forEach((p) => { if (itemPathways.includes(p)) score += 2; });
          if (item.stage && item.stage === opp.stage) score += 1;
          oppTags.forEach((t) => { if (itemTags.includes(t)) score += 1; });
          return { item, score };
        })
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map(({ item }) => item);

      if (related.length) {
        const relatedSection = el("div", "modal-related");
        relatedSection.appendChild(el("h2", "modal-related-title", "Researchers who used this also found\u2026"));
        const relatedGrid = el("div", "modal-related-grid");
        related.forEach((item) => {
          const card = el("div", "modal-related-card");
          card.appendChild(formatBadge(item.format));
          card.appendChild(el("p", "modal-related-card-title", item.title));
          if (item.summary) card.appendChild(el("p", "modal-related-card-summary", item.summary));
          const cardBtn = el("button", "btn", data.explore.buttons.details);
          cardBtn.type = "button";
          cardBtn.addEventListener("click", () => navigateToService(item.id));
          card.appendChild(cardBtn);
          relatedGrid.appendChild(card);
        });
        relatedSection.appendChild(relatedGrid);
        modal.appendChild(relatedSection);
      }

      overlay.appendChild(modal);
      bindModalEscape();

      modalRoot.appendChild(overlay);
      overlay.scrollTo(0, 0);
    };

    const applyStageFilter = (stage) => {
      setActiveTab(tabServices);
      const control = filterControls.get("stage");
      if (control) {
        control.value = stage;
        state.filters.stage = stage;
        applyFilters();
        writeExploreUrl();
        control.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    };

    const applyPathwayFilterByKey = (pathwayKey) => {
      const pathwayTitle = pathwayKeyToTitle[(pathwayKey || "").toLowerCase()];
      if (pathwayTitle) {
        applyPathwayFilter(pathwayTitle);
      }
    };

    const focusWorkshopById = (workshopId) => {
      const workshop = exploreItems.find((item) => item.sourceType === "workshop" && item.id === workshopId);
      if (!workshop) return;
      state.search = workshop.title;
      searchInput.value = workshop.title;
      applyFilters();
      writeExploreUrl();
      explorerSection.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const applySearchTerm = (rawSearch) => {
      const normalized = (rawSearch || "").trim();
      state.search = normalized;
      searchInput.value = normalized;
      applyFilters();
      explorerSection.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    // syncFromUrl is the inverse of writeExploreUrl: read URL params back into
    // state + DOM controls. Called by showPage on every explore activation so
    // back/forward and deep-loads restore search/filter context. Must NOT call
    // writeExploreUrl — otherwise hashchange → sync → write loops.
    const syncFromUrl = () => {
      const route = parseRouteFromHash(window.location.hash);
      if (route.page !== "explore") return;
      const params = route.params;
      state.search = (params.get("q") || "").trim();
      state.filters.stage = params.get("stage") || "";
      state.filters.format = params.get("format") || "";
      state.filters.time = params.get("time") || "";
      // pathway intentionally not read here — applyPathwayFilterByKey in
      // showPage owns that flow (?pathway=<key>, with key→title translation).
      searchInput.value = state.search;
      filterControls.forEach((control, id) => {
        if (id === "pathway") return;
        control.value = state.filters[id] || "";
      });
      applyFilters();
    };

    applyFilters();

    section.applyStageFilter = applyStageFilter;
    section.applyPathwayFilterByKey = applyPathwayFilterByKey;
    section.focusWorkshopById = focusWorkshopById;
    section.applySearchTerm = applySearchTerm;
    section.syncFromUrl = syncFromUrl;
    section.openResearchStage = (journeyId) => {
      setActiveTab(tabResearch);
      const journey = journeys.find(j => j.id === journeyId);
      if (journey) openResearchPanel(journey);
    };
    section.openTab = (tabName) => {
      if (tabName === "research") setActiveTab(tabResearch);
      else if (tabName === "browse") setActiveTab(tabServices);
      else setActiveTab(tabPathways);
    };
    section.resetState = () => {
      closeExplorePanel();
      closeResearchPanel();
      setActiveTab(tabPathways);
    };

    // Reconcile the modal layer with what the URL says should be open.
    // Called from showPage on every page change and on every hashchange.
    // Idempotent: opening the same modal that's already open is a no-op.
    section.reconcileServiceModal = (serviceId, withBooking) => {
      // Deep-link / browser-restored history can land here with ?book=1 on a
      // service that hands off externally (MS Bookings). In that case open the
      // external page and strip ?book=1 from the URL via replaceState — leaves
      // the detail modal visible (?service=X stays) so back-navigation closes
      // cleanly instead of replaying the external popup. Pop-up blockers may
      // eat the new tab on non-click contexts; the URL clean-up still runs and
      // the user gets the Open booking ↗ button in the rendered detail modal.
      if (withBooking && serviceId) {
        const candidate = exploreItems.find((item) => item.id === serviceId);
        if (candidate && shouldExternalBooking(candidate)) {
          window.open(candidate.bookingUrl, "_blank", "noopener,noreferrer");
          const currentRoute = parseRouteFromHash(window.location.hash);
          const params = new URLSearchParams(currentRoute.params.toString());
          params.delete("book");
          const queryString = params.toString();
          const nextHash = `#explore${queryString ? "?" + queryString : ""}`;
          if (window.location.hash !== nextHash) {
            history.replaceState(null, "", nextHash);
          }
          withBooking = false;
        }
      }

      const targetKey = !serviceId
        ? ""
        : (withBooking ? `book:${serviceId}` : `service:${serviceId}`);
      if (targetKey === state.currentModalKey) return;

      // Close whatever's currently up.
      if (state.currentModalKey) {
        closeModal();
        state.currentModalKey = "";
      }

      if (!serviceId) return;

      const opp = exploreItems.find((item) => item.id === serviceId);
      if (!opp) return; // bad/stale service id — leave URL but don't crash

      if (withBooking) {
        openBookingModal(opp);
      } else {
        openModal(opp);
      }
      state.currentModalKey = targetKey;
    };

    return section;
  };

  const openQuickMatch = () => {
    clear(modalRoot);
    document.body.classList.add("is-modal-open");

    const impactOptions = data.explore.pathways.items.map((p) => ({
      label: p.summary.replace(/\.$/, ""),
      pathwayId: p.id,
      pathwayTitle: p.title,
      pathwayKey: pathwayIdToKey[p.id] || p.id
    }));

    let selectedStage = null;
    let selectedPathwayId = null;

    const overlay = el("div", "modal-overlay quick-match-overlay");
    const modal = el("div", "modal quick-match-modal");

    const closeQM = () => {
      clear(modalRoot);
      document.body.classList.remove("is-modal-open");
    };

    overlay.addEventListener("click", (e) => { if (e.target === overlay) closeQM(); });

    const renderStep1 = () => {
      clear(modal);
      modal.appendChild(el("p", "qm-step-label", "Step 1 of 2"));
      modal.appendChild(el("h3", "qm-question", "Where are you in your research?"));
      const options = el("div", "qm-options");
      data.home.hero.cards.forEach((card) => {
        const btn = el("button", "qm-option" + (selectedStage === card.id ? " is-selected" : ""), card.title);
        btn.type = "button";
        const desc = el("span", "qm-option-desc", card.description);
        btn.appendChild(desc);
        btn.addEventListener("click", () => {
          selectedStage = card.id;
          renderStep2();
        });
        options.appendChild(btn);
      });
      modal.appendChild(options);
      const closeBtn = el("button", "qm-close", "\u00d7");
      closeBtn.type = "button";
      closeBtn.setAttribute("aria-label", "Close");
      closeBtn.addEventListener("click", closeQM);
      modal.appendChild(closeBtn);
    };

    const renderStep2 = () => {
      clear(modal);
      modal.appendChild(el("p", "qm-step-label", "Step 2 of 2"));
      modal.appendChild(el("h3", "qm-question", "What kind of impact matters most to you?"));
      const options = el("div", "qm-options qm-options--grid");
      impactOptions.forEach((opt) => {
        const btn = el("button", "qm-option qm-option--compact" + (selectedPathwayId === opt.pathwayId ? " is-selected" : ""));
        btn.type = "button";
        btn.appendChild(el("span", "qm-option-pathway-label", opt.pathwayTitle));
        btn.appendChild(el("span", "qm-option-desc", opt.label));
        btn.addEventListener("click", () => {
          selectedPathwayId = opt.pathwayId;
          renderResult(opt);
        });
        options.appendChild(btn);
      });
      modal.appendChild(options);
      const backBtn = el("button", "btn-link qm-back", "\u2190 Back");
      backBtn.type = "button";
      backBtn.addEventListener("click", renderStep1);
      modal.appendChild(backBtn);
      const closeBtn = el("button", "qm-close", "\u00d7");
      closeBtn.type = "button";
      closeBtn.setAttribute("aria-label", "Close");
      closeBtn.addEventListener("click", closeQM);
      modal.appendChild(closeBtn);
    };

    const renderResult = (opt) => {
      clear(modal);
      const stageCard = data.home.hero.cards.find((c) => c.id === selectedStage);
      modal.appendChild(el("p", "qm-step-label", "Your recommendation"));
      modal.appendChild(el("h3", "qm-result-pathway", opt.pathwayTitle));
      modal.appendChild(el("p", "qm-result-desc", opt.label + "."));
      if (stageCard) {
        modal.appendChild(el("p", "qm-result-stage", `For your stage: ${stageCard.title}`));
      }
      const actions = el("div", "qm-result-actions");
      const exploreBtn = el("button", "btn btn-primary", "Explore this pathway \u2192");
      exploreBtn.type = "button";
      exploreBtn.addEventListener("click", () => {
        closeQM();
        if (stageCard) setContextStage(stageCard.title);
        navigateTo("explore", "opportunity-explorer", { pathway: opt.pathwayKey });
      });
      const supportBtn = el("button", "btn", "Find support for my stage \u2192");
      supportBtn.type = "button";
      supportBtn.addEventListener("click", () => {
        closeQM();
        const supportAnchor = supportAnchorByJourneyId[selectedStage];
        if (stageCard) setContextStage(stageCard.title);
        navigateTo("support", supportAnchor || undefined);
      });
      actions.appendChild(exploreBtn);
      actions.appendChild(supportBtn);
      modal.appendChild(actions);
      const restartBtn = el("button", "btn-link qm-back", "Start over");
      restartBtn.type = "button";
      restartBtn.addEventListener("click", () => { selectedStage = null; selectedPathwayId = null; renderStep1(); });
      modal.appendChild(restartBtn);
      const closeBtn = el("button", "qm-close", "\u00d7");
      closeBtn.type = "button";
      closeBtn.setAttribute("aria-label", "Close");
      closeBtn.addEventListener("click", closeQM);
      modal.appendChild(closeBtn);
    };

    renderStep1();
    overlay.appendChild(modal);
    modalRoot.appendChild(overlay);
  };

  const buildPages = () => {
    const homePage = buildHome();
    const startPage = buildStart();
    const supportPage = buildSupport();
    const learnPage = buildLearn();
    const pathwaysVisionPage = buildPathwaysVision();
    const explorePage = buildExplore();
    const toolsPage = buildTools();
    const narrativePage = buildNarrativeModule();
    const aboutPage = buildAbout();

    pages.set("home", homePage);
    pages.set("start", startPage);
    pages.set("support", supportPage);
    pages.set("learn", learnPage);
    pages.set("pathways-vision", pathwaysVisionPage);
    pages.set("explore", explorePage);
    pages.set("tools", toolsPage);
    pages.set("tools-narrative", narrativePage);
    pages.set("about", aboutPage);

    appRoot.appendChild(homePage);
    appRoot.appendChild(startPage);
    appRoot.appendChild(supportPage);
    appRoot.appendChild(learnPage);
    appRoot.appendChild(pathwaysVisionPage);
    appRoot.appendChild(explorePage);
    appRoot.appendChild(toolsPage);
    appRoot.appendChild(narrativePage);
    appRoot.appendChild(aboutPage);
  };

  const setActiveNav = (pageId) => {
    const activePageId = pageId === "pathways-vision" ? "about"
      : pageId === "tools-narrative" || pageId === "tools" ? "learn"
      : pageId.startsWith("learn-module") ? "learn"
      : pageId;
    const links = siteHeader.querySelectorAll(".nav-link");
    links.forEach((link) => {
      if (link.dataset.page === activePageId) {
        link.classList.add("is-active");
      } else {
        link.classList.remove("is-active");
      }
    });
  };

  const showPage = (pageId, anchorId) => {
    const validPage = pages.has(pageId) ? pageId : "home";
    state.page = validPage;

    const baseTitle = data.meta.title || "Pathways to Impact";
    const pageLabel = validPage === "home" ? "" : (data.navigation.find(n => n.id === validPage) || {}).label || validPage;
    document.title = pageLabel ? `${pageLabel} — ${baseTitle}` : baseTitle;

    pages.forEach((page, id) => {
      page.classList.toggle("is-active", id === validPage);
    });

    setActiveNav(validPage);
    if (routeFooter) {
      routeFooter.classList.toggle("is-visible", validPage !== "home");
    }
    if (validPage !== "home") {
      const homePage = pages.get("home");
      if (homePage && homePage.closePathwayModal) {
        homePage.closePathwayModal();
      }
    }
    if (validPage !== "explore") {
      const explorePage = pages.get("explore");
      if (explorePage && explorePage.resetState) {
        explorePage.resetState();
      }
      // Leaving explore — make sure no service modal lingers.
      if (explorePage && explorePage.reconcileServiceModal) {
        explorePage.reconcileServiceModal("", false);
      }
    }
    if (validPage !== "learn") {
      const learnPage = pages.get("learn");
      if (learnPage && learnPage.resetState) {
        learnPage.resetState();
      }
    }

    if (validPage === "explore") {
      const explorePage = pages.get("explore");
      // Set the active tab FIRST from URL (?tab=research|browse), defaulting
      // to pathways if no tab param. Later helpers (applyStageFilter,
      // openPathwayInTab, openResearchStage) may override the tab as a side
      // effect of their own work, which is desired.
      if (explorePage && explorePage.openTab) {
        explorePage.openTab(state.pendingExploreTab || "pathways");
        state.pendingExploreTab = "";
      }
      // Restore search + filter state from URL (?q=, ?stage=, ?format=, ?time=)
      // BEFORE running pending-* mutators, so subsequent writeExploreUrl calls
      // operate on a state that matches what's in the URL. Otherwise an empty
      // state.search would get re-written into the URL and wipe ?q=.
      // syncFromUrl is the inverse of writeExploreUrl — together they keep the
      // URL as the single source of truth across modal opens, tab switches,
      // back/forward, and cold-load deep links. Pathway uses its own pending-*
      // flow below (state.pendingPathwayKey → applyPathwayFilterByKey).
      if (explorePage && explorePage.syncFromUrl) {
        explorePage.syncFromUrl();
      }
      state.pendingExploreSearch = "";
      if (explorePage && explorePage.applyStageFilter && state.pendingStage) {
        explorePage.applyStageFilter(state.pendingStage);
        state.pendingStage = "";
      }
      if (explorePage && explorePage.openPathwayInTab && state.pendingPathwayKey) {
        explorePage.openPathwayInTab(state.pendingPathwayKey);
        state.pendingPathwayKey = "";
      }
      if (explorePage && explorePage.focusWorkshopById && state.pendingWorkshopId) {
        explorePage.focusWorkshopById(state.pendingWorkshopId);
        state.pendingWorkshopId = "";
      }
      if (explorePage && explorePage.openResearchStage && state.pendingResearchJourneyId) {
        explorePage.openResearchStage(state.pendingResearchJourneyId);
        state.pendingResearchJourneyId = "";
      }
      // Reconcile modal state from the URL (?service=<id>&book=1).
      // Runs on every explore-page activation, including hashchange-driven nav.
      if (explorePage && explorePage.reconcileServiceModal) {
        const route = parseRouteFromHash(window.location.hash);
        const urlServiceId = route.params.get("service") || "";
        const urlWithBooking = route.params.get("book") === "1";
        explorePage.reconcileServiceModal(urlServiceId, urlWithBooking);
      }
    }

    if (validPage === "home") {
      state.pendingPathwayKey = "";
    }

    if (validPage === "support") {
      const supportPage = pages.get("support");
      if (supportPage && supportPage.applySearchTerm) {
        supportPage.applySearchTerm(state.pendingSupportSearch);
      }
      state.pendingSupportSearch = "";
    }

    if (anchorId) {
      const target = document.getElementById(anchorId);
      if (target) {
        if (target.tagName === "DETAILS") {
          target.open = true;
        }
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const pageToHash = (pageId) => {
    const validPage = pages.has(pageId) ? pageId : "home";
    return validPage === "home" ? "#home" : `#${validPage}`;
  };

  // Navigate to a service modal. If we're not on Explore yet, this hops there
  // and the modal opens once the page is built. Otherwise it just adds the
  // ?service=<id> (and optionally &book=1) to the URL — hashchange does the rest.
  const navigateToService = (serviceId, withBooking) => {
    const route = parseRouteFromHash(window.location.hash);
    const targetPage = "explore";
    const params = new URLSearchParams(route.page === targetPage ? route.params.toString() : "");
    if (serviceId) params.set("service", serviceId);
    else params.delete("service");
    if (withBooking) params.set("book", "1");
    else params.delete("book");
    const queryString = params.toString();
    const nextHash = `#${targetPage}${queryString ? "?" + queryString : ""}`;
    if (window.location.hash !== nextHash) {
      window.location.hash = nextHash; // adds history entry, fires hashchange
    }
  };

  // Close whatever modal is open by popping history. Browser back/forward
  // already pops naturally; this is what the modal X / Escape / "Back" button hooks
  // call so the URL stays in sync with what's on screen.
  const requestModalClose = () => {
    if (state.currentModalKey) {
      // We pushed an entry when opening; pop it back so URL reverts.
      history.back();
    }
  };

  const navigateTo = (pageId, anchorId, options = {}) => {
    const validPage = pages.has(pageId) ? pageId : "home";
    const query = new URLSearchParams();
    if (options.pathway) {
      query.set("pathway", options.pathway);
    }
    if (options.workshop) {
      query.set("workshop", options.workshop);
    }
    if (validPage === "explore" && Object.prototype.hasOwnProperty.call(options, "searchQuery")) {
      const q = (options.searchQuery || "").trim();
      if (q) {
        query.set("q", q);
      }
    }
    if (validPage === "support" && options.supportSearch) {
      query.set("q", options.supportSearch);
    }
    const queryString = query.toString();
    const nextHash = `${pageToHash(validPage)}${queryString ? `?${queryString}` : ""}`;
    const sameHash = window.location.hash === nextHash;
    state.pendingPathwayKey = validPage === "explore"
      ? (options.pathway || "").toLowerCase()
      : "";
    state.pendingWorkshopId = validPage === "explore" ? (options.workshop || "") : "";
    state.pendingExploreSearch = validPage === "explore" ? (options.searchQuery || "") : "";
    state.pendingSupportSearch = validPage === "support" ? (options.supportSearch || "") : "";

    showPage(validPage, anchorId);

    if (!sameHash) {
      state.suppressNextHashChange = true;
      window.location.hash = nextHash;
    }
  };

  const applyStageFilter = (stage) => {
    const explorePage = pages.get("explore");
    if (explorePage && explorePage.applyStageFilter) {
      explorePage.applyStageFilter(stage);
    } else {
      state.pendingStage = stage;
    }
  };

  const parseRouteFromHash = (hashValue) => {
    const raw = (hashValue || "").replace("#", "");
    if (!raw) {
      return { page: "home", params: new URLSearchParams(), anchorId: "" };
    }
    if (supportAnchorIds.has(raw)) {
      return { page: "support", params: new URLSearchParams(), anchorId: raw };
    }
    const [pagePart, queryPart = ""] = raw.split("?");
    const page = pagePart && pages.has(pagePart) ? pagePart : "home";
    return { page, params: new URLSearchParams(queryPart), anchorId: "" };
  };

  const init = async () => {
    await Promise.all([
      loadWorkshopContent(),
      loadExploreContentFromSheets(),
      loadLearnGuideContent()
    ]);
    await loadPathwaysVisionContent();
    buildHeader();
    buildContextBar();
    buildFooter();
    buildPages();

    const initialRoute = parseRouteFromHash(window.location.hash);

    // B-05: cold-loading a modal URL (e.g. `#explore?service=X` from a bookmark
    // or browser history) leaves no in-SPA entry behind it, so the modal's
    // "Back to All Resources" button — which calls history.back() — exits the
    // site instead of landing on Explore. Inject a synthetic underlying-page
    // entry so back-navigation has somewhere to go.
    if (initialRoute.page === "explore" && initialRoute.params.get("service")) {
      const entryHash = window.location.hash;
      history.replaceState(history.state, "", "#explore");
      history.pushState(history.state, "", entryHash);
    }

    if (initialRoute.page === "explore") {
      state.pendingPathwayKey = (initialRoute.params.get("pathway") || "").toLowerCase();
    }
    if (initialRoute.page === "explore") {
      state.pendingWorkshopId = initialRoute.params.get("workshop") || "";
      state.pendingExploreSearch = initialRoute.params.get("q") || "";
      state.pendingExploreTab = initialRoute.params.get("tab") || "";
    }
    if (initialRoute.page === "support") {
      state.pendingSupportSearch = initialRoute.params.get("q") || "";
    }
    showPage(initialRoute.page, initialRoute.anchorId);

    window.addEventListener("hashchange", () => {
      if (state.suppressNextHashChange) {
        state.suppressNextHashChange = false;
        return;
      }
      const nextRoute = parseRouteFromHash(window.location.hash);
      state.pendingPathwayKey = nextRoute.page === "explore"
        ? (nextRoute.params.get("pathway") || "").toLowerCase()
        : "";
      state.pendingWorkshopId = nextRoute.page === "explore"
        ? (nextRoute.params.get("workshop") || "")
        : "";
      state.pendingExploreSearch = nextRoute.page === "explore"
        ? (nextRoute.params.get("q") || "")
        : "";
      state.pendingExploreTab = nextRoute.page === "explore"
        ? (nextRoute.params.get("tab") || "")
        : "";
      state.pendingSupportSearch = nextRoute.page === "support"
        ? (nextRoute.params.get("q") || "")
        : "";
      showPage(nextRoute.page, nextRoute.anchorId);
    });

    window.applyStageFilter = applyStageFilter;
  };

  init();
})();
