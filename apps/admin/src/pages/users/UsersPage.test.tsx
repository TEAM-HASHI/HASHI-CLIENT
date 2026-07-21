import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { UsersPage } from '@/pages/users/UsersPage'
import { useAdminUsersQuery } from '@/pages/users/queries/useAdminUsersQuery'

vi.mock('@/pages/users/queries/useAdminUsersQuery', () => ({
  useAdminUsersQuery: vi.fn(),
}))

const useAdminUsersQueryMock = vi.mocked(useAdminUsersQuery)
const refetchMock = vi.fn()

const userRecord = {
  userId: 7,
  nickname: '더미',
  nameEng: null,
  birthDate: '1972-03-23',
  phone: '01076929234',
  email: 'dummy@hashi.dev',
  profileImageUrl: null,
  createdAt: '2026-07-14T18:08:31.114514',
}

const createQueryResult = ({
  data = {
    users: [userRecord],
    page: 0,
    size: 20,
    totalCount: 21,
    totalPages: 2,
  },
  isError = false,
  isFetching = false,
  isLoading = false,
}: {
  data?: {
    users: (typeof userRecord)[]
    page: number
    size: number
    totalCount: number
    totalPages: number
  }
  isError?: boolean
  isFetching?: boolean
  isLoading?: boolean
} = {}) =>
  ({
    data,
    isError,
    isFetching,
    isLoading,
    refetch: refetchMock,
  }) as unknown as ReturnType<typeof useAdminUsersQuery>

