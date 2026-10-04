import { ImageFallback } from '@hashi/hds-ui'
import { useState } from 'react'

import { cn } from '@/shared/utils'

interface MagazineImageProps {
  alt: string
  className?: string
  src?: string | null
}

const MagazineImageSource = ({ alt, className, src }: MagazineImageProps) => {
  const [hasError, setHasError] = useState(false)

  if (!src || hasError) {
    return (
      <ImageFallback
        aria-hidden={alt ? undefined : true}
        aria-label={alt || undefined}
        className={className}
        markSize="lg"
        role={alt ? 'img' : undefined}
      />
    )
  }

  return (
    <img
      alt={alt}
      className={cn('object-cover', className)}
      onError={() => setHasError(true)}
      src={src}
    />
  )
}

export const MagazineImage = (props: MagazineImageProps) => {
  const sourceKey = props.src ? `source:${props.src}` : 'empty-source'

  return <MagazineImageSource key={sourceKey} {...props} />
}
