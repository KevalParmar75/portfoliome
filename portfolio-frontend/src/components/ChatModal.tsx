import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  role: "user" | "ai";
  content: string;
}

export default function ChatModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", content: "Hi! I'm Keval's AI assistant. Ask me anything about his experience, projects, or tech stack!" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const quickChips = [
    "What's your tech stack?",
    "Tell me about His Projects...",
    "Do you have LLM experience?"
  ];

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

 const handleSend = async (text: string, isSuggested: boolean = false) => {
    if (!text.trim()) return;

    const userMsg = text.trim();

    // 🔥 1. Grab the last 4 messages for context BEFORE adding the new one
    const chatHistory = messages.slice(-4).map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setInput("");
    setLoading(true);

    try {
      // 🔥 2. Send the message, the flag, and the history to Django
      const res = await api.post("chat/", {
        message: userMsg,
        is_suggested: isSuggested,
        history: chatHistory
      });
      setMessages(prev => [...prev, { role: "ai", content: res.data.content }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: "ai", content: "Sorry, I'm having trouble connecting to my brain right now. Try again later!" }]);
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            // RESPONSIVE UPDATE: w-[calc(100%-2rem)] centers it perfectly on mobile.
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100%-2rem)] sm:w-full sm:max-w-md rounded-3xl p-[1px] bg-gradient-to-br from-orange-400/40 via-white/10 to-red-600/40 shadow-[0_10px_40px_rgba(255,106,0,0.25)]"
          >
            {/* Main Seamless Glass Container */}
            {/* RESPONSIVE UPDATE: Dynamic height on mobile (70vh) to avoid keyboard overlap */}
            <div className="flex flex-col h-[70vh] sm:h-[550px] bg-black/40 backdrop-blur-3xl rounded-3xl overflow-hidden shadow-[inset_0_0_30px_rgba(255,255,255,0.03)] relative">

              {/* Header - Transparent */}
              <div className="px-5 sm:px-6 py-4 sm:py-5 flex justify-between items-center relative z-10 border-b border-white/5 sm:border-none">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-orange-400 to-red-500 animate-pulse shadow-[0_0_10px_rgba(255,106,0,0.8)]" />
                  <h3 className="font-semibold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-orange-200 to-red-300">
                    Portfolio AI
                  </h3>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors text-lg sm:text-xl p-1">✕</button>
              </div>

              {/* Chat Area */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 sm:px-5 pb-2 pt-2 sm:pt-0 space-y-4 sm:space-y-6 chat-scroll relative z-10">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[90%] sm:max-w-[85%] rounded-2xl px-4 sm:px-5 py-3 text-sm leading-relaxed chat-markdown ${
                      msg.role === "user"
                        ? "bg-white/10 text-white border border-white/10 shadow-[inset_0_0_15px_rgba(255,255,255,0.05)] rounded-tr-sm"
                        : "bg-gradient-to-br from-orange-500/10 to-red-500/10 text-gray-200 border border-orange-500/20 shadow-[inset_0_0_20px_rgba(255,106,0,0.05)] rounded-tl-sm"
                    }`}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-2xl rounded-tl-sm px-5 py-4 shadow-[inset_0_0_20px_rgba(255,106,0,0.05)]">
                      <div className="flex gap-1.5">
                        <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" />
                        <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: "0.15s" }} />
                        <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Chips & Input Area */}
              <div className="p-3 sm:p-4 pt-0 relative z-10 flex flex-col gap-3">
                 {messages.length === 1 && (
                    <div className="flex flex-wrap gap-2 px-1">
                      {quickChips.map((chip, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(chip, true)}
                          className="text-xs bg-white/5 hover:bg-orange-500/20 border border-white/10 hover:border-orange-500/40 transition-all px-3 py-1.5 rounded-full text-gray-300 shadow-[inset_0_0_10px_rgba(255,255,255,0.02)] whitespace-nowrap"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  )}

                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
                    placeholder="Ask about my experience..."
                    className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl pl-4 sm:pl-5 pr-12 py-3 sm:py-3.5 text-sm text-white focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.1)]"
                  />
                  <button
                    onClick={() => handleSend(input)}
                    className="absolute right-1.5 sm:right-2 text-orange-400 hover:text-orange-300 p-2 sm:p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                  >
                    ➤
                  </button>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Component-Specific Styles to Override Globals */}
      <style>{`
        /* Custom Orange Scrollbar restricted ONLY to this modal */
        .chat-scroll::-webkit-scrollbar {
          width: 4px;
        }
        @media (min-width: 640px) {
          .chat-scroll::-webkit-scrollbar {
            width: 5px;
          }
        }
        .chat-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #ff6a00, #ff3c3c);
          border-radius: 10px;
        }
        .chat-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        /* Markdown styling for the chat bubbles */
        .chat-markdown p {
          margin-bottom: 0.5rem;
        }
        .chat-markdown p:last-child {
          margin-bottom: 0;
        }
        .chat-markdown strong {
          color: #ffb347;
          font-weight: 600;
        }
        .chat-markdown ul {
          list-style: disc;
          padding-left: 1.25rem;
          margin-bottom: 0.5rem;
        }
      `}</style>
    </>
  );
}
