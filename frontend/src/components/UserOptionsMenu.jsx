import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CaretDown,
  SignOut,
  TextAa,
  ArrowsOut,
  Moon,
  Sun,
  Desktop,
  User,
  CircleHalf,
  Palette,
} from '@phosphor-icons/react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { AVATAR_COLORS, AVATAR_STYLES, useAvatarPrefs } from '../hooks/useAvatarPrefs'
import { useAvatarUpload } from '../hooks/useAvatarUpload'
import AvatarPhotoControls from './AvatarPhotoControls'
import UserAvatar from './UserAvatar'

const themeOptions = [
  { id: 'dark', label: 'Oscuro', Icon: Moon },
  { id: 'light', label: 'Claro', Icon: Sun },
  { id: 'system', label: 'Sistema', Icon: Desktop },
]

const fontOptions = [
  { id: 'sm', label: 'Pequeño' },
  { id: 'base', label: 'Normal' },
  { id: 'lg', label: 'Grande' },
  { id: 'xl', label: 'Muy grande' },
]

const layoutOptions = [
  { id: 'compact', label: 'Compacta', hint: 'Menos espacio' },
  { id: 'comfortable', label: 'Cómoda', hint: 'Equilibrada' },
  { id: 'wide', label: 'Amplia', hint: 'Más ancho' },
]

const SHORTCUT_LABEL = 'Alt + Shift + U'

function roleLabel(role) {
  if (role === 'admin') return 'Administrador'
  return 'Usuario'
}

function isTypingTarget(target) {
  if (!target) return false
  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable
}

function OptionGroup({ title, children }) {
  return (
    <div className="border-t border-[var(--app-border)] px-4 py-3 first:border-t-0">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--app-text-muted)]">
        {title}
      </p>
      {children}
    </div>
  )
}

