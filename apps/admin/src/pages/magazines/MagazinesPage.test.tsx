import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MagazinesPage } from '@/pages/magazines/MagazinesPage'
import {
  useCreateMagazineMutation,
  useDeleteMagazineMutation,
  useUpdateMagazineMutation,
} from '@/pages/magazines/mutations/useMagazineMutations'
import { useMagazineCatalogQuery } from '@/pages/magazines/queries/useMagazineCatalogQuery'

vi.mock('@/pages/magazines/queries/useMagazineCatalogQuery', () => ({
  useMagazineCatalogQuery: vi.fn(),
}))
vi.mock('@/pages/magazines/mutations/useMagazineMutations', () => ({
  useCreateMagazineMutation: vi.fn(),
  useUpdateMagazineMutation: vi.fn(),
  useDeleteMagazineMutation: vi.fn(),
}))

const deleteMock = vi.fn()
const mutation = (mutate = vi.fn()) => ({
  mutate,
  reset: vi.fn(),
  isPending: false,
  isError: false,
  error: null,
})

describe('MagazinesPage', () => {
  beforeEach(() => {
    deleteMock.mockReset()
    vi.mocked(useMagazineCatalogQuery).mockReturnValue({
      data: {
        pages: [
          {
            magazines: [
              {
                magazineId: 5,
                title: '도쿄의 밤',
                instagramRedirectUrl: 'https://instagram.com/p/hashi',
              },
            ],
          },
        ],
      },
      isLoading: false,
      isError: false,
      hasNextPage: false,
      isFetchingNextPage: false,
      refetch: vi.fn(),
      fetchNextPage: vi.fn(),
    } as unknown as ReturnType<typeof useMagazineCatalogQuery>)
    vi.mocked(useCreateMagazineMutation).mockReturnValue(
      mutation() as unknown as ReturnType<typeof useCreateMagazineMutation>,
    )
    vi.mocked(useUpdateMagazineMutation).mockReturnValue(
      mutation() as unknown as ReturnType<typeof useUpdateMagazineMutation>,
    )
    vi.mocked(useDeleteMagazineMutation).mockReturnValue(
      mutation(deleteMock) as unknown as ReturnType<
        typeof useDeleteMagazineMutation
      >,
    )
  })

  it('renders the published list and upload-first create drawer', async () => {
    const user = userEvent.setup()
    render(<MagazinesPage />)

    expect(screen.getByText('현재 공개 중인 매거진')).toBeVisible()
    expect(screen.getByText('도쿄의 밤')).toBeVisible()
    expect(screen.queryByText('카드뉴스')).not.toBeInTheDocument()

    const registerButton = screen.getByRole('button', { name: '매거진 등록' })
    expect(
      registerButton.querySelector(':scope > span[aria-hidden="true"] svg'),
    ).not.toBeNull()
    expect(registerButton.querySelector('.min-w-0.truncate svg')).toBeNull()

    await user.click(registerButton)

    expect(screen.getByRole('dialog')).toBeVisible()
    expect(screen.getByLabelText('배너 이미지 선택')).toBeInTheDocument()
    expect(screen.getByLabelText('썸네일 이미지 선택')).toBeInTheDocument()
    expect(screen.queryByLabelText('배너 이미지 key')).not.toBeInTheDocument()
  })

  it('supports direct ID delete', async () => {
    const user = userEvent.setup()
    render(<MagazinesPage />)

    await user.type(screen.getByLabelText('매거진 ID'), '12')
    await user.click(screen.getByRole('button', { name: 'ID로 삭제' }))
    await user.click(
      within(screen.getByRole('alertdialog')).getByRole('button', {
        name: '삭제',
      }),
    )

    expect(deleteMock).toHaveBeenCalledWith(12, expect.any(Object))
  })
})
