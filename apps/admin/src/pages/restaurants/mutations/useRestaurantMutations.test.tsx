import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { restaurantApi } from '@/shared/api/restaurantApi'
import { restaurantQueryKeys } from '@/pages/restaurants/queries/restaurantQueryKeys'
import { useDeleteRestaurantMutation } from '@/pages/restaurants/mutations/useRestaurantMutations'

vi.mock('@/shared/api/restaurantApi', () => ({
  restaurantApi: { deleteRestaurant: vi.fn() },
}))

describe('restaurant mutations', () => {
  beforeEach(() => {
    vi.mocked(restaurantApi.deleteRestaurant).mockResolvedValue(undefined)
  })

  it('invalidates public restaurant lists after delete', async () => {
    const queryClient = new QueryClient()
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    const { result } = renderHook(useDeleteRestaurantMutation, { wrapper })

    act(() => result.current.mutate(12))
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: restaurantQueryKeys.lists(),
    })
  })
})
