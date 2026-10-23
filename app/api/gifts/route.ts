import { parseArrangement } from "@/lib/arrangement";
import { saveGift } from "@/lib/gifts";

const MAX_BODY = 8 * 1024;

// Simple per-instance throttle: 10 gifts per IP per 10 minutes. Good enough to stop casual abuse.
const hits = new Map<string, number[]>();
function tooMany(ip: string, now = Date.now()) {
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > 10;
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (tooMany(ip)) return Response.json({ error: "Slow down a little and try again soon." }, { status: 429 });

  const text = await request.text();
  if (text.length > MAX_BODY) return Response.json({ error: "That bouquet is too big." }, { status: 413 });

  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return Response.json({ error: "Bad request." }, { status: 400 });
  }

  const arrangement = parseArrangement(body);
  if (!arrangement) return Response.json({ error: "That bouquet doesn't look right." }, { status: 400 });

  try {
    const id = await saveGift(arrangement);
    return Response.json({ id }, { status: 201 });
  } catch {
    return Response.json({ error: "Couldn't save your bouquet. Try again." }, { status: 502 });
  }
}
