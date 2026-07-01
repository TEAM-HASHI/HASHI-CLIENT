import type { ReactNode } from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '../../utils'

export type BadgeProps = {
  label: ReactNode
  icon?: ReactNode
  interactive?: boolean
  selected?: boolean
  onSelectedChange?: (selected: boolean) => void
  className?: string
}

const badgeVariants = cva(
  'typo-body-8 inline-flex max-w-full shrink-0 items-center gap-1 rounded-lg px-2.5 py-1 font-sans text-black whitespace-nowrap',
  {
    variants: {
      interactive: {
        true: 'appearance-none focus-visible:outline-cool-gray-900 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2',
        false: null,
      },
      selected: {
        true: 'border-primary-400 bg-primary-400/20 border-[1.4px]',
        false: 'border-warm-gray-100 border bg-white',
      },
    },
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
  const {
    icon,
    interactive = false,
    label,
    onSelectedChange,
    selected = false,
    className,
  } = props

  if (interactive) {
    const handleClick = () => {
      onSelectedChange?.(!selected)
    }

    return (
      <button
        aria-pressed={selected}
        className={cn(
          badgeVariants({ interactive: true, selected }),
          className,
        )}
        onClick={handleClick}
        type="button"
      >
        <BadgeContent icon={icon} label={label} />
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
