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
  const avatarClassName = cn(
    'bg-cool-gray-100 shrink-0 overflow-hidden rounded-full',
    avatarSizeClassName[size],
    className,
  )

  if (!src) {
    return (
      <span
        aria-hidden="true"
        className={avatarClassName}
        data-testid="avatar-placeholder"
      />
    )
  }

  return (
    <img src={src} alt={alt} className={cn(avatarClassName, 'object-cover')} />
  )
}
