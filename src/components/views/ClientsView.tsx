"use client";

import { AppShell } from "@/components/AppShell";
import { CLIENTS, money } from "@/lib/data";

export function ClientsView() {
  const total = CLIENTS.reduce((s, c) => s + c.ytdPaid, 0);

  return (
    <AppShell tourScene="home">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <h1 className="text-ink text-xl font-bold tracking-tight">Clients</h1>
        <p className="text-mute mt-0.5 text-[13px]">
          The ten largest of 24 insured accounts, by paid this fiscal year.
        </p>

        <section className="panel-card mt-5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-faint border-hairline border-b text-left text-[10.5px] tracking-wider uppercase">
                  <th className="px-4 py-2.5 font-bold">Code</th>
                  <th className="px-2 py-2.5 font-bold">Account</th>
                  <th className="px-2 py-2.5 font-bold">Industry</th>
                  <th className="px-2 py-2.5 text-right font-bold">Regions</th>
                  <th className="px-2 py-2.5 text-right font-bold">Open claims</th>
                  <th className="px-4 py-2.5 text-right font-bold">Paid YTD</th>
                </tr>
              </thead>
              <tbody>
                {CLIENTS.map((c) => (
                  <tr key={c.code} className="border-hairline hover:bg-hairline/40 border-b last:border-0">
                    <td className="text-brand px-4 py-3 font-mono text-[11.5px] font-bold">{c.code}</td>
                    <td className="text-ink px-2 py-3 font-bold">{c.name}</td>
                    <td className="text-mute px-2 py-3">{c.industry}</td>
                    <td className="text-mute px-2 py-3 text-right tabular-nums">{c.regions}</td>
                    <td className="text-mute px-2 py-3 text-right tabular-nums">{c.openClaims}</td>
                    <td className="text-ink px-4 py-3 text-right font-bold tabular-nums">{money(c.ytdPaid)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-hairline border-t">
                  <td colSpan={5} className="text-faint px-4 py-2.5 text-[11px]">
                    Top 10 of 24 accounts
                  </td>
                  <td className="text-ink px-4 py-2.5 text-right font-bold tabular-nums">{money(total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
