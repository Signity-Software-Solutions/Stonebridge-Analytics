"""The static data behind every endpoint.

The data lives in the JSON files next to this module. It is read and checked
once, when the app starts, so a malformed file stops the service from booting
instead of failing a request later. There is no database: replacing this class
with one that reads from a real source is the only change a database needs.
"""

from pathlib import Path
from typing import Any

from pydantic import TypeAdapter, ValidationError

from app.schemas.analytics import Usage
from app.schemas.ask import AskContextData
from app.schemas.scenarios import ScenarioList
from app.schemas.spend import SpendData
from app.schemas.workspace import (
    ActivityEntry,
    Claim,
    Client,
    LoginPreview,
    Overview,
    Persona,
    Report,
    WorkspaceSettings,
)

DATA_DIR = Path(__file__).parent


def _load(directory: Path, filename: str, schema: Any) -> Any:
    path = directory / filename
    try:
        return TypeAdapter(schema).validate_json(path.read_bytes())
    except (OSError, ValidationError) as exc:
        raise RuntimeError(f"Invalid data file {filename}: {exc}") from exc


class DataStore:
    def __init__(self, directory: Path = DATA_DIR) -> None:
        self.persona: Persona = _load(directory, "persona.json", Persona)
        self.clients: list[Client] = _load(directory, "clients.json", list[Client])
        self.claims: list[Claim] = _load(directory, "claims.json", list[Claim])
        self.reports: list[Report] = _load(directory, "reports.json", list[Report])
        self.activity: list[ActivityEntry] = _load(
            directory, "activity.json", list[ActivityEntry]
        )
        self.overview: Overview = _load(directory, "overview.json", Overview)
        self.login_preview: LoginPreview = _load(
            directory, "login_preview.json", LoginPreview
        )
        self.settings: WorkspaceSettings = _load(directory, "settings.json", WorkspaceSettings)
        self.spend: SpendData = _load(directory, "spend.json", SpendData)
        self.usage: Usage = _load(directory, "usage.json", Usage)
        self.scenarios: ScenarioList = _load(directory, "scenarios.json", ScenarioList)
        self.ask_context: AskContextData = _load(
            directory, "ask_context.json", AskContextData
        )

        self._check_consistency()

    def _check_consistency(self) -> None:
        ids = [s.id for s in self.scenarios.items]
        if len(set(ids)) != len(ids):
            raise RuntimeError("Invalid data file scenarios.json: duplicate scenario ids")
        if self.scenarios.default_id not in ids:
            raise RuntimeError("Invalid data file scenarios.json: defaultId is not a scenario")
        keys = [r.key for r in self.reports]
        if len(set(keys)) != len(keys):
            raise RuntimeError("Invalid data file reports.json: duplicate report keys")
