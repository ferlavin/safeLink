import { createContext, useContext, useMemo } from 'react'
import { usePreferences } from '../context/PreferencesContext'
import { createTranslator, getDateLocale, normalizeLocale } from './index.js'

const I18nContext = createContext(null)

export function I18nProvider({ children }) {
  const { prefs } = usePreferences()
  const locale = normalizeLocale(prefs.idioma)
  const value = useMemo(
    () => ({
      locale,
      dateLocale: getDateLocale(locale),
      t: createTranslator(locale),
    }),
    [locale],
  )
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useT() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useT debe usarse dentro de I18nProvider')
  return ctx
}
