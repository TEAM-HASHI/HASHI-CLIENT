import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { expect, it, vi } from 'vitest'
import { MapRegionEditor } from '@/pages/mapRegions/MapRegionEditor'
import { mapRegionApi } from '@/features/mapRegion/api/mapRegionApi'

vi.mock('@/features/mapRegion/api/mapRegionApi', () => ({
  mapRegionApi: { save: vi.fn() },
}))

it('preserves the full draft and immutable code after activation fails, blocks duplicate saves and retries without losing settings', async () => {
  const region = {
    mapRegionId: 4,
    code: 'TOKYO_TEST',
    name: '기존 지역',
    clusterPosition: { latitude: 35.5, longitude: 139.5 },
    cameraBounds: { south: 35, north: 36, west: 139, east: 140 },
    displayOrder: 12,
    active: false,
  }
  let fail!: (error: Error) => void
  vi.mocked(mapRegionApi.save)
    .mockImplementationOnce(
      () =>
        new Promise((_resolve, reject) => {
          fail = reject
        }),
    )
    .mockResolvedValue(region)
  const onClose = vi.fn()
  render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { mutations: { retry: false } } })
      }
    >
      <MapRegionEditor region={region} onClose={onClose} />
    </QueryClientProvider>,
  )
  expect(screen.getByRole('textbox', { name: '지역 코드' })).toBeDisabled()
  fireEvent.change(screen.getByRole('textbox', { name: '지역명' }), {
    target: { value: '변경한 지역' },
  })
  fireEvent.click(screen.getByRole('checkbox', { name: '공개' }))
  const form = screen.getByRole('textbox', { name: '지역명' }).closest('form')!
  fireEvent.submit(form)
  fireEvent.submit(form)
  await waitFor(() => expect(mapRegionApi.save).toHaveBeenCalledTimes(1))
  await act(async () => fail(new Error('지도 설정이 준비되지 않았습니다.')))
  await screen.findByText('지도 설정이 준비되지 않았습니다.')
  expect(screen.getByRole('textbox', { name: '지역명' })).toHaveValue(
    '변경한 지역',
  )
  expect(screen.getByRole('checkbox', { name: '공개' })).toBeChecked()
  expect(onClose).not.toHaveBeenCalled()
  fireEvent.submit(form)
  await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1))
  expect(mapRegionApi.save).toHaveBeenLastCalledWith('TOKYO_TEST', {
    name: '변경한 지역',
    clusterPosition: region.clusterPosition,
    cameraBounds: region.cameraBounds,
    displayOrder: 12,
    active: true,
  })
})
