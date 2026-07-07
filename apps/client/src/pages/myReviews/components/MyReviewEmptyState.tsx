import { Button } from '@hashi/hds-ui'
import type { ReactNode } from 'react'

interface MyReviewEmptyStateProps {
  graphic?: ReactNode
  message: string
  onClick: () => void
}

export const MyReviewEmptyState = ({
  graphic,
  message,
  onClick,
}: MyReviewEmptyStateProps) => {
  return (
    <main className="flex min-h-[calc(100dvh-115px)] min-w-0 flex-col items-center justify-center overflow-x-hidden px-5 pb-20">
      {/* TODO: 여기에 그래픽 컴포넌트 넣어주시면 됩니다 */}
      <div className="flex aspect-[135/151] w-full max-w-[135px] items-center justify-center">
        {graphic}
      </div>
      <p className="typo-header-3 text-primary-200 mt-5 text-center leading-[1.5]">
        {message}
      </p>
      <Button
        className="mt-5 h-[42px] w-[237px] max-w-full"
        onClick={onClick}
        size="md"
        variant="primary"
      >
        일본 맛집 추천받기
      </Button>
    </main>
  )
}
