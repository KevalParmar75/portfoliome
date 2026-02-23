import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import api from "../api/axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  role: "user" | "ai";
  content: string;
}

// ─── Animated message bubble ──────────────────────────────────────────────────
const MessageBubble = ({ msg, idx }: { msg: Message; idx: number }) => {
  const isUser = msg.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.03 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      {/* AI avatar dot */}
      {!isUser && (
        <div className="flex flex-col items-center mr-2 mt-1 shrink-0">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-[0_0_12px_rgba(255,106,0,0.6)]">
            <span className="text-[8px] font-bold text-white">AI</span>
          </div>
        </div>
      )}

      <div className={`relative max-w-[88%] sm:max-w-[80%] group ${isUser ? "" : ""}`}>
        {/* AI left accent bar */}
        {!isUser && (
          <motion.div
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.35, ease: "easeOut", delay: 0.05 }}
            className="absolute -left-2 top-2 bottom-2 w-[2px] rounded-full bg-gradient-to-b from-orange-500 to-red-500 origin-top"
          />
        )}

        <div className={`
          relative rounded-2xl px-4 sm:px-5 py-3 text-sm leading-relaxed chat-markdown overflow-hidden
          ${isUser
            ? "bg-gradient-to-br from-orange-600/20 to-red-600/15 border border-orange-500/25 rounded-tr-sm shadow-[0_4px_20px_rgba(255,106,0,0.12),inset_0_0_20px_rgba(255,106,0,0.05)]"
            : "bg-black/30 border border-white/8 rounded-tl-sm shadow-[inset_0_0_20px_rgba(255,255,255,0.02)] backdrop-blur-xl"
          }
        `}>
          {/* User bubble shimmer line */}
          {isUser && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-400/5 to-transparent pointer-events-none" />
          )}

          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {msg.content}
          </ReactMarkdown>
        </div>

        {/* User timestamp-style glow trail */}
        {isUser && (
          <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-orange-500/40 to-transparent rounded-full blur-sm" />
        )}
      </div>
    </motion.div>
  );
};

// ─── Neural wave typing indicator ─────────────────────────────────────────────
const TypingIndicator = () => (
  <motion.div
    initial={{ opacity: 0, y: 12, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 6, scale: 0.95 }}
    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    className="flex justify-start items-end gap-2"
  >
    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-[0_0_12px_rgba(255,106,0,0.6)] shrink-0">
      <span className="text-[8px] font-bold text-white">AI</span>
    </div>
    <div className="bg-black/40 border border-white/8 rounded-2xl rounded-tl-sm px-5 py-4 backdrop-blur-xl">
      <div className="flex items-center gap-1 h-3">
        {[0, 1, 2, 3, 4].map(i => (
          <motion.div
            key={i}
            className="w-0.5 rounded-full bg-gradient-to-t from-orange-500 to-red-400"
            animate={{ height: ["6px", "16px", "6px"] }}
            transition={{
              duration: 0.9,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.1,
            }}
          />
        ))}
      </div>
    </div>
  </motion.div>
);

