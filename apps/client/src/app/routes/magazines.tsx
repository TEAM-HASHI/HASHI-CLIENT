import type { MetaFunction } from 'react-router'
import { useLoaderData } from 'react-router'
import { HydrationBoundary } from '@tanstack/react-query'

import { MagazinesPage } from '@/pages/magazines'
import { createPageMeta } from '@/shared/seo/metadata'
import { loadClientRouteData } from '@/shared/seo/publicRouteData'
import { loadMagazinesRouteData } from '@/shared/seo/publicRouteLoaders'

export const loader = loadMagazinesRouteData
export const clientLoader = () => loadClientRouteData(loadMagazinesRouteData)

export const meta: MetaFunction = () =>
  createPageMeta({
    description: '일본 맛집과 여행 이야기를 담은 HASHI 매거진을 만나보세요.',
    path: '/magazines',
    title: '일본 맛집 매거진 | HASHI',
  })

const MagazinesRoute = () => {
  const { dehydratedState } = useLoaderData<typeof clientLoader>()

  return (
    <HydrationBoundary state={dehydratedState}>
      <MagazinesPage />
    </HydrationBoundary>
  )
}

export default MagazinesRoute
