import { CheckIcon } from '@hashi/hds-icons'

import { cn } from '@/shared/utils'

const RESERVATION_COMPLETE_STEPS = [
  { id: 'received', label: '예약 접수', status: 'completed' },
  { id: 'reviewing', label: 'Hashi에서 검토', status: 'current' },
  { id: 'confirmed', label: '예약 확정', status: 'pending' },
] as const

const dotClassNameMap = {
  completed: 'bg-black text-white',
  current: 'border-4 border-black bg-white',
  pending: 'bg-warm-gray-50',
} as const

const labelClassNameMap = {
  completed: 'typo-sub-header-3 text-black',
  current: 'typo-sub-header-3 text-primary-400',
  pending: 'typo-body-5 text-warm-gray-300',
} as const

interface ReservationCompleteProgressProps {
  className?: string
}

export const ReservationCompleteProgress = ({
  className,
}: ReservationCompleteProgressProps) => {
  return (
    <ol
      aria-label="예약 진행 단계"
      className={cn('relative flex w-[300px]', className)}
    >
      <span
        aria-hidden="true"
        className="absolute top-3 left-1/6 h-0.5 w-1/3 bg-black"
      />
      <span
        aria-hidden="true"
        className="bg-warm-gray-300 absolute top-3 left-1/2 h-0.5 w-1/3"
      />
      {RESERVATION_COMPLETE_STEPS.map(({ id, label, status }) => (
        <li
          aria-current={status === 'current' ? 'step' : undefined}
          className="z-raised relative flex w-1/3 flex-col items-center gap-2.5"
          key={id}
        >
          <span
            aria-hidden="true"
            className={cn(
              'flex size-6.5 items-center justify-center rounded-full',
              dotClassNameMap[status],
            )}
          >
            {status === 'completed' ? <CheckIcon className="size-5" /> : null}
          </span>
          <span className={cn('whitespace-nowrap', labelClassNameMap[status])}>
            {label}
          </span>
        </li>
      ))}
    </ol>
  )
}
