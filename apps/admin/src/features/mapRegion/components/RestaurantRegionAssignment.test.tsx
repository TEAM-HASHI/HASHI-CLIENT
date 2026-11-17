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
  mapRegionApi: { list: vi.fn(), getAssignment: vi.fn(), assign: vi.fn() },
}))
const firstPage = {
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
}

beforeEach(() => {
  vi.mocked(mapRegionApi.getAssignment).mockReset()
  vi.mocked(mapRegionApi.getAssignment).mockResolvedValue({
    restaurantId: 7,
    mapRegionId: 5,
  })
  vi.mocked(mapRegionApi.list).mockReset()
  vi.mocked(mapRegionApi.list).mockResolvedValue(firstPage)
  vi.mocked(mapRegionApi.assign).mockReset()
})

const renderAssignment = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={client}>
      <RestaurantRegionAssignment restaurantId={7} />
    </QueryClientProvider>,
  )
}

it('distinguishes lookup failure from unassignment and restores the current selection after retry', async () => {
  vi.mocked(mapRegionApi.list)
    .mockResolvedValueOnce({
      ...firstPage,
      content: [{ ...firstPage.content[0], mapRegionId: 5 }],
      totalCount: 2,
      totalPages: 2,
    })
    .mockResolvedValueOnce({
      ...firstPage,
      page: 1,
      totalCount: 2,
      totalPages: 2,
    })
  vi.mocked(mapRegionApi.getAssignment)
    .mockRejectedValueOnce(new Error('권한이 없습니다.'))
    .mockResolvedValueOnce({ restaurantId: 7, mapRegionId: 4 })
  renderAssignment()
  await screen.findByText('현재 배정: 조회 실패')
  expect(screen.getByRole('combobox')).toBeDisabled()
  expect(screen.queryByText('현재 배정: 미배정')).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: '현재 배정 다시 조회' }))
  await screen.findByText('현재 배정: 비공개 지역 (비공개)')
  expect(screen.getByRole('combobox')).toHaveValue('4')
  expect(screen.getByRole('button', { name: '지역 배정' })).toBeDisabled()
})

it('allows inactive assignment, retains selection after failure and reflects assignment and unassignment', async () => {
  renderAssignment()
  await screen.findByText('현재 배정: 지역 ID 5')
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
  vi.mocked(mapRegionApi.assign).mockResolvedValueOnce({
    restaurantId: 7,
    mapRegionId: 4,
  })
  fireEvent.click(
    within(screen.getByRole('alertdialog')).getByRole('button', {
      name: '배정',
    }),
  )
  await screen.findByText('현재 배정: 비공개 지역 (비공개)')
  fireEvent.click(screen.getByRole('button', { name: '소속 해제' }))
  expect(mapRegionApi.assign).toHaveBeenCalledTimes(2)
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
  expect(mapRegionApi.assign).toHaveBeenCalledTimes(3)
  expect(mapRegionApi.assign).toHaveBeenLastCalledWith(
    7,
    null,
    expect.any(AbortSignal),
  )
  await act(async () => finish({ restaurantId: 7, mapRegionId: null }))
  await screen.findByText('현재 배정: 미배정')
  expect(screen.getByRole('combobox')).toHaveValue('')
})

it('aborts a pending assignment on departure and ignores its late result', async () => {
  let finish!: (value: { restaurantId: number; mapRegionId: null }) => void
  vi.mocked(mapRegionApi.assign).mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finish = resolve
      }),
  )
  const { unmount } = renderAssignment()
  await screen.findByText('현재 배정: 지역 ID 5')
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
