import { lazy, Suspense, useEffect, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useInView,
  useScroll,
  useSpring,
  useTransform,
  useMotionValue,
  animate,
} from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import type { IconType } from "react-icons";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import { HOME_SCHEMA, PAGE_SEO, setPageMetadata } from "../seo";
import {
  LiquidChatOrb,
  LiquidGlassCard,
  LiquidGlassPill,
  LiquidLensFilter,
} from "../components/LiquidGlass";
import { useCardLensMap } from "../hooks/useLensMap";
import type { About, Experience, Project, Skill, Social } from "../types";
import {
  SiPython,
  SiDjango,
  SiMongodb,
  SiReact,
  SiTailwindcss,
  SiDocker,
  SiOpenai,
  SiFastapi,
  SiHtml5,
  SiCss3,
  SiJavascript,
  SiTypescript,
  SiOllama,
  SiGithub,
  SiLinkedin,
  SiInstagram,
  SiGmail,
  SiFlask,
  SiHuggingface,
  SiStreamlit,
  SiX,
} from "react-icons/si";
import {
  FaServer,
  FaGlobe,
  FaLink,
  FaProjectDiagram,
  FaBrain,
  FaTimes,
  FaHandshake,
} from "react-icons/fa";
import { FiArrowUpRight, FiArrowRight } from "react-icons/fi";

const ChatModal = lazy(() => import("../components/ChatModal"));
const AsciiKoiCanvas = lazy(() => import("../components/AsciiKoiCanvas"));
const LiquidGlassCursor = lazy(() => import("../components/LiquidGlassCursor"));

const skillIconMap: Record<string, IconType> = {
  python: SiPython,
  django: SiDjango,
  mongodb: SiMongodb,
  html: SiHtml5,
  css: SiCss3,
  javascript: SiJavascript,
  typescript: SiTypescript,
  react: SiReact,
  tailwindcss: SiTailwindcss,
  "git / github": SiGithub,
  docker: SiDocker,
  ollama: SiOllama,
  openai: SiOpenai,
  fastapi: SiFastapi,
  flask: SiFlask,
  streamlit: SiStreamlit,
  transformers: SiHuggingface,
  "hugging face": SiHuggingface,
  langchain: FaLink,
  langgraph: FaProjectDiagram,
  collaborate: FaHandshake,
  "rag (retrieval-augmented generation)": FaBrain,
};

const socialIconMap: Record<string, IconType> = {
  github: SiGithub,
  linkedin: SiLinkedin,
  instagram: SiInstagram,
  gmail: SiGmail,
  email: SiGmail,
  website: FaGlobe,
  twitter: SiX,
  "twitter/x": SiX,
  collaborate: FaHandshake,
  collaboration: FaHandshake,
  x: SiX,
};

const EASE = [0.22, 1, 0.36, 1] as const;

/* ── Liquid Glass Section Divider (Refractive Tube + Center Crystal Node) ──── */
const LiquidSectionDivider = ({ label }: { label?: string }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });

  return (
    <div
      ref={ref}
      className="relative max-w-6xl mx-auto px-6 md:px-10 py-6 md:py-10 flex items-center justify-center gap-4 select-none"
    >
      {/* Left Refractive Glass Tube */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={inView ? { scaleX: 1, opacity: 1 } : {}}
        transition={{ duration: 1.1, ease: EASE }}
        className="liquid-divider-line flex-1 origin-right"
      />

      {/* Center Liquid Droplet Node / Pill */}
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={inView ? { scale: 1, opacity: 1 } : {}}
        transition={{ duration: 0.6, ease: EASE, delay: 0.25 }}
        className="liquid-divider-pill px-3.5 py-1 rounded-full flex items-center gap-2 shrink-0"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-vermilion shadow-[0_0_8px_#E98259]" />
        {label && (
          <span className="font-mono text-[9px] tracking-[0.28em] uppercase text-vermilion/90">
            {label}
          </span>
        )}
      </motion.div>

      {/* Right Refractive Glass Tube */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={inView ? { scaleX: 1, opacity: 1 } : {}}
        transition={{ duration: 1.1, ease: EASE }}
        className="liquid-divider-line flex-1 origin-left"
      />
    </div>
  );
};

/* ── Film grain overlay ─────────────────────────────────────────────────────── */
const Grain = () => (
  <div
    className="pointer-events-none fixed inset-0 z-[80] opacity-[0.05] mix-blend-overlay"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
    }}
  />
);

/* ── Scroll progress bar ────────────────────────────────────────────────────── */
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

