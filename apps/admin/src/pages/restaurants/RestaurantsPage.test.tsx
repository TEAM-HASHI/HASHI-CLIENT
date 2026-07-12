import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { RestaurantsPage } from '@/pages/restaurants/RestaurantsPage'
import {
  useCreateRestaurantMutation,
  useDeleteRestaurantMutation,
  useUpdateRestaurantMutation,
} from '@/pages/restaurants/mutations/useRestaurantMutations'
import { useRestaurantCatalogQuery } from '@/pages/restaurants/queries/useRestaurantCatalogQuery'
import { useRestaurantPrefillQuery } from '@/pages/restaurants/queries/useRestaurantPrefillQuery'

vi.mock('@/pages/restaurants/queries/useRestaurantCatalogQuery', () => ({
  useRestaurantCatalogQuery: vi.fn(),
}))
vi.mock('@/pages/restaurants/queries/useRestaurantPrefillQuery', () => ({
  useRestaurantPrefillQuery: vi.fn(),
}))
vi.mock('@/pages/restaurants/mutations/useRestaurantMutations', () => ({
  useCreateRestaurantMutation: vi.fn(),
  useUpdateRestaurantMutation: vi.fn(),
  useDeleteRestaurantMutation: vi.fn(),
}))

const deleteMock = vi.fn()
const mutation = (mutate = vi.fn()) => ({
  mutate,
  reset: vi.fn(),
  isPending: false,
  isError: false,
  error: null,
})

describe('RestaurantsPage', () => {
  beforeEach(() => {
    deleteMock.mockReset()
    vi.mocked(useRestaurantCatalogQuery).mockReturnValue({
      data: {
        pages: [
          {
            content: [
              {
                restaurantId: 12,
                name: '하시 스시',
                genre: 'sushi',
                foodCategory: 'sushi',
                area: '시부야',
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
    } as unknown as ReturnType<typeof useRestaurantCatalogQuery>)
    vi.mocked(useRestaurantPrefillQuery).mockReturnValue({
      isLoading: false,
      isError: false,
      isSuccess: false,
      data: undefined,
    } as unknown as ReturnType<typeof useRestaurantPrefillQuery>)
    vi.mocked(useCreateRestaurantMutation).mockReturnValue(
      mutation() as unknown as ReturnType<typeof useCreateRestaurantMutation>,
    )
    vi.mocked(useUpdateRestaurantMutation).mockReturnValue(
      mutation() as unknown as ReturnType<typeof useUpdateRestaurantMutation>,
    )
    vi.mocked(useDeleteRestaurantMutation).mockReturnValue(
      mutation(deleteMock) as unknown as ReturnType<
        typeof useDeleteRestaurantMutation
      >,
    )
  })

  it('renders the published list and opens the four-step create drawer', async () => {
    const user = userEvent.setup()
    render(<RestaurantsPage />)

    expect(screen.getByText('현재 공개 중인 식당')).toBeVisible()
    expect(screen.getByText('하시 스시')).toBeVisible()
    expect(screen.queryByLabelText('Mock 상태')).not.toBeInTheDocument()

    const registerButton = screen.getByRole('button', { name: '식당 등록' })
    expect(
      registerButton.querySelector(':scope > span[aria-hidden="true"] svg'),
    ).not.toBeNull()
    expect(registerButton.querySelector('.min-w-0.truncate svg')).toBeNull()

    await user.click(registerButton)

    expect(screen.getByRole('dialog')).toBeVisible()
    expect(
      screen.queryByText('백엔드 등록 규칙에 맞춰 4단계로 입력합니다.'),
    ).not.toBeInTheDocument()
    expect(screen.getByText('1. 기본 정보')).toBeVisible()
    expect(screen.getByText('4. 메뉴·노출')).toBeVisible()
    expect(
      screen.getAllByRole('button', { name: /장르|음식 카테고리/ }).length,
    ).toBeGreaterThan(0)
  })

  it('supports soft delete by direct numeric ID', async () => {
    const user = userEvent.setup()
    render(<RestaurantsPage />)

    await user.type(screen.getByLabelText('식당 ID'), '91')
    await user.click(screen.getByRole('button', { name: 'ID로 비공개 처리' }))
    expect(screen.getByText(/소프트 삭제/)).toBeVisible()
    await user.click(
      within(screen.getByRole('alertdialog')).getByRole('button', {
        name: '비공개 처리',
      }),
    )

    expect(deleteMock).toHaveBeenCalledWith(91, expect.any(Object))
  })
})
