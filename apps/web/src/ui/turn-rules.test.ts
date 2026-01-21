import { describe, expect, it } from 'bun:test'
import type { GameState } from '@vibe-kick/game-core'
import { getPassTargets, getRunTargetPaths } from './turn-rules'

const baseSkills = {
  speed: 2,
  shoot: 2,
  passing: 2,
  dribbling: 2,
  defense: 1,
  physics: 2,
}

describe('turn rules', () => {
  it('builds run targets based on speed and occupancy', () => {
    const state: GameState = {
      teams: [
        {
          id: 'team-a',
          name: 'A',
          side: 'top',
          players: [
            { id: 'p1', name: 'Runner', skills: baseSkills, position: { col: 2, row: 4 } },
            { id: 'p2', name: 'Blocker', skills: baseSkills, position: { col: 3, row: 4 } },
          ],
        },
      ],
      ball: { position: { col: 6, row: 7 } },
      activeTeamId: 'team-a',
      round: 1,
    }

    const targets = getRunTargetPaths(state, 'p1')
    expect(targets.size).toBeGreaterThan(0)
    expect(targets.has('3:4')).toBe(false)
  })

  it('builds pass targets only when on the ball', () => {
    const state: GameState = {
      teams: [
        {
          id: 'team-a',
          name: 'A',
          side: 'top',
          players: [{ id: 'p1', name: 'Passer', skills: baseSkills, position: { col: 2, row: 4 } }],
        },
      ],
      ball: { position: { col: 2, row: 4 } },
      activeTeamId: 'team-a',
      round: 1,
    }

    const targets = getPassTargets(state, 'p1')
    expect(targets.size).toBeGreaterThan(0)

    const noBallTargets = getPassTargets(
      { ...state, ball: { position: { col: 6, row: 7 } } },
      'p1',
    )
    expect(noBallTargets.size).toBe(0)
  })
})
