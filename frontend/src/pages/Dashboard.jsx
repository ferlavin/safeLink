import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, PuzzlePiece, Question } from '@phosphor-icons/react'
import AppShell from '../components/AppShell'
import OnboardingTour from '../components/OnboardingTour'
import { useAuth } from '../context/AuthContext'
import { usePreferences } from '../context/PreferencesContext'
import { TOOL_CATEGORIES } from '../constants/tools'

export default function Dashboard() {
  const { user, isAdmin } = useAuth()
  const { prefs, loaded } = usePreferences()
  const [showTour, setShowTour] = useState(false)

  useEffect(() => {
    if (!loaded || !user || isAdmin) return
    if (!prefs.tutorial_completado) {
      setShowTour(true)
    }
  }, [loaded, user, isAdmin, prefs.tutorial_completado])

  const visibleCategories = prefs.modo_simple
    ? TOOL_CATEGORIES.filter((cat) => cat.id === 'tecnico')
    : TOOL_CATEGORIES

  return (
    <AppShell>
      <OnboardingTour open={showTour} onClose={() => setShowTour(false)} />

      <div className="app-page-top">
        <div className="app-page-header">
          <span className="section-tag">Dashboard</span>
          <h1>Hola, {user?.full_name || user?.email?.split('@')[0]}</h1>
          <p>Tu centro de control para analizar enlaces, revisar amenazas y gestionar tu seguridad.</p>
        </div>
        <Link to="/ayuda" className="btn-outline-gradient shrink-0 text-sm px-4 py-2">
          <Question size={16} className="inline mr-1" />
          Ayuda
        </Link>
      </div>

      {prefs.modo_simple && (
        <div className="app-alert app-alert--info mb-6">
          Modo simple activo: men? reducido y textos m?s claros. Cambialo en Opciones de usuario.
        </div>
      )}

      <section className="app-highlight-card mb-6 rounded-xl p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-lg">
            <div className="mb-2 inline-flex items-center gap-2 text-neon-ice">
              <PuzzlePiece size={18} weight="fill" />
              <span className="text-xs font-medium">Extensi?n Chrome</span>
            </div>
            <h2 className="text-base font-semibold sm:text-lg">Extensi?n SafeLink para Chrome</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Un punto de color te avisa si un enlace es seguro: en la barra de Chrome y al
              lado de cada resultado en Google.
            </p>
          </div>
          <Link to="/extension" className="btn-gradient shrink-0 text-sm">
            Instalar extensi?n
          </Link>
        </div>
      </section>

      {isAdmin && (
        <section className="app-card mb-6 p-5 sm:p-6">
          <h2 className="text-base font-semibold sm:text-lg">Administraci?n</h2>
          <p className="mt-1 text-sm text-muted">
            Gesti?n de usuarios, reportes y cuentas de la plataforma.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link to="/admin/users" className="btn-gradient text-sm px-4 py-2">
              Gestionar usuarios
            </Link>
            <Link to="/admin/reportes" className="btn-outline-gradient text-sm px-4 py-2">
              Ver reportes
            </Link>
          </div>
        </section>
      )}

      <section className="app-card mb-6 p-5 sm:p-6">
        <h2 className="text-base font-semibold sm:text-lg">Tus enlaces escaneados</h2>
        <p className="mt-1 text-sm text-muted">
          Revis? el historial de URLs analizadas, sus escaneos y report? sitios sospechosos.
        </p>
        <Link to="/enlaces" className="btn-gradient mt-4 inline-block text-sm px-4 py-2">
          Ver mis enlaces
        </Link>
        <Link to="/mensajes" className="btn-outline-gradient mt-4 ml-0 inline-block text-sm px-4 py-2 sm:ml-3">
          Bandeja de mensajes
        </Link>
      </section>

      {visibleCategories.map((cat) => (
        <section key={cat.id} className="mb-8 sm:mb-10">
          <h2 className="mb-1 text-base font-semibold sm:text-lg">{cat.title}</h2>
          <p className="mb-4 text-sm text-muted">
            {cat.id === 'amenazas' &&
              'Protecci?n para billeteras crypto, PDFs de correo y sitios con nombres falsos.'}
            {cat.id === 'intel' &&
              'M?s informaci?n sobre un dominio sospechoso y mapa de alertas de la comunidad.'}
            {cat.id === 'tecnico' && 'Revisi?n r?pida de cualquier enlace antes de hacer clic.'}
            {cat.id === 'avanzado' &&
              'NLP, cabeceras HTTP, OAuth falso y formularios con doble env?o.'}
          </p>
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
                  Abrir
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
