/** Shared liquid-glass design tokens. Kept in a module that exports no
 * components so it can be imported by both the `LiquidGlass` primitives and
 * the pages without tripping React Fast Refresh's "only export components" rule. */

export type GlassTint = "mint" | "cyan" | "gold" | "neutral";

export const TINT_ACCENTS: Record<GlassTint, { rim: string; badge: string; glow: string }> = {
  mint: {
    rim: "rgba(233, 130, 89, 0.22)",
    badge: "text-vermilion border-vermilion/25 bg-[#000000]/[0.06]",
    glow: "rgba(233, 130, 89, 0.12)",
  },
  cyan: {
    rim: "rgba(110, 205, 245, 0.22)",
    badge: "text-[#7dd3fc] border-[#7dd3fc]/25 bg-[#7dd3fc]/[0.06]",
    glow: "rgba(110, 205, 245, 0.12)",
  },
  gold: {
    rim: "rgba(250, 190, 75, 0.22)",
    badge: "text-[#fcd34d] border-[#fcd34d]/25 bg-[#fcd34d]/[0.06]",
    glow: "rgba(250, 190, 75, 0.12)",
  },
  neutral: {
    rim: "rgba(233, 130, 89, 0.16)",
    badge: "text-vermilion border-white/15 bg-white/[0.04]",
    glow: "rgba(233, 130, 89, 0.08)",
  },
};
