import { cn } from '@/shared/utils'

interface AnywhereReservationTimeSelectorProps {
  timeSlots: readonly string[]
  selectedTime?: string
  onTimeSelect: (time: string) => void
}

export const AnywhereReservationTimeSelector = ({
  timeSlots,
  selectedTime,
  onTimeSelect,
}: AnywhereReservationTimeSelectorProps) => {
  return (
    <div className="grid grid-cols-4 gap-[7px]" role="group" aria-label="시간">
      {timeSlots.map((time) => {
        const isSelected = selectedTime === time

        return (
          <button
            aria-pressed={isSelected}
            className={cn(
              'typo-body-5 bg-secondary-200 text-primary-200 focus-visible:outline-cool-gray-900 flex h-9 min-w-0 items-center justify-center rounded-[5px] px-2 focus-visible:outline-2 focus-visible:outline-offset-2',
              isSelected && 'bg-black text-white',
            )}
            key={time}
            onClick={() => onTimeSelect(time)}
            type="button"
          >
            {time}
          </button>
        )
      })}
    </div>
  )
}
