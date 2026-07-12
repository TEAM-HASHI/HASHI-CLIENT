import '@testing-library/jest-dom/vitest'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, render, screen } from '@testing-library/react'
import { ErrorBoundary } from 'react-error-boundary'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useSearchRestaurantsInfiniteQuery } from '@/pages/search/queries/useSearchRestaurantsInfiniteQuery'

const { mockGetRestaurants } = vi.hoisted(() => ({
  mockGetRestaurants: vi.fn(),
}))

vi.mock('@/pages/search/api/getRestaurants', () => ({
  getRestaurants: mockGetRestaurants,
}))

const SearchQueryProbe = () => {
  const query = useSearchRestaurantsInfiniteQuery({
    category: 'all',
    keyword: '라멘',
    sort: 'default',
  })

  if (query.isError) {
    return <p>local search error</p>
  }

  return <p>{query.status}</p>
}

const SearchQueryParamsProbe = () => {
  useSearchRestaurantsInfiniteQuery({
    category: 'all',
    keyword: '스시',
    sort: 'default',
  })

  return <p>query mounted</p>
}

const SearchQueryFilterParamsProbe = () => {
  useSearchRestaurantsInfiniteQuery({
    category: 'sushiSashimi',
    keyword: '스시',
    sort: 'rating',
  })

  return <p>filter query mounted</p>
}

describe('useSearchRestaurantsInfiniteQuery', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('keeps its error local even when the app default throws query errors', async () => {
    mockGetRestaurants.mockRejectedValue(new Error('search failed'))
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          throwOnError: true,
        },
      },
    })

    render(
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary fallback={<p>query boundary</p>}>
          <SearchQueryProbe />
        </ErrorBoundary>
      </QueryClientProvider>,
    )

    expect(await screen.findByText('local search error')).toBeInTheDocument()
    expect(screen.queryByText('query boundary')).not.toBeInTheDocument()
  })

  it('omits unsupported default sort when requesting restaurants', async () => {
    mockGetRestaurants.mockResolvedValue({
      hasNext: false,
      restaurants: [],
    })
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })

    render(
      <QueryClientProvider client={queryClient}>
        <SearchQueryParamsProbe />
      </QueryClientProvider>,
    )

    await screen.findByText('query mounted')

    expect(mockGetRestaurants).toHaveBeenCalledWith({
      genre: 'all',
      keyword: '스시',
      size: 20,
    })
  })

  it('maps UI filter values to supported restaurant API params', async () => {
    mockGetRestaurants.mockResolvedValue({
      hasNext: false,
      restaurants: [],
    })
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })

    render(
      <QueryClientProvider client={queryClient}>
        <SearchQueryFilterParamsProbe />
      </QueryClientProvider>,
    )

    await screen.findByText('filter query mounted')

    expect(mockGetRestaurants).toHaveBeenCalledWith({
      genre: 'sushi',
      keyword: '스시',
      size: 20,
      sort: 'rating',
    })
  })
})
