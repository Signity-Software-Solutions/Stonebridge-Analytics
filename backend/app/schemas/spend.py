from app.schemas.charts import SeriesPoint, StatTile
from app.schemas.common import CamelModel


class SpendLine(CamelModel):
    claim_no: str
    account: str
    category: str
    detail: str
    date: str
    amount: float


class SpendSummary(CamelModel):
    kpis: list[StatTile]
    by_group: list[SeriesPoint]
    by_month: list[SeriesPoint]


class SpendLines(CamelModel):
    items: list[SpendLine]
    # Size of the full report. The service holds a sample of it, so this is
    # larger than len(items).
    total_rows: int


class SpendData(CamelModel):
    """What spend.json holds: both responses in one file."""

    kpis: list[StatTile]
    by_group: list[SeriesPoint]
    by_month: list[SeriesPoint]
    total_rows: int
    lines: list[SpendLine]
