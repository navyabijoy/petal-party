"use client";

import { useNow } from "@/lib/useNow";

export const fmt = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

export function Countdown({ endsAt, warnAt = 20_000 }: { endsAt: number; warnAt?: number }) {
  const left = endsAt - useNow(250);
  return (
    <span className="tw" role="timer" style={{ fontSize: 20, fontWeight: 700, color: left <= warnAt ? "var(--stamp)" : "var(--ink)" }}>
      {fmt(left)}
    </span>
  );
}
