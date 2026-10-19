import { useLayoutEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createHashRouter,
  RouterProvider,
  useLocation,
  useNavigate,
} from 'react-router-dom'

import { BottomNavigationLayout } from '@/app/layout/BottomNavigationLayout'
import '@/app/styles/global.css'
import { CollectionFormPage } from '@/pages/saved/CollectionFormPage'
import { getCollectionDetailPath } from '@/app/router/routePaths'
import { getCollectionSaveRestaurantId } from '@/pages/saved/utils/collectionNavigation'
import { SavedPage } from '@/pages/saved/SavedPage'
import { CollectionDataProvider } from '@/pages/saved/data/CollectionDataProvider'
import { useCollectionData } from '@/pages/saved/data/useCollectionData'
import { CollectionSaveDialog } from '@/pages/saved/components/CollectionSaveDialog'
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
  description:
    scenario === 'multiline'
      ? '가'.repeat(14) + '\n' + '나'.repeat(15)
      : '가'.repeat(30),
  restaurants: longRestaurants.map((restaurant, index) => ({
    restaurantId: restaurant.id,
    savedAt: new Date(Date.UTC(2026, 9, 7, 0, 0, 40 - index)).toISOString(),
  })),
}
const data: CollectionData =
  scenario === 'empty'
    ? { ...collectionMocks, collections: [] }
    : scenario === 'long' || scenario === 'multiline'
      ? {
          collections: Array.from({ length: 20 }, (_, index) => ({
            ...longCollection,
            id: index === 0 ? 'spring' : `long-collection-${index}`,
          })),
          restaurants: longRestaurants,
        }
      : collectionMocks

const PanelFixture = () => {
  const { data, setData } = useCollectionData()
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
          onDataChange={setData}
          view={view}
          onViewChange={(next) => {
            setView(next)
            navigate('/map', { replace: true, state: next })
          }}
          availableHeight={availableHeight}
          onClose={() => {
            if (view.collectionId) {
              navigate(
                `${getCollectionDetailPath(view.collectionId)}?sort=${view.sort}&category=${view.category}`,
                { replace: true, state: view },
              )
            } else {
              setClosed(true)
              navigate('/map', { replace: true, state: null })
            }
          }}
          onRestaurantSelect={() => {}}
        />
      )}
    </div>
  )
}

const SavedFixture = () => {
  const location = useLocation()
  const [saving, setSaving] = useState(
    () => getCollectionSaveRestaurantId(location.state) ?? params.get('save'),
  )
  return (
    <>
      <SavedPage />
      {params.get('localSave') && (
        <button onClick={() => setSaving(params.get('localSave'))}>
          식당 저장 열기
        </button>
      )}
      {saving && (
        <CollectionSaveDialog
          restaurantId={saving}
          onClose={() => setSaving(null)}
        />
      )}
    </>
  )
}

if (!window.location.hash) {
  window.history.replaceState(
    null,
    '',
    `${window.location.pathname}${window.location.search}#${params.has('panel') ? '/map' : '/saved'}`,
  )
}
const router = createHashRouter([
  {
    element: <BottomNavigationLayout />,
    children: [
      { path: '/saved', element: <SavedFixture /> },
      { path: '/saved/collections/:collectionId', element: <SavedFixture /> },
      { path: '/map', element: <PanelFixture /> },
    ],
  },
  { path: '/saved/collections/new', element: <CollectionFormPage /> },
  {
    path: '/saved/collections/:collectionId/edit',
    element: <CollectionFormPage />,
  },
])

createRoot(document.getElementById('root')!).render(
  <main className="app-mobile-frame min-h-dvh bg-white">
    <CollectionDataProvider initialData={data}>
      <RouterProvider router={router} />
    </CollectionDataProvider>
  </main>,
)
