from fastapi import APIRouter

from app.api.v1 import ask, system

api_router = APIRouter()
api_router.include_router(system.router)
api_router.include_router(ask.router)
