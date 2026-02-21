import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // 🔥 Added useNavigate
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence} from "framer-motion";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FaBrain, FaTimes } from "react-icons/fa";
import { FiRefreshCw, FiX } from "react-icons/fi";
import LiquidGlassCursor from "../components/LiquidGlassCursor";

interface Project {
  id: number;
  title: string;
  slug: string;
  short_description: string;
  detailed_description: string;
  tech_stack: string;
  github_url?: string;
  live_url?: string;
  views?: number; // 🔥 Added views from the database
}

// ⚡ GPU-Accelerated Blob Component
const PlasmaBlob = ({ blob, springX, springY }: { blob: any, springX: any, springY: any }) => {
  const x = useTransform(springX, (val: number) => val * blob.factor);
  const y = useTransform(springY, (val: number) => val * blob.factor);

  return (
    <motion.div
      className={`plasma ${blob.color}`}
      style={{
        width: blob.size, height: blob.size,
        top: blob.top, left: blob.left,
        animationDelay: `${blob.delay}s`,
        x, y
      }}
    />
  );
};

export default function ProjectDetails() {
  const { slug } = useParams();
  const navigate = useNavigate(); // 🔥 Initialized navigate
  const [project, setProject] = useState<Project | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [explanationType, setExplanationType] = useState("technical");
  const [complexity, setComplexity] = useState("normal");
  const [explanation, setExplanation] = useState("");
  const [typedText, setTypedText] = useState("");
  const [loading, setLoading] = useState(false);

  // ⚡ Parallax Motion Values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 40, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 40, damping: 30 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX - window.innerWidth / 2);
      mouseY.set(e.clientY - window.innerHeight / 2);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  // 🎯 AI Recommendation State
  const [recommendedProject, setRecommendedProject] = useState<Project | null>(null);
  const [showRecommendation, setShowRecommendation] = useState(false);
  const [dismissRecommendation, setDismissRecommendation] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setShowRecommendation(false);
    setDismissRecommendation(false);

    api.get("projects/")
      .then(res => {
        const allProjects = res.data;
        const found = allProjects.find((p: Project) => p.slug === slug);
        setProject(found);

        // 🔥 DATABASE-DRIVEN RECOMMENDATION:
        const otherProjects = allProjects.filter((p: Project) => p.slug !== slug);
        if (otherProjects.length > 0) {
          // Sort by highest views from the database!
          const trendingProject = otherProjects.sort((a: Project, b: Project) => (b.views || 0) - (a.views || 0))[0];
          setRecommendedProject(trendingProject);
        }
      })
      .catch(err => console.error(err));
  }, [slug]);

  // 🧠 AI Dwell-Time Tracker & Database Ping
  useEffect(() => {
    if (!project) return;

    const timer = setTimeout(() => {
      setShowRecommendation(true);

      // 🔥 Tell the backend that someone actually read this project!
      api.post(`projects/${project.slug}/increment-view/`).catch(err => console.log("Analytics ping failed", err));

    }, 8000);

    return () => clearTimeout(timer);
  }, [project, slug]);

  useEffect(() => {
    if (!explanation) return;
    let index = 0;
    setTypedText("");
    const interval = setInterval(() => {
      setTypedText(prev => prev + explanation[index]);
      index++;
      if (index >= explanation.length) clearInterval(interval);
    }, 8);
    return () => clearInterval(interval);
  }, [explanation]);

  const handleExplain = async () => {
    if (!project) return;
    try {
      setLoading(true);
      setExplanation("");
      setTypedText("");
      const res = await api.post(`projects/${project.slug}/explain/`, {
        type: explanationType,
        complexity: complexity
      });
      setExplanation(res.data.content);
      setShowExplanation(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-[#0f0f12] text-white flex items-center justify-center text-orange-400 animate-pulse">
        Loading...
      </div>
    );
  }

  return (
   <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="relative min-h-screen bg-[#0f0f12] text-white overflow-hidden custom-cursor-wrapper"
    >
      <LiquidGlassCursor />
      <Navbar />

      {/* ---------------- PLASMA LAMP BLOBS ---------------- */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {[
          { size: 250, top: "5%", left: "10%", color: "plasma-1", factor: 0.06, delay: 0 },
          { size: 300, top: "60%", left: "70%", color: "plasma-2", factor: -0.04, delay: 2 },
          { size: 200, top: "35%", left: "40%", color: "plasma-3", factor: 0.09, delay: 5 },
          { size: 220, top: "80%", left: "15%", color: "plasma-4", factor: -0.07, delay: 1 },
          { size: 350, top: "-10%", left: "-10%", color: "plasma-2", factor: 0.05, delay: 4 },
          { size: 380, top: "-5%", left: "95%", color: "plasma-3", factor: -0.03, delay: 7 },
          { size: 420, top: "90%", left: "90%", color: "plasma-1", factor: 0.08, delay: 3 },
          { size: 350, top: "105%", left: "-5%", color: "plasma-4", factor: -0.05, delay: 6 },
          { size: 300, top: "45%", left: "-15%", color: "plasma-1", factor: 0.07, delay: 8 },
          { size: 350, top: "50%", left: "105%", color: "plasma-3", factor: -0.06, delay: 2 },
          { size: 400, top: "-15%", left: "50%", color: "plasma-2", factor: 0.04, delay: 5 },
          { size: 380, top: "110%", left: "45%", color: "plasma-4", factor: -0.04, delay: 9 },
        ].map((blob, idx) => (
          <PlasmaBlob key={idx} blob={blob} springX={springX} springY={springY} />
        ))}
      </div>

      <main className="relative z-10 m-3 sm:m-6 md:m-8 rounded-[2.5rem] bg-black/40 backdrop-blur-[30px] border border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.6),inset_0_0_40px_rgba(255,255,255,0.03)] pb-10 min-h-[calc(100vh-4rem)]">
        <div className="pt-32 md:pt-44 pb-20 md:pb-32 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">

            {/* TITLE - Soft Glass Rectangle */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-fit mb-8 md:mb-12 px-6 py-4 md:px-8 md:py-5 rounded-2xl md:rounded-3xl bg-black/20 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(255,106,0,0.1),inset_0_0_15px_rgba(255,255,255,0.02)]"
            >
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-yellow-500 bg-clip-text text-transparent leading-tight md:leading-normal py-1 pr-2">
                {project.title}
              </h1>
            </motion.div>

            {/* MAIN CONTENT CARD */}
            <div className="rounded-3xl p-[1px] bg-gradient-to-br from-orange-400/40 via-white/10 to-red-600/40 shadow-[0_10px_40px_rgba(255,106,0,0.15)] relative z-10">
              <div className="rounded-3xl bg-black/70 backdrop-blur-3xl p-6 md:p-12 border border-white/10 shadow-[inset_0_0_30px_rgba(255,255,255,0.03)] relative">

                <p className="text-gray-200 text-base md:text-lg leading-relaxed mb-6 md:mb-8 whitespace-pre-line relative z-10">
                  {project.detailed_description}
                </p>

                <div className="text-orange-400 text-sm mb-10 md:mb-12 relative z-10 uppercase tracking-widest font-semibold">
                  {project.tech_stack}
                </div>

                {/* CONTROLS */}
                <div className="flex flex-col md:flex-row flex-wrap gap-4 md:gap-6 items-start md:items-center relative z-10">
                  <div className="flex w-full md:w-auto overflow-x-auto no-scrollbar bg-white/5 border border-white/10 shadow-[inset_0_0_10px_rgba(255,255,255,0.02)] rounded-2xl p-1 backdrop-blur-xl">
                    {[
                      { label: "Technical", value: "technical" },
                      { label: "Non-Tech", value: "simple" },
                      { label: "HR Interview", value: "hr" }
                    ].map(option => (
                      <button
                        key={option.value}
                        onClick={() => setExplanationType(option.value)}
                        className={`px-4 md:px-5 py-2 whitespace-nowrap rounded-xl text-sm transition-all duration-300 ${
                          explanationType === option.value
                            ? "bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg"
                            : "text-gray-400 hover:text-white"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex w-full md:w-auto overflow-x-auto no-scrollbar bg-white/5 border border-white/10 shadow-[inset_0_0_10px_rgba(255,255,255,0.02)] rounded-2xl p-1 backdrop-blur-xl">
                    {["basic", "normal", "advanced"].map(level => (
                      <button
                        key={level}
                        onClick={() => setComplexity(level)}
                        className={`px-4 md:px-5 py-2 whitespace-nowrap rounded-xl text-sm transition-all duration-300 ${
                          complexity === level
                            ? "bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg"
                            : "text-gray-400 hover:text-white"
                        }`}
                      >
                        {level.toUpperCase()}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleExplain}
                    className="w-full md:w-auto px-8 py-3 rounded-2xl bg-gradient-to-r from-orange-600 to-red-600 hover:scale-105 transition duration-300 shadow-[0_0_20px_rgba(255,106,0,0.4)] text-white font-medium mt-2 md:mt-0"
                  >
                    {loading ? "Thinking..." : "Explain with AI"}
                  </button>
                </div>
              </div>
            </div>

            {/* AI EXPLANATION CARD */}
            {showExplanation && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md">
                <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="relative w-full max-w-4xl max-h-[90vh] md:max-h-[80vh] rounded-3xl p-[1px] bg-gradient-to-br from-orange-400/40 via-white/10 to-red-600/40 shadow-[0_10px_50px_rgba(255,106,0,0.3)] flex flex-col"
              >
                <div className="relative flex flex-col flex-1 bg-[#0f0f12]/40 backdrop-blur-3xl rounded-3xl overflow-hidden border border-white/10 shadow-[inset_0_0_30px_rgba(255,255,255,0.03)]">

                  <div className="flex items-center justify-between p-6 pb-4 border-b border-white/10 relative z-10 bg-black/20">
                    <h2 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent truncate pr-4">
                      AI Explanation
                    </h2>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleExplain}
                        disabled={loading}
                        className={`flex items-center gap-2 text-sm px-3 md:px-4 py-2 rounded-xl border border-white/20 bg-white/5 backdrop-blur-md hover:bg-white/10 transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <FiRefreshCw className={loading ? "animate-spin" : ""} />
                        <span className="hidden sm:inline">Regenerate</span>
                      </button>

                      <button
                        onClick={() => setShowExplanation(false)}
                        className="text-gray-400 hover:text-white text-2xl transition p-1"
                      >
                        <FiX />
                      </button>
                    </div>
                  </div>

                  <div className="p-6 md:p-10 overflow-y-auto flex-1 ai-scroll">
                    {loading ? (
                      <div className="flex flex-col gap-4 animate-pulse">
                        <div className="h-6 bg-white/10 rounded w-3/4"></div>
                        <div className="h-4 bg-white/10 rounded w-full"></div>
                        <div className="h-4 bg-white/10 rounded w-5/6"></div>
                      </div>
                    ) : (
                      <div className="markdown-body text-gray-200 leading-relaxed text-sm md:text-base">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {explanation}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
              </div>
            )}

          </div>
        </div>

        {/* 🧠 AI INSIGHT FLOATING WIDGET (DATABASE-DRIVEN ROUTING) */}
        <AnimatePresence>
          {showRecommendation && !dismissRecommendation && recommendedProject && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9, filter: "blur(10px)" }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[90] p-[1px] rounded-2xl bg-gradient-to-br from-orange-400/40 via-white/10 to-red-600/40 shadow-[0_10px_40px_rgba(255,106,0,0.3)]"
            >
              <div className="flex items-center gap-4 bg-black/80 backdrop-blur-3xl border border-white/10 p-4 rounded-2xl relative pr-10">

                <button
                  onClick={(e) => { e.stopPropagation(); setDismissRecommendation(true); }}
                  className="absolute top-2 right-2 text-gray-500 hover:text-white transition p-1"
                >
                  <FaTimes size={10} />
                </button>

                <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-orange-500/20 border border-orange-500/30">
                  <FaBrain className="text-orange-400 text-lg animate-pulse" />
                  <div className="absolute inset-0 rounded-full border border-orange-400/50 animate-ping opacity-20"></div>
                </div>

                <div
                  className="cursor-pointer group"
                  onClick={() => {
                    setDismissRecommendation(true);
                    setTimeout(() => {
                      navigate(`/projects/${recommendedProject.slug}`);
                    }, 200);
                  }}
                >
                  <p className="text-[10px] md:text-xs text-orange-400 font-orbitron uppercase tracking-widest font-bold mb-0.5 group-hover:text-orange-300 transition">
                    AI Insight
                  </p>
                  {/* 🔥 Changed text to reflect database popularity! */}
                  <p className="text-sm md:text-base text-gray-300 font-medium group-hover:text-white transition">
                    🔥 Trending Next: <span className="text-white capitalize font-bold">{recommendedProject.title}</span>
                  </p>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="relative z-10 py-10 text-center w-full">
        <p className="text-gray-500 text-sm tracking-wider flex items-center justify-center gap-2">
          <span>© 2026 Keval Parmar.</span>
          <span className="w-1 h-1 rounded-full bg-orange-500/50"></span>
          <span>Powered by AI.</span>
        </p>
      </footer>

      <style>{`
        .custom-cursor-wrapper * { cursor: none !important; }
        .plasma { position: absolute; filter: blur(2px); opacity: 0.8; animation: plasma-morph 20s linear infinite; will-change: border-radius, rotate, transform; }
        .plasma-1 { background: radial-gradient(circle, #ff512f, #dd2476); animation-duration: 18s; }
        .plasma-2 { background: radial-gradient(circle, #ff9966, #ff5e62); animation-duration: 24s; animation-direction: reverse; }
        .plasma-3 { background: radial-gradient(circle, #ff8c00, #ff2e63); animation-duration: 28s; }
        .plasma-4 { background: radial-gradient(circle, #f12711, #f5af19); animation-duration: 22s; animation-direction: reverse; }
        @keyframes plasma-morph {
          0% { rotate: 0deg; border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
          25% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
          50% { rotate: 180deg; border-radius: 50% 60% 30% 60% / 30% 60% 70% 40%; }
          75% { border-radius: 70% 40% 50% 30% / 60% 40% 60% 50%; }
          100% { rotate: 360deg; border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
        }
        .ai-scroll::-webkit-scrollbar { width: 6px; }
        .ai-scroll::-webkit-scrollbar-thumb { background: linear-gradient(#ff6a00, #ff3c3c); border-radius: 10px; }
        .ai-scroll::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .markdown-body h1, .markdown-body h2, .markdown-body h3 { margin-top: 1.5rem; margin-bottom: 1rem; font-weight: 600; color: #fb923c; }
        .markdown-body p { margin-bottom: 1rem; }
        .markdown-body ul { padding-left: 1.5rem; list-style: disc; margin-bottom: 1rem; }
        .markdown-body li { margin-bottom: 0.5rem; }
        .markdown-body strong { color: #ffb347; font-weight: 600; }
        .markdown-body code { background: rgba(255,255,255,0.08); padding: 0.2rem 0.4rem; border-radius: 0.4rem; color: #ffb347; word-break: break-all; }
        .markdown-body pre { background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.05); padding: 1rem; border-radius: 1rem; overflow-x: auto; max-width: 100%; }
      `}</style>
    </motion.div>
  );
}