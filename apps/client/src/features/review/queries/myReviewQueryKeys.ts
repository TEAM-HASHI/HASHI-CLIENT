export const myReviewQueryKeys = {
  all: ['myReviews'] as const,
  count: () => [...myReviewQueryKeys.all, 'count'] as const,
  detail: (reviewId: number | null) =>
    [...myReviewQueryKeys.details(), reviewId] as const,
  details: () => [...myReviewQueryKeys.all, 'detail'] as const,
  editContext: (reviewId: number | null) =>
    [...myReviewQueryKeys.editContexts(), reviewId] as const,
  editContexts: () => [...myReviewQueryKeys.all, 'editContext'] as const,
  lists: () => [...myReviewQueryKeys.all, 'list'] as const,
  writtenInfinite: (size: number) =>
    [...myReviewQueryKeys.lists(), 'written', 'infinite', { size }] as const,
}
