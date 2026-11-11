from typing import Literal

from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: Literal["ok"]


class MetaResponse(BaseModel):
    name: str
    version: str
    environment: str
