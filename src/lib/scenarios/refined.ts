import type { Scenario } from "../types";

/** The ambiguous question: the assistant notices the ask is too broad,
 *  rewrites it with a concrete limit, and says so before drawing. */
export const refined: Scenario = {
  id: "refined",
  label: "Refined question",
  tagline: "A vague ask gets rewritten into a concrete one",
  question: "Which regions cost the most",
  typingMs: 1700,
  refinedQuestion: "Top 8 regions by total paid, this fiscal year",
  steps: [
    {
      id: "context",
      label: "Reading report context",
      detail: "Program Spend: 14 measures, 9 dimensions, fiscal year window",
      durationMs: 1100,
    },
    {
      id: "match",
      label: "Matching measures and dimensions",
      detail: "cost maps to total_paid; regions has 48 members",
      durationMs: 1400,
    },
    {
      id: "refine",
      label: "Refining the question",
      detail: "48 regions would not read as a chart. Limiting to the top 8 by paid amount.",
      durationMs: 1700,
    },
    {
      id: "scope",
      label: "Checking access scope",
      detail: "Workspace: Harborlight Group, all accounts",
      durationMs: 800,
    },
    {
      id: "query",
      label: "Running the query",
      detail: "Warehouse round trip, read only",
      durationMs: 1500,
    },
    {
      id: "draw",
      label: "Drawing the chart",
      detail: "Ranked bars, highest first",
      durationMs: 900,
    },
  ],
  outcome: "saved",
  savedTitle: "Top 8 regions by paid",
  insight:
    "Gulf Coast leads at $3.42M, almost a third more than the next region. The top 8 of 48 regions carry 61% of all program spend, so the long tail is real but thin.",
  chart: {
    kind: "bars",
    title: "Top 8 regions by paid",
    unit: "currency",
    points: [
      { label: "Gulf Coast", value: 3_421_000 },
      { label: "Southeast", value: 2_604_500 },
      { label: "Midwest", value: 2_212_800 },
      { label: "Northeast", value: 1_875_200 },
      { label: "Pacific", value: 1_542_600 },
      { label: "Texas", value: 1_327_900 },
      { label: "Mountain West", value: 1_019_400 },
      { label: "Great Lakes", value: 894_100 },
    ],
  },
};
