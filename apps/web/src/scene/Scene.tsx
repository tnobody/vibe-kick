import { Canvas } from '@react-three/fiber'
import type { GameState } from '@vibe-kick/game-core'
import { useMemo } from 'react'
import StadiumCamera from './StadiumCamera'
import Pitch from './Pitch'
import HexGrid from './HexGrid'
import PlayerToken from './PlayerToken'
import { BallMarker } from './BallMarker'
import { buildFieldStateIndex } from './field-state'
import { getHexLayout, getHexPosition } from './grid'
import type { HexCell } from './types'
import type { HoverStatus } from './HexGrid'

export default function Scene({
  onHover,
  onSelect,
  zoom,
  onZoomChange,
  yaw,
  pitch,
  onPitchChange,
  gameState,
  showBall,
  hoverStatus,
}: {
  onHover: (cell: HexCell | null) => void
  onSelect: (cell: HexCell) => void
  zoom: number
  onZoomChange: (nextZoom: number) => void
  yaw: number
  pitch: number
  onPitchChange: (nextPitch: number) => void
  gameState: GameState
  showBall: boolean
  hoverStatus: HoverStatus
}) {
  const layout = useMemo(() => getHexLayout(), [])
  const fieldStateIndex = useMemo(
    () => buildFieldStateIndex(gameState, { includeBall: showBall }),
    [gameState, showBall],
  )
  const players = useMemo(
    () =>
      gameState.teams.flatMap((team) =>
        team.players.map((player) => ({
          id: player.id,
          teamId: team.id,
          position: getHexPosition(layout, player.position.col, player.position.row),
          number: player.id.slice(-2),
          jerseyColor: team.side === 'top' ? '#f2d851' : '#5cc8ff',
        })),
      ),
    [gameState, layout],
  )
  const ballPosition = useMemo(() => {
    const [x, y, z] = getHexPosition(
      layout,
      gameState.ball.position.col,
      gameState.ball.position.row,
    )
    return [x, y + 0.35, z] as [number, number, number]
  }, [gameState, layout])

  return (
    <Canvas
      shadows
      camera={{ position: [0, 11.5, -26], fov: 36, near: 0.1, far: 200 }}
    >
      <color attach="background" args={['#1f3a20']} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[8, 12, -6]} intensity={1.1} castShadow />
      <StadiumCamera
        zoom={zoom}
        onZoomChange={onZoomChange}
        yaw={yaw}
        pitch={pitch}
        onPitchChange={onPitchChange}
      />
      <Pitch />
      {players.map((player) => (
        <PlayerToken
          key={player.id}
          position={[player.position[0], player.position[1] + 0.15, player.position[2]]}
          number={player.number}
          jerseyColor={player.jerseyColor}
        />
      ))}
      {showBall && <BallMarker position={ballPosition} />}
      <HexGrid
        onHover={onHover}
        onSelect={onSelect}
        fieldStateIndex={fieldStateIndex}
        hoverStatus={hoverStatus}
      />
    </Canvas>
  )
}
