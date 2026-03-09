window.PATHWAYS_DATA = {
  meta: {
    title: "Pathways to Impact",
    description: "Pathways to Impact helps researchers plan, evidence, and share the value of their work."
  },
  brand: {
    name: "Pathways to Impact",
    homeAriaLabel: "Go to Pathways to Impact home"
  },
  navigation: [
    { id: "home", label: "Home" },
    { id: "support", label: "Support" },
    { id: "explore", label: "Explore" },
    { id: "learn", label: "Learn" },
    { id: "about", label: "About" }
  ],
  units: [
    {
      id: "research-development",
      name: "Research Development",
      shortCode: "RD",
      url: "https://www.concordia.ca/research.html",
      group: "office-research"
    },
    {
      id: "pips",
      name: "Partnerships, Intellectual Property and Security (PIPS)",
      shortCode: "PIPS",
      url: "https://www.concordia.ca/research.html",
      group: "office-research"
    },
    {
      id: "4th-space",
      name: "4th Space",
      shortCode: "4S",
      url: "https://www.concordia.ca/next-gen/4th-space.html",
      group: "campus"
    },
    {
      id: "concordia-library",
      name: "Concordia Library",
      shortCode: "LIB",
      url: "https://library.concordia.ca/",
      group: "campus"
    },
    {
      id: "district-3",
      name: "District 3",
      shortCode: "D3",
      url: "https://district3.co/",
      group: "campus"
    },
    {
      id: "university-communications-services",
      name: "University Communications Services",
      shortCode: "UCS",
      url: "https://www.concordia.ca/news/authors/university-communications-services.html",
      group: "campus"
    },
    {
      id: "shift-centre",
      name: "SHIFT Centre for Social Transformation",
      shortCode: "SHIFT",
      url: "https://www.concordia.ca/about/shift.html",
      group: "campus"
    },
    {
      id: "office-community-engagement",
      name: "Office of Community Engagement",
      shortCode: "OCE",
      url: "https://www.concordia.ca/about/community.html",
      group: "campus"
    },
    {
      id: "v1-studio",
      name: "V1 Studio",
      shortCode: "V1",
      url: "https://www.v1.studio/",
      group: "external"
    }
  ],
  workshopUnitTags: {
    "narrative-cv": ["RD"],
    "open-scholarship": ["LIB"],
    "rdm-guidance": ["LIB"]
  },
  home: {
    hero: {
      title: "Pathways to Impact",
      summary: [
        "Pathways to Impact helps you explore how your research can create change.",
        "Research impact can take many forms. Your work may influence academic scholarship, inform policy, support communities, inspire innovation, or shape public understanding.",
        "The Pathways help you discover different ways your research can have impact and connect you to practical support across the university."
      ],
      ctaLabel: "Explore the Pathways →",
      ctaTarget: "#explore",
      prompt: "Where are you in your research?",
      cards: [
        {
          id: "developing-project",
          title: "Developing an Idea",
          description: "Shaping research questions, building collaborations, and preparing funding applications."
        },
        {
          id: "ongoing-project",
          title: "Active Research",
          description: "Managing an ongoing project, building partnerships, generating outputs, and planning impact pathways."
        },
        {
          id: "wrapping-up-project",
          title: "Wrapping Up",
          description: "Sharing results, translating research into policy or practice, and preparing future directions."
        }
      ]
    },
    what: {
      title: "What you can do with Pathways",
      items: [
        "Plan impact early and align your work with real-world needs.",
        "Strengthen proposals with credible pathways and evidence.",
        "Connect with support for engagement, evaluation, and knowledge mobilization.",
        "Map pathways from research outputs to practical outcomes."
      ],
      fallback: {
        prompt: "Can't find what you're looking for?",
        buttonLabel: "Contact us"
      }
    },
    upcomingGrants: {
      title: "Upcoming grants",
      lead: "Examples of funding opportunities that support impact-oriented activities.",
      ctaLabel: "View details →",
      items: [
        {
          id: "connection-grants",
          title: "Connection Grants",
          description: "These grants support short-term, targeted knowledge mobilization events and activities.",
          type: "Grant",
          amount: "$10,000 to $50,000",
          duration: "Over 1 year"
        },
        {
          id: "indigenous-innovation-network-grants",
          title: "Indigenous Innovation and Leadership in Research Network Grants",
          description: "This funding opportunity affirms and seeks to build on Indigenous knowledge systems and Indigenous ontology, epistemology and methodology. Networks should be wholistic, reflecting the full range of collaboration across disciplines and subject areas pertaining to the social sciences and humanities; natural sciences and engineering; and health and wellness.",
          type: "Grant",
          amount: "Up to $1,750,000",
          duration: "Over 4 years"
        },
        {
          id: "partnership-engage-grants",
          title: "Partnership Engage Grants",
          description: "These grants support short-term partnered research activities involving a postsecondary institution and a single organization from the public, private or not-for-profit sectors.",
          type: "Grant",
          amount: "$10,000 to $50,000",
          duration: "Over 1 year"
        }
      ]
    },
    popular: {
      title: "Popular support",
      viewLabel: "View",
      items: [
        {
          id: "popular-impact-mapping",
          title: "Impact pathway mapping workshop",
          description: "Map outputs to near-term and long-term outcomes."
        },
        {
          id: "popular-grant-narrative",
          title: "Grant impact narrative workshop",
          description: "Strengthen funder-facing impact language."
        },
        {
          id: "popular-outcome-tracking",
          title: "Outcome tracking consult",
          description: "Choose practical indicators for project outcomes."
        }
      ]
    }
  },
  start: {
    title: "Start Your Pathway",
    intro: "Choose the stage that best matches your project and explore short modules designed for that moment in the research journey.",
    labels: {
      type: "Type:",
      time: "Time:"
    },
    actions: {
      opportunities: "See related opportunities",
      contact: "Contact"
    },
    journeys: [
      {
        id: "developing-project",
        title: "Developing an Idea",
        description: "Shaping research questions, building collaborations, and preparing funding applications.",
        stage: "Developing an Idea",
        modules: [
          {
            title: "Impact framing consult",
            description: "Clarify the public need and the change your research could support.",
            type: "Consult",
            time: "45-60 min"
          },
          {
            title: "Stakeholder mapping workshop",
            description: "Identify potential partners, communities, and decision-makers.",
            type: "Workshop",
            time: "90 min"
          },
          {
            title: "Impact plan review",
            description: "Refine objectives, outputs, and intended outcomes.",
            type: "Consult",
            time: "60 min"
          },
          {
            title: "Partner readiness check",
            description: "Assess engagement plans and partnership roles.",
            type: "Consult",
            time: "45 min"
          },
          {
            title: "Grant narrative workshop",
            description: "Translate impact goals into persuasive, funder-ready language.",
            type: "Workshop",
            time: "2 hrs"
          },
          {
            title: "Preparing a grant application",
            description: "Pull your impact plan, partner roles, and evidence into a clear grant-ready package.",
            type: "Consult",
            time: "60 min"
          },
          {
            title: "Knowledge mobilization brief",
            description: "Outline how findings will reach the right audiences.",
            type: "Consult",
            time: "60 min"
          }
        ]
      },
      {
        id: "ongoing-project",
        title: "Active Research",
        description: "Managing an ongoing project, building partnerships, generating outputs, and planning impact pathways.",
        stage: "Active Research",
        modules: [
          {
            title: "Engagement plan clinic",
            description: "Design activities that keep partners involved and informed.",
            type: "Workshop",
            time: "90 min"
          },
          {
            title: "Outcome tracking consult",
            description: "Select indicators and simple tools to document progress.",
            type: "Consult",
            time: "45 min"
          },
          {
            title: "Mid-project reflection",
            description: "Assess what is working and update the pathway if needed.",
            type: "Consult",
            time: "60 min"
          }
        ]
      },
      {
        id: "wrapping-up-project",
        title: "Wrapping Up",
        description: "Sharing results, translating research into policy or practice, and preparing future directions.",
        stage: "Wrapping Up",
        modules: [
          {
            title: "Impact documentation",
            description: "Gather evidence and short narratives of change.",
            type: "Consult",
            time: "60 min"
          },
          {
            title: "Knowledge sharing strategy",
            description: "Select the best formats to reach priority audiences.",
            type: "Workshop",
            time: "90 min"
          },
          {
            title: "Future pathways session",
            description: "Identify follow-on opportunities and sustain outcomes.",
            type: "Consult",
            time: "45 min"
          }
        ]
      }
    ]
  },
  support: {
    title: "Research Support",
    intro: "Find guidance and support based on where you are in your research journey.",
    sections: [
      {
        id: "support-developing",
        title: "Developing an Idea",
        description: "Shaping research questions, building collaborations, and preparing funding applications.",
        lead: "This stage may include support such as:",
        supports: [
          "Grant development guidance",
          "Partnership exploration",
          "Impact planning"
        ]
      },
      {
        id: "support-active",
        title: "Active Research",
        description: "Managing an ongoing project, building partnerships, generating outputs, and planning impact pathways.",
        lead: "This stage may include support such as:",
        supports: [
          "Research data management",
          "Community engagement strategies",
          "Knowledge mobilization planning"
        ]
      },
      {
        id: "support-wrapping",
        title: "Wrapping Up",
        description: "Sharing results, translating research into policy or practice, and preparing future directions.",
        lead: "This stage may include support such as:",
        supports: [
          "Publication impact strategies",
          "Policy engagement",
          "Public communication"
        ]
      }
    ]
  },
  learn: {
    title: "Learn About Impact",
    intro: "Build impact literacy with short, practical explanations and common starting points.",
    impact: {
      title: "What is research impact?",
      body: "Research impact is the positive change that results from research activities and outputs. It can be social, cultural, economic, environmental, or policy-related, and it often emerges through relationships and sustained engagement."
    },
    myths: {
      title: "Myths vs realities",
      labels: {
        myth: "Myth",
        reality: "Reality"
      },
      items: [
        {
          myth: "Impact only happens after publication.",
          reality: "Impact can start early when research informs decisions, partnerships, or public understanding."
        },
        {
          myth: "Only large projects create impact.",
          reality: "Small projects can create meaningful change when they address specific needs."
        },
        {
          myth: "Impact is only about economic value.",
          reality: "Impact includes cultural, social, educational, and environmental outcomes."
        }
      ]
    },
    topics: {
      title: "Focus topics",
      cards: [
        {
          title: "Impact across disciplines",
          body: "Different fields generate different kinds of impact. Learn how to articulate yours in ways that fit your discipline."
        },
        {
          title: "Evidence that counts",
          body: "Discover qualitative and quantitative evidence that can demonstrate change over time."
        },
        {
          title: "Why plan early",
          body: "Early planning makes it easier to align methods, partners, and outputs with real-world outcomes."
        }
      ]
    },
    resources: {
      title: "Recommended Resources",
      cards: [
        {
          title: "Research Impact Canada",
          url: "https://researchimpact.ca/",
          description: "A national network and knowledge hub focused on research impact practice, tools, and examples across institutions.",
          whyUse: "Find practical frameworks, examples, and shared language for planning and communicating impact.",
          forWhat: "Impact planning, knowledge mobilization strategy, and training materials."
        }
      ]
    }
  },
  explore: {
    title: "Explore Opportunities",
    intro: "Use the filters to find support that fits your stage, goals, and time available.",
    search: {
      label: "Search opportunities",
      placeholder: "Search by topic, method, or audience",
      ariaLabel: "Search opportunities"
    },
    filters: [
      {
        id: "pathway",
        label: "Pathway",
        allLabel: "All pathways"
      },
      {
        id: "stage",
        label: "Research stage",
        allLabel: "All stages"
      },
      {
        id: "category",
        label: "Category",
        allLabel: "All categories"
      },
      {
        id: "format",
        label: "Format",
        allLabel: "All formats"
      },
      {
        id: "time",
        label: "Time commitment",
        allLabel: "All time commitments"
      }
    ],
    labels: {
      results: "Results:",
      category: "Category:",
      stage: "Stage:",
      format: "Format:",
      time: "Time:",
      tags: "Tags",
      overview: "Overview",
      who: "Who it is for",
      what: "What you will do",
      outcomes: "Outcomes"
    },
    buttons: {
      book: "Book (sample)",
      details: "View details",
      close: "Close"
    },
    pathways: {
      title: "Pathways Ecosystem",
      intro: "Explore the pathways below to find the lens that best fits your goals, audiences, and outputs.",
      supportTitle: "Featured support",
      buttons: {
        related: "View related opportunities",
        contactPrompt: "Can't find what you're looking for?",
        contactAction: "Contact",
        previous: "Previous pathway",
        next: "Next pathway",
        close: "Hide details"
      },
      items: [
        {
          id: "academic-scholarship",
          title: "Academic Scholarship",
          summary: "Advance knowledge, methods, and scholarly contribution within and beyond your field.",
          label: "In this pathway you can:",
          actions: [
            "Clarify the scholarly contribution and its significance.",
            "Position findings within disciplinary debates and methods.",
            "Strengthen evidence and credibility for peer review."
          ],
          supports: [
            "Impact framing consult",
            "Grant impact narrative workshop",
            "Outcome tracking consult"
          ]
        },
        {
          id: "community-engagement",
          title: "Community Engagement",
          summary: "Co-create research with communities and sustain reciprocal partnerships.",
          label: "You might explore this pathway if you want to:",
          actions: [
            "Identify partners and build shared goals.",
            "Design engagement activities and feedback loops.",
            "Document relationship-based outcomes and learning."
          ],
          supports: [
            "Stakeholder mapping workshop",
            "Engagement plan clinic",
            "Partner readiness check",
            "Knowledge sharing strategy"
          ]
        },
        {
          id: "innovation",
          title: "Innovation",
          summary: "Translate research into new methods, tools, or services that improve practice.",
          label: "What this pathway supports",
          actions: [
            "Prototype solutions or methods for real-world use.",
            "Test feasibility with partners and users.",
            "Plan adoption and scaling with evidence."
          ],
          supports: [
            "Impact pathway mapping session",
            "Outcome tracking consult",
            "Impact documentation"
          ]
        },
        {
          id: "commercialization",
          title: "Commercialization",
          summary: "Move research-based ideas toward market-ready products or ventures.",
          label: "In this pathway you can:",
          actions: [
            "Assess market fit and intellectual property considerations.",
            "Develop partnerships for commercialization pathways.",
            "Build evidence for investment, licensing, or uptake."
          ],
          supports: [
            "Partner readiness check",
            "Grant impact narrative workshop",
            "Impact documentation"
          ]
        },
        {
          id: "policy",
          title: "Policy",
          summary: "Connect evidence to policy conversations and decision-making timelines.",
          label: "You might explore this pathway if you want to:",
          actions: [
            "Identify policy audiences and windows of opportunity.",
            "Translate findings into actionable policy briefs.",
            "Track influence and uptake over time."
          ],
          supports: [
            "Outcome tracking consult",
            "Knowledge sharing strategy",
            "Impact documentation"
          ]
        },
        {
          id: "communications",
          title: "Communications",
          summary: "Share research in accessible ways that reach public and professional audiences.",
          label: "In this pathway you can:",
          actions: [
            "Plan dissemination strategies and messages.",
            "Select formats for different audiences and channels.",
            "Document reach and engagement outcomes."
          ],
          supports: [
            "Knowledge sharing strategy",
            "Engagement plan clinic",
            "Impact documentation"
          ]
        },
        {
          id: "research-creation",
          title: "Research Creation",
          summary: "Create and present research through artistic and practice-based approaches.",
          label: "What this pathway supports",
          actions: [
            "Develop research-creation outputs and exhibitions.",
            "Engage audiences through creative formats and spaces.",
            "Reflect on impact beyond traditional metrics."
          ],
          supports: [
            "Impact framing consult",
            "Knowledge sharing strategy",
            "Impact documentation"
          ]
        }
      ]
    },
    empty: {
      title: "No matching opportunities",
      body: "Try adjusting the search or filters to see more options."
    },
    opportunities: [
      {
        id: "opp-impact-framing",
        title: "Impact framing consult",
        category: "Planning",
        stage: "Developing an Idea",
        format: "Consult",
        time: "45-60 min",
        pathway: ["Academic Scholarship", "Research Creation"],
        tags: ["impact", "framing", "early stage"],
        summary: "Clarify the change you want to influence and who benefits.",
        details: {
          who: "Researchers shaping a new project or early concept.",
          what: "Work with a facilitator to define the public need, intended outcomes, and early partners.",
          outcomes: "A concise impact statement and a first-pass pathway map."
        }
      },
      {
        id: "opp-partner-readiness",
        title: "Partner readiness check",
        category: "Engagement",
        stage: "Developing an Idea",
        format: "Consult",
        time: "45 min",
        pathway: ["Community Engagement", "Commercialization"],
        tags: ["partners", "grant", "engagement"],
        summary: "Assess roles, expectations, and collaboration readiness.",
        details: {
          who: "Teams preparing partnership-based proposals.",
          what: "Review partner roles, decision-making, and communication plans.",
          outcomes: "A short readiness checklist and recommended adjustments."
        }
      },
      {
        id: "opp-grant-narrative",
        title: "Grant impact narrative workshop",
        category: "Proposal",
        stage: "Developing an Idea",
        format: "Workshop",
        time: "2 hrs",
        pathway: ["Communications", "Policy", "Commercialization"],
        tags: ["proposal", "narrative", "funding"],
        summary: "Translate impact goals into funder-ready language.",
        details: {
          who: "Applicants preparing impact sections for grants.",
          what: "Draft and refine impact narratives with peer feedback.",
          outcomes: "A stronger narrative aligned to funder criteria."
        }
      },
      {
        id: "opp-engagement-plan",
        title: "Engagement plan clinic",
        category: "Engagement",
        stage: "Active Research",
        format: "Workshop",
        time: "90 min",
        pathway: ["Community Engagement", "Communications"],
        tags: ["engagement", "partners", "planning"],
        summary: "Design engagement activities that fit your timeline.",
        details: {
          who: "Projects with active partners or public-facing goals.",
          what: "Build a schedule of touchpoints, events, and feedback loops.",
          outcomes: "An engagement plan you can implement immediately."
        }
      },
      {
        id: "opp-outcome-tracking",
        title: "Outcome tracking consult",
        category: "Evaluation",
        stage: "Active Research",
        format: "Consult",
        time: "45 min",
        pathway: ["Policy", "Academic Scholarship"],
        tags: ["evaluation", "indicators", "evidence"],
        summary: "Choose practical indicators to document change.",
        details: {
          who: "Teams who need light-weight evaluation support.",
          what: "Select indicators and tools that align with your goals.",
          outcomes: "A simple outcome tracking plan and evidence checklist."
        }
      },
      {
        id: "opp-impact-documentation",
        title: "Impact documentation",
        category: "Evidence",
        stage: "Wrapping Up",
        format: "Consult",
        time: "60 min",
        pathway: ["Communications", "Policy", "Commercialization", "Research Creation"],
        tags: ["evidence", "story", "outcomes"],
        summary: "Collect evidence and short narratives of change.",
        details: {
          who: "Projects preparing reports or final outputs.",
          what: "Gather outputs, testimonials, and outcome evidence.",
          outcomes: "A concise impact brief ready for reporting."
        }
      },
      {
        id: "opp-knowledge-sharing",
        title: "Knowledge sharing strategy",
        category: "Communication",
        stage: "Wrapping Up",
        format: "Workshop",
        time: "90 min",
        pathway: ["Communications", "Community Engagement", "Research Creation"],
        tags: ["communication", "audiences", "dissemination"],
        summary: "Select formats that reach the right audiences.",
        details: {
          who: "Teams ready to disseminate findings.",
          what: "Choose formats, channels, and timing for outreach.",
          outcomes: "A tailored dissemination plan with priorities."
        }
      },
      {
        id: "opp-impact-dashboard",
        title: "Impact pathway mapping session",
        category: "Planning",
        stage: "Developing an Idea",
        format: "Workshop",
        time: "90 min",
        pathway: ["Innovation", "Academic Scholarship"],
        tags: ["pathways", "planning", "mapping"],
        summary: "Visualize how outputs connect to outcomes over time.",
        details: {
          who: "Researchers who want a clear, shared impact model.",
          what: "Map outputs, short-term outcomes, and long-term goals.",
          outcomes: "A pathway map that supports planning and communication."
        }
      }
    ]
  },
  stories: {
    title: "Stories",
    intro: "Use these templates to capture impact in concise, credible ways.",
    templates: [
      {
        title: "Before / After",
        description: "Show the change over time with a clear starting point, intervention, and outcome."
      },
      {
        title: "Three-minute case",
        description: "Summarize the project, partners, and results in a short narrative format."
      },
      {
        title: "Quote + artifact",
        description: "Pair a short quote with a concrete output or data point."
      }
    ]
  },
  about: {
    title: "About Pathways",
    intro: "Pathways to Impact is a Concordia University initiative supporting researchers who want to plan, evidence, and communicate impact. The program helps connect research to community needs and public value.",
    sections: [
      {
        id: "what",
        title: "What Pathways is",
        body: "Pathways to Impact is a coordinated set of consultations, learning resources, and practical tools that guide researchers through the impact lifecycle."
      },
      {
        id: "how",
        title: "How it works",
        body: "Researchers select a pathway stage, complete short modules, and connect with tailored opportunities for engagement, evaluation, and knowledge mobilization."
      },
      {
        id: "partners",
        title: "Partners across the university",
        body: "Pathways to Impact connects researchers with expertise and support across the university. These partners contribute guidance, spaces, and opportunities that help research move into the world in meaningful ways.",
        kind: "partners",
        groups: [
          {
            id: "office-research",
            title: "Office of Research",
            items: [
              {
                unitIds: ["research-development"],
                description: "The Research Development team supports researchers across the funding lifecycle. They provide funding identification, proposal development, strategic positioning, and institutional coordination to strengthen competitive and impact-oriented applications."
              },
              {
                unitIds: ["pips"],
                description: "The PIPS team supports industry partnerships, research agreements, and intellectual property management. They help researchers navigate contracts, protect and manage intellectual property, and develop pathways for knowledge transfer and commercialization."
              }
            ]
          },
          {
            id: "campus",
            title: "Campus partners",
            items: [
              {
                unitIds: ["4th-space"],
                description: "4th Space develops public programs that make research accessible and interactive. Through panels, residencies, workshops, and events, they help researchers share work with broader audiences and build relationships beyond the university."
              },
              {
                unitIds: ["concordia-library"],
                description: "The Library supports open, responsible, and visible scholarship. Services include research data management, digital scholarship, bibliometrics and impact guidance, copyright and open access support, and workshops that strengthen research dissemination."
              },
              {
                unitIds: ["district-3"],
                description: "District 3 helps researchers explore innovation and entrepreneurship pathways. Through training, mentorship, and incubation programs, they support translating research into applications, ventures, and real-world solutions."
              },
              {
                unitIds: ["university-communications-services"],
                description: "University Communications Services supports researchers in sharing work with public audiences. They offer media training, interview preparation, press support, and guidance on communicating research clearly and responsibly."
              },
              {
                unitIds: ["shift-centre", "office-community-engagement"],
                description: "SHIFT and the Office of Community Engagement support participatory and community-based research. They help build reciprocal partnerships, support co-creation processes, and provide spaces for collaboration across university and community contexts."
              }
            ]
          },
          {
            id: "external",
            title: "External partners",
            items: [
              {
                unitIds: ["v1-studio"],
                description: "V1 Studio provides researchers with hands-on entrepreneurial training and venture development support. Their programs help researchers explore commercialization pathways, build startup skills, and move research toward societal application."
              }
            ]
          }
        ]
      },
      {
        id: "vision",
        title: "Impact Vision",
        body: "We envision research that is grounded in community priorities, informed by evidence, and translated into meaningful societal outcomes."
      },
      {
        id: "about-us",
        title: "About Us",
        body: "Pathways is delivered by a cross-campus team specializing in research development, partnership building, and knowledge mobilization."
      },
      {
        id: "contact",
        title: "Contact Us",
        body: "Reach out for guidance, collaboration, or to book a consultation.",
        items: [
          { "label": "Email:", "value": "pathways@concordia.ca" },
          { "label": "Office:", "value": "Research Services, Concordia University" },
          { "label": "Hours:", "value": "Monday-Friday, 9:00-17:00" }
        ]
      }
    ]
  }
};
