export type HexLayout = {
  spacingRadius: number
  tileRadius: number
  hexWidth: number
  hexHeight: number
  gridWidth: number
  gridHeight: number
}

export type HexCell = {
  id: number
  column: number
  row: number
  position: [number, number, number]
}
