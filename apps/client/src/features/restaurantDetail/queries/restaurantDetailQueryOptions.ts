import {
  type InfiniteData,
  infiniteQueryOptions,
  queryOptions,
} from '@tanstack/react-query'

import { getRandomRestaurantRecommendation } from '@/features/restaurantDetail/api/getRandomRestaurantRecommendation'
import { getRestaurantMain } from '@/features/restaurantDetail/api/getRestaurantMain'
import {
  getRestaurantMenus,
  type RestaurantMenuListData,
} from '@/features/restaurantDetail/api/getRestaurantMenus'
import {
  getRestaurantReviews,
  type RestaurantReviewListData,
} from '@/features/restaurantDetail/api/getRestaurantReviews'
import { getRestaurantStoreInformation } from '@/features/restaurantDetail/api/getRestaurantStoreInformation'
import { getRestaurantSummary } from '@/features/restaurantDetail/api/getRestaurantSummary'
import type { ReviewSortValue } from '@/features/restaurantDetail/constants/restaurantReview'
import { restaurantDetailQueryKeys } from '@/features/restaurantDetail/queries/restaurantDetailQueryKeys'

export const randomRestaurantRecommendationQueryOptions = (
  excludeRestaurantId?: number,
) =>
  queryOptions({
    queryFn: () =>
      getRandomRestaurantRecommendation(
        excludeRestaurantId === undefined ? undefined : { excludeRestaurantId },
      ),
    queryKey:
      restaurantDetailQueryKeys.randomRecommendation(excludeRestaurantId),
  })

export const restaurantMainQueryOptions = (restaurantId: number) =>
  queryOptions({
    queryFn: () => getRestaurantMain(restaurantId),
    queryKey: restaurantDetailQueryKeys.main(restaurantId),
  })

export const restaurantSummaryQueryOptions = (restaurantId: number) =>
  queryOptions({
    queryFn: () => getRestaurantSummary(restaurantId),
    queryKey: restaurantDetailQueryKeys.summary(restaurantId),
  })

export const restaurantStoreInformationQueryOptions = (restaurantId: number) =>
  queryOptions({
    queryFn: () => getRestaurantStoreInformation(restaurantId),
    queryKey: restaurantDetailQueryKeys.storeInformation(restaurantId),
  })

export const restaurantMenusInfiniteQueryOptions = (
  restaurantId: number,
  size: number,
) =>
  infiniteQueryOptions<
    RestaurantMenuListData,
    Error,
    InfiniteData<RestaurantMenuListData, number | undefined>,
    ReturnType<typeof restaurantDetailQueryKeys.menus>,
    number | undefined
  >({
    queryFn: ({ pageParam }) =>
      getRestaurantMenus({ restaurantId, cursor: pageParam, size }),
    queryKey: restaurantDetailQueryKeys.menus(restaurantId, size),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? lastPage.nextCursor : undefined,
  })

export const restaurantReviewsInfiniteQueryOptions = ({
  restaurantId,
  size,
  sort,
}: {
  restaurantId: number
  size: number
  sort: ReviewSortValue
}) =>
  infiniteQueryOptions<
    RestaurantReviewListData,
    Error,
    InfiniteData<RestaurantReviewListData, number | undefined>,
    ReturnType<typeof restaurantDetailQueryKeys.reviews>,
    number | undefined
  >({
    queryFn: ({ pageParam }) =>
      getRestaurantReviews({ restaurantId, cursor: pageParam, size, sort }),
    queryKey: restaurantDetailQueryKeys.reviews(restaurantId, size, sort),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? lastPage.nextCursor : undefined,
  })
