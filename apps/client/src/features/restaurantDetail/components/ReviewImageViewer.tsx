import { CancelIcon } from '@hashi/hds-icons'
import { Carousel, IconButton } from '@hashi/hds-ui'
import { useEffect } from 'react'

import { RestaurantImage } from '@/features/restaurantDetail/components/RestaurantImage'

interface ReviewImageViewerProps {
  imageUrls: string[]
  initialIndex?: number
  open: boolean
  onClose: () => void
}

export const ReviewImageViewer = ({
  imageUrls,
  initialIndex = 0,
  open,
  onClose,
}: ReviewImageViewerProps) => {
  useEffect(() => {
    if (!open) {
      return
    }

    const previousBodyOverflow = document.body.style.overflow
    const previousBodyPosition = document.body.style.position
    const previousBodyTop = document.body.style.top
    const previousBodyWidth = document.body.style.width
    const previousDocumentOverflow = document.documentElement.style.overflow
    const scrollY = window.scrollY

    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = '100%'
    document.documentElement.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousBodyOverflow
      document.body.style.position = previousBodyPosition
      document.body.style.top = previousBodyTop
      document.body.style.width = previousBodyWidth
      document.documentElement.style.overflow = previousDocumentOverflow
      window.scrollTo({ top: scrollY, behavior: 'auto' })
    }
  }, [open])

  if (!open) {
    return null
  }

  return (
    <div
      aria-label="리뷰 이미지 상세보기"
      aria-modal="true"
      className="bg-cool-gray-900 z-modal fixed inset-0 overflow-hidden"
      role="dialog"
    >
      <IconButton
        aria-label="리뷰 이미지 상세보기 닫기"
        className="text-primary-100 z-raised absolute top-[78px] right-5 size-6"
        onClick={onClose}
        size="xs"
      >
        <CancelIcon className="size-6" />
      </IconButton>

      <Carousel.Root
        aria-label="리뷰 이미지 상세보기 사진 목록"
        className="absolute inset-0"
        defaultIndex={initialIndex}
      >
        <Carousel.Viewport className="absolute top-[139px] bottom-[139px] overflow-y-hidden">
          <Carousel.Track>
            {imageUrls.map((imageUrl, index) => (
              <Carousel.Item key={`${imageUrl}-${index}`}>
                <div
                  className="bg-primary-100 h-full w-full"
                  data-testid="review-image-viewer-image"
                >
                  <RestaurantImage
                    className="size-full object-cover"
                    defaultImageTestId="review-image-viewer-default-image"
                    logoSize="lg"
                    src={imageUrl}
                  />
                </div>
              </Carousel.Item>
            ))}
          </Carousel.Track>
        </Carousel.Viewport>
        <Carousel.Indicator
          activeDotClassName="bg-cool-gray-200 h-1 w-3"
          className="bottom-10 gap-[5px]"
          dotClassName="bg-cool-gray-200 size-1"
        />
      </Carousel.Root>
    </div>
  )
}
