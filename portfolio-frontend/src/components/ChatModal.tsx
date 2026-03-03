import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FiSend, FiX, FiZap } from "react-icons/fi";
import { FaBrain } from "react-icons/fa";

interface Message {
  role: "user" | "ai";
  content: string;
}

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: "normal" | "sales";
}

const MODES = {
  normal: {
    tag: "portfolio.ai",
    title: "Ask me anything",
    greeting: "Hi! I'm Keval's AI assistant. Ask me anything about his experience, projects, or tech stack!",
    placeholder: "Ask about experience, projects...",
    chips: ["What's your tech stack?", "Tell me about his projects", "Do you have LLM experience?"]
  },
  sales: {
    tag: "scoping.ai",
    title: "Architecture Scoping AI",
    greeting: "Hello. I am Keval's technical scoping assistant. Tell me a bit about the system you are trying to build, and I will explain how we can architect it.",
    placeholder: "Describe your architecture needs...",
    chips: ["I need LLM integration", "Looking for a custom RAG pipeline", "Are you available for freelance?"]
  }
};

const TypingDots = () => (
  <div className="flex items-center gap-1.5 px-4 py-3">
    {[0, 1, 2].map(i => (
      <motion.span
        key={i}
        className="w-1.5 h-1.5 rounded-full bg-cyan-400"
        animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
        transition={{ duration: 1, repeat: Infinity, delay: i * 0.18, ease: "easeInOut" }}
      />
    ))}
  </div>
);

