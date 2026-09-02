import { useSearchRestaurantsInfiniteQuery } from '@/pages/search/queries/useSearchRestaurantsInfiniteQuery'
import type { SearchRestaurantsParams } from '@/pages/search/types'
import { mapSearchRestaurantPages } from '@/pages/search/utils/mapSearchRestaurant'
import { useInfiniteScrollTrigger } from '@/shared/hooks'

export const useSearchRestaurantResults = (
  searchParams: SearchRestaurantsParams | null,
) => {
  const query = useSearchRestaurantsInfiniteQuery(searchParams)
  const loadMoreRef = useInfiniteScrollTrigger<HTMLDivElement>({
    enabled: Boolean(query.hasNextPage),
    isLoading: query.isFetchingNextPage,
    onIntersect: query.fetchNextPage,
  })

  const retry = () => {
    void query.refetch()
  }

  return {
    loadMoreRef,
    query,
    restaurants: mapSearchRestaurantPages(query.data?.pages),
    retry,
  }
}
