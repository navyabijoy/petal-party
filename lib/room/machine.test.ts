import { describe, expect, it } from "vitest";
import { DESIGN_MS, GRACE_MS, MIN_LOOK_MS, RUNWAY_MS, initialRoom, pickHost, rank, reduce, shouldAdvance, shuffled, type RoomEvent, type RoomPlayer, type RoomState } from "./machine";
import { STARTERS } from "../starters";

const P: RoomPlayer[] = [
  { id: "a", name: "Ann", hue: 10 },
  { id: "b", name: "Bo", hue: 80 },
  { id: "c", name: "Cy", hue: 200 },
];
const ids = P.map((p) => p.id);
const run = (s: RoomState, now: number, ...events: RoomEvent[]) => events.reduce((st, e) => reduce(st, e, now), s);
const started = () => run(initialRoom(), 1000, { t: "start", themeId: "first-date", participants: P, seed: 7 });
const withEntries = (s: RoomState, who = ids) =>
  who.reduce((st, id, i) => reduce(st, { t: "entry", playerId: id, arrangement: Object.values(STARTERS)[i % 3] }, 1500), s);

describe("room machine", () => {
  it("won't start with fewer than two players or an unknown theme", () => {
    const solo = reduce(initialRoom(), { t: "start", themeId: "first-date", participants: [P[0]], seed: 1 }, 0);
    expect(solo.phase).toBe("lobby");
    const bad = reduce(initialRoom(), { t: "start", themeId: "nope", participants: P, seed: 1 }, 0);
    expect(bad.phase).toBe("lobby");
  });

  it("starts a round with a design deadline on the local clock", () => {
    const s = started();
    expect(s.phase).toBe("designing");
    expect(s.endsAt).toBe(1000 + DESIGN_MS);
    expect(s.round).toBe(1);
  });

  it("accepts entries only from participants and only valid bouquets", () => {
    let s = started();
    s = reduce(s, { t: "entry", playerId: "zed", arrangement: STARTERS.sunny }, 1100);
    s = reduce(s, { t: "entry", playerId: "a", arrangement: { v: 1, items: "nope" } }, 1100);
    expect(Object.keys(s.entries)).toEqual([]);
    s = reduce(s, { t: "entry", playerId: "a", arrangement: STARTERS.sunny }, 1100);
    expect(Object.keys(s.entries)).toEqual(["a"]);
  });

  it("advances early once every present player has submitted, or after the grace period", () => {
    let s = started();
    expect(shouldAdvance(s, 2000, ids)).toBe(false);
    s = withEntries(s, ["a", "b"]);
    expect(shouldAdvance(s, 2000, ids)).toBe(false);
    expect(shouldAdvance(s, 2000, ["a", "b"])).toBe(true); // c left, so don't wait for them
    expect(shouldAdvance(s, s.endsAt + GRACE_MS - 1, ids)).toBe(false);
    expect(shouldAdvance(s, s.endsAt + GRACE_MS, ids)).toBe(true);
  });

  it("builds the same shuffled runway on every client", () => {
    const base = withEntries(started());
    const one = reduce(base, { t: "advance", phase: "designing", index: 0 }, 5000);
    const two = reduce(base, { t: "advance", phase: "designing", index: 0 }, 9000);
    expect(one.order).toEqual(two.order);
    expect([...one.order].sort()).toEqual(ids);
    expect(shuffled(ids, 7)).toEqual(shuffled(ids, 7));
  });

  it("ignores stale advance events", () => {
    const base = withEntries(started());
    const runway = reduce(base, { t: "advance", phase: "designing", index: 0 }, 5000);
    const again = reduce(runway, { t: "advance", phase: "designing", index: 0 }, 5100);
    expect(again).toBe(runway);
  });

  it("accepts votes for the current entry only, never for your own, clamped to 1..5", () => {
    const runway = reduce(withEntries(started()), { t: "advance", phase: "designing", index: 0 }, 5000);
    const owner = runway.order[0];
    const other = ids.find((i) => i !== owner)!;
    let s = reduce(runway, { t: "vote", voterId: owner, entryId: owner, stars: 5 }, 5100);
    expect(s.votes[owner]).toBeUndefined();
    s = reduce(s, { t: "vote", voterId: other, entryId: runway.order[1], stars: 5 }, 5100);
    expect(s.votes[runway.order[1]]).toBeUndefined();
    s = reduce(s, { t: "vote", voterId: other, entryId: owner, stars: 9 }, 5100);
    expect(s.votes[owner]).toBeUndefined();
    s = reduce(s, { t: "vote", voterId: other, entryId: owner, stars: 4 }, 5100);
    expect(s.votes[owner][other]).toBe(4);
  });

  it("moves on early when everyone voted, but not before a minimum look", () => {
    const runway = reduce(withEntries(started()), { t: "advance", phase: "designing", index: 0 }, 5000);
    const owner = runway.order[0];
    const voters = ids.filter((i) => i !== owner);
    const s = voters.reduce((st, v) => reduce(st, { t: "vote", voterId: v, entryId: owner, stars: 5 }, 5200), runway);
    expect(shouldAdvance(s, 5000 + MIN_LOOK_MS - 1, ids)).toBe(false);
    expect(shouldAdvance(s, 5000 + MIN_LOOK_MS, ids)).toBe(true);
    expect(shouldAdvance(runway, 5000 + RUNWAY_MS, ids)).toBe(true);
  });

  it("plays through to results and ranks by average, then by rule score", () => {
    let s = withEntries(started());
    s = reduce(s, { t: "advance", phase: "designing", index: 0 }, 5000);
    for (let i = 0; i < s.order.length; i++) {
      const owner = s.order[i];
      for (const v of ids.filter((x) => x !== owner)) {
        s = reduce(s, { t: "vote", voterId: v, entryId: owner, stars: owner === "b" ? 5 : 3 }, 6000);
      }
      s = reduce(s, { t: "advance", phase: "runway", index: i }, 7000);
    }
    expect(s.phase).toBe("results");
    const ranked = rank(s);
    expect(ranked[0].playerId).toBe("b");
    expect(ranked.map((r) => r.rank)).toEqual([1, 2, 3]);
    expect(ranked[0].avg).toBe(5);
  });

  it("goes straight to results if nobody submitted, and can reset to a fresh lobby", () => {
    let s = reduce(started(), { t: "advance", phase: "designing", index: 0 }, 9000);
    expect(s.phase).toBe("results");
    expect(rank(s)).toEqual([]);
    s = reduce(s, { t: "reset" }, 9100);
    expect(s.phase).toBe("lobby");
    expect(s.round).toBe(1);
    expect(reduce(s, { t: "start", themeId: "get-well", participants: P, seed: 3 }, 9200).round).toBe(2);
  });

  it("elects the earliest joiner as host and hands over when they leave", () => {
    const players = [{ id: "b", joinedAt: 20 }, { id: "a", joinedAt: 10 }, { id: "c", joinedAt: 30 }];
    expect(pickHost(players)).toBe("a");
    expect(pickHost(players.filter((p) => p.id !== "a"))).toBe("b");
    expect(pickHost([{ id: "y", joinedAt: 5 }, { id: "x", joinedAt: 5 }])).toBe("x");
    expect(pickHost([])).toBeNull();
  });
});
