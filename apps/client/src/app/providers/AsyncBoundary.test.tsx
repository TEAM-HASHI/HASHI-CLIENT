import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

const { mockCaptureError } = vi.hoisted(() => ({
  mockCaptureError: vi.fn(),
}))

vi.mock('@/shared/lib/sentry', () => ({
  captureError: mockCaptureError,
}))

import AsyncBoundary from '@/app/providers/AsyncBoundary'

const ErrorThrowingChild = () => {
  throw new Error('render failed')
}

describe('AsyncBoundary', () => {
  it('captures errors handled by the boundary', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <AsyncBoundary>
        <ErrorThrowingChild />
      </AsyncBoundary>,
    )

    expect(screen.getByText('일시적인 오류가 발생했습니다.')).toBeVisible()
    expect(mockCaptureError.mock.calls[0]?.[0]).toEqual(expect.any(Error))
  })
})
