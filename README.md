# Stonebridge Analytics

Governed claims reporting for corporate insurance programs, with a plain
English question dock on every report.

Stonebridge shows how a risk or finance team can move from "what did we spend
on claims?" to a trustworthy, auditable chart without writing a query. Every
answer is built from approved report fields, every step of the pipeline is
visible, and questions that touch protected data are refused with an
explanation instead of a guess.

The project is two independent apps:

- **Frontend:** a Next.js app that draws the screens. It holds no data of its
  own; every figure, record and scripted question is loaded from the backend.
- **Backend:** a Python FastAPI service in [`backend/`](backend/README.md) that
  serves all of that data over a REST API, and enforces the access check on
  questions. The data is static JSON, with no database.

Each has its own dependencies, configuration and deployment. The frontend
needs the backend running; the backend runs on its own.

## Features

- **Company SSO sign in** leading to the Harborlight Group workspace
- **Overview, report catalog and Program Spend report**, all working screens
  fed by the API
- **Usage, clients, activity and settings** screens for the admin view
- **Ask the data**: a conversational screen where questions become governed
  charts in a chat thread, with save back to the report
- **Ask dock on Program Spend** that plays four questions end to end:
  - `grouped`: a clean build from a clear question
  - `trend`: a prior year comparison
  - `refined`: a vague question rewritten into a precise one
  - `guarded`: a refusal on a protected field
- **Guided tour** anchored to `data-tour` regions, offered once per session
- **Dependency free charts** drawn as inline SVG
- **Reduced motion support**, since every status derives from elapsed time

## Tech stack

- [Next.js](https://nextjs.org/) 16 (App Router, static prerendering)
- [React](https://react.dev/) 19
- [TypeScript](https://www.typescriptlang.org/) 5
- [Tailwind CSS](https://tailwindcss.com/) 4
- [Framer Motion](https://www.framer.com/motion/) for transitions
- [Lucide](https://lucide.dev/) for icons
- [FastAPI](https://fastapi.tiangolo.com/) and [Pydantic](https://docs.pydantic.dev/)
  for the backend, on Python 3.12

## Getting started

### Prerequisites

- Node.js 20.9 or newer and npm 10 or newer
- Python 3.12 or newer

### 1. Start the backend

```bash
git clone <repository-url>
cd stonebridge-analytics/backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements-dev.txt
uvicorn app.main:create_app --factory --reload --port 8000
```

Check it with `curl localhost:8000/health`. Interactive API docs are at
http://localhost:8000/docs. See [backend/README.md](backend/README.md) for the
endpoints, configuration, tests and deployment.

### 2. Start the frontend

In a second terminal, from the repository root:

```bash
cp .env.example .env.local      # points the frontend at http://localhost:8000
npm install
npm run dev
```

Open http://localhost:3000. The app redirects to the sign in screen; choose
"Continue with Harborlight Group SSO" to enter the workspace.

If the backend is not running, the app shows a "Can't reach the Stonebridge API"
message with a Try again button instead of a broken screen.

To use another port:

```bash
npm run dev -- -p 3100
```

The backend allows ports 3000 and 3100 by default. For any other address, add
it to the backend's `CORS_ORIGINS`.

### Deep links

Open the Program Spend report with a specific question already queued:

```
/reports/program-spend?s=grouped
/reports/program-spend?s=trend
/reports/program-spend?s=refined
/reports/program-spend?s=guarded
```

## Configuration

Frontend, in `.env.local` (copy from `.env.example`):

| Variable | Default | Purpose |
| -------- | ------- | ------- |
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:8000` | Where the browser reaches the backend |

This value is inlined at build time, so rebuild the frontend after changing it
for a deployed site. The backend must also list the frontend's address in its
`CORS_ORIGINS`.

Backend, in `backend/.env` (copy from `backend/.env.example`): `ENVIRONMENT`,
`LOG_LEVEL` and `CORS_ORIGINS`. Both `.env` files are git-ignored; neither app
needs a secret today.

## Scripts

| Command           | What it does                                              |
| ----------------- | --------------------------------------------------------- |
| `npm run dev`     | Start the development server                              |
| `npm run build`   | Production build; must stay clean with all routes static  |
| `npm run start`   | Serve the production build                                |
| `npm run check`   | Repo gates: naming blocklist, banned words and dash rules |

## Project structure

```
src/
  app/            Routes (login, home, reports, ask, analytics, clients,
                  activity, settings)
  components/     Shared UI, app shell, charts, tour and view components;
                  WorkspaceProvider loads the persona and scenarios once,
                  Loadable shows loading and error states
  hooks/          useAsync (data loading), useScriptedTimeline (animation loop)
  lib/
    api.ts        Typed client for the backend, one method per endpoint
    format.ts     Money formatting
    tour.ts       Guided tour captions
    types.ts      Shared types, mirroring backend/app/schemas
backend/          Independent FastAPI service: API, static data, tests
deck/             Case study deck and the scripts used to build it
tools/check.sh    Pre-commit gates
```

## How it works

- The backend serves one script per question (`GET /api/v1/scenarios`): the
  text, the pipeline steps with durations, and the chart or refusal it ends in.
  Each screen loads its data from the API through `src/lib/api.ts`, and repeat
  requests in a session are answered from a small in-memory cache.
- `src/hooks/useScriptedTimeline.ts` plays each run from a single
  `requestAnimationFrame` loop. Every status derives from elapsed time, so
  skip, replay and reduced motion need no extra code.
- The active scenario travels in the `?s=` query param and scenes remount off
  it, so switching questions restarts the run cleanly.
- Charts are inline SVG with no charting library.

## Case study deck

The `deck/` folder holds the finished case study (`Stonebridge-Case-Study.pptx`
and `.pdf`) plus the scripts that produced it. Rebuilding is optional and is
not needed to run the app.

```bash
# terminal 1: the backend, as in Getting started
# terminal 2: the app, on the port capture.js expects
npm run dev -- -p 3100
# terminal 3
cd deck && npm install
node capture.js                  # screenshots into deck/shots
node deck-stonebridge.js         # after editing SKILL in the file
```

- `capture.js` takes the screenshots with Puppeteer. It expects the app on
  port 3100 and a local Chrome install (edit `executablePath` for your
  platform).
- `deck-stonebridge.js` builds the deck with PptxGenJS. It loads a theme
  helper (`scripts/apply_theme.js`) from a path set in the `SKILL` constant at
  the top of the file; edit that path for your machine.
- `lint_deck.py` checks the generated deck (needs `python-pptx`).

## Deployment

The two apps deploy separately.

- **Frontend:** every route is prerendered as a static shell and loads its data
  in the browser, so it deploys anywhere that serves a Next.js build and needs
  no server runtime. On Vercel, import the repository, set
  `NEXT_PUBLIC_API_BASE_URL` to the deployed backend's address, and deploy.
  Build time does not need the backend.
- **Backend:** build the container from `backend/` (see
  [backend/README.md](backend/README.md)) and host it anywhere that runs
  containers. Set `CORS_ORIGINS` to the frontend's address.

Deploy the backend first so you know the address to give the frontend.

## License

Private project. All rights reserved unless a license file says otherwise.
