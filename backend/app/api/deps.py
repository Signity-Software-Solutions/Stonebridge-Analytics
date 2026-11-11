"""Dependencies shared by routers."""

from functools import lru_cache

from fastapi import Request

from app.core.config import Settings
from app.services.guard import GuardService


def get_settings(request: Request) -> Settings:
    """The settings this app instance was created with (see create_app)."""
    return request.app.state.settings


@lru_cache
def get_guard_service() -> GuardService:
    return GuardService()
