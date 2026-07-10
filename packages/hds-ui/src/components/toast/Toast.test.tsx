import '@testing-library/jest-dom/vitest'

import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  createToastQueue,
  DEFAULT_TOAST_TIMEOUT,
  showToast,
  toastQueue,
  ToastRegion,
} from './Toast'

afterEach(() => {
  cleanup()
  toastQueue.clear()
  vi.restoreAllMocks()
})

describe('Toast', () => {
  it('renders queued toast message', () => {
    const queue = createToastQueue()
    queue.add({ children: '링크가 복사 되었어요.' })

    render(<ToastRegion queue={queue} />)

    expect(screen.getByText('링크가 복사 되었어요.')).toBeInTheDocument()
  })

  it('renders icon slot as decorative content', () => {
    const queue = createToastQueue()
    queue.add({
      children: '링크가 복사 되었어요.',
      icon: <svg data-testid="toast-icon" />,
    })

    render(<ToastRegion queue={queue} />)

    expect(screen.getByTestId('toast-icon').parentElement).toHaveAttribute(
      'aria-hidden',
      'true',
    )
  })

  it('renders a full-width toast with 20px horizontal content padding', () => {
    const queue = createToastQueue()
    queue.add({ children: '링크가 복사 되었어요.' })

    render(<ToastRegion queue={queue} />)

    expect(
      screen.getByText('링크가 복사 되었어요.').closest('[role="alert"]')
        ?.parentElement,
    ).toHaveClass('w-full', 'px-5')
  })

  it('applies a soft enter keyframe animation', () => {
    const queue = createToastQueue()
    queue.add({ children: '링크가 복사 되었어요.' })

    render(<ToastRegion queue={queue} />)

    expect(
      screen.getByText('링크가 복사 되었어요.').closest('[role="alert"]')
        ?.parentElement,
    ).toHaveClass('transform-gpu', 'animate-toast-enter')
  })

  it('applies a delayed exit keyframe animation when timeout is set', () => {
    const queue = createToastQueue()
    queue.add(
      { children: '저장되었습니다.' },
      { timeout: DEFAULT_TOAST_TIMEOUT },
    )

    render(<ToastRegion queue={queue} />)

    const toast = screen
      .getByText('저장되었습니다.')
      .closest('[role="alert"]')?.parentElement

    expect(toast).toHaveClass('animate-toast-with-timeout')
  })

  it('merges custom region className', () => {
    const queue = createToastQueue()
    queue.add({ children: '저장되었습니다.' })

    render(<ToastRegion className="max-w-none" queue={queue} />)

    expect(
      screen.getByText('저장되었습니다.').closest('[role="region"]'),
    ).toHaveClass('max-w-none')
  })

  it('uses the default timeout when showing toast through helper', () => {
    const addToast = vi.spyOn(toastQueue, 'add')

    showToast({ children: '저장되었습니다.' })

    expect(DEFAULT_TOAST_TIMEOUT).toBe(1500)
    expect(addToast).toHaveBeenCalledWith(
      { children: '저장되었습니다.' },
      { timeout: DEFAULT_TOAST_TIMEOUT },
    )
  })

  it('keeps the helper timeout fixed while passing through other options', () => {
    const addToast = vi.spyOn(toastQueue, 'add')
    const onClose = vi.fn()

    showToast({ children: '닫히면 콜백을 실행합니다.' }, { onClose })

    expect(addToast).toHaveBeenCalledWith(
      { children: '닫히면 콜백을 실행합니다.' },
      { onClose, timeout: DEFAULT_TOAST_TIMEOUT },
    )
  })
})
