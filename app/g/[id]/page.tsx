import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Bouquet } from "@/components/Bouquet";
import { fetchGift } from "@/lib/gifts";
import { GiftActions } from "./GiftActions";

export async function generateMetadata({ params }: PageProps<"/g/[id]">): Promise<Metadata> {
  const { id } = await params;
  const gift = await fetchGift(id);
  const to = gift?.card?.to?.trim();
  return {
    title: to ? `A bouquet for ${to} · Petal Party` : "A bouquet for you · Petal Party",
    description: gift?.card?.msg?.trim() || "Someone made you a bouquet.",
    openGraph: { images: [{ url: `/api/og/${id}`, width: 1200, height: 630, alt: "A hand-drawn bouquet" }] },
    twitter: { card: "summary_large_image", images: [`/api/og/${id}`] },
  };
}

export default function GiftPage({ params }: PageProps<"/g/[id]">) {
  return (
    <Suspense fallback={<main className="screen" aria-busy="true" />}>
      <Gift params={params} />
    </Suspense>
  );
}

async function Gift({ params }: { params: PageProps<"/g/[id]">["params"] }) {
  const { id } = await params;
  const gift = await fetchGift(id);
  if (!gift) notFound();
  const card = gift.card;
  const hasNote = card && (card.to || card.msg || card.from);

  return (
    <main className="screen" style={{ alignItems: "center", textAlign: "center" }}>
      <span className="logo" style={{ fontSize: 38, lineHeight: 1 }}>Petal Party</span>
      <h1 className="tw" style={{ fontSize: 19, margin: "8px 0 0" }}>Hi, I made this bouquet for you!</h1>

      <div style={{ marginTop: 4 }}>
        <Bouquet arrangement={gift} width={290} label={card?.to ? `A bouquet for ${card.to}` : "A hand-drawn bouquet"} />
      </div>

      {hasNote && (
        <div className="note" style={{ width: "100%", textAlign: "left", transform: "rotate(-2deg)", marginTop: -28, padding: "16px 20px 14px", display: "flex", flexDirection: "column", gap: 6 }}>
          {card.to && <span className="hand" style={{ fontSize: 26 }}>Dear {card.to},</span>}
          {card.msg && <span className="hand" style={{ fontSize: 25, lineHeight: 1.15, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{card.msg}</span>}
          {card.from && (
            <span className="hand" style={{ fontSize: 25, alignSelf: "flex-end", textAlign: "right", lineHeight: 1.1 }}>
              love,<br />{card.from}
            </span>
          )}
        </div>
      )}

      <GiftActions />
      <Link href="/studio?mode=gift" className="btn-outline" style={{ fontSize: 13, marginTop: 4 }}>Make one back</Link>
    </main>
  );
}
