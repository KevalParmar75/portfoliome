import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LiquidGlassCursor from "../components/LiquidGlassCursor";
import Navbar from "../components/Navbar";

const BLOBS = [
  { size: 380, top: "0%",   left: "60%",  color: "plasma-cyan",   factor: 0.05,  delay: 0 },
  { size: 420, top: "50%",  left: "-10%", color: "plasma-violet", factor: -0.04, delay: 3 },
  { size: 300, top: "80%",  left: "75%",  color: "plasma-cyan",   factor: 0.07,  delay: 7 },
  { size: 350, top: "-5%",  left: "-5%",  color: "plasma-violet", factor: -0.03, delay: 5 },
  { size: 280, top: "35%",  left: "50%",  color: "plasma-indigo", factor: 0.06,  delay: 2 },
];

const PlasmaBlob = ({ blob, springX, springY }: { blob: any; springX: any; springY: any }) => {
  const x = useTransform(springX, (v: number) => v * blob.factor);
  const y = useTransform(springY, (v: number) => v * blob.factor);
  return (
    <motion.div
      className={`plasma ${blob.color}`}
      style={{ width: blob.size, height: blob.size, top: blob.top, left: blob.left, animationDelay: `${blob.delay}s`, x, y }}
    />
  );
};

// Grid lines
const GridLines = () => (
  <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.025]"
    style={{
      backgroundImage: `linear-gradient(rgba(34,211,238,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.6) 1px, transparent 1px)`,
      backgroundSize: "60px 60px"
    }}
  />
);

// Glitchy 404 digits
const GlitchDigit = ({ char, delay }: { char: string; delay: number }) => (
  <motion.span
    className="glitch-digit"
    initial={{ opacity: 0, y: 40, filter: "blur(12px)" }}
    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }}
    data-text={char}
  >
    {char}
  </motion.span>
);

// Terminal log lines
const LOGS = [
  { text: "GET /unknown-route → 404",       color: "text-red-400"   },
  { text: "resolving path... failed",        color: "text-yellow-400/70" },
  { text: "neural link severed",             color: "text-red-400/70"   },
  { text: "suggest: return to /home",        color: "text-cyan-400"  },
];

