/**
 * The shapes the screens render. The data itself is served by the backend
 * (see lib/api.ts); these types mirror backend/app/schemas. A Scenario is the
 * complete script for one question's journey through the Ask dock on a
 * report, from typing to a saved chart or a scope refusal.
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

export interface ScenarioList {
  defaultId: ScenarioId;
  items: Scenario[];
}

/* Workspace data */

/** A list endpoint's body. */
export interface Collection<T> {
  items: T[];
}

/** The signed-in user and the workspace they belong to. */
export interface Persona {
  name: string;
  role: string;
  email: string;
  company: string;
}

export interface Client {
  code: string;
  name: string;
  industry: string;
  regions: number;
  openClaims: number;
  ytdPaid: number;
}

export interface Claim {
  claimNo: string;
  claimant: string;
  account: string;
  incident: string;
  coverage: string;
  status: "Open" | "Review" | "Settled";
  paid: number;
}

export interface Report {
  key: string;
  name: string;
  domain: "Finance" | "Operations" | "Partners";
  owner: string;
  lastOpened: string;
  live: boolean;
}

export interface ActivityEntry {
  time: string;
  user: string;
  action: string;
  target: string;
}

export type KpiId = "open-claims" | "paid-month" | "questions-week" | "live-reports";

export interface Kpi {
  id: KpiId;
  label: string;
  value: string;
  delta: string;
  /** true and false mark a rising or falling figure; null means no direction. */
  up: boolean | null;
  trend: number[];
}

export interface PinnedReport {
  name: string;
  blurb: string;
  href: string;
}

export interface Overview {
  kpis: Kpi[];
  pinned: PinnedReport[];
}

export interface StatTile {
  label: string;
  value: string;
  sub: string;
}

export interface SpendLine {
  claimNo: string;
  account: string;
  category: string;
  detail: string;
  date: string;
  amount: number;
}

export interface SpendSummary {
  kpis: StatTile[];
  byGroup: SeriesPoint[];
  byMonth: SeriesPoint[];
}

export interface SpendLines {
  items: SpendLine[];
  /** Size of the full report; larger than items.length, which is a sample. */
  totalRows: number;
}

export interface Usage {
  tiles: StatTile[];
  questionsPerWeek: SeriesPoint[];
  savesByTeam: SeriesPoint[];
  topReports: SeriesPoint[];
}

export interface LoginPreview {
  metric: { label: string; value: string; trend: number[] };
  question: { text: string; answeredIn: string };
}

export interface NotificationSetting {
  id: string;
  label: string;
  sub: string;
  enabled: boolean;
}

/** Workspace defaults and notification preferences; the profile is the Persona. */
export interface WorkspaceSettings {
  defaults: { label: string; value: string }[];
  notifications: NotificationSetting[];
}

export interface AskHistoryEntry {
  question: string;
  title: string;
  savedTo: string;
  insight: string;
  chart: ChartSpec;
}

export interface AskContext {
  suggestions: string[];
  history: AskHistoryEntry[];
}
