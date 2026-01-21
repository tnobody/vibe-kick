import { describe, expect, it } from 'bun:test'
import { BOARD, type Ballmark, type FieldState, type GameState, type Player, type Team } from './index'

describe('game core models', () => {
  it('builds a representative game state fixture', () => {
    const player: Player = {
      id: 'player-1',
      name: 'Alex',
      skills: {
        speed: 3,
        shoot: 2,
        passing: 2,
        dribbling: 3,
        defense: 1,
        physics: 2,
      },
      position: { col: 2, row: 4 },
    }

    const team: Team = {
      id: 'team-top',
      name: 'North',
      side: 'top',
      players: [player],
    }

    const ball: Ballmark = {
      position: { col: Math.floor(BOARD.columns / 2), row: Math.floor(BOARD.rows / 2) },
    }

    const state: GameState = {
      teams: [team],
      ball,
      activeTeamId: team.id,
      round: 1,
    }

    expect(state.teams[0].players[0].skills.speed).toBe(3)
    expect(state.ball.position.col).toBeGreaterThanOrEqual(0)
  })

  it('models field states with a discriminated union', () => {
    const occupied: FieldState = {
      kind: 'player_with_ball',
      coord: { col: 5, row: 7 },
      playerId: 'player-1',
    }

    expect(occupied.kind).toBe('player_with_ball')
    expect(occupied.coord.row).toBe(7)
  })
})
