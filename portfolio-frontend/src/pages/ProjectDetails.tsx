import { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useInView, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FaBrain, FaTimes, FaGithub, FaExternalLinkAlt} from "react-icons/fa";
import { FiRefreshCw, FiX, FiChevronLeft, FiChevronRight, FiZap, FiMaximize2, FiArrowUpRight } from "react-icons/fi";
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

const EASE = [0.22, 1, 0.36, 1] as const;

// ─── Film Grain ───────────────────────────────────────────────────────────────
const Grain = () => (
  <div
    className="pointer-events-none fixed inset-0 z-[80] opacity-[0.05] mix-blend-overlay"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
    }}
  />
);

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

// ─── Scroll-linked word-by-word reveal ────────────────────────────────────────
const ScrollWord = ({ word, progress, range }: { word: string; progress: MotionValue<number>; range: [number, number] }) => {
  const opacity = useTransform(progress, range, [0.12, 1]);
  const y = useTransform(progress, range, [6, 0]);
  return (
    <motion.span style={{ opacity, y }} className="inline-block mr-[0.3em] will-change-transform">
      {word}
    </motion.span>
  );
};

const ScrollText = ({ text }: { text: string }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.5"] });
  const paragraphs = text.split(/\n+/).map(p => p.trim()).filter(Boolean);
  const total = paragraphs.reduce((n, p) => n + p.split(/\s+/).length, 0);
  let cursor = 0;

  return (
    <div ref={ref} className="space-y-5">
      {paragraphs.map((para, pi) => {
        const words = para.split(/\s+/);
        const start = cursor;
        cursor += words.length;
        return (
          <p key={pi} className="text-[#c3d2c7] font-light text-base md:text-lg leading-relaxed">
            {words.map((w, wi) => {
              const i = start + wi;
              return (
                <ScrollWord
                  key={wi}
                  word={w}
                  progress={scrollYProgress}
                  range={[i / total, Math.min(1, (i + 1.5) / total)]}
                />
              );
            })}
          </p>
        );
      })}
    </div>
  );
};

