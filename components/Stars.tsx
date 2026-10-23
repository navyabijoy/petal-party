import { Bloom } from "./Bloom";

/** Five painted flowers; the ones past `value` are faded out. */
export function Stars({ value, size = 44 }: { value: number; size?: number }) {
  return (
    <div role="img" aria-label={`${value} out of 5`} style={{ display: "flex", gap: 4 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Bloom key={n} type="gerbera" size={size} faded={n > value} label="" />
      ))}
    </div>
  );
}
