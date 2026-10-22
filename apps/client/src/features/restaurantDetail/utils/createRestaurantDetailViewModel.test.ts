import { describe, expect, it } from 'vitest'

import type { components } from '@/shared/api/generated/openapi'
import type { RestaurantStoreInformation } from '@/features/restaurantDetail/api/getRestaurantStoreInformation'
import type { RestaurantSummary } from '@/features/restaurantDetail/api/getRestaurantSummary'
import {
  createRestaurantDetailViewModel,
  createRestaurantMenusViewModel,
  createRestaurantMenuViewModel,
} from '@/features/restaurantDetail/utils/createRestaurantDetailViewModel'

const readyImage: components['schemas']['MediaImage'] = {
  assetId: '00000000-0000-4000-8000-000000000001',
  role: 'RESTAURANT_HERO',
  status: 'READY',
  defaultSource: {
    url: 'https://example.com/ready.webp',
    width: 720,
    height: 480,
    mimeType: 'image/webp',
  },
  sourceSets: [
    {
      mimeType: 'image/webp',
      candidates: [
        { url: 'https://example.com/ready.webp', width: 720, height: 480 },
      ],
    },
  ],
}

const restaurantSummary: RestaurantSummary = {
  restaurantId: 10,
  name: '하시 식당',
  localName: 'Hashi Restaurant',
  address: '도쿄도 시부야구',
  imageUrls: ['https://example.com/restaurant.webp'],
  reservationFee: 4000,
  rating: 4.5,
  reviewCount: 12,
  summary: '테스트 식당입니다.',
}

const storeInformation: RestaurantStoreInformation = {
  restaurantId: 10,
  description: '매장 설명',
  businessHours: [
    {
      dayOfWeek: 'MONDAY',
      openTime: '11:00',
      closeTime: '21:00',
      breakStart: '15:00',
      breakEnd: '17:00',
      closed: false,
    },
    {
      dayOfWeek: 'TUESDAY',
      openTime: '12:00',
      closeTime: '20:00',
      closed: false,
    },
  ],
  priceRange: {
    currency: 'JPY',
    minPrice: 1000,
    maxPrice: 3000,
  },
}

