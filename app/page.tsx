import Link from "next/link";
import { TodayTheme } from "./TodayTheme";

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
        <TodayTheme />
      </div>

      <Link href="/room" className="btn-black" style={{ height: 62, flexDirection: "column", gap: 2 }}>
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
