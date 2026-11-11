from typing import Annotated

from fastapi import APIRouter, Depends

from app.api.deps import get_workspace_service
from app.schemas.analytics import Usage
from app.schemas.common import Collection
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
from app.services.workspace import WorkspaceService

router = APIRouter(tags=["workspace"])

Service = Annotated[WorkspaceService, Depends(get_workspace_service)]


@router.get("/workspace", response_model=Persona, summary="Signed-in user and workspace")
def workspace(service: Service) -> Persona:
    return service.persona()


@router.get("/overview", response_model=Overview, summary="Home screen KPIs and pinned reports")
def overview(service: Service) -> Overview:
    return service.overview()


@router.get("/clients", response_model=Collection[Client], summary="Largest accounts")
def clients(service: Service) -> Collection[Client]:
    return Collection(items=service.clients())


@router.get("/claims/recent", response_model=Collection[Claim], summary="Newest claims")
def recent_claims(service: Service) -> Collection[Claim]:
    return Collection(items=service.recent_claims())


@router.get("/reports", response_model=Collection[Report], summary="Report catalog")
def reports(service: Service) -> Collection[Report]:
    return Collection(items=service.reports())


@router.get("/activity", response_model=Collection[ActivityEntry], summary="Workspace activity log")
def activity(service: Service) -> Collection[ActivityEntry]:
    return Collection(items=service.activity())


@router.get("/analytics/usage", response_model=Usage, summary="How the workspace uses the product")
def usage(service: Service) -> Usage:
    return service.usage()


@router.get("/login/preview", response_model=LoginPreview, summary="Figures in the sign in preview")
def login_preview(service: Service) -> LoginPreview:
    return service.login_preview()


@router.get("/settings", response_model=WorkspaceSettings, summary="Workspace defaults and notification preferences")
def settings(service: Service) -> WorkspaceSettings:
    return service.settings()
