from pydantic import BaseModel, ConfigDict, Field

from app.schemas.charts import ChartSpec
from app.schemas.common import CamelModel


class GuardRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    question: str = Field(min_length=1, max_length=500)


class GuardMatch(BaseModel):
    term: str
    category: str


class Refusal(BaseModel):
    title: str
    body: str


class GuardResponse(BaseModel):
    """Outcome of the access check. The question itself is never echoed back."""

    allowed: bool
    matches: list[GuardMatch]
    refusal: Refusal | None = None


class PolicyCategory(BaseModel):
    category: str
    label: str
    description: str


class PolicyResponse(BaseModel):
    protected: list[PolicyCategory]


class AskHistorySource(CamelModel):
    """An earlier exchange as stored. Its chart is built from the clients data."""

    question: str
    title: str
    saved_to: str
    insight: str
    top_clients: int


class AskContextData(CamelModel):
    """What ask_context.json holds."""

    suggestions: list[str]
    history: list[AskHistorySource]


class AskHistoryEntry(CamelModel):
    question: str
    title: str
    saved_to: str
    insight: str
    chart: ChartSpec


class AskContext(CamelModel):
    """Everything the Ask screen shows around the live question."""

    suggestions: list[str]
    history: list[AskHistoryEntry]