export default function ChatModal({ isOpen, onClose, mode = "normal" }: ChatModalProps) {
  const config = MODES[mode];
  const [messages, setMessages] = useState<Message[]>([{ role: "ai", content: config.greeting }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
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
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // NEW: Handle mobile keyboard push
  const handleInputFocus = () => {
    // Small timeout to allow the mobile keyboard animation to finish/resize the viewport
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: "smooth"
        });
      }
    }, 300);
  };

  const handleSend = async (text: string, isSuggested = false) => {
    if (!text.trim() || loading) return;
    const userMsg = text.trim();
    const chatHistory = messages.slice(-4).map(m => ({ role: m.role, content: m.content }));

    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setInput("");
    setLoading(true);

    try {
      const res = await api.post("chat/", {
        message: userMsg,
        is_suggested: isSuggested,
        history: chatHistory,
        mode: mode
      });
      setMessages(prev => [...prev, { role: "ai", content: res.data.content }]);
    } catch {
      setMessages(prev => [...prev, { role: "ai", content: "Sorry, I'm having trouble connecting to the neural stack right now. Try again later!" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={onClose}
            />

            <motion.div
              initial={{ opacity: 0, y: "100%", scale: 1 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: "100%", scale: 1 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="chat-modal fixed bottom-0 left-0 right-0 sm:bottom-6 sm:right-6 sm:left-auto z-50 w-full sm:w-[420px] flex flex-col"
            >
              <div className="chat-header flex items-center justify-between px-5 py-4 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="chat-icon-wrap">
                    <FaBrain className={`text-sm ${mode === 'sales' ? 'text-violet-400' : 'text-cyan-400'}`} />
                    <span className="chat-icon-ping" />
                  </div>
                  <div>
                    <p className={`font-mono text-[9px] tracking-[0.2em] uppercase ${mode === 'sales' ? 'text-violet-400/60' : 'text-cyan-400/60'}`}>
                      {config.tag}
                    </p>
                    <p className="text-sm font-semibold text-white leading-tight">{config.title}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-mono text-[9px] text-emerald-400 tracking-widest">ONLINE</span>
                  </div>
                  <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5">
                    <FiX size={16} />
                  </button>
                </div>
              </div>

              <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3 chat-scroll min-h-0">
                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.role === "ai" && (
                      <div className={`w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0 mr-2 mt-1 ${mode === 'sales' ? 'border-violet-500/20 bg-violet-500/10' : ''}`}>
                        <FaBrain className={`text-[9px] ${mode === 'sales' ? 'text-violet-400' : 'text-cyan-400'}`} />
                      </div>
                    )}
                    <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed chat-markdown ${msg.role === "user" ? "user-bubble" : "ai-bubble"}`}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                    </div>
                  </motion.div>
                ))}
                {loading && (
                   <div className="flex justify-start">
                    <div className={`w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0 mr-2 mt-1 ${mode === 'sales' ? 'border-violet-500/20 bg-violet-500/10' : ''}`}>
                      <FaBrain className={`text-[9px] ${mode === 'sales' ? 'text-violet-400' : 'text-cyan-400'}`} />
                    </div>
                    <div className="ai-bubble rounded-2xl"><TypingDots /></div>
                  </div>
                )}
              </div>

              <AnimatePresence>
                {messages.length === 1 && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="px-4 pb-2 flex flex-wrap gap-2">
                    {config.chips.map((chip, i) => (
                      <button key={i} onClick={() => handleSend(chip, true)} className="chip">
                        <FiZap className={`text-[10px] ${mode === 'sales' ? 'text-violet-400' : 'text-cyan-400'}`} />
                        {chip}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="chat-input-area px-4 py-3 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onFocus={handleInputFocus}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleSend(input)}
                      placeholder={config.placeholder}
                      className="chat-input w-full"
                      disabled={loading}
                    />
                  </div>
                  <motion.button
                    onClick={() => handleSend(input)}
                    disabled={loading || !input.trim()}
                    className="send-btn shrink-0 disabled:opacity-40"
                  >
                    <FiSend size={15} />
                  </motion.button>
                </div>
                <p className="font-mono text-[8px] text-gray-600 tracking-widest text-center mt-2">
                  POWERED BY KEVAL'S AI
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        .chat-modal {
          /* 1. Use svh (small viewport height) to respect mobile toolbars/keyboard */
          max-height: 92svh;
          background: rgba(9, 13, 20, 0.98);
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
          border: 1px solid rgba(34,211,238,0.12);
          box-shadow: 0 -8px 48px rgba(0,0,0,0.6);
        }

        @media (max-width: 640px) {
          .chat-modal {
            border-radius: 1.5rem 1.5rem 0 0;
            /* 2. Important: Stay at the bottom of the visual viewport when keyboard is up */
            bottom: 0;
            width: 100%;
          }
          /* Ensure font size is 16px to prevent iOS auto-zoom on focus */
          .chat-input {
            font-size: 16px !important;
          }
        }

        @media (min-width: 641px) {
          .chat-modal {
            border-radius: 1.5rem;
            max-height: 700px;
            border-bottom: 1px solid rgba(34,211,238,0.12);
          }
        }

        .chat-header { border-bottom: 1px solid rgba(255,255,255,0.05); }
        .chat-icon-wrap {
          position: relative;
          width: 32px; height: 32px;
          border-radius: 10px;
          background: rgba(34,211,238,0.08);
          border: 1px solid rgba(34,211,238,0.2);
          display: flex; align-items: center; justify-content: center;
        }
        .chat-icon-ping {
          position: absolute;
          inset: -2px;
          border-radius: 12px;
          border: 1px solid rgba(34,211,238,0.3);
          animation: ping 2s cubic-bezier(0,0,0.2,1) infinite;
        }
        @keyframes ping { 75%, 100% { transform: scale(1.3); opacity: 0; } }

        .user-bubble {
          background: rgba(34,211,238,0.1);
          border: 1px solid rgba(34,211,238,0.2);
          color: #e2e8f0;
          border-top-right-radius: 4px !important;
        }
        .ai-bubble {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          color: #cbd5e1;
          border-top-left-radius: 4px !important;
        }

        .chip {
          display: inline-flex; align-items: center; gap: 0.375rem;
          font-family: 'Space Mono', monospace;
          font-size: 0.65rem;
          padding: 0.375rem 0.75rem;
          border-radius: 9999px;
          background: rgba(34,211,238,0.05);
          border: 1px solid rgba(34,211,238,0.15);
          color: rgba(148,163,184,0.9);
          transition: all 0.2s ease;
        }
        .chip:hover { background: rgba(34,211,238,0.12); color: #22d3ee; }

        .chat-input-area { border-top: 1px solid rgba(255,255,255,0.05); }
        .chat-input {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 0.875rem;
          padding: 0.75rem 1rem;
          color: white;
          outline: none;
        }
        .chat-input:focus { border-color: rgba(34,211,238,0.4); }

        .send-btn {
          width: 40px; height: 40px;
          border-radius: 0.75rem;
          background: linear-gradient(135deg, #22d3ee, #6366f1);
          color: white;
          display: flex; align-items: center; justify-content: center;
          border: none;
        }

        .chat-scroll::-webkit-scrollbar { width: 3px; }
        .chat-scroll::-webkit-scrollbar-thumb { background: rgba(34,211,238,0.2); border-radius: 10px; }

        .chat-markdown p { margin-bottom: 0.4rem; }
        .chat-markdown p:last-child { margin-bottom: 0; }
        .chat-markdown ul { list-style: none; padding-left: 0.75rem; }
        .chat-markdown ul li::before { content: "▸ "; color: #22d3ee; font-size: 0.75em; }
      `}</style>
    </>
  );
}