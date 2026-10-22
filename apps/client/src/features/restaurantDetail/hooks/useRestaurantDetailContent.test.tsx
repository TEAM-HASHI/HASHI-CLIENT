import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

import { getRestaurantMenus } from '@/features/restaurantDetail/api/getRestaurantMenus'
import { getRestaurantReviews } from '@/features/restaurantDetail/api/getRestaurantReviews'
import { getRestaurantStoreInformation } from '@/features/restaurantDetail/api/getRestaurantStoreInformation'
import { useRestaurantDetailContent } from '@/features/restaurantDetail/hooks/useRestaurantDetailContent'
import { restaurantDetailQueryKeys } from '@/features/restaurantDetail/queries/restaurantDetailQueryKeys'
import type { RestaurantDetailTab } from '@/features/restaurantDetail/types/restaurantDetail'
import { REVIEW_PAGE_SIZE } from '@/features/restaurantDetail/constants/restaurantReview'

vi.mock('@/features/restaurantDetail/api/getRestaurantMenus', () => ({
  getRestaurantMenus: vi.fn(),
}))
vi.mock('@/features/restaurantDetail/api/getRestaurantReviews', () => ({
  getRestaurantReviews: vi.fn(),
}))
vi.mock(
  '@/features/restaurantDetail/api/getRestaurantStoreInformation',
  () => ({ getRestaurantStoreInformation: vi.fn() }),
)
vi.mock('@/shared/hooks', () => ({
  useInfiniteScrollTrigger: () => ({ current: null }),
}))

const summary = {
  restaurantId: 10,
  name: '식당',
  address: '도쿄',
  imageUrls: [],
  reservationFee: 0,
  rating: 4.5,
  reviewCount: 12,
}
const menuPage = {
  menus: [{ menuId: 1, name: '메뉴' }],
  hasNext: true,
  nextCursor: 1,
}
const reviewPage = {
  averageRating: 4.5,
  reviewCount: 12,
  reviews: [{ reviewId: 1, reviewerNickname: '방문자' }],
  hasNext: false,
}

const setup = ({
  client = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: 30_000 } },
  }),
  initialTab,
}: { client?: QueryClient; initialTab?: RestaurantDetailTab } = {}) => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
  return {
    client,
    ...renderHook(
      () =>
        useRestaurantDetailContent({
          restaurantId: 10,
          menuPageSize: 10,
          summary,
          initialTab,
        }),
      { wrapper },
    ),
  }
}
beforeEach(() => {
  vi.mocked(getRestaurantStoreInformation).mockResolvedValue({
    restaurantId: 10,
    businessHours: [],
  })
  vi.mocked(getRestaurantMenus).mockResolvedValue(menuPage)
  vi.mocked(getRestaurantReviews).mockResolvedValue(reviewPage)
})
afterEach(() => {
  cleanup()
  vi.resetAllMocks()
})

it('does not block the initial detail or overwrite its rating with unrequested list data', async () => {
  vi.mocked(getRestaurantMenus).mockReturnValue(new Promise(() => {}))
  vi.mocked(getRestaurantReviews).mockReturnValue(new Promise(() => {}))
  const { result } = setup()
  await waitFor(() => expect(result.current.restaurant?.rating).toBe(4.5))
  expect(result.current.restaurant?.reviewCount).toBe(12)
  expect(result.current.isLoading).toBe(false)
  expect(getRestaurantMenus).not.toHaveBeenCalled()
  expect(getRestaurantReviews).not.toHaveBeenCalled()
})

it('applies a successful sort and retains it when a later sort request fails', async () => {
  const { result } = setup()
  act(() => result.current.onTabChange('review'))
  await waitFor(() =>
    expect(result.current.restaurant?.reviews).toHaveLength(1),
  )
  vi.mocked(getRestaurantReviews).mockResolvedValue({
    ...reviewPage,
    reviews: [{ reviewId: 2, reviewerNickname: '다른 방문자' }],
  })
  await act(async () => {
    await result.current.onSelectReviewSort('rating-high')
  })
  await waitFor(() =>
    expect(result.current.selectedReviewSort).toBe('rating-high'),
  )
  expect(result.current.restaurant?.reviews[0].id).toBe('2')
  vi.mocked(getRestaurantReviews).mockClear()
  vi.mocked(getRestaurantReviews).mockRejectedValue(new Error('sort failed'))
  await act(async () => {
    await result.current.onSelectReviewSort('rating-low')
  })
  expect(getRestaurantReviews).toHaveBeenCalledWith(
    expect.objectContaining({ sort: 'rating-low', cursor: undefined }),
  )
  expect(result.current.selectedReviewSort).toBe('rating-high')
  expect(result.current.restaurant?.reviews[0].id).toBe('2')
  expect(result.current.isReviewListError).toBe(false)
})

it('reloads only the first latest page when re-entering reviews with fresh cached pages', async () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: 30_000 } },
  })
  client.setQueryData(
    restaurantDetailQueryKeys.reviews(10, REVIEW_PAGE_SIZE, 'latest'),
    {
      pages: [
        reviewPage,
        {
          ...reviewPage,
          reviews: [{ reviewId: 2, reviewerNickname: '이전 방문자' }],
        },
      ],
      pageParams: [undefined, 1],
    },
  )
  vi.mocked(getRestaurantReviews).mockResolvedValue({
    ...reviewPage,
    reviews: [{ reviewId: 3, reviewerNickname: '새 방문자' }],
  })
  const { result } = setup({ client, initialTab: 'review' })
  await waitFor(() => expect(getRestaurantReviews).toHaveBeenCalledTimes(1))
  expect(getRestaurantReviews).toHaveBeenCalledWith(
    expect.objectContaining({ sort: 'latest', cursor: undefined }),
  )
  await waitFor(() =>
    expect(
      result.current.restaurant?.reviews.map((review) => review.id),
    ).toEqual(['3']),
  )
  expect(
    client.getQueryData(
      restaurantDetailQueryKeys.reviews(10, REVIEW_PAGE_SIZE, 'latest'),
    ),
  ).toMatchObject({ pageParams: [undefined] })
})

it('keeps existing menu pages and retries only the failed next page', async () => {
  const { client, result } = setup()
  act(() => result.current.onTabChange('menu'))
  await waitFor(() => expect(result.current.restaurant?.menus).toHaveLength(1))
  vi.mocked(getRestaurantMenus).mockRejectedValueOnce(
    new Error('next page failed'),
  )
  const query = client
    .getQueryCache()
    .find({ queryKey: restaurantDetailQueryKeys.menus(10, 10), exact: true })!
  await act(async () => {
    await query
      .fetch(undefined, { meta: { fetchMore: { direction: 'forward' } } })
      .catch(() => {})
  })
  await waitFor(() => expect(result.current.isMenuNextPageError).toBe(true))
  expect(result.current.restaurant?.menus).toHaveLength(1)
  vi.mocked(getRestaurantMenus).mockImplementation(async ({ cursor }) => {
    if (cursor === 1)
      return {
        menus: [
          { menuId: 1, name: '중복' },
          { menuId: 2, name: '다음 메뉴' },
        ],
        hasNext: false,
      }
    throw new Error('must not reload the first page')
  })
  await act(async () => {
    await result.current.onRetryMenuList()
  })
  await waitFor(() =>
    expect(result.current.restaurant?.menus.map((menu) => menu.id)).toEqual([
      '1',
      '2',
    ]),
  )
})
