import type { Scenario, ScenarioId } from "../types";
import { grouped } from "./grouped";
import { guarded } from "./guarded";
import { refined } from "./refined";
import { trend } from "./trend";

export const SCENARIOS: Scenario[] = [grouped, trend, refined, guarded];

export const DEFAULT_SCENARIO: ScenarioId = "grouped";

export function getScenario(id: string | null | undefined): Scenario {
  return SCENARIOS.find((s) => s.id === id) ?? SCENARIOS[0];
}
