import type { Arrangement } from "./arrangement";

/** Saves a bouquet as a gift and returns its id. Throws with a message fit to show the user. */
export async function sendGift(arrangement: Arrangement): Promise<string> {
  const res = await fetch("/api/gifts", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(arrangement) });
  const data = (await res.json().catch(() => ({}))) as { id?: string; error?: string };
  if (!res.ok || !data.id) throw new Error(data.error ?? "Couldn't save your bouquet.");
  return data.id;
}
