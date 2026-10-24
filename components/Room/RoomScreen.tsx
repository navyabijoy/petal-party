"use client";

import Link from "next/link";
import type { Player } from "@/lib/player";
import { useRoom } from "@/lib/room/useRoom";
import { Designing } from "./Designing";
import { Lobby } from "./Lobby";
import { Results } from "./Results";
import { Runway } from "./Runway";

export function RoomScreen({ code, me }: { code: string; me: Player }) {
  const room = useRoom(code, me);
  const { state } = room;

  if (room.status === "error") {
    return (
      <main className="screen" style={{ alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        <h1 className="logo" style={{ fontSize: 44, margin: 0 }}>No connection</h1>
        <p className="hand" style={{ fontSize: 28, margin: 0 }}>We couldn&apos;t reach the room. Check your internet and try again.</p>
        <button className="btn-black" onClick={() => window.location.reload()}>Retry</button>
        <Link href="/" className="tw" style={{ fontSize: 12, fontWeight: 700 }}>HOME</Link>
      </main>
    );
  }
  if (room.status === "connecting") {
    return (
      <main className="screen" aria-busy="true" style={{ alignItems: "center", justifyContent: "center" }}>
        <p className="hand" style={{ fontSize: 30, margin: 0 }}>Joining room {code}…</p>
      </main>
    );
  }

  const hostName = room.players.find((p) => p.id === room.hostId)?.name;
  switch (state.phase) {
    case "lobby":
      return <Lobby code={code} me={me} players={room.players} hostId={room.hostId} isHost={room.isHost} full={room.full} onStart={room.start} />;
    case "designing":
      // Keyed by round so a new round starts with a fresh studio.
      return <Designing key={state.round} state={state} meId={me.id} onSubmit={room.submit} />;
    case "runway":
      return <Runway state={state} meId={me.id} onVote={room.vote} />;
    case "results":
      return <Results key={state.round} state={state} meId={me.id} isHost={room.isHost} hostName={hostName} onAgain={room.reset} />;
  }
}
