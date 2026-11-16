import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ChatModal from "../components/ChatModal";
import AsciiKoiCanvas from "../components/AsciiKoiCanvas";
import LiquidGlassCursor from "../components/LiquidGlassCursor";
import {
  LiquidChatOrb,
  LiquidGlassCard,
  LiquidGlassPill,
  LiquidLensFilter,
} from "../components/LiquidGlass";
import { TINT_ACCENTS, type GlassTint } from "../components/LiquidGlass.shared";
import { useCardLensMap } from "../hooks/useLensMap";
import { PAGE_SEO, PERSON_SCHEMA, setPageMetadata, SITE_ORIGIN } from "../seo";
import {
  FaBrain,
  FaServer,
  FaRobot,
  FaArrowRight,
  FaCheckCircle,
  FaLayerGroup,
  FaShieldAlt,
  FaTerminal,
  FaPaperPlane,
} from "react-icons/fa";
import { FiArrowUpRight } from "react-icons/fi";

const EASE = [0.16, 1, 0.3, 1] as const;

export default function Freelance() {
  const navigate = useNavigate();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const lensMapUrl = useCardLensMap();

  useEffect(() => {
    setPageMetadata({
      ...PAGE_SEO.freelance,
      structuredData: {
        "@context": "https://schema.org",
        "@graph": [
          PERSON_SCHEMA,
          {
            "@type": "Service",
            name: "AI application development",
            description:
              "AI applications, RAG systems, tool-calling assistants, and workflow automation for product teams.",
            provider: { "@id": `${SITE_ORIGIN}/#person` },
            url: `${SITE_ORIGIN}${PAGE_SEO.freelance.path}`,
            areaServed: ["India", "Europe", "United States"],
          },
        ],
      },
    });
  }, []);

  const services = [
    {
      id: "rag",
      icon: FaServer,
      label: "RAG",
      title: "RAG & Document Q&A",
      tagline: "Chatbots that answer from your documents and say where the answer came from",
      description:
        "I build retrieval-augmented systems on top of your own content: product docs, policies, catalogues, support history. The goal is answers grounded in your data, with sources shown, and an honest \"I don't know\" when the data doesn't cover it.",
      deliverables: [
        "Document ingestion and chunking pipeline",
        "Vector search with ChromaDB or pgvector",
        "Answers with source references",
        "A test set of your real questions to check quality",
      ],
      stack: ["Python", "LangChain", "ChromaDB", "pgvector", "Azure OpenAI"],
      tint: "cyan" as GlassTint,
    },
    {
      id: "agents",
      icon: FaRobot,
      label: "Agents",
      title: "AI Agents & Tool-Calling Assistants",
      tagline: "Assistants that look things up and take actions, not just chat",
      description:
        "Assistants that call your live database or APIs to answer questions and complete tasks like bookings, lookups, and multi-step workflows. Built with LangGraph so each step is explicit and easy to debug.",
      deliverables: [
        "Tool calling against live data",
        "LangGraph workflows with clear state",
        "Multilingual and voice interfaces",
        "Validation of model output before it hits your systems",
      ],
      stack: ["Python", "LangGraph", "Azure OpenAI", "Django / DRF"],
      tint: "mint" as GlassTint,
    },
    {
      id: "fullstack",
      icon: FaLayerGroup,
      label: "Full-stack",
      title: "Full-Stack Web Apps with AI Built In",
      tagline: "The product around the model: backend, frontend, deployment",
      description:
        "A working web app, not only a notebook or an API. Django backend, React and TypeScript frontend, streaming chat interfaces, and deployment, so your users get something they can actually open and use.",
      deliverables: [
        "Django REST backend and database design",
        "React + TypeScript frontend with streamed responses",
        "Authentication and admin tooling",
        "Deployment and setup notes",
      ],
      stack: ["React", "TypeScript", "Django", "Tailwind CSS", "Vite"],
      tint: "mint" as GlassTint,
    },
    {
      id: "automation",
      icon: FaShieldAlt,
      label: "Automation",
      title: "Automation & AI Websites for Small Businesses",
      tagline: "For restaurants, cafes, hotels, and shops that need to get online",
      description:
        "Fast, clean websites for small businesses, with an optional AI assistant that answers customer questions and handles routine messages on channels like Instagram and WhatsApp, so the owner spends less time replying to the same questions.",
      deliverables: [
        "Multilingual website, ready for mobile",
        "FAQ and booking assistant trained on your info",
        "Instagram / WhatsApp message automation",
        "Simple handoff so you can update content yourself",
      ],
      stack: ["React", "Python", "Messaging APIs", "Azure OpenAI"],
      tint: "gold" as GlassTint,
    },
  ];

  const projects = [
    {
      name: "Museum Ticket Bot",
      meta: "Team of 4 · I built the backend and AI side",
      desc: "A multilingual ticketing assistant that checks live availability in the database through tool calls and finishes the booking with a QR code.",
      chips: ["Tool calling", "Live database", "Multilingual", "QR booking"],
    },
    {
      name: "AdiYogi",
      meta: "Team of 4 · I built the backend and AI side",
      desc: "A voice assistant made of several cooperating agents, coordinated with LangGraph.",
      chips: ["LangGraph", "Multi-agent", "Voice"],
    },
    {
      name: "The assistant on this site",
      meta: "Solo project",
      desc: "The chat assistant you can open from this page. It answers from my projects and experience, caches repeat questions, and filters common prompt-injection phrases. I benchmarked it against the live deployment.",
      chips: ["RAG", "Response caching", "Prompt-injection filter"],
    },
  ];

  const workflowSteps = [
    {
      num: "01",
      name: "Scoping call",
      desc: "We talk through what you need, what data you have, and what \"working\" means for you. You get a short written scope with a clear first milestone.",
    },
    {
      num: "02",
      name: "Working prototype",
      desc: "A first version connected to your real documents or APIs, so you can test it with your own questions instead of a demo.",
    },
    {
      num: "03",
      name: "Make it reliable",
      desc: "Error handling, fallbacks, caching, basic protection against prompt injection, and tests for the parts that matter most.",
    },
    {
      num: "04",
      name: "Handoff",
      desc: "A clean repository, setup notes, and a walkthrough so your team can run and change it without me.",
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#000000] text-ivory font-sans overflow-x-hidden selection:bg-[#000000]/30 selection:text-ivory custom-cursor-wrapper">
      {/* ── Shared SVG Optical Refraction Filter for All Liquid Glass Cards ── */}
      {lensMapUrl && (
        <LiquidLensFilter id="panel-liquid-glass" mapUrl={lensMapUrl} preset="card" />
      )}

      {/* ── Custom Liquid Glass Cursor ── */}
      <LiquidGlassCursor />

      {/* ── Background: Live ASCII Koi Fish Pond ── */}
      <AsciiKoiCanvas />

      {/* Ambient gradient glow in center water */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_50%_30%,rgba(233,130,89,0.05)_0%,transparent_70%)]" />

      {/* ── Fixed Top Navbar ── */}
      <Navbar />

      {/* ── Main Content Container ── */}
      <main className="relative z-10 pt-28 md:pt-36 pb-24 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        {/* ── Hero Section ── */}
        <section className="text-center max-w-4xl mx-auto mb-20 md:mb-28">
          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl font-serif italic tracking-tight text-ivory leading-[1.08] mb-6 drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)]"
          >
            AI features for{" "}
            <span className="not-italic font-sans font-medium text-ivory">real products,</span>
            <br />
            built end to end.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-ivory-muted max-w-2xl mx-auto font-light leading-relaxed mb-10 drop-shadow-[0_2px_10px_rgba(0,0,0,0.75)]"
          >
            I'm Keval, a freelance AI application engineer. I build RAG systems, tool-calling
            assistants, and the web apps around them. Based in India, open to remote projects with
            teams in Europe and the US.
          </motion.p>

          {/* Quick CTA Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <LiquidGlassPill
              onClick={() => navigate("/collaborate")}
              variant="primary"
              className="px-7 py-3.5 text-sm font-medium text-ivory"
            >
              <span>Start a conversation</span>
              <FiArrowUpRight className="text-base text-vermilion" />
            </LiquidGlassPill>

            <LiquidGlassPill
              onClick={() => setIsChatOpen(true)}
              variant="secondary"
              className="px-7 py-3.5 text-sm font-medium text-ivory"
            >
              <FaBrain className="text-sm text-vermilion" />
              <span>Ask my AI assistant</span>
            </LiquidGlassPill>
          </motion.div>
        </section>

        {/* ── Services Grid ── */}
        <section className="mb-28">
          <div className="mb-10 pb-4 border-b border-white/[0.08]">
            <span className="font-mono text-xs text-vermilion uppercase tracking-[0.2em] block mb-2">
              01 // Services
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif italic text-ivory">
              What I can build for you
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
            {services.map((service, index) => {
              const Icon = service.icon;
              const badgeStyle = TINT_ACCENTS[service.tint].badge;

              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.6, ease: EASE, delay: index * 0.1 }}
                  className="h-full"
                >
                  <LiquidGlassCard
                    borderRadius={26}
                    tint={service.tint}
                    className="p-7 sm:p-9 h-full transition-transform duration-500 hover:-translate-y-1"
                  >
                    <div>
                      {/* Top Bar with Icon & Tag */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="liquid-icon-box w-12 h-12 rounded-2xl flex items-center justify-center text-vermilion text-xl">
                          <Icon />
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-mono tracking-widest uppercase border ${badgeStyle}`}
                        >
                          {service.label}
                        </span>
                      </div>

                      {/* Title & Tagline */}
                      <h3 className="text-xl sm:text-2xl font-serif italic text-ivory mb-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                        {service.title}
                      </h3>
                      <p className="text-xs font-mono tracking-wider text-vermilion mb-4 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
                        {service.tagline}
                      </p>

                      <p className="text-sm text-ivory-soft leading-relaxed mb-6 font-light drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)]">
                        {service.description}
                      </p>

                      {/* Key Deliverables */}
                      <div className="space-y-2.5 mb-8">
                        {service.deliverables.map((item, dIdx) => (
                          <div
                            key={dIdx}
                            className="flex items-start gap-2.5 text-xs text-ivory drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)]"
                          >
                            <FaCheckCircle className="text-vermilion text-[11px] mt-0.5 shrink-0" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tech Stack Chips & CTA */}
                    <div className="pt-6 border-t border-white/[0.09] flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap gap-1.5">
                        {service.stack.map((tech, tIdx) => (
                          <span
                            key={tIdx}
                            className="liquid-chip px-2.5 py-1 rounded-full text-[10px] font-mono text-ivory-soft"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>

                      <button
                        onClick={() => navigate("/collaborate")}
                        className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-vermilion hover:text-ivory transition-colors cursor-pointer group"
                      >
                        <span>Discuss this</span>
                        <FaArrowRight className="text-[10px] group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </LiquidGlassCard>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* ── Selected Work ── */}
        <section className="mb-28">
          <div className="mb-10 pb-4 border-b border-white/[0.08]">
            <span className="font-mono text-xs text-vermilion uppercase tracking-[0.2em] block mb-2">
              02 // Work
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif italic text-ivory">
              What I've built so far
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {projects.map((project, idx) => (
              <motion.div
                key={project.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.55, ease: EASE, delay: idx * 0.08 }}
                className="h-full"
              >
                <LiquidGlassCard
                  borderRadius={22}
                  tint="neutral"
                  zoom={0.86}
                  className="p-7 h-full transition-transform duration-500 hover:-translate-y-1"
                >
                  <div>
                    <h4 className="text-xl font-serif italic text-ivory mb-1.5 drop-shadow-[0_1px_6px_rgba(0,0,0,0.8)]">
                      {project.name}
                    </h4>
                    <p className="text-xs font-mono tracking-wider text-vermilion mb-4 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
                      {project.meta}
                    </p>
                    <p className="text-sm text-ivory-soft leading-relaxed font-light mb-6 drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)]">
                      {project.desc}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {project.chips.map((chip) => (
                      <span
                        key={chip}
                        className="liquid-chip px-2.5 py-1 rounded-full text-[10px] font-mono text-ivory-soft"
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                </LiquidGlassCard>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Engineering Process ── */}
        <section className="mb-28">
          <div className="mb-10 pb-4 border-b border-white/[0.08]">
            <span className="font-mono text-xs text-vermilion uppercase tracking-[0.2em] block mb-2">
              03 // Process
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif italic text-ivory">
              How a project runs
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {workflowSteps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.55, ease: EASE, delay: idx * 0.08 }}
                className="h-full"
              >
                <LiquidGlassCard
                  borderRadius={22}
                  tint="neutral"
                  zoom={0.84}
                  className="p-6 h-full transition-transform duration-500 hover:-translate-y-1"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-mono text-2xl font-semibold text-vermilion/80 drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">
                        {step.num}
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                    </div>
                    <h4 className="text-lg font-serif italic text-ivory mb-2 drop-shadow-[0_1px_6px_rgba(0,0,0,0.8)]">
                      {step.name}
                    </h4>
                    <p className="text-xs text-ivory-muted leading-relaxed font-light drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)]">
                      {step.desc}
                    </p>
                  </div>
                </LiquidGlassCard>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Call To Action Liquid Glass Panel ── */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <LiquidGlassCard
              borderRadius={32}
              tint="mint"
              zoom={0.9}
              className="p-8 sm:p-14 text-center max-w-4xl mx-auto"
            >
              <div className="max-w-2xl mx-auto">
                <span className="liquid-icon-box w-13 h-13 rounded-full inline-flex items-center justify-center text-xl text-vermilion mb-6">
                  <FaPaperPlane />
                </span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif italic text-ivory mb-4 drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
                  Have a project in mind?
                </h2>
                <p className="text-sm sm:text-base text-ivory-soft font-light leading-relaxed mb-9 drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)]">
                  I'm early in my freelance career, so I keep projects small and clearly scoped, and
                  show you working progress early. Tell me what you're trying to build and I'll
                  tell you honestly whether I'm the right person for it.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-4">
                  <LiquidGlassPill
                    onClick={() => navigate("/collaborate")}
                    variant="primary"
                    className="px-8 py-4 font-mono text-xs tracking-widest uppercase text-ivory"
                  >
                    <span>Start a project</span>
                    <FiArrowUpRight className="text-sm text-vermilion" />
                  </LiquidGlassPill>

                  <LiquidGlassPill
                    onClick={() => setIsChatOpen(true)}
                    variant="secondary"
                    className="px-8 py-4 font-mono text-xs tracking-widest uppercase text-ivory"
                  >
                    <FaTerminal className="text-xs text-vermilion" />
                    <span>Ask the AI assistant</span>
                  </LiquidGlassPill>
                </div>
              </div>
            </LiquidGlassCard>
          </motion.div>
        </section>
      </main>

      {/* ── Floating Spherical Liquid Glass Chat Orb ── */}
      <AnimatePresence>
        {!isChatOpen && (
          <motion.div
            key="freelance-chat-orb"
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

      <ChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} mode="sales" />

      {/* ── Footer ── */}
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
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&family=Dancing+Script:wght@600&display=swap');

        * { box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        .font-serif { font-family: 'Playfair Display', serif; }
        .custom-cursor-wrapper * { cursor: none !important; }

        /* ── Smoked Apple Liquid Glass Card ───────────────────────── */
        .liquid-glass-card {
          --mx: 50%;
          --my: 50%;
          /* No base background: pure glass */
          backdrop-filter: url(#panel-liquid-glass) blur(2.5px) saturate(145%) brightness(0.75);
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
            inset 0 1px 1px 0 rgba(255, 255, 255, 0.3),
            inset 0 -1.5px 2px 0 rgba(255, 255, 255, 0.08),
            0 22px 48px -8px rgba(0, 0, 0, 0.78);
        }

        /* ── Whisper-Thin Specular Meniscus Rim ──────────────────── */
        .liquid-card-rim {
          position: absolute;
          inset: 0;
          padding: 1px;
          background: linear-gradient(
            165deg,
            rgba(255, 255, 255, 0.26) 0%,
            rgba(255, 255, 255, 0.02) 38%,
            transparent 68%,
            transparent 100%
          );
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          z-index: 1;
        }

        /* ── Subtle Interactive Pointer Glint ────────────────────── */
        .liquid-card-glare {
          position: absolute;
          inset: 0;
          background: radial-gradient(
            260px circle at var(--mx) var(--my),
            rgba(255, 255, 255, 0.065),
            transparent 70%
          );
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: 1;
        }
        .liquid-glass-card:hover .liquid-card-glare {
          opacity: 1;
        }

        /* ── Inner Glass Elements (Icon Boxes & Stack Chips) ─────── */
        .liquid-icon-box {
          /* No base background: pure glass */
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow:
            inset 0 1px 0.5px rgba(255, 255, 255, 0.25),
            0 4px 12px rgba(0, 0, 0, 0.35);
        }
        .liquid-chip {
          /* No base background: pure glass */
          border: 1px solid rgba(255, 255, 255, 0.09);
          box-shadow: inset 0 1px 0.5px rgba(255, 255, 255, 0.16);
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
        }

        /* ── Liquid Glass Pill Buttons ───────────────────────────── */
        .liquid-pill-btn {
          backdrop-filter: url(#apple-liquid-glass) blur(2.5px) saturate(145%) brightness(0.76);
          -webkit-backdrop-filter: blur(3px) saturate(145%) brightness(0.76);
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.85);
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }
        .liquid-pill-primary {
          /* No base background: pure glass */
          border: 1px solid rgba(255, 255, 255, 0.14);
          box-shadow:
            inset 0 1px 0.5px rgba(255, 255, 255, 0.28),
            inset 0 -1px 1.5px rgba(255, 255, 255, 0.08),
            0 10px 28px -4px rgba(0, 0, 0, 0.55);
        }
        .liquid-pill-primary:hover {
          border-color: rgba(255, 255, 255, 0.3);
          box-shadow:
            inset 0 1px 1px rgba(255, 255, 255, 0.38),
            inset 0 -1px 2px rgba(255, 255, 255, 0.1),
            0 14px 34px -4px rgba(0, 0, 0, 0.7);
        }
        .liquid-pill-secondary {
          /* No base background: pure glass */
          border: 1px solid rgba(255, 255, 255, 0.11);
          box-shadow:
            inset 0 1px 0.5px rgba(255, 255, 255, 0.22),
            inset 0 -1px 1px rgba(255, 255, 255, 0.08),
            0 10px 28px -4px rgba(0, 0, 0, 0.5);
        }
        .liquid-pill-secondary:hover {
          border-color: rgba(255, 255, 255, 0.22);
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
    </div>
  );
}
