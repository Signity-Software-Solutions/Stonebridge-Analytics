import type { AskStep } from "../types";

/** The pipeline stages every question passes through, with per-scenario
 *  wording layered on top. Durations are tuned so a full run reads well
 *  without dragging. */
export function baseSteps(query: string): AskStep[] {
  return [
    {
      id: "context",
      label: "Reading report context",
      detail: "Program Spend: 14 measures, 9 dimensions, fiscal year window",
      durationMs: 1100,
    },
    {
      id: "match",
      label: "Matching measures and dimensions",
      detail: query,
      durationMs: 1400,
    },
    {
      id: "scope",
      label: "Checking access scope",
      detail: "Workspace: Harborlight Group, all accounts",
      durationMs: 900,
    },
    {
      id: "query",
      label: "Running the query",
      detail: "Warehouse round trip, read only",
      durationMs: 1600,
    },
    {
      id: "draw",
      label: "Drawing the chart",
      detail: "Choosing a shape that fits the result",
      durationMs: 900,
    },
  ];
}
