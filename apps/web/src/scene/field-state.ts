import type { FieldState, GameState, OffsetCoord } from '@vibe-kick/game-core'

type FieldStateIndex = Map<string, FieldState>

function coordKey(coord: OffsetCoord) {
  return `${coord.col}:${coord.row}`
}

export function buildFieldStateIndex(
  gameState: GameState,
  options?: { includeBall?: boolean },
): FieldStateIndex {
  const index: FieldStateIndex = new Map()

  for (const team of gameState.teams) {
    for (const player of team.players) {
      const key = coordKey(player.position)
      index.set(key, {
        kind: 'player',
        coord: player.position,
        playerId: player.id,
      })
    }
  }

  if (options?.includeBall !== false) {
    const ballKey = coordKey(gameState.ball.position)
    const occupying = index.get(ballKey)
    if (occupying && occupying.kind === 'player') {
      index.set(ballKey, {
        kind: 'player_with_ball',
        coord: gameState.ball.position,
        playerId: occupying.playerId,
      })
    } else {
      index.set(ballKey, {
        kind: 'ball',
        coord: gameState.ball.position,
      })
    }
  }

  return index
}

export function getFieldStateAt(
  index: FieldStateIndex,
  coord: OffsetCoord,
): FieldState | null {
  return index.get(coordKey(coord)) ?? null
}
