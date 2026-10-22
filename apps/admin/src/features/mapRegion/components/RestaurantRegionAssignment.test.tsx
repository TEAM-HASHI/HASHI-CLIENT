import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, expect, it, vi } from 'vitest'
import { RestaurantRegionAssignment } from '@/features/mapRegion/components/RestaurantRegionAssignment'
import { mapRegionApi } from '@/features/mapRegion/api/mapRegionApi'

vi.mock('@/features/mapRegion/api/mapRegionApi', () => ({
  mapRegionApi: { list: vi.fn(), assign: vi.fn() },
}))
beforeEach(() => {
  vi.mocked(mapRegionApi.list).mockResolvedValue({
    content: [
      {
        mapRegionId: 4,
        code: 'TOKYO_TEST',
        name: '비공개 지역',
        active: false,
        displayOrder: 0,
        clusterPosition: { latitude: 35.5, longitude: 139.5 },
        cameraBounds: { south: 35, north: 36, west: 139, east: 140 },
      },
    ],
    page: 0,
    size: 20,
    totalCount: 1,
    totalPages: 1,
  })
  vi.mocked(mapRegionApi.assign).mockReset()
})

it('allows inactive assignment, retains selection after failure and requires explicit confirmation for null unassignment', async () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  render(
    <QueryClientProvider client={client}>
      <RestaurantRegionAssignment restaurantId={7} />
    </QueryClientProvider>,
  )
  await screen.findByRole('option', { name: /비공개 지역/ })
  expect(mapRegionApi.assign).not.toHaveBeenCalled()
  fireEvent.change(screen.getByRole('combobox'), { target: { value: '4' } })
  fireEvent.click(screen.getByRole('button', { name: '지역 배정' }))
  vi.mocked(mapRegionApi.assign).mockRejectedValueOnce(
    new Error('지역을 찾을 수 없습니다.'),
  )
  fireEvent.click(
    within(screen.getByRole('alertdialog')).getByRole('button', {
      name: '배정',
    }),
  )
  await screen.findByText('지역을 찾을 수 없습니다.')
  expect(screen.getByRole('combobox', { hidden: true })).toHaveValue('4')
  fireEvent.click(
    within(screen.getByRole('alertdialog')).getByRole('button', {
      name: '취소',
    }),
  )
  fireEvent.click(screen.getByRole('button', { name: '소속 해제' }))
  expect(mapRegionApi.assign).toHaveBeenCalledTimes(1)
  let finish!: (value: { restaurantId: number; mapRegionId: null }) => void
  vi.mocked(mapRegionApi.assign).mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finish = resolve
      }),
  )
  const confirm = within(screen.getByRole('alertdialog')).getByRole('button', {
    name: '해제',
  })
  fireEvent.click(confirm)
  fireEvent.click(confirm)
  expect(mapRegionApi.assign).toHaveBeenCalledTimes(2)
  expect(mapRegionApi.assign).toHaveBeenLastCalledWith(
    7,
    null,
    expect.any(AbortSignal),
  )
  await act(async () => finish({ restaurantId: 7, mapRegionId: null }))
  await screen.findByText('지역 소속을 해제했습니다.')
})

it('aborts a pending assignment on departure and ignores its late result', async () => {
  const client = new QueryClient()
  let finish!: (value: { restaurantId: number; mapRegionId: null }) => void
  vi.mocked(mapRegionApi.assign).mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finish = resolve
      }),
  )
  const { unmount } = render(
    <QueryClientProvider client={client}>
      <RestaurantRegionAssignment restaurantId={7} />
    </QueryClientProvider>,
  )
  fireEvent.click(screen.getByRole('button', { name: '소속 해제' }))
  fireEvent.click(
    within(screen.getByRole('alertdialog')).getByRole('button', {
      name: '해제',
    }),
  )
  await waitFor(() => expect(mapRegionApi.assign).toHaveBeenCalledTimes(1))
  const signal = vi.mocked(mapRegionApi.assign).mock.calls[0][2]!
  unmount()
  expect(signal.aborted).toBe(true)
  await act(async () => finish({ restaurantId: 7, mapRegionId: null }))
})
