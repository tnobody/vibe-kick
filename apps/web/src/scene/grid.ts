import { FIELD, GRID, getFieldLength } from './constants'
import type { HexCell, HexLayout } from './types'

export function getHexLayout(): HexLayout {
  const maxWidth = FIELD.width - GRID.padding * 2
  const spacingRadius = maxWidth / (1.5 * GRID.columns + 0.5)
  const tileRadius = Math.max(spacingRadius - GRID.gap, spacingRadius * 0.7)
  const hexWidth = spacingRadius * 2
  const hexHeight = Math.sqrt(3) * spacingRadius
  const gridWidth = (GRID.columns - 1) * (hexWidth * 0.75) + hexWidth
  const gridHeight = GRID.rows * hexHeight

  return { spacingRadius, tileRadius, hexWidth, hexHeight, gridWidth, gridHeight }
}

export function buildHexGrid(layout: HexLayout) {
  const cells: HexCell[] = []
  const offsetX = -FIELD.width / 2 + GRID.padding + layout.hexWidth / 2
  const fieldLength = getFieldLength()
  const offsetZ = fieldLength / 2 - GRID.padding - layout.hexHeight / 2
  let id = 0

  for (let column = 0; column < GRID.columns; column += 1) {
    for (let row = 0; row < GRID.rows; row += 1) {
      const x = column * (layout.hexWidth * 0.75) + offsetX
      const z =
        offsetZ -
        row * layout.hexHeight -
        (column % 2 ? layout.hexHeight / 2 : 0)
      cells.push({
        id: id++,
        column,
        row,
        position: [x, 0.03, z],
      })
    }
  }

  return cells
}
