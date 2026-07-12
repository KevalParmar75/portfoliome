import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaBrain, FaServer, FaProjectDiagram, FaPaperPlane, FaRobot, FaChevronDown } from "react-icons/fa";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import type { Engine } from "tsparticles-engine";
import ChatModal from "../components/ChatModal";
import Navbar from "../components/Navbar";
import LiquidGlassCursor from "../components/LiquidGlassCursor";
import api from "../api/axios";
// ─── Plasma Blob ────────────────────────────────────────────────────────────────
const PlasmaBlob = ({ blob }: { blob: any }) => (
  <div
    className={`plasma ${blob.color}`}
    style={{ width: blob.size, height: blob.size, top: blob.top, left: blob.left, animationDelay: `${blob.delay}s` }}
  />
);

// ─── Grid lines background ────────────────────────────────────────────────────────
const GridLines = () => (
  <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.025]"
    style={{
      backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
      backgroundSize: "60px 60px"
    }}
  />
);

// ─── Particles Config ─────────────────────────────────────────────────────────────
const PARTICLES_OPTIONS = {
  background: { color: "transparent" },
  fpsLimit: 30,
  particles: {
    color: { value: ["#d946ef", "#a855f7", "#ffffff"] },
    move: { enable: true, speed: 0.1 },
    number: { value: 18 },
    opacity: { value: 0.12 },
    size: { value: { min: 0.5, max: 1.5 } },
    links: { enable: true, distance: 140, color: "#d946ef", opacity: 0.04, width: 1 },
  },
};

