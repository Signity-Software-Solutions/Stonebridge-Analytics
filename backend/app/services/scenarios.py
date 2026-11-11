from app.core.errors import AppError
from app.data.store import DataStore
from app.schemas.scenarios import Scenario, ScenarioList


class ScenarioService:
    def __init__(self, store: DataStore) -> None:
        self._store = store

    def list(self) -> ScenarioList:
        return self._store.scenarios

    def get(self, scenario_id: str) -> Scenario:
        for scenario in self._store.scenarios.items:
            if scenario.id == scenario_id:
                return scenario
        raise AppError(
            f"No scenario with id '{scenario_id}'.",
            status_code=404,
            code="scenario_not_found",
        )
