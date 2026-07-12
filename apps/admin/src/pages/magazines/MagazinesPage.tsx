import { PlusIcon } from '@hashi/hds-icons'
import { Button } from '@hashi/hds-ui'
import { useMemo, useState } from 'react'
import type { MagazineCatalogItem } from '@/pages/magazines/api/magazineCatalogApi'
import { MagazineFormDrawer } from '@/pages/magazines/components/MagazineFormDrawer'
import { MagazineTable } from '@/pages/magazines/components/MagazineTable'
import { useDeleteMagazineMutation } from '@/pages/magazines/mutations/useMagazineMutations'
import { useMagazineCatalogQuery } from '@/pages/magazines/queries/useMagazineCatalogQuery'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { PageHeader } from '@/shared/components/PageHeader'

export const MagazinesPage = () => {
  const query = useMagazineCatalogQuery({ size: 20 })
  const deleteMutation = useDeleteMagazineMutation()
  const [directId, setDirectId] = useState('')
  const [drawer, setDrawer] = useState<{
    mode: 'create' | 'update'
    id: number | null
    item: MagazineCatalogItem | null
  } | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number
    name: string
  } | null>(null)
  const items = useMemo(
    () => query.data?.pages.flatMap((page) => page.magazines ?? []) ?? [],
    [query.data],
  )
  const parsedId = Number(directId)
  const validId = Number.isInteger(parsedId) && parsedId > 0

  return (
    <>
      <PageHeader
        title="매거진 관리"
        description="현재 공개 중인 매거진을 확인하고 배너 콘텐츠를 관리합니다."
      >
        <Button
          size="sm"
          leftIcon={<PlusIcon className="size-4" />}
          onClick={() => setDrawer({ mode: 'create', id: null, item: null })}
        >
          매거진 등록
        </Button>
      </PageHeader>
      <main className="space-y-4 px-5 py-5 lg:px-8">
        <section className="border-primary-100 bg-primary-100/40 rounded-lg border px-4 py-3">
          <h2 className="text-sm font-bold">ID 직접 관리</h2>
          <p className="text-cool-gray-500 mt-1 text-xs">
            공개 목록에 없는 매거진은 숫자 ID로 수정하거나 삭제할 수 있습니다.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <input
              aria-label="매거진 ID"
              value={directId}
              inputMode="numeric"
              placeholder="매거진 ID"
              onChange={(event) => setDirectId(event.target.value)}
              className="border-cool-gray-100 h-9 w-36 rounded-md border bg-white px-3 text-sm"
            />
            <Button
              size="sm"
              variant="neutral"
              disabled={!validId}
              onClick={() =>
                setDrawer({ mode: 'update', id: parsedId, item: null })
              }
            >
              ID로 수정
            </Button>
            <Button
              size="sm"
              variant="neutral"
              disabled={!validId}
              onClick={() =>
                setDeleteTarget({ id: parsedId, name: `매거진 #${parsedId}` })
              }
            >
              ID로 삭제
            </Button>
          </div>
        </section>
        <div>
          <h2 className="text-base font-bold">현재 공개 중인 매거진</h2>
          <p className="text-cool-gray-500 mt-1 text-xs">
            공개 조회 API 기준이며 전체 관리자 재고를 의미하지 않습니다.
          </p>
        </div>
        <MagazineTable
          items={items}
          isLoading={query.isLoading}
          isError={query.isError}
          onRetry={() => void query.refetch()}
          onEdit={(item) =>
            setDrawer({ mode: 'update', id: item.magazineId ?? null, item })
          }
          onDelete={(item) => {
            if (item.magazineId != null)
              setDeleteTarget({
                id: item.magazineId,
                name: item.title ?? `매거진 #${item.magazineId}`,
              })
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
      <MagazineFormDrawer
        open={drawer != null}
        mode={drawer?.mode ?? 'create'}
        magazineId={drawer?.id ?? null}
        item={drawer?.item ?? null}
        onClose={() => setDrawer(null)}
      />
      <ConfirmDialog
        open={deleteTarget != null}
        title="매거진을 삭제할까요?"
        description={`${deleteTarget?.name ?? ''}을(를) 삭제합니다.`}
        confirmLabel="삭제"
        loading={deleteMutation.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget)
            deleteMutation.mutate(deleteTarget.id, {
              onSuccess: () => setDeleteTarget(null),
            })
        }}
      />
    </>
  )
}
