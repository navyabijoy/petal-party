import { BLOOM_BY_TYPE, GREENS, RIBBONS, WRAPS } from "./catalog";
import type { BloomType } from "./blooms";
import type { GreenType } from "./catalog";

/** Logical drawing box; everything renders from this, then scales to the screen. */
export const BOX = { w: 300, h: 340 } as const;

export type Item =
  | { id: string; kind: "bloom"; type: BloomType; x: number; y: number; s: number; r: number }
  | { id: string; kind: "green"; type: GreenType; x: number; y: number; s: number; r: number };

export type Card = { to: string; msg: string; from: string };

export type Arrangement = {
  v: 1;
  /** Order in the array is z-order, back to front. */
  items: Item[];
  wrap: string;
  ribbon: string;
  card?: Card;
};

export const LIMITS = { minItems: 1, maxItems: 24, maxText: 280, maxName: 24 } as const;

export function emptyArrangement(): Arrangement {
  return { v: 1, items: [], wrap: WRAPS[0].id, ribbon: RIBBONS[0].id };
}

const isNum = (n: unknown): n is number => typeof n === "number" && Number.isFinite(n);

/** Returns a cleaned arrangement, or null if the input is not a valid one. */
export function parseArrangement(input: unknown): Arrangement | null {
  if (!input || typeof input !== "object") return null;
  const a = input as Record<string, unknown>;
  if (a.v !== 1 || !Array.isArray(a.items)) return null;
  if (a.items.length < LIMITS.minItems || a.items.length > LIMITS.maxItems) return null;

  const items: Item[] = [];
  for (const raw of a.items) {
    if (!raw || typeof raw !== "object") return null;
    const it = raw as Record<string, unknown>;
    if (typeof it.id !== "string" || it.id.length > 32) return null;
    if (!isNum(it.x) || !isNum(it.y) || !isNum(it.s) || !isNum(it.r)) return null;
    const base = {
      id: it.id,
      x: Math.min(Math.max(it.x, -20), BOX.w + 20),
      y: Math.min(Math.max(it.y, -20), BOX.h + 20),
      s: Math.min(Math.max(it.s, 24), 220),
      r: Math.min(Math.max(it.r, -360), 360),
    };
    if (it.kind === "bloom" && typeof it.type === "string" && it.type in BLOOM_BY_TYPE) {
      items.push({ ...base, kind: "bloom", type: it.type as BloomType });
    } else if (it.kind === "green" && GREENS.some((g) => g.type === it.type)) {
      items.push({ ...base, kind: "green", type: it.type as GreenType });
    } else return null;
  }

  const wrap = WRAPS.some((w) => w.id === a.wrap) ? (a.wrap as string) : WRAPS[0].id;
  const ribbon = RIBBONS.some((r) => r.id === a.ribbon) ? (a.ribbon as string) : RIBBONS[0].id;

  let card: Card | undefined;
  if (a.card && typeof a.card === "object") {
    const c = a.card as Record<string, unknown>;
    const clean = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");
    card = {
      to: clean(c.to, LIMITS.maxName),
      msg: clean(c.msg, LIMITS.maxText),
      from: clean(c.from, LIMITS.maxName),
    };
  }
  return { v: 1, items, wrap, ribbon, card };
}
