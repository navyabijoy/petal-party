"use client";

import { useState } from "react";
import { Avatar } from "@/components/Avatar";
import { MAX_PLAYERS, MIN_PLAYERS } from "@/lib/room/machine";
import type { Player } from "@/lib/player";

type Props = {
  code: string;
  me: Player;
  players: { id: string; name: string; hue: number }[];
  hostId: string | null;
  isHost: boolean;
  full: boolean;
  onStart: () => void;
};

export function Lobby({ code, me, players, hostId, isHost, full, onStart }: Props) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    const url = `${window.location.origin}/room/${code}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link:", url);
    }
  };
  const host = players.find((p) => p.id === hostId);
  const enough = players.length >= MIN_PLAYERS;

  return (
    <main className="screen" style={{ alignItems: "center" }}>
      <span className="tw" style={{ fontSize: 12, letterSpacing: 3, fontWeight: 700 }}>ROOM CODE</span>
      <h1 className="logo" style={{ fontSize: 84, margin: 0, lineHeight: 1, letterSpacing: 6 }}>{code}</h1>
      <button className="btn-outline" onClick={copy} style={{ fontSize: 13 }}>{copied ? "Link copied!" : "Copy invite link"}</button>

      <div className="note" style={{ width: "100%", marginTop: 12 }}>
        <span className="tape" />
        <span className="tw" style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5 }}>
          PLAYERS · {players.length} / {MAX_PLAYERS}
        </span>
        <ul style={{ listStyle: "none", margin: "8px 0 0", padding: 0, display: "grid", gap: 8 }}>
          {players.map((p) => (
            <li key={p.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Avatar hue={p.hue} />
              <span className="hand" style={{ fontSize: 26, flex: 1 }}>{p.name}{p.id === me.id ? " (you)" : ""}</span>
              {p.id === hostId && <span className="stamp" style={{ fontSize: 10 }}>host</span>}
            </li>
          ))}
        </ul>
      </div>

      <div style={{ flex: 1 }} />
      {full ? (
        <p className="tw" role="status" style={{ fontWeight: 700, color: "var(--stamp)" }}>This room is full ({MAX_PLAYERS} players).</p>
      ) : isHost ? (
        <>
          <button className="btn-black" onClick={onStart} disabled={!enough} style={{ width: "100%", height: 62, fontSize: 20 }}>Start round</button>
          {!enough && <p className="tw" style={{ fontSize: 12, margin: 0 }}>Waiting for at least one more player…</p>}
        </>
      ) : (
        <p className="hand" style={{ fontSize: 28, margin: 0 }}>Waiting for {host?.name ?? "the host"} to start…</p>
      )}
      <p className="tw" style={{ fontSize: 11, margin: 0, opacity: 0.7 }}>Everyone gets 3 minutes to arrange a bouquet, then you all vote.</p>
    </main>
  );
}
