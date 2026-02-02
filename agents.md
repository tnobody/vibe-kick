## Project Direction

- Frontend: React with react-three-fiber (Three.js) for 3D rendering.
- Backend: Bun Serve
- Runtime: Bun.
- Bundler: Vite.
- Language: fullstack TypeScript.
- Testing: Bun test runner, suggest better solution if thingas get too complex.
- Monorepo: Bun workspaces (no extra tooling).

## Project Structure
- `src/packages/game-core` is a shared library for game logic
- `apps/web` is the frontend
- `apps/server` is the game server

## Game Rules
- Any question about the game rules can be read in `RULES.md` read this file for domain specific questions.

## Coding Style and Guideline
- No barrel exports, no default exports (beside its a convention of the actual framework e.g. in config files)
- prefer simplicity over cleverness
- One File per component
- prefer functional approaches over oop
- keep the server side simple and use native bun apis as much as possible
- Write unit tests especially for pure logic units (e.g. game logic)

## QA Checklist
- Run `bun run test:e2e` after changes that affect the frontend.

## Git and PR instructions
- Use `gh` command to interact with github
- Work with git flow logic
- When working on an issue create a branch named by this pattern: `feat/<ISSUE-NUMBER>/<SLUG-OF-TITLE>`
- Before creating the branch check if there is a local or remote copy
