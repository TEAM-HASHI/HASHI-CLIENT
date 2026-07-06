import '@testing-library/jest-dom/vitest'

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Carousel } from './Carousel'

const renderCarousel = ({
  count = 3,
  index,
  defaultIndex,
  onIndexChange,
}: {
  count?: number
  index?: number
  defaultIndex?: number
  onIndexChange?: (index: number) => void
} = {}) => {
  return render(
    <Carousel.Root
      aria-label="콘텐츠 배너"
      defaultIndex={defaultIndex}
      index={index}
      onIndexChange={onIndexChange}
    >
      <Carousel.Viewport>
        <Carousel.Track>
          {Array.from({ length: count }, (_, itemIndex) => (
            <Carousel.Item key={itemIndex}>
              <span>Slide {itemIndex + 1}</span>
            </Carousel.Item>
          ))}
        </Carousel.Track>
      </Carousel.Viewport>
      <Carousel.Indicator />
    </Carousel.Root>,
  )
}

const getViewport = () => {
  const viewport = document.querySelector<HTMLDivElement>(
    '[data-hds-carousel-viewport]',
  )

  if (!viewport) {
    throw new Error('Carousel viewport not found')
  }

  return viewport
}

const getIndicator = () => {
  const indicator = document.querySelector<HTMLDivElement>(
    '[data-hds-carousel-indicator]',
  )

  if (!indicator) {
    throw new Error('Carousel indicator not found')
  }

  return indicator
}

const setViewportMetrics = ({
  scrollLeft,
  width,
}: {
  scrollLeft: number
  width: number
}) => {
  const viewport = getViewport()

  Object.defineProperty(viewport, 'clientWidth', {
    configurable: true,
    value: width,
  })
  Object.defineProperty(viewport, 'scrollLeft', {
    configurable: true,
    value: scrollLeft,
    writable: true,
  })

  return viewport
}

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  vi.useRealTimers()
})

