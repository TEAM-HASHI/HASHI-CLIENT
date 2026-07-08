import { CancelIcon } from '@hashi/hds-icons'
import { Carousel, IconButton } from '@hashi/hds-ui'

interface ReviewImageViewerProps {
  open: boolean
  onClose: () => void
}

const REVIEW_IMAGE_PLACEHOLDER_COUNT = 5

export const ReviewImageViewer = ({
  open,
  onClose,
}: ReviewImageViewerProps) => {
  if (!open) {
    return null
  }

  return (
    <div
      aria-label="리뷰 이미지 상세보기"
      aria-modal="true"
      className="bg-cool-gray-900 fixed inset-0 z-50 overflow-hidden rounded-[20px]"
      role="dialog"
    >
      <IconButton
        aria-label="리뷰 이미지 상세보기 닫기"
        className="text-primary-100 absolute top-[78px] right-5 z-10 size-6"
        onClick={onClose}
        size="xs"
      >
        <CancelIcon className="size-6" />
      </IconButton>

      <Carousel.Root
        aria-label="리뷰 이미지 상세보기 사진 목록"
        className="absolute inset-0"
      >
        <Carousel.Viewport className="absolute top-[139px] bottom-[139px] overflow-y-hidden">
          <Carousel.Track>
            {Array.from(
              { length: REVIEW_IMAGE_PLACEHOLDER_COUNT },
              (_, index) => (
                <Carousel.Item key={index}>
                  <div
                    className="bg-primary-100 h-full w-full"
                    data-testid="review-image-viewer-image"
                  />
                </Carousel.Item>
              ),
            )}
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
