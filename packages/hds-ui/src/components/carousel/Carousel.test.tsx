import '@testing-library/jest-dom/vitest'

import {
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

const mockCarouselLayout = () => {
  const getPropertyValue = CSSStyleDeclaration.prototype.getPropertyValue

  vi.spyOn(
    CSSStyleDeclaration.prototype,
    'getPropertyValue',
  ).mockImplementation(function (this: CSSStyleDeclaration, property: string) {
    const value = getPropertyValue.call(this, property)

    return property === 'margin-right' && value === '' ? '0px' : value
  })
  vi.spyOn(HTMLElement.prototype, 'offsetParent', 'get').mockReturnValue(
    document.body,
  )
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(300)
  vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(200)
  vi.spyOn(HTMLElement.prototype, 'offsetLeft', 'get').mockImplementation(
    function (this: HTMLElement) {
      if (!this.hasAttribute('data-hds-carousel-item')) {
        return 0
      }

      return Array.from(this.parentElement?.children ?? []).indexOf(this) * 300
    },
  )
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

  it('renders the controlled active slide after index changes', () => {
    const { rerender } = renderCarousel({ index: 0 })

    rerender(
      <Carousel.Root aria-label="콘텐츠 배너" index={2}>
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

    expect(screen.getByRole('group', { name: '3 / 3' })).toHaveAttribute(
      'data-current',
      'true',
    )
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

  it('keeps the Embla overflow wrapper when caller className includes overflow-hidden', () => {
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

    expect(getViewport()).toHaveClass('overflow-hidden')
  })

  it('allows vertical page scrolling while handling horizontal swipes', () => {
    renderCarousel()

    expect(getViewport()).toHaveClass('touch-pan-y')
  })

  it('adds tactile feedback only to the current slide while dragging', () => {
    mockCarouselLayout()

    renderCarousel()

    const viewport = getViewport()
    const currentSlide = screen.getByRole('group', { name: '1 / 3' })
    const nextSlide = screen.getByRole('group', { name: '2 / 3' })

    expect(viewport).toHaveClass('cursor-grab')
    expect(viewport).not.toHaveAttribute('data-dragging')

    fireEvent.mouseDown(viewport, {
      button: 0,
      clientX: 200,
      clientY: 100,
    })

    expect(viewport).toHaveAttribute('data-dragging', 'true')
    expect(viewport).toHaveClass('cursor-grabbing')
    expect(currentSlide).toHaveAttribute('data-dragging', 'true')
    expect(currentSlide).toHaveClass('scale-[0.985]', 'opacity-[0.98]')
    expect(nextSlide).not.toHaveAttribute('data-dragging')

    fireEvent.mouseUp(document, {
      clientX: 200,
      clientY: 100,
    })

    expect(viewport).not.toHaveAttribute('data-dragging')
    expect(viewport).toHaveClass('cursor-grab')
    expect(currentSlide).not.toHaveAttribute('data-dragging')
  })

  it('animates active and inactive indicator states', () => {
    renderCarousel()

    const dots = getIndicator().querySelectorAll('span')

    expect(dots[0]).toHaveClass(
      'scale-100',
      'opacity-100',
      'transition-[width,height,opacity,transform,background-color]',
      'motion-reduce:transition-none',
    )
    expect(dots[1]).toHaveClass('scale-90', 'opacity-70')
  })
})
