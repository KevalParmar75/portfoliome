import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence, useInView, useMotionValue, useSpring, useTransform } from "framer-motion";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import type { Engine } from "tsparticles-engine";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ChatModal from "../components/ChatModal";
import api from "../api/axios";
import LiquidGlassCursor from "../components/LiquidGlassCursor";
import {
  SiPython, SiDjango, SiMongodb, SiReact, SiTailwindcss, SiDocker,
  SiOpenai, SiFastapi, SiHtml5, SiCss3, SiJavascript, SiTypescript,
  SiGithub, SiLinkedin, SiInstagram, SiGmail, SiFlask, SiHuggingface, SiStreamlit
} from "react-icons/si";
import { FaServer, FaGlobe, FaLink, FaProjectDiagram, FaBrain, FaTimes, FaTerminal, FaCode } from "react-icons/fa";

const skillIconMap: Record<string, any> = {
  python: SiPython, django: SiDjango, mongodb: SiMongodb, html: SiHtml5,
  css: SiCss3, javascript: SiJavascript, typescript: SiTypescript, react: SiReact,
  tailwindcss: SiTailwindcss, "git / github": SiGithub, docker: SiDocker,
  openai: SiOpenai, fastapi: SiFastapi, flask: SiFlask, streamlit: SiStreamlit,
  "hugging face": SiHuggingface, langchain: FaLink, langgraph: FaProjectDiagram,
  "rag (retrieval-augmented generation)": FaBrain
};

const socialIconMap: Record<string, any> = {
  github: SiGithub, linkedin: SiLinkedin, instagram: SiInstagram,
  gmail: SiGmail, email: SiGmail, website: FaGlobe,
};

// ─── Plasma Blob ────────────────────────────────────────────────────────────────
const PlasmaBlob = ({ blob }: { blob: any }) => (
  <div
    className={`plasma ${blob.color}`}
    style={{ width: blob.size, height: blob.size, top: blob.top, left: blob.left, animationDelay: `${blob.delay}s` }}
  />
);


// ─── Terminal Typewriter ────────────────────────────────────────────────────────
const Typewriter = ({ lines, className = "" }: { lines: string[]; className?: string }) => {
  const [displayed, setDisplayed] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (done) return;
    if (currentLine >= lines.length) { setDone(true); return; }
    const line = lines[currentLine];
    if (currentChar < line.length) {
      const t = setTimeout(() => setCurrentChar(c => c + 1), 28);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => {
        setDisplayed(prev => [...prev, line]);
        setCurrentLine(l => l + 1);
        setCurrentChar(0);
      }, 350);
      return () => clearTimeout(t);
    }
  }, [currentChar, currentLine, done, lines]);

  const activeLine = currentLine < lines.length ? lines[currentLine].slice(0, currentChar) : "";

  return (
    <div className={`font-mono text-xs md:text-sm ${className}`}>
      {displayed.map((l, i) => (
        <div key={i} className="text-emerald-400/70">{l}</div>
      ))}
      {!done && (
        <div className="flex items-center gap-1 text-emerald-300">
          <span>{activeLine}</span>
          <span className="w-[2px] h-[1em] bg-emerald-400 inline-block animate-[blink_1s_step-end_infinite]" />
        </div>
      )}
    </div>
  );
};

// ─── Section Title ──────────────────────────────────────────────────────────────
const SectionTitle = ({ children, sub, className = "" }: { children: string; sub?: string; className?: string }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const words = children.split(" ");

  return (
    <div ref={ref} className={`mb-12 md:mb-20 ${className}`}>
      <div className="flex items-center gap-3 mb-3">
        <span className="h-px flex-1 max-w-[40px] md:max-w-[60px] bg-gradient-to-r from-transparent to-cyan-500/60" />
        <span className="text-[10px] md:text-xs font-mono text-cyan-400/70 tracking-[0.25em] uppercase">
          {sub || "section"}
        </span>
        <span className="h-px flex-1 bg-gradient-to-l from-transparent to-cyan-500/60 max-w-[40px] md:max-w-[60px]" />
      </div>
      <h2 className="section-title text-center" aria-label={children}>
        {words.map((word, wi) => (
          <span key={wi} className="inline-block overflow-hidden mr-[0.3em]">
            <motion.span
              className="inline-block"
              initial={{ y: "110%", opacity: 0 }}
              animate={inView ? { y: 0, opacity: 1 } : {}}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: wi * 0.12 }}
            >
              {word}
            </motion.span>
          </span>
        ))}
      </h2>
    </div>
  );
};

