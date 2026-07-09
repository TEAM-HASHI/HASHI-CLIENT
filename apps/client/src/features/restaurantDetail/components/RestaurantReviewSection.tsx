import { FastIcon, MoneyIcon, PencilIcon, SmileIcon } from '@hashi/hds-icons'
import { Badge, Button, Chip, CollapsibleText, StarRating } from '@hashi/hds-ui'

import graphicBillUrl from '@/features/restaurantDetail/assets/graphic-bill.svg'
import {
  RATING_DISTRIBUTION,
  REVIEW_SORT_OPTIONS,
} from '@/features/restaurantDetail/constants/restaurantReview'
import { useRestaurantReviews } from '@/features/restaurantDetail/hooks/useRestaurantReviews'
import type { RestaurantReview } from '@/features/restaurantDetail/types/restaurantDetail'
import { cn } from '@/shared/utils'

interface RestaurantReviewSectionProps {
  rating: number
  restaurantName: string
  reviewCount: number
  reviews: RestaurantReview[]
  onPressReviewImage: (reviewId: string, imageIndex: number) => void
  onPressWriteReview: () => void
}

const REVIEW_KEYWORD_ICON = {
  친절해요: <SmileIcon className="size-6" />,
  '음식이 빨리 나와요': <FastIcon className="size-6" />,
  '가성비가 좋아요': <MoneyIcon className="size-6" />,
}

const REVIEW_CONTENT_WIDTH_CLASS_NAME = 'mx-5'
const HORIZONTAL_SCROLL_CLASS_NAME =
  'flex [scrollbar-width:none] gap-2 overflow-x-auto [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden'
const REVIEW_STAR_RATING_CLASS_NAME =
  '[&&]:gap-0 [&_[data-state=filled]_svg]:text-primary-400 [&_[data-state=half]_span_svg]:text-primary-400'
const REVIEW_WRITE_ICON_CLASS_NAME =
  'size-6 [&_path:first-child]:fill-primary-100 [&_path:last-child]:stroke-primary-100'

interface RatingDistributionProps {
  className?: string
}

