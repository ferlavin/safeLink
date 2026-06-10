import Navbar from '../components/Navbar'
import ThemeToggle from '../components/ThemeToggle'
import { useTheme } from '../context/ThemeContext'

export default function Settings() {
  const { prefs, setCompact, setHighContrast, resetPrefs } = useTheme()

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
      </main>
    </div>
  )
}
