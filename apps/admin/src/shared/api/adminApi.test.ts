import { beforeEach, describe, expect, it, vi } from 'vitest'
import { magazineApi } from '@/shared/api/magazineApi'
import { request } from '@/shared/api/request'
import { reservationApi } from '@/shared/api/reservationApi'
import { restaurantApi } from '@/shared/api/restaurantApi'
import type {
  AdminRestaurantData,
  CreateRestaurantBody,
} from '@/shared/api/restaurantApi'

vi.mock('@/shared/api/request', () => ({
  request: vi.fn(),
}))

const requestMock = vi.mocked(request)

describe('admin API contract', () => {
  beforeEach(() => {
    requestMock.mockReset()
    requestMock.mockResolvedValue(undefined as never)
  })

  it('creates a restaurant with the OpenAPI request body', async () => {
    const body = {
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
      businessHours: [
        {
          dayOfWeek: 'MONDAY',
          closed: false,
          openTime: '11:00',
          closeTime: '22:00',
        },
        {
          dayOfWeek: 'TUESDAY',
          closed: false,
          openTime: '11:00',
          closeTime: '22:00',
        },
        {
          dayOfWeek: 'WEDNESDAY',
          closed: false,
          openTime: '11:00',
          closeTime: '22:00',
        },
        {
          dayOfWeek: 'THURSDAY',
          closed: false,
          openTime: '11:00',
          closeTime: '22:00',
        },
        {
          dayOfWeek: 'FRIDAY',
          closed: false,
          openTime: '11:00',
          closeTime: '22:00',
        },
        {
          dayOfWeek: 'SATURDAY',
          closed: false,
          openTime: '11:00',
          closeTime: '22:00',
        },
        { dayOfWeek: 'SUNDAY', closed: true },
      ],
    } satisfies CreateRestaurantBody
    const response = {
      restaurantId: 2,
      name: body.name,
      deleted: false,
    } satisfies AdminRestaurantData
    requestMock.mockResolvedValue(response)

    await expect(restaurantApi.createRestaurant(body)).resolves.toEqual(
      response,
    )

    expect(requestMock).toHaveBeenCalledWith('/api/v1/admin/restaurants', {
      json: body,
      method: 'post',
    })
  })

  it('updates a restaurant by numeric ID', async () => {
    const body = { name: 'Updated Hashi Sushi' }
    const response = {
      restaurantId: 2,
      name: body.name,
      deleted: false,
    } satisfies AdminRestaurantData
    requestMock.mockResolvedValue(response)

    await expect(restaurantApi.updateRestaurant(2, body)).resolves.toEqual(
      response,
    )

    expect(requestMock).toHaveBeenCalledWith('/api/v1/admin/restaurants/2', {
      json: body,
      method: 'patch',
    })
  })

  it('deletes a restaurant by numeric ID', async () => {
    await restaurantApi.deleteRestaurant(2)

    expect(requestMock).toHaveBeenCalledWith('/api/v1/admin/restaurants/2', {
      method: 'delete',
    })
  })

  it('serializes only reservation query parameters supported by OpenAPI', async () => {
    const params = {
      page: 1,
      reservedFrom: '2026-07-01',
      size: 20,
      status: 'REQUESTED' as const,
    }

    await reservationApi.listReservations(params)

    const options = requestMock.mock.calls[0]?.[1]

    expect(options?.method).toBe('get')
    expect(options?.searchParams?.toString()).toBe(
      'status=REQUESTED&page=1&size=20',
    )
  })

  it('changes a reservation status with the OpenAPI status value', async () => {
    const body = { status: 'CANCELED' as const }

    await reservationApi.updateReservationStatus(3, body)

    expect(requestMock).toHaveBeenCalledWith(
      '/api/v1/admin/reservations/3/status',
      {
        json: body,
        method: 'post',
      },
    )
  })

  it('gets the user linked to a reservation', async () => {
    await reservationApi.getReservationUser(3)

    expect(requestMock).toHaveBeenCalledWith(
      '/api/v1/admin/reservations/3/user',
      { method: 'get' },
    )
  })

  it('deletes a magazine', async () => {
    await magazineApi.deleteMagazine(4)

    expect(requestMock).toHaveBeenCalledWith('/api/v1/admin/magazines/4', {
      method: 'delete',
    })
  })

  it('creates a magazine with the OpenAPI request body', async () => {
    const body = {
      title: 'Tokyo Night',
      bannerKey: 'magazines/tokyo.webp',
      thumbnailKey: 'magazines/tokyo-thumbnail.webp',
      instagramRedirectUrl: 'https://instagram.com/p/hashi',
    }

    await magazineApi.createMagazine(body)

    expect(requestMock).toHaveBeenCalledWith('/api/v1/admin/magazines', {
      json: body,
      method: 'post',
    })
  })

  it('updates a magazine by numeric ID', async () => {
    const body = { title: 'Updated Tokyo Night' }

    await magazineApi.updateMagazine(4, body)

    expect(requestMock).toHaveBeenCalledWith('/api/v1/admin/magazines/4', {
      json: body,
      method: 'patch',
    })
  })
})
