import { useMemo } from 'react'
import { projectToPercent } from '../utils/mapProjection'

// El SVG usa un viewBox 2:1 igual que el contenedor .sl-map, así los puntos
// quedan redondos en vez de estirarse.
const VIEW_W = 200
const VIEW_H = 100

const LON_STEP = 4
const LAT_STEP = 3.2

/**
 * Cajas lat/lon que aproximan las masas continentales. No busca precisión
 * cartográfica: a la densidad de puntos que usamos, el contorno se reconoce
 * igual y evita cargar un GeoJSON entero solo para un fondo decorativo.
 */
const LAND = [
  // América del Norte
  { lat: [49, 71], lon: [-168, -56] },
  { lat: [30, 49], lon: [-125, -72] },
  { lat: [16, 30], lon: [-112, -87] },
  { lat: [60, 82], lon: [-52, -22] },
  { lat: [7, 16], lon: [-92, -78] },
  // América del Sur
  { lat: [-4, 11], lon: [-79, -60] },
  { lat: [-23, -4], lon: [-74, -35] },
  { lat: [-40, -23], lon: [-72, -54] },
  { lat: [-54, -40], lon: [-74, -64] },
  // Europa
  { lat: [36, 60], lon: [-10, 30] },
  { lat: [55, 70], lon: [5, 30] },
  // África
  { lat: [12, 36], lon: [-16, 33] },
  { lat: [-12, 12], lon: [8, 42] },
  { lat: [-34, -12], lon: [13, 38] },
  // Asia
  { lat: [45, 72], lon: [28, 178] },
  { lat: [20, 45], lon: [35, 60] },
  { lat: [8, 35], lon: [68, 90] },
  { lat: [20, 45], lon: [95, 124] },
  { lat: [-10, 20], lon: [96, 120] },
  { lat: [31, 44], lon: [126, 145] },
  // Oceanía
  { lat: [-38, -11], lon: [113, 154] },
  { lat: [-46, -34], lon: [166, 179] },
]

const isLand = (lat, lon) =>
  LAND.some(
    (box) =>
      lat >= box.lat[0] && lat <= box.lat[1] && lon >= box.lon[0] && lon <= box.lon[1],
  )

function buildDots() {
  const dots = []
  for (let lat = 72; lat >= -56; lat -= LAT_STEP) {
    for (let lon = -180; lon <= 180; lon += LON_STEP) {
      if (!isLand(lat, lon)) continue
      const { x, y } = projectToPercent(lat, lon)
      dots.push({ x: (x / 100) * VIEW_W, y: (y / 100) * VIEW_H })
    }
  }
  return dots
}

/**
 * Fondo de continentes en dot-matrix. Es decorativo, por eso queda fuera del
 * árbol de accesibilidad: los datos reales son las marcas de amenaza.
 */
export default function WorldDotMap() {
  const dots = useMemo(() => buildDots(), [])

  return (
    <svg
      className="sl-map__land"
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      {dots.map((dot) => (
        <circle
          key={`${dot.x}-${dot.y}`}
          cx={dot.x}
          cy={dot.y}
          r="0.55"
          fill="currentColor"
        />
      ))}
    </svg>
  )
}
