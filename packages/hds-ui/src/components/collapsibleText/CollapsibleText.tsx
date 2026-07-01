import {
  type ComponentPropsWithoutRef,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { TapDownIcon, TapUpIcon } from '@hashi/hds-icons'
import { cn } from '../../utils'

const COLLAPSED_LINE_COUNT = 3
const DEFAULT_LINE_HEIGHT = 24

type CollapsibleTextProps = Omit<
  ComponentPropsWithoutRef<'div'>,
  'children'
> & {
  text: string
  defaultExpanded?: boolean
}

const getCollapsedHeight = (element: HTMLElement) => {
  const { fontSize, lineHeight } = window.getComputedStyle(element)
  const parsedFontSize = Number.parseFloat(fontSize)
  const parsedLineHeight = Number.parseFloat(lineHeight)

  if (!Number.isNaN(parsedLineHeight) && lineHeight.endsWith('px')) {
    return Math.ceil(parsedLineHeight * COLLAPSED_LINE_COUNT)
  }

  if (!Number.isNaN(parsedLineHeight) && !Number.isNaN(parsedFontSize)) {
    return Math.ceil(parsedFontSize * parsedLineHeight * COLLAPSED_LINE_COUNT)
  }

  const fallbackLineHeight = Number.isNaN(parsedFontSize)
    ? DEFAULT_LINE_HEIGHT
    : parsedFontSize * 1.5

  return Math.ceil(fallbackLineHeight * COLLAPSED_LINE_COUNT)
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

  useLayoutEffect(() => {
    const textElement = textRef.current
    if (!textElement) return

    const updateOverflow = () => {
      const nextIsOverflowing =
        textElement.scrollHeight > getCollapsedHeight(textElement)

      setIsOverflowing(nextIsOverflowing)
      setIsExpanded((current) => (nextIsOverflowing ? current : false))
    }

    updateOverflow()

    if (typeof ResizeObserver === 'undefined') {
      return
    }

    const resizeObserver = new ResizeObserver(updateOverflow)
    resizeObserver.observe(textElement)

    return () => {
      resizeObserver.disconnect()
    }
  }, [text])

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
