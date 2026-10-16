import { cn } from '@/shared/utils'

type ReservationListSummaryProps = {
  totalCount: number
  className?: string
}

export const ReservationListSummary = ({
  totalCount,
  className,
}: ReservationListSummaryProps) => {
  return (
    <div className={cn('typo-body-2 flex items-center py-[7.5px]', className)}>
      <span className="text-primary-200">
        총 <span className="typo-sub-header-1">{totalCount}</span>건
      </span>
    </div>
  )
}
