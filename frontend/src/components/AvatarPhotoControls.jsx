import { useRef } from 'react'
import { Camera, Trash, SpinnerGap } from '@phosphor-icons/react'
import { AVATAR_ACCEPT, useAvatarUpload } from '../hooks/useAvatarUpload'

export default function AvatarPhotoControls({ compact = false, onPhotoChange }) {
  const inputRef = useRef(null)
  const { uploading, error, uploadAvatar, removeAvatar, hasPhoto, clearError } =
    useAvatarUpload()

  const handlePick = () => {
    clearError()
    inputRef.current?.click()
  }

  const handleFile = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try {
      await uploadAvatar(file)
      onPhotoChange?.()
    } catch {
      /* error handled in hook */
    }
  }

  const handleRemove = async () => {
    try {
      await removeAvatar()
      onPhotoChange?.()
    } catch {
      /* error handled in hook */
    }
  }

  return (
    <div className={compact ? 'space-y-2' : 'space-y-3'}>
      <input
        ref={inputRef}
        type="file"
        accept={AVATAR_ACCEPT}
        className="hidden"
        onChange={handleFile}
      />

      <div className={`flex flex-wrap gap-2 ${compact ? '' : 'gap-3'}`}>
        <button
          type="button"
          onClick={handlePick}
          disabled={uploading}
          className="app-btn-ghost flex items-center gap-2 px-3 py-1.5 text-xs disabled:opacity-50"
        >
          {uploading ? (
            <SpinnerGap size={14} className="animate-spin" />
          ) : (
            <Camera size={14} />
          )}
          {hasPhoto ? 'Cambiar foto' : 'Subir foto'}
        </button>

        {hasPhoto && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={uploading}
            className="flex items-center gap-2 rounded-lg border border-[var(--app-border)] px-3 py-1.5 text-xs font-medium text-hot-fuchsia transition hover:bg-hot-fuchsia/10 disabled:opacity-50"
          >
            <Trash size={14} />
            Quitar foto
          </button>
        )}
      </div>

      <p className="text-[10px] text-[var(--app-text-muted)]">
        JPG, PNG o WebP · máx. 2 MB
      </p>

      {error && <p className="text-[10px] text-hot-fuchsia">{error}</p>}
    </div>
  )
}
