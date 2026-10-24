"use client";

import { useState, type ReactNode } from "react";
import { savePlayer, usePlayer, type Player } from "@/lib/player";

/** Asks for a nickname the first time, then renders children with the saved player. */
export function PlayerGate({ children }: { children: (player: Player) => ReactNode }) {
  const player = usePlayer();
  const [name, setName] = useState("");
  if (player) return <>{children(player)}</>;
  return (
    <main className="screen" style={{ alignItems: "center", justifyContent: "center", textAlign: "center" }}>
      <h1 className="logo" style={{ fontSize: 48, margin: 0 }}>Petal Party</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          savePlayer(name);
        }}
        className="note"
        style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10, transform: "rotate(-1deg)", textAlign: "left" }}
      >
        <span className="tape" />
        <label className="hand" style={{ fontSize: 26 }}>
          What should we call you?
          <input className="line-input" value={name} maxLength={20} onChange={(e) => setName(e.target.value)} placeholder="a nickname (or we pick one)" autoFocus />
        </label>
        <button className="btn-black" type="submit">Let&apos;s go</button>
      </form>
    </main>
  );
}
