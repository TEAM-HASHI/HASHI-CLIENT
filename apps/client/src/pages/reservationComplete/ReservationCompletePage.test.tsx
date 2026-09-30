import '@testing-library/jest-dom/vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { getReservationDetail } from '@/features/reservation/api/getReservationDetail'
import { reservationCompletionQueryKeys } from '@/features/reservation/queries/reservationCompletion'
import type { ReservationCompletionResponse } from '@/features/reservation/queries/reservationCompletion'
import { ReservationCompletePage } from '@/pages/reservationComplete/ReservationCompletePage'

vi.mock('@/features/reservation/api/getReservationDetail', () => ({
  getReservationDetail: vi.fn(),
}))

const response: ReservationCompletionResponse = {
  reservationId: 12,
  reservationType: 'STANDARD',
  reserverName: '김하시',
  reservationStatus: 'REQUESTED',
  restaurantAddress: '도쿄 키츠라멘 본점도쿄',
  reservedAt: '2026-06-01T11:00:00',
  adultCount: 2,
  teenCount: 0,
  childCount: 0,
}

const renderPage = (
  completion: ReservationCompletionResponse | null = response,
  path = '/reservations/12/complete',
) => {
  const queryClient = new QueryClient()
  if (completion)
    queryClient.setQueryData(
      reservationCompletionQueryKeys.detail(12),
      completion,
    )
  const router = createMemoryRouter(
    [
      { path: '/', element: <h1>홈 화면</h1> },
      { path: '/input', element: <h1>예약 입력</h1> },
      { path: '/request', element: <h1>예약 확인</h1> },
      {
        path: '/reservations/:reservationId/complete',
        element: <ReservationCompletePage />,
      },
    ],
    {
      initialEntries: [
        '/input',
        '/request',
        { pathname: path, state: response },
      ],
      initialIndex: 2,
    },
  )
  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
  return { router, queryClient }
}

describe('ReservationCompletePage', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('shows the creation response and fixed progress without another detail request', async () => {
    renderPage()
    expect(
      await screen.findByRole('heading', { name: '식당 예약 요청 완료!' }),
    ).toBeInTheDocument()
    expect(getReservationDetail).not.toHaveBeenCalled()
    const steps = within(
      screen.getByRole('list', { name: '예약 진행 단계' }),
    ).getAllByRole('listitem')
    expect(steps.map((step) => step.textContent)).toEqual([
      '예약 접수',
      'Hashi에서 검토',
      '예약 확정',
    ])
    expect(steps[1]).toHaveAttribute('aria-current', 'step')
    expect(screen.getByText('김하시')).toBeInTheDocument()
    expect(screen.getByText('어른 2명')).toBeInTheDocument()
    expect(screen.getByText('2026.6.1. 11:00')).toBeInTheDocument()
  })

  it('replaces completion with home, clears the response and prevents completion replay', async () => {
    const { router, queryClient } = renderPage()
    fireEvent.click(screen.getByRole('button', { name: '확인 완료' }))
    await screen.findByRole('heading', { name: '홈 화면' })
    expect(
      queryClient.getQueryData(reservationCompletionQueryKeys.detail(12)),
    ).toBeUndefined()
    await act(() => router.navigate('/reservations/12/complete'))
    await screen.findByRole('heading', { name: '홈 화면' })
  })

  it('redirects browser back to home instead of the reservation form', async () => {
    const { router } = renderPage()
    await act(() => router.navigate(-1))
    await screen.findByRole('heading', { name: '홈 화면' })
    expect(router.state.location.pathname).toBe('/')
    expect(
      screen.queryByRole('heading', { name: '예약 확인' }),
    ).not.toBeInTheDocument()
  })

  it('redirects reload or direct entry without an in-memory response even when history state remains', async () => {
    renderPage(null)
    await screen.findByRole('heading', { name: '홈 화면' })
    expect(getReservationDetail).not.toHaveBeenCalled()
  })

  it.each([
    { reserverName: undefined },
    { restaurantAddress: '' },
    { reservedAt: 'invalid' },
    { adultCount: undefined },
    { reservationStatus: undefined },
    { reservationId: 99 },
    { adultCount: 0, teenCount: 0, childCount: 0 },
  ])(
    'redirects an incomplete creation response to home: %j',
    async (invalid) => {
      const { router } = renderPage({ ...response, ...invalid })
      await waitFor(() => expect(router.state.location.pathname).toBe('/'))
      expect(getReservationDetail).not.toHaveBeenCalled()
    },
  )
})