// ─── Skill Card ─────────────────────────────────────────────────────────────────
const SkillCard = ({ skill, idx }: { skill: any; idx: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const Icon = skillIconMap[skill.name.toLowerCase()] || FaServer;

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [6, -6]), { stiffness: 300, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-6, 6]), { stiffness: 300, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const handleMouseLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.8, y: 16 }}
      animate={inView ? { opacity: 1, scale: 1, y: 0 } : {}}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: idx * 0.035 }}
      className="group"
      style={{ perspective: 600 }}
    >
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      >
        {/* Glow behind card */}
        <div className="absolute inset-0 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-cyan-500/30 to-violet-500/30" />
        <div className="relative skill-card px-4 py-3 md:px-5 md:py-3.5 flex items-center gap-3 group-hover:border-cyan-400/50 transition-all duration-300">
          <div className="skill-icon-wrap">
            <Icon className="text-base md:text-lg text-cyan-400 group-hover:text-white transition" />
          </div>
          <span className="font-mono text-xs md:text-sm text-gray-300 tracking-wide group-hover:text-white transition whitespace-nowrap">
            {skill.name}
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Project Card ────────────────────────────────────────────────────────────────
const ProjectCard = ({ project, idx, navigate }: { project: any; idx: number; navigate: any }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: idx * 0.1 }}
      className="group project-card cursor-pointer flex flex-col h-full relative overflow-hidden"
      onClick={() => navigate(`/projects/${project.slug}`)}
    >
      {/* Top edge accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Number watermark */}
      <div className="absolute top-5 right-5 font-mono text-[4rem] md:text-[5rem] font-black leading-none text-white/[0.03] select-none pointer-events-none">
        {String(idx + 1).padStart(2, "0")}
      </div>

      {/* Tag */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.8)]" />
        <span className="font-mono text-[10px] text-cyan-400/70 tracking-[0.2em] uppercase">Project_{String(idx + 1).padStart(2, "0")}</span>
      </div>

      <h3 className="text-lg md:text-xl font-semibold mb-3 text-white group-hover:text-cyan-200 transition-colors duration-300">{project.title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-grow">{project.short_description}</p>

      <div className="flex items-center gap-2 text-cyan-400 text-sm font-mono group-hover:gap-3 transition-all duration-300">
        <span>explore_project</span>
        <span className="opacity-60">→</span>
      </div>
    </motion.div>
  );
};

// ─── Experience Card ─────────────────────────────────────────────────────────────
const ExperienceCard = ({ exp, idx }: { exp: any; idx: number }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <div ref={ref} className="flex gap-4 md:gap-6">
      <div className="flex flex-col items-center shrink-0">
        <motion.div
          className="w-2.5 h-2.5 rounded-full bg-cyan-400 mt-2 shrink-0 shadow-[0_0_10px_rgba(34,211,238,0.9)]"
          initial={{ scale: 0 }}
          animate={inView ? { scale: 1 } : {}}
          transition={{ delay: idx * 0.2 + 0.1, type: "spring", stiffness: 400 }}
        />
        <motion.div
          className="w-px bg-gradient-to-b from-cyan-400/50 to-transparent flex-grow mt-1"
          initial={{ scaleY: 0, originY: 0 }}
          animate={inView ? { scaleY: 1 } : {}}
          transition={{ delay: idx * 0.2 + 0.3, duration: 0.8 }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, x: -24 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: idx * 0.2 }}
        className="glass-card p-5 md:p-7 flex-grow mb-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 mb-1">
          <h3 className="text-base md:text-lg font-semibold text-white">{exp.role}</h3>
          <span className="font-mono text-[10px] text-gray-500 shrink-0 pt-0.5">
            {exp.start_date} — {exp.currently_working ? "Present" : exp.end_date}
          </span>
        </div>
        <p className="text-cyan-400 text-sm mb-3">{exp.company}</p>
        <p className="text-gray-400 text-sm leading-relaxed">{exp.description}</p>
      </motion.div>
    </div>
  );
};

