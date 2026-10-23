import { cacheLife } from "next/cache";
import { parseArrangement, type Arrangement } from "./arrangement";
import { getSupabase } from "./supabase";

const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";

/** 10 characters from an unambiguous alphabet: about 49 bits, so ids can't be guessed. */
export function newGiftId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(10));
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}

export const isGiftId = (id: string) => /^[a-z0-9]{8,16}$/.test(id);

export async function saveGift(arrangement: Arrangement): Promise<string> {
  const id = newGiftId();
  const { error } = await getSupabase().from("gifts").insert({ id, arrangement });
  if (error) throw new Error(error.message);
  return id;
}

/**
 * Gifts never change once saved, so reads are cached. Real errors throw (and are not cached);
 * only a genuinely missing gift resolves to null.
 */
async function loadGift(id: string): Promise<unknown | null> {
  "use cache";
  cacheLife("hours");
  const { data, error } = await getSupabase().from("gifts").select("arrangement").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? data.arrangement : null;
}

export async function fetchGift(id: string): Promise<Arrangement | null> {
  if (!isGiftId(id)) return null;
  const raw = await loadGift(id);
  return raw ? parseArrangement(raw) : null;
}
