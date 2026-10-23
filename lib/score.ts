import type { Arrangement, Item } from "./arrangement";
import { BLOOM_BY_TYPE, BLOOM_PRICE, GREEN_PRICE } from "./catalog";
import type { Theme } from "./themes";

export type Parts = { mood: number; color: number; budget: number; composition: number; meaning: number };
export type Score = { total: number; stars: 1 | 2 | 3 | 4 | 5; parts: Parts; cost: number; hints: string[] };

export const MAX: Parts = { mood: 30, color: 20, budget: 15, composition: 25, meaning: 10 };

const blooms = (a: Arrangement) =>
  a.items.filter((i): i is Extract<Item, { kind: "bloom" }> => i.kind === "bloom").map((i) => ({ item: i, info: BLOOM_BY_TYPE[i.type] }));

export function costOf(a: Arrangement): number {
  return a.items.reduce((sum, i) => sum + (i.kind === "bloom" ? BLOOM_PRICE[BLOOM_BY_TYPE[i.type].size] : GREEN_PRICE), 0);
}

const starsFor = (total: number): Score["stars"] => (total >= 88 ? 5 : total >= 72 ? 4 : total >= 55 ? 3 : total >= 38 ? 2 : 1);

export function scoreArrangement(a: Arrangement, theme: Theme): Score {
  const bs = blooms(a);
  const n = bs.length;
  const cost = costOf(a);

  // Mood: how many blooms carry a wanted mood.
  const moodHits = bs.filter(({ info }) => info.moods.some((m) => theme.moods.includes(m))).length;
  const mood = n ? MAX.mood * (moodHits / n) : 0;

  // Color: wanted colors present (12) plus a calm palette (8).
  const present = new Set(bs.map(({ info }) => info.color));
  const wanted = theme.colors.filter((c) => present.has(c)).length;
  const wantedShare = theme.colors.length ? Math.min(1, wanted / Math.min(2, theme.colors.length)) : 1;
  const palette = present.size <= 3 ? 8 : present.size === 4 ? 5 : 2;
  const color = n ? 12 * wantedShare + palette : 0;

  // Budget: full marks at or under, then a steady drop.
  const over = Math.max(0, cost - theme.budget);
  const budget = n ? MAX.budget * Math.max(0, 1 - over / theme.budget) : 0;

  // Composition: count, size mix, balance, height variation.
  const countPts = n >= 5 && n <= 10 ? 8 : n === 0 ? 0 : Math.max(0, 8 - Math.min(Math.abs(n - 5), Math.abs(n - 10)) * 2);
  const sizes = new Set(bs.map(({ info }) => info.size));
  const hasGreens = a.items.some((i) => i.kind === "green");
  const mixPts = (sizes.has("L") ? 3 : 0) + (sizes.has("S") || sizes.has("M") ? 2 : 0) + (hasGreens ? 1 : 0);
  const xs = a.items.map((i) => i.x);
  const ys = a.items.map((i) => i.y);
  const meanX = xs.length ? xs.reduce((s, v) => s + v, 0) / xs.length : 150;
  const balancePts = Math.max(0, 6 - Math.abs(meanX - 150) / 10);
  const meanY = ys.length ? ys.reduce((s, v) => s + v, 0) / ys.length : 0;
  const sd = ys.length ? Math.sqrt(ys.reduce((s, v) => s + (v - meanY) ** 2, 0) / ys.length) : 0;
  const heightPts = Math.min(5, (sd / 22) * 5);
  const composition = n ? countPts + mixPts + balancePts + heightPts : 0;

  // Meaning bonus.
  const meaning = bs.some(({ info }) => theme.meanings.some((w) => info.meaning.includes(w))) ? MAX.meaning : 0;

  const parts: Parts = { mood, color, budget, composition, meaning };
  const total = Math.round(mood + color + budget + composition + meaning);

  return { total, stars: starsFor(total), parts, cost, hints: hintsFor(parts, { n, cost, theme, present, hasGreens }) };
}

function hintsFor(parts: Parts, ctx: { n: number; cost: number; theme: Theme; present: Set<string>; hasGreens: boolean }): string[] {
  const { n, cost, theme, present, hasGreens } = ctx;
  if (n === 0) return ["The vase is empty! Add a few blooms."];
  // Each entry: how far from full marks, and what to say.
  const gaps: [number, string][] = [
    [(MAX.mood - parts.mood) / MAX.mood, `It doesn't feel very ${theme.moods[0]} yet.`],
    [(12 - Math.min(12, parts.color)) / 12 + (present.size > 3 ? 0.4 : 0), present.size > 3 ? "That's a lot of colors. Pick a few and stick with them." : `I was hoping for some ${theme.colors[0]}.`],
    [cost > theme.budget ? (cost - theme.budget) / theme.budget + 0.3 : 0, `That's over my budget of ${theme.budget} coins.`],
    [n < 5 ? 0.6 : n > 10 ? 0.5 : 0, n < 5 ? "It looks a little bare." : "It's getting crowded in there."],
    [hasGreens ? 0 : 0.35, "Some greenery would tie it together."],
    [parts.meaning === 0 ? 0.3 : 0, `A flower that means ${theme.meanings[0]} would be a lovely touch.`],
  ];
  const worst = gaps.filter(([g]) => g > 0.15).sort((a, b) => b[0] - a[0]).slice(0, 2).map(([, t]) => t);
  return worst.length ? worst : ["It's perfect. I'll take it!"];
}
