from app.schemas.charts import SeriesPoint, StatTile
from app.schemas.common import CamelModel


class Usage(CamelModel):
    tiles: list[StatTile]
    questions_per_week: list[SeriesPoint]
    saves_by_team: list[SeriesPoint]
    top_reports: list[SeriesPoint]
