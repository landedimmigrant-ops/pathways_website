(() => {
  const data = window.PATHWAYS_DATA;
  if (!data) {
    return;
  }
  // TEMP: hide Stories in navigation and page rendering without deleting feature code.
  const STORIES_ENABLED = false;
  // TEMP: hide Upcoming grants section on Home without deleting its code.
  const UPCOMING_GRANTS_ENABLED = false;

  const siteHeader = document.getElementById("site-header");
  const appRoot = document.getElementById("app");
  const modalRoot = document.getElementById("modal-root");
  let routeFooter = null;

  document.title = data.meta.title || "";

  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
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
  const normalizePathwayKey = (value) => String(value || "").trim().toLowerCase().replace(/_/g, "-");
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
  const pathwayTitleToKey = Object.keys(pathwayKeyToTitle).reduce((acc, key) => {
    acc[pathwayKeyToTitle[key]] = key;
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
      .filter((item) => ["home", "support", "explore", "learn", "about", "stories"].includes(item.id))
      .filter((item) => STORIES_ENABLED || item.id !== "stories");

    navItems.forEach((item) => {
      const li = el("li");
      const link = el("a", "nav-link", item.label);
      link.href = item.id === "explore" ? "#opportunities" : `#${item.id}`;
      link.dataset.page = item.id;
      link.addEventListener("click", (event) => {
        event.preventDefault();
        navigateTo(item.id);
      });
      li.appendChild(link);
      navList.appendChild(li);
    });

    nav.appendChild(navList);
    brandBlock.appendChild(brandLink);
    brandBlock.appendChild(nav);
    container.appendChild(brandBlock);
    header.appendChild(container);
    siteHeader.appendChild(header);
  };

  const buildFooter = () => {
    routeFooter = el("footer", "route-footer");
    const container = el("div", "container");
    const link = el("a", "route-footer-link", "Lost? Start with your research stage →");
    link.href = "#start";
    link.addEventListener("click", (event) => {
      event.preventDefault();
      navigateTo("start");
    });
    container.appendChild(link);
    routeFooter.appendChild(container);
    document.body.insertBefore(routeFooter, modalRoot);
  };

  const buildHome = () => {
    const section = el("section", "page page-home");
    section.dataset.page = "home";

    const container = el("div", "container");
    const introSection = el("section", "home-intro");
    const introBlock = el("div", "intro-block");
    data.home.hero.summary.forEach((line) => {
      if (line === "Explore support through seven connected pathways:") {
        return;
      }
      const paragraph = el("p", "lead");
      const segments = line.split("\n");
      segments.forEach((segment, index) => {
        paragraph.appendChild(document.createTextNode(segment));
        if (index < segments.length - 1) {
          paragraph.appendChild(document.createElement("br"));
        }
      });
      introBlock.appendChild(paragraph);
    });

    introSection.appendChild(introBlock);
    container.appendChild(introSection);
    container.appendChild(el("hr", "section-divider"));

    const pathwayItems = data.explore.pathways.items;
    const pathwaysSection = el("section", "home-pathways");
    const pathwayGrid = el("div", "pathway-grid");
    pathwayItems.forEach((pathway) => {
      const card = el("button", "pathway-card");
      card.type = "button";
      const pathwayKey = pathwayIdToKey[pathway.id] || pathway.id;
      card.dataset.pathway = pathwayKey;
      card.appendChild(el("h3", null, pathway.title));
      card.appendChild(el("p", "card-text", pathway.summary));
      card.addEventListener("click", () => {
        navigateTo("explore", "", { pathway: pathwayKey });
      });
      pathwayGrid.appendChild(card);
    });
    pathwaysSection.appendChild(pathwayGrid);
    container.appendChild(pathwaysSection);
    container.appendChild(el("hr", "section-divider"));

    const stageSection = el("section", "home-stage-section");
    stageSection.appendChild(el("p", "home-stage-intro", "You can also explore Pathways based on where you are in your research."));
    const cardGrid = el("div", "journey-grid");
    data.home.hero.cards.forEach((card) => {
      const cardLink = el("a", "journey-card");
      const supportAnchor = supportAnchorByJourneyId[card.id];
      cardLink.href = supportAnchor ? `#${supportAnchor}` : "#support";
      cardLink.dataset.journey = card.id;
      cardLink.appendChild(el("h3", null, card.title));
      cardLink.appendChild(el("p", "card-text", card.description));
      cardGrid.appendChild(cardLink);
    });
    stageSection.appendChild(cardGrid);
    container.appendChild(stageSection);

    container.appendChild(el("hr", "section-divider"));

    if (UPCOMING_GRANTS_ENABLED) {
      const grantsSection = el("section", "upcoming-grants-section");
      grantsSection.appendChild(el("h2", "section-title", data.home.upcomingGrants.title));
      grantsSection.appendChild(el("p", "card-text", data.home.upcomingGrants.lead));

      const grantsGrid = el("div", "topic-grid");
      data.home.upcomingGrants.items.slice(0, 3).forEach((item) => {
        const tile = el("article", "opportunity-card");
        tile.style.aspectRatio = "1 / 1";
        tile.style.display = "flex";
        tile.style.flexDirection = "column";

        tile.appendChild(el("h3", null, item.title));
        tile.appendChild(el("p", "card-text", item.description));

        const meta = el("div", "contact-list");
        meta.appendChild(el("div", null, `Type: ${item.type}`));
        meta.appendChild(el("div", null, `Amount: ${item.amount}`));
        meta.appendChild(el("div", null, `Duration: ${item.duration}`));
        tile.appendChild(meta);

        const actions = el("div", "card-actions");
        actions.style.marginTop = "auto";
        const viewLink = el("a", "route-footer-link", data.home.upcomingGrants.ctaLabel);
        viewLink.href = "#explore";
        viewLink.addEventListener("click", (event) => {
          event.preventDefault();
          navigateTo("explore");
        });
        actions.appendChild(viewLink);
        tile.appendChild(actions);
        grantsGrid.appendChild(tile);
      });

      grantsSection.appendChild(grantsGrid);
      container.appendChild(grantsSection);
      container.appendChild(el("hr", "section-divider"));
    }

    const popular = el("section", "popular-section");
    popular.appendChild(el("h2", "section-title", "Popular support"));

    const popularGrid = el("div", "topic-grid");
    const featuredWorkshops = content.workshops.filter((item) => item.featuredHome).slice(0, 3);
    const fallbackPopular = data.home.popular && Array.isArray(data.home.popular.items)
      ? data.home.popular.items.slice(0, 3)
      : [];
    const popularItems = featuredWorkshops.length ? featuredWorkshops : fallbackPopular;

    popularItems.forEach((item) => {
      const tile = el("article", "opportunity-card");
      tile.style.aspectRatio = "1 / 1";
      tile.style.display = "flex";
      tile.style.flexDirection = "column";

      tile.appendChild(el("h3", null, item.title));
      if (item.description) {
        tile.appendChild(el("p", "card-text", item.description));
      }

      const actions = el("div", "card-actions");
      actions.style.marginTop = "auto";
      const viewButton = el("button", "btn primary", "View");
      viewButton.type = "button";
      viewButton.addEventListener("click", () => {
        if (item.sourceType === "workshop") {
          navigateTo("explore", "opportunity-explorer", { workshop: item.id });
        } else {
          navigateTo("explore");
        }
      });
      actions.appendChild(viewButton);
      tile.appendChild(actions);
      popularGrid.appendChild(tile);
    });

    popular.appendChild(popularGrid);
    const exploreOpportunitiesButton = el("a", "btn btn-ghost-burgundy btn-small", "Explore Opportunities →");
    exploreOpportunitiesButton.href = "#opportunities";
    exploreOpportunitiesButton.addEventListener("click", (event) => {
      event.preventDefault();
      navigateTo("explore");
    });
    popular.appendChild(exploreOpportunitiesButton);
    container.appendChild(popular);
    section.appendChild(container);
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

    container.appendChild(grid);
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
    const baseOpportunities = data.explore.opportunities.map((item) => ({ ...item, sourceType: "default" }));
    const exploreItems = [...baseOpportunities, ...content.workshops];
    const pathwayAccentByKey = {
      academic: "#912338",
      community: "#db0272",
      innovation: "#da3a16",
      commercialization: "#573996",
      communications: "#e5a712",
      policy: "#0072a8",
      "research-creation": "#508212"
    };
    const pathwayTextByKey = {
      academic: "#ffffff",
      community: "#ffffff",
      innovation: "#ffffff",
      commercialization: "#ffffff",
      communications: "#1a1a1a",
      policy: "#ffffff",
      "research-creation": "#ffffff"
    };
    const pathwayContextByKey = data.explore.pathways.items.reduce((acc, item) => {
      const key = pathwayIdToKey[item.id] || item.id;
      acc[key] = item;
      return acc;
    }, {});

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
    const pathwayContext = el("section", "pathway-context is-hidden");
    const pathwayContextTop = el("div", "pathway-context-top");
    const pathwayContextTitle = el("h2", "section-title");
    const pathwayContextSummary = el("p", "card-text");
    const pathwayContextSecondary = el("p", "pathway-context-body is-hidden");
    pathwayContextTop.appendChild(pathwayContextTitle);
    pathwayContextTop.appendChild(pathwayContextSummary);
    pathwayContextTop.appendChild(pathwayContextSecondary);

    const pathwayContextBottom = el("div", "pathway-context-bottom");
    const pathwayContextLabel = el("p", "pathway-context-label");
    const pathwayContextActions = el("ul", "pathway-context-list");
    pathwayContextBottom.appendChild(pathwayContextLabel);
    pathwayContextBottom.appendChild(pathwayContextActions);

    const clearPathwayButton = el("button", "btn btn-small pathway-context-clear", "Clear pathway filter");
    clearPathwayButton.type = "button";
    clearPathwayButton.addEventListener("click", () => {
      const control = filterControls.get("pathway");
      if (control) {
        control.value = "";
      }
      state.filters.pathway = "";
      applyFilters();
    });
    pathwayContext.appendChild(pathwayContextTop);
    pathwayContext.appendChild(pathwayContextBottom);
    pathwayContext.appendChild(clearPathwayButton);
    explorerSection.appendChild(pathwayContext);
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
    container.appendChild(explorerSection);

    section.appendChild(container);

    const updatePathwayContext = () => {
      const selectedTitle = state.filters.pathway;
      if (!selectedTitle) {
        pathwayContext.classList.add("is-hidden");
        pathwayContext.style.removeProperty("--pathway-accent");
        pathwayContext.style.removeProperty("--pathway-foreground");
        return;
      }
      const selectedKey = normalizePathwayKey(pathwayTitleToKey[selectedTitle] || selectedTitle);
      const contextPathway = pathwayContextByKey[selectedKey];
      if (!contextPathway) {
        pathwayContext.classList.add("is-hidden");
        pathwayContext.style.removeProperty("--pathway-accent");
        pathwayContext.style.removeProperty("--pathway-foreground");
        return;
      }
      pathwayContextTitle.textContent = contextPathway.title;
      pathwayContextSummary.textContent = contextPathway.summary;
      const secondaryText = contextPathway.secondary
        || contextPathway.secondarySummary
        || contextPathway.description
        || contextPathway.body
        || "";
      if (secondaryText) {
        pathwayContextSecondary.textContent = secondaryText;
        pathwayContextSecondary.classList.remove("is-hidden");
      } else {
        pathwayContextSecondary.textContent = "";
        pathwayContextSecondary.classList.add("is-hidden");
      }
      pathwayContextLabel.textContent = contextPathway.label || "What this pathway supports";

      clear(pathwayContextActions);
      (contextPathway.actions || []).slice(0, 4).forEach((item) => {
        pathwayContextActions.appendChild(el("li", null, item));
      });

      pathwayContext.style.setProperty("--pathway-accent", pathwayAccentByKey[selectedKey] || "#912338");
      pathwayContext.style.setProperty("--pathway-foreground", pathwayTextByKey[selectedKey] || "#ffffff");
      pathwayContext.classList.remove("is-hidden");
    };

    const applyPathwayFilter = (pathwayTitle) => {
      const control = filterControls.get("pathway");
      if (control) {
        control.value = pathwayTitle;
        state.filters.pathway = pathwayTitle;
        applyFilters();
      }
      if (pathwayTitle) {
        explorerSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
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
        resultsGrid.appendChild(empty);
        return;
      }

      items.forEach((opp) => {
        const card = el("div", "opportunity-card");
        card.appendChild(el("h3", null, opp.title));
        card.appendChild(el("p", "card-text", opp.summary));

        const meta = el("div", "opportunity-meta");
        const metaItems = [
          { label: data.explore.labels.category, value: opp.category },
          { label: data.explore.labels.stage, value: opp.stage },
          { label: data.explore.labels.format, value: opp.format },
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

    const applyFilters = () => {
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
      updatePathwayContext();
    };

    const openModal = (opp) => {
      clear(modalRoot);
      document.body.classList.add("is-modal-open");
      const overlay = el("div", "modal-overlay");
      const modal = el("div", "modal");

      const header = el("div", "modal-header");
      header.appendChild(el("h3", null, opp.title));
      const closeButton = el("button", "btn", data.explore.buttons.close);
      closeButton.type = "button";
      closeButton.addEventListener("click", closeModal);
      header.appendChild(closeButton);
      modal.appendChild(header);

      const body = el("div", "modal-body");
      if (opp.sourceType === "workshop") {
        const workshopContent = el("div", "modal-section");
        workshopContent.innerHTML = opp.html;
        body.appendChild(workshopContent);
        modal.appendChild(body);
        overlay.appendChild(modal);
        overlay.addEventListener("click", (event) => {
          if (event.target === overlay) {
            closeModal();
          }
        });
        modalRoot.appendChild(overlay);
        return;
      }

      const overview = el("div", "modal-section");
      overview.appendChild(el("h4", null, data.explore.labels.overview));
      overview.appendChild(el("p", null, opp.summary));
      body.appendChild(overview);

      const who = el("div", "modal-section");
      who.appendChild(el("h4", null, data.explore.labels.who));
      who.appendChild(el("p", null, opp.details.who));
      body.appendChild(who);

      const what = el("div", "modal-section");
      what.appendChild(el("h4", null, data.explore.labels.what));
      what.appendChild(el("p", null, opp.details.what));
      body.appendChild(what);

      const outcomes = el("div", "modal-section");
      outcomes.appendChild(el("h4", null, data.explore.labels.outcomes));
      outcomes.appendChild(el("p", null, opp.details.outcomes));
      body.appendChild(outcomes);

      const meta = el("div", "modal-section");
      meta.appendChild(el("h4", null, data.explore.labels.tags));
      const metaList = el("div", "tag-list");
      opp.tags.forEach((tag) => metaList.appendChild(el("span", "tag", tag)));
      meta.appendChild(metaList);
      body.appendChild(meta);

      modal.appendChild(body);
      overlay.appendChild(modal);
      overlay.addEventListener("click", (event) => {
        if (event.target === overlay) {
          closeModal();
        }
      });
      modalRoot.appendChild(overlay);
    };

    const applyStageFilter = (stage) => {
      const control = filterControls.get("stage");
      if (control) {
        control.value = stage;
        state.filters.stage = stage;
        applyFilters();
        control.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    };

    const applyPathwayFilterByKey = (pathwayKey) => {
      const pathwayTitle = pathwayKeyToTitle[normalizePathwayKey(pathwayKey)];
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
    return section;
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
      if (explorePage && explorePage.applyPathwayFilterByKey && state.pendingPathwayKey) {
        explorePage.applyPathwayFilterByKey(state.pendingPathwayKey);
        state.pendingPathwayKey = "";
      }
      if (explorePage && explorePage.focusWorkshopById && state.pendingWorkshopId) {
        explorePage.focusWorkshopById(state.pendingWorkshopId);
        state.pendingWorkshopId = "";
      }
      if (explorePage && explorePage.applySearchTerm) {
        explorePage.applySearchTerm(state.pendingExploreSearch);
      }
      state.pendingExploreSearch = "";
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
    if (validPage === "home") return "#home";
    if (validPage === "explore") return "#opportunities";
    return `#${validPage}`;
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
      ? normalizePathwayKey(options.pathway)
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
    const normalizedPagePart = pagePart === "opportunities" ? "explore" : pagePart;
    const page = normalizedPagePart && pages.has(normalizedPagePart) ? normalizedPagePart : "home";
    return { page, params: new URLSearchParams(queryPart), anchorId: "" };
  };

  const init = async () => {
    await loadWorkshopContent();
    await loadPathwaysVisionContent();
    buildHeader();
    buildFooter();
    buildPages();

    const initialRoute = parseRouteFromHash(window.location.hash);
    if (initialRoute.page === "explore") {
      state.pendingPathwayKey = normalizePathwayKey(initialRoute.params.get("pathway"));
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
        ? normalizePathwayKey(nextRoute.params.get("pathway"))
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
