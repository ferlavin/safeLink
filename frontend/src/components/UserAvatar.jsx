import { ShieldCheck, UserCircle, Star, Smiley } from '@phosphor-icons/react'
import { AVATAR_COLORS } from '../hooks/useAvatarPrefs'
import { resolveAssetUrl } from '../utils/assetUrl'

const styleIcons = {
  shield: ShieldCheck,
  user: UserCircle,
  star: Star,
  smiley: Smiley,
}

export default function UserAvatar({
  avatar,
  displayName,
  photoUrl,
  size = 'md',
  className = '',
}) {
  const initial = (displayName || 'U').charAt(0).toUpperCase()
  const colorPreset = AVATAR_COLORS.find((c) => c.id === avatar.color) || AVATAR_COLORS[0]
  const resolvedPhoto = resolveAssetUrl(photoUrl)

  const sizeClasses = {
    sm: 'h-7 w-7 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-14 w-14 text-lg',
  }

  const iconSizes = { sm: 16, md: 24, lg: 32 }
  const StyleIcon = styleIcons[avatar.style]

  if (resolvedPhoto) {
    return (
      <img
        src={resolvedPhoto}
        alt={`Avatar de ${displayName}`}
        className={`shrink-0 rounded-full object-cover ${sizeClasses[size]} ${className}`}
      />
    )
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-bold text-black ${sizeClasses[size]} ${colorPreset.className} ${className}`}
    >
      {avatar.style === 'initial' || !StyleIcon ? (
        initial
      ) : (
        <StyleIcon size={iconSizes[size]} weight="fill" />
      )}
    </div>
  )
}
