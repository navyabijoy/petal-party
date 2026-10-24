"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bouquet } from "@/components/Bouquet";
import { Studio } from "@/components/Studio/Studio";
import type { Arrangement } from "@/lib/arrangement";
import type { RoomState } from "@/lib/room/machine";
import { themeById } from "@/lib/themes";
import { Countdown } from "./Countdown";

type Props = { state: RoomState; meId: string; onSubmit: (a: Arrangement) => void };

export function Designing({ state, meId, onSubmit }: Props) {
  const theme = themeById(state.themeId);
  const latest = useRef<Arrangement | null>(null);
  const [mine, setMine] = useState<Arrangement | null>(null);
  const isPlayer = state.participants.some((p) => p.id === meId);
  const submitted = Boolean(state.entries[meId]) || mine !== null;

  const track = useCallback((a: Arrangement) => {
    latest.current = a;
  }, []);

  const submit = useCallback(
    (a: Arrangement) => {
      setMine(a);
      onSubmit(a);
    },
    [onSubmit],
  );

  // When the clock runs out, hand in whatever is on the table (if there is anything).
  useEffect(() => {
    if (!isPlayer || submitted) return;
    const t = setTimeout(() => {
      const a = latest.current;
      if (a && a.items.length > 0) submit(a);
    }, Math.max(0, state.endsAt - Date.now()));
    return () => clearTimeout(t);
  }, [isPlayer, submitted, state.endsAt, submit]);

  if (!isPlayer) {
    return (
      <main className="screen" style={{ alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        <p className="hand" style={{ fontSize: 30, margin: 0 }}>A round is in progress. You&apos;ll join the next one!</p>
        <Countdown endsAt={state.endsAt} />
      </main>
    );
  }

  if (submitted) {
    const done = state.participants.filter((p) => state.entries[p.id]).length;
    return (
      <main className="screen" style={{ alignItems: "center", textAlign: "center" }}>
        <span className="stamp">{theme?.name}</span>
        {mine && <Bouquet arrangement={mine} width={240} />}
        <p className="hand" style={{ fontSize: 30, margin: 0 }}>Handed in! Waiting for the others…</p>
        <p className="tw" style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>{done} / {state.participants.length} in · <Countdown endsAt={state.endsAt} /></p>
      </main>
    );
  }

  return (
    <>
      {theme && (
        <div style={{ maxWidth: 440, margin: "0 auto", padding: "16px 16px 0" }}>
          <div className="note" style={{ transform: "rotate(-1.5deg)", margin: "4px 4px 0" }}>
            <span className="tape" />
            <span className="tw" style={{ display: "block", fontSize: 10, fontWeight: 700, letterSpacing: 1.5 }}>THEME · EVERYONE GETS THE SAME</span>
            <span className="hand" style={{ display: "block", fontSize: 26, lineHeight: 1.05 }}>{theme.name}: &ldquo;{theme.request}&rdquo;</span>
          </div>
        </div>
      )}
      <Studio label={theme?.name} timer={<Countdown endsAt={state.endsAt} />} minBlooms={3} maxBlooms={10} doneLabel="Hand in" onChange={track} onDone={submit} />
    </>
  );
}
