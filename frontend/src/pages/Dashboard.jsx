import { Link } from 'react-router-dom'
import { ArrowRight, PuzzlePiece } from '@phosphor-icons/react'
import AppShell from '../components/AppShell'
import { useAuth } from '../context/AuthContext'
import { TOOL_CATEGORIES } from '../constants/tools'

export default function Dashboard() {
  const { user, isAdmin } = useAuth()

  return (
    <AppShell>
      <div className="app-page-top">
        <div className="app-page-header">
          <span className="section-tag">Dashboard</span>
          <h1>Hola, {user?.full_name || user?.email?.split('@')[0]}</h1>
          <p>Tu centro de control para analizar enlaces, revisar amenazas y gestionar tu seguridad.</p>
        </div>
      </div>

      <section className="app-highlight-card mb-6 rounded-xl p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-lg">
            <div className="mb-2 inline-flex items-center gap-2 text-neon-ice">
              <PuzzlePiece size={18} weight="fill" />
              <span className="text-xs font-medium">Extensión Chrome</span>
            </div>
            <h2 className="text-base font-semibold sm:text-lg">Extensión SafeLink para Chrome</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Un punto de color te avisa si un enlace es seguro: en la barra de Chrome y al
              lado de cada resultado en Google.
            </p>
          </div>
          <Link to="/extension" className="btn-gradient shrink-0 text-sm">
            Instalar extensión
          </Link>
        </div>
      </section>

      {isAdmin && (
        <section className="app-card mb-6 p-5 sm:p-6">
          <h2 className="text-base font-semibold sm:text-lg">Administración</h2>
          <p className="mt-1 text-sm text-muted">
            Gestión de usuarios, reportes y cuentas de la plataforma.
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
          Revisá el historial de URLs analizadas, sus escaneos y reportá sitios sospechosos.
        </p>
        <Link to="/enlaces" className="btn-gradient mt-4 inline-block text-sm px-4 py-2">
          Ver mis enlaces
        </Link>
      </section>

      {TOOL_CATEGORIES.map((cat) => (
        <section key={cat.id} className="mb-8 sm:mb-10">
          <h2 className="mb-1 text-base font-semibold sm:text-lg">{cat.title}</h2>
          <p className="mb-4 text-sm text-muted">
            {cat.id === 'amenazas' &&
              'Protección para billeteras crypto, PDFs de correo y sitios con nombres falsos.'}
            {cat.id === 'intel' &&
              'Más información sobre un dominio sospechoso y mapa de alertas de la comunidad.'}
            {cat.id === 'tecnico' && 'Revisión rápida de cualquier enlace antes de hacer clic.'}
            {cat.id === 'avanzado' &&
              'NLP, cabeceras HTTP, OAuth falso y formularios con doble envío.'}
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
