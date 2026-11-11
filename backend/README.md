# Stonebridge API

A small, independent FastAPI service that sits beside the Next.js frontend. It
has its own dependencies, configuration and deployment, and the frontend does
not import anything from it. The two only meet over HTTP.

## What it does today

The frontend screens render from their own typed fixtures, and this service
deliberately does not copy that data. It holds the logic that must live on a
server:

| Method | Path | Purpose |
| ------ | ---- | ------- |
| GET | `/health` | Liveness probe for load balancers and deploys |
| GET | `/api/v1/meta` | Service name, version and environment |
| POST | `/api/v1/ask/guard` | Access check: refuses questions that touch protected medical or personal identity fields |
| GET | `/api/v1/ask/policy` | Lists the protected field categories |

There is no database. The service is stateless and never stores or logs the
text of a question.

Interactive docs are served at `/docs` outside production.

### Example

```bash
curl -s localhost:8000/api/v1/ask/guard \
  -H 'Content-Type: application/json' \
  -d '{"question": "Average claimant medical cost by diagnosis"}'
```

```json
{
  "allowed": false,
  "matches": [{ "term": "diagnosis", "category": "medical" }],
  "refusal": {
    "title": "That field is not available",
    "body": "This question refers to medical data, which is excluded from reporting for every role. No query was run."
  }
}
```

### Errors

Every error uses one envelope, including 404, 405 and validation failures:

```json
{ "error": { "code": "validation_error", "message": "...", "request_id": "...", "details": [{ "field": "body.question", "message": "..." }] } }
```

Each response carries an `X-Request-ID` header. The same id appears in every
log line for that request, so a client can quote it when reporting a problem.

## Setup

Requires Python 3.12 or newer.

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt
cp .env.example .env            # optional, defaults work locally
uvicorn app.main:create_app --factory --reload --port 8000
```

Open http://localhost:8000/docs.

## Configuration

Set through environment variables or `backend/.env`:

| Variable | Default | Notes |
| -------- | ------- | ----- |
| `ENVIRONMENT` | `development` | `development`, `test` or `production`. Production disables `/docs` and rejects a wildcard CORS origin |
| `LOG_LEVEL` | `INFO` | `DEBUG`, `INFO`, `WARNING` or `ERROR` |
| `CORS_ORIGINS` | `http://localhost:3000,http://localhost:3100` | Comma separated browser origins allowed to call the API, no trailing slash |

## Tests

```bash
cd backend
python -m pytest
```

## Deployment

The service is a plain ASGI app, so it deploys anywhere that runs a container
or a Python process.

```bash
docker build -t stonebridge-api backend
docker run -p 8000:8000 -e CORS_ORIGINS=https://your-frontend.example stonebridge-api
```

The image runs as an unprivileged user, defaults to `ENVIRONMENT=production`
and has a health check on `/health`. Without a container, run
`uvicorn app.main:create_app --factory --host 0.0.0.0 --port 8000`.

Always set `CORS_ORIGINS` to the exact address the frontend is served from.

## Layout

```
app/
  main.py          App factory: middleware, error handlers, routers
  core/            config, logging, error envelope, request-id middleware
  api/
    deps.py        Shared dependencies
    v1/            Routers only: parse the request, call a service, return
  schemas/         Pydantic request and response models
  services/        Business logic, independent of HTTP
tests/             pytest suite
```

## Adding an endpoint

1. Add request and response models in `app/schemas/`.
2. Put the logic in a class in `app/services/`.
3. Add a router in `app/api/v1/` and include it in `app/api/v1/router.py`.
4. Add the matching function to `src/lib/api.ts` in the frontend.
5. Add tests in `tests/`.

Raise `AppError` from a service for a deliberate client-facing failure and the
error handlers will format it. Reach for a database only when an endpoint needs
to persist something.
