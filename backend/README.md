# Stonebridge API

![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=flat-square&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.162-009688?style=flat-square&logo=fastapi&logoColor=white)

The backend for [Stonebridge Analytics](../README.md): a small FastAPI service that is the **single source of data** for the frontend and enforces the **access check** on questions. It has its own dependencies, configuration and deployment, and meets the frontend only over HTTP. It runs on its own; the frontend needs it running.

**Contents:** [Quick start](#quick-start) · [Configuration](#configuration) · [API](#api) · [Access check](#access-check) · [Data](#data) · [Architecture](#architecture) · [Testing](#testing) · [Deployment](#deployment) · [Extending](#adding-an-endpoint) · [Troubleshooting](#troubleshooting)

## Quick start

Requires Python 3.12 or newer. From this directory:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt
cp .env.example .env        # optional: the defaults work locally
uvicorn app.main:create_app --factory --reload --port 8000
```

```bash
curl localhost:8000/health  # {"status":"ok"}
```

Interactive API docs are at <http://localhost:8000/docs>, except when `ENVIRONMENT=production`. Production dependencies are in `requirements.txt`; `requirements-dev.txt` adds the test tools.

## Configuration

Settings come from environment variables or `backend/.env`. Real environment variables win. The `.env` file is read from the directory you start the server in, so run it from `backend/`. No setting is a secret today, and `.env` is git-ignored.

| Variable | Default | Description |
| --- | --- | --- |
| `ENVIRONMENT` | `development` | `development`, `test` or `production`. Production turns off `/docs` and `/openapi.json` and rejects a wildcard CORS origin |
| `LOG_LEVEL` | `INFO` | `DEBUG`, `INFO`, `WARNING` or `ERROR` |
| `CORS_ORIGINS` | `http://localhost:3000,http://localhost:3100` | Comma separated browser origins allowed to call the API, with no trailing slash. Set it to the exact address the frontend is served from |

CORS allows `GET`, `POST` and `OPTIONS` with credentials off, and exposes the `X-Request-ID` header.

## API

Everything is under `/api/v1` except the health probe. All endpoints are read only, apart from the access check, which only evaluates the text it is sent.

| Method | Path | Returns |
| --- | --- | --- |
| GET | `/health` | Liveness probe (unversioned) |
| GET | `/meta` | Service name, version and environment |
| GET | `/workspace` | The signed-in user and workspace |
| GET | `/overview` | Home KPIs and pinned reports |
| GET | `/clients` | Largest accounts |
| GET | `/claims/recent` | Newest claims |
| GET | `/reports` | Report catalog |
| GET | `/activity` | Workspace activity log |
| GET | `/analytics/usage` | Usage tiles and chart series |
| GET | `/spend/summary` | Program Spend KPIs and chart series |
| GET | `/spend/lines` | Program Spend line detail and total row count |
| GET | `/scenarios` | Every scripted Ask question, plus the default |
| GET | `/scenarios/{id}` | One scripted question, or 404 |
| GET | `/ask/context` | Suggestions and earlier exchanges for the Ask screen |
| GET | `/login/preview` | Figures in the sign in preview |
| GET | `/settings` | Workspace defaults and notification preferences |
| POST | `/ask/guard` | Access check for a question |
| GET | `/ask/policy` | The protected field categories |

**Conventions**

- JSON keys are `camelCase`, matching the frontend types in `src/lib/types.ts`. Collection endpoints return an `items` array.
- Every response has an `X-Request-ID` header. A caller may send its own (up to 64 characters of letters, digits, `.`, `_` and `-`); otherwise one is generated. The id appears in every log line for that request.
- Every error uses one envelope, including 404, 405, 422 and 500. Codes include `validation_error`, `not_found`, `method_not_allowed`, `scenario_not_found` and `internal_error`.

```json
{
  "error": {
    "code": "validation_error",
    "message": "The request could not be validated.",
    "request_id": "1e9935cc46ec41edae67cf89dcb659b5",
    "details": [{ "field": "body.question", "message": "String should have at least 1 character" }]
  }
}
```

Logs go to stdout as `time level [request-id] logger: message`, with one access line per request (`/health` at debug level).

## Access check

`POST /api/v1/ask/guard` decides whether a question may run. It is the server-side authority for the protected field policy, so it cannot be bypassed from the browser.

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

- The request is `{"question": "..."}` with 1 to 500 characters after trimming.
- Matching is whole word, and ignores case and extra whitespace. The categories are `medical` (for example diagnosis, prescription, medical records) and `personal_identity` (for example date of birth, home address, passport). The word "medical" alone is allowed, because it is also a spend category.
- An allowed question returns `{"allowed": true, "matches": [], "refusal": null}`.
- The question is never stored or logged, never echoed back, and validation errors report field paths, not values.
- `GET /ask/policy` lists the categories and their descriptions, not the individual terms.

## Data

There is no database. The data is static JSON in `app/data/`, one file per resource. `DataStore` (`app/data/store.py`) reads and validates every file against the Pydantic schemas **when the app starts**, so a malformed or inconsistent file stops the service and the error names the file. The service never writes data.

```text
app/data/
├── persona.json         /workspace
├── overview.json        /overview
├── clients.json         /clients, and the chart in /ask/context
├── claims.json          /claims/recent
├── reports.json         /reports
├── activity.json        /activity
├── usage.json           /analytics/usage
├── spend.json           /spend/summary and /spend/lines
├── scenarios.json       /scenarios
├── ask_context.json     /ask/context
├── login_preview.json   /login/preview
└── settings.json        /settings
```

To change what the app shows, edit a file and **restart**: `--reload` watches Python files only. To use a real data source later, replace `DataStore`; the services, routers and frontend do not change.

## Architecture

```text
app/
├── main.py        App factory: middleware, error handlers, routers
├── core/          Settings, logging, error envelope, request id middleware
├── api/
│   ├── deps.py    Shared dependencies
│   └── v1/        Routers: parse the request, call a service, return
├── schemas/       Pydantic request and response models
├── services/      Business logic, independent of HTTP
└── data/          Static JSON and the DataStore
tests/             pytest suite
```

A request flows router, then service, then `DataStore`. Routers stay thin, services hold the logic, and schemas define the contract. `create_app` builds the settings and the data store once and attaches them to the app, so tests can inject their own. Middleware order puts CORS outermost, which means even a 500 response carries CORS headers and the browser can read the error.

## Testing

```bash
python -m pytest        # from backend/, virtualenv active
```

The suite covers the health and meta endpoints, request ids, the error envelope, CORS, production behavior, the access check, and every data endpoint including its exact JSON shape. It also checks startup validation: malformed, inconsistent and missing data files must each stop the service and name the file.

## Deployment

The service is a plain ASGI app that runs anywhere containers or a Python process do. From the repository root:

```bash
docker build -t stonebridge-api backend
docker run -d --name stonebridge-api -p 8000:8000 \
  -e CORS_ORIGINS=https://your-frontend.example stonebridge-api
```

The image is based on `python:3.12-slim`, runs as an unprivileged user, defaults to `ENVIRONMENT=production`, and has a health check on `/health`. It contains the app and its data but not `.env` files or tests. Without a container, run `uvicorn app.main:create_app --factory --host 0.0.0.0 --port 8000`.

| Task | Command |
| --- | --- |
| Logs | `docker logs -f --tail 100 stonebridge-api` |
| Status and health | `docker ps --filter name=stonebridge-api` |
| Stop, start, restart | `docker stop`, `docker start` or `docker restart stonebridge-api` |
| Pass a settings file | add `--env-file backend/.env` to `docker run` (values must be unquoted) |
| Apply new code or settings | `docker rm -f stonebridge-api`, rebuild, then `docker run` again |

A restart alone does not pick up a new image or changed environment values. In production, set `CORS_ORIGINS` explicitly: a wildcard is rejected and the API docs are off.

## Adding an endpoint

1. Define request and response models in `app/schemas/`.
2. If it needs data, add a JSON file in `app/data/` and load it in `store.py`.
3. Put the logic in a class in `app/services/`.
4. Add a router in `app/api/v1/` and include it in `router.py`.
5. Add the matching types and method to `src/lib/types.ts` and `src/lib/api.ts` in the frontend.
6. Add tests in `tests/`.

Raise `AppError` from a service for a deliberate, client-visible failure and the error handlers format it.

## Troubleshooting

- **CORS error in the browser:** add the frontend's exact origin to `CORS_ORIGINS`, with no trailing slash, and restart.
- **`/docs` returns 404:** `ENVIRONMENT=production` turns the docs off.
- **Exits at startup with `Invalid data file <name>.json`:** that file no longer matches its schema; the message says what to fix.
- **Changes to `.env` or a data file have no effect:** restart the server, or recreate the container.
- **`address already in use`:** another process holds the port. Stop it, or pass a different `--port` and update the frontend's `NEXT_PUBLIC_API_BASE_URL`.
