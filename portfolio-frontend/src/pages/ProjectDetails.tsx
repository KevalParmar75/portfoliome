import { lazy, Suspense, useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  motion,
  AnimatePresence,
  useInView,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import NotFound from "./NotFound";
import {
  buildProjectMetadata,
  getProjectHomeTeaser,
  getProjectScreenshotAlt,
  getRelatedProjects,
  optimizeCloudinaryImage,
  PAGE_SEO,
  setPageMetadata,
} from "../seo";
import {
  getSnapshotProjectBySlug,
  portfolioSnapshot,
} from "../data/portfolioSnapshot";
import type { Project as BaseProject } from "../types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FaBrain, FaTimes, FaGithub, FaExternalLinkAlt } from "react-icons/fa";
import {
  FiRefreshCw,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiZap,
  FiMaximize2,
  FiArrowUpRight,
} from "react-icons/fi";
import { LiquidGlassCard, LiquidLensFilter } from "../components/LiquidGlass";
import { useCardLensMap } from "../hooks/useLensMap";

const LiquidGlassCursor = lazy(() => import("../components/LiquidGlassCursor"));
const AsciiKoiCanvas = lazy(() => import("../components/AsciiKoiCanvas"));

type Project = BaseProject & {
  detailed_description: string;
  tech_stack: string;
};

const EASE = [0.22, 1, 0.36, 1] as const;


/* ── Liquid Glass Section Divider (Refractive Tube + Center Crystal Node) ──── */
const LiquidSectionDivider = ({ label }: { label?: string }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });

  return (
    <div
      ref={ref}
      className="relative max-w-6xl mx-auto px-6 md:px-10 py-8 md:py-12 flex items-center justify-center gap-4 select-none"
    >
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={inView ? { scaleX: 1, opacity: 1 } : {}}
        transition={{ duration: 1.1, ease: EASE }}
        className="liquid-divider-line flex-1 origin-right"
      />
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={inView ? { scale: 1, opacity: 1 } : {}}
        transition={{ duration: 0.6, ease: EASE, delay: 0.25 }}
        className="liquid-divider-pill px-3.5 py-1 rounded-full flex items-center gap-2 shrink-0"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-vermilion shadow-[0_0_8px_#E98259]" />
        {label && (
          <span className="font-mono text-[9px] tracking-[0.28em] uppercase text-ivory-soft/90">
            {label}
          </span>
        )}
      </motion.div>
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={inView ? { scaleX: 1, opacity: 1 } : {}}
        transition={{ duration: 1.1, ease: EASE }}
        className="liquid-divider-line flex-1 origin-left"
      />
    </div>
  );
};

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
      className="fixed top-0 left-0 right-0 h-[2px] z-[96] origin-left bg-gradient-to-r from-transparent via-vermilion/70 to-vermilion/30"
      style={{ scaleX }}
    />
  );
};

// ─── Clean, Crisp Project Description (No Scroll-to-Reveal Dimming) ──────────
const DescriptionText = ({ text }: { text: string }) => {
  const paragraphs = text
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className="space-y-5">
      {paragraphs.map((para, pi) => (
        <motion.p
          key={pi}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.15 + pi * 0.08 }}
          className="text-ivory font-light text-base md:text-lg leading-relaxed drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)]"
        >
          {para}
        </motion.p>
      ))}
    </div>
  );
};