// ─── Social Icon ──────────────────────────────────────────────────────────────────
const SocialIcon = ({ link, idx }: { link: any; idx: number }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const Icon = socialIconMap[link.name.toLowerCase()] || FaGlobe;

  return (
    <motion.a
      ref={ref}
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: idx * 0.07, type: "spring", stiffness: 260, damping: 18 }}
      whileHover={{ y: -6, scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="group relative"
    >
      <div className="absolute inset-0 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-cyan-500/40 to-violet-500/40" />
      <div className="relative social-card flex flex-col items-center justify-center gap-2.5 group-hover:border-cyan-400/50 transition-all duration-300">
        <Icon className="text-xl md:text-2xl text-cyan-400 group-hover:text-white transition" />
        <span className="font-mono text-[10px] md:text-xs text-gray-400 group-hover:text-white tracking-widest uppercase">{link.name}</span>
      </div>
    </motion.a>
  );
};

// ─── Hero Name ────────────────────────────────────────────────────────────────────
const HeroName = ({ name }: { name: string }) => {
  const words = name.split(" ");
  let globalCharIdx = 0;

  return (
    <motion.h1
      className="hero-name flex flex-wrap justify-center gap-x-[0.25em] gap-y-1"
      aria-label={name}
      // z-index ensures cursor never covers text
      style={{ position: "relative", zIndex: 10 }}
    >
      {words.map((word, wordIdx) => (
        <span key={wordIdx} className="inline-flex whitespace-nowrap">
          {word.split("").map((char) => {
            const idx = globalCharIdx++;
            return (
              <motion.span
                key={idx}
                className="inline-block"
                initial={{ opacity: 0, y: 60, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.3 + idx * 0.038 }}
              >
                {char}
              </motion.span>
            );
          })}
        </span>
      ))}
    </motion.h1>
  );
};

// ─── Skill Category ───────────────────────────────────────────────────────────────
const SkillCategory = ({ category, groupedSkills }: { category: string; groupedSkills: any[] }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <div className="mb-12 md:mb-16" ref={ref}>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-3 mb-6 md:mb-8"
      >
        <span className="text-[9px] md:text-[10px] font-mono text-violet-400/80 tracking-[0.3em] uppercase">{category}</span>
        <span className="h-px flex-grow bg-gradient-to-r from-violet-500/40 to-transparent" />
      </motion.div>
      <div className="flex flex-wrap gap-2.5 md:gap-3">
        {groupedSkills.map((skill: any, idx: number) => (
          <SkillCard key={skill.id} skill={skill} idx={idx} />
        ))}
      </div>
    </div>
  );
};

// ─── Grid lines background ────────────────────────────────────────────────────────
const GridLines = () => (
  <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.025]"
    style={{
      backgroundImage: `linear-gradient(rgba(34,211,238,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.6) 1px, transparent 1px)`,
      backgroundSize: "60px 60px"
    }}
  />
);

