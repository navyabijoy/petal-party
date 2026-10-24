"use client";

import type { RealtimeChannel } from "@supabase/supabase-js";
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import type { Arrangement } from "../arrangement";
import type { Player } from "../player";
import { getSupabase } from "../supabase";
import { THEMES } from "../themes";
import { MAX_PLAYERS, initialRoom, pickHost, reduce, shouldAdvance, type RoomEvent, type RoomPlayer, type RoomState } from "./machine";

type Present = RoomPlayer & { joinedAt: number };
export type Status = "connecting" | "live" | "error";

export const ROOM_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ";
export const newRoomCode = () => Array.from({ length: 4 }, () => ROOM_CODE_ALPHABET[Math.floor(Math.random() * ROOM_CODE_ALPHABET.length)]).join("");
export const isRoomCode = (s: string) => /^[A-Z]{4}$/.test(s);

type Action = { event: RoomEvent; now: number };

export function useRoom(code: string, me: Player) {
  const [state, apply] = useReducer((s: RoomState, a: Action) => reduce(s, a.event, a.now), undefined, initialRoom);
  const [present, setPresent] = useState<Present[]>([]);
  const [status, setStatus] = useState<Status>("connecting");
  const channel = useRef<RealtimeChannel | null>(null);
  const [joinedAt] = useState(() => Date.now());

  // Latest values for the host timer, which must not restart on every update.
  const latest = useRef({ state, present });
  useEffect(() => {
    latest.current = { state, present };
  });

  useEffect(() => {
    const supabase = getSupabase();
    const ch = supabase.channel(`room:${code}`, { config: { broadcast: { self: true }, presence: { key: me.id } } });
    channel.current = ch;

    ch.on("presence", { event: "sync" }, () => {
      const list: Present[] = [];
      for (const metas of Object.values(ch.presenceState<Present>())) {
        const m = metas[0];
        if (m && typeof m.id === "string") list.push({ id: m.id, name: String(m.name).slice(0, 20), hue: Number(m.hue) || 0, joinedAt: Number(m.joinedAt) || 0 });
      }
      setPresent(list);
    });
    ch.on("broadcast", { event: "game" }, ({ payload }) => apply({ event: payload as RoomEvent, now: Date.now() }));
    ch.subscribe((s) => {
      if (s === "SUBSCRIBED") {
        setStatus("live");
        void ch.track({ id: me.id, name: me.name, hue: me.hue, joinedAt });
      } else if (s === "CHANNEL_ERROR" || s === "TIMED_OUT") {
        setStatus("error");
      }
    });

    return () => {
      channel.current = null;
      void supabase.removeChannel(ch);
    };
  }, [code, me.id, me.name, me.hue, joinedAt]);

  const send = useCallback((event: RoomEvent) => {
    void channel.current?.send({ type: "broadcast", event: "game", payload: event });
  }, []);

  const hostId = useMemo(() => pickHost(present), [present]);
  const isHost = hostId === me.id;

  // Only the host drives the clock. If the host leaves, the next player's timer takes over.
  useEffect(() => {
    if (!isHost || status !== "live") return;
    const t = setInterval(() => {
      const { state: s, present: p } = latest.current;
      if (shouldAdvance(s, Date.now(), p.map((x) => x.id))) send({ t: "advance", phase: s.phase, index: s.index });
    }, 500);
    return () => clearInterval(t);
  }, [isHost, status, send]);

  const ordered = useMemo(() => [...present].sort((a, b) => a.joinedAt - b.joinedAt || a.id.localeCompare(b.id)), [present]);
  const full = ordered.findIndex((p) => p.id === me.id) >= MAX_PLAYERS;

  return {
    state,
    status,
    players: ordered,
    hostId,
    isHost,
    full,
    start: () =>
      send({
        t: "start",
        themeId: THEMES[Math.floor(Math.random() * THEMES.length)].id,
        participants: ordered.slice(0, MAX_PLAYERS).map(({ id, name, hue }) => ({ id, name, hue })),
        seed: Math.floor(Math.random() * 2 ** 31),
      }),
    reset: () => send({ t: "reset" }),
    submit: (arrangement: Arrangement) => send({ t: "entry", playerId: me.id, arrangement }),
    vote: (entryId: string, stars: number) => send({ t: "vote", voterId: me.id, entryId, stars }),
  };
}
