import { Link } from 'react-router-dom'
import { BookOpen, PlayCircle } from '@phosphor-icons/react'
import AppShell from '../components/AppShell'
import { AYUDA_SECTIONS } from '../constants/onboarding'
import { usePreferences } from '../context/PreferencesContext'

export default function Ayuda() {
  const { updatePreferences } = usePreferences()

  const restartTutorial = async () => {
    await updatePreferences({ tutorial_completado: false })
    window.location.href = '/dashboard'
  }

  return (
    <AppShell>
      <div className="app-page-header">
        <span className="section-tag">Ayuda</span>
        <h1>¿Cómo usar SafeLink?</h1>
        <p>
          Guía paso a paso con lenguaje claro. Pensada para quienes recién empiezan o prefieren
          instrucciones simples.
        </p>
      </div>

      <div className="app-help-actions">
        <button type="button" className="btn-gradient text-sm" onClick={restartTutorial}>
          <PlayCircle size={18} weight="fill" className="inline mr-1" />
          Ver guía interactiva
        </button>
        <Link to="/dashboard" className="btn-outline-gradient text-sm">
          Volver al inicio
        </Link>
      </div>

      <div className="app-help-grid">
        {AYUDA_SECTIONS.map(({ title, body }) => (
          <article key={title} className="app-help-card">
            <BookOpen size={22} weight="fill" className="text-neon-ice mb-3" />
            <h2>{title}</h2>
            <p>{body}</p>
          </article>
        ))}
      </div>
    </AppShell>
  )
}
