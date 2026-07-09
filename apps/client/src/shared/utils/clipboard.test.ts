import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  copyCurrentUrlToClipboard,
  copyTextToClipboard,
  copyUrlToClipboard,
} from '@/shared/utils/clipboard'

const { mockClipboardWriteText, mockExecCommand } = vi.hoisted(() => ({
  mockClipboardWriteText: vi.fn(),
  mockExecCommand: vi.fn(),
}))

describe('clipboard utils', () => {
  afterEach(() => {
    mockClipboardWriteText.mockReset()
    mockExecCommand.mockReset()
    document.body.innerHTML = ''
  })

  it('copies the current page link with the Clipboard API first', async () => {
    mockClipboardWriteText.mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: mockClipboardWriteText,
      },
    })

    await expect(copyCurrentUrlToClipboard()).resolves.toBe(true)

    expect(mockClipboardWriteText).toHaveBeenCalledWith(window.location.href)
    expect(mockExecCommand).not.toHaveBeenCalled()
  })

  it('falls back to selection copy when the Clipboard API rejects', async () => {
    mockClipboardWriteText.mockRejectedValue(new Error('not allowed'))
    mockExecCommand.mockImplementation(() => {
      expect(window.getSelection()?.toString()).toBe(window.location.href)

      return true
    })
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: mockClipboardWriteText,
      },
    })
    Object.defineProperty(document, 'execCommand', {
      configurable: true,
      value: mockExecCommand,
    })

    await expect(copyCurrentUrlToClipboard()).resolves.toBe(true)

    expect(mockClipboardWriteText).toHaveBeenCalledWith(window.location.href)
    expect(mockExecCommand).toHaveBeenCalledWith('copy')
    expect(document.querySelector('[data-clipboard-copy-target]')).toBeNull()
  })

  it('falls back to selection copy when the Clipboard API is unavailable', async () => {
    mockExecCommand.mockReturnValue(true)
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: undefined,
    })
    Object.defineProperty(document, 'execCommand', {
      configurable: true,
      value: mockExecCommand,
    })

    await expect(copyCurrentUrlToClipboard()).resolves.toBe(true)

    expect(mockClipboardWriteText).not.toHaveBeenCalled()
    expect(mockExecCommand).toHaveBeenCalledWith('copy')
  })

  it('normalizes a path URL to an absolute URL before copying', async () => {
    mockClipboardWriteText.mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: mockClipboardWriteText,
      },
    })

    await expect(copyUrlToClipboard('/restaurants/today')).resolves.toBe(true)

    expect(mockClipboardWriteText).toHaveBeenCalledWith(
      `${window.location.origin}/restaurants/today`,
    )
  })

  it('copies plain text without URL normalization', async () => {
    mockClipboardWriteText.mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: mockClipboardWriteText,
      },
    })

    await expect(copyTextToClipboard('야키니쿠 리키마루')).resolves.toBe(true)

    expect(mockClipboardWriteText).toHaveBeenCalledWith('야키니쿠 리키마루')
  })

  it('selects plain text in the fallback target before copying', async () => {
    mockClipboardWriteText.mockRejectedValue(new Error('not allowed'))
    mockExecCommand.mockImplementation(() => {
      expect(window.getSelection()?.toString()).toBe('야키니쿠 리키마루')

      return true
    })
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: mockClipboardWriteText,
      },
    })
    Object.defineProperty(document, 'execCommand', {
      configurable: true,
      value: mockExecCommand,
    })

    await expect(copyTextToClipboard('야키니쿠 리키마루')).resolves.toBe(true)

    expect(mockExecCommand).toHaveBeenCalledWith('copy')
  })

  it('selects the fallback text instead of existing page selection before copying', async () => {
    const selectedButtonText = document.createElement('button')
    selectedButtonText.textContent = '식당명 복사버튼'
    document.body.append(selectedButtonText)

    const range = document.createRange()
    range.selectNodeContents(selectedButtonText)
    const selection = window.getSelection()
    selection?.removeAllRanges()
    selection?.addRange(range)
    const removeAllRangesSpy = selection
      ? vi.spyOn(selection, 'removeAllRanges')
      : undefined
    removeAllRangesSpy?.mockClear()

    mockClipboardWriteText.mockRejectedValue(new Error('not allowed'))
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: mockClipboardWriteText,
      },
    })
    Object.defineProperty(document, 'execCommand', {
      configurable: true,
      value: mockExecCommand,
    })
    mockExecCommand.mockImplementation(() => {
      expect(window.getSelection()?.toString()).toBe('야키니쿠 리키마루')

      return true
    })

    await expect(copyTextToClipboard('야키니쿠 리키마루')).resolves.toBe(true)

    expect(removeAllRangesSpy).toHaveBeenCalled()
    expect(mockExecCommand).toHaveBeenCalledWith('copy')
    removeAllRangesSpy?.mockRestore()
  })
})
