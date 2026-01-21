import { describe, expect, it } from 'bun:test'
import { MIDLINE_ROW } from '@vibe-kick/game-core'
import {
  BOTTOM_ROW,
  PLAYERS_PER_TEAM,
  TOP_ROW,
  getOccupiedPositions,
  isValidBallPlacement,
  isValidPlayerPlacement,
  togglePlayerPosition,
  type SetupContext,
} from './setup-rules'

describe('setup rules', () => {
  it('validates player placement rows and capacity', () => {
    const context: SetupContext = {
      phase: 'players',
      selectedSide: 'top',
      playerPositions: [
        { col: 1, row: TOP_ROW },
        { col: 2, row: TOP_ROW },
        { col: 3, row: TOP_ROW },
        { col: 4, row: TOP_ROW },
      ],
      opponentPositions: [{ col: 1, row: BOTTOM_ROW }],
    }

    expect(isValidPlayerPlacement({ col: 5, row: TOP_ROW }, context)).toBe(false)
    expect(isValidPlayerPlacement({ col: 1, row: BOTTOM_ROW }, context)).toBe(false)
  })

  it('validates ball placement on midline and free cells', () => {
    const context: SetupContext = {
      phase: 'ball',
      selectedSide: 'bottom',
      playerPositions: [{ col: 6, row: MIDLINE_ROW }],
      opponentPositions: [],
    }

    expect(isValidBallPlacement({ col: 2, row: MIDLINE_ROW }, context)).toBe(true)
    expect(isValidBallPlacement({ col: 6, row: MIDLINE_ROW }, context)).toBe(false)
    expect(isValidBallPlacement({ col: 2, row: MIDLINE_ROW - 1 }, context)).toBe(false)
  })

  it('toggles player positions with limits', () => {
    const positions = [
      { col: 1, row: TOP_ROW },
      { col: 2, row: TOP_ROW },
    ]

    const added = togglePlayerPosition(positions, { col: 3, row: TOP_ROW }, PLAYERS_PER_TEAM)
    expect(added).toHaveLength(3)

    const removed = togglePlayerPosition(added, { col: 2, row: TOP_ROW }, PLAYERS_PER_TEAM)
    expect(removed).toHaveLength(2)
    expect(getOccupiedPositions({
      phase: 'players',
      selectedSide: 'top',
      playerPositions: removed,
      opponentPositions: [],
    }).has('2:4')).toBe(false)
  })
})
