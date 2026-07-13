import { beforeEach, describe, expect, it, vi } from 'vitest'

import { request } from '@/shared/api/request'

import { getRestaurantMenus } from '@/features/restaurantDetail/api/getRestaurantMenus'
import { getRestaurantMenu } from '@/features/restaurantDetail/api/getRestaurantMenu'
import { getRandomRestaurantRecommendation } from '@/features/restaurantDetail/api/getRandomRestaurantRecommendation'
import { getRestaurantReviews } from '@/features/restaurantDetail/api/getRestaurantReviews'
import { getRestaurantStoreInformation } from '@/features/restaurantDetail/api/getRestaurantStoreInformation'
import { getRestaurantSummary } from '@/features/restaurantDetail/api/getRestaurantSummary'

vi.mock('@/shared/api/request', () => ({
  request: vi.fn(),
}))

const mockedRequest = vi.mocked(request)

describe('restaurant detail API', () => {
  beforeEach(() => {
    mockedRequest.mockReset()
  })

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

  it('gets restaurant store information', async () => {
    mockedRequest.mockResolvedValue({
      restaurantId: 10,
      businessHours: [],
    })

    await getRestaurantStoreInformation(10)

    expect(mockedRequest).toHaveBeenCalledWith(
      '/api/v1/restaurants/10/store-information',
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
      reviews: [],
      nextCursor: 30,
      hasNext: true,
    })
    expect(mockedRequest).toHaveBeenCalledWith(
      '/api/v1/restaurants/10/reviews?size=10&sort=rating-high&cursor=5',
    )
  })
})
