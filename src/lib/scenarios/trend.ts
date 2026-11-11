import type { Scenario } from "../types";
import { baseSteps } from "./shared";

export const trend: Scenario = {
  id: "trend",
  label: "Prior year trend",
  tagline: "A time question draws this year against last year",
  question: "Monthly paid this year compared with last year",
  typingMs: 2400,
  steps: baseSteps("total_paid by month, current window and the same window last year"),
  outcome: "saved",
  savedTitle: "Monthly paid, year over year",
  insight:
    "Payments run ahead of last year in seven of nine months, with the widest gap in June at $2.41M against $1.78M. The March dip mirrors last year, so it reads as seasonal rather than a slowdown.",
  chart: {
    kind: "line",
    title: "Monthly paid, year over year",
    unit: "currency",
    seriesLabels: ["This year", "Last year"],
    points: [
      { label: "Jan", value: 1_820_000, prior: 1_640_000 },
      { label: "Feb", value: 1_960_000, prior: 1_710_000 },
      { label: "Mar", value: 1_540_000, prior: 1_460_000 },
      { label: "Apr", value: 2_080_000, prior: 1_890_000 },
      { label: "May", value: 2_230_000, prior: 2_040_000 },
      { label: "Jun", value: 2_410_000, prior: 1_780_000 },
      { label: "Jul", value: 2_150_000, prior: 2_210_000 },
      { label: "Aug", value: 2_320_000, prior: 2_060_000 },
      { label: "Sep", value: 2_190_000, prior: 1_950_000 },
    ],
  },
};
