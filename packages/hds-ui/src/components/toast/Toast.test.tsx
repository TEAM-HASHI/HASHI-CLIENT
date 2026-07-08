import '@testing-library/jest-dom/vitest'

import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { createToastQueue, ToastRegion } from './Toast'

afterEach(() => {
  cleanup()
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

  it('merges custom region className', () => {
    const queue = createToastQueue()
    queue.add({ children: '저장되었습니다.' })

    render(<ToastRegion className="max-w-none" queue={queue} />)

    expect(
      screen.getByText('저장되었습니다.').closest('[role="region"]'),
    ).toHaveClass('max-w-none')
  })
})
