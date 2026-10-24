// Two clients join one channel: checks presence sync and broadcast (including self) work with the anon key.
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const code = "SMOKE" + Math.random().toString(36).slice(2, 6).toUpperCase();

function join(id) {
  const sb = createClient(url, key, { auth: { persistSession: false } });
  const ch = sb.channel(`room:${code}`, { config: { broadcast: { self: true }, presence: { key: id } } });
  const log = { presence: 0, got: [] };
  ch.on("presence", { event: "sync" }, () => { log.presence = Object.keys(ch.presenceState()).length; });
  ch.on("broadcast", { event: "game" }, ({ payload }) => log.got.push(payload));
  const ready = new Promise((resolve, reject) => {
    ch.subscribe(async (status) => {
      if (status === "SUBSCRIBED") { await ch.track({ id, joinedAt: Date.now() }); resolve(); }
      else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") reject(new Error(status));
    });
  });
  return { sb, ch, log, ready };
}

const a = join("a");
const b = join("b");
await Promise.all([a.ready, b.ready]);
await new Promise((r) => setTimeout(r, 1500));
await a.ch.send({ type: "broadcast", event: "game", payload: { t: "ping", from: "a" } });
await new Promise((r) => setTimeout(r, 1500));
console.log(JSON.stringify({ aSeesPlayers: a.log.presence, bSeesPlayers: b.log.presence, aGot: a.log.got, bGot: b.log.got }));
await a.sb.removeAllChannels();
await b.sb.removeAllChannels();
process.exit(0);
