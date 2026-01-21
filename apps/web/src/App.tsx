import { useCallback, useMemo, useState } from 'react'
import type { GameState } from '@vibe-kick/game-core'
import Scene from './scene/Scene'
import Hud from './ui/Hud'
import type { HexCell } from './scene/types'
import { BASE_PITCH, MAX_PITCH, MIN_PITCH, MAX_ZOOM, MIN_ZOOM } from './scene/StadiumCamera'
import './App.css'

const DEFAULT_ZOOM = 26

const baseSkills = {
  speed: 3,
  shoot: 2,
  passing: 3,
  dribbling: 2,
  defense: 1,
  physics: 2,
}

function App() {
  const [hoveredCell, setHoveredCell] = useState<HexCell | null>(null)
  const [zoom, setZoom] = useState(DEFAULT_ZOOM)
  const [yaw, setYaw] = useState(0)
  const [pitch, setPitch] = useState(BASE_PITCH)
  const gameState = useMemo<GameState>(
    () => ({
      teams: [
        {
          id: 'team-top',
          name: 'North',
          side: 'top',
          players: [
            { id: 'p1', name: 'Ava', skills: baseSkills, position: { col: 2, row: 4 } },
            { id: 'p2', name: 'Jo', skills: baseSkills, position: { col: 5, row: 4 } },
            { id: 'p3', name: 'Rex', skills: baseSkills, position: { col: 8, row: 4 } },
            { id: 'p4', name: 'May', skills: baseSkills, position: { col: 10, row: 4 } },
          ],
        },
        {
          id: 'team-bottom',
          name: 'South',
          side: 'bottom',
          players: [
            { id: 'p5', name: 'Zee', skills: baseSkills, position: { col: 2, row: 10 } },
            { id: 'p6', name: 'Bea', skills: baseSkills, position: { col: 5, row: 10 } },
            { id: 'p7', name: 'Kai', skills: baseSkills, position: { col: 8, row: 10 } },
            { id: 'p8', name: 'Lux', skills: baseSkills, position: { col: 10, row: 10 } },
          ],
        },
      ],
      ball: {
        position: { col: 5, row: 4 },
        carrierPlayerId: 'p2',
      },
      activeTeamId: 'team-top',
      round: 1,
    }),
    [],
  )

  const handleZoomChange = useCallback((nextZoom: number) => {
    const clamped = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, nextZoom))
    setZoom(clamped)
  }, [])

  const handleYawToggle = useCallback(() => {
    setYaw((current) => (current === 0 ? -Math.PI / 2 : 0))
  }, [])

  const handlePitchChange = useCallback((nextPitch: number) => {
    const clamped = Math.min(MAX_PITCH, Math.max(MIN_PITCH, nextPitch))
    setPitch(clamped)
  }, [])

  const handleResetView = useCallback(() => {
    setYaw(0)
    setPitch(BASE_PITCH)
  }, [])

  return (
    <div className="app">
      <Scene
        onHover={setHoveredCell}
        zoom={zoom}
        onZoomChange={handleZoomChange}
        yaw={yaw}
        pitch={pitch}
        onPitchChange={handlePitchChange}
        gameState={gameState}
      />
      <Hud
        hoveredCell={hoveredCell}
        zoom={zoom}
        onZoomChange={handleZoomChange}
        yaw={yaw}
        pitch={pitch}
        onYawToggle={handleYawToggle}
        onPitchChange={handlePitchChange}
        onResetView={handleResetView}
      />
    </div>
  )
}

export default App
