import { beforeEach, describe, expect, it } from 'bun:test'
import { MIDLINE_ROW, getNeighborCoords, isInBounds } from '@vibe-kick/game-core'
import {
  clearSessionsForTests,
  createSession,
  joinSession,
  placeBall,
  placePlayers,
  submitAction,
} from './session-store'

const baseSkills = {
  speed: 2,
  shoot: 2,
  passing: 2,
  dribbling: 2,
  defense: 1,
  physics: 2,
}

function makePlayer(id: string, col: number, row: number) {
  return {
    id,
    name: id,
    skills: baseSkills,
    position: { col, row },
  }
}

function findFreeNeighbor(position: { col: number; row: number }, occupied: Set<string>) {
  const neighbor = getNeighborCoords(position).find(
    (coord) => isInBounds(coord) && !occupied.has(`${coord.col}:${coord.row}`),
  )
  if (!neighbor) {
    throw new Error('expected to find a free neighbor')
  }
  return neighbor
}

beforeEach(() => {
  clearSessionsForTests()
})

describe('session store', () => {
  it('creates and joins a session', () => {
    const created = createSession('North', 'top')
    expect(created.ok).toBe(true)
    if (!created.ok) {
      throw new Error('expected session creation to succeed')
    }
    expect(created.value.session.gameState.teams).toHaveLength(1)

    const joined = joinSession(created.value.session.id, 'South')
    expect(joined.ok).toBe(true)
    if (!joined.ok) {
      throw new Error('expected join to succeed')
    }
    expect(joined.value.session.gameState.teams).toHaveLength(2)
  })

  it('validates player placement rows', () => {
    const created = createSession('North', 'top')
    if (!created.ok) {
      throw new Error('expected session creation to succeed')
    }

    const players = [
      makePlayer('p1', 1, 5),
      makePlayer('p2', 2, 5),
      makePlayer('p3', 3, 5),
      makePlayer('p4', 4, 5),
    ]

    const placed = placePlayers(created.value.session.id, created.value.teamId, players)
    expect(placed.ok).toBe(false)
    if (placed.ok) {
      throw new Error('expected placement to fail')
    }
    expect(placed.error.code).toBe('players_invalid')
  })

  it('places the ball and applies actions', () => {
    const created = createSession('North', 'top')
    if (!created.ok) {
      throw new Error('expected session creation to succeed')
    }

    const joined = joinSession(created.value.session.id, 'South')
    if (!joined.ok) {
      throw new Error('expected join to succeed')
    }

    const topPlayers = [
      makePlayer('t1', 1, 4),
      makePlayer('t2', 2, 4),
      makePlayer('t3', 3, 4),
      makePlayer('t4', 4, 4),
    ]
    const bottomPlayers = [
      makePlayer('b1', 1, 10),
      makePlayer('b2', 2, 10),
      makePlayer('b3', 3, 10),
      makePlayer('b4', 4, 10),
    ]

    const placedTop = placePlayers(created.value.session.id, created.value.teamId, topPlayers)
    expect(placedTop.ok).toBe(true)
    const placedBottom = placePlayers(created.value.session.id, joined.value.teamId, bottomPlayers)
    expect(placedBottom.ok).toBe(true)

    const ballResult = placeBall(
      created.value.session.id,
      created.value.teamId,
      { col: 6, row: MIDLINE_ROW },
    )
    expect(ballResult.ok).toBe(true)
    if (!ballResult.ok) {
      throw new Error('expected ball placement to succeed')
    }
    expect(ballResult.value.gameState.activeTeamId).toBe(joined.value.teamId)

    const runner = bottomPlayers[0]
    const occupied = new Set([
      ...topPlayers.map((player) => `${player.position.col}:${player.position.row}`),
      ...bottomPlayers.map((player) => `${player.position.col}:${player.position.row}`),
    ])
    const neighbor = findFreeNeighbor(runner.position, occupied)
    const actionResult = submitAction(created.value.session.id, {
      type: 'run',
      teamId: joined.value.teamId,
      playerId: runner.id,
      path: [neighbor],
    })
    expect(actionResult.ok).toBe(true)
    if (!actionResult.ok) {
      throw new Error('expected action to succeed')
    }
    expect(actionResult.value.turnState?.actionsRemaining).toBe(1)
  })

  it('rejects actions from inactive teams', () => {
    const created = createSession('North', 'top')
    if (!created.ok) {
      throw new Error('expected session creation to succeed')
    }
    const joined = joinSession(created.value.session.id, 'South')
    if (!joined.ok) {
      throw new Error('expected join to succeed')
    }

    const topPlayers = [
      makePlayer('t1', 1, 4),
      makePlayer('t2', 2, 4),
      makePlayer('t3', 3, 4),
      makePlayer('t4', 4, 4),
    ]
    const bottomPlayers = [
      makePlayer('b1', 1, 10),
      makePlayer('b2', 2, 10),
      makePlayer('b3', 3, 10),
      makePlayer('b4', 4, 10),
    ]

    placePlayers(created.value.session.id, created.value.teamId, topPlayers)
    placePlayers(created.value.session.id, joined.value.teamId, bottomPlayers)
    placeBall(created.value.session.id, created.value.teamId, { col: 6, row: MIDLINE_ROW })

    const occupied = new Set([
      ...topPlayers.map((player) => `${player.position.col}:${player.position.row}`),
      ...bottomPlayers.map((player) => `${player.position.col}:${player.position.row}`),
    ])
    const actionResult = submitAction(created.value.session.id, {
      type: 'run',
      teamId: created.value.teamId,
      playerId: topPlayers[0].id,
      path: [findFreeNeighbor(topPlayers[0].position, occupied)],
    })

    expect(actionResult.ok).toBe(false)
    if (actionResult.ok) {
      throw new Error('expected action to fail')
    }
    expect(actionResult.error.code).toBe('action_invalid')
  })
})
