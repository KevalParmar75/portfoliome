/**
 * Precomputed SVG displacement maps for the liquid-glass filters.
 * Generated identically to the original bevel/sphere canvas math at build assets time
 * so zero pixel loops or canvas.toDataURL() calls run on mount.
 */

import cardLensUrl from "../assets/lens-card.png";
import capsuleLensUrl from "../assets/lens-capsule.png";

export const useCardLensMap = () => cardLensUrl;

export const useCapsuleLensMap = () => capsuleLensUrl;