/* ── Staggered word reveal (used for headings) ──────────────────────────────── */
const RevealWords = ({
  text,
  className = "",
  delay = 0,
  once = true,
}: {
  text: string;
  className?: string;
  delay?: number;
  once?: boolean;
}) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once, amount: 0.5 });
  return (
    <span ref={ref} className={className} aria-label={text}>
      {text.split(" ").map((word, i) => (
        <span
          key={i}
          className="inline-block overflow-hidden align-bottom pb-[0.08em] -mb-[0.08em] mr-[0.28em] last:mr-0"
        >
          <motion.span
            className="inline-block will-change-transform"
            initial={{ y: "110%", rotate: 4, opacity: 0 }}
            animate={inView ? { y: 0, rotate: 0, opacity: 1 } : {}}
            transition={{ duration: 0.9, ease: EASE, delay: delay + i * 0.08 }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  );
};

/* ── Section header: number + eyebrow + serif title ─────────────────────────── */
const SectionHeader = ({
  index,
  eyebrow,
  title,
  className = "",
}: {
  index: string;
  eyebrow: string;
  title: string;
  className?: string;
}) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  return (
    <div ref={ref} className={`mb-12 md:mb-16 ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: EASE }}
        className="flex items-center gap-4 mb-5"
      >
        <span className="font-mono text-[10px] md:text-[11px] tracking-[0.35em] uppercase text-vermilion">
          {index} / {eyebrow}
        </span>
        <motion.span
          className="liquid-divider-line max-w-[160px] flex-1 origin-left"
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 1, ease: EASE, delay: 0.2 }}
        />
      </motion.div>
      <h2 className="display-title drop-shadow-[0_4px_20px_rgba(0,0,0,0.75)]">
        <RevealWords text={title} />
      </h2>
    </div>
  );
};

/* ── Floating Refractive Quote Capsule (Replaces Opaque ImageBreak) ────────── */
const QuoteBreak = ({ quote, tag }: { quote: string; tag: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [35, -35]);

  return (
    <section ref={ref} className="relative py-12 md:py-20 px-6 max-w-5xl mx-auto">
      <motion.div style={{ y }} className="will-change-transform">
        <LiquidGlassCard
          borderRadius={32}
          zoom={0.85}
          className="px-8 py-12 md:px-16 md:py-16 text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="w-8 h-px bg-gradient-to-r from-transparent to-vermilion/50" />
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-vermilion">
              {tag}
            </span>
            <span className="w-8 h-px bg-gradient-to-l from-transparent to-vermilion/50" />
          </div>
          <p className="font-serif italic text-2xl md:text-4xl lg:text-[2.5rem] text-ivory leading-snug max-w-3xl mx-auto drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]">
            <RevealWords text={`"${quote}"`} />
          </p>
        </LiquidGlassCard>
      </motion.div>
    </section>
  );
};

/* ── Count-up stat ──────────────────────────────────────────────────────────── */
const Stat = ({
  value,
  suffix,
  label,
  idx,
}: {
  value: number;
  suffix?: string;
  label: string;
  idx: number;
}) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const mv = useMotionValue(0);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView || value <= 0) return;
    const controls = animate(mv, value, {
      duration: 2,
      ease: EASE,
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, value, mv]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: EASE, delay: idx * 0.12 }}
      className="flex flex-col items-center text-center gap-2 py-8 md:py-10 px-4"
    >
      <span className="font-serif text-4xl md:text-6xl text-ivory tabular-nums drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
        {display}
        {suffix}
      </span>
      <span className="font-mono text-[10px] md:text-[11px] tracking-[0.3em] uppercase text-vermilion">
        {label}
      </span>
    </motion.div>
  );
};

/* ── Simplified bio reveal inside Liquid Glass ──────────────────────────────── */
const ScrollBio = ({ text }: { text: string }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const paragraphs = text
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div ref={ref} className="space-y-6">
      {paragraphs.map((para, pi) => (
        <motion.p
          key={pi}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: EASE, delay: pi * 0.15 }}
          className="text-lg md:text-2xl leading-relaxed text-ivory font-light drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)]"
        >
          {para}
        </motion.p>
      ))}
    </div>
  );
};

/* ── Asymmetric Bento Skills Grid (database-driven, adapts to any counts) ───── */
const SkillBento = ({ groupedSkills }: { groupedSkills: [string, Skill[]][] }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });

  // Featured tile = the largest category (ties keep database order)
  let featuredIdx = 0;
  groupedSkills.forEach(([, g], i) => {
    if (g.length > groupedSkills[featuredIdx][1].length) featuredIdx = i;
  });

  // Asymmetric spans: featured is 7 cols (×2 rows when content-rich);
  // the two cards after it fill the 5-col lane beside it, the rest alternate 7/5.
  const spans: string[] = [];
  let before = 0, right = 2, after = 0;
  groupedSkills.forEach((_, i) => {
    if (i === featuredIdx) {
      spans.push(
        groupedSkills.length === 1
          ? "md:col-span-12"
          : groupedSkills[featuredIdx][1].length >= 6
            ? "md:col-span-7 md:row-span-2"
            : "md:col-span-7"
      );
      return;
    }
    if (i < featuredIdx) spans.push(before++ % 2 === 0 ? "md:col-span-7" : "md:col-span-5");
    else if (right-- > 0) spans.push("md:col-span-5");
    else spans.push(after++ % 2 === 0 ? "md:col-span-7" : "md:col-span-5");
  });

  return (
    <div ref={ref} className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-5">
      {groupedSkills.map(([category, group], idx) => {
        const featured = idx === featuredIdx;
        return (
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 28 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: EASE, delay: idx * 0.06 }}
            className={spans[idx]}
          >
            <LiquidGlassCard
              borderRadius={featured ? 26 : 22}
              zoom={featured ? 0.87 : 0.86}
              className={`h-full ${featured ? "p-7 md:p-10" : "p-6 md:p-7"}`}
            >
              <div className="flex items-center gap-3 mb-5 md:mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-vermilion shadow-[0_0_6px_#E98259]" />
                <span
                  className={`font-mono tracking-[0.28em] uppercase text-vermilion ${
                    featured ? "text-xs md:text-sm" : "text-[11px]"
                  }`}
                >
                  {category}
                </span>
              </div>
              <div className="flex flex-wrap gap-2.5 md:gap-3">
                {group.map((skill, i) => {
                  const Icon = skillIconMap[skill.name.toLowerCase()] || FaServer;
                  return (
                    <motion.div
                      key={skill.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={inView ? { opacity: 1, scale: 1 } : {}}
                      transition={{ duration: 0.45, ease: EASE, delay: idx * 0.06 + i * 0.03 }}
                      whileHover={{ y: -3 }}
                      className={`skill-chip group ${featured ? "skill-chip-lg" : ""}`}
                    >
                      <Icon
                        aria-hidden="true"
                        className={`text-vermilion group-hover:text-ivory transition-colors duration-300 ${
                          featured ? "text-base" : "text-sm"
                        }`}
                      />
                      <span
                        className={`font-mono text-ivory-soft group-hover:text-ivory transition-colors duration-300 ${
                          featured ? "text-[13px]" : "text-xs"
                        }`}
                      >
                        {skill.name}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </LiquidGlassCard>
          </motion.div>
        );
      })}
    </div>
  );
};

/* ── Experience timeline with Liquid Glass Cards ────────────────────────────── */
const ExperienceItem = ({ exp, idx }: { exp: Experience; idx: number }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  return (
    <div ref={ref} className="relative pl-8 md:pl-14 pb-8 md:pb-10 last:pb-0">
      {/* Refractive Crystal Node on Timeline */}
      <motion.span
        className="absolute left-[-6px] top-7 w-[13px] h-[13px] rounded-full border border-vermilion/60 bg-vermilion shadow-[0_0_12px_rgba(233,130,89,0.5)] z-10"
        initial={{ scale: 0 }}
        animate={inView ? { scale: 1 } : {}}
        transition={{ type: "spring", stiffness: 320, damping: 18, delay: 0.1 }}
      >
        <span className="absolute inset-[2.5px] rounded-full bg-vermilion" />
      </motion.span>

      <motion.div
        initial={{ opacity: 0, x: -24 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.75, ease: EASE, delay: idx * 0.06 }}
      >
        <LiquidGlassCard
          borderRadius={22}
          zoom={0.86}
          className="p-6 md:p-8 transition-transform duration-500 hover:-translate-y-0.5"
        >
          <span className="font-mono text-[10px] md:text-[11px] tracking-[0.25em] uppercase text-vermilion">
            {exp.start_date} — {exp.currently_working ? "Present" : exp.end_date}
          </span>
          <h3 className="font-serif italic text-xl md:text-3xl text-ivory mt-2 mb-1 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            {exp.role}
          </h3>
          <p className="text-sm md:text-base text-vermilion mb-4 font-medium">{exp.company}</p>
          <p className="text-sm md:text-[15px] leading-relaxed text-ivory-soft max-w-2xl font-light drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)]">
            {exp.description}
          </p>
        </LiquidGlassCard>
      </motion.div>
    </div>
  );
};

const ExperienceTimeline = ({ experience }: { experience: Experience[] }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.75", "end 0.65"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 26 });
  return (
    <div ref={ref} className="relative ml-2">
      {/* Liquid Glass Vertical Spine */}
      <div className="absolute left-0 top-6 bottom-6 w-[2px] bg-white/[0.08] rounded-full" />
      <motion.div
        className="absolute left-0 top-6 bottom-6 w-[2px] origin-top bg-gradient-to-b from-vermilion via-vermilion/60 to-transparent shadow-[0_0_10px_rgba(233,130,89,0.45)] rounded-full"
        style={{ scaleY }}
      />
      {experience.map((exp, idx) => (
        <ExperienceItem key={exp.id} exp={exp} idx={idx} />
      ))}
    </div>
  );
};

/* ── Editorial project row inside Liquid Glass Card ─────────────────────────── */
const ProjectRow = ({ project, idx }: { project: Project; idx: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.25 });
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const numY = useTransform(scrollYProgress, [0, 1], [30, -30]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.75, ease: EASE, delay: (idx % 2) * 0.08 }}
    >
      <Link to={`/projects/${project.slug}`} className="block">
      <LiquidGlassCard
        borderRadius={26}
        zoom={0.88}
        className="group transition-transform duration-500 hover:-translate-y-1"
      >
        {/* Parallax ghost number */}
        <motion.span
          style={{ y: numY }}
          className="absolute right-4 md:right-10 top-1/2 -translate-y-1/2 font-serif italic text-[5.5rem] md:text-[8.5rem] leading-none text-ivory/[0.045] select-none pointer-events-none"
        >
          {String(idx + 1).padStart(2, "0")}
        </motion.span>

        <div className="relative grid grid-cols-[auto_1fr_auto] items-center gap-4 md:gap-10 py-7 md:py-10 px-6 md:px-10">
          <span className="font-mono text-[10px] md:text-xs text-vermilion tracking-[0.25em] self-start pt-2 md:pt-3">
            {String(idx + 1).padStart(2, "0")}
          </span>

          <div className="min-w-0">
            <h3 className="font-serif italic text-2xl md:text-4xl lg:text-5xl text-ivory leading-tight mb-2 md:mb-3 transition-transform duration-500 group-hover:translate-x-2 md:group-hover:translate-x-3 drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]">
              {project.title}
            </h3>
            <p className="text-sm md:text-base text-ivory-soft leading-relaxed max-w-xl font-light transition-transform duration-500 group-hover:translate-x-2 md:group-hover:translate-x-3 drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)]">
              {project.short_description}
            </p>
          </div>

          <div className="liquid-icon-box w-11 h-11 md:w-14 md:h-14 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 group-hover:border-vermilion/50 group-hover:bg-[#000000]/15 group-hover:rotate-45">
            <FiArrowUpRight className="text-base md:text-xl text-vermilion group-hover:text-ivory transition-colors duration-300" />
          </div>
        </div>
      </LiquidGlassCard>
      </Link>
    </motion.div>
  );
};

/* ── Social link ────────────────────────────────────────────────────────────── */
const SocialLink = ({ link, idx }: { link: Social; idx: number }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const Icon = socialIconMap[link.name.toLowerCase()] || FaGlobe;
  return (
    <motion.a
      ref={ref}
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, ease: EASE, delay: idx * 0.07 }}
      whileHover={{ y: -4, scale: 1.03 }}
      className="liquid-pill-secondary group flex items-center gap-3 px-6 py-3.5 rounded-full transition-all duration-300"
    >
      <Icon aria-hidden="true" className="text-base text-vermilion group-hover:text-ivory transition-colors duration-300" />
      <span className="font-mono text-xs tracking-[0.2em] uppercase text-ivory-soft group-hover:text-ivory transition-colors duration-300">
        {link.name}
      </span>
      <FiArrowUpRight aria-hidden="true" className="text-xs text-vermilion group-hover:text-vermilion group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
    </motion.a>
  );
};

/* ── Hero (Transparent over Swimming ASCII Koi Pond) ────────────────────────── */
const Hero = ({ onChat, projectCount }: { onChat: () => void; projectCount: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 160]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const contentScale = useTransform(scrollYProgress, [0, 1], [1, 0.94]);

  return (
    <section
      ref={ref}
      id="hero"
      className="hero-first-load relative min-h-[100svh] flex flex-col items-center justify-center text-center px-6 overflow-hidden"
    >
      <motion.div
        style={{ y: contentY, opacity: contentOpacity, scale: contentScale }}
        className="relative z-10 flex flex-col items-center will-change-transform"
      >
        {/* Name */}
        <h1
          className="hero-name mt-12 md:mt-16 drop-shadow-[0_6px_28px_rgba(0,0,0,0.75)] select-none"
          aria-label="Keval Parmar"
        >
          <span className="block overflow-hidden pb-[0.06em]">
            <span className="inline-block">
              Keval
            </span>
          </span>
          <span className="block overflow-hidden pb-[0.12em] -mt-[0.18em]">
            <span className="inline-block font-serif italic font-medium text-vermilion">
              Parmar
            </span>
          </span>
        </h1>

        {/* Tagline */}
        <p
          className="mt-7 md:mt-9 max-w-xl text-sm md:text-lg leading-relaxed text-ivory-soft font-light drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]"
        >
          I help founders and businesses integrate scalable AI, automate complex workflows, and
          build intelligent agents that deliver real-world ROI.
        </p>

        {/* Liquid Glass CTAs */}
        <div
          className="mt-9 md:mt-11 flex flex-col sm:flex-row gap-3.5 sm:gap-4 w-full max-w-xs sm:max-w-none sm:w-auto"
        >
          <LiquidGlassPill
            onClick={() => document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })}
            variant="secondary"
            className="group px-7 py-3.5 text-sm font-medium text-ivory"
          >
            <span>View Projects{projectCount > 0 ? ` (${projectCount})` : ""}</span>
            <FiArrowRight className="text-vermilion transition-transform duration-300 group-hover:translate-x-1" />
          </LiquidGlassPill>

          <LiquidGlassPill
            onClick={onChat}
            variant="primary"
            className="px-7 py-3.5 text-sm font-medium text-ivory"
          >
            <FaBrain className="text-sm text-vermilion" />
            <span>Chat with Portfolio</span>
          </LiquidGlassPill>
        </div>
      </motion.div>
    </section>
  );
};

/* ── Main ───────────────────────────────────────────────────────────────────── */
export default function Home() {
  const navigate = useNavigate();
  const lensMapUrl = useCardLensMap();

  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [about, setAbout] = useState<About | null>(null);
  const [socials, setSocials] = useState<Social[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showKoi, setShowKoi] = useState(false);
  const [showCursor, setShowCursor] = useState(false);
  const [backendRecommendation, setBackendRecommendation] = useState<string | null>(null);
  const [dismissSuggestion, setDismissSuggestion] = useState(
    () => localStorage.getItem("dismissedAI") !== null
  );
  const timeSpent = useRef<Record<string, number>>({
    about: 0,
    skills: 0,
    experience: 0,
    projects: 0,
    contact: 0,
  });
  const [currentView, setCurrentView] = useState("hero");
  const [hasSpentEnoughTime, setHasSpentEnoughTime] = useState(false);
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);

  useEffect(() => {
    setPageMetadata({ ...PAGE_SEO.home, structuredData: HOME_SCHEMA });

    const frame = window.requestAnimationFrame(() => setShowKoi(true));
    setShowCursor(window.matchMedia("(pointer: fine)").matches);

    api.get<Project[]>("projects/").then((res) => setProjects(res.data)).catch(() => {});
    api.get<Skill[]>("skills/").then((res) => setSkills(res.data)).catch(() => {});
    api.get<Experience[]>("experience/").then((res) => setExperience(res.data)).catch(() => {});
    api.get<About>("about/").then((res) => setAbout(res.data)).catch(() => {});
    api.get<Social[]>("socials/").then((res) => setSocials(res.data)).catch(() => {});

    api
      .get<{ data?: { section: string }[] }>("ranking/")
      .then((res) => {
        if (res.data?.data?.length) setBackendRecommendation(res.data.data[0].section);
      })
      .catch(() => { });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const sections = ["about", "skills", "experience", "projects", "contact"];
    let thresholdReached = false;
    const tick = () => {
      if (document.hidden) return;
      const scrollMid = window.scrollY + window.innerHeight / 2;
      let active = "";
      sections.forEach((id) => {
        // Looked up per tick: sections mount after the API response arrives.
        const el = document.getElementById(id);
        if (el) {
          const top = window.scrollY + el.getBoundingClientRect().top;
          if (scrollMid >= top && scrollMid <= top + el.offsetHeight) active = id;
        }
      });
      const nextView = active || "hero";
      setCurrentView((previous) => previous === nextView ? previous : nextView);
      if (active) {
        timeSpent.current[active]++;
        if (!thresholdReached && timeSpent.current[active] > 5) {
          thresholdReached = true;
          setHasSpentEnoughTime(true);
        }
      }
    };
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const mostViewed = Object.keys(timeSpent.current).reduce((a, b) =>
    timeSpent.current[a] > timeSpent.current[b] ? a : b
  );
  const finalRecommendation =
    backendRecommendation && backendRecommendation !== currentView
      ? backendRecommendation
      : mostViewed;
  const showRecommendation =
    !dismissSuggestion &&
    finalRecommendation &&
    hasSpentEnoughTime &&
    currentView !== finalRecommendation;

  const handleDismiss = () => {
    setDismissSuggestion(true);
    localStorage.setItem("dismissedAI", "true");
  };

  const trendingProject =
    projects.length > 0
      ? [...projects].sort((a, b) => (b.views || 0) - (a.views || 0))[0]
      : null;

  const totalViews = projects.reduce((n, p) => n + (p.views || 0), 0);

  const groupedSkills = Object.entries(
    skills.reduce<Record<string, Skill[]>>((acc, skill) => {
      acc[skill.category] = acc[skill.category] || [];
      acc[skill.category].push(skill);
      return acc;
    }, {})
  ) as [string, Skill[]][];

  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="relative min-h-screen bg-[#000000] text-ivory overflow-x-hidden custom-cursor-wrapper"
    >
      {/* ── Shared SVG Optical Refraction Filter for All Home Cards ── */}
      <LiquidLensFilter id="home-liquid-glass" mapUrl={lensMapUrl} />

      {/* ── Background: Full-Page Live ASCII Koi Fish Pond ── */}
      {showKoi && (
        <Suspense fallback={null}>
          <AsciiKoiCanvas />
        </Suspense>
      )}

      {/* Ambient gradient glow in center water */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_50%_30%,rgba(233,130,89,0.05)_0%,transparent_70%)]" />

      {showCursor && (
        <Suspense fallback={null}>
          <LiquidGlassCursor />
        </Suspense>
      )}
      <Navbar />
      <ScrollProgress />
      <Grain />

      {/* ── AI Insight Widget (Refractive Liquid Glass) ───────────────── */}
      <AnimatePresence>
        {showRecommendation && (
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="fixed bottom-24 right-4 md:bottom-32 md:right-8 z-[90] max-w-[280px] md:max-w-xs"
          >
            <LiquidGlassCard borderRadius={20} className="p-4 md:p-5">
              <button
                onClick={handleDismiss}
                className="absolute top-3 right-3 text-ivory-faint hover:text-ivory transition p-1 z-20 cursor-pointer"
              >
                <FaTimes size={10} />
              </button>
              <div className="flex items-center gap-2 mb-3">
                <div className="liquid-icon-box w-6 h-6 rounded-lg flex items-center justify-center">
                  <FaBrain className="text-vermilion text-xs animate-pulse" />
                </div>
                <span className="font-mono text-[9px] text-vermilion tracking-[0.2em] uppercase">
                  AI_ANALYTICS
                </span>
              </div>
              <div
                className="cursor-pointer mb-3 pb-3 border-b border-white/[0.08]"
                onClick={() =>
                  document.getElementById(finalRecommendation)?.scrollIntoView({ behavior: "smooth" })
                }
              >
                <p className="text-xs text-ivory-dim mb-1">Most explored section</p>
                <p className="text-sm text-ivory font-medium capitalize">
                  {finalRecommendation} <span className="text-vermilion">↗</span>
                </p>
              </div>
              {trendingProject && (
                <div
                  className="cursor-pointer"
                  onClick={() => navigate(`/projects/${trendingProject.slug}`)}
                >
                  <p className="text-xs text-ivory-dim mb-1">Trending project</p>
                  <p className="text-sm text-ivory font-medium">
                    {trendingProject.title} <span className="text-vermilion">↗</span>
                  </p>
                </div>
              )}
            </LiquidGlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <Hero onChat={() => setIsChatOpen(true)} projectCount={projects.length} />

      {/* ── MAIN FLOW: Transparent Container so Koi Swim Everywhere ───── */}
      <div className="relative z-10">
        {/* Stats Strip inside a Refractive Liquid Glass Bar */}
        <div className="max-w-6xl mx-auto px-6 md:px-10 mb-12 md:mb-20">
          <LiquidGlassCard borderRadius={28} zoom={0.9}>
            <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/[0.08]">
              <Stat value={projects.length} label="Projects shipped" idx={0} />
              <Stat value={skills.length} suffix="+" label="Technologies" idx={1} />
              <Stat value={experience.length} label="Roles held" idx={2} />
              <Stat value={totalViews} label="Project views" idx={3} />
            </div>
          </LiquidGlassCard>
        </div>

        <LiquidSectionDivider label="01 · IDENTITY" />

        {/* ── ABOUT ─────────────────────────────────────────────────── */}
        {about && (
          <section id="about" className="relative py-16 md:py-28 max-w-6xl mx-auto px-6 md:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-10 lg:gap-16 items-start">
              <div className="lg:sticky lg:top-32 h-fit">
                <SectionHeader index="01" eyebrow="about.me" title="About" className="mb-6" />
                <p className="font-mono text-[11px] leading-relaxed tracking-wider text-ivory-dim max-w-[240px] drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)]">
                  {about.headline}
                </p>
              </div>
              <LiquidGlassCard borderRadius={28} className="p-8 md:p-12">
                <ScrollBio text={about.bio} />
              </LiquidGlassCard>
            </div>
          </section>
        )}

        <LiquidSectionDivider label="02 · ARCHITECTURE" />

        {/* ── SKILLS ────────────────────────────────────────────────── */}
        <section id="skills" className="relative py-16 md:py-28 max-w-6xl mx-auto px-6 md:px-10">
          <SectionHeader index="02" eyebrow="tech.stack" title="Architecture Stack" />
          <SkillBento groupedSkills={groupedSkills} />
        </section>

        {/* ── FLOATING REFRACTIVE QUOTE BREAK 1 ─────────────────────── */}
        <QuoteBreak
          tag="SIGNAL // NOISE"
          quote="Turning noise into signal, while the rest of the world sleeps."
        />

        <LiquidSectionDivider label="03 · TIMELINE" />

        {/* ── EXPERIENCE ────────────────────────────────────────────── */}
        <section id="experience" className="relative py-16 md:py-28 max-w-6xl mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-10 lg:gap-16 items-start">
            <div className="lg:sticky lg:top-32 h-fit">
              <SectionHeader
                index="03"
                eyebrow="client.engagements"
                title="Experience"
                className="mb-6"
              />
              <p className="font-mono text-[11px] leading-relaxed tracking-wider text-ivory-dim max-w-[240px] drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)]">
                Where the systems thinking was forged.
              </p>
            </div>
            <ExperienceTimeline experience={experience} />
          </div>
        </section>

        <LiquidSectionDivider label="04 · CASE STUDIES" />

        {/* ── PROJECTS ──────────────────────────────────────────────── */}
        <section id="projects" className="relative py-16 md:py-28 max-w-6xl mx-auto px-6 md:px-10">
          <SectionHeader index="04" eyebrow="case.studies" title="Selected Work" />
          <div className="space-y-5">
            {projects.map((project, idx) => (
              <ProjectRow key={project.id} project={project} idx={idx} />
            ))}
          </div>
        </section>

        {/* ── FLOATING REFRACTIVE QUOTE BREAK 2 ─────────────────────── */}
        <QuoteBreak
          tag="CREATIVE // MEDIUM"
          quote="Code is a creative medium — the terminal is just where it starts."
        />

        <LiquidSectionDivider label="05 // ADVISORY FAQ" />

        {/* ── AI SEARCH CONTEXT / FAQ ───────────────────────────────── */}
        <section id="ai-context" className="relative py-16 md:py-28 max-w-4xl mx-auto px-6 md:px-10">
          <SectionHeader
            index="05"
            eyebrow="client.faq"
            title="Freelance AI Architect"
            className="mb-8"
          />

          <LiquidGlassCard borderRadius={26} className="p-7 md:p-10 mb-6">
            <p className="text-sm md:text-base text-ivory-soft font-light leading-relaxed drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)]">
              Welcome to the digital nervous system of{" "}
              <strong className="text-ivory font-medium">Keval Parmar</strong>, an independent{" "}
              <strong className="text-vermilion font-medium">AI Architect and Engineer</strong>. This
              platform isn't just a static display; it serves as a live demonstration of the
              scalable infrastructure and intelligent design I bring to client engagements. Whether
              you need custom LLM integrations, agentic workflows, or end-to-end full-stack
              development, this portfolio highlights how complex technical problems are solved with
              robust architectures.
            </p>
          </LiquidGlassCard>

          <div className="space-y-4">
            {[
              {
                q: "What is your typical engagement model?",
                a: (
                  <>
                    I partner directly with founders and product teams. Depending on the scale of
                    the challenge, engagements range from{" "}
                    <strong className="text-ivory">architecture scoping</strong> and technical
                    consulting, to hands-on{" "}
                    <strong className="text-ivory">freelance development</strong> where I build and
                    deploy scalable AI products (like custom RAG pipelines or intelligent agents)
                    directly into your existing infrastructure.
                  </>
                ),
              },
              {
                q: "Do you handle full-stack or just AI?",
                a: (
                  <>
                    Both. Delivering a successful AI product requires a seamless connection between
                    the model and the user interface. My expertise spans modern frontends (React,
                    Tailwind) and robust backends (Django, FastAPI), ensuring that the machine
                    learning models I integrate are packaged in highly aesthetic and reliable
                    applications.
                  </>
                ),
              },
              {
                q: "How do we get started?",
                a: (
                  <>
                    The best way is to reach out via the{" "}
                    <strong className="text-vermilion">Collaborate</strong> page. We will begin with
                    a brief scoping conversation to align on architecture, timelines, and business
                    goals before any code is written.
                  </>
                ),
              },
            ].map((faq, idx) => {
              const isOpen = openFAQ === idx;
              return (
                <LiquidGlassCard key={idx} borderRadius={22} zoom={0.86}>
                  <button
                    onClick={() => setOpenFAQ(isOpen ? null : idx)}
                    className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <h3
                      className={`font-serif italic text-lg md:text-xl transition-colors duration-300 m-0 drop-shadow-[0_1px_6px_rgba(0,0,0,0.8)] ${isOpen ? "text-vermilion" : "text-ivory"
                        }`}
                    >
                      {faq.q}
                    </h3>
                    <motion.div
                      initial={false}
                      animate={{ rotate: isOpen ? 0 : 45 }}
                      className="liquid-icon-box w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                    >
                      <FaTimes className="text-xs text-vermilion" />
                    </motion.div>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: EASE }}
                      >
                        <div className="px-6 pb-6 pt-3 text-ivory-soft text-sm leading-relaxed border-t border-white/[0.08] font-light drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)]">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </LiquidGlassCard>
              );
            })}
          </div>
        </section>

        <LiquidSectionDivider label="06 · INITIALIZE" />

        {/* ── CONTACT ───────────────────────────────────────────────── */}
        <section id="contact" className="relative py-16 md:py-28 max-w-5xl mx-auto px-6 md:px-10">
          <LiquidGlassCard borderRadius={32} zoom={0.9} className="p-8 sm:p-14 md:p-16 text-center">
            <SectionHeader
              index="06"
              eyebrow="get.in.touch"
              title="Let's build what's next"
              className="[&_h2]:mx-auto [&_div]:justify-center mb-6"
            />

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.7, ease: EASE }}
              className="text-ivory-soft text-sm md:text-lg mb-10 md:mb-12 max-w-lg mx-auto font-light drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)]"
            >
              Currently accepting new freelance projects, technical consulting engagements, and
              architecture design work.
            </motion.p>

            <div className="flex flex-wrap justify-center gap-3 md:gap-4">
              {socials.map((link, idx) => (
                <SocialLink key={link.id} link={link} idx={idx} />
              ))}
            </div>
          </LiquidGlassCard>
        </section>

        {/* ── FOOTER ────────────────────────────────────────────────── */}
        <footer className="relative z-10 py-8 text-center border-t border-white/[0.06] bg-[#000000]/60 backdrop-blur-md">
          <p className="font-mono text-ivory-faint text-xs tracking-[0.2em] flex items-center justify-center gap-3">
            <span>© 2026 KEVAL_PARMAR</span>
            <span className="w-1 h-1 rounded-full bg-white/10" />
            <span>POWERED_BY_AI</span>
          </p>
          <span className="decal-easter-egg text-[10px] sm:text-xs">
            "to automate and overwrite..."
          </span>
        </footer>
      </div>

      {/* ── Floating Spherical Liquid Glass Chat Orb ───────────────────── */}
      <AnimatePresence>
        {!isChatOpen && (
          <motion.div
            key="floating-chat-wrapper"
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

      {isChatOpen && (
        <Suspense fallback={null}>
          <ChatModal isOpen onClose={() => setIsChatOpen(false)} />
        </Suspense>
      )}

      <style>{`
        * { box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; }

        @keyframes hero-first-load {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .hero-first-load { animation: hero-first-load 650ms ease-out both; }
        @media (prefers-reduced-motion: reduce) {
          .hero-first-load { animation: none; }
        }

        .font-mono { font-family: 'JetBrains Mono', monospace; }
        .font-serif { font-family: 'Playfair Display', serif; }
        .custom-cursor-wrapper * { cursor: none !important; }



        /* ── Hero name ─────────────────────────────────────────────── */
        .hero-name {
          font-family: 'Inter', sans-serif;
          font-weight: 500;
          font-size: clamp(3.4rem, 12vw, 9rem);
          line-height: 1.02;
          letter-spacing: -0.035em;
          color: var(--color-text-primary);
        }
        .hero-name .font-serif { letter-spacing: -0.02em; }

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
          /* No base background: pure glass over whatever is behind it */
          backdrop-filter: url(#home-liquid-glass) blur(2.5px) saturate(145%) brightness(0.75);
          -webkit-backdrop-filter: blur(3px) saturate(145%) brightness(0.75);
          border: 1px solid rgba(255, 255, 255, 0.09);
          box-shadow:
            inset 0 1px 0.5px 0 rgba(255, 255, 255, 0.22),
            inset 0 -1px 1.5px 0 rgba(255, 255, 255, 0.06),
            0 16px 40px -8px rgba(0, 0, 0, 0.65);
          transition: border-color 0.35s ease, box-shadow 0.35s ease, transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .liquid-glass-card:hover {
          border-color: rgba(255, 255, 255, 0.14);
          box-shadow:
            inset 0 1px 1px 0 rgba(255, 255, 255, 0.28),
            inset 0 -1.5px 2px 0 rgba(255, 255, 255, 0.08),
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
            transparent 100%
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
            transparent 50%,
            rgba(255, 255, 255, 0.16) 65%,
            transparent 100%
          );
          box-shadow:
            0 1px 4px rgba(0, 0, 0, 0.6);
        }
        .liquid-divider-pill {
          /* No base background: pure glass */
          backdrop-filter: url(#home-liquid-glass) blur(3px) saturate(150%);
          -webkit-backdrop-filter: blur(3px) saturate(150%);
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow:
            inset 0 1px 0.5px rgba(255, 255, 255, 0.28),
            inset 0 -1px 1px rgba(255, 255, 255, 0.06),
            0 6px 20px rgba(0, 0, 0, 0.5);
        }

        /* ── Liquid Pill Buttons & Skill Chips ────────────────────── */
        /* ── Liquid Glass Pill CTA (Matches Freelance) ────────────── */
        .liquid-pill-btn {
          backdrop-filter: url(#apple-liquid-glass) blur(2.5px) saturate(145%) brightness(0.76);
          -webkit-backdrop-filter: blur(3px) saturate(145%) brightness(0.76);
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.85);
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }
        .liquid-pill-rim {
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          padding: 1px;
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.26) 0%,
            rgba(255, 255, 255, 0.02) 45%,
            transparent 70%,
            transparent 100%
          );
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          z-index: 1;
        }

        .liquid-pill-primary {
          /* No base background: pure glass */
          backdrop-filter: url(#apple-liquid-glass) blur(2.5px) saturate(145%) brightness(0.76);
          -webkit-backdrop-filter: blur(3px) saturate(145%) brightness(0.76);
          border: 1px solid rgba(255, 255, 255, 0.14);
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.85);
          box-shadow:
            inset 0 1px 0.5px rgba(255, 255, 255, 0.28),
            inset 0 -1px 1.5px rgba(255, 255, 255, 0.08),
            0 10px 28px -4px rgba(0, 0, 0, 0.55);
          transition: all 0.3s ease;
        }
        .liquid-pill-primary:hover {
          border-color: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
          box-shadow:
            inset 0 1px 1px rgba(255, 255, 255, 0.38),
            inset 0 -1px 2px rgba(255, 255, 255, 0.1),
            0 14px 34px -4px rgba(0, 0, 0, 0.7);
        }

        .liquid-pill-secondary {
          /* No base background: pure glass */
          backdrop-filter: url(#apple-liquid-glass) blur(2.5px) saturate(145%) brightness(0.76);
          -webkit-backdrop-filter: blur(3px) saturate(145%) brightness(0.76);
          border: 1px solid rgba(255, 255, 255, 0.11);
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.85);
          box-shadow:
            inset 0 1px 0.5px rgba(255, 255, 255, 0.22),
            inset 0 -1px 1px rgba(255, 255, 255, 0.04),
            0 10px 28px -4px rgba(0, 0, 0, 0.5);
          transition: all 0.3s ease;
        }
        .liquid-pill-secondary:hover {
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
          box-shadow:
            inset 0 1px 1px rgba(255, 255, 255, 0.3),
            0 14px 32px -4px rgba(0, 0, 0, 0.65);
        }

        .liquid-icon-box {
          /* No base background: pure glass */
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow:
            inset 0 1px 0.5px rgba(255, 255, 255, 0.24),
            0 4px 12px rgba(0, 0, 0, 0.35);
        }

        .skill-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.55rem 1.05rem;
          border-radius: 9999px;
          /* No base background: pure glass */
          border: 1px solid rgba(255, 255, 255, 0.1);
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.85);
          box-shadow:
            inset 0 1px 0.5px rgba(255, 255, 255, 0.18),
            0 4px 12px rgba(0, 0, 0, 0.25);
          transition: all 0.3s ease;
        }
        .skill-chip:hover {
          border-color: rgba(255, 255, 255, 0.3);
          box-shadow:
            inset 0 1px 0.5px rgba(255, 255, 255, 0.3),
            0 6px 20px rgba(0, 0, 0, 0.4);
        }
        .skill-chip-lg { padding: 0.7rem 1.25rem; gap: 0.7rem; }

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

        /* ── Easter egg decal ──────────────────────────────────────── */
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
