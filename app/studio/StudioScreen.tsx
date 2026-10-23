"use client";

import { useState } from "react";
import { Studio } from "@/components/Studio/Studio";

/** Placeholder wiring: scoring (solo) and sharing (gift) plug in here next. */
export function StudioScreen() {
  const [msg, setMsg] = useState("");
  return (
    <>
      <Studio minBlooms={3} maxBlooms={10} onDone={(a) => setMsg(`Saved ${a.items.length} items. Scoring and sharing are next.`)} />
      {msg && <p className="tw" role="status" style={{ textAlign: "center" }}>{msg}</p>}
    </>
  );
}
