import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Thumbnail } from './Thumbnail'

afterEach(() => {
  cleanup()
})

describe('Thumbnail', () => {
  it('renders an image when src is provided', () => {
    render(<Thumbnail alt="식당 이미지" src="/restaurant.png" />)

    expect(screen.getByRole('img', { name: '식당 이미지' })).toHaveAttribute(
      'src',
      '/restaurant.png',
    )
  })

  it('renders a fallback when src is not provided', () => {
    const { container } = render(<Thumbnail alt="식당 이미지" />)
    const fallback = container.querySelector('[data-slot="image-fallback"]')

    expect(fallback).toHaveAttribute('role', 'img')
    expect(fallback).toHaveAttribute('aria-label', '식당 이미지')
    expect(fallback?.querySelector('svg')).toBeTruthy()
  })

  it('renders a fallback and calls onError when image loading fails', () => {
    const handleError = vi.fn()

    const { container } = render(
      <Thumbnail alt="식당 이미지" onError={handleError} src="/broken.png" />,
    )

    fireEvent.error(screen.getByRole('img', { name: '식당 이미지' }))

    expect(handleError).toHaveBeenCalledOnce()
    expect(
      container.querySelector('[data-slot="image-fallback"] svg'),
    ).toBeTruthy()
  })

  it('tries to render the next image when src changes after an error', () => {
    const { rerender } = render(
      <Thumbnail alt="식당 이미지" src="/broken.png" />,
    )

    fireEvent.error(screen.getByRole('img', { name: '식당 이미지' }))
    rerender(<Thumbnail alt="식당 이미지" src="/next.png" />)

    expect(screen.getByRole('img', { name: '식당 이미지' })).toHaveAttribute(
      'src',
      '/next.png',
    )
  })

  it.each([
    ['sm', 'size-15'],
    ['md', 'size-23'],
    ['lg', 'size-33.75'],
  ] as const)('applies the %s size', (size, className) => {
    const { container } = render(<Thumbnail alt="식당 이미지" size={size} />)

    expect(container.querySelector('[data-slot="image-fallback"]')).toHaveClass(
      className,
    )
  })
})
