import { beforeEach, describe, expect, it, vi } from 'vitest'
import { restaurantCatalogApi } from '@/pages/restaurants/api/restaurantCatalogApi'
import { request } from '@/shared/api/request'

vi.mock('@/shared/api/request', () => ({
  request: vi.fn(),
}))

const requestMock = vi.mocked(request)

describe('restaurantCatalogApi', () => {
  beforeEach(() => {
    requestMock.mockReset()
    requestMock.mockResolvedValue({})
  })

  it('serializes supported public restaurant filters', async () => {
    await restaurantCatalogApi.list({
      keyword: '스시',
      genre: 'sushi',
      foodCategory: 'sushi',
      sort: 'rating',
      cursor: 'cursor-token',
      size: 20,
    })

    const options = requestMock.mock.calls[0]?.[1]

    expect(requestMock.mock.calls[0]?.[0]).toBe('/api/v1/restaurants')
    expect(options?.method).toBe('get')
    expect(options?.searchParams?.toString()).toBe(
      'keyword=%EC%8A%A4%EC%8B%9C&genre=sushi&foodCategory=sushi&sort=rating&cursor=cursor-token&size=20',
    )
  })

  it('uses the public detail paths', async () => {
    await restaurantCatalogApi.getSummary(12)
    await restaurantCatalogApi.getStoreInformation(12)

    expect(requestMock).toHaveBeenNthCalledWith(
      1,
      '/api/v1/restaurants/12/summary',
      { method: 'get' },
    )
    expect(requestMock).toHaveBeenNthCalledWith(
      2,
      '/api/v1/restaurants/12/store-information',
      { method: 'get' },
    )
  })

  it('loads every menu page by forwarding the next cursor', async () => {
    requestMock
      .mockResolvedValueOnce({
        content: [{ menuId: 1, name: '스시' }],
        nextCursor: 1,
        hasNext: true,
      })
      .mockResolvedValueOnce({
        content: [{ menuId: 2, name: '우동' }],
        hasNext: false,
      })

    await expect(restaurantCatalogApi.listAllMenus(12)).resolves.toEqual([
      { menuId: 1, name: '스시' },
      { menuId: 2, name: '우동' },
    ])

    expect(requestMock.mock.calls[0]?.[0]).toBe('/api/v1/restaurants/12/menus')
    expect(requestMock.mock.calls[0]?.[1]?.searchParams?.toString()).toBe(
      'size=50',
    )
    expect(requestMock.mock.calls[1]?.[1]?.searchParams?.toString()).toBe(
      'cursor=1&size=50',
    )
  })
})
