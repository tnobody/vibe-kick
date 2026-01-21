export type OffsetCoord = {
  col: number
  row: number
}

export type AxialCoord = {
  q: number
  r: number
}

export type SkillSet = {
  speed: number
  shoot: number
  passing: number
  dribbling: number
  defense: number
  physics: number
}

export type Player = {
  id: string
  name: string
  skills: SkillSet
  position: OffsetCoord
}

export type TeamSide = 'top' | 'bottom'

export type Team = {
  id: string
  name: string
  side: TeamSide
  players: Player[]
}

export type Ballmark = {
  position: OffsetCoord
  carrierPlayerId?: string
}

export type FieldState =
  | { kind: 'free'; coord: OffsetCoord }
  | { kind: 'player'; coord: OffsetCoord; playerId: string }
  | { kind: 'ball'; coord: OffsetCoord }
  | { kind: 'player_with_ball'; coord: OffsetCoord; playerId: string }

export type GameState = {
  teams: Team[]
  ball: Ballmark
  activeTeamId: string
  round: number
}

export type RunAction = {
  type: 'run'
  teamId: string
  playerId: string
  path: OffsetCoord[]
  pickUpBall?: boolean
}

export type PassAction = {
  type: 'pass'
  teamId: string
  playerId: string
  direction: AxialCoord
  distance: number
}

export type DiscardAction = {
  type: 'discard'
  teamId: string
}

export type GameAction = RunAction | PassAction | DiscardAction

export type GameActionErrorCode =
  | 'not_active_team'
  | 'unknown_team'
  | 'unknown_player'
  | 'player_not_on_team'
  | 'path_too_long'
  | 'path_not_contiguous'
  | 'path_out_of_bounds'
  | 'path_blocked'
  | 'path_empty'
  | 'ball_pickup_not_on_path'
  | 'ball_pickup_unavailable'
  | 'pass_requires_ball'
  | 'pass_invalid_direction'
  | 'pass_invalid_distance'
  | 'pass_blocked'

export type GameActionError = {
  code: GameActionErrorCode
  message: string
}

export type GameActionResult =
  | { ok: true; state: GameState }
  | { ok: false; state: GameState; error: GameActionError }

export const BOARD = {
  columns: 13,
  rows: 15,
} as const

export const MIDLINE_ROW = Math.floor(BOARD.rows / 2)

export const PENALTY_BOX = {
  columns: 9,
  rows: 4,
} as const

const AXIAL_DIRECTIONS: AxialCoord[] = [
  { q: 1, r: 0 },
  { q: 1, r: -1 },
  { q: 0, r: -1 },
  { q: -1, r: 0 },
  { q: -1, r: 1 },
  { q: 0, r: 1 },
]

export function isInBounds(coord: OffsetCoord) {
  return (
    coord.col >= 0 &&
    coord.col < BOARD.columns &&
    coord.row >= 0 &&
    coord.row < BOARD.rows
  )
}

// Offset coordinates use odd-q layout: odd columns are shifted down.
export function toAxial(coord: OffsetCoord): AxialCoord {
  const q = coord.col
  const r = coord.row - (coord.col - (coord.col & 1)) / 2
  return { q, r }
}

export function fromAxial(coord: AxialCoord): OffsetCoord {
  const col = coord.q
  const row = coord.r + (coord.q - (coord.q & 1)) / 2
  return { col, row }
}

export function getNeighborCoords(coord: OffsetCoord): OffsetCoord[] {
  const axial = toAxial(coord)
  return AXIAL_DIRECTIONS.map((direction) =>
    fromAxial({ q: axial.q + direction.q, r: axial.r + direction.r }),
  )
}

export function getInBoundsNeighborCoords(coord: OffsetCoord): OffsetCoord[] {
  return getNeighborCoords(coord).filter(isInBounds)
}

export function getMidlineHexes(): OffsetCoord[] {
  return getRowHexes(MIDLINE_ROW)
}

export function isMidlineHex(coord: OffsetCoord) {
  return isInBounds(coord) && coord.row === MIDLINE_ROW
}

export function getGoalHexes() {
  const centerColumn = Math.floor(BOARD.columns / 2)
  return {
    top: { col: centerColumn, row: 0 },
    bottom: { col: centerColumn, row: BOARD.rows - 1 },
  }
}

