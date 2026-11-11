"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Loadable } from "@/components/Loadable";
import { useWorkspace } from "@/components/WorkspaceProvider";
import { useAsync } from "@/hooks/useAsync";
import { api } from "@/lib/api";
import type { WorkspaceSettings } from "@/lib/types";

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

function SettingsContent({ settings }: { settings: WorkspaceSettings }) {
  const persona = useWorkspace();

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <h1 className="text-ink text-xl font-bold tracking-tight">Settings</h1>
      <p className="text-mute mt-0.5 text-[13px]">Your profile and the workspace defaults.</p>

      <section className="panel-card mt-5 overflow-hidden">
        <h2 className="text-ink border-hairline border-b px-4 py-3 text-[13px] font-bold">Profile</h2>
        <Row label="Name" value={persona.name} />
        <Row label="Role" value={persona.role} />
        <Row label="Email" value={persona.email} />
        <Row label="Workspace" value={persona.company} />
      </section>

      <section className="panel-card mt-4 overflow-hidden">
        <h2 className="text-ink border-hairline border-b px-4 py-3 text-[13px] font-bold">Workspace defaults</h2>
        {settings.defaults.map((d) => (
          <Row key={d.label} label={d.label} value={d.value} />
        ))}
      </section>

      <section className="panel-card mt-4 overflow-hidden">
        <h2 className="text-ink border-hairline border-b px-4 py-3 text-[13px] font-bold">Notifications</h2>
        {settings.notifications.map((n) => (
          <Toggle key={n.id} label={n.label} sub={n.sub} initial={n.enabled} />
        ))}
      </section>
    </div>
  );
}

export function SettingsView() {
  const state = useAsync(() => api.settings());

  return (
    <AppShell tourScene="home">
      <Loadable state={state} label="Loading settings">
        {(settings) => <SettingsContent settings={settings} />}
      </Loadable>
    </AppShell>
  );
}
