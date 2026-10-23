"use client";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="screen" style={{ alignItems: "center", justifyContent: "center", textAlign: "center" }}>
      <h1 className="logo" style={{ fontSize: 44, margin: 0 }}>Oops.</h1>
      <p className="hand" style={{ fontSize: 28, margin: 0 }}>Something wilted. Give it another go.</p>
      <button className="btn-black" onClick={reset} style={{ marginTop: 12 }}>Try again</button>
    </main>
  );
}
