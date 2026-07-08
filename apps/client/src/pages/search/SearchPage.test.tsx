import '@testing-library/jest-dom/vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import { SearchPage } from '@/pages/search/SearchPage'

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
    window.localStorage.clear()
  })

  it('shows recent and recommended keywords before searching', () => {
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
    expect(screen.getByRole('button', { name: '뒤로가기' })).toBeInTheDocument()
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
      within(recommendedSection).getByRole('button', { name: '아끼소바' }),
    ).toBeInTheDocument()
    expect(screen.queryByText('기본순')).not.toBeInTheDocument()
  })

  it('searches with a recommended keyword and stores it as recent keyword', async () => {
    const user = userEvent.setup()

    renderSearchPage()

    await user.click(screen.getByRole('button', { name: '아끼소바' }))

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
    expect(screen.getByRole('list').parentElement).toHaveClass('pt-[83px]')
    expect(
      screen.getByRole('button', { name: '기본순' }).parentElement,
    ).not.toHaveClass('app-mobile-fixed-top')
    expect(
      screen.getByRole('button', { name: '기본순' }).parentElement,
    ).not.toHaveClass('mt-[9px]')
    expect(screen.getAllByRole('listitem')).toHaveLength(10)
    expect(window.localStorage.getItem('hashi:search:recent-keywords')).toBe(
      JSON.stringify(['아끼소바']),
    )
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

    await user.click(screen.getByRole('button', { name: '아끼소바' }))

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

    await user.click(screen.getByRole('button', { name: '아끼소바' }))
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
})
