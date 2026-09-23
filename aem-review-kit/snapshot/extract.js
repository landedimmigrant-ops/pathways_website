/* aem-review-kit/snapshot/extract.js
   Run on the AEM page (browser console, or the browser tool's javascript runner) while
   snapshot/receiver.js is running locally. It collects the stylesheet rules the page actually
   uses, plus <main>, <header> and <footer>, and posts them to the receiver as one bundle.

   A page's fetch() to 127.0.0.1 is blocked by the browser (private network access);
   a plain form POST is not, so that is how the bundle travels. The tab navigates to the
   receiver's "ok" page afterwards; that is expected. */
(() => {
  const RECEIVER = "http://127.0.0.1:8792/save?name=bundle.txt";
  const matches = (sel) => { try { return !!document.querySelector(sel); } catch (e) { return false; } };
  const PSEUDO = /::?(before|after|hover|focus|focus-visible|focus-within|active|visited|placeholder|selection|first-letter|first-line|marker|-webkit-[a-z-]+|-moz-[a-z-]+)/g;
  const keep = (sel) => sel.split(",").some((s) => { const c = s.replace(PSEUDO, "").trim(); return c ? matches(c) : false; });
  const out = [], fonts = [];
  const walk = (rules, sink) => {
    for (const r of rules) {
      if (r.type === CSSRule.STYLE_RULE) { if (keep(r.selectorText)) sink.push(r.cssText); }
      else if (r.type === CSSRule.MEDIA_RULE) { const inner = []; walk(r.cssRules, inner); if (inner.length) sink.push("@media " + r.conditionText + "{" + inner.join("\n") + "}"); }
      else if (r.type === CSSRule.FONT_FACE_RULE) fonts.push(r.cssText);
      else if (r.type === CSSRule.SUPPORTS_RULE) { const inner = []; walk(r.cssRules, inner); if (inner.length) sink.push("@supports " + r.conditionText + "{" + inner.join("\n") + "}"); }
    }
  };
  const skipped = [];
  for (const s of document.styleSheets) { try { walk(s.cssRules, out); } catch (e) { skipped.push(s.href); } }  // cross-origin sheets (Typekit, Google Fonts) stay as <link>s
  const q = (sel) => (document.querySelector(sel) || { outerHTML: "" }).outerHTML;
  const parts = {
    "page-url.txt": location.href,
    "body-class.txt": document.body.className,
    "used.css": fonts.join("\n") + "\n" + out.join("\n"),
    "main.html": q("main"),
    "header.html": q("header"),
    "footer.html": q("footer"),
    "stylesheet-links.txt": [...document.querySelectorAll('link[rel="stylesheet"]')].map((l) => l.href).filter((h) => !h.startsWith(location.origin)).join("\n"),
  };
  const blob = Object.entries(parts).map(([k, v]) => "\n=====SPLIT:" + k + "=====\n" + v).join("") + "\n";
  const f = document.createElement("form");
  f.method = "POST"; f.enctype = "text/plain"; f.action = RECEIVER;
  const ta = document.createElement("textarea"); ta.name = "blob"; ta.value = blob; f.appendChild(ta);
  document.body.appendChild(f);
  setTimeout(() => f.submit(), 50);
  return { cssRules: out.length, mainChars: parts["main.html"].length, skippedSheets: skipped };
})();
