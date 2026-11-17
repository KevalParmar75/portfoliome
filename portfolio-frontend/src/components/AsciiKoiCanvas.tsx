import { useEffect, useRef, type CSSProperties } from "react";
import { koiManager } from "./KoiCanvasContext";

/* ─────────────────────────────────────────────────────────────────
 * High-Resolution Multi-Palette ASCII Koi Pond
 * Path-History Spine Kinematics + Hard Separation Avoidance
 * ───────────────────────────────────────────────────────────────── */

const TAU = Math.PI * 2;
const LEVELS = 12;
const GLYPHS = "@8#%XSto:.'";
const SET_HI = "@8#%X";
const SET_MID = "SXt%8o";
const SET_LO = ":t.o'";
const GLYPH_INDEX: Record<string, number> = {};
GLYPHS.split("").forEach((g, i) => {
  GLYPH_INDEX[g] = i;
});

const TEXTURE_MAX = 1280;
const SAMPLES = 28; // Dense spine samples along the swimming path
const TRAIL_LEN = 180; // Ring-buffer length for smooth path following

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

const hash = (x: number, y: number, t: number) => {
  let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(t, 2246822519);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return (h ^ (h >>> 16)) >>> 0;
};

const wrapAngle = (a: number) => {
  while (a > Math.PI) a -= TAU;
  while (a < -Math.PI) a += TAU;
  return a;
};

/* ───────────────────────── Koi Color Palettes ───────────────────────── */

interface PaletteColor {
  rgb: [number, number, number];
  inv: boolean;
}

const PALETTE_DEFS: PaletteColor[] = [
  { rgb: [240, 245, 250], inv: false }, // 0: Platinum White body
  { rgb: [255, 75, 25], inv: true },    // 1: Hi (Vibrant Vermilion Red patch)
  { rgb: [255, 175, 30], inv: true },   // 2: Yamabuki (Golden Amber)
  { rgb: [35, 45, 60], inv: true },     // 3: Sumi (Deep Obsidian Ink spot)
  { rgb: [105, 195, 240], inv: false }, // 4: Asagi (Sky Blue scales)
  { rgb: [255, 120, 155], inv: true },  // 5: Sakura (Coral Pink)
  { rgb: [215, 235, 225], inv: false }, // 6: Translucent Pearl Fins
  { rgb: [12, 18, 24], inv: true },     // 7: Dark Eye Pupil
];

interface KoiBreed {
  base: number;
  patch1: number;
  patch2: number;
  fin: number;
}

const BREEDS: KoiBreed[] = [
  { base: 0, patch1: 1, patch2: 1, fin: 6 }, // Kohaku (White + Red)
  { base: 0, patch1: 1, patch2: 3, fin: 6 }, // Taisho Sanke (White + Red + Black)
  { base: 2, patch1: 2, patch2: 0, fin: 2 }, // Yamabuki Ogon (Solid Gold)
  { base: 4, patch1: 1, patch2: 0, fin: 6 }, // Asagi (Blue + Red)
  { base: 0, patch1: 5, patch2: 2, fin: 5 }, // Sakura (White + Pink + Gold)
];

/* ───────────────────────── Sleek Fish Silhouette ───────────────────────── */

/** Teardrop koi profile: u = 0 (nose tip) to u = 1 (tail tip) */
const bodyHalfN = (u: number) => {
  if (u < 0.14) {
    // Crisp, rounded bullet nose
    return 0.9 * Math.pow(u / 0.14, 0.55);
  }
  if (u < 0.74) {
    // Smooth streamlined taper from shoulders to tail stalk
    const t = (u - 0.14) / 0.6;
    return 0.9 * Math.pow(Math.cos(t * Math.PI * 0.44), 1.15);
  }
  // Slender tail peduncle
  return 0.15;
};

/* ───────────────────────── Multi-Palette Tile Atlas ───────────────────────── */

