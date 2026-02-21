import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
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

export default function Home() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [experience, setExperience] = useState<any[]>([]);
  const [about, setAbout] = useState<any>(null);
  const [socials, setSocials] = useState<any[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // ⚡ Parallax Motion Values (for background blobs)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 40, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 40, damping: 30 });


  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Background Parallax
      mouseX.set(e.clientX - window.innerWidth / 2);
      mouseY.set(e.clientY - window.innerHeight / 2);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  useEffect(() => {
    api.get("projects/").then(res => setProjects(res.data));
    api.get("skills/").then(res => setSkills(res.data));
    api.get("experience/").then(res => setExperience(res.data));
    api.get("about/").then(res => setAbout(res.data));
    api.get("socials/").then(res => setSocials(res.data));
  }, []);

  // 📊 Fetch Weekly Ranking from Backend
useEffect(() => {
  const fetchRanking = async () => {
    try {
      const res = await api.get("ranking/");
      setRanking(res.data);

      if (res.data?.data?.length > 0) {
        setBackendRecommendation(res.data.data[0].section);
      }
    } catch (err) {
      console.error("Ranking fetch failed:", err);
    }
  };

  fetchRanking();
}, []);

  const particlesInit = async (engine: Engine) => {
    await loadSlim(engine);
  };
  // 🎯 AI ENGAGEMENT TRACKER STATE
  const [timeSpent, setTimeSpent] = useState<Record<string, number>>({
    about: 0, skills: 0, experience: 0, projects: 0, contact: 0
  });
  const [currentView, setCurrentView] = useState("hero");
  // 🌍 Backend Analytics
const [ranking, setRanking] = useState<any>(null);
const [backendRecommendation, setBackendRecommendation] = useState<string | null>(null);

  // 🧠 The "AI Observer" Engine
  useEffect(() => {
    const interval = setInterval(() => {
      const sections = ["about", "skills", "experience", "projects", "contact"];
      let active = "";

      const scrollPosition = window.scrollY + window.innerHeight / 2; // Middle of screen

      sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          const { top, bottom } = el.getBoundingClientRect();
          const absoluteTop = window.scrollY + top;
          const absoluteBottom = window.scrollY + bottom;

          if (scrollPosition >= absoluteTop && scrollPosition <= absoluteBottom) {
            active = id;
          }
        }
      });

      if (active) {
        setCurrentView(active);
        setTimeSpent(prev => ({ ...prev, [active]: prev[active] + 1 }));
      } else {
        setCurrentView("hero"); // If at the very top
      }
    }, 1000); // Ticks every 1 second

    return () => clearInterval(interval);
  }, []);
const [dismissSuggestion, setDismissSuggestion] = useState(false);
  // Calculate the most viewed section
  const mostViewed = Object.keys(timeSpent).reduce((a, b) => timeSpent[a] > timeSpent[b] ? a : b);

// 🧠 Hybrid Intelligence Logic
const finalRecommendation =
  backendRecommendation && backendRecommendation !== currentView
    ? backendRecommendation
    : mostViewed;

const showRecommendation =
  !dismissSuggestion &&
  finalRecommendation &&
  timeSpent[mostViewed] > 5 &&
  currentView !== finalRecommendation;
