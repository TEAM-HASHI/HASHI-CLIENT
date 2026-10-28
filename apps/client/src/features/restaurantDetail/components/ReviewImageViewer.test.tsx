import '@testing-library/jest-dom/vitest'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ReviewImageViewer } from '@/features/restaurantDetail/components/ReviewImageViewer'

describe('ReviewImageViewer', () => {
  afterEach(() => {
    cleanup()
    document.documentElement.style.overflow = ''
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

  it('locks background scroll while viewer is open and restores it when closed', async () => {
    const { rerender } = render(
      <ReviewImageViewer
        imageUrls={['/review-1.jpg']}
        onClose={vi.fn()}
        open
      />,
    )

    expect(document.documentElement.style.overflow).toBe('hidden')

    rerender(
      <ReviewImageViewer
        imageUrls={['/review-1.jpg']}
        onClose={vi.fn()}
        open={false}
      />,
    )

    await waitFor(() =>
      expect(document.documentElement.style.overflow).toBe(''),
    )
  })
})
