import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ShareIconButton } from '@/shared/components/shareIconButton'

const { mockClipboardWriteText } = vi.hoisted(() => ({
  mockClipboardWriteText: vi.fn(),
}))

describe('ShareIconButton', () => {
  beforeEach(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: mockClipboardWriteText,
      },
    })
  })

  afterEach(() => {
    cleanup()
    mockClipboardWriteText.mockClear()
  })

  it('copies the current page link when pressed', () => {
    render(<ShareIconButton />)

    fireEvent.click(screen.getByRole('button', { name: '공유하기' }))

    expect(mockClipboardWriteText).toHaveBeenCalledWith(window.location.href)
  })

  it('copies the given share URL when provided', () => {
    render(<ShareIconButton shareUrl="/restaurants/today" />)

    fireEvent.click(screen.getByRole('button', { name: '공유하기' }))

    expect(mockClipboardWriteText).toHaveBeenCalledWith(
      `${window.location.origin}/restaurants/today`,
    )
  })
})