// ─── Quick chip ───────────────────────────────────────────────────────────────
const QuickChip = ({ label, onClick, idx }: { label: string; onClick: () => void; idx: number }) => (
  <motion.button
    initial={{ opacity: 0, y: 10, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ delay: idx * 0.08, type: "spring", stiffness: 300, damping: 20 }}
    whileHover={{ scale: 1.05, y: -2 }}
    whileTap={{ scale: 0.97 }}
    onClick={onClick}
    className="relative text-xs border border-orange-500/20 hover:border-orange-500/50 transition-all px-3 py-1.5 rounded-full text-gray-300 hover:text-white whitespace-nowrap overflow-hidden group"
  >
    <div className="absolute inset-0 bg-gradient-to-r from-orange-600/0 to-red-600/0 group-hover:from-orange-600/15 group-hover:to-red-600/10 transition-all duration-300 rounded-full" />
    <div className="absolute inset-0 rounded-full bg-white/3" />
    <span className="relative z-10">{label}</span>
  </motion.button>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const QUICK_CHIPS = [
  "What's your tech stack?",
  "Tell me about your projects",
  "Do you have LLM experience?",
];

export default function ChatModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", content: "Hi! I'm Keval's AI assistant. Ask me anything about his experience, projects, or tech stack!" },
  ]);
  const [input, setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);
  const [inputFocused, setInputFocused] = useState(false);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, loading]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

  const handleSend = useCallback(async (text: string, isSuggested = false) => {
    if (!text.trim() || loading) return;
    const userMsg = text.trim();
    const chatHistory = messages.slice(-4).map(m => ({ role: m.role, content: m.content }));

    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setInput("");
    setLoading(true);

    try {
      const res = await api.post("chat/", { message: userMsg, is_suggested: isSuggested, history: chatHistory });
      setMessages(prev => [...prev, { role: "ai", content: res.data.content }]);
    } catch {
      setMessages(prev => [...prev, { role: "ai", content: "Sorry, I'm having trouble connecting right now. Try again in a moment!" }]);
    } finally {
      setLoading(false);
    }
  }, [messages, loading]);

  const isFirstMessage = messages.length === 1;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop scrim — subtle, doesn't block the page feel */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 pointer-events-none"
              style={{ background: "radial-gradient(ellipse at bottom right, rgba(255,106,0,0.06) 0%, transparent 70%)" }}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.93 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.93 }}
              transition={{ type: "spring", stiffness: 280, damping: 26 }}
              className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100%-2rem)] sm:w-full sm:max-w-md"
            >
              {/* Outer glow ring */}
              <div className="absolute -inset-[1px] rounded-[28px] bg-gradient-to-br from-orange-500/50 via-red-600/20 to-orange-400/30 blur-[2px] pointer-events-none" />

              {/* Border gradient */}
              <div className="relative rounded-[28px] p-[1px] bg-gradient-to-br from-orange-400/60 via-white/8 to-red-600/50 shadow-[0_20px_60px_rgba(255,106,0,0.2),0_0_0_1px_rgba(255,255,255,0.04)]">

                {/* Main panel */}
                <div className="relative flex flex-col h-[70vh] sm:h-[560px] rounded-[27px] overflow-hidden">

                  {/* Grid texture background */}
                  <div className="absolute inset-0 neural-grid opacity-30 pointer-events-none z-0" />

                  {/* Deep glass background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#0f0f12]/95 via-[#111014]/90 to-[#0d0d10]/95 backdrop-blur-3xl z-0" />

                  {/* Ambient glow pools */}
                  <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-orange-600/10 blur-3xl pointer-events-none z-0" />
                  <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-red-600/8 blur-2xl pointer-events-none z-0" />

                  {/* ── Header ──────────────────────────────────────────── */}
                  <div className="relative z-10 px-5 sm:px-6 pt-4 sm:pt-5 pb-4 border-b border-white/5">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        {/* Live pulse ring */}
                        <div className="relative flex items-center justify-center w-8 h-8">
                          <div className="absolute inset-0 rounded-full bg-orange-500/20 animate-ping" style={{ animationDuration: "2.5s" }} />
                          <div className="absolute inset-0 rounded-full border border-orange-500/40" />
                          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-orange-400 to-red-500 shadow-[0_0_10px_rgba(255,106,0,0.9)]" />
                        </div>

                        <div>
                          <h3 className="font-semibold text-sm tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-orange-200 via-orange-300 to-red-300 font-orbitron uppercase">
                            Portfolio AI
                          </h3>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                            <span className="text-[10px] text-emerald-400/80 tracking-wider">Online · Ready</span>
                          </div>
                        </div>
                      </div>

                      {/* Scan line decoration + close */}
                      <div className="flex items-center gap-3">
                        <div className="hidden sm:flex flex-col gap-1">
                          <div className="w-8 h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />
                          <div className="w-5 h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent ml-auto" />
                          <div className="w-6 h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />
                        </div>
                        <motion.button
                          onClick={onClose}
                          whileHover={{ scale: 1.1, rotate: 90 }}
                          whileTap={{ scale: 0.9 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                          className="text-gray-500 hover:text-white transition-colors w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/5"
                        >
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                        </motion.button>
                      </div>
                    </div>
                  </div>

                  {/* ── Chat Area ────────────────────────────────────────── */}
                  <div
                    ref={scrollRef}
                    className="relative z-10 flex-1 overflow-y-auto px-4 sm:px-5 py-4 space-y-4 chat-scroll"
                  >
                    {messages.map((msg, idx) => (
                      <MessageBubble key={idx} msg={msg} idx={idx} />
                    ))}

                    <AnimatePresence>
                      {loading && <TypingIndicator />}
                    </AnimatePresence>
                  </div>

                  {/* ── Quick Chips ──────────────────────────────────────── */}
                  <AnimatePresence>
                    {isFirstMessage && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="relative z-10 px-4 sm:px-5 pb-2 flex flex-wrap gap-2"
                      >
                        {QUICK_CHIPS.map((chip, i) => (
                          <QuickChip key={i} label={chip} idx={i} onClick={() => handleSend(chip, true)} />
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* ── Input Area ───────────────────────────────────────── */}
                  <div className="relative z-10 p-3 sm:p-4">
                    <div className={`relative rounded-2xl transition-all duration-300 ${
                      inputFocused
                        ? "shadow-[0_0_0_1px_rgba(249,115,22,0.5),0_0_20px_rgba(249,115,22,0.15)]"
                        : "shadow-[0_0_0_1px_rgba(255,255,255,0.06)]"
                    }`}>
                      {/* Input glow breathe */}
                      {inputFocused && (
                        <motion.div
                          className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-orange-500/20 via-red-500/10 to-orange-500/20 blur-sm pointer-events-none"
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        />
                      )}

                      <div className="relative flex items-center bg-white/[0.04] rounded-2xl border border-white/[0.07] backdrop-blur-xl overflow-hidden">
                        {/* Prefix icon */}
                        <div className="pl-4 pr-2 shrink-0">
                          <motion.div
                            animate={inputFocused ? { opacity: 1, scale: 1 } : { opacity: 0.4, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-orange-400">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" fill="currentColor"/>
                            </svg>
                          </motion.div>
                        </div>

                        <input
                          ref={inputRef}
                          type="text"
                          value={input}
                          onChange={e => setInput(e.target.value)}
                          onKeyDown={e => e.key === "Enter" && handleSend(input)}
                          onFocus={() => setInputFocused(true)}
                          onBlur={() => setInputFocused(false)}
                          placeholder="Ask about Keval's work..."
                          className="flex-1 bg-transparent py-3 sm:py-3.5 text-sm text-white placeholder-gray-600 focus:outline-none"
                        />

                        {/* Send button */}
                        <div className="pr-2">
                          <motion.button
                            onClick={() => handleSend(input)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            disabled={!input.trim() || loading}
                            className={`relative w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 overflow-hidden ${
                              input.trim() && !loading
                                ? "bg-gradient-to-br from-orange-500 to-red-600 shadow-[0_0_16px_rgba(255,106,0,0.5)]"
                                : "bg-white/5"
                            }`}
                          >
                            <AnimatePresence mode="wait">
                              {loading ? (
                                <motion.div
                                  key="spin"
                                  initial={{ opacity: 0, rotate: -90 }}
                                  animate={{ opacity: 1, rotate: 0 }}
                                  exit={{ opacity: 0 }}
                                  className="w-3 h-3 border border-orange-400/50 border-t-orange-400 rounded-full animate-spin"
                                />
                              ) : (
                                <motion.svg
                                  key="send"
                                  initial={{ opacity: 0, x: -4 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, x: 4 }}
                                  width="13" height="13" viewBox="0 0 24 24" fill="none"
                                  className={input.trim() ? "text-white" : "text-gray-600"}
                                >
                                  <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </motion.svg>
                              )}
                            </AnimatePresence>
                          </motion.button>
                        </div>
                      </div>
                    </div>

                    {/* Keyboard hint */}
                    <p className="text-center text-[10px] text-gray-700 mt-2 tracking-wider">
                      Press <span className="text-gray-600 font-mono">↵ Enter</span> to send
                    </p>
                  </div>

                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400..700&display=swap');
        .font-orbitron { font-family: 'Orbitron', sans-serif; }

        /* Neural grid texture */
        .neural-grid {
          background-image:
            linear-gradient(rgba(255,106,0,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,106,0,0.04) 1px, transparent 1px);
          background-size: 28px 28px;
        }

        /* Scrollbar */
        .chat-scroll { scrollbar-width: thin; scrollbar-color: #ff6a00 transparent; }
        .chat-scroll::-webkit-scrollbar { width: 3px; }
        .chat-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #ff6a00, #ff3c3c);
          border-radius: 10px;
        }
        .chat-scroll::-webkit-scrollbar-track { background: transparent; }

        /* Markdown in bubbles */
        .chat-markdown p { margin-bottom: 0.4rem; }
        .chat-markdown p:last-child { margin-bottom: 0; }
        .chat-markdown strong { color: #ffb347; font-weight: 600; }
        .chat-markdown em { color: #fda87a; font-style: italic; }
        .chat-markdown ul { list-style: none; padding-left: 0; margin-bottom: 0.4rem; }
        .chat-markdown ul li { padding-left: 1rem; position: relative; margin-bottom: 0.25rem; }
        .chat-markdown ul li::before { content: '›'; position: absolute; left: 0; color: #ff6a00; font-weight: bold; }
        .chat-markdown code {
          background: rgba(255,106,0,0.12);
          border: 1px solid rgba(255,106,0,0.2);
          padding: 0.1rem 0.35rem;
          border-radius: 0.3rem;
          color: #ffb347;
          font-size: 0.8em;
        }
        .chat-markdown a { color: #fb923c; text-decoration: underline; text-underline-offset: 2px; }
      `}</style>
    </>
  );
}
