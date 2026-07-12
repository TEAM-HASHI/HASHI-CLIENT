import type { ReactNode } from 'react'
import { cn } from '@/shared/utils/cn'

interface ActionButtonProps {
  children: ReactNode
  ariaLabel?: string
  variant?: 'default' | 'danger'
  disabled?: boolean
  onClick: () => void
}

export const ActionButton = ({
  children,
  ariaLabel,
  variant = 'default',
  disabled = false,
  onClick,
}: ActionButtonProps) => {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'inline-flex h-8 shrink-0 items-center justify-center gap-1 rounded-md border px-2.5 text-xs font-bold whitespace-nowrap transition disabled:opacity-50',
        variant === 'danger'
          ? 'border-error-100 text-error hover:bg-error-100'
          : 'border-cool-gray-100 text-cool-gray-700 hover:bg-cool-gray-50',
      )}
    >
      {children}
    </button>
  )
}
