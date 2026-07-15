import type { MetaFunction } from 'react-router'
import { useLoaderData } from 'react-router'
import { HydrationBoundary } from '@tanstack/react-query'

import { HashiPickPage } from '@/pages/hashiPick'
import { createPageMeta } from '@/shared/seo/metadata'
import { loadClientRouteData } from '@/shared/seo/publicRouteData'
import { loadRestaurantListRouteData } from '@/shared/seo/publicRouteLoaders'

export const loader = () => loadRestaurantListRouteData('hashi-pick')
export const clientLoader = () => loadClientRouteData(loader)

export const meta: MetaFunction = () =>
  createPageMeta({
    description: 'HASHI가 엄선한 일본 맛집 큐레이션을 확인해 보세요.',
    path: '/restaurants/hashi-pick',
    title: '일본 하시픽 맛집 추천 | HASHI',
  })

const HashiPickRoute = () => {
  const { dehydratedState } = useLoaderData<typeof clientLoader>()

  return (
    <HydrationBoundary state={dehydratedState}>
      <HashiPickPage />
    </HydrationBoundary>
  )
}

export default HashiPickRoute
