import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { StarRating } from './StarRating'

afterEach(() => {
  cleanup()
})

const getStarStates = () =>
  screen
    .getAllByTestId('star-rating-item')
    .map((star) => star.getAttribute('data-state'))

describe('StarRating', () => {
  it('renders a read-only rating image with an accessible name', () => {
    render(<StarRating value={3.8} />)

    expect(screen.getByRole('img', { name: '평점 3.8점' })).toBeInTheDocument()
  })

  it('uses a custom accessible name when aria-label is provided', () => {
    render(<StarRating aria-label="레스토랑 평점 4.2점" value={4.2} />)

    expect(
      screen.getByRole('img', { name: '레스토랑 평점 4.2점' }),
    ).toBeInTheDocument()
  })

  it('displays decimal values as the integer part plus a half star', () => {
    render(<StarRating value={3.8} />)

    expect(getStarStates()).toEqual([
      'filled',
      'filled',
      'filled',
      'half',
      'empty',
    ])
  })

  it('displays zero as five empty stars', () => {
    render(<StarRating value={0} />)

    expect(getStarStates()).toEqual([
      'empty',
      'empty',
      'empty',
      'empty',
      'empty',
    ])
  })

  it('displays half as one half star', () => {
    render(<StarRating value={0.5} />)

    expect(getStarStates()).toEqual([
      'half',
      'empty',
      'empty',
      'empty',
      'empty',
    ])
  })

  it('preserves integer values without adding a half star', () => {
    render(<StarRating value={4} />)

    expect(getStarStates()).toEqual([
      'filled',
      'filled',
      'filled',
      'filled',
      'empty',
    ])
  })
})
