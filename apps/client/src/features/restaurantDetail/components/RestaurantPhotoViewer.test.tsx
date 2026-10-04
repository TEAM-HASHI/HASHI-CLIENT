import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { RestaurantPhotoViewer } from '@/features/restaurantDetail/components/RestaurantPhotoViewer'

const photos = Array.from({ length: 8 }, (_, index) => ({
  id: String(index),
  thumbnailUrl: `/small-${index}.png`,
  imageUrl: `/large-${index}.png`,
  width: 800,
  height: 600,
}))
const props = {
  photos,
  total: 45,
  initialIndex: 2,
  hasMore: false,
  isLoading: false,
  isError: false,
  onLoadMore: vi.fn(),
  onClose: vi.fn(),
}

const originalShowModal = Object.getOwnPropertyDescriptor(
  HTMLDialogElement.prototype,
  'showModal',
)
const originalClose = Object.getOwnPropertyDescriptor(
  HTMLDialogElement.prototype,
  'close',
)

beforeEach(() => {
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
    configurable: true,
    value: function (this: HTMLDialogElement) {
      this.setAttribute('open', '')
    },
  })
  Object.defineProperty(HTMLDialogElement.prototype, 'close', {
    configurable: true,
    value: function (this: HTMLDialogElement) {
      this.removeAttribute('open')
    },
  })
  vi.stubGlobal('scrollTo', vi.fn())
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  if (originalShowModal)
    Object.defineProperty(
      HTMLDialogElement.prototype,
      'showModal',
      originalShowModal,
    )
  else Reflect.deleteProperty(HTMLDialogElement.prototype, 'showModal')
  if (originalClose)
    Object.defineProperty(HTMLDialogElement.prototype, 'close', originalClose)
  else Reflect.deleteProperty(HTMLDialogElement.prototype, 'close')
})

describe('RestaurantPhotoViewer', () => {
  it('opens at the selected photo with six section indicators', () => {
    render(<RestaurantPhotoViewer {...props} />)
    expect(
      screen.getByRole('dialog', { name: '식당 사진 상세보기' }),
    ).toBeInTheDocument()
    expect(document.querySelector('[data-current="true"] img')).toHaveAttribute(
      'src',
      '/large-2.png',
    )
    expect(screen.getByLabelText('3 / 45').children).toHaveLength(6)
  })
  it('shows an indicator even for a single photo and closes from the button', () => {
    render(
      <RestaurantPhotoViewer
        {...props}
        photos={photos.slice(0, 1)}
        total={1}
        initialIndex={0}
      />,
    )
    expect(
      screen.getByLabelText('1 / 1', {
        selector: ':not([aria-roledescription="slide"])',
      }).children,
    ).toHaveLength(1)
    fireEvent.click(screen.getByRole('button', { name: '사진 상세보기 닫기' }))
    expect(props.onClose).toHaveBeenCalled()
  })
  it('restores the scroll position and body styles on unmount', () => {
    vi.stubGlobal('scrollY', 240)
    const { unmount } = render(<RestaurantPhotoViewer {...props} />)
    expect(document.body.style.position).toBe('fixed')
    unmount()
    expect(document.body.style.position).toBe('')
    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 240,
      behavior: 'instant',
    })
  })
})
