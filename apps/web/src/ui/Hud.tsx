export default function Hud({
  hoveredCell,
  zoom,
  onZoomChange,
  yaw,
  pitch,
  onYawToggle,
  onPitchChange,
  onResetView,
}: {
  hoveredCell: { column: number; row: number } | null
  zoom: number
  onZoomChange: (nextZoom: number) => void
  yaw: number
  pitch: number
  onYawToggle: () => void
  onPitchChange: (nextPitch: number) => void
  onResetView: () => void
}) {
  return (
    <div className="hud">
      <span className="hud-title">Grid Kick</span>
      <span className="hud-subtitle">Stadium View Prototype</span>
      <span className="hud-subtitle">
        {hoveredCell ? `Hex ${hoveredCell.column},${hoveredCell.row}` : 'Hex --'}
      </span>
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
