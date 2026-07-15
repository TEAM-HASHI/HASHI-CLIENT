import type { MetaFunction } from 'react-router'
import { useLoaderData } from 'react-router'
import { HydrationBoundary } from '@tanstack/react-query'

import { HomePage } from '@/pages/home'
import { createPageMeta } from '@/shared/seo/metadata'
import { loadClientRouteData } from '@/shared/seo/publicRouteData'
import { loadHomeRouteData } from '@/shared/seo/publicRouteLoaders'
import { createHomeStructuredData } from '@/shared/seo/structuredData'

export const loader = loadHomeRouteData
export const clientLoader = () => loadClientRouteData(loadHomeRouteData)

export const meta: MetaFunction = () => [
  ...createPageMeta({
    description: '한국인 여행자를 위한 일본 맛집 큐레이션 및 예약 서비스',
    path: '/',
    title: 'HASHI - 발견부터 예약까지',
  }),
  { 'script:ld+json': createHomeStructuredData() },
]

const HomeRoute = () => {
  const { dehydratedState } = useLoaderData<typeof clientLoader>()

  return (
    <HydrationBoundary state={dehydratedState}>
      <HomePage />
    </HydrationBoundary>
  )
}

export default HomeRoute
