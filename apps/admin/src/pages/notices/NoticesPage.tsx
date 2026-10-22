import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { PlusIcon } from '@hashi/hds-icons'
import { Button, Dialog } from '@hashi/hds-ui'
import { ROUTES } from '@/app/router/path'
import { AdminTable } from '@/shared/components/AdminTable'
import { ActionButton } from '@/shared/components/ActionButton'
import { AdminPagination } from '@/shared/components/AdminPagination'
import { PageHeader } from '@/shared/components/PageHeader'
import {
  noticeListOptions,
  useDeleteNoticeMutation,
} from '@/pages/notices/queries/noticeQueries'
import { noticeErrorMessage } from '@/pages/notices/noticeForm'

const columns = [
  { key: 'title', label: '제목' },
  { key: 'status', label: '상태', className: 'w-24' },
  { key: 'actions', label: '관리', className: 'w-20' },
]
const formatDate = (value?: string) =>
  value?.replace('T', ' ').slice(0, 16) ?? '-'

export const NoticesPage = () => {
  const [page, setPage] = useState(0)
  const query = useQuery(noticeListOptions(page))
  const deletion = useDeleteNoticeMutation()
  const [target, setTarget] = useState<{ id: number; title: string } | null>(
    null,
  )
  const notices = query.data?.notices ?? []
  return (
    <>
      <PageHeader title="공지사항 관리" description="">
        <Link
          to={ROUTES.noticeNew}
          className="bg-cool-gray-800 typo-body-6 hover:bg-cool-gray-700 inline-flex h-7 items-center justify-center gap-1 rounded-[5px] px-4 whitespace-nowrap text-white"
        >
          <PlusIcon className="size-4" />
          공지사항 작성
        </Link>
      </PageHeader>
      <section className="space-y-4 px-5 py-5 lg:px-8">
        <p className="text-cool-gray-500 text-sm">
          총 {(query.data?.totalCount ?? 0).toLocaleString()}개
        </p>
        <AdminTable
          columns={columns}
          isLoading={query.isLoading}
          isError={query.isError}
          isEmpty={!notices.length}
          emptyTitle="등록된 공지사항이 없습니다"
          emptyDescription=""
          onRetry={() => void query.refetch()}
          tableClassName="w-full"
        >
          {notices.map((notice) => (
            <tr key={notice.noticeId} className="hover:bg-cool-gray-50">
              <td className="px-3 py-3">
                <Link
                  className="text-cool-gray-900 block text-sm font-bold break-words underline-offset-4 hover:underline"
                  to={`${ROUTES.notices}/${notice.noticeId}`}
                >
                  {notice.title}
                </Link>
                <div className="text-cool-gray-500 mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                  <span>게시 {formatDate(notice.publishedAt)}</span>
                  <span>
                    수정 {formatDate(notice.lastModifiedAt ?? notice.updatedAt)}
                  </span>
                </div>
              </td>
              <td className="px-3 py-3">
                <span className="bg-primary-100 text-primary-200 inline-flex h-7 items-center rounded-full px-2.5 text-xs font-bold whitespace-nowrap">
                  {notice.status === 'PUBLISHED' ? '게시됨' : '임시 저장'}
                </span>
              </td>
              <td className="px-3 py-3">
                <ActionButton
                  variant="danger"
                  onClick={() => {
                    deletion.reset()
                    setTarget({
                      id: notice.noticeId!,
                      title: notice.title ?? '',
                    })
                  }}
                >
                  삭제
                </ActionButton>
              </td>
            </tr>
          ))}
        </AdminTable>
        <AdminPagination
          currentPage={page}
          totalPages={query.data?.totalPages ?? 0}
          isDisabled={query.isFetching || deletion.isPending}
          onPageChange={setPage}
        />
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
            <Dialog.Title>공지사항을 삭제할까요?</Dialog.Title>
            <Dialog.Description>{target?.title}</Dialog.Description>
          </Dialog.Header>
          {deletion.error && (
            <p role="alert" className="text-error text-sm">
              {noticeErrorMessage(deletion.error)}
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
                if (target && !deletion.isPending)
                  deletion.mutate(target.id, {
                    onSuccess: () => {
                      setTarget(null)
                      if (notices.length === 1 && page > 0) setPage(page - 1)
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
