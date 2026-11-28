import { useEffect, useState, useRef } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";
import { koiManager } from "./KoiCanvasContext";
import { LiquidLensFilter } from "./LiquidGlass";
import sphereLensUrl from "../assets/lens-sphere.png";

/* ─────────────────────────────────────────────────────────────────
 * Pre-computed Spherical Droplet Lens Map (Radial Snell's Law Curve)
 * ───────────────────────────────────────────────────────────────── */

export default function LiquidGlassCursor() {
  const lensMapUrl = sphereLensUrl;
  const refractCanvasRef = useRef<HTMLCanvasElement>(null);

  const mouseX = useMotionValue(-200);
  const mouseY = useMotionValue(-200);

  const smoothX = useSpring(mouseX, { stiffness: 320, damping: 28, mass: 0.6 });
  const smoothY = useSpring(mouseY, { stiffness: 320, damping: 28, mass: 0.6 });

  const [visible, setVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const BASE_SIZE = 50;
  const currentSize = isPressed ? 42 : isHovered ? 64 : BASE_SIZE;

  useEffect(() => {
    // Disable on touch devices and when user prefers reduced motion
    if (
      window.matchMedia?.("(pointer: coarse)").matches ||
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const move = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!visible) setVisible(true);

      const target = e.target as HTMLElement | null;
      const interactive = target?.closest("a, button, input, textarea, [role='button']");
      setIsHovered(Boolean(interactive));
    };

    const handleLeave = () => setVisible(false);
    const handleEnter = () => setVisible(true);
    const handleDown = () => setIsPressed(true);
    const handleUp = () => setIsPressed(false);

    window.addEventListener("mousemove", move, { passive: true });
    document.addEventListener("mouseleave", handleLeave);
    document.addEventListener("mouseenter", handleEnter);
    window.addEventListener("mousedown", handleDown);
    window.addEventListener("mouseup", handleUp);

    return () => {
      window.removeEventListener("mousemove", move);
      document.removeEventListener("mouseleave", handleLeave);
      document.removeEventListener("mouseenter", handleEnter);
      window.removeEventListener("mousedown", handleDown);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [mouseX, mouseY, visible]);

  // Live Koi Pond Spherical Lens Magnification inside the Cursor Droplet
  useEffect(() => {
    if (!visible) return;
    const canvas = refractCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const unsubscribe = koiManager.subscribe((sourceCanvas: HTMLCanvasElement) => {
      const cx = smoothX.get();
      const cy = smoothY.get();
      if (cx < -100 || cy < -100) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cw = Math.round(currentSize * dpr);
      if (canvas.width !== cw || canvas.height !== cw) {
        canvas.width = cw;
        canvas.height = cw;
      }

      const scaleX = sourceCanvas.width / window.innerWidth;
      const scaleY = sourceCanvas.height / window.innerHeight;

      // Magnify the pond region directly beneath the droplet by ~28%
      const zoom = 0.72;
      const sw = currentSize * scaleX * zoom;
      const sh = currentSize * scaleY * zoom;
      const sx = cx * scaleX - sw * 0.5;
      const sy = cy * scaleY - sh * 0.5;

      ctx.clearRect(0, 0, cw, cw);
      ctx.save();

      ctx.filter = "blur(1.2px) saturate(155%) brightness(1.05)";
      ctx.drawImage(sourceCanvas, sx, sy, sw, sh, 0, 0, cw, cw);

      // Subtle chromatic rim shift
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
  }, [visible, smoothX, smoothY, currentSize]);

  return (
    <>
      {/* Always mounted: the chat orb's backdrop-filter points at this id. */}
      <LiquidLensFilter id="cursor-liquid-lens" mapUrl={lensMapUrl} preset="cursor" />

      {!visible ? null : (
        <>
          {/* ── Liquid Glass Droplet Cursor ── */}
          <motion.div
        animate={{
          width: currentSize,
          height: currentSize,
        }}
        transition={{ type: "spring", stiffness: 380, damping: 26 }}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          x: smoothX,
          y: smoothY,
          translateX: "-50%",
          translateY: "-50%",
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 99999,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",

          /* No base background: pure glass over whatever is under the cursor */
          backdropFilter: "url(#cursor-liquid-lens) blur(1.5px) saturate(140%) brightness(0.88)",
          WebkitBackdropFilter: "blur(2px) saturate(140%) brightness(0.88)",

          /* Subtle whisper-thin rim */
          border: "1px solid rgba(255, 255, 255, 0.11)",
          boxShadow: `
            inset 0 1px 1px 0 rgba(255, 255, 255, 0.28),
            inset 0 -1px 1.5px 0 rgba(255, 255, 255, 0.06),
            0 8px 24px -4px rgba(0, 0, 0, 0.45)
          `,
        }}
      >
        {/* Live Refracted Koi Pond Layer */}
        <canvas
          ref={refractCanvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none opacity-50 mix-blend-screen"
        />

        {/* Top-Left Curved Meniscus Specular Glint */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            padding: "1px",
            background:
              "linear-gradient(145deg, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0.03) 42%, transparent 70%, rgba(233,130,89,0.16) 100%)",
            WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
          }}
        />

        {/* Crisp Center Precision Dot */}
        <motion.div
          animate={{
            scale: isPressed ? 0.65 : isHovered ? 1.25 : 1,
            backgroundColor: isHovered ? "#E98259" : "#ffffff",
          }}
          transition={{ duration: 0.15 }}
          style={{
            position: "relative",
            zIndex: 2,
            width: "5px",
            height: "5px",
            borderRadius: "50%",
            boxShadow: "0 0 6px rgba(0, 0, 0, 0.8), 0 0 8px rgba(233, 130, 89, 0.5)",
          }}
        />
          </motion.div>
        </>
      )}
    </>
  );
}