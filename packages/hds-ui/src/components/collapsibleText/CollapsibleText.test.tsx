import '@testing-library/jest-dom/vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CollapsibleText } from './CollapsibleText'

const longText =
  '정말 맛있습니다 와우!!! 정말 맛있습니다 와우!!!정말 맛있습니다 와우!!!정말 맛있습니다 와우!!!정말 맛있습니다 와우!!!'

const mockTextStyle = ({
  fontSize = '16px',
  lineHeight = '24px',
}: {
  fontSize?: string
  lineHeight?: string
} = {}) => {
  const getComputedStyle = window.getComputedStyle.bind(window)

  vi.spyOn(window, 'getComputedStyle').mockImplementation((element) => {
    const style = getComputedStyle(element)

    Object.defineProperty(style, 'fontSize', {
      configurable: true,
      value: fontSize,
    })
    Object.defineProperty(style, 'lineHeight', {
      configurable: true,
      value: lineHeight,
    })

    return style
  })
}

const mockTextHeight = (scrollHeight: number) => {
  mockTextStyle()
  vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockReturnValue(
    scrollHeight,
  )
}

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('CollapsibleText', () => {
  it('renders the provided text', () => {
    render(<CollapsibleText text={longText} />)

    expect(screen.getByText(longText)).toBeInTheDocument()
  })

  it('renders collapsed by default', () => {
    render(<CollapsibleText text={longText} />)

    expect(screen.getByText(longText)).toHaveClass('line-clamp-3')
  })

  it('renders expanded when defaultExpanded is true', () => {
    mockTextHeight(120)

    render(<CollapsibleText text={longText} defaultExpanded />)

    expect(screen.getByText(longText)).not.toHaveClass('line-clamp-3')
  })

  it('toggles expanded state when the button is clicked', () => {
    mockTextHeight(120)

    render(<CollapsibleText text={longText} defaultExpanded />)

    fireEvent.click(screen.getByRole('button', { name: '접기' }))

    expect(screen.getByText(longText)).toHaveClass('line-clamp-3')
  })

  it('observes text size changes while collapsed', () => {
    const observe = vi.fn()
    const disconnect = vi.fn()
    const ResizeObserverMock = vi.fn(() => ({
      observe,
      disconnect,
    }))

    vi.stubGlobal('ResizeObserver', ResizeObserverMock)

    render(<CollapsibleText text={longText} />)

    expect(ResizeObserverMock).toHaveBeenCalled()
    expect(observe).toHaveBeenCalledWith(screen.getByText(longText))
  })

  it('does not show the toggle when unitless line-height text fits within three lines', () => {
    mockTextStyle({ fontSize: '15px', lineHeight: '1.5' })
    vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockReturnValue(68)

    render(<CollapsibleText text={longText} />)

    expect(
      screen.queryByRole('button', { name: '더보기' }),
    ).not.toBeInTheDocument()
  })

  it('hides the toggle when expanded text no longer overflows after resizing', () => {
    let resizeCallback: ResizeObserverCallback = () => {}
    let scrollHeight = 120

    vi.stubGlobal(
      'ResizeObserver',
      vi.fn((callback: ResizeObserverCallback) => {
        resizeCallback = callback

        return {
          observe: vi.fn(),
          disconnect: vi.fn(),
        }
      }),
    )
    mockTextStyle()
    vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockImplementation(
      () => scrollHeight,
    )

    render(<CollapsibleText text={longText} defaultExpanded />)

    expect(screen.getByRole('button', { name: '접기' })).toBeInTheDocument()

    scrollHeight = 60

    act(() => {
      resizeCallback([], {} as ResizeObserver)
    })

    expect(
      screen.queryByRole('button', { name: '접기' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: '더보기' }),
    ).not.toBeInTheDocument()
  })
})
