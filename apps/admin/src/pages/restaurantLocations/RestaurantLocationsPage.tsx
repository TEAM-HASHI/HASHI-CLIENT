import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Button } from '@hashi/hds-ui'
import { ROUTES } from '@/app/router/path'
import { PageHeader } from '@/shared/components/PageHeader'
import { AdminSelect } from '@/shared/components/AdminSelect'
import { AdminTable } from '@/shared/components/AdminTable'
import { ActionButton } from '@/shared/components/ActionButton'
import { AdminPagination } from '@/shared/components/AdminPagination'
import { Drawer } from '@/shared/components/Drawer'
import {
  LOCATION_STATUSES,
  LOCATION_SOURCES,
  locationStatusLabel,
  locationSourceLabel,
} from '@/features/restaurantLocation/locationOptions'
import type {
  LocationFilters,
  LocationReview,
} from '@/features/restaurantLocation/api/restaurantLocationApi'
import { locationListOptions } from '@/features/restaurantLocation/queries/locationQueries'
import { RestaurantLocationPanel } from '@/features/restaurantLocation/components/RestaurantLocationPanel'
import { LocationAddressEditor } from '@/features/restaurantLocation/components/LocationAddressEditor'

const columns = [
  { key: 'restaurant', label: '식당 및 주소' },
  { key: 'location', label: '위치 상태', className: 'w-36' },
  { key: 'action', label: '관리', className: 'w-24' },
]

export const RestaurantLocationsPage = () => {
  const [filters, setFilters] = useState<LocationFilters>({
    status: 'REVIEW_REQUIRED',
    page: 0,
  })
  const query = useQuery(locationListOptions(filters))
  const [target, setTarget] = useState<LocationReview | null>(null)
  const [editingAddress, setEditingAddress] = useState(false)
  const openReview = (item: LocationReview) => {
    setEditingAddress(false)
    setTarget(item)
  }
  const [directId, setDirectId] = useState('')
  const id = Number(directId)
  const items = query.data?.restaurants ?? []
  const page = filters.page ?? 0
  if (query.isSuccess && !query.isFetching && page > 0 && !items.length) {
    setFilters((current) => ({
      ...current,
      page: Math.max(0, (query.data.totalPages ?? 1) - 1),
    }))
  }
  const current =
    items.find((item) => item.restaurantId === target?.restaurantId) ?? target
  return (
    <>
      <PageHeader title="식당 위치 검토" description="">
        <Link
          to={ROUTES.restaurants}
          className="text-cool-gray-600 border-cool-gray-100 rounded-md border px-3 py-2 text-sm font-semibold"
        >
          식당 관리로
        </Link>
      </PageHeader>
      <section className="space-y-5 px-5 py-5 lg:px-8">
        <div className="flex flex-wrap items-end gap-3">
          <AdminSelect
            label="위치 상태"
            value={filters.status ?? 'REVIEW_REQUIRED'}
            options={[...LOCATION_STATUSES]}
            onChange={(value) =>
              setFilters((previous) => ({
                ...previous,
                status: value as LocationFilters['status'],
                page: 0,
              }))
            }
          />
          <AdminSelect
            label="위치 출처"
            value={filters.source ?? 'all'}
            options={[
              { value: 'all', label: '전체 출처' },
              ...LOCATION_SOURCES,
            ]}
            onChange={(value) =>
              setFilters((previous) => ({
                ...previous,
                source:
                  value === 'all'
                    ? undefined
                    : (value as LocationFilters['source']),
                page: 0,
              }))
            }
          />
          <Button
            size="sm"
            variant="neutral"
            disabled={query.isFetching}
            onClick={() => void query.refetch()}
          >
            목록 새로고침
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            aria-label="위치 확인할 식당 ID"
            inputMode="numeric"
            value={directId}
            onChange={(event) => setDirectId(event.target.value)}
            placeholder="식당 ID"
            className="border-cool-gray-100 h-9 w-36 rounded-md border px-3 text-sm"
          />
          <Button
            size="sm"
            variant="neutral"
            disabled={!Number.isSafeInteger(id) || id <= 0}
            onClick={() => openReview({ restaurantId: id })}
          >
            ID로 위치 확인
          </Button>
        </div>
        <p className="text-cool-gray-500 text-sm">
          총 {(query.data?.totalCount ?? 0).toLocaleString()}개
        </p>
        <AdminTable
          columns={columns}
          isLoading={query.isLoading}
          isError={query.isError}
          isEmpty={!items.length}
          emptyTitle="위치 검토 대상이 없습니다"
          emptyDescription=""
          onRetry={() => void query.refetch()}
          tableClassName="w-full"
        >
          {items.map((item) => (
            <tr key={item.restaurantId} className="hover:bg-cool-gray-50">
              <td className="min-w-0 px-3 py-3">
                <p className="text-cool-gray-900 text-sm font-bold break-words">
                  {item.name}{' '}
                  <span className="text-cool-gray-500 text-xs font-normal">
                    #{item.restaurantId}
                  </span>
                </p>
                <p className="text-cool-gray-600 mt-1 text-xs break-words">
                  {item.address}
                </p>
                {item.geocodingAddress && (
                  <p className="text-cool-gray-500 mt-1 text-xs break-words">
                    확인 주소: {item.geocodingAddress}
                  </p>
                )}
              </td>
              <td className="px-3 py-3 text-xs">
                <p className="text-cool-gray-900 font-semibold">
                  {locationStatusLabel(item.locationStatus)}
                </p>
                <p className="text-cool-gray-500 mt-1">
                  {locationSourceLabel(item.source)}
                </p>
                {item.failureCode && (
                  <p className="text-error mt-1 break-all">
                    {item.failureCode}
                  </p>
                )}
                <p className="text-cool-gray-500 mt-1">
                  {item.confirmedByAdminLoginId ??
                    (item.confirmedByAdminId != null
                      ? `관리자 ID ${item.confirmedByAdminId}`
                      : '확인자 기록 없음')}
                </p>
              </td>
              <td className="px-3 py-3">
                <ActionButton onClick={() => openReview(item)}>
                  위치 검토
                </ActionButton>
              </td>
            </tr>
          ))}
        </AdminTable>
        <AdminPagination
          currentPage={page}
          totalPages={query.data?.totalPages ?? 0}
          isDisabled={query.isFetching}
          onPageChange={(next) =>
            setFilters((previous) => ({ ...previous, page: next }))
          }
        />
      </section>
      <Drawer
        open={target !== null}
        title={current?.name ?? `식당 #${target?.restaurantId}`}
        size="lg"
        onClose={() => setTarget(null)}
      >
        {current?.restaurantId && (
          <div className="space-y-6" key={current.restaurantId}>
            {current.address && (
              <p className="text-cool-gray-600 text-sm break-words">
                {current.address}
              </p>
            )}
            <RestaurantLocationPanel
              restaurantId={current.restaurantId}
              disabled={editingAddress}
            />
            {current.address != null && (
              <LocationAddressEditor
                restaurant={current}
                onDirtyChange={setEditingAddress}
                onSaved={() => setTarget(null)}
              />
            )}
          </div>
        )}
      </Drawer>
    </>
  )
}
