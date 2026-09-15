import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '../../utils'

type BadgeBaseProps = {
  label: ReactNode
  icon?: ReactNode
  disabledIcon?: ReactNode
  className?: string
}

type BadgeStaticProps = BadgeBaseProps & {
  interactive?: false
  selected?: never
  onSelectedChange?: never
}

type BadgeInteractiveProps = BadgeBaseProps & {
  interactive: true
  selected?: boolean
  onSelectedChange?: (selected: boolean) => void
  'aria-disabled'?: ComponentPropsWithoutRef<'button'>['aria-disabled']
}

export type BadgeProps = BadgeStaticProps | BadgeInteractiveProps

const badgeVariants = cva(
  'typo-body-8 inline-flex h-9 max-w-full shrink-0 items-center justify-center gap-1 rounded-[5px] border px-2.5 py-1 font-sans text-black whitespace-nowrap transition-colors',
  {
    variants: {
      disabled: {
        true: 'border-warm-gray-100 bg-primary-100 text-warm-gray-300',
        false: null,
      },
      interactive: {
        true: 'focus-visible:outline-cool-gray-900 cursor-pointer appearance-none focus-visible:outline-2 focus-visible:outline-offset-2',
        false: null,
      },
      selected: {
        true: 'border-[1.4px] border-primary-400 bg-primary-400/20',
        false: 'border-warm-gray-100 bg-white',
      },
    },
    compoundVariants: [
      {
        className: 'hover:bg-primary-100 active:bg-primary-400/20',
        disabled: false,
        interactive: true,
        selected: false,
      },
      {
        className: 'hover:bg-primary-400/30 active:bg-primary-400/50',
        disabled: false,
        interactive: true,
        selected: true,
      },
      {
        className: 'cursor-not-allowed border-warm-gray-100 bg-primary-100',
        disabled: true,
        interactive: true,
      },
    ],
  },
)

const BadgeContent = ({ icon, label }: Pick<BadgeProps, 'icon' | 'label'>) => {
  return (
    <>
      {icon ? (
        <span
          aria-hidden="true"
          className="flex size-6 shrink-0 items-center justify-center text-[24px]"
        >
          {icon}
        </span>
      ) : null}
      <span className="min-w-0 truncate">{label}</span>
    </>
  )
}

export const Badge = (props: BadgeProps) => {
  const { disabledIcon, icon, label, className } = props
  const selected = props.interactive ? (props.selected ?? false) : false

  if (props.interactive) {
    const {
      'aria-disabled': ariaDisabled,
      onSelectedChange,
      selected: interactiveSelected = false,
    } = props
    const isDisabled = ariaDisabled === true || ariaDisabled === 'true'
    const displayIcon = isDisabled && disabledIcon ? disabledIcon : icon

    const handleClick = () => {
      if (isDisabled) {
        return
      }

      onSelectedChange?.(!interactiveSelected)
    }

    return (
      <button
        aria-disabled={ariaDisabled}
        aria-pressed={selected}
        className={cn(
          badgeVariants({ disabled: isDisabled, interactive: true, selected }),
          className,
        )}
        onClick={handleClick}
        type="button"
      >
        <BadgeContent icon={displayIcon} label={label} />
      </button>
    )
  }

  return (
    <span
      className={cn(badgeVariants({ interactive: false, selected }), className)}
    >
      <BadgeContent icon={icon} label={label} />
    </span>
  )
}
