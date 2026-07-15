import { useState, useRef } from "react";
import { motion, AnimatePresence, useScroll, useSpring, useTransform } from "framer-motion";
import { FaBrain, FaServer, FaProjectDiagram, FaPaperPlane, FaRobot, FaChevronDown } from "react-icons/fa";
import ChatModal from "../components/ChatModal";
import Navbar from "../components/Navbar";
import LiquidGlassCursor from "../components/LiquidGlassCursor";
import api from "../api/axios";

// ─── Film Grain ───────────────────────────────────────────────────────────────
const Grain = () => (
  <div
    className="pointer-events-none fixed inset-0 z-[80] opacity-[0.05] mix-blend-overlay"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
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
      className="fixed top-0 left-0 right-0 h-[2px] z-[96] origin-left bg-gradient-to-r from-transparent via-[#cfe3d4]/70 to-[#cfe3d4]/30"
      style={{ scaleX }}
    />
  );
};

// ─── Parallax hero (photo shows through from body bg) ────────────────────────
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
  const scrimOpacity = useTransform(scrollYProgress, [0, 1], [0.5, 0.9]);

  return (
    <section ref={ref} className="relative pt-36 md:pt-52 pb-24 md:pb-36 overflow-hidden">
      <motion.div style={{ opacity: scrimOpacity }} className="absolute inset-0 bg-[#060a08] pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-b from-transparent to-[#060a08] pointer-events-none" />

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
          <span className="h-px w-12 bg-gradient-to-r from-transparent to-[#9db4a4]/40" />
          <span className="font-mono text-[10px] md:text-[11px] tracking-[0.35em] uppercase text-[#9db4a4]">
            collaborate
          </span>
          <span className="h-px w-12 bg-gradient-to-r from-[#9db4a4]/40 to-transparent" />
        </motion.div>

        <h1 className="display-title mb-6 md:mb-8" aria-label="Let's architect intelligent systems.">
          {TITLE_WORDS.map(({ word, accent }, i) => (
            <span key={i} className="inline-block overflow-hidden align-bottom pb-[0.08em] -mb-[0.08em] mr-[0.28em] last:mr-0">
              <motion.span
                className={`inline-block will-change-transform ${accent ? "text-[#cfe3d4]" : ""}`}
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
          className="text-[#a9baae] text-sm md:text-lg font-light leading-relaxed max-w-xl mx-auto"
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

  // Custom Dropdown State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    company:"",
    email: "",
    scope: "",
    engagement: "Freelance Project" // Default selection
  });

  const engagementOptions = [
    "Freelance Project",
    "Full-Time Role / Internship",
    "Technical Consulting",
    "Other"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");

    try {
      await api.post("inquire/", {
        name: formData.name,
        company: formData.company,
        email: formData.email,
        engagement_type: formData.engagement,
        scope: formData.scope
      });
      setStatus("success");
      setFormData({ name: "", company: "", email: "", scope: "", engagement: "Freelance Project" }); 
    } catch (error) {
      console.error("Failed to send inquiry", error);
      setStatus("idle"); 
      alert("System error. Please try again.");
    }
  };

  const services = [
    {
      icon: <FaBrain className="text-[#cfe3d4] text-xl" />,
      title: "LLM Integration",
      desc: "Custom prompt architecture, context injection, and deployment of powerful open-source models (like Qwen) or running local models."
    },
    {
      icon: <FaProjectDiagram className="text-[#9db4a4] text-xl" />,
      title: "RAG & Workflows",
      desc: "Designing intelligent agentic workflows and hybrid architectures combining LangGraph and n8n to connect private knowledge bases."
    },
    {
      icon: <FaServer className="text-[#7d9284] text-xl" />,
      title: "Backend Architecture",
      desc: "Building clean, cost-optimized, and highly scalable REST APIs using Django to securely bridge frontend applications with AI systems."
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="relative min-h-screen text-[#e9efe9] custom-cursor-wrapper"
    >
      <LiquidGlassCursor />
      <Navbar />
      <ScrollProgress />
      <Grain />

      {/* ── Parallax hero ──────────────────────────────────────────── */}
      <CollabHero />

      {/* ── Main Panel ─────────────────────────────────────────────── */}
      <main className="relative z-10 bg-[#060a08] pb-24 pt-4 md:pt-8">

        <section className="relative flex flex-col items-center justify-start px-6 md:px-10 max-w-6xl mx-auto">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-16 w-full">

            {/* Left Column: Services & AI Closer */}
            <div className="lg:col-span-6 xl:col-span-7 space-y-12">
              <div>
                <motion.h3 
                  initial={{ opacity: 0, x: -20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  transition={{ delay: 0.2, ease: EASE }} 
                  className="font-mono text-[10px] md:text-[11px] text-[#9db4a4] tracking-[0.35em] uppercase mb-6 flex items-center gap-4"
                >
                  <span className="h-px bg-white/[0.06] flex-grow max-w-[40px]" />
                  Core Capabilities
                </motion.h3>

                <div>
                  {services.map((service, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + idx * 0.12, duration: 0.7, ease: EASE }}
                      className="group border-t border-white/[0.06] last:border-b py-7 md:py-9 grid grid-cols-[auto_auto_1fr] gap-5 md:gap-6 items-start hover:bg-white/[0.015] transition-colors duration-300"
                    >
                      <span className="font-mono text-[10px] text-[#8fa697] tracking-[0.25em] pt-2">
                        0{idx + 1}
                      </span>
                      <div className="mt-1 shrink-0">{service.icon}</div>
                      <div>
                        <h4 className="text-lg md:text-xl font-serif italic text-[#e9efe9] mb-2 transition-transform duration-500 group-hover:translate-x-1.5">
                          {service.title}
                        </h4>
                        <p className="text-sm font-light text-[#94a89a] leading-relaxed transition-transform duration-500 group-hover:translate-x-1.5">
                          {service.desc}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.6, ease: EASE }}
                className="mt-12 p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-6"
              >
                <div>
                  <h4 className="text-[#e9efe9] font-medium mb-1 font-serif text-xl">Not sure where to start?</h4>
                  <p className="text-xs text-[#8fa697] font-mono tracking-widest uppercase">Ask my AI assistant.</p>
                </div>
                <button 
                  onClick={() => setIsChatOpen(true)} 
                  className="px-6 py-3 rounded-full bg-[#cfe3d4]/10 border border-[#cfe3d4]/20 hover:bg-[#cfe3d4]/15 hover:border-[#cfe3d4]/40 transition-all flex items-center gap-2 text-[10px] font-mono tracking-[0.1em] uppercase whitespace-nowrap text-[#e9efe9]"
                >
                  <FaRobot className="text-[#cfe3d4] text-xs" />
                  Ask the AI
                </button>
              </motion.div>
            </div>

            {/* Right Column: The Filter Form */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: 0.4, ease: EASE }} 
              className="lg:col-span-6 xl:col-span-5"
            >
              <div className="p-8 md:p-10 rounded-2xl bg-[#060a08] border border-white/[0.06] shadow-2xl shadow-black/50 min-h-[460px] flex flex-col relative">
                <h3 className="text-lg font-serif italic mb-8 text-[#e9efe9] border-b border-white/[0.06] pb-4">
                  Project Inquiry
                </h3>

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
                        <div className="absolute inset-0 rounded-full border border-[#cfe3d4]/30 animate-ping opacity-40" />
                        <div className="absolute inset-[-15px] rounded-full border border-[#cfe3d4]/20 animate-pulse opacity-30" />
                        <div className="relative w-20 h-20 rounded-full bg-[#cfe3d4]/10 flex items-center justify-center border border-[#cfe3d4]/20 shadow-none backdrop-blur-md">
                          <FaPaperPlane className="text-[#cfe3d4] text-2xl ml-[-2px] mt-[2px]" />
                        </div>
                      </div>

                      <h4 className="text-2xl font-serif italic mb-4 text-[#e9efe9]">
                        Transmission Received
                      </h4>
                      <p className="text-sm text-[#94a89a] font-light leading-relaxed max-w-[260px] mx-auto">
                        I will review your architecture parameters and initialize contact shortly.
                      </p>

                      <button
                        onClick={() => setStatus("idle")}
                        className="mt-10 text-[10px] font-mono text-[#8fa697] hover:text-[#cfe3d4] tracking-[0.2em] uppercase transition-colors"
                      >
                        [ Send Another ]
                      </button>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      onSubmit={handleSubmit}
                      className="space-y-5 flex-grow"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <div className="grid grid-cols-2 gap-5">
                        <div>
                          <label className="block text-[10px] font-mono text-[#8fa697] uppercase tracking-widest mb-2">Name</label>
                          <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                            className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-[#e9efe9] focus:outline-none focus:border-[#cfe3d4]/40 transition-colors"
                            placeholder="John" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono text-[#8fa697] uppercase tracking-widest mb-2">Company</label>
                          <input type="text" required value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})}
                            className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-[#e9efe9] focus:outline-none focus:border-[#cfe3d4]/40 transition-colors"
                            placeholder="Google" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono text-[#8fa697] uppercase tracking-widest mb-2">Email</label>
                        <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                          className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-[#e9efe9] focus:outline-none focus:border-[#cfe3d4]/40 transition-colors"
                          placeholder="you@company.com" />
                      </div>

                      {/* ── CUSTOM DROPDOWN ──────────────────────────────── */}
                      <div className="relative z-20">
                        <label className="block text-[10px] font-mono text-[#8fa697] uppercase tracking-widest mb-2">Engagement Type</label>

                        {/* Dropdown Trigger */}
                        <div
                          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                          className={`w-full bg-white/[0.02] border ${isDropdownOpen ? 'border-[#cfe3d4]/40 shadow-none' : 'border-white/[0.06]'} rounded-xl px-4 py-3 text-sm text-[#e9efe9] flex justify-between items-center cursor-pointer hover:border-[#cfe3d4]/40 transition-all`}
                        >
                          <span>{formData.engagement}</span>
                          <FaChevronDown className={`text-[#8fa697] text-xs transition-transform duration-300 ${isDropdownOpen ? "rotate-180 text-[#cfe3d4]" : ""}`} />
                        </div>

                        {/* Dropdown Menu */}
                        <AnimatePresence>
                          {isDropdownOpen && (
                            <>
                              {/* Invisible overlay to close dropdown when clicking outside */}
                              <div className="fixed inset-0 z-30" onClick={() => setIsDropdownOpen(false)} />

                              <motion.div
                                initial={{ opacity: 0, y: -10, scaleY: 0.95 }}
                                animate={{ opacity: 1, y: 0, scaleY: 1 }}
                                exit={{ opacity: 0, y: -10, scaleY: 0.95 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                                style={{ transformOrigin: "top" }}
                                className="absolute top-[calc(100%+8px)] left-0 w-full z-40 bg-[#060a08]/95 backdrop-blur-xl border border-white/[0.06] rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden"
                              >
                                {engagementOptions.map((option, idx) => (
                                  <div
                                    key={idx}
                                    onClick={() => {
                                      setFormData({ ...formData, engagement: option });
                                      setIsDropdownOpen(false);
                                    }}
                                    className={`px-4 py-3.5 text-sm cursor-pointer transition-colors border-b border-white/[0.02] last:border-0 ${
                                      formData.engagement === option
                                        ? 'bg-[#cfe3d4]/10 text-[#cfe3d4]'
                                        : 'text-[#a9baae] hover:bg-white/[0.04] hover:text-white'
                                    }`}
                                  >
                                    {option}
                                  </div>
                                ))}
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono text-[#8fa697] uppercase tracking-widest mb-2">Scope & Tech Stack</label>
                        <textarea required rows={4} value={formData.scope} onChange={e => setFormData({...formData, scope: e.target.value})}
                          className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-[#e9efe9] focus:outline-none focus:border-[#cfe3d4]/40 transition-colors resize-none relative z-10"
                          placeholder="Tell me about the architecture you want to build..." />
                      </div>

                      <div className="pt-4 relative z-10">
                        <button type="submit" disabled={status === "submitting"}
                          className="w-full py-4 rounded-xl bg-white/[0.04] border border-white/[0.06] text-[#e9efe9] font-mono text-xs tracking-widest uppercase hover:bg-white/[0.08] hover:border-white/10 transition-all flex justify-center items-center gap-3 disabled:opacity-50"
                        >
                          {status === "submitting" ? "Initializing..." : (
                            <>Initialize Contact <FaPaperPlane className="text-[10px] text-[#cfe3d4]" /></>
                          )}
                        </button>
                        <p className="text-center text-[9px] text-[#5f7266] mt-4 font-mono tracking-widest uppercase">
                          🟢 Responds within 24 hours.
                        </p>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <ChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} mode="sales" />
      <footer className="relative z-10 py-8 text-center bg-[#060a08] border-t border-white/[0.06]">
        <p className="font-mono text-[#5f7266] text-xs tracking-[0.2em] flex items-center justify-center gap-3">
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
          color: #e9efe9;
        }

        .decal-easter-egg {
          font-family: 'Dancing Script', cursive;
          letter-spacing: 0.08em;
          font-size: 1.1rem;
          color: rgba(207, 227, 212, 0.45);
          text-shadow: 0 0 10px rgba(207, 227, 212, 0.15);
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