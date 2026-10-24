"use client";

import { useEffect, useMemo, useReducer, useState, type ReactNode } from "react";
import { LIMITS, type Arrangement, type Item } from "@/lib/arrangement";
import { BLOOM_BY_TYPE, type GreenType } from "@/lib/catalog";
import type { BloomType } from "@/lib/blooms";
import { countBlooms, initialState, reducer } from "@/lib/studioState";
import { StudioCanvas } from "./StudioCanvas";
import { TABS, Tray, type TabId } from "./Tray";
import styles from "./studio.module.css";

const SIZE_FOR = { L: 100, M: 82, S: 58 } as const;
const newId = () => Math.random().toString(36).slice(2, 10);
const jitter = (n: number) => (Math.random() - 0.5) * 2 * n;

type Props = {
  /** Small stamped label above the canvas, e.g. the theme. */
  label?: string;
  minBlooms: number;
  maxBlooms: number;
  doneLabel?: string;
  busy?: boolean;
  /** Shown next to the label, e.g. a countdown. */
  timer?: ReactNode;
  /** Called with the latest bouquet whenever it changes. */
  onChange?: (arrangement: Arrangement) => void;
  initial?: Arrangement;
  onDone: (arrangement: Arrangement) => void;
};

function Icon({ d }: { d: string }) {
  return (
    <svg width={18} height={18} viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="#1B1B1B" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

export function Studio({ label, minBlooms, maxBlooms, doneLabel = "Done", busy = false, timer, onChange, initial, onDone }: Props) {
  const [state, dispatch] = useReducer(reducer, initial, (i) => initialState(i));
  const [tab, setTab] = useState<TabId>("blooms");
  const { present, selectedId } = state;

  useEffect(() => {
    onChange?.(present);
  }, [present, onChange]);

  const blooms = useMemo(() => countBlooms(present), [present]);
  const atLimit = blooms >= maxBlooms || present.items.length >= LIMITS.maxItems;
  const ready = blooms >= minBlooms;

  const addBloom = (type: BloomType) => {
    if (atLimit) return;
    const item: Item = { id: newId(), kind: "bloom", type, x: 150 + jitter(50), y: 130 + jitter(40), s: SIZE_FOR[BLOOM_BY_TYPE[type].size], r: jitter(15) };
    dispatch({ t: "add", item });
  };
  const addGreen = (type: GreenType) => {
    if (present.items.length >= LIMITS.maxItems) return;
    dispatch({ t: "add", item: { id: newId(), kind: "green", type, x: 150 + jitter(70), y: 150 + jitter(30), s: 90, r: jitter(35) } });
  };

  return (
    <main className={styles.studio}>
      <div className={styles.top}>
        <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {label ? <span className="stamp">{label}</span> : <span className="tw" style={{ fontWeight: 700, letterSpacing: 2 }}>STUDIO</span>}
          {timer}
        </span>
        <button className={`btn-black ${styles.done}`} disabled={!ready || busy} onClick={() => onDone(present)}>
          {doneLabel}
        </button>
      </div>

      <div className={styles.stage}>
        <StudioCanvas arrangement={present} selectedId={selectedId} dispatch={dispatch} />
        <div className={styles.tools}>
          <button className={styles.tool} aria-label="Undo" disabled={state.past.length === 0} onClick={() => dispatch({ t: "undo" })}>
            <Icon d="M7 4L3 8l4 4M3 8h9a5 5 0 0 1 0 10H9" />
          </button>
          <button className={styles.tool} aria-label="Rearrange for me" disabled={present.items.length < 2} onClick={() => dispatch({ t: "scatter", rng: Math.random })}>
            <Icon d="M2 5h4l8 10h4M2 15h4l2.5-3M12 8l2-3h4M15 2l3 3-3 3M15 12l3 3-3 3" />
          </button>
          <button className={styles.tool} aria-label="Bring forward" disabled={!selectedId} onClick={() => selectedId && dispatch({ t: "layer", id: selectedId, dir: 1 })}>
            <Icon d="M10 3l6 6H4zM10 17V9" />
          </button>
          <button className={styles.tool} aria-label="Send backward" disabled={!selectedId} onClick={() => selectedId && dispatch({ t: "layer", id: selectedId, dir: -1 })}>
            <Icon d="M10 17l6-6H4zM10 3v8" />
          </button>
          <button className={styles.tool} aria-label="Remove selected" disabled={!selectedId} onClick={() => selectedId && dispatch({ t: "remove", id: selectedId })}>
            <Icon d="M3 5h14M8 5V3h4v2M5 5l1 12h8l1-12" />
          </button>
        </div>
      </div>

      <div className={styles.tabs} role="tablist" aria-label="Item types">
        {TABS.map((t) => (
          <button key={t.id} className={styles.tab} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      <div className={styles.side}>
        <div className={styles.count} aria-live="polite">
          pick {minBlooms} to {maxBlooms} blooms · <em>{blooms}</em> picked
        </div>
        <Tray
          tab={tab}
          arrangement={present}
          atBloomLimit={atLimit}
          onAddBloom={addBloom}
          onAddGreen={addGreen}
          onWrap={(id) => dispatch({ t: "wrap", id })}
          onRibbon={(id) => dispatch({ t: "ribbon", id })}
          onCard={(card) => dispatch({ t: "card", card })}
        />
        <div className={styles.hint}>drag to move · pinch or drag the yellow dot to resize and turn</div>
      </div>
    </main>
  );
}
