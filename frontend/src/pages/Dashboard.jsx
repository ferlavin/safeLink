import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, PuzzlePiece, Question } from '@phosphor-icons/react'
import AppShell from '../components/AppShell'
import AdminDashboard from '../components/AdminDashboard'
import OnboardingTour from '../components/OnboardingTour'
import { useAuth } from '../context/AuthContext'
import { usePreferences } from '../context/PreferencesContext'
import { TOOL_CATEGORIES } from '../constants/tools'
import usePageView from '../hooks/usePageView'
import { useT } from '../i18n/I18nContext.jsx'

export default function Dashboard() {
  const { user, isAdmin } = useAuth()
  const { prefs, loaded } = usePreferences()
  const { t } = useT()
  const [showTour, setShowTour] = useState(false)
  const displayName = user?.full_name || user?.email?.split('@')[0] || ''

  usePageView('dashboard_view')

  useEffect(() => {
    if (!loaded || !user || isAdmin) return
    if (!prefs.tutorial_completado) {
      setShowTour(true)
    }
  }, [loaded, user, isAdmin, prefs.tutorial_completado])

  if (isAdmin) {
    return <AdminDashboard />
  }

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

  return (
    <AppShell>
      <OnboardingTour open={showTour} onClose={() => setShowTour(false)} />

      <div className="app-page-top">
        <div className="app-page-header">
          <span className="section-tag">{t('dashboard.tag')}</span>
          <h1>{t('dashboard.hello', { name: displayName })}</h1>
          <p>{t('dashboard.subtitle')}</p>
        </div>
        <Link to="/ayuda" className="btn-outline-gradient shrink-0 text-sm px-4 py-2">
          <Question size={16} className="inline mr-1" />
          {t('common.help')}
        </Link>
      </div>

      {prefs.modo_simple && (
        <div className="app-alert app-alert--info mb-6">{t('dashboard.simpleMode')}</div>
      )}

      <section className="app-highlight-card mb-6 rounded-xl p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-lg">
            <div className="mb-2 inline-flex items-center gap-2 text-neon-ice">
              <PuzzlePiece size={18} weight="fill" />
              <span className="text-xs font-medium">{t('dashboard.extensionTag')}</span>
            </div>
            <h2 className="text-base font-semibold sm:text-lg">{t('dashboard.extensionTitle')}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{t('dashboard.extensionBody')}</p>
          </div>
          <Link to="/extension" className="btn-gradient shrink-0 text-sm">
            {t('dashboard.installExtension')}
          </Link>
        </div>
      </section>

      <section className="app-card mb-6 p-5 sm:p-6">
        <h2 className="text-base font-semibold sm:text-lg">{t('dashboard.linksTitle')}</h2>
        <p className="mt-1 text-sm text-muted">{t('dashboard.linksBody')}</p>
        <Link to="/enlaces" className="btn-gradient mt-4 inline-block text-sm px-4 py-2">
          {t('dashboard.viewLinks')}
        </Link>
        <Link to="/mensajes" className="btn-outline-gradient mt-4 ml-0 inline-block text-sm px-4 py-2 sm:ml-3">
          {t('dashboard.messageInbox')}
        </Link>
      </section>

      {visibleCategories.map((cat) => (
        <section key={cat.id} className="mb-8 sm:mb-10">
          <h2 className="mb-1 text-base font-semibold sm:text-lg">{cat.title}</h2>
          <p className="mb-4 text-sm text-muted">{catDescription(cat.id)}</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {cat.tools.map((tool) => (
              <Link
                key={tool.name}
                to={tool.anchor ? `${tool.href}#${tool.anchor}` : tool.href}
                className="app-tool-card group block p-4 sm:p-5"
              >
                {tool.tag && (
                  <span className="text-[10px] font-medium tracking-wide text-muted">{tool.tag}</span>
                )}
                <h3 className="mt-1 text-sm font-semibold sm:text-base">{tool.name}</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted sm:text-sm">{tool.shortDesc}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-neon-ice group-hover:gap-2 transition-all">
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
