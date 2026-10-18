import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, expect, it, vi } from 'vitest'
import { showToast } from '@hashi/hds-ui'
import { getVisitedReservations } from '@/features/review/api/getVisitedReservations'
import { useRestaurantReviewWriteNavigation } from '@/features/restaurantDetail/hooks/useRestaurantReviewWriteNavigation'
import {
  clearAuthSession,
  startAuthenticatedSession,
} from '@/shared/auth/authSession'
import { apiClient } from '@/shared/api/apiClient'
import { HttpStatusError } from '@/shared/api/apiError'
import { requestTokenReissue } from '@/shared/api/requestTokenReissue'
import { request } from '@/shared/api/request'

const navigate = vi.hoisted(() => vi.fn())
vi.mock('react-router-dom', () => ({ useNavigate: () => navigate }))
vi.mock('@/features/review/api/getVisitedReservations', () => ({
  getVisitedReservations: vi.fn(),
}))
vi.mock('@hashi/hds-ui', () => ({ showToast: vi.fn() }))
vi.mock('@/shared/api/apiClient', () => ({ apiClient: vi.fn() }))
vi.mock('@/shared/api/requestTokenReissue', () => ({
  requestTokenReissue: vi.fn(),
}))
afterEach(() => {
  cleanup()
  vi.resetAllMocks()
  clearAuthSession()
})
const setup = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
  const onReviewUnavailable = vi.fn()
  const onAuthRequired = vi.fn()
  return {
    onReviewUnavailable,
    onAuthRequired,
    ...renderHook(
      () =>
        useRestaurantReviewWriteNavigation({
          restaurantId: 10,
          isAuthenticated: true,
          onAuthRequired,
          onReviewUnavailable,
        }),
      { wrapper },
    ),
  }
}

it('shows a retryable toast instead of replacing the detail after an eligibility failure', async () => {
  vi.mocked(getVisitedReservations).mockRejectedValue(
    new Error('server failed'),
  )
  const { result, onReviewUnavailable } = setup()
  await act(async () => {
    await result.current.onPressWriteReview()
  })
  expect(showToast).toHaveBeenCalledWith({
    children: '리뷰 작성 가능 여부를 확인하지 못했어요.',
  })
  expect(onReviewUnavailable).not.toHaveBeenCalled()
  expect(navigate).not.toHaveBeenCalled()
})

it('ignores an eligible reservation returned after logout', async () => {
  let resolve!: (
    data: Awaited<ReturnType<typeof getVisitedReservations>>,
  ) => void
  vi.mocked(getVisitedReservations).mockReturnValue(
    new Promise((done) => {
      resolve = done
    }),
  )
  const { result } = setup()
  let pending!: Promise<void>
  act(() => {
    pending = result.current.onPressWriteReview()
  })
  await act(async () => {
    clearAuthSession()
    resolve({
      content: [{ reservationId: 1, restaurantId: 10, reviewable: true }],
      hasNext: false,
    })
    await pending
  })
  expect(navigate).not.toHaveBeenCalled()
  expect(showToast).not.toHaveBeenCalled()
})

it.each([
  'expired',
  'concurrent-expiry',
  'logout',
  'account-change',
  'logout-after-expiry',
  'account-change-after-expiry',
  'unmounted',
])(
  'only prompts for the still-current authentication expiry: %s',
  async (scenario) => {
    const actual = await vi.importActual<
      typeof import('@/features/review/api/getVisitedReservations')
    >('@/features/review/api/getVisitedReservations')
    vi.mocked(getVisitedReservations).mockImplementation(async (params) => {
      try {
        return await actual.getVisitedReservations(params)
      } catch (error) {
        if (scenario === 'logout-after-expiry') clearAuthSession()
        if (scenario === 'account-change-after-expiry')
          startAuthenticatedSession('account-b')
        throw error
      }
    })
    vi.mocked(apiClient).mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => null,
    } as never)
    let rejectRefresh!: (error: Error) => void
    vi.mocked(requestTokenReissue).mockReturnValue(
      new Promise((_resolve, reject) => {
        rejectRefresh = reject
      }),
    )
    startAuthenticatedSession('expired-token')
    const background =
      scenario === 'concurrent-expiry'
        ? request('api/v1/users/me').catch(() => undefined)
        : undefined
    if (background)
      await waitFor(() => expect(requestTokenReissue).toHaveBeenCalledOnce())
    const { result, onAuthRequired, onReviewUnavailable, unmount } = setup()
    let pending!: Promise<void>
    act(() => {
      pending = result.current.onPressWriteReview()
    })
    await waitFor(() => expect(requestTokenReissue).toHaveBeenCalledOnce())
    await act(async () => {
      if (scenario === 'unmounted') unmount()
      if (scenario === 'logout') clearAuthSession()
      if (scenario === 'account-change') startAuthenticatedSession('account-b')
      rejectRefresh(new HttpStatusError(401))
      await pending
    })

    await background
    expect(onAuthRequired).toHaveBeenCalledTimes(
      scenario === 'expired' || scenario === 'concurrent-expiry' ? 1 : 0,
    )
    expect(onReviewUnavailable).not.toHaveBeenCalled()
    expect(navigate).not.toHaveBeenCalled()
    expect(showToast).not.toHaveBeenCalled()
  },
)
