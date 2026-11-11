from typing import Annotated

from fastapi import APIRouter, Depends

from app.api.deps import get_scenario_service
from app.schemas.common import ErrorResponse
from app.schemas.scenarios import Scenario, ScenarioList
from app.services.scenarios import ScenarioService

router = APIRouter(prefix="/scenarios", tags=["scenarios"])

Service = Annotated[ScenarioService, Depends(get_scenario_service)]


# exclude_none: a scenario only carries the fields its outcome needs, for
# example a refusal has no chart, so absent fields are left out of the JSON.
@router.get(
    "",
    response_model=ScenarioList,
    response_model_exclude_none=True,
    summary="Every scripted question, plus the default",
)
def list_scenarios(service: Service) -> ScenarioList:
    return service.list()


@router.get(
    "/{scenario_id}",
    response_model=Scenario,
    response_model_exclude_none=True,
    responses={404: {"model": ErrorResponse}},
    summary="One scripted question",
)
def get_scenario(scenario_id: str, service: Service) -> Scenario:
    return service.get(scenario_id)
