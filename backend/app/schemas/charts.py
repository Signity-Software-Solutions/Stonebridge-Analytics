"""Shapes shared by several screens: chart points and stat tiles."""

from typing import Literal

from pydantic import Field

from app.schemas.common import CamelModel


class SeriesPoint(CamelModel):
    label: str
    value: float
    # Second series value, for charts that compare against the prior year.
    # Left out of the JSON when unset: the charts test for presence, not null.
    prior: float | None = Field(default=None, exclude_if=lambda v: v is None)


class ChartSpec(CamelModel):
    kind: Literal["donut", "bars", "columns", "line"]
    title: str
    unit: Literal["currency", "count"]
    points: list[SeriesPoint]
    # Legend labels when two series are drawn. Left out of the JSON when unset.
    series_labels: tuple[str, str] | None = Field(
        default=None, exclude_if=lambda v: v is None
    )


class StatTile(CamelModel):
    label: str
    value: str
    sub: str
