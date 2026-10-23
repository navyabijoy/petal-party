// A bouquet as a plain SVG string with no filters, for places React components can't go
// (the share image). Uses the same drawing data as components/Bouquet.tsx.
import type { Arrangement, Item } from "./arrangement";
import { BOX } from "./arrangement";
import { BLOOM_SHAPES } from "./blooms";
import { FOLIAGE, FOLIAGE_FILL, GREEN_PATHS, INK, WRAP } from "./bouquetParts";
import { RIBBONS, WRAPS } from "./catalog";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

function bloom(type: keyof typeof BLOOM_SHAPES): string {
  const s = BLOOM_SHAPES[type];
  const blobs = `<circle cx="2" cy="2" r="${s.blobR}" fill="${s.blob}" opacity=".88"/><circle cx="-6" cy="-4" r="${Math.round(s.blobR * 0.7)}" fill="${s.blob}" opacity=".6"/>`;
  const ink = `<g stroke="${INK}" stroke-width="${s.ink}" stroke-linejoin="round" stroke-linecap="round"><path d="${s.petals}" fill="${s.petalFill}"/>${s.centerR > 0 ? `<circle r="${s.centerR}" fill="${s.center}"/>` : ""}${s.detail ? `<path d="${s.detail}" fill="none" stroke-width="${Math.min(s.ink, 1.2)}"/>` : ""}</g>`;
  return blobs + ink;
}

function green(type: keyof typeof GREEN_PATHS): string {
  const g = GREEN_PATHS[type];
  return `<g stroke="${g.stroke ?? INK}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${g.d}" fill="${g.fill}"/></g>`;
}

const item = (it: Item) =>
  `<g transform="translate(${it.x} ${it.y}) rotate(${it.r}) scale(${it.s / 100})">${it.kind === "bloom" ? bloom(it.type) : green(it.type)}</g>`;

export function bouquetSvg(a: Arrangement, width: number, halo = "#F1F0D6"): string {
  const wrap = (WRAPS.find((w) => w.id === a.wrap) ?? WRAPS[0]).color;
  const ribbon = (RIBBONS.find((r) => r.id === a.ribbon) ?? RIBBONS[0]).color;
  const height = Math.round((width * BOX.h) / BOX.w);
  const foliage = FOLIAGE.map((f) => `<path d="${f.d}"${f.fill ? ` fill="${f.fill}"` : ""}/>`).join("");
  const bow = `<g transform="${WRAP.bowAt}">${WRAP.tails.map((d) => `<path d="${d}" fill="${esc(ribbon)}" stroke-width="2.5"/>`).join("")}${WRAP.loops.map((d) => `<path d="${d}" fill="${esc(ribbon)}"/>`).join("")}<circle r="8" fill="${esc(ribbon)}"/></g>`;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${BOX.w} ${BOX.h}" width="${width}" height="${height}">` +
    `<circle cx="150" cy="150" r="138" fill="${halo}"/>` +
    `<g fill="${FOLIAGE_FILL}">${foliage}</g>` +
    a.items.map(item).join("") +
    `<g stroke="${INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">` +
    `<path d="${WRAP.body}" fill="${esc(wrap)}"/><path d="${WRAP.folds}" fill="none" stroke-opacity=".25" stroke-width="2"/><path d="${WRAP.shine}" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="6"/>${bow}</g>` +
    `</svg>`
  );
}
