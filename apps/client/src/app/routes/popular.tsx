import type { MetaFunction } from 'react-router'
import { useLoaderData } from 'react-router'
import { HydrationBoundary } from '@tanstack/react-query'

import { PopularRestaurantsPage } from '@/pages/popularRestaurants'
import { createPageMeta } from '@/shared/seo/metadata'
import { loadClientRouteData } from '@/shared/seo/publicRouteData'
import { loadRestaurantListRouteData } from '@/shared/seo/publicRouteLoaders'

export const loader = () => loadRestaurantListRouteData('popular')
export const clientLoader = () => loadClientRouteData(loader)

export const meta: MetaFunction = () =>
  createPageMeta({
    description: '여행자들이 주목하는 일본 인기 맛집을 한눈에 확인해 보세요.',
    path: '/restaurants/popular',
    title: '일본 인기 맛집 추천 | HASHI',
  })

const PopularRestaurantsRoute = () => {
  const { dehydratedState } = useLoaderData<typeof clientLoader>()

  return (
    <HydrationBoundary state={dehydratedState}>
      <PopularRestaurantsPage />
    </HydrationBoundary>
  )
}

export default PopularRestaurantsRoute
