import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 🎯 Typing Effect State
  const [isNameExpanded, setIsNameExpanded] = useState(false);
  const [typeIndex, setTypeIndex] = useState(0);

  // 🎯 Active Section State
  const [activeSection, setActiveSection] = useState("hero");

  const firstTarget = "eval\u00A0";
  const secondTarget = "armar";

  const navItems = [
    { label: "Home", id: "hero" },
    { label: "About", id: "about" },
    { label: "Skills", id: "skills" },
    { label: "Experience", id: "experience" },
    { label: "Projects", id: "projects" },
    { label: "Contact", id: "contact" },
  ];

  // The Typewriter Engine
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    if (isNameExpanded) {
      interval = setInterval(() => {
        setTypeIndex((prev) => (prev < 5 ? prev + 1 : prev));
      }, 100);
    } else {
      interval = setInterval(() => {
        setTypeIndex((prev) => (prev > 0 ? prev - 1 : prev));
      }, 40);
    }

    return () => clearInterval(interval);
  }, [isNameExpanded]);

  // 🎯 The Scroll Spy & Route Tracker
  useEffect(() => {
    if (location.pathname.startsWith("/projects/")) {
      setActiveSection("projects");
      return;
    }

    if (location.pathname === "/") {
      const handleScroll = () => {
        const sections = navItems.map(item => document.getElementById(item.id));
        const scrollPosition = window.scrollY + window.innerHeight / 3;

        let current = "hero";
        sections.forEach(section => {
          if (section && section.offsetTop <= scrollPosition) {
            current = section.id;
          }
        });

        setActiveSection(current);
      };

      window.addEventListener("scroll", handleScroll);
      handleScroll();

      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, [location.pathname]);

  const scrollTo = (id: string) => {
    setIsMobileMenuOpen(false);
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleBrandClick = () => {
    setIsNameExpanded(!isNameExpanded);
    // Optional: Smoothly scroll to top of current page when clicking logo
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="fixed top-4 md:top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] sm:w-max">

      {/* Main Navbar Pill */}
      <div className="flex items-center justify-between sm:justify-center gap-6 md:gap-8 px-6 py-3 md:px-8 rounded-full bg-black/20 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(255,106,0,0.15)] transition-all duration-500">

        {/* BRANDING: Signature Typewriter */}
        <div
          onClick={handleBrandClick}
          className="flex items-center gap-3 cursor-pointer group flex-shrink-0"
        >
          {/* Glowing node */}
          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-orange-400 to-red-500 shadow-[0_0_10px_rgba(255,106,0,0.8)] group-hover:shadow-[0_0_15px_rgba(255,106,0,1)] transition-all duration-300" />

          {/* 🔥 SIGNATURE FONT APPLIED HERE
            - Bumped size to text-2xl/3xl because cursive fonts run smaller
            - Removed tracking-widest so the cursive letters connect!
          */}
          <div className="signature-font flex items-baseline text-2xl md:text-3xl bg-gradient-to-r from-orange-300 to-red-400 bg-clip-text text-transparent group-hover:brightness-125 transition-all">
            <span>K</span>
            <span>{firstTarget.slice(0, typeIndex)}</span>

            {/* The 'P' */}
            <span>P</span>
            <span className="pr-1">{secondTarget.slice(0, typeIndex)}</span>

            <AnimatePresence mode="wait">
              {!isNameExpanded && typeIndex === 0 && (
                <motion.span
                  key="dot"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  .
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Subtle Glass Divider */}
        <div className="hidden sm:block w-[1px] h-5 bg-white/20 flex-shrink-0" />

        {/* Navigation Links (Desktop) */}
        <div className="hidden sm:flex gap-6 md:gap-8 text-sm font-medium text-gray-200">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className={`relative group transition duration-300 whitespace-nowrap ${
                  isActive ? "text-orange-400" : "hover:text-orange-400"
                }`}
              >
                {item.label}
                <span
                  className={`absolute -bottom-1 left-0 h-[2px] bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-300 rounded-full blur-[0.5px] ${
                    isActive ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="sm:hidden text-gray-200 hover:text-orange-400 transition ml-4"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="absolute top-16 left-0 w-full sm:hidden bg-black/40 backdrop-blur-3xl border border-white/10 rounded-3xl p-6 shadow-[0_8px_32px_rgba(255,106,0,0.25),inset_0_0_30px_rgba(255,255,255,0.03)] flex flex-col gap-5">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className={`text-left text-lg font-medium transition px-2 ${
                  isActive ? "text-orange-400" : "text-gray-200 hover:text-orange-400"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      )}

      {/* 🔥 INJECTS THE GOOGLE FONT AUTOMATICALLY */}
      <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Lobster+Two:ital,wght@0,400;0,700;1,400;1,700&family=Orbitron:wght@400..900&display=swap');
        .signature-font {
          font-family: 'Lobster Two', cursive;
          font-weight: 400; /* Sacramento looks best at normal weight */
          line-height: 1.2;
          padding-bottom: 4px;
        }
      `}</style>
    </div>
  );
}
