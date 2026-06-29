import {
  type ComponentPropsWithoutRef,
  useEffect,
  useRef,
  useState,
} from 'react'
import { TapDownIcon, TapUpIcon } from '@hashi/hds-icons'
import { cn } from '../../utils'

export type CollapsibleTextProps = Omit<
  ComponentPropsWithoutRef<'div'>,
  'children'
> & {
  text: string
  defaultExpanded?: boolean
}

export const CollapsibleText = ({
  text,
  defaultExpanded = false,
  className,
  ...props
}: CollapsibleTextProps) => {
  const textRef = useRef<HTMLParagraphElement>(null)
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const [isOverflowing, setIsOverflowing] = useState(false)

  useEffect(() => {
    const textElement = textRef.current
    if (!textElement) return

    setIsOverflowing(textElement.scrollHeight > textElement.clientHeight)
  }, [text, isExpanded])

  const canToggle = isOverflowing || isExpanded
  const toggleLabel = isExpanded ? '접기' : '더보기'
  const ToggleIcon = isExpanded ? TapUpIcon : TapDownIcon

  return (
    <div className={cn('w-full', className)} {...props}>
      <p
        ref={textRef}
        className={cn(
          'typo-long-body-1 text-primary-200 whitespace-pre-wrap',
          !isExpanded && 'line-clamp-3',
        )}
      >
        {text}
      </p>

      {canToggle ? (
        <button
          type="button"
          aria-expanded={isExpanded}
          className="typo-body-6 text-cool-gray-600 mt-1 ml-auto flex items-center"
          onClick={() => setIsExpanded((current) => !current)}
        >
          {toggleLabel}
          <ToggleIcon aria-hidden="true" className="size-5" />
        </button>
      ) : null}
    </div>
  )
}
