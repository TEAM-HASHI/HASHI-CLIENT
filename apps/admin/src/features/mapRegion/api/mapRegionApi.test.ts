import { afterEach, expect, it, vi } from 'vitest'
import { request } from '@/shared/api/request'
import { mapRegionApi } from '@/features/mapRegion/api/mapRegionApi'

vi.mock('@/shared/api/request', () => ({ request: vi.fn() }))
afterEach(() => vi.mocked(request).mockReset())

it('reads an explicit unassigned value without writing and rejects malformed responses', async () => {
  vi.mocked(request).mockResolvedValueOnce({
    restaurantId: 7,
    mapRegionId: null,
  })
  await expect(mapRegionApi.getAssignment(7)).resolves.toEqual({
    restaurantId: 7,
    mapRegionId: null,
  })
  expect(request).toHaveBeenCalledWith(
    '/api/v1/admin/restaurants/7/map-region',
    {
      cache: 'no-store',
      signal: undefined,
    },
  )
  for (const response of [
    { restaurantId: 7 },
    { restaurantId: 7, mapRegionId: 0 },
    { restaurantId: 8, mapRegionId: 4 },
  ]) {
    vi.mocked(request).mockResolvedValueOnce(response)
    await expect(mapRegionApi.getAssignment(7)).rejects.toThrow(/응답/)
  }
})

it('sends explicit null to unassign without changing restaurant address or coordinates', async () => {
  vi.mocked(request).mockResolvedValue({ restaurantId: 7, mapRegionId: null })
  await expect(mapRegionApi.assign(7, null)).resolves.toEqual({
    restaurantId: 7,
    mapRegionId: null,
  })
  expect(request).toHaveBeenCalledWith(
    '/api/v1/admin/restaurants/7/map-region',
    expect.objectContaining({ method: 'put', json: { mapRegionId: null } }),
  )
})

it('does not treat a missing or mismatched assignment as successful unassignment', async () => {
  vi.mocked(request).mockResolvedValue({ restaurantId: 7 })
  await expect(mapRegionApi.assign(7, null)).rejects.toThrow(/응답/)
  vi.mocked(request).mockResolvedValue({ restaurantId: 8, mapRegionId: 4 })
  await expect(mapRegionApi.assign(7, 4)).rejects.toThrow(/응답/)
})
