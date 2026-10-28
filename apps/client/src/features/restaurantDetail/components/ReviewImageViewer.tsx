import { CancelIcon } from '@hashi/hds-icons'
import { Carousel, Dialog, IconButton } from '@hashi/hds-ui'

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
  if (!open) {
    return null
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
    >
      <Dialog.Content
        aria-label="리뷰 이미지 상세보기"
        className="bg-cool-gray-900 z-modal fixed inset-0 m-0 h-dvh w-full max-w-none overflow-hidden rounded-none p-0"
      >
        <Dialog.Title className="sr-only">리뷰 이미지 상세보기</Dialog.Title>
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
                      markSize="lg"
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
      </Dialog.Content>
    </Dialog.Root>
  )
}
