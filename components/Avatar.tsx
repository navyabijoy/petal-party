/** A small painted face. The colour comes from the player's hue. */
export function Avatar({ hue, size = 36 }: { hue: number; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" style={{ flex: "none" }}>
      <circle cx="20" cy="20" r="17" fill={`hsl(${hue} 70% 82%)`} stroke="#1B1B1B" strokeWidth="2" />
      <circle cx="14.5" cy="18" r="2" fill="#1B1B1B" />
      <circle cx="25.5" cy="18" r="2" fill="#1B1B1B" />
      <path d="M14 25 Q20 30 26 25" fill="none" stroke="#1B1B1B" strokeWidth="2" strokeLinecap="round" />
      <circle cx="31" cy="9" r="4.5" fill={`hsl(${(hue + 150) % 360} 70% 65%)`} stroke="#1B1B1B" strokeWidth="1.6" />
    </svg>
  );
}
