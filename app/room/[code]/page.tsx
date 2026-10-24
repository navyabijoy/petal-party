import { notFound } from "next/navigation";
import { Suspense } from "react";
import { isRoomCode } from "@/lib/room/useRoom";
import { RoomEntry } from "./RoomEntry";

export const metadata = { title: "Room · Petal Party" };

export default function RoomPage({ params }: PageProps<"/room/[code]">) {
  return (
    <Suspense fallback={<main className="screen" aria-busy="true" />}>
      <Room params={params} />
    </Suspense>
  );
}

async function Room({ params }: { params: PageProps<"/room/[code]">["params"] }) {
  const code = (await params).code.toUpperCase();
  if (!isRoomCode(code)) notFound();
  return <RoomEntry code={code} />;
}
