import { CheckIcon } from '@hashi/hds-icons'

import { cn } from '@/shared/utils'

const RESERVATION_COMPLETE_STEPS = [
  {
    id: 'received',
    label: '예약 접수',
    positionClassName: 'left-[26.5px]',
    status: 'completed',
  },
  {
    id: 'reviewing',
    label: 'Hashi에서 검토',
    positionClassName: 'left-[125.5px]',
    status: 'current',
  },
  {
    id: 'confirmed',
    label: '예약 확정',
    positionClassName: 'left-[230.5px]',
    status: 'pending',
  },
] as const

const dotClassNameMap = {
  completed: 'bg-black text-warm-gray-50',
  current: 'border-[6px] border-black bg-white',
  pending: 'bg-warm-gray-50',
} as const

const labelClassNameMap = {
  completed: 'text-black',
  current: 'text-primary-400',
  pending: 'text-warm-gray-300',
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
      className={cn('relative h-13 w-[256px]', className)}
    >
      <span
        aria-hidden="true"
        className="absolute top-[13.5px] left-4.25 h-px w-26.5 bg-black"
      />
      <span
        aria-hidden="true"
        className="bg-warm-gray-50 absolute top-[13.5px] left-31.25 h-px w-26.5"
      />
      {RESERVATION_COMPLETE_STEPS.map(
        ({ id, label, positionClassName, status }) => (
          <li
            aria-current={status === 'current' ? 'step' : undefined}
            className={cn(
              'z-raised absolute top-0 flex -translate-x-1/2 flex-col items-center gap-2',
              positionClassName,
            )}
            key={id}
          >
            <span
              aria-hidden="true"
              className={cn(
                'flex size-6.75 items-center justify-center rounded-full',
                dotClassNameMap[status],
              )}
            >
              {status === 'completed' ? (
                <CheckIcon className="size-6.5 [&_path]:stroke-[1.5]" />
              ) : null}
            </span>
            <span
              className={cn(
                'typo-body-6 whitespace-nowrap',
                labelClassNameMap[status],
              )}
            >
              {label}
            </span>
          </li>
        ),
      )}
    </ol>
  )
}
