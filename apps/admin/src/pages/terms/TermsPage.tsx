import { useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useSearchParams } from 'react-router-dom'
import { Button, Dialog } from '@hashi/hds-ui'
import { PlusIcon } from '@hashi/hds-icons'
import { ROUTES } from '@/app/router/path'
import { PageHeader } from '@/shared/components/PageHeader'
import { AdminTable } from '@/shared/components/AdminTable'
import { ActionButton } from '@/shared/components/ActionButton'
import { AdminPagination } from '@/shared/components/AdminPagination'
import {
  termsHistoryOptions,
  termsTypesOptions,
  useDeleteTermsMutation,
} from '@/pages/terms/queries/termsQueries'
import type { AdminTerms } from '@/pages/terms/api/termsApi'
import { termsErrorMessage, termsStatusLabel } from '@/pages/terms/termsForm'

const columns = [
  { key: 'title', label: '버전 이력' },
  { key: 'status', label: '상태', className: 'w-24' },
  { key: 'actions', label: '관리', className: 'w-20' },
]

export const TermsPage = () => {
  const [params, setParams] = useSearchParams()
  const types = useQuery(termsTypesOptions())
  const selected =
    types.data?.find(({ type }) => type === params.get('type')) ??
    types.data?.[0]
  const pageNumber = Number(params.get('page') ?? 0)
  const page =
    Number.isSafeInteger(pageNumber) && pageNumber >= 0 ? pageNumber : 0
  const history = useQuery({
    ...termsHistoryOptions(selected?.type ?? 'SERVICE_TERMS', page),
    enabled: Boolean(selected?.type),
  })
  const deletion = useDeleteTermsMutation()
  const deleting = useRef(false)
  const [target, setTarget] = useState<AdminTerms | null>(null)
  const terms = history.data?.terms ?? []
  return (
    <>
      <PageHeader title="이용약관 관리" description="">
        {selected?.type && (
          <Link
            to={`${ROUTES.termsNew}?type=${selected.type}`}
            className="bg-cool-gray-800 typo-body-6 hover:bg-cool-gray-700 inline-flex h-7 items-center gap-1 rounded-[5px] px-4 whitespace-nowrap text-white"
          >
            <PlusIcon className="size-4" />새 버전 작성
          </Link>
        )}
      </PageHeader>
      <section className="space-y-5 px-5 py-5 lg:px-8">
        {types.isError && (
          <div role="alert" className="space-y-3 text-sm">
            <p>{termsErrorMessage(types.error)}</p>
            <Button
              size="sm"
              variant="neutral"
              onClick={() => void types.refetch()}
            >
              다시 시도
            </Button>
          </div>
        )}
        <label className="flex max-w-lg flex-col gap-1">
          <span className="text-cool-gray-500 text-xs font-semibold">
            약관 유형
          </span>
          <select
            aria-label="약관 유형"
            className="border-cool-gray-100 focus:border-primary-200 h-10 rounded-md border bg-white px-3 text-sm outline-none"
            value={selected?.type ?? ''}
            disabled={!types.data?.length || deletion.isPending}
            onChange={(event) => setParams({ type: event.target.value })}
          >
            {!types.data?.length && (
              <option value="">
                {types.isPending
                  ? '유형을 불러오는 중입니다'
                  : '조회 가능한 유형이 없습니다'}
              </option>
            )}
            {types.data?.map((item) => (
              <option key={item.type} value={item.type}>
                {item.title}
              </option>
            ))}
          </select>
        </label>
        {selected && (
          <p className="text-cool-gray-500 text-sm">
            {selected.currentTermsId
              ? '현재 적용 중인 버전이 있습니다.'
              : '현재 적용 중인 버전이 없습니다.'}{' '}
            총 {(history.data?.totalCount ?? 0).toLocaleString()}개 버전
          </p>
        )}
        {selected?.type && (
          <>
            <AdminTable
              columns={columns}
              isLoading={history.isLoading}
              isError={history.isError}
              isEmpty={!terms.length}
              emptyTitle="등록된 약관 버전이 없습니다"
              emptyDescription=""
              onRetry={() => void history.refetch()}
              tableClassName="w-full"
            >
              {terms.map((item) => (
                <tr key={item.termsId} className="hover:bg-cool-gray-50">
                  <td className="px-3 py-3">
                    <Link
                      to={`${ROUTES.terms}/${item.termsId}`}
                      className="text-cool-gray-900 block text-sm font-bold break-words underline-offset-4 hover:underline"
                    >
                      {item.title}
                    </Link>
                    <div className="text-cool-gray-500 mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                      <span className="break-all">버전 {item.version}</span>
                      <span>시행일 {item.effectiveDate}</span>
                      <span>
                        게시{' '}
                        {item.publishedAt?.replace('T', ' ').slice(0, 16) ??
                          '-'}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <span className="bg-primary-100 text-primary-200 inline-flex h-7 items-center rounded-full px-2.5 text-xs font-bold whitespace-nowrap">
                      {termsStatusLabel(item.status)}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    {item.status === 'DRAFT' && (
                      <ActionButton
                        variant="danger"
                        disabled={deletion.isPending}
                        onClick={() => {
                          deletion.reset()
                          setTarget(item)
                        }}
                      >
                        삭제
                      </ActionButton>
                    )}
                  </td>
                </tr>
              ))}
            </AdminTable>
            <AdminPagination
              currentPage={page}
              totalPages={history.data?.totalPages ?? 0}
              isDisabled={history.isFetching || deletion.isPending}
              onPageChange={(next) =>
                setParams({ type: selected.type!, page: String(next) })
              }
            />
          </>
        )}
      </section>
      <Dialog.Root
        type="alertdialog"
        open={target !== null}
        onOpenChange={(open) => {
          if (!open && !deletion.isPending) setTarget(null)
        }}
      >
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>초안을 삭제할까요?</Dialog.Title>
            <Dialog.Description>
              {target?.title} ({target?.version})
            </Dialog.Description>
          </Dialog.Header>
          {deletion.error && (
            <p role="alert" className="text-error text-sm">
              {termsErrorMessage(deletion.error)}
            </p>
          )}
          <Dialog.Footer>
            <Button
              size="sm"
              variant="neutral"
              disabled={deletion.isPending}
              onClick={() => setTarget(null)}
            >
              취소
            </Button>
            <Button
              size="sm"
              disabled={deletion.isPending}
              loading={deletion.isPending}
              onClick={() => {
                if (
                  !target?.termsId ||
                  target.status !== 'DRAFT' ||
                  deleting.current
                )
                  return
                deleting.current = true
                deletion.mutate(target.termsId, {
                  onSuccess: () => {
                    setTarget(null)
                    if (terms.length === 1 && page > 0)
                      setParams(
                        { type: selected!.type!, page: String(page - 1) },
                        { replace: true },
                      )
                  },
                  onSettled: () => {
                    deleting.current = false
                  },
                })
              }}
            >
              삭제
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Root>
    </>
  )
}
