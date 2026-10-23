import { Bloom } from "@/components/Bloom";
import { Bouquet } from "@/components/Bouquet";
import { BLOOM_TYPES } from "@/lib/blooms";
import { STARTERS } from "@/lib/starters";

export const metadata = { title: "Gallery · Petal Party" };

export default function Gallery() {
  return (
    <main className="screen" style={{ maxWidth: 900 }}>
      <h1 className="logo" style={{ fontSize: 44, margin: 0 }}>Gallery</h1>
      <section style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-end" }}>
        {BLOOM_TYPES.map((t) => (
          <figure key={t} style={{ margin: 0, textAlign: "center" }}>
            <Bloom type={t} size={110} />
            <figcaption className="tw" style={{ fontSize: 12 }}>{t}</figcaption>
          </figure>
        ))}
      </section>
      <section style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
        <Bouquet arrangement={STARTERS.sunny} width={280} />
        <Bouquet arrangement={STARTERS.romance} width={280} halo="#F7E6E4" />
        <Bouquet arrangement={STARTERS.meadow} width={280} halo="#E9EEF6" />
      </section>
      <section style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
        {[48, 72, 120].map((w) => (
          <Bouquet key={w} arrangement={STARTERS.romance} width={w} halo="#F7E6E4" />
        ))}
      </section>
    </main>
  );
}
