/* Review layer for the Narrative CV guide review copy.
   - Two views: Review (change markers, highlights, comment panel) and Reference (the page as AEM should show it).
   - Change markers come from <!--rv:ID--> comments the build inserts next to each edit.
   - Comments anchor to text by quote + context, so they survive markup changes.
   - Storage: RV_CONFIG.storage.backend = "local" (this browser only) or "sheet" (Apps Script webhook + published tab).
*/
(function () {
  "use strict";
  const CFG = window.RV_CONFIG || { changes: {}, seeds: [], storage: { backend: "local" } };
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const main = $("main");
  if (!main) return;

  const TYPES = { error: "Error", question: "Question", suggestion: "Suggestion", approve: "Looks right", proposal: "Proposal" };
  const GROUPS = { A: "Build error", B: "Factual, verified", C: "Copy" };
  const state = { view: "review", rows: [], panelOpen: false, tab: "comments", filter: "open", active: null, backend: "local", backendNote: "" };

  // ---------------------------------------------------------------- utilities
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const norm = (s) => String(s || "").replace(/\s+/g, " ");
  const uid = () => "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const ls = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } },
  };
  const fmtDate = (ts) => { const d = new Date(ts); return isNaN(d) ? "" : d.toLocaleString("en-CA", { dateStyle: "medium", timeStyle: "short" }); };
  let toastTimer;
  function toast(msg) {
    let t = $(".rv-toast"); if (!t) { t = document.createElement("div"); t.className = "rv-toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
    t.textContent = msg; clearTimeout(toastTimer); toastTimer = setTimeout(() => t.remove(), 2600);
  }
  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); return true; } catch (e) {
      const ta = document.createElement("textarea"); ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0"; document.body.appendChild(ta); ta.select();
      let ok = false; try { ok = document.execCommand("copy"); } catch (e2) { ok = false; } ta.remove(); return ok;
    }
  }
  function parseCSV(text) {
    const rows = []; let row = [], field = "", q = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (q) { if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else q = false; } else field += c; }
      else if (c === '"') q = true;
      else if (c === ",") { row.push(field); field = ""; }
      else if (c === "\n" || c === "\r") { if (c === "\r" && text[i + 1] === "\n") i++; row.push(field); rows.push(row); row = []; field = ""; }
      else field += c;
    }
    if (field.length || row.length) { row.push(field); rows.push(row); }
    if (!rows.length) return [];
    const head = rows[0].map((h) => h.trim());
    return rows.slice(1).filter((r) => r.some((v) => v !== "")).map((r) => Object.fromEntries(head.map((h, i) => [h, r[i] == null ? "" : r[i]])));
  }

  // ---------------------------------------------------------------- storage
  const store = {
    backend: (CFG.storage && CFG.storage.backend) || "local",
    page: (CFG.storage && CFG.storage.page) || "ncv-guide",
    key: "rv.rows." + ((CFG.storage && CFG.storage.page) || "ncv-guide"),
    async load() {
      const local = ls.get(this.key, []);
      if (this.backend !== "sheet" || !CFG.storage.readUrl) { state.backend = "local"; return local; }
      try {
        const r = await fetch(CFG.storage.readUrl, { cache: "no-store" });
        if (!r.ok) throw new Error("HTTP " + r.status);
        const body = await r.text();
        let rows = [];
        try { const j = JSON.parse(body); rows = Array.isArray(j) ? j : j.rows || []; } catch (e) { rows = parseCSV(body); }
        rows = rows.filter((x) => !x.page || x.page === this.page);
        const byId = new Map(rows.map((x) => [x.id, x]));
        local.forEach((x) => { if (!byId.has(x.id)) byId.set(x.id, x); });
        state.backend = "sheet";
        return Array.from(byId.values());
      } catch (e) {
        state.backend = "error"; state.backendNote = String(e.message || e);
        return local;
      }
    },
    async add(row) {
      const local = ls.get(this.key, []); local.push(row); ls.set(this.key, local);
      if (this.backend !== "sheet" || !CFG.storage.writeUrl) return { ok: true, where: "local" };
      try {
        await fetch(CFG.storage.writeUrl, { method: "POST", mode: "cors", headers: { "Content-Type": "text/plain" }, body: JSON.stringify({ action: "review_comment", page: this.page, row }) });
        return { ok: true, where: "sheet" };
      } catch (e) { return { ok: false, where: "local", error: String(e.message || e) }; }
    },
  };

  // ---------------------------------------------------------------- accordions
  function setOpen(btn, open) {
    const panel = document.getElementById(btn.getAttribute("aria-controls")); if (!panel) return;
    btn.setAttribute("aria-expanded", open ? "true" : "false"); btn.classList.toggle("collapsed", !open); panel.classList.toggle("show", open);
  }
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".accordion-button"); if (!btn || !main.contains(btn)) return;
    e.preventDefault(); setOpen(btn, btn.getAttribute("aria-expanded") !== "true");
  });
  const expandAll = (open) => $$(".accordion-button", main).forEach((b) => setOpen(b, open));
  const allOpen = () => $$(".accordion-button", main).every((b) => b.getAttribute("aria-expanded") === "true");
  function revealElement(el) {
    const panel = el.closest(".accordion-collapse"); if (panel) { const btn = $('[aria-controls="' + panel.id + '"]', main); if (btn) setOpen(btn, true); }
    el.scrollIntoView({ block: "center", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }

  // ---------------------------------------------------------------- views
  function setView(v) {
    state.view = v; ls.set("rv.view", v);
    document.body.classList.toggle("rv-view-review", v === "review");
    document.body.classList.toggle("rv-view-reference", v === "reference");
    closePopover(); hideFab();
    if (v === "reference") { expandAll(false); openPanel(false); } else expandAll(true);
    renderBar();
  }

  // ---------------------------------------------------------------- change markers
  const CONTAINER_SEL = "tr, li, .accordion-item, .c-box > .bloc, .c-title, .c-button, .c-anchor-navigation, .c-table, .rte";
  const changeHosts = new Map(); // id -> [element]
  function markChanges() {
    const walker = document.createTreeWalker(main, NodeFilter.SHOW_COMMENT); const found = []; let n;
    while ((n = walker.nextNode())) { const m = /^rv:([A-Z]-\d+)/.exec(n.nodeValue.trim()); if (m) found.push([n, m[1]]); }
    found.forEach(([node, id]) => {
      const el = node.parentElement; if (!el) return;
      const c = el.closest(CONTAINER_SEL) || el;
      const ids = (c.dataset.rvIds || "").split(" ").filter(Boolean);
      if (ids.includes(id)) return;
      ids.push(id); c.dataset.rvIds = ids.join(" "); c.classList.add("rv-changed");
      const host = c.tagName === "TR" ? c.querySelector("td,th") : c;
      host.classList.add("rv-rel");
      const tag = document.createElement("button"); tag.type = "button"; tag.className = "rv-tag"; tag.textContent = id; tag.dataset.rvId = id;
      tag.setAttribute("aria-label", "Change " + id + ": " + ((CFG.changes[id] || {}).title || "changed"));
      if (ids.length > 1 && c.tagName !== "TR") tag.style.right = (8 + (ids.length - 1) * 52) + "px";
      if (c.tagName === "TR") host.prepend(tag); else host.appendChild(tag);
      if (!changeHosts.has(id)) changeHosts.set(id, []); changeHosts.get(id).push(c);
    });
  }
  function cleanHTML(el) {
    const clone = el.cloneNode(true);
    $$(".rv-tag", clone).forEach((t) => t.remove());
    $$("mark.rv-hl", clone).forEach((m) => m.replaceWith(...m.childNodes));
    const w = document.createTreeWalker(clone, NodeFilter.SHOW_COMMENT); const cs = []; let c; while ((c = w.nextNode())) cs.push(c); cs.forEach((x) => x.remove());
    clone.classList.remove("rv-changed", "rv-rel"); delete clone.dataset.rvIds;
    return clone;
  }
  function blockText(el) {
    const clone = cleanHTML(el);
    if (clone.tagName === "TR") return $$("td,th", clone).map((td) => norm(td.textContent).trim()).join("\t");
    if (clone.matches(".c-table") || clone.tagName === "TABLE") return $$("tr", clone).map((tr) => $$("td,th", tr).map((td) => norm(td.textContent).trim()).join("\t")).join("\n");
    $$("br", clone).forEach((br) => br.replaceWith("\n"));
    $$("p, li, h1, h2, h3, h4", clone).forEach((p) => p.append("\n"));
    return clone.textContent.replace(/[ \t]+/g, " ").replace(/\s*\n\s*/g, "\n").trim();
  }

  // ---------------------------------------------------------------- popover
  let popover = null;
  function closePopover() { if (popover) { popover.remove(); popover = null; } }
  function openPopover(anchorRect, html) {
    closePopover();
    popover = document.createElement("div"); popover.className = "rv-popover"; popover.setAttribute("role", "dialog"); popover.innerHTML = html;
    document.body.appendChild(popover);
    const w = popover.offsetWidth; const pad = 8;
    let left = anchorRect.left + window.scrollX; if (left + w > window.scrollX + window.innerWidth - pad) left = window.scrollX + window.innerWidth - w - pad; if (left < pad) left = pad;
    let top = anchorRect.bottom + window.scrollY + 8;
    popover.style.left = left + "px"; popover.style.top = top + "px";
    const first = $("textarea, input, button", popover); if (first) first.focus({ preventScroll: true });
    return popover;
  }
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") { closePopover(); hideFab(); } });
  document.addEventListener("mousedown", (e) => { if (popover && !popover.contains(e.target) && !e.target.closest(".rv-fab, .rv-tag")) closePopover(); });

  function showChange(id, tagEl) {
    const ch = CFG.changes[id] || { title: "Changed", group: "", note: "" };
    const hosts = changeHosts.get(id) || [];
    const host = tagEl.closest(".rv-changed") || hosts[0];
    const html = '<h4><span class="rv-group-' + esc(ch.group) + '">' + esc(GROUPS[ch.group] || ch.group) + "</span>" + esc(id) + " · " + esc(ch.title) + "</h4>"
      + (ch.note ? '<p class="rv-note">' + esc(ch.note) + "</p>" : "")
      + '<p class="rv-meta">Copy the corrected block for the AEM editor.' + (hosts.length > 1 ? " This change touches " + hosts.length + " blocks; this copies the one you clicked." : "") + "</p>"
      + '<div class="rv-row"><button type="button" class="rv-b rv-b--primary" data-act="copy-text">Copy text</button><button type="button" class="rv-b" data-act="copy-html">Copy HTML</button><span class="rv-grow"></span><button type="button" class="rv-b" data-act="close">Close</button></div>';
    const p = openPopover(tagEl.getBoundingClientRect(), html);
    p.addEventListener("click", async (e) => {
      const b = e.target.closest("[data-act]"); if (!b) return;
      if (b.dataset.act === "close") return closePopover();
      const ok = await copyText(b.dataset.act === "copy-text" ? blockText(host) : cleanHTML(host).innerHTML.replace(/\n\s*\n/g, "\n").trim());
      toast(ok ? "Copied" : "Copy failed: select the text and copy it by hand");
    });
  }
  document.addEventListener("click", (e) => { const t = e.target.closest(".rv-tag"); if (t) { e.preventDefault(); showChange(t.dataset.rvId, t); } });

  // ---------------------------------------------------------------- text index and anchors
  function textNodes(root) {
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.parentElement && n.parentElement.closest(".rv-tag, .rv-popover, script, style") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT) });
    const out = []; let n; while ((n = w.nextNode())) out.push(n); return out;
  }
  function buildIndex() {
    const spans = []; let raw = ""; let normText = ""; const map = []; let lastSpace = true;
    for (const node of textNodes(main)) {
      const start = raw.length; const d = node.data;
      for (let i = 0; i < d.length; i++) {
        const ch = d[i]; const ws = /\s/.test(ch);
        if (ws) { if (!lastSpace) { normText += " "; map.push(raw.length + i); lastSpace = true; } }
        else { normText += ch; map.push(raw.length + i); lastSpace = false; }
      }
      raw += d; spans.push({ node, start, end: raw.length });
    }
    map.push(raw.length);
    return { raw, normText, map, spans };
  }
  function rawOffsetOf(container, offset, spans) {
    if (container.nodeType === 3) { const s = spans.find((x) => x.node === container); return s ? s.start + offset : null; }
    const child = container.childNodes[offset]; const nodes = child ? textNodes(child.nodeType === 3 ? child.parentNode : child) : [];
    const first = child && child.nodeType === 3 ? child : nodes[0];
    if (first) { const s = spans.find((x) => x.node === first); return s ? s.start : null; }
    const prev = container.childNodes[offset - 1]; if (prev) { const pn = textNodes(prev.nodeType === 3 ? prev.parentNode : prev); const last = prev.nodeType === 3 ? prev : pn[pn.length - 1]; const s = last && spans.find((x) => x.node === last); return s ? s.end : null; }
    return null;
  }
  function anchorFromRange(range, idx) {
    const quote = norm(range.toString()).trim(); if (!quote) return null;
    let s = rawOffsetOf(range.startContainer, range.startOffset, idx.spans);
    const ni = s == null ? -1 : idx.map.findIndex((v) => v >= s);
    let pos = ni >= 0 ? idx.normText.indexOf(quote, Math.max(0, ni - 2)) : -1;
    if (pos < 0) pos = idx.normText.indexOf(quote);
    const prefix = pos >= 0 ? idx.normText.slice(Math.max(0, pos - 32), pos) : "";
    const suffix = pos >= 0 ? idx.normText.slice(pos + quote.length, pos + quote.length + 32) : "";
    const h2 = nearestHeading(range.startContainer);
    return { quote, prefix, suffix, section: h2 };
  }
  function nearestHeading(node) {
    const el = node.nodeType === 3 ? node.parentElement : node;
    const sect = el && el.closest(".c-grid-container"); const h = sect && $("h2", sect);
    return h ? norm(h.textContent).trim() : "";
  }
  function locate(anchor, idx) {
    const q = norm(anchor.quote).trim(); if (!q) return null;
    const hits = []; let p = idx.normText.indexOf(q); while (p >= 0) { hits.push(p); p = idx.normText.indexOf(q, p + 1); }
    if (!hits.length) return null;
    let best = hits[0], bestScore = -1;
    for (const h of hits) {
      const pre = idx.normText.slice(Math.max(0, h - 32), h), suf = idx.normText.slice(h + q.length, h + q.length + 32);
      const score = commonSuffix(pre, anchor.prefix || "") + commonPrefix(suf, anchor.suffix || "");
      if (score > bestScore) { bestScore = score; best = h; }
    }
    return { start: idx.map[best], end: idx.map[best + q.length - 1] + 1 };
  }
  const commonPrefix = (a, b) => { let i = 0; while (i < a.length && i < b.length && a[i] === b[i]) i++; return i; };
  const commonSuffix = (a, b) => { let i = 0; while (i < a.length && i < b.length && a[a.length - 1 - i] === b[b.length - 1 - i]) i++; return i; };

  function wrapRange(start, end, idx, attrs) {
    for (let k = idx.spans.length - 1; k >= 0; k--) {
      const sp = idx.spans[k]; if (sp.end <= start || sp.start >= end) continue;
      const a = Math.max(start, sp.start) - sp.start, b = Math.min(end, sp.end) - sp.start;
      let node = sp.node; if (b < node.data.length) node.splitText(b); if (a > 0) node = node.splitText(a);
      const m = document.createElement("mark"); m.className = "rv-hl " + (attrs.cls || ""); m.dataset.cid = attrs.cid; m.setAttribute("role", "button"); m.setAttribute("tabindex", "0");
      m.title = attrs.title || "Comment"; node.parentNode.insertBefore(m, node); m.appendChild(node);
    }
  }
  function unwrapAll() { $$("mark.rv-hl", main).forEach((m) => m.replaceWith(...m.childNodes)); main.normalize(); }

  // ---------------------------------------------------------------- comments model
  function threads() {
    const roots = state.rows.filter((r) => !r.parent && r.kind !== "status").map((r) => ({ ...r, replies: [], status: r.status || "open" }));
    const byId = new Map(roots.map((t) => [t.id, t]));
    state.rows.slice().sort((a, b) => (a.ts || "").localeCompare(b.ts || "")).forEach((r) => {
      if (!r.parent) return; const t = byId.get(r.parent); if (!t) return;
      if (r.kind === "status") t.status = r.status || "open"; else t.replies.push(r);
    });
    return roots.sort((a, b) => (a.ts || "").localeCompare(b.ts || ""));
  }
  const located = new Map(); // id -> boolean
  function renderComments() {
    unwrapAll(); located.clear();
    const idx = buildIndex();
    const ts = threads().map((t) => ({ t, loc: locate(t, idx) })).filter((x) => { located.set(x.t.id, !!x.loc); return !!x.loc; });
    ts.sort((a, b) => b.loc.start - a.loc.start);
    ts.forEach(({ t, loc }) => wrapRange(loc.start, loc.end, idx, { cid: t.id, cls: (t.status === "resolved" ? "is-resolved " : "") + (t.type === "proposal" ? "is-proposal " : "") + (state.active === t.id ? "is-active" : ""), title: (TYPES[t.type] || "Comment") + " by " + (t.author || "anonymous") }));
    renderPanel(); renderBar();
    if (state.active && panel && state.panelOpen) { const c = $('.rv-card[data-id="' + state.active + '"]', panel); if (c) c.scrollIntoView({ block: "nearest" }); }
  }
  async function addRow(row) {
    row.id = row.id || uid(); row.ts = row.ts || new Date().toISOString(); row.page = store.page;
    state.rows.push(row);
    const res = await store.add(row);
    if (res.where === "sheet") toast("Saved to the review sheet"); else if (state.backend === "sheet") toast("Saved here only: the sheet did not answer" + (res.error ? " (" + res.error + ")" : "")); else toast("Saved in this browser");
    renderComments();
  }

  // ---------------------------------------------------------------- selection -> fab -> composer
  let fab = null; let pendingRange = null;
  function hideFab() { if (fab) { fab.remove(); fab = null; } pendingRange = null; }
  function onSelect() {
    if (state.view !== "review") return;
    const sel = window.getSelection(); if (!sel || sel.isCollapsed || !sel.rangeCount) { hideFab(); return; }
    const r = sel.getRangeAt(0); if (!main.contains(r.commonAncestorContainer)) { hideFab(); return; }
    if (!norm(r.toString()).trim()) { hideFab(); return; }
    pendingRange = r.cloneRange();
    const rects = r.getClientRects(); const rect = rects.length ? rects[rects.length - 1] : r.getBoundingClientRect();
    if (!fab) { fab = document.createElement("button"); fab.type = "button"; fab.className = "rv-fab"; fab.textContent = "Comment on this"; document.body.appendChild(fab); fab.addEventListener("mousedown", (e) => e.preventDefault()); fab.addEventListener("click", openComposer); }
    fab.style.left = Math.min(rect.right + window.scrollX + 6, window.scrollX + window.innerWidth - 150) + "px";
    fab.style.top = (rect.bottom + window.scrollY + 6) + "px";
  }
  document.addEventListener("mouseup", () => setTimeout(onSelect, 10));
  document.addEventListener("keyup", (e) => { if (e.shiftKey || e.key === "Shift") setTimeout(onSelect, 10); });
  document.addEventListener("selectionchange", () => { const s = window.getSelection(); if (fab && (!s || s.isCollapsed)) hideFab(); });

  function openComposer() {
    if (!pendingRange) return;
    const idx = buildIndex(); const anchor = anchorFromRange(pendingRange, idx); if (!anchor) return;
    const rect = pendingRange.getBoundingClientRect(); const name = ls.get("rv.author", "");
    const html = "<h4>New comment</h4><p class=\"rv-quote\">" + esc(anchor.quote) + "</p>"
      + '<label for="rv-name">Your name</label><input type="text" id="rv-name" value="' + esc(name) + '" placeholder="So we know who to follow up with" autocomplete="name">'
      + '<label for="rv-type">Kind</label><select id="rv-type"><option value="error">Error or typo</option><option value="question">Question</option><option value="suggestion">Suggestion</option><option value="approve">Looks right</option></select>'
      + '<label for="rv-text">Comment</label><textarea id="rv-text" placeholder="What is wrong, or what should change?"></textarea><div class="rv-err" hidden></div>'
      + '<div class="rv-row"><button type="button" class="rv-b rv-b--primary" data-act="save">Save comment</button><span class="rv-grow"></span><button type="button" class="rv-b" data-act="cancel">Cancel</button></div>';
    const p = openPopover(rect, html); hideFab(); $("#rv-text", p).focus();
    p.addEventListener("click", async (e) => {
      const b = e.target.closest("[data-act]"); if (!b) return;
      if (b.dataset.act === "cancel") return closePopover();
      const author = $("#rv-name", p).value.trim(), text = $("#rv-text", p).value.trim(), type = $("#rv-type", p).value, err = $(".rv-err", p);
      if (!text) { err.textContent = "Write the comment first."; err.hidden = false; return; }
      ls.set("rv.author", author); closePopover(); window.getSelection().removeAllRanges();
      await addRow({ kind: "comment", type, author: author || "anonymous", text, ...anchor });
      state.active = state.rows[state.rows.length - 1].id; openPanel(true, "comments"); renderComments();
    });
  }

  // ---------------------------------------------------------------- panel
  let panel = null;
  function ensurePanel() {
    if (panel) return panel;
    panel = document.createElement("aside"); panel.className = "rv-panel"; panel.setAttribute("aria-label", "Review panel");
    panel.innerHTML = '<div class="rv-panel__head"><h3>Review</h3><button type="button" class="rv-b" data-act="close">Close</button></div>'
      + '<div class="rv-panel__tabs"><button type="button" class="rv-tab" data-tab="comments">Comments</button><button type="button" class="rv-tab" data-tab="changes">Changes</button></div>'
      + '<div class="rv-panel__tools"></div><div class="rv-panel__body"></div>';
    document.body.appendChild(panel);
    panel.addEventListener("click", onPanelClick);
    return panel;
  }
  function openPanel(open, tab) { ensurePanel(); state.panelOpen = open; if (tab) state.tab = tab; panel.classList.toggle("is-open", open); renderPanel(); renderBar(); }
  function renderPanel() {
    if (!panel) return;
    $$(".rv-tab", panel).forEach((t) => t.classList.toggle("is-on", t.dataset.tab === state.tab));
    const tools = $(".rv-panel__tools", panel), body = $(".rv-panel__body", panel);
    if (state.tab === "changes") {
      const ids = Object.keys(CFG.changes).filter((id) => changeHosts.has(id)).sort(sortIds);
      tools.innerHTML = '<span class="rv-meta">' + ids.length + " changes against the AEM page. Click a tag on the page, or Go to, then Copy text for the editor.</span>";
      body.innerHTML = ids.map((id) => { const c = CFG.changes[id]; return '<div class="rv-change"><span class="rv-change__id">' + esc(id) + '</span><div class="rv-change__title">' + esc(c.title) + "<small>" + esc(GROUPS[c.group] || "") + (c.note ? " · " + esc(c.note) : "") + '</small></div><button type="button" class="rv-b" data-act="goto-change" data-id="' + esc(id) + '">Go to</button></div>'; }).join("");
      return;
    }
    const all = threads(); const open = all.filter((t) => t.status !== "resolved"), done = all.filter((t) => t.status === "resolved");
    const list = state.filter === "open" ? open : state.filter === "resolved" ? done : all;
    tools.innerHTML = '<button type="button" class="rv-b' + (state.filter === "open" ? " rv-b--primary" : "") + '" data-act="filter" data-v="open">Open (' + open.length + ")</button>"
      + '<button type="button" class="rv-b' + (state.filter === "resolved" ? " rv-b--primary" : "") + '" data-act="filter" data-v="resolved">Resolved (' + done.length + ")</button>"
      + '<button type="button" class="rv-b' + (state.filter === "all" ? " rv-b--primary" : "") + '" data-act="filter" data-v="all">All</button>'
      + '<button type="button" class="rv-b" data-act="export" title="Copies every comment as Markdown">Copy all as Markdown</button>';
    if (!list.length) { body.innerHTML = '<p class="rv-panel__empty">Nothing here yet. Select any text on the page and choose <b>Comment on this</b>.</p>'; return; }
    body.innerHTML = list.map(cardHTML).join("");
  }
  function cardHTML(t) {
    const orphan = located.get(t.id) === false;
    return '<div class="rv-card' + (t.status === "resolved" ? " is-resolved" : "") + (state.active === t.id ? " is-active" : "") + '" data-id="' + esc(t.id) + '">'
      + '<div class="rv-card__meta"><span class="rv-chip rv-chip--' + esc(t.type || "question") + '">' + esc(TYPES[t.type] || "Comment") + "</span>" + (t.status === "resolved" ? '<span class="rv-chip rv-chip--resolved">Resolved</span>' : "") + "<b>" + esc(t.author || "anonymous") + "</b><span>" + esc(fmtDate(t.ts)) + "</span>" + (t.section ? "<span>· " + esc(t.section) + "</span>" : "") + "</div>"
      + '<p class="rv-card__quote' + (orphan ? " is-orphan" : "") + '" title="' + (orphan ? "This passage is no longer on the page" : "") + '">' + (orphan ? "[passage not found] " : "") + esc(t.quote) + "</p>"
      + '<p class="rv-card__text">' + esc(t.text) + "</p>"
      + (t.replies.length ? '<div class="rv-card__replies">' + t.replies.map((r) => '<div class="rv-card__reply"><div class="rv-card__meta"><b>' + esc(r.author || "anonymous") + "</b><span>" + esc(fmtDate(r.ts)) + '</span></div><p class="rv-card__text">' + esc(r.text) + "</p></div>").join("") + "</div>" : "")
      + '<div class="rv-card__actions">' + (orphan ? "" : '<button type="button" class="rv-b" data-act="goto">Go to</button>') + '<button type="button" class="rv-b" data-act="reply">Reply</button><button type="button" class="rv-b" data-act="resolve">' + (t.status === "resolved" ? "Reopen" : "Resolve") + "</button></div>"
      + '<div class="rv-card__replybox" hidden><textarea placeholder="Reply"></textarea><div class="rv-card__actions"><button type="button" class="rv-b rv-b--primary" data-act="send-reply">Send</button><button type="button" class="rv-b" data-act="cancel-reply">Cancel</button></div></div></div>';
  }
  async function onPanelClick(e) {
    const b = e.target.closest("[data-act], .rv-tab"); if (!b) return;
    if (b.classList.contains("rv-tab")) { state.tab = b.dataset.tab; renderPanel(); return; }
    const card = b.closest(".rv-card"); const id = card && card.dataset.id;
    switch (b.dataset.act) {
      case "close": return openPanel(false);
      case "filter": state.filter = b.dataset.v; return renderPanel();
      case "export": { const ok = await copyText(exportMarkdown()); toast(ok ? "Copied all comments as Markdown" : "Copy failed"); return; }
      case "goto-change": { const hosts = changeHosts.get(b.dataset.id) || []; if (hosts[0]) { revealElement(hosts[0]); hosts[0].classList.add("rv-flash"); } return; }
      case "goto": { state.active = id; const m = $('mark.rv-hl[data-cid="' + id + '"]', main); if (m) revealElement(m); renderComments(); return; }
      case "reply": { $(".rv-card__replybox", card).hidden = false; $("textarea", card).focus(); return; }
      case "cancel-reply": { $(".rv-card__replybox", card).hidden = true; return; }
      case "send-reply": {
        const text = $("textarea", card).value.trim(); if (!text) return;
        const author = ls.get("rv.author", "") || prompt("Your name") || "anonymous"; ls.set("rv.author", author);
        await addRow({ kind: "reply", parent: id, author, text }); return;
      }
      case "resolve": {
        const t = threads().find((x) => x.id === id); const author = ls.get("rv.author", "") || prompt("Your name") || "anonymous"; ls.set("rv.author", author);
        await addRow({ kind: "status", parent: id, author, status: t && t.status === "resolved" ? "open" : "resolved", text: "" }); return;
      }
    }
  }
  main.addEventListener("click", (e) => { const m = e.target.closest("mark.rv-hl"); if (!m) return; state.active = m.dataset.cid; openPanel(true, "comments"); renderComments(); const c = $('.rv-card[data-id="' + state.active + '"]', panel); if (c) c.scrollIntoView({ block: "nearest" }); });
  main.addEventListener("keydown", (e) => { if ((e.key === "Enter" || e.key === " ") && e.target.matches("mark.rv-hl")) { e.preventDefault(); e.target.click(); } });
  function sortIds(a, b) { const [pa, na] = a.split("-"), [pb, nb] = b.split("-"); return pa === pb ? (+na - +nb) : pa.localeCompare(pb); }
  function exportMarkdown() {
    const all = threads(); const lines = ["# Narrative CV guide review copy: comments", "", "Exported " + new Date().toISOString().slice(0, 16).replace("T", " ") + " · " + all.length + " threads", ""];
    all.forEach((t) => {
      lines.push("## " + (TYPES[t.type] || "Comment") + " · " + (t.author || "anonymous") + " · " + fmtDate(t.ts) + (t.status === "resolved" ? " · resolved" : ""));
      if (t.section) lines.push("Section: " + t.section);
      lines.push("> " + t.quote); lines.push(""); lines.push(t.text); lines.push("");
      t.replies.forEach((r) => { lines.push("- **" + (r.author || "anonymous") + "** (" + fmtDate(r.ts) + "): " + r.text); });
      lines.push("");
    });
    return lines.join("\n");
  }

  // ---------------------------------------------------------------- bar
  const bar = $("#rv-bar");
  function renderBar() {
    if (!bar) return;
    const nChanges = changeHosts.size; const all = threads(); const nOpen = all.filter((t) => t.status !== "resolved").length;
    const status = state.backend === "sheet" ? "Comments save to the review sheet" : state.backend === "error" ? "Sheet unreachable: comments stay in this browser" : "Comments stay in this browser only";
    bar.innerHTML = '<span class="rv-bar__title">Review copy · Narrative CV guide<small>' + esc(CFG.snapshot || "") + "</small></span>"
      + '<span class="rv-seg" role="group" aria-label="View"><button type="button" class="rv-btn' + (state.view === "review" ? " is-on" : "") + '" data-act="view" data-v="review">Review</button><button type="button" class="rv-btn' + (state.view === "reference" ? " is-on" : "") + '" data-act="view" data-v="reference">Reference</button></span>'
      + '<button type="button" class="rv-btn" data-act="expand">' + (allOpen() ? "Collapse all" : "Expand all") + "</button>"
      + '<span class="rv-bar__spacer"></span>'
      + (state.view === "review" ? '<button type="button" class="rv-btn' + (state.panelOpen && state.tab === "changes" ? " is-on" : "") + '" data-act="panel" data-tab="changes">Changes<span class="rv-count">' + nChanges + "</span></button>"
        + '<button type="button" class="rv-btn' + (state.panelOpen && state.tab === "comments" ? " is-on" : "") + '" data-act="panel" data-tab="comments">Comments<span class="rv-count">' + nOpen + "</span></button>"
        + '<span class="rv-status' + (state.backend === "sheet" ? " is-sheet" : state.backend === "error" ? " is-error" : "") + '" title="' + esc(state.backendNote) + '">' + status + "</span>"
        : '<span class="rv-status">Reference view: the page as the AEM editor should reproduce it</span>');
  }
  if (bar) bar.addEventListener("click", (e) => {
    const b = e.target.closest("[data-act]"); if (!b) return;
    if (b.dataset.act === "view") setView(b.dataset.v);
    else if (b.dataset.act === "expand") { expandAll(!allOpen()); renderBar(); }
    else if (b.dataset.act === "panel") openPanel(!(state.panelOpen && state.tab === b.dataset.tab), b.dataset.tab);
  });

  // ---------------------------------------------------------------- init
  async function init() {
    markChanges();
    const seeds = (CFG.seeds || []).map((s) => ({ kind: "comment", ts: "2026-09-21T12:00:00.000Z", status: "open", ...s }));
    state.rows = seeds.concat(await store.load());
    setView(ls.get("rv.view", "review"));
    renderComments();
    const missing = seeds.filter((s) => located.get(s.id) === false).map((s) => s.id);
    if (missing.length) console.warn("Seeded comments not found on the page:", missing);
  }
  init();
})();
