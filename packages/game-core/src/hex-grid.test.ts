import { describe, expect, it } from 'vitest'
import {
  BOARD,
  MIDLINE_ROW,
  PENALTY_BOX,
  fromAxial,
  getGoalHexes,
  getInBoundsNeighborCoords,
  getMidlineHexes,
  getNeighborCoords,
  getPenaltyBoxHexes,
  isGoalHex,
  isInBounds,
  isMidlineHex,
  isPenaltyBoxHex,
  toAxial,
} from './index'

describe('hex grid utilities', () => {
  it('round-trips between offset and axial coordinates', () => {
    for (let col = 0; col < BOARD.columns; col += 1) {
      for (let row = 0; row < BOARD.rows; row += 1) {
        const axial = toAxial({ col, row })
        const offset = fromAxial(axial)
        expect(offset).toEqual({ col, row })
      }
    }
  })

  it('returns six neighbor candidates for any in-bounds coordinate', () => {
    const neighbors = getNeighborCoords({ col: 6, row: 7 })
    expect(neighbors).toHaveLength(6)
  })

  it('filters neighbors to in-bounds coordinates', () => {
    const neighbors = getInBoundsNeighborCoords({ col: 0, row: 0 })
    expect(neighbors.every(isInBounds)).toBe(true)
    expect(neighbors.length).toBeGreaterThan(0)
    expect(neighbors.length).toBeLessThan(6)
  })

  it('identifies midline hexes', () => {
    expect(isMidlineHex({ col: 2, row: MIDLINE_ROW })).toBe(true)
    expect(isMidlineHex({ col: 2, row: MIDLINE_ROW - 1 })).toBe(false)
    expect(getMidlineHexes()).toHaveLength(BOARD.columns)
  })

  it('identifies goal locations', () => {
    const goals = getGoalHexes()
    expect(isGoalHex(goals.top)).toBe(true)
    expect(isGoalHex(goals.bottom)).toBe(true)
  })

  it('identifies penalty box areas', () => {
    const topBox = getPenaltyBoxHexes('top')
    const bottomBox = getPenaltyBoxHexes('bottom')
    expect(topBox).toHaveLength(PENALTY_BOX.columns * PENALTY_BOX.rows)
    expect(bottomBox).toHaveLength(PENALTY_BOX.columns * PENALTY_BOX.rows)
    expect(isPenaltyBoxHex(topBox[0])).toBe(true)
    expect(isPenaltyBoxHex(bottomBox[0])).toBe(true)
    expect(isPenaltyBoxHex({ col: 0, row: MIDLINE_ROW })).toBe(false)
  })
})
