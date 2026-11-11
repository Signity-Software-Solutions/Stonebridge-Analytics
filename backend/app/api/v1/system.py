from typing import Annotated

from fastapi import APIRouter, Depends

from app.api.deps import Settings, get_settings
from app.schemas.system import HealthResponse, MetaResponse

# Unversioned and mounted at the root: load balancers and deploy tooling probe it.
health_router = APIRouter(tags=["system"])
router = APIRouter(tags=["system"])


@health_router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(status="ok")


@router.get("/meta", response_model=MetaResponse)
def meta(settings: Annotated[Settings, Depends(get_settings)]) -> MetaResponse:
    return MetaResponse(
        name=settings.app_name,
        version=settings.app_version,
        environment=settings.environment,
    )
