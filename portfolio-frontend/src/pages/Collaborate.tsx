import { useState, useRef, type FormEvent } from "react";
import { motion, AnimatePresence, useScroll, useSpring, useTransform } from "framer-motion";
import { FaBrain, FaServer, FaProjectDiagram, FaPaperPlane, FaRobot, FaChevronDown } from "react-icons/fa";
import ChatModal from "../components/ChatModal";
import Navbar from "../components/Navbar";
import AsciiKoiCanvas from "../components/AsciiKoiCanvas";
import LiquidGlassCursor from "../components/LiquidGlassCursor";
import { LiquidChatOrb, LiquidGlassCard, LiquidLensFilter } from "../components/LiquidGlass";
import { useCardLensMap } from "../hooks/useLensMap";
import api from "../api/axios";

// ─── Film Grain ───────────────────────────────────────────────────────────────
const Grain = () => (
  <div
    className="pointer-events-none fixed inset-0 z-[80] opacity-[0.05] mix-blend-overlay"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E/svg%3E")`,
    }}
  />
);

const EASE = [0.22, 1, 0.36, 1] as const;

// ─── Scroll progress bar ──────────────────────────────────────────────────────
const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.4 });
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[2px] z-[96] origin-left bg-gradient-to-r from-transparent via-vermilion/70 to-vermilion/30"
      style={{ scaleX }}
    />
  );
};

// ─── Parallax hero (Koi pond shows through) ───────────────────────────────────
const TITLE_WORDS: { word: string; accent: boolean }[] = [
  { word: "Let's", accent: false },
  { word: "architect", accent: false },
  { word: "intelligent", accent: true },
  { word: "systems.", accent: false },
];

const CollabHero = () => {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);
  const scrimOpacity = useTransform(scrollYProgress, [0, 1], [0.15, 0.55]);

  return (
    <section ref={ref} className="relative pt-36 md:pt-52 pb-20 md:pb-32 overflow-hidden">
      <motion.div
        style={{ opacity: scrimOpacity }}
        className="absolute inset-0 bg-[#000000] pointer-events-none"
      />

      <motion.div
        style={{ y, opacity }}
        className="relative z-10 text-center max-w-3xl mx-auto px-6 will-change-transform"
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
          className="flex justify-center items-center gap-4 mb-8"
        >
          <span className="h-px w-12 bg-gradient-to-r from-transparent to-vermilion/40" />
          <span className="font-mono text-[10px] md:text-[11px] tracking-[0.35em] uppercase text-vermilion">
            collaborate
          </span>
          <span className="h-px w-12 bg-gradient-to-r from-vermilion/40 to-transparent" />
        </motion.div>

        <h1
          className="display-title mb-6 md:mb-8 drop-shadow-[0_4px_24px_rgba(0,0,0,0.65)]"
          aria-label="Let's architect intelligent systems."
        >
          {TITLE_WORDS.map(({ word, accent }, i) => (
            <span
              key={i}
              className="inline-block overflow-hidden align-bottom pb-[0.08em] -mb-[0.08em] mr-[0.28em] last:mr-0"
            >
              <motion.span
                className={`inline-block will-change-transform ${accent ? "text-vermilion" : ""}`}
                initial={{ y: "110%", rotate: 4, opacity: 0 }}
                animate={{ y: 0, rotate: 0, opacity: 1 }}
                transition={{ duration: 0.9, ease: EASE, delay: 0.25 + i * 0.09 }}
              >
                {word}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.7 }}
          className="text-ivory-muted text-sm md:text-lg font-light leading-relaxed max-w-xl mx-auto drop-shadow-[0_2px_10px_rgba(0,0,0,0.75)]"
        >
          I help founders and teams build and integrate reliable AI systems into real products.
        </motion.p>
      </motion.div>
    </section>
  );
};

