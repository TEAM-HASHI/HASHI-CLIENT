import '@testing-library/jest-dom/vitest'

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { SearchBar, SearchField } from './SearchBar'

afterEach(() => {
  cleanup()
})

describe('SearchBar', () => {
  it('renders a search input with an accessible name', () => {
    render(<SearchBar aria-label="식당 검색" />)

    const input = screen.getByRole('searchbox', { name: '식당 검색' })

    expect(input).toHaveAttribute('type', 'search')
  })

  it('applies redesigned layout, state colors, and typography', () => {
    render(<SearchBar aria-label="식당 검색" placeholder="플레이스홀더" />)

    const input = screen.getByRole('searchbox', { name: '식당 검색' })
    const root = input.parentElement

    expect(root).toHaveClass(
      'h-[45px]',
      'rounded-[10px]',
      'bg-primary-100',
      'hover:bg-warm-gray-50',
      'active:bg-warm-gray-100',
      'py-4',
      'pl-3',
      'pr-3',
    )
    expect(input).toHaveClass(
      'typo-body-4',
      'text-black',
      'placeholder:text-warm-gray-300',
    )
  })

  it('renders the search icon by default', () => {
    const { container } = render(<SearchBar aria-label="식당 검색" />)

    const input = screen.getByRole('searchbox', { name: '식당 검색' })

    expect(input.parentElement).toHaveClass('gap-2')
    expect(container.querySelector('svg')).toHaveClass(
      'size-6',
      'text-cool-gray-700',
    )
  })

  it('can hide the search icon', () => {
    const { container } = render(
      <SearchBar aria-label="식당 검색" icon={false} />,
    )

    const input = screen.getByRole('searchbox', { name: '식당 검색' })

    expect(input.parentElement).not.toHaveClass('gap-2')
    expect(container.querySelector('svg')).not.toBeInTheDocument()
  })

  it('renders caller-provided placeholder copy', () => {
    render(
      <SearchBar
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
      <SearchBar aria-label="식당 검색" onChange={handleChange} value="초밥" />,
    )

    const input = screen.getByRole('searchbox', {
      name: '식당 검색',
    }) as HTMLInputElement

    expect(input).toHaveValue('초밥')

    fireEvent.change(input, { target: { value: '라멘' } })

    expect(handleChange).toHaveBeenCalledTimes(1)
  })

  it('keeps end padding for long input values', () => {
    render(
      <SearchBar
        aria-label="식당 검색"
        value="긴 검색어가 입력되어도 오른쪽 둥근 경계에 붙지 않습니다"
        readOnly
      />,
    )

    const input = screen.getByRole('searchbox', { name: '식당 검색' })

    expect(input.parentElement).toHaveClass('pr-3')
    expect(input).toHaveClass('min-w-0', 'flex-1')
  })

  it('supports an uncontrolled default value', () => {
    render(<SearchBar aria-label="식당 검색" defaultValue="돈카츠" />)

    expect(screen.getByRole('searchbox', { name: '식당 검색' })).toHaveValue(
      '돈카츠',
    )
  })

  it('disables input interaction when disabled', () => {
    render(<SearchBar aria-label="식당 검색" disabled />)

    expect(screen.getByRole('searchbox', { name: '식당 검색' })).toBeDisabled()
  })

  it('forwards refs to the native input', () => {
    const inputRef = createRef<HTMLInputElement>()

    render(<SearchBar ref={inputRef} aria-label="식당 검색" />)

    expect(inputRef.current).toBe(
      screen.getByRole('searchbox', { name: '식당 검색' }),
    )
  })

  it('keeps SearchField as a compatibility alias', () => {
    expect(SearchField).toBe(SearchBar)
  })
})
