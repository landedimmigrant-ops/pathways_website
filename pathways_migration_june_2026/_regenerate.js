/* ------------------------------------------------------------------ *
 * Pathways → AEM migration: regenerate the standalone section exports
 * ------------------------------------------------------------------
 * These section files are SNAPSHOTS of the live SPA's rendered DOM (the site
 * builds every section at runtime from app.js + data.js + the Google Sheet,
 * so a rendered snapshot is the only faithful capture). To regenerate:
 *
 *   1.  Serve the site:     python3 -m http.server 8765   (from repo root)
 *   2.  Start save-server:  node scripts/migration-export-server.js
 *   3.  Open the site in a browser:  http://localhost:8765/#home
 *   4.  Paste this whole file into the browser DevTools console and run it.
 *
 * Each section is rendered, cloned, wrapped in a self-contained document
 * (inlined styles.css + Inter font + a minimal Concordia header/footer +
 * an accordion-toggle script), and POSTed to the save-server, which writes
 * it to pathways_migration_june_2026/<NN-name>.html. See MIGRATION_LOG.md.
 * ------------------------------------------------------------------ */
(async () => {
  const SAVE = "http://127.0.0.1:8791/save?name=";
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const go = async (hash, ms = 900) => { location.href = "http://localhost:8765/index.html" + hash; await sleep(ms); };

  const css = await fetch("styles.css").then((r) => r.text());
  const fontLink = '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">';
  const chromeCss = `
body{margin:0;background:#fff;color:var(--text);font-family:Inter,system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;}
.mh-banner{background:#fff8e6;border-bottom:1px solid #f0e0a8;color:#6b5300;font-size:12px;letter-spacing:.04em;padding:8px 24px;text-align:center;}
.mh-banner code{background:#fff;border:1px solid #eadfb0;border-radius:4px;padding:1px 5px;}
.mh-header{display:flex;align-items:baseline;gap:14px;flex-wrap:wrap;padding:20px 24px;border-bottom:1px solid var(--border);}
.mh-brand{font-weight:700;color:var(--burgundy);font-size:18px;}
.mh-tag{color:var(--muted);font-size:13px;}
.mh-section{margin-left:auto;color:var(--muted);font-size:12px;text-transform:uppercase;letter-spacing:.1em;}
.mh-main{padding:8px 0 0;}
.mh-footer{margin-top:40px;border-top:1px solid var(--border);background:#fafafa;padding:18px 24px;color:var(--muted);font-size:13px;text-align:center;}
.mh-footer a{color:var(--link);}
.carousel-wrap{height:auto!important;box-shadow:none;}
.carousel-track{flex-direction:column!important;transform:none!important;}
.carousel-track .slide{min-height:0;}
.nav-btn,.dot-nav,.carousel-pause,.slide-counter,.progress-bar{display:none!important;}
`;
  const toggle = '<scr' + 'ipt>document.addEventListener("click",function(e){var b=e.target.closest("[aria-expanded]");if(!b)return;var x=b.getAttribute("aria-expanded")==="true";b.setAttribute("aria-expanded",String(!x));var y=b.nextElementSibling;if(y)y.classList.toggle("is-open",!x);});</scr' + 'ipt>';

  const save = async (name, label, route, node) => {
    const banner = `<div class="mh-banner">Migration export — a static, self-contained snapshot of one Pathways&nbsp;SPA section for AEM evaluation. Source route: <code>${route}</code>. Not the live app.</div>`;
    const header = `<header class="mh-header"><span class="mh-brand">Pathways to Impact</span><span class="mh-tag">Concordia University · Office of Research</span><span class="mh-section">${label}</span></header>`;
    const footer = `<footer class="mh-footer">Pathways to Impact · Office of Research, Concordia University · <a href="mailto:impact@concordia.ca">impact@concordia.ca</a><br>Static migration snapshot — interactive behaviour (carousel autoplay, hash routing, live data) is not reproduced.</footer>`;
    const doc = `<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>${label} · Pathways to Impact (migration export)</title>\n${fontLink}\n<style>\n${css}\n${chromeCss}</style>\n</head>\n<body>\n${banner}\n${header}\n<main class="mh-main">\n${node.outerHTML}\n</main>\n${footer}\n${toggle}\n</body>\n</html>\n`;
    await fetch(SAVE + encodeURIComponent(name), { method: "POST", headers: { "Content-Type": "text/plain" }, body: doc });
    console.log("saved", name);
  };
  const exploreActiveTab = () => { const c = document.querySelector(".page-explore").cloneNode(true); c.querySelectorAll(".explore-tab-content:not(.is-active)").forEach((e) => e.remove()); return c; };

  // 01 Home
  await go("#home"); await save("01-home.html", "Home", "#home", document.querySelector(".page-home").cloneNode(true));
  // 02–04 Explore tabs
  await go("#explore"); await save("02-explore-pathways.html", "Explore — Pathways", "#explore", exploreActiveTab());
  await go("#explore?tab=research"); await save("03-explore-research-stage.html", "Explore — Research Stage", "#explore?tab=research", exploreActiveTab());
  await go("#explore?tab=browse"); await save("04-explore-all-resources.html", "Explore — All Resources", "#explore?tab=browse", exploreActiveTab());
  // 05 Pathway detail
  await go("#explore?pathway=community", 1000); await save("05-explore-pathway-detail.html", "Explore — Pathway detail (Community Engagement)", "#explore?pathway=community", exploreActiveTab());
  // 06 Research stage detail
  await go("#explore?tab=research");
  { const card = [...document.querySelectorAll(".page-explore *")].filter((e) => e.offsetHeight > 0 && e.matches("button,[role=button],article,div[class*=stage]")).find((e) => /STAGE 2/.test(e.innerText) && e.innerText.length < 250); card && card.click(); await sleep(800); await save("06-explore-research-stage-detail.html", "Explore — Research stage detail (Active Research)", "#explore?tab=research", exploreActiveTab()); }
  // 07 Service detail (modal de-fixed to flow inline)
  await go("#explore?service=4th-space-public-engagement", 1000);
  { const ov = [...document.querySelectorAll(".modal-overlay")].find((e) => e.offsetHeight > 0); const c = ov.cloneNode(true); Object.assign(c.style, { position: "static", height: "auto", overflow: "visible", background: "#fff", inset: "auto" }); await save("07-explore-service-detail.html", "Service detail (4th Space — modal)", "#explore?service=4th-space-public-engagement", c); }
  // 08–10 Learn
  await go("#learn"); await save("08-learn-impact-101.html", "Learn — Impact 101", "#learn", (() => { const c = document.querySelector(".page-learn").cloneNode(true); c.querySelectorAll(".explore-tab-content:not(.is-active)").forEach((e) => e.remove()); return c; })());
  await go("#learn?tab=tools"); await save("09-learn-tools.html", "Learn — Tools", "#learn?tab=tools", (() => { const c = document.querySelector(".page-learn").cloneNode(true); c.querySelectorAll(".explore-tab-content:not(.is-active)").forEach((e) => e.remove()); return c; })());
  await go("#learn?tab=tools&tool=planner"); await save("10-learn-planner.html", "Learn — Plan Your Impact (planner)", "#learn?tab=tools&tool=planner", document.querySelector(".learn-impact-planner").cloneNode(true));
  // 12 About (partners accordion expanded)
  await go("#about");
  { const acc = [...document.querySelectorAll(".page-about [aria-expanded], .page-about summary, .page-about button")].find((e) => /Partners across/.test(e.innerText)); if (acc) { if (acc.getAttribute("aria-expanded") === "false") acc.click(); else if (acc.tagName === "SUMMARY") { const d = acc.closest("details"); if (d) d.open = true; } } await sleep(300); await save("12-about.html", "About", "#about", document.querySelector(".page-about").cloneNode(true)); }
  // 13 Pathways Vision
  await go("#pathways-vision"); await save("13-pathways-vision.html", "Pathways Vision", "#pathways-vision", document.querySelector(".page-pathways-vision").cloneNode(true));

  console.log("DONE. (11-learn-module-narrative-cv.html is generated separately from markdown — see MIGRATION_LOG.md.)");
})();
