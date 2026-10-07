import { CancelIcon, SearchIcon } from '@hashi/hds-icons'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { ComponentPropsWithRef } from 'react'

import { cn } from '../../utils'
import { IconButton } from '../iconButton'

export type SearchBarProps = {
  className?: string
  inputClassName?: string
  icon?: boolean
  onClear?: () => void
  'aria-label': string
} & Omit<
  ComponentPropsWithRef<'input'>,
  'children' | 'className' | 'size' | 'type'
>

export type SearchFieldProps = SearchBarProps

export const SearchBar = ({
  className,
  icon = true,
  inputClassName,
  disabled = false,
  readOnly = false,
  value,
  defaultValue,
  form,
  onChange,
  onClear,
  ref,
  ...props
}: SearchBarProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const setInputRef = useCallback(
    (node: HTMLInputElement | null) => {
      inputRef.current = node
      if (typeof ref === 'function') {
        const cleanup = ref(node)
        if (typeof cleanup === 'function') {
          return () => {
            inputRef.current = null
            cleanup()
          }
        }
        return
      }
      if (ref) {
        ref.current = node
      }
    },
    [ref],
  )
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue ?? '')
  const isControlled = value !== undefined
  const currentValue = isControlled ? value : uncontrolledValue
  const canClear =
    !disabled &&
    !readOnly &&
    String(currentValue).length > 0 &&
    (!isControlled || onClear !== undefined)

  useEffect(() => {
    const input = inputRef.current
    const ownerForm = input?.form
    if (isControlled || !input || !ownerForm) {
      return
    }
    let resetTimer: ReturnType<typeof setTimeout> | undefined
    const handleReset = (event: Event) => {
      // Read after the browser's default reset action has completed.
      clearTimeout(resetTimer)
      resetTimer = setTimeout(() => {
        if (!event.defaultPrevented && inputRef.current === input) {
          setUncontrolledValue(input.value)
        }
      }, 0)
    }
    ownerForm.addEventListener('reset', handleReset)
    return () => {
      ownerForm.removeEventListener('reset', handleReset)
      clearTimeout(resetTimer)
    }
  }, [isControlled, form])

  const handleClear = () => {
    if (!isControlled) {
      if (inputRef.current) {
        inputRef.current.value = ''
      }
      setUncontrolledValue('')
    }
    onClear?.()
    inputRef.current?.focus()
  }

  return (
    <div
      className={cn(
        'bg-primary-100 flex h-11.25 w-full items-center gap-2 rounded-[10px] px-3',
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
        ref={setInputRef}
        form={form}
        value={value}
        defaultValue={defaultValue}
        onChange={(event) => {
          if (!isControlled) {
            setUncontrolledValue(event.target.value)
          }
          onChange?.(event)
        }}
        className={cn(
          'typo-body-4 placeholder:text-warm-gray-300 min-w-0 flex-1 appearance-none border-0 bg-transparent p-0 text-black outline-none disabled:cursor-not-allowed',
          '[&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none',
          inputClassName,
        )}
        disabled={disabled}
        readOnly={readOnly}
        type="search"
      />
      {canClear ? (
        <IconButton
          aria-label="검색어 지우기"
          className="text-cool-gray-900"
          size="xs"
          onClick={handleClear}
        >
          <CancelIcon className="size-6" />
        </IconButton>
      ) : null}
    </div>
  )
}

SearchBar.displayName = 'SearchBar'

export const SearchField = SearchBar
