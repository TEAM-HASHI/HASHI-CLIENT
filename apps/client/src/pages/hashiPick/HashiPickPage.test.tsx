import '@testing-library/jest-dom/vitest'
import { QueryClientProvider } from '@tanstack/react-query'
import {
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
import { HashiPickPage } from '@/pages/hashiPick/HashiPickPage'
import { createQueryClient } from '@/shared/lib/queryClient'
import { HttpStatusError } from '@/shared/api/apiError'
import { mockIntersectionObserver } from '@/test/mockIntersectionObserver'

vi.mock('@/features/restaurantList/api/getRestaurants', () => ({
  getRestaurants: vi.fn(),
}))

const mockedGetRestaurants = vi.mocked(getRestaurants)

const RestaurantDetailStub = () => {
  const navigate = useNavigate()

  return <button onClick={() => navigate(-1)}>목록으로 돌아가기</button>
}

const createRestaurantsResult = ({
  count,
  hasNext = false,
  nextCursor,
  startId = 1,
}: {
  count: number
  hasNext?: boolean
  nextCursor?: string
  startId?: number
}): Awaited<ReturnType<typeof getRestaurants>> => {
  return {
    hasNext,
    nextCursor,
    restaurants: Array.from({ length: count }, (_, index) => {
      const restaurantId = startId + index

      return {
        area: '도쿄',
        foodCategory: '초밥',
        hashtags: ['해시태그'],
        imageUrls: [],
        name: `히마와리 스시 ${restaurantId}`,
        rating: 4,
        restaurantId,
        summary: '식당 소개를 여기 간단하게 한 줄 적어주세요.',
      }
    }),
  }
}

const renderHashiPickPage = () => {
  const queryClient = createQueryClient()

  const result = render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[ROUTES.hashiPickRestaurants]}>
        <Routes>
          <Route
            element={<HashiPickPage />}
            path={ROUTES.hashiPickRestaurants}
          />
          <Route
            element={<RestaurantDetailStub />}
            path={ROUTES.restaurantDetail}
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
  return { ...result, queryClient }
}

