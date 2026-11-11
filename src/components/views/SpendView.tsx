"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import {
  Check,
  ChevronDown,
  CircleAlert,
  Download,
  FastForward,
  Loader2,
  Printer,
  RotateCcw,
  Sparkles,
  Table2,
  BarChart3,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Tour } from "@/components/Tour";
import { Bars, ChartFor, Columns } from "@/components/charts";
import { useScriptedTimeline } from "@/hooks/useScriptedTimeline";
import { getScenario } from "@/lib/scenarios";
import { SPEND_BY_GROUP, SPEND_BY_MONTH, SPEND_LINES, money, moneyExact } from "@/lib/data";
import type { Scenario } from "@/lib/types";

const KPIS = [
  { label: "Total paid", value: "$21.2M", sub: "fiscal year to date" },
  { label: "Claims with payments", value: "5,418", sub: "of 12,480 open claims" },
  { label: "Average per claim", value: "$3,910", sub: "all categories" },
  { label: "Accounts", value: "24", sub: "10 above $700K" },
];

function Slicer({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-32 flex-col gap-1">
      <span className="text-faint text-[10px] font-bold tracking-widest uppercase">{label}</span>
      <div className="border-line bg-surface text-ink flex h-9 items-center justify-between gap-2 rounded-lg border px-2.5 text-[12.5px] font-semibold">
        {value}
        <ChevronDown className="text-faint size-3.5" />
      </div>
    </div>
  );
}

