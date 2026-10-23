"use client";

import { useState } from "react";

export function GiftActions() {
  const [copied, setCopied] = useState(false);
  const [canShare] = useState(() => typeof navigator !== "undefined" && typeof navigator.share === "function");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link:", window.location.href);
    }
  };

  const share = async () => {
    try {
      await navigator.share({ title: "A bouquet for you", url: window.location.href });
    } catch {
      // The person closed the share sheet; nothing to do.
    }
  };

  return (
    <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
      <button className="btn-black" onClick={copy}>{copied ? "Copied!" : "Copy link"}</button>
      {canShare && <button className="btn-outline" onClick={share}>Share</button>}
    </div>
  );
}
