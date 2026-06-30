import { getAssetOrigin } from '../config/env.js'

export function getApiOrigin() {
  return getAssetOrigin()
}

export function resolveAssetUrl(path) {
  if (!path) return null
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  const origin = getApiOrigin()
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${origin}${normalized}`
}
