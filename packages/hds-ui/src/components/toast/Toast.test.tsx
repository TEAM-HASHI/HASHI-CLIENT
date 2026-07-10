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

  it('applies a top-down enter transition', () => {
    const queue = createToastQueue()
    queue.add({ children: '링크가 복사 되었어요.' })

    render(<ToastRegion queue={queue} />)

    expect(
      screen.getByText('링크가 복사 되었어요.').closest('[role="alert"]')
        ?.parentElement,
    ).toHaveClass(
      'translate-y-0',
      'opacity-100',
      'transform-gpu',
      'transition-[transform,opacity]',
      'duration-200',
      'ease-out',
      'starting:-translate-y-full',
      'starting:opacity-0',
    )
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

  it('allows overriding the default helper timeout', () => {
    const addToast = vi.spyOn(toastQueue, 'add')

    showToast({ children: '천천히 닫히는 토스트입니다.' }, { timeout: 5000 })

    expect(addToast).toHaveBeenCalledWith(
      { children: '천천히 닫히는 토스트입니다.' },
      { timeout: 5000 },
    )
  })
})
