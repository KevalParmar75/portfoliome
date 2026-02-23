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
import { FaServer, FaGlobe, FaLink, FaProjectDiagram, FaBrain, FaTimes } from "react-icons/fa";

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

// ─── Plasma Blob (unchanged, CSS-driven = zero JS cost) ───────────────────────
const PlasmaBlob = ({ blob }: { blob: any }) => (
  <div
    className={`plasma ${blob.color}`}
    style={{ width: blob.size, height: blob.size, top: blob.top, left: blob.left, animationDelay: `${blob.delay}s` }}
  />
);

// ─── Animated Section Title ────────────────────────────────────────────────────
const SectionTitle = ({ children, className = "" }: { children: string; className?: string }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const words = children.split(" ");

  return (
    <h2 ref={ref} className={`section-title ${className}`} aria-label={children}>
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
  );
};

// ─── Magnetic Skill Card ───────────────────────────────────────────────────────
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
      initial={{ opacity: 0, scale: 0.75, y: 20 }}
      animate={inView ? { opacity: 1, scale: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: idx * 0.04 }}
      className="group relative"
      style={{ perspective: 600 }}
    >
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative"
      >
        <div className="absolute inset-0 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-orange-500 to-red-500" />
        <div className="relative rounded-2xl px-5 py-3 md:px-8 md:py-5 bg-black/60 backdrop-blur-2xl border border-white/10 flex items-center gap-3 md:gap-4 transition-all duration-300 group-hover:border-orange-500/60 group-hover:shadow-[0_0_40px_rgba(249,115,22,0.4)]">
          <motion.div
            animate={inView ? { rotate: [0, -15, 15, 0] } : {}}
            transition={{ delay: idx * 0.04 + 0.4, duration: 0.5 }}
          >
            <Icon className="text-xl md:text-2xl text-orange-400 group-hover:text-white transition" />
          </motion.div>
          <span className="text-sm md:text-base text-gray-200 tracking-wide group-hover:text-white transition">
            {skill.name}
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Project Card ──────────────────────────────────────────────────────────────
const ProjectCard = ({ project, idx, navigate }: { project: any; idx: number; navigate: any }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60, rotateX: 8 }}
      animate={inView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: idx * 0.12 }}
      whileHover={{ y: -10, transition: { type: "spring", stiffness: 300, damping: 18 } }}
      className="glow-card p-6 md:p-8 cursor-pointer flex flex-col h-full relative overflow-hidden"
      onClick={() => navigate(`/projects/${project.slug}`)}
      style={{ perspective: 800 }}
    >
      {/* Shimmer sweep on hover */}
      <div className="shimmer-overlay absolute inset-0 pointer-events-none" />

      {/* Number watermark */}
      <span className="absolute top-4 right-5 text-6xl font-black text-white/[0.04] select-none pointer-events-none leading-none">
        {String(idx + 1).padStart(2, "0")}
      </span>

      <h3 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4 relative z-10">{project.title}</h3>
      <p className="text-gray-400 text-sm md:text-base mb-6 flex-grow relative z-10">{project.short_description}</p>
      <motion.button
        onClick={(e) => { e.stopPropagation(); navigate(`/projects/${project.slug}`); }}
        className="px-6 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 w-fit relative z-10"
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.97 }}
      >
        View Details →
      </motion.button>
    </motion.div>
  );
};

