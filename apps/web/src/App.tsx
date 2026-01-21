import { useCallback, useEffect, useMemo, useState } from 'react'
import type { GameAction, GameState, OffsetCoord, TeamSide, TurnState } from '@vibe-kick/game-core'
import { MIDLINE_ROW, applyGameAction, createTurnState, queueTurnAction } from '@vibe-kick/game-core'
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
import { getPassTargets, getRunTargetPaths } from './ui/turn-rules'
import './App.css'

const DEFAULT_ZOOM = 26
const TEAM_USER_ID = 'team-user'
const TEAM_OPPONENT_ID = 'team-opponent'

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
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [turnState, setTurnState] = useState<TurnState | null>(null)
  const [selectedAction, setSelectedAction] = useState<'run' | 'pass' | null>(null)
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null)

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
    if (setupPhase === 'ready' && selectedAction) {
      return targetCells.has(`${hoveredCell.column}:${hoveredCell.row}`) ? 'valid' : 'invalid'
    }
    return null
  }, [hoveredCell, setupPhase, isValidPlayerCell, isValidBallCell, selectedAction, targetCells])

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

      if (setupPhase === 'ready' && selectedAction && selectedPlayerId && activeTeamId) {
        const key = `${cell.column}:${cell.row}`
        if (selectedAction === 'run') {
          const path = runTargets.get(key)
          if (!path) {
            return
          }
          applyTurnAction({
            type: 'run',
            teamId: activeTeamId,
            playerId: selectedPlayerId,
            path,
          })
        }
        if (selectedAction === 'pass') {
          const target = passTargets.get(key)
          if (!target) {
            return
          }
          applyTurnAction({
            type: 'pass',
            teamId: activeTeamId,
            playerId: selectedPlayerId,
            direction: target.direction,
            distance: target.distance,
          })
        }
      }
    },
    [
      setupPhase,
      selectedSide,
      selectedAction,
      selectedPlayerId,
      activeTeamId,
      isValidPlayerCell,
      isValidBallCell,
      runTargets,
      passTargets,
      applyTurnAction,
    ],
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

  const applyTurnAction = useCallback(
    (action: GameAction) => {
      if (!gameState || !turnState) {
        return
      }
      const actionResult = applyGameAction(gameState, action)
      if (!actionResult.ok) {
        return
      }
      const queueResult = queueTurnAction(turnState, {
        type: action.type,
        teamId: action.teamId,
        payload: { ...action },
      })
      if (!queueResult.ok) {
        return
      }
      setGameState({
        ...actionResult.state,
        activeTeamId: queueResult.state.activeTeamId,
        round: queueResult.state.round,
      })
      setTurnState(queueResult.state)
      setSelectedAction(null)
    },
    [gameState, turnState],
  )

  const handleSelectAction = useCallback(
    (action: 'run' | 'pass') => {
      if (action === 'run' && !runAvailable) {
        return
      }
      if (action === 'pass' && !passAvailable) {
        return
      }
      setSelectedAction(action)
    },
    [runAvailable, passAvailable],
  )

  const handleDiscardAction = useCallback(() => {
    if (!activeTeamId) {
      return
    }
    applyTurnAction({ type: 'discard', teamId: activeTeamId })
  }, [activeTeamId, applyTurnAction])

  const previewState = useMemo<GameState>(() => {
    const teams = []
    if (selectedSide) {
      const playerTeamId = TEAM_USER_ID
      const opponentTeamId = TEAM_OPPONENT_ID
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
      activeTeamId: selectedSide ? TEAM_USER_ID : '',
      round: 1,
    }
  }, [selectedSide, playerPositions, opponentPositions, ballPosition])
  const liveState = gameState ?? previewState

  useEffect(() => {
    if (setupPhase !== 'ready') {
      setGameState(null)
      setTurnState(null)
      setSelectedAction(null)
      return
    }
    if (!gameState) {
      setGameState(previewState)
      if (previewState.teams.length === 2) {
        setTurnState(createTurnState([TEAM_USER_ID, TEAM_OPPONENT_ID], TEAM_USER_ID, 1))
      }
    }
  }, [setupPhase, gameState, previewState])

  const activeTeamId = turnState?.activeTeamId ?? liveState.activeTeamId
  const activeTeam = liveState.teams.find((team) => team.id === activeTeamId) ?? null

  useEffect(() => {
    if (!activeTeam) {
      setSelectedPlayerId(null)
      return
    }
    if (!selectedPlayerId || !activeTeam.players.some((player) => player.id === selectedPlayerId)) {
      setSelectedPlayerId(activeTeam.players[0]?.id ?? null)
    }
  }, [activeTeam, selectedPlayerId])

  const runTargets = useMemo(() => {
    if (setupPhase !== 'ready' || selectedAction !== 'run' || !selectedPlayerId) {
      return new Map()
    }
    return getRunTargetPaths(liveState, selectedPlayerId)
  }, [setupPhase, selectedAction, selectedPlayerId, liveState])

  const passTargets = useMemo(() => {
    if (setupPhase !== 'ready' || selectedAction !== 'pass' || !selectedPlayerId) {
      return new Map()
    }
    return getPassTargets(liveState, selectedPlayerId)
  }, [setupPhase, selectedAction, selectedPlayerId, liveState])

  const runAvailable = useMemo(() => {
    if (setupPhase !== 'ready' || !selectedPlayerId) {
      return false
    }
    return getRunTargetPaths(liveState, selectedPlayerId).size > 0
  }, [setupPhase, selectedPlayerId, liveState])

  const passAvailable = useMemo(() => {
    if (setupPhase !== 'ready' || !selectedPlayerId) {
      return false
    }
    return getPassTargets(liveState, selectedPlayerId).size > 0
  }, [setupPhase, selectedPlayerId, liveState])

  const targetCells = useMemo(() => {
    const keys = selectedAction === 'run' ? runTargets.keys() : passTargets.keys()
    return new Set(Array.from(keys))
  }, [selectedAction, runTargets, passTargets])

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
        gameState={liveState}
        showBall={setupPhase === 'ready' ? true : Boolean(ballPosition)}
        hoverStatus={hoverStatus}
        targetCells={targetCells}
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
        activeTeamName={activeTeam?.name ?? ''}
        actionsRemaining={turnState?.actionsRemaining ?? 0}
        activePlayers={activeTeam?.players ?? []}
        selectedPlayerId={selectedPlayerId}
        selectedAction={selectedAction}
        onSelectPlayer={setSelectedPlayerId}
        onSelectAction={handleSelectAction}
        onDiscardAction={handleDiscardAction}
        runAvailable={runAvailable}
        passAvailable={passAvailable}
      />
    </div>
  )
}

export default App
