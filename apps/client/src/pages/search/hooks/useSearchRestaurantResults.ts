import { useSearchRestaurantsInfiniteQuery } from '@/pages/search/queries/useSearchRestaurantsInfiniteQuery'
import type { SearchRestaurantsParams } from '@/pages/search/types'
import { mapSearchRestaurantPages } from '@/pages/search/utils/mapSearchRestaurant'
import { useInfiniteScrollTrigger } from '@/shared/hooks'

export const useSearchRestaurantResults = (
  searchParams: SearchRestaurantsParams | null,
) => {
  const query = useSearchRestaurantsInfiniteQuery(searchParams)
  const loadMoreRef = useInfiniteScrollTrigger<HTMLDivElement>({
    enabled:
      searchParams !== null && Boolean(query.hasNextPage) && !query.isError,
    isLoading: query.isFetching,
    onIntersect: query.fetchNextPage,
  })

  const retry = () => {
    if (query.isFetching) return
    if (query.isFetchNextPageError) void query.fetchNextPage()
    else void query.refetch()
  }

  return {
    loadMoreRef,
    query,
    restaurants: mapSearchRestaurantPages(query.data?.pages),
    retry,
  }
}
