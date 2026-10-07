import { useLayoutEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createMemoryRouter,
  RouterProvider,
  useLocation,
  useNavigate,
} from 'react-router-dom'

import { BottomNavigationLayout } from '@/app/layout/BottomNavigationLayout'
import '@/app/styles/global.css'
import { SavedPage } from '@/pages/saved/SavedPage'
import { CollectionDragPanelContent } from '@/pages/saved/components/CollectionDragPanelContent'
import { collectionMocks } from '@/pages/saved/data/collectionMocks'
import type { CollectionData, CollectionViewState } from '@/pages/saved/types'
import { INITIAL_COLLECTION_VIEW } from '@/pages/saved/types'
import { isCollectionViewState } from '@/pages/saved/utils/collectionMapState'

// 이 파일은 Vite에서 직접 여는 테스트 fixture이며 제품 라우터에 등록하지 않는다.
const params = new URLSearchParams(window.location.search)
const scenario = params.get('scenario')
const longRestaurants = Array.from({ length: 40 }, (_, index) => ({
  ...collectionMocks.restaurants[index % 4],
  id: `long-${index}`,
  name:
    index === 0 ? '가'.repeat(50) : collectionMocks.restaurants[index % 4].name,
}))
const longCollection = {
  ...collectionMocks.collections[0],
  name: '가'.repeat(20),
  description: '가'.repeat(100),
  restaurants: longRestaurants.map((restaurant, index) => ({
    restaurantId: restaurant.id,
    savedAt: new Date(Date.UTC(2026, 9, 7, 0, 0, 40 - index)).toISOString(),
  })),
}
const data: CollectionData =
  scenario === 'empty'
    ? { ...collectionMocks, collections: [] }
    : scenario === 'long'
      ? {
          collections: Array.from({ length: 20 }, (_, index) => ({
            ...longCollection,
            id: index === 0 ? 'spring' : `long-collection-${index}`,
          })),
          restaurants: longRestaurants,
        }
      : collectionMocks

const PanelFixture = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [view, setView] = useState<CollectionViewState>(() =>
    isCollectionViewState(location.state)
      ? location.state
      : params.get('panel') === 'detail'
        ? { ...INITIAL_COLLECTION_VIEW, collectionId: 'spring' }
        : INITIAL_COLLECTION_VIEW,
  )
  const [closed, setClosed] = useState(false)
  const [availableHeight, setAvailableHeight] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container) return
    const measure = () =>
      setAvailableHeight(container.getBoundingClientRect().height)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(container)
    return () => observer.disconnect()
  }, [])
  return (
    <div
      ref={containerRef}
      className="relative h-[calc(100dvh-84px-var(--safe-area-bottom,0px))]"
      data-testid="panel-host"
    >
      {!closed && (
        <CollectionDragPanelContent
          data={data}
          view={view}
          onViewChange={(next) => {
            setView(next)
            navigate('/map', { replace: true, state: next })
          }}
          availableHeight={availableHeight}
          onClose={() => {
            setClosed(true)
            navigate('/map', { replace: true, state: null })
          }}
          onRestaurantSelect={() => {}}
        />
      )}
    </div>
  )
}

const router = createMemoryRouter(
  [
    {
      element: <BottomNavigationLayout />,
      children: [
        { path: '/saved', element: <SavedPage data={data} /> },
        { path: '/map', element: <PanelFixture /> },
      ],
    },
  ],
  {
    initialEntries: [
      params.has('panel')
        ? {
            pathname: '/map',
            state:
              params.get('panel') === 'detail'
                ? { collectionId: 'spring', sort: 'latest', category: 'all' }
                : INITIAL_COLLECTION_VIEW,
          }
        : '/saved',
    ],
  },
)

createRoot(document.getElementById('root')!).render(
  <main className="app-mobile-frame min-h-dvh bg-white">
    <RouterProvider router={router} />
  </main>,
)
