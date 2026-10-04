import { Button } from '@hashi/hds-ui'

import { BottomActionBar } from '@/shared/components/bottomActionBar'

interface ReviewDetailActionBarProps {
  onDeleteClick: () => void
  onEditClick: () => void
}

export const ReviewDetailActionBar = ({
  onDeleteClick,
  onEditClick,
}: ReviewDetailActionBarProps) => {
  return (
    <BottomActionBar
      aria-label="리뷰 상세 액션"
      startAction={
        <Button
          onClick={onDeleteClick}
          size="lg"
          variant="destructive"
          width="full"
        >
          삭제하기
        </Button>
      }
      endAction={
        <Button
          className="text-black"
          onClick={onEditClick}
          size="lg"
          variant="neutral"
          width="full"
        >
          수정하기
        </Button>
      }
    />
  )
}
