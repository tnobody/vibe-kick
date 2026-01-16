import { useState } from 'react'
import Scene from './scene/Scene'
import Hud from './ui/Hud'
import type { HexCell } from './scene/types'
import './App.css'

function App() {
  const [hoveredCell, setHoveredCell] = useState<HexCell | null>(null)

  return (
    <div className="app">
      <Scene onHover={setHoveredCell} />
      <Hud hoveredCell={hoveredCell} />
    </div>
  )
}

export default App
