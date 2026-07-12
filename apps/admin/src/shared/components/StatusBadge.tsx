import type { ReservationStatus } from '@/shared/api/reservationViewModel'
import { cn } from '@/shared/utils/cn'

type StatusValue = ReservationStatus

const statusLabel: Record<StatusValue, string> = {
  REQUESTED: '요청됨',
  CONTACTING: '연락 중',
  CONFIRMED: '확정',
  VISITED: '방문완료',
  CANCELED: '취소',
  UNKNOWN: '확인 필요',
}

const statusClassName: Record<StatusValue, string> = {
  REQUESTED: 'bg-warning/10 text-warning',
  CONTACTING: 'bg-warning/10 text-warning',
  CONFIRMED: 'bg-primary-100 text-primary-200',
  VISITED: 'bg-success/10 text-success',
  CANCELED: 'bg-error/10 text-error',
  UNKNOWN: 'bg-cool-gray-100 text-cool-gray-500',
}

interface StatusBadgeProps {
  status: StatusValue
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  return (
    <span
      className={cn(
        'inline-flex h-7 items-center rounded-full px-2.5 text-xs font-bold',
        statusClassName[status],
      )}
    >
      {statusLabel[status]}
    </span>
  )
}
