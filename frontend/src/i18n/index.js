import en from './en.js'
import es from './es.js'

export const SUPPORTED_LOCALES = ['es', 'en']

const catalogs = { es, en }

export function normalizeLocale(value) {
  return value === 'en' ? 'en' : 'es'
}

export function createTranslator(locale) {
  const dict = catalogs[normalizeLocale(locale)] || catalogs.es
  return function t(key, vars = {}) {
    const value = key.split('.').reduce((obj, part) => obj?.[part], dict)
    if (typeof value !== 'string') return key
    return value.replace(/\{\{(\w+)\}\}/g, (_, name) =>
      vars[name] != null ? String(vars[name]) : '',
    )
  }
}

export function getDateLocale(locale) {
  return normalizeLocale(locale) === 'en' ? 'en-US' : 'es-AR'
}
