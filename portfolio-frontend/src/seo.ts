import type { Project } from "./types";

export const SITE_ORIGIN = "https://kevalparmar.me";
export const SOCIAL_IMAGE = `${SITE_ORIGIN}/og-image.png`;

export interface ProjectSeoConfig {
  title: string;
  description: string;
  homeTeaser: string;
  applicationCategory: string;
  relatedSlugs: [string, string];
  imageAltBase: string;
}

export const PROJECT_SEO_MAP: Record<string, ProjectSeoConfig> = {
  "optimus-ai-assistant": {
    title: "Optimus AI Assistant — LangGraph Agent | Keval Parmar",
    description:
      "Case study of Optimus AI Assistant: a desktop assistant using ModernBERT intent routing, six LangGraph agents, ChromaDB memory, and Groq LLM failover.",
    homeTeaser:
      "Voice and text desktop assistant coordinating six LangGraph agents with local ModernBERT routing and browser automation.",
    applicationCategory: "UtilitiesApplication",
    relatedSlugs: ["financial-assistant-bot", "adiyogi-wellness"],
    imageAltBase: "Optimus AI Assistant desktop application interface",
  },
  "adiyogi-wellness": {
    title: "Adiyogi Wellness — React & Django AI App | Keval Parmar",
    description:
      "Case study of Adiyogi Wellness: a React, TypeScript, and Django REST wellness app with multilingual AI chat, audio interaction, and MongoDB insights.",
    homeTeaser:
      "Full-stack wellness app built with React and Django, pairing multilingual chat with audio interaction and weekly insights.",
    applicationCategory: "HealthApplication",
    relatedSlugs: ["museum-ticket-booking-assistant", "optimus-ai-assistant"],
    imageAltBase: "Adiyogi Wellness React and Django AI wellness platform interface",
  },
  "talent-tuner": {
    title: "Talent Tuner — Gemini Profile Review App | Keval Parmar",
    description:
      "Case study of Talent Tuner: a Flask web app powered by Google's Gemini API to review resumes, evaluate code quality, and improve LinkedIn profiles.",
    homeTeaser:
      "Flask web tool using Google's Gemini API to analyze resumes, evaluate code, and refine LinkedIn profiles.",
    applicationCategory: "BusinessApplication",
    relatedSlugs: ["adiyogi-wellness", "financial-assistant-bot"],
    imageAltBase: "Talent Tuner Flask and Gemini API profile review interface",
  },
  "financial-assistant-bot": {
    title: "Financial Assistant Bot — Streamlit LLM | Keval Parmar",
    description:
      "Case study of Financial Assistant Bot: a Streamlit chatbot using LangGraph, Yahoo Finance, and DuckDuckGo search for live stock prices and market news.",
    homeTeaser:
      "Streamlit finance chatbot combining LangGraph tool-calling with Yahoo Finance quotes and DuckDuckGo market search.",
    applicationCategory: "FinanceApplication",
    relatedSlugs: ["optimus-ai-assistant", "museum-ticket-booking-assistant"],
    imageAltBase: "Financial Assistant Bot Streamlit stock market chatbot interface",
  },
  "flower-image-generator-using-dcgan": {
    title: "Flower Image Generator DCGAN in PyTorch | Keval Parmar",
    description:
      "Case study of Flower Image Generator using DCGAN: a CPU-optimized PyTorch GAN trained on the Oxford 102 Flower Dataset to synthesize realistic flowers.",
    homeTeaser:
      "PyTorch generative adversarial network trained on over 8,000 Oxford 102 flower photos to synthesize floral imagery.",
    applicationCategory: "DeveloperApplication",
    relatedSlugs: ["optimus-ai-assistant", "talent-tuner"],
    imageAltBase: "Flower Image Generator DCGAN PyTorch output",
  },
  "museum-ticket-booking-assistant": {
    title: "Museum Ticket Booking AI with LangGraph | Keval Parmar",
    description:
      "Case study of Museum Ticket Booking Assistant: a Django and MongoDB ticketing system with QR e-tickets and an English, Hindi, and Gujarati LangGraph bot.",
    homeTeaser:
      "Django and MongoDB event ticketing platform generating QR e-tickets alongside a trilingual LangGraph assistant.",
    applicationCategory: "TravelApplication",
    relatedSlugs: ["adiyogi-wellness", "financial-assistant-bot"],
    imageAltBase: "Museum Ticket Booking Assistant Django and LangGraph interface",
  },
};

