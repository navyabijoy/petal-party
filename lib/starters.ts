import type { Arrangement } from "./arrangement";

let n = 0;
const id = () => `s${++n}`;

/** Starter bouquets for the home page, gallery and empty states. */
export const STARTERS: Record<"sunny" | "romance" | "meadow", Arrangement> = {
  sunny: {
    v: 1, wrap: "kraft", ribbon: "twine",
    items: [
      { id: id(), kind: "bloom", type: "daisy", x: 82, y: 112, s: 60, r: 0 },
      { id: id(), kind: "bloom", type: "daisy", x: 138, y: 104, s: 56, r: 12 },
      { id: id(), kind: "bloom", type: "sunflower", x: 190, y: 122, s: 118, r: 8 },
      { id: id(), kind: "bloom", type: "sunflower", x: 132, y: 184, s: 122, r: -6 },
      { id: id(), kind: "bloom", type: "daisy", x: 76, y: 210, s: 58, r: -10 },
      { id: id(), kind: "bloom", type: "daisy", x: 226, y: 214, s: 56, r: 6 },
    ],
  },
  romance: {
    v: 1, wrap: "blush", ribbon: "red",
    items: [
      { id: id(), kind: "bloom", type: "daisy", x: 72, y: 120, s: 56, r: 0 },
      { id: id(), kind: "bloom", type: "rose", x: 150, y: 112, s: 100, r: 0 },
      { id: id(), kind: "bloom", type: "daisy", x: 232, y: 112, s: 54, r: 10 },
      { id: id(), kind: "bloom", type: "peony", x: 92, y: 182, s: 100, r: -8 },
      { id: id(), kind: "bloom", type: "carnation", x: 210, y: 180, s: 86, r: 6 },
      { id: id(), kind: "bloom", type: "rose", x: 150, y: 236, s: 80, r: 14 },
    ],
  },
  meadow: {
    v: 1, wrap: "lilac", ribbon: "plum",
    items: [
      { id: id(), kind: "bloom", type: "carnation", x: 84, y: 116, s: 62, r: 0 },
      { id: id(), kind: "bloom", type: "lily", x: 154, y: 112, s: 112, r: 6 },
      { id: id(), kind: "bloom", type: "daisy", x: 232, y: 120, s: 56, r: 0 },
      { id: id(), kind: "bloom", type: "anemone", x: 98, y: 190, s: 92, r: -6 },
      { id: id(), kind: "bloom", type: "gerbera", x: 210, y: 190, s: 90, r: 8 },
    ],
  },
};
