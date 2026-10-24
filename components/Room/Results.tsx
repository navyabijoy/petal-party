"use client";

import { useState } from "react";
import { Avatar } from "@/components/Avatar";
import { Bouquet } from "@/components/Bouquet";
import { sendGift } from "@/lib/giftClient";
import { rank, type RoomState } from "@/lib/room/machine";
import { themeById } from "@/lib/themes";

type Props = { state: RoomState; meId: string; isHost: boolean; hostName?: string; onAgain: () => void };

export function Results({ state, meId, isHost, hostName, onAgain }: Props) {
  const ranked = rank(state);
  const theme = themeById(state.themeId);
  const nameOf = (id: string) => state.participants.find((p) => p.id === id);
  const mine = state.entries[meId];
  const myRank = ranked.find((r) => r.playerId === meId);
  const [link, setLink] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const gift = async () => {
    if (!mine) return;
    setBusy(true);
    setError("");
    try {
      setLink(`${window.location.origin}/g/${await sendGift(mine)}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't save your bouquet.");
    }
    setBusy(false);
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link:", link);
    }
  };

  return (
    <main className="screen" style={{ alignItems: "center" }}>
      <span className="stamp">{theme?.name ?? "Round over"}</span>
      <h1 className="hand" style={{ fontSize: 40, margin: 0, lineHeight: 1 }}>
        {ranked.length === 0 ? "Nobody handed anything in!" : myRank ? (myRank.rank === 1 ? "You won!" : `You placed ${myRank.rank}${["st", "nd", "rd"][myRank.rank - 1] ?? "th"}`) : "And the winners are…"}
      </h1>

      <ol style={{ listStyle: "none", margin: 0, padding: 0, width: "100%", display: "grid", gap: 10 }}>
        {ranked.map((r) => {
          const p = nameOf(r.playerId);
          return (
            <li key={r.playerId} className="note" style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: r.playerId === meId ? "#FFF6D6" : "#fff" }}>
              <span className="logo" style={{ fontSize: 34, width: 32, textAlign: "center" }}>{r.rank}</span>
              <Bouquet arrangement={state.entries[r.playerId]} width={r.rank === 1 ? 92 : 72} />
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {p && <Avatar hue={p.hue} size={24} />}
                  <span className="hand" style={{ fontSize: 26, lineHeight: 1 }}>{p?.name ?? "Someone"}</span>
                </span>
                <span className="tw" style={{ fontSize: 12, fontWeight: 700 }}>
                  {r.votes ? `${r.avg.toFixed(1)} / 5 · ${r.votes} vote${r.votes === 1 ? "" : "s"}` : "no votes"}
                </span>
              </span>
            </li>
          );
        })}
      </ol>

      <div style={{ flex: 1 }} />
      {mine && !link && (
        <button className="btn-outline" onClick={gift} disabled={busy} style={{ width: "100%" }}>{busy ? "Saving…" : "Send my bouquet as a gift"}</button>
      )}
      {link && (
        <div style={{ width: "100%", display: "grid", gap: 6, textAlign: "center" }}>
          <span className="tw" style={{ fontSize: 12, overflowWrap: "anywhere" }}>{link}</span>
          <button className="btn-black" onClick={copy}>{copied ? "Copied!" : "Copy gift link"}</button>
        </div>
      )}
      {error && <p className="tw" role="alert" style={{ color: "var(--stamp)", fontWeight: 700, margin: 0 }}>{error}</p>}
      {isHost ? (
        <button className="btn-black" onClick={onAgain} style={{ width: "100%", height: 56 }}>Play again</button>
      ) : (
        <p className="hand" style={{ fontSize: 26, margin: 0 }}>Waiting for {hostName ?? "the host"} to start another round…</p>
      )}
    </main>
  );
}
