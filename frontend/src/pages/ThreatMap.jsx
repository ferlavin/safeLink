import { useCallback, useEffect, useState } from 'react'
import ToolHeader from '../components/ToolHeader'
import AppShell from '../components/AppShell'
import client from '../api/client'
import { TOOLS } from '../constants/tools'

const LEVEL_COLOR = {
  bajo: 'bg-emerald-400',
  medio: 'bg-amber-400',
  alto: 'bg-orange-500',
  critico: 'bg-rose-500',
}

function latLonToPercent(lat, lon) {
  const x = ((lon + 180) / 360) * 100
  const y = ((90 - lat) / 180) * 100
  return { x, y }
}

export default function ThreatMap() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const loadMap = useCallback(() => {
    client
      .get('/analysis/threat-map', { params: { hours: 24 } })
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.detail || 'No se pudo cargar el mapa'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    loadMap()
    const interval = setInterval(loadMap, 15000)
    return () => clearInterval(interval)
  }, [loadMap])

  return (
    <AppShell>
      <div className="mb-2 flex items-center gap-2">
        <span className="section-tag">{TOOLS.map.tag}</span>
        {data?.en_vivo && (
          <span className="app-live-badge">
            <span className="app-live-badge-dot" />
            En vivo
          </span>
        )}
      </div>
      <ToolHeader name={TOOLS.map.name} description={TOOLS.map.longDesc} />

      {loading && !data && <p className="text-muted">Cargando mapa...</p>}
      {error && <div className="app-alert app-alert--error">{error}</div>}

      {data && (
        <>
          <div className="app-map-stats">
            <span>
              Amenazas activas (24h): <strong>{data.amenazas_activas}</strong>
            </span>
            <span>
              Puntos en mapa: <strong>{data.total_puntos}</strong>
            </span>
            {data.actualizado && (
              <span>Actualizado: {new Date(data.actualizado).toLocaleTimeString()}</span>
            )}
          </div>

          <div className="app-map-viewport">
            <div className="app-map-grid" />
            {data.points.map((p, i) => {
              const { x, y } = latLonToPercent(p.lat, p.lon)
              const size = Math.min(32, 10 + p.weight * 5)
              return (
                <div
                  key={`${p.lat}-${p.lon}-${i}`}
                  title={`${p.country} — ${p.level} (${p.weight})`}
                  className={`absolute rounded-full opacity-85 shadow-lg ${LEVEL_COLOR[p.level] || 'bg-slate-400'}`}
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    width: size,
                    height: size,
                    transform: 'translate(-50%, -50%)',
                  }}
                />
              )
            })}
          </div>

          <p className="mt-3 text-xs text-muted">
            Se actualiza cada 15 segundos. Muestra sitios que otros usuarios marcaron como
            sospechosos o peligrosos.
          </p>
        </>
      )}
    </AppShell>
  )
}
