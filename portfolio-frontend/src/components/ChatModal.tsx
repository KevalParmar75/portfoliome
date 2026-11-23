import { useState, useRef, useEffect, type MouseEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FiSend, FiX, FiZap } from "react-icons/fi";
import { FaBrain } from "react-icons/fa";
import { koiManager } from "./KoiCanvasContext";
import { LiquidLensFilter } from "./LiquidGlass";
import { useCardLensMap } from "../hooks/useLensMap";

interface Message {
  role: "user" | "ai";
  content: string;
}

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: "normal" | "sales";
  context?: string;
}

const LENS_ID = "chat-liquid-glass";

const MODES = {
  normal: {
    tag: "portfolio.ai",
    title: "Ask me anything",
    greeting:
      "Hi! I'm Keval's AI assistant. Ask me about his freelance services, case studies, or tech stack!",
    placeholder: "Ask about freelance work, case studies...",
    chips: [
      "Are you available for freelance work?",
      "What is your typical engagement model?",
      "Tell me about your client projects",
    ],
  },
  sales: {
    tag: "scoping.ai",
    title: "Architecture Scoping AI",
    greeting:
      "Hello. I am Keval's technical scoping assistant. Tell me a bit about the system you are trying to build, and I will explain how we can architect it.",
    placeholder: "Describe your architecture needs...",
    chips: [
      "I need LLM integration",
      "Looking for a custom RAG pipeline",
      "Are you available for freelance?",
    ],
  },
};

/* ── Typing indicator ──────────────────────────────────────────────────────── */
const TypingDots = () => (
  <div className="flex items-center gap-1.5 px-4 py-3">
    {[0, 1, 2].map((i) => (
      <motion.span
        key={i}
        className="w-1.5 h-1.5 rounded-full bg-ivory-soft"
        animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
        transition={{
          duration: 1,
          repeat: Infinity,
          delay: i * 0.18,
          ease: "easeInOut",
        }}
      />
    ))}
  </div>
);