const buildAtlas = (cell: number, pixelRatio: number) => {
  const tp = Math.max(6, Math.round(cell * pixelRatio));
  const atlas = document.createElement("canvas");
  atlas.width = GLYPHS.length * tp;
  atlas.height = LEVELS * PALETTE_DEFS.length * tp;
  const g = atlas.getContext("2d");
  if (!g) return { atlas, tp };

  const gap = Math.max(1, Math.round(tp * 0.08));
  g.font = `bold ${Math.round(tp * 0.9)}px "Courier New", monospace`;
  g.textAlign = "center";
  g.textBaseline = "middle";

  for (let p = 0; p < PALETTE_DEFS.length; p++) {
    const { rgb, inv } = PALETTE_DEFS[p];
    const shade = (k: number, a = 1) =>
      `rgba(${Math.min(255, Math.round(rgb[0] * k))},${Math.min(
        255,
        Math.round(rgb[1] * k)
      )},${Math.min(255, Math.round(rgb[2] * k))},${a})`;

    for (let level = 0; level < LEVELS; level++) {
      const f = (level + 0.5) / LEVELS;
      const row = p * LEVELS + level;
      const y = row * tp;

      for (let gi = 0; gi < GLYPHS.length; gi++) {
        const x = gi * tp;
        if (inv) {
          g.fillStyle = shade(0.32 + f * 0.68, 0.9);
          g.fillRect(x + gap, y + gap, tp - gap * 2, tp - gap * 2);
          g.fillStyle = "#000000";
          g.fillText(GLYPHS[gi], x + tp / 2, y + tp / 2 + tp * 0.04);
        } else {
          g.fillStyle = shade(f * 0.35, 0.72);
          g.fillRect(x + gap, y + gap, tp - gap * 2, tp - gap * 2);
          g.fillStyle = shade(Math.min(1.2, f * 1.15 + 0.35), 0.95);
          g.fillText(GLYPHS[gi], x + tp / 2, y + tp / 2 + tp * 0.04);
        }
      }
    }
  }
  return { atlas, tp };
};

/* ───────────────────────── Simulation Entities ───────────────────────── */

interface Koi {
  x: number; // Nose X (world px)
  y: number; // Nose Y (world px)
  heading: number;
  turnRate: number;
  wanderTimer: number;
  turnBias: number;
  baseSpeed: number;
  speed: number;
  phase: number;
  len: number; // Total length in grid cells
  glow: number;
  seed: number;
  breed: KoiBreed;
  // History trail of head positions for natural curved body following
  trailX: Float32Array;
  trailY: Float32Array;
  // Sampled spine points for current frame (in grid units)
  sx: Float32Array;
  sy: Float32Array;
  nx: Float32Array; // Normal vector X
  ny: Float32Array; // Normal vector Y
}

interface Minnow {
  x: number;
  y: number;
  vx: number;
  vy: number;
  ox: number;
  oy: number;
  orbit: number;
  colorIdx: number;
}

interface School {
  x: number;
  y: number;
  heading: number;
  turnRate: number;
  turnTarget: number;
  wanderTimer: number;
  speed: number;
  members: Minnow[];
}

