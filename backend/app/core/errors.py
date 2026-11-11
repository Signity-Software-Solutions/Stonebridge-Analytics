"""One error envelope for the whole API.

Domain code raises AppError. Framework errors (404, 405, validation) are
converted to the same shape, so clients only ever parse one format.
"""

import logging
from http import HTTPStatus

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.schemas.common import ErrorBody, ErrorDetail, ErrorResponse

logger = logging.getLogger(__name__)


class AppError(Exception):
    """A deliberate, client-visible failure."""

    def __init__(
        self,
        message: str,
        *,
        status_code: int = 400,
        code: str = "bad_request",
        details: list[ErrorDetail] | None = None,
    ) -> None:
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.code = code
        self.details = details


def error_response(
    status_code: int,
    code: str,
    message: str,
    request_id: str | None,
    details: list[ErrorDetail] | None = None,
    headers: dict[str, str] | None = None,
) -> JSONResponse:
    body = ErrorResponse(
        error=ErrorBody(
            code=code, message=message, request_id=request_id, details=details
        )
    )
    return JSONResponse(
        status_code=status_code,
        content=body.model_dump(mode="json", exclude_none=True),
        headers=headers,
    )


def _request_id(request: Request) -> str | None:
    return getattr(request.state, "request_id", None)


_HTTP_CODES = {404: "not_found", 405: "method_not_allowed"}


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppError)
    async def handle_app_error(request: Request, exc: AppError) -> JSONResponse:
        return error_response(
            exc.status_code, exc.code, exc.message, _request_id(request), exc.details
        )

    @app.exception_handler(StarletteHTTPException)
    async def handle_http_error(
        request: Request, exc: StarletteHTTPException
    ) -> JSONResponse:
        message = (
            exc.detail
            if isinstance(exc.detail, str)
            else HTTPStatus(exc.status_code).phrase
        )
        return error_response(
            exc.status_code,
            _HTTP_CODES.get(exc.status_code, "http_error"),
            message,
            _request_id(request),
            headers=dict(exc.headers) if exc.headers else None,
        )

    @app.exception_handler(RequestValidationError)
    async def handle_validation_error(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        # Field paths and messages only: the submitted values are never echoed,
        # because a question can contain sensitive text.
        details = [
            ErrorDetail(field=".".join(str(p) for p in err["loc"]), message=err["msg"])
            for err in exc.errors()
        ]
        return error_response(
            422,
            "validation_error",
            "The request could not be validated.",
            _request_id(request),
            details,
        )
