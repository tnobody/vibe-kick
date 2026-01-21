export default function Hud({
  hoveredCell,
  hoverStatus,
  zoom,
  onZoomChange,
  yaw,
  pitch,
  onYawToggle,
  onPitchChange,
  onResetView,
  setupPhase,
  selectedSide,
  playerCount,
  ballPlaced,
  onSideSelect,
  onConfirmPlayers,
  onConfirmBall,
}: {
  hoveredCell: { column: number; row: number } | null
  hoverStatus: 'valid' | 'invalid' | null
  zoom: number
  onZoomChange: (nextZoom: number) => void
  yaw: number
  pitch: number
  onYawToggle: () => void
  onPitchChange: (nextPitch: number) => void
  onResetView: () => void
  setupPhase: 'side' | 'players' | 'ball' | 'ready'
  selectedSide: 'top' | 'bottom' | null
  playerCount: number
  ballPlaced: boolean
  onSideSelect: (side: 'top' | 'bottom') => void
  onConfirmPlayers: () => void
  onConfirmBall: () => void
}) {
  const hoverLabel = hoveredCell
    ? `Hex ${hoveredCell.column},${hoveredCell.row}`
    : 'Hex --'
  const hoverHint =
    hoverStatus === 'valid'
      ? 'Placement valid'
      : hoverStatus === 'invalid'
        ? 'Placement blocked'
        : ''

  return (
    <div className="hud">
      <span className="hud-title">Grid Kick</span>
      <span className="hud-subtitle">Stadium View Prototype</span>
      <span className="hud-subtitle">{hoverLabel}</span>
      {hoverHint && <span className="hud-subtitle hud-status">{hoverHint}</span>}
      <div className="hud-section">
        <span className="hud-subtitle">Setup</span>
        {setupPhase === 'side' && (
          <>
            <span className="hud-subtitle">Choose your side</span>
            <div className="hud-row">
              <button className="hud-button" type="button" onClick={() => onSideSelect('top')}>
                Top
              </button>
              <button className="hud-button" type="button" onClick={() => onSideSelect('bottom')}>
                Bottom
              </button>
            </div>
          </>
        )}
        {setupPhase === 'players' && (
          <>
            <span className="hud-subtitle">
              {selectedSide === 'top' ? 'Top side' : 'Bottom side'} players: {playerCount}/4
            </span>
            <button
              className="hud-button"
              type="button"
              onClick={onConfirmPlayers}
              disabled={playerCount < 4}
            >
              Confirm players
            </button>
          </>
        )}
        {setupPhase === 'ball' && (
          <>
            <span className="hud-subtitle">Place ball on midline</span>
            <button
              className="hud-button"
              type="button"
              onClick={onConfirmBall}
              disabled={!ballPlaced}
            >
              Confirm ball
            </button>
          </>
        )}
        {setupPhase === 'ready' && <span className="hud-subtitle">Setup complete</span>}
      </div>
      <label className="hud-control">
        Zoom
        <input
          type="range"
          min={18}
          max={40}
          step={0.5}
          value={zoom}
          onChange={(event) => onZoomChange(Number(event.target.value))}
        />
        <span className="hud-value">{zoom.toFixed(1)}</span>
      </label>
      <button className="hud-button" type="button" onClick={onYawToggle}>
        View Angle: {yaw === 0 ? '0°' : '-90°'}
      </button>
      <label className="hud-control">
        Pitch
        <input
          type="range"
          min={0}
          max={1.5708}
          step={0.01}
          value={pitch}
          onChange={(event) => onPitchChange(Number(event.target.value))}
        />
        <span className="hud-value">{(pitch * 57.2958).toFixed(1)}°</span>
      </label>
      <button className="hud-button" type="button" onClick={onResetView}>
        Reset View
      </button>
    </div>
  )
}