const createKoi = (
  width: number,
  height: number,
  lenScale: number,
  cell: number,
  index: number,
  total: number
): Koi => {
  // Every odd-indexed fish after the first two is a smaller, quicker juvenile koi
  const isSmall = index >= 2 && index % 2 === 1;
  const depth = isSmall
    ? 0.15 + 0.35 * Math.random() // Smaller & slightly deeper
    : 0.55 + 0.45 * ((index * 0.618) % 1); // Large flagship koi

  const len = (isSmall ? rand(12, 16.5) : 24 + depth * 9) * lenScale;

  // Spawn evenly spaced in a ring around the screen so they never start stacked
  const angle = (index / total) * TAU + rand(-0.25, 0.25);
  const x = width * 0.5 + Math.cos(angle) * width * rand(0.15, 0.42);
  const y = height * 0.5 + Math.sin(angle) * height * rand(0.15, 0.42);
  const heading = angle + Math.PI * 0.5 + rand(-0.4, 0.4);

  const trailX = new Float32Array(TRAIL_LEN);
  const trailY = new Float32Array(TRAIL_LEN);
  const stepPx = (len * cell) / (TRAIL_LEN * 0.6);

  for (let i = 0; i < TRAIL_LEN; i++) {
    trailX[i] = x - Math.cos(heading) * i * stepPx;
    trailY[i] = y - Math.sin(heading) * i * stepPx;
  }

  // Smaller koi swim slightly faster and dart more nimbly
  const baseSpeed = isSmall ? rand(64, 82) : 48 + depth * 24;

  return {
    x,
    y,
    heading,
    turnRate: 0,
    wanderTimer: rand(1.5, 4),
    turnBias: rand(-0.35, 0.35),
    baseSpeed,
    speed: baseSpeed,
    phase: rand(0, TAU),
    len,
    glow: isSmall ? 0.6 + depth * 0.35 : 0.72 + depth * 0.28,
    seed: index * 7.3 + rand(0, 10),
    breed: BREEDS[index % BREEDS.length],
    trailX,
    trailY,
    sx: new Float32Array(SAMPLES),
    sy: new Float32Array(SAMPLES),
    nx: new Float32Array(SAMPLES),
    ny: new Float32Array(SAMPLES),
  };
};

const createSchool = (width: number, height: number): School => {
  const x = rand(0, width);
  const y = rand(0, height);
  const heading = rand(0, TAU);
  const count = Math.floor(rand(8, 14));
  const members: Minnow[] = Array.from({ length: count }, () => {
    const ox = rand(-65, 20);
    const oy = rand(-40, 40);
    return {
      x: x + ox * Math.cos(heading) - oy * Math.sin(heading),
      y: y + ox * Math.sin(heading) + oy * Math.cos(heading),
      vx: 0,
      vy: 0,
      ox,
      oy,
      orbit: rand(0, TAU),
      colorIdx: Math.random() < 0.45 ? 2 : Math.random() < 0.5 ? 5 : 4,
    };
  });
  return {
    x,
    y,
    heading,
    turnRate: 0,
    turnTarget: rand(-0.4, 0.4),
    wanderTimer: rand(2, 5),
    speed: rand(42, 65),
    members,
  };
};

interface AsciiKoiCanvasProps {
  className?: string;
  style?: CSSProperties;
  brightness?: number;
}

