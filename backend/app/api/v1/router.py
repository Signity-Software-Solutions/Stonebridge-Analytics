from fastapi import APIRouter

from app.api.v1 import ask, scenarios, spend, system, workspace

api_router = APIRouter()
api_router.include_router(system.router)
api_router.include_router(workspace.router)
api_router.include_router(spend.router)
api_router.include_router(scenarios.router)
api_router.include_router(ask.router)