useEffect(() => {
  const dismissed = localStorage.getItem("dismissedAI");
  if (dismissed) setDismissSuggestion(true);
}, []);

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
{/* 🎯 THE LIQUID GLASS CURSOR COMPONENT */}
      <LiquidGlassCursor />

      <Navbar />
      {/* 🧠 AI INSIGHT FLOATING WIDGET (DUAL DASHBOARD) */}
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

              {/* Dismiss Button */}
              <button
                onClick={(e) => { e.stopPropagation(); setDismissSuggestion(true); }}
                className="absolute top-2 right-2 text-gray-500 hover:text-white transition p-1"
              >
                <FaTimes size={12} />
              </button>

              {/* Glowing Brain Icon */}
              <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-orange-500/20 border border-orange-500/30 shrink-0 mt-1">
                <FaBrain className="text-orange-400 text-lg animate-pulse" />
                <div className="absolute inset-0 rounded-full border border-orange-400/50 animate-ping opacity-20"></div>
              </div>

              {/* Dual Recommendations */}
              <div className="flex flex-col gap-3">

                {/* 1. Section Recommendation */}
                <div
                  className="cursor-pointer group border-b border-white/10 pb-3"
                  onClick={() => document.getElementById(finalRecommendation)?.scrollIntoView({ behavior: "smooth" })}
                >
                  <p className="text-[10px] md:text-xs text-orange-400 font-orbitron uppercase tracking-widest font-bold mb-1 group-hover:text-orange-300 transition">
                    System Analytics
                  </p>
                  <p className="text-sm md:text-base text-gray-300 font-medium group-hover:text-white transition leading-snug">
                    {ranking?.type === "weekly" ? "🔥 Visitors are exploring" : "📊 Most explored section:"} <span className="text-white capitalize font-bold">{finalRecommendation}</span>
                  </p>
                </div>

                {/* 2. Trending Project Recommendation */}
                {trendingProject && (
                  <div
                    className="cursor-pointer group"
                    onClick={() => navigate(`/projects/${trendingProject.slug}`)}
                  >
                    <p className="text-[10px] md:text-xs text-red-400 font-orbitron uppercase tracking-widest font-bold mb-1 group-hover:text-red-300 transition">
                      Community Top Pick
                    </p>
                    <p className="text-sm md:text-base text-gray-300 font-medium group-hover:text-white transition leading-snug">
                      🚀 Trending Project: <span className="text-white capitalize font-bold">{trendingProject.title}</span>
                    </p>
                  </div>
                )}

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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

      <Particles
        init={particlesInit}
        options={{
          background: { color: "transparent" },
          fpsLimit: 60,
          particles: {
            color: { value: "#ffffff" },
            move: { enable: true, speed: 0.15 },
            number: { value: 40 },
            opacity: { value: 0.08 },
            size: { value: { min: 0.5, max: 1.5 } },
          },
        }}
        className="absolute inset-0 -z-10"
      />

      {/* --- THE GREAT GLASS TILE --- */}
      <main className="relative z-10 m-3 sm:m-6 md:m-8 rounded-[2.5rem] bg-black/40 backdrop-blur-[30px] border border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.6),inset_0_0_40px_rgba(255,255,255,0.03)] pb-10">

        {/* HERO */}
        <section id="hero" className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center text-center px-6 pt-20">
          <motion.h1
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="font-lobster italic font-bold text-6xl md:text-8xl lg:text-9xl bg-gradient-to-r from-orange-400 via-red-400 to-yellow-500 bg-clip-text text-transparent animate-gradient leading-tight pb-2 pr-4 tracking-wide"
          >
            Keval Parmar
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 1 }}
            className="font-orbitron mt-6 md:mt-8 text-lg md:text-xl text-orange-200/80 max-w-2xl tracking-widest uppercase"
          >
            AI Systems Engineer building intelligent, production-ready LLM architectures.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="mt-10 md:mt-12 flex flex-col sm:flex-row gap-4 sm:gap-6 w-full sm:w-auto"
          >
            <button onClick={() => document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })} className="liquid-btn w-full sm:w-auto">
              View Projects
            </button>
            <button onClick={() => setIsChatOpen(true)} className="liquid-btn-primary w-full sm:w-auto">
              Talk to My Portfolio
            </button>
          </motion.div>
        </section>

        {/* ABOUT */}
        {about && (
          <section id="about" className="relative z-10 py-20 md:py-32 max-w-5xl mx-auto px-4 sm:px-6">
            <motion.h2
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6 }}
              className="section-title"
            >
              About
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="glow-card p-6 md:p-10"
            >
              <h3 className="text-xl md:text-2xl text-orange-400 mb-4 md:mb-6">{about.headline}</h3>
              <p className="text-gray-300 leading-relaxed whitespace-pre-line text-sm md:text-base">
                {about.bio}
              </p>
            </motion.div>
          </section>
        )}

        {/* ---------------- SKILLS ---------------- */}
        <section id="skills" className="relative z-10 py-20 md:py-40 max-w-7xl mx-auto px-4 sm:px-6">
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="section-title text-center mb-16 md:mb-24"
          >
            Architecture Stack
          </motion.h2>

          {Object.entries(
            skills.reduce((acc: any, skill: any) => {
              acc[skill.category] = acc[skill.category] || [];
              acc[skill.category].push(skill);
              return acc;
            }, {})
          ).map(([category, groupedSkills]: any, categoryIndex) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: categoryIndex * 0.15 }}
              className="mb-16 md:mb-24"
            >
             <h3 className="text-xl md:text-2xl font-semibold mb-6 md:mb-10 bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent tracking-widest uppercase text-center md:text-left">
                {category}
              </h3>

              <div className="flex flex-wrap justify-center md:justify-start gap-4 md:gap-8">
                {groupedSkills.map((skill: any, idx: number) => {
                  const Icon = skillIconMap[skill.name.toLowerCase()] || FaServer;
                  return (
                    <motion.div
                      key={skill.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: idx * 0.05 }}
                      className="group relative"
                    >
                      <div className="absolute inset-0 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-r from-orange-500 to-red-500" />
                      <div className="relative rounded-2xl px-5 py-3 md:px-8 md:py-5 bg-black/60 backdrop-blur-2xl border border-white/10 flex items-center gap-3 md:gap-4 transition-all duration-500 group-hover:border-orange-500/60 group-hover:shadow-[0_0_40px_rgba(249,115,22,0.4)]">
                        <Icon className="text-xl md:text-2xl text-orange-400 group-hover:text-white transition" />
                        <span className="text-sm md:text-base text-gray-200 tracking-wide group-hover:text-white transition">
                          {skill.name}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </section>

        {/* EXPERIENCE */}
        <section id="experience" className="relative z-10 py-20 md:py-32 max-w-4xl mx-auto px-4 sm:px-6">
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="section-title"
          >
            Experience
          </motion.h2>

          <div className="space-y-6 md:space-y-10">
            {experience.map((exp, idx) => (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: idx * 0.15 }}
                className="glow-card p-6 md:p-8"
              >
                <h3 className="text-lg md:text-xl font-semibold">{exp.role}</h3>
                <p className="text-orange-400 text-sm md:text-base">{exp.company}</p>
                <p className="text-gray-400 text-xs md:text-sm mb-4">
                  {exp.start_date} - {exp.currently_working ? "Present" : exp.end_date}
                </p>
                <p className="text-gray-300 text-sm md:text-base">{exp.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* PROJECTS */}
        <section id="projects" className="relative z-10 py-20 md:py-32 max-w-5xl mx-auto px-4 sm:px-6">
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="section-title"
          >
            Projects
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {projects.map((project, idx) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                whileHover={{ y: -8 }}
                className="glow-card p-6 md:p-8 cursor-pointer flex flex-col h-full"
                onClick={() => navigate(`/projects/${project.slug}`)}
              >
                <h3 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4">
                  {project.title}
                </h3>
                <p className="text-gray-400 text-sm md:text-base mb-6 flex-grow">
                  {project.short_description}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/projects/${project.slug}`);
                  }}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 hover:scale-105 transition w-fit"
                >
                  View Details →
                </button>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ---------------- CONTACT ---------------- */}
        <section id="contact" className="relative z-10 py-20 md:py-40 max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="section-title mb-16 md:mb-24"
          >
            Connect
          </motion.h2>

          <div className="flex flex-wrap justify-center gap-6 md:gap-10">
            {socials.map((link: any, idx: number) => {
              const Icon = socialIconMap[link.name.toLowerCase()] || FaGlobe;

              return (
                <motion.a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, type: "spring", stiffness: 100, delay: idx * 0.1 }}
                  className="group relative"
                >
                  <div className="absolute inset-0 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-r from-orange-500 to-red-500" />
                  <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-3xl bg-black/60 backdrop-blur-2xl border border-white/10 flex flex-col items-center justify-center gap-3 md:gap-4 transition-all duration-500 group-hover:border-orange-500/60 group-hover:shadow-[0_0_50px_rgba(249,115,22,0.4)] group-hover:-translate-y-2">
                    <Icon className="text-2xl md:text-3xl text-orange-400 group-hover:text-white transition" />
                    <span className="text-xs md:text-sm text-gray-300 group-hover:text-white tracking-wide">
                      {link.name}
                    </span>
                  </div>
                </motion.a>

              );
            })}
          </div>
        </section>
      </main>

      <ChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
{/* ---------------- FOOTER ---------------- */}
      <footer className="relative z-10 py-10 text-center w-full">
        <p className="text-gray-500 text-sm tracking-wider flex items-center justify-center gap-2">
          <span>© 2026 Keval Parmar.</span>
          <span className="w-1 h-1 rounded-full bg-orange-500/50"></span>
          <span>Powered by AI.</span>
        </p>
      </footer>
      {/* STYLES */}
      <style>{`
      /* 🔥 IMPORT YOUR CUSTOM FONTS */
        @import url('https://fonts.googleapis.com/css2?family=Lobster+Two:ital,wght@0,400;0,700;1,400;1,700&family=Orbitron:wght@400..900&display=swap');

        .font-lobster {
          font-family: 'Lobster Two', cursive;
        }

        .font-orbitron {
          font-family: 'Orbitron', sans-serif;
        }

        /* ... rest of your CSS ... */
        :root {
          --accent-start: #ff6a00;
          --accent-mid: #ff3c3c;
          --accent-end: #ffb347;
        }

        /* Hide native cursor for a cleaner look (Optional: comment out if you want the native pointer back) */
        .custom-cursor-wrapper * {
          cursor: none !important;
        }

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
          .section-title {
            font-size: 2.8rem;
            margin-bottom: 4rem;
          }
        }

        @keyframes gradientFlow {
          0% { background-position: 0% }
          100% { background-position: 200% }
        }

        .animate-gradient {
          background: linear-gradient(90deg, var(--accent-start), var(--accent-mid), var(--accent-end));
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: gradientFlow 8s linear infinite;
        }

        .glow-card {
          border-radius: 1.5rem;
         background: rgba(0, 0, 0, 0.65);
          backdrop-filter: blur(25px);
          border: 1px solid rgba(255,255,255,0.08);
          transition: all 0.4s ease;
        }

        .glow-card:hover {
          box-shadow: 0 20px 60px rgba(255,106,0,0.35);
        }

        .liquid-btn {
          padding: 0.75rem 2rem;
          border-radius: 1rem;
          background: rgba(255,255,255,0.08);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.2);
          transition: all 0.3s ease;
        }

        .liquid-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 0 25px rgba(255,106,0,0.4);
        }

        .liquid-btn-primary {
          padding: 0.75rem 2rem;
          border-radius: 1rem;
          background: linear-gradient(135deg, var(--accent-start), var(--accent-mid));
          transition: all 0.3s ease;
        }

        .liquid-btn-primary:hover {
          transform: scale(1.05);
          box-shadow: 0 0 30px rgba(255,106,0,0.6);
        }

        /* ---------------- PLASMA BACKGROUND (LIQUID SMOOTH) ---------------- */
        .plasma {
          position: absolute;
          filter: blur(2px);
          opacity: 0.8;
          animation: plasma-morph 20s linear infinite;
          will-change: border-radius, rotate, transform;
        }

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
      `}</style>
    </motion.div>
  );
}