import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { restaurantCatalogApi } from '@/pages/restaurants/api/restaurantCatalogApi'
import { restaurantQueryKeys } from '@/pages/restaurants/queries/restaurantQueryKeys'
import { useRestaurantPrefillQuery } from '@/pages/restaurants/queries/useRestaurantPrefillQuery'

vi.mock('@/pages/restaurants/api/restaurantCatalogApi', () => ({
  restaurantCatalogApi: {
    getSummary: vi.fn(),
    getStoreInformation: vi.fn(),
    listAllMenus: vi.fn(),
  },
}))

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider
    client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
  >
    {children}
  </QueryClientProvider>
)

describe('restaurant queries', () => {
  beforeEach(() => {
    vi.mocked(restaurantCatalogApi.getSummary).mockReset()
    vi.mocked(restaurantCatalogApi.getStoreInformation).mockReset()
    vi.mocked(restaurantCatalogApi.listAllMenus).mockReset()
    vi.mocked(restaurantCatalogApi.getSummary).mockResolvedValue({
      restaurantId: 12,
    })
    vi.mocked(restaurantCatalogApi.getStoreInformation).mockResolvedValue({})
    vi.mocked(restaurantCatalogApi.listAllMenus).mockResolvedValue([])
  })

  it('includes all list params in its query key', () => {
    const params = { keyword: '스시', genre: 'sushi', sort: 'rating' }

    expect(restaurantQueryKeys.list(params)).toEqual([
      'admin',
      'restaurant-catalog',
      'list',
      params,
    ])
  })

  it('does not request prefill data without an ID', () => {
    renderHook(() => useRestaurantPrefillQuery(null, null), { wrapper })

    expect(restaurantCatalogApi.getSummary).not.toHaveBeenCalled()
    expect(restaurantCatalogApi.getStoreInformation).not.toHaveBeenCalled()
    expect(restaurantCatalogApi.listAllMenus).not.toHaveBeenCalled()
  })

  it('composes summary, store information, and all menus for prefill', async () => {
    const { result } = renderHook(
      () =>
        useRestaurantPrefillQuery(12, {
          restaurantId: 12,
          genre: 'sushi',
          foodCategory: 'sushi',
        }),
      { wrapper },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(restaurantCatalogApi.getSummary).toHaveBeenCalledWith(12)
    expect(restaurantCatalogApi.getStoreInformation).toHaveBeenCalledWith(12)
    expect(restaurantCatalogApi.listAllMenus).toHaveBeenCalledWith(12)
  })
})
