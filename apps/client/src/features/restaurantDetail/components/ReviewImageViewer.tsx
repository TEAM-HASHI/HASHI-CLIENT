import { CancelIcon } from '@hashi/hds-icons'
import {
  Avatar,
  Carousel,
  Dialog,
  ExpandableText,
  IconButton,
  StarRating,
} from '@hashi/hds-ui'

import { ReviewKeywordBadge } from '@/features/review/components'
import { RestaurantImage } from '@/features/restaurantDetail/components/RestaurantImage'
import type { RestaurantReview } from '@/features/restaurantDetail/types/restaurantDetail'

interface ReviewImageViewerProps {
  imageUrls: string[]
  initialIndex?: number
  review?: RestaurantReview
  open: boolean
  onClose: () => void
}

export const ReviewImageViewer = ({
  imageUrls,
  initialIndex = 0,
  review,
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
          className="text-primary-100 z-raised absolute top-[calc(78px+var(--safe-area-top,0px))] right-5 size-6"
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
          {review && (
            <>
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-linear-to-b from-transparent from-50% to-[#000000]"
              />
              <article
                aria-label={`${review.reviewerName} 리뷰 정보`}
                className="text-primary-100 absolute inset-x-5 bottom-[calc(48px+var(--safe-area-bottom,0px))] flex max-h-[calc(100%-120px-var(--safe-area-top,0px))] [scrollbar-width:none] flex-col gap-4 overflow-y-auto pt-5 pb-7"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Avatar
                      alt={`${review.reviewerName} 프로필 이미지`}
                      size="sm"
                      src={review.reviewerProfileImageUrl}
                    />
                    <h3 className="typo-sub-header-2">{review.reviewerName}</h3>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <StarRating
                      className="gap-0"
                      size="sm"
                      value={review.rating}
                    />
                    <time className="typo-body-6 text-warm-gray-300 leading-[1.36]">
                      {review.date}
                    </time>
                  </div>
                  <ExpandableText
                    key={review.id}
                    className="[&_p]:text-primary-100 [&_button]:text-warm-gray-300 [&_button[aria-expanded=true]]:text-cool-gray-600"
                    text={review.content}
                  />
                </div>
                {review.keywords.length > 0 && (
                  <div className="flex shrink-0 [scrollbar-width:none] gap-2 overflow-x-auto">
                    {review.keywords.map((keyword) => (
                      <ReviewKeywordBadge
                        className="h-8"
                        key={keyword}
                        keyword={keyword}
                      />
                    ))}
                  </div>
                )}
              </article>
            </>
          )}
          <Carousel.Indicator
            activeDotClassName="bg-warm-gray-300 h-1 w-3"
            className="bottom-[calc(40px+var(--safe-area-bottom,0px))] gap-[5px]"
            dotClassName="bg-warm-gray-300 size-1"
          />
        </Carousel.Root>
      </Dialog.Content>
    </Dialog.Root>
  )
}
