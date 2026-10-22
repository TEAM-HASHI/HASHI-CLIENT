import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { RestaurantLocationPanel } from '@/features/restaurantLocation/components/RestaurantLocationPanel'
import { restaurantLocationApi } from '@/features/restaurantLocation/api/restaurantLocationApi'
import type { PlaceCandidates } from '@/features/restaurantLocation/api/restaurantLocationApi'
import { locationKeys } from '@/features/restaurantLocation/queries/locationQueries'
import { AdminApiRequestError } from '@/shared/api/request'

vi.mock('@/features/restaurantLocation/api/restaurantLocationApi', () => ({
  restaurantLocationApi: {
    status: vi.fn(),
    retry: vi.fn(),
    candidates: vi.fn(),
    select: vi.fn(),
  },
}))

const status = {
  restaurantId: 7,
  locationStatus: 'REVIEW_REQUIRED' as const,
  addressRevision: 4,
  canRetry: true,
}
const candidate = () => ({
  displayName: '실제 매장',
  address: '東京都',
  latitude: 35.68,
  longitude: 139.76,
  selectionToken: 'signed-token',
  selectionExpiresAt: new Date(Date.now() + 600_000).toISOString(),
})
const openPanel = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const view = render(
    <QueryClientProvider client={client}>
      <RestaurantLocationPanel restaurantId={7} />
    </QueryClientProvider>,
  )
  return { client, ...view }
}

describe('restaurant location actions', () => {
  beforeEach(() => {
    vi.mocked(restaurantLocationApi.status)
      .mockReset()
      .mockResolvedValue(status)
    vi.mocked(restaurantLocationApi.candidates)
      .mockReset()
      .mockResolvedValue({
        restaurantId: 7,
        addressRevision: 4,
        candidates: [candidate()],
      })
    vi.mocked(restaurantLocationApi.select)
      .mockReset()
      .mockResolvedValue({
        ...status,
        locationStatus: 'PENDING',
        canRetry: false,
      })
    vi.mocked(restaurantLocationApi.retry).mockReset()
  })
  afterEach(() => vi.restoreAllMocks())

  it('only searches on demand, submits the signed selection and does not treat PENDING as a completed location', async () => {
    openPanel()
    const search = await screen.findByRole('button', {
      name: 'Google Places 후보 검색',
    })
    expect(restaurantLocationApi.candidates).not.toHaveBeenCalled()
    fireEvent.click(search)
    fireEvent.click(search)
    await screen.findByText('실제 매장')
    expect(restaurantLocationApi.candidates).toHaveBeenCalledTimes(1)
    expect(restaurantLocationApi.candidates).toHaveBeenCalledWith(
      7,
      4,
      expect.any(AbortSignal),
    )
    fireEvent.click(screen.getByRole('button', { name: '이 장소 선택' }))
    fireEvent.click(
      within(screen.getByRole('alertdialog')).getByRole('button', {
        name: '위치 교체 요청',
      }),
    )
    await screen.findByText(/접수 성공은 위치 확정이 아닙니다/)
    expect(restaurantLocationApi.select).toHaveBeenCalledWith(
      7,
      4,
      'signed-token',
      expect.any(AbortSignal),
    )
    expect(
      screen.queryByRole('button', { name: '이 장소 선택' }),
    ).not.toBeInTheDocument()
  })

  it('invalidates candidates on 409 without automatically repeating a paid search', async () => {
    vi.mocked(restaurantLocationApi.select).mockRejectedValue(
      new AdminApiRequestError(409, {
        success: false,
        code: 'RESTAURANT-028',
        message: '현재 위치 상태를 다시 확인해주세요',
        data: null,
        path: '',
        timestamp: '',
      }),
    )
    openPanel()
    fireEvent.click(
      await screen.findByRole('button', { name: 'Google Places 후보 검색' }),
    )
    await screen.findByText('실제 매장')
    fireEvent.click(screen.getByRole('button', { name: '이 장소 선택' }))
    fireEvent.click(
      within(screen.getByRole('alertdialog')).getByRole('button', {
        name: '위치 교체 요청',
      }),
    )
    await screen.findByText('현재 위치 상태를 다시 확인해주세요')
    expect(
      screen.queryByRole('button', { name: '이 장소 선택' }),
    ).not.toBeInTheDocument()
    expect(restaurantLocationApi.candidates).toHaveBeenCalledTimes(1)
    expect(restaurantLocationApi.select).toHaveBeenCalledTimes(1)
  })

  it('does not select a token that expires while confirmation is open', async () => {
    const item = candidate()
    vi.mocked(restaurantLocationApi.candidates).mockResolvedValue({
      restaurantId: 7,
      addressRevision: 4,
      candidates: [item],
    })
    openPanel()
    fireEvent.click(
      await screen.findByRole('button', { name: 'Google Places 후보 검색' }),
    )
    await screen.findByText('실제 매장')
    fireEvent.click(screen.getByRole('button', { name: '이 장소 선택' }))
    vi.spyOn(Date, 'now').mockReturnValue(
      Date.parse(item.selectionExpiresAt) + 1,
    )
    fireEvent.click(
      within(screen.getByRole('alertdialog')).getByRole('button', {
        name: '위치 교체 요청',
      }),
    )
    await screen.findByText('장소 후보가 만료되었습니다. 다시 검색해주세요.')
    expect(restaurantLocationApi.select).not.toHaveBeenCalled()
  })

  it('prevents selection after a revision change and aborts an in-flight search when leaving', async () => {
    const { client, unmount } = openPanel()
    fireEvent.click(
      await screen.findByRole('button', { name: 'Google Places 후보 검색' }),
    )
    await screen.findByText('실제 매장')
    fireEvent.click(screen.getByRole('button', { name: '이 장소 선택' }))
    await act(async () => {
      client.setQueryData(locationKeys.status(7), {
        ...status,
        addressRevision: 5,
      })
    })
    await waitFor(() =>
      expect(
        within(screen.getByRole('alertdialog')).getByRole('button', {
          name: '위치 교체 요청',
        }),
      ).toBeDisabled(),
    )
    expect(restaurantLocationApi.select).not.toHaveBeenCalled()
    fireEvent.click(
      within(screen.getByRole('alertdialog')).getByRole('button', {
        name: '취소',
      }),
    )
    let finish!: (value: PlaceCandidates) => void
    vi.mocked(restaurantLocationApi.candidates).mockReturnValue(
      new Promise((resolve) => {
        finish = resolve
      }),
    )
    fireEvent.click(
      screen.getByRole('button', { name: 'Google Places 후보 검색' }),
    )
    await waitFor(() =>
      expect(restaurantLocationApi.candidates).toHaveBeenCalledTimes(2),
    )
    const signal = vi.mocked(restaurantLocationApi.candidates).mock.calls[1][2]!
    unmount()
    expect(signal.aborted).toBe(true)
    await act(async () =>
      finish({
        restaurantId: 7,
        addressRevision: 4,
        candidates: [candidate()],
      }),
    )
  })
})
