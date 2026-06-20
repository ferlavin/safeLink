import { useCallback, useState } from 'react'
import client from '../api/client'
import { useAuth } from '../context/AuthContext'

const ACCEPT = 'image/jpeg,image/png,image/webp'
const MAX_BYTES = 2 * 1024 * 1024

function validateFile(file) {
  if (!file) return 'Seleccioná una imagen'
  if (!file.type.startsWith('image/')) return 'El archivo debe ser una imagen'
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    return 'Formato no permitido. Usa JPG, PNG o WebP'
  }
  if (file.size > MAX_BYTES) return 'La imagen no puede superar 2 MB'
  return null
}

export function useAvatarUpload() {
  const { user, updateUser } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const uploadAvatar = useCallback(
    async (file) => {
      const validationError = validateFile(file)
      if (validationError) {
        setError(validationError)
        throw new Error(validationError)
      }

      setUploading(true)
      setError('')
      try {
        const form = new FormData()
        form.append('file', file)
        const { data } = await client.post('/auth/avatar', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        updateUser(data)
        return data
      } catch (err) {
        const message = err.response?.data?.detail || err.message || 'No se pudo subir la foto'
        setError(message)
        throw err
      } finally {
        setUploading(false)
      }
    },
    [updateUser],
  )

  const removeAvatar = useCallback(async () => {
    if (!user?.avatar_url) return null
    setUploading(true)
    setError('')
    try {
      const { data } = await client.delete('/auth/avatar')
      updateUser(data)
      return data
    } catch (err) {
      const message = err.response?.data?.detail || 'No se pudo eliminar la foto'
      setError(message)
      throw err
    } finally {
      setUploading(false)
    }
  }, [updateUser, user?.avatar_url])

  const clearError = useCallback(() => setError(''), [])

  return {
    uploading,
    error,
    uploadAvatar,
    removeAvatar,
    clearError,
    hasPhoto: Boolean(user?.avatar_url),
  }
}

export { ACCEPT as AVATAR_ACCEPT, MAX_BYTES as AVATAR_MAX_BYTES, validateFile as validateAvatarFile }
