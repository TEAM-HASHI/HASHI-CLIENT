import '@testing-library/jest-dom/vitest'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ShareIconButton } from '@/shared/components/shareIconButton'

const { mockClipboardWriteText, mockShowToast, mockToastQueueClear } =
  vi.hoisted(() => ({
    mockClipboardWriteText: vi.fn(),
    mockShowToast: vi.fn(),
    mockToastQueueClear: vi.fn(),
  }))

vi.mock('@hashi/hds-ui', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@hashi/hds-ui')>()

  return {
    ...actual,
    showToast: mockShowToast,
    toastQueue: {
      ...actual.toastQueue,
      clear: mockToastQueueClear,
    },
  }
})

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
    mockShowToast.mockClear()
    mockToastQueueClear.mockClear()
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

  it('shows a success toast after copying the share link', async () => {
    render(<ShareIconButton shareUrl="/restaurants/today" />)

    fireEvent.click(screen.getByRole('button', { name: '공유하기' }))

    await waitFor(() => {
      expect(mockToastQueueClear).toHaveBeenCalled()
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({
          children: '링크가 복사 되었어요.',
        }),
      )
    })
  })
})
