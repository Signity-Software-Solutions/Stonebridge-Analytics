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
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Sparkline } from "@/components/Sparkline";
import { Tour } from "@/components/Tour";
import { getScenario } from "@/lib/scenarios";
import { PERSONA, RECENT_CLAIMS, SPEND_BY_MONTH, money } from "@/lib/data";

const KPIS = [
  {
    label: "Open claims",
    value: "1,284",
    delta: "+38 this month",
    up: true as boolean | null,
    icon: FolderOpen,
    trend: [1180, 1194, 1201, 1226, 1238, 1246, 1261, 1284],
  },
  {
    label: "Paid this month",
    value: "$2.19M",
    delta: "+6.3% vs August",
    up: true as boolean | null,
    icon: Wallet,
    trend: [1.82, 1.96, 1.54, 2.08, 2.23, 2.41, 2.15, 2.19],
  },
  {
    label: "Questions this week",
    value: "81",
    delta: "+12 on last week",
    up: true as boolean | null,
    icon: MessageCircleQuestion,
    trend: [42, 51, 47, 63, 58, 72, 69, 81],
  },
  {
    label: "Live reports",
    value: "46",
    delta: "refreshed 02:04",
    up: null as boolean | null,
    icon: FileBarChart2,
    trend: [40, 41, 42, 42, 44, 45, 46, 46],
  },
];

const PINNED = [
  { name: "Program Spend", blurb: "Paid by account, region, coverage and category", href: "/reports/program-spend" },
  { name: "Open Reserves", blurb: "Reserve position with aging per account", href: "/reports" },
  { name: "Active Claims", blurb: "Every open claim with incident and status", href: "/reports" },
];

const STATUS_STYLE: Record<string, string> = {
  Open: "bg-ok-soft text-ok",
  Review: "bg-warn-soft text-warn",
  Settled: "bg-pend-soft text-pend",
};

export function HomeView() {
  const scenario = getScenario(useSearchParams().get("s"));

  return (
    <AppShell tourScene="home">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-faint text-[11px] font-bold tracking-[0.14em] uppercase">
              Tuesday, September 29
            </p>
            <h1 className="text-ink mt-0.5 text-xl font-bold tracking-tight">
              Good morning, {PERSONA.name.split(" ")[0]}
            </h1>
            <p className="text-mute mt-0.5 text-[13px]">
              {PERSONA.company} claims program, refreshed overnight.
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
          {KPIS.map((k) => (
            <div key={k.label} className="panel-card p-4">
              <div className="flex items-center justify-between">
                <p className="text-faint text-[11px] font-bold tracking-wide uppercase">{k.label}</p>
                <k.icon className="text-brand size-4" />
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
          ))}
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
                  {RECENT_CLAIMS.map((f) => (
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
                <Sparkline points={SPEND_BY_MONTH.map((m) => m.value)} width={300} height={64} />
              </div>
              <div className="text-faint mt-1 flex justify-between text-[10.5px]">
                <span>Jan</span>
                <span>Sep</span>
              </div>
            </div>

            <h2 className="text-ink mt-1 text-[14px] font-bold">Pinned reports</h2>
            {PINNED.map((p) => (
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
    </AppShell>
  );
}