export default function ChatModal({
  isOpen,
  onClose,
  mode = "normal",
  context,
}: ChatModalProps) {
  const config = MODES[mode];
  const lensMapUrl = useCardLensMap();

  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", content: config.greeting },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const refractCanvasRef = useRef<HTMLCanvasElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMessages([{ role: "ai", content: config.greeting }]);
    setInput("");
  }, [mode, config.greeting]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Live Koi Pond Optical Refraction Engine
  useEffect(() => {
    if (!isOpen) return;
    const modal = modalRef.current;
    const canvas = refractCanvasRef.current;
    if (!modal || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const unsubscribe = koiManager.subscribe((sourceCanvas: HTMLCanvasElement) => {
      const rect = modal.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const cw = Math.max(1, Math.round(rect.width * dpr * 0.65));
      const ch = Math.max(1, Math.round(rect.height * dpr * 0.65));
      if (canvas.width !== cw || canvas.height !== ch) {
        canvas.width = cw;
        canvas.height = ch;
      }

      const scaleX = sourceCanvas.width / window.innerWidth;
      const scaleY = sourceCanvas.height / window.innerHeight;
      const sx = rect.left * scaleX;
      const sy = rect.top * scaleY;
      const sw = rect.width * scaleX;
      const sh = rect.height * scaleY;

      const zoom = 0.86;
      const zx = sx + sw * ((1 - zoom) * 0.5);
      const zy = sy + sh * ((1 - zoom) * 0.5);
      const zw = sw * zoom;
      const zh = sh * zoom;

      ctx.clearRect(0, 0, cw, ch);
      ctx.save();

      ctx.filter = "blur(2.4px) saturate(145%) brightness(0.85)";
      ctx.drawImage(sourceCanvas, zx, zy, zw, zh, 0, 0, cw, ch);

      ctx.globalCompositeOperation = "screen";
      ctx.globalAlpha = 0.25;
      ctx.filter = "blur(0.5px) saturate(180%)";
      const shift = 4.5 * scaleX;
      ctx.drawImage(
        sourceCanvas,
        sx - shift,
        sy - shift * 0.6,
        sw + shift * 2,
        sh + shift * 1.2,
        0,
        0,
        cw,
        ch
      );
      ctx.restore();
    });

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [isOpen]);

  const handlePointerMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = modalRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty("--mx", `${x.toFixed(1)}%`);
    el.style.setProperty("--my", `${y.toFixed(1)}%`);
  };

  // Handle mobile keyboard push
  const handleInputFocus = () => {
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
    }, 300);
  };

  const handleSend = async (text: string, isSuggested = false) => {
    if (!text.trim() || loading) return;
    const userMsg = text.trim();
    const chatHistory = messages
      .slice(-4)
      .map((m) => ({ role: m.role, content: m.content }));

    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setInput("");
    setLoading(true);

    try {
      const res = await api.post("chat/", {
        message: userMsg,
        is_suggested: isSuggested,
        history: chatHistory,
        mode: mode,
        context,
      });
      setMessages((prev) => [...prev, { role: "ai", content: res.data.content }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content:
            "Sorry, I'm having trouble connecting to the neural stack right now. Try again later!",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <LiquidLensFilter id={LENS_ID} mapUrl={lensMapUrl} preset="chat" />

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/45 backdrop-blur-[2px]"
              onClick={onClose}
            />

            <motion.div
              ref={modalRef}
              onMouseMove={handlePointerMove}
              initial={{ opacity: 0, y: "100%", scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: "100%", scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="chat-modal fixed bottom-0 left-0 right-0 sm:bottom-6 sm:right-6 sm:left-auto z-50 w-full sm:w-[420px] flex flex-col overflow-hidden"
            >
              {/* Layer 1: Live Refracted Koi Pond Canvas */}
              <canvas
                ref={refractCanvasRef}
                className="absolute inset-0 w-full h-full pointer-events-none opacity-50 mix-blend-screen z-0"
              />

              {/* Layer 2: Whisper-Thin Specular Meniscus Rim + Neutral Glare */}
              <div className="chat-specular-rim pointer-events-none" />
              <div className="chat-caustic-glare pointer-events-none" />

              {/* ── Header ── */}
              <div className="chat-header relative z-10 flex items-center justify-between px-5 py-4 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="chat-icon-wrap">
                    <FaBrain className="text-sm text-vermilion" />
                    <span className="chat-icon-ping" />
                  </div>
                  <div>
                    <p className="font-mono text-[9px] tracking-[0.22em] uppercase text-ivory-faint">
                      {config.tag}
                    </p>
                    <p className="text-sm font-serif italic font-medium text-ivory leading-tight drop-shadow-[0_1px_6px_rgba(0,0,0,0.85)]">
                      {config.title}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.1] shadow-[inset_0_1px_0.5px_rgba(255,255,255,0.2)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-vermilion shadow-[0_0_6px_#E98259] animate-pulse" />
                    <span className="font-mono text-[9px] text-[#e9efe9] tracking-widest">
                      ONLINE
                    </span>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-ivory-faint hover:text-ivory transition-colors p-1.5 rounded-lg hover:bg-white/[0.06] cursor-pointer"
                    aria-label="Close chat"
                  >
                    <FiX size={16} />
                  </button>
                </div>
              </div>

              {/* ── Messages Scroll Area ── */}
              <div
                ref={scrollRef}
                className="relative z-10 flex-1 overflow-y-auto px-4 py-3.5 space-y-3.5 chat-scroll min-h-0"
              >
                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                  >
                    {msg.role === "ai" && (
                      <div className="chat-ai-avatar w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mr-2 mt-1">
                        <FaBrain className="text-[10px] text-vermilion" />
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed chat-markdown ${msg.role === "user" ? "user-bubble" : "ai-bubble"
                        }`}
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
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  </motion.div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="chat-ai-avatar w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mr-2 mt-1">
                      <FaBrain className="text-[10px] text-vermilion" />
                    </div>
                    <div className="ai-bubble rounded-2xl">
                      <TypingDots />
                    </div>
                  </div>
                )}
              </div>

              {/* ── Suggested Chips ── */}
              <AnimatePresence>
                {messages.length === 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="relative z-10 px-4 pb-2.5 flex flex-wrap gap-2"
                  >
                    {config.chips.map((chip, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(chip, true)}
                        className="chip"
                      >
                        <FiZap className="text-[10px] text-vermilion" />
                        <span>{chip}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Input Area ── */}
              <div className="chat-input-area relative z-10 px-4 py-3 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onFocus={handleInputFocus}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
                      placeholder={config.placeholder}
                      className="chat-input w-full"
                      disabled={loading}
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => handleSend(input)}
                    disabled={loading || !input.trim()}
                    className="send-btn shrink-0 disabled:opacity-40"
                    aria-label="Send message"
                  >
                    <FiSend size={15} />
                  </motion.button>
                </div>
                <p className="font-mono text-[8px] text-[#7d9284] tracking-[0.22em] text-center mt-2 uppercase">
                  POWERED BY KEVAL'S AI
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        /* ── Smoked Obsidian Crystal Liquid Glass (Zero Orange Glow) ── */
        .chat-modal {
          --mx: 50%;
          --my: 50%;
          max-height: 92svh;
          background: rgba(4, 8, 6, 0.48);
          backdrop-filter: url(#chat-liquid-glass) blur(3px) saturate(145%) brightness(0.75);
          -webkit-backdrop-filter: blur(3.5px) saturate(145%) brightness(0.75);
          border: 1px solid rgba(255, 255, 255, 0.09);
          box-shadow:
            inset 0 1px 0.5px 0 rgba(255, 255, 255, 0.22),
            inset 0 -1px 1.5px 0 rgba(233, 130, 89, 0.12),
            0 24px 60px -8px rgba(0, 0, 0, 0.78);
        }

        @media (max-width: 640px) {
          .chat-modal {
            border-radius: 1.5rem 1.5rem 0 0;
            bottom: 0;
            width: 100%;
          }
          .chat-specular-rim, .chat-caustic-glare {
            border-radius: 1.5rem 1.5rem 0 0;
          }
          .chat-input {
            font-size: 16px !important;
          }
        }

        @media (min-width: 641px) {
          .chat-modal {
            border-radius: 1.6rem;
            max-height: 680px;
          }
          .chat-specular-rim, .chat-caustic-glare {
            border-radius: 1.6rem;
          }
        }

        /* ── Whisper-Thin Neutral Specular Meniscus Rim ── */
        .chat-specular-rim {
          position: absolute;
          inset: 0;
          padding: 1px;
          background: linear-gradient(
            165deg,
            rgba(255, 255, 255, 0.24) 0%,
            rgba(255, 255, 255, 0.02) 38%,
            transparent 68%,
            rgba(233, 130, 89, 0.14) 100%
          );
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          z-index: 1;
        }

        /* ── Subtle Pointer Caustic Glint ── */
        .chat-caustic-glare {
          position: absolute;
          inset: 0;
          background: radial-gradient(
            240px circle at var(--mx) var(--my),
            rgba(255, 255, 255, 0.055),
            transparent 70%
          );
          z-index: 1;
        }

        .chat-header {
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.015);
        }

        .chat-icon-wrap {
          position: relative;
          width: 34px;
          height: 34px;
          border-radius: 11px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow:
            inset 0 1px 0.5px rgba(255, 255, 255, 0.22),
            0 4px 12px rgba(0, 0, 0, 0.35);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .chat-icon-ping {
          position: absolute;
          inset: -2px;
          border-radius: 13px;
          border: 1px solid rgba(242, 239, 230, 0.2);
          animation: ping 2.2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        @keyframes ping {
          75%, 100% { transform: scale(1.28); opacity: 0; }
        }

        .chat-ai-avatar {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.11);
          box-shadow: inset 0 1px 0.5px rgba(255, 255, 255, 0.2);
        }

        /* ── Liquid Glass Message Bubbles ── */
        .user-bubble {
          background: rgba(242, 239, 230, 0.12);
          border: 1px solid rgba(242, 239, 230, 0.24);
          color: var(--color-text-primary);
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
          box-shadow:
            inset 0 1px 0.5px rgba(255, 255, 255, 0.26),
            0 6px 18px rgba(0, 0, 0, 0.35);
          border-top-right-radius: 4px !important;
        }
        .ai-bubble {
          background: rgba(255, 255, 255, 0.045);
          border: 1px solid rgba(255, 255, 255, 0.09);
          color: #e2ede5;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.85);
          box-shadow:
            inset 0 1px 0.5px rgba(255, 255, 255, 0.18),
            0 6px 18px rgba(0, 0, 0, 0.3);
          border-top-left-radius: 4px !important;
        }

        /* ── Quick Prompt Chips ── */
        .chip {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-family: 'Inter', sans-serif;
          font-size: 0.68rem;
          padding: 0.4rem 0.8rem;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow:
            inset 0 1px 0.5px rgba(255, 255, 255, 0.18),
            0 4px 12px rgba(0, 0, 0, 0.3);
          color: #E5E1D3;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.85);
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .chip:hover {
          background: rgba(255, 255, 255, 0.09);
          border-color: rgba(233, 130, 89, 0.32);
          color: var(--color-text-primary);
          transform: translateY(-1px);
        }

        /* ── Input Bar & Send Button ── */
        .chat-input-area {
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(0, 0, 0, 0.18);
        }
        .chat-input {
          background: rgba(255, 255, 255, 0.035);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0.875rem;
          padding: 0.72rem 1rem;
          font-size: 0.85rem;
          color: var(--color-text-primary);
          outline: none;
          box-shadow:
            inset 0 1px 2px rgba(0, 0, 0, 0.45),
            inset 0 1px 0.5px rgba(255, 255, 255, 0.12);
          transition: all 0.2s ease;
        }
        .chat-input::placeholder {
          color: rgba(180, 198, 186, 0.45);
        }
        .chat-input:focus {
          background: rgba(255, 255, 255, 0.055);
          border-color: rgba(242, 239, 230, 0.35);
          box-shadow:
            inset 0 1px 1px rgba(255, 255, 255, 0.2),
            0 0 14px rgba(233, 130, 89, 0.08);
        }

        .send-btn {
          width: 42px;
          height: 42px;
          border-radius: 0.85rem;
          background: rgba(255, 255, 255, 0.06);
          color: var(--color-text-accent);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255, 255, 255, 0.14);
          box-shadow:
            inset 0 1px 0.5px rgba(255, 255, 255, 0.24),
            0 6px 16px rgba(0, 0, 0, 0.35);
          transition: all 0.25s ease;
          cursor: pointer;
        }
        .send-btn:hover:not(:disabled) {
          background: rgba(242, 239, 230, 0.14);
          border-color: rgba(242, 239, 230, 0.35);
          color: var(--color-text-primary);
          box-shadow:
            inset 0 1px 1px rgba(255, 255, 255, 0.35),
            0 8px 20px rgba(0, 0, 0, 0.45);
        }

        .chat-scroll::-webkit-scrollbar { width: 3px; }
        .chat-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 10px;
        }

        .chat-markdown p { margin-bottom: 0.4rem; }
        .chat-markdown p:last-child { margin-bottom: 0; }
        .chat-markdown strong { color: var(--color-text-primary); font-weight: 600; }
        .chat-markdown ul { list-style: none; padding-left: 0.75rem; }
        .chat-markdown ul li::before {
          content: "▸ ";
          color: var(--color-text-accent);
          font-size: 0.75em;
        }
      `}</style>
    </>
  );
}
