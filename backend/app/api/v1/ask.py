from typing import Annotated

from fastapi import APIRouter, Depends

from app.api.deps import get_guard_service
from app.schemas.ask import GuardRequest, GuardResponse, PolicyResponse
from app.schemas.common import ErrorResponse
from app.services.guard import GuardService

router = APIRouter(prefix="/ask", tags=["ask"])

GuardDep = Annotated[GuardService, Depends(get_guard_service)]


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
