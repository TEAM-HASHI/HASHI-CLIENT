import { describe, expect, it } from 'vitest'

import { createRestaurantPhotoSource } from '@/features/restaurantDetail/mocks/createRestaurantPhotoSource'
import type { RestaurantPhotoFixture } from '@/features/restaurantDetail/mocks/createRestaurantPhotoSource'

const photo = (
  id: string,
  category: RestaurantPhotoFixture['category'],
  overrides: Partial<RestaurantPhotoFixture> = {},
): RestaurantPhotoFixture => ({
  id,
  originalId: id,
  restaurantId: 10,
  category,
  thumbnailUrl: `https://example.com/${id}-small.webp`,
  imageUrl: `https://example.com/${id}.webp`,
  width: 800,
  height: 600,
  order: 0,
  publishedAt: '2026-09-01T00:00:00Z',
  isPublic: true,
  ...overrides,
})

describe('createRestaurantPhotoSource', () => {
  it('interleaves one representative and three review photos before menu photos', async () => {
    const source = createRestaurantPhotoSource([
      photo('menu', 'menu'),
      photo('hero2', 'representative', { order: 2 }),
      photo('review4', 'review', { publishedAt: '2026-09-01T00:00:00Z' }),
      photo('review2', 'review', { publishedAt: '2026-09-03T00:00:00Z' }),
      photo('review1', 'review', { publishedAt: '2026-09-04T00:00:00Z' }),
      photo('hero1', 'representative', { order: 1 }),
      photo('review3', 'review', { publishedAt: '2026-09-02T00:00:00Z' }),
    ])

    const page = await source.getPage({ restaurantId: 10, filter: 'all' })
    expect(page.photos.map(({ id }) => id)).toEqual([
      'hero1',
      'review1',
      'review2',
      'review3',
      'hero2',
      'review4',
      'menu',
    ])
  })

  it('deduplicates originals in all while keeping independent category counts', async () => {
    const source = createRestaurantPhotoSource([
      photo('hero', 'representative', { originalId: 'shared' }),
      photo('menu', 'menu', { originalId: 'shared' }),
      photo('review', 'review'),
      photo('hidden', 'review', { isPublic: false }),
      photo('other', 'representative', { restaurantId: 20 }),
    ])
    const all = await source.getPage({ restaurantId: 10, filter: 'all' })
    const menu = await source.getPage({ restaurantId: 10, filter: 'menu' })

    expect(all.photos.map(({ id }) => id)).toEqual(['hero', 'review'])
    expect(all.counts).toEqual({
      all: 2,
      representative: 1,
      menu: 1,
      review: 1,
    })
    expect(menu.counts).toEqual(all.counts)
    expect(menu.photos.map(({ id }) => id)).toEqual(['menu'])
  })

  it('returns 20 photos per page without overlap and terminates the last page', async () => {
    const source = createRestaurantPhotoSource(
      Array.from({ length: 45 }, (_, index) =>
        photo(`menu${index}`, 'menu', { order: index }),
      ),
    )
    const first = await source.getPage({ restaurantId: 10, filter: 'all' })
    const second = await source.getPage({
      restaurantId: 10,
      filter: 'all',
      cursor: first.nextCursor,
    })
    const last = await source.getPage({
      restaurantId: 10,
      filter: 'all',
      cursor: second.nextCursor,
    })

    expect([
      first.photos.length,
      second.photos.length,
      last.photos.length,
    ]).toEqual([20, 20, 5])
    expect(last.nextCursor).toBeUndefined()
    expect(
      new Set(
        [...first.photos, ...second.photos, ...last.photos].map(({ id }) => id),
      ).size,
    ).toBe(45)
    expect(last.counts.all).toBe(45)
  })

  it('keeps remaining sources when representative photos are absent', async () => {
    const source = createRestaurantPhotoSource([
      photo('menu', 'menu'),
      photo('review', 'review'),
    ])
    const page = await source.getPage({ restaurantId: 10, filter: 'all' })
    expect(page.photos.map(({ id }) => id)).toEqual(['review', 'menu'])
  })

  it('returns an empty selected category without losing total count', async () => {
    const source = createRestaurantPhotoSource([
      photo('hero', 'representative'),
    ])
    const page = await source.getPage({ restaurantId: 10, filter: 'review' })
    expect(page.photos).toEqual([])
    expect(page.counts.all).toBe(1)
    expect(page.counts.review).toBe(0)
    expect(page.nextCursor).toBeUndefined()
  })

  it('does not reuse a cursor after changing the filter or restaurant', async () => {
    const source = createRestaurantPhotoSource(
      Array.from({ length: 21 }, (_, index) => photo(`menu${index}`, 'menu')),
    )
    const first = await source.getPage({ restaurantId: 10, filter: 'all' })
    await expect(
      source.getPage({
        restaurantId: 10,
        filter: 'menu',
        cursor: first.nextCursor,
      }),
    ).rejects.toThrow()
    await expect(
      source.getPage({
        restaurantId: 20,
        filter: 'all',
        cursor: first.nextCursor,
      }),
    ).rejects.toThrow()
  })

  it('honors cancellation without exposing mock data', async () => {
    const controller = new AbortController()
    controller.abort()
    const source = createRestaurantPhotoSource([
      photo('hero', 'representative'),
    ])
    await expect(
      source.getPage({
        restaurantId: 10,
        filter: 'all',
        signal: controller.signal,
      }),
    ).rejects.toMatchObject({ name: 'AbortError' })
  })
})
