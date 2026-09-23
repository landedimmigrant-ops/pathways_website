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
  const state = { view: "review", rows: [], panelOpen: false, tab: "comments", filter: "open", aemFilter: "todo", active: null, backend: "local", backendNote: "" };

  // ---------------------------------------------------------------- utilities
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const norm = (s) => String(s || "").replace(/\s+/g, " ");
  const uid = () => "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const ls = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } },
  };
  function requireName() {
    var a = String(ls.get("rv.author", "") || "").trim();
    if (a) return a;
    a = String(prompt("Your name (so we know who to follow up with)") || "").trim();
    if (!a) { toast("Add your name to post a comment"); return null; }
    ls.set("rv.author", a); return a;
  }
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
        const hidden = new Set(CFG.hidden || []);
        rows = rows.filter((x) => (!x.page || x.page === this.page) && !hidden.has(x.id) && !hidden.has(x.parent));
        const byId = new Map(rows.map((x) => [x.id, x]));
        // `local` is an outbox of rows whose write did not confirm, never a mirror of
        // the sheet: a row deleted in the sheet must disappear for its author too.
        // An unsent row is worth re-showing only while a retry is plausible. Past that
        // it is indistinguishable from a row deleted in the sheet, so let it go.
        const FRESH_MS = 60 * 60 * 1000;
        const pending = local.filter((x) => !byId.has(x.id) && Date.now() - Date.parse(x.ts || 0) < FRESH_MS);
        ls.set(this.key, pending);
        pending.forEach((x) => byId.set(x.id, x));
        state.backend = "sheet";
        return Array.from(byId.values());
      } catch (e) {
        state.backend = "error"; state.backendNote = String(e.message || e);
        return local;
      }
    },
    async add(row) {
      const keep = (r) => { const l = ls.get(this.key, []); l.push(r); ls.set(this.key, l); };
      const drop = (id) => ls.set(this.key, ls.get(this.key, []).filter((x) => x.id !== id));
      keep(row);
      if (this.backend !== "sheet" || !CFG.storage.writeUrl) return { ok: true, where: "local" };
      try {
        await fetch(CFG.storage.writeUrl, { method: "POST", mode: "cors", headers: { "Content-Type": "text/plain" }, body: JSON.stringify({ action: "review_comment", page: this.page, row }) });
        drop(row.id); // it lives in the sheet now; the outbox keeps only what did not send
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
  // AEM copy mode: off for reviewers (page + comments only); on for whoever pastes into AEM
  // (every change tagged, any block copyable, comment tools out of the way).
  function setAem(on) {
    state.aem = !!on; ls.set("rv.aem", state.aem);
    document.body.classList.toggle("rv-aem", state.aem);
    if (!state.aem) { state.aemFilter = "todo"; document.body.classList.remove("rv-aem-showdone"); }
    closePopover(); hideFab(); clearHover();
    state.tab = state.aem ? "changes" : "comments";
    if (state.panelOpen) { renderPanel(); alignActive(); }
    expandAll(true);
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
  document.addEventListener("mousedown", (e) => { if (popover && !popover.contains(e.target) && !e.target.closest(".rv-fab, .rv-tag, .rv-copychip")) closePopover(); });

  function showCopy(host, rect, headingHtml, extraHtml, changeId) {
    const preview = blockText(host).replace(/\s+/g, " ").trim();
    const st = changeId ? changeStatus(changeId) : null;
    const line = !st ? "" : st.done ? '<p class="rv-meta rv-aem-line is-done">Done in AEM · ' + esc(st.row.author) + ", " + esc(fmtDate(st.row.ts)) + "</p>"
      : st.stale ? '<p class="rv-meta rv-aem-line is-stale">Changed since ' + esc(st.row.author) + " copied it on " + esc(fmtDate(st.row.ts)) + ". Copy it again.</p>" : "";
    const aemBtn = !st ? "" : st.done ? '<button type="button" class="rv-b" data-act="aem-reopen">Back to To do</button>'
      : '<button type="button" class="rv-b rv-b--done" data-act="aem-done">Mark done in AEM</button>';
    const html = "<h4>" + headingHtml + "</h4>" + (extraHtml || "") + line
      + '<p class="rv-quote">' + esc(preview.length > 160 ? preview.slice(0, 160) + "…" : preview) + "</p>"
      + '<div class="rv-row"><button type="button" class="rv-b rv-b--primary" data-act="copy-text">Copy text</button><button type="button" class="rv-b" data-act="copy-html">Copy HTML</button>' + aemBtn + '<span class="rv-grow"></span><button type="button" class="rv-b" data-act="close">Close</button></div>';
    const p = openPopover(rect, html);
    p.addEventListener("click", async (e) => {
      const b = e.target.closest("[data-act]"); if (!b) return;
      if (b.dataset.act === "close") return closePopover();
      if (b.dataset.act === "aem-done" || b.dataset.act === "aem-reopen") { closePopover(); return markAem(changeId, b.dataset.act === "aem-done"); }
      const ok = await copyText(b.dataset.act === "copy-text" ? blockText(host) : cleanHTML(host).innerHTML.replace(/\n\s*\n/g, "\n").trim());
      const done = $('[data-act="aem-done"]', p);
      if (ok && done) { $$(".rv-b--primary", p).forEach((x) => x.classList.remove("rv-b--primary")); done.classList.add("rv-b--primary"); }
      toast(!ok ? "Copy failed: select the text and copy it by hand" : done ? "Copied. Once it is in AEM, choose Mark done." : "Copied");
    });
  }
  function showChange(id, tagEl) {
    const ch = CFG.changes[id] || { title: "Changed", group: "", note: "" };
    const hosts = changeHosts.get(id) || [];
    const host = tagEl.closest(".rv-changed") || hosts[0];
    showCopy(host, tagEl.getBoundingClientRect(),
      '<span class="rv-group-' + esc(ch.group) + '">' + esc(GROUPS[ch.group] || ch.group) + "</span>" + esc(id) + " · " + esc(ch.title),
      (ch.note ? '<p class="rv-note">' + esc(ch.note) + "</p>" : "")
      + (hosts.length > 1 ? '<p class="rv-meta">This change touches ' + hosts.length + " blocks; this copies the one you clicked.</p>" : ""), id);
  }

  // ---------------------------------------------------------------- AEM progress: "done in AEM" marks
  // Marked by hand after pasting, saved as rows (kind "aem", parent "chg:<id>") next to the comments.
  // Each mark carries a fingerprint of the change's text: if that text is edited later, the change
  // goes back to To do, so a stale paste never passes as done.
  function fnv(str) { let h = 0x811c9dc5; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16).padStart(8, "0"); }
  const changePrint = (id) => "v:" + fnv((changeHosts.get(id) || []).map(blockText).join("\n"));
  function aemMarks() {
    const m = new Map();
    state.rows.filter((r) => r.kind === "aem" && String(r.parent || "").startsWith("chg:"))
      .sort((a, b) => (a.ts || "").localeCompare(b.ts || "")).forEach((r) => m.set(r.parent.slice(4), r));
    return m;
  }
  function changeStatus(id, marks) {
    const r = (marks || aemMarks()).get(id);
    if (!r || r.status !== "done") return { done: false, stale: false, row: r || null };
    const stale = !!r.quote && r.quote !== changePrint(id);
    return { done: !stale, stale, row: r };
  }
  function paintAem() {
    const marks = aemMarks();
    $$(".rv-tag", main).forEach((t) => { const st = changeStatus(t.dataset.rvId, marks); t.classList.toggle("is-done", st.done); t.classList.toggle("is-stale", st.stale); });
    $$(".rv-changed", main).forEach((c) => { const ids = (c.dataset.rvIds || "").split(" ").filter(Boolean); c.classList.toggle("rv-done", ids.length > 0 && ids.every((id) => changeStatus(id, marks).done)); });
  }
  async function markAem(id, done) {
    const author = requireName(); if (!author) return;
    const row = { id: uid(), ts: new Date().toISOString(), page: store.page, kind: "aem", parent: "chg:" + id, status: done ? "done" : "open",
      author, text: done ? "Marked done in AEM" : "Put back to To do", quote: changePrint(id), type: "", prefix: "", suffix: "", section: "" };
    state.rows.push(row);
    const res = await store.add(row);
    toast((done ? id + " marked done in AEM" : id + " is back on the To do list") + (res.where === "sheet" ? "" : " (saved in this browser only)"));
    paintAem(); renderPanel(); renderBar();
  }

  // Any block, in copy mode: hover shows a Copy handle. Changed blocks use their tag instead.
  const BLOCK_SEL = "tr, .c-introduction, .c-title, .c-button, .c-anchor-navigation, .accordion-header, .rte, .c-table";
  let copyChip = null, chipHost = null;
  function clearHover() { if (chipHost) chipHost.classList.remove("rv-hover"); chipHost = null; if (copyChip) copyChip.hidden = true; }
  function placeChip(host) {
    if (!copyChip) {
      copyChip = document.createElement("button"); copyChip.type = "button"; copyChip.className = "rv-copychip";
      copyChip.textContent = "Copy"; copyChip.setAttribute("aria-label", "Copy this block for AEM");
      copyChip.addEventListener("click", (e) => { e.preventDefault(); if (chipHost) showCopy(chipHost, copyChip.getBoundingClientRect(), "Copy this block for AEM", ""); });
      document.body.appendChild(copyChip);
    }
    chipHost = host; host.classList.add("rv-hover");
    const r = host.getBoundingClientRect();
    copyChip.style.left = (r.left + scrollX + 6) + "px"; copyChip.style.top = (r.top + scrollY - 11) + "px"; copyChip.hidden = false;
  }
  main.addEventListener("mouseover", (e) => {
    if (!state.aem || popover) return;
    const host = e.target.closest(BLOCK_SEL);
    const ch = host && host.closest(".rv-changed");
    if (!host || !main.contains(host) || (ch && (!ch.classList.contains("rv-done") || document.body.classList.contains("rv-aem-showdone")))) { clearHover(); return; }
    if (host !== chipHost) { clearHover(); placeChip(host); }
  });
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
    const sect = el && el.closest(".c-grid-container");
    const h = sect && $("h2", sect);
    if (h) return norm(h.textContent).trim();
    // the title block and the closing block sit outside every h2 section
    if (!sect) return "";
    if ($("h1", sect)) return "Page introduction";
    if ($("#next", sect)) return "Closing block";
    return "";
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
    const showResolved = state.filter === "resolved";
    const ts = threads().filter((t) => (t.status === "resolved") === showResolved).map((t) => ({ t, loc: locate(t, idx) })).filter((x) => { located.set(x.t.id, !!x.loc); return !!x.loc; });
    ts.sort((a, b) => b.loc.start - a.loc.start);
    ts.forEach(({ t, loc }) => wrapRange(loc.start, loc.end, idx, { cid: t.id, cls: (t.status === "resolved" ? "is-resolved " : "") + (t.type === "proposal" ? "is-proposal " : "") + (state.active === t.id ? "is-active" : ""), title: (TYPES[t.type] || "Comment") + " by " + (t.author || "anonymous") }));
    renderPanel(); renderBar();
    alignActive();
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
    if (state.aem) return;
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
      + '<label for="rv-name">Your name (required)</label><input type="text" id="rv-name" value="' + esc(name) + '" placeholder="So we know who to follow up with" autocomplete="name" required>'
      + '<label for="rv-type">Kind</label><select id="rv-type"><option value="error">Error or typo</option><option value="question">Question</option><option value="suggestion">Suggestion</option><option value="approve">Looks right</option></select>'
      + '<label for="rv-text">Comment</label><textarea id="rv-text" placeholder="What is wrong, or what should change?"></textarea><div class="rv-err" hidden></div>'
      + '<div class="rv-row"><button type="button" class="rv-b rv-b--primary" data-act="save">Save comment</button><span class="rv-grow"></span><button type="button" class="rv-b" data-act="cancel">Cancel</button></div>';
    const p = openPopover(rect, html); hideFab(); $("#rv-text", p).focus();
    p.addEventListener("click", async (e) => {
      const b = e.target.closest("[data-act]"); if (!b) return;
      if (b.dataset.act === "cancel") return closePopover();
      const author = $("#rv-name", p).value.trim(), text = $("#rv-text", p).value.trim(), type = $("#rv-type", p).value, err = $(".rv-err", p);
      if (!author) { err.textContent = "Add your name, so we know who to follow up with."; err.hidden = false; $("#rv-name", p).focus(); return; }
      if (!text) { err.textContent = "Write the comment first."; err.hidden = false; $("#rv-text", p).focus(); return; }
      ls.set("rv.author", author); closePopover(); window.getSelection().removeAllRanges();
      await addRow({ kind: "comment", type, author, text, ...anchor });
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
    panel.addEventListener("keydown", (e) => { if ((e.key === "Enter" || e.key === " ") && e.target.matches(".rv-card[tabindex]")) { e.preventDefault(); goToThread(e.target.dataset.id, e.target); } });
    return panel;
  }
  function openPanel(open, tab) {
    ensurePanel();
    // On wide screens the page makes room for the panel, which re-wraps the text. Hold the
    // reader's place: the active highlight, else whatever sits in the middle of the screen.
    let anchor = state.active ? $('mark.rv-hl[data-cid="' + state.active + '"]', main) : null;
    if (!anchor) { const e = document.elementFromPoint(Math.min(200, innerWidth / 4), innerHeight / 2); anchor = e && main.contains(e) ? e : null; }
    const before = anchor ? anchor.getBoundingClientRect().top : 0;
    state.panelOpen = open; if (tab) state.tab = tab;
    panel.classList.toggle("is-open", open);
    document.body.classList.toggle("rv-panel-open", open);
    if (anchor && anchor.isConnected) window.scrollBy(0, anchor.getBoundingClientRect().top - before);
    renderPanel(); renderBar(); alignActive();
    if (!open && state.filter === "resolved") { state.filter = "open"; state.active = null; renderComments(); }
    if (!open && state.aemFilter === "done") { state.aemFilter = "todo"; document.body.classList.remove("rv-aem-showdone"); }
  }
  function renderPanel() {
    if (!panel) return;
    state.tab = state.aem ? "changes" : "comments";
    $(".rv-panel__tabs", panel).hidden = true;
    $(".rv-panel__head h3", panel).textContent = state.aem ? "Changes to copy into AEM" : "Comments";
    const tools = $(".rv-panel__tools", panel), body = $(".rv-panel__body", panel);
    if (state.tab === "changes") {
      const marks = aemMarks();
      const ids = Object.keys(CFG.changes).filter((id) => changeHosts.has(id)).sort(sortIds);
      const st = Object.fromEntries(ids.map((id) => [id, changeStatus(id, marks)]));
      const done = ids.filter((id) => st[id].done), todo = ids.filter((id) => !st[id].done);
      const showDone = state.aemFilter === "done";
      document.body.classList.toggle("rv-aem-showdone", showDone);
      tools.innerHTML = '<button type="button" class="rv-b' + (!showDone ? " rv-b--primary" : "") + '" data-act="aem-filter" data-v="todo">To do (' + todo.length + ")</button>"
        + '<button type="button" class="rv-b' + (showDone ? " rv-b--primary" : "") + '" data-act="aem-filter" data-v="done">Done (' + done.length + ")</button>"
        + '<span class="rv-meta">' + done.length + " of " + ids.length + " copied into AEM. Copy a change, paste it into AEM, then mark it done.</span>";
      const list = showDone ? done : todo;
      if (!list.length) { body.innerHTML = '<p class="rv-panel__empty">' + (showDone ? "Nothing marked done yet." : "Every change is copied into AEM.") + "</p>"; return; }
      body.innerHTML = list.map((id) => {
        const c = CFG.changes[id], s = st[id];
        const who = s.row ? esc(s.row.author) + ", " + esc(fmtDate(s.row.ts)) : "";
        const line = s.done ? '<small class="rv-aem-line is-done">Done in AEM · ' + who + "</small>"
          : s.stale ? '<small class="rv-aem-line is-stale">Changed since it was copied (' + who + "). Copy it again.</small>" : "";
        return '<div class="rv-change"><span class="rv-change__id' + (s.done ? " is-done" : s.stale ? " is-stale" : "") + '">' + esc(id) + '</span><div class="rv-change__title">' + esc(c.title)
          + "<small>" + esc(GROUPS[c.group] || "") + (c.note ? " · " + esc(c.note) : "") + "</small>" + line + "</div>"
          + '<div class="rv-change__acts"><button type="button" class="rv-b" data-act="goto-change" data-id="' + esc(id) + '">Go to</button><button type="button" class="rv-b" data-act="copy-change" data-id="' + esc(id) + '">Copy</button>'
          + (s.done ? '<button type="button" class="rv-b" data-act="aem-reopen" data-id="' + esc(id) + '">Undo</button>' : '<button type="button" class="rv-b rv-b--done" data-act="aem-done" data-id="' + esc(id) + '">Done</button>') + "</div></div>";
      }).join("");
      return;
    }
    const all = threads(); const open = all.filter((t) => t.status !== "resolved"), done = all.filter((t) => t.status === "resolved");
    const list = state.filter === "resolved" ? done : open;
    tools.innerHTML = '<button type="button" class="rv-b' + (state.filter !== "resolved" ? " rv-b--primary" : "") + '" data-act="filter" data-v="open">Open (' + open.length + ")</button>"
      + '<button type="button" class="rv-b' + (state.filter === "resolved" ? " rv-b--primary" : "") + '" data-act="filter" data-v="resolved">Resolved (' + done.length + ")</button>"
      + '<button type="button" class="rv-b" data-act="export" title="Copies every comment as Markdown">Copy all as Markdown</button>';
    if (!list.length) { body.innerHTML = '<p class="rv-panel__empty">' + (state.filter === "resolved" ? "Nothing resolved yet." : "No open comments. Select any text on the page and choose <b>Comment on this</b> to add one.") + "</p>"; return; }
    body.innerHTML = list.map(cardHTML).join("");
  }
  function cardHTML(t) {
    const orphan = located.get(t.id) === false;
    return '<div class="rv-card' + (t.status === "resolved" ? " is-resolved" : "") + (state.active === t.id ? " is-active" : "") + '" data-id="' + esc(t.id) + '"' + (orphan ? "" : ' tabindex="0" title="Show this passage on the page"') + '>'
      + '<div class="rv-card__meta"><span class="rv-chip rv-chip--' + esc(t.type || "question") + '">' + esc(TYPES[t.type] || "Comment") + "</span>" + (t.status === "resolved" ? '<span class="rv-chip rv-chip--resolved">Resolved</span>' : "") + "<b>" + esc(t.author || "anonymous") + "</b><span>" + esc(fmtDate(t.ts)) + "</span>" + (t.section ? "<span>· " + esc(t.section) + "</span>" : "") + "</div>"
      + '<p class="rv-card__quote' + (orphan ? " is-orphan" : "") + '" title="' + (orphan ? "This passage is no longer on the page" : "") + '">' + (orphan ? "[passage not found] " : "") + esc(t.quote) + "</p>"
      + '<p class="rv-card__text">' + esc(t.text) + "</p>"
      + (t.replies.length ? '<div class="rv-card__replies">' + t.replies.map((r) => '<div class="rv-card__reply"><div class="rv-card__meta"><b>' + esc(r.author || "anonymous") + "</b><span>" + esc(fmtDate(r.ts)) + '</span></div><p class="rv-card__text">' + esc(r.text) + "</p></div>").join("") + "</div>" : "")
      + '<div class="rv-card__actions">' + (orphan ? "" : '<button type="button" class="rv-b" data-act="goto">Go to</button>') + '<button type="button" class="rv-b" data-act="reply">Reply</button><button type="button" class="rv-b" data-act="resolve">' + (t.status === "resolved" ? "Reopen" : "Resolve") + "</button></div>"
      + '<div class="rv-card__replybox" hidden><textarea placeholder="Reply"></textarea><div class="rv-card__actions"><button type="button" class="rv-b rv-b--primary" data-act="send-reply">Send</button><button type="button" class="rv-b" data-act="cancel-reply">Cancel</button></div></div></div>';
  }
  async function onPanelClick(e) {
    const hit = e.target.closest(".rv-card[tabindex]");
    if (hit && !e.target.closest("button, textarea, input, select, a, .rv-card__replybox") && !String(window.getSelection())) { goToThread(hit.dataset.id, hit); return; }
    const b = e.target.closest("[data-act], .rv-tab"); if (!b) return;
    if (b.classList.contains("rv-tab")) { state.tab = b.dataset.tab; renderPanel(); alignActive(); return; }
    const card = b.closest(".rv-card"); const id = card && card.dataset.id;
    switch (b.dataset.act) {
      case "close": return openPanel(false);
      case "filter": state.filter = b.dataset.v; state.active = null; return renderComments();
      case "export": { const ok = await copyText(exportMarkdown()); toast(ok ? "Copied all comments as Markdown" : "Copy failed"); return; }
      case "goto-change": { const hosts = changeHosts.get(b.dataset.id) || []; if (hosts[0]) { revealElement(hosts[0]); hosts[0].classList.remove("rv-flash"); void hosts[0].offsetWidth; hosts[0].classList.add("rv-flash"); } return; }
      case "copy-change": { const hosts = changeHosts.get(b.dataset.id) || []; if (!hosts[0]) return; const ok = await copyText(blockText(hosts[0])); toast(ok ? "Copied " + b.dataset.id + ". Once it is in AEM, choose Done." : "Copy failed"); return; }
      case "aem-filter": state.aemFilter = b.dataset.v; renderPanel(); return;
      case "aem-done": return markAem(b.dataset.id, true);
      case "aem-reopen": return markAem(b.dataset.id, false);
      case "goto": return goToThread(id, card);
      case "reply": { $(".rv-card__replybox", card).hidden = false; $("textarea", card).focus(); return; }
      case "cancel-reply": { $(".rv-card__replybox", card).hidden = true; return; }
      case "send-reply": {
        const text = $("textarea", card).value.trim(); if (!text) return;
        const author = requireName(); if (!author) return;
        await addRow({ kind: "reply", parent: id, author, text }); return;
      }
      case "resolve": {
        const t = threads().find((x) => x.id === id); const author = requireName(); if (!author) return;
        await addRow({ kind: "status", parent: id, author, status: t && t.status === "resolved" ? "open" : "resolved", text: "" }); return;
      }
    }
  }
  main.addEventListener("click", (e) => {
    const m = e.target.closest("mark.rv-hl"); if (!m || state.aem) return;
    state.active = m.dataset.cid;
    // a resolved thread is hidden under the Open filter; show it rather than open an empty panel
    const t = threads().find((x) => x.id === state.active);
    if (t && t.status === "resolved" && state.filter !== "resolved") state.filter = "resolved";
    openPanel(true, "comments"); renderComments();
  });

  // Keep the active card level with its highlight: same eye line on click, and as the page scrolls.
  function alignActive() {
    if (!panel || state.pageDriving) return;
    const body = $(".rv-panel__body", panel);
    const card = state.active && state.panelOpen ? $('.rv-card[data-id="' + state.active + '"]', panel) : null;
    const mark = card ? $('mark.rv-hl[data-cid="' + state.active + '"]', main) : null;
    if (!card || !mark) { body.style.paddingTop = ""; body.style.paddingBottom = ""; return; }
    body.style.paddingTop = ""; // measure from the natural layout
    body.style.paddingBottom = body.clientHeight + "px"; // room for the last card to rise to any line
    const bodyTop = body.getBoundingClientRect().top;
    const cardInList = card.getBoundingClientRect().top - bodyTop + body.scrollTop;
    const markLine = mark.getBoundingClientRect().top - bodyTop;
    const target = cardInList - markLine;
    if (target < 0) { body.style.paddingTop = (10 - target) + "px"; body.scrollTop = 0; } // the first cards: push down to meet the line
    else body.scrollTop = target;
  }
  function setActive(id) {
    state.active = id;
    $$("mark.rv-hl", main).forEach((m) => m.classList.toggle("is-active", m.dataset.cid === id));
    if (panel) $$(".rv-card", panel).forEach((c) => c.classList.toggle("is-active", c.dataset.id === id));
  }
  function pulse(id) {
    $$('mark.rv-hl[data-cid="' + id + '"]', main).forEach((m) => { m.classList.remove("rv-pulse"); void m.offsetWidth; m.classList.add("rv-pulse"); });
  }
  // Reverse of a highlight click: bring the passage level with the card the viewer clicked.
  let driveTimer = 0;
  function goToThread(id, card) {
    const mark = $('mark.rv-hl[data-cid="' + id + '"]', main);
    if (!mark) { toast("This passage is no longer on the page"); return; }
    setActive(id);
    const acc = mark.closest(".accordion-collapse");
    if (acc && !acc.classList.contains("show")) { const btn = $('[aria-controls="' + acc.id + '"]', main); if (btn) setOpen(btn, true); }
    // Below 900px the panel sits over the page, so step it aside to show the passage.
    const covered = matchMedia("(max-width: 899px)").matches;
    if (covered) openPanel(false);
    const line = covered || !card ? innerHeight / 3 : card.getBoundingClientRect().top;
    const top = Math.max(0, scrollY + mark.getBoundingClientRect().top - line);
    const smooth = !matchMedia("(prefers-reduced-motion: reduce)").matches && Math.abs(top - scrollY) > 4;
    state.pageDriving = true; clearTimeout(driveTimer);
    const done = () => { if (!state.pageDriving) return; state.pageDriving = false; clearTimeout(driveTimer); window.removeEventListener("scrollend", done); alignActive(); pulse(id); };
    window.addEventListener("scrollend", done);
    driveTimer = setTimeout(done, smooth ? 1000 : 60);
    const startY = scrollY;
    window.scrollTo({ top, behavior: smooth ? "smooth" : "auto" });
    // Some browsers swallow a smooth scroll (seen at phone width). If nothing has moved
    // shortly after, jump there instead; if the viewer took over the scroll, leave them be.
    if (smooth) setTimeout(() => { if (state.pageDriving && Math.abs(scrollY - startY) < 2) window.scrollTo({ top, behavior: "auto" }); }, 180);
  }
  let alignFrame = 0;
  const queueAlign = () => { if (!state.active || !state.panelOpen) return; cancelAnimationFrame(alignFrame); alignFrame = requestAnimationFrame(alignActive); };
  window.addEventListener("scroll", queueAlign, { passive: true });
  window.addEventListener("resize", queueAlign);
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
    const marks = aemMarks(); const nChanges = [...changeHosts.keys()].filter((id) => !changeStatus(id, marks).done).length; const all = threads(); const nOpen = all.filter((t) => t.status !== "resolved").length;
    const status = state.backend === "sheet" ? "Comments save to the review sheet" : state.backend === "error" ? "Sheet unreachable: comments stay in this browser" : "Comments stay in this browser only";
    bar.innerHTML = '<span class="rv-bar__title">Review copy · Narrative CV guide<small>' + esc(CFG.snapshot || "") + "</small></span>"
      + '<button type="button" class="rv-btn" data-act="expand">' + (allOpen() ? "Collapse all" : "Expand all") + "</button>"
      + '<span class="rv-bar__spacer"></span>'
      + (state.aem
        ? '<button type="button" class="rv-btn' + (state.panelOpen ? " is-on" : "") + '" data-act="panel" data-tab="changes">Changes<span class="rv-count">' + nChanges + "</span></button>"
          + '<span class="rv-status is-aem">Click a blue tag, or hover any block and choose Copy</span>'
        : '<button type="button" class="rv-btn' + (state.panelOpen ? " is-on" : "") + '" data-act="panel" data-tab="comments">Comments<span class="rv-count">' + nOpen + "</span></button>"
          + '<span class="rv-status' + (state.backend === "sheet" ? " is-sheet" : state.backend === "error" ? " is-error" : "") + '" title="' + esc(state.backendNote) + '">' + status + "</span>")
      + '<label class="rv-switch" title="For the web editor: shows every change with Copy text and Copy HTML"><input type="checkbox" id="rv-aem-switch" role="switch"' + (state.aem ? " checked" : "") + '><span class="rv-switch__track" aria-hidden="true"></span><span>AEM copy mode</span></label>';
  }
  if (bar) bar.addEventListener("click", (e) => {
    const b = e.target.closest("[data-act]"); if (!b) return;
    if (b.dataset.act === "expand") { expandAll(!allOpen()); renderBar(); }
    else if (b.dataset.act === "panel") openPanel(!state.panelOpen, b.dataset.tab);
  });
  if (bar) bar.addEventListener("change", (e) => { if (e.target.id === "rv-aem-switch") setAem(e.target.checked); });

  // ---------------------------------------------------------------- init
  async function init() {
    markChanges();
    const seeds = (CFG.seeds || []).map((s) => ({ kind: "comment", ts: "2026-09-21T12:00:00.000Z", status: "open", ...s }));
    state.rows = seeds.concat(await store.load());
    paintAem();
    const q = new URLSearchParams(location.search).get("aem");
    setAem(q === "1" ? true : q === "0" ? false : ls.get("rv.aem", false));
    renderComments();
    const missing = seeds.filter((s) => located.get(s.id) === false).map((s) => s.id);
    if (missing.length) console.warn("Seeded comments not found on the page:", missing);
  }
  init();
})();
