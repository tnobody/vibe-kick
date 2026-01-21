import { MIDLINE_ROW, type OffsetCoord, type TeamSide } from '@vibe-kick/game-core'

export const TOP_ROW = 4
export const BOTTOM_ROW = 10
export const PLAYERS_PER_TEAM = 4

export type SetupPhase = 'side' | 'players' | 'ball' | 'ready'

export type SetupContext = {
  phase: SetupPhase
  selectedSide: TeamSide | null
  playerPositions: OffsetCoord[]
  opponentPositions: OffsetCoord[]
}

function coordKey(coord: OffsetCoord) {
  return `${coord.col}:${coord.row}`
}

export function getOccupiedPositions(context: SetupContext) {
  const occupied = new Set<string>()
  for (const coord of [...context.playerPositions, ...context.opponentPositions]) {
    occupied.add(coordKey(coord))
  }
  return occupied
}

export function isValidPlayerPlacement(coord: OffsetCoord, context: SetupContext) {
  if (context.phase !== 'players' || !context.selectedSide) {
    return false
  }
  const allowedRow = context.selectedSide === 'top' ? TOP_ROW : BOTTOM_ROW
  if (coord.row !== allowedRow) {
    return false
  }
  const key = coordKey(coord)
  const occupied = getOccupiedPositions(context)
  if (
    context.playerPositions.length >= PLAYERS_PER_TEAM &&
    !context.playerPositions.some((position) => coordKey(position) === key)
  ) {
    return false
  }
  return !occupied.has(key) || context.playerPositions.some((position) => coordKey(position) === key)
}

export function isValidBallPlacement(coord: OffsetCoord, context: SetupContext) {
  if (context.phase !== 'ball') {
    return false
  }
  if (coord.row !== MIDLINE_ROW) {
    return false
  }
  const occupied = getOccupiedPositions(context)
  return !occupied.has(coordKey(coord))
}

export function togglePlayerPosition(
  positions: OffsetCoord[],
  coord: OffsetCoord,
  limit = PLAYERS_PER_TEAM,
) {
  const key = coordKey(coord)
  if (positions.some((position) => coordKey(position) === key)) {
    return positions.filter((position) => coordKey(position) !== key)
  }
  if (positions.length >= limit) {
    return positions
  }
  return [...positions, coord]
}
