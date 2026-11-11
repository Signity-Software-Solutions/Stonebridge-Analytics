from typing import Annotated

from fastapi import APIRouter, Depends

from app.api.deps import get_spend_service
from app.schemas.spend import SpendLines, SpendSummary
from app.services.spend import SpendService

router = APIRouter(prefix="/spend", tags=["spend"])

Service = Annotated[SpendService, Depends(get_spend_service)]


@router.get("/summary", response_model=SpendSummary, summary="Program Spend KPIs and chart series")
def spend_summary(service: Service) -> SpendSummary:
    return service.summary()


@router.get("/lines", response_model=SpendLines, summary="Program Spend line detail")
def spend_lines(service: Service) -> SpendLines:
    return service.lines()
