import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import client from '../api/client'
import { useAuth } from './AuthContext'

const defaultPrefs = {
  tutorial_completado: false,
  modo_simple: false,
  idioma: 'es',
}

const PreferencesContext = createContext(null)

export function PreferencesProvider({ children }) {
  const { user } = useAuth()
  const [prefs, setPrefs] = useState(defaultPrefs)
  const [loaded, setLoaded] = useState(false)

  const load = useCallback(async () => {
    if (!user) {
      setPrefs(defaultPrefs)
      setLoaded(false)
      document.documentElement.dataset.simpleMode = 'false'
      return
    }
    try {
      const { data } = await client.get('/auth/me/preferences')
      setPrefs(data)
      setLoaded(true)
    } catch {
      setPrefs(defaultPrefs)
      setLoaded(true)
    }
  }, [user])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    document.documentElement.dataset.simpleMode = prefs.modo_simple ? 'true' : 'false'
    document.documentElement.lang = prefs.idioma || 'es'
  }, [prefs.modo_simple, prefs.idioma])

  const updatePreferences = useCallback(async (patch) => {
    const { data } = await client.patch('/auth/me/preferences', patch)
    setPrefs(data)
    return data
  }, [])

  const completeTutorial = useCallback(async () => {
    return updatePreferences({ tutorial_completado: true })
  }, [updatePreferences])

  const value = useMemo(
    () => ({
      prefs,
      loaded,
      updatePreferences,
      completeTutorial,
      reloadPreferences: load,
    }),
    [prefs, loaded, updatePreferences, completeTutorial, load],
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