const BLOBS = [
  { size: 380, top: "0%",   left: "60%",  color: "plasma-cyan",   delay: 0 },
  { size: 420, top: "50%",  left: "-10%", color: "plasma-violet", delay: 3 },
  { size: 300, top: "80%",  left: "75%",  color: "plasma-cyan",   delay: 7 },
  { size: 350, top: "-5%",  left: "-5%",  color: "plasma-violet", delay: 5 },
  { size: 280, top: "35%",  left: "50%",  color: "plasma-indigo", delay: 2 },
  { size: 320, top: "100%", left: "40%",  color: "plasma-cyan",   delay: 9 },
];

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

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  // 2. Replace the handleSubmit function
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");

    try {
      // Send the payload to Django
      await api.post("inquire/", {
        name: formData.name,
        company: formData.company,
        email: formData.email,
        engagement_type: formData.engagement,
        scope: formData.scope
      });
      setStatus("success");
      setFormData({ name: "", company: "", email: "", scope: "", engagement: "Freelance Project" }); // Clear form
    } catch (error) {
      console.error("Failed to send inquiry", error);
      setStatus("idle"); // Revert if failed
      alert("System error. Please try again.");
    }
  };

  const services = [
    {
      icon: <FaBrain className="text-white text-xl" />,
      title: "LLM Integration",
      desc: "Custom prompt architecture, context injection, and deployment of powerful open-source models (like Qwen) or running local models."
    },
    {
      icon: <FaProjectDiagram className="text-gray-300 text-xl" />,
      title: "RAG & Workflows",
      desc: "Designing intelligent agentic workflows and hybrid architectures combining LangGraph and n8n to connect private knowledge bases."
    },
    {
      icon: <FaServer className="text-gray-400 text-xl" />,
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
      className="relative min-h-screen bg-transparent text-white overflow-hidden custom-cursor-wrapper"
    >
      <LiquidGlassCursor />
      <Navbar />
      <GridLines />

      {/* Plasma blobs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {BLOBS.map((blob, idx) => <PlasmaBlob key={idx} blob={blob} />)}
      </div>

      <Particles init={particlesInit} options={PARTICLES_OPTIONS} className="absolute inset-0 -z-10" />

      {/* ── Main Glass Tile ─────────────────────────────────────────────── */}
      <main className="relative z-10 m-3 sm:m-4 md:m-6 rounded-[2rem] md:rounded-[2.5rem] bg-black/40 backdrop-blur-[20px] border border-white/[0.07] shadow-[0_20px_80px_rgba(0,0,0,0.6),inset_0_0_40px_rgba(255,255,255,0.02)] pb-16 min-h-[calc(100vh-3rem)]">

        {/* Adjusted padding top (pt-40) to fix the header overlapping the navbar! */}
        <section className="relative flex flex-col items-center justify-start pt-36 md:pt-40 px-4 md:px-8 max-w-6xl mx-auto">

          {/* Header Section */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

              

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 tracking-tight text-white" style={{ fontFamily: "'ClashDisplay-Variable', sans-serif" }}>
                Let's architect <span className="text-transparent bg-clip-text bg-gradient-to-r from-white/10 to-white/5">intelligent</span> systems.
              </h1>

              <p className="text-gray-400 text-sm md:text-base leading-relaxed">
                I help founders and teams build and integrate reliable AI systems into real products.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16 w-full">

            {/* Left Column: Services & AI Closer */}
            <div className="lg:col-span-7 space-y-8">
              <motion.h3 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="text-sm font-mono text-white tracking-widest uppercase mb-4 flex items-center gap-4">
                <span className="h-px bg-white/5 flex-grow max-w-[40px]" />
                Core Capabilities
              </motion.h3>

              <div className="space-y-4">
                {services.map((service, idx) => (
                  <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + idx * 0.1 }}
                    className="p-6 rounded-2xl glass-card border border-white/[0.05] hover:border-white/10 transition-colors duration-300"
                  >
                    <div className="flex gap-4">
                      <div className="mt-1">{service.icon}</div>
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-2">{service.title}</h4>
                        <p className="text-sm text-gray-400 leading-relaxed">{service.desc}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                className="mt-10 p-6 rounded-2xl bg-gradient-to-r from-white/5 to-transparent border border-white/10 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4"
              >
                <div>
                  <h4 className="text-white font-medium mb-1">Not sure where to start?</h4>
                  <p className="text-xs text-gray-400">Ask my AI assistant about how I can fit into your stack.</p>
                </div>
                <button onClick={() => setIsChatOpen(true)} className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/10 transition-all flex items-center gap-2 text-sm font-medium whitespace-nowrap">
                  <FaRobot className="text-white" />
                  Ask the AI
                </button>
              </motion.div>
            </div>

            {/* Right Column: The Filter Form */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-5">
              <div className="p-6 md:p-8 rounded-3xl bg-black/40 backdrop-blur-[20px] border border-white/[0.07] shadow-[0_20px_80px_rgba(0,0,0,0.6)] min-h-[420px] flex flex-col relative">
                <h3 className="text-xl font-semibold mb-6 text-white font-mono">Project Inquiry</h3>

                <AnimatePresence mode="wait">
                  {status === "success" ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="py-6 flex flex-col items-center justify-center text-center flex-grow"
                    >
                      <div className="relative mb-8 mt-4">
                        <div className="absolute inset-0 rounded-full border border-white/10 animate-ping opacity-40" />
                        <div className="absolute inset-[-15px] rounded-full border border-white/10 animate-pulse opacity-30" />
                        <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-white/5 to-transparent flex items-center justify-center border border-white/10 shadow-none backdrop-blur-md">
                          <FaPaperPlane className="text-white text-2xl ml-[-2px] mt-[2px]" />
                        </div>
                      </div>

                      <h4 className="text-2xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-white/10 to-white/5" style={{ fontFamily: "'ClashDisplay-Variable', sans-serif" }}>
                        Transmission Received
                      </h4>
                      <p className="text-sm text-gray-400 leading-relaxed max-w-[260px] mx-auto">
                        I will review your architecture parameters and initialize contact shortly.
                      </p>

                      <button
                        onClick={() => setStatus("idle")}
                        className="mt-8 text-[10px] font-mono text-white/60 hover:text-white tracking-[0.2em] uppercase transition-colors"
                      >
                        [ Send Another ]
                      </button>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      onSubmit={handleSubmit}
                      className="space-y-4 flex-grow"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-1.5">Name</label>
                          <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/10 transition-colors"
                            placeholder="John" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-1.5">Company</label>
                          <input type="text" required
                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/10 transition-colors"
                            placeholder="Google" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-1.5">Email</label>
                        <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                          className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/10 transition-colors"
                          placeholder="you@company.com" />
                      </div>

                      {/* ── CUSTOM DROPDOWN ──────────────────────────────── */}
                      <div className="relative z-20">
                        <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-1.5">Engagement Type</label>

                        {/* Dropdown Trigger */}
                        <div
                          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                          className={`w-full bg-white/[0.03] border ${isDropdownOpen ? 'border-white/10 shadow-none' : 'border-white/10'} rounded-xl px-4 py-2.5 text-sm text-white flex justify-between items-center cursor-pointer hover:border-white/10 transition-all`}
                        >
                          <span>{formData.engagement}</span>
                          <FaChevronDown className={`text-gray-500 text-xs transition-transform duration-300 ${isDropdownOpen ? "rotate-180 text-white" : ""}`} />
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
                                className="absolute top-[calc(100%+8px)] left-0 w-full z-40 bg-[#0a0f18]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden"
                              >
                                {engagementOptions.map((option, idx) => (
                                  <div
                                    key={idx}
                                    onClick={() => {
                                      setFormData({ ...formData, engagement: option });
                                      setIsDropdownOpen(false);
                                    }}
                                    className={`px-4 py-3 text-sm cursor-pointer transition-colors border-b border-white/[0.02] last:border-0 ${
                                      formData.engagement === option
                                        ? 'bg-white/5 text-gray-300'
                                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
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
                        <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-1.5">Scope & Tech Stack</label>
                        <textarea required rows={3} value={formData.scope} onChange={e => setFormData({...formData, scope: e.target.value})}
                          className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/10 transition-colors resize-none relative z-10"
                          placeholder="Tell me about the architecture you want to build..." />
                      </div>

                      <div className="pt-2 relative z-10">
                        <button type="submit" disabled={status === "submitting"}
                          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-white/10 to-white/5 text-white font-medium text-sm hover:shadow-none transition-all flex justify-center items-center gap-2 disabled:opacity-50"
                        >
                          {status === "submitting" ? "Initializing..." : (
                            <>Initialize Collaboration <FaPaperPlane className="text-xs" /></>
                          )}
                        </button>
                        <p className="text-center text-[10px] text-gray-500 mt-3 font-mono">
                          🟢 Usually responds within 24 hours.
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
<footer className="relative z-10 py-8 text-center">
        <p className="font-mono text-gray-600 text-xs tracking-[0.2em] flex items-center justify-center gap-3">
          <span>© 2026 KEVAL_PARMAR</span>
          <span className="w-1 h-1 rounded-full bg-white/5" />
          <span>POWERED_BY_AI</span>
        </p>

        <span className="decal-easter-egg text-[10px] sm:text-xs">
        "to automate and overwrite..."
      </span>
      </footer>
      <style>{`
        
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400;1,600&family=Inter:wght@400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600&display=swap');

        * { box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; }
        .font-mono { font-family: 'Inter', sans-serif; }
        .custom-cursor-wrapper * { cursor: none !important; }

        .glass-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
.decal-easter-egg {
  /* The New Guaranteed Font */
  font-family: 'Dancing Script', cursive;
  letter-spacing: 0.08em; /* Gives it that stamped decal spacing */
  font-size: 1.1rem; /* Bebas runs a little small, so we bump it up a hair */

  /* Etched Liquid Glass Effect */
  color: rgba(255, 255, 255, 0.4);
  mix-blend-mode: overlay;
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.1),
              -1px -1px 1px rgba(255, 255, 255, 0.2);

  cursor: crosshair;
  transition: all 0.4s ease-in-out;
}

.decal-easter-egg:hover {
  /* Reveals the rogue AI energy on hover */
  color: rgba(220, 38, 38, 0.9);
  mix-blend-mode: normal;
  text-shadow: 0 0 12px rgba(220, 38, 38, 0.6);
}
        /* ── Plasma blobs ──────────────────────────────────────────── */
        .plasma {
          display: none !important;
          position: absolute;
          filter: blur(10px);
          opacity: 0.12;
          border-radius: 50%;
          animation: plasma-drift 25s ease-in-out infinite;
          will-change: transform;
        }
        .plasma-cyan   { background: radial-gradient(circle, #d946ef, #0ea5e9); animation-duration: 22s; }
        .plasma-violet { background: radial-gradient(circle, #a855f7, #7c3aed); animation-duration: 28s; animation-direction: reverse; }
        .plasma-indigo { background: radial-gradient(circle, #7c3aed, #4f46e5); animation-duration: 32s; }

        @keyframes plasma-drift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%       { transform: translate(30px, -20px) scale(1.05); }
          66%       { transform: translate(-20px, 30px) scale(0.95); }
        }
      `}</style>
    </motion.div>
  );
}