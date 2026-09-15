import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { ImageFallback } from './ImageFallback'

afterEach(() => {
  cleanup()
})

describe('ImageFallback', () => {
  it('renders the Hashi mark on the fallback background', () => {
    render(<ImageFallback data-testid="image-fallback" />)

    const fallback = screen.getByTestId('image-fallback')

    expect(fallback).toHaveClass('bg-warm-gray-50')
    expect(fallback.querySelector('svg')).toHaveClass('text-primary-100')
  })

  it('exposes an accessible image label when provided', () => {
    render(<ImageFallback aria-label="식당 기본 이미지" role="img" />)

    expect(
      screen.getByRole('img', { name: '식당 기본 이미지' }),
    ).toBeInTheDocument()
  })

  it('merges a custom class name', () => {
    render(<ImageFallback className="size-20" data-testid="image-fallback" />)

    expect(screen.getByTestId('image-fallback')).toHaveClass('size-20')
  })
})
