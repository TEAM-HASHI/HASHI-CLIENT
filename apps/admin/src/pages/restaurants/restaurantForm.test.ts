import { describe, expect, it } from 'vitest'
import {
  createRestaurantForm,
  createRestaurantFormFromPrefill,
  toCreateRestaurantBody,
  toUpdateRestaurantBody,
  validateRestaurantForm,
  type RestaurantDirtyFields,
  type RestaurantReplacementFlags,
} from '@/pages/restaurants/restaurantForm'
import {
  CURATION_OPTIONS,
  CURRENCY_OPTIONS,
  GENRE_OPTIONS,
} from '@/pages/restaurants/restaurantOptions'

const replacements: RestaurantReplacementFlags = {
  images: false,
  menus: false,
  hashtags: false,
  curationTypes: false,
  businessHours: false,
}

const createValidForm = () => {
  const form = createRestaurantForm()
  form.name = '하시 스시'
  form.localName = 'ハシ寿司'
  form.summary = '현지 스시 전문점'
  form.description = '제철 생선을 사용합니다.'
  form.address = '東京都渋谷区1-1-1'
  form.area = '시부야'
  form.genre = 'sushi'
  form.foodCategory = 'sushi'
  form.priceCurrency = 'JPY'
  form.minPrice = '3000'
  form.maxPrice = '8000'
  form.images = [
    {
      fileKey: 'uploads/restaurants/2026/07/12/a.webp',
      fileUrl: 'https://cdn.example/a.webp',
      fileName: 'a.webp',
      contentType: 'image/webp',
    },
  ]
  form.hashtags = ['현지인맛집']
  form.curationTypes = ['hashi-pick']
  return form
}

describe('restaurant options', () => {
  it('uses the exact backend values', () => {
    expect(GENRE_OPTIONS.map(({ value }) => value)).toEqual([
      'sushi',
      'noodle',
      'rice-bowl',
      'nabe',
      'fried',
      'grill',
      'etc',
    ])
    expect(CURRENCY_OPTIONS.map(({ value }) => value)).toEqual([
      'JPY',
      'KRW',
      'USD',
    ])
    expect(CURATION_OPTIONS.map(({ value }) => value)).toEqual([
      'sns-hot',
      'popular',
      'hashi-pick',
      'today-restaurant',
    ])
  })
})

describe('restaurant form serializers', () => {
  it('does not invent sushi when public prefill categories are unavailable', () => {
    const form = createRestaurantFormFromPrefill({
      restaurantId: 12,
      name: '하시 식당',
      localName: 'HASHI',
      summary: '소개',
      description: '설명',
      address: '주소',
      area: '도쿄',
      genre: '',
      foodCategory: '',
      priceCurrency: 'JPY',
      minPrice: 1000,
      maxPrice: 2000,
      images: [],
      menus: [],
      hashtags: [],
      curationTypes: [],
      businessHours: [],
    })

    expect(form.genre).toBe('')
    expect(form.foodCategory).toBe('')
  })

  it('serializes create fields using only the current backend names', () => {
    expect(toCreateRestaurantBody(createValidForm())).toEqual({
      name: '하시 스시',
      localName: 'ハシ寿司',
      summary: '현지 스시 전문점',
      description: '제철 생선을 사용합니다.',
      address: '東京都渋谷区1-1-1',
      area: '시부야',
      genre: 'sushi',
      foodCategory: 'sushi',
      priceCurrency: 'JPY',
      minPrice: 3000,
      maxPrice: 8000,
      imageKeys: ['uploads/restaurants/2026/07/12/a.webp'],
      menus: [],
      hashtags: ['현지인맛집'],
      curationTypes: ['hashi-pick'],
      businessHours: expect.arrayContaining([
        {
          dayOfWeek: 'MONDAY',
          closed: false,
          openTime: '11:00',
          closeTime: '22:00',
        },
      ]),
    })
  })

  it('omits unchanged scalars and disabled replacement collections', () => {
    const form = createValidForm()
    const dirtyFields: RestaurantDirtyFields = new Set(['name'])

    expect(toUpdateRestaurantBody(form, dirtyFields, replacements)).toEqual({
      name: '하시 스시',
    })
  })

  it('sends only uploaded keys when image replacement is enabled', () => {
    const form = createValidForm()

    expect(
      toUpdateRestaurantBody(form, new Set(), {
        ...replacements,
        images: true,
        businessHours: true,
      }),
    ).toMatchObject({
      imageKeys: ['uploads/restaurants/2026/07/12/a.webp'],
      businessHours: expect.arrayContaining([
        expect.objectContaining({ dayOfWeek: 'SUNDAY' }),
      ]),
    })
  })
})

describe('restaurant form validation', () => {
  it('rejects missing required create fields and uploads', () => {
    const errors = validateRestaurantForm(
      createRestaurantForm(),
      'create',
      replacements,
      { pendingCount: 0, failedCount: 0 },
    )

    expect(errors.name).toBeDefined()
    expect(errors.images).toBeDefined()
    expect(errors.hashtags).toBeDefined()
  })

  it('rejects invalid prices, hours, and unfinished uploads', () => {
    const form = createValidForm()
    form.minPrice = '9000'
    form.maxPrice = '8000'
    form.businessHours[0] = {
      ...form.businessHours[0]!,
      openTime: '22:00',
      closeTime: '11:00',
      breakStart: '12:00',
      breakEnd: '',
    }

    const errors = validateRestaurantForm(form, 'create', replacements, {
      pendingCount: 1,
      failedCount: 1,
    })

    expect(errors.priceRange).toBeDefined()
    expect(errors.businessHours).toBeDefined()
    expect(errors.uploads).toBeDefined()
  })
})
