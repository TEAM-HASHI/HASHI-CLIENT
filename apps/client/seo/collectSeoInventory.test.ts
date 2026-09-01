// @vitest-environment node

import { describe, expect, it, vi } from 'vitest'

import { collectSeoInventory } from './collectSeoInventory'
import type { SeoApi } from './types'

const restaurantSummary = (
  restaurantId: number,
  name = `식당 ${restaurantId}`,
) => ({
  address: `도쿄 ${restaurantId}`,
  foodCategory: '스시',
  imageUrls: [`https://images.hashi.kr/${restaurantId}.jpg`],
  name,
  rating: 4.5,
  reservationFee: 1000,
  restaurantId,
  reviewCount: 10,
  summary: `${name} 설명`,
})

const restaurantListItem = (
  restaurantId: number,
  name = `식당 ${restaurantId}`,
) => ({
  foodCategory: '스시',
  imageUrls: [`https://images.hashi.kr/${restaurantId}.jpg`],
  name,
  rating: 4.5,
  restaurantId,
  summary: `${name} 설명`,
})

const createApi = (): SeoApi => ({
  getMagazineBanners: vi.fn().mockResolvedValue({ banners: [] }),
  getMagazines: vi.fn().mockResolvedValue({
    hasNext: false,
    magazines: [
      {
        instagramRedirectUrl: 'https://www.instagram.com/p/1',
        magazineId: 31,
        thumbnailImageUrl: 'https://images.hashi.kr/magazine.jpg',
        title: '도쿄 미식 여행',
      },
    ],
  }),
  getRestaurantMenus: vi.fn().mockImplementation((restaurantId, params) => {
    if (restaurantId === 1 && params.cursor === undefined) {
      return Promise.resolve({
        content: [{ menuId: 11, name: '스시 세트' }],
        hasNext: true,
        nextCursor: 11,
      })
    }

    if (restaurantId === 1 && params.cursor === 11) {
      return Promise.resolve({
        content: [{ menuId: 12, name: '사시미' }],
        hasNext: false,
      })
    }

    return Promise.resolve({
      content: [{ menuId: 21, name: '라멘' }],
      hasNext: false,
    })
  }),
  getRestaurants: vi.fn().mockImplementation((params) => {
    if (params.type === 'hashi-pick') {
      return Promise.resolve({
        content: [restaurantListItem(1)],
        hasNext: false,
      })
    }

    if (params.type === 'popular') {
      return Promise.resolve({
        content: [restaurantListItem(2)],
        hasNext: false,
      })
    }

    if (params.type === 'sns-hot') {
      return Promise.resolve({
        content: [restaurantListItem(2)],
        hasNext: false,
      })
    }

    if (params.cursor === undefined) {
      return Promise.resolve({
        content: [restaurantListItem(1)],
        hasNext: true,
        nextCursor: 'restaurant-1',
      })
    }

    return Promise.resolve({
      content: [restaurantListItem(2)],
      hasNext: false,
    })
  }),
  getRestaurantStoreInformation: vi.fn().mockImplementation((restaurantId) =>
    Promise.resolve({
      businessHours: [
        {
          closeTime: '20:00',
          closed: false,
          dayOfWeek: 'MONDAY',
          openTime: '11:00',
        },
      ],
      description: `매장 ${restaurantId} 설명`,
      priceRange: { currency: 'JPY', maxPrice: 3000, minPrice: 1000 },
      restaurantId,
    }),
  ),
  getRestaurantSummary: vi
    .fn()
    .mockImplementation((restaurantId) =>
      Promise.resolve(restaurantSummary(restaurantId)),
    ),
})

