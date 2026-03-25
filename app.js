(() => {
  const data = window.PATHWAYS_DATA;
  if (!data) {
    return;
  }
  // TEMP: hide Stories in navigation and page rendering without deleting feature code.
  const STORIES_ENABLED = false;

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

  const formatBadge = (format) => {
    const fmt = (format || "").toLowerCase();
    let key, iconSvg;
    if (fmt.includes("workshop")) {
      key = "workshop";
      iconSvg = '<svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="14" height="14" rx="2"/><path d="M16 2v4M8 2v4M3 9h14"/></svg>';
    } else if (fmt.includes("consultation")) {
      key = "consultation";
      iconSvg = '<svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 10c0 3.866-3.582 7-8 7a9 9 0 01-4-.93L2 18l1.4-3.5A7 7 0 012 10c0-3.866 3.582-7 8-7s8 3.134 8 7z"/></svg>';
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
    pathwaysVisionLoadError: false
  };

  const state = {
    page: "home",
    search: "",
    filters: {
      pathway: "",
      stage: "",
      category: "",
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
    suppressNextHashChange: false
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
  stageKeyToLabel["concluded-project"] = "Wrapping Up";

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

  const loadWorkshopContent = async () => {
    try {
      const manifestResponse = await fetch("content/workshops.json", { cache: "no-cache" });
      if (!manifestResponse.ok) {
        throw new Error(`Manifest request failed (${manifestResponse.status})`);
      }
      const manifest = await manifestResponse.json();
      if (!Array.isArray(manifest)) {
        throw new Error("Manifest must be an array");
      }

      const workshops = await Promise.all(manifest.map(async (entry) => {
        const markdownResponse = await fetch(entry.file, { cache: "no-cache" });
        if (!markdownResponse.ok) {
          throw new Error(`Workshop file request failed for ${entry.file}`);
        }
        const rawMarkdown = await markdownResponse.text();
        const markdown = stripFrontMatter(rawMarkdown).trim();
        const html = markdownToHtml(markdown);
        const summary = getSummaryFromMarkdown(markdown);
        return {
          ...entry,
          sourceType: "workshop",
          category: "Workshops & support",
          summary,
          markdown,
          html,
          unitTags: Array.isArray(entry.unitTags) && entry.unitTags.length
            ? entry.unitTags
            : (data.workshopUnitTags && Array.isArray(data.workshopUnitTags[entry.id]) ? data.workshopUnitTags[entry.id] : []),
          stage: (entry.stages || []).map((stage) => stageKeyToLabel[stage] || stage),
          pathway: (entry.pathways || []).map((pathway) => pathwayKeyToTitle[pathway] || pathway)
        };
      }));

      content.workshops = workshops;
    } catch (error) {
      console.warn("Workshop content failed to load.", error);
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
      .filter((item) => ["home", "explore", "learn", "about", "stories"].includes(item.id))
      .filter((item) => STORIES_ENABLED || item.id !== "stories");

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
      const isOpen = siteHeader.classList.toggle("is-nav-open");
      hamburger.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
    navList.addEventListener("click", () => {
      siteHeader.classList.remove("is-nav-open");
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
      { label: "Start from my research stage", page: "explore" },
      { label: "Browse all opportunities", page: "explore" },
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
    container.appendChild(footerLinks);
    routeFooter.appendChild(container);
    document.body.insertBefore(routeFooter, modalRoot);
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
        desc: "Browse services matched to whether you\u2019re developing an idea, in active research, or wrapping up.",
        action: () => { state.pendingExploreTab = "research"; navigateTo("explore"); }
      },
      {
        kicker: "Frameworks \u0026 tools",
        title: "Learn what impact means",
        desc: "Explore frameworks, use our interactive impact planner, and build your approach.",
        action: () => navigateTo("learn")
      },
      {
        kicker: "Not sure yet",
        title: "Not sure where to start?",
        desc: "Answer these questions and we\u2019ll try to match you to the best support.",
        action: () => openQuickMatch(),
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

    // === Pathways grid (primary entry) ===
    const pathwayItems = data.explore.pathways.items;
    const pathwaysSection = el("section", "home-pathways");
    const pathwayGrid = el("div", "pathway-grid");
    const pathwayCards = new Map();
    pathwayItems.forEach((pathway) => {
      const card = el("button", "pathway-card");
      card.type = "button";
      card.dataset.pathway = pathwayIdToKey[pathway.id] || pathway.id;
      card.appendChild(el("p", "pathway-card-label", pathway.title));
      card.appendChild(el("p", "pathway-card-summary", pathway.summary));
      card.addEventListener("click", () => togglePathway(pathway.id));
      pathwayGrid.appendChild(card);
      pathwayCards.set(pathway.id, card);
    });
    pathwaysSection.appendChild(pathwayGrid);
    const pathwaysLink = el("a", "home-pathways-link btn btn-ghost-burgundy btn-small", "Explore Pathways →");
    pathwaysLink.href = "#explore";
    pathwaysLink.addEventListener("click", (event) => {
      event.preventDefault();
      navigateTo("explore");
    });
    pathwaysSection.appendChild(pathwaysLink);
    container.appendChild(pathwaysSection);

    let activePathwayId = "";
    let pathwayModalOverlay = null;
    let pathwayModalKeyHandler = null;

    const updateActiveCards = () => {
      pathwayCards.forEach((card, id) => {
        const isActive = id === activePathwayId;
        card.classList.toggle("is-active", isActive);
        card.setAttribute("aria-expanded", isActive ? "true" : "false");
      });
    };

    const closePathwayModal = () => {
      if (pathwayModalOverlay && pathwayModalOverlay.parentNode === modalRoot) {
        modalRoot.removeChild(pathwayModalOverlay);
      }
      pathwayModalOverlay = null;
      if (pathwayModalKeyHandler) {
        document.removeEventListener("keydown", pathwayModalKeyHandler);
        pathwayModalKeyHandler = null;
      }
      document.body.classList.remove("is-modal-open");
      activePathwayId = "";
      updateActiveCards();
    };

    const renderPathwayModal = (pathway) => {
      clear(modalRoot);
      if (pathwayModalKeyHandler) {
        document.removeEventListener("keydown", pathwayModalKeyHandler);
        pathwayModalKeyHandler = null;
      }

      const overlay = el("div", "pathway-modal-overlay");
      const wrapper = el("div", "pathway-modal");
      wrapper.setAttribute("role", "dialog");
      wrapper.setAttribute("aria-modal", "true");
      wrapper.setAttribute("aria-label", pathway.title);
      wrapper.tabIndex = -1;

      const header = el("div", "pathway-modal-header");
      header.appendChild(el("p", "pathway-modal-label", pathway.title));
      const closeControl = el("button", "pathway-modal-close", "X");
      closeControl.type = "button";
      closeControl.setAttribute("aria-label", "Close pathway details");
      closeControl.addEventListener("click", closePathwayModal);
      header.appendChild(closeControl);
      wrapper.appendChild(header);

      wrapper.appendChild(el("p", "pathway-modal-summary", pathway.summary));
      wrapper.appendChild(el("p", "pathway-label", pathway.label));

      const actionList = el("ul", "pathway-actions");
      pathway.actions.forEach((item) => {
        actionList.appendChild(el("li", null, item));
      });
      wrapper.appendChild(actionList);

      wrapper.appendChild(el("h4", "pathway-support-title", data.explore.pathways.supportTitle));
      const supportList = el("ul", "pathway-supports");
      pathway.supports.forEach((item) => {
        supportList.appendChild(el("li", null, item));
      });
      wrapper.appendChild(supportList);

      const ctaRow = el("div", "pathway-cta");
      const relatedButton = el("button", "btn", data.explore.pathways.buttons.related);
      relatedButton.type = "button";
      relatedButton.addEventListener("click", () => {
        closePathwayModal();
        navigateTo("explore", "opportunity-explorer", { pathway: pathwayIdToKey[pathway.id] || pathway.id });
      });

      const contactWrap = el("div", "pathway-contact");
      contactWrap.appendChild(el("span", "pathway-contact-text", data.explore.pathways.buttons.contactPrompt));
      const contactButton = el("button", "btn", data.explore.pathways.buttons.contactAction);
      contactButton.type = "button";
      contactButton.addEventListener("click", () => {
        closePathwayModal();
        navigateTo("about", "contact");
      });
      contactWrap.appendChild(contactButton);
      ctaRow.appendChild(relatedButton);
      ctaRow.appendChild(contactWrap);
      wrapper.appendChild(ctaRow);

      const navRow = el("div", "pathway-nav");
      const currentIndex = pathwayItems.findIndex((item) => item.id === pathway.id);
      const previousIndex = (currentIndex - 1 + pathwayItems.length) % pathwayItems.length;
      const nextIndex = (currentIndex + 1) % pathwayItems.length;
      const prevButton = el("button", "btn btn-icon", "\u2190");
      prevButton.type = "button";
      prevButton.setAttribute("aria-label", data.explore.pathways.buttons.previous);
      prevButton.addEventListener("click", () => {
        openPathway(pathwayItems[previousIndex].id);
      });
      const nextButton = el("button", "btn btn-icon", "\u2192");
      nextButton.type = "button";
      nextButton.setAttribute("aria-label", data.explore.pathways.buttons.next);
      nextButton.addEventListener("click", () => {
        openPathway(pathwayItems[nextIndex].id);
      });
      const closeButton = el("button", "btn btn-icon btn-icon--close", "\u00d7");
      closeButton.type = "button";
      closeButton.setAttribute("aria-label", data.explore.pathways.buttons.close);
      closeButton.addEventListener("click", closePathwayModal);
      navRow.appendChild(prevButton);
      navRow.appendChild(nextButton);
      navRow.appendChild(closeButton);
      wrapper.appendChild(navRow);

      overlay.appendChild(wrapper);
      overlay.addEventListener("click", (event) => {
        if (event.target === overlay) {
          closePathwayModal();
        }
      });

      pathwayModalKeyHandler = (event) => {
        if (event.key === "Escape") {
          closePathwayModal();
        }
      };
      document.addEventListener("keydown", pathwayModalKeyHandler);
      document.body.classList.add("is-modal-open");
      modalRoot.appendChild(overlay);
      pathwayModalOverlay = overlay;
      wrapper.focus();
    };

    function openPathway(pathwayId) {
      const pathway = pathwayItems.find((item) => item.id === pathwayId);
      if (!pathway) {
        return;
      }
      activePathwayId = pathwayId;
      updateActiveCards();
      renderPathwayModal(pathway);
      setContextPathway(pathwayIdToKey[pathwayId] || pathwayId);
    }

    function togglePathway(pathwayId) {
      const pathwayKey = pathwayIdToKey[pathwayId] || pathwayId;
      navigateTo("explore", null, { pathway: pathwayKey });
    }

    container.appendChild(el("hr", "section-divider"));

    // === Popular this month ===
    const popular = el("section", "popular-section");
    const popularHeader = el("div", "popular-header");
    popularHeader.appendChild(el("h2", "section-title", "Popular this month"));
    popularHeader.appendChild(el("p", "popular-subtitle", "Real services available to you right now."));
    popular.appendChild(popularHeader);

    const FEATURED_IDS = [
      "4th-space-public-engagement",
      "ucs-writing-op-ed",
      "oce-community-partnerships-workshop"
    ];
    const popularItems = FEATURED_IDS
      .map((id) => content.workshops.find((w) => w.id === id))
      .filter(Boolean);

    const popularGrid = el("div", "popular-grid");
    popularItems.forEach((item) => {
      const card = el("article", "popular-card");
      card.appendChild(formatBadge(item.format));
      card.appendChild(el("h3", "popular-card-title", item.title));
      const learnBtn = el("button", "popular-card-cta", "Learn more \u2192");
      learnBtn.type = "button";
      learnBtn.addEventListener("click", () => {
        navigateTo("explore", "opportunity-explorer", { workshop: item.id });
      });
      card.appendChild(learnBtn);
      popularGrid.appendChild(card);
    });

    popular.appendChild(popularGrid);
    container.appendChild(popular);
    section.appendChild(container);
    section.openPathwayByKey = (pathwayKey) => {
      const pathwayId = pathwayKeyToId[(pathwayKey || "").toLowerCase()];
      if (pathwayId) {
        openPathway(pathwayId);
      }
    };
    section.closePathwayModal = closePathwayModal;
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
    supportExploreBridge.appendChild(document.createTextNode("Want to browse all opportunities? "));
    const toExploreLink = el("a", "bridge-link", "Browse opportunities \u2192");
    toExploreLink.href = "#explore";
    toExploreLink.addEventListener("click", (e) => { e.preventDefault(); navigateTo("explore"); });
    supportExploreBridge.appendChild(toExploreLink);
    container.appendChild(supportExploreBridge);

    const supportSectionsById = (data.support.sections || []).reduce((acc, item) => {
      acc[item.id] = item;
      return acc;
    }, {});
    const supportSearchConfig = data.support.search || {
      label: "Find support and services",
      placeholder: "Find support and services",
      ariaLabel: "Find support and services"
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

  const buildLearn = () => {
    const section = el("section", "page page-learn");
    section.dataset.page = "learn";

    const container = el("div", "container");
    container.appendChild(el("h1", null, data.learn.title));
    container.appendChild(el("p", "lead", data.learn.intro));

    const grid = el("div", "learn-grid");

    const impact = el("div", "learn-impact");
    impact.appendChild(el("h2", "section-title", data.learn.impact.title));
    impact.appendChild(el("p", null, data.learn.impact.body));
    grid.appendChild(impact);

    const myths = el("div", "learn-myths");
    myths.appendChild(el("h2", "section-title", data.learn.myths.title));
    const mythsWrap = el("div", "myths");
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
      mythsWrap.appendChild(card);
    });
    myths.appendChild(mythsWrap);
    grid.appendChild(myths);

    const topics = el("div", "learn-topics");
    topics.appendChild(el("h2", "section-title", data.learn.topics.title));
    const topicGrid = el("div", "topic-grid");
    data.learn.topics.cards.forEach((topic) => {
      const card = el("div", "topic-card");
      card.appendChild(el("h3", null, topic.title));
      card.appendChild(el("p", null, topic.body));
      topicGrid.appendChild(card);
    });
    topics.appendChild(topicGrid);
    grid.appendChild(topics);

    if (data.learn.resources && Array.isArray(data.learn.resources.cards)) {
      const resources = el("div", "learn-resources");
      resources.appendChild(el("h2", "section-title", data.learn.resources.title));
      const resourceGrid = el("div", "topic-grid");
      data.learn.resources.cards.forEach((resource) => {
        const card = el("div", "topic-card resource-card");
        const resourceLink = el("a", "resource-link", resource.title);
        resourceLink.href = resource.url;
        resourceLink.target = "_blank";
        resourceLink.rel = "noopener noreferrer";
        const heading = el("h3", null);
        heading.appendChild(resourceLink);
        card.appendChild(heading);
        if (resource.description) {
          card.appendChild(el("p", null, resource.description));
        }
        const meta = el("div", "resource-meta");
        const whyLine = el("div", "meta-line");
        whyLine.appendChild(el("span", "meta-label", "Why use:"));
        whyLine.appendChild(el("span", "meta-value", resource.whyUse || ""));
        const forWhatLine = el("div", "meta-line");
        forWhatLine.appendChild(el("span", "meta-label", "For what:"));
        forWhatLine.appendChild(el("span", "meta-value", resource.forWhat || ""));
        meta.appendChild(whyLine);
        meta.appendChild(forWhatLine);
        card.appendChild(meta);
        resourceGrid.appendChild(card);
      });
      resources.appendChild(resourceGrid);
      grid.appendChild(resources);
    }

    if (data.learn.impactPlanning) {
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
          renderPlanner();
        });
        actions.appendChild(resetButton);

        card.appendChild(actions);
        summaryPanel.appendChild(card);
      };

      const renderPlanner = () => {
        entryPanel.classList.toggle("is-hidden", plannerState.started);
        workflowPanel.classList.toggle("is-hidden", !plannerState.started || plannerState.showSummary);
        summaryPanel.classList.toggle("is-hidden", !plannerState.showSummary);

        clear(entryPanel);
        clear(workflowPanel);

        const entryCard = el("div", "impact-planner-card");
        entryCard.appendChild(el("h3", "impact-planner-question", planner.entryQuestion));
        (planner.entryBody || []).forEach((line) => entryCard.appendChild(el("p", "card-text", line)));
        const stageList = el("ol", "impact-stage-list");
        (planner.stages || []).forEach((stage, index) => {
          stageList.appendChild(el("li", null, `${index + 1}. ${stage.title}`));
        });
        entryCard.appendChild(stageList);
        const startButton = el("button", "btn primary", planner.labels.start);
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
          field.appendChild(el("label", null, optional ? `${labelText} (${planner.labels.optional})` : labelText));
          const textarea = el("textarea", "impact-textarea");
          textarea.value = plannerState.values[key] || "";
          textarea.placeholder = placeholder || "";
          textarea.rows = 4;
          textarea.addEventListener("input", (e) => { plannerState.values[key] = e.target.value; });
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
            otherField.appendChild(el("label", null, promptConfig.otherLabel));
            const otherInput = el("input", "impact-input");
            otherInput.type = "text";
            otherInput.value = plannerState.values.otherOutputType;
            otherInput.placeholder = "Describe your output type";
            otherInput.addEventListener("input", (e) => { plannerState.values.otherOutputType = e.target.value; });
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
          select.addEventListener("change", (e) => { plannerState.values.outputConnection = e.target.value; });
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
      grid.appendChild(plannerSection);
    }

    container.appendChild(grid);

    const learnCta = el("section", "learn-cta");
    learnCta.appendChild(el("h2", "section-title", "Ready to put this into practice?"));
    const ctaRow = el("div", "learn-cta-row");
    const ctaBrowse = el("button", "btn btn-primary", "Browse support and workshops \u2192");
    ctaBrowse.type = "button";
    ctaBrowse.addEventListener("click", () => navigateTo("explore"));
    const ctaStage = el("button", "btn", "Find support for my stage \u2192");
    ctaStage.type = "button";
    ctaStage.addEventListener("click", () => navigateTo("support"));
    ctaRow.appendChild(ctaBrowse);
    ctaRow.appendChild(ctaStage);
    learnCta.appendChild(ctaRow);
    container.appendChild(learnCta);

    section.appendChild(container);
    return section;
  };

  const buildStories = () => {
    const section = el("section", "page page-stories");
    section.dataset.page = "stories";

    const container = el("div", "container");
    container.appendChild(el("h1", null, data.stories.title));
    container.appendChild(el("p", "lead", data.stories.intro));

    const grid = el("div", "stories-grid");
    data.stories.templates.forEach((story) => {
      const card = el("div", "story-card");
      card.appendChild(el("h3", null, story.title));
      card.appendChild(el("p", "card-text", story.description));
      grid.appendChild(card);
    });

    container.appendChild(grid);
    section.appendChild(container);
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
      const contactSection = el("div", "about-section");
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
    const tabServices = el("button", "explore-tab", "Browse Services");
    tabServices.type = "button";
    tabServices.dataset.tab = "services";
    tabsBar.appendChild(tabPathways);
    tabsBar.appendChild(tabResearch);
    tabsBar.appendChild(tabServices);
    container.appendChild(tabsBar);

    const baseOpportunities = data.explore.opportunities.map((item) => ({ ...item, sourceType: "default" }));
    const exploreItems = [...baseOpportunities, ...content.workshops];

    // === Pathways tab content ===
    const pathwaysTabContent = el("div", "explore-tab-content is-active");
    pathwaysTabContent.dataset.tabContent = "pathways";
    pathwaysTabContent.appendChild(el("p", "page-intro", data.explore.pathways.intro));

    const pathwayItems = data.explore.pathways.items;
    let activeExplorePathwayId = null;

    // --- Pill row (compact, visible when a pathway is active) ---
    const pillRow = el("div", "pathway-pill-row");
    pillRow.hidden = true;
    const pillButtons = new Map();
    pathwayItems.forEach((pathway) => {
      const key = pathwayIdToKey[pathway.id] || pathway.id;
      const pill = el("button", "pathway-pill");
      pill.type = "button";
      pill.dataset.pathway = key;
      pill.textContent = pathway.title;
      const color = pathwayColors[key];
      if (color) pill.style.background = color;
      pill.addEventListener("click", () => {
        if (activeExplorePathwayId === pathway.id) {
          closeExplorePanel();
        } else {
          openExplorePanel(pathway);
        }
      });
      pillButtons.set(pathway.id, pill);
      pillRow.appendChild(pill);
    });

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

    // --- Inline panel (slide-in, colored) ---
    const pathwayPanel = el("div", "pathway-viewer");
    const panelCard = el("div", "pathway-viewer-card");

    const panelHeader = el("div", "pathway-viewer-header");
    const panelTitle = el("h2", null, "");
    const panelNav = el("div", "pathway-nav");
    const panelPrevBtn = el("button", "btn btn-icon", "\u2190");
    panelPrevBtn.type = "button";
    panelPrevBtn.setAttribute("aria-label", data.explore.pathways.buttons.previous);
    const panelNextBtn = el("button", "btn btn-icon", "\u2192");
    panelNextBtn.type = "button";
    panelNextBtn.setAttribute("aria-label", data.explore.pathways.buttons.next);
    const panelCloseBtn = el("button", "btn btn-icon btn-icon--close", "\u00d7");
    panelCloseBtn.type = "button";
    panelCloseBtn.addEventListener("click", closeExplorePanel);
    panelNav.appendChild(panelPrevBtn);
    panelNav.appendChild(panelNextBtn);
    panelNav.appendChild(panelCloseBtn);
    panelHeader.appendChild(panelTitle);
    panelHeader.appendChild(panelNav);
    panelCard.appendChild(panelHeader);

    const panelSummary = el("p", "pathway-modal-summary", "");
    const panelLabel = el("p", "pathway-label", "");
    const panelActions = el("ul", "pathway-actions");
    panelCard.appendChild(panelSummary);
    panelCard.appendChild(panelLabel);
    panelCard.appendChild(panelActions);
    pathwayPanel.appendChild(panelCard);
    pathwaysTabContent.appendChild(pathwayPanel);
    pathwaysTabContent.appendChild(pillRow);

    // --- Related services section (below panel) ---
    const pathwayServicesSection = el("div", "pathway-services-section");
    pathwayServicesSection.hidden = true;
    pathwayServicesSection.appendChild(el("h3", "pathway-services-title", "Related services"));
    const pathwayServicesGrid = el("div", "opportunity-grid");
    pathwayServicesSection.appendChild(pathwayServicesGrid);
    pathwaysTabContent.appendChild(pathwayServicesSection);

    // --- Open/close logic ---
    function openExplorePanel(pathway) {
      activeExplorePathwayId = pathway.id;
      const key = pathwayIdToKey[pathway.id] || pathway.id;
      const color = pathwayColors[key];
      const currentIndex = pathwayItems.indexOf(pathway);
      const prevIndex = (currentIndex - 1 + pathwayItems.length) % pathwayItems.length;
      const nextIndex = (currentIndex + 1) % pathwayItems.length;

      // Grid → pills
      explorePathwayGrid.hidden = true;
      pillRow.hidden = false;
      pillButtons.forEach((btn, id) => btn.classList.toggle("is-active", id === pathway.id));

      // Panel content
      panelTitle.textContent = pathway.title;
      panelSummary.textContent = pathway.summary;
      panelLabel.textContent = pathway.label;
      clear(panelActions);
      (pathway.actions || []).forEach((action) => panelActions.appendChild(el("li", null, action)));
      pathwayPanel.style.background = color || "var(--burgundy)";
      pathwayPanel.classList.add("is-open");

      // Prev/Next handlers
      panelPrevBtn.onclick = () => openExplorePanel(pathwayItems[prevIndex]);
      panelNextBtn.onclick = () => openExplorePanel(pathwayItems[nextIndex]);

      // Filtered services
      const pathwayTitle = pathway.title;
      const filtered = exploreItems.filter((opp) => {
        const val = opp.pathway;
        return Array.isArray(val) ? val.includes(pathwayTitle) : val === pathwayTitle;
      });
      clear(pathwayServicesGrid);
      if (filtered.length) {
        filtered.forEach((opp) => {
          const card = el("div", "opportunity-card");
          card.appendChild(formatBadge(opp.format));
          card.appendChild(el("h3", null, opp.title));
          card.appendChild(el("p", "card-text", opp.summary));
          const meta = el("div", "opportunity-meta");
          [
            { label: data.explore.labels.category, value: opp.category },
            { label: data.explore.labels.stage, value: opp.stage },
            { label: data.explore.labels.time, value: opp.time }
          ].forEach((item) => {
            const displayValue = Array.isArray(item.value) ? item.value.join(", ") : item.value;
            if (!displayValue) return;
            const line = el("div", "meta-line");
            line.appendChild(el("span", "meta-label", item.label));
            line.appendChild(el("span", "meta-value", displayValue));
            meta.appendChild(line);
          });
          card.appendChild(meta);
          const tagList = el("div", "tag-list");
          (opp.tags || []).forEach((tag) => tagList.appendChild(el("span", "tag", tag)));
          card.appendChild(tagList);
          const cardActions = el("div", "card-actions");
          if (opp.sourceType === "workshop") {
            const btn = el("button", "btn primary", opp.libcalUrl ? "Register" : data.explore.buttons.details);
            btn.type = "button";
            btn.addEventListener("click", () => {
              if (opp.libcalUrl) window.open(opp.libcalUrl, "_blank", "noopener");
              else openModal(opp);
            });
            cardActions.appendChild(btn);
          } else {
            const detailBtn = el("button", "btn primary", data.explore.buttons.details);
            detailBtn.type = "button";
            detailBtn.addEventListener("click", () => openModal(opp));
            cardActions.appendChild(detailBtn);
          }
          card.appendChild(cardActions);
          pathwayServicesGrid.appendChild(card);
        });
      } else {
        pathwayServicesGrid.appendChild(el("p", "empty-state", "No services found for this pathway."));
      }
      pathwayServicesSection.hidden = false;
      pathwayPanel.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function closeExplorePanel() {
      activeExplorePathwayId = null;
      pathwayPanel.classList.remove("is-open");
      pathwayServicesSection.hidden = true;
      pillRow.hidden = true;
      explorePathwayGrid.hidden = false;
      pillButtons.forEach((btn) => btn.classList.remove("is-active"));
    }

    section.openPathwayInTab = (pathwayKey) => {
      const pathway = pathwayItems.find((p) => (pathwayIdToKey[p.id] || p.id) === pathwayKey);
      if (pathway) {
        tabPathways.click();
        openExplorePanel(pathway);
      }
    };

    container.appendChild(pathwaysTabContent);

    // === Research Stage tab content ===
    const researchTabContent = el("div", "explore-tab-content");
    researchTabContent.dataset.tabContent = "research";

    researchTabContent.appendChild(el("p", "lead", "Recommended support services and resources based on the stage of your research."));

    const journeys = data.start.journeys;
    let activeResearchJourneyId = null;

    // Helper: build one opportunity card for the research panel
    function buildResearchOpportunityCard(opp) {
      const card = el("div", "opportunity-card");
      card.appendChild(formatBadge(opp.format));
      card.appendChild(el("h3", null, opp.title));
      card.appendChild(el("p", "card-text", opp.summary));
      const meta = el("div", "opportunity-meta");
      [
        { label: data.explore.labels.category, value: opp.category },
        { label: data.explore.labels.stage, value: opp.stage },
        { label: data.explore.labels.time, value: opp.time }
      ].forEach((item) => {
        const displayValue = Array.isArray(item.value) ? item.value.join(", ") : item.value;
        if (!displayValue) return;
        const line = el("div", "meta-line");
        line.appendChild(el("span", "meta-label", item.label));
        line.appendChild(el("span", "meta-value", displayValue));
        meta.appendChild(line);
      });
      card.appendChild(meta);
      const cardActions = el("div", "card-actions");
      if (opp.sourceType === "workshop") {
        const btn = el("button", "btn primary", opp.libcalUrl ? "Register" : data.explore.buttons.details);
        btn.type = "button";
        btn.addEventListener("click", () => {
          if (opp.libcalUrl) window.open(opp.libcalUrl, "_blank", "noopener");
          else openModal(opp);
        });
        cardActions.appendChild(btn);
      } else {
        const detailBtn = el("button", "btn primary", data.explore.buttons.details);
        detailBtn.type = "button";
        detailBtn.addEventListener("click", () => openModal(opp));
        cardActions.appendChild(detailBtn);
      }
      card.appendChild(cardActions);
      return card;
    }

    // --- Pill row (compact, visible when a stage is active) ---
    const researchPillRow = el("div", "pathway-pill-row");
    researchPillRow.hidden = true;
    const researchPillButtons = new Map();
    journeys.forEach((journey) => {
      const pill = el("button", "pathway-pill");
      pill.type = "button";
      pill.textContent = journey.title;
      pill.addEventListener("click", () => {
        if (activeResearchJourneyId === journey.id) {
          closeResearchPanel();
        } else {
          openResearchPanel(journey);
        }
      });
      researchPillButtons.set(journey.id, pill);
      researchPillRow.appendChild(pill);
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

    const researchModulePrompt = el("p", "research-module-prompt", data.start.actions.modulePrompt);
    researchViewerCard.appendChild(researchModulePrompt);

    // Module chips (Level 2)
    const researchModuleChips = el("div", "research-module-chips");
    researchViewerCard.appendChild(researchModuleChips);

    // Module detail (Level 3)
    const researchModuleDetail = el("div", "research-module-detail");
    researchModuleDetail.hidden = true;
    const researchModuleDetailTitle = el("h3", "research-module-detail-title", "");
    const researchModuleDetailDesc = el("p", "research-module-detail-desc", "");
    const researchModuleDetailMeta = el("div", "module-meta");
    const researchModuleTypeItem = el("div", "meta-item");
    researchModuleTypeItem.appendChild(el("span", "meta-label", data.start.labels.type));
    const researchModuleTypeValue = el("span", "meta-value", "");
    researchModuleTypeItem.appendChild(researchModuleTypeValue);
    const researchModuleTimeItem = el("div", "meta-item");
    researchModuleTimeItem.appendChild(el("span", "meta-label", data.start.labels.time));
    const researchModuleTimeValue = el("span", "meta-value", "");
    researchModuleTimeItem.appendChild(researchModuleTimeValue);
    researchModuleDetailMeta.appendChild(researchModuleTypeItem);
    researchModuleDetailMeta.appendChild(researchModuleTimeItem);
    const researchResourcesHeading = el("h4", "research-resources-heading", "Relevant workshops \u0026 services");
    const researchResourcesGrid = el("div", "opportunity-grid");
    const researchSeeAllLink = el("a", "bridge-link", "");
    researchSeeAllLink.href = "#";
    researchModuleDetail.appendChild(researchModuleDetailTitle);
    researchModuleDetail.appendChild(researchModuleDetailDesc);
    researchModuleDetail.appendChild(researchModuleDetailMeta);
    researchModuleDetail.appendChild(researchResourcesHeading);
    researchModuleDetail.appendChild(researchResourcesGrid);
    researchModuleDetail.appendChild(researchSeeAllLink);
    researchViewerCard.appendChild(researchModuleDetail);

    // Panel CTAs
    const researchPanelActions = el("div", "module-actions");
    const researchOppBtn = el("button", "btn", data.start.actions.opportunities);
    researchOppBtn.type = "button";
    const researchContactBtn = el("button", "btn primary", data.start.actions.contact);
    researchContactBtn.type = "button";
    researchContactBtn.addEventListener("click", () => { navigateTo("about", "contact"); });
    researchPanelActions.appendChild(researchOppBtn);
    researchPanelActions.appendChild(researchContactBtn);
    researchViewerCard.appendChild(researchPanelActions);

    researchViewer.appendChild(researchViewerCard);

    researchTabContent.appendChild(researchStageGrid);
    researchTabContent.appendChild(researchPillRow);
    researchTabContent.appendChild(researchViewer);

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
      researchModuleDetail.hidden = true;

      clear(researchModuleChips);
      journey.modules.forEach((module) => {
        const chip = el("button", "research-module-chip", module.title);
        chip.type = "button";
        chip.addEventListener("click", () => openResearchModule(journey, module, chip));
        researchModuleChips.appendChild(chip);
      });

      researchPrevBtn.onclick = () => openResearchPanel(journeys[prevIndex]);
      researchNextBtn.onclick = () => openResearchPanel(journeys[nextIndex]);
      researchOppBtn.onclick = () => {
        tabServices.click();
        applyStageFilter(journey.stage);
      };

      researchViewer.classList.add("is-open");
      researchViewer.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function closeResearchPanel() {
      activeResearchJourneyId = null;
      researchViewer.classList.remove("is-open");
      researchPillRow.hidden = true;
      researchStageGrid.hidden = false;
      researchModuleDetail.hidden = true;
      researchPillButtons.forEach((btn) => btn.classList.remove("is-active"));
    }

    function openResearchModule(journey, module, chipEl) {
      researchModuleChips.querySelectorAll(".research-module-chip").forEach(c => c.classList.remove("is-active"));
      chipEl.classList.add("is-active");

      researchModuleDetailTitle.textContent = module.title;
      researchModuleDetailDesc.textContent = module.description;
      researchModuleTypeValue.textContent = module.type;
      researchModuleTimeValue.textContent = module.time;

      const workshopIds = Array.isArray(module.workshopIds) ? module.workshopIds : [];
      let matched;
      if (workshopIds.length > 0) {
        matched = exploreItems.filter(opp => workshopIds.includes(opp.id));
      } else {
        matched = exploreItems.filter(opp => {
          const val = opp.stage;
          return Array.isArray(val) ? val.includes(journey.stage) : val === journey.stage;
        }).slice(0, 4);
      }

      clear(researchResourcesGrid);
      if (matched.length) {
        matched.forEach(opp => researchResourcesGrid.appendChild(buildResearchOpportunityCard(opp)));
      } else {
        researchResourcesGrid.appendChild(el("p", "empty-state", "No services found. Check back soon."));
      }

      researchSeeAllLink.textContent = `See all support for ${journey.title} \u2192`;
      researchSeeAllLink.onclick = (e) => {
        e.preventDefault();
        tabServices.click();
        applyStageFilter(journey.stage);
      };

      researchModuleDetail.hidden = false;
    }

    researchTabContent.applySearchTerm = () => {};
    container.appendChild(researchTabContent);

    // === Browse Services tab content ===
    const servicesTabContent = el("div", "explore-tab-content");
    servicesTabContent.dataset.tabContent = "services";

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
      applyFilters();
    });
    searchWrap.appendChild(searchLabel);
    searchWrap.appendChild(searchInput);
    controls.appendChild(searchWrap);

    const filterGrid = el("div", "filter-grid");

    data.explore.filters.forEach((filter) => {
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

      let values = [];
      if (filter.id === "pathway") {
        values = data.explore.pathways.items.map((item) => item.title);
      } else {
        const valueSet = new Set();
        exploreItems.forEach((opp) => {
          const value = opp[filter.id];
          if (Array.isArray(value)) {
            value.forEach((entry) => valueSet.add(entry));
          } else if (value) {
            valueSet.add(value);
          }
        });
        values = Array.from(valueSet).sort();
      }

      values.forEach((value) => {
        const option = el("option", null, value);
        option.value = value;
        select.appendChild(option);
      });

      select.addEventListener("change", (event) => {
        state.filters[filter.id] = event.target.value;
        applyFilters();
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

    const resultsGrid = el("div", "opportunity-grid");

    explorerSection.appendChild(resultsMeta);
    explorerSection.appendChild(resultsGrid);
    servicesTabContent.appendChild(explorerSection);
    container.appendChild(servicesTabContent);

    // Tab switching logic
    const allTabs = [tabPathways, tabResearch, tabServices];
    const allContents = [pathwaysTabContent, researchTabContent, servicesTabContent];
    allTabs.forEach((tab, i) => {
      tab.addEventListener("click", () => {
        allTabs.forEach((t, j) => {
          t.classList.toggle("is-active", t === tab);
          allContents[j].classList.toggle("is-active", t === tab);
        });
      });
    });

    section.appendChild(container);

    const applyPathwayFilter = (pathwayTitle) => {
      const control = filterControls.get("pathway");
      if (control) {
        control.value = pathwayTitle;
        state.filters.pathway = pathwayTitle;
        applyFilters();
      }
      explorerSection.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const closeModal = () => {
      clear(modalRoot);
      document.body.classList.remove("is-modal-open");
    }

    const updateResults = (items) => {
      clear(resultsGrid);
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
          state.filters = { pathway: "", stage: "", category: "", format: "", time: "" };
          searchInput.value = "";
          filterControls.forEach((control) => { control.value = ""; });
          applyFilters();
        });
        const contactLink = el("a", "bridge-link", "Contact us for help \u2192");
        contactLink.href = "#about";
        contactLink.addEventListener("click", (e) => { e.preventDefault(); navigateTo("about", "contact"); });
        emptyActions.appendChild(clearBtn);
        emptyActions.appendChild(contactLink);
        empty.appendChild(emptyActions);
        resultsGrid.appendChild(empty);
        return;
      }

      items.forEach((opp) => {
        const card = el("div", "opportunity-card");
        card.appendChild(formatBadge(opp.format));
        card.appendChild(el("h3", null, opp.title));
        card.appendChild(el("p", "card-text", opp.summary));

        const meta = el("div", "opportunity-meta");
        const metaItems = [
          { label: data.explore.labels.category, value: opp.category },
          { label: data.explore.labels.stage, value: opp.stage },
          { label: data.explore.labels.time, value: opp.time }
        ];
        metaItems.forEach((item) => {
          const displayValue = Array.isArray(item.value) ? item.value.join(", ") : item.value;
          const line = el("div", "meta-line");
          line.appendChild(el("span", "meta-label", item.label));
          line.appendChild(el("span", "meta-value", displayValue || ""));
          meta.appendChild(line);
        });
        card.appendChild(meta);

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
        card.appendChild(tagList);

        const actions = el("div", "card-actions");
        if (opp.sourceType === "workshop") {
          const primaryButton = el("button", "btn primary", opp.libcalUrl ? "Register" : data.explore.buttons.details);
          primaryButton.type = "button";
          primaryButton.addEventListener("click", () => {
            if (opp.libcalUrl) {
              window.open(opp.libcalUrl, "_blank", "noopener");
            } else {
              openModal(opp);
            }
          });
          actions.appendChild(primaryButton);
        } else {
          const bookButton = el("button", "btn", data.explore.buttons.book);
          bookButton.type = "button";
          const detailButton = el("button", "btn primary", data.explore.buttons.details);
          detailButton.type = "button";
          detailButton.addEventListener("click", () => openModal(opp));
          actions.appendChild(bookButton);
          actions.appendChild(detailButton);
        }
        card.appendChild(actions);

        resultsGrid.appendChild(card);
      });
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
        card.appendChild(el("p", "card-text", opp.summary));
        const viewBtn = el("button", "btn primary", "View details");
        viewBtn.type = "button";
        viewBtn.addEventListener("click", () => openModal(opp));
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
        const categoryMatch = matchesField(opp.category, state.filters.category);
        const formatMatch = matchesField(opp.format, state.filters.format);
        const timeMatch = matchesField(opp.time, state.filters.time);

        return matchesSearch && pathwayMatch && stageMatch && categoryMatch && formatMatch && timeMatch;
      });

      updateResults(filtered);
    };

    const openModal = (opp) => {
      clear(modalRoot);
      document.body.classList.add("is-modal-open");
      const overlay = el("div", "modal-overlay");

      // Sticky top bar
      const topbar = el("div", "modal-topbar");
      const backBtn = el("button", "modal-back-btn", "\u2190 Back to Browse Services");
      backBtn.type = "button";
      backBtn.addEventListener("click", closeModal);
      topbar.appendChild(backBtn);
      const topbarActions = el("div", "modal-topbar-actions");
      if (opp.libcalUrl) {
        const registerBtn = el("a", "btn primary", "Register");
        registerBtn.href = opp.libcalUrl;
        registerBtn.target = "_blank";
        registerBtn.rel = "noopener";
        topbarActions.appendChild(registerBtn);
      }
      topbar.appendChild(topbarActions);
      overlay.appendChild(topbar);

      // Page content
      const modal = el("div", "modal");

      // Kicker + title
      if (opp.category) modal.appendChild(el("p", "modal-kicker", opp.category));
      modal.appendChild(el("h1", "modal-title", opp.title));

      // Metadata bar
      const metaBar = el("div", "modal-meta-bar");
      [
        { label: "Format", value: Array.isArray(opp.format) ? opp.format.join(", ") : opp.format },
        { label: "Time", value: Array.isArray(opp.time) ? opp.time.join(", ") : opp.time },
        { label: "Stage", value: Array.isArray(opp.stage) ? opp.stage.join(", ") : opp.stage },
        { label: "Pathway", value: Array.isArray(opp.pathway) ? opp.pathway.join(", ") : opp.pathway }
      ].forEach(({ label, value }) => {
        if (!value) return;
        const item = el("div", "modal-meta-item");
        item.innerHTML = `<strong>${label}:</strong> ${value}`;
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

      // Register CTA at bottom
      if (opp.libcalUrl) {
        const bottomCta = el("div", "modal-bottom-cta");
        const bottomBtn = el("a", "btn primary", "Register via LibCal");
        bottomBtn.href = opp.libcalUrl;
        bottomBtn.target = "_blank";
        bottomBtn.rel = "noopener";
        bottomCta.appendChild(bottomBtn);
        modal.appendChild(bottomCta);
      }

      overlay.appendChild(modal);

      // Keyboard close
      const onKeydown = (e) => {
        if (e.key === "Escape") { closeModal(); document.removeEventListener("keydown", onKeydown); }
      };
      document.addEventListener("keydown", onKeydown);

      modalRoot.appendChild(overlay);
      overlay.scrollTo(0, 0);
    };

    const applyStageFilter = (stage) => {
      tabServices.click();
      const control = filterControls.get("stage");
      if (control) {
        control.value = stage;
        state.filters.stage = stage;
        applyFilters();
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
      explorerSection.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const applySearchTerm = (rawSearch) => {
      const normalized = (rawSearch || "").trim();
      state.search = normalized;
      searchInput.value = normalized;
      applyFilters();
      explorerSection.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    applyFilters();

    section.applyStageFilter = applyStageFilter;
    section.applyPathwayFilterByKey = applyPathwayFilterByKey;
    section.focusWorkshopById = focusWorkshopById;
    section.applySearchTerm = applySearchTerm;
    section.openResearchStage = (journeyId) => {
      tabResearch.click();
      const journey = journeys.find(j => j.id === journeyId);
      if (journey) openResearchPanel(journey);
    };
    section.openTab = (tabName) => {
      if (tabName === "research") tabResearch.click();
      else if (tabName === "services") tabServices.click();
      else tabPathways.click();
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
    const storiesPage = STORIES_ENABLED ? buildStories() : null;
    const aboutPage = buildAbout();

    pages.set("home", homePage);
    pages.set("start", startPage);
    pages.set("support", supportPage);
    pages.set("learn", learnPage);
    pages.set("pathways-vision", pathwaysVisionPage);
    pages.set("explore", explorePage);
    if (STORIES_ENABLED && storiesPage) {
      pages.set("stories", storiesPage);
    }
    pages.set("about", aboutPage);

    appRoot.appendChild(homePage);
    appRoot.appendChild(startPage);
    appRoot.appendChild(supportPage);
    appRoot.appendChild(learnPage);
    appRoot.appendChild(pathwaysVisionPage);
    appRoot.appendChild(explorePage);
    if (STORIES_ENABLED && storiesPage) {
      appRoot.appendChild(storiesPage);
    }
    appRoot.appendChild(aboutPage);
  };

  const setActiveNav = (pageId) => {
    const activePageId = pageId === "pathways-vision" ? "about" : pageId;
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

    if (validPage === "explore") {
      const explorePage = pages.get("explore");
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
      if (explorePage && explorePage.openTab && state.pendingExploreTab) {
        explorePage.openTab(state.pendingExploreTab);
        state.pendingExploreTab = "";
      }
      if (explorePage && explorePage.applySearchTerm) {
        explorePage.applySearchTerm(state.pendingExploreSearch);
      }
      state.pendingExploreSearch = "";
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
    await loadWorkshopContent();
    await loadPathwaysVisionContent();
    buildHeader();
    buildContextBar();
    buildFooter();
    buildPages();

    const initialRoute = parseRouteFromHash(window.location.hash);
    if (initialRoute.page === "explore") {
      state.pendingPathwayKey = (initialRoute.params.get("pathway") || "").toLowerCase();
    }
    if (initialRoute.page === "explore") {
      state.pendingWorkshopId = initialRoute.params.get("workshop") || "";
      state.pendingExploreSearch = initialRoute.params.get("q") || "";
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
      state.pendingSupportSearch = nextRoute.page === "support"
        ? (nextRoute.params.get("q") || "")
        : "";
      showPage(nextRoute.page, nextRoute.anchorId);
    });

    window.applyStageFilter = applyStageFilter;
  };

  init();
})();