describe('UsersPage', () => {
  beforeEach(() => {
    refetchMock.mockReset()
    useAdminUsersQueryMock.mockReset()
    useAdminUsersQueryMock.mockReturnValue(createQueryResult())
  })

  it('loads members with the newest-registration sort by default', () => {
    render(<UsersPage />)

    expect(useAdminUsersQueryMock).toHaveBeenLastCalledWith({
      sort: 'CREATED_AT',
      page: 0,
      size: 20,
    })
    expect(
      screen.getByRole('button', { name: /정렬 기준 가입일 최신순/ }),
    ).toBeInTheDocument()
    expect(screen.getByText('더미')).toBeInTheDocument()
    expect(screen.getByText('dummy@hashi.dev')).toBeInTheDocument()
    expect(screen.getByText('총 21명')).toBeInTheDocument()
    expect(screen.queryByText('1 / 2 페이지')).not.toBeInTheDocument()
  })

  it('debounces nickname input and searches with the last trimmed value', () => {
    vi.useFakeTimers()

    try {
      render(<UsersPage />)

      fireEvent.click(screen.getByRole('button', { name: '다음 페이지' }))
      fireEvent.change(screen.getByPlaceholderText('닉네임 검색'), {
        target: { value: '  더' },
      })
      act(() => vi.advanceTimersByTime(200))
      fireEvent.change(screen.getByPlaceholderText('닉네임 검색'), {
        target: { value: '  더미  ' },
      })
      act(() => vi.advanceTimersByTime(299))

      expect(useAdminUsersQueryMock).toHaveBeenLastCalledWith({
        sort: 'CREATED_AT',
        page: 1,
        size: 20,
      })

      act(() => vi.advanceTimersByTime(1))

      expect(useAdminUsersQueryMock).toHaveBeenLastCalledWith({
        sort: 'CREATED_AT',
        keyword: '더미',
        page: 0,
        size: 20,
      })
      expect(
        screen.queryByRole('button', { name: '검색' }),
      ).not.toBeInTheDocument()
    } finally {
      vi.useRealTimers()
    }
  })

  it('returns to the full member list after clearing the search input', () => {
    vi.useFakeTimers()

    try {
      render(<UsersPage />)
      const input = screen.getByPlaceholderText('닉네임 검색')

      fireEvent.change(input, { target: { value: '더미' } })
      act(() => vi.advanceTimersByTime(300))

      expect(useAdminUsersQueryMock).toHaveBeenLastCalledWith({
        sort: 'CREATED_AT',
        keyword: '더미',
        page: 0,
        size: 20,
      })

      fireEvent.change(input, { target: { value: '' } })
      act(() => vi.advanceTimersByTime(300))

      expect(useAdminUsersQueryMock).toHaveBeenLastCalledWith({
        sort: 'CREATED_AT',
        page: 0,
        size: 20,
      })
    } finally {
      vi.useRealTimers()
    }
  })

  it('changes to nickname sorting and resets pagination', async () => {
    const user = userEvent.setup()
    render(<UsersPage />)

    await user.click(screen.getByRole('button', { name: '다음 페이지' }))
    await user.click(
      screen.getByRole('button', { name: /정렬 기준 가입일 최신순/ }),
    )
    await user.click(
      await screen.findByRole('option', { name: '닉네임 가나다순' }),
    )

    expect(useAdminUsersQueryMock).toHaveBeenLastCalledWith({
      sort: 'NICKNAME',
      page: 0,
      size: 20,
    })
  })

  it('renders nullable profile fields with visible fallbacks', () => {
    render(<UsersPage />)

    expect(screen.getByText('-')).toBeInTheDocument()
    expect(
      screen.getByRole('img', { name: '더미 프로필 이미지 없음' }),
    ).toHaveTextContent('더')
    expect(screen.getByText('2026-07-14 18:08')).toBeInTheDocument()
  })

  it('describes an empty nickname result', () => {
    vi.useFakeTimers()
    useAdminUsersQueryMock.mockImplementation((params) =>
      createQueryResult({
        data: {
          users: params.keyword ? [] : [userRecord],
          page: 0,
          size: 20,
          totalCount: params.keyword ? 0 : 1,
          totalPages: params.keyword ? 0 : 1,
        },
      }),
    )

    try {
      render(<UsersPage />)

      fireEvent.change(screen.getByPlaceholderText('닉네임 검색'), {
        target: { value: '없는회원' },
      })
      act(() => vi.advanceTimersByTime(300))

      expect(screen.getByText('검색 결과가 없습니다')).toBeInTheDocument()
    } finally {
      vi.useRealTimers()
    }
  })

  it('offers retry after a list error', async () => {
    const user = userEvent.setup()
    useAdminUsersQueryMock.mockReturnValue(createQueryResult({ isError: true }))
    render(<UsersPage />)

    await user.click(screen.getByRole('button', { name: '다시 시도' }))

    expect(refetchMock).toHaveBeenCalledOnce()
  })

  it('announces background list updates', () => {
    useAdminUsersQueryMock.mockReturnValue(
      createQueryResult({ isFetching: true }),
    )
    render(<UsersPage />)

    expect(screen.getByRole('status')).toHaveTextContent('목록 갱신 중')
  })

  it('moves directly by page number and disables navigation at boundaries', async () => {
    const user = userEvent.setup()
    useAdminUsersQueryMock.mockImplementation((params) =>
      createQueryResult({
        data: {
          users: [userRecord],
          page: params.page,
          size: 20,
          totalCount: 21,
          totalPages: 2,
        },
      }),
    )
    render(<UsersPage />)

    expect(screen.getByRole('button', { name: '이전 페이지' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '1페이지' })).toHaveAttribute(
      'aria-current',
      'page',
    )

    await user.click(screen.getByRole('button', { name: '2페이지' }))

    expect(useAdminUsersQueryMock).toHaveBeenLastCalledWith({
      sort: 'CREATED_AT',
      page: 1,
      size: 20,
    })

    await waitFor(() =>
      expect(screen.getByRole('button', { name: '2페이지' })).toHaveAttribute(
        'aria-current',
        'page',
      ),
    )
    expect(screen.getByRole('button', { name: '다음 페이지' })).toBeDisabled()
  })
})
