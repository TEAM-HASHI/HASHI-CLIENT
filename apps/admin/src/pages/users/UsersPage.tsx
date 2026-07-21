import { useEffect, useMemo, useState } from 'react'
import type { AdminUserSort } from '@/pages/users/api/getAdminUsers'
import { UserTable } from '@/pages/users/components/UserTable'
import { useAdminUsersQuery } from '@/pages/users/queries/useAdminUsersQuery'
import { AdminSearchInput } from '@/shared/components/AdminSearchInput'
import { AdminPagination } from '@/shared/components/AdminPagination'
import { AdminSelect } from '@/shared/components/AdminSelect'
import { AdminToolbar } from '@/shared/components/AdminToolbar'
import { PageHeader } from '@/shared/components/PageHeader'

const PAGE_SIZE = 20
const SEARCH_DEBOUNCE_MS = 300

const sortOptions = [
  { value: 'NICKNAME', label: '닉네임 가나다순' },
  { value: 'CREATED_AT', label: '가입일 최신순' },
] satisfies { value: AdminUserSort; label: string }[]

export const UsersPage = () => {
  const [draftKeyword, setDraftKeyword] = useState('')
  const [keyword, setKeyword] = useState('')
  const [sort, setSort] = useState<AdminUserSort>('CREATED_AT')
  const [page, setPage] = useState(0)

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      setKeyword(draftKeyword.trim())
      setPage(0)
    }, SEARCH_DEBOUNCE_MS)

    return () => window.clearTimeout(timerId)
  }, [draftKeyword])

  const queryParams = useMemo(
    () => ({
      sort,
      ...(keyword ? { keyword } : {}),
      page,
      size: PAGE_SIZE,
    }),
    [keyword, page, sort],
  )
  const usersQuery = useAdminUsersQuery(queryParams)
  const result = usersQuery.data
  const users = result?.users ?? []
  const totalPages = result?.totalPages ?? 0
  const hasKeyword = keyword.length > 0

  const handleSortChange = (nextSort: AdminUserSort) => {
    setSort(nextSort)
    setPage(0)
  }

  return (
    <>
      <PageHeader
        title="회원 관리"
        description="가입한 회원을 검색하고 기본 정보를 확인합니다."
      />

      <AdminToolbar>
        <div className="flex min-w-0 flex-1 items-end gap-2">
          <AdminSearchInput
            value={draftKeyword}
            placeholder="닉네임 검색"
            onChange={setDraftKeyword}
          />
        </div>
        <AdminSelect
          label="정렬 기준"
          value={sort}
          options={sortOptions}
          onChange={handleSortChange}
          className="xl:w-52"
        />
      </AdminToolbar>

      <section className="px-5 py-5 lg:px-8">
        <div className="text-cool-gray-500 mb-3 flex min-h-5 flex-wrap items-center justify-between gap-2 text-sm">
          <span>총 {(result?.totalCount ?? 0).toLocaleString()}명</span>
          {usersQuery.isFetching && !usersQuery.isLoading ? (
            <span role="status" className="text-primary-200 font-semibold">
              목록 갱신 중
            </span>
          ) : null}
        </div>

        <UserTable
          users={users}
          isLoading={usersQuery.isLoading}
          isError={usersQuery.isError}
          emptyTitle={
            hasKeyword ? '검색 결과가 없습니다' : '가입한 회원이 없습니다'
          }
          emptyDescription={
            hasKeyword
              ? '다른 닉네임으로 다시 검색해주세요.'
              : '회원이 가입하면 이곳에 표시됩니다.'
          }
          onRetry={() => void usersQuery.refetch()}
        />

        <AdminPagination
          currentPage={page}
          totalPages={totalPages}
          isDisabled={usersQuery.isFetching}
          onPageChange={setPage}
        />
      </section>
    </>
  )
}
