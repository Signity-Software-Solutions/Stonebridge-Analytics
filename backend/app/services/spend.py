from app.data.store import DataStore
from app.schemas.spend import SpendLines, SpendSummary


class SpendService:
    def __init__(self, store: DataStore) -> None:
        self._store = store

    def summary(self) -> SpendSummary:
        spend = self._store.spend
        return SpendSummary(
            kpis=spend.kpis, by_group=spend.by_group, by_month=spend.by_month
        )

    def lines(self) -> SpendLines:
        spend = self._store.spend
        return SpendLines(items=spend.lines, total_rows=spend.total_rows)
