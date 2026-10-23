// Procedural hand-drawn blooms. All geometry lives in a -50..50 box so a bloom
// can be dropped into any SVG with a simple scale/translate.

export type BloomType =
  | "sunflower" | "gerbera" | "daisy" | "rose"
  | "carnation" | "anemone" | "peony" | "lily";

export type BloomShape = {
  blob: string;
  blobR: number;
  petals: string;
  petalFill: string;
  center: string;
  centerR: number;
  detail: string;
  /** Ink line width; dense flowers need a finer line. */
  ink: number;
};

const pt = (r: number, a: number) => `${(r * Math.cos(a)).toFixed(1)} ${(r * Math.sin(a)).toFixed(1)}`;
const jit = (i: number, k: number) => Math.sin(i * 12.9898 + k * 78.233) * 0.5 + 0.5;

function petals(n: number, r1: number, r2: number, d: number, off: number, j: number) {
  let s = "";
  for (let i = 0; i < n; i++) {
    const a = off + (i * 2 * Math.PI) / n;
    const rr = r2 * (1 - j * jit(i, 1));
    const m = ((r1 + rr) / 2) * 1.04;
    s += `M${pt(r1, a - d * 0.35)} Q${pt(m, a - d)} ${pt(rr, a)} Q${pt(m, a + d)} ${pt(r1, a + d * 0.35)} `;
  }
  return s;
}

function scallop(n: number, r: number, b: number, off: number) {
  let s = "";
  for (let i = 0; i < n; i++) {
    const a0 = off + (i * 2 * Math.PI) / n;
    const a1 = off + ((i + 1) * 2 * Math.PI) / n;
    if (i === 0) s += `M${pt(r, a0)}`;
    s += ` Q${pt(r + b * (0.7 + 0.6 * jit(i, 2)), (a0 + a1) / 2)} ${pt(r, a1)}`;
  }
  return s + " Z ";
}

function spiral() {
  let s = "";
  [6, 11, 17, 23, 29, 35].forEach((r, k) => {
    const a = k * 1.9;
    s += `M${pt(r, a)} A${r} ${r} 0 1 1 ${pt(r, a + 4.3)} `;
  });
  return s;
}

function hatch(r: number) {
  let s = "";
  for (const rot of [-0.785, 0.785]) {
    const c = Math.cos(rot);
    const sn = Math.sin(rot);
    for (let x = -r + 4; x < r; x += 5) {
      const h = Math.sqrt(r * r - x * x) * 0.9;
      s += `M${(x * c + h * sn).toFixed(1)} ${(x * sn - h * c).toFixed(1)} L${(x * c - h * sn).toFixed(1)} ${(x * sn + h * c).toFixed(1)} `;
    }
  }
  return s;
}

function rays(n: number, r: number) {
  let s = "";
  for (let i = 0; i < n; i++) {
    const a = (i * 2 * Math.PI) / n + 0.3;
    s += `M${pt(4, a)} L${pt(r, a)} `;
  }
  return s;
}

const dot = "M5 0 A5 5 0 1 1 -5 0 A5 5 0 1 1 5 0";

export const BLOOM_SHAPES: Record<BloomType, BloomShape> = {
  sunflower: { blob: "#F6C232", blobR: 42, petals: petals(20, 17, 46, 0.2, 0, 0.1) + petals(20, 17, 40, 0.17, 0.157, 0.1), petalFill: "#FBD654", center: "#8A4512", centerR: 18, detail: hatch(14), ink: 1.2 },
  gerbera: { blob: "#E2449A", blobR: 41, petals: petals(22, 10, 44, 0.13, 0, 0.1), petalFill: "#EE6DB0", center: "#F2D13A", centerR: 9, detail: dot, ink: 1.1 },
  daisy: { blob: "#B9D6DA", blobR: 36, petals: petals(14, 8, 42, 0.14, 0, 0.12), petalFill: "#FFFFFF", center: "#F2A93B", centerR: 8, detail: "", ink: 1.4 },
  rose: { blob: "#E2353C", blobR: 40, petals: scallop(9, 38, 6, 0.2), petalFill: "none", center: "none", centerR: 0, detail: spiral(), ink: 1.7 },
  carnation: { blob: "#F39A86", blobR: 38, petals: scallop(16, 36, 6, 0) + scallop(11, 24, 6, 0.5) + scallop(7, 12, 5, 1), petalFill: "none", center: "none", centerR: 0, detail: "", ink: 1.5 },
  anemone: { blob: "#A7D7D1", blobR: 42, petals: petals(6, 2, 46, 0.5, 0.3, 0.08), petalFill: "#EAF6F3", center: "#47516E", centerR: 10, detail: dot + rays(10, 16), ink: 1.5 },
  peony: { blob: "#F2A3B6", blobR: 44, petals: scallop(10, 40, 8, 0) + scallop(8, 27, 7, 0.4) + scallop(6, 15, 5, 0.9), petalFill: "none", center: "#F4C04A", centerR: 6, detail: "", ink: 1.6 },
  lily: { blob: "#8C7BD2", blobR: 42, petals: petals(6, 0, 48, 0.42, -1.57, 0.06), petalFill: "#B9A8EE", center: "none", centerR: 0, detail: rays(6, 26), ink: 1.6 },
};

export const BLOOM_TYPES = Object.keys(BLOOM_SHAPES) as BloomType[];
