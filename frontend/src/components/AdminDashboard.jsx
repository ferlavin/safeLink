import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle, WarningCircle } from '@phosphor-icons/react'
import AppShell from './AppShell'
import { useAuth } from '../context/AuthContext'
import client from '../api/client'
import { useT } from '../i18n/I18nContext.jsx'

function StatCard({ label, value, children }) {
  return (
    <div className="app-stat-card">
      <span className="app-stat-card__label">{label}</span>
      <strong className="app-stat-card__value">{children ?? value}</strong>
    </div>
  )
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const { t, dateLocale } = useT()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const displayName = user?.full_name || user?.email?.split('@')[0] || ''

  const loadDashboard = useCallback(() => {
    setLoading(true)
    setError('')
    client
      .get('/admin/stats/dashboard', { params: { days: 30 } })
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.detail || t('dashboard.loadError')))
      .finally(() => setLoading(false))
  }, [t])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  const fmt = (value) => (value ?? 0).toLocaleString(dateLocale)
  const formatTime = (value) => {
    if (!value) return ''
    return new Date(value).toLocaleString(dateLocale, {
      dateStyle: 'short',
      timeStyle: 'short',
    })
  }

  const domains = data?.domains || []
  const activity = data?.activity || []
  const maxDomain = Math.max(...domains.map((d) => d.count), 1)

  return (
    <AppShell>
      <div className="app-page-header">
        <span className="section-tag">{t('dashboard.tag')}</span>
        <h1>{t('dashboard.hello', { name: displayName })}</h1>
        <p>{t('dashboard.adminSubtitle')}</p>
      </div>

      {error && <div className="app-alert app-alert--error mt-6">{error}</div>}

      <div className="app-stat-grid mt-6">
        <StatCard label={t('dashboard.systemStatus')}>
          <span className="inline-flex items-center gap-1.5">
            {error ? (
              <WarningCircle size={20} weight="fill" className="text-amber-400" />
            ) : (
              <CheckCircle size={20} weight="fill" className="text-[var(--accent-green)]" />
            )}
            {error ? t('dashboard.degraded') : t('dashboard.operational')}
          </span>
        </StatCard>
        <StatCard label={t('dashboard.totalUsers')} value={fmt(data?.total_users)} />
        <StatCard label={t('dashboard.activeUsersKpi')} value={fmt(data?.active_users)} />
        <StatCard label={t('dashboard.activeAlerts')} value={fmt(data?.open_reportes)} />
        <StatCard label={t('dashboard.eventsPeriod')} value={fmt(data?.total_events)} />
      </div>

      <section className="app-card mb-6 mt-6 p-5 sm:p-6">
        <h2 className="text-base font-semibold sm:text-lg">{t('dashboard.platformTitle')}</h2>
        <p className="mt-1 text-sm text-muted">{t('dashboard.adminBody')}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link to="/admin/users" className="btn-gradient text-sm px-4 py-2">
            {t('dashboard.manageUsers')}
          </Link>
          <Link to="/admin/reportes" className="btn-outline-gradient text-sm px-4 py-2">
            {t('dashboard.viewReports')}
          </Link>
          <Link to="/admin/estadisticas" className="btn-outline-gradient text-sm px-4 py-2">
            {t('dashboard.statistics')}
          </Link>
          <Link to="/admin/encuestas" className="btn-outline-gradient text-sm px-4 py-2">
            {t('nav.surveys')}
          </Link>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="app-section-card">
          <h2>{t('dashboard.mostAnalysed')}</h2>
          {loading ? (
            <p className="mt-3 text-sm text-muted">{t('common.loading')}</p>
          ) : !domains.length ? (
            <p className="mt-3 text-sm text-muted">{t('dashboard.noDomains')}</p>
          ) : (
            <ul className="app-stat-bars mt-3">
              {domains.map((item) => (
                <li key={item.domain} className="app-stat-bar">
                  <div className="app-stat-bar__head">
                    <span className="truncate">{item.domain}</span>
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
          <h2>{t('dashboard.activityLog')}</h2>
          {loading ? (
            <p className="mt-3 text-sm text-muted">{t('common.loading')}</p>
          ) : !activity.length ? (
            <p className="mt-3 text-sm text-muted">{t('common.noActivity')}</p>
          ) : (
            <div className="app-table-wrap mt-3">
              <table className="app-table">
                <thead>
                  <tr>
                    <th>{t('dashboard.activityColumn')}</th>
                    <th>{t('dashboard.userColumn')}</th>
                    <th>{t('dashboard.dateColumn')}</th>
                  </tr>
                </thead>
                <tbody>
                  {activity.map((item, index) => (
                    <tr key={index}>
                      <td className="cell-main">{item.label}</td>
                      <td>{item.usuario}</td>
                      <td className="whitespace-nowrap">{formatTime(item.fecha)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  )
}
