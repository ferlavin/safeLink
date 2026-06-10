import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'safelink_ui_prefs'

const defaultPrefs = {
  theme: 'dark',
  compact: false,
  highContrast: false,
}

function loadPrefs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...defaultPrefs, ...JSON.parse(raw) }
  } catch {
    /* ignore */
  }
  return defaultPrefs
}

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [prefs, setPrefs] = useState(loadPrefs)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
    const root = document.documentElement
    const resolved =
      prefs.theme === 'system'
        ? window.matchMedia('(prefers-color-scheme: light)').matches
          ? 'light'
          : 'dark'
        : prefs.theme

    root.dataset.theme = resolved
    root.dataset.compact = prefs.compact ? 'true' : 'false'
    root.dataset.contrast = prefs.highContrast ? 'high' : 'normal'
    root.style.colorScheme = resolved
  }, [prefs])

  useEffect(() => {
    if (prefs.theme !== 'system') return undefined
    const mq = window.matchMedia('(prefers-color-scheme: light)')
    const handler = () => {
      document.documentElement.dataset.theme = mq.matches ? 'light' : 'dark'
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [prefs.theme])

  const value = useMemo(
    () => ({
      prefs,
      setTheme: (theme) => setPrefs((p) => ({ ...p, theme })),
      setCompact: (compact) => setPrefs((p) => ({ ...p, compact })),
      setHighContrast: (highContrast) => setPrefs((p) => ({ ...p, highContrast })),
      resetPrefs: () => setPrefs(defaultPrefs),
    }),
    [prefs],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme debe usarse dentro de ThemeProvider')
  return ctx
}
