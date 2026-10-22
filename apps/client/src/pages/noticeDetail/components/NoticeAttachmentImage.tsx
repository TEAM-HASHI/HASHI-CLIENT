import { ImageFallback } from '@hashi/hds-ui'
import { useState } from 'react'

interface NoticeAttachmentImageProps {
  alt: string
  src: string
}

export const NoticeAttachmentImage = ({
  alt,
  src,
}: NoticeAttachmentImageProps) => {
  const [hasError, setHasError] = useState(false)

  if (hasError) {
    return <ImageFallback className="size-full" markSize="lg" />
  }

  return (
    <img
      alt={alt}
      className="size-full object-contain"
      onError={() => setHasError(true)}
      src={src}
    />
  )
}