describe('HashiPickPage', () => {
  it('does not fetch beyond the saved pages when restoring over a shorter cache', async () => {
    const observer = mockIntersectionObserver()
    mockedGetRestaurants.mockImplementation((params) =>
      Promise.resolve(
        createRestaurantsResult({
          count: 10,
          startId: params.cursor === 'third' ? 21 : params.cursor ? 11 : 1,
          hasNext: true,
          nextCursor: params.cursor ? 'third' : 'second',
        }),
      ),
    )
    const { queryClient } = renderHashiPickPage()
    await screen.findByRole('button', { name: /히마와리 스시 1 / })
    observer.triggerAllIntersects()
    await screen.findByRole('button', { name: /히마와리 스시 11 / })
    const queryKey = queryClient.getQueryCache().getAll()[0].queryKey
    fireEvent.click(screen.getByRole('button', { name: /히마와리 스시 11 / }))
    queryClient.setQueryData(queryKey, {
      pages: [
        createRestaurantsResult({
          count: 10,
          hasNext: true,
          nextCursor: 'second',
        }),
      ],
      pageParams: [null],
    })
    fireEvent.click(screen.getByRole('button', { name: '목록으로 돌아가기' }))
    await screen.findByRole('button', { name: /히마와리 스시 11 / })
    expect(mockedGetRestaurants).toHaveBeenCalledTimes(2)
  })

  it('restores the saved list even when another visit changed the same-filter cache', async () => {
    mockIntersectionObserver()
    const { queryClient } = renderHashiPickPage()
    await screen.findByRole('button', { name: /히마와리 스시 1 / })
    const queryKey = queryClient.getQueryCache().getAll()[0].queryKey
    fireEvent.click(screen.getByRole('button', { name: /히마와리 스시 1 / }))
    queryClient.setQueryData(queryKey, {
      pages: [createRestaurantsResult({ count: 3, startId: 101 })],
      pageParams: [null],
    })
    fireEvent.click(screen.getByRole('button', { name: '목록으로 돌아가기' }))
    await screen.findByRole('button', { name: /히마와리 스시 1 / })
    expect(
      screen.queryByRole('button', { name: /히마와리 스시 101 / }),
    ).not.toBeInTheDocument()
    expect(mockedGetRestaurants).toHaveBeenCalledTimes(1)
  })

  it('reloads only the first page when applying unchanged filters', async () => {
    const observer = mockIntersectionObserver()
    mockedGetRestaurants.mockImplementation((params) =>
      Promise.resolve(
        params.cursor
          ? createRestaurantsResult({ count: 10, startId: 11 })
          : createRestaurantsResult({
              count: 10,
              hasNext: true,
              nextCursor: 'next',
            }),
      ),
    )
    renderHashiPickPage()
    await screen.findByRole('button', { name: /히마와리 스시 1 / })
    observer.triggerAllIntersects()
    await screen.findByRole('button', { name: /히마와리 스시 11 / })
    fireEvent.click(screen.getByRole('button', { name: '정렬 필터: 기본순' }))
    fireEvent.click(screen.getByRole('button', { name: '적용' }))
    await waitFor(() => expect(mockedGetRestaurants).toHaveBeenCalledTimes(3))
    expect(mockedGetRestaurants).toHaveBeenLastCalledWith({
      genre: 'all',
      size: 10,
      sort: 'basic',
      type: 'hashi-pick',
    })
    await screen.findByRole('button', { name: /히마와리 스시 1 / })
    expect(
      screen.queryByRole('button', { name: /히마와리 스시 11 / }),
    ).not.toBeInTheDocument()
  })

  it('keeps loaded cards after a next-page error and retries only that page', async () => {
    const observer = mockIntersectionObserver()
    mockedGetRestaurants.mockImplementation((params) =>
      params.cursor
        ? Promise.reject(new HttpStatusError(500))
        : Promise.resolve(
            createRestaurantsResult({
              count: 10,
              hasNext: true,
              nextCursor: 'next',
            }),
          ),
    )
    renderHashiPickPage()
    await screen.findByRole('button', { name: /히마와리 스시 1 / })
    observer.triggerAllIntersects()
    await screen.findByText(
      '추가 식당을 불러오지 못했습니다.',
      {},
      { timeout: 5000 },
    )
    expect(
      screen.getByRole('button', { name: /히마와리 스시 1 / }),
    ).toBeInTheDocument()
    mockedGetRestaurants.mockResolvedValue(
      createRestaurantsResult({ count: 2, startId: 11 }),
    )
    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }))
    await screen.findByRole('button', { name: /히마와리 스시 11/ })
    expect(mockedGetRestaurants).toHaveBeenLastCalledWith(
      expect.objectContaining({ cursor: 'next' }),
    )
    expect(
      mockedGetRestaurants.mock.calls.filter(([params]) => !params.cursor),
    ).toHaveLength(1)
  })

  it.each([false, true])(
    'restores filters, pages and scroll after cache removal (storage full: %s)',
    async (storageFull) => {
      if (storageFull) {
        const setItem = Storage.prototype.setItem
        vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (
          this: Storage,
          key,
          value,
        ) {
          if (this === sessionStorage && value.includes('"data"'))
            throw new DOMException('Storage full', 'QuotaExceededError')
          setItem.call(this, key, value)
        })
      }
      const scrollTo = vi.fn()
      vi.stubGlobal('scrollTo', scrollTo)
      vi.stubGlobal('scrollY', 600)
      const observer = mockIntersectionObserver()
      mockedGetRestaurants.mockImplementation((params) =>
        Promise.resolve(
          params.cursor
            ? createRestaurantsResult({ count: 10, startId: 11 })
            : createRestaurantsResult({
                count: 10,
                hasNext: true,
                nextCursor: 'next',
              }),
        ),
      )
      const { queryClient } = renderHashiPickPage()
      await screen.findByRole('button', { name: /히마와리 스시 1 / })
      fireEvent.click(screen.getByRole('button', { name: '정렬 필터: 기본순' }))
      fireEvent.click(screen.getByRole('button', { name: '별점순' }))
      fireEvent.click(screen.getByRole('button', { name: '적용' }))
      await screen.findByRole('button', { name: /히마와리 스시 1 / })
      observer.triggerAllIntersects()
      await screen.findByRole('button', { name: /히마와리 스시 11 / })
      fireEvent.click(screen.getByRole('button', { name: /히마와리 스시 11 / }))
      if (storageFull) {
        const saved = JSON.parse(
          sessionStorage.getItem('hashi:restaurant-list:hashi-pick:default') ??
            'null',
        )
        expect(saved.pageCount).toBe(2)
        expect(saved.data).toBeUndefined()
      }
      queryClient.clear()
      const requestCount = mockedGetRestaurants.mock.calls.length
      fireEvent.click(screen.getByRole('button', { name: '목록으로 돌아가기' }))
      expect(
        screen.getByRole('button', { name: '정렬 필터: 별점순' }),
      ).toBeInTheDocument()
      await screen.findByRole('button', { name: /히마와리 스시 1 / })
      await screen.findByRole('button', { name: /히마와리 스시 11 / })
      await waitFor(() =>
        expect(scrollTo).toHaveBeenCalledWith({
          top: 600,
          left: 0,
          behavior: 'auto',
        }),
      )
      expect(mockedGetRestaurants).toHaveBeenCalledTimes(
        requestCount + (storageFull ? 2 : 0),
      )
    },
  )
  beforeEach(() => {
    mockedGetRestaurants.mockResolvedValue(
      createRestaurantsResult({ count: 3 }),
    )
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
    document.body.style.overflow = ''
    mockedGetRestaurants.mockReset()
    vi.unstubAllGlobals()
    sessionStorage.clear()
  })

  it('keeps selected sort unchanged until apply is pressed', async () => {
    renderHashiPickPage()
    await screen.findByRole('button', { name: /히마와리 스시 1/ })

    fireEvent.click(screen.getByRole('button', { name: '정렬 필터: 기본순' }))
    fireEvent.click(screen.getByRole('button', { name: '인기순' }))
    fireEvent.click(screen.getByRole('button', { name: '닫기' }))

    expect(
      screen.getByRole('button', { name: '정렬 필터: 기본순' }),
    ).toBeInTheDocument()
    expect(mockedGetRestaurants).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: '정렬 필터: 기본순' }))
    fireEvent.click(screen.getByRole('button', { name: '별점순' }))
    fireEvent.click(screen.getByRole('button', { name: '적용' }))

    expect(
      screen.getByRole('button', { name: '정렬 필터: 별점순' }),
    ).toBeInTheDocument()
    await waitFor(() => {
      expect(mockedGetRestaurants).toHaveBeenLastCalledWith({
        genre: 'all',
        size: 10,
        sort: 'rating',
        type: 'hashi-pick',
      })
    })
  })
})
