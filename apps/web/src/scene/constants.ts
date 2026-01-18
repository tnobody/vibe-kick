
export const FIELD = {
  width: 18,
  line: 0.08,
  goalWidth: 6,
  goalDepth: 1.2,
}

export const GRID = {
  columns: 13,
  rows: 15,
  padding: 0,
  gap: 0.08,
}

export const BOX = {
  columns: 9,
  rows: 4,
}

export const KEEPER_BOX = {
  columns: 5,
  rows: 2,
}

export function getFieldLength() {
  const maxWidth = FIELD.width - GRID.padding * 2
  const spacingRadius = maxWidth / (1.5 * GRID.columns + 0.5)
  const gridHeight = GRID.rows * Math.sqrt(3) * spacingRadius
  const halfGridHeight = (Math.sqrt(3) * spacingRadius) / 2
  return gridHeight + halfGridHeight + GRID.padding * 2
}