export default function AsciiKoiCanvas({
  className,
  style,
  brightness = 0.9,
}: AsciiKoiCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const texCanvas = document.createElement("canvas");
    const texCtx = texCanvas.getContext("2d");

    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const coarsePointer = window.matchMedia?.("(pointer: coarse)").matches;
    const motion = reduceMotion ? 0.35 : 1;
    const frameInterval = coarsePointer ? 50 : 0;
    let lastDraw = 0;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let pixelRatio = 1;
    let cell = 8; // Finer grid cell so silhouettes look like sleek fish, not blocky blobs
    let cols = 0;
    let rows = 0;

    let bright = new Float32Array(0);
    let inten = new Float32Array(0);
    let kind = new Uint8Array(0);
    let pal = new Uint8Array(0);

    let atlas: HTMLCanvasElement | null = null;
    let tilePx = 0;
    let atlasKey = "";

    let koi: Koi[] = [];
    let schools: School[] = [];
    let animationFrame = 0;
    let lastTime = performance.now();
    const pointer = { x: -9999, y: -9999, active: false };

    const lenScale = () => Math.min(1.05, Math.max(0.7, width / 1150));

    const resize = () => {
      const prevW = Math.max(width, 1);
      const prevH = Math.max(height, 1);
      width = window.innerWidth;
      height = window.innerHeight;
      pixelRatio = coarsePointer ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);

      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      const k = Math.min(1, TEXTURE_MAX / Math.max(width, height));
      texCanvas.width = Math.max(1, Math.round(width * k));
      texCanvas.height = Math.max(1, Math.round(height * k));

      cell = coarsePointer
        ? Math.min(12, Math.max(10, Math.round(width / 185)))
        : Math.min(9, Math.max(7, Math.round(width / 185)));
      cols = Math.ceil(width / cell);
      rows = Math.ceil(height / cell);
      const totalCells = cols * rows;
      bright = new Float32Array(totalCells);
      inten = new Float32Array(totalCells);
      kind = new Uint8Array(totalCells);
      pal = new Uint8Array(totalCells);

      const key = `${cell}:${pixelRatio}`;
      if (key !== atlasKey) {
        const built = buildAtlas(cell, pixelRatio);
        atlas = built.atlas;
        tilePx = built.tp;
        atlasKey = key;
      }

      const sx = width / prevW;
      const sy = height / prevH;
      koi.forEach((f) => {
        f.x *= sx;
        f.y *= sy;
        for (let i = 0; i < TRAIL_LEN; i++) {
          f.trailX[i] *= sx;
          f.trailY[i] *= sy;
        }
      });
      schools.forEach((s) => {
        s.x *= sx;
        s.y *= sy;
        s.members.forEach((m) => {
          m.x *= sx;
          m.y *= sy;
        });
      });

      const koiWanted = Math.max(8, Math.min(12, Math.round(width / 150)));
      while (koi.length < koiWanted) {
        koi.push(createKoi(width, height, lenScale(), cell, koi.length, koiWanted));
      }
      if (koi.length > koiWanted) koi = koi.slice(0, koiWanted);

      const schoolsWanted = Math.max(3, Math.min(6, Math.round(width / 350)));
      while (schools.length < schoolsWanted) {
        schools.push(createSchool(width, height));
      }
      if (schools.length > schoolsWanted) schools = schools.slice(0, schoolsWanted);
    };

    const shiftKoi = (fish: Koi, dx: number, dy: number) => {
      fish.x += dx;
      fish.y += dy;
      for (let i = 0; i < TRAIL_LEN; i++) {
        fish.trailX[i] += dx;
        fish.trailY[i] += dy;
      }
    };

    /** Advance koi forward, steer smoothly away from neighbors, and build curved spine */
    const updateKoi = (fish: Koi, idx: number, mdt: number) => {
      fish.wanderTimer -= mdt;
      if (fish.wanderTimer <= 0) {
        fish.turnBias = rand(-0.55, 0.55);
        fish.wanderTimer = rand(2.5, 6.0);
      }

      let avoidTurn = 0;
      const bodyPx = fish.len * cell;

      // 1. Mutual Collision Avoidance + Physical Separation Push
      for (let j = 0; j < koi.length; j++) {
        if (idx === j) continue;
        const other = koi[j];

        // Check against other fish's head and mid-body
        const midIdx = Math.min(TRAIL_LEN - 1, 25);
        const targets = [
          { x: other.x, y: other.y, weight: 1.0 },
          { x: other.trailX[midIdx], y: other.trailY[midIdx], weight: 0.8 },
        ];

        for (const pt of targets) {
          const dx = fish.x - pt.x;
          const dy = fish.y - pt.y;
          const dist = Math.hypot(dx, dy);
          const safeDist = bodyPx * 0.95;

          if (dist < safeDist && dist > 0.001) {
            const urgency = Math.pow(1 - dist / safeDist, 1.4) * pt.weight;
            // Steer smoothly perpendicular/away from the obstacle
            const awayAngle = Math.atan2(dy, dx);
            const diff = wrapAngle(awayAngle - fish.heading);
            avoidTurn += (diff >= 0 ? 1 : -1) * urgency * 2.4;

            // Hard non-overlapping push if they ever get too close
            if (dist < bodyPx * 0.42) {
              const push = (bodyPx * 0.42 - dist) * 0.35 * mdt * 10;
              shiftKoi(fish, (dx / dist) * push, (dy / dist) * push);
            }
          }
        }
      }

      // 2. Smoothly evade mouse cursor
      if (pointer.active) {
        const dx = fish.x - pointer.x;
        const dy = fish.y - pointer.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 180 && dist > 0.001) {
          const awayAngle = Math.atan2(dy, dx);
          const diff = wrapAngle(awayAngle - fish.heading);
          const urgency = Math.pow(1 - dist / 180, 1.4);
          avoidTurn += (diff >= 0 ? 1 : -1) * urgency * 3.2;
          fish.speed = Math.min(fish.baseSpeed * 1.75, fish.speed + 140 * mdt);
        }
      }

      fish.speed += (fish.baseSpeed - fish.speed) * Math.min(1, mdt * 2.2);

      // Apply damped angular velocity (capped so koi always make wide, graceful arcs)
      const targetTurn = Math.max(-1.35, Math.min(1.35, fish.turnBias + avoidTurn));
      fish.turnRate += (targetTurn - fish.turnRate) * Math.min(1, mdt * 2.8);
      fish.heading = wrapAngle(fish.heading + fish.turnRate * mdt);

      // Propulsive tail beat & forward velocity
      fish.phase += mdt * (4.2 + fish.speed * 0.045);
      const glide = 0.92 + 0.18 * Math.sin(fish.phase);
      const stepDist = fish.speed * glide * mdt;

      fish.x += Math.cos(fish.heading) * stepDist;
      fish.y += Math.sin(fish.heading) * stepDist;

      // Screen wrap with generous margin so the whole tail clears before teleporting
      const margin = bodyPx * 1.15;
      if (fish.x < -margin) shiftKoi(fish, width + margin * 2, 0);
      else if (fish.x > width + margin) shiftKoi(fish, -(width + margin * 2), 0);
      if (fish.y < -margin) shiftKoi(fish, 0, height + margin * 2);
      else if (fish.y > height + margin) shiftKoi(fish, 0, -(height + margin * 2));

      // Push new head position into the history trail when it moves at least 1.5px
      const dx0 = fish.x - fish.trailX[0];
      const dy0 = fish.y - fish.trailY[0];
      if (dx0 * dx0 + dy0 * dy0 >= 2.25) {
        for (let i = TRAIL_LEN - 1; i > 0; i--) {
          fish.trailX[i] = fish.trailX[i - 1];
          fish.trailY[i] = fish.trailY[i - 1];
        }
        fish.trailX[0] = fish.x;
        fish.trailY[0] = fish.y;
      }

      // Sample 28 evenly-spaced spine points along the exact distance of the trail
      const segLenPx = bodyPx / (SAMPLES - 1);
      let trailIdx = 0;
      let accDist = 0;

      for (let s = 0; s < SAMPLES; s++) {
        const targetDist = s * segLenPx;

        while (trailIdx < TRAIL_LEN - 2) {
          const segDx = fish.trailX[trailIdx + 1] - fish.trailX[trailIdx];
          const segDy = fish.trailY[trailIdx + 1] - fish.trailY[trailIdx];
          const d = Math.hypot(segDx, segDy);
          if (accDist + d >= targetDist || d < 0.0001) break;
          accDist += d;
          trailIdx++;
        }

        const ax = fish.trailX[trailIdx];
        const ay = fish.trailY[trailIdx];
        const bx = fish.trailX[trailIdx + 1];
        const by = fish.trailY[trailIdx + 1];
        const segDx = bx - ax;
        const segDy = by - ay;
        const d = Math.hypot(segDx, segDy);
        const frac = d > 0.0001 ? clamp01((targetDist - accDist) / d) : 0;

        // Tangent pointing backward (nose -> tail)
        const tx = d > 0.001 ? segDx / d : -Math.cos(fish.heading);
        const ty = d > 0.001 ? segDy / d : -Math.sin(fish.heading);

        // Normal perpendicular to spine
        const normX = -ty;
        const normY = tx;

        // Add subtle S-wave swimming oscillation along the rear half of the fish
        const u = s / (SAMPLES - 1); // 0 = nose, 1 = tail tip
        const swayAmp = Math.pow(u, 1.45) * fish.len * 0.095;
        const sway = Math.sin(fish.phase - u * 5.2) * swayAmp;

        fish.sx[s] = (ax + segDx * frac) / cell + normX * sway;
        fish.sy[s] = (ay + segDy * frac) / cell + normY * sway;
        fish.nx[s] = normX;
        fish.ny[s] = normY;
      }
    };

    /** Stamp the sleek curved koi silhouette into the ASCII grid */
    const rasterize = (fish: Koi) => {
      const L = fish.len;
      const hw = 0.125 * L; // Streamlined koi width (prevents fat blob look)

      let minGx = cols - 1;
      let maxGx = 0;
      let minGy = rows - 1;
      let maxGy = 0;

      for (let s = 0; s < SAMPLES; s++) {
        const x = fish.sx[s];
        const y = fish.sy[s];
        if (x < minGx) minGx = x;
        if (x > maxGx) maxGx = x;
        if (y < minGy) minGy = y;
        if (y > maxGy) maxGy = y;
      }

      const pad = Math.ceil(hw * 2.4);
      const gx0 = Math.max(0, Math.floor(minGx - pad));
      const gx1 = Math.min(cols - 1, Math.ceil(maxGx + pad));
      const gy0 = Math.max(0, Math.floor(minGy - pad));
      const gy1 = Math.min(rows - 1, Math.ceil(maxGy + pad));

      for (let gy = gy0; gy <= gy1; gy++) {
        const py = gy + 0.5;
        for (let gx = gx0; gx <= gx1; gx++) {
          const px = gx + 0.5;

          // Find closest spine sample
          let bestS = 0;
          let minDistSq = Infinity;
          for (let s = 0; s < SAMPLES; s++) {
            const dx = px - fish.sx[s];
            const dy = py - fish.sy[s];
            const dSq = dx * dx + dy * dy;
            if (dSq < minDistSq) {
              minDistSq = dSq;
              bestS = s;
            }
          }

          // Reject cells outside maximum fin reach immediately
          if (minDistSq > pad * pad) continue;

          // Sub-sample interpolation for smooth u & signed perpendicular distance d
          const s0 = Math.max(0, bestS - 1);
          const s1 = Math.min(SAMPLES - 1, bestS + 1);
          const tx = fish.sx[s1] - fish.sx[s0];
          const ty = fish.sy[s1] - fish.sy[s0];
          const tLen = Math.hypot(tx, ty) || 1;
          const ux = tx / tLen;
          const uy = ty / tLen;

          const relX = px - fish.sx[bestS];
          const relY = py - fish.sy[bestS];
          const along = relX * ux + relY * uy; // Offset along spine in cells

          // Reject cells floating in front of the nose or behind the tail tip
          const u = bestS / (SAMPLES - 1) + along / L;
          if (u < 0 || u > 1) continue;

          // Signed perpendicular distance from the curved spine centerline
          const d = relX * fish.nx[bestS] + relY * fish.ny[bestS];
          const ad = Math.abs(d);
          const w = u <= 0.76 ? hw * bodyHalfN(u) : 0;

          let i = 0;
          let k = 0;
          let colorIdx = fish.breed.base;

          // 1. Sleek Koi Head & Body (u: 0 -> 0.76)
          if (u <= 0.76 && ad <= w) {
            const edge = ad / Math.max(w, 0.25);
            i = 1 - 0.6 * Math.pow(edge, 1.4);

            // Dorsal Kohaku / Sanke Color Patches
            const pWave1 =
              Math.sin(u * 10.5 + fish.seed) + Math.cos((d / Math.max(hw, 0.4)) * 2.2 - fish.seed);
            const pWave2 =
              Math.sin(u * 16.0 - fish.seed * 1.3) +
              Math.sin((d / Math.max(hw, 0.4)) * 3.4 + fish.seed);

            if (pWave1 > 0.48 && u > 0.06 && u < 0.7) {
              colorIdx = fish.breed.patch1;
              i = Math.min(1, i * 1.15 + 0.12);
              k = 1;
            } else if (pWave2 > 0.92 && u > 0.12 && u < 0.65) {
              colorIdx = fish.breed.patch2;
              i = Math.min(1, i * 1.1);
              k = 1;
            }

            // Crisp Lateral Eyes near u = 0.09
            const eyeOff = w * 0.72;
            if (Math.abs(u - 0.09) < 0.032 && Math.abs(ad - eyeOff) < 0.42) {
              i = 1;
              k = 2;
              colorIdx = 7;
            }
          }
          // 2. Swept Pectoral Fins (u: 0.17 -> 0.36)
          else if (u >= 0.17 && u <= 0.36 && ad > w) {
            const fu = (u - 0.17) / 0.19;
            // Swept-back wing curve
            const wing = Math.sin(Math.pow(fu, 0.75) * Math.PI);
            const flap = 0.9 + 0.18 * Math.sin(fish.phase - fu * 2 + (d > 0 ? 0 : 0.7));
            const maxFin = w + hw * 1.05 * wing * flap;
            if (ad <= maxFin) {
              const fade = 1 - (ad - w) / (maxFin - w + 0.01);
              i = 0.32 + 0.35 * fade;
              k = 3;
              colorIdx = fish.breed.fin;
            }
          }
          // 3. Subtle Ventral Fins (u: 0.48 -> 0.60)
          else if (u >= 0.48 && u <= 0.6 && ad > w) {
            const fu = (u - 0.48) / 0.12;
            const maxFin = w + hw * 0.48 * Math.sin(fu * Math.PI);
            if (ad <= maxFin) {
              i = 0.34;
              k = 3;
              colorIdx = fish.breed.fin;
            }
          }

          // 4. Forked Caudal Tail Fin (u: 0.74 -> 1.0)
          if (i === 0 && u > 0.74) {
            const tu = (u - 0.74) / 0.26; // 0 = tail base, 1 = tail tips
            const fanSpread = hw * (0.18 + 1.25 * Math.pow(tu, 0.85));
            const forkNotch = tu > 0.38 ? hw * 0.78 * ((tu - 0.38) / 0.62) : 0;

            if (ad <= fanSpread && ad >= forkNotch) {
              i = 0.52 * (1 - 0.35 * tu);
              k = 3;
              colorIdx = fish.breed.fin;
            }
          }

          if (i <= 0.02) continue;

          const idx = gy * cols + gx;
          const b = clamp01(i * fish.glow * brightness);
          if (b > bright[idx]) {
            bright[idx] = b;
            inten[idx] = i;
            kind[idx] = k;
            pal[idx] = colorIdx;
          }
        }
      }
    };

    const animate = (time: number) => {
      if (time - lastDraw < frameInterval) {
        animationFrame = requestAnimationFrame(animate);
        return;
      }
      lastDraw = time;
      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;
      const t = time / 1000;
      const mdt = dt * motion;

      /* ── Update & Rasterize Koi ── */
      bright.fill(0);
      for (let i = 0; i < koi.length; i++) {
        updateKoi(koi[i], i, mdt);
        rasterize(koi[i]);
      }

      /* ── Draw ASCII Grid Cells ── */
      ctx.clearRect(0, 0, width, height);
      if (atlas) {
        const total = cols * rows;
        for (let idx = 0; idx < total; idx++) {
          const b = bright[idx];
          if (b < 0.05) continue;

          const gx = idx % cols;
          const gy = (idx / cols) | 0;
          const i = inten[idx];
          const k = kind[idx];
          const p = pal[idx];

          const base = hash(gx, gy, 0);
          const h = hash(gx, gy, Math.floor(t * 1.6 + (base & 255) / 64));

          let ch: string;
          if (k === 2) ch = "@";
          else if (k === 3) ch = SET_LO[h % SET_LO.length];
          else if (i > 0.78) ch = SET_HI[h % SET_HI.length];
          else if (i > 0.48) ch = SET_MID[h % SET_MID.length];
          else ch = SET_LO[h % SET_LO.length];

          const level = Math.min(LEVELS - 1, Math.floor(b * LEVELS));
          const row = p * LEVELS + level;

          ctx.drawImage(
            atlas,
            GLYPH_INDEX[ch] * tilePx,
            row * tilePx,
            tilePx,
            tilePx,
            gx * cell,
            gy * cell,
            cell,
            cell
          );
        }
      }

      /* ── Schools of Tiny Minnows ── */
      ctx.font = `bold ${cell}px "Courier New", monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      for (const school of schools) {
        const px0 = school.x;
        const py0 = school.y;

        school.wanderTimer -= mdt;
        if (school.wanderTimer <= 0) {
          school.turnTarget = rand(-0.55, 0.55);
          school.wanderTimer = rand(2, 5);
        }
        school.turnRate += (school.turnTarget - school.turnRate) * Math.min(1, mdt * 1.5);
        school.heading += school.turnRate * mdt;

        school.x += Math.cos(school.heading) * school.speed * mdt;
        school.y += Math.sin(school.heading) * school.speed * mdt;

        const margin = 140;
        if (school.x < -margin) school.x = width + margin;
        else if (school.x > width + margin) school.x = -margin;
        if (school.y < -margin) school.y = height + margin;
        else if (school.y > height + margin) school.y = -margin;

        const jumpX = Math.abs(school.x - px0) > 100 ? school.x - px0 : 0;
        const jumpY = Math.abs(school.y - py0) > 100 ? school.y - py0 : 0;

        const ca = Math.cos(school.heading);
        const sa = Math.sin(school.heading);
        const lvx = ca * school.speed;
        const lvy = sa * school.speed;

        for (const m of school.members) {
          m.x += jumpX;
          m.y += jumpY;

          const ax = m.ox + Math.sin(t * 0.8 + m.orbit) * 8;
          const ay = m.oy + Math.cos(t * 1.1 + m.orbit) * 8;
          const tx = school.x + ax * ca - ay * sa;
          const ty = school.y + ax * sa + ay * ca;

          const desiredVx = (tx - m.x) * 2.2 + lvx;
          const desiredVy = (ty - m.y) * 2.2 + lvy;
          const follow = Math.min(1, mdt * 3.5);
          m.vx += (desiredVx - m.vx) * follow;
          m.vy += (desiredVy - m.vy) * follow;

          if (pointer.active) {
            const ddx = m.x - pointer.x;
            const ddy = m.y - pointer.y;
            const dist = Math.hypot(ddx, ddy);
            if (dist < 140 && dist > 0.001) {
              const push = (1 - dist / 140) * 440 * dt;
              m.vx += (ddx / dist) * push;
              m.vy += (ddy / dist) * push;
            }
          }

          const speed = Math.hypot(m.vx, m.vy);
          if (speed > 160) {
            m.vx = (m.vx / speed) * 160;
            m.vy = (m.vy / speed) * 160;
          }
          m.x += m.vx * mdt;
          m.y += m.vy * mdt;

          const rgb = PALETTE_DEFS[m.colorIdx].rgb;
          ctx.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${clamp01(0.65 * brightness)})`;

          const a = (((Math.atan2(m.vy, m.vx) % Math.PI) + Math.PI) % Math.PI) / Math.PI;
          const glyph = a < 0.125 || a > 0.875 ? "-" : a < 0.375 ? "\\" : a < 0.625 ? "|" : "/";
          ctx.fillText(
            glyph,
            (Math.floor(m.x / cell) + 0.5) * cell,
            (Math.floor(m.y / cell) + 0.5) * cell
          );
        }
      }

      if (texCtx) {
        texCtx.clearRect(0, 0, texCanvas.width, texCanvas.height);
        texCtx.drawImage(canvas, 0, 0, texCanvas.width, texCanvas.height);
        koiManager.broadcast(texCanvas);
      }

      animationFrame = requestAnimationFrame(animate);
    };

    const onPointerMove = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
    };
    const onPointerLeave = () => {
      pointer.active = false;
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onPointerLeave);
    animationFrame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [brightness]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 w-full h-full pointer-events-none z-0 ${className || ""}`}
      style={style}
      aria-hidden="true"
    />
  );
}
