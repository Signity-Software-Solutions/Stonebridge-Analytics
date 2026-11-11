"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  ArrowUpRight,
  Check,
  CircleAlert,
  FastForward,
  Loader2,
  Pin,
  RotateCcw,
  Send,
  Sparkles,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Bars, ChartFor } from "@/components/charts";
import { useScriptedTimeline } from "@/hooks/useScriptedTimeline";
import { getScenario } from "@/lib/scenarios";
import { CLIENTS, PERSONA } from "@/lib/data";
import type { Scenario } from "@/lib/types";

const SUGGESTIONS = [
  "Paid by claim category this fiscal year",
  "Monthly paid compared with last year",
  "Which regions cost the most",
  "Top accounts by open claims",
];

const HISTORY_CHART = CLIENTS.slice(0, 5).map((c) => ({ label: c.name, value: c.ytdPaid }));

function Avatar({ who }: { who: "user" | "ai" }) {
  return who === "user" ? (
    <span className="bg-brand-strong flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white">
      NV
    </span>
  ) : (
    <span className="bg-tint text-brand flex size-7 shrink-0 items-center justify-center rounded-full">
      <Sparkles className="size-3.5" />
    </span>
  );
}

/** One scripted exchange: the question types into the input, becomes a user
 *  bubble, the assistant works through the pipeline, then answers with a
 *  governed chart or a refusal. Keyed on the scenario id. */
