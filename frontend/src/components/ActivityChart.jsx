import { useId } from 'react'

const VIEW_W = 100
const VIEW_H = 34

/**
 * Gráfico de área para series cortas (actividad diaria). SVG puro con
 * viewBox normalizado, así escala a cualquier ancho sin dependencias.
 */
export default function ActivityChart({ data = [], ariaLabel }) {
  const gradientId = useId()

  if (data.length < 2) return null

  const max = Math.max(1, ...data.map((d) => d.value))
  const stepX = VIEW_W / (data.length - 1)
  // Deja aire arriba y abajo para que la línea no toque los bordes del área.
  const toY = (value) => VIEW_H - 3 - (value / max) * (VIEW_H - 8)
  const points = data.map((d, i) => ({ ...d, x: i * stepX, y: toY(d.value) }))

  // Curva suave con control horizontal: evita picos duros entre días.
  const line = points.reduce((path, point, i) => {
    if (i === 0) return `M ${point.x} ${point.y}`
    const prev = points[i - 1]
    const midX = (prev.x + point.x) / 2
    return `${path} C ${midX} ${prev.y}, ${midX} ${point.y}, ${point.x} ${point.y}`
  }, '')
  const area = `${line} L ${VIEW_W} ${VIEW_H} L 0 ${VIEW_H} Z`

  return (
    <div className="sl-chart">
      <svg
        className="sl-chart__svg"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={ariaLabel}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--mint-400)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--mint-400)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g className="sl-chart__grid">
          {[0.25, 0.5, 0.75].map((ratio) => (
            <line key={ratio} x1="0" x2={VIEW_W} y1={VIEW_H * ratio} y2={VIEW_H * ratio} />
          ))}
        </g>
        <path d={area} fill={`url(#${gradientId})`} />
        <path className="sl-chart__line" d={line} vectorEffect="non-scaling-stroke" />
        {points.map((point) => (
          <g className="sl-chart__col" key={point.label}>
            <rect
              className="sl-chart__hit"
              x={point.x - stepX / 2}
              y="0"
              width={stepX}
              height={VIEW_H}
            >
              <title>{`${point.label}: ${point.value}`}</title>
            </rect>
            <circle
              className="sl-chart__point"
              cx={point.x}
              cy={point.y}
              r="2"
              vectorEffect="non-scaling-stroke"
            />
          </g>
        ))}
      </svg>
    </div>
  )
}
