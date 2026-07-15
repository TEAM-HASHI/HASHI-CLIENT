import { describe, expect, it } from 'vitest'

import { meta } from '@/app/routes/restaurant-detail'

describe('restaurant detail route metadata', () => {
  it('marks missing or failed restaurant data as noindex', () => {
    expect(
      meta({
        error: new Response('Not Found', { status: 404 }),
        loaderData: undefined,
      } as never),
    ).toContainEqual({ name: 'robots', content: 'noindex, nofollow' })

    expect(
      meta({
        error: undefined,
        loaderData: { dehydratedState: undefined },
      } as never),
    ).toContainEqual({ name: 'googlebot', content: 'noindex, nofollow' })
  })
})