function SegmentedControl({ options, value, onChange, compact = false }) {
  return (
    <div className="flex flex-wrap gap-1">
      {options.map((option) => {
        const active = value === option.id
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            title={option.hint}
            className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
              active
                ? 'bg-[var(--app-accent-muted)] text-[var(--app-accent)]'
                : 'text-[var(--app-text-muted)] hover:bg-[var(--app-surface)] hover:text-[var(--app-text)]'
            } ${compact ? 'flex-1 min-w-0' : ''}`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

export default function UserOptionsMenu() {
  const { user, logout } = useAuth()
  const { prefs, setTheme, setFontScale, setLayout, setHighContrast } = useTheme()
  const { avatar, setAvatarColor, setAvatarStyle } = useAvatarPrefs()
  const { removeAvatar } = useAvatarUpload()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [showAvatarPicker, setShowAvatarPicker] = useState(false)
  const menuRef = useRef(null)
  const triggerRef = useRef(null)

  const displayName = user?.full_name || user?.email?.split('@')[0] || 'Usuario'

  useEffect(() => {
    const handleShortcut = (event) => {
      if (!event.altKey || !event.shiftKey || event.key.toLowerCase() !== 'u') return
      if (isTypingTarget(event.target)) return
      event.preventDefault()
      setOpen((prev) => !prev)
      triggerRef.current?.focus()
    }
    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [])

  useEffect(() => {
    if (!open) {
      setShowAvatarPicker(false)
      return undefined
    }
    const handleClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    const handleKey = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  const handleLogout = () => {
    setOpen(false)
    logout()
    navigate('/login')
  }

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

  return (
    <div className="relative" ref={menuRef}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-keyshortcuts="Alt+Shift+U"
        title={`Opciones de usuario (${SHORTCUT_LABEL})`}
        className="app-btn-ghost flex items-center gap-2 px-2.5 py-1.5"
      >
        <UserAvatar
          avatar={avatar}
          displayName={displayName}
          photoUrl={user?.avatar_url}
          size="sm"
        />
        <span className="hidden max-w-[120px] truncate text-xs font-medium sm:inline">
          {displayName}
        </span>
        <CaretDown
          size={12}
          weight="bold"
          className={`text-[var(--app-text-muted)] transition ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 z-[60] mt-2 w-[min(320px,calc(100vw-2rem))] overflow-hidden rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] shadow-2xl">
          <div className="border-b border-[var(--app-border)] px-4 py-4">
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => setShowAvatarPicker((prev) => !prev)}
                className="group relative rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]"
                title="Personalizar avatar"
              >
                <UserAvatar
                  avatar={avatar}
                  displayName={displayName}
                  photoUrl={user?.avatar_url}
                  size="md"
                />
                <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-text-muted)] transition group-hover:text-[var(--app-accent)]">
                  <Palette size={10} weight="fill" />
                </span>
              </button>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[var(--app-text)]">
                  {displayName}
                </p>
                <p className="truncate text-xs text-[var(--app-text-muted)]">{user?.email}</p>
                <span className="mt-1 inline-block rounded-full border border-[var(--app-border)] px-2 py-0.5 text-[10px] font-medium text-[var(--app-text-muted)]">
                  {roleLabel(user?.role)}
                </span>
              </div>
            </div>

            {showAvatarPicker && (
              <div className="mt-3 space-y-3 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] p-3">
                <AvatarPhotoControls compact />

                {!user?.avatar_url && (
                  <>
                    <div>
                      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--app-text-muted)]">
                        Color
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {AVATAR_COLORS.map((color) => (
                          <button
                            key={color.id}
                            type="button"
                            onClick={() => handlePresetColor(color.id)}
                            title={color.id}
                            className={`h-7 w-7 rounded-full ring-2 ring-offset-2 ring-offset-[var(--app-bg)] transition ${color.className} ${
                              avatar.color === color.id
                                ? 'ring-[var(--app-accent)]'
                                : 'ring-transparent hover:ring-[var(--app-border)]'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--app-text-muted)]">
                        Ícono
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {AVATAR_STYLES.map((style) => (
                          <button
                            key={style.id}
                            type="button"
                            onClick={() => handlePresetStyle(style.id)}
                            className={`rounded-md px-2 py-1 text-xs font-medium transition ${
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
              </div>
            )}

            <Link
              to="/settings"
              onClick={() => setOpen(false)}
              className="mt-3 flex items-center gap-2 rounded-lg border border-[var(--app-border)] px-3 py-2 text-xs font-medium text-[var(--app-text)] transition hover:border-[var(--app-accent)] hover:text-[var(--app-accent)]"
            >
              <User size={14} />
              Ver mi información y actividad
            </Link>
          </div>

          <OptionGroup title="Tema">
            <div className="flex gap-1 rounded-lg border border-[var(--app-border)] p-1">
              {themeOptions.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTheme(id)}
                  className={`flex flex-1 items-center justify-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium transition ${
                    prefs.theme === id
                      ? 'bg-[var(--app-accent-muted)] text-[var(--app-accent)]'
                      : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)]'
                  }`}
                >
                  <Icon size={14} weight={prefs.theme === id ? 'fill' : 'regular'} />
                  {label}
                </button>
              ))}
            </div>
          </OptionGroup>

          <OptionGroup title="Tamaño de letra">
            <div className="mb-1 flex items-center gap-1.5 text-[var(--app-text-muted)]">
              <TextAa size={14} />
              <span className="text-xs">Ajustá la legibilidad del texto</span>
            </div>
            <SegmentedControl
              options={fontOptions}
              value={prefs.fontScale}
              onChange={setFontScale}
              compact
            />
          </OptionGroup>

          <OptionGroup title="Disposición de pantalla">
            <div className="mb-1 flex items-center gap-1.5 text-[var(--app-text-muted)]">
              <ArrowsOut size={14} />
              <span className="text-xs">Espaciado y ancho del contenido</span>
            </div>
            <SegmentedControl
              options={layoutOptions}
              value={prefs.layout}
              onChange={setLayout}
              compact
            />
          </OptionGroup>

          <OptionGroup title="Accesibilidad">
            <label className="flex cursor-pointer items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <CircleHalf size={16} className="text-[var(--app-text-muted)]" />
                <div>
                  <span className="text-xs font-medium text-[var(--app-text)]">
                    Alto contraste
                  </span>
                  <p className="text-[10px] text-[var(--app-text-muted)]">
                    Bordes y textos más marcados
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={prefs.highContrast}
                onChange={(e) => setHighContrast(e.target.checked)}
                className="h-4 w-4 shrink-0 accent-[var(--app-accent)]"
              />
            </label>
          </OptionGroup>

          <div className="border-t border-[var(--app-border)] p-2">
            <p className="mb-2 text-center text-[10px] text-[var(--app-text-muted)]">
              Atajo: {SHORTCUT_LABEL}
            </p>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-hot-fuchsia transition hover:bg-hot-fuchsia/10"
            >
              <SignOut size={14} />
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
