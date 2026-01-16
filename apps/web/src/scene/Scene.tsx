import { Canvas } from '@react-three/fiber'
import StadiumCamera from './StadiumCamera'
import Pitch from './Pitch'
import HexGrid from './HexGrid'
import type { HexCell } from './types'

export default function Scene({
  onHover,
}: {
  onHover: (cell: HexCell | null) => void
}) {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 11.5, -26], fov: 36, near: 0.1, far: 200 }}
    >
      <color attach="background" args={['#1f3a20']} />
      <fog attach="fog" args={['#1f3a20', 30, 60]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[8, 12, -6]} intensity={1.1} castShadow />
      <StadiumCamera />
      <Pitch />
      <HexGrid onHover={onHover} />
    </Canvas>
  )
}
