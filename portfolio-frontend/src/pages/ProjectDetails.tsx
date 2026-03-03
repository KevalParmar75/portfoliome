import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useInView } from "framer-motion";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FaBrain, FaTimes, FaGithub, FaExternalLinkAlt} from "react-icons/fa";
import { FiRefreshCw, FiX, FiChevronLeft, FiChevronRight, FiCode, FiCpu, FiZap } from "react-icons/fi";
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
  views?: number;
  images?: { id: number; image: string; caption?: string }[];
}

const BLOBS = [
  { size: 380, top: "0%",   left: "60%",  color: "plasma-cyan",   delay: 0 },
  { size: 420, top: "50%",  left: "-10%", color: "plasma-violet", delay: 3 },
  { size: 300, top: "80%",  left: "75%",  color: "plasma-cyan",   delay: 7 },
  { size: 350, top: "-5%",  left: "-5%",  color: "plasma-violet", delay: 5 },
  { size: 280, top: "35%",  left: "50%",  color: "plasma-indigo", delay: 2 },
];

const PlasmaBlob = ({ blob }: { blob: any }) => (
  <div
    className={`plasma ${blob.color}`}
    style={{ width: blob.size, height: blob.size, top: blob.top, left: blob.left, animationDelay: `${blob.delay}s` }}
  />
);

// ─── Grid Lines ───────────────────────────────────────────────────────────────
const GridLines = () => (
  <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.025]"
    style={{
      backgroundImage: `linear-gradient(rgba(34,211,238,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.6) 1px, transparent 1px)`,
      backgroundSize: "60px 60px"
    }}
  />
);

