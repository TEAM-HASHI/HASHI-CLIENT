import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { LoadingScreen } from '@/shared/components/loadingScreen'

describe('LoadingScreen', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders the default loading message as a polite status', () => {
    const { container } = render(<LoadingScreen />)

    const status = screen.getByRole('status')
    const loadingRoot = status.closest('[aria-busy="true"]')

    expect(status).toHaveTextContent('로딩 중이에요')
    expect(status).toHaveAttribute('aria-live', 'polite')
    expect(loadingRoot).toBeTruthy()
    expect(container.querySelectorAll('img')).toHaveLength(2)
  })

  it('renders a custom loading message', () => {
    render(<LoadingScreen message="정보를 불러오고 있어요" />)

    expect(screen.getByRole('status')).toHaveTextContent(
      '정보를 불러오고 있어요',
    )
  })
})
