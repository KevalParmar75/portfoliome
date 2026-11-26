import type { Project } from "./types";

export const SITE_ORIGIN = "https://kevalparmar.me";
export const SOCIAL_IMAGE = `${SITE_ORIGIN}/og-image.png`;

export const PAGE_SEO = {
  home: {
    title: "Keval Parmar | AI Application Engineer",
    description:
      "Keval Parmar builds AI applications, RAG systems, and automation workflows. Explore his projects, technical background, and freelance services.",
    path: "/",
  },
  freelance: {
    title: "AI Application & Automation Development | Keval Parmar",
    description:
      "Keval Parmar builds AI applications, LLM and RAG systems, AI agents, and workflow automation for product teams. Based in India and open to remote projects.",
    path: "/freelance",
  },
  collaborate: {
    title: "Work With Keval Parmar | AI Application Engineer",
    description:
      "Discuss an AI application, automation workflow, or full-stack project with Keval Parmar. Share your goals and get in touch.",
    path: "/collaborate",
  },
  projectIndex: {
    title: "AI Engineering Projects | Keval Parmar",
    description:
      "Explore AI and full-stack projects by Keval Parmar, including assistants, RAG systems, automation, and web applications.",
  },
  notFound: {
    title: "Page Not Found | Keval Parmar",
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
    "https://www.linkedin.com/in/kevalparmar75/",
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
      name: "AI Application & Full-Stack Engineering",
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
  return {
    title: `${project.title} | Keval Parmar`,
    description: project.short_description,
    path,
    type: "article",
    image: project.images?.[0]?.image ?? SOCIAL_IMAGE,
    structuredData: {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      name: project.title,
      description: project.short_description,
      url: `${SITE_ORIGIN}${path}`,
      creator: { "@id": `${SITE_ORIGIN}/#person` },
      keywords: (project.tech_stack ?? "")
        .split(/\r?\n/)
        .map((tech) => tech.trim())
        .filter(Boolean),
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
    return { ...PAGE_SEO.collaborate };
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
  lines.push(
    `<meta property="og:image" content="${escapeHtml(image)}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
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
