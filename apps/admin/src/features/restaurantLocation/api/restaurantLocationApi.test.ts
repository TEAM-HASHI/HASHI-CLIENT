import { afterEach, describe, expect, it, vi } from 'vitest'
import { request } from '@/shared/api/request'
import { restaurantLocationApi } from '@/features/restaurantLocation/api/restaurantLocationApi'

vi.mock('@/shared/api/request', () => ({ request: vi.fn() }))
afterEach(() => vi.mocked(request).mockReset())

describe('Places response boundaries', () => {
  it.each([
    {
      restaurantId: 7,
      addressRevision: 4,
      candidates: [{ url: 'https://image.example', width: 100, height: 100 }],
    },
    { restaurantId: 8, addressRevision: 4, candidates: [] },
    { restaurantId: 7, addressRevision: 3, candidates: [] },
  ])(
    'rejects mismatched or malformed candidates instead of accepting the colliding image schema',
    async (body) => {
      vi.mocked(request).mockResolvedValue(body)
      await expect(restaurantLocationApi.candidates(7, 4)).rejects.toThrow(
        '장소 후보 응답을 확인할 수 없습니다',
      )
    },
  )
})
