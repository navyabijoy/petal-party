import { ImageResponse } from "next/og";
import { bouquetSvg } from "@/lib/bouquetSvg";
import { STARTERS } from "@/lib/starters";
import { fetchGift } from "@/lib/gifts";

const size = { width: 1200, height: 630 };

export async function GET(_req: Request, ctx: RouteContext<"/api/og/[id]">) {
  const { id } = await ctx.params;
  // A broken or missing gift should still give a pretty preview, never a failed image.
  const gift = (await fetchGift(id).catch(() => null)) ?? STARTERS.sunny;
  const to = gift.card?.to?.trim();
  // Satori can't draw our SVG components, so hand it a finished SVG string as an image.
  const svg = bouquetSvg(gift, 470);
  const bouquetSrc = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", background: "#FAF8EE", display: "flex", alignItems: "center", justifyContent: "center", gap: 56, padding: 48 }}>
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 520 }}>
          <div style={{ fontSize: 40, color: "#B32D27", letterSpacing: 4, textTransform: "uppercase", display: "flex" }}>Petal Party</div>
          <div style={{ fontSize: 76, lineHeight: 1.05, color: "#1B1B1B", marginTop: 16, display: "flex" }}>
            {to ? `A bouquet for ${to}` : "A bouquet for you"}
          </div>
          {gift.card?.msg ? (
            <div style={{ fontSize: 34, color: "#4A4A4A", marginTop: 24, display: "flex" }}>{gift.card.msg.slice(0, 90)}</div>
          ) : null}
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={bouquetSrc} width={470} height={533} alt="" />
      </div>
    ),
    size,
  );
}