// ─── Animated Title ───────────────────────────────────────────────────────────
const AnimatedTitle = ({ text }: { text: string }) => {
  const words = text.split(" ");
  return (
    <h1 className="display-title leading-tight py-1" aria-label={text}>
      {words.map((word, wi) => (
        <span key={wi} className="inline-block overflow-hidden mr-[0.25em] align-bottom pb-[0.08em] -mb-[0.08em]">
          <motion.span
            className="inline-block will-change-transform"
            initial={{ y: "110%", rotate: 4, opacity: 0 }}
            animate={{ y: 0, rotate: 0, opacity: 1 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.1 + wi * 0.08 }}
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
      transition={{ duration: 0.4, ease: EASE, delay: idx * 0.045 }}
      className="flex items-start gap-3 group"
    >
      <span className="text-[#9db4a4] mt-[3px] text-[10px] shrink-0 transition-opacity">▸</span>
      <span className="font-mono text-xs md:text-sm text-[#a9baae] leading-relaxed group-hover:text-white transition-colors duration-200">{tech}</span>
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
    <span className="font-mono text-xs tracking-[0.1em] uppercase">{label}</span>
  </motion.a>
);

// ─── Carousel ─────────────────────────────────────────────────────────────────
const ImageCarousel = ({ images }: { images: NonNullable<Project["images"]> }) => {
  const [idx, setIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  const prev = useCallback(() => setIdx(i => (i === 0 ? images.length - 1 : i - 1)), [images.length]);
  const next = useCallback(() => setIdx(i => (i === images.length - 1 ? 0 : i + 1)), [images.length]);

  useEffect(() => {
    if (!lightboxOpen) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", onKey);
    };
  }, [lightboxOpen, prev, next]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: EASE }}
      className="mb-8"
    >
      <div className="flex items-center gap-4 mb-6">
        <span className="font-mono text-[10px] md:text-[11px] tracking-[0.35em] uppercase text-[#9db4a4]">
          visual.overview
        </span>
        <span className="h-px flex-1 max-w-[180px] bg-gradient-to-r from-[#9db4a4]/40 to-transparent origin-left" />
      </div>

      <div className="relative group rounded-2xl overflow-hidden border border-white/[0.06] bg-[#060a08]/50 aspect-video w-full flex items-center justify-center transition-all duration-500 hover:border-white/10 hover:shadow-none">
        
        {/* Counter */}
        <div className="absolute top-3 right-3 z-20 px-3 py-1 rounded-full bg-[#060a08]/70 border border-white/10 backdrop-blur-md font-mono text-[10px] text-[#cfe3d4] tracking-widest">
          {String(idx + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
        </div>

        {images.length > 1 && (
          <motion.button onClick={prev} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
            className="absolute left-3 z-20 p-2.5 rounded-xl bg-[#060a08]/50 border border-white/10 backdrop-blur-xl text-[#9db4a4] hover:text-[#cfe3d4] hover:border-white/10 transition-all opacity-0 group-hover:opacity-100">
            <FiChevronLeft size={20} />
          </motion.button>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="absolute inset-0 w-full h-full flex items-center justify-center p-2"
          >
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              className="relative w-full h-full flex items-center justify-center cursor-zoom-in"
              aria-label="View image full screen"
            >
              <img
                src={images[idx].image}
                alt={images[idx].caption || `Screenshot ${idx + 1}`}
                className="w-full h-full object-contain"
                loading="lazy"
              />
              <span className="absolute bottom-2 right-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity p-2 rounded-lg bg-[#060a08]/60 border border-white/10 text-[#cfe3d4]">
                <FiMaximize2 size={14} />
              </span>
            </button>
            {images[idx].caption && (
              <div className="absolute bottom-10 px-4 py-1.5 rounded-full bg-[#060a08]/80 border border-white/10 backdrop-blur-md font-mono text-xs text-[#9db4a4]">
                {images[idx].caption}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {images.length > 1 && (
          <motion.button onClick={next} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
            className="absolute right-3 z-20 p-2.5 rounded-xl bg-[#060a08]/50 border border-white/10 backdrop-blur-xl text-[#9db4a4] hover:text-[#cfe3d4] hover:border-white/10 transition-all opacity-0 group-hover:opacity-100">
            <FiChevronRight size={20} />
          </motion.button>
        )}

        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
            {images.map((_, i) => (
              <motion.button
                key={i}
                onClick={() => setIdx(i)}
                animate={{ width: i === idx ? 20 : 6, backgroundColor: i === idx ? "#cfe3d4" : "rgba(157, 180, 164, 0.3)" }}
                transition={{ duration: 0.3 }}
                className="h-1.5 rounded-full"
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Fullscreen Lightbox ────────────────────────────────────── */}
      {createPortal(
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[110] bg-[#060a08]/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8"
            onClick={() => setLightboxOpen(false)}
          >
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setLightboxOpen(false); }}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 z-[120] p-2.5 rounded-xl bg-white/5 border border-white/10 text-[#9db4a4] hover:text-[#cfe3d4] active:scale-95 transition"
              aria-label="Close full screen image"
            >
              <FiX size={22} />
            </button>

            <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-[120] px-3 py-1 rounded-full bg-[#060a08]/70 border border-white/10 backdrop-blur-md font-mono text-[10px] text-[#cfe3d4] tracking-widest">
              {String(idx + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
            </div>

            {images.length > 1 && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-2 sm:left-6 z-[120] p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xl text-[#9db4a4] hover:text-[#cfe3d4] active:scale-95 transition"
                aria-label="Previous image"
              >
                <FiChevronLeft size={24} />
              </button>
            )}

            <motion.img
              key={idx}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25 }}
              src={images[idx].image}
              alt={images[idx].caption || `Screenshot ${idx + 1}`}
              onClick={(e) => e.stopPropagation()}
              className="max-w-full max-h-full object-contain rounded-lg select-none"
            />

            {images.length > 1 && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-2 sm:right-6 z-[120] p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xl text-[#9db4a4] hover:text-[#cfe3d4] active:scale-95 transition"
                aria-label="Next image"
              >
                <FiChevronRight size={24} />
              </button>
            )}

            {images[idx].caption && (
              <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-[#060a08]/80 border border-white/10 backdrop-blur-md font-mono text-xs text-[#9db4a4] max-w-[85%] text-center">
                {images[idx].caption}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
      )}
    </motion.div>
  );
};

// ─── Meta chip ────────────────────────────────────────────────────────────────
const MetaChip = ({ children }: { children: React.ReactNode }) => (
  <span className="px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-md font-mono text-[10px] tracking-[0.2em] uppercase text-[#b9cec0]">
    {children}
  </span>
);

// ─── Parallax hero (photo shows through from body bg) ────────────────────────
const ProjectHero = ({ project, techCount, onBack }: { project: Project; techCount: number; onBack: () => void }) => {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);
  const scrimOpacity = useTransform(scrollYProgress, [0, 1], [0.55, 0.9]);

  return (
    <section ref={ref} className="relative pt-28 md:pt-44 pb-24 md:pb-32 overflow-hidden">
      <motion.div style={{ opacity: scrimOpacity }} className="absolute inset-0 bg-[#060a08] pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-b from-transparent to-[#060a08] pointer-events-none" />

      <motion.div style={{ y, opacity }} className="relative z-10 max-w-6xl mx-auto px-6 md:px-10 will-change-transform">
        <motion.button
          onClick={onBack}
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-2 font-mono text-xs text-[#8fa697] hover:text-[#e9efe9] transition-colors duration-200 mb-10 md:mb-14 group"
        >
          <FiChevronLeft className="group-hover:-translate-x-0.5 transition-transform duration-200" />
          <span className="tracking-[0.2em] uppercase">back_to_projects</span>
        </motion.button>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-4 mb-6"
        >
          <span className="font-mono text-[10px] md:text-[11px] tracking-[0.35em] uppercase text-[#9db4a4]">
            project.details
          </span>
          <span className="h-px flex-1 max-w-[180px] bg-gradient-to-r from-[#9db4a4]/40 to-transparent origin-left" />
        </motion.div>

        <AnimatedTitle text={project.title} />

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-6 md:mt-8 text-[#a9baae] text-sm md:text-lg max-w-2xl font-light leading-relaxed"
        >
          {project.short_description}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex flex-wrap gap-2.5 mt-8"
        >
          {typeof project.views === "number" && <MetaChip>{project.views} views</MetaChip>}
          {project.images && project.images.length > 0 && <MetaChip>{project.images.length} visuals</MetaChip>}
          <MetaChip>{techCount} technologies</MetaChip>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="flex flex-wrap gap-3 mt-10"
        >
          {project.github_url && (
            <ActionButton href={project.github_url} icon={<FaGithub className="text-base" />} label="Repository" />
          )}
          {project.live_url && (
            <ActionButton href={project.live_url} icon={<FaExternalLinkAlt className="text-sm" />} label="Live Demo" primary />
          )}
        </motion.div>
      </motion.div>
    </section>
  );
};

// ─── Up Next ──────────────────────────────────────────────────────────────────
const UpNext = ({ project, onOpen }: { project: Project; onOpen: () => void }) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const ghostY = useTransform(scrollYProgress, [0, 1], [50, -50]);

  return (
    <section className="relative z-10 bg-[#060a08] border-t border-white/[0.06]">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 32 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: EASE }}
        onClick={onOpen}
        className="group relative max-w-6xl mx-auto px-6 md:px-10 py-20 md:py-28 cursor-pointer overflow-hidden"
      >
        <motion.span
          style={{ y: ghostY }}
          className="absolute right-2 md:right-10 top-1/2 -translate-y-1/2 font-serif italic text-[7rem] md:text-[10rem] leading-none text-white/[0.03] select-none pointer-events-none"
        >
          next
        </motion.span>

        <span className="font-mono text-[10px] md:text-[11px] tracking-[0.35em] uppercase text-[#9db4a4]">
          up.next
        </span>

        <div className="relative flex items-center justify-between gap-6 mt-5">
          <div className="min-w-0">
            <h2 className="font-serif italic text-3xl md:text-6xl text-[#e9efe9] leading-tight transition-transform duration-500 group-hover:translate-x-2 md:group-hover:translate-x-4">
              {project.title}
            </h2>
            <p className="mt-4 text-sm md:text-base text-[#94a89a] font-light leading-relaxed max-w-xl transition-transform duration-500 group-hover:translate-x-2 md:group-hover:translate-x-4">
              {project.short_description}
            </p>
          </div>
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border border-white/10 flex items-center justify-center shrink-0 transition-all duration-500 group-hover:border-[#cfe3d4]/50 group-hover:bg-[#cfe3d4]/10 group-hover:rotate-45">
            <FiArrowUpRight className="text-lg md:text-2xl text-[#9db4a4] group-hover:text-[#e9efe9] transition-colors duration-300" />
          </div>
        </div>
      </motion.div>
    </section>
  );
};

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
const LoadingSkeleton = () => (
  <div className="min-h-screen bg-[#060a08] text-white flex items-center justify-center">
    <motion.div className="flex flex-col items-center gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <motion.div
        className="w-10 h-10 rounded-full border-2 border-[#cfe3d4]/10 border-t-[#cfe3d4]/50"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <p className="font-mono text-[10px] text-[#8fa697] tracking-[0.3em] uppercase">loading_project</p>
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
      className="relative min-h-screen text-[#e9efe9] custom-cursor-wrapper"
    >
      <LiquidGlassCursor />
      <Navbar />
      <ScrollProgress />
      <Grain />

      {/* ── Parallax hero ──────────────────────────────────────────── */}
      <ProjectHero project={project} techCount={techLines.length} onBack={() => navigate(-1)} />

      <main className="relative z-10 bg-[#060a08] pb-20">
        <div className="px-6 md:px-10 max-w-6xl mx-auto pt-4 md:pt-8">

          {/* ── Two-column layout ──────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 md:gap-16 mb-12">

            {/* Left: description + carousel */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <div className="flex items-center gap-4 mb-6">
                <span className="font-mono text-[10px] md:text-[11px] tracking-[0.35em] uppercase text-[#9db4a4]">
                  project.overview
                </span>
                <span className="h-px flex-1 max-w-[180px] bg-gradient-to-r from-[#9db4a4]/40 to-transparent origin-left" />
              </div>
              <div className="mb-12">
                <ScrollText text={project.detailed_description} />
              </div>
              {project.images && project.images.length > 0 && (
                <ImageCarousel images={project.images} />
              )}
            </motion.div>

            {/* Right: tech stack */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.32, duration: 0.6 }}
              className="lg:sticky lg:top-32 h-fit"
            >
              <div className="flex items-center gap-4 mb-6">
                <span className="font-mono text-[10px] md:text-[11px] tracking-[0.35em] uppercase text-[#9db4a4]">
                  tech.stack
                </span>
                <span className="h-px flex-1 max-w-[100px] bg-gradient-to-r from-[#9db4a4]/40 to-transparent origin-left" />
              </div>
              <ul className="space-y-4 py-4 border-l border-white/[0.06] pl-6">
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
            className="border border-white/[0.06] bg-white/[0.02] rounded-2xl p-6 md:p-10 mt-16 md:mt-24"
          >
            <div className="flex items-center gap-3 mb-8">
              <FaBrain className="text-[#cfe3d4] text-sm animate-pulse" />
              <span className="font-mono text-[10px] md:text-[11px] tracking-[0.3em] uppercase text-[#8fa697]">
                ai.explainer
              </span>
            </div>
            <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-start sm:items-center">
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
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="explain-btn disabled:opacity-50 w-full sm:w-auto mt-4 sm:mt-0"
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
                    {loading ? "Initializing..." : "Explain with AI"}
                  </motion.span>
                </AnimatePresence>
              </motion.button>
            </div>
          </motion.div>

        </div>
      </main>

      {/* ── Up Next ────────────────────────────────────────────────────── */}
      {recommendedProject && (
        <UpNext
          project={recommendedProject}
          onOpen={() => navigate(`/projects/${recommendedProject.slug}`)}
        />
      )}

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
            <div className="border border-white/[0.06] bg-[#060a08]/90 backdrop-blur-xl p-4 md:p-5 rounded-2xl relative shadow-2xl shadow-black">
              <button
                onClick={() => setDismissRecommendation(true)}
                className="absolute top-2.5 right-2.5 text-[#6d8276] hover:text-[#e9efe9] transition p-1"
              >
                <FaTimes size={10} />
              </button>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                  <FaBrain className="text-[#cfe3d4] text-[10px] animate-pulse" />
                </div>
                <span className="font-mono text-[9px] text-[#b9cec0] tracking-[0.2em] uppercase">up_next</span>
              </div>
              <div
                className="cursor-pointer group mt-2 pt-2 border-t border-white/[0.05]"
                onClick={() => { setDismissRecommendation(true); setTimeout(() => navigate(`/projects/${recommendedProject.slug}`), 200); }}
              >
                <p className="text-xs text-[#8fa697] mb-1">Trending project</p>
                <p className="text-sm text-[#e9efe9] font-medium group-hover:text-white transition">{recommendedProject.title} <span className="text-[#cfe3d4] opacity-0 group-hover:opacity-100 transition-opacity">↗</span></p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── AI Explanation Modal ───────────────────────────────────────── */}
      <AnimatePresence>
        {showExplanation && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-[#060a08]/80 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, y: 60, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 60, scale: 0.96 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="modal-container w-full sm:max-w-4xl sm:max-h-[80vh] max-h-[90vh] flex flex-col border border-white/[0.08] bg-[#060a08]"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-5 md:px-8 py-4 border-b border-white/[0.06] shrink-0 bg-white/[0.02]">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg bg-[#cfe3d4]/10 border border-[#cfe3d4]/20 flex items-center justify-center">
                    <FaBrain className="text-[#cfe3d4] text-xs" />
                  </div>
                  <div>
                    <p className="font-mono text-[9px] text-[#8fa697] tracking-[0.3em] uppercase mb-0.5">ai.explanation</p>
                    <p className="text-sm font-medium text-[#e9efe9] font-serif italic">{project.title}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <motion.button
                    onClick={handleExplain}
                    disabled={loading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 font-mono text-[10px] px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] text-[#9db4a4] hover:text-[#e9efe9] transition disabled:opacity-40 tracking-widest uppercase"
                  >
                    <FiRefreshCw className={`text-[10px] ${loading ? "animate-spin" : ""}`} />
                    <span className="hidden sm:inline">regenerate</span>
                  </motion.button>

                  <motion.button
                    onClick={() => setShowExplanation(false)}
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="text-[#6d8276] hover:text-[#e9efe9] transition p-1"
                  >
                    <FiX size={18} />
                  </motion.button>
                </div>
              </div>

              {/* Modal body */}
              <div className="p-6 md:p-10 overflow-y-auto flex-1 ai-scroll">
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.div key="skel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="flex flex-col gap-4 animate-pulse max-w-3xl">
                      <div className="h-5 bg-white/[0.04] rounded w-3/4" />
                      <div className="h-4 bg-white/[0.04] rounded w-full" />
                      <div className="h-4 bg-white/[0.04] rounded w-5/6" />
                      <div className="h-4 bg-white/[0.04] rounded w-4/5" />
                      <div className="h-4 bg-white/[0.04] rounded w-full" />
                    </motion.div>
                  ) : (
                    <motion.div key="content" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35 }}
                      className="markdown-body text-[#a9baae] font-light leading-relaxed text-sm md:text-base max-w-3xl">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{typedText}</ReactMarkdown>
                      {typedText.length < explanation.length && (
                        <motion.span
                          animate={{ opacity: [1, 0] }}
                          transition={{ duration: 0.5, repeat: Infinity }}
                          className="inline-block w-[2px] h-[1em] ml-1 bg-[#cfe3d4] align-middle"
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

        /* ── Action buttons ──────────────────────────────────────── */
        .action-btn-secondary {
          display: inline-flex; align-items: center; gap: 0.75rem;
          padding: 0.625rem 1.5rem; border-radius: 9999px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          color: #9db4a4;
          font-size: 0.75rem; transition: all 0.25s ease;
        }
        .action-btn-secondary:hover {
          border-color: rgba(207,227,212,0.3); color: #e9efe9;
          background: rgba(207,227,212,0.05);
        }
        .action-btn-primary {
          display: inline-flex; align-items: center; gap: 0.75rem;
          padding: 0.625rem 1.5rem; border-radius: 9999px;
          background: rgba(207,227,212,0.1);
          border: 1px solid rgba(207,227,212,0.2);
          color: #e9efe9; font-size: 0.75rem;
          transition: all 0.25s ease;
        }
        .action-btn-primary:hover { 
          background: rgba(207,227,212,0.15);
          border-color: rgba(207,227,212,0.4);
        }

        /* ── Selector tabs ───────────────────────────────────────── */
        .selector-tabs {
          display: flex;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 9999px;
        }
        .selector-tab {
          padding: 0.5rem 1rem;
          border-radius: 9999px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.65rem;
          text-transform: uppercase;
          white-space: nowrap;
          color: #7d9284;
          transition: all 0.2s ease;
          letter-spacing: 0.1em;
        }
        .selector-tab:hover { color: #e9efe9; }
        .selector-tab-active {
          background: rgba(207,227,212,0.1);
          border: 1px solid rgba(207,227,212,0.15);
          color: #e9efe9;
        }

        /* ── Explain button ──────────────────────────────────────── */
        .explain-btn {
          display: inline-flex; align-items: center; justify-content: center;
          gap: 0.75rem;
          padding: 0.625rem 1.5rem; border-radius: 9999px;
          background: rgba(207,227,212,0.1);
          border: 1px solid rgba(207,227,212,0.2);
          color: #e9efe9; font-size: 0.75rem; font-family: 'JetBrains Mono', monospace;
          text-transform: uppercase; letter-spacing: 0.1em;
          transition: all 0.25s ease;
        }
        .explain-btn:hover { 
          background: rgba(207,227,212,0.15);
          border-color: rgba(207,227,212,0.4);
        }

        /* ── Modal ───────────────────────────────────────────────── */
        .modal-container {
          border-radius: 1.5rem 1.5rem 0 0;
          overflow: hidden;
        }
        @media (min-width: 640px) {
          .modal-container {
            border-radius: 1.5rem;
            box-shadow: 0 24px 80px rgba(0,0,0,0.8);
          }
        }

        /* ── Scrollbars ───────────────────────────────────────────── */
        .ai-scroll::-webkit-scrollbar { width: 4px; }
        .ai-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .ai-scroll::-webkit-scrollbar-track { background: transparent; }
        
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