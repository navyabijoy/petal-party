/** Best solo score per theme, kept in this browser only. */
const key = (themeId: string) => `pp:best:${themeId}`;

export function getBest(themeId: string): number {
  try {
    return Number(localStorage.getItem(key(themeId))) || 0;
  } catch {
    return 0;
  }
}

/** Saves the score if it beats the old one; returns the best now on record. */
export function saveBest(themeId: string, total: number): number {
  const best = Math.max(getBest(themeId), total);
  try {
    localStorage.setItem(key(themeId), String(best));
  } catch {
    // Private mode or storage disabled: the score just isn't remembered.
  }
  return best;
}
