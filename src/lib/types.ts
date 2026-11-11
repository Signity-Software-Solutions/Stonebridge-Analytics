/**
 * Every screen renders from these fixtures. There is no backend: a Scenario
 * is the complete script for one question's journey through the Ask dock on
 * a report, from typing to a saved chart or a scope refusal.
 */

export type ScenarioId = "grouped" | "trend" | "refined" | "guarded";

/** Runtime status of one timeline step; derived from elapsed time, never stored. */
export type StepStatus = "pending" | "processing" | "completed";

export interface AskStep {
  id: string;
  label: string;
  detail: string;
  durationMs: number;
}

export interface SeriesPoint {
  label: string;
  value: number;
  /** Second series value, for charts that compare against the prior year. */
  prior?: number;
}

export interface ChartSpec {
  kind: "donut" | "bars" | "columns" | "line";
  title: string;
  unit: "currency" | "count";
  points: SeriesPoint[];
  /** Legend labels when two series are drawn. */
  seriesLabels?: [string, string];
}

export interface Refusal {
  title: string;
  body: string;
  suggestion: string;
}

export interface Scenario {
  id: ScenarioId;
  /** Picker copy. */
  label: string;
  tagline: string;
  /** The question typed into the dock, character by character. */
  question: string;
  typingMs: number;
  /** Pipeline steps that run after the question is sent. */
  steps: AskStep[];
  outcome: "saved" | "refused";
  /** Shown at the step named "refine": the dock swaps to this wording. */
  refinedQuestion?: string;
  chart?: ChartSpec;
  insight?: string;
  savedTitle?: string;
  refusal?: Refusal;
}
