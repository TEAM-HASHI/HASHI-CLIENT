import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { magazineApi } from '@/shared/api/magazineApi'
import { magazineQueryKeys } from '@/pages/magazines/queries/magazineQueryKeys'
import { useDeleteMagazineMutation } from '@/pages/magazines/mutations/useMagazineMutations'

vi.mock('@/shared/api/magazineApi', () => ({
  magazineApi: { deleteMagazine: vi.fn() },
}))

describe('magazine mutations', () => {
  beforeEach(() => {
    vi.mocked(magazineApi.deleteMagazine).mockResolvedValue(undefined)
  })

  it('invalidates public magazine lists after delete', async () => {
    const queryClient = new QueryClient()
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    const { result } = renderHook(useDeleteMagazineMutation, { wrapper })

    act(() => result.current.mutate(5))
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: magazineQueryKeys.lists(),
    })
  })
})
