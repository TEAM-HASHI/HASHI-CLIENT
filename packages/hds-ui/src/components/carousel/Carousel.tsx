import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  type ComponentPropsWithoutRef,
  type ReactElement,
  type ReactNode,
  type RefObject,
  type UIEvent,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { cn } from '../../utils'

export type CarouselIndicatorAlign = 'center' | 'end'

type CarouselRootAccessibilityProps =
  | {
      'aria-label': string
      'aria-labelledby'?: string
    }
  | {
      'aria-label'?: string
      'aria-labelledby': string
    }

export type CarouselRootProps = Omit<
  ComponentPropsWithoutRef<'section'>,
  'children' | 'role'
> &
  CarouselRootAccessibilityProps & {
    index?: number
    defaultIndex?: number
    onIndexChange?: (index: number) => void
    children: ReactNode
  }

export type CarouselViewportProps = ComponentPropsWithoutRef<'div'>
export type CarouselTrackProps = ComponentPropsWithoutRef<'div'>
export type CarouselItemProps = ComponentPropsWithoutRef<'div'>
export type CarouselIndicatorProps = ComponentPropsWithoutRef<'div'> & {
  align?: CarouselIndicatorAlign
  dotClassName?: string
  activeDotClassName?: string
}

type CarouselContextValue = {
  currentIndex: number
  itemCount: number
  setCurrentIndex: (index: number) => void
  setItemCount: (itemCount: number) => void
  viewportRef: RefObject<HTMLDivElement | null>
}

type CarouselItemInternalProps = CarouselItemProps & {
  __index?: number
  __count?: number
}

type CarouselComponent = {
  Root: (props: CarouselRootProps) => ReactElement
  Viewport: (props: CarouselViewportProps) => ReactElement
  Track: (props: CarouselTrackProps) => ReactElement
  Item: (props: CarouselItemProps) => ReactElement
  Indicator: (props: CarouselIndicatorProps) => ReactElement | null
}

const SCROLL_SETTLE_DELAY_MS = 40

const CarouselContext = createContext<CarouselContextValue | null>(null)

const indicatorAlignClassNames: Record<CarouselIndicatorAlign, string> = {
  center: 'left-1/2 -translate-x-1/2',
  end: 'right-6',
}

const viewportBaseClassName =
  'w-full [scrollbar-width:none] overscroll-x-contain [-ms-overflow-style:none] motion-safe:scroll-smooth motion-reduce:scroll-auto [&::-webkit-scrollbar]:hidden'

const viewportBehaviorClassName = 'snap-x snap-mandatory overflow-x-auto'

const clampIndex = (index: number, itemCount: number) => {
  const maxIndex = Math.max(itemCount - 1, 0)

  return Math.min(Math.max(index, 0), maxIndex)
}

const getNearestIndex = (viewport: HTMLDivElement, itemCount: number) => {
  if (itemCount <= 0 || viewport.clientWidth <= 0) {
    return 0
  }

  return clampIndex(
    Math.round(viewport.scrollLeft / viewport.clientWidth),
    itemCount,
  )
}

