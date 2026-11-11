"""Application factory.

Run with:  uvicorn app.main:create_app --factory --reload
"""

import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.api.v1.system import health_router
from app.core.config import Settings, get_settings
from app.core.errors import register_exception_handlers
from app.core.logging import setup_logging
from app.core.middleware import RequestContextMiddleware
from app.data.store import DataStore

logger = logging.getLogger(__name__)


def create_app(
    settings: Settings | None = None, store: DataStore | None = None
) -> FastAPI:
    settings = settings or get_settings()
    setup_logging(settings.log_level)
    # Validated now, so a bad data file stops the service from starting.
    store = store or DataStore()

    @asynccontextmanager
    async def lifespan(_: FastAPI) -> AsyncIterator[None]:
        logger.info(
            "Starting %s %s (%s), CORS origins: %s",
            settings.app_name,
            settings.app_version,
            settings.environment,
            ", ".join(settings.cors_origins) or "none",
        )
        yield
        logger.info("Shutting down")

    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        lifespan=lifespan,
        docs_url="/docs" if settings.docs_enabled else None,
        redoc_url=None,
        openapi_url="/openapi.json" if settings.docs_enabled else None,
    )
    app.state.settings = settings
    app.state.store = store
    # The last middleware added is the outermost. CORS must wrap everything so
    # that preflight requests and error responses all carry its headers.
    app.add_middleware(RequestContextMiddleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=False,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization", "X-Request-ID"],
        expose_headers=["X-Request-ID"],
    )

    register_exception_handlers(app)
    app.include_router(health_router)
    app.include_router(api_router, prefix=settings.api_prefix)
    return app
