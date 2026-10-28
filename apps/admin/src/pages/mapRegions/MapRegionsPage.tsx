import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Button } from '@hashi/hds-ui'
import { PlusIcon } from '@hashi/hds-icons'
import { ROUTES } from '@/app/router/path'
import { PageHeader } from '@/shared/components/PageHeader'
import { AdminTable } from '@/shared/components/AdminTable'
import { AdminPagination } from '@/shared/components/AdminPagination'
import { ActionButton } from '@/shared/components/ActionButton'
import { regionListOptions } from '@/features/mapRegion/queries/mapRegionQueries'
import type { MapRegion } from '@/features/mapRegion/api/mapRegionApi'
import { MapRegionEditor } from '@/pages/mapRegions/MapRegionEditor'

const columns = [
  { key: 'region', label: '관광 지역' },
  { key: 'position', label: '대표 좌표 및 범위' },
  { key: 'order', label: '순서', className: 'w-20' },
  { key: 'status', label: '공개', className: 'w-24' },
  { key: 'action', label: '관리', className: 'w-20' },
]
export const MapRegionsPage = () => {
  const [page, setPage] = useState(0)
  const query = useQuery(regionListOptions(page))
  const [target, setTarget] = useState<MapRegion | null | undefined>()
  const items = query.data?.content ?? []
  if (query.isSuccess && !query.isFetching && page > 0 && !items.length)
    setPage(Math.max(0, query.data.totalPages - 1))
  return (
    <>
      <PageHeader title="관광 지역 관리" description="">
        <Link
          to={ROUTES.restaurants}
          className="text-cool-gray-700 border-cool-gray-100 inline-flex h-7 items-center rounded-md border px-3 text-xs font-bold"
        >
          식당 관리로
        </Link>
        <Button
          size="sm"
          leftIcon={<PlusIcon className="size-4" />}
          onClick={() => setTarget(null)}
        >
          지역 등록
        </Button>
      </PageHeader>
      <section className="space-y-5 px-5 py-5 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <p className="text-cool-gray-500 text-sm">
            총 {(query.data?.totalCount ?? 0).toLocaleString()}개
          </p>
          <Button
            size="sm"
            variant="neutral"
            disabled={query.isFetching}
            onClick={() => void query.refetch()}
          >
            목록 새로고침
          </Button>
        </div>
        <AdminTable
          columns={columns}
          isLoading={query.isLoading}
          isError={query.isError}
          isEmpty={!items.length}
          emptyTitle="등록된 관광 지역이 없습니다"
          emptyDescription=""
          onRetry={() => void query.refetch()}
          tableClassName="w-full"
        >
          {items.map((item) => (
            <tr key={item.mapRegionId} className="hover:bg-cool-gray-50">
              <td className="px-3 py-3">
                <p className="text-cool-gray-900 text-sm font-bold break-words">
                  {item.name}
                </p>
                <p className="text-cool-gray-500 mt-1 text-xs break-all">
                  {item.code} · #{item.mapRegionId}
                </p>
              </td>
              <td className="text-cool-gray-600 px-3 py-3 text-xs">
                <p>
                  {item.clusterPosition.latitude},{' '}
                  {item.clusterPosition.longitude}
                </p>
                <p className="mt-1">
                  위도 {item.cameraBounds.south} ~ {item.cameraBounds.north}
                </p>
                <p>
                  경도 {item.cameraBounds.west} ~ {item.cameraBounds.east}
                </p>
              </td>
              <td className="text-cool-gray-600 px-3 py-3 text-sm">
                {item.displayOrder}
              </td>
              <td className="text-cool-gray-600 px-3 py-3 text-sm">
                {item.active ? '공개' : '비공개'}
              </td>
              <td className="px-3 py-3">
                <ActionButton onClick={() => setTarget(item)}>
                  수정
                </ActionButton>
              </td>
            </tr>
          ))}
        </AdminTable>
        <AdminPagination
          currentPage={page}
          totalPages={query.data?.totalPages ?? 0}
          isDisabled={query.isFetching}
          onPageChange={setPage}
        />
      </section>
      {target !== undefined && (
        <MapRegionEditor
          key={target?.code ?? 'new'}
          region={target}
          onClose={() => setTarget(undefined)}
        />
      )}
    </>
  )
}
