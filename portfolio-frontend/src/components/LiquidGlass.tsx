import { useEffect, useRef, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import { motion } from "framer-motion";
import { FiMessageSquare } from "react-icons/fi";
import { koiManager } from "./KoiCanvasContext";
import { TINT_ACCENTS, type GlassTint } from "./LiquidGlass.shared";

/* ─────────────────────────────────────────────────────────────────
 * The liquid-glass primitives shared by every page:
 * a refraction filter, a card, a pill CTA and a round chat orb.
 * Each element samples the live koi canvas behind it on every frame.
 * (Design tokens live in LiquidGlass.shared.ts so this file exports
 *  components only, keeping React Fast Refresh happy.)
 * ───────────────────────────────────────────────────────────────── */

const PRESETS = {
  card: { region: 8, scale: 18, blur: 2.4, saturation: 1.4, slope: 0.72 },
  chat: { region: 8, scale: 18, blur: 2.5, saturation: 1.4, slope: 0.72 },
  nav: { region: 10, scale: 16, blur: 2.2, saturation: 1.35, slope: 0.68 },
  cursor: { region: 15, scale: 18, blur: 1.4, saturation: 1.35, slope: 0.82 },
} as const;

export const LiquidLensFilter = ({
  id,
  mapUrl,
  preset = "card",
}: {
  id: string;
  mapUrl: string;
  preset?: keyof typeof PRESETS;
}) => {
  const { region, scale, blur, saturation, slope } = PRESETS[preset];
  return (
    <svg className="fixed w-0 h-0 pointer-events-none" aria-hidden="true">
      <defs>
        <filter
          id={id}
          x={`-${region}%`}
          y={`-${region}%`}
          width={`${100 + region * 2}%`}
          height={`${100 + region * 2}%`}
          colorInterpolationFilters="sRGB"
        >
          <feImage
            href={mapUrl || undefined}
            result="lensMap"
            preserveAspectRatio="none"
            x="0%"
            y="0%"
            width="100%"
            height="100%"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="lensMap"
            scale={scale}
            xChannelSelector="R"
            yChannelSelector="G"
            result="refracted"
          />
          <feGaussianBlur in="refracted" stdDeviation={blur} result="softened" />
          <feColorMatrix in="softened" type="saturate" values={`${saturation}`} result="saturated" />
          <feComponentTransfer in="saturated">
            <feFuncR type="linear" slope={slope} />
            <feFuncG type="linear" slope={slope} />
            <feFuncB type="linear" slope={slope} />
          </feComponentTransfer>
        </filter>
      </defs>
    </svg>
  );
};

interface LiquidGlassCardProps {
  children: ReactNode;
  borderRadius?: number;
  className?: string;
  zoom?: number;
  onClick?: () => void;
  tint?: GlassTint;
  /** Dropdowns and popovers inside the card must be allowed to escape the clip. */
  allowOverflow?: boolean;
  /** Extra classes for the foreground wrapper, e.g. "flex flex-col justify-between". */
  contentClassName?: string;
}

export const LiquidGlassCard = ({
  children,
  borderRadius = 24,
  className = "",
  zoom = 0.88,
  onClick,
  tint,
  allowOverflow = false,
  contentClassName = "",
}: LiquidGlassCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const accent = tint ? TINT_ACCENTS[tint] : null;

  useEffect(() => {
    const el = cardRef.current;
    const canvas = canvasRef.current;
    if (!el || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let isVisible = false;
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    }, { rootMargin: "50px" });
    observer.observe(el);

    const unsubscribe = koiManager.subscribe((sourceCanvas: HTMLCanvasElement) => {
      if (!isVisible) return;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const cw = Math.max(1, Math.round(rect.width * dpr * 0.6));
      const ch = Math.max(1, Math.round(rect.height * dpr * 0.6));
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

      const zx = sx + sw * ((1 - zoom) * 0.5);
      const zy = sy + sh * ((1 - zoom) * 0.5);
      const zw = sw * zoom;
      const zh = sh * zoom;

      ctx.clearRect(0, 0, cw, ch);
      ctx.save();

      ctx.filter = "blur(2.2px) saturate(145%) brightness(0.85)";
      ctx.drawImage(sourceCanvas, zx, zy, zw, zh, 0, 0, cw, ch);

      ctx.globalCompositeOperation = "screen";
      ctx.globalAlpha = 0.28;
      ctx.filter = "blur(0.5px) saturate(185%)";
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
      observer.disconnect();
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [zoom]);

  const handlePointerMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty("--mx", `${x.toFixed(1)}%`);
    el.style.setProperty("--my", `${y.toFixed(1)}%`);
  };

  const optics = (
    <>
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full pointer-events-none opacity-50 mix-blend-screen${
          allowOverflow ? "" : " z-0"
        }`}
      />
      <div style={{ borderRadius: `${borderRadius}px` }} className="liquid-card-rim pointer-events-none" />
      <div style={{ borderRadius: `${borderRadius}px` }} className="liquid-card-glare pointer-events-none" />
    </>
  );

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handlePointerMove}
      style={
        {
          borderRadius: `${borderRadius}px`,
          ...(accent && { "--rim-tint": accent.rim, "--glow-tint": accent.glow }),
        } as CSSProperties
      }
      className={`liquid-glass-card relative ${allowOverflow ? "" : "overflow-hidden"} ${className}`}
    >
      {allowOverflow ? (
        <div
          style={{ borderRadius: `${borderRadius}px` }}
          className="absolute inset-0 overflow-hidden pointer-events-none z-0"
        >
          {optics}
        </div>
      ) : (
        optics
      )}

      <div className={`relative z-10 h-full ${contentClassName}`}>{children}</div>
    </div>
  );
};

interface LiquidGlassPillProps {
  children: ReactNode;
  onClick: () => void;
  variant?: "primary" | "secondary";
  className?: string;
}

export const LiquidGlassPill = ({
  children,
  onClick,
  variant = "primary",
  className = "",
}: LiquidGlassPillProps) => {
  const btnRef = useRef<HTMLButtonElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const btn = btnRef.current;
    const canvas = canvasRef.current;
    if (!btn || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const unsubscribe = koiManager.subscribe((sourceCanvas: HTMLCanvasElement) => {
      const rect = btn.getBoundingClientRect();
      if (rect.width === 0 || rect.bottom < 0 || rect.top > window.innerHeight) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cw = Math.round(rect.width * dpr);
      const ch = Math.round(rect.height * dpr);
      if (canvas.width !== cw || canvas.height !== ch) {
        canvas.width = cw;
        canvas.height = ch;
      }

      const scaleX = sourceCanvas.width / window.innerWidth;
      const scaleY = sourceCanvas.height / window.innerHeight;
      const zoom = 0.8;
      const sw = rect.width * scaleX * zoom;
      const sh = rect.height * scaleY * zoom;
      const sx = (rect.left + rect.width * 0.5) * scaleX - sw * 0.5;
      const sy = (rect.top + rect.height * 0.5) * scaleY - sh * 0.5;

      ctx.clearRect(0, 0, cw, ch);
      ctx.save();
      ctx.filter = "blur(1.5px) saturate(150%) brightness(0.9)";
      ctx.drawImage(sourceCanvas, sx, sy, sw, sh, 0, 0, cw, ch);
      ctx.restore();
    });

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  return (
    <motion.button
      ref={btnRef}
      onClick={onClick}
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 380, damping: 24 }}
      className={`liquid-pill-btn ${
        variant === "primary" ? "liquid-pill-primary" : "liquid-pill-secondary"
      } relative rounded-full overflow-hidden flex items-center justify-center gap-2.5 cursor-pointer ${className}`}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none opacity-45 mix-blend-screen z-0"
      />
      <span className="liquid-pill-rim pointer-events-none" />
      <span className="relative z-10 flex items-center gap-2.5">{children}</span>
    </motion.button>
  );
};

export const LiquidChatOrb = ({ onClick }: { onClick: () => void }) => {
  const btnRef = useRef<HTMLButtonElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const btn = btnRef.current;
    const canvas = canvasRef.current;
    if (!btn || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const unsubscribe = koiManager.subscribe((sourceCanvas: HTMLCanvasElement) => {
      const rect = btn.getBoundingClientRect();
      if (rect.width === 0) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cw = Math.round(rect.width * dpr);
      if (canvas.width !== cw || canvas.height !== cw) {
        canvas.width = cw;
        canvas.height = cw;
      }

      const scaleX = sourceCanvas.width / window.innerWidth;
      const scaleY = sourceCanvas.height / window.innerHeight;
      const cx = (rect.left + rect.width * 0.5) * scaleX;
      const cy = (rect.top + rect.height * 0.5) * scaleY;

      const zoom = 0.72;
      const sw = rect.width * scaleX * zoom;
      const sh = rect.height * scaleY * zoom;
      const sx = cx - sw * 0.5;
      const sy = cy - sh * 0.5;

      ctx.clearRect(0, 0, cw, cw);
      ctx.save();
      ctx.filter = "blur(1.2px) saturate(155%) brightness(0.95)";
      ctx.drawImage(sourceCanvas, sx, sy, sw, sh, 0, 0, cw, cw);

      ctx.globalCompositeOperation = "screen";
      ctx.globalAlpha = 0.28;
      const shift = 2.5 * scaleX;
      ctx.drawImage(
        sourceCanvas,
        sx - shift,
        sy - shift,
        sw + shift * 2,
        sh + shift * 2,
        0,
        0,
        cw,
        cw
      );
      ctx.restore();
    });

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  return (
    <motion.button
      ref={btnRef}
      onClick={onClick}
      whileHover={{ scale: 1.08, y: -2 }}
      whileTap={{ scale: 0.92 }}
      transition={{ type: "spring", stiffness: 380, damping: 24 }}
      aria-label="Open AI Chat"
      className="liquid-chat-orb group relative w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center overflow-hidden cursor-pointer"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none opacity-50 mix-blend-screen z-0"
      />
      <span className="liquid-chat-rim pointer-events-none" />
      <FiMessageSquare className="relative z-10 text-ivory-soft group-hover:text-vermilion text-xl md:text-[22px] transition-colors duration-300 drop-shadow-[0_2px_6px_rgba(0,0,0,0.85)]" />
    </motion.button>
  );
};
