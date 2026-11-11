from app.data.store import DataStore
from app.schemas.ask import AskContext, AskHistoryEntry
from app.schemas.charts import ChartSpec, SeriesPoint


class AskContextService:
    def __init__(self, store: DataStore) -> None:
        self._store = store

    def context(self) -> AskContext:
        ranked = sorted(self._store.clients, key=lambda c: c.ytd_paid, reverse=True)
        history = [
            AskHistoryEntry(
                question=entry.question,
                title=entry.title,
                saved_to=entry.saved_to,
                insight=entry.insight,
                chart=ChartSpec(
                    kind="bars",
                    title=entry.title,
                    unit="currency",
                    points=[
                        SeriesPoint(label=c.name, value=c.ytd_paid)
                        for c in ranked[: entry.top_clients]
                    ],
                ),
            )
            for entry in self._store.ask_context.history
        ]
        return AskContext(
            suggestions=self._store.ask_context.suggestions, history=history
        )
