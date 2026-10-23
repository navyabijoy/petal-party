import type { BloomInfo, Mood } from "./catalog";

export type Theme = {
  id: string;
  name: string;
  /** What the customer says, shown on the request note. */
  request: string;
  moods: Mood[];
  colors: BloomInfo["color"][];
  budget: number;
  /** Words a fitting flower's meaning may contain. */
  meanings: string[];
};

export const THEMES: Theme[] = [
  { id: "first-date", name: "First Date", request: "Something sweet, not too much. I'm nervous!", moods: ["romantic"], colors: ["pink", "red"], budget: 40, meanings: ["love", "admiration"] },
  { id: "get-well", name: "Get Well Soon", request: "A cheerful bunch for my grandma. She loves yellow.", moods: ["cheerful"], colors: ["yellow"], budget: 40, meanings: ["happiness", "cheerfulness"] },
  { id: "garden-wedding", name: "Garden Wedding", request: "Soft and elegant, for a bride who hates fuss.", moods: ["elegant", "romantic"], colors: ["white", "pink"], budget: 70, meanings: ["marriage", "devotion"] },
  { id: "new-home", name: "New Home", request: "A friend just moved in. Make it feel like a fresh start.", moods: ["rustic", "cheerful"], colors: ["yellow", "white"], budget: 45, meanings: ["innocence", "happiness"] },
  { id: "quiet-thanks", name: "Quiet Thank You", request: "Calm colors. I want to say thank you without shouting.", moods: ["calm"], colors: ["blue", "purple", "white"], budget: 35, meanings: ["devotion", "anticipation"] },
  { id: "wild-birthday", name: "Wild Birthday", request: "She's turning 30 and hates anything boring.", moods: ["wild", "cheerful"], colors: ["pink", "orange", "yellow"], budget: 50, meanings: ["cheerfulness"] },
  { id: "anniversary", name: "Anniversary", request: "Ten years. Make it count.", moods: ["romantic", "elegant"], colors: ["red"], budget: 70, meanings: ["love", "marriage"] },
  { id: "sorry", name: "I'm Sorry", request: "I messed up. Say it gently for me.", moods: ["calm", "romantic"], colors: ["white", "purple"], budget: 40, meanings: ["innocence", "devotion"] },
  { id: "picnic", name: "Cottage Picnic", request: "A jar of flowers for the picnic blanket.", moods: ["rustic", "cheerful"], colors: ["yellow", "white", "pink"], budget: 35, meanings: ["innocence", "happiness"] },
  { id: "fairy-garden", name: "Fairy Garden", request: "Dreamy and a bit magical, please.", moods: ["calm", "wild"], colors: ["purple", "blue", "pink"], budget: 50, meanings: ["anticipation", "devotion"] },
  { id: "congrats", name: "Big News", request: "She got the job! Something proud and bright.", moods: ["cheerful", "elegant"], colors: ["yellow", "pink"], budget: 55, meanings: ["happiness", "admiration"] },
  { id: "evening", name: "Candlelit Dinner", request: "Moody and dramatic. Reds and deep colors.", moods: ["elegant", "romantic"], colors: ["red", "purple"], budget: 60, meanings: ["love"] },
];

export const themeById = (id: string | null | undefined) => THEMES.find((t) => t.id === id);

/** One theme per UTC day, so everyone in the world gets the same one. */
export function themeOfDay(date = new Date()): Theme {
  const day = Math.floor(date.getTime() / 86_400_000);
  return THEMES[day % THEMES.length];
}
