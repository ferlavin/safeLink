import { useCallback, useEffect, useState } from 'react'
import { ChartBar, ClipboardText } from '@phosphor-icons/react'
import AppShell from '../components/AppShell'
import client from '../api/client'
import { useT } from '../i18n/I18nContext.jsx'

const PERIOD_KEYS = [
  { days: 7, labelKey: 'stats.period7' },
  { days: 30, labelKey: 'stats.period30' },
  { days: 90, labelKey: 'stats.period90' },
]

function StatCard({ label, value }) {
  return (
    <div className="app-stat-card">
      <span className="app-stat-card__label">{label}</span>
      <strong className="app-stat-card__value">{value.toLocaleString('es-AR')}</strong>
    </div>
  )
}

function QuestionStats({ pregunta }) {
  const { t } = useT()
  const maxOpcion = Math.max(...(pregunta.opciones?.map((o) => o.count) || [1]), 1)
  const responseLabel =
    pregunta.total_respuestas === 1 ? t('common.responses') : t('common.responsesPlural')

  return (
    <div className="app-survey-question">
      <h3>{pregunta.texto}</h3>
      <p className="app-survey-question__meta">
        {pregunta.total_respuestas} {responseLabel} ·{' '}
        {pregunta.tipo === 'opcion_multiple' ? t('stats.multipleChoice') : t('stats.freeText')}
      </p>

      {pregunta.tipo === 'opcion_multiple' ? (
        !pregunta.opciones?.length ? (
          <p className="text-sm text-muted mt-2">{t('common.noData')}</p>
        ) : (
          <ul className="app-stat-bars mt-3">
            {pregunta.opciones.map((item) => (
              <li key={item.opcion} className="app-stat-bar">
                <div className="app-stat-bar__head">
                  <span>{item.opcion}</span>
                  <span>
                    {item.count} ({item.percent}%)
                  </span>
                </div>
                <div className="app-stat-bar__track">
                  <div
                    className="app-stat-bar__fill"
                    style={{ width: `${Math.max(4, (item.count / maxOpcion) * 100)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )
      ) : !pregunta.muestras_texto?.length ? (
        <p className="text-sm text-muted mt-2">{t('common.noData')}</p>
      ) : (
        <ul className="app-survey-text-list mt-3">
          {pregunta.muestras_texto.map((texto, index) => (
            <li key={index}>{texto}</li>
          ))}
          {pregunta.total_respuestas > pregunta.muestras_texto.length && (
            <li className="app-survey-text-list__more">
              {t('stats.moreResponses', {
                count: pregunta.total_respuestas - pregunta.muestras_texto.length,
              })}
            </li>
          )}
        </ul>
      )}
    </div>
  )
}

export default function AdminEstadisticas() {
  const { t } = useT()
  const [days, setDays] = useState(30)
  const [overview, setOverview] = useState(null)
  const [features, setFeatures] = useState(null)
  const [encuestasSummary, setEncuestasSummary] = useState(null)
  const [selectedEncuestaId, setSelectedEncuestaId] = useState(null)
  const [encuestaDetail, setEncuestaDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const loadStats = useCallback(() => {
    setLoading(true)
    setError('')
    setSelectedEncuestaId(null)
    setEncuestaDetail(null)
    Promise.all([
      client.get('/admin/stats/overview', { params: { days } }),
      client.get('/admin/stats/features', { params: { days } }),
      client.get('/admin/stats/encuestas', { params: { days } }),
    ])
      .then(([overviewRes, featuresRes, encuestasRes]) => {
        setOverview(overviewRes.data)
        setFeatures(featuresRes.data)
        setEncuestasSummary(encuestasRes.data)
      })
      .catch((err) => {
        setError(err.response?.data?.detail || t('stats.loadError'))
      })
      .finally(() => setLoading(false))
  }, [days, t])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  const loadEncuestaDetail = async (encuestaId) => {
    setSelectedEncuestaId(encuestaId)
    setDetailLoading(true)
    setError('')
    try {
      const { data } = await client.get(`/admin/stats/encuestas/${encuestaId}`, {
        params: { days },
      })
      setEncuestaDetail(data)
    } catch (err) {
      setEncuestaDetail(null)
      setError(err.response?.data?.detail || 'No se pudo cargar el detalle de la encuesta')
    } finally {
      setDetailLoading(false)
    }
  }

  const maxFeature = features?.features?.[0]?.count || 1
  const maxDaily = Math.max(...(features?.daily?.map((d) => d.count) || [1]), 1)

  return (
    <AppShell>
      <div className="app-page-top">
        <div className="app-page-header">
          <span className="section-tag">{t('stats.tag')}</span>
          <h1>
            <ChartBar size={28} weight="fill" className="inline mr-2 text-[var(--accent-green)]" />
            {t('stats.title')}
          </h1>
          <p>{t('stats.subtitle')}</p>
        </div>
        <div className="app-stat-period">
          {PERIOD_KEYS.map((p) => (
            <button
              key={p.days}
              type="button"
              className={`app-stat-period__btn${days === p.days ? ' app-stat-period__btn--active' : ''}`}
              onClick={() => setDays(p.days)}
            >
              {t(p.labelKey)}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="app-alert app-alert--error mb-6">{error}</div>}

      {loading ? (
        <p className="text-[var(--text-muted)]">{t('stats.loading')}</p>
      ) : (
        <>
          <div className="app-stat-grid">
            <StatCard label={t('stats.totalEvents')} value={overview?.total_events ?? 0} />
            <StatCard label={t('stats.activeUsers')} value={overview?.active_users ?? 0} />
            <StatCard label={t('stats.newUsers')} value={overview?.new_users ?? 0} />
            <StatCard label={t('stats.openReports')} value={overview?.open_reportes ?? 0} />
            <StatCard label={t('stats.periodReports')} value={overview?.total_reportes ?? 0} />
            <StatCard
              label={t('stats.surveyResponses')}
              value={encuestasSummary?.respuestas_periodo ?? 0}
            />
          </div>

          <section className="app-section-card mt-8">
            <h2>{t('stats.toolUsage')}</h2>
            {!features?.features?.length ? (
              <p className="mt-3">{t('common.noData')}</p>
            ) : (
              <ul className="app-stat-bars">
                {features.features.map((item) => (
                  <li key={item.evento} className="app-stat-bar">
                    <div className="app-stat-bar__head">
                      <span>{item.label}</span>
                      <span>{item.count.toLocaleString('es-AR')}</span>
                    </div>
                    <div className="app-stat-bar__track">
                      <div
                        className="app-stat-bar__fill"
                        style={{ width: `${Math.max(4, (item.count / maxFeature) * 100)}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="app-section-card mt-6">
            <h2>{t('stats.dailyActivity')}</h2>
            {!features?.daily?.length ? (
              <p className="mt-3">{t('common.noActivity')}</p>
            ) : (
              <div className="app-stat-daily">
                {features.daily.map((day) => (
                  <div key={day.date} className="app-stat-daily__col" title={`${day.date}: ${day.count}`}>
                    <div
                      className="app-stat-daily__bar"
                      style={{ height: `${Math.max(6, (day.count / maxDaily) * 100)}%` }}
                    />
                    <span className="app-stat-daily__label">
                      {day.date.slice(5).replace('-', '/')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="app-section-card mt-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="flex items-center gap-2">
                <ClipboardText size={20} weight="fill" className="text-[var(--accent-green)]" />
                {t('stats.surveyResults')}
              </h2>
              <p className="text-sm text-muted">
                {t('stats.activeSurveys', {
                  active: encuestasSummary?.encuestas_activas ?? 0,
                  total: encuestasSummary?.total_respuestas ?? 0,
                })}
              </p>
            </div>

            {!encuestasSummary?.encuestas?.length ? (
              <p className="mt-3">{t('stats.noSurveys')}</p>
            ) : (
              <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,340px)_1fr]">
                <div className="app-table-wrap">
                  <table className="app-table min-w-[300px]">
                    <thead>
                      <tr>
                        <th>{t('common.survey')}</th>
                        <th>{t('common.period')}</th>
                        <th>{t('common.total')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {encuestasSummary.encuestas.map((encuesta) => (
                        <tr
                          key={encuesta.id}
                          className={
                            selectedEncuestaId === encuesta.id ? 'app-table-row--active' : ''
                          }
                        >
                          <td className="cell-main">
                            <button
                              type="button"
                              onClick={() => loadEncuestaDetail(encuesta.id)}
                              className="text-left hover:text-[var(--accent-green)] transition"
                            >
                              {encuesta.titulo}
                            </button>
                            <span
                              className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                encuesta.activa
                                  ? 'bg-emerald-500/15 text-emerald-400'
                                  : 'bg-[rgba(255,255,255,0.06)] text-muted'
                              }`}
                            >
                              {encuesta.activa ? t('common.active') : t('common.inactive')}
                            </span>
                          </td>
                          <td>{encuesta.respuestas_periodo}</td>
                          <td>{encuesta.respuestas_count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="app-survey-detail">
                  {!selectedEncuestaId ? (
                    <p className="text-muted">{t('common.selectSurveyStats')}</p>
                  ) : detailLoading ? (
                    <p className="text-muted">{t('stats.loadingResults')}</p>
                  ) : encuestaDetail ? (
                    <>
                      <h3 className="text-base font-semibold">{encuestaDetail.titulo}</h3>
                      <p className="mt-1 text-sm text-muted">
                        {t('stats.totalResponses', {
                          total: encuestaDetail.respuestas_count,
                          days: encuestaDetail.days,
                        })}
                      </p>
                      <div className="mt-5 space-y-5">
                        {encuestaDetail.preguntas.map((pregunta) => (
                          <QuestionStats key={pregunta.pregunta_id} pregunta={pregunta} />
                        ))}
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            )}
          </section>
        </>
      )}
    </AppShell>
  )
}
