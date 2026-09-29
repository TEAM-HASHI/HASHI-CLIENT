import { CheckIcon } from '@hashi/hds-icons'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

import { cn } from '../../utils'

export type OptionItemProps = {
  children: ReactNode
  selected?: boolean
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'type'>

export const OptionItem = ({
  children,
  className,
  disabled = false,
  selected = false,
  ...props
}: OptionItemProps) => {
  return (
    <button
      {...props}
      aria-pressed={selected}
      className={cn(
        'text-cool-gray-900 flex h-9 w-full items-center overflow-hidden py-2.5',
        'focus-visible:outline-cool-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2',
        'disabled:text-warm-gray-300 disabled:cursor-not-allowed',
        className,
      )}
      disabled={disabled}
      type="button"
    >
      <span className="flex min-w-0 flex-1 items-start justify-between">
        <span className="typo-body-3 min-w-0 truncate">{children}</span>
        {selected ? (
          <CheckIcon aria-hidden="true" className="size-5 shrink-0" />
        ) : null}
      </span>
    </button>
  )
}
