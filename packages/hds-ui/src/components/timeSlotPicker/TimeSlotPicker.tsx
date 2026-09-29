import type { ComponentPropsWithoutRef } from 'react'

import { cn } from '../../utils'

export interface TimeSlotPickerProps extends Omit<
  ComponentPropsWithoutRef<'div'>,
  'children'
> {
  timeSlots: readonly string[]
  selectedTime?: string
  disabled?: boolean
  onTimeSelect?: (time: string) => void
}

export const TimeSlotPicker = ({
  timeSlots,
  selectedTime,
  disabled = false,
  onTimeSelect,
  className,
  'aria-label': ariaLabel = '시간',
  ...props
}: TimeSlotPickerProps) => {
  return (
    <div
      {...props}
      role="group"
      aria-label={ariaLabel}
      className={cn('grid w-full grid-cols-4 gap-1.75 font-sans', className)}
    >
      {timeSlots.map((time) => {
        const isSelected = selectedTime === time

        return (
          <button
            key={time}
            type="button"
            aria-pressed={isSelected}
            disabled={disabled}
            onClick={() => onTimeSelect?.(time)}
            className={cn(
              'typo-body-5 bg-secondary-200 text-primary-200 focus-visible:outline-cool-gray-900 disabled:bg-warm-gray-100 flex h-9 min-w-0 cursor-pointer appearance-none items-center justify-center rounded-[5px] border-0 px-2 text-center focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:text-white',
              isSelected && !disabled && 'bg-black text-white',
            )}
          >
            <span className="min-w-0 truncate">{time}</span>
          </button>
        )
      })}
    </div>
  )
}
