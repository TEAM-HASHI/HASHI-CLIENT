export const myReviewQueryKeys = {
  all: ['myReviews'] as const,
  count: () => [...myReviewQueryKeys.all, 'count'] as const,
  detail: (reviewId: number | null) =>
    [...myReviewQueryKeys.details(), reviewId] as const,
  details: () => [...myReviewQueryKeys.all, 'detail'] as const,
  lists: () => [...myReviewQueryKeys.all, 'list'] as const,
  writtenInfinite: (size: number) =>
    [...myReviewQueryKeys.lists(), 'written', 'infinite', { size }] as const,
}
