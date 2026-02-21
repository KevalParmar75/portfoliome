import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LiquidGlassCursor from "../components/LiquidGlassCursor";
import Navbar from "../components/Navbar";

// GPU-Accelerated Blob
const PlasmaBlob = ({ blob, springX, springY }: { blob: any, springX: any, springY: any }) => {
  const x = useTransform(springX, (val: number) => val * blob.factor);
  const y = useTransform(springY, (val: number) => val * blob.factor);
  return (
    <motion.div
      className={`plasma ${blob.color}`}
      style={{
        width: blob.size, height: blob.size,
        top: blob.top, left: blob.left,
        animationDelay: `${blob.delay}s`, x, y
      }}
    />
  );
};

export default function NotFound() {
  const navigate = useNavigate();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 40, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 40, damping: 30 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX - window.innerWidth / 2);
      mouseY.set(e.clientY - window.innerHeight / 2);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative min-h-screen bg-[#0f0f12] text-white overflow-hidden custom-cursor-wrapper flex flex-col items-center justify-center"
    >
      <LiquidGlassCursor />
      <Navbar />

      {/* Plasma Background */}
       <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {[
          { size: 250, top: "5%", left: "10%", color: "plasma-1", factor: 0.06, delay: 0 },
          { size: 300, top: "60%", left: "70%", color: "plasma-2", factor: -0.04, delay: 2 },
          { size: 200, top: "35%", left: "40%", color: "plasma-3", factor: 0.09, delay: 5 },
          { size: 220, top: "80%", left: "15%", color: "plasma-4", factor: -0.07, delay: 1 },
          { size: 350, top: "-10%", left: "-10%", color: "plasma-2", factor: 0.05, delay: 4 },
          { size: 380, top: "-5%", left: "95%", color: "plasma-3", factor: -0.03, delay: 7 },
          { size: 420, top: "90%", left: "90%", color: "plasma-1", factor: 0.08, delay: 3 },
          { size: 350, top: "105%", left: "-5%", color: "plasma-4", factor: -0.05, delay: 6 },
          { size: 300, top: "45%", left: "-15%", color: "plasma-1", factor: 0.07, delay: 8 },
          { size: 350, top: "50%", left: "105%", color: "plasma-3", factor: -0.06, delay: 2 },
          { size: 400, top: "-15%", left: "50%", color: "plasma-2", factor: 0.04, delay: 5 },
          { size: 380, top: "110%", left: "45%", color: "plasma-4", factor: -0.04, delay: 9 },
        ].map((blob, idx) => (
          <PlasmaBlob key={idx} blob={blob} springX={springX} springY={springY} />
        ))}
      </div>

      {/* 404 Glass Card */}
      <main className="relative z-10 m-6 rounded-3xl bg-black/40 backdrop-blur-3xl border border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.6),inset_0_0_40px_rgba(255,255,255,0.03)] p-12 md:p-20 text-center max-w-2xl">
        <h1 className="text-7xl md:text-9xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent mb-6">
          404
        </h1>
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-200 mb-4">
          Neural Link Severed
        </h2>
        <p className="text-gray-400 mb-10 leading-relaxed">
          The node you are trying to access does not exist in this architecture. The connection may have been dropped or the directory relocated.
        </p>
        <button
          onClick={() => navigate("/")}
          className="px-8 py-3 rounded-2xl bg-gradient-to-r from-orange-600 to-red-600 hover:scale-105 transition duration-300 shadow-[0_0_20px_rgba(255,106,0,0.4)] text-white font-medium"
        >
          Initialize Reroute (Go Home)
        </button>
      </main>

      <style>{`
        .custom-cursor-wrapper * { cursor: none !important; }
        .plasma {
          position: absolute;
          filter: blur(2px);
          opacity: 0.8;
          animation: plasma-morph 20s linear infinite;
          will-change: border-radius, rotate, transform;
        }

        .plasma-1 { background: radial-gradient(circle, #ff512f, #dd2476); animation-duration: 18s; }
        .plasma-2 { background: radial-gradient(circle, #ff9966, #ff5e62); animation-duration: 24s; animation-direction: reverse; }
        .plasma-3 { background: radial-gradient(circle, #ff8c00, #ff2e63); animation-duration: 28s; }
        .plasma-4 { background: radial-gradient(circle, #f12711, #f5af19); animation-duration: 22s; animation-direction: reverse; }

        @keyframes plasma-morph {
          0% { rotate: 0deg; border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
          25% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
          50% { rotate: 180deg; border-radius: 50% 60% 30% 60% / 30% 60% 70% 40%; }
          75% { border-radius: 70% 40% 50% 30% / 60% 40% 60% 50%; }
          100% { rotate: 360deg; border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
        }
      `}</style>
    </motion.div>
  );
}