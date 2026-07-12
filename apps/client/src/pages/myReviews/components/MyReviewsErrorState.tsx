import { Button } from '@hashi/hds-ui'

interface MyReviewsErrorStateProps {
  onRetry: () => void
}

export const MyReviewsErrorState = ({ onRetry }: MyReviewsErrorStateProps) => (
  <div className="flex min-h-[360px] flex-col items-center justify-center gap-4 px-5 text-center">
    <p className="typo-body-4 text-primary-200">
      리뷰 목록을 불러오지 못했습니다.
    </p>
    <Button onClick={onRetry} size="sm" variant="neutral">
      다시 시도
    </Button>
  </div>
)
