import { useCallback, useMemo, useState } from 'react'
import type { GameState, OffsetCoord, TeamSide } from '@vibe-kick/game-core'
import { MIDLINE_ROW } from '@vibe-kick/game-core'
import Scene from './scene/Scene'
import Hud from './ui/Hud'
import type { HexCell } from './scene/types'
import { BASE_PITCH, MAX_PITCH, MIN_PITCH, MAX_ZOOM, MIN_ZOOM } from './scene/StadiumCamera'
import {
  BOTTOM_ROW,
  TOP_ROW,
  isValidBallPlacement,
  isValidPlayerPlacement,
  togglePlayerPosition,
  type SetupPhase,
} from './ui/setup-rules'
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
  const [setupPhase, setSetupPhase] = useState<SetupPhase>('side')
  const [selectedSide, setSelectedSide] = useState<TeamSide | null>(null)
  const [playerPositions, setPlayerPositions] = useState<OffsetCoord[]>([])
  const [ballPosition, setBallPosition] = useState<OffsetCoord | null>(null)

  const opponentPositions = useMemo<OffsetCoord[]>(() => {
    if (!selectedSide) {
      return []
    }
    const row = selectedSide === 'top' ? BOTTOM_ROW : TOP_ROW
    return [
      { col: 2, row },
      { col: 5, row },
      { col: 8, row },
      { col: 10, row },
    ]
  }, [selectedSide])

  const setupContext = useMemo(
    () => ({
      phase: setupPhase,
      selectedSide,
      playerPositions,
      opponentPositions,
    }),
    [setupPhase, selectedSide, playerPositions, opponentPositions],
  )


  const isValidPlayerCell = useCallback(
    (cell: HexCell) => isValidPlayerPlacement({ col: cell.column, row: cell.row }, setupContext),
    [setupContext],
  )

  const isValidBallCell = useCallback(
    (cell: HexCell) => isValidBallPlacement({ col: cell.column, row: cell.row }, setupContext),
    [setupContext],
  )

  const hoverStatus = useMemo(() => {
    if (!hoveredCell) {
      return null
    }
    if (setupPhase === 'players') {
      return isValidPlayerCell(hoveredCell) ? 'valid' : 'invalid'
    }
    if (setupPhase === 'ball') {
      return isValidBallCell(hoveredCell) ? 'valid' : 'invalid'
    }
    return null
  }, [hoveredCell, setupPhase, isValidPlayerCell, isValidBallCell])

  const handleSideSelect = useCallback((side: TeamSide) => {
    setSelectedSide(side)
    setSetupPhase('players')
    setPlayerPositions([])
    setBallPosition(null)
  }, [])

  const handleCellSelect = useCallback(
    (cell: HexCell) => {
      if (setupPhase === 'players' && selectedSide) {
        const coord = { col: cell.column, row: cell.row }
        if (!isValidPlayerCell(cell)) {
          return
        }
        setPlayerPositions((current) => togglePlayerPosition(current, coord))
      }

      if (setupPhase === 'ball') {
        if (!isValidBallCell(cell)) {
          return
        }
        setBallPosition({ col: cell.column, row: cell.row })
      }
    },
    [setupPhase, selectedSide, isValidPlayerCell, isValidBallCell],
  )

  const handleConfirmPlayers = useCallback(() => {
    if (playerPositions.length === 4) {
      setSetupPhase('ball')
      setBallPosition(null)
    }
  }, [playerPositions.length])

  const handleConfirmBall = useCallback(() => {
    if (ballPosition) {
      setSetupPhase('ready')
    }
  }, [ballPosition])

  const gameState = useMemo<GameState>(() => {
    const teams = []
    if (selectedSide) {
      const playerTeamId = 'team-user'
      const opponentTeamId = 'team-opponent'
      const opponentSide: TeamSide = selectedSide === 'top' ? 'bottom' : 'top'
      teams.push({
        id: playerTeamId,
        name: 'You',
        side: selectedSide,
        players: playerPositions.map((position, index) => ({
          id: `p${index + 1}`,
          name: `Player ${index + 1}`,
          skills: baseSkills,
          position,
        })),
      })
      teams.push({
        id: opponentTeamId,
        name: 'Rivals',
        side: opponentSide,
        players: opponentPositions.map((position, index) => ({
          id: `r${index + 1}`,
          name: `Rival ${index + 1}`,
          skills: baseSkills,
          position,
        })),
      })
    }
    return {
      teams,
      ball: {
        position: ballPosition ?? { col: 6, row: MIDLINE_ROW },
      },
      activeTeamId: selectedSide ? 'team-user' : '',
      round: 1,
    }
  }, [selectedSide, playerPositions, opponentPositions, ballPosition])

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
        onSelect={handleCellSelect}
        zoom={zoom}
        onZoomChange={handleZoomChange}
        yaw={yaw}
        pitch={pitch}
        onPitchChange={handlePitchChange}
        gameState={gameState}
        showBall={Boolean(ballPosition)}
        hoverStatus={hoverStatus}
      />
      <Hud
        hoveredCell={hoveredCell}
        hoverStatus={hoverStatus}
        zoom={zoom}
        onZoomChange={handleZoomChange}
        yaw={yaw}
        pitch={pitch}
        onYawToggle={handleYawToggle}
        onPitchChange={handlePitchChange}
        onResetView={handleResetView}
        setupPhase={setupPhase}
        selectedSide={selectedSide}
        playerCount={playerPositions.length}
        ballPlaced={Boolean(ballPosition)}
        onSideSelect={handleSideSelect}
        onConfirmPlayers={handleConfirmPlayers}
        onConfirmBall={handleConfirmBall}
      />
    </div>
  )
}

export default App
