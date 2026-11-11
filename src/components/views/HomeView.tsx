"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowUpRight,
  FileBarChart2,
  FolderOpen,
  MessageCircleQuestion,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Loadable } from "@/components/Loadable";
import { Sparkline } from "@/components/Sparkline";
import { Tour } from "@/components/Tour";
import { useScenarios, useWorkspace } from "@/components/WorkspaceProvider";
import { useAsync } from "@/hooks/useAsync";
import { api } from "@/lib/api";
import { money } from "@/lib/format";
import type { Claim, KpiId, Overview, SeriesPoint } from "@/lib/types";

/** The icon is presentation, so it lives here, keyed by the KPI id the API sends. */
const KPI_ICON: Record<KpiId, LucideIcon> = {
  "open-claims": FolderOpen,
  "paid-month": Wallet,
  "questions-week": MessageCircleQuestion,
  "live-reports": FileBarChart2,
};

const STATUS_STYLE: Record<string, string> = {
  Open: "bg-ok-soft text-ok",
  Review: "bg-warn-soft text-warn",
  Settled: "bg-pend-soft text-pend",
};

interface HomeData {
  overview: Overview;
  claims: Claim[];
  spendByMonth: SeriesPoint[];
}

function HomeContent({ overview, claims, spendByMonth }: HomeData) {
  const persona = useWorkspace();
  const { getScenario } = useScenarios();
  const scenario = getScenario(useSearchParams().get("s"));

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-faint text-[11px] font-bold tracking-[0.14em] uppercase">
              Tuesday, September 29
            </p>
            <h1 className="text-ink mt-0.5 text-xl font-bold tracking-tight">
              Good morning, {persona.name.split(" ")[0]}
            </h1>
            <p className="text-mute mt-0.5 text-[13px]">
              {persona.company} claims program, refreshed overnight.
            </p>
          </div>
          <Link
            href={`/ask?s=${scenario.id}`}
            className="bg-brand-strong flex items-center gap-2 rounded-lg px-3.5 py-2 text-[12.5px] font-bold text-white shadow-sm transition hover:brightness-110"
          >
            <Sparkles className="size-3.5" />
            Ask the data
          </Link>
        </div>

        {/* KPI strip with trends */}
        <div data-tour="home-kpis" className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {overview.kpis.map((k) => {
            const Icon = KPI_ICON[k.id];
            return (
              <div key={k.id} className="panel-card p-4">
                <div className="flex items-center justify-between">
                  <p className="text-faint text-[11px] font-bold tracking-wide uppercase">{k.label}</p>
                  <Icon className="text-brand size-4" />
                </div>
                <div className="mt-2 flex items-end justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-ink text-2xl font-bold tracking-tight">{k.value}</p>
                    <p
                      className={`mt-1 flex items-center gap-1 text-[11px] font-bold ${
                        k.up === null ? "text-faint" : k.up ? "text-ok" : "text-err"
                      }`}
                    >
                      {k.up === true && <TrendingUp className="size-3" />}
                      {k.up === false && <TrendingDown className="size-3" />}
                      {k.delta}
                    </p>
                  </div>
                  <div className="hidden shrink-0 sm:block">
                    <Sparkline points={k.trend} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1.7fr_1fr]">
          {/* recent files */}
          <section data-tour="home-files" className="panel-card overflow-hidden">
            <div className="border-hairline flex items-center justify-between border-b px-4 py-3">
              <h2 className="text-ink text-[14px] font-bold">Newest claims</h2>
              <span className="text-faint text-[11px]">8 of 1,284</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[12.5px]">
                <thead>
                  <tr className="text-faint border-hairline border-b text-left text-[10.5px] tracking-wider uppercase">
                    <th className="px-4 py-2 font-bold">Claim</th>
                    <th className="px-2 py-2 font-bold">Claimant</th>
                    <th className="px-2 py-2 font-bold">Account</th>
                    <th className="px-2 py-2 font-bold">Incident</th>
                    <th className="px-2 py-2 font-bold">Coverage</th>
                    <th className="px-2 py-2 font-bold">Status</th>
                    <th className="px-4 py-2 text-right font-bold">Paid</th>
                  </tr>
                </thead>
                <tbody>
                  {claims.map((f) => (
                    <tr key={f.claimNo} className="border-hairline hover:bg-hairline/40 border-b last:border-0">
                      <td className="text-brand px-4 py-2.5 font-mono text-[11.5px] font-bold">{f.claimNo}</td>
                      <td className="text-ink px-2 py-2.5 font-semibold">{f.claimant}</td>
                      <td className="text-mute px-2 py-2.5">{f.account}</td>
                      <td className="text-mute px-2 py-2.5">{f.incident}</td>
                      <td className="text-mute px-2 py-2.5">{f.coverage}</td>
                      <td className="px-2 py-2.5">
                        <span className={`rounded-full px-2 py-0.5 text-[10.5px] font-bold ${STATUS_STYLE[f.status]}`}>
                          {f.status}
                        </span>
                      </td>
                      <td className="text-ink px-4 py-2.5 text-right font-bold tabular-nums">{money(f.paid)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* right rail */}
          <section className="flex flex-col gap-3">
            <div className="panel-card p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-ink text-[13.5px] font-bold">Paid, last 9 months</h2>
                <span className="text-faint text-[11px]">monthly</span>
              </div>
              <div className="mt-2">
                <Sparkline points={spendByMonth.map((m) => m.value)} width={300} height={64} />
              </div>
              <div className="text-faint mt-1 flex justify-between text-[10.5px]">
                <span>Jan</span>
                <span>Sep</span>
              </div>
            </div>

            <h2 className="text-ink mt-1 text-[14px] font-bold">Pinned reports</h2>
            {overview.pinned.map((p) => (
              <Link
                key={p.name}
                href={`${p.href}?s=${scenario.id}`}
                className="panel-card hover:border-brand group flex items-start justify-between gap-3 p-4 transition"
              >
                <div>
                  <p className="text-ink text-[13.5px] font-bold">{p.name}</p>
                  <p className="text-mute mt-0.5 text-[12px]">{p.blurb}</p>
                </div>
                <ArrowUpRight className="text-faint group-hover:text-brand mt-0.5 size-4 shrink-0 transition" />
              </Link>
            ))}
            <div className="panel-card bg-tint/60 p-4">
              <p className="text-ink text-[13px] font-bold">Nightly refresh</p>
              <p className="text-mute mt-0.5 text-[12px]">
                Finished at 02:04 with 46 of 46 reports loaded. Next run tonight at 02:00.
              </p>
            </div>
          </section>
        </div>
      </div>
      <Tour scene="home" scenarioId={scenario.id} />
    </>
  );
}

export function HomeView() {
  const state = useAsync(async () => {
    const [overview, claims, spend] = await Promise.all([
      api.overview(),
      api.recentClaims(),
      api.spendSummary(),
    ]);
    return { overview, claims: claims.items, spendByMonth: spend.byMonth };
  });

  return (
    <AppShell tourScene="home">
      <Loadable state={state} label="Loading overview">
        {(data) => <HomeContent {...data} />}
      </Loadable>
    </AppShell>
  );
}
