"use client";

import { Bloom } from "@/components/Bloom";
import { Bouquet } from "@/components/Bouquet";
import type { RoomState } from "@/lib/room/machine";
import { RUNWAY_MS } from "@/lib/room/machine";
import { useNow } from "@/lib/useNow";
import { Countdown } from "./Countdown";

type Props = { state: RoomState; meId: string; onVote: (entryId: string, stars: number) => void };

const WORDS = ["tap a flower to rate", "not my style", "sweet", "nice!", "lovely!", "I want this one!"];

export function Runway({ state, meId, onVote }: Props) {
  const entryId = state.order[state.index];
  const entry = state.entries[entryId];
  const owner = state.participants.find((p) => p.id === entryId);
  const mine = entryId === meId;
  const isPlayer = state.participants.some((p) => p.id === meId);
  const myVote = state.votes[entryId]?.[meId] ?? 0;
  const voted = Object.keys(state.votes[entryId] ?? {}).length;
  const pct = Math.min(100, Math.max(0, ((useNow(250) - state.startedAt) / RUNWAY_MS) * 100));
  if (!entry) return null;

  return (
    <main className="screen" style={{ alignItems: "center", textAlign: "center" }}>
      <div className="tw" style={{ width: "100%", display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
        <span style={{ letterSpacing: 2, fontSize: 15 }}>RUNWAY {state.index + 1} / {state.order.length}</span>
        <Countdown endsAt={state.endsAt} warnAt={3000} />
      </div>
      <div aria-hidden="true" style={{ width: "100%", height: 3, background: "rgba(27,27,27,.15)" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: "var(--ink)" }} />
      </div>

      <span className="tw" style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, marginTop: 4 }}>
        BY {owner?.name?.toUpperCase() ?? "SOMEONE"}{mine ? " (YOU)" : ""}
      </span>
      <div style={{ position: "relative", width: "100%", display: "flex", justifyContent: "center" }}>
        <Bouquet arrangement={entry} width={290} />
      </div>
      {entry.card && (entry.card.msg || entry.card.to) && (
        <div className="note" style={{ width: "88%", textAlign: "left", transform: "rotate(-2deg)", marginTop: -24 }}>
          <span className="hand" style={{ fontSize: 24, lineHeight: 1.1, overflowWrap: "anywhere" }}>
            {entry.card.to ? `Dear ${entry.card.to}, ` : ""}{entry.card.msg}
          </span>
        </div>
      )}

      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        {mine ? (
          <p className="hand" style={{ fontSize: 30, margin: 0 }}>This one&apos;s yours! {voted} voted so far.</p>
        ) : isPlayer ? (
          <>
            <span className="tw" style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2 }}>HOW DOES IT MAKE YOU FEEL?</span>
            <div role="group" aria-label="Rate this bouquet" style={{ display: "flex", gap: 4 }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} aria-label={`Rate ${n} of 5`} aria-pressed={n <= myVote} onClick={() => onVote(entryId, n)} style={{ background: "none", border: 0, padding: 0, cursor: "pointer" }}>
                  <Bloom type="gerbera" size={56} faded={n > myVote} label="" />
                </button>
              ))}
            </div>
            <span className="hand" style={{ fontSize: 32, fontWeight: 700, lineHeight: 1 }} aria-live="polite">{WORDS[myVote]}</span>
          </>
        ) : (
          <p className="hand" style={{ fontSize: 28, margin: 0 }}>Watching this round.</p>
        )}
      </div>
    </main>
  );
}
