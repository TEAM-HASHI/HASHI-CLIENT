import { PlusIcon } from '@hashi/hds-icons'
import { Button } from '@hashi/hds-ui'
import { useMemo, useState } from 'react'
import type { RestaurantCatalogItem } from '@/pages/restaurants/api/restaurantCatalogApi'
import { RestaurantFormDrawer } from '@/pages/restaurants/components/RestaurantFormDrawer'
import { RestaurantTable } from '@/pages/restaurants/components/RestaurantTable'
import { useDeleteRestaurantMutation } from '@/pages/restaurants/mutations/useRestaurantMutations'
import {
  GENRE_OPTIONS,
  FOOD_CATEGORY_OPTIONS,
} from '@/pages/restaurants/restaurantOptions'
import { useRestaurantCatalogQuery } from '@/pages/restaurants/queries/useRestaurantCatalogQuery'
import { AdminSearchInput } from '@/shared/components/AdminSearchInput'
import { AdminSelect } from '@/shared/components/AdminSelect'
import { AdminToolbar } from '@/shared/components/AdminToolbar'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { PageHeader } from '@/shared/components/PageHeader'

const ALL_OPTION = { value: 'all', label: '전체' }
const SORT_OPTIONS = [
  { value: 'basic', label: '기본순' },
  { value: 'popular', label: '인기순' },
  { value: 'rating', label: '평점순' },
]

export const RestaurantsPage = () => {
  const [keyword, setKeyword] = useState('')
  const [genre, setGenre] = useState('all')
  const [foodCategory, setFoodCategory] = useState('all')
  const [sort, setSort] = useState('basic')
  const [drawer, setDrawer] = useState<{
    mode: 'create' | 'update'
    id: number | null
    item: RestaurantCatalogItem | null
    loadPrefill: boolean
  } | null>(null)
  const [directId, setDirectId] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number
    name: string
  } | null>(null)
  const query = useRestaurantCatalogQuery({
    keyword: keyword.trim() || undefined,
    genre: genre === 'all' ? undefined : genre,
    foodCategory: foodCategory === 'all' ? undefined : foodCategory,
    sort,
    size: 20,
  })
  const deleteMutation = useDeleteRestaurantMutation()
  const items = useMemo(
    () => query.data?.pages.flatMap((page) => page.content ?? []) ?? [],
    [query.data],
  )

  const parsedDirectId = Number(directId)
  const isValidDirectId = Number.isInteger(parsedDirectId) && parsedDirectId > 0

  return (
    <>
      <PageHeader
        title="식당 관리"
        description="현재 공개 중인 식당을 확인하고 등록·수정·비공개 처리합니다."
      >
        <Button
          size="sm"
          leftIcon={<PlusIcon className="size-4" />}
          onClick={() =>
            setDrawer({
              mode: 'create',
              id: null,
              item: null,
              loadPrefill: false,
            })
          }
        >
          식당 등록
        </Button>
      </PageHeader>

      <AdminToolbar>
        <AdminSearchInput
          value={keyword}
          placeholder="식당명 또는 키워드 검색"
          onChange={setKeyword}
        />
        <AdminSelect
          label="장르"
          value={genre}
          options={[ALL_OPTION, ...GENRE_OPTIONS]}
          onChange={setGenre}
        />
        <AdminSelect
          label="음식 카테고리"
          value={foodCategory}
          options={[ALL_OPTION, ...FOOD_CATEGORY_OPTIONS]}
          onChange={setFoodCategory}
        />
        <AdminSelect
          label="정렬"
          value={sort}
          options={SORT_OPTIONS}
          onChange={setSort}
        />
      </AdminToolbar>

      <main className="space-y-4 px-5 py-5 lg:px-8">
        <section className="border-primary-100 bg-primary-100/40 rounded-lg border px-4 py-3">
          <h2 className="text-cool-gray-900 text-sm font-bold">ID 직접 관리</h2>
          <p className="text-cool-gray-500 mt-1 text-xs leading-5">
            비공개 상태라 공개 목록에 보이지 않는 식당은 숫자 ID로 수정하거나
            비공개 처리할 수 있습니다.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <label>
              <span className="sr-only">식당 ID</span>
              <input
                aria-label="식당 ID"
                inputMode="numeric"
                value={directId}
                onChange={(event) => setDirectId(event.target.value)}
                className="border-cool-gray-100 h-9 w-36 rounded-md border bg-white px-3 text-sm"
                placeholder="식당 ID"
              />
            </label>
            <Button
              size="sm"
              variant="neutral"
              disabled={!isValidDirectId}
              onClick={() =>
                setDrawer({
                  mode: 'update',
                  id: parsedDirectId,
                  item: null,
                  loadPrefill: false,
                })
              }
            >
              ID로 수정
            </Button>
            <Button
              size="sm"
              variant="neutral"
              disabled={!isValidDirectId}
              onClick={() =>
                setDeleteTarget({
                  id: parsedDirectId,
                  name: `식당 #${parsedDirectId}`,
                })
              }
            >
              ID로 비공개 처리
            </Button>
          </div>
        </section>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-cool-gray-900 text-base font-bold">
              현재 공개 중인 식당
            </h2>
            <p className="text-cool-gray-500 mt-1 text-xs">
              공개 조회 API 기준이며 전체 관리자 재고를 의미하지 않습니다.
            </p>
          </div>
          <span className="text-cool-gray-500 text-sm">
            {items.length}개 표시
          </span>
        </div>

        <RestaurantTable
          items={items}
          isLoading={query.isLoading}
          isError={query.isError}
          onRetry={() => void query.refetch()}
          onEdit={(item) =>
            setDrawer({
              mode: 'update',
              id: item.restaurantId ?? null,
              item,
              loadPrefill: true,
            })
          }
          onDelete={(item) => {
            if (item.restaurantId != null) {
              setDeleteTarget({
                id: item.restaurantId,
                name: item.name ?? `식당 #${item.restaurantId}`,
              })
            }
          }}
        />

        {query.hasNextPage ? (
          <div className="flex justify-center">
            <Button
              variant="neutral"
              loading={query.isFetchingNextPage}
              onClick={() => void query.fetchNextPage()}
            >
              더 보기
            </Button>
          </div>
        ) : null}
      </main>

      <RestaurantFormDrawer
        open={drawer != null}
        mode={drawer?.mode ?? 'create'}
        restaurantId={drawer?.id ?? null}
        listItem={drawer?.item ?? null}
        loadPrefill={drawer?.loadPrefill ?? false}
        onClose={() => setDrawer(null)}
      />

      <ConfirmDialog
        open={deleteTarget != null}
        title="식당을 비공개 처리할까요?"
        description={`${deleteTarget?.name ?? ''}을(를) 소프트 삭제합니다. 공개 목록에서는 사라지지만 데이터가 즉시 영구 삭제되지는 않습니다.`}
        confirmLabel="비공개 처리"
        loading={deleteMutation.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget) return
          deleteMutation.mutate(deleteTarget.id, {
            onSuccess: () => setDeleteTarget(null),
          })
        }}
      />
    </>
  )
}
