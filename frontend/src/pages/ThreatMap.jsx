import { useCallback, useEffect, useState } from 'react'
import { Info, Pulse, ShieldWarning, ArrowsClockwise } from '@phosphor-icons/react'
import ToolHeader from '../components/ToolHeader'
import AppShell from '../components/AppShell'
import StatusBadge from '../components/StatusBadge'
import WorldDotMap from '../components/WorldDotMap'
import client from '../api/client'
import { TOOLS } from '../constants/tools'
import { RISK_LABELS } from '../constants/labels'
import { useT } from '../i18n/I18nContext.jsx'

const REFRESH_MS = 60_000

export default function ThreatMap() {
  const { t, dateLocale } = useT()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const loadMap = useCallback(() => {
    client
      .get('/analysis/threat-map', { params: { hours: 24 } })
      .then((res) => {
        setData(res.data)
        setError('')
      })
      .catch((err) => setError(err.response?.data?.detail || t('threatMap.loadError')))
      .finally(() => setLoading(false))
  }, [t])

  useEffect(() => {
    loadMap()
    const interval = setInterval(loadMap, REFRESH_MS)
    return () => clearInterval(interval)
  }, [loadMap])

  const dominios = data?.dominios || []
  const detections = dominios.length
  const hasDetections = detections > 0

  const updatedLabel = data?.actualizado
    ? t('threatMap.updatedAt', {
        time: new Date(data.actualizado).toLocaleTimeString(dateLocale, {
          hour: '2-digit',
          minute: '2-digit',
        }),
      })
    : t('threatMap.refreshHint')

  const sourceLabel = (fuente) =>
    fuente === 'reporte' ? t('threatMap.sourceReport') : t('threatMap.sourceAnalysis')

  return (
    <AppShell>
      <div className="app-page-top">
        <ToolHeader tag={TOOLS.map.tag} name={TOOLS.map.name} description={TOOLS.map.longDesc} />
        {data && (
          <StatusBadge tone={hasDetections ? 'warn' : 'safe'} size="lg" pulse={false} className="shrink-0">
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
                <span className="sl-metric__label">{t('threatMap.reports')}</span>
              </div>
              <p className="sl-metric__value" data-numeric>
                {data.total_reportes ?? 0}
              </p>
              <p className="sl-metric__foot">
                {updatedLabel}. {t('threatMap.refreshHint')}
              </p>
            </article>
          </div>

          <div className="mb-4 flex justify-end">
            <button type="button" className="btn-outline-gradient text-xs px-3 py-1.5" onClick={loadMap}>
              <ArrowsClockwise size={14} weight="bold" />
              {t('threatMap.refresh')}
            </button>
          </div>

          <div className="sl-map">
            <WorldDotMap />
            <div className="sl-map__meridians" aria-hidden="true" />
            <div className="sl-map__equator" aria-hidden="true" />
            <div className="sl-map__vignette" aria-hidden="true" />
            <div className="sl-map__idle">
              <span className="sl-icon sl-icon--lg sl-icon--accent sl-icon--glow">
                <Pulse size={24} weight="duotone" />
              </span>
              <h2 className="sl-empty__title">
                {hasDetections ? t('threatMap.emptyGeoTitle') : t('threatMap.emptyTitle')}
              </h2>
              <p className="sl-empty__text">
                {hasDetections ? t('threatMap.emptyGeoBody') : t('threatMap.emptyBody')}
              </p>
            </div>
          </div>

          <section className="mt-8">
            <h2 className="mb-4 text-lg font-semibold">{t('threatMap.domainsTitle')}</h2>
            <div className="app-table-wrap">
              <table className="app-table">
                <thead>
                  <tr>
                    <th>{t('threatMap.domainCol')}</th>
                    <th>{t('threatMap.levelCol')}</th>
                    <th>{t('threatMap.sourceCol')}</th>
                    <th>{t('threatMap.countCol')}</th>
                    <th>{t('threatMap.updatedCol')}</th>
                  </tr>
                </thead>
                <tbody>
                  {dominios.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="app-table-empty">
                        {t('threatMap.domainsEmpty')}
                      </td>
                    </tr>
                  ) : (
                    dominios.map((row) => (
                      <tr key={row.dominio}>
                        <td className="cell-main">{row.dominio}</td>
                        <td>{RISK_LABELS[row.nivel] || row.nivel}</td>
                        <td>{sourceLabel(row.fuente)}</td>
                        <td>{row.peso}</td>
                        <td>
                          {row.ultimo_evento
                            ? new Date(row.ultimo_evento).toLocaleString(dateLocale)
                            : '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </AppShell>
  )
}
