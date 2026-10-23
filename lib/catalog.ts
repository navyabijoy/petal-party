import type { BloomType } from "./blooms";

export type Mood = "romantic" | "cheerful" | "calm" | "elegant" | "wild" | "rustic";

export type BloomInfo = {
  type: BloomType;
  name: string;
  moods: Mood[];
  /** Dominant color family, used by scoring. */
  color: "red" | "pink" | "yellow" | "orange" | "purple" | "blue" | "white";
  size: "L" | "M" | "S";
  meaning: string;
  locked?: boolean;
};

export const BLOOMS: BloomInfo[] = [
  { type: "rose", name: "Rose", moods: ["romantic", "elegant"], color: "red", size: "L", meaning: "love" },
  { type: "peony", name: "Peony", moods: ["romantic", "elegant"], color: "pink", size: "L", meaning: "a happy marriage" },
  { type: "carnation", name: "Carnation", moods: ["romantic", "rustic"], color: "pink", size: "M", meaning: "admiration" },
  { type: "daisy", name: "Daisy", moods: ["cheerful", "rustic", "calm"], color: "white", size: "S", meaning: "innocence" },
  { type: "sunflower", name: "Sunflower", moods: ["cheerful", "rustic"], color: "yellow", size: "L", meaning: "happiness" },
  { type: "gerbera", name: "Gerbera", moods: ["cheerful", "wild"], color: "pink", size: "M", meaning: "cheerfulness" },
  { type: "anemone", name: "Anemone", moods: ["calm", "elegant", "wild"], color: "blue", size: "M", meaning: "anticipation" },
  { type: "lily", name: "Lily", moods: ["calm", "elegant"], color: "purple", size: "L", meaning: "devotion", locked: true },
];

export const BLOOM_BY_TYPE = Object.fromEntries(BLOOMS.map((b) => [b.type, b])) as Record<BloomType, BloomInfo>;

export type GreenType = "fern" | "eucalyptus" | "grass" | "ivy";
export const GREENS: { type: GreenType; name: string }[] = [
  { type: "fern", name: "Fern" },
  { type: "eucalyptus", name: "Eucalyptus" },
  { type: "grass", name: "Grass" },
  { type: "ivy", name: "Ivy" },
];

export type Swatch = { id: string; name: string; color: string };
export const WRAPS: Swatch[] = [
  { id: "kraft", name: "Kraft", color: "#E8C08E" },
  { id: "blush", name: "Blush", color: "#F7D9DE" },
  { id: "lilac", name: "Lilac", color: "#E3DBF5" },
  { id: "mint", name: "Mint", color: "#CDEBD8" },
  { id: "newsprint", name: "Newsprint", color: "#EDEBE4" },
];
export const RIBBONS: Swatch[] = [
  { id: "red", name: "Red", color: "#C8312F" },
  { id: "twine", name: "Twine", color: "#B98C58" },
  { id: "lace", name: "Lace", color: "#FFFFFF" },
  { id: "plum", name: "Plum", color: "#6A4C93" },
  { id: "gold", name: "Gold", color: "#E0A82E" },
];
