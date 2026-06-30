const rawApi = import.meta.env.VITE_API_URL?.trim()

/** URL pública del backend (Render, Railway, etc.). */
export function getBackendOrigin() {
  if (rawApi) return rawApi.replace(/\/$/, '')
  return ''
}

/** Base URL para axios: proxy local en dev, backend directo en producción. */
export function getClientApiBaseUrl() {
  if (import.meta.env.DEV) return '/api'
  return getBackendOrigin()
}

/** Origen para assets (/uploads). */
export function getAssetOrigin() {
  if (import.meta.env.DEV) return ''
  return getBackendOrigin()
}
