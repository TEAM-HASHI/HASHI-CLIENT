import { Chip } from '@hashi/hds-ui'

import {
  RESERVATION_STATUS_FILTER_OPTIONS,
  type ReservationStatusFilterValue,
} from '@/pages/myReservations/constants/reservationStatus'
import { cn } from '@/shared/utils'

type ReservationStatusFilterProps = {
  selectedStatus: ReservationStatusFilterValue
  onStatusChange: (status: ReservationStatusFilterValue) => void
  className?: string
}

export const ReservationStatusFilter = ({
  selectedStatus,
  onStatusChange,
  className,
}: ReservationStatusFilterProps) => {
  return (
    <div
      aria-label="예약 상태 필터"
      className={cn(
        '-mx-5 flex gap-2 overflow-x-auto px-5 pb-3.25',
        'border-warm-gray-50 border-b',
        className,
      )}
      role="group"
    >
      {RESERVATION_STATUS_FILTER_OPTIONS.map((option) => (
        <Chip
          key={option.value}
          selected={selectedStatus === option.value}
          onSelectedChange={(nextSelected) => {
            if (nextSelected) {
              onStatusChange(option.value)
            }
          }}
        >
          {option.label}
        </Chip>
      ))}
    </div>
  )
}
