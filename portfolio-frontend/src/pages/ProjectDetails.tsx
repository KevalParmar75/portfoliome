import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useInView } from "framer-motion";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FaBrain, FaTimes, FaGithub, FaExternalLinkAlt } from "react-icons/fa";
import { FiRefreshCw, FiX, FiChevronLeft, FiChevronRight } from "react-icons/fi";
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

// ─── Static data (defined outside component = zero re-alloc) ──────────────────
const BLOBS = [
  { size: 250, top: "5%",   left: "10%",  color: "plasma-1", delay: 0 },
  { size: 300, top: "60%",  left: "70%",  color: "plasma-2", delay: 2 },
  { size: 200, top: "35%",  left: "40%",  color: "plasma-3", delay: 5 },
  { size: 220, top: "80%",  left: "15%",  color: "plasma-4", delay: 1 },
  { size: 350, top: "-10%", left: "-10%", color: "plasma-2", delay: 4 },
  { size: 380, top: "-5%",  left: "95%",  color: "plasma-3", delay: 7 },
  { size: 420, top: "90%",  left: "90%",  color: "plasma-1", delay: 3 },
  { size: 350, top: "105%", left: "-5%",  color: "plasma-4", delay: 6 },
  { size: 300, top: "45%",  left: "-15%", color: "plasma-1", delay: 8 },
  { size: 350, top: "50%",  left: "105%", color: "plasma-3", delay: 2 },
  { size: 400, top: "-15%", left: "50%",  color: "plasma-2", delay: 5 },
  { size: 380, top: "110%", left: "45%",  color: "plasma-4", delay: 9 },
];

// ─── Plasma Blob (pure CSS — zero JS animation cost) ─────────────────────────
const PlasmaBlob = ({ blob }: { blob: any }) => (
  <div
    className={`plasma ${blob.color}`}
    style={{ width: blob.size, height: blob.size, top: blob.top, left: blob.left, animationDelay: `${blob.delay}s` }}
  />
);

