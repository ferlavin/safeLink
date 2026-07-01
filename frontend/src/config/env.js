const rawApi = import.meta.env.VITE_API_URL?.trim()

/** URL directa del backend (Render). Opcional si usás proxy /api en Vercel. */
export function getBackendOrigin() {
  if (rawApi) return rawApi.replace(/\/$/, '')
  return 'https://safelink-api.onrender.com'
}

/**
 * Base URL para axios.
 * Dev: proxy Vite /api → localhost:8000
 * Prod: proxy Vercel /api → Render (ver frontend/vercel.json)
 */
export function getClientApiBaseUrl() {
  return '/api'
}

/** Origen para assets (/uploads). Mismo proxy que la API. */
export function getAssetOrigin() {
  return ''
}
