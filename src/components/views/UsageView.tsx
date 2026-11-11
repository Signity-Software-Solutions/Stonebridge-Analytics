"use client";

import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Tour } from "@/components/Tour";
import { Bars, Columns } from "@/components/charts";
import { getScenario } from "@/lib/scenarios";
import { QUESTIONS_PER_WEEK, SAVES_BY_TEAM, TOP_REPORTS } from "@/lib/data";

const TILES = [
  { label: "Questions asked", value: "483", sub: "last 8 weeks" },
  { label: "Charts saved", value: "89", sub: "18% of questions" },
  { label: "Refused by scope", value: "12", sub: "all compensation fields" },
  { label: "Median answer time", value: "6.2s", sub: "question to chart" },
];

export function UsageView() {
  const scenario = getScenario(useSearchParams().get("s"));

  return (
    <AppShell tourScene="analytics">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <h1 className="text-ink text-xl font-bold tracking-tight">Usage</h1>
        <p className="text-mute mt-0.5 text-[13px]">
          How the workspace uses the question dock and the reports, drawn from the audit log.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {TILES.map((k) => (
            <div key={k.label} className="panel-card p-3.5">
              <p className="text-faint text-[10.5px] font-bold tracking-wide uppercase">{k.label}</p>
              <p className="text-brand mt-1 text-[22px] font-bold tracking-tight">{k.value}</p>
              <p className="text-faint text-[11px]">{k.sub}</p>
            </div>
          ))}
        </div>

        <div data-tour="usage-charts" className="mt-4 grid gap-4 lg:grid-cols-2">
          <section className="panel-card p-4">
            <h3 className="text-ink text-[14px] font-bold">Questions asked per week</h3>
            <p className="text-faint text-[11px]">Every question, answered or refused</p>
            <div className="mt-4">
              <Columns points={QUESTIONS_PER_WEEK} unit="count" />
            </div>
          </section>
          <section className="panel-card p-4">
            <h3 className="text-ink text-[14px] font-bold">Most opened reports</h3>
            <p className="text-faint text-[11px]">Opens in the last 8 weeks</p>
            <div className="mt-3">
              <Bars points={TOP_REPORTS} unit="count" />
            </div>
          </section>
        </div>

        <section data-tour="usage-teams" className="panel-card mt-4 p-4 lg:w-1/2">
          <h3 className="text-ink text-[14px] font-bold">Charts saved by team</h3>
          <p className="text-faint text-[11px]">Saved answers become part of the report for everyone</p>
          <div className="mt-3">
            <Bars points={SAVES_BY_TEAM} unit="count" />
          </div>
        </section>
      </div>
      <Tour scene="analytics" scenarioId={scenario.id} />
    </AppShell>
  );
}
