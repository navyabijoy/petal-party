// Friend-room game logic as a pure reducer. Every client applies the same stream of events,
// so every client ends up with the same state. Times are never sent as absolute clocks:
// each client stamps `now` when it applies an event, so clock differences between devices
// don't matter.
//
// Trust model: this is a game between friends sharing a code, not a secure system. Events are
// validated for shape, not for who sent them.

import { parseArrangement, type Arrangement } from "../arrangement";
import { scoreArrangement } from "../score";
import { themeById } from "../themes";

export const DESIGN_MS = 180_000;
export const RUNWAY_MS = 12_000;
/** Votes can't end a runway slot faster than this, so everyone gets a proper look. */
export const MIN_LOOK_MS = 4_000;
/** After the design timer ends, wait this long for last submissions to arrive. */
export const GRACE_MS = 3_000;
export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 10;

export type RoomPlayer = { id: string; name: string; hue: number };
export type Phase = "lobby" | "designing" | "runway" | "results";

export type RoomState = {
  phase: Phase;
  round: number;
  themeId: string | null;
  seed: number;
  participants: RoomPlayer[];
  entries: Record<string, Arrangement>;
  /** Player ids in runway order. */
  order: string[];
  index: number;
  /** When the current phase or runway slot began, and when it ends, on this client's clock. */
  startedAt: number;
  endsAt: number;
  /** votes[entryOwnerId][voterId] = 1..5 */
  votes: Record<string, Record<string, number>>;
};

export type RoomEvent =
  | { t: "start"; themeId: string; participants: RoomPlayer[]; seed: number }
  | { t: "entry"; playerId: string; arrangement: unknown }
  | { t: "vote"; voterId: string; entryId: string; stars: number }
  | { t: "advance"; phase: Phase; index: number }
  | { t: "reset" };

export const initialRoom = (): RoomState => ({
  phase: "lobby", round: 0, themeId: null, seed: 0, participants: [], entries: {}, order: [], index: 0, startedAt: 0, endsAt: 0, votes: {},
});

/** Small seeded PRNG so every client shuffles the runway the same way. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffled<T>(items: T[], seed: number): T[] {
  const rng = mulberry32(seed);
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function reduce(state: RoomState, event: RoomEvent, now: number): RoomState {
  switch (event.t) {
    case "start": {
      if (state.phase !== "lobby" || !themeById(event.themeId)) return state;
      const participants = event.participants.slice(0, MAX_PLAYERS);
      if (participants.length < MIN_PLAYERS) return state;
      return {
        ...initialRoom(),
        phase: "designing",
        round: state.round + 1,
        themeId: event.themeId,
        seed: event.seed,
        participants,
        startedAt: now,
        endsAt: now + DESIGN_MS,
      };
    }
    case "entry": {
      if (state.phase !== "designing") return state;
      if (!state.participants.some((p) => p.id === event.playerId)) return state;
      const arrangement = parseArrangement(event.arrangement);
      if (!arrangement) return state;
      return { ...state, entries: { ...state.entries, [event.playerId]: arrangement } };
    }
    case "vote": {
      if (state.phase !== "runway") return state;
      const entryId = state.order[state.index];
      if (event.entryId !== entryId || event.voterId === entryId) return state;
      if (!state.participants.some((p) => p.id === event.voterId)) return state;
      const stars = Math.round(event.stars);
      if (!(stars >= 1 && stars <= 5)) return state;
      return { ...state, votes: { ...state.votes, [entryId]: { ...state.votes[entryId], [event.voterId]: stars } } };
    }
    case "advance": {
      // Ignore stale or duplicate advances (the host and a new host may both send one).
      if (event.phase !== state.phase || event.index !== state.index) return state;
      if (state.phase === "designing") {
        const order = shuffled(Object.keys(state.entries).sort(), state.seed);
        if (order.length === 0) return { ...state, phase: "results", order, index: 0, startedAt: now, endsAt: now };
        return { ...state, phase: "runway", order, index: 0, startedAt: now, endsAt: now + RUNWAY_MS };
      }
      if (state.phase === "runway") {
        if (state.index + 1 < state.order.length) {
          return { ...state, index: state.index + 1, startedAt: now, endsAt: now + RUNWAY_MS };
        }
        return { ...state, phase: "results", startedAt: now, endsAt: now };
      }
      return state;
    }
    case "reset":
      return { ...initialRoom(), round: state.round };
  }
}

/** The host asks this on a timer; `presentIds` are the players currently connected. */
export function shouldAdvance(state: RoomState, now: number, presentIds: string[]): boolean {
  const present = new Set(presentIds);
  if (state.phase === "designing") {
    const here = state.participants.filter((p) => present.has(p.id));
    const allIn = here.length > 0 && here.every((p) => state.entries[p.id]);
    return allIn || now >= state.endsAt + GRACE_MS;
  }
  if (state.phase === "runway") {
    if (now >= state.endsAt) return true;
    const entryId = state.order[state.index];
    const voters = state.participants.filter((p) => present.has(p.id) && p.id !== entryId);
    const allVoted = voters.length > 0 && voters.every((p) => state.votes[entryId]?.[p.id]);
    return allVoted && now >= state.startedAt + MIN_LOOK_MS;
  }
  return false;
}

/** Earliest joiner still connected hosts the room; ties break on id so everyone agrees. */
export function pickHost(players: { id: string; joinedAt: number }[]): string | null {
  const sorted = [...players].sort((a, b) => a.joinedAt - b.joinedAt || a.id.localeCompare(b.id));
  return sorted[0]?.id ?? null;
}

export type Ranked = { playerId: string; avg: number; votes: number; score: number; rank: number };

/** Average rating wins; the rule-based score breaks ties, then the id keeps order stable. */
export function rank(state: RoomState): Ranked[] {
  const theme = themeById(state.themeId);
  const rows = Object.keys(state.entries).map((playerId) => {
    const given = Object.values(state.votes[playerId] ?? {});
    const avg = given.length ? given.reduce((s, v) => s + v, 0) / given.length : 0;
    const score = theme ? scoreArrangement(state.entries[playerId], theme).total : 0;
    return { playerId, avg, votes: given.length, score };
  });
  rows.sort((a, b) => b.avg - a.avg || b.score - a.score || a.playerId.localeCompare(b.playerId));
  return rows.map((r, i) => ({ ...r, rank: i + 1 }));
}
