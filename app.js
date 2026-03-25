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

      // Tools callout — shown for Academic Scholarship pathway
      if (pathway.id === "academic-scholarship") {
        const pathwayToolsCallout = el("div", "pathway-tools-callout");
        pathwayToolsCallout.appendChild(el("p", "pathway-tools-callout-heading", "\uD83D\uDEE0 Prepare your application with the interactive tools in Learn"));
        pathwayToolsCallout.appendChild(el("p", "pathway-tools-callout-body", "Use the Impact Planner to map your contribution and the Narrative CV module to draft your Tri-agency CV sections."));
        const pathwayToolsBtns = el("div", "module-tools-callout-btns");
        const ptPlannerBtn = el("button", "btn btn-primary", "Impact Planner \u2192");
        ptPlannerBtn.type = "button";
        ptPlannerBtn.addEventListener("click", () => { closePathwayModal(); navigateTo("learn"); });
        const ptNarrativeBtn = el("button", "btn", "Narrative CV \u2192");
        ptNarrativeBtn.type = "button";
        ptNarrativeBtn.addEventListener("click", () => { closePathwayModal(); navigateTo("tools-narrative"); });
        pathwayToolsBtns.appendChild(ptPlannerBtn);
        pathwayToolsBtns.appendChild(ptNarrativeBtn);
        pathwayToolsCallout.appendChild(pathwayToolsBtns);
        wrapper.appendChild(pathwayToolsCallout);
      }

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

    // ── Tab bar ──────────────────────────────────────────────────────────
    const learnTabsBar = el("div", "explore-tabs");
    const tabTools = el("button", "explore-tab is-active", "Tools");
    tabTools.type = "button";
    const tabImpact101 = el("button", "explore-tab", "Impact 101");
    tabImpact101.type = "button";
    learnTabsBar.appendChild(tabTools);
    learnTabsBar.appendChild(tabImpact101);
    container.appendChild(learnTabsBar);

    // ── Tools tab content ────────────────────────────────────────────────
    const toolsContent = el("div", "explore-tab-content is-active");

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
    step2Card.appendChild(el("h2", null, "Build Your Research Story"));
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
    const impact101Content = el("div", "explore-tab-content");

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

    impact101Content.appendChild(grid);

    // ── Wire up tabs ─────────────────────────────────────────────────────
    container.appendChild(toolsContent);
    container.appendChild(impact101Content);

    const learnTabs = [tabTools, tabImpact101];
    const learnContents = [toolsContent, impact101Content];
    learnTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        learnTabs.forEach((t, j) => {
          t.classList.toggle("is-active", t === tab);
          learnContents[j].classList.toggle("is-active", t === tab);
        });
      });
    });

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
        field.appendChild(el("label", null, optional ? `${labelText} (${planner.labels.optional})` : labelText));
        const textarea = el("textarea", "impact-textarea");
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
          otherField.appendChild(el("label", null, promptConfig.otherLabel));
          const otherInput = el("input", "impact-input");
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
    step2Card.appendChild(el("h2", null, "Build Your Research Story"));
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
      timeMode: "",
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
    const progressTitle = el("h2", null, "Build Your Research Story");
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
        const done = (i === 0 && (ns.funder !== "" || ns.timeMode !== ""))
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

      // Time selector
      const timeLabel = el("p", "narrative-toggle-label", "How long do you have today?");
      wrap.appendChild(timeLabel);
      const timeToggle = el("div", "narrative-time-toggle");
      [{ val: "short", label: "30 min" }, { val: "medium", label: "1 hour" }, { val: "long", label: "More time" }].forEach(({ val, label }) => {
        const btn = el("button", "narrative-toggle-btn", label);
        btn.type = "button";
        if (ns.timeMode === val) btn.classList.add("is-active");
        btn.addEventListener("click", () => {
          ns.timeMode = val;
          saveNarrative();
          timeToggle.querySelectorAll(".narrative-toggle-btn").forEach((b) => b.classList.remove("is-active"));
          btn.classList.add("is-active");
        });
        timeToggle.appendChild(btn);
      });
      wrap.appendChild(timeToggle);

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
            const lbl = el("label", null, label);
            field.appendChild(lbl);
            const ta = el("textarea", null);
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
          field.appendChild(el("label", null, label));
          const ta = el("textarea", null);
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
      roleInput.placeholder = "role / discipline";
      roleInput.value = ns.ps.role || "";
      roleInput.addEventListener("input", (e) => { ns.ps.role = e.target.value; saveNarrative(); rebuildPreview(); });
      row1.appendChild(roleInput);
      row1.appendChild(el("span", "ps-literal", "at"));
      const instInput = el("input", "ps-input");
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
      focusInput.placeholder = "core theme or question";
      focusInput.value = ns.ps.focus || "";
      focusInput.addEventListener("input", (e) => { ns.ps.focus = e.target.value; saveNarrative(); rebuildPreview(); });
      row2.appendChild(focusInput);
      row2.appendChild(el("span", "ps-literal", "with particular attention to"));
      const emphInput = el("input", "ps-input ps-input--wide");
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
          action: () => navigateTo("about", "contact")
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

    // Tools nudge (shown for Developing an Idea stage)
    const researchToolsNudge = el("div", "research-tools-nudge");
    researchToolsNudge.hidden = true;
    const nudgeIcon = el("span", "tools-nudge-icon", "\uD83D\uDCCB");
    const nudgeText = el("span", "tools-nudge-text", "Start by mapping your research impact with the Impact Planner, then build your Narrative CV outline.");
    const nudgeBtn = el("button", "btn btn-primary tools-nudge-btn", "Go to Tools \u2192");
    nudgeBtn.type = "button";
    nudgeBtn.addEventListener("click", () => navigateTo("learn"));
    researchToolsNudge.appendChild(nudgeIcon);
    researchToolsNudge.appendChild(nudgeText);
    researchToolsNudge.appendChild(nudgeBtn);
    researchViewerCard.appendChild(researchToolsNudge);

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
    // Module tools callout (shown for grant/funding/narrative/application modules)
    const moduleToolsCallout = el("div", "module-tools-callout");
    moduleToolsCallout.hidden = true;
    const calloutInner = el("div", "module-tools-callout-inner");
    calloutInner.appendChild(el("p", "module-tools-callout-heading", "\uD83D\uDEE0 Use the interactive tools in Learn"));
    calloutInner.appendChild(el("p", "module-tools-callout-body", "The Impact Planner helps you map outcomes and pathways before writing. The Narrative CV module helps you translate that plan into funder-ready language."));
    const calloutBtns = el("div", "module-tools-callout-btns");
    const plannerBtn = el("button", "btn btn-primary", "Impact Planner \u2192");
    plannerBtn.type = "button";
    plannerBtn.addEventListener("click", () => navigateTo("learn"));
    const narrativeBtn = el("button", "btn", "Narrative CV \u2192");
    narrativeBtn.type = "button";
    narrativeBtn.addEventListener("click", () => navigateTo("tools-narrative"));
    calloutBtns.appendChild(plannerBtn);
    calloutBtns.appendChild(narrativeBtn);
    calloutInner.appendChild(calloutBtns);
    moduleToolsCallout.appendChild(calloutInner);

    researchModuleDetail.appendChild(researchModuleDetailTitle);
    researchModuleDetail.appendChild(researchModuleDetailDesc);
    researchModuleDetail.appendChild(researchModuleDetailMeta);
    researchModuleDetail.appendChild(researchResourcesHeading);
    researchModuleDetail.appendChild(researchResourcesGrid);
    researchModuleDetail.appendChild(researchSeeAllLink);
    researchModuleDetail.appendChild(moduleToolsCallout);
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
      researchToolsNudge.hidden = journey.id !== "developing-project";

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

      const TOOLS_MODULE_KEYWORDS = ["grant", "funding", "application", "narrative", "proposal"];
      moduleToolsCallout.hidden = !TOOLS_MODULE_KEYWORDS.some(kw => module.title.toLowerCase().includes(kw));

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

      // Bottom CTA — always present, exactly one
      const bottomCta = el("div", "modal-bottom-cta");
      const fmt = (opp.format || "").toString().toLowerCase();
      if (opp.libcalUrl) {
        const ctaLabel = fmt.includes("workshop") ? "Register for this workshop" : "Register";
        const ctaBtn = el("a", "btn primary modal-cta-btn", ctaLabel);
        ctaBtn.href = opp.libcalUrl;
        ctaBtn.target = "_blank";
        ctaBtn.rel = "noopener";
        bottomCta.appendChild(ctaBtn);
      } else if (fmt.includes("consult")) {
        const ctaBtn = el("button", "btn primary modal-cta-btn", "Book a consultation");
        ctaBtn.type = "button";
        ctaBtn.addEventListener("click", () => { closeModal(); navigateTo("about", "contact-form"); });
        bottomCta.appendChild(ctaBtn);
      } else {
        const ctaBtn = el("button", "btn primary modal-cta-btn", "Contact us about this");
        ctaBtn.type = "button";
        ctaBtn.addEventListener("click", () => { closeModal(); navigateTo("about", "contact-form"); });
        bottomCta.appendChild(ctaBtn);
      }
      modal.appendChild(bottomCta);

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
          const cardBtn = el("button", "btn", "View details");
          cardBtn.type = "button";
          cardBtn.addEventListener("click", () => openModal(item));
          card.appendChild(cardBtn);
          relatedGrid.appendChild(card);
        });
        relatedSection.appendChild(relatedGrid);
        modal.appendChild(relatedSection);
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
    const toolsPage = buildTools();
    const narrativePage = buildNarrativeModule();
    const storiesPage = STORIES_ENABLED ? buildStories() : null;
    const aboutPage = buildAbout();

    pages.set("home", homePage);
    pages.set("start", startPage);
    pages.set("support", supportPage);
    pages.set("learn", learnPage);
    pages.set("pathways-vision", pathwaysVisionPage);
    pages.set("explore", explorePage);
    pages.set("tools", toolsPage);
    pages.set("tools-narrative", narrativePage);
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
    appRoot.appendChild(toolsPage);
    appRoot.appendChild(narrativePage);
    if (STORIES_ENABLED && storiesPage) {
      appRoot.appendChild(storiesPage);
    }
    appRoot.appendChild(aboutPage);
  };

  const setActiveNav = (pageId) => {
    const activePageId = pageId === "pathways-vision" ? "about"
      : pageId === "tools-narrative" || pageId === "tools" ? "learn"
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
