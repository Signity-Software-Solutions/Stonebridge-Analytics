"""Dependencies shared by routers."""

from functools import lru_cache
from typing import Annotated

from fastapi import Depends, Request

from app.core.config import Settings
from app.data.store import DataStore
from app.services.ask_context import AskContextService
from app.services.guard import GuardService
from app.services.scenarios import ScenarioService
from app.services.spend import SpendService
from app.services.workspace import WorkspaceService


def get_settings(request: Request) -> Settings:
    """The settings this app instance was created with (see create_app)."""
    return request.app.state.settings


def get_store(request: Request) -> DataStore:
    """The data this app instance was created with (see create_app)."""
    return request.app.state.store


StoreDep = Annotated[DataStore, Depends(get_store)]


@lru_cache
def get_guard_service() -> GuardService:
    return GuardService()


def get_workspace_service(store: StoreDep) -> WorkspaceService:
    return WorkspaceService(store)


def get_spend_service(store: StoreDep) -> SpendService:
    return SpendService(store)


def get_scenario_service(store: StoreDep) -> ScenarioService:
    return ScenarioService(store)


def get_ask_context_service(store: StoreDep) -> AskContextService:
    return AskContextService(store)
