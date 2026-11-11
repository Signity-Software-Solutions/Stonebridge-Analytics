"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Loadable } from "@/components/Loadable";
import { Tour } from "@/components/Tour";
import { useScenarios } from "@/components/WorkspaceProvider";
import { useAsync } from "@/hooks/useAsync";
import { api } from "@/lib/api";
import type { Report } from "@/lib/types";

const DOMAIN_STYLE: Record<string, string> = {
  Finance: "bg-tint text-brand",
  Operations: "bg-ok-soft text-ok",
  Partners: "bg-warn-soft text-warn",
};

function ReportsContent({ reports }: { reports: Report[] }) {
  const router = useRouter();
  const { getScenario } = useScenarios();
  const scenario = getScenario(useSearchParams().get("s"));

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h1 className="text-ink text-xl font-bold tracking-tight">Reports</h1>
            <p className="text-mute mt-0.5 text-[13px]">
              46 live reports across finance, operations and partners. Showing the ten you use most.
            </p>
          </div>
        </div>

        <section data-tour="report-rows" className="panel-card mt-5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-faint border-hairline border-b text-left text-[10.5px] tracking-wider uppercase">
                  <th className="px-4 py-2.5 font-bold">Report</th>
                  <th className="px-2 py-2.5 font-bold">Domain</th>
                  <th className="px-2 py-2.5 font-bold">Owner</th>
                  <th className="px-2 py-2.5 font-bold">Last opened</th>
                  <th className="px-4 py-2.5 text-right font-bold">Status</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => {
                  const openable = r.key === "program-spend";
                  return (
                    <tr
                      key={r.key}
                      onClick={openable ? () => router.push(`/reports/program-spend?s=${scenario.id}`) : undefined}
                      className={`border-hairline border-b last:border-0 ${
                        openable ? "hover:bg-tint/50 cursor-pointer" : "hover:bg-hairline/40"
                      }`}
                    >
                      <td className="px-4 py-3">
                        <span className="text-ink flex items-center gap-1.5 font-bold">
                          {r.name}
                          {openable && <ArrowUpRight className="text-brand size-3.5" />}
                        </span>
                      </td>
                      <td className="px-2 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-[10.5px] font-bold ${DOMAIN_STYLE[r.domain]}`}>
                          {r.domain}
                        </span>
                      </td>
                      <td className="text-mute px-2 py-3">{r.owner}</td>
                      <td className="text-mute px-2 py-3">{r.lastOpened}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`rounded-full px-2 py-0.5 text-[10.5px] font-bold ${r.live ? "bg-ok-soft text-ok" : "bg-pend-soft text-pend"}`}>
                          {r.live ? "Live" : "Scheduled"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <p className="text-faint mt-3 text-[12px]">
          Every report runs on the same governed warehouse model, so a number here matches the same number anywhere else.
        </p>
      </div>
      <Tour scene="reports" scenarioId={scenario.id} />
    </>
  );
}

export function ReportsView() {
  const state = useAsync(() => api.reports());

  return (
    <AppShell tourScene="reports">
      <Loadable state={state} label="Loading reports">
        {(data) => <ReportsContent reports={data.items} />}
      </Loadable>
    </AppShell>
  );
}
