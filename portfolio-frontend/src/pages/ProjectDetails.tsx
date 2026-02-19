import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Project {
  id: number;
  title: string;
  slug: string;
  short_description: string;
  detailed_description: string;
  tech_stack: string;
  github_url?: string;
  live_url?: string;
}

export default function ProjectDetails() {
  const { slug } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showExplanation, setShowExplanation] = useState(false);

  const [explanationType, setExplanationType] = useState("technical");
  const [complexity, setComplexity] = useState("normal");

  const [explanation, setExplanation] = useState("");
  const [typedText, setTypedText] = useState("");
  const [loading, setLoading] = useState(false);

useEffect(() => {
  const handleMouseMove = (e: MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  window.addEventListener("mousemove", handleMouseMove);
  return () => window.removeEventListener("mousemove", handleMouseMove);
}, []);

  // Fetch project
  useEffect(() => {
    api.get("projects/")
      .then(res => {
        const found = res.data.find((p: Project) => p.slug === slug);
        setProject(found);
      })
      .catch(err => console.error(err));
  }, [slug]);

  // Typing animation
  useEffect(() => {
    if (!explanation) return;

    let index = 0;
    setTypedText("");

    const interval = setInterval(() => {
      setTypedText(prev => prev + explanation[index]);
      index++;
      if (index >= explanation.length) clearInterval(interval);
    }, 8);

    return () => clearInterval(interval);
  }, [explanation]);

  const handleExplain = async () => {
    if (!project) return;

    try {
      setLoading(true);
      setExplanation("");
      setTypedText("");

      const res = await api.post(`projects/${project.slug}/explain/`, {
        type: explanationType,
        complexity: complexity
      });

      setExplanation(res.data.content);
setShowExplanation(true);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">

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
)`
,
    transition: "background 0.2s ease",
  }}
/>

      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20 blur-3xl opacity-50" />

      <div className="relative z-10 pt-44 pb-32 px-6">

        <div className="max-w-5xl mx-auto">

          {/* TITLE */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-purple-600 bg-clip-text text-transparent mb-12"
          >
            {project.title}
          </motion.h1>

          {/* MAIN CONTENT CARD */}
          <div className="rounded-3xl p-[1px] bg-gradient-to-br from-purple-500/30 to-blue-500/30">

            <div className="rounded-3xl bg-black/60 backdrop-blur-2xl p-12 border border-white/10 shadow-2xl shadow-purple-500/10">

              <p className="text-gray-300 text-lg leading-relaxed mb-8 whitespace-pre-line">
                {project.detailed_description}
              </p>

              <div className="text-purple-400 text-sm mb-12">
                {project.tech_stack}
              </div>

              {/* CONTROLS */}
              <div className="flex flex-wrap gap-6 items-center">

                {/* Mode */}
                <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1 backdrop-blur-lg">
                  {[
                    { label: "Technical", value: "technical" },
                    { label: "Non-Tech", value: "simple" },
                    { label: "HR Interview", value: "hr" }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => setExplanationType(option.value)}
                      className={`px-5 py-2 rounded-xl text-sm transition-all duration-300 ${
                        explanationType === option.value
                          ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                {/* Complexity */}
                <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1 backdrop-blur-lg">
                  {["basic", "normal", "advanced"].map(level => (
                    <button
                      key={level}
                      onClick={() => setComplexity(level)}
                      className={`px-5 py-2 rounded-xl text-sm transition-all duration-300 ${
                        complexity === level
                          ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      {level.toUpperCase()}
                    </button>
                  ))}
                </div>

                {/* Explain */}
                <button
                  onClick={handleExplain}
                  className="px-8 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 hover:scale-105 transition duration-300 shadow-lg shadow-purple-600/30"
                >
                  {loading ? "Thinking..." : "Explain with AI"}
                </button>

              </div>

            </div>
          </div>

          {/* AI EXPLANATION CARD */}
{showExplanation && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">

    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="relative w-full max-w-4xl max-h-[80vh] overflow-hidden rounded-3xl p-[1px] bg-gradient-to-br from-purple-500/30 to-blue-500/30"
    >

      <div className="relative bg-black/80 backdrop-blur-2xl rounded-3xl p-10 border border-white/10 shadow-2xl shadow-purple-500/20 overflow-y-auto max-h-[80vh] ai-scroll">

        {/* Close Button */}
        <button
          onClick={() => setShowExplanation(false)}
          className="absolute top-6 right-6 text-gray-400 hover:text-white text-xl transition"
        >
          ✕
        </button>

        {/* Regenerate */}
        <button
          onClick={handleExplain}
          className="absolute top-6 right-20 text-sm px-4 py-2 rounded-xl border border-white/20 hover:bg-white/10 transition"
        >
          🔄 Regenerate
        </button>

        <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          AI Explanation
        </h2>

        {loading ? (
          <div className="animate-pulse text-purple-400">
            Generating explanation...
          </div>
        ) : (
          <div className="markdown-body text-gray-300 leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {explanation}
            </ReactMarkdown>
          </div>
        )}

      </div>
    </motion.div>
  </div>
)}



        </div>
      </div>

      {/* Custom Scrollbar */}
      <style>{`
        .ai-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .ai-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(#7c3aed, #2563eb);
          border-radius: 10px;
        }
        .ai-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .markdown-body h1,
.markdown-body h2,
.markdown-body h3 {
  margin-top: 1.5rem;
  margin-bottom: 1rem;
  font-weight: 600;
  color: #c084fc;
}

.markdown-body p {
  margin-bottom: 1rem;
}

.markdown-body ul {
  padding-left: 1.5rem;
  list-style: disc;
  margin-bottom: 1rem;
}

.markdown-body li {
  margin-bottom: 0.5rem;
}

.markdown-body code {
  background: rgba(255,255,255,0.08);
  padding: 0.2rem 0.4rem;
  border-radius: 0.4rem;
}

.markdown-body pre {
  background: rgba(0,0,0,0.5);
  padding: 1rem;
  border-radius: 1rem;
  overflow-x: auto;
}

      `}</style>

    </div>
  );
}
