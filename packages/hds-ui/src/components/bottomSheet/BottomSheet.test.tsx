import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { BottomSheet } from './BottomSheet'

describe('BottomSheet', () => {
  afterEach(() => {
    cleanup()
    document.body.style.overflow = ''
  })

  it('does not render when open is false', () => {
    render(
      <BottomSheet open={false} onOpenChange={vi.fn()} title="정렬 순서">
        콘텐츠
      </BottomSheet>,
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders title and content when open is true', () => {
    render(
      <BottomSheet open onOpenChange={vi.fn()} title="정렬 순서">
        기본순
      </BottomSheet>,
    )

    expect(
      screen.getByRole('dialog', { name: '정렬 순서' }),
    ).toBeInTheDocument()
    expect(screen.getByText('기본순')).toBeInTheDocument()
  })

  it('keeps the sheet mounted until close transition ends', () => {
    const { rerender } = render(
      <BottomSheet open onOpenChange={vi.fn()} title="정렬 순서">
        기본순
      </BottomSheet>,
    )

    rerender(
      <BottomSheet open={false} onOpenChange={vi.fn()} title="정렬 순서">
        기본순
      </BottomSheet>,
    )

    const sheet = screen.getByRole('dialog', { name: '정렬 순서' })

    expect(sheet).toHaveClass('translate-y-full')

    fireEvent.transitionEnd(sheet)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('calls onOpenChange when close button is pressed', () => {
    const handleOpenChange = vi.fn()

    render(
      <BottomSheet open onOpenChange={handleOpenChange} title="정렬 순서">
        기본순
      </BottomSheet>,
    )

    fireEvent.click(screen.getByRole('button', { name: '닫기' }))

    expect(handleOpenChange).toHaveBeenCalledWith(false)
  })

  it('calls onOpenChange when overlay is pressed', () => {
    const handleOpenChange = vi.fn()

    render(
      <BottomSheet open onOpenChange={handleOpenChange} title="정렬 순서">
        기본순
      </BottomSheet>,
    )

    fireEvent.click(screen.getByRole('dialog').parentElement!)

    expect(handleOpenChange).toHaveBeenCalledWith(false)
  })

  it('keeps inner content clicks from closing the sheet', () => {
    const handleOpenChange = vi.fn()

    render(
      <BottomSheet open onOpenChange={handleOpenChange} title="정렬 순서">
        <button type="button">기본순</button>
      </BottomSheet>,
    )

    fireEvent.click(screen.getByRole('button', { name: '기본순' }))

    expect(handleOpenChange).not.toHaveBeenCalled()
  })
})
