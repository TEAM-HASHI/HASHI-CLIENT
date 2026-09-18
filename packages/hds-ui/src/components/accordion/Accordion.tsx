import type { ComponentPropsWithRef, ReactNode } from 'react'
import { useId, useState } from 'react'
import { TapDownIcon as ToggleIcon } from '@hashi/hds-icons'
import { cn } from '../../utils'

export type AccordionProps = Omit<
  ComponentPropsWithRef<'div'>,
  'children' | 'title'
> & {
  title: string
  children: ReactNode
  headingLevel?: 2 | 3 | 4 | 5 | 6
  defaultExpanded?: boolean
  expanded?: boolean
  onExpandedChange?: (expanded: boolean) => void
  contentClassName?: string
}

export const Accordion = ({
  title,
  children,
  headingLevel = 3,
  defaultExpanded = false,
  expanded,
  onExpandedChange,
  className,
  contentClassName,
  ref,
  ...props
}: AccordionProps) => {
  const contentId = useId()
  const [uncontrolledExpanded, setUncontrolledExpanded] =
    useState(defaultExpanded)
  const isControlled = expanded !== undefined
  const isExpanded = isControlled ? expanded : uncontrolledExpanded

  const handleToggle = () => {
    const nextExpanded = !isExpanded

    if (!isControlled) {
      setUncontrolledExpanded(nextExpanded)
    }

    onExpandedChange?.(nextExpanded)
  }

  return (
    <div
      ref={ref}
      className={cn(
        'border-secondary-200 flex w-full flex-col items-center border-b px-5 py-2',
        isExpanded && 'gap-1',
        className,
      )}
      {...props}
    >
      <div role="heading" aria-level={headingLevel} className="w-full">
        <button
          type="button"
          aria-controls={contentId}
          aria-expanded={isExpanded}
          className="focus-visible:outline-cool-gray-900 flex min-h-8 w-full appearance-none items-center justify-between gap-3 border-0 bg-transparent p-0 text-left font-sans focus-visible:outline-2 focus-visible:outline-offset-2"
          onClick={handleToggle}
        >
          <span
            className={cn(
              'min-w-0 flex-1 break-words text-black',
              isExpanded ? 'typo-sub-header-3' : 'typo-body-5',
            )}
          >
            {title}
          </span>
          <ToggleIcon
            aria-hidden="true"
            className={cn(
              'text-cool-gray-900 size-5 shrink-0 transition-transform duration-200 ease-out motion-reduce:transition-none',
              isExpanded && 'rotate-180',
            )}
            focusable="false"
          />
        </button>
      </div>

      <div
        id={contentId}
        hidden={!isExpanded}
        className={cn(
          'typo-caption-2 text-warm-gray-300 w-full leading-[1.5]',
          contentClassName,
        )}
      >
        {children}
      </div>
    </div>
  )
}
