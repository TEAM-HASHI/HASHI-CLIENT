import '@testing-library/jest-dom/vitest'

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { SearchField } from './SearchField'

afterEach(() => {
  cleanup()
})

describe('SearchField', () => {
  it('renders a search input with an accessible name', () => {
    render(<SearchField aria-label="식당 검색" />)

    const input = screen.getByRole('searchbox', { name: '식당 검색' })

    expect(input).toHaveAttribute('type', 'search')
  })

  it('renders caller-provided placeholder copy', () => {
    render(
      <SearchField
        aria-label="식당 검색"
        placeholder="식당 혹은 메뉴를 검색해보세요"
      />,
    )

    expect(
      screen.getByPlaceholderText('식당 혹은 메뉴를 검색해보세요'),
    ).toBeInTheDocument()
  })

  it('supports controlled value changes', () => {
    const handleChange = vi.fn()

    render(
      <SearchField
        aria-label="식당 검색"
        onChange={handleChange}
        value="초밥"
      />,
    )

    const input = screen.getByRole('searchbox', {
      name: '식당 검색',
    }) as HTMLInputElement

    expect(input).toHaveValue('초밥')

    fireEvent.change(input, { target: { value: '라멘' } })

    expect(handleChange).toHaveBeenCalledTimes(1)
  })

  it('supports an uncontrolled default value', () => {
    render(<SearchField aria-label="식당 검색" defaultValue="돈카츠" />)

    expect(screen.getByRole('searchbox', { name: '식당 검색' })).toHaveValue(
      '돈카츠',
    )
  })

  it('disables input interaction when disabled', () => {
    render(<SearchField aria-label="식당 검색" disabled />)

    expect(screen.getByRole('searchbox', { name: '식당 검색' })).toBeDisabled()
  })

  it('forwards refs to the native input', () => {
    const inputRef = createRef<HTMLInputElement>()

    render(<SearchField ref={inputRef} aria-label="식당 검색" />)

    expect(inputRef.current).toBe(
      screen.getByRole('searchbox', { name: '식당 검색' }),
    )
  })
})
