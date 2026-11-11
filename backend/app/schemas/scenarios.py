"""The scripted Ask journeys. Each is the complete script for one question."""

from typing import Literal

from app.schemas.charts import ChartSpec
from app.schemas.common import CamelModel

ScenarioId = Literal["grouped", "trend", "refined", "guarded"]


class ScenarioStep(CamelModel):
    id: str
    label: str
    detail: str
    duration_ms: int


class ScenarioRefusal(CamelModel):
    title: str
    body: str
    suggestion: str


class Scenario(CamelModel):
    id: ScenarioId
    # Picker copy.
    label: str
    tagline: str
    # The question typed into the dock, character by character.
    question: str
    typing_ms: int
    steps: list[ScenarioStep]
    outcome: Literal["saved", "refused"]
    # Shown at the step named "refine": the dock swaps to this wording.
    refined_question: str | None = None
    chart: ChartSpec | None = None
    insight: str | None = None
    saved_title: str | None = None
    refusal: ScenarioRefusal | None = None


class ScenarioList(CamelModel):
    default_id: ScenarioId
    items: list[Scenario]