export default function Collaborate() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [status, setStatus] = useState("idle"); // idle, submitting, success
  const lensMapUrl = useCardLensMap();

  // Custom Dropdown State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    scope: "",
    engagement: "Freelance Project",
  });
  // Bots fill every input they find; humans never see this one.
  const [trap, setTrap] = useState("");
  const [error, setError] = useState("");

  const engagementOptions = [
    "Freelance Project",
    "Full-Time Role / Internship",
    "Technical Consulting",
    "Other",
  ];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Silently accept and drop: don't tell the bot it was caught.
    if (trap) {
      setStatus("success");
      return;
    }

    const lastSent = Number(localStorage.getItem("lastInquiry") ?? 0);
    if (Date.now() - lastSent < 30_000) {
      setError("Please wait 30 seconds before sending another inquiry.");
      return;
    }

    setError("");
    setStatus("submitting");

    try {
      await api.post("inquire/", {
        name: formData.name,
        company: formData.company,
        email: formData.email,
        engagement_type: formData.engagement,
        scope: formData.scope,
      });
      localStorage.setItem("lastInquiry", String(Date.now()));
      setStatus("success");
      setFormData({
        name: "",
        company: "",
        email: "",
        scope: "",
        engagement: "Freelance Project",
      });
    } catch (err) {
      console.error("Failed to send inquiry", err);
      setStatus("idle");
      setError("System error. Please try again.");
    }
  };

  const services = [
    {
      icon: <FaBrain className="text-vermilion text-xl" />,
      title: "LLM Integration",
      desc: "Custom prompt architecture, context injection, and deployment of powerful open-source models (like Qwen) or running local models.",
    },
    {
      icon: <FaProjectDiagram className="text-vermilion text-xl" />,
      title: "RAG & Workflows",
      desc: "Designing intelligent agentic workflows and hybrid architectures combining LangGraph and n8n to connect private knowledge bases.",
    },
    {
      icon: <FaServer className="text-ivory-faint text-xl" />,
      title: "Backend Architecture",
      desc: "Building clean, cost-optimized, and highly scalable REST APIs using Django to securely bridge frontend applications with AI systems.",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="relative min-h-screen bg-[#000000] text-ivory overflow-x-hidden custom-cursor-wrapper"
    >
      {/* ── Shared SVG Optical Refraction Filter for Cards & Inputs ── */}
      <LiquidLensFilter id="collab-liquid-glass" mapUrl={lensMapUrl} />

      {/* ── Background: Live ASCII Koi Fish Pond ── */}
      <AsciiKoiCanvas />

      {/* Ambient gradient glow in center water */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_50%_30%,rgba(233,130,89,0.05)_0%,transparent_70%)]" />

      <LiquidGlassCursor />
      <Navbar />
      <ScrollProgress />
      <Grain />

      {/* ── Parallax hero ──────────────────────────────────────────── */}
      <CollabHero />

      {/* ── Main Content (Transparent so Koi refract through cards) ── */}
      <main className="relative z-10 pb-24 pt-4 md:pt-8">
        <section className="relative flex flex-col items-center justify-start px-6 md:px-10 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-16 w-full">
            {/* Left Column: Services & AI Closer */}
            <div className="lg:col-span-6 xl:col-span-7 space-y-12">
              <div>
                <motion.h3
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, ease: EASE }}
                  className="font-mono text-[10px] md:text-[11px] text-vermilion tracking-[0.35em] uppercase mb-6 flex items-center gap-4"
                >
                  <span className="h-px bg-white/[0.08] flex-grow max-w-[40px]" />
                  Core Capabilities
                </motion.h3>

                <div className="space-y-4">
                  {services.map((service, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + idx * 0.12, duration: 0.7, ease: EASE }}
                    >
                      <LiquidGlassCard borderRadius={20} contentClassName="flex flex-col" className="p-6 md:p-7 group transition-transform duration-500 hover:-translate-y-0.5" zoom={0.86}>
                        <div className="grid grid-cols-[auto_auto_1fr] gap-4 md:gap-5 items-start">
                          <span className="font-mono text-[10px] text-vermilion/80 tracking-[0.25em] pt-2">
                            0{idx + 1}
                          </span>
                          <div className="liquid-icon-box w-11 h-11 rounded-2xl flex items-center justify-center shrink-0">
                            {service.icon}
                          </div>
                          <div>
                            <h4 className="text-lg md:text-xl font-serif italic text-ivory mb-1.5 transition-transform duration-500 group-hover:translate-x-1 drop-shadow-[0_1px_6px_rgba(0,0,0,0.8)]">
                              {service.title}
                            </h4>
                            <p className="text-sm font-light text-ivory-soft leading-relaxed transition-transform duration-500 group-hover:translate-x-1 drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)]">
                              {service.desc}
                            </p>
                          </div>
                        </div>
                      </LiquidGlassCard>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Liquid Glass AI Closer Box */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, ease: EASE }}
              >
                <LiquidGlassCard borderRadius={22} contentClassName="flex flex-col" className="p-7 md:p-8">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div>
                      <h4 className="text-ivory font-medium mb-1 font-serif italic text-xl drop-shadow-[0_1px_6px_rgba(0,0,0,0.8)]">
                        Not sure where to start?
                      </h4>
                      <p className="text-xs text-vermilion font-mono tracking-widest uppercase">
                        Ask my AI assistant to scope your stack.
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ y: -2, scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setIsChatOpen(true)}
                      className="liquid-pill-btn px-6 py-3.5 rounded-full flex items-center gap-2.5 text-[11px] font-mono tracking-[0.12em] uppercase whitespace-nowrap text-ivory cursor-pointer"
                    >
                      <FaRobot className="text-vermilion text-sm" />
                      <span>Ask the AI</span>
                    </motion.button>
                  </div>
                </LiquidGlassCard>
              </motion.div>
            </div>

            {/* Right Column: The Liquid Glass Inquiry Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, ease: EASE }}
              className="lg:col-span-6 xl:col-span-5"
            >
              <LiquidGlassCard
                allowOverflow={true}
                borderRadius={26}
                contentClassName="flex flex-col"
                className="p-8 md:p-10 min-h-[480px]"
              >
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-8">
                  <h3 className="text-xl font-serif italic text-ivory drop-shadow-[0_1px_6px_rgba(0,0,0,0.8)]">
                    Project Inquiry
                  </h3>
                  <span className="w-2 h-2 rounded-full bg-vermilion shadow-[0_0_8px_#E98259]" />
                </div>

                <AnimatePresence mode="wait">
                  {status === "success" ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="py-10 flex flex-col items-center justify-center text-center flex-grow"
                    >
                      <div className="relative mb-8 mt-4">
                        <div className="absolute inset-0 rounded-full border border-vermilion/35 animate-ping opacity-40" />
                        <div className="absolute inset-[-15px] rounded-full border border-vermilion/20 animate-pulse opacity-30" />
                        <div className="liquid-icon-box relative w-20 h-20 rounded-full flex items-center justify-center">
                          <FaPaperPlane className="text-vermilion text-2xl ml-[-2px] mt-[2px]" />
                        </div>
                      </div>

                      <h4 className="text-2xl font-serif italic mb-3 text-ivory">
                        Transmission Received
                      </h4>
                      <p className="text-sm text-ivory-soft font-light leading-relaxed max-w-[260px] mx-auto">
                        I will review your architecture parameters and initialize contact shortly.
                      </p>

                      <button
                        onClick={() => setStatus("idle")}
                        className="mt-10 text-[10px] font-mono text-vermilion hover:text-ivory tracking-[0.2em] uppercase transition-colors cursor-pointer"
                      >
                        [ Send Another ]
                      </button>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      onSubmit={handleSubmit}
                      className="space-y-5 flex-grow flex flex-col justify-between"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <div className="space-y-5">
                        <input
                          type="text"
                          name="website"
                          tabIndex={-1}
                          autoComplete="off"
                          aria-hidden="true"
                          value={trap}
                          onChange={(e) => setTrap(e.target.value)}
                          className="absolute left-[-9999px] w-px h-px opacity-0"
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <div>
                            <label className="block text-[10px] font-mono text-ivory-muted uppercase tracking-widest mb-2">
                              Name
                            </label>
                            <input
                              type="text"
                              required
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              className="liquid-input w-full rounded-xl px-4 py-3 text-sm text-ivory placeholder:text-ivory/30 focus:outline-none"
                              placeholder="John"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono text-ivory-muted uppercase tracking-widest mb-2">
                              Company
                            </label>
                            <input
                              type="text"
                              required
                              value={formData.company}
                              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                              className="liquid-input w-full rounded-xl px-4 py-3 text-sm text-ivory placeholder:text-ivory/30 focus:outline-none"
                              placeholder="Acme AI"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono text-ivory-muted uppercase tracking-widest mb-2">
                            Email
                          </label>
                          <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="liquid-input w-full rounded-xl px-4 py-3 text-sm text-ivory placeholder:text-ivory/30 focus:outline-none"
                            placeholder="you@company.com"
                          />
                        </div>

                        {/* ── CUSTOM LIQUID GLASS DROPDOWN ── */}
                        <div className="relative z-30">
                          <label className="block text-[10px] font-mono text-ivory-muted uppercase tracking-widest mb-2">
                            Engagement Type
                          </label>

                          <div
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className={`liquid-input w-full rounded-xl px-4 py-3 text-sm text-ivory flex justify-between items-center cursor-pointer ${isDropdownOpen ? "liquid-input-active" : ""}`}
                          >
                            <span>{formData.engagement}</span>
                            <FaChevronDown
                              className={`rotate-180 text-xs transition-transform duration-300 ${isDropdownOpen ? "text-vermilion" : "text-vermilion"}`}
                            />
                          </div>

                          <AnimatePresence>
                            {isDropdownOpen && (
                              <>
                                <div
                                  className="fixed inset-0 z-30"
                                  onClick={() => setIsDropdownOpen(false)}
                                />

                                <motion.div
                                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                                  transition={{ duration: 0.18, ease: EASE }}
                                  className="liquid-dropdown absolute top-[calc(100%+8px)] left-0 w-full z-40 rounded-xl overflow-hidden p-1.5"
                                >
                                  {engagementOptions.map((option, idx) => {
                                    const active = formData.engagement === option;
                                    return (
                                      <div
                                        key={idx}
                                        onClick={() => {
                                          setFormData({ ...formData, engagement: option });
                                          setIsDropdownOpen(false);
                                        }}
                                        className={`px-3.5 py-2.5 rounded-lg text-sm cursor-pointer transition-all flex items-center justify-between ${active
                                          ? "bg-white/[0.1] text-ivory font-medium border border-white/[0.12]"
                                          : "text-ivory-muted hover:bg-white/[0.05] hover:text-ivory"
                                        }`}
                                      >
                                        <span>{option}</span>
                                        {active && (
                                          <span className="w-1.5 h-1.5 rounded-full bg-vermilion shadow-[0_0_6px_#E98259]" />
                                        )}
                                      </div>
                                    );
                                  })}
                                </motion.div>
                              </>
                            )}
                          </AnimatePresence>
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono text-ivory-muted uppercase tracking-widest mb-2">
                            Scope & Tech Stack
                          </label>
                          <textarea
                            required
                            rows={4}
                            value={formData.scope}
                            onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                            className="liquid-input w-full rounded-xl px-4 py-3 text-sm text-ivory placeholder:text-ivory/30 focus:outline-none resize-none relative z-10"
                            placeholder="Tell me about the architecture you want to build..."
                          />
                        </div>
                      </div>

                      <div className="pt-4 relative z-10">
                        <motion.button
                          type="submit"
                          disabled={status === "submitting"}
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          className="liquid-pill-btn w-full py-4 rounded-xl text-ivory font-mono text-xs tracking-widest uppercase flex justify-center items-center gap-3 disabled:opacity-50 cursor-pointer"
                        >
                          {status === "submitting" ? (
                            "Initializing..."
                          ) : (
                            <>
                              <span>Initialize Contact</span>
                              <FaPaperPlane className="text-[11px] text-vermilion" />
                            </>
                          )}
                        </motion.button>
                        {error && (
                          <p className="text-center text-[10px] text-vermilion/90 font-mono tracking-widest uppercase mt-3">
                            {error}
                          </p>
                        )}
                        <p className="text-center text-[9px] text-vermilion mt-4 font-mono tracking-widest uppercase flex items-center justify-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-vermilion shadow-[0_0_6px_#E98259]" />
                          Responds within 24 hours.
                        </p>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </LiquidGlassCard>
            </motion.div>
          </div>
        </section>
      </main>

      {/* ── Floating Spherical Liquid Glass Chat Orb ── */}
      <AnimatePresence>
        {!isChatOpen && (
          <motion.div
            key="collab-chat-orb"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[85]"
          >
            <LiquidChatOrb onClick={() => setIsChatOpen(true)} />
          </motion.div>
        )}
      </AnimatePresence>

      <ChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} mode="sales" />

      <footer className="relative z-10 py-8 text-center bg-[#000000]/60 backdrop-blur-md border-t border-white/[0.06]">
        <p className="font-mono text-ivory-faint text-xs tracking-[0.2em] flex items-center justify-center gap-3">
          <span>© 2026 KEVAL_PARMAR</span>
          <span className="w-1 h-1 rounded-full bg-white/10" />
          <span>POWERED_BY_AI</span>
        </p>

        <span className="decal-easter-egg text-[10px] sm:text-xs">
          "to automate and overwrite..."
        </span>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&family=Dancing+Script:wght@600&display=swap');

        * { box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        .font-serif { font-family: 'Playfair Display', serif; }
        .custom-cursor-wrapper * { cursor: none !important; }

        /* ── Display titles ────────────────────────────────────────── */
        .display-title {
          font-family: 'Playfair Display', serif;
          font-weight: 500;
          font-style: italic;
          font-size: clamp(2.2rem, 6vw, 4.2rem);
          letter-spacing: -0.02em;
          line-height: 1.08;
          color: var(--color-text-primary);
        }

        /* ── Smoked Apple Liquid Glass Card ───────────────────────── */
        .liquid-glass-card {
          --mx: 50%;
          --my: 50%;
          /* No base background: pure glass */
          backdrop-filter: url(#collab-liquid-glass) blur(2.5px) saturate(145%) brightness(0.75);
          -webkit-backdrop-filter: blur(3px) saturate(145%) brightness(0.75);
          border: 1px solid rgba(255, 255, 255, 0.09);
          box-shadow:
            inset 0 1px 0.5px 0 rgba(255, 255, 255, 0.22),
            inset 0 -1px 1.5px 0 rgba(255, 255, 255, 0.06),
            0 18px 44px -8px rgba(0, 0, 0, 0.65);
          transition: border-color 0.35s ease, box-shadow 0.35s ease, transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .liquid-glass-card:hover {
          border-color: rgba(255, 255, 255, 0.14);
          box-shadow:
            inset 0 1px 1px 0 rgba(255, 255, 255, 0.28),
            inset 0 -1.5px 2px 0 rgba(255, 255, 255, 0.08),
            0 22px 50px -8px rgba(0, 0, 0, 0.78);
        }

        .liquid-card-rim {
          position: absolute;
          inset: 0;
          padding: 1px;
          background: linear-gradient(
            165deg,
            rgba(255, 255, 255, 0.24) 0%,
            rgba(255, 255, 255, 0.02) 38%,
            transparent 68%,
            transparent 100%
          );
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
        }

        .liquid-card-glare {
          position: absolute;
          inset: 0;
          background: radial-gradient(
            260px circle at var(--mx) var(--my),
            rgba(255, 255, 255, 0.055),
            transparent 70%
          );
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .liquid-glass-card:hover .liquid-card-glare {
          opacity: 1;
        }

        /* ── Liquid Glass Form Inputs & Dropdown ──────────────────── */
        .liquid-input {
          /* No base background: pure glass */
          border: 1px solid rgba(255, 255, 255, 0.09);
          box-shadow:
            inset 0 1px 2px rgba(0, 0, 0, 0.45),
            inset 0 1px 0.5px rgba(255, 255, 255, 0.12);
          transition: all 0.25s ease;
        }
        .liquid-input:hover {
          border-color: rgba(255, 255, 255, 0.15);
        }
        .liquid-input:focus, .liquid-input-active {
          border-color: rgba(255, 255, 255, 0.3);
          box-shadow:
            inset 0 1px 1px rgba(255, 255, 255, 0.22);
        }

        .liquid-dropdown {
          /* No base background: pure glass */
          backdrop-filter: url(#collab-liquid-glass) blur(6px) saturate(150%);
          -webkit-backdrop-filter: blur(8px) saturate(150%);
          border: 1px solid rgba(255, 255, 255, 0.14);
          box-shadow:
            inset 0 1px 0.5px rgba(255, 255, 255, 0.25),
            0 20px 50px rgba(0, 0, 0, 0.85);
        }

        /* ── Liquid Icon Box & Action Buttons ─────────────────────── */
        .liquid-icon-box {
          /* No base background: pure glass */
          border: 1px solid rgba(255, 255, 255, 0.11);
          box-shadow:
            inset 0 1px 0.5px rgba(255, 255, 255, 0.24),
            0 4px 12px rgba(0, 0, 0, 0.35);
        }

        .liquid-pill-btn {
          /* No base background: pure glass */
          backdrop-filter: blur(4px) saturate(145%);
          -webkit-backdrop-filter: blur(4px) saturate(145%);
          border: 1px solid rgba(255, 255, 255, 0.14);
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.85);
          box-shadow:
            inset 0 1px 0.5px rgba(255, 255, 255, 0.28),
            inset 0 -1px 1.5px rgba(255, 255, 255, 0.06),
            0 10px 28px -4px rgba(0, 0, 0, 0.55);
          transition: all 0.3s ease;
        }
        .liquid-pill-btn:hover {
          border-color: rgba(255, 255, 255, 0.3);
          box-shadow:
            inset 0 1px 1px rgba(255, 255, 255, 0.38),
            inset 0 -1px 2px rgba(255, 255, 255, 0.1),
            0 14px 34px -4px rgba(0, 0, 0, 0.7);
        }

        /* ── Spherical Liquid Glass Chat Orb ───────────────────────── */
        .liquid-chat-orb {
          /* No base background: pure glass */
          backdrop-filter: url(#cursor-liquid-lens) blur(2px) saturate(145%) brightness(0.78);
          -webkit-backdrop-filter: blur(2.5px) saturate(145%) brightness(0.78);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow:
            inset 0 1px 1px 0 rgba(255, 255, 255, 0.26),
            inset 0 -1.5px 2px 0 rgba(255, 255, 255, 0.06),
            0 12px 32px -4px rgba(0, 0, 0, 0.6);
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }
        .liquid-chat-orb:hover {
          border-color: rgba(255, 255, 255, 0.2);
          box-shadow:
            inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.38),
            inset 0 -1.5px 3px 0 rgba(255, 255, 255, 0.1),
            0 16px 36px -4px rgba(0, 0, 0, 0.75);
        }
        .liquid-chat-rim {
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          padding: 1px;
          background: linear-gradient(
            145deg,
            rgba(255, 255, 255, 0.32) 0%,
            rgba(255, 255, 255, 0.03) 42%,
            transparent 70%,
            transparent 100%
          );
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          z-index: 1;
        }

        .decal-easter-egg {
          font-family: 'Dancing Script', cursive;
          letter-spacing: 0.08em;
          font-size: 1.1rem;
          color: rgba(255, 255, 255, 0.45);
          cursor: crosshair;
          transition: all 0.4s ease-in-out;
        }
        .decal-easter-egg:hover {
          color: rgba(220, 38, 38, 0.9);
          text-shadow: 0 0 12px rgba(220, 38, 38, 0.6);
        }
      `}</style>
    </motion.div>
  );
}
