import { beforeEach, describe, expect, it, vi } from 'vitest'

import { request } from '@/shared/api/request'

import { getRestaurantMenus } from '@/features/restaurantDetail/api/getRestaurantMenus'
import { getRestaurantMenu } from '@/features/restaurantDetail/api/getRestaurantMenu'
import { getRandomRestaurantRecommendation } from '@/features/restaurantDetail/api/getRandomRestaurantRecommendation'
import { getRestaurantReviews } from '@/features/restaurantDetail/api/getRestaurantReviews'
import { getRestaurantSummary } from '@/features/restaurantDetail/api/getRestaurantSummary'
import { getRestaurantPhotoDataSource } from '@/features/restaurantDetail/api/restaurantPhotoSource'

vi.mock('@/shared/api/request', () => ({
  request: vi.fn(),
}))

const mockedRequest = vi.mocked(request)

describe('restaurant detail API', () => {
  beforeEach(() => {
    mockedRequest.mockReset()
  })

  it('loads real photos in production and preserves legacy and unavailable images', async () => {
    vi.stubEnv('DEV', false)
    const signal = new AbortController().signal
    mockedRequest.mockResolvedValue({
      restaurantId: 10,
      filter: 'ALL',
      counts: { all: 3, representative: 1, menu: 1, review: 1 },
      totalCount: 3,
      photos: [
        {
          photoId: 'REVIEW:1',
          image: {
            status: 'READY',
            defaultSource: { url: '/ready.webp', width: 400, height: 800 },
          },
        },
        { photoId: 'MENU:2', image: null, imageUrl: '/legacy.webp' },
        {
          photoId: 'REPRESENTATIVE:3',
          image: { status: 'UNAVAILABLE' },
          imageUrl: '/must-not-use.webp',
        },
      ],
      hasNext: false,
      nextCursor: null,
    })
    try {
      const page = await getRestaurantPhotoDataSource()!.source.getPage({
        restaurantId: 10,
        filter: 'all',
        signal,
      })
      expect(page.photos.map(({ imageUrl }) => imageUrl)).toEqual([
        '/ready.webp',
        '/legacy.webp',
        '',
      ])
      expect(page.photos[0]).toMatchObject({ width: 400, height: 800 })
      expect(page.nextCursor).toBeUndefined()
      expect(mockedRequest).toHaveBeenCalledWith(
        '/api/v1/restaurants/10/photos',
        {
          searchParams: { filter: 'ALL' },
          signal,
          cache: 'no-store',
        },
      )
    } finally {
      vi.unstubAllEnvs()
    }
  })

  it.each([
    { restaurantId: 20, filter: 'REVIEW', hasNext: false },
    { restaurantId: 10, filter: 'MENU', hasNext: false },
    { restaurantId: 10, filter: 'REVIEW', hasNext: true, nextCursor: 'same' },
    { restaurantId: 10, filter: 'REVIEW', hasNext: true, nextCursor: null },
  ])(
    'rejects mismatched photo pages or unusable continuation cursors: %j',
    async (response) => {
      mockedRequest.mockResolvedValue({
        counts: { all: 0, representative: 0, menu: 0, review: 0 },
        totalCount: 0,
        photos: [],
        ...response,
      })
      await expect(
        getRestaurantPhotoDataSource()!.source.getPage({
          restaurantId: 10,
          filter: 'review',
          cursor: 'same',
        }),
      ).rejects.toThrow()
    },
  )

  it.each([
    null,
    { content: [], hasNext: true },
    { content: [], hasNext: true, nextCursor: 5 },
  ])(
    'rejects invalid list pagination instead of showing empty data or looping: %j',
    async (response) => {
      mockedRequest.mockResolvedValue(response)
      await expect(
        getRestaurantMenus({ restaurantId: 10, cursor: 5, size: 10 }),
      ).rejects.toThrow()
      await expect(
        getRestaurantReviews({
          restaurantId: 10,
          cursor: 5,
          size: 5,
          sort: 'latest',
        }),
      ).rejects.toThrow()
    },
  )

  it('gets restaurant summary', async () => {
    mockedRequest.mockResolvedValue({
      restaurantId: 10,
      name: '하시 스시',
      address: '도쿄도 주오구 긴자 1-1',
      imageUrls: [],
      reservationFee: 4_000,
    })

    await getRestaurantSummary(10)

    expect(mockedRequest).toHaveBeenCalledWith('/api/v1/restaurants/10/summary')
  })

  it('gets random restaurant recommendation without exclude restaurant id', async () => {
    mockedRequest.mockResolvedValue({
      restaurantId: 10,
      name: '하시 스시',
      address: '도쿄도 주오구 긴자 1-1',
      imageUrls: [],
      reservationFee: 4_000,
    })

    await getRandomRestaurantRecommendation()

    expect(mockedRequest).toHaveBeenCalledWith(
      '/api/v1/restaurants/recommendations/random',
    )
  })

  it('gets random restaurant recommendation with exclude restaurant id', async () => {
    mockedRequest.mockResolvedValue({
      restaurantId: 11,
      name: '하시 라멘',
      address: '도쿄도 주오구 긴자 1-2',
      imageUrls: [],
      reservationFee: 4_000,
    })

    await getRandomRestaurantRecommendation({ excludeRestaurantId: 10 })

    expect(mockedRequest).toHaveBeenCalledWith(
      '/api/v1/restaurants/recommendations/random?excludeRestaurantId=10',
    )
  })

  it('gets restaurant menus with cursor pagination params', async () => {
    mockedRequest.mockResolvedValue({
      content: [],
      nextCursor: 20,
      hasNext: true,
    })

    await expect(
      getRestaurantMenus({ restaurantId: 10, cursor: 5, size: 10 }),
    ).resolves.toEqual({
      menus: [],
      nextCursor: 20,
      hasNext: true,
    })
    expect(mockedRequest).toHaveBeenCalledWith(
      '/api/v1/restaurants/10/menus?size=10&cursor=5',
    )
  })

  it('gets restaurant menus excluding selected menu', async () => {
    mockedRequest.mockResolvedValue({
      content: [],
      nextCursor: undefined,
      hasNext: false,
    })

    await getRestaurantMenus({
      restaurantId: 10,
      excludeMenuId: 100,
      size: 10,
    })

    expect(mockedRequest).toHaveBeenCalledWith(
      '/api/v1/restaurants/10/menus?size=10&excludeMenuId=100',
    )
  })

  it('gets restaurant menu detail', async () => {
    mockedRequest.mockResolvedValue({
      menuId: 100,
      name: '시오라멘',
      currency: 'JPY',
      price: 1_000,
    })

    await expect(
      getRestaurantMenu({ restaurantId: 10, menuId: 100 }),
    ).resolves.toEqual({
      menuId: 100,
      name: '시오라멘',
      currency: 'JPY',
      price: 1_000,
    })
    expect(mockedRequest).toHaveBeenCalledWith(
      '/api/v1/restaurants/10/menus/100',
    )
  })

  it('gets restaurant reviews with sort and cursor pagination params', async () => {
    mockedRequest.mockResolvedValue({
      averageRating: 4.5,
      reviewCount: 12,
      ratingDistribution: {
        five: 7,
        four: 3,
        three: 1,
        two: 1,
        one: 0,
      },
      content: [],
      nextCursor: 30,
      hasNext: true,
    })

    await expect(
      getRestaurantReviews({
        restaurantId: 10,
        cursor: 5,
        size: 10,
        sort: 'rating-high',
      }),
    ).resolves.toEqual({
      restaurantId: undefined,
      averageRating: 4.5,
      reviewCount: 12,
      ratingDistribution: {
        five: 7,
        four: 3,
        three: 1,
        two: 1,
        one: 0,
      },
      reviews: [],
      nextCursor: 30,
      hasNext: true,
    })
    expect(mockedRequest).toHaveBeenCalledWith(
      '/api/v1/restaurants/10/reviews?size=10&sort=rating-high&cursor=5',
    )
  })
})
