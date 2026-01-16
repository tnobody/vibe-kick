import { useCallback, useState } from 'react'
import Scene from './scene/Scene'
import Hud from './ui/Hud'
import type { HexCell } from './scene/types'
import { BASE_PITCH, MAX_PITCH, MIN_PITCH, MAX_ZOOM, MIN_ZOOM } from './scene/StadiumCamera'
import './App.css'

const DEFAULT_ZOOM = 26

function App() {
  const [hoveredCell, setHoveredCell] = useState<HexCell | null>(null)
  const [zoom, setZoom] = useState(DEFAULT_ZOOM)
  const [yaw, setYaw] = useState(0)
  const [pitch, setPitch] = useState(BASE_PITCH)

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
