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

export const ACTIONS_PER_TURN = 2

export type TurnAction = {
  type: string
  teamId: string
  payload?: Record<string, unknown>
}

export type TurnState = {
  teamIds: [string, string]
  activeTeamId: string
  round: number
  actionsRemaining: number
  actionQueue: TurnAction[]
}

export type TurnError = 'not_active_team' | 'no_actions_remaining' | 'unknown_team'

export type TurnResult =
  | { ok: true; state: TurnState; switched: boolean }
  | { ok: false; state: TurnState; error: TurnError }

export function createTurnState(
  teamIds: [string, string],
  startingTeamId?: string,
  startingRound = 1,
): TurnState {
  const activeTeamId =
    startingTeamId && teamIds.includes(startingTeamId)
      ? startingTeamId
      : teamIds[0]

  return {
    teamIds,
    activeTeamId,
    round: startingRound,
    actionsRemaining: ACTIONS_PER_TURN,
    actionQueue: [],
  }
}

export function queueTurnAction(
  state: TurnState,
  action: TurnAction,
): TurnResult {
  if (!state.teamIds.includes(action.teamId)) {
    return { ok: false, state, error: 'unknown_team' }
  }

  if (action.teamId !== state.activeTeamId) {
    return { ok: false, state, error: 'not_active_team' }
  }

  if (state.actionsRemaining <= 0) {
    return { ok: false, state, error: 'no_actions_remaining' }
  }

  const actionsRemaining = state.actionsRemaining - 1
  const queuedState: TurnState = {
    ...state,
    actionsRemaining,
    actionQueue: [...state.actionQueue, action],
  }

  if (actionsRemaining > 0) {
    return { ok: true, state: queuedState, switched: false }
  }

  const nextTeamId =
    state.activeTeamId === state.teamIds[0]
      ? state.teamIds[1]
      : state.teamIds[0]

  return {
    ok: true,
    state: {
      ...queuedState,
      activeTeamId: nextTeamId,
      round: state.round + 1,
      actionsRemaining: ACTIONS_PER_TURN,
    },
    switched: true,
  }
}

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
