import { Badge, CollapsibleText, StarRating } from '@hashi/hds-ui'

import {
  REVIEW_KEYWORDS,
  REVIEW_PHOTO_MAX_COUNT,
  type ReviewKeywordId,
} from '@/features/review/constants'
import type { ReviewDetailImage } from '@/pages/reviewDetail/types'

interface ReviewDetailContentCardProps {
  rating: number
  writtenDate: string
  content: string
  images: ReviewDetailImage[]
  keywordIds: ReviewKeywordId[]
}

const reviewKeywordById = new Map(
  REVIEW_KEYWORDS.map((keyword) => [keyword.id, keyword]),
)

export const ReviewDetailContentCard = ({
  rating,
  writtenDate,
  content,
  images,
  keywordIds,
}: ReviewDetailContentCardProps) => {
  const selectedKeywords = keywordIds
    .map((keywordId) => reviewKeywordById.get(keywordId))
    .filter((keyword) => keyword !== undefined)
  const visibleImages = images.slice(0, REVIEW_PHOTO_MAX_COUNT)

  return (
    <article className="border-warm-gray-100 mx-5 flex flex-col gap-4 overflow-hidden border-b pt-5 pb-7">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <StarRating
            aria-label={`평점 ${rating}점`}
            className="gap-0"
            size="sm"
            value={rating}
          />
          <time className="typo-body-6 text-cool-gray-600 shrink-0">
            {writtenDate}
          </time>
        </div>
        <CollapsibleText className="break-words" text={content} />
      </div>

      {visibleImages.length > 0 ? (
        <ul
          aria-label="리뷰 이미지 목록"
          className="flex max-w-full min-w-0 [scrollbar-width:none] gap-2 overflow-x-auto overflow-y-hidden [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {visibleImages.map((image) => (
            <li className="shrink-0" key={image.id}>
              <img
                alt={image.alt}
                className="size-33.75 rounded-[10px] object-cover"
                src={image.src}
              />
            </li>
          ))}
        </ul>
      ) : null}

      {selectedKeywords.length > 0 ? (
        <ul
          aria-label="선택한 리뷰 키워드"
          className="flex max-w-full min-w-0 [scrollbar-width:none] gap-2 overflow-x-auto overflow-y-hidden [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {selectedKeywords.map(({ id, label, Icon }) => (
            <li className="shrink-0" key={id}>
              <Badge
                className="rounded-[5px] border"
                icon={<Icon aria-hidden="true" />}
                label={label}
              />
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  )
}
