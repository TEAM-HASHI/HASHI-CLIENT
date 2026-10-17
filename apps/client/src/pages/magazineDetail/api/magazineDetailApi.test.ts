import { afterEach, expect, it, vi } from 'vitest'
import {
  changeMagazineLike,
  getMagazineDetail,
} from '@/pages/magazineDetail/api/magazineDetailApi'
import { request } from '@/shared/api/request'

vi.mock('@/shared/api/request', () => ({ request: vi.fn() }))
afterEach(() => vi.resetAllMocks())

it.each([
  null,
  { magazineId: 2, liked: true, likeCount: 3 },
  { magazineId: 1, liked: true, likeCount: -1 },
])(
  'rejects an invalid like response rather than corrupting the optimistic cache: %j',
  async (response) => {
    vi.mocked(request).mockResolvedValue(response)
    await expect(changeMagazineLike(1, true)).rejects.toThrow(
      'Invalid magazine like response',
    )
  },
)

it('does not turn a null detail response into publishing content', async () => {
  vi.mocked(request).mockResolvedValue(null)
  await expect(
    getMagazineDetail(1, new AbortController().signal),
  ).rejects.toThrow('Invalid magazine detail response')
})
