import useEmblaCarousel, {
  type EmblaViewportRefType,
} from 'embla-carousel-react'
import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  type ComponentPropsWithoutRef,
  type ReactElement,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
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
  isDragging: boolean
  itemCount: number
  setCurrentIndex: (index: number) => void
  setItemCount: (itemCount: number) => void
  viewportRef: EmblaViewportRefType
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

const CarouselContext = createContext<CarouselContextValue | null>(null)

const indicatorAlignClassNames: Record<CarouselIndicatorAlign, string> = {
  center: 'left-1/2 -translate-x-1/2',
  end: 'right-6',
}

const viewportBaseClassName = 'w-full touch-pan-y overflow-hidden'

const clampIndex = (index: number, itemCount: number) => {
  const maxIndex = Math.max(itemCount - 1, 0)

  return Math.min(Math.max(index, 0), maxIndex)
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

const useCarouselContext = (componentName: string) => {
  const context = useContext(CarouselContext)

  if (!context) {
    throw new Error(`${componentName} must be used within Carousel.Root`)
  }

  return context
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
  const [isDragging, setIsDragging] = useState(false)
  const [viewportRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    loop: false,
  })
  const [currentIndex, setCurrentIndex] = useControllableIndex({
    defaultIndex,
    index,
    itemCount,
    onIndexChange,
  })

  useEffect(() => {
    if (!emblaApi) {
      return
    }

    const handleSelect = () => {
      setCurrentIndex(emblaApi.selectedScrollSnap())
    }

    emblaApi.on('select', handleSelect)

    return () => {
      emblaApi.off('select', handleSelect)
    }
  }, [emblaApi, setCurrentIndex])

  useEffect(() => {
    if (!emblaApi) {
      return
    }

    const handlePointerDown = () => setIsDragging(true)
    const handlePointerRelease = () => setIsDragging(false)

    emblaApi.on('pointerDown', handlePointerDown)
    emblaApi.on('pointerUp', handlePointerRelease)
    emblaApi.on('settle', handlePointerRelease)

    return () => {
      emblaApi.off('pointerDown', handlePointerDown)
      emblaApi.off('pointerUp', handlePointerRelease)
      emblaApi.off('settle', handlePointerRelease)
    }
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi || itemCount === 0) {
      return
    }

    if (emblaApi.selectedScrollSnap() === currentIndex) {
      return
    }

    emblaApi.scrollTo(currentIndex, prefersReducedMotion())
  }, [currentIndex, emblaApi, itemCount])

  const value = useMemo<CarouselContextValue>(
    () => ({
      currentIndex,
      isDragging,
      itemCount,
      setCurrentIndex,
      setItemCount,
      viewportRef,
    }),
    [currentIndex, isDragging, itemCount, setCurrentIndex, viewportRef],
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

const Viewport = ({ className, children, ...props }: CarouselViewportProps) => {
  const { isDragging, viewportRef } = useCarouselContext('Carousel.Viewport')

  return (
    <div
      {...props}
      className={cn(
        viewportBaseClassName,
        isDragging ? 'cursor-grabbing' : 'cursor-grab',
        className,
      )}
      data-dragging={isDragging || undefined}
      data-hds-carousel-viewport=""
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
  const { currentIndex, isDragging } = useCarouselContext('Carousel.Item')
  const isCurrent = currentIndex === __index
  const hasDragFeedback = isCurrent && isDragging
  const slideLabel = ariaLabel ?? `${__index + 1} / ${__count}`

  return (
    <div
      {...props}
      aria-label={slideLabel}
      aria-roledescription="slide"
      className={cn(
        'h-full min-w-0 flex-[0_0_100%] transform-gpu transition-[transform,opacity] duration-[220ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transform-none motion-reduce:opacity-100 motion-reduce:transition-none',
        hasDragFeedback && 'scale-[0.985] opacity-[0.98]',
        className,
      )}
      data-current={isCurrent || undefined}
      data-dragging={hasDragFeedback || undefined}
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
        'z-raised pointer-events-none absolute bottom-5 flex items-center gap-[7px]',
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
              'block rounded-full transition-[width,height,opacity,transform,background-color] duration-150 ease-out motion-reduce:transition-none',
              isActive
                ? 'bg-warm-gray-300 h-1 w-[22px] scale-100 opacity-100'
                : 'bg-warm-gray-100 size-1.5 scale-90 opacity-70',
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
