export function getApiOrigin() {
  const envUrl = import.meta.env.VITE_API_URL?.trim()
  if (envUrl) return envUrl.replace(/\/$/, '')
  if (import.meta.env.DEV) return ''
  return 'http://localhost:8000'
}

export function resolveAssetUrl(path) {
  if (!path) return null
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  const origin = getApiOrigin()
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${origin}${normalized}`
}
