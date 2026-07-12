import { CheckIcon, TapDownIcon, TapUpIcon } from '@hashi/hds-icons'
import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/shared/utils/cn'

export interface SelectOption<TValue extends string> {
  value: TValue
  label: string
}

interface AdminSelectProps<TValue extends string> {
  label: string
  value: TValue
  options: SelectOption<TValue>[]
  onChange: (value: TValue) => void
  className?: string
}

interface DropdownLayout {
  top: number
  left: number
  width: number
  maxHeight: number
}

const DROPDOWN_GAP = 4
const DROPDOWN_MIN_WIDTH = 190
const DROPDOWN_MAX_HEIGHT = 320
const DROPDOWN_MIN_HEIGHT = 72
const DROPDOWN_VIEWPORT_MARGIN = 12
const DROPDOWN_OPTION_HEIGHT = 32

export const AdminSelect = <TValue extends string>({
  label,
  value,
  options,
  onChange,
  className,
}: AdminSelectProps<TValue>) => {
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownLayout, setDropdownLayout] = useState<DropdownLayout | null>(
    null,
  )
  const selectId = useId()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const dropdownRef = useRef<HTMLDivElement | null>(null)
  const selectedOption = useMemo(
    () => options.find((option) => option.value === value) ?? options[0],
    [options, value],
  )

  const updateDropdownLayout = useCallback(() => {
    const buttonElement = buttonRef.current

    if (!buttonElement) {
      return
    }

    const buttonRect = buttonElement.getBoundingClientRect()
    const dropdownWidth = Math.max(buttonRect.width, DROPDOWN_MIN_WIDTH)
    const dropdownLeft = Math.min(
      Math.max(DROPDOWN_VIEWPORT_MARGIN, buttonRect.left),
      window.innerWidth - dropdownWidth - DROPDOWN_VIEWPORT_MARGIN,
    )
    const preferredHeight = Math.min(
      DROPDOWN_MAX_HEIGHT,
      options.length * DROPDOWN_OPTION_HEIGHT + 8,
    )
    const availableBelow =
      window.innerHeight - buttonRect.bottom - DROPDOWN_VIEWPORT_MARGIN
    const availableAbove = buttonRect.top - DROPDOWN_VIEWPORT_MARGIN
    const shouldOpenAbove =
      availableBelow < Math.min(preferredHeight, 180) &&
      availableAbove > availableBelow
    const availableHeight = Math.max(
      shouldOpenAbove ? availableAbove : availableBelow,
      DROPDOWN_MIN_HEIGHT,
    )
    const dropdownMaxHeight = Math.min(preferredHeight, availableHeight)
    const dropdownTop = shouldOpenAbove
      ? Math.max(
          DROPDOWN_VIEWPORT_MARGIN,
          buttonRect.top - dropdownMaxHeight - DROPDOWN_GAP,
        )
      : Math.min(
          buttonRect.bottom + DROPDOWN_GAP,
          window.innerHeight - dropdownMaxHeight - DROPDOWN_VIEWPORT_MARGIN,
        )

    setDropdownLayout({
      top: dropdownTop,
      left: dropdownLeft,
      width: dropdownWidth,
      maxHeight: dropdownMaxHeight,
    })
  }, [options.length])

  useLayoutEffect(() => {
    if (!isOpen) {
      return
    }

    updateDropdownLayout()
  }, [isOpen, updateDropdownLayout])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const handlePointerDown = (event: PointerEvent) => {
      const targetNode = event.target as Node
      const isInsideSelect =
        containerRef.current?.contains(targetNode) ||
        dropdownRef.current?.contains(targetNode)

      if (!isInsideSelect) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    window.addEventListener('resize', updateDropdownLayout)
    window.addEventListener('scroll', updateDropdownLayout, true)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('resize', updateDropdownLayout)
      window.removeEventListener('scroll', updateDropdownLayout, true)
    }
  }, [isOpen, updateDropdownLayout])

  const handleOptionClick = (nextValue: TValue) => {
    onChange(nextValue)
    setIsOpen(false)
  }

  const handleButtonKeyDown = (
    event: ReactKeyboardEvent<HTMLButtonElement>,
  ) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') {
      return
    }

    event.preventDefault()
    setIsOpen(true)
  }

  return (
    <div
      ref={containerRef}
      className={cn('relative flex min-w-40 flex-col gap-1', className)}
    >
      <span
        id={`${selectId}-label`}
        className="text-cool-gray-500 text-xs font-semibold"
      >
        {label}
      </span>
      <div
        className={cn(
          'relative rounded-[4px] transition-shadow',
          isOpen && 'ring-[3px] ring-[#e7effc]',
        )}
      >
        <button
          ref={buttonRef}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-labelledby={`${selectId}-label ${selectId}-value`}
          onClick={() => setIsOpen((current) => !current)}
          onKeyDown={handleButtonKeyDown}
          className={cn(
            'flex h-8 w-full items-center gap-2 overflow-hidden rounded-[4px] border bg-white px-2 py-1.5 text-left transition outline-none',
            isOpen ? 'border-[#cedff8]' : 'border-[#f1f2f6]',
          )}
        >
          <span
            id={`${selectId}-value`}
            className="min-w-0 flex-1 truncate text-xs leading-[17px] font-medium text-[#2f2f36]"
          >
            {selectedOption?.label ?? '선택 항목'}
          </span>
          {isOpen ? (
            <TapUpIcon
              aria-hidden="true"
              className="size-4 shrink-0 text-[#6e7078]"
            />
          ) : (
            <TapDownIcon
              aria-hidden="true"
              className="size-4 shrink-0 text-[#6e7078]"
            />
          )}
        </button>
      </div>

      {isOpen && dropdownLayout
        ? createPortal(
            <div
              ref={dropdownRef}
              role="listbox"
              aria-labelledby={`${selectId}-label`}
              style={{
                top: dropdownLayout.top,
                left: dropdownLayout.left,
                width: dropdownLayout.width,
                maxHeight: dropdownLayout.maxHeight,
              }}
              className="fixed z-[70] flex min-w-[190px] flex-col gap-1 overflow-y-auto overscroll-contain rounded-[6px] bg-white p-1 shadow-[0_16px_28px_rgba(32,34,50,0.09)]"
            >
              {options.map((option) => {
                const isSelected = option.value === value

                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleOptionClick(option.value)}
                    className={cn(
                      'flex h-7 w-full items-center gap-2 rounded-[4px] px-2 py-1.5 text-left transition outline-none',
                      'hover:bg-[#f7f7fa] focus-visible:bg-[#f7f7fa]',
                      isSelected && 'bg-[#f3f7fd] text-[#0c5dde]',
                    )}
                  >
                    <span
                      className={cn(
                        'min-w-0 flex-1 truncate text-xs leading-[17px] font-medium',
                        isSelected ? 'text-[#0c5dde]' : 'text-[#2f2f36]',
                      )}
                    >
                      {option.label}
                    </span>
                    {isSelected ? (
                      <CheckIcon
                        aria-hidden="true"
                        className="size-3 shrink-0 text-[#85aeef]"
                      />
                    ) : null}
                  </button>
                )
              })}
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}
