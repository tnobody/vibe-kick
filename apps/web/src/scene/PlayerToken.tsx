import { RoundedBox, Text } from '@react-three/drei'

type PlayerTokenProps = {
  position: [number, number, number]
  jerseyColor?: string
  number?: string
}

export default function PlayerToken({
  position,
  jerseyColor = '#f2d851',
  number = '9',
}: PlayerTokenProps) {
  return (
    <group position={position} rotation={[0, Math.PI, 0]}>
      <RoundedBox args={[0.9, 0.9, 0.9]} radius={0.15} smoothness={4} position={[0, 0.95, 0]}>
        <meshStandardMaterial color="#efe6d8" />
      </RoundedBox>
      <mesh position={[-0.16, 0.98, 0.46]} scale={[0.7, 1.3, 1]}>
        <circleGeometry args={[0.12, 20]} />
        <meshBasicMaterial color="#111111" />
      </mesh>
      <mesh position={[0.16, 0.98, 0.46]} scale={[0.7, 1.3, 1]}>
        <circleGeometry args={[0.12, 20]} />
        <meshBasicMaterial color="#111111" />
      </mesh>
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.36, 0.36, 0.5, 24]} />
        <meshStandardMaterial color={jerseyColor} />
      </mesh>
      <mesh position={[0, 0.4, -0.38]}>
        <planeGeometry args={[0.24, 0.3]} />
        <meshBasicMaterial color="#111111" />
      </mesh>
      <mesh position={[0, 0.4, -0.381]}>
        <planeGeometry args={[0.18, 0.22]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <Text
        position={[0, 0.4, -0.383]}
        rotation={[0, Math.PI, 0]}
        fontSize={0.16}
        color="#111111"
        anchorX="center"
        anchorY="middle"
      >
        {number}
      </Text>
      <mesh position={[-0.14, 0.1, 0]}>
        <sphereGeometry args={[0.2, 20, 20]} />
        <meshStandardMaterial color={jerseyColor} />
      </mesh>
      <mesh position={[0.14, 0.1, 0]}>
        <sphereGeometry args={[0.2, 20, 20]} />
        <meshStandardMaterial color={jerseyColor} />
      </mesh>
    </group>
  )
}
