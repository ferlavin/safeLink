import { Link } from 'react-router-dom'
import { BookOpen, PlayCircle } from '@phosphor-icons/react'
import AppShell from '../components/AppShell'
import { usePreferences } from '../context/PreferencesContext'
import { useT } from '../i18n/I18nContext.jsx'

const SECTION_KEYS = ['s1', 's2', 's3', 's4', 's5', 's6']

export default function Ayuda() {
  const { updatePreferences } = usePreferences()
  const { t } = useT()

  const restartTutorial = async () => {
    await updatePreferences({ tutorial_completado: false })
    window.location.href = '/dashboard'
  }

  return (
    <AppShell>
      <div className="app-page-header">
        <span className="section-tag">{t('ayuda.tag')}</span>
        <h1>{t('ayuda.title')}</h1>
        <p>{t('ayuda.subtitle')}</p>
      </div>

      <div className="app-help-actions">
        <button type="button" className="btn-gradient text-sm" onClick={restartTutorial}>
          <PlayCircle size={18} weight="fill" className="inline mr-1" />
          {t('ayuda.interactiveGuide')}
        </button>
        <Link to="/dashboard" className="btn-outline-gradient text-sm">
          {t('ayuda.backHome')}
        </Link>
      </div>

      <div className="app-help-grid">
        {SECTION_KEYS.map((key) => (
          <article key={key} className="app-help-card">
            <BookOpen size={22} weight="fill" className="text-neon-ice mb-3" />
            <h2>{t(`ayuda.${key}Title`)}</h2>
            <p>{t(`ayuda.${key}Body`)}</p>
          </article>
        ))}
      </div>
    </AppShell>
  )
}
