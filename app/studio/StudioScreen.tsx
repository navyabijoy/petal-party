"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Studio } from "@/components/Studio/Studio";
import type { Arrangement } from "@/lib/arrangement";

/** Free studio: make a bouquet, save it as a gift link. */
export function StudioScreen() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const send = async (arrangement: Arrangement) => {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/gifts", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(arrangement) });
      const data = (await res.json()) as { id?: string; error?: string };
      if (!res.ok || !data.id) throw new Error(data.error ?? "Couldn't save your bouquet.");
      router.push(`/g/${data.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't save your bouquet.");
      setBusy(false);
    }
  };

  return (
    <>
      <Studio minBlooms={3} maxBlooms={10} doneLabel={busy ? "Sending…" : "Get link"} busy={busy} onDone={send} />
      {error && <p className="tw" role="alert" style={{ textAlign: "center", color: "var(--stamp)", fontWeight: 700 }}>{error}</p>}
    </>
  );
}
