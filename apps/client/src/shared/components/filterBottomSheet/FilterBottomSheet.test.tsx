import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { FilterBottomSheet } from './FilterBottomSheet'

const options = [
  { label: '스시/사시미류', value: 'sushi' },
  { label: '면류', value: 'noodle' },
  { label: '덮밥류', value: 'rice-bowl' },
]

describe('FilterBottomSheet', () => {
  afterEach(() => {
    cleanup()
    document.body.style.overflow = ''
  })

  it('renders filter options and selected state', () => {
    render(
      <FilterBottomSheet
        open
        onApply={vi.fn()}
        onOpenChange={vi.fn()}
        onReset={vi.fn()}
        onSelect={vi.fn()}
        options={options}
        selectedValue="sushi"
        title="음식 장르 선택"
      />,
    )

    expect(
      screen.getByRole('dialog', { name: '음식 장르 선택' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: '스시/사시미류' }),
    ).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '스시/사시미류' })).toHaveClass(
      'typo-body-3',
    )
    expect(screen.getByRole('button', { name: '면류' })).toHaveClass(
      'typo-body-4',
    )
  })

  it('calls handlers when option and footer buttons are pressed', () => {
    const handleSelect = vi.fn()
    const handleReset = vi.fn()
    const handleApply = vi.fn()

    render(
      <FilterBottomSheet
        open
        onApply={handleApply}
        onOpenChange={vi.fn()}
        onReset={handleReset}
        onSelect={handleSelect}
        options={options}
        selectedValue="sushi"
        title="음식 장르 선택"
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: '면류' }))
    fireEvent.click(screen.getByRole('button', { name: '초기화' }))
    fireEvent.click(screen.getByRole('button', { name: '적용' }))

    expect(handleSelect).toHaveBeenCalledWith('noodle')
    expect(handleReset).toHaveBeenCalled()
    expect(handleApply).toHaveBeenCalled()
  })
})
