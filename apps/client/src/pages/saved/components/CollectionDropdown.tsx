import { MenuIcon, TapDownIcon } from '@hashi/hds-icons'
import { IconButton, OptionItem } from '@hashi/hds-ui'
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'

type CollectionDropdownProps<T extends string> = {
  label: string
  options: readonly { value: T; label: string; destructive?: boolean }[]
  value: T
  open: boolean
  onOpenChange: (open: boolean) => void
  onChange: (value: T) => void
  action?: boolean
}

// Figma 8317:38586 / 8317:38697: 너비 140px, 항목 높이 40px.
const MENU_WIDTH = 140
const OPTION_HEIGHT = 40
const MENU_GAP = 1

export const CollectionDropdown = <T extends string>({
  label,
  options,
  value,
  open,
  onOpenChange,
  onChange,
  action = false,
}: CollectionDropdownProps<T>) => {
  const id = useId()
  const triggerRef = useRef<HTMLDivElement>(null)
  const [portalContainer, setPortalContainer] = useState<Element | null>(null)
  const setTriggerRef = useCallback((node: HTMLDivElement | null) => {
    triggerRef.current = node
    if (node)
      setPortalContainer(node.closest('[role="dialog"]') ?? document.body)
  }, [])
  const menuRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ top: 0, left: 0, maxHeight: 0 })

  useLayoutEffect(() => {
    if (!open) return
    const updatePosition = () => {
      const rect = triggerRef.current?.getBoundingClientRect()
      if (!rect) return
      const viewport = window.visualViewport
      const viewportTop = viewport?.offsetTop ?? 0
      const viewportLeft = viewport?.offsetLeft ?? 0
      const bottom = viewportTop + (viewport?.height ?? window.innerHeight)
      const right = viewportLeft + (viewport?.width ?? window.innerWidth)
      const menuHeight = options.length * OPTION_HEIGHT
      const below = Math.max(0, bottom - rect.bottom - MENU_GAP)
      const above = Math.max(0, rect.top - viewportTop - MENU_GAP)
      const placeBelow = below >= menuHeight || below >= above
      const maxHeight = placeBelow ? below : above
      setPosition({
        top: placeBelow
          ? rect.bottom + MENU_GAP
          : rect.top - Math.min(menuHeight, maxHeight) - MENU_GAP,
        left: Math.max(
          viewportLeft,
          Math.min(rect.right - MENU_WIDTH, right - MENU_WIDTH),
        ),
        maxHeight,
      })
    }
    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    window.visualViewport?.addEventListener('resize', updatePosition)
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
      window.visualViewport?.removeEventListener('resize', updatePosition)
    }
  }, [open, options.length])

  useEffect(() => {
    if (!open) return
    const selected = menuRef.current?.querySelector<HTMLButtonElement>(
      action ? '[role="menuitem"]' : '[aria-checked="true"]',
    )
    selected?.focus({ preventScroll: true })
    const dismiss = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !menuRef.current?.contains(event.target) &&
        !triggerRef.current?.contains(event.target)
      )
        onOpenChange(false)
    }
    document.addEventListener('pointerdown', dismiss)
    return () => document.removeEventListener('pointerdown', dismiss)
  }, [open, onOpenChange, action])

  const closeAndFocus = () => {
    onOpenChange(false)
    triggerRef.current?.querySelector('button')?.focus({ preventScroll: true })
  }

  return (
    <div
      ref={setTriggerRef}
      className="typo-body-6 text-cool-gray-600 flex shrink-0 items-center"
    >
      {!action && (
        <span>{options.find((option) => option.value === value)?.label}</span>
      )}
      <IconButton
        size="xs"
        aria-label={action ? label : `${label} 선택`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={() => onOpenChange(!open)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault()
            onOpenChange(true)
          }
        }}
      >
        {action ? (
          <MenuIcon className="text-warm-gray-300 size-4.5" />
        ) : (
          <TapDownIcon className="size-5" />
        )}
      </IconButton>
      {open &&
        createPortal(
          <div
            ref={menuRef}
            id={id}
            role="menu"
            aria-label={label}
            className="ring-warm-gray-100 z-50 overflow-y-auto rounded-[10px] bg-white px-2.5 ring-1 ring-inset"
            style={{
              position: 'fixed',
              width: MENU_WIDTH,
              height: Math.min(
                options.length * OPTION_HEIGHT,
                position.maxHeight,
              ),
              ...position,
            }}
            onBlur={(event) => {
              if (
                !event.currentTarget.contains(
                  event.relatedTarget as Node | null,
                )
              )
                onOpenChange(false)
            }}
            onKeyDown={(event) => {
              const items = [
                ...(menuRef.current?.querySelectorAll<HTMLButtonElement>(
                  '[role="menuitemradio"], [role="menuitem"]',
                ) ?? []),
              ]
              const index = items.indexOf(
                document.activeElement as HTMLButtonElement,
              )
              if (event.key === 'Escape') {
                event.preventDefault()
                event.stopPropagation()
                closeAndFocus()
              }
              if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
                event.preventDefault()
                const next =
                  event.key === 'Home'
                    ? 0
                    : event.key === 'End'
                      ? items.length - 1
                      : (index +
                          (event.key === 'ArrowDown' ? 1 : -1) +
                          items.length) %
                        items.length
                items[next]?.focus()
              }
            }}
          >
            {options.map((option) => (
              <OptionItem
                key={option.value}
                role={action ? 'menuitem' : 'menuitemradio'}
                aria-checked={action ? undefined : value === option.value}
                className={[
                  'border-primary-100 h-10 border-b text-center last:border-b-0 [&>span]:justify-center',
                  option.destructive
                    ? 'text-primary-400'
                    : action || value === option.value
                      ? 'text-primary-200'
                      : 'text-warm-gray-300',
                ].join(' ')}
                onClick={() => {
                  onChange(option.value)
                  closeAndFocus()
                }}
              >
                <span className="typo-sub-header-2">{option.label}</span>
              </OptionItem>
            ))}
          </div>,
          portalContainer ?? document.body,
        )}
    </div>
  )
}

