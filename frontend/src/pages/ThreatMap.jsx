import { useCallback, useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import ToolHeader from '../components/ToolHeader'
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
      .catch((err) =>
        setError(err.response?.data?.detail || 'No se pudo cargar el mapa'),
      )
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    loadMap()
    const interval = setInterval(loadMap, 15000)
    return () => clearInterval(interval)
  }, [loadMap])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium uppercase text-rose-400">
            {TOOLS.map.tag}
          </span>
          {data?.en_vivo && (
            <span className="flex items-center gap-1 rounded-full bg-rose-500/20 px-2 py-0.5 text-xs text-rose-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-400" />
              En vivo
            </span>
          )}
        </div>
        <ToolHeader name={TOOLS.map.name} description={TOOLS.map.longDesc} />

        {loading && !data && (
          <p className="text-slate-500">Cargando mapa...</p>
        )}
        {error && (
          <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {error}
          </div>
        )}

        {data && (
          <>
            <div className="flex flex-wrap gap-4 text-sm text-slate-400">
              <span>
                Amenazas activas (24h):{' '}
                <strong className="text-white">{data.amenazas_activas}</strong>
              </span>
              <span>
                Puntos en mapa:{' '}
                <strong className="text-white">{data.total_puntos}</strong>
              </span>
              {data.actualizado && (
                <span className="text-slate-500">
                  Actualizado: {new Date(data.actualizado).toLocaleTimeString()}
                </span>
              )}
            </div>

            <div className="relative mt-6 aspect-[2/1] overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950">
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)',
                  backgroundSize: '40px 40px',
                }}
              />
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

            <p className="mt-2 text-xs text-slate-500">
              Se actualiza cada 15 segundos. Muestra sitios que otros usuarios marcaron como
              sospechosos o peligrosos.
            </p>
          </>
        )}
      </main>
    </div>
  )
}
