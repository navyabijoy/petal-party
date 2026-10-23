import { BOX, type Arrangement, type Item } from "@/lib/arrangement";
import { RIBBONS, WRAPS, type GreenType } from "@/lib/catalog";
import { BloomShape } from "./Bloom";

const INK = "#1B1B1B";

/** Fixed foliage behind every bouquet, so even three blooms look full. */
export function Foliage() {
  return (
    <g filter="url(#pp-leaf)" fill="#2F6B45">
      <path d="M150 335 C 120 260, 80 205, 22 178 C 92 192, 136 248, 150 335 Z" />
      <path d="M150 335 C 180 260, 222 210, 282 186 C 210 196, 166 250, 150 335 Z" />
      <path d="M150 335 C 135 240, 110 160, 70 92 C 128 150, 150 236, 150 335 Z" />
      <path d="M150 335 C 168 230, 196 150, 246 82 C 186 140, 158 230, 150 335 Z" />
      <path d="M150 335 C 148 240, 160 120, 196 30 C 170 120, 156 240, 150 335 Z" />
      <path d="M150 335 C 140 270, 108 230, 92 140 C 126 214, 144 268, 150 335 Z" fill="#3E8257" />
    </g>
  );
}

const GREEN_PATHS: Record<GreenType, { d: string; fill: string; stroke?: string }> = {
  fern: { d: "M0 40 C -4 10, -2 -20, 0 -48 C 8 -30, 12 -10, 0 40 Z M0 20 L-18 8 M0 6 L-20 -8 M0 -8 L-16 -22 M0 20 L18 8 M0 6 L20 -8 M0 -8 L16 -22", fill: "#3E8257", stroke: "#2F6B45" },
  eucalyptus: { d: "M0 44 C -2 10, 0 -20, 0 -46 M0 -30 m-9 0 a9 11 0 1 0 18 0 a9 11 0 1 0 -18 0 M0 -8 m-10 0 a10 12 0 1 0 20 0 a10 12 0 1 0 -20 0 M0 14 m-9 0 a9 11 0 1 0 18 0 a9 11 0 1 0 -18 0", fill: "#8FB59A", stroke: "#4F7A5E" },
  grass: { d: "M-10 44 C -14 10, -10 -20, -4 -46 M0 44 C 0 10, 2 -24, 8 -50 M10 44 C 14 14, 18 -16, 24 -40", fill: "none", stroke: "#4C8A5E" },
  ivy: { d: "M0 44 C 10 20, -10 0, 4 -24 C 8 -34, 0 -44, 0 -48 M2 20 l-14 -6 l8 -10 z M4 -2 l16 -4 l-8 -12 z M0 -24 l-14 -4 l6 -12 z", fill: "#2F6B45", stroke: "#1F4D31" },
};

function GreenShape({ type }: { type: GreenType }) {
  const g = GREEN_PATHS[type];
  return (
    <g filter="url(#pp-ink)" stroke={g.stroke ?? INK} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d={g.d} fill={g.fill} />
    </g>
  );
}

export const itemTransform = (item: Item) => `translate(${item.x} ${item.y}) rotate(${item.r}) scale(${item.s / 100})`;

/** The drawing of one item in its own -50..50 space (no transform). */
export function ItemContent({ item }: { item: Item }) {
  return item.kind === "bloom" ? <BloomShape type={item.type} /> : <GreenShape type={item.type} />;
}

function ItemShape({ item }: { item: Item }) {
  return (
    <g transform={itemTransform(item)}>
      <ItemContent item={item} />
    </g>
  );
}

export function Wrap({ color, ribbon }: { color: string; ribbon: string }) {
  return (
    <g stroke={INK} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round">
      <path d="M36 196 Q 70 224 104 204 Q 150 238 196 204 Q 230 224 264 196 L 168 336 L 132 336 Z" fill={color} />
      <path d="M104 206 L 138 332 M 196 206 L 162 332" fill="none" strokeOpacity={0.25} strokeWidth={2} />
      <path d="M70 222 L 116 316" fill="none" stroke="#fff" strokeOpacity={0.6} strokeWidth={6} />
      <g transform="translate(150 262)">
        <path d="M-3 6 L -18 44 L -6 38 Z" fill={ribbon} strokeWidth={2.5} />
        <path d="M3 6 L 18 44 L 6 38 Z" fill={ribbon} strokeWidth={2.5} />
        <path d="M0 0 C -30 -26, -46 4, -30 14 C -20 20, -8 10, 0 0 Z" fill={ribbon} />
        <path d="M0 0 C 30 -26, 46 4, 30 14 C 20 20, 8 10, 0 0 Z" fill={ribbon} />
        <circle r={8} fill={ribbon} />
      </g>
    </g>
  );
}

type Props = {
  arrangement: Arrangement;
  /** Rendered width in px; height follows the 300x340 box. */
  width?: number;
  halo?: string;
  label?: string;
};

export function Bouquet({ arrangement, width = 300, halo = "#F1F0D6", label = "A hand-drawn bouquet" }: Props) {
  const wrap = WRAPS.find((w) => w.id === arrangement.wrap) ?? WRAPS[0];
  const ribbon = RIBBONS.find((r) => r.id === arrangement.ribbon) ?? RIBBONS[0];
  return (
    <svg viewBox={`0 0 ${BOX.w} ${BOX.h}`} width={width} height={(width * BOX.h) / BOX.w} role="img" aria-label={label} style={{ display: "block", maxWidth: "100%" }}>
      <circle cx={150} cy={150} r={138} fill={halo} />
      <Foliage />
      {arrangement.items.map((it) => (
        <ItemShape key={it.id} item={it} />
      ))}
      <Wrap color={wrap.color} ribbon={ribbon.color} />
    </svg>
  );
}
