import { BOX, emptyArrangement, type Arrangement, type Card, type Item } from "./arrangement";

export type StudioState = {
  present: Arrangement;
  past: Arrangement[];
  selectedId: string | null;
};

export type Action =
  | { t: "add"; item: Item }
  | { t: "checkpoint" }
  | { t: "patch"; id: string; patch: Partial<Pick<Item, "x" | "y" | "s" | "r">> }
  | { t: "remove"; id: string }
  | { t: "layer"; id: string; dir: 1 | -1 }
  | { t: "select"; id: string | null }
  | { t: "wrap"; id: string }
  | { t: "ribbon"; id: string }
  | { t: "card"; card: Card }
  | { t: "scatter"; rng: () => number }
  | { t: "undo" }
  | { t: "reset"; arrangement?: Arrangement };

const HISTORY_LIMIT = 50;
export const SIZE_MIN = 24;
export const SIZE_MAX = 220;

export const initialState = (arrangement: Arrangement = emptyArrangement()): StudioState => ({
  present: arrangement,
  past: [],
  selectedId: null,
});

const clamp = (n: number, lo: number, hi: number) => Math.min(Math.max(n, lo), hi);

const withHistory = (state: StudioState, present: Arrangement, selectedId = state.selectedId): StudioState => ({
  present,
  past: [...state.past, state.present].slice(-HISTORY_LIMIT),
  selectedId,
});

export const countBlooms = (a: Arrangement) => a.items.filter((i) => i.kind === "bloom").length;

/** Fan the blooms out from a focal point: big ones in the middle, small ones around. */
export function scatterItems(items: Item[], rng: () => number): Item[] {
  const blooms = items.filter((i) => i.kind === "bloom").sort((a, b) => b.s - a.s);
  const greens = items.filter((i) => i.kind === "green");
  const placed: Item[] = [];
  blooms.forEach((it, i) => {
    if (i === 0) {
      placed.push({ ...it, x: 150, y: 120, r: (rng() - 0.5) * 20 });
      return;
    }
    const ring = i <= 4 ? 1 : 2;
    const slots = ring === 1 ? 4 : 6;
    const idx = ring === 1 ? i - 1 : i - 5;
    const angle = (idx / slots) * Math.PI * 2 + ring * 0.5 + (rng() - 0.5) * 0.4;
    const radius = (ring === 1 ? 62 : 100) + (rng() - 0.5) * 14;
    placed.push({
      ...it,
      x: clamp(150 + Math.cos(angle) * radius, 40, BOX.w - 40),
      y: clamp(125 + Math.sin(angle) * radius * 0.75, 50, 235),
      r: (rng() - 0.5) * 30,
    });
  });
  greens.forEach((it, i) => {
    const side = i % 2 === 0 ? -1 : 1;
    placed.unshift({ ...it, x: 150 + side * (70 + rng() * 30), y: 140 + rng() * 30, r: side * (25 + rng() * 20) });
  });
  return placed;
}

export function reducer(state: StudioState, action: Action): StudioState {
  const { present } = state;
  switch (action.t) {
    case "add":
      return withHistory(state, { ...present, items: [...present.items, action.item] }, action.item.id);
    case "checkpoint":
      return { ...state, past: [...state.past, present].slice(-HISTORY_LIMIT) };
    case "patch": {
      const items = present.items.map((it) => {
        if (it.id !== action.id) return it;
        const p = action.patch;
        return {
          ...it,
          x: p.x === undefined ? it.x : clamp(p.x, -20, BOX.w + 20),
          y: p.y === undefined ? it.y : clamp(p.y, -20, BOX.h + 20),
          s: p.s === undefined ? it.s : clamp(p.s, SIZE_MIN, SIZE_MAX),
          r: p.r === undefined ? it.r : p.r,
        };
      });
      return { ...state, present: { ...present, items } };
    }
    case "remove": {
      if (!present.items.some((i) => i.id === action.id)) return state;
      return withHistory(state, { ...present, items: present.items.filter((i) => i.id !== action.id) }, null);
    }
    case "layer": {
      const i = present.items.findIndex((it) => it.id === action.id);
      const j = i + action.dir;
      if (i < 0 || j < 0 || j >= present.items.length) return state;
      const items = [...present.items];
      [items[i], items[j]] = [items[j], items[i]];
      return withHistory(state, { ...present, items });
    }
    case "select":
      return state.selectedId === action.id ? state : { ...state, selectedId: action.id };
    case "wrap":
      return present.wrap === action.id ? state : withHistory(state, { ...present, wrap: action.id });
    case "ribbon":
      return present.ribbon === action.id ? state : withHistory(state, { ...present, ribbon: action.id });
    case "card":
      return { ...state, present: { ...present, card: action.card } };
    case "scatter":
      return present.items.length === 0 ? state : withHistory(state, { ...present, items: scatterItems(present.items, action.rng) }, null);
    case "undo": {
      const prev = state.past[state.past.length - 1];
      if (!prev) return state;
      const stillThere = prev.items.some((i) => i.id === state.selectedId);
      return { present: prev, past: state.past.slice(0, -1), selectedId: stillThere ? state.selectedId : null };
    }
    case "reset":
      return initialState(action.arrangement);
  }
}
