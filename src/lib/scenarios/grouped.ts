import type { Scenario } from "../types";
import { baseSteps } from "./shared";

export const grouped: Scenario = {
  id: "grouped",
  label: "Clean build",
  tagline: "A clear question lands as a chart on the first pass",
  question: "Paid by claim category this fiscal year",
  typingMs: 2100,
  steps: baseSteps("total_paid by claim_category, fiscal year to date"),
  outcome: "saved",
  savedTitle: "Paid by claim category",
  insight:
    "Property damage carries 38% of program spend this year at $7.9M, with medical close behind at $6.4M. The two together outweigh every other category combined.",
  chart: {
    kind: "donut",
    title: "Paid by claim category",
    unit: "currency",
    points: [
      { label: "Property damage", value: 7_912_400 },
      { label: "Medical", value: 6_438_900 },
      { label: "Liability", value: 3_206_750 },
      { label: "Business interruption", value: 2_118_300 },
      { label: "Legal costs", value: 1_021_600 },
    ],
  },
};
