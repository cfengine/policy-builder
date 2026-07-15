# CFEngine Policy Builder

Desktop application for building CFEngine policy.

**Stack:** 
 - Electron 
 - React
 - TypeScript
 - MUI

## Requirements

- Node.js 22.12+
- npm 10+

## Getting started

```sh
npm install
npm run dev # launches Electron app
```

## Project structure

electron-vite builds three targets from `src/`:

```
src/
├── main/      # Electron main process: window creation, ipcMain handlers
├── preload/   # contextBridge exposing `window.api`
└── renderer/  # React app
```

## Scripts

| Script                  | What it does                                               |
| ----------------------- | ---------------------------------------------------------- |
| `npm run dev`           | Dev app with hot reload                                    |
| `npm run build`         | Type-check then build main/preload/renderer bundles        |
| `npm start`             | Preview the production build                               |
| `npm run build:mac`     | Build + package a macOS app (`dmg`, `zip`)                 |
| `npm run build:win`     | Build + package a Windows installer (`nsis`)               |
| `npm run build:linux`   | Build + package Linux artifacts (`AppImage`, `deb`, `rpm`) |
| `npm run lint`          | ESLint (flat config)                                       |
| `npm run format`        | Prettier write                                             |
| `npm run typecheck`     | `tsc --noEmit` for node + web projects                     |
| `npm test`              | Vitest unit tests (jsdom)                                  |

## CI

GitHub Actions ([.github/workflows/ci.yml](.github/workflows/ci.yml)) runs
lint + format check, type check, and unit tests on every push and PR.