const EDIT_OPTION = [{ value: 'edit', label: '수정하기' }] as const
export const CollectionEditMenu = ({
  name,
  onEdit,
  onShare,
  onDelete,
  context = 'page',
}: {
  name: string
  onEdit: () => void
  onShare?: () => void
  onDelete?: () => void
  context?: 'page' | 'panel'
}) => {
  const [open, setOpen] = useState(false)
  const shareOption = onShare
    ? [
        {
          value: 'share',
          label: context === 'panel' ? '링크 복사' : '공유하기',
        },
      ]
    : []
  const deleteOption = onDelete
    ? [{ value: 'delete', label: '삭제하기', destructive: true }]
    : []
  return (
    <CollectionDropdown
      action
      label={`${name} 더보기`}
      options={
        context === 'panel'
          ? [...shareOption, ...EDIT_OPTION, ...deleteOption]
          : [...EDIT_OPTION, ...shareOption, ...deleteOption]
      }
      value="edit"
      open={open}
      onOpenChange={setOpen}
      onChange={(value) => {
        if (value === 'share') onShare?.()
        else if (value === 'delete') onDelete?.()
        else onEdit()
      }}
    />
  )
}

export const CollectionActionMenu = ({
  label,
  onManage,
  onShare,
  onDelete,
  restaurant = false,
}: {
  label: string
  onManage: () => void
  onShare?: () => void
  onDelete: () => void
  restaurant?: boolean
}) => {
  const [open, setOpen] = useState(false)
  return (
    <CollectionDropdown
      action
      label={label}
      value="manage"
      open={open}
      onOpenChange={setOpen}
      options={[
        { value: 'manage', label: restaurant ? '이동하기' : '편집하기' },
        ...(onShare && !restaurant
          ? [{ value: 'share', label: '공유하기' }]
          : []),
        { value: 'delete', label: '삭제하기', destructive: true },
      ]}
      onChange={(value) => {
        if (value === 'manage') onManage()
        else if (value === 'share') onShare?.()
        else onDelete()
      }}
    />
  )
}
