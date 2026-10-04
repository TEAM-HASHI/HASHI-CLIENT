import '@testing-library/jest-dom/vitest'
import { type InfiniteData, QueryClientProvider } from '@tanstack/react-query'
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ROUTES } from '@/app/router/path'
import { getRestaurants } from '@/features/restaurantList'
import type { RestaurantsResult } from '@/features/restaurantList/api/getRestaurants'
import { restaurantsInfiniteQueryOptions } from '@/features/restaurantList/queries/useRestaurantsInfiniteQuery'
import { HotSnsRestaurantsPage } from '@/pages/hotSnsRestaurants/HotSnsRestaurantsPage'
import { createQueryClient } from '@/shared/lib/queryClient'
import { mockIntersectionObserver } from '@/test/mockIntersectionObserver'

vi.mock('@/features/restaurantList/api/getRestaurants', () => ({
  getRestaurants: vi.fn(),
}))

const mockedGetRestaurants = vi.mocked(getRestaurants)

const createRestaurant = (restaurantId: number, name = 'SNS 식당') => ({
  area: '도쿄',
  foodCategory: '스시',
  hashtags: ['핫플'],
  imageUrls: [],
  name,
  rating: 4.5,
  restaurantId,
  summary: 'SNS에서 주목받는 식당',
})

const DetailPage = () => {
  const navigate = useNavigate()

  return <button onClick={() => navigate(-1)}>목록으로 돌아가기</button>
}

