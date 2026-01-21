type BallMarkerProps = {
  position: [number, number, number]
}

export function BallMarker({ position }: BallMarkerProps) {
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.26, 24, 24]} />
        <meshStandardMaterial color="#f0f3f6" roughness={0.4} metalness={0.2} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[0.16, 0.28, 28]} />
        <meshBasicMaterial color="#111111" />
      </mesh>
    </group>
  )
}
