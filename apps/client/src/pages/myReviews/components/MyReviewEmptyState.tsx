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
    <main className="flex min-h-[calc(100dvh-115px)] flex-col items-center justify-center px-5 pb-20">
      {/* TODO: Replace this slot with the shared empty graphic component when it is ready. */}
      <div className="flex h-[151px] w-[135px] items-center justify-center">
        {graphic}
      </div>
      <p className="typo-header-3 text-primary-200 mt-5 text-center leading-[1.5]">
        {message}
      </p>
      <Button
        className="mt-5 h-[42px] w-[237px]"
        onClick={onClick}
        size="md"
        variant="primary"
      >
        일본 맛집 추천받기
      </Button>
    </main>
  )
}
