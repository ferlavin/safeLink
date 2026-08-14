import { useCallback, useEffect, useState } from 'react'
import { GlobeHemisphereWest, Pulse } from '@phosphor-icons/react'
import ToolHeader from '../components/ToolHeader'
import AppShell from '../components/AppShell'
import StatusBadge from '../components/StatusBadge'
import WorldDotMap from '../components/WorldDotMap'
import client from '../api/client'
import { TOOLS } from '../constants/tools'
import { projectToPercent } from '../utils/mapProjection'

const LEVELS = [
  { id: 'bajo', label: 'Bajo', color: 'var(--safe-400)' },
  { id: 'medio', label: 'Medio', color: 'var(--warn-400)' },
  { id: 'alto', label: 'Alto', color: 'var(--high-400)' },
  { id: 'critico', label: 'Crítico', color: 'var(--danger-400)' },
]

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

  const points = data?.points || []

  return (
    <AppShell>
      <div className="app-page-top">
        <ToolHeader tag={TOOLS.map.tag} name={TOOLS.map.name} description={TOOLS.map.longDesc} />
        {data && (
          <StatusBadge tone={points.length ? 'danger' : 'safe'} size="lg" pulse className="shrink-0">
            {points.length ? 'En vivo' : 'Vigilando'}
          </StatusBadge>
        )}
      </div>

      {loading && !data && <p className="text-muted">Cargando mapa...</p>}
      {error && <div className="app-alert app-alert--error">{error}</div>}

      {data && (
        <>
          <div className="sl-metric-grid mb-4">
            <article className={`sl-metric${points.length ? '' : ' sl-metric--feature'}`}>
              <div className="sl-metric__head">
                <span className="sl-metric__label">Amenazas activas (24 h)</span>
                <span className={`sl-icon sl-icon--sm ${points.length ? 'sl-icon--danger' : 'sl-icon--accent'}`}>
                  <Pulse size={16} weight="bold" />
                </span>
              </div>
              <p
                className={`sl-metric__value ${
                  data.amenazas_activas ? 'sl-metric__value--danger' : 'sl-metric__value--accent'
                }`}
                data-numeric
              >
                {data.amenazas_activas}
              </p>
              <p className="sl-metric__foot">Sitios que la comunidad marcó como peligrosos.</p>
            </article>

            <article className="sl-metric">
              <div className="sl-metric__head">
                <span className="sl-metric__label">Puntos en el mapa</span>
                <span className="sl-icon sl-icon--sm">
                  <GlobeHemisphereWest size={16} weight="bold" />
                </span>
              </div>
              <p className="sl-metric__value" data-numeric>
                {data.total_puntos}
              </p>
              <p className="sl-metric__foot">
                {data.actualizado
                  ? `Actualizado ${new Date(data.actualizado).toLocaleTimeString()}`
                  : 'Se refresca cada 15 segundos.'}
              </p>
            </article>
          </div>

          <div className="sl-map">
            <WorldDotMap />
            <div className="sl-map__meridians" aria-hidden="true" />
            <div className="sl-map__equator" aria-hidden="true" />
            <div className="sl-map__sweep" aria-hidden="true" />

            {points.map((p, i) => {
              const { x, y } = projectToPercent(p.lat, p.lon)
              const size = Math.min(26, 9 + p.weight * 4)
              return (
                <div
                  key={`${p.lat}-${p.lon}-${i}`}
                  title={`${p.country} — ${p.level} (${p.weight})`}
                  className={`sl-threat sl-threat--${p.level}`}
                  style={{ left: `${x}%`, top: `${y}%`, width: size, height: size }}
                />
              )
            })}

            <div className="sl-map__vignette" aria-hidden="true" />

            {points.length === 0 && (
              <div className="sl-map__idle">
                <span className="sl-icon sl-icon--lg sl-icon--accent sl-icon--glow">
                  <Pulse size={24} weight="duotone" />
                </span>
                <h2 className="sl-empty__title">Sin alertas en las últimas 24 horas</h2>
                <p className="sl-empty__text">
                  El radar sigue activo. En cuanto alguien de la comunidad marque un sitio como
                  sospechoso, va a aparecer sobre el mapa.
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <div className="sl-legend">
              {LEVELS.map((level) => (
                <span key={level.id} style={{ color: level.color }}>
                  <i />
                  <span className="text-[var(--text-secondary)]">{level.label}</span>
                </span>
              ))}
            </div>
            <p className="sl-meta">
              Se actualiza cada 15 segundos con los sitios que otros usuarios marcaron como
              sospechosos o peligrosos.
            </p>
          </div>
        </>
      )}
    </AppShell>
  )
}
