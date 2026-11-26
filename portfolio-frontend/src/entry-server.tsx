import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ProjectDetails from "./pages/ProjectDetails";
import Collaborate from "./pages/Collaborate";
import Freelance from "./pages/Freelance";
import NotFound from "./pages/NotFound";
import { portfolioSnapshot } from "./data/portfolioSnapshot";
import { getRouteMetadata, renderHeadTagsHtml, SITE_ORIGIN } from "./seo";

export function getPrerenderRoutes(): string[] {
  const projectRoutes = portfolioSnapshot.projects.map(
    (project) => `/projects/${project.slug}`
  );
  return ["/", "/freelance", "/collaborate", ...projectRoutes, "/404"];
}

export function getSitemapRoutes(): string[] {
  return getPrerenderRoutes().filter((route) => route !== "/404");
}

export function renderRoute(url: string): { appHtml: string; headHtml: string } {
  const appHtml = renderToString(
    <StrictMode>
      <div id="app-content">
        <StaticRouter location={url}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/projects/:slug" element={<ProjectDetails />} />
            <Route path="/collaborate" element={<Collaborate />} />
            <Route path="/freelance" element={<Freelance />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </StaticRouter>
      </div>
    </StrictMode>
  );

  const meta = getRouteMetadata(url, portfolioSnapshot.projects);
  const headHtml = renderHeadTagsHtml(meta);
  return { appHtml, headHtml };
}

export { SITE_ORIGIN };