// ─── Animated title (word-by-word slide-up, same as Home) ────────────────────
const AnimatedTitle = ({ text }: { text: string }) => {
  const words = text.split(" ");
  return (
    <h1
      className="text-4xl md:text-5xl lg:text-7xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-yellow-500 bg-clip-text text-transparent leading-tight md:leading-normal py-1 pr-2"
      aria-label={text}
    >
      {words.map((word, wi) => (
        <span key={wi} className="inline-block overflow-hidden mr-[0.25em]">
          <motion.span
            className="inline-block"
            initial={{ y: "110%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.1 + wi * 0.1 }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </h1>
  );
};

// ─── Tech stack item with staggered entrance ─────────────────────────────────
const TechItem = ({ tech, idx }: { tech: string; idx: number }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });

  return (
    <motion.li
      ref={ref}
      initial={{ opacity: 0, x: -16 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: idx * 0.05 }}
      className="flex items-start gap-3 text-gray-300 text-sm md:text-base group"
    >
      <motion.span
        className="text-orange-500 mt-1 text-xs drop-shadow-[0_0_5px_rgba(255,106,0,0.8)]"
        animate={inView ? { scale: [0, 1.4, 1] } : {}}
        transition={{ delay: idx * 0.05 + 0.2, duration: 0.4 }}
      >
        ✦
      </motion.span>
      <span className="leading-relaxed group-hover:text-white transition-colors duration-200">{tech}</span>
    </motion.li>
  );
};

// ─── Action button with magnetic hover ───────────────────────────────────────
const ActionButton = ({
  href, icon, label, primary = false,
}: { href: string; icon: React.ReactNode; label: string; primary?: boolean }) => (
  <motion.a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    whileHover={{ y: -3, scale: 1.03 }}
    whileTap={{ scale: 0.97 }}
    transition={{ type: "spring", stiffness: 350, damping: 20 }}
    className={
      primary
        ? "flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-600/80 to-red-600/80 hover:from-orange-500 hover:to-red-500 border border-white/10 transition-colors duration-300 backdrop-blur-md shadow-[0_0_20px_rgba(255,106,0,0.4)] text-white"
        : "flex items-center gap-2 px-6 py-3 rounded-xl bg-black/40 border border-white/10 hover:border-orange-500/50 hover:bg-white/10 transition-all duration-300 backdrop-blur-md shadow-lg hover:shadow-[0_0_20px_rgba(255,106,0,0.3)] text-gray-300 hover:text-white"
    }
  >
    {icon}
    <span className="font-medium tracking-wide">{label}</span>
  </motion.a>
);

// ─── Carousel ────────────────────────────────────────────────────────────────
const ImageCarousel = ({ images }: { images: NonNullable<Project["images"]> }) => {
  const [idx, setIdx] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  const prev = useCallback(() => setIdx(i => (i === 0 ? images.length - 1 : i - 1)), [images.length]);
  const next = useCallback(() => setIdx(i => (i === images.length - 1 ? 0 : i + 1)), [images.length]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-10 mb-12"
    >
      <motion.h3
        initial={{ opacity: 0, x: -20 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ delay: 0.15, duration: 0.5 }}
        className="text-xl md:text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-6"
      >
        System Architecture & UI
      </motion.h3>

      <div className="relative group rounded-3xl overflow-hidden border border-white/10 bg-black/20 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] transition-all duration-500 hover:border-orange-500/40 hover:shadow-[0_0_50px_rgba(255,106,0,0.2)] aspect-video w-full flex items-center justify-center">

        {/* Counter badge */}
        <div className="absolute top-4 right-4 z-20 px-4 py-1.5 rounded-full bg-black/60 border border-white/10 backdrop-blur-md text-xs md:text-sm font-orbitron text-orange-300 tracking-widest font-bold shadow-lg">
          {idx + 1} / {images.length}
        </div>

        {/* Prev */}
        {images.length > 1 && (
          <motion.button
            onClick={prev}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="absolute left-4 z-20 p-3 rounded-full bg-black/40 border border-white/10 backdrop-blur-xl text-orange-400 hover:text-white hover:border-orange-500 hover:shadow-[0_0_20px_rgba(255,106,0,0.4)] transition-all opacity-0 group-hover:opacity-100"
          >
            <FiChevronLeft size={24} />
          </motion.button>
        )}

        {/* Slide */}
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.97, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.97, x: -20 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 w-full h-full flex items-center justify-center p-2"
          >
            <img
              src={images[idx].image}
              alt={images[idx].caption || `Screenshot ${idx + 1}`}
              className="w-full h-full object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
              loading="lazy"
            />
            {images[idx].caption && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="absolute bottom-12 px-6 py-2 rounded-full bg-black/80 border border-white/10 backdrop-blur-md text-orange-200 text-sm tracking-wide shadow-xl"
              >
                {images[idx].caption}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Next */}
        {images.length > 1 && (
          <motion.button
            onClick={next}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="absolute right-4 z-20 p-3 rounded-full bg-black/40 border border-white/10 backdrop-blur-xl text-orange-400 hover:text-white hover:border-orange-500 hover:shadow-[0_0_20px_rgba(255,106,0,0.4)] transition-all opacity-0 group-hover:opacity-100"
          >
            <FiChevronRight size={24} />
          </motion.button>
        )}

        {/* Dot indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20 bg-black/40 px-3 py-2 rounded-full backdrop-blur-md border border-white/5">
            {images.map((_, i) => (
              <motion.button
                key={i}
                onClick={() => setIdx(i)}
                animate={{ width: i === idx ? 24 : 8, backgroundColor: i === idx ? "#fb923c" : "rgba(255,255,255,0.3)" }}
                transition={{ duration: 0.3 }}
                className="h-2 rounded-full"
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// ─── Loading skeleton ─────────────────────────────────────────────────────────
const LoadingSkeleton = () => (
  <div className="min-h-screen bg-[#0f0f12] text-white flex items-center justify-center">
    <motion.div
      className="flex flex-col items-center gap-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="w-12 h-12 rounded-full border-2 border-orange-500/40 border-t-orange-500"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <p className="text-orange-400/70 font-orbitron text-xs tracking-widest uppercase">Loading</p>
    </motion.div>
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────
export default function ProjectDetails() {
  const { slug } = useParams();
  const navigate  = useNavigate();

  const [project, setProject]                         = useState<Project | null>(null);
  const [showExplanation, setShowExplanation]         = useState(false);
  const [explanationType, setExplanationType]         = useState("technical");
  const [complexity, setComplexity]                   = useState("normal");
  const [explanation, setExplanation]                 = useState("");
  const [typedText, setTypedText]                     = useState("");
  const [loading, setLoading]                         = useState(false);
  const [recommendedProject, setRecommendedProject]   = useState<Project | null>(null);
  const [showRecommendation, setShowRecommendation]   = useState(false);
  const [dismissRecommendation, setDismissRecommendation] = useState(false);

  // Single API call, grab both current + recommended in one shot
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
      if (others.length > 0) {
        setRecommendedProject([...others].sort((a, b) => (b.views || 0) - (a.views || 0))[0]);
      }
    }).catch(console.error);
  }, [slug]);

  // Dwell-time recommendation + view counter ping
  useEffect(() => {
    if (!project) return;
    const t = setTimeout(() => {
      setShowRecommendation(true);
      api.post(`projects/${project.slug}/increment-view/`).catch(() => {});
    }, 8000);
    return () => clearTimeout(t);
  }, [project]);

  // Typing effect — slice original string (no duplicate char bug)
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

  // Scroll lock when modal open
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
      const res = await api.post(`projects/${project.slug}/explain/`, {
        type: explanationType,
        complexity,
      });
      setExplanation(res.data.content);
      setShowExplanation(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [project, explanationType, complexity]);

  if (!project) return <LoadingSkeleton />;

  const techLines = project.tech_stack
    .split(/\n/)
    .map(l => l.trim())
    .filter(Boolean);

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

      {/* Plasma blobs — CSS only, no JS cost */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {BLOBS.map((blob, i) => <PlasmaBlob key={i} blob={blob} />)}
      </div>

      <main className="relative z-10 m-3 sm:m-6 md:m-8 rounded-[2.5rem] bg-black/40 backdrop-blur-[20px] border border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.6),inset_0_0_40px_rgba(255,255,255,0.03)] pb-10 min-h-[calc(100vh-4rem)]">
        <div className="pt-32 md:pt-44 pb-20 md:pb-32 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">

            {/* ── Title ──────────────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="w-fit mb-8 md:mb-12 px-6 py-4 md:px-8 md:py-5 rounded-2xl md:rounded-3xl bg-black/20 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(255,106,0,0.1),inset_0_0_15px_rgba(255,255,255,0.02)]"
            >
              <AnimatedTitle text={project.title} />
            </motion.div>

            {/* ── Main content card ───────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-3xl p-[1px] bg-gradient-to-br from-orange-400/30 via-white/10 to-red-600/30 shadow-[0_10px_40px_rgba(255,106,0,0.15)] relative z-10"
            >
              <div className="rounded-3xl bg-black/40 backdrop-blur-2xl p-6 md:p-12 border border-white/10 shadow-[inset_0_0_30px_rgba(255,255,255,0.03)] relative">

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="text-gray-200 text-base md:text-lg leading-relaxed mb-6 md:mb-8 whitespace-pre-line relative z-10"
                >
                  {project.detailed_description}
                </motion.p>

                {/* Action buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="flex flex-wrap gap-4 mb-10 md:mb-12 relative z-10"
                >
                  {project.github_url && (
                    <ActionButton href={project.github_url} icon={<FaGithub className="text-xl" />} label="View Repository" />
                  )}
                  {project.live_url && (
                    <ActionButton href={project.live_url} icon={<FaExternalLinkAlt className="text-lg" />} label="Live Demo" primary />
                  )}
                </motion.div>

                {/* Tech Stack */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="mb-10 md:mb-12 relative z-10 p-6 rounded-3xl bg-black/40 border border-white/5 backdrop-blur-xl shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]"
                >
                  <motion.h3
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.55, duration: 0.4 }}
                    className="text-xs md:text-sm font-orbitron text-orange-400 uppercase tracking-widest mb-5 font-bold"
                  >
                    Core Architecture
                  </motion.h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                    {techLines.map((tech, i) => (
                      <TechItem key={i} tech={tech} idx={i} />
                    ))}
                  </ul>
                </motion.div>

                {/* Carousel */}
                {project.images && project.images.length > 0 && (
                  <ImageCarousel images={project.images} />
                )}

                {/* AI Controls */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.65, duration: 0.5 }}
                  className="flex flex-col md:flex-row flex-wrap gap-4 md:gap-6 items-start md:items-center relative z-10"
                >
                  {/* Type selector */}
                  <div className="flex w-full md:w-auto overflow-x-auto no-scrollbar bg-white/5 border border-white/10 rounded-2xl p-1 backdrop-blur-xl">
                    {[
                      { label: "Technical", value: "technical" },
                      { label: "Non-Tech",  value: "simple"    },
                      { label: "HR Interview", value: "hr"     },
                    ].map(opt => (
                      <motion.button
                        key={opt.value}
                        onClick={() => setExplanationType(opt.value)}
                        whileTap={{ scale: 0.95 }}
                        className={`px-4 md:px-5 py-2 whitespace-nowrap rounded-xl text-sm transition-all duration-300 ${
                          explanationType === opt.value
                            ? "bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg"
                            : "text-gray-400 hover:text-white"
                        }`}
                      >
                        {opt.label}
                      </motion.button>
                    ))}
                  </div>

                  {/* Complexity selector */}
                  <div className="flex w-full md:w-auto overflow-x-auto no-scrollbar bg-white/5 border border-white/10 rounded-2xl p-1 backdrop-blur-xl">
                    {["basic", "normal", "advanced"].map(level => (
                      <motion.button
                        key={level}
                        onClick={() => setComplexity(level)}
                        whileTap={{ scale: 0.95 }}
                        className={`px-4 md:px-5 py-2 whitespace-nowrap rounded-xl text-sm transition-all duration-300 ${
                          complexity === level
                            ? "bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg"
                            : "text-gray-400 hover:text-white"
                        }`}
                      >
                        {level.toUpperCase()}
                      </motion.button>
                    ))}
                  </div>

                  {/* Explain button */}
                  <motion.button
                    onClick={handleExplain}
                    disabled={loading}
                    whileHover={{ scale: loading ? 1 : 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full md:w-auto px-8 py-3 rounded-2xl bg-gradient-to-r from-orange-600 to-red-600 transition duration-300 shadow-[0_0_20px_rgba(255,106,0,0.4)] text-white font-medium mt-2 md:mt-0 disabled:opacity-60"
                  >
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={loading ? "loading" : "idle"}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-2 justify-center"
                      >
                        {loading && <FiRefreshCw className="animate-spin" />}
                        {loading ? "Thinking..." : "Explain with AI"}
                      </motion.span>
                    </AnimatePresence>
                  </motion.button>
                </motion.div>

              </div>
            </motion.div>
          </div>
        </div>

        {/* ── Recommendation Widget ─────────────────────────────────── */}
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
                  onClick={() => setDismissRecommendation(true)}
                  className="absolute top-2 right-2 text-gray-500 hover:text-white transition p-1"
                >
                  <FaTimes size={10} />
                </button>
                <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-orange-500/20 border border-orange-500/30 shrink-0">
                  <FaBrain className="text-orange-400 text-lg animate-pulse" />
                  <div className="absolute inset-0 rounded-full border border-orange-400/50 animate-ping opacity-20" />
                </div>
                <div
                  className="cursor-pointer group"
                  onClick={() => {
                    setDismissRecommendation(true);
                    setTimeout(() => navigate(`/projects/${recommendedProject.slug}`), 200);
                  }}
                >
                  <p className="text-[10px] md:text-xs text-orange-400 font-orbitron uppercase tracking-widest font-bold mb-0.5 group-hover:text-orange-300 transition">
                    AI Insight
                  </p>
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
          <span className="w-1 h-1 rounded-full bg-orange-500/50" />
          <span>Powered by AI.</span>
        </p>
      </footer>

      {/* ── AI Explanation Modal ──────────────────────────────────────── */}
      <AnimatePresence>
        {showExplanation && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 30 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-4xl max-h-[90vh] md:max-h-[80vh] rounded-3xl p-[1px] bg-gradient-to-br from-orange-400/40 via-white/10 to-red-600/40 shadow-[0_10px_50px_rgba(255,106,0,0.5)] flex flex-col"
            >
              <div className="relative flex flex-col flex-1 bg-[#0f0f12]/90 backdrop-blur-3xl rounded-3xl overflow-hidden border border-white/10 shadow-[inset_0_0_30px_rgba(255,255,255,0.03)]">

                {/* Modal header */}
                <div className="flex items-center justify-between p-6 pb-4 border-b border-white/10 bg-black/40">
                  <motion.h2
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-xl md:text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent truncate pr-4"
                  >
                    AI Explanation
                  </motion.h2>

                  <div className="flex items-center gap-3">
                    <motion.button
                      onClick={handleExplain}
                      disabled={loading}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`flex items-center gap-2 text-sm px-3 md:px-4 py-2 rounded-xl border border-white/20 bg-white/5 backdrop-blur-md hover:bg-white/10 transition ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <FiRefreshCw className={loading ? "animate-spin" : ""} />
                      <span className="hidden sm:inline">Regenerate</span>
                    </motion.button>

                    <motion.button
                      onClick={() => setShowExplanation(false)}
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="text-gray-400 hover:text-white text-2xl transition p-1"
                    >
                      <FiX />
                    </motion.button>
                  </div>
                </div>

                {/* Modal content */}
                <div className="p-6 md:p-10 overflow-y-auto flex-1 ai-scroll">
                  <AnimatePresence mode="wait">
                    {loading ? (
                      <motion.div
                        key="skeleton"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col gap-4 animate-pulse"
                      >
                        <div className="h-6 bg-white/10 rounded w-3/4" />
                        <div className="h-4 bg-white/10 rounded w-full" />
                        <div className="h-4 bg-white/10 rounded w-5/6" />
                        <div className="h-4 bg-white/10 rounded w-4/5" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="content"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="markdown-body text-gray-200 leading-relaxed text-sm md:text-base"
                      >
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {typedText}
                        </ReactMarkdown>
                        {typedText.length < explanation.length && (
                          <motion.span
                            animate={{ opacity: [1, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity }}
                            className="inline-block w-2 h-4 ml-1 bg-orange-400"
                          />
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .font-orbitron { font-family: 'Orbitron', sans-serif; }
        .custom-cursor-wrapper * { cursor: none !important; }

        /* Plasma blobs */
        .plasma {
          position: absolute; filter: blur(2px); opacity: 0.8;
          animation: plasma-morph 20s linear infinite;
          will-change: border-radius, transform;
          contain: layout paint style;
        }
        .plasma-1 { background: radial-gradient(circle, #ff512f, #dd2476); animation-duration: 18s; }
        .plasma-2 { background: radial-gradient(circle, #ff9966, #ff5e62); animation-duration: 24s; animation-direction: reverse; }
        .plasma-3 { background: radial-gradient(circle, #ff8c00, #ff2e63); animation-duration: 28s; }
        .plasma-4 { background: radial-gradient(circle, #f12711, #f5af19); animation-duration: 22s; animation-direction: reverse; }

        @keyframes plasma-morph {
          0%   { rotate: 0deg;   border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
          25%  {                  border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
          50%  { rotate: 180deg; border-radius: 50% 60% 30% 60% / 30% 60% 70% 40%; }
          75%  {                  border-radius: 70% 40% 50% 30% / 60% 40% 60% 50%; }
          100% { rotate: 360deg; border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
        }

        /* Scrollbars */
        .ai-scroll::-webkit-scrollbar { width: 6px; }
        .ai-scroll::-webkit-scrollbar-thumb { background: linear-gradient(#ff6a00, #ff3c3c); border-radius: 10px; }
        .ai-scroll::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        /* Markdown */
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