"use client";

import { Bloom } from "@/components/Bloom";
import { ItemContent } from "@/components/Bouquet";
import { BLOOMS, GREENS, RIBBONS, WRAPS, type GreenType } from "@/lib/catalog";
import type { BloomType } from "@/lib/blooms";
import type { Arrangement } from "@/lib/arrangement";
import type { Card } from "@/lib/arrangement";
import { CardEditor } from "./CardEditor";
import styles from "./studio.module.css";

export type TabId = "blooms" | "greens" | "wrap" | "ribbon" | "card";
export const TABS: { id: TabId; label: string }[] = [
  { id: "blooms", label: "Blooms" },
  { id: "greens", label: "Greens" },
  { id: "wrap", label: "Wrap" },
  { id: "ribbon", label: "Ribbon" },
  { id: "card", label: "Card" },
];

type Props = {
  tab: TabId;
  arrangement: Arrangement;
  atBloomLimit: boolean;
  onAddBloom: (t: BloomType) => void;
  onAddGreen: (t: GreenType) => void;
  onWrap: (id: string) => void;
  onRibbon: (id: string) => void;
  onCard: (c: Card) => void;
};

export function Tray({ tab, arrangement, atBloomLimit, onAddBloom, onAddGreen, onWrap, onRibbon, onCard }: Props) {
  const count = (kind: "bloom" | "green", type: string) => arrangement.items.filter((i) => i.kind === kind && i.type === type).length;

  if (tab === "card") {
    return <CardEditor card={arrangement.card ?? { to: "", msg: "", from: "" }} onChange={onCard} />;
  }

  return (
    <div className={styles.grid}>
      {tab === "blooms" &&
        BLOOMS.map((b) => {
          const n = count("bloom", b.type);
          return (
            <button key={b.type} className={styles.pick} disabled={atBloomLimit} onClick={() => onAddBloom(b.type)} aria-label={`Add ${b.name}${n ? `, ${n} in bouquet` : ""}`}>
              <Bloom type={b.type} size={64} label="" />
              <span className={styles.pickName}>{b.name}</span>
              {n > 0 && <span className={styles.badge}>×{n}</span>}
            </button>
          );
        })}
      {tab === "greens" &&
        GREENS.map((g) => {
          const n = count("green", g.type);
          return (
            <button key={g.type} className={styles.pick} onClick={() => onAddGreen(g.type)} aria-label={`Add ${g.name}${n ? `, ${n} in bouquet` : ""}`}>
              <svg viewBox="-50 -50 100 100" width={64} height={64} aria-hidden="true">
                <GreenPreview type={g.type} />
              </svg>
              <span className={styles.pickName}>{g.name}</span>
              {n > 0 && <span className={styles.badge}>×{n}</span>}
            </button>
          );
        })}
      {tab === "wrap" &&
        WRAPS.map((w) => (
          <button key={w.id} className={styles.pick} aria-pressed={arrangement.wrap === w.id} onClick={() => onWrap(w.id)} aria-label={`${w.name} wrap`}>
            <span className={styles.swatch} style={{ background: w.color }} />
            <span className={styles.pickName}>{w.name}</span>
          </button>
        ))}
      {tab === "ribbon" &&
        RIBBONS.map((r) => (
          <button key={r.id} className={styles.pick} aria-pressed={arrangement.ribbon === r.id} onClick={() => onRibbon(r.id)} aria-label={`${r.name} ribbon`}>
            <span className={styles.swatch} style={{ background: r.color }} />
            <span className={styles.pickName}>{r.name}</span>
          </button>
        ))}
    </div>
  );
}

function GreenPreview({ type }: { type: GreenType }) {
  return <ItemContent item={{ id: "p", kind: "green", type, x: 0, y: 0, s: 100, r: 0 }} />;
}
