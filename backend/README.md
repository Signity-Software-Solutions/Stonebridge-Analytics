# Stonebridge API

A small, independent FastAPI service that sits beside the Next.js frontend. It
has its own dependencies, configuration and deployment, and the frontend does
not import anything from it. The two only meet over HTTP. It runs on its own;
the frontend needs it running.

## What it does

It is the single source of data for the frontend, which holds none of its own,
and it enforces the access check on questions. All endpoints are read only
except the access check, which only evaluates the text it is sent.

| Method | Path | Returns |
| ------ | ---- | ------- |
| GET | `/health` | Liveness probe for load balancers and deploys |
| GET | `/api/v1/meta` | Service name, version and environment |
| GET | `/api/v1/workspace` | The signed-in user and workspace |
| GET | `/api/v1/overview` | Home KPIs and pinned reports |
| GET | `/api/v1/clients` | Largest accounts |
| GET | `/api/v1/claims/recent` | Newest claims |
| GET | `/api/v1/reports` | Report catalog |
| GET | `/api/v1/activity` | Workspace activity log |
| GET | `/api/v1/analytics/usage` | Usage tiles and charts |
| GET | `/api/v1/spend/summary` | Program Spend KPIs and chart series |
| GET | `/api/v1/spend/lines` | Program Spend line detail and total row count |
| GET | `/api/v1/scenarios` | Every scripted Ask question, plus the default |
| GET | `/api/v1/scenarios/{id}` | One scripted question (404 if unknown) |
| GET | `/api/v1/ask/context` | Suggestions and earlier exchanges on the Ask screen |
| GET | `/api/v1/login/preview` | Figures in the sign in preview |
| GET | `/api/v1/settings` | Workspace defaults and notification preferences |
| POST | `/api/v1/ask/guard` | Access check: refuses questions that touch protected medical or personal identity fields |
| GET | `/api/v1/ask/policy` | Lists the protected field categories |

JSON keys are camelCase, matching the frontend types. List endpoints return
`{ "items": [...] }`.

Interactive docs are served at `/docs` outside production.

## Data

There is no database. The data is static JSON in `app/data/`, one file per
resource. It is read and validated against the Pydantic schemas when the app
starts, so a malformed or inconsistent file stops the service from booting and
the error names the file. The service never writes data, and never stores or
logs the text of a question.

To change what the app shows, edit the JSON file and restart. To move to a real
data source later, replace `DataStore` in `app/data/store.py`; the services,
routers and frontend do not change.

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
  data/            The static JSON files and store.py, which loads and checks them
tests/             pytest suite
```

## Adding an endpoint

1. Add request and response models in `app/schemas/`.
2. If it needs data, add a JSON file in `app/data/` and load it in `store.py`.
3. Put the logic in a class in `app/services/`.
4. Add a router in `app/api/v1/` and include it in `app/api/v1/router.py`.
5. Add the matching types and function to `src/lib/types.ts` and
   `src/lib/api.ts` in the frontend.
6. Add tests in `tests/`.

Raise `AppError` from a service for a deliberate client-facing failure and the
error handlers will format it. Reach for a database only when an endpoint needs
to persist something.
