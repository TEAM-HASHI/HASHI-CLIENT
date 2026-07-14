import { Badge } from '@hashi/hds-ui'

import { getReviewKeywordByValue } from '@/features/review/constants'

export interface ReviewKeywordBadgeProps {
  keyword: string
}

export const ReviewKeywordBadge = ({ keyword }: ReviewKeywordBadgeProps) => {
  const keywordOption = getReviewKeywordByValue(keyword)
  const KeywordIcon = keywordOption?.Icon

  return (
    <Badge
      className="border-warm-gray-100 rounded-[5px] px-2.5 py-1"
      icon={
        KeywordIcon ? (
          <KeywordIcon aria-hidden="true" className="size-6" />
        ) : undefined
      }
      label={keywordOption?.label ?? keyword}
    />
  )
}
