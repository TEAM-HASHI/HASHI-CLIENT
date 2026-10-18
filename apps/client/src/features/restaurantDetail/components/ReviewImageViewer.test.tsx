import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ReviewImageViewer } from '@/features/restaurantDetail/components/ReviewImageViewer'

describe('ReviewImageViewer', () => {
  afterEach(() => {
    cleanup()
    document.body.style.overflow = ''
    document.body.style.position = ''
    document.body.style.top = ''
    document.body.style.width = ''
    document.documentElement.style.overflow = ''
    vi.unstubAllGlobals()
  })

  it('does not render when closed', () => {
    render(<ReviewImageViewer imageUrls={[]} onClose={vi.fn()} open={false} />)

    expect(
      screen.queryByRole('dialog', { name: '리뷰 이미지 상세보기' }),
    ).not.toBeInTheDocument()
  })

  it('opens the initially selected review image', () => {
    render(
      <ReviewImageViewer
        imageUrls={['/review-1.jpg', '/review-2.jpg']}
        initialIndex={1}
        onClose={vi.fn()}
        open
      />,
    )

    const currentImageFrame = screen
      .getAllByRole('group')
      .find((slide) => slide.getAttribute('data-current') === 'true')
      ?.querySelector('[data-testid="review-image-viewer-image"]')
    expect(currentImageFrame?.querySelector('img')).toHaveAttribute(
      'src',
      '/review-2.jpg',
    )
  })

  it('renders ImageFallback when viewer image fails to load', () => {
    render(
      <ReviewImageViewer
        imageUrls={['/review-1.jpg']}
        onClose={vi.fn()}
        open
      />,
    )

    const viewerImageContainer = screen.getByTestId('review-image-viewer-image')

    expect(
      viewerImageContainer.querySelector('[data-slot="image-fallback"]'),
    ).toBeNull()

    const viewerImage = viewerImageContainer.querySelector('img')
    expect(viewerImage).toBeInTheDocument()

    fireEvent.error(viewerImage as HTMLImageElement)

    expect(
      viewerImageContainer.querySelector('[data-slot="image-fallback"]'),
    ).toBeInTheDocument()
  })

  it('locks background scroll while viewer is open and restores it when closed', () => {
    const mockScrollTo = vi.fn()

    vi.stubGlobal('scrollY', 240)
    vi.stubGlobal('scrollTo', mockScrollTo)

    const { rerender } = render(
      <ReviewImageViewer
        imageUrls={['/review-1.jpg']}
        onClose={vi.fn()}
        open
      />,
    )

    expect(document.body.style.overflow).toBe('hidden')
    expect(document.body.style.position).toBe('fixed')
    expect(document.body.style.top).toBe('-240px')
    expect(document.body.style.width).toBe('100%')
    expect(document.documentElement.style.overflow).toBe('hidden')

    rerender(
      <ReviewImageViewer
        imageUrls={['/review-1.jpg']}
        onClose={vi.fn()}
        open={false}
      />,
    )

    expect(document.body.style.overflow).toBe('')
    expect(document.body.style.position).toBe('')
    expect(document.body.style.top).toBe('')
    expect(document.body.style.width).toBe('')
    expect(document.documentElement.style.overflow).toBe('')
    expect(mockScrollTo).toHaveBeenCalledWith({
      top: 240,
      behavior: 'auto',
    })
  })
})
