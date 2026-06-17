import { Link } from 'react-router-dom'
import { ArrowRight, PuzzlePiece } from '@phosphor-icons/react'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import { TOOL_CATEGORIES } from '../constants/tools'

export default function Dashboard() {
  const { user, isAdmin } = useAuth()

  return (
    <div className="app-page relative">
      <div className="absolute inset-0 bg-noise opacity-[0.02] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[min(400px,50vw)] h-[min(400px,50vw)] hero-blob-right rounded-full opacity-10 pointer-events-none" />

      <Navbar />

      <main className="relative z-10 mx-auto max-w-5xl px-4 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="landing-section-title font-semibold text-white">
            Hola, {user?.full_name || user?.email?.split('@')[0]}
          </h1>
        </div>

        <section className="app-highlight-card mb-6 rounded-2xl p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-lg">
              <div className="mb-2 inline-flex items-center gap-2 text-neon-ice">
                <PuzzlePiece size={18} weight="fill" />
                <span className="text-xs font-medium">Extensión Chrome</span>
              </div>
              <h2 className="text-base font-semibold text-white sm:text-lg">
                Extensión SafeLink para Chrome
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-white/45">
                Un punto de color te avisa si un enlace es seguro: en la barra de Chrome y al
                lado de cada resultado en Google. Con tu sesión, recordamos los sitios que
                revisaste.
              </p>
            </div>
            <Link
              to="/extension"
              className="app-btn-primary shrink-0 px-5 py-2.5 text-center text-sm hover:brightness-110 active:scale-[0.98]"
            >
              Instalar extensión
            </Link>
          </div>
        </section>

        {isAdmin && (
          <section className="app-card mb-6 rounded-2xl border-neon-ice/20 p-5 sm:p-6">
            <h2 className="text-base font-semibold text-white sm:text-lg">Administración</h2>
            <p className="mt-1 text-sm text-white/45">
              Gestión de usuarios, reportes y cuentas de la plataforma.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                to="/admin/users"
                className="app-btn-primary px-4 py-2 text-sm hover:brightness-110 active:scale-[0.98]"
              >
                Gestionar usuarios
              </Link>
              <Link
                to="/admin/reportes"
                className="app-btn-ghost px-4 py-2 text-sm"
              >
                Ver reportes
              </Link>
            </div>
          </section>
        )}

        <section className="app-card mb-6 rounded-2xl p-5 sm:p-6">
          <h2 className="text-base font-semibold text-white sm:text-lg">Tus enlaces escaneados</h2>
          <p className="mt-1 text-sm text-white/45">
            Revisá el historial de URLs analizadas, sus escaneos y reportá sitios sospechosos.
          </p>
          <Link
            to="/enlaces"
            className="app-btn-primary mt-4 inline-block px-4 py-2 text-sm hover:brightness-110 active:scale-[0.98]"
          >
            Ver mis enlaces
          </Link>
        </section>

        {TOOL_CATEGORIES.map((cat) => (
          <section key={cat.id} className="mb-8 sm:mb-10">
            <h2 className="mb-1 text-base font-semibold text-white sm:text-lg">{cat.title}</h2>
            <p className="mb-4 text-sm text-white/40">
              {cat.id === 'amenazas' &&
                'Protección para billeteras crypto, PDFs de correo y sitios con nombres falsos.'}
              {cat.id === 'intel' &&
                'Más información sobre un dominio sospechoso y mapa de alertas de la comunidad.'}
              {cat.id === 'tecnico' &&
                'Revisión rápida de cualquier enlace antes de hacer clic.'}
              {cat.id === 'avanzado' &&
                'NLP, cabeceras HTTP, OAuth falso y formularios con doble envío.'}
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {cat.tools.map((tool) => (
                <Link
                  key={tool.name}
                  to={
                    tool.anchor
                      ? `${tool.href}#${tool.anchor}`
                      : tool.href
                  }
                  className="app-tool-card group rounded-xl p-4 sm:p-5 hover:border-neon-ice/35 hover:-translate-y-0.5"
                >
                  {tool.tag && (
                    <span className="text-[10px] font-medium tracking-wide text-white/35">
                      {tool.tag}
                    </span>
                  )}
                  <h3 className="mt-1 text-sm font-semibold text-white sm:text-base">
                    {tool.name}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-white/45 sm:text-sm">
                    {tool.shortDesc}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-neon-ice group-hover:gap-2 transition-all">
                    Abrir
                    <ArrowRight size={14} weight="bold" />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  )
}
