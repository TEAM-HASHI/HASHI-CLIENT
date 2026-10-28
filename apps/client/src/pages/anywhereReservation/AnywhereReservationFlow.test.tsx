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

import { pointQueryKeys } from '@/features/point/queries/pointQueryKeys'
import { AnywhereReservationPage } from '@/pages/anywhereReservation/AnywhereReservationPage'
import { createReservation } from '@/pages/reservationRequest/api/createReservation'
import { ReservationRequestPage } from '@/pages/reservationRequest/ReservationRequestPage'

vi.mock('@/features/point/api/getMyPointBalance', () => ({
  getMyPointBalance: vi.fn().mockResolvedValue({ availablePoint: 7_000 }),
}))
vi.mock('@/pages/reservationRequest/api/createReservation', () => ({
  createReservation: vi.fn(),
}))

describe('anywhere reservation history', () => {
  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  it.each([false, true])(
    'restores inputs and exits without duplicate history (expired: %s)',
    async (expired) => {
      vi.useFakeTimers({ toFake: ['Date'] })
      vi.setSystemTime(new Date(2026, 5, 1, 9))
      const queryClient = new QueryClient({
        defaultOptions: { queries: { staleTime: Infinity, retry: false } },
      })
      queryClient.setQueryData(pointQueryKeys.myBalance(), {
        availablePoint: 7_000,
      })
      const router = createMemoryRouter(
        [
          { path: '/', element: <h1>홈</h1> },
          {
            path: '/reservations/anywhere',
            element: <AnywhereReservationPage />,
          },
          {
            path: '/reservations/request',
            element: <ReservationRequestPage />,
          },
        ],
        { initialEntries: ['/', '/reservations/anywhere'] },
      )
      render(
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>,
      )

      fireEvent.change(screen.getByLabelText('식당명'), {
        target: { value: '가'.repeat(100) },
      })
      fireEvent.change(screen.getByLabelText('식당 주소'), {
        target: { value: '나'.repeat(255) },
      })
      fireEvent.change(screen.getByLabelText('예약자명'), {
        target: { value: '김하시' },
      })
      fireEvent.change(screen.getByLabelText('요청사항 (선택)'), {
        target: { value: '창가 부탁드립니다' },
      })
      fireEvent.click(screen.getByRole('button', { name: '어른 인원 늘리기' }))
      fireEvent.click(screen.getByRole('button', { name: '2026년 6월 2일' }))
      fireEvent.click(screen.getByRole('button', { name: '23:30' }))
      fireEvent.click(screen.getByRole('button', { name: '다음' }))
      expect(
        await screen.findByRole('button', { name: '예약 요청' }),
      ).toBeInTheDocument()
      if (expired) {
        fireEvent.click(screen.getByRole('button', { name: '예약 요청' }))
        vi.setSystemTime(new Date(2026, 5, 2, 0, 0, 1))
        fireEvent.click(
          within(screen.getByRole('alertdialog')).getByRole('button', {
            name: '예약',
          }),
        )
        expect(createReservation).not.toHaveBeenCalled()
      } else {
        fireEvent.click(screen.getByRole('button', { name: '뒤로가기' }))
      }
      expect(await screen.findByLabelText('식당명')).toHaveValue(
        '가'.repeat(100),
      )
      expect(screen.getByLabelText('식당 주소')).toHaveValue('나'.repeat(255))
      expect(screen.getByLabelText('예약자명')).toHaveValue('김하시')
      expect(screen.getByLabelText('요청사항 (선택)')).toHaveValue(
        '창가 부탁드립니다',
      )
      expect(
        screen.getByRole('button', { name: '다음' }).hasAttribute('disabled'),
      ).toBe(expired)

      fireEvent.click(screen.getByRole('button', { name: '뒤로가기' }))
      fireEvent.click(screen.getByRole('button', { name: '그만두기' }))
      await waitFor(() => expect(router.state.location.pathname).toBe('/'))
      await act(() => router.navigate(1))
      expect(await screen.findByLabelText('식당명')).toHaveValue('')
      expect(screen.getByRole('button', { name: '다음' })).toBeDisabled()
    },
  )
})
