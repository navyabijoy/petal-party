import { describe, expect, it } from "vitest";
import { countBlooms, initialState, reducer, scatterItems, type StudioState } from "./studioState";
import type { Item } from "./arrangement";

const bloom = (id: string, s = 80): Item => ({ id, kind: "bloom", type: "rose", x: 100, y: 100, s, r: 0 });
const run = (state: StudioState, ...actions: Parameters<typeof reducer>[1][]) => actions.reduce(reducer, state);

describe("studio reducer", () => {
  it("adds an item, selects it and can undo", () => {
    let s = run(initialState(), { t: "add", item: bloom("a") });
    expect(s.present.items).toHaveLength(1);
    expect(s.selectedId).toBe("a");
    s = run(s, { t: "undo" });
    expect(s.present.items).toHaveLength(0);
    expect(s.selectedId).toBeNull();
  });

  it("patch does not create history; checkpoint does", () => {
    let s = run(initialState(), { t: "add", item: bloom("a") });
    const before = s.past.length;
    s = run(s, { t: "patch", id: "a", patch: { x: 150 } });
    expect(s.past.length).toBe(before);
    s = run(s, { t: "checkpoint" }, { t: "patch", id: "a", patch: { x: 200 } }, { t: "undo" });
    expect(s.present.items[0].x).toBe(150);
  });

  it("clamps size and position", () => {
    const s = run(initialState(), { t: "add", item: bloom("a") }, { t: "patch", id: "a", patch: { s: 9999, x: -999 } });
    expect(s.present.items[0].s).toBe(220);
    expect(s.present.items[0].x).toBe(-20);
  });

  it("moves layers and ignores out-of-range moves", () => {
    let s = run(initialState(), { t: "add", item: bloom("a") }, { t: "add", item: bloom("b") });
    s = run(s, { t: "layer", id: "b", dir: -1 });
    expect(s.present.items.map((i) => i.id)).toEqual(["b", "a"]);
    const same = run(s, { t: "layer", id: "b", dir: -1 });
    expect(same).toBe(s);
  });

  it("removing clears the selection", () => {
    const s = run(initialState(), { t: "add", item: bloom("a") }, { t: "remove", id: "a" });
    expect(s.present.items).toHaveLength(0);
    expect(s.selectedId).toBeNull();
  });

  it("scatter keeps every item, puts the biggest bloom first in the fan", () => {
    const items = [bloom("a", 60), bloom("b", 110), bloom("c", 80), { id: "g", kind: "green", type: "fern", x: 0, y: 0, s: 90, r: 0 } as Item];
    const out = scatterItems(items, () => 0.5);
    expect(out).toHaveLength(4);
    expect(out.find((i) => i.id === "b")).toMatchObject({ x: 150, y: 120 });
    expect(countBlooms({ v: 1, items: out, wrap: "kraft", ribbon: "red" })).toBe(3);
  });
});
