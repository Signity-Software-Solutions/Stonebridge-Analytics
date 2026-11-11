"""Shapes shared by every endpoint."""

from typing import Generic, TypeVar

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel

T = TypeVar("T")


class CamelModel(BaseModel):
    """Python code uses snake_case; the JSON the frontend reads is camelCase."""

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)


class Collection(CamelModel, Generic[T]):
    """A list endpoint's body. Wrapping the list leaves room to add fields later."""

    items: list[T]


class ErrorDetail(BaseModel):
    field: str
    message: str


class ErrorBody(BaseModel):
    code: str
    message: str
    request_id: str | None = None
    details: list[ErrorDetail] | None = None


class ErrorResponse(BaseModel):
    """Every error the API returns uses this envelope."""

    error: ErrorBody
