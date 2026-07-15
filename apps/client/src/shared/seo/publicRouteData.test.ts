import {
  hydrate,
  infiniteQueryOptions,
  queryOptions,
} from '@tanstack/react-query'
import { describe, expect, it } from 'vitest'

import {
  createDehydratedRouteData,
  loadClientRouteData,
  parsePublicRestaurantId,
  prefetchOptionalInfiniteQuery,
  prefetchOptionalQuery,
} from '@/shared/seo/publicRouteData'
import { createQueryClient } from '@/shared/lib/queryClient'

describe('public route data', () => {
  it('accepts only positive safe restaurant ids', () => {
    expect(parsePublicRestaurantId('12')).toBe(12)
    expect(parsePublicRestaurantId('0')).toBeNull()
    expect(parsePublicRestaurantId('1.5')).toBeNull()
    expect(parsePublicRestaurantId('not-a-number')).toBeNull()
  })

  it('returns dehydrated required query data', async () => {
    const data = await createDehydratedRouteData(async (queryClient) => {
      await queryClient.fetchQuery(
        queryOptions({
          queryKey: ['seo', 'required'],
          queryFn: async () => ({ name: '하시 스시' }),
        }),
      )
    })
    const hydratedClient = createQueryClient()

    hydrate(hydratedClient, data.dehydratedState)

    expect(hydratedClient.getQueryData(['seo', 'required'])).toEqual({
      name: '하시 스시',
    })
  })

  it('rejects when required prefetch fails', async () => {
    await expect(
      createDehydratedRouteData(async (queryClient) => {
        await queryClient.fetchQuery(
          queryOptions({
            queryKey: ['seo', 'required-error'],
            queryFn: async () => {
              throw new Error('required failed')
            },
            retry: false,
          }),
        )
      }),
    ).rejects.toThrow('required failed')
  })

  it('returns empty hydration data when a client prefetch fails', async () => {
    await expect(
      loadClientRouteData(async () => {
        throw new Error('client prefetch failed')
      }),
    ).resolves.toEqual({ dehydratedState: undefined })
  })

  it('keeps 404 responses for the route error boundary', async () => {
    await expect(
      loadClientRouteData(async () => {
        throw new Response('Not Found', { status: 404 })
      }),
    ).rejects.toMatchObject({ status: 404 })
  })

  it('stores fallback data when an optional query fails', async () => {
    const data = await createDehydratedRouteData(async (queryClient) => {
      await prefetchOptionalQuery(
        queryClient,
        queryOptions({
          queryKey: ['seo', 'optional'],
          queryFn: async (): Promise<{ banners: never[] }> => {
            throw new Error('optional failed')
          },
          retry: false,
        }),
        { banners: [] },
      )
    })
    const hydratedClient = createQueryClient()

    hydrate(hydratedClient, data.dehydratedState)

    expect(hydratedClient.getQueryData(['seo', 'optional'])).toEqual({
      banners: [],
    })
  })

  it('stores one fallback page when an optional infinite query fails', async () => {
    const data = await createDehydratedRouteData(async (queryClient) => {
      await prefetchOptionalInfiniteQuery(
        queryClient,
        infiniteQueryOptions({
          queryKey: ['seo', 'optional-infinite'],
          queryFn: async (): Promise<{ items: never[] }> => {
            throw new Error('optional failed')
          },
          initialPageParam: undefined as number | undefined,
          getNextPageParam: () => undefined,
          retry: false,
        }),
        { items: [] },
      )
    })
    const hydratedClient = createQueryClient()

    hydrate(hydratedClient, data.dehydratedState)

    expect(hydratedClient.getQueryData(['seo', 'optional-infinite'])).toEqual({
      pages: [{ items: [] }],
      pageParams: [undefined],
    })
  })
})
