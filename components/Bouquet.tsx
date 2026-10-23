import { BOX, type Arrangement, type Item } from "@/lib/arrangement";
import { RIBBONS, WRAPS, type GreenType } from "@/lib/catalog";
import { FOLIAGE, FOLIAGE_FILL, GREEN_PATHS, INK, WRAP } from "@/lib/bouquetParts";
import { BloomShape } from "./Bloom";

/** Fixed foliage behind every bouquet, so even three blooms look full. */
export function Foliage({ plain = false }: { plain?: boolean }) {
  return (
    <g filter={plain ? undefined : "url(#pp-leaf)"} fill={FOLIAGE_FILL}>
      {FOLIAGE.map((f) => (
        <path key={f.d} d={f.d} fill={f.fill} />
      ))}
    </g>
  );
}

function GreenShape({ type, plain }: { type: GreenType; plain?: boolean }) {
  const g = GREEN_PATHS[type];
  return (
    <g filter={plain ? undefined : "url(#pp-ink)"} stroke={g.stroke ?? INK} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d={g.d} fill={g.fill} />
    </g>
  );
}

export const itemTransform = (item: Item) => `translate(${item.x} ${item.y}) rotate(${item.r}) scale(${item.s / 100})`;

/** The drawing of one item in its own -50..50 space (no transform). */
export function ItemContent({ item, plain }: { item: Item; plain?: boolean }) {
  return item.kind === "bloom" ? <BloomShape type={item.type} plain={plain} /> : <GreenShape type={item.type} plain={plain} />;
}

function ItemShape({ item, plain }: { item: Item; plain?: boolean }) {
  return (
    <g transform={itemTransform(item)}>
      <ItemContent item={item} plain={plain} />
    </g>
  );
}

export function Wrap({ color, ribbon }: { color: string; ribbon: string }) {
  return (
    <g stroke={INK} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round">
      <path d={WRAP.body} fill={color} />
      <path d={WRAP.folds} fill="none" strokeOpacity={0.25} strokeWidth={2} />
      <path d={WRAP.shine} fill="none" stroke="#fff" strokeOpacity={0.6} strokeWidth={6} />
      <g transform={WRAP.bowAt}>
        {WRAP.tails.map((d) => (
          <path key={d} d={d} fill={ribbon} strokeWidth={2.5} />
        ))}
        {WRAP.loops.map((d) => (
          <path key={d} d={d} fill={ribbon} />
        ))}
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
  /** Skip the watercolor filters (used where they are not supported, like share images). */
  plain?: boolean;
};

export function Bouquet({ arrangement, width = 300, halo = "#F1F0D6", label = "A hand-drawn bouquet", plain = false }: Props) {
  const wrap = WRAPS.find((w) => w.id === arrangement.wrap) ?? WRAPS[0];
  const ribbon = RIBBONS.find((r) => r.id === arrangement.ribbon) ?? RIBBONS[0];
  return (
    <svg viewBox={`0 0 ${BOX.w} ${BOX.h}`} width={width} height={(width * BOX.h) / BOX.w} role="img" aria-label={label} style={{ display: "block", maxWidth: "100%" }}>
      <circle cx={150} cy={150} r={138} fill={halo} />
      <Foliage plain={plain} />
      {arrangement.items.map((it) => (
        <ItemShape key={it.id} item={it} plain={plain} />
      ))}
      <Wrap color={wrap.color} ribbon={ribbon.color} />
    </svg>
  );
}
