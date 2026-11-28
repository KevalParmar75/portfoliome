import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const distDir = path.resolve(rootDir, "dist");
const snapshotPath = path.resolve(rootDir, "src/data/portfolioSnapshot.json");
const SITE_ORIGIN = "https://kevalparmar.me";

function decodeEntities(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'");
}

function stripTags(value) {
  return decodeEntities(value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

const snapshot = JSON.parse(fs.readFileSync(snapshotPath, "utf8"));
const routes = [
  { route: "/", file: path.resolve(distDir, "index.html"), indexable: true },
  { route: "/freelance", file: path.resolve(distDir, "freelance/index.html"), indexable: true },
  { route: "/collaborate", file: path.resolve(distDir, "collaborate/index.html"), indexable: true },
  ...snapshot.projects.map((p) => ({
    route: `/projects/${p.slug}`,
    file: path.resolve(distDir, `projects/${p.slug}/index.html`),
    indexable: true,
  })),
  { route: "/404", file: path.resolve(distDir, "404.html"), indexable: false },
];

const errors = [];
const seenTitles = new Map();
const seenDescs = new Map();
const seenH1s = new Map();
const rows = [];

const sitemapPath = path.resolve(distDir, "sitemap.xml");
const sitemapXml = fs.existsSync(sitemapPath) ? fs.readFileSync(sitemapPath, "utf8") : "";
const sitemapLocs = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

for (const entry of routes) {
  if (!fs.existsSync(entry.file)) {
    errors.push(`Missing prerendered HTML: ${entry.file}`);
    continue;
  }

  const html = fs.readFileSync(entry.file, "utf8");
  const headHtml = (html.match(/<head>([\s\S]*?)<\/head>/i) || [])[1] || "";
  const bodyHtml = (html.match(/<body>([\s\S]*)<\/body>/i) || [])[1] || "";
  const cleanBody = bodyHtml
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<svg[\s\S]*?<\/svg>/gi, "");

  const title = decodeEntities((headHtml.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] || "").trim();
  const desc = decodeEntities(
    (headHtml.match(/<meta\s+name="description"\s+content="([\s\S]*?)"/i) || [])[1] || ""
  ).trim();
  const robots = decodeEntities(
    (headHtml.match(/<meta\s+name="robots"\s+content="([\s\S]*?)"/i) || [])[1] || ""
  ).trim();
  const canonical = decodeEntities(
    (headHtml.match(/<link\s+rel="canonical"\s+href="([\s\S]*?)"/i) || [])[1] || ""
  ).trim();
  const ogUrl = decodeEntities(
    (headHtml.match(/<meta\s+property="og:url"\s+content="([\s\S]*?)"/i) || [])[1] || ""
  ).trim();

  const h1Matches = [...cleanBody.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) => stripTags(m[1]));
  if (h1Matches.length !== 1) {
    errors.push(`${entry.route}: expected exactly 1 H1, found ${h1Matches.length}`);
  }
  const h1 = h1Matches[0] || "";

  // Check heading order (no skipped levels)
  const headingLevels = [...cleanBody.matchAll(/<h([1-6])[^>]*>/gi)].map((m) => Number(m[1]));
  for (let i = 1; i < headingLevels.length; i++) {
    if (headingLevels[i] - headingLevels[i - 1] > 1) {
      errors.push(
        `${entry.route}: skipped heading level H${headingLevels[i - 1]} -> H${headingLevels[i]}`
      );
    }
  }

  // Uniqueness checks across all routes
  if (!title) errors.push(`${entry.route}: missing <title>`);
  else if (seenTitles.has(title)) {
    errors.push(`Duplicate title "${title}" on ${entry.route} and ${seenTitles.get(title)}`);
  } else {
    seenTitles.set(title, entry.route);
  }

  if (!desc) errors.push(`${entry.route}: missing meta description`);
  else if (seenDescs.has(desc)) {
    errors.push(`Duplicate description "${desc}" on ${entry.route} and ${seenDescs.get(desc)}`);
  } else {
    seenDescs.set(desc, entry.route);
  }

  if (!h1) errors.push(`${entry.route}: empty <h1>`);
  else if (seenH1s.has(h1)) {
    errors.push(`Duplicate H1 "${h1}" on ${entry.route} and ${seenH1s.get(h1)}`);
  } else {
    seenH1s.set(h1, entry.route);
  }

  // Canonical, robots, sitemap, and trailing-slash checks
  const expectedCanonical = `${SITE_ORIGIN}${entry.route}`;
  if (entry.indexable) {
    if (canonical !== expectedCanonical) {
      errors.push(`${entry.route}: canonical "${canonical}" !== "${expectedCanonical}"`);
    }
    if (ogUrl !== expectedCanonical) {
      errors.push(`${entry.route}: og:url "${ogUrl}" !== "${expectedCanonical}"`);
    }
    if (!robots.includes("index")) {
      errors.push(`${entry.route}: indexable route has robots="${robots}"`);
    }
    if (!sitemapLocs.includes(expectedCanonical)) {
      errors.push(`${entry.route}: missing from sitemap.xml (${expectedCanonical})`);
    }
  } else {
    if (!robots.includes("noindex")) {
      errors.push(`${entry.route}: non-indexable route missing noindex (robots="${robots}")`);
    }
    if (canonical) {
      errors.push(`${entry.route}: 404 route should not have a canonical tag`);
    }
    if (sitemapLocs.some((loc) => loc.endsWith("/404"))) {
      errors.push(`${entry.route}: 404 must not be listed in sitemap.xml`);
    }
  }

  // JSON-LD validity
  const jsonLdBlocks = [
    ...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi),
  ];
  const jsonLdTypes = [];
  for (const block of jsonLdBlocks) {
    try {
      const parsed = JSON.parse(block[1]);
      if (Array.isArray(parsed["@graph"])) {
        jsonLdTypes.push(...parsed["@graph"].map((node) => node["@type"]));
      } else if (parsed["@type"]) {
        jsonLdTypes.push(parsed["@type"]);
      }
    } catch (err) {
      errors.push(`${entry.route}: invalid JSON-LD (${err.message})`);
    }
  }

  // Image checks
  const imgs = [...cleanBody.matchAll(/<img\s+([^>]*)>/gi)].map((m) => m[1]);
  for (const attrs of imgs) {
    const altMatch = attrs.match(/alt="([^"]*)"/i);
    if (!altMatch || !altMatch[1].trim() || /^Screenshot \d+$/i.test(altMatch[1].trim())) {
      errors.push(`${entry.route}: non-descriptive or missing img alt (${attrs})`);
    }
    if (!/\bwidth=/.test(attrs) || !/\bheight=/.test(attrs)) {
      errors.push(`${entry.route}: img missing explicit width/height (${attrs})`);
    }
  }

  // Internal link trailing-slash & stale-domain check
  const hrefs = [...cleanBody.matchAll(/href="([^"]+)"/gi)].map((m) => m[1]);
  for (const href of hrefs) {
    if (href.includes("kevalparmar75.vercel.app")) {
      errors.push(`${entry.route}: stale vercel.app link found (${href})`);
    }
    if (href.startsWith("/")) {
      const linkPath = href.split(/[?#]/)[0];
      if (linkPath.length > 1 && linkPath.endsWith("/")) {
        errors.push(`${entry.route}: inconsistent trailing slash on internal link (${href})`);
      }
    }
  }

  rows.push({
    route: entry.route,
    titleLen: title.length,
    descLen: desc.length,
    h1,
    canonical: canonical || "(none)",
    jsonLd: jsonLdTypes.join(", ") || "(none)",
  });
}

console.log("[verify-seo] Route summary:");
console.table(rows);

if (errors.length > 0) {
  console.error("\n[verify-seo] FAILED with errors:");
  for (const err of errors) {
    console.error(`  - ${err}`);
  }
  process.exit(1);
}

console.log(`[verify-seo] PASSED (${rows.length} routes verified, all unique & valid).`);
