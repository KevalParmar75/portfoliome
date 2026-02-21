import { useEffect, useState } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

export default function LiquidGlassCursor() {
  const mouseX = useMotionValue(-200);
  const mouseY = useMotionValue(-200);

  const smoothX = useSpring(mouseX, { stiffness: 300, damping: 30 });
  const smoothY = useSpring(mouseY, { stiffness: 300, damping: 30 });

  const [visible, setVisible] = useState(false);

  const SIZE = 120;

  useEffect(() => {
    const move = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      setVisible(true);
    };

    window.addEventListener("mousemove", move);
    document.addEventListener("mouseleave", () => setVisible(false));
    document.addEventListener("mouseenter", () => setVisible(true));

    return () => window.removeEventListener("mousemove", move);
  }, []);

  return (
    <>
      {visible && (
        <motion.div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            x: smoothX,
            y: smoothY,
            translateX: "-50%",
            translateY: "-50%",
            width: SIZE,
            height: SIZE,
            borderRadius: "50%",
            pointerEvents: "none",
            zIndex: 99999,

            /* Glass look */
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "brightness(1.2) contrast(1.1)",
            WebkitBackdropFilter: "brightness(1.2) contrast(1.1)",

            border: "1px solid rgba(255,255,255,0.6)",

            boxShadow: `
              inset 0 4px 10px rgba(255,255,255,0.8),
              inset 0 -6px 12px rgba(0,0,0,0.3),
              0 15px 50px rgba(0,0,0,0.45)
            `,
          }}
        />
      )}
    </>
  );
}