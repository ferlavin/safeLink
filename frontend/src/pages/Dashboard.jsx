import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ChartLineUp,
  PuzzlePiece,
  Question,
  ShieldCheck,
  ShieldWarning,
  Warning,
} from '@phosphor-icons/react'
import AppShell from '../components/AppShell'
import AdminDashboard from '../components/AdminDashboard'
import OnboardingTour from '../components/OnboardingTour'
import ActivityChart from '../components/ActivityChart'
import EmptyState from '../components/EmptyState'
import StatusBadge from '../components/StatusBadge'
import client from '../api/client'
import { useAuth } from '../context/AuthContext'
import { usePreferences } from '../context/PreferencesContext'
import { TOOL_CATEGORIES } from '../constants/tools'
import usePageView from '../hooks/usePageView'
import { useT } from '../i18n/I18nContext.jsx'

const ACTIVITY_DAYS = 14

function buildStats(enlaces) {
  const total = enlaces.length
  const threats = enlaces.filter((e) => e.estado === 'Peligroso').length
  const safe = enlaces.filter((e) => e.estado === 'Seguro').length
  const watch = enlaces.filter((e) => e.estado === 'Precaucion').length
  return {
    total,
    threats,
    watch,
    safeRate: total ? Math.round((safe / total) * 100) : 0,
  }
}

/**
 * Serie diaria de los últimos días. Cada enlace aporta a la fecha de su
 * último análisis, que es lo que expone /enlaces: mide enlaces revisados por
 * día, no escaneos totales.
 */
function buildActivity(enlaces) {
  const buckets = new Map()
  for (let i = ACTIVITY_DAYS - 1; i >= 0; i -= 1) {
    const day = new Date()
    day.setHours(0, 0, 0, 0)
    day.setDate(day.getDate() - i)
    buckets.set(day.getTime(), 0)
  }

  enlaces.forEach((enlace) => {
    if (!enlace.fecha_analisis) return
    const day = new Date(enlace.fecha_analisis)
    if (Number.isNaN(day.getTime())) return
    day.setHours(0, 0, 0, 0)
    const key = day.getTime()
    if (buckets.has(key)) buckets.set(key, buckets.get(key) + 1)
  })

  return [...buckets.entries()].map(([time, value]) => ({
    label: new Date(time).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' }),
    value,
  }))
}

