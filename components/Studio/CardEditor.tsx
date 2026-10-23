"use client";

import type { Card } from "@/lib/arrangement";
import { LIMITS } from "@/lib/arrangement";

type Props = { card: Card; onChange: (card: Card) => void };

export function CardEditor({ card, onChange }: Props) {
  const set = (k: keyof Card) => (v: string) => onChange({ ...card, [k]: v });
  return (
    <div className="note" style={{ display: "flex", flexDirection: "column", gap: 8, transform: "rotate(-1.5deg)" }}>
      <span className="tape" />
      <label style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <span className="hand" style={{ fontSize: 24 }}>Dear</span>
        <input className="line-input" value={card.to} maxLength={LIMITS.maxName} onChange={(e) => set("to")(e.target.value)} aria-label="Who is it for" placeholder="someone" />
      </label>
      <label>
        <span className="sr-only">Your message</span>
        <textarea
          className="line-input"
          rows={3}
          value={card.msg}
          maxLength={LIMITS.maxText}
          onChange={(e) => set("msg")(e.target.value)}
          placeholder="write a few words…"
          style={{ resize: "none", lineHeight: 1.15 }}
        />
      </label>
      <label style={{ display: "flex", alignItems: "baseline", gap: 6, alignSelf: "flex-end" }}>
        <span className="hand" style={{ fontSize: 24 }}>love,</span>
        <input className="line-input" value={card.from} maxLength={LIMITS.maxName} onChange={(e) => set("from")(e.target.value)} aria-label="Your name" placeholder="you" style={{ width: 130 }} />
      </label>
    </div>
  );
}
