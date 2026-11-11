/**
 * Dependency free charts: plain inline SVG, one brand hue with tints, value
 * labels on every mark. They render identically on the server and client.
 */

import type { SeriesPoint } from "@/lib/types";
import { money } from "@/lib/format";

const HUES = ["#4f46e5", "#6366f1", "#818cf8", "#a5b4fc", "#c7d2fe", "#e0e7ff"];

function fmt(unit: "currency" | "count", v: number): string {
  return unit === "currency" ? money(v) : v.toLocaleString();
}

export function Donut({ points, unit }: { points: SeriesPoint[]; unit: "currency" | "count" }) {
  const total = points.reduce((s, p) => s + p.value, 0);
  const R = 70;
  const C = 2 * Math.PI * R;
  let acc = 0;
  return (
    <div className="flex flex-wrap items-center justify-center gap-6">
      <svg viewBox="0 0 200 200" className="h-44 w-44" role="img" aria-label="Donut chart">
        {points.map((p, i) => {
          const frac = p.value / total;
          const dash = frac * C;
          const offset = C * 0.25 - acc * C;
          acc += frac;
          return (
            <circle
              key={p.label}
              cx="100"
              cy="100"
              r={R}
              fill="none"
              stroke={HUES[i % HUES.length]}
              strokeWidth="30"
              strokeDasharray={`${dash - 2} ${C - dash + 2}`}
              strokeDashoffset={offset}
            />
          );
        })}
        <text x="100" y="96" textAnchor="middle" className="fill-[#171c2b]" fontSize="22" fontWeight="700">
          {fmt(unit, total)}
        </text>
        <text x="100" y="116" textAnchor="middle" className="fill-[#8a91a3]" fontSize="11">
          Total
        </text>
      </svg>
      <ul className="flex min-w-44 flex-col gap-1.5">
        {points.map((p, i) => (
          <li key={p.label} className="flex items-center gap-2 text-[12px]">
            <span className="size-2.5 rounded-sm" style={{ background: HUES[i % HUES.length] }} />
            <span className="text-mute flex-1">{p.label}</span>
            <span className="text-ink font-bold tabular-nums">{fmt(unit, p.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Bars({ points, unit }: { points: SeriesPoint[]; unit: "currency" | "count" }) {
  const max = Math.max(...points.map((p) => p.value));
  const rowH = 30;
  const h = points.length * rowH + 4;
  return (
    <svg viewBox={`0 0 420 ${h}`} className="w-full" style={{ height: h }} role="img" aria-label="Bar chart">
      {points.map((p, i) => {
        const w = Math.max(6, (p.value / max) * 240);
        const y = i * rowH + 4;
        return (
          <g key={p.label}>
            <text x="0" y={y + 14} fontSize="11" className="fill-[#555d72]">
              {p.label.length > 20 ? p.label.slice(0, 19) + "." : p.label}
            </text>
            <rect x="128" y={y + 3} width={w} height="14" rx="4" fill="#4f46e5" opacity={1 - i * 0.08} />
            <text x={132 + w} y={y + 14} fontSize="11" fontWeight="700" className="fill-[#171c2b]">
              {fmt(unit, p.value)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function Columns({ points, unit }: { points: SeriesPoint[]; unit: "currency" | "count" }) {
  const max = Math.max(...points.map((p) => p.value));
  const n = points.length;
  const slot = 420 / n;
  const bw = Math.min(34, slot * 0.55);
  return (
    <svg viewBox="0 0 420 180" className="w-full" role="img" aria-label="Column chart">
      {points.map((p, i) => {
        const bh = Math.max(4, (p.value / max) * 118);
        const x = i * slot + (slot - bw) / 2;
        const y = 150 - bh;
        return (
          <g key={p.label}>
            <rect x={x} y={y} width={bw} height={bh} rx="4" fill="#4f46e5" />
            <text x={x + bw / 2} y={y - 5} textAnchor="middle" fontSize="9.5" fontWeight="700" className="fill-[#171c2b]">
              {fmt(unit, p.value)}
            </text>
            <text x={x + bw / 2} y="166" textAnchor="middle" fontSize="10" className="fill-[#8a91a3]">
              {p.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function TwoLine({
  points,
  unit,
  seriesLabels,
}: {
  points: SeriesPoint[];
  unit: "currency" | "count";
  seriesLabels?: [string, string];
}) {
  const all = points.flatMap((p) => [p.value, p.prior ?? p.value]);
  const max = Math.max(...all);
  const min = Math.min(...all) * 0.85;
  const n = points.length;
  const X = (i: number) => 24 + (i * (396 - 24)) / (n - 1);
  const Y = (v: number) => 140 - ((v - min) / (max - min)) * 118;
  const path = (key: "value" | "prior") =>
    points.map((p, i) => `${i === 0 ? "M" : "L"}${X(i)},${Y(key === "value" ? p.value : (p.prior ?? p.value))}`).join(" ");
  const peak = points.reduce((a, b) => (b.value > a.value ? b : a), points[0]);
  const peakIdx = points.indexOf(peak);
  return (
    <div>
      <svg viewBox="0 0 420 170" className="w-full" role="img" aria-label="Line chart">
        <path d={path("prior")} fill="none" stroke="#a5b4fc" strokeWidth="2.5" strokeDasharray="5 4" />
        <path d={path("value")} fill="none" stroke="#4f46e5" strokeWidth="3" />
        {points.map((p, i) => (
          <circle key={p.label} cx={X(i)} cy={Y(p.value)} r="3.2" fill="#4f46e5" />
        ))}
        <text x={X(peakIdx)} y={Y(peak.value) - 8} textAnchor="middle" fontSize="10.5" fontWeight="700" className="fill-[#171c2b]">
          {fmt(unit, peak.value)}
        </text>
        {points.map((p, i) => (
          <text key={p.label} x={X(i)} y="160" textAnchor="middle" fontSize="10" className="fill-[#8a91a3]">
            {p.label}
          </text>
        ))}
      </svg>
      {seriesLabels && (
        <div className="mt-1 flex items-center justify-center gap-5 text-[11px]">
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-5 rounded bg-[#4f46e5]" />
            <span className="text-mute">{seriesLabels[0]}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-5 rounded border-t-2 border-dashed border-[#a5b4fc]" />
            <span className="text-mute">{seriesLabels[1]}</span>
          </span>
        </div>
      )}
    </div>
  );
}

export function ChartFor({ kind, points, unit, seriesLabels }: {
  kind: "donut" | "bars" | "columns" | "line";
  points: SeriesPoint[];
  unit: "currency" | "count";
  seriesLabels?: [string, string];
}) {
  if (kind === "donut") return <Donut points={points} unit={unit} />;
  if (kind === "bars") return <Bars points={points} unit={unit} />;
  if (kind === "line") return <TwoLine points={points} unit={unit} seriesLabels={seriesLabels} />;
  return <Columns points={points} unit={unit} />;
}