const renderHotSnsRestaurantsPage = (
  initialEntry: string = ROUTES.hotSnsRestaurants,
  queryClient = createQueryClient(),
) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route
            element={<HotSnsRestaurantsPage />}
            path={ROUTES.hotSnsRestaurants}
          />
          <Route element={<DetailPage />} path={ROUTES.restaurantDetail} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('HotSnsRestaurantsPage', () => {
  beforeEach(() => {
    mockedGetRestaurants.mockResolvedValue({
      hasNext: false,
      nextCursor: undefined,
      restaurants: [],
    })
  })

  afterEach(() => {
    cleanup()
    mockedGetRestaurants.mockReset()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('requests SNS hot restaurants with the selected sort', async () => {
    renderHotSnsRestaurantsPage()

    await waitFor(() => {
      expect(mockedGetRestaurants).toHaveBeenLastCalledWith({
        genre: 'all',
        size: 10,
        sort: 'popular',
        type: 'sns-hot',
      })
    })

    fireEvent.click(screen.getByRole('button', { name: '최신순' }))

    await waitFor(() => {
      expect(mockedGetRestaurants).toHaveBeenLastCalledWith({
        genre: 'all',
        size: 10,
        sort: 'basic',
        type: 'sns-hot',
      })
    })

    fireEvent.click(screen.getByRole('button', { name: '별점순' }))

    await waitFor(() => {
      expect(mockedGetRestaurants).toHaveBeenLastCalledWith({
        genre: 'all',
        size: 10,
        sort: 'rating',
        type: 'sns-hot',
      })
    })
  })

  it('clears the previous list and scrolls to the top when sort changes', async () => {
    const scrollTo = vi.fn()
    vi.stubGlobal('scrollTo', scrollTo)
    mockedGetRestaurants
      .mockResolvedValueOnce({
        hasNext: false,
        nextCursor: undefined,
        restaurants: [createRestaurant(1, '기존 식당')],
      })
      .mockReturnValueOnce(new Promise(() => {}))

    renderHotSnsRestaurantsPage()
    await screen.findByRole('button', { name: /기존 식당/ })

    fireEvent.click(screen.getByRole('button', { name: '최신순' }))

    expect(screen.queryByRole('button', { name: /기존 식당/ })).toBeNull()
    expect(scrollTo).toHaveBeenCalledWith({ behavior: 'auto', top: 0 })
  })

  it('keeps loaded cards and offers retry when the next page fails', async () => {
    mockedGetRestaurants
      .mockResolvedValueOnce({
        hasNext: true,
        nextCursor: 'next-1',
        restaurants: [createRestaurant(1, '기존 식당')],
      })
      .mockRejectedValueOnce(new Error('next page failed'))
    const { triggerIntersect } = mockIntersectionObserver()

    renderHotSnsRestaurantsPage()
    await screen.findByRole('button', { name: /기존 식당/ })
    await screen.findByTestId('restaurant-list-load-more')

    triggerIntersect()

    expect(
      await screen.findByText('식당을 더 불러오지 못했습니다.'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /기존 식당/ }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: '다시 시도' }),
    ).toBeInTheDocument()
  })

  it('waits for background refetch before loading the next page', async () => {
    const queryClient = createQueryClient()
    queryClient.setDefaultOptions({ queries: { staleTime: 0, retry: false } })
    const options = restaurantsInfiniteQueryOptions({
      genre: 'all',
      size: 10,
      sort: 'popular',
      type: 'sns-hot',
    })
    const cachedPage = {
      hasNext: true,
      nextCursor: 'next',
      restaurants: [createRestaurant(1, '기존 식당')],
    }
    queryClient.setQueryData(options.queryKey, {
      pages: [cachedPage],
      pageParams: [null],
    })
    let completeRefetch!: (
      result: Awaited<ReturnType<typeof getRestaurants>>,
    ) => void
    mockedGetRestaurants
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            completeRefetch = resolve
          }),
      )
      .mockResolvedValueOnce({
        hasNext: false,
        nextCursor: undefined,
        restaurants: [createRestaurant(2, '다음 식당')],
      })
    const { triggerIntersect, observe } = mockIntersectionObserver()

    renderHotSnsRestaurantsPage(ROUTES.hotSnsRestaurants, queryClient)
    await screen.findByRole('button', { name: /기존 식당/ })
    triggerIntersect()
    expect(mockedGetRestaurants).toHaveBeenCalledTimes(1)

    await act(async () => {
      completeRefetch(cachedPage)
    })
    await waitFor(() => {
      expect(observe).toHaveBeenCalled()
    })
    triggerIntersect()
    await screen.findByRole('button', { name: /다음 식당/ })
    expect(mockedGetRestaurants).toHaveBeenLastCalledWith(
      expect.objectContaining({ cursor: 'next' }),
    )
  })

  it('restores selected sort and scroll position after returning from detail', async () => {
    const scrollTo = vi.fn()
    vi.stubGlobal('scrollTo', scrollTo)
    vi.spyOn(window, 'scrollY', 'get').mockReturnValue(420)
    mockedGetRestaurants.mockResolvedValue({
      hasNext: false,
      nextCursor: undefined,
      restaurants: [createRestaurant(1)],
    })

    renderHotSnsRestaurantsPage()
    await screen.findByRole('button', { name: /SNS 식당/ })
    fireEvent.click(screen.getByRole('button', { name: '최신순' }))
    await waitFor(() => {
      expect(mockedGetRestaurants).toHaveBeenLastCalledWith(
        expect.objectContaining({ sort: 'basic' }),
      )
    })
    await screen.findByRole('button', { name: /SNS 식당/ })
    scrollTo.mockClear()

    fireEvent.click(screen.getByRole('button', { name: /SNS 식당/ }))
    fireEvent.click(screen.getByRole('button', { name: '목록으로 돌아가기' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '최신순' })).toHaveAttribute(
        'aria-pressed',
        'true',
      )
      expect(scrollTo).toHaveBeenCalledWith({ behavior: 'auto', top: 420 })
    })
  })

  it.each([false, true])(
    'recovers from a background refetch failure (partial cache: %s)',
    async (partialCache) => {
      const queryClient = createQueryClient()
      queryClient.setDefaultOptions({ queries: { retry: false, staleTime: 0 } })
      const scrollTo = vi.fn()
      vi.stubGlobal('scrollTo', scrollTo)
      vi.spyOn(window, 'scrollY', 'get').mockReturnValue(1200)
      mockedGetRestaurants.mockImplementation(async ({ cursor }) => ({
        hasNext: cursor !== 'page-3',
        nextCursor: cursor === 'page-2' ? 'page-3' : 'page-2',
        restaurants: [
          createRestaurant(
            cursor === 'page-3' ? 3 : cursor ? 2 : 1,
            `식당 ${cursor ?? 'first'}`,
          ),
        ],
      }))
      const { triggerIntersect } = mockIntersectionObserver()
      renderHotSnsRestaurantsPage(ROUTES.hotSnsRestaurants, queryClient)
      await screen.findByRole('button', { name: /식당 first/ })
      triggerIntersect()
      await screen.findByRole('button', { name: /식당 page-2/ })
      fireEvent.click(screen.getByRole('button', { name: /식당 page-2/ }))

      if (partialCache) {
        queryClient.setQueriesData<InfiniteData<RestaurantsResult>>(
          { queryKey: ['restaurantList'] },
          (data) =>
            data && {
              pages: data.pages.slice(0, 1),
              pageParams: data.pageParams.slice(0, 1),
            },
        )
      }
      mockedGetRestaurants.mockRejectedValueOnce(
        new Error('background refetch failed'),
      )
      scrollTo.mockClear()
      fireEvent.click(screen.getByRole('button', { name: '목록으로 돌아가기' }))

      if (partialCache) {
        await screen.findByText('식당을 더 불러오지 못했습니다.')
        expect(scrollTo).not.toHaveBeenCalled()
        expect(
          screen.getByRole('button', { name: /식당 first/ }),
        ).toBeInTheDocument()
        fireEvent.click(screen.getByRole('button', { name: '다시 시도' }))
      }
      await waitFor(() => {
        expect(scrollTo).toHaveBeenCalledWith({ behavior: 'auto', top: 1200 })
      })
      await screen.findByRole('button', { name: /식당 page-2/ })
      triggerIntersect()
      await screen.findByRole('button', { name: /식당 page-3/ })
    },
  )

  it.each([false, true])(
    'rebuilds expired pages before scroll restoration (retry: %s)',
    async (failDuringRestoration) => {
      const queryClient = createQueryClient()
      const scrollTo = vi.fn()
      vi.stubGlobal('scrollTo', scrollTo)
      vi.spyOn(window, 'scrollY', 'get').mockReturnValue(6500)
      let shouldFail = false
      mockedGetRestaurants.mockImplementation(async ({ cursor }) => {
        if (shouldFail && cursor === 'page-2') {
          shouldFail = false
          throw new Error('restoration failed')
        }
        return {
          hasNext: cursor !== 'page-3',
          nextCursor: cursor === 'page-2' ? 'page-3' : 'page-2',
          restaurants: [
            createRestaurant(
              cursor === 'page-3' ? 3 : cursor ? 2 : 1,
              `식당 ${cursor ?? 'first'}`,
            ),
          ],
        }
      })
      const { triggerIntersect } = mockIntersectionObserver()
      renderHotSnsRestaurantsPage(ROUTES.hotSnsRestaurants, queryClient)
      await screen.findByRole('button', { name: /식당 first/ })
      triggerIntersect()
      await screen.findByRole('button', { name: /식당 page-2/ })
      triggerIntersect()
      await screen.findByRole('button', { name: /식당 page-3/ })

      fireEvent.click(screen.getByRole('button', { name: /식당 page-3/ }))
      queryClient.removeQueries({ queryKey: ['restaurantList'] })
      shouldFail = failDuringRestoration
      scrollTo.mockClear()
      fireEvent.click(screen.getByRole('button', { name: '목록으로 돌아가기' }))

      if (failDuringRestoration) {
        await screen.findByText('식당을 더 불러오지 못했습니다.')
        expect(scrollTo).not.toHaveBeenCalled()
        expect(
          screen.getByRole('button', { name: /식당 first/ }),
        ).toBeInTheDocument()
        fireEvent.click(screen.getByRole('button', { name: '다시 시도' }))
      }

      await screen.findByRole('button', { name: /식당 page-3/ })
      await waitFor(() => {
        expect(scrollTo).toHaveBeenCalledWith({ behavior: 'auto', top: 6500 })
      })
      expect(
        screen.getByRole('button', { name: /식당 first/ }),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /식당 page-2/ }),
      ).toBeInTheDocument()
    },
  )
})
