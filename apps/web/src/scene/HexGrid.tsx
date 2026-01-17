import { useMemo, useState } from 'react'
import { buildHexGrid, getHexLayout } from './grid'
import type { HexCell } from './types'

export default function HexGrid({
  onHover,
}: {
  onHover: (cell: HexCell | null) => void
}) {
  const layout = useMemo(() => getHexLayout(), [])
  const cells = useMemo(() => buildHexGrid(layout), [layout])
  const [hoveredId, setHoveredId] = useState<number | null>(null)

  return (
    <group>
      {cells.map((cell) => {
        const isHovered = cell.id === hoveredId
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
              color={isHovered ? '#ff9f1a' : '#ffffff'}
              opacity={0.15}
              transparent
              toneMapped={false}
            />
          </mesh>
        )
      })}
    </group>
  )
}