describe('createRestaurantDetailViewModel', () => {
  it('uses the injected date for business hours without fabricating last order', () => {
    const restaurant = createRestaurantDetailViewModel({
      summary: restaurantSummary,
      storeInformation,
      menus: [],
      reviews: [],
      now: new Date(2026, 7, 17, 9, 0, 0),
    })

    expect(restaurant.businessHoursSummary).toBe('8/17 (월) 11:00 ~ 21:00')
    expect(restaurant.lastOrderTime).toBeUndefined()
  })

  it('changes today business hours from the injected date instead of the real current date', () => {
    const restaurant = createRestaurantDetailViewModel({
      summary: restaurantSummary,
      storeInformation,
      menus: [],
      reviews: [],
      now: new Date(2026, 7, 18, 9, 0, 0),
    })

    expect(restaurant.businessHoursSummary).toBe('8/18 (화) 12:00 ~ 20:00')
    expect(restaurant.lastOrderTime).toBeUndefined()
  })

  it('uses the injected date for closed day summary', () => {
    const restaurant = createRestaurantDetailViewModel({
      summary: restaurantSummary,
      storeInformation: {
        ...storeInformation,
        businessHours: [
          {
            dayOfWeek: 'MONDAY',
            closeTime: '21:00',
            closed: true,
          },
        ],
      },
      menus: [],
      reviews: [],
      now: new Date(2026, 7, 17, 9, 0, 0),
    })

    expect(restaurant.businessHoursSummary).toBe('8/17 (월) 휴무')
    expect(restaurant.lastOrderTime).toBeUndefined()
  })

  it('keeps business hours summary and last order unavailable when open time is missing', () => {
    const restaurant = createRestaurantDetailViewModel({
      summary: restaurantSummary,
      storeInformation: {
        ...storeInformation,
        businessHours: [
          {
            dayOfWeek: 'MONDAY',
            closeTime: '21:00',
            closed: false,
          },
        ],
      },
      menus: [],
      reviews: [],
      now: new Date(2026, 7, 17, 9, 0, 0),
    })

    expect(restaurant.businessHoursSummary).toBe('8/17 (월) 영업시간 정보 없음')
    expect(restaurant.businessHours).toEqual([
      { day: '월', hours: '영업시간 정보 없음' },
    ])
    expect(restaurant.lastOrderTime).toBeUndefined()
  })

  it('stably orders hero associations without mutation and keeps unavailable asset slots', () => {
    const heroImages = [
      { restaurantImageId: 3, displayOrder: 2, legacyUrl: '/legacy.webp' },
      {
        restaurantImageId: 1,
        displayOrder: 1,
        image: readyImage,
        legacyUrl: '/stale.webp',
      },
      {
        restaurantImageId: 2,
        displayOrder: 2,
        image: {
          ...readyImage,
          status: 'PROCESSING' as const,
          defaultSource: undefined,
          sourceSets: [],
        },
        legacyUrl: '/stale-processing.webp',
      },
      {
        restaurantImageId: 4,
        displayOrder: 3,
        image: {
          ...readyImage,
          status: 'FAILED' as const,
          defaultSource: undefined,
          sourceSets: [],
        },
        legacyUrl: '/stale-failed.webp',
      },
    ]
    const original = structuredClone(heroImages)
    Object.freeze(heroImages)
    const restaurant = createRestaurantDetailViewModel({
      summary: { ...restaurantSummary, heroImages },
      storeInformation,
      menus: [],
      reviews: [],
    })

    expect(restaurant.heroImages).toEqual([
      'https://example.com/ready.webp',
      '/legacy.webp',
      undefined,
      undefined,
    ])
    expect(heroImages).toEqual(original)
  })

  it('preserves a fallback slot for a malformed hero association', () => {
    const restaurant = createRestaurantDetailViewModel({
      summary: {
        ...restaurantSummary,
        heroImages: [
          null,
          { displayOrder: 1, legacyUrl: '/valid.webp' },
        ] as unknown as RestaurantSummary['heroImages'],
      },
      storeInformation,
      menus: [],
      reviews: [],
    })
    expect(restaurant.heroImages).toEqual([undefined, '/valid.webp'])
  })

  it.each([undefined, []])(
    'keeps old hero URLs when associations are unavailable (%s)',
    (heroImages) => {
      const restaurant = createRestaurantDetailViewModel({
        summary: { ...restaurantSummary, heroImages },
        storeInformation,
        menus: [],
        reviews: [],
      })
      expect(restaurant.heroImages).toEqual([
        'https://example.com/restaurant.webp',
      ])
    },
  )

  it.each([
    [undefined, '/legacy-avatar.webp'],
    [
      { ...readyImage, role: 'PROFILE_AVATAR' },
      'https://example.com/ready.webp',
    ],
    [
      {
        ...readyImage,
        role: 'PROFILE_AVATAR',
        status: 'PROCESSING',
        defaultSource: undefined,
        sourceSets: [],
      },
      undefined,
    ],
    [
      {
        ...readyImage,
        role: 'PROFILE_AVATAR',
        status: 'FAILED',
        defaultSource: undefined,
        sourceSets: [],
      },
      undefined,
    ],
  ] satisfies [
    components['schemas']['MediaImage'] | undefined,
    string | undefined,
  ][])(
    'resolves profile media state %# without stale legacy fallback',
    (reviewerProfileImage, expected) => {
      const restaurant = createRestaurantDetailViewModel({
        summary: restaurantSummary,
        storeInformation,
        menus: [],
        reviews: [
          {
            reviewId: 1,
            reviewerNickname: 'Reviewer',
            reviewerProfileImageUrl: '/legacy-avatar.webp',
            reviewerProfileImage,
          },
        ],
      })
      expect(restaurant.reviews[0]?.reviewerProfileImageUrl).toBe(expected)
    },
  )
})

describe('restaurant menu image mapping', () => {
  it.each([
    [undefined, '/legacy-menu.webp'],
    [{ ...readyImage, role: 'MENU_LIST' }, 'https://example.com/ready.webp'],
    [
      {
        ...readyImage,
        role: 'MENU_LIST',
        status: 'PROCESSING',
        defaultSource: undefined,
        sourceSets: [],
      },
      undefined,
    ],
    [
      {
        ...readyImage,
        role: 'MENU_LIST',
        status: 'FAILED',
        defaultSource: undefined,
        sourceSets: [],
      },
      undefined,
    ],
  ] satisfies [
    components['schemas']['MediaImage'] | undefined,
    string | undefined,
  ][])(
    'resolves list and detail media state %# without removing menus',
    (image, expected) => {
      const menu = { menuId: 1, name: 'Menu', imageUrl: '/legacy-menu.webp' }
      const menus = [{ ...menu, listImage: image }]
      const original = structuredClone(menus)
      Object.freeze(menus)

      expect(createRestaurantMenusViewModel(menus)).toEqual([
        expect.objectContaining({ id: '1', imageUrl: expected }),
      ])
      expect(
        createRestaurantMenuViewModel({
          ...menu,
          detailImage: image ? { ...image, role: 'MENU_DETAIL' } : undefined,
        })?.imageUrl,
      ).toBe(expected)
      expect(menus).toEqual(original)
    },
  )
})
