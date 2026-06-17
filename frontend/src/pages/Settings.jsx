import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import ThemeToggle from '../components/ThemeToggle'
import { useTheme } from '../context/ThemeContext'
import client from '../api/client'

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

export default function Settings() {
  const { prefs, setCompact, setHighContrast, resetPrefs } = useTheme()
  const [loginHistory, setLoginHistory] = useState([])
  const [myReportes, setMyReportes] = useState([])
  const [loadingActivity, setLoadingActivity] = useState(true)

  useEffect(() => {
    const loadActivity = async () => {
      setLoadingActivity(true)
      try {
        const [historyRes, reportesRes] = await Promise.all([
          client.get('/auth/login-history'),
          client.get('/reportes/mine'),
        ])
        setLoginHistory(historyRes.data)
        setMyReportes(reportesRes.data)
      } catch {
        /* actividad opcional */
      } finally {
        setLoadingActivity(false)
      }
    }
    loadActivity()
  }, [])

  return (
    <div className="app-page relative">
      <div className="absolute inset-0 bg-noise opacity-[0.02] pointer-events-none" />
      <Navbar />

      <main className="relative z-10 mx-auto max-w-lg px-4 py-8">
        <h1 className="landing-section-title font-semibold text-[var(--app-text)]">
          Apariencia
        </h1>
        <p className="mt-2 text-sm text-[var(--app-text-muted)]">
          Personalizá cómo se ve SafeLink en tu dispositivo.
        </p>

        <section className="app-card mt-6 space-y-6 rounded-2xl p-6">
          <div>
            <h2 className="text-sm font-semibold text-[var(--app-text)]">Tema</h2>
            <p className="mt-1 mb-3 text-xs text-[var(--app-text-muted)]">
              Modo oscuro, claro o según tu sistema operativo.
            </p>
            <ThemeToggle />
          </div>

          <div className="border-t border-[var(--app-border)] pt-5">
            <label className="flex cursor-pointer items-center justify-between gap-4">
              <div>
                <span className="text-sm font-medium text-[var(--app-text)]">
                  Modo compacto
                </span>
                <p className="text-xs text-[var(--app-text-muted)]">
                  Reduce espaciados y tamaño de texto en pantallas de herramientas.
                </p>
              </div>
              <input
                type="checkbox"
                checked={prefs.compact}
                onChange={(e) => setCompact(e.target.checked)}
                className="h-4 w-4 accent-[var(--app-accent)]"
              />
            </label>
          </div>

          <div className="border-t border-[var(--app-border)] pt-5">
            <label className="flex cursor-pointer items-center justify-between gap-4">
              <div>
                <span className="text-sm font-medium text-[var(--app-text)]">
                  Alto contraste
                </span>
                <p className="text-xs text-[var(--app-text-muted)]">
                  Bordes y textos más marcados para mejor legibilidad.
                </p>
              </div>
              <input
                type="checkbox"
                checked={prefs.highContrast}
                onChange={(e) => setHighContrast(e.target.checked)}
                className="h-4 w-4 accent-[var(--app-accent)]"
              />
            </label>
          </div>

          <button
            type="button"
            onClick={resetPrefs}
            className="app-btn-ghost w-full py-2 text-sm"
          >
            Restaurar valores predeterminados
          </button>
        </section>

        <section className="app-card mt-6 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-[var(--app-text)]">Actividad de cuenta</h2>
          <p className="mt-1 mb-4 text-xs text-[var(--app-text-muted)]">
            Historial de inicios de sesión y reportes que enviaste.
          </p>

          {loadingActivity ? (
            <p className="text-xs text-[var(--app-text-muted)]">Cargando...</p>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="mb-2 text-xs font-medium text-[var(--app-text-muted)]">
                  Inicios de sesión
                </h3>
                {loginHistory.length === 0 ? (
                  <p className="text-xs text-[var(--app-text-muted)]">Sin registros aún.</p>
                ) : (
                  <ul className="space-y-2">
                    {loginHistory.slice(0, 10).map((row) => (
                      <li
                        key={row.id}
                        className="rounded-lg border border-[var(--app-border)] px-3 py-2 text-xs"
                      >
                        <p className="text-[var(--app-text)]">{formatDate(row.fecha)}</p>
                        <p className="mt-0.5 truncate text-[var(--app-text-muted)]">
                          {row.ip || 'IP desconocida'}
                          {row.dispositivo && ` · ${row.dispositivo}`}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="border-t border-[var(--app-border)] pt-5">
                <h3 className="mb-2 text-xs font-medium text-[var(--app-text-muted)]">
                  Mis reportes
                </h3>
                {myReportes.length === 0 ? (
                  <p className="text-xs text-[var(--app-text-muted)]">
                    No enviaste reportes todavía.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {myReportes.slice(0, 10).map((row) => (
                      <li
                        key={row.id}
                        className="rounded-lg border border-[var(--app-border)] px-3 py-2 text-xs"
                      >
                        <p className="text-[var(--app-text)]">
                          Enlace #{row.enlace_id} · {row.estado}
                        </p>
                        <p className="mt-0.5 text-[var(--app-text-muted)]">{row.motivo}</p>
                        <p className="mt-0.5 text-[var(--app-text-muted)]">
                          {formatDate(row.fecha_reporte)}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
