"use client";

import { useMemo, useSyncExternalStore } from "react";

export type Player = { id: string; name: string; hue: number };

const KEY = "pp:player";
const listeners = new Set<() => void>();

const ADJECTIVES = ["Sunny", "Quiet", "Wild", "Dreamy", "Merry", "Gentle", "Bright", "Cosy"];
const FLOWERS = ["Daisy", "Poppy", "Lily", "Clover", "Peony", "Tulip", "Iris", "Aster"];

export const suggestName = () =>
  `${ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]} ${FLOWERS[Math.floor(Math.random() * FLOWERS.length)]}`;

function read(): string {
  try {
    return localStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

/** Saves the nickname, keeping the same id and colour if this browser already has one. */
export function savePlayer(name: string): Player {
  let existing: Player | null = null;
  try {
    existing = JSON.parse(read()) as Player;
  } catch {
    existing = null;
  }
  const player: Player = {
    id: existing?.id ?? crypto.randomUUID().slice(0, 12),
    hue: existing?.hue ?? Math.floor(Math.random() * 360),
    name: name.trim().slice(0, 20) || suggestName(),
  };
  try {
    localStorage.setItem(KEY, JSON.stringify(player));
  } catch {
    // Storage blocked: the player still works for this page load.
  }
  listeners.forEach((l) => l());
  return player;
}

/** The saved player, or null on the server and for first-time visitors. */
export function usePlayer(): Player | null {
  const raw = useSyncExternalStore(subscribe, read, () => "");
  return useMemo(() => {
    if (!raw) return null;
    try {
      const p = JSON.parse(raw) as Player;
      return p && typeof p.id === "string" && typeof p.name === "string" ? p : null;
    } catch {
      return null;
    }
  }, [raw]);
}
