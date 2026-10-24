"use client";

import { PlayerGate } from "@/components/Room/PlayerGate";
import { RoomScreen } from "@/components/Room/RoomScreen";

export function RoomEntry({ code }: { code: string }) {
  return <PlayerGate>{(me) => <RoomScreen code={code} me={me} />}</PlayerGate>;
}
