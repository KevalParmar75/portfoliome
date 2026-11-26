import { lazy, Suspense, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { LiquidGlassCard, LiquidGlassPill, LiquidLensFilter } from "../components/LiquidGlass";
import { useCardLensMap } from "../hooks/useLensMap";
import { PAGE_SEO, setPageMetadata } from "../seo";

const AsciiKoiCanvas = lazy(() => import("../components/AsciiKoiCanvas"));
const LiquidGlassCursor = lazy(() => import("../components/LiquidGlassCursor"));

export default function NotFound() {
  const navigate = useNavigate();
  const lensMapUrl = useCardLensMap();
  const [showEffects, setShowEffects] = useState(false);

  useEffect(() => {
    setPageMetadata({ ...PAGE_SEO.notFound, path: undefined });
    setShowEffects(true);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="relative flex min-h-screen flex-col overflow-hidden bg-[#000000] font-sans text-ivory custom-cursor-wrapper"
    >
      <LiquidLensFilter id="not-found-liquid-glass" mapUrl={lensMapUrl} />
      {showEffects && (
        <Suspense fallback={null}>
          <LiquidGlassCursor />
          <AsciiKoiCanvas />
        </Suspense>
      )}
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_50%_30%,rgba(233,130,89,0.05)_0%,transparent_70%)]" />
      <Navbar />

      <main className="relative z-10 flex flex-1 items-center justify-center px-5 pb-12 pt-32 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-2xl"
        >
          <LiquidGlassCard
            borderRadius={30}
            tint="neutral"
            className="px-6 py-12 text-center sm:px-12 sm:py-16"
          >
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-vermilion/20 bg-white/[0.03] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-vermilion">
              <span className="h-1.5 w-1.5 rounded-full bg-vermilion" />
              Page not found
            </span>

            <h1 className="mb-4 font-serif text-7xl italic tracking-tight text-ivory drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)] sm:text-9xl">
              404
            </h1>
            <h2 className="mb-3 text-xl font-medium tracking-tight text-ivory sm:text-2xl">
              This page isn’t here.
            </h2>
            <p className="mx-auto mb-8 max-w-md text-sm leading-relaxed text-ivory-muted sm:text-base">
              The link may be out of date, or the page may have moved. Return to the portfolio and
              continue from there.
            </p>

            <div className="flex justify-center">
              <LiquidGlassPill
                onClick={() => navigate("/")}
                variant="primary"
                className="px-7 py-3.5 text-sm font-medium text-ivory"
              >
                Return to home
              </LiquidGlassPill>
            </div>
          </LiquidGlassCard>
        </motion.div>
      </main>

      <footer className="relative z-10 border-t border-white/[0.06] bg-[#000000]/60 py-8 text-center backdrop-blur-md">
        <p className="flex items-center justify-center gap-3 font-mono text-xs tracking-[0.2em] text-ivory-faint">
          <span>© 2026 KEVAL_PARMAR</span>
          <span className="h-1 w-1 rounded-full bg-white/10" />
          <span>POWERED_BY_AI</span>
        </p>
        <span className="decal-easter-egg text-[10px] sm:text-xs">
          "to automate and overwrite..."
        </span>
      </footer>

      <style>{`
        body { font-family: var(--font-sans); }
        .font-mono { font-family: var(--font-mono); }
        .font-serif { font-family: var(--font-serif); }
        .custom-cursor-wrapper * { cursor: none !important; }

        .liquid-glass-card {
          --mx: 50%;
          --my: 50%;
          backdrop-filter: url(#not-found-liquid-glass) blur(2.5px) saturate(145%) brightness(0.75);
          -webkit-backdrop-filter: blur(3px) saturate(145%) brightness(0.75);
          border: 1px solid rgba(255, 255, 255, 0.09);
          box-shadow: inset 0 1px 0.5px rgba(255, 255, 255, 0.22), inset 0 -1px 1.5px rgba(255, 255, 255, 0.06), 0 16px 40px -8px rgba(0, 0, 0, 0.65);
          transition: border-color 0.35s ease, box-shadow 0.35s ease;
        }
        .liquid-glass-card:hover { border-color: rgba(255, 255, 255, 0.14); }
        .liquid-card-rim {
          position: absolute;
          inset: 0;
          padding: 1px;
          background: linear-gradient(165deg, rgba(255,255,255,0.26), rgba(255,255,255,0.02) 38%, transparent 68%);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          z-index: 1;
        }
        .liquid-card-glare {
          position: absolute;
          inset: 0;
          background: radial-gradient(260px circle at var(--mx) var(--my), rgba(255,255,255,0.065), transparent 70%);
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: 1;
        }
        .liquid-glass-card:hover .liquid-card-glare { opacity: 1; }
        .liquid-pill-btn {
          backdrop-filter: url(#apple-liquid-glass) blur(2.5px) saturate(145%) brightness(0.76);
          -webkit-backdrop-filter: blur(3px) saturate(145%) brightness(0.76);
          text-shadow: 0 1px 3px rgba(0,0,0,0.85);
        }
        .liquid-pill-primary {
          border: 1px solid rgba(255,255,255,0.14);
          box-shadow: inset 0 1px 0.5px rgba(255,255,255,0.28), inset 0 -1px 1.5px rgba(255,255,255,0.08), 0 10px 28px -4px rgba(0,0,0,0.55);
        }
        .liquid-pill-primary:hover { border-color: rgba(255,255,255,0.3); }
        .liquid-pill-rim {
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          padding: 1px;
          background: linear-gradient(180deg, rgba(255,255,255,0.26), rgba(255,255,255,0.02) 45%, transparent 70%);
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
    </motion.div>
  );
}
