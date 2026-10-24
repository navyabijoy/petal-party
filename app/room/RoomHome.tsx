"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PlayerGate } from "@/components/Room/PlayerGate";
import { isRoomCode, newRoomCode } from "@/lib/room/useRoom";

function Choose() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const clean = code.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 4);

  return (
    <main className="screen" style={{ alignItems: "center", textAlign: "center" }}>
      <h1 className="logo" style={{ fontSize: 48, margin: "16px 0 0" }}>Friends room</h1>
      <p className="hand" style={{ fontSize: 26, margin: 0 }}>Make a room and share the code, or join one.</p>
      <button className="btn-black" style={{ width: "100%", height: 62, fontSize: 18, marginTop: 12 }} onClick={() => router.push(`/room/${newRoomCode()}`)}>
        Create a room
      </button>
      <span className="tw" style={{ fontSize: 12, letterSpacing: 2 }}>OR</span>
      <form
        style={{ width: "100%", display: "grid", gap: 10 }}
        onSubmit={(e) => {
          e.preventDefault();
          if (isRoomCode(clean)) router.push(`/room/${clean}`);
        }}
      >
        <label className="sr-only" htmlFor="code">Room code</label>
        <input
          id="code"
          className="line-input"
          value={clean}
          onChange={(e) => setCode(e.target.value)}
          placeholder="ABCD"
          autoCapitalize="characters"
          autoComplete="off"
          style={{ textAlign: "center", fontSize: 44, letterSpacing: 10, fontFamily: "var(--font-script)" }}
        />
        <button className="btn-outline" type="submit" disabled={!isRoomCode(clean)}>Join</button>
      </form>
    </main>
  );
}

export function RoomHome() {
  return <PlayerGate>{() => <Choose />}</PlayerGate>;
}
