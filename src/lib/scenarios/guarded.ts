import type { Scenario } from "../types";

/** The out of scope question: the access check stops the run before any
 *  query fires, explains why, and offers a question that would work. */
export const guarded: Scenario = {
  id: "guarded",
  label: "Out of scope",
  tagline: "A protected field is refused before any query runs",
  question: "Average claimant medical cost by diagnosis",
  typingMs: 2300,
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
      detail: "diagnosis is a medical field, not a program spend dimension",
      durationMs: 1500,
    },
    {
      id: "scope",
      label: "Checking access scope",
      detail: "Medical and personal fields are excluded from every report",
      durationMs: 1300,
    },
  ],
  outcome: "refused",
  refusal: {
    title: "That field is not available here",
    body: "Diagnosis belongs to medical data, which is excluded from reporting for every role in this workspace. No query was run and nothing was logged against the claimant records.",
    suggestion: "Average paid per claim by claim category",
  },
};
