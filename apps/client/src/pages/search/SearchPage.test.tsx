import '@testing-library/jest-dom/vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import { SearchPage } from '@/pages/search/SearchPage'
import type { SearchRestaurant } from '@/pages/search/types'
import { mockIntersectionObserver } from '@/test/mockIntersectionObserver'

const { mockGetRestaurants, mockGetSearchKeywordRecommendations } = vi.hoisted(
  () => ({
    mockGetRestaurants: vi.fn(),
    mockGetSearchKeywordRecommendations: vi.fn(),
  }),
)

vi.mock('@/features/restaurantList/api/getRestaurants', () => ({
  getRestaurants: mockGetRestaurants,
}))

vi.mock('@/pages/search/api/getSearchKeywordRecommendations', () => ({
  getSearchKeywordRecommendations: mockGetSearchKeywordRecommendations,
}))

const searchRestaurantFixtures: SearchRestaurant[] = [
  {
    businessHours: '6/19 (금) 10:00~22:00',
    category: 'etc',
    id: 'akitori-musashi-1',
    keywords: ['아끼소바', '야끼소바', '오코노미야키'],
    name: '아키토리 무사시 제일은 여기까지 그러니 최대길이 이 정도로까지',
    popularity: 95,
    rating: 3.8,
    tag: '아끼소바',
  },
  {
    businessHours: '6/19 (금) 11:30~22:30',
    category: 'teppanGrill',
    id: 'yakisoba-kitchen-1',
    keywords: ['아끼소바', '야끼소바', '철판'],
    name: '긴자 야끼소바 키친',
    popularity: 90,
    rating: 4.6,
    tag: '아끼소바',
  },
  {
    businessHours: '6/19 (금) 12:00~22:00',
    category: 'sushiSashimi',
    id: 'sushi-haru-1',
    imageUrl: 'https://example.com/sushi-haru.jpg',
    keywords: ['스시', '사시미'],
    name: '스시 하루',
    popularity: 91,
    rating: 4.7,
    tag: '스시',
  },
]

const convertSearchRestaurantFixtureToSummary = (
  restaurant: SearchRestaurant,
) => {
  const fixtureIndex = searchRestaurantFixtures.findIndex(
    ({ id }) => id === restaurant.id,
  )

  return {
    restaurantId: fixtureIndex + 1,
    name: restaurant.name,
    rating: restaurant.rating,
    genre: restaurant.category,
    thumbnailUrl: restaurant.imageUrl,
    hashtags: [restaurant.tag],
    todayBusinessHour: {
      date: '2026-06-19',
      dayOfWeek: 'FRIDAY',
      openTime: restaurant.businessHours.match(/\d{2}:\d{2}/)?.[0],
      closeTime: restaurant.businessHours.match(/~(\d{2}:\d{2})/)?.[1],
      closed: false,
    },
  }
}

const renderSearchPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <SearchPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

const LocationState = () => {
  const location = useLocation()

  return <div data-testid="location-state">{location.search}</div>
}

const renderSearchPageWithRoutes = (initialEntry: string = ROUTES.search) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route
            path={ROUTES.search}
            element={
              <>
                <SearchPage />
                <LocationState />
              </>
            }
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

