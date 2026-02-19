import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import type { Engine } from "tsparticles-engine";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../api/axios";

export default function Home() {
  const navigate = useNavigate();

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [projects, setProjects] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [experience, setExperience] = useState<any[]>([]);
  const [about, setAbout] = useState<any>(null);
  const [socials, setSocials] = useState<any[]>([]);

  /* Cursor Glow */
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  /* Fetch Data */
  useEffect(() => {
    api.get("projects/").then(res => setProjects(res.data));
    api.get("skills/").then(res => setSkills(res.data));
    api.get("experience/").then(res => setExperience(res.data));
    api.get("about/").then(res => setAbout(res.data));
    api.get("socials/").then(res => setSocials(res.data));
  }, []);

  /* Particles */
  const particlesInit = async (engine: Engine) => {
    await loadSlim(engine);
  };

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">

      <Navbar />

      {/* Cursor Glow */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: `radial-gradient(
            900px at ${mousePosition.x}px ${mousePosition.y}px,
            rgba(124,58,237,0.15),
            rgba(37,99,235,0.08),
            transparent 70%
          )`,
          transition: "background 0.2s ease",
        }}
      />

      {/* Particles */}
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

      {/* HERO */}
      <section id="hero" className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-6">
        <motion.h1
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-purple-600 bg-clip-text text-transparent animate-gradient"
        >
          Keval Parmar
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 1 }}
          className="mt-8 text-xl text-gray-300 max-w-2xl"
        >
          AI Systems Engineer building intelligent, production-ready LLM architectures.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 1 }}
          className="mt-12 flex gap-6"
        >
          <button
            onClick={() =>
              document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })
            }
            className="liquid-btn"
          >
            View Projects
          </button>

          <button
            onClick={() =>
              document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })
            }
            className="liquid-btn-primary"
          >
            Talk to My Portfolio
          </button>
        </motion.div>
      </section>

      {/* ABOUT */}
      {about && (
        <section id="about" className="relative z-10 py-32 max-w-5xl mx-auto px-6">
          <h2 className="section-title">About</h2>

          <div className="glow-card p-10">
            <h3 className="text-2xl text-purple-400 mb-6">{about.headline}</h3>
            <p className="text-gray-300 leading-relaxed whitespace-pre-line">
              {about.bio}
            </p>
          </div>
        </section>
      )}

      {/* SKILLS */}
      <section id="skills" className="relative z-10 py-32 max-w-6xl mx-auto px-6">
        <h2 className="section-title">Skills</h2>

        <div className="grid md:grid-cols-3 gap-8">
          {skills.map(skill => (
            <div key={skill.id} className="glow-card p-6">
              {skill.icon && (
                <img
                  src={skill.icon}
                  alt={skill.name}
                  className="w-12 h-12 object-contain mb-4"
                />
              )}

              <h3 className="mb-4 font-semibold">{skill.name}</h3>

              <div className="w-full bg-white/10 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-700"
                  style={{ width: `${skill.proficiency}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* EXPERIENCE */}
      <section id="experience" className="relative z-10 py-32 max-w-4xl mx-auto px-6">
        <h2 className="section-title">Experience</h2>

        <div className="space-y-10">
          {experience.map(exp => (
            <div key={exp.id} className="glow-card p-8">
              <h3 className="text-xl font-semibold">{exp.role}</h3>
              <p className="text-purple-400">{exp.company}</p>
              <p className="text-gray-400 text-sm mb-4">
                {exp.start_date} - {exp.currently_working ? "Present" : exp.end_date}
              </p>
              <p className="text-gray-300">{exp.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PROJECTS */}
      <section id="projects" className="relative z-10 max-w-5xl mx-auto px-6 py-32">
        <h2 className="section-title">Projects</h2>

        <div className="grid md:grid-cols-2 gap-12">
          {projects.map(project => (
            <motion.div
              key={project.id}
              whileHover={{ y: -8 }}
              className="glow-card p-8 cursor-pointer"
              onClick={() => navigate(`/projects/${project.slug}`)}
            >
              <h3 className="text-2xl font-semibold mb-4">
                {project.title}
              </h3>
              <p className="text-gray-400 mb-6">
                {project.short_description}
              </p>
              <button
                  onClick={() => navigate(`/projects/${project.slug}`)}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:scale-105 transition"
                >
                  View Details →
                </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="relative z-10 py-32 text-center">
        <h2 className="section-title">Contact</h2>

        <div className="flex justify-center gap-8 flex-wrap">
          {socials.map(link => (
            <a key={link.id} href={link.url} target="_blank" className="glow-card p-6 flex items-center gap-4">
              {link.icon && (
                <img
                  src={link.icon}
                  alt={link.name}
                  className="w-8 h-8 object-contain"
                />
              )}
              <span>{link.name}</span>
            </a>
          ))}
        </div>
      </section>

      {/* STYLES */}
      <style>{`
        .section-title {
          font-size: 2.5rem;
          font-weight: bold;
          text-align: center;
          margin-bottom: 4rem;
          background: linear-gradient(to right, #a855f7, #3b82f6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .glow-card {
          border-radius: 1.5rem;
          background: linear-gradient(
            145deg,
            rgba(255,255,255,0.06),
            rgba(255,255,255,0.02)
          );
          backdrop-filter: blur(25px);
          border: 1px solid rgba(255,255,255,0.08);
          transition: all 0.4s ease;
        }

        .glow-card:hover {
          box-shadow: 0 20px 60px rgba(124,58,237,0.25);
          transform: translateY(-6px);
        }

        @keyframes gradient {
          0% { background-position: 0% }
          100% { background-position: 200% }
        }

        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 6s linear infinite;
        }

        .liquid-btn {
          padding: 0.75rem 2rem;
          border-radius: 1rem;
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.2);
          transition: all 0.3s ease;
        }

        .liquid-btn:hover {
          transform: scale(1.05);
          background: rgba(255,255,255,0.2);
        }

        .liquid-btn-primary {
          padding: 0.75rem 2rem;
          border-radius: 1rem;
          background: linear-gradient(135deg, #7c3aed, #2563eb);
          transition: all 0.3s ease;
        }

        .liquid-btn-primary:hover {
          transform: scale(1.05);
          filter: brightness(1.1);
        }
      `}</style>

    </div>
  );
}
