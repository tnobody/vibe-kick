export default function Hud({
  hoveredCell,
  zoom,
  onZoomChange,
}: {
  hoveredCell: { column: number; row: number } | null
  zoom: number
  onZoomChange: (nextZoom: number) => void
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
    </div>
  )
}
