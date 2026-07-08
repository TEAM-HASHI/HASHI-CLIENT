import { Button } from '@hashi/hds-ui'

interface ReviewDetailActionBarProps {
  onDeleteClick: () => void
  onEditClick: () => void
}

export const ReviewDetailActionBar = ({
  onDeleteClick,
  onEditClick,
}: ReviewDetailActionBarProps) => {
  return (
    <footer
      aria-label="리뷰 상세 액션"
      className="app-mobile-fixed-bottom z-fixed bg-white px-5 pt-4.25 pb-[calc(48px+var(--safe-area-bottom,0px))]"
    >
      <div className="grid grid-cols-2 gap-3.25">
        <Button
          className="text-primary-400"
          onClick={onDeleteClick}
          size="lg"
          variant="neutral"
          width="full"
        >
          삭제하기
        </Button>
        <Button
          className="text-black"
          onClick={onEditClick}
          size="lg"
          variant="neutral"
          width="full"
        >
          수정하기
        </Button>
      </div>
    </footer>
  )
}
