import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const distDir = path.resolve(rootDir, "dist");
const ssrDir = path.resolve(rootDir, "dist-ssr");
const publicDir = path.resolve(rootDir, "public");

const HEAD_START = "<!-- SEO_HEAD_START -->";
const HEAD_END = "<!-- SEO_HEAD_END -->";

async function main() {
  const templatePath = path.resolve(distDir, "index.html");
  const template = fs.readFileSync(templatePath, "utf8");

  const startIdx = template.indexOf(HEAD_START);
  const endIdx = template.indexOf(HEAD_END);
  if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
    throw new Error("Could not find SEO_HEAD_START / SEO_HEAD_END markers in dist/index.html");
  }

  const serverEntryUrl = pathToFileURL(path.resolve(ssrDir, "entry-server.js")).href;
  const { renderRoute, getPrerenderRoutes, getSitemapRoutes, SITE_ORIGIN } = await import(
    serverEntryUrl
  );

  const routes = getPrerenderRoutes();
  for (const route of routes) {
    const { appHtml, headHtml } = renderRoute(route);

    let html =
      template.slice(0, startIdx) +
      `${HEAD_START}\n  ${headHtml}\n  ${HEAD_END}` +
      template.slice(endIdx + HEAD_END.length);

    html = html.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);

    let outPath;
    if (route === "/") {
      outPath = path.resolve(distDir, "index.html");
    } else if (route === "/404") {
      outPath = path.resolve(distDir, "404.html");
    } else {
      const cleanRoute = route.replace(/^\/+/, "");
      outPath = path.resolve(distDir, cleanRoute, "index.html");
    }

    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, html, "utf8");
    console.log(`[prerender] ${route} -> ${path.relative(rootDir, outPath)}`);
  }

  const sitemapRoutes = getSitemapRoutes();
  const sitemapXml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    sitemapRoutes.map((route) => `  <url><loc>${SITE_ORIGIN}${route}</loc></url>`).join("\n") +
    `\n</urlset>\n`;

  fs.writeFileSync(path.resolve(distDir, "sitemap.xml"), sitemapXml, "utf8");
  fs.writeFileSync(path.resolve(publicDir, "sitemap.xml"), sitemapXml, "utf8");
  console.log(`[prerender] Updated sitemap.xml (${sitemapRoutes.length} routes)`);

  fs.rmSync(ssrDir, { recursive: true, force: true });
}

main().catch((err) => {
  console.error("[prerender] Failed:", err);
  process.exit(1);
});
