import { useState, useEffect, useRef, type MouseEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { koiManager } from "./KoiCanvasContext";
import { LiquidLensFilter } from "./LiquidGlass";
import { useCapsuleLensMap } from "../hooks/useLensMap";

const NAV_ITEMS = [
  { label: "Home", id: "hero" },
  { label: "About", id: "about" },
  { label: "Skills", id: "skills" },
  { label: "Experience", id: "experience" },
  { label: "Projects", id: "projects" },
  { label: "Freelance", id: "freelance", path: "/freelance" },
  { label: "Contact", id: "contact" },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const lensMapUrl = useCapsuleLensMap();

  const pillRef = useRef<HTMLDivElement>(null);
  const refractCanvasRef = useRef<HTMLCanvasElement>(null);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNameExpanded, setIsNameExpanded] = useState(false);
  const [typeIndex, setTypeIndex] = useState(0);
  const [scrollSection, setScrollSection] = useState("hero");
  const [scrolled, setScrolled] = useState(false);

  const firstTarget = "eval\u00A0";
  const secondTarget = "armar";

  // Routes that are not part of the one-page scroll flow highlight a fixed item.
  const routeSection = location.pathname === "/freelance"
    ? "freelance"
    : location.pathname.startsWith("/projects/")
      ? "projects"
      : null;
  const activeSection = routeSection ?? scrollSection;

  // Typewriter engine
  useEffect(() => {
    const interval = setInterval(
      () => {
        setTypeIndex((prev) => {
          if (isNameExpanded) return prev < 5 ? prev + 1 : prev;
          return prev > 0 ? prev - 1 : prev;
        });
      },
      isNameExpanded ? 90 : 40
    );
    return () => clearInterval(interval);
  }, [isNameExpanded]);

  // Real-time Koi Pond Optical Refraction Engine
  useEffect(() => {
    const pill = pillRef.current;
    const canvas = refractCanvasRef.current;
    if (!pill || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const unsubscribe = koiManager.subscribe((sourceCanvas: HTMLCanvasElement) => {
      const rect = pill.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cw = Math.round(rect.width * dpr);
      const ch = Math.round(rect.height * dpr);
      if (canvas.width !== cw || canvas.height !== ch) {
        canvas.width = cw;
        canvas.height = ch;
      }

      const scaleX = sourceCanvas.width / window.innerWidth;
      const scaleY = sourceCanvas.height / window.innerHeight;
      const sx = rect.left * scaleX;
      const sy = rect.top * scaleY;
      const sw = rect.width * scaleX;
      const sh = rect.height * scaleY;

      ctx.clearRect(0, 0, cw, ch);
      ctx.save();

      // Convex glass magnification + subtle 2px optical blur
      const zoom = 0.86;
      const zx = sx + sw * ((1 - zoom) * 0.5);
      const zy = sy + sh * ((1 - zoom) * 0.5);
      const zw = sw * zoom;
      const zh = sh * zoom;

      ctx.filter = "blur(2px) saturate(140%) brightness(0.85)";
      ctx.drawImage(sourceCanvas, zx, zy, zw, zh, 0, 0, cw, ch);

      // Subtle rim refraction shift
      ctx.globalCompositeOperation = "screen";
      ctx.globalAlpha = 0.25;
      ctx.filter = "blur(0.5px) saturate(180%)";

      const shift = 4 * scaleX;
      ctx.drawImage(sourceCanvas, sx - shift, sy - shift * 0.5, sw + shift * 2, sh + shift, 0, 0, cw, ch);
      ctx.restore();
    });

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  // Scroll spy + scroll depth
  useEffect(() => {
    if (location.pathname !== "/") return;

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      let current = "hero";
      NAV_ITEMS.forEach((item) => {
        const el = document.getElementById(item.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= window.innerHeight / 3) {
            current = item.id;
          }
        }
      });
      setScrollSection(current);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  const handlePointerMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = pillRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty("--mx", `${x.toFixed(1)}%`);
    el.style.setProperty("--my", `${y.toFixed(1)}%`);
  };

  const handleNavClick = (item: { label: string; id: string; path?: string }) => {
    setIsMobileMenuOpen(false);
    if (item.path) {
      navigate(item.path);
      return;
    }
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" }), 300);
    } else {
      document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleBrandClick = () => {
    setIsNameExpanded((v) => !v);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="fixed top-4 md:top-5 left-1/2 -translate-x-1/2 z-50 w-[92%] sm:w-max">
      {/* ── Hidden SVG Optical Refraction Filter ── */}
      <LiquidLensFilter id="apple-liquid-glass" mapUrl={lensMapUrl} preset="nav" />

      {/* ── Liquid Glass Pill ──────────────────────────────────────────────── */}
      <motion.div
        ref={pillRef}
        onMouseMove={handlePointerMove}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={`nav-pill relative overflow-hidden flex items-center justify-between sm:justify-center gap-5 md:gap-7 px-5 py-2.5 md:px-7 ${scrolled ? "nav-pill-scrolled" : ""
          }`}
      >
        {/* Layer 1: Live Refracted Koi Canvas Sample */}
        <canvas
          ref={refractCanvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none opacity-45 mix-blend-screen z-0"
        />

        {/* Layer 2: Whisper-thin Specular Rim & Subtle Pointer Glare */}
        <div className="liquid-specular-rim pointer-events-none" />
        <div className="liquid-caustic-glare pointer-events-none" />

        {/* ── Brand (custom signature mark: interlocked KP + koi-tail swash) ── */}
        <button
          onClick={handleBrandClick}
          className="relative z-10 flex items-center group flex-shrink-0 cursor-pointer"
        >
          <div
            className={`brand-font flex items-baseline text-xl md:text-2xl ${
              !isNameExpanded && typeIndex === 0 ? "brand-ligature" : ""
            }`}
          >
            <span className="brand-k">K</span>
            <span className="brand-expand">{firstTarget.slice(0, typeIndex)}</span>
            <span className="brand-p">P</span>
            <span className="brand-expand pr-0.5">{secondTarget.slice(0, typeIndex)}</span>
          </div>
          {/* Koi-tail swash: stretches with the typed name, forked flick at the tail */}
          <svg
            className="brand-swash"
            viewBox="0 0 100 18"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path d="M2 12.5 C 24 17.5, 44 4, 72 8.5 C 83 10.2, 90 7.5, 96 3.5" />
            <path d="M74 9.5 C 84 10.5, 91 9.5, 97.5 8" />
          </svg>
        </button>

        {/* Divider */}
        <div className="relative z-10 hidden sm:block w-px h-4 bg-white/12 flex-shrink-0" />

        {/* ── Desktop Nav ─────────────────────────────────────────────── */}
        <nav className="relative z-10 hidden sm:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={`nav-item cursor-pointer ${isActive ? "nav-item-active" : ""}`}
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-pill-indicator"
                    className="nav-active-bg"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10 font-mono">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* ── Desktop "Collaborate" CTA ──────────────────────────────── */}
        <div className="relative z-10 hidden sm:flex items-center pl-4 border-l border-white/12">
          <button
            onClick={() => navigate("/collaborate")}
            className="liquid-cta px-4 py-1.5 rounded-full text-ivory/95 font-mono text-xs uppercase tracking-wider hover:text-ivory transition-all cursor-pointer"
          >
            Collaborate
          </button>
        </div>

        {/* ── Mobile Toggle ───────────────────────────────────────────── */}
        <button
          className="relative z-10 sm:hidden text-ivory-soft hover:text-ivory transition-colors duration-200 ml-2"
          onClick={() => setIsMobileMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={isMobileMenuOpen ? "close" : "open"}
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
              transition={{ duration: 0.15 }}
            >
              {isMobileMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </motion.span>
          </AnimatePresence>
        </button>
      </motion.div>

      {/* ── Mobile Dropdown ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="mobile-menu mt-2.5 p-2"
          >
            {NAV_ITEMS.map((item, idx) => {
              const isActive = activeSection === item.id;
              return (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04, duration: 0.2 }}
                  onClick={() => handleNavClick(item)}
                  className={`mobile-nav-item ${isActive ? "mobile-nav-item-active" : ""}`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${isActive ? "bg-vermilion shadow-[0_0_6px_#E98259]" : "bg-gray-500"
                      }`}
                  />
                  <span className="font-mono text-sm tracking-widest uppercase">{item.label}</span>
                </motion.button>
              );
            })}

            {/* ── Mobile "Collaborate" CTA ──────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: NAV_ITEMS.length * 0.04, duration: 0.2 }}
              className="pt-2 mt-1 border-t border-white/10"
            >
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigate("/collaborate");
                }}
                className="liquid-cta w-full py-3 rounded-xl text-ivory font-mono text-xs uppercase tracking-widest transition-all cursor-pointer"
              >
                Collaborate
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lobster+Two:ital,wght@1,700&display=swap');

        /* ── Smoked Apple Liquid Glass Pill ───────────────────────── */
        .nav-pill {
          --mx: 50%;
          --my: 50%;
          border-radius: 9999px;
          /* No base background: pure glass over whatever is behind it */
          backdrop-filter: url(#apple-liquid-glass) blur(2.5px) saturate(140%) brightness(0.72);
          -webkit-backdrop-filter: blur(3px) saturate(140%) brightness(0.72);
          border: 1px solid rgba(255, 255, 255, 0.09);
          box-shadow:
            inset 0 1px 0.5px 0 rgba(255, 255, 255, 0.22),
            inset 0 -1px 1px 0 rgba(255, 255, 255, 0.04),
            0 10px 30px -5px rgba(0, 0, 0, 0.55);
          transition: box-shadow 0.35s ease, border-color 0.35s ease;
        }

        .nav-pill-scrolled {
          border-color: rgba(255, 255, 255, 0.12);
          box-shadow:
            inset 0 1px 0.5px 0 rgba(255, 255, 255, 0.26),
            inset 0 -1px 1px 0 rgba(255, 255, 255, 0.04),
            0 14px 36px -5px rgba(0, 0, 0, 0.7);
        }

        /* ── Whisper-Thin Specular Rim (Reduced by ~65%) ─────────── */
        .liquid-specular-rim {
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          padding: 1px;
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.24) 0%,
            rgba(255, 255, 255, 0.02) 40%,
            transparent 70%,
            transparent 100%
          );
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          z-index: 1;
        }

        /* ── Very Subtle Pointer Glare (No milky washout) ────────── */
        .liquid-caustic-glare {
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          background: radial-gradient(
            140px circle at var(--mx) var(--my),
            rgba(255, 255, 255, 0.06),
            transparent 70%
          );
          z-index: 1;
        }

        /* ── Brand (signature mark) ────────────────────────────────── */
        .brand-font {
          font-family: 'Playfair Display', serif;
          font-style: italic;
          font-weight: 700;
          line-height: 1.2;
          padding-bottom: 2px;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.75);
        }
        .brand-k, .brand-p, .brand-expand {
          color: var(--color-text-primary);
        }
        .brand-expand {
          font-style: italic;
        }
        /* Collapsed KP: letters interlock into a bespoke ligature */
        .brand-ligature .brand-k {
          margin-right: -0.14em;
        }
        /* Koi-tail swash under the wordmark — stretches as the name types out */
        .brand-swash {
          position: absolute;
          left: 0.1em;
          bottom: -3px;
          width: calc(100% - 0.2em);
          height: 8px;
          pointer-events: none;
          overflow: visible;
        }
        .brand-swash path {
          fill: none;
          stroke: #E98259;
          stroke-width: 1.6;
          stroke-linecap: round;
          opacity: 0.9;
        }

        /* ── Nav Items (High-Contrast Crisp Legibility) ───────────── */
        .nav-item {
          position: relative;
          padding: 0.375rem 0.8rem;
          border-radius: 9999px;
          font-family: 'Inter', sans-serif;
          font-size: 0.72rem;
          font-weight: 500;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          color: rgba(242, 239, 230, 0.88);
          transition: color 0.2s ease;
          white-space: nowrap;
          /* Crisp dark halo around letters so bright background text never washes them out */
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.85), 0 0 10px rgba(0, 0, 0, 0.55);
        }
        .nav-item:hover {
          color: var(--color-text-primary);
        }
        .nav-item-active {
          color: var(--color-text-primary);
          font-weight: 600;
        }

        /* ── Inner Active Droplet Pill ────────────────────────────── */
        .nav-active-bg {
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          border: 1px solid rgba(255, 255, 255, 0.16);
          box-shadow:
            inset 0 1px 0.5px rgba(255, 255, 255, 0.28),
            0 2px 8px rgba(0, 0, 0, 0.35);
        }

        /* ── Liquid CTA Button ────────────────────────────────────── */
        .liquid-cta {
          border: 1px solid rgba(255, 255, 255, 0.14);
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.85);
          box-shadow:
            inset 0 1px 0.5px rgba(255, 255, 255, 0.22),
            0 2px 8px rgba(0, 0, 0, 0.3);
        }
        .liquid-cta:hover {
          border-color: rgba(255, 255, 255, 0.25);
          box-shadow:
            inset 0 1px 0.5px rgba(255, 255, 255, 0.35),
            0 4px 12px rgba(0, 0, 0, 0.4);
        }

        /* ── Mobile Dropdown Menu ─────────────────────────────────── */
        .mobile-menu {
          border-radius: 1.35rem;
          /* No base background: pure glass over whatever is behind it */
          backdrop-filter: url(#apple-liquid-glass) blur(4px) saturate(140%) brightness(0.7);
          -webkit-backdrop-filter: blur(4px) saturate(140%) brightness(0.7);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow:
            inset 0 1px 0.5px rgba(255, 255, 255, 0.2),
            0 20px 48px rgba(0, 0, 0, 0.65);
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .mobile-nav-item {
          display: flex;
          align-items: center;
          gap: 0.875rem;
          width: 100%;
          text-align: left;
          padding: 0.75rem 1rem;
          border-radius: 0.875rem;
          color: rgba(242, 239, 230, 0.9);
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
          transition: all 0.2s ease;
        }
        .mobile-nav-item:hover {
          color: var(--color-text-primary);
        }
        .mobile-nav-item-active {
          color: var(--color-text-primary);
          border: 1px solid rgba(255, 255, 255, 0.14);
        }
      `}</style>
    </div>
  );
}