import { describe, expect, it } from 'vitest'

import { ROUTES } from '@/app/router/path'
import { getAllowedProfileNewRedirectPath } from '@/pages/profileNew/utils/profileNewRedirect'

describe('profileNewRedirect utils', () => {
  it('allows onboarding continuation routes with search and hash', () => {
    expect(
      getAllowedProfileNewRedirectPath(
        '/restaurants/1/reviews/new?reservationId=1#review-form',
      ),
    ).toBe('/restaurants/1/reviews/new?reservationId=1#review-form')
  })

  it('falls back to home for unsupported, external, or protocol-relative redirect values', () => {
    expect(getAllowedProfileNewRedirectPath(ROUTES.withdrawal)).toBe(
      ROUTES.home,
    )
    expect(
      getAllowedProfileNewRedirectPath('https://example.com/reviews/new'),
    ).toBe(ROUTES.home)
    expect(getAllowedProfileNewRedirectPath('//example.com/reviews/new')).toBe(
      ROUTES.home,
    )
    expect(getAllowedProfileNewRedirectPath(null)).toBe(ROUTES.home)
  })
})
