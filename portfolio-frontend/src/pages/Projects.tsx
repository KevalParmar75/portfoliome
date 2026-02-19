import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import api from "../api/axios";

interface Project {
  id: number;
  title: string;
  slug: string;
  short_description: string;
  tech_stack: string;
  github_url?: string;
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [selectedExplanation, setSelectedExplanation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [explanationType, setExplanationType] = useState("technical");
  const [complexity, setComplexity] = useState("normal");
  const [displayedText, setDisplayedText] = useState("");

  // Fetch projects
  useEffect(() => {
    api.get("projects/")
      .then(res => setProjects(res.data))
      .catch(err => console.error(err));
  }, []);

  // Typing animation
  useEffect(() => {
    if (!selectedExplanation) return;

    let i = 0;
    const text = selectedExplanation;

    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, i));
      i++;
      if (i > text.length) clearInterval(interval);
    }, 8);

    return () => clearInterval(interval);
  }, [selectedExplanation]);

  const fetchExplanation = async (slug: string) => {
    try {
      setLoading(true);
      setDisplayedText("");
      setSelectedExplanation(null);

      const res = await api.post(`projects/${slug}/explain/`, {
        type: explanationType,
        complexity: complexity,
      });

      setSelectedExplanation(res.data.content);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <Navbar />

      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20 blur-3xl opacity-50" />

      <div className="relative z-10 pt-40 px-8 max-w-6xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-bold text-center mb-20 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"
        >
          Featured Projects
        </motion.h1>

        <div className="grid md:grid-cols-2 gap-10">
          {projects.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group relative rounded-3xl p-[1px] bg-gradient-to-br from-purple-500/30 to-blue-500/30 hover:from-purple-500 hover:to-blue-500 transition-all duration-500"
            >
              <div className="rounded-3xl bg-black/60 backdrop-blur-xl p-8 border border-white/10 group-hover:border-white/20 transition-all duration-500 shadow-lg group-hover:shadow-purple-500/20">

                <h2 className="text-2xl font-semibold mb-4">
                  {project.title}
                </h2>

                <p className="text-gray-400 mb-4">
                  {project.short_description}
                </p>

                <p className="text-sm text-purple-400 mb-6">
                  {project.tech_stack}
                </p>

                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setSelectedSlug(project.slug);
                      fetchExplanation(project.slug);
                    }}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:scale-105 transition"
                  >
                    Explain with AI
                  </button>

                  {project.github_url && (
                    <a
                      href={project.github_url}
                      target="_blank"
                      className="px-5 py-2 rounded-xl border border-white/20 hover:bg-white/10 transition"
                    >
                      GitHub
                    </a>
                  )}
                </div>

              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* AI Modal */}
      {selectedSlug && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50">
          <div className="relative bg-black/80 border border-purple-500/30 rounded-3xl p-10 max-w-4xl w-full shadow-2xl shadow-purple-500/20">

            <button
              onClick={() => {
                setSelectedSlug(null);
                setSelectedExplanation(null);
                setDisplayedText("");
              }}
              className="absolute top-6 right-6 text-gray-400 hover:text-white text-xl"
            >
              ✕
            </button>

            <h3 className="text-3xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              AI Explanation
            </h3>

            {/* Type Pills */}
            <div className="flex flex-wrap gap-4 mb-6">
              {["technical", "simple", "hr"].map((type) => (
                <button
                  key={type}
                  onClick={() => setExplanationType(type)}
                  className={`px-4 py-2 rounded-full border transition ${
                    explanationType === type
                      ? "bg-gradient-to-r from-purple-600 to-blue-600"
                      : "border-white/20 hover:bg-white/10"
                  }`}
                >
                  {type.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Complexity Pills */}
            <div className="flex flex-wrap gap-4 mb-8">
              {["basic", "normal", "advanced"].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setComplexity(lvl)}
                  className={`px-4 py-2 rounded-full border transition ${
                    complexity === lvl
                      ? "bg-gradient-to-r from-purple-600 to-blue-600"
                      : "border-white/20 hover:bg-white/10"
                  }`}
                >
                  {lvl.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Regenerate */}
            <div className="mb-6">
              <button
                onClick={() => fetchExplanation(selectedSlug)}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:scale-105 transition"
              >
                {loading ? "Generating..." : "Explain Again"}
              </button>
            </div>

            {/* Explanation Content */}
            <div className="ai-scroll text-gray-300 max-h-[55vh] overflow-y-auto leading-relaxed text-lg pr-2">
              {loading ? (
                <div className="animate-pulse text-purple-400">
                  Generating explanation...
                </div>
              ) : (
                displayedText.split("\n").map((line, index) => (
                  <p key={index} className="mb-4">
                    {line}
                  </p>
                ))
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
