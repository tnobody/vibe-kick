import * as THREE from 'three'
import { BOX, FIELD, getFieldLength } from './constants'
import { getHexLayout } from './grid'

function FieldLines({ color, boxWidth }: { color: string; boxWidth: number }) {
  const lineMaterial = new THREE.MeshStandardMaterial({ color })
  const halfWidth = FIELD.width / 2
  const halfLength = getFieldLength() / 2

  return (
    <group>
      {/* Midfield line */}
      <mesh position={[0, 0.02, 0]} material={lineMaterial}>
        <boxGeometry args={[FIELD.width, 0.02, FIELD.line]} />
      </mesh>

      {/* Top and bottom goal lines */}
      <mesh position={[0, 0.02, halfLength]} material={lineMaterial}>
        <boxGeometry args={[FIELD.width, 0.02, FIELD.line]} />
      </mesh>
      <mesh position={[0, 0.02, -halfLength]} material={lineMaterial}>
        <boxGeometry args={[FIELD.width, 0.02, FIELD.line]} />
      </mesh>

      {/* Left and right sidelines */}
      <mesh position={[halfWidth, 0.02, 0]} material={lineMaterial}>
        <boxGeometry args={[FIELD.line, 0.02, getFieldLength()]} />
      </mesh>
      <mesh position={[-halfWidth, 0.02, 0]} material={lineMaterial}>
        <boxGeometry args={[FIELD.line, 0.02, getFieldLength()]} />
      </mesh>

      {/* Top penalty box */}
      <mesh position={[boxWidth / 2, 0.02, halfLength - FIELD.boxDepth / 2]} material={lineMaterial}>
        <boxGeometry args={[FIELD.line, 0.02, FIELD.boxDepth]} />
      </mesh>
      <mesh position={[-boxWidth / 2, 0.02, halfLength - FIELD.boxDepth / 2]} material={lineMaterial}>
        <boxGeometry args={[FIELD.line, 0.02, FIELD.boxDepth]} />
      </mesh>
      <mesh position={[0, 0.02, halfLength - FIELD.boxDepth]} material={lineMaterial}>
        <boxGeometry args={[boxWidth, 0.02, FIELD.line]} />
      </mesh>

      {/* Bottom penalty box */}
      <mesh position={[boxWidth / 2, 0.02, -halfLength + FIELD.boxDepth / 2]} material={lineMaterial}>
        <boxGeometry args={[FIELD.line, 0.02, FIELD.boxDepth]} />
      </mesh>
      <mesh position={[-boxWidth / 2, 0.02, -halfLength + FIELD.boxDepth / 2]} material={lineMaterial}>
        <boxGeometry args={[FIELD.line, 0.02, FIELD.boxDepth]} />
      </mesh>
      <mesh position={[0, 0.02, -halfLength + FIELD.boxDepth]} material={lineMaterial}>
        <boxGeometry args={[boxWidth, 0.02, FIELD.line]} />
      </mesh>
    </group>
  )
}

function Goals() {
  const postMaterial = new THREE.MeshStandardMaterial({ color: '#f4f1ea' })
  const halfLength = getFieldLength() / 2
  const postHeight = 1.6
  const crossbarThickness = 0.12

  return (
    <group>
      <group position={[0, 0, halfLength + 0.3]}>
        <mesh position={[FIELD.goalWidth / 2, postHeight / 2, 0]} material={postMaterial}>
          <boxGeometry args={[crossbarThickness, postHeight, crossbarThickness]} />
        </mesh>
        <mesh position={[-FIELD.goalWidth / 2, postHeight / 2, 0]} material={postMaterial}>
          <boxGeometry args={[crossbarThickness, postHeight, crossbarThickness]} />
        </mesh>
        <mesh position={[0, postHeight, 0]} material={postMaterial}>
          <boxGeometry args={[FIELD.goalWidth, crossbarThickness, crossbarThickness]} />
        </mesh>
        <mesh position={[0, postHeight / 2, FIELD.goalDepth / 2]}>
          <boxGeometry args={[FIELD.goalWidth, postHeight, FIELD.goalDepth]} />
          <meshStandardMaterial color="#101010" wireframe />
        </mesh>
      </group>

      <group position={[0, 0, -halfLength - 0.3]}>
        <mesh position={[FIELD.goalWidth / 2, postHeight / 2, 0]} material={postMaterial}>
          <boxGeometry args={[crossbarThickness, postHeight, crossbarThickness]} />
        </mesh>
        <mesh position={[-FIELD.goalWidth / 2, postHeight / 2, 0]} material={postMaterial}>
          <boxGeometry args={[crossbarThickness, postHeight, crossbarThickness]} />
        </mesh>
        <mesh position={[0, postHeight, 0]} material={postMaterial}>
          <boxGeometry args={[FIELD.goalWidth, crossbarThickness, crossbarThickness]} />
        </mesh>
        <mesh position={[0, postHeight / 2, -FIELD.goalDepth / 2]}>
          <boxGeometry args={[FIELD.goalWidth, postHeight, FIELD.goalDepth]} />
          <meshStandardMaterial color="#101010" wireframe />
        </mesh>
      </group>
    </group>
  )
}

export default function Pitch() {
  const fieldLength = getFieldLength()
  const layout = getHexLayout()
  const boxWidth =
    (BOX.columns - 1) * (layout.hexWidth * 0.75) + layout.tileRadius * 2

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[FIELD.width, fieldLength]} />
        <meshStandardMaterial color="#2e6b2d" />
      </mesh>
      <FieldLines color="#efe9db" boxWidth={boxWidth} />
      <Goals />
    </group>
  )
}
