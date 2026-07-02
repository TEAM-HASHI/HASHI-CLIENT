import '@testing-library/jest-dom/vitest'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
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

  it('uses aria-label as dialog name when title is not provided', () => {
    render(
      <BottomSheet
        aria-label="로그인 안내"
        open
        onOpenChange={vi.fn()}
        showCloseButton={false}
        showHandle={false}
      >
        콘텐츠
      </BottomSheet>,
    )

    expect(
      screen.getByRole('dialog', { name: '로그인 안내' }),
    ).toBeInTheDocument()
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

  it('calls onOpenChange when escape key is pressed', async () => {
    const handleOpenChange = vi.fn()

    render(
      <BottomSheet open onOpenChange={handleOpenChange} title="정렬 순서">
        기본순
      </BottomSheet>,
    )

    const dialog = screen.getByRole('dialog', { name: '정렬 순서' })

    await waitFor(() => {
      expect(dialog).toHaveFocus()
    })

    fireEvent.keyDown(dialog, { key: 'Escape' })

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

  it('moves focus into the sheet and restores previous focus when closed', async () => {
    const trigger = document.createElement('button')
    trigger.textContent = '열기'
    document.body.appendChild(trigger)
    trigger.focus()

    const { rerender } = render(
      <BottomSheet open onOpenChange={vi.fn()} title="정렬 순서">
        기본순
      </BottomSheet>,
    )

    const dialog = screen.getByRole('dialog', { name: '정렬 순서' })

    await waitFor(() => {
      expect(dialog).toHaveFocus()
    })

    rerender(
      <BottomSheet open={false} onOpenChange={vi.fn()} title="정렬 순서">
        기본순
      </BottomSheet>,
    )

    expect(trigger).toHaveFocus()
    trigger.remove()
  })

  it('keeps tab focus inside the sheet', async () => {
    render(
      <BottomSheet
        footer={<button type="button">확인</button>}
        open
        onOpenChange={vi.fn()}
        title="정렬 순서"
      >
        <button type="button">기본순</button>
      </BottomSheet>,
    )

    const dialog = screen.getByRole('dialog', { name: '정렬 순서' })
    const closeButton = screen.getByRole('button', { name: '닫기' })
    const confirmButton = screen.getByRole('button', { name: '확인' })

    await waitFor(() => {
      expect(dialog).toHaveFocus()
    })

    confirmButton.focus()
    fireEvent.keyDown(dialog, { key: 'Tab' })

    expect(closeButton).toHaveFocus()

    closeButton.focus()
    fireEvent.keyDown(dialog, { key: 'Tab', shiftKey: true })

    expect(confirmButton).toHaveFocus()
  })
})
