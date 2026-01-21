import { describe, expect, it } from 'bun:test'
import type { GameState } from '@vibe-kick/game-core'
import { buildFieldStateIndex, getFieldStateAt } from './field-state'

describe('field state helpers', () => {
  it('marks player and ball states', () => {
    const state: GameState = {
      teams: [
        {
          id: 'team-a',
          name: 'A',
          side: 'top',
          players: [
            {
              id: 'p1',
              name: 'P1',
              skills: {
                speed: 2,
                shoot: 2,
                passing: 2,
                dribbling: 2,
                defense: 1,
                physics: 2,
              },
              position: { col: 2, row: 4 },
            },
          ],
        },
      ],
      ball: {
        position: { col: 2, row: 4 },
      },
      activeTeamId: 'team-a',
      round: 1,
    }

    const index = buildFieldStateIndex(state)
    const cellState = getFieldStateAt(index, { col: 2, row: 4 })

    expect(cellState?.kind).toBe('player_with_ball')
    if (cellState?.kind === 'player_with_ball') {
      expect(cellState.playerId).toBe('p1')
    }
  })
})
