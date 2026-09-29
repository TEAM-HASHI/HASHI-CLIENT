import { HashiMarkIcon } from '@hashi/hds-icons'
import { useEffect, useState } from 'react'
import { cn } from '../../utils'

export type AvatarSize = 'sm' | 'md' | 'lg'

export interface AvatarProps {
  src?: string
  alt?: string
  size?: AvatarSize
  className?: string
}

const avatarSizeClassName: Record<AvatarSize, string> = {
  sm: 'h-10 w-10',
  md: 'h-[42px] w-[42px]',
  lg: 'h-[90px] w-[90px]',
}

export const Avatar = ({
  src,
  alt = '',
  size = 'sm',
  className,
}: AvatarProps) => {
  const [hasImageError, setHasImageError] = useState(false)

  useEffect(() => {
    setHasImageError(false)
  }, [src])

  const avatarClassName = cn(
    'block shrink-0 overflow-hidden rounded-full',
    avatarSizeClassName[size],
    className,
  )

  const shouldShowPlaceholder = !src || hasImageError

  if (shouldShowPlaceholder) {
    return (
      <span
        aria-hidden="true"
        className={cn(
          avatarClassName,
          'bg-warm-gray-50 flex items-center justify-center',
        )}
        data-testid="avatar-placeholder"
      >
        <HashiMarkIcon className="text-primary-100 h-[52.22%] w-[47.78%]" />
      </span>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={cn(avatarClassName, 'object-cover')}
      onError={() => {
        setHasImageError(true)
      }}
    />
  )
}