describe('Carousel', () => {
  it('renders a labeled carousel region and slide positions', () => {
    renderCarousel()

    const region = screen.getByRole('region', { name: '콘텐츠 배너' })

    expect(region).toHaveAttribute('aria-roledescription', 'carousel')
    expect(screen.getByRole('group', { name: '1 / 3' })).toHaveAttribute(
      'aria-roledescription',
      'slide',
    )
    expect(screen.getByRole('group', { name: '2 / 3' })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: '3 / 3' })).toBeInTheDocument()
  })

  it('hides indicator when there is only one item', () => {
    renderCarousel({ count: 1 })

    expect(
      document.querySelector('[data-hds-carousel-indicator]'),
    ).not.toBeInTheDocument()
  })

  it('renders non-focusable indicator dots for multiple items', () => {
    renderCarousel()

    const indicator = getIndicator()

    expect(indicator).toHaveAttribute('aria-hidden', 'true')
    expect(within(indicator).queryAllByRole('button')).toHaveLength(0)
    expect(indicator.querySelectorAll('span')).toHaveLength(3)
  })

  it('supports an end-aligned indicator', () => {
    render(
      <Carousel.Root aria-label="콘텐츠 배너">
        <Carousel.Viewport>
          <Carousel.Track>
            <Carousel.Item>첫 번째</Carousel.Item>
            <Carousel.Item>두 번째</Carousel.Item>
          </Carousel.Track>
        </Carousel.Viewport>
        <Carousel.Indicator align="end" />
      </Carousel.Root>,
    )

    expect(getIndicator()).toHaveAttribute('data-align', 'end')
  })

  it('uses defaultIndex for the active slide and indicator', () => {
    renderCarousel({ defaultIndex: 1 })

    expect(screen.getByRole('group', { name: '2 / 3' })).toHaveAttribute(
      'data-current',
      'true',
    )
    expect(
      getIndicator().querySelectorAll('[data-current="true"]'),
    ).toHaveLength(1)
  })

  it('updates uncontrolled index as soon as the nearest slide changes while scrolling', () => {
    const handleIndexChange = vi.fn()

    renderCarousel({ onIndexChange: handleIndexChange })
    const viewport = setViewportMetrics({ scrollLeft: 200, width: 100 })

    fireEvent.scroll(viewport)

    expect(handleIndexChange).toHaveBeenCalledWith(2)
    expect(screen.getByRole('group', { name: '3 / 3' })).toHaveAttribute(
      'data-current',
      'true',
    )
  })

  it('does not change DOM state directly when controlled', () => {
    const handleIndexChange = vi.fn()

    renderCarousel({ index: 0, onIndexChange: handleIndexChange })
    const viewport = setViewportMetrics({ scrollLeft: 200, width: 100 })

    fireEvent.scroll(viewport)

    expect(handleIndexChange).toHaveBeenCalledWith(2)
    expect(screen.getByRole('group', { name: '1 / 3' })).toHaveAttribute(
      'data-current',
      'true',
    )
  })

  it('scrolls to a controlled index when it changes', () => {
    const handleIndexChange = vi.fn()
    const { rerender } = renderCarousel({
      index: 0,
      onIndexChange: handleIndexChange,
    })
    const viewport = setViewportMetrics({ scrollLeft: 0, width: 100 })
    const scrollTo = vi.fn()

    Object.defineProperty(viewport, 'scrollTo', {
      configurable: true,
      value: scrollTo,
    })

    rerender(
      <Carousel.Root
        aria-label="콘텐츠 배너"
        index={2}
        onIndexChange={handleIndexChange}
      >
        <Carousel.Viewport>
          <Carousel.Track>
            <Carousel.Item>Slide 1</Carousel.Item>
            <Carousel.Item>Slide 2</Carousel.Item>
            <Carousel.Item>Slide 3</Carousel.Item>
          </Carousel.Track>
        </Carousel.Viewport>
        <Carousel.Indicator />
      </Carousel.Root>,
    )

    expect(scrollTo).toHaveBeenCalledWith({
      behavior: 'smooth',
      left: 200,
    })
  })

  it('merges className values for slots', () => {
    render(
      <Carousel.Root aria-label="콘텐츠 배너" className="custom-root">
        <Carousel.Viewport className="custom-viewport">
          <Carousel.Track className="custom-track">
            <Carousel.Item className="custom-item">첫 번째</Carousel.Item>
            <Carousel.Item>두 번째</Carousel.Item>
          </Carousel.Track>
        </Carousel.Viewport>
        <Carousel.Indicator className="custom-indicator" />
      </Carousel.Root>,
    )

    expect(screen.getByRole('region')).toHaveClass('custom-root')
    expect(getViewport()).toHaveClass('custom-viewport')
    expect(document.querySelector('[data-hds-carousel-track]')).toHaveClass(
      'custom-track',
    )
    expect(screen.getByRole('group', { name: '1 / 2' })).toHaveClass(
      'custom-item',
    )
    expect(getIndicator()).toHaveClass('custom-indicator')
  })

  it('keeps horizontal scroll behavior when viewport className includes overflow-hidden', () => {
    render(
      <Carousel.Root aria-label="콘텐츠 배너">
        <Carousel.Viewport className="overflow-hidden">
          <Carousel.Track>
            <Carousel.Item>첫 번째</Carousel.Item>
            <Carousel.Item>두 번째</Carousel.Item>
          </Carousel.Track>
        </Carousel.Viewport>
        <Carousel.Indicator />
      </Carousel.Root>,
    )

    expect(getViewport()).toHaveClass('overflow-x-auto')
  })

  it('realigns the current slide when the viewport width changes', () => {
    let resizeCallback: ResizeObserverCallback | undefined
    const observe = vi.fn()
    const disconnect = vi.fn()

    vi.stubGlobal(
      'ResizeObserver',
      vi.fn(function (callback: ResizeObserverCallback) {
        resizeCallback = callback

        return {
          disconnect,
          observe,
          unobserve: vi.fn(),
        }
      }),
    )
    vi.stubGlobal(
      'requestAnimationFrame',
      vi.fn((callback: FrameRequestCallback) => {
        callback(0)

        return 1
      }),
    )
    vi.stubGlobal('cancelAnimationFrame', vi.fn())

    renderCarousel({ defaultIndex: 1 })
    const viewport = setViewportMetrics({ scrollLeft: 393, width: 353 })
    const scrollTo = vi.fn()

    Object.defineProperty(viewport, 'scrollTo', {
      configurable: true,
      value: scrollTo,
    })

    act(() => {
      resizeCallback?.([], {} as ResizeObserver)
    })

    expect(observe).toHaveBeenCalledWith(viewport)
    expect(scrollTo).toHaveBeenCalledWith({
      behavior: 'auto',
      left: 353,
    })
  })
})
