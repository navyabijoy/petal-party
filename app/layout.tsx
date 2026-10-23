import type { Metadata, Viewport } from "next";
import { Courier_Prime, Caveat, Yesteryear } from "next/font/google";
import "./globals.css";

const courier = Courier_Prime({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-tw" });
const caveat = Caveat({ subsets: ["latin"], variable: "--font-hand" });
const yesteryear = Yesteryear({ weight: "400", subsets: ["latin"], variable: "--font-logo" });

export const metadata: Metadata = {
  title: "Petal Party",
  description: "Make a bouquet, write a note, win the room.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FAF8EE",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${courier.variable} ${caveat.variable} ${yesteryear.variable}`}>
      <body>{children}</body>
    </html>
  );
}