function Conversation({ scenario }: { scenario: Scenario }) {
  const durations = [scenario.typingMs, ...scenario.steps.map((s) => s.durationMs), 500];
  const t = useScriptedTimeline(durations);
  const [saved, setSaved] = useState(false);

  const typing = t.activeIndex === 0 && !t.done;
  const typedCount = typing
    ? Math.floor(t.stepProgress * scenario.question.length)
    : scenario.question.length;
  const sent = !typing;

  const refineIdx = scenario.steps.findIndex((s) => s.id === "refine");
  const refined =
    refineIdx >= 0 && t.activeIndex > refineIdx + 1 && scenario.refinedQuestion
      ? scenario.refinedQuestion
      : null;

  return (
    <>
      {/* thread */}
      <div className="flex flex-col gap-4">
        {/* a finished exchange from earlier this morning */}
        <div className="flex justify-end gap-2.5">
          <div className="bg-brand-strong max-w-[75%] rounded-2xl rounded-br-md px-4 py-2.5 text-[13.5px] font-medium text-white">
            Top accounts by paid this year
          </div>
          <Avatar who="user" />
        </div>
        <div className="flex gap-2.5">
          <Avatar who="ai" />
          <div className="panel-card max-w-[85%] flex-1 p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-ink text-[13.5px] font-bold">Top 5 accounts by paid</p>
              <span className="bg-tint text-brand flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold">
                <Pin className="size-2.5" /> Saved to Program Spend
              </span>
            </div>
            <div className="mt-3">
              <Bars points={HISTORY_CHART} unit="currency" />
            </div>
            <p className="text-mute border-hairline mt-3 border-t pt-2.5 text-[12px] leading-relaxed">
              Arvex Labs leads at $4.6M, a fifth of all program spend. The top five accounts
              carry just over half of the year's payments.
            </p>
          </div>
        </div>

        {/* the live exchange */}
        {sent && (
          <div className="animate-rise flex justify-end gap-2.5">
            <div className="bg-brand-strong max-w-[75%] rounded-2xl rounded-br-md px-4 py-2.5 text-[13.5px] font-medium text-white">
              {scenario.question}
            </div>
            <Avatar who="user" />
          </div>
        )}

        {sent && (
          <div className="flex gap-2.5">
            <Avatar who="ai" />
            <div className="panel-card max-w-[85%] flex-1 p-4">
              {/* pipeline, then the answer in place */}
              <ol className="flex flex-col gap-1.5">
                {scenario.steps.map((s, i) => {
                  const st = t.statuses[i + 1];
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
                      <span className={`font-bold ${st === "pending" ? "text-faint" : "text-ink"}`}>
                        {s.label}
                      </span>
                      {st !== "pending" && (
                        <span className="text-faint hidden truncate sm:inline">{s.detail}</span>
                      )}
                    </li>
                  );
                })}
              </ol>
              {refined && (
                <p className="bg-tint text-brand mt-2.5 inline-block rounded-lg px-2.5 py-1 text-[11.5px] font-bold">
                  Rewritten: {refined}
                </p>
              )}

              {t.done && scenario.outcome === "saved" && scenario.chart && (
                <div className="animate-pop-in border-hairline mt-3 border-t pt-3">
                  <p className="text-ink text-[13.5px] font-bold">{scenario.savedTitle}</p>
                  <div className="mt-2.5">
                    <ChartFor
                      kind={scenario.chart.kind}
                      points={scenario.chart.points}
                      unit={scenario.chart.unit}
                      seriesLabels={scenario.chart.seriesLabels}
                    />
                  </div>
                  {scenario.insight && (
                    <p className="text-mute mt-2.5 text-[12px] leading-relaxed">{scenario.insight}</p>
                  )}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {saved ? (
                      <span className="bg-ok-soft text-ok flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-bold">
                        <Check className="size-3.5" /> Saved to Program Spend
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setSaved(true)}
                        className="bg-brand-strong flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-bold text-white transition hover:brightness-110"
                      >
                        <Pin className="size-3.5" /> Save to Program Spend
                      </button>
                    )}
                    <Link
                      href={`/reports/program-spend?s=${scenario.id}`}
                      className="border-line text-mute hover:text-ink flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[12px] font-bold transition"
                    >
                      Open the report <ArrowUpRight className="size-3.5" />
                    </Link>
                  </div>
                </div>
              )}

              {t.done && scenario.outcome === "refused" && scenario.refusal && (
                <div className="animate-pop-in border-hairline mt-3 border-t pt-3">
                  <div className="flex items-start gap-2.5">
                    <span className="bg-warn-soft text-warn flex size-7 shrink-0 items-center justify-center rounded-lg">
                      <CircleAlert className="size-4" />
                    </span>
                    <div>
                      <p className="text-ink text-[13.5px] font-bold">{scenario.refusal.title}</p>
                      <p className="text-mute mt-1 text-[12px] leading-relaxed">{scenario.refusal.body}</p>
                      <p className="border-line bg-hairline/60 text-ink mt-2 inline-block rounded-lg border px-2.5 py-1.5 text-[12px] font-semibold">
                        Try: {scenario.refusal.suggestion}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* input dock */}
      <div className="bg-canvas sticky bottom-0 mt-6 pb-4">
        <div className="panel-card border-brand/25 flex items-center gap-2.5 p-3 shadow-lg">
          <span className="bg-brand-strong flex size-8 shrink-0 items-center justify-center rounded-lg text-white">
            <Sparkles className="size-4" />
          </span>
          <p className="text-ink min-h-5 flex-1 text-[13.5px] font-medium">
            {typing ? (
              <>
                {scenario.question.slice(0, typedCount)}
                <span className="bg-brand animate-pulse-dot ml-0.5 inline-block h-4 w-0.5 align-middle" />
              </>
            ) : (
              <span className="text-faint">Ask anything about the claims program</span>
            )}
          </p>
          <div className="flex shrink-0 items-center gap-2">
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
              onClick={() => {
                setSaved(false);
                t.restart();
              }}
              className="text-mute hover:text-ink inline-flex cursor-pointer items-center gap-1 text-[11px] font-bold"
            >
              <RotateCcw className="size-3" /> Replay
            </button>
            <span className="bg-brand-strong flex size-8 items-center justify-center rounded-lg text-white opacity-80">
              <Send className="size-3.5" />
            </span>
          </div>
        </div>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {SUGGESTIONS.map((q) => (
            <span
              key={q}
              className="border-line bg-surface text-mute rounded-full border px-3 py-1 text-[11.5px] font-semibold"
            >
              {q}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}

export function AskView() {
  const scenario = getScenario(useSearchParams().get("s"));

  return (
    <AppShell tourScene="home" withScenario>
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <h1 className="text-ink text-xl font-bold tracking-tight">Ask the data</h1>
        <p className="text-mute mt-0.5 text-[13px]">
          Plain English in, governed charts out. Every answer reads from the same model as the
          reports, under {PERSONA.company} scope.
        </p>
        <div className="mt-5">
          <Conversation key={scenario.id} scenario={scenario} />
        </div>
      </div>
    </AppShell>
  );
}
