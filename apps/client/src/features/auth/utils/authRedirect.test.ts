import { describe, expect, it } from 'vitest'

import {
  getPathFromLocation,
  getRedirectToFromLocationState,
} from '@/features/auth/utils/authRedirect'

describe('authRedirect utilities', () => {
  it('creates a redirect path from location pathname, search, and hash', () => {
    expect(
      getPathFromLocation({
        pathname: '/my-reservations',
        search: '?status=visited',
        hash: '#reservation-list',
      }),
    ).toBe('/my-reservations?status=visited#reservation-list')
  })

  it('extracts redirect path from route guard location state', () => {
    expect(
      getRedirectToFromLocationState({
        from: {
          pathname: '/restaurants/1/reservations/new',
          search: '?date=2026-07-12',
          hash: '',
        },
      }),
    ).toBe('/restaurants/1/reservations/new?date=2026-07-12')
  })

  it('ignores invalid location state', () => {
    expect(getRedirectToFromLocationState({ from: 'nope' })).toBeUndefined()
    expect(
      getRedirectToFromLocationState({
        from: {
          pathname: 'https://example.com',
        },
      }),
    ).toBeUndefined()
  })
})