const RatingDistribution = ({ className }: RatingDistributionProps) => {
  return (
    <div className={cn('flex w-[170px] flex-col', className)}>
      {RATING_DISTRIBUTION.map((score) => (
        <div
          className="flex h-[19px] w-full items-center justify-between"
          key={score}
        >
          <span className="typo-caption-3 text-primary-200 w-3 text-center">
            {score}
          </span>
          <div className="bg-secondary-200 h-[3px] w-[150px] overflow-hidden rounded-full">
            <div className="bg-primary-400 h-full w-[93px] rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

export const RestaurantReviewSection = ({
  rating,
  restaurantName,
  reviewCount,
  reviews,
  onPressReviewImage,
  onPressWriteReview,
}: RestaurantReviewSectionProps) => {
  const {
    hasMoreReviews,
    loadMoreRef,
    selectedSort,
    visibleReviews,
    onSelectSort,
  } = useRestaurantReviews(reviews)

  return (
    <section aria-label="리뷰" className="pb-8">
      <div className="relative h-[171px]">
        <div className="absolute top-[54px] left-[42px] flex w-[90px] flex-col items-center gap-2">
          <div className="flex flex-col items-center">
            <p className="typo-sub-header-1 text-primary-200">
              {rating.toFixed(1)}
            </p>
            <p className="typo-body-8 text-cool-gray-600">({reviewCount})</p>
          </div>
          <StarRating
            className={REVIEW_STAR_RATING_CLASS_NAME}
            size="sm"
            value={rating}
          />
        </div>
        <RatingDistribution className="absolute top-7 left-[181px]" />
      </div>

      <div
        className={cn(
          'bg-cool-gray-50 flex h-[150px] flex-col items-center rounded-[10px] py-4',
          REVIEW_CONTENT_WIDTH_CLASS_NAME,
        )}
      >
        <div className="flex w-[321px] max-w-[calc(100%-32px)] flex-col items-center gap-2">
          <div className="flex w-full items-center justify-between">
            <div className="text-primary-200 flex w-[219px] shrink-0 flex-col gap-1">
              <p className="typo-sub-header-2 truncate">{restaurantName}</p>
              <p className="typo-body-4 whitespace-nowrap">
                다녀오셨나요? 리뷰를 남겨보세요!
              </p>
            </div>
            <img
              alt=""
              aria-hidden="true"
              className="size-[74px] shrink-0"
              src={graphicBillUrl}
            />
          </div>
          <Button
            className="bg-cool-gray-700 typo-body-5 h-9 w-full"
            leftIcon={<PencilIcon className={REVIEW_WRITE_ICON_CLASS_NAME} />}
            onClick={onPressWriteReview}
            size="sm"
            variant="primary"
          >
            리뷰 작성하기
          </Button>
        </div>
      </div>

      <div className="pt-5">
        <div className={REVIEW_CONTENT_WIDTH_CLASS_NAME}>
          <h2 className="typo-sub-header-1 text-primary-200 flex gap-1">
            리뷰 <span className="text-warm-gray-300">{reviewCount}</span>
          </h2>
          <div className="border-warm-gray-50 mt-4 flex h-[46px] gap-2 border-b">
            {REVIEW_SORT_OPTIONS.map((option) => (
              <Chip
                className="h-8 px-3 py-0"
                key={option.value}
                onSelectedChange={() => onSelectSort(option.value)}
                selected={selectedSort === option.value}
              >
                {option.label}
              </Chip>
            ))}
          </div>
        </div>

        <div className={REVIEW_CONTENT_WIDTH_CLASS_NAME}>
          {visibleReviews.map((review) => (
            <article
              className="border-warm-gray-100 flex flex-col gap-4 overflow-hidden border-b pt-5 pb-7"
              key={review.id}
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="bg-primary-100 size-10 shrink-0 rounded-full"
                  />
                  <h3 className="typo-sub-header-2 text-primary-200">
                    {review.reviewerName}
                  </h3>
                </div>
                <div className="flex items-center justify-between">
                  <StarRating
                    className={REVIEW_STAR_RATING_CLASS_NAME}
                    size="sm"
                    value={review.rating}
                  />
                  <time className="typo-body-6 text-cool-gray-600">
                    {review.date}
                  </time>
                </div>
                <CollapsibleText
                  className="[&_p]:typo-long-body-1 [&_p]:text-primary-200 [&_button]:text-cool-gray-600"
                  text={review.content}
                />
              </div>

              <div className={cn('w-full', HORIZONTAL_SCROLL_CLASS_NAME)}>
                {review.images.map((imageUrl, index) => {
                  const handleClick = () => {
                    onPressReviewImage(review.id, index)
                  }

                  return (
                    <button
                      aria-label={`리뷰 이미지 ${index + 1}`}
                      className="bg-primary-100 size-[135px] shrink-0 overflow-hidden"
                      key={`${review.id}-${index}`}
                      onClick={handleClick}
                      type="button"
                    >
                      {imageUrl ? (
                        <img
                          alt=""
                          className="size-full object-cover"
                          src={imageUrl}
                        />
                      ) : null}
                    </button>
                  )
                })}
              </div>

              <div className={HORIZONTAL_SCROLL_CLASS_NAME}>
                {review.keywords.map((keyword) => (
                  <Badge
                    className="border-warm-gray-100 rounded-[5px] px-2.5 py-1"
                    icon={
                      REVIEW_KEYWORD_ICON[
                        keyword as keyof typeof REVIEW_KEYWORD_ICON
                      ]
                    }
                    key={keyword}
                    label={keyword}
                  />
                ))}
              </div>
            </article>
          ))}
          {hasMoreReviews ? (
            <div ref={loadMoreRef} aria-hidden="true" className="h-1" />
          ) : null}
        </div>
      </div>
    </section>
  )
}
