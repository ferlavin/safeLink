import { Link } from 'react-router-dom'
import {
  BookOpen,
  ChatCircle,
  Globe,
  LinkSimple,
  MagnifyingGlass,
  PlayCircle,
  PuzzlePiece,
  Question,
  ShieldCheck,
} from '@phosphor-icons/react'
import AppShell from '../components/AppShell'
import { usePreferences } from '../context/PreferencesContext'
import { useT } from '../i18n/I18nContext.jsx'

const SECTIONS = [
  { key: 's1', icon: ShieldCheck },
  { key: 's2', icon: LinkSimple },
  { key: 's3', icon: MagnifyingGlass },
  { key: 's4', icon: ChatCircle },
  { key: 's5', icon: PuzzlePiece },
  { key: 's6', icon: Question },
  { key: 's7', icon: Globe },
]

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
        <button type="button" className="btn-gradient" onClick={restartTutorial}>
          <PlayCircle size={18} weight="fill" />
          {t('ayuda.interactiveGuide')}
        </button>
        <Link to="/dashboard" className="btn-outline-gradient">
          {t('ayuda.backHome')}
        </Link>
      </div>

      <div className="app-help-grid">
        {SECTIONS.map(({ key, icon: Icon }) => (
          <article key={key} className="app-help-card">
            <span className="sl-icon sl-icon--sm sl-icon--accent">
              <Icon size={16} weight="bold" />
            </span>
            <h2>{t(`ayuda.${key}Title`)}</h2>
            <p>{t(`ayuda.${key}Body`)}</p>
          </article>
        ))}
      </div>
    </AppShell>
  )
}
