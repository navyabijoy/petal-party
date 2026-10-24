"use client";

import { useSyncExternalStore } from "react";

/** Current time in ms, re-rendering every `ms`. Rounded so the snapshot is stable between ticks. */
export function useNow(ms = 250): number {
  return useSyncExternalStore(
    (cb) => {
      const t = setInterval(cb, ms);
      return () => clearInterval(t);
    },
    () => Math.floor(Date.now() / ms) * ms,
    () => 0,
  );
}
