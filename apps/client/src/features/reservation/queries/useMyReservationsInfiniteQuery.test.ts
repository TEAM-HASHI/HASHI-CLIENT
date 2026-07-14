import { describe, expect, it, vi } from 'vitest'

import { myReservationsQueryKeys } from '@/features/reservation/queries/myReservationsQueryKeys'
import { myReservationsInfiniteQueryOptions } from '@/features/reservation/queries/useMyReservationsInfiniteQuery'

vi.mock('@/features/reservation/api/getMyReservations', () => ({
  getMyReservations: vi.fn(),
}))

describe('myReservationsInfiniteQueryOptions', () => {
  it('uses status scoped reservation list query keys', () => {
    expect(myReservationsQueryKeys.all).toEqual(['myReservations'])
    expect(myReservationsQueryKeys.infiniteList('IN_PROGRESS')).toEqual([
      'myReservations',
      'infiniteList',
      'IN_PROGRESS',
    ])
    expect(myReservationsInfiniteQueryOptions('IN_PROGRESS').queryKey).toEqual(
      myReservationsQueryKeys.infiniteList('IN_PROGRESS'),
    )
  })

  it('keeps reservation list queries immediately stale so status changes are refetched on re-entry', () => {
    expect(myReservationsInfiniteQueryOptions('IN_PROGRESS').staleTime).toBe(0)
  })
})
