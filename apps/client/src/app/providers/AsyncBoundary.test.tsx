import '@testing-library/jest-dom/vitest'

import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import AsyncBoundary from '@/app/providers/AsyncBoundary'
import { ApiError } from '@/shared/api/apiError'
import type { ErrorResponse } from '@/shared/api/types'

const { mockCaptureError } = vi.hoisted(() => ({
  mockCaptureError: vi.fn(),
}))

vi.mock('@/shared/lib/sentry', () => ({
  captureError: mockCaptureError,
}))

const response: ErrorResponse = {
  success: false,
  code: 'COMMON-500',
  message: 'raw server message',
  data: null,
  timestamp: '2026-07-11T00:00:00.000Z',
  path: '/api/v1/restaurants',
}

const QueryContent = ({ queryFn }: { queryFn: () => Promise<string> }) => {
  const { data } = useQuery({
    queryKey: ['async-boundary-test'],
    queryFn,
  })

  return <p>{data}</p>
}

describe('AsyncBoundary', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('shows mapped copy, captures the error, and refetches after reset', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const user = userEvent.setup()
    const error = new ApiError(response, 500)
    const queryFn = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(error)
      .mockResolvedValueOnce('recovered')
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          throwOnError: true,
        },
      },
    })

    render(
      <QueryClientProvider client={queryClient}>
        <AsyncBoundary>
          <QueryContent queryFn={queryFn} />
        </AsyncBoundary>
      </QueryClientProvider>,
    )

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('COMMON-500')
    expect(alert).toHaveTextContent('서버 오류입니다')
    expect(mockCaptureError).toHaveBeenCalledWith(error, {
      extra: { componentStack: expect.any(String) },
    })

    await user.click(screen.getByRole('button', { name: '다시 시도' }))

    expect(await screen.findByText('recovered')).toBeInTheDocument()
    expect(queryFn).toHaveBeenCalledTimes(2)
  })
})
