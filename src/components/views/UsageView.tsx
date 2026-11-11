"use client";

import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Loadable } from "@/components/Loadable";
import { Tour } from "@/components/Tour";
import { useScenarios } from "@/components/WorkspaceProvider";
import { Bars, Columns } from "@/components/charts";
import { useAsync } from "@/hooks/useAsync";
import { api } from "@/lib/api";
import type { Usage } from "@/lib/types";

function UsageContent({ usage }: { usage: Usage }) {
  const { getScenario } = useScenarios();
  const scenario = getScenario(useSearchParams().get("s"));

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <h1 className="text-ink text-xl font-bold tracking-tight">Usage</h1>
        <p className="text-mute mt-0.5 text-[13px]">
          How the workspace uses the question dock and the reports, drawn from the audit log.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {usage.tiles.map((k) => (
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
              <Columns points={usage.questionsPerWeek} unit="count" />
            </div>
          </section>
          <section className="panel-card p-4">
            <h3 className="text-ink text-[14px] font-bold">Most opened reports</h3>
            <p className="text-faint text-[11px]">Opens in the last 8 weeks</p>
            <div className="mt-3">
              <Bars points={usage.topReports} unit="count" />
            </div>
          </section>
        </div>

        <section data-tour="usage-teams" className="panel-card mt-4 p-4 lg:w-1/2">
          <h3 className="text-ink text-[14px] font-bold">Charts saved by team</h3>
          <p className="text-faint text-[11px]">Saved answers become part of the report for everyone</p>
          <div className="mt-3">
            <Bars points={usage.savesByTeam} unit="count" />
          </div>
        </section>
      </div>
      <Tour scene="analytics" scenarioId={scenario.id} />
    </>
  );
}

export function UsageView() {
  const state = useAsync(() => api.usage());

  return (
    <AppShell tourScene="analytics">
      <Loadable state={state} label="Loading usage">
        {(data) => <UsageContent usage={data} />}
      </Loadable>
    </AppShell>
  );
}
