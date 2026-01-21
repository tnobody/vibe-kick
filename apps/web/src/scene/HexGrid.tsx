import { useMemo, useState } from 'react'
import { buildHexGrid, getHexLayout } from './grid'
import { getFieldStateAt } from './field-state'
import type { HexCell } from './types'
import type { FieldState } from '@vibe-kick/game-core'

export default function HexGrid({
  onHover,
  fieldStateIndex,
}: {
  onHover: (cell: HexCell | null) => void
  fieldStateIndex: Map<string, FieldState>
}) {
  const layout = useMemo(() => getHexLayout(), [])
  const cells = useMemo(() => buildHexGrid(layout), [layout])
  const [hoveredId, setHoveredId] = useState<number | null>(null)

  const palette = {
    free: { color: '#ffffff', opacity: 0.12 },
    player: { color: '#5ec8ff', opacity: 0.25 },
    ball: { color: '#ffd166', opacity: 0.28 },
    player_with_ball: { color: '#ff7a6e', opacity: 0.35 },
  }

  return (
    <group>
      {cells.map((cell) => {
        const isHovered = cell.id === hoveredId
        const fieldState =
          getFieldStateAt(fieldStateIndex, { col: cell.column, row: cell.row })
        const kind = fieldState?.kind ?? 'free'
        const swatch = palette[kind]
        return (
          <mesh
            key={cell.id}
            position={cell.position}
            onPointerOver={() => {
              setHoveredId(cell.id)
              onHover(cell)
            }}
            onPointerOut={() => {
              setHoveredId(null)
              onHover(null)
            }}
          >
            <cylinderGeometry
              args={[layout.tileRadius, layout.tileRadius, 0.08, 6, 1, false, Math.PI / 6]}
            />
            <meshBasicMaterial
              color={isHovered ? '#ff9f1a' : swatch.color}
              opacity={isHovered ? 0.5 : swatch.opacity}
              transparent
              toneMapped={false}
            />
          </mesh>
        )
      })}
    </group>
  )
}