const prefersReducedMotion = () => {
  if (
    typeof window === 'undefined' ||
    typeof window.matchMedia !== 'function'
  ) {
    return false
  }

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

const scrollViewportToIndex = (
  viewport: HTMLDivElement,
  index: number,
  itemCount: number,
  behavior: ScrollBehavior = prefersReducedMotion() ? 'auto' : 'smooth',
) => {
  if (itemCount <= 0 || viewport.clientWidth <= 0) {
    return
  }

  const nextLeft = clampIndex(index, itemCount) * viewport.clientWidth

  if (Math.abs(viewport.scrollLeft - nextLeft) < 1) {
    return
  }

  if (typeof viewport.scrollTo === 'function') {
    viewport.scrollTo({
      behavior,
      left: nextLeft,
    })
    return
  }

  viewport.scrollLeft = nextLeft
}

const useCarouselContext = (componentName: string) => {
  const context = useContext(CarouselContext)

  if (!context) {
    throw new Error(`${componentName} must be used within Carousel.Root`)
  }

  return context
}

const useControllableIndex = ({
  index,
  defaultIndex = 0,
  itemCount,
  onIndexChange,
}: Pick<CarouselRootProps, 'index' | 'defaultIndex' | 'onIndexChange'> & {
  itemCount: number
}) => {
  const [uncontrolledIndex, setUncontrolledIndex] = useState(defaultIndex)
  const isControlled = index !== undefined
  const rawCurrentIndex = isControlled ? index : uncontrolledIndex
  const currentIndex = clampIndex(rawCurrentIndex, itemCount)

  const setCurrentIndex = useCallback(
    (nextIndex: number) => {
      const clampedIndex = clampIndex(nextIndex, itemCount)

      if (clampedIndex === currentIndex) {
        return
      }

      if (!isControlled) {
        setUncontrolledIndex(clampedIndex)
      }

      onIndexChange?.(clampedIndex)
    },
    [currentIndex, isControlled, itemCount, onIndexChange],
  )

  return [currentIndex, setCurrentIndex] as const
}

const Root = ({
  index,
  defaultIndex,
  onIndexChange,
  className,
  children,
  ...props
}: CarouselRootProps) => {
  const [itemCount, setItemCount] = useState(0)
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const [currentIndex, setCurrentIndex] = useControllableIndex({
    defaultIndex,
    index,
    itemCount,
    onIndexChange,
  })

  const value = useMemo<CarouselContextValue>(
    () => ({
      currentIndex,
      itemCount,
      setCurrentIndex,
      setItemCount,
      viewportRef,
    }),
    [currentIndex, itemCount, setCurrentIndex],
  )

  return (
    <CarouselContext.Provider value={value}>
      <section
        {...props}
        aria-roledescription="carousel"
        className={cn('relative w-full', className)}
        data-hds-carousel-root=""
        role="region"
      >
        {children}
      </section>
    </CarouselContext.Provider>
  )
}

const Viewport = ({
  className,
  onScroll,
  children,
  ...props
}: CarouselViewportProps) => {
  const { currentIndex, itemCount, setCurrentIndex, viewportRef } =
    useCarouselContext('Carousel.Viewport')
  const scrollSettleTimerRef = useRef<number | null>(null)

  const updateIndexFromScroll = useCallback(() => {
    const viewport = viewportRef.current

    if (!viewport) {
      return
    }

    setCurrentIndex(getNearestIndex(viewport, itemCount))
  }, [itemCount, setCurrentIndex, viewportRef])

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    onScroll?.(event)

    if (scrollSettleTimerRef.current !== null) {
      window.clearTimeout(scrollSettleTimerRef.current)
    }

    scrollSettleTimerRef.current = window.setTimeout(
      updateIndexFromScroll,
      SCROLL_SETTLE_DELAY_MS,
    )
  }

  useEffect(() => {
    const viewport = viewportRef.current

    if (!viewport) {
      return
    }

    scrollViewportToIndex(viewport, currentIndex, itemCount)
  }, [currentIndex, itemCount, viewportRef])

  useEffect(() => {
    const viewport = viewportRef.current

    if (!viewport || itemCount <= 0 || typeof ResizeObserver === 'undefined') {
      return
    }

    let previousWidth = viewport.clientWidth
    let animationFrameId: number | null = null

    const observer = new ResizeObserver(() => {
      const nextWidth = viewport.clientWidth

      if (nextWidth === previousWidth) {
        return
      }

      previousWidth = nextWidth

      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId)
      }

      animationFrameId = window.requestAnimationFrame(() => {
        animationFrameId = null
        scrollViewportToIndex(viewport, currentIndex, itemCount, 'auto')
      })
    })

    observer.observe(viewport)

    return () => {
      observer.disconnect()

      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId)
      }
    }
  }, [currentIndex, itemCount, viewportRef])

  useEffect(() => {
    return () => {
      if (scrollSettleTimerRef.current !== null) {
        window.clearTimeout(scrollSettleTimerRef.current)
      }
    }
  }, [])

  return (
    <div
      {...props}
      className={cn(
        viewportBaseClassName,
        className,
        viewportBehaviorClassName,
      )}
      data-hds-carousel-viewport=""
      onScroll={handleScroll}
      ref={viewportRef}
    >
      {children}
    </div>
  )
}

const Track = ({ className, children, ...props }: CarouselTrackProps) => {
  const { setItemCount } = useCarouselContext('Carousel.Track')
  const childArray = Children.toArray(children)
  const itemCount = childArray.filter(isValidElement).length

  useLayoutEffect(() => {
    setItemCount(itemCount)
  }, [itemCount, setItemCount])

  let itemIndex = -1

  return (
    <div
      {...props}
      className={cn('flex h-full w-full', className)}
      data-hds-carousel-track=""
    >
      {childArray.map((child) => {
        if (!isValidElement(child)) {
          return child
        }

        itemIndex += 1

        return cloneElement(child as ReactElement<CarouselItemInternalProps>, {
          __count: itemCount,
          __index: itemIndex,
        })
      })}
    </div>
  )
}

const Item = ({
  __count = 0,
  __index = 0,
  className,
  children,
  'aria-label': ariaLabel,
  ...props
}: CarouselItemInternalProps) => {
  const { currentIndex } = useCarouselContext('Carousel.Item')
  const isCurrent = currentIndex === __index
  const slideLabel = ariaLabel ?? `${__index + 1} / ${__count}`

  return (
    <div
      {...props}
      aria-label={slideLabel}
      aria-roledescription="slide"
      className={cn('h-full min-w-0 flex-[0_0_100%] snap-start', className)}
      data-current={isCurrent || undefined}
      data-hds-carousel-item=""
      role="group"
    >
      {children}
    </div>
  )
}

const Indicator = ({
  align = 'center',
  className,
  dotClassName,
  activeDotClassName,
  ...props
}: CarouselIndicatorProps) => {
  const { currentIndex, itemCount } = useCarouselContext('Carousel.Indicator')

  if (itemCount <= 1) {
    return null
  }

  return (
    <div
      {...props}
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute bottom-5 z-10 flex items-center gap-[7px]',
        indicatorAlignClassNames[align],
        className,
      )}
      data-align={align}
      data-hds-carousel-indicator=""
    >
      {Array.from({ length: itemCount }, (_, itemIndex) => {
        const isActive = itemIndex === currentIndex

        return (
          <span
            className={cn(
              'block rounded-full transition-[width,background-color] duration-150',
              isActive
                ? 'bg-warm-gray-300 h-1 w-[22px]'
                : 'bg-warm-gray-100 size-1.5',
              dotClassName,
              isActive && activeDotClassName,
            )}
            data-current={isActive || undefined}
            key={itemIndex}
          />
        )
      })}
    </div>
  )
}

export const Carousel: CarouselComponent = {
  Root,
  Viewport,
  Track,
  Item: Item as (props: CarouselItemProps) => ReactElement,
  Indicator,
}
