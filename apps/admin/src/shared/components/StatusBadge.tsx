import type {
  AdminReservationStatus,
  RestaurantStatus,
} from '@/shared/api/adminTypes'
import { cn } from '@/shared/utils/cn'

type StatusValue = RestaurantStatus | AdminReservationStatus

const statusLabel: Record<StatusValue, string> = {
  open: '운영중',
  paused: '일시중지',
  closed: '운영종료',
  CONTACTING: '대기',
  CONFIRMED: '확정',
  VISITED: '방문완료',
  CANCELLED: '취소',
}

const statusClassName: Record<StatusValue, string> = {
  open: 'bg-primary-100 text-primary-200',
  paused: 'bg-warning/10 text-warning',
  closed: 'bg-cool-gray-100 text-cool-gray-500',
  CONTACTING: 'bg-warning/10 text-warning',
  CONFIRMED: 'bg-primary-100 text-primary-200',
  VISITED: 'bg-success/10 text-success',
  CANCELLED: 'bg-error/10 text-error',
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
