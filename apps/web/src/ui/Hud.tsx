export default function Hud({
  hoveredCell,
}: {
  hoveredCell: { column: number; row: number } | null
}) {
  return (
    <div className="hud">
      <span className="hud-title">Grid Kick</span>
      <span className="hud-subtitle">Stadium View Prototype</span>
      <span className="hud-subtitle">
        {hoveredCell ? `Hex ${hoveredCell.column},${hoveredCell.row}` : 'Hex --'}
      </span>
    </div>
  )
}
