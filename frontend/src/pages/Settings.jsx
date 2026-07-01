import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import ThemeToggle from '../components/ThemeToggle'
import AvatarPhotoControls from '../components/AvatarPhotoControls'
import UserAvatar from '../components/UserAvatar'
import { useAuth } from '../context/AuthContext'
import { usePreferences } from '../context/PreferencesContext'
import { useTheme } from '../context/ThemeContext'
import { AVATAR_COLORS, AVATAR_STYLES, useAvatarPrefs } from '../hooks/useAvatarPrefs'
import { useAvatarUpload } from '../hooks/useAvatarUpload'
import { calcAge, countryLabel, experienceLabel } from '../constants/registration'
import client from '../api/client'

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

const fontOptions = [
  { id: 'sm', label: 'Pequeño' },
  { id: 'base', label: 'Normal' },
  { id: 'lg', label: 'Grande' },
  { id: 'xl', label: 'Muy grande' },
]

const layoutOptions = [
  { id: 'compact', label: 'Compacta' },
  { id: 'comfortable', label: 'Cómoda' },
  { id: 'wide', label: 'Amplia' },
]

function roleLabel(role) {
  if (role === 'admin') return 'Administrador'
  return 'Usuario'
}

export default function Settings() {
  const { user } = useAuth()
  const { prefs, setFontScale, setLayout, setHighContrast, resetPrefs } = useTheme()
  const { prefs: userPrefs, updatePreferences } = usePreferences()
  const { avatar, setAvatarColor, setAvatarStyle, resetAvatar } = useAvatarPrefs()
  const { removeAvatar } = useAvatarUpload()
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

  const displayName = user?.full_name || user?.email?.split('@')[0]

  const clearPhotoForPreset = async () => {
    if (user?.avatar_url) {
      try {
        await removeAvatar()
      } catch {
        /* optional */
      }
    }
  }

  const handlePresetColor = async (colorId) => {
    await clearPhotoForPreset()
    setAvatarColor(colorId)
  }

  const handlePresetStyle = async (styleId) => {
    await clearPhotoForPreset()
    setAvatarStyle(styleId)
  }

  const handleResetAvatar = async () => {
    if (user?.avatar_url) {
      try {
        await removeAvatar()
      } catch {
        /* optional */
      }
    }
    resetAvatar()
  }

  return (
    <div className="app-page relative">
      <div className="absolute inset-0 bg-noise opacity-[0.02] pointer-events-none" />
      <Navbar />

      <main className="relative z-10 mx-auto max-w-[var(--app-content-max)] px-4 py-8">
        <h1 className="landing-section-title font-semibold text-[var(--app-text)]">
          Opciones de usuario
        </h1>
        <p className="mt-2 text-sm text-[var(--app-text-muted)]">
          Tu perfil, preferencias de visualización y actividad reciente. Abrí el menú rápido con{' '}
          <kbd className="rounded border border-[var(--app-border)] px-1.5 py-0.5 text-xs font-medium">
            Alt + Shift + U
          </kbd>
          .
        </p>

        <section className="app-card mt-6 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-[var(--app-text)]">Mi información</h2>
          <div className="mt-4 flex items-center gap-4">
            <UserAvatar
              avatar={avatar}
              displayName={displayName}
              photoUrl={user?.avatar_url}
              size="lg"
            />
            <p className="text-xs text-[var(--app-text-muted)]">
              Tu avatar se muestra en la barra superior. Personalizalo abajo o desde el menú de
              opciones.
            </p>
          </div>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
              <dt className="text-[var(--app-text-muted)]">Nombre</dt>
              <dd className="font-medium text-[var(--app-text)]">{displayName}</dd>
            </div>
            <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
              <dt className="text-[var(--app-text-muted)]">Email</dt>
              <dd className="font-medium text-[var(--app-text)]">{user?.email}</dd>
            </div>
            <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
              <dt className="text-[var(--app-text-muted)]">Rol</dt>
              <dd className="font-medium text-[var(--app-text)]">{roleLabel(user?.role)}</dd>
            </div>
            <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
              <dt className="text-[var(--app-text-muted)]">Registro</dt>
              <dd className="font-medium text-[var(--app-text)]">
                {formatDate(user?.created_at)}
              </dd>
            </div>
            <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
              <dt className="text-[var(--app-text-muted)]">País</dt>
              <dd className="font-medium text-[var(--app-text)]">
                {countryLabel(user?.country)}
              </dd>
            </div>
            <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
              <dt className="text-[var(--app-text-muted)]">Edad</dt>
              <dd className="font-medium text-[var(--app-text)]">
                {calcAge(user?.birth_date) != null ? `${calcAge(user?.birth_date)} años` : '—'}
              </dd>
            </div>
            <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
              <dt className="text-[var(--app-text-muted)]">Experiencia</dt>
              <dd className="font-medium text-[var(--app-text)]">
                {experienceLabel(user?.experience_level)}
              </dd>
            </div>
            <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
              <dt className="text-[var(--app-text-muted)]">Alertas de seguridad</dt>
              <dd className="font-medium text-[var(--app-text)]">
                {user?.security_alerts ? 'Activadas' : 'Desactivadas'}
              </dd>
            </div>
          </dl>
        </section>

        <section className="app-card mt-6 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-[var(--app-text)]">Avatar</h2>
          <p className="mt-1 mb-4 text-xs text-[var(--app-text-muted)]">
            Subí una foto o elegí un color e ícono. La foto tiene prioridad y se sincroniza con tu
            cuenta.
          </p>
          <div className="space-y-4">
            <AvatarPhotoControls />

            {!user?.avatar_url && (
              <>
                <div>
                  <p className="mb-2 text-xs font-medium text-[var(--app-text-muted)]">Color</p>
                  <div className="flex flex-wrap gap-2">
                    {AVATAR_COLORS.map((color) => (
                      <button
                        key={color.id}
                        type="button"
                        onClick={() => handlePresetColor(color.id)}
                        className={`h-8 w-8 rounded-full ring-2 ring-offset-2 ring-offset-[var(--app-bg)] transition ${color.className} ${
                          avatar.color === color.id
                            ? 'ring-[var(--app-accent)]'
                            : 'ring-transparent hover:ring-[var(--app-border)]'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-xs font-medium text-[var(--app-text-muted)]">Ícono</p>
                  <div className="flex flex-wrap gap-1">
                    {AVATAR_STYLES.map((style) => (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => handlePresetStyle(style.id)}
                        className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                          avatar.style === style.id
                            ? 'bg-[var(--app-accent-muted)] text-[var(--app-accent)]'
                            : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)]'
                        }`}
                      >
                        {style.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <button
              type="button"
              onClick={handleResetAvatar}
              className="app-btn-ghost px-3 py-1.5 text-xs"
            >
              Restaurar avatar predeterminado
            </button>
          </div>
        </section>

        <section className="app-card mt-6 space-y-6 rounded-2xl p-6">
          <div>
            <h2 className="text-sm font-semibold text-[var(--app-text)]">Tema</h2>
            <p className="mt-1 mb-3 text-xs text-[var(--app-text-muted)]">
              Modo oscuro, claro o según tu sistema operativo.
            </p>
            <ThemeToggle />
          </div>

          <div className="border-t border-[var(--app-border)] pt-5">
            <h2 className="text-sm font-semibold text-[var(--app-text)]">Tamaño de letra</h2>
            <p className="mt-1 mb-3 text-xs text-[var(--app-text-muted)]">
              Elegí el tamaño que te resulte más cómodo para leer.
            </p>
            <div className="flex flex-wrap gap-1">
              {fontOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setFontScale(option.id)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                    prefs.fontScale === option.id
                      ? 'bg-[var(--app-accent-muted)] text-[var(--app-accent)]'
                      : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)]'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-[var(--app-border)] pt-5">
            <h2 className="text-sm font-semibold text-[var(--app-text)]">Modo simple</h2>
            <p className="mt-1 mb-3 text-xs text-[var(--app-text-muted)]">
              Menú más corto, textos más grandes y lenguaje fácil de entender. Ideal para adultos
              mayores o quienes recién empiezan.
            </p>
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={userPrefs.modo_simple}
                onChange={(e) => updatePreferences({ modo_simple: e.target.checked })}
                className="h-4 w-4 accent-[var(--app-accent)]"
              />
              <span className="text-sm text-[var(--app-text)]">Activar modo simple</span>
            </label>
          </div>

          <div className="border-t border-[var(--app-border)] pt-5">
            <h2 className="text-sm font-semibold text-[var(--app-text)]">Guía de uso</h2>
            <p className="mt-1 mb-3 text-xs text-[var(--app-text-muted)]">
              Volvé a ver el tutorial interactivo o consultá la ayuda paso a paso.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="btn-outline-gradient text-xs px-3 py-1.5"
                onClick={() => updatePreferences({ tutorial_completado: false })}
              >
                Repetir tutorial
              </button>
              <a href="/ayuda" className="btn-outline-gradient text-xs px-3 py-1.5">
                Ver ayuda completa
              </a>
            </div>
          </div>

          <div className="border-t border-[var(--app-border)] pt-5">
            <h2 className="text-sm font-semibold text-[var(--app-text)]">
              Disposición de pantalla
            </h2>
            <p className="mt-1 mb-3 text-xs text-[var(--app-text-muted)]">
              Ajustá el ancho y espaciado del contenido.
            </p>
            <div className="flex flex-wrap gap-1">
              {layoutOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setLayout(option.id)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                    prefs.layout === option.id
                      ? 'bg-[var(--app-accent-muted)] text-[var(--app-accent)]'
                      : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)]'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
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
            onClick={async () => {
              resetPrefs()
              await handleResetAvatar()
            }}
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
