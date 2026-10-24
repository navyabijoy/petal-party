import { createClient } from "@supabase/supabase-js";
import { expect, it } from "vitest";
import { STARTERS } from "../lib/starters";
import { initialRoom, pickHost, rank, reduce, shouldAdvance, type RoomEvent, type RoomState } from "../lib/room/machine";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const code = "TEST" + Math.random().toString(36).slice(2, 5).toUpperCase();
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// One simulated browser tab: same protocol as lib/room/useRoom.ts, minus React.
function client(id: string, joinedAt: number) {
  const sb = createClient(url, key, { auth: { persistSession: false } });
  const ch = sb.channel(`room:${code}`, { config: { broadcast: { self: true }, presence: { key: id } } });
  const c = { id, state: initialRoom() as RoomState, present: [] as { id: string; joinedAt: number; name: string; hue: number }[], ch, sb, host: false };
  ch.on("presence", { event: "sync" }, () => {
    c.present = Object.values(ch.presenceState<(typeof c.present)[number]>()).map((m) => m[0]);
  });
  ch.on("broadcast", { event: "game" }, ({ payload }) => {
    c.state = reduce(c.state, payload as RoomEvent, Date.now());
  });
  const send = (e: RoomEvent) => ch.send({ type: "broadcast", event: "game", payload: e });
  const ready = new Promise<void>((resolve) =>
    ch.subscribe(async (s) => {
      if (s === "SUBSCRIBED") {
        await ch.track({ id, name: id, hue: 100, joinedAt });
        resolve();
      }
    }),
  );
  // Host timer, as in useRoom.
  const timer = setInterval(() => {
    if (pickHost(c.present) !== id) return;
    if (shouldAdvance(c.state, Date.now(), c.present.map((p) => p.id))) void send({ t: "advance", phase: c.state.phase, index: c.state.index });
  }, 500);
  return { c, send, ready, stop: async () => { clearInterval(timer); await sb.removeAllChannels(); } };
}

it("three clients play a whole round over real Supabase Realtime", async () => {
  const t0 = Date.now();
  const clients = [client("ann", t0), client("bo", t0 + 1), client("cy", t0 + 2)];
  await Promise.all(clients.map((x) => x.ready));
  for (let i = 0; i < 20 && !clients.every((x) => x.c.present.length === 3); i++) await sleep(500);
  expect(clients.every((x) => x.c.present.length === 3)).toBe(true);
  expect(clients.map((x) => pickHost(x.c.present))).toEqual(["ann", "ann", "ann"]);

  // Host starts the round.
  const players = clients.map((x) => ({ id: x.c.id, name: x.c.id, hue: 100 }));
  await clients[0].send({ t: "start", themeId: "first-date", participants: players, seed: 42 });
  await sleep(1000);
  expect(clients.every((x) => x.c.state.phase === "designing")).toBe(true);

  // Everyone hands in; the host should move to the runway without waiting for the timer.
  const styles = [STARTERS.romance, STARTERS.sunny, STARTERS.meadow];
  await Promise.all(clients.map((x, i) => x.send({ t: "entry", playerId: x.c.id, arrangement: styles[i] })));
  await sleep(2500);
  expect(clients.every((x) => x.c.state.phase === "runway")).toBe(true);
  const order = clients[0].c.state.order;
  expect(clients.every((x) => x.c.state.order.join() === order.join())).toBe(true);

  // Everyone votes on each entry as it comes up; "bo" gets the best ratings.
  const seen = new Set<string>();
  for (let guard = 0; guard < 60 && clients[0].c.state.phase === "runway"; guard++) {
    const s = clients[0].c.state;
    const entryId = s.order[s.index];
    if (!seen.has(entryId)) {
      seen.add(entryId);
      await Promise.all(clients.filter((x) => x.c.id !== entryId).map((x) => x.send({ t: "vote", voterId: x.c.id, entryId, stars: entryId === "bo" ? 5 : 3 })));
    }
    await sleep(500);
  }
  await sleep(1000);
  expect(clients.every((x) => x.c.state.phase === "results")).toBe(true);
  const rankings = clients.map((x) => rank(x.c.state).map((r) => r.playerId).join());
  expect(new Set(rankings).size).toBe(1);
  expect(rank(clients[0].c.state)[0].playerId).toBe("bo");

  // Host leaves: the next player takes over and can reset the room.
  await clients[0].stop();
  await sleep(3000);
  expect(pickHost(clients[1].c.present)).toBe("bo");
  await clients[1].send({ t: "reset" });
  await sleep(1000);
  expect(clients[2].c.state.phase).toBe("lobby");
  await Promise.all(clients.slice(1).map((x) => x.stop()));
});