export const PAGE_SEO = {
  home: {
    title: "Keval Parmar | AI Application Engineer Portfolio",
    description:
      "Portfolio of Keval Parmar, an AI application engineer working with Python, LangGraph, Django, and React. Read his background, skills, and six projects.",
    path: "/",
  },
  freelance: {
    title: "Freelance AI Application & RAG Developer | Keval Parmar",
    description:
      "Hire Keval Parmar for freelance RAG pipelines, LangGraph multi-agent workflows, cost-optimized LLM hosting, and full-stack AI web apps. Remote from India.",
    path: "/freelance",
  },
  collaborate: {
    title: "Contact for AI & Software Inquiries | Keval Parmar",
    description:
      "Send a project inquiry, technical consulting note, or role opportunity to Keval Parmar. Share your timeline and stack and expect a reply within 24 hours.",
    path: "/collaborate",
  },
  projectIndex: {
    title: "AI Engineering Case Studies | Keval Parmar",
    description:
      "Explore AI and full-stack software projects by Keval Parmar, spanning LangGraph agents, Django web apps, and PyTorch models.",
  },
  notFound: {
    title: "Page Not Found (404) | Keval Parmar",
    description: "This page could not be found on Keval Parmar's portfolio.",
    robots: "noindex, follow",
  },
} as const;

export const PERSON_SCHEMA = {
  "@type": "Person",
  "@id": `${SITE_ORIGIN}/#person`,
  name: "Keval Parmar",
  url: `${SITE_ORIGIN}/`,
  jobTitle: "AI Application Engineer",
  description:
    "AI application engineer building LLM applications, retrieval-augmented generation systems, agents, and full-stack software.",
  sameAs: [
    "https://www.linkedin.com/in/keval-parmar234/",
    "https://github.com/KevalParmar75",
  ],
  knowsAbout: [
    "AI application development",
    "Large language models",
    "Retrieval-augmented generation",
    "AI agents",
    "Workflow automation",
    "Python",
    "Django",
    "React",
  ],
};

export const HOME_SCHEMA = {
  "@context": "https://schema.org",
  "@graph": [
    PERSON_SCHEMA,
    {
      "@type": "WebSite",
      "@id": `${SITE_ORIGIN}/#website`,
      url: `${SITE_ORIGIN}/`,
      name: "Keval Parmar",
      publisher: { "@id": `${SITE_ORIGIN}/#person` },
      inLanguage: "en",
    },
  ],
};

export const FREELANCE_FAQS = [
  {
    question: "How do you price projects—fixed scope or hourly?",
    answer:
      "Most projects are priced per milestone with a fixed scope defined upfront, so you know the exact cost before work begins. For ongoing engineering support, architecture audits, or iterative MVP sprints, I also offer weekly or monthly retainers.",
  },
  {
    question: "Can you build AI features without locking us into expensive OpenAI/Azure bills?",
    answer:
      "Yes. Depending on your latency and privacy requirements, I can deploy open-weight models like Qwen 2.5 or Gemma via cost-effective inference providers (Groq, NVIDIA NIM) or self-host quantized models on your own VPS using Ollama and Docker—with automatic cloud fallback if needed.",
  },
  {
    question: "How fast can we go from idea to a working prototype?",
    answer:
      "Focused RAG pipelines, custom agents, or automation workflows typically reach a testable prototype within 5 to 10 days. Full-stack AI web applications and MVPs generally take 2 to 4 weeks depending on integrations and UI complexity.",
  },
  {
    question: "Who owns the code, prompts, and infrastructure once it's built?",
    answer:
      "You own 100% of the codebase, system prompts, database schemas, and deployment configurations upon completion. Everything is delivered in your Git repository under your own cloud accounts with zero vendor lock-in.",
  },
  {
    question: "We already have a backend/frontend—can you integrate just the AI layer?",
    answer:
      "Absolutely. I can build the AI service as an isolated FastAPI or Django microservice with clean REST/streaming endpoints that plug directly into your existing Next.js, React, or mobile frontend.",
  },
] as const;

