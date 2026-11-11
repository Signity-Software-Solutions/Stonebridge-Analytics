/** Tiny inline trend line for KPI cards: one indigo path, no axes. */
export function Sparkline({ points, width = 96, height = 28, color = "#4f46e5" }: {
  points: number[];
  width?: number;
  height?: number;
  color?: string;
}) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const span = max - min || 1;
  const X = (i: number) => (i * (width - 4)) / (points.length - 1) + 2;
  const Y = (v: number) => height - 3 - ((v - min) / span) * (height - 6);
  const d = points.map((v, i) => `${i === 0 ? "M" : "L"}${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(" ");
  const areaD = `${d} L${X(points.length - 1).toFixed(1)},${height} L2,${height} Z`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden>
      <path d={areaD} fill={color} opacity="0.12" />
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <circle cx={X(points.length - 1)} cy={Y(points[points.length - 1])} r="2.5" fill={color} />
    </svg>
  );
}
