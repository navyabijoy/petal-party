import Link from "next/link";

export default function GiftNotFound() {
  return (
    <main className="screen" style={{ alignItems: "center", justifyContent: "center", textAlign: "center" }}>
      <h1 className="logo" style={{ fontSize: 44, margin: 0 }}>Oh no.</h1>
      <p className="hand" style={{ fontSize: 28, margin: 0 }}>This bouquet has wilted, or the link is wrong.</p>
      <Link href="/studio?mode=gift" className="btn-black" style={{ marginTop: 12 }}>Make a new one</Link>
    </main>
  );
}
