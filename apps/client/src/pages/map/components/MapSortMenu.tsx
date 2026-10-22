import { TapDownIcon } from '@hashi/hds-icons'
import { type RefObject, useEffect, useRef, useState } from 'react'

import type { MapSort } from '@/pages/map/types'

const OPTIONS = [
  { value: 'recommended', label: '추천순' },
  { value: 'rating', label: '별점순' },
  { value: 'reviews', label: '리뷰순' },
] as const

export const MapSortMenu = ({
  value,
  onChange,
  triggerRef,
}: {
  value: MapSort
  onChange: (value: MapSort) => void
  triggerRef: RefObject<HTMLButtonElement | null>
}) => {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([])
  const selectedIndex = OPTIONS.findIndex((option) => option.value === value)
  useEffect(() => {
    if (!open) return
    optionRefs.current[selectedIndex]?.focus()
    const handleOutside = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !rootRef.current?.contains(event.target)
      )
        setOpen(false)
    }
    document.addEventListener('pointerdown', handleOutside)
    return () => document.removeEventListener('pointerdown', handleOutside)
  }, [open, selectedIndex])

  return (
    <div
      ref={rootRef}
      className="relative shrink-0"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false)
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-label={`정렬: ${OPTIONS[selectedIndex].label}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="typo-body-6 text-cool-gray-600 flex min-h-9 items-center"
      >
        {OPTIONS[selectedIndex].label}
        <TapDownIcon className="size-5" />
      </button>
      {open && (
        <div
          role="menu"
          aria-label="식당 정렬"
          className="border-warm-gray-100 absolute top-full right-0 z-20 w-30 rounded-[5px] border bg-white py-1 shadow-sm"
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.preventDefault()
              setOpen(false)
              triggerRef.current?.focus()
            }
            const index = optionRefs.current.indexOf(
              document.activeElement as HTMLButtonElement,
            )
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
              event.preventDefault()
              optionRefs.current[
                (index + (event.key === 'ArrowDown' ? 1 : 2)) % 3
              ]?.focus()
            }
          }}
        >
          {OPTIONS.map((option, index) => (
            <button
              key={option.value}
              ref={(element) => {
                optionRefs.current[index] = element
              }}
              type="button"
              role="menuitemradio"
              aria-checked={value === option.value}
              tabIndex={-1}
              className="typo-body-7 hover:bg-primary-100 focus:bg-primary-100 block min-h-9 w-full px-3"
              onClick={() => {
                onChange(option.value)
                setOpen(false)
                triggerRef.current?.focus()
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
