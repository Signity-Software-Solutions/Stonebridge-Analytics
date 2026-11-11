"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { api } from "@/lib/api";
import type { Persona, Scenario, ScenarioId } from "@/lib/types";
import { useAsync } from "@/hooks/useAsync";
import { ErrorPanel, LoadingPanel } from "./Loadable";

/**
 * Loads the two things every screen needs before it can draw anything, the
 * signed-in persona and the scripted scenarios, once for the whole app. The
 * rest of the data is loaded by the screen that shows it.
 */

interface WorkspaceState {
  persona: Persona;
  scenarios: Scenario[];
  defaultScenarioId: ScenarioId;
  /** The scenario for a ?s= value; falls back to the default for anything else. */
  getScenario: (id: string | null | undefined) => Scenario;
}

const WorkspaceContext = createContext<WorkspaceState | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const state = useAsync(() => Promise.all([api.workspace(), api.scenarios()]));

  const value = useMemo<WorkspaceState | null>(() => {
    if (!state.data) return null;
    const [persona, list] = state.data;
    const fallback = list.items.find((s) => s.id === list.defaultId) ?? list.items[0];
    return {
      persona,
      scenarios: list.items,
      defaultScenarioId: list.defaultId,
      getScenario: (id) => list.items.find((s) => s.id === id) ?? fallback,
    };
  }, [state.data]);

  if (value) {
    return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
  }

  return (
    <div className="theme-app bg-canvas flex min-h-screen items-center justify-center">
      {state.loading || !state.error ? (
        <LoadingPanel label="Loading your workspace" />
      ) : (
        <ErrorPanel error={state.error} onRetry={state.retry} />
      )}
    </div>
  );
}

function useWorkspaceState(): WorkspaceState {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used inside <WorkspaceProvider>");
  return ctx;
}

/** The signed-in user and workspace. */
export function useWorkspace(): Persona {
  return useWorkspaceState().persona;
}

/** The scripted scenarios and a lookup that tolerates a missing or bad ?s=. */
export function useScenarios() {
  const { scenarios, defaultScenarioId, getScenario } = useWorkspaceState();
  return { scenarios, defaultScenarioId, getScenario };
}
