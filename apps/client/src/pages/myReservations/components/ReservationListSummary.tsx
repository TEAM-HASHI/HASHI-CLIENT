import { cn } from '@/shared/utils'

type ReservationListSummaryProps = {
  totalCount: number
  showLatestOrder?: boolean
  className?: string
}

export const ReservationListSummary = ({
  totalCount,
  showLatestOrder = false,
  className,
}: ReservationListSummaryProps) => {
  return (
    <div
      className={cn(
        'typo-body-2 flex items-center justify-between gap-3 py-[7.5px]',
        className,
      )}
    >
      <span className="text-primary-200">
        총 <span className="typo-sub-header-1">{totalCount}</span>건
      </span>
      {showLatestOrder ? (
        <span className="typo-body-6 shrink-0 text-black">최신순</span>
      ) : null}
    </div>
  )
}
