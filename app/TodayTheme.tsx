"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { themeById, themeOfDay } from "@/lib/themes";

const subscribe = () => () => {};

/** Computed in the browser: the page itself is built once, but the theme changes daily. */
export function TodayTheme() {
  // Server snapshot is null, so the static HTML and first client render match.
  const id = useSyncExternalStore(subscribe, () => themeOfDay().id, () => null);
  const theme = themeById(id);
  return (
    <Link href="/solo" className="note" style={{ width: 230, minHeight: 92, transform: "rotate(3deg)", textDecoration: "none", display: "block" }}>
      <span className="tape" />
      <span className="tw" style={{ display: "block", fontSize: 10, fontWeight: 700, letterSpacing: 1.5 }}>TODAY&apos;S THEME</span>
      <span className="hand" style={{ display: "block", fontSize: 34, fontWeight: 700, lineHeight: 1 }}>{theme?.name ?? " "}</span>
      <span className="tw" style={{ display: "block", fontSize: 11, marginTop: 4 }}>tap to play solo</span>
    </Link>
  );
}