export function isGoalHex(coord: OffsetCoord) {
  if (!isInBounds(coord)) {
    return false
  }
  const goals = getGoalHexes()
  return (
    (coord.col === goals.top.col && coord.row === goals.top.row) ||
    (coord.col === goals.bottom.col && coord.row === goals.bottom.row)
  )
}

export function getPenaltyBoxHexes(side: 'top' | 'bottom'): OffsetCoord[] {
  const startCol = Math.floor((BOARD.columns - PENALTY_BOX.columns) / 2)
  const endCol = startCol + PENALTY_BOX.columns - 1
  const startRow = side === 'top' ? 0 : BOARD.rows - PENALTY_BOX.rows
  const endRow = startRow + PENALTY_BOX.rows - 1

  const hexes: OffsetCoord[] = []
  for (let row = startRow; row <= endRow; row += 1) {
    for (let col = startCol; col <= endCol; col += 1) {
      const coord = { col, row }
      if (isInBounds(coord)) {
        hexes.push(coord)
      }
    }
  }

  return hexes
}

export function isPenaltyBoxHex(
  coord: OffsetCoord,
  side?: 'top' | 'bottom',
) {
  if (!isInBounds(coord)) {
    return false
  }

  if (side) {
    return getPenaltyBoxHexes(side).some(
      (hex) => hex.col === coord.col && hex.row === coord.row,
    )
  }

  return (
    isPenaltyBoxHex(coord, 'top') || isPenaltyBoxHex(coord, 'bottom')
  )
}

export function getRowHexes(row: number): OffsetCoord[] {
  if (row < 0 || row >= BOARD.rows) {
    return []
  }

  return Array.from({ length: BOARD.columns }, (_, col) => ({ col, row }))
}

type LocatedPlayer = {
  player: Player
  team: Team
}

function areCoordsEqual(a: OffsetCoord, b: OffsetCoord) {
  return a.col === b.col && a.row === b.row
}

function findTeam(state: GameState, teamId: string) {
  return state.teams.find((team) => team.id === teamId)
}

function findPlayer(state: GameState, playerId: string): LocatedPlayer | null {
  for (const team of state.teams) {
    const player = team.players.find((candidate) => candidate.id === playerId)
    if (player) {
      return { player, team }
    }
  }
  return null
}

function getPlayerAtCoord(
  state: GameState,
  coord: OffsetCoord,
  ignorePlayerId?: string,
) {
  for (const team of state.teams) {
    const player = team.players.find(
      (candidate) =>
        candidate.id !== ignorePlayerId &&
        areCoordsEqual(candidate.position, coord),
    )
    if (player) {
      return player
    }
  }
  return null
}

function buildError(code: GameActionErrorCode, message: string): GameActionError {
  return { code, message }
}

function isDirectionValid(direction: AxialCoord) {
  return AXIAL_DIRECTIONS.some(
    (candidate) => candidate.q === direction.q && candidate.r === direction.r,
  )
}

function isNeighbor(a: OffsetCoord, b: OffsetCoord) {
  return getNeighborCoords(a).some((coord) => areCoordsEqual(coord, b))
}

function isPathContiguous(start: OffsetCoord, path: OffsetCoord[]) {
  let current = start
  for (const step of path) {
    if (!isNeighbor(current, step)) {
      return false
    }
    current = step
  }
  return true
}

function buildStraightPath(
  start: OffsetCoord,
  direction: AxialCoord,
  distance: number,
): OffsetCoord[] {
  const startAxial = toAxial(start)
  const path: OffsetCoord[] = []
  for (let step = 1; step <= distance; step += 1) {
    path.push(
      fromAxial({
        q: startAxial.q + direction.q * step,
        r: startAxial.r + direction.r * step,
      }),
    )
  }
  return path
}

