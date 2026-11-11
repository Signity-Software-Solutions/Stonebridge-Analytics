"use client";

import { usePathname, useRouter } from "next/navigation";
import type { ScenarioId } from "@/lib/types";
import { useScenarios } from "./WorkspaceProvider";

/**
 * The four question pills. Switching replaces ?s= in place; the scene keys
 * its animation on the scenario id, so the run restarts cleanly.
 */
export function ScenarioPicker({ current }: { current: ScenarioId }) {
  const router = useRouter();
  const pathname = usePathname();
  const { scenarios } = useScenarios();

  return (
    <div
      data-tour="scenario-picker"
      className="flex flex-wrap items-center gap-1.5"
      role="group"
      aria-label="Choose a saved question"
    >
      {scenarios.map((s) => {
        const active = s.id === current;
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => router.replace(`${pathname}?s=${s.id}`)}
            title={s.tagline}
            className={`cursor-pointer rounded-full border px-3 py-1 text-[11px] font-bold tracking-wide whitespace-nowrap transition ${
              active
                ? "border-brand bg-brand text-white shadow-sm"
                : "border-line text-mute hover:border-brand hover:text-ink bg-transparent"
            }`}
          >
            {s.label}
          </button>
        );
      })}
    </div>
  );
}
