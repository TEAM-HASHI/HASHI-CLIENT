import '@testing-library/jest-dom/vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

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
    businessHours: '6/19 (금) 10:30~21:30',
    category: 'etc',
    id: 'osaka-table-1',
    keywords: ['아끼소바', '오코노미야키', '타코야키'],
    name: '오사카 테이블',
    popularity: 84,
    rating: 4.2,
    tag: '아끼소바',
  },
  {
    businessHours: '6/19 (금) 12:00~23:00',
    category: 'noodle',
    id: 'musashi-noodle-bar-1',
    keywords: ['아끼소바', '면류', '야끼우동'],
    name: '무사시 누들바',
    popularity: 79,
    rating: 4,
    tag: '아끼소바',
  },
  {
    businessHours: '6/19 (금) 10:30~22:00',
    category: 'teppanGrill',
    id: 'tokyo-yakisoba-terrace-1',
    keywords: ['아끼소바', '야끼소바', '철판'],
    name: '도쿄 야끼소바 테라스',
    popularity: 82,
    rating: 4.3,
    tag: '아끼소바',
  },
  {
    businessHours: '6/19 (금) 11:00~22:30',
    category: 'etc',
    id: 'shibuya-sauce-table-1',
    keywords: ['아끼소바', '오코노미야키', '소스'],
    name: '시부야 소스 테이블',
    popularity: 76,
    rating: 4.1,
    tag: '아끼소바',
  },
  {
    businessHours: '6/19 (금) 12:00~23:00',
    category: 'teppanGrill',
    id: 'ginza-teppan-house-1',
    keywords: ['아끼소바', '야끼소바', '철판요리'],
    name: '긴자 철판 하우스',
    popularity: 86,
    rating: 4.5,
    tag: '아끼소바',
  },
  {
    businessHours: '6/19 (금) 10:00~21:00',
    category: 'noodle',
    id: 'ueno-noodle-stand-1',
    keywords: ['아끼소바', '면류', '야끼우동'],
    name: '우에노 누들 스탠드',
    popularity: 72,
    rating: 3.9,
    tag: '아끼소바',
  },
  {
    businessHours: '6/19 (금) 11:30~22:00',
    category: 'etc',
    id: 'asakusa-yatai-kitchen-1',
    keywords: ['아끼소바', '야끼소바', '타코야키'],
    name: '아사쿠사 야타이 키친',
    popularity: 80,
    rating: 4.2,
    tag: '아끼소바',
  },
  {
    businessHours: '6/19 (금) 12:00~22:30',
    category: 'teppanGrill',
    id: 'nakameguro-grill-1',
    keywords: ['아끼소바', '철판', '야끼소바'],
    name: '나카메구로 그릴',
    popularity: 83,
    rating: 4.4,
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

  it('shows recent and recommended keywords before searching', async () => {
    window.localStorage.setItem(
      'hashi:search:recent-keywords',
      JSON.stringify(['라멘']),
    )

    renderSearchPage()

    expect(
      screen.getByRole('searchbox', { name: '식당 또는 메뉴 검색' }),
    ).toHaveAttribute('placeholder', '식당 혹은 메뉴를 검색해보세요')
    expect(screen.getByRole('search').parentElement).toHaveClass(
      'app-mobile-fixed-top',
      'z-fixed',
      'bg-white',
    )
    expect(screen.getByRole('search')).toHaveClass('pb-[9px]')
    expect(screen.getByRole('button', { name: '뒤로가기' })).toHaveClass(
      'size-11',
    )
    const recentSection = screen.getByRole('region', { name: '최근 검색어' })
    const recommendedSection = screen.getByRole('region', {
      name: '추천 검색어',
    })

    expect(recentSection).toBeInTheDocument()
    expect(
      within(recentSection).getByRole('button', { name: '라멘' }),
    ).toBeInTheDocument()
    expect(recommendedSection).toBeInTheDocument()
    expect(
      await within(recommendedSection).findByRole('button', {
        name: '아끼소바',
      }),
    ).toBeInTheDocument()
    expect(screen.queryByText('기본순')).not.toBeInTheDocument()
  })

  it('searches with a recommended keyword and stores it as recent keyword', async () => {
    const user = userEvent.setup()

    renderSearchPage()

    await user.click(await screen.findByRole('button', { name: '아끼소바' }))

    expect(
      screen.getByRole('searchbox', { name: '식당 또는 메뉴 검색' }),
    ).toHaveValue('아끼소바')
    expect(screen.getByRole('button', { name: '기본순' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: '음식 장르 선택' }),
    ).toBeInTheDocument()
    expect(
      await screen.findByText(
        '아키토리 무사시 제일은 여기까지 그러니 최대길이 이 정도로까지',
      ),
    ).toBeInTheDocument()
    expect(screen.getByRole('list').parentElement).toHaveClass('pt-[122px]')
    expect(
      screen.getByRole('button', { name: '기본순' }).parentElement
        ?.parentElement,
    ).toHaveClass('app-mobile-fixed-top', 'z-fixed', 'bg-white')
    expect(screen.getAllByRole('listitem')).toHaveLength(10)
    expect(
      screen.getAllByRole('listitem')[0].querySelector('a')?.firstChild,
    ).toHaveClass('bg-warm-gray-100')
    expect(window.localStorage.getItem('hashi:search:recent-keywords')).toBe(
      JSON.stringify(['아끼소바']),
    )
    expect(mockGetSearchKeywordRecommendations).toHaveBeenCalledTimes(1)
  })

  it('does not request recommended keywords after search results are shown', async () => {
    const user = userEvent.setup()

    renderSearchPage()

    await user.type(
      screen.getByRole('searchbox', { name: '식당 또는 메뉴 검색' }),
      '아끼소바',
    )
    await user.keyboard('{Enter}')

    expect(
      await screen.findByText(
        '아키토리 무사시 제일은 여기까지 그러니 최대길이 이 정도로까지',
      ),
    ).toBeInTheDocument()
    expect(mockGetSearchKeywordRecommendations).toHaveBeenCalledTimes(1)
  })

  it('shows DefaultImage when a search result image request fails', async () => {
    const user = userEvent.setup()

    renderSearchPage()

    await user.type(
      screen.getByRole('searchbox', { name: '식당 또는 메뉴 검색' }),
      '스시',
    )
    await user.keyboard('{Enter}')

    const image = await screen.findByRole('presentation')
    fireEvent.error(image)

    expect(image).not.toBeInTheDocument()
    expect(
      screen.getAllByRole('listitem')[0].querySelector('.bg-warm-gray-100'),
    ).toBeInTheDocument()
  })

  it('locks background scroll while a filter bottom sheet is open', async () => {
    const user = userEvent.setup()

    renderSearchPage()

    await user.click(await screen.findByRole('button', { name: '아끼소바' }))
    await screen.findByText(
      '아키토리 무사시 제일은 여기까지 그러니 최대길이 이 정도로까지',
    )

    await user.click(screen.getByRole('button', { name: '기본순' }))

    expect(document.body.style.overflow).toBe('hidden')
    expect(document.body.style.position).toBe('fixed')
    expect(document.documentElement.style.overflow).toBe('hidden')

    await user.click(screen.getByRole('button', { name: '적용' }))

    await waitFor(() => {
      expect(document.body.style.overflow).toBe('')
      expect(document.body.style.position).toBe('')
      expect(document.documentElement.style.overflow).toBe('')
    })
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

  it('shows empty state when submitted keyword has no result', async () => {
    const user = userEvent.setup()

    renderSearchPage()

    await user.type(
      screen.getByRole('searchbox', { name: '식당 또는 메뉴 검색' }),
      '없는메뉴',
    )
    await user.keyboard('{Enter}')

    await waitFor(() => {
      expect(screen.getByText('검색된 식당이 없습니다.')).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: '기본순' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: '음식 장르 선택' }),
    ).toBeInTheDocument()
  })

  it('navigates to home when back button is clicked on a directly opened search page', async () => {
    const user = userEvent.setup()
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[ROUTES.search]}>
          <Routes>
            <Route path={ROUTES.search} element={<SearchPage />} />
            <Route path={ROUTES.home} element={<div>홈 화면</div>} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    )

    await user.click(screen.getByRole('button', { name: '뒤로가기' }))

    expect(screen.getByText('홈 화면')).toBeInTheDocument()
  })

  it('resets sort filter to default and closes the bottom sheet', async () => {
    const user = userEvent.setup()

    renderSearchPage()

    await user.click(await screen.findByRole('button', { name: '아끼소바' }))
    await screen.findByText(
      '아키토리 무사시 제일은 여기까지 그러니 최대길이 이 정도로까지',
    )

    await user.click(screen.getByRole('button', { name: '기본순' }))
    await user.click(screen.getByRole('button', { name: '별점순' }))
    await user.click(screen.getByRole('button', { name: '적용' }))

    expect(
      screen.getAllByRole('button', { name: '별점순' })[0],
    ).toBeInTheDocument()

    await user.click(screen.getAllByRole('button', { name: '별점순' })[0])
    await user.click(screen.getByRole('button', { name: '초기화' }))

    expect(
      screen.getAllByRole('button', { name: '기본순' })[0],
    ).toBeInTheDocument()
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

  it('fetches the next restaurant page when the bottom sentinel enters the viewport', async () => {
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
      .mockResolvedValueOnce({
        hasNext: false,
        restaurants: [
          convertSearchRestaurantFixtureToSummary(searchRestaurantFixtures[1]),
        ],
      })

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

    await waitFor(() => {
      expect(mockGetRestaurants).toHaveBeenCalledWith({
        cursor: 'next-search-cursor',
        genre: 'all',
        keyword: '아끼소바',
        size: 10,
      })
    })
    expect(
      await screen.findByText(searchRestaurantFixtures[1].name),
    ).toBeInTheDocument()
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