describe('collectSeoInventory', () => {
  it('collects every concrete restaurant and menu ID once', async () => {
    const api = createApi()

    const inventory = await collectSeoInventory(api)

    expect(
      inventory.restaurants.map(({ restaurant }) => restaurant.id),
    ).toEqual(['1', '2'])
    expect(
      inventory.restaurants.flatMap(({ restaurant }) =>
        restaurant.menus.map((menu) => `${restaurant.id}/${menu.id}`),
      ),
    ).toEqual(['1/11', '1/12', '2/21'])
    expect(inventory.hashiPick.map((restaurant) => restaurant.id)).toEqual([
      '1',
    ])
    expect(inventory.popular.map((restaurant) => restaurant.id)).toEqual(['2'])
    expect(
      inventory.homeRestaurants.map((restaurant) => restaurant.id),
    ).toEqual(['2'])
    expect(inventory.magazines).toEqual([
      expect.objectContaining({ id: '31', title: '도쿄 미식 여행' }),
    ])
    expect(api.getRestaurantSummary).toHaveBeenCalledTimes(2)
    expect(inventory.restaurants[0]?.restaurant).toMatchObject({
      businessHours: [{ label: '월', value: '11:00 - 20:00' }],
      priceRange: 'JPY 1,000 - 3,000',
    })
  })

  it('rejects repeated cursors and missing next cursors', async () => {
    const repeatedCursorApi = createApi()
    vi.mocked(repeatedCursorApi.getRestaurants).mockResolvedValue({
      content: [restaurantListItem(1)],
      hasNext: true,
      nextCursor: 'same',
    })

    await expect(collectSeoInventory(repeatedCursorApi)).rejects.toThrow(
      'cursor가 반복',
    )

    const missingCursorApi = createApi()
    vi.mocked(missingCursorApi.getRestaurants).mockResolvedValue({
      content: [restaurantListItem(1)],
      hasNext: true,
    })

    await expect(collectSeoInventory(missingCursorApi)).rejects.toThrow(
      'nextCursor가 없습니다',
    )
  })

  it('rejects an empty restaurant inventory', async () => {
    const api = createApi()
    vi.mocked(api.getRestaurants).mockImplementation((params) =>
      Promise.resolve({
        content: params.type ? [restaurantListItem(1)] : [],
        hasNext: false,
      }),
    )

    await expect(collectSeoInventory(api)).rejects.toThrow(
      '공개 식당이 한 건도 없습니다',
    )
  })

  it.each([
    [restaurantListItem(0), '양의 정수'],
    [restaurantListItem(1, '  '), '이름'],
  ])('rejects invalid restaurant data', async (invalidRestaurant, message) => {
    const api = createApi()
    vi.mocked(api.getRestaurants).mockImplementation((params) =>
      Promise.resolve({
        content: params.type ? [restaurantListItem(1)] : [invalidRestaurant],
        hasNext: false,
      }),
    )

    await expect(collectSeoInventory(api)).rejects.toThrow(message)
  })

  it('rejects invalid menu IDs and missing menu names', async () => {
    const api = createApi()
    vi.mocked(api.getRestaurantMenus).mockResolvedValue({
      content: [{ menuId: -1, name: '' }],
      hasNext: false,
    })

    await expect(collectSeoInventory(api)).rejects.toThrow('메뉴 ID')
  })

  it('removes unsafe or non-Instagram external URLs from build inventory', async () => {
    const api = createApi()
    vi.mocked(api.getMagazines).mockResolvedValue({
      hasNext: false,
      magazines: [
        {
          instagramRedirectUrl: 'javascript:alert(1)',
          magazineId: 31,
          thumbnailImageUrl: 'https://images.hashi.kr/magazine.jpg',
          title: '안전하지 않은 링크',
        },
      ],
    })
    vi.mocked(api.getMagazineBanners).mockResolvedValue({
      banners: [
        {
          bannerImageUrl: 'https://images.hashi.kr/banner.jpg',
          instagramRedirectUrl: 'https://example.com/not-instagram',
          magazineId: 32,
          title: '외부 배너',
        },
      ],
    })

    const inventory = await collectSeoInventory(api)

    expect(inventory.magazines[0]?.externalUrl).toBeNull()
    expect(inventory.banners[0]?.externalUrl).toBeNull()
  })
})