/** The Ask dock plus the result card: one scripted run, keyed on scenario. */
function AskRun({ scenario, skipSignal, children }: { scenario: Scenario; skipSignal: number; children: ReactNode }) {
  // Timeline: typing, then each pipeline step, then a beat for the reveal.
  const durations = [scenario.typingMs, ...scenario.steps.map((s) => s.durationMs), 600];
  const t = useScriptedTimeline(durations);

  // The tour can land on the answer card before the run finishes; the scene
  // responds by jumping the timeline to its end.
  useEffect(() => {
    if (skipSignal > 0) t.skipToEnd();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skipSignal]);

  const typing = t.activeIndex === 0;
  const typedCount = typing
    ? Math.floor(t.stepProgress * scenario.question.length)
    : scenario.question.length;

  const refineIdx = scenario.steps.findIndex((s) => s.id === "refine");
  const refined =
    refineIdx >= 0 && t.activeIndex > refineIdx + 1 && scenario.refinedQuestion
      ? scenario.refinedQuestion
      : null;
  const shownQuestion = refined ?? scenario.question.slice(0, typedCount);

  const stepStatus = (i: number) => t.statuses[i + 1];

  return (
    <>
      <div className="mt-3 grid gap-4 lg:grid-cols-2">
        {children}

        {/* the answer card lands in the grid, a first class chart with an AI mark */}
        {scenario.outcome === "saved" && (
        <section data-tour="ask-result" className="panel-card p-4">
          {t.done && scenario.chart ? (
            <div className="animate-pop-in">
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <BarChart3 className="text-brand size-4 shrink-0" />
                  <div className="min-w-0">
                    <h3 className="text-ink truncate text-[14px] font-bold">{scenario.savedTitle}</h3>
                    <p className="text-faint text-[11px]">Saved to this report just now</p>
                  </div>
                </div>
                <span className="bg-tint text-brand flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-bold">
                  <Sparkles className="size-3" /> AI
                </span>
              </div>
              <div className="mt-3">
                <ChartFor
                  kind={scenario.chart.kind}
                  points={scenario.chart.points}
                  unit={scenario.chart.unit}
                  seriesLabels={scenario.chart.seriesLabels}
                />
              </div>
              {scenario.insight && (
                <p className="text-mute border-hairline mt-3 border-t pt-3 text-[12.5px] leading-relaxed">
                  {scenario.insight}
                </p>
              )}
            </div>
          ) : (
            <div aria-hidden>
              <div className="bg-shimmer animate-shimmer h-4 w-48 rounded" />
              <div className="bg-shimmer animate-shimmer mt-3 h-36 rounded-lg" />
              <div className="bg-shimmer animate-shimmer mt-3 h-3 w-full rounded" />
              <div className="bg-shimmer animate-shimmer mt-1.5 h-3 w-2/3 rounded" />
            </div>
          )}
        </section>
        )}

        {/* refusal card, shown in place of a chart */}
        {scenario.outcome === "refused" && t.done && scenario.refusal && (
        <section data-tour="ask-result" className="panel-card animate-pop-in border-warn/40 p-4">
          <div className="flex items-start gap-2.5">
            <span className="bg-warn-soft text-warn flex size-8 shrink-0 items-center justify-center rounded-lg">
              <CircleAlert className="size-4" />
            </span>
            <div>
              <h3 className="text-ink text-[14px] font-bold">{scenario.refusal.title}</h3>
              <p className="text-mute mt-1 text-[12.5px] leading-relaxed">{scenario.refusal.body}</p>
              <p className="text-faint mt-2.5 text-[11px] font-bold tracking-wide uppercase">Try instead</p>
              <p className="border-line bg-hairline/60 text-ink mt-1 inline-block rounded-lg border px-2.5 py-1.5 text-[12.5px] font-semibold">
                {scenario.refusal.suggestion}
              </p>
            </div>
          </div>
        </section>
        )}
      </div>

      {/* the dock */}
      <section data-tour="ask-dock" className="panel-card sticky bottom-4 z-20 mt-4 border-brand/25 p-4 shadow-xl">
        <div className="flex items-center justify-between gap-3">
          <p className="text-faint text-[10px] font-bold tracking-widest uppercase">Ask this report</p>
          <div className="flex items-center gap-2">
            {!t.done && (
              <button
                type="button"
                onClick={t.skipToEnd}
                className="text-mute hover:text-ink inline-flex cursor-pointer items-center gap-1 text-[11px] font-bold"
              >
                <FastForward className="size-3" /> Skip
              </button>
            )}
            <button
              type="button"
              onClick={t.restart}
              className="text-mute hover:text-ink inline-flex cursor-pointer items-center gap-1 text-[11px] font-bold"
            >
              <RotateCcw className="size-3" /> Replay
            </button>
          </div>
        </div>

        <div className="border-line bg-surface mt-2 flex min-h-11 items-center gap-2.5 rounded-xl border px-3 py-2">
          <Sparkles className="text-brand size-4 shrink-0" />
          <p className="text-ink flex-1 text-[13.5px] font-medium">
            {shownQuestion}
            {typing && <span className="bg-brand ml-0.5 inline-block h-4 w-0.5 animate-pulse-dot align-middle" />}
          </p>
          {refined && (
            <span className="bg-tint text-brand shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold">
              rewritten
            </span>
          )}
        </div>

        {/* pipeline steps */}
        <ol className="mt-3 flex flex-col gap-1.5">
          {scenario.steps.map((s, i) => {
            const st = stepStatus(i);
            return (
              <li key={s.id} className="flex items-center gap-2.5 text-[12.5px]">
                {st === "completed" ? (
                  <span className="bg-ok-soft text-ok flex size-5 shrink-0 items-center justify-center rounded-full">
                    <Check className="size-3" strokeWidth={3} />
                  </span>
                ) : st === "processing" ? (
                  <span className="bg-proc-soft text-proc flex size-5 shrink-0 items-center justify-center rounded-full">
                    <Loader2 className="size-3 animate-spin" />
                  </span>
                ) : (
                  <span className="border-line size-5 shrink-0 rounded-full border" />
                )}
                <span className={`font-bold ${st === "pending" ? "text-faint" : "text-ink"}`}>{s.label}</span>
                {st !== "pending" && <span className="text-faint hidden truncate sm:inline">{s.detail}</span>}
              </li>
            );
          })}
        </ol>

        {/* progress */}
        <div className="bg-hairline mt-3 h-1 overflow-hidden rounded-full">
          <div
            className="bg-brand-strong h-full rounded-full transition-[width] duration-150"
            style={{ width: `${Math.round(t.overallProgress * 100)}%` }}
          />
        </div>
      </section>
      {/* clearance under the floating dock */}
      <div aria-hidden className="h-4" />
    </>
  );
}

