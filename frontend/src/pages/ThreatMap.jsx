import { useCallback, useEffect, useState } from 'react'
import {
  GlobeHemisphereWest,
  Info,
  MapPin,
  Pulse,
  ShieldWarning,
} from '@phosphor-icons/react'
import ToolHeader from '../components/ToolHeader'
import AppShell from '../components/AppShell'
import StatusBadge from '../components/StatusBadge'
import WorldDotMap from '../components/WorldDotMap'
import client from '../api/client'
import { TOOLS } from '../constants/tools'
import { RISK_LABELS } from '../constants/labels'
import { projectToPercent } from '../utils/mapProjection'
import { useT } from '../i18n/I18nContext.jsx'

const LEVELS = [
  { id: 'medio', color: 'var(--warn-400)' },
  { id: 'alto', color: 'var(--high-400)' },
  { id: 'critico', color: 'var(--danger-400)' },
]

export default function ThreatMap() {
  const { t, dateLocale } = useT()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const loadMap = useCallback(() => {
    client
      .get('/analysis/threat-map', { params: { hours: 24 } })
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.detail || t('threatMap.loadError')))
      .finally(() => setLoading(false))
  }, [t])

  useEffect(() => {
    loadMap()
    const interval = setInterval(loadMap, 15000)
    return () => clearInterval(interval)
  }, [loadMap])

  const points = data?.points || []
  const detections = data?.amenazas_activas || 0
  const unknown = data?.sin_ubicacion || 0
  const hasDetections = detections > 0
  const emptyNoData = data && !hasDetections
  const emptyNoGeo = data && hasDetections && points.length === 0

  const updatedLabel = data?.actualizado
    ? t('threatMap.updatedAt', {
        time: new Date(data.actualizado).toLocaleTimeString(dateLocale, {
          hour: '2-digit',
          minute: '2-digit',
        }),
      })
    : t('threatMap.refreshHint')

  return (
    <AppShell>
      <div className="app-page-top">
        <ToolHeader tag={TOOLS.map.tag} name={TOOLS.map.name} description={TOOLS.map.longDesc} />
        {data && (
          <StatusBadge
            tone={hasDetections ? 'warn' : 'safe'}
            size="lg"
            pulse={false}
            className="shrink-0"
          >
            {hasDetections ? t('threatMap.badgeData') : t('threatMap.badgeWatching')}
          </StatusBadge>
        )}
      </div>

      <section className="app-section-card app-section-card--accent mt-0 mb-6">
        <h2 className="flex items-center gap-2">
          <Info size={18} weight="fill" className="text-[var(--accent-green)]" />
          {t('threatMap.introTitle')}
        </h2>
        <p className="mt-2">{t('threatMap.introLead')}</p>
        <div className="app-help-grid mt-4">
          <article className="app-help-card">
            <span className="sl-icon sl-icon--sm sl-icon--accent">
              <Pulse size={16} weight="bold" />
            </span>
            <h2>{t('threatMap.whatTitle')}</h2>
            <p>{t('threatMap.whatBody')}</p>
          </article>
          <article className="app-help-card">
            <span className="sl-icon sl-icon--sm sl-icon--accent">
              <ShieldWarning size={16} weight="bold" />
            </span>
            <h2>{t('threatMap.notTitle')}</h2>
            <p>{t('threatMap.notBody')}</p>
          </article>
          <article className="app-help-card">
            <span className="sl-icon sl-icon--sm sl-icon--accent">
              <MapPin size={16} weight="bold" />
            </span>
            <h2>{t('threatMap.geoTitle')}</h2>
            <p>{t('threatMap.geoBody')}</p>
          </article>
        </div>
      </section>

      {loading && !data && <p className="text-muted">{t('threatMap.loading')}</p>}
      {error && <div className="app-alert app-alert--error">{error}</div>}

      {data && (
        <>
          <div className="sl-metric-grid mb-4">
            <article className={`sl-metric${hasDetections ? '' : ' sl-metric--feature'}`}>
              <div className="sl-metric__head">
                <span className="sl-metric__label">{t('threatMap.detections')}</span>
                <span className={`sl-icon sl-icon--sm ${hasDetections ? 'sl-icon--danger' : 'sl-icon--accent'}`}>
                  <Pulse size={16} weight="bold" />
                </span>
              </div>
              <p
                className={`sl-metric__value ${
                  detections ? 'sl-metric__value--danger' : 'sl-metric__value--accent'
                }`}
                data-numeric
              >
                {detections}
              </p>
              <p className="sl-metric__foot">{t('threatMap.detectionsFoot')}</p>
            </article>

            <article className="sl-metric">
              <div className="sl-metric__head">
                <span className="sl-metric__label">{t('threatMap.mapPoints')}</span>
                <span className="sl-icon sl-icon--sm">
                  <GlobeHemisphereWest size={16} weight="bold" />
                </span>
              </div>
              <p className="sl-metric__value" data-numeric>
                {data.total_puntos}
              </p>
              <p className="sl-metric__foot">
                {updatedLabel}. {t('threatMap.mapPointsFoot')}
              </p>
            </article>

            {unknown > 0 && (
              <article className="sl-metric">
                <div className="sl-metric__head">
                  <span className="sl-metric__label">{t('threatMap.unknown')}</span>
                  <span className="sl-icon sl-icon--sm">
                    <MapPin size={16} weight="bold" />
                  </span>
                </div>
                <p className="sl-metric__value" data-numeric>
                  {unknown}
                </p>
                <p className="sl-metric__foot">{t('threatMap.unknownFoot')}</p>
              </article>
            )}
          </div>

          <div className="sl-map">
            <WorldDotMap />
            <div className="sl-map__meridians" aria-hidden="true" />
            <div className="sl-map__equator" aria-hidden="true" />
            <div className="sl-map__sweep" aria-hidden="true" />

            {points.map((p, i) => {
              const { x, y } = projectToPercent(p.lat, p.lon)
              const size = Math.min(26, 9 + p.weight * 4)
              const levelLabel = RISK_LABELS[p.level] || p.level
              return (
                <div
                  key={`${p.lat}-${p.lon}-${p.level}-${i}`}
                  title={t('threatMap.tooltipApprox', {
                    country: p.country || t('threatMap.unknown'),
                    level: levelLabel,
                    weight: p.weight,
                  })}
                  className={`sl-threat sl-threat--${p.level}`}
                  style={{ left: `${x}%`, top: `${y}%`, width: size, height: size }}
                />
              )
            })}

            <div className="sl-map__vignette" aria-hidden="true" />

            {(emptyNoData || emptyNoGeo) && (
              <div className="sl-map__idle">
                <span className="sl-icon sl-icon--lg sl-icon--accent sl-icon--glow">
                  <Pulse size={24} weight="duotone" />
                </span>
                <h2 className="sl-empty__title">
                  {emptyNoGeo ? t('threatMap.emptyGeoTitle') : t('threatMap.emptyTitle')}
                </h2>
                <p className="sl-empty__text">
                  {emptyNoGeo ? t('threatMap.emptyGeoBody') : t('threatMap.emptyBody')}
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <div className="sl-legend">
              {LEVELS.map((level) => (
                <span key={level.id} style={{ color: level.color }}>
                  <i />
                  <span className="text-[var(--text-secondary)]">{RISK_LABELS[level.id]}</span>
                </span>
              ))}
            </div>
            <p className="sl-meta">{t('threatMap.legendNote')}</p>
          </div>
        </>
      )}
    </AppShell>
  )
}
