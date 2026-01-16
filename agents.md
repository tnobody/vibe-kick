## Project Direction

- Frontend: React with react-three-fiber (Three.js) for 3D rendering.
- Camera: fixed fan perspective centered behind one goal, slightly elevated.
- Runtime: Bun.
- Bundler: Vite.
- Language: fullstack TypeScript.
- Testing: Vitest.
- Multiplayer: possible future server using Bun.
- Monorepo: Bun workspaces (no extra tooling).

## Concrete Steps

1) Initialize workspace
- Create a Vite React TypeScript app using Bun.
- Add shared tooling: ESLint/Prettier if desired.

2) Install core dependencies
- `@react-three/fiber`, `three`, and optionally `@react-three/drei`.
- `zod` for state validation (optional but recommended).

3) Establish project structure
- `packages/game-core`: rules, hex math, types, and serializers.
- `apps/web`: React + R3F frontend.
- `apps/server`: placeholder for future Bun multiplayer server.

4) Define game state + events
- Create core types: `Hex`, `Player`, `Ball`, `Team`, `GameState`.
- Define events: `PlaceBall`, `MovePlayer`, `PassBall`, `DiscardAction`.
- Add pure reducers and validation in `game-core`.

5) Build the 3D scene
- Render a pitch plane + hex grid in R3F.
- Map hex centers to 3D coordinates (x/z).
- Lock camera to the “fan behind goal” perspective.

6) Interaction and UI
- Add hex hover + selection via raycasting.
- Keep HUD and menus in HTML overlays.

7) Testing
- Unit test reducers and hex math with Vitest in `game-core`.

8) Multiplayer path (later)
- Add Bun server with WebSocket.
- Server-authoritative state using shared `game-core`.


## Coding Style and Guideline
- No barrel exports, no default exports