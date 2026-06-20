import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'

export const AVATAR_COLORS = [
  { id: 'brand', className: 'bg-gradient-to-tr from-neon-ice to-ocean-twilight' },
  { id: 'ocean', className: 'bg-gradient-to-tr from-ocean-twilight to-blue-500' },
  { id: 'fuchsia', className: 'bg-gradient-to-tr from-hot-fuchsia to-purple-600' },
  { id: 'amber', className: 'bg-gradient-to-tr from-amber-400 to-orange-500' },
  { id: 'emerald', className: 'bg-gradient-to-tr from-emerald-400 to-teal-600' },
]

export const AVATAR_STYLES = [
  { id: 'initial', label: 'Inicial' },
  { id: 'shield', label: 'Escudo' },
  { id: 'user', label: 'Usuario' },
  { id: 'star', label: 'Estrella' },
  { id: 'smiley', label: 'Smile' },
]

const defaultAvatar = { color: 'brand', style: 'initial' }

function loadAvatar(userId) {
  if (!userId) return defaultAvatar
  try {
    const raw = localStorage.getItem(`safelink_avatar_${userId}`)
    if (raw) return { ...defaultAvatar, ...JSON.parse(raw) }
  } catch {
    /* ignore */
  }
  return defaultAvatar
}

export function useAvatarPrefs() {
  const { user } = useAuth()
  const [avatar, setAvatarState] = useState(() => loadAvatar(user?.id))

  useEffect(() => {
    setAvatarState(loadAvatar(user?.id))
  }, [user?.id])

  const save = useCallback(
    (updater) => {
      setAvatarState((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater
        if (user?.id) {
          localStorage.setItem(`safelink_avatar_${user.id}`, JSON.stringify(next))
        }
        return next
      })
    },
    [user?.id],
  )

  const setAvatarColor = useCallback((color) => save((prev) => ({ ...prev, color })), [save])
  const setAvatarStyle = useCallback((style) => save((prev) => ({ ...prev, style })), [save])
  const resetAvatar = useCallback(() => save(defaultAvatar), [save])

  return { avatar, setAvatarColor, setAvatarStyle, resetAvatar }
}