const renderSearchPageWithHistory = (
  initialEntries: string[],
  initialIndex: number,
) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries} initialIndex={initialIndex}>
        <SearchPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('SearchPage', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
    window.localStorage.clear()
    document.body.style.overflow = ''
    document.body.style.position = ''
    document.body.style.top = ''
    document.body.style.width = ''
    document.documentElement.style.overflow = ''
    vi.unstubAllGlobals()
  })

  beforeEach(() => {
    mockGetSearchKeywordRecommendations.mockResolvedValue(['아끼소바'])
    mockGetRestaurants.mockImplementation(({ genre, keyword, sort }) => {
      const normalizedKeyword = keyword.trim().toLowerCase()
      const restaurants = searchRestaurantFixtures
        .filter((restaurant) => {
          const matchesKeyword = [
            restaurant.name,
            restaurant.tag,
            ...restaurant.keywords,
          ].some((value) => value.toLowerCase().includes(normalizedKeyword))

          return (
            matchesKeyword && (genre === 'all' || restaurant.category === genre)
          )
        })
        .sort((firstRestaurant, secondRestaurant) => {
          if (sort === 'popular') {
            return secondRestaurant.popularity - firstRestaurant.popularity
          }

          if (sort === 'rating') {
            return secondRestaurant.rating - firstRestaurant.rating
          }

          return 0
        })

      return Promise.resolve({
        hasNext: false,
        restaurants: restaurants.map(convertSearchRestaurantFixtureToSummary),
      })
    })
  })

  it('clears the draft and applied conditions without searching, then uses default filters for the next search', async () => {
    const user = userEvent.setup()
    renderSearchPageWithRoutes(
      `${ROUTES.search}?keyword=スシ&sort=rating&category=sushiSashimi`,
    )
    await waitFor(() => expect(mockGetRestaurants).toHaveBeenCalled())
    const input = screen.getByRole('searchbox', { name: '식당 또는 메뉴 검색' })
    await user.clear(input)
    await user.type(input, '미제출 검색어')
    const requestCount = mockGetRestaurants.mock.calls.length
    await user.click(screen.getByRole('button', { name: '검색어 지우기' }))
    expect(input).toHaveValue('')
    expect(screen.getByTestId('location-state')).toHaveTextContent(/^$/)
    expect(
      screen.queryByRole('button', { name: '별점순' }),
    ).not.toBeInTheDocument()
    expect(
      await screen.findByRole('region', { name: '추천 검색어' }),
    ).toBeInTheDocument()
    expect(mockGetRestaurants).toHaveBeenCalledTimes(requestCount)

    await user.type(input, '스시')
    await user.keyboard('{Enter}')
    await waitFor(() => {
      expect(mockGetRestaurants).toHaveBeenLastCalledWith({
        genre: 'all',
        keyword: '스시',
        size: 10,
      })
    })
  })

  it('searches with a recommended keyword and stores it as recent keyword', async () => {
    const user = userEvent.setup()

    renderSearchPage()

    await user.click(await screen.findByRole('button', { name: '아끼소바' }))

    await waitFor(() => {
      expect(mockGetRestaurants).toHaveBeenCalledWith({
        genre: 'all',
        keyword: '아끼소바',
        size: 10,
      })
    })
    expect(window.localStorage.getItem('hashi:search:recent-keywords')).toBe(
      JSON.stringify(['아끼소바']),
    )
    expect(mockGetSearchKeywordRecommendations).toHaveBeenCalledTimes(1)
  })

  it('stores submitted search state in the URL and restores results from the URL', async () => {
    const user = userEvent.setup()

    renderSearchPageWithRoutes()

    await user.type(
      screen.getByRole('searchbox', { name: '식당 또는 메뉴 검색' }),
      '스시',
    )
    await user.keyboard('{Enter}')

    await waitFor(() => {
      expect(screen.getByTestId('location-state')).toHaveTextContent(
        '?keyword=%EC%8A%A4%EC%8B%9C',
      )
    })
    expect(await screen.findByText('스시 하루')).toBeInTheDocument()

    cleanup()
    vi.clearAllMocks()
    renderSearchPageWithRoutes(`${ROUTES.search}?keyword=스시`)

    expect(
      screen.getByRole('searchbox', { name: '식당 또는 메뉴 검색' }),
    ).toHaveValue('스시')
    expect(await screen.findByText('스시 하루')).toBeInTheDocument()
    expect(mockGetSearchKeywordRecommendations).not.toHaveBeenCalled()
  })

  it('synchronizes the search input when history changes between search URLs', async () => {
    const user = userEvent.setup()

    renderSearchPageWithHistory(
      [
        `${ROUTES.search}?keyword=%EC%8A%A4%EC%8B%9C`,
        `${ROUTES.search}?keyword=%EC%95%84%EB%81%BC%EC%86%8C%EB%B0%94`,
      ],
      1,
    )

    expect(
      screen.getByRole('searchbox', { name: '식당 또는 메뉴 검색' }),
    ).toHaveValue('아끼소바')
    expect(
      await screen.findByText(
        '아키토리 무사시 제일은 여기까지 그러니 최대길이 이 정도로까지',
      ),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '뒤로가기' }))

    await waitFor(() => {
      expect(
        screen.getByRole('searchbox', { name: '식당 또는 메뉴 검색' }),
      ).toHaveValue('스시')
    })
    expect(await screen.findByText('스시 하루')).toBeInTheDocument()
  })

  it('keeps search usable when recent keyword storage is unavailable', async () => {
    const user = userEvent.setup()
    const getItemSpy = vi
      .spyOn(Storage.prototype, 'getItem')
      .mockImplementation(() => {
        throw new Error('storage getItem unavailable')
      })
    const setItemSpy = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new Error('storage setItem unavailable')
      })

    renderSearchPage()

    await user.click(await screen.findByRole('button', { name: '아끼소바' }))

    expect(
      screen.getByRole('searchbox', { name: '식당 또는 메뉴 검색' }),
    ).toHaveValue('아끼소바')
    expect(
      await screen.findByText(
        '아키토리 무사시 제일은 여기까지 그러니 최대길이 이 정도로까지',
      ),
    ).toBeInTheDocument()

    getItemSpy.mockRestore()
    setItemSpy.mockRestore()
  })

  it('refetches restaurants with the applied sort filter', async () => {
    const user = userEvent.setup()

    renderSearchPage()

    await user.type(
      screen.getByRole('searchbox', { name: '식당 또는 메뉴 검색' }),
      '스시',
    )
    await user.keyboard('{Enter}')

    await waitFor(() => {
      expect(mockGetRestaurants).toHaveBeenCalledWith({
        genre: 'all',
        keyword: '스시',
        size: 10,
      })
    })

    await user.click(screen.getByRole('button', { name: '기본순' }))
    await user.click(screen.getByRole('button', { name: '별점순' }))
    await user.click(screen.getByRole('button', { name: '적용' }))

    await waitFor(() => {
      expect(mockGetRestaurants).toHaveBeenCalledWith({
        genre: 'all',
        keyword: '스시',
        size: 10,
        sort: 'rating',
      })
    })
  })

  it('refetches restaurants with the applied food category filter', async () => {
    const user = userEvent.setup()

    renderSearchPage()

    await user.type(
      screen.getByRole('searchbox', { name: '식당 또는 메뉴 검색' }),
      '스시',
    )
    await user.keyboard('{Enter}')

    await user.click(screen.getByRole('button', { name: '음식 장르 선택' }))
    await user.click(screen.getByRole('button', { name: '스시/사시미류' }))
    await user.click(screen.getByRole('button', { name: '적용' }))

    await waitFor(() => {
      expect(mockGetRestaurants).toHaveBeenCalledWith({
        genre: 'sushi',
        keyword: '스시',
        size: 10,
      })
    })
  })

  it('does not request the same next restaurant page twice when the sentinel intersects repeatedly in one render cycle', async () => {
    const { IntersectionObserverMock, triggerIntersect } =
      mockIntersectionObserver()
    const user = userEvent.setup()

    mockGetRestaurants
      .mockResolvedValueOnce({
        hasNext: true,
        nextCursor: 'next-search-cursor',
        restaurants: [
          convertSearchRestaurantFixtureToSummary(searchRestaurantFixtures[0]),
        ],
      })
      .mockImplementation(
        () =>
          new Promise((resolve) => {
            window.setTimeout(() => {
              resolve({
                hasNext: false,
                restaurants: [
                  convertSearchRestaurantFixtureToSummary(
                    searchRestaurantFixtures[1],
                  ),
                ],
              })
            }, 10)
          }),
      )

    renderSearchPage()

    await user.type(
      screen.getByRole('searchbox', { name: '식당 또는 메뉴 검색' }),
      '아끼소바',
    )
    await user.keyboard('{Enter}')

    expect(
      await screen.findByText(searchRestaurantFixtures[0].name),
    ).toBeInTheDocument()
    await waitFor(() => {
      expect(IntersectionObserverMock).toHaveBeenCalled()
    })

    triggerIntersect()
    triggerIntersect()

    await waitFor(() => {
      expect(mockGetRestaurants).toHaveBeenCalledTimes(2)
    })
    expect(mockGetRestaurants).toHaveBeenNthCalledWith(2, {
      cursor: 'next-search-cursor',
      genre: 'all',
      keyword: '아끼소바',
      size: 10,
    })
  })
})
