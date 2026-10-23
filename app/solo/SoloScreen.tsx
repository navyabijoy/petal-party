"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { Bouquet } from "@/components/Bouquet";
import { Stars } from "@/components/Stars";
import { Studio } from "@/components/Studio/Studio";
import type { Arrangement } from "@/lib/arrangement";
import { saveBest } from "@/lib/best";
import { MAX, scoreArrangement, type Score } from "@/lib/score";
import { THEMES, themeById, themeOfDay } from "@/lib/themes";

const PART_LABELS: [keyof typeof MAX, string][] = [
  ["mood", "Mood"], ["color", "Colors"], ["budget", "Budget"], ["composition", "Shape"], ["meaning", "Meaning"],
];

function Solo() {
  const params = useSearchParams();
  // A theme in the link wins; otherwise everyone gets the same one today.
  const initialId = params.get("t");
  const [themeId, setThemeId] = useState(() => themeById(initialId)?.id ?? themeOfDay().id);
  const theme = themeById(themeId) ?? THEMES[0];
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{ arrangement: Arrangement; score: Score; best: number } | null>(null);

  const finish = (arrangement: Arrangement) => {
    const score = scoreArrangement(arrangement, theme);
    setResult({ arrangement, score, best: saveBest(theme.id, score.total) });
  };

  const nextTheme = () => {
    const i = THEMES.findIndex((t) => t.id === theme.id);
    setThemeId(THEMES[(i + 1) % THEMES.length].id);
    setResult(null);
    setAttempt((n) => n + 1);
  };

  const request = useMemo(
    () => (
      <div className="note" style={{ transform: "rotate(-1.5deg)", margin: "4px 4px 0" }}>
        <span className="tape" />
        <span className="tw" style={{ display: "block", fontSize: 10, fontWeight: 700, letterSpacing: 1.5 }}>
          CUSTOMER · BUDGET {theme.budget} COINS
        </span>
        <span className="hand" style={{ display: "block", fontSize: 26, lineHeight: 1.05 }}>&ldquo;{theme.request}&rdquo;</span>
      </div>
    ),
    [theme],
  );

  if (result) {
    const { score, arrangement, best } = result;
    return (
      <main className="screen" style={{ alignItems: "center" }}>
        <span className="stamp">{theme.name}</span>
        <Bouquet arrangement={arrangement} width={260} />
        <Stars value={score.stars} />
        <p className="hand" style={{ fontSize: 28, lineHeight: 1.1, textAlign: "center", margin: 0 }}>{score.hints.join(" ")}</p>
        <p className="tw" style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1, margin: 0 }}>
          {score.total} / 100 · best {best} · cost {score.cost}/{theme.budget}
        </p>
        <dl style={{ width: "100%", margin: 0, display: "grid", gap: 6 }}>
          {PART_LABELS.map(([k, label]) => (
            <div key={k} style={{ display: "grid", gridTemplateColumns: "84px 1fr 44px", alignItems: "center", gap: 8, fontSize: 12 }}>
              <dt className="tw" style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>{label}</dt>
              <dd style={{ margin: 0, height: 6, background: "rgba(27,27,27,.15)" }}>
                <div style={{ height: "100%", width: `${(score.parts[k] / MAX[k]) * 100}%`, background: "var(--ink)" }} />
              </dd>
              <dd className="tw" style={{ margin: 0, textAlign: "right" }}>{Math.round(score.parts[k])}/{MAX[k]}</dd>
            </div>
          ))}
        </dl>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, width: "100%", marginTop: 8 }}>
          <button className="btn-black" onClick={() => { setResult(null); setAttempt((n) => n + 1); }}>Try again</button>
          <button className="btn-outline" onClick={nextTheme}>Next theme</button>
        </div>
        <Link href="/" className="tw" style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>HOME</Link>
      </main>
    );
  }

  return (
    <>
      <div style={{ maxWidth: 440, margin: "0 auto", padding: "16px 16px 0" }}>{request}</div>
      <Studio key={`${theme.id}-${attempt}`} label={theme.name} minBlooms={3} maxBlooms={10} doneLabel="Deliver" onDone={finish} />
    </>
  );
}

export function SoloScreen() {
  return (
    <Suspense>
      <Solo />
    </Suspense>
  );
}
