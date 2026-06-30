import { SearchIcon } from '@hashi/hds-icons'
import type { InputHTMLAttributes } from 'react'

import { cn } from '../../utils'

export type SearchFieldProps = {
  className?: string
  inputClassName?: string
  'aria-label': string
} & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'children' | 'className' | 'size' | 'type'
>

export const SearchField = ({
  className,
  inputClassName,
  disabled = false,
  ...props
}: SearchFieldProps) => {
  return (
    <div
      className={cn(
        'focus-within:outline-cool-gray-900 bg-primary-100 text-cool-gray-700 flex h-11 w-full items-center gap-2 rounded-[10px] px-4 focus-within:outline-2 focus-within:outline-offset-2',
        'data-[disabled=true]:opacity-40',
        className,
      )}
      data-disabled={disabled ? 'true' : undefined}
    >
      <SearchIcon
        aria-hidden="true"
        className="size-6 shrink-0"
        focusable="false"
      />
      <input
        {...props}
        className={cn(
          'typo-body-4 text-cool-gray-900 placeholder:text-warm-gray-300 min-w-0 flex-1 appearance-none border-0 bg-transparent p-0 outline-none disabled:cursor-not-allowed',
          '[&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none',
          inputClassName,
        )}
        disabled={disabled}
        type="search"
      />
    </div>
  )
}
