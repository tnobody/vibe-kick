## Project Direction

- Frontend: React with react-three-fiber (Three.js) for 3D rendering.
- Backend: Bun Serve
- Runtime: Bun.
- Bundler: Vite.
- Language: fullstack TypeScript.
- Testing: Vitest.
- Monorepo: Bun workspaces (no extra tooling).

## Project Structure
- `src/packages/game-core` is a shared library for game logic
- `apps/web` is the frontend
- `apps/server` is the game server

## Game Rules
- Any question about the game rules can be read in `RULES.md` read this file for domain specific questions.

## Coding Style and Guideline
- No barrel exports, no default exports
- prefer simplicity over cleverness
- One File per component