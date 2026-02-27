import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const location = useLocation();
  const navigate  = useNavigate();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNameExpanded, setIsNameExpanded]     = useState(false);
  const [typeIndex, setTypeIndex]               = useState(0);
  const [activeSection, setActiveSection]       = useState("hero");
  const [scrolled, setScrolled]                 = useState(false);

  const firstTarget  = "eval\u00A0";
  const secondTarget = "armar";

  const navItems = [
    { label: "Home",       id: "hero"       },
    { label: "About",      id: "about"      },
    { label: "Skills",     id: "skills"     },
    { label: "Experience", id: "experience" },
    { label: "Projects",   id: "projects"   },
    { label: "Contact",    id: "contact"    },
  ];

  // Typewriter engine
  useEffect(() => {
    const interval = setInterval(() => {
      setTypeIndex(prev => {
        if (isNameExpanded) return prev < 5 ? prev + 1 : prev;
        return prev > 0 ? prev - 1 : prev;
      });
    }, isNameExpanded ? 90 : 40);
    return () => clearInterval(interval);
  }, [isNameExpanded]);

  // Scroll spy + scroll depth
  useEffect(() => {
    if (location.pathname.startsWith("/projects/")) {
      setActiveSection("projects");
      return;
    }
    if (location.pathname !== "/") return;

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      const scrollPosition = window.scrollY + window.innerHeight / 3;
      let current = "hero";
      navItems.forEach(item => {
        const el = document.getElementById(item.id);
        if (el && el.offsetTop <= scrollPosition) current = item.id;
      });
      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  const scrollTo = (id: string) => {
    setIsMobileMenuOpen(false);
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 300);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleBrandClick = () => {
    setIsNameExpanded(v => !v);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="fixed top-4 md:top-5 left-1/2 -translate-x-1/2 z-50 w-[92%] sm:w-max">

      {/* ── Pill ───────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={`nav-pill flex items-center justify-between sm:justify-center gap-5 md:gap-7 px-5 py-2.5 md:px-7 ${scrolled ? "nav-pill-scrolled" : ""}`}
      >

        {/* ── Brand ──────────────────────────────────────────────────── */}
        <button onClick={handleBrandClick} className="flex items-center gap-2.5 group flex-shrink-0">
          {/* Status dot */}
          <div className="relative flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.9)]" />
            <div className="absolute w-3 h-3 rounded-full border border-cyan-400/30 animate-ping opacity-60" />
          </div>

          {/* Logo text */}
          <div className="brand-font flex items-baseline text-xl md:text-2xl">
            <span className="brand-k">K</span>
            <span className="brand-expand">{firstTarget.slice(0, typeIndex)}</span>
            <span className="brand-p">P</span>
            <span className="brand-expand pr-0.5">{secondTarget.slice(0, typeIndex)}</span>

            <AnimatePresence mode="wait">
              {!isNameExpanded && typeIndex === 0 && (
                <motion.span
                  key="dot"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ duration: 0.15 }}
                  className="brand-dot"
                >.</motion.span>
              )}
            </AnimatePresence>
          </div>
        </button>

        {/* Divider */}
        <div className="hidden sm:block w-px h-4 bg-white/10 flex-shrink-0" />

        {/* ── Desktop Nav ─────────────────────────────────────────────── */}
        <nav className="hidden sm:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className={`nav-item ${isActive ? "nav-item-active" : ""}`}
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

        {/* ── Desktop "Work With Me" CTA ──────────────────────────────── */}
        <div className="hidden sm:flex items-center pl-4 border-l border-white/10">
          <button
            onClick={() => navigate("/collaborate")}
            className="px-4 py-1.5 rounded-full bg-gradient-to-r from-cyan-400/10 to-violet-400/10 border border-cyan-400/30 text-cyan-300 font-mono text-xs uppercase tracking-wider hover:bg-cyan-400/20 hover:text-white transition-all shadow-[0_0_15px_rgba(34,211,238,0.15)] hover:shadow-[0_0_25px_rgba(34,211,238,0.3)]"
          >
            Collaborate
          </button>
        </div>

        {/* ── Mobile Toggle ───────────────────────────────────────────── */}
        <button
          className="sm:hidden text-gray-400 hover:text-cyan-400 transition-colors duration-200 ml-2"
          onClick={() => setIsMobileMenuOpen(v => !v)}
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
            className="mobile-menu mt-2 p-2"
          >
            {navItems.map((item, idx) => {
              const isActive = activeSection === item.id;
              return (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04, duration: 0.2 }}
                  onClick={() => scrollTo(item.id)}
                  className={`mobile-nav-item ${isActive ? "mobile-nav-item-active" : ""}`}
                >
                  <span className={`w-1 h-1 rounded-full shrink-0 ${isActive ? "bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.9)]" : "bg-gray-600"}`} />
                  <span className="font-mono text-sm tracking-widest uppercase">{item.label}</span>
                </motion.button>
              );
            })}

            {/* ── Mobile "Work With Me" CTA ──────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: navItems.length * 0.04, duration: 0.2 }}
              className="pt-2 mt-1 border-t border-white/10"
            >
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigate("/collaborate");
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500/10 to-violet-500/10 border border-cyan-400/30 text-cyan-300 font-mono text-xs uppercase tracking-widest hover:bg-cyan-400/20 transition-all shadow-[0_0_15px_rgba(34,211,238,0.1)]"
              >
                Collaborate
              </button>
            </motion.div>

          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Lobster+Two:ital,wght@1,700&display=swap');

        /* ── Pill ─────────────────────────────────────────────────── */
        .nav-pill {
          border-radius: 9999px;
          background: rgba(8, 12, 18, 0.7);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.08);
          transition: background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
        }
        .nav-pill-scrolled {
          background: rgba(8, 12, 18, 0.88);
          border-color: rgba(34,211,238,0.12);
          box-shadow: 0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(34,211,238,0.06);
        }

        /* ── Brand ────────────────────────────────────────────────── */
        .brand-font {
          font-family: 'Lobster Two', cursive;
          font-style: italic;
          font-weight: 700;
          line-height: 1.2;
          padding-bottom: 2px;
        }
        .brand-k, .brand-p {
          background: linear-gradient(135deg, #22d3ee, #818cf8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          /* fallback */
          color: #22d3ee;
        }
        .brand-expand {
          color: rgba(148,163,184,0.9);
          font-style: italic;
        }
        .brand-dot {
          color: #22d3ee;
          -webkit-text-fill-color: #22d3ee;
        }

        /* ── Nav items ────────────────────────────────────────────── */
        .nav-item {
          position: relative;
          padding: 0.375rem 0.75rem;
          border-radius: 0.5rem;
          font-family: 'Space Mono', monospace;
          font-size: 0.7rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(156,163,175,0.9);
          transition: color 0.2s ease;
          white-space: nowrap;
        }
        .nav-item:hover { color: #ffffff; }
        .nav-item-active { color: #22d3ee; }
        .nav-active-bg {
          position: absolute;
          inset: 0;
          border-radius: 0.5rem;
          background: rgba(34,211,238,0.08);
          border: 1px solid rgba(34,211,238,0.2);
        }

        /* ── Mobile menu ──────────────────────────────────────────── */
        .mobile-menu {
          border-radius: 1.25rem;
          background: rgba(8, 12, 18, 0.92);
          backdrop-filter: blur(30px);
          -webkit-backdrop-filter: blur(30px);
          border: 1px solid rgba(255,255,255,0.07);
          box-shadow: 0 16px 48px rgba(0,0,0,0.5);
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
          color: rgba(156,163,175,0.8);
          transition: all 0.2s ease;
        }
        .mobile-nav-item:hover {
          background: rgba(255,255,255,0.04);
          color: white;
        }
        .mobile-nav-item-active {
          background: rgba(34,211,238,0.06);
          color: #22d3ee;
          border: 1px solid rgba(34,211,238,0.15);
        }
      `}</style>
    </div>
  );
}