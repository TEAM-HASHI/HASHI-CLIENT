import { ImageFallback } from '@hashi/hds-ui'
import { useState } from 'react'

import { cn } from '@/shared/utils'

interface NoticeAttachmentImageProps {
  alt: string
  src: string | null
  className?: string
}

export const NoticeAttachmentImage = ({
  alt,
  src,
  className,
}: NoticeAttachmentImageProps) => {
  const [hasError, setHasError] = useState(false)

  if (!src || hasError) {
    return <ImageFallback className="size-full" markSize="lg" />
  }

  return (
    <img
      alt={alt}
      className={cn('size-full object-contain', className)}
      onError={() => setHasError(true)}
      src={src}
    />
  )
}
