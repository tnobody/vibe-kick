import {
  fromAxial,
  getNeighborCoords,
  isInBounds,
  toAxial,
  type AxialCoord,
  type GameState,
  type OffsetCoord,
} from '@vibe-kick/game-core'

type PathMap = Map<string, OffsetCoord[]>

const AXIAL_DIRECTIONS: AxialCoord[] = [
  { q: 1, r: 0 },
  { q: 1, r: -1 },
  { q: 0, r: -1 },
  { q: -1, r: 0 },
  { q: -1, r: 1 },
  { q: 0, r: 1 },
]

function coordKey(coord: OffsetCoord) {
  return `${coord.col}:${coord.row}`
}

function findPlayer(gameState: GameState, playerId: string) {
  for (const team of gameState.teams) {
    const player = team.players.find((candidate) => candidate.id === playerId)
    if (player) {
      return player
    }
  }
  return null
}

function getOccupiedPositions(gameState: GameState, ignorePlayerId?: string) {
  const occupied = new Set<string>()
  for (const team of gameState.teams) {
    for (const player of team.players) {
      if (player.id === ignorePlayerId) {
        continue
      }
      occupied.add(coordKey(player.position))
    }
  }
  return occupied
}

export function getRunTargetPaths(gameState: GameState, playerId: string): PathMap {
  const player = findPlayer(gameState, playerId)
  if (!player) {
    return new Map()
  }

  const maxSteps = player.skills.speed
  const occupied = getOccupiedPositions(gameState, playerId)
  const visited = new Set<string>([coordKey(player.position)])
  const queue: Array<{ coord: OffsetCoord; path: OffsetCoord[] }> = [
    { coord: player.position, path: [] },
  ]
  const paths: PathMap = new Map()

  while (queue.length > 0) {
    const current = queue.shift()
    if (!current) {
      break
    }
    const { coord, path } = current
    const nextDistance = path.length + 1
    if (nextDistance > maxSteps) {
      continue
    }
    for (const neighbor of getNeighborCoords(coord)) {
      if (!isInBounds(neighbor)) {
        continue
      }
      const key = coordKey(neighbor)
      if (occupied.has(key) || visited.has(key)) {
        continue
      }
      const nextPath = [...path, neighbor]
      visited.add(key)
      paths.set(key, nextPath)
      queue.push({ coord: neighbor, path: nextPath })
    }
  }

  return paths
}

export function getPassTargets(
  gameState: GameState,
  playerId: string,
): Map<string, { coord: OffsetCoord; direction: AxialCoord; distance: number }> {
  const player = findPlayer(gameState, playerId)
  if (!player) {
    return new Map()
  }

  const onBall =
    player.position.col === gameState.ball.position.col &&
    player.position.row === gameState.ball.position.row
  if (!onBall) {
    return new Map()
  }

  const occupied = getOccupiedPositions(gameState)
  const maxDistance = player.skills.passing
  const startAxial = toAxial(player.position)
  const targets = new Map<string, { coord: OffsetCoord; direction: AxialCoord; distance: number }>()

  for (const direction of AXIAL_DIRECTIONS) {
    for (let distance = 1; distance <= maxDistance; distance += 1) {
      const coord = fromAxial({
        q: startAxial.q + direction.q * distance,
        r: startAxial.r + direction.r * distance,
      })
      if (!isInBounds(coord)) {
        break
      }
      const key = coordKey(coord)
      if (occupied.has(key)) {
        break
      }
      targets.set(key, { coord, direction, distance })
    }
  }

  return targets
}