export function applyGameAction(
  state: GameState,
  action: GameAction,
): GameActionResult {
  const team = findTeam(state, action.teamId)
  if (!team) {
    return {
      ok: false,
      state,
      error: buildError('unknown_team', 'Team does not exist.'),
    }
  }

  if (state.activeTeamId !== action.teamId) {
    return {
      ok: false,
      state,
      error: buildError(
        'not_active_team',
        'Only the active team can take actions.',
      ),
    }
  }

  if (action.type === 'discard') {
    return { ok: true, state }
  }

  const located = findPlayer(state, action.playerId)
  if (!located) {
    return {
      ok: false,
      state,
      error: buildError('unknown_player', 'Player does not exist.'),
    }
  }

  if (located.team.id !== team.id) {
    return {
      ok: false,
      state,
      error: buildError(
        'player_not_on_team',
        'Player is not on the active team.',
      ),
    }
  }

  if (action.type === 'run') {
    if (action.path.length === 0) {
      return {
        ok: false,
        state,
        error: buildError(
          'path_empty',
          'Run path must include at least one step.',
        ),
      }
    }

    if (action.path.length > located.player.skills.speed) {
      return {
        ok: false,
        state,
        error: buildError(
          'path_too_long',
          'Run path exceeds player speed.',
        ),
      }
    }

    if (!action.path.every(isInBounds)) {
      return {
        ok: false,
        state,
        error: buildError('path_out_of_bounds', 'Run path leaves the field.'),
      }
    }

    if (!isPathContiguous(located.player.position, action.path)) {
      return {
        ok: false,
        state,
        error: buildError(
          'path_not_contiguous',
          'Run path must move through adjacent hexes.',
        ),
      }
    }

    for (const coord of action.path) {
      const occupant = getPlayerAtCoord(state, coord, located.player.id)
      if (occupant) {
        return {
          ok: false,
          state,
          error: buildError(
            'path_blocked',
            'Run path crosses an occupied field.',
          ),
        }
      }
    }

    const ballOnPath = action.path.some((coord) =>
      areCoordsEqual(coord, state.ball.position),
    )
    const isCarrier = state.ball.carrierPlayerId === located.player.id
    const wantsPickup = Boolean(action.pickUpBall)

    if (wantsPickup && !ballOnPath) {
      return {
        ok: false,
        state,
        error: buildError(
          'ball_pickup_not_on_path',
          'Ball must be on the run path to pick it up.',
        ),
      }
    }

    if (
      wantsPickup &&
      state.ball.carrierPlayerId &&
      state.ball.carrierPlayerId !== located.player.id
    ) {
      return {
        ok: false,
        state,
        error: buildError(
          'ball_pickup_unavailable',
          'Ball is already carried by another player.',
        ),
      }
    }

    const destination = action.path[action.path.length - 1]
    const updatedPlayer: Player = { ...located.player, position: destination }

    const updatedTeams = state.teams.map((current) => {
      if (current.id !== located.team.id) {
        return current
      }
      return {
        ...current,
        players: current.players.map((player) =>
          player.id === located.player.id ? updatedPlayer : player,
        ),
      }
    })

    const shouldCarry = isCarrier || (wantsPickup && ballOnPath)
    const updatedBall: Ballmark = shouldCarry
      ? { position: destination, carrierPlayerId: located.player.id }
      : state.ball

    return {
      ok: true,
      state: {
        ...state,
        teams: updatedTeams,
        ball: updatedBall,
      },
    }
  }

  const playerHasBall = areCoordsEqual(
    located.player.position,
    state.ball.position,
  )

  if (!playerHasBall) {
    return {
      ok: false,
      state,
      error: buildError(
        'pass_requires_ball',
        'Passing requires the player to be on the ball.',
      ),
    }
  }

  if (!isDirectionValid(action.direction)) {
    return {
      ok: false,
      state,
      error: buildError(
        'pass_invalid_direction',
        'Pass direction must follow a hex edge.',
      ),
    }
  }

  if (action.distance < 1 || action.distance > located.player.skills.passing) {
    return {
      ok: false,
      state,
      error: buildError(
        'pass_invalid_distance',
        'Pass distance must be within the player passing skill.',
      ),
    }
  }

  const path = buildStraightPath(
    located.player.position,
    action.direction,
    action.distance,
  )

  for (const coord of path) {
    if (!isInBounds(coord)) {
      return {
        ok: false,
        state,
        error: buildError(
          'pass_blocked',
          'Pass travels out of bounds.',
        ),
      }
    }

    const occupant = getPlayerAtCoord(state, coord)
    if (occupant) {
      return {
        ok: false,
        state,
        error: buildError(
          'pass_blocked',
          'Pass path must be clear of players.',
        ),
      }
    }
  }

  const destination = path[path.length - 1]

  return {
    ok: true,
    state: {
      ...state,
      ball: {
        position: destination,
      },
    },
  }
}
