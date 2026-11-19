import { createContext } from 'react'

type ReviewModerationStatus =
  | 'available'
  | 'own'
  | 'blocked'
  | 'reported'
  | 'unavailable'

export interface ReviewModeration {
  getReviewStatus: (reviewId: string) => ReviewModerationStatus
  blockReviewer: (reviewId: string) => Promise<void>
  reportReview: (input: {
    reviewId: string
    reason: string
    details: string
  }) => Promise<'submitted' | 'already-reported'>
}

// Provided by the caller once it can supply viewer-specific review state and actions.
export const ReviewModerationContext = createContext<ReviewModeration | null>(
  null,
)

export const REVIEW_REPORT_DUPLICATE_MESSAGE = '이미 신고한 리뷰예요.'