const TABLE_COLS = [
  { key: "claimNo", label: "Claim" },
  { key: "account", label: "Account" },
  { key: "category", label: "Category" },
  { key: "detail", label: "Detail" },
  { key: "date", label: "Date" },
  { key: "amount", label: "Amount" },
] as const;

type ColKey = (typeof TABLE_COLS)[number]["key"];

export function SpendView() {
  const scenario = getScenario(useSearchParams().get("s"));
  const [tab, setTab] = useState<"charts" | "table">("charts");
  const [skipSignal, setSkipSignal] = useState(0);
  const onMissingAnchor = useCallback(() => setSkipSignal((n) => n + 1), []);
  const [page, setPage] = useState(0);
  const [hiddenCols, setHiddenCols] = useState<ColKey[]>([]);
  const toggleCol = (k: ColKey) =>
    setHiddenCols((prev) => (prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]));
  const visible = TABLE_COLS.filter((c) => !hiddenCols.includes(c.key));
  const pageRows = SPEND_LINES.slice(page * 10, page * 10 + 10);

  return (
    <AppShell tourScene="spend" withScenario>
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <h1 className="text-ink text-xl font-bold tracking-tight">Program Spend</h1>
            <span className="text-faint text-[10px] font-bold tracking-[0.18em] uppercase">Report</span>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" className="border-line text-mute hover:text-ink flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[12px] font-bold">
              <Download className="size-3.5" /> Export
            </button>
            <button type="button" className="border-line text-mute hover:text-ink flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[12px] font-bold">
              <Printer className="size-3.5" /> Print
            </button>
          </div>
        </div>

        {/* slicers */}
        <section data-tour="spend-slicers" className="panel-card mt-4 flex flex-wrap items-end gap-3 p-4">
          <Slicer label="Account" value="All accounts" />
          <Slicer label="Region" value="All regions" />
          <Slicer label="Coverage" value="All coverages" />
          <Slicer label="Category" value="All categories" />
          <div className="flex min-w-40 flex-col gap-1">
            <span className="text-faint text-[10px] font-bold tracking-widest uppercase">Date range</span>
            <div className="border-line bg-surface text-ink flex h-9 items-center rounded-lg border px-2.5 text-[12.5px] font-semibold">
              Fiscal year to date
            </div>
          </div>
        </section>

        {/* KPI strip */}
        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {KPIS.map((k) => (
            <div key={k.label} className="panel-card p-3.5">
              <p className="text-faint text-[10.5px] font-bold tracking-wide uppercase">{k.label}</p>
              <p className="text-brand mt-1 text-[22px] font-bold tracking-tight">{k.value}</p>
              <p className="text-faint text-[11px]">{k.sub}</p>
            </div>
          ))}
        </div>

        {/* view toggle */}
        <div className="mt-4 flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setTab("charts")}
            className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12.5px] font-bold transition ${
              tab === "charts" ? "bg-brand text-white shadow-sm" : "text-mute hover:text-ink"
            }`}
          >
            <BarChart3 className="size-3.5" /> Charts
          </button>
          <button
            type="button"
            onClick={() => setTab("table")}
            className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12.5px] font-bold transition ${
              tab === "table" ? "bg-brand text-white shadow-sm" : "text-mute hover:text-ink"
            }`}
          >
            <Table2 className="size-3.5" /> Table
          </button>
          <span className="text-faint ml-auto hidden text-[11.5px] sm:inline">
            Slicers scope the tiles, the charts and the table together.
          </span>
        </div>

        {tab === "charts" ? (
          /* scripted run: the built in charts and the AI answer share one
             grid, and the dock floats at the bottom of the page. Keyed so
             switching the question pills restarts the run. */
          <AskRun key={scenario.id} scenario={scenario} skipSignal={skipSignal}>
            <div data-tour="spend-charts" className="contents">
              <section className="panel-card p-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="text-brand size-4" />
                  <h3 className="text-ink text-[14px] font-bold">Paid by claim category</h3>
                </div>
                <p className="text-faint mt-0.5 text-[11px]">Fiscal year to date, all accounts</p>
                <div className="mt-3">
                  <Bars points={SPEND_BY_GROUP} unit="currency" />
                </div>
              </section>
              <section className="panel-card p-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="text-brand size-4" />
                  <h3 className="text-ink text-[14px] font-bold">Paid by month</h3>
                </div>
                <p className="text-faint mt-0.5 text-[11px]">January through September</p>
                <div className="mt-4">
                  <Columns points={SPEND_BY_MONTH} unit="currency" />
                </div>
              </section>
            </div>
          </AskRun>
        ) : (
          <section className="panel-card mt-3 overflow-hidden">
            {/* column chooser, the tabular report pattern */}
            <div className="border-hairline bg-hairline/40 border-b px-4 py-3">
              <p className="text-faint text-[10px] font-bold tracking-widest uppercase">
                Show columns, click to hide or show
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {TABLE_COLS.map((c) => {
                  const on = !hiddenCols.includes(c.key);
                  return (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => toggleCol(c.key)}
                      className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11.5px] font-bold transition ${
                        on
                          ? "border-brand/40 bg-tint text-brand"
                          : "border-line bg-surface text-faint"
                      }`}
                    >
                      <span
                        className={`flex size-3.5 items-center justify-center rounded border ${
                          on ? "border-brand bg-brand text-white" : "border-line bg-surface"
                        }`}
                      >
                        {on && <Check className="size-2.5" strokeWidth={4} />}
                      </span>
                      {c.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-[12.5px]">
                <thead>
                  <tr className="text-faint border-hairline border-b text-left text-[10.5px] tracking-wider uppercase">
                    {visible.map((c) => (
                      <th
                        key={c.key}
                        className={`px-3 py-2.5 font-bold first:pl-4 ${c.key === "amount" ? "pr-4 text-right" : ""}`}
                      >
                        {c.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((l, i) => (
                    <tr key={`${l.claimNo}-${i}`} className="border-hairline hover:bg-hairline/40 border-b last:border-0">
                      {visible.map((c) => {
                        if (c.key === "claimNo")
                          return (
                            <td key={c.key} className="text-brand py-2.5 pr-3 pl-4 font-mono text-[11.5px] font-bold">
                              {l.claimNo}
                            </td>
                          );
                        if (c.key === "amount")
                          return (
                            <td key={c.key} className="text-ink px-3 py-2.5 pr-4 text-right font-bold tabular-nums">
                              {moneyExact(l.amount)}
                            </td>
                          );
                        if (c.key === "category")
                          return (
                            <td key={c.key} className="text-ink px-3 py-2.5 font-semibold">
                              {l.category}
                            </td>
                          );
                        return (
                          <td key={c.key} className="text-mute px-3 py-2.5">
                            {l[c.key]}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* pagination */}
            <div className="border-hairline flex flex-wrap items-center justify-between gap-2 border-t px-4 py-2.5">
              <span className="text-faint text-[11.5px]">
                Rows {page * 10 + 1} to {page * 10 + pageRows.length} of 84,312
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPage((v) => Math.max(0, v - 1))}
                  disabled={page === 0}
                  className="border-line text-mute hover:text-ink cursor-pointer rounded-lg border px-2.5 py-1 text-[11.5px] font-bold disabled:cursor-default disabled:opacity-40"
                >
                  Previous
                </button>
                {[0, 1, 2].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setPage(n)}
                    className={`size-7 cursor-pointer rounded-lg text-[11.5px] font-bold transition ${
                      page === n ? "bg-brand text-white" : "border-line text-mute hover:text-ink border"
                    }`}
                  >
                    {n + 1}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setPage((v) => Math.min(2, v + 1))}
                  disabled={page === 2}
                  className="border-line text-mute hover:text-ink cursor-pointer rounded-lg border px-2.5 py-1 text-[11.5px] font-bold disabled:cursor-default disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </section>
        )}
      </div>
      <Tour scene="spend" scenarioId={scenario.id} onMissingAnchor={onMissingAnchor} />
    </AppShell>
  );
}
