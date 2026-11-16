export const SITE_ORIGIN = "https://kevalparmar75.vercel.app";
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

type PageMetadata = {
  title: string;
  description: string;
  path?: string;
  robots?: string;
  type?: "website" | "article";
  image?: string;
  structuredData?: Record<string, unknown>;
};

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
