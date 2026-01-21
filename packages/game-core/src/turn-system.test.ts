import { describe, expect, it } from 'bun:test'
import {
  ACTIONS_PER_TURN,
  createTurnState,
  queueTurnAction,
  type TurnAction,
} from './index'

describe('turn system', () => {
  it('creates a fresh turn state with actions remaining', () => {
    const state = createTurnState(['team-a', 'team-b'])

    expect(state.activeTeamId).toBe('team-a')
    expect(state.round).toBe(1)
    expect(state.actionsRemaining).toBe(ACTIONS_PER_TURN)
    expect(state.actionQueue).toHaveLength(0)
  })

  it('queues actions and switches teams after two actions', () => {
    const state = createTurnState(['team-a', 'team-b'], 'team-b')
    const actionOne: TurnAction = { type: 'move', teamId: 'team-b' }
    const actionTwo: TurnAction = { type: 'pass', teamId: 'team-b' }

    const first = queueTurnAction(state, actionOne)
    expect(first.ok).toBe(true)
    if (!first.ok) {
      throw new Error('expected first action to succeed')
    }
    expect(first.state.actionsRemaining).toBe(ACTIONS_PER_TURN - 1)
    expect(first.state.actionQueue).toHaveLength(1)
    expect(first.switched).toBe(false)

    const second = queueTurnAction(first.state, actionTwo)
    expect(second.ok).toBe(true)
    if (!second.ok) {
      throw new Error('expected second action to succeed')
    }
    expect(second.state.activeTeamId).toBe('team-a')
    expect(second.state.round).toBe(2)
    expect(second.state.actionsRemaining).toBe(ACTIONS_PER_TURN)
    expect(second.state.actionQueue).toHaveLength(2)
    expect(second.switched).toBe(true)
  })

  it('rejects actions from the inactive team', () => {
    const state = createTurnState(['team-a', 'team-b'])
    const result = queueTurnAction(state, { type: 'move', teamId: 'team-b' })

    expect(result.ok).toBe(false)
    if (result.ok) {
      throw new Error('expected inactive team action to fail')
    }
    expect(result.error).toBe('not_active_team')
    expect(result.state).toEqual(state)
  })

  it('rejects actions from unknown teams', () => {
    const state = createTurnState(['team-a', 'team-b'])
    const result = queueTurnAction(state, { type: 'move', teamId: 'team-c' })

    expect(result.ok).toBe(false)
    if (result.ok) {
      throw new Error('expected unknown team action to fail')
    }
    expect(result.error).toBe('unknown_team')
  })
})
