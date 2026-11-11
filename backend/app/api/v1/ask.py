from typing import Annotated

from fastapi import APIRouter, Depends

from app.api.deps import get_ask_context_service, get_guard_service
from app.schemas.ask import AskContext, GuardRequest, GuardResponse, PolicyResponse
from app.schemas.common import ErrorResponse
from app.services.ask_context import AskContextService
from app.services.guard import GuardService

router = APIRouter(prefix="/ask", tags=["ask"])

GuardDep = Annotated[GuardService, Depends(get_guard_service)]
ContextDep = Annotated[AskContextService, Depends(get_ask_context_service)]


@router.get(
    "/context",
    response_model=AskContext,
    summary="Suggestions and earlier exchanges shown on the Ask screen",
)
def ask_context(service: ContextDep) -> AskContext:
    return service.context()


@router.post(
    "/guard",
    response_model=GuardResponse,
    responses={422: {"model": ErrorResponse}},
    summary="Check a question against the access policy",
)
def guard_question(payload: GuardRequest, service: GuardDep) -> GuardResponse:
    return service.check(payload.question)


@router.get(
    "/policy",
    response_model=PolicyResponse,
    summary="List the protected field categories",
)
def ask_policy(service: GuardDep) -> PolicyResponse:
    return service.policy()