// ─── Experience Card ───────────────────────────────────────────────────────────
const ExperienceCard = ({ exp, idx }: { exp: any; idx: number }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <div ref={ref} className="flex gap-6">
      {/* Timeline */}
      <div className="flex flex-col items-center shrink-0">
        <motion.div
          className="w-3 h-3 rounded-full bg-orange-500 mt-2 shrink-0 shadow-[0_0_12px_rgba(249,115,22,0.8)]"
          initial={{ scale: 0 }}
          animate={inView ? { scale: 1 } : {}}
          transition={{ delay: idx * 0.2 + 0.1, type: "spring", stiffness: 400 }}
        />
        <motion.div
          className="w-px bg-gradient-to-b from-orange-500/60 to-transparent flex-grow mt-1"
          initial={{ scaleY: 0, originY: 0 }}
          animate={inView ? { scaleY: 1 } : {}}
          transition={{ delay: idx * 0.2 + 0.3, duration: 0.8, ease: "easeOut" }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: idx * 0.2 }}
        className="glow-card p-6 md:p-8 flex-grow mb-6"
      >
        <h3 className="text-lg md:text-xl font-semibold">{exp.role}</h3>
        <p className="text-orange-400 text-sm md:text-base">{exp.company}</p>
        <p className="text-gray-400 text-xs md:text-sm mb-4">
          {exp.start_date} — {exp.currently_working ? "Present" : exp.end_date}
        </p>
        <p className="text-gray-300 text-sm md:text-base">{exp.description}</p>
      </motion.div>
    </div>
  );
};

// ─── Social Icon ───────────────────────────────────────────────────────────────
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
      initial={{ opacity: 0, scale: 0.4, y: 40 }}
      animate={inView ? { opacity: 1, scale: 1, y: 0 } : {}}
      transition={{ delay: idx * 0.08, type: "spring", stiffness: 260, damping: 18 }}
      whileHover={{ y: -8, scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      className="group relative"
    >
      <div className="absolute inset-0 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-orange-500 to-red-500" />
      <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-3xl bg-black/60 backdrop-blur-2xl border border-white/10 flex flex-col items-center justify-center gap-3 md:gap-4 transition-all duration-300 group-hover:border-orange-500/60 group-hover:shadow-[0_0_50px_rgba(249,115,22,0.4)]">
        <Icon className="text-2xl md:text-3xl text-orange-400 group-hover:text-white transition" />
        <span className="text-xs md:text-sm text-gray-300 group-hover:text-white tracking-wide">{link.name}</span>
      </div>
    </motion.a>
  );
};

