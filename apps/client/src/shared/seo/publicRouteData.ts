import {
  dehydrate,
  type DefaultError,
  type FetchInfiniteQueryOptions,
  type FetchQueryOptions,
  type InfiniteData,
  type QueryClient,
  type QueryKey,
} from '@tanstack/react-query'

import { createQueryClient } from '@/shared/lib/queryClient'

export const parsePublicRestaurantId = (restaurantId: string | undefined) => {
  const parsedRestaurantId = Number(restaurantId)

  return Number.isSafeInteger(parsedRestaurantId) && parsedRestaurantId > 0
    ? parsedRestaurantId
    : null
}

export const createDehydratedRouteData = async (
  prefetch: (queryClient: QueryClient) => Promise<void>,
) => {
  const queryClient = createQueryClient()

  await prefetch(queryClient)

  return { dehydratedState: dehydrate(queryClient) }
}

export const loadClientRouteData = async <T>(
  loadRouteData: () => Promise<T>,
) => {
  try {
    return await loadRouteData()
  } catch (cause) {
    if (cause instanceof Response && cause.status === 404) {
      throw cause
    }

    return { dehydratedState: undefined }
  }
}

export const prefetchOptionalQuery = async <
  TQueryFnData,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  queryClient: QueryClient,
  options: FetchQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
  fallbackData: TData,
) => {
  try {
    await queryClient.fetchQuery(options)
  } catch {
    queryClient.setQueryData<TData, QueryKey>(options.queryKey, fallbackData)
  }
}

export const prefetchOptionalInfiniteQuery = async <
  TQueryFnData,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
  TPageParam = unknown,
>(
  queryClient: QueryClient,
  options: FetchInfiniteQueryOptions<
    TQueryFnData,
    TError,
    TData,
    TQueryKey,
    TPageParam
  >,
  fallbackPage: TData,
) => {
  try {
    await queryClient.fetchInfiniteQuery(options)
  } catch {
    queryClient.setQueryData<InfiniteData<TData, TPageParam>, QueryKey>(
      options.queryKey,
      {
        pages: [fallbackPage],
        pageParams: [options.initialPageParam],
      },
    )
  }
}
