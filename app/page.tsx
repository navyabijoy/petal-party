import Link from "next/link";

export default function Home() {
  return (
    <main className="screen">
      <div style={{ textAlign: "center", marginTop: 24 }}>
        <h1 className="logo" style={{ fontSize: 66, lineHeight: 1, margin: 0 }}>Petal Party</h1>
        <p className="tw" style={{ fontSize: 12, letterSpacing: 3, textTransform: "uppercase", margin: "6px 0 0" }}>
          make a bouquet · win the room
        </p>
      </div>

      <div style={{ flex: 1, display: "grid", placeItems: "center", minHeight: 280 }}>
        <div className="note" style={{ width: 220, transform: "rotate(3deg)" }}>
          <span className="tape" />
          <span className="tw" style={{ display: "block", fontSize: 10, fontWeight: 700, letterSpacing: 1.5 }}>TODAY&apos;S THEME</span>
          <span className="hand" style={{ display: "block", fontSize: 34, fontWeight: 700, lineHeight: 1 }}>Fairy Garden</span>
          <span className="tw" style={{ display: "block", fontSize: 11, marginTop: 4 }}>bouquets coming soon</span>
        </div>
      </div>

      <Link href="/studio" className="btn-black" style={{ height: 62, flexDirection: "column", gap: 2 }}>
        <span style={{ fontSize: 20 }}>Play a round</span>
        <span style={{ fontSize: 11, fontWeight: 400, letterSpacing: 1, textTransform: "none" }}>live room · 4–10 players · 3 min</span>
      </Link>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Link href="/studio?mode=gift" className="btn-outline" style={{ fontSize: 13 }}>Send a bouquet</Link>
        <Link href="/room" className="btn-outline" style={{ fontSize: 13 }}>Friends room</Link>
      </div>
    </main>
  );
}
