import '@testing-library/jest-dom/vitest'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, render, screen } from '@testing-library/react'
import { ErrorBoundary } from 'react-error-boundary'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useSearchRestaurantsQuery } from '@/pages/search/hooks/useSearchRestaurantsQuery'

const { mockSearchRestaurants } = vi.hoisted(() => ({
  mockSearchRestaurants: vi.fn(),
}))

vi.mock('@/pages/search/api/searchRestaurants', () => ({
  searchRestaurants: mockSearchRestaurants,
}))

const SearchQueryProbe = () => {
  const query = useSearchRestaurantsQuery({
    category: 'all',
    keyword: '라멘',
    sort: 'default',
  })

  if (query.isError) {
    return <p>local search error</p>
  }

  return <p>{query.status}</p>
}

describe('useSearchRestaurantsQuery', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('keeps its error local even when the app default throws query errors', async () => {
    mockSearchRestaurants.mockRejectedValue(new Error('search failed'))
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
})
