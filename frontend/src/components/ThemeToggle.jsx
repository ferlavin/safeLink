import { Moon, Sun, Desktop } from '@phosphor-icons/react'
import { useTheme } from '../context/ThemeContext'

const options = [
  { id: 'dark', label: 'Oscuro', Icon: Moon },
  { id: 'light', label: 'Claro', Icon: Sun },
  { id: 'system', label: 'Sistema', Icon: Desktop },
]

export default function ThemeToggle({ compact = false }) {
  const { prefs, setTheme } = useTheme()

  if (compact) {
    const current = options.find((o) => o.id === prefs.theme) || options[0]
    const next = options[(options.findIndex((o) => o.id === prefs.theme) + 1) % options.length]
    const Icon = current.Icon
    return (
      <button
        type="button"
        onClick={() => setTheme(next.id)}
        className="app-btn-ghost flex items-center gap-1.5 px-2.5 py-1.5"
        title={`Tema: ${current.label}. Clic para ${next.label}`}
      >
        <Icon size={16} weight="fill" />
        <span className="hidden sm:inline text-xs">{current.label}</span>
      </button>
    )
  }

  return (
    <div className="flex gap-1 rounded-lg border border-[var(--app-border)] p-1">
      {options.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => setTheme(id)}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
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
  )
}
