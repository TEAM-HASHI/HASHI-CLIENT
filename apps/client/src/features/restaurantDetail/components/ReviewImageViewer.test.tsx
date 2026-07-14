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

  it('matches the Figma review image viewer layout', () => {
    render(
      <ReviewImageViewer
        imageUrls={['/review-1.jpg', '/review-2.jpg']}
        initialIndex={1}
        onClose={vi.fn()}
        open
      />,
    )

    const dialog = screen.getByRole('dialog', { name: '리뷰 이미지 상세보기' })
    const closeButton = screen.getByRole('button', {
      name: '리뷰 이미지 상세보기 닫기',
    })
    const carousel = screen.getByRole('region', {
      name: '리뷰 이미지 상세보기 사진 목록',
    })
    const imageFrame = screen.getAllByTestId('review-image-viewer-image')[0]
    const currentImageFrame = screen
      .getAllByRole('group')
      .find((slide) => slide.getAttribute('data-current') === 'true')
      ?.querySelector('[data-testid="review-image-viewer-image"]')
    const indicator = carousel.querySelector('[data-hds-carousel-indicator]')

    expect(dialog).toHaveClass('bg-cool-gray-900', 'overflow-hidden')
    expect(dialog).not.toHaveClass('rounded-[20px]')
    expect(closeButton).toHaveClass(
      'absolute',
      'top-[78px]',
      'right-5',
      'z-raised',
      'size-6',
      'text-primary-100',
    )
    expect(imageFrame).toHaveClass('h-full', 'w-full', 'bg-primary-100')
    expect(imageFrame.closest('[data-hds-carousel-viewport]')).toHaveClass(
      'absolute',
      'top-[139px]',
      'bottom-[139px]',
    )
    expect(currentImageFrame?.querySelector('img')).toHaveAttribute(
      'src',
      '/review-2.jpg',
    )
    expect(indicator).toBeInTheDocument()
    expect(indicator).toHaveClass(
      'absolute',
      'bottom-10',
      'left-1/2',
      '-translate-x-1/2',
      'gap-[5px]',
    )
    expect(indicator?.querySelector('[data-current="true"]')).toHaveClass(
      'bg-cool-gray-200',
      'h-1',
      'w-3',
    )
  })

  it('renders default image when viewer image fails to load', () => {
    render(
      <ReviewImageViewer
        imageUrls={['/review-1.jpg']}
        onClose={vi.fn()}
        open
      />,
    )

    expect(screen.queryByTestId('review-image-viewer-default-image')).toBeNull()

    const viewerImage = screen
      .getByTestId('review-image-viewer-image')
      .querySelector('img')
    expect(viewerImage).toBeInTheDocument()

    fireEvent.error(viewerImage as HTMLImageElement)

    expect(
      screen.getByTestId('review-image-viewer-default-image'),
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
