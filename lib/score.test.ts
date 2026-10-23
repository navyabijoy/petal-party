import { describe, expect, it } from "vitest";
import { scoreArrangement } from "./score";
import { themeById } from "./themes";
import { STARTERS } from "./starters";
import { emptyArrangement, type Arrangement, type Item } from "./arrangement";

const get = (id: string) => themeById(id)!;
const bloom = (type: string, x: number, y: number, id: string): Item => ({ id, kind: "bloom", type: type as never, x, y, s: 80, r: 0 });

describe("scoreArrangement", () => {
  it("scores an empty vase as one star with a prompt", () => {
    const s = scoreArrangement(emptyArrangement(), get("first-date"));
    expect(s.total).toBe(0);
    expect(s.stars).toBe(1);
    expect(s.hints[0]).toMatch(/empty/);
  });

  it("likes the romantic starter for a romantic theme more than the sunny one", () => {
    const romance = scoreArrangement(STARTERS.romance, get("first-date"));
    const sunny = scoreArrangement(STARTERS.sunny, get("first-date"));
    expect(romance.total).toBeGreaterThan(sunny.total);
  });

  it("likes the sunny starter for a yellow, cheerful request", () => {
    const sunny = scoreArrangement(STARTERS.sunny, get("get-well"));
    expect(sunny.parts.mood).toBeGreaterThan(20);
    expect(sunny.parts.meaning).toBe(10);
    expect(sunny.stars).toBeGreaterThanOrEqual(4);
  });

  it("penalises going over budget", () => {
    const cheap: Arrangement = { ...emptyArrangement(), items: [bloom("rose", 150, 100, "a"), bloom("peony", 100, 160, "b")] };
    const pricey: Arrangement = {
      ...emptyArrangement(),
      items: Array.from({ length: 10 }, (_, i) => bloom("rose", 100 + i * 10, 100 + (i % 3) * 30, `r${i}`)),
    };
    const theme = get("quiet-thanks"); // budget 35
    expect(scoreArrangement(cheap, theme).parts.budget).toBe(15);
    expect(scoreArrangement(pricey, theme).parts.budget).toBeLessThan(5);
    expect(scoreArrangement(pricey, theme).hints.join(" ")).toMatch(/budget/);
  });

  it("keeps every part inside its maximum", () => {
    for (const theme of ["first-date", "get-well", "evening"].map(get)) {
      for (const a of Object.values(STARTERS)) {
        const { parts, total } = scoreArrangement(a, theme);
        expect(parts.mood).toBeLessThanOrEqual(30);
        expect(parts.color).toBeLessThanOrEqual(20);
        expect(parts.budget).toBeLessThanOrEqual(15);
        expect(parts.composition).toBeLessThanOrEqual(25);
        expect(total).toBeLessThanOrEqual(100);
      }
    }
  });
});
