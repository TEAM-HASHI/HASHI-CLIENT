import { DefaultImage } from '@/shared/components/defaultImage'
import { useState } from 'react'

interface ReviewImagePlaceholderProps {
  src?: string
}

export const ReviewImagePlaceholder = ({
  src,
}: ReviewImagePlaceholderProps) => {
  return <ReviewImage key={src ?? 'fallback'} src={src} />
}

const ReviewImage = ({ src }: ReviewImagePlaceholderProps) => {
  const [hasError, setHasError] = useState(false)

  if (src && !hasError) {
    return (
      <img
        alt=""
        className="size-[92px] shrink-0 rounded-[5px] object-cover"
        onError={() => setHasError(true)}
        src={src}
      />
    )
  }

  return (
    <DefaultImage
      aria-hidden="true"
      data-testid="my-review-default-image"
      className="size-[92px] shrink-0 rounded-[5px]"
      logoSize="sm"
    />
  )
}
