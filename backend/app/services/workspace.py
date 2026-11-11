"""Reads for the workspace screens: overview, clients, claims, reports, activity, usage."""

from app.data.store import DataStore
from app.schemas.analytics import Usage
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


class WorkspaceService:
    def __init__(self, store: DataStore) -> None:
        self._store = store

    def persona(self) -> Persona:
        return self._store.persona

    def overview(self) -> Overview:
        return self._store.overview

    def clients(self) -> list[Client]:
        return self._store.clients

    def recent_claims(self) -> list[Claim]:
        return self._store.claims

    def reports(self) -> list[Report]:
        return self._store.reports

    def activity(self) -> list[ActivityEntry]:
        return self._store.activity

    def usage(self) -> Usage:
        return self._store.usage

    def login_preview(self) -> LoginPreview:
        return self._store.login_preview

    def settings(self) -> WorkspaceSettings:
        return self._store.settings