const TerminalLog = () => {
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    if (visible >= LOGS.length) return;
    const t = setTimeout(() => setVisible(v => v + 1), 600);
    return () => clearTimeout(t);
  }, [visible]);

  return (
    <div className="terminal-log">
      <div className="terminal-log-header">
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-red-500/70" />
          <div className="w-2 h-2 rounded-full bg-yellow-500/70" />
          <div className="w-2 h-2 rounded-full bg-green-500/70" />
        </div>
        <span className="font-mono text-[10px] text-gray-600">system.log</span>
      </div>
      <div className="p-4 space-y-1.5 min-h-[100px]">
        {LOGS.slice(0, visible).map((log, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className={`font-mono text-xs ${log.color} flex items-center gap-2`}
          >
            <span className="text-gray-600">$</span>
            {log.text}
            {i === visible - 1 && visible < LOGS.length && (
              <span className="w-[6px] h-[0.9em] bg-cyan-400 inline-block animate-[blink_1s_step-end_infinite]" />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default function NotFound() {
  const navigate = useNavigate();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 40, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 40, damping: 30 });

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      mouseX.set(e.clientX - window.innerWidth / 2);
      mouseY.set(e.clientY - window.innerHeight / 2);
    };
    window.addEventListener("mousemove", fn);
    return () => window.removeEventListener("mousemove", fn);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="relative min-h-screen bg-[#080b10] text-white overflow-hidden custom-cursor-wrapper flex flex-col items-center justify-center px-4"
    >
      <LiquidGlassCursor />
      <Navbar />
      <GridLines />

      {/* Plasma */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {BLOBS.map((blob, i) => (
          <PlasmaBlob key={i} blob={blob} springX={springX} springY={springY} />
        ))}
      </div>

      {/* Content */}
      <main className="relative z-10 flex flex-col items-center text-center max-w-lg w-full">

        {/* Status badge */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-red-500/25 bg-red-500/8 backdrop-blur-sm mb-10"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.9)] animate-pulse" />
          <span className="font-mono text-[10px] text-red-400/80 tracking-[0.2em]">ERROR_NODE_NOT_FOUND</span>
        </motion.div>

        {/* 404 */}
        <div className="flex items-center justify-center gap-2 md:gap-3 mb-6">
          {["4", "0", "4"].map((c, i) => (
            <GlitchDigit key={i} char={c} delay={0.15 + i * 0.12} />
          ))}
        </div>

        {/* Sub-heading */}
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.5 }}
          className="text-lg md:text-xl font-semibold text-gray-300 mb-3 tracking-tight"
        >
          Neural Link Severed
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="font-mono text-xs text-gray-500 leading-relaxed mb-8 max-w-sm"
        >
          The node you requested does not exist in this architecture. The connection may have been dropped or the directory relocated.
        </motion.p>

        {/* Terminal log */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.5 }}
          className="w-full mb-8"
        >
          <TerminalLog />
        </motion.div>

        {/* CTA */}
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.5 }}
          onClick={() => navigate("/")}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="reroute-btn"
        >
          <span className="font-mono text-[10px] tracking-[0.15em] opacity-60 mr-2">~/</span>
          Initialize Reroute
        </motion.button>

        {/* Decorative scan line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 1.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="w-full h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent mt-10 origin-left"
        />
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap');

        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }

        .custom-cursor-wrapper * { cursor: none !important; }

        /* ── 404 glitch digits ─────────────────────────────────── */
        .glitch-digit {
          font-family: 'Space Mono', monospace;
          font-size: clamp(5rem, 20vw, 9rem);
          font-weight: 700;
          line-height: 1;
          color: #ffffff;
          text-shadow: 0 0 60px rgba(34,211,238,0.4), 0 0 120px rgba(129,140,248,0.2);
          position: relative;
          display: inline-block;
        }
        /* Glitch layers */
        .glitch-digit::before,
        .glitch-digit::after {
          content: attr(data-text);
          position: absolute;
          inset: 0;
          opacity: 0;
        }
        .glitch-digit:hover::before {
          opacity: 0.7;
          color: #22d3ee;
          clip-path: polygon(0 20%, 100% 20%, 100% 40%, 0 40%);
          transform: translateX(-3px);
          animation: glitch-a 0.4s steps(2) forwards;
        }
        .glitch-digit:hover::after {
          opacity: 0.7;
          color: #818cf8;
          clip-path: polygon(0 60%, 100% 60%, 100% 80%, 0 80%);
          transform: translateX(3px);
          animation: glitch-b 0.4s steps(2) forwards;
        }
        @keyframes glitch-a {
          0%  { transform: translateX(-3px); }
          50% { transform: translateX(3px);  }
          100%{ transform: translateX(0);    }
        }
        @keyframes glitch-b {
          0%  { transform: translateX(3px);  }
          50% { transform: translateX(-3px); }
          100%{ transform: translateX(0);    }
        }

        /* ── Terminal log ──────────────────────────────────────── */
        .terminal-log {
          border-radius: 0.875rem;
          background: rgba(8, 12, 18, 0.9);
          border: 1px solid rgba(34,211,238,0.1);
          overflow: hidden;
          text-align: left;
        }
        .terminal-log-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.5rem 0.875rem;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          background: rgba(0,0,0,0.3);
        }

        /* ── Reroute button ────────────────────────────────────── */
        .reroute-btn {
          display: inline-flex;
          align-items: center;
          padding: 0.75rem 2rem;
          border-radius: 0.875rem;
          background: linear-gradient(135deg, rgba(34,211,238,0.9), rgba(99,102,241,0.9));
          color: white;
          font-size: 0.875rem;
          font-weight: 600;
          border: none;
          transition: box-shadow 0.25s ease;
        }
        .reroute-btn:hover {
          box-shadow: 0 0 30px rgba(34,211,238,0.4), 0 0 60px rgba(34,211,238,0.15);
        }

        /* ── Plasma blobs ──────────────────────────────────────── */
        .plasma {
          position: absolute;
          filter: blur(80px);
          opacity: 0.12;
          border-radius: 50%;
          animation: plasma-drift 25s ease-in-out infinite;
          will-change: transform;
        }
        .plasma-cyan   { background: radial-gradient(circle, #22d3ee, #0ea5e9); animation-duration: 22s; }
        .plasma-violet { background: radial-gradient(circle, #818cf8, #6366f1); animation-duration: 28s; animation-direction: reverse; }
        .plasma-indigo { background: radial-gradient(circle, #6366f1, #4f46e5); animation-duration: 32s; }

        @keyframes plasma-drift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%       { transform: translate(30px, -20px) scale(1.05); }
          66%       { transform: translate(-20px, 30px) scale(0.95); }
        }
      `}</style>
    </motion.div>
  );
}