export const FREELANCE_SCHEMA = {
  "@context": "https://schema.org",
  "@graph": [
    PERSON_SCHEMA,
    {
      "@type": "Service",
      name: "Freelance AI Application, RAG & Automation Development",
      serviceType: [
        "RAG & Document Q&A",
        "Multi-Agent & Tool-Calling Workflows",
        "Cost-Optimized LLM Hosting & Inference",
        "Full-Stack AI Web Apps & MVPs",
        "Business Process & Outbound Automation",
      ],
      description:
        "RAG systems, multi-agent LangGraph workflows, cost-optimized LLM hosting, and full-stack AI web applications.",
      provider: { "@id": `${SITE_ORIGIN}/#person` },
      url: `${SITE_ORIGIN}${PAGE_SEO.freelance.path}`,
      areaServed: ["India", "Europe", "United States", "Worldwide"],
    },
    {
      "@type": "FAQPage",
      mainEntity: FREELANCE_FAQS.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    },
  ],
};

export const COLLABORATE_SCHEMA = {
  "@context": "https://schema.org",
  "@graph": [
    PERSON_SCHEMA,
    {
      "@type": "ContactPage",
      "@id": `${SITE_ORIGIN}${PAGE_SEO.collaborate.path}#contactpage`,
      name: PAGE_SEO.collaborate.title,
      description: PAGE_SEO.collaborate.description,
      url: `${SITE_ORIGIN}${PAGE_SEO.collaborate.path}`,
      about: { "@id": `${SITE_ORIGIN}/#person` },
      inLanguage: "en",
    },
  ],
};

export function optimizeCloudinaryImage(url: string, width = 1280): string {
  const marker = "/image/upload/";
  if (!url.includes("res.cloudinary.com") || !url.includes(marker)) {
    return url;
  }
  const idx = url.indexOf(marker);
  const after = url.slice(idx + marker.length);
  if (/^(?:f_|q_|w_|c_)/.test(after)) {
    return url;
  }
  return `${url.slice(0, idx + marker.length)}f_auto,q_auto,w_${width},c_limit/${after}`;
}

export function getProjectHomeTeaser(project: Project): string {
  return PROJECT_SEO_MAP[project.slug]?.homeTeaser ?? project.short_description;
}

export function getProjectScreenshotAlt(project: Project, index: number, caption?: string | null): string {
  if (caption?.trim()) return caption.trim();
  const base = PROJECT_SEO_MAP[project.slug]?.imageAltBase ?? `${project.title} application`;
  return `${base} — screenshot ${index + 1}`;
}

export function getRelatedProjects(slug: string | undefined, projects: Project[]): Project[] {
  if (!slug) return [];
  const preferred = PROJECT_SEO_MAP[slug]?.relatedSlugs;
  if (preferred) {
    const matched = preferred
      .map((s) => projects.find((p) => p.slug === s))
      .filter((p): p is Project => Boolean(p));
    if (matched.length > 0) return matched;
  }
  return projects.filter((p) => p.slug !== slug).slice(0, 2);
}

export type PageMetadata = {
  title: string;
  description: string;
  path?: string;
  robots?: string;
  type?: "website" | "article";
  image?: string;
  structuredData?: Record<string, unknown>;
};

export function buildProjectMetadata(project: Project): PageMetadata {
  const path = `/projects/${project.slug}`;
  const canonicalUrl = `${SITE_ORIGIN}${path}`;
  const seoConfig = PROJECT_SEO_MAP[project.slug];
  const title = seoConfig?.title ?? `${project.title} | Keval Parmar`;
  const description = seoConfig?.description ?? project.short_description;
  const rawImage = project.images?.[0]?.image;
  const image = rawImage ? optimizeCloudinaryImage(rawImage, 1200) : SOCIAL_IMAGE;

  return {
    title,
    description,
    path,
    type: "article",
    image,
    structuredData: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "SoftwareApplication",
          "@id": `${canonicalUrl}#software`,
          name: project.title,
          description,
          url: canonicalUrl,
          applicationCategory: seoConfig?.applicationCategory ?? "DeveloperApplication",
          operatingSystem: "Cross-platform",
          author: { "@id": `${SITE_ORIGIN}/#person` },
          ...(project.github_url ? { codeRepository: project.github_url } : {}),
          ...(project.live_url ? { sameAs: project.live_url } : {}),
          image,
          keywords: (project.tech_stack ?? "")
            .split(/\r?\n/)
            .map((tech) => tech.trim())
            .filter(Boolean),
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: `${SITE_ORIGIN}/`,
            },
            {
              "@type": "ListItem",
              position: 2,
              name: project.title,
              item: canonicalUrl,
            },
          ],
        },
      ],
    },
  };
}

