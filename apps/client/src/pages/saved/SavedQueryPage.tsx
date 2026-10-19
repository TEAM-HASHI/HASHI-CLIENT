import { MapViewIcon } from '@hashi/hds-icons'
import { Button } from '@hashi/hds-ui'
import { useCallback, useState, type ReactNode } from 'react'
import {
  Navigate,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import {
  getCollectionDetailPath,
  getRestaurantDetailPath,
} from '@/app/router/routePaths'
import { isValidCollectionId } from '@/pages/saved/api/collectionReadContracts'
import { CollectionDropdown } from '@/pages/saved/components/CollectionDropdown'
import { CollectionListRow } from '@/pages/saved/components/CollectionListRow'
import { SavedPageLayout } from '@/pages/saved/components/SavedPageLayout'
import { SavedRestaurantRow } from '@/pages/saved/components/SavedRestaurantRow'
import { useCollectionQuery } from '@/pages/saved/queries/useCollectionQuery'
import { useCollectionsInfiniteQuery } from '@/pages/saved/queries/useCollectionsInfiniteQuery'
import { useSavedRestaurantsInfiniteQuery } from '@/pages/saved/queries/useSavedRestaurantsInfiniteQuery'
import {
  COLLECTION_CATEGORY_OPTIONS,
  COLLECTION_SORT_OPTIONS,
  INITIAL_COLLECTION_VIEW,
  type CollectionMapState,
} from '@/pages/saved/types'
import type {
  CollectionDetailReadModelTypes,
  CollectionSummaryReadModelTypes,
  SavedRestaurantReadModelTypes,
} from '@/pages/saved/types/collectionReadModels'
import { isCollectionMapState } from '@/pages/saved/utils/collectionMapState'
import {
  mapCollectionDetail,
  mapCollectionSummary,
  mapSavedRestaurant,
} from '@/pages/saved/utils/collectionReadAdapters'
import { getErrorPresentation } from '@/shared/api/errorPresentation'
import {
  createListReturnStore,
  useAuthStatus,
  useInfiniteScrollTrigger,
  useListReturnRestoration,
} from '@/shared/hooks'

const restaurantDetailReturnStore = createListReturnStore<null>()

type SavedQueryPageProps = {
  onRestaurantSelect?: (id: string) => void
  onCreate?: () => void
  renderCollectionActions?: (
    collection: CollectionSummaryReadModelTypes,
  ) => ReactNode
  renderDetailActions?: (
    collection: CollectionDetailReadModelTypes,
  ) => ReactNode
  renderRestaurantActions?: (
    restaurant: SavedRestaurantReadModelTypes,
    collection: CollectionDetailReadModelTypes,
  ) => ReactNode
}

/** Mutation 연결까지 검증한 뒤 제품 라우트에서 사용한다. 목 데이터에는 접근하지 않는다. */
export const SavedQueryPage = ({
  onRestaurantSelect,
  onCreate,
  renderCollectionActions,
  renderDetailActions,
  renderRestaurantActions,
}: SavedQueryPageProps) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { collectionId: routeId } = useParams<{ collectionId: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const { isAuthenticated } = useAuthStatus()
  const detail = routeId !== undefined
  const numericId =
    routeId && /^[1-9]\d*$/.test(routeId) ? Number(routeId) : null
  const validId = isValidCollectionId(numericId)
  const enabledId = isAuthenticated && validId ? numericId : null
  const restored = isCollectionMapState(location.state)
    ? location.state
    : INITIAL_COLLECTION_VIEW
  const sort =
    COLLECTION_SORT_OPTIONS.find(
      (item) => item.value === searchParams.get('sort'),
    )?.value ?? restored.sort
  const category =
    COLLECTION_CATEGORY_OPTIONS.find(
      (item) => item.value === searchParams.get('category'),
    )?.value ?? restored.category
  const [menu, setMenu] = useState<'sort' | 'category' | null>(null)

  const collectionsQuery = useCollectionsInfiniteQuery(
    isAuthenticated && !detail ? { size: 20 } : null,
  )
  const detailQuery = useCollectionQuery(enabledId)
  const restaurantsQuery = useSavedRestaurantsInfiniteQuery(enabledId, {
    sort,
    category,
    size: 20,
  })
  const listQuery = detail ? restaurantsQuery : collectionsQuery
  const collection = detailQuery.data
    ? mapCollectionDetail(detailQuery.data)
    : undefined
  const collections = (collectionsQuery.data?.pages ?? []).flatMap((page) =>
    (page.collections ?? []).map(mapCollectionSummary),
  )
  const restaurants = (restaurantsQuery.data?.pages ?? []).flatMap((page) =>
    (page.content ?? []).map(mapSavedRestaurant),
  )
  const isPending = listQuery.isPending || (detail && detailQuery.isPending)
  const error = (detail ? detailQuery.error : null) ?? listQuery.error
  const hasContent =
    listQuery.data !== undefined && (!detail || collection !== undefined)
  // 분류별 전체 개수는 정책 확정 전까지 추측하거나 로드된 항목 수로 대체하지 않는다.
  const count = detail
    ? category === 'all'
      ? collection?.savedCount
      : undefined
    : collectionsQuery.data?.pages[0]?.totalCount

  const { scrollRef, capture } = useListReturnRestoration({
    locationKey: location.key,
    ready: hasContent,
    store: restaurantDetailReturnStore,
  })
  const [scrollRoot, setScrollRoot] = useState<HTMLDivElement | null>(null)
  const setScrollRef = useCallback(
    (node: HTMLDivElement | null) => {
      scrollRef.current = node
      setScrollRoot(node)
    },
    [scrollRef],
  )
  const loadMoreRef = useInfiniteScrollTrigger<HTMLDivElement>({
    enabled: isAuthenticated && hasContent && listQuery.hasNextPage && !error,
    isLoading: listQuery.isFetching,
    root: scrollRoot,
    onIntersect: () => {
      if (!listQuery.hasNextPage || listQuery.isFetching || error) return
      return listQuery.fetchNextPage()
    },
  })
  const retry = () => {
    if (listQuery.isFetchNextPageError) {
      void listQuery.fetchNextPage()
      return
    }
    if (detail) void detailQuery.refetch()
    void listQuery.refetch()
  }
  const selectRestaurant = (id: string) => {
    capture(null)
    if (onRestaurantSelect) onRestaurantSelect(id)
    else navigate(getRestaurantDetailPath(id))
  }

  const errorNotice = error && (
    <div className="flex flex-col items-center gap-4 px-5 py-8">
      <p role="alert" className="typo-body-4 text-primary-200">
        {getErrorPresentation(error).message}
      </p>
      <Button
        size="sm"
        variant="neutral"
        onClick={retry}
        disabled={listQuery.isFetching || (detail && detailQuery.isFetching)}
      >
        다시 시도
      </Button>
    </div>
  )

  if (detail && !validId) return <Navigate to={ROUTES.saved} replace />
  if (!isAuthenticated) return null

  return (
    <SavedPageLayout
      detail={detail}
      title={collection?.name}
      count={hasContent ? count : undefined}
      onBack={() => {
        navigate(ROUTES.saved)
        setMenu(null)
      }}
      onCreate={onCreate}
      headerActions={
        collection?.owner === true
          ? renderDetailActions?.(collection)
          : undefined
      }
      filters={
        detail && (
          <div className="flex items-center gap-3.75">
            <CollectionDropdown
              label="정렬"
              options={COLLECTION_SORT_OPTIONS}
              value={sort}
              open={menu === 'sort'}
              onOpenChange={(open) => setMenu(open ? 'sort' : null)}
              onChange={(value) =>
                setSearchParams({ sort: value, category }, { replace: true })
              }
            />
            <CollectionDropdown
              label="분류"
              options={COLLECTION_CATEGORY_OPTIONS}
              value={category}
              open={menu === 'category'}
              onOpenChange={(open) => setMenu(open ? 'category' : null)}
              onChange={(value) =>
                setSearchParams({ sort, category: value }, { replace: true })
              }
            />
          </div>
        )
      }
      scrollRef={setScrollRef}
      scrollKey={`${routeId ?? 'list'}:${sort}:${category}`}
    >
      {isPending && !hasContent && (
        <p role="status" className="typo-body-4 text-primary-200 px-5 py-8">
          불러오는 중…
        </p>
      )}
      {!hasContent && errorNotice}
      {hasContent && (
        <>
          {detail ? (
            <ul aria-label="저장 식당" className="px-5 pb-20">
              {restaurants.map((restaurant) => (
                <SavedRestaurantRow
                  key={restaurant.id}
                  restaurant={restaurant}
                  onSelect={selectRestaurant}
                  moreAction={
                    collection?.owner === true
                      ? (renderRestaurantActions?.(restaurant, collection) ??
                        false)
                      : false
                  }
                />
              ))}
            </ul>
          ) : (
            <div className="px-5">
              <ul aria-label="저장 컬렉션" className="flex flex-col gap-4 py-4">
                {collections.map((item) => (
                  <CollectionListRow
                    key={item.id}
                    collection={item}
                    restaurantCount={item.savedCount}
                    onSelect={() => navigate(getCollectionDetailPath(item.id))}
                    moreAction={renderCollectionActions?.(item) ?? false}
                  />
                ))}
              </ul>
            </div>
          )}
          {errorNotice}
          <div aria-hidden="true" className="h-px" ref={loadMoreRef} />
          {listQuery.isFetchingNextPage && (
            <p role="status" className="typo-body-4 text-primary-200 px-5 py-4">
              불러오는 중…
            </p>
          )}
          {collection && (
            <div className="app-mobile-fixed-bottom pointer-events-none bottom-[calc(100px+var(--safe-area-bottom,0px))] z-10 flex justify-end px-5">
              <Button
                size="md"
                className="pointer-events-auto h-11 gap-0.5 rounded-full px-3 shadow-[0_4px_4px_rgba(0,0,0,0.15)]"
                leftIcon={
                  <MapViewIcon className="fill-secondary-200 stroke-primary-100 size-6" />
                }
                onClick={() => {
                  const state: CollectionMapState = {
                    collectionId: collection.id,
                    sort,
                    category,
                  }
                  navigate(ROUTES.map, { state })
                }}
              >
                지도로 보기
              </Button>
            </div>
          )}
        </>
      )}
    </SavedPageLayout>
  )
}
