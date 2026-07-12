import { useEffect, useState } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

export default function LiquidGlassCursor() {
  const mouseX = useMotionValue(-200);
  const mouseY = useMotionValue(-200);

  const smoothX = useSpring(mouseX, { stiffness: 300, damping: 30 });
  const smoothY = useSpring(mouseY, { stiffness: 300, damping: 30 });

  const [visible, setVisible] = useState(false);

  const SIZE = 50;

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
            background: "rgba(255,255,255,0.03)",
            backdropFilter: "blur(8px) brightness(1.1)",
            WebkitBackdropFilter: "blur(8px) brightness(1.1)",

            border: "1px solid rgba(255,255,255,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",

            boxShadow: `
              inset 0 0 20px rgba(255,255,255,0.1),
              0 8px 32px rgba(0,0,0,0.2)
            `,
          }}
        >
          <div style={{ width: "6px", height: "6px", backgroundColor: "white", borderRadius: "50%" }} />
        </motion.div>
      )}
    </>
  );
}