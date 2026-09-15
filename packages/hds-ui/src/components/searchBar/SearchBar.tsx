import { SearchIcon } from '@hashi/hds-icons'
import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'

import { cn } from '../../utils'

export type SearchBarProps = {
  className?: string
  inputClassName?: string
  icon?: boolean
  'aria-label': string
} & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'children' | 'className' | 'size' | 'type'
>

export type SearchFieldProps = SearchBarProps

export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  (
    { className, icon = true, inputClassName, disabled = false, ...props },
    ref,
  ) => {
    return (
      <div
        className={cn(
          'bg-primary-100 hover:bg-warm-gray-50 active:bg-warm-gray-100 flex h-[45px] w-full items-center rounded-[10px] py-4 pr-3 pl-3 transition-colors',
          icon && 'gap-2',
          'data-[disabled=true]:opacity-40',
          className,
        )}
        data-disabled={disabled ? 'true' : undefined}
      >
        {icon ? (
          <SearchIcon
            aria-hidden="true"
            className="text-cool-gray-700 size-6 shrink-0"
            focusable="false"
          />
        ) : null}
        <input
          {...props}
          ref={ref}
          className={cn(
            'typo-body-4 placeholder:text-warm-gray-300 min-w-0 flex-1 appearance-none border-0 bg-transparent p-0 text-black outline-none disabled:cursor-not-allowed',
            '[&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none',
            inputClassName,
          )}
          disabled={disabled}
          type="search"
        />
      </div>
    )
  },
)

SearchBar.displayName = 'SearchBar'

export const SearchField = SearchBar
