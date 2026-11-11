from pydantic import BaseModel, ConfigDict, Field


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
