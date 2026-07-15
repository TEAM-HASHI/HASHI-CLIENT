import type { RestaurantStoreInformation } from '@/features/restaurantDetail/api/getRestaurantStoreInformation'
import type { RestaurantSummary } from '@/features/restaurantDetail/api/getRestaurantSummary'
import {
  REVIEW_PAGE_SIZE,
  type ReviewSortValue,
} from '@/features/restaurantDetail/constants/restaurantReview'
import {
  restaurantMenusInfiniteQueryOptions,
  restaurantReviewsInfiniteQueryOptions,
  restaurantStoreInformationQueryOptions,
  restaurantSummaryQueryOptions,
} from '@/features/restaurantDetail/queries/restaurantDetailQueryOptions'
import {
  DEFAULT_CATEGORY_OPTION,
  HASHI_PICK_SORT_OPTIONS,
  POPULAR_RESTAURANTS_SORT_OPTIONS,
} from '@/features/restaurantList/constants'
import { restaurantsInfiniteQueryOptions } from '@/features/restaurantList/queries/useRestaurantsInfiniteQuery'
import type { RestaurantListCurationType } from '@/features/restaurantList/types'
import { createRestaurantListRequestParams } from '@/features/restaurantList/utils'
import { magazineBannerQueryOptions } from '@/features/magazine/queries/magazineBannerQueryOptions'
import { hotSnsRestaurantsQueryOptions } from '@/pages/home/queries/useHotSnsRestaurantsQuery'
import { magazineListInfiniteQueryOptions } from '@/pages/magazines/queries/magazineListQueryOptions'
import {
  createDehydratedRouteData,
  prefetchOptionalInfiniteQuery,
  prefetchOptionalQuery,
} from '@/shared/seo/publicRouteData'

const MAGAZINE_LIST_PAGE_SIZE = 10
const RESTAURANT_MENU_PAGE_SIZE = 10
const DEFAULT_REVIEW_SORT: ReviewSortValue = 'latest'

export const loadHomeRouteData = () =>
  createDehydratedRouteData(async (queryClient) => {
    await Promise.all([
      queryClient.fetchQuery(hotSnsRestaurantsQueryOptions()),
      prefetchOptionalQuery(queryClient, magazineBannerQueryOptions(), {
        banners: [],
      }),
    ])
  })

const getRestaurantListQueryOptions = (type: RestaurantListCurationType) => {
  const sortOptions =
    type === 'hashi-pick'
      ? HASHI_PICK_SORT_OPTIONS
      : POPULAR_RESTAURANTS_SORT_OPTIONS

  return restaurantsInfiniteQueryOptions(
    createRestaurantListRequestParams({
      category: DEFAULT_CATEGORY_OPTION,
      sort: sortOptions[0],
      type,
    }),
  )
}

export const loadRestaurantListRouteData = (type: RestaurantListCurationType) =>
  createDehydratedRouteData(async (queryClient) => {
    await queryClient.fetchInfiniteQuery(getRestaurantListQueryOptions(type))
  })

export const loadMagazinesRouteData = () =>
  createDehydratedRouteData(async (queryClient) => {
    await Promise.all([
      queryClient.fetchInfiniteQuery(
        magazineListInfiniteQueryOptions({ size: MAGAZINE_LIST_PAGE_SIZE }),
      ),
      prefetchOptionalQuery(queryClient, magazineBannerQueryOptions(), {
        banners: [],
      }),
    ])
  })

export const loadRestaurantDetailRouteData = async (restaurantId: number) => {
  let summary: RestaurantSummary | undefined
  let storeInformation: RestaurantStoreInformation | undefined

  const routeData = await createDehydratedRouteData(async (queryClient) => {
    const [nextSummary, nextStoreInformation] = await Promise.all([
      queryClient.fetchQuery(restaurantSummaryQueryOptions(restaurantId)),
      queryClient.fetchQuery(
        restaurantStoreInformationQueryOptions(restaurantId),
      ),
      queryClient.fetchInfiniteQuery(
        restaurantMenusInfiniteQueryOptions(
          restaurantId,
          RESTAURANT_MENU_PAGE_SIZE,
        ),
      ),
      prefetchOptionalInfiniteQuery(
        queryClient,
        restaurantReviewsInfiniteQueryOptions({
          restaurantId,
          size: REVIEW_PAGE_SIZE,
          sort: DEFAULT_REVIEW_SORT,
        }),
        {
          averageRating: 0,
          hasNext: false,
          restaurantId,
          reviewCount: 0,
          reviews: [],
        },
      ),
    ])

    summary = nextSummary
    storeInformation = nextStoreInformation
  })

  if (!summary || !storeInformation) {
    throw new Error('식당 상세 프리렌더링 데이터가 준비되지 않았습니다.')
  }

  return {
    ...routeData,
    restaurant: { summary, storeInformation },
  }
}
