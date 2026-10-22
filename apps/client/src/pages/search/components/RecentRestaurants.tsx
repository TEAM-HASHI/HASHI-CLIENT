import { Chip } from '@hashi/hds-ui'
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
  const { missingIds } = useQueries({
    queries: restaurants.map(({ id }) => ({
      ...restaurantSummaryQueryOptions(id),
      throwOnError: false,
    })),
    combine: (queries) => ({
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
    <section aria-labelledby="recent-restaurants-title">
      <div className="mb-4 flex items-center justify-between">
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
        <ul className="flex w-max gap-2">
          {visibleRestaurants.map(({ id, name }) => (
            <li key={id}>
              <Chip
                className="max-w-60"
                onSelectedChange={() =>
                  navigate(getRestaurantDetailPath(String(id)))
                }
              >
                {name}
              </Chip>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
