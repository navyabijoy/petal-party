import { BLOOM_SHAPES, type BloomType } from "@/lib/blooms";

/** A bloom as an SVG group in a -50..50 box, for embedding in a larger SVG. */
export function BloomShape({ type, faded = false }: { type: BloomType; faded?: boolean }) {
  const s = BLOOM_SHAPES[type];
  return (
    <g opacity={faded ? 0.28 : 1}>
      <g filter="url(#pp-wc)" opacity={0.88}>
        <circle cx={2} cy={2} r={s.blobR} fill={s.blob} />
        <circle cx={-6} cy={-4} r={Math.round(s.blobR * 0.7)} fill={s.blob} opacity={0.7} />
      </g>
      <g filter="url(#pp-ink)" stroke="#1B1B1B" strokeWidth={s.ink} strokeLinejoin="round" strokeLinecap="round">
        <path d={s.petals} fill={s.petalFill} />
        {s.centerR > 0 && <circle r={s.centerR} fill={s.center} />}
        {s.detail && <path d={s.detail} fill="none" strokeWidth={Math.min(s.ink, 1.2)} />}
      </g>
    </g>
  );
}

export function Bloom({ type, size = 96, faded, label }: { type: BloomType; size?: number; faded?: boolean; label?: string }) {
  return (
    <svg viewBox="-50 -50 100 100" width={size} height={size} role="img" aria-label={label ?? type} style={{ overflow: "visible" }}>
      <BloomShape type={type} faded={faded} />
    </svg>
  );
}
