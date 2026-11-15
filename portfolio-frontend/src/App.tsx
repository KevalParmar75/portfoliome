import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";

// Home stays eager (it is the landing page); the rest load on navigation.
const ProjectDetails = lazy(() => import("./pages/ProjectDetails"));
const Collaborate = lazy(() => import("./pages/Collaborate"));
const Freelance = lazy(() => import("./pages/Freelance"));

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#000000]" />}>
      {/* mode="wait" ensures the old page fades out BEFORE the new page fades in */}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/projects/:slug" element={<ProjectDetails />} />
          <Route path="/collaborate" element={<Collaborate />} />
          <Route path="/freelance" element={<Freelance />} />
          {/* The Catch-All 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}