function UserDashboard() {
  const { user } = useAuth()
  const { prefs, loaded } = usePreferences()
  const { t } = useT()
  const [showTour, setShowTour] = useState(false)
  const [enlaces, setEnlaces] = useState([])
  const displayName = user?.full_name || user?.email?.split('@')[0] || ''

  usePageView('dashboard_view')

  useEffect(() => {
    if (!loaded || !user) return
    if (!prefs.tutorial_completado) {
      setShowTour(true)
    }
  }, [loaded, user, prefs.tutorial_completado])

  // El panel se alimenta del historial que ya expone /enlaces: no hace falta
  // un endpoint de métricas aparte para estas cuatro cifras.
  useEffect(() => {
    let active = true
    client
      .get('/enlaces')
      .then(({ data }) => {
        if (active) setEnlaces(Array.isArray(data) ? data : [])
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])

  const stats = useMemo(() => buildStats(enlaces), [enlaces])
  const activity = useMemo(() => buildActivity(enlaces), [enlaces])
  const activityTotal = activity.reduce((sum, day) => sum + day.value, 0)

  const visibleCategories = prefs.modo_simple
    ? TOOL_CATEGORIES.filter((cat) => cat.id === 'tecnico')
    : TOOL_CATEGORIES

  const catDescription = (id) => {
    if (id === 'amenazas') return t('dashboard.catAmenazas')
    if (id === 'intel') return t('dashboard.catIntel')
    if (id === 'tecnico') return t('dashboard.catTecnico')
    if (id === 'avanzado') return t('dashboard.catAvanzado')
    return ''
  }

  const clear = stats.threats === 0

  return (
    <AppShell>
      <OnboardingTour open={showTour} onClose={() => setShowTour(false)} />

      <div className="app-page-top">
        <div className="app-page-header">
          <span className="section-tag">{t('dashboard.tag')}</span>
          <h1>{t('dashboard.hello', { name: displayName })}</h1>
          <p>{t('dashboard.subtitle')}</p>
        </div>
        <Link to="/ayuda" className="btn-outline-gradient shrink-0">
          <Question size={16} />
          {t('common.help')}
        </Link>
      </div>

      {prefs.modo_simple && (
        <div className="app-alert app-alert--info mb-6">{t('dashboard.simpleMode')}</div>
      )}

      <section className="sl-metric-grid mb-8">
        <article className="sl-metric sl-metric--feature">
          <div className="sl-metric__head">
            <span className="sl-metric__label">{t('dashboard.metricThreats')}</span>
            <span
              className={`sl-icon sl-icon--sm ${clear ? 'sl-icon--safe sl-icon--glow' : 'sl-icon--danger'}`}
            >
              {clear ? <ShieldCheck size={16} weight="fill" /> : <ShieldWarning size={16} weight="fill" />}
            </span>
          </div>
          <p
            className={`sl-metric__value ${clear ? 'sl-metric__value--accent' : 'sl-metric__value--danger'}`}
          >
            {stats.threats}
          </p>
          <p className="sl-metric__foot">
            {clear ? t('dashboard.metricThreatsFootClear') : t('dashboard.metricThreatsFootAlert')}
          </p>
        </article>

        <article className="sl-metric">
          <div className="sl-metric__head">
            <span className="sl-metric__label">{t('dashboard.metricScanned')}</span>
            <span className="sl-icon sl-icon--sm sl-icon--info">
              <ChartLineUp size={16} weight="bold" />
            </span>
          </div>
          <p className="sl-metric__value">{stats.total}</p>
          <p className="sl-metric__foot">{t('dashboard.metricScannedFoot')}</p>
        </article>

        <article className="sl-metric">
          <div className="sl-metric__head">
            <span className="sl-metric__label">{t('dashboard.metricSafe')}</span>
            <StatusBadge tone="safe">{t('dashboard.protectedTag')}</StatusBadge>
          </div>
          <p className="sl-metric__value">
            {stats.safeRate}
            <span className="sl-metric__unit">%</span>
          </p>
          <div className="sl-metric__bar text-[var(--safe-400)]">
            <span style={{ width: `${stats.safeRate}%` }} />
          </div>
          <p className="sl-metric__foot">{t('dashboard.metricSafeFoot')}</p>
        </article>

        <article className="sl-metric">
          <div className="sl-metric__head">
            <span className="sl-metric__label">{t('dashboard.metricWatch')}</span>
            <span className="sl-icon sl-icon--sm sl-icon--warn">
              <Warning size={16} weight="fill" />
            </span>
          </div>
          <p
            className={`sl-metric__value ${stats.watch > 0 ? 'sl-metric__value--warn' : ''}`}
          >
            {stats.watch}
          </p>
          <p className="sl-metric__foot">{t('dashboard.metricWatchFoot')}</p>
        </article>
      </section>

      <section className="sl-panel mb-8">
        <div className="sl-panel__head">
          <h2 className="sl-panel__title">
            <span className="sl-icon sl-icon--sm sl-icon--accent">
              <ChartLineUp size={15} weight="bold" />
            </span>
            {t('dashboard.activityTitle')}
          </h2>
          <span className="sl-eyebrow">{t('dashboard.activityRange')}</span>
        </div>
        <div className="sl-panel__body">
          {activityTotal === 0 ? (
            <EmptyState
              compact
              icon={ChartLineUp}
              title={t('dashboard.activityEmptyTitle')}
              description={t('dashboard.activityEmptyBody')}
              actions={
                <Link to="/analyze" className="btn-gradient">
                  {t('dashboard.analyzeCta')}
                </Link>
              }
            />
          ) : (
            <>
              <ActivityChart data={activity} ariaLabel={t('dashboard.activityTitle')} />
              <div className="sl-chart__axis">
                <span>{activity[0]?.label}</span>
                <span>{activity[activity.length - 1]?.label}</span>
              </div>
              <div className="sl-chart__legend mt-3">
                <span>
                  <b>{activityTotal}</b> {t('dashboard.activityTotal')}
                </span>
              </div>
            </>
          )}
        </div>
      </section>

      <section className="app-highlight-card mb-8 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-lg">
            <span className="sl-eyebrow mb-2">
              <PuzzlePiece size={14} weight="fill" />
              {t('dashboard.extensionTag')}
            </span>
            <h2 className="sl-h3">{t('dashboard.extensionTitle')}</h2>
            <p className="sl-lead mt-2">{t('dashboard.extensionBody')}</p>
          </div>
          <Link to="/extension" className="btn-gradient shrink-0">
            {t('dashboard.installExtension')}
          </Link>
        </div>
      </section>

      <section className="app-card mb-8 p-5 sm:p-6">
        <h2 className="sl-h3">{t('dashboard.linksTitle')}</h2>
        <p className="sl-lead mt-1">{t('dashboard.linksBody')}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link to="/enlaces" className="btn-gradient">
            {t('dashboard.viewLinks')}
          </Link>
          <Link to="/mensajes" className="btn-outline-gradient">
            {t('dashboard.messageInbox')}
          </Link>
        </div>
      </section>

      {visibleCategories.map((cat) => (
        <section key={cat.id} className="mb-8 sm:mb-10">
          <h2 className="sl-h2">{cat.title}</h2>
          <p className="sl-lead mt-1 mb-4">{catDescription(cat.id)}</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {cat.tools.map((tool) => (
              <Link
                key={tool.name}
                to={tool.anchor ? `${tool.href}#${tool.anchor}` : tool.href}
                className="app-tool-card group block p-4 sm:p-5"
              >
                {tool.tag && <span className="sl-eyebrow">{tool.tag}</span>}
                <h3 className="sl-h3 mt-1">{tool.name}</h3>
                <p className="sl-meta mt-2">{tool.shortDesc}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[var(--mint-400)] transition-all group-hover:gap-2">
                  {t('common.open')}
                  <ArrowRight size={14} weight="bold" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </AppShell>
  )
}

export default function Dashboard() {
  const { isAdmin } = useAuth()

  if (isAdmin) {
    return <AdminDashboard />
  }

  return <UserDashboard />
}
