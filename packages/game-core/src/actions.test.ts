import { describe, expect, it } from 'bun:test'
import {
  applyGameAction,
  fromAxial,
  toAxial,
  type GameState,
  type Player,
  type Team,
} from './index'

const baseSkills = {
  speed: 3,
  shoot: 2,
  passing: 3,
  dribbling: 2,
  defense: 1,
  physics: 2,
}

function createPlayer(id: string, position: { col: number; row: number }, name = id): Player {
  return {
    id,
    name,
    skills: baseSkills,
    position,
  }
}

function createTeam(id: string, side: Team['side'], players: Player[]): Team {
  return {
    id,
    name: id,
    side,
    players,
  }
}

describe('game actions', () => {
  it('runs a player and picks up the ball when it is on the path', () => {
    const runner = createPlayer('p1', { col: 1, row: 1 })
    const other = createPlayer('p2', { col: 9, row: 9 })
    const team = createTeam('t1', 'top', [runner])
    const otherTeam = createTeam('t2', 'bottom', [other])

    const state: GameState = {
      teams: [team, otherTeam],
      ball: { position: { col: 2, row: 1 } },
      activeTeamId: team.id,
      round: 1,
    }

    const result = applyGameAction(state, {
      type: 'run',
      teamId: team.id,
      playerId: runner.id,
      path: [
        { col: 2, row: 1 },
        { col: 3, row: 1 },
      ],
      pickUpBall: true,
    })

    expect(result.ok).toBe(true)
    if (!result.ok) {
      throw new Error('expected run action to succeed')
    }
    const updatedRunner = result.state.teams[0].players[0]
    expect(updatedRunner.position).toEqual({ col: 3, row: 1 })
    expect(result.state.ball.position).toEqual({ col: 3, row: 1 })
    expect(result.state.ball.carrierPlayerId).toBe(runner.id)
  })

  it('allows picking up the ball when starting on it', () => {
    const runner = createPlayer('p1', { col: 2, row: 1 })
    const other = createPlayer('p2', { col: 9, row: 9 })
    const team = createTeam('t1', 'top', [runner])
    const otherTeam = createTeam('t2', 'bottom', [other])

    const state: GameState = {
      teams: [team, otherTeam],
      ball: { position: runner.position },
      activeTeamId: team.id,
      round: 1,
    }

    const result = applyGameAction(state, {
      type: 'run',
      teamId: team.id,
      playerId: runner.id,
      path: [{ col: 3, row: 1 }],
      pickUpBall: true,
    })

    expect(result.ok).toBe(true)
    if (!result.ok) {
      throw new Error('expected run action to succeed')
    }
    expect(result.state.ball.position).toEqual({ col: 3, row: 1 })
    expect(result.state.ball.carrierPlayerId).toBe(runner.id)
  })

  it('rejects running through an occupied field', () => {
    const runner = createPlayer('p1', { col: 1, row: 1 })
    const blocker = createPlayer('p2', { col: 2, row: 1 })
    const team = createTeam('t1', 'top', [runner])
    const otherTeam = createTeam('t2', 'bottom', [blocker])

    const state: GameState = {
      teams: [team, otherTeam],
      ball: { position: { col: 6, row: 6 } },
      activeTeamId: team.id,
      round: 1,
    }

    const result = applyGameAction(state, {
      type: 'run',
      teamId: team.id,
      playerId: runner.id,
      path: [{ col: 2, row: 1 }],
    })

    expect(result.ok).toBe(false)
    if (result.ok) {
      throw new Error('expected run action to fail')
    }
    expect(result.error.code).toBe('path_blocked')
  })

  it('passes the ball in a straight line within range', () => {
    const passer = createPlayer('p1', { col: 3, row: 1 })
    const other = createPlayer('p2', { col: 9, row: 9 })
    const team = createTeam('t1', 'top', [passer])
    const otherTeam = createTeam('t2', 'bottom', [other])
    const direction = { q: 1, r: 0 }
    const distance = 2
    const destination = fromAxial({
      q: toAxial(passer.position).q + direction.q * distance,
      r: toAxial(passer.position).r + direction.r * distance,
    })

    const state: GameState = {
      teams: [team, otherTeam],
      ball: { position: passer.position, carrierPlayerId: passer.id },
      activeTeamId: team.id,
      round: 1,
    }

    const result = applyGameAction(state, {
      type: 'pass',
      teamId: team.id,
      playerId: passer.id,
      direction,
      distance,
    })

    expect(result.ok).toBe(true)
    if (!result.ok) {
      throw new Error('expected pass action to succeed')
    }
    expect(result.state.ball.position).toEqual(destination)
    expect(result.state.ball.carrierPlayerId).toBeUndefined()
  })

  it('rejects passes through occupied fields', () => {
    const passer = createPlayer('p1', { col: 3, row: 1 })
    const direction = { q: 1, r: 0 }
    const distance = 1
    const destination = fromAxial({
      q: toAxial(passer.position).q + direction.q * distance,
      r: toAxial(passer.position).r + direction.r * distance,
    })
    const blocker = createPlayer('p2', destination)
    const team = createTeam('t1', 'top', [passer])
    const otherTeam = createTeam('t2', 'bottom', [blocker])

    const state: GameState = {
      teams: [team, otherTeam],
      ball: { position: passer.position },
      activeTeamId: team.id,
      round: 1,
    }

    const result = applyGameAction(state, {
      type: 'pass',
      teamId: team.id,
      playerId: passer.id,
      direction,
      distance,
    })

    expect(result.ok).toBe(false)
    if (result.ok) {
      throw new Error('expected pass action to fail')
    }
    expect(result.error.code).toBe('pass_blocked')
  })

  it('allows discard without changing the state', () => {
    const player = createPlayer('p1', { col: 1, row: 1 })
    const team = createTeam('t1', 'top', [player])
    const otherTeam = createTeam('t2', 'bottom', [createPlayer('p2', { col: 9, row: 9 })])
    const state: GameState = {
      teams: [team, otherTeam],
      ball: { position: { col: 6, row: 6 } },
      activeTeamId: team.id,
      round: 1,
    }

    const result = applyGameAction(state, { type: 'discard', teamId: team.id })

    expect(result.ok).toBe(true)
    if (!result.ok) {
      throw new Error('expected discard action to succeed')
    }
    expect(result.state).toEqual(state)
  })
})