export function getRouteMetadata(pathname: string, projects: Project[] = []): PageMetadata {
  if (pathname === "/") {
    return { ...PAGE_SEO.home, structuredData: HOME_SCHEMA };
  }
  if (pathname === "/freelance") {
    return { ...PAGE_SEO.freelance, structuredData: FREELANCE_SCHEMA };
  }
  if (pathname === "/collaborate") {
    return { ...PAGE_SEO.collaborate, structuredData: COLLABORATE_SCHEMA };
  }
  if (pathname.startsWith("/projects/")) {
    const slug = pathname.slice("/projects/".length).replace(/\/+$/, "");
    const project = projects.find((p) => p.slug === slug);
    if (project) return buildProjectMetadata(project);
  }
  return { ...PAGE_SEO.notFound, path: undefined };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderHeadTagsHtml(meta: PageMetadata): string {
  const robots = meta.robots ?? "index, follow, max-image-preview:large";
  const type = meta.type ?? "website";
  const image = meta.image ?? SOCIAL_IMAGE;
  const canonicalUrl = meta.path ? `${SITE_ORIGIN}${meta.path}` : null;

  const lines = [
    `<title>${escapeHtml(meta.title)}</title>`,
    `<meta name="description" content="${escapeHtml(meta.description)}" />`,
    `<meta name="author" content="Keval Parmar" />`,
    `<meta name="robots" content="${escapeHtml(robots)}" />`,
  ];

  if (canonicalUrl) {
    lines.push(`<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />`);
  }

  lines.push(
    `<meta property="og:type" content="${escapeHtml(type)}" />`,
    `<meta property="og:title" content="${escapeHtml(meta.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(meta.description)}" />`,
  );
  if (canonicalUrl) {
    lines.push(`<meta property="og:url" content="${escapeHtml(canonicalUrl)}" />`);
  }
  lines.push(`<meta property="og:image" content="${escapeHtml(image)}" />`);
  if (image === SOCIAL_IMAGE) {
    lines.push(
      `<meta property="og:image:width" content="1200" />`,
      `<meta property="og:image:height" content="630" />`,
    );
  }
  lines.push(
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(meta.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(meta.description)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(image)}" />`,
  );

  if (meta.structuredData) {
    const json = JSON.stringify(meta.structuredData).replace(/</g, "\\u003c");
    lines.push(`<script id="page-structured-data" type="application/ld+json">${json}</script>`);
  }

  return lines.join("\n  ");
}

function setMeta(key: "name" | "property", value: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${key}="${value}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(key, value);
    document.head.append(element);
  }
  element.content = content;
}

export function setPageMetadata({
  title,
  description,
  path,
  robots = "index, follow, max-image-preview:large",
  type = "website",
  image = SOCIAL_IMAGE,
  structuredData,
}: PageMetadata) {
  document.title = title;
  setMeta("name", "description", description);
  setMeta("name", "robots", robots);
  setMeta("property", "og:type", type);
  setMeta("property", "og:title", title);
  setMeta("property", "og:description", description);
  setMeta("property", "og:image", image);

  if (image === SOCIAL_IMAGE) {
    setMeta("property", "og:image:width", "1200");
    setMeta("property", "og:image:height", "630");
  } else {
    document.head.querySelector('meta[property="og:image:width"]')?.remove();
    document.head.querySelector('meta[property="og:image:height"]')?.remove();
  }

  setMeta("name", "twitter:card", "summary_large_image");
  setMeta("name", "twitter:title", title);
  setMeta("name", "twitter:description", description);
  setMeta("name", "twitter:image", image);

  const canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (path) {
    const link = canonical ?? document.createElement("link");
    link.rel = "canonical";
    link.href = `${SITE_ORIGIN}${path}`;
    if (!canonical) document.head.append(link);
    setMeta("property", "og:url", link.href);
  } else {
    canonical?.remove();
    document.head.querySelector('meta[property="og:url"]')?.remove();
  }

  document.getElementById("page-structured-data")?.remove();
  if (structuredData) {
    const script = document.createElement("script");
    script.id = "page-structured-data";
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(structuredData);
    document.head.append(script);
  }
}
