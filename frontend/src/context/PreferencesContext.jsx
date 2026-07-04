import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import client from '../api/client'
import { useAuth } from './AuthContext'
import { normalizeLocale } from '../i18n/index.js'

const LOCALE_KEY = 'safelink_locale'

function readStoredLocale() {
  return normalizeLocale(localStorage.getItem(LOCALE_KEY))
}

const defaultPrefs = {
  tutorial_completado: false,
  modo_simple: false,
  idioma: readStoredLocale(),
}

const PreferencesContext = createContext(null)

export function PreferencesProvider({ children }) {
  const { user } = useAuth()
  const [prefs, setPrefs] = useState(defaultPrefs)
  const [loaded, setLoaded] = useState(false)
  const [savingLocale, setSavingLocale] = useState(false)

  const applyLocale = useCallback((idioma) => {
    const normalized = normalizeLocale(idioma)
    localStorage.setItem(LOCALE_KEY, normalized)
    setPrefs((prev) => ({ ...prev, idioma: normalized }))
    return normalized
  }, [])

  const load = useCallback(async () => {
    if (!user) {
      setPrefs({ ...defaultPrefs, idioma: readStoredLocale() })
      setLoaded(false)
      document.documentElement.dataset.simpleMode = 'false'
      return
    }
    try {
      const { data } = await client.get('/auth/me/preferences')
      const idioma = applyLocale(data.idioma || 'es')
      setPrefs({ ...data, idioma })
      setLoaded(true)
    } catch {
      setPrefs({ ...defaultPrefs, idioma: readStoredLocale() })
      setLoaded(true)
    }
  }, [user, applyLocale])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    document.documentElement.dataset.simpleMode = prefs.modo_simple ? 'true' : 'false'
    document.documentElement.lang = prefs.idioma || 'es'
  }, [prefs.modo_simple, prefs.idioma])

  const updatePreferences = useCallback(async (patch) => {
    const { data } = await client.patch('/auth/me/preferences', patch)
    if (data.idioma) applyLocale(data.idioma)
    setPrefs(data)
    return data
  }, [applyLocale])

  const setLocale = useCallback(
    async (idioma) => {
      const normalized = applyLocale(idioma)
      if (!user) return normalized
      setSavingLocale(true)
      try {
        const { data } = await client.patch('/auth/me/preferences', { idioma: normalized })
        setPrefs(data)
        return data.idioma
      } finally {
        setSavingLocale(false)
      }
    },
    [user, applyLocale],
  )

  const completeTutorial = useCallback(async () => {
    return updatePreferences({ tutorial_completado: true })
  }, [updatePreferences])

  const value = useMemo(
    () => ({
      prefs,
      loaded,
      savingLocale,
      updatePreferences,
      setLocale,
      completeTutorial,
      reloadPreferences: load,
    }),
    [prefs, loaded, savingLocale, updatePreferences, setLocale, completeTutorial, load],
  )

  return (
    <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
  )
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext)
  if (!ctx) throw new Error('usePreferences debe usarse dentro de PreferencesProvider')
  return ctx
}
