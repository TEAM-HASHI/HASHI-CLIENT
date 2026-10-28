import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, expect, it, vi } from 'vitest'
import { MagazineFormDrawer } from '@/pages/magazines/components/MagazineFormDrawer'
import { useMagazineDetailQuery } from '@/pages/magazines/queries/useMagazineDetailQuery'
import { useRestaurantCatalogQuery } from '@/pages/restaurants/queries/useRestaurantCatalogQuery'
import {
  useCreateMagazineMutation,
  useUpdateMagazineMutation,
} from '@/pages/magazines/mutations/useMagazineMutations'

vi.mock('@/pages/magazines/queries/useMagazineDetailQuery', () => ({
  useMagazineDetailQuery: vi.fn(),
}))
vi.mock('@/pages/restaurants/queries/useRestaurantCatalogQuery', () => ({
  useRestaurantCatalogQuery: vi.fn(),
}))
vi.mock('@/pages/magazines/mutations/useMagazineMutations', () => ({
  useCreateMagazineMutation: vi.fn(),
  useUpdateMagazineMutation: vi.fn(),
}))

const mutate = vi.fn()
const detail = {
  title: '기존 제목',
  content: '기존 본문',
  hashtags: ['도쿄'],
  restaurants: [{ restaurantId: 1001, name: '기존 식당' }],
  cardNewsImages: [
    { cardNewsId: 1, legacyUrl: 'https://example.com/card.jpg' },
  ],
}
const props = {
  open: true,
  mode: 'update' as const,
  magazineId: 5,
  item: null,
  onClose: vi.fn(),
}
const queryResult = (data: typeof detail | undefined, isError = false) =>
  ({ data, isError, refetch: vi.fn() }) as unknown as ReturnType<
    typeof useMagazineDetailQuery
  >
const mutationResult = (isError = false) => ({
  mutate,
  isPending: false,
  isError,
  error: isError ? new Error('저장 실패') : null,
})

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(useMagazineDetailQuery).mockReturnValue(queryResult(detail))
  vi.mocked(useRestaurantCatalogQuery).mockReturnValue({
    data: { pages: [{ content: [{ restaurantId: 1002, name: '새 식당' }] }] },
    isPending: false,
    isError: false,
  } as unknown as ReturnType<typeof useRestaurantCatalogQuery>)
  vi.mocked(useCreateMagazineMutation).mockReturnValue(
    mutationResult() as unknown as ReturnType<typeof useCreateMagazineMutation>,
  )
  vi.mocked(useUpdateMagazineMutation).mockReturnValue(
    mutationResult() as unknown as ReturnType<typeof useUpdateMagazineMutation>,
  )
})

it('preserves the draft and ordered restaurant selections across refetch and save failure without resending untouched lists', () => {
  const view = render(<MagazineFormDrawer {...props} />)
  fireEvent.change(screen.getByLabelText('본문'), {
    target: { value: '작성 중인 본문' },
  })
  fireEvent.click(screen.getByRole('checkbox', { name: '새 식당 선택' }))
  fireEvent.click(screen.getByRole('button', { name: '새 식당 앞으로 이동' }))
  vi.mocked(useMagazineDetailQuery).mockReturnValue(
    queryResult({ ...detail, content: '재조회 본문' }),
  )
  vi.mocked(useUpdateMagazineMutation).mockReturnValue(
    mutationResult(true) as unknown as ReturnType<
      typeof useUpdateMagazineMutation
    >,
  )
  view.rerender(<MagazineFormDrawer {...props} />)
  expect(screen.getByLabelText('본문')).toHaveValue('작성 중인 본문')
  expect(screen.getByLabelText('해시태그')).toHaveValue('도쿄')
  fireEvent.click(screen.getByRole('button', { name: '변경사항 저장' }))
  expect(mutate).toHaveBeenCalledWith(
    {
      magazineId: 5,
      input: { content: '작성 중인 본문', restaurantIds: [1002, 1001] },
    },
    expect.anything(),
  )
})

it('blocks saving after detail load failure, enforces the selection limit, and only clears lists when explicitly edited', () => {
  vi.mocked(useMagazineDetailQuery).mockReturnValue(
    queryResult(undefined, true),
  )
  const view = render(<MagazineFormDrawer {...props} />)
  expect(
    screen.queryByRole('button', { name: '변경사항 저장' }),
  ).not.toBeInTheDocument()
  expect(screen.getByRole('alert')).toHaveTextContent('불러오지 못했습니다')
  vi.mocked(useMagazineDetailQuery).mockReturnValue(
    queryResult({
      ...detail,
      restaurants: Array.from({ length: 10 }, (_, index) => ({
        restaurantId: index + 1,
        name: `기존 식당 ${index + 1}`,
      })),
    }),
  )
  view.rerender(<MagazineFormDrawer {...props} />)
  expect(screen.getByRole('checkbox', { name: '새 식당 선택' })).toBeDisabled()
  fireEvent.click(screen.getByRole('button', { name: '기존 식당 1 연결 제거' }))
  expect(screen.getByRole('checkbox', { name: '새 식당 선택' })).toBeEnabled()
  for (const label of ['본문', '해시태그'])
    fireEvent.change(screen.getByLabelText(label), { target: { value: '' } })
  for (const button of screen.getAllByRole('button', { name: /연결 제거$/ }))
    fireEvent.click(button)
  fireEvent.click(screen.getByLabelText('카드뉴스 전체 교체'))
  fireEvent.click(screen.getByRole('button', { name: '변경사항 저장' }))
  expect(mutate).toHaveBeenCalledWith(
    {
      magazineId: 5,
      input: { content: '', hashtags: [], restaurantIds: [], cardNews: [] },
    },
    expect.anything(),
  )
})
