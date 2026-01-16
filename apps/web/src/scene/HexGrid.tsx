import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { buildHexGrid, getHexLayout } from './grid'
import type { HexCell } from './types'

export default function HexGrid({
  onHover,
}: {
  onHover: (cell: HexCell | null) => void
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const layout = useMemo(() => getHexLayout(), [])
  const cells = useMemo(() => buildHexGrid(layout), [layout])
  const [hoveredId, setHoveredId] = useState<number | null>(null)

  useEffect(() => {
    if (!meshRef.current) return
    const base = new THREE.Color('#2f7a3b')
    const highlight = new THREE.Color('#4fc36e')
    cells.forEach((cell) => {
      const color = cell.id === hoveredId ? highlight : base
      meshRef.current?.setColorAt(cell.id, color)
    })
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true
    }
  }, [cells, hoveredId])

  useEffect(() => {
    if (!meshRef.current) return
    const matrix = new THREE.Matrix4()
    cells.forEach((cell) => {
      matrix.setPosition(cell.position[0], cell.position[1], cell.position[2])
      meshRef.current?.setMatrixAt(cell.id, matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
    meshRef.current.computeBoundingSphere()
  }, [cells])

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, cells.length]}
      onPointerMove={(event) => {
        if (event.instanceId == null) return
        const cell = cells[event.instanceId]
        if (cell && cell.id !== hoveredId) {
          setHoveredId(cell.id)
          onHover(cell)
        }
      }}
      onPointerOut={() => {
        setHoveredId(null)
        onHover(null)
      }}
    >
      <cylinderGeometry
        args={[layout.tileRadius, layout.tileRadius, 0.04, 6, 1, false, Math.PI / 6]}
      />
      <meshStandardMaterial
        vertexColors
        roughness={0.8}
        metalness={0.1}
        color="#2f7a3b"
      />
    </instancedMesh>
  )
}
