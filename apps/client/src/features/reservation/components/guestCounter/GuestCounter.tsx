import { MinusIcon, PlusIcon } from '@hashi/hds-icons'
import { cn } from '@/shared/utils'

export interface GuestCounterProps {
  label: string
  value: number
  disabled?: boolean
  onDecrease: () => void
  onIncrease: () => void
}

export const GuestCounter = ({
  label,
  value,
  disabled = false,
  onDecrease,
  onIncrease,
}: GuestCounterProps) => {
  const isDecreaseDisabled = disabled || value <= 0

  return (
    <div
      className="border-warm-gray-100 w-full border-b"
      data-testid="guest-counter"
    >
      <div className="flex items-center justify-between py-2.5">
        <span className="typo-body-4 text-primary-200 min-w-0 truncate">
          {label}
        </span>
        <div className="flex shrink-0 items-center gap-[6px]">
          <button
            aria-label={`${label} 인원 줄이기`}
            className={cn(
              'active:border-primary-400 active:text-primary-400 flex size-6 shrink-0 appearance-none items-center justify-center rounded-full border-[1.4px] border-black text-black disabled:cursor-not-allowed',
              isDecreaseDisabled && 'active:border-black active:text-black',
            )}
            disabled={isDecreaseDisabled}
            onClick={onDecrease}
            type="button"
          >
            <MinusIcon aria-hidden="true" className="size-6 scale-[1.4]" />
          </button>
          <span className="typo-body-4 text-primary-200 w-[25px] shrink-0 text-center tabular-nums">
            {value}
          </span>
          <button
            aria-label={`${label} 인원 늘리기`}
            className={cn(
              'active:border-primary-400 active:text-primary-400 flex size-6 shrink-0 appearance-none items-center justify-center rounded-full border-[1.4px] border-black text-black disabled:cursor-not-allowed',
              disabled && 'active:border-black active:text-black',
            )}
            disabled={disabled}
            onClick={onIncrease}
            type="button"
          >
            <PlusIcon aria-hidden="true" className="size-6 scale-[1.4]" />
          </button>
        </div>
      </div>
    </div>
  )
}
