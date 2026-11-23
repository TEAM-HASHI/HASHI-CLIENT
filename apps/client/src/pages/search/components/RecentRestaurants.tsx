import { Thumbnail } from '@hashi/hds-ui'
import { useQueries } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { getRestaurantDetailPath } from '@/app/router/routePaths'
import { restaurantSummaryQueryOptions } from '@/features/restaurantDetail/queries/restaurantDetailQueryOptions'
import {
  clearRecentRestaurants,
  removeRecentRestaurants,
  useRecentRestaurants,
} from '@/features/recentRestaurants/recentRestaurants'
import { checkIsNotFoundError } from '@/shared/api'

export const RecentRestaurants = () => {
  const navigate = useNavigate()
  const restaurants = useRecentRestaurants()
  const { missingIds, summaries } = useQueries({
    queries: restaurants.map(({ id }) => ({
      ...restaurantSummaryQueryOptions(id),
      throwOnError: false,
    })),
    combine: (queries) => ({
      summaries: queries.map((query) => query.data),
      missingIds: restaurants.flatMap(({ id }, index) =>
        checkIsNotFoundError(queries[index].error) ? [id] : [],
      ),
    }),
  })
  useEffect(() => {
    if (missingIds.length > 0) removeRecentRestaurants(missingIds)
  }, [missingIds])

  const visibleRestaurants = restaurants.filter(
    ({ id }) => !missingIds.includes(id),
  )
  if (visibleRestaurants.length === 0) return null

  return (
    <section className="-mt-1.5" aria-labelledby="recent-restaurants-title">
      <div className="mb-4 flex h-4.5 items-center justify-between">
        <h2
          id="recent-restaurants-title"
          className="typo-sub-header-3 text-primary-200"
        >
          최근 본 맛집
        </h2>
        <button
          type="button"
          aria-label="최근 본 맛집 전체 삭제"
          className="typo-body-7 text-cool-gray-500"
          onClick={clearRecentRestaurants}
        >
          전체 삭제
        </button>
      </div>
      <div className="-mx-5 [scrollbar-width:none] overflow-x-auto px-5 [&::-webkit-scrollbar]:hidden">
        <ul className="flex w-max gap-3.25">
          {visibleRestaurants.map(({ id, name }) => {
            const summary = summaries.find((item) => item?.restaurantId === id)
            return (
              <li key={id}>
                <button
                  aria-label={name}
                  className="border-primary-100 flex w-30 flex-col gap-3.25 border-r text-left focus-visible:outline-2"
                  onClick={() => navigate(getRestaurantDetailPath(String(id)))}
                  type="button"
                >
                  <Thumbnail
                    alt=""
                    className="h-20 w-26.5 rounded-[3px]"
                    src={summary?.thumbnailUrl || summary?.imageUrls[0]}
                  />
                  <span className="flex w-full min-w-0 flex-col gap-1">
                    <span className="typo-caption-1 text-warm-gray-300 flex h-3.5 w-full items-center font-medium">
                      {summary?.address && (
                        <span
                          className="min-w-0 flex-1 truncate"
                          title={summary.address}
                        >
                          {summary.address}
                        </span>
                      )}
                      {summary?.address && summary.foodCategory && (
                        <span className="shrink-0 whitespace-pre"> · </span>
                      )}
                      {summary?.foodCategory && (
                        <span className="max-w-18 shrink-0 truncate">
                          {summary.foodCategory}
                        </span>
                      )}
                    </span>
                    <span className="typo-body-6 text-primary-200 block w-full truncate">
                      {name}
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
