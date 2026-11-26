import { useEffect, useState } from "react";

/**
 * Pre-computed SVG displacement maps for the liquid-glass filters.
 * Each map is rendered once per page load and shared by every panel that uses it.
 */

const cache = new Map<string, string>();

const clamp = (v: number) => Math.min(255, Math.max(0, Math.round(v)));

const draw = (w: number, h: number, pixel: (nx: number, ny: number) => [number, number]) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  if (!ctx) return "";

  const img = ctx.createImageData(w, h);
  const d = img.data;

  for (let y = 0; y < h; y++) {
    const ny = (y / (h - 1)) * 2 - 1;
    for (let x = 0; x < w; x++) {
      const nx = (x / (w - 1)) * 2 - 1;
      const [r, g] = pixel(nx, ny);
      const i = (y * w + x) * 4;
      d[i] = r;
      d[i + 1] = g;
      d[i + 2] = 128;
      d[i + 3] = 255;
    }
  }

  ctx.putImageData(img, 0, 0);
  return c.toDataURL();
};

/** Superellipse bevel: flat readable centre, steep optical bend near the edges. */
const bevel = (w: number, h: number, expX: number, expY: number, strength: number) =>
  draw(w, h, (nx, ny) => [
    clamp(128 - Math.pow(Math.abs(nx), expX) * Math.sign(nx) * strength),
    clamp(128 - Math.pow(Math.abs(ny), expY) * Math.sign(ny) * strength),
  ]);

const make = (key: string, build: () => string) => {
  const hit = cache.get(key);
  if (hit !== undefined) return hit;
  const url = build();
  cache.set(key, url);
  return url;
};

// Initial empty string keeps SSR and first client render identical; the canvas
// runs once after mount and is cached for the rest of the session.
const useLensUrl = (key: string, build: () => string) => {
  const [url, setUrl] = useState("");
  useEffect(() => {
    setUrl(make(key, build));
  }, [key]);
  return url;
};

export const useCardLensMap = () => useLensUrl("card", () => bevel(160, 160, 3.2, 3.2, 112));

export const useCapsuleLensMap = () => useLensUrl("capsule", () => bevel(256, 64, 2.8, 2.0, 110));

export const useSphereLensMap = () =>
  useLensUrl("sphere", () =>
    draw(128, 128, (nx, ny) => {
      const r = Math.hypot(nx, ny);
      // Spherical droplet: gentle magnification in the centre, strong bend at the rim.
      const bend = r <= 1 ? Math.pow(r, 2.4) : 0;
      return [clamp(128 - nx * bend * 115), clamp(128 - ny * bend * 115)];
    })
  );
