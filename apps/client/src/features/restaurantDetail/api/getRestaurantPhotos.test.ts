import { afterEach, beforeEach, expect, it, vi } from 'vitest'

import { getRestaurantPhotoDataSource } from '@/features/restaurantDetail/api/restaurantPhotoSource'
import { request } from '@/shared/api/request'

vi.mock('@/shared/api/request', () => ({ request: vi.fn() }))
const mockedRequest = vi.mocked(request)
const counts = { all: 4, representative: 3, menu: 1, review: 2 }
const response = {
  restaurantId: 10,
  filter: 'ALL',
  counts,
  totalCount: 4,
  photos: [
    {
      photoId: 'REPRESENTATIVE:1',
      type: 'REPRESENTATIVE',
      imageUrl: '/legacy.jpg',
      image: null,
    },
  ],
  hasNext: false,
  nextCursor: null,
}
const getPage = (
  filter: 'all' | 'representative' | 'menu' | 'review' = 'all',
  cursor?: string,
  signal?: AbortSignal,
) => {
  const dataSource = getRestaurantPhotoDataSource()
  expect(dataSource).not.toBeNull()
  return dataSource!.source.getPage({
    restaurantId: 10,
    filter,
    cursor,
    signal,
  })
}
beforeEach(() => {
  vi.stubEnv('DEV', false)
  mockedRequest.mockResolvedValue(response)
})
afterEach(() => {
  vi.resetAllMocks()
  vi.unstubAllEnvs()
})

it('loads real photos in production without a size parameter and preserves server counts', async () => {
  const signal = new AbortController().signal
  const page = await getPage('all', undefined, signal)
  expect(mockedRequest).toHaveBeenCalledWith('/api/v1/restaurants/10/photos', {
    searchParams: { filter: 'ALL' },
    signal,
    cache: 'no-store',
  })
  expect(page.counts).toEqual(counts)
  expect(page.photos[0]).toMatchObject({
    id: 'REPRESENTATIVE:1',
    imageUrl: '/legacy.jpg',
    thumbnailUrl: '/legacy.jpg',
  })
  expect(page.photos[0]?.width).toBeUndefined()
  expect(page.photos[0]?.height).toBeUndefined()
  expect(page.nextCursor).toBeUndefined()
})

it.each([
  ['all', 'ALL'],
  ['representative', 'REPRESENTATIVE'],
  ['menu', 'MENU'],
  ['review', 'REVIEW'],
] as const)(
  'maps %s and forwards its opaque cursor unchanged',
  async (filter, apiFilter) => {
    mockedRequest.mockResolvedValue({
      ...response,
      filter: apiFilter,
      hasNext: true,
      nextCursor: 'opaque-next',
    })
    const page = await getPage(filter, 'opaque-current')
    expect(mockedRequest).toHaveBeenLastCalledWith(
      '/api/v1/restaurants/10/photos',
      expect.objectContaining({
        searchParams: { filter: apiFilter, cursor: 'opaque-current' },
      }),
    )
    expect(page.nextCursor).toBe('opaque-next')
  },
)

it('uses READY derivatives and retains unavailable photos as fallback slots, never legacy asset URLs', async () => {
  mockedRequest.mockResolvedValue({
    ...response,
    photos: [
      {
        photoId: 'REVIEW:1',
        imageUrl: '/old.jpg',
        image: {
          status: 'READY',
          defaultSource: { url: '/detail.webp', width: 800, height: 1200 },
        },
      },
      ...['PROCESSING', 'FAILED', 'UNAVAILABLE'].map((status) => ({
        photoId: status,
        imageUrl: '/old.jpg',
        image: { status },
      })),
    ],
  })
  const page = await getPage()
  expect(page.photos[0]).toEqual({
    id: 'REVIEW:1',
    imageUrl: '/detail.webp',
    thumbnailUrl: '/detail.webp',
    width: 800,
    height: 1200,
  })
  expect(page.photos.slice(1).map(({ imageUrl }) => imageUrl)).toEqual([
    '',
    '',
    '',
  ])
})

it('accepts a successful empty page', async () => {
  mockedRequest.mockResolvedValue({
    ...response,
    photos: [],
    counts: { all: 0, representative: 0, menu: 0, review: 0 },
    totalCount: 0,
  })
  expect((await getPage()).photos).toEqual([])
})

it.each([
  { restaurantId: 20 },
  { filter: 'MENU' },
  { photos: null },
  { counts: null },
  { hasNext: true, nextCursor: null },
  { hasNext: true, nextCursor: 'current' },
  { photos: [{ imageUrl: '/missing-id.jpg' }] },
])('rejects a malformed or mismatched photo page: %j', async (override) => {
  mockedRequest.mockResolvedValue({ ...response, ...override })
  await expect(getPage('all', 'current')).rejects.toThrow()
})