// ─── Animated Title ───────────────────────────────────────────────────────────
const AnimatedTitle = ({ text }: { text: string }) => {
  const words = text.split(" ");
  return (
    <h1 className="project-title leading-tight py-1" aria-label={text}>
      {words.map((word, wi) => (
        <span key={wi} className="inline-block overflow-hidden mr-[0.25em]">
          <motion.span
            className="inline-block"
            initial={{ y: "110%", opacity: 0, filter: "blur(6px)" }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 + wi * 0.1 }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </h1>
  );
};

// ─── Tech Item ────────────────────────────────────────────────────────────────
const TechItem = ({ tech, idx }: { tech: string; idx: number }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });

  return (
    <motion.li
      ref={ref}
      initial={{ opacity: 0, x: -12 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: idx * 0.045 }}
      className="flex items-start gap-3 group"
    >
      <span className="text-cyan-400 mt-[3px] text-[10px] shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">▸</span>
      <span className="font-mono text-xs md:text-sm text-gray-400 leading-relaxed group-hover:text-gray-200 transition-colors duration-200">{tech}</span>
    </motion.li>
  );
};

// ─── Action Button ────────────────────────────────────────────────────────────
const ActionButton = ({ href, icon, label, primary = false }: { href: string; icon: React.ReactNode; label: string; primary?: boolean }) => (
  <motion.a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    whileHover={{ y: -2, scale: 1.02 }}
    whileTap={{ scale: 0.97 }}
    transition={{ type: "spring", stiffness: 350, damping: 20 }}
    className={primary ? "action-btn-primary" : "action-btn-secondary"}
  >
    {icon}
    <span className="font-medium text-sm tracking-wide">{label}</span>
  </motion.a>
);

// ─── Carousel ─────────────────────────────────────────────────────────────────
const ImageCarousel = ({ images }: { images: NonNullable<Project["images"]> }) => {
  const [idx, setIdx] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  const prev = useCallback(() => setIdx(i => (i === 0 ? images.length - 1 : i - 1)), [images.length]);
  const next = useCallback(() => setIdx(i => (i === images.length - 1 ? 0 : i + 1)), [images.length]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="mb-8"
    >
      <div className="flex items-center gap-3 mb-5">
        <span className="font-mono text-[10px] text-violet-400/70 tracking-[0.25em] uppercase">visual.overview</span>
        <span className="h-px flex-grow bg-gradient-to-r from-violet-500/30 to-transparent" />
      </div>

      <div className="relative group rounded-2xl overflow-hidden border border-white/[0.07] bg-[#0a0d14] aspect-video w-full flex items-center justify-center transition-all duration-500 hover:border-cyan-400/20 hover:shadow-[0_0_40px_rgba(34,211,238,0.06)]">

        {/* Counter */}
        <div className="absolute top-3 right-3 z-20 px-3 py-1 rounded-full bg-black/70 border border-white/10 backdrop-blur-md font-mono text-[10px] text-cyan-400/80 tracking-widest">
          {String(idx + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
        </div>

        {images.length > 1 && (
          <motion.button onClick={prev} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
            className="absolute left-3 z-20 p-2.5 rounded-xl bg-black/50 border border-white/10 backdrop-blur-xl text-gray-400 hover:text-cyan-400 hover:border-cyan-400/40 transition-all opacity-0 group-hover:opacity-100">
            <FiChevronLeft size={20} />
          </motion.button>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 w-full h-full flex items-center justify-center p-2"
          >
            <img
              src={images[idx].image}
              alt={images[idx].caption || `Screenshot ${idx + 1}`}
              className="w-full h-full object-contain"
              loading="lazy"
            />
            {images[idx].caption && (
              <div className="absolute bottom-10 px-4 py-1.5 rounded-full bg-black/80 border border-white/10 backdrop-blur-md font-mono text-xs text-gray-400">
                {images[idx].caption}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {images.length > 1 && (
          <motion.button onClick={next} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
            className="absolute right-3 z-20 p-2.5 rounded-xl bg-black/50 border border-white/10 backdrop-blur-xl text-gray-400 hover:text-cyan-400 hover:border-cyan-400/40 transition-all opacity-0 group-hover:opacity-100">
            <FiChevronRight size={20} />
          </motion.button>
        )}

        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
            {images.map((_, i) => (
              <motion.button
                key={i}
                onClick={() => setIdx(i)}
                animate={{ width: i === idx ? 20 : 6, backgroundColor: i === idx ? "#22d3ee" : "rgba(255,255,255,0.2)" }}
                transition={{ duration: 0.3 }}
                className="h-1.5 rounded-full"
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
const LoadingSkeleton = () => (
  <div className="min-h-screen bg-[#080b10] text-white flex items-center justify-center">
    <motion.div className="flex flex-col items-center gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <motion.div
        className="w-10 h-10 rounded-full border-2 border-cyan-500/30 border-t-cyan-400"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <p className="font-mono text-[10px] text-cyan-400/60 tracking-[0.25em] uppercase">loading_project</p>
    </motion.div>
  </div>
);

// ─── Selector Tabs ────────────────────────────────────────────────────────────
const SelectorTabs = ({ options, value, onChange }: { options: {label: string; value: string}[]; value: string; onChange: (v: string) => void }) => (
  <div className="flex overflow-x-auto no-scrollbar selector-tabs p-1">
    {options.map(opt => (
      <motion.button
        key={opt.value}
        onClick={() => onChange(opt.value)}
        whileTap={{ scale: 0.96 }}
        className={`selector-tab ${value === opt.value ? "selector-tab-active" : ""}`}
      >
        {opt.label}
      </motion.button>
    ))}
  </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function ProjectDetails() {
  const { slug } = useParams();
  const navigate  = useNavigate();

  const [project, setProject]                           = useState<Project | null>(null);
  const [showExplanation, setShowExplanation]           = useState(false);
  const [explanationType, setExplanationType]           = useState("technical");
  const [complexity, setComplexity]                     = useState("normal");
  const [explanation, setExplanation]                   = useState("");
  const [typedText, setTypedText]                       = useState("");
  const [loading, setLoading]                           = useState(false);
  const [recommendedProject, setRecommendedProject]     = useState<Project | null>(null);
  const [showRecommendation, setShowRecommendation]     = useState(false);
  const [dismissRecommendation, setDismissRecommendation] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setShowRecommendation(false);
    setDismissRecommendation(false);
    setProject(null);

    api.get("projects/").then(res => {
      const all: Project[] = res.data;
      const found = all.find(p => p.slug === slug) ?? null;
      setProject(found);
      const others = all.filter(p => p.slug !== slug);
      if (others.length > 0)
        setRecommendedProject([...others].sort((a, b) => (b.views || 0) - (a.views || 0))[0]);
    }).catch(console.error);
  }, [slug]);

  useEffect(() => {
    if (!project) return;
    const t = setTimeout(() => {
      setShowRecommendation(true);
      api.post(`projects/${project.slug}/increment-view/`).catch(() => {});
    }, 8000);
    return () => clearTimeout(t);
  }, [project]);

  useEffect(() => {
    if (!explanation) return;
    let i = 0;
    setTypedText("");
    const id = setInterval(() => {
      setTypedText(explanation.slice(0, i + 1));
      i++;
      if (i >= explanation.length) clearInterval(id);
    }, 12);
    return () => clearInterval(id);
  }, [explanation]);

  useEffect(() => {
    document.body.style.overflow = showExplanation ? "hidden" : "auto";
    return () => { document.body.style.overflow = "auto"; };
  }, [showExplanation]);

  const handleExplain = useCallback(async () => {
    if (!project) return;
    try {
      setLoading(true);
      setExplanation("");
      setTypedText("");
      const res = await api.post(`projects/${project.slug}/explain/`, { type: explanationType, complexity });
      setExplanation(res.data.content);
      setShowExplanation(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [project, explanationType, complexity]);

  if (!project) return <LoadingSkeleton />;

  const techLines = project.tech_stack.split(/\n/).map(l => l.trim()).filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="relative min-h-screen bg-[#080b10] text-white overflow-hidden custom-cursor-wrapper"
    >
      <LiquidGlassCursor />
      <Navbar />
      <GridLines />

      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {BLOBS.map((blob, i) => <PlasmaBlob key={i} blob={blob} />)}
      </div>

      <main className="relative z-10 m-3 sm:m-4 md:m-6 rounded-[2rem] md:rounded-[2.5rem] bg-black/40 backdrop-blur-[60px] border border-white/[0.07] shadow-[0_20px_80px_rgba(0,0,0,0.6),inset_0_0_40px_rgba(255,255,255,0.02)] pb-10 min-h-[calc(100vh-3rem)]">
        <div className="px-3 sm:px-5 md:px-8 pt-28 md:pt-36 pb-16">
          <div className="max-w-5xl mx-auto">

            {/* ── Back button ───────────────────────────────────────────── */}
            <motion.button
              onClick={() => navigate(-1)}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-2 font-mono text-xs text-gray-500 hover:text-cyan-400 transition-colors duration-200 mb-8 group"
            >
              <FiChevronLeft className="group-hover:-translate-x-0.5 transition-transform duration-200" />
              <span className="tracking-widest uppercase">back_to_projects</span>
            </motion.button>

            {/* ── Header ────────────────────────────────────────────────── */}
            <div className="mb-8 md:mb-12">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="flex items-center gap-2 mb-4"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.9)]" />
                <span className="font-mono text-[10px] text-cyan-400/60 tracking-[0.25em] uppercase">project.details</span>
              </motion.div>

              <AnimatedTitle text={project.title} />

              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="mt-4 text-gray-400 text-sm md:text-base max-w-2xl"
              >
                {project.short_description}
              </motion.p>
            </div>

            {/* ── Action Buttons ─────────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.5 }}
              className="flex flex-wrap gap-3 mb-10 md:mb-14"
            >
              {project.github_url && (
                <ActionButton href={project.github_url} icon={<FaGithub className="text-base" />} label="Repository" />
              )}
              {project.live_url && (
                <ActionButton href={project.live_url} icon={<FaExternalLinkAlt className="text-sm" />} label="Live Demo" primary />
              )}
            </motion.div>

            {/* ── Two-column layout ──────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 md:gap-8 mb-8">

              {/* Left: description + carousel */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="glass-card p-6 md:p-8"
              >
                <div className="flex items-center gap-2 mb-5">
                  <FiCode className="text-cyan-400 text-sm" />
                  <span className="font-mono text-[10px] text-cyan-400/60 tracking-[0.25em] uppercase">project.overview</span>
                </div>
                <p className="text-gray-300 text-sm md:text-[15px] leading-relaxed whitespace-pre-line mb-8">
                  {project.detailed_description}
                </p>
                {project.images && project.images.length > 0 && (
                  <ImageCarousel images={project.images} />
                )}
              </motion.div>

              {/* Right: tech stack */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.32, duration: 0.6 }}
                className="glass-card p-5 md:p-6 h-fit"
              >
                <div className="flex items-center gap-2 mb-5">
                  <FiCpu className="text-violet-400 text-sm" />
                  <span className="font-mono text-[10px] text-violet-400/60 tracking-[0.25em] uppercase">tech.stack</span>
                </div>
                <ul className="space-y-3">
                  {techLines.map((tech, i) => (
                    <TechItem key={i} tech={tech} idx={i} />
                  ))}
                </ul>
              </motion.div>
            </div>

            {/* ── AI Explain Panel ──────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.6 }}
              className="glass-card p-5 md:p-7"
            >
              <div className="flex items-center gap-2 mb-6">
                <FaBrain className="text-cyan-400 text-sm animate-pulse" />
                <span className="font-mono text-[10px] text-cyan-400/60 tracking-[0.25em] uppercase">ai.explainer</span>
              </div>
              <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-start sm:items-center">
                <SelectorTabs
                  value={explanationType}
                  onChange={setExplanationType}
                  options={[
                    { label: "Technical",    value: "technical" },
                    { label: "Non-Tech",     value: "simple" },
                    { label: "HR Recruiter", value: "hr" },
                  ]}
                />
                <SelectorTabs
                  value={complexity}
                  onChange={setComplexity}
                  options={[
                    { label: "Basic",    value: "basic" },
                    { label: "Normal",   value: "normal" },
                    { label: "Advanced", value: "advanced" },
                  ]}
                />
                <motion.button
                  onClick={handleExplain}
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="explain-btn disabled:opacity-50 w-full sm:w-auto"
                >
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={loading ? "loading" : "idle"}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="flex items-center gap-2 justify-center"
                    >
                      {loading ? <FiRefreshCw className="animate-spin text-sm" /> : <FiZap className="text-sm" />}
                      {loading ? "Thinking..." : "Explain with AI"}
                    </motion.span>
                  </AnimatePresence>
                </motion.button>
              </div>
            </motion.div>

          </div>
        </div>
      </main>

      <footer className="relative z-10 py-8 text-center">
        <p className="font-mono text-gray-600 text-xs tracking-[0.2em] flex items-center justify-center gap-3">
          <span>© 2026 KEVAL_PARMAR</span>
          <span className="w-1 h-1 rounded-full bg-cyan-500/40" />
          <span>POWERED_BY_AI</span>
        </p>
      </footer>

      {/* ── Recommendation Widget ──────────────────────────────────────── */}
      <AnimatePresence>
        {showRecommendation && !dismissRecommendation && recommendedProject && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="fixed bottom-5 right-4 md:bottom-8 md:right-8 z-[90] max-w-[260px] md:max-w-xs"
          >
            <div className="insight-widget p-4 relative">
              <button
                onClick={() => setDismissRecommendation(true)}
                className="absolute top-2.5 right-2.5 text-gray-600 hover:text-white transition p-1"
              >
                <FaTimes size={10} />
              </button>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 rounded-md bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                  <FaBrain className="text-cyan-400 text-[10px] animate-pulse" />
                </div>
                <span className="font-mono text-[9px] text-cyan-400 tracking-[0.2em] uppercase">up_next</span>
              </div>
              <div
                className="cursor-pointer group"
                onClick={() => { setDismissRecommendation(true); setTimeout(() => navigate(`/projects/${recommendedProject.slug}`), 200); }}
              >
                <p className="text-xs text-gray-400 mb-1">Trending project</p>
                <p className="text-sm text-white font-medium group-hover:text-cyan-200 transition">{recommendedProject.title} <span className="text-cyan-400">↗</span></p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── AI Explanation Modal ───────────────────────────────────────── */}
      <AnimatePresence>
        {showExplanation && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/70 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, y: 60, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 60, scale: 0.96 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="modal-container w-full sm:max-w-4xl sm:max-h-[80vh] max-h-[90vh] flex flex-col"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-5 md:px-8 py-4 border-b border-white/[0.07] shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                    <FaBrain className="text-cyan-400 text-xs" />
                  </div>
                  <div>
                    <p className="font-mono text-[9px] text-cyan-400/60 tracking-[0.2em] uppercase">ai.explanation</p>
                    <p className="text-sm font-semibold text-white">{project.title}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <motion.button
                    onClick={handleExplain}
                    disabled={loading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-1.5 font-mono text-xs px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition disabled:opacity-40"
                  >
                    <FiRefreshCw className={`text-xs ${loading ? "animate-spin" : ""}`} />
                    <span className="hidden sm:inline">regenerate</span>
                  </motion.button>

                  <motion.button
                    onClick={() => setShowExplanation(false)}
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="text-gray-500 hover:text-white transition p-1"
                  >
                    <FiX size={18} />
                  </motion.button>
                </div>
              </div>

              {/* Modal body */}
              <div className="p-5 md:p-8 overflow-y-auto flex-1 ai-scroll">
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.div key="skel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="flex flex-col gap-3 animate-pulse">
                      <div className="h-5 bg-white/[0.06] rounded-lg w-3/4" />
                      <div className="h-4 bg-white/[0.06] rounded-lg w-full" />
                      <div className="h-4 bg-white/[0.06] rounded-lg w-5/6" />
                      <div className="h-4 bg-white/[0.06] rounded-lg w-4/5" />
                      <div className="h-4 bg-white/[0.06] rounded-lg w-full" />
                    </motion.div>
                  ) : (
                    <motion.div key="content" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35 }}
                      className="markdown-body text-gray-300 leading-relaxed text-sm md:text-[15px]">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{typedText}</ReactMarkdown>
                      {typedText.length < explanation.length && (
                        <motion.span
                          animate={{ opacity: [1, 0] }}
                          transition={{ duration: 0.5, repeat: Infinity }}
                          className="inline-block w-[2px] h-[1em] ml-1 bg-cyan-400 align-middle"
                        />
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&family=Syne:wght@400;500;600;700;800&display=swap');
        @import url('https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&display=swap');

        * { box-sizing: border-box; }
        body { font-family: 'Syne', sans-serif; }
        .font-mono { font-family: 'Space Mono', monospace; }
        .custom-cursor-wrapper * { cursor: none !important; }

        /* ── Project title ──────────────────────────────────────── */
        .project-title {
          font-family: 'ClashDisplay-Variable', 'Clash Display', 'Syne', 'Segoe UI', system-ui, sans-serif;
          font-weight: 900;
          font-size: clamp(2rem, 6vw, 4.5rem);
          letter-spacing: -0.03em;
          color: #ffffff;
          text-shadow: 0 0 50px rgba(34,211,238,0.3), 0 0 100px rgba(129,140,248,0.15);
        }

        /* ── Glass card ─────────────────────────────────────────── */
        .glass-card {
          border-radius: 1.25rem;
          background: rgba(13, 18, 28, 0.75);
          backdrop-filter: blur(30px);
          -webkit-backdrop-filter: blur(30px);
          border: 1px solid rgba(255,255,255,0.06);
          transition: border-color 0.3s ease;
        }
        .glass-card:hover { border-color: rgba(34,211,238,0.1); }

        /* ── Action buttons ──────────────────────────────────────── */
        .action-btn-secondary {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.625rem 1.25rem; border-radius: 0.75rem;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.7);
          font-size: 0.875rem; transition: all 0.25s ease;
          backdrop-filter: blur(10px);
        }
        .action-btn-secondary:hover {
          border-color: rgba(34,211,238,0.4); color: white;
          box-shadow: 0 0 16px rgba(34,211,238,0.1);
        }
        .action-btn-primary {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.625rem 1.25rem; border-radius: 0.75rem;
          background: linear-gradient(135deg, rgba(34,211,238,0.85), rgba(99,102,241,0.85));
          color: white; font-size: 0.875rem;
          transition: box-shadow 0.25s ease;
        }
        .action-btn-primary:hover { box-shadow: 0 0 24px rgba(34,211,238,0.35); }

        /* ── Selector tabs ───────────────────────────────────────── */
        .selector-tabs {
          display: flex;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 0.75rem;
        }
        .selector-tab {
          padding: 0.5rem 0.875rem;
          border-radius: 0.625rem;
          font-family: 'Space Mono', monospace;
          font-size: 0.7rem;
          white-space: nowrap;
          color: rgba(156,163,175,1);
          transition: all 0.2s ease;
          letter-spacing: 0.03em;
        }
        .selector-tab:hover { color: white; }
        .selector-tab-active {
          background: linear-gradient(135deg, rgba(34,211,238,0.2), rgba(99,102,241,0.2));
          border: 1px solid rgba(34,211,238,0.3);
          color: #22d3ee;
        }

        /* ── Explain button ──────────────────────────────────────── */
        .explain-btn {
          display: inline-flex; align-items: center; justify-content: center;
          gap: 0.5rem;
          padding: 0.625rem 1.5rem; border-radius: 0.75rem;
          background: linear-gradient(135deg, rgba(34,211,238,0.9), rgba(99,102,241,0.9));
          color: white; font-size: 0.875rem; font-weight: 600;
          transition: box-shadow 0.25s ease;
          border: none;
        }
        .explain-btn:hover { box-shadow: 0 0 24px rgba(34,211,238,0.4); }

        /* ── Modal ───────────────────────────────────────────────── */
        .modal-container {
          border-radius: 1.5rem 1.5rem 0 0;
          background: rgba(9, 13, 20, 0.95);
          backdrop-filter: blur(40px);
          border: 1px solid rgba(34,211,238,0.12);
          box-shadow: 0 -8px 40px rgba(0,0,0,0.6);
          overflow: hidden;
        }
        @media (min-width: 640px) {
          .modal-container {
            border-radius: 1.5rem;
            box-shadow: 0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(34,211,238,0.08);
          }
        }

        /* ── Scrollbars ───────────────────────────────────────────── */
        .ai-scroll::-webkit-scrollbar { width: 4px; }
        .ai-scroll::-webkit-scrollbar-thumb { background: rgba(34,211,238,0.3); border-radius: 10px; }
        .ai-scroll::-webkit-scrollbar-track { background: transparent; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        /* ── Markdown ─────────────────────────────────────────────── */
        .markdown-body h1, .markdown-body h2, .markdown-body h3 {
          margin-top: 1.5rem; margin-bottom: 0.75rem;
          font-family: 'ClashDisplay-Variable', 'Clash Display', 'Syne', 'Segoe UI', system-ui, sans-serif;
          font-weight: 800; color: #e2e8f0;
        }
        .markdown-body h3 { color: #22d3ee; font-size: 1rem; }
        .markdown-body p { margin-bottom: 0.875rem; }
        .markdown-body ul { padding-left: 1.25rem; list-style: none; margin-bottom: 0.875rem; }
        .markdown-body ul li::before { content: "▸ "; color: #22d3ee; font-size: 0.75em; }
        .markdown-body li { margin-bottom: 0.4rem; }
        .markdown-body strong { color: #e2e8f0; font-weight: 700; }
        .markdown-body code {
          font-family: 'Space Mono', monospace;
          background: rgba(34,211,238,0.07);
          border: 1px solid rgba(34,211,238,0.15);
          padding: 0.15rem 0.4rem; border-radius: 0.35rem;
          color: #22d3ee; font-size: 0.85em; word-break: break-all;
        }
        .markdown-body pre {
          background: rgba(0,0,0,0.4);
          border: 1px solid rgba(255,255,255,0.06);
          padding: 1rem; border-radius: 0.875rem;
          overflow-x: auto; max-width: 100%;
          margin-bottom: 1rem;
        }
        .markdown-body pre code { background: none; border: none; color: #94a3b8; }

        /* ── Plasma blobs ─────────────────────────────────────────── */
        .plasma {
          position: absolute; filter: blur(80px); opacity: 0.12;
          border-radius: 50%;
          animation: plasma-drift 25s ease-in-out infinite;
          will-change: transform;
        }
        .plasma-cyan   { background: radial-gradient(circle, #22d3ee, #0ea5e9); animation-duration: 22s; }
        .plasma-violet { background: radial-gradient(circle, #818cf8, #6366f1); animation-duration: 28s; animation-direction: reverse; }
        .plasma-indigo { background: radial-gradient(circle, #6366f1, #4f46e5); animation-duration: 32s; }

        @keyframes plasma-drift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%       { transform: translate(30px, -20px) scale(1.05); }
          66%       { transform: translate(-20px, 30px) scale(0.95); }
        }
      `}</style>
    </motion.div>
  );
}