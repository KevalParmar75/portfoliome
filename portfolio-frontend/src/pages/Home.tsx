import { useEffect, useRef, useState } from "react";
import {
  motion, AnimatePresence, useInView, useScroll, useSpring,
  useTransform, useMotionValue, animate,
} from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ChatModal from "../components/ChatModal";
import api from "../api/axios";
import LiquidGlassCursor from "../components/LiquidGlassCursor";
import {
  SiPython, SiDjango, SiMongodb, SiReact, SiTailwindcss, SiDocker,
  SiOpenai, SiFastapi, SiHtml5, SiCss3, SiJavascript, SiTypescript, SiOllama,
  SiGithub, SiLinkedin, SiInstagram, SiGmail, SiFlask, SiHuggingface, SiStreamlit, SiX
} from "react-icons/si";
import { FaServer, FaGlobe, FaLink, FaProjectDiagram, FaBrain, FaTimes, FaHandshake } from "react-icons/fa";
import { FiArrowUpRight, FiArrowRight, FiMessageSquare } from "react-icons/fi";

const skillIconMap: Record<string, any> = {
  python: SiPython, django: SiDjango, mongodb: SiMongodb, html: SiHtml5,
  css: SiCss3, javascript: SiJavascript, typescript: SiTypescript, react: SiReact,
  tailwindcss: SiTailwindcss, "git / github": SiGithub, docker: SiDocker, "ollama": SiOllama,
  openai: SiOpenai, fastapi: SiFastapi, flask: SiFlask, streamlit: SiStreamlit, "transformers": SiHuggingface,
  "hugging face": SiHuggingface, langchain: FaLink, langgraph: FaProjectDiagram, collaborate: FaHandshake,
  "rag (retrieval-augmented generation)": FaBrain
};

const socialIconMap: Record<string, any> = {
  github: SiGithub, linkedin: SiLinkedin, instagram: SiInstagram,
  gmail: SiGmail, email: SiGmail, website: FaGlobe, twitter: SiX, "twitter/x": SiX,
  collaborate: FaHandshake, collaboration: FaHandshake, x: SiX,
};

const EASE = [0.22, 1, 0.36, 1] as const;

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
      className="fixed top-0 left-0 right-0 h-[2px] z-[96] origin-left bg-gradient-to-r from-transparent via-[#cfe3d4]/70 to-[#cfe3d4]/30"
      style={{ scaleX }}
    />
  );
};

/* ── Staggered word reveal (used for headings) ──────────────────────────────── */
const RevealWords = ({ text, className = "", delay = 0, once = true }: {
  text: string; className?: string; delay?: number; once?: boolean;
}) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once, amount: 0.5 });
  return (
    <span ref={ref} className={className} aria-label={text}>
      {text.split(" ").map((word, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom pb-[0.08em] -mb-[0.08em] mr-[0.28em] last:mr-0">
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
const SectionHeader = ({ index, eyebrow, title, className = "" }: {
  index: string; eyebrow: string; title: string; className?: string;
}) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  return (
    <div ref={ref} className={`mb-14 md:mb-24 ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: EASE }}
        className="flex items-center gap-4 mb-6"
      >
        <span className="font-mono text-[10px] md:text-[11px] tracking-[0.35em] uppercase text-[#9db4a4]">
          {index} / {eyebrow}
        </span>
        <motion.span
          className="h-px flex-1 max-w-[180px] bg-gradient-to-r from-[#9db4a4]/40 to-transparent origin-left"
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 1, ease: EASE, delay: 0.2 }}
        />
      </motion.div>
      <h2 className="display-title">
        <RevealWords text={title} />
      </h2>
    </div>
  );
};

/* ── Parallax hook ──────────────────────────────────────────────────────────── */
function useParallax(distance: number) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [distance, -distance]);
  return { ref, y, progress: scrollYProgress };
}

/* ── Full-bleed parallax image break ────────────────────────────────────────── */
const ImageBreak = ({ quote, position = "center", filter = "none" }: {
  quote: string; position?: string; filter?: string;
}) => {
  const { ref, y } = useParallax(80);
  return (
    <section ref={ref} className="relative h-[52vh] md:h-[68vh] overflow-hidden">
      <motion.div style={{ y }} className="absolute inset-x-0 -top-[18%] -bottom-[18%] will-change-transform">
        <img
          src="/bg.webp"
          alt=""
          aria-hidden
          className="w-full h-full object-cover"
          style={{ objectPosition: position, filter }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#060a08] via-[#060a08]/30 to-[#060a08]" />
      </motion.div>
      <div className="relative z-10 h-full flex items-center justify-center px-6">
        <p className="font-serif italic text-2xl md:text-4xl lg:text-[2.75rem] text-[#e9efe9]/90 text-center max-w-3xl leading-snug">
          <RevealWords text={quote} />
        </p>
      </div>
    </section>
  );
};

/* ── Count-up stat ──────────────────────────────────────────────────────────── */
const Stat = ({ value, suffix, label, idx }: { value: number; suffix?: string; label: string; idx: number }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const mv = useMotionValue(0);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView || value <= 0) return;
    const controls = animate(mv, value, {
      duration: 2, ease: EASE,
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
      <span className="font-serif text-4xl md:text-6xl text-[#e9efe9] tabular-nums">
        {display}{suffix}
      </span>
      <span className="font-mono text-[10px] md:text-[11px] tracking-[0.3em] uppercase text-[#8fa697]">
        {label}
      </span>
    </motion.div>
  );
};

/* ── Simplified bio reveal ──────────────────────────────────────────────────── */
const ScrollBio = ({ text }: { text: string }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const paragraphs = text.split(/\n+/).map(p => p.trim()).filter(Boolean);

  return (
    <div ref={ref} className="space-y-6">
      {paragraphs.map((para, pi) => (
        <motion.p
          key={pi}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: EASE, delay: pi * 0.15 }}
          className="text-lg md:text-2xl leading-relaxed text-[#e9efe9] font-light"
        >
          {para}
        </motion.p>
      ))}
    </div>
  );
};

/* ── Skill category block ───────────────────────────────────────────────────── */
const SkillCategory = ({ category, groupedSkills, idx }: { category: string; groupedSkills: any[]; idx: number }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.25 });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: EASE, delay: idx * 0.08 }}
      className="border-t border-white/[0.07] py-8 md:py-10 grid grid-cols-1 md:grid-cols-[220px_1fr] gap-5 md:gap-10"
    >
      <span className="font-mono text-[10px] md:text-[11px] tracking-[0.3em] uppercase text-[#8fa697] pt-1.5">
        {category}
      </span>
      <div className="flex flex-wrap gap-2.5">
        {groupedSkills.map((skill: any, i: number) => {
          const Icon = skillIconMap[skill.name.toLowerCase()] || FaServer;
          return (
            <motion.div
              key={skill.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.45, ease: EASE, delay: idx * 0.08 + i * 0.035 }}
              whileHover={{ y: -3 }}
              className="skill-chip group"
            >
              <Icon className="text-sm text-[#9db4a4] group-hover:text-[#e9efe9] transition-colors duration-300" />
              <span className="font-mono text-xs text-[#c3d2c7] group-hover:text-white transition-colors duration-300">
                {skill.name}
              </span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

/* ── Experience timeline ────────────────────────────────────────────────────── */
const ExperienceItem = ({ exp, idx }: { exp: any; idx: number }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  return (
    <div ref={ref} className="relative pl-10 md:pl-16 pb-14 md:pb-20 last:pb-0">
      {/* Node */}
      <motion.span
        className="absolute left-[-5px] md:left-[-5px] top-2 w-[11px] h-[11px] rounded-full border border-[#cfe3d4]/60 bg-[#060a08]"
        initial={{ scale: 0 }}
        animate={inView ? { scale: 1 } : {}}
        transition={{ type: "spring", stiffness: 320, damping: 18, delay: 0.1 }}
      >
        <span className="absolute inset-[2.5px] rounded-full bg-[#cfe3d4]/70" />
      </motion.span>

      <motion.div
        initial={{ opacity: 0, x: -28 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.75, ease: EASE, delay: idx * 0.05 }}
      >
        <span className="font-mono text-[10px] md:text-[11px] tracking-[0.25em] uppercase text-[#8fa697]">
          {exp.start_date} — {exp.currently_working ? "Present" : exp.end_date}
        </span>
        <h3 className="font-serif text-xl md:text-3xl text-[#e9efe9] mt-2 mb-1">{exp.role}</h3>
        <p className="text-sm md:text-base text-[#9db4a4] mb-4">{exp.company}</p>
        <p className="text-sm md:text-[15px] leading-relaxed text-[#a9baae] max-w-2xl">{exp.description}</p>
      </motion.div>
    </div>
  );
};

const ExperienceTimeline = ({ experience }: { experience: any[] }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.75", "end 0.65"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 26 });
  return (
    <div ref={ref} className="relative ml-1.5">
      <div className="absolute left-0 top-2 bottom-2 w-px bg-white/[0.07]" />
      <motion.div
        className="absolute left-0 top-2 bottom-2 w-px origin-top bg-gradient-to-b from-[#cfe3d4]/70 via-[#cfe3d4]/40 to-transparent"
        style={{ scaleY }}
      />
      {experience.map((exp, idx) => (
        <ExperienceItem key={exp.id} exp={exp} idx={idx} />
      ))}
    </div>
  );
};

/* ── Editorial project row ──────────────────────────────────────────────────── */
const ProjectRow = ({ project, idx, navigate }: { project: any; idx: number; navigate: any }) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const numY = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: EASE, delay: (idx % 2) * 0.08 }}
      onClick={() => navigate(`/projects/${project.slug}`)}
      className="project-row group relative border-t border-white/[0.07] last:border-b cursor-pointer overflow-hidden"
    >
      {/* Hover wash */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#cfe3d4]/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Parallax ghost number */}
      <motion.span
        style={{ y: numY }}
        className="absolute right-2 md:right-10 top-1/2 -translate-y-1/2 font-serif italic text-[6rem] md:text-[9rem] leading-none text-white/[0.035] select-none pointer-events-none"
      >
        {String(idx + 1).padStart(2, "0")}
      </motion.span>

      <div className="relative grid grid-cols-[auto_1fr_auto] items-center gap-4 md:gap-10 py-8 md:py-12 px-1 md:px-4">
        <span className="font-mono text-[10px] md:text-xs text-[#8fa697] tracking-[0.25em] self-start pt-2 md:pt-3">
          {String(idx + 1).padStart(2, "0")}
        </span>

        <div className="min-w-0">
          <h3 className="font-serif text-2xl md:text-5xl text-[#e9efe9] leading-tight mb-2 md:mb-3 transition-transform duration-500 group-hover:translate-x-2 md:group-hover:translate-x-4">
            {project.title}
          </h3>
          <p className="text-sm md:text-base text-[#94a89a] leading-relaxed max-w-xl transition-transform duration-500 group-hover:translate-x-2 md:group-hover:translate-x-4">
            {project.short_description}
          </p>
        </div>

        <div className="w-10 h-10 md:w-14 md:h-14 rounded-full border border-white/10 flex items-center justify-center shrink-0 transition-all duration-500 group-hover:border-[#cfe3d4]/50 group-hover:bg-[#cfe3d4]/10 group-hover:rotate-45">
          <FiArrowUpRight className="text-base md:text-xl text-[#9db4a4] group-hover:text-[#e9efe9] transition-colors duration-300" />
        </div>
      </div>
    </motion.div>
  );
};

/* ── Social link ────────────────────────────────────────────────────────────── */
const SocialLink = ({ link, idx }: { link: any; idx: number }) => {
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
      whileHover={{ y: -4 }}
      className="group flex items-center gap-3 px-6 py-3.5 rounded-full border border-white/[0.08] bg-white/[0.02] hover:border-[#cfe3d4]/40 hover:bg-[#cfe3d4]/[0.06] transition-colors duration-300"
    >
      <Icon className="text-base text-[#9db4a4] group-hover:text-[#e9efe9] transition-colors duration-300" />
      <span className="font-mono text-xs tracking-[0.2em] uppercase text-[#a9baae] group-hover:text-white transition-colors duration-300">
        {link.name}
      </span>
      <FiArrowUpRight className="text-xs text-[#6d8276] group-hover:text-[#cfe3d4] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
    </motion.a>
  );
};

/* ── Typed status line ──────────────────────────────────────────────────────── */
const StatusLine = () => {
  const full = "systems_online · llm stacks mounted · rag pipelines active";
  const [chars, setChars] = useState(0);
  useEffect(() => {
    if (chars >= full.length) return;
    const t = setTimeout(() => setChars(c => c + 1), 34);
    return () => clearTimeout(t);
  }, [chars, full.length]);
  return (
    <span className="font-mono text-[10px] md:text-xs tracking-[0.2em] text-[#8fa697]">
      <span className="text-[#cfe3d4]/80">&gt;</span> {full.slice(0, chars)}
      <span className="inline-block w-[6px] h-[1em] ml-1 bg-[#cfe3d4]/70 align-middle animate-[blink_1s_step-end_infinite]" />
    </span>
  );
};

/* ── Hero ───────────────────────────────────────────────────────────────────── */
const Hero = ({ onChat, projectCount }: { onChat: () => void; projectCount: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 180]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const contentScale = useTransform(scrollYProgress, [0, 1], [1, 0.94]);
  const scrimOpacity = useTransform(scrollYProgress, [0, 1], [0.25, 0.75]);

  return (
    <section ref={ref} id="hero" className="relative min-h-[100svh] flex flex-col items-center justify-center text-center px-6 overflow-hidden">
      {/* Deepening scrim as you scroll away */}
      <motion.div style={{ opacity: scrimOpacity }} className="absolute inset-0 bg-[#060a08] pointer-events-none" />
      {/* Bottom fade into the first panel */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-[#060a08] pointer-events-none" />

      <motion.div
        style={{ y: contentY, opacity: contentOpacity, scale: contentScale }}
        className="relative z-10 flex flex-col items-center will-change-transform"
      >

        {/* Name */}
        <h1 className="hero-name mt-12 md:mt-16" aria-label="Keval Parmar">
          <span className="block overflow-hidden pb-[0.06em]">
            <motion.span
              className="inline-block"
              initial={{ y: "105%" }}
              animate={{ y: 0 }}
              transition={{ duration: 1.1, ease: EASE, delay: 0.3 }}
            >
              Keval
            </motion.span>
          </span>
          <span className="block overflow-hidden pb-[0.12em] -mt-[0.18em]">
            <motion.span
              className="inline-block font-serif italic font-medium text-[#dfe9e0]"
              initial={{ y: "105%" }}
              animate={{ y: 0 }}
              transition={{ duration: 1.1, ease: EASE, delay: 0.45 }}
            >
              Parmar
            </motion.span>
          </span>
        </h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.8 }}
          className="mt-7 md:mt-9 max-w-xl text-sm md:text-lg leading-relaxed text-[#aebfb3] font-light"
        >
          I help founders and businesses integrate scalable AI, automate complex workflows, and build intelligent agents that deliver real-world ROI.
        </motion.p>

        {/* Status line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.15 }}
          className="mt-6"
        >
          <StatusLine />
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE, delay: 1.3 }}
          className="mt-9 md:mt-11 flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-xs sm:max-w-none sm:w-auto"
        >
          <button
            onClick={() => document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })}
            className="btn-ghost group"
          >
            View Projects{projectCount > 0 ? ` (${projectCount})` : ""}
            <FiArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
          </button>
          <button onClick={onChat} className="btn-solid group">
            <FaBrain className="text-sm opacity-80" />
            Chat with Portfolio
          </button>
        </motion.div>
      </motion.div>

    </section>
  );
};

/* ── Main ───────────────────────────────────────────────────────────────────── */
export default function Home() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [experience, setExperience] = useState<any[]>([]);
  const [about, setAbout] = useState<any>(null);
  const [socials, setSocials] = useState<any[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [, setRanking] = useState<any>(null);
  const [backendRecommendation, setBackendRecommendation] = useState<string | null>(null);
  const [dismissSuggestion, setDismissSuggestion] = useState(false);
  const [timeSpent, setTimeSpent] = useState<Record<string, number>>({
    about: 0, skills: 0, experience: 0, projects: 0, contact: 0,
  });
  const [currentView, setCurrentView] = useState("hero");
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);

  useEffect(() => {
    Promise.all([
      api.get("projects/"), api.get("skills/"), api.get("experience/"),
      api.get("about/"), api.get("socials/"),
    ]).then(([p, s, e, a, so]) => {
      setProjects(p.data); setSkills(s.data); setExperience(e.data);
      setAbout(a.data); setSocials(so.data);
    });

    api.get("ranking/").then(res => {
      setRanking(res.data);
      if (res.data?.data?.length > 0) setBackendRecommendation(res.data.data[0].section);
    }).catch(() => { });

    if (localStorage.getItem("dismissedAI")) setDismissSuggestion(true);
  }, []);

  useEffect(() => {
    const sections = ["about", "skills", "experience", "projects", "contact"];
    const elCache: Record<string, HTMLElement | null> = {};
    sections.forEach(id => { elCache[id] = document.getElementById(id); });
    const tick = () => {
      const scrollMid = window.scrollY + window.innerHeight / 2;
      let active = "";
      sections.forEach(id => {
        const el = elCache[id];
        if (el) {
          const top = window.scrollY + el.getBoundingClientRect().top;
          if (scrollMid >= top && scrollMid <= top + el.offsetHeight) active = id;
        }
      });
      if (active) {
        setCurrentView(active);
        setTimeSpent(prev => ({ ...prev, [active]: prev[active] + 1 }));
      } else setCurrentView("hero");
    };
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const mostViewed = Object.keys(timeSpent).reduce((a, b) => timeSpent[a] > timeSpent[b] ? a : b);
  const finalRecommendation = backendRecommendation && backendRecommendation !== currentView
    ? backendRecommendation : mostViewed;
  const showRecommendation =
    !dismissSuggestion && finalRecommendation && timeSpent[mostViewed] > 5 && currentView !== finalRecommendation;

  const handleDismiss = () => {
    setDismissSuggestion(true);
    localStorage.setItem("dismissedAI", "true");
  };

  const trendingProject = projects.length > 0
    ? [...projects].sort((a, b) => (b.views || 0) - (a.views || 0))[0]
    : null;

  const totalViews = projects.reduce((n, p) => n + (p.views || 0), 0);

  const groupedSkills = Object.entries(
    skills.reduce((acc: any, skill: any) => {
      acc[skill.category] = acc[skill.category] || [];
      acc[skill.category].push(skill);
      return acc;
    }, {})
  ) as [string, any[]][];

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

      {/* ── AI Insight Widget ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showRecommendation && (
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="fixed bottom-24 right-4 md:bottom-32 md:right-8 z-[90] max-w-[280px] md:max-w-xs"
          >
            <div className="insight-widget p-4 md:p-5 relative">
              <button
                onClick={handleDismiss}
                className="absolute top-2.5 right-2.5 text-[#6d8276] hover:text-white transition p-1"
              >
                <FaTimes size={10} />
              </button>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                  <FaBrain className="text-[#cfe3d4] text-xs animate-pulse" />
                </div>
                <span className="font-mono text-[9px] text-[#b9cec0] tracking-[0.2em] uppercase">AI_ANALYTICS</span>
              </div>
              <div
                className="cursor-pointer mb-3 pb-3 border-b border-white/5"
                onClick={() => document.getElementById(finalRecommendation)?.scrollIntoView({ behavior: "smooth" })}
              >
                <p className="text-xs text-[#8fa697] mb-1">Most explored section</p>
                <p className="text-sm text-white font-medium capitalize">{finalRecommendation} <span>↗</span></p>
              </div>
              {trendingProject && (
                <div className="cursor-pointer" onClick={() => navigate(`/projects/${trendingProject.slug}`)}>
                  <p className="text-xs text-[#8fa697] mb-1">Trending project</p>
                  <p className="text-sm text-white font-medium">{trendingProject.title} <span>↗</span></p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HERO (photo shows through from body bg) ───────────────────── */}
      <Hero onChat={() => setIsChatOpen(true)} projectCount={projects.length} />

      {/* ── SOLID PANEL: stats + about + skills ───────────────────────── */}
      <div className="relative z-10 bg-[#060a08]">

        {/* Stats strip */}
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/[0.06] border-b border-white/[0.06]">
            <Stat value={projects.length} label="Projects shipped" idx={0} />
            <Stat value={skills.length} suffix="+" label="Technologies" idx={1} />
            <Stat value={experience.length} label="Roles held" idx={2} />
            <Stat value={totalViews} label="Project views" idx={3} />
          </div>
        </div>

        {/* ── ABOUT ─────────────────────────────────────────────────── */}
        {about && (
          <section id="about" className="relative py-24 md:py-40 max-w-6xl mx-auto px-6 md:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-10 lg:gap-16">
              <div className="lg:sticky lg:top-32 h-fit">
                <SectionHeader index="01" eyebrow="about.me" title="About" className="mb-6 md:mb-8" />
                <p className="font-mono text-[11px] leading-relaxed tracking-wider text-[#7d9284] max-w-[240px]">
                  {about.headline}
                </p>
              </div>
              <ScrollBio text={about.bio} />
            </div>
          </section>
        )}

        {/* ── SKILLS ────────────────────────────────────────────────── */}
        <section id="skills" className="relative py-24 md:py-40">
          <div className="max-w-6xl mx-auto px-6 md:px-10">
            <SectionHeader index="02" eyebrow="tech.stack" title="Architecture Stack" />
            {groupedSkills.map(([category, group], idx) => (
              <SkillCategory key={category} category={category} groupedSkills={group} idx={idx} />
            ))}
          </div>
        </section>
      </div>

      {/* ── IMAGE BREAK ───────────────────────────────────────────────── */}
      <ImageBreak quote="Turning noise into signal, while the rest of the world sleeps." position="center 30%" />

      {/* ── SOLID PANEL: experience + projects ────────────────────────── */}
      <div className="relative z-10 bg-[#060a08]">

        {/* ── EXPERIENCE ────────────────────────────────────────────── */}
        <section id="experience" className="relative py-24 md:py-40 max-w-6xl mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-10 lg:gap-16">
            <div className="lg:sticky lg:top-32 h-fit">
              <SectionHeader index="03" eyebrow="client.engagements" title="Experience" className="mb-6 md:mb-8" />
              <p className="font-mono text-[11px] leading-relaxed tracking-wider text-[#7d9284] max-w-[240px]">
                Where the systems thinking was forged.
              </p>
            </div>
            <ExperienceTimeline experience={experience} />
          </div>
        </section>

        {/* ── PROJECTS ──────────────────────────────────────────────── */}
        <section id="projects" className="relative py-24 md:py-40 max-w-6xl mx-auto px-6 md:px-10">
          <SectionHeader index="04" eyebrow="case.studies" title="Selected Work" />
          <div>
            {projects.map((project, idx) => (
              <ProjectRow key={project.id} project={project} idx={idx} navigate={navigate} />
            ))}
          </div>
        </section>
      </div>

      {/* ── IMAGE BREAK ───────────────────────────────────────────────── */}
      <ImageBreak
        quote="Code is a creative medium — the terminal is just where it starts."
        position="center 70%"
        filter="brightness(0.85) saturate(0.9)"
      />

      {/* ── SOLID PANEL: AI Search Context (SEO) ────────────────────────── */}
      <div className="relative z-10 bg-[#060a08]">
        <section id="ai-context" className="relative py-16 md:py-24 max-w-4xl mx-auto px-6 md:px-10 border-t border-white/[0.06]">
          <SectionHeader index="05" eyebrow="client.faq" title="Freelance AI Architect" className="mb-6 md:mb-10" />
          <article className="prose prose-invert prose-sm md:prose-base max-w-none text-[#94a89a] font-light space-y-6">
            <p>
              Welcome to the digital nervous system of <strong>Keval Parmar</strong>, an independent <strong>AI Architect and Engineer</strong>.
              This platform isn't just a static display; it serves as a live demonstration of the scalable infrastructure and intelligent design
              I bring to client engagements. Whether you need custom LLM integrations, agentic workflows, or end-to-end full-stack
              development, this portfolio highlights how complex technical problems are solved with robust architectures.
            </p>
            <div className="mt-12 space-y-4">
              {[
                {
                  q: "What is your typical engagement model?",
                  a: <>I partner directly with founders and product teams. Depending on the scale of the challenge, engagements range from <strong>architecture scoping</strong> and technical consulting, to hands-on <strong>freelance development</strong> where I build and deploy scalable AI products (like custom RAG pipelines or intelligent agents) directly into your existing infrastructure.</>
                },
                {
                  q: "Do you handle full-stack or just AI?",
                  a: <>Both. Delivering a successful AI product requires a seamless connection between the model and the user interface. My expertise spans modern frontends (React, Tailwind) and robust backends (Django, FastAPI), ensuring that the machine learning models I integrate are packaged in highly aesthetic and reliable applications.</>
                },
                {
                  q: "How do we get started?",
                  a: <>The best way is to reach out via the <strong className="text-[#cfe3d4]">Collaborate</strong> page. We will begin with a brief scoping conversation to align on architecture, timelines, and business goals before any code is written.</>
                }
              ].map((faq, idx) => {
                const isOpen = openFAQ === idx;
                return (
                  <div key={idx} className={`border border-white/[0.06] bg-white/[0.02] backdrop-blur-md rounded-2xl overflow-hidden transition-all duration-500 ${isOpen ? 'border-[#cfe3d4]/30 bg-white/[0.04]' : 'hover:border-white/[0.12] hover:bg-white/[0.03]'}`}>
                    <button
                      onClick={() => setOpenFAQ(isOpen ? null : idx)}
                      className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 cursor-pointer"
                    >
                      <h3 className={`font-serif text-lg md:text-xl transition-colors duration-300 m-0 ${isOpen ? 'text-[#cfe3d4]' : 'text-[#e9efe9]'}`}>
                        {faq.q}
                      </h3>
                      <motion.div
                        initial={false}
                        animate={{ rotate: isOpen ? 0 : 45 }}
                        className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center shrink-0"
                      >
                        <FaTimes className="text-sm text-[#9db4a4]" />
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
                          <div className="px-6 pb-6 pt-2 text-[#94a89a] text-sm leading-relaxed border-t border-white/[0.03] mt-2">
                            {faq.a}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </article>
        </section>
      </div>

      {/* ── SOLID PANEL: contact + footer ──────────────────────────────── */}
      <div className="relative z-10 bg-[#060a08]">
        <section id="contact" className="relative py-24 md:py-40 max-w-6xl mx-auto px-6 md:px-10 text-center">
          <SectionHeader index="06" eyebrow="get.in.touch" title="Let's build what's next" className="[&_h2]:mx-auto" />

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="text-[#94a89a] text-sm md:text-lg mb-12 md:mb-16 max-w-lg mx-auto font-light -mt-6 md:-mt-12"
          >
            Currently accepting new freelance projects, technical consulting engagements, and architecture design work.
          </motion.p>

          <div className="flex flex-wrap justify-center gap-3 md:gap-4">
            {socials.map((link: any, idx: number) => (
              <SocialLink key={link.id} link={link} idx={idx} />
            ))}
          </div>

        </section>

        <footer className="relative z-10 py-8 text-center border-t border-white/[0.06]">
          <p className="font-mono text-[#5f7266] text-xs tracking-[0.2em] flex items-center justify-center gap-3">
            <span>© 2026 KEVAL_PARMAR</span>
            <span className="w-1 h-1 rounded-full bg-white/10" />
            <span>POWERED_BY_AI</span>
          </p>
          <span className="decal-easter-egg text-[10px] sm:text-xs">
            "to automate and overwrite..."
          </span>
        </footer>
      </div>

      {/* ── Floating Chat Button ───────────────────────────────────────── */}
      <AnimatePresence>
        {!isChatOpen && (
          <motion.button
            key="floating-chat-btn"
            onClick={() => setIsChatOpen(true)}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[85] w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#cfe3d4]/10 border border-[#cfe3d4]/20 backdrop-blur-md flex items-center justify-center hover:bg-[#cfe3d4]/20 hover:border-[#cfe3d4]/40 hover:scale-110 transition-all shadow-2xl group cursor-pointer"
            aria-label="Open AI Chat"
          >
            <div className="absolute inset-0 rounded-full border border-[#cfe3d4]/30 animate-ping opacity-40" />
            <FiMessageSquare className="text-[#cfe3d4] text-xl md:text-2xl group-hover:scale-110 transition-transform" />
          </motion.button>
        )}
      </AnimatePresence>

      <ChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&family=Dancing+Script:wght@600&display=swap');

        * { box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        .font-serif { font-family: 'Playfair Display', serif; }
        .custom-cursor-wrapper * { cursor: none !important; }

        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }

        /* ── Hero name ─────────────────────────────────────────────── */
        .hero-name {
          font-family: 'Inter', sans-serif;
          font-weight: 500;
          font-size: clamp(3.4rem, 12vw, 9rem);
          line-height: 1.02;
          letter-spacing: -0.035em;
          color: #f2f6f2;
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
          color: #e9efe9;
        }

        /* ── Buttons ───────────────────────────────────────────────── */
        .btn-solid {
          display: inline-flex; align-items: center; justify-content: center; gap: 0.6rem;
          padding: 0.9rem 2.1rem; border-radius: 9999px;
          background: #e9efe9; color: #0a0f0d;
          font-size: 0.875rem; font-weight: 500; border: none;
          transition: background 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
        }
        .btn-solid:hover {
          background: #cfe3d4;
          box-shadow: 0 8px 40px rgba(207,227,212,0.18);
          transform: translateY(-1px);
        }
        .btn-ghost {
          display: inline-flex; align-items: center; justify-content: center; gap: 0.6rem;
          padding: 0.9rem 2.1rem; border-radius: 9999px;
          background: rgba(255,255,255,0.03); color: #dfe9e0;
          border: 1px solid rgba(255,255,255,0.14);
          font-size: 0.875rem; font-weight: 500;
          backdrop-filter: blur(12px);
          transition: border-color 0.3s ease, background 0.3s ease, transform 0.3s ease;
        }
        .btn-ghost:hover {
          border-color: rgba(207,227,212,0.45);
          background: rgba(207,227,212,0.06);
          transform: translateY(-1px);
        }

        /* ── Skill chip ────────────────────────────────────────────── */
        .skill-chip {
          display: inline-flex; align-items: center; gap: 0.6rem;
          padding: 0.6rem 1.1rem; border-radius: 9999px;
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          transition: border-color 0.3s ease, background 0.3s ease, box-shadow 0.3s ease;
        }
        .skill-chip:hover {
          border-color: rgba(207,227,212,0.4);
          background: rgba(207,227,212,0.05);
          box-shadow: 0 6px 24px rgba(0,0,0,0.35);
        }

        /* ── Project rows ──────────────────────────────────────────── */
        .project-row { transition: background 0.4s ease; }

        /* ── AI insight widget ─────────────────────────────────────── */
        .insight-widget {
          border-radius: 1rem;
          background: rgba(10, 15, 13, 0.75);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.1);
          box-shadow: 0 8px 32px rgba(0,0,0,0.5);
        }

        /* ── Easter egg decal ──────────────────────────────────────── */
        .decal-easter-egg {
          font-family: 'Dancing Script', cursive;
          letter-spacing: 0.08em;
          font-size: 1.1rem;
          color: rgba(255, 255, 255, 0.4);
          mix-blend-mode: overlay;
          text-shadow: 1px 1px 1px rgba(0,0,0,0.1), -1px -1px 1px rgba(255,255,255,0.2);
          cursor: crosshair;
          transition: all 0.4s ease-in-out;
        }
        .decal-easter-egg:hover {
          color: rgba(220, 38, 38, 0.9);
          mix-blend-mode: normal;
          text-shadow: 0 0 12px rgba(220, 38, 38, 0.6);
        }

      `}</style>
    </motion.div>
  );
}