// ─── Hero name char-by-char (Mobile Optimized) ─────────────────────────────────
const HeroName = ({ name }: { name: string }) => {
  const words = name.split(" ");
  let globalCharIdx = 0; // Keeps the animation delay perfectly staggered across all words

  return (
    <motion.h1
      className="font-lobster italic font-bold text-5xl sm:text-6xl md:text-8xl lg:text-9xl bg-gradient-to-r from-orange-400 via-red-400 to-yellow-500 bg-clip-text text-transparent animate-gradient leading-tight pb-2 flex flex-wrap justify-center gap-x-[0.3em] gap-y-2"
      aria-label={name}
    >
      {words.map((word, wordIdx) => (
        <span key={wordIdx} className="inline-flex whitespace-nowrap">
          {word.split("").map((char) => {
            const idx = globalCharIdx++;
            return (
              <motion.span
                key={idx}
                className="inline-block"
                initial={{ opacity: 0, y: 80, rotate: -8 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                transition={{
                  duration: 0.6,
                  ease: [0.22, 1, 0.36, 1],
                  delay: 0.05 + idx * 0.04,
                }}
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

// ─── Particles config (memoized outside component to avoid re-init) ────────────
const PARTICLES_OPTIONS = {
  background: { color: "transparent" },
  fpsLimit: 30,                        // ← was 60, halved = big GPU savings
  particles: {
    color: { value: "#ffffff" },
    move: { enable: true, speed: 0.12 },
    number: { value: 22 },             // ← was 40
    opacity: { value: 0.07 },
    size: { value: { min: 0.4, max: 1.2 } },
  },
};

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

// ─── Skill Category Group ──────────────────────────────────────────────────────
const SkillCategory = ({ category, groupedSkills }: { category: string; groupedSkills: any[] }) => {
  const catRef = useRef(null);
  const catInView = useInView(catRef, { once: true, amount: 0.15 });

  return (
    <div className="mb-16 md:mb-24" ref={catRef}>
      <motion.h3
        initial={{ opacity: 0, x: -30 }}
        animate={catInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.05 }}
        className="text-xl md:text-2xl font-semibold mb-6 md:mb-10 bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent tracking-widest uppercase text-center md:text-left"
      >
        {category}
      </motion.h3>

      <div className="flex flex-wrap justify-center md:justify-start gap-4 md:gap-8">
        {groupedSkills.map((skill: any, idx: number) => (
          <SkillCard key={skill.id} skill={skill} idx={idx} />
        ))}
      </div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
export default function Home() {
  const navigate = useNavigate();

  const [projects, setProjects]     = useState<any[]>([]);
  const [skills, setSkills]         = useState<any[]>([]);
  const [experience, setExperience] = useState<any[]>([]);
  const [about, setAbout]           = useState<any>(null);
  const [socials, setSocials]       = useState<any[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [ranking, setRanking]       = useState<any>(null);
  const [backendRecommendation, setBackendRecommendation] = useState<string | null>(null);
  const [dismissSuggestion, setDismissSuggestion]         = useState(false);
  const [timeSpent, setTimeSpent] = useState<Record<string, number>>({
    about: 0, skills: 0, experience: 0, projects: 0, contact: 0,
  });
  const [currentView, setCurrentView] = useState("hero");

  // Parallel API calls on mount
  useEffect(() => {
    Promise.all([
      api.get("projects/"),
      api.get("skills/"),
      api.get("experience/"),
      api.get("about/"),
      api.get("socials/"),
    ]).then(([p, s, e, a, so]) => {
      setProjects(p.data);
      setSkills(s.data);
      setExperience(e.data);
      setAbout(a.data);
      setSocials(so.data);
    });

    api.get("ranking/").then(res => {
      setRanking(res.data);
      if (res.data?.data?.length > 0) setBackendRecommendation(res.data.data[0].section);
    }).catch(() => {});

    const dismissed = localStorage.getItem("dismissedAI");
    if (dismissed) setDismissSuggestion(true);
  }, []);

  // Debounced scroll tracker (500ms interval → was 1000ms but with heavy state updates)
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
          const bottom = top + el.offsetHeight;
          if (scrollMid >= top && scrollMid <= bottom) active = id;
        }
      });
      if (active) {
        setCurrentView(active);
        setTimeSpent(prev => ({ ...prev, [active]: prev[active] + 1 }));
      } else {
        setCurrentView("hero");
      }
    };

    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Stable particles init
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="relative min-h-screen bg-[#0f0f12] text-white overflow-hidden custom-cursor-wrapper"
    >
      <LiquidGlassCursor />
      <Navbar />

      {/* ── AI Insight Widget ───────────────────────────────────────────── */}
      <AnimatePresence>
        {showRecommendation && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9, filter: "blur(10px)" }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[90] p-[1px] rounded-2xl bg-gradient-to-br from-orange-400/40 via-white/10 to-red-600/40 shadow-[0_10px_40px_rgba(255,106,0,0.3)]"
          >
            <div className="flex items-start gap-4 bg-black/80 backdrop-blur-3xl border border-white/10 p-5 rounded-2xl relative pr-12">
              <button
                onClick={(e) => { e.stopPropagation(); handleDismiss(); }}
                className="absolute top-2 right-2 text-gray-500 hover:text-white transition p-1"
              >
                <FaTimes size={12} />
              </button>
              <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-orange-500/20 border border-orange-500/30 shrink-0 mt-1">
                <FaBrain className="text-orange-400 text-lg animate-pulse" />
                <div className="absolute inset-0 rounded-full border border-orange-400/50 animate-ping opacity-20" />
              </div>
              <div className="flex flex-col gap-3">
                <div
                  className="cursor-pointer group border-b border-white/10 pb-3"
                  onClick={() => document.getElementById(finalRecommendation)?.scrollIntoView({ behavior: "smooth" })}
                >
                  <p className="text-[10px] md:text-xs text-orange-400 font-orbitron uppercase tracking-widest font-bold mb-1 group-hover:text-orange-300 transition">
                    System Analytics
                  </p>
                  <p className="text-sm md:text-base text-gray-300 font-medium group-hover:text-white transition leading-snug">
                    {ranking?.type === "weekly" ? "🔥 Visitors are exploring" : "📊 Most explored section:"}{" "}
                    <span className="text-white capitalize font-bold">{finalRecommendation}</span>
                  </p>
                </div>
                {trendingProject && (
                  <div className="cursor-pointer group" onClick={() => navigate(`/projects/${trendingProject.slug}`)}>
                    <p className="text-[10px] md:text-xs text-red-400 font-orbitron uppercase tracking-widest font-bold mb-1 group-hover:text-red-300 transition">
                      Community Top Pick
                    </p>
                    <p className="text-sm md:text-base text-gray-300 font-medium group-hover:text-white transition leading-snug">
                      🚀 Trending: <span className="text-white capitalize font-bold">{trendingProject.title}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Plasma Blobs (CSS-only, zero JS) ───────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {BLOBS.map((blob, idx) => <PlasmaBlob key={idx} blob={blob} />)}
      </div>

      <Particles init={particlesInit} options={PARTICLES_OPTIONS} className="absolute inset-0 -z-10" />

      {/* ── Main Glass Tile ─────────────────────────────────────────────── */}
      <main className="relative z-10 m-3 sm:m-6 md:m-8 rounded-[2.5rem] bg-black/40 backdrop-blur-[30px] border border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.6),inset_0_0_40px_rgba(255,255,255,0.03)] pb-10">

        {/* ── HERO ─────────────────────────────────────────────────────── */}
        <section id="hero" className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center text-center px-6 pt-20">
          <HeroName name="Keval Parmar" />

          <motion.p
            initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.75, duration: 0.8 }}
            className="font-orbitron mt-6 md:mt-8 text-lg md:text-xl text-orange-200/80 max-w-2xl tracking-widest uppercase"
          >
            AI Systems Engineer building intelligent, production-ready LLM architectures.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.7 }}
            className="mt-10 md:mt-12 flex flex-col sm:flex-row gap-4 sm:gap-6 w-full sm:w-auto"
          >
            <motion.button
              onClick={() => document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })}
              className="liquid-btn w-full sm:w-auto"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
            >
              View Projects
            </motion.button>
            <motion.button
              onClick={() => setIsChatOpen(true)}
              className="liquid-btn-primary w-full sm:w-auto"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
            >
              Chat With My Portfolio
            </motion.button>
          </motion.div>


        </section>

        {/* ── ABOUT ────────────────────────────────────────────────────── */}
        {about && (
          <section id="about" className="relative z-10 py-20 md:py-32 max-w-5xl mx-auto px-4 sm:px-6">
            <SectionTitle>About</SectionTitle>

            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="glow-card p-6 md:p-10"
            >
              <motion.h3
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15, duration: 0.5 }}
                className="text-xl md:text-2xl text-orange-400 mb-4 md:mb-6"
              >
                {about.headline}
              </motion.h3>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.7 }}
                className="text-gray-300 leading-relaxed whitespace-pre-line text-sm md:text-base"
              >
                {about.bio}
              </motion.p>
            </motion.div>
          </section>
        )}

        {/* ── SKILLS ───────────────────────────────────────────────────── */}
        <section id="skills" className="relative z-10 py-20 md:py-40 max-w-7xl mx-auto px-4 sm:px-6">
          <SectionTitle className="text-center mb-16 md:mb-24">Architecture Stack</SectionTitle>

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

        {/* ── EXPERIENCE ───────────────────────────────────────────────── */}
        <section id="experience" className="relative z-10 py-20 md:py-32 max-w-4xl mx-auto px-4 sm:px-6">
          <SectionTitle>Experience</SectionTitle>

          <div className="space-y-2">
            {experience.map((exp, idx) => (
              <ExperienceCard key={exp.id} exp={exp} idx={idx} />
            ))}
          </div>
        </section>

        {/* ── PROJECTS ─────────────────────────────────────────────────── */}
        <section id="projects" className="relative z-10 py-20 md:py-32 max-w-5xl mx-auto px-4 sm:px-6">
          <SectionTitle>Projects</SectionTitle>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {projects.map((project, idx) => (
              <ProjectCard key={project.id} project={project} idx={idx} navigate={navigate} />
            ))}
          </div>
        </section>

        {/* ── CONTACT ──────────────────────────────────────────────────── */}
        <section id="contact" className="relative z-10 py-20 md:py-40 max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <SectionTitle className="mb-16 md:mb-24">Connect</SectionTitle>

          <div className="flex flex-wrap justify-center gap-6 md:gap-10">
            {socials.map((link: any, idx: number) => (
              <SocialIcon key={link.id} link={link} idx={idx} />
            ))}
          </div>
        </section>
      </main>

      <ChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      <footer className="relative z-10 py-10 text-center w-full">
        <p className="text-gray-500 text-sm tracking-wider flex items-center justify-center gap-2">
          <span>© 2026 Keval Parmar.</span>
          <span className="w-1 h-1 rounded-full bg-orange-500/50" />
          <span>Powered by AI.</span>
        </p>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lobster+Two:ital,wght@0,400;0,700;1,400;1,700&family=Orbitron:wght@400..900&display=swap');

        .font-lobster  { font-family: 'Lobster Two', cursive; }
        .font-orbitron { font-family: 'Orbitron', sans-serif; }

        :root {
          --accent-start: #ff6a00;
          --accent-mid:   #ff3c3c;
          --accent-end:   #ffb347;
        }

        .custom-cursor-wrapper * { cursor: none !important; }

        /* ── Section Title ───────────────────────────────────────── */
        .section-title {
          font-size: 2.2rem;
          font-weight: 700;
          text-align: center;
          margin-bottom: 2rem;
          background: linear-gradient(90deg, var(--accent-start), var(--accent-mid), var(--accent-end));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-size: 200% auto;
          animation: gradientFlow 8s linear infinite;
        }

        @media (min-width: 768px) {
          .section-title { font-size: 2.8rem; margin-bottom: 4rem; }
        }

        @keyframes gradientFlow {
          0%   { background-position: 0% }
          100% { background-position: 200% }
        }

        .animate-gradient {
          background: linear-gradient(90deg, var(--accent-start), var(--accent-mid), var(--accent-end));
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: gradientFlow 8s linear infinite;
        }

        /* ── Cards ───────────────────────────────────────────────── */
        .glow-card {
          border-radius: 1.5rem;
          background: rgba(0, 0, 0, 0.65);
          backdrop-filter: blur(25px);
          border: 1px solid rgba(255,255,255,0.08);
          transition: box-shadow 0.4s ease;
        }
        .glow-card:hover {
          box-shadow: 0 20px 60px rgba(255,106,0,0.35);
        }

        /* Shimmer sweep on project cards */
        .shimmer-overlay {
          background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.04) 50%, transparent 60%);
          background-size: 200% 100%;
          background-position: -100% 0;
          transition: none;
          border-radius: 1.5rem;
        }
        .glow-card:hover .shimmer-overlay {
          animation: shimmerSweep 0.7s ease forwards;
        }
        @keyframes shimmerSweep {
          from { background-position: -100% 0; }
          to   { background-position: 200% 0; }
        }

        /* ── Buttons ─────────────────────────────────────────────── */
        .liquid-btn {
          padding: 0.75rem 2rem;
          border-radius: 1rem;
          background: rgba(255,255,255,0.08);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.2);
          transition: box-shadow 0.3s ease;
        }
        .liquid-btn:hover { box-shadow: 0 0 25px rgba(255,106,0,0.4); }

        .liquid-btn-primary {
          padding: 0.75rem 2rem;
          border-radius: 1rem;
          background: linear-gradient(135deg, var(--accent-start), var(--accent-mid));
          transition: box-shadow 0.3s ease;
        }
        .liquid-btn-primary:hover { box-shadow: 0 0 30px rgba(255,106,0,0.6); }

        /* ── Plasma blobs (CSS-only, GPU-composited) ─────────────── */
        .plasma {
          position: absolute;
          filter: blur(2px);
          opacity: 0.8;
          animation: plasma-morph 20s linear infinite;
          will-change: border-radius, transform;
          /* containment keeps paint isolated */
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
      `}</style>
    </motion.div>
  );
}