// ─── Animated Title ───────────────────────────────────────────────────────────
const AnimatedTitle = ({ text }: { text: string }) => {
  const words = text.split(" ");
  return (
    <h1
      className="display-title leading-tight py-1 drop-shadow-[0_4px_24px_rgba(0,0,0,0.75)]"
      aria-label={text}
    >
      {words.map((word, wi) => (
        <span
          key={wi}
          className="inline-block overflow-hidden mr-[0.25em] align-bottom pb-[0.08em] -mb-[0.08em]"
        >
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
      <span className="text-vermilion mt-[3px] text-[10px] shrink-0 transition-opacity">▸</span>
      <span className="font-mono text-xs md:text-sm text-ivory-soft leading-relaxed group-hover:text-ivory transition-colors duration-200 drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)]">
        {tech}
      </span>
    </motion.li>
  );
};

// ─── Action Button ────────────────────────────────────────────────────────────
const ActionButton = ({
  href,
  icon,
  label,
  primary = false,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  primary?: boolean;
}) => (
  <motion.a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    whileHover={{ y: -2, scale: 1.02 }}
    whileTap={{ scale: 0.97 }}
    transition={{ type: "spring", stiffness: 350, damping: 20 }}
    className={primary ? "liquid-pill-primary" : "liquid-pill-secondary"}
  >
    <span className="text-vermilion">{icon}</span>
    <span className="font-mono text-xs tracking-[0.1em] uppercase text-ivory">{label}</span>
  </motion.a>
);

// ─── Carousel inside Liquid Glass ─────────────────────────────────────────────
const ImageCarousel = ({
  project,
  images,
}: {
  project: Project;
  images: NonNullable<Project["images"]>;
}) => {
  const [idx, setIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  const prev = useCallback(
    () => setIdx((i) => (i === 0 ? images.length - 1 : i - 1)),
    [images.length]
  );
  const next = useCallback(
    () => setIdx((i) => (i === images.length - 1 ? 0 : i + 1)),
    [images.length]
  );

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
      <div className="flex items-center gap-4 mb-5">
        <h2 className="font-mono text-[10px] md:text-[11px] tracking-[0.35em] uppercase text-vermilion">
          Visual Overview
        </h2>
        <span className="liquid-divider-line flex-1 max-w-[160px]" />
      </div>

      <LiquidGlassCard borderRadius={26} zoom={0.9} className="p-3 sm:p-4">
        <div className="relative group rounded-2xl overflow-hidden bg-[#000000]/55 border border-white/[0.08] aspect-video w-full flex items-center justify-center">
          {/* Counter */}
          <div className="absolute top-3 right-3 z-20 px-3 py-1 rounded-full bg-[#000000]/75 border border-white/12 backdrop-blur-md font-mono text-[10px] text-vermilion tracking-widest">
            {String(idx + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
          </div>

          {images.length > 1 && (
            <motion.button
              onClick={prev}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              className="liquid-icon-box absolute left-3 z-20 p-2.5 rounded-xl text-ivory-soft hover:text-ivory transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
            >
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
                  src={optimizeCloudinaryImage(images[idx].image, 1280)}
                  alt={getProjectScreenshotAlt(project, idx, images[idx].caption)}
                  width={1280}
                  height={720}
                  className="w-full h-full object-contain rounded-lg"
                  loading={idx === 0 ? "eager" : "lazy"}
                  fetchPriority={idx === 0 ? "high" : "auto"}
                />
                <span className="liquid-icon-box absolute bottom-2 right-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity p-2 rounded-lg text-vermilion">
                  <FiMaximize2 size={14} />
                </span>
              </button>
              {images[idx].caption && (
                <div className="absolute bottom-10 px-4 py-1.5 rounded-full bg-[#000000]/85 border border-white/12 backdrop-blur-md font-mono text-xs text-ivory">
                  {images[idx].caption}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {images.length > 1 && (
            <motion.button
              onClick={next}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              className="liquid-icon-box absolute right-3 z-20 p-2.5 rounded-xl text-ivory-soft hover:text-ivory transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
            >
              <FiChevronRight size={20} />
            </motion.button>
          )}

          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
              {images.map((_, i) => (
                <motion.button
                  key={i}
                  onClick={() => setIdx(i)}
                  animate={{
                    width: i === idx ? 20 : 6,
                    backgroundColor:
                      i === idx ? "#E98259" : "rgba(242, 239, 230, 0.28)",
                  }}
                  transition={{ duration: 0.3 }}
                  className="h-1.5 rounded-full cursor-pointer"
                />
              ))}
            </div>
          )}
        </div>
      </LiquidGlassCard>

      {/* ── Fullscreen Lightbox ────────────────────────────────────── */}
      {isMounted &&
        createPortal(
        <AnimatePresence>
          {lightboxOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-[110] bg-[#000000]/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8"
              onClick={() => setLightboxOpen(false)}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxOpen(false);
                }}
                className="liquid-icon-box absolute top-4 right-4 sm:top-6 sm:right-6 z-[120] p-2.5 rounded-xl text-ivory-soft hover:text-ivory active:scale-95 transition cursor-pointer"
                aria-label="Close full screen image"
              >
                <FiX size={22} />
              </button>

              <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-[120] px-3.5 py-1.5 rounded-full bg-[#000000]/80 border border-white/12 backdrop-blur-md font-mono text-[10px] text-vermilion tracking-widest">
                {String(idx + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
              </div>

              {images.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    prev();
                  }}
                  className="liquid-icon-box absolute left-2 sm:left-6 z-[120] p-3 rounded-xl text-ivory-soft hover:text-ivory active:scale-95 transition cursor-pointer"
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
                src={optimizeCloudinaryImage(images[idx].image, 1600)}
                alt={getProjectScreenshotAlt(project, idx, images[idx].caption)}
                width={1600}
                height={900}
                onClick={(e) => e.stopPropagation()}
                className="max-w-full max-h-full object-contain rounded-xl select-none shadow-[0_24px_80px_rgba(0,0,0,0.85)]"
              />

              {images.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    next();
                  }}
                  className="liquid-icon-box absolute right-2 sm:right-6 z-[120] p-3 rounded-xl text-ivory-soft hover:text-ivory active:scale-95 transition cursor-pointer"
                  aria-label="Next image"
                >
                  <FiChevronRight size={24} />
                </button>
              )}

              {images[idx].caption && (
                <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-[#000000]/85 border border-white/12 backdrop-blur-md font-mono text-xs text-ivory max-w-[85%] text-center">
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
  <span className="liquid-chip px-4 py-1.5 rounded-full font-mono text-[10px] tracking-[0.2em] uppercase text-ivory-soft">
    {children}
  </span>
);

// ─── Parallax hero (Transparent so Koi Pond Shines Through) ───────────────────
const ProjectHero = ({
  project,
  techCount,
}: {
  project: Project;
  techCount: number;
}) => {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

  return (
    <section ref={ref} className="relative pt-28 md:pt-40 pb-12 md:pb-20 overflow-hidden">
      <motion.div
        style={{ y, opacity }}
        className="relative z-10 max-w-6xl mx-auto px-6 md:px-10 will-change-transform"
      >
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-wrap items-center gap-3 mb-10 md:mb-12"
        >
          <Link
            to="/"
            className="liquid-pill-secondary inline-flex items-center gap-2 px-4 py-2 rounded-full font-mono text-[11px] text-ivory-soft hover:text-ivory transition-all group"
          >
            <FiChevronLeft className="text-vermilion group-hover:-translate-x-0.5 transition-transform duration-200" />
            <span className="tracking-[0.2em] uppercase">Keval Parmar Portfolio</span>
          </Link>
          <Link
            to="/freelance"
            className="liquid-pill-secondary inline-flex items-center gap-2 px-4 py-2 rounded-full font-mono text-[11px] text-ivory-soft hover:text-ivory transition-all group"
          >
            <span className="tracking-[0.2em] uppercase">Freelance AI Services</span>
            <FiArrowUpRight className="text-vermilion group-hover:translate-x-0.5 transition-transform duration-200" />
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-4 mb-5"
        >
          <span className="font-mono text-[10px] md:text-[11px] tracking-[0.35em] uppercase text-vermilion">
            project.details
          </span>
          <span className="liquid-divider-line flex-1 max-w-[160px]" />
        </motion.div>

        <AnimatedTitle text={project.title} />

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-6 md:mt-8 text-ivory-soft text-sm md:text-lg max-w-2xl font-light leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]"
        >
          {project.short_description}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex flex-wrap gap-2.5 mt-7"
        >
          {typeof project.views === "number" && <MetaChip>{project.views} views</MetaChip>}
          {project.images && project.images.length > 0 && (
            <MetaChip>{project.images.length} visuals</MetaChip>
          )}
          <MetaChip>{techCount} technologies</MetaChip>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex flex-wrap gap-3.5 mt-9"
        >
          {project.github_url && (
            <ActionButton
              href={project.github_url}
              icon={<FaGithub className="text-base" />}
              label="Repository"
            />
          )}
          {project.live_url && (
            <ActionButton
              href={project.live_url}
              icon={<FaExternalLinkAlt className="text-xs" />}
              label="Live Demo"
              primary
            />
          )}
        </motion.div>
      </motion.div>
    </section>
  );
};

// ─── Related Projects (Refractive Liquid Glass Cards) ─────────────────────────
const RelatedProjects = ({ projects }: { projects: BaseProject[] }) => {
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.25 });

  return (
    <section className="relative z-10 max-w-6xl mx-auto px-6 md:px-10 pb-20 md:pb-28">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: EASE }}
      >
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-vermilion shadow-[0_0_8px_#E98259]" />
            <h2 className="font-mono text-[10px] md:text-[11px] tracking-[0.35em] uppercase text-vermilion">
              Related Projects
            </h2>
          </div>
          <div className="flex flex-wrap gap-4 text-xs font-mono">
            <Link
              to="/"
              className="text-ivory-soft hover:text-vermilion underline decoration-white/20 underline-offset-4 transition-colors"
            >
              All portfolio projects
            </Link>
            <Link
              to="/freelance"
              className="text-ivory-soft hover:text-vermilion underline decoration-white/20 underline-offset-4 transition-colors"
            >
              Hire for AI development
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {projects.map((rel) => (
            <LiquidGlassCard
              key={rel.slug}
              borderRadius={26}
              zoom={0.88}
              onClick={() => navigate(`/projects/${rel.slug}`)}
              className="group p-7 sm:p-9 cursor-pointer transition-transform duration-500 hover:-translate-y-1"
            >
              <div className="relative flex items-start justify-between gap-5">
                <div className="min-w-0">
                  <h3 className="font-serif italic text-2xl md:text-3xl text-ivory leading-tight transition-transform duration-500 group-hover:translate-x-1.5 drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]">
                    <Link
                      to={`/projects/${rel.slug}`}
                      onClick={(e) => e.stopPropagation()}
                      className="hover:text-ivory focus:outline-none"
                    >
                      {rel.title}
                    </Link>
                  </h3>
                  <p className="mt-3 text-sm text-ivory-soft font-light leading-relaxed drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)]">
                    {getProjectHomeTeaser(rel)}
                  </p>
                </div>
                <div className="liquid-icon-box w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 group-hover:border-vermilion/50 group-hover:bg-vermilion/15 group-hover:rotate-45">
                  <FiArrowUpRight className="text-base text-vermilion group-hover:text-ivory transition-colors duration-300" />
                </div>
              </div>
            </LiquidGlassCard>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
const LoadingSkeleton = () => (
  <div className="min-h-screen bg-[#000000] text-ivory flex items-center justify-center">
    <motion.div
      className="flex flex-col items-center gap-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="w-10 h-10 rounded-full border-2 border-vermilion/15 border-t-[#E98259]"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <p className="font-mono text-[10px] text-ivory-faint tracking-[0.3em] uppercase">
        loading_project
      </p>
    </motion.div>
  </div>
);

// ─── Selector Tabs ────────────────────────────────────────────────────────────
const SelectorTabs = ({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: string }[];
  value: string;
  onChange: (v: string) => void;
}) => (
  <div className="flex overflow-x-auto no-scrollbar selector-tabs p-1">
    {options.map((opt) => (
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
  const navigate = useNavigate();
  const lensMapUrl = useCardLensMap();

  const [project, setProject] = useState<Project | null>(
    () => getSnapshotProjectBySlug(slug) as Project | null
  );
  const [allProjects, setAllProjects] = useState<BaseProject[]>(() => portfolioSnapshot.projects);
  const [notFound, setNotFound] = useState(false);
  const [showEffects, setShowEffects] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [explanationType, setExplanationType] = useState("technical");
  const [complexity, setComplexity] = useState("normal");
  const [explanation, setExplanation] = useState("");
  const [typedText, setTypedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRecommendation, setShowRecommendation] = useState(false);
  const [dismissRecommendation, setDismissRecommendation] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setShowEffects(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const snapshotMatch = getSnapshotProjectBySlug(slug) as Project | null;
    const label = slug?.split("-").map((part) => part[0]?.toUpperCase() + part.slice(1)).join(" ") ?? "Project";
    setPageMetadata(
      snapshotMatch
        ? buildProjectMetadata(snapshotMatch)
        : {
            ...PAGE_SEO.projectIndex,
            title: `${label} | Keval Parmar`,
            path: `/projects/${slug ?? ""}`,
            type: "article",
          }
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
    setShowRecommendation(false);
    setDismissRecommendation(false);
    setProject(snapshotMatch);
    setAllProjects(portfolioSnapshot.projects);
    setNotFound(false);

    api
      .get("projects/")
      .then((res) => {
        if (cancelled) return;
        const all: Project[] = res.data;
        const found = all.find((p) => p.slug === slug) ?? null;
        setAllProjects(all);
        setProject(found);
        setNotFound(!found);
      })
      .catch(() => {
        if (!cancelled && !snapshotMatch) setNotFound(true);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    if (!project) return;
    setPageMetadata(buildProjectMetadata(project));
  }, [project]);

  useEffect(() => {
    if (!project) return;
    const t = setTimeout(() => {
      setShowRecommendation(true);
      api.post(`projects/${project.slug}/increment-view/`).catch(() => { });
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
    return () => {
      document.body.style.overflow = "auto";
    };
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

  if (notFound) return <NotFound />;
  if (!project) return <LoadingSkeleton />;

  const relatedProjects = getRelatedProjects(project.slug, allProjects);
  const recommendedProject = relatedProjects[0] ?? null;

  const techLines = project.tech_stack
    .split(/\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="relative min-h-screen bg-[#000000] text-ivory overflow-x-hidden custom-cursor-wrapper"
    >
      {/* ── Shared SVG Optical Refraction Filter ── */}
      <LiquidLensFilter id="project-liquid-glass" mapUrl={lensMapUrl} />

      {showEffects && (
        <Suspense fallback={null}>
          <LiquidGlassCursor />
          <AsciiKoiCanvas />
        </Suspense>
      )}

      {/* Ambient gradient glow in center water */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_50%_30%,rgba(233,130,89,0.05)_0%,transparent_70%)]" />

      <Navbar />
      <ScrollProgress />
      <Grain />

      {/* ── Parallax hero ──────────────────────────────────────────── */}
      <ProjectHero project={project} techCount={techLines.length} />

      <LiquidSectionDivider label="01 · ARCHITECTURE & OVERVIEW" />

      <main className="relative z-10 pb-12">
        <div className="px-6 md:px-10 max-w-6xl mx-auto">
          {/* ── Two-column layout ──────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 md:gap-12 mb-12 items-start">
            {/* Left: Description Card + Carousel */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="space-y-10"
            >
              <LiquidGlassCard borderRadius={28} className="p-7 sm:p-10 md:p-12">
                <div className="flex items-center gap-4 mb-6 pb-4 border-b border-white/[0.08]">
                  <span className="w-2 h-2 rounded-full bg-vermilion shadow-[0_0_8px_#E98259]" />
                  <h2 className="font-mono text-[10px] md:text-[11px] tracking-[0.35em] uppercase text-vermilion">
                    Project Overview
                  </h2>
                </div>
                <DescriptionText text={project.detailed_description} />
              </LiquidGlassCard>

              {project.images && project.images.length > 0 && (
                <ImageCarousel project={project} images={project.images} />
              )}
            </motion.div>

            {/* Right: Sticky Liquid Glass Tech Stack Card */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.32, duration: 0.6 }}
              className="lg:sticky lg:top-28 h-fit"
            >
              <LiquidGlassCard borderRadius={26} zoom={0.86} className="p-7 sm:p-8">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.08]">
                  <h2 className="font-mono text-[10px] md:text-[11px] tracking-[0.35em] uppercase text-vermilion">
                    Tech Stack
                  </h2>
                  <span className="font-mono text-[10px] text-ivory-faint">
                    [{techLines.length}]
                  </span>
                </div>
                <ul className="space-y-3.5">
                  {techLines.map((tech, i) => (
                    <TechItem key={i} tech={tech} idx={i} />
                  ))}
                </ul>
              </LiquidGlassCard>
            </motion.div>
          </div>

          <LiquidSectionDivider label="02 · INTERACTIVE AI SYNTHESIS" />

          {/* ── AI Explain Panel (Liquid Glass Card) ──────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.6 }}
          >
            <LiquidGlassCard borderRadius={28} zoom={0.9} className="p-7 md:p-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-7 pb-4 border-b border-white/[0.08]">
                <div className="flex items-center gap-3">
                  <div className="liquid-icon-box w-9 h-9 rounded-xl flex items-center justify-center">
                    <FaBrain className="text-vermilion text-sm animate-pulse" />
                  </div>
                  <div>
                    <h2 className="font-mono text-[10px] tracking-[0.3em] uppercase text-vermilion block">
                      AI Architecture Explainer
                    </h2>
                    <span className="text-xs text-ivory-muted font-light">
                      Generate a tailored architectural breakdown of this project in real time.
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-start sm:items-center justify-between">
                <div className="flex flex-wrap gap-3">
                  <SelectorTabs
                    value={explanationType}
                    onChange={setExplanationType}
                    options={[
                      { label: "Technical", value: "technical" },
                      { label: "Non-Tech", value: "simple" },
                      { label: "HR Recruiter", value: "hr" },
                    ]}
                  />
                  <SelectorTabs
                    value={complexity}
                    onChange={setComplexity}
                    options={[
                      { label: "Basic", value: "basic" },
                      { label: "Normal", value: "normal" },
                      { label: "Advanced", value: "advanced" },
                    ]}
                  />
                </div>

                <motion.button
                  onClick={handleExplain}
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.02, y: loading ? 0 : -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="liquid-pill-primary disabled:opacity-50 w-full sm:w-auto px-6 py-3 rounded-full cursor-pointer"
                >
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={loading ? "loading" : "idle"}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="flex items-center gap-2.5 justify-center font-mono text-xs uppercase tracking-wider text-ivory"
                    >
                      {loading ? (
                        <FiRefreshCw className="animate-spin text-sm text-vermilion" />
                      ) : (
                        <FiZap className="text-sm text-vermilion" />
                      )}
                      {loading ? "Initializing..." : "Explain with AI"}
                    </motion.span>
                  </AnimatePresence>
                </motion.button>
              </div>
            </LiquidGlassCard>
          </motion.div>
        </div>
      </main>

      {/* ── Related Projects ─────────────────────────────────────────────── */}
      {relatedProjects.length > 0 && (
        <>
          <LiquidSectionDivider label="03 · CONTINUE EXPLORING" />
          <RelatedProjects projects={relatedProjects} />
        </>
      )}

      {/* ── Recommendation Widget (Liquid Glass Toast) ─────────────────── */}
      <AnimatePresence>
        {showRecommendation && !dismissRecommendation && recommendedProject && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="fixed bottom-5 right-4 md:bottom-8 md:right-8 z-[90] max-w-[260px] md:max-w-xs"
          >
            <LiquidGlassCard borderRadius={20} className="p-4 md:p-5">
              <button
                onClick={() => setDismissRecommendation(true)}
                className="absolute top-3 right-3 text-ivory-faint hover:text-ivory transition p-1 z-20 cursor-pointer"
              >
                <FaTimes size={10} />
              </button>
              <div className="flex items-center gap-2 mb-3">
                <div className="liquid-icon-box w-6 h-6 rounded-lg flex items-center justify-center">
                  <FaBrain className="text-vermilion text-[10px] animate-pulse" />
                </div>
                <span className="font-mono text-[9px] text-vermilion tracking-[0.2em] uppercase">
                  up_next
                </span>
              </div>
              <div
                className="cursor-pointer group mt-2 pt-2 border-t border-white/[0.08]"
                onClick={() => {
                  setDismissRecommendation(true);
                  setTimeout(() => navigate(`/projects/${recommendedProject.slug}`), 200);
                }}
              >
                <p className="text-xs text-ivory-dim mb-1">Trending project</p>
                <p className="text-sm text-ivory font-medium group-hover:text-vermilion transition">
                  {recommendedProject.title}{" "}
                  <span className="text-vermilion opacity-80 group-hover:opacity-100 transition-opacity">
                    ↗
                  </span>
                </p>
              </div>
            </LiquidGlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── AI Explanation Modal (Refractive Liquid Glass) ─────────────── */}
      <AnimatePresence>
        {showExplanation && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-[#000000]/75 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, y: 60, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 60, scale: 0.96 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="modal-container w-full sm:max-w-4xl sm:max-h-[82vh] max-h-[90vh] flex flex-col"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-5 md:px-8 py-4 border-b border-white/[0.09] shrink-0 bg-white/[0.03]">
                <div className="flex items-center gap-3.5">
                  <div className="liquid-icon-box w-8 h-8 rounded-lg flex items-center justify-center">
                    <FaBrain className="text-vermilion text-xs" />
                  </div>
                  <div>
                    <p className="font-mono text-[9px] text-vermilion tracking-[0.3em] uppercase mb-0.5">
                      ai.explanation
                    </p>
                    <p className="text-sm font-medium text-ivory font-serif italic">
                      {project.title}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <motion.button
                    onClick={handleExplain}
                    disabled={loading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="liquid-pill-secondary flex items-center gap-2 font-mono text-[10px] px-3.5 py-1.5 rounded-full text-ivory-soft hover:text-ivory transition disabled:opacity-40 tracking-widest uppercase cursor-pointer"
                  >
                    <FiRefreshCw className={`text-[10px] text-vermilion ${loading ? "animate-spin" : ""}`} />
                    <span className="hidden sm:inline">regenerate</span>
                  </motion.button>

                  <motion.button
                    onClick={() => setShowExplanation(false)}
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="text-ivory-dim hover:text-ivory transition p-1 cursor-pointer"
                  >
                    <FiX size={18} />
                  </motion.button>
                </div>
              </div>

              {/* Modal body */}
              <div className="p-6 md:p-10 overflow-y-auto flex-1 ai-scroll">
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.div
                      key="skel"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col gap-4 animate-pulse max-w-3xl"
                    >
                      <div className="h-5 bg-white/[0.06] rounded w-3/4" />
                      <div className="h-4 bg-white/[0.06] rounded w-full" />
                      <div className="h-4 bg-white/[0.06] rounded w-5/6" />
                      <div className="h-4 bg-white/[0.06] rounded w-4/5" />
                      <div className="h-4 bg-white/[0.06] rounded w-full" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="content"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35 }}
                      className="markdown-body text-ivory leading-relaxed text-sm md:text-base max-w-3xl space-y-4"
                    >
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          a: ({ node: _node, ...props }) => (
                            <a
                              {...props}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-vermilion hover:text-ivory underline font-semibold transition-colors"
                            />
                          ),
                        }}
                      >
                        {typedText}
                      </ReactMarkdown>
                      {typedText.length < explanation.length && (
                        <motion.span
                          animate={{ opacity: [1, 0] }}
                          transition={{ duration: 0.5, repeat: Infinity }}
                          className="inline-block w-[2px] h-[1em] ml-1 bg-vermilion align-middle"
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

      {/* ── Footer ─────────────────────────────────────────────────────── */}
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
        * { box-sizing: border-box; }
        body { font-family: var(--font-sans); }
        .font-mono { font-family: var(--font-mono); }
        .font-serif { font-family: var(--font-serif); }
        .custom-cursor-wrapper * { cursor: none !important; }

        /* ── Display titles ────────────────────────────────────────── */
        .display-title {
          font-family: var(--font-serif);
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
          background: rgba(0, 0, 0, 0.44);
          backdrop-filter: url(#project-liquid-glass) blur(2.5px) saturate(145%) brightness(0.75);
          -webkit-backdrop-filter: blur(3px) saturate(145%) brightness(0.75);
          border: 1px solid rgba(255, 255, 255, 0.09);
          box-shadow:
            inset 0 1px 0.5px 0 rgba(255, 255, 255, 0.22),
            inset 0 -1px 1.5px 0 rgba(233, 130, 89, 0.12),
            0 16px 40px -8px rgba(0, 0, 0, 0.65);
          transition: border-color 0.35s ease, box-shadow 0.35s ease, background 0.35s ease, transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .liquid-glass-card:hover {
          background: rgba(0, 0, 0, 0.52);
          border-color: rgba(255, 255, 255, 0.14);
          box-shadow:
            inset 0 1px 1px 0 rgba(255, 255, 255, 0.28),
            inset 0 -1.5px 2px 0 rgba(233, 130, 89, 0.2),
            0 22px 48px -8px rgba(0, 0, 0, 0.78);
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
            rgba(233, 130, 89, 0.16) 100%
          );
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          z-index: 1;
        }

        .liquid-card-glare {
          position: absolute;
          inset: 0;
          background: radial-gradient(
            260px circle at var(--mx) var(--my),
            rgba(255, 255, 255, 0.06),
            transparent 70%
          );
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: 1;
        }
        .liquid-glass-card:hover .liquid-card-glare {
          opacity: 1;
        }

        /* ── Liquid Glass Section Divider Tube & Node ─────────────── */
        .liquid-divider-line {
          height: 2px;
          border-radius: 9999px;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.16) 35%,
            rgba(233, 130, 89, 0.38) 50%,
            rgba(255, 255, 255, 0.16) 65%,
            transparent 100%
          );
          box-shadow:
            0 1px 4px rgba(0, 0, 0, 0.6),
            0 0 12px rgba(233, 130, 89, 0.18);
        }
        .liquid-divider-pill {
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: url(#project-liquid-glass) blur(3px) saturate(150%);
          -webkit-backdrop-filter: blur(3px) saturate(150%);
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow:
            inset 0 1px 0.5px rgba(255, 255, 255, 0.28),
            inset 0 -1px 1px rgba(233, 130, 89, 0.15),
            0 6px 20px rgba(0, 0, 0, 0.5);
        }

        /* ── Liquid Pill Buttons, Chips & Boxes ───────────────────── */
        .liquid-pill-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.65rem;
          padding: 0.65rem 1.5rem;
          border-radius: 9999px;
          background: rgba(0, 0, 0, 0.55);
          backdrop-filter: url(#project-liquid-glass) blur(2.5px) saturate(145%);
          -webkit-backdrop-filter: blur(3px) saturate(145%);
          border: 1px solid rgba(233, 130, 89, 0.26);
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.85);
          box-shadow:
            inset 0 1px 0.5px rgba(255, 255, 255, 0.28),
            inset 0 -1px 1.5px rgba(233, 130, 89, 0.18),
            0 10px 28px -4px rgba(0, 0, 0, 0.55);
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .liquid-pill-primary:hover {
          background: rgba(0, 0, 0, 0.68);
          border-color: rgba(233, 130, 89, 0.45);
          box-shadow:
            inset 0 1px 1px rgba(255, 255, 255, 0.38),
            inset 0 -1px 2px rgba(233, 130, 89, 0.28),
            0 14px 34px -4px rgba(0, 0, 0, 0.7),
            0 0 20px rgba(233, 130, 89, 0.14);
        }

        .liquid-pill-secondary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.65rem;
          padding: 0.65rem 1.5rem;
          border-radius: 9999px;
          background: rgba(0, 0, 0, 0.46);
          backdrop-filter: url(#project-liquid-glass) blur(2.5px) saturate(145%);
          -webkit-backdrop-filter: blur(3px) saturate(145%);
          border: 1px solid rgba(255, 255, 255, 0.11);
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.85);
          box-shadow:
            inset 0 1px 0.5px rgba(255, 255, 255, 0.22),
            inset 0 -1px 1px rgba(233, 130, 89, 0.1),
            0 10px 28px -4px rgba(0, 0, 0, 0.5);
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .liquid-pill-secondary:hover {
          background: rgba(0, 0, 0, 0.58);
          border-color: rgba(233, 130, 89, 0.3);
          box-shadow:
            inset 0 1px 1px rgba(255, 255, 255, 0.3),
            0 14px 32px -4px rgba(0, 0, 0, 0.65);
        }

        .liquid-icon-box {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow:
            inset 0 1px 0.5px rgba(255, 255, 255, 0.24),
            0 4px 12px rgba(0, 0, 0, 0.35);
        }

        .liquid-chip {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: inset 0 1px 0.5px rgba(255, 255, 255, 0.18);
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.85);
        }

        /* ── Selector tabs ───────────────────────────────────────── */
        .selector-tabs {
          display: flex;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 9999px;
          box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.4);
        }
        .selector-tab {
          padding: 0.5rem 1.05rem;
          border-radius: 9999px;
          font-family: var(--font-mono);
          font-size: 0.68rem;
          text-transform: uppercase;
          white-space: nowrap;
          color: rgba(242, 239, 230, 0.72);
          transition: all 0.2s ease;
          letter-spacing: 0.1em;
          cursor: pointer;
        }
        .selector-tab:hover { color: var(--color-text-primary); }
        .selector-tab-active {
          background: rgba(233, 130, 89, 0.12);
          border: 1px solid rgba(233, 130, 89, 0.3);
          box-shadow:
            inset 0 1px 0.5px rgba(255, 255, 255, 0.28),
            0 2px 8px rgba(0, 0, 0, 0.35);
          color: var(--color-text-primary);
        }

        /* ── Modal ───────────────────────────────────────────────── */
        .modal-container {
          border-radius: 1.5rem 1.5rem 0 0;
          overflow: hidden;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: url(#project-liquid-glass) blur(8px) saturate(150%);
          -webkit-backdrop-filter: blur(8px) saturate(150%);
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow:
            inset 0 1px 0.5px rgba(255, 255, 255, 0.25),
            0 24px 80px rgba(0, 0, 0, 0.85);
        }
        @media (min-width: 640px) {
          .modal-container {
            border-radius: 1.5rem;
          }
        }

        /* ── Scrollbars ───────────────────────────────────────────── */
        .ai-scroll::-webkit-scrollbar { width: 4px; }
        .ai-scroll::-webkit-scrollbar-thumb { background: rgba(233, 130, 89, 0.25); border-radius: 10px; }
        .ai-scroll::-webkit-scrollbar-track { background: transparent; }

        .decal-easter-egg {
          font-family: 'Dancing Script', cursive;
          letter-spacing: 0.08em;
          font-size: 1.1rem;
          color: rgba(242, 239, 230, 0.45);
          text-shadow: 0 0 10px rgba(242, 239, 230, 0.15);
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
