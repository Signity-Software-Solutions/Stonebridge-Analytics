"use client";

import { AppShell } from "@/components/AppShell";
import { Loadable } from "@/components/Loadable";
import { useAsync } from "@/hooks/useAsync";
import { api } from "@/lib/api";
import type { ActivityEntry } from "@/lib/types";

function ActivityContent({ activity }: { activity: ActivityEntry[] }) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      <h1 className="text-ink text-xl font-bold tracking-tight">Activity</h1>
      <p className="text-mute mt-0.5 text-[13px]">
        Every question, save, export and refresh in the workspace, newest first.
      </p>

      <section className="panel-card mt-5 overflow-hidden">
        <ul>
          {activity.map((a, i) => (
            <li
              key={`${a.time}-${i}`}
              className="border-hairline hover:bg-hairline/40 flex items-center gap-3 border-b px-4 py-3 last:border-0"
            >
              <span className="text-faint w-20 shrink-0 font-mono text-[11px]">{a.time}</span>
              <span className="bg-brand-strong flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white">
                {a.user === "System"
                  ? "SY"
                  : a.user
                      .split(" ")
                      .map((w) => w[0])
                      .slice(0, 2)
                      .join("")}
              </span>
              <span className="text-ink min-w-0 flex-1 text-[13px]">
                <span className="font-bold">{a.user}</span>{" "}
                <span className="text-mute">{a.action.toLowerCase()}</span>{" "}
                <span className="font-semibold">{a.target}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <p className="text-faint mt-3 text-[12px]">
        The log is append only. Refused questions are recorded with the reason, never with the blocked data.
      </p>
    </div>
  );
}

export function ActivityView() {
  const state = useAsync(() => api.activity());

  return (
    <AppShell tourScene="home">
      <Loadable state={state} label="Loading activity">
        {(data) => <ActivityContent activity={data.items} />}
      </Loadable>
    </AppShell>
  );
}
