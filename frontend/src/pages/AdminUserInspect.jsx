import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, UserFocus } from '@phosphor-icons/react'
import AppShell from '../components/AppShell'
import RiskBadge from '../components/RiskBadge'
import UserAvatar from '../components/UserAvatar'
import client from '../api/client'
import { calcAge, countryLabel, experienceLabel } from '../constants/registration'
import { RISK_LABELS } from '../constants/labels'
import { useT } from '../i18n/I18nContext.jsx'

const PERIODS = [7, 30, 90]
const DEFAULT_AVATAR = { color: 'brand', style: 'initial' }

function getAccountStatus(user, t) {
  if (user?.is_banned) {
    return {
      label: t('inspect.banned'),
      className: 'bg-rose-500/15 text-rose-400 ring-1 ring-rose-500/30',
    }
  }
  if (!user?.is_active) {
    return {
      label: t('inspect.suspended'),
      className: 'bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30',
    }
  }
  return {
    label: t('inspect.active'),
    className: 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30',
  }
}

function accountAgeDays(createdAt) {
  if (!createdAt) return null
  const created = new Date(createdAt)
  if (Number.isNaN(created.getTime())) return null
  return Math.max(0, Math.floor((Date.now() - created.getTime()) / 86400000))
}

function shortDevice(ua) {
  if (!ua) return null
  if (/Edg\//i.test(ua)) return 'Edge'
  if (/Chrome\//i.test(ua)) return 'Chrome'
  if (/Firefox\//i.test(ua)) return 'Firefox'
  if (/Safari\//i.test(ua)) return 'Safari'
  return ua.length > 42 ? `${ua.slice(0, 42)}…` : ua
}

function StatCard({ label, value }) {
  return (
    <div className="app-stat-card">
      <span className="app-stat-card__label">{label}</span>
      <strong className="app-stat-card__value">{value}</strong>
    </div>
  )
}

function InfoItem({ label, children }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  )
}

function EmptyRow({ colSpan, children }) {
  return (
    <tr>
      <td colSpan={colSpan} className="app-table-empty">
        {children}
      </td>
    </tr>
  )
}

export default function AdminUserInspect() {
  const { userId } = useParams()
  const { t, dateLocale } = useT()
  const [days, setDays] = useState(30)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const formatDate = (value) => {
    if (!value) return t('inspect.none')
    return new Date(value).toLocaleString(dateLocale, {
      dateStyle: 'short',
      timeStyle: 'short',
    })
  }

  const fmt = (value) => (value ?? 0).toLocaleString(dateLocale)

  const loadInspect = useCallback(() => {
    setLoading(true)
    setError('')
    client
      .get(`/users/${userId}/inspect`, { params: { days } })
      .then((res) => setData(res.data))
      .catch((err) => {
        setData(null)
        const status = err.response?.status
        setError(
          status === 404
            ? t('inspect.notFound')
            : err.response?.data?.detail || t('inspect.loadError'),
        )
      })
      .finally(() => setLoading(false))
  }, [userId, days, t])

  useEffect(() => {
    loadInspect()
  }, [loadInspect])

  const profile = data?.profile
  const counts = data?.counts
  const status = getAccountStatus(profile, t)
  const displayName = profile?.full_name || profile?.email?.split('@')[0] || t('inspect.user')
  const age = calcAge(profile?.birth_date)
  const ageDays = accountAgeDays(profile?.created_at)
  const features = data?.features || []
  const maxFeature = features[0]?.count || 1
  const daily = data?.daily || []
  const maxDaily = Math.max(...daily.map((d) => d.count), 1)
  const riesgos = data?.riesgos || []
  const maxRisk = Math.max(...riesgos.map((r) => r.count), 1)
  const dominios = data?.dominios || []
  const maxDomain = Math.max(...dominios.map((d) => d.count), 1)

  return (
    <AppShell>
      <div className="app-page-top">
        <div className="app-page-header mb-0">
          <span className="section-tag">{t('inspect.tag')}</span>
          <h1>
            <UserFocus size={28} weight="fill" className="inline mr-2 text-[var(--accent-green)]" />
            {t('inspect.title')}
          </h1>
          <p>{t('inspect.subtitle')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link to="/admin/users" className="btn-outline-gradient text-sm px-4 py-2 inline-flex items-center gap-2">
            <ArrowLeft size={14} weight="bold" />
            {t('inspect.back')}
          </Link>
          <div className="app-stat-period">
            {PERIODS.map((period) => (
              <button
                key={period}
                type="button"
                className={`app-stat-period__btn${days === period ? ' app-stat-period__btn--active' : ''}`}
                onClick={() => setDays(period)}
              >
                {t(`stats.period${period}`)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && <div className="app-alert app-alert--error mb-6">{error}</div>}

      {loading ? (
        <p className="text-[var(--text-muted)]">{t('inspect.loading')}</p>
      ) : !profile ? null : (
        <>
          <section className="app-section-card app-section-card--accent mt-0">
            <div className="app-inspect-hero">
              <UserAvatar
                avatar={DEFAULT_AVATAR}
                displayName={displayName}
                photoUrl={profile.avatar_url}
                size="lg"
              />
              <div>
                <h2 className="text-xl font-semibold text-[var(--text-primary)]">{displayName}</h2>
                <p className="text-sm text-muted">{profile.email}</p>
                <div className="app-inspect-hero__meta">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      profile.role === 'admin'
                        ? 'bg-[rgba(0,255,135,0.12)] text-neon-ice'
                        : 'bg-[rgba(0,229,255,0.1)] text-ocean-twilight'
                    }`}
                  >
                    {profile.role === 'admin' ? t('inspect.admin') : t('inspect.user')}
                  </span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${status.className}`}>
                    {status.label}
                  </span>
                </div>
              </div>
            </div>

            <dl className="app-inspect-profile">
              <InfoItem label={t('inspect.registered')}>{formatDate(profile.created_at)}</InfoItem>
              <InfoItem label={t('inspect.lastLogin')}>{formatDate(profile.last_login)}</InfoItem>
              <InfoItem label={t('inspect.lastActivity')}>{formatDate(data.ultima_actividad)}</InfoItem>
              <InfoItem label={t('inspect.accountAge')}>
                {ageDays == null ? t('inspect.none') : t('inspect.accountAgeValue', { days: ageDays })}
              </InfoItem>
              <InfoItem label={t('inspect.country')}>{countryLabel(profile.country)}</InfoItem>
              <InfoItem label={t('inspect.age')}>
                {age == null ? t('inspect.none') : t('inspect.ageValue', { age })}
              </InfoItem>
              <InfoItem label={t('inspect.experience')}>
                {experienceLabel(profile.experience_level)}
              </InfoItem>
              <InfoItem label={t('inspect.language')}>
                {profile.idioma === 'en' ? 'English' : 'Español'}
              </InfoItem>
              <InfoItem label={t('inspect.alerts')}>
                {profile.security_alerts ? t('inspect.on') : t('inspect.off')}
              </InfoItem>
              <InfoItem label={t('inspect.tutorial')}>
                {profile.tutorial_completado ? t('inspect.completed') : t('inspect.pending')}
              </InfoItem>
              <InfoItem label={t('inspect.simpleMode')}>
                {profile.modo_simple ? t('inspect.yes') : t('inspect.no')}
              </InfoItem>
              <InfoItem label={t('inspect.terms')}>{formatDate(profile.terms_accepted_at)}</InfoItem>
              <InfoItem label={t('inspect.topTool')}>
                {data.herramienta_top?.label || t('inspect.none')}
              </InfoItem>
            </dl>
          </section>

          <h2 className="mt-8 mb-3 text-base font-semibold">{t('inspect.stats')}</h2>
          <div className="app-stat-grid">
            <StatCard label={t('inspect.analyses')} value={fmt(counts?.analyses)} />
            <StatCard label={t('inspect.links')} value={fmt(counts?.enlaces)} />
            <StatCard label={t('inspect.scans')} value={fmt(counts?.escaneos)} />
            <StatCard label={t('inspect.reports')} value={fmt(counts?.reportes)} />
            <StatCard label={t('inspect.openReports')} value={fmt(counts?.reportes_abiertos)} />
            <StatCard label={t('inspect.surveys')} value={fmt(counts?.encuestas)} />
            <StatCard label={t('inspect.logins')} value={fmt(counts?.logins)} />
            <StatCard label={t('inspect.events')} value={fmt(counts?.eventos_periodo)} />
            <StatCard label={t('inspect.extension')} value={fmt(counts?.extension_checks)} />
          </div>

          <div className="app-inspect-split mt-6">
            <section className="app-section-card mt-0">
              <h2>{t('inspect.tools')}</h2>
              {!features.length ? (
                <p className="mt-3">{t('inspect.noTools')}</p>
              ) : (
                <ul className="app-stat-bars">
                  {features.map((item) => (
                    <li key={item.evento} className="app-stat-bar">
                      <div className="app-stat-bar__head">
                        <span>{item.label}</span>
                        <span>{fmt(item.count)}</span>
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

            <section className="app-section-card mt-0">
              <h2>{t('inspect.risks')}</h2>
              {!riesgos.length ? (
                <p className="mt-3">{t('inspect.noAnalyses')}</p>
              ) : (
                <ul className="app-stat-bars">
                  {riesgos.map((item) => (
                    <li key={item.nivel} className="app-stat-bar">
                      <div className="app-stat-bar__head">
                        <span>{RISK_LABELS[item.nivel] || item.nivel}</span>
                        <span>{fmt(item.count)}</span>
                      </div>
                      <div className="app-stat-bar__track">
                        <div
                          className="app-stat-bar__fill"
                          style={{ width: `${Math.max(4, (item.count / maxRisk) * 100)}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <section className="app-section-card">
            <h2>{t('inspect.daily')}</h2>
            {!daily.length ? (
              <p className="mt-3">{t('common.noActivity')}</p>
            ) : (
              <div className="app-stat-daily">
                {daily.map((day) => (
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

          <section className="app-section-card">
            <h2>{t('inspect.domains')}</h2>
            {!dominios.length ? (
              <p className="mt-3">{t('inspect.noDomains')}</p>
            ) : (
              <ul className="app-stat-bars">
                {dominios.map((item) => (
                  <li key={item.domain} className="app-stat-bar">
                    <div className="app-stat-bar__head">
                      <span>{item.domain}</span>
                      <span>{fmt(item.count)}</span>
                    </div>
                    <div className="app-stat-bar__track">
                      <div
                        className="app-stat-bar__fill"
                        style={{ width: `${Math.max(4, (item.count / maxDomain) * 100)}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="app-section-card">
            <h2>{t('inspect.recentAnalyses')}</h2>
            <div className="app-table-wrap mt-4">
              <table className="app-table min-w-[520px]">
                <thead>
                  <tr>
                    <th>{t('inspect.url')}</th>
                    <th>{t('inspect.risk')}</th>
                    <th>{t('inspect.score')}</th>
                    <th>{t('inspect.date')}</th>
                  </tr>
                </thead>
                <tbody>
                  {!data.analisis_recientes?.length ? (
                    <EmptyRow colSpan={4}>{t('inspect.noAnalyses')}</EmptyRow>
                  ) : (
                    data.analisis_recientes.map((row) => (
                      <tr key={row.id}>
                        <td className="cell-main">
                          <span className="app-url-cell inline-block" title={row.url}>
                            {row.url}
                          </span>
                        </td>
                        <td>
                          <RiskBadge level={row.nivel_riesgo} />
                        </td>
                        <td>{row.puntuacion_riesgo ?? t('inspect.none')}</td>
                        <td>{formatDate(row.fecha_analisis)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <div className="app-inspect-split">
            <section className="app-section-card mt-6">
              <h2>{t('inspect.recentLogins')}</h2>
              <div className="app-table-wrap mt-4">
                <table className="app-table min-w-[360px]">
                  <thead>
                    <tr>
                      <th>{t('inspect.date')}</th>
                      <th>{t('inspect.ip')}</th>
                      <th>{t('inspect.device')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!data.logins_recientes?.length ? (
                      <EmptyRow colSpan={3}>{t('inspect.noLogins')}</EmptyRow>
                    ) : (
                      data.logins_recientes.map((row) => (
                        <tr key={row.id}>
                          <td>{formatDate(row.fecha)}</td>
                          <td>{row.ip || t('inspect.none')}</td>
                          <td title={row.dispositivo || ''}>
                            {shortDevice(row.dispositivo) || t('inspect.none')}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="app-section-card mt-6">
              <h2>{t('inspect.recentReports')}</h2>
              <div className="app-table-wrap mt-4">
                <table className="app-table min-w-[360px]">
                  <thead>
                    <tr>
                      <th>{t('inspect.reason')}</th>
                      <th>{t('inspect.state')}</th>
                      <th>{t('inspect.date')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!data.reportes_recientes?.length ? (
                      <EmptyRow colSpan={3}>{t('inspect.noReports')}</EmptyRow>
                    ) : (
                      data.reportes_recientes.map((row) => (
                        <tr key={row.id}>
                          <td className="cell-main">
                            <span className="app-url-cell inline-block" title={row.motivo || ''}>
                              {row.motivo || t('inspect.none')}
                            </span>
                          </td>
                          <td>{row.estado || t('inspect.none')}</td>
                          <td>{formatDate(row.fecha_reporte)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <section className="app-section-card">
            <h2>{t('inspect.recentActivity')}</h2>
            <div className="app-table-wrap mt-4">
              <table className="app-table min-w-[420px]">
                <thead>
                  <tr>
                    <th>{t('inspect.action')}</th>
                    <th>{t('inspect.date')}</th>
                  </tr>
                </thead>
                <tbody>
                  {!data.actividad_reciente?.length ? (
                    <EmptyRow colSpan={2}>{t('common.noActivity')}</EmptyRow>
                  ) : (
                    data.actividad_reciente.map((row, index) => (
                      <tr key={`${row.evento}-${row.fecha || index}`}>
                        <td className="cell-main">{row.label}</td>
                        <td>{formatDate(row.fecha)}</td>
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
