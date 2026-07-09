import { cn } from '@/shared/utils'

type ReservationListSummaryProps = {
  totalCount: number
  sortLabel: string
  className?: string
}

export const ReservationListSummary = ({
  totalCount,
  sortLabel,
  className,
}: ReservationListSummaryProps) => {
  return (
    <div
      className={cn(
        'typo-body-2 flex items-center justify-between py-[16.5px]',
        className,
      )}
    >
      <span className="text-primary-200">
        총 <span className="typo-sub-header-1">{totalCount}</span>건
      </span>
      <span className="typo-body-6 text-black">{sortLabel}</span>
    </div>
  )
}
