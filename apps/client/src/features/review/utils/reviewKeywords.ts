import type { ReviewKeywordId } from '../constants/reviewKeywords'

export const getNextSelectedReviewKeywordIds = (
  selectedKeywordIds: ReviewKeywordId[],
  keywordId: ReviewKeywordId,
  nextSelected: boolean,
) => {
  if (nextSelected) {
    return [...selectedKeywordIds, keywordId]
  }

  return selectedKeywordIds.filter(
    (selectedKeywordId) => selectedKeywordId !== keywordId,
  )
}
