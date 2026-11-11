"""Request id, access log and last-resort error handling."""

import logging
import re
import time
import uuid

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response

from app.core.errors import error_response
from app.core.logging import request_id_ctx

logger = logging.getLogger("app.access")

# Only accept a caller supplied id if it is short and harmless to log.
_VALID_REQUEST_ID = re.compile(r"^[A-Za-z0-9._-]{1,64}$")


class RequestContextMiddleware(BaseHTTPMiddleware):
    """Tags each request with an id, logs it, and turns crashes into a 500.

    Unhandled exceptions are converted here, inside the CORS middleware, so
    that even a 500 carries CORS headers and the browser can read the error
    instead of reporting an opaque network failure.
    """

    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        incoming = request.headers.get("x-request-id", "")
        request_id = (
            incoming if _VALID_REQUEST_ID.match(incoming) else uuid.uuid4().hex
        )
        request.state.request_id = request_id
        token = request_id_ctx.set(request_id)
        started = time.perf_counter()
        try:
            try:
                response = await call_next(request)
            except Exception:
                logger.exception(
                    "Unhandled error on %s %s", request.method, request.url.path
                )
                response = error_response(
                    500, "internal_error", "An unexpected error occurred.", request_id
                )
            response.headers["X-Request-ID"] = request_id
            elapsed_ms = (time.perf_counter() - started) * 1000
            level = logging.DEBUG if request.url.path == "/health" else logging.INFO
            logger.log(
                level,
                "%s %s -> %d (%.1f ms)",
                request.method,
                request.url.path,
                response.status_code,
                elapsed_ms,
            )
            return response
        finally:
            request_id_ctx.reset(token)