// ─── Particles ────────────────────────────────────────────────────────────────────
const PARTICLES_OPTIONS = {
  background: { color: "transparent" },
  fpsLimit: 30,
  particles: {
    color: { value: ["#22d3ee", "#818cf8", "#ffffff"] },
    move: { enable: true, speed: 0.1 },
    number: { value: 18 },
    opacity: { value: 0.12 },
    size: { value: { min: 0.5, max: 1.5 } },
    links: { enable: true, distance: 140, color: "#22d3ee", opacity: 0.04, width: 1 },
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

// ─── Main ─────────────────────────────────────────────────────────────────────────
export default function Home() {
  const navigate = useNavigate();

  const [projects, setProjects]     = useState<any[]>([]);
  const [skills, setSkills]         = useState<any[]>([]);
  const [experience, setExperience] = useState<any[]>([]);
  const [about, setAbout]           = useState<any>(null);
  const [socials, setSocials]       = useState<any[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [, setRanking]       = useState<any>(null);
  const [backendRecommendation, setBackendRecommendation] = useState<string | null>(null);
  const [dismissSuggestion, setDismissSuggestion]         = useState(false);
  const [timeSpent, setTimeSpent] = useState<Record<string, number>>({
    about: 0, skills: 0, experience: 0, projects: 0, contact: 0,
  });
  const [currentView, setCurrentView] = useState("hero");

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
    }).catch(() => {});

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

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
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

  const TERMINAL_LINES = [
    "> initializing neural stack...",
    "> loading LLM architectures ✓",
    "> mounting RAG pipelines ✓",
    "> status: systems_online",
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="relative min-h-screen bg-[#080b10] text-white overflow-hidden custom-cursor-wrapper"
    >
      <LiquidGlassCursor />
      <Navbar />
      <GridLines />

      {/* Plasma blobs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {BLOBS.map((blob, idx) => <PlasmaBlob key={idx} blob={blob} />)}
      </div>

      <Particles init={particlesInit} options={PARTICLES_OPTIONS} className="absolute inset-0 -z-10" />

      {/* ── AI Insight Widget ───────────────────────────────────────────── */}
      <AnimatePresence>
        {showRecommendation && (
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="fixed bottom-5 right-4 md:bottom-8 md:right-8 z-[90] max-w-[280px] md:max-w-xs"
          >
            <div className="insight-widget p-4 md:p-5 relative">
              <button
                onClick={handleDismiss}
                className="absolute top-2.5 right-2.5 text-gray-600 hover:text-white transition p-1"
              >
                <FaTimes size={10} />
              </button>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                  <FaBrain className="text-cyan-400 text-xs animate-pulse" />
                </div>
                <span className="font-mono text-[9px] text-cyan-400 tracking-[0.2em] uppercase">AI_ANALYTICS</span>
              </div>
              <div
                className="cursor-pointer mb-3 pb-3 border-b border-white/5"
                onClick={() => document.getElementById(finalRecommendation)?.scrollIntoView({ behavior: "smooth" })}
              >
                <p className="text-xs text-gray-400 mb-1">Most explored section</p>
                <p className="text-sm text-white font-medium capitalize">{finalRecommendation} <span className="text-cyan-400">↗</span></p>
              </div>
              {trendingProject && (
                <div className="cursor-pointer" onClick={() => navigate(`/projects/${trendingProject.slug}`)}>
                  <p className="text-xs text-gray-400 mb-1">Trending project</p>
                  <p className="text-sm text-white font-medium">{trendingProject.title} <span className="text-violet-400">↗</span></p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Glass Tile ─────────────────────────────────────────────── */}
      <main className="relative z-10 m-3 sm:m-4 md:m-6 rounded-[2rem] md:rounded-[2.5rem] bg-black/40 backdrop-blur-[60px] border border-white/[0.07] shadow-[0_20px_80px_rgba(0,0,0,0.6),inset_0_0_40px_rgba(255,255,255,0.02)] pb-10">

        {/* ── HERO ──────────────────────────────────────────────────────── */}
        <section id="hero" className="relative min-h-[100svh] flex flex-col items-center justify-center text-center pt-24 pb-16 px-6">
          <HeroName name="Keval Parmar" />

          {/* Role line */}
          <motion.div
            initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.85, duration: 0.7 }}
            className="mt-5 md:mt-7 flex flex-wrap justify-center items-center gap-2 md:gap-3"
          >
            {["AI Systems Engineer", "LLM Architect", "RAG Specialist"].map((tag, i) => (
              <span key={i} className="role-tag">
                {i > 0 && <span className="text-gray-600 mr-2 hidden md:inline">/</span>}
                {tag}
              </span>
            ))}
          </motion.div>

          {/* Terminal widget */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.6 }}
            className="mt-8 md:mt-10 w-full max-w-sm md:max-w-md"
          >
            <div className="terminal-widget">
              <div className="terminal-header">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                </div>
                <span className="font-mono text-[10px] text-gray-600">keval@neural-stack:~</span>
              </div>
              <div className="p-4">
                <Typewriter lines={TERMINAL_LINES} />
              </div>
            </div>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3, duration: 0.6 }}
            className="mt-8 md:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-xs sm:max-w-none sm:w-auto"
          >
            <motion.button
              onClick={() => document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })}
              className="cta-secondary w-full sm:w-auto"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <FaCode className="text-sm" />
              View Projects
            </motion.button>
            <motion.button
              onClick={() => setIsChatOpen(true)}
              className="cta-primary w-full sm:w-auto"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <FaBrain className="text-sm" />
              Chat with Portfolio
            </motion.button>
          </motion.div>
        </section>

        {/* ── ABOUT ─────────────────────────────────────────────────────── */}
        {about && (
          <section id="about" className="relative z-10 py-20 md:py-32 max-w-4xl mx-auto px-1 sm:px-4">
            <SectionTitle sub="about.me">About</SectionTitle>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="glass-card p-6 md:p-10"
            >
              <div className="flex items-start gap-3 mb-5 md:mb-6">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <FaTerminal className="text-cyan-400 text-xs" />
                </div>
                <h3 className="text-base md:text-lg text-cyan-300 font-mono">{about.headline}</h3>
              </div>
              <p className="text-gray-400 leading-relaxed whitespace-pre-line text-sm md:text-[15px]">
                {about.bio}
              </p>
            </motion.div>
          </section>
        )}

        {/* ── SKILLS ────────────────────────────────────────────────────── */}
        <section id="skills" className="relative z-10 py-20 md:py-32 max-w-6xl mx-auto px-1 sm:px-4">
          <SectionTitle sub="tech.stack">Architecture Stack</SectionTitle>

          {Object.entries(
            skills.reduce((acc: any, skill: any) => {
              acc[skill.category] = acc[skill.category] || [];
              acc[skill.category].push(skill);
              return acc;
            }, {})
          ).map(([category, groupedSkills]: any) => (
            <SkillCategory key={category} category={category} groupedSkills={groupedSkills} />
          ))}
        </section>

        {/* ── EXPERIENCE ────────────────────────────────────────────────── */}
        <section id="experience" className="relative z-10 py-20 md:py-32 max-w-3xl mx-auto px-1 sm:px-4">
          <SectionTitle sub="work.history">Experience</SectionTitle>
          <div className="space-y-2">
            {experience.map((exp, idx) => (
              <ExperienceCard key={exp.id} exp={exp} idx={idx} />
            ))}
          </div>
        </section>

        {/* ── PROJECTS ──────────────────────────────────────────────────── */}
        <section id="projects" className="relative z-10 py-20 md:py-32 max-w-5xl mx-auto px-1 sm:px-4">
          <SectionTitle sub="work.showcase">Projects</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {projects.map((project, idx) => (
              <ProjectCard key={project.id} project={project} idx={idx} navigate={navigate} />
            ))}
          </div>
        </section>

        {/* ── CONTACT ───────────────────────────────────────────────────── */}
        <section id="contact" className="relative z-10 py-20 md:py-32 max-w-4xl mx-auto px-1 sm:px-4 text-center">
          <SectionTitle sub="get.in.touch">Connect</SectionTitle>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-gray-400 text-sm md:text-base mb-10 md:mb-14 max-w-lg mx-auto"
          >
            Open to collaborations, research projects, and building the next generation of intelligent systems.
          </motion.p>

          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            {socials.map((link: any, idx: number) => (
              <SocialIcon key={link.id} link={link} idx={idx} />
            ))}
          </div>
        </section>
      </main>

      <ChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      <footer className="relative z-10 py-8 text-center">
        <p className="font-mono text-gray-600 text-xs tracking-[0.2em] flex items-center justify-center gap-3">
          <span>© 2026 KEVAL_PARMAR</span>
          <span className="w-1 h-1 rounded-full bg-cyan-500/40" />
          <span>POWERED_BY_AI</span>
        </p>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&family=Syne:wght@400;500;600;700;800&display=swap');
        @import url('https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&display=swap');

        * { box-sizing: border-box; }

        body { font-family: 'Syne', sans-serif; }
        .font-mono { font-family: 'Space Mono', monospace; }

        .custom-cursor-wrapper * { cursor: none !important; }

        :root {
          --cyan: #22d3ee;
          --violet: #818cf8;
          --indigo: #6366f1;
          --bg: #080b10;
        }

        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }

        /* ── Hero name ─────────────────────────────────────────────── */
        .hero-name {
          font-family: 'ClashDisplay-Variable', 'Clash Display', 'Syne', 'Segoe UI', system-ui, sans-serif;
          font-weight: 800;
          font-size: clamp(3rem, 11vw, 8rem);
          line-height: 1.0;
          letter-spacing: -0.03em;
          color: #ffffff;
          text-shadow: 0 0 60px rgba(34,211,238,0.35), 0 0 120px rgba(129,140,248,0.2);
          position: relative;
          z-index: 10;
        }

        /* ── Role tags ─────────────────────────────────────────────── */
        .role-tag {
          font-family: 'Space Mono', monospace;
          font-size: 0.65rem;
          color: rgba(148,163,184,0.8);
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }
        @media (min-width: 640px) { .role-tag { font-size: 0.7rem; } }

        /* ── Section title ─────────────────────────────────────────── */
        .section-title {
          font-family: 'ClashDisplay-Variable', 'Clash Display', 'Syne', 'Segoe UI', system-ui, sans-serif;
          font-weight: 900;
          font-size: clamp(2rem, 5vw, 3.2rem);
          letter-spacing: -0.02em;
          color: #e2e8f0;
        }

        /* ── Glass cards ───────────────────────────────────────────── */
        .glass-card {
          border-radius: 1.25rem;
          background: rgba(15, 23, 35, 0.7);
          backdrop-filter: blur(30px);
          -webkit-backdrop-filter: blur(30px);
          border: 1px solid rgba(255,255,255,0.06);
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }
        .glass-card:hover {
          border-color: rgba(34,211,238,0.15);
          box-shadow: 0 0 40px rgba(34,211,238,0.06);
        }

        /* ── Project card ──────────────────────────────────────────── */
        .project-card {
          border-radius: 1.25rem;
          padding: 1.5rem;
          background: rgba(15, 23, 35, 0.7);
          backdrop-filter: blur(30px);
          -webkit-backdrop-filter: blur(30px);
          border: 1px solid rgba(255,255,255,0.06);
          transition: border-color 0.35s ease, box-shadow 0.35s ease, transform 0.35s ease;
        }
        @media (min-width: 768px) { .project-card { padding: 2rem; } }
        .project-card:hover {
          border-color: rgba(34,211,238,0.2);
          box-shadow: 0 16px 50px rgba(34,211,238,0.08), 0 0 0 1px rgba(34,211,238,0.05);
          transform: translateY(-4px);
        }

        /* ── Skill card ────────────────────────────────────────────── */
        .skill-card {
          border-radius: 0.875rem;
          background: rgba(15, 23, 35, 0.8);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.07);
          transition: all 0.25s ease;
        }
        .skill-icon-wrap {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          background: rgba(34,211,238,0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        /* ── Social card ───────────────────────────────────────────── */
        .social-card {
          width: 90px;
          height: 90px;
          border-radius: 1.25rem;
          background: rgba(15, 23, 35, 0.8);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.07);
          transition: all 0.3s ease;
        }
        @media (min-width: 768px) { .social-card { width: 108px; height: 108px; } }

        /* ── Terminal ──────────────────────────────────────────────── */
        .terminal-widget {
          border-radius: 0.875rem;
          background: rgba(8, 12, 18, 0.9);
          border: 1px solid rgba(34,211,238,0.12);
          overflow: hidden;
          box-shadow: 0 0 30px rgba(34,211,238,0.05);
        }
        .terminal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.625rem 0.875rem;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          background: rgba(0,0,0,0.3);
        }

        /* ── CTAs ──────────────────────────────────────────────────── */
        .cta-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1.75rem;
          border-radius: 0.75rem;
          background: linear-gradient(135deg, rgba(34,211,238,0.9), rgba(99,102,241,0.9));
          color: white;
          font-size: 0.875rem;
          font-weight: 600;
          letter-spacing: 0.01em;
          border: none;
          transition: box-shadow 0.3s ease;
        }
        .cta-primary:hover {
          box-shadow: 0 0 30px rgba(34,211,238,0.4), 0 0 60px rgba(34,211,238,0.15);
        }

        .cta-secondary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1.75rem;
          border-radius: 0.75rem;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.85);
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }
        .cta-secondary:hover {
          border-color: rgba(34,211,238,0.4);
          color: white;
          box-shadow: 0 0 20px rgba(34,211,238,0.1);
        }

        /* ── AI insight widget ─────────────────────────────────────── */
        .insight-widget {
          border-radius: 1rem;
          background: rgba(8, 12, 20, 0.92);
          backdrop-filter: blur(30px);
          border: 1px solid rgba(34,211,238,0.15);
          box-shadow: 0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(34,211,238,0.05);
        }

        /* ── Plasma blobs ──────────────────────────────────────────── */
        .plasma {
          position: absolute;
          filter: blur(80px);
          opacity: 0.12;
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