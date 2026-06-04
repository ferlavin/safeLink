import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import { TOOL_CATEGORIES } from '../constants/tools'

export default function Dashboard() {
  const { user, isAdmin } = useAuth()

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">
            Hola, {user?.full_name || user?.email}
          </h1>
        </div>

        <section className="mb-8 rounded-2xl border border-violet-500/30 bg-gradient-to-r from-violet-500/10 to-emerald-500/10 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-xl">
              <h2 className="text-lg font-semibold text-white">
                Extension SafeLink para Chrome
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                Un punto de color te avisa si un enlace es seguro: en la barra de Chrome y al
                lado de cada resultado en Google. Con tu sesion, recordamos los sitios que
                revisaste.
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-2">
              <Link
                to="/extension"
                className="rounded-lg bg-emerald-500 px-5 py-2.5 text-center text-sm font-semibold text-slate-950 hover:bg-emerald-400"
              >
                Instalar extension
              </Link>
            </div>
          </div>
        </section>

        {isAdmin && (
          <section className="mb-8 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6">
            <h2 className="text-lg font-semibold text-white">Administracion</h2>
            <p className="mt-1 text-sm text-slate-400">
              Gestion de usuarios, roles y cuentas de la plataforma.
            </p>
            <Link
              to="/admin/users"
              className="mt-4 inline-block rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
            >
              Gestionar usuarios
            </Link>
          </section>
        )}

        {TOOL_CATEGORIES.map((cat) => (
          <section key={cat.id} className="mb-10">
            <h2 className="mb-1 text-lg font-semibold text-white">{cat.title}</h2>
            <p className="mb-4 text-sm text-slate-500">
              {cat.id === 'amenazas' &&
                'Proteccion para billeteras crypto, PDFs de correo y sitios con nombres falsos.'}
              {cat.id === 'intel' &&
                'Mas informacion sobre un dominio sospechoso y mapa de alertas de la comunidad.'}
              {cat.id === 'tecnico' &&
                'Revision rapida de cualquier enlace antes de hacer clic.'}
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cat.tools.map((tool) => (
                <Link
                  key={tool.name}
                  to={
                    tool.anchor
                      ? `${tool.href}#${tool.anchor}`
                      : tool.href
                  }
                  className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 transition hover:border-emerald-500/50"
                >
                  {tool.tag && (
                    <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      {tool.tag}
                    </span>
                  )}
                  <h3 className="mt-1 font-semibold text-white">{tool.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">
                    {tool.shortDesc}
                  </p>
                  <span className="mt-3 inline-block text-sm text-emerald-400">
                    Abrir →
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
