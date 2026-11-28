import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FaBrain } from "react-icons/fa";
import { FiRefreshCw, FiX } from "react-icons/fi";

const EASE = [0.22, 1, 0.36, 1] as const;

interface ProjectExplainModalProps {
  isOpen: boolean;
  projectTitle: string;
  loading: boolean;
  explanation: string;
  typedText: string;
  onRegenerate: () => void;
  onClose: () => void;
}

export default function ProjectExplainModal({
  isOpen,
  projectTitle,
  loading,
  explanation,
  typedText,
  onRegenerate,
  onClose,
}: ProjectExplainModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-[#000000]/75 backdrop-blur-xl">
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.96 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="modal-container w-full sm:max-w-4xl sm:max-h-[82vh] max-h-[90vh] flex flex-col"
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 md:px-8 py-4 border-b border-white/[0.09] shrink-0 bg-white/[0.03]">
              <div className="flex items-center gap-3.5">
                <div className="liquid-icon-box w-8 h-8 rounded-lg flex items-center justify-center">
                  <FaBrain className="text-vermilion text-xs" />
                </div>
                <div>
                  <p className="font-mono text-[9px] text-vermilion tracking-[0.3em] uppercase mb-0.5">
                    ai.explanation
                  </p>
                  <p className="text-sm font-medium text-ivory font-serif italic">
                    {projectTitle}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <motion.button
                  type="button"
                  onClick={onRegenerate}
                  disabled={loading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="liquid-pill-secondary flex items-center gap-2 font-mono text-[10px] px-3.5 py-1.5 rounded-full text-ivory-soft hover:text-ivory transition disabled:opacity-40 tracking-widest uppercase cursor-pointer"
                >
                  <FiRefreshCw className={`text-[10px] text-vermilion ${loading ? "animate-spin" : ""}`} />
                  <span className="hidden sm:inline">regenerate</span>
                </motion.button>

                <motion.button
                  type="button"
                  onClick={onClose}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="text-ivory-dim hover:text-ivory transition p-1 cursor-pointer"
                  aria-label="Close AI explanation"
                >
                  <FiX size={18} />
                </motion.button>
              </div>
            </div>

            {/* Modal body */}
            <div className="p-6 md:p-10 overflow-y-auto flex-1 ai-scroll">
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="skel"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col gap-4 animate-pulse max-w-3xl"
                  >
                    <div className="h-5 bg-white/[0.06] rounded w-3/4" />
                    <div className="h-4 bg-white/[0.06] rounded w-full" />
                    <div className="h-4 bg-white/[0.06] rounded w-5/6" />
                    <div className="h-4 bg-white/[0.06] rounded w-4/5" />
                    <div className="h-4 bg-white/[0.06] rounded w-full" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="content"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    className="markdown-body text-ivory leading-relaxed text-sm md:text-base max-w-3xl space-y-4"
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
                      {typedText}
                    </ReactMarkdown>
                    {typedText.length < explanation.length && (
                      <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                        className="inline-block w-[2px] h-[1em] ml-1 bg-vermilion align-middle"
                      />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
