import { Badge } from '@hashi/hds-ui'
import type { ComponentPropsWithoutRef } from 'react'

import {
  REVIEW_KEYWORD_MAX_SELECTED_COUNT,
  REVIEW_KEYWORDS,
  type ReviewKeywordId,
} from '@/features/review/constants'
import { getNextSelectedReviewKeywordIds } from '@/features/review/utils'
import { cn } from '@/shared/utils'

export interface InputReviewKeywordProps extends Omit<
  ComponentPropsWithoutRef<'section'>,
  'children' | 'onChange'
> {
  selectedKeywordIds?: ReviewKeywordId[]
  onSelectedKeywordIdsChange?: (selectedKeywordIds: ReviewKeywordId[]) => void
}

export const InputReviewKeyword = ({
  selectedKeywordIds = [],
  onSelectedKeywordIdsChange,
  className,
  ...props
}: InputReviewKeywordProps) => {
  const selectedKeywordIdSet = new Set(selectedKeywordIds)
  const hasReachedMaxSelection =
    selectedKeywordIds.length >= REVIEW_KEYWORD_MAX_SELECTED_COUNT

  return (
    <section
      {...props}
      className={cn('flex flex-col items-start gap-5 px-5 py-7', className)}
    >
      <div className="flex w-full flex-col items-start gap-1 break-words">
        <p className="typo-sub-header-1 text-primary-200 w-full">
          어떤 점이 좋으셨나요?
        </p>
        <p className="typo-body-7 text-cool-gray-600 w-full">
          ( 키워드를 1개~3개 선택해주세요.)
        </p>
      </div>
      <div
        aria-label="리뷰 키워드 선택"
        className="flex w-full flex-wrap gap-x-2 gap-y-3 overflow-hidden px-0.5 py-1"
        role="group"
      >
        {REVIEW_KEYWORDS.map(({ id, label, Icon }) => {
          const isSelected = selectedKeywordIdSet.has(id)
          const isAdditionDisabled = !isSelected && hasReachedMaxSelection

          return (
            <Badge
              aria-disabled={isAdditionDisabled ? 'true' : undefined}
              className="rounded-[5px] border px-2.5 py-1"
              icon={<Icon aria-hidden="true" />}
              interactive
              key={id}
              label={label}
              selected={isSelected}
              onSelectedChange={(nextSelected) => {
                if (isAdditionDisabled) {
                  return
                }

                onSelectedKeywordIdsChange?.(
                  getNextSelectedReviewKeywordIds(
                    selectedKeywordIds,
                    id,
                    nextSelected,
                  ),
                )
              }}
            />
          )
        })}
      </div>
    </section>
  )
}
