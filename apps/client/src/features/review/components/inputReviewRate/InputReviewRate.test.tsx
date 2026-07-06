import '@testing-library/jest-dom/vitest'

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { InputReviewRate } from './InputReviewRate'

afterEach(() => {
  cleanup()
})

describe('InputReviewRate', () => {
  it('renders the review rating prompt with five empty stars', () => {
    render(<InputReviewRate />)

    expect(screen.getByText('이 맛집 어떠셨나요?')).toHaveClass(
      'typo-sub-header-1',
      'text-primary-200',
    )
    expect(
      screen.getByRole('radiogroup', { name: '맛집 별점 선택' }),
    ).toBeInTheDocument()

    const stars = screen.getAllByRole('radio')

    expect(stars).toHaveLength(5)
    expect(stars[0]).toHaveClass('size-[29px]')
    stars.forEach((star) => {
      expect(star).toHaveAttribute('aria-checked', 'false')
      expect(star).toHaveAttribute('data-state', 'empty')
    })
  })

  it('marks only the current rating radio as checked while filling stars up to the value', () => {
    render(<InputReviewRate value={3} />)

    const stars = screen.getAllByRole('radio')

    expect(stars[0]).toHaveAttribute('aria-checked', 'false')
    expect(stars[1]).toHaveAttribute('aria-checked', 'false')
    expect(stars[2]).toHaveAttribute('aria-checked', 'true')
    expect(stars[3]).toHaveAttribute('aria-checked', 'false')
    expect(stars[4]).toHaveAttribute('aria-checked', 'false')
    expect(stars[0].querySelector('.text-primary-400')).toBeInTheDocument()
    expect(stars[1].querySelector('.text-primary-400')).toBeInTheDocument()
    expect(stars[2].querySelector('.text-primary-400')).toBeInTheDocument()
    expect(stars[3].querySelector('.text-primary-400')).not.toBeInTheDocument()
  })

  it('calls onValueChange with the selected rating', () => {
    const handleValueChange = vi.fn()

    render(<InputReviewRate onValueChange={handleValueChange} />)

    fireEvent.click(screen.getByRole('radio', { name: '4점' }))

    expect(handleValueChange).toHaveBeenCalledTimes(1)
    expect(handleValueChange).toHaveBeenCalledWith(4)
  })
})
