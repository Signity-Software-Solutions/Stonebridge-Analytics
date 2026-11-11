"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { PERSONA } from "@/lib/data";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-hairline flex items-center justify-between border-b px-4 py-3 last:border-0">
      <span className="text-mute text-[13px]">{label}</span>
      <span className="text-ink text-[13px] font-bold">{value}</span>
    </div>
  );
}

function Toggle({ label, sub, initial }: { label: string; sub: string; initial: boolean }) {
  const [on, setOn] = useState(initial);
  return (
    <div className="border-hairline flex items-center justify-between gap-3 border-b px-4 py-3 last:border-0">
      <div>
        <p className="text-ink text-[13px] font-bold">{label}</p>
        <p className="text-faint text-[11.5px]">{sub}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={() => setOn((v) => !v)}
        className={`h-5.5 w-10 shrink-0 cursor-pointer rounded-full p-0.5 transition ${on ? "bg-brand" : "bg-line"}`}
      >
        <span
          className={`block size-4.5 rounded-full bg-white shadow transition-transform ${on ? "translate-x-4.5" : ""}`}
        />
      </button>
    </div>
  );
}

export function SettingsView() {
  return (
    <AppShell tourScene="home">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <h1 className="text-ink text-xl font-bold tracking-tight">Settings</h1>
        <p className="text-mute mt-0.5 text-[13px]">Your profile and the workspace defaults.</p>

        <section className="panel-card mt-5 overflow-hidden">
          <h2 className="text-ink border-hairline border-b px-4 py-3 text-[13px] font-bold">Profile</h2>
          <Row label="Name" value={PERSONA.name} />
          <Row label="Role" value={PERSONA.role} />
          <Row label="Email" value={PERSONA.email} />
          <Row label="Workspace" value={PERSONA.company} />
        </section>

        <section className="panel-card mt-4 overflow-hidden">
          <h2 className="text-ink border-hairline border-b px-4 py-3 text-[13px] font-bold">Workspace defaults</h2>
          <Row label="Currency" value="USD" />
          <Row label="Fiscal year starts" value="January" />
          <Row label="Nightly refresh" value="02:00 local" />
          <Row label="Saved charts visibility" value="Everyone in the workspace" />
        </section>

        <section className="panel-card mt-4 overflow-hidden">
          <h2 className="text-ink border-hairline border-b px-4 py-3 text-[13px] font-bold">Notifications</h2>
          <Toggle label="Refresh digest" sub="One morning note when the nightly load finishes" initial={true} />
          <Toggle label="Saved chart alerts" sub="When someone saves a chart to a report you own" initial={true} />
          <Toggle label="Scope refusals" sub="When a question is refused on a report you own" initial={false} />
        </section>
      </div>
    </AppShell>
  );
}
