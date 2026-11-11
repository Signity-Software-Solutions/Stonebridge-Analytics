/**
 * The Stonebridge mark: a serif S monogram beside two rising bars, on the
 * indigo tile. Drawn as plain SVG so the sidebar, the sign in screen and
 * the favicon all share one shape. `tone` picks the tile treatment.
 */
export function BrandMark({
  size = 32,
  tone = "solid",
}: {
  size?: number;
  tone?: "solid" | "outline";
}) {
  const fg = tone === "solid" ? "#ffffff" : "#4f46e5";
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden focusable="false">
      {tone === "solid" ? (
        <rect width="64" height="64" rx="14" fill="#4f46e5" />
      ) : (
        <rect x="1" y="1" width="62" height="62" rx="13" fill="none" stroke="#4f46e5" strokeWidth="2" />
      )}
      <text
        x="25"
        y="45"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="38"
        fontWeight="bold"
        fill={fg}
        textAnchor="middle"
      >
        S
      </text>
      <rect x="41" y="33" width="5" height="13" rx="2" fill={fg} opacity="0.55" />
      <rect x="49" y="25" width="5" height="21" rx="2" fill={fg} />
    </svg>
  );
}
