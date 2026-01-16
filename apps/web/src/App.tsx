import { useCallback, useState } from 'react'
import Scene from './scene/Scene'
import Hud from './ui/Hud'
import type { HexCell } from './scene/types'
import './App.css'

const DEFAULT_ZOOM = 26
const MIN_ZOOM = 18
const MAX_ZOOM = 40

function App() {
  const [hoveredCell, setHoveredCell] = useState<HexCell | null>(null)
  const [zoom, setZoom] = useState(DEFAULT_ZOOM)

  const handleZoomChange = useCallback((nextZoom: number) => {
    const clamped = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, nextZoom))
    setZoom(clamped)
  }, [])

  return (
    <div className="app">
      <Scene onHover={setHoveredCell} zoom={zoom} onZoomChange={handleZoomChange} />
      <Hud hoveredCell={hoveredCell} zoom={zoom} onZoomChange={handleZoomChange} />
    </div>
  )
}

export default App
