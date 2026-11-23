import { Badge } from '@hashi/hds-ui'

import { getReviewKeywordByValue } from '@/features/review/constants'

export interface ReviewKeywordBadgeProps {
  keyword: string
  className?: string
}

export const ReviewKeywordBadge = ({
  keyword,
  className,
}: ReviewKeywordBadgeProps) => {
  const keywordOption = getReviewKeywordByValue(keyword)
  const KeywordIcon = keywordOption?.Icon

  return (
    <Badge
      className={className}
      icon={
        KeywordIcon ? (
          <KeywordIcon aria-hidden="true" className="size-6" />
        ) : undefined
      }
      label={keywordOption?.label ?? keyword}
    />
  )
}
