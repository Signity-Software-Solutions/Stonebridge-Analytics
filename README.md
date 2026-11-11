# Stonebridge Analytics

Governed claims reporting for corporate insurance programs, with a plain
English question dock on every report.

Stonebridge shows how a risk or finance team can move from "what did we spend
on claims?" to a trustworthy, auditable chart without writing a query. Every
answer is built from approved report fields, every step of the pipeline is
visible, and questions that touch protected data are refused with an
explanation instead of a guess.

The whole product runs in the browser on typed fixtures and scripted timers.
There is no backend, no database, no API keys and no environment variables.
Every route is prerendered static.

## Features

- **Company SSO sign in** leading to the Harborlight Group workspace
- **Overview, report catalog and Program Spend report**, all working screens
  on static data
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

## Getting started

### Prerequisites

- Node.js 20.9 or newer
- npm 10 or newer

### Install and run

```bash
git clone <repository-url>
cd stonebridge-analytics
npm install
npm run dev
```

Open http://localhost:3000. The app redirects to the sign in screen; choose
"Continue with Harborlight Group SSO" to enter the workspace.

To use another port:

```bash
npm run dev -- -p 3100
```

### Deep links

Open the Program Spend report with a specific question already queued:

```
/reports/program-spend?s=grouped
/reports/program-spend?s=trend
/reports/program-spend?s=refined
/reports/program-spend?s=guarded
```

## Configuration

None required. The app reads no environment variables and talks to no
external service, so there is nothing to configure and no `.env` file to
create. All content comes from typed fixtures in `src/lib/`.

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
  components/     Shared UI, app shell, charts, tour and view components
  hooks/          useScriptedTimeline, the single animation loop
  lib/
    data.ts       Typed fixtures for the workspace
    scenarios/    One typed script per question
    tour.ts       Guided tour steps
    types.ts      Shared types
deck/             Case study deck and the scripts used to build it
tools/check.sh    Pre-commit gates
```

## How it works

- `src/lib/scenarios/` holds one typed script per question: the text, the
  pipeline steps with durations, and the chart or refusal it ends in.
- `src/hooks/useScriptedTimeline.ts` drives each run from a single
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
npm run dev -- -p 3100           # terminal 1: the app, on the port capture.js expects
cd deck && npm install           # terminal 2
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

The app is fully static, so it deploys anywhere that serves a Next.js build.
On Vercel, import the repository and accept the defaults: no environment
variables, no build flags and no server runtime are needed. `npm run build`
is the whole story.

## License

Private project. All rights reserved unless a license file says otherwise.